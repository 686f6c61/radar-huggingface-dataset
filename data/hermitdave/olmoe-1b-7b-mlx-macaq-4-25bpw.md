# hermitdave/OLMoE-1B-7B-MLX-MACaQ-4.25bpw

## Resumen

OLMoE-1B-7B-MLX-MACaQ-4.25bpw es una cuantizacion de precision mixta de 4 bits del modelo OLMoE-1B-7B-0125 de AllenAI, publicada por el usuario hermitdave. No se trata de un modelo nuevo ni de un fine-tune, sino de un checkpoint cuantizado con una tecnica propietaria denominada MACaQ (weight-only refinement) que reoptimiza los codigos E2M1 de la cuantizacion MXFP4 nativa de MLX contra el modelo profesor en BF16. El resultado es un artefacto que se carga con `mlx-lm` estandar, sin kernels personalizados ni `trust_remote_code`.

El modelo base OLMoE es un transformer disperso de tipo Mixture-of-Experts con 6.919 millones de parametros totales y aproximadamente 1.000 millones activos por token. Cuenta con 16 capas, 64 expertos con enrutamiento top-8, tamano oculto de 2048, tamano intermedio de 1024 y un vocabulario de 50.304 tokens. La arquitectura es `olmoe` (`OlmoeForCausalLM`).

La relevancia de esta publicacion es doble: por un lado, demuestra que es posible reducir la perplexity de una cuantizacion MXFP4 estandar sin cambiar el formato ni el runtime, lo que se traduce en mejor calidad al mismo coste de inferencia; por otro, sirve como caso de validacion del metodo MACaQ aplicado a arquitecturas MoE, donde cada experto requiere su propia matriz Hessiana calculada a partir de los tokens que realmente se enrutan hacia el.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `olmoe` (`OlmoeForCausalLM`), transformer MoE |
| Parametros totales | 6.919.161.856 (7B) |
| Parametros activos | ~1B (top-8 de 64 expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (E2M1 + escalas E8M0), group_size=32, W4A16, 4.25 bpw |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX packed (`mxfp4`), safetensors |

## Arquitectura y entrenamiento

El modelo base OLMoE-1B-7B-0125 es un transformer de tipo Mixture-of-Experts con 16 capas, 64 expertos y enrutamiento top-8. Cada proyeccion MoE se empaqueta en MLX como un unico `QuantizedSwitchLinear` que contiene un tensor apilado de forma `(num_experts, out, in)`. El modelo cuenta con 81 proyecciones densas y 48 proyecciones switch cuantizadas, lo que suma 129 capas cuantizadas en total.

El proceso de cuantizacion MACaQ parte de la cuantizacion MXFP4 nativa de MLX (round-to-nearest) y aplica un refinamiento en dos fases. Primero, se captura la matriz Hessiana de activaciones `H = Σ xᵀx` a partir del profesor en BF16 sobre 200.000 tokens de entrenamiento de WikiText-2 mediante forward hooks. En el caso de los expertos, un mecanismo `SwitchCatcher` dispersa cada token en la ranura del experto al que fue enrutado, de modo que `H[e]` refleja unicamente los tokens que ese experto vio realmente. Despues, se reajustan los exponentes de bloque sobre los offsets {−1, 0, +1} bajo la metrica Hessiana diagonal y se aplica Flip-Refinement: descenso de coordenadas voraz sobre los codigos E2M1 con la ganancia en forma cerrada `2Δg − Δ²H_jj`, manteniendo los exponentes fijos, con 256 barridos y parada temprana. Finalmente, se reempaqueta todo en el layout mxfp4 nativo de MLX.

No se modifica ninguna capa vecina, normalizacion, enrutamiento ni rama residual, por lo que el layout del fichero, la configuracion y el runtime permanecen inalterados. El checkpoint resultante ocupa 3,43 GiB frente a los 12,5 GiB del BF16, una compresion de 3,6x. No se dispone de informacion sobre el dataset de entrenamiento original de OLMoE ni sobre si hubo RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva con `mlx-lm`, tanto por API Python como por CLI.
- Razonamiento y generacion de codigo heredados del modelo base OLMoE-1B-7B-0125.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Inferencia con pesos a 4 bits y activaciones en BF16 (W4A16), con decodificacion aproximadamente 2,5x mas rapida que BF16 en Apple Silicon.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta empaquetado para MLX y se carga con `mlx-lm` estandar, por lo que es adecuado para ejecutar generacion de texto en Macs con memoria unificada. Con 4,46 GB de memoria pico a contexto de ~1K, cabe en equipos con 16 GB o mas.
- Prototipado rapido de aplicaciones de texto: al no requerir `trust_remote_code` ni kernels personalizados, se puede integrar en scripts de Python con dos lineas de codigo, lo que acelera la experimentacion.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia reproducible del metodo MACaQ aplicado a MoE, con script de reproduccion incluido (`macaq_refine.py`) y metricas de fidelidad publicadas.
- Despliegue en entornos con memoria limitada: la reduccion de 12,5 GiB a 3,43 GiB permite ejecutar un modelo de 7B totales en hardware donde el BF16 no cabria, manteniendo una perplexity de 8,9950 frente a 8,4512 del BF16.
- Generacion de texto a gran velocidad en local: con 272,6 tokens por segundo en decodificacion sobre M3 Max a contexto ~1K, es adecuado para aplicaciones interactivas que requieran baja latencia.
- Fine-tuning o destilacion sobre el checkpoint cuantizado: aunque el modelo no es un fine-tune, el formato MLX estandar permite cargarlo en flujos de trabajo de MLX que operen con pesos cuantizados.
- Comparacion de calidad entre metodos de cuantizacion: las metricas de perplexity publicadas (BF16, mxfp4 RTN y MACaQ) permiten evaluar el impacto de distintas estrategias de compresion sobre el mismo modelo base.

## Benchmarks y rendimiento

Fidelidad medida sobre WikiText-2 test, 130.816 tokens, longitud de secuencia 512, mismos datos de evaluacion para todas las filas:

| Modelo | Perplexity ↓ | Diferencia vs BF16 |
|---|---:|---:|
| BF16 | 8,4512 ± 0,0610 | — |
| mxfp4 RTN (MLX por defecto) | 9,5579 ± 0,0699 | +1,107 |
| **Este modelo (MACaQ)** | **8,9950 ± 0,0651** | **+0,544** |

El checkpoint MACaQ reduce la perplexity un 5,8% respecto a la cuantizacion mxfp4 estandar de MLX y cierra el 51% de la brecha entre BF16 y mxfp4. Ademas, se reporta una reduccion del 37,1% en el objetivo de reconstruccion Hessiana de activaciones a traves de las 129 capas cuantizadas.

Rendimiento medido en un M3 Max (64 GB de memoria unificada) con prompts de prosa natural de WikiText-2 y 256 tokens generados:

| Contexto | Modelo | Prompt TPS | Decode TPS | Memoria pico |
|---|---|---:|---:|---:|
| ~1K | BF16 | 3244 | 109,6 | 14,47 GB |
| ~1K | mxfp4 RTN | 2479 | 276,9 | 4,46 GB |
| ~1K | **Este modelo** | 3416 | **272,6** | **4,46 GB** |
| ~8K | BF16 | 3814 | 89,3 | 15,37 GB |
| ~8K | mxfp4 RTN | 3607 | 153,2 | 5,29 GB |
| ~8K | **Este modelo** | 3602 | **152,0** | **5,29 GB** |

La decodificacion es 2,5x mas rapida que BF16 y la memoria pico es 3,2x menor. El checkpoint refinado esta dentro del ruido de ejecucion respecto al mxfp4 estandar, ya que el refinamiento solo cambia los valores de los codigos, no el formato ni el runtime.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 4,46 GB de memoria pico a contexto ~1K; 5,29 GB a contexto ~8K (medido en M3 Max con memoria unificada).
- GPU recomendadas: Apple Silicon con memoria unificada (medido en M3 Max de 64 GB). El formato MLX esta disenado para Apple Silicon; no se dispone de datos para GPUs NVIDIA o AMD.
- Cabe en consumer GPU: si, en equipos Apple Silicon con 16 GB o mas de memoria unificada, segun los datos de memoria pico publicados.
- Opciones de despliegue: `mlx-lm` (libreria y CLI `mlx_lm.generate`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: 272,6 tokens/s en decodificacion y 3416 tokens/s en prompt a contexto ~1K sobre M3 Max; 152,0 tokens/s en decodificacion a contexto ~8K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplexity (WikiText-2) | Licencia | Formato |
|---|---|---|---|---|---|
| **OLMoE-1B-7B-MLX-MACaQ-4.25bpw** | 7B totales, ~1B activos | no disponible | 8,9950 | Apache 2.0 | MLX mxfp4 |
| OLMoE-1B-7B mxfp4 RTN (MLX) | 7B totales, ~1B activos | no disponible | 9,5579 | Apache 2.0 | MLX mxfp4 |
| OLMoE-1B-7B BF16 | 7B totales, ~1B activos | no disponible | 8,4512 | Apache 2.0 | safetensors BF16 |

La comparativa se limita a las variantes del mismo modelo base publicadas en la model card. No se dispone de datos de benchmarks frente a otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un fine-tune: es compresion con perdida, y la perplexity permanece por encima del BF16 (8,9950 frente a 8,4512).
- Sin rotacion de Hadamard: el termino de ablacion mas importante del paper no esta disponible porque requiere una transformacion de activaciones en linea que el matmul cuantizado de MLX no expone. Esta es la variante weight-only.
- Solo W4A16: el kernel W4A4 `qqmm` de MLX solo es mas rapido que BF16 con batch ≤ 4 en Apple Silicon, por lo que el checkpoint se distribuye como weight-only.
- Las Hessianas MoE requieren `--group-size 1`: con 64 expertos y `in=2048`, cada proyeccion consume ~1,1 GB, lo que limita el agrupamiento multi-capa.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredan los del modelo base OLMoE-1B-7B-0125.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia: Apache 2.0, permite uso comercial con las obligaciones habituales de atribucion.
- Para produccion: el checkpoint esta pensado para MLX en Apple Silicon; no se garantiza su funcionamiento en otros runtimes sin conversion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hermitdave/OLMoE-1B-7B-MLX-MACaQ-4.25bpw
- Modelo base: https://huggingface.co/allenai/OLMoE-1B-7B-0125
- Paper de referencia (arxiv:2611.10649): no disponible como enlace directo en la informacion proporcionada
- Repositorio `mlx-lm`: no disponible como enlace directo en la informacion proporcionada
- Script de reproduccion `macaq_refine.py`: no disponible como enlace directo en la informacion proporcionada

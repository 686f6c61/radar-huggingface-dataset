# hermitdave/LFM3-1.7B-MLX-MACaQ-4.25bpw

## Resumen

LFM3-1.7B-MLX-MACaQ-4.25bpw es una cuantizacion refinada del modelo LiquidAI/LFM3-1.7B, publicada por el usuario hermitdave. No se trata de un modelo nuevo ni de un fine-tune, sino de una compresion con perdida que reoptimiza los codigos de cuantizacion del checkpoint original para reducir el dano en perplexidad respecto a la cuantizacion MXFP4 estandar de MLX. El resultado se empaqueta en el formato nativo de MLX y se carga con `mlx-lm` sin necesidad de codigo personalizado ni `trust_remote_code`.

El modelo base LFM3-1.7B es un transformer hibrido de LiquidAI con 24 capas que combinan convolucion, atencion deslizante y atencion completa, 2048 dimensiones ocultas, 7680 de dimension intermedia y un vocabulario de 128.000 tokens. Esta variante cuantizada mantiene 1.728.801.536 parametros totales y reduce el peso del repositorio a unos 876 MiB (0.9 GB), es decir, una compresion de 3.8x respecto a los 3.22 GiB del BF16.

La relevancia de esta ficha radica en que demuestra una mejora medible de la cuantizacion de 4 bits sobre Apple Silicon: 22,1% menos perplexidad que el MXFP4 estandar de MLX y una decodificacion entre 2,1 y 2,6 veces mas rapida que BF16, con el pico de memoria aproximadamente a la mitad. Esta pensada para inferencia local en hardware Apple con memoria unificada, no para servidores GPU convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lfm3` (`Lfm3ForCausalLM`), transformer hibrido conv / sliding attention / full attention, 24 capas |
| Parametros totales | 1.728.801.536 (1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | MXFP4 weight-only (W4A16): codigos E2M1 + escalas E8M0, group_size=32, 4.25 bpw medios |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLX packed (`mxfp4`), safetensors |
| Dimension oculta | 2048 |
| Dimension intermedia | 7680 |
| Vocabulario | 128.000 tokens |
| Tamano del repo | 0,9 GB (876 MiB empaquetado) |
| Libreria | `mlx-lm` |
| Codigo personalizado | no requerido |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion, no un entrenamiento nuevo. Parte de LiquidAI/LFM3-1.7B, un transformer hibrido de 24 capas en el que se alternan capas convolucionales, de atencion deslizante y de atencion completa, con 2048 dimensiones ocultas y 7680 intermedias. Sobre ese modelo se aplica la estrategia MACaQ-R en modo weight-only: se desempaquetan los nibbles E2M1 y las escalas de bloque E8M0 del MXFP4 nativo de MLX, se captura la Hessiana de activaciones `H = Σ xᵀx` del profesor BF16 sobre 200.000 tokens de entrenamiento de WikiText-2 mediante hooks de forward, se reajustan los exponentes de bloque sobre los desplazamientos {−1, 0, +1} bajo la metrica diagonal de la Hessiana, se aplica Flip-Refinement (descenso de coordenadas voraz sobre los codigos E2M1 con la ganancia en forma cerrada `2Δg − Δ²H_jj`, 256 barridos con parada temprana) y se reempaqueta en el layout `mxfp4` nativo de MLX.

No se modifican capas vecinas, normalizaciones ni ramas residuales, de modo que el layout del fichero, la configuracion y el runtime permanecen intactos. El resultado es un modelo cuantizado MLX estandar. La ablacion publicada muestra que el ajuste de 256 flips (el enviado) alcanza 35,47 de perplexidad, frente a 36,14 con 64 flips y 35,38 con 512. El aumento de calibracion a 500K o 1M tokens no mejora el resultado (35,60 y 35,41 respectivamente), y el parametro de ridge λ=0,5 apenas cambia la cifra (35,48) mientras que λ=2,0 la degrada a 36,27. No se dispone de informacion sobre el dataset de preentrenamiento, el uso de RLHF/DPO ni la composicion de datos del modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno: el checkpoint conserva la pipeline `text-generation` y la condicion `conversational` del modelo base.
- Razonamiento y codigo: capacidades heredadas de LFM3-1.7B; no se documentan evaluaciones especificas en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: el vocabulario de 128.000 tokens sugiere cobertura amplia, pero los idiomas soportados no estan documentados en esta ficha.
- Capacidades especiales (thinking mode, vision, audio): no disponibles en la informacion proporcionada.
- Inferencia local en Apple Silicon: soportada de forma nativa por `mlx-lm` sin kernels personalizados.

## Casos de uso

- Inferencia local en portatiles Apple: el checkpoint ocupa 876 MiB y consume 2,22 GB de pico de memoria a contexto de ~1K en un M3 Max, por lo que cabe holgadamente en equipos con 16 GB de memoria unificada y permite ejecutar generacion de texto en local sin GPU dedicada.
- Prototipado rapido de asistentes conversacionales: la decodificacion de 150,9 tok/s a ~1K de contexto en `mlx-lm` permite iterar sobre prompts y flujos conversacionales con latencia baja en un Mac.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia practica para comparar MXFP4 estandar, affine-4 y MACaQ-R sobre el mismo modelo base, con datos de perplexidad reproducibles sobre WikiText-2.
- Despliegue con servidor oMLX: con 171,2 tok/s a ~1K y 203,8 tok/s a ~8K, es adecuado para servir el modelo a aplicaciones locales que necesiten throughput alto sin salir del equipo.
- Pruebas de pipelines de generacion en CI: al cargarse con `mlx-lm` estandar y no requerir `trust_remote_code`, se puede integrar en tests automatizados de generacion de texto en runners macOS.
- Experimentos de reduccion de memoria en entornos con memoria unificada limitada: el pico de 2,53 GB a ~8K de contexto, frente a 4,95 GB en BF16, permite ejecutar el modelo junto a otros procesos en equipos de 16-32 GB.

## Benchmarks y rendimiento

Perplexidad medida sobre el test de WikiText-2 (130.816 tokens, longitud de secuencia 512, mismos datos en todas las filas):

| Modelo | Perplexidad ↓ | Diferencia vs BF16 |
|---|---:|---:|
| BF16 | 30,84 ± 0,29 | — |
| affine-4 (group 64) | 42,38 ± 0,41 | +11,54 |
| mxfp4 RTN (MLX por defecto) | 45,50 ± 0,45 | +14,66 |
| Este modelo | 35,47 ± 0,34 | +4,63 |

Rendimiento local con `mlx-lm` en un M3 Max (64 GB de memoria unificada), 256 tokens generados:

| Contexto | Modelo | Prompt TPS | Decode TPS | Memoria pico |
|---|---|---:|---:|---:|
| ~1K | BF16 | 2075 | 71,5 | 4,34 GB |
| ~1K | Este modelo | 2623 | 150,9 | 2,22 GB |
| ~8K | BF16 | 2903 | 70,3 | 4,95 GB |
| ~8K | Este modelo | 2920 | 141,3 | 2,53 GB |

Rendimiento servido con oMLX (media de 3 ejecuciones):

| Contexto | BF16 | Este modelo | Aceleracion |
|---|---:|---:|---:|
| ~1K | 75,5 tok/s | 171,2 tok/s | 2,3x |
| ~8K | 78,0 tok/s | 203,8 tok/s | 2,6x |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 2,22 GB de pico a ~1K de contexto y 2,53 GB a ~8K en M3 Max con memoria unificada; el fichero pesa 876 MiB.
- GPU recomendadas: Apple Silicon con memoria unificada (medido en M3 Max de 64 GB); no aplica a GPU NVIDIA ni AMD porque el formato es MLX.
- Cabe en GPU consumer: si, en cualquier Mac Apple Silicon con al menos 8-16 GB de memoria unificada; no es ejecutable en GPU consumer NVIDIA por el runtime MLX.
- Opciones de despliegue: `mlx-lm` (libreria y CLI `mlx_lm.generate`), servidor oMLX; no es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: 150,9 tok/s de decodificacion a ~1K y 141,3 tok/s a ~8K en local; 171,2 y 203,8 tok/s servido con oMLX. El prefill esta saturado por ancho de banda, por lo que el prompt TPS es comparable al de BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplexidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (MACaQ 4.25 bpw) | 1.7B | no disponible | 35,47 | apache-2.0 | MLX, 876 MiB |
| LFM3-1.7B MLX mxfp4 RTN | 1.7B | no disponible | 45,50 | apache-2.0 | MLX |
| LFM3-1.7B affine-4 (group 64) | 1.7B | no disponible | 42,38 | apache-2.0 | MLX |
| LiquidAI/LFM3-1.7B BF16 | 1.7B | no disponible | 30,84 | apache-2.0 | safetensors BF16, 3.22 GiB |

Las tres alternativas comparten el mismo modelo base y licencia; la comparacion relevante es de metodo de cuantizacion y coste de memoria. No se dispone de comparaciones con otros modelos de 1,7B de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un fine-tune: es compresion con perdida y la perplexidad sigue por encima de BF16 (35,47 frente a 30,84).
- No incorpora rotacion de Hadamard, el mayor termino de ablacion del paper, porque requiere una transformacion en linea de activaciones que el matmul cuantizado de MLX no expone.
- Solo variante W4A16: el kernel W4A4 `qqmm` de MLX solo es mas rapido que BF16 con batch ≤ 4 en Apple Silicon.
- Validado unicamente sobre LFM3-1.7B; no hay garantia de que el metodo generalice a otros modelos.
- No soporta arquitecturas MoE: el refinador solo empareja `nn.QuantizedLinear`, por lo que saltaria silenciosamente las capas de expertos de un modelo MoE.
- Exclusivo de MLX y Apple Silicon: no es cargable en vLLM, llama.cpp, Ollama ni TGI, lo que descarta su uso en produccion sobre GPU NVIDIA.
- Los numeros servidos con oMLX varian en torno a ±10% entre sesiones segun la carga del sistema; deben tratarse como indicativos.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; se heredan del modelo base LFM3-1.7B, pero no se detallan.
- Idiomas y contexto maximo: no documentados en la informacion disponible, lo que limita la planificacion de despliegues multilingues o de contexto largo.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base LiquidAI/LFM3-1.7B antes de explotarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hermitdave/LFM3-1.7B-MLX-MACaQ-4.25bpw
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Paper referenciado (arXiv:2611.10649): https://arxiv.org/abs/2611.10649
- Libreria `mlx-lm`: https://github.com/ml-explore/mlx-lm
- Repositorio MACaQ (documentacion de llama.cpp y apendice 0.C): no disponible como URL en la informacion proporcionada

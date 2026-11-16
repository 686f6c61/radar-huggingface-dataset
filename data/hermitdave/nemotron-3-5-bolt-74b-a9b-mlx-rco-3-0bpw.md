# hermitdave/Nemotron-3.5-Bolt-74B-A9B-MLX-RCO-3.0bpw

## Resumen
Nemotron-3.5-Bolt-74B-A9B-MLX-RCO-3.0bpw es una cuantizacion en formato MLX del modelo NVIDIA Nemotron-3.5-Bolt-74B-A9B-BF16, publicada por el usuario hermitdave. El modelo original es un transformer hibrido de tipo Mixture-of-Experts (MoE) con atencion Mamba y atencion completa, disenado por NVIDIA para generacion de texto y razonamiento. Esta version concreta reduce el checkpoint BF16 original (149,8 GB) a 31,41 GB mediante una asignacion de precision mixta por tensor, lo que permite ejecutarlo en equipos Apple Silicon con memoria unificada de 64 GB.

La relevancia de esta ficha radica en que ejemplifica una tendencia practica: adaptar modelos MoE de gran tamano a hardware de consumo mediante tecnicas de cuantizacion avanzadas. El metodo RCO (rate-constrained optimization) distribuye el presupuesto de bits de forma desigual, asignando 2-3 bits a los expertos enrutados y manteniendo en BF16 las partes criticas (embeddings, cabecera de salida, normas y puertas del router). El resultado es un modelo de 74,33 B parametros totales con aproximadamente 9 B activos por token, ejecutable en un Mac con 64 GB de RAM unificada.

El checkpoint conserva unicamente la columna vertebral linguistica del modelo original. Las torres de vision y audio del modelo upstream (que es un wrapper omni) se descartan porque la implementacion `nemotron_h` de MLX no tiene contrapartida para ellas y su inclusion provoca fallos en `load_weights`. Por tanto, esta version es exclusivamente de generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE con atencion Mamba y atencion completa (model_type: nemotron_h_puzzle) |
| Parametros totales | 74,33 B (9.558.508.032 parametros reales en safetensors del checkpoint cuantizado) |
| Parametros activos | ~9 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine, group size 64, escalas y sesgos en bfloat16; precision mixta RCO (2-8 bits por tensor) |
| Idiomas soportados | en |
| Licencia | no disponible en la model card; la card remite a la licencia upstream (OpenMDW-1.1) |
| Formato de pesos | safetensors (MLX), repo de 31,4 GB |

## Arquitectura y entrenamiento
El modelo base es un transformer hibrido con 88 bloques distribuidos en 40 bloques Mamba (atencion lineal), 40 bloques MoE y 8 bloques de atencion completa. La dimension oculta es 4096 y el vocabulario de 131.072 tokens. Cada capa MoE contiene entre 240 y 496 expertos enrutados de forma heterogenea, mas un experto compartido, con proyecciones latentes (`fc1_latent_proj` / `fc2_latent_proj`) que reducen el coste computacional del enrutamiento. No incluye cabecera MTP (NextN) en este checkpoint.

La cuantizacion se realizo con RCO (rate-constrained optimization), un asignador de precision mixta con restriccion exacta de bits por peso, portado a MLX por el pipeline `rco-mlx`. La calibracion empleo una imatrix construida especificamente para este checkpoint (27.921 tensores, 1,05 M de tokens de FineWeb-Edu). La asignacion resultante es: expertos enrutados 2 bits (30 tensores) y 3 bits (50 tensores); experto compartido 4 bits (69) y 6 bits (11); MoE latente 6 bits (58) y 8 bits (22); atencion lineal Mamba 4 bits (80); atencion completa q/o 4 bits (2) y 6 bits (14), k/v 8 bits (16). Se mantienen en BF16 los embeddings, la cabecera de salida, todas las normas y las puertas del router. El resultado es un tamano efectivo de 3,381 bits por peso sobre los 74,33 B de parametros originales. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, ni sobre si hubo RLHF o DPO.

## Capacidades
- Generacion de texto en ingles.
- Razonamiento y respuesta conversacional (la model card incluye ejemplos con `apply_chat_template`).
- Ejecucion local en Apple Silicon mediante `mlx-lm`.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No incluye vision ni audio: las torres correspondientes se descartaron en la conversion.
- No se documenta soporte de tool calling, function calling ni razonamiento agente multi-paso en la informacion disponible.
- Capacidad multilingue limitada al ingles segun el campo `language`.

## Casos de uso
- Prototipado local en Mac: desarrolladores con un Mac de 64 GB de memoria unificada pueden cargar el modelo con `mlx-lm` y ejecutar generacion de texto sin GPU dedicada, aprovechando los 31,41 GB en disco.
- Evaluacion de tecnicas de cuantizacion: investigadores que comparan metodos (RCO frente a imatrix convencional) pueden usar este checkpoint como referencia reproducible, ya que la model card publica perplejidad, KL y acuerdo top-1 frente al profesor BF16.
- Generacion de texto en ingles para tareas de redaccion y resumen: el modelo mantiene un 78,3 % de acuerdo top-1 con el profesor BF16, suficiente para tareas no criticas de generacion.
- Investigacion sobre arquitecturas hibridas Mamba-MoE: el checkpoint permite estudiar el comportamiento de un modelo con 40 bloques Mamba y 8 de atencion completa en un entorno de recursos limitados.
- Fine-tuning ligero o experimentacion con adaptadores: al estar en formato MLX y safetensors, se puede integrar en flujos de trabajo de MLX para experimentos de adaptacion sobre la columna vertebral linguistica.
- Despliegue de bajo coste en entornos Apple: para servicios internos o demos que requieran un modelo de 74 B con ~9 B activos, sin infraestructura de GPU NVIDIA.
- Benchmarking de cuantizacion: util para medir el impacto de la asignacion de bits por tipo de tensor (expertos frente a atencion) en la calidad final.

## Benchmarks y rendimiento
Los datos disponibles corresponden a la validacion de la cuantizacion frente al profesor BF16 en WikiText-2 (256 × 512 = 130.816 tokens), con perplejidad del profesor de 6,2092.

| Metrica | Esta cuantizacion | AtomicChat imatrix | Build anterior (calibracion ajena) |
|---|---|---|---|
| Perplejidad (WikiText-2) ↓ | 7,8023 ± 0,0549 | 7,7602 ± 0,0550 | 8,6890 ± 0,0624 |
| Media zero-shot (5 × 400) ↑ | 0,6270 | 0,6275 | 0,5935 |
| KL(ref ‖ quant) ↓ | 0,2729 | 0,2449 | 0,4396 |
| Acuerdo top-1 ↑ | 78,3 % | 79,6 % | 72,7 % |

Resultados zero-shot por tarea:

| Tarea | Esta cuantizacion | AtomicChat | Build anterior |
|---|---|---|---|
| arc_challenge | 0,5875 | 0,5825 | 0,5525 |
| arc_easy | 0,8550 | 0,8275 | 0,8100 |
| hellaswag | 0,5025 | 0,5025 | 0,5025 |
| winogrande | 0,6200 | 0,6425 | 0,5700 |
| mmlu | 0,5700 | 0,5825 | 0,5325 |

No se han publicado resultados de benchmarks del modelo base BF16 en la informacion disponible, solo las metricas de degradacion de la cuantizacion.

## Requisitos de hardware
- VRAM/RAM estimada: 31,41 GB en disco; se valido en un Mac con 64 GB de memoria unificada (M3 Max), por lo que se requiere al menos esa cantidad para cargar el modelo con margen.
- GPU recomendadas: Apple Silicon con memoria unificada de 64 GB o superior (validado en M3 Max). No se documenta soporte para GPU NVIDIA en esta version MLX.
- Cabe en GPU de consumo: si, en Apple Silicon de gama alta con 64 GB o mas; no se documenta para RTX 4090 u otras GPU NVIDIA.
- Opciones de despliegue: `mlx-lm` (MLX 0.32.x, macOS Apple Silicon). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (MLX RCO 3,0bpw) | 74,33 B totales / ~9 B activos | no disponible | safetensors MLX | no disponible (remite a OpenMDW-1.1 upstream) | Hugging Face |
| NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 (upstream) | 74,33 B / ~9 B activos | no disponible | BF16 (149,8 GB) | OpenMDW-1.1 | Hugging Face |
| Variante AtomicChat imatrix | 74,33 B / ~9 B activos | no disponible | cuantizacion MLX | no disponible | Hugging Face |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias
- Solo ingles: el campo `language` declara unicamente `en`.
- Solo texto: las torres de vision y audio del modelo upstream se descartaron; no hay capacidades multimodales.
- Degradacion por cuantizacion: perplejidad de 7,8023 frente a 6,2092 del profesor BF16, y acuerdo top-1 del 78,3 %; inaceptable para tareas que requieran alta fidelidad al modelo original.
- Riesgo de alucinacion: no documentado en la model card, pero inherente a modelos generativos; la cuantizacion agresiva (2-3 bits en expertos) puede incrementarlo.
- Licencia: no disponible en la model card; la card remite a la licencia upstream OpenMDW-1.1, por lo que el uso comercial debe verificarse en el repositorio de NVIDIA.
- Sin cabecera MTP (NextN) en este checkpoint, lo que impide decodificacion especulativa con esa cabecera.
- Compatibilidad limitada: validado solo con `mlx-lm` en MLX 0.32.x sobre macOS Apple Silicon; no hay garantia en otros entornos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.
- El numero de parametros en safetensors (9.558.508.032) no coincide con los 74,33 B declarados, lo que refleja el empaquetado cuantizado; conviene tenerlo en cuenta al estimar requisitos.

## Enlaces
- Hugging Face: https://huggingface.co/hermitdave/Nemotron-3.5-Bolt-74B-A9B-MLX-RCO-3.0bpw
- Modelo base upstream: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Dataset de calibracion (imatrix): https://huggingface.co/datasets/hermitdave/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-imatrix
- Repositorio RCO: https://github.com/ISTA-DASLab/RCO

# LithosAI/Qwen3.8-27B-DSpark-NVFP4

## Resumen

Qwen3.8-27B-DSpark-NVFP4 es una cabeza de borrador (draft head) para decodificacion especulativa, no un modelo generativo autonomo. La desarrolla LithosAI como complemento del modelo objetivo nvidia/Qwen3.8-27B-NVFP4, y su funcion es proponer tokens candidatos que el modelo grande verifica despues, acelerando la inferencia sin alterar la distribucion de salida. El checkpoint se distribuye cuantizado en NVFP4 (weight-only) y esta validado con el runtime lithos-metal sobre Apple silicon.

El artefacto contiene 37 matrices en FP4 E2M1 con escalas de bloque F8_E4M3 y escalas tensoriales F32, sumando 1.136.258.502 bytes de safetensors. Conserva cinco capas de borrador con hidden size 5120, intermediate size 17408, 32 cabezas de consulta, ocho de KV, dimension de cabeza 128 y rango de Markov 256, y emite siete propuestas por paso. Comparte embeddings de tokens y proyeccion de vocabulario con el modelo objetivo.

Su relevancia es practica: demuestra que una cabeza especulativa puede cuantizarse a FP4 manteniendo la tasa de aceptacion y reduciendo el coste del estadio de borrador. En la validacion publicada, el borrador pasa de 9,552 ms en BF16 a 4,392 ms en NVFP4 sobre un M5 Max de 40 nucleos, con una ronda completa de 48,427 a 43,188 ms. No es un modelo desplegable de forma independiente: requiere el objetivo, su tokenizador y un loader DSpark compatible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de decodificacion especulativa (DSpark) con capas de borrador y matriz de Markov; no es un modelo autonomo |
| Parametros totales | 1.072.605.697 (segun safetensors del repositorio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en la receta de servicio (`--max-context 32768`); limite nativo del objetivo no disponible |
| Tipos de cuantizacion | NVFP4 weight-only (FP4 E2M1, dos codigos por byte U8, nibble bajo primero), escalas de bloque F8_E4M3 cada 16 columnas de entrada y escala tensorial F32 por matriz; W1 de Markov en BF16 |
| Idiomas soportados | no disponible (heredados del modelo objetivo y su tokenizador) |
| Licencia | model-weight-terms (license: other); texto en WEIGHT_NOTICES.md |
| Formato de pesos | safetensors fragmentados con indice; sin `weights.pack` especifico de hardware |

## Arquitectura y entrenamiento

La cabeza sigue el esquema DSpark de decodificacion especulativa: cinco capas de borrador que comparten embeddings y proyeccion de vocabulario con el objetivo Qwen3.8-27B, con 32 cabezas de consulta, ocho de KV y dimension de cabeza 128. Incorpora una matriz de Markov de rango 256 cuya primera matriz (W1) se mantiene en BF16, mientras que normalizacion y parametros de confianza conservan su precision original. Cada paso emite siete propuestas que el modelo objetivo verifica y acepta o descarta.

El almacenamiento sigue el estilo ModelOpt con tensores `*.weight`, `*.weight_scale` y `*.weight_scale_2`; la desquantizacion es `E2M1(code) * E4M3(block_scale) * tensor_scale`. La aritmetica es weight-only: las activaciones se mantienen en BF16 y la acumulacion y el estado en FP32, sin calibracion de activaciones ni cuantizacion NVFP4 de las mismas. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO; esa informacion no esta disponible.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa: siete candidatos por paso, verificados por el modelo objetivo.
- Aceleracion de inferencia del objetivo nvidia/Qwen3.8-27B-NVFP4 sin modificar la distribucion de salida del modelo grande.
- Reutilizacion del tokenizador, la plantilla de chat y el vocabulario del objetivo; la cabeza no aporta capacidades linguisticas propias.
- Compatibilidad con el loader DSpark de lithos-metal v0.1.2 y su receta de servicio NVFP4.
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento por si misma: esas capacidades dependen exclusivamente del modelo objetivo.
- Cobertura multilingue no declarada de forma independiente; queda determinada por el objetivo.

## Casos de uso

- Aceleracion de servidores de chat sobre Apple silicon: desplegando el objetivo con `python -m monolith.serve` y esta cabeza como borrador, se reduce el coste del estadio de borrador de 9,552 a 4,392 ms en M5 Max, lo que mejora la latencia percibida en conversaciones multi-turno.
- Reduccion de VRAM en el borrador: al almacenar 37 matrices en NVFP4 (1,136 GB), la cabeza ocupa menos memoria que su equivalente BF16 y libera presupuesto para el objetivo o para cache KV en equipos de 48 GB.
- Inferencia local en estaciones Mac: el runtime lithos-metal esta validado en un M5 Max de 40 nucleos con 48 GB, un escenario donde el objetivo de 27B ya consume la mayor parte de la memoria.
- Evaluacion de tecnicas especulativas: el repositorio incluye `validation.json` y `conversion.json` con el SHA-256 del pack, inventario de tensores y politica de cuantizacion, utiles para reproducir y auditar el pipeline.
- Investigacion sobre cuantizacion de cabezas especulativas: permite medir el impacto de FP4 weight-only en la tasa de aceptacion y en la latencia del borrador frente a BF16.
- Integracion en pipelines de servicio con API compatible: la receta levanta un endpoint HTTP en `127.0.0.1:8000` que respondio a dos peticiones Chat Completions reales con HTTP 200 y ocho filas de verificacion.

## Benchmarks y rendimiento

| Metrica | BF16 | NVFP4 | Notas |
|---|---|---|---|
| Latencia mediana del estadio de borrador (contexto 128) | 9,552 ms | 4,392 ms | Comparacion pareada, 9 muestras alternas tras 5 calentamientos, M5 Max 40 nucleos |
| Ronda completa mediana (contexto 128) | 48,427 ms | 43,188 ms | Incluye verificacion del objetivo, aceptacion/commit y siguiente bloque de borrador |
| Refinamiento posterior del kernel NVFP4 | no disponible | 4,186 ms borrador / 42,611 ms ronda | Medicion separada, no pareada con BF16 |
| Propuestas aceptadas | 7 de 7 | 7 de 7 | En el fixture de temporizacion |
| Tokens generados identicos al referencia BF16 | referencia | 512 de 512 | Cuatro prompts de 128 tokens; no establece ventaja general de calidad |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; la metrica relevante para esta cabeza es la latencia y la aceptacion, no el rendimiento en tareas.

## Requisitos de hardware

- VRAM estimada: 1,136 GB para los pesos NVFP4 de la cabeza, mas el espacio del modelo objetivo (27B en NVFP4) y la cache KV; el total depende del objetivo y del contexto.
- Hardware validado: Apple M5 Max de 40 nucleos con 48 GB de memoria unificada.
- GPU NVIDIA: no disponible; no se ha validado con CUDA ni se declara compatibilidad con A100, H100 o RTX 4090.
- Consumer GPU: no disponible para el objetivo de 27B en su conjunto; la cabeza sola es pequena pero inutil sin el objetivo.
- Despliegue: exclusivamente mediante lithos-metal v0.1.2 y su loader DSpark; el layout NVFP4 no garantiza compatibilidad con Transformers, SGLang, vLLM ni otros loaders DSpark.
- Latencia y throughput: ver la tabla de benchmarks; el runtime construye y reutiliza un pack de layout por chip y lee directamente las matrices ya cuantizadas, sin repasar cuantizacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LithosAI/Qwen3.8-27B-DSpark-NVFP4 | Cabeza especulativa DSpark NVFP4 | 1.072.605.697 | 32.768 (receta) | model-weight-terms | Hugging Face, runtime lithos-metal |
| nvidia/Qwen3.8-27B-NVFP4 | Modelo objetivo Qwen3.8 27B | no disponible | no disponible | no disponible | Hugging Face |
| Cabezas especulativas BF16 equivalentes | Cabeza especulativa | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados de otras cabezas especulativas comparables en la informacion proporcionada; la comparacion cuantitativa disponible es la del propio autor entre BF16 y NVFP4.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el objetivo nvidia/Qwen3.8-27B-NVFP4 y su tokenizador no genera nada util.
- Compatibilidad restringida: el layout NVFP4 no implica funcionamiento con Transformers, SGLang, vLLM ni otros loaders DSpark; solo esta validado con lithos-metal v0.1.2.
- Validacion limitada a Apple silicon (M5 Max, 40 nucleos, 48 GB); no hay datos de rendimiento en GPU NVIDIA.
- La coincidencia de 512 tokens con la referencia BF16 procede de cuatro prompts de 128 tokens y no establece una ventaja general de calidad ni de aceptacion.
- Las mediciones de 4,186 ms y 42,611 ms son de una ejecucion separada y no constituyen una comparacion pareada con BF16.
- Licencia model-weight-terms: es necesario revisar WEIGHT_NOTICES.md antes de cualquier uso comercial; no es una licencia permisiva tipo Apache o MIT.
- Idiomas soportados no declarados de forma independiente; dependen del objetivo.
- Riesgo de sesgos y alucinacion heredado del modelo objetivo, no caracterizado en esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/LithosAI/Qwen3.8-27B-DSpark-NVFP4
- Modelo objetivo: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Terminos de licencia de pesos: https://huggingface.co/LithosAI/Qwen3.8-27B-DSpark-NVFP4/blob/main/WEIGHT_NOTICES.md
- Runtime lithos-metal: https://github.com/lithos-ai/lithos-metal
- Release v0.1.2: https://github.com/lithos-ai/lithos-metal/releases/tag/v0.1.2
- Instrucciones de instalacion: https://github.com/lithos-ai/lithos-metal/blob/v0.1.2/docs/installation.md
- Estudio de refinamiento del borrador: https://github.com/lithos-ai/lithos-metal/blob/v0.1.2/docs/research/m5max-27b-dspark-refinement.md
- Validacion: https://huggingface.co/LithosAI/Qwen3.8-27B-DSpark-NVFP4/blob/main/validation.json
- Conversion: https://huggingface.co/LithosAI/Qwen3.8-27B-DSpark-NVFP4/blob/main/conversion.json
- Parche de runtime (Apache-2.0): https://huggingface.co/LithosAI/Qwen3.8-27B-DSpark-NVFP4/blob/main/lithos-metal-runtime.patch
- Licencia del runtime: https://huggingface.co/LithosAI/Qwen3.8-27B-DSpark-NVFP4/blob/main/LICENSE.runtime

# mradermacher/Qwen3.8-27B-antislop-i1-GGUF

## Resumen

Qwen3.8-27B-antislop-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo AlexWortega/Qwen3.8-27B-antislop. El modelo base es un ajuste fino de la familia Qwen3.5 (etiquetado como `qwen3_5` en los tags del repositorio) con aproximadamente 26.900 millones de parámetros, orientado a escritura creativa y a la reducción del estilo "slop" (texto formulaico y repetitivo) mediante técnicas de RL (GRPO y RL-XAR, según los tags del autor). Este repositorio no entrena el modelo: solo publica pesos cuantizados con imatrix para su uso en llama.cpp y entornos compatibles.

La relevancia práctica del repositorio está en que permite ejecutar un modelo de ~27B en hardware de consumo mediante cuantizaciones que van desde 7,2 GB (i1-IQ1_S) hasta 22,2 GB (i1-Q6_K). La ficha del autor lo describe además como modelo de visión, con ficheros mmproj alojados en el repositorio estático hermano. La licencia declarada es Apache 2.0 y los idiomas indicados son inglés y ruso.

Las cuantizaciones i1 usan ficheros imatrix ponderados, lo que según el autor mejora la calidad frente a cuantizaciones estáticas del mismo tamaño. El repositorio acumula 6.841 descargas y fue actualizado por última vez el 19 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); detalles de capas y atención no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; más fichero imatrix |
| Idiomas soportados | inglés (en), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de ~26,9B parámetros de la familia Qwen3.5, según el tag `qwen3_5` del repositorio. El autor del modelo base (AlexWortega) lo etiqueta con `antislop`, `rl-xar`, `grpo`, `creative-writing` y `unslop`, lo que indica un ajuste fino orientado a escritura creativa con entrenamiento por refuerzo (GRPO) para penalizar respuestas formulaicas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni la configuración exacta de RL.

Este repositorio concreto no entrena nada: mradermacher aplica cuantización GGUF con ficheros imatrix ponderados (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`). Las cuantizaciones i1 se generan con una matriz de importancia calculada sobre el modelo, lo que según el autor mejora la perplejidad frente a cuantizaciones estáticas de tamaño equivalente. Existe además un repositorio hermano con cuantizaciones estáticas.

## Capacidades

- Generación de texto conversacional y escritura creativa, con énfasis declarado en reducir el estilo formulaico ("unslop").
- Capacidades de visión según la model card del cuantizador, que indica que los ficheros mmproj, si existen, están en el repositorio estático. No se detalla el codificador visual ni la resolución de imagen.
- Idiomas: inglés y ruso.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Escritura creativa asistida: el ajuste antislop con GRPO está pensado para generar narrativa y prosa con menos clichés y repeticiones; se usaría como modelo de generación de borradores y variaciones de texto en herramientas de autor.
- Generación de ficción y contenido largo en local: con cuantizaciones de 16,6 GB (i1-Q4_K_M) puede ejecutarse en una GPU de consumo de 24 GB, lo que permite iterar sobre textos sin depender de APIs externas.
- Despliegue en estaciones de trabajo sin GPU de datacenter: las variantes IQ3 y Q4 caben en GPUs de 12-16 GB con offload parcial a CPU, útil para prototipos de asistentes de escritura en equipo pequeño.
- Procesamiento de documentos con imagen: si se emplean los ficheros mmproj del repositorio estático, el modelo puede abordar tareas de descripción de imágenes o extracción de contenido visual en un pipeline multimodal local.
- Atención al cliente en inglés o ruso: modelo conversacional de ~27B con licencia Apache 2.0, adecuado para despliegues self-hosted donde no se quiera enviar datos a terceros.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 23 variantes de quant más el fichero imatrix, lo que permite medir el impacto de la cuantización en calidad y latencia sobre el mismo modelo base.
- Fine-tuning posterior sobre GGUF: el fichero imatrix y las cuantizaciones de mayor tamaño (Q5_K_M, Q6_K) sirven como referencia para estudiar la degradación por cuantización antes de decidir un despliegue en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño de fichero, sin contar overhead de contexto ni KV cache): 7,2 GB (IQ1_S), 10,8 GB (Q2_K), 12,7 GB (IQ3_M), 16,6 GB (Q4_K_M), 19,3 GB (Q5_K_M), 22,2 GB (Q6_K).
- GPU de datacenter: A100 40/80 GB, H100, L40S; el modelo completo en Q6_K o Q8 entra sin problemas y permite contextos largos.
- GPU de consumo: RTX 4090 (24 GB) ejecuta i1-Q4_K_M, i1-Q5_K_M e i1-Q6_K con contexto moderado; RTX 4080/4070 Ti (16 GB) ejecutan i1-Q4_K_S o i1-IQ4_XS; GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) requieren IQ3 o Q3 con contexto reducido.
- Despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los tags indican `endpoints_compatible`. No se indica soporte de vLLM o TGI para estos ficheros GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-antislop-i1-GGUF (este) | ~26,9B | no disponible | Apache 2.0 | GGUF (23 quants i1) | Ajuste antislop para escritura creativa; en/ru |
| Qwen3.8-27B-antislop (base) | ~26,9B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Qwen3.8-27B-antislop-GGUF (estático) | ~26,9B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas del mismo modelo; aloja los mmproj |
| Otros modelos ~27B de la familia Qwen3.5 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Las cuantizaciones de menor tamaño (IQ1_S, IQ1_M, Q2_K_S) degradan la calidad de forma notable; el propio autor las marca como "for the desperate" o "very low quality".
- El ajuste antislop con RL puede introducir un estilo peculiar; conviene evaluar la salida en el dominio objetivo antes de producción.
- Riesgo de alucinación inherente a modelos de ~27B sin datos de benchmarks publicados en esta ficha.
- Idiomas declarados solo inglés y ruso; el rendimiento en castellano no está verificado.
- La licencia Apache 2.0 se declara en el repositorio, pero debe confirmarse en el modelo base antes de uso comercial, ya que el cuantizador no es el autor original.
- El repositorio ocupa 300,3 GB; la descarga de todas las variantes no es práctica y conviene seleccionar una sola quant.
- No hay información sobre contexto máximo, tool calling ni modo thinking; no asumir su disponibilidad.
- La fecha de creación (2026-09-24) y actualización (2026-11-19) son posteriores a la fecha de referencia habitual; verificar la vigencia de los enlaces.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-antislop-i1-GGUF
- Modelo base: https://huggingface.co/AlexWortega/Qwen3.8-27B-antislop
- Cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/Qwen3.8-27B-antislop-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-antislop-i1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por tipo de quant: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/

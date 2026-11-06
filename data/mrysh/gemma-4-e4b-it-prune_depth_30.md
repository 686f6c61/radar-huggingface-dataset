# mrysh/gemma-4-e4b-it-prune_depth_30

## Resumen

`mrysh/gemma-4-e4b-it-prune_depth_30` es una version podada por profundidad del modelo multimodal `google/gemma-4-E4B-it`. El autor, mrysh, la publica como artefacto de un benchmark de poda que compara cuatro modelos base con ocho variantes de pruning cada uno, evaluadas con vLLM sobre BFCL, un conjunto de sesgo en contratacion y MedQA. No es un modelo pensado para produccion, sino una pieza de experimentacion para medir la degradacion de calidad que introduce la eliminacion de capas.

La intervencion consiste en reducir el bloque de lenguaje de 42 a 29 capas (un 30,0 % de las capas solicitadas), manteniendo intacta la anchura. El checkpoint resultante tiene 5.860.685.885 parametros, un 28,4 % menos en el modelo de lenguaje (26,7 % sobre el total del checkpoint), y ocupa 11,754 GB en disco. Los bloques de vision y audio del modelo base se conservan sin tocar; solo se poda la parte textual.

La relevancia es metodologica: el autor no aplica destilacion ni fine-tuning posterior a la poda, de modo que el benchmark mide directamente el coste en calidad de la eliminacion de capas. La licencia es Apache 2.0, heredada del modelo base, y los pesos se distribuyen en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con poda por profundidad; anchura sin modificar |
| Parametros totales | 5.860.685.885 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el benchmark compara variantes podadas con cuantizacion, pero no se listan los formatos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it` y aplica poda estructural por profundidad con NVIDIA ModelOpt Minitron 0.46.0rc1. Se eliminan 13 de las 42 capas del bloque de lenguaje (42 -> 29), seleccionadas por importancia medida sobre un conjunto de calibracion de 512 muestras mixtas. La anchura de las capas restantes no cambia, y los bloques de vision y audio del modelo base se mantienen intactos. La herramienta de poda descarta la cabeza de prediccion multi-token de Qwen3.5.

No se realizo destilacion ni fine-tuning despues de la poda, por lo que la calidad cae respecto al modelo base por diseno. El checkpoint se evalua en el benchmark como modelo de texto con vLLM y el modo thinking desactivado.

## Capacidades

- Generacion de texto y razonamiento, heredados del modelo base aunque degradados por la eliminacion de capas.
- Procesamiento multimodal de vision y audio: los bloques correspondientes se conservan sin podar, aunque el benchmark solo evalua el comportamiento textual.
- Soporte de tool calling y function calling, medido en BFCL dentro del benchmark del autor.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking del modelo base: existe, pero el benchmark lo desactiva.

## Casos de uso

- Benchmark de poda estructural: sirve como punto de comparacion frente a otras variantes de pruning (anchura, profundidad, combinadas) y frente a cuantizacion, midiendo la caida en BFCL, MedQA y sesgo en contratacion.
- Investigacion sobre degradacion por profundidad: permite estudiar que capas son prescindibles y como afecta su eliminacion a tareas de tool calling y razonamiento medico.
- Baseline en experimentos de recuperacion: util para evaluar si destilacion o fine-tuning posterior recuperan la calidad perdida tras podar un 30 % de las capas.
- Pruebas de infraestructura de inferencia: al ocupar 11,754 GB en BF16, sirve para validar despliegues con vLLM en entornos con memoria limitada.
- Evaluacion de sesgo: el conjunto de hiring-bias del benchmark permite analizar como la poda afecta a sesgos en decisiones de contratacion simuladas.
- Docencia y divulgacion: ejemplo reproducible de pipeline de poda con NVIDIA ModelOpt sobre un modelo multimodal.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. El autor indica que el benchmark compara las variantes podadas entre si y con cuantizacion sobre BFCL, hiring-bias y MedQA usando vLLM, pero no se incluyen las cifras en la model card.

## Requisitos de hardware

- VRAM estimada: unos 12 GB en BF16 para los pesos (11,754 GB en disco); en FP8 o cuantizaciones de 8 bits, alrededor de 6 GB, y en 4 bits, unos 3-4 GB (estimacion a partir del numero de parametros, no confirmada por el autor).
- GPU recomendadas: A100 o H100 para evaluacion con vLLM a throughput alto; L40S o RTX 6000 Ada como alternativas de 48 GB.
- Consumer GPU: cabe en BF16 en tarjetas de 16 GB o mas (RTX 4090, RTX 4080 Super, RTX 5090); en cuantizacion de 8 o 4 bits cabria en GPUs de 8-12 GB.
- Despliegue: el autor usa vLLM; al ser safetensors estandar de transformers, tambien seria compatible con TGI y, previsiblemente, con llama.cpp y Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mrysh/gemma-4-e4b-it-prune_depth_30 | 5.860.685.885 | no disponible | Apache 2.0 | Poda por profundidad, sin destilacion |
| google/gemma-4-E4B-it | no disponible | no disponible | Apache 2.0 | Modelo base sin podar; referencia de calidad |
| Otras variantes del benchmark (8 por modelo) | no disponible | no disponible | Apache 2.0 | Variantes de poda comparadas por el autor |
| Cuantizacion del modelo base | no disponible | no disponible | Apache 2.0 | Alternativa de compresion comparada en el benchmark |

## Limitaciones y advertencias

- Caida de calidad garantizada: el autor advierte explicitamente de que no hay destilacion ni fine-tuning posterior, por lo que el rendimiento es inferior al modelo base.
- No apto para produccion sin evaluacion previa: es un artefacto de benchmark, no un modelo afinado para uso real.
- Sesgos: el propio benchmark incluye una prueba de sesgo en contratacion, lo que sugiere que el autor considera relevante medir este riesgo; no se publican resultados.
- Riesgo de alucinacion: previsiblemente mayor que en el modelo base tras eliminar el 30 % de las capas, aunque no hay mediciones publicadas.
- Idiomas y contexto: la model card no documenta la cobertura linguistica ni la ventana de contexto resultante.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Gemma conviene revisar los terminos del modelo base de Google.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mrysh/gemma-4-e4b-it-prune_depth_30
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- NVIDIA ModelOpt: no disponible enlace en la informacion proporcionada

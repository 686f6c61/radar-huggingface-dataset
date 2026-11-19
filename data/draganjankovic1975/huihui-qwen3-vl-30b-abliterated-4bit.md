# draganjankovic1975/huihui-qwen3-vl-30b-abliterated-4bit

## Resumen

Este repositorio contiene una cuantizacion en 4 bits del modelo Huihui-Qwen3-VL-30B-A3B-Instruct-abliterated, una variante "abliterated" (con los mecanismos de rechazo atenuados) del Qwen3-VL-30B-A3B-Instruct de Alibaba. El modelo original es un transformer multimodal de tipo Mixture of Experts que procesa imagen y texto para generar texto, con unos 31.070 millones de parametros totales y aproximadamente 3.000 millones activos por token. Esta version concreta es un mirror del trabajo de MLXBits, convertida y cuantizada con mlx-vlm para su ejecucion en equipos macOS con chips de la serie M.

La relevancia de esta ficha es doble. Por un lado, demuestra el flujo de cuantizacion a 4 bits de un modelo MoE multimodal grande para hardware de consumo Apple, reduciendo el peso del repositorio a 18,3 GB. Por otro, al tratarse de una variante abliterated, elimina buena parte de las capas de alineacion y rechazo del modelo original, lo que la hace inadecuada para aplicaciones comerciales o expuestas al publico sin filtros adicionales.

El repositorio no incluye informacion sobre idiomas soportados ni resultados de benchmarks propios. La licencia declarada es Apache 2.0, heredada del modelo base, aunque el autor advierte explicitamente de que el uso previsto es experimental y de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal MoE (qwen3_vl_moe), vision-language |
| Parametros totales | 31.070.754.032 |
| Parametros activos | Aproximadamente 3.000 millones (denominacion A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX, `--q-bits 4`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizacion MLX), compatible con transformers; testado en LM Studio |

## Arquitectura y entrenamiento

El modelo base es Qwen3-VL-30B-A3B-Instruct, un transformer de tipo Mixture of Experts con capacidad de vision y lenguaje. La variante A3B indica que, pese a los 31.000 millones de parametros totales, solo se activan alrededor de 3.000 millones por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. La parte VL integra un codificador de vision que permite entrada image-text-to-text.

Sobre esa base, huihui-ai aplico una tecnica de abliteration (eliminacion de direcciones de rechazo en el espacio de activaciones, segun el proyecto remove-refusals-with-transformers) para reducir la tendencia del modelo a negarse a responder. Posteriormente, MLXBits convirtio y cuantizo los pesos a 4 bits con `mlx_vlm.convert` para su ejecucion en Apple Silicon mediante mlx-vlm. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original dentro de la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Comprension de imagenes y respuesta en texto (image-text-to-text), incluyendo preguntas sobre el contenido visual.
- Razonamiento y respuesta a instrucciones en formato Instruct.
- Capacidad de ejecucion local en macOS con chips M-series mediante MLX.
- Compatibilidad con LM Studio para entrada de texto e imagen, segun el autor.
- Al no estar alineado (abliterated), responde a solicitudes que el modelo original rechazaria.
- Soporte de tool calling, agentes o modos de razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como varia el comportamiento de un LLM multimodal al eliminar las direcciones de rechazo, comparando respuestas con el Qwen3-VL original en entornos controlados.
- Prototipado local en Mac: servir un modelo multimodal de 31.000 millones de parametros en un Mac con chip M-series usando MLX y LM Studio, sin depender de GPUs dedicadas.
- Analisis de imagenes en laboratorio: descripcion de capturas, diagramas o documentos escaneados con fines de investigacion, aprovechando la entrada image-text-to-text.
- Generacion de contenido sin filtros en entornos cerrados: redaccion de texto creativo o escenarios de prueba donde se necesita que el modelo no aplique rechazos por defecto, siempre con revision humana.
- Evaluacion de cuantizacion: medir la perdida de calidad de un MoE multimodal al pasar de precision completa a 4 bits MLX frente al modelo base.
- Docencia y demostraciones: explicar el funcionamiento de un MoE multimodal abliterated en cursos de IA, con advertencias explicitas sobre el contenido generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso del repositorio: 18,3 GB en cuantizacion de 4 bits, que marca el minimo de memoria unificada necesaria para cargar los pesos.
- Hardware objetivo: equipos Apple con chips de la serie M (SOC con memoria unificada), segun el flujo de MLX descrito por el autor.
- Memoria recomendada: al menos 24-32 GB de memoria unificada para cargar los pesos con margen para el contexto y el codificador de vision; no confirmado en la informacion disponible.
- GPU dedicadas (A100, H100, RTX 4090): no se documenta soporte; el formato es MLX y la libreria declarada es transformers, pero el uso previsto es Apple Silicon.
- Opciones de despliegue: mlx-vlm, LM Studio (testado por el autor); vLLM, llama.cpp, Ollama o TGI no estan confirmados para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (huihui-qwen3-vl-30b-abliterated-4bit) | 31,07 B totales, ~3 B activos | no disponible | Imagen + texto | Apache 2.0 | Hugging Face, MLX |
| Qwen/Qwen3-VL-30B-A3B-Instruct | 31 B totales, ~3 B activos | no disponible | Imagen + texto | Apache 2.0 (segun modelo base) | Hugging Face |
| huihui-ai/Huihui-Qwen3-VL-30B-A3B-Instruct-abliterated | 31 B totales, ~3 B activos | no disponible | Imagen + texto | Apache 2.0 | Hugging Face, safetensors sin cuantizar |
| MLXBits/huihui-qwen3-vl-30b-abliterated-4bit | 31 B totales, ~3 B activos | no disponible | Imagen + texto | Apache 2.0 | Hugging Face, MLX (original de esta copia) |

## Limitaciones y advertencias

- Modelo abliterated: el filtrado de seguridad esta muy reducido y puede generar contenido sensible, controvertido o inapropiado.
- No apto para todas las audiencias ni para aplicaciones publicas, menores o entornos que exijan alta seguridad.
- El autor recomienda uso exclusivo en investigacion, pruebas o entornos controlados, evitando produccion o aplicaciones comerciales de cara al publico.
- Sin garantias de seguridad por defecto; el autor declina responsabilidad sobre las consecuencias de su uso.
- Riesgo de alucinacion y de respuestas incorrectas, agravado por la cuantizacion a 4 bits.
- Idiomas soportados y longitud de contexto no documentados en el repositorio.
- Es un mirror: el credito y la licencia original corresponden a MLXBits y huihui-ai; conviene verificar la licencia del modelo base antes de cualquier uso.
- Requiere hardware Apple Silicon para el flujo MLX documentado; no hay garantia de funcionamiento en otras plataformas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/draganjankovic1975/huihui-qwen3-vl-30b-abliterated-4bit
- Repositorio original (MLXBits): https://huggingface.co/MLXBits/huihui-qwen3-vl-30b-abliterated-4bit
- Modelo base abliterated (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3-VL-30B-A3B-Instruct-abliterated
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Proyecto de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Ko-fi de huihui-ai: https://ko-fi.com/huihuiai

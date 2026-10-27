# sergolsub/mlx-d3-turbo-27B

## Resumen

`sergolsub/mlx-d3-turbo-27B` es una conversión a 8 bits en formato MLX del modelo `vllm-sr/d3-turbo`, el modelo de decisión multimodal de 27B de la familia Decision 3.0 de vLLM Semantic Router. No es un modelo generativo al uso: recibe un estado (texto o JSON, opcionalmente con imágenes y vídeo) junto con un conjunto de preguntas con nombre, y devuelve para cada una una probabilidad en una única pasada forward. Los tipos de pregunta declarados por el autor del modelo original son elección entre opciones, sí/no, puntuación en escala, localización de caja (box localization) y seguimiento (tracking). El repositorio que nos ocupa no entrena nada: solo cuantiza y reempaqueta los pesos BF16 originales para Apple Silicon.

La relevancia práctica es doble. Por un lado, expone un modelo de 26.085.330.160 parámetros (26,09B reales, 27B nominales) en un formato que corre sobre `mlx_lm` en memoria unificada de Apple Silicon, con 27,85 GB en disco y una auditoría tensor a tensor de la pérdida de calidad por cuantización (KL medio 3,52e-04 sobre 1183 tensores). Por otro, convierte una tarea de enrutamiento y clasificación —decidir si una petición necesita razonamiento, qué herramienta aplicar, si un contenido es admisible o dónde está un objeto en una imagen— en una única inferencia con salida probabilística, lo que simplifica el despliegue de guardarraíles y routers semánticos frente a pipelines de generación de texto seguidos de parseo.

Ahora bien, conviene leer la ficha con cautela: es una conversión de terceros con 42 descargas y 0 likes, la model card no documenta longitud de contexto, idiomas ni benchmarks de calidad en tareas estándar, y el rendimiento medido por el autor (mediana de 2461 ms por decisión, 0,62 decisiones cortas por segundo en un Mac mini M4 Pro de 48 GB) sitúa al modelo en el terreno de la decisión de baja frecuencia, no del servicio de alto throughput.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No declarada explícitamente en la model card. Los nombres de capas del audit de cuantización (`language_model.layers.0.linear_attn.in_proj_b.weight`) y el tag `qwen3_5` apuntan a un transformer con capas de atención lineal (híbrido), más cabezas de decisión conjuntas (`decision_config.json`, `joint_config.json`, `readout.safetensors`) |
| Parámetros totales | 26.085.330.160 (26,09B; tamaño nominal 27B) |
| Parámetros activos | No aplica: no se declara arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 8 bits (MLX) sobre los pesos BF16 originales; se publican 26 shards de pesos más `readout.safetensors`; no se ofrecen otras precisiones en este repo |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del repositorio upstream; en caso de conflicto prevalece la licencia del repositorio original) |
| Formato de pesos | `safetensors` en layout MLX (8 bits), 26 shards + `readout.safetensors`; `config.json`, tokenizer y `chat_template.jinja`; glue de inferencia `*_mlx.py`, `decision_config.json`, `joint_config.json`; incluye `kl_audit.json` con la tabla de error por tensor |
| Tamaño en disco | 27,85 GB (repo de 27,9 GB) |
| Librería | `mlx` (`mlx_lm`) |
| Modelo base | `vllm-sr/d3-turbo` |
| Autor de la conversión | `sergolsub` |
| Descargas / likes | 42 / 0 |
| Fechas | Creado 2026-10-24, actualizado 2026-10-26 |

## Arquitectura y entrenamiento

Este repositorio no entrena ni modifica la arquitectura: es una conversión de cuantización a 8 bits para MLX, realizada en streaming desde los shards BF16 del modelo original, con conversión explícita de la estructura anidada `text_config`. El modelo base, `vllm-sr/d3-turbo`, es el modelo de decisión multimodal de 27B de la familia Decision 3.0 de vLLM Semantic Router, diseñado para responder preguntas con nombre mediante probabilidades en una sola pasada forward en lugar de generar texto. El checkpoint incorpora cabeceras de decisión y conjuntas (los ficheros `decision_config.json` y `joint_config.json`, más un `readout.safetensors` de 5 MB), lo que confirma que la salida no es la de un LM convencional.

El detalle técnico más relevante que se puede verificar en este repo es la auditoría de cuantización. Se compararon 1183 tensores de los pesos dequantizados a 8 bits contra los originales BF16 mediante KL de histograma sobre 512 bins: KL medio 3,52e-04, KL máximo 6,57e-03, con 581 tensores con KL distinto de cero. La peor capa es `language_model.layers.0.linear_attn.in_proj_b.weight` con KL 6,57e-03, es decir, la proyección de entrada de la atención lineal de la primera capa, típicamente la más sensible en este tipo de arquitecturas. El repo publica SHA-256 por shard para verificar descargas. No se documentan tokens de entrenamiento, composición del dataset, ni etapas de RLHF/DPO en la información disponible.

## Capacidades

- Decisión probabilística sobre preguntas con nombre: devuelve una probabilidad por pregunta en lugar de texto generado, lo que evita el parseo de salidas libres.
- Tipos de pregunta soportados (según el modelo upstream): elección entre varias opciones, sí/no, puntuación en escala (score), localización de cajas en imagen y seguimiento (tracking) en imagen o vídeo.
- Entrada multimodal: texto, JSON, e imágenes o vídeo junto con el conjunto de preguntas.
- Respuesta de todas las preguntas en una única pasada forward por petición.
- Integración en routers semánticos y sistemas de enrutamiento de peticiones LLM (familia vLLM Semantic Router, Decision 3.0).
- Ejecución local en Apple Silicon mediante `mlx_lm` (`load` y `generate`), con glue específica para las cabezas de decisión.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, modo thinking ni generación libre de texto de calidad verificada.

## Casos de uso

- Enrutamiento de peticiones en una pasarela LLM: dado el prompt del usuario, formular preguntas del tipo "¿requiere razonamiento profundo?", "¿es una consulta de código?" o "¿necesita recuperación de documentos?" y usar las probabilidades devueltas para elegir el modelo o la ruta, aprovechando la salida probabilística para aplicar umbrales calibrados.
- Guardarraíles de contenido en producción: preguntas binarias sobre el texto de entrada o el JSON de una petición (por ejemplo, si contiene datos personales o si viola una política) evaluadas en una sola inferencia, sin depender de un generador y de expresiones regulares sobre su salida.
- Filtrado de recuperación en RAG: puntuar la relevancia de cada documento candidato frente a la consulta como pregunta de score, usando el modelo como reranker ligero antes de construir el contexto final.
- Grounding visual en pipelines de imagen: localización de cajas para verificar que un objeto anunciado está presente en una imagen de catálogo o en un fotograma, útil en moderación de contenido visual y control de calidad de datasets.
- Análisis de vídeo para seguimiento: preguntas de tracking sobre fotogramas para comprobar la presencia y posición de un elemento a lo largo de un clip, por ejemplo en verificación de moda o inspección de escenas.
- Evaluación automática de salidas de otros modelos: convertir criterios de calidad (fidelidad, toxicidad, corrección) en preguntas tipadas y obtener probabilidades comparables entre candidatos, más estables que una calificación en texto libre.
- Clasificación por lotes con MLX en local: procesos nocturnos en un Mac de escritorio que etiquetan JSON o texto con un conjunto fijo de preguntas, aceptando el throughput medido de 0,62 decisiones cortas por segundo.
- Triaje en asistentes conversacionales: decidir si un turno debe escalarse a un humano, activar una herramienta o responderse directamente, con latencia mediana de ~2,5 s por decisión en el hardware de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos medidos son los de la conversión y su ejecución en el hardware del autor:

| Métrica | Valor | Contexto |
|---|---|---|
| KL medio vs BF16 (8 bits) | 3,52e-04 | 1183 tensores, histograma de 512 bins |
| KL máximo vs BF16 (8 bits) | 6,57e-03 | `language_model.layers.0.linear_attn.in_proj_b.weight` |
| Tensores con KL ≠ 0 | 581 de 1183 | Auditoría `kl_audit.json` |
| Tamaño en disco | 27,85 GB | 26 shards + `readout.safetensors` |
| Tiempo de carga | 6,03 s | Mac mini M4 Pro 48 GB, MLX 8 bits |
| Memoria residente pico | 0,75 GB | Reportado por el autor; inconsistente con 27,85 GB de pesos, ver limitaciones |
| Latencia de decisión (mediana) | 2461 ms | Mac mini M4 Pro 48 GB |
| Throughput sostenido | 0,62 decisiones cortas/s | Mac mini M4 Pro 48 GB |

Referencia externa, aplicable a otra conversión y no a este repo: `OsaurusAI/d3-turbo-JANGH2`, un bundle JANG de 14,5 GB del mismo modelo base, reporta coincidencia con el modelo de precisión completa en el 92,65 % de 2000 peticiones del conjunto `tasksource/tasksource-jev-typed-decisions`.

## Requisitos de hardware

- Memoria unificada: los pesos 8 bits ocupan 27,85 GB, por lo que se necesita un Mac con al menos 32 GB de memoria unificada y se recomienda 48 GB o más para dejar margen al contexto y a las cabeceras de decisión.
- Hardware validado por el autor: Mac mini M4 Pro con 48 GB, con carga en 6,03 s y latencia mediana de 2461 ms por decisión.
- Orientación para otros equipos Apple Silicon: series M Max y M Ultra con 64, 96 o 128 GB son el objetivo natural; en configuraciones de 32 GB el modelo cabe pero el margen operativo es mínimo y no está verificado en la información disponible.
- GPU NVIDIA: MLX no soporta CUDA, de modo que este repositorio no se puede ejecutar en A100, H100 ni RTX 4090. Para esas GPUs hay que usar los pesos BF16 de `vllm-sr/d3-turbo` con vLLM, que requieren del orden de 54 GB en BF16 (estimación a partir del recuento de parámetros, no publicada por el autor).
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB) ni siquiera en 8 bits a través de este repo, porque el formato es exclusivo de MLX.
- Despliegue: `mlx_lm` en Python (`load` + `generate`) con la glue `*_mlx.py` y los ficheros `decision_config.json` / `joint_config.json`. No se documenta soporte para llama.cpp, Ollama, TGI, vLLM ni llama.cpp GGUF en este repositorio.
- Throughput estimado: 0,62 decisiones cortas por segundo en M4 Pro 48 GB; no se han publicado cifras de batching ni de latencia con entradas multimodales de imagen o vídeo.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato / tamaño | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `sergolsub/mlx-d3-turbo-27B` (este) | 26,09B | safetensors MLX 8 bits, 27,85 GB | No disponible | KL medio 3,52e-04 vs BF16; 0,62 decisiones/s en M4 Pro 48 GB | Apache 2.0 | Hugging Face, 42 descargas |
| `vllm-sr/d3-turbo` (upstream) | 27B | BF16, shards originales | No disponible | Referencia de precisión completa | Apache 2.0 | Hugging Face y ModelScope |
| `OsaurusAI/d3-turbo-JANGH2` | 27B (base) | Bundle JANG, 14,5 GB | No disponible | 92,65 % de coincidencia con precisión completa en 2000 peticiones de `tasksource-jev-typed-decisions` | Apache 2.0 (heredada) | Hugging Face |
| Otros modelos de decisión de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es entre conversiones del mismo modelo base: este repo prioriza fidelidad numérica verificable (auditoría KL por tensor y checksums SHA-256) a costa de tamaño, mientras que la variante JANG reduce el peso a 14,5 GB y publica una métrica de acuerdo en una tarea de decisión concreta.

## Limitaciones y advertencias

- No es un modelo de chat: la salida es un conjunto de probabilidades sobre preguntas con nombre. El ejemplo de `mlx_lm.generate` de la model card sirve para cargar el modelo, pero no ejercita el modo de decisión sin la glue de `decision_config.json` / `joint_config.json`.
- Conversión de terceros: no es un lanzamiento oficial de vLLM Semantic Router, con 42 descargas y 0 likes. Para producción conviene validar contra los pesos BF16 del repositorio upstream.
- Exclusivo de Apple Silicon: MLX no tiene backend CUDA. No hay GGUF, no hay ruta vLLM ni TGI y no se puede desplegar en GPUs NVIDIA sin recurrir a los pesos originales.
- Throughput bajo: 0,62 decisiones cortas por segundo en M4 Pro 48 GB limita su uso a enrutamiento de baja frecuencia, por lotes o evaluaciones offline, no a servir tráfico interactivo intenso.
- Inconsistencia en las métricas del autor: la memoria residente pico reportada (0,75 GB) es incompatible con 27,85 GB de pesos. Hay que tratar ese dato como no fiable y medir el consumo real antes de dimensionar el hardware.
- Pérdida por cuantización concentrada en la primera capa de atención lineal; el KL máximo (6,57e-03) es un orden de magnitud superior al medio, lo que sugiere revisar el comportamiento en tareas sensibles a las representaciones iniciales.
- Idiomas no declarados: la model card no especifica cobertura lingüística, por lo que no se puede asumir un rendimiento multilingüe sin evaluación propia.
- Longitud de contexto desconocida: sin dato publicado no se puede planificar el tamaño de la ventana ni el coste de entradas largas, especialmente con vídeo.
- Licencia Apache 2.0 heredada, con cláusula de prevalencia del LICENSE del repositorio upstream; antes de uso comercial hay que revisar los ficheros LICENSE y NOTICE que acompañan a los pesos.
- Riesgo de alucinación estructuralmente distinto al de un modelo generativo: al emitir probabilidades, el fallo se manifiesta como una confianza mal calibrada. Es imprescindible validar los umbrales por tipo de pregunta antes de automatizar decisiones.
- Sin benchmarks estándar publicados: no hay datos de MMLU, HumanEval ni GSM8K, y la única métrica de acuerdo disponible (92,65 %) pertenece a otra conversión, no a esta.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/mlx-d3-turbo-27B
- Modelo base: https://huggingface.co/vllm-sr/d3-turbo
- Modelo base en ModelScope: https://www.modelscope.cn/models/vllm-sr/d3-turbo
- Ficha de D3 Turbo en There's An AI For That: https://theresanaiforthat.com/model/d3-turbo/
- Conversión alternativa JANG 14,5 GB: https://huggingface.co/OsaurusAI/d3-turbo-JANGH2
- Análisis de requisitos de VRAM y hardware: https://www.madebyagents.com/models/d3-turbo-27b

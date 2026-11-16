# OsaurusAI/gemma-4-31B-it-qat-JANG_4M

## Resumen

OsaurusAI/gemma-4-31B-it-qat-JANG_4M es una conversión al ecosistema MLX del modelo Google Gemma 4 de 31 000 millones de parámetros en su variante instruct y cuantizada con QAT (quantization-aware training). El bundle, distribuido por OsaurusAI, aplica un esquema de cuantización afín por capas (JANG_4M) diseñado específicamente para Apple Silicon, preservando en fp16 los componentes sensibles del modelo (embeddings, proyecciones de salida, normas, torres multimodales y tensores de embedding por capa) mientras comprime a 8 bits la atención y el router MoE, y a 4 bits el cuerpo MLP/expertos del decodificador.

El modelo resuelve el problema de ejecutar un Gemma 4 multimodal de 31B en hardware Apple con memoria unificada, manteniendo coherencia en las partes críticas para la calidad y la visión. Incluye 60 capas de texto con un tamaño oculto de 5376 y se distribuye en 25 shards safetensors con un total de 50,8 GB en el repositorio.

Es relevante ahora porque permite desplegar localmente un modelo de clase 31B con capacidades de visión y conversación sobre MLX, un runtime en maduración para Apple Silicon, sin recurrir a GPUs dedicadas. La ficha se basa exclusivamente en la información disponible en la model card y los metadatos de Hugging Face; los detalles de entrenamiento, benchmarks y composición del dataset original no están publicados en esta información.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4` / `Gemma4ForConditionalGeneration` (transformer decoder con componentes MoE segun la presencia de router) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JANG_4M: afín por capas; atención 8 bits, router 8 bits, MLP/expertos 4 bits, embeddings 16 bits, media por capa 16 bits; group_size=32 |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors (`jang_affine`), 25 shards |

## Arquitectura y entrenamiento

La arquitectura base es Gemma 4 en su variante `Gemma4ForConditionalGeneration`, un transformer decoder de 60 capas con tamaño oculto de 5376. La presencia de proyecciones de router en el esquema de cuantización indica componentes de mezcla de expertos (MoE) en el modelo original, aunque el número de expertos y de parámetros activos no se detalla en la información disponible. El modelo base es `google/gemma-4-31B-it-qat-q4_0-unquantized`, es decir, una versión instruct entrenada con quantization-aware training y posteriormente des-cuantizada para servir como fuente de esta conversión.

El bundle de OsaurusAI no reentrena el modelo: aplica una cuantización afín selectiva por tipo de tensor. Los embeddings de token, la proyección de salida, las normas, las torres y embedders multimodales, y los tensores de embedding, gate y proyector por capa de Gemma 4 se mantienen en fp16 como passthrough. La atención y las proyecciones del router MoE se cuantizan a 8 bits, y el cuerpo MLP/expertos del decodificador a 4 bits, con `group_size=32` y 410 bases afines con sidecars `.scales` y `.biases`. No se incluyen pesos de drafter especulativo (MTP): la metadata indica `mtp: none` y `mtp_policy: none`. No hay información sobre número de tokens de entrenamiento, composición del dataset, RLHF o DPO en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat propia de Gemma 4 incluida en `tokenizer_config.json`.
- Comprensión de imágenes (pipeline `image-text-to-text`), con torre de visión preservada en fp16 y `processor_config.json` para el procesamiento multimodal.
- Razonamiento multi-turno y conversación, al ser una variante instruct.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según la metadata del modelo.
- Audio y vídeo: no soportados en esta variante; `audio_config` está vacío y no hay `video_config`.
- Decodificación especulativa: no disponible (sin pesos MTP).

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar diálogos multi-turno en inglés ejecutándose sobre MLX en Apple Silicon con memoria unificada, aprovechando la cuantización JANG_4M para reducir el footprint frente al checkpoint fp16.
- Análisis de imágenes en escritorio: gracias a la torre de visión preservada en fp16 y al pipeline `image-text-to-text`, se puede usar para describir capturas, extraer texto de imágenes o responder preguntas sobre documentos escaneados sin salir del equipo local.
- Prototipado de aplicaciones multimodales en MLX: sirve como base para desarrolladores que quieran validar flujos de imagen y texto en el ecosistema MLX/vMLX antes de pasar a producción con GPUs.
- Investigación sobre cuantización selectiva: el esquema por capas (8 bits en atención y router, 4 bits en MLP, 16 bits en embeddings y media) permite estudiar el impacto de la precisión por tipo de tensor en calidad y latencia.
- Evaluación de modelos Gemma 4 en hardware Apple: útil para comparar el rendimiento de la variante JANG_4M frente al checkpoint original QAT q4_0 en tareas de visión y texto.
- Procesamiento de documentos con privacidad: al ejecutarse en local, permite tratar imágenes y texto sensibles sin enviar datos a servicios externos, siempre que se cumpla la licencia Gemma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 50,8 GB en safetensors; para inferencia se necesita memoria unificada suficiente para cargar los shards y el estado de ejecución, por lo que se recomienda un Mac con 64 GB o más de memoria unificada. No se dispone de cifras oficiales de memoria pico.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (familias M-series Pro, Max y Ultra). No aplica a A100, H100 ni RTX 4090, ya que el formato `mlx`/`jang_affine` está orientado a Apple Silicon.
- ¿Cabe en GPU consumer? No en GPUs NVIDIA consumer por el formato MLX; en Apple Silicon requiere configuraciones de gama alta por el tamaño del bundle.
- Opciones de despliegue: runtime MLX/vMLX compatible con Gemma 4 que entienda las anulaciones de `quantization` en `config.json`, `jang_config.json` y los ficheros de processor/chat-template de Gemma 4. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OsaurusAI/gemma-4-31B-it-qat-JANG_4M | 31,27 B | no disponible | safetensors `jang_affine` (MLX) | gemma | Hugging Face, 32 descargas |
| google/gemma-4-31B-it-qat-q4_0-unquantized | 31,27 B (estimado por el modelo base) | no disponible | safetensors (checkpoint fuente) | gemma | Hugging Face |
| Otras variantes MLX de Gemma 4 | no disponible | no disponible | MLX | gemma | no disponible |

La comparativa se limita a las dos variantes documentadas en la información disponible; no se han identificado alternativas de la misma categoría con datos verificables en esta búsqueda.

## Limitaciones y advertencias

- Idiomas: la metadata declara únicamente inglés (`en`); el rendimiento en castellano u otros idiomas no está garantizado.
- Modalidades: audio y vídeo no están soportados en esta variante; no hay `video_config` ni `audio_config` activo.
- Decodificación especulativa: sin pesos MTP, no se puede aplicar speculative decoding con drafter incluido.
- Runtime: requiere un loader MLX/vMLX compatible con Gemma 4 y con el esquema JANG; no funciona en vLLM, llama.cpp, Ollama o TGI según la información disponible.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma de Google, que incluyen restricciones de uso aceptable y obligaciones de atribución; conviene revisarla antes de producción.
- Riesgo de alucinación: no hay datos publicados sobre tasas de alucinación ni evaluaciones de fiabilidad para esta conversión.
- Sesgos: no se documentan sesgos específicos en la model card; al heredar el modelo base de Google, arrastra los sesgos de sus datos de entrenamiento, no detallados aquí.
- Cuantización: la compresión a 4 bits en MLP/expertos puede degradar la calidad frente al checkpoint fp16; no se han publicado métricas comparativas.
- Repositorio con pocas descargas (32) y sin likes, lo que limita la validación comunitaria de la conversión.

## Enlaces

- Hugging Face: https://huggingface.co/OsaurusAI/gemma-4-31B-it-qat-JANG_4M
- Modelo base: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Sitio del autor: https://osaurus.ai
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.

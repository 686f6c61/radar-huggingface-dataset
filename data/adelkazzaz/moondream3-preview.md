# AdelKazzaz/moondream3-preview

## Resumen

Moondream 3 (Preview) es un modelo de lenguaje y visión (VLM) con arquitectura de mezcla de expertos (MoE) desarrollado por Moondream. Con 9.268 millones de parámetros totales y aproximadamente 2.000 millones activos por token, el modelo busca combinar razonamiento visual de alto nivel con un perfil de despliegue eficiente. Está publicado en Hugging Face bajo la licencia "other" y se distribuye en formato safetensors con código personalizado que requiere `trust_remote_code=True`.

El modelo incorpora cuatro habilidades específicas integradas en su interfaz de inferencia (`query`, `caption`, `point` y `detect`) orientadas a comprensión visual, generación de descripciones, localización de puntos y detección de objetos con cajas delimitadoras. La longitud de contexto útil se sitúa en 32.000 tokens, con un tokenizador SuperBPE propio diseñado para eficiencia.

Es relevante ahora porque propone un equilibrio poco habitual en la categoría: un VLM MoE de escala media que aspira a razonamiento visual de última generación sin renunciar a un coste de inferencia contenido. La versión es una preview, por lo que la información pública sobre benchmarks, idiomas y condiciones exactas de licencia es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con MoE en capas FFN; 24 capas (4 densas iniciales, 20 con MoE), 64 expertos con 8 activos por token; GeGLU con dim interna/gate de 1024 y dim oculta de 2048; atención multi-cabeza con escalado de temperatura dependiente de posición y datos; encoder visual basado en SigLIP con concatenación de canales multi-crop |
| Parámetros totales | 9.268.626.928 |
| Parámetros activos | Aproximadamente 2.000 millones (según model card) |
| Longitud de contexto | 32.000 tokens (contexto útil) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | safetensors (transformers, custom_code) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 24 capas en el que las cuatro primeras capas son densas y las veinte restantes incorporan FFN de tipo MoE con 64 expertos y 8 activos por token. Las FFN MoE usan GeGLU con dimensión interna/gate de 1024 sobre una dimensión oculta de 2048. La atención es multi-cabeza con un mecanismo de escalado de temperatura aprendido y dependiente de la posición y de los datos. El encoder visual está basado en SigLIP y emplea concatenación de canales multi-crop para procesar imágenes de alta resolución de forma eficiente en tokens. El tokenizador es un SuperBPE personalizado orientado a eficiencia.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa. Sí se indica que la inferencia usa FlexAttention, por lo que llamar a `.compile()` es crítico para una decodificación rápida; la implementación de `compile` incluye el calentamiento previo.

## Capacidades

- Generación de texto general: el modelo puede usarse sin imagen como modelo de texto.
- Comprensión visual y respuesta a preguntas abiertas sobre imágenes mediante la habilidad `query`.
- Modo de razonamiento activado por defecto en `query`, desactivable con `reasoning=False` para preguntas simples y ahorro de coste.
- Generación de descripciones de imagen en longitudes corta, normal y larga mediante `caption`.
- Localización de puntos (coordenadas x, y normalizadas 0-1) para objetos descritos en lenguaje natural mediante `point`.
- Detección de objetos con cajas delimitadoras normalizadas (x_min, y_min, x_max, y_max) mediante `detect`, con control del número máximo de objetos.
- Salida en streaming con control de temperatura, top-p y máximo de tokens.
- Procesamiento de imágenes de alta resolución mediante encoder SigLIP con multi-crop.
- Soporte de contexto largo de hasta 32.000 tokens.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni otros modos especiales.

## Casos de uso

- Respuesta visual a preguntas en asistentes de accesibilidad: el modelo puede describir el contenido de una imagen y responder preguntas abiertas sobre ella, con modo de razonamiento para escenas complejas y modo directo para consultas simples.
- Generación automática de pies de foto y metadatos: la habilidad `caption` permite producir descripciones cortas, normales o largas para catálogos, archivos multimedia o pipelines de indexación.
- Detección de objetos en imágenes de vigilancia o tráfico: la habilidad `detect` devuelve cajas delimitadoras normalizadas para clases descritas en lenguaje natural, con límite configurable de objetos.
- Análisis de imágenes médicas o industriales asistido: `point` permite localizar elementos concretos mediante coordenadas, útil para anotación semiautomática y revisión humana posterior.
- Procesamiento de documentos con contexto largo: con 32.000 tokens de contexto, puede analizar imágenes junto con texto extenso en tareas de extracción o resumen multimodal.
- Automatización de anotación de datasets: combinación de `detect` y `point` para preetiquetar imágenes antes de la revisión manual, reduciendo el coste de etiquetado.
- Chat multimodal en aplicaciones de atención al cliente: el modelo puede gestionar conversaciones con imágenes adjuntas y respuestas en streaming, aunque la información sobre idiomas es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 9.268 millones de parámetros totales, los pesos en bfloat16 ocupan aproximadamente 18,5 GB; el repo completo ocupa 47,6 GB, lo que sugiere pesos adicionales o artefactos de entrenamiento.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, una GPU con 24 GB o más (RTX 4090, A100 40 GB, H100) sería el mínimo razonable en bfloat16.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en bfloat16, aunque no está confirmado; en cuantizaciones menores no se documentan opciones.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, `dtype=torch.bfloat16` y `device_map={"": "cuda"}`; se requiere `.compile()` para aprovechar FlexAttention. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Moondream 3 Preview | 9,27B totales / ~2B activos | 32K | other | Hugging Face, API cloud |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con modelos concretos de la misma categoría en parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Es una versión preview: la API, los pesos y el comportamiento pueden cambiar sin aviso.
- Licencia "other": no se detallan las condiciones exactas de uso comercial; es necesario revisar los términos del autor antes de producción.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe más allá del inglés.
- Riesgo de alucinación inherente a modelos generativos, especialmente en descripciones de imágenes ambiguas o preguntas abiertas.
- Requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código remoto antes de ejecutarlo en entornos sensibles.
- Dependencia de FlexAttention y de `.compile()` para un rendimiento adecuado; sin ello la decodificación puede ser lenta.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La información sobre cuantizaciones, benchmarks y latencia es inexistente, lo que dificulta la planificación de producción.
- El tamaño del repo (47,6 GB) frente a los pesos en bfloat16 (~18,5 GB) sugiere artefactos adicionales no especificados.

## Enlaces

- Hugging Face: https://huggingface.co/AdelKazzaz/moondream3-preview
- Modelo original referenciado: https://huggingface.co/moondream/moondream3-preview
- Demo: https://moondream.ai/c/playground
- API cloud: https://moondream.ai/c/docs/quickstart
- Notas de la versión: https://moondream.ai/blog/moondream-3-preview
- Tokenizador SuperBPE: https://huggingface.co/moondream/starmie-v1
- FlexAttention: https://pytorch.org/blog/flexattention-for-inference/

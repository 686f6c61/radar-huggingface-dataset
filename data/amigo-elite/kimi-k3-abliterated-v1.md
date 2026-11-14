# AmiGO-Elite/Kimi-K3-Abliterated-V1

## Resumen

Kimi-K3-Abliterated-V1 es una versión modificada del modelo multimodal Kimi-K3 de Moonshot AI, publicada por el usuario AmiGO-Elite en Hugging Face. Se trata de un finetune de tipo "abliterated": una intervención sobre los pesos del modelo base orientada a reducir la probabilidad de que el modelo rechace peticiones (refusals), eliminando según el autor más del 98% de las salvaguardas internas asociadas a la dirección de rechazo. El modelo conserva la arquitectura y capacidades del Kimi-K3 original, pero con el comportamiento de seguridad alterado.

El modelo base Kimi-K3 es un modelo multimodal de tipo image-text-to-text, lo que implica que acepta tanto texto como imágenes como entrada. El repositorio ocupa 1.561 GB, lo que sugiere un modelo de gran escala con pesos en formato safetensors y cuantización mediante compressed-tensors. La model card no detalla el número exacto de parámetros, la longitud de contexto ni la composición del dataset de entrenamiento.

La relevancia de esta ficha es doble: por un lado, documenta una práctica creciente en la comunidad open source (la "abliteración" de modelos para eliminar capas de rechazo); por otro, advierte de que se trata de un modelo sin garantías de seguridad, con licencia restrictiva y sin datos públicos de rendimiento. No se han publicado resultados de benchmarks ni información sobre idiomas soportados más allá de la mención a inglés y japonés en el proceso de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Kimi-K3 de Moonshot AI; multimodal image-text-to-text) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | compressed-tensors (formato declarado en los tags); no se detallan los esquemas concretos |
| Idiomas soportados | no disponible (la model card menciona ajuste para inglés y japonés) |
| Licencia | other, con license_name "kimi-k3" (licencia propia del modelo base, no estándar) |
| Formato de pesos | safetensors (con compressed-tensors) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Kimi-K3 en la documentación proporcionada. Los tags indican que se trata de un modelo multimodal image-text-to-text, con pipeline asociado a esa misma tarea, y que utiliza la librería transformers con código personalizado (custom_code). El repositorio emplea compressed-tensors, lo que indica que los pesos se distribuyen en un formato cuantizado comprimido, aunque no se especifican los esquemas exactos (por ejemplo, FP8, INT8 o INT4).

El proceso de "abliteración" aplicado consiste en una modificación de pesos dirigida a neutralizar la dirección de rechazo del modelo. La model card incluye una tabla que reporta la magnitud de la intervención sobre distintos tensores: se indica una reducción del 98,44% en un tensor de tipo `*.2`, del 98,62% en `*.down_proj`, del 98,60% en `*.embed_tokens`, del 98,54% en `*.o_proj` y del 98,57% en `*.routed_expert_up_proj`. La presencia de tensores `routed_expert_up_proj` sugiere una arquitectura de mezcla de expertos (MoE), aunque no se confirma el número de expertos ni los parámetros activos. No se detalla el dataset de entrenamiento, el número de tokens utilizados ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Kimi-K3.
- Procesamiento de imágenes como entrada (image-text-to-text), lo que permite tareas de descripción, razonamiento visual y respuesta a preguntas sobre imágenes.
- Reducción drástica de rechazos: según el autor, más del 98% de las salvaguardas han sido eliminadas, con ajuste específico para inglés y japonés.
- Capacidad de seguir instrucciones en contextos donde el modelo base tendería a declinar la petición.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso en la información disponible.
- No se documentan capacidades de audio ni modos de "thinking" explícitos.
- Capacidades multilingües: no disponibles más allá de la mención a inglés y japonés.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteración afecta al comportamiento de rechazo en un modelo multimodal de gran escala, comparando respuestas antes y después de la intervención sobre los pesos.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles y que en el modelo base activarían rechazos, con control humano posterior.
- Análisis de contenido visual en entornos de investigación: descripción y extracción de información de imágenes en dominios donde el modelo base podría mostrarse restrictivo, siempre con revisión humana.
- Evaluación de robustez de filtros: uso del modelo como caso de prueba para medir la eficacia de capas de moderación externas en pipelines de producción.
- Experimentación académica con modelos MoE multimodal: estudio del efecto de la modificación de tensores específicos (`down_proj`, `o_proj`, expertos enrutados) sobre el comportamiento general del modelo.
- Pruebas de red teaming: generación de prompts adversarios y evaluación de la respuesta del modelo para diseñar mejores salvaguardas en sistemas propios.
- No se recomienda su uso en atención al cliente, producción comercial ni aplicaciones orientadas al público general, dado que no hay garantías de seguridad ni datos de rendimiento publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El repositorio ocupa 1.561 GB, lo que sugiere que la inferencia requiere hardware de clase servidor con múltiples GPUs de alta memoria (A100 80 GB, H100 80 GB o H200) o un clúster con agregación de memoria.
- GPU recomendadas: no disponibles de forma específica; por el tamaño del repositorio, se requiere al menos un nodo multi-GPU con interconnect de alta velocidad (NVLink) para cargar los pesos completos.
- Viabilidad en GPU de consumo: muy improbable en una sola GPU consumer (RTX 4090 con 24 GB, RTX 5090 con 32 GB). Sería necesario un esquema de cuantización agresiva y offloading a CPU/RAM, con latencia muy elevada.
- Opciones de despliegue: transformers (librería declarada), con soporte de compressed-tensors. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3-Abliterated-V1 (AmiGO-Elite) | no disponible | no disponible | Sí (image-text-to-text) | other ("kimi-k3") | Hugging Face, 0 descargas |
| Kimi-K3 (moonshotai) | no disponible | no disponible | Sí (image-text-to-text) | kimi-k3 | Hugging Face (modelo base) |
| Alternativas abliterated de la comunidad | no disponible | no disponible | Variable | Variable | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo sin salvaguardas efectivas: el autor declara la eliminación de más del 98% de las protecciones, por lo que puede generar contenido dañino, ilegal o sensible sin filtros.
- Riesgo elevado de alucinación y de respuestas incorrectas: no hay benchmarks publicados que permitan evaluar la calidad factual tras la modificación de pesos.
- Licencia restrictiva y no estándar ("other", license_name "kimi-k3"): es imprescindible revisar los términos del modelo base antes de cualquier uso, especialmente comercial.
- Sin datos de idiomas soportados oficialmente; solo se menciona ajuste para inglés y japonés, lo que puede degradar el rendimiento en castellano.
- Sin información sobre longitud de contexto, número de parámetros ni arquitectura exacta, lo que dificulta planificar el despliegue.
- El repositorio es de gran tamaño (1.561 GB) y su descarga y carga requieren infraestructura significativa.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Uso no recomendado en producción orientada al público, atención al cliente ni aplicaciones reguladas sin capas de moderación externas y revisión humana.
- La modificación de pesos puede haber degradado capacidades generales del modelo base (razonamiento, código, matemáticas), aunque no hay datos que lo confirmen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmiGO-Elite/Kimi-K3-Abliterated-V1
- Modelo base Kimi-K3: https://huggingface.co/moonshotai/Kimi-K3
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.

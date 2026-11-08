# mradermacher/InternVL3-2B-GGUF

## Resumen

InternVL3-2B-GGUF es la versión cuantizada en formato GGUF del modelo multimodal InternVL3-2B, desarrollado originalmente por OpenGVLab y convertido a GGUF por el usuario mradermacher. Se trata de un modelo de visión-lenguaje (VLM) de aproximadamente 1.780 millones de parámetros que combina un codificador visual con un modelo de lenguaje basado en la familia Qwen2.5, lo que permite entrada conjunta de imágenes y texto y generación de respuestas conversacionales.

El modelo resuelve el problema de desplegar capacidades multimodales en hardware modesto: al ofrecerse en cuantizaciones que van desde Q2_K (0,9 GB) hasta f16 (3,7 GB), más el proyector multimodal (mmproj) en Q8_0 o f16, puede ejecutarse en GPUs de consumo e incluso en CPU mediante llama.cpp. Está pensado para tareas de descripción de imágenes, respuesta visual a preguntas (VQA), OCR y conversación multimodal en entornos con recursos limitados.

La relevancia actual radica en que InternVL3 es una de las familias multimodales open source más activas, y esta conversión GGUF facilita su integración en herramientas como llama.cpp u Ollama sin necesidad de infraestructura de datacenter. La licencia declarada es Apache 2.0 según los metadatos del modelo base, aunque la model card enlaza a la licencia Qwen2.5-72B-Instruct, lo que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual + LLM basado en Qwen2.5), con código personalizado (`custom_code`) |
| Parametros totales | 1.776.283.136 (aprox. 1,78 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | multilingue (segun metadatos; lista concreta no disponible) |
| Licencia | Apache 2.0 segun metadatos; la model card declara `license: qwen` con enlace a la licencia de Qwen2.5-72B-Instruct (discrepancia a verificar) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

InternVL3-2B sigue la estela de la familia InternVL, que empareja un codificador visual (ViT) con un modelo de lenguaje de gran tamaño mediante un proyector que alinea los embeddings visuales con el espacio del LLM. En este caso el componente lingüístico se apoya en la familia Qwen2.5, tal como refleja la licencia enlazada en la model card. El repositorio GGUF incluye el proyector multimodal como archivo separado (`mmproj`), un patrón habitual en llama.cpp para modelos de visión.

No se dispone de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en la información proporcionada. El modelo base referencia el dataset `OpenGVLab/MMPR-v1.2`, lo que sugiere un entrenamiento orientado a razonamiento multimodal. La conversión a GGUF es estática (sin imatrix); el autor ofrece variantes con imatrix en el repositorio `InternVL3-2B-i1-GGUF`.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes: descripción, respuesta visual a preguntas (VQA) y razonamiento sobre contenido visual.
- Procesamiento conjunto de imagen y texto como entrada (modelo visión-lenguaje).
- Capacidades multilingües según los metadatos del modelo.
- Integración con `transformers` mediante código personalizado (`custom_code`) y con llama.cpp a través de los archivos GGUF.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Descripción automática de imágenes en pipelines de catalogación: el modelo puede generar pies de foto y metadatos descriptivos para grandes volúmenes de imágenes, ejecutándose en una GPU de consumo gracias a sus cuantizaciones de 1-2 GB.
- Respuesta visual a preguntas (VQA) en asistentes de accesibilidad: permite formular preguntas en lenguaje natural sobre una imagen y obtener respuestas textuales, con despliegue local mediante llama.cpp.
- OCR y extracción de información de documentos escaneados: útil para digitalizar facturas, formularios o tickets combinando la entrada visual con la generación de texto estructurado.
- Moderación de contenido visual en entornos con recursos limitados: clasificación y descripción de imágenes para filtros automatizados sin depender de APIs externas.
- Asistente conversacional multimodal en el borde (edge): al caber en cuantización Q4_K_M (1,2 GB), puede integrarse en aplicaciones de escritorio o dispositivos con GPU modesta para conversaciones que incluyan imágenes.
- Prototipado e investigación en visión-lenguaje: su tamaño reducido y formato GGUF facilitan experimentos rápidos en portátiles y estaciones de trabajo sin GPU de datacenter.
- Análisis de capturas de pantalla en herramientas de soporte técnico: el modelo puede interpretar la imagen de una pantalla y responder dudas del usuario en conversación multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del LLM): Q2_K ~0,9 GB; Q4_K_M ~1,2 GB; Q8_0 ~2,0 GB; f16 ~3,7 GB. Añadir ~0,4 GB (mmproj-Q8_0) o ~0,7 GB (mmproj-f16) para la parte visual.
- Cabe en GPUs de consumo: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) y cualquier GPU con 4 GB o más para cuantizaciones Q4/Q5.
- Puede ejecutarse en CPU mediante llama.cpp, aunque la latencia será mayor, especialmente con entrada de imágenes.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF y el mmproj), y `transformers` con el modelo base original en safetensors.
- GPUs recomendadas para mayor throughput: A100, H100 o RTX 4090 si se requiere servir múltiples peticiones concurrentes; para uso individual basta una RTX 3060 o superior.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| InternVL3-2B (este, GGUF) | ~1,78 B | no disponible | Vision + texto | Apache 2.0 / Qwen (discrepancia) | GGUF |
| InternVL3-1B | ~1 B (aprox.) | no disponible | Vision + texto | no disponible | GGUF (variantes i1 disponibles) |
| InternVL3-2B-Instruct | ~1,78 B | no disponible | Vision + texto | no disponible | GGUF |
| Qwen2.5-VL (familia) | no disponible | no disponible | Vision + texto | no disponible | safetensors / GGUF |

La comparación con modelos de la misma categoría (VLM de 1-2 B) queda limitada por la falta de datos públicos de benchmarks y contexto en la información disponible. Las alternativas más directas dentro del ecosistema son las variantes InternVL3-1B e InternVL3-2B-Instruct, también convertidas a GGUF por el mismo autor.

## Limitaciones y advertencias

- Discrepancia de licencia: los metadatos indican Apache 2.0, pero la model card declara `license: qwen` y enlaza a la licencia de Qwen2.5-72B-Instruct. Verificar antes de uso comercial.
- Riesgo de alucinación inherente a los modelos de lenguaje y visión-lenguaje, especialmente en descripciones de imágenes ambiguas o de baja calidad.
- Al ser una cuantización, las versiones Q2_K y Q3 pueden degradar notablemente la calidad; el autor recomienda Q4_K_S/Q4_K_M o superiores.
- Longitud de contexto no documentada en la información disponible; conviene consultar la model card del modelo base.
- Cobertura idiomática concreta no especificada más allá de "multilingüe"; el rendimiento en castellano no está verificado en la información proporcionada.
- Modelo de pequeño tamaño (1,78 B): capacidad de razonamiento y conocimiento factual limitada en comparación con VLM de mayor escala.
- Requiere el archivo `mmproj` para funcionalidad visual; sin él, solo opera como modelo de texto.
- Repositorio con pocas descargas (193) y likes (2) en el momento de la consulta, lo que reduce la validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/InternVL3-2B-GGUF
- Variantes con imatrix: https://huggingface.co/mradermacher/InternVL3-2B-i1-GGUF
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-2B
- Variante Instruct en GGUF: https://huggingface.co/mradermacher/InternVL3-2B-Instruct-GGUF
- Variante 1B pretrained con imatrix: https://huggingface.co/mradermacher/InternVL3-1B-Pretrained-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#InternVL3-2B-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Licencia Qwen2.5-72B-Instruct referenciada: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct/blob/main/LICENSE

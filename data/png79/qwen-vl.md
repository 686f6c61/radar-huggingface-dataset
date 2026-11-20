# PNG79/Qwen-VL

## Resumen

Qwen-VL es un modelo de lenguaje y visión a gran escala (Large Vision Language Model, LVLM) desarrollado por Alibaba Cloud como la extensión multimodal de la familia Qwen (Tongyi Qianwen). Acepta como entrada imágenes, texto y coordenadas de bounding box, y produce como salida texto y bounding boxes, lo que le permite realizar tareas de captioning, VQA, OCR, grounding y detección de objetos guiada por lenguaje natural. Este repositorio concreto (PNG79/Qwen-VL) es una réplica no oficial del checkpoint original de Qwen, publicada por el usuario PNG79, con 19,3 GB de pesos en formato PyTorch y código personalizado (`trust_remote_code`).

El modelo resuelve el problema de unificar comprensión visual y generación de lenguaje en un único transformer multimodal, con soporte nativo de chino e inglés y capacidad de localización abierta (open-domain grounding) en chino. Es relevante porque forma parte de la primera generación de LVLM abiertos de Alibaba, publicada junto al paper arXiv:2308.12966, y sirve como base para variantes posteriores (Qwen-VL-Chat, Qwen-VL-Plus, Qwen-VL-Max).

La información disponible en esta ficha proviene exclusivamente de la model card del repositorio y de los metadatos de Hugging Face. No se especifican en ella el número exacto de parámetros, la longitud de contexto ni los resultados numéricos de benchmarks, por lo que esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LVLM) con encoder visual y LLM Qwen; detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 y bf16 documentados en el ejemplo de uso; existe una variante oficial Int4 (Qwen-VL-Chat-Int4) para el modelo Chat, no para este checkpoint |
| Idiomas soportados | zh, en |
| Licencia | no disponible |
| Formato de pesos | PyTorch (repositorio de 19,3 GB); requiere `trust_remote_code=True` |
| Pipeline | text-generation |
| Entradas | imagen, texto, bounding box |
| Salidas | texto, bounding box |
| Requisitos | Python >= 3.8, PyTorch >= 1.12 (recomendado >= 2.0), CUDA >= 11.4 |

## Arquitectura y entrenamiento

La model card describe Qwen-VL como un modelo de visión y lenguaje a gran escala que acepta imágenes, texto y bounding boxes como entrada y genera texto y bounding boxes como salida. Se distribuye en dos variantes: Qwen-VL (modelo preentrenado, que es el que corresponde a este repositorio) y Qwen-VL-Chat (modelo ajustado para conversación). La arquitectura interna concreta (tipo de encoder visual, número de capas, mecanismo de fusión multimodal) no se detalla en la información proporcionada; para ello la model card remite al memo técnico del repositorio GitHub de QwenLM y al paper arXiv:2308.12966.

Tampoco se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La model card sí menciona que el modelo soporta diálogo multilingüe, diálogo intercalado con múltiples imágenes y localización en dominio abierto en chino, lo que implica un entrenamiento con datos de grounding y pares imagen-texto anotados con cajas. Cualquier dato adicional sobre innovaciones técnicas (decodificación especulativa, atención lineal, etc.) debe consultarse en el paper.

## Capacidades

- Generación de texto condicionada por imagen (image captioning) en chino e inglés.
- Respuesta a preguntas visuales (VQA) de tipo general: atributos, colores, conteo, categorías.
- VQA basada en texto en imagen: preguntas sobre documentos, gráficos y texto incrustado (OCR implícito).
- Grounding y detección: genera bounding boxes a partir de descripciones en lenguaje natural (`<ref>` + `<box>`), con capacidad de localización en dominio abierto en chino.
- Capacidad de dibujar las cajas generadas sobre la imagen mediante `tokenizer.draw_bbox_on_latest_picture`.
- Conversación multimodal multirretorno (diálogo con imágenes), incluyendo diálogo intercalado con múltiples imágenes.
- Soporte multilingüe limitado a chino e inglés.
- No se documenta en la información disponible soporte de tool calling, function calling, modo thinking, audio ni agentes multi-paso.

## Casos de uso

- Descripción automática de imágenes con localización: dado un pipeline de catalogación de imágenes, el modelo genera un caption en inglés o chino junto con las cajas de los objetos mencionados, lo que permite indexar imágenes por objeto y posición sin un detector separado.
- Respuesta a preguntas sobre documentos escaneados: el modelo puede responder preguntas sobre el contenido textual de facturas, formularios o gráficos, adecuado para tareas de extracción de información en backoffice.
- Accesibilidad visual: generación de descripciones detalladas de imágenes para lectores de pantalla, con la ventaja de que el modelo puede referenciar regiones concretas mediante bounding boxes.
- Moderación y análisis de contenido visual: clasificación y descripción de imágenes en pipelines de revisión, aprovechando la capacidad de VQA para preguntas cerradas sobre atributos.
- Anotación asistida de datasets: generación de cajas y etiquetas preliminares para acelerar el etiquetado humano en proyectos de visión por computador, dado que el modelo produce `<box>` directamente.
- Asistente conversacional con imágenes en aplicaciones de comercio electrónico: comparación de productos a partir de fotos, con diálogo multi-turno en chino o inglés.
- Extracción de información de gráficos y tablas: preguntas sobre tendencias y valores en capturas de dashboards, útil en herramientas de business intelligence.

## Benchmarks y rendimiento

La model card menciona que se evaluaron cuatro categorías de tareas multimodales (Zero-shot Caption, General VQA, Text-based VQA y Referring Expression Comprehension) y el benchmark propio TouchStone (300+ imágenes, 800+ preguntas, 27 categorías, puntuación por GPT-4), pero no incluye los valores numéricos en la información proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 19,3 GB en formato PyTorch, lo que sugiere un modelo del orden de decenas de miles de millones de parámetros en fp16; el tamaño exacto no está confirmado en la información disponible.
- Para inferencia en fp16 o bf16 se necesita VRAM suficiente para los pesos completos más el encoder visual y el KV cache; como referencia, un checkpoint de ~19 GB requiere al menos 24 GB de VRAM en una GPU única para cargarse sin cuantizar, y más para contexto largo o imágenes de alta resolución.
- GPU recomendadas: A100 (40/80 GB) o H100 para fp16/bf16 sin compromisos; en consumer, una RTX 3090 o RTX 4090 (24 GB) puede ser ajustada y requerir cuantización o descarga parcial a CPU.
- El ejemplo oficial usa `device_map="auto"` y permite `device_map="cpu"`, por lo que es posible la inferencia en CPU con latencia muy alta.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` es el método documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible; la existencia de `custom_code` complica el soporte en motores de inferencia alternativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Desarrollador | Modalidad | Idiomas | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen-VL (este repo, PNG79) | Alibaba Cloud (réplica de PNG79) | Imagen + texto + bbox | zh, en | no disponible | no disponible | Hugging Face, réplica no oficial |
| Qwen-VL (oficial) | Alibaba Cloud | Imagen + texto + bbox | zh, en | no disponible en la informacion proporcionada | no disponible | Hugging Face (Qwen/Qwen-VL), ModelScope |
| Qwen-VL-Chat | Alibaba Cloud | Imagen + texto + bbox, chat | zh, en | no disponible en la informacion proporcionada | no disponible | Hugging Face, ModelScope, variante Int4 |
| Qwen-VL-Plus / Qwen-VL-Max | Alibaba Cloud | Imagen + texto, API | zh, en | propietaria (API) | no disponible | API DashScope y demos en Spaces |

No se dispone en la información proporcionada de datos de benchmarks que permitan comparar el rendimiento numérico con alternativas de la misma categoría.

## Limitaciones y advertencias

- Este repositorio es una réplica no oficial publicada por el usuario PNG79, con 0 descargas y 0 likes en el momento de la consulta; no debe considerarse la fuente canónica del modelo. Para uso en producción conviene usar el repositorio oficial Qwen/Qwen-VL.
- La licencia no está especificada en los metadatos ni en la model card de este repositorio, por lo que no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del checkpoint oficial antes de desplegarlo.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código Python arbitrario del repositorio; es un riesgo de seguridad en entornos de producción y obliga a auditar el código antes de usarlo.
- Idiomas limitados a chino e inglés; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- Riesgo de alucinación inherente a los LVLM: puede describir objetos o texto inexistentes en la imagen, especialmente en escenas densas o documentos de baja calidad.
- Las bounding boxes generadas pueden ser imprecisas en objetos pequeños, ocluidos o en imágenes de alta resolución.
- No se documentan en la información disponible sesgos específicos, pero al ser un modelo entrenado principalmente con datos en chino e inglés es esperable un sesgo cultural y lingüístico hacia esos contextos.
- El pipeline declarado es `text-generation` y `inference: false` en la model card, lo que indica que la inferencia no está habilitada en el widget de Hugging Face; hay que desplegarlo por cuenta propia.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines agénticos sin trabajo adicional de integración.

## Enlaces

- Repositorio Hugging Face de esta réplica: https://huggingface.co/PNG79/Qwen-VL
- Repositorio oficial Qwen-VL: https://huggingface.co/Qwen/Qwen-VL
- Repositorio oficial Qwen-VL-Chat: https://huggingface.co/Qwen/Qwen-VL-Chat
- Variante Int4 de Qwen-VL-Chat: https://huggingface.co/Qwen/Qwen-VL-Chat-Int4
- ModelScope Qwen-VL: https://modelscope.cn/models/qwen/Qwen-VL/summary
- ModelScope Qwen-VL-Chat: https://modelscope.cn/models/qwen/Qwen-VL-Chat/summary
- Demo Qwen-VL-Plus en Spaces: https://huggingface.co/spaces/Qwen/Qwen-VL-Plus
- Demo Qwen-VL-Max en Spaces: https://huggingface.co/spaces/Qwen/Qwen-VL-Max
- Paper: https://arxiv.org/abs/2308.12966
- Repositorio GitHub: https://github.com/QwenLM/Qwen-VL
- Memo técnico: https://github.com/QwenLM/Qwen-VL/blob/master/visual_memo.md
- Tutorial: https://github.com/QwenLM/Qwen-VL/blob/master/TUTORIAL.md
- Web oficial: https://tongyi.aliyun.com/qianwen
- Documentación de API DashScope: https://help.aliyun.com/zh/dashscope/developer-reference/vl-plus-quick-start
- Discord: https://discord.gg/z3GAxXZ9Ce

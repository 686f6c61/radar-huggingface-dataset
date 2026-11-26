# mossbee/DocSEAM

## Resumen

DocSEAM (Document Sequential Enrichment via Anchored Masking) es un modelo multimodal de tipo image-text-to-text especializado en comprensión de documentos multipágina, desarrollado por Hoang-Nhat Nguyen y Chen Change Loy en S-Lab (Nanyang Technological University, Singapur) en colaboración con Synvo AI. Se construye como un fine-tuning del backbone Qwen/Qwen3.5-9B, al que se añade un encoder de atención cruzada entre páginas y un merger visual entrenado, alcanzando 9.644.940.536 parámetros totales.

El problema que aborda es la pérdida de contexto entre páginas consecutivas en tareas de document question answering: los modelos VLM convencionales procesan cada página de forma aislada o concatenan sus tokens visuales, lo que incrementa el coste computacional y diluye la señal relevante. DocSEAM enriquece las características visuales de cada página con información de sus vecinas inmediatas mediante atención enmascarada anclada al centro y puertas de saliencia direccionales, manteniendo invariante el número de tokens visuales que recibe el modelo de lenguaje.

Su relevancia actual radica en que ofrece una vía para responder preguntas que requieren agregar información distribuida a lo largo de varias páginas (tablas que continúan, referencias cruzadas, figuras referenciadas en texto posterior) sin penalizar el coste de inferencia en tokens de contexto. El checkpoint publicado es la inferencia completa en BF16, distribuida en seis shards de safetensors, e incluye el encoder entre páginas entrenado, la adaptación del modelo de lenguaje fusionada y el merger visual entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) sobre backbone Qwen3.5-9B con encoder de atención cruzada entre páginas (center-anchored masked attention) y directional salience gates |
| Parametros totales | 9.644.940.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | S-Lab License 1.0 (uso no comercial); backbone Qwen3.5-9B bajo Apache-2.0 |
| Formato de pesos | safetensors (seis shards, BF16); requiere `trust_remote_code=True` (`modeling_docseam.py`, `docseam.py`) |

## Arquitectura y entrenamiento

DocSEAM parte de Qwen3.5-9B como modelo de lenguaje y componente de percepción visual, e introduce un mecanismo de enriquecimiento entre páginas. Cada página se procesa para obtener sus características visuales, que se enriquecen con las de las páginas vecinas inmediatas mediante atención enmascarada con anclaje central y puertas de saliencia direccionales. La innovación clave es que este enriquecimiento no incrementa el número de tokens visuales entregados al modelo de lenguaje: se mantiene constante respecto a un VLM de una sola página, de modo que el coste de contexto no crece con el número de páginas procesadas.

El checkpoint publicado integra tres componentes entrenados: el encoder entre páginas, la adaptación del modelo de lenguaje ya fusionada y el merger visual. El repositorio ocupa 19,3 GB y se distribuye en seis shards de safetensors en BF16. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni la presencia de etapas de RLHF o DPO. El modelo se ejecuta con la librería `transformers` mediante `AutoModelForImageTextToText` y `AutoProcessor`, apoyándose en `qwen_vl_utils.process_vision_info` para el preprocesado de imágenes con `image_patch_size` configurable.

## Capacidades

- Comprensión de documentos multipágina: responde preguntas que requieren integrar información de varias páginas consecutivas, con enriquecimiento bidireccional entre páginas vecinas.
- Document question answering: pipeline declarado `image-text-to-text` con tag `document-question-answering`.
- Procesamiento de imágenes con control de resolución: el ejemplo oficial parametriza `min_pixels` (32768) y `max_pixels` (524288) por página.
- Conversación multi-turno: la plantilla de chat se aplica con `apply_chat_template` y soporte de `add_generation_prompt`.
- Modo thinking: la plantilla admite `enable_thinking`, lo que sugiere soporte de razonamiento explícito heredado de Qwen3.5 (el ejemplo oficial lo desactiva).
- Generación determinista y con muestreo: el ejemplo usa `do_sample=False` con `max_new_tokens=128`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponible; el pipeline es exclusivamente image-text-to-text.

## Casos de uso

- Preguntas sobre artículos científicos: el modelo puede responder cuestiones que exigen localizar un dato en una página y contrastarlo con una tabla o figura de otra, como el ejemplo oficial (número de cabezas de atención paralelas en *Attention Is All You Need*). El enriquecimiento entre páginas evita que la respuesta dependa de una sola página.
- Revisión de contratos y documentación legal: permite consultar cláusulas que se extienden a lo largo de varias páginas o que remiten a anexos, manteniendo el recuento de tokens visuales constante y por tanto un coste de inferencia predecible.
- Análisis de informes financieros: útil para extraer cifras de estados contables cuyas tablas continúan en páginas posteriores y para cruzar notas al pie con el cuerpo del informe.
- Procesamiento de expedientes administrativos: facilita responder consultas sobre formularios, anexos y resoluciones que comparten referencias cruzadas entre páginas.
- Asistencia en investigación documental: permite construir interfaces de consulta sobre corpus de PDFs donde el usuario pregunta en lenguaje natural y el modelo agrega evidencia de páginas contiguas.
- Extracción de datos en pipelines de digitalización: al conservar el número de tokens visuales, se puede integrar en procesos batch donde el coste por página debe permanecer acotado independientemente de la longitud del documento.
- Soporte a revisión técnica de patentes y normativa: adecuado para preguntas que requieren relacionar descripciones, reivindicaciones y dibujos distribuidos en varias páginas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una figura de resultados (`assets/overview.jpg`) y una visualización de atención entre páginas, pero no se han transcrito cifras numéricas de MMLU, DocVQA, MP-DocVQA ni de otras evaluaciones en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint es BF16 con 9.644.940.536 parámetros, lo que supone aproximadamente 19,3 GB solo en pesos; hay que sumar activaciones y caché KV, que crecen con el número y la resolución de las páginas.
- GPU recomendadas: la model card indica seleccionar una GPU CUDA con memoria suficiente para los pesos BF16 más activaciones y caché. Por el tamaño, una A100 de 40 GB o 80 GB, una H100 o una L40S de 48 GB son opciones razonables; no se especifican modelos concretos en la documentación.
- GPU de consumo: no cabe en GPUs de consumo de 16 GB en BF16. En tarjetas de 24 GB (RTX 3090, RTX 4090) el margen es muy ajustado y depende del número y resolución de páginas; no hay datos oficiales que lo confirmen.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `AutoModelForImageTextToText`, `AutoProcessor`, `device_map={"": "cuda:0"}` y `trust_remote_code=True`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la presencia de código personalizado (`modeling_docseam.py`, `docseam.py`) complica su integración en motores de inferencia alternativos.
- Cuantización: no se publican pesos GGUF, AWQ ni GPTQ; habría que generarlos a partir del checkpoint BF16.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque multipágina | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DocSEAM | 9.644.940.536 | no disponible | Atención cruzada entre páginas con tokens visuales constantes | S-Lab License 1.0 (no comercial) | Hugging Face (mossbee/DocSEAM), código en GitHub |
| Qwen3.5-9B (base) | ~9B | no disponible | Procesamiento página a página sin enriquecimiento entre páginas | Apache-2.0 | Hugging Face (Qwen/Qwen3.5-9B) |
| VLMs de document understanding de propósito general | no disponible | no disponible | Concatenación de páginas o procesamiento independiente | variable | variable |

La comparación con alternativas específicas de document understanding no puede completarse con los datos disponibles; no se han proporcionado métricas comparativas ni modelos de referencia en la información.

## Limitaciones y advertencias

- Licencia no comercial: DocSEAM se distribuye bajo S-Lab License 1.0 para uso no comercial. Cualquier despliegue en producción con fines comerciales requiere autorización expresa; el backbone Qwen3.5-9B conserva su licencia Apache-2.0 en `LICENSE-QWEN`.
- Requiere `trust_remote_code=True`: la arquitectura se carga desde código Python incluido en el repositorio del modelo, lo que implica ejecutar código de terceros y auditar `modeling_docseam.py` y `docseam.py` antes de usarlo en entornos sensibles.
- Riesgo de alucinación: como VLM generativo, puede producir respuestas plausibles pero no sustentadas en el documento, especialmente en tablas densas o texto de baja calidad de escaneo. El ejemplo oficial fuerza `do_sample=False` para reducir variabilidad, pero no elimina el riesgo.
- Consumo de memoria dependiente de las páginas: la memoria pico crece con el número y la resolución de páginas, lo que limita el número de páginas procesables simultáneamente en GPUs de gama media.
- Idiomas soportados no documentados: no se especifica cobertura lingüística; conviene validar el rendimiento en castellano antes de adoptarlo.
- Longitud de contexto no documentada: se desconoce el máximo de páginas o tokens que admite el modelo.
- Sin benchmarks publicados en la información disponible: no es posible comparar su rendimiento con alternativas de forma cuantitativa.
- Madurez temprana: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se documentan pesos cuantizados ni integraciones con motores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mossbee/DocSEAM
- Página del proyecto: https://mossbee.github.io/projects/DocSEAM/
- Artículo en arXiv: https://arxiv.org/abs/2611.34420
- Repositorio de código: https://github.com/mossbee/DocSEAM
- Página del autor Hoang-Nhat Nguyen: https://mossbee.github.io/
- Página de Chen Change Loy (MMLab@NTU): https://www.mmlab-ntu.com/person/ccloy/
- Synvo AI: https://synvo.ai/
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B

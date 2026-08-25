# nectec/Pathumma-llm-vision-3.0.0-preview

## Resumen

Pathumma Vision 3.5-2B es un modelo de lenguaje y visión (VLM) desarrollado por NECTEC, el centro tecnológico nacional de Tailandia, sobre la base de Qwen3.5-2B. Está específicamente afinado para tareas de reconocimiento óptico de caracteres (OCR) y comprensión de imágenes, con un énfasis particular en el tailandés y en documentos y texto de escena del mundo real. El modelo se entrenó con 377.000 muestras de OCR mediante supervisión fina (SFT), lo que lo convierte en una opción compacta y eficiente para despliegues de OCR en entornos con recursos limitados.

La relevancia de este modelo radica en su especialización lingüística: el tailandés presenta desafíos únicos para OCR debido a su sistema de escritura complejo, y Pathumma Vision 3.5-2B aborda directamente esta necesidad. Al estar basado en Qwen3.5-2B, hereda la arquitectura del modelo base, pero su entrenamiento específico lo orienta hacia la extracción de texto de imágenes, tanto de documentos escaneados como de fotografías de escenas reales. Con aproximadamente 2.200 millones de parámetros, se posiciona como una alternativa ligera frente a modelos multimodales de mayor tamaño.

El modelo se distribuye en formato safetensors y está pensado para su uso con la librería Transformers de Hugging Face. Aunque la licencia no está especificada en la información disponible, el modelo es de acceso público en Hugging Face y su uso previsto incluye aplicaciones de OCR y comprensión de documentos en tailandés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-2B (modelo de lenguaje y vision, basado en transformer) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | th (tailandes) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-2B, un modelo de lenguaje de la familia Qwen que incorpora capacidades multimodales (visión y texto). No se dispone de detalles adicionales sobre la arquitectura interna (número de capas, dimensiones de atención, etc.) en la información proporcionada. Al ser un modelo de 2.200 millones de parámetros, se asume una arquitectura transformer densa, aunque no se confirma si emplea algún mecanismo especial como atención lineal o decodificación especulativa.

El entrenamiento consistió en un ajuste fino supervisado (SFT) sobre 377.000 muestras de OCR, con una tasa de aprendizaje de 1.0e-5, tres épocas, programador de tasa de aprendizaje coseno y acumulación de gradientes de 2. El hardware utilizado fueron cuatro GPU NVIDIA A100. El objetivo principal era mejorar el rendimiento en OCR tailandés y en imágenes de documentos y escenas reales, lo que sugiere que el dataset de entrenamiento incluye una mezcla de imágenes de texto impreso, manuscrito y escenas naturales.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) en tailandés, tanto en documentos escaneados como en imágenes de escenas reales.
- Comprensión de imágenes y generación de texto a partir de entradas visuales (image-to-text).
- Extracción de texto de documentos, incluyendo posiblemente tablas, formularios y otros formatos estructurados.
- Procesamiento de imágenes con texto multilingüe, aunque el foco principal es el tailandés.
- Integración con el ecosistema Transformers de Hugging Face, permitiendo su uso con `AutoProcessor` y `Qwen3_5ForConditionalGeneration`.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni modos de pensamiento explícitos en la información disponible.

## Casos de uso

- Digitalización de documentos tailandeses: el modelo puede extraer texto de escaneos de contratos, facturas, formularios gubernamentales y otros documentos administrativos, facilitando su conversión a formatos digitales editables.
- Reconocimiento de texto en fotografías de escenas reales: útil para aplicaciones de traducción en tiempo real, lectura de carteles, señales de tráfico o menús en tailandés capturados con un smartphone.
- Automatización de procesos de entrada de datos: integrado en pipelines de back-office, puede transcribir automáticamente información de imágenes a bases de datos, reduciendo el trabajo manual en empresas que manejan documentación en tailandés.
- Asistencia a personas con discapacidad visual: el modelo puede describir el contenido textual de imágenes capturadas por el usuario, ayudando en la lectura de etiquetas, documentos o pantallas.
- Archivado y búsqueda de documentos históricos: permite indexar archivos escaneados en tailandés, habilitando búsquedas por contenido en repositorios digitales.
- Desarrollo de aplicaciones móviles de OCR: al ser un modelo compacto de 2.200 millones de parámetros, puede desplegarse en servidores ligeros o incluso en dispositivos con suficiente memoria, ofreciendo OCR tailandés de alta calidad sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K o métricas específicas de OCR (por ejemplo, precisión de caracteres o F1) para este modelo. Tampoco se ofrecen comparaciones cuantitativas con otros modelos de OCR tailandés o VLM similares.

## Requisitos de hardware

- Tamaño del repositorio: 4,4 GB, lo que sugiere que los pesos en precisión bfloat16 ocupan aproximadamente esa cantidad.
- VRAM estimada para inferencia: con 2.213 millones de parámetros, en bfloat16 se necesitan al menos 4,4 GB solo para los pesos, más memoria para activaciones y overhead. Una GPU con 8 GB de VRAM (por ejemplo, RTX 3070/4060) sería suficiente para inferencia básica. Con cuantización de 4 bits, la huella de memoria podría reducirse a alrededor de 1,2 GB, permitiendo su uso en GPUs con 4 GB o incluso en CPU con suficiente RAM.
- GPU recomendadas: NVIDIA A100 (usada en entrenamiento), pero para inferencia cualquier GPU moderna con al menos 8 GB de VRAM es adecuada. También puede ejecutarse en GPUs consumer como RTX 3090, RTX 4090 o incluso RTX 3060 con cuantización.
- Opciones de despliegue: el modelo es compatible con Transformers de Hugging Face, por lo que puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). También puede ejecutarse directamente con el script de ejemplo proporcionado en la model card.
- Latencia y throughput: no se dispone de datos oficiales. Para un modelo de 2.200 millones de parámetros, se espera una latencia de decodificación de decenas de milisegundos por token en una GPU moderna, pero estos valores dependen del hardware y la implementación.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo. Como referencia, otros VLM pequeños orientados a OCR incluyen Qwen2-VL-2B (base del modelo) y PaliGemma-3B, pero no se conocen resultados de Pathumma Vision 3.5-2B frente a ellos. La comparativa queda pendiente de la publicación de benchmarks oficiales.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente con datos de OCR tailandés, puede tener un rendimiento inferior en otros idiomas o sistemas de escritura.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto que no corresponde fielmente al contenido de la imagen, especialmente en imágenes ambiguas o de baja calidad.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, por lo que no se conoce el límite de tokens de entrada para el texto acompañante.
- Restricciones de licencia: la licencia no está disponible en la información pública, lo que genera incertidumbre sobre el uso comercial y la redistribución. Se recomienda contactar con NECTEC para aclarar los términos.
- Limitaciones de idioma: el modelo está etiquetado únicamente con el idioma tailandés, por lo que su uso en otros idiomas puede ser subóptimo.
- Advertencia para producción: al ser una versión "preview" (3.0.0-preview), puede contener errores o comportamientos no pulidos. Se recomienda validar exhaustivamente antes de desplegarlo en entornos críticos.

## Enlaces

- [Hugging Face: nectec/Pathumma-llm-vision-3.0.0-preview](https://huggingface.co/nectec/Pathumma-llm-vision-3.0.0-preview)
- [Hugging Face: nectec/Pathumma-llm-vision-1.0.0](https://huggingface.co/nectec/Pathumma-llm-vision-1.0.0)
- [NECTEC - Pathumma LLM (página oficial)](https://www.nectec.or.th/innovation/innovation-service/pathumma-llm.html)
- [NSTDA - Pathumma LLM: AI Technology Tailored to Thai Context and Culture](https://www.nstda.or.th/en/news/news-years-2025/pathumma-llm-ai-technology-tailored-to-thai-context-and-culture.html)
- [Thai Times - NECTEC Unveils Pathumma LLM](https://thaitimes.com/nectec-unveils-pathumma-llm-thailand-s-open-ai-model-for-localized-and-multi-modal-applications)

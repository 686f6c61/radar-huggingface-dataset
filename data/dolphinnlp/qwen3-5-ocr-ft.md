# dolphinnlp/qwen3.5-ocr-ft

## Resumen

dolphinnlp/qwen3.5-ocr-ft es un ajuste fino (SFT) del modelo xiaomi-research/Xiaomi-OCR-0, publicado por el usuario dolphinnlp. A pesar del nombre comercial "qwen3.5-ocr-ft", la arquitectura subyacente corresponde al modelo base de Xiaomi Research etiquetado como `qwen3_5` en el repositorio, y no a un Qwen 3.5 oficial de Alibaba. El modelo está orientado a tareas de imagen-a-texto (OCR multimodal), con pipeline `image-text-to-text`.

El modelo cuenta con 873.438.784 parámetros (aproximadamente 0,87 mil millones), lo que lo sitúa en la gama de modelos pequeños y desplegables en hardware de consumo. Ha sido entrenado mediante SFT con las librerías TRL 0.22.2, Transformers 5.2.0, PyTorch 2.8.0 y Unsloth, según los tags del repositorio. Su licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

La relevancia actual del modelo radica en su tamaño reducido para una tarea de OCR multimodal, lo que facilita su despliegue en entornos con recursos limitados. Sin embargo, la model card es extremadamente escasa: no documenta el dataset de entrenamiento, no incluye benchmarks y el ejemplo de uso rápido emplea `text-generation` en lugar de `image-text-to-text`, lo que sugiere una plantilla autogenerada sin validación específica para la tarea OCR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), etiqueta `qwen3_5` |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del checkpoint xiaomi-research/Xiaomi-OCR-0. La etiqueta de arquitectura `qwen3_5` en Hugging Face indica que el modelo base sigue el diseño de la familia Qwen 3.5, con un componente de visión para procesamiento de imágenes y un decodificador de lenguaje. No se dispone de información detallada sobre el número de capas, dimensión oculta, número de cabezas de atención ni configuración del encoder visual.

El entrenamiento se realizó con TRL (SFTTrainer) y Unsloth, según los tags y la model card. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF/DPO posteriores ni qué datos específicos de OCR se utilizaron. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El run de entrenamiento está registrado en Weights & Biases (ver enlaces), pero los detalles no se reproducen en la model card.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text), orientada a tareas de OCR y extracción de texto.
- Procesamiento de imágenes y documentos para transcripción de texto, según el pipeline declarado.
- Conversación multi-turno en formato de chat (el ejemplo de la model card usa una lista de mensajes con roles).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking, visión avanzada, audio: no disponible (no documentado).

## Casos de uso

- Digitalización de documentos escaneados: el modelo puede recibir una imagen de un documento y devolver el texto transcrito, aprovechando su naturaleza image-text-to-text y su tamaño reducido para ejecutarse en una sola GPU.
- Extracción de texto de capturas de pantalla: útil para pipelines de automatización que necesiten convertir capturas en texto estructurado, con la ventaja de un modelo de menos de 1B de parámetros que reduce costes de inferencia.
- Procesamiento de facturas y recibos: el modelo puede integrarse en un flujo OCR previo a un parser de campos, siempre que se valide su precisión en dominios específicos, ya que no hay benchmarks publicados.
- Indexación de archivos PDF convertidos a imagen: para sistemas de búsqueda documental que requieran extraer texto de páginas escaneadas antes de generar embeddings.
- Preprocesamiento en pipelines RAG: usar el modelo como etapa OCR ligera antes de pasar el texto a un modelo de lenguaje mayor, reduciendo la carga computacional del sistema completo.
- Prototipado e investigación en OCR multimodal: al ser un fine-tune pequeño y con licencia Apache 2.0, sirve como base para experimentación académica y para ajustes posteriores en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 873 millones de parámetros, en FP16 se requieren aproximadamente 1,7 GB solo para pesos; en BF16 similar. En cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, aproximadamente 0,5 GB (estimación teórica, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16 considerando overhead de activaciones y el encoder visual; RTX 3060, RTX 4060, RTX 4090, A100, H100 son suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas con 6 GB o más de VRAM.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI si soportan la arquitectura `qwen3_5` multimodal; llama.cpp/Ollama solo si se publican pesos GGUF, que no están disponibles actualmente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Modalidad | Disponibilidad |
|---|---|---|---|---|---|
| dolphinnlp/qwen3.5-ocr-ft | 873 M | no disponible | Apache 2.0 | image-text-to-text | Hugging Face |
| xiaomi-research/Xiaomi-OCR-0 (base) | no disponible | no disponible | no disponible | image-text-to-text | Hugging Face |
| Qwen2.5-VL-3B | 3 B | 32 K (aprox.) | Apache 2.0 | image-text-to-text | Hugging Face |
| Florence-2-base | 232 M | no disponible | MIT | image-text-to-text | Hugging Face |

La comparativa con Qwen2.5-VL-3B y Florence-2-base se ofrece como referencia de categoría (modelos multimodales pequeños para OCR/visión), pero no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, por lo que se desconoce la distribución de datos y los posibles sesgos introducidos.
- Riesgo de alucinación en la transcripción: al ser un modelo generativo, puede inventar texto que no aparece en la imagen, especialmente en documentos con baja calidad o layouts complejos.
- Limitación de idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no documentada: no se puede asegurar el manejo de documentos largos o imágenes de alta resolución.
- El ejemplo de la model card usa `text-generation` en lugar de `image-text-to-text`, lo que indica que la documentación no está adaptada a la tarea real del modelo.
- El nombre "qwen3.5" puede inducir a confusión: no es un modelo oficial de Alibaba, sino un fine-tune de un modelo base de Xiaomi Research.
- No se han publicado benchmarks, por lo que la calidad del OCR no está validada de forma independiente.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base cuya licencia no se detalla en la información disponible, conviene verificar la licencia del checkpoint original antes de desplegar en producción.
- El tamaño del repositorio (205,6 GB) es desproporcionado para 873 M de parámetros, lo que sugiere que contiene múltiples checkpoints o artefactos de entrenamiento; conviene revisar qué archivos se descargan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dolphinnlp/qwen3.5-ocr-ft
- Modelo base: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Run de entrenamiento en Weights & Biases: https://wandb.ai/infinity-ox-box/huggingface/runs/ee6mlz3i
- Repositorio TRL: https://github.com/huggingface/trl
- Repositorio Unsloth: https://github.com/unslothai/unsloth

# holooo/Xiaomi-OCR-0-Q2_K-GGUF

## Resumen

Xiaomi-OCR-0 es un modelo de visión-lenguaje (VLM) especializado en OCR y comprensión de documentos, desarrollado por Xiaomi Research. Resuelve el problema de extraer texto, estructura y campos clave de imágenes de documentos (facturas, formularios, tablas, tickets) combinando percepción visual con generación de texto estructurado. La ficha que nos ocupa, `holooo/Xiaomi-OCR-0-Q2_K-GGUF`, es una cuantización en formato GGUF del modelo original, generada automáticamente mediante el espacio GGUF-my-repo de ggml.ai y publicada por el usuario holooo.

El modelo base cuenta con 772.845.888 parámetros en safetensors, lo que lo sitúa en la franja de los modelos pequeños (sub-1B), adecuado para despliegue en entornos con recursos limitados. La cuantización Q2_K reduce el peso a aproximadamente 0,4 GB, lo que permite ejecutarlo en CPU y en GPUs de consumo modestas mediante llama.cpp. La licencia es Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales.

Su relevancia actual radica en la demanda creciente de pipelines de document AI ligeros y desplegables en local: el modelo está etiquetado para OCR, parsing de documentos, VQA y extracción de información clave, y su tamaño reducido lo hace viable para procesamiento por lotes en infraestructura modesta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language model (detalles de la arquitectura interna no disponibles) |
| Parámetros totales | 772.845.888 (modelo base en safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de llama-server usa `-c 2048`) |
| Tipos de cuantización | Q2_K (esta ficha); otras cuantizaciones no disponibles en la información proporcionada |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta ficha); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Se trata de un modelo multimodal de tipo image-text-to-text, etiquetado como vision-language-model, orientado a tareas de OCR y comprensión de documentos. El dataset de entrenamiento aparece referenciado como `custom-ocr-centric-corpus`, lo que sugiere un corpus centrado en imágenes de documentos y pares texto-imagen de tipo OCR, aunque no se especifica el número de tokens ni la composición exacta.

No se dispone de información sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineación, ni sobre innovaciones técnicas específicas como decodificación especulativa o atención lineal. La cuantización Q2_K de esta ficha se generó con llama.cpp a partir del checkpoint original, sin modificaciones arquitectónicas más allá de la compresión de pesos.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Parsing de documentos: extracción de estructura (tablas, campos, secciones) según las etiquetas del modelo (document-parsing).
- Comprensión de documentos (document-understanding) más allá del texto plano.
- Visual question answering (VQA) sobre imágenes de documentos.
- Extracción de información clave (key-information-extraction) de formularios y facturas.
- Generación de texto condicionada a imagen (pipeline image-text-to-text).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, agentes o thinking mode: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de facturas y tickets: el modelo puede recibir la imagen de una factura y devolver los campos clave (importe, fecha, emisor) en formato estructurado, gracias a su entrenamiento en un corpus centrado en OCR y extracción de información.
- Extracción de tablas de informes escaneados: adecuado para convertir tablas en imágenes a representaciones textuales estructuradas, tarea para la que el modelo declara métricas de TEDS.
- Procesamiento por lotes en servidor modesto: con 772M de parámetros y una cuantización Q2_K de ~0,4 GB, se puede ejecutar en CPU o GPU de gama baja mediante llama.cpp, lo que permite desplegar pipelines de document AI sin infraestructura dedicada.
- Atención al cliente con documentos adjuntos: el modelo puede interpretar capturas o fotos enviadas por usuarios y responder preguntas sobre su contenido (VQA), integrándose en un flujo conversacional.
- Enriquecimiento de archivos históricos: OCR y parsing de documentos escaneados para indexación y búsqueda posterior en sistemas de gestión documental.
- Validación de formularios en movilidad: al ser un modelo pequeño y cuantizable, puede ejecutarse en entornos con recursos limitados para verificar que un formulario rellenado contiene los campos esperados.
- Prototipado rápido de OCR con llama.cpp: útil para evaluar la viabilidad de un pipeline de document parsing antes de invertir en modelos mayores, usando los comandos de llama-cli y llama-server documentados en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card menciona las métricas `accuracy`, `teds` y `cdm` como métricas de evaluación del modelo base, pero no se incluyen valores concretos. No se deben inferir cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB para los pesos en Q2_K, más overhead de contexto y del codificador visual; una estimación conservadora es de 1-2 GB en total, aunque no hay datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para ejecución completa en GPU; también viable en CPU.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1050 Ti, GTX 1650, RTX 3050 y superiores, así como en Apple Silicon mediante Metal.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y por extensión entornos compatibles con GGUF. La model card solo documenta llama.cpp; vLLM, TGI u Ollama no se mencionan explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Cualquier comparación con otros modelos de OCR (por ejemplo, variantes de Donut, TrOCR o VLMs pequeños) requeriría benchmarks que no se han publicado aquí.

## Limitaciones y advertencias

- La cuantización Q2_K es agresiva: puede degradar la precisión del OCR y la calidad de la extracción estructurada respecto al modelo original en safetensors.
- No se dispone de información sobre sesgos del modelo base ni sobre su comportamiento en dominios distintos al corpus de entrenamiento.
- Riesgo de alucinación inherente a los modelos generativos: puede inventar campos o texto no presentes en la imagen, especialmente en documentos de baja calidad.
- Idiomas soportados no documentados; no se debe asumir cobertura multilingüe sin verificación.
- Longitud de contexto no documentada; el ejemplo de la model card usa 2048 tokens, lo que puede ser insuficiente para documentos densos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la model card del modelo base para condiciones adicionales.
- Esta ficha es una conversión automática de terceros (usuario holooo), no una publicación oficial de Xiaomi; para producción conviene validar contra el checkpoint original.
- El modelo tiene solo 42 descargas y 0 likes en el momento de la ficha, lo que indica escasa validación comunitaria.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/holooo/Xiaomi-OCR-0-Q2_K-GGUF
- Modelo base: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp

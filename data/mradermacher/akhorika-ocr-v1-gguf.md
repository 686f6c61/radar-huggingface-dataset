# mradermacher/akhorika-ocr-v1-GGUF

## Resumen

Akhorika OCR v1 es un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) para asamés (assamese, código `as`), una lengua indoaria hablada principalmente en el estado indio de Assam. El modelo original lo desarrolla ananddey, mientras que la versión aquí descrita es una cuantización estática en formato GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones para llama.cpp y ecosistemas compatibles. El modelo resuelve la digitalización de documentos en asamés, un idioma con escasa cobertura en herramientas OCR comerciales y en modelos fundacionales multilingües.

La ficha se centra en la variante GGUF, que conserva la arquitectura del modelo base con 752.167.744 parámetros totales (aproximadamente 752 millones) y se distribuye en múltiples niveles de cuantización, desde Q2_K (0,5 GB) hasta f16 (1,6 GB), incluyendo ficheros `mmproj` separados para el codificador visual. El tamaño reducido permite desplegarlo en hardware de consumo, lo que resulta relevante para proyectos de preservación lingüística y digitalización documental con presupuesto limitado.

La relevancia actual radica en la combinación de tres factores: especialización en un idioma de bajos recursos, formato GGUF listo para inferencia local y licencia y documentación del modelo base que conviene verificar antes de un uso comercial. No se han publicado datos de benchmarks ni especificaciones detalladas de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (transformers); detalles del backbone no disponibles |
| Parametros totales | 752.167.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | Asamés (`as`) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `ananddey/akhorika-ocr-v1` es un modelo de visión-lenguaje orientado a OCR y document AI, con 752 millones de parámetros y soporte para el idioma asamés. La información disponible no detalla la arquitectura interna (familia del backbone, tipo de codificador visual, mecanismo de proyección multimodal) ni los datos de entrenamiento: no se especifican el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado.

La variante GGUF es una cuantización estática generada por mradermacher con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, una conversión directa desde pesos Hugging Face sin cuantización ponderada por imatrix (el autor indica que las cuantizaciones con imatrix no estaban disponibles en el momento de la publicación). El repositorio incluye ficheros `mmproj` separados que contienen el proyector multimodal necesario para el procesamiento de imágenes en llama.cpp.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos en asamés.
- Procesamiento de visión-lenguaje: el modelo recibe imágenes y genera texto, gracias al proyector multimodal incluido en los ficheros `mmproj`.
- Document AI: orientado a la extracción de texto de documentos escaneados o fotografías.
- Soporte multilingüe limitado al asamés (`as`) según los metadatos del modelo.
- Compatibilidad con endpoints (`endpoints_compatible`) y uso conversacional según las etiquetas del repositorio.
- No se ha documentado soporte de tool calling, function calling, agentes, modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Digitalización de prensa histórica en asamés: el modelo puede transcribir páginas escaneadas de periódicos y revistas, facilitando la creación de archivos de texto buscables para bibliotecas y hemerotecas regionales.
- Preservación de patrimonio documental: archivos y universidades de Assam pueden usar la cuantización Q8_0 (0,9 GB) en estaciones de trabajo sin GPU dedicada para convertir manuscritos y documentos administrativos en texto plano.
- Automatización de trámites administrativos: extracción de campos de formularios oficiales en asamés para su volcado a bases de datos, reduciendo la entrada manual en oficinas públicas.
- OCR en dispositivos de borde: al caber en 0,5-0,9 GB, puede ejecutarse en mini-PC o portátiles modestos mediante llama.cpp, útil para oficinas con conectividad limitada.
- Investigación lingüística: generación de corpus anotados en asamés a partir de material impreso para estudios de morfología, sintaxis o lexicografía.
- Integración en pipelines de digitalización masiva: combinado con herramientas de preprocesado de imágenes (deskew, binarización), el modelo puede procesar lotes de documentos en servidores con CPU o GPU de gama media.
- Aplicaciones educativas: digitalización de libros de texto en asamés para crear materiales accesibles o buscables para estudiantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre 0,5 y 0,9 GB para las cuantizaciones Q2_K a Q8_0 (más el proyector multimodal `mmproj`, de 0,7 a 1,0 GB adicionales); hasta 1,6 GB para f16.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM efectiva; tarjetas de consumo como GTX 1650, RTX 3050, RTX 4060 o superiores son suficientes. Para despliegues en servidor, A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) son los entornos naturales para GGUF; también es posible usar el modelo base en safetensors con transformers.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del tamaño de imagen de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| akhorika-ocr-v1 (GGUF) | 752 M | No disponible | Asamés | No disponible | GGUF |
| Tesseract OCR (asamés) | No aplica (motor clásico) | No aplica | Asamés (modelo de idioma) | Apache 2.0 | Binario propio |
| GOT-OCR2.0 | 580 M | No disponible | Multilingüe | Apache 2.0 | Safetensors |
| Qwen2-VL-2B | 2,2 B | 32 768 | Multilingüe | Apache 2.0 | Safetensors, GGUF |

La comparativa con Tesseract es relevante porque es el motor OCR clásico más extendido y dispone de datos de entrenamiento para asamés; Akhorika OCR v1 aporta un enfoque neuronal de visión-lenguaje que puede manejar tipografías y degradaciones más difíciles, aunque no hay benchmarks públicos que lo confirmen. Frente a GOT-OCR2.0 y Qwen2-VL-2B, el modelo de ananddey es más pequeño y está especializado en un solo idioma, lo que reduce su huella de despliegue pero limita su aplicabilidad fuera del asamés. Los datos de licencia y contexto de Akhorika no están disponibles, lo que impide una comparación completa.

## Limitaciones y advertencias

- Especialización monolingüe: solo cubre asamés (`as`); no es fiable para otros idiomas indoarios o para inglés.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base `ananddey/akhorika-ocr-v1` antes de desplegarlo en producción.
- Riesgo de alucinación: como todo modelo generativo de visión-lenguaje, puede inventar texto o caracteres que no aparecen en la imagen, especialmente con documentos degradados o tipografías inusuales.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precisión (CER/WER) frente a alternativas, lo que dificulta estimar su calidad real.
- Contexto y resolución de imagen no documentados: se desconoce la longitud máxima de secuencia y las dimensiones de imagen óptimas, lo que puede afectar a documentos de gran tamaño.
- Cuantizaciones agresivas: Q2_K y Q3_K pueden degradar notablemente la precisión del OCR; para producción se recomienda Q5_K_M o Q8_0.
- Fecha de creación futura en los metadatos (2026): conviene tratar los datos del repositorio con cautela y verificar la integridad de los ficheros.
- Sin garantías de mantenimiento: el repositorio de cuantización no muestra descargas ni interacción de la comunidad, lo que sugiere poca validación externa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/akhorika-ocr-v1-GGUF
- Modelo base: https://huggingface.co/ananddey/akhorika-ocr-v1
- Página de resumen de cuantizaciones de mradermacher: https://hf.tst.eu/model#akhorika-ocr-v1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Listado de modelos de mradermacher: https://huggingface.co/mradermacher/models
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

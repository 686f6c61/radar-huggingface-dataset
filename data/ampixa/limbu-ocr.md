# ampixa/limbu-ocr

## Resumen

`ampixa/limbu-ocr` es un modelo de reconocimiento óptico de caracteres (OCR) especializado en la escritura limbu (también conocida como sirijonga o yakthung), una escritura alfasilábica utilizada por la comunidad limbu en Nepal, Sikkim y el noreste de la India. Lo publica el usuario `ampixa` en Hugging Face bajo licencia Apache 2.0 y está construido sobre la librería PaddleOCR, concretamente sobre la familia PP-OCRv5, que constituye la base tecnológica del pipeline de detección y reconocimiento de texto.

El modelo resuelve un problema de nicho pero relevante para la preservación lingüística y la digitalización documental: la práctica totalidad de los sistemas OCR comerciales y open source no cubren escrituras de bajos recursos como el limbu. Al estar etiquetado con los códigos de idioma `lif` (limbu) y `ne` (nepalí), apunta a un uso combinado en documentos nepalíes que mezclan ambas escrituras, algo habitual en contextos administrativos y educativos de la región.

Es relevante ahora porque los modelos PP-OCRv5 de PaddleOCR han demostrado que es posible adaptar pipelines OCR ligeros a escrituras minoritarias con recursos limitados, y porque el acceso al modelo está restringido (gated), lo que sugiere que el autor controla su distribución. El repositorio tiene un tamaño declarado de 0.0 GB y cero descargas en el momento de la consulta, lo que indica una publicación muy reciente (28 de noviembre de 2026) y sin adopción todavía.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PaddleOCR (familia PP-OCRv5), pipeline de detección + reconocimiento de texto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | limbu (`lif`), nepalí (`ne`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0.0 GB; presumiblemente pesos Paddle, no confirmado) |

## Arquitectura y entrenamiento

El modelo se apoya en PaddleOCR, la librería de OCR de Baidu, y en la familia PP-OCRv5, que típicamente combina un detector de regiones de texto (basado en segmentación tipo DB, Differentiable Binarization) con un reconocedor de secuencias (red convolucional + módulo de atención o CTC). La etiqueta `image-to-text` confirma que la tarea es transcripción de imagen a texto, no generación multimodal general.

No se dispone de información sobre el número de parámetros, el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de aumento de datos o ajuste fino desde un checkpoint PP-OCRv5 preentrenado. Tampoco hay datos sobre el proceso de anotación de las muestras en escritura limbu, que en proyectos de este tipo suele ser manual y de pequeño volumen. Cualquier afirmación sobre estos extremos sería especulativa y no se incluye.

## Capacidades

- Reconocimiento de texto en escritura limbu (sirijonga/yakthung) a partir de imágenes.
- Reconocimiento de texto en nepalí (devanagari), según la etiqueta de idioma `ne`.
- Detección y transcripción en pipelines de imagen a texto propios de PaddleOCR.
- Procesamiento de documentos escaneados o fotografías con texto en estas escrituras.
- Integración con el ecosistema PaddleOCR para postprocesado y extracción estructurada.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso ni modos de "thinking"; es un modelo OCR, no un LLM.

## Casos de uso

- Digitalización de documentos administrativos nepalíes: el modelo puede transcribir formularios y registros que combinan limbu y nepalí, facilitando su indexación y búsqueda en archivos públicos.
- Preservación de patrimonio cultural: digitalización de manuscritos y publicaciones en escritura sirijonga para crear corpus legibles por máquina y facilitar estudios lingüísticos.
- Accesibilidad para hablantes de limbu: convertir texto impreso en texto digital para lectores de pantalla y herramientas de traducción, un nicho que los OCR generalistas no cubren.
- Automatización de archivos escolares y educativos: extracción de datos de boletines, libros de texto y materiales didácticos en limbu para su incorporación a plataformas de gestión educativa.
- Procesamiento de prensa y publicaciones regionales: transcripción de periódicos y boletines comunitarios en limbu y nepalí para su archivo digital y análisis de contenido.
- Investigación en lingüística computacional: generación de corpus anotados en limbu a partir de material impreso, como paso previo al entrenamiento de modelos de lenguaje para esta lengua de bajos recursos.
- Digitalización de señalización y documentos oficiales bilingües: en contextos donde conviven limbu y devanagari, el modelo permite extraer ambos textos en un único pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se dispone de datos sobre tamaño de parámetros ni VRAM necesaria; al tratarse de un pipeline PP-OCRv5, es previsible que sea ligero, pero no se confirma.
- GPU recomendadas: no disponible. Por la familia PP-OCRv5, cabría esperar ejecución en GPU de consumo, pero no hay confirmación en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: PaddleOCR (librería declarada); otras opciones como vLLM, llama.cpp, Ollama o TGI no aplican a un modelo OCR de este tipo o no están documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas/escrituras | Licencia | Disponibilidad |
|---|---|---|---|---|
| ampixa/limbu-ocr | OCR PP-OCRv5 | limbu, nepalí | Apache 2.0 | Hugging Face (gated) |
| PaddleOCR PP-OCRv5 (base) | OCR | multilingüe general (sin limbu documentado) | Apache 2.0 | PaddleOCR / Hugging Face |
| Tesseract OCR | OCR clásico | multilingüe (cobertura de limbu no confirmada) | Apache 2.0 | Repositorios estándar |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a cobertura de escrituras y licencia. No se identifican alternativas open source específicas para OCR en limbu en la información disponible.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face antes de descargarlo; esto limita su uso automatizado en pipelines sin gestión de credenciales.
- Sin métricas publicadas: no hay datos de precisión, recall ni tasas de error por carácter, por lo que no puede evaluarse su calidad objetivamente antes de probarlo.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso en producción ni validación por la comunidad.
- Cobertura de escrituras limitada: está entrenado para limbu y nepalí; no debe esperarse buen rendimiento en otras escrituras o idiomas.
- Riesgo de errores en escrituras de bajos recursos: la escasez de datos anotados en limbu puede traducirse en confusiones entre glifos similares y errores en documentos degradados.
- Sesgos: no documentados; en OCR de escrituras minoritarias suele haber sesgo hacia las variantes tipográficas presentes en el conjunto de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el acceso gated puede imponer condiciones adicionales que conviene revisar antes de integrarlo en un producto.
- Sin información sobre el proceso de entrenamiento ni sobre la procedencia de los datos, lo que dificulta auditar su comportamiento en dominios específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ampixa/limbu-ocr
- PaddleOCR (librería base): https://github.com/PaddlePaddle/PaddleOCR
- PP-OCRv5 (documentación de la familia): https://github.com/PaddlePaddle/PaddleOCR/blob/main/docs/version3.x/algorithm/PP-OCRv5/PP-OCRv5.md

# anandkaman/arjuna-ocr-te-en

## Resumen

Arjuna-OCR [Te&En] es un conjunto de tres modelos ONNX orientados a la lectura de documentos impresos en telugu e inglés: un modelo de layout, un detector de texto y un reconocedor CTC telugu+inglés. Lo publica el desarrollador independiente anandkaman y se distribuye con licencia Apache-2.0 (con la excepción del modelo de layout, que es AGPL-3.0). El pipeline completo funciona solo en CPU, sin GPU y sin modelo de lenguaje auxiliar, lo que reduce los requisitos de despliegue a un entorno con `onnxruntime` y `opencv-python-headless`.

La pieza nueva de esta release es el reconocedor: un SVTRv2-B con adaptadores LoRA/ConvLoRA fusionados y una cabeza CTC de 206 clases, entrenado sobre un corpus sintético de unas 398 000 líneas con 53 tipografías mezclado con líneas reales de libros etiquetadas en proporción 0,85/0,15. El modelo de layout y el detector se reutilizan sin cambios del release anterior para kannada (`arjuna-ocr-kn-en`) y fueron validados sobre páginas en telugu antes de reutilizarlos.

La relevancia práctica está en que cubre un par de idiomas poco atendido (telugu, con unos 96 millones de hablantes) con métricas publicadas sobre un conjunto de test congelado de 200 recortes de línea procedentes de 12 libros no vistos en entrenamiento: CER del 3,95 % y precisión de carácter del 96,05 % en el conjunto completo. El modelo opera sobre recortes de línea, no sobre páginas completas; para páginas enteras hay que usar el runtime `arjuna-ocr`, que orquesta los tres modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SVTRv2-B (reconocedor) con LoRA/ConvLoRA fusionados y cabeza CTC de 206 clases; detector PP-OCRv6; layout DocLayout-YOLO de 15 clases |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión por línea, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | telugu (te) e inglés (en) |
| Licencia | Apache-2.0 para reconocedor y `predict_te.py`; AGPL-3.0 para el modelo de layout |
| Formato de pesos | ONNX (`arjuna_rec_te.onnx`, `inference.onnx`, `arjuna_layout_v15.onnx`) |
| Tamano del repo | 0,2 GB |
| Entrada | recortes de línea normalizados a 32 px de alto |
| Salida | texto (206 clases CTC); el runtime completo genera Markdown, hOCR y ALTO |
| Hardware requerido | CPU (sin GPU) |

## Arquitectura y entrenamiento

El reconocedor es un SVTRv2-B (Scene Text Recognition con arquitectura de visión tipo transformer) al que se le han fusionado adaptadores LoRA y ConvLoRA sobre una base previa, con una cabeza CTC de 206 clases que cubre el alfabeto telugu y el latino. El entrenamiento se hizo sobre un corpus sintético telugu+inglés de aproximadamente 398 000 líneas generadas con 53 tipografías, mezclado con líneas reales de libros etiquetadas en proporción 0,85/0,15. Cada recorte se renderiza desde un punto de vista de 150 DPI y se normaliza a 32 px de altura, lo que fija la resolución de entrada del modelo.

El detector de texto procede de la línea PP-OCRv6 y el modelo de layout (15 clases) de la línea DocLayout-YOLO; ambos se reutilizan sin modificar del release para kannada y se validaron sobre páginas en telugu antes de incluirlos aquí. El reconocedor no emplea modelo de lenguaje ni corrección contextual posterior: la decodificación es CTC pura, lo que explica tanto la velocidad en CPU como algunas de las debilidades medidas (por ejemplo, la dependencia del contexto de línea para desambiguar palabras aisladas).

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre recortes de línea de documentos impresos en telugu e inglés.
- Detección de regiones de texto en página completa mediante el detector PP-OCRv6 incluido.
- Análisis de layout con 15 clases (bloques de texto, tablas, figuras, etc.) mediante el modelo DocLayout-YOLO.
- Orden de lectura y reconstrucción de página completa a través del runtime `arjuna-ocr`, con salida en Markdown, hOCR y ALTO.
- Inferencia solo en CPU, sin dependencia de GPU ni de modelo de lenguaje.
- Procesamiento por lotes vía CLI (`python predict_te.py crops/*.png --json`).
- Manejo conjunto de dígitos ASCII (98,5 % de precisión según la model card) y texto mixto telugu/inglés.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo; es exclusivamente image-to-text.

## Casos de uso

- Digitalización de libros y prensa histórica en telugu: el reconocedor está entrenado con líneas de libros reales y un CER del 4,13 % en el slice telugu, lo que lo hace adecuado para proyectos de preservación digital que necesiten texto plano buscable a partir de escaneos.
- Extracción de texto de documentos administrativos bilingües telugu/inglés: la cabeza CTC de 206 clases cubre ambos alfabetos en la misma línea, de modo que formularios y expedientes con mezcla de idiomas se procesan sin conmutar de modelo.
- Pipelines de document AI en servidores sin GPU: al ejecutarse íntegramente en CPU con `onnxruntime`, encaja en entornos cloud de bajo coste o en equipos de digitalización locales donde no hay acelerador disponible.
- Indexación y búsqueda full-text sobre corpus documentales: combinado con el runtime `arjuna-ocr`, que produce Markdown/hOCR/ALTO, se puede alimentar un motor de búsqueda o un sistema RAG sobre documentos escaneados.
- Procesamiento por lotes de recortes de línea ya segmentados: cuando otro sistema (o un paso previo) ya ha aislado las líneas, `predict_te.py` acepta globs de imágenes y devuelve JSON, lo que simplifica la integración en scripts de automatización.
- Extracción de tablas y estructura de página: el modelo de layout de 15 clases permite separar bloques de texto, tablas y figuras antes de aplicar OCR, útil en informes financieros o censos escaneados.
- Validación de calidad en digitalización: las métricas publicadas por slice de tamaño de fuente (24–32 px, 32–48 px, 48+ px) permiten estimar de antemano el rendimiento esperado según la resolución de los escaneos de entrada.

## Benchmarks y rendimiento

Conjunto de test congelado de 200 recortes de línea reales procedentes de 12 libros no vistos en entrenamiento, medidos con `predict_te.py` tal como se distribuye (un recorte a la vez):

| Slice | Líneas | CER | Precisión de carácter | Líneas totalmente correctas |
|---|---|---|---|---|
| Todos | 200 | 3,95 | 96,05 % | 48,0 % |
| Telugu | 168 | 4,13 | 95,87 % | 38,1 % |
| Inglés | 9 | 0,00 | 100,00 % | 100,0 % |
| 24–32 px | 81 | 3,43 | 96,57 % | 40,7 % |
| 32–48 px | 83 | 3,98 | 96,02 % | 53,0 % |
| 48+ px | 30 | 6,66 | 93,34 % | 50,0 % |

Debilidades medidas por el autor:

| Caso | Resultado |
|---|---|
| Palabras sueltas aisladas | 89,1 % de precisión de carácter (frente a 96,4 % en líneas de 4–7 palabras) |
| Espaciado | 28 % de todas las operaciones de edición son solo espaciado |
| Dígitos telugu | Línea solo de dígitos a veces se emite vacía (n=3 en el test) |
| Dígitos ASCII | 98,5 % de precisión, ninguno descartado |
| Pares visualmente similares | `ద/డ`, `వ/ప`, `స/న` son las sustituciones más frecuentes |

El propio autor advierte que la cifra de inglés se apoya en solo 9 líneas y 209 caracteres, insuficiente para reclamar una precisión de inglés; el conjunto sintético de validación en inglés es mayor (419 líneas, ~95 % de precisión por línea), pero los resultados sintéticos no han transferido a páginas reales en este proyecto. Evaluar el mismo modelo en lotes con padding da 4,08 de CER en lugar de 3,95; la diferencia se atribuye al padding blanco que añade el lote.

## Requisitos de hardware

- Inferencia solo en CPU: no requiere GPU ni VRAM dedicada; el paquete completo ocupa 0,2 GB en disco.
- Dependencias mínimas: `onnxruntime` y `opencv-python-headless`; el runtime completo se instala con `pip install arjuna-ocr`.
- Cabe en cualquier equipo de sobremesa o servidor convencional; no se publican requisitos mínimos de RAM ni de núcleos.
- Opciones de despliegue documentadas: `onnxruntime` (vía `predict_te.py`) y el runtime `arjuna-ocr` para páginas completas. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo OCR).
- Latencia y throughput: no disponibles en la información proporcionada.
- El repo incluye `MANIFEST.json` con el sha256 de cada fichero de modelo para verificación de integridad.

## Comparativa con modelos similares

| Modelo | Idiomas | Arquitectura | Contexto / entrada | Licencia | Formato |
|---|---|---|---|---|---|
| anandkaman/arjuna-ocr-te-en | te, en | SVTRv2-B + CTC, detector PP-OCRv6, layout DocLayout-YOLO | Recortes de línea a 32 px de alto | Apache-2.0 (layout AGPL-3.0) | ONNX |
| anandkaman/arjuna-ocr-kn-en | kn, en | Misma familia (base del detector y layout reutilizados) | Recortes de línea | no disponible en la información proporcionada | ONNX |
| anandkaman/arjuna-ocr-hi-en | hi, en | Misma familia | Recortes de línea | no disponible en la información proporcionada | ONNX (TensorRT entre las librerías soportadas) |

No se dispone de datos de benchmarks de los modelos hermanos (kn-en, hi-en) en la información proporcionada, por lo que no es posible comparar rendimiento numérico entre ellos. Tampoco se han encontrado en la búsqueda web alternativas de OCR telugu+inglés con métricas publicadas comparables.

## Limitaciones y advertencias

- El reconocedor trabaja sobre recortes de línea, no sobre páginas completas; para páginas enteras es obligatorio usar el runtime `arjuna-ocr`.
- El modelo de layout se distribuye bajo AGPL-3.0 (linaje DocLayout-YOLO), lo que puede condicionar el uso comercial o la redistribución; el reconocedor y el detector pueden usarse sin él si esa licencia no encaja.
- La cifra de precisión en inglés (100 %) se basa en 9 líneas y 209 caracteres: no es evidencia suficiente para afirmar una precisión de inglés.
- Las palabras aisladas rinden peor (89,1 % de precisión de carácter) porque el decodificador CTC no tiene contexto de línea.
- El 28 % de los errores de edición son de espaciado: algunas líneas perfectamente legibles puntúan como error.
- Las líneas compuestas solo por dígitos telugu pueden emitirse vacías; los dígitos ASCII, en cambio, se reconocen con 98,5 % de precisión.
- Confusiones documentadas entre pares visualmente similares: `ద/డ`, `వ/ప`, `స/న`.
- No hay datos publicados sobre sesgos demográficos o de dominio más allá de las métricas de precisión; el corpus de entrenamiento es mayoritariamente sintético (85 %), lo que puede introducir un sesgo hacia las 53 tipografías empleadas en la generación.
- No se documentan requisitos de memoria ni latencia, lo que dificulta el dimensionamiento previo de despliegues en producción.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta: no hay validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anandkaman/arjuna-ocr-te-en
- Modelo hermano kannada+inglés (base del detector y layout): https://huggingface.co/anandkaman/arjuna-ocr-kn-en
- Modelo hermano hindi+inglés: https://huggingface.co/anandkaman/arjuna-ocr-hi-en
- Repositorio de ficheros del modelo hindi+inglés: https://huggingface.co/anandkaman/arjuna-ocr-hi-en/tree/main
- Contacto del autor: kamananand98@gmail.com

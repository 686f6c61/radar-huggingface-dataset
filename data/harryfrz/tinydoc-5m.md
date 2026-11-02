# harryfrz/tinydoc-5m

## Resumen

tinydoc-5m es un modelo OCR y de comprensión de documentos de muy pequeño tamaño (5,1 millones de parámetros, unos 20 MB de pesos) desarrollado por el usuario harryfrz y publicado en HuggingFace bajo licencia Apache 2.0. Su función es leer texto impreso en recibos, facturas, PDFs y páginas ordinarias y devolver tanto el texto como los campos clave (comercio, fecha, totales, líneas de detalle) en formato JSON, con una puntuación de confianza por valor y la posición en la página donde se ha leído cada campo.

El modelo se distribuye en formato ONNX y está diseñado explícitamente para inferencia en CPU, lo que lo sitúa en una categoría distinta a la de los grandes modelos multimodales de OCR: aquí el objetivo no es la máxima precisión absoluta, sino un coste computacional mínimo y un despliegue trivial en entornos sin GPU. Se ha entrenado desde cero, sin pesos preentrenados ni destilación de otro modelo, sobre CORD-v2, WildReceipt, un subconjunto de DocLayNet v1.2 y datos sintéticos.

Es relevante ahora porque cubre el nicho de extracción de información estructurada en documentos con requisitos de privacidad y coste muy bajos: al ejecutarse en CPU y ocupar 20 MB, puede integrarse en pipelines locales, en el navegador mediante ONNX Runtime Web o en dispositivos de borde sin depender de APIs externas. Su soporte es únicamente para inglés y texto impreso en escritura latina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo image-to-text en ONNX, entrenado desde cero) |
| Parametros totales | 5,1 M (aproximadamente 5 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo ocupa 0,2 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (tipo de encoder visual, decoder de texto, mecanismo de atención ni resolución de entrada). Lo que sí se especifica es que el modelo se ha entrenado desde cero, sin inicialización a partir de pesos preentrenados y sin destilación de ningún otro modelo, y que se distribuye exclusivamente como grafo ONNX para ejecución en CPU.

El entrenamiento combina cuatro fuentes: CORD-v2 (Park et al., 2019, licencia CC BY 4.0), WildReceipt (Sun et al., 2021, Apache 2.0), un subconjunto de DocLayNet v1.2 (Pfitzmann et al., 2022, CDLA-Permissive-1.0) y datos sintéticos de recibos, facturas y páginas renderizados con fuentes OFL, Apache y UFL. No se documenta el número de tokens ni de imágenes de entrenamiento, ni si hubo etapas de ajuste fino con refuerzo o preferencias. La innovación técnica destacable es la combinación de reconocimiento de texto y extracción de campos estructurados en un único modelo de 5 M de parámetros, con salida JSON que incluye confianza por campo y coordenadas de la región leída, además de una bandera `needs_review` para los valores dudosos.

## Capacidades

- Reconocimiento de texto impreso (OCR) en escritura latina sobre recibos, facturas, PDFs y páginas escaneadas.
- Extracción de campos clave en JSON: comercio, fecha, totales y líneas de detalle.
- Puntuación de confianza por cada valor extraído y bandera `needs_review` para revisión humana.
- Localización en página: cada valor incluye un puntero a la región donde se ha leído.
- Valores ausentes devueltos como `null`, sin inferencia ni relleno especulativo.
- Ejecución en CPU mediante ONNX Runtime, con backend configurable (`--backend onnx --weights onnx`).
- Procesamiento de imágenes sueltas y de PDFs en una misma invocación de línea de comandos.
- No soporta tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento.

## Casos de uso

- Digitalización de tickets de gasto en aplicaciones de contabilidad: el modelo extrae comercio, fecha, total y líneas de detalle de cada recibo y devuelve JSON con confianza por campo, lo que permite marcar automáticamente para revisión los valores con `needs_review` activo antes de contabilizarlos.
- Procesamiento de facturas en local sin salida a la nube: al ejecutarse en CPU con 20 MB de pesos, puede desplegarse dentro de la red corporativa para extraer importes y fechas de facturas en PDF sin enviar documentos sensibles a APIs externas.
- Automatización de cuentas de gastos en pymes: integración en un pipeline que recibe fotos de recibos desde el móvil, ejecuta tinydoc-5m en el servidor y vuelca los campos estructurados en el ERP, usando la confianza por campo para decidir qué registros requieren validación manual.
- Indexación y búsqueda de archivos PDF escaneados: el texto reconocido por página alimenta un índice de búsqueda o un sistema RAG documental, con la ventaja de que el coste por página es mínimo al no requerir GPU.
- Despliegue en el borde o en el navegador: el formato ONNX permite ejecutar el modelo con ONNX Runtime Web o en dispositivos de baja potencia para previsualizar la extracción de un recibo en el propio cliente antes de subirlo.
- Preprocesado en pipelines de documentos más grandes: usar tinydoc-5m como primera pasada barata que detecta y extrae los campos de documentos bien tipificados (recibos CORD-like), reservando modelos mayores solo para las páginas que el modelo marca como dudosas o con estructura desconocida.
- Extracción de texto en herramientas de línea de comandos: la interfaz `python -m tinydoc extract receipt.jpg invoice.pdf --out result.json` permite incorporar el OCR a scripts de automatización sin escribir código de inferencia.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| OCR | OmniDocBench v1.5, páginas en inglés | Text edit distance, media por página (menor es mejor) | 0,117 |
| Reconocimiento de líneas de texto | CORD-v2, líneas de test | Character error rate, % (menor es mejor) | 1,23 |
| Reconocimiento de líneas de texto | DocLayNet v1.2, líneas de test | Character error rate, % (menor es mejor) | 8,94 |
| Estructura de tablas | OmniDocBench | TEDS (menor es mejor) | 0,29 |

Datos de rendimiento en CPU aportados por el autor, medidos en un Apple M5 Pro:

| Motor | Throughput con 4 workers | Memoria por worker |
|---|---|---|
| tinydoc-5m | 3,17 páginas/s | 1,3 GB |
| Tesseract | 3,26 páginas/s | 120 MB |

El autor indica que las cifras de Indra OCR proceden de las publicadas por Datalab y que no se ejecutó Indra en su propia medición.

## Requisitos de hardware

- Inferencia en CPU: el modelo está pensado para ejecutarse sin GPU; el repo de pesos ocupa 0,2 GB y el modelo declara 5,1 M de parámetros y unos 20 MB.
- Memoria: aproximadamente 1,3 GB por worker en las pruebas del autor con 4 workers en paralelo; Tesseract consume unos 120 MB por worker en la misma comparación.
- GPU: no se especifica ninguna GPU recomendada; el pipeline declarado es CPU.
- Cabe en cualquier portátil o servidor de gama baja; no requiere GPU de consumo.
- Opciones de despliegue: ONNX Runtime mediante la CLI incluida (`--backend onnx --weights onnx`); el formato ONNX abre la puerta a ONNX Runtime Web y a otros runtimes compatibles, aunque no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Throughput de referencia: 3,17 páginas/s con 4 workers en un Apple M5 Pro, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinydoc-5m | 5,1 M | no disponible | OCR + extracción de campos en ONNX para CPU | Apache 2.0 | HuggingFace (`harryfrz/tinydoc-5m`) |
| Tesseract | no disponible | no disponible | OCR clásico en CPU | Apache 2.0 | open source |
| Indra OCR (Datalab) | no disponible | no disponible | OCR/document understanding | no disponible | no disponible |

En la comparación de rendimiento aportada por el autor, tinydoc-5m queda ligeramente por debajo de Tesseract en velocidad con 4 workers (3,17 frente a 3,26 páginas/s) y muy por encima en consumo de memoria (1,3 GB frente a 120 MB por worker). Frente a Indra OCR no se ofrece una comparación ejecutada por el autor: las cifras de Indra son las publicadas por Datalab. No se dispone de datos de parámetros ni de contexto de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Solo reconoce texto impreso en escritura latina; no maneja escritura manuscrita.
- La estructura de tablas es débil: TEDS de 0,29 en OmniDocBench según el autor.
- Las líneas de detalle y las maquetas de factura poco habituales son los campos menos fiables.
- Las páginas densas a varias columnas (periódicos, revistas) son las más difíciles en cuanto al orden de lectura.
- Solo soporta inglés; no hay soporte multilingüe declarado.
- Consume bastante más memoria por worker que Tesseract (1,3 GB frente a 120 MB) y es ligeramente más lento con 4 workers en las mediciones del autor.
- Los benchmarks están declarados por el autor y marcados como no verificados; no hay evaluación independiente publicada.
- Riesgo de alucinación: la model card afirma que los valores ausentes se devuelven como `null` y nunca se adivinan, pero conviene validar los totales comprobando `validation.needs_review` antes de confiar en ellos.
- Licencia Apache 2.0 para el modelo; los datos de entrenamiento conservan sus propias licencias (CC BY 4.0, Apache 2.0, CDLA-Permissive-1.0), lo que debe revisarse si se redistribuye el modelo o se alega su procedencia.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de mantenimiento continuado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/harryfrz/tinydoc-5m
- Dataset CORD-v2: https://huggingface.co/datasets/naver-clova-ix/cord-v2
- Dataset DocLayNet v1.2: https://huggingface.co/datasets/docling-project/DocLayNet-v1.2
- Dataset WildReceipt: https://download.openmmlab.com/mmocr/data/wildreceipt.tar
- Referencia de OmniDocBench: https://huggingface.co/datasets/opendatalab/OmniDocBench

# GhaythMahadin/tesseract-tessdata-fast

## Resumen

Este repositorio no contiene un modelo de lenguaje neuronal, sino una copia empaquetada de los datos de entrenamiento (tessdata) de Tesseract en su variante `tessdata_fast`, concretamente los ficheros de reconocimiento para arabe (`ara`), ingles (`eng`) y deteccion de orientacion y escritura (`osd`). Lo publica el usuario GhaythMahadin como dependencia de un proyecto propio denominado «مرصد التحقق» (observatorio de verificacion), y su origen es el repositorio oficial `tesseract-ocr/tessdata_fast` en el commit `87416418657359cb625c412a48b6e1d6d41c29bd`.

El valor practico del repositorio es servir como espejo reproducible de esos ficheros para pipelines de OCR que necesitan versionado y fijado por hash: el autor incluye un `deps.lock.json` con las huellas de integridad. No hay pesos de red neuronal, no hay tokenizador, no hay contexto en tokens ni parametros entrenables en el sentido habitual de un modelo generativo.

Es relevante unicamente en el ambito del OCR clasico con Tesseract (LSTM sobre caracteres y lineas de texto) para arabe e ingles. Cualquier expectativa de generacion de texto, razonamiento o tool calling queda fuera del alcance de este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tesseract LSTM (motor OCR clasico, no transformer) |
| Parametros totales | no disponible (ficheros de datos `.traineddata`, no se publica recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (OCR sobre imagen de linea/pagina, sin contexto en tokens) |
| Tipos de cuantizacion | no disponible (Tesseract usa enteros en sus propios ficheros; no hay variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | arabe (`ara`), ingles (`eng`), mas `osd` (deteccion de orientacion y script) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.traineddata` (formato propio de Tesseract) |

## Arquitectura y entrenamiento

Los ficheros incluidos corresponden a la variante `fast` de tessdata, que en Tesseract implica modelos LSTM mas pequenos y rapidos que la variante `best`, con menor precision en condiciones dificiles (ruido, baja resolucion, tipografias poco comunes). El reconocimiento se realiza sobre lineas de texto segmentadas previamente por el motor; no existe atencion a contexto largo ni decodificacion autoregresiva de secuencias arbitrarias.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus ni el proceso de ajuste en la informacion proporcionada. El autor solo documenta la procedencia (repositorio oficial `tesseract-ocr/tessdata_fast`) y la integridad de los ficheros mediante `deps.lock.json`. No se mencionan innovaciones tecnicas adicionales ni ajustes propios respecto al upstream.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de texto impreso en arabe e ingles.
- Deteccion de orientacion de pagina y de script mediante `osd`.
- Extraccion de texto plano a partir de imagenes o PDFs rasterizados, integrable en pipelines de digitalizacion.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas a los dos idiomas empaquetados (ara, eng); no cubre otras lenguas sin anadir ficheros `.traineddata` adicionales.
- No dispone de modo de razonamiento (thinking), vision general, audio ni otras modalidades.

## Casos de uso

- Digitalizacion de documentos administrativos en arabe e ingles: se usa como motor OCR en un pipeline que rasteriza PDFs y extrae texto por lineas, adecuado por el soporte nativo de ambos idiomas en un unico paquete.
- Indexacion de archivos historicos o corporativos: permite generar texto buscable a partir de escaneos, con la ventaja de que el repositorio fija version y hash de los datos para reproducibilidad.
- Extraccion de campos en formularios impresos: combinado con reglas o post-procesado, el OCR devuelve el texto que luego se parsea; la variante `fast` reduce latencia en volumen alto.
- Preprocesado para pipelines de NLP: convertir imagenes en texto antes de pasarlo a un modelo de lenguaje, usando este paquete como dependencia versionada.
- Verificacion de integridad en entornos reproducibles: el `deps.lock.json` permite comprobar que los ficheros de OCR no han cambiado entre despliegues, util en CI/CD y auditoria.
- Procesamiento por lotes en servidores sin GPU: Tesseract funciona en CPU, por lo que este paquete encaja en entornos con recursos limitados donde no se justifica un modelo neuronal de OCR.
- Deteccion de orientacion de paginas escaneadas: el fichero `osd` permite rotar automaticamente imagenes antes del reconocimiento, mejorando la tasa de acierto en lotes heterogeneos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; Tesseract ejecuta en CPU.
- GPU recomendadas: no aplica.
- Cabe en cualquier consumer GPU o incluso en entornos sin GPU; el requisito es CPU y memoria RAM suficiente para cargar los `.traineddata` (del orden de decenas de MB en la variante `fast`).
- Opciones de despliegue: binario `tesseract` con la variable `TESSDATA_PREFIX` apuntando a este directorio, o bindings como `pytesseract`, `tesserocr` o `node-tesseract-ocr`.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen de la resolucion de imagen, el numero de paginas y los nucleos de CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| tesseract-tessdata-fast (este repo) | OCR LSTM (Tesseract) | ara, eng, osd | Apache-2.0 | Hugging Face, espejo de upstream |
| tesseract-ocr/tessdata_fast (upstream) | OCR LSTM (Tesseract) | multilingue (muchos paquetes) | Apache-2.0 | GitHub oficial |
| tesseract-ocr/tessdata_best (upstream) | OCR LSTM (Tesseract) | multilingue | Apache-2.0 | GitHub oficial |
| PaddleOCR | OCR neuronal (deteccion + reconocimiento) | multilingue | Apache-2.0 | GitHub, Hugging Face |

La diferencia principal frente a `tessdata_fast` y `tessdata_best` oficiales es el alcance: este repositorio solo incluye `ara`, `eng` y `osd`, mientras que los upstream cubren decenas de idiomas. Frente a PaddleOCR, la comparacion no es directa: Tesseract es un motor clasico sin deteccion neuronal de cajas, lo que suele penalizar en escenas no documentales.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no razona y no admite prompts.
- Precision limitada por la variante `fast`: menor exactitud que `tessdata_best` en imagenes ruidosas, baja resolucion o tipografias atipicas.
- Cobertura linguistica restringida a arabe e ingles; cualquier otro idioma requiere anadir ficheros `.traineddata` de otras fuentes.
- Dependencia de la segmentacion previa de lineas; el OCR puede fallar en maquetas complejas, tablas o texto manuscrito.
- Riesgo de errores de reconocimiento en caracteres similares y en texto con diacriticos arabes, sin mecanismo de confianza calibrado mas alla de las puntuaciones internas de Tesseract.
- Licencia Apache-2.0 permite uso comercial, pero conviene conservar el aviso de licencia y verificar que los ficheros coinciden con el upstream mediante el `deps.lock.json`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento continuado.
- El tamano del repo figura como 0.0 GB, lo que sugiere que los ficheros pueden no estar efectivamente subidos o que la medicion esta redondeada; conviene verificar la presencia real de los `.traineddata` antes de depender de este espejo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/GhaythMahadin/tesseract-tessdata-fast
- Upstream de los datos: https://github.com/tesseract-ocr/tessdata_fast/tree/87416418657359cb625c412a48b6e1d6d41c29bd
- Repositorio oficial de Tesseract: https://github.com/tesseract-ocr/tesseract
- Documentacion de Tesseract: https://tesseract-ocr.github.io/

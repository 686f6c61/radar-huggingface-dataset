# bicolino34/tesseract-ukr-historic

## Resumen

`tesseract-ukr-historic` es un modelo LSTM de reconocimiento de lineas de texto para Tesseract 5, afinado por el usuario bicolino34 a partir del modelo oficial ucraniano `ukr` de `tessdata_best`. Su proposito es mejorar el OCR de documentos historicos impresos en ucraniano, un dominio donde el modelo generico de Tesseract produce errores frecuentes por la presencia de grafias arcaicas (ѣ, ъ, і), abreviaturas y mezcla de alfabetos. El autor lo publica como modelo de prueba y advierte explicitamente de que debe usarse bajo responsabilidad del usuario.

La relevancia del modelo esta en la mejora cuantificada: sobre 2.833 lineas de test no vistas en entrenamiento, reduce el CER del 9,81 % al 1,55 % y el WER del 29,62 % al 6,42 % respecto al modelo base. Se distribuye en dos variantes de pesos, `tessdata_best` (float, mas precisa) y `tessdata_fast` (entera, mas rapida), ambas como ficheros `.traineddata` compatibles con la libreria `tesseract`.

No es un modelo de lenguaje generativo ni un transformer: es una red LSTM de reconocimiento de lineas integrada en el pipeline clasico de Tesseract, por lo que no tiene ventana de contexto ni parametros en el sentido habitual de los LLM. El repositorio de HuggingFace ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM de reconocimiento de lineas de texto (Tesseract 5) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (reconoce una linea de imagen por inferencia) |
| Tipos de cuantizacion | dos variantes: float (`tessdata_best`) e integer (`tessdata_fast`) |
| Idiomas soportados | ucraniano (uk), con mezcla de bielorruso (be), polaco (pl) y ruso (ru) en los datos |
| Licencia | Apache 2.0 |
| Formato de pesos | `.traineddata` (Tesseract), en carpetas `tessdata_best/` y `tessdata_fast/` |

## Arquitectura y entrenamiento

El modelo es una red LSTM de Tesseract 5.3.4 entrenada con `tesstrain` sobre Google Colab (CPU). Parte del modelo `ukr` de `tessdata_best` y fusiona su `unicharset` con los caracteres presentes en los datos de entrenamiento, ampliando el repertorio con grafias arcaicas y simbolos adicionales: `ѣ` (U+0463), `ъ` (U+044A), `ґ`/`Ґ`, `ў`/`Ў`, `э`/`Э`, `ё`/`Ё`, `ѳ`/`Ѳ`, `ѕ`/`Ѕ`, `џ`, `ј`, `ӱ`, ademas de letras latinas acentuadas (polaco, checo, frances, aleman), digitos en superindice y simbolos tipograficos como `—`, `„`, `“`, `№`, `§`, `†`, `×`, `½`, `⅓`, `⅔`, `⅛`, `⅒`, `⁄` y letras griegas. La tasa de aprendizaje fue 0,0001 y el modo de segmentacion de pagina 13 (linea cruda).

Los datos proceden de paginas de textos impresos en ucraniano con cierta mezcla de otras lenguas, transcritas y corregidas a mano en Transkribus. Las imagenes de linea se recortaron como cajas delimitadoras del poligono de linea recalculado a partir de la linea base corregida, con altura adaptada al interlineado local. El split fue aleatorio por linea: 22.665 lineas de entrenamiento, 2.833 de validacion y 2.833 de test. Se conserva la ortografia original, las abreviaturas tal cual aparecen y los saltos de linea con guion.

## Capacidades

- Reconocimiento de texto impreso (OCR) sobre imagenes de lineas de texto en ucraniano, incluyendo ortografia historica.
- Reconocimiento de texto historico impreso (HTR aplicado a impresos digitalizados), con soporte para grafias arcaicas y abreviaturas.
- Manejo de mezcla de alfabetos cirilico y latino dentro de la misma linea, gracias al `unicharset` ampliado.
- Reconocimiento de digitos en superindice, fracciones y simbolos tipograficos habituales en textos academicos y cientificos antiguos.
- Procesamiento de pagina completa mediante el analisis de layout propio de Tesseract (`--psm 3`), aunque el modelo fue entrenado sobre lineas sueltas.
- Integracion con `pytesseract` y con la CLI de `tesseract` mediante el parametro `-l ukr_historic`.
- No dispone de tool calling, capacidades de agente, vision general, audio ni modo de razonamiento: es exclusivamente un motor de OCR.

## Casos de uso

- Digitalizacion de fondos historicos impresos en ucraniano: el modelo reconoce lineas de libros y publicaciones periodicas antiguas con un CER del 1,55 %, lo que reduce drasticamente la revision manual frente al 9,81 % del modelo `ukr` original.
- Creacion de corpus textuales para linguistica historica: al conservar la ortografia original (ѣ, ъ, і) y las abreviaturas, permite construir corpus fieles para estudios de evolucion del ucraniano.
- Proyectos de humanidades digitales con Transkribus: el modelo encaja en flujos que ya usan Transkribus para la transcripcion de referencia, ya que los datos de entrenamiento provienen de esa herramienta y el formato de salida es texto plano.
- Procesamiento por lotes a gran escala: la variante `tessdata_fast` (modelo entero) esta pensada para OCR masivo, donde la velocidad prima sobre la precision marginal.
- Extraccion de texto de documentos con mezcla de lenguas (ucraniano con fragmentos en polaco, ruso o bielorruso): el `unicharset` ampliado cubre letras latinas acentuadas y cirilicas adicionales que el modelo base no contempla.
- Reconocimiento de material cientifico antiguo con notacion matematica simple: la inclusion de superindices, fracciones y simbolos como `×`, `=`, `%` o `§` permite capturar expresiones y referencias numericas.
- Segmentacion y reconocimiento linea a linea en pipelines propios: para obtener la maxima precision, se recomienda segmentar las paginas previamente y reconocer cada linea con `--psm 13`, tal como se entreno el modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Evaluacion sobre 2.833 lineas de test no usadas en entrenamiento, imagenes de linea suelta con `--psm 13`, texto normalizado a NFC y espacios colapsados antes de puntuar.

| Modelo | CER (%) | WER (%) |
|---|---|---|
| `ukr` (original, tessdata_best) | 9,81 | 29,62 |
| `ukr_historic` (este modelo) | 1,55 | 6,42 |

## Requisitos de hardware

- VRAM: no aplica; Tesseract es un motor de OCR en CPU y no requiere GPU para inferencia.
- GPU recomendadas: no aplica. El entrenamiento se realizo en Google Colab sobre CPU.
- Compatibilidad con GPU de consumo: irrelevante, ya que el modelo no se ejecuta en GPU.
- Despliegue: CLI de `tesseract` (`tesseract line.png - -l ukr_historic --tessdata-dir tessdata/tessdata_fast --psm 13`), `pytesseract` en Python, o cualquier wrapper de Tesseract 5 que acepte `--tessdata-dir`.
- Latencia y throughput: no disponibles en la informacion proporcionada. La variante `tessdata_fast` es la recomendada por el autor para OCR a gran escala por ser mas rapida que la float.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | CER en el test del autor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ukr_historic` (este) | LSTM Tesseract 5 | uk (con be, pl, ru) | 1,55 % | Apache 2.0 | HuggingFace |
| `ukr` (tessdata_best) | LSTM Tesseract 5 | uk | 9,81 % | Apache 2.0 | GitHub tessdata_best |
| `ukr` (tessdata_fast) | LSTM Tesseract 5 | uk | no disponible | Apache 2.0 | GitHub tessdata_fast |
| Transkribus (modelos publicos) | HTR propietario | multiple | no disponible | propietaria | plataforma Transkribus |

La comparacion directa solo es posible con el modelo base `ukr`, ya que el autor no publica resultados frente a otras alternativas de OCR historico. Los modelos de Transkribus no son directamente comparables en licencia ni en formato de despliegue.

## Limitaciones y advertencias

- El autor califica el modelo como "merely a test model" y recomienda usarlo bajo responsabilidad del usuario; no hay garantias de robustez en produccion.
- Tiende a insertar simbolos adicionales en las palabras (por ejemplo, `зїв` -> `зіїв`, `гонять` -> `ґгонять`), un tipo de error de sustitucion que no se refleja solo en el CER agregado.
- Presenta la confusion de simbolos tipica de Tesseract entre `е` y `є`, y entre `с` y `е`, segun advierte el autor.
- Entrenado sobre lineas sueltas: en paginas completas la precision depende del analisis de layout de Tesseract, por lo que conviene segmentar previamente y reconocer linea a linea.
- El dominio de entrenamiento son textos impresos historicos en ucraniano; el rendimiento en manuscritos, en ucraniano contemporaneo o en otros idiomas no esta documentado.
- La evaluacion se realizo sobre un test propio del autor, con normalizacion Unicode y colapso de espacios; los resultados no son directamente comparables con benchmarks publicos de OCR.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece soporte ni mantenimiento, y el repositorio no registra descargas ni validacion de la comunidad.
- El modelo base `ukr` de `tessdata_best` es necesario como referencia para reproducir la comparacion; el `unicharset` ampliado puede producir caracteres inesperados en textos que no sean historicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bicolino34/tesseract-ukr-historic
- Tesseract OCR (repositorio oficial): https://github.com/tesseract-ocr/tesseract
- Modelo base `ukr` en tessdata_best: https://github.com/tesseract-ocr/tessdata_best
- Herramienta de entrenamiento tesstrain: https://github.com/tesseract-ocr/tesstrain
- Transkribus (plataforma usada para las transcripciones): https://transkribus.eu
- Predicciones de test del autor: `test_predictions.csv` en el repositorio de HuggingFace

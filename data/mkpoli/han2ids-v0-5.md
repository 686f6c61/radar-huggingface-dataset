# mkpoli/han2ids-v0.5

## Resumen

han2ids v0.5 es un modelo de vision por computador especializado en una tarea muy concreta dentro del procesamiento de escrituras CJK: leer una secuencia de descripcion ideografica (IDS, *Ideographic Description Sequence*) a partir de la imagen de un glifo Han renderizado en tipografias serif Mincho o Song. Lo desarrolla mkpoli y se publica bajo licencia MIT. No es un modelo de lenguaje general ni un OCR al uso: su salida es una cadena de operadores IDS (por ejemplo `⿵門鄉`) que describe la descomposicion estructural del caracter, no su lectura fonetica ni su codigo Unicode.

Tecnicamente es una red encoder-decoder compacta de 35,2 millones de parametros: un encoder ViT-S/16 sobre entradas de 224 px y un decoder de cuatro capas de anchura 384, con un vocabulario de 10.428 tokens en el que un caracter seguido de selector de variacion cuenta como un unico token. Incorpora una mascara de pila de operandos IDS que restringe la generacion a secuencias estructuralmente validas.

La version 0.5 parte de v0.4 y mejora la etiquetacion para que siga la forma impresa del glifo, anade renders ajustados a la tinta y ejemplos compuestos a partir de dos componentes. Es relevante para proyectos de digitalizacion, catalogacion tipografica y pipelines de OCR de caracteres raros o fuera del repertorio Unicode basico, donde identificar la estructura del glifo es mas informativo que intentar mapearlo directamente a un punto de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder ViT-S/16 (encoder) + 4 capas decoder de 384 de anchura |
| Parametros totales | 35,2 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; entrada de imagen de 224 px) |
| Tipos de cuantizacion | fp32 e int8 (ONNX) |
| Idiomas soportados | zh, ja, ko (caracteres Han en contextos chino, japones y coreano) |
| Licencia | MIT (pesos y codigo); las fuentes y etiquetas conservan sus propios terminos |
| Formato de pesos | PyTorch (`.pt`, state dict `GlyphIDS`) y ONNX (encoder y decoder separados en fp32 e int8) |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder tipo transformer para image-to-text. El encoder es un ViT-S/16 que procesa imagenes de 224 px; el decoder tiene cuatro capas de anchura 384 y genera tokens IDS sobre un vocabulario de 10.428 entradas, donde un caracter con selector de variacion se trata como un unico token. La decodificacion incorpora una mascara de pila de operandos IDS que impone restricciones estructurales a la secuencia generada, de modo que el modelo no produce combinaciones de operadores sintacticamente invalidas.

El entrenamiento parte del checkpoint v0.4 y se prolonga tres epocas. El conjunto de datos comprende 159.521 imagenes sobre 95.927 caracteres Han en las tipografias Noto Serif CJK JP, IPAmj Mincho 006.01 y Jigmo, con caracteres de test y validacion reservados. La mitad de las filas se generan con renders ajustados a la tinta con margenes de 6 a 30 px, y una quinta parte de cada lote se compone como `⿰AB` o `⿱AB` a partir de dos glifos de una misma fuente, evitando que la lectura unificada de algun componente coincida con una etiqueta de validacion o test. Se usa AdamW con learning rate 1e-5 para el encoder y 5e-5 para el decoder, batch de 32, precision bf16 y una sola semilla.

## Capacidades

- Lectura de secuencias IDS a partir de imagenes de glifos Han en tipografias serif Mincho y Song.
- Salida de la lectura de la forma impresa, la lectura unificada y una puntuacion de confianza por linea.
- Generacion con beam search y candidatos clasificados mediante `--top-k`.
- Manejo de caracteres con selectores de variacion como token unico, relevante para variantes regionales de un mismo caracter.
- Soporte de glifos compuestos de dos componentes (`⿰AB`, `⿱AB`) presentes en el entrenamiento.
- Exportacion ONNX en fp32 e int8, con demo ejecutable en navegador a partir del par int8.
- Capacidad multilingue limitada al ambito CJK (chino, japones, coreano) en lo que respecta a caracteres Han.
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo de vision especializado de un solo paso.

## Casos de uso

- Digitalizacion de textos historicos con tipografias serif: procesar recortes de glifos y obtener su descomposicion IDS para catalogar caracteres raros o variantes que no tienen punto de codigo Unicode asignado.
- Catalogacion tipografica y estudios de fuentes: comparar la lectura IDS de un mismo caracter renderizado en distintas fuentes (Noto Serif CJK JP, IPAmj Mincho, Jigmo) para documentar diferencias de forma impresa entre tradiciones regionales.
- Preprocesamiento en pipelines de OCR de CJK: usar la salida IDS como representacion intermedia robusta para caracteres ambiguos o de baja frecuencia antes de intentar el mapeo a Unicode.
- Herramientas de edicion y anotacion de glifos: sugerir automaticamente la estructura de un glifo dibujado o escaneado para acelerar la creacion de entradas en bases de datos de caracteres.
- Investigacion en humanidades digitales: generar descripciones estructurales de glifos para corpus de textos japoneses, chinos o coreanos clasicos donde las variantes graficas son frecuentes.
- Aplicaciones web interactivas de consulta de caracteres: desplegar el par ONNX int8 (40,2 MB) en el navegador para ofrecer lectura IDS en tiempo real sin backend, como ya hace la demo del autor.
- Control de calidad en digitalizacion de fuentes: detectar glifos cuya forma impresa no coincide con la lectura unificada esperada, señalando posibles errores de diseno o de mapeo.

## Benchmarks y rendimiento

Resultados publicados en la model card, con caracteres reservados y comparacion contra referencias derivadas de BabelStone (181 de las referencias revisadas manualmente contra la imagen):

| Track | v0.4 exact | v0.5 exact | v0.5 same-axis structure |
|---|---:|---:|---:|
| Clean renders, 8.730 imagenes de 4.752 caracteres | 80,05 % | **83,77 %** | 84,07 % |
| Other styles, 1.346 imagenes | 87,15 % | **90,64 %** | 90,64 % |
| Reviewed sample, 181 imagenes | 82,67 % | 83,50 % | 83,50 % |

En el track de renders limpios la ganancia pareada sobre v0.4 es de 3,72 puntos (intervalo del 95 %: 3,09 a 4,31); en la muestra revisada la ganancia queda dentro del ruido. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 35,2 M de parametros el checkpoint en fp32 ocupa del orden de 140 MB y el par ONNX int8 completo 40,2 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no requiere A100 ni H100. Una RTX 4090 o similar queda muy sobredimensionada para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en GPUs integradas; el par int8 esta pensado para ejecutarse en navegador.
- Opciones de despliegue: PyTorch nativo mediante el paquete `han2ids` (`pip install git+https://github.com/mkpoli/han2ids`), y ONNX Runtime para el par encoder/decoder en fp32 o int8. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; el unico dato indirecto es que el par int8 de 40,2 MB se ejecuta en el navegador en la demo del autor.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos directamente comparables en la tarea de lectura de secuencias IDS desde imagen de glifo. Como referencia de categoria (image-to-text sobre CJK) podrian citarse OCR genericos multilingues, pero no se dispone de sus especificaciones ni resultados en esta tarea concreta, por lo que la comparacion cuantitativa no esta disponible.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| han2ids v0.5 | 35,2 M | no aplica (imagen 224 px) | Lectura IDS de glifos Han serif | MIT | Hugging Face + ONNX |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo cubre tipografias serif Mincho y Song; las tipografias Kai, sans y la escritura manual quedan explicitamente fuera del alcance.
- Las referencias de evaluacion estan mayoritariamente sin revisar, y una secuencia regional puede diferir de la forma que imprime una fuente concreta.
- Solo la familia 鄉 dispone de etiquetas de forma hasta la fecha, segun la model card.
- La confianza reportada es la media geometrica de las probabilidades de token y no esta calibrada, por lo que no debe interpretarse como probabilidad de acierto.
- Riesgo de error en caracteres compuestos o poco frecuentes: la tasa de acierto exacto en renders limpios es del 83,77 %, lo que implica un porcentaje no despreciable de lecturas incorrectas.
- No es un OCR general ni un modelo de lenguaje: no genera texto libre, no responde a instrucciones y no admite tool calling.
- La licencia MIT cubre codigo y pesos, pero las fuentes (Noto CJK con SIL OFL 1.1, IPAmj Mincho con IPA Font License 1.0, Jigmo con CC0) y las etiquetas de BabelStone conservan sus propios terminos; conviene revisar `NOTICE.md` antes de un uso comercial o de redistribucion.
- El modelo se entreno con una sola semilla, lo que limita la estimacion de varianza en los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mkpoli/han2ids-v0.5
- Repositorio de codigo: https://github.com/mkpoli/han2ids
- Resultados completos del benchmark: https://github.com/mkpoli/han2ids/blob/main/benchmark/RESULTS.md
- Etiquetas BabelStone IDS: https://www.babelstone.co.uk/CJK/IDS.TXT
- Fuente Noto CJK: https://github.com/notofonts/noto-cjk
- Fuente IPAmj Mincho: https://moji.or.jp/mojikiban/font/
- Fuente Jigmo: https://kamichikoichi.github.io/jigmo/

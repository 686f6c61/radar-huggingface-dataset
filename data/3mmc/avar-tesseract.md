# 3mmc/avar-tesseract

## Resumen

`3mmc/avar-tesseract` (fichero `ava_v9.traineddata`) es un modelo LSTM de Tesseract 5 para reconocimiento optico de caracteres (OCR) de **avar (авар мацӀ)** en escritura cirilica. Lo publica el usuario `3mmc` y se distribuye como un *finetune* de `tessdata_best/Cyrillic`, el modelo cirilico oficial del proyecto Tesseract. Su ambito son materiales linguisticos avar-rusos escaneados: diccionarios bilingues, gramaticas y manuales, con especial atencion a la imprenta tipografica de epoca sovietica.

El problema que resuelve es muy concreto: el fichero `ava.traineddata` que circula en la practica no fue entrenado con texto avar, sino que es el `Cyrillic.traineddata` original con dos entradas del *unicharset* renombradas (U+0406 `І` → U+04C0 `Ӏ` y U+0456 `і` → U+04CF `ӏ`), con pesos identicos a los de origen. Ese modelo descarta la *palochka*, emite `]` o genera U+04CF donde el avar exige U+04C0. Este modelo reentrena la red para emitir los puntos de codigo correctos, algo critico para indexacion y busqueda de texto.

No es un modelo de lenguaje ni un transformer: es un reconocedor de lineas de texto de Tesseract (LSTM sobre caracteristicas de imagen), con un fichero float de 11 MB, licencia Apache-2.0 y soporte declarado para avar (`av`) y ruso (`ru`). El repositorio de HuggingFace ocupa 0,0 GB y registra 0 descargas y 0 *likes* en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM de reconocimiento de lineas de Tesseract 5 (no es transformer ni MoE) |
| Parametros totales | no disponible (fichero float de 11 MB) |
| Longitud de contexto | no aplica: la unidad de proceso es la linea de texto y la pagina se usa como contexto de segmentacion |
| Tipos de cuantizacion | no disponible; se publica un unico modelo float de 11 MB |
| Idiomas soportados | avar (`av`) y ruso (`ru`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.traineddata` (Tesseract >= 5.0), instalable en `TESSDATA_PREFIX` |
| Tarea principal | image-to-text (OCR) |
| Modelo base | `tessdata_best/Cyrillic` (Apache-2.0), relacion: finetune |
| Version | `ava_v9` |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion | 2026-10-14 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo es un reconocedor LSTM de Tesseract 5, es decir, una red recurrente que opera sobre caracteristicas extraidas de imagenes de lineas de texto, integrada en el *pipeline* clasico de Tesseract: binarizacion, analisis de disposicion de pagina, segmentacion en lineas, reconocimiento y postproceso linguistico. El punto de partida son los pesos de `tessdata_best/Cyrillic`, sobre los que se hace *fine-tuning* para adaptar el juego de caracteres y las formas tipograficas al avar.

Los datos de entrenamiento consisten en renders sinteticos de lineas de texto avar en varias familias serif, mas lineas extraidas de libros avar escaneados y corregidas donde dos motores de OCR discrepaban. Se aplico aumento de datos con acentos de estres sinteticos (para evitar que los glosados rusos acentuados se leyeran como `ё`) y sustitucion de *palochka*: se dibujan `1`, `I`, `l` o `|` en posicion de palochka mientras la transcripcion de referencia usa `Ӏ`. Los libros escaneados y las imagenes de lineas estan sujetos a derechos de autor y no se distribuyen.

El detalle tecnico mas relevante es la supervision de puntos de codigo. En el corpus de evaluacion de un Coran avar, donde la *palochka* se compone como el digito `1`, el modelo renombrado que circula emite `Ӏ` U+04C0 en el 22 % de las posiciones; `ava_v9` lo hace en el 99 %. El modelo normaliza la palochka a U+04C0 con independencia de si la pagina imprime `Ӏ`, la `I` latina o el digito `1`.

## Capacidades

- Reconocimiento optico de caracteres en cirilico para avar, con salida de texto plano por pagina o por linea.
- Emision correcta de la *palochka* (U+04C0 `Ӏ`) y normalizacion de variantes tipograficas (`Ӏ`, `I` latina, `1`) al punto de codigo canonico.
- Lectura de material linguistico avar-ruso: diccionarios bilingues, gramaticas y manuales con mezcla de alfabetos y glosas rusas.
- Manejo de imprenta tipografica de epoca sovietica, con tamaños de tipo y columnas heterogeneos.
- Soporte declarado de ruso (`ru`) como idioma secundario, derivado del modelo base cirilico.
- Parametro de configuracion de segmentacion de pagina (`--psm`); el autor recomienda `--psm 3` y advierte que forzar `--psm 6` cuesta mas de un punto de CER en libros con tamaños de tipo mezclados o columnas.
- No dispone de *tool calling*, razonamiento multi-paso, capacidades de agente, vision generativa ni modo de pensamiento: es exclusivamente un motor de OCR.

## Casos de uso

- **Digitalizacion de diccionarios y gramaticas avar-sovieticos**: el modelo esta especializado en *letterpress* de la era sovietica, que es precisamente el formato de la mayor parte del fondo bibliografico avar. Se ejecutaria sobre escaneos a 300 DPI con `tesseract page.png out -l avar --psm 3` para obtener texto plano alineado con la capa de texto del PDF.
- **Construccion de corpus linguisticos y buscadores de texto avar**: como el CER bajo no basta si los puntos de codigo son incorrectos, la emision fiable de U+04C0 hace que los indices de busqueda no se fragmenten entre `Ӏ`, `I` y `1`. Un buscador sobre una biblioteca digital avar necesita esta consistencia para que una consulta con palochka encuentre todas las variantes tipograficas.
- **Preservacion digital de patrimonio en lenguas caucasicas de bajos recursos**: el avar es una lengua de bajos recursos; digitalizar su fondo impreso permite disponer de texto reutilizable para investigacion, ensenanza y reedicion.
- **Alimentacion de modelos de PLN para avar**: el texto OCR corregido puede servir como corpus para entrenar o evaluar modelos de traduccion automatica, etiquetado morfologico o modelos de lenguaje en avar, un dominio donde practicamente no existen corpus digitales.
- **Transcripcion de textos religiosos impresos**: el caso documentado por el autor es un Coran avar en el que la palochka se compone como el digito `1`; el modelo normaliza esas posiciones, algo que ningun modelo generico hace de forma fiable.
- **Pipelines de digitalizacion masiva en servidor**: al ser un `.traineddata` de 11 MB ejecutable en CPU, se puede desplegar en granjas de digitalizacion sin GPU, procesando lotes de PDFs pagina a pagina con `pytesseract`, `tesserocr` u OCR-D, y encadenando despues correccion ortografica o revision humana alli donde el modelo declara errores residuales.
- **Revision y control de calidad de OCR previo**: dado que su ventaja es la fidelidad de puntos de codigo, puede usarse como segundo motor en esquemas de votacion con PaddleOCR o con `rus` de Tesseract, resolviendo discrepancias en caracteres avar especificos.

## Benchmarks y rendimiento

Tasa de error de caracter (CER) medida a `--psm 3`, con las variantes de palochka plegadas antes de puntuar. Las paginas se renderizaron a 300 DPI y se evaluaron contra la capa de texto del propio PDF, excluyendo del entrenamiento las paginas de referencia.

| Modelo | Diccionario (1993) | Manual (2018) | Monografia | Alekseev & Ataev |
|---|---|---|---|---|
| `rus` de origen (stock) | 4,93 % | 4,40 % | 4,91 % | 4,01 % |
| PaddleOCR `cyrillic_PP-OCRv5` | 5,62 % | 1,74 % | 3,47 % | 2,44 % |
| `ava` renombrado (el que circula) | 3,41 % | 2,31 % | 3,60 % | 3,17 % |
| **`ava_v9` (este modelo)** | **1,84 %** | 1,83 % | **3,43 %** | 2,70 % |

Los tres primeros libros aportaron lineas de entrenamiento, con las paginas de evaluacion excluidas. Alekseev & Ataev no se uso para entrenar en ninguna forma, por lo que es la unica prueba de generalizacion.

Correccion de puntos de codigo en posicion de palochka, sobre ocho paginas de un Coran avar (pp. 900-907) en el que la palochka se compone como el digito `1`:

| Modelo | `Ӏ` U+04C0 | digito `1` | otro | correcto |
|---|---|---|---|---|
| `ava` renombrado (el que circula) | 121 | 396 | 30 | 22 % |
| **`ava_v9`** | 523 | 4 | 1 | **99 %** |

No se han publicado otros resultados de benchmarks (por ejemplo MMLU, HumanEval o GSM8K) en la informacion disponible, y no serian aplicables a un modelo de OCR.

## Requisitos de hardware

- **VRAM**: no requiere GPU; el modelo es un fichero float de 11 MB que se ejecuta en CPU. La memoria necesaria es la del proceso de Tesseract mas las imagenes de pagina, del orden de decenas o centenas de MB segun resolucion y numero de hilos.
- **GPU recomendadas**: no aplica. Tesseract no necesita GPU para inferencia; el despliegue tipico es CPU.
- **GPU de consumo**: irrelevante para este modelo; cabe en cualquier maquina, incluida una Raspberry Pi, siempre que la CPU y la RAM soporten el proceso de OCR.
- **CPU**: cualquier x86-64 o ARM moderno con soporte para las instrucciones que use la compilacion de Tesseract; el rendimiento escala con nucleos e hilos (`OMP_THREAD_LIMIT`).
- **Software**: Tesseract >= 5.0, con el fichero instalado como `$TESSDATA_PREFIX/avar.traineddata`.
- **Opciones de despliegue**: CLI de Tesseract, `pytesseract`, `tesserocr`, OCR-D, contenedores Docker con Tesseract. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan pensados para modelos generativos.
- **Latencia y throughput estimados**: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | CER (manual 2018 / Alekseev) | Palochka correcta | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **`ava_v9` (este modelo)** | LSTM Tesseract 5 | av, ru | 1,83 % / 2,70 % | 99 % | Apache-2.0 | HuggingFace, 11 MB |
| `ava` renombrado (el que circula) | LSTM Tesseract, pesos identicos al base | av (nominal), ru | 2,31 % / 3,17 % | 22 % | segun procedencia | en circulacion |
| `rus` de origen (stock) | LSTM Tesseract | ru | 4,40 % / 4,01 % | no medida | Apache-2.0 (tessdata) | oficial |
| PaddleOCR `cyrillic_PP-OCRv5` | deteccion + reconocimiento (familia PP-OCR v5) | cirilico | 1,74 % / 2,44 % | no medida | Apache-2.0 | PaddleOCR |

La comparacion relevante es doble: frente a Tesseract, `ava_v9` gana claramente en imprenta sovietica y en emision de puntos de codigo avar; frente a PaddleOCR PP-OCRv5, el modelo generico es mejor en impresion offset moderna (manual de 2018 y Alekseev). El propio autor reconoce que la ventaja de `ava_v9` se limita al *letterpress* sovietico y a la correccion de codepoints, no a una superioridad general.

## Limitaciones y advertencias

- **En impresion offset moderna rinde peor que un modelo generico**: PaddleOCR PP-OCRv5 supera a `ava_v9` en el manual de 2018 y en Alekseev & Ataev.
- **La generalizacion se apoya en un unico libro reservado**: en Alekseev el modelo esta dentro del ruido estadistico respecto a sus predecesores, no es claramente mejor.
- **La supervision de la palochka es sintetica**: la unica evidencia de que transfiere a impresion real es la comprobacion sobre un Coran, es decir, un solo libro.
- **Errores residuales documentados**: `е` → `ё` espurio en entradillas en negrita y mayusculas, confusion entre coma y punto en cuerpos de texto pequenos, y vocales duplicadas ocasionales en entradillas en mayusculas (por ejemplo `БАЧӀИИН` en lugar de `БАЧӀИН`).
- **Configuracion de segmentacion sensible**: forzar `--psm 6` cuesta mas de un punto de CER en libros con tamaños de tipo mezclados o columnas; el autor recomienda `--psm 3`.
- **Datos de entrenamiento no distribuidos**: los libros escaneados y las imagenes de lineas estan bajo derechos de autor y no se publican, lo que limita la reproducibilidad del entrenamiento.
- **Idiomas limitados**: solo avar y ruso; no hay soporte de otras lenguas caucasicas ni de alfabetos no cirilicos.
- **Riesgo de alucinacion en el sentido generativo**: no aplica, porque el modelo no genera texto libre; el riesgo equivalente es la sustitucion silenciosa de caracteres, mitigada parcialmente por la normalizacion de codepoints, pero no eliminada en otros caracteres.
- **Licencia**: Apache-2.0, la misma que el modelo base, por lo que el uso comercial esta permitido; conviene verificar la procedencia de los datos de entrenamiento no distribuidos si se reutilizara el modelo como base para nuevos entrenamientos.
- **Adopcion nula en el momento de la ficha**: 0 descargas y 0 *likes*, sin evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/3mmc/avar-tesseract
- Modelo base `tessdata_best/Cyrillic`: https://github.com/tesseract-ocr/tessdata_best
- Busqueda web realizada: los resultados devueltos no guardan relacion con el modelo (corresponden a la sustancia 3-MMC) y no aportan enlaces utiles sobre OCR, avar o Tesseract.

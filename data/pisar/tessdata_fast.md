# pisar/tessdata_fast

## Resumen

`pisar/tessdata_fast` es un repositorio de datos de modelos entrenados (traineddata) para el motor OCR LSTM de Tesseract 4 y 5, empaquetados como versiones enteras de 8 bits optimizadas para velocidad. No se trata de un modelo de lenguaje ni de una red neuronal generativa, sino de un conjunto de ficheros de pesos y metadatos que el motor Tesseract carga en tiempo de ejecución para realizar reconocimiento óptico de caracteres sobre imágenes de texto. La autoría del repositorio en Hugging Face corresponde al usuario `pisar`, aunque el contenido son los modelos oficiales del proyecto Tesseract mantenidos por su comunidad.

El interés de estos ficheros radica en que son el formato que distribuciones Linux como Ubuntu 18.04 y Debian empaquetan por defecto (`tesseract-ocr-LANG` y `tesseract-ocr-script-SCRIPT`), por lo que constituyen la vía más extendida para desplegar OCR en producción sin dependencias pesadas. La variante `fast` sacrifica cierta precisión frente a `best` a cambio de menor latencia y menor huella de memoria, lo que la hace adecuada para pipelines de digitalización masiva, indexación de documentos o procesamiento en dispositivos con recursos limitados.

El repositorio ocupa aproximadamente 0,7 GB e incluye modelos por idioma (códigos ISO de tres letras, como `eng`, `hin`, `jpn`) y modelos por escritura (códigos de cuatro letras, como `latn`, `deva`, `script-latn`). La información pública del repositorio no proporciona métricas de benchmarks, número de parámetros ni detalles de licencia más allá de la mención a Apache-2.0 en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red LSTM del motor OCR de Tesseract 4/5 (modelos enteros de 8 bits, "integerized") |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (OCR por lineas de texto; no hay ventana de contexto) |
| Tipos de cuantizacion | Enteros de 8 bits (INT8) sobre la configuracion de red de mejor relacion velocidad/precision |
| Idiomas soportados | Multiples idiomas por codigo ISO de tres letras y modelos por escritura (latn, deva, etc.); el listado completo no esta detallado en la informacion disponible |
| Licencia | Apache-2.0 (segun el fichero LICENSE citado en la model card) |
| Formato de pesos | Ficheros `.traineddata` de Tesseract (contenedor binario con pesos LSTM y metadatos) |

## Arquitectura y entrenamiento

Los ficheros `.traineddata` contienen una red neuronal recurrente de tipo LSTM que Tesseract utiliza para el reconocimiento de lineas de texto. La variante `fast` parte de la configuracion de red que ofrecia la mejor relacion velocidad/precision y posteriormente se "enteriza" (integeriza) a 8 bits para reducir el coste computacional y el tamano del fichero. Esta cuantizacion impide el reentrenamiento incremental o el fine-tuning sobre estos modelos, ya que los pesos enteros no admiten el flujo de entrenamiento en coma flotante que espera Tesseract.

Segun la model card, los modelos para lenguas latinas se entrenaron con aproximadamente 400.000 lineas de texto procedentes de unas 4.500 fuentes tipograficas. Para otras escrituras el numero de fuentes disponibles es mucho menor (por ejemplo, Devanagari con unas 50 fuentes y Kannada con 15), por lo que se mezclaron datos de ingles para aprovechar la diversidad tipografica y mejorar la generalizacion; de ahi que los modelos por escritura incluyan tambien ingles, salvo en cirilico por problemas de ambiguedad. Existen modelos especificos como `jpn_vert` para texto vertical, que `jpn` carga como idioma secundario para intentar el reconocimiento en esa orientacion.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de texto con el motor LSTM de Tesseract 4 y 5.
- Soporte de modelos por idioma individual (codigos ISO de tres letras) y por escritura compartida entre varios idiomas.
- Modelos especificos para escrituras como latin, fraktur, devanagari, cirilico (excluido de la mezcla con ingles) y variantes como vietnamita.
- Reconocimiento de texto vertical en japones mediante `jpn_vert` cargado como idioma secundario.
- Integracion con el ecosistema de distribuciones Linux mediante paquetes `tesseract-ocr-LANG` y `tesseract-ocr-script-SCRIPT`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un motor OCR.
- No soporta vision generativa ni comprension de imagenes mas alla del reconocimiento de caracteres.

## Casos de uso

- Digitalizacion masiva de documentos escaneados: el modelo OCR convierte imagenes de paginas en texto plano para su indexacion posterior, aprovechando la variante `fast` para reducir el tiempo por pagina en lotes de miles de documentos.
- Indexacion de archivos PDF en buscadores internos: al integrarse en pipelines de extraccion de texto (por ejemplo, con Tesseract CLI o la API de Python), permite poblar indices de busqueda full-text sobre documentos historicos o facturas.
- Procesamiento OCR en dispositivos con recursos limitados: al ser modelos INT8 y ligeros, caben en entornos de contenedor o en hardware sin GPU, lo que facilita su despliegue en Raspberry Pi o servidores modestos.
- Extraccion de datos de formularios y facturas: combinado con post-proceso basado en expresiones regulares o parsers, el texto reconocido alimenta sistemas de contabilidad o ERP.
- Accesibilidad: conversion de imagenes de texto en audio o en texto seleccionable para lectores de pantalla, usando el modelo del idioma correspondiente.
- Preprocesamiento para pipelines de NLP: el texto extraido por Tesseract puede enviarse despues a modelos de lenguaje o clasificadores, de modo que el OCR actua como primera etapa del flujo.
- Digitalizacion multilingue: el uso de modelos por escritura (por ejemplo, `script-latn` o `script-deva`) permite cubrir varios idiomas con un solo fichero cuando no se dispone de modelos individuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision (CER/WER), latencia ni throughput comparativas con la variante `best` u otros motores OCR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; Tesseract ejecuta el OCR en CPU por defecto y no requiere GPU.
- GPU recomendadas: no aplica; el motor LSTM de Tesseract esta pensado para ejecucion en CPU.
- Compatibilidad con GPU de consumo: no aplica en el flujo estandar de Tesseract.
- Opciones de despliegue: binario `tesseract` (CLI), API de Python (`pytesseract`), enlaces de C/C++ contra `liblept` y `libtesseract`, y paquetes de distribucion (`tesseract-ocr-LANG` en Debian/Ubuntu).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del tamano de imagen, del idioma y del hardware.
- Huella en disco: el repositorio completo ocupa aproximadamente 0,7 GB, aunque cada fichero `.traineddata` individual es mucho menor.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|
| `pisar/tessdata_fast` | Modelos Tesseract LSTM | INT8 | Apache-2.0 (segun model card) | Velocidad, tamano reducido |
| `tessdata_best` (Tesseract) | Modelos Tesseract LSTM | Coma flotante | Apache-2.0 | Mayor precision, permite fine-tuning |
| EasyOCR | Redes CNN/CRNN | Coma flotante | Apache-2.0 | OCR multilingue basado en deep learning |
| PaddleOCR | Deteccion + reconocimiento | Varias | Apache-2.0 | OCR industrial con deteccion de layout |

La comparacion detallada de parametros y contexto no aplica porque ninguno de estos sistemas es un modelo de lenguaje; la eleccion entre `fast` y `best` depende del compromiso entre latencia y precision, y frente a EasyOCR o PaddleOCR la diferencia esta en el ecosistema de despliegue y en el soporte de escrituras.

## Limitaciones y advertencias

- Al ser modelos enteros de 8 bits, no admiten fine-tuning ni entrenamiento incremental; para adaptar el modelo a un dominio concreto hay que partir de `tessdata_best` o de los datos de entrenamiento originales.
- Solo funcionan con el motor LSTM de Tesseract 4 y 5; los modos `oem` 0 y 2 (motor legacy) no son compatibles con estos ficheros.
- La variante `fast` prioriza velocidad sobre precision; en la propia model card se indica que para la mayoria de idiomas no es la mejor opcion en calidad.
- El modelo `frk` esta obsoleto y renombrado a `deu_latf`; los proyectos que aun lo referencien deben migrar al nuevo nombre.
- La mezcla con ingles en los modelos por escritura puede introducir sesgos hacia caracteres latinos en textos de otras escrituras.
- No se dispone de informacion sobre sesgos especificos, tasas de alucinacion (no aplica a OCR) ni limitaciones de contexto mas alla de las propias del reconocimiento por lineas.
- La licencia se declara Apache-2.0 en la model card, pero la ficha de Hugging Face no la expone en el campo de licencia; conviene verificar el fichero LICENSE del repositorio antes de un uso comercial.
- El repositorio no incluye demos, papers ni resultados de evaluacion, por lo que la validacion en produccion debe hacerse con datos propios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pisar/tessdata_fast
- Proyecto Tesseract en GitHub: https://github.com/tesseract-ocr/tesseract
- Documentacion de ficheros de datos de Tesseract: https://tesseract-ocr.github.io/tessdoc/Data-Files
- Repositorio oficial de tessdata (referencia de los modelos): https://github.com/tesseract-ocr/tessdata

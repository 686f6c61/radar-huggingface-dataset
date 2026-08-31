# dh-unibe/kraken-medieval-german-v2

## Resumen

El modelo `dh-unibe/kraken-medieval-german-v2` es un sistema de reconocimiento de texto manuscrito (HTR, por sus siglas en inglés) desarrollado por el Digital Humanities unit de la Universidad de Berna (dh-unibe). Está especializado en la transcripción automática de documentos históricos en alemán medieval y moderno temprano, un dominio donde los sistemas OCR convencionales fallan por la variabilidad caligráfica y la degradación del soporte. Se basa en el motor Kraken, un framework de código abierto para OCR/HTR, y parte del modelo base `kraken-early_modern_german`, al que se le ha realizado un ajuste fino con corpus específicos de manuscritos suizos y alemanes de los siglos XIV a XVII.

El modelo resuelve el problema de la transcripción masiva de archivos históricos que, de otro modo, requeriría horas de trabajo manual de paleógrafos. Su relevancia actual radica en la creciente digitalización de fondos archivísticos europeos y en la necesidad de herramientas precisas para corpus con grafías no normalizadas, abreviaturas y estilos de escritura muy diversos. La arquitectura concreta (número de capas, tipo de red neuronal, parámetros totales) no se documenta en la ficha pública, pero al tratarse de un modelo Kraken, emplea típicamente redes convolucionales y recurrentes (CNN + BLSTM) con conexión temporal conexionista (CTC) para la decodificación. El tamaño del repositorio es de 0.0 GB, lo que sugiere que los pesos se sirven desde un almacenamiento externo o que la cuantificación es muy agresiva, aunque este dato no se especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (framework Kraken, tipicamente CNN + BLSTM + CTC) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica, es un modelo de imagen a texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | aleman historico (medieval y moderno temprano), segun los corpus de entrenamiento |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio usa la libreria kraken, probablemente archivos .mlmodel o .pt) |

## Arquitectura y entrenamiento

Kraken es un motor de OCR/HTR de codigo abierto mantenido por la comunidad mittagessen. Los modelos Kraken suelen combinar una red convolucional para la extraccion de caracteristicas visuales con una capa recurrente bidireccional (BLSTM) que modela secuencias, y una capa de salida CTC que alinea las predicciones con las transcripciones sin necesidad de segmentacion previa a nivel de caracter. El modelo `kraken-medieval-german-v2` parte del checkpoint `kraken-early_modern_german` y se ha ajustado con cuatro datasets publicados por dh-unibe, todos ellos compuestos por imagenes de paginas y sus transcripciones diplomaticas:

- `dh-unibe/image-text_rats-und-richtebuecher_xv-xvi`: libros de actas municipales y judiciales de los siglos XV y XVI.
- `dh-unibe/image-text_bullinger-autoren`: correspondencia y escritos de Heinrich Bullinger y sus corresponsales (reforma suiza).
- `dh-unibe/image-text_koenigsfelden-charters-post-1500`: documentos notariales del convento de Koenigsfelden posteriores a 1500.
- `dh-unibe/image-text_aaeb-xiv-xvii`: documentos variados de los siglos XIV a XVII.

El entrenamiento se realizo con el servicio `serving-atr-inference` (repositorio `thodel/serving-atr-inference`) y los pesos publicados corresponden al mejor checkpoint de validacion, no al ultimo epoch. La evaluacion se hizo sobre un split de validacion propio, con particion a nivel de pagina y semilla fija (partition=0.9, seed=42), de modo que ninguna pagina contribuye lineas a ambos lados del split. No se han publicado metricas numericas (CER, WER) en la model card.

## Capacidades

- Reconocimiento de texto manuscrito historico en aleman medieval y moderno temprano, incluyendo grafias no normalizadas, abreviaturas y ligaduras.
- Transcripcion de imagenes de paginas completas o lineas individuales a texto plano, mediante el pipeline image-to-text de Kraken.
- Adaptacion a multiples estilos caligraficos gracias al entrenamiento sobre corpus heterogeneos (actas municipales, correspondencia, documentos notariales).
- Integracion con el ecosistema Kraken: puede usarse desde la CLI de Kraken, desde Python (API `kraken`), o mediante servidores de inferencia como `serving-atr-inference`.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo de vision por computador aplicado a OCR.
- Capacidades multilingues limitadas al aleman historico; no se ha entrenado para otros idiomas.

## Casos de uso

- Digitalizacion de archivos municipales y judiciales: transcripcion automatica de los Rats- und Richtebücher (libros de actas) de ciudades suizas y alemanas, permitiendo busqueda textual y analisis cuantitativo de la administracion local.
- Investigacion historica sobre la Reforma: procesamiento de la correspondencia de Heinrich Bullinger y sus corresponsales, facilitando la edicion critica digital y el estudio de redes epistolares.
- Catalogacion de documentos notariales: transcripcion de escrituras y cartas del convento de Koenigsfelden, agilizando la indexacion en archivos y bibliotecas.
- Generacion de corpus de entrenamiento para otros modelos: las transcripciones producidas pueden servir como ground truth para entrenar modelos HTR mas generales o para tareas de post-OCR.
- Enriquecimiento de repositorios digitales: integracion en pipelines de digitalizacion masiva (por ejemplo, con `kraken` + `ocropy`) para producir texto completo de manuscritos que solo existian como imagenes.
- Asistencia a paleografos: pre-transcripcion de paginas que luego son corregidas por expertos, reduciendo el tiempo de edicion en proyectos de publicacion de fuentes historicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de evaluacion con las metricas CER, WER, muestras puntuadas, caracteres puntuados y errores de caracter, pero todos los valores aparecen como guiones (—), lo que indica que no se han hecho publicos. El autor advierte explicitamente que la evaluacion se realizo sobre el split de validacion propio del run y que no es comparable con otros corpus ni con benchmarks compartidos.

## Requisitos de hardware

- No se dispone de datos especificos de VRAM, latencia o throughput para este modelo concreto.
- Los modelos Kraken de tamano tipico (del orden de 10-50 MB en pesos) son ligeros y pueden ejecutarse en CPU sin GPU. Una CPU moderna con 4-8 nucleos es suficiente para inferencia en lotes pequenos.
- Para procesamiento masivo de archivos completos, se recomienda una GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior) para acelerar la inferencia.
- El despliegue puede hacerse con la CLI de Kraken (`kraken -i imagen.png -o salida.txt`), con la API Python, o mediante contenedores como `thodel/kraken-htr-space` para entrenamiento local.
- Para produccion a gran escala, se puede servir el modelo con `serving-atr-inference` (repositorio `thodel/serving-atr-inference`), que expone una API REST.
- No se han publicado mediciones de throughput; en la practica, los modelos Kraken procesan una linea de texto en decenas de milisegundos en GPU y en unos pocos cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Framework | Enfoque | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dh-unibe/kraken-medieval-german-v2` | Kraken | HTR de manuscritos historicos alemanes | Aleman historico | No disponible | Hugging Face |
| `kraken-early_modern_german` (base) | Kraken | HTR de aleman moderno temprano | Aleman historico | No disponible | Repositorio de modelos Kraken |
| Tesseract (con modelo de aleman) | Tesseract | OCR de texto impreso | Aleman moderno | Apache 2.0 | Open source |
| Transkribus (modelos propietarios) | Transkribus | HTR de manuscritos historicos | Multiidioma | Propietaria | Plataforma comercial |

La comparacion directa no es posible sin datos de benchmarks. Tesseract no esta disenado para manuscritos y su rendimiento en este dominio es muy inferior. Transkribus ofrece modelos comerciales con metricas publicadas, pero no son comparables por falta de datos de este modelo. El modelo base `kraken-early_modern_german` es el punto de partida natural para comparar la mejora obtenida con el ajuste fino, pero no se publican metricas de ninguno de los dos.

## Limitaciones y advertencias

- No se ha publicado la licencia del modelo, lo que impide conocer si su uso comercial esta permitido. Se recomienda contactar con dh-unibe antes de utilizarlo en proyectos con fines lucrativos.
- La evaluacion se realizo sobre un split de validacion propio y no sobre un benchmark compartido; los resultados no son extrapolables a otros corpus o epocas.
- El modelo esta especializado en aleman historico de los siglos XIV a XVII y en estilos caligraficos concretos (actas, correspondencia, documentos notariales). Su rendimiento en otros idiomas, epocas o tipos de escritura (por ejemplo, letra humanistica italiana) sera previsiblemente bajo.
- Al ser un modelo de reconocimiento de imagenes, no genera texto creativo ni razonamiento; no presenta riesgo de alucinacion en el sentido de los LLM, pero puede producir errores de transcripcion (confusion de caracteres, omisiones) que deben ser revisados por un experto.
- El repositorio tiene un tamano declarado de 0.0 GB, lo que sugiere que los pesos no estan alojados directamente en Hugging Face o que se sirven mediante enlaces externos; verificar la disponibilidad real antes de su uso.
- No se proporcionan instrucciones de uso, parametros de inferencia recomendados (por ejemplo, umbrales de confianza) ni ejemplos de ejecucion en la model card.
- Los datasets de entrenamiento contienen documentos historicos con grafias no normalizadas y posibles errores de transcripcion en el ground truth; el modelo puede heredar esos sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dh-unibe/kraken-medieval-german-v2
- Repositorio Kraken (motor OCR): https://github.com/mittagessen/kraken
- Servicio de entrenamiento `serving-atr-inference`: https://github.com/thodel/serving-atr-inference
- Entrenamiento local con Kraken (kraken-htr-space): https://github.com/thodel/kraken-htr-space
- Wiki de entrenamiento de escritura alemana (UB-Mannheim): https://github-wiki-see.page/m/UB-Mannheim/kraken/wiki/Training-German-Handwriting
- Dataset `dh-unibe/image-text_rats-und-richtebuecher_xv-xvi`: https://huggingface.co/datasets/dh-unibe/image-text_rats-und-richtebuecher_xv-xvi
- Dataset `dh-unibe/image-text_bullinger-autoren`: https://huggingface.co/datasets/dh-unibe/image-text_bullinger-autoren
- Dataset `dh-unibe/image-text_koenigsfelden-charters-post-1500`: https://huggingface.co/datasets/dh-unibe/image-text_koenigsfelden-charters-post-1500
- Dataset `dh-unibe/image-text_aaeb-xiv-xvii`: https://huggingface.co/datasets/dh-unibe/image-text_aaeb-xiv-xvii

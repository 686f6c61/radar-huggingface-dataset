# small-models-for-glam/kraken-ppocrv6-tiny

## Resumen

El modelo `kraken-ppocrv6-tiny` es un reconocedor de texto en líneas (line-level OCR) desarrollado por Benjamin Kiessling en ALMAnaCH, Inria Paris, y publicado bajo la organización Small Models for GLAM. Se trata de la variante *tiny* de una familia de modelos basados en la arquitectura PP-OCRv6, adaptada para el reconocimiento de texto histórico y manuscrito en el marco de la librería Kraken. Con aproximadamente 0,69 millones de parámetros, está diseñado para ofrecer un equilibrio entre precisión y velocidad de inferencia, siendo especialmente útil en entornos con recursos computacionales limitados.

El modelo se entrena desde cero con una combinación de datos de líneas de texto manuscrito e impreso, tanto histórico como contemporáneo, cubriendo 44 lenguas y 10 escrituras (árabe, armenio, cirílico, etíope, georgiano, griego, hebreo, latino, malayalam y siríaco). Su objetivo es proporcionar un reconocimiento multilingüe de texto de alta calidad sin las alucinaciones típicas de los modelos basados en visión-lenguaje (VLM), a la vez que mantiene un rendimiento muy superior en términos de throughput. La variante *tiny* sacrifica algo de precisión frente a las variantes *small* y *medium* para lograr una huella de memoria mínima y una inferencia más rápida.

La relevancia de este modelo radica en su idoneidad para instituciones de patrimonio cultural (GLAM), donde la digitalización de documentos históricos requiere herramientas ligeras, fiables y sin dependencia de servicios en la nube. Además, al estar publicado con licencia Apache-2.0 y ser compatible con Kraken, puede integrarse fácilmente en flujos de trabajo de transcripción automática y ser afinado con conjuntos de datos específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PP-OCRv6 (CTC-based, backbone convolucional ligero + neck de modelado secuencial no recurrente) |
| Parametros totales | ~0,69 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo procesa líneas de texto de ancho variable, sin un límite de contexto especificado) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en formato safetensors sin cuantización oficial) |
| Idiomas soportados | ara, cat, ces, chu, cos, dan, deu, dum, eng, fas, fin, fra, frm, gez, gle, grc, heb, hun, ita, kat, lat, lav, lit, mal, mul, nld, nor, oci, ota, pcd, pol, por, ron, rus, slk, slv, spa, srp, swe, syr, ukr, urd, xcl, yid (44 lenguas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura PP-OCRv6, un reconocedor de líneas de texto basado en CTC (Connectionist Temporal Classification). Consiste en un backbone convolucional ligero seguido de un "neck" de modelado secuencial no recurrente, lo que reduce el coste computacional en comparación con arquitecturas recurrentes. La implementación original de PaddlePaddle se ha adaptado para el reconocimiento de texto histórico aumentando la altura de línea a 128 píxeles, eliminando el límite de ancho y el presupuesto de etiquetas CTC, y sustituyendo el optimizador por Adam con Muon.

El entrenamiento se realizó desde cero sobre un corpus diverso que combina imágenes de líneas de documentos históricos, contemporáneos y nacidos digitales, tanto manuscritos como impresos. Se utilizaron datos públicos y privados (estos últimos no redistribuibles). Para algunas lenguas se añadió datos sintéticos generados con la herramienta `pangoline`, que solo aproxima texto impreso moderno, lo que limita la precisión en lenguas que solo disponen de este tipo de datos (por ejemplo, armenio clásico y ge'ez). El texto se normalizó a Unicode NFD y se normalizaron los espacios en blanco durante el entrenamiento y la evaluación. No se aplicó una normalización unificada de las convenciones de transcripción, por lo que el modelo puede producir salidas inconsistentes en ciertos corpus.

## Capacidades

- Reconocimiento de texto manuscrito e impreso en líneas individuales, tanto histórico como contemporáneo.
- Soporte multilingüe: 44 lenguas y 10 escrituras, incluyendo árabe, armenio, cirílico, etíope, georgiano, griego, hebreo, latino, malayalam y siríaco.
- Alta velocidad de inferencia y bajo consumo de memoria gracias a su reducido número de parámetros (~0,69M).
- Ausencia de alucinaciones en comparación con modelos VLM, ya que se basa en CTC y no en generación autoregresiva.
- Facilidad de afinamiento (fine-tuning) para dominios específicos o lenguas con poco material.
- Compatible con la librería Kraken, lo que permite su integración en pipelines de segmentación y OCR.
- Procesa líneas de texto de ancho variable, sin límite de etiquetas CTC, lo que facilita su uso con documentos de formatos diversos.

## Casos de uso

- Digitalización de archivos históricos: transcripción automática de manuscritos y documentos impresos antiguos en bibliotecas y archivos, donde el modelo puede procesar líneas de texto con alta precisión y sin necesidad de GPU potentes.
- Transcripción de colecciones de manuscritos medievales: al soportar lenguas como latín, francés medio, alemán antiguo y otras, el modelo puede aplicarse a proyectos de edición digital de fuentes primarias.
- OCR de documentos administrativos contemporáneos: reconocimiento de formularios, cartas y documentos mecanografiados en múltiples idiomas, útil para empresas y administraciones que manejan material multilingüe.
- Creación de corpus de texto a partir de libros escaneados: integración en flujos de digitalización masiva donde se necesita un OCR ligero y rápido para procesar miles de páginas.
- Sistemas de accesibilidad: conversión de documentos impresos o manuscritos a texto digital para lectores de pantalla, especialmente en entornos con recursos limitados.
- Investigación en humanidades digitales: análisis de grandes volúmenes de documentos históricos transcritos automáticamente, donde la ausencia de alucinaciones es crítica para la fiabilidad de los datos.
- Prototipado de herramientas de transcripción en dispositivos embebidos: gracias a su tamaño reducido, puede desplegarse en hardware de bajo coste (Raspberry Pi, etc.) para aplicaciones de OCR local.

## Benchmarks y rendimiento

La model card reporta las siguientes métricas sobre el conjunto de test:

| Metrica | Valor |
|---|---|
| CER (tasa de error de caracteres) | 8,71 |
| WER (tasa de error de palabras) | 30,0 |
| CER macro (promedio por lengua) | 10,99 |
| WER macro (promedio por lengua) | 36,16 |

Estos valores corresponden a la variante *tiny*. La model card indica que la variante *medium* obtiene mejores resultados en el test set, mientras que *tiny* y *small* priorizan velocidad y menor huella de memoria. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Al tratarse de un modelo de solo 0,69 millones de parámetros, puede ejecutarse en CPU sin problemas, con un uso de memoria muy reducido (inferior a 1 GB de RAM en la mayoría de los casos).
- Cualquier GPU moderna (incluso integradas) puede realizar inferencia con este modelo; no se dispone de datos oficiales de VRAM, pero se estima que necesitaría menos de 1 GB.
- Es adecuado para entornos con recursos limitados, como dispositivos embebidos o servidores ligeros.
- Para el despliegue se recomienda usar la librería Kraken (versión >= 7.1.0), que gestiona la carga del modelo y la inferencia. También se puede integrar con otras herramientas de OCR que soporten formatos safetensors.
- No se dispone de datos de latencia o throughput específicos en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La familia PP-OCRv6 incluye variantes *small* y *medium* (también publicadas en Hugging Face por el mismo autor), pero no se ofrecen tablas comparativas de rendimiento entre ellas. Se recomienda consultar el repositorio de Kraken o la documentación de PaddleOCR para obtener referencias adicionales.

## Limitaciones y advertencias

- El corpus de entrenamiento está fuertemente sesgado hacia lenguas de altos recursos (inglés, francés, alemán, latín, neerlandés, francés medio, etc.). Las lenguas con poco material real muestran tasas de error notablemente más altas y requerirán afinamiento para su uso práctico.
- Las convenciones de transcripción no están unificadas entre los distintos conjuntos de datos, por lo que el modelo puede resolver abreviaturas o expandir glifos de forma impredecible, especialmente en manuscritos europeos en escritura latina.
- Los datos sintéticos generados con `pangoline` solo aproximan texto impreso moderno; para lenguas presentes únicamente como datos sintéticos (armenio clásico, ge'ez) y para algunas lenguas de escritura latina (irlandés, letón, lituano, rumano, serbio, esloveno), la precisión en el mundo real es probablemente limitada.
- La licencia Apache-2.0 permite uso comercial y modificación, pero se recomienda revisar los términos de los conjuntos de datos privados utilizados en el entrenamiento, ya que no son redistribuibles.
- Al ser un modelo base, no se ha optimizado para dominios muy específicos; para obtener resultados óptimos en colecciones particulares es necesario realizar afinamiento.

## Enlaces

- Modelo en Hugging Face: [small-models-for-glam/kraken-ppocrv6-tiny](https://huggingface.co/small-models-for-glam/kraken-ppocrv6-tiny)
- DOI original en Zenodo: [https://doi.org/10.5281/zenodo.21788403](https://doi.org/10.5281/zenodo.21788403)
- Documentación de Kraken: [https://kraken.re](https://kraken.re)
- Organización Small Models for GLAM: [https://huggingface.co/small-models-for-glam](https://huggingface.co/small-models-for-glam)

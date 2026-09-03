# small-models-for-glam/kraken-ppocrv6-medium

## Resumen

El modelo **kraken-ppocrv6-medium** es un sistema de reconocimiento óptico de caracteres (OCR) de línea de texto, especializado en documentos históricos y contemporáneos, tanto manuscritos como impresos. Ha sido desarrollado por Benjamin Kiessling (ALMAnaCH, Inria Paris) y publicado bajo licencia Apache 2.0. Se distribuye a través de la organización comunitaria Small Models for GLAM, orientada a instituciones de patrimonio cultural (bibliotecas, archivos, museos).

Se trata de la variante **medium** de una familia de tres modelos (tiny, small, medium) basados en la arquitectura PP-OCRv6 de PaddlePaddle, adaptada para el reconocimiento de texto histórico. Con aproximadamente 15,92 millones de parámetros, el modelo cubre 44 idiomas y 10 escrituras (árabe, armenio, cirílico, etíope, georgiano, griego, hebreo, latino, malayalam y siríaco). Su diseño ligero y su alto rendimiento lo hacen especialmente relevante para proyectos de digitalización masiva, donde se necesita precisión sin los costes computacionales de los modelos basados en visión-lenguaje (VLM), que además pueden sufrir alucinaciones.

El modelo se distribuye como un archivo `safetensors` y se integra con el ecosistema de la herramienta Kraken, lo que facilita su uso tanto desde la línea de comandos como desde Python. Al ser un modelo base, ofrece resultados útiles directamente sobre una amplia variedad de materiales, pero también está diseñado para ser afinado con conjuntos de datos específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PP-OCRv6 (CTC-based line recognizer, backbone convolucional ligero, cuello de secuencia no recurrente) |
| Parametros totales | 15,92 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (reconocimiento de línea de texto, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ara, cat, ces, chu, cos, dan, deu, dum, eng, fas, fin, fra, frm, gez, gle, grc, heb, hun, ita, kat, lat, lav, lit, mal, mul, nld, nor, oci, ota, pcd, pol, por, ron, rus, slk, slv, spa, srp, swe, syr, ukr, urd, xcl, yid (44 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

PP-OCRv6 es un reconocedor de líneas de texto basado en CTC (Connectionist Temporal Classification). La arquitectura combina un backbone convolucional ligero con un cuello de secuencia no recurrente, lo que permite procesar líneas de imagen de forma eficiente sin depender de RNNs. La versión original de PaddlePaddle ha sido adaptada para el reconocimiento de texto histórico mediante tres cambios principales: la altura de línea se incrementa a 128 píxeles, se elimina el límite de ancho de línea y de presupuesto de etiquetas CTC, y se sustituye el optimizador por Adam+Muon, que mejora la convergencia en este tipo de tareas.

El modelo se entrena desde cero con una mezcla de datos públicos y privados, que incluyen imágenes de líneas de texto históricas, contemporáneas y nacidas digitales, tanto manuscritas como impresas. El corpus cubre 44 idiomas y 10 escrituras, con una presencia desigual: idiomas de alto recurso como inglés, francés, alemán, latín, neerlandés o francés medio dominan el conjunto, mientras que otros como el armenio clásico o el ge'ez solo aparecen como datos sintéticos generados con la herramienta pangoline. No se aplicó ninguna normalización de convenciones de transcripción entre los distintos conjuntos de datos, por lo que el modelo puede producir resultados inconsistentes en ciertos scripts, especialmente en manuscritos europeos de escritura latina que mezclan convenciones de CATMuS y TRIDIS.

## Capacidades

- Reconocimiento de texto manuscrito e impreso en líneas de imagen, con soporte para 44 idiomas y 10 escrituras.
- Manejo de documentos históricos, contemporáneos y nacidos digitales, incluyendo material de archivo, incunables, manuscritos y textos modernos.
- Transcripción multilingüe sin necesidad de ajuste previo, con rendimiento directamente utilizable en la mayoría de los casos.
- Alta velocidad de inferencia en comparación con modelos basados en VLM, sin riesgo de alucinaciones en la transcripción.
- Posibilidad de afinado (fine-tuning) sobre conjuntos de datos específicos para mejorar la precisión en dominios particulares.
- Integración con el ecosistema Kraken para segmentación de páginas y líneas, así como con pipelines de OCR completos.
- Normalización Unicode NFD y de espacios en blanco aplicada durante entrenamiento y evaluación, lo que facilita la comparación de resultados.

## Casos de uso

- **Digitalización de archivos históricos**: instituciones como bibliotecas nacionales o archivos diocesanos pueden transcribir automáticamente manuscritos medievales y modernos en latín, griego o hebreo, reduciendo el tiempo de catalogación. El modelo se integra con Kraken para segmentar y reconocer líneas de forma automatizada.
- **Transcripción de colecciones de correspondencia**: proyectos de humanidades digitales que procesan cartas de los siglos XVI al XIX pueden usar el modelo para generar borradores de transcripción que luego son corregidos por investigadores, gracias a su soporte de múltiples idiomas europeos.
- **Procesamiento de documentos administrativos contemporáneos**: actas, expedientes y registros civiles en escritura latina o cirílica pueden ser reconocidos con alta precisión, incluso si contienen mezcla de impreso y manuscrito. Su velocidad permite procesar lotes grandes en CPU.
- **Reconocimiento de textos en escrituras no latinas**: el modelo cubre escrituras como árabe, hebreo, siríaco, etíope o malayalam, lo que lo hace útil para digitalizar fondos orientales o colecciones de estudios religiosos.
- **Generación de corpus de entrenamiento**: al ser un modelo base de 16M de parámetros, puede usarse para pre-etiquetar grandes volúmenes de imágenes y generar datos de entrenamiento para modelos más especializados o para tareas downstream como búsqueda de texto completo.
- **Integración en pipelines de preservación digital**: bibliotecas que necesitan extraer texto de imágenes de baja calidad o con degradaciones pueden combinar este modelo con herramientas de mejora de imagen y post-procesamiento, aprovechando su robustez frente a variaciones tipográficas y de ruido.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas sobre el conjunto de test, sin especificar el tamaño ni la composición exacta del mismo:

| Metrica | Valor |
|---|---|
| CER (tasa de error de caracteres) | 3,91 |
| WER (tasa de error de palabras) | 14,98 |
| CER macro (promedio por idioma) | 4,93 |
| WER macro (promedio por idioma) | 19,07 |

Estos valores indican un rendimiento muy competitivo para un modelo de este tamaño, especialmente en caracteres. La diferencia entre CER/WER global y macro sugiere que los idiomas con menos datos de entrenamiento presentan tasas de error más altas, como se advierte en las limitaciones. No se proporcionan comparaciones con otros modelos en la documentación disponible.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de aproximadamente 15,92 millones de parámetros, el peso en FP32 ocupa unos 64 MB y en FP16 unos 32 MB. La inferencia puede ejecutarse sin GPU, con un consumo de memoria RAM inferior a 1 GB.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluyendo tarjetas consumer como GTX 1050, RTX 2060 o superiores. No se requieren GPUs profesionales.
- **Compatibilidad con hardware consumer**: sí, el modelo cabe en cualquier equipo moderno, incluso en dispositivos con CPU únicamente. Es adecuado para entornos sin aceleración GPU.
- **Opciones de despliegue**: el modelo se usa principalmente a través de la herramienta Kraken (CLI o API de Python). También puede cargarse desde el Hub de Hugging Face con `huggingface_hub` y ejecutarse con el comando `kraken ocr`. No está diseñado para funcionar con vLLM, llama.cpp o TGI, que son específicos de modelos de lenguaje.
- **Latencia y throughput**: no se proporcionan datos oficiales, pero al ser un modelo ligero y sin componentes recurrentes, la inferencia es considerablemente más rápida que la de los sistemas basados en VLM. En CPU, se pueden procesar varias líneas por segundo, y en GPU el throughput es sustancialmente mayor.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de OCR en la información proporcionada. La documentación menciona que la familia PP-OCRv6 (tiny, small, medium) ofrece un equilibrio entre precisión y velocidad, siendo la variante medium la que alcanza los mejores resultados en el conjunto de test. Como referencia cualitativa, el autor indica que este tipo de modelos supera a los reconocedores basados en VLM en términos de velocidad y ausencia de alucinaciones, aunque no se aportan cifras concretas.

| Modelo | Parametros | Enfoque | CER | WER | Licencia |
|---|---|---|---|---|---|
| kraken-ppocrv6-medium | 15,92M | CTC, convolucional | 3,91 | 14,98 | Apache 2.0 |
| kraken-ppocrv6-tiny | no disponible | CTC, convolucional | no disponible | no disponible | Apache 2.0 |
| kraken-ppocrv6-small | no disponible | CTC, convolucional | no disponible | no disponible | Apache 2.0 |

No se incluyen modelos externos porque no hay datos comparativos fiables en la documentación.

## Limitaciones y advertencias

- **Desequilibrio lingüístico**: el corpus de entrenamiento está fuertemente sesgado hacia idiomas de alto recurso como inglés, francés, alemán, latín, neerlandés y francés medio. Los idiomas con menos datos reales, como el armenio clásico o el ge'ez, presentan tasas de error notablemente más altas y requieren afinado para uso práctico.
- **Inconsistencia de transcripción**: al no normalizar las convenciones de transcripción entre los conjuntos de datos, el modelo puede resolver abreviaturas o expandir glifos de forma impredecible, especialmente en manuscritos europeos en escritura latina.
- **Datos sintéticos limitados**: para algunos idiomas y escrituras (armenio clásico, ge'ez, y en menor medida irlandés, letón, lituano, rumano, serbio o esloveno), la única fuente de entrenamiento es texto sintético generado con pangoline, que solo aproxima tipografía moderna impresa. La precisión en estos casos es limitada.
- **Riesgo de alucinación**: aunque el autor afirma que el modelo no sufre alucinaciones como los VLM, no se descarta la generación de caracteres plausibles pero incorrectos en contextos ambiguos o con imágenes de muy baja calidad.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial y modificación, pero los conjuntos de datos privados utilizados en el entrenamiento no son redistribuibles, lo que puede limitar la reproducibilidad completa del modelo.
- **Formato de salida**: el modelo requiere que las imágenes de entrada sean líneas de texto ya segmentadas; no realiza detección de líneas ni de páginas por sí mismo, por lo que debe combinarse con las herramientas de segmentación de Kraken.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/small-models-for-glam/kraken-ppocrv6-medium)
- [DOI de la versión canónica en Zenodo](https://doi.org/10.5281/zenodo.21788410)
- [Documentación de Kraken](https://kraken.re)
- [Organización Small Models for GLAM](https://huggingface.co/small-models-for-glam)

# small-models-for-glam/kraken-ppocrv6-small

## Resumen

El modelo `kraken-ppocrv6-small` es un reconocedor de texto (OCR) de línea de imagen, tanto manuscrito como impreso, desarrollado por Benjamin Kiessling en ALMAnaCH (Inria Paris) y distribuido a través de la organización comunitaria Small Models for GLAM. Se trata de la variante **small** de una familia de tres tamaños (tiny, small y medium) basada en la arquitectura PP-OCRv6 de PaddlePaddle, adaptada específicamente para el reconocimiento de textos históricos y patrimoniales. El modelo está pensado para funcionar dentro del ecosistema de la librería Kraken, que facilita la segmentación y transcripción de documentos.

Con aproximadamente 3,24 millones de parámetros, este modelo ofrece un equilibrio entre precisión y eficiencia, siendo capaz de procesar líneas de texto en 44 lenguas y 10 escrituras distintas (árabe, armenio, cirílico, etíope, georgiano, griego, hebreo, latino, malayalam y siríaco). Su diseño ligero permite una inferencia rápida incluso en CPU, lo que lo hace especialmente útil para instituciones culturales (bibliotecas, archivos, museos) que necesitan digitalizar grandes volúmenes de material sin depender de hardware especializado. A diferencia de los modelos basados en visión y lenguaje (VLM), no presenta alucinaciones y ofrece un rendimiento consistente en una amplia gama de materiales, desde manuscritos medievales hasta documentos nacidos digitales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PP-OCRv6 (CTC-based line recognizer con backbone convolucional ligero y neck no recurrente) |
| Parametros totales | ~3,24 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (reconocimiento de linea de imagen, sin contexto de tokens) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizacion oficial publicada) |
| Idiomas soportados | ara, cat, ces, chu, cos, dan, deu, dum, eng, fas, fin, fra, frm, gez, gle, grc, heb, hun, ita, kat, lat, lav, lit, mal, mul, nld, nor, oci, ota, pcd, pol, por, ron, rus, slk, slv, spa, srp, swe, syr, ukr, urd, xcl, yid (44 lenguas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (archivo `small.safetensors`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura PP-OCRv6 original de PaddlePaddle, un reconocedor de líneas de texto basado en CTC (Connectionist Temporal Classification). Consiste en un backbone convolucional ligero que extrae características visuales de la imagen de la línea, seguido de un cuello de secuencia no recurrente que modela dependencias temporales y produce una distribución de probabilidad sobre el alfabeto de salida. La adaptación para el reconocimiento de textos históricos incluye tres cambios principales: la altura de la línea de entrada se incrementa a 128 píxeles (frente a los 32 típicos de PaddleOCR), se elimina el límite superior de ancho de línea y presupuesto de etiquetas CTC, y el optimizador se reemplaza por Adam+Muon, una combinación que mejora la convergencia en tareas de OCR.

El entrenamiento se realizó desde cero con un corpus muy diverso que combina imágenes de líneas de documentos históricos, contemporáneos y nacidos digitales, tanto manuscritos como impresos. Los datos provienen de conjuntos públicos y privados (estos últimos no redistribuibles), cubriendo 44 lenguas y 10 escrituras. Además, algunas lenguas con escasez de datos reales (marcadas con † en la documentación) se aumentaron con datos sintéticos generados mediante la herramienta pangoline, que simula texto impreso moderno. El texto se normalizó a Unicode NFD y se estandarizaron los espacios en blanco durante el entrenamiento y la evaluación. No se aplicaron técnicas de RLHF ni DPO; el entrenamiento es supervisado directamente sobre las transcripciones de referencia.

## Capacidades

- Reconocimiento de texto manuscrito e impreso en líneas de imagen, con soporte para 44 lenguas y 10 escrituras (árabe, armenio, cirílico, etíope, georgiano, griego, hebreo, latino, malayalam y siríaco).
- Generación de transcripciones de texto plano a partir de imágenes de líneas, sin necesidad de modelos de lenguaje adicionales.
- Alta velocidad de inferencia gracias a su arquitectura ligera (~3,24 M parámetros), lo que permite procesar grandes volúmenes de documentos en CPU.
- Ausencia de alucinaciones: al ser un modelo puramente visual basado en CTC, no genera texto que no esté presente en la imagen, a diferencia de los VLM.
- Capacidad de fine-tuning sobre dominios específicos o colecciones particulares, gracias a su diseño base y a la integración con la librería Kraken.
- Soporte multilingüe y multi-script en un solo modelo, sin necesidad de cargar pesos separados por idioma.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo de OCR puro.

## Casos de uso

- Digitalización de archivos históricos: instituciones como bibliotecas nacionales o archivos municipales pueden transcribir automáticamente manuscritos antiguos (por ejemplo, actas notariales del siglo XVII) con una tasa de error de carácter (CER) del 5,43 % en el conjunto de prueba, reduciendo drásticamente el tiempo de catalogación manual.
- Transcripción de colecciones de manuscritos medievales: el modelo maneja escrituras latinas y griegas, y puede aplicarse a fondos como los monasterios de Stavronikita (colecciones digitalizadas en Zenodo) para generar ediciones digitales consultables.
- OCR para bibliotecas digitales patrimoniales: proyectos GLAM (Galleries, Libraries, Archives, Museums) pueden integrar el modelo en sus pipelines de digitalización para procesar libros impresos antiguos, periódicos históricos y documentos nacidos digitales, manteniendo una alta fidelidad sin alucinaciones.
- Procesamiento de documentos multilingües: organizaciones que gestionan fondos en lenguas minoritarias (p. ej., georgiano, etíope o siríaco) pueden utilizar el modelo como punto de partida y ajustarlo con datos propios para mejorar la precisión en esos idiomas.
- Investigación académica en humanidades digitales: los investigadores pueden transcribir corpus de cartas, diarios o crónicas en múltiples idiomas (latín, alemán, francés, etc.) con un solo modelo, facilitando el análisis textual posterior.
- Automatización de flujos de preservación digital: el modelo se integra fácilmente en scripts de línea de comandos mediante Kraken, permitiendo procesar lotes de imágenes de forma desatendida, con salida en formato de texto plano para su almacenamiento en repositorios.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas sobre el conjunto de prueba, que incluye una mezcla de materiales históricos y contemporáneos:

| Metrica | Valor |
|---|---|
| CER (general) | 5,43 % |
| WER (general) | 20,22 % |
| CER (macro, promedio por lengua) | 6,93 % |
| WER (macro, promedio por lengua) | 25,33 % |

Estos valores indican que el modelo ofrece una precisión notablemente alta en caracteres, mientras que la tasa de error por palabra es mayor, lo que es habitual en OCR de manuscritos con ortografía variable. No se proporcionan comparaciones directas con modelos similares en la documentación disponible.

## Requisitos de hardware

- Al tratarse de un modelo de solo ~3,24 millones de parámetros, la inferencia es viable en CPU con un uso de memoria muy reducido. No se indican cifras exactas de VRAM, pero es de esperar que quepa en cualquier GPU con al menos 1 GB de memoria.
- Puede ejecutarse en GPUs de consumo como la NVIDIA GTX 1050 Ti o superiores, así como en hardware integrado de bajo consumo.
- La librería Kraken (versión >= 7.1.0) es la plataforma recomendada de despliegue. Ofrece una interfaz de línea de comandos (`kraken`) y una API Python para integración en pipelines personalizados.
- No se han publicado datos de latencia o throughput específicos para este modelo. Dado su tamaño, se espera un rendimiento muy superior al de modelos VLM de OCR.
- Para el fine-tuning, se recomienda disponer de una GPU con al menos 8 GB de VRAM si se utilizan lotes grandes, aunque el ajuste con lotes pequeños puede realizarse en CPU con tiempos de entrenamiento razonables.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de OCR en la información proporcionada. El modelo pertenece a una familia de tres variantes (tiny, small y medium) donde el medium ofrece la mayor precisión a costa de una inferencia más lenta y un mayor consumo de memoria, mientras que el tiny prioriza la velocidad. No se han publicado métricas comparativas de las variantes en esta documentación.

## Limitaciones y advertencias

- Sesgo por desequilibrio lingüístico: el corpus de entrenamiento está muy inclinado hacia lenguas de altos recursos (inglés, francés, alemán, latín, neerlandés, francés medio), por lo que las lenguas con pocos datos reales (p. ej., armenio clásico, geʽez) presentan tasas de error notablemente mayores y requerirán fine-tuning para un uso práctico.
- Convenciones de transcripción inconsistentes: los conjuntos de datos provienen de proyectos con criterios de transcripción diferentes (por ejemplo, CATMuS y TRIDIS), lo que puede provocar expansiones de abreviaturas o resoluciones de glifos impredecibles.
- Datos sintéticos limitados: las lenguas que solo aparecen como datos sintéticos (armenio clásico, geʽez) y, en menor medida, las que comparten el alfabeto latino (irlandés, letón, lituano, rumano, serbio, esloveno) pueden tener una precisión real inferior a la esperada.
- Riesgo de errores en escrituras poco representadas: a pesar del soporte multi-script, la calidad en scripts como el siríaco o el malayalam puede ser insuficiente sin ajuste adicional.
- No es un modelo de propósito general: carece de capacidades de razonamiento, generación de texto libre o tool calling; está estrictamente limitado a la transcripción de líneas de imagen.
- La licencia Apache-2.0 permite uso comercial y modificación sin restricciones, pero se recomienda verificar los términos de los conjuntos de datos privados utilizados en el entrenamiento, ya que no son redistribuibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/small-models-for-glam/kraken-ppocrv6-small
- DOI de la versión canónica en Zenodo: https://doi.org/10.5281/zenodo.21788405
- Documentación de Kraken: https://kraken.re
- Organización Small Models for GLAM: https://huggingface.co/small-models-for-glam

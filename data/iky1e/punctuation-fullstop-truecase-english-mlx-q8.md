# iky1e/punctuation-fullstop-truecase-english-mlx-q8

## Resumen

El modelo `iky1e/punctuation-fullstop-truecase-english-mlx-q8` es una conversión a formato MLX con cuantización de 8 bits del modelo original `1-800-BAD-CODE/punctuation_fullstop_truecase_english`, desarrollado por el usuario iky1e. Este modelo resuelve un problema específico de procesamiento de texto: dado un texto en inglés en minúsculas y sin puntuación, restaura la puntuación (puntos, comas, signos de interrogación, etc.), aplica true-casing (capitalización correcta de nombres propios y comienzos de oración) y detecta los límites de oraciones (segmentación). Es una herramienta de preprocesamiento típicamente utilizada en pipelines de transcripción de voz (ASR) para mejorar la legibilidad de las transcripciones.

El modelo original es un modelo ONNX de clasificación de texto con 14.846.653 parámetros, que se ha convertido a MLX para su ejecución en Apple Silicon. La variante Q8 reduce el tamaño de los pesos a 55,8 MB (frente a los 209,5 MB del ONNX FP32) manteniendo un acuerdo de caracteres del 99,95% y de palabras del 99,76% respecto a la salida del modelo original, según los datos del autor. Esta conversión está pensada para su uso integrado en la herramienta Granite-MLX, que permite añadir puntuación a transcripciones de audio generadas por modelos de reconocimiento de voz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de clasificación de texto, no se detalla el tipo de red) |
| Parámetros totales | 14.846.653 |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8 (8-bit affine, group size 64, tensores residuales FP16) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura interna del modelo original (por ejemplo, si se trata de un transformer encoder, una red recurrente o un modelo de tipo BERT). El modelo original, `1-800-BAD-CODE/punctuation_fullstop_truecase_english`, es un modelo ONNX que acepta texto en minúsculas sin puntuación y produce una salida con puntuación, capitalización y segmentación en oraciones. El repositorio de conversión indica que el modelo fuente tiene un hash SHA-256 específico y que se ha convertido a MLX mediante un script del proyecto Granite-MLX.

Tampoco se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La única innovación técnica documentada es la cuantización Q8 con grupo de tamaño 64 y residuales FP16, que reduce el tamaño de los pesos a un 26,6% del original ONNX FP32 manteniendo una fidelidad alta en la salida formateada.

## Capacidades

- Restauración de puntuación: añade puntos, comas, signos de interrogación, exclamación, etc., a texto en minúsculas sin puntuación.
- True-casing: capitaliza correctamente comienzos de oración, nombres propios y acrónimos.
- Detección de límites de oración: segmenta el texto en oraciones completas.
- Entrada en inglés: el modelo está entrenado únicamente para texto en inglés.
- Integración con Granite-MLX: se usa como módulo de postprocesado para añadir puntuación a transcripciones de voz generadas por Granite.
- No soporta tool calling, ni agentes, ni capacidades multimodales (visión, audio). Es un modelo puramente de clasificación de texto.

## Casos de uso

- Preprocesado de transcripciones de voz: el modelo es ideal para añadir puntuación y capitalización a la salida de un sistema de reconocimiento de voz (ASR) que produce texto en minúsculas sin signos de puntuación. Por ejemplo, se puede usar con `granite-mlx recording.mp4 --punctuation-model iky1e/punctuation-fullstop-truecase-english-mlx-q8` para obtener transcripciones legibles.
- Limpieza de texto en aplicaciones de análisis de datos: cuando se recopilan datos textuales de fuentes que carecen de puntuación (mensajes de chat, subtítulos sin formato, etc.), el modelo puede normalizar el texto para su posterior análisis.
- Generación de subtítulos y subtítulos: los sistemas de subtitulado automático pueden beneficiarse de la restauración de puntuación para cumplir con los estándares de accesibilidad.
- Mejora de la calidad de texto en motores de búsqueda: indexar texto sin puntuación puede reducir la precisión de búsqueda; este modelo puede preprocesar documentos para mejorar la recuperación.
- Asistente de escritura y corrección: puede usarse como paso previo en herramientas de corrección gramatical o estilística para normalizar el texto.
- Integración en pipelines de NLP en Apple Silicon: al ser un modelo MLX, se ejecuta eficientemente en Macs con chip M1/M2/M3, lo que lo hace adecuado para aplicaciones locales de procesamiento de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para este modelo, ya que es un modelo de tarea específica. Sin embargo, el autor proporciona una comparativa de calidad entre la variante Q8 y otras variantes MLX, medida como acuerdo de caracteres y palabras con respecto al modelo ONNX FP32 original, usando una transcripción de 6.118,72 segundos de una conferencia Stanford CME295 (69.168 caracteres de entrada). Los resultados se muestran en la tabla siguiente:

| Variante | Tamaño del archivo | Acuerdo de caracteres | Acuerdo de palabras | Tiempo de formateo (inferencia) |
|---|---|---|---|---|
| ONNX FP32 (fuente) | 209,5 MB | 100,0000% | 100,0000% | 2,044 s |
| MLX FP16 | 104,7 MB | 99,9916% | 99,9559% | 0,417 s |
| **MLX Q8 (este modelo)** | **55,8 MB** | **99,9536%** | **99,7575%** | **0,260 s** |
| MLX Q6 | 42,8 MB | 99,8777% | 99,3681% | 0,346 s |
| MLX Q5 | 36,2 MB | 99,6066% | 97,9941% | 0,350 s |
| MLX Q4 | 29,7 MB | 99,2899% | 96,4879% | 0,330 s |

El acuerdo se mide como `100 − normalizado Levenshtein distance` entre la salida formateada del modelo y la del ONNX FP32 original. Q8 es la variante recomendada por el autor por su equilibrio entre tamaño, fidelidad y velocidad.

## Requisitos de hardware

- Tamaño del modelo: 55,8 MB (Q8), lo que lo hace extremadamente ligero.
- VRAM estimada: menos de 100 MB para inferencia, incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU en Apple Silicon (M1, M2, M3, M4, etc.) mediante MLX.
- Despliegue: se ejecuta con la librería MLX en macOS o Linux con soporte MLX. También se puede usar el modelo original ONNX con runtimes como ONNX Runtime en otras plataformas.
- Latencia: el tiempo de formateo medido para la Q8 es de 0,260 s para 69.168 caracteres de entrada (≈ 0,00037 s por carácter), lo que lo hace apto para procesamiento en tiempo real de transcripciones.
- Opciones de despliegue: integración con Granite-MLX (herramienta de transcripción), uso directo con MLX Python, o conversión a otros formatos si es necesario.

## Comparativa con modelos similares

La comparativa más directa es con las variantes MLX del mismo modelo original y con el propio ONNX FP32. No se dispone de información sobre otros modelos de restauración de puntuación (como `punctuator` de Facebook o modelos de tipo BERT para este fin) para hacer una comparativa con datos concretos.

| Modelo | Parámetros | Contexto | Rendimiento (acuerdo palabras vs ONNX FP32) | Licencia | Formato |
|---|---|---|---|---|---|
| ONNX FP32 (fuente) | 14,8 M | no disponible | 100% | Apache 2.0 | ONNX |
| MLX FP16 | 14,8 M | no disponible | 99,9559% | Apache 2.0 | MLX |
| **MLX Q8 (este modelo)** | **14,8 M** | **no disponible** | **99,7575%** | **Apache 2.0** | **MLX** |
| MLX Q4 | 14,8 M | no disponible | 96,4879% | Apache 2.0 | MLX |

## Limitaciones y advertencias

- Solo soporta inglés: el modelo está entrenado exclusivamente para texto en inglés, por lo que no funciona en otros idiomas.
- Pérdida de fidelidad con la cuantización: aunque el acuerdo de palabras es del 99,76%, hay una pequeña pérdida respecto al modelo FP32, que puede ser relevante en aplicaciones que requieren exactitud total.
- Riesgo de alucinación: como modelo de clasificación, puede generar puntuación o capitalización incorrecta en casos ambiguos o con ruido en la entrada.
- Dependencia de la entrada: el modelo espera texto en minúsculas y sin puntuación; si se alimenta con texto que ya contiene mayúsculas o signos, el comportamiento puede degradarse.
- No es un modelo de generación de texto: no produce contenido nuevo, solo transforma el texto de entrada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo original puede tener restricciones adicionales que no se han documentado en esta conversión.
- Requiere MLX: para ejecutar esta variante específica es necesario disponer de un entorno con la librería MLX (Apple Silicon), aunque el modelo original ONNX es portable a otras plataformas.

## Enlaces

- Repositorio HuggingFace de la variante Q8: https://huggingface.co/iky1e/punctuation-fullstop-truecase-english-mlx-q8
- Modelo original ONNX: https://huggingface.co/1-800-BAD-CODE/punctuation_fullstop_truecase_english
- Proyecto Granite-MLX (conversión y herramientas): https://github.com/kylehowells/Granite-MLX
- Repositorio de la herramienta `punctuators` (del autor del modelo original): https://github.com/1-800-BAD-CODE/punctuators
- Variantes MLX adicionales (FP16, Q6, Q5, Q4) disponibles en el perfil de iky1e en HuggingFace: https://huggingface.co/iky1e

# iky1e/punctuation-fullstop-truecase-english-mlx-q4

## Resumen

El modelo `iky1e/punctuation-fullstop-truecase-english-mlx-q4` es una conversión a formato MLX (Apple Silicon) de un modelo de restauración de puntuación, capitalización y segmentación de frases para texto inglés. El modelo original, desarrollado por el usuario `1-800-BAD-CODE`, acepta como entrada texto en inglés en minúsculas y sin puntuación y, en una sola pasada, devuelve el texto con puntuación (puntos, comas, interrogaciones, etc.), mayúsculas correctas y límites de oración. Esta variante Q4 es una cuantización de 4 bits con grupo de 64 y tensores residuales en FP16, pensada para inferencia eficiente en Apple Silicon mediante la librería MLX.

El modelo tiene 8,3 millones de parámetros y un tamaño de pesos de 29,7 MB en cuantización Q4, lo que lo hace extremadamente ligero y adecuado para aplicaciones en tiempo real o en dispositivos con recursos limitados. La conversión está mantenida por el proyecto Granite-MLX, que lo integra como modelo de puntuación por defecto para el postprocesado de transcripciones. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Aunque no se publican benchmarks estándar de NLP (MMLU, etc.), la model card incluye una evaluación de la calidad de la cuantización comparando la salida formateada con la del modelo original en FP32, mostrando una concordancia del 99,29% a nivel de carácter y del 96,49% a nivel de palabra, con un tiempo de inferencia de 0,33 segundos en un escenario de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de clasificación de texto, probablemente transformer pequeño, pero no se especifica) |
| Parametros totales | 8.325.245 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 (4 bits afines, grupo de 64, residuales FP16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), además de tokenizer.json y modelo SentencePiece Unigram |

## Arquitectura y entrenamiento

La arquitectura interna del modelo original no está documentada en la información disponible. Se trata de un modelo de clasificación de texto (pipeline_tag: text-classification) que procesa secuencias de tokens para predecir etiquetas de puntuación y mayúsculas. El tokenizer es un SentencePiece Unigram de 32k (archivo `spe_32k_lc_en.model`). No se proporcionan detalles sobre el conjunto de entrenamiento, número de tokens, ni el proceso de optimización (RLHF, DPO, etc.). La conversión a MLX se realizó mediante el script `convert_punctuation.py` del proyecto Granite-MLX, que aplica cuantización de 4 bits con grupo 64 y tensores residuales en FP16. El modelo original se distribuye también en formato ONNX FP32 (209,5 MB) y otras variantes cuantizadas (Q8, Q6, Q5, FP16).

## Capacidades

- Restauración de puntuación en texto inglés en minúsculas: añade puntos, comas, signos de interrogación y exclamación, etc.
- True-casing: corrige la capitalización de palabras (nombres propios, inicios de frase, pronombres "I", etc.).
- Detección de límites de oración: segmenta el texto en frases correctamente.
- Procesamiento en una sola pasada: no requiere múltiples llamadas ni etapas separadas.
- Compatible con MLX para inferencia en Apple Silicon (M1/M2/M3) y con ONNX para otras plataformas.
- Integración directa con la herramienta `granite-mlx` para el post-procesado de transcripciones de voz.
- No soporta tool calling, agentes, visión ni audio; es un modelo puramente de texto.

## Casos de uso

- **Post-procesado de transcripciones ASR**: el modelo es ideal para convertir la salida de reconocimiento de voz (por ejemplo, Whisper) que suele ser texto en minúsculas y sin puntuación en texto correctamente formateado. Se puede integrar en un pipeline de transcripción automática.
- **Mejora de subtítulos automáticos**: los subtítulos generados por sistemas de ASR pueden carecer de puntuación y mayúsculas; este modelo añade estos elementos automáticamente, mejorando la legibilidad.
- **Preprocesamiento de texto para análisis de sentimiento o NLP**: muchos pipelines de procesamiento de lenguaje natural requieren texto con puntuación y capitalización adecuada para obtener mejores resultados en tareas posteriores como análisis de sentimiento, extracción de entidades o resumen.
- **Normalización de texto en sistemas de asistente de voz**: en asistentes virtuales o sistemas de dictado, la restauración de puntuación permite generar mensajes con formato correcto antes de mostrarlos al usuario.
- **Limpieza de datos de texto para entrenamiento de modelos**: cuando se dispone de grandes corpus de texto sin puntuación (por ejemplo, extraídos de redes sociales o foros), este modelo puede normalizar el texto antes de usarlo para entrenar otros modelos.
- **Herramientas de accesibilidad**: para personas con dificultades de lectura, la restauración de puntuación y capitalización en textos generados automáticamente facilita la comprensión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para este modelo. La model card incluye una evaluación de la calidad de la cuantización comparando la salida del modelo Q4 con la del modelo original ONNX FP32 sobre una transcripción de 69.168 caracteres de una conferencia. Las métricas de acuerdo se calculan como 100 − distancia de Levenshtein normalizada.

| Variante | Tamaño de pesos | Acuerdo de carácter | Acuerdo de palabra | Tiempo de formateo |
|---|---|---|---|---|
| ONNX FP32 (original) | 209,5 MB | 100,0000% | 100,0000% | 2,044 s |
| FP16 (MLX) | 104,7 MB | 99,9916% | 99,9559% | 0,417 s |
| Q8 (MLX) | 55,8 MB | 99,9536% | 99,7575% | 0,260 s |
| Q6 (MLX) | 42,8 MB | 99,8777% | 99,3681% | 0,346 s |
| Q5 (MLX) | 36,2 MB | 99,6066% | 97,9941% | 0,350 s |
| **Q4 (este modelo)** | **29,7 MB** | **99,2899%** | **96,4879%** | **0,330 s** |

El tiempo de formateo excluye el arranque del proceso y la carga del modelo. La medición se realizó en una máquina con Apple Silicon (no se especifica el modelo exacto). La recomendación de los autores es usar Q8 como equilibrio entre tamaño y fidelidad, pero Q4 sigue siendo viable para aplicaciones con restricciones de memoria.

## Requisitos de hardware

- **Tamaño del modelo**: 29,7 MB en Q4, por lo que cabe en cualquier dispositivo con más de 64 MB de memoria.
- **GPU recomendadas**: cualquier Mac con Apple Silicon (M1 o superior) para MLX; también puede ejecutarse en GPU NVIDIA o CPU mediante ONNX Runtime (aunque el formato nativo es MLX).
- **VRAM estimada**: inferior a 100 MB para inferencia, incluso con overhead de runtime.
- **Cabe en GPU consumer**: sí, cualquier GPU moderna (incluso integradas) puede ejecutar este modelo sin problema.
- **Opciones de despliegue**: MLX (recomendado para Apple Silicon), ONNX Runtime, o a través de la herramienta `granite-mlx`. No se ha documentado soporte para vLLM, llama.cpp u Ollama.
- **Latencia**: según la tabla anterior, el tiempo de formateo es de 0,330 s para un texto de 69k caracteres, lo que supone un rendimiento de ~210k caracteres por segundo. En hardware Apple Silicon, la latencia es notablemente menor que el modelo ONNX original.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de restauración de puntuación con los mismos parámetros. La comparación más relevante es con las otras variantes cuantizadas del mismo modelo, ya que comparten la misma arquitectura y solo difieren en la precisión de los pesos. La tabla anterior muestra que Q4 pierde un 3,5% de concordancia de palabras respecto al original, mientras que Q8 pierde solo un 0,24%. Para aplicaciones donde la precisión es crítica, Q8 es una alternativa mejor; Q4 es adecuada para entornos con memoria muy limitada.

## Limitaciones y advertencias

- **Solo inglés**: el modelo está entrenado únicamente para texto en inglés. No funcionará con otros idiomas.
- **Entrada requerida**: el modelo espera texto en minúsculas y sin puntuación. Si se le pasa texto ya formateado, puede producir resultados incorrectos.
- **Riesgo de alucinación**: aunque es un modelo de clasificación, puede introducir puntuación o mayúsculas erróneas en casos de nombres propios ambiguos o textos con jerga técnica.
- **Sesgos**: no se ha documentado ningún análisis de sesgo. Dado el origen de los datos de entrenamiento (no descrito), puede haber sesgos en la capitalización de nombres o en el tratamiento de ciertas construcciones gramaticales.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial y modificación, pero requiere mantener el aviso de copyright y la atribución.
- **Formato MLX**: el modelo está en formato MLX, no en los formatos estándar (GGUF, ONNX) para otras herramientas. Para usarlo fuera de Apple Silicon es necesario convertirlo de nuevo o usar el modelo original ONNX.

## Enlaces

- [Repositorio Hugging Face del modelo Q4](https://huggingface.co/iky1e/punctuation-fullstop-truecase-english-mlx-q4)
- [Modelo base original en Hugging Face](https://huggingface.co/1-800-BAD-CODE/punctuation_fullstop_truecase_english)
- [Proyecto Granite-MLX en GitHub](https://github.com/kylehowells/Granite-MLX)
- [Repositorio `punctuators` de 1-800-BAD-CODE (inferencia)](https://github.com/1-800-BAD-CODE/punctuators)

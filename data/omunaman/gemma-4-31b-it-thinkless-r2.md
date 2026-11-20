# omunaman/gemma-4-31b-it-thinkless-r2

## Resumen

`omunaman/gemma-4-31b-it-thinkless-r2` es una edición no oficial de `google/gemma-4-31B-it` realizada mediante aritmética sobre los pesos, sin ningún tipo de entrenamiento ni ajuste fino. El autor modifica dos elementos: desacopla la capa de salida de los embeddings de entrada (`tie_word_embeddings: false`) y suma un vector de norma 6.14 a la fila 101 de la matriz de salida, correspondiente al token de fin de razonamiento. El objetivo es reducir el coste en tokens de las respuestas correctas manteniendo la precisión del modelo original con el modo thinking activado.

Se trata de la segunda ronda de un proyecto del autor centrado en el coste por respuesta correcta. Según las mediciones publicadas, la edición reduce el consumo de tokens entre un 30% y un 36% según la temperatura, con una variación de precisión de entre +0.05 y -0.39 puntos. El modelo conserva la licencia Apache 2.0 del original y el pipeline `image-text-to-text`, lo que implica que mantiene las capacidades multimodales heredadas de Gemma 4 31B-it.

Es relevante ahora porque demuestra que intervenciones quirúrgicas sobre pesos pueden alterar el comportamiento de razonamiento de un modelo sin reentrenamiento, un enfoque barato y reproducible que abre la puerta a ajustes de eficiencia en producción. No obstante, las pérdidas medidas en tool calling multi-llamada y en generación de código acotan seriamente su ámbito de aplicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), heredada de Gemma 4 31B-it; capa de salida desacoplada de embeddings |
| Parametros totales | 31B (heredados del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; se midió con FP8 en carga sobre NVIDIA B200 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model-lm_head.safetensors` para la capa de salida editada) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `google/gemma-4-31B-it`, un transformer multimodal de 31B parámetros con pipeline `image-text-to-text`. La intervención del autor no implica entrenamiento: se aplica aritmética directamente sobre los pesos. Concretamente, se desvincula la matriz de la cabeza de salida (`lm_head`) de los embeddings de entrada, estableciendo `tie_word_embeddings: false`, y se suma un vector de norma 6.14 a la fila 101 de dicha matriz, que corresponde al token de fin de razonamiento. El resto de pesos son idénticos a los de Google.

Esta ronda 2 es una versión atenuada de la ronda 1: el desplazamiento del primer token es más suave. El efecto buscado es que el modelo abandone antes la fase de razonamiento, reduciendo el número de tokens generados por respuesta. Las mediciones se realizaron con el motor vLLM sobre una NVIDIA B200 en FP8, sobre un conjunto de 4.340 preguntas retenidas de benchmarks públicos, con una sola pasada por configuración de temperatura.

## Capacidades

- Generación de texto y respuesta a preguntas, con modo de razonamiento heredado del modelo base pero acortado por la edición.
- Procesamiento de imagen y texto (`image-text-to-text`), heredado de Gemma 4 31B-it.
- Razonamiento multi-paso en formato de cadena de pensamiento, aunque con tendencia a terminarla antes.
- Tool calling / function calling: soportado por herencia, pero con degradación medida en llamadas múltiples encadenadas (ver benchmarks).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: presente, pero el objetivo de la edición es precisamente acortarlo.

## Casos de uso

- Respuesta a preguntas en producción con presupuesto de tokens ajustado: el modelo genera entre un 30% y un 36% menos tokens por respuesta correcta, lo que reduce coste de inferencia en sistemas de QA de alto volumen donde la precisión es menos crítica que el gasto por consulta.
- Clasificación y extracción de información en documentos: tareas de una sola pasada donde la pérdida de precisión medida (inferior a 0.4 puntos) es aceptable y el ahorro de tokens es significativo.
- Procesamiento de documentos con imagen: al conservar el pipeline `image-text-to-text`, puede emplearse en tareas de lectura de documentos escaneados o capturas donde se combine texto e imagen.
- Evaluación comparativa de técnicas de edición de pesos: sirve como referencia reproducible para investigadores que estudien intervenciones aritméticas sobre modelos de razonamiento.
- Despliegue en entornos con latencia estricta: al reducir la longitud de las cadenas de razonamiento, disminuye el tiempo total de generación en escenarios de respuesta interactiva.
- Prototipado de asistentes conversacionales de un solo turno: adecuado para diálogos donde no se requiere encadenar herramientas ni generar código.

No se recomienda para uso en agentes con tool calling múltiple ni para generación de código en producción, según las propias mediciones del autor.

## Benchmarks y rendimiento

Mediciones del autor frente a Gemma 4 31B-it sin editar y con thinking activado, sobre 4.340 preguntas retenidas de benchmarks públicos, una sola pasada, NVIDIA B200, FP8 en carga:

| Temperatura | 0 | 0.5 | 0.8 | 1.0 |
|---|---|---|---|---|
| Tokens por respuesta correcta (ratio) | 0.638x | 0.671x | 0.690x | 0.698x |
| Diferencia de precisión (puntos) | +0.05 | -0.25 | -0.39 | -0.35 |

Pérdidas en tareas específicas (con la edición activada, sobre mitades retenidas):

| Benchmark | Diferencia |
|---|---|
| BFCL v4, una llamada | +0.65 |
| BFCL v4, varias llamadas encadenadas | -14.0 |
| LiveCodeBench | -4.7 |

Referencia adicional: Gemma sin editar con thinking desactivado obtiene 2.65 puntos menos que con thinking activado, consumiendo 0.19x sus tokens. La edición se sitúa entre ambos extremos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 31B parámetros, en FP8 requiere aproximadamente 31 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: el autor midió sobre NVIDIA B200; por tamaño, cabría esperar viabilidad en A100 80GB y H100 80GB en FP8/BF16.
- GPU de consumo: no cabe en RTX 4090 (24 GB) sin cuantización agresiva (4-bit), no documentada en la información disponible.
- Opciones de despliegue: vLLM (motor empleado en las mediciones); otras opciones no confirmadas.
- Latencia y throughput: no disponibles como cifras absolutas; la reducción de tokens por respuesta correcta implica menor tiempo de generación proporcional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| omunaman/gemma-4-31b-it-thinkless-r2 | 31B | no disponible | apache-2.0 | Edición aritmética, sin entrenamiento; -30 a -36% tokens, pérdidas en tool calling y código |
| google/gemma-4-31B-it (thinking on) | 31B | no disponible | apache-2.0 | Referencia base; mayor precisión, mayor coste en tokens |
| google/gemma-4-31B-it (thinking off) | 31B | no disponible | apache-2.0 | 2.65 puntos menos de precisión, 0.19x tokens |

## Limitaciones y advertencias

- No es un lanzamiento oficial de Google; el autor lo declara explícitamente.
- Degradación severa en tool calling multi-llamada (BFCL v4: -14.0 puntos) y en generación de código (LiveCodeBench: -4.7 puntos). El propio autor desaconseja su uso para herramientas y código.
- Las pérdidas de precisión a temperaturas 0.8 y 1.0 se concentran en conjuntos de opción múltiple.
- Las mediciones provienen de una sola pasada sobre un conjunto retenido; no hay validación independiente publicada.
- Riesgo de alucinación: no cuantificado en la información disponible; al acortar el razonamiento, es plausible un aumento, pero no hay datos.
- Idiomas soportados y longitud de contexto no documentados en la model card.
- Sin descargas ni likes en el momento de la consulta; sin comunidad que valide los resultados.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías sobre el comportamiento editado traslada el riesgo al desplegador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omunaman/gemma-4-31b-it-thinkless-r2
- Modelo base: https://huggingface.co/google/gemma-4-31B-it

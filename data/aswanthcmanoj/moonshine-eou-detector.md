# AswanthCManoj/moonshine-eou-detector

## Resumen

Moonshine EOU Detector es un modelo de detección de fin de turno (end-of-utterance, EOU) diseñado para pipelines de voz en streaming. Lo desarrolla AswanthCManoj y actúa como una puerta de confirmación que se ejecuta junto a Silero VAD para decidir cuándo el turno de un hablante ha terminado realmente, reduciendo falsos positivos en sistemas de conversación por voz en tiempo real.

El modelo combina un encoder Moonshine-tiny (7,7 millones de parámetros, 288 dimensiones ocultas) como extractor de características, una cabeza de clasificación binaria entrenada para predecir la probabilidad de que el turno esté completo, y una instancia de Silero VAD v5. Todo el pipeline se distribuye en formato ONNX, lo que permite inferencia sin PyTorch en tiempo de ejecución. No se trata de un modelo de lenguaje generativo, sino de un clasificador acústico ligero, con un peso total de aproximadamente 35 MB.

Es relevante porque la detección precisa del fin de turno es un cuello de botella en agentes de voz y asistentes conversacionales. El modelo ofrece un mecanismo de umbrales escalonados que se consulta durante los silencios del hablante, con umbrales que se relajan a medida que aumenta la duración de la pausa, lo que permite equilibrar latencia y precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Moonshine-tiny + head de clasificación binaria + Silero VAD v5 |
| Parametros totales | 7,7 M en el encoder; el head no especifica el número de parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de audio de 16 kHz; no es un modelo de texto) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en FP32) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El pipeline se compone de tres módulos independientes unidos mediante ONNX Runtime. El primero es un encoder Moonshine-tiny que actúa como extractor de características passthrough: recibe audio crudo de 16 kHz como un tensor `(1, seq)` en float32 y produce características de 288 dimensiones. Sobre estas características, una cabeza lineal realiza una proyección a un logit binario, que se convierte en probabilidad mediante una sigmoide. El tercer módulo es Silero VAD v5, incluido para la detección de actividad de voz, que mantiene un estado por sesión de forma `(2, 1, 128)` y un buffer de contexto de 64 muestras.

Según la información disponible, la cabeza de clasificación se entrenó con datos de límites de turno, aunque no se detallan el tamaño del dataset, la composición ni las técnicas de optimización. El encoder Moonshine-tiny se utiliza como extractor de características congelado. El modelo se consulta en hasta cuatro puntos de control durante el silencio del hablante, con un esquema de umbrales relajados: 96 ms (0,85), 192 ms (0,65), 320 ms (0,50), 480 ms (0,40) y un tiempo de espera duro de 576 ms en el que se confirma el fin del turno independientemente de la probabilidad. No se menciona RLHF ni DPO; el enfoque es completamente supervisado para clasificación binaria.

## Capacidades

- Detección de fin de turno en audio de voz en tiempo real, a partir de características del encoder Moonshine.
- Confirmación contextual de turnos: complementa a Silero VAD, reduciendo falsos positivos cuando el hablante hace una pausa breve.
- Inferencia totalmente ONNX, sin dependencia de PyTorch en runtime, lo que facilita el despliegue en entornos ligeros.
- Consulta del modelo en múltiples puntos de silencio con umbrales configurables.
- Sin capacidades de generación de texto, razonamiento, código o matemáticas: no es un modelo de lenguaje.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM.
- No se declara soporte multilingüe explícito, aunque al ser un modelo acústico podría ser en principio independiente del idioma; no hay datos que lo confirmen.

## Casos de uso

- Agentes de voz para atención al cliente: el modelo permite determinar cuándo el cliente ha terminado de hablar en un IVR, evitando que el sistema se adelante o espere de más. Su integración con Silero VAD y su bajo consumo lo hacen adecuado para servidores de inferencia de baja latencia.

- Transcripción de reuniones con segmentación de turnos: al confirmar el fin de cada intervención, el modelo puede usarse para insertar marcadores de turno en transcripciones automáticas de reuniones, mejorando la legibilidad del resultado.

- Videollamadas con subtítulos en tiempo real: el detector de EOU puede indicar cuándo un hablante termina su frase, lo que permite actualizar los subtítulos en bloques completos en lugar de fragmentos parciales.

- Control por voz en dispositivos embebidos: gracias a su tamaño reducido (aproximadamente 35 MB en total) y a su formato ONNX, el modelo puede ejecutarse en CPUs de bajo consumo o placas como Raspberry Pi, actuando como parte de un asistente de voz local.

- Post-procesado de audio para sistemas de speech-to-text: el modelo puede utilizarse como una capa de confirmación secundaria sobre el VAD en pipelines de transcripción por streaming, reduciendo la cantidad de texto parcial que se envía al reconocedor.

- Asistentes conversacionales en call centers: en entornos donde varios agentes comparten un canal, el detector de fin de turno ayuda a gestionar el turno de habla entre operador y cliente, minimizando interrupciones y solapamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se requiere GPU: el modelo puede ejecutarse en CPU, ya que su peso total es de aproximadamente 35 MB (encoder con datos externos de 30 MB, head de 2,2 MB y VAD de 2,2 MB).
- La inferencia se puede realizar con ONNX Runtime en CPUs modernas; no hay datos de latencia o throughput en la información proporcionada.
- Es apto para dispositivos de bajo consumo, como Raspberry Pi u otros sistemas embebidos, aunque la información disponible no incluye mediciones de rendimiento en estos entornos.
- Las opciones de despliegue se limitan a ONNX Runtime; también se puede integrar en frameworks que soporten modelos ONNX, pero no se menciona compatibilidad con vLLM, llama.cpp ni Ollama, dado que no es un modelo de texto.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moonshine-eou-detector | Encoder Moonshine-tiny + head EOU + Silero VAD | 7,7 M (encoder) | ONNX | MIT | HuggingFace |
| turnsense | SmolLM2-135M | 135 M | No disponible | No disponible | GitHub |
| Silero VAD v5 | VAD recurrente | No disponible | ONNX | No disponible | No disponible |

No hay datos de rendimiento publicados para ninguno de los tres modelos en la información proporcionada.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo acústico, su comportamiento puede variar según el acento, la calidad del micrófono y el ruido de fondo, sin que se hayan publicado evaluaciones al respecto.
- El riesgo de alucinación no aplica, ya que el modelo no genera texto.
- El modelo depende del correcto funcionamiento de Silero VAD. Si el VAD no detecta el silencio, el detector EOU no se consultará y el sistema puede fallar en la detección del fin del turno.
- Silero VAD requiere un contexto de 64 muestras precediendo a cada ventana de 512 muestras. Sin este contexto, el modelo produce probabilidades casi nulas y la detección de voz falla silenciosamente, tal como se advierte en la documentación.
- Los umbrales del esquema EOU son configurables, pero los valores por defecto pueden necesitar ajustes según el dominio y las características del audio.
- No se especifica el soporte de idiomas; no hay evidencia de que el modelo esté entrenado o evaluado para lenguas concretas.
- El repositorio tiene cero descargas y cero likes, lo que indica una madurez limitada y una ausencia de validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/AswanthCManoj/moonshine-eou-detector
- HuggingFace del head: https://huggingface.co/AswanthCManoj/moonshine-eou-head
- GitHub turnsense: https://github.com/latishab/turnsense

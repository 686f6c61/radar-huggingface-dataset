# codewithmoin/smart-turn-hinglish

## Resumen

Smart Turn Hinglish es un modelo de clasificación de audio especializado en detección de fin de turno (turn detection) para agentes de voz conversacionales. Desarrollado por CodeWithMoin, se basa en el modelo `openai/whisper-tiny` (7,8 millones de parámetros) y se ha fine-tuneado sobre el corpus público `pipecat-ai/smart-turn-data-v3.2-train`. Su objetivo es responder a una pregunta clave en sistemas de voz: cuando el hablante hace una pausa, ¿ha terminado su turno o simplemente está dudando? Esto permite que los agentes de voz decidan cuándo intervenir sin interrumpir al usuario.

El modelo se distribuye en formato ONNX, con dos variantes según la ventana de contexto: 8 segundos (la versión recomendada, con ~38 ms por clip en CPU) y 4 segundos (más rápida, ~17 ms). El preprocesado de audio (log-mel) está integrado en el grafo, por lo que solo se necesita `onnxruntime` y `numpy` para la inferencia. Está pensado para ser ligero y fácil de integrar en pipelines de agentes de voz en tiempo real, y su licencia BSD-2-Clause permite uso comercial con ciertas condiciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune de `openai/whisper-tiny` (transformer encoder-decoder) adaptado para clasificación de audio |
| Parametros totales | ~7,8 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 8 segundos (variante de 4 s disponible) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés, hindi (incluye hinglish) |
| Licencia | BSD-2-Clause |
| Formato de pesos | ONNX (safetensors no disponible) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Whisper Tiny, un transformer encoder-decoder de ~7,8 millones de parámetros originalmente entrenado para reconocimiento de voz. En este caso se ha fine-tuneado para una tarea de clasificación binaria: dado un fragmento de audio de 16 kHz mono, devuelve la probabilidad de que el hablante haya completado su turno. El frontend log-mel está integrado en el grafo ONNX, de modo que la inferencia se reduce a una sola llamada a `onnxruntime`.

El entrenamiento se realizó sobre el dataset público `pipecat-ai/smart-turn-data-v3.2-train`, que contiene muestras de habla en inglés e hindi/hinglish, mayoritariamente generadas con síntesis de voz (TTS). Según la model card, se utilizó el conjunto de test oficial de `smart-turn-v3.2` para evaluar. No se proporcionan detalles sobre el número de tokens, el régimen de entrenamiento o el uso de RLHF/DPO; la información disponible solo indica que es un fine-tune supervisado sobre Whisper Tiny.

## Capacidades

- Detección de fin de turno (turn completion) en audio mono de 16 kHz.
- Clasificación binaria: probabilidad de que el hablante haya terminado su turno.
- Soporte bilingüe inglés-hindi (incluyendo hinglish, mezcla de ambos).
- Inferencia de baja latencia: ~38 ms por clip de 8s en CPU, ~17 ms para la variante de 4s.
- Frontend de audio (log-mel) integrado en el modelo, sin dependencias adicionales más allá de `onnxruntime` y `numpy`.
- Diseñado para integración en agentes de voz en tiempo real junto con un VAD ligero (por ejemplo, Silero).

## Casos de uso

- **Agentes de voz conversacionales**: el modelo se usa para decidir cuándo el usuario ha terminado de hablar y el agente puede responder, evitando interrupciones o silencios incómodos. Se integra tras un VAD que detecta pausas de ~200 ms y se llama al modelo sobre los últimos 8 segundos.
- **Atención al cliente automatizada**: en IVR o chatbots de voz, permite que el sistema espere a que el cliente termine de exponer su problema antes de dar una respuesta, mejorando la experiencia y reduciendo frustraciones.
- **Asistentes personales por voz (smart speakers, móviles)**: para que el asistente no interrumpa al usuario cuando este hace una pausa para pensar, sino que espere hasta que realmente haya terminado.
- **Transcripción y subtitulación en tiempo real**: al conocer el punto de fin de turno, se puede segmentar mejor el audio para transcribir frases completas en lugar de fragmentos parciales.
- **Sistemas de dictado por voz**: en aplicaciones de dictado, el modelo puede indicar cuándo el usuario ha terminado una frase y así activar el procesamiento de la misma.
- **Pruebas y evaluación de agentes de voz**: se puede usar para medir la calidad de la detección de turno en sistemas de voz existentes, comparando con el modelo de referencia Smart Turn v3.2.

## Benchmarks y rendimiento

Se han publicado resultados sobre el conjunto de test oficial de `smart-turn-v3.2-test` (accuracy con umbral 0,5). La comparación con el modelo de referencia de Pipecat (Smart Turn v3.2) es la siguiente:

| Dataset | Este modelo (8s) | Smart Turn v3.2 |
|---|---|---|
| Hindi | 93,0 % | 92,8 % |
| Inglés | 93,7 % | 94,7 % |
| Conversación humana/real | 94,4 % | 95,5 % |

El modelo supera al de referencia en hindi y se queda a menos de un punto porcentual en inglés y en datos de conversación real, con un tamaño mucho menor. El AUC global en el conjunto de test es de 0,983.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de ~7,8 millones de parámetros, la inferencia en CPU es suficiente; no se requieren GPUs. El tamaño del modelo en ONNX es inferior a 100 MB.
- **GPUs recomendadas**: no se necesita GPU para inferencia; cualquier CPU moderna puede ejecutar el modelo con latencia de ~38 ms para la ventana de 8s y ~17 ms para la de 4s.
- **Despliegue**: se integra en Python con `onnxruntime` y `numpy`. No se mencionan herramientas como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje sino de audio.
- **Latencia y throughput**: en CPU, ~38 ms por clip de 8s y ~17 ms para el de 4s. Para un agente de voz en tiempo real, este tiempo es despreciable comparado con la duración del audio.

## Comparativa con modelos similares

El modelo se posiciona como una alternativa ligera al Smart Turn v3.2 de Pipecat, que es un modelo de detección de turno más grande (no se especifica su tamaño exacto en la información disponible). La comparación principal se basa en el rendimiento sobre el mismo conjunto de test.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Precisión (Hindi/English) |
|---|---|---|---|---|---|
| Smart Turn Hinglish (este) | ~7,8 M | 8s (o 4s) | en, hi | BSD-2-Clause | 93,9% / 93,7% |
| Smart Turn v3.2 (Pipecat) | no disponible | no disponible | en, hi | Apache 2.0 (según repositorio) | 92,8% / 94,7% |
| Silero VAD | ~2 M | 32ms | universal | MIT | No aplica (solo VAD) |

Nota: Silero VAD es un detector de actividad de voz, no de fin de turno, por lo que la comparación es solo orientativa. No se dispone de datos sobre otros modelos de detección de turno en este contexto.

## Limitaciones y advertencias

- El modelo se entrenó principalmente con voz sintética (TTS). La conversación real y casual en un micrófono de portátil o móvil está fuera de la distribución de entrenamiento y es donde presenta más errores.
- No se proporcionan detalles sobre el rendimiento en otros idiomas distintos de inglés e hindi; el soporte multilingüe está limitado a estos dos.
- La latencia indicada (38 ms) es para la variante de 8s en CPU; en entornos con recursos muy limitados puede variar.
- El modelo solo devuelve una probabilidad de que el turno haya terminado; no genera texto ni realiza otras tareas de comprensión del lenguaje.
- La licencia BSD-2-Clause permite uso comercial, pero se debe revisar los términos del modelo base Whisper-tiny y del dataset pipecat (aunque este último es público y abierto, se recomienda verificar las condiciones para uso comercial).
- No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval, etc.) porque no es un modelo de lenguaje.

## Enlaces

- HuggingFace del modelo: [codewithmoin/smart-turn-hinglish](https://huggingface.co/codewithmoin/smart-turn-hinglish)
- Repositorio de código y entrenamiento: [github.com/CodeWithMoin/smart-turn-hinglish](https://github.com/CodeWithMoin/smart-turn-hinglish)
- Dataset de entrenamiento de Pipecat: [pipecat-ai/smart-turn-data-v3.2-train](https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-train)
- Repositorio original de Pipecat Smart Turn: [github.com/pipecat-ai/smart-turn](https://github.com/pipecat-ai/smart-turn)
- Modelo Smart Turn v2 (referencia): https://huggingface.co/pipecat-ai/smart-turn-v2

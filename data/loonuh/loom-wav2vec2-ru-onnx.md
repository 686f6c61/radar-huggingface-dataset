# LooNuH/loom-wav2vec2-ru-onnx

## Resumen

`loom-wav2vec2-ru-onnx` es una exportación a ONNX del modelo `jonatasgrosman/wav2vec2-large-xlsr-53-russian`, un wav2vec2-large multilingüe (XLSR-53) afinado para reconocimiento de voz en ruso. Lo publica el usuario LooNuH como artefacto de infraestructura para Loom, un reproductor de música, y su propósito no es la transcripción libre sino el *forced alignment* (alineamiento forzado) de letras ya conocidas sobre una grabación: dado el texto y el audio, devolver en qué milisegundo empieza y acaba cada palabra.

El modelo base es un transformer convolucional wav2vec2 de Meta AI con cabecera CTC, afinado por Jonatas Grosman sobre XLSR-53 para ruso. La exportación no modifica los pesos: añade al grafo la normalización del extractor de características (media cero, varianza unitaria) y un `log_softmax` sobre los logits CTC, de modo que la entrada es audio PCM crudo a 16 kHz y la salida son log-probabilidades por frame. Se ofrecen dos variantes, fp32 e int8 con cuantización dinámica de los pesos MatMul.

Su relevancia es acotada pero clara: elimina la dependencia de Python y de preprocesado en el dispositivo, permitiendo ejecutar el alineador en un reproductor de escritorio o móvil con ONNX Runtime. No es un modelo nuevo ni mejora la calidad del original; su valor está en el empaquetado y en el benchmark de alineamiento publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-large (CNN feature encoder + transformer encoder, cabecera CTC) |
| Parametros totales | no disponible (el modelo base wav2vec2-large ronda los 300 M; la model card no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; entrada `input_values` de longitud variable `[1, samples]` a 16 kHz, salida `[1, frames, 39]` con un frame cada 20 ms |
| Tipos de cuantizacion | fp32 (`model.onnx`) e int8 dinamica sobre pesos MatMul (`model_int8.onnx`) |
| Idiomas soportados | ruso (`ru`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), exportado con torch 2.15.0; vocabulario en `vocab.json` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un extractor de características convolucional que convierte audio de 16 kHz en una secuencia de representaciones latentes cada 20 ms, seguido de un encoder transformer (variante *large* de wav2vec2) y una cabeza lineal CTC de 39 tokens. El vocabulario usa `<pad>` como blank CTC y `|` como delimitador de palabra. La exportación envuelve el modelo con la normalización del feature extractor y un `log_softmax` final, de forma que el consumidor recibe directamente log-probabilidades sin preprocesado en Python.

No se detallan en la información disponible los datos de entrenamiento del modelo base ni del afinado en ruso: la model card remite a la del modelo original de Jonatas Grosman para la evaluación. Tampoco se documenta RLHF, DPO ni ninguna innovación de decodificación; la decodificación queda en manos del consumidor, que en el caso de Loom aplica Viterbi CTC sobre el texto conocido. Los pesos son idénticos a los del modelo base en la revisión `2329100508896c6d9b157019803ab5601e6f3406`; el único cambio es estructural (normalización y softmax dentro del grafo).

## Capacidades

- Reconocimiento de voz en ruso con salida CTC (log-probabilidades por frame), apto para decodificación greedy o con restricciones de léxico.
- Alineamiento forzado de texto conocido sobre audio: Viterbi CTC para obtener inicio y fin de cada palabra en milisegundos.
- Entrada de audio crudo float32 a 16 kHz mono, sin pasos de preprocesado externos.
- Ejecución en dispositivo mediante ONNX Runtime, sin dependencia de Python en tiempo de inferencia.
- Dos variantes de precisión intercambiables (fp32 e int8) con el mismo grafo.
- No soporta tool calling, function calling, agentes, visión, audio de salida ni modo de razonamiento; es un modelo acústico puro.
- Multilingüe: no, únicamente ruso.

## Casos de uso

- Karaoke y letras sincronizadas: dado el texto de la canción y la pista de voz separada, el modelo devuelve el instante de inicio y fin de cada palabra, que la aplicación usa para resaltar la línea en curso. Es el caso para el que se creó.
- Reproductores de música en escritorio: integración del `model_int8.onnx` con ONNX Runtime para generar archivos de timings en local, sin subir audio a un servidor ni requerir Python.
- Aplicaciones móviles de letras: el factor de tiempo real de 0,24 en int8 sobre CPU Apple Silicon permite alinear una canción más rápido de lo que dura su reproducción.
- Subtitulado a nivel de palabra de contenido hablado en ruso: alineamiento de transcripciones existentes (podcasts, entrevistas) para producir subtítulos con timings por palabra.
- Verificación y control de calidad de transcripciones: comparar el texto esperado con las log-probabilidades CTC para detectar segmentos donde el audio no coincide con la transcripción.
- Investigación en fonética y prosodia: extracción de fronteras de palabra a partir de un texto de referencia, con errores de inicio en torno a 47-61 ms de mediana según la variante.
- Preprocesado en pipelines de datos de voz: alineamiento masivo de corpus con transcripción conocida antes de entrenar otros modelos.

## Benchmarks y rendimiento

Benchmark publicado por el autor (2026-11-05, CPU Apple Silicon, ONNX Runtime 1.31, 4 hilos). Audio de habla con timings conocidos: 27 palabras en 6 frases sintetizadas con `say` de macOS (voz Milena), unidas con silencios de duración conocida y alineadas por Viterbi CTC sobre el texto conocido. Los errores son |alineado − real|.

| Fichero | Inicio de palabra mediana / p90 | Fin de palabra mediana / p90 | CER greedy | Factor de tiempo real |
|---|---|---|---|---|
| `model.onnx` | 47 / 80 ms | 137 / 221 ms | 4,2 % | 0,46 |
| `model_int8.onnx` | 61 / 80 ms | 137 / 221 ms | 4,2 % | 0,24 |

El CER greedy se incluye solo como referencia de reconocimiento sin texto; Loom alinea texto que ya posee. El autor señala que los finales de palabra salen sistemáticamente adelantados en la duración del último sonido, porque CTC marca la letra y no su decaimiento. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 1,6 GB e incluye ambas variantes, por lo que el fichero fp32 es del orden de varios cientos de MB y el int8 aproximadamente la mitad de los pesos MatMul.
- GPU recomendadas: no se documentan; el benchmark se realizó en CPU (Apple Silicon), lo que sugiere que la GPU no es necesaria.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño del modelo base (wav2vec2-large) y la disponibilidad de una variante int8.
- Despliegue: ONNX Runtime (versión usada en el benchmark: 1.31), con ejecución en CPU multihilo; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: factor de tiempo real de 0,46 en fp32 y 0,24 en int8 con 4 hilos en CPU Apple Silicon, es decir, entre dos y cuatro veces más rápido que el tiempo real del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LooNuH/loom-wav2vec2-ru-onnx` | no disponible (base wav2vec2-large) | audio de longitud variable a 16 kHz | ASR ruso + alineamiento forzado, ONNX | Apache-2.0 | HuggingFace |
| `jonatasgrosman/wav2vec2-large-xlsr-53-russian` | no disponible (base wav2vec2-large) | audio de longitud variable a 16 kHz | ASR ruso, PyTorch | Apache-2.0 | HuggingFace |
| `facebook/wav2vec2-large-xlsr-53` | no disponible (wav2vec2-large) | audio de longitud variable a 16 kHz | ASR multilingüe (53 idiomas), PyTorch | Apache-2.0 | HuggingFace |

La comparación relevante es con el modelo original: mismos pesos y misma calidad de reconocimiento, con la diferencia de que la exportación ONNX incorpora normalización y softmax y ofrece una variante int8. Frente a XLSR-53 sin afinar, el modelo en ruso debería ser superior en ese idioma, aunque no se han publicado métricas comparativas en la información disponible.

## Limitaciones y advertencias

- No está ajustado para voces cantadas; el autor indica que Loom separa la voz primero cuando puede, y el benchmark se hizo con habla sintetizada, no con canto real.
- Los finales de palabra se adelantan de forma sistemática en la duración del último sonido (mediana de 137 ms de error en el fin de palabra), un sesgo intrínseco a la emisión CTC.
- El CER greedy del 4,2 % corresponde a habla sintetizada con una sola voz; no es representativo de audio real, ruidoso o con acentos.
- Solo ruso: no hay soporte multilingüe ni cambio de idioma.
- Riesgo de alucinación y de errores de alineamiento en pasajes con solapamiento musical, ruido o habla no coincidente con el texto proporcionado.
- Sesgos del modelo base no documentados en la información disponible (variedad de voces, género, acentos del corpus de entrenamiento).
- Licencia Apache-2.0, que permite uso comercial, pero el autor no ofrece garantías sobre el modelo ni sobre los datos de entrenamiento del original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni mantenimiento demostrado.
- La fecha de creación indicada (2026-11-04) y las versiones citadas (torch 2.15.0, ONNX Runtime 1.31) deben tratarse como datos de la model card, no verificados de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LooNuH/loom-wav2vec2-ru-onnx
- Modelo base: https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-russian
- Modelo original de Meta AI: https://huggingface.co/facebook/wav2vec2-large-xlsr-53
- Cita del autor del modelo base: Grosman, J. (2021). *Fine-tuned XLSR-53 large model for speech recognition in Russian*.
- Scripts de exportación y benchmark: `Tools/wav2vec2-onnx/export.py` y `Tools/wav2vec2-onnx/bench.py` en el repositorio de Loom (no se proporciona URL en la información disponible).

# coder543/nemotron-speech-streaming-en-0.6b-glade

## Resumen

Nemotron Speech Streaming English 0.6B for Glade es una conversión del checkpoint `nvidia/nemotron-speech-streaming-en-0.6b` de NVIDIA a activos `.aimodel` para Apple Core AI, con el objetivo de ejecutar reconocimiento automático de habla (ASR) en streaming sobre el Neural Engine de dispositivos Apple con macOS 27 o iOS 27. El autor de la conversión es `coder543`; el modelo base es de NVIDIA. El modelo resuelve el problema de transcribir audio continuo en tiempo real en hardware de consumo Apple, sin GPU dedicada y con latencia controlada.

La arquitectura del modelo base es un encoder en streaming con subsampling causal, predictor recurrente y decoder voraz, con atención, convolución y estado recurrente que persisten entre actualizaciones. El bundle comparte pesos entre una entrada de calidad (actualizaciones cada 1,12 s) y una entrada de previsualización opcional (actualizaciones cada 160 ms). El tamaño del repo es de 2,5 GB y el modelo base tiene 0,6 mil millones de parámetros.

La relevancia actual radica en que demuestra ASR streaming cuantizado (W8A16 en el encoder) ejecutándose íntegramente en el ANE de un iPhone 15 Pro Max o un MacBook Air M3, con velocidades medidas de 52× a 62× en tiempo real para la ruta de calidad. Es un ejemplo de despliegue de modelos de voz en el borde (edge), sin depender de la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder en streaming (W8A16) con subsampling causal FP16, predictor recurrente FP16 y decoder voraz; activos para Apple Core AI |
| Parámetros totales | 0,6 mil millones (modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (audio continuo en streaming; estado persistente entre actualizaciones) |
| Tipos de cuantización | W8A16 (encoder), FP16 (subsampling causal, predictor, grafos de vocabulario) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | Activos `.aimodel` para Apple Core AI (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es un sistema ASR en streaming con un encoder que procesa audio mono continuo a 16 kHz, un subsampling causal en FP16, un predictor recurrente y un decoder voraz. La atención, la convolución, el subsampling y el estado del decoder recurrente persisten entre actualizaciones, lo que permite transcripción incremental sin reiniciar el contexto acústico. El encoder está cuantizado a W8A16; el resto de componentes se mantienen en FP16.

La conversión a Glade no entrena el modelo: transforma los pesos del checkpoint de NVIDIA (revisión `ebe59e5a817142986528bbbee5dba8db7b38ed50`) en grafos especializados por dispositivo para el Neural Engine. El bundle incluye un modo de calidad con actualizaciones cada 1,12 s y un modo de previsualización especulativa cada 160 ms que ejecuta seis actualizaciones especulativas entre actualizaciones de calidad y luego descarta el estado especulativo copiando el estado de calidad. El estado especulativo nunca alimenta al decoder de calidad. No se dispone de información sobre el dataset de entrenamiento, número de tokens ni si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Reconocimiento automático de habla en inglés sobre audio mono continuo a 16 kHz.
- Transcripción en streaming con estado persistente de atención, convolución y decoder recurrente.
- Modo de calidad con actualizaciones cada 1,12 s y modo de previsualización opcional cada 160 ms con texto provisional.
- Decodificación voraz recurrente (greedy) implementada por el host.
- Entrega de transcripciones parciales y volcado final (final flush).
- Ejecución en el Neural Engine de Apple silicon (Mac y iPhone), con cero intervalos de GPU del proceso objetivo en las trazas medidas.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio de entrada distinto de ASR ni capacidades multilingües más allá del inglés.

## Casos de uso

- Transcripción en tiempo real en aplicaciones iOS: el modelo puede integrarse en una app de notas de voz que transcribe continuamente con actualizaciones cada 1,12 s, usando el modo de previsualización para mostrar texto provisional mientras el usuario habla.
- Subtitulado en directo en macOS: un host puede capturar audio del sistema a 16 kHz y emitir subtítulos con latencia de calidad de 1,12 s, aprovechando el RTFx de 62,2× medido en un M3 MacBook Air.
- Dictado por voz en el dispositivo: al ejecutarse en el ANE sin GPU, permite dictado sin conexión y sin enviar audio a la nube, adecuado para aplicaciones con requisitos de privacidad.
- Asistentes de voz locales: la transcripción en streaming con estado persistente permite alimentar un pipeline de intención y respuesta por turnos sin esperar al final de la frase.
- Indexación y búsqueda de reuniones: procesamiento por lotes de grabaciones largas (el discurso completo de 18 min 15 s se procesó en 17,6 s en el modo de calidad) para generar transcripciones indexables.
- Accesibilidad: subtitulado en vivo para personas con discapacidad auditiva en dispositivos Apple, con la opción de previsualización de baja latencia para reducir la sensación de retardo.
- Prototipado de ASR en el borde: referencia para evaluar el rendimiento del ANE con modelos cuantizados W8A16 en comparación con implementaciones en CPU/GPU.

## Benchmarks y rendimiento

Rendimiento medido por el autor en el discurso «We choose to go to the Moon» de John F. Kennedy (extracto de 20 s y discurso completo de 18 min 15 s, 1.095,3 s). Los resultados incluyen frontend, estados persistentes, decodificación recurrente, entrega parcial y volcado final; se excluyen preparación y calentamiento. Mayor RTFx es más rápido.

| Modo | Extracto 20 s | Discurso completo | RTFx completo |
|---|---:|---:|---:|
| Calidad 1,12 s (M3 MacBook Air, 16 GB) | 0,277 s | 17,601 s | 62,2× |
| Previsualización 160 ms aislada (M3) | 1,516 s | 89,992 s | 12,2× |
| Dual 160 ms + 1,12 s (M3) | 1,588 s | 90,922 s | 12,0× |
| Calidad 1,12 s (iPhone 15 Pro Max, A17 Pro) | 0,359 s | 21,070 s | 52,0× |
| Dual 160 ms + 1,12 s (iPhone 15 Pro Max) | 1,990 s | 117,545 s | 9,3× |

Referencia independiente de velocidad: una ejecución anterior en M3 de la implementación FluidAudio en el nivel de 1,12 s midió 0,374 s en el extracto corto y 22,479 s en el completo (48,7×), medianas de tres ejecuciones con PCM precargado; no se repitió junto a las mediciones duales anteriores. La huella máxima del cliente en modo dual en iPhone fue de 756,6 MB, excluyendo asignaciones en servicios del acelerador. El procesamiento dual completo realiza 979 actualizaciones de calidad y 5.868 actualizaciones de previsualización.

No se han publicado resultados de benchmarks de precisión (WER, MMLU u otros) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: dispositivos Apple silicon físicos con macOS 27 o iOS 27; los activos `.aimodel` se especializan en el dispositivo.
- Memoria: huella máxima medida en modo dual en iPhone 15 Pro Max de 756,6 MB (excluyendo asignaciones en servicios del acelerador). No se dispone de cifra de VRAM para otras configuraciones.
- GPU: no se utiliza GPU; la inferencia se ejecuta en el Neural Engine (ANE). Las trazas medidas muestran cero intervalos de GPU del proceso objetivo.
- Cabe en hardware de consumo Apple: medido en M3 MacBook Air de 16 GB y iPhone 15 Pro Max (A17 Pro). No hay datos para otros dispositivos.
- Preparación inicial: 51,5 s de mediana en M3 MacBook Air (51,4–52,1 s) y 55,3 s observados en iPhone 15 Pro Max; con caché de proceso fresco, 31,8 ms de mediana en M3 y 138–190 ms en iPhone. La preparación del encoder supuso 50,5 s de la mediana en Mac y 53,1 s en el iPhone.
- Opciones de despliegue: host propio que implemente extracción de características continuas, preservación de estados de grafo y decodificación recurrente voraz sobre Apple Core AI. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: RTFx de 62,2× (calidad, M3) y 52,0× (calidad, iPhone 15 Pro Max); 12,0× y 9,3× en modo dual respectivamente. Los intervalos de actualización no son latencia de palabra medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| coder543/nemotron-speech-streaming-en-0.6b-glade | 0,6 B | Streaming continuo | 62,2× RTFx (calidad, M3); 52,0× (calidad, iPhone) | NVIDIA Open Model License | Hugging Face (activos Core AI) |
| nvidia/nemotron-speech-streaming-en-0.6b | 0,6 B | Streaming continuo | No disponible en la información proporcionada | NVIDIA Open Model License | Hugging Face (checkpoint original) |
| FluidAudio (nivel 1,12 s) | No disponible | Streaming continuo | 48,7× RTFx (M3, medición independiente citada) | No disponible | Referencia de velocidad citada por el autor |

No se dispone de datos de otros modelos comparables de ASR streaming en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Requiere un host que implemente extracción de características continuas, preservación de estados de grafo y decodificación voraz; no es un modelo autónomo.
- El modo de previsualización es especulativo y puede mostrar texto provisional que luego se reemplaza; el autor recomienda políticas de visualización para evitar parpadeo de puntuación.
- Las actualizaciones cortas de 160 ms son intensivas en memoria y no son siete veces más baratas que las de calidad.
- La preparación inicial es costosa (51,5 s en M3, 55,3 s en iPhone); la caché reduce la carga posterior, pero el autor advierte que los tiempos de instalación prístina no son totalmente observables.
- Las trazas de colocación en ANE no establecen el dispositivo para todas las invocaciones joint-only ni miden ocupación de ALU, ancho de banda de memoria o consumo energético.
- Los benchmarks de velocidad no establecen consumo energético y los intervalos de actualización no equivalen a latencia de palabra.
- La licencia NVIDIA Open Model License impone condiciones para uso comercial; debe revisarse antes de producción.
- Riesgo de alucinación y sesgos del modelo base no cuantificados en la información disponible.
- La identidad del checkpoint fuente de la referencia FluidAudio no fue verificada independientemente; el checkpoint oficial de NVIDIA es la referencia de corrección.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coder543/nemotron-speech-streaming-en-0.6b-glade
- Modelo base: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b/tree/ebe59e5a817142986528bbbee5dba8db7b38ed50
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Repositorio FluidAudio (revisión citada `5c51c5c93afff0d89594a2a93c3103e790ba648c`): no disponible como URL en la información proporcionada
- Paper, blog o demo del autor: no disponible en la información proporcionada

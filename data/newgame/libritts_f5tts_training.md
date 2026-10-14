# NewGame/libritts_f5tts_training

## Resumen
El modelo NewGame/libritts_f5tts_training es un sistema de síntesis de voz (text-to-speech, TTS) desarrollado por el usuario NewGame, basado en la arquitectura F5TTS e implementado con la librería ESPnet3. Se distribuye como un bundle empaquetado a partir de la receta `egs3/libritts/f5tts` y está entrenado sobre el corpus LibriTTS. Con 157.945.188 parámetros (unos 632 MB en float32), el modelo genera audio a 24 kHz y permite clonación de voz zero-shot a partir de un audio de referencia y su transcripción.

La relevancia de este modelo radica en su tamaño relativamente compacto, que lo hace desplegable en hardware de consumo, y en su capacidad de clonar voces con pocos segundos de referencia. No obstante, la información pública es limitada: no se especifican licencia, idiomas soportados ni formatos de pesos alternativos, y las métricas reportadas presentan valores atípicos que aconsejan una validación independiente antes de usarlo en producción.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | F5TTS (transformer con atención rotatoria, capas de convolución y solver ODE Euler) |
| Parametros totales | 157.945.188 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo TTS); duración máxima de audio en entrenamiento: 20 s |
| Tipos de cuantizacion | No disponible (pesos en float32; no se ofrecen variantes cuantizadas) |
| Idiomas soportados | No disponible (entrenado con LibriTTS, corpus en inglés) |
| Licencia | No disponible |
| Formato de pesos | No disponible (bundle de ESPnet3; probablemente .pth o .pt, no especificado) |
| Tamaño del repositorio | 0,6 GB |
| Framework | ESPnet3 |
| Frecuencia de muestreo | 24 kHz |
| Mel bins | 100 |
| Hop length | 256 |
| Win length | 1024 |
| N_FFT | 1024 |
| Tokenización | Carácter (char) con limpieza Tacotron |
| Módulos | 418 total, 275 hoja |
| Buffers | 4.194.338 (16,78 MB) |

## Arquitectura y entrenamiento
El modelo implementa la clase `F5TTS` de ESPnet3, una arquitectura no autorregresiva basada en un transformer con atención rotatoria (`rotary_attention_heads: 1`), 18 capas, 12 cabezas de atención de 64 dimensiones, `hidden_size` de 768 y 4 capas de convolución. La generación de audio emplea un solver ODE de Euler (`ode_solver_method: euler`) con `sigma: 0.0`, lo que sugiere un enfoque de flow matching o difusión. El modelo incluye mecanismos de regularización como `audio_drop_probability: 0.3`, `condition_drop_probability: 0.2` y un rango de enmascaramiento de 0,7 a 1,0. La extracción de características mel se realiza con `n_fft: 1024`, `hop_length: 256` y `win_length: 1024` sobre audio de 24 kHz.

El entrenamiento se llevó a cabo sobre el corpus LibriTTS, con fragmentos de audio de entre 1 y 20 segundos, utilizando 4 dispositivos (probablemente GPU), 600.000 pasos y hasta 1.000 épocas. Se empleó el optimizador AdamW con `lr: 7.5e-05`, `betas: [0.9, 0.999]` y `weight_decay: 0.01`, junto con un scheduler de warmup lineal de 20.000 pasos. Se aplicó acumulación de gradientes de 8, recorte de gradiente de 1,0 y un callback EMA con decaimiento 0.9999. La tokenización es a nivel de carácter con limpieza tipo Tacotron. No se menciona el uso de RLHF ni DPO.

## Capacidades
- Generación de voz a partir de texto con salida de audio a 24 kHz.
- Clonación de voz zero-shot: a partir de un audio de referencia y su transcripción, el modelo sintetiza nuevas locuciones imitando la voz de referencia.
- Entrada de texto tokenizada por caracteres y normalizada con limpieza Tacotron.
- Generación de audio de duración variable, aunque el entrenamiento se restringió a fragmentos de 1 a 20 segundos.
- No se ha documentado soporte para tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo exclusivamente TTS).
- No se especifican capacidades multilingües; el corpus LibriTTS es en inglés, por lo que se espera un rendimiento limitado en otros idiomas.
- No se describen modos especiales como thinking mode, visión o audio de entrada más allá de la referencia de voz.

## Casos de uso
- Audiolibros y narración: el modelo puede convertir texto largo en narración hablada clonando la voz de un narrador profesional a partir de una muestra de referencia, lo que resulta adecuado para producir audiolibros con una identidad de voz consistente.
- Asistentes de voz y sistemas IVR: permite generar respuestas habladas personalizadas en aplicaciones de atención al cliente, integrando la clonación de voz para mantener la marca o la voz corporativa.
- Accesibilidad: personas con discapacidad del habla pueden clonar su propia voz a partir de grabaciones previas y utilizarla para comunicarse mediante texto, gracias a la clonación zero-shot con pocos segundos de audio.
- Doblaje y localización de vídeo: se puede emplear para generar pistas de voz sintética en inglés (idioma del corpus) y, con entrenamiento adicional, en otros idiomas, reduciendo costes frente a actores de doblaje.
- Videojuegos: generación de voces para personajes no jugadores (NPC) o diálogos dinámicos, clonando voces de referencia para mantener la coherencia actoral sin necesidad de sesiones de grabación extensas.
- Creación de podcasts y contenido sonoro: producción de episodios sintéticos con una voz fija y natural, útil para prototipos o contenido generado automáticamente.
- Sistemas de lectura de pantalla (screen readers): lectura de textos con una voz natural y personalizable, mejorando la experiencia de usuarios con discapacidad visual.

## Benchmarks y rendimiento
| dataset | fwhisper_cer | fwhisper_cer_delete | fwhisper_cer_equal | fwhisper_cer_insert | fwhisper_cer_replace | fwhisper_wer | fwhisper_wer_delete | fwhisper_wer_equal | fwhisper_wer_insert | fwhisper_wer_replace | spk_similarity | utmos |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| librispeech_pc | 0,7644 | 0,228 | 94,4667 | 0,354 | 0,1429 | 1,6404 | 0,0293 | 17,9494 | 0,0728 | 0,1961 | 0,7058 | 4,1267 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Los valores de CER y WER son inusualmente altos (por ejemplo, `fwhisper_cer` 0,7644 y `fwhisper_wer` 1,6404), lo que podría indicar un error de escala o un rendimiento limitado en el benchmark `librispeech_pc`; se recomienda interpretarlos con cautela. La similitud de hablante (`spk_similarity`) es de 0,7058 y la calidad subjetiva estimada (`utmos`) es de 4,1267 sobre 5.

## Requisitos de hardware
- VRAM estimada para inferencia: los pesos en float32 ocupan aproximadamente 632 MB; en FP16 se reducirían a unos 316 MB. Sumando activaciones y buffers, la inferencia completa debería caber en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con más de 2 GB de VRAM, como GTX 1050 Ti (4 GB), GTX 1650, RTX 3050, RTX 2060 o superiores. También es viable ejecutarlo en CPU, aunque con mayor latencia.
- Cabe en GPU de consumo: sí, en modelos de gama baja y media.
- Opciones de despliegue: la API de inferencia de ESPnet3 (`espnet3.api.inference.load`) y PyTorch son las vías documentadas. No hay soporte nativo para vLLM, llama.cpp u Ollama, dado que es un modelo de audio. Podría exportarse a ONNX para optimización, pero no se menciona en la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
No se incluyen datos comparativos con otros modelos en la información proporcionada. Como referencia cualitativa, en la categoría de TTS zero-shot con clonación de voz existen alternativas como XTTS-v2 (Coqui), StyleTTS2 y la implementación original de F5-TTS, pero no se dispone de métricas comparables para este modelo concreto. Tampoco se detallan parámetros, contexto o licencia de dichos sistemas en la documentación analizada.

## Limitaciones y advertencias
- Licencia no disponible: se desconoce si permite uso comercial, lo que supone un riesgo legal para su integración en productos.
- Idioma: el entrenamiento se realizó con LibriTTS, un corpus en inglés; no hay evidencia de soporte para otros idiomas, y su rendimiento fuera del inglés probablemente sea deficiente.
- Sesgos: al estar entrenado con audiolibros en inglés, puede heredar sesgos de género, acento o estilo de locución propios del corpus, aunque no se documentan análisis específicos.
- Riesgo de alucinación: como todo modelo generativo de audio, puede producir artefactos, ruidos, pronunciaciones incorrectas o entonaciones extrañas, especialmente con textos fuera del dominio de entrenamiento.
- Métricas anómalas: los valores de CER y WER reportados son muy elevados y podrían reflejar un problema de escala o un bajo rendimiento real; se recomienda una evaluación propia antes de confiar en ellos.
- Limitaciones de contexto: no maneja contexto textual largo; el entrenamiento se limitó a segmentos de 1 a 20 segundos, por lo que textos extensos pueden degradar la calidad o requerir fragmentación.
- Madurez: el repositorio tiene solo 20 descargas y 0 likes, sin validación externa conocida, lo que sugiere un modelo en fase temprana o experimental.
- Sin cuantizaciones: solo se ofrecen pesos en float32, lo que limita optimizaciones de memoria y velocidad en despliegues con recursos muy ajustados.
- No hay información sobre latencia, throughput ni rendimiento en producción.

## Enlaces
- HuggingFace: https://huggingface.co/NewGame/libritts_f5tts_training
- Repositorio de origen (GitHub): https://github.com/NewGamezzz/espnet.git
- Receta de entrenamiento: `egs3/libritts/f5tts` (dentro del repositorio de ESPnet)

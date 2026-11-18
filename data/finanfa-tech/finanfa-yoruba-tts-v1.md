# finanfa-tech/finanfa-yoruba-tts-v1

## Resumen

finanfa-yoruba-tts-v1 es un modelo de síntesis de voz (text-to-speech) especializado en yoruba (`yo`), publicado por Finanfa Tech en el marco de su trabajo sobre tecnologías del habla para lenguas de Benín y África Occidental. El modelo parte del trabajo de alineación original de Samuel Olubukun (`samuelolubukun/murivo-tts-21m-yoruba`) y emplea una arquitectura Flow-Matching Diffusion Transformer (DiT) de aproximadamente 20,9 millones de parámetros, acoplada al vocodificador causal VoxCPM2 AudioVAE de OpenBMB que genera audio nativo a 48 kHz.

La relevancia del modelo reside en dos factores. Primero, aborda una lengua de bajos recursos con un sistema de tonos y diacríticos complejo (acentos agudos y graves, subpuntos en `ọ`, `ẹ`, `ṣ`), y la model card declara respeto estricto de esa ortografía. Segundo, la versión pública está cuantizada en int8 con un peso de solo 21 MB, lo que permite inferencia en CPU y dispositivos ligeros, un punto diferencial frente a los TTS multilingües de gran tamaño.

El repositorio tiene un tamaño declarado de 0,0 GB y cero descargas en el momento de la consulta, lo que sugiere una publicación muy reciente (creada el 18 de noviembre de 2026) y sin validación comunitaria todavía. La licencia es Apache 2.0 tanto para el modelo como para el código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-Matching Diffusion Transformer (DiT) con vocodificador causal VoxCPM2 AudioVAE |
| Parametros totales | ~20,9 M (quantizado int8) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 |
| Idiomas soportados | yoruba (`yo`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0,0 GB; la model card indica descarga mediante `hf download`) |
| Frecuencia de muestreo | 48 000 Hz nativa |
| Tamano del artefacto | 21 MB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo combina dos componentes. El primero es un Diffusion Transformer (DiT) de aproximadamente 20,9 M de parámetros entrenado con flow matching, un paradigma generativo que aprende un campo de velocidad entre una distribución de ruido y la distribución de mel-espectrogramas (o representaciones latentes equivalentes) mediante integración de una EDO. El segundo es el vocodificador causal VoxCPM2 AudioVAE de OpenBMB, que convierte la representación acústica en forma de onda a 48 kHz. La naturaleza causal del vocodificador es coherente con escenarios de streaming, aunque la model card no detalla explícitamente el modo de despliegue en tiempo real.

La inferencia expuesta en la model card revela parámetros de muestreo típicos de los modelos de difusión: `guidance=1.8` (classifier-free guidance), `steps=15` (número de pasos de integración) y `speed=1.0` (control de velocidad del habla). No se especifica en la información disponible el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron etapas de RLHF, DPO o ajuste por preferencias. Tampoco se detalla el proceso de alineación original de Samuel Olubukun más allá de la atribución. La cuantización int8 y el empaquetado corren a cargo de AWADEME Ronaldo (Finanfa Tech).

## Capacidades

- Síntesis de voz en yoruba a 48 kHz nativos, con salida en WAV mediante `tts.save_wav(audio, ruta, sample_rate=48000)`.
- Respeto declarado de la ortografía tonal yoruba: acentos agudos (`´`), graves (`` ` ``) y subpuntos (`ọ`, `ẹ`, `ṣ`).
- Control de la fuerza de condicionamiento mediante `guidance` (valor de ejemplo 1.8).
- Control del número de pasos de difusión mediante `steps` (valor de ejemplo 15), lo que permite intercambiar calidad por latencia.
- Control de velocidad del habla mediante `speed` (valor de ejemplo 1.0).
- Ejecución en CPU (`device="cpu"`) o GPU (`device="cuda"`).
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, visión, audio de entrada ni clonación de voz.

## Casos de uso

- **Lectura de contenidos educativos en yoruba**: el modelo puede narrar textos escolares o materiales de alfabetización respetando los tonos, un aspecto crítico porque en yoruba el tono cambia el significado léxico. La salida a 48 kHz es adecuada para reproducción en altavoces de aula.
- **Accesibilidad para personas con discapacidad visual**: integración en lectores de pantalla para usuarios yoruhablantes de Benín y Nigeria, con inferencia en CPU que evita depender de GPU dedicada en dispositivos de gama baja.
- **Locuciones para radio comunitaria y podcasts**: generación de cuñas y avisos en yoruba con control de velocidad (`speed`) para ajustar la duración al espacio disponible en parrilla.
- **Sistemas de megafonía y avisos públicos**: despliegue en dispositivos ligeros (21 MB, int8) para anuncios en estaciones, mercados o centros de salud, donde el coste de un TTS multilingüe grande sería prohibitivo.
- **Prototipado de asistentes conversacionales en yoruba**: uso como componente TTS dentro de un pipeline ASR-LLM-TTS para experimentación académica, gracias a la licencia Apache 2.0 y a la API Python sencilla (`MurivoTTS`).
- **Investigación en TTS de bajos recursos**: el modelo sirve como línea base reproducible para comparar arquitecturas DiT con flow matching frente a modelos autorregresivos en lenguas tonales, dado su reducido tamaño y su licencia permisiva.
- **Doblaje y localización de contenido breve**: generación de pistas de voz para vídeos formativos o campañas de salud pública dirigidas a población yoruhablante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 20,9 M de parámetros en int8 el peso del modelo es de 21 MB, por lo que el consumo de memoria es dominado por el vocodificador VoxCPM2 y por los buffers de activación, no por los pesos.
- GPU recomendadas: no se especifican en la model card; el ejemplo oficial usa `device="cpu"` como opción por defecto y `device="cuda"` como alternativa si hay GPU disponible.
- Compatibilidad con GPU de consumo: altamente probable dado el tamaño (21 MB), aunque no se confirma ningún modelo concreto (RTX 4090, RTX 3060, etc.).
- Opciones de despliegue: script Python propio del repositorio (`infer.py`, clase `MurivoTTS`) con dependencias `torch`, `soundfile` y `numpy`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, lo cual es esperable en un modelo TTS.
- Latencia y throughput: no disponibles. El parámetro `steps=15` sugiere un coste de inferencia de 15 evaluaciones del DiT por utterance, pero no se aportan medidas de tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia | Idiomas | Licencia | Contexto |
|---|---|---|---|---|---|
| finanfa-yoruba-tts-v1 | ~20,9 M (int8) | 48 kHz | yoruba | Apache 2.0 | no disponible |
| VoxCPM2 (OpenBMB) | no disponible | 48 kHz | no disponible | no disponible | no disponible |
| murivo-tts-21m-yoruba (Samuel Olubukun) | ~21 M | no disponible | yoruba | no disponible | no disponible |
| rapido-tts (Anurag Kanade) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación se limita a los componentes citados en la propia model card, ya que la información proporcionada no incluye datos de rendimiento ni especificaciones completas de las alternativas. No se dispone de cifras de MOS, similitud de hablante ni tasas de error de pronunciación para ninguno de los modelos listados.

## Limitaciones y advertencias

- El repositorio declara un tamaño de 0,0 GB y cero descargas, lo que impide verificar que los pesos estén efectivamente publicados y accesibles; conviene comprobar los archivos antes de integrarlo en producción.
- Monolingüe: solo yoruba (`yo`). No se documenta comportamiento en otras lenguas ni capacidad de code-switching con inglés o francés, frecuente en contextos urbanos de Nigeria y Benín.
- No se publican métricas objetivas de calidad (MOS, WER de transcripción inversa, similitud de hablante), por lo que la afirmación de "alta fidelidad" de la model card no está respaldada por datos verificables.
- Riesgo de alucinación acústica y de prosodia incorrecta en textos con tonos poco frecuentes u ortografía no normalizada; no se documenta el preprocesado aplicado a los diacríticos.
- No se especifica el corpus de entrenamiento ni la procedencia de las voces, lo que impide evaluar sesgos de género, dialectales (yoruba de Nigeria frente a yoruba de Benín) ni posibles problemas de consentimiento de los hablantes originales.
- El vocodificador VoxCPM2 se distribuye bajo la licencia de OpenBMB, no bajo Apache 2.0; la model card no aclara si esa licencia impone restricciones adicionales al uso comercial del conjunto.
- La licencia Apache 2.0 del modelo y del código permite uso comercial, pero al no haber validación externa se recomienda auditar la calidad antes de desplegarlo en aplicaciones de cara al público.
- Sin soporte documentado de streaming en tiempo real ni de clonación de voz, lo que limita casos de uso de personalización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finanfa-tech/finanfa-yoruba-tts-v1
- Organización Finanfa Tech: https://huggingface.co/finanfa-tech
- Modelo base de alineación (Samuel Olubukun): https://huggingface.co/samuelolubukun/murivo-tts-21m-yoruba
- Arquitectura acústica Rápido (Anurag Kanade): https://huggingface.co/edwixx/rapido-tts
- Vocodificador VoxCPM2 (OpenBMB): https://huggingface.co/openbmb/VoxCPM2

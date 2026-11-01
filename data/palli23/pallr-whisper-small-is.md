# palli23/pallr-whisper-small-is

## Resumen

pallr-whisper-small-is es un modelo de reconocimiento automático del habla (ASR) para islandés, obtenido mediante fine-tuning de openai/whisper-small (242 millones de parámetros) sobre corpus de voz islandeses. Lo desarrolla Páll Rúnarsson, del laboratorio HUMI de la Universidad de Reikiavik, y genera texto con mayúsculas y puntuación, a diferencia de muchas adaptaciones ASR que trabajan solo en minúsculas.

Su relevancia radica en la relación entre tamaño y prestaciones: con 242 millones de parámetros y un peso de aproximadamente 970 MB, se sitúa en un orden de magnitud por debajo de los modelos islandeses de referencia (whisper-large-icelandic de 1.550 millones y wav2vec2-large-xlsr-53-icelandic de 315 millones), lo que permite ejecutarlo en CPU de portátil o incluso en un teléfono, habilitando transcripción offline en el dispositivo.

El modelo se entrenó con Samrómur Milljón, Samrómur 21.05 y Spjallrómur, y declara un WER del 11,0 % en el test de Samrómur 21.05, del 44,1 % en audio de radio de RÚV (Fjölmiðlatal 22.02) y del 1,7 % en el test de Samrómur Milljón, si bien este último es en dominio y no representa una evaluación fuera de distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), fine-tuning de openai/whisper-small |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s por segmento (chunk_length_s=30 recomendado para audio largo) |
| Tipos de cuantizacion | no disponible en la model card (pesos en safetensors; cuantización a GGUF/ONNX no documentada por el autor) |
| Idiomas soportados | islandés (is) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Se trata de un fine-tuning completo de openai/whisper-small, un transformer encoder-decoder con atención estándar y entrada de audio remuestreada a 16 kHz. El modelo base se entrenó originalmente con 680.000 horas de audio supervisado multilingüe; el autor no detalla en la model card el volumen total de horas de fine-tuning ni la composición exacta del dataset más allá de los tres corpus empleados.

Los datos de entrenamiento son Samrómur Milljón (corpus de lectura de gran tamaño), Samrómur 21.05 y Spjallrómur (corpus de habla conversacional). No se documenta en la información disponible el uso de RLHF, DPO ni ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). El autor recomienda decodificar con `repetition_penalty=1.2` y `no_repeat_ngram_size=3` para mitigar las repeticiones de Whisper en silencios o ruido.

## Capacidades

- Reconocimiento automático del habla en islandés con salida en texto con mayúsculas y puntuación.
- Transcripción de audio de cualquier duración mediante segmentación en ventanas de 30 s (`chunk_length_s=30`).
- Manejo de habla leída (corpus Samrómur) y habla conversacional (Spjallrómur).
- Ejecución en CPU y en dispositivos de bajos recursos, incluida inferencia offline en teléfono.
- Integración con el pipeline `automatic-speech-recognition` de transformers.
- No se documenta soporte de tool calling, agentes, visión, audio de entrada más allá de ASR, ni capacidades multilingües fuera del islandés.

## Casos de uso

- Transcripción offline en el dispositivo: con ~970 MB de pesos, el modelo puede ejecutarse en la CPU de un portátil o un teléfono moderno, permitiendo dictado y notas de voz sin conexión ni envío de audio a la nube, algo crítico por privacidad.
- Subtitulado de contenido audiovisual islandés: útil para vídeos, pódcast y grabaciones de reuniones en islandés, con la ventaja de que la salida ya incluye puntuación y mayúsculas, lo que reduce el postprocesado.
- Atención al cliente en islandés: transcripción de llamadas y chats de voz para sistemas de analítica o enrutamiento, aprovechando que el modelo cabe en infraestructura modesta y el coste por hora de audio es bajo.
- Aplicaciones de accesibilidad: dictado por voz para personas con movilidad reducida en islandés, ejecutable localmente en hardware barato.
- Investigación lingüística y corpus: generación de transcripciones a gran escala de grabaciones islandesas (entrevistas, encuestas) donde el coste computacional es el factor limitante y un WER del 11 % en habla leída es aceptable.
- Prototipado y edge computing: despliegue en dispositivos embebidos o Raspberry Pi para demos de ASR en islandés, al ser un modelo de 242 M de parámetros en lugar de los 1.550 M de la alternativa large.
- Transcripción de radio y medios: aunque con WER alto (44,1 % en Fjölmiðlatal), puede servir para indexación aproximada o búsqueda de fragmentos, no para subtitulado de emisión.

## Benchmarks y rendimiento

Word error rate (%, menor es mejor), evaluado en minúsculas y sin puntuación:

| Test set | WER |
|---|---|
| Samrómur 21.05 test | 11,0 |
| Fjölmiðlatal 22.02 (radio RÚV) | 44,1 |
| Samrómur Milljón test | 1,7 (en dominio) |

Comparativa publicada por el autor:

| Modelo | Parámetros | Pesos | Samrómur 21.05 | Fjölmiðlatal |
|---|---|---|---|---|
| pallr-whisper-small-is | 242 M | ~970 MB | 11,0 | 44,1 |
| whisper-large-icelandic-62640-steps-967h | 1.550 M | ~6,2 GB | 6,9 | 38,1 |
| wav2vec2-large-xlsr-53-icelandic-ep30-967h | 315 M | ~1,3 GB | 7,0 | 45,4 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB de pesos más activaciones; en fp16 alrededor de 0,5 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. Con GPU, cualquier modelo desde una GTX 1650 o RTX 3060 en adelante es más que suficiente; A100/H100 no aportan ventaja práctica por el tamaño del modelo.
- Cabe en GPU consumer: sí, en todas las RTX y en iGPU modernas; también en CPU de portátil y en teléfonos según el autor.
- Opciones de despliegue: pipeline de transformers (documentado por el autor), servidores compatibles con la API de transformers (el tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints). No se documenta soporte oficial de vLLM, llama.cpp, Ollama ni TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | WER Samrómur 21.05 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pallr-whisper-small-is | 242 M | audio 30 s/segmento | 11,0 | CC BY-SA 4.0 | HuggingFace |
| whisper-large-icelandic-62640-steps-967h | 1.550 M | audio 30 s/segmento | 6,9 | no disponible en la información | HuggingFace (language-and-voice-lab) |
| wav2vec2-large-xlsr-53-icelandic-ep30-967h | 315 M | audio (wav2vec2, sin decoder) | 7,0 | no disponible en la información | HuggingFace (language-and-voice-lab) |

El modelo sacrifica precisión en habla leída (11,0 frente a 6,9-7,0) a cambio de un tamaño 6,4 veces menor que el large de Whisper y de salida con puntuación y mayúsculas, además de inferencia viable en CPU. En audio de radio, su WER (44,1) es peor que whisper-large (38,1) pero mejor que wav2vec2-large (45,4).

## Limitaciones y advertencias

- WER elevado en audio fuera de dominio: 44,1 % en radio RÚV, lo que lo hace inadecuado para transcripción precisa de medios sin revisión humana.
- El 1,7 % en Samrómur Milljón es una métrica en dominio (las frases aparecen en los prompts de entrenamiento) y no debe interpretarse como rendimiento general.
- Riesgo de repeticiones y bucles en silencios o ruido; el autor recomienda explícitamente `repetition_penalty=1.2` y `no_repeat_ngram_size=3`.
- Solo islandés: no soporta otros idiomas aunque el modelo base Whisper sea multilingüe.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- No se documentan sesgos específicos, pero al entrenarse sobre corpus de lectura y conversación islandeses puede tener sesgo hacia registros y acentos presentes en Samrómur.
- No hay información sobre cuantizaciones validadas ni sobre latencia/throughput en producción.
- El modelo se creó en octubre de 2026 y tiene 50 descargas; no hay validación comunitaria extensa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/palli23/pallr-whisper-small-is
- Modelo base: https://huggingface.co/openai/whisper-small
- Demo en navegador: https://ormal.is
- Comparativa whisper-large-icelandic: https://huggingface.co/language-and-voice-lab/whisper-large-icelandic-62640-steps-967h
- Comparativa wav2vec2-large-xlsr-53-icelandic: https://huggingface.co/language-and-voice-lab/wav2vec2-large-xlsr-53-icelandic-ep30-967h

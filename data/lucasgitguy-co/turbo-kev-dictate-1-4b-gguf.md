# Lucasgitguy-co/Turbo-Kev-Dictate-1.4B-GGUF

## Resumen

Turbo-Kev-Dictate-1.4B-GGUF es la distribucion en formato GGUF de Turbo-Kev-Dictate-1.4B, un modelo multimodal audio-texto desarrollado por Lucasgitguy-co y orientado a dictado: recibe audio y devuelve texto limpio, con eliminacion de muletillas y ruido conversacional. La arquitectura combina un encoder de audio heredado de Whisper (integrado en los ficheros `mmproj`) con un modelo de lenguaje de aproximadamente 772,8 millones de parametros reales en safetensors, pese a la denominacion "1.4B" del nombre comercial. El pipeline declarado es `automatic-speech-recognition` y la licencia es Apache-2.0.

La relevancia de esta ficha es doble. Por un lado, documenta una integracion practica con llama.cpp mediante `llama-mtmd-cli` y `llama-server`, con un par recomendado de cuantizaciones (modelo de texto Q5_K_M de 593 MB y proyector multimodal q8_0 de 736 MB). Por otro, el propio autor declara en la model card que la puerta de publicacion ha fallado: en pruebas retenidas el modelo fusionado obtiene un WER de 8,81 en FLEURS frente a 5,74 de Whisper-turbo, y de 30,85 frente a 11,64 en grabaciones largas. Ademas, solo transcribe el 64,95 % de las preguntas dictadas en lugar de responderlas.

Se publica tal cual para permitir la inspeccion del resultado. Para dictado en produccion, el propio autor recomienda Whisper-turbo seguido de una etapa de limpieza de texto. Esta ficha debe leerse, por tanto, como documentacion de un artefacto experimental con limitaciones declaradas, no como una alternativa validada a los sistemas ASR establecidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal audio-texto: encoder de audio Whisper + proyector + modelo de lenguaje transformer (detalles internos del LM no disponibles) |
| Parametros totales | 772.845.888 (safetensors del modelo base); el nombre comercial indica "1.4B" |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens en el ejemplo de servidor de la model card (valor de configuracion, no especificacion oficial del modelo) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M (recomendada), Q4_K_M (no publicada por fallar la regla de calidad); proyector en f16 y q8_0 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0; el encoder Whisper incluido es MIT (OpenAI) |
| Formato de pesos | GGUF (llama.cpp), con ficheros separados de modelo de texto y `mmproj`, mas un bundle de un solo fichero |
| Tamano del repo | 7,1 GB |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

El modelo sigue el esquema Ultravox: un encoder de audio (derivado de Whisper, segun la licencia MIT incluida en `LICENSE-whisper-MIT.txt`) procesa la senal acustica, un proyector la alinea con el espacio de representaciones del modelo de lenguaje y el LM genera la transcripcion o el texto limpio. En el repositorio GGUF esta separacion se materializa en dos artefactos que deben cargarse conjuntamente: el fichero de texto (`Turbo-Kev-Dictate-*.gguf`) y el `mmproj-*.gguf`, que contiene encoder de audio y proyector. El bundle de un solo fichero agrupa ambos byte a byte y no es cargable directamente por llama.cpp; requiere desempaquetado previo con el script `gguf_bundle.py`.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, el uso de RLHF o DPO, ni innovaciones tecnicas adicionales. La model card si documenta el proceso de cuantizacion: cada cuantizacion de texto se evaluo con el `mmproj` f16 sobre los conjuntos de prueba completos, y una cuantizacion se publica solo si no hace fallar ninguna puerta que BF16 supere y si sus WER en G1 y G2 quedan a menos de 0,5 puntos de BF16. La busqueda se realizo de mayor a menor tamano y se detuvo en el primer fallo, lo que excluyo a Q4_K_M.

## Capacidades

- Reconocimiento automatico de voz en ingles: transcripcion de audio en formato wav, mp3 o flac mediante `llama-mtmd-cli` o la API OpenAI-compatible de `llama-server` (parte `input_audio`).
- Limpieza de texto dictado: eliminacion de muletillas y ruido conversacional; la puerta G1 (eliminacion de fillers) es la unica que supera segun el autor.
- Modo texto: enviar una transcripcion pegada como mensaje de usuario, sin audio, y recibir el texto limpio por el mismo servidor.
- Integracion con llama.cpp: soporte de `--jinja`, plantillas de chat y servidor compatible con `/v1/chat/completions`.
- Decodificacion determinista recomendada (`--temp 0`) para transcripcion.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, vision, audio de salida ni multilingueismo mas alla del ingles.

## Casos de uso

- Dictado de notas en ingles con limpieza de muletillas: el modelo elimina fillers (unica puerta superada, G1), por lo que puede usarse en entornos controlados donde la calidad de transcripcion no sea critica y se acepte supervision humana.
- Prototipado de pipelines ASR sobre llama.cpp: sirve para validar la integracion de audio en `llama-server` con la API OpenAI-compatible antes de sustituir el modelo por uno con mejor WER.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye puntuaciones por cuantizacion (G1, FLEURS, LibriSpeech) que permiten estudiar el impacto de Q5_K_M frente a Q8_0 y BF16 en un caso real.
- Limpieza de transcripciones existentes en modo texto: reenviar transcripciones de otro motor ASR como mensaje de usuario para normalizar el texto, sin usar la parte de audio.
- Despliegue en hardware muy limitado: el par recomendado ocupa 593 MB (texto) + 736 MB (proyector), lo que permite ejecutarlo en equipos sin GPU dedicada con llama.cpp.
- Investigacion sobre fusion encoder-LM: util como referencia reproducible de un intento de fusion audio-texto con puertas de calidad documentadas y resultados negativos publicados.

## Benchmarks y rendimiento

Datos publicados en la model card del repositorio GGUF (WER, menor es mejor):

| Modelo de texto | Tamano | G1 dis WER | G2 FLEURS | G2 LibriSpeech | G3 kept | Publicado |
|---|---:|---:|---:|---:|---:|---|
| BF16 | 1558 MB | 6,37 | 8,81 | 3,42 | 64,95 % | si |
| Q8_0 | 834 MB | 6,35 | 8,79 | 3,36 | 64,95 % | si |
| Q6_K | 647 MB | 6,33 | 8,85 | 3,42 | 65,98 % | si |
| Q5_K_M | 593 MB | 6,33 | 8,72 | 3,42 | 64,43 % | si |
| Q4_K_M | 542 MB | 8,28 | 9,24 | 3,44 | 63,4 % | no |
| Q5_K_M + mmproj q8_0 | 593 + 736 MB | 6,35 | 8,78 | 3,44 | no disponible | si |

Comparacion con la linea base declarada por el autor: Whisper-turbo obtiene 5,74 WER en FLEURS frente a 8,81 del modelo fusionado, y 11,64 frente a 30,85 en grabaciones largas. El modelo solo transcribe el 64,95 % de las preguntas dictadas en lugar de responderlas. La puerta de publicacion se declara como FAILED (G2_fleurs-en-test, G3, G5).

## Requisitos de hardware

- VRAM estimada: el par recomendado (Q5_K_M + mmproj q8_0) suma 1.329 MB de pesos; con contexto de 8192 tokens la huella completa es del orden de 2 GB, aunque no se publican mediciones oficiales.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM es suficiente, e incluso es viable en CPU.
- Cabe en GPU consumer: si, practicamente cualquier RTX o equivalente reciente; tambien en Apple Silicon mediante `brew install llama.cpp`.
- Opciones de despliegue: llama.cpp (`llama-mtmd-cli` para CLI y `llama-server` para API OpenAI-compatible con `--jinja -c 8192 --temp 0`). No se documenta soporte de vLLM, TGI, Ollama ni transformers para esta variante GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER FLEURS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Turbo-Kev-Dictate-1.4B (Q5_K_M) | 772,8 M (safetensors) | 8192 (config. de ejemplo) | 8,72 | Apache-2.0 | GGUF en HF |
| Whisper-turbo (linea base citada) | no disponible | no disponible | 5,74 | MIT (OpenAI) | Disponible |
| Whisper large-v3 | no disponible | no disponible | no disponible | MIT (OpenAI) | Disponible |
| Ultravox (familia) | no disponible | no disponible | no disponible | no disponible | Disponible |

La comparacion se limita a la linea base citada por el autor, Whisper-turbo, que supera al modelo en FLEURS (5,74 frente a 8,81) y en grabaciones largas (11,64 frente a 30,85). No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Puerta de publicacion fallida: el autor declara FAILED en G2_fleurs-en-test, G3 y G5; el modelo es peor que Whisper-turbo en habla leida limpia y en grabaciones largas.
- Solo transcribe el 64,95 % de las preguntas dictadas en lugar de responderlas, lo que lo inutiliza para asistentes conversacionales por voz.
- WER de 30,85 en grabaciones largas frente a 11,64 de la linea base: degradacion severa con audio extenso.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Riesgo de alucinacion y de salida no fiel al audio no cuantificado en la informacion disponible.
- La cuantizacion Q4_K_M no se publica por incumplir la regla de calidad; usar cuantizaciones menores no esta soportado por el autor.
- El bundle de un solo fichero no es cargable directamente por llama.cpp; requiere desempaquetado con `gguf_bundle.py`.
- La licencia Apache-2.0 permite uso comercial, pero el encoder Whisper incluido esta bajo MIT de OpenAI y debe respetarse su atribucion (`NOTICE`, `LICENSE-whisper-MIT.txt`).
- El autor recomienda explicitamente, para dictado, Whisper-turbo seguido de limpieza de texto en lugar de este modelo.
- El numero de parametros reales (772,8 M) no coincide con la denominacion "1.4B" del nombre, lo que puede inducir a error en estimaciones de recursos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Lucasgitguy-co/Turbo-Kev-Dictate-1.4B-GGUF
- Modelo base: https://huggingface.co/Lucasgitguy-co/Turbo-Kev-Dictate-1.4B
- llama.cpp (build de referencia): https://github.com/ggml-org/llama.cpp

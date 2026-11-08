# adventists-ai/Sophon-Realtime-32B-Flash

## Resumen

Sophon-Realtime-32B-Flash es un modelo de voz full-duplex de 32 000 millones de parametros desarrollado por adventists-ai. Se sirve como un unico modelo vLLM-Omni que escucha al usuario, redacta una respuesta (opcionalmente con etiquetas de sonido como `[laughter]`, `[cough]`, `[sigh]` o `[breath]`) y habla mientras escribe, emitiendo un fotograma de audio cada 80 ms. La etapa de voz realiza las etiquetas en lugar de leerlas en voz alta.

Forma parte de la familia Sophon-Realtime v1, compuesta por tres variantes que comparten el mismo "cerebro" de 32B (el modelo que escucha, decide los turnos y redacta la respuesta). Flash se diferencia de la variante Tag unicamente en la etapa de voz: su etapa de voz es autorregresiva con una sola pasada hacia delante por paso, lo que reduce la latencia del primer audio y aumenta la concurrencia. Frente a Tag, sacrifica expresividad (0.63/0.77 en NVV-SuperBench en ingles/chino, frente a 0.80/0.86) a cambio de 0.31 s hasta el primer audio y 40 usuarios concurrentes por GPU de 80 GB.

El modelo esta pensado para despliegues de voz en tiempo real con requisitos estrictos de latencia y densidad por GPU. La licencia es Apache-2.0 tanto para el codigo como para los pesos, y soporta chino e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Full-duplex speech-to-speech con thinker de 32B y etapa de voz autorregresiva (una pasada por paso); servido mediante vLLM-Omni |
| Parametros totales | 32 000 millones (thinker); tamano de la etapa de voz no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | thinker en FP8; otras cuantizaciones no disponibles |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 (codigo y pesos; ver `NOTICE` para fuentes) |
| Formato de pesos | safetensors (`config.json`, `thinker/` en FP8, `talker/`, `voices/`) |
| Tamano del repositorio | 40.9 GB |
| Pipeline | any-to-any |
| Voces disponibles | `chelsie` (por defecto), `brand` |
| Frecuencia de audio de salida | 24 kHz (WAV en base64) |
| Fotograma de audio | uno cada 80 ms |

## Arquitectura y entrenamiento

Sophon-Realtime-32B-Flash se estructura en dos etapas sobre un unico modelo vLLM-Omni. El thinker, un modelo de 32B en FP8, escucha la entrada de audio del usuario, decide los turnos de conversacion y redacta la respuesta en texto, incluyendo etiquetas de sonido cuando corresponde. La etapa de voz (talker) convierte esa respuesta etiquetada en audio de forma autorregresiva, con una unica pasada hacia delante por paso, lo que explica su menor latencia frente a la variante Tag. El modelo fue ajustado con un system prompt especifico (`config/system_prompt.json`); sin el se generan menos etiquetas.

La familia v1 comparte el mismo thinker entre las tres variantes (Tag, Flash y E2E); solo cambia el mecanismo que transforma la respuesta en sonido. En Flash, un modelo de voz mas ligero y rapido interpreta la respuesta etiquetada; en Tag lo hace un modelo de voz expresivo; en E2E (preview) un talker interno al modelo de 32B sustituye al modelo de voz separado. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Conversacion de voz full-duplex: escucha al usuario mientras habla y responde sin esperar a que termine el turno, decidiendo por si mismo cuando el usuario ha acabado.
- Salida simultaneous speech-to-speech: emite audio mientras redacta el texto de la respuesta.
- Etiquetas de sonido paralinguisticas: `[laughter]`, `[cough]`, `[sigh]`, `[breath]`, `<laughter>…</laughter>` y `<strong>…</strong>`; las etiquetas se interpretan, nunca se leen en voz alta.
- Comprension paralinguistica: segun el repositorio GitHub, el modelo "escucha como dices las cosas", es decir, procesa informacion paralinguistica de la entrada.
- Salida multimodal texto + audio en la misma peticion (`"modalities": ["text","audio"]`).
- Soporte de API compatible con OpenAI: `/v1/chat/completions` y `/v1/realtime` (estilo OpenAI Realtime, con `input_audio_buffer.append`).
- Multilingue en chino e ingles, seleccionable mediante el parametro `language`.
- Seleccion de voz (`chelsie`, `brand`).
- Soporte de VAD incluido en la configuracion de despliegue.

## Casos de uso

- Atencion al cliente por voz en tiempo real: el modelo mantiene conversaciones full-duplex con deteccion automatica de fin de turno, lo que permite interrupciones naturales; con 40 flujos concurrentes por GPU de 80 GB es adecuado para centros de contacto con alta densidad.
- Asistentes de voz para aplicaciones moviles o web: la latencia de 0.31 s hasta el primer audio en un solo flujo hace viable una experiencia conversacional fluida mediante la API `/v1/realtime`.
- Agentes telefonicos automatizados: la licencia Apache-2.0 y el despliegue sobre vLLM permiten integrar el modelo en infraestructura propia sin restricciones de uso comercial.
- Generacion de audio expresivo para contenido: las etiquetas de sonido (risa, tos, suspiro) permiten producir respuestas habladas con matices paralinguisticos para doblaje, audiolibros interactivos o personajes virtuales.
- Transcripcion y respuesta con tono en ingles y chino: util para servicios bilingues de soporte o asistencia donde se requiere cambiar de idioma mediante el parametro `language`.
- Investigacion en modelos de voz full-duplex: al ser codigo y pesos abiertos, sirve como base para experimentar con etapas de voz alternativas, ya que la familia comparte el thinker y permite sustituir solo el talker.
- Despliegue de alta concurrencia en produccion: con unos 55 GB de memoria por instancia y hasta 40 flujos recomendados por GPU de 80 GB, se puede escalar horizontalmente con una instancia por GPU tras un balanceador de carga.

## Benchmarks y rendimiento

Resultados de NVV-SuperBench (ingles / chino) y latencia, segun la model card:

| Metrica | Flash | Tag (referencia) | E2E (referencia) |
|---|---|---|---|
| NVV-SuperBench en / zh | 0.63 / 0.77 | 0.80 / 0.86 | 0.60 / 0.77 |
| Primer audio, un usuario | 0.31 s | ~0.6 s | ~1 s |
| Usuarios por GPU de 80 GB (recomendado) | 40 | 16 | 4-5 |
| GPUs necesarias | 1 | 1 | 2 |

Rendimiento con un H100 de 80 GB, thinker en FP8, via `/v1/chat/completions` (audio del usuario hasta primer fragmento de audio):

| Carga | Primer audio mediana / P90 | Stall (mediana) |
|---|---|---|
| 1 flujo | 0.31 / 0.34 s | 0 |
| 20 flujos (llegando en 10 s) | 0.45 / 0.52 s | 0.09 s |
| 40 flujos (en 10 s) | 0.58 / 0.67 s | 0.37 s |
| 64 flujos (en 8 s) | 0.84 / 1.03 s | 1.9 s (encolamiento) |

Precision de etiquetas de sonido (conjunto held-out, voz Chelsie, evaluado por DuplexJev):

| Etiqueta | zh | en |
|---|---|---|
| `[laughter]` | 83% | 77% |
| `<laughter>…</laughter>` (reir mientras habla) | 78% | 71% |
| `[cough]` | 90% | 50% (8 items) |
| `[sigh]` (AST) | 90% | 100% |
| Tasa media de error de caracteres / palabras | 0.9% | 1.0% |

No se han publicado resultados de benchmarks de razonamiento o codigo (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 55 GB por instancia en FP8; el repositorio de pesos ocupa 40.9 GB.
- GPU recomendada: una H100 de 80 GB por instancia; el rendimiento publicado se ha medido en ese hardware.
- Cabe en GPU de consumo: no disponible; con 55 GB de memoria por instancia no cabe en GPU de consumo convencionales (hasta 24-32 GB), aunque no se confirma oficialmente.
- Escalado: hasta unos 40 flujos concurrentes por GPU de 80 GB; para mas carga, una instancia por GPU tras un balanceador de carga.
- Despliegue: vLLM 0.30 y vLLM-Omni 0.30 con el plugin `sophon_realtime`; scripts de un solo comando (`install.sh`, `start.sh`, `stop.sh`) en el repositorio de GitHub.
- Tiempo de arranque: la primera vez compila kernels (unos 10 minutos); arranques posteriores tardan 5-8 minutos.
- Latencia: 0.31 s de mediana hasta el primer audio con un flujo; 0.58 s de mediana con 40 flujos.
- Otros motores (llama.cpp, Ollama, TGI): no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sophon-Realtime-32B-Flash | 32B (thinker) | no disponible | Full-duplex speech-to-speech, etapa de voz rapida | Apache-2.0 | Pesos en Hugging Face |
| Sophon-Realtime-32B-Tag | 32B (thinker) | no disponible | Full-duplex speech-to-speech, etapa de voz expresiva | Apache-2.0 | Pesos en Hugging Face |
| Sophon-Realtime E2E (preview) | 32B (thinker) | no disponible | Talker interno al modelo, sin modelo de voz separado | Apache-2.0 | En pruebas, proximamente |

No se dispone de informacion sobre otros modelos de voz full-duplex comparables en la busqueda realizada.

## Limitaciones y advertencias

- La etiqueta `<strong>` (enfasis) es debil en esta version; se anuncia mejora en la siguiente build.
- La deteccion de `[cough]` en ingles solo alcanza el 50% sobre un conjunto de 8 elementos, frente al 90% en chino.
- Sin etiqueta, el modelo rara vez se rie por si solo; el uso del system prompt incluido es necesario para que se generen etiquetas con la frecuencia esperada.
- La expresividad es inferior a la de la variante Tag (NVV-SuperBench 0.63/0.77 frente a 0.80/0.86).
- Idiomas limitados a chino e ingles; no se declara soporte de otros idiomas.
- Longitud de contexto no documentada; no se puede evaluar su idoneidad para conversaciones de muy largo alcance.
- A partir de 64 flujos se produce encolamiento con stalls de 1.9 s de mediana; el limite recomendado es de unos 40 flujos por GPU de 80 GB.
- No se han publicado datos sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- El primer arranque requiere compilar kernels (unos 10 minutos), lo que complica el escalado elastico.
- Licencia Apache-2.0 sin restricciones conocidas para uso comercial, pero debe revisarse el fichero `NOTICE` por las fuentes de los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash
- Repositorio GitHub: https://github.com/adventists-ai/sophon-realtime
- Codigo de despliegue Flash: https://github.com/adventists-ai/sophon-realtime/tree/main/flash
- Variante Tag: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Tag

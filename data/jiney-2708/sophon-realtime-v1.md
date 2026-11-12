# JINEY-2708/Sophon-Realtime-v1

## Resumen

Sophon-Realtime v1 es una familia de modelos de voz full-duplex de tipo speech-to-speech desarrollada por Adventists AI (publicada bajo el identificador JINEY-2708 en Hugging Face). El modelo resuelve el problema de la conversación de voz natural: escucha de forma continua mientras el usuario habla, detecta el final del turno, permite interrupciones (barge-in) y responde con entonación propia, incluyendo sonidos no verbales como risas, suspiros o carraspeos. Su propuesta diferencial es el entendimiento paralingüístico: interpreta *cómo* se dicen las cosas (duda, énfasis, sarcasmo) además del contenido léxico.

La familia comparte un único "cerebro" de 32B parámetros que escucha, decide cuándo tomar el turno y redacta la respuesta; los tres builds (Tag, Flash y E2E) se diferencian únicamente en cómo convierten esa respuesta en audio. Tag emplea etiquetas de sonido interpretadas por un modelo de habla expresiva, Flash usa un modelo de habla más ligero y rápido, y E2E genera vectores de voz continuos mediante un talker compacto de unos 350M parámetros.

El modelo es relevante porque compite con sistemas propietarios de voz en tiempo real (GPT-4o-mini-Audio, Gemini, Grok) manteniendo pesos y código bajo licencia Apache-2.0, con despliegue en una única GPU de 80 GB y soporte de tool calling en modo full-duplex. Los idiomas soportados son chino (zh) e inglés (en).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Full-duplex speech-to-speech; cerebro LLM de 32B compartido + módulo de síntesis de voz según build (Tag: modelo de habla expresiva; Flash: modelo de habla ligero; E2E: talker de ~350M parámetros) |
| Parametros totales | 32B (cerebro compartido); E2E añade un talker de ~350M |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (pesos Tag ~42 GB según la model card) |

## Arquitectura y entrenamiento

La familia se organiza en torno a un cerebro LLM de 32B parámetros que realiza tres funciones: escucha continua, decisión de turno (turn-taking) y generación de la respuesta. Sobre ese cerebro se acoplan tres estrategias de síntesis. En el build Tag, el cerebro escribe la respuesta con etiquetas de sonido que un modelo de habla expresiva interpreta y vocaliza, de modo que el modelo decide cuándo reír, suspirar, respirar o carraspear y la voz lo ejecuta en lugar de leer la etiqueta en voz alta. En Flash se usa el mismo esquema de etiquetas con un modelo de habla más ligero y rápido. En E2E, un talker compacto de aproximadamente 350M parámetros genera vectores de voz continuos directamente, sin tokens de habla intermedios.

El componente de escucha se denomina DuplexJev, descrito como un modelo abierto de decisión de habla que aporta la capacidad paralingüística. La model card menciona el identificador arXiv 2609.21967, pero no detalla en el texto proporcionado el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal. Sí se documenta el modo Live, una pasarela compatible con el protocolo OpenAI GPT-Live que permite delegar tareas de consulta o acción a un modelo backend mayor y devolver el resultado hablado con la voz de Sophon.

## Capacidades

- Generación de voz full-duplex: escucha continua, detección de fin de turno, barge-in (interrupción) y back-channels (señales de escucha como asentimientos verbales).
- Entendimiento paralingüístico: interpreta duda, énfasis, sarcasmo, risas y suspiros del interlocutor.
- Habla expresiva: produce sonidos no verbales (risa, suspiro, respiración, carraspeo) de forma contextualizada.
- Tool calling en modo full-duplex: Pass@1 del 48% en Full-Duplex-Bench v3 con tasa de respuesta del 100%.
- Modo Live compatible con la interfaz OpenAI GPT-Live: permite sustituir el backend por un modelo mayor para tareas de consulta o acción.
- Transcripción auditable: cada respuesta incluye una transcripción verificable.
- Soporte multilingüe limitado a chino e inglés.
- API dual: WebSocket full-duplex (`/v1/realtime`) y endpoint HTTP (`/v1/chat/completions`) con audio de entrada y texto más audio de salida.

## Casos de uso

- Atención al cliente telefónica automatizada: el build Flash permite hasta 40 usuarios concurrentes por GPU de 80 GB con una latencia de primer audio de 0,31 s, adecuado para volúmenes altos de llamadas con turnos naturales e interrupciones.
- Compañeros conversacionales y personajes: el build Tag, con NVV-SuperBench de 0,86 en chino y 0,80 en inglés, permite que el personaje ría, suspire o carraspee según el contexto emocional de la conversación.
- Asistentes en vehículo: la latencia de primer audio de ~0,25 s del build E2E y la capacidad de barge-in encajan con interacciones manos libres donde el conductor interrumpe constantemente.
- Agentes de voz con ejecución de tareas: el tool calling full-duplex (Pass@1 48% en Full-Duplex-Bench v3) permite consultar sistemas, reservar citas o ejecutar acciones mientras se mantiene la conversación hablada.
- Demos y prototipos de voz expresiva: el despliegue en una sola GPU con un único comando y el Studio público en ModelScope facilitan pruebas rápidas sin infraestructura dedicada.
- Migración desde OpenAI GPT-Live: el modo Live permite cambiar la URL y la clave en clientes existentes manteniendo la voz de Sophon y delegando la lógica de negocio a un backend propio.
- Análisis de interacciones con transcripción auditable: cada respuesta genera transcripción verificable, útil para cumplimiento y revisión de calidad en entornos regulados.

## Benchmarks y rendimiento

| Benchmark | Sophon-Realtime v1 (Tag) | Flash | E2E | Referencia |
|---|---|---|---|---|
| VoiceBench | 82,8 | no disponible | no disponible | GPT-4o-mini-Audio: nivel comparable |
| Big Bench Audio | 81,8% | no disponible | no disponible | con DeepSeek V4 Pro como backend: ~83 |
| Paralingüística (LISTEN, StressTest, MSPB) | 48,6 | no disponible | no disponible | Gemini 3.8 Flash: 46,9; Qwen3-Omni: 44,6 |
| NVV-SuperBench (zh / en) | 0,86 / 0,80 | 0,77 / 0,63 | 0,85 / 0,75 | no disponible |
| Full-Duplex-Bench v3 tool calling (Pass@1) | 48% | no disponible | no disponible | Grok: 43% |
| Primer audio, un usuario | ~0,6 s | 0,31 s | ~0,25 s | no disponible |
| Usuarios concurrentes por GPU de 80 GB | 16 | 40 | 16 | no disponible |

## Requisitos de hardware

- VRAM estimada: una GPU de 80 GB por build según la model card; los pesos del build Tag ocupan ~42 GB.
- GPU recomendadas: GPU de 80 GB (A100 80 GB o H100); no se documentan requisitos para GPUs de menor memoria.
- GPU de consumo: no se indica compatibilidad con GPUs de consumo; los pesos de 42 GB y el requisito de 80 GB lo hacen inviable en RTX 4090 (24 GB) sin cuantización no documentada.
- Despliegue: vLLM-Omni con un único comando para Tag y Flash; E2E usa motor propio o vLLM-Omni desde la versión 1.1.4. Instalación vía `pip install "sophon-realtime[trt]"` (Python 3.12, Linux, CUDA 13); sin TensorRT la voz es aproximadamente 3 veces más lenta bajo carga.
- Latencia: primer audio de ~0,6 s (Tag), 0,31 s (Flash) y ~0,25 s (E2E) con un usuario.
- Arranque: primera puesta en marcha de 15 a 20 minutos; arranques posteriores de 5 a 8 minutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paralingüística | Tool calling full-duplex | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sophon-Realtime v1 (Tag) | 32B | no disponible | 48,6 | 48% Pass@1 | Apache-2.0 | Pesos abiertos en HF |
| GPT-4o-mini-Audio | no disponible | no disponible | no disponible | no disponible | Propietaria | API |
| Gemini 3.8 Flash | no disponible | no disponible | 46,9 | no disponible | Propietaria | API |
| Qwen3-Omni | no disponible | no disponible | 44,6 | no disponible | no disponible | no disponible |
| Grok (voz) | no disponible | no disponible | no disponible | 43% Pass@1 | Propietaria | API |

## Limitaciones y advertencias

- Solo soporta chino e inglés; no hay soporte documentado de castellano ni de otros idiomas.
- No se han publicado datos sobre sesgos, composición del dataset de entrenamiento ni procesos de alineación (RLHF/DPO), lo que dificulta evaluar riesgos de sesgo.
- Riesgo de alucinación inherente a un cerebro LLM de 32B: las respuestas habladas pueden contener afirmaciones incorrectas, mitigadas parcialmente por la transcripción auditable.
- La licencia Apache-2.0 permite uso comercial, pero no se documentan restricciones adicionales ni condiciones de atribución específicas más allá de las de la propia licencia.
- El requisito de una GPU de 80 GB limita el despliegue en entornos con hardware de consumo.
- Sin TensorRT, la latencia bajo carga se multiplica por tres aproximadamente.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no existe validación independiente de la comunidad.
- El modo Live depende de un backend externo para tareas de consulta o acción; su rendimiento real depende de ese modelo auxiliar.

## Enlaces

- Hugging Face: https://huggingface.co/JINEY-2708/Sophon-Realtime-v1
- Build Tag (recomendado): https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Tag
- Build Flash: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash
- Build E2E: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-E2E
- GitHub: https://github.com/adventists-ai/sophon-realtime
- Documentación del modo Live: https://github.com/adventists-ai/sophon-realtime/blob/main/live/README.md
- Demo en ModelScope Studio: https://www.modelscope.ai/studios/AdventistsAI/Sophon-Realtime
- Paper: arXiv 2609.21967 (referenciado en los tags; no se dispone de URL directa en la información proporcionada)

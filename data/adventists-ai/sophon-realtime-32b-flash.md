# adventists-ai/Sophon-Realtime-32B-Flash

## Resumen

Sophon-Realtime-32B-Flash es un modelo de voz a voz (speech-to-speech) full-duplex desarrollado por adventists-ai. Se sirve como un unico modelo en vLLM-Omni: escucha al usuario de forma continua, redacta la respuesta mientras este habla (opcionalmente con etiquetas de sonido como `[laughter]`, `[cough]`, `[sigh]` o `[breath]`) y emite audio a la vez que genera texto. La etapa de voz produce un fotograma cada 80 ms y las etiquetas se interpretan, nunca se leen en voz alta.

El modelo pertenece a la familia Sophon-Realtime v1, en la que tres builds (Tag, Flash y E2E) comparten el mismo "cerebro" de 32B que escucha, decide los turnos y escribe la respuesta. Flash se diferencia del build Tag unicamente en la etapa de voz: usa un modelo de habla mas ligero y autorregresivo con una sola pasada forward por paso, lo que reduce el tiempo hasta el primer audio a 0,31 s y eleva la concurrencia hasta unos 40 usuarios por GPU de 80 GB, a costa de una expresividad algo menor (NVV-SuperBench de 0,63 en ingles y 0,77 en chino frente a 0,80/0,86 del build Tag).

Su relevancia actual radica en que combina un cerebro de 32B con el mejor rendimiento declarado entre modelos full-duplex abiertos en VoiceBench (82,8) y Big Bench Audio (81,8 %), ademas de liderar la comprension paralinguistica (48,6 en LISTEN, StressTest y MSPB). Todo ello bajo licencia Apache-2.0, lo que permite uso comercial y ajuste fino con ms-swift.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Full-duplex speech-to-speech; cerebro LLM de 32B con etapa de voz autorregresiva (una pasada forward por paso) servido en vLLM-Omni |
| Parametros totales | 32B (cerebro); parametros de la etapa de voz no disponibles |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (build principal); BF16 disponible en el build Sophon-Realtime-32B-Flash-BF16 |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria vLLM) |

## Arquitectura y entrenamiento

Sophon-Realtime-32B-Flash es un sistema full-duplex compuesto: un cerebro LLM de 32B que escucha la entrada de voz, decide los turnos de palabra y redacta la respuesta con posibles etiquetas de sonido, y una etapa de voz que convierte esa respuesta etiquetada en audio. La etapa de voz de Flash es autorregresiva y realiza una unica pasada forward por paso, lo que explica su menor latencia y mayor concurrencia frente al build Tag. El sistema completo se sirve como un unico modelo en vLLM-Omni, con emision de un fotograma de audio cada 80 ms.

El modelo comparte el mismo "cerebro" que los builds Tag y E2E de la familia v1, por lo que la comprension, la gestion de turnos y la escritura de etiquetas son identicas entre Tag y Flash; solo cambia la sintesis de voz. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Se indica que el ajuste fino de persona, tono y conocimiento de dominio puede realizarse con ms-swift. No se han publicado en la informacion disponible detalles sobre innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Conversacion de voz a voz full-duplex: escucha de forma continua mientras el usuario habla, redacta la respuesta sobre la marcha y empieza a hablar sin esperar a que el usuario termine.
- Gestion natural de turnos: detecta cuando el usuario termina, se detiene si le interrumpen y continua si el usuario emite continuadores como "mm-hm".
- Etiquetas paralinguisticas: escribe etiquetas como `[laughter]`, `[cough]`, `[sigh]`, `[breath]`, `<laughter>…</laughter>` y `<strong>…</strong>` que la etapa de voz interpreta (nunca se leen en voz alta).
- Comprension paralinguistica: detecta emocion, enfasis, sarcasmo, risas y suspiros directamente desde la voz del usuario.
- Tool calling en modo full-duplex: Full-Duplex-Bench v3 con Pass@1 del 48 % y tasa de respuesta del 100 %; el modo Live es compatible con la interfaz OpenAI GPT-Live.
- Soporte multilingue limitado a chino e ingles.
- Compatibilidad de API con OpenAI Realtime a traves de la API alojada de adventists.ai.
- Ajuste fino de persona, tono y conocimiento de dominio mediante ms-swift.

## Casos de uso

- Atencion al cliente automatizada: el modelo mantiene conversaciones de voz multi-turno con interrupciones naturales y puede atender hasta unos 40 usuarios concurrentes por GPU de 80 GB, lo que lo hace adecuado para centralitas con alto volumen.
- Asistentes en vehiculo: la latencia de 0,31 s hasta el primer audio y la capacidad de ser interrumpido permiten dialogos manos libres en entornos ruidosos, con comprension del tono del conductor para adaptar la respuesta.
- Agentes telefonicos con tool calling: el soporte de Full-Duplex-Bench v3 y la compatibilidad con la interfaz OpenAI GPT-Live permiten integrar el modelo en flujos que consultan APIs externas (reservas, pedidos, soporte tecnico) mientras se habla.
- Triaje y deteccion de emocion en linea: la comprension paralinguistica (emocion, enfasis, sarcasmo) permite derivar llamadas a un humano cuando se detecta frustracion o urgencia.
- Pruebas de concepto y demos interactivas: el Space de Hugging Face permite probar el modelo en el navegador sin GPU ni registro, util para evaluar la experiencia antes de desplegar.
- Investigacion en interaccion conversacional: la licencia Apache-2.0 y la disponibilidad de los builds Tag, Flash y E2E con la misma API facilitan experimentos comparativos sobre expresividad frente a latencia y concurrencia.
- Formacion y simulacion de entrevistas: el ajuste fino con ms-swift permite adaptar la persona y el dominio para entrenar habilidades conversacionales con retroalimentacion de voz en tiempo real.

## Benchmarks y rendimiento

Rendimiento declarado en la model card (una H100 de 80 GB, pensador en FP8, `/v1/chat/completions`, voz del usuario hasta el primer fragmento de audio):

| Carga | Primer audio mediana / P90 | Stall (mediana) |
|---|---|---|
| 1 stream | 0,31 / 0,34 s | 0 |
| 20 streams (llegando en 10 s) | 0,45 / 0,52 s | 0,09 s |
| 40 streams (en 10 s) | 0,58 / 0,67 s | 0,37 s |
| 64 streams (en 8 s) | 0,84 / 1,03 s | 1,9 s (cola) |

Comparativa de benchmarks entre builds de la familia y modelos externos:

| Benchmark | Flash | Tag | E2E | Referencia externa |
|---|---|---|---|---|
| NVV-SuperBench (en / zh) | 0,63 / 0,77 | 0,80 / 0,86 | 0,75 / 0,85 | no disponible |
| VoiceBench | 82,8 (cerebro compartido) | 82,8 | 82,8 | GPT-4o-mini-Audio: nivel similar |
| Big Bench Audio | 81,8 % (cerebro compartido) | 81,8 % | 81,8 % | no disponible |
| Paralinguistica (LISTEN, StressTest, MSPB) | 48,6 (cerebro compartido) | 48,6 | 48,6 | Gemini 3.8 Flash: 46,9; Qwen3-Omni: 44,6 |
| Full-Duplex-Bench v3 tool calling (Pass@1) | 48 % | 48 % | 48 % | Grok: 43 % |

Exactitud de etiquetas de sonido (conjunto held-out, voz Chelsie, juzgado por DuplexJev):

| Etiqueta | zh | en |
|---|---|---|
| `[laughter]` | 83 % | 77 % |
| `<laughter>…</laughter>` (reir mientras habla) | 78 % | 71 % |
| `[cough]` | 90 % | 50 % (8 items) |
| `[sigh]` (AST) | 90 % | 100 % |
| Tasa media de error de caracteres / palabras | 0,9 % | 1,0 % |

## Requisitos de hardware

- VRAM estimada: unos 55 GB por instancia con el pensador en FP8; el build BF16 sin cuantizar ocupa aproximadamente 64 GB y suele requerir dos dispositivos.
- GPU recomendada: una H100 de 80 GB soporta hasta unos 40 streams concurrentes; para mas carga, ejecutar una instancia por GPU detras de un balanceador.
- Cabe en GPU de consumo: no para el build de 32B; el build Sophon-Realtime-4B-Flash esta pensado para una unica GPU de 24 GB.
- Opciones de despliegue: vLLM-Omni (libreria oficial del modelo); la API alojada de adventists.ai es compatible con OpenAI Realtime.
- Latencia y throughput: 0,31 s hasta el primer audio con un solo stream; 0,58 s de mediana con 40 streams; el primer arranque compila kernels (unos 10 minutos) y los posteriores tardan 5-8 minutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sophon-Realtime-32B-Flash | 32B (cerebro) | no disponible | NVV-SuperBench 0,63/0,77; 0,31 s al primer audio; 40 usuarios/GPU | Apache-2.0 | Hugging Face, Space, API alojada |
| Sophon-Realtime-32B-Tag | 32B (cerebro) | no disponible | NVV-SuperBench 0,80/0,86; ~0,6 s al primer audio; 16 usuarios/GPU | Apache-2.0 | Hugging Face |
| Sophon-Realtime-32B-E2E | 32B (cerebro) + talker ~350M | no disponible | NVV-SuperBench 0,75/0,85; ~0,25 s al primer audio; 16 usuarios/GPU | Apache-2.0 | Hugging Face |
| Qwen3-Omni | no disponible | no disponible | Paralinguistica 44,6 | no disponible | no disponible |
| GPT-4o-mini-Audio | no disponible | no disponible | VoiceBench a la par de Sophon | propietaria | API |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card; al entrenarse en chino e ingles, es previsible un sesgo cultural y linguistico hacia esos idiomas.
- Riesgo de alucinacion: no se cuantifica; como LLM de 32B, puede generar respuestas incorrectas, especialmente en dominios especializados.
- Limitaciones de idioma: solo chino e ingles; no hay soporte declarado para castellano ni otros idiomas.
- Contexto: la longitud de contexto no se especifica, lo que dificulta planificar conversaciones muy largas o documentos extensos.
- Expresividad: el build Flash tiene menor calidad expresiva que Tag (NVV-SuperBench 0,63/0,77 frente a 0,80/0,86); si la naturalidad de la voz es critica, conviene evaluar Tag.
- Etiquetas de sonido en ingles: la exactitud de `[cough]` en ingles es solo del 50 % sobre 8 items, un tamano de muestra muy reducido.
- Escalado: por encima de unos 40 streams por GPU de 80 GB aparecen colas (stall de 1,9 s con 64 streams); requiere balanceo entre instancias.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar los terminos de la API alojada y de los modelos de voz subyacentes si se redistribuyen.
- Arranque: la compilacion de kernels en el primer arranque (unos 10 minutos) complica los despliegues con escalado elastico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash
- Build BF16: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash-BF16
- Build Tag: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Tag
- Build E2E: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-E2E
- Build 4B: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Flash
- Pagina de la familia v1: https://huggingface.co/adventists-ai/Sophon-Realtime-v1
- Coleccion de builds: https://huggingface.co/collections/adventists-ai/sophon-realtime-6afb357253a3a8905ad758b0
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/adventists-ai/Sophon-Realtime
- Repositorio GitHub: https://github.com/adventists-ai/sophon-realtime
- Changelog: https://github.com/adventists-ai/sophon-realtime/blob/main/CHANGELOG.md
- Demo en ModelScope Studio: https://www.modelscope.ai/studios/AdventistsAI/Sophon-Realtime
- API alojada (consola): https://api.adventists.ai/console/
- Documentacion de la API: https://api.adventists.ai/console/docs

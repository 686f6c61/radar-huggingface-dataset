# nightmedia/Qwen3.8-27B-MindMeld-OneJev1.6

## Resumen

Qwen3.8-27B-MindMeld-OneJev1.6 es un modelo de lenguaje de 27.781 millones de parametros resultado de un merge experimental de pesos (mediante mergekit) que combina nightmedia/Qwen3.8-27B-MindMeld con OmniJev/OneJev1.6-27B, ambos derivados de la familia Qwen 3.5/3.6/3.8. Lo publica el usuario nightmedia en Hugging Face bajo licencia Apache 2.0 y esta disenado explicitamente para generacion creativa, escritura de ficcion, roleplay y debate, no para programacion. El propio autor advierte que el modelo "fallara miserablemente" en tareas de dibujo estructurado (el ejemplo del pelicano en bicicleta) y lo presenta como un experimento de fusion de modelos con "sentido del humor".

La relevancia de esta ficha es doble: por un lado, documenta un caso tipico de la escena de merges comunitarios de Qwen, donde se combinan decenas de finetunes (Heretic, Fable, Polaris, Cold-Fusion, Tess, entre otros) para obtener perfiles creativos o de roleplay; por otro, incluye metricas de cuantizacion poco habituales (perplejidad, memoria pico y tokens por segundo para mxfp8, q8-hi, q6-hi, q5-hi, q4-hi, mxfp4 y oQ2e-mtp) que permiten evaluar el coste real de despliegue. El modelo declara soporte de contexto de hasta 1M tokens (con 256k como referencia practica) segun los tags del repositorio, aunque no se detalla la configuracion exacta de RoPE en la model card.

El pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales heredadas de los modelos base, si bien la model card no documenta tareas de vision con detalle. El repositorio ocupa 55,6 GB en safetensors (bf16) y acumula 285 descargas y 3 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5/3.6/3.8); merge de pesos con mergekit |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | hasta 1M tokens segun tags; 256k como referencia practica declarada; configuracion RoPE no detallada |
| Tipos de cuantizacion | bf16, mxfp8, q8-hi, q6-hi, q5-hi, q4-hi, mxfp4, oQ4e-mtp, oQ2e-mtp, qx86-hi, qx64-hi (metricas publicadas para varias de ellas) |
| Idiomas soportados | en, zh, ja, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16); se anuncia disponibilidad futura de GGUF por DavidAU |

## Arquitectura y entrenamiento

El modelo es un merge de pesos, no un entrenamiento desde cero: segun la model card, combina nightmedia/Qwen3.8-27B-MindMeld y OmniJev/OneJev1.6-27B mediante mergekit, y en la lista de modelos participantes figuran al menos 18 finetunes y merges de la familia Qwen 3.5/3.6/3.8, entre ellos nbeerbower/Wichtel-Qwen3.6-27B, schneewolflabs/B1-27B, trohrbaugh/Qwen3.8-27B-heretic-ara, DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1, migtissera/Tess-4-27B, nbeerbower/CHUD-Qwen3.6-27B, nbeerbower/Elster-Qwen3.6-27B, MooreThreads/MusaCoder-27B, DavidAU/Qwen3.5-27B-Claude-4.6-OS-INSTRUCT y armand0e/Qwen3.6-27B-Fable-5-Experimental, entre otros. Los tags incluyen sft, lora, distillation y claude-distillation, lo que indica que parte del linaje incorpora datos de destilacion y ajuste supervisado, aunque no se especifica el volumen de tokens ni la composicion del dataset en la informacion disponible.

La model card no detalla la arquitectura interna (numero de capas, dimension oculta, cabezas de atencion, tipo de atencion) ni innovaciones como decodificacion especulativa o atencion lineal; solo se infiere la familia Qwen por los tags qwen3_5, qwen3_6 y Qwen3.6. El pipeline image-text-to-text sugiere un componente visual heredado, pero no se documenta su configuracion. Las metricas "brainwaves" publicadas (arc, arc/e, boolq, hswag, obkqa, piqa, wino) corresponden a evaluaciones del merge y de sus componentes, no a un proceso de entrenamiento descrito.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, chino, japones y espanol.
- Escritura creativa y de ficcion: generacion de tramas, subtramas, escenas, continuacion de escenas, narrativa de genero (incluida ciencia ficcion) y "prosa vivida" segun los tags del autor.
- Roleplay y debate: el autor lo presenta como un modelo con "confianza tipo Borg" para discutir cualquier tema.
- Razonamiento con cadena de pensamiento larga (long-cot, thinking mode), evidenciado por las evaluaciones oMLX que ejecutan con "Think: Yes".
- Matematicas y STEM: los resultados de GSM8K (97,3%), MATHQA (91,1%) y ARC_CHALLENGE (97,9%) en la variante oQ6e-mtp indican capacidad matematica y de razonamiento notables.
- Codigo: a pesar de la advertencia del autor de que "no es para programar", las metricas reportadas de HUMANEVAL (93,3%), MBPP (93,0%) y LIVECODEBENCH (83,0%) son altas; conviene tratar estas cifras con cautela por el caracter experimental del merge.
- Capacidades multimodales (image-text-to-text) declaradas por el pipeline, sin documentacion adicional.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modo thinking sugiere cierta capacidad de razonamiento extendido.

## Casos de uso

- Escritura de ficcion y narrativa larga: el modelo esta disenado para generar tramas, subtramas y continuaciones de escena; su contexto declarado de hasta 1M tokens (256k practicos) permite mantener coherencia en novelas o sagas con muchos personajes y arcos argumentales.
- Roleplay y compania conversacional: los tags de roleplaying y conversational, junto con el tono de la model card, lo orientan a personajes persistentes en chats multi-turno; el contexto largo ayuda a recordar la ficha del personaje y el historial.
- Debate y exploracion de ideas: el autor lo describe como capaz de debatir cualquier tema con confianza; util para lluvia de ideas, generacion de contraargumentos o simulacion de discusiones socraticas.
- Asistencia creativa en videojuegos y narrativa interactiva: generacion de dialogos de PNJ, descripciones de escenas y ramificaciones de guion, aprovechando el soporte multilingue (en, zh, ja, es).
- Analisis y resumen de documentos largos en espanol, chino o japones: la ventana de contexto extendida permite procesar informes o transcriptos extensos, aunque la calidad en estos idiomas no esta validada por benchmarks publicados.
- Prototipado de asistentes multilingues: con licencia Apache 2.0 y pesos safetensors, se puede desplegar en entornos de investigacion para comparar merges comunitarios frente a modelos base.
- Evaluacion de estrategias de cuantizacion: las metricas publicadas de perplejidad, memoria pico y tokens/s por cuantizacion lo convierten en un caso practico para estudiar el compromiso precision/rendimiento en GPUs de consumo.

## Benchmarks y rendimiento

Resultados oMLX publicados en la model card para la variante Qwen3.8-27B-MindMeld-OneJev1.6-oQ6e-mtp (con modo thinking activado):

| Benchmark | Precision | Correctas / total | Tiempo (s) | Notas |
|---|---|---|---|---|
| ARC_CHALLENGE | 97,9% | 1147 / 1172 | 4371,8 | Thinking activado |
| TRUTHFULQA | 90,7% | 741 / 817 | 3250,6 | 90,9% sobre respuestas finalizadas (n=815) |
| GSM8K | 97,3% | 1283 / 1319 | 10191,2 | 97,4% sobre respuestas finalizadas (n=1317) |
| MATHQA | 91,1% | 2719 / 2985 | 28946,1 | 93,0% sobre respuestas finalizadas (n=2902) |
| HUMANEVAL | 93,3% | 153 / 164 | 1934,4 | 93,8% sobre respuestas finalizadas (n=162) |
| MBPP | 93,0% | 465 / 500 | 8777,4 | 96,7% sobre respuestas finalizadas (n=481) |
| LIVECODEBENCH | 83,0% | 875 / 1054 | 91215,7 | 94,5% sobre respuestas finalizadas (n=917) |

Metricas de cuantizacion (perplejidad, memoria pico y throughput):

| Cuantizacion | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|
| mxfp8 | 3,791 ± 0,023 | 34,74 GB | 211 |
| q8-hi | 3,779 ± 0,023 | 37,26 GB | 204 |
| q6-hi | 4,018 ± 0,025 | 30,54 GB | 199 |
| q5-hi | 3,774 ± 0,023 | 27,18 GB | 200 |
| q4-hi | 3,813 ± 0,023 | 23,82 GB | 207 |
| oQ4e-mtp | 3,712 ± 0,023 | 23,18 GB | 208 |
| mxfp4 | 3,857 ± 0,024 | 21,30 GB | 211 |
| oQ2e-mtp | 3,899 ± 0,024 | 17,50 GB | 216 |

Evaluaciones "brainwaves" del merge completo (arc, arc/e, boolq, hswag, obkqa, piqa, wino) por cuantizacion, con bf16 como referencia: 0,747 / 0,901 / 0,915 en las tres primeras columnas; mxfp4 baja a 0,831 en hswag y 0,524 en obkqa; oQ2e-mtp cae a 0,727 en arc. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre 17,5 GB (oQ2e-mtp) y 37,3 GB (q8-hi) segun las metricas publicadas; en bf16 el repositorio pesa 55,6 GB, por lo que requiere al menos 64 GB de VRAM o descarga por capas.
- GPU recomendadas: A100 80 GB o H100 para bf16 y contextos largos; RTX 4090 (24 GB) puede ejecutar q4-hi, oQ4e-mtp, mxfp4 y oQ2e-mtp con memoria pico de 17-24 GB, aunque el contexto util se vera limitado por la cache KV.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones de 4 bits o inferiores; en GPUs de 16 GB solo oQ2e-mtp con margen ajustado.
- Opciones de despliegue: transformers (libreria declarada); el autor menciona variantes MLX (tag mlx) y anuncia GGUF futuros de DavidAU; vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: 199-216 tokens/s en las pruebas oMLX publicadas, con variacion minima entre cuantizaciones; los tiempos de benchmark completos (por ejemplo, 91.215 s para LiveCodeBench) reflejan el coste del modo thinking en tareas largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-MindMeld-OneJev1.6 | ~27,8B | hasta 1M (256k practico) | Apache 2.0 | Merge experimental orientado a creatividad y roleplay |
| nightmedia/Qwen3.8-27B-MindMeld | no disponible | no disponible | Apache 2.0 (heredada) | Componente principal del merge; metricas brainwaves ligeramente inferiores en obkqa |
| OmniJev/OneJev1.6-27B | no disponible | no disponible | no disponible | Componente base del merge |
| DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 | ~27B (familia Qwen) | no disponible | no disponible | Participante en el merge; orientado a escritura |

No se dispone de comparaciones de rendimiento frente a modelos no pertenecientes a la familia en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo "no es para codigo" pese a las metricas altas de HumanEval y MBPP; las cifras deben interpretarse con cautela por el caracter experimental del merge.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad mas alla de TruthfulQA (90,7%), insuficientes para garantizar precision en produccion.
- El modelo se presenta con "confianza tipo Borg", lo que puede traducirse en respuestas asertivas aunque incorrectas.
- Contexto: aunque los tags declaran 1M tokens, no se documenta la configuracion de RoPE ni la degradacion de calidad a contextos muy largos; 256k se cita como referencia practica.
- Idiomas: solo en, zh, ja y es estan declarados; no hay benchmarks por idioma que validen la calidad en espanol, japones o chino.
- Licencia Apache 2.0 permite uso comercial, pero los modelos base y participantes pueden tener terminos adicionales no verificados en esta ficha.
- Modelo experimental sin garantias de estabilidad; los merges comunitarios pueden presentar comportamientos degenerados en tareas fuera de su dominio creativo.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados.
- El repositorio incluye tags de contenido sin censura (heretic, uncensored) en los modelos participantes; revisar politicas de contenido antes de desplegar en entornos con moderacion.

## Enlaces

- Hugging Face: https://huggingface.co/nightmedia/Qwen3.8-27B-MindMeld-OneJev1.6
- Modelo componente: https://huggingface.co/nightmedia/Qwen3.8-27B-MindMeld
- Modelo componente: https://huggingface.co/OmniJev/OneJev1.6-27B
- GGUF anunciado: https://huggingface.co/DavidAU/Qwen3.8-27B-Jumbo-Fusion-IQ-747-900-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/schneewolflabs/B1-27B
- Modelo base: https://huggingface.co/nightmedia/Qwen3.6-27B-Seven
- Modelo base: https://huggingface.co/nightmedia/Qwen3.8-27B-Brainwaves
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada.

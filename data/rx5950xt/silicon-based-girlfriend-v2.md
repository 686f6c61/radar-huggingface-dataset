# RX5950XT/silicon-based-girlfriend-v2

## Resumen

Silicon-based girlfriend v2 (矽基女友 v2) es un adaptador LoRA en tres etapas para roleplay en chino tradicional (Taiwán), desarrollado por el usuario RX5950XT sobre el modelo base huihui-ai/Huihui-Qwen3.5-9B-abliterated, que a su vez deriva de Qwen/Qwen3.5-9B. El repositorio no contiene un modelo completo, sino tres adaptadores PEFT (sft, grpo-v1 y grpo-v2) que se aplican de forma secuencial y acumulativa: cada etapa se entrena sobre las ponderaciones ya fusionadas de la anterior, no como tres adaptadores paralelos sobre la misma base. El objetivo declarado es servir de material de investigación sobre trayectorias de entrenamiento (SFT seguido de dos rondas de GRPO) y como base para continuar el ajuste, mientras que el uso directo se redirige a un repositorio GGUF cuantizado.

La relevancia del artefacto es metodológica más que de rendimiento bruto: la model card documenta con detalle cómo un SFT de 576 pasos (LoRA r16, alpha 16, lr 1e-4, 1 época, max_seq_len 16384) mejoró el formato y el registro del roleplay pero provocó un colapso de coherencia multiturno (de 4.50 a 0.42 en la métrica del autor) y una degradación en matemáticas, y cómo dos rondas de GRPO de 117 pasos cada una (LoRA r16, alpha 32, lr 2e-5, KL 0.04) recuperaron el terreno perdido a un coste aproximado de 26 dólares. El autor identifica la causa raíz en el corpus: un 9.9 % de los diálogos de entrenamiento contenían repetición entre turnos, algo que, según afirma, un filtro de veinte líneas en la fase de datos habría evitado.

Se trata de un adaptador pequeño (83 MB por etapa, 496 tensores y 248 módulos en bf16) que solo modifica la torre de lenguaje y mantiene congelada la torre de visión del modelo base multimodal. La licencia es Apache-2.0, heredada del modelo base, y el autor lo etiqueta explícitamente como modelo de roleplay para adultos, entrenado con datos sintéticos y destinado únicamente a investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de lenguaje + torre de vision) con adaptadores LoRA sobre la torre de lenguaje; el modelo base es Qwen3.5-9B |
| Parametros totales | Modelo base: 9B (no confirmado con precision en la informacion disponible). Adaptador: 496 tensores / 248 modulos, 83 MB por etapa en bf16 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible. El entrenamiento SFT uso max_seq_len de 16384 tokens con ventana deslizante en los limites de turno |
| Tipos de cuantizacion | No detallados en la informacion disponible. Existe un repositorio GGUF aparte (RX5950XT/silicon-based-girlfriend-v2-GGUF) para uso directo |
| Idiomas soportados | Chino tradicional (variante de Taiwan) segun la model card; el modelo base Qwen3.5 es multilingue, pero la adaptacion solo declara zh |
| Licencia | Apache-2.0 (heredada del modelo base y de Qwen/Qwen3.5-9B) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA en bf16); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de 9B de parametros con dos torres (lenguaje y vision); este repositorio solo entrena la torre de lenguaje mediante LoRA, dejando la torre de vision congelada. La adaptacion se compone de tres etapas que deben fusionarse en orden estricto: primero sft, luego grpo-v1 y por ultimo grpo-v2, aplicando `merge_and_unload()` despues de cada una, ya que cada etapa se entrena sobre las ponderaciones fusionadas de la anterior y no sobre la base original. La etapa SFT uso LoRA con rango 16 y alpha 16, learning rate 1e-4, una epoca y 576 pasos, con max_seq_len de 16384 y corte de ventana en los limites de turno. Las dos etapas GRPO usaron rango 16 y alpha 32, learning rate 2e-5, KL 0.04 y 117 pasos cada una; la segunda introdujo preguntas multiturno con contexto previo y una penalizacion por copiarse a si mismo entre turnos.

El corpus es sintetico y esta publicado como RX5950XT/silicon-based-girlfriend-v2-dataset. La model card reporta que el 9.9 % de los dialogos contenian relectura entre turnos, lo que segun el autor provoco el colapso de coherencia multiturno del SFT. El entrenamiento GRPO registro una proporcion de pasos con gradiente cero del 13-15 % (grupos de 8 respuestas con recompensa identica), un coste inherente del metodo. Como innovacion practica, el repositorio documenta una trampa de fusion: `transformers` no carga los 15 tensores `mtp.*` del modelo base y `save_pretrained` los omite en silencio, de modo que el fallo solo aparece al cargar las ponderaciones en el motor de inferencia; el autor recomienda comparar la lista de tensores tras guardar. Cada etapa incluye un directorio `training-evidence/` con `trainer_state.json`, `run.log.gz`, `hardware_env.txt`, `requirements-lock.txt` y, en las dos etapas GRPO, el script `remote_grpo.sh`.

## Capacidades

- Roleplay conversacional en chino tradicional (Taiwan) con mantenimiento de personaje y registro narrativo, afinado especificamente para este dominio.
- Generacion multiturno con contexto largo: el SFT se entreno con ventanas de hasta 16384 tokens y la etapa grpo-v2 se diseno explicitamente para conversaciones con preambulo previo.
- Razonamiento matematico: la model card reporta una subida de GSM8K del 57 % al 82 % tras la primera ronda de GRPO, partiendo de un estado degradado por el SFT.
- Mitigacion de repeticion: la relectura en textos largos paso del 18.8 % al 0 % tras grpo-v1, y la autocopia entre turnos paso de 1-7 ocurrencias a 0 tras grpo-v2.
- Capacidades multimodales heredadas del modelo base (torre de vision), pero no se han ajustado ni evaluado en este repositorio; la adaptacion solo toca la torre de lenguaje.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara chino tradicional; no hay evidencia de transferencia a otros idiomas.
- Modo de pensamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre trayectorias SFT + GRPO: el repositorio publica curvas, log completo, `trainer_state.json`, entorno de hardware y versiones bloqueadas de paquetes en cada etapa, lo que permite reproducir o auditar el efecto de dos rondas de GRPO (117 pasos cada una) sobre un SFT que degrado capacidades.
- Roleplay conversacional en chino tradicional para investigacion: el adaptador esta entrenado especificamente para mantener personaje y registro en conversaciones multiturno, con una metrica de coherencia multiturno de 4.44 tras la etapa final.
- Estudio de mitigacion de repeticion en generaciones largas: el par de metricas (18.8 % → 0 % en relectura larga, 1-7 → 0 en autocopia entre turnos) lo convierte en un caso de referencia para disenar recompensas de penalizacion por repeticion.
- Filtrado y calidad de datos sinteticos: el hallazgo de que un 9.9 % de dialogos con relectura provoca un colapso de coherencia (4.50 → 0.42) sirve como caso practico para justificar filtros de deduplicacion entre turnos antes del entrenamiento.
- Investigacion sobre fusion secuencial de adaptadores: el repositorio documenta el orden obligatorio de fusion y el fallo silencioso con los 15 tensores `mtp.*`, un escenario util para validar pipelines de merge y verificacion de nombres de tensor.
- Red teaming y seguridad de modelos "abliterated": la combinacion de un modelo base sin rechazos con un adaptador de tematica adulta en un idioma minoritario es un caso de estudio para evaluacion de seguridad y politicas de contenido.
- Base para ajuste posterior: los adaptadores son pequenos (83 MB por etapa) y se pueden continuar entrenando, lo que abarata experimentos de DPO, RLHF o nuevos ciclos de GRPO sobre el mismo dominio.
- Prototipos de asistente conversacional en chino tradicional: desplegable sobre el GGUF publicado, siempre que el caso de uso acepte el dominio y los sesgos del corpus sintetico de roleplay.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible. Los unicos datos numericos proceden de las metricas internas del autor, recogidas en la model card y en los archivos de `training-evidence/`.

| Metrica | Modelo base | Tras sft | Tras grpo-v1 | Tras grpo-v2 (final) |
|---|---|---|---|---|
| Coherencia multiturno (metrica del autor) | 4.50 | 0.42 | no disponible | 4.44 |
| GSM8K | no disponible | 57 % | 82 % | no disponible |
| Repeticion en textos largos | no disponible | no disponible | 18.8 % → 0 % | no disponible |
| Autocopia entre turnos (ocurrencias) | no disponible | no disponible | no disponible | 1-7 → 0 |
| Recompensa de autocopia (`self_copy_reward`) | no aplica | no aplica | -0.929 → -0.575 | -0.929 → -0.575 |
| Divergencia KL | no aplica | no aplica | 0.000 → 0.012 | 0.012-0.016 |
| Longitud media de respuesta (tokens) | no disponible | no disponible | no disponible | 662 → 418 |
| Puntuacion del juez por cuartiles (v2) | no disponible | no disponible | no disponible | 4.61 / 4.16 / 4.50 / 4.32 |
| Pasos con gradiente cero | no aplica | no aplica | no disponible | 13-15 % |

El autor advierte explicitamente de que la curva de recompensa de GRPO no debe interpretarse como curva de aprendizaje, porque cada pregunta aparece una sola vez por epoca y las fluctuaciones mezclan dificultad del item y mejora del modelo.

## Requisitos de hardware

- VRAM estimada para el modelo base (9B): aproximadamente 18 GB en bf16, en torno a 9-10 GB en cuantizacion de 8 bits y 5.5-6 GB en 4 bits. Son estimaciones derivadas del tamano de parametros, no datos publicados por el autor.
- GPU recomendadas para bf16 completo: A100 40 GB, H100, L40S o RTX 4090 24 GB (esta ultima al limite).
- GPU de consumo: cabe en RTX 4090 / 3090 (24 GB) en bf16 con cuidado, y en RTX 4080 / 4070 Ti Super (16 GB) o RTX 4060 Ti (16 GB) usando cuantizacion de 4 bits. La via GGUF permite ir a VRAM menor.
- Repositorio de adaptadores: 83 MB por etapa, 0.3 GB el repositorio completo, por lo que el almacenamiento no es un cuello de botella.
- Opciones de despliegue: transformers + PEFT para la ruta de fusion secuencial (`AutoModelForMultimodalLM` para cargar el base en bf16 con `dtype="bfloat16"` y `device_map="auto"`); llama.cpp u Ollama si se usa el repositorio GGUF; vLLM o TGI si se sirve el modelo fusionado. Las etapas GRPO se entrenaron con un script (`remote_grpo.sh`) pensado para maquinas con GPU alquiladas.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El unico dato relacionado es la reduccion de longitud media de respuesta de 662 a 418 tokens tras grpo-v2, que reduce el coste por generacion.
- Requisito de entrenamiento: los adaptadores se entrenaron con LoRA en bf16 sobre el modelo base completo; el coste declarado de las dos rondas de GRPO fue de aproximadamente 26 dolares.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| silicon-based-girlfriend-v2 (este) | 9B base + LoRA (83 MB/etapa) | no disponible (entrenado a 16384) | Coherencia multiturno 4.44; GSM8K 82 %; 0 % de relectura larga | Apache-2.0 | Adaptadores PEFT en HF + GGUF aparte |
| huihui-ai/Huihui-Qwen3.5-9B-abliterated | 9B | no disponible | Coherencia multiturno 4.50; GSM8K 57 % segun la model card; relectura larga 18.8 % | Apache-2.0 | Pesos completos en HF |
| Qwen/Qwen3.5-9B | 9B | no disponible | No disponible | Apache-2.0 (segun la model card) | Pesos completos en HF |

No se dispone de comparativas publicadas con otros adaptadores de roleplay en chino tradicional dentro de la informacion proporcionada. La comparacion con el modelo base es la mas informativa porque el propio autor la usa como referencia: el adaptador mejora matematicas y elimina repeticiones, pero no supera al base en la metrica de coherencia multiturno (4.44 frente a 4.50).

## Limitaciones y advertencias

- Modelo de roleplay para adultos entrenado con datos sinteticos; el autor lo restringe explicitamente a uso de investigacion.
- El modelo base es una variante "abliterated", es decir, con los mecanismos de rechazo eliminados o atenuados, lo que incrementa el riesgo de generar contenido inapropiado o danino.
- Riesgo de alucinacion no cuantificado; no hay evaluaciones de veracidad publicadas.
- El SFT inicial degrado la coherencia multiturno de 4.50 a 0.42 y provoco regresion en matematicas; aunque las dos rondas de GRPO recuperaron 4.44 y subieron GSM8K al 82 %, el resultado final no supera al modelo base en coherencia multiturno.
- Cobertura idiomatica limitada al chino tradicional (Taiwan); no hay evidencia de calidad en otros idiomas pese a que el modelo base sea multilingue.
- Longitud de contexto real no declarada; el SFT se hizo con ventanas de 16384 tokens, lo que no garantiza que el modelo mantenga rendimiento a esa distancia.
- Corpus sintetico con un 9.9 % de dialogos con relectura entre turnos, sesgo documentado por el propio autor como causa raiz de la degradacion.
- Trampa tecnica en la fusion: `transformers` no carga los 15 tensores `mtp.*` y `save_pretrained` los omite sin avisar, lo que puede producir errores solo visibles al cargar en el motor de inferencia. Hay que verificar la lista de tensores tras guardar.
- Orden de fusion obligatorio (sft, grpo-v1, grpo-v2); aplicar los adaptadores en otro orden o en paralelo da resultados incorrectos.
- Entrenamiento GRPO con un 13-15 % de pasos de gradiente cero, es decir, una fraccion del computo no aporta senal de aprendizaje.
- Licencia Apache-2.0: permite uso comercial segun los terminos de dicha licencia, pero el autor declara finalidad de investigacion; conviene revisar tambien las condiciones del modelo base y del corpus sintetico.
- Repositorio con cero descargas y cero "likes" en el momento de la consulta: no hay validacion externa por parte de la comunidad.
- Fechas de creacion y actualizacion del repositorio: 17 de septiembre de 2026, con una ventana de actualizacion de unos ocho minutos entre ambas.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/RX5950XT/silicon-based-girlfriend-v2
- Repositorio GGUF para uso directo: https://huggingface.co/RX5950XT/silicon-based-girlfriend-v2-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/RX5950XT/silicon-based-girlfriend-v2-dataset
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Modelo upstream del base: https://huggingface.co/Qwen/Qwen3.5-9B

No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web; los resultados devueltos corresponden a foros de impresoras y no guardan relacion con el modelo.

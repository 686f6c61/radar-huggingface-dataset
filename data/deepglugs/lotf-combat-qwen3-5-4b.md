# deepglugs/lotf-combat-qwen3.5-4b

## Resumen

lotf-combat-qwen3.5-4b es un ajuste fino (LoRA fusionado) de Qwen/Qwen3.5-4B desarrollado por el usuario deepglugs para un proposito muy concreto: actuar como IA de combate en los enfrentamientos por turnos sobre rejilla del videojuego de novela visual para adultos *Legacy of the Fallen*. El modelo recibe el prompt de decision que genera el juego para un turno y responde con un unico objeto JSON que contiene la accion, el objetivo y una explicacion en texto libre.

No es un asistente general ni un modelo de proposito amplio: es un modelo especializado de 4.539.265.536 parametros (aproximadamente 4,54 mil millones) entrenado sobre 9.399 turnos de combate reales registrados del juego, con 487 turnos reservados para validacion. La arquitectura de base es la de Qwen3.5-4B (transformer denso, multimodal image-text-to-text segun los tags del repositorio), y los pesos se distribuyen en formato safetensors en bf16.

Su relevancia es acotada pero ilustrativa: demuestra el patron de destilar el comportamiento de un modelo profesor de mayor tamano (o de jugadores humanos) en un modelo pequeno que responde en aproximadamente 0,4 segundos por turno en una RTX PRO 6000 Blackwell bajo vLLM. Es util como referencia de ajuste fino orientado a tareas estructuradas con salida JSON estricta, y como ejemplo de los compromisos que implica entrenar sobre un unico formato de prompt y un unico dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-4B, multimodal image-text-to-text segun tags) |
| Parametros totales | 4.539.265.536 (~4,54 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); NVFP4 (W4A4) en repositorio separado |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4,54 mil millones de parametros. El ajuste consiste en un LoRA aplicado sobre las capas de atencion y fusionado posteriormente en los pesos base, de modo que el artefacto publicado es un modelo completo en bf16, no un adaptador separado. El repositorio ocupa 9,1 GB.

El entrenamiento uso 9.399 turnos de combate individuales registrados del juego (con 487 reservados para validacion). Cada ejemplo es el par exacto formado por el prompt que el juego envio y la respuesta elegida por un modelo profesor de mayor tamano o por un jugador humano. Se ejecutaron tres epocas y se publica el checkpoint del paso 1200, seleccionado por tener la menor perdida en el conjunto de validacion (0,568). El entrenamiento se hizo con el modo thinking desactivado y en formato de turno unico: un mensaje de usuario de entrada, una respuesta JSON de salida. No se documenta el numero total de tokens de entrenamiento, la composicion del dataset mas alla de los turnos de juego, ni si hubo etapas de RLHF o DPO.

La innovacion tecnica destacable no esta en la arquitectura sino en el formato de salida: el modelo aprende a emitir un unico objeto JSON con los campos `action`, `target` y `explanation`, lo que lo hace directamente consumible por el motor del juego sin parseo tolerante a fallos. Existe ademas una compilacion NVFP4 (W4A4) publicada en un repositorio aparte para despliegue con cuantizacion de 4 bits en activaciones y pesos.

## Capacidades

- Generacion de decisiones de combate estructuradas: emite un objeto JSON con accion, objetivo y explicacion para un turno de combate sobre rejilla.
- Seleccion de accion entre las disponibles en el prompt del juego (ataque cuerpo a cuerpo, buffs, etc., segun el formato de entrenamiento).
- Seleccion de objetivo por identificador de casilla o enemigo (por ejemplo, `E2`).
- Generacion de una explicacion breve en texto libre que acompana a la decision.
- Capacidad teorica de procesamiento de imagen y texto, heredada del modelo base segun los tags `image-text-to-text`, aunque el ajuste fino se entreno solo con prompts de texto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso; el entrenamiento es explicitamente de turno unico.
- Capacidades multilingues: no disponibles (el ajuste se hizo sobre prompts en el idioma del juego, presumiblemente ingles, sin documentacion al respecto).

## Casos de uso

- IA de oponente en el combate por turnos de *Legacy of the Fallen*: el modelo se integra en el bucle de decision del juego, recibe el prompt de turno y devuelve la accion y el objetivo en JSON. Es su proposito original y el unico para el que hay evidencia de funcionamiento.
- Prototipado de IA de combate para otros juegos con rejilla: sirve como punto de partida para ajustar un modelo de 4B a un formato de prompt propio, copiando el esquema de destilacion desde un profesor mayor o desde registros de jugadores humanos.
- Referencia de salida JSON estricta: util para estudiar como un modelo pequeno puede producir estructuras JSON consumibles por un motor de juego sin capa de reparacion, con perdida de validacion de 0,568.
- Pruebas de latencia en inferencia interactiva: con 0,4 s por turno en una RTX PRO 6000 Blackwell bajo vLLM, sirve para validar pipelines de decision en tiempo casi real con modelos de ~4,5B.
- Evaluacion de tecnicas de cuantizacion: la existencia de una compilacion NVFP4 (W4A4) permite comparar calidad de decision y latencia frente a bf16 en el mismo conjunto de turnos.
- Base para experimentos de destilacion de comportamiento: el dataset de 9.399 turnos con respuestas de profesor y de humano es un caso de estudio de imitacion de politica en dominios cerrados.
- Generacion de contenido de combate para herramientas de autoria: un disenador puede usar el modelo para simular respuestas de un oponente y comprobar el balance de encuentros antes de implementar la IA definitiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato cuantitativo de rendimiento es la perdida en el conjunto de validacion retenido (0,568) en el paso 1200, y una latencia medida de aproximadamente 0,4 segundos por turno de juego en una RTX PRO 6000 Blackwell con vLLM 0.33.

## Requisitos de hardware

- VRAM estimada en bf16: los pesos ocupan aproximadamente 9,1 GB, por lo que la inferencia requiere del orden de 10 a 12 GB de VRAM contando cache KV y overhead del runtime.
- VRAM estimada en NVFP4 (W4A4): no disponible con precision; al tratarse de 4 bits, los pesos deberian rondar los 2,3 a 2,5 GB, mas overhead.
- GPU recomendadas: RTX PRO 6000 Blackwell (configuracion medida por el autor), A100, H100 y GPU consumer con 12 GB o mas de VRAM para bf16.
- Cabe en GPU consumer: si, en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) para bf16; en tarjetas de 8 GB probablemente solo con la compilacion NVFP4 o cuantizaciones adicionales no documentadas.
- Opciones de despliegue: vLLM es la via documentada por el autor, con el comando `vllm serve deepglugs/lotf-combat-qwen3.5-4b --served-model-name combat --max-num-seqs 8 --default-chat-template-kwargs '{"enable_thinking": false}'`. No se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 0,4 s por turno en RTX PRO 6000 Blackwell con vLLM 0.33; no se documenta throughput agregado ni latencia en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| lotf-combat-qwen3.5-4b | ~4,54B | No disponible | Combate por turnos, salida JSON | Apache 2.0 | safetensors (bf16) y NVFP4 |
| Qwen/Qwen3.5-4B (base) | ~4,54B | No disponible | Asistente general multimodal | Apache 2.0 | safetensors |
| deepglugs/lotf-combat-qwen3.5-4b-nvfp4 | ~4,54B | No disponible | Misma tarea, cuantizado W4A4 | Apache 2.0 | NVFP4 |

No se dispone de informacion sobre otros modelos especializados en IA de combate por turnos con los que comparar parametros, contexto o rendimiento. La comparacion mas directa es con su modelo base: el ajuste sacrifica generalidad y capacidades conversacionales a cambio de adherencia al formato JSON del juego y latencia baja.

## Limitaciones y advertencias

- Nunca emite el campo `move` de la rejilla: el campo se elimino por error de las respuestas de entrenamiento, por lo que cualquier juego que espere una posicion de movimiento debe aplicar su propia regla de posicionamiento.
- A veces devuelve `target: null` aunque haya enemigos al alcance, lo que desperdicia la accion del turno.
- Aplica la instruccion "rematar primero a los heridos" de forma literal y puede concentrar ataques en criaturas invocadas en lugar de en la party que las invoco.
- Puede repetir un buff de un solo uso por batalla dentro del mismo turno.
- Las explicaciones a veces estan vacias o contienen terminos inventados; solo la accion y el objetivo son fiables.
- Entrenado exclusivamente sobre el formato de prompt y las reglas de un unico juego: no es un asistente general y fallara fuera de ese dominio.
- Los prompts describen contenido para adultos; no es adecuado para entornos sin control de edad.
- No se debe enviar `reasoning_effort`: en vLLM reactiva el modo thinking y la respuesta deja de ser JSON plano.
- El historial de chat largo no esta probado; el entrenamiento es de turno unico con un solo mensaje de usuario.
- No hay datos publicados sobre sesgos demograficos, de idioma ni de alucinacion fuera del dominio de juego.
- La licencia Apache 2.0 permite uso comercial, pero el contenido del dominio (novela visual para adultos) puede estar sujeto a restricciones legales segun la jurisdiccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deepglugs/lotf-combat-qwen3.5-4b
- Compilacion NVFP4: https://huggingface.co/deepglugs/lotf-combat-qwen3.5-4b-nvfp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE

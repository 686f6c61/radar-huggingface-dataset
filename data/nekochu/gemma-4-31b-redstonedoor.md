# Nekochu/Gemma-4-31B-RedstoneDoor

## Resumen

Gemma-4-31B-RedstoneDoor es una adaptación LoRA del modelo `unsloth/gemma-4-31B-it`, publicada por el usuario Nekochu, especializada en una única tarea: emitir la secuencia de comandos `/setblock` necesaria para construir una puerta de pistón 2x2 funcional en Minecraft Java 1.21. El checkpoint parte de un backbone de 31.273.088.876 parámetros (31,27B) y se ha ajustado en dos fases, SFT seguido de GRPO, con TRL y Unsloth sobre entrenamiento en 4 bits. El repositorio ocupa 85,1 GB e incluye pesos en safetensors y una cuantización GGUF Q5_K_M.

El interés del modelo no reside en su amplitud de capacidades, sino en el método de entrenamiento: el autor documenta que el modelo base con GRPO (500 pasos) y Qwen3.6-27B con exploración aleatoria produjeron cero puertas funcionales, y que solo un SFT previo fuertemente sobreajustado permitió obtener un diseño que pasa la verificación automática. Es, por tanto, un caso de estudio de RL con recompensa verificable en un dominio 3D con temporización de ticks y cableado conectado, más que un modelo de propósito general.

La verificación no es textual: un bot Mineflayer (`verify_door.py`) coloca los comandos generados, localiza el mecanismo de activación, lo acciona dos veces y comprueba que las cuatro celdas de la puerta conmutan y mantienen estado 5 segundos en cada sentido. Licencia, idiomas y longitud de contexto no están declarados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptación LoRA (GRPO + SFT) sobre el modelo base `unsloth/gemma-4-31B-it`, familia Gemma 4; detalles internos de atención y capas no documentados en la model card |
| Parámetros totales | 31.273.088.876 (31,27B), dato de safetensors |
| Parámetros activos | no disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q5_K_M (única publicada y verificada); entrenamiento e inferencia de referencia en 4 bits (`--4bit`); resto no disponible |
| Idiomas soportados | no disponible (la plantilla de prompt de ejemplo está en inglés) |
| Licencia | no disponible en el repositorio; queda sujeta a la licencia del modelo base |
| Formato de pesos | safetensors y GGUF |
| Modelo base | `unsloth/gemma-4-31B-it` |
| Tamaño del repositorio | 85,1 GB |
| Modalidad declarada | `text-generation` en el pipeline; los metadatos incluyen el tag `image-text-to-text`, no documentado en la model card |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con adaptadores LoRA sobre `unsloth/gemma-4-31B-it`. El pipeline declarado por el autor es explícitamente secuencial: primero un SFT (`--resume /sft/`) y después GRPO (`--mode grpo --door 2x2`), ejecutado con TRL y Unsloth en precisión de 4 bits. La innovación técnica relevante no está en la arquitectura, sino en la función de recompensa: un script (`verify_door.py`) basado en un bot Mineflayer mediante JSPyBridge que limpia el área de construcción en creativo, coloca los comandos `/setblock` generados por el modelo, detecta el mecanismo de activación (palanca, botón o placa de presión), lo acciona dos veces y valida que cada celda de la puerta conmuta y mantiene el estado durante 5 segundos en cada ciclo, con resultado pass/fail, motivo y temporización. El entorno es un mundo plano en creativo, Java 1.21, abierto a LAN en el puerto 6666, sin servidor dedicado.

El punto clave del entrenamiento es la exploración: según el autor, ni gemma-4-31B con 500 pasos de GRPO ni Qwen3.6-27B con exploración aleatoria generaron una sola puerta 2x2 funcional, porque la tarea no es un puzle 2D sino un layout 3D con temporización de ticks y cableado conectado. El diseño correcto apareció únicamente tras un SFT sobreajustado que replica una puerta del conjunto de entrenamiento, de modo que el resultado es memorización guiada y no una solución novedosa. El coste declarado del experimento es de aproximadamente 2 meses, unos 10 intentos de entrenamiento y 300 USD. No se especifican número de tokens de entrenamiento, composición del dataset, hiperparámetros de GRPO ni detalles de RLHF/DPO adicionales: no disponibles.

## Capacidades

- Generación de comandos `/setblock` para construir una puerta de pistón 2x2 en Minecraft Java 1.21, con una salida verificada de 40 comandos que incluye pistones adhesivos, bloques de piedra, redstone wire y una palanca.
- Razonamiento espacial 3D restringido al layout declarado en el prompt: límites de construcción, pasillo que debe permanecer libre y puntos de verificación de la puerta.
- Cumplimiento estricto de una plantilla de prompt de ingeniería de redstone (rol, tarea, setup, puntos de verificación).
- Emisión de sintaxis de comandos con estados de bloque (`facing`, `face`) y el argumento `destroy`.
- Capacidades generales heredadas del modelo base: no verificadas ni documentadas en esta ficha.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el bucle construir-accionar-verificar lo aporta externamente el bot Mineflayer, no el modelo.
- Capacidades multilingües: no documentadas; el prompt de referencia está en inglés.
- Modo thinking, visión o audio: no disponibles. El tag `image-text-to-text` figura en los metadatos, pero la model card no describe ningún uso multimodal.
- Capacidad para puertas 3x3: explícitamente no demostrada (el autor bromea con no hablar del caso 3x3).

## Casos de uso

- Generación de estructuras de redstone en herramientas de construcción: el modelo emite la lista completa de `/setblock` para una puerta 2x2 que puede pegarse directamente en el chat de Minecraft Java 1.21 o procesarse por un plugin de servidor, con la ventaja de que la salida está validada contra un verificador automático reproducible.
- Pruebas de parsers y validadores de comandos: los 40 comandos de la salida de referencia sirven como corpus de entrada para testear implementaciones de parseo de `/setblock`, estados de bloque y reglas de región.
- Investigación en agentes que actúan en entornos 3D: el par modelo + `verify_door.py` constituye un pipeline completo de generación de acciones, ejecución en el entorno (Mineflayer/JSPyBridge) y verificación de recompensa, reutilizable para estudiar bucles percepción-acción.
- Reproducción de experimentos de RL con recompensa verificable: el script `grpo_gemma4.py` permite repetir el ciclo SFT + GRPO con recompensa binaria, útil para comparar estrategias de seeding y de exploración en tareas con recompensa dispersa.
- Evaluación de razonamiento espacial en LLM: usar la tasa de puertas funcionales (pass@k con verificación real) como prueba comparativa entre modelos, ya que el criterio es objetivo y no depende de un juez automático.
- Asistencia a jugadores en modo tutorial: el modelo puede devolver la secuencia exacta de colocación de una puerta 2x2 compacta, que el jugador pega en el juego sin necesidad de conocer la mecánica de pistones.
- Docencia y divulgación sobre limitaciones del RL: el caso documenta con cifras concretas (500 pasos, 10 intentos, 300 USD, 0 puertas en exploración aleatoria) por qué el sobreajuste con SFT puede ser un atajo necesario y no una solución general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí reporta resultados cualitativos de la tarea específica, obtenidos con el verificador automático:

| Prueba | Configuración | Resultado reportado |
|---|---|---|
| Este modelo (GGUF Q5_K_M) | Puerta 2x2, verificación con `verify_door.py` | Éxito: `full_toggle_stable`, 4/4 pistones conmutan y mantienen estado |
| gemma-4-31B (base) | GRPO, 500 pasos | 0 puertas 2x2 funcionales |
| Qwen3.6-27B | GRPO con exploración aleatoria | 0 puertas 2x2 funcionales |
| Claude Opus 4.6 | Modo max thinking | 0 puertas 2x2 funcionales |
| Claude Opus 4.7 | Modo max thinking, 15 min, más de 32k tokens de razonamiento | 1 diseño funcional |

Estos datos son declaraciones del autor en la model card, no resultados de un benchmark independiente, y la muestra es de una sola tarea.

## Requisitos de hardware

- Pesos en fp16/bf16: unos 62,5 GB solo de parámetros, más caché KV; requiere A100 80 GB, H100 80 GB o dos GPU de 48 GB.
- Cuantización de 8 bits: aproximadamente 31 GB de pesos; encaja en A100 40 GB o en dos RTX 4090/3090 de 24 GB.
- Cuantización de 4 bits (la empleada en el entrenamiento según el flag `--4bit`): aproximadamente 16-18 GB de pesos, viable en una RTX 4090 o RTX 3090 de 24 GB, con margen ajustado para caché KV y contexto.
- GGUF Q5_K_M: aproximadamente 21-22 GB; cabe en GPU consumer de 24 GB (RTX 3090, RTX 4090) y, con menos holgura o descarga parcial a CPU, en equipos con 32 GB de RAM.
- Despliegue: transformers (librería declarada), llama.cpp u Ollama para el GGUF Q5_K_M. El tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints. Compatibilidad con vLLM o TGI no está documentada.
- El entrenamiento requiere además una instancia de Minecraft Java 1.21 abierta a LAN (puerto 6666) y el bot Mineflayer para la recompensa; no es un requisito de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resultado en puerta 2x2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-31B-RedstoneDoor | 31,27B | no disponible | Éxito verificado (4/4 pistones) | no disponible | Pesos abiertos en HF (safetensors + GGUF) |
| unsloth/gemma-4-31B-it (base) | 31B (aprox., según nombre) | no disponible | 0 puertas tras 500 pasos de GRPO | no disponible | Pesos abiertos en HF |
| Qwen3.6-27B | 27B (aprox., según nombre) | no disponible | 0 puertas con exploración aleatoria | no disponible | Pesos abiertos en HF |
| Claude Opus 4.7 | no disponible | no disponible | 1 diseño funcional (15 min, >32k tokens de thinking) | propietaria | Solo API |

La comparación no es de capacidad general, sino de éxito en una tarea concreta con recompensa verificable; el modelo destaca porque ha sido entrenado específicamente para ella, no porque resuelva mejor tareas generales.

## Limitaciones y advertencias

- Sobreajuste documentado: el diseño correcto proviene de un SFT que replica una puerta del conjunto de entrenamiento; se espera baja generalización a variantes no vistas (otras orientaciones, materiales, tamaños o mecanismos de activación).
- La tarea 3x3 no está resuelta y el autor lo señala explícitamente; tampoco hay evidencia de otros tipos de puertas o circuitos de redstone.
- Riesgo alto de alucinación fuera del dominio: la salida son comandos ejecutables, y un único error de coordenadas o de estado de bloque produce una estructura no funcional o un fallo silencioso en el mundo del jugador.
- Licencia no declarada en el repositorio; antes de uso comercial debe verificarse la licencia del modelo base `unsloth/gemma-4-31B-it` y de la familia Gemma 4, así como los términos de los datasets de SFT empleados.
- Idiomas y longitud de contexto no documentados: no hay garantía de comportamiento correcto en castellano ni con prompts largos.
- Validación muy limitada por la comunidad: 67 descargas y 1 like en el momento de la consulta; no existen evaluaciones independientes.
- El éxito reportado se ha medido con un único verificador y una sola ejecución de referencia (GGUF Q5_K_M); no se documenta la tasa de éxito sobre múltiples muestras.
- Dependencia de un entorno concreto (Minecraft Java 1.21, mundo plano, creativo): los comandos pueden no comportarse igual en otras versiones o con plugins de servidor.
- No se han publicado detalles de sesgos, composición del dataset ni procesos de alineación adicionales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Nekochu/Gemma-4-31B-RedstoneDoor
- Modelo base: https://huggingface.co/unsloth/gemma-4-31B-it
- Archivo GGUF verificado: `Gemma-4-31B-RedstoneDoor-Q5_K_M.gguf` (dentro del repositorio)
- Demostraciones incluidas en el repositorio: `redstone_door_2x2.gif` (render offline de la salida) y `redstone_door_live.gif` (construcción y accionamiento en vivo)
- Script de entrenamiento citado: `grpo_gemma4.py`; script de verificación: `verify_door.py`
- No se han encontrado en la información disponible enlaces a papers, blogs técnicos ni demos externas.

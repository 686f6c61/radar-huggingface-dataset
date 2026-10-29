# game2player/Game2Player-4B

## Resumen

Game2Player 4B es un modelo visión-lenguaje especializado en juego automático (game playing) desarrollado por el equipo de Game2Player y publicado en HuggingFace. Se trata de un fine-tune de Qwen3.5-4B que recibe capturas de pantalla del juego, la descripción de la tarea y el historial reciente de acciones, y predice la siguiente acción de teclado o ratón. El modelo no es un asistente conversacional general: está entrenado para emitir una única llamada a herramienta (`computer_use`) dentro de etiquetas `<tool_call>`, con coordenadas de ratón normalizadas en rango 0-1000 y duraciones en segundos.

El modelo resuelve el problema del control de agentes visuales en entornos de juego cerrados, donde no hay API programática y el único canal de observación es la imagen de pantalla. Acompaña al artículo "Game2Player: Scaling Gameplay Experience for Visual Agents through Environment–Player Co-Development", que propone generar datos de entrenamiento mediante políticas de código y jugadores VLM. El resultado es un modelo pequeño (4.539 millones de parámetros, 4,54 B) que puede desplegarse en una sola GPU y consumirse mediante una API compatible con OpenAI servida por vLLM.

Su relevancia actual radica en la ventana de contexto admitida (hasta 65.536 tokens en la configuración de despliegue recomendada) y en el soporte de hasta siete imágenes por petición con aproximadamente 1.024 tokens visuales cada una, lo que permite mantener memoria visual de los seis fotogramas anteriores junto con hasta 50 acciones previas anotadas. La licencia Apache-2.0 facilita su uso comercial, con la salvedad de que los derechos sobre los videojuegos, assets y capturas no se incluyen en la licencia del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje (VLM) basado en un LLM con codificador visual y proyector visual; fine-tune de Qwen/Qwen3.5-4B |
| Parámetros totales | 4.539.265.536 (4,54 B) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | Hasta 65.536 tokens en la configuración de vLLM recomendada por el autor; longitud máxima de secuencia en entrenamiento de 25.000 tokens |
| Tipos de cuantización | No disponible. El repositorio solo publica pesos en safetensors con precisión de entrenamiento BF16; el autor no distribuye versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los títulos, assets y capturas de juegos pertenecen a sus respectivos propietarios) |
| Formato de pesos | safetensors (librería transformers); tamaño del repositorio 10,4 GB |

## Arquitectura y entrenamiento

Game2Player 4B hereda la arquitectura de Qwen3.5-4B: un modelo multimodal compuesto por un codificador visual, un proyector visual que traduce las representaciones de imagen al espacio del modelo de lenguaje y un LLM troncal. El entrenamiento por ajuste supervisado (SFT) actualiza únicamente el modelo de lenguaje y mantiene congelados el codificador visual y el proyector. La entrada se organiza en un mensaje de sistema con las reglas del juego, los controles disponibles y el objetivo de la tarea, y un mensaje de usuario con la captura actual, hasta 50 acciones anteriores con sus notas breves y hasta seis capturas previas.

Los datos de entrenamiento proceden de partidas recopiladas con políticas de código y jugadores VLM generados por el propio entorno Game2Player. El conjunto consta de 1.564.236 ejemplos, con una sola época, 9.237 pasos de optimizador, una tasa de aprendizaje de 1e-5 con planificador coseno y precisión BF16. La innovación principal no está en el modelo sino en el bucle de co-desarrollo entorno-jugador que genera la experiencia de juego a escala; el autor anuncia que el dataset se publicará próximamente. La salida se canaliza a través de un formato de llamada a herramienta (`computer_use`) con acciones como `press_key` o esperas temporizadas, lo que facilita el parseo determinista en el lado del entorno.

## Capacidades

- Predicción de la siguiente acción de teclado (p. ej. `press_key` con `ArrowRight`) o de ratón con coordenadas normalizadas en el rango 0-1000.
- Acciones temporizadas: el modelo puede emitir esperas con duración explícita en segundos.
- Comprensión de capturas de pantalla de videojuegos y razonamiento sobre el estado visual del juego.
- Memoria de contexto multimodal: hasta siete imágenes por petición (captura actual más seis anteriores) y hasta 50 acciones previas con notas.
- Integración de reglas del juego y controles disponibles a través del mensaje de sistema, lo que permite reutilizar el mismo modelo en títulos distintos sin reentrenamiento.
- Soporte de tool calling / function calling mediante el esquema `computer_use` dentro de etiquetas `<tool_call>`.
- Modo de razonamiento (thinking) activable con `enable_thinking`; en las evaluaciones del autor se permiten hasta 32.768 tokens de salida en este modo. Las cadenas de pensamiento deben omitirse del historial de conversación.
- Campo `reasoning` con una nota breve que justifica la acción elegida, útil para depuración y para el propio historial de acciones.
- Compatibilidad con servidores OpenAI (`endpoints_compatible`) y parser de razonamiento `qwen3` en vLLM.

## Casos de uso

- Agentes de juego automatizados en producción: el modelo se integra en un bucle cerrado (captura de pantalla, inferencia, ejecución de la acción) para jugar títulos sin API programática, aprovechando su formato de salida determinista con `<tool_call>`.
- Evaluación comparativa de agentes visuales: sirve como jugador de referencia sobre PlayerBench (50 juegos, 287 tareas) y GameWorld (34 juegos, 170 tareas) para medir la calidad de nuevas políticas o de cambios en el entorno.
- Generación de datos de juego a escala: desplegado con `--max-num-seqs 8`, puede producir trayectorias anotadas (acción más justificación) que alimenten posteriores ciclos de SFT, tal como propone el artículo del proyecto.
- Pruebas de regresión de videojuegos: un agente que sigue un objetivo descrito en el mensaje de sistema permite detectar regresiones de jugabilidad o de controles de forma automatizada en pipelines de CI.
- Investigación en control por instrucciones: el mensaje de sistema admite reglas, controles y objetivo, lo que facilita experimentos de generalización a títulos nuevos sin reentrenar el modelo.
- Depuración de políticas mediante el campo `reasoning`: la nota breve por acción permite auditar por qué el agente eligió un movimiento concreto en una secuencia de hasta 50 acciones.
- Automatización de tareas de interfaz con estética de juego: al emitir eventos de teclado y ratón normalizados, el modelo puede reutilizarse en entornos gráficos simples que compartan el mismo esquema de acciones.
- Prototipado rápido en una sola GPU: con 4,54 B de parámetros y pesos BF16 (~10,4 GB de repositorio), es viable montar un servidor vLLM en hardware de gama alta de consumo para experimentación.

## Benchmarks y rendimiento

El autor evalúa el modelo en PlayerBench (50 juegos retenidos, 287 tareas) y GameWorld (34 juegos, 170 tareas), pero no se han publicado resultados numéricos en la información disponible; los resultados se remiten al leaderboard del proyecto.

| Benchmark | Composición | Resultado |
|---|---|---|
| PlayerBench | 50 juegos, 287 tareas | No disponible en la información proporcionada |
| GameWorld | 34 juegos, 170 tareas | No disponible en la información proporcionada |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 10-11 GB solo para pesos; el servidor vLLM recomendado usa `--dtype bfloat16` y `--max-model-len 65536`, por lo que la caché KV con contexto largo y hasta siete imágenes por petición eleva el consumo muy por encima del tamaño de los pesos.
- Presión de caché KV por multimodalidad: cada imagen consume aproximadamente 1.024 tokens visuales; siete imágenes suponen unos 7.168 tokens de entrada adicionales por paso, más el historial de acciones.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una A100 40 GB u H100 permite holgura con contexto largo; una RTX 4090 (24 GB) es viable con contexto reducido o límites más estrictos de secuencias e imágenes.
- Viabilidad en GPU de consumo: sí para los pesos (10,4 GB), pero con `--max-num-seqs 8` y `--max-num-batched-tokens 4096` como valores de partida del autor; reducir `--max-model-len` si la VRAM es limitada.
- Opciones de despliegue: vLLM 0.29.0 (configuración oficial del autor, con `--limit-mm-per-prompt '{"image":7,"video":0}'`, `--mm-processor-kwargs '{"max_pixels":1048576}'` y `--reasoning-parser qwen3`); también es cargable directamente con Transformers. No hay soporte documentado para llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El ejemplo del autor fija `temperature=1.0`, `max_tokens=512` y un tiempo de espera de 180 segundos para el modo sin razonamiento; en modo thinking recomienda aumentar `max_tokens` y el tiempo de espera.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Game2Player 4B | 4,54 B | Hasta 65.536 tokens (config. vLLM); 25.000 en entrenamiento | Agente visual para juego, salida `computer_use` | Apache-2.0 | Pesos safetensors en HuggingFace |
| Qwen3.5-4B (modelo base) | 4 B (según denominación del autor) | No disponible | VLM generalista | Apache-2.0 | HuggingFace |
| Otros agentes visuales especializados | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación con alternativas especializadas en agentes visuales no puede completarse con datos verificados en la información proporcionada. Frente a su modelo base, Game2Player 4B restringe la salida a un esquema de acciones concreto y añade memoria de acciones e imágenes, a costa de perder generalidad conversacional.

## Limitaciones y advertencias

- El modelo está especializado en juego: fuera del esquema `computer_use` y del dominio de capturas de pantalla de videojuegos su comportamiento no está validado.
- Riesgo de alucinación de acciones: el formato exige exactamente una llamada a herramienta, pero el modelo puede elegir teclas no presentes en los controles declarados en el mensaje de sistema; conviene validar la acción contra una lista blanca antes de ejecutarla.
- Dependencia fuerte del prompt de sistema: reglas, controles y objetivo deben describirse con precisión; un prompt ambiguo degrada la calidad de la política.
- Límites multimodales: máximo de siete imágenes por petición y aproximadamente 1.024 tokens visuales por imagen con `max_pixels` de 1.048.576; superar estos límites requiere recortar el historial.
- Gestión manual del historial: el autor indica que deben conservarse las notas de acciones previas y omitirse las cadenas de pensamiento anteriores, lo que traslada al integrador la responsabilidad de construir el contexto.
- Coordenadas de ratón normalizadas en 0-1000: es necesario remapear a la resolución real de la pantalla y gestionar errores de redondeo.
- Idiomas soportados no documentados; no hay garantía de comportamiento consistente en instrucciones en castellano.
- Sesgos conocidos: no documentados por el autor. Al entrenarse con partidas generadas por políticas de código y jugadores VLM, puede heredar sesgos de esas políticas y de la distribución de juegos del dataset.
- Licencia: los pesos son Apache-2.0, pero la licencia no concede derechos sobre títulos, assets ni capturas de terceros; el uso comercial con contenido de juegos exige verificar los derechos correspondientes.
- Dataset no publicado todavía ("coming soon"), lo que dificulta la reproducibilidad del entrenamiento.
- Métricas de evaluación no numéricas en la model card: la comparación objetiva depende del leaderboard externo del proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/game2player/Game2Player-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Página del proyecto: https://game2player.github.io/
- Leaderboard del proyecto: https://game2player.github.io/#leaderboard
- Código: https://github.com/game2player/Game2Player
- Benchmark PlayerBench: https://github.com/game2player/Game2Player/tree/main/benchmark/playerbench
- Licencia: https://huggingface.co/game2player/Game2Player-4B/blob/main/LICENSE

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre el modelo; los resultados obtenidos eran contenido no relacionado y se han descartado.

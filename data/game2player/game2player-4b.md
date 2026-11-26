# game2player/Game2Player-4B

## Resumen

Game2Player 4B es un modelo vision-lenguaje especializado en juego automatico (game playing) desarrollado por el equipo game2player. Se trata de un fine-tuning supervisado (SFT) de Qwen3.5-4B, orientado a un caso de uso muy concreto: recibir capturas de pantalla de un videojuego, una descripcion de la tarea y el historial reciente de acciones, y predecir la siguiente accion de teclado o raton en formato de tool call.

El modelo resuelve el problema de la interaccion visual con entornos de juego: en lugar de requerir APIs internas del juego, opera exclusivamente sobre pixeles, lo que lo convierte en un agente visual de proposito general para entornos graficos. Con 4.539 millones de parametros, contexto de hasta 65.536 tokens en despliegue y soporte de hasta siete imagenes por prompt, esta pensado para bucles de decision multi-paso donde el estado del juego se reconstruye a partir de capturas sucesivas.

Su relevancia actual radica en que acompana a un paper (arXiv:2611.24154) sobre co-desarrollo entorno-jugador y a un benchmark propio, PlayerBench, con 50 juegos y 287 tareas. La licencia Apache-2.0 facilita su uso comercial, aunque los derechos sobre assets y capturas de juegos pertenecen a sus propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), base Qwen3.5-4B; encoder visual y proyector congelados durante el SFT |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 65.536 tokens en despliegue (vLLM `--max-model-len 65536`); longitud maxima de secuencia de entrenamiento: 25.000 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; el repo no documenta GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible (la model card no detalla idiomas; hereda el comportamiento de Qwen3.5-4B) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal con encoder visual y proyector hacia el espacio del modelo de lenguaje. Durante el fine-tuning se actualizan unicamente los pesos del modelo de lenguaje, manteniendo congelados el encoder visual y el proyector visual. El entrenamiento uso 1.564.236 ejemplos de gameplay recogidos mediante politicas de codigo y jugadores VLM generados con el propio pipeline Game2Player, durante una epoca y 9.237 pasos de optimizacion, con learning rate 1e-5 y schedule coseno en precision BF16.

La innovacion principal no esta en la arquitectura sino en el paradigma de datos: el paper propone un co-desarrollo entorno-jugador en el que se generan experiencias de juego a escala para entrenar agentes visuales. El modelo emite acciones estructuradas como tool calls (`computer_use`) con campos de accion, tecla o coordenadas normalizadas 0-1000, duracion en segundos y una nota breve de razonamiento. Soporta un canal de pensamiento opcional (`enable_thinking`), con evaluaciones que permiten hasta 32.768 tokens de salida en modo thinking.

## Capacidades

- Prediccion de la siguiente accion de teclado (`press_key`) o raton a partir de capturas de pantalla.
- Razonamiento visual sobre el estado del juego: interpreta reglas, controles y objetivo descritos en el mensaje de sistema.
- Tool calling / function calling con salida estructurada en etiquetas `<tool_call>` y funcion `computer_use`.
- Razonamiento multi-paso: acepta hasta 50 acciones previas con sus notas y hasta seis capturas anteriores (maximo siete imagenes en total, ~1.024 tokens visuales por imagen).
- Modo thinking opcional para cadenas de razonamiento mas largas, separado de la respuesta final.
- Coordenadas de raton normalizadas en rango 0-1000 y duraciones de accion en segundos.
- Capacidades multilingues: no disponibles de forma explicita en la documentacion; dependen del modelo base Qwen3.5-4B.

## Casos de uso

- Agentes de juego automatizado en entornos de escritorio: el modelo recibe la captura actual y el historial de acciones y emite la siguiente tecla o clic, adecuado para juegos sin API gracias a su enfoque puramente visual.
- Evaluacion de agentes visuales en investigacion: integrado en PlayerBench (50 juegos, 287 tareas) o GameWorld (34 juegos, 170 tareas) para medir capacidad de juego y comparar politicas.
- Generacion de datos sinteticos de gameplay: el modelo puede actuar como jugador VLM dentro del pipeline Game2Player para producir trayectorias y experiencias de entrenamiento adicionales.
- Pruebas de regresion de videojuegos: un agente que sigue instrucciones de tarea permite automatizar smoke tests de jugabilidad (llegar a un punto, completar un nivel) sobre builds concretas.
- Automatizacion de tareas de interfaz grafica (GUI): aunque entrenado en juegos, el formato de accion (`press_key`, coordenadas normalizadas) es reutilizable para flujos de escritorio guiados por captura de pantalla.
- Investigacion en razonamiento visual de largo horizonte: el modo thinking con hasta 32.768 tokens de salida y contexto de 65.536 tokens permite estudiar planificacion multi-paso en entornos visuales.
- Demos interactivas de agentes: despliegue con vLLM como servidor compatible con OpenAI para prototipos de agentes que juegan en tiempo real con `--max-num-seqs 8`.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card indica que las evaluaciones se realizan sobre PlayerBench (50 juegos, 287 tareas) y GameWorld (34 juegos, 170 tareas), y que los resultados estan en el leaderboard del proyecto (https://game2player.github.io/#leaderboard), pero no se incluyen cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9-10 GB solo para pesos (4.539 millones de parametros), mas overhead de KV cache y procesamiento visual; el repo ocupa 10,4 GB.
- Con contexto largo (65.536 tokens) y hasta siete imagenes por prompt, la KV cache crece de forma significativa; se recomienda GPU con 24 GB o mas para uso comodo.
- GPU recomendadas: A100 40/80 GB o H100 para despliegues con contexto maximo y multiples secuencias; RTX 4090 (24 GB) viable para contexto moderado y pocas secuencias concurrentes.
- Cabe en GPU consumer de gama alta (RTX 4090, RTX 3090 con 24 GB) en BF16 con contexto reducido; no se documentan cuantizaciones GGUF que permitan bajar a GPUs de 12-16 GB.
- Opciones de despliegue: vLLM 0.29.0 (recomendado por el autor, con `--reasoning-parser qwen3` y `--limit-mm-per-prompt '{"image":7,"video":0}'`) o Transformers. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La configuracion sugerida usa `--max-num-seqs 8` y `--max-num-batched-tokens 4096`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Enfoque |
|---|---|---|---|---|---|
| Game2Player 4B | 4.539 M | 65.536 tokens (despliegue) | imagen-texto | Apache-2.0 | Agente de juego visual especializado |
| Qwen3.5-4B (base) | no disponible en la informacion | no disponible | imagen-texto | Apache-2.0 | VLM generalista |
| Alternativas especificas de agentes de juego | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Especializacion estrecha: entrenado exclusivamente para prediccion de acciones de juego; su rendimiento fuera de ese dominio (chat general, codigo, matematicas) no esta documentado y probablemente sea inferior al del modelo base.
- Riesgo de alucinacion visual: al depender de capturas de pantalla, puede malinterpretar estados del juego, elementos de UI o reglas descritas en el prompt, generando acciones invalidas.
- Dependencia del prompt de sistema: la calidad depende de que se proporcionen correctamente las reglas del juego, los controles y el objetivo; prompts incompletos degradan la politica.
- Limites de historial: maximo de siete imagenes por prompt y 50 acciones previas; en juegos de horizonte muy largo el contexto se trunca y se pierde informacion de estado.
- Sesgos: no documentados por el autor; al entrenarse con gameplay generado por politicas de codigo y jugadores VLM, puede heredar sesgos de esas politicas y sobrerrepresentar generos o mecanicas presentes en el dataset.
- Licencia: los pesos son Apache-2.0, pero la licencia no concede derechos sobre titulos, assets ni capturas de terceros; el uso comercial con contenido de juegos requiere verificar los derechos correspondientes.
- Dataset no publicado ("coming soon"): dificulta la reproducibilidad y la auditoria de la composicion de datos.
- Idiomas: no se especifican; el soporte multilingue no esta garantizado mas alla de lo que herede de Qwen3.5-4B.
- En modo thinking, la latencia aumenta considerablemente (hasta 32.768 tokens de salida en evaluacion), lo que puede ser inviable en bucles de juego en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/game2player/Game2Player-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper: https://arxiv.org/abs/2611.24154
- Proyecto y leaderboard: https://game2player.github.io/
- Codigo: https://github.com/game2player/Game2Player
- Benchmark PlayerBench: https://github.com/game2player/Game2Player/tree/main/benchmark/playerbench
- Licencia Apache-2.0: https://huggingface.co/game2player/Game2Player-4B/blob/main/LICENSE

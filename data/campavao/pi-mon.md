# campavao/pi-mon

## Resumen

pi-mon choice model es un ajuste fino por LoRA de Qwen/Qwen3.5-0.8B, desarrollado por el usuario campavao, que actúa como el componente de toma de decisiones de un agente que juega a Pokemon Red (UE). El modelo no procesa píxeles ni pulsa botones: recibe una descripción textual compacta del estado del juego (mapa, posición, objetivos, equipo, enemigo, movimientos disponibles) y devuelve una elección de alto nivel junto con una justificación breve. El arnés externo, pi-mon, valida la elección mediante una gramática GBNF, la ejecuta en el emulador y reporta el resultado.

El modelo tiene 752.393.024 parámetros y se distribuye exclusivamente como un único archivo GGUF cuantizado en q4_0 de 501.452.384 bytes, pensado para inferencia en CPU con llama.cpp. Su objetivo declarado es ejecutarse en una Raspberry Pi 5, lo que lo convierte en un caso de estudio de agentes LLM de muy bajo consumo de recursos aplicados a un entorno con estado parcialmente observable y horizonte largo.

Es relevante ahora por dos motivos: demuestra que un modelo sub-1B puede completar un juego completo (llegó al Hall of Fame en 21 h 44 min de tiempo real en una Pi 5) cuando se combina con un arnés que restringe el espacio de acciones, y documenta con detalle el bucle prompt-gramática-precheck-watchdog que hace viable esa fiabilidad. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B), ajustada por LoRA SFT y fusionada |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en el despliegue documentado (`llama-server -c 4096`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | q4_0 (única publicada) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`pi-mon-choice-q4_0.gguf`, 501.452.384 bytes, SHA-256 `b42040a8e4e4ede7c0042764d675e8a87fdc38aaad036c9bdf8eea94aa633790`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) con LoRA sobre Qwen/Qwen3.5-0.8B, posteriormente fusionado y cuantizado a q4_0 para llama.cpp. No se documentan cambios arquitectónicos respecto al modelo base: la innovación está en el formato de prompt y en el entrenamiento orientado a una tarea concreta. El conjunto de entrenamiento de la ronda 12 contiene 40.000 ejemplos generados por jugadores scriptados que jugaron el juego en el mismo formato de elección que usa el modelo en inferencia. Se han realizado 12 rondas de entrenamiento acumulativas, aunque el código de entrenamiento y los datos no se han publicado.

El prompt sigue un formato fijo denominado v7, con un mensaje de sistema de una sola línea y un cuerpo estructurado en líneas clave-valor (MAP, GOAL, BADGES, SCENE, PARTY, ENEMY, MOVES, MATCH, EXITS, NEAR, LAST, entre otras). En inferencia se sirve con `llama-server -c 4096`, temperatura 0, thinking desactivado mediante `chat_template_kwargs: {"enable_thinking": false}` y una gramática GBNF por petición que restringe la salida a las elecciones válidas en ese punto, garantizando que la respuesta siempre sea parseable. El autor advierte que otros formatos o prompts escritos a mano producen respuestas pobres.

## Capacidades

- Selección de acciones de alto nivel en Pokemon Red (UE): devuelve una elección del vocabulario definido por pi-mon (por ejemplo, `GO PEWTER_GYM 16,17` o `FIGHT 3`).
- Generación de una justificación breve en formato `CHOICE: <choice>` seguido de `REASON: <short reason>`.
- Interpretación de estado textual estructurado: mapa y coordenadas, orientación, objetivos, medallas, escena, equipo con niveles y PS, enemigo, movimientos con PP y efectividad estimada, salidas, objetos cercanos y últimas acciones.
- Razonamiento sobre efectividad de tipos y selección de movimiento en combate, a partir de la línea `MATCH` del prompt.
- Navegación por rutas entre mapas usando la lista de `EXITS` y el objetivo activo.
- Decisiones multi-paso dentro de un episodio largo (miles de decisiones por partida).
- No soporta tool calling, function calling, visión, audio ni capacidades multilingües más allá del inglés.
- No interpreta píxeles ni controla el emulador directamente: toda la interacción pasa por el arnés.

## Casos de uso

- Agente de juego completo en hardware de bajo consumo: desplegado con llama.cpp en una Raspberry Pi 5, el modelo permite jugar una partida completa de Pokemon Red en aproximadamente un día de tiempo real, sin GPU. Es adecuado porque su tamaño (752 M parámetros, 501 MB en q4_0) cabe holgadamente en la memoria de un SBC.
- Investigación en agentes con espacio de acciones restringido: sirve como banco de pruebas para estudiar cómo una gramática GBNF y un precheck externo compensan las limitaciones de un modelo pequeño en entornos con estado parcialmente observable.
- Evaluación de fiabilidad a horizonte largo: con 3.907 a 5.184 decisiones para alcanzar 8 medallas según el inicial, es útil para medir deriva, bucles y recuperación ante fallos en agentes LLM.
- Estudio de destilación de políticas desde jugadores scriptados: los 40.000 ejemplos de la ronda 12 permiten analizar qué parte del comportamiento es aprendida y qué parte la impone el arnés (gramática, precheck, watchdog, recargas de checkpoint).
- Docencia y demostraciones de LLM en el borde: un modelo de menos de 1 GB que ejecuta un agente completo en CPU es un ejemplo práctico para cursos sobre cuantización, formatos GGUF y despliegue con llama.cpp.
- Reproducción de experimentos de game-playing: el hash SHA-256 del archivo y la verificación de la ROM por SHA-1 permiten replicar las condiciones de las evaluaciones publicadas (nuevas partidas con cada inicial, guardados ante el Alto Mando y en Victory Road).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). El autor reporta exclusivamente métricas de juego con el arnés de pi-mon:

| Evaluacion | Resultado |
|---|---|
| Partida completa desde nueva partida (Raspberry Pi 5, Squirtle) | Hall of Fame en 21 h 44 min de tiempo real |
| Nueva partida con Charmander | 8 medallas en 3.907 decisiones |
| Nueva partida con Bulbasaur | 8 medallas en 3.949 decisiones |
| Nueva partida con Squirtle | 8 medallas en 5.184 decisiones |
| Guardado ante el Alto Mando | Hall of Fame en 403 decisiones |
| Guardado en Victory Road | Hall of Fame en 2.223 decisiones |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el despliegue de referencia (CPU); el archivo q4_0 ocupa 501 MB y con contexto de 4096 tokens el consumo de RAM es del orden de 1 GB o inferior.
- GPU recomendadas: no se documentan; el modelo está pensado para CPU. Cualquier GPU consumer con más de 2 GB de VRAM puede alojarlo, pero no hay datos de rendimiento en GPU.
- Cabe en GPU consumer: sí, por tamaño; sin cifras publicadas de throughput.
- Despliegue: llama.cpp mediante `llama-server -c 4096`; el autor indica temperatura 0, thinking desactivado y gramática GBNF por petición. El comando `pi-mon fetch-model` descarga el GGUF y verifica su SHA-256.
- Latencia y throughput: no disponibles como métricas aisladas. El dato indirecto es que una partida completa requiere aproximadamente 21 h 44 min en una Raspberry Pi 5, incluyendo emulación, precheck y watchdog.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas con otros modelos de game-playing en la información proporcionada. La comparación se limita a características estructurales frente al modelo base:

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| pi-mon choice (r12) | 752.393.024 | 4096 en despliegue | GGUF q4_0 | Apache 2.0 | Agente de juego en CPU vía arnés |
| Qwen/Qwen3.5-0.8B | no disponible en la informacion | no disponible en la informacion | safetensors (base) | Apache 2.0 | LLM conversacional general |
| Otros modelos de game-playing | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo funciona a través de pi-mon: conoce el vocabulario de elecciones y el formato de prompt v7, y nada más. Prompts manuales u otros formatos dan respuestas pobres.
- Solo juega Pokemon Red (UE). pi-mon verifica el SHA-1 de la ROM y rechaza cualquier otra versión.
- Es lento por diseño: una partida completa supone aproximadamente un día de tiempo real en una Raspberry Pi 5.
- Depende críticamente del arnés. Sin gramática, precheck y las prohibiciones y recargas del watchdog, repite elecciones fallidas.
- Pierde combates y a veces entra en bucles de horas en un mismo lugar; Victory Road y las mazmorras largas son las partes más difíciles.
- Las justificaciones (`REASON`) son cortas y a veces incorrectas; son objetivos de entrenamiento, no explicaciones del cómputo del modelo.
- Riesgo de alucinación en el sentido de elecciones no válidas o incoherentes con el estado, mitigado en gran medida por la gramática y el precheck, pero no eliminado.
- El repositorio contiene únicamente pesos: no incluye ROM, arte, sprites, música ni estados de guardado. Se requiere una copia legal propia de Pokemon Red (UE).
- Proyecto fan no oficial, sin afiliación con Nintendo, Game Freak, Creatures Inc. o The Pokemon Company.
- Licencia Apache 2.0 (la del modelo base Qwen3.5-0.8B); el código de pi-mon es MIT. No se documentan restricciones adicionales para uso comercial de los pesos, pero el uso del juego requiere una ROM legal.
- El código y los datos de entrenamiento no se han publicado, lo que limita la reproducibilidad del ajuste fino.
- Soporte únicamente en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/campavao/pi-mon
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio pi-mon: https://github.com/campavao/pi-mon
- Documentación del bucle de decisión: https://github.com/campavao/pi-mon/blob/main/docs/HOW_IT_WORKS.md

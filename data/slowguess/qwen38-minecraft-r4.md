# SlowGuess/qwen38-minecraft-r4

## Resumen

Qwen3.8-27B Minecraft per-tick action model (run "R4") es un ajuste fino del modelo multimodal Qwen/Qwen3.8-27B realizado por el usuario SlowGuess para jugar a Minecraft a partir de capturas de pantalla en primera persona. El modelo no genera texto libre sobre el juego: en cada paso emite una unica llamada a la herramienta `play` que contiene una accion nativa de teclado y raton correspondiente a un tick de 50 ms. Se trata, por tanto, de un modelo de accion vision-lenguaje (vision-language-action) orientado a imitacion de grabaciones humanas.

El entrenamiento parte del checkpoint base sin una fase previa de preentrenamiento especifica de Minecraft, lo que significa que toda la adaptacion al dominio del juego se produce en un unico epoch supervisado sobre 258.621 secuencias y 6,17 millones de acciones. El resultado es un modelo de 27.356.728.560 parametros (unos 27,4 mil millones) con licencia Apache 2.0, publicado en FP32 sin modificaciones respecto al guardado final del entrenador en el paso 4.041.

Su relevancia es acotada pero clara: demuestra que un VLM generalista de ~27B puede convertirse en un agente jugable mediante ajuste fino supervisado con tool calling como interfaz de accion, y publica de forma transparente tanto los fallos (bajo exito en tareas de exploracion de largo horizonte) como los aciertos (buen rendimiento en crafteo). Es material de referencia para quien investigue agentes embodied, imitacion de bajo nivel y politicas por tick.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) de la familia Qwen3.5; vision encoder mas modelo de lenguaje, con salida estructurada via tool call `play` |
| Parametros totales | 27.356.728.560 (aprox. 27,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 16.384 tokens en entrenamiento; las secuencias cubren como maximo 30 acciones consecutivas |
| Tipos de cuantizacion | no disponible en la model card (pesos publicados en FP32); el autor evalua con `--dtype bfloat16` en vLLM |
| Idiomas soportados | no disponible (la tarea se define mediante texto, pero no se documenta cobertura multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32, guardado final del entrenador sin modificar) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de Qwen/Qwen3.8-27B, un VLM con encoder de vision y modelo de lenguaje de la familia Qwen3.5 segun los tags del repositorio. Se entrenaron todos los parametros, con el encoder de vision a 0,7 veces la tasa de aprendizaje del modelo de lenguaje. La interfaz es estrictamente por turnos: el turno de usuario contiene el texto de la tarea y la captura de pantalla actual; el modelo responde con una unica llamada `play` cuyo argumento es `{"action": {...}}`; la salida de la herramienta es la siguiente captura. La camara se expresa como `[pitch_delta, yaw_delta]` en grados y el resto de claves son binarias 0/1, con omision equivalente a 0.

Los datos provienen de `m2_onepf_book/seq/train.jsonl` del dataset SlowGuess/qwen38-minecraft-m2-data: 258.621 secuencias y 6,17 millones de acciones supervisadas. Cada secuencia abarca entre 1 y 30 ticks consecutivos de una misma grabacion, con supervision en todos los ticks y un limite de 16.384 tokens. El entrenamiento uso AdamW con lr 5e-6, schedule coseno, 200 pasos de warmup, batch global de 64, un unico epoch (4.041 pasos) sobre 4 GPU B200 con FSDP, pesos maestros en FP32 y computo en BF16. La perdida de validacion fue 0,0879 en el paso 4.000 sobre `m2_repaired/seq/valid.jsonl`. No se documenta RLHF, DPO ni ninguna fase de alineacion adicional.

## Capacidades

- Generacion de acciones de juego por tick: una llamada `play` por paso con movimiento, camara y teclas binarias.
- Percepcion visual de capturas en primera persona de Minecraft como entrada principal.
- Seguimiento de instrucciones de tarea en lenguaje natural (texto de tarea en el turno de usuario).
- Tool calling estructurado con esquema fijo (`play`), definido en `qwen38_policy_prompt.json`.
- Razonamiento multi-paso dentro de una ventana de hasta 30 acciones consecutivas.
- Modo de pensamiento desactivable: el autor evalua con `enable_thinking=False`.
- Navegacion basica, minado, crafteo y combate en el dominio del juego, con calidad desigual segun la tarea.
- Capacidades multilingues: no disponibles en la documentacion.
- Vision, audio u otras modalidades adicionales: no disponibles.

## Casos de uso

- Investigacion en agentes embodied: usar el modelo como politica de bajo nivel en un entorno Minecraft para estudiar imitacion por tick, con la ventaja de que la interfaz de accion es un tool call tipado y facil de registrar.
- Reproduccion de experimentos de imitation learning: el repositorio incluye logs, acciones por paso, peticiones y respuestas del modelo, videos y frames crudos en `run/`, lo que permite auditar el comportamiento paso a paso.
- Banco de pruebas de crafteo automatizado: con 23/30 exitos en tareas de crafteo del subconjunto diagnostico OpenHA, es adecuado para flujos donde la secuencia de acciones es corta y el estado del inventario esta a la vista.
- Evaluacion de robustez de VLM en entornos visuales dinamicos: util para medir como degrada un modelo generalista cuando se le exige decision continua a 20 Hz (un tick cada 50 ms).
- Generacion de datos sinteticos de trayectorias: las rollouts del modelo pueden servir como datos negativos o de comparacion frente a grabaciones humanas en pipelines de curacion de datasets.
- Estudio de colapso de accion en combate: el 46 % de acciones vacias con el objetivo en pantalla es un caso concreto para analizar sesgos de politica y disenar funciones de recompensa o filtros de accion.
- Prototipado de interfaces vision-lenguaje-accion: sirve como referencia de ingenieria para definir prompts de sistema, esquemas de herramientas y reinicio de contexto cada 30 acciones.

## Benchmarks y rendimiento

Evaluacion en MineExplorer, subconjunto fijo de 20 escenas (1.800 pasos):

| Saltos | 1 | 2 | 3 | 4 | Total |
|---|---|---|---|---|---|
| Exito | 4/6 | 2/6 | 1/4 | 0/4 | 7/20 |

Hitos alcanzados: 20/46 (MSR macro 49,2).

Evaluacion en tareas OpenHA, 30 tareas x 3 ejecuciones, 600 pasos (subconjunto diagnostico, no el benchmark oficial):

| Categoria | Exitos |
|---|---:|
| Minar | 14/30 |
| Craftear | 23/30 |
| Matar | 9/30 |
| Total | 46/90 |

Observacion del autor: en tareas de combate, el 46 % de las acciones del modelo son vacias, a menudo con el objetivo a la vista. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55 GB solo para pesos (27,4 B x 2 bytes), mas overhead de KV cache y activaciones; en la practica se recomienda un minimo de 80 GB.
- VRAM estimada en FP32: unos 110 GB solo para pesos, lo que exige multiples GPU o nodos.
- El autor entreno con 4 GPU B200 y evaluo con vLLM en `--dtype bfloat16`; no se documentan latencias ni throughput medidos.
- GPU recomendadas: B200 (configuracion validada por el autor), H100 80 GB o A100 80 GB para BF16; en configuraciones multi-GPU con tensor parallelism para FP32.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 en BF16 sin cuantizacion agresiva, y no se publican pesos GGUF ni cuantizados en el repositorio.
- Opciones de despliegue: vLLM con `--dtype bfloat16` es la unica configuracion documentada; llama.cpp, Ollama y TGI no estan verificados en la informacion disponible.
- Parametros de muestreo evaluados: temperatura 1,0, top_p 0,95, top_k 20, pensamiento desactivado.
- Reinicio de contexto obligatorio tras 30 acciones, ya que las secuencias de entrenamiento no superan ese horizonte.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SlowGuess/qwen38-minecraft-r4 | 27,4 B | 16.384 tokens (30 acciones) | Minecraft, accion por tick | Apache 2.0 | HuggingFace, pesos FP32 |
| Qwen/Qwen3.8-27B (base) | 27,4 B | no disponible en la informacion | VLM generalista | no disponible en la informacion | HuggingFace |
| Alternativas especificas de agentes Minecraft | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados de otros modelos comparables de politica por tick en Minecraft dentro de la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Horizonte de decision muy corto: las secuencias de entrenamiento cubren como maximo 30 acciones, por lo que el contexto debe reiniciarse desde el frame actual tras ese limite; no hay memoria de largo plazo.
- Rendimiento bajo en exploracion de largo horizonte: 7/20 en el subconjunto de MineExplorer y 0/4 en tareas de 4 saltos.
- Colapso de accion en combate: el 46 % de acciones vacias con el objetivo visible indica un sesgo de politica que puede traducirse en inaccion en produccion.
- Sin fase de preentrenamiento especifica de Minecraft: toda la adaptacion proviene de un unico epoch supervisado, lo que limita la generalizacion a escenarios no vistos.
- Pesos publicados en FP32 (115,7 GB de repositorio): el despliegue requiere hardware de gama alta o conversion manual a BF16, sin pesos cuantizados oficiales.
- Riesgo de alucinacion de acciones: el modelo puede emitir secuencias plausibles pero incorrectas respecto al estado real del juego, ya que solo observa la captura actual.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto con instrucciones de tarea en castellano u otros idiomas.
- Sin datos de sesgos demograficos ni de seguridad; al ser un modelo de accion sobre un entorno de juego, el riesgo social es bajo, pero no hay evaluaciones de robustez adversarial.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener condiciones adicionales que no se detallan en la informacion disponible.
- Repositorio con 0 descargas y 0 likes: no hay validacion externa de la comunidad ni reportes independientes de reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SlowGuess/qwen38-minecraft-r4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/SlowGuess/qwen38-minecraft-m2-data
- Prompt de sistema y definicion de la herramienta `play`: `qwen38_policy_prompt.json` en el repositorio del modelo
- Logs, rollouts y videos de evaluacion: carpeta `run/` del repositorio del modelo
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada

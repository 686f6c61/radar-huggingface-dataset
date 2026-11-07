# OpenRAL/rskill-smolvla-aloha_agilex-robotwin-bf16

## Resumen

`OpenRAL/rskill-smolvla-aloha_agilex-robotwin-bf16` es un paquete de habilidad (rSkill) del framework OpenRAL que envuelve el checkpoint `lerobot/smolvla_robotwin`, un modelo vision-language-action (VLA) de tipo SmolVLA con 0,45 mil millones de parametros afinado sobre el conjunto de datos unificado RoboTwin 2.0. El modelo resuelve el problema de la manipulacion bimanual multitarea en simulacion: dado un estado articular de 14 dimensiones y tres vistas RGB (cabeza y cada muneca), emite trozos de 50 acciones de posicion articular absoluta para el embodiment aloha-agilex.

La relevancia actual del paquete es doble. Por un lado, demuestra el patron de empaquetado de OpenRAL, que separa los pesos del modelo (referenciados via `hf://lerobot/smolvla_robotwin`) de un manifiesto `rskill.yaml` que anade comprobacion de capacidades, exposicion de licencia, presupuestos de latencia e integracion con un registro local. Por otro, sirve como referencia reproducible para evaluar politicas VLA pequenas sobre el benchmark RoboTwin 2.0 con el backend fisico SAPIEN, aunque el propio autor advierte que la evaluacion incluida es solo una prueba de humo (5 tareas, 1 episodio, 0/5 resueltas).

Arquitectonicamente es un transformer VLA compacto (0,45 B) en precision bf16, con contexto de accion de 50 pasos y contrato de observacion fijo: tres imagenes de 256x256 y un vector de estado de 14 dimensiones. No es un modelo de proposito general: es una politica robotica especializada, en ingles, sin capacidades de generacion de texto libre ni de razonamiento conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (SmolVLA), transformer con adaptador de accion por chunks |
| Parametros totales | 0,45 B (450 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (contexto de accion fijo de 50 pasos) |
| Tipos de cuantizacion | bf16 (unico tipo declarado en el manifiesto) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (referenciados via `hf://lerobot/smolvla_robotwin`; el repositorio no copia pesos) |
| Libreria | lerobot |
| Pipeline | robotics |
| Embodiment | aloha_agilex (brazo dual, 14 grados de libertad) |
| Espacio de accion | 14-D posicion articular absoluta, chunk de 50 acciones |
| Entradas | 3 vistas RGB 256x256 (cabeza, muneca izquierda, muneca derecha) + estado articular 14-D float32 |
| Presupuesto de latencia | 250 ms por chunk |
| Runtime | PyTorch |

## Arquitectura y entrenamiento

El modelo base es SmolVLA, una politica vision-language-action compacta de 0,45 B de parametros que combina un codificador visual con un transformer de acciones que predice chunks de comandos motores. En esta variante, el checkpoint se ha afinado sobre `lerobot/robotwin_unified` (antes `pepijn223/robotwin_unified_v3`), un conjunto de datos que agrega 50 tareas bimanuales del benchmark RoboTwin 2.0 generadas en el simulador SAPIEN con el embodiment aloha-agilex. El modelo opera en modo multitarea: una unica politica cubre acciones generalistas de pick, place y transfer sobre objetos como bloques, ollas, tazas y martillos en escenas de sobremesa.

La innovacion operativa del paquete no esta en el modelo sino en el contrato de integracion. OpenRAL carga la politica desde el repositorio upstream y ejecuta inferencia por chunks mediante un adaptador `smolvla` in-tree; RoboTwin se ejecuta en un proceso separado (sidecar SAPIEN/CuRobo con Python 3.10) que devuelve las tres vistas RGB y el estado articular de 14 dimensiones, y el adaptador reproduce los 50 comandos de posicion articular absoluta. El manifiesto fija `state_contract.dim: 14` y `action_contract.dim: 14`, confirmado mediante verificacion en vivo contra las estadisticas de normalizacion del `policy_preprocessor.json` oficial. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Manipulacion bimanual multitarea en simulacion: 50 tareas del benchmark RoboTwin 2.0 con el embodiment aloha-agilex.
- Prediccion de chunks de accion de longitud 50 en un solo paso de inferencia, con reproduccion como comandos absolutos de posicion articular.
- Fusion de tres vistas RGB (cabeza y ambas munecas) a 256x256 con el estado articular de 14 dimensiones.
- Acciones generalistas declaradas: `generalist`, `pick`, `place`, `transfer`.
- Objetos soportados: `block`, `pot`, `cup`, `hammer`; escenas de tipo `tabletop`.
- Integracion con el framework de agentes roboticos OpenRAL mediante manifiesto `rskill.yaml` con comprobacion de capacidades y presupuesto de latencia.
- Ejecucion sobre el backend de escenas RoboTwin via sidecar SAPIEN fuera de proceso.
- No soporta generacion de texto, razonamiento conversacional, tool calling ni capacidades de audio.

## Casos de uso

- Evaluacion reproducible de politicas VLA en RoboTwin 2.0: el paquete permite lanzar `openral benchmark run --suite robotwin --rskill rskills/smolvla-robotwin` para medir tasas de exito sobre 5 tareas con protocolo configurable, util para comparar checkpoints bajo el mismo contrato de observacion.
- Investigacion en manipulacion bimanual: sirve como linea base de 0,45 B para estudiar el efecto del chunking (50 acciones) y de la fusion de vistas de muneca en tareas de pick-and-place.
- Desarrollo de agentes roboticos con OpenRAL: el manifiesto `rskill.yaml` ejemplifica como declarar contratos de estado y accion, presupuestos de latencia y licencia para integrar una politica en un registro local de habilidades.
- Pruebas de integracion simulador-politica: el sidecar SAPIEN en Python 3.10 separado del entorno principal de Python 3.12 demuestra un patron de aislamiento de dependencias reutilizable en pipelines de robotica.
- Prototipado de tareas de transferencia de objetos: las acciones `transfer` sobre `pot`, `cup` y `block` permiten ensayar secuencias de agarre y recolocacion en escenas de sobremesa antes de transferir la politica a hardware.
- Docencia y formacion en VLA: al ser un modelo pequeno con licencia Apache-2.0 y contrato de sensores explicito, es adecuado para cursos practicos sobre politicas vision-language-action sin requerir GPUs de gran capacidad.

## Benchmarks y rendimiento

| Evaluacion | Protocolo | Resultado |
|---|---|---|
| Suite `robotwin` (smoke run) | 5 tareas x 1 episodio, seed 0, `max_steps=300` | 0/5 resueltas |
| Protocolo oficial RoboTwin | 100 episodios por tarea, exito integrado en simulador, `episode_length=300` | no ejecutado en la informacion disponible |

El autor advierte explicitamente que `eval/robotwin.json` es una prueba de humo y no el protocolo oficial; para obtener una cifra comparable hay que elevar `--n-episodes` hacia 100. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable al tratarse de una politica robotica y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada (`min_vram_gb: null` en el manifiesto). Con 0,45 B de parametros en bf16, el peso del modelo ronda 0,9 GB, pero el consumo total depende del codificador visual y del backend de simulacion.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU consumer moderna con al menos 8 GB deberia alojar el modelo; el cuello de botella real es el sidecar SAPIEN/CuRobo, que requiere renderizado fisico.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo, aunque no se confirma en la documentacion.
- Opciones de despliegue: runtime PyTorch via libreria `lerobot` y framework OpenRAL con adaptador `smolvla`; no se documentan soportes de vLLM, llama.cpp, Ollama ni TGI (no aplicables a una politica VLA).
- Latencia: presupuesto declarado de 250 ms por chunk de 50 acciones.
- Throughput: no disponible.
- Requisitos de entorno: sidecar Python 3.10 con SAPIEN y RoboTwin, provisionado con `OPENRAL_ROBOTWIN_AUTO_PROVISION=1` o receta conda manual; comunicacion con el proceso principal via pyzmq y msgpack.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rskill-smolvla-aloha_agilex-robotwin-bf16 | 0,45 B | chunk de 50 acciones | Apache-2.0 | Hugging Face (wrapper) | Politica RoboTwin 2.0, aloha-agilex, 14-DoF |
| lerobot/smolvla_robotwin | 0,45 B | chunk de 50 acciones | Apache-2.0 | Hugging Face | Checkpoint upstream que este paquete referencia |
| lerobot/smolvla_base | 0,45 B | no disponible | Apache-2.0 | Hugging Face | Modelo base sin afinado en RoboTwin |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo entre estos modelos ni de alternativas VLA de otros desarrolladores (por ejemplo, familias tipo pi0 u OpenVLA) que permitan una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- El unico resultado de evaluacion incluido es una prueba de humo con 0/5 tareas resueltas; no debe interpretarse como rendimiento real de la politica.
- El paquete no copia los pesos: en tiempo de ejecucion emite la advertencia de procedencia no verificada de OpenRAL hasta que exista el control de firma previsto.
- Modelo especializado en simulacion: no esta pensado para transferencia directa a hardware real sin validacion adicional.
- Cobertura limitada a 50 tareas de RoboTwin 2.0, escenas `tabletop` y cuatro tipos de objeto; fuera de ese dominio no hay garantias.
- Idioma unico declarado: ingles; no hay soporte multilingue.
- Dependencia de un sidecar SAPIEN en Python 3.10 incompatible con el entorno principal de Python 3.12, lo que complica el despliegue.
- Riesgo de sobreajuste al simulador y a las condiciones de iluminacion y camaras sinteticas de SAPIEN.
- No se documentan sesgos especificos ni tasas de alucinacion (no aplica en el sentido linguistico, pero si el riesgo de predicciones de accion invalidas fuera de distribucion).
- Licencia Apache-2.0 permite uso comercial, pero la cadena de procedencia (wrapper, checkpoint y dataset) debe auditarse por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OpenRAL/rskill-smolvla-aloha_agilex-robotwin-bf16
- Arbol de archivos: https://huggingface.co/OpenRAL/rskill-smolvla-aloha_agilex-robotwin-bf16/tree/main
- Checkpoint upstream: https://huggingface.co/lerobot/smolvla_robotwin
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset: https://huggingface.co/datasets/lerobot/robotwin_unified
- Paper RoboTwin 2.0 (Chen et al.): https://arxiv.org/abs/2506.18088
- Framework OpenRAL: https://github.com/OpenRAL/openral

# OpenRAL/rskill-smolvla-franka_panda-vlabench-bf16

## Resumen

rskill-smolvla-franka_panda-vlabench-bf16 es un paquete de integracion (rSkill) publicado por OpenRAL que envuelve el checkpoint `lerobot/smolvla_vlabench`, un SmolVLA de aproximadamente 0,5 B de parametros afinado sobre VLABench (`lerobot/vlabench_unified`, 97 tareas). El modelo base es `lerobot/smolvla_base`, un modelo vision-language-action (VLA) descrito en arXiv:2506.01844. El objetivo de este rSkill no es resolver la tarea, sino servir como referencia de integracion validada del backend VLABench dentro del ecosistema OpenRAL sobre lerobot 0.6.0.

Se trata, por tanto, de un baseline de integracion y no de una politica funcional: segun la propia model card, obtiene 0/3 en seis primitivas diversas (`select_fruit`, `select_drink`, `select_toy`, `select_book`, `add_condiment`, `insert_flower`), un resultado identico al de la referencia `lerobot-eval` de lerobot, lo que confirma que el cableado de OpenRAL es fiel (estado 7-D, accion absolute-eef, camaras `camera1/2/3`) y que el 0 % proviene de la politica, no de la integracion.

Es relevante ahora porque documenta de forma transparente el estado del arte en VLABench: la unica politica por encima del 50 % es `VLABench/pi0-fast-ft-primitive-10task-deltachunk` (51,2 % de media en primitivas), que es openpi/JAX y requeriria conversion a lerobot `PI0FAST` con int8 para caber en 8 GB. La suite compuesta de largo horizonte de VLABench sigue sin resolverse por ninguna politica conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA |
| Parametros totales | ~0,5 B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (se menciona int8 como requisito para convertir PI0FAST a 8 GB, no para este modelo) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (pesos gestionados por lerobot; se indica dtype bf16) |

Datos adicionales del manifiesto OpenRAL:

| Campo | Valor |
|---|---|
| Familia de modelo | `smolvla` (bf16, ~0,5 B) |
| VRAM minima | 2,0 GB |
| Latencia declarada | 100 ms |
| Runtime | pytorch |
| Camaras | `camera1/2/3` (env `image`/`second_image`/`wrist_image`) |
| Estado | 7-D `[pos_robot(3), euler_xyz(3), gripper(1)]` |
| Accion | 7-D absolute eef pose a IK (la etiqueta `delta_ee_6d_plus_gripper` es nominal) |
| Robot | `franka_panda` (usa el sensor `camera3`/`front` del manifiesto) |
| Libreria | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo es un SmolVLA, un modelo vision-language-action de aproximadamente 0,5 B de parametros que procesa tres vistas RGB (`camera1/2/3`, de al menos 224x224) junto con un estado de propiocepcion de 7 dimensiones `[pos_robot(3), euler_xyz(3), gripper(1)]` y produce una accion de 7-D en forma de pose absoluta del efector final que se resuelve mediante cinematica inversa (IK). El preprocesador del checkpoint renombra `image→camera1...` (una operacion nula sobre las claves ya canonicas) y redimensiona a 256.

El entrenamiento parte de `lerobot/smolvla_base` y se afina sobre `lerobot/vlabench_unified` (VLABench, 97 tareas). El checkpoint envuelto es `lerobot/smolvla_vlabench` (Apache-2.0); OpenRAL no anade pesos, solo empaquetado. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO. La integracion se ejecuta en proceso sobre lerobot 0.6.0 y esta validada contra la referencia `lerobot-eval` de lerobot, lo que confirma la fidelidad del contrato de observacion (estado 7-D, accion absolute-eef, camaras `camera1/2/3`).

## Capacidades

- Generacion de acciones de manipulacion robotica a partir de observaciones visuales y de estado de propiocepcion (vision-language-action).
- Control de un Franka Panda de 7 grados de libertad mediante acciones de pose absoluta del efector final resueltas por IK.
- Procesamiento de tres vistas RGB simultaneas (`camera1/2/3`).
- Ejecucion in-process sobre lerobot 0.6.0 en bf16, con requisito minimo de 2 GB de VRAM.
- Integracion con el backend VLABench de OpenRAL para ejercitar y validar el pipeline de evaluacion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles (en).
- Modo thinking, vision o audio adicionales: no disponibles.

## Casos de uso

- Validacion de integracion del backend VLABench: el rSkill sirve para comprobar que el cableado de OpenRAL (estado 7-D, accion absolute-eef, camaras `camera1/2/3`) es fiel a la referencia `lerobot-eval` de lerobot, dado que ambos producen el mismo resultado 0/3.
- Pruebas de regresion de infraestructura de evaluacion robotica: al ser un baseline reproducible y ligero (2 GB de VRAM, bf16), permite verificar que los cambios en el backend o en el entorno de simulacion no rompen el contrato de observacion.
- Desarrollo de pipelines de evaluacion de politicas VLA: sirve como punto de partida para comparar otras politicas (por ejemplo, la conversion de `pi0-fast-ft` a lerobot `PI0FAST`) contra una referencia conocida.
- Experimentacion con SmolVLA en entornos de simulacion de manipulacion: util para estudiar el comportamiento de un VLA de ~0,5 B sobre las 97 tareas de VLABench sin requerir hardware de gran tamano.
- Integracion en flujos de trabajo con MuJoCo/EGL: la ejecucion documentada con `MUJOCO_GL=egl` permite desplegar el modelo en entornos headless de simulacion.
- Docencia y formacion en robotica: el modelo y su model card transparente sobre el 0 % lo convierten en un caso de estudio realista sobre las limitaciones actuales de las politicas VLA en benchmarks de largo horizonte.
- Prototipado de control de un Franka Panda simulado: permite ejercitar el contrato de accion (pose absoluta del efector final a IK) sobre el robot `franka_panda` de VLABench.

## Benchmarks y rendimiento

| Tarea (primitiva) | Resultado |
|---|---|
| `select_fruit` | 0/3 |
| `select_drink` | 0/3 |
| `select_toy` | 0/3 |
| `select_book` | 0/3 |
| `add_condiment` | 0/3 |
| `insert_flower` | 0/3 |

Notas: la model card indica que no existe todavia un artefacto automatizado `eval/` que respalde estas cifras; se trata de una comprobacion manual informal. El resultado es identico al de la referencia `lerobot-eval` de lerobot. La unica politica por encima del 50 % en VLABench es `VLABench/pi0-fast-ft-primitive-10task-deltachunk` (51,2 % de media en primitivas). La suite compuesta de largo horizonte de VLABench esta por debajo del 50 % en todas las politicas conocidas.

## Requisitos de hardware

- VRAM minima declarada: 2,0 GB.
- Tamano del modelo: ~0,5 B de parametros en bf16, cabe en 8 GB segun la model card.
- GPU recomendadas: no se especifican modelos concretos; por el tamano (0,5 B, 2 GB de VRAM) cabe en GPU de consumo general.
- Cabe en GPU de consumo: si, segun los requisitos declarados (2 GB de VRAM, bf16, fits 8 GB).
- Latencia declarada: 100 ms.
- Throughput estimado: no disponible.
- Opciones de despliegue: lerobot 0.6.0 (ejecucion in-process). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Requisitos adicionales de entorno: Python instala automaticamente las dependencias del backend mediante el plan `ensure_backend_deps` de `vlabench` (`OPENRAL_AUTO_INSTALL_DEPS=1`, por defecto), que clona `OpenMOSS/VLABench`, lo instala con `uv pip install --no-deps -e` y anade las dependencias de simulacion de numpy 2. Ademas, se requiere una descarga manual unica de ~12 GB de assets CC-BY mediante `scripts/download_assets.py`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento VLABench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rskill-smolvla-franka_panda-vlabench-bf16 | ~0,5 B | no disponible | 0/3 en seis primitivas (baseline de integracion) | apache-2.0 | Hugging Face (OpenRAL) |
| lerobot/smolvla_vlabench | ~0,5 B | no disponible | Identico al anterior (referencia `lerobot-eval`) | apache-2.0 | Hugging Face (lerobot) |
| VLABench/pi0-fast-ft-primitive-10task-deltachunk | no disponible | no disponible | 51,2 % de media en primitivas | no disponible | openpi/JAX, requiere conversion a lerobot `PI0FAST` (+int8 para 8 GB) |

## Limitaciones y advertencias

- No es una politica funcional: obtiene 0/3 en seis primitivas diversas; su proposito es validar el backend, no resolver el benchmark.
- Las cifras de 0/3 provienen de una comprobacion manual informal; no existe todavia un artefacto automatizado `eval/` que las respalde.
- La suite compuesta de largo horizonte de VLABench no esta resuelta por ninguna politica conocida (todas por debajo del 50 %).
- Idiomas: unicamente ingles (en).
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; el riesgo relevante es la produccion de acciones no validas o inefectivas en el entorno simulado.
- Sesgos conocidos: no disponibles.
- Restricciones de licencia: Apache-2.0 tanto para el empaquetado del rSkill como para el checkpoint envuelto `lerobot/smolvla_vlabench`; los assets de VLABench son CC-BY y requieren descarga manual (~12 GB).
- Dependencia de entorno fragil: la descarga de assets via Google Drive (`gdown`) se describe como demasiado inestable para automatizarse; el backend falla si los assets no estan presentes.
- El stub `rrt_algorithms` se escribe como raise-on-use porque es una dependencia de generacion de datos solo disponible via git y fuera de la ruta de evaluacion VLA.
- La etiqueta `delta_ee_6d_plus_gripper` es nominal; la accion real es pose absoluta del efector final resuelta por IK.
- `inference: false` en los metadatos del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-smolvla-franka_panda-vlabench-bf16
- README del rSkill en GitHub: https://github.com/OpenRAL/openral/blob/master/rskills/smolvla-vlabench/README.md
- Checkpoint envuelto: https://huggingface.co/lerobot/smolvla_vlabench
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de afinado: https://huggingface.co/datasets/lerobot/vlabench_unified
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Repositorio VLABench: https://github.com/OpenMOSS/VLABench
- Backend OpenRAL VLABench: `python/sim/src/openral_sim/backends/vlabench.py`
- Politica de referencia pi0-fast-ft: `VLABench/pi0-fast-ft-primitive-10task-deltachunk`

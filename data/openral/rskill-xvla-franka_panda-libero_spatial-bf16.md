# OpenRAL/rskill-xvla-franka_panda-libero_spatial-bf16

## Resumen

`OpenRAL/rskill-xvla-franka_panda-libero_spatial-bf16` es un paquete rSkill de OpenRAL que empaqueta los pesos de `lerobot/xvla-libero`, un fine-tune oficial del modelo Vision-Language-Action (VLA) xVLA sobre el benchmark LIBERO, desarrollado en el ecosistema LeRobot. El modelo resuelve el problema de mapear observaciones visuales y estado del robot a acciones de manipulacion en espacio de tarea, y su relevancia radica en que ofrece pesos con licencia Apache-2.0 (uso comercial permitido) dentro de un formato de manifiesto reproducible pensado para evaluacion en simulacion.

El paquete declara un contrato LIBERO concreto: estado de espacio de tarea de 8 dimensiones (`libero_eef8d`), dos camaras RGB de 224x224 mapeadas como `camera1 → image` y `camera2 → image2` con un giro de 180 grados, y acciones de 7 dimensiones (`delta_ee_6d_plus_gripper`) con `chunk_size` de 16. El modelo base es `lerobot/xvla-base` y el fine-tune se ha realizado sobre LIBERO; sin embargo, el autor indica explicitamente que las dimensiones de estado, los nombres de camara y las estadisticas de normalizacion no han sido verificadas localmente, y que el paper subyacente esta pendiente (TBD).

Es importante subrayar que la evaluacion esta en estado `pending`: no hay numeros reproducidos localmente ni paper citable, y el propio autor advierte que no deben publicarse cifras sin una ejecucion verificada o una cita precisa. El presupuesto de latencia de 200 ms por chunk es un marcador conservador pendiente de perfilado real. Se trata, por tanto, de un artefacto de integracion en fase temprana, no de un modelo con rendimiento documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); familia xVLA del ecosistema LeRobot. Detalle interno de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El paquete declara `quantization.dtype: fp32` y el nombre del repo sugiere bf16; no se listan cuantizaciones adicionales (GGUF, int8, etc.) |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache-2.0 (pesos y paquete); `is_commercial_use_allowed: true` |
| Formato de pesos | Pesos PyTorch referenciados via `hf://lerobot/xvla-libero`; runtime `pytorch`. No se especifica safetensors de forma explicita |
| Libreria | lerobot |
| Pipeline | robotics |
| Embodiment | franka_panda (simulacion LIBERO) |
| Estado de entrada | 8-D `libero_eef8d` (espacio de tarea) |
| Accion de salida | 7-D `delta_ee_6d_plus_gripper` |
| Chunk size | 16 |
| Camaras requeridas | `observation.images.camera1` y `observation.images.camera2`, RGB, minimo 224x224 |
| VRAM minima | no disponible (`min_vram_gb: null`) |
| Latencia declarada | 200 ms por chunk (marcador conservador, sin perfilado) |
| Version del paquete | 0.1.0 |
| Rol rSkill | s1 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia xVLA, un modelo Vision-Language-Action integrado en el ecosistema LeRobot. La arquitectura combina percepcion visual (dos camaras RGB) con el estado propioceptivo del robot en espacio de tarea para producir secuencias de acciones de manipulacion. El fine-tune se ha realizado sobre el benchmark LIBERO, un conjunto de tareas de manipulacion en simulacion orientado a evaluar la transferencia de politicas VLA. El modelo base declarado es `lerobot/xvla-base`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se emplearon tecnicas de RLHF o DPO. El paper asociado figura como TBD en la model card, por lo que no hay referencia bibliografica citable. Tampoco se documentan innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). El autor senala que las dimensiones de estado, los nombres de camara y las estadisticas de normalizacion no han sido verificadas localmente, lo que implica que el contrato de entrada/salida es una hipotesis de integracion pendiente de validacion. Adicionalmente, el adaptador de xVLA rellena en proceso un tercer slot de tensor cero de 224x224 (`empty_camera_0`) que no corresponde a ningun sensor fisico.

## Capacidades

- Manipulacion robotica en espacio de tarea: genera acciones de 7 dimensiones (6-D de delta de efector final mas pinza) a partir de observaciones visuales y de estado.
- Percepcion visual multi-camara: consume dos flujos RGB de 224x224 simultaneamente.
- Generacion de acciones por chunks: produce bloques de 16 acciones por inferencia, lo que reduce la frecuencia de llamada al modelo.
- Control de brazo de 7 grados de libertad en simulacion LIBERO con el embodiment `franka_panda`.
- Integracion con el ecosistema LeRobot mediante la libreria `lerobot`.
- Carga mediante el cargador `openral_rskill` a partir de un manifiesto YAML (`rSkill.from_yaml`).
- Ejecucion en simulacion LIBERO a traves del comando `just sim-xvla-libero` (requiere GPU y `MUJOCO_GL`).
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, audio ni modo thinking.

## Casos de uso

- Evaluacion de politicas VLA en simulacion: el paquete permite lanzar la simulacion LIBERO (`just sim-xvla-libero`) para medir el comportamiento del fine-tune en tareas de manipulacion antes de comprometerse con hardware real; es adecuado porque el manifiesto ya declara el contrato de estado, camaras y acciones del benchmark.
- Prototipado de pipelines de robotica con LeRobot: al estar empaquetado como rSkill cargable via `rSkill.from_yaml`, se integra en flujos existentes del ecosistema LeRobot sin reescribir el codigo de carga de pesos.
- Investigacion sobre transferencia sim-a-real: sirve como punto de partida para estudiar como un fine-tune de LIBERO se comporta al adaptarlo a un brazo Franka Panda fisico, dado que el embodiment nativo declarado es `franka_panda`.
- Validacion de integracion (dry-run): el comando `just sim-xvla-libero --dry-run` permite comprobar el cableado de sensores, alias de camaras y dimensiones de accion sin necesidad de GPU, util en CI de proyectos de robotica.
- Benchmarking comparativo dentro de OpenRAL: al coexistir con `smolvla-libero` (verificado localmente) y `pi05-libero-int8` (no comercial), permite comparar familias VLA bajo el mismo contrato LIBERO, con la salvedad de que este modelo aun no tiene metricas.
- Base para fine-tuning posterior con licencia permisiva: al ser Apache-2.0 con uso comercial permitido, puede emplearse como inicializacion para tareas de manipulacion propietarias, siempre que se valide previamente el contrato de entrada/salida no verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `eval/libero.json::status` figura como `pending`, sin numeros reproducidos localmente ni paper citable. El autor advierte explicitamente de que no deben poblarse cifras sin una ejecucion verificada o una cita precisa con referencia de tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (`min_vram_gb: null` en el manifiesto). El numero de parametros no se declara, por lo que no es posible estimar VRAM a partir del tamano.
- GPU recomendadas: no disponible. La ejecucion completa de la simulacion LIBERO requiere GPU y la variable de entorno `MUJOCO_GL`.
- Compatibilidad con GPU de consumo: no confirmada; al no conocerse el tamano del modelo ni la VRAM minima, no puede afirmarse que quepa en tarjetas como RTX 4090.
- Opciones de despliegue: runtime PyTorch con la libreria `lerobot`; carga via `openral_rskill`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI (son frameworks de LLM y no aplican directamente a este VLA).
- Latencia y throughput: el manifiesto declara 200 ms por chunk de 16 acciones como marcador conservador, pendiente de actualizar tras perfilado local. No hay cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `OpenRAL/rskill-xvla-franka_panda-libero_spatial-bf16` (este) | no disponible | no disponible | Sin metricas (eval pendiente) | Apache-2.0 (comercial permitido) | Hugging Face, paquete rSkill |
| `OpenRAL/rskill-smolvla-franka_panda-libero_spatial-bf16` | no disponible | no disponible | Fine-tune LIBERO verificado localmente (segun la model card de referencia) | no disponible en la informacion proporcionada | Hugging Face |
| `OpenRAL/rskill-pi05-libero-int8` | no disponible | no disponible | Fine-tune LIBERO (sin cifras en la informacion proporcionada) | No comercial (segun la model card de referencia) | Hugging Face |

Los tres modelos comparten el contrato LIBERO del ecosistema OpenRAL y el embodiment `franka_panda`. La diferencia principal documentada es el estado de verificacion (este modelo esta pendiente, `smolvla` figura como verificado localmente) y la licencia (`pi05` no permite uso comercial, mientras que este si). No hay datos de parametros ni de rendimiento cuantitativo para establecer una comparacion numerica.

## Limitaciones y advertencias

- Evaluacion no verificada: `eval/libero.json::status` esta en `pending`; no existen numeros reproducidos localmente ni paper citable. No debe asumirse ningun nivel de rendimiento.
- Contrato de entrada/salida sin validar: las dimensiones de estado (8-D), los nombres de camara y las estadisticas de normalizacion no han sido verificadas localmente, segun el propio autor.
- Paper pendiente (TBD): no hay publicacion que documente arquitectura, datos de entrenamiento ni resultados.
- Latencia no perfilada: los 200 ms por chunk son un marcador conservador, no una medida real.
- Dependencia de simulacion: el flujo documentado se ejecuta en simulacion LIBERO con `MUJOCO_GL`; el comportamiento en hardware fisico no esta documentado.
- Camara ficticia: el adaptador rellena un tercer slot de tensor cero (`empty_camera_0`) que no corresponde a ningun sensor fisico, lo que puede confundir en integraciones.
- Idiomas: la model card declara unicamente ingles (`en`); no se documenta soporte multilingue.
- Sesgos y alucinacion: no hay informacion disponible sobre sesgos conocidos ni sobre tasas de error o modos de fallo de la politica.
- Uso comercial: permitido por licencia Apache-2.0, pero la falta de validacion tecnica desaconseja su uso en produccion sin una evaluacion propia previa.
- Adaptadores para otros brazos: robots distintos de Franka Panda de 7 DoF requieren un adaptador no incluido.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/OpenRAL/rskill-xvla-franka_panda-libero_spatial-bf16)
- [Repo upstream de pesos: lerobot/xvla-libero](https://huggingface.co/lerobot/xvla-libero)
- [Modelo base: lerobot/xvla-base](https://huggingface.co/lerobot/xvla-base)
- [Benchmark LIBERO](https://libero-project.github.io/)
- [rSkill de referencia verificado: smolvla-libero](https://huggingface.co/OpenRAL/rskill-smolvla-franka_panda-libero_spatial-bf16)
- [Paper de SmolVLA (referencia del ecosistema, arXiv 2506.01844)](https://arxiv.org/abs/2506.01844)

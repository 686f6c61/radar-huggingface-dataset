# OpenRAL/rskill-openvla_oft-widowx-simpler_env-nf4

## Resumen

`rskill-openvla_oft-widowx-simpler_env-nf4` es un paquete de inferencia (un *rSkill*) publicado por OpenRAL que envuelve una política robótica de tipo vision-language-action (VLA) basada en OpenVLA-OFT. El checkpoint subyacente es `RLinf/RLinf-OpenVLAOFT-PPO-ManiSkill3-25ood`, un modelo afinado con PPO sobre la tarea ManiSkill3 `PutOnPlateInScene25` con un brazo WidowX 250 S. OpenRAL lo empaqueta en cuantización NF4 (4 bits) para que el backbone de 7,5 mil millones de parámetros quepa en GPUs de 8 GB, y lo valida localmente sobre la tarea SimplerEnv WidowX *carrot-on-plate*.

El modelo resuelve un problema muy concreto: ejecutar control de manipulación de extremo a extremo (observación RGB a comandos de efector final) en simulación, con un contrato de observación-acción fijo y reproducible. No es un modelo de propósito general ni un chatbot: es una política de robot que recibe una imagen de 224×224 y una instrucción en lenguaje natural, y devuelve un *chunk* de 8 acciones de 7 dimensiones (6 deltas de efector final más apertura de pinza).

Su relevancia actual radica en que demuestra un pipeline completo de VLA cuantizado a 4 bits ejecutándose en hardware de consumo (RTX 4070 Laptop, 8 GB), con métricas de éxito publicadas y reproducibles (40 % en 5 episodios), y con un formato de empaquetado (rSkill) que estandariza manifiesto, contrato de acción y evaluación. La licencia MIT del checkpoint facilita su reutilización, aunque el paquete de cuantización requiere OpenRAL Pro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (OpenVLA-OFT), transformer multimodal con cabeza de acciones discretizadas en 256 bins |
| Parametros totales | 7,5 mil millones (backbone) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (prompts truncados a `max_length=30` tokens) |
| Tipos de cuantizacion | NF4 (4 bits); el runtime open source de OpenRAL solo carga fp32, fp16 y bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT (checkpoint); empaquetado OpenRAL Apache-2.0 |
| Formato de pesos | no disponible (carga vía `transformers` custom-code, `AutoModelForVision2Seq` con `trust_remote_code`) |

## Arquitectura y entrenamiento

OpenVLA-OFT es una variante optimizada de OpenVLA (arXiv:2502.19645) que mantiene un backbone vision-language preentrenado y añade una cabeza de acciones que discretiza cada dimensión de acción en 256 bins. El modelo recibe una única imagen RGB de 224×224 (vista tercera de SimplerEnv, mapeada a `camera1`) y un prompt con la instrucción, sin propriocepción (`use_proprio=False`). La salida se decodifica a tokens discretos en `[-1, 1]`, se desnormaliza con las estadísticas embebidas `unnorm_key=bridge_orig` (BOUNDS_Q99) y se convierte en 6 deltas de efector final más la señal de pinza.

El entrenamiento tiene tres etapas: base `Haozhan72/Openvla-oft-SFT-libero-goal-trajall`, ajuste LoRA SFT sobre ManiSkill y finalmente PPO sobre `PutOnPlateInScene25Main-v3` con WidowX 250 S mediante RLinf. El éxito reportado en entrenamiento es 0,977; en evaluación fuera de distribución, 0,921 (visión), 0,648 (semántica) y 0,736 (posición). La innovación práctica del paquete es la combinación de cuantización NF4 con el asignador CUDA de segmentos expandibles, que reduce el backbone de 7,5 B a menos de 8 GB de VRAM, más un contrato de acción explícito (`delta_ee_6d_plus_gripper`, dimensión 7) con `action_scale=2.0`, umbral de pinza 0,5 y *chunk* de 8 acciones reproducidas en bucle abierto.

## Capacidades

- Generación de acciones robóticas de manipulación a partir de una imagen RGB y una instrucción en lenguaje natural.
- Control de efector final en espacio de deltas (3 de posición, 3 de rotación) más apertura/cierre de pinza.
- Ejecución de *action chunks* de 8 pasos de 7 dimensiones en bucle abierto.
- Comprensión de instrucciones cortas en inglés para tareas de mesa plana (estilo Bridge V2).
- Inferencia cuantizada a 4 bits (NF4) en GPUs de 8 GB.
- Integración como política in-process vía `transformers` custom-code con `trust_remote_code`.
- No soporta tool calling, function calling, agentes multi-paso, visión genérica, audio ni modo *thinking*: es una política de robot, no un modelo conversacional.

## Casos de uso

- Evaluación reproducible de VLA en simulación: ejecutar `openral benchmark run --suite simpler_env_widowx --task simpler_env/widowx_carrot_on_plate` para obtener una línea base de éxito (40 % en 5 episodios) antes de probar variantes.
- Investigación en cuantización de políticas robóticas: comparar el rendimiento NF4 frente a fp16/bf16 en la misma tarea para medir la pérdida de precisión en control de precisión.
- Desarrollo en hardware de consumo: validar pipelines de VLA en una RTX 4070 Laptop de 8 GB sin necesidad de A100/H100, acelerando la iteración de investigadores con presupuesto limitado.
- Prototipado de *bridges* de embodiment: usar el checkpoint como punto de partida para transferir políticas WidowX a otros brazos con control de efector final similar.
- Docencia y demostraciones de robótica: mostrar de extremo a extremo cómo una imagen y una frase se convierten en comandos de robot, con un contrato de acción documentado y verificable.
- Integración en pipelines de RL: servir como política inicial o de referencia en bucles PPO sobre ManiSkill3, dado que el checkpoint procede de ese mismo proceso de RL.
- Pruebas de regresión de infraestructura: verificar que el adaptador `openvla` de OpenRAL, la carga custom-code y el asignador CUDA funcionan correctamente en un entorno dedicado con transformers 4.40.

## Benchmarks y rendimiento

| Benchmark | Configuración | Resultado |
|---|---|---|
| SimplerEnv `widowx_carrot_on_plate` | RTX 4070 Laptop 8 GB, NF4, 5 episodios, seeds 0-4, horizonte 60 pasos, `action_scale=2.0` | 2/5 (40 %) |
| SimplerEnv `widowx_carrot_on_plate` sin transformación de acción RLinf | misma configuración | 0/5 (0 %) |
| ManiSkill3 `PutOnPlateInScene25` (entrenamiento, RLinf) | éxito reportado por RLinf | 0,977 |
| ManiSkill3 OOD visión | éxito reportado por RLinf | 0,921 |
| ManiSkill3 OOD semántica | éxito reportado por RLinf | 0,648 |
| ManiSkill3 OOD posición | éxito reportado por RLinf | 0,736 |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni métricas de lenguaje, ya que el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM mínima: 7,0 GB según el manifiesto (`min_vram_gb: 7.0`); validado en 8 GB con NF4 y asignador CUDA de segmentos expandibles.
- GPU recomendadas: RTX 4070 Laptop (8 GB) verificada; cualquier GPU consumer con ≥8 GB (RTX 3060 Ti, 3070, 4060 Ti 16 GB, 4070, 4080) debería ser suficiente; A100/H100 no son necesarias pero acelerarían la inferencia.
- Cabe en GPU consumer: sí, con cuantización NF4.
- Despliegue: carga in-process vía `transformers` (`AutoModelForVision2Seq` + `trust_remote_code`, requiere `OPENRAL_ALLOW_REMOTE_CODE=1`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 2.000 ms por paso según el manifiesto (`latency_ms: 2000.0`); el *chunk* de 8 acciones se reproduce en bucle abierto, por lo que la frecuencia efectiva de control es de aproximadamente 0,5 Hz por chunk.
- Entorno: requiere transformers de la era 4.40; no debe sincronizarse con el workspace por defecto de OpenRAL, que fija transformers 5.3 para familias lerobot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rskill-openvla_oft-widowx-simpler_env-nf4` | 7,5 B | no disponible | 40 % en SimplerEnv WidowX carrot-on-plate (5 episodios) | MIT | Hugging Face (requiere OpenRAL Pro para NF4) |
| `rldx1-ft-simpler-widowx-nf4` (OpenRAL) | no disponible | no disponible | no disponible | no disponible | Hugging Face, sibling WidowX bridge rSkill |
| `RLinf/RLinf-OpenVLAOFT-PPO-ManiSkill3-25ood` (upstream) | 7,5 B | no disponible | 0,977 train; 0,921/0,648/0,736 OOD en ManiSkill3 | MIT | Hugging Face |
| `Haozhan72/Openvla-oft-SFT-libero-goal-trajall` (base) | 7,5 B | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Rendimiento limitado y con alta varianza: 40 % de éxito sobre solo 5 episodios; la muestra es demasiado pequeña para conclusiones robustas.
- Específico de un embodiment y una tarea: solo WidowX 250 S con mesa plana Bridge V2 y la tarea carrot-on-plate; el manifiesto rechaza explícitamente emparejamientos con Panda/PickCube por incompatibilidad de embodiment.
- Sin propriocepción (`use_proprio=False`): depende únicamente de una imagen RGB de 224×224.
- Riesgo de alucinación de acciones: como política generativa, puede producir comandos plausibles pero inviables en escenarios fuera de distribución, especialmente en variaciones semánticas (0,648 OOD).
- Solo inglés: las instrucciones deben formularse en inglés.
- Requiere ejecución de código remoto (`trust_remote_code`): la carga ejecuta Python incluido en el repositorio y la verificación de firma rSkill no está implementada.
- Cuantización NF4 restringida: el runtime open source de OpenRAL no carga int4; se necesita OpenRAL Pro (ADR-0123).
- Dependencia de versión: el checkpoint necesita transformers 4.40, incompatible con el workspace por defecto de OpenRAL (transformers 5.3).
- Licencia MIT para el checkpoint, pero el empaquetado OpenRAL es Apache-2.0; revisar ambas antes de uso comercial.
- No apto para producción real de robótica sin validación adicional: las métricas proceden de simulación y de un único entorno.

## Enlaces

- Hugging Face: https://huggingface.co/OpenRAL/rskill-openvla_oft-widowx-simpler_env-nf4
- Repositorio del rSkill en GitHub: https://github.com/OpenRAL/openral/tree/master/rskills/openvla-oft-simpler-widowx-nf4/
- Repositorio OpenRAL: https://github.com/OpenRAL/openral
- Checkpoint upstream RLinf: https://huggingface.co/RLinf/RLinf-OpenVLAOFT-PPO-ManiSkill3-25ood
- Base SFT: https://huggingface.co/Haozhan72/Openvla-oft-SFT-libero-goal-trajall
- Paper OpenVLA-OFT: https://arxiv.org/abs/2502.19645
- Sitio de OpenVLA-OFT: https://openvla-oft.github.io/
- SimplerEnv: https://github.com/simpler-env/SimplerEnv
- Sibling rSkill: https://huggingface.co/OpenRAL/rldx1-ft-simpler-widowx-nf4

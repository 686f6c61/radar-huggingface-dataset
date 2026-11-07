# OpenRAL/rskill-xr1-panda_mobile-robocasa-nf4

## Resumen

OpenRAL/rskill-xr1-panda_mobile-robocasa-nf4 es un paquete de pesos cuantizados en NF4 (4 bits) del checkpoint XR-1 RoboCasa de Xiaomi Robotics, empaquetado por OpenRAL como "rSkill" para su uso dentro del runtime OpenRAL. No es un modelo de lenguaje al uso: es un modelo vision-language-action (VLA) orientado a control robótico, concretamente al embodiment `panda_mobile` (brazo Panda sobre base móvil) en entornos de cocina simulados RoboCasa. El modelo subyacente combina Qwen3-VL-4B-Instruct como torre visión-lenguaje con una cabeza de acción DiT de 36 capas, sumando aproximadamente 5.050 millones de parámetros según los safetensors publicados.

La relevancia de esta ficha es doble. Por un lado, documenta un caso concreto de distribución de políticas robóticas preentrenadas y cuantizadas para inferencia en hardware modesto (el autor reporta ejecuciones en una GPU de portátil con 8 GB de VRAM usando NF4). Por otro, ilustra las fricciones prácticas del ecosistema: el paquete requiere OpenRAL Pro para cargar pesos por debajo de 16 bits (ADR-0123), depende de código custom de Transformers con `OPENRAL_ALLOW_REMOTE_CODE=1` y su evaluación pública es todavía parcial, sin JSON de benchmarks versionado.

El checkpoint deriva del modelo base Xiaomi-Robotics-1-RoboCasa, publicado bajo licencia Apache-2.0 y descrito en el paper arXiv:2607.15330. El wrapper de OpenRAL añade el contrato de observación/acción (tres vistas RGB de 256x256 más un vector de estado de 8 dimensiones) y la lógica de adaptación entre el estado físico real y el tensor interno de 60 dimensiones que espera XR-1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action: Qwen3-VL-4B-Instruct (torre VLM) + cabeza de acción DiT de 36 capas |
| Parametros totales | 5.053.149.696 (5,05 B); la model card upstream cita 5,44 B |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (4 bits, bitsandbytes); el paquete se distribuye ya pre-cuantizado (`prequantized_nf4: true`) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 3,2 GB), con código custom de Transformers |
| Pipeline | robotics |
| Embodiment | `panda_mobile` |
| Entradas | 3 frames RGB 256x256 (`camera1`, `camera2`, `camera3`) + `observation.state` de forma `(8,)` |
| Salidas | chunk de acciones `(T, 7)`: delta XYZ, delta eje-ángulo, gripper |
| Runtime | PyTorch sidecar; torch 2.9.1, transformers 4.57.1, FlashAttention |
| Latencia declarada | 120.000 ms por chunk (`latency_budget.per_chunk_ms`) |
| VRAM mínima declarada | `null` (no fijada en el manifiesto) |

## Arquitectura y entrenamiento

XR-1 es un VLA que empareja un modelo visión-lenguaje Qwen3-VL-4B-Instruct con una cabeza de acción basada en Diffusion Transformer de 36 capas. La torre VLM procesa tres vistas RGB (base izquierda, base derecha y muñeca) junto con el estado proprioceptivo, y la cabeza DiT genera chunks de acciones de desplazamiento en el espacio efector final. OpenRAL adapta la interfaz: rellena el vector de estado físico de 8 dimensiones hasta el tensor interno de 60 dimensiones que espera el modelo, aplica el recorte central de 0,95 definido por Xiaomi y devuelve únicamente los siete primeros canales de acción decodificados.

El entrenamiento del checkpoint upstream consiste en un post-entrenamiento de XR-1 (5B) sobre los datos de benchmark de RoboCasa de Xiaomi. No se detalla en la información disponible el volumen de tokens, la composición exacta del dataset ni si se emplearon RLHF o DPO; la model card solo indica "Xiaomi's RoboCasa benchmark post-training data". Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. El paquete de OpenRAL no reentrena nada: es una cuantización NF4 construida a partir de un `source_repo` fijado por SHA, con los pesos empaquetados de forma reproducible.

## Capacidades

- Control robótico de manipulación en entornos de cocina simulados: acciones de pick, place, open y close sobre objetos de cocina.
- Percepción multimodal: consume tres flujos RGB simultáneos de 256x256 o mayores (base izquierda, base derecha y muñeca).
- Fusión de estado proprioceptivo: integra siete articulaciones del brazo más un valor de gripper en un vector de 8 dimensiones.
- Generación de chunks de acción: emite secuencias de `T` pasos de 7 dimensiones (delta XYZ, delta eje-ángulo, gripper) por consulta.
- Ejecución en hardware de consumo gracias a la cuantización NF4 (reportado en GPU de portátil con 8 GB).
- Integración con el runtime OpenRAL mediante manifiesto rSkill (`role: s1`, `rskill-kind:vla`).
- Capacidades de lenguaje y razonamiento heredadas de Qwen3-VL-4B-Instruct, no documentadas ni evaluadas en esta ficha.
- Soporte de tool calling, agentes multi-paso, audio o thinking mode: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de políticas VLA en simulación: usar el paquete para reproducir el wiring de observación/acción de XR-1 en RoboCasa y validar que el adaptador de OpenRAL entrega estados y recibe acciones con las formas correctas, antes de invertir en el checkpoint completo en precisión nativa.
- Prototipado en estaciones de trabajo modestas: la cuantización NF4 permite ejecutar una política de 5B en GPUs de 8 GB, lo que habilita iterar sobre escenas y configuraciones sin acceso a clústeres con A100/H100.
- Benchmarking de tareas pick-and-place: el autor reporta 2/3 episodios exitosos colocando la baguette en el armario (pasos 270 y 330, horizonte de 500, semillas 0-2) en su stack propio, lo que sirve como línea base para comparar variantes de cuantización.
- Investigación en cuantización de políticas robóticas: comparar el comportamiento de NF4 frente a fp16/bf16 en tareas de manipulación de precisión, midiendo degradación en tasa de éxito y número de pasos.
- Integración en pipelines de simulación automatizados: el manifiesto con `weights_uri` fijado por SHA y la licencia Apache-2.0 permiten incorporar el paquete a suites de CI que ejecutan rollouts en RoboCasa de forma reproducible.
- Estudio de contratos de observación en VLAs: el código de adaptación (padding de estado 8→60, recorte central 0,95, selección de los siete primeros canales) es un ejemplo documentado de las capas de compatibilidad que necesitan los VLA al desplegarse fuera de su entorno original.
- Base para post-entrenamiento o fine-tuning específico de tarea: al ser Apache-2.0 y derivar de un checkpoint público, puede servir de punto de partida para adaptaciones a otras cocinas u objetos, siempre que se respete la dependencia de código custom.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se incluye ningún JSON de benchmark hasta completar una ejecución emparejada con la versión upstream, y que las afirmaciones de integración se limitan a la validación de esquema y adaptador.

| Evaluación | Resultado | Contexto |
|---|---|---|
| Tasa de éxito RoboCasa (stack propio OpenRAL) | 2/3 episodios | RTX 8 GB portátil, NF4 vía OpenRAL Pro, horizonte 500 pasos, semillas 0-2, 2026-10-28 |
| Pasos hasta éxito | 270 y 330 | Misma ejecución; tarea de colocar baguette en armario |
| Score oficial RoboCasa v0.2 de Xiaomi | no disponible | No reproducido: OpenRAL usa su propio stack de cocina fijado |
| MMLU / HumanEval / GSM8K | no aplica / no disponible | Modelo de control robótico, no evaluado en benchmarks de lenguaje |

## Requisitos de hardware

- VRAM estimada: no declarada en el manifiesto (`min_vram_gb: null`). El autor reporta funcionamiento en una GPU de portátil con 8 GB usando NF4; el repo pesa 3,2 GB, por lo que el grueso del consumo proviene de activaciones y del stack de FlashAttention.
- GPUs recomendadas: no hay recomendación oficial. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 permitirían ejecutar el modelo con holgura e incluso en bf16 si se dispusiera de los pesos sin cuantizar.
- GPU de consumo: sí, según la evidencia del autor en 8 GB con NF4, aunque sin margen documentado ni cifras de throughput.
- Opciones de despliegue: exclusivamente el runtime OpenRAL con sidecar PyTorch (torch 2.9.1, transformers 4.57.1, FlashAttention) y `OPENRAL_ALLOW_REMOTE_CODE=1`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el propio repo marca `inference: false` en Hugging Face.
- Latencia: presupuesto declarado de 120.000 ms por chunk de acción, un valor muy alto que refleja el entorno de sidecar y no un rendimiento optimizado.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenRAL/rskill-xr1-panda_mobile-robocasa-nf4 | 5,05 B (NF4) | no disponible | 3 RGB 256x256 + estado 8-D | Apache-2.0 | Hugging Face; requiere OpenRAL Pro |
| OpenRAL/rskill-xr1-panda_mobile-robocasa365-nf4 | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face; variante sobre RoboCasa365 |
| XiaomiRobotics/Xiaomi-Robotics-1-RoboCasa | 5,44 B (según model card) | no disponible | 3 RGB + estado | Apache-2.0 | Hugging Face; pesos upstream sin cuantizar |
| Políticas VLA de propósito general (p. ej. familias OpenVLA, π0) | no disponible en esta búsqueda | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es interna al ecosistema XR-1: este paquete es una variante cuantizada del checkpoint upstream, y la alternativa `robocasa365` apunta a un conjunto de tareas distinto. No se dispone de datos de rendimiento comparables entre ellas ni con otras familias VLA en la información proporcionada.

## Limitaciones y advertencias

- Requiere OpenRAL Pro: según ADR-0123, la versión open source de OpenRAL solo carga fp32, fp16 y bf16; los formatos cuantizados como NF4 necesitan el paquete de cuantización de pago.
- Dependencia de código remoto: la carga exige `OPENRAL_ALLOW_REMOTE_CODE=1`, lo que implica ejecutar código custom de Transformers del checkpoint; es un riesgo de seguridad y de reproducibilidad en entornos productivos.
- Evaluación incompleta: no hay JSON de benchmark publicado y la única evidencia empírica es un 2/3 en tres semillas sobre un stack no equivalente al de Xiaomi (RoboCasa v0.2). No debe citarse como rendimiento oficial.
- Desajuste de versión del simulador: OpenRAL usa su propio stack de cocina fijado, por lo que los resultados no son directamente comparables con las cifras publicadas por Xiaomi.
- Dominio estrecho: entrenado para cocinas RoboCasa y tareas pick/place/open/close con el embodiment `panda_mobile`; no se documenta generalización a otros robots, escenas u objetos.
- Idioma: solo inglés (`en`); no hay evidencia de capacidades multilingües en esta configuración.
- Degradación por cuantización: no se han publicado comparativas NF4 frente a bf16 en tasa de éxito, de modo que se desconoce el coste real de la cuantización en precisión de manipulación.
- Latencia elevada: 120 s por chunk declarados hacen inviable cualquier uso en tiempo real fuera de simulación.
- Sesgos y alucinación: no documentados por el autor; al tratarse de una política de control, el modo de fallo relevante es la acción incorrecta, no la fabricación de texto.
- Uso comercial: permitido según el manifiesto (`is_commercial_use_allowed: yes`) y la licencia Apache-2.0, pero condicionado a la dependencia de OpenRAL Pro para pesos NF4.
- Madurez: versión 0.1.0, 24 descargas y 0 likes en el momento de la consulta; no hay señales de adopción comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-xr1-panda_mobile-robocasa-nf4
- Variante RoboCasa365: https://huggingface.co/OpenRAL/rskill-xr1-panda_mobile-robocasa365-nf4
- Modelo base upstream: https://huggingface.co/XiaomiRobotics/Xiaomi-Robotics-1-RoboCasa
- Paper XR-1 (arXiv): https://arxiv.org/abs/2607.15330
- Vídeo de rollout de ejemplo: https://huggingface.co/datasets/OpenRAL/website-media/resolve/main/benchmarks/robocasa-pick-place_xr1-nf4_fail/full.mp4
- Configuración de simulación citada: `scenes/sim/xr1_robocasa_pnp.yaml`
- Documentación de compatibilidad VLA citada: `docs/reference/vla_compatibility.md`

# OpenRAL/rskill-gr00t_n17-franka_panda-libero_spatial-bf16

## Resumen

`rskill-gr00t_n17-franka_panda-libero_spatial-bf16` es un paquete de pesos publicado por OpenRAL que envuelve el modelo `nvidia/GR00T-N1.7-LIBERO`, un modelo fundacional vision-language-action (VLA) de NVIDIA afinado sobre el benchmark LIBERO para el brazo robótico Franka Panda en simulación. El modelo base GR00T N1.7 parte de 3B parámetros (3.144.016.000 según los safetensors del repo) y emplea un backbone VLM Cosmos-Reason2-2B con codificador visual SigLip2, junto con una cabeza de acción de tipo difusión. El paquete añade un manifiesto `rskill.yaml` con comprobación de capacidades, exposición de licencia, presupuestos de latencia y registro local dentro del framework OpenRAL.

El interés de esta ficha está en que el checkpoint se distribuye cuantizado en NF4 (4 bits) para el backbone, manteniendo la cabeza de acción en bf16, de modo que el conjunto cabe en una GPU de 8 GB con un pico de unos 5,2 GiB. Es un caso representativo de empaquetado de modelos robóticos para despliegue en hardware de consumo, con contrato de observación explícito (dos vistas RGB de 224×224 y estado propioceptivo de 8 dimensiones) y emisión de chunks de 16 acciones de 7 dimensiones (delta end-effector 6-DoF más pinza).

La relevancia actual viene de la combinación de tres factores: la licencia NVIDIA Open Model License que permite uso comercial, la integración nativa con `lerobot` 0.6.0 mediante `GrootPolicy` en proceso, y la reproducción local declarada de una tasa de éxito media de 0,9 sobre las 10 tareas de LIBERO-Spatial (1 episodio por tarea, semilla 0, máximo 280 pasos). No obstante, conviene subrayar que el modelo está especializado en simulación y en un único embodiment, no en robots físicos genéricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con backbone VLM Cosmos-Reason2-2B (SigLip2 como codificador visual) y cabeza de acción de difusión; chunk de 16 acciones |
| Parametros totales | 3.144.016.000 (~3,1 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (int4) para el backbone en carga; cabeza de acción en bf16; pesos almacenados en bf16; el adaptador acepta `nf4`, `fp32` y `none` |
| Idiomas soportados | en (inglés) |
| Licencia | NVIDIA Open Model License Agreement (uso comercial permitido); el paquete rSkill (`rskill.yaml`, `README.md`) es Apache-2.0 |
| Formato de pesos | safetensors (repo de 6,9 GB) |
| Pipeline | robotics |
| Modelo base | `nvidia/GR00T-N1.7-LIBERO` (relación: quantized) |
| Runtime | PyTorch, in-process vía `lerobot` 0.6.0 `GrootPolicy` |
| Contrato de estado / acción | estado 8-D / acción 7-D (`delta_ee_6d_plus_gripper`) |
| Latencia presupuestada | 1500 ms por chunk |
| VRAM mínima declarada | `min_vram_gb: null` en manifiesto; pico real ~5,2 GiB con NF4 |
| Descargas / likes | 45 / 1 |

## Arquitectura y entrenamiento

GR00T N1.7 es un modelo fundacional cross-embodiment con propiocepción de dimensión variable y cabezas de acción específicas por embodiment. El backbone es un VLM Cosmos-Reason2-2B con codificador visual SigLip2; sobre él se monta una cabeza de acción de difusión que genera chunks de 16 acciones. El preentrenamiento del modelo base se realizó con 20.000 horas de vídeo humano EgoScale y demostraciones robóticas diversas; el checkpoint aquí empaquetado es un afinamiento del base N1.7 sobre la suite de tareas LIBERO con el embodiment Franka Panda, simulado en MuJoCo mediante robosuite. El paper de referencia es arXiv:2503.14734 (*GR00T N1: An Open Foundation Model for Generalist Humanoid Robots*).

El paquete OpenRAL no reentrena el modelo: repaqueta el subdirectorio `libero_spatial/` del repo upstream (que no tiene `model.safetensors` en la raíz) y añade un manifiesto con comprobación de capacidades, presupuesto de latencia y metadatos de licencia. La normalización de imágenes y estado se realiza dentro de los metadatos `experiment_cfg` del propio checkpoint GR00T, no mediante un pipeline de procesadores de lerobot, por lo que el manifiesto no incluye bloque `processors`. La cuantización NF4 se aplica solo al backbone en tiempo de carga; la cabeza de acción permanece en bf16. No se detallan en la información disponible innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones robóticas de manipulación: emite chunks de 16 acciones de 7 dimensiones (delta end-effector 6-DoF más pinza) a partir de dos vistas RGB y estado propioceptivo.
- Percepción visual multimodal: procesa dos cámaras RGB (agentview y wrist/end-effector) con resolución mínima de 224×224.
- Integración propioceptiva: consume un vector de estado de 8 dimensiones con la disposición de LIBERO (pose del end-effector más pinza).
- Control de manipulación en simulación: especializado en las 10 tareas de LIBERO-Spatial con Franka Panda en MuJoCo/robosuite.
- Ejecución in-process: se ejecuta dentro del framework OpenRAL mediante `lerobot` 0.6.0 `GrootPolicy`, sin sidecar fuera de proceso.
- Comprobación de capacidades y licencia: el manifiesto rSkill expone `embodiment_tags`, rol `s1` y postura de licencia para el registro local.
- Soporte de tool calling / function calling: no disponible (modelo de robótica, no de texto conversacional).
- Soporte de agentes multi-step: no disponible como tal; el modelo produce chunks de acción, no razonamiento multi-paso textual.
- Capacidades multilingües: solo inglés (`en`) según los metadatos.
- Modo thinking, visión general, audio: no disponible; la visión está limitada al contrato de dos cámaras del embodiment.

## Casos de uso

- Evaluación de políticas VLA en simulación: usar el checkpoint para reproducir las 10 tareas de LIBERO-Spatial con Franka Panda en MuJoCo/robosuite, comparando tasas de éxito con la referencia declarada de 0,9 y sirviendo de línea base para nuevas políticas.
- Investigación en manipulación con presupuesto de GPU ajustado: el pico de ~5,2 GiB con NF4 permite ejecutar experimentos en una GPU de 8 GB, lo que facilita iterar en estaciones de trabajo modestas sin renunciar a un modelo de 3B.
- Desarrollo de pipelines de robot learning con OpenRAL: integrar el rSkill en el registro local del framework para encadenar percepción, política y ejecución con contratos de estado/acción explícitos y presupuesto de latencia de 1500 ms por chunk.
- Benchmarking de cuantización: comparar el rendimiento NF4 frente a fp32 (con `OPENRAL_QUANTIZATION_DTYPE=fp32` en GPU de 16 GB o más) para medir la pérdida de tasa de éxito inducida por la cuantización del backbone.
- Prototipado de agentes robóticos en entornos simulados: emplear el modelo como política `s1` dentro de un agente OpenRAL para validar arquitecturas de control antes de trasladarlas a hardware físico.
- Docencia y formación en VLA: usar el paquete como ejemplo completo de contrato de observación (dos cámaras y estado 8-D), emisión de acciones 7-D y empaquetado con manifiesto, adecuado para cursos de robótica e IA.
- Pruebas de integración con `lerobot` 0.6.0: validar `GrootPolicy` en proceso y el flujo de normalización mediante `experiment_cfg` del checkpoint, sin pipeline de procesadores externo.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Condiciones |
|---|---|---|---|
| LIBERO-Spatial | Tasa de éxito media | 0,9 | 1 episodio por tarea, 10 tareas, semilla 0, máximo 280 pasos; `reproduced_locally: true` |
| Latencia por chunk | ms | 1500 (presupuesto) | Manifiesto rSkill |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni comparativas numéricas con otras políticas VLA sobre LIBERO.

## Requisitos de hardware

- VRAM estimada: ~5,2 GiB de pico con backbone en NF4 y cabeza de acción en bf16; el modelo sin empaquetar ocupa ~6 GB y no cabe junto en una GPU de 8 GB.
- GPU de 8 GB: viable con NF4 (configuración por defecto del paquete).
- GPU de 16 GB o más: puede omitirse el empaquetado con `OPENRAL_QUANTIZATION_DTYPE=fp32`; el adaptador solo acepta `nf4`, `fp32` y `none`, por lo que no existe ruta bf16.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible; el criterio indicado es el umbral de VRAM.
- Despliegue: runtime PyTorch in-process mediante `lerobot` 0.6.0 `GrootPolicy` dentro de OpenRAL; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia: presupuesto de 1500 ms por chunk de 16 acciones según el manifiesto; no se proporcionan cifras de throughput.
- Requisito de software: OpenRAL Pro para cargar pesos cuantizados (int4/NF4); la versión open source de OpenRAL solo carga fp32, fp16 y bf16 según ADR-0123.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rskill-gr00t_n17-franka_panda-libero_spatial-bf16 | ~3,1 B | no disponible | 0,9 de éxito medio en LIBERO-Spatial (1 episodio/tarea) | NVIDIA Open Model License (comercial permitido) | Hugging Face, repo de 6,9 GB, 45 descargas |
| nvidia/GR00T-N1.7-LIBERO (upstream) | ~3,1 B | no disponible | no disponible en la información | NVIDIA Open Model License | Hugging Face (checkpoint en subcarpeta `libero_spatial/`) |
| nvidia/GR00T-N1.7-3B (base) | ~3 B | no disponible | no disponible en la información | NVIDIA Open Model License | Hugging Face |

No se dispone en la información proporcionada de datos comparativos con otras familias VLA (por ejemplo, π0.5 o SmolVLA, mencionados solo como adaptadores existentes en OpenRAL) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Especialización estrecha: el checkpoint está afinado para el embodiment Franka Panda en simulación LIBERO; no debe esperarse generalización a robots físicos ni a otras morfologías sin reentrenamiento.
- Solo simulación: las evaluaciones y el contrato de observación corresponden a MuJoCo/robosuite; el traslado a hardware real no está validado en la información disponible.
- Evaluación limitada: la tasa de 0,9 se obtuvo con 1 episodio por tarea y semilla 0, por lo que la varianza estadística es alta y no debe interpretarse como una estimación robusta.
- Cuantización: el backbone en NF4 puede degradar la precisión respecto a fp32; no se documenta la magnitud de esa pérdida.
- Idioma: solo inglés en los metadatos; no hay soporte multilingüe declarado.
- Contexto: no se especifica longitud de contexto; el modelo opera sobre observaciones puntuales y chunks, no sobre diálogo largo.
- Dependencia de OpenRAL Pro: la carga de pesos cuantizados requiere el paquete de cuantización de OpenRAL Pro; la versión open source no carga int4/NF4.
- Licencia: los pesos se rigen por la NVIDIA Open Model License Agreement (uso comercial permitido), mientras que el manifiesto y el README del paquete son Apache-2.0; deben respetarse ambas condiciones por separado.
- Riesgo de alucinación: no aplica en el sentido conversacional, pero sí existe riesgo de acciones incorrectas o inseguras en manipulación; no se documentan sesgos específicos.
- Madurez: 45 descargas y 1 like indican adopción muy baja; el paquete es reciente (creado en junio de 2026) y su validación externa es escasa.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/OpenRAL/rskill-gr00t_n17-franka_panda-libero_spatial-bf16
- Repo GitHub del rSkill: https://github.com/OpenRAL/openral/tree/master/rskills/gr00t-n17-libero/
- Framework OpenRAL: https://github.com/OpenRAL/openral
- Modelo base en Hugging Face: https://huggingface.co/nvidia/GR00T-N1.7-LIBERO
- Modelo base N1.7-3B: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Paper GR00T N1: https://arxiv.org/abs/2503.14734
- Benchmark LIBERO: https://libero-project.github.io/

# OpenRAL/rskill-openwam_alpha-franka_panda-libero-bf16

## Resumen

OpenRAL/rskill-openwam_alpha-franka_panda-libero-bf16 es un paquete de habilidad robótica (rSkill) publicado por OpenRAL que empaqueta el modelo World Action Model OpenWAM-α, post-entrenado sobre los cuatro conjuntos de tareas del benchmark LIBERO. El modelo subyacente es un World Action Model que predice deltas nativos del efector final (EEF) y, de forma auxiliar, latentes de vídeo futuro que no se decodifican en despliegue. El paquete añade un manifiesto, un contrato de observaciones y un adaptador que traduce las salidas nativas del modelo al comando OSC de 7 dimensiones que espera el simulador LIBERO.

El modelo está especializado en el robot Franka Panda dentro del simulador MuJoCo de LIBERO, no en hardware real, y su idioma declarado es únicamente inglés. Se distribuye en bf16 con un requisito mínimo de 26 GB de VRAM y una latencia declarada de 1000 ms en el manifiesto, aunque la evaluación reportada en la model card mide 28 ms de mediana y 46 ms de máximo por paso en una Jetson AGX Thor.

Su relevancia es doble: por un lado, ofrece pesos y código upstream bajo Apache-2.0 con un rendimiento reportado del 99,3 % de media en LIBERO; por otro, ilustra el patrón de empaquetado rSkill de OpenRAL, donde el adaptador necesario para ejecutar el modelo (`openral-pro-wam`) queda bajo licencia comercial, lo que condiciona el uso práctico del paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World Action Model (OpenWAM-α); detalles internos de la red no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (único formato publicado en este paquete) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 (pesos y código upstream, manifiesto y card); adaptador `openral-pro-wam` bajo licencia comercial |
| Formato de pesos | checkpoint serializado con pickle (requiere `OPENRAL_ALLOW_UNSAFE_PICKLE=1`); pesos upstream referenciados vía `hf://OpenWAM/OpenWAM-Alpha-Sim-LIBERO@110b07e` |

## Arquitectura y entrenamiento

El paquete envuelve el modelo OpenWAM-α, un World Action Model post-entrenado sobre los cuatro conjuntos de LIBERO (libero_spatial, libero_object, libero_goal y libero_10) a partir del checkpoint `OpenWAM/OpenWAM-Alpha-Sim-LIBERO` en la revisión `110b07e`. Los datos de entrenamiento declarados son el dataset `HuggingFaceVLA/libero`. La arquitectura interna (número de parámetros, tipo de backbone, mecanismo de atención) no se detalla en la información disponible; el modelo produce dos salidas: deltas nativos del efector final, que el adaptador convierte al comando OSC de 7 dimensiones de LIBERO, y latentes de vídeo futuro que no se decodifican durante el despliegue.

La interfaz de observación es multimodal y explícita: dos cámaras RGB con resolución mínima de 256 × 256 (`observation.images.camera1` y `observation.images.camera2`) más un vector de propiocepción de 8 dimensiones (`libero_eef8d`: pose del EEF y qpos del gripper, con `panda_hand_tcp` en el marco `world`). La salida es un chunk de acciones de 32 pasos, con `chunk_size` y `n_action_steps` ambos a 32. El control se ejerce sobre dos articulaciones en posición absoluta más la posición del gripper en modo `normalized_close_symmetric`. No se especifican en la información disponible detalles sobre RLHF, DPO ni composición exacta del dataset más allá de su procedencia.

## Capacidades

- Predicción de acciones robóticas de manipulación para el Franka Panda en el simulador LIBERO, con salida de chunk de 32 pasos por inferencia.
- Generación de latentes de vídeo futuro como tarea auxiliar del World Action Model (no decodificadas en despliegue).
- Fusión de dos vistas RGB y propiocepción de 8 dimensiones en un único contrato de observación.
- Conversión interna de deltas nativos del EEF al comando OSC de 7 dimensiones de LIBERO mediante el adaptador.
- Cobertura de las cuatro suites de LIBERO (spatial, object, goal y 10) con un único checkpoint post-entrenado.
- No se declaran capacidades de tool calling, agentes multi-paso, razonamiento textual ni procesamiento de audio.
- Capacidad multilingüe: no disponible; el único idioma declarado es inglés.

## Casos de uso

- Evaluación de referencia en LIBERO: usar el paquete como baseline reproducible para comparar nuevas políticas de manipulación contra el 99,3 % reportado, aprovechando que cubre las cuatro suites con un solo checkpoint.
- Investigación en World Action Models: estudiar el efecto de los latentes de vídeo futuro como señal auxiliar de entrenamiento, ya que el modelo los predice aunque no se decodifiquen en despliegue.
- Desarrollo de adaptadores de acción: emplear el mapeo de deltas EEF a comando OSC de 7 dimensiones como plantilla para conectar modelos de acción nativos con simuladores que esperan comandos de espacio operacional.
- Validación de contratos de observación multimodales: probar pipelines que combinan dos cámaras RGB a 256 × 256 con propiocepción de 8 dimensiones, verificando el cumplimiento del contrato `libero_eef8d`.
- Despliegue en robótica embebida: la evaluación sobre Jetson AGX Thor con 28 ms de mediana por paso sirve como referencia para estimar viabilidad en plataformas con presupuesto energético limitado.
- Pruebas de integración de extremo a extremo: ejecutar `openral benchmark run` para validar la cadena completa (manifiesto, adaptador, simulador) antes de sustituir el modelo por una política propia.
- Estudio de seguridad de checkpoints: el requisito de `OPENRAL_ALLOW_UNSAFE_PICKLE=1` convierte al paquete en un caso práctico para diseñar políticas de confianza en la carga de pesos serializados con pickle.

## Benchmarks y rendimiento

Evaluación reportada en la model card, ejecutada con `openral benchmark run` sobre Jetson AGX Thor (bf16, compilación desactivada), 1 episodio por tarea, 10 tareas por suite, semilla 0, el 2026-10-29:

| Suite | Éxito medido | Publicado |
|---|---|---|
| libero_spatial | 10/10 | — |
| libero_object | 9/10 (el fallo alcanzó el límite de 280 pasos) | — |
| libero_goal | 9/10 (el fallo alcanzó el límite de 300 pasos) | — |
| libero_10 | 10/10 | — |
| Total | 38/40 (95 %) | 99,3 % de media |

Latencia por paso: 28 ms de mediana y 46 ms de máximo (medias por episodio). No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, por tratarse de un modelo de robótica sin capacidades de lenguaje general declaradas.

## Requisitos de hardware

- VRAM mínima declarada en el manifiesto: 26 GB en bf16.
- GPU recomendadas: no se especifican modelos concretos; por el requisito de 26 GB encajan A100 40/80 GB, H100 y L40S. Una RTX 4090 (24 GB) queda por debajo del mínimo declarado.
- Cabe en GPU de consumo: no, según el mínimo de 26 GB; se requeriría cuantización adicional no publicada en este paquete.
- Plataforma validada: Jetson AGX Thor con bf16 y compilación desactivada, según la evaluación reportada.
- Opciones de despliegue: runtime PyTorch a través del adaptador `openral-pro-wam` (instalación con `uv sync --package openral-pro-wam --extra openwam`). No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 28 ms de mediana y 46 ms de máximo por paso medidos en Jetson AGX Thor; el manifiesto declara 1000 ms como valor de referencia, superior a lo medido.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, más allá de la referencia al checkpoint upstream `OpenWAM/OpenWAM-Alpha-Sim-LIBERO`, que es la misma familia y no un competidor. Comparativa con alternativas: no disponible.

## Limitaciones y advertencias

- Especializado exclusivamente en el Franka Panda dentro del simulador MuJoCo de LIBERO; no hay evidencia de transferencia a hardware real ni a otros robots.
- Idioma declarado únicamente inglés; no se contemplan entradas en otros idiomas.
- El checkpoint se deserializa con pickle, lo que ejecuta código del archivo: requiere `OPENRAL_ALLOW_UNSAFE_PICKLE=1` y solo debe cargarse de fuentes de confianza.
- El adaptador necesario para ejecutar el modelo (`openral-pro-wam`) está bajo licencia comercial de OpenRAL Pro, aunque pesos, código upstream y manifiesto sean Apache-2.0; esto limita el uso comercial sin acuerdo con OpenRAL.
- La evaluación reportada usa 1 episodio por tarea, 10 tareas por suite y semilla 0, una muestra pequeña que no permite estimar varianza; el 95 % medido queda por debajo del 99,3 % publicado.
- Dos de los cuatro fallos se debieron a alcanzar los límites de pasos (280 y 300), lo que sugiere sensibilidad a la configuración de horizonte de la tarea.
- No se documentan parámetros totales, arquitectura interna ni composición del dataset de entrenamiento, lo que dificulta el análisis de sesgos y de robustez.
- Riesgo de alucinación en el sentido habitual del término no aplica; el riesgo análogo es la generación de trayectorias inválidas fuera de la distribución de LIBERO, no cuantificado en la información disponible.
- No se declaran resultados de benchmarks más allá de LIBERO; cualquier extrapolación a otras tareas de manipulación carece de respaldo empírico en la documentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-openwam_alpha-franka_panda-libero-bf16
- Checkpoint upstream: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Sim-LIBERO
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceVLA/libero
- Paper: https://arxiv.org/abs/2609.07398

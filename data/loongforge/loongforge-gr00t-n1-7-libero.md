# LoongForge/LoongForge-GR00T-N1.7-LIBERO

## Resumen
LoongForge-GR00T-N1.7-LIBERO es una colección de cuatro checkpoints de ajuste fino supervisado (SFT) del modelo vision-language-action (VLA) abierto `nvidia/GR00T-N1.7-3B`, entrenados por LoongForge (Baidu) para el benchmark de manipulación robótica LIBERO. Cada checkpoint corresponde a una suite independiente (`libero_spatial`, `libero_object`, `libero_goal`, `libero_10`) y reproduce la receta oficial `examples/LIBERO` de NVIDIA Isaac-GR00T dentro del stack de entrenamiento LoongForge.

El modelo combina un backbone vision-language `nvidia/Cosmos-Reason2-2B` (basado en Qwen3-VL) que condiciona una cabeza de acción basada en un transformer de difusión con flow matching (DiT). La política recibe la instrucción de tarea, una vista de cámara exterior, una vista de muñeca y el estado del robot (8 dimensiones), y emite comandos delta de efector final de 7 dimensiones en trozos de 16 pasos.

Es relevante porque demuestra que la receta de ajuste fino de GR00T-N1.7 para LIBERO es reproducible fuera del ecosistema oficial de NVIDIA, con hiperparámetros y estadísticas de normalización documentados, y porque publica los cuatro checkpoints con sus datos de entrenamiento asociados (LeRobot v2.1) para facilitar la comparación y la evaluación estandarizada en manipulación robótica simulada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone vision-language (Qwen3-VL / Cosmos-Reason2-2B) + cabeza de acción DiT con flow matching |
| Parametros totales | 3.455.180.928 por checkpoint (1.031 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; evaluación con bf16 opcional) |
| Idiomas soportados | en |
| Licencia | nvidia-open-model-license |
| Formato de pesos | `pytorch_model.pt` (state dict único, FP32, ~12,5 GB) |

## Arquitectura y entrenamiento
La arquitectura es un VLA híbrido: un backbone vision-language `nvidia/Cosmos-Reason2-2B` (familia Qwen3-VL) procesa las imágenes y la instrucción de lenguaje, y su salida condiciona una cabeza de acción basada en un transformer de difusión (DiT) con flow matching que decodifica un chunk de 16 acciones futuras. Las acciones son comandos delta de efector final de 7 dimensiones (traslación 3, rotación en eje-ángulo 3, pinza 1) en el espacio `OSC_POSE`. El estado del robot tiene 8 dimensiones: posición del EEF (3), orientación como eje-ángulo a partir del cuaternión (3) y las dos articulaciones de los dedos de la pinza (2).

El entrenamiento es un SFT sobre `nvidia/GR00T-N1.7-3B` con 20.000 iteraciones, batch global de 640 (80 × 8 GPUs, sin acumulación de gradiente), LR base 1e-4 con decaimiento coseno y 1.000 iteraciones de warmup, weight decay 1e-5 (excluyendo bias y norm), grad clip 1.0, semilla 42, bf16 y DDP. Se congelan el LLM y la torre visual y se entrenan el proyector, el DiT y las normas de las capas VL. Se aplica state dropout de 0.2 tanto en datos como en modelo. La normalización usa percentiles q01/q99 con recorte de outliers mediante el `dataset_statistics.json` de cada checkpoint. Los datos son los cuatro datasets `*_no_noops_1.0.0_lerobot` (LeRobot v2.1, 20 fps, `robot_type=franka`): spatial (432 episodios, 52.970 frames), object (454 episodios, 66.984 frames), goal (428 episodios, 52.042 frames) y libero_10 (379 episodios, 101.469 frames).

## Capacidades
- Generación de acciones robóticas de manipulación a partir de instrucciones en lenguaje natural e imágenes.
- Percepción visual multi-cámara: vista exterior (`image`) y vista de muñeca (`wrist_image`), preprocesadas a 256 × 256 con recorte central 230 × 230 y `crop_fraction` 0.95.
- Condicionamiento en el estado propioceptivo del robot (posición, orientación y pinza).
- Decodificación de chunks de 16 acciones con replanificación cada 8 pasos ejecutados.
- Control en espacio de efector final (`OSC_POSE`) con comandos delta.
- Especialización por suite: cada checkpoint está ajustado a una de las cuatro suites de LIBERO (spatial, object, goal, 10 tareas largas).
- Etiqueta de embodiment `libero_sim` para integración con el cliente de evaluación de LIBERO.
- No soporta tool calling, agentes multi-paso ni otras capacidades de texto general: es una política robótica, no un LLM de propósito general.

## Casos de uso
- Evaluación estandarizada en LIBERO: ejecutar cada checkpoint con la pila de evaluación de LoongForge (`examples/embodied/groot_n1_7/eval/configs/libero`) para obtener métricas comparables con la release oficial `nvidia/GR00T-N1.7-LIBERO` en las cuatro suites.
- Reproducción de experimentos: usar los hiperparámetros y estadísticas de normalización documentados para replicar la receta SFT de GR00T-N1.7 en LIBERO con otro stack de entrenamiento.
- Investigación en manipulación de largo horizonte: el checkpoint `libero_10` (379 episodios, 101.469 frames) está orientado a tareas de 10 pasos donde la planificación visual y la consistencia del chunk de acciones son críticas.
- Benchmarking de nuevas cabezas de acción o métodos de flow matching: al estar el backbone congelado y ser la cabeza DiT entrenable, sirve como base controlada para comparar variantes de decodificación de acciones.
- Estudio de robustez ante dropout de estado: el entrenamiento con `state-dropout-prob 0.2` permite analizar el comportamiento de la política cuando la propiocepción es ruidosa o parcialmente disponible.
- Integración en pipelines de simulación Franka: los datos y acciones están en formato LeRobot v2.1 con `robot_type=franka`, lo que facilita reutilizar el modelo en entornos simulados compatibles con esa interfaz.
- Análisis de generalización entre suites: comparar los cuatro checkpoints (spatial, object, goal, 10) para estudiar cuánto se transfiere el ajuste fino entre distribuciones de tareas distintas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: los pesos se publican en FP32 (~12,5 GB por checkpoint); con bf16 el peso ronda los 6,3 GB, más el overhead de activaciones y del backbone Cosmos-Reason2-2B.
- GPU recomendadas: A100, H100 o GPUs con al menos 24 GB de VRAM para FP32; una RTX 4090 (24 GB) es viable en bf16.
- Cabe en GPU consumer: sí, en bf16 con 24 GB o más; en FP32 requiere GPUs de 40 GB o superiores.
- Opciones de despliegue: la evaluación se realiza con la pila propia de LoongForge (`backend: loongforge`, `model_type: Gr00tN1d7`), que carga los checkpoints mediante su configuración explícita; `config.json` es solo metadatos descriptivos y no es una configuración de `AutoModel` de Transformers.
- Latencia y throughput: no disponible.
- Entrenamiento de referencia: 8 GPUs con batch global de 640, 20.000 iteraciones, bf16 y DDP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LoongForge-GR00T-N1.7-LIBERO | 3,46 B por checkpoint | no disponible | nvidia-open-model-license | Hugging Face (LoongForge) | Cuatro SFT independientes, uno por suite LIBERO |
| nvidia/GR00T-N1.7-LIBERO | no disponible | no disponible | nvidia-open-model-license | Hugging Face (NVIDIA) | Release oficial que este modelo reproduce |
| nvidia/GR00T-N1.7-3B | 3 B (según nombre) | no disponible | nvidia-open-model-license | Hugging Face (NVIDIA) | Modelo base preentrenado antes del SFT en LIBERO |
| nvidia/Cosmos-Reason2-2B | 2 B (según nombre) | no disponible | no disponible | Hugging Face (NVIDIA) | Backbone vision-language (Qwen3-VL) usado por GR00T-N1.7 |

## Limitaciones y advertencias
- Es una política robótica especializada: no es un modelo de lenguaje general y no debe usarse para generación de texto, código o tareas conversacionales.
- Cada checkpoint está ajustado a una única suite de LIBERO; no se documenta transferencia entre suites ni a robots reales.
- El dominio de entrada está fijado al embodiment `libero_sim` con `robot_type=franka`; usarlo con otra morfología o cámara requiere adaptación.
- Los pesos se distribuyen en FP32 sin versiones cuantizadas publicadas; el despliegue en hardware limitado exige conversión manual.
- Idiomas: solo inglés (`en`) en las instrucciones de tarea.
- Licencia `nvidia-open-model-license`: revisar sus términos antes de uso comercial, ya que no es una licencia permisiva estándar (Apache/MIT).
- `config.json` no es una configuración de Transformers; intentar cargar el checkpoint con `AutoModel` fallará.
- Riesgo de alucinación de acciones: como toda política generativa, puede producir trayectorias plausibles pero incorrectas ante distribuciones de entrada fuera del dataset de entrenamiento.
- No se han publicado resultados de benchmarks ni análisis de sesgos en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces
- [Hugging Face: LoongForge/LoongForge-GR00T-N1.7-LIBERO](https://huggingface.co/LoongForge/LoongForge-GR00T-N1.7-LIBERO)
- [Modelo base: nvidia/GR00T-N1.7-3B](https://huggingface.co/nvidia/GR00T-N1.7-3B)
- [Backbone: nvidia/Cosmos-Reason2-2B](https://huggingface.co/nvidia/Cosmos-Reason2-2B)
- [Release oficial: nvidia/GR00T-N1.7-LIBERO](https://huggingface.co/nvidia/GR00T-N1.7-LIBERO)
- [LoongForge (GitHub)](https://github.com/baidu-baige/LoongForge)
- [Configs de evaluación LIBERO en LoongForge](https://github.com/baidu-baige/LoongForge/tree/master/examples/embodied/groot_n1_7/eval/configs/libero)
- [NVIDIA Isaac-GR00T (GitHub)](https://github.com/NVIDIA/Isaac-GR00T)
- [LIBERO (GitHub)](https://github.com/Lifelong-Robot-Learning/LIBERO)
- [Dataset: IPEC-COMMUNITY/libero_spatial_no_noops_1.0.0_lerobot](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_spatial_no_noops_1.0.0_lerobot)
- [Dataset: IPEC-COMMUNITY/libero_object_no_noops_1.0.0_lerobot](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_object_no_noops_1.0.0_lerobot)
- [Dataset: IPEC-COMMUNITY/libero_goal_no_noops_1.0.0_lerobot](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_goal_no_noops_1.0.0_lerobot)
- [Dataset: IPEC-COMMUNITY/libero_10_no_noops_1.0.0_lerobot](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_10_no_noops_1.0.0_lerobot)

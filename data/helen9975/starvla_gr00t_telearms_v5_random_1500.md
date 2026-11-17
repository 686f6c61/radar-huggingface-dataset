# helen9975/starvla_gr00t_telearms_v5_random_1500

## Resumen

`starvla_gr00t_telearms_v5_random_1500` es un checkpoint de política robótica (vision-language-action, VLA) publicado por el usuario `helen9975` bajo el framework StarVLA. Se trata de un ajuste fino completo del backbone `Qwen/Qwen2.5-VL-3B-Instruct` (incluido el codificador visual) combinado con una cabeza de acción de tipo GR00T, entrenado sobre el dataset `mliu48/telearms-yam-cube-v5-exp-random-1500`. El modelo genera acciones articulares de 14 dimensiones para un robot bimanual YAM simulado, a partir de tres cámaras de 224x224 y del estado propioceptivo.

El entrenamiento abarca 15.000 demostraciones simuladas (10 tareas x 1.500 episodios), 14.340.545 fotogramas a 30 Hz, con un presupuesto de 15,36 millones de muestras (160.000 pasos con batch global 96 en 8 x H100). Es uno de cinco cabezas de acción StarVLA entrenadas con el mismo backbone y el mismo presupuesto que las variantes pi0.5 y MolmoAct2 Random-1500, lo que lo convierte en una pieza de un estudio comparativo interno más que en un modelo listo para producción.

Su relevancia es acotada: no se ha evaluado en simulación, no declara licencia ni idiomas y no incluye benchmarks. Es útil como referencia técnica para quienes investigan políticas VLA bimanuales, ajuste fino completo de Qwen2.5-VL y cabezas de difusión para acción, pero no debe considerarse un modelo validado para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone Qwen2.5-VL-3B-Instruct (vision-language) + cabeza de acción GR00T (StarVLA QwenGR00T) |
| Parametros totales | 3B en el backbone (tamaño total del checkpoint no declarado; repo de 8,8 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publica `pytorch_model.pt` en fp32/bf16 presumiblemente; no se declara) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.pt` (state dict de StarVLA) + `config.yaml` / `config.full.yaml` |
| Entradas | 3 cámaras 224x224 (front, left wrist, right wrist) + estado propioceptivo 14-D |
| Salidas | Acciones articulares absolutas 14-D (6 joints por brazo + gripper), chunks de 30 pasos |
| Dataset de entrenamiento | `mliu48/telearms-yam-cube-v5-exp-random-1500` (15.000 demos, 14.340.545 frames, 30 Hz) |
| Checkpoint | step 160.000 (15,36M muestras) |

## Arquitectura y entrenamiento

El modelo sigue el patrón StarVLA QwenGR00T: un backbone vision-language Qwen2.5-VL-3B-Instruct que procesa las tres vistas de cámara junto con el estado propioceptivo de 14 dimensiones, y una cabeza de acción de tipo GR00T que produce chunks de 30 pasos de acciones articulares absolutas de 14 dimensiones. La normalización de acciones usa cuantil q99 y las estadísticas para des-normalizar se guardan en `dataset_statistics.json`. El ajuste fino es completo, incluido el codificador visual, lo que explica el tamaño del repositorio (8,8 GB).

El entrenamiento se realizó en 8 x H100 con ZeRO-2, batch de 12 por GPU (global 96), durante 160.000 pasos (15,36M muestras), con LR 1e-5 para el VLM y 1e-4 para la cabeza de acción, 1.000 pasos de warmup, scheduler coseno hasta 5e-7 y AdamW (0,9, 0,95). La pérdida de acción (`action_dit_loss`) al paso 160.000 es 0,0046. El dataset contiene 15.000 demostraciones simuladas de un robot bimanual YAM (10 tareas x 1.500 episodios) sin domain randomization. El código corresponde a `starVLA_dev` en el commit `13d8ad4` más una configuración local `examples/TelearmsYAM`.

## Capacidades

- Generación de acciones articulares bimanuales de 14 dimensiones (6 joints + gripper por brazo) en chunks de 30 pasos.
- Percepción visual multi-cámara: tres vistas simultáneas (frontal y dos muñecas) a 224x224.
- Condicionamiento por estado propioceptivo de 14 dimensiones.
- Comprensión de instrucciones en lenguaje natural heredada del backbone Qwen2.5-VL-3B-Instruct (capacidad no validada en esta política).
- Ejecución de tareas simuladas de manipulación bimanual (10 tareas del dataset telearms-yam-cube-v5).
- No se declara soporte de tool calling, agentes, thinking mode, audio ni otras capacidades del backbone más allá de las necesarias para la política.

## Casos de uso

- Investigación en políticas VLA bimanuales: servir como checkpoint de referencia para comparar cabezas de acción (GR00T frente a pi0.5 y MolmoAct2) bajo el mismo backbone y presupuesto de muestras.
- Reproducción de experimentos StarVLA: el repo incluye `config.yaml` y `config.full.yaml` resueltos, lo que permite replicar el entrenamiento con el commit `13d8ad4`.
- Ajuste fino sobre nuevas tareas simuladas: al ser un fine-tune completo de Qwen2.5-VL-3B, puede reutilizarse como inicialización para otros datasets bimanuales YAM.
- Estudio de normalización de acciones: el uso de cuantil q99 y `dataset_statistics.json` sirve como ejemplo reproducible de pipeline de normalización/des-normalización.
- Benchmarking interno de cabezas de acción: útil para medir la pérdida de acción y la estabilidad de entrenamiento en un entorno controlado (8 x H100, ZeRO-2).
- Docencia y divulgación técnica: ejemplo completo de pipeline VLA con backbone VLM, múltiples cámaras y estado propioceptivo, con hiperparámetros documentados.
- No es adecuado para despliegue en robot real sin evaluación previa, dado que no se ha evaluado ni en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de entrenamiento (`action_dit_loss` = 0,0046 en el paso 160.000) y declara explícitamente que el modelo aún no se ha evaluado en simulación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un backbone de 3B en bf16 requiere aproximadamente 6-7 GB solo para pesos; el checkpoint completo en el repo ocupa 8,8 GB.
- GPU recomendadas: el entrenamiento se realizó en 8 x H100; para inferencia se desconoce la configuración mínima validada.
- Cabe en GPU de consumo: no confirmado; un modelo de 3B en bf16 podría caber en GPUs con 12-16 GB o más, pero no hay validación publicada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El formato es un state dict de PyTorch (`pytorch_model.pt`) que requiere el código de StarVLA para cargarse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Backbone | Parámetros | Contexto | Licencia | Evaluación | Disponibilidad |
|---|---|---|---|---|---|---|
| starvla_gr00t_telearms_v5_random_1500 | Qwen2.5-VL-3B-Instruct | 3B (backbone) | no disponible | no disponible | no evaluado en simulación | HF, state dict StarVLA |
| StarVLA pi0.5 Random-1500 | no disponible | no disponible | no disponible | no disponible | no disponible | mencionado en la model card, sin enlace |
| StarVLA MolmoAct2 Random-1500 | no disponible | no disponible | no disponible | no disponible | no disponible | mencionado en la model card, sin enlace |
| Qwen2.5-VL-3B-Instruct (base) | Qwen2.5-VL | 3B | no disponible en esta ficha | no disponible en esta ficha | benchmarks públicos del modelo base | HF |

Las variantes pi0.5 y MolmoAct2 se citan como comparables por compartir backbone y presupuesto de muestras, pero no se dispone de sus especificaciones ni resultados en la información proporcionada.

## Limitaciones y advertencias

- No se ha evaluado en simulación ni en robot real; no hay evidencia de rendimiento de la política.
- Solo entrena sobre un dataset simulado concreto (telearms-yam-cube-v5), sin domain randomization, por lo que la transferencia a entornos reales es incierta.
- Licencia no declarada: no se puede asumir uso comercial ni redistribución.
- Idiomas no declarados; las capacidades multilingües del backbone no están validadas en esta política.
- Riesgo de alucinación y de acciones fuera de distribución no cuantificado.
- Requiere el código de StarVLA (`starVLA_dev` @ `13d8ad4`) y la configuración `examples/TelearmsYAM` para cargarse; no es un checkpoint autónomo tipo transformers.
- El checkpoint corresponde a un paso intermedio de un estudio comparativo (step 160.000) y no a un modelo final pulido.
- Sin datos de sesgos, robustez ni seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/helen9975/starvla_gr00t_telearms_v5_random_1500
- Dataset: https://huggingface.co/datasets/mliu48/telearms-yam-cube-v5-exp-random-1500
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Repositorio StarVLA: https://github.com/starVLA/starVLA

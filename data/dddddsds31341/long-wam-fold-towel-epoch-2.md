# dddddsds31341/Long-WAM-Fold-Towel-Epoch-2

## Resumen

Long-WAM Fold Towel — Epoch 2 es un checkpoint de evaluación derivado del modelo base Efficient-Large-Model/Long-WAM-YAM, un modelo de robotica (visión-lenguaje-acción) para control bimanual. Lo publica el usuario dddddsds31341 como parte de un fine-tune independiente sobre la tarea de doblar una toalla larga con dos brazos robóticos. Corresponde a la época 2 de 10 (paso de optimizador 4132) de un entrenamiento que arranca directamente desde Long-WAM-YAM, sin continuar el fine-tune de otra tarea.

El modelo resuelve una tarea muy concreta de manipulación: con un gripper en cada extremo de la toalla, levantarla y doblarla en dirección de borde corto, borde largo y de nuevo borde corto, y finalmente alinearla y alisarla. La entrada combina tres cámaras RGB (top_head, hand_left, hand_right) con instrucciones de texto, y la salida es una secuencia de acciones de 32 pasos en forma de objetivos articulares absolutos de 14 dimensiones (6 articulaciones + gripper por brazo).

Su relevancia es acotada: no es un modelo de propósito general ni un checkpoint listo para producción, sino un peso intermedio de investigación para reproducir y evaluar el pipeline Long-WAM en una tarea de doblado bimanual. El repositorio ocupa 12 GB e incluye el modelo conjunto de vídeo/acción junto con el codificador de propiocepción, pero no el estado del optimizador ni resultados de éxito en bucle cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto de vídeo y acción (joint video/action model) con codificador de propiocepción, basado en Long-WAM / NVlabs LongLive |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (historial de vídeo P48 y chunk de acción de 32 pasos como configuración de inferencia) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt` con el dtype del entrenamiento, BF16 en entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | other (se remite a la licencia del modelo base Long-WAM-YAM) |
| Formato de pesos | `model.pt` (PyTorch), más `config.yaml`, `dataset_stats.json`, `code.zip` y `requirements-sip.txt` |

## Arquitectura y entrenamiento

El checkpoint pertenece a la familia Long-WAM, que combina un modelo de vídeo generativo con un cabezal de acción y un codificador de propiocepción. El código de entrenamiento incluido es la release SIP v34, basada en `NVlabs/LongLive@cfa4e91eec59429d583326500bf5535c9ce6eec7` con los cambios SIP. La configuración usa tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) con un layout de vídeo procesado de 384×320, historial P48 y un chunk de acción de 32 pasos. Las acciones son objetivos articulares absolutos de 14 dimensiones con unidades de gripper originales, ordenadas como 6 articulaciones + gripper izquierdo y 6 articulaciones + gripper derecho.

El entrenamiento se hizo sobre el dataset `yuyingyinya/fold_towel` (revisión `48cf95e0d1594940d4160f5cde7e8070c221904e`), con 100 demostraciones y 99.151 fotogramas a 30 Hz, usando todas las demostraciones para entrenamiento. Se emplearon cuatro GPUs, batch de 12 por GPU y batch global de 48, con AdamW, learning rate constante de 1e-5, weight decay 0.01, BF16 y DeepSpeed ZeRO-1. Cada época supone 2.066 actualizaciones del optimizador y la ejecución completa apunta a 20.660 actualizaciones. Se aplican estadísticas z-score específicas de la tarea y el recorte oficial de valores normalizados en `[-5, 5]`. No se documenta RLHF ni DPO; el entrenamiento es de imitación supervisada sobre demostraciones.

## Capacidades

- Control bimanual de robot: genera acciones de 14 dimensiones (6 articulaciones + gripper por brazo) para ejecutar el doblado de una toalla larga.
- Percepción multimodal: consume tres flujos RGB (`top_head`, `hand_left`, `hand_right`) junto con el estado de propiocepción.
- Condicionamiento por instrucción de texto: la tarea se especifica mediante una instrucción en lenguaje natural sobre la secuencia de doblado.
- Predicción de chunks de acción: emite secuencias de 32 pasos en lugar de acciones individuales.
- Historial temporal: utiliza un historial de vídeo P48 para mantener coherencia temporal durante la manipulación.
- No se documentan capacidades de tool calling, razonamiento multi-paso, generación de código, matemáticas ni audio.
- No se documenta soporte multilingüe; el idioma de la instrucción no está especificado.

## Casos de uso

- Reproducción de experimentos de doblado bimanual: sirve para reanudar la evaluación en la época 2 y comparar la evolución del entrenamiento frente a checkpoints posteriores del mismo run.
- Evaluación de pipelines de imitación en robotica: permite validar el flujo de carga (`load_run_config`, `load_model` con `expected_step=4132` y `strict=True`) y la integración con el VAE Wan2.2 y el codificador de texto UMT5.
- Investigación en modelos conjuntos de vídeo y acción: útil para estudiar cómo un modelo generativo de vídeo se adapta a la predicción de acciones en una tarea de manipulación de tejidos deformables.
- Análisis de estabilidad del entrenamiento: al ser un checkpoint intermedio con pérdida registrada en W&B, permite examinar la curva de aprendizaje antes de llegar a las 10 épocas.
- Desarrollo de adaptadores de robot: sirve como referencia para implementar el adaptador robótico correspondiente y las convenciones de acción/gripper de 14 dimensiones.
- Docencia y divulgación: ejemplo concreto de fine-tune de un modelo visión-lenguaje-acción sobre un dataset pequeño (100 demostraciones) para ilustrar el ciclo completo de entrenamiento y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el checkpoint ha pasado comprobaciones de carga de ficheros en CPU, pero no se reporta tasa de éxito en bucle cerrado ni resultados de validación en un conjunto reservado. La pérdida de entrenamiento no se considera una métrica de éxito en la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12 GB, pero el tamaño del modelo en memoria no se detalla.
- GPU recomendadas: no disponible. El entrenamiento usó cuatro GPUs con BF16 y DeepSpeed ZeRO-1, pero no se especifica el modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no es un modelo estándar de Transformers (`from_pretrained` no es aplicable). Requiere el checkout de Long-WAM incluido en `code.zip` y los assets externos Wan2.2 VAE, UMT5 y tokenizer.
- Latencia y throughput: no disponibles.
- Variables de entorno relevantes: `LONGWAM_MODEL_ROOT` para la raíz de assets del modelo, y actualización de rutas de datos, estadísticas y caché para el punto de entrada de evaluación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM-Fold-Towel-Epoch-2 (este) | no disponible | no disponible (P48 historial, chunk 32) | Doblado bimanual de toalla, época 2 | other | Hugging Face, 18 descargas |
| Long-WAM-Fold-Towel-3Epoch-20261030-Step-2066 | no disponible | no disponible | Doblado bimanual, run separado, paso 2066 | other | Hugging Face |
| Long-WAM-Fold-Towel-3Epoch-20261030-Step-4132 | no disponible | no disponible | Doblado bimanual, run separado, paso 4132 | other | Hugging Face |
| Efficient-Large-Model/Long-WAM-YAM (base) | no disponible | no disponible | Modelo base visión-lenguaje-acción | other | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos checkpoints; la comparación se limita a la procedencia del run y al paso de optimizador.

## Limitaciones y advertencias

- Checkpoint de evaluación intermedio (época 2 de 10): no representa el modelo final y no se ha validado su éxito en bucle cerrado.
- No incluye estado del optimizador ni del scheduler, por lo que no permite reanudar el entrenamiento de forma exacta.
- No es un modelo autónomo de Transformers: requiere el código Long-WAM, los assets Wan2.2 VAE y UMT5, y la configuración y estadísticas de normalización del mismo repositorio.
- Dependencia de rutas y convenciones: la configuración conserva rutas del sistema de ficheros SIP; en otra máquina hay que redefinir `LONGWAM_MODEL_ROOT` y las rutas de datos.
- Tarea única y estrecha: solo está entrenado para el doblado de toalla con una instrucción y una morfología de robot concretas; no generaliza a otras tareas sin fine-tune.
- Licencia "other": las condiciones de uso comercial dependen de la licencia del modelo base Long-WAM-YAM, que debe consultarse antes de cualquier despliegue.
- Riesgo de alucinación y sesgos: no evaluado ni documentado en la información disponible.
- Dataset pequeño (100 demostraciones): posible sobreajuste y baja robustez ante variaciones de iluminación, textura o posición inicial.
- Sin métricas de éxito ni validación reservada: la pérdida de entrenamiento no es indicativa del rendimiento real del robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Fold-Towel-Epoch-2
- Modelo base Long-WAM-YAM: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Checkpoint relacionado (paso 2066): https://huggingface.co/dddddsds31341/Long-WAM-Fold-Towel-3Epoch-20261030-Step-2066
- Checkpoint relacionado (paso 4132): https://huggingface.co/dddddsds31341/Long-WAM-Fold-Towel-3Epoch-20261030-Step-4132
- Registro de entrenamiento en W&B: https://forge.coreweave.com/wandb/bofang/long-wam/runs/xw0bcxta
- Repositorio base del código (LongLive): https://github.com/NVlabs/LongLive

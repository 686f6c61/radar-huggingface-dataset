# dddddsds31341/Long-WAM-Fold-Towel-Epoch-3

## Resumen

Long-WAM-Fold-Towel-Epoch-3 es un checkpoint de evaluación de un ajuste fino independiente del modelo robótico Long-WAM-YAM, desarrollado por el usuario dddddsds31341. Se trata de un modelo de política visuomotora (vision-language-action) orientado a la manipulación bimanual, concretamente a la tarea de doblar una toalla larga con dos pinzas. El checkpoint corresponde a la época 3 de 10 de un entrenamiento que parte de Efficient-Large-Model/Long-WAM-YAM y no continúa el ajuste fino de otra tarea.

El modelo combina un modelo conjunto de vídeo y acción con un codificador de propriocepción, y se apoya en componentes de Wan2.2 (VAE) y UMT5 (codificador de texto y tokenizador) que deben obtenerse por separado. No es un modelo de Transformers estándar cargable con `from_pretrained`, sino un artefacto de investigación empaquetado con su propio código (SIP release v34, basado en NVlabs/LongLive) y estadísticas de normalización específicas de la tarea.

Su relevancia es acotada: se publica como pesos de evaluación de una ejecución concreta, sin resultados de éxito en bucle cerrado ni validación retenida reportados. Es útil para reproducir o inspeccionar el estado del entrenamiento en el paso 6198, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto vídeo/acción (long-wam) con codificador de propriocepción; basado en NVlabs/LongLive y componentes Wan2.2 VAE + UMT5 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (historial de vídeo P48 y chunk de acción de 32 pasos) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt` en el dtype de almacenamiento del paso) |
| Idiomas soportados | no disponible |
| Licencia | other (metadatos del modelo base en Efficient-Large-Model/Long-WAM-YAM) |
| Formato de pesos | `model.pt` (PyTorch), más `config.yaml`, `dataset_stats.json`, `code.zip`, `requirements-sip.txt` |

## Arquitectura y entrenamiento

El modelo es un policy de robótica bimanual que procesa tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) en un layout de vídeo de 384×320, con historial P48 y predicción de chunks de acción de 32 pasos. La salida son objetivos de articulación absolutos de 14 dimensiones (6 articulaciones + pinza por brazo, en unidades originales de la pinza), con estadísticas z-score específicas de la tarea y recorte oficial de valores normalizados en `[-5, 5]`. Se apoya en el VAE de Wan2.2 y en el codificador de texto y tokenizador UMT5, que no se incluyen en el repositorio.

El entrenamiento parte de Efficient-Large-Model/Long-WAM-YAM y usa el dataset `yuyingyinya/fold_towel` (revisión `48cf95e0d1594940d4160f5cde7e8070c221904e`): 100 demostraciones, 99.151 fotogramas a 30 Hz, todos empleados en entrenamiento. Se ejecutó en cuatro GPUs con batch de 12 por GPU y acumulación 1 (batch global 48), tasa de aprendizaje constante de 1e-5, AdamW con weight decay 0.01, BF16 y DeepSpeed ZeRO-1. Cada época supone 2.066 actualizaciones del optimizador; la ejecución completa apunta a 20.660 actualizaciones. Este checkpoint corresponde al paso 6198 (época 3 de 10) y no incluye estado del optimizador ni del scheduler. La ejecución formal comenzó el 2026-11-01 a las 23:37 (Asia/Singapur) tras la reparación del toolchain SIP.

## Capacidades

- Generación de acciones de manipulación bimanual para la tarea de doblar una toalla larga (instrucción: levantar y doblar por el borde corto, luego el largo y de nuevo el corto, y finalmente alinear y alisar).
- Procesamiento multimodal de tres vistas RGB simultáneas con historial temporal (P48).
- Predicción de chunks de acción de 32 pasos en espacio de articulaciones absolutas de 14 dimensiones.
- Integración de propriocepción mediante un codificador dedicado.
- Condicionamiento por instrucción textual a través del codificador UMT5.
- No se documentan capacidades de tool calling, agentes, multilingüismo general ni modos de razonamiento.

## Casos de uso

- Reproducción de la ejecución de entrenamiento: cargar `model.pt` con `longwam.inference.load_run_config` y `load_model` usando `expected_step=6198` y `strict=True` para inspeccionar el estado del ajuste fino en la época 3.
- Evaluación comparativa de checkpoints: contrastar este paso 6198 con otros checkpoints de la colección Long-WAM-Fold Towel para estudiar la evolución del aprendizaje a lo largo de las épocas.
- Investigación en manipulación bimanual: usar la política como referencia para experimentos de doblado de tejidos con dos pinzas y tres cámaras.
- Análisis de normalización y preprocesado: emplear `dataset_stats.json` para replicar el pipeline de normalización y desnormalización de acciones en nuevas evaluaciones.
- Desarrollo de adaptadores de robot: servir como punto de partida para implementar el adaptador de robot correspondiente y las convenciones 14D de acción/pinza.
- Estudio de arquitecturas vídeo-acción: analizar la integración de Wan2.2 VAE y UMT5 en un policy robótico basado en LongLive.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el checkpoint ha superado comprobaciones de carga de ficheros en CPU, pero no reporta tasa de éxito en bucle cerrado ni resultados de validación retenida; además advierte que la pérdida de entrenamiento no es una métrica de éxito de la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,0 GB, lo que da una cota inferior aproximada del espacio necesario para los pesos, pero no se especifica el consumo real en inferencia.
- GPU recomendadas: no disponible. El entrenamiento se realizó en cuatro GPUs con BF16 y DeepSpeed ZeRO-1, sin que se indique el modelo concreto.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI. El despliegue previsto es mediante el código incluido en `code.zip` (checkout de Long-WAM, SIP release v34) y el cargador `longwam.inference`, con assets de Wan2.2 VAE y UMT5 obtenidos aparte. Requiere definir `LONGWAM_MODEL_ROOT` y ajustar rutas de datos, estadísticas y caché en máquinas distintas a la de entrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM-Fold-Towel-Epoch-3 | no disponible | no disponible (P48, chunk 32) | Doblado de toalla bimanual | other | Hugging Face, 12 descargas |
| Long-WAM-Fold-Towel-3Epoch-20261030-Step-4132 | no disponible | no disponible | Doblado de toalla bimanual | no disponible | Hugging Face (ejecución de entrenamiento distinta) |
| Efficient-Large-Model/Long-WAM-YAM | no disponible | no disponible | Modelo base visuomotor | other | Hugging Face (modelo base) |

No se dispone de datos de rendimiento comparables entre estos checkpoints; la información disponible no permite establecer diferencias cuantitativas de calidad.

## Limitaciones y advertencias

- No se reporta tasa de éxito en bucle cerrado ni validación retenida; el checkpoint solo ha pasado comprobaciones de carga en CPU.
- La pérdida de entrenamiento no debe interpretarse como métrica de éxito de la tarea robótica.
- El fichero es solo de evaluación: no contiene estado del optimizador ni del scheduler, por lo que no permite continuar el entrenamiento de forma exacta.
- No es un modelo autónomo de Transformers: requiere el código de `code.zip`, las estadísticas de `dataset_stats.json` y los assets externos de Wan2.2 VAE y UMT5.
- La configuración conserva rutas del sistema de ficheros SIP originales; es necesario reconfigurar rutas para evaluar en otra máquina.
- El despliegue exige un adaptador de robot compatible y respetar las convenciones 14D de acción y pinza originales.
- Licencia "other": deben consultarse los metadatos del modelo base para las condiciones de uso comercial.
- Especializado exclusivamente en la tarea de doblar toallas; no se documentan capacidades generales de lenguaje, código o matemáticas.
- No se documentan sesgos ni riesgos de alucinación en el sentido de modelos de lenguaje; el riesgo principal es la falta de validación en hardware real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Fold-Towel-Epoch-3
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Checkpoint relacionado (paso 4132): https://huggingface.co/dddddsds31341/Long-WAM-Fold-Towel-3Epoch-20261030-Step-4132
- Colección Long-WAM-Fold Towel: https://huggingface.co/collections/dddddsds31341/long-wam-fold-towel
- Registro de entrenamiento (W&B): https://forge.coreweave.com/wandb/bofang/long-wam/runs/xw0bcxta
- Dataset: https://huggingface.co/datasets/yuyingyinya/fold_towel
- Repositorio base del código: https://github.com/NVlabs/LongLive (commit `cfa4e91eec59429d583326500bf5535c9ce6eec7`)

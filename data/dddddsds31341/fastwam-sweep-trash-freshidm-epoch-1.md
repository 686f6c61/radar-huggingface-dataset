# dddddsds31341/FastWAM-Sweep-Trash-FreshIDM-Epoch-1

## Resumen

FastWAM Sweep Trash FreshIDM Epoch 1 es un checkpoint de evaluación de un modelo de política robótica (visión-lenguaje-acción) desarrollado por el usuario dddddsds31341, derivado mediante fine-tuning del modelo base Wan-AI/Wan2.2-TI2V-5B. El modelo resuelve una tarea concreta de manipulación bimanual: sujetar un recogedor con un brazo y barrer dos trozos de papel arrugado con el otro, sobre una plataforma Agilex PiPER. Se trata de un artefacto de investigación, no de un modelo de propósito general.

La arquitectura es un modelo conjunto vídeo-acción: un experto de vídeo (DiT de Wan2.2-TI2V-5B) y un experto de acción con backbone transformer interpolado desde el DiT del modelo base hasta un tamaño oculto de 1024, más encoders de acción y propriocepción inicializados aleatoriamente. La inferencia sigue un esquema IDM (inverse dynamics model): primero predice el vídeo futuro y después genera un chunk de 32 pasos de acción.

El checkpoint corresponde a la época 1 de 6 (paso de optimizador 2425) de un fine-tune sobre 100 demostraciones (48.495 frames a 30 Hz) del dataset `yuyingyinya/sweep_trash`. Es relevante únicamente como material de comparación dentro de una línea de investigación sobre inicializaciones (IO reset frente a Fresh IDM) en modelos robóticos basados en modelos de difusión de vídeo. No se reportan tasas de éxito en robot real ni validación held-out.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto video-accion sobre DiT de Wan2.2-TI2V-5B; experto de accion con transformer de hidden size 1024 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 128 tokens (embeddings UMT5 de la instruccion de tarea) |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | other (sin terminos detallados en la informacion disponible) |
| Formato de pesos | `model.pt` (PyTorch, BF16); no es un modelo `from_pretrained` de Transformers |

## Arquitectura y entrenamiento

El modelo combina un experto de vídeo y un experto de acción. El experto de vídeo parte del checkpoint pretrainado FastWAM Optional-IDM Songling (paso 45.000, no público). El experto de acción se reinicializa por completo: su transformer se construye interpolando linealmente el DiT de Wan2.2-TI2V-5B hasta un tamaño oculto de 1024 (script `scripts/preprocess_action_dit_backbone.py` de FastWAM), mientras que el encoder de acción, la cabeza de acción y el encoder de propriocepción se inicializan aleatoriamente con semilla 42. La tarea se codifica con embeddings UMT5 en caché (contexto de 128 tokens) y se emplean tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) redimensionadas a 224×224 y concatenadas horizontalmente a 224×672, con 9 frames de vídeo y un chunk de 32 pasos de acción por muestra.

El entrenamiento usó 100 demostraciones (48.495 frames, 30 Hz) del dataset `yuyingyinya/sweep_trash` (revisión `0dd5ff1f576de17dcf06b49d352e0f125a1f43e6`), cuatro GPUs A800, batch de 5 por GPU con acumulación 1 (batch global 20), tasa de aprendizaje constante de 1e-5 con AdamW, weight decay 0.01, clipping de norma global 1.0, BF16 y DeepSpeed ZeRO-1, semilla 42. Se realizaron 2.425 actualizaciones de optimizador por época, con un total previsto de 6 épocas (14.550 actualizaciones). Las pérdidas de denoising de vídeo y acción tienen el mismo peso, con `action_idm_prob` de 0.5. Las acciones son objetivos de articulación absolutos de 14 dimensiones en radianes (6 articulaciones izquierdas + gripper, 6 derechas + gripper), con grippers expresados como fracción de apertura sobre 0,08 m, y normalización min/max específica de tarea.

## Capacidades

- Generación de acciones robóticas bimanuales de 14 dimensiones para la plataforma Agilex PiPER.
- Predicción de vídeo futuro como paso intermedio antes de la generación del chunk de acción (modo `idm`, 20 pasos de inferencia).
- Condicionamiento por instrucción de tarea en lenguaje natural mediante embeddings UMT5.
- Fusión de tres vistas RGB (cabeza y ambas manos) en una única entrada visual de 224×672.
- Integración de estado de propriocepción mediante encoder dedicado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, matemáticas, código ni multilingüismo.

## Casos de uso

- Investigación en manipulación bimanual: evaluar políticas que coordinan dos brazos para tareas asimétricas (sujetar recogedor y barrer), usando el checkpoint como referencia de la inicialización Fresh IDM.
- Estudio comparativo de inicializaciones: contrastar este checkpoint con el de IO reset entrenado con los mismos datos e hiperparámetros para aislar el efecto de la inicialización del experto de acción.
- Reproducción de pipelines de entrenamiento FastWAM: servir como ejemplo completo de configuración resuelta (`config.yaml`), estadísticas de normalización (`dataset_stats.json`) y contrato de inferencia (`inference_contract.json`) para tareas de barrido.
- Desarrollo de adaptadores de robot: validar la integración con el adaptador Agilex PiPER y las convenciones de 14 dimensiones antes de desplegar políticas en hardware.
- Evaluación de modelos vídeo-acción en simulación o banco de pruebas: medir la coherencia entre el vídeo predicho y la acción generada en el modo IDM.
- Base para fine-tuning posterior: punto de partida para experimentos con más épocas o datos adicionales, teniendo en cuenta que el fichero de evaluación no permite reanudar el estado del optimizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reporta tasa de éxito en robot real ni resultado de validación held-out, y advierte que la pérdida de entrenamiento no es una métrica de éxito en la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 12,0 GB y los pesos se almacenan en BF16, por lo que se requiere al menos una GPU con capacidad suficiente para cargar el modelo conjunto vídeo-acción y el VAE de Wan2.2-TI2V-5B (que se descarga por separado).
- GPU de entrenamiento documentadas: 4× NVIDIA A800 con DeepSpeed ZeRO-1 y BF16.
- GPU recomendadas para inferencia: no disponibles; por tamaño del repo, se necesita una GPU de datacenter o una consumer de gama alta con suficiente memoria, sin cifra confirmada.
- ¿Cabe en GPU consumer?: no confirmado; el tamaño del repo (12 GB) sugiere que podría requerir más de 12 GB de VRAM solo para pesos, sin contar activaciones ni VAE.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el modelo se carga mediante el código FastWAM incluido (`hydra.utils.instantiate` + `model.load_checkpoint`), y requiere el VAE de Wan2.2-TI2V-5B (`DIFFSYNTH_MODEL_BASE_PATH`) y el encoder de texto UMT5 de Wan2.1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM Sweep Trash FreshIDM Epoch 1 | no disponible | 128 tokens | Manipulacion bimanual (barrido) | other | Checkpoint publico en HF |
| FastWAM Sweep Trash IO reset (misma linea) | no disponible | 128 tokens | Manipulacion bimanual (barrido) | other | Entrenado con los mismos datos e hiperparametros; disponibilidad no confirmada |
| FastWAM Optional-IDM Songling (checkpoint base) | no disponible | no disponible | Modelo base de video-accion | no disponible | No publico (paso 45.000) |
| Wan-AI/Wan2.2-TI2V-5B (modelo base) | no disponible | no disponible | Generacion de video texto-imagen-video | no disponible | Publico en HF |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No se reporta tasa de éxito en robot real ni validación held-out; la pérdida de entrenamiento no es una métrica válida de éxito en la tarea.
- El checkpoint es de la época 1 de 6; no representa el modelo final del run.
- El fichero de evaluación no incluye estado del optimizador ni del scheduler, por lo que no permite reanudar el entrenamiento de forma exacta.
- Las estadísticas de normalización y el contrato de gripper deben provenir de este mismo repositorio; usar estadísticas de otro checkpoint produce acciones incorrectas.
- La configuración conserva rutas del sistema de ficheros de la máquina de entrenamiento y debe adaptarse.
- Requiere descargar por separado el VAE de Wan2.2-TI2V-5B y el encoder de texto UMT5 de Wan2.1.
- No es un modelo autónomo de Transformers (`from_pretrained`); depende del código FastWAM incluido en `code.zip`.
- Específico de la plataforma Agilex PiPER y de la tarea de barrido; no generaliza a otras tareas sin fine-tuning.
- Licencia "other" sin términos detallados: es necesario revisar las condiciones del autor y del modelo base antes de cualquier uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de política robótica, el riesgo relevante es la generación de acciones incorrectas o inseguras en hardware real.

## Enlaces

- Hugging Face: https://huggingface.co/dddddsds31341/FastWAM-Sweep-Trash-FreshIDM-Epoch-1
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset: https://huggingface.co/datasets/yuyingyinya/sweep_trash
- Repositorio de código FastWAM referenciado: `yuantianyuan01/FastWAM` (commit `7faa711`), sin URL directa en la informacion disponible.
- Paper, blog o demo: no disponibles en la informacion proporcionada.

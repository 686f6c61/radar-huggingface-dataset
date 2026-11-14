# dddddsds31341/FastWAM-Sweep-Trash-FreshIDM-Epoch-2

## Resumen

FastWAM Sweep Trash — Fresh IDM, Epoch 2 es un checkpoint de evaluación de un modelo de política robótica (vision-language-action) desarrollado por el usuario dddddsds31341. Se trata de un fine-tune del modelo base Wan-AI/Wan2.2-TI2V-5B, un modelo generativo de vídeo de 5.000 millones de parámetros, adaptado mediante la infraestructura FastWAM para ejecutar una tarea bimanual concreta: barrer papeles arrugados con un cepillo hacia una pala, usando dos brazos Agilex PiPER.

El modelo combina un experto de vídeo (que predice el futuro visual de la escena) con un experto de acción (que genera chunks de 32 pasos de acciones articulares de 14 dimensiones). Esta arquitectura de predicción de vídeo como paso intermedio antes de la acción es la innovación central de la familia FastWAM, y el checkpoint emplea la inicialización "Fresh IDM" en la que el experto de acción se reinicializa por completo a partir de una interpolación lineal del DiT de Wan2.2.

Es relevante como artefacto de investigación reproducible: documenta con precisión hiperparámetros, contrato de inferencia, estadísticas de normalización y código de entrenamiento, lo que permite replicar el pipeline. No obstante, es un checkpoint de evaluación de una sola tarea, sin métricas de éxito en robot real publicadas, y no está pensado como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión transformer (DiT) de vídeo + experto de acción transformer; modelo conjunto vídeo/acción FastWAM |
| Parametros totales | no disponible (modelo base Wan2.2-TI2V-5B de 5B; el experto de acción se interpola a hidden size 1024) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens para el embedding de instrucción UMT5; 9 frames de vídeo y chunk de acción de 32 pasos por muestra |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16) |
| Idiomas soportados | no disponible (la instrucción de tarea está en inglés) |
| Licencia | other |
| Formato de pesos | model.pt (PyTorch, BF16), config.yaml, dataset_stats.json, inference_contract.json |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastWAM, que acopla un experto de vídeo basado en el DiT de Wan2.2-TI2V-5B con un experto de acción independiente. El experto de vídeo parte del checkpoint pretrainado FastWAM Optional-IDM Songling (step 45.000, no público). El experto de acción se reinicializa por completo: su transformer se deriva de una interpolación lineal del DiT de Wan2.2-TI2V-5B a hidden size 1024 mediante el script `preprocess_action_dit_backbone.py`, mientras que el encoder de acción, la cabeza de acción y el encoder proprioceptivo se inicializan aleatoriamente con semilla 42. La inferencia es en dos etapas: primero se predice el vídeo futuro y después el chunk de 32 acciones.

El entrenamiento usa el dataset `yuyingyinya/sweep_trash` (revisión `0dd5ff1f`), con 100 demostraciones y 48.495 frames a 30 Hz. Se emplearon cuatro GPUs A800, batch de 5 por GPU con acumulación 1 (batch global 20), learning rate constante de 1e-5 con AdamW, weight decay 0.01, clipping de norma global 1.0, BF16 y DeepSpeed ZeRO-1, semilla 42. Cada época supone 2.425 actualizaciones del optimizador; el run completo son 6 épocas y 14.550 actualizaciones, y este checkpoint corresponde a la época 2 (step 4.850). Las pérdidas de denoising de vídeo y de acción tienen pesos iguales, con `action_idm_prob` de 0.5. Las acciones son objetivos articulares absolutos de 14 dimensiones en radianes (6 articulaciones + gripper por brazo), con grippers como fracción de apertura sobre 0.08 m. Se usan tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) redimensionadas a 224×224 y concatenadas horizontalmente a 224×672.

## Capacidades

- Generación de acciones robóticas bimanuales de 14 dimensiones en chunks de 32 pasos, con control de pinza como fracción de apertura.
- Predicción de vídeo futuro como paso intermedio de razonamiento visual antes de la acción (modo `idm`).
- Condicionamiento por instrucción de tarea en lenguaje natural codificada con UMT5 (contexto de 128 tokens).
- Percepción multi-cámara: integra tres vistas RGB simultáneas (cabeza y ambas manos).
- Ejecución de una tarea específica de manipulación bimanual: sujetar la pala con una pinza y barrer con el cepillo con la otra.
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni modo thinking; sus capacidades están acotadas a la política robótica entrenada.

## Casos de uso

- Investigación en políticas vision-language-action: sirve como checkpoint de referencia para comparar inicializaciones (IO reset frente a Fresh IDM) con datos e hiperparámetros idénticos, permitiendo aislar el efecto de la inicialización.
- Replicación de pipelines de entrenamiento robótico: el repositorio incluye `code.zip` (FastWAM v8), `requirements-fastwam.txt` y `config.yaml`, lo que permite reproducir el entorno exacto de entrenamiento en un clúster con GPUs A800.
- Evaluación de tareas bimanuales de barrido: útil para medir la viabilidad de políticas de difusión de vídeo en tareas de coordinación de dos brazos con objetos deformables (papel arrugado).
- Desarrollo de adaptadores de robot: el `inference_contract.json` define orden articular, referencia de gripper y disposición de cámaras, lo que facilita integrar el modelo en un stack de control de brazos Agilex PiPER.
- Estudio de normalización específica de tarea: las estadísticas en `dataset_stats.json` ilustran cómo la normalización min/max por tarea afecta a la desnormalización de acciones en producción.
- Base para fine-tuning posterior: al ser un checkpoint intermedio (época 2 de 6), puede usarse como punto de partida para experimentos de continuación, aunque el archivo es solo de evaluación y no restaura el estado del optimizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reporta tasa de éxito en robot real ni resultado de validación en held-out, y advierte que la pérdida de entrenamiento no es una métrica de éxito de la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo pesa 12,0 GB en BF16 y requiere además los pesos del VAE de Wan2.2-TI2V-5B cargados por separado (`DIFFSYNTH_MODEL_BASE_PATH`), lo que incrementa el consumo.
- GPU recomendadas: el entrenamiento se realizó en cuatro A800; para inferencia se requiere una GPU con suficiente memoria para el modelo conjunto y el VAE (A100/H100 de 80 GB son la opción segura; no se confirma que quepa en GPUs de consumo).
- No hay confirmación de que quepa en GPU de consumo (RTX 4090, etc.); el tamaño del repo y la necesidad del VAE de 5B sugieren que no es viable en 24 GB sin cuantización, y no se documentan tipos de cuantización.
- Opciones de despliegue: no es un modelo `from_pretrained` de Transformers; requiere extraer `code.zip`, instalar el checkout de FastWAM, construir el modelo con `hydra.utils.instantiate(cfg.model, ...)`, cargar con `model.load_checkpoint("model.pt")` e invocar `model.infer_action(..., action_infer_mode="idm", num_inference_steps=20)`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM Sweep Trash Fresh IDM (este) | base 5B + experto de acción | 128 tokens de instrucción; 9 frames; chunk 32 | Política bimanual de barrido | other | Público en HF |
| FastWAM Optional-IDM Songling (checkpoint previo) | no disponible | no disponible | Política robótica general FastWAM | no disponible | No público (step 45.000) |
| Wan-AI/Wan2.2-TI2V-5B (modelo base) | 5B | no disponible | Generación de vídeo texto-imagen-vídeo | no disponible | Público en HF |
| Long-WAM fine-tunes (mismo dataset) | no disponible | no disponible | Política robótica sobre `sweep_trash` | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint de evaluación de una única tarea: no es un modelo de propósito general y solo ejecuta la instrucción de barrido descrita.
- No se reporta tasa de éxito en robot real ni validación en held-out; la pérdida de entrenamiento no debe interpretarse como métrica de éxito.
- El archivo `model.pt` no incluye estado del optimizador ni del scheduler, por lo que no permite continuar el entrenamiento exactamente.
- Las estadísticas de normalización y el contrato de gripper deben provenir de este mismo repositorio; usar estadísticas de otro checkpoint produce acciones incorrectas.
- La configuración conserva rutas del sistema de archivos de la máquina de entrenamiento y debe actualizarse para otro entorno.
- Requiere dependencias externas no incluidas: pesos del VAE de Wan2.2-TI2V-5B y el encoder de texto UMT5 de Wan2.1 con su tokenizador.
- Licencia "other": no se especifican términos de uso comercial; debe consultarse antes de cualquier despliegue en producción.
- Riesgo de sobreajuste a las 100 demostraciones del dataset y a la configuración de cámaras y brazos Agilex PiPER; no hay evidencia de generalización a otras escenas u objetos.
- Sesgos y comportamiento multilingüe: no documentados; la instrucción de tarea está en inglés y no se declaran idiomas soportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/FastWAM-Sweep-Trash-FreshIDM-Epoch-2
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset: https://huggingface.co/datasets/yuyingyinya/sweep_trash
- Repositorio de código FastWAM (referencia en la model card): https://github.com/yuantianyuan01/FastWAM (commit `7faa711`)

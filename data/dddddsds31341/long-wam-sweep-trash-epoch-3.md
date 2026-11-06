# dddddsds31341/Long-WAM-Sweep-Trash-Epoch-3

## Resumen

Long-WAM Sweep Trash — Epoch 3 es un checkpoint de evaluación derivado del modelo base `Efficient-Large-Model/Long-WAM-YAM`, publicado por el usuario `dddddsds31341`. Se trata de un ajuste fino (fine-tune) independiente orientado a una única tarea de manipulación robótica bimanual: sujetar un recogedor con un brazo y barrer dos trozos de papel arrugado con el otro. El modelo combina un codificador de vídeo conjunto con un cabezal de acciones, siguiendo el paradigma de los modelos de world-action (WAM) aplicados a robótica.

El checkpoint corresponde al epoch 3 de un total de 5, en el step de optimizador 3033, y se distribuye como pesos de evaluación sin estado de optimizador ni scheduler. No es un modelo autónomo cargable con `transformers.from_pretrained`: requiere el código de inferencia incluido (`code.zip`, release SIP v22) y los assets del VAE Wan2.2 y del codificador de texto UMT5, que se distribuyen por separado.

Su relevancia es acotada: se trata de un artefacto de investigación reproducible para una tarea concreta, no de un modelo de propósito general. El autor no reporta tasas de éxito en bucle cerrado ni validación retenida, por lo que su utilidad principal es la inspección del entrenamiento y la reproducción del pipeline, no el despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto de vídeo y acción (Long-WAM) con codificador de propriocepción; basado en NVlabs/LongLive con cambios SIP |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (historial de 48 frames, P48, en el layout de vídeo) |
| Tipos de cuantizacion | no disponible (pesos en BF16 durante entrenamiento; dtype almacenado en `model.pt`) |
| Idiomas soportados | no disponible (modelo de robótica; instrucción de tarea en inglés) |
| Licencia | other (ver metadatos del modelo base para términos concretos) |
| Formato de pesos | `model.pt` (PyTorch), más `config.yaml`, `dataset_stats.json`, `code.zip` y `requirements-sip.txt` |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño Long-WAM: un modelo conjunto que procesa observaciones visuales de tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) en un layout de vídeo de 384×320 con historial P48, junto con un codificador de propriocepción, y emite chunks de acción de 32 pasos. Las acciones se representan como objetivos articulares absolutos de 14 dimensiones (6 articulaciones + gripper por brazo, orden izquierda y después derecha), con las unidades originales del gripper. El entrenamiento parte del checkpoint `Efficient-Large-Model/Long-WAM-YAM` y no continúa desde el fine-tune de otra tarea.

El ajuste fino se realizó sobre el dataset `yuyingyinya/sweep_trash` (revisión `0dd5ff1f576de17dcf06b49d352e0f125a1f43e6`), con 100 demostraciones y 48.495 frames a 30 Hz, usando todas las demostraciones para entrenamiento. La configuración es de cuatro GPUs, batch de 12 por GPU con acumulación 1 (batch global 48), learning rate constante de 1e-5 con AdamW y weight decay 0.01, precisión BF16 y DeepSpeed ZeRO-1. Cada epoch comprende 1.011 actualizaciones de optimizador y la ejecución completa apunta a 5.055 actualizaciones. Se aplican estadísticas z-score específicas de la tarea y el recorte oficial de valores normalizados en `[-5, 5]`. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de acciones robóticas bimanuales en chunks de 32 pasos a partir de observaciones visuales multi-cámara y estado de propriocepción.
- Ejecución de una instrucción de tarea en lenguaje natural: agarrar el recogedor con un gripper, agarrar el cepillo con el otro y barrer dos trozos de papel arrugado hacia el recogedor.
- Procesamiento de tres flujos RGB simultáneos (`top_head`, `hand_left`, `hand_right`) con historial temporal de 48 frames.
- Salida de objetivos articulares absolutos de 14 dimensiones con convención de gripper original.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso genérico ni capacidades multilingües.
- No se documentan modos de pensamiento (thinking), visión general, audio ni otras capacidades fuera del dominio robótico.

## Casos de uso

- Reproducción de experimentos de barrido bimanual: el checkpoint permite repetir la evaluación del step 3033 con `load_run_config` y `load_model` (con `expected_step=3033` y `strict=True`), usando las estadísticas de normalización del propio repositorio, lo que facilita la comparación entre epochs del mismo run.
- Investigación en modelos world-action: sirve como punto de partida para estudiar cómo un fine-tune de tarea única modifica el comportamiento de `Long-WAM-YAM` en una tarea de manipulación con dos brazos y coordinación de herramientas.
- Desarrollo de pipelines de evaluación offline: al incluir `code.zip` y `requirements-sip.txt`, permite montar un entorno SIP reproducible y validar la carga de pesos y el preprocesado de vídeo sin depender de un robot físico.
- Integración con adaptadores de robot compatibles: para despliegue real se requiere un adaptador de robot que respete la convención 14D y las unidades de gripper originales, lo que lo hace adecuado para laboratorios con plataformas bimanuales equivalentes a la del dataset.
- Docencia y divulgación técnica: como ejemplo concreto de fine-tune de un modelo de acción sobre un dataset pequeño (100 demostraciones) con configuración de entrenamiento documentada al detalle (LR, batch, ZeRO-1, BF16).
- Auditoría de entrenamiento: la inclusión de `config.yaml` y `dataset_stats.json` permite verificar la configuración resuelta y las estadísticas de normalización, útil para detectar discrepancias entre runs o entre checkpoints de distintos epochs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reporta tasa de éxito en bucle cerrado ni resultado de validación retenida, y advierte que la pérdida de entrenamiento no es una métrica de éxito de la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,0 GB e incluye `model.pt` junto con código y estadísticas; el tamaño exacto de los pesos no se desglosa.
- GPU recomendadas: no disponible. El entrenamiento se realizó en cuatro GPUs con BF16 y DeepSpeed ZeRO-1, pero no se especifica el modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documenta vLLM, llama.cpp, Ollama ni TGI. La carga se realiza mediante el código incluido en `code.zip` (checkout de Long-WAM con `longwam.inference.load_run_config` y `load_model`), y requiere assets separados del VAE Wan2.2, el codificador de texto UMT5 y el tokenizer.
- Latencia y throughput: no disponibles. Solo se confirma que el checkpoint ha pasado comprobaciones de carga de ficheros en CPU.
- Variables de entorno relevantes: `LONGWAM_MODEL_ROOT` para fijar la raíz de assets del modelo en una máquina distinta a la de entrenamiento, además de actualizar las rutas de datos, estadísticas y caché para el punto de entrada de evaluación.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Long-WAM Sweep Trash — Epoch 3 | Fine-tune de world-action bimanual | Barrido de papel con recogedor y cepillo | no disponible | no disponible (P48 de historial) | other | Hugging Face, 19 descargas |
| Efficient-Large-Model/Long-WAM-YAM | Modelo base de world-action | Manipulación general (base del fine-tune) | no disponible | no disponible | other | Hugging Face |
| NVlabs/LongLive (@cfa4e91) | Código base del pipeline | Generación de vídeo/acción | no disponible | no disponible | no disponible | Repositorio de código |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación se limita a linaje, tarea y disponibilidad.

## Limitaciones y advertencias

- No es un modelo autónomo de `transformers`: no se puede cargar con `from_pretrained`; requiere el código SIP v22 incluido y los assets externos (VAE Wan2.2, UMT5, tokenizer).
- El checkpoint es de evaluación: no incluye estado de optimizador ni scheduler, por lo que no permite reanudar el entrenamiento de forma exacta.
- No se reporta tasa de éxito en bucle cerrado ni validación retenida; la pérdida de entrenamiento no debe interpretarse como métrica de éxito de la tarea.
- La configuración de entrenamiento conserva rutas del sistema de ficheros original; en otra máquina hay que reconfigurar `LONGWAM_MODEL_ROOT` y las rutas de datos, estadísticas y caché.
- El despliegue requiere un adaptador de robot compatible y respetar la convención 14D de acciones y las unidades originales del gripper; un adaptador distinto puede invalidar el comportamiento.
- La licencia es "other" y los términos concretos remiten al modelo base `Efficient-Large-Model/Long-WAM-YAM`; debe revisarse antes de cualquier uso comercial.
- El modelo está entrenado para una única tarea y un único dataset (100 demostraciones); no se documenta generalización a otras tareas, objetos o entornos.
- No se documentan sesgos, riesgos de alucinación en el sentido de modelos de lenguaje, ni limitaciones idiomáticas, porque el modelo no es de propósito general.
- El tamaño de 12,0 GB del repositorio incluye código y estadísticas, no solo pesos; el desglose exacto no está disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Sweep-Trash-Epoch-3
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset de entrenamiento: `yuyingyinya/sweep_trash` (revisión `0dd5ff1f576de17dcf06b49d352e0f125a1f43e6`)
- Registro de entrenamiento (W&B): https://forge.coreweave.com/wandb/bofang/long-wam/runs/nwa2ucgt
- Código base del pipeline: `NVlabs/LongLive@cfa4e91eec59429d583326500bf5535c9ce6eec7`

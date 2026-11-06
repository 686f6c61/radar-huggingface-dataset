# dddddsds31341/Long-WAM-Sweep-Trash-Epoch-5

## Resumen

Long-WAM Sweep Trash — Epoch 5 es un checkpoint de evaluación de un ajuste fino (fine-tune) independiente del modelo base `Efficient-Large-Model/Long-WAM-YAM`, publicado por el usuario `dddddsds31341`. Se trata de un modelo de robótica bimano (bimanual) entrenado específicamente para la tarea de barrer dos trozos de papel arrugado hacia una bandeja de recogida (dustpan) usando una pinza para sujetar la bandeja y la otra para manejar el cepillo. El checkpoint corresponde a la época 5 de 5 (paso de optimizador 5055) de un entrenamiento completado con 100 demostraciones teleoperadas.

El modelo es relevante porque ejemplifica el patrón actual de especialización de modelos fundacionales de robótica (VLA, vision-language-action) mediante fine-tuning sobre datasets de tareas concretas. En lugar de un modelo generalista, se publican pesos de evaluación por tarea, lo que permite reproducir experimentos de manipulación bimanual con un conjunto reducido de demostraciones (100 episodios, 48.495 fotogramas a 30 Hz) y una configuración de entrenamiento documentada de forma transparente.

No obstante, conviene subrayar que se trata de un artefacto de investigación: el propio autor indica que no se ha medido la tasa de éxito en bucle cerrado sobre robot real ni sobre validación retenida, y que el repositorio no es un modelo estándar de Transformers cargable con `from_pretrained`. La información disponible sobre arquitectura interna, número de parámetros y contexto es limitada; los datos que no constan se marcan como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo conjunto vídeo/acción (joint video/action model) con codificador de propiocepción; basado en `Efficient-Large-Model/Long-WAM-YAM` (detalles internos no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (historial de P48 fotogramas y chunk de acción de 32 pasos como configuración de inferencia) |
| Tipos de cuantización | no disponible (pesos almacenados en el dtype del entrenamiento, BF16) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea en inglés; sin evaluación multilingüe) |
| Licencia | other (se remite a la licencia del modelo base `Efficient-Large-Model/Long-WAM-YAM`) |
| Formato de pesos | `model.pt` (PyTorch), más `config.yaml`, `dataset_stats.json`, `code.zip` y `requirements-sip.txt` |

## Arquitectura y entrenamiento

El checkpoint deriva de `Efficient-Large-Model/Long-WAM-YAM`, un modelo de la familia Long-WAM que combina un modelo conjunto de vídeo y acción con un codificador de propiocepción. La configuración de inferencia documentada trabaja con tres cámaras RGB (`top_head`, `hand_left`, `hand_right`), un diseño de vídeo procesado de 384×320, un historial de P48 fotogramas y un chunk de acción de 32 pasos. Las acciones se representan como objetivos articulares absolutos de 14 dimensiones con las unidades originales de las pinzas, ordenadas como 6 articulaciones + pinza izquierda y 6 articulaciones + pinza derecha. Los detalles sobre el número de capas, atención, tamaño de embeddings o composición del corpus de preentrenamiento del modelo base no están disponibles en la información proporcionada.

El fine-tuning se realizó sobre el dataset `yuyingyinya/sweep_trash` (revisión `0dd5ff1f576de17dcf06b49d352e0f125a1f43e6`), con 100 demostraciones, 48.495 fotogramas a 30 Hz y uso de todas las demostraciones para entrenamiento. Se emplearon cuatro GPUs con batch de 12 por GPU, acumulación de gradiente 1 y batch global de 48; tasa de aprendizaje constante de `1e-5`, optimizador AdamW con weight decay 0.01, precisión BF16 y DeepSpeed ZeRO-1. Cada época comprende 1.011 actualizaciones del optimizador y el run completo apunta a 5.055 actualizaciones. Se aplicaron estadísticas de normalización z-score específicas de la tarea y el recorte oficial de valores normalizados en `[-5, 5]`. No se documenta uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de acciones de manipulación bimanual en el espacio articular (14 dimensiones) condicionada por instrucción de tarea e imágenes de tres cámaras.
- Ejecución de una tarea concreta de barrido y recogida: sujetar la bandeja con una pinza y barrer dos trozos de papel arrugado con la otra.
- Fusión de información visual multi-cámara (cabeza y ambas manos) con propiocepción del robot.
- Predicción de chunks de acción de 32 pasos, lo que permite control a 30 Hz con planificación a corto plazo.
- Condicionamiento por instrucción textual de la tarea (en inglés en la model card).
- Soporte de tool calling / function calling: no disponible (no aplica a un modelo de robótica).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible; la visión se limita al pipeline robótico descrito.

## Casos de uso

- Investigación en manipulación bimanual: reproducir el experimento de barrido con bandeja y cepillo usando exactamente la configuración de inferencia documentada (tres cámaras, P48, chunk de 32), lo que permite comparar variantes de fine-tuning sobre el mismo dataset.
- Evaluación de recetas de ajuste fino con pocos datos: el checkpoint sirve como referencia de qué se obtiene con 100 demostraciones y 5 épocas, útil para estudiar el efecto del número de demostraciones y pasos en tareas de contacto.
- Desarrollo de pipelines de despliegue VLA: integrar `model.pt` con `longwam.inference.load_model` (con `expected_step=5055` y `strict=True`) para validar la cadena de carga, normalización y desnormalización de acciones antes de pasar a robot real.
- Generación de datos sintéticos de trayectorias: usar los chunks de acción predichos como propuestas para filtrado o aumento de datos en el mismo dominio de tarea.
- Pruebas de infraestructura de entrenamiento distribuido: la configuración con DeepSpeed ZeRO-1, BF16 y batch global 48 sobre cuatro GPUs sirve como plantilla reproducible para otros fine-tunes de la familia Long-WAM.
- Análisis de robustez multi-cámara: evaluar cómo afecta la oclusión o el desalineamiento de `hand_left`/`hand_right` a las predicciones, dado que el modelo depende de tres vistas simultáneas.
- Docencia y divulgación: ejemplo completo y trazable (dataset, estadísticas, código y requisitos versionados) para explicar el ciclo de vida de un checkpoint de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el checkpoint ha superado comprobaciones de carga de ficheros en CPU, pero que no se reporta tasa de éxito en bucle cerrado sobre robot ni resultado de validación retenida, y que la pérdida de entrenamiento no es una métrica de éxito de la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 12,0 GB e incluye `model.pt` junto con código y estadísticas, por lo que se requiere al menos una GPU con memoria suficiente para cargar los pesos en BF16 más el VAE Wan2.2 y el codificador de texto UMT5, que se distribuyen por separado.
- GPU recomendadas: no disponible en la documentación; el entrenamiento se realizó con cuatro GPUs (modelo no especificado).
- ¿Cabe en GPU de consumo? No disponible; no se confirma que quepa en RTX 4090 u otras tarjetas de consumo.
- Opciones de despliegue: no se contemplan vLLM, llama.cpp, Ollama ni TGI; el despliegue previsto es mediante el checkout de Long-WAM incluido en `code.zip`, con `longwam.inference.load_run_config` y `load_model`, y un adaptador de robot compatible con las convenciones 14D originales.
- Latencia y throughput: no disponibles.
- Notas de entorno: es necesario definir `LONGWAM_MODEL_ROOT` y actualizar las rutas de datos, estadísticas y caché, ya que la configuración conserva rutas del sistema de ficheros SIP original. Se requieren además los assets del VAE Wan2.2, el codificador de texto UMT5 y el tokenizador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Sweep Trash — Epoch 5 | no disponible | no disponible (P48, chunk 32) | Barrido bimanual con bandeja y cepillo | other | Hugging Face, 17 descargas |
| Long-WAM Wash-Cup — Epoch 5 (`dddddsds31341/Long-WAM-Wash-Cup-Epoch-5`) | no disponible | no disponible | Lavado de taza (paso 7265) | other | Hugging Face |
| Checkpoints π0.5 de sweep_trash (`dddddsds31341`, colección "Sweep Trash — π0.5 Checkpoints") | no disponible | no disponible | Barrido, organizados por número de demostraciones y paso | no disponible | Hugging Face |
| Long-WAM-YAM (modelo base, `Efficient-Large-Model/Long-WAM-YAM`) | no disponible | no disponible | Modelo fundacional VLA/YAM | other | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas; la comparación se limita a procedencia, tarea y disponibilidad.

## Limitaciones y advertencias

- No se reporta tasa de éxito en robot real ni validación retenida; la pérdida de entrenamiento no debe interpretarse como métrica de éxito de la tarea.
- El checkpoint es de solo evaluación: no incluye estado del optimizador ni del scheduler, por lo que no permite continuar el entrenamiento de forma exacta.
- No es un modelo estándar de Transformers: no admite `from_pretrained`; requiere el checkout de Long-WAM y los assets externos (VAE Wan2.2, UMT5 y tokenizador).
- La configuración conserva rutas del sistema de ficheros SIP original; es necesario reconfigurar rutas y `LONGWAM_MODEL_ROOT` en otra máquina.
- Dependencia estricta de las estadísticas de normalización de este mismo repositorio (`dataset_stats.json`) y del recorte `[-5, 5]`; usar otras estadísticas invalida las acciones desnormalizadas.
- Dependencia del adaptador de robot y de las convenciones 14D originales (unidades de pinza incluidas); un adaptador distinto puede producir acciones incorrectas.
- Entrenado con solo 100 demostraciones de una única tarea y un único entorno; se espera una generalización muy limitada fuera de la distribución del dataset.
- Sesgos conocidos: no documentados; al ser un modelo de política robótica, puede heredar sesgos de las demostraciones teleoperadas (estilos de agarre, posiciones iniciales, iluminación).
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de predicciones de acción plausibles pero incorrectas ante configuraciones visuales no vistas.
- Licencia "other": es imprescindible revisar la licencia del modelo base `Efficient-Large-Model/Long-WAM-YAM` antes de cualquier uso comercial; no se garantiza permiso de uso comercial.
- Idiomas: no se documenta soporte multilingüe de las instrucciones de tarea.
- Fecha de creación del repositorio: 2026-11-02, según los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Sweep-Trash-Epoch-5
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Checkpoint hermano (Wash-Cup): https://huggingface.co/dddddsds31341/Long-WAM-Wash-Cup-Epoch-5
- Colección de checkpoints π0.5 para sweep_trash: https://huggingface.co/collections/dddddsds31341/sweep-trash-05-checkpoints
- Registro de entrenamiento (Weights & Biases, CoreWeave): https://forge.coreweave.com/wandb/bofang/long-wam/runs/nwa2ucgt
- Repositorio de referencia del código base (LongLive, commit citado): https://github.com/NVlabs/LongLive/tree/cfa4e91eec59429d583326500bf5535c9ce6eec7
- Dataset de entrenamiento: https://huggingface.co/datasets/yuyingyinya/sweep_trash

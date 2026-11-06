# dddddsds31341/Long-WAM-Wash-Cup-Epoch-10

## Resumen

Long-WAM Wash Cup Epoch 10 es un checkpoint de evaluación de un ajuste fino independiente del modelo base Efficient-Large-Model/Long-WAM-YAM, orientado a una tarea robótica bimanual concreta: sostener y levantar una taza con un gripper mientras el otro limpia su interior con un cepillo de botella, devolver el cepillo y colocar la taza boca abajo en el escurridor. Lo publica el usuario dddddsds31341 en Hugging Face y corresponde al epoch 10 de 10 (optimizer step 14530) de un entrenamiento sobre el dataset yuyingyinya/wash_cup.

El modelo es un sistema video-acción conjunto (joint video/action model) con un codificador de propiocepción, entrenado con 100 demostraciones y 69.728 fotogramas a 30 Hz. No es un modelo de lenguaje ni un transformer estándar de `from_pretrained`: requiere el código de entrenamiento incluido (`code.zip`, release SIP v29 basado en NVlabs/LongLive) y assets externos como el VAE de Wan2.2 y el codificador de texto UMT5.

Su relevancia es acotada y práctica: sirve como referencia reproducible de un fine-tune robótico de manipulación bimanual con chunking de acciones de 32 pasos y tres cámaras RGB, no como modelo de propósito general. El autor no reporta tasa de éxito en bucle cerrado ni validación held-out.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo video-acción conjunto (joint video/action model) con codificador de propiocepción; base Long-WAM-YAM |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; historial de vídeo P48 y chunk de acción de 32 pasos |
| Tipos de cuantizacion | no disponible (pesos almacenados en el dtype del entrenamiento, BF16) |
| Idiomas soportados | no disponible (modelo robótico; instrucción de tarea en inglés) |
| Licencia | other (hereda metadatos del modelo base Long-WAM-YAM) |
| Formato de pesos | `model.pt` (PyTorch), más `config.yaml`, `dataset_stats.json`, `code.zip` y `requirements-sip.txt` |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de vídeo y acción conjunto con un codificador de propiocepción. El entrenamiento parte de Efficient-Large-Model/Long-WAM-YAM y no continúa ningún fine-tune previo de otra tarea. La entrada consta de tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) procesadas a 384×320, con un historial P48 y un chunk de acción de 32 pasos. Las acciones son objetivos articulares absolutos de 14 dimensiones con unidades originales de gripper, ordenadas como 6 articulaciones + gripper izquierdo y 6 articulaciones + gripper derecho.

El ajuste fino usa el dataset yuyingyinya/wash_cup (revisión `dcf90aa38d98e9b6c9f71afe0cfeeb3f50ed74cb`), con 100 demostraciones y 69.728 fotogramas a 30 Hz, todas empleadas en entrenamiento. Se entrenó en cuatro GPUs con batch de 12 por GPU, acumulación de gradiente 1 y batch global 48; learning rate constante de 1e-5, AdamW con weight decay 0.01, BF16 y DeepSpeed ZeRO-1. Cada epoch supone 1.453 actualizaciones de optimizador y la ejecución completa apunta a 14.530. Se aplican estadísticas z-score específicas de la tarea y el recorte oficial de valores normalizados en `[-5, 5]`. El checkpoint incluye solo pesos y codificador de propiocepción, sin estado de optimizador ni scheduler.

## Capacidades

- Generación de acciones robóticas de manipulación bimanual a partir de observaciones visuales y propioceptivas.
- Ejecución de una instrucción de tarea compuesta de varias fases: agarre, limpieza del interior, devolución del cepillo y colocación de la taza.
- Procesamiento multimodal de tres flujos RGB simultáneos (`top_head`, `hand_left`, `hand_right`).
- Predicción de chunks de acción de 32 pasos con salida de 14 dimensiones en convención articular absoluta.
- Codificación de propiocepción integrada para condicionar la acción.
- No soporta tool calling, function calling, agentes de texto, razonamiento simbólico, matemáticas, código ni capacidades multilingües: es un modelo específico de control robótico.

## Casos de uso

- Reproducción de experimentos de manipulación bimanual: el checkpoint permite repetir el fine-tune de wash-cup con las mismas estadísticas de normalización y convenciones de acción, útil para comparar variantes de entrenamiento.
- Evaluación de políticas robóticas en simulación o laboratorio: se integra con un adaptador de robot compatible y las convenciones 14D originales para medir desempeño en la tarea de lavado de taza.
- Investigación en aprendizaje por imitación: las 100 demostraciones y el esquema de chunking de 32 pasos sirven como referencia para estudiar generalización en tareas de contacto.
- Desarrollo de pipelines de visión-acción: útil para validar la integración de tres cámaras RGB con historial P48 en un modelo video-acción.
- Base para fine-tunes de tareas relacionadas: al ser un ajuste independiente desde Long-WAM-YAM, puede servir de punto de partida para otras tareas de manipulación con cepillo o utensilios.
- Docencia y divulgación técnica: ejemplo concreto de entrenamiento distribuido (DeepSpeed ZeRO-1, BF16) aplicado a robótica, con configuración y estadísticas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el checkpoint ha pasado comprobaciones de carga de ficheros en CPU, pero no reporta tasa de éxito en bucle cerrado ni resultado de validación held-out, y advierte que la pérdida de entrenamiento no es una métrica de éxito de la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 12,0 GB y los pesos se almacenan en el dtype de entrenamiento (BF16), por lo que se requiere una GPU con memoria suficiente para el modelo más el VAE de Wan2.2 y el codificador UMT5.
- GPU recomendadas: no disponible en la información proporcionada; el entrenamiento se realizó en cuatro GPUs con batch de 12 por GPU, lo que sugiere hardware de centro de datos.
- ¿Cabe en GPU de consumo? No disponible; no se especifica el tamaño de parámetros ni el consumo de memoria en inferencia.
- Opciones de despliegue: no es un modelo `from_pretrained` de Transformers; requiere extraer `code.zip`, instalar el checkout de Long-WAM y usar `longwam.inference.load_run_config` y `load_model` con la ruta explícita a `model.pt`, `expected_step=14530` y `strict=True`. Se necesitan por separado los assets del VAE de Wan2.2, el codificador de texto UMT5 y el tokenizer, además de un adaptador de robot compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Wash Cup Epoch 10 | no disponible | no disponible (P48, chunk 32) | Manipulación bimanual wash-cup | other | Hugging Face, 21 descargas |
| Long-WAM Wash Cup Epoch 5 | no disponible | no disponible | Manipulación bimanual wash-cup | no disponible | Hugging Face (mismo autor) |
| Efficient-Large-Model/Long-WAM-YAM | no disponible | no disponible | Modelo base video-acción | no disponible (metadatos publicados) | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos checkpoints; la única diferencia documentada es el epoch y el paso de optimizador.

## Limitaciones y advertencias

- Modelo específico de una única tarea (wash-cup); no generaliza a otras tareas sin fine-tune adicional.
- No reporta tasa de éxito en robot real ni validación held-out; la pérdida de entrenamiento no es métrica de éxito.
- El checkpoint es solo de evaluación: no incluye estado de optimizador ni scheduler, por lo que no permite reanudar el entrenamiento exacto.
- La configuración original conserva rutas del sistema de ficheros SIP; en otra máquina hay que definir `LONGWAM_MODEL_ROOT` y actualizar rutas de datos, estadísticas y caché.
- Requiere assets externos (VAE Wan2.2, UMT5, tokenizer) y un adaptador de robot compatible con la convención 14D original.
- Licencia "other": es necesario consultar los metadatos de licencia del modelo base Long-WAM-YAM antes de cualquier uso comercial.
- Riesgo de alucinación y sesgos: no disponible; al ser un modelo de control robótico, el riesgo relevante es de ejecución incorrecta de la política, no de generación de texto.
- Idiomas: no disponible; la instrucción de tarea está en inglés y no se documenta soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Wash-Cup-Epoch-10
- Checkpoint Epoch 5 del mismo autor: https://huggingface.co/dddddsds31341/Long-WAM-Wash-Cup-Epoch-5
- Modelo base Long-WAM-YAM: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Registro de entrenamiento (Weights & Biases): https://forge.coreweave.com/wandb/bofang/long-wam/runs/3n9pgoq2
- Repositorio base del código (LongLive): https://github.com/NVlabs/LongLive (commit cfa4e91eec59429d583326500bf5535c9ce6eec7)
- Búsqueda de modelos con etiqueta wash-cup: https://huggingface.co/models?other=wash-cup

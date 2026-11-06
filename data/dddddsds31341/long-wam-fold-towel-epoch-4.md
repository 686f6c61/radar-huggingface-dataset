# dddddsds31341/Long-WAM-Fold-Towel-Epoch-4

## Resumen

Long-WAM Fold Towel — Epoch 4 es un checkpoint de evaluación (pesos de la época 4 de 10, paso de optimizador 8264) de un ajuste fino independiente para la tarea robótica de doblar una toalla larga con dos brazos. Lo publica el usuario `dddddsds31341` y parte del modelo base `Efficient-Large-Model/Long-WAM-YAM`, un modelo mundo-acción (world-action model) desarrollado en el ecosistema de NVlabs LongLive. No es un modelo de lenguaje: es un modelo de política robótica que combina un modelo de vídeo autorregresivo con un cabezal de acciones, entrenado sobre demostraciones reales de manipulación bimanual.

El modelo resuelve el problema del control visomotor de horizonte largo: a partir de tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) y un historial visual de 48 fotogramas, predice trozos de acción de 32 pasos en un espacio de 14 dimensiones (6 articulaciones + pinza por brazo). La innovación clave de la familia Long-WAM es escalar el contexto visual del modelo mundo-acción manteniendo inferencia en tiempo real, algo que este checkpoint hereda del preentrenamiento autorregresivo de vídeo del modelo base.

Es relevante ahora porque demuestra que el preentrenamiento en vídeo autorregresivo transfiere a control robótico de horizonte largo, y porque publica pesos, estadísticas de normalización y código reproducibles de un ajuste fino concreto. Aun así, se trata de un checkpoint de evaluación sin tasa de éxito en bucle cerrado publicada, por lo que debe tratarse como material de investigación, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo mundo-acción causal (vídeo autorregresivo + cabezal de acciones) basado en Long-WAM; codificador de propriocepción incluido |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Historial visual de 48 fotogramas (P48); trozo de acción de 32 pasos |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16 según la configuración de entrenamiento) |
| Idiomas soportados | no disponible (modelo robótico; instrucción de tarea en inglés) |
| Licencia | other (se remite a la licencia del modelo base `Efficient-Large-Model/Long-WAM-YAM`) |
| Formato de pesos | `model.pt` (PyTorch), más `config.yaml`, `dataset_stats.json`, `code.zip` y `requirements-sip.txt` |

## Arquitectura y entrenamiento

El checkpoint es un ajuste fino del modelo base Long-WAM-YAM, que pertenece a la familia Long-WAM: un modelo mundo-acción causal que escala el contexto visual mediante preentrenamiento autorregresivo de vídeo y un runtime de predicción-y-acción asíncrono en streaming. La entrada combina tres cámaras RGB procesadas a una disposición de vídeo de 384×320, un historial de 48 fotogramas y un codificador de propriocepción; la salida son objetivos absolutos de articulación en 14 dimensiones (6 articulaciones + pinza del brazo izquierdo, 6 + pinza del derecho) con las unidades originales de la pinza. El modelo requiere por separado el VAE de Wan2.2, el codificador de texto UMT5 y su tokenizador, por lo que no es un modelo `from_pretrained` autónomo de Transformers.

El ajuste fino se realizó sobre el dataset `yuyingyinya/fold_towel` (revisión `48cf95e0d1594940d4160f5cde7e8070c221904e`): 100 demostraciones, 99 151 fotogramas a 30 Hz, todas usadas para entrenamiento. Se entrenó con cuatro GPUs, batch de 12 por GPU (batch global 48), acumulación de gradiente 1, tasa de aprendizaje constante de 1e-5, AdamW con weight decay 0.01, BF16 y DeepSpeed ZeRO-1. Cada época supone 2066 actualizaciones de optimizador y la ejecución completa apunta a 20 660 actualizaciones; este checkpoint corresponde al paso 8264 (época 4). Se aplicaron estadísticas z-score específicas de la tarea y el recorte oficial de valores normalizados en `[-5, 5]`. No se menciona RLHF ni DPO; el entrenamiento es de imitación supervisada sobre demostraciones.

## Capacidades

- Control visomotor bimanual para manipulación de tejidos: doblar una toalla larga en las direcciones de borde corto, borde largo y borde corto, y finalmente alinear y alisar.
- Predicción de trozos de acción de 32 pasos en espacio de articulaciones absolutas de 14 dimensiones con unidades de pinza originales.
- Fusión de tres vistas RGB (`top_head`, `hand_left`, `hand_right`) con historial visual de 48 fotogramas.
- Codificación de propriocepción del robot integrada en el modelo.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües; su ámbito es exclusivamente la política robótica entrenada.
- No se documentan capacidades de visión general, audio ni modo de pensamiento.

## Casos de uso

- Investigación en manipulación bimanual de tejidos: usar el checkpoint como referencia reproducible para comparar variantes de ajuste fino sobre la misma tarea de doblado de toalla, con pesos, estadísticas y código publicados.
- Reproducción de experimentos de modelo mundo-acción: cargar `model.pt` con `longwam.inference.load_run_config` y `load_model` (con `expected_step=8264` y `strict=True`) para validar la canalización de inferencia de Long-WAM sobre el dataset `fold_towel`.
- Evaluación de transferencia desde preentrenamiento en vídeo: comprobar si el preentrenamiento autorregresivo del modelo base mejora el control de horizonte largo en una tarea concreta de plegado.
- Punto de partida para ajustes finos posteriores: al ser un checkpoint intermedio (época 4 de 10), sirve para estudiar la evolución del aprendizaje entre épocas, aunque no permite reanudar el entrenamiento exacto (no incluye estado del optimizador).
- Despliegue en banco de pruebas con un adaptador de robot compatible: emplear las convenciones de acción de 14 dimensiones y las estadísticas de normalización del repositorio para pruebas en bucle abierto o cerrado controladas.
- Docencia y divulgación técnica: ilustrar un caso completo de política robótica con tres cámaras, historial visual largo y trozos de acción, usando el código SIP v34 incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el checkpoint ha superado comprobaciones de carga de ficheros en CPU, pero no reporta tasa de éxito en robot en bucle cerrado ni resultados de validación con conjunto reservado; además advierte que la pérdida de entrenamiento no es una métrica de éxito de la tarea robótica. Como referencia de la familia, la página de Long-WAM cita 107,4 ms por trozo de acción en una RTX 5090 para el modelo completo, pero ese dato corresponde al modelo base y no a este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 12,0 GB e incluye `model.pt` en BF16, pero no se desglosa el tamaño del modelo ni de los componentes auxiliares (VAE de Wan2.2, codificador UMT5).
- GPU recomendadas: no disponibles para este checkpoint; el modelo base Long-WAM reporta despliegue en RTX 5090, DGX Spark y Jetson AGX Thor.
- ¿Cabe en GPU de consumo? No confirmado para este checkpoint; el modelo base se ejecuta en una RTX 5090 según la documentación de Long-WAM.
- Opciones de despliegue: no se soporta vLLM, llama.cpp, Ollama ni TGI; el despliegue requiere el checkout de Long-WAM con `longwam.inference.load_run_config` y `load_model`, el VAE de Wan2.2, el codificador UMT5 y su tokenizador, además de un adaptador de robot compatible.
- Latencia y throughput: no disponibles para este checkpoint; el modelo base cita 107,4 ms por trozo de acción en RTX 5090.
- El entrenamiento se realizó con cuatro GPUs, batch de 12 por GPU, BF16 y DeepSpeed ZeRO-1.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Fold Towel — Epoch 4 (este) | Modelo mundo-acción ajustado para doblar toalla | no disponible | Historial de 48 fotogramas; trozo de 32 pasos | other (heredada del base) | Pesos en Hugging Face, 18 descargas |
| Efficient-Large-Model/Long-WAM-YAM | Modelo base mundo-acción | no disponible | no disponible | other | Pesos en Hugging Face |
| dddddsds31341/pi05-fold_towel_100-15k | Política robótica ajustada para la misma tarea de doblar toalla | no disponible | no disponible | no disponible | Pesos en Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas; la comparación se limita a tipo de modelo, disponibilidad y licencia.

## Limitaciones y advertencias

- No se reporta tasa de éxito en robot en bucle cerrado ni validación con conjunto reservado; el checkpoint solo ha pasado comprobaciones de carga en CPU.
- La pérdida de entrenamiento no es una métrica de éxito de la tarea; no debe usarse como indicador de calidad del control.
- Es un checkpoint de evaluación de la época 4 de 10: no incluye estado del optimizador ni del planificador, por lo que no permite reanudar el entrenamiento exacto.
- No es un modelo autónomo de Transformers: requiere el código SIP v34 incluido, el VAE de Wan2.2, el codificador UMT5, el tokenizador y un adaptador de robot compatible con las convenciones de 14 dimensiones.
- La configuración original conserva rutas del sistema de ficheros SIP; en otra máquina hay que definir `LONGWAM_MODEL_ROOT` y actualizar rutas de datos, estadísticas y caché.
- La licencia es "other" y se remite a la del modelo base; no se detallan restricciones de uso comercial, por lo que hay que consultar la licencia de `Efficient-Large-Model/Long-WAM-YAM` antes de cualquier despliegue productivo.
- Modelo de propósito muy específico (doblado de toalla bimanual); no generaliza a otras tareas sin un nuevo ajuste fino.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no procesa lenguaje natural como tarea principal; la instrucción de tarea es fija y en inglés.
- Riesgo de sobreajuste a las 100 demostraciones del dataset y a las condiciones de captura de las tres cámaras; no hay evidencia publicada de robustez ante cambios de iluminación, fondo o tipo de toalla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Fold-Towel-Epoch-4
- Colección Long-WAM Fold Towel: https://huggingface.co/collections/dddddsds31341/long-wam-fold-towel
- Modelo base Long-WAM-YAM: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Página del proyecto Long-WAM (NVlabs): https://nvlabs.github.io/LongLive/Long-WAM/
- Repositorio base del código LongLive: https://github.com/NVlabs/LongLive (referencia `cfa4e91eec59429d583326500bf5535c9ce6eec7`)
- Registro de entrenamiento en W&B: https://forge.coreweave.com/wandb/bofang/long-wam/runs/xw0bcxta
- Checkpoint relacionado en la misma tarea: https://huggingface.co/dddddsds31341/pi05-fold_towel_100-15k
- Artículo de referencia sobre Long-WAM: https://aiany.app/item/long-wam-scaling-the-context-of-world-action-models

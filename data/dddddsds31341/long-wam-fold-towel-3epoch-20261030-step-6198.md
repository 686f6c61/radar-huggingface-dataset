# dddddsds31341/Long-WAM-Fold-Towel-3Epoch-20261030-Step-6198

## Resumen

Long-WAM-Fold-Towel-3Epoch-20261030-Step-6198 es un checkpoint de inferencia para robótica publicado por el usuario dddddsds31341 en HuggingFace. Se trata de un ajuste fino (finetune) del modelo base Efficient-Large-Model/Long-WAM-YAM, entrenado específicamente para la tarea de doblar una toalla larga ("fold towel") con un robot de dos brazos. El repositorio contiene únicamente los pesos de inferencia (model.pt), la configuración exacta del entrenamiento y el código SIP preservado, sin estado de optimizador ni de scheduler.

El modelo pertenece a la familia Long-WAM (World-Action Model de largo horizonte), una arquitectura orientada a la predicción de acciones robóticas a partir de observaciones visuales y una instrucción en lenguaje natural. En este caso, el entrenamiento se realizó sobre el dataset yuyingyinya/fold_towel, compuesto por 100 demostraciones y 99.151 fotogramas, durante un objetivo de 3 épocas hasta el paso de optimizador 6.198.

La relevancia de esta ficha radica en que documenta un caso concreto de ajuste fino de un modelo de política robótica (vision-language-action, VLA) para una tarea de manipulación deformable, un dominio especialmente difícil por la variabilidad de la geometría del objeto. No obstante, el autor no publica tasas de éxito ni métricas de rendimiento, por lo que su utilidad práctica debe evaluarse mediante validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Long-WAM (world-action model) sobre base Efficient-Large-Model/Long-WAM-YAM; transformer con VAE Wan2.2 y codificador de texto UMT5 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (historial de P48 fotogramas; chunk de acción de 32 pasos) |
| Tipos de cuantizacion | no disponible (checkpoint en BF16) |
| Idiomas soportados | no disponible (instrucciones de tarea en inglés en el ejemplo) |
| Licencia | other (ver licencia del modelo base) |
| Formato de pesos | PyTorch (model.pt) |

## Arquitectura y entrenamiento

El modelo se inicializa desde Efficient-Large-Model/Long-WAM-YAM y se ajusta de forma supervisada sobre el dataset yuyingyinya/fold_towel (revisión 48cf95e0d1594940d4160f5cde7e8070c221904e), que contiene 100 demostraciones y 99.151 fotogramas. El entrenamiento se ejecutó en cuatro GPUs A100 con batch size de 12 por GPU, acumulación de gradiente 1 (batch global 48), tasa de aprendizaje constante de 1e-05, optimizador AdamW con weight decay 0.01, semilla 42, precisión BF16 y DeepSpeed ZeRO-1. El objetivo era de 3 épocas y el checkpoint corresponde al paso de optimizador 6.198.

La representación de acciones emplea objetivos absolutos de 14 dimensiones (articulaciones y pinza en unidades originales del gripper): 6 articulaciones izquierdas más pinza, seguidas de 6 articulaciones derechas más pinza. Se aplica normalización z-score específica de la tarea seguida de recorte a [-5, 5], y es imprescindible usar conjuntamente las estadísticas incluidas en el repositorio (dataset_stats.json) y el código. Las observaciones visuales provienen de tres cámaras RGB (top_head, hand_left, hand_right) con un diseño de vídeo procesado de 384×320, un historial P48 y un chunk de acción de 32 pasos. El checkpoint es de inferencia pura: no contiene estado de optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento de forma exacta.

## Capacidades

- Generación de acciones robóticas de 14 dimensiones (articulaciones y pinza de ambos brazos) condicionadas a observaciones visuales multi-cámara y a una instrucción de tarea.
- Política de manipulación para una tarea específica: doblar una toalla larga en las direcciones de borde corto, borde largo y borde corto, y finalmente alinear y alisar.
- Procesamiento de tres flujos de vídeo RGB (top_head, hand_left, hand_right) con resolución 384×320.
- Predicción de chunks de acción de 32 pasos con historial de P48 fotogramas.
- Condicionamiento por instrucción en lenguaje natural mediante codificador de texto UMT5 y VAE Wan2.2.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni multilingüismo más allá de la instrucción de tarea.

## Casos de uso

- Investigación en manipulación deformable: el modelo sirve como referencia para estudiar el doblado de toallas con robots bimanuales, una tarea con geometría variable y contacto continuo, usando el dataset y las estadísticas incluidas para reproducir el ajuste.
- Evaluación de políticas VLA en laboratorio: se puede desplegar en un entorno controlado con tres cámaras y dos brazos para medir la tasa de éxito real, dado que el autor no la publica.
- Baseline para comparación de métodos: al ser un finetune de Long-WAM-YAM, permite comparar variantes de entrenamiento (épocas, pasos, normalización) sobre la misma tarea y dataset.
- Estudio de normalización y clipping: el uso de z-score con recorte a [-5, 5] y de estadísticas específicas de tarea lo convierte en un caso práctico para analizar el efecto de estas decisiones en la estabilidad de la política.
- Reproducción de pipelines de entrenamiento distribuido: la configuración (4×A100, batch 48, DeepSpeed ZeRO-1, BF16) documenta un flujo reproducible para ajustar modelos de robótica a escala moderada.
- Docencia y formación en robótica de imitación: el repositorio incluye código SIP y requisitos, lo que facilita montar prácticas sobre carga de checkpoints, configuración de inferencia y adaptación de rutas.
- Integración en simuladores o gemelos digitales: los chunks de acción de 32 pasos y el historial P48 permiten probar la política en entornos simulados antes de transferirla a hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna tasa de éxito del robot ni rendimiento en conjuntos de validación retenidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 12,0 GB y los pesos están en BF16, por lo que se requiere al menos una GPU con memoria suficiente para cargar el checkpoint completo más los activos del VAE Wan2.2 y el codificador UMT5.
- GPU recomendadas: el entrenamiento se realizó en 4×A100; para inferencia se recomienda A100 o H100 por la carga del VAE y el codificador de texto, aunque no se especifica un mínimo.
- Cabe en GPU de consumo: no confirmado; el tamaño del repositorio (12 GB) y la necesidad de activos adicionales hacen dudoso su ajuste en GPUs de 24 GB sin cuantización, que no está documentada.
- Opciones de despliegue: el repositorio incluye code.zip con el checkout de Long-WAM y las funciones longwam.inference.load_run_config y load_model; se requiere instalar requirements-sip.txt y adaptar las rutas SIP, de activos, dataset y caché a la máquina destino.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM-Fold-Towel-3Epoch-20261030-Step-6198 | no disponible | no disponible (P48 historial, chunk 32) | Doblado de toalla bimanual | other | HuggingFace, 0 descargas |
| Efficient-Large-Model/Long-WAM-YAM (base) | no disponible | no disponible | Política VLA general | ver enlace del autor | HuggingFace |
| Otros finetunes Long-WAM con nombre por época | no disponible | no disponible | Doblado de toalla | other | HuggingFace (según el autor, runs distintos) |

No se dispone de datos de benchmarks ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se publican tasas de éxito, métricas de validación ni resultados en conjuntos retenidos; el rendimiento real es desconocido.
- El checkpoint es solo de inferencia: no incluye estado de optimizador, scheduler ni RNG, por lo que no se puede reanudar el entrenamiento de forma exacta.
- La normalización z-score y el recorte a [-5, 5] son específicos de la tarea; usar estadísticas distintas o el código por separado puede degradar o invalidar la política.
- Requiere activos externos no incluidos: VAE Wan2.2, codificador de texto UMT5 y tokenizer.
- El código preservado conserva rutas SIP de la máquina original; es necesario adaptar rutas de activos, dataset, estadísticas y caché.
- La licencia es "other" y remite a la licencia del modelo base; deben revisarse las restricciones de uso comercial antes de cualquier despliegue productivo.
- El modelo está especializado en una única tarea (doblado de toalla) y no se documentan capacidades generales de lenguaje, razonamiento, código ni multilingüismo.
- No se documentan sesgos conocidos ni riesgos de alucinación en el sentido de modelos de lenguaje; el riesgo principal es la generalización limitada a variaciones de la toalla, iluminación o configuración de cámaras.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dddddsds31341/Long-WAM-Fold-Towel-3Epoch-20261030-Step-6198
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset: https://huggingface.co/datasets/yuyingyinya/fold_towel
- Licencia del modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM (sección de licencia)

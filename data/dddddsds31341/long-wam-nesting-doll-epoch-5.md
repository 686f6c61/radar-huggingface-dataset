# dddddsds31341/Long-WAM-Nesting-Doll-Epoch-5

## Resumen

Long-WAM Nesting Doll — Epoch 5 es un checkpoint de evaluación de un ajuste fino independiente del modelo base Long-WAM-YAM, desarrollado por el usuario dddddsds31341. Se trata de un modelo de política robótica (pipeline `robotics`) entrenado para una tarea concreta de manipulación bimanual: anidar muñecas rusas de menor a mayor, insertando cada muñeca dentro de la siguiente hasta que todas queden encajadas en la más grande. El modelo parte de `Efficient-Large-Model/Long-WAM-YAM` y no continúa el ajuste fino de ninguna otra tarea.

El checkpoint corresponde a la época 5 de 5 (paso de optimizador 17145) de un entrenamiento sobre el dataset `yuyingyinya/nesting_doll`, compuesto por 100 demostraciones y 164 571 fotogramas a 30 Hz. La arquitectura subyacente es un modelo conjunto de vídeo y acción (joint video/action model) con un codificador de propiocepción, que consume tres cámaras RGB y produce objetivos de articulaciones absolutos de 14 dimensiones. El repositorio ocupa 12,0 GB e incluye pesos, configuración resuelta, estadísticas de normalización y el código de entrenamiento empaquetado.

Su relevancia es acotada y muy específica: se publica como material de evaluación reproducible para la comunidad de robótica que trabaja con el stack Long-WAM, no como un modelo de propósito general. No se reportan métricas de éxito en robot real ni resultados de validación retenidos, por lo que debe tratarse como un artefacto de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto de vídeo y acción (joint video/action model) con codificador de propiocepción, sobre el stack Long-WAM (base: Long-WAM-YAM) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como ventana de tokens; historial de vídeo P48 y chunk de acción de 32 pasos |
| Tipos de cuantizacion | no disponible (pesos almacenados en el dtype del paso de entrenamiento; entrenamiento en BF16) |
| Idiomas soportados | no disponible (modelo de robótica; el texto se procesa mediante el codificador UMT5) |
| Licencia | other (metadatos de licencia del modelo base en https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM) |
| Formato de pesos | `model.pt` (PyTorch), más `config.yaml`, `dataset_stats.json`, `code.zip` y `requirements-sip.txt` |

## Arquitectura y entrenamiento

El modelo es un checkpoint de ajuste fino del base Long-WAM-YAM, construido sobre el código SIP release v22, derivado de `NVlabs/LongLive@cfa4e91eec59429d583326500bf5535c9ce6eec7` con los cambios SIP incorporados. La entrada combina tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) procesadas a 384×320 con un historial de 48 fotogramas (P48), y la salida es un chunk de 32 pasos de acción en 14 dimensiones absolutas de articulación con unidades originales de pinza, ordenadas como 6 articulaciones izquierdas + pinza y 6 articulaciones derechas + pinza. El modelo incluye además un codificador de propiocepción. Para el texto se requiere externamente el codificador UMT5 y su tokenizador, así como el VAE de Wan2.2.

El entrenamiento se realizó sobre las 100 demostraciones completas del dataset `yuyingyinya/nesting_doll` (revisión `ae8a879c9a635d3c666aba58a4d9ac996225edb8`), con 164 571 fotogramas a 30 Hz. Se usaron cuatro GPU con batch de 12 por GPU y acumulación de gradiente 1 (batch global 48), tasa de aprendizaje constante de 1e-5, AdamW con weight decay 0,01, precisión BF16 y DeepSpeed ZeRO-1. Cada época comprende 3429 actualizaciones de optimizador, y la ejecución completada suma 17 145 actualizaciones. Se aplicaron estadísticas z-score específicas de la tarea y el recorte oficial de valores normalizados en `[-5, 5]`. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generación de acciones de manipulación bimanual en espacio de articulaciones (14D) condicionadas por instrucción de tarea en lenguaje natural y observación visual multi-cámara.
- Procesamiento de vídeo multi-vista con historial temporal de 48 fotogramas y predicción de chunks de acción de 32 pasos.
- Ejecución de una tarea concreta de ensamblaje: anidar muñecas rusas de menor a mayor.
- Codificación de propiocepción del estado del robot integrada en el modelo.
- Condicionamiento por texto mediante el codificador UMT5 (requerido externamente).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso genérico, visión general, audio ni modo de pensamiento.

## Casos de uso

- Evaluación reproducible de políticas de manipulación bimanual: el checkpoint permite reproducir el paso 17145 con `expected_step=17145` y `strict=True` mediante `longwam.inference.load_run_config` y `load_model`, sirviendo como referencia para comparar variantes del stack Long-WAM.
- Investigación en aprendizaje por imitación con pocas demostraciones: con solo 100 demostraciones y 164 571 fotogramas, es un caso de estudio útil para analizar cómo escalan los modelos conjuntos de vídeo y acción con datos limitados.
- Desarrollo de pipelines de ensamblaje fino: la tarea de anidar muñecas requiere inserción precisa y secuenciación, lo que lo hace adecuado como banco de pruebas para políticas de inserción y encaje.
- Validación de infraestructura de entrenamiento distribuido: la configuración documentada (4 GPU, batch global 48, DeepSpeed ZeRO-1, BF16) sirve para replicar recetas de entrenamiento en entornos multi-GPU.
- Integración en simuladores o gemelos digitales: al usar convenciones 14D explícitas y estadísticas de normalización incluidas, puede conectarse a un adaptador de robot compatible para pruebas en simulación antes de despliegue físico.
- Estudio de normalización y desnormalización de acciones: `dataset_stats.json` permite analizar el efecto de las estadísticas z-score y del recorte `[-5, 5]` en la estabilidad de las políticas.
- Referencia para evaluación comparativa de checkpoints intermedios: al ser un checkpoint de época final, permite contrastar con épocas anteriores del mismo ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reporta tasa de éxito en robot en bucle cerrado ni resultado de validación retenido, y advierte que la pérdida de entrenamiento no es una métrica de éxito en la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 12,0 GB, lo que da una cota inferior del espacio necesario para cargar los pesos, pero no se documenta el consumo en ejecución.
- GPU recomendadas: no disponible. El entrenamiento se realizó en cuatro GPU (modelo no especificado) con BF16 y DeepSpeed ZeRO-1.
- Compatibilidad con GPU de consumo: no confirmada. El tamaño del repositorio (12,0 GB) sugiere que podría cargarse en GPUs con 16-24 GB de VRAM si el runtime lo permite, pero no hay datos publicados al respecto.
- Opciones de despliegue: no se soporta `from_pretrained` de Transformers. Requiere extraer `code.zip`, instalar el checkout de Long-WAM incluido y usar `longwam.inference.load_run_config` y `load_model` con la ruta explícita a `model.pt`. Se necesitan además los assets del VAE de Wan2.2 y del codificador UMT5 con su tokenizador. La variable `LONGWAM_MODEL_ROOT` permite reubicar la raíz de assets.
- Latencia y throughput: no disponibles.
- Nota: el checkpoint ha superado comprobaciones de carga de ficheros en CPU, pero no se reportan pruebas en bucle cerrado sobre robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Nesting Doll — Epoch 5 | no disponible | P48 historial, chunk de 32 pasos | Anidado de muñecas rusas (bimanual) | other | Hugging Face, 13 descargas |
| Efficient-Large-Model/Long-WAM-YAM | no disponible | no disponible | Política robótica general del stack Long-WAM | según metadatos del modelo base | Hugging Face (modelo base) |
| NVlabs/LongLive | no disponible | no disponible | Modelo de vídeo de referencia del código base | no disponible | GitHub |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse con 100 demostraciones de una única tarea y un único dataset, la política está fuertemente especializada y no generaliza a otras tareas.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de acciones fuera de distribución ante observaciones no vistas; no hay validación retenida que lo cuantifique.
- Limitaciones de contexto e idioma: el condicionamiento textual depende del codificador UMT5 externo; no se documentan idiomas soportados. El horizonte temporal está fijado en 48 fotogramas de historial y 32 pasos de acción.
- Restricciones de licencia: la licencia es `other` y remite a los metadatos del modelo base; es imprescindible revisar los términos de `Efficient-Large-Model/Long-WAM-YAM` antes de cualquier uso comercial.
- El checkpoint es de solo evaluación: no incluye estado de optimizador ni de scheduler, por lo que no permite continuar el entrenamiento de forma exacta.
- La configuración conserva rutas del sistema de ficheros del entrenamiento original (SIP); es necesario reconfigurar rutas de datos, estadísticas y caché para otro entorno.
- No es un modelo autónomo de Transformers: requiere el código incluido, el VAE de Wan2.2 y el codificador UMT5 con tokenizador.
- El despliegue exige un adaptador de robot compatible y respetar las convenciones originales de 14D y unidades de pinza.
- No se reporta tasa de éxito en robot real ni validación retenida; la pérdida de entrenamiento no debe interpretarse como métrica de éxito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Epoch-5
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset: https://huggingface.co/datasets/yuyingyinya/nesting_doll
- Registro de entrenamiento (Weights & Biases): https://forge.coreweave.com/wandb/bofang/long-wam/runs/oaplbei2
- Código base LongLive: https://github.com/NVlabs/LongLive (commit `cfa4e91eec59429d583326500bf5535c9ce6eec7`)

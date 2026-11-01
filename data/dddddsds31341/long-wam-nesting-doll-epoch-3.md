# dddddsds31341/Long-WAM-Nesting-Doll-Epoch-3

## Resumen

Long-WAM Nesting Doll — Epoch 3 es un checkpoint de evaluación de un fine-tune independiente del modelo robótico Long-WAM-YAM, desarrollado por el usuario dddddsds31341. Se trata de un modelo de política visuomotora (vision-language-action) orientado a una tarea concreta de manipulación bimanual: ensamblar muñecas rusas (nesting dolls) introduciendo cada muñeca pequeña dentro de la siguiente mayor hasta completar el conjunto. No es un modelo de lenguaje general, sino un modelo de control robótico entrenado sobre demostraciones.

El modelo parte de `Efficient-Large-Model/Long-WAM-YAM` y se ha afinado sobre el dataset `yuyingyinya/nesting_doll`, compuesto por 100 demostraciones y 164.571 fotogramas a 30 Hz. La arquitectura combina un modelo conjunto de vídeo y acción con un codificador de propiocepción, e incorpora componentes de Wan2.2 (VAE) y UMT5 (text encoder) para el procesamiento de las observaciones visuales y la instrucción de tarea. El checkpoint corresponde al epoch 3 de 5, en el paso de optimizador 10287.

Su relevancia es acotada pero específica: sirve como referencia reproducible para evaluar políticas bimanuales de horizonte largo en una tarea de ensamblaje con contacto físico y secuenciación precisa. No obstante, el propio autor advierte de que no se han publicado tasas de éxito en bucle cerrado ni resultados de validación retenida, por lo que debe tratarse como un artefacto de evaluación y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto de vídeo y acción (joint video/action model) con codificador de propiocepción; componentes Wan2.2 VAE y UMT5 text encoder |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (ventana de historia P48 y chunk de acción de 32 pasos) |
| Tipos de cuantizacion | no disponible (pesos almacenados en el dtype del entrenamiento, BF16) |
| Idiomas soportados | no disponible (modelo de robótica; instrucción de tarea en inglés) |
| Licencia | other (ver metadatos del modelo base) |
| Formato de pesos | `model.pt` (PyTorch), más `config.yaml`, `dataset_stats.json`, `code.zip` y `requirements-sip.txt` |

## Arquitectura y entrenamiento

El modelo es un sistema de política visuomotora que procesa tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) con un layout de vídeo de 384×320, una historia de P48 fotogramas y un chunk de acción de 32 pasos. La salida es un vector de 14 dimensiones de articulaciones absolutas con unidades originales del gripper, ordenado como 6 articulaciones + gripper izquierdo y 6 articulaciones + gripper derecho. El modelo integra un codificador de propiocepción junto al modelo conjunto de vídeo/acción, y requiere por separado los assets del VAE de Wan2.2 y del text encoder UMT5 con su tokenizer.

El entrenamiento se realizó sobre el dataset `yuyingyinya/nesting_doll` (revisión `ae8a879c9a635d3c666aba58a4d9ac996225edb8`), con 100 demostraciones, 164.571 fotogramas a 30 Hz y todas las demostraciones usadas para entrenamiento. Se emplearon cuatro GPUs, batch size de 12 por GPU con acumulación de gradiente 1 (batch global 48), learning rate constante de 1e-5, AdamW con weight decay 0.01, precisión BF16 y DeepSpeed ZeRO-1. El run completo apunta a 17.145 actualizaciones, con 3.429 actualizaciones por epoch; este checkpoint corresponde al paso 10287. Se aplican estadísticas z-score específicas de la tarea y el recorte oficial de valores normalizados en `[-5, 5]`. El código de entrenamiento es una release SIP v22 basada en `NVlabs/LongLive@cfa4e91eec59429d583326500bf5535c9ce6eec7`. No se documenta uso de RLHF ni DPO.

## Capacidades

- Control robótico bimanual de manipulación: genera acciones conjuntas de 14 dimensiones (brazo y gripper izquierdo y derecho) a partir de observaciones visuales y propioceptivas.
- Ejecución de una instrucción de tarea en lenguaje natural: "Nest the Russian dolls from smallest to largest...".
- Percepción multivista: procesa simultáneamente tres cámaras RGB (`top_head`, `hand_left`, `hand_right`).
- Razonamiento temporal con historia de P48 fotogramas y predicción de chunks de acción de 32 pasos.
- Condicionamiento por texto mediante UMT5 text encoder y tokenizer.
- Integración con VAE de Wan2.2 para el modelado del espacio visual.
- No se documenta soporte de tool calling, function calling, agentes multi-paso genéricos, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en políticas visuomotoras de ensamblaje: el checkpoint permite reproducir y comparar el comportamiento de una política bimanual en una tarea de inserción secuencial con contacto físico, usando las estadísticas de normalización incluidas.
- Evaluación de horizonte largo en manipulación: la ventana de historia P48 y el chunk de 32 pasos permiten estudiar la estabilidad de políticas que requieren memoria temporal prolongada durante el anidamiento de múltiples objetos.
- Benchmark de referencia para fine-tunes sobre Long-WAM-YAM: al ser un fine-tune independiente desde el modelo base, sirve para medir el efecto del ajuste sobre un dataset concreto frente a otros checkpoints de la misma familia.
- Estudio de coordinación bimanual: el formato de 14 dimensiones con grippers independientes permite analizar la sincronización entre ambos brazos en tareas de ensamblaje.
- Reproducción de experimentos con DeepSpeed ZeRO-1 y BF16: el `config.yaml` resuelto y `requirements-sip.txt` facilitan la réplica del entorno de entrenamiento en clústeres con cuatro GPUs.
- Desarrollo de pipelines de evaluación offline: el checkpoint puede cargarse con `longwam.inference.load_run_config` y `load_model` con `expected_step=10287` y `strict=True` para validar la integridad del artefacto antes de desplegarlo en un robot compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reporta tasa de éxito en bucle cerrado ni resultado de validación retenida, y que la pérdida de entrenamiento no es una métrica de éxito de la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,0 GB, pero no se desglosa el tamaño de los pesos ni el de los assets auxiliares (VAE de Wan2.2, UMT5).
- GPU recomendadas: no disponible. El entrenamiento se realizó con cuatro GPUs, sin especificar modelo.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: carga mediante el checkout de Long-WAM incluido en `code.zip`, usando `longwam.inference.load_run_config` y `load_model` con la ruta explícita a `model.pt`, `expected_step=10287` y `strict=True`. Requiere los assets del VAE de Wan2.2, el text encoder UMT5 y el tokenizer por separado. No es un modelo standalone de Transformers `from_pretrained`.
- Variables de entorno: `LONGWAM_MODEL_ROOT` para fijar la raíz de assets del modelo en una máquina distinta a la del entrenamiento.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Nesting Doll — Epoch 3 (este) | no disponible | no disponible (P48 + 32 pasos de acción) | Anidamiento bimanual de muñecas rusas | other | HuggingFace, 21 descargas |
| Efficient-Large-Model/Long-WAM-YAM (base) | no disponible | no disponible | Política visuomotora general (YAM) | other | HuggingFace |
| NVlabs/LongLive (código base) | no disponible | no disponible | Framework de generación/control de vídeo largo | no disponible | GitHub |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se reporta tasa de éxito en bucle cerrado ni validación retenida; el checkpoint ha superado únicamente comprobaciones de carga de ficheros en CPU.
- La pérdida de entrenamiento no debe interpretarse como métrica de éxito de la tarea robótica.
- El fichero es solo de evaluación: no incluye estado del optimizador ni del scheduler, por lo que no permite continuar el entrenamiento de forma exacta.
- Requiere un adaptador de robot compatible y respetar las convenciones originales de acción/gripper de 14 dimensiones; no es un modelo standalone de Transformers.
- La configuración de entrenamiento conserva rutas de sistema de ficheros SIP; en otra máquina hay que ajustar `LONGWAM_MODEL_ROOT` y las rutas de datos, estadísticas y caché.
- La licencia es "other"; deben consultarse los metadatos de licencia del modelo base `Efficient-Large-Model/Long-WAM-YAM` antes de cualquier uso comercial.
- Es un fine-tune específico de una única tarea y un único dataset (100 demostraciones); no se documenta generalización a otras tareas ni a otros robots.
- No se documentan sesgos, riesgos de alucinación ni cobertura multilingüe; al ser un modelo de control robótico, estos conceptos no aplican del mismo modo que en modelos de lenguaje.
- El checkpoint corresponde al epoch 3 de 5; no es el resultado final del run.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Epoch-3
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset: https://huggingface.co/datasets/yuyingyinya/nesting_doll
- Registro de entrenamiento (W&B): https://forge.coreweave.com/wandb/bofang/long-wam/runs/oaplbei2
- Código base LongLive: https://github.com/NVlabs/LongLive (commit `cfa4e91eec59429d583326500bf5535c9ce6eec7`)

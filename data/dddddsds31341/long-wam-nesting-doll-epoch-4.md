# dddddsds31341/Long-WAM-Nesting-Doll-Epoch-4

## Resumen

Long-WAM Nesting Doll — Epoch 4 es un checkpoint de evaluación intermedio (época 4 de 5, paso de optimizador 13716) de un ajuste fino del modelo robótico Long-WAM-YAM sobre la tarea bimanual de anidar muñecas rusas. Lo publica el usuario `dddddsds31341` como artefacto reproducible de un entrenamiento independiente, no como modelo listo para producción: está pensado para evaluar el estado del aprendizaje en un punto concreto del run y para reproducir la configuración exacta de entrenamiento.

El modelo parte de `Efficient-Large-Model/Long-WAM-YAM`, un modelo video-acción con arquitectura de difusión sobre latentes de vídeo (VAE de Wan2.2) y codificador de texto UMT5, especializado en control robótico de dos brazos. Este checkpoint concreto añade un encoder de propiocepción y cabezas de acción que predicen 14 dimensiones absolutas de articulaciones (6 + pinza por brazo) en forma de chunks de 32 pasos, condicionadas por tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) y una instrucción en lenguaje natural.

Su relevancia es acotada pero clara para quien investiga en robótica de imitación: documenta con precisión un pipeline completo (dataset, normalización, hiperparámetros, código de inferencia) y permite estudiar la evolución del aprendizaje en tareas de manipulación bimanual de precisión. No se han publicado métricas de éxito en robot ni validación held-out, por lo que debe tratarse como material de investigación, no como política desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo video-acción (Long-WAM) sobre VAE de Wan2.2 y codificador de texto UMT5, con encoder de propiocepción y cabeza de acción; detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (historial de vídeo P48 y chunk de acción de 32 pasos) |
| Tipos de cuantizacion | no disponible (pesos en el dtype original del entrenamiento, BF16 durante el training) |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural vía UMT5; idiomas no declarados) |
| Licencia | other (hereda la metainformación de licencia de `Efficient-Large-Model/Long-WAM-YAM`; términos concretos no disponibles) |
| Formato de pesos | `model.pt` (PyTorch), más `config.yaml`, `dataset_stats.json`, `code.zip` y `requirements-sip.txt` |

## Arquitectura y entrenamiento

El modelo sigue el diseño Long-WAM: un backbone de difusión video-acción que genera latentes de vídeo y acciones conjuntamente, apoyado en el VAE de Wan2.2 para la representación visual y en UMT5 para el condicionamiento textual. Sobre esa base, este ajuste añade un encoder de propiocepción y produce objetivos de 14 dimensiones absolutas de articulación (6 articulaciones + pinza por brazo, en unidades originales de pinza), con estadísticas z-score específicas de la tarea y recorte de valores normalizados al rango `[-5, 5]`. La entrada visual son tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) procesadas a 384×320, con historial P48 y predicción de chunks de 32 pasos.

El entrenamiento usa el dataset `yuyingyinya/nesting_doll` (revisión `ae8a879c9a635d3c666aba58a4d9ac996225edb8`): 100 demostraciones, 164.571 fotogramas a 30 Hz, todas empleadas para entrenamiento. Se ejecutó en cuatro GPUs con batch de 12 por GPU, acumulación de gradiente 1 (batch global 48), learning rate constante de `1e-5`, AdamW con weight decay 0.01, BF16 y DeepSpeed ZeRO-1. Cada época comprende 3.429 actualizaciones y el run completo apunta a 17.145; este checkpoint corresponde al paso 13716. El código de entrenamiento es una release SIP v22 basada en `NVlabs/LongLive@cfa4e91eec59429d583326500bf5535c9ce6eec7`. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de acciones robóticas bimanuales en espacio articular absoluto (14 dimensiones) condicionadas por instrucción en lenguaje natural.
- Percepción visual multi-cámara con tres vistas simultáneas (cabeza y ambas manos).
- Predicción de chunks de acción de 32 pasos, orientada a control en bucle abierto por tramos.
- Integración de propiocepción mediante encoder dedicado.
- Condicionamiento textual vía UMT5 (instrucción de tarea en lenguaje natural).
- Ejecución de una tarea de manipulación de precisión: anidar muñecas rusas de menor a mayor hasta introducirlas todas en la mayor.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en imitación bimanual: reproducir el ajuste fino con el código incluido (`code.zip`, `requirements-sip.txt`) para estudiar la dinámica de aprendizaje en una tarea de precisión con 100 demostraciones y 164.571 fotogramas.
- Evaluación de checkpoints intermedios: comparar el estado en la época 4 (paso 13716) frente a épocas anteriores o posteriores del mismo run para analizar curvas de aprendizaje, usando `expected_step=13716` y `strict=True` en la carga.
- Análisis de políticas video-acción: estudiar cómo el backbone de difusión sobre latentes de Wan2.2 traduce instrucciones textuales y observaciones multi-cámara en trayectorias articulares de 32 pasos.
- Reproducción de pipelines de normalización: reutilizar `dataset_stats.json` y el recorte `[-5, 5]` para validar el preprocesado y la desnormalización de acciones en tareas de anidamiento similares.
- Benchmark interno de infraestructura: medir throughput y latencia de inferencia de un modelo de 12 GB de repo en distintas GPU (A100, H100, RTX 4090) con el stack SIP, antes de escalar a runs mayores.
- Estudio de generalización en manipulación fina: emplear la tarea de anidar muñecas como banco de pruebas de precisión bimanual, comparando el comportamiento del modelo con y sin adaptadores de robot equivalentes.
- Docencia y divulgación: ilustrar un caso completo de ajuste fino de robótica de imitación con configuración, estadísticas y pesos publicados de forma abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reporta tasa de éxito en robot en bucle cerrado ni resultado de validación held-out, y advierte que la pérdida de entrenamiento no es una métrica de éxito de la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 12,0 GB e incluye pesos en el dtype del entrenamiento (BF16 durante el training), por lo que se requiere al menos una GPU con holgura sobre ese tamaño más los assets externos (VAE de Wan2.2, UMT5 y tokenizer).
- GPU recomendadas: no especificadas por el autor; por el tamaño del artefacto, GPU de datacenter tipo A100 o H100 son las opciones conservadoras.
- ¿Cabe en GPU de consumo? No confirmado. Una RTX 4090 (24 GB) podría alojar los pesos, pero no se ha validado ni se documenta el consumo real con los assets adicionales.
- Opciones de despliegue: el modelo no es un `from_pretrained` estándar de Transformers; requiere el checkout de Long-WAM incluido en `code.zip` y las funciones `longwam.inference.load_run_config` y `load_model`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Variables de entorno relevantes: `LONGWAM_MODEL_ROOT` para reubicar los assets del modelo en otra máquina.
- Latencia y throughput: no disponibles.
- Comprobación realizada por el autor: carga de ficheros en CPU superada; no se reporta inferencia en bucle cerrado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Nesting Doll — Epoch 4 (este) | no disponible | no disponible (P48 + chunk 32) | Anidamiento bimanual, checkpoint intermedio | other | HuggingFace, 20 descargas |
| Efficient-Large-Model/Long-WAM-YAM | no disponible | no disponible | Modelo base video-acción bimanual | other (según metadatos publicados) | HuggingFace |
| Otros modelos robóticos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Checkpoint de evaluación intermedio (época 4 de 5): no representa el estado final del entrenamiento y no se ha validado su rendimiento en robot.
- Sin tasa de éxito en bucle cerrado ni validación held-out: no hay evidencia publicada de que la política funcione fuera del conjunto de entrenamiento.
- La pérdida de entrenamiento no es una métrica de éxito de la tarea; no debe interpretarse como señal de calidad.
- El fichero es solo de evaluación: no incluye estado de optimizador ni scheduler, por lo que no permite reanudar el entrenamiento de forma exacta.
- Dependencia fuerte de assets externos (VAE de Wan2.2, UMT5, tokenizer) y de rutas de configuración; la configuración original conserva rutas del sistema de ficheros del entrenamiento.
- Requiere un adaptador de robot compatible y respetar las convenciones originales de 14D de acción/pinza; un adaptador distinto invalida las predicciones.
- Licencia `other`: los términos concretos heredan del modelo base y no están detallados; es imprescindible revisar la licencia de `Efficient-Large-Model/Long-WAM-YAM` antes de cualquier uso comercial.
- Sesgos conocidos: no documentados; al entrenarse con 100 demostraciones de una única tarea, es esperable un sobreajuste al entorno y a la configuración de cámaras del dataset.
- Riesgo de alucinación: no aplica en el sentido textual, pero la política puede generar trayectorias plausibles no válidas físicamente fuera de la distribución de entrenamiento.
- Idiomas soportados no declarados; el condicionamiento textual depende de UMT5 y de las instrucciones vistas en entrenamiento.
- Repositorio de autor individual con 20 descargas y 0 likes: sin garantías de mantenimiento ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Epoch-4
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset: https://huggingface.co/datasets/yuyingyinya/nesting_doll
- Registro de entrenamiento (Weights & Biases alojado en CoreWeave): https://forge.coreweave.com/wandb/bofang/long-wam/runs/oaplbei2
- Repositorio base del código (LongLive): https://github.com/NVlabs/LongLive (commit `cfa4e91eec59429d583326500bf5535c9ce6eec7`)

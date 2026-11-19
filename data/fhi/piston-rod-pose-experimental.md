# fhi/piston-rod-pose-experimental

## Resumen

Piston rod pose classifier es un modelo de clasificación de imágenes basado en YOLOv8n-cls, desarrollado por Fraunhofer Italia (usuario `fhi` en Hugging Face) en el contexto de un sistema de asistencia visual para ensamblaje manual. El modelo clasifica recortes de la biela del pistón en tres categorías de pose: `correct_pose`, `flipped_pose` y `side_pose`, es decir, determina si la pieza está correctamente orientada o si presenta una orientación invertida o lateral durante el proceso de montaje.

Se trata de un modelo experimental de muy pequeño tamaño (la variante nano de YOLOv8 para clasificación) distribuido como checkpoint de Ultralytics (`best.pt`) y entrenado con la librería Ultralytics 8.4.51. El repositorio tiene un tamaño de 0.0 GB según los metadatos, lo que es coherente con un checkpoint de clasificación de escala nano. No se especifican parámetros totales, longitud de contexto ni idiomas soportados, ya que no es un modelo de lenguaje.

Su relevancia es acotada y de nicho: sirve como componente de visión dentro de un pipeline de asistencia al ensamblaje, no como modelo de propósito general. La precisión reportada en validación es baja (top-1 de 0.28523 en el checkpoint seleccionado y 0.24497 en la última época registrada), lo que indica que se trata de un prototipo en fase experimental más que de un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n-cls (clasificación de imágenes, Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | checkpoint Ultralytics (`best.pt`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLOv8n-cls, la variante nano de la familia YOLOv8 orientada a clasificación de imágenes dentro del framework Ultralytics. Se trata de una red convolucional ligera diseñada para inferencia rápida en entornos con recursos limitados, adecuada para integrarse en sistemas de visión en tiempo real o en el borde. El checkpoint fue generado con Ultralytics 8.4.51, versión registrada en el propio modelo.

El entrenamiento se realizó sobre el dataset público [Pose classifier dataset](https://huggingface.co/datasets/fhi/piston-pose-classification), con tres clases de pose de la biela del pistón. El repositorio incluye `results.csv`, `metrics.json` y `training_config.json` con los resultados y ajustes del entrenamiento, aunque los detalles concretos sobre número de imágenes, composición del dataset o uso de aumentación no están disponibles en la información proporcionada. No se indica que se hayan aplicado técnicas de RLHF, DPO ni innovaciones arquitectónicas adicionales; las métricas publicadas describen únicamente el rendimiento en validación.

## Capacidades

- Clasificación de imágenes en tres clases discretas: `correct_pose`, `flipped_pose` y `side_pose`.
- Procesamiento de recortes (crops) de la pieza como entrada, según indica la model card.
- Integración nativa con la librería Ultralytics mediante la API `YOLO(...).predict(...)`.
- Inferencia ligera adecuada para entornos con recursos limitados, dado el tamaño nano del modelo.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales más allá de la clasificación de pose.

## Casos de uso

- Asistencia al ensamblaje manual: el modelo puede clasificar recortes de la biela del pistón durante el montaje y señalar al operario si la pieza está en la pose correcta, invertida o lateral, integrándose en el sistema de visión descrito en el repositorio de Fraunhofer Italia.
- Verificación de orientación en línea de montaje: dado un crop capturado por una cámara fija, el clasificador devuelve una de las tres etiquetas para validar la orientación antes de fijar la pieza.
- Control de calidad visual de bajo coste: al ser un modelo nano, puede ejecutarse en hardware modesto junto a la estación de trabajo y filtrar piezas mal orientadas antes de etapas posteriores.
- Componente de un pipeline de visión más amplio: el modelo está pensado para consumir recortes de partes, por lo que encaja como etapa de clasificación después de un detector de objetos que localice la biela en la imagen completa.
- Prototipado e investigación en asistencia visual: sirve como base experimental para comparar estrategias de clasificación de pose en ensamblaje manual, con los ficheros de métricas y configuración incluidos en el repositorio.
- Formación y demostraciones: por su tamaño reducido y su API sencilla de Ultralytics, es adecuado para demostrar pipelines de clasificación de imágenes en cursos o pruebas de concepto, siempre advirtiendo de su baja precisión.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son las métricas de validación del propio modelo:

| Metrica | Valor |
|---|---:|
| Top-1 accuracy (checkpoint seleccionado) | 0.28523 |
| Top-1 accuracy (última época registrada) | 0.24497 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por tratarse de YOLOv8n-cls (escala nano), la huella es muy reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del modelo, cualquier GPU consumer moderna (por ejemplo, serie RTX 30/40) es suficiente, e incluso la inferencia en CPU es viable.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer actual, dado el tamaño nano del checkpoint.
- Opciones de despliegue: Ultralytics (API Python `YOLO`), con posibilidad de exportación a formatos soportados por Ultralytics (ONNX, TensorRT, etc.), aunque estas exportaciones no se detallan en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Top-1 validación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fhi/piston-rod-pose-experimental | YOLOv8n-cls | 3 | 0.28523 | AGPL-3.0 | Hugging Face |
| YOLOv8n-cls (checkpoint base Ultralytics) | YOLOv8n-cls | 1000 (ImageNet) | no disponible en esta ficha | AGPL-3.0 | Ultralytics |
| Otros clasificadores de pose de ensamblaje | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables específicos de clasificación de pose de ensamblaje en la documentación proporcionada. La comparación con el checkpoint base de YOLOv8n-cls es estructural (misma arquitectura), pero no se han publicado métricas comparativas en la información disponible.

## Limitaciones y advertencias

- Precisión muy baja: el top-1 de validación es de 0.28523 en el checkpoint seleccionado, lo que en la práctica implica que el modelo falla en la mayoría de las clasificaciones; no es apto para producción sin un reentrenamiento o una revisión sustancial.
- Carácter experimental: el propio nombre del modelo (`experimental`) y las métricas publicadas indican que es un prototipo de investigación.
- Dependencia de recortes: la model card indica que la entrada debe ser crops de la pieza; usarlo sobre imágenes completas puede degradar aún más el rendimiento.
- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse sobre un dataset específico de bielas de pistón, es probable que no generalice a otras piezas, iluminaciones o cámaras.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de clasificación errónea con alta confianza aparente, dado el bajo rendimiento en validación.
- Limitaciones de contexto o idioma: no aplica (modelo de visión sin capacidades lingüísticas).
- Restricciones de licencia: AGPL-3.0; el uso comercial implica obligaciones de copyleft sobre el software que integre el modelo, por lo que debe revisarse antes de su explotación en productos propietarios.
- Caveat para producción: no se recomienda su despliegue en entornos reales sin validación adicional, reentrenamiento con datos propios y monitorización de errores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fhi/piston-rod-pose-experimental
- Dataset de clasificación de pose: https://huggingface.co/datasets/fhi/piston-pose-classification
- Paper y código (Vision assembly assistance): https://github.com/fraunhofer-italia/vision-assembly-assistance
- Licencia AGPL-3.0: https://huggingface.co/fhi/piston-rod-pose-experimental/blob/main/LICENSE

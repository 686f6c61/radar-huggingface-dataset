# Axiomloop/surfaceguard-models

## Resumen

SurfaceGuard models es un repositorio de modelos de segmentación de anomalías en superficies industriales, publicado por el usuario Axiomloop. El repositorio agrupa múltiples ejecuciones de entrenamiento (runs) cuyo objetivo es la detección y segmentación de cuatro tipos de defectos sobre imágenes de resolución 128x800 píxeles. No se trata de un modelo de lenguaje, sino de un conjunto de modelos de visión por computador orientados a una tarea concreta de inspección visual automatizada.

La información disponible en la model card es fundamentalmente una tabla de resultados de validación que compara distintas configuraciones de arquitectura (U-Net con backbone ResNet-34, FPN con ResNet-34 y una U-Net entrenada desde cero), distintas funciones de pérdida (BCE, Dice, combinaciones BCE+Dice) y distintos regímenes de entrenamiento (8 épocas, inicialización preentrenada o desde cero). El repositorio tiene un tamaño de 0,6 GB y no incluye información sobre licencia, idiomas ni pipeline de uso.

El interés de esta ficha es limitado para el público habitual de un blog de IA generativa, ya que no se trata de un modelo fundacional ni de un LLM. Sin embargo, resulta relevante como ejemplo de repositorio de modelos especializados en visión industrial, con métricas de validación publicadas y trazabilidad hacia un proyecto de Weights & Biases. La ausencia de model card descriptiva, licencia y documentación de uso limita seriamente su reproducibilidad y su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con backbone ResNet-34 (mayoría de runs); FPN con ResNet-34; U-Net desde cero (7.763.140 parámetros) |
| Parametros totales | 24.436.804 (U-Net ResNet-34); 24.430.532 (variante gray); 23.155.780 (FPN ResNet-34); 7.763.140 (U-Net desde cero) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imágenes 128x800) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; tarea de visión) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 0,6 GB; no se detalla el formato) |

## Arquitectura y entrenamiento

Los modelos del repositorio son redes convolucionales de segmentación semántica binaria o multiclase orientadas a la detección de defectos superficiales. La configuración dominante es una U-Net con encoder ResNet-34, con 24.436.804 parámetros, entrenada con funciones de pérdida BCE, Dice o combinaciones BCE+Dice. También se incluyen variantes con encoder FPN ResNet-34 (23.155.780 parámetros) y una U-Net entrenada desde cero con 7.763.140 parámetros. Las imágenes de entrada tienen una resolución de 128x800 píxeles y la tarea cubre cuatro tipos de defectos.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el número de tokens (no aplica) ni sobre técnicas de aumento de datos, regularización o ajuste fino. La model card únicamente incluye la tabla de resultados de validación con métricas agregadas (score, dice, f1_macro, pixel_acc) por ejecución. Se mencionan regímenes de entrenamiento de 8 épocas en varias ejecuciones (sufijo `-8ep`) y variantes con inicialización preentrenada frente a entrenamiento desde cero. La inicialización preentrenada del backbone parece asociada a mejores resultados en las configuraciones U-Net ResNet-34.

## Capacidades

- Segmentación de anomalías superficiales en imágenes industriales de 128x800 píxeles.
- Detección de cuatro tipos de defectos (la model card no detalla cuáles).
- Segmentación binaria o multiclase según la configuración de la cabeza de salida.
- Evaluación mediante métricas de solapamiento (Dice, F1 macro) y precisión por píxel.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la entrada de imagen.

## Casos de uso

- Inspección visual automatizada en líneas de fabricación: el modelo segmenta defectos superficiales sobre imágenes de 128x800 píxeles, lo que permite señalizar regiones sospechosas para revisión humana en entornos de control de calidad.
- Preetiquetado de datasets de defectos: las salidas de segmentación pueden usarse como propuesta inicial para acelerar el etiquetado manual de nuevas imágenes industriales, reduciendo el coste de anotación.
- Control de calidad en producción por lotes: integrado en un pipeline de visión, el modelo puede procesar imágenes capturadas por cámaras industriales y generar máscaras de defecto para su clasificación posterior.
- Monitorización de superficies en mantenimiento predictivo: aplicable a la detección temprana de anomalías en superficies metálicas, textiles o recubrimientos, siempre que el dominio coincida con el de entrenamiento.
- Investigación en segmentación de anomalías: el repositorio sirve como referencia de comparación de arquitecturas (U-Net vs FPN) y funciones de pérdida (BCE vs Dice vs combinadas) sobre un mismo dataset.
- Evaluación de técnicas de inicialización: las variantes preentrenadas frente a las entrenadas desde cero permiten estudiar el impacto del transfer learning en tareas de segmentación industrial con pocas épocas.
- Prototipado rápido en entornos de I+D: el tamaño reducido de los modelos (7,7M a 24,4M de parámetros) facilita su despliegue en hardware modesto para pruebas de concepto.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a validación sobre el dataset propio del autor. Se muestran las mejores ejecuciones por configuración:

| Run | Params | Score | Dice | F1 macro | Pixel acc |
|---|---|---|---|---|---|
| 5-unet-resnet34-bce | 24.436.804 | 0,662196 | 0,524287 | 0,543751 | 0,995615 |
| 4b-unet-resnet34-bce_dice-8ep | 24.436.804 | 0,637148 | 0,512918 | 0,390207 | 0,992535 |
| 5-unet-resnet34-bce-8ep | 24.436.804 | 0,626108 | 0,471110 | 0,414089 | 0,995324 |
| 2-unet-resnet34-pretrained-bce_dice | 24.436.804 | 0,606762 | 0,465905 | 0,385044 | 0,990593 |
| 4-unet-resnet34-gray-bce_dice | 24.430.532 | 0,598955 | 0,460546 | 0,370157 | 0,991895 |
| 1-scratch-unet-bce_dice | 7.763.140 | 0,549552 | 0,382638 | 0,293855 | 0,989955 |
| 6-unet-resnet34-dice-8ep | 24.436.804 | 0,513731 | 0,444995 | 0,308442 | 0,901961 |
| 3-fpn-resnet34-pretrained-bce_dice | 23.155.780 | 0,501997 | 0,290444 | 0,342990 | 0,994151 |

No se han publicado comparaciones con modelos externos ni resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros), ya que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 24,4M de parámetros y entradas de 128x800, la huella es muy reducida (del orden de cientos de MB en FP32, menos en FP16).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en tarjetas con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), aunque el dato no está confirmado en la documentación.
- Opciones de despliegue: no documentadas. Al ser un modelo de visión, sería desplegable mediante PyTorch, TorchScript u ONNX Runtime, pero el repositorio no especifica formatos ni scripts de inferencia.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Params | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SurfaceGuard (U-Net ResNet-34) | Segmentación de anomalías | 24,4M | 128x800 píxeles | no disponible | HuggingFace (Axiomloop/surfaceguard-models) |
| SurfaceGuard (U-Net desde cero) | Segmentación de anomalías | 7,7M | 128x800 píxeles | no disponible | HuggingFace (mismo repo) |
| SurfaceGuard (FPN ResNet-34) | Segmentación de anomalías | 23,1M | 128x800 píxeles | no disponible | HuggingFace (mismo repo) |

No se dispone de información sobre modelos comparables externos (por ejemplo, arquitecturas de segmentación de anomalías industriales de otros autores) en la documentación proporcionada.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no se documentan datos de entrenamiento, composición del dataset, tipos de defectos ni procedimiento de anotación.
- Licencia no especificada: no es posible determinar si el uso comercial está permitido; esto bloquea su adopción en producción sin aclaración previa del autor.
- Sin información sobre sesgos: al no conocerse la procedencia de los datos, no puede evaluarse el sesgo de dominio (tipo de material, iluminación, cámara, geografía industrial).
- Riesgo de sobreajuste al dominio: los modelos se han entrenado sobre un dataset concreto de 128x800 píxeles y cuatro tipos de defectos; su generalización a otras resoluciones, materiales o tipos de defecto no está demostrada.
- Métricas modestas: el mejor Dice es 0,524 y el mejor F1 macro 0,544, lo que indica un rendimiento limitado incluso en validación; la precisión por píxel elevada (≈0,99) es engañosa por el desbalance de clases típico en segmentación de defectos.
- Sin pipeline declarado en HuggingFace: no hay `pipeline_tag`, lo que dificulta el uso directo con las utilidades de la plataforma.
- Sin formatos de pesos documentados: no se indica si hay safetensors, GGUF, ONNX u otros; el repositorio de 0,6 GB sugiere pesos en bruto, pero no se confirma.
- Sin instrucciones de uso ni scripts de inferencia: la reproducibilidad depende de reconstruir la arquitectura a partir de los nombres de las runs.
- Fecha de creación futura (2026-11-01): inconsistencia temporal que conviene verificar antes de confiar en los metadatos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Axiomloop/surfaceguard-models
- Proyecto W&B: https://wandb.ai/axiomloops-indian-institute-of-technology-madras/24f3002363-t32026

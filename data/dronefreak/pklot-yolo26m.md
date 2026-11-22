# dronefreak/pklot-yolo26m

## Resumen

`dronefreak/pklot-yolo26m` es un detector de objetos YOLO26m afinado sobre el conjunto de datos PKLot para la tarea de ocupación de plazas de aparcamiento (parking lot occupancy). Lo desarrolla el usuario de Hugging Face `dronefreak` en el marco de DetectionBench, un framework para reproducir el entrenamiento y la evaluación de detectores modernos con recetas idénticas sobre múltiples conjuntos de datos reales. El modelo resuelve la clasificación y localización de plazas libres (`vacant`) y ocupadas (`occupied`) en imágenes de aparcamientos, un problema clásico de visión por computador con aplicación directa en gestión de infraestructuras y smart parking.

Se trata de un fine-tuning del modelo base `Ultralytics/YOLO26` en su variante `m` (medium), con 21.832.164 parámetros totales y un coste de 75,4 GFLOPs a 640 px. El repositorio ocupa 0,1 GB y se distribuye en formato PyTorch (`best.pt`) para su uso con la librería Ultralytics. La licencia es AGPL-3.0, lo que condiciona su uso en productos propietarios.

Su relevancia actual radica en que el autor publica una comparativa completa (el "PKLot Model Zoo") con otros detectores entrenados bajo la misma receta, lo que permite evaluar el rendimiento relativo de YOLO26m frente a YOLO11n, YOLOv8n, YOLO26n, YOLOv8s, YOLO26s, RF-DETR Nano y YOLOv8m en el mismo benchmark. El modelo declara un mAP@50 del 99,41 % y un mAP@50-95 del 94,92 % en el split de test de PKLot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26m (detector de objetos de la familia Ultralytics YOLO, una etapa) |
| Parametros totales | 21.832.164 (21,9 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el repo solo incluye `best.pt` en precisión de entrenamiento) |
| Idiomas soportados | no aplica (modelo de visión; las clases son etiquetas: `vacant`, `occupied`) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`); el repo incluye también `args.yaml`, `results.csv` y curvas de evaluación |
| Framework de inferencia | Ultralytics (`ultralytics` + `huggingface_hub`) |
| FLOPs | 75,4 GFLOPs a 640 px |
| Resolución de entrenamiento | 960 px |
| Tarea | Object detection (detección densa de plazas de aparcamiento) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de YOLO26m, la variante medium de la familia YOLO26 de Ultralytics. Se trata de un detector de una sola etapa (single-stage) basado en una red troncal convolucional con cuello de agregación de características y cabecera de detección densa, adecuado para escenas con muchos objetos pequeños y próximos entre sí como son las plazas de un aparcamiento. El modelo base es `Ultralytics/YOLO26` y el fine-tuning se ha realizado con el toolkit DetectionBench, que estandariza la receta de entrenamiento para permitir comparaciones reproducibles entre detectores.

La configuración de entrenamiento declarada es la siguiente: 60 épocas configuradas y 60 épocas realmente entrenadas, paciencia de early stopping de 15, batch size automático (Ultralytics AutoBatch), tamaño de imagen de 960 px, optimizador AdamW con learning rate inicial de 0,001 y semilla 0. El conjunto de datos es PKLot, con dos clases (`vacant` y `occupied`). No se especifica en la información disponible el número de tokens ni la composición detallada del dataset más allá de la referencia a la dataset card `dronefreak/PKLot`. Tampoco se documenta el uso de RLHF, DPO ni técnicas de decodificación especulativa, que no aplican a un detector de objetos.

Como innovación destacable, el autor publica el "PKLot Model Zoo" con todos los modelos entrenados y evaluados bajo la misma receta, lo que constituye un ejercicio de transparencia y reproducibilidad poco habitual en fine-tunings de detección. El pipeline de evaluación es `detectionbench-evaluate`, y los resultados se declaran como no verificados (`verified: false`) en el model-index.

## Capacidades

- Detección de objetos en imágenes de aparcamientos con dos clases: `vacant` (plaza libre) y `occupied` (plaza ocupada).
- Localización mediante cajas delimitadoras de cada plaza, con puntuaciones de confianza por detección.
- Detección densa: maneja escenas con muchas instancias pequeñas y próximas, típicas de vistas cenitales o en perspectiva de aparcamientos.
- Inferencia sobre imágenes individuales mediante `model.predict(source=..., conf=0.25)`.
- Integración con el ecosistema Ultralytics (entrenamiento, validación, exportación a otros formatos soportados por la librería).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Gestión de ocupación en aparcamientos urbanos: el modelo detecta plazas libres y ocupadas en imágenes de cámaras fijas, permitiendo calcular en tiempo real la tasa de ocupación de un parking y alimentar paneles de disponibilidad. Su mAP@50-95 del 94,92 % en PKLot lo hace adecuado para este dominio específico.
- Smart parking y señalización dinámica: integrado en un pipeline de captura periódica, el detector puede actualizar carteles o apps móviles que indiquen plazas disponibles por zona, reduciendo el tiempo de búsqueda de aparcamiento.
- Analítica histórica de uso: procesando grabaciones o imágenes archivadas, el modelo permite construir series temporales de ocupación por franja horaria y estimar patrones de demanda para planificación urbana.
- Vigilancia y control de accesos: detección de vehículos en zonas reservadas o de carga y descarga, generando alertas cuando se detecta ocupación indebida en plazas restringidas.
- Automatización de auditorías de aparcamiento: sustitución de inspecciones manuales en aparcamientos de gran superficie (centros comerciales, aeropuertos, hospitales) mediante procesamiento por lotes de imágenes.
- Investigación en visión por computador: como baseline reproducible dentro de DetectionBench para comparar detectores modernos bajo la misma receta de entrenamiento y evaluación en el benchmark PKLot.
- Prototipado rápido en aplicaciones de infraestructura: gracias a la integración con Ultralytics, se puede desplegar en pocas líneas de código y exportar a formatos de inferencia optimizados para edge.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test de PKLot (métricas no verificadas, `verified: false`):

| Métrica | Valor (%) |
|---|---|
| mAP@50 | 99,41 |
| mAP@50-95 | 94,92 |
| Precision | 99,6 |
| Recall | 99,64 |
| F1 Score | 99,62 |

Rendimiento por clase en PKLot:

| Clase | mAP@50 (%) | mAP@50-95 (%) |
|---|---|---|
| vacant | 99,48 | 96,51 |
| occupied | 99,34 | 93,34 |

Comparativa del PKLot Model Zoo publicada por el autor (misma receta de entrenamiento y evaluación):

| Modelo | mAP@50 (%) | mAP@50-95 (%) | Precision (%) | Recall (%) |
|---|---|---|---|---|
| YOLO11n | 99,42 | 94,99 | 99,78 | 99,92 |
| YOLO26n | 99,42 | 94,6 | 99,66 | 99,37 |
| YOLOv8n | 99,42 | 94,85 | 99,49 | 98,68 |
| **YOLO26m (este modelo)** | **99,41** | **94,92** | **99,6** | **99,64** |
| YOLOv8s | 99,33 | 95,33 | 99,5 | 96,18 |
| YOLO26s | 99,31 | 94,32 | 99,52 | 92,31 |
| RF-DETR Nano | 98,93 | 91,63 | 99,66 | 99,81 |
| YOLOv8m | 98,41 | 95,4 | 99,55 | 97,67 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 21,9 M de parámetros y 75,4 GFLOPs a 640 px, el modelo es ligero y cabe holgadamente en GPUs de consumo; una estimación orientativa en FP32 sería de menos de 1 GB de pesos, aunque el dato no está confirmado por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia; para entrenamiento con batch auto y 960 px se recomienda al menos una GPU con 8-16 GB de VRAM.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más, aunque no hay confirmación oficial.
- Opciones de despliegue: Ultralytics (`ultralytics`), exportación a formatos soportados por la librería (ONNX, TensorRT, OpenVINO, etc., no documentados en el repo), y descarga vía `huggingface_hub`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparación con alternativas del mismo benchmark PKLot y misma receta (datos del PKLot Model Zoo del autor):

| Modelo | Parámetros | mAP@50 (%) | mAP@50-95 (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26m (este modelo) | 21,9 M | 99,41 | 94,92 | AGPL-3.0 | Hugging Face |
| YOLO11n | no disponible | 99,42 | 94,99 | AGPL-3.0 (Ultralytics) | Hugging Face / Ultralytics |
| YOLO26n | no disponible | 99,42 | 94,6 | AGPL-3.0 (Ultralytics) | Hugging Face / Ultralytics |
| YOLOv8s | no disponible | 99,33 | 95,33 | AGPL-3.0 (Ultralytics) | Hugging Face / Ultralytics |
| RF-DETR Nano | no disponible | 98,93 | 91,63 | no disponible | Hugging Face / Roboflow |

En términos de mAP@50, los modelos nano de la familia YOLO igualan o superan ligeramente a YOLO26m con muchas menos operaciones, lo que sugiere que PKLot es un benchmark relativamente saturado y que la variante medium no aporta una ventaja clara en precisión bruta. En mAP@50-95, YOLOv8s (95,33 %) y YOLOv8m (95,4 %) superan a YOLO26m (94,92 %), mientras que este último mantiene un recall alto (99,64 %). La elección entre estos modelos dependerá del equilibrio entre coste computacional, recall y precisión en cajas ajustadas.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado exclusivamente en PKLot, por lo que su rendimiento puede degradarse en condiciones de iluminación, clima, perspectiva de cámara o tipos de aparcamiento distintos a los del dataset. No hay información sobre la diversidad geográfica o temporal de PKLot en la información proporcionada.
- Riesgo de alucinación: como todo detector, puede generar falsos positivos en escenas con objetos que se parezcan visualmente a plazas o vehículos (sombras, marcas viales, motos, carritos). El umbral de confianza (`conf=0.25` en el ejemplo) debe calibrarse para cada despliegue.
- Limitaciones de contexto o idioma: no aplica en el sentido lingüístico, pero el modelo solo reconoce dos clases (`vacant`, `occupied`) y no distingue tipos de vehículo, matrículas ni estado de la plaza más allá de la ocupación binaria.
- Restricciones de licencia: AGPL-3.0 implica obligaciones de copyleft para obras derivadas y para el uso en servicios en red; el uso comercial en productos propietarios requiere evaluar el cumplimiento o negociar una licencia alternativa con Ultralytics.
- Caveats para producción: las métricas declaradas no están verificadas (`verified: false`) y provienen del propio autor; conviene revalidar en el conjunto de datos objetivo antes de desplegar. El repo solo incluye pesos en formato PyTorch (`best.pt`), sin versiones cuantizadas ni exportadas documentadas.
- El modelo base YOLO26 y la librería Ultralytics pueden tener sus propias condiciones de licencia que afectan al uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/pklot-yolo26m
- Dataset PKLot en Hugging Face: https://huggingface.co/datasets/dronefreak/PKLot
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Paper referenciado en los tags: arXiv:2606.03748 (no se dispone de URL directa verificada en la información proporcionada)

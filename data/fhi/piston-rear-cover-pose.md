# fhi/piston-rear-cover-pose

## Resumen

`fhi/piston-rear-cover-pose` es un clasificador de imagen basado en YOLOv8n-cls, publicado por Fraunhofer Italia (usuario `fhi`) dentro de su línea de trabajo sobre asistencia visual al ensamblaje manual. El modelo resuelve una tarea muy acotada: clasificar la pose de una cubierta trasera de pistón en tres categorías (`correct_pose`, `flipped_pose`, `side_pose`) a partir de recortes de la pieza, no de imágenes completas de la escena.

Se trata de un modelo de visión de muy pequeño tamaño (la variante `n` de YOLOv8 en su rama de clasificación), entrenado con Ultralytics 8.4.51 y distribuido en formato de pesos PyTorch (`best.pt`). No es un modelo de lenguaje ni un modelo multimodal general: es un componente especializado dentro de un sistema mayor de verificación de ensamblaje, y su relevancia radica en que demuestra el patrón de uso de clasificadores ligeros como verificadores de estado en líneas de montaje.

La información pública disponible es escasa: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño del repo figura como 0.0 GB y no se han publicado detalles sobre el dataset de entrenamiento más allá del enlace al dataset asociado. La model card se limita a la receta de inferencia, la tabla de accuracy de validación y las referencias al paper y al código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n-cls (red convolucional de clasificación de imágenes de la familia YOLOv8, escala nano) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos `.pt`; no se documentan exportaciones ONNX, TensorRT ni cuantizaciones) |
| Idiomas soportados | no aplica (modelo de visión sin componente lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`, checkpoint `weights/best.pt`) |

## Arquitectura y entrenamiento

La arquitectura es YOLOv8n-cls, la variante de clasificación de imágenes de YOLOv8 en su escala más pequeña. A diferencia de las variantes de detección y segmentación, la cabeza de clasificación devuelve una distribución sobre las clases definidas, que en este caso son tres: `correct_pose`, `flipped_pose` y `side_pose`. El checkpoint fue generado con Ultralytics 8.4.51, según se indica en la model card.

El entrenamiento se realizó sobre el dataset `fhi/piston-pose-classification`, enlazado desde la model card. No se especifican en la información disponible el número de imágenes, la composición del dataset, el número de épocas, la resolución de entrada ni si hubo aumento de datos. Tampoco se documenta ningún proceso de ajuste fino adicional más allá del entrenamiento supervisado de clasificación. Los artefactos `results.csv`, `metrics.json` y `training_config.json` del repositorio contendrían los detalles de configuración y curvas de entrenamiento, pero su contenido no se ha proporcionado.

## Capacidades

- Clasificación de imagen en tres clases de pose de una cubierta trasera de pistón: `correct_pose`, `flipped_pose` y `side_pose`.
- Trabajo sobre recortes de la pieza (`crop.jpg`), es decir, el modelo asume que la región de interés ya ha sido localizada por un paso previo de detección o segmentación.
- Inferencia mediante la API de Ultralytics: `YOLO("weights/best.pt").predict(...)`.
- Integración en pipelines de visión industrial como verificador de estado tras una etapa de detección.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni modo de razonamiento extendido.

## Casos de uso

- Verificación de pose en línea de ensamblaje: tras un detector que localice la cubierta trasera del pistón, el clasificador confirma que la pieza está en la orientación correcta antes de permitir el siguiente paso del montaje, con una accuracy de validación top-1 de 0,96075.
- Control de calidad en estación de montaje manual: el operario coloca la pieza y el modelo detecta si está invertida (`flipped_pose`) o de lado (`side_pose`), señalizando el error en pantalla antes de que se propague al subensamblaje.
- Asistencia visual al operario (vision assembly assistance): el modelo forma parte del sistema descrito en el repositorio `fraunhofer-italia/vision-assembly-assistance`, donde la clasificación de pose alimenta la guía paso a paso del montaje.
- Validación de crops en un pipeline de preprocesado: como el modelo espera recortes, sirve para verificar que la etapa de detección previa ha aislado correctamente la pieza y que la pose es coherente con la etapa del proceso.
- Prototipado rápido de verificadores de pose para nuevas referencias: al ser un YOLOv8n-cls, el coste de reentrenamiento sobre un dataset pequeño de crops es bajo, lo que permite replicar el patrón en otras piezas de la línea.
- Despliegue en hardware de borde en la propia célula de montaje: la escala nano de YOLOv8 está pensada para inferencia de baja latencia en dispositivos modestos, aunque no se han publicado medidas concretas de latencia ni throughput para este checkpoint.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Validation top-1 (checkpoint seleccionado) | 0.96075 |
| Validation top-1 (última época registrada) | 0.95848 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, matrices de confusión por clase, precisión/recall por clase o comparación con otros clasificadores) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por la escala nano de YOLOv8-cls, el requisito es del orden de cientos de MB, pero el dato no está publicado para este checkpoint.
- GPU recomendadas: no disponible. No se documentan GPU de referencia ni perfiles de despliegue.
- GPU de consumo: no confirmado en la información proporcionada, aunque la familia YOLOv8n está diseñada para ejecutarse en GPUs de consumo e incluso en CPU.
- Opciones de despliegue: la única vía documentada es Ultralytics (`from ultralytics import YOLO`). No se documentan exportaciones a ONNX, TensorRT, OpenVINO ni integraciones con vLLM, llama.cpp, Ollama o TGI (estas últimas no aplican a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `fhi/piston-rear-cover-pose` | Clasificación de pose de cubierta trasera de pistón (3 clases) | no disponible | no aplica | top-1 validación 0.96075 | AGPL-3.0 | Hugging Face, 0 descargas |
| YOLOv8n-cls genérico (Ultralytics) | Clasificación de imágenes ImageNet | no disponible en la información | no aplica | no disponible en la información | AGPL-3.0 | Público |
| Clasificadores de pose industrial a medida | Clasificación de orientación de piezas | no disponible | no aplica | no disponible | variable | no disponible |

No se dispone de datos públicos de rendimiento de alternativas comparables sobre esta misma tarea, por lo que la comparación cuantitativa no es posible con la información disponible.

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: solo clasifica tres poses de una pieza concreta (cubierta trasera de pistón). No es reutilizable fuera de ese contexto sin reentrenamiento.
- Requiere recortes de la pieza como entrada; el rendimiento sobre imágenes completas de la escena no está documentado y probablemente se degrade.
- No se han publicado métricas por clase (precisión, recall, F1) ni matrices de confusión, por lo que no se conoce el comportamiento diferencial entre `correct_pose`, `flipped_pose` y `side_pose`.
- Riesgo de falsos negativos en producción: una accuracy global de 0,96075 implica en torno a un 4 % de errores en validación, y no se documenta el umbral de confianza recomendado ni la calibración del modelo.
- No se documentan sesgos conocidos, composición del dataset ni condiciones de captura (iluminación, fondo, cámara), lo que impide evaluar la robustez ante cambios de dominio.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el software que incorpore el modelo y se distribuya o se ofrezca como servicio en red; debe revisarse con cuidado antes de integrarlo en un producto propietario.
- El repositorio figura con 0 descargas y 0 likes, y el tamaño del repo aparece como 0.0 GB, lo que sugiere un artefacto muy pequeño o un empaquetado incompleto; conviene verificar la integridad de los pesos antes de usarlos.
- No hay información sobre mantenimiento, versionado ni soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fhi/piston-rear-cover-pose
- Dataset de clasificación de pose: https://huggingface.co/datasets/fhi/piston-pose-classification
- Paper y código (Vision assembly assistance): https://github.com/fraunhofer-italia/vision-assembly-assistance
- Licencia AGPL-3.0: https://huggingface.co/fhi/piston-rear-cover-pose/blob/main/LICENSE
- Ultralytics (librería): https://github.com/ultralytics/ultralytics

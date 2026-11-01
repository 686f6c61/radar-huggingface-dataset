# Has1tas/yolo12s-aerial-vehicle-person

## Resumen

YOLO12s-aerial-vehicle-person es un detector de objetos basado en la arquitectura YOLO12 en su variante "s" (small), ajustado para detectar personas y vehículos en imágenes aéreas capturadas desde drones o UAV. Lo publica el usuario Has1tas (identificado en la model card como hasbitas) como un proyecto independiente orientado a la competición TEKNOFEST de imágenes aéreas. El modelo resuelve la tarea de detección de dos clases concretas (persona y vehículo) sobre vistas cenitales, un dominio en el que los detectores genéricos entrenados con imágenes a nivel del suelo rinden peor por la escala reducida de los objetos, la perspectiva y la variabilidad de iluminación.

El checkpoint se generó mediante Ultralytics 8.4.38 con la arquitectura `yolov12s.yaml`, entrenado a 640 píxeles de resolución con batch size 8 y hasta 100 épocas solicitadas (la época guardada es la 48, índice zero-based). Los pesos se distribuyen en formato `.pt` de PyTorch, el formato nativo de Ultralytics, y el repositorio incluye metadatos de entrenamiento y un informe de verificación de empaquetado. La licencia es AGPL-3.0, heredada del framework Ultralytics del que deriva.

Es relevante ahora por su nicho muy específico: detección aérea de dos clases en el contexto de competiciones de drones, con métricas de validación agregadas publicadas (mAP50 de 0,885 y mAP50-95 de 0,506) y una corrección documentada del orden de las etiquetas de clase respecto al checkpoint original. No es un modelo de propósito general ni un benchmark independiente, sino un artefacto de competición con utilidad acotada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO12s (checkpoint `yolov12s.yaml`, Ultralytics 8.4.38) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (formato nativo `.pt`; no se documentan exportaciones a ONNX, TensorRT ni GGUF) |
| Idiomas soportados | no aplica (detección de objetos; las etiquetas de clase se publican en inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (`yolo12s-aerial-vehicle-person.pt`) |

Otros datos técnicos relevantes extraídos de la model card:

| Parametro | Valor |
|---|---|
| Resolución de entrenamiento (`imgsz`) | 640 |
| Batch size | 8 |
| Épocas solicitadas | 100 |
| Época guardada (zero-based) | 48 |
| Fecha del checkpoint | 2026-04-17T12:39:56 |
| Clases | 0 = Person, 1 = Vehicle |
| Tamaño del repositorio | 0,0 GB (según HuggingFace) |
| Descargas | 29 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO12 en variante small, tal como queda registrado en el campo `train_args` del checkpoint (`yolov12s.yaml`). YOLO12 es la familia de detectores de Ultralytics que introduce mecanismos de atención en el backbone y el cuello, manteniendo el paradigma de detección en una sola pasada y la salida en forma de cajas delimitadoras con puntuaciones de clase. El checkpoint fue entrenado con Ultralytics 8.4.38 a 640 píxeles de entrada, batch de 8 y hasta 100 épocas solicitadas; el estado guardado corresponde a la época 48 (índice zero-based), lo que indica que el entrenamiento no completó necesariamente todas las épocas configuradas.

No se documenta el número de tokens ni la composición del dataset: la model card indica explícitamente que el entrenamiento se realizó sobre un dataset privado pequeño no publicado, y que ni el tamaño ni la composición exacta del split pueden establecerse a partir de los metadatos del checkpoint. No se menciona RLHF, DPO ni técnicas de alineación (no aplican a un detector). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal más allá de lo que aporta la propia arquitectura YOLO12. El checkpoint fue sanitizado (se eliminó el estado del optimizador y se redujeron rutas locales a nombres base) y se verificó la equivalencia de predicciones con el original sobre tres imágenes.

## Capacidades

- Detección de objetos en imágenes aéreas: dibuja cajas delimitadoras con identificador de clase y puntuación de confianza para las dos clases entrenadas (persona y vehículo).
- Inferencia sobre CPU: la model card confirma que funciona sin GPU NVIDIA, con `device="cpu"`.
- Salida estructurada: cada resultado expone `results[0].boxes` con coordenadas, IDs de clase y confianzas, apto para postprocesado programático.
- Umbral de confianza configurable (ejemplo con `conf=0.25`).
- Guardado de predicciones visuales con cajas y etiquetas superpuestas (`results[0].save(...)`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un detector puro, no un modelo de lenguaje.
- No soporta capacidades multilingües ni generación de texto.
- No incluye clases de zonas de aterrizaje ni estimación de movimiento de vehículos a partir de una sola imagen (limitación declarada explícitamente por el autor).

## Casos de uso

- Detección de personas en imágenes de dron para competiciones TEKNOFEST: el modelo está entrenado específicamente sobre imágenes aéreas de ese contexto, por lo que es adecuado para tareas de localización de personas en vistas cenitales dentro de ese dominio acotado.
- Conteo de vehículos en estacionamientos o vías vistas desde el aire: permite extraer el número de cajas de clase Vehicle mediante `results[0].boxes`, útil para análisis de ocupación en imágenes capturadas a altitudes similares a las del entrenamiento.
- Prototipado rápido en pipelines de visión aérea: al cargarse con `ultralytics` y `huggingface_hub` en pocas líneas, sirve como punto de partida para validar una idea de detección aérea antes de invertir en un dataset propio.
- Análisis offline de fotogramas de vídeo de UAV: la model card menciona que se compararon predicciones sobre fotogramas de vídeo, lo que indica que el modelo puede aplicarse a frames extraídos de grabaciones aéreas para tareas de revisión posterior.
- Educación y demostraciones de detección aérea: el ejemplo de la model card muestra predicciones reales sobre una imagen de test, útil para ilustrar el funcionamiento de un detector YOLO en dominio aéreo en material docente o demos.
- Base para fine-tuning en dominios aéreos relacionados: al ser un checkpoint Ultralytics estándar, puede recargarse y reentrenarse sobre un dataset propio de personas y vehículos vistos desde el aire, sirviendo como inicialización.
- Integración en aplicaciones de inspección visual con CPU: al funcionar sin GPU, puede desplegarse en entornos de borde o portátiles para revisiones no críticas de imágenes aéreas.

## Benchmarks y rendimiento

Métricas de validación agregadas almacenadas en el checkpoint (split de validación propio del proyecto, no un benchmark independiente):

| Metrica | Valor |
|---|---|
| Precision (B) | 0,87772 |
| Recall (B) | 0,84781 |
| mAP50 (B) | 0,88524 |
| mAP50-95 (B) | 0,50612 |
| val/box_loss | 2,31104 |
| val/cls_loss | 2,80552 |
| val/dfl_loss | 1,02543 |
| fitness | 0,50612 |

No se publican métricas por clase en el checkpoint. No se han publicado resultados de benchmarks independientes (COCO, VisDrone u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ser un YOLO12s a 640 píxeles, la huella es reducida y la model card confirma que la inferencia en CPU es viable.
- GPU recomendadas: no se especifican en la información proporcionada; el ejemplo oficial usa CPU (`device="cpu"`).
- ¿Cabe en GPU de consumo? No se documenta, pero el tamaño del repositorio (0,0 GB según HuggingFace) y la variante "s" sugieren un modelo ligero; no se confirma con datos del autor.
- Opciones de despliegue: Ultralytics (carga nativa con `YOLO(path)`), con dependencias `ultralytics` y `huggingface_hub`. No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Contexto / entrada | Métricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Has1tas/yolo12s-aerial-vehicle-person | YOLO12s | 2 (persona, vehículo) | 640 px | mAP50 0,885; mAP50-95 0,506 (validación propia) | AGPL-3.0 | HuggingFace |
| Has1tas/yolo26s-aerial-uav | YOLO26s | no disponible en la información | no disponible | no disponible | no disponible | HuggingFace |
| Has1tas/yolo26m-landing-zones | YOLO26m | zonas de aterrizaje | no disponible | no disponible | no disponible | HuggingFace |
| YOLO12s estándar (Ultralytics) | YOLO12s | 80 (COCO) | 640 px | no disponible en esta información | AGPL-3.0 | Repositorio Ultralytics |

Los modelos del mismo autor tienen layouts de clase distintos y la model card advierte explícitamente que no deben asumirse intercambiables.

## Limitaciones y advertencias

- Dataset de entrenamiento privado y pequeño, no publicado; su tamaño y composición no pueden establecerse a partir de los metadatos del checkpoint.
- Las imágenes y etiquetas específicas de la competición pueden no generalizar a nuevas cámaras, altitudes, ubicaciones o condiciones de iluminación.
- Objetos pequeños, oclusiones y escenas no vistas pueden provocar detecciones perdidas o etiquetas incorrectas.
- Las métricas agregadas no establecen el rendimiento por clase; no se publican métricas por clase.
- No es un sistema certificado de control de vuelo, respuesta a emergencias ni seguridad de aterrizaje; el autor lo declara explícitamente.
- No incluye clases de zonas de aterrizaje ni estimación de movimiento de vehículos desde una sola imagen.
- El orden de las etiquetas de clase fue corregido respecto al checkpoint original (los pesos y los IDs de clase se mantuvieron); conviene verificar la correspondencia clase-etiqueta en integraciones.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el código que lo integre en servicios en red; revisar implicaciones para uso comercial.
- Riesgo de sesgo derivado del dominio de entrenamiento (TEKNOFEST), con posible peor rendimiento fuera de ese contexto.
- No se documentan cuantizaciones ni exportaciones a otros formatos, lo que limita el despliegue en runtimes no PyTorch sin trabajo adicional.
- Las métricas provienen del split de validación propio del proyecto y no constituyen un benchmark independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Has1tas/yolo12s-aerial-vehicle-person
- Pesos: https://huggingface.co/Has1tas/yolo12s-aerial-vehicle-person/blob/main/yolo12s-aerial-vehicle-person.pt
- Proyecto y código fuente: https://github.com/hasbitas/aerial-detection-pipeline
- Licencia del proyecto: https://github.com/hasbitas/aerial-detection-pipeline/blob/main/LICENSE
- Modelo relacionado yolo26s-aerial-uav: https://huggingface.co/Has1tas/yolo26s-aerial-uav
- Modelo relacionado yolo26m-landing-zones: https://huggingface.co/Has1tas/yolo26m-landing-zones
- Perfil del autor en GitHub: https://github.com/hasbitas
- Framework Ultralytics: https://github.com/ultralytics/ultralytics

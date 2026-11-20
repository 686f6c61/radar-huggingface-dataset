# CAROCH/clasificador-residuos-yolo11

## Resumen

El clasificador de residuos reciclables de CAROCH es un modelo de clasificación de imágenes basado en YOLO11-cls y exportado a ONNX, desarrollado como módulo de clasificación de una tesis de maestría en Inteligencia Artificial de la Universidad de La Salle. Resuelve una tarea acotada: asignar la imagen de un residuo sólido a una de cinco categorías (cartón, metal, papel, plástico flexible y plástico rígido). Se distribuye en dos variantes (YOLO11n-cls y YOLO11s-cls) junto con metadatos y un script de inferencia.

El modelo forma parte de un sistema mayor que combina detección con YOLO y reconstrucción 3D con NeRF y 3D Gaussian Splatting para localizar residuos en el espacio. La relevancia práctica está en su formato: al estar exportado a ONNX con entrada fija de 224x224 píxeles, es desplegable con onnxruntime en entornos sin GPU dedicada y sin dependencia de PyTorch. La licencia CC-BY-4.0 permite uso comercial con atribución.

Las métricas declaradas por el autor sobre 353 recortes de prueba son una exactitud del 92,4 % y un F1 macro de 0,916 para el modelo 1, con un AUC macro de 0,9955. La variante YOLO11s no mejora de forma estadísticamente significativa (McNemar p = 0,85), por lo que el autor recomienda la variante nano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11-cls (Ultralytics), red convolucional de clasificación; exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija `[N, 3, 224, 224]` |
| Tipos de cuantizacion | no disponible (solo se publican pesos ONNX en float32) |
| Idiomas soportados | es (etiquetas de clase en castellano; la tarea es de visión, no lingüística) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`m1_yolo11n.onnx`, `m2_yolo11s.onnx`) |

## Arquitectura y entrenamiento

Se trata de una red convolucional de clasificación de la familia YOLO11 en su variante `-cls`, es decir, la cabeza de clasificación de Ultralytics y no la de detección. El modelo 1 usa el backbone YOLO11n-cls con la configuración por defecto; el modelo 2 usa YOLO11s-cls con dropout y programación de tasa de aprendizaje coseno. La entrada se normaliza con el lado corto redimensionado a 224 px, recorte central y valores en el rango [0, 1], y la salida es un vector de 5 probabilidades en el orden `['carton', 'metal', 'papel', 'plastico_flexible', 'plastico_rigido']`.

El entrenamiento se realizó con recortes por objeto del dataset WasteCareAI-2 (Roboflow Universe), reagrupados en las cinco categorías finales. No se especifican en la información disponible el número de imágenes de entrenamiento, el número de épocas, el tamaño de lote ni si hubo aumento de datos más allá del pipeline estándar de Ultralytics. Tampoco se documenta ninguna innovación técnica específica (decodificación especulativa, atención lineal u otras); la aportación del trabajo es la integración del clasificador en un pipeline de reconstrucción 3D.

## Capacidades

- Clasificación de imágenes de residuos en cinco clases cerradas: cartón, metal, papel, plástico flexible y plástico rígido.
- Salida de probabilidades por clase (softmax de 5 dimensiones), lo que permite aplicar umbrales de confianza y derivar revisión manual.
- Inferencia por lotes: la entrada admite dimensión `N`, por lo que se pueden procesar varios recortes en una sola llamada.
- Ejecución sobre ONNX Runtime, sin necesidad de PyTorch ni de CUDA en el entorno de despliegue.
- Incluye un script `inferencia.py` que descarga el modelo desde el Hub y clasifica una imagen local.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento. Es un clasificador de imagen puro.
- No realiza detección ni segmentación: presupone que la imagen de entrada ya es un recorte centrado en un único objeto.

## Casos de uso

- Clasificación automática en plantas de triaje: integrado en una cinta con cámara y recorte por objeto, el modelo asigna cada residuo a una de las cinco categorías y activa un actuador de separación. El coste computacional de una YOLO11n-cls en ONNX es compatible con líneas de varios objetos por segundo.
- Preetiquetado de datasets de reciclaje: usar el modelo para generar etiquetas iniciales sobre nuevas imágenes y reducir el trabajo de anotación manual, revisando solo las predicciones con confianza inferior al 60 %.
- Aplicación móvil o web de apoyo al reciclaje doméstico: el Space del autor demuestra el patrón; el modelo ONNX puede ejecutarse en el navegador o en el dispositivo para indicar al usuario en qué contenedor depositar un residuo.
- Módulo de clasificación dentro de un pipeline de reconstrucción 3D: es el uso original de la tesis, donde la etiqueta del clasificador se asocia a la posición 3D del objeto obtenida mediante NeRF o Gaussian Splatting para inventariar residuos en una escena.
- Auditoría y control de calidad de contenedores: clasificar fotografías de catálogo o de inventario para verificar la composición de un lote y detectar desviaciones en la separación de plástico flexible frente a rígido.
- Docencia y experimentación con YOLO11-cls: los dos modelos publicados (nano y small, con y sin dropout) permiten reproducir la comparación de configuraciones de entrenamiento y el análisis estadístico (McNemar) sobre un caso real.
- Filtro previo en sistemas de visión más complejos: descartar o enrutar imágenes antes de un detector de objetos más costoso, aprovechando la baja latencia de la variante nano.

## Benchmarks y rendimiento

Métricas declaradas por el autor sobre 353 recortes de prueba sin duplicados respecto al entrenamiento:

| Modelo | Exactitud | F1 macro | AUC macro |
|---|---:|---:|---:|
| Modelo 1 (YOLO11n-cls) | 92,4 % | 0,916 | 0,9955 |
| Modelo 2 (YOLO11s-cls) | 92,9 % | 0,925 | 0,9945 |

Desglose por clase del modelo 1:

| Clase | n | Precisión | Recall | F1 | AUC |
|---|---:|---:|---:|---:|---:|
| Cartón | 50 | 0,958 | 0,920 | 0,939 | 0,9969 |
| Metal | 36 | 0,783 | 1,000 | 0,878 | 0,9977 |
| Papel | 59 | 0,931 | 0,915 | 0,923 | 0,9977 |
| Plástico flexible | 66 | 0,921 | 0,879 | 0,899 | 0,9959 |
| Plástico rígido | 142 | 0,957 | 0,930 | 0,943 | 0,9895 |

La comparación estadística entre ambos modelos (McNemar, p = 0,85) no muestra diferencias significativas. No se han publicado resultados de benchmarks frente a otros modelos de clasificación de residuos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Por el tamaño de la familia YOLO11n-cls y YOLO11s-cls, la huella es de pocos cientos de MB en float32, pero el autor no publica la cifra.
- GPU recomendadas: no especificadas. Cualquier GPU con soporte ONNX Runtime (CUDA o TensorRT) es suficiente; también es viable la ejecución en CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna, dado el tamaño reducido de las variantes nano y small; no se aportan mediciones concretas.
- Opciones de despliegue: ONNX Runtime (principal, usado por el script `inferencia.py`), exportación a TensorRT u OpenVINO a partir del ONNX, y despliegue en el Space de Hugging Face del autor.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros clasificadores de residuos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A nivel cualitativo:

| Modelo | Tarea | Clases | Formato | Licencia | Métricas publicadas |
|---|---|---|---|---|---|
| CAROCH/clasificador-residuos-yolo11 (m1) | Clasificación de imagen | 5 | ONNX | CC-BY-4.0 | Exactitud 92,4 %, F1 macro 0,916 |
| CAROCH/clasificador-residuos-yolo11 (m2) | Clasificación de imagen | 5 | ONNX | CC-BY-4.0 | Exactitud 92,9 %, F1 macro 0,925 |
| Otros clasificadores de residuos | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio de entrenamiento estrecho: las imágenes son fotos de catálogo de un único objeto. El propio autor indica que en una escena real la exactitud fue menor.
- El modelo no detecta objetos: requiere un recorte previo centrado en el residuo. Si se le pasa una escena completa, la predicción no es fiable.
- Clases no cubiertas: vidrio y residuos orgánicos no tienen categoría propia y se asignan a la clase más parecida, generando errores silenciosos.
- Se recomienda revisión manual de las predicciones con confianza inferior al 60 %, umbral documentado en `metadatos.json`.
- Desequilibrio de clases en prueba: plástico rígido concentra 142 de los 353 recortes frente a 36 de metal, lo que hace que las métricas por clase tengan intervalos de confianza amplios en las clases minoritarias.
- Precisión baja en metal (0,783) con recall de 1,000: el modelo tiende a clasificar como metal objetos de otras clases, lo que produce falsos positivos en esa categoría.
- Riesgo de sesgo por el origen del dataset (WasteCareAI-2, Roboflow Universe): la composición de objetos, iluminación y fondo puede no representar condiciones industriales o domésticas reales.
- Sin información sobre cuantización ni sobre pesos en otros formatos: el despliegue está atado al ONNX en float32 salvo que el usuario lo convierta.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución al autor y no incluye garantías; conviene revisar también las condiciones del dataset de origen.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CAROCH/clasificador-residuos-yolo11
- Aplicación web (Space): https://huggingface.co/spaces/CAROCH/clasificador-residuos
- Dataset de origen: WasteCareAI-2 en Roboflow Universe (no se proporciona URL directa en la información disponible)
- Ultralytics YOLO11: no se proporciona enlace en la información disponible
- Paper o memoria de la tesis: no disponible

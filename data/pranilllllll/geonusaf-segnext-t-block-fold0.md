# Pranilllllll/geonusaf-segnext-t-block-fold0

## Resumen

GeoNUSAF es un modelo de segmentación semántica para imágenes de teledetección, desarrollado por Pranilllllll, que clasifica el uso del suelo en el valle de Katmandú (Nepal) en seis categorías: residencial, carretera, río, bosque, suelo sin uso y agrícola. El modelo se basa en la arquitectura SegNeXt (NeurIPS 2022), concretamente en el encoder MSCAN-T (versión tiny) combinado con el decodificador LightHamHead, y está diseñado para trabajar con imágenes de 512x512 píxeles a una resolución efectiva de 0,586 m/px.

Con solo 4,23 millones de parámetros, este modelo resulta especialmente ligero para tareas de segmentación semántica en el ámbito de la observación de la Tierra, lo que lo hace adecuado para despliegue en entornos con recursos limitados. El checkpoint publicado corresponde al fold 0 de un esquema de validación cruzada con división por bloques (block split), e incluye pesos EMA (exponential moving average) que alcanzaron un mIoU de 0,3311 en validación. La licencia Apache-2.0 permite su uso comercial y modificación sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MSCAN-T encoder + LightHamHead decoder (SegNeXt, NeurIPS 2022) |
| Parametros totales | 4,23 M |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision, no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (best.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SegNeXt, que combina un encoder MSCAN (Multi-Scale Convolutional Attention Network) con un decodificador ligero LightHamHead. El encoder MSCAN-T (versión tiny) utiliza convoluciones de gran kernel y atención convolucional eficiente para capturar características multiescala, mientras que el decodificador fusiona las salidas de las etapas 1, 2 y 3 con un stride de fusión de 8. El encoder se inicializó con pesos preentrenados en ImageNet-1K (el 100% de los tensores se cargaron correctamente).

El entrenamiento se realizó con un esquema de división por bloques (block split) y el fold 0 de 3, con semilla 42. Se empleó una técnica de factorización de matrices no negativas (NMF) con rango R=16, usando 6 pasos durante el entrenamiento y 7 en evaluación. La configuración de regularización incluye weight decay de 0,01, drop path de 0,1, suavizado de etiquetas de 0,05 y EMA activado. Las tasas de aprendizaje fueron de 0,0006 para la cabeza y 6e-05 para el encoder, alcanzando la mejor época en el paso 75. El dataset de entrenamiento corresponde a imágenes de teledetección del valle de Katmandú con 6 clases y ignore_index=255.

## Capacidades

- Segmentación semántica de imágenes aéreas y satelitales, clasificando cada píxel en una de 6 clases de uso del suelo.
- Detección de áreas residenciales, carreteras, ríos, bosques, suelo sin uso y zonas agrícolas.
- Procesamiento de imágenes de 512x512 píxeles con normalización ImageNet y resolución efectiva de 0,586 m/px.
- Inferencia eficiente gracias a su reducido número de parámetros (4,23 M), lo que permite ejecución en hardware modesto.
- Soporte para reconstrucción del modelo mediante el script `segnext_model.py` incluido en el repositorio, que permite cargar los pesos desde `best.pt`.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multimodal; es exclusivamente un modelo de visión para segmentación.

## Casos de uso

- Planificación urbana: el modelo puede identificar automáticamente zonas residenciales y carreteras en imágenes satelitales del valle de Katmandú, facilitando la actualización de mapas de uso del suelo y la detección de crecimiento urbano no planificado.
- Gestión de recursos hídricos: la clase "River" permite monitorizar la extensión de ríos y detectar cambios en su cauce, útil para alertas tempranas de inundaciones o gestión de cuencas.
- Monitoreo forestal: la segmentación de áreas boscosas ayuda a cuantificar la cobertura forestal y detectar deforestación o degradación en la región.
- Agricultura de precisión: la clasificación de zonas agrícolas permite estimar superficies cultivadas y apoyar políticas de seguridad alimentaria o programas de subvenciones.
- Evaluación de suelo sin uso: la detección de "UnusedLand" es relevante para identificar terrenos baldíos susceptibles de desarrollo o degradación ambiental.
- Investigación académica en teledetección: al ser un modelo ligero y de código abierto (Apache-2.0), puede servir como baseline para experimentos de segmentación semántica en entornos urbanos de montaña, o como punto de partida para fine-tuning en otras regiones.

## Benchmarks y rendimiento

Se han publicado las métricas de validación del fold 0, obtenidas con los pesos EMA en la época 75:

| Metrica | Valor |
|---|---|
| mIoU | 0,3311 |
| mF1 | 0,4570 |
| Exactitud global (OA) | 0,6095 |
| Kappa | 0,4833 |

Rendimiento por clase (validación):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,6139 | 0,7608 |
| Road | 0,2502 | 0,4002 |
| River | 0,0545 | 0,1033 |
| Forest | 0,5503 | 0,7099 |
| UnusedLand | 0,0947 | 0,1730 |
| Agricultural | 0,4232 | 0,5947 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Al tratarse de un modelo con solo 4,23 M de parámetros y entrada de 512x512, la inferencia es viable en GPUs de gama media e incluso en CPU, aunque no se proporcionan cifras oficiales de VRAM o latencia.
- Estimación orientativa: con una cuantización estándar de 32 bits, el modelo ocupa aproximadamente 17 MB en memoria (4,23 M × 4 bytes), por lo que cualquier GPU con al menos 2 GB de VRAM sería suficiente para inferencia en lote pequeño.
- Para entrenamiento o fine-tuning, se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 2070, RTX 3060, o superior) para manejar el lote y los tensores intermedios.
- Opciones de despliegue: al ser un checkpoint de PyTorch, puede integrarse en pipelines con PyTorch, ONNX o TensorRT. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- El repositorio incluye el script `segnext_model.py` para reconstruir la arquitectura, lo que facilita su uso en entornos personalizados.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos comparables en el mismo conjunto de datos. Se ha identificado un modelo similar en Hugging Face: `sugam24/geonusaf-unetformer-r18-block-fold0`, que utiliza una arquitectura UNetFormer con ResNet-18 para la misma tarea y división de datos, pero no se han publicado sus métricas en la información disponible. Tampoco se dispone de comparativas con el SegNeXt original (que tiene variantes con más parámetros, como SegNeXt-B0 a B5) en este contexto específico.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con imágenes del valle de Katmandú, por lo que su capacidad de generalización a otras regiones geográficas o climas es limitada y no ha sido evaluada.
- Las clases "River" y "UnusedLand" presentan un rendimiento muy bajo (IoU de 0,0545 y 0,0947 respectivamente), lo que indica un posible desequilibrio de clases o dificultad intrínseca en la discriminación de estas categorías.
- La exactitud global (OA) de 0,6095 y el mIoU de 0,3311 son moderados; el modelo puede cometer errores significativos en áreas de transición o con cobertura mixta.
- No se han documentado sesgos específicos, pero al ser un modelo de visión entrenado en una región concreta, puede reflejar las características particulares de ese entorno (por ejemplo, materiales de construcción, tipos de vegetación).
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar que los datos de entrenamiento originales (imágenes satelitales) cumplan con sus propias restricciones de uso.
- El checkpoint `best.pt` contiene los pesos EMA, no los pesos finales del entrenamiento; esto debe tenerse en cuenta si se desea reproducir exactamente los resultados publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pranilllllll/geonusaf-segnext-t-block-fold0
- Repositorio oficial de SegNeXt (GitHub): https://github.com/visual-attention-network/segnext
- Paper de SegNeXt (PDF): https://raw.githubusercontent.com/Visual-Attention-Network/SegNeXt/main/resources/paper.pdf
- Modelo similar (UNetFormer): https://huggingface.co/sugam24/geonusaf-unetformer-r18-block-fold0

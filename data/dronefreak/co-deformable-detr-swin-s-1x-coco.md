# dronefreak/co-deformable-detr-swin-s-1x-coco

## Resumen

Co-Deformable-DETR Swin-Small (1x) es un modelo de detección de objetos en imágenes, entrenado sobre el conjunto de datos COCO 2017. Fue desarrollado originalmente por Zhuofan Zong, Guanglu Song y Yu Liu de SenseTime X-Lab como parte del trabajo Co-DETR, presentado en ICCV 2023. El archivo disponible en HuggingFace es un espejo de los pesos publicados originalmente en Google Drive por los autores, alojado por el usuario dronefreak para facilitar la descarga y la reproducibilidad.

El modelo se basa en la arquitectura Deformable-DETR, sustituyendo el backbone ResNet-50 por un Swin Transformer Small. El método Co-DETR introduce un esquema de entrenamiento colaborativo que combina asignación húngara one-to-one en el decoder con cabezas auxiliares de tipo ATSS y Faster R-CNN (one-to-many) durante el entrenamiento, lo que acelera la convergencia y mejora la calidad de las características del encoder. El checkpoint alcanza un box AP de 53.4 en la partición de validación de COCO 2017 tras 12 épocas de entrenamiento (esquema 1x).

Es relevante porque ofrece un detector de alta precisión con unos 70,7 millones de parámetros en inferencia, un tamaño moderado que puede ejecutarse en GPUs de consumo, dentro del ecosistema MMDetection 2.x.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Co-Deformable-DETR (DETR con entrenamiento colaborativo de asignaciones híbridas) con backbone Swin Transformer Small y cabezas auxiliares ATSS + RoI head durante el entrenamiento |
| Parametros totales | 70.7 millones (parámetros de inferencia según la model card; los parámetros de entrenamiento con cabezas auxiliares no se especifican) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; no tiene ventana de contexto textual) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en formato .pth sin versiones cuantizadas mencionadas) |
| Idiomas soportados | inglés (en), etiquetas de clases de COCO |
| Licencia | unknown (indeterminada; el autor del espejo indica "undetermined") |
| Formato de pesos | PyTorch .pth con archivo de configuración .py, compatible con MMDetection 2.x |

## Arquitectura y entrenamiento

Co-DETR no es una arquitectura nueva, sino un régimen de entrenamiento. En lugar de usar únicamente la asignación húngara one-to-one del decoder DETR, el método añade cabezas auxiliares con asignación one-to-many: una cabeza ATSS y una cabeza de tipo Faster R-CNN RoI. Las propuestas positivas generadas por estas cabezas se introducen de vuelta al decoder como consultas adicionales, lo que hace más discriminativas las características del encoder y acelera la convergencia. Estas cabezas auxiliares solo se utilizan durante el entrenamiento y se eliminan en la inferencia.

El checkpoint concreto usa la variante Deformable-DETR con backbone Swin Transformer Small. Los datos de entrenamiento proceden del conjunto de datos COCO 2017 (detection-datasets/coco) y el esquema de entrenamiento es 1x, equivalente a 12 épocas. No se especifica el número de tokens de entrenamiento ni se mencionan técnicas de ajuste por alineación como RLHF o DPO, ya que no se trata de un modelo de lenguaje.

## Capacidades

- Detección de objetos en imágenes: localiza y clasifica objetos entre las 80 categorías del dataset COCO (personas, vehículos, animales, objetos de interior, etc.).
- Inferencia sobre imágenes individuales, carpetas de imágenes, vídeos o webcam, tal como muestra el script `tools/inference.py` del repositorio de Co-DETR.
- Genera salidas en formato JSON con las detecciones (cajas y confianza), facilitando su integración en sistemas posteriores.
- Soporta tool calling o función de llamada a herramientas: no disponible, al ser un modelo de visión puro.
- Capacidades multilingües: no aplica; las etiquetas están en inglés y dependen del vocabulario de COCO.
- No incluye modo de razonamiento (thinking mode), ni generación de texto, ni procesamiento de audio.

## Casos de uso

- Conteo de personas en espacios públicos: el modelo puede procesar flujos de vídeo de cámaras de vigilancia y detectar peatones en tiempo real, dado que es un detector con 70.7M de parámetros que permite inferencia en GPUs de consumo.
- Detección de vehículos en dashcams: el propio repositorio demuestra el modelo sobre clips de dashcam, por lo que es adecuado para aplicaciones de asistencia a la conducción, como la detección de coches, peatones y señales.
- Control de calidad en fabricación: tras un ajuste fino con un dataset propio de defectos, el modelo puede inspeccionar piezas y detectar anomalías visuales en líneas de producción.
- Robótica de almacén: la detección de cajas, palés y otros objetos permite guiar brazos robóticos o vehículos autónomos en entornos logísticos, gracias a la salida estructurada de cajas y confianzas.
- Anotación automática de datasets: se puede usar para generar cajas y etiquetas iniciales en conjuntos de imágenes masivos, reduciendo el tiempo y coste del etiquetado manual en proyectos de visión por computador.
- Vigilancia perimetral: detecta intrusiones de personas o vehículos en zonas restringidas, procesando fotogramas de cámaras IP y emitiendo alertas cuando se supera un umbral de confianza.
- Análisis de tráfico: puede contar y clasificar vehículos en intersecciones o carreteras, lo que resulta útil para estudios de movilidad y planificación urbana.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| COCO 2017 val, box AP | 53.4 |

No se han publicado resultados de benchmarks adicionales en la información disponible. El valor de box AP procede del model-index de la model card, donde aparece marcado como `verified: false`, es decir, es un resultado reportado por el autor y no ha sido verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada: no publicada oficialmente. Extrapolando, los pesos en FP32 de 70.7M de parámetros ocupan aproximadamente 283 MB, por lo que una GPU con 4 GB o más debería ser suficiente para la inferencia básica. No hay una cifra oficial en la documentación.
- GPU recomendadas: no especificadas. Dado el tamaño del checkpoint, cualquier GPU moderna de gama media (por ejemplo, RTX 3060 12GB, RTX 4070) debería ejecutarlo sin problema; también es viable en CPU, aunque con menor velocidad.
- Compatibilidad con GPU de consumo: sí, es un modelo relativamente ligero que cabe en GPUs de consumo con 8 GB o incluso menos, como una RTX 2060 o similar.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje. Se despliega con el stack de MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11, o exportando a ONNX/TorchScript para producción.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | AP COCO | Licencia | Disponibilidad |
|---|---|---|---|---|
| Co-Deformable-DETR Swin-S 1x (este) | 70.7M | 53.4 (val) | unknown | Hub (espejo) |
| Co-DETR ViT-L (paper) | 304M | 65.6 (test-dev) | no disponible | Repo oficial |

No se dispone de más comparativas con variantes de tamaño intermedio (por ejemplo, Co-Deformable-DETR con ResNet-50) en la información proporcionada.

## Limitaciones y advertencias

- Licencia indeterminada: el autor del espejo indica que la licencia de los pesos es "unknown" y "undetermined", lo que genera incertidumbre legal para su uso comercial.
- No es una liberación oficial: se trata de un espejo del checkpoint publicado por los autores originales en Google Drive. El repositorio puede transferirse o retirarse a petición de los autores.
- Requiere un entorno específico: la inferencia depende de MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11. No es un modelo autónomo compatible con la librería `transformers`.
- Sesgos conocidos: al estar entrenado en COCO, el modelo puede presentar bajo rendimiento en contextos no representados en ese dataset, como escenas industriales o de países no occidentales.
- Riesgo de alucinación: no aplica, porque se trata de un detector de objetos y no de un modelo generativo.
- Resultados no verificados: el valor de box AP en COCO proviene de los metadatos del model-index con `verified: false`, por lo que conviene reproducir la evaluación antes de depender del dato.
- La model card marca `inference: false`, lo que indica que la integración directa como pipeline de HuggingFace puede no funcionar sin el entorno de MMDetection adecuado.

## Enlaces

- HuggingFace: https://huggingface.co/dronefreak/co-deformable-detr-swin-s-1x-coco
- Paper Co-DETR (ICCV 2023): https://arxiv.org/abs/2211.12860
- Repositorio oficial del proyecto: https://github.com/Sense-X/Co-DETR
- Fork mantenido por dronefreak con entorno de instalación: https://github.com/dronefreak/Co-DETR
- Dataset COCO (paper original): https://arxiv.org/abs/1405.0312

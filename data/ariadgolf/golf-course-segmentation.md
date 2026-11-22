# ariadgolf/golf-course-segmentation

## Resumen

Ariad Golf Course Segmentation es un modelo de segmentación semántica de seis clases diseñado para identificar elementos de campos de golf en imágenes aéreas multiespectrales de cuatro bandas. Lo desarrolla Ariad (ariad.golf), un proyecto centrado en la generación de mapas y libros de distancias para campos de golf, y se distribuye en Hugging Face bajo la librería `segmentation-models-pytorch`. El modelo resuelve un problema de nicho pero técnicamente exigente: extraer con precisión la geometría de greens, tees, calles, bunkers y agua a partir de ortofotografías NAIP, una tarea en la que los modelos genéricos de segmentación RGB rinden mal por la ausencia de información en el infrarrojo cercano.

La arquitectura es una U-Net clásica con encoder ResNet-34, con 24.459.238 parámetros totales y una ventana de entrada fija de 512 × 512 píxeles a 0,6 metros por píxel de resolución de suelo. El modelo consume cuatro bandas en orden rojo, verde, azul e infrarrojo cercano, en valores uint8 sin normalizar por 255, y produce seis logits por píxel correspondientes a fondo, green, tee, calle, bunker y agua. Es un modelo denso, no generativo, sin capacidades de texto ni de razonamiento: su único cometido es la clasificación por píxel.

Su relevancia actual es la de un componente de producción real dentro de un producto comercial de cartografía deportiva, exportado desde un checkpoint archivado en Supabase a formato nativo de Hugging Face. La model card documenta con inusual transparencia las métricas históricas, los sesgos de las etiquetas de OpenStreetMap y las limitaciones conocidas, lo que lo convierte en un caso interesante para quienes trabajan con teledetección aplicada y segmentación multiespectral.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet-34 |
| Parametros totales | 24.459.238 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 512 × 512 píxeles con 4 bandas |
| Tipos de cuantizacion | no disponible; pesos almacenados en FP16 Safetensors, convertidos a FP32 para inferencia |
| Idiomas soportados | en (etiquetas y documentación; el modelo no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP16) |
| Bandas de entrada | 4 (rojo, verde, azul, infrarrojo cercano), uint8 0-255 |
| Resolución de suelo | 0,6 metros por píxel |
| Clases de salida | 6 (fondo, green, tee, calle, bunker, agua) |
| Normalización | media [108.314, 118.389, 97.68, 158.925], desviación [42.693, 38.205, 33.022, 51.632] |
| Librería | segmentation-models-pytorch |

## Arquitectura y entrenamiento

El modelo es una U-Net estándar con encoder ResNet-34, sin mecanismos de atención lineal, decodificación especulativa ni componentes híbridos. La innovación no reside en la arquitectura sino en el tratamiento de la entrada: cuatro bandas multiespectrales con normalización específica calculada sobre el corpus de entrenamiento, en lugar de la normalización ImageNet habitual. La salida son seis logits sin normalizar por píxel, sobre los que se aplica softmax y argmax para obtener la máscara de clases. El repositorio incluye utilidades de inferencia con test-time augmentation (promedio de identidad, flip horizontal y flip vertical) y una CLI que preserva la georreferenciación del ráster de entrada.

El entrenamiento se realizó sobre 4.665 teselas procedentes de 790 campos, con 573 teselas de validación, usando imágenes aéreas NAIP del USDA obtenidas a través de USGS The National Map y etiquetas de elementos de golf derivadas de OpenStreetMap. La partición de entrenamiento es por campo, con holdouts geográficos adicionales a nivel de estado (AZ, CO, GA, IA y OR) y exclusión del área metropolitana de Nueva York. La función de pérdida combina entropía cruzada con etiquetas parciales y Dice multiclase, con un nivel de confianza por clase que modula el peso de las etiquetas. El run v4 se programó a 14 épocas y el checkpoint seleccionado es la época 13 (indexada desde uno).

## Capacidades

- Segmentación semántica densa por píxel en seis clases sobre imágenes aéreas de cuatro bandas.
- Detección y delineado de greens, tees, calles, bunkers y masas de agua, con especial robustez en greens.
- Procesamiento de imágenes multiespectrales con banda de infrarrojo cercano, lo que mejora la separabilidad entre vegetación rastrera, arena y agua frente a un modelo RGB convencional.
- Inferencia por teselas de 512 × 512 píxeles con georreferenciación preservada en la salida (ráster de una banda con valor nodata 255).
- Test-time augmentation integrada (identidad, flip horizontal y flip vertical) para estabilizar las probabilidades.
- Soporte de ejecución en CPU, CUDA y MPS (Apple Silicon) mediante el flag `--device`.
- Carga directa desde el Hub con `smp.from_pretrained`, sin necesidad de `trust_remote_code`.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión general ni audio.

## Casos de uso

- Generación automática de mapas de campo: el modelo propone contornos de greens, bunkers y calles que alimentan el atlas de campos de Ariad y sus libros de distancias, reduciendo el trabajo manual de digitalización sobre ortofotos NAIP.
- Medición de superficies y distancias de juego: a partir de la máscara de clases georreferenciada se pueden calcular áreas de green, anchuras de calle y distancias entre puntos, siempre que se respete la resolución de 0,6 m/píxel y se corrija la distorsión de proyección.
- Actualización de bases cartográficas de campos de golf: comparando la máscara predicha con las geometrías existentes de OpenStreetMap se detectan greens o bunkers nuevos, modificados o eliminados, con una tasa de falsos positivos baja (0,14 candidatos/km² sobre 148 teselas negativas).
- Análisis de cambios multitemporales: al aplicar el modelo a imágenes de distintas añadas se pueden detectar remodelaciones de bunkers o ampliaciones de greens, aunque la sensibilidad al cambio de aspecto por vintage de imagen exige validación previa.
- Investigación en teledetección aplicada: sirve como referencia reproducible de segmentación multiespectral de seis clases con partición por entidad geográfica, útil para estudiar el efecto de etiquetas ruidosas de OSM y de pérdidas con etiquetas parciales.
- Preprocesado para pipelines de mantenimiento de campos: la máscara de bunkers y agua puede alimentar sistemas de planificación de riego o de inventario de obstáculos, integrada mediante la CLI o la API de PyTorch en un servicio por lotes.
- Docencia y experimentación con `segmentation-models-pytorch`: el modelo ilustra el flujo completo de exportación de un checkpoint a formato nativo del Hub, con `preprocessor_config.json` y utilidades de inferencia incluidas.

## Benchmarks y rendimiento

Los resultados publicados son históricos del checkpoint v4 original y no una reevaluación del modelo exportado en FP16. Las referencias de evaluación son en su mayoría contornos de OpenStreetMap, por lo que miden concordancia con OSM, no exactitud topográfica.

| Evaluación de objetos (greens) | Campos | Greens de referencia | Recall a IoU ≥ 0,5 | Precision a IoU ≥ 0,5 | IoU medio |
|---|---:|---:|---:|---:|---:|
| Campos retenidos emparejados | 99 | 1.552 | 88,27% | 79,24% | 0,7283 |
| Estados retenidos | 40 | 805 | 90,31% | 83,47% | 0,7616 |
| Validación OSM | 27 | 528 | 87,88% | 86,41% | 0,7303 |

| IoU por píxel en validación | Valor |
|---|---:|
| Green | 0,693 |
| Tee | 0,331 |
| Calle | 0,636 |
| Bunker | 0,563 |
| Agua | 0,034 |

Sobre 148 teselas negativas, el pipeline original devolvió dos candidatos a green, equivalentes a 0,14 candidatos/km². En un conjunto revisado de 175 greens puntuables, el IoU medio del modelo fue 0,8469 frente a 0,9335 de OSM, aunque 136 de esas referencias reutilizan geometría de OSM, lo que otorga a OSM concordancia perfecta por construcción en ese subconjunto y descarta que se trate de un banco de pruebas plenamente independiente. El criterio histórico de paridad con la revisión no se alcanzó.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en FP32 para una tesela de 512 × 512 × 4; el modelo tiene 24,5 millones de parámetros y no requiere precisión reducida para caber en memoria.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas RTX 3060, RTX 4090, A100 y H100; el modelo no aprovecha la capacidad de cómputo de las GPU de gama alta más allá del throughput.
- Cabe holgadamente en GPU de consumo, en iGPU y en CPU; también se ejecuta en Apple Silicon mediante `--device mps`.
- Opciones de despliegue: `segmentation-models-pytorch` con PyTorch nativo, la CLI incluida en el repositorio, y servicio por lotes con rasterio para teselado con solape. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que son motores de modelos generativos y no aplican a este caso.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---:|---|---|---|---|
| Ariad Golf Course Segmentation | U-Net + ResNet-34 | 24,5 M | 4 bandas, 512 × 512 | 6 (golf) | no disponible | Hugging Face |
| SAM 2 (Meta) | Transformer con memoria | no disponible | RGB, resolución variable | segmentación promptable genérica | Apache 2.0 | Hugging Face, código abierto |
| DeepLabv3+ con encoder ResNet-50 | CNN con ASPP | no disponible | RGB, resolución variable | configurable | depende del checkpoint | torchvision, smp |
| U-Net multiespectral para cultivos (p. ej. variantes SEN12MS) | U-Net / encoder variable | no disponible | multiespectral | variable | variable | repositorios académicos |

La comparación directa es limitada: los modelos genéricos de segmentación no están entrenados para la taxonomía de golf ni para la entrada de cuatro bandas con la normalización específica de NAIP, y sustituirlos exige reentrenamiento. La ventaja del modelo de Ariad es la especialización y la documentación de su pipeline de evaluación; su desventaja es la licencia no declarada y el alcance restringido a imágenes con la geometría y resolución exactas de entrenamiento.

## Limitaciones y advertencias

- El propio autor advierte que las predicciones de agua no son fiables, con un IoU por píxel de 0,034 en validación.
- Los tees también presentan un rendimiento débil (IoU 0,331), y las etiquetas de OSM para tees y agua son frecuentemente incompletas o incorrectas, lo que degrada el aprendizaje y la evaluación de esas clases.
- Las métricas publicadas corresponden al checkpoint v4 original y no a una reevaluación del modelo exportado en FP16; no deben citarse como rendimiento verificado de la versión distribuida.
- La mayoría de las referencias de evaluación son geometrías de OpenStreetMap, de modo que las puntuaciones miden concordancia con OSM y no exactitud topográfica; el criterio histórico de paridad con la revisión no se cumplió.
- Las métricas de objetos incluyen teselado, aumentación, cosido y filtrado de polígonos del pipeline original; el uso simple con argmax descrito en la model card no reproduce ese pipeline completo.
- El modelo exige entrada de cuatro bandas con infrarrojo cercano real en la cuarta posición; imágenes RGB, con alfa en la cuarta banda o con normalización ImageNet producen resultados inválidos.
- La normalización debe aplicarse sobre valores uint8 en bruto, sin dividir previamente por 255.
- Solo acepta teselas de 512 × 512 píxeles a 0,6 m/píxel; los rásters mayores requieren teselado con solape y mezcla de probabilidades antes de la poligonización.
- La resolución de suelo debe corregirse por distorsión de proyección: los metros en coordenadas de mapa no equivalen siempre a metros sobre el terreno.
- Existe sensibilidad al cambio de aspecto por añada de imagen, sombras y vegetación en estado de latencia, según la model card.
- La licencia no está declarada, por lo que no puede asumirse uso comercial sin consultar al autor.
- El repositorio contiene únicamente el modelo y las utilidades de inferencia, no las imágenes ni el conjunto de datos de entrenamiento.
- Riesgo de alucinación en el sentido de falsos positivos: el pipeline original generó dos candidatos a green sobre 148 teselas negativas, una tasa baja pero no nula.
- El sesgo geográfico del entrenamiento se concentra en Estados Unidos (holdouts en AZ, CO, GA, IA y OR, exclusión del área de Nueva York), lo que limita la generalización a otros países y a otras fuentes de imagery.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ariadgolf/golf-course-segmentation
- Atlas de campos de Ariad: https://www.ariad.golf/courses
- Librería segmentation-models-pytorch: https://github.com/qubvel-org/segmentation_models.pytorch
- USDA NAIP: https://www.fsa.usda.gov/programs-and-services/aerial-photography/imagery-programs/naip-imagery/
- USGS The National Map: https://www.usgs.gov/programs/national-geospatial-program/national-map
- OpenStreetMap: https://www.openstreetmap.org
- Rasterio: https://rasterio.readthedocs.io

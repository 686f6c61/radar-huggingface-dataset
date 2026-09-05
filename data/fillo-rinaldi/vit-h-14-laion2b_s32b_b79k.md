# fillo-rinaldi/ViT-H-14-laion2b_s32b_b79k

## Resumen

Este repositorio contiene una colección de checkpoints de OpenCLIP `ViT-H-14` ajustados por completo (_full fine-tuning_) sobre cada uno de los ocho datasets de visión de la suite Vision8. El autor, `fillo-rinaldi`, parte de los pesos preentrenados en LAION-2B (`laion2b_s32b_b79k`) y entrena un modelo independiente por conjunto de datos, ofreciendo tanto el checkpoint con mejor precisión de validación como el de la última época. El objetivo es proporcionar modelos especializados en tareas concretas de clasificación de imágenes, con una precisión de test que oscila entre el 83,16% (SUN397) y el 99,66% (MNIST), alcanzando una media macro de 94,79%.

La arquitectura es un Vision Transformer de tamaño H (ViT-H-14), que procesa imágenes divididas en parches de 14x14 píxeles. Al tratarse de un modelo de visión puro, no maneja texto ni secuencias, por lo que no se aplica la longitud de contexto en el sentido de los modelos de lenguaje. El número de parámetros no se especifica en la documentación del repositorio, pero el tamaño total del repositorio es de 63,1 GB, lo que indica que los pesos se almacenan en precisión fp32. La relevancia de este modelo radica en su especialización: en lugar de un modelo generalista, se ofrecen versiones afinadas para dominios visuales concretos, lo que puede resultar útil en aplicaciones donde se requiere alta precisión en una tarea específica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-H-14) |
| Parametros totales | no disponible |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | fp32 (sin cuantización) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

El modelo base es un Vision Transformer de tamaño H (ViT-H-14) entrenado con OpenCLIP, un framework de aprendizaje contrastivo imagen-texto. Los pesos iniciales provienen del checkpoint `laion2b_s32b_b79k`, preentrenado sobre el dataset LAION-2B. A partir de ahí, se realiza un ajuste fino completo (_full fine-tuning_) sobre cada uno de los ocho datasets de Vision8: SUN397, Cars, RESISC45, EuroSAT, SVHN, GTSRB, MNIST y DTD. El entrenamiento se lleva a cabo con el optimizador AdamW, una tasa de aprendizaje de `1e-5`, weight decay de `0.1`, un tamaño de lote efectivo de 128 (con `batch_size=4` y acumulación de gradientes de 32), scheduler coseno, clipping de gradientes en `1.0` y sin early stopping. Se utiliza una fracción de validación del 10% y una semilla fija de 42. No se aplica RLHF ni DPO, ya que es un modelo de clasificación supervisada.

Cada checkpoint se almacena como un payload con metadatos que incluye el `state_dict` completo en fp32. Para cargarlo, es necesario eliminar el prefijo `clip_model.model.` de las claves del diccionario de estado, tal como se indica en el README. No se mencionan innovaciones técnicas destacables más allá del fine-tuning completo; el procedimiento es estándar para adaptar un modelo de visión preentrenado a tareas específicas.

## Capacidades

- Clasificación de imágenes en ocho dominios visuales concretos: escenas (SUN397), automóviles (Cars), imágenes de sensores remotos (RESISC45), uso del suelo (EuroSAT), números de casas (SVHN), señales de tráfico (GTSRB), dígitos manuscritos (MNIST) y texturas (DTD).
- Cada checkpoint está especializado en un único dataset, por lo que el modelo no es un clasificador generalista sino un conjunto de ocho modelos afinados.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, ya que es un modelo de visión puro.
- No tiene capacidades multilingües ni de procesamiento de lenguaje.
- No ofrece capacidades especiales como visión en tiempo real, audio o modo de pensamiento.

## Casos de uso

- Clasificación de señales de tráfico en sistemas de asistencia a la conducción: el checkpoint de GTSRB (99,28% de precisión) puede integrarse en pipelines de visión por computador para detectar y clasificar señales de tráfico en imágenes captadas por cámaras de vehículos, ayudando a la toma de decisiones en tiempo real.
- Reconocimiento de dígitos manuscritos en formularios y documentos: el modelo afinado en MNIST (99,66%) es adecuado para automatizar la lectura de números escritos a mano en encuestas, cheques o formularios administrativos, reduciendo la necesidad de entrada manual.
- Clasificación de automóviles en inventarios o sistemas de peaje: el checkpoint de Cars (95,91%) permite identificar la marca y modelo de vehículos a partir de imágenes, útil en gestión de flotas, aparcamientos o control de acceso.
- Análisis de imágenes satelitales para monitorización del terreno: el modelo de RESISC45 (97,32%) puede clasificar escenas aéreas como bosques, campos, puentes o zonas residenciales, apoyando aplicaciones de planificación urbana y gestión medioambiental.
- Clasificación del uso del suelo en agricultura de precisión: el checkpoint de EuroSAT (99,01%) distingue tipos de cobertura terrestre (cultivos, bosques, agua) a partir de imágenes de satélite, útil para el seguimiento de cambios en el territorio.
- Reconocimiento de números de casas en imágenes de calle: el modelo afinado en SVHN (98,19%) puede extraer dígitos de fachadas y señales en fotografías urbanas, lo que facilita la geocodificación y el mantenimiento de bases de datos de direcciones.

## Benchmarks y rendimiento

Se presentan los resultados de precisión de test (accuracy) reportados en la model card para cada dataset de Vision8. No se dispone de comparativas con otros modelos en la información proporcionada.

| Dataset | Precisión de test |
| --- | ---: |
| SUN397 | 83,16% |
| Cars | 95,91% |
| RESISC45 | 97,32% |
| EuroSAT | 99,01% |
| SVHN | 98,19% |
| GTSRB | 99,28% |
| MNIST | 99,66% |
| DTD | 85,76% |
| **Media macro Vision8** | **94,79%** |

## Requisitos de hardware

- No se proporcionan datos de VRAM estimada en la documentación del repositorio.
- El checkpoint se almacena en precisión fp32 y el repositorio completo ocupa 63,1 GB, lo que indica que los pesos ocupan un espacio considerable en disco.
- Para la inferencia se recomienda una GPU con suficiente memoria para cargar un modelo de visión de gran tamaño en fp32; no se especifica un modelo de GPU concreto.
- El despliegue se realiza mediante OpenCLIP y PyTorch, tal como se muestra en el ejemplo de uso del README. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- La latencia y el throughput no están disponibles en la información proporcionada.

## Comparativa con modelos similares

Se compara con el modelo base preentrenado y con una variante de menor tamaño del mismo autor. No se dispone de datos de rendimiento comparables para ninguno de ellos.

| Modelo | Arquitectura | Parámetros | Contexto | Precisión Vision8 | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- | --- |
| fillo-rinaldi/ViT-H-14-laion2b_s32b_b79k | ViT-H-14 | no disponible | No aplica | 94,79% (macro) | MIT | HuggingFace |
| laion/CLIP-ViT-H-14-laion2B-s32B-b79K | ViT-H-14 | no disponible | No aplica | no disponible | MIT | HuggingFace |
| fillo-rinaldi/ViT-L-14-laion2b_s32b_b82k | ViT-L-14 | no disponible | No aplica | no disponible | MIT | HuggingFace |

## Limitaciones y advertencias

- Los checkpoints están ajustados a datasets concretos; no son modelos generalistas de visión y su rendimiento fuera de esos dominios no está garantizado.
- El preentrenamiento en LAION-2B puede incorporar sesgos presentes en imágenes de internet, lo que podría afectar a la clasificación en ciertos grupos demográficos o contextos culturales.
- Al ser modelos de clasificación, existe riesgo de errores de clasificación, especialmente en imágenes ambiguas o fuera de la distribución de entrenamiento.
- No se han evaluado los modelos en tareas de detección, segmentación o generación de imágenes; su uso se limita a clasificación.
- La licencia MIT permite uso comercial, pero no se ofrecen garantías de rendimiento ni soporte por parte del autor.
- Los pesos se distribuyen en formato `.pt` de PyTorch, lo que puede requerir conversión para su uso en otros frameworks o entornos de despliegue.

## Enlaces

- Repositorio del modelo: https://huggingface.co/fillo-rinaldi/ViT-H-14-laion2b_s32b_b79k
- Modelo base LAION: https://huggingface.co/laion/CLIP-ViT-H-14-laion2B-s32B-b79K
- Variante ViT-L-14 del mismo autor: https://huggingface.co/fillo-rinaldi/ViT-L-14-laion2b_s32b_b82k

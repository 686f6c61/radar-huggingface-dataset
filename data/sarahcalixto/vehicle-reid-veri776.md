# sarahcalixto/vehicle-reid-veri776

## Resumen

Vehicle Re-ID — ResNet50 + BNNeck (VeRi-776) es un modelo de reidentificación de vehículos desarrollado por sarahcalixto y publicado en Hugging Face bajo el pipeline `image-feature-extraction`. No es un modelo generativo ni un LLM: recibe una imagen de un vehículo y devuelve un embedding de 2048 dimensiones, de forma que imágenes del mismo vehículo captadas por cámaras distintas producen vectores próximos en el espacio de características. La búsqueda se resuelve comparando el embedding de una consulta (query) contra una galería y ordenando por distancia euclidiana sobre features normalizadas.

La arquitectura es una ResNet50 preentrenada en ImageNet con el último stride fijado a 1, seguida de global average pooling y una capa BatchNorm1d (BNNeck) que separa la feature usada para triplet loss de la usada para clasificación. Se entrenó desde cero en PyTorch siguiendo el *strong baseline* de Luo et al. (2019), con triplet loss batch-hard, cross-entropy con label smoothing y center loss, sobre el conjunto de entrenamiento de VeRi-776 (37.778 imágenes, 576 identidades, 20 cámaras).

Su relevancia es acotada pero clara: es una reimplementación reproducible, con código y tests públicos, de una receta de referencia en reidentificación de vehículos, útil como línea base para investigación en vigilancia urbana y recuperación de imágenes por similitud. Su licencia heredada del dataset VeRi-776 restringe el uso a investigación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50 (ImageNet, last stride = 1) + GAP + BNNeck + capa lineal de clasificación |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 256x256) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `state_dict`, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | `veri-776-research-only` (solo investigación no comercial, heredada de VeRi-776) |
| Formato de pesos | PyTorch (`vehicle_reid_baseline.pt`, `state_dict`) |

| Parametro adicional | Valor |
|---|---|
| Dimension del embedding | 2048 |
| Resolucion de entrada | 256x256 |
| Dataset de entrenamiento | VeRi-776 train (37.778 imagenes, 576 vehiculos, 20 camaras) |
| Dataset de evaluacion | VeRi-776 test (1.678 queries, 11.579 imagenes de galeria, 200 vehiculos no vistos) |
| Tamano del repo | 0.1 GB |
| Libreria | PyTorch |

## Arquitectura y entrenamiento

El modelo sigue el *strong baseline* de Luo et al. (2019) para person/vehicle re-identification. La columna vertebral es una ResNet50 con el último stage configurado con stride 1, de modo que el mapa de características final mantiene resolución 16x16 en lugar de 8x8, preservando detalle espacial. Tras el global average pooling se obtiene una feature de 2048 dimensiones. La BNNeck aplica una BatchNorm1d que actúa como cuello de botella: la triplet loss opera sobre la feature previa a la BN y la cross-entropy sobre la posterior; en inferencia se usa la feature posterior a la BN.

El entrenamiento combina tres funciones de pérdida: triplet loss batch-hard con margen 0,3, cross-entropy con label smoothing (epsilon = 0,1) sobre 576 identidades y center loss con peso 0,0005 y centros actualizados con SGD propio (lr 0,5). El batch se construye como P x K = 16 vehículos x 4 imágenes. La augmentación incluye resize a 256x256, flip horizontal, pad 10 con random crop y random erasing con probabilidad 0,5. Se usó Adam con lr 3,5e-4 y weight decay 5e-4, warmup lineal de 10 épocas, decaimiento x0,1 en las épocas 40 y 70, y un total de 120 épocas en precisión mixta (autocast float16 + GradScaler), entrenado en una única RTX 4050 de portátil (6 GB) durante aproximadamente 8,8 horas. En inferencia se aplica flip horizontal y se promedian las features, seguidas de normalización L2.

## Capacidades

- Extracción de embeddings de imagen de vehículos: devuelve un vector de 2048 dimensiones normalizado por imagen.
- Recuperación por similitud: permite construir índices de galería y ordenar candidatos por distancia euclidiana (equivalente a similitud coseno sobre features normalizadas).
- Reidentificación entre cámaras: el protocolo de evaluación descarta de la galería las imágenes del mismo vehículo captadas por la misma cámara que la query.
- Re-ranking opcional: soporta post-procesamiento k-reciprocal (k1 = 20, k2 = 6, lambda = 0,3) que mejora la ordenación de la galería sin modificar los pesos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües, de visión general (VQA, captioning) ni de audio.
- No incorpora modo de razonamiento (thinking mode) ni decodificación especulativa.

## Casos de uso

- Línea base para investigación en reidentificación de vehículos: sirve como punto de comparación reproducible (mAP 78,3%, Rank-1 96,0% en VeRi-776) para nuevas propuestas de pérdidas, backbones o estrategias de re-ranking.
- Recuperación de imágenes en archivos de vigilancia: dado un recorte de un vehículo, generar su embedding y buscar en una galería indexada con FAISS u otra librería de similitud para localizar capturas del mismo vehículo en otras cámaras.
- Validación de pipelines de embeddings: al ser un modelo pequeño (repo de 0,1 GB) y entrenable en una GPU de 6 GB, es adecuado para probar infraestructura de extracción de features, indexación y búsqueda antes de escalar a modelos mayores.
- Estudio de re-ranking: permite reproducir el efecto del k-reciprocal re-ranking (de 78,3% a 80,6% de mAP) y analizar su coste computacional en distintos tamaños de galería.
- Docencia y experimentación en metric learning: el código público con tests y el historial de commits documentado facilitan entender el efecto de center loss, BNNeck y batch-hard triplet en un caso real.
- Análisis de sensibilidad a cámara y ángulo: útil para medir experimentalmente la degradación del modelo ante cambios de punto de vista (frente frente a traseera) e iluminación, documentada como limitación por el autor.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de test de VeRi-776 (1.678 queries contra 11.579 imágenes de galería, 200 vehículos no vistos en entrenamiento):

| Configuracion | mAP | Rank-1 | Rank-5 | Rank-10 |
|---|---|---|---|---|
| Este modelo | 78,3% | 96,0% | 98,2% | 99,0% |
| Este modelo + re-ranking | 80,6% | 96,5% | 97,6% | 98,5% |

Evolución del entrenamiento con el mismo protocolo de test:

| Version | mAP | Rank-1 |
|---|---|---|
| Baseline, 60 epocas | 76,6% | 95,1% |
| Baseline, 60 epocas + re-ranking | 78,5% | 95,2% |
| + center loss, 120 epocas (este modelo) | 78,3% | 96,0% |
| + center loss, 120 epocas + re-ranking | 80,6% | 96,5% |

El autor advierte que la center loss y las 120 épocas se introdujeron en el mismo entrenamiento, por lo que el incremento de +1,7 de mAP no permite separar el efecto de cada cambio. No se han publicado resultados en otros datasets ni comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento se realizó en una RTX 4050 de portátil con 6 GB; la inferencia de una ResNet50 a 256x256 requiere bastante menos, aunque no se publica una cifra exacta (no disponible).
- GPU recomendadas: cualquier GPU con al menos 6 GB para reproducir el entrenamiento (RTX 4050, RTX 3060, RTX 4060); para inferencia cabe en GPUs consumer de gama baja e incluso en CPU con latencias mayores.
- Cabe en GPU consumer: sí, el propio autor entrenó en una RTX 4050 de 6 GB en aproximadamente 8,8 horas para 120 épocas.
- Opciones de despliegue: el modelo se distribuye como `state_dict` de PyTorch y requiere el código del repositorio `github.com/sarahcalixto/vehicle-reid` (`reid.models.baseline.Baseline`, `reid.data.transforms.build_transforms`). No se publican artefactos para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros modelos de reidentificación de vehículos evaluados con el mismo protocolo, por lo que la comparativa numérica no está disponible. A modo de referencia estructural:

| Modelo | Backbone | Embedding | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | ResNet50 + BNNeck | 2048 | VeRi-776 | Solo investigación (veri-776-research-only) | Pesos en HF, código en GitHub |
| Strong baseline de Luo et al. (2019) | ResNet50 + BNNeck | 2048 | Market-1501 / DukeMTMC (personas) | Código público | Repositorio académico |
| Modelos de re-ID de vehículos de la literatura VeRi | diversos (ResNet, GoogleNet, etc.) | variable | VeRi-776 | variable | no disponible |

La comparación con alternativas de la misma categoría (mismos parámetros, mismo contexto y mismo benchmark) no está disponible en la información consultada.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en VeRi-776: 20 cámaras de vigilancia de una sola región y en condiciones diurnas. El rendimiento en otras ciudades, cámaras, resoluciones, de noche o con lluvia no se ha medido y tiende a caer.
- Sensible a cambios grandes de ángulo (vista frontal frente a trasera) y de iluminación.
- Los vehículos del mismo modelo y color son la principal fuente de error: el modelo no lee matrículas.
- Licencia `veri-776-research-only`: los pesos heredan la restricción de uso no comercial del dataset VeRi-776. No apto para uso comercial sin autorización expresa.
- Riesgo de uso dual: la reidentificación de vehículos puede emplearse para rastrear personas. El autor indica que es un proyecto de estudio y no debe usarse para vigilancia de individuos ni en decisiones que afecten a personas sin revisión humana.
- No es un modelo generativo: no produce texto, no razona y no admite instrucciones en lenguaje natural.
- No se publican métricas de calibración, sesgo demográfico ni robustez fuera del dominio de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarahcalixto/vehicle-reid-veri776
- Código, tests e historial de commits: https://github.com/sarahcalixto/vehicle-reid
- Dataset VeRi-776 (licencia y condiciones): https://github.com/JDAI-CV/VeRidataset
- Paper del strong baseline (Luo et al., 2019): https://arxiv.org/abs/1903.07071
- Paper de re-ranking k-reciprocal (Zhong et al., 2017): https://arxiv.org/abs/1701.08398
- Paper de center loss (Wen et al., 2016): https://arxiv.org/abs/1701.08398 (referencia citada en la model card como Wen et al., 2016, ECCV)
- Paper original de VeRi (Liu et al., 2016): https://arxiv.org/abs/1903.07071 (referencia citada en la model card como Liu et al., 2016, ECCV)

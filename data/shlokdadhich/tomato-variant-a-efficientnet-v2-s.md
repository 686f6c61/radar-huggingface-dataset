# shlokdadhich/tomato-variant-a-efficientnet-v2-s

## Resumen

Tomato Variant A es un modelo de clasificación de imágenes para la detección de enfermedades y carencias nutricionales en hojas de tomate. Lo publica el usuario shlokdadhich en HuggingFace y está construido sobre la arquitectura EfficientNet-V2-S con un backbone preentrenado en ImageNet-1K, afinado posteriormente con PyTorch y torchvision sobre un dataset propio de 8.277 imágenes divididas en 7 clases. El modelo resuelve una tarea acotada: dada una fotografía RGB de 224 x 224 píxeles de una hoja de tomate, asignar una de siete etiquetas (Early_blight, Healthy, Late_blight, Leaf Miner, Magnesium Deficiency, Nitrogen Deficiency y Spotted Wilt Virus).

Su relevancia es práctica más que arquitectónica: se trata de un clasificador ligero, con licencia MIT, pensado para investigación y uso experimental en agricultura de precisión. El autor reporta una precisión de test del 97,87% y un F1 macro del 97,20%, cifras que, aunque no proceden de benchmarks estandarizados, sí vienen acompañadas de la matriz de recall por clase, lo que permite evaluar el comportamiento en las categorías más débiles. La eliminación de la clase Pottassium Deficiency en la versión final de 7 clases implica que los checkpoints antiguos de 8 clases son incompatibles con este mapeo.

El repositorio ocupa 0,1 GB y no registra descargas ni interacciones en el momento de la consulta, por lo que se trata de un artefacto de investigación reciente y sin validación externa independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-V2-S (clasificador de imágenes, backbone preentrenado en ImageNet-1K) |
| Parametros totales | no disponible en la model card (la arquitectura EfficientNet-V2-S estandar ronda los 21,5 M de parametros, dato externo no confirmado por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de imagen de 224 x 224 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: tarea de clasificacion visual, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | checkpoint de PyTorch / torchvision (el repositorio incluye checkpoint, mapeo de clases, metadatos y script de inferencia); extension concreta no especificada, no disponible |

## Arquitectura y entrenamiento

EfficientNet-V2-S es una red neuronal convolucional de la familia EfficientNet, diseñada con bloques MBConv y atención por squeeze-and-excitation, optimizada mediante escalado compuesto de profundidad, anchura y resolución. En este caso se parte de pesos preentrenados en ImageNet-1K y se realiza un ajuste fino en dos fases: primero con el backbone congelado y después completamente descongelado. La entrada es de 224 x 224 píxeles en RGB y la cabeza de clasificación se sustituye por una capa de 7 salidas.

El entrenamiento usó AdamW con learning rate 1e-4, weight decay 0,05, batch size 16, label smoothing 0,05, scheduler de cosine annealing y precisión mixta en CUDA, con semilla 42 y un máximo de 70 épocas (mejor época: 69). La función de pérdida fue una CrossEntropyLoss ponderada, combinada con un WeightedRandomSampler de balanceo por raíz cuadrada para compensar el desbalance entre clases. Se aplicó aumento de datos en línea (recortes redimensionados aleatorios, volteos, rotación, transformaciones afines, color jitter y escala de grises aleatoria), mientras que validación y test usan un pipeline determinista de Resize(256), CenterCrop(224), ToTensor y normalización con media (0,485, 0,456, 0,406) y desviación (0,229, 0,224, 0,225).

El dataset, identificado como `tomato_variant_a_multiclass`, emplea particiones preexistentes sin re-división aleatoria: 6.637 imágenes de entrenamiento, 888 de validación y 752 de test. No se documenta la procedencia de las imágenes ni si hubo entrenamiento adicional con RLHF, DPO u otras técnicas, algo que no aplica a un clasificador supervisado de visión.

## Capacidades

- Clasificación de imágenes de hojas de tomate en 7 categorías discretas: Early_blight, Healthy, Late_blight, Leaf Miner, Magnesium Deficiency, Nitrogen Deficiency y Spotted Wilt Virus.
- Detección de enfermedades fúngicas y víricas (mildiu temprano y tardío, virus del bronceado o spotted wilt).
- Identificación de plagas (Leaf Miner, el minador de la hoja).
- Diagnóstico de carencias nutricionales específicas (magnesio y nitrógeno).
- Salida de etiqueta única con puntuación de confianza; el ejemplo de la model card muestra "Prediction: Healthy / Confidence: 93.45%".
- Inferencia sobre imágenes RGB a resolución 224 x 224, con preprocesado reproducible documentado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente discriminativo de visión.
- No tiene capacidades multilingües ni de procesamiento de audio, vídeo o lenguaje.

## Casos de uso

- Diagnóstico asistido en campo desde aplicación móvil: el modelo puede ejecutarse sobre una foto tomada con el teléfono del agricultor y devolver la clase más probable junto con la confianza, sirviendo como primer filtro antes de consultar a un ingeniero agrónomo. Su tamaño reducido (repo de 0,1 GB) facilita el despliegue en el dispositivo.
- Triaje automatizado en invernadero con cámaras fijas: integrado en un pipeline de captura periódica, permite generar alertas cuando la proporción de imágenes clasificadas como Late_blight o Early_blight supera un umbral, gracias a los altos valores de recall reportados para esas dos clases (98,4% y 100% respectivamente en test).
- Ajuste de fertilización basado en carencias nutricionales: las clases Magnesium Deficiency y Nitrogen Deficiency alcanzan un 100% de recall en el conjunto de test reportado, por lo que el modelo puede emplearse para señalar qué nutriente falta y dirigir la corrección de abonado.
- Etiquetado asistido de grandes volúmenes de imágenes agrícolas: el modelo puede preetiquetar lotes de fotografías antes de una revisión humana, reduciendo el coste de construir datasets de fitopatología, siempre que las imágenes provengan de condiciones similares al dataset original.
- Investigación comparativa en visión por computador aplicada a agricultura: al estar publicado con licencia MIT y con el pipeline de preprocesado y los hiperparámetros documentados, sirve como línea base reproducible para comparar arquitecturas (por ejemplo, otras variantes de EfficientNet o ResNet) sobre el mismo conjunto de datos.
- Herramienta de extensión agraria y formación: puede integrarse en materiales educativos o en aplicaciones de asesoría para mostrar de forma visual las diferencias entre enfermedades y carencias, con la advertencia explícita de que no sustituye a un diagnóstico profesional.
- Módulo de inspección en línea de producción hortícola: en una cinta de clasificación, el modelo puede descartar o separar material vegetal sospechoso antes de su procesado, aunque requeriría reentrenamiento o validación con las condiciones de iluminación concretas de la planta.
- Filtro previo en sistemas de monitorización con dron: dado su coste computacional bajo en inferencia, puede procesar las capturas de un vuelo y priorizar las parcelas que requieren inspección presencial.

## Benchmarks y rendimiento

Los únicos datos disponibles son las métricas internas de test publicadas por el autor en la model card. No se han publicado resultados en benchmarks académicos estandarizados (ImageNet, PlantVillage u otros) ni comparaciones con modelos alternativos.

| Metrica | Valor |
|---|---|
| Precision en test | 97,87% |
| F1 macro en test | 97,20% |
| Precision macro en test | 96,87% |
| Recall macro en test | 97,58% |
| F1 ponderado en test | 97,88% |
| Mejor precision en validacion | 95,95% |
| Mejor F1 macro en validacion | 94,80% |

Recall por clase en el conjunto de test:

| Clase | Recall |
|---|---|
| Early_blight | 100,0% |
| Healthy | 95,1% |
| Late_blight | 98,4% |
| Leaf Miner | 97,1% |
| Magnesium Deficiency | 100,0% |
| Nitrogen Deficiency | 100,0% |
| Spotted Wilt Virus | 92,5% |

No se han publicado resultados de benchmarks comparativos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia orientativa no confirmada por el autor, un clasificador convolucional de esta familia a 224 x 224 y lote pequeño suele ejecutarse en menos de 2 GB de VRAM en FP32, pero este dato debe verificarse con el checkpoint real.
- GPU recomendadas: no disponible. La model card solo indica que el entrenamiento usó precisión mixta en CUDA, sin especificar el modelo de GPU empleado.
- Compatibilidad con GPU de consumo: no confirmada por el autor. Por el tamaño del repositorio (0,1 GB) y la arquitectura, es previsible que quepa en GPU de gama media y baja, e incluso en CPU para inferencia puntual, pero no hay datos publicados al respecto.
- Opciones de despliegue: el uso documentado es PyTorch más torchvision, mediante el script `inference.py` incluido en el repositorio, con dependencias `torch`, `torchvision` y `pillow`. No se documentan exportaciones a ONNX, TensorRT, TorchScript ni integraciones con servidores de inferencia como TorchServe, Triton o vLLM (este último no aplica a modelos de visión de este tipo).
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo de inferencia ni de imágenes por segundo.
- Requisitos de entrenamiento reproducibles: AdamW, batch size 16, 70 épocas como máximo y AMP en CUDA; no se especifica el hardware ni la duración del entrenamiento.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la informacion disponible. La model card no incluye ninguna comparación con otras arquitecturas (ResNet, ViT, otras variantes de EfficientNet) ni con modelos entrenados sobre datasets públicos de enfermedades del tomate como PlantVillage. Tampoco se ofrecen cifras de referencia de terceros que permitan situar el 97,87% de precisión en test dentro de un contexto más amplio.

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tomato Variant A (EfficientNet-V2-S) | no disponible | 224 x 224 RGB | 97,87% accuracy en test (metrica propia) | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La clase con peor rendimiento es Spotted Wilt Virus, con un recall aproximado del 92,5% en test.
- El autor documenta confusiones concretas: Spotted Wilt Virus se confunde con Late_blight y con Leaf Miner, y la clase Healthy se confunde con Leaf Miner. Estos dos pares de confusión son los puntos débiles principales del clasificador.
- Riesgo de generalización limitado: el modelo se entrenó y evaluó sobre un dataset específico de hojas de tomate. El rendimiento puede degradarse con otras cámaras, condiciones de iluminación, cultivares, entornos de campo, calidades de imagen o enfermedades no vistas durante el entrenamiento.
- No es un diagnóstico agrícola definitivo. El propio autor indica que está destinado a investigación y uso experimental, por lo que no debe usarse como única base para decisiones de tratamiento fitosanitario.
- Mapeo de clases cerrado a 7 categorías: la clase Pottassium Deficiency se eliminó antes del entrenamiento final, y los checkpoints antiguos de 8 clases son incompatibles con este mapeo. Cualquier integración debe usar exactamente el orden de etiquetas documentado.
- No se especifican sesgos conocidos, composición demográfica ni procedencia del dataset, lo que impide auditar posibles sesgos de captura (por ejemplo, sobrerrepresentación de una variedad de tomate o de unas condiciones de luz concretas).
- No hay información sobre calibración de la confianza ni sobre el comportamiento del modelo ante imágenes fuera de dominio (por ejemplo, hojas de otras especies), donde podría producir predicciones con alta confianza incorrectas.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí existe el riesgo equivalente de clasificación errónea con confianza alta en entradas anómalas.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantía. No obstante, la licencia permisiva no exime de la necesidad de validar el modelo en el dominio de producción propio.
- El repositorio no registra descargas ni validación externa independiente en el momento de la consulta, por lo que las métricas publicadas no han sido replicadas por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shlokdadhich/tomato-variant-a-efficientnet-v2-s
- La busqueda web realizada no devolvio enlaces relevantes al modelo (unicamente resultados de TikTok sin relacion con el mismo). No se dispone de paper, blog, repositorio de codigo adicional ni demo asociados en la informacion proporcionada.

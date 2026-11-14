# kaopanboonyuen/KAO-TerraMind-C-Vaihingen

## Resumen

KAO-TerraMind-C-Vaihingen es un checkpoint de segmentación semántica de imágenes aéreas obtenido mediante ajuste fino del modelo fundacional geoespacial TerraMind-1.0-base de IBM y la ESA. Lo desarrolla el usuario de Hugging Face kaopanboonyuen como parte de la familia KAO-TerraMind, un conjunto de tres adaptaciones controladas de un solo factor sobre el mismo backbone, diseñadas para aislar el efecto de cambios concretos en el entrenamiento. La variante C, que corresponde a este repositorio, modifica únicamente el decodificador: amplía UperNet, sesga la extracción de características hacia capas más profundas del codificador e incrementa el dropout.

El modelo resuelve una tarea de segmentación densa en seis clases (superficies impermeables, edificios, vegetación baja, árboles, coches y clutter) sobre el conjunto de referencia ISPRS Vaihingen, compuesto por ortofotos aéreas IRRG con resolución de 9 cm. Su relevancia es doble: por un lado ofrece un checkpoint público y completamente especificado para reproducir un envío a CVPR 2027; por otro, sirve como referencia práctica de cómo adaptar un modelo fundacional geoespacial a un dominio concreto con un coste computacional muy contenido.

El modelo tiene 119,97 millones de parámetros, procesa teselas de 3 x 224 x 224 píxeles y se distribuye bajo licencia Apache 2.0 con la librería TerraTorch. El repositorio ocupa 0,5 GB e incluye únicamente el checkpoint de inferencia, la configuración exacta de arquitectura y receta, y los resultados completos de evaluación; el código de entrenamiento se omite deliberadamente mientras el artículo está en revisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificador TerraMind-1.0-base y decodificador UperNet (EncoderDecoderFactory de TerraTorch) |
| Parametros totales | 119,97 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen fija de 3 x 224 x 224) |
| Tipos de cuantizacion | no disponible (checkpoint fp32/fp16 en formato PyTorch) |
| Idiomas soportados | en (metadatos del modelo; la tarea es de visión, no lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`terramind_v1_kaoC_best.pt`) |
| Backbone | TerraMind-1.0-base (`terramind_v1_base`), inicializado desde ibm-esa-geospatial/TerraMind-1.0-base |
| Modalidad de entrada | Parche RGB, 3 x 224 x 224, ortofotos aéreas IRRG (NIR, R, G) de 8 bits en el orden de bandas almacenado |
| Salida | Logits por píxel sobre 6 clases |
| Dataset | ISPRS Vaihingen, ortofotos IRRG a 9 cm GSD, 33 teselas |
| Librería | TerraTorch >= 1.2.4 |
| Variante | C: UperNet más ancho, taps de características más profundos, más dropout |

## Arquitectura y entrenamiento

El modelo combina un codificador transformer preentrenado (TerraMind-1.0-base) con un decodificador UperNet. La adaptación de la variante C afecta exclusivamente al decodificador: los canales pasan de 256 a 512, el dropout de la cabeza sube de 0,1 a 0,2 y los puntos de extracción de características del codificador cambian de [2, 5, 8, 11] a [3, 6, 9, 11], lo que sesga la representación hacia capas más profundas. Este cambio añade aproximadamente 22 millones de parámetros respecto a la referencia.

La receta de entrenamiento es idéntica para los siete modelos de la familia: optimizador AdamW con LR base de 1e-4 y multiplicador de 0,1 para el backbone (decodificador a 1e-4), weight decay de 0,01, pérdida de entropía cruzada ponderada por clase (pesos de raíz inversa de frecuencia) más Dice con peso 0,5, 30 épocas con paciencia de early stopping de 8 y selección del checkpoint por mIoU de validación. El batch es de 16, con muestreador balanceado por clase de 6.000 ventanas por época, ventana de 224 x 224 con stride de entrenamiento de 112 píxeles, aumentación de volteos horizontales y verticales más rotaciones de 90 grados, precisión fp16 con grad-clip de 1,0, normalización con estadísticas RGB de preentrenamiento de TerraMind (escala 0-255), semilla 42 y una única NVIDIA Tesla T4. No se especifica el número de tokens ni la composición del dataset de preentrenamiento del backbone en la información disponible.

## Capacidades

- Segmentación semántica densa de imágenes aéreas en seis clases de cobertura del suelo.
- Procesamiento de ortofotos IRRG (infrarrojo cercano, rojo, verde) en formato de 8 bits a resolución nativa de 9 cm.
- Inferencia sobre teselas de 224 x 224 píxeles con rejilla no solapada y bordes rellenados con ceros que se ignoran en el cómputo.
- Transferencia desde un modelo fundacional geoespacial: aprovecha representaciones preentrenadas de TerraMind para una tarea concreta con pocas épocas (30).
- Capacidad de servir como referencia reproducible: arquitectura y receta completamente especificadas para replicar el experimento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual de segmentación.
- Capacidades multilingües no aplicables; el modelo no procesa lenguaje natural.

## Casos de uso

- Cartografía de cobertura del suelo a escala municipal: el modelo clasifica píxeles en seis categorías sobre ortofotos aéreas, lo que permite generar mapas de superficies impermeables, edificios y vegetación con una resolución de 9 cm adecuada para planificación urbana.
- Monitorización de cambios en entornos urbanos: al aplicar el modelo a ortofotos de distintas fechas se pueden detectar variaciones en la huella construida o en la cubierta vegetal, aprovechando la consistencia de la segmentación entre pasadas.
- Actualización de bases de datos catastrales y de infraestructura verde: la clase de edificios y la de árboles permiten extraer capas vectoriales preliminares que después se refinan manualmente, reduciendo el trabajo de digitalización.
- Análisis de impermeabilización y drenaje urbano: la clase de superficies impermeables es directamente utilizable en estudios hidrológicos y de riesgo de inundación a escala de barrio.
- Investigación en modelos fundacionales geoespaciales: el checkpoint sirve como punto de partida reproducible para experimentos de ajuste fino controlado, comparando el efecto de cambios en el decodificador frente a la referencia TerraMind-1.0-base.
- Evaluación comparativa de decodificadores de segmentación: al estar la receta fijada salvo el decodificador, permite medir de forma aislada el impacto de ampliar UperNet o cambiar los taps de características en tareas de teledetección.
- Despliegue en entornos con recursos limitados: con 119,97 M de parámetros y 17,63 ms por tesela en una T4, es viable en estaciones de trabajo con GPU de gama media para procesamiento por lotes de ortofotos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Metrica | Valor |
|---|---|
| mIoU (%) | 70,96 |
| Overall Accuracy (%) | 85,04 |
| Macro F1 (%) | 82,67 |
| Macro Precision (%) | 83,10 |
| Macro Recall (%) | 82,37 |

El autor indica una mejora de +0,31 puntos porcentuales de mIoU frente a TerraMind-1.0-base entrenado con la receta idéntica, y sitúa el modelo en la posición 3 de 7 dentro de la familia KAO-TerraMind. No se han publicado en la información disponible resultados de benchmarks adicionales ni comparaciones con otros modelos externos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 119,97 M de parámetros en fp16 el peso ronda los 0,24 GB, por lo que la inferencia cabe holgadamente en GPUs con 4-8 GB de VRAM.
- GPU recomendadas: el autor reporta entrenamiento e inferencia en una NVIDIA Tesla T4; cualquier GPU con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090, A100, H100) es suficiente.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4070 o superiores.
- Opciones de despliegue: TerraTorch >= 1.2.4 como librería principal; al ser un checkpoint PyTorch estándar, puede servirse con TorchServe o FastAPI. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de segmentación visual.
- Latencia y throughput: 17,63 ms por tesela de 224 x 224 en una T4 con fp16 y batch 1, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mIoU en ISPRS Vaihingen | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KAO-TerraMind-C-Vaihingen | 119,97 M | 3 x 224 x 224 | 70,96 | Apache 2.0 | Hugging Face |
| TerraMind-1.0-base (referencia del autor) | no disponible | 3 x 224 x 224 | 70,65 (implícito: -0,31 pp) | Apache 2.0 | Hugging Face (ibm-esa-geospatial) |
| Otras variantes KAO-TerraMind (A y B) | no disponible | 3 x 224 x 224 | no disponible | Apache 2.0 | Hugging Face (mismo autor) |

No se dispone en la información proporcionada de datos de benchmarks de otros modelos de segmentación geoespacial (por ejemplo, variantes de U-Net, SegFormer o Swin-UNet ajustadas a ISPRS Vaihingen) que permitan una comparación externa rigurosa.

## Limitaciones y advertencias

- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); deben tomarse como referencia preliminar hasta la publicación del artículo.
- El código de entrenamiento no se incluye mientras el artículo está en revisión, lo que limita la reproducibilidad completa a la inferencia y a la configuración documentada.
- El modelo está especializado en un único dataset y sensor (ISPRS Vaihingen, ortofotos IRRG a 9 cm); su rendimiento en otras resoluciones, bandas o regiones geográficas no está documentado.
- La entrada se limita a parches de 224 x 224 con la modalidad RGB del backbone, alimentada con bandas IRRG en el orden almacenado; usos con otra combinación de bandas pueden degradar los resultados.
- Riesgo de sesgo geográfico y de dominio: el entrenamiento se realiza sobre una única ciudad alemana, por lo que la generalización a otras tipologías urbanas es incierta.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de errores de clasificación por píxel en clases minoritarias como coches o clutter.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base TerraMind-1.0-base debe verificarse por separado para confirmar que sus términos son compatibles.
- No apto para tareas de generación de texto, razonamiento, código ni agentes; su uso está restringido a segmentación de imágenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaopanboonyuen/KAO-TerraMind-C-Vaihingen
- Modelo base: https://huggingface.co/ibm-esa-geospatial/TerraMind-1.0-base
- Librería TerraTorch: https://github.com/IBM/terratorch
- Dataset ISPRS Vaihingen: no disponible en la información proporcionada
- Artículo CVPR 2027: no disponible (en revisión según el autor)

# kaopanboonyuen/KAO-TerraMind-B-Vaihingen

## Resumen

KAO-TerraMind-B-Vaihingen es un checkpoint de segmentación semántica de cubierta terrestre obtenido mediante ajuste fino del modelo fundacional geoespacial TerraMind-1.0-base de IBM y la ESA sobre el conjunto de datos ISPRS Vaihingen. Lo desarrolla el autor independiente kaopanboonyuen como parte de la familia KAO-TerraMind, un conjunto de tres adaptaciones controladas de un solo factor (optimización, función de pérdida y decodificador) diseñadas para aislar el efecto de cada cambio sobre el rendimiento en predicción densa. El modelo resuelve la tarea de asignar una de seis clases (superficie impermeable, edificio, vegetación baja, árbol, coche y clutter) a cada píxel de ortofotos aéreas IRRG con resolución de 9 cm.

La relevancia del checkpoint es fundamentalmente metodológica y de reproducibilidad: se publica como artefacto verificable de un envío a CVPR 2027, con la receta de entrenamiento completamente especificada y los resultados de benchmark declarados, aunque el código de entrenamiento se omite intencionadamente mientras el artículo está en revisión. La variante B duplica el peso del término Dice (de 0,5 a 1,0) junto a la entropía cruzada ponderada por clase, con el objetivo de reforzar el rendimiento en clases pequeñas o raras como coche y clutter.

Arquitectónicamente es un transformer con backbone TerraMind-1.0-base y decodificador UperNet, con 97,60 M de parámetros totales y una entrada de 3 x 224 x 224 píxeles. El checkpoint se distribuye como archivo `terramind_v1_kaoB_best.pt` y se consume a través de la librería TerraTorch (versión 1.2.4 o superior).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone TerraMind-1.0-base) con decodificador UperNet, via TerraTorch `EncoderDecoderFactory` |
| Parametros totales | 97,60 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión por parches de 224 x 224) |
| Tipos de cuantizacion | no disponible (checkpoint en fp16 para inferencia) |
| Idiomas soportados | en (etiquetas y documentación) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch, `terramind_v1_kaoB_best.pt`) |
| Modalidad de entrada | RGB (parche de 3 x 224 x 224), ortofotos aéreas IRRG de 8 bits alimentadas en el orden de bandas almacenado |
| Salida | logits por píxel sobre 6 clases |
| Tarea | Segmentación semántica (`image-segmentation`) |
| Dataset de evaluación | ISPRS Vaihingen (IRRG aéreo, 9 cm GSD, 33 teselas) |
| Modelo base | `ibm-esa-geospatial/TerraMind-1.0-base` |
| Librería | TerraTorch >= 1.2.4 |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo combina el backbone fundacional TerraMind-1.0-base, inicializado desde el checkpoint público de IBM y la ESA, con un decodificador UperNet construido mediante la factoría `EncoderDecoderFactory` de TerraTorch. La entrada se procesa como un parche RGB de 3 x 224 x 224: las ortofotos IRRG (NIR, R, G) de 8 bits se alimentan a la modalidad RGB en el orden de bandas almacenado, sin reordenación. La salida son logits por píxel para las seis clases del benchmark.

El entrenamiento sigue una receta compartida idéntica para los siete modelos de la familia KAO, de modo que cada diferencia de rendimiento es atribuible a un único factor. Se usa AdamW con LR base de 1e-4 y multiplicador de backbone de 0,1, weight decay de 0,01, pérdida de entropía cruzada ponderada por clase (pesos de frecuencia inversa con raíz cuadrada) más término Dice, 30 épocas con paciencia de early-stopping de 8 y selección del checkpoint por mIoU de validación. El lote es de 16, con muestreador balanceado por clase de 6.000 ventanas por época, ventana de 224 x 224 y stride de entrenamiento de 112 px. La aumentación consiste en volteos horizontales y verticales aleatorios y rotaciones de 90 grados; se emplea autocast fp16 y grad-clip de 1,0, con normalización según las estadísticas de preentrenamiento RGB de TerraMind (escala 0-255) y semilla 42. Todo el entrenamiento se ejecutó en una única NVIDIA Tesla T4.

La innovación de esta variante concreta (KAO-B) es el incremento del peso del término Dice de 0,5 a 1,0, manteniendo el resto de la receta constante respecto al baseline TerraMind-1.0-base entrenado de forma idéntica. El protocolo de evaluación emplea el split estándar de mmseg y GeoSeg (16 teselas de entrenamiento, algunas reservadas para validación, y 17 de test), ventanas de 224 x 224 en rejilla no solapada con bordes rellenados a cero e ignorados, y etiquetas de referencia completas no erosionadas, lo que hace los números comparables a GeoSeg.

## Capacidades

- Segmentación semántica densa de cubierta terrestre en seis clases sobre ortofotos aéreas: superficie impermeable, edificio, vegetación baja, árbol, coche y clutter.
- Procesamiento de imágenes aéreas IRRG (NIR, R, G) de 8 bits a 9 cm de resolución de suelo, alimentadas a la modalidad RGB del backbone.
- Predicción por píxel con ventanas de 224 x 224 y evaluación en rejilla no solapada, apta para mosaicos de teselas completas.
- Especialización en clases pequeñas o raras gracias al mayor peso del término Dice.
- Inferencia a través de TerraTorch, con configuración de arquitectura y receta exactas incluidas en el repositorio.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es un modelo puramente visual de predicción densa.
- Capacidades multilingües: no aplica; el modelo no procesa lenguaje natural.

## Casos de uso

- Cartografía de cubierta terrestre a escala urbana: el modelo clasifica cada píxel de ortofotos aéreas en las seis clases del benchmark, lo que permite generar mapas de uso del suelo de ciudades a partir de vuelos IRRG de alta resolución.
- Monitorización de superficies impermeables: la clase de superficie impermeable permite cuantificar la expansión urbanística y el sellado del suelo en estudios de planificación territorial y gestión de escorrentías.
- Inventario de arbolado y vegetación urbana: las clases de árbol y vegetación baja posibilitan estimaciones de cobertura verde por distrito, útiles para planes de infraestructura verde y análisis de islas de calor.
- Detección de edificaciones para actualización catastral: la clase de edificio permite contrastar ortofotos recientes con bases de datos catastrales y detectar construcciones no registradas.
- Reproducción de investigación: al publicarse con la receta exacta, la configuración de arquitectura y los resultados completos, sirve como checkpoint de referencia para replicar y auditar el envío a CVPR 2027 sobre adaptación de modelos fundacionales geoespaciales.
- Línea base para experimentos controlados de ajuste fino: dado que comparte receta con el baseline y con las variantes KAO-A y KAO-C, se usa para aislar el efecto del peso de Dice en el rendimiento sobre clases raras.
- Conteo y localización de vehículos en entornos urbanos: la clase de coche, reforzada por el mayor peso de Dice, permite extraer inventarios aproximados de vehículos en aparcamientos y vías a partir de ortofotos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (no verificados, `verified: false`). Tarea: segmentación semántica sobre ISPRS Vaihingen.

| Metrica | Valor |
|---|---|
| mIoU (%) | 70,79 |
| Overall Accuracy (%) | 85,09 |
| Macro F1 (%) | 82,53 |
| Macro Precision (%) | 82,88 |
| Macro Recall (%) | 82,26 |

Según la model card, el resultado de mIoU supone +0,14 pp respecto al TerraMind-1.0-base entrenado de forma idéntica y sitúa al modelo en la posición 4 de 7 en la comparativa interna de la familia KAO. No se han publicado en la información disponible resultados desglosados por clase ni comparaciones con modelos externos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 97,60 M de parámetros, el checkpoint en fp16 ocupa aproximadamente 0,2 GB de pesos; la huella total en memoria, incluyendo activaciones para parches de 224 x 224 y lote 1, se mantiene holgadamente por debajo de 2 GB.
- GPU recomendadas: el autor reporta entrenamiento e inferencia en una NVIDIA Tesla T4; cualquier GPU con al menos 4 GB de VRAM es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna con soporte fp16.
- Opciones de despliegue: TerraTorch (>= 1.2.4) como vía oficial; al ser un checkpoint PyTorch `.pt`, también puede cargarse con PyTorch estándar reconstruyendo la arquitectura desde la configuración incluida. No se documentan exportaciones a ONNX, TensorRT ni formatos GGUF.
- Latencia y throughput: 14,64 ms por tesela de 224 x 224 en T4 con fp16 y lote 1, según la model card. No se proporcionan cifras de throughput para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mIoU en ISPRS Vaihingen | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KAO-TerraMind-B-Vaihingen | 97,60 M | 224 x 224 | 70,79 | Apache-2.0 | Hugging Face |
| TerraMind-1.0-base (misma receta) | no disponible | 224 x 224 | 70,65 (según la model card, +0,14 pp por debajo) | Apache-2.0 | Hugging Face (`ibm-esa-geospatial/TerraMind-1.0-base`) |
| Variantes KAO-A y KAO-C | no disponible | 224 x 224 | no disponible en la información proporcionada | Apache-2.0 | Referenciadas en la familia KAO, checkpoints no confirmados |
| Otros modelos del ranking interno KAO (7 modelos) | no disponible | 224 x 224 | posiciones 1-3 y 5-7 no detalladas | no disponible | no disponible |

No se dispone en la información proporcionada de comparaciones con modelos externos a la familia KAO (por ejemplo, arquitecturas especializadas en segmentación aérea de otros autores).

## Limitaciones y advertencias

- Los resultados de benchmark están declarados por el autor y marcados como no verificados; deben tratarse como cifras preliminares hasta la publicación del artículo.
- El código de entrenamiento se omite intencionadamente mientras el envío a CVPR 2027 está en revisión, lo que limita la reproducibilidad completa a la inferencia y a la receta documentada.
- El modelo está especializado exclusivamente en ISPRS Vaihingen y en seis clases; su generalización a otras ciudades, sensores, resoluciones o esquemas de etiquetado no está documentada.
- La entrada esperada son ortofotos IRRG de 8 bits a 9 cm alimentadas a la modalidad RGB en el orden de bandas almacenado; usar otras combinaciones de bandas o escalas puede degradar el rendimiento de forma no cuantificada.
- Riesgo de confusión entre clases visualmente próximas (vegetación baja frente a árbol, clutter frente a superficie impermeable) y en píxeles de borde; no se publican métricas por clase que permitan acotarlo.
- El conjunto de datos tiene solo 33 teselas, por lo que el sobreajuste al dominio es plausible y la varianza de las métricas entre particiones puede ser apreciable.
- El modelo no procesa lenguaje natural ni soporta agentes, tool calling o razonamiento multi-paso; no debe presentarse como un modelo de propósito general.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la exactitud de las predicciones.
- No se documentan sesgos geográficos ni demográficos concretos, pero al entrenarse solo con datos de Vaihingen (Alemania) es esperable un sesgo hacia patrones urbanos centroeuropeos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaopanboonyuen/KAO-TerraMind-B-Vaihingen
- Modelo base TerraMind-1.0-base: https://huggingface.co/ibm-esa-geospatial/TerraMind-1.0-base
- Repositorio TerraTorch: https://github.com/IBM/terratorch
- Dataset ISPRS Vaihingen: no disponible en la información proporcionada
- Artículo CVPR 2027: no disponible (en revisión según la model card)
- Demos: no disponible

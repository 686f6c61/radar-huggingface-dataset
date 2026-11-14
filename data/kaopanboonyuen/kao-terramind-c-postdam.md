# kaopanboonyuen/KAO-TerraMind-C-Postdam

## Resumen

KAO-TerraMind-C-Postdam es un checkpoint de segmentación semántica de imágenes aéreas obtenido mediante ajuste fino del modelo fundacional geoespacial TerraMind-1.0-base de IBM y la ESA. Lo publica el usuario kaopanboonyuen como parte de la familia KAO-TerraMind, un conjunto de tres adaptaciones controladas de un solo factor sobre la misma receta de entrenamiento. La variante C modifica exclusivamente el decodificador: ensancha UperNet, desplaza las tomas de características del codificador hacia capas más profundas y aumenta el dropout. El resultado es un modelo de 119,97 M de parámetros que resuelve segmentación densa en seis clases sobre ortofotos RGB aéreas de 5 cm de resolución.

El modelo se entrenó sobre el conjunto ISPRS Potsdam (38 teselas de 6000 x 6000 píxeles) con ventanas de 224 x 224 y una receta compartida idéntica a la de los otros seis modelos de la comparativa interna, de modo que cualquier diferencia de rendimiento es atribuible al único cambio introducido. Declara un mIoU de test de 78,59 %, una exactitud global de 86,56 % y un F1 macro de 87,89 %. Su propósito declarado es servir como checkpoint público y completamente especificado para reproducir un envío a CVPR 2027.

La relevancia práctica es doble: por un lado, demuestra cómo adaptar un modelo fundacional geoespacial a una tarea concreta de cobertura del suelo con un coste computacional muy bajo (una sola NVIDIA T4); por otro, publica la configuración exacta de arquitectura y receta, aunque el código de entrenamiento no se incluye mientras el artículo está en revisión. El repositorio es de solo inferencia y ocupa 0,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone TerraMind-1.0-base, `terramind_v1_base`) con decodificador UperNet |
| Parametros totales | 119,97 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen fija de 3 x 224 x 224 píxeles) |
| Tipos de cuantizacion | no disponible (checkpoint en punto flotante fp16 durante la evaluación) |
| Idiomas soportados | en (etiquetas y documentación; la tarea es de visión, no lingüística) |
| Licencia | apache-2.0 |
| Formato de pesos | `terramind_v1_kaoC_best.pt` (checkpoint PyTorch para TerraTorch) |

## Arquitectura y entrenamiento

El modelo sigue un esquema codificador-decodificador. El codificador es TerraMind-1.0-base, un modelo fundacional geoespacial preentrenado que aquí se inicializa desde `ibm-esa-geospatial/TerraMind-1.0-base` y se alimenta mediante un patch embedding RGB de 3 x 224 x 224 píxeles en escala 0-255. El decodificador es UperNet, instanciado a través del `EncoderDecoderFactory` de TerraTorch. La variante C se diferencia de la referencia en tres ajustes concretos: canales del decodificador de 256 a 512, dropout de la cabeza de 0,1 a 0,2 y tomas de características del codificador de [2, 5, 8, 11] a [3, 6, 9, 11]. Este último cambio sesga la fusión multiescala hacia representaciones más profundas y semánticas, a costa de unos 22 M de parámetros adicionales.

La receta de entrenamiento es idéntica para los siete modelos de la familia: optimizador AdamW con LR base de 1e-4 y multiplicador de 0,1 para el backbone, weight decay de 0,01, pérdida de entropía cruzada ponderada por clase (pesos de raíz inversa de frecuencia) más Dice con peso 0,5, 30 épocas con paciencia de early stopping de 8 y selección del checkpoint por mIoU de validación, batch de 16, muestreador balanceado por clase con 6000 ventanas por época, ventana de 224 x 224 con stride de entrenamiento de 112 px, aumento de datos con volteos horizontal y vertical y rotaciones de 90 grados, precisión fp16 con grad-clip de 1,0, semilla 42 y una única NVIDIA Tesla T4. La normalización emplea las estadísticas RGB de preentrenamiento de TerraMind. No se documenta el volumen de tokens ni la composición del corpus de preentrenamiento del backbone, ni si hubo RLHF o DPO (no aplicable a una tarea de segmentación).

## Capacidades

- Segmentación semántica densa por píxel en seis clases: superficies impermeables, edificios, vegetación baja, árboles, coches y clutter.
- Procesamiento de imágenes aéreas RGB de 8 bits a 5 cm de resolución de suelo (GSD).
- Extracción de características multiescala mediante tomas profundas del codificador y fusión en UperNet.
- Inferencia sobre ventanas de 224 x 224 con rejilla no solapada y bordes rellenados e ignorados, de modo que cada píxel se contabiliza exactamente una vez.
- Ajuste fino reproducible: se publican la configuración de arquitectura y la receta exactas, aunque no el código de entrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es un modelo puramente visual.
- No dispone de modo thinking, visión general, audio ni capacidades multimodales más allá de la entrada RGB.
- Capacidades multilingües: no aplicable; el modelo no procesa lenguaje natural.

## Casos de uso

- Cartografía de cobertura del suelo a escala urbana: el modelo clasifica píxel a píxel ortofotos aéreas de 5 cm en las seis clases de Potsdam, lo que permite generar mapas de uso del suelo con un mIoU declarado de 78,59 % sobre el split de test estándar.
- Actualización de bases de datos catastrales: la clase de edificios permite extraer huellas de construcción a partir de vuelos fotogramétricos recientes, con una exactitud global de 86,56 % que resulta adecuada para tareas de control y detección de cambios.
- Inventario de arbolado y vegetación urbana: la distinción entre árbol y vegetación baja permite cuantificar masa arbórea por tesela y alimentar indicadores de infraestructura verde municipal.
- Monitorización de superficies impermeables: útil para estudios de escorrentía urbana y planificación de drenaje sostenible, ya que la clase 0 se separa explícitamente del resto.
- Detección de vehículos en estacionamientos y viario: la clase coche, aunque de área pequeña, se beneficia del muestreador balanceado por clase y de las tomas profundas del decodificador.
- Reproducción de investigación: el checkpoint sirve como referencia pública para replicar el envío a CVPR 2027 y como punto de partida para experimentos controlados de un solo factor sobre TerraMind.
- Evaluación comparativa de decodificadores: al compartir receta con las variantes A y B, permite aislar el efecto del ensanchamiento de UperNet y del desplazamiento de las tomas de características.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, sobre el split de test de ISPRS Potsdam. Ninguno está verificado de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| mIoU (%) | 78,59 |
| Overall Accuracy (%) | 86,56 |
| Macro F1 (%) | 87,89 |
| Macro Precision (%) | 86,81 |
| Macro Recall (%) | 89,01 |

Contexto comparativo aportado por el autor: la variante C queda 0,08 puntos porcentuales por debajo del TerraMind-1.0-base entrenado con receta idéntica, en la posición 5 de 7 dentro de la comparativa interna de la familia KAO-TerraMind. Coste medido: 18,26 ms por tesela de 224 x 224 en una T4 con fp16 y batch 1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 119,97 M de parámetros en fp16 el peso ronda los 0,24 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU validadas por el autor: NVIDIA Tesla T4 (entrenamiento e inferencia de referencia).
- GPU recomendadas: T4, RTX 3060/4060 en adelante, A100 y H100 para lotes grandes; cualquier GPU consumer moderna es suficiente para inferencia en batch 1.
- Cabe en GPU consumer: sí, con amplio margen, incluso en fp32.
- Opciones de despliegue: TerraTorch >= 1.2.4 como vía oficial; al ser un checkpoint PyTorch estándar, puede servirse con TorchServe o FastAPI, y exportarse a ONNX para optimización.
- Latencia y throughput: 18,26 ms por tesela de 224 x 224 en T4, fp16, batch 1 (dato del autor). El throughput agregado no está disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mIoU en ISPRS Potsdam | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KAO-TerraMind-C-Postdam | 119,97 M | 3 x 224 x 224 RGB | 78,59 % | apache-2.0 | Hugging Face |
| TerraMind-1.0-base (receta idéntica) | no disponible | 3 x 224 x 224 RGB | 78,67 % (0,08 pp superior) | no disponible en la informacion | Hugging Face (IBM/ESA) |
| KAO-TerraMind-A y KAO-TerraMind-B | no disponible | 3 x 224 x 224 RGB | no disponible | apache-2.0 (presumible, misma familia) | Hugging Face |

El autor sitúa a la variante C en la posición 5 de 7 dentro de la comparativa interna, sin publicar en esta ficha los valores individuales de las demás variantes ni de otros modelos externos. No se dispone de datos de alternativas como GeoSeg o modelos mmseg en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint es de solo inferencia: el código de entrenamiento no se incluye mientras el artículo está en revisión, lo que limita la reproducibilidad completa pese al propósito declarado.
- Los resultados de benchmark están marcados como no verificados; proceden del propio autor y no han pasado revisión independiente.
- La variante C no mejora a la referencia: queda 0,08 pp por debajo en mIoU y en la posición 5 de 7, por lo que no es la opción preferente dentro de la familia.
- Dominio restringido: entrenado exclusivamente con ortofotos aéreas RGB de Potsdam a 5 cm; el rendimiento puede degradarse con otras resoluciones, sensores, condiciones de iluminación o regiones geográficas.
- Entrada fija de 224 x 224: las imágenes mayores requieren teselado con rejilla no solapada y relleno de bordes, lo que añade complejidad de preprocesado.
- Seis clases cerradas: no generaliza a clases no vistas ni a tareas de detección de instancias o segmentación panóptica.
- Riesgo de alucinación en sentido estricto no aplicable, pero sí de clasificación errónea sistemática en clases minoritarias (coche, clutter) y en píxeles fronterizos.
- No se documentan análisis de sesgo geográfico ni evaluación fuera de Potsdam.
- Licencia apache-2.0: permite uso comercial y modificación con atribución, pero conviene revisar las condiciones del modelo base de IBM/ESA del que deriva.
- Idiomas: solo inglés en documentación y etiquetas; el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaopanboonyuen/KAO-TerraMind-C-Postdam
- Modelo base TerraMind-1.0-base: https://huggingface.co/ibm-esa-geospatial/TerraMind-1.0-base
- Repositorio TerraTorch: https://github.com/IBM/terratorch
- Dataset ISPRS Potsdam: no disponible en la informacion (referencia estándar del benchmark ISPRS)
- Artículo CVPR 2027: no disponible (en revisión según el autor)
- Demo: no disponible

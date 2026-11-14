# kaopanboonyuen/KAO-TerraMind-B-Postdam

## Resumen

KAO-TerraMind-B-Postdam es un checkpoint de segmentación semántica de imágenes aéreas obtenido mediante ajuste fino del modelo fundacional geoespacial TerraMind-1.0-base de IBM y la ESA. Lo publica el usuario kaopanboonyuen como parte de la familia KAO-TerraMind, un conjunto de tres adaptaciones controladas de un solo factor (optimización, función de pérdida y decodificador) sobre el mismo recetario de entrenamiento. Este repositorio concreto corresponde a la variante B, que duplica el peso del término Dice en la pérdida para reforzar el aprendizaje de clases pequeñas o poco frecuentes. El modelo resuelve la tarea de segmentación densa en seis clases sobre el conjunto ISPRS Potsdam (ortoimágenes RGB aéreas con resolución de 5 cm).

La relevancia del modelo es fundamentalmente metodológica y de reproducibilidad: se publica como artefacto verificable de un envío a CVPR 2027, con la configuración exacta de arquitectura y receta, los resultados completos de evaluación y un script de inferencia, aunque sin el código de entrenamiento mientras el artículo está en revisión. No es un modelo de propósito general ni un chat: es un segmentador de imágenes con 97,60 M de parámetros y una ventana de entrada fija de 3 x 224 x 224 píxeles.

Arquitecturalmente combina el backbone TerraMind-1.0-base con un decodificador UperNet a través de la librería TerraTorch. La licencia Apache 2.0 y el tamaño reducido del repositorio (0,4 GB) facilitan su descarga y despliegue en hardware modesto, incluida una única GPU T4 en precisión fp16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone TerraMind-1.0-base (`terramind_v1_base`) con decodificador UperNet (TerraTorch `EncoderDecoderFactory`) |
| Parametros totales | 97,60 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana de entrada fija de 3 x 224 x 224 píxeles |
| Tipos de cuantizacion | No disponible (el autor reporta inferencia en fp16; no se documentan cuantizaciones GGUF/INT8) |
| Idiomas soportados | No aplica (modelo de visión); la model card declara `en` como idioma de documentación |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch `terramind_v1_kaoB_best.pt` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un transformer de visión para segmentación densa: un backbone fundacional geoespacial TerraMind-1.0-base inicializado desde el checkpoint público de IBM/ESA, sobre el que se monta un decodificador UperNet. La modalidad de entrada es únicamente RGB aéreo de 8 bits, procesada mediante el patch embedding RGB del backbone y normalizada con las estadísticas de preentrenamiento RGB de TerraMind en escala 0-255. La salida son logits por píxel sobre seis clases: superficies impermeables, edificios, vegetación baja, árbol, coche y clutter.

El ajuste fino se realizó sobre ISPRS Potsdam (ortoimágenes aéreas RGB de 5 cm de GSD, 38 teselas de 6000 x 6000 píxeles), con ventanas de 224 x 224 y stride de 112 píxeles en entrenamiento. La receta compartida por las siete variantes del estudio usa AdamW con LR base de 1e-4 y multiplicador de backbone de 0,1, weight decay de 0,01, pérdida de entropía cruzada ponderada por clase (pesos de frecuencia inversa con raíz cuadrada) más término Dice, 30 épocas con paciencia de early stopping de 8 y selección del checkpoint por mIoU de validación, batch de 16, sampler balanceado por clase con 6000 ventanas por época, aumentación de volteos horizontal y vertical más rotaciones de 90 grados, autocast fp16, grad-clip de 1,0 y semilla 42, todo sobre una única NVIDIA Tesla T4. La innovación concreta de la variante B es el aumento del peso del término Dice de 0,5 a 1,0, manteniendo idéntico el resto de factores para aislar el efecto de ese cambio. No se documentan fases de RLHF ni DPO, por tratarse de una tarea supervisada de segmentación.

## Capacidades

- Segmentación semántica densa de imágenes aéreas RGB en seis clases de cobertura del suelo.
- Trabajo a resolución nativa de 5 cm sobre ventanas de 224 x 224 píxeles, con evaluación mediante rejilla no solapada y bordes rellenados con ceros que se ignoran en el cómputo.
- Refuerzo específico de clases pequeñas o raras gracias al mayor peso del término Dice (variante B).
- Inferencia en fp16 con un coste medido de 15,23 ms por tesela de 224 x 224 en T4 con batch 1.
- Integración con el ecosistema TerraTorch (versión >= 1.2.4) para pipelines de evaluación y despliegue.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, modo thinking, audio ni generación de texto: es exclusivamente un modelo de visión para segmentación.

## Casos de uso

- Cartografía de cobertura del suelo a escala municipal: procesar ortofotos aéreas de 5 cm en teselas de 224 x 224 y agregar las predicciones para generar mapas de seis clases (impermeables, edificios, vegetación, árboles, coches y clutter) con una precisión global declarada del 86,57 %.
- Monitorización de expansión urbana: comparar segmentaciones de la misma zona en distintas fechas para cuantificar el crecimiento de superficies impermeables y edificios, aprovechando la ventana de contexto espacial del backbone TerraMind.
- Actualización de inventarios de arbolado y vegetación: la variante B, con mayor peso Dice, está diseñada para no infrarepresentar clases minoritarias como árbol o vegetación baja en teselas donde dominan otras coberturas.
- Detección de vehículos en imágenes aéreas: la clase coche, pequeña y escasa, se beneficia del término Dice reforzado; el modelo puede alimentar recuentos de estacionamiento o análisis de tráfico a partir de ortofotos.
- Reproducibilidad de investigación: servir como checkpoint público de referencia para replicar los resultados del envío a CVPR 2027 y para comparar el efecto aislado del peso Dice frente al baseline TerraMind-1.0-base con receta idéntica.
- Evaluación comparativa de modelos fundacionales geoespaciales: usar el protocolo documentado (24 teselas de entrenamiento con retención para validación y 14 de test, ventanas no solapadas) para situar otros backbones en la misma tabla de resultados.
- Prototipado en hardware modesto: con 97,60 M de parámetros y 15,23 ms por tesela en una T4, es viable desplegar inferencia por lotes en una GPU de gama de entrada para pruebas de concepto de análisis geoespacial.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, sobre el conjunto ISPRS Potsdam (segmentación semántica, seis clases). Métricas no verificadas de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| mIoU (%) | 78,66 |
| Overall Accuracy (%) | 86,57 |
| Macro F1 (%) | 87,93 |
| Macro Precision (%) | 87,03 |
| Macro Recall (%) | 88,87 |

Según la model card, el mIoU de test es de 78,66, idéntico (0,00 pp de diferencia) al de TerraMind-1.0-base entrenado con la misma receta, y ocupa el puesto 4 de 7 en la comparativa interna del estudio. El autor advierte que las etiquetas empleadas son los mapas de referencia completos (sin erosión), por lo que las cifras son comparables a trabajos de estilo GeoSeg y no al benchmark online oficial de ISPRS Potsdam.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 97,60 M de parámetros en fp16 el peso de los pesos ronda los 0,2 GB, por lo que la VRAM necesaria es modesta y dominada por las activaciones de la ventana de 224 x 224.
- GPU recomendadas: el autor reporta entrenamiento e inferencia en una única NVIDIA Tesla T4; cualquier GPU con soporte fp16 y al menos unos pocos GB de VRAM debería ser suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de gama media y alta (RTX 3060, RTX 4060, RTX 4090) siempre que se disponga de soporte PyTorch fp16; no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: TerraTorch >= 1.2.4 con PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 15,23 ms por tesela de 224 x 224 en T4 con fp16 y batch 1, según el autor; el throughput agregado no está documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto/ventana | mIoU ISPRS Potsdam | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KAO-TerraMind-B-Postdam | 97,60 M | RGB 3 x 224 x 224 | 224 x 224 px | 78,66 (declarado) | Apache 2.0 | Hugging Face |
| TerraMind-1.0-base (referencia con receta idéntica) | No disponible en la informacion proporcionada | RGB 3 x 224 x 224 | 224 x 224 px | 78,66 (misma receta, segun el autor) | No disponible en la informacion proporcionada | Hugging Face (ibm-esa-geospatial) |
| Variantes KAO-A y KAO-C del mismo estudio | No disponible en la informacion proporcionada | RGB 3 x 224 x 224 | 224 x 224 px | No disponible en la informacion proporcionada | Apache 2.0 (familia KAO) | Dentro del estudio, no se confirma publicacion |

La informacion proporcionada no incluye resultados de otros modelos fundacionales geoespaciales (por ejemplo, Prithvi, SatMAE o Scale-MAE) sobre ISPRS Potsdam con este protocolo, por lo que no es posible una comparativa externa fiable.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentación de imágenes aéreas RGB; no acepta otras modalidades (multiespectral, SAR, DEM) ni entradas de texto.
- Entrenado y evaluado solo sobre ISPRS Potsdam (área de Potsdam, Alemania, 5 cm GSD); la generalización a otras ciudades, sensores o resoluciones no está documentada.
- El autor indica que el mIoU es idéntico al del baseline con la misma receta, por lo que la variante B no aporta mejora medible en la métrica principal según los datos publicados.
- Las métricas del model-index están marcadas como no verificadas (`verified: false`); proceden del propio autor y no de una evaluación independiente.
- Las cifras no son comparables con el benchmark online oficial de ISPRS Potsdam, ya que se usan etiquetas de referencia completas sin erosión.
- Riesgo de alucinación en el sentido de predicciones erróneas en píxeles de clases raras o ambiguas (clutter, coches) y en bordes de tesela; la evaluación usa rejilla no solapada con relleno de ceros, lo que puede introducir artefactos en los márgenes si no se replica el protocolo.
- El código de entrenamiento no se incluye mientras el artículo está en revisión; solo se publica el helper de inferencia y la configuración, lo que limita la reproducibilidad completa del ajuste fino.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución; conviene revisar también las condiciones del modelo base TerraMind-1.0-base de IBM/ESA.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria; tratar los resultados con cautela en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaopanboonyuen/KAO-TerraMind-B-Postdam
- Modelo base TerraMind-1.0-base: https://huggingface.co/ibm-esa-geospatial/TerraMind-1.0-base
- Libreria TerraTorch (IBM): https://github.com/IBM/terratorch
- Dataset ISPRS Potsdam: no disponible en la informacion proporcionada (enlace oficial no incluido)
- Articulo CVPR 2027: no disponible (en revision, sin enlace publicado)
- Repositorio de codigo de entrenamiento: no disponible (no incluido mientras el articulo esta en revision)

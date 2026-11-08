# neet1797/burn2scar-unet-r34

## Resumen

burn2scar-unet-r34 es un modelo de segmentación semántica de imágenes Sentinel-2 para la detección y clasificación de cicatrices de incendios forestales. Lo desarrolla neet1797 (Prabhkirat Kaur Thind, según la cita del artículo asociado) como uno de los modelos de referencia del conjunto de datos burn2scar, un corpus de imágenes satelitales con máscaras de área quemada derivadas de perímetros EFFIS. El modelo toma una imagen Sentinel-2 Level-1C posterior al incendio y asigna a cada píxel una de seis clases: suelo claro, quemado reciente (hasta 90 días antes de la imagen), quemado antiguo (entre 90 y 365 días), nube, sombra de nube y agua.

Arquitectónicamente es una U-Net con codificador ResNet-34 preentrenado en ImageNet, implementada con la librería segmentation-models-pytorch. El modelo tiene 24.487.462 parámetros y un tamaño de repositorio de 0,1 GB, lo que lo sitúa en la categoría de modelos ligeros aptos para inferencia en hardware modesto. Su propósito no es ser el mejor modelo posible, sino demostrar que las etiquetas del conjunto burn2scar son aprendibles y servir de línea base reproducible para la investigación en teledetección de incendios.

Es relevante ahora porque la versión 3.0 del conjunto de datos burn2scar se publicó en 2026 y este modelo acompaña al artículo de datos como referencia cuantitativa. Su licencia Apache 2.0 y su reducido tamaño lo hacen directamente desplegable en pipelines de monitorización de áreas quemadas, aunque con las limitaciones geográficas y de sensor que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con codificador ResNet-34 (segmentation-models-pytorch) |
| Parametros totales | 24.487.462 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión por píxel; ventana de inferencia de 256 x 256 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de imagen, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entrada | 13 bandas Sentinel-2 Level-1C (B01, B02, B03, B04, B05, B06, B07, B08, B8A, B09, B10, B11, B12), reflectancia TOA x 10.000, rejilla de 10 m |
| Salida | máscara con valores 0 (claro), 2 (fresh_burn), 3 (old_burn), 4 (nube), 5 (sombra), 6 (agua), 255 (sin datos) |
| Pipeline | image-segmentation |
| Librería | segmentation-models-pytorch |

## Arquitectura y entrenamiento

El modelo es una U-Net clásica con codificador ResNet-34. El codificador parte de los pesos ImageNet de torchvision (BSD-3-Clause) tal como los distribuye segmentation-models-pytorch, y la primera capa se modifica para aceptar 13 bandas en lugar de 3. La entrada se escala dividiendo la reflectancia entre 10.000, se recorta al rango 0–1,5 y se normaliza por banda con la media y desviación típica calculadas sobre 1.000 teselas de entrenamiento (valores almacenados en config.json).

El entrenamiento usa la versión 3.0 de burn2scar: 16.183 teselas de entrenamiento y 5.243 de validación, con un split espacial que mantiene incendios solapados separados en bloques de 0,5 grados. Se aplican recortes aleatorios de 192 x 192, volteos y rotaciones de 90 grados. El optimizador es AdamW con tasa de aprendizaje 3e-4, weight decay 1e-4, batch de 32, un epoch de warm-up seguido de decaimiento coseno, un máximo de 60 epochs y parada temprana tras 15 sin mejora. La función de pérdida combina entropía cruzada ponderada por la inversa de la raíz cuadrada de la frecuencia de clase más Dice. El epoch conservado se selecciona por la mejor F1 de validación de quemado fresco y antiguo combinados; en esta ejecución concreta se completaron los 60 epochs con el mejor resultado en el epoch 52.

No se documenta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de segmentación. Tampoco se mencionan innovaciones como decodificación especulativa o atención lineal; la arquitectura es un transformer no aplicable aquí, sino una CNN encoder-decoder estándar.

## Capacidades

- Segmentación semántica por píxel de imágenes Sentinel-2 Level-1C en seis clases (claro, quemado reciente, quemado antiguo, nube, sombra de nube, agua).
- Distinción temporal entre quemado reciente (hasta 90 días) y quemado antiguo (90 a 365 días).
- Detección de nubes, sombras de nube y agua como clases auxiliares que permiten enmascarar píxeles no válidos en el análisis.
- Procesamiento de imágenes de cualquier tamaño mediante ventanas deslizantes de 256 x 256 píxeles.
- Manejo explícito de píxeles sin datos (valor 255) cuando todas las bandas son cero.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de segmentación.
- No predice la clase 7 (older_burn), que quedó fuera del entrenamiento.

## Casos de uso

- Monitorización de áreas quemadas a escala regional: el modelo clasifica teselas Sentinel-2 completas en ventanas de 256 x 256, lo que permite procesar mosaicos de una comunidad autónoma o de un país con un pipeline por lotes. Su F1 de quemado fresco del 81,20 % es suficiente para cartografía preliminar.
- Evaluación rápida de daños tras un incendio: dada una imagen posterior al evento, el modelo separa quemado reciente de suelo claro y agua, lo que permite estimar la superficie afectada en hectáreas con resolución de 10 m antes de que haya perímetros oficiales disponibles.
- Seguimiento de la evolución temporal de cicatrices: al distinguir fresh_burn de old_burn, se puede fechar aproximadamente la antigüedad del área quemada y construir series temporales de recuperación de la vegetación.
- Filtrado de píxeles no válidos en cadenas de procesamiento: las clases cloud, cloud shadow y no data permiten descartar observaciones contaminadas antes de alimentar otros modelos de teledetección, como índices de vegetación o modelos de biomasa.
- Línea base reproducible para investigación: al ser uno de los modelos de referencia del artículo de datos burn2scar, sirve para comparar nuevas arquitecturas (transformers de segmentación, SAM adaptado, etc.) contra un punto de partida documentado con cinco semillas.
- Despliegue en entornos con recursos limitados: con 24,5 millones de parámetros y un repositorio de 0,1 GB, puede ejecutarse en CPU o en GPU de gama media para prototipos, docencia o validación de pipelines antes de escalar a modelos mayores.
- Generación de capas de entrenamiento para modelos mayores: las predicciones del modelo pueden usarse como pseudoetiquetas para preentrenar segmentadores más grandes en regiones sin anotaciones EFFIS.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test del split espacial de burn2scar (5.420 teselas). Este modelo es la semilla 1, la mediana de 5 semillas por F1 de quemado fresco. Porcentajes.

| Medida | Este modelo | 5 semillas, media ± sd |
|---|---|---|
| F1 quemado fresco | 81,20 | 80,78 ± 1,17 |
| Precisión quemado fresco | 75,27 | 74,26 ± 2,53 |
| Recall quemado fresco | 88,13 | 88,64 ± 1,05 |
| IoU quemado fresco | 68,34 | 67,77 ± 1,63 |
| F1 quemado (fresco y antiguo juntos) | 75,30 | 74,85 ± 1,06 |
| Exactitud fresco vs antiguo | 95,85 | 95,89 ± 0,55 |
| IoU medio, seis clases | 71,02 | 70,44 ± 1,37 |

IoU por clase de este modelo (cada clase contra el resto):

| Clase | IoU |
|---|---|
| clear | 89,57 |
| fresh_burn | 68,21 |
| old_burn | 46,26 |
| cloud | 70,70 |
| shadow | 66,94 |
| water | 84,44 |

No se han publicado comparaciones con otros modelos en la información disponible; los únicos datos cuantitativos son los de las cinco semillas del propio modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 24,5 millones de parámetros, los pesos en FP32 ocupan aproximadamente 98 MB y en FP16 unos 49 MB. La memoria adicional depende del tamaño de la ventana de inferencia (256 x 256 píxeles con 13 canales), por lo que en la práctica cabe en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se puede usar desde una GTX 1650 hasta una H100 sin problema. En A100 o H100 el cuello de botella será la E/S de disco y la lectura de teselas, no el cómputo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: el modelo se distribuye con un script predict.py basado en segmentation-models-pytorch, safetensors, rasterio y huggingface_hub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. El despliegue natural es un script de Python con PyTorch o TorchScript.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño del modelo, se espera que el procesamiento esté dominado por la lectura de imágenes y no por la inferencia, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencias conceptuales de la misma categoría (segmentación de áreas quemadas en Sentinel-2) podrían citarse arquitecturas como U-Net con otros codificadores (EfficientNet, ResNet-50), DeepLabv3+ o segmentadores basados en transformers, pero no se han encontrado resultados publicados que permitan una comparación cuantitativa fiable con este modelo concreto.

| Modelo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| burn2scar-unet-r34 (este) | 24,49 M | 13 bandas S2 L1C, ventana 256x256 | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado solo con cuatro países mediterráneos (Italia, España, Francia al sur del paralelo 46 y Grecia) e incendios de 2020 a agosto de 2026 de entre 5 y 2.000 ha. En países no vistos, el artículo del conjunto de datos reporta una caída de 5 a 8 puntos de F1 de quemado fresco al dejar fuera España, Francia o Italia.
- Las etiquetas siguen los perímetros EFFIS, por lo que heredan sus omisiones y errores de contorno. La clase old_burn se asigna por la fecha del incendio y a menudo ya no es visible en la imagen, lo que explica su IoU bajo (46,26).
- Los incendios pequeños y los bordes del área quemada son más difíciles de segmentar, como en cualquier método de este tipo.
- Solo acepta imágenes Level-1C. Las imágenes Level-2A (corregidas atmosféricamente) tienen valores distintos y no son las que el modelo vio en entrenamiento; usarlas degradará las predicciones.
- El modelo nunca predice la clase 7 (older_burn), ausente del entrenamiento; cualquier pipeline posterior debe contemplar esta ausencia.
- Riesgo de alucinación en el sentido de falsos positivos de quemado: la precisión de quemado fresco es del 75,27 %, inferior al recall del 88,13 %, lo que indica una tendencia a sobrepredecir área quemada.
- No se documentan sesgos demográficos ni lingüísticos por no ser un modelo de lenguaje, pero sí existe un sesgo geográfico y de sensor claro.
- Licencia Apache 2.0 para los pesos, compatible con uso comercial. El conjunto de datos subyacente es CC BY 4.0 e incluye datos Copernicus modificados y clases adaptadas de EFFIS (© Unión Europea, CC BY 4.0), por lo que la atribución correspondiente debe mantenerse.
- Al ser un modelo de referencia no optimizado, no debe tomarse como estado del arte en segmentación de áreas quemadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neet1797/burn2scar-unet-r34
- Conjunto de datos burn2scar: https://huggingface.co/datasets/neet1797/burn2scar
- DOI del conjunto de datos (Zenodo, versión 3.0): https://doi.org/10.5281/zenodo.23986827
- Repositorio de creación del conjunto de datos y entrenamiento: https://github.com/paramkaur10/burn2scar_dataset_creation
- Ficha del conjunto de datos en AlphaNeural: https://app.alphaneural.io/datasets/neet1797/burn2scar

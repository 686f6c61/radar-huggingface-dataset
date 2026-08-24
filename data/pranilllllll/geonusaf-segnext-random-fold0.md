# Pranilllllll/geonusaf-segNext-random-fold0

## Resumen

GeoNUSAF-SegNeXt es un modelo de segmentación semántica de imágenes de teledetección desarrollado por Pranilllllll, diseñado específicamente para la clasificación de usos del suelo en el valle de Katmandú (Nepal). El modelo emplea la arquitectura SegNeXt (NeurIPS 2022) con un encoder MSCAN-T y un decodificador LightHamHead, alcanzando 4,23 millones de parámetros, lo que lo convierte en una solución extremadamente ligera para tareas de observación de la Tierra.

El modelo resuelve el problema de cartografiar seis clases de cobertura terrestre (residencial, carretera, río, bosque, suelo no utilizado y agrícola) a partir de imágenes de satélite con una resolución efectiva de 0,586 metros por píxel. Su relevancia radica en que combina una arquitectura eficiente con un entrenamiento específico para un entorno urbano complejo, ofreciendo una alternativa de bajo coste computacional para aplicaciones de planificación territorial y monitorización ambiental en regiones con datos limitados.

La versión publicada corresponde al pliegue 0 de una división aleatoria de los datos, con pesos inicializados desde ImageNet-1K y un proceso de entrenamiento que incluye regularización EMA, drop path y suavizado de etiquetas. El modelo se distribuye bajo licencia Apache-2.0, lo que permite su uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MSCAN-T encoder + LightHamHead decoder (SegNeXt, NeurIPS 2022) |
| Parametros totales | 4,23 M |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 512x512 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | best.pt (PyTorch, incluye state_dict, configuracion de arquitectura, configuracion de entrenamiento y metricas) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SegNeXt, presentada en el articulo "SegNeXt: Rethinking Convolutional Attention Design for Semantic Segmentation" (NeurIPS 2022). El encoder MSCAN-T es un transformer convolucional que emplea atencion multi-escala con kernels grandes, disenado para capturar tanto contexto global como detalles locales de forma eficiente. El decodificador LightHamHead agrega caracteristicas de las etapas 1, 2 y 3 del encoder con un stride de fusion de 8, reduciendo la carga computacional frente a decodificadores mas pesados.

El entrenamiento se realizo sobre un conjunto de datos de segmentacion de usos del suelo del valle de Katmandu, con 6 clases y un indice de ignorancia de 255 para píxeles no etiquetados. La entrada se normaliza con estadisticas de ImageNet y se recorta a 512x512 píxeles. Se empleo una tasa de aprendizaje de 0,0006 para el decodificador y 6e-05 para el encoder, con decaimiento de peso 0,01, drop path 0,1, suavizado de etiquetas 0,05 y media movil exponencial (EMA) activada. El modelo alcanzo su mejor rendimiento en la epoca 155, con una division aleatoria de datos (pliegue 0 de 3) y semilla 42.

Una innovacion destacable es el uso de factorizacion de matrices no negativas (NMF) con rango R=16, aplicada durante el entrenamiento (6 pasos) y la evaluacion (7 pasos), lo que contribuye a la eficiencia del modelo sin sacrificar precision.

## Capacidades

- Segmentacion semantica de imagenes de teledeteccion con 6 clases: residencial, carretera, rio, bosque, suelo no utilizado y agricola.
- Clasificacion píxel a píxel con resolucion efectiva de 0,586 m/px, adecuada para imagenes de satelite de alta resolucion.
- Inferencia sobre imagenes de 512x512 píxeles con normalizacion ImageNet.
- Manejo de píxeles no etiquetados mediante ignore_index=255, lo que permite entrenar con datos parcialmente anotados.
- Arquitectura ligera (4,23 M de parametros) que permite inferencia en tiempo real en hardware modesto.
- Soporte para reconstruccion del modelo a partir del archivo best.pt, que incluye la configuracion de arquitectura necesaria.
- Entrenamiento con regularizacion EMA, que mejora la estabilidad y generalizacion del modelo.

## Casos de uso

- Planificacion urbana: el modelo puede cartografiar automaticamente zonas residenciales, carreteras y suelo no utilizado en el valle de Katmandu, facilitando la actualizacion de mapas de uso del suelo para autoridades locales y urbanistas.
- Monitorizacion ambiental: la clasificacion de rios, bosques y terrenos agricolas permite detectar cambios en la cobertura vegetal, la expansion urbana o la degradacion de riberas, con aplicaciones en estudios de impacto ambiental.
- Gestion de desastres: la segmentacion de carreteras y zonas residenciales puede apoyar la evaluacion rapida de danos tras inundaciones o terremotos, al identificar areas habitadas y vias de acceso.
- Agricultura de precision: la clase agricola permite delimitar parcelas de cultivo y monitorizar su extension, util para estimar produccion o detectar abandono de tierras.
- Deteccion de asentamientos informales: la clase de suelo no utilizado, aunque con menor precision, puede ayudar a identificar zonas de crecimiento no planificado cuando se combina con otras fuentes de datos.
- Investigacion en teledeteccion: el modelo sirve como punto de partida para experimentos de transferencia de aprendizaje o ajuste fino en otras regiones, gracias a su tamano reducido y su licencia permisiva.

## Benchmarks y rendimiento

Los resultados de validacion publicados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| mIoU | 0,5646 |
| mF1 | 0,7113 |
| Exactitud global (OA) | 0,8078 |
| Coeficiente kappa | 0,6897 |

Rendimiento por clase (validacion):

| Clase | IoU | F1 |
|---|---|---|
| Residencial | 0,8325 | 0,9086 |
| Carretera | 0,4619 | 0,6320 |
| Rio | 0,5492 | 0,7090 |
| Bosque | 0,6079 | 0,7561 |
| Suelo no utilizado | 0,3667 | 0,5366 |
| Agricola | 0,5696 | 0,7258 |

No se han publicado comparaciones con otros modelos en el mismo conjunto de datos dentro de la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de solo 4,23 M de parametros, la inferencia sobre imagenes de 512x512 requiere menos de 1 GB de VRAM en precision FP32, y considerablemente menos en FP16 o con cuantizacion dinamica.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores funcionan sin problemas. Incluso es viable en CPU para inferencia por lotes pequenos.
- Compatibilidad con GPU de consumo: si, el modelo cabe en cualquier GPU consumer actual, incluidas las integradas de gama alta.
- Opciones de despliegue: al ser un modelo PyTorch estandar, puede servirse con TorchServe, ONNX Runtime, o integrarse en pipelines de procesamiento de imagenes con OpenCV y rasterio. No se menciona soporte nativo para vLLM, llama.cpp u Ollama, que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no se han publicado mediciones oficiales, pero dado el tamano del modelo, se espera una latencia inferior a 50 ms por imagen en una GPU moderna y un throughput de decenas de imagenes por segundo.

## Comparativa con modelos similares

No se dispone de resultados comparativos con otros modelos de segmentacion semantica (como U-Net, DeepLabV3 o SegFormer) sobre el mismo conjunto de datos del valle de Katmandu. La arquitectura SegNeXt, en su version base, ha demostrado en el articulo original un rendimiento competitivo frente a modelos como Swin Transformer y ConvNeXt en benchmarks genericos (ADE20K, Cityscapes), pero esos resultados no son directamente extrapolables a este conjunto de datos especifico. Se recomienda al usuario ejecutar sus propias evaluaciones comparativas si necesita una comparacion directa.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente con datos del valle de Katmandu; su generalizacion a otras regiones geograficas o a imagenes con diferentes caracteristicas espectrales o de resolucion puede ser limitada.
- La clase "suelo no utilizado" presenta un IoU notablemente bajo (0,3667), lo que indica dificultades para distinguirla de otras clases, probablemente por su heterogeneidad visual.
- La clase "carretera" tambien muestra un rendimiento moderado (IoU 0,4619), posiblemente debido a la variabilidad de anchos, materiales y sombras en entornos urbanos densos.
- El modelo fue entrenado con una resolucion de entrada fija de 512x512; el uso de resoluciones diferentes puede degradar el rendimiento sin un reajuste adecuado.
- No se proporcionan datos sobre el conjunto de entrenamiento (numero de imagenes, fuentes de los datos, balance de clases), lo que dificulta evaluar posibles sesgos.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar que los datos de entrenamiento originales no tengan restricciones adicionales de uso.
- El archivo best.pt incluye los pesos EMA, que pueden diferir ligeramente de los pesos finales del entrenamiento; es importante cargarlos correctamente segun las instrucciones del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pranilllllll/geonusaf-segNext-random-fold0
- Repositorio oficial de SegNeXt (GitHub): https://github.com/visual-attention-network/segnext
- Articulo SegNeXt (NeurIPS 2022): disponible en el repositorio oficial de GitHub

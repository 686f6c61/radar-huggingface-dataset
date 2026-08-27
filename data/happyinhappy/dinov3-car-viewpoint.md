# happyinhappy/dinov3-car-viewpoint

## Resumen

El modelo `happyinhappy/dinov3-car-viewpoint` es un adaptador LoRA de clasificación de imágenes desarrollado por Anastasiia Butova (happyinhappy) para estimar el punto de vista de un automóvil en fotografías. Concretamente, clasifica una imagen en ocho categorías discretas: frontal, dos tres cuartos delanteros (izquierdo y derecho), dos laterales, dos tres cuartos traseros y trasero. El modelo se construye sobre un backbone DINOv3 ViT-L/16 congelado (preentrenado con LVD-1689M) y añade un adaptador LoRA de aproximadamente 3 MB y una cabeza lineal de clasificación de 34 KB, de modo que todo el conjunto entrenable ocupa menos de 4 MB.

La relevancia de este modelo radica en su uso dentro de un pipeline automatizado de fotografía de concesionarios, donde la clasificación del punto de vista condiciona etapas posteriores como el ajuste de geometría de matrículas, la validación de máscaras de segmentación o la coherencia de iluminación en composiciones. El autor publica únicamente la model card, no los pesos del adaptador, bajo una licencia `card-only-weights-not-released`. El modelo está diseñado para funcionar con el pipeline de Hugging Face `image-classification` y se distribuye como un adaptador PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-L/16 (backbone congelado) + adaptador LoRA + cabeza lineal de clasificación |
| Parametros totales | Backbone: ~300 M (ViT-L/16); parte entrenable: < 4 MB (LoRA ~3 MB + cabeza ~34 KB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision, entrada de imagen 224×224) |
| Tipos de cuantizacion | No disponible (los pesos del adaptador no estan publicados) |
| Idiomas soportados | No aplica (modelo de vision, sin procesamiento de texto) |
| Licencia | card-only-weights-not-released (solo se publica la tarjeta, no los pesos) |
| Formato de pesos | No disponible (no publicados; si se publicaran, seria PEFT/safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en DINOv3, un vision transformer (ViT) de Meta AI entrenado con aprendizaje autosupervisado (SSL) sobre el dataset LVD-1689M. DINOv3 establece un nuevo estandar en modelos fundacionales de vision, superando a modelos con supervisión debil en tareas de clasificacion fina, segmentacion semantica y seguimiento de objetos. En este caso, el backbone ViT-L/16 se mantiene congelado y se entrena un adaptador LoRA junto con una cabeza lineal de 8 clases. La entrada es una imagen de 224×224 píxeles.

El entrenamiento se realizó con fotografías reales de anuncios de vehículos de acceso público, un conjunto de más de 7 millones de imágenes recopiladas para el modelo de identidad de coches del mismo autor. Las imágenes no son de estudio: incluyen fotos de móvil, concesionarios, luz solar baja, reflejos y otros coches en el encuadre. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, ya que se trata de una tarea de clasificacion supervisada clasica. La innovacion principal es el uso de LoRA para adaptar un backbone compartido con otro modelo del pipeline (identidad y dimensiones del vehiculo), lo que permite anadir la capacidad de clasificacion de punto de vista sin duplicar el coste de memoria.

## Capacidades

- Clasificacion de punto de vista de vehiculos en 8 clases discretas: `front`, `front_3q_a`, `side_a`, `rear_3q_a`, `rear`, `rear_3q_b`, `side_b`, `front_3q_b` (donde `_a` y `_b` distinguen izquierda y derecha).
- Distincion entre tres cuartos izquierdo y derecho, algo critico para tareas como la orientacion de matrículas o la visibilidad de tiradores de puerta.
- Inferencia sobre imagenes de 224×224 con un coste adicional minimo sobre el backbone base (adaptador LoRA de ~3 MB).
- Integracion con el ecosistema Hugging Face Transformers y PEFT para su uso en pipelines de clasificacion de imagenes.
- No soporta generacion de texto, tool calling, agentes, ni capacidades multimodales mas alla de la clasificacion de imagenes.

## Casos de uso

- Pipeline de fotografia de concesionarios: el modelo clasifica cada fotograma como un punto de vista concreto, lo que permite al sistema saber qué angulo se ha capturado y qué falta en el listado.
- Ajuste de geometria de matrículas: en vistas de tres cuartos, la matrícula aparece como un trapezoide; conocer el punto de vista permite ajustar los vertices antes de reemplazar la placa digitalmente.
- Validacion de mascaras de segmentacion: sabiendo el punto de vista, el sistema puede rechazar mascaras de ruedas, cristales o espejos que no coincidan con la posicion esperada para ese angulo.
- Composicion de escenas coherentes: al generar una imagen compuesta, el modelo evita colocar un coche en una vista trasera tres cuartos dentro de una escena iluminada para una vista frontal, evitando el error mas evidente en composites.
- Control de completitud de listados: el clasificador informa de qué angulos se han fotografiado realmente, permitiendo al sistema solicitar las tomas faltantes.
- Clasificacion previa en sistemas de inspeccion visual: antes de aplicar modelos de segmentacion o deteccion de daños, el punto de vista condiciona los priors espaciales y reduce falsos positivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, precision, recall ni comparaciones con otros clasificadores de punto de vista. El autor menciona que el modelo se ejecuta en un pipeline de produccion, pero no proporciona datos cuantitativos de rendimiento.

## Requisitos de hardware

- El backbone DINOv3 ViT-L/16 tiene aproximadamente 300 millones de parametros. En FP16, el modelo base ocupa alrededor de 600 MB de VRAM, mas el adaptador LoRA y la cabeza (menos de 4 MB adicionales).
- Para inferencia en tiempo real, se recomienda una GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650 Ti, RTX 3050 o superior). Para lotes grandes o despliegue concurrente, una RTX 3060/4070 o una A10/A100 serian adecuadas.
- El modelo cabe en GPUs de consumo (RTX 3060, RTX 4090, etc.) sin problemas.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria `transformers` y `peft` de Hugging Face. Tambien es compatible con pipelines de `image-classification`. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia estimada para una sola imagen de 224×224 en una GPU moderna (RTX 3060) seria del orden de 10-30 ms, dependiendo de la implementacion y del batch size. No se dispone de datos oficiales de throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (clasificacion de punto de vista de vehiculos con adaptador LoRA sobre DINOv3). El modelo base DINOv3 ViT-L/16 sin adaptador no realiza esta tarea especifica, por lo que no es una comparativa directa. Se podria comparar con clasificadores de angulo basados en redes convolucionales clasicas (por ejemplo, ResNet fine-tuned), pero no se dispone de datos de rendimiento de este modelo para establecer una comparacion cuantitativa. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Los pesos del adaptador no estan publicados. La licencia `card-only-weights-not-released` impide descargar o utilizar el modelo en produccion; solo se ofrece la documentacion.
- El modelo clasifica en 8 categorias discretas, no estima un angulo continuo. Una imagen en el limite entre dos clases puede caer en cualquiera de ellas, y las etapas posteriores deben tratar la prediccion como un prior, no como un hecho.
- No maneja interiores de vehiculos (cabina, maletero, salpicadero); esas imagenes deben ser rutadas por otro clasificador.
- La oclusion severa (coche parcialmente tapado o recortado por debajo de las ruedas) degrada la precision de la clasificacion.
- El entrenamiento se realizo con fotografias de anuncios de coches de acceso publico, lo que puede introducir sesgos hacia ciertos tipos de vehiculos, condiciones de iluminacion o entornos (concesionarios, aparcamientos). La generalizacion a otros dominios (por ejemplo, imagenes de dashcam o fotografia artistica) no esta garantizada.
- No es un modelo de estimacion de pose: no devuelve grados ni angulos, solo una etiqueta de clase.
- Al ser un adaptador sobre un backbone congelado, el rendimiento depende de la calidad del backbone DINOv3; si el backbone falla en imagenes muy atipicas, el adaptador no puede compensarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/happyinhappy/dinov3-car-viewpoint
- Repositorio oficial de DINOv3 (Meta AI): https://github.com/facebookresearch/dinov3
- Pagina de investigacion de DINOv3: https://ai.meta.com/research/dinov3/
- Modelo base en Hugging Face: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Demo de DINOv3 (multi-modelo): https://huggingface.co/spaces/sshuair/dinov3-demo-multi
- Contacto de la autora: https://happyin.work/mashinki/ · https://github.com/AnastasiyaW · https://t.me/happy_in_happy

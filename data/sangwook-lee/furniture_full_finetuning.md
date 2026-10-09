# sangwook-lee/furniture_full_finetuning

# Furniture_full_finetuning (DETR ResNet-50)

## Resumen

Furniture_full_finetuning es un modelo de deteccion de objetos publicado por el usuario sangwook-lee en HuggingFace, obtenido mediante ajuste fino (fine-tuning) completo de facebook/detr-resnet-50. Se trata, por tanto, de un detector basado en la arquitectura DETR (DEtection TRansformer), que combina un backbone convolucional ResNet-50 con un codificador-decodificador transformer y un mecanismo de asignacion bipartita entre predicciones y anotaciones reales, lo que elimina la necesidad de supresion no maxima (NMS) y de anclas (anchors). El modelo cuenta con 41.608.649 parametros y esta etiquetado con el pipeline `object-detection`.

El problema que aborda es la deteccion de mobiliario (furniture) en imagenes. Segun el nombre del repositorio y la propia model card, el ajuste se ha realizado sobre un dataset no especificado, y la model card generada automaticamente por el `Trainer` no documenta ni la composicion de los datos, ni las clases finales, ni metricas de evaluacion. Esto limita seriamente la trazabilidad del modelo: se sabe que es un DETR ResNet-50 reentrenado, pero no que categorias exactas detecta ni con que calidad.

Su relevancia actual es acotada: la arquitectura DETR original (2020) ha sido superada en eficiencia y precision por variantes mas recientes (DETR-DC5, Deformable DETR, DINO, RT-DETR) y por la familia YOLO en el terreno de tiempo real. Aun asi, el modelo es util como pieza de partida para tareas de deteccion de muebles en catalogos, inventario o robotica domestica, siempre que se valide su comportamiento real antes de llevarlo a produccion. La licencia Apache-2.0 facilita su uso comercial, aunque el estado embrionario de la documentacion obliga a realizar una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR (DEtection TRansformer): backbone convolucional ResNet-50 + codificador-decodificador transformer con object queries |
| Parametros totales | 41.608.649 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos, sin ventana de contexto textual) |
| Tipos de cuantizacion | No disponible. El repositorio publica pesos en safetensors; no se declaran variantes FP16, INT8 ni GGUF |
| Idiomas soportados | no aplica / no disponible. No se declaran idiomas; las clases detectadas dependen del dataset de ajuste, no documentado |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | facebook/detr-resnet-50 |
| Fecha de creacion | 2026-10-09 |
| Ultima actualizacion | 2026-10-09 |
| Tamano del repositorio | 4,8 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es DETR tal y como se describe en el articulo original de Facebook AI Research: una red ResNet-50 actua como extractor de caracteristicas y produce un mapa de activaciones que, tras una proyeccion 1x1 y el aplanado espacial, se suma a codificaciones posicionales y se introduce en un codificador transformer de 6 capas. El decodificador, tambien de 6 capas, emplea un conjunto fijo de object queries aprendidas que, mediante atencion cruzada sobre la salida del codificador, generan predicciones de cajas (coordenadas normalizadas) y logits de clase de forma paralela. El entrenamiento original de DETR usa una perdida de asignacion bipartita hungara que combina coste de clasificacion, L1 y GIoU, evitando anclas y NMS.

En cuanto al ajuste fino de esta version concreta, la model card generada automaticamente es la unica fuente disponible y no aporta informacion sobre el dataset. Los hiperparametros declarados son: learning rate 1e-05, `train_batch_size` 8, `eval_batch_size` 8, semilla 42, optimizador AdamW (variante fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal, 100 epocas y entrenamiento con AMP nativo. No se especifica el numero de imagenes, el numero de clases, si hubo aumento de datos, congelacion del backbone ni si se aplico alguna tecnica adicional como decodificacion especulativa (no aplicable aqui) o entrenamiento con resolución variable. Las versiones de framework usadas fueron Transformers 4.57.6, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.22.2.

## Capacidades

- Deteccion de objetos en imagenes: el modelo devuelve un conjunto de cajas delimitadoras con sus correspondientes etiquetas de clase y puntuaciones de confianza, en una sola pasada hacia delante.
- Deteccion sin NMS: al igual que DETR original, no requiere supresion no maxima ni generacion de propuestas, lo que simplifica el postprocesado.
- Dominio especializado en mobiliario: el ajuste fino esta orientado a la categoria "furniture", segun el propio nombre del modelo. No se documenta el listado concreto de clases.
- Procesamiento de imagen unica: la inferencia se realiza sobre una imagen, sin soporte nativo de video declarado.
- Soporte de tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision, audio): unicamente vision por computador para deteccion; no hay modo de razonamiento ni procesamiento de audio.

## Casos de uso

- Etiquetado automatico de catalogos de muebles: integrado en el pipeline de ingesta de un e-commerce, el modelo puede detectar y localizar cada pieza de mobiliario en las fotografias de producto, generando cajas que alimentan un clasificador o un sistema de recorte para imagenes de ficha. Es adecuado porque su salida directa de cajas evita postprocesado complejo.
- Inventario visual en almacenes y tiendas: sobre fotografias tomadas por operarios con movil o camara fija, el detector permite localizar estanterias, sillas, mesas o armarios y estimar su presencia por zona, sirviendo como base para recuentos asistidos.
- Robotica domestica y de asistencia: un brazo manipulador o un robot de servicio puede usar el modelo para localizar muebles antes de planificar una trayectoria o una tarea de manipulacion, siempre que se valide la precision sobre el entorno real de despliegue.
- Realidad aumentada para decoracion: en aplicaciones de colocacion virtual de muebles, el detector identifica que elementos ya existen en la escena y donde estan, para evitar solapamientos o sugerir sustituciones coherentes.
- Anotacion asistida de datasets: el modelo puede generar propuestas de cajas sobre imagenes de interiores que despues un anotador humano corrige, reduciendo el coste de construir un corpus etiquetado propio de mayor calidad.
- Analisis de imagenes inmobiliarias: extraer automaticamente el mobiliario presente en anuncios de vivienda permite filtrar inmuebles por amueblado, tipo de estancia o equipamiento, y enriquecer la ficha del anuncio con metadatos estructurados.
- Modulo de preprocesado para pipelines multimodales: las cajas y etiquetas pueden alimentar un modelo de vision-lenguaje que genere descripciones de la estancia, actuando el detector como etapa de grounding espacial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card declara el nombre del modelo con una lista de resultados vacia, y la seccion "Training results" del documento esta en blanco. No se proporcionan valores de mAP, AP50, AP75, AP small/medium/large ni metricas por clase, ni tampoco comparaciones con el modelo base facebook/detr-resnet-50.

En consecuencia, cualquier cifra de rendimiento que se quiera usar para decidir el despliegue debe obtenerse mediante una evaluacion propia sobre un conjunto de validacion representativo del dominio objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 41.608.649 parametros, los pesos ocupan aproximadamente 166 MB en FP32 (unos 83 MB en FP16). Sumando activaciones, la inferencia a resolucion tipica de DETR (lado corto 800 px) cabe holgadamente en menos de 2 GB de VRAM con batch 1. Se trata de una estimacion derivada del recuento de parametros, no de una medicion publicada.
- GPU recomendadas: cualquier GPU moderna sirve para inferencia. Para entrenamiento o ajuste fino completo, se recomienda al menos una GPU con 16-24 GB (RTX 4090, A5000, L4, A10G) y, para lotes grandes o resoluciones altas, A100 o H100.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo actual (RTX 3060 12 GB, RTX 4060, RTX 4090) e incluso en GPUs integradas con suficiente memoria compartida. La inferencia en CPU es viable, con latencias mayores.
- Opciones de despliegue: pipeline `object-detection` de Transformers sobre PyTorch; exportacion a ONNX Runtime o TensorRT para aceleracion; TorchScript; y despliegue gestionado mediante HuggingFace Inference Endpoints, dado que el repositorio esta marcado como `endpoints_compatible`. No se declara soporte para llama.cpp, Ollama, vLLM ni TGI, que no estan orientados a modelos de deteccion.
- Latencia y throughput: no disponibles. La model card no publica mediciones de latencia por imagen ni imagenes por segundo en ninguna GPU.
- Almacenamiento: el repositorio ocupa 4,8 GB, muy por encima de lo que exigen los pesos finales (166 MB), lo que sugiere la presencia de checkpoints intermedios de las 100 epocas de entrenamiento o de estados del optimizador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sangwook-lee/furniture_full_finetuning | 41,6 M | no aplica | Apache-2.0 | HuggingFace | Ajuste fino especifico de mobiliario, sin metricas publicadas |
| facebook/detr-resnet-50 | 41,6 M | no aplica | Apache-2.0 | HuggingFace | Modelo base, entrenado en COCO (80 clases); precision de referencia publicada en el paper original |
| DETR-DC5-R50 | 41,6 M | no aplica | Apache-2.0 (referencia) | Repositorio oficial de Facebook Research | Variante con C5 dilatado, mejor rendimiento en objetos pequenos a costa de mas computo |
| Faster R-CNN ResNet-50 FPN | ~42 M (valor publico aproximado) | no aplica | BSD-3 / Apache-2.0 segun implementacion | torchvision, Detectron2 | Detector de dos etapas con anclas y NMS; alternativa madura y ampliamente desplegada |
| YOLOv8n / YOLO11n | ~3 M (valor publico aproximado) | no aplica | AGPL-3.0 (Ultralytics) | Ultralytics, HuggingFace | Mucho mas ligero y rapido en tiempo real; licencia copyleft que condiciona el uso comercial |

Nota: los valores de parametros de los modelos comparativos son cifras publicas de referencia y no han sido verificados en el contexto de esta ficha. La comparativa de rendimiento no puede completarse porque el modelo objeto de la ficha no publica ninguna metrica.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card es la generada automaticamente por el `Trainer` y deja como "More information needed" la descripcion, los usos previstos, las limitaciones y los datos de entrenamiento. No se conocen las clases que detecta el modelo.
- Sin metricas de evaluacion: no hay mAP ni ninguna otra metrica publicada, ni sobre el conjunto de ajuste ni sobre validacion. Es imposible afirmar que el modelo sea mejor o peor que su base sin evaluarlo.
- Dataset de ajuste desconocido: no se especifica origen, tamano, licencia ni composicion de las imagenes de entrenamiento. Esto impide evaluar sesgos de dominio, cobertura de clases y posibles problemas de derechos sobre los datos.
- Riesgo de sobreajuste: 100 epocas con learning rate 1e-05 sobre un batch de 8, y sin datos de regularizacion ni de conjunto de validacion reportado, es un regimen que puede producir sobreajuste si el dataset es pequeno.
- Sesgos potenciales: al no documentarse el dataset, no puede descartarse un sesgo hacia tipos de mobiliario, estilos decorativos, paises o condiciones de iluminacion concretos presentes en las imagenes de entrenamiento.
- Riesgo de alucinacion de detecciones: como cualquier detector, puede producir cajas con confianza alta sobre objetos inexistentes o solapadas entre si; se recomienda fijar umbrales de confianza y validar cualitativamente.
- Limitaciones de resolucion: DETR es sensible al tamano de los objetos; los objetos muy pequenos o muy cercanos entre si suelen detectarse peor que en arquitecturas con FPN o atencion deformable.
- Sin soporte multilingue ni de texto: el modelo no procesa lenguaje, por lo que las etiquetas de clase seran las del dataset de ajuste y no pueden adaptarse a otros idiomas sin reentrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias sobre el origen de los datos de entrenamiento ni sobre los derechos de las imagenes utilizadas, lo que traslada al usuario el riesgo legal derivado del dataset.
- Caveat de produccion: el repositorio ocupa 4,8 GB y contiene presumiblemente multiples checkpoints; conviene descargar solo los ficheros safetensors finales y verificar la configuracion de `id2label` antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sangwook-lee/furniture_full_finetuning
- Modelo base: https://huggingface.co/facebook/detr-resnet-50
- Paper de DETR (End-to-End Object Detection with Transformers): https://arxiv.org/abs/2005.12872
- Repositorio oficial de DETR (Facebook Research): https://github.com/facebookresearch/detr
- Documentacion de DETR en Transformers: https://huggingface.co/docs/transformers/model_doc/detr

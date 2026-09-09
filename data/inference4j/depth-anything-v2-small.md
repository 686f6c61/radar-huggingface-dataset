# inference4j/depth-anything-v2-small

## Resumen

Depth Anything V2 Small es un modelo de estimacion de profundidad monocular que predice un mapa de profundidad relativa inversa a partir de una sola imagen RGB. Fue desarrollado por el equipo Depth Anything y presentado en NeurIPS 2024 como una version mas capaz que Depth Anything V1, con mejor calidad en detalles finos y mayor robustez. La version small utiliza un backbone DINOv2 ViT-Small y un decodificador DPT, con aproximadamente 25 millones de parametros.

Este repositorio concreto (`inference4j/depth-anything-v2-small`) es una exportacion ONNX del modelo original de HuggingFace, preparada por la comunidad onnx-community y espejada para su uso con inference4j, una libreria de inferencia en Java basada en ONNX Runtime. La relevancia del modelo radica en su tamanio reducido (0.1 GB), su licencia Apache 2.0 y su disponibilidad en formato ONNX, lo que permite su integracion en aplicaciones Java, en dispositivos edge o en entornos de produccion sin dependencias de servicios externos. El modelo no procesa texto, no soporta tool calling y su salida es un mapa de profundidad relativa, no metrica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-Small backbone + decodificador DPT |
| Parametros totales | Aproximadamente 25 millones |
| Longitud de contexto | No aplica (modelo de vision, sin entrada de texto) |
| Tipos de cuantizacion | No disponible (la exportacion ONNX esta en float32) |
| Idiomas soportados | No disponible (modelo de vision, no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (exportacion del modelo PyTorch original) |
| Tarea | Estimacion de profundidad monocular |
| Entrada | `[1, 3, height, width]`, NCHW float32, RGB |
| Normalizacion de entrada | ImageNet: media `[0.485, 0.456, 0.406]`, desviacion `[0.229, 0.224, 0.225]` |
| Salida | `[1, height, width]`, rango 3, sin dimension de canal, nombre `predicted_depth` |
| Tamano del repositorio | 0.1 GB |

## Arquitectura y entrenamiento

Depth Anything V2 Small usa un transformer de vision DINOv2 ViT-Small como backbone y un decodificador DPT (Dense Prediction Transformer). El modelo se presenta como una alternativa eficiente frente a enfoques basados en difusion para estimacion de profundidad, con una velocidad de inferencia superior, menos parametros y mayor precision, segun el paper original (NeurIPS 2024). El preprocesamiento requiere redimensionar la imagen para que el lado mayor sea 518, redondear ambas dimensiones al multiplo de 14 (tamano del patch de ViT) y normalizar con los parametros de ImageNet.

La salida del modelo es un mapa de profundidad inversa relativa, donde los valores mayores corresponden a objetos mas cercanos a la camara. La escala es propia de cada imagen y no es metrica; para renderizar un mapa de profundidad visual, se recomienda normalizar los valores al rango `[0, 1]` usando el minimo y el maximo de cada imagen y despues redimensionar al tamano original. El entrenamiento del modelo original no se detalla en la informacion disponible de esta ficha, pero el paper menciona el uso de datos sinteticos etiquetados y tecnicas de auto-supervision.

## Capacidades

- Estimacion de profundidad monocular a partir de una sola imagen RGB.
- Prediccion de profundidad relativa inversa: los valores son solo comparables dentro de la misma imagen.
- Salida de mapa de profundidad en formato `[1, height, width]`, sin canal extra.
- Preprocesamiento especifico definido en la documentacion del modelo: resize a 518, redondeo a multiplos de 14, normalizacion ImageNet.
- No genera texto: es un modelo de vision puro.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No integra capacidades de vision-lenguaje, audio ni multimodalidad.
- El formato ONNX permite ejecucion en CPU o GPU mediante ONNX Runtime y su integracion en Java con inference4j.

## Casos de uso

- Navegacion robotica: el modelo puede integrarse en robots moviles para estimar la proximidad relativa de obstaculos a partir de una camara RGB, permitiendo decisiones de evitacion en tiempo real.
- Realidad aumentada: el mapa de profundidad permite calcular oclusiones y posicionar objetos virtuales con una composicion mas realista sobre la escena capturada.
- Conduccion autonoma: sirve como complemento de sensores LiDAR o radar, proporcionando una senal de profundidad monocular barata para la deteccion de obstaculos proximos.
- Fotografia computacional: puede generar efectos de bokeh, separacion de fondo o reenfoque en aplicaciones de camara movil, utilizando el mapa de profundidad para desenfocar zonas distantes.
- Reconstruccion 3D de interiores: a partir de una secuencia de imagenes, el modelo puede aportar mapas de profundidad para generar nubes de puntos o mallas simples de habitaciones.
- Analisis de imagenes aereas o satelitales: permite obtener una estimacion de alturas relativas de edificios o estructuras en imagenes de alta resolucion, util para evaluaciones preliminares de danos o inventarios urbanos.
- Integracion en aplicaciones Java empresariales: gracias a inference4j, el modelo puede usarse en servicios backend que necesiten analisis de profundidad sin depender de APIs externas ni de infraestructura de GPU dedicada, dado su reducido tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en float32 para una entrada de 518x518, considerando que los pesos ocupan aproximadamente 100 MB y que el coste de activaciones es bajo.
- GPU recomendadas: cualquier GPU actual con mas de 1 GB de VRAM, como una RTX 3060, RTX 4060, A10 o similar. El modelo tambien puede ejecutarse en CPU mediante ONNX Runtime, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: si, cabe sin problemas en tarjetas graficas de consumo.
- Opciones de despliegue: ONNX Runtime, inference4j (Java), llama.cpp no aplica por ser un modelo de vision, y otros entornos ONNX como TGI no estan estandarizados para esta tarea.
- Latencia y throughput: no se dispone de mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se incluyen datos comparativos con otras variantes o modelos equivalentes. Cabe destacar que este modelo pertenece a la familia Depth Anything V2, que incluye versiones Base y Large, pero no se dispone de sus parametros ni rendimientos en la documentacion de esta ficha.

## Limitaciones y advertencias

- La salida es profundidad relativa inversa, no metrica: para obtener distancias absolutas es necesario calibrar el modelo con una referencia adicional.
- Los valores de profundidad solo son comparables dentro de una misma imagen; no deben compararse entre imagenes distintas.
- El preprocesamiento es critico: cualquier cambio en el redimensionado, el redondeo a multiplos de 14 o la normalizacion puede degradar los resultados.
- El modelo es exclusivamente de vision: no procesa texto, no genera captions, ni ejecuta funciones, lo que limita su uso en pipelines de IA multimodal.
- Como todo modelo de estimacion de profundidad, puede fallar en superficies reflectantes, texturas repetidas, oclusiones complejas o condiciones de poca iluminacion.
- La licencia Apache 2.0 permite uso comercial, pero es necesario conservar los avisos de licencia y las atribuciones correspondientes.
- No existen garantias de exactitud para aplicaciones criticas de seguridad, como control de vehiculos autonomos o cirugia asistida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/inference4j/depth-anything-v2-small
- Modelo original en HuggingFace: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- Repositorio oficial de Depth Anything V2: https://github.com/DepthAnything/Depth-Anything-V2
- Paper original: https://arxiv.org/abs/2406.09414
- Libreria inference4j: https://github.com/inference4j/inference4j
- Documentacion de inference4j: https://inference4j.github.io/inference4j/

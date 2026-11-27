# mvdelibas/ndsm-building-vegetation-seg-yolo11s

## Resumen

El modelo `ndsm-building-vegetation-seg-yolo11s`, publicado por el usuario mvdelibas, es un modelo de segmentacion de instancias basado en la arquitectura Ultralytics YOLO11 (variante `yolo11s-seg`) afinado para operar sobre rasteres nDSM (normalised Digital Surface Model), es decir, mapas de altura sobre el terreno derivados de LiDAR aerotransportado o fotogrametria. Su tarea es identificar y segmentar tres clases: edificios (`bina`), estructuras asimilables a puentes (`kopru_yapi`) y vegetacion alta (`yuksek_bitki`). Resuelve el problema de extraer automaticamente la huella de edificios y masas de vegetacion a partir de datos de elevacion, un paso habitual en flujos de teledeteccion y cartografia.

El modelo se ha entrenado sobre teselas nDSM sinteticas generadas para las 81 provincias de Turquia a partir de huellas de OpenStreetMap y modelos digitales del terreno (Copernicus DEM GLO-30). Es relevante en el contexto actual de automatizacion de inventarios geoespaciales, donde los flujos basados en LiDAR requieren segmentadores ligeros que puedan ejecutarse a escala sobre grandes extensiones de terreno.

Se trata de un modelo pequeno (variante "s" de YOLO11), con licencia AGPL-3.0 heredada de Ultralytics, publicado originalmente en noviembre de 2026 y con cero descargas en el momento de redactar esta ficha. La model card advierte explicitamente de que el rendimiento en datos reales sera inferior al de validacion y que la clase de puentes es debil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO11 (yolo11s-seg), segmentacion de instancias |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 512 px en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr (solo etiquetas y documentacion; el modelo no procesa texto) |
| Licencia | AGPL-3.0 (con obligaciones adicionales de atribucion OSM ODbL sobre los datos de entrenamiento) |
| Formato de pesos | `.pt` (PyTorch, formato Ultralytics) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de los pesos preentrenados oficiales de `yolo11s-seg` de Ultralytics, una red de segmentacion de instancias de tipo CNN con cabeza de mascaras. La entrada durante el entrenamiento fue de 512x512 px. El ajuste se realizo sobre una GPU H200 durante 52 epocas, con batch de 16, y un coste total declarado de 0,7 GPU-horas; la mejor epoca fue la 37. No se especifica el numero de imagenes del dataset ni el volumen total de tokens o muestras.

Los datos de entrenamiento son teselas nDSM sinteticas derivadas de huellas de OpenStreetMap (licencia ODbL 1.0) y del modelo digital de elevacion Copernicus DEM GLO-30, generadas para las 81 provincias de Turquia. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion (no aplicables en un modelo de vision). Tampoco se detallan innovaciones tecnicas adicionales mas alla del propio pipeline de datos sinteticos.

## Capacidades

- Segmentacion de instancias sobre rasteres nDSM de una sola banda (altura sobre el terreno).
- Deteccion y mascara de edificios (`bina`), con AP50 de 96,7 % en validacion.
- Deteccion y mascara de vegetacion alta (`yuksek_bitki`), con AP50 de 98,2 % en validacion.
- Deteccion de estructuras tipo puente (`kopru_yapi`), con AP50 de 47,6 % en validacion (clase debil, segun el autor).
- Salida en formato Ultralytics (`boxes`, `masks`), integrable en pipelines Python.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente perceptivo).
- No procesa texto ni audio; las etiquetas de idioma `en` y `tr` se refieren a la documentacion y a los nombres de clase internos (en turco).

## Casos de uso

- Inventario automatizado de edificios a partir de vuelos LiDAR: el modelo permite generar mascaras de huella edificada sobre mosaicos nDSM y agregarlas en un SIG para actualizar catastros o bases de datos municipales.
- Deteccion de vegetacion alta en corredores de infraestructura: aplicable a la revision de masas arboreas proximas a lineas electricas o vias, donde la altura sobre el terreno es el dato critico.
- Control de cambios urbanos: comparando segmentaciones nDSM de dos fechas se pueden identificar nuevas construcciones o perdida de arbolado, con la cautela de validar contra datos reales.
- Generacion de capas auxiliares para modelado hidrologico o de riesgo: la mascara de edificios y vegetacion alta sirve como entrada para modelos de escorrentia o de exposicion a incendios.
- Preetiquetado para anotacion humana: el modelo puede acelerar la creacion de datasets reales de segmentacion nDSM, revisando y corrigiendo las mascaras generadas.
- Prototipado rapido en teledeteccion: al ser un modelo pequeno y de inferencia ligera, es util para validar pipelines de datos sinteticos antes de invertir en modelos mayores o en datos reales etiquetados.
- Filtrado de ruido en nDSM: las mascaras de edificios y vegetacion permiten separar objetos sobre el terreno de artefactos o del propio terreno en estudios de visibilidad o de planeamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de validacion del propio dataset sintetico:

| Metrica | Valor |
|---|---|
| Box mAP50 | 81,9 % |
| Box mAP50-95 | 65,1 % |
| Mask mAP50 | 74,0 % |
| Mask mAP50-95 | 46,0 % |
| Precision | 86,8 % |
| Recall | 73,7 % |
| F1 | 79,5 % |
| Mask precision | 82,1 % |
| Mask recall | 69,5 % |
| Mejor epoca | 37 |

AP50 por clase: `bina` 96,7 %, `kopru_yapi` 47,6 %, `yuksek_bitki` 98,2 %.

No se han publicado comparaciones con otros modelos en la informacion disponible. El autor advierte que estas metricas corresponden a la validacion del dataset sintetico y que el rendimiento en datos reales de otros sensores, regiones o estilos sera inferior.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de la variante `yolo11s-seg` (modelo pequeno de Ultralytics), es esperable que quepa en GPUs consumer con 4-8 GB de VRAM, aunque el dato no esta confirmado en la model card.
- GPU de entrenamiento declarada: 1x NVIDIA H200.
- GPU recomendadas para produccion: no especificadas; cualquier GPU con soporte CUDA suficiente para YOLO11s-seg deberia servir.
- Cabe en GPU consumer: muy probablemente si (gama RTX 30/40 y equivalentes), aunque no se aporta medicion.
- Opciones de despliegue: Ultralytics (Python), exportacion a ONNX/TensorRT via Ultralytics; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparaciones con otros modelos en la informacion disponible. Como referencia estructural, el modelo es un fine-tuning de `yolo11s-seg` de Ultralytics, por lo que comparte arquitectura, tamano y requisitos con la familia YOLO11-seg oficial; sin embargo, no se aportan datos de rendimiento frente a esas variantes ni frente a otros segmentadores de teledeteccion.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| ndsm-building-vegetation-seg-yolo11s | no disponible (base yolo11s-seg) | imagen 512 px (entrenamiento) | AGPL-3.0 | Hugging Face |
| YOLO11s-seg oficial (Ultralytics) | no disponible en esta ficha | no disponible | AGPL-3.0 | Ultralytics |
| Otros segmentadores nDSM | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor advierte de que el rendimiento en datos reales (otros sensores, regiones o estilos de imagen) sera inferior al de validacion; es imprescindible validar sobre una muestra propia antes de usarlo en produccion.
- La clase de puentes (`kopru_yapi`) es debil: AP50 de 47,6 %, muy por debajo de edificios y vegetacion.
- Entrenado exclusivamente con datos sinteticos de Turquia; la generalizacion a otras geografias, tipologias constructivas o sensores no esta demostrada.
- Los nombres de clase internos estan en turco (`bina`, `kopru_yapi`, `yuksek_bitki`), lo que puede requerir mapeo en pipelines.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el codigo que lo integre en servicios en red; revisar antes de uso comercial propietario.
- Obligacion adicional de atribucion a OpenStreetMap (ODbL 1.0) y Copernicus DEM GLO-30 al usar o redistribuir el modelo.
- Riesgo de alucinacion entendido como falsos positivos/negativos en la segmentacion: no se documentan tasas especificas fuera del split de validacion.
- Sin descargas ni validacion por parte de la comunidad en el momento de redactar esta ficha; tratar como modelo experimental.
- No se documentan sesgos demograficos (no aplica) pero si un posible sesgo geografico derivado del dataset sintetico turco.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/ndsm-building-vegetation-seg-yolo11s
- Dataset de entrenamiento: https://huggingface.co/datasets/mvdelibas/tr-81-il-sentetik-ndsm
- Ultralytics YOLO11: https://github.com/ultralytics/ultralytics
- OpenStreetMap (ODbL 1.0): https://www.openstreetmap.org/
- Copernicus DEM GLO-30: https://dataspace.copernicus.eu/

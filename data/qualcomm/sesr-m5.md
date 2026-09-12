# qualcomm/SESR-M5

## Resumen

SESR-M5 es un modelo de superresolucion de imagenes (image-to-image) desarrollado por Qualcomm y distribuido a traves de Qualcomm AI Hub. Su funcion es el reescalado 3x de imagenes de baja resolucion directamente en el dispositivo, sin necesidad de enviar los datos a la nube. Se trata de un modelo convolutional muy compacto: 343 000 parametros, 1,32 MB en precision float y 395 KB en su variante cuantizada w8a8.

El modelo se basa en la arquitectura SESR (Super-Efficient Super Resolution), descrita en el articulo arXiv:2103.09404, y su implementacion de referencia procede del repositorio aimet-model-zoo de Qualcomm. La variante M5 emplea cinco bloques lineales colapsables, una tecnica que permite entrenar una red mas profunda y plegar sus bloques en inferencia para reducir el coste computacional sin cambiar la salida.

Su relevancia actual radica en el despliegue en el borde: Qualcomm publica pesos ya exportados a ONNX, QNN_DLC y TFLite, en versiones float y cuantizadas w8a8, con tiempos de inferencia medidos en el NPU de distintas plataformas Snapdragon y Dragonwing. Los tiempos registrados van de 0,372 ms a 7,379 ms por imagen de 128x128 px segun chipset y precision, lo que lo hace apto para procesamiento en tiempo real en movil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de superresolucion con bloques lineales colapsables (SESR), variante de 5 bloques |
| Parametros totales | 343 000 (343K) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 128x128 px) |
| Tipos de cuantizacion | float y w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | no aplica (modelo de imagen, no procesa texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | PyTorch (checkpoint), ONNX, QNN_DLC y TFLite |
| Tarea | superresolucion de imagen (image-to-image), factor de escala 3x |
| Resolucion de entrada | 128x128 px |
| Checkpoint | sesr_m5_3x_checkpoint |
| Tamano del modelo | 1,32 MB (float) / 395 KB (w8a8) |
| Tamano del repositorio | 0,2 GB |
| Runtime y SDK | QAIRT 2.45; ONNX Runtime 1.27.1 |
| Descargas en HuggingFace | 118 |

## Arquitectura y entrenamiento

SESR-M5 sigue el diseno SESR presentado en arXiv:2103.09404. La idea central son los bloques lineales colapsables: durante el entrenamiento la red apila varios bloques lineales, pero en inferencia esos bloques se pueden plegar (colapsar) en un unico bloque equivalente, de modo que el coste de computo en produccion es el de una red mucho mas superficial manteniendo la calidad aprendida. La variante M5 usa cinco bloques de este tipo y realiza un reescalado 3x.

El modelo se ha exportado y optimizado con Qualcomm AI Hub Workbench para ejecutarse en el NPU de plataformas Snapdragon y Dragonwing, en formatos ONNX, QNN_DLC y TFLite. No se especifica en la informacion disponible el volumen de tokens ni de imagenes de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste fino con tecnicas de alineacion tipo RLHF o DPO (no aplicables en este dominio). Tampoco se detalla el proceso de cuantizacion w8a8 mas alla de su disponibilidad como asset preexportado.

## Capacidades

- Superresolucion de imagenes con factor de escala 3x a partir de entradas de 128x128 px.
- Inferencia en el dispositivo (on-device) en el NPU de chipsets Snapdragon y Dragonwing, sin dependencia de servidores externos.
- Ejecucion en dos precisiones: float y w8a8, esta ultima con un modelo de 395 KB y latencias mas bajas.
- Despliegue multiplataforma mediante exportaciones ONNX, QNN_DLC y TFLite, con una libreria Python (Qualcomm AI Hub Models) para recompilar con pesos propios, formas de entrada personalizadas y configuracion de dispositivo objetivo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual de imagen a imagen.
- No se documentan capacidades de vision adicionales (deteccion, segmentacion, descripcion) ni modos especiales tipo thinking.

## Casos de uso

- Mejora de imagenes en la galeria del movil: el modelo puede reescalar 3x fotografias de baja resolucion en el propio dispositivo, con latencias por debajo de 1 ms en chipsets de gama alta (Snapdragon 8 Elite Gen 5) y sin coste de red.
- Generacion de miniaturas y vistas previas: al ser un modelo de 395 KB en w8a8, puede integrarse en el pipeline de visualizacion para producir miniaturas nitidas a partir de recortes reducidos.
- Zoom digital en aplicaciones de camara: el factor 3x permite reconstruir detalle en recortes ampliados en tiempo real, aprovechando el NPU y manteniendo la bateria.
- Ahorro de ancho de banda en servicios de contenido: la aplicacion puede transmitir la imagen a resolucion reducida y reescalarla localmente en el dispositivo, reduciendo el trafico de datos.
- Fondos de pantalla y contenido de alta densidad de pixeles: util para ajustar imagenes a paneles con DPI elevado en telefonos, tablets y portatiles con Snapdragon.
- Preprocesado para otros modelos de vision: como etapa previa en pipelines de deteccion o reconocimiento que se benefician de entradas de mayor resolucion.
- Aplicaciones embebidas e industriales: plataformas Dragonwing (QCS6490, QCS8550, IQ-8275, IQ-9075) pueden ejecutar la version w8a8 con tiempos de 0,8-3,7 ms por fotograma, habilitando realce de imagen en camaras y dispositivos de borde.
- Realce de video fotograma a fotograma: los tiempos de inferencia sub-milisecond en las gamas altas dejan margen suficiente para procesar secuencias a tasas habituales de video.

## Benchmarks y rendimiento

No se han publicado resultados de calidad de imagen (PSNR, SSIM, LPIPS) en la informacion disponible. La model card si incluye una tabla de rendimiento de latencia y memoria medida en NPU Qualcomm, de la que se reproduce una seleccion con el runtime ONNX:

| Chipset | Precision | Tiempo de inferencia (ms) | Rango de memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|
| Snapdragon 8 Elite Gen 5 Mobile | float | 0,989 | 0 - 23 | NPU |
| Snapdragon 8 Elite Mobile | float | 1,165 | 0 - 26 | NPU |
| Dragonwing Q-8750 | float | 1,165 | 0 - 26 | NPU |
| Snapdragon X2 Elite | float | 1,132 | 8 - 8 | NPU |
| Snapdragon 8 Gen 3 Mobile | float | 1,378 | 0 - 35 | NPU |
| Snapdragon X Elite | float | 2,038 | 8 - 8 | NPU |
| Snapdragon 8 Gen 1 Mobile | float | 3,042 | 0 - 41 | NPU |
| Snapdragon 8 Elite Gen 5 Mobile | w8a8 | 0,372 | 0 - 28 | NPU |
| Snapdragon 8 Elite Mobile | w8a8 | 0,423 | 0 - 27 | NPU |
| Snapdragon X2 Elite | w8a8 | 0,394 | 3 - 3 | NPU |
| Snapdragon 8 Gen 3 Mobile | w8a8 | 0,54 | 0 - 35 | NPU |
| Snapdragon X Elite | w8a8 | 0,787 | 3 - 3 | NPU |
| Snapdragon 8 Gen 1 Mobile | w8a8 | 1,015 | 0 - 39 | NPU |
| Dragonwing QCS6490 | w8a8 | 3,674 | 2 - 4 | NPU |
| Dragonwing IQ-8275 (float) | float | 3,415 | 6 - 10 | NPU |
| Dragonwing IQ-8275 (w8a8) | w8a8 | 0,866 | 0 - 4 | NPU |

La model card enlaza al catalogo de Qualcomm AI Hub para metricas adicionales por dispositivo, pero no incluye comparaciones con otros modelos de superresolucion.

## Requisitos de hardware

- VRAM: no aplica en el sentido habitual. El modelo pesa 1,32 MB en float y 395 KB en w8a8, y su rango de memoria pico medido en dispositivo va de 0 a 143 MB segun chipset (el caso mas alto, Dragonwing Q-6690 en w8a8, alcanza 143 MB).
- GPU recomendadas: no aplica; el objetivo son los NPU Hexagon integrados en los SoC Qualcomm, no GPUs dedicadas.
- Chipsets validados: Snapdragon 8 Gen 1, 8 Gen 3, 8 Elite, 8 Elite Gen 5, 7 Gen 4, X Elite, X2 Elite; Qualcomm QCS8450, QCS6490, Dragonwing QCS8550, IQ-8275, IQ-9075, IQ-X7181, Q-6690, Q-7790, Q-8750.
- Cabe en hardware de consumo: si, en cualquier dispositivo Android con SoC Snapdragon de gama media o alta, dado el tamano del modelo.
- Opciones de despliegue: Qualcomm AI Hub Models (Python) para compilar y exportar; ejecucion via ONNX Runtime 1.27.1 (float y w8a8), QNN_DLC con QAIRT 2.45 (float y w8a8) y TFLite (float y w8a8). Tambien se puede partir del checkpoint PyTorch y del repositorio aimet-model-zoo.
- Latencia y throughput: entre 0,372 ms y 7,379 ms por imagen de 128x128 px segun chipset y precision, con la mayoria de plataformas por debajo de 2 ms en w8a8. En Snapdragon 8 Elite Gen 5 Mobile la version w8a8 tarda 0,372 ms y la float 0,989 ms.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparativos en la informacion proporcionada. A continuacion se comparan caracteristicas generales; los campos no documentados se marcan como no disponibles.

| Modelo | Parametros | Factor de escala | Licencia | Formatos de despliegue |
|---|---|---|---|---|
| SESR-M5 (qualcomm) | 343 000 | 3x | BSD-3-Clause | PyTorch, ONNX, QNN_DLC, TFLite |
| EDSR | no disponible | no disponible | no disponible | no disponible |
| ESPCN | no disponible | no disponible | no disponible | no disponible |
| Real-ESRGAN | no disponible | no disponible | no disponible | no disponible |

La diferencia principal de SESR-M5 frente a las familias de superresolucion orientadas a maxima calidad (EDSR, ESRGAN, Real-ESRGAN) es su objetivo de despliegue: prioriza tamano minimo (343K parametros) y latencia sub-milisecond en NPU movil por encima de la fidelidad perceptual, mientras que aquellas estan pensadas para ejecucion en GPU y suelen tener ordenes de magnitud mas de parametros. No se dispone de datos verificables de parametros ni de licencia de esas alternativas en la informacion proporcionada, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- No se publican metricas de calidad de imagen (PSNR, SSIM) en la informacion disponible; no es posible cuantificar la fidelidad del reescalado a partir de los datos proporcionados.
- La entrada esta fijada a 128x128 px en la configuracion por defecto; para otras resoluciones hay que recompilar con formas personalizadas mediante Qualcomm AI Hub Models.
- El factor de escala documentado es 3x; no se detallan otras escalas en este repositorio.
- La cuantizacion w8a8 reduce el tamano y la latencia, pero puede degradar la calidad de la imagen frente a la version float; no se aportan datos que midan esa perdida.
- El modelo esta optimizado para NPU Qualcomm; fuera de esa plataforma solo se puede usar a traves de las exportaciones ONNX o TFLite, sin las optimizaciones especificas.
- Es un modelo puramente visual: no procesa lenguaje, no tiene capacidades de agente, tool calling ni multilingues.
- No se documentan sesgos ni comportamientos problematicos, pero tampoco se documenta la composicion del dataset de entrenamiento, lo que impide evaluar posibles sesgos en el contenido de las imagenes.
- Riesgo de alucinacion en el sentido visual: como todo modelo generativo de superresolucion, puede inventar texturas o detalles plausibles que no existen en la imagen original, especialmente con factores de ampliacion altos o entradas muy degradadas.
- Licencia BSD-3-Clause: permisiva, permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de copyright y la clausula de exencion de responsabilidad. No se incluye garantia.
- Las cifras de latencia dependen del chipset, de la version de QAIRT y del backend; no son extrapolables a otros entornos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/SESR-M5
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/sesr_m5
- Libreria Qualcomm AI Hub Models (GitHub): https://github.com/qualcomm/ai-hub-models/blob/v0.62.2/src/qai_hub_models/models/sesr_m5
- Implementacion de referencia en aimet-model-zoo: https://github.com/quic/aimet-model-zoo/tree/develop/aimet_zoo_torch/sesr
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Articulo de la arquitectura SESR: https://arxiv.org/abs/2103.09404
- Assets preexportados (v0.62.2): https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/sesr_m5/releases/v0.62.2/
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/
- Informacion de la empresa Qualcomm: https://www.qualcomm.com/company
- Qualcomm en Wikipedia: https://en.wikipedia.org/wiki/Qualcomm

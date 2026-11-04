# OpenVINO/rfdetr_medium-int8-ov

## Resumen

rfdetr_medium-int8-ov es la version cuantizada a INT8 y convertida al formato OpenVINO IR del modelo RF-DETR Medium, un detector de objetos basado en transformer desarrollado originalmente por Roboflow. Esta variante la publica OpenVINO (Intel) a partir del flujo de trabajo de Geti, la plataforma de vision artificial de Intel para anotacion, fine-tuning y exportacion de modelos. El modelo resuelve tareas de deteccion de objetos en imagenes, devolviendo cajas delimitadoras y etiquetas de clase.

La relevancia de esta ficha radica en que no se trata de un modelo de lenguaje, sino de un detector visual optimizado para inferencia en hardware Intel (CPU, GPU integrada y NPU). La compresion INT8 de pesos y activaciones mediante cuantizacion post-entrenamiento (PTQ) con NNCF reduce el peso del repositorio a unos 0,1 GB y acelera la inferencia en dispositivos de borde, lo que lo hace adecuado para despliegues en produccion con requisitos de latencia ajustados.

Al estar construido sobre RF-DETR, hereda la arquitectura transformer de deteccion de Roboflow, aunque la model card no detalla el numero de parametros ni la longitud de contexto visual. La licencia Apache-2.0 facilita su uso comercial, y su integracion con la Model API de OpenVINO simplifica el despliegue con unas pocas lineas de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para deteccion de objetos (RF-DETR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | INT8 (pesos y activaciones, PTQ con NNCF) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (compatible con OpenVINO 2026.1.0 o superior) |

## Arquitectura y entrenamiento

RF-DETR Medium es un detector de objetos basado en transformer, sucesor de la familia DETR, desarrollado por Roboflow. La arquitectura combina un backbone de extraccion de caracteristicas con un decoder transformer que predice directamente conjuntos de cajas y clases, eliminando la necesidad de componentes como NMS en el pipeline clasico. La model card no especifica el numero de parametros, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a un detector visual).

La variante publicada por OpenVINO aplica cuantizacion post-entrenamiento (PTQ) con NNCF, comprimiendo tanto pesos como activaciones a INT8. Segun la model card, la compresion se realizo con `nncf.quantize`, lo que reduce el tamano del modelo y acelera la inferencia en CPU, GPU y NPU de Intel. El modelo resultante se distribuye como OpenVINO IR y requiere OpenVINO 2026.1.0 o superior y Model API 0.4.0 o superior para su ejecucion.

## Capacidades

- Deteccion de objetos en imagenes: devuelve cajas delimitadoras y etiquetas de clase para los objetos presentes.
- Inferencia optimizada en hardware Intel: soporte para CPU, GPU integrada y NPU mediante el runtime de OpenVINO.
- Cuantizacion INT8: pesos y activaciones comprimidos, con el consiguiente ahorro de memoria y mejora de latencia.
- Integracion con Model API: carga mediante `Model.from_pretrained` y visualizacion de resultados con `Visualizer`.
- Fine-tuning con Geti: posibilidad de reentrenar con datasets personalizados anotados en la plataforma Geti y reexportar el modelo.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, al ser un modelo puramente visual.

## Casos de uso

- Deteccion de objetos en tiempo real en dispositivos de borde: el modelo INT8 se ejecuta en NPU y GPU integradas Intel, lo que permite desplegarlo en camaras inteligentes o mini-PC sin GPU dedicada, con latencia reducida gracias a la cuantizacion.
- Control de calidad en lineas de fabricacion: deteccion de defectos o piezas faltantes en imagenes de inspeccion, con fine-tuning previo mediante Geti sobre el dataset especifico de la planta.
- Videovigilancia y analitica de escenas: identificacion de personas, vehiculos u objetos en flujos de video, aprovechando la inferencia acelerada en CPU para procesar multiples streams.
- Automatizacion de inventario en retail: deteccion de productos en estanterias o en cajas de transporte a partir de imagenes capturadas por camaras fijas.
- Agricultura de precision: deteccion de plagas, frutos o malas hierbas en imagenes de campo, con modelos reentrenados para las clases de interes.
- Robotica movil: percepcion visual para navegacion y manipulacion en robots con hardware Intel, donde el bajo consumo y la latencia del modelo INT8 son criticos.
- Prototipado rapido de pipelines de vision: uso de la Model API de OpenVINO para integrar deteccion en aplicaciones Python con pocas lineas de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,1 GB, por lo que el modelo cuantizado a INT8 cabe holgadamente en memoria de cualquier GPU consumer; no se dispone de cifras exactas de VRAM en inferencia.
- GPU recomendadas: al estar optimizado para OpenVINO, el objetivo principal son CPU Intel, GPU integradas Intel y NPU de las plataformas Intel Core Ultra; tambien puede ejecutarse en GPU dedicadas Intel Arc.
- Cabe en GPU consumer: si, dado el reducido tamano del modelo (0,1 GB en INT8); cualquier GPU con unos pocos cientos de MB libres puede alojarlo.
- Opciones de despliegue: runtime de OpenVINO (version 2026.1.0 o superior) y Model API 0.4.0 o superior; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un detector visual.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| rfdetr_medium-int8-ov | no disponible | no aplica | OpenVINO IR INT8 | Apache-2.0 | Version cuantizada de RF-DETR Medium para hardware Intel |
| RF-DETR Medium (original) | no disponible | no aplica | PyTorch | Apache-2.0 | Modelo base sin cuantizar, de Roboflow |
| Otras variantes OpenVINO de deteccion | no disponible | no aplica | OpenVINO IR | Apache-2.0 | Familia de detectores optimizados por Intel para el mismo runtime |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: al ser un detector entrenado sobre un dataset no especificado en la model card, puede heredar sesgos de las clases y distribuciones de imagenes de dicho dataset; no se detallan en la informacion disponible.
- Riesgo de alucinacion: en deteccion de objetos se traduce en falsos positivos y detecciones espurias, especialmente en escenarios fuera de la distribucion de entrenamiento.
- Limitaciones de contexto o idioma: no aplica procesamiento de lenguaje; las limitaciones son visuales (resolucion de imagen, condiciones de iluminacion, oclusiones), y la model card remite a la documentacion del modelo original.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo original de Roboflow para confirmar condiciones.
- Compatibilidad: requiere OpenVINO 2026.1.0 o superior y Model API 0.4.0 o superior; versiones anteriores no son compatibles.
- Cuantizacion: la compresion INT8 puede producir una ligera perdida de precision frente al modelo original en algunos dominios; no se cuantifica esa perdida en la informacion disponible.
- Fine-tuning: para adaptar el modelo a un dataset propio es necesario usar Geti o el flujo de reentrenamiento del modelo original, ya que la version publicada es solo de inferencia.

## Enlaces

- HuggingFace: https://huggingface.co/OpenVINO/rfdetr_medium-int8-ov
- Modelo original RF-DETR: https://github.com/roboflow/rf-detr
- Geti (Intel): https://github.com/open-edge-platform/geti
- OpenVINO IR format: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Guia de cuantizacion OpenVINO: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html
- Model API: https://github.com/open-edge-platform/model_api
- Documentacion Model API: https://open-edge-platform.github.io/model_api/latest/
- OpenVINO toolkit: https://github.com/openvinotoolkit/openvino
- Documentacion OpenVINO: https://docs.openvino.ai/
- Licencia Roboflow: https://roboflow.com/licensing

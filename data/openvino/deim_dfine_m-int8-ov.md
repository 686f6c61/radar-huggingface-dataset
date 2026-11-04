# OpenVINO/deim_dfine_m-int8-ov

## Resumen
deim_dfine_m-int8-ov es la version optimizada del detector de objetos D-FINE-M, publicada por el equipo de OpenVINO de Intel a partir del modelo original DEIM D-FINE-M desarrollado por Intellindust AI Lab y empaquetado mediante la plataforma Geti. El modelo se distribuye en formato OpenVINO IR (Intermediate Representation) con pesos y activaciones cuantizados a INT8 mediante cuantizacion post-entrenamiento (PTQ) con NNCF, lo que reduce el coste computacional y de memoria en inferencia sin requerir reentrenamiento.

Se trata de un detector de objetos de la familia D-FINE, una arquitectura de deteccion basada en transformers (DETR refinado) que emplea refinamiento iterativo de cajas y distribuciones de probabilidad para localizacion precisa. El sufijo "m" indica el tamano medio de la familia; el modelo esta pensado para despliegue en CPU, GPU integrada y NPU de Intel, no para servidores de gran escala.

Su relevancia actual radica en que permite ejecutar deteccion de objetos con latencia reducida en hardware de borde y AI PCs, y en que Geti permite reentrenar el modelo con datasets propios y reexportarlo al mismo formato. La model card no proporciona informacion sobre el numero de parametros, el contexto (no aplica, no es un modelo de lenguaje) ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE (detector de objetos basado en transformer DETR con refinamiento iterativo); convertido a OpenVINO IR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | INT8 en pesos y activaciones (PTQ con nncf.quantize) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (compatible con OpenVINO 2026.1.0+ y Model API 0.4.0+) |

## Arquitectura y entrenamiento
D-FINE es una arquitectura de deteccion de objetos derivada de la familia DETR que sustituye la regresion directa de cajas por un esquema de refinamiento iterativo de distribuciones de probabilidad sobre las coordenadas, lo que mejora la precision de localizacion y acelera la convergencia. El modelo original DEIM D-FINE-M fue entrenado por Intellindust AI Lab; la model card no detalla el numero de tokens, la composicion del dataset ni si se aplico RLHF o DPO (no aplica, al no ser un modelo generativo de lenguaje).

La innovacion tecnica de esta version concreta es la conversion a OpenVINO IR y la cuantizacion INT8 mediante NNCF con cuantizacion post-entrenamiento (PTQ), que comprime pesos y activaciones a 8 bits. Esto permite inferencia acelerada en CPU, GPU y NPU de Intel sin necesidad de fine-tuning posterior a la cuantizacion. El modelo puede reentrenarse con datasets propios a traves de Geti y reexportarse al mismo formato.

## Capacidades
- Deteccion de objetos en imagenes: devuelve cajas delimitadoras con etiquetas de clase y puntuaciones de confianza.
- Inferencia optimizada en hardware Intel: CPU, GPU integrada y NPU mediante el runtime de OpenVINO.
- Integracion con Model API de OpenVINO para carga, inferencia y visualizacion de resultados en pocas lineas de codigo.
- Reentrenamiento con datasets personalizados mediante Geti, con anotacion, fine-tuning y exportacion al mismo formato.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).
- No dispone de modo thinking, vision generativa, audio ni otras capacidades multimodales mas alla de la deteccion visual.

## Casos de uso
- Inspeccion visual en linea de produccion: el modelo detecta defectos o piezas en imagenes de camara industrial; su cuantizacion INT8 permite ejecutarlo en CPU o NPU de un PC industrial sin GPU dedicada.
- Videovigilancia y analitica de aforo: deteccion de personas u objetos en flujos de video en dispositivos de borde, aprovechando la baja latencia del IR optimizado para CPU.
- Robotica movil y drones: deteccion de obstaculos o marcadores en tiempo real en plataformas con recursos limitados, donde el formato OpenVINO IR reduce el consumo energetico.
- Automatizacion de inventario en retail: conteo y localizacion de productos en estanterias a partir de imagenes, con reentrenamiento en Geti sobre el catalogo propio.
- Agricultura de precision: deteccion de frutos, plagas o malas hierbas en imagenes de campo capturadas por dispositivos de borde.
- Control de calidad en fabricacion electronica: localizacion de componentes y soldaduras en placas, con fine-tuning sobre el dataset especifico de la linea.
- Asistencia a la conduccion en vehiculos embebidos: deteccion de peatones y vehiculos en sistemas ADAS de bajo consumo que emplean NPU Intel.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible; al ser INT8 y estar orientado a CPU/NPU, el consumo de memoria es reducido, pero la model card no especifica cifras.
- GPU recomendadas: no se indican modelos concretos; el runtime de OpenVINO soporta GPU integradas Intel y aceleradores discretos compatibles.
- Compatibilidad con GPU de consumo: si, a traves de OpenVINO en GPU integradas Intel; no se detalla soporte para RTX 4090 u otras GPU NVIDIA.
- Opciones de despliegue: OpenVINO Runtime 2026.1.0 o superior y Model API 0.4.0 o superior (pip install openvino-model-api[huggingface]).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos comparables.

## Limitaciones y advertencias
- La model card remite a la documentacion del modelo original para las limitaciones; no se detallan sesgos conocidos ni tasas de error.
- Riesgo de falsos positivos y negativos inherente a la deteccion de objetos, agravado por la cuantizacion INT8, que puede degradar ligeramente la precision respecto al modelo en punto flotante.
- El modelo esta especializado en las clases del dataset con el que fue entrenado; para dominios nuevos requiere reentrenamiento con Geti.
- No soporta tareas de lenguaje, razonamiento ni generacion de texto.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar los terminos del modelo original en el repositorio de Intellindust AI Lab.
- Requiere OpenVINO 2026.1.0 o superior; versiones anteriores no son compatibles con el IR generado.
- El tamano del repositorio figura como 0.0 GB, dato que puede no reflejar el peso real de los artefactos.

## Enlaces
- HuggingFace: https://huggingface.co/OpenVINO/deim_dfine_m-int8-ov
- Modelo original DEIM: https://github.com/Intellindust-AI-Lab/DEIM
- Geti: https://github.com/open-edge-platform/geti
- OpenVINO IR format: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Guia de cuantizacion OpenVINO: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html
- Model API: https://github.com/open-edge-platform/model_api
- Documentacion Model API: https://open-edge-platform.github.io/model_api/latest/
- OpenVINO toolkit: https://github.com/openvinotoolkit/openvino
- Documentacion OpenVINO: https://docs.openvino.ai/
- Licencia original: https://github.com/Intellindust-AI-Lab/DEIM/blob/main/LICENSE

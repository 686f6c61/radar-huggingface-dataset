# OpenVINO/mobilenetv2_050_lamb_in1k-int8-ov

## Resumen

`OpenVINO/mobilenetv2_050_lamb_in1k-int8-ov` es una version cuantizada a INT8 y convertida al formato OpenVINO IR del clasificador de imagenes `timm/mobilenetv2_050.lamb_in1k`, publicado por el equipo de OpenVINO (Intel). No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: el mismo MobileNetV2 con factor de anchura 0,50, entrenado originalmente con el optimizador LAMB sobre ImageNet-1k, transformado para ejecutarse de forma eficiente sobre hardware Intel (CPU, GPU integrada y NPU).

El modelo resuelve el problema de desplegar clasificacion de imagenes en entornos de recursos limitados con latencia baja. MobileNetV2 es una arquitectura convolucional con bloques residuales invertidos y conexiones lineales de cuello de botella, disenada para movil y edge; la variante `050` reduce los canales a la mitad respecto al MobileNetV2 estandar, lo que la situa en el rango de aproximadamente 1,4 millones de parametros. La compresion INT8 mediante NNCF (Post-Training Quantization) reduce adicionalmente el peso y acelera la inferencia en hardware compatible.

Su relevancia actual es practica: permite incorporar un clasificador de ImageNet en pipelines de vision por computador sobre dispositivos Intel sin necesidad de GPU dedicada, con un formato (OpenVINO IR) y una API (Model API de OpenVINO) pensados para produccion. La licencia Apache-2.0 del modelo original facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN con bloques residuales invertidos), factor de anchura 0,50 |
| Parametros totales | Aproximadamente 1,4 millones (derivado de la variante 0.50 de MobileNetV2; no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | INT8 en pesos y activaciones (PTQ con NNCF) |
| Idiomas soportados | No disponible (clasificacion de imagenes; etiquetas de ImageNet en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (comprimido a INT8) |
| Entrada | Imagen RGB (resolucion tipica 224x224, no confirmada en la model card) |
| Salida | Logits de clasificacion sobre las clases de ImageNet-1k |
| Compatibilidad | OpenVINO >= 2026.1.0, Model API >= 0.4.0 |
| Modelo base | timm/mobilenetv2_050.lamb_in1k |

## Arquitectura y entrenamiento

La arquitectura subyacente es MobileNetV2, una red convolucional que emplea bloques residuales invertidos con expansion de canales, convoluciones depthwise separables y conexiones lineales de cuello de botella para reducir coste computacional y numero de parametros. La variante `050` aplica un factor de anchura de 0,50, reduciendo los canales de todas las capas a la mitad respecto al MobileNetV2 de referencia. El modelo original fue entrenado por el proyecto `timm` sobre ImageNet-1k utilizando el optimizador LAMB, segun indica el sufijo `lamb_in1k` del identificador.

Sobre el entrenamiento original no se detallan en la informacion disponible el numero exacto de tokens (equivalentes a imagenes), la composicion del dataset mas alla de ImageNet-1k, ni si se aplicaron tecnicas de destilacion o ajuste fino adicional. Lo que si esta documentado es el proceso de transformacion: conversion al formato OpenVINO IR y compresion de pesos y activaciones a INT8 mediante `nncf.quantize` con cuantizacion post-entrenamiento (PTQ). No se menciona calibracion con un dataset concreto ni metricas de degradacion por cuantizacion en la model card.

La innovacion tecnica relevante no esta en la arquitectura (que es un clasico de 2018) sino en el pipeline de despliegue: el formato IR permite optimizaciones de grafo y ejecucion sobre CPU, GPU y NPU de Intel, y la API Model API abstrae la carga y el preprocesado.

## Capacidades

- Clasificacion de imagenes en las 1000 clases de ImageNet-1k.
- Extraccion de caracteristicas visuales (el backbone puede reutilizarse para tareas downstream, aunque no esta documentado en la model card).
- Inferencia de baja latencia en CPU, GPU integrada y NPU de Intel mediante OpenVINO.
- Ejecucion con cuantizacion INT8 en pesos y activaciones, reduciendo el peso del modelo y acelerando en hardware con soporte de instrucciones de bajo precision.
- Integracion con la Model API de OpenVINO para carga, preprocesado, inferencia y visualizacion de resultados.
- No soporta generacion de texto, razonamiento, codigo, tool calling, agentes ni capacidades multilingues: es exclusivamente un clasificador de vision.

## Casos de uso

- Clasificacion de imagenes en tiempo real en dispositivos edge: el modelo puede ejecutarse sobre CPU o NPU Intel en camaras inteligentes o gateways industriales, clasificando fotogramas con latencia baja gracias a la compresion INT8 y a la arquitectura ligera de MobileNetV2.
- Filtrado y organizacion automatica de fotos: en aplicaciones de gestion de bibliotecas de imagenes, el modelo etiqueta cada imagen con una de las 1000 clases de ImageNet para indexacion y busqueda.
- Preprocesado en pipelines de vision mas complejos: como primer estadio de un sistema de deteccion o segmentacion, el clasificador descarta o prioriza imagenes antes de pasarlas a modelos mas costosos.
- Control de calidad visual en fabricacion: clasificacion de imagenes de producto para detectar categorias o estados anomalos, desplegado en lineas de produccion con hardware Intel sin GPU dedicada.
- Moderacion de contenido basica: clasificacion de imagenes subidas por usuarios en categorias generales para un primer filtrado antes de revision humana o modelos mas especializados.
- Prototipado rapido de aplicaciones de vision: gracias a la Model API y a la licencia Apache-2.0, sirve como base para validar pipelines de clasificacion antes de invertir en modelos propietarios o de mayor tamano.
- Automatizacion de etiquetado en datasets: clasificacion previa de grandes volumenes de imagenes para asistir en el etiquetado o detectar imagenes mal categorizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision (top-1/top-5 en ImageNet) ni de latencia o throughput para el modelo cuantizado, ni comparacion con el modelo original en FP32.

## Requisitos de hardware

- VRAM/RAM: al tratarse de un modelo de aproximadamente 1,4 millones de parametros en INT8, el peso es del orden de unos pocos megabytes; cabe holgadamente en cualquier dispositivo. No se especifica el tamano exacto en la informacion disponible (el repositorio figura como 0.0 GB).
- GPU recomendadas: no requiere GPU dedicada; esta pensado para CPU, GPU integrada y NPU de Intel. Puede ejecutarse en GPUs Intel Arc y en iGPUs Intel compatibles con OpenVINO.
- Cabe en cualquier GPU consumer: si, por su tamano minimo, aunque su objetivo es el despliegue en CPU/NPU.
- Opciones de despliegue: OpenVINO Runtime (>= 2026.1.0), OpenVINO Model API (>= 0.4.0) con el extra `[huggingface]`. No esta pensado para vLLM, llama.cpp, Ollama ni TGI, que son frameworks de modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OpenVINO/mobilenetv2_050_lamb_in1k-int8-ov | ~1,4 M | Imagen (clasificacion) | OpenVINO IR INT8 | Apache-2.0 | Version cuantizada para despliegue en hardware Intel |
| timm/mobilenetv2_050.lamb_in1k | ~1,4 M | Imagen (clasificacion) | PyTorch (safetensors) | Apache-2.0 | Modelo original en FP32, sin cuantizar |
| Otras variantes MobileNetV2 (p. ej. factor 1.0) | ~3,5 M | Imagen (clasificacion) | Variable | Apache-2.0 | Mayor capacidad y coste computacional |

No se dispone de datos de rendimiento comparado (precision o latencia) en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Es un clasificador cerrado de 1000 clases de ImageNet: no reconoce categorias fuera de ese vocabulario y no genera descripciones ni respuestas en lenguaje natural.
- La cuantizacion INT8 puede degradar ligeramente la precision respecto al modelo original en FP32; no se documenta la magnitud de esa degradacion.
- Posibles sesgos heredados de ImageNet-1k en la representacion de clases, culturas y contextos visuales.
- Riesgo de clasificaciones erroneas o de baja confianza en imagenes fuera de distribucion, con iluminacion atipica, oclusiones o clases ambiguas.
- No soporta otros idiomas ni tareas multimodales; las etiquetas de salida estan en ingles.
- Requiere OpenVINO >= 2026.1.0 y Model API >= 0.4.0; no es directamente cargable con PyTorch o transformers sin conversion.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar la model card del modelo original para condiciones adicionales.
- Para limitaciones detalladas del modelo base, la model card remite a la del modelo original de timm.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenVINO/mobilenetv2_050_lamb_in1k-int8-ov
- Modelo original: https://huggingface.co/timm/mobilenetv2_050.lamb_in1k
- Documentacion de OpenVINO: https://docs.openvino.ai/
- Formato OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Guia de cuantizacion post-entrenamiento: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html
- Repositorio de OpenVINO: https://github.com/openvinotoolkit/openvino
- NNCF (Neural Network Compression Framework): https://github.com/openvinotoolkit/nncf
- Model API: https://github.com/open-edge-platform/model_api
- Documentacion de Model API: https://open-edge-platform.github.io/model_api/latest/
- OpenVINO en HuggingFace: https://huggingface.co/OpenVINO
- Intel Distribution of OpenVINO Toolkit: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html

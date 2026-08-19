# Blaize-AI/CCTv1xsRelu_GlobalPlates

## Resumen

El modelo CCTv1xsRelu_GlobalPlates es un sistema de reconocimiento óptico de caracteres (OCR) especializado en matrículas de vehículos, desarrollado por Blaize-AI como parte de su catálogo de modelos optimizados para sus aceleradores Xplorer. Se basa en la arquitectura Compact Convolutional Transformer (CCT), propuesta por Hassani et al. en 2021, y utiliza los pesos del proyecto open source fast-plate-ocr, que a su vez fue entrenado sobre el Global License Plate Dataset (GlobalPlates), un conjunto de datos a gran escala con más de 5 millones de imágenes de matrículas procedentes de 74 países.

El modelo está diseñado para inferencia en el edge, con un tamaño reducido y baja latencia, gracias a la optimización específica realizada por Blaize para su hardware GSP (Graph Streaming Processor). Se distribuye en formato `.bm` (propietario de Blaize) y solo puede ejecutarse en los aceleradores Xplorer mediante el Blaize Picasso SDK. La variante publicada en este repositorio utiliza cuantización BF16 y una resolución de entrada de 128×64 píxeles, lo que lo hace adecuado para aplicaciones de lectura de matrículas en tiempo real con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Compact Convolutional Transformer (CCT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision por imagenes) |
| Tipos de cuantizacion | BF16 (unica variante publicada; el autor menciona INT8 y AMP como metodos generales, pero no se incluyen en este repo) |
| Idiomas soportados | no disponible (reconoce caracteres alfanumericos de matriculas de 74 paises) |
| Licencia | MIT |
| Formato de pesos | `.bm` (formato binario propietario de Blaize, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Compact Convolutional Transformer (CCT), que combina capas convolucionales con mecanismos de atencion transformer para procesar imagenes de forma eficiente, reduciendo el numero de parametros y la carga computacional frente a transformers de vision clasicos. Esta arquitectura fue presentada en el articulo "Escaping the Big Data Paradigm with Compact Transformers" (arXiv:2104.05704). Los pesos originales provienen del repositorio fast-plate-ocr, que implementa un pipeline de deteccion y reconocimiento de matriculas.

El entrenamiento se realizo sobre el Global License Plate Dataset (GlobalPlates), descrito en el articulo arXiv:2405.10949. Este dataset contiene mas de 5 millones de imagenes de matriculas de 74 paises, aunque las imagenes no estan publicamente disponibles. El modelo ha sido posteriormente optimizado por Blaize para su hardware GSP, mediante el Picasso SDK, que aplica tecnicas de cuantizacion y compilacion grafica para mejorar la velocidad y eficiencia en inferencia. No se menciona el uso de RLHF, DPO ni otros metodos de alineacion, al tratarse de un modelo de vision puro.

## Capacidades

- Reconocimiento de caracteres alfanumericos en matriculas de vehiculos, incluyendo formatos de multiples paises (74 paises segun el dataset de entrenamiento).
- Procesamiento de imagenes de baja resolucion (128×64 píxeles), lo que permite su uso en camaras de vigilancia y sistemas embebidos.
- Inferencia rapida y eficiente en aceleradores Blaize Xplorer, disenada para aplicaciones en tiempo real en el edge.
- Soporte de cuantizacion BF16 para alta precision, con posibilidad de usar INT8 o AMP en otras variantes (aunque no estan publicadas en este repositorio).
- No dispone de capacidades de generacion de texto, tool calling, agentes ni procesamiento de lenguaje natural; es exclusivamente un modelo de OCR de matricula.

## Casos de uso

- Control de accesos en aparcamientos: el modelo puede leer la matricula de un vehiculo en la entrada y salida, comparandola con una base de datos de vehiculos autorizados, gracias a su baja latencia y capacidad de procesamiento en tiempo real en dispositivos edge.
- Peajes y sistemas de pago automatico: integrado en camaras de peaje, permite identificar el vehiculo y asociar el cargo sin necesidad de detener el trafico, aprovechando su resolucion de entrada reducida y su optimizacion para hardware de bajo consumo.
- Vigilancia y seguridad ciudadana: en camaras de videovigilancia urbana, el modelo puede detectar y reconocer matriculas para alertar sobre vehiculos robados o sospechosos, funcionando de forma autonoma en nodos de computacion perimetral.
- Gestion de flotas y logistica: lectura automatica de matriculas en entradas de almacenes o centros de distribucion, facilitando el registro de entrada y salida de vehiculos sin intervencion manual.
- Analisis de trafico y estudios de movilidad: procesamiento de imagenes de camaras de trafico para contar vehiculos y clasificarlos por matricula, contribuyendo a estudios de congestion o planificacion urbana.
- Aplicaciones de aparcamiento inteligente: en sensores o camaras de plazas de aparcamiento, el modelo puede identificar el vehiculo estacionado y gestionar el pago por tiempo de uso, mejorando la experiencia del usuario y reduciendo costes operativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, precision, recall ni comparaciones con otros modelos de OCR de matriculas. Tampoco se proporcionan datos de latencia o throughput especificos para el hardware Xplorer.

## Requisitos de hardware

- Requiere un acelerador Blaize Xplorer AI (familia GSP); no es compatible con GPUs convencionales (NVIDIA, AMD) ni con CPUs estandar, ya que el formato `.bm` es exclusivo de Blaize.
- La VRAM estimada no se especifica, pero al tratarse de un modelo compacto (CCTv1xs) y con cuantizacion BF16, se espera que ocupe pocos cientos de megabytes, adecuado para memoria integrada en el acelerador.
- No cabe en GPUs de consumo (RTX 4090, etc.) porque el formato no es ejecutable en esos dispositivos sin una conversion previa que no se ha proporcionado.
- Despliegue mediante el Blaize Picasso SDK, utilizando la utilidad `blaize-modeltool` para inspeccionar el modelo y cargarlo en el hardware.
- No se conocen opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, dado que no es un modelo de lenguaje y el formato es propietario.
- No se dispone de datos de latencia o throughput; la optimizacion para el GSP sugiere latencias de milisegundos, pero no se confirma numericamente.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. El modelo original fast-plate-ocr (del que se derivan los pesos) es una alternativa de codigo abierto que puede ejecutarse en GPUs convencionales, pero no se han publicado comparaciones directas de rendimiento. Otros sistemas comerciales de OCR de matriculas (como los basados en YOLO) no tienen metricas comparables disponibles en la informacion proporcionada. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo solo puede ejecutarse en hardware Blaize Xplorer; no es portable a otros entornos sin una conversion que no se ha facilitado, lo que limita su uso a clientes de esa plataforma.
- El dataset de entrenamiento (GlobalPlates) no es publico y su licencia es CC-BY-NC-ND-4.0, lo que impide el uso comercial del dataset en si mismo, aunque el modelo se distribuya bajo MIT. Esto podria generar incertidumbre legal si se desea utilizar el modelo en productos comerciales, ya que los pesos derivan de un dataset con restricciones.
- No se han publicado metricas de precision ni evaluaciones independientes, por lo que se desconoce su exactitud real en condiciones de campo (iluminacion variable, angulos, matriculas danadas).
- Al estar entrenado con imagenes de 74 paises, podria presentar sesgos geograficos en formatos de matricula poco representados.
- Riesgo de alucinacion no aplica, al ser un modelo discriminativo de vision, pero si existe riesgo de errores de reconocimiento en caracteres ambiguos o con oclusiones.
- No hay garantia de que el modelo no infrinja patentes o derechos de propiedad intelectual de terceros, segun el aviso de Blaize en la model card.
- La unica variante publicada es BF16 a resolucion 128×64; no se incluyen las versiones INT8 o AMP mencionadas en la documentacion general, lo que limita las opciones de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blaize-AI/CCTv1xsRelu_GlobalPlates
- Repositorio original del modelo (fast-plate-ocr): https://github.com/ankandrew/fast-plate-ocr
- Dataset Global License Plate Dataset: https://github.com/siddagra/Global-License-Plate-Dataset
- Paper de Compact Transformers: https://arxiv.org/abs/2104.05704
- Paper del Global License Plate Dataset: https://arxiv.org/abs/2405.10949 (DOI: https://doi.org/10.48550/arXiv.2405.10949)
- Web de Blaize: https://www.blaize.com

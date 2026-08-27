# OpenExploer/mixvargenet

## Resumen

MixVarGENet es un backbone de clasificación de imágenes propuesto por Horizon Robotics, diseñado específicamente para su familia de chips Journey (J5 y J6). El modelo construye una red ligera mediante bloques de variantes mixtas (mixvarge), combinando bloques base f2/f4 en las dos primeras etapas y bloques con grupos f2_gb16 en las dos últimas, con un downsampling progresivo hasta un stride de 32. Está optimizado para despliegue en hardware embebido de Horizon, con métricas de rendimiento publicadas para las arquitecturas J6M y J6P.

El modelo resuelve el problema de clasificación de imágenes en entornos de conducción autónoma y visión por computador embebida, donde la eficiencia computacional y el bajo consumo son críticos. Su relevancia actual radica en que es una arquitectura de referencia para el ecosistema de desarrollo de Horizon Robotics, con soporte en su cadena de herramientas HEAL (Horizon Embedded AI Library) y ejemplos de integración en tareas como detección de carriles y estimación de disparidad. El repositorio en HuggingFace contiene el modelo con un tamaño de 0.1 GB, aunque la información pública sobre parámetros totales y licencia detallada es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone CNN con bloques mixvarge (f2/f4 y f2_gb16) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | Calibracion (float a int8), HBM (high bandwidth memory); QAT no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | other (especificar con el autor) |
| Formato de pesos | no disponible (repo de 0.1 GB en HuggingFace) |

## Arquitectura y entrenamiento

MixVarGENet es un backbone convolutional con una estructura de 5 etapas que reduce la resolucion espacial progresivamente: stride 2, 4, 8, 16 y 32. Las dos primeras etapas utilizan bloques base mixvarge_f2 y mixvarge_f4, mientras que las dos ultimas emplean bloques mixvarge_f2_gb16 con grupos (grouped blocks, gb16). Los canales evolucionan de 32 a 32, 64, 96 y 160 a lo largo de las etapas. La cabeza de clasificacion es un fully connected integrado que produce logits de 1000 clases, y la funcion de perdida es cross-entropy con label smoothing (CEWithLabelSmooth).

El entrenamiento se realizo sobre ImageNet, aunque no se proporcionan detalles sobre el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas como RLHF o DPO (no aplicables a un modelo de vision). La innovacion principal reside en el diseno de los bloques mixvarge, que buscan un equilibrio entre precision y latencia para ejecucion en los chips Journey de Horizon. El modelo esta profundamente acoplado al hardware objetivo, con soporte en la herramienta hbdk4-compiler y el plugin horizon_plugin_pytorch.

## Capacidades

- Clasificacion de imagenes en 1000 categorias (ImageNet), con entrada RGB de 224x224 píxeles.
- Extraccion de caracteristicas multiescala gracias a las 5 etapas con strides progresivos (2, 4, 8, 16, 32).
- Inferencia de alta velocidad en hardware Horizon: 5464.88 FPS en J6M y 9374.11 FPS en J6P (medido con 8 hilos en un solo nucleo).
- Baja latencia: 0.36 ms en J6M y 0.33 ms en J6P (single core, single thread).
- Uso de memoria DDR contenido: 6.40 MB en ambas arquitecturas.
- Soporte de cuantizacion a traves de calibracion (float a int8) y modo HBM; no requiere QAT para esta tarea.
- Integracion con el ecosistema HEAL de Horizon (hbdk4-compiler, horizon_plugin_pytorch).
- Capacidad de ser utilizado como backbone en tareas derivadas: deteccion de carriles (GANet), estimacion de disparidad (StereoNet+), entre otras.

## Casos de uso

- Clasificacion de escenas en vehiculos autonomos: el modelo puede clasificar el entorno (urbano, autopista, rural) en tiempo real, con una latencia de 0.36 ms en el chip J6M, lo que permite decisiones rapidas en el vehiculo.
- Deteccion de carriles: combinado con redes como GANet, MixVarGENet actua como extractor de caracteristicas para segmentar y predecir marcas viales, aprovechando su diseno de bajo coste computacional.
- Estimacion de profundidad estereo: integrado en arquitecturas como StereoNet+, el backbone alimenta la red de disparidad para calcular distancias en sistemas de asistencia a la conduccion.
- Vision por computador embebida en dispositivos de borde: su reducido uso de memoria (6.40 MB) y alta velocidad lo hacen adecuado para camaras inteligentes y sistemas de vigilancia con recursos limitados.
- Prototipado rapido en el ecosistema Horizon: los desarrolladores pueden usar el modelo como referencia para validar sus propias arquitecturas en los chips J5/J6, gracias a los ejemplos incluidos en el AI Benchmark de Horizon.
- Transfer learning en tareas de clasificacion especificas: el backbone preentrenado en ImageNet puede ajustarse para dominios concretos (flora, fauna, señales de trafico) con un coste de entrenamiento reducido.

## Benchmarks y rendimiento

| Metrica | Valor (J6M) | Condiciones |
|---|---|---|
| Accuracy (float) | 0.716 | March.NASH_M, sin QAT |
| Accuracy (calibracion) | 0.7116 | March.NASH_M |
| Accuracy (HBM) | 0.7116 | March.NASH_M |
| Latencia | 0.36 ms | single core, single thread |
| FPS | 5464.88 | 8 threads, single core |
| Memoria DDR | 6.40 MB | pico |

| Metrica | Valor (J6P) | Condiciones |
|---|---|---|
| Latencia | 0.33 ms | single core, single thread |
| FPS | 9374.11 | 8 threads, single core |
| Memoria DDR | 6.40 MB | pico |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. Los datos de rendimiento se refieren exclusivamente al hardware Horizon J6M y J6P.

## Requisitos de hardware

- Inferencia optimizada para los chips Horizon Journey J6M y J6P; no se proporcionan requisitos de VRAM para GPU genericas.
- En hardware Horizon, el modelo requiere 6.40 MB de memoria DDR en pico, lo que lo hace apto para sistemas embebidos con recursos limitados.
- No se indica si es compatible con GPU de consumo (RTX 4090, etc.) ni con CPU convencionales; el despliegue esta pensado para el stack de Horizon (hbdk4-compiler, horizon_plugin_pytorch).
- Para desarrollo y entrenamiento, se requiere el entorno HEAL (heal 0.0.2, hbdk4-compiler 4.11.11, horizon_plugin_pytorch 3.3.10).
- No se mencionan opciones de despliegue con frameworks genericos como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- El rendimiento en J6B no esta disponible para este modelo.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros backbones de clasificacion (como ResNet, EfficientNet o MobileNet) en la informacion proporcionada. El modelo esta disenado especificamente para el hardware de Horizon, por lo que una comparativa justa requeriria ejecutar los mismos benchmarks en los chips J6M/J6P, algo que no se ha publicado. Se recomienda consultar la documentacion oficial de Horizon para obtener comparaciones con arquitecturas alternativas en su ecosistema.

## Limitaciones y advertencias

- El modelo esta optimizado exclusivamente para los chips Journey de Horizon (J6M, J6P); su rendimiento en otras plataformas no esta documentado y podria ser significativamente inferior.
- La licencia se indica como "other", por lo que es necesario contactar con Horizon Robotics para confirmar los terminos de uso comercial y redistribucion.
- No se proporcionan detalles sobre sesgos en el dataset de entrenamiento (ImageNet), aunque es conocido que este dataset puede contener sesgos de genero, raza y geografia.
- La precision del modelo (0.716 en float) es moderada en comparacion con backbones modernos de mayor tamano; no es adecuado para tareas que requieran precision de ultima generacion.
- No se ha publicado informacion sobre la robustez del modelo ante ataques adversariales o condiciones de iluminacion extremas, algo critico en aplicaciones de conduccion autonoma.
- El repositorio en HuggingFace tiene 0 descargas y 0 likes, lo que sugiere que es un modelo de referencia interna mas que un proyecto comunitario activo.
- La fecha de creacion (2026-08-27) es futura respecto a la fecha actual, lo que podria indicar un error en los metadatos o un modelo experimental.

## Enlaces

- HuggingFace: https://huggingface.co/OpenExploer/mixvargenet
- Documentacion de Horizon sobre MixVarGENet: https://developer.horizon.auto/blog/10387
- Foro de la comunidad (referencia al algoritmo): https://forum.d-robotics.cc/t/topic/25905
- Ejemplo de configuracion para deteccion de carriles (GANet): https://github.com/yingxie285/sparse4d_qat/blob/main/samples/ai_toolchain/horizon_model_train_sample/scripts/configs/lane_pred/ganet/ganet_mixvargenet_culane.py
- Ejemplo de configuracion para estimacion de disparidad (StereoNet+): https://github.com/yingxie285/sparse4d_qat/blob/main/samples/ai_toolchain/horizon_model_train_sample/scripts/configs/disparity_pred/stereonet/stereonetplus_mixvargenet_sceneflow.py
- Documentacion del AI Benchmark de Horizon (J5): https://developer.d-robotics.cc/api/v1/fileData/horizon_j5_open_explorer_en_doc/runtime/source/ai_benchmark/source/ai-benchmark.html

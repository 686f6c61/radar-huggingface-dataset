# qualcomm/Depth-Anything

## Resumen

Depth-Anything (repositorio `qualcomm/Depth-Anything`) es un modelo de estimación de profundidad monocular, es decir, genera un mapa de profundidad por píxel a partir de una única imagen RGB sin necesidad de sensores de profundidad. El repositorio lo publica Qualcomm como parte de su iniciativa AI Hub Models, y contiene exportaciones precompiladas del checkpoint `DepthAnything_Small` (24,7 millones de parámetros, 94,3 MB en precisión float) optimizadas para ejecutarse en la NPU de dispositivos con chipsets Snapdragon y Dragonwing.

Qualcomm no es el autor del modelo original: la model card indica explícitamente que la implementación de referencia procede de la librería Hugging Face Transformers y que el artículo asociado es arXiv:2401.10891. El valor de este repositorio es de despliegue: ofrece los mismos pesos convertidos a formatos listos para producción (ONNX, QNN_DLC y TFLite) con compilación y perfilado realizados mediante Qualcomm AI Hub Workbench, además de versiones cuantizadas w8a16.

Es relevante ahora porque cubre el caso de uso de percepción densa en el borde (edge), donde ejecutar un modelo de profundidad en la NPU con un consumo bajo de memoria y latencias de entre 12 y 301 ms según el chipset habilita aplicaciones móviles de realidad aumentada, fotografía computacional o robótica que no pueden depender de la nube. La licencia MIT facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision para estimacion de profundidad monocular (variante Small, checkpoint `DepthAnything_Small`); el detalle interno de codificador y decodificador no se especifica en la informacion proporcionada |
| Parametros totales | 24,7 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; modelo de vision con entrada de imagen de 518x518 pixeles |
| Tipos de cuantizacion | Float y w8a16 (exportaciones ONNX y QNN_DLC); TFLite solo en float |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (repositorio), ONNX (float y w8a16), QNN_DLC (float y w8a16), TFLite (float) |
| Tarea (pipeline) | `depth-estimation` |
| Resolucion de entrada | 518x518 |
| Tamano del modelo en float | 94,3 MB |
| Tamano del repositorio | 5,7 GB |
| Autor del repositorio | qualcomm |
| Articulo asociado | arXiv:2401.10891 |
| Descargas / likes | 40 / 3 |
| Fecha de creacion / actualizacion | 2024-12-12 / 2026-09-10 |
| Version de la libreria AI Hub Models | v0.62.0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento del modelo original. Lo unico que se especifica es que se trata de la implementacion de Depth-Anything disponible en Hugging Face Transformers, que el checkpoint utilizado es `DepthAnything_Small`, que el numero de parametros es de 24,7 millones y que la entrada se normaliza a 518x518 pixeles. No se proporcionan datos sobre el numero de tokens de imagen, la composicion del dataset de entrenamiento ni si se aplicaron fases de ajuste con datos etiquetados, destilacion o aprendizaje por refuerzo; esa informacion debe consultarse en el articulo original (arXiv:2401.10891), no en este repositorio.

Lo que si documenta Qualcomm es la cadena de despliegue: los pesos originales se exportan a ONNX, QNN_DLC y TFLite, se compilan con Qualcomm AI Hub Workbench (QAIRT 2.45, ONNX Runtime 1.27.1) y se perfilan sobre dispositivos reales. La cuantizacion disponible es w8a16 (pesos en enteros de 8 bits, activaciones en 16 bits), que reduce el tiempo de inferencia aproximadamente a la mitad respecto a float en los chipsets medidos sin cambiar la resolucion de entrada. Ademas, la libreria `ai-hub-models` permite reexportar con pesos ajustados propios, formas de entrada personalizadas y configuraciones de dispositivo y runtime especificas.

## Capacidades

- Estimacion de profundidad densa por pixel a partir de una sola imagen RGB, sin sensor de profundidad.
- Inferencia sobre NPU de chipsets Snapdragon (8 Gen 1, 8 Gen 3, 8 Elite, 8 Elite Gen 5, X Elite, X2 Elite) y Dragonwing (IQ-8275, IQ-9075, IQ-X7181, Q-6690, Q-7790, Q-8750, QCS6490, QCS8550, QCS8450).
- Ejecucion en cuatro rutas de despliegue: ONNX, QNN_DLC, TFLite y PyTorch mediante Transformers.
- Soporte de cuantizacion w8a16 en ONNX y QNN_DLC, con reduccion de latencia de aproximadamente el 40-50 % frente a float en los dispositivos medidos.
- Exportacion personalizada: admite pesos ajustados, formas de entrada propias y seleccion de dispositivo y runtime mediante la libreria AI Hub Models.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica (modelo sin entrada ni salida de texto).
- Capacidades especiales: ninguna adicional documentada; no se especifica si la salida es profundidad relativa o metrica.

## Casos de uso

- Realidad aumentada en movil: colocar objetos virtuales sobre superficies reales requiere un mapa de profundidad por pixel; con latencias de 14-24 ms en Snapdragon 8 Elite y X2 Elite, el mapa puede recalcularse por fotograma y mantener la coherencia espacial en tiempo real.
- Fotografia computacional y modo retrato: el mapa de profundidad permite segmentar sujeto y fondo sin sensor dedicado, generando desenfoques progresivos y efectos de reenfoque posterior en el propio dispositivo.
- Robotica movil y evasion de obstaculos: un robot de bajo consumo puede estimar distancias relativas con una unica camara y procesar el resultado en la NPU, reduciendo coste y consumo frente a soluciones con LiDAR.
- Drones y navegacion autonoma: la ventana de memoria pico medida (tan baja como 4-5 MB en Dragonwing IQ-8275) permite integrar el modelo en plataformas con presupuesto de memoria muy ajustado, necesario para mantener vuelo estable.
- Reconstruccion 3D y fotogrametria: el mapa de profundidad denso por imagen sirve como entrada para generar nubes de puntos y mallas, acelerando la fase de correspondencia densa en pipelines de captura con multiples vistas.
- Edicion de video y rotoscopia: aplicar profundidad fotograma a fotograma facilita mascaras de separacion de planos y efectos de perspectiva sobre metraje existente, con el modelo ejecutandose en local en el equipo de edicion.
- Asistencia a personas con discapacidad visual: la estimacion de profundidad en un dispositivo movil permite generar avisos de proximidad de obstaculos en tiempo real sin enviar imagenes a la nube.
- Inspeccion industrial y agricultura de precision: la profundidad monocular aporta informacion de volumen y distancia para estimar tamano de frutos, altura de cultivos o separacion de piezas en lineas de produccion con camaras convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (AbsRel, RMSE, δ1 u otros) en la informacion disponible. La model card unicamente incluye mediciones de latencia y memoria pico por dispositivo, recogidas sobre el runtime ONNX. La tabla siguiente reproduce esas mediciones; la model card original esta truncada y la ultima fila aparece incompleta.

| Precisión | Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|
| float | Snapdragon X2 Elite | 19,031 | 5 - 5 | NPU |
| float | Snapdragon X Elite | 49,006 | 48 - 48 | NPU |
| float | Snapdragon 8 Gen 3 Mobile | 35,744 | 0 - 472 | NPU |
| float | Snapdragon 8 Gen 1 Mobile | 85,977 | 1 - 477 | NPU |
| float | Dragonwing IQ-8275 | 56,745 | 3 - 9 | NPU |
| float | Dragonwing QCS8550 (Proxy) | 47,619 | 0 - 55 | NPU |
| float | QCS8450 | 85,977 | 1 - 477 | NPU |
| float | Dragonwing IQ-9075 | 55,360 | 3 - 9 | NPU |
| float | Dragonwing IQ-X7181 | 49,006 | 48 - 48 | NPU |
| float | Dragonwing Q-8750 | 24,379 | 2 - 365 | NPU |
| float | Snapdragon 8 Elite Mobile | 24,379 | 2 - 365 | NPU |
| float | Snapdragon 8 Elite Gen 5 Mobile | 18,575 | 2 - 371 | NPU |
| w8a16 | Snapdragon X2 Elite | 12,197 | 4 - 4 | NPU |
| w8a16 | Snapdragon X Elite | 27,767 | 27 - 27 | NPU |
| w8a16 | Snapdragon 8 Gen 3 Mobile | 19,060 | 3 - 511 | NPU |
| w8a16 | Snapdragon 8 Gen 1 Mobile | 39,161 | 3 - 513 | NPU |
| w8a16 | Dragonwing QCS6490 | 107,401 | 2 - 5 | NPU |
| w8a16 | Dragonwing IQ-8275 | 25,031 | 2 - 6 | NPU |
| w8a16 | Dragonwing QCS8550 (Proxy) | 27,113 | 0 - 33 | NPU |
| w8a16 | QCS8450 | 39,161 | 3 - 513 | NPU |
| w8a16 | Dragonwing IQ-9075 | 27,454 | 2 - 5 | NPU |
| w8a16 | Dragonwing IQ-X7181 | 27,767 | 27 - 27 | NPU |
| w8a16 | Dragonwing Q-6690 | 301,619 | 0 - 641 | NPU |
| w8a16 | Dragonwing Q-7790 | 35,807 | 3 - 612 | NPU |
| w8a16 | Dragonwing Q-8750 | 14,089 | 3 - 421 | NPU |
| w8a16 | Snapdragon 8 Elite Mobile | 14,089 | 3 - 421 | NPU |

Conclusiones derivadas de los datos medidos: la cuantizacion w8a16 reduce la latencia entre un 36 % y un 51 % segun el dispositivo (por ejemplo, de 19,031 a 12,197 ms en X2 Elite, de 49,006 a 27,767 ms en X Elite y de 35,744 a 19,060 ms en Snapdragon 8 Gen 3). El dispositivo mas lento de la tabla es Dragonwing Q-6690 con 301,619 ms en w8a16, dos ordenes de magnitud por encima del mas rapido.

## Requisitos de hardware

- VRAM para inferencia en GPU: no hay cifra oficial; a partir del tamano del checkpoint en float (94,3 MB) y de 24,7 M de parametros, la inferencia en FP32 requiere aproximadamente 0,4-0,5 GB de VRAM, incluyendo pesos y activaciones a 518x518. La version w8a16 reduce los pesos a la mitad.
- Compatibilidad con GPU de consumo: si, cualquier GPU con 2 GB o mas de memoria puede ejecutarlo; no requiere GPU de datacenter.
- GPU recomendadas para desarrollo: no se especifican; el perfilado oficial se ha realizado exclusivamente sobre NPU de Qualcomm. Para escritorio, una RTX 3060 o superior es mas que suficiente por tamano de modelo.
- Hardware objetivo de produccion: NPU de Snapdragon 8 Gen 1, 8 Gen 3, 8 Elite, 8 Elite Gen 5, X Elite y X2 Elite; Dragonwing IQ-8275, IQ-9075, IQ-X7181, Q-6690, Q-7790, Q-8750, QCS6490, QCS8550 y QCS8450; QCS8450.
- Memoria pico medida: desde 4 MB (w8a16 en X2 Elite) hasta 641 MB (w8a16 en Q-6690), segun el chipset.
- Latencia medida: entre 12,197 ms (w8a16 en X2 Elite) y 301,619 ms (w8a16 en Q-6690); entre 18,575 ms y 85,977 ms en las variantes float.
- Opciones de despliegue: ONNX Runtime (1.27.1) con assets ONNX float o w8a16; Qualcomm QAIRT 2.45 con assets QNN_DLC; TFLite (solo float); PyTorch mediante la implementacion de Hugging Face Transformers; exportacion a medida mediante la libreria Qualcomm AI Hub Models (v0.62.0).
- Throughput: no se ha publicado; solo se documenta la latencia por inferencia.

## Comparativa con modelos similares

La informacion proporcionada no incluye parametros, contexto ni metricas de precision de modelos alternativos, por lo que la comparacion disponible se limita a lo que si esta documentado: el propio repositorio de Qualcomm y su relacion con la implementacion de referencia.

| Modelo | Parametros | Tarea | Formatos de despliegue documentados | Licencia | Precision publicada |
|---|---|---|---|---|---|
| qualcomm/Depth-Anything (este repositorio) | 24,7 M | Estimacion de profundidad monocular | ONNX float/w8a16, QNN_DLC float/w8a16, TFLite float, PyTorch | MIT | No disponible |
| Depth-Anything original (arXiv:2401.10891) | No disponible en la informacion proporcionada | Estimacion de profundidad monocular | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible |
| Implementacion en Hugging Face Transformers | No disponible en la informacion proporcionada | Estimacion de profundidad monocular | PyTorch (implementacion de referencia) | No disponible en la informacion proporcionada | No disponible |
| Otros estimadores mononucleares (MiDaS, Depth-Anything V2, ZoeDepth, etc.) | No disponible | Estimacion de profundidad monocular | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para establecer una comparacion cuantitativa con alternativas; se recomienda consultar el articulo original para las metricas de precision y el leaderboard correspondiente para la comparacion entre modelos.

## Limitaciones y advertencias

- No se han publicado metricas de precision (AbsRel, RMSE, δ1) en la informacion disponible; no es posible evaluar la calidad del mapa de profundidad a partir de este repositorio.
- La model card no aclara si la salida es profundidad relativa o metrica; no debe asumirse que las distancias sean absolutas sin verificacion empirica.
- Modelo de vision pura: no procesa texto, no soporta tool calling, no tiene modo de razonamiento ni capacidades de agente.
- Idiomas soportados: no aplica; cualquier mención a idiomas en la ficha de Hugging Face es irrelevante para este modelo.
- Resolucion de entrada fija de 518x518 en la configuracion por defecto; usarla con otras relaciones de aspecto exige reexportar mediante AI Hub Models.
- Las mediciones de rendimiento corresponden a inferencia sobre NPU de Qualcomm con QAIRT 2.45 y ONNX Runtime 1.27.1; no son extrapolables a GPU, CPU ni a otros aceleradores.
- La tabla de rendimiento de la model card esta truncada, por lo que pueden existir dispositivos adicionales con mediciones no recogidas aqui.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existen artefactos tipicos de la estimacion monocular (bordes inconsistentes, ambiguedad en superficies reflectantes o sin textura, escalas incoherentes entre imagenes), que deben validarse en el dominio de despliegue concreto.
- Sesgos: no se documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de dominio (interiores frente a exteriores, tipos de escena o condiciones de iluminacion no representadas).
- Licencia MIT: permite uso comercial y modificacion con atribucion y sin garantia. Los SDK de Qualcomm utilizados para compilar y ejecutar los assets (QAIRT) tienen sus propias condiciones, que deben revisarse antes de distribuir un producto.
- La cuantizacion w8a16 reduce la latencia pero puede degradar la precision del mapa de profundidad; no se aporta ninguna comparacion de calidad float frente a w8a16 en la informacion disponible.
- Repositorio con solo 40 descargas y 3 likes en el momento de la consulta: la validacion por parte de la comunidad es muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qualcomm/Depth-Anything
- Articulo asociado (tag del repositorio): https://arxiv.org/abs/2401.10891
- Implementacion de referencia en Hugging Face Transformers: https://github.com/huggingface/transformers/tree/main/src/transformers/models/depth_anything
- Libreria Qualcomm AI Hub Models (Depth-Anything, v0.62.0): https://github.com/qualcomm/ai-hub-models/blob/v0.62.0/src/qai_hub_models/models/depth_anything
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/depth_anything
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro en Qualcomm AI Hub: https://myaccount.qualcomm.com/signup
- Assets preexportados ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/depth_anything/releases/v0.62.0/depth_anything-onnx-float.zip
- Assets preexportados ONNX w8a16: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/depth_anything/releases/v0.62.0/depth_anything-onnx-w8a16.zip
- Assets preexportados QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/depth_anything/releases/v0.62.0/depth_anything-qnn_dlc-float.zip
- Assets preexportados QNN_DLC w8a16: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/depth_anything/releases/v0.62.0/depth_anything-qnn_dlc-w8a16.zip
- Assets preexportados TFLite float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/depth_anything/releases/v0.62.0/depth_anything-tflite-float.zip
- Imagen de demostracion del modelo: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/depth_anything/web-assets/model_demo.png
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/
- Informacion corporativa de Qualcomm: https://www.qualcomm.com/company
- Relacion con inversores de Qualcomm: https://investor.qualcomm.com/overview/default.aspx

# shahriarhd/iranian-car-plate-recognition-yolov8

## Resumen

El modelo `shahriarhd/iranian-car-plate-recognition-yolov8` es un detector de objetos basado en la arquitectura YOLOv8n (la variante nano de Ultralytics) especializado en la deteccion y lectura de matricula de vehiculos iranies. Lo desarrolla el usuario de HuggingFace shahriarhd y resuelve un problema muy concreto de vision por computador: localizar la placa del vehiculo y, en la misma pasada, clasificar los digitos persas y las letras que la componen, ademas de marcadores especiales como taxi, policia o discapacidad. Con 3.029.243 parametros (aproximadamente 3 millones), es un modelo extremadamente ligero pensado para inferencia en tiempo real en dispositivos de borde.

Su relevancia actual radica en que el reconocimiento automatico de matriculas (ALPR/ANPR) para el alfabeto persa es un nicho poco cubierto por los modelos genericos, que suelen entrenarse con caracteres latinos. Este modelo cubre ese hueco con una unica red de 41 clases que combina deteccion de placa y reconocimiento de caracteres, y ofrece artefactos exportados a ONNX y NCNN listos para desplegar en navegador, Raspberry Pi o sistemas embebidos. La licencia MIT y el reducido tamano del repositorio (0,1 GB) facilitan su integracion en productos comerciales.

El modelo se publico en noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes en HuggingFace, por lo que se trata de un artefacto reciente y sin validacion comunitaria amplia. No es un modelo de lenguaje: no genera texto ni razona, sino que produce cajas delimitadoras y etiquetas de clase sobre imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (detector de objetos de una etapa, CNN) |
| Parametros totales | 3.029.243 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible de forma explicita; se ofrecen pesos PyTorch, SafeTensors, ONNX y NCNN (este ultimo suele implicar cuantizacion int8 en el flujo de exportacion, pero el autor no lo detalla) |
| Idiomas soportados | persa (fa) y ingles (en) en la documentacion; el reconocimiento de caracteres cubre digitos y letras persas |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best.pt`), SafeTensors (`model.safetensors`), ONNX (`iran_lpr_yolov8_640.onnx`), NCNN (`ncnn_640/` y `ncnn_320/`) |

## Arquitectura y entrenamiento

La arquitectura es YOLOv8n, un detector de objetos de una sola etapa con backbone CNN y cabecera de deteccion sin anclas (anchor-free), tal como la implementa Ultralytics. El modelo resuelve en una sola inferencia dos tareas acopladas: la localizacion de la placa (clase `plate`) y la clasificacion de los caracteres y simbolos que aparecen dentro de ella, con un total de 41 clases que incluyen 10 digitos, 24 letras persas y 5 marcadores especiales (`taxi`, `disabled`, `police`, `D`, `S`, `protocol`). Esta formulacion convierte el reconocimiento de matricula en un problema de deteccion multi-clase en lugar de requerir un pipeline separado de deteccion y OCR.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el numero de imagenes ni si se aplicaron tecnicas de aumento de datos, destilacion o ajuste fino a partir de pesos preentrenados en COCO. Tampoco se documenta si hubo entrenamiento con perdidas especificas para el orden secuencial de los caracteres de la matricula. El autor proporciona variantes exportadas a 640x640 y 320x320, lo que sugiere entrenamiento o exportacion a esas resoluciones de entrada.

## Capacidades

- Deteccion de placas de matricula de vehiculos iranies con una caja delimitadora (clase `plate`).
- Reconocimiento de digitos persas del 0 al 9 en el interior de la placa.
- Reconocimiento de 24 letras del alfabeto persa (alef, be, pe, te, se, jim, dal, sin, shin, sad, ta, za, ein, fe, ghaf, kaf, gaf, lam, mim, noon, vav, he, ye, ze).
- Deteccion de marcadores especiales de matricula: taxi, vehiculo de discapacidad, policia, y los indicadores `D`, `S` y `protocol`.
- Inferencia en tiempo real en CPU y dispositivos de borde gracias al tamano nano del modelo.
- Exportacion a ONNX para ejecucion en navegador mediante ONNX Runtime Web o WebAssembly.
- Exportacion a NCNN para Raspberry Pi y sistemas embebidos, con variante rapida a 320x320 para Raspberry Pi 3/4/5.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de vision por computador.

## Casos de uso

- Control de acceso en parkings y garajes: el modelo detecta la placa y lee sus caracteres en una sola pasada, lo que permite comparar la matricula leida con una lista blanca y abrir la barrera sin necesidad de un OCR adicional; su tamano de 3 millones de parametros permite ejecutarlo en la propia camara o en un mini-PC junto a la entrada.
- Peajes y viabilidad urbana: integrado en camaras de carril, identifica matriculas iranies en tiempo real y alimenta un sistema de tarificacion o de control de trafico; la variante ONNX a 640x640 ofrece el equilibrio entre precision y latencia para servidores modestos.
- Vigilancia y seguridad en aparcamientos: deteccion de vehiculos con marcadores especiales (`police`, `taxi`, `disabled`) para estadisticas de ocupacion o para alertas de acceso no autorizado en zonas reservadas.
- Analitica de flotas y logistica: registro automatico de entradas y salidas de vehiculos en almacenes o centros de distribucion, con lectura de matricula para conciliacion de hojas de ruta; la licencia MIT elimina friccion para uso comercial interno.
- Despliegue en Raspberry Pi para smart cities: la variante NCNN a 320x320 esta pensada explicitamente para Raspberry Pi 3/4/5, lo que permite montar un lector de matriculas de bajo coste en farolas, garitas o puntos de control remotos sin conexion a la nube.
- Aplicacion web de demostracion o prototipado: el modelo ONNX se ejecuta en el navegador con ONNX Runtime Web, util para validar la deteccion sobre imagenes subidas por el usuario sin enviar datos a un servidor, lo que simplifica el cumplimiento de privacidad.
- Investigacion en ALPR para alfabetos no latinos: sirve como linea base ligera para comparar tecnicas de reconocimiento de matriculas persas y para experimentar con aumento de datos o destilacion hacia modelos aun mas pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la metrica `mAP` en la lista de metricas, pero no proporciona valores numericos, ni curvas de precision-recall, ni comparaciones con otros detectores. Tampoco se documentan latencias medidas ni throughput en los distintos formatos de exportacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo de 3 millones de parametros; en la practica puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no requiere GPU; funciona en CPU moderna. En caso de usar GPU, cualquier tarjeta con al menos 2 GB de memoria (GTX 1050, RTX 3050 o superior) es mas que suficiente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo, e incluso en iGPU y en aceleradores de borde.
- Dispositivos de borde: Raspberry Pi 3/4/5 mediante la exportacion NCNN a 320x320; tambien es apto para Coral, Jetson Nano o moviles con runtime NCNN/ONNX.
- Opciones de despliegue: Ultralytics (PyTorch), ONNX Runtime (escritorio y navegador via ONNX Runtime Web/WebAssembly), NCNN (Raspberry Pi y embebidos). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput estimados: no disponibles. El autor no publica tiempos de inferencia por plataforma; la variante a 320x320 se presenta como "ultra rapida" para Raspberry Pi 3/4/5, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shahriarhd/iranian-car-plate-recognition-yolov8 | 3,03 M | Deteccion de placa + caracteres persas (41 clases) | no aplica | MIT | HuggingFace, formatos PT/SafeTensors/ONNX/NCNN |
| YOLOv8n estandar (Ultralytics) | ~3,2 M | Deteccion de objetos genericos (COCO, 80 clases) | no aplica | AGPL-3.0 (o comercial) | Ultralytics, ampliamente disponible |
| YOLOv8s estandar (Ultralytics) | ~11,2 M | Deteccion de objetos genericos (COCO, 80 clases) | no aplica | AGPL-3.0 (o comercial) | Ultralytics, ampliamente disponible |
| Modelos ALPR genericos con OCR latino | variable | Deteccion de placa + OCR latino | no aplica | variable | variable |

La comparacion directa con otros modelos ALPR para matriculas persas no esta disponible en la informacion proporcionada. Frente a YOLOv8n estandar, este modelo comparte arquitectura y orden de magnitud de parametros, pero sustituye las 80 clases de COCO por 41 clases especificas de matriculas iranies, y anade la licencia MIT, mas permisiva que la AGPL-3.0 de Ultralytics.

## Limitaciones y advertencias

- Modelo de vision especializado: no genera texto ni mantiene conversaciones; cualquier expectativa de uso como LLM es incorrecta.
- Sesgo de dominio: entrenado exclusivamente para matriculas iranies; el rendimiento en matriculas de otros paises o en alfabetos latinos no esta documentado y probablemente sea deficiente.
- Sin datos de validacion publicos: no hay mAP, precision, recall ni matriz de confusion publicados, por lo que no es posible estimar su fiabilidad en produccion sin una evaluacion propia.
- Riesgo de falsos positivos y negativos en condiciones adversas (iluminacion nocturna, placas sucias, angulos oblicuos, motion blur) no cuantificado por el autor.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la ficha; el modelo es reciente y no ha sido contrastado por terceros.
- Idiomas: la lectura de caracteres se limita al alfabeto persa; la etiqueta `en` de la model card hace referencia a la documentacion, no a capacidad de reconocimiento en ingles.
- Licencia MIT: permite uso comercial y modificacion con atribucion; conviene conservar el aviso de copyright original.
- Dependencia del ecosistema Ultralytics para el formato `.pt`: verificar la compatibilidad de la version de la libreria con la que se exportaron los pesos antes de desplegar.
- No se documenta el proceso de anonimizacion del dataset de entrenamiento ni el cumplimiento de normativas de privacidad (RGPD y equivalentes), aspecto relevante al procesar imagenes de vehiculos y posibles datos personales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shahriarhd/iranian-car-plate-recognition-yolov8
- Repositorio de Ultralytics YOLOv8 (framework base): https://github.com/ultralytics/ultralytics
- Documentacion de Ultralytics: https://docs.ultralytics.com/
- ONNX Runtime: https://onnxruntime.ai/
- NCNN (Tencent): https://github.com/Tencent/ncnn
- No se han encontrado en la informacion proporcionada papers, blogs ni demos adicionales del autor.

# chenmohan/web-sdk-pp-rotated-detection

## Resumen

El modelo `chenmohan/web-sdk-pp-rotated-detection` es una exportacion a ONNX de un detector de objetos con cajas rotadas (oriented bounding boxes) pensado para ejecutarse en el navegador mediante WebGPU y WebAssembly. Segun la model card, se trata concretamente de PP-YOLOE-R-s a 1024 px en FP32, orientado a deteccion rotada sobre imagenes de teledeteccion de un unico fotograma con las 15 clases de DOTA. El artefacto ONNX ocupa 33.161.415 bytes.

El repositorio lo mantiene chenmohan y no la cuenta oficial de Paddle, algo que el propio autor explicita tanto en la version china como en la inglesa de la model card. Su interes practico esta en el objetivo de despliegue: un detector de cajas orientadas que se puede ejecutar integramente en el cliente, sin backend de inferencia, algo poco habitual en el ecosistema de teledeteccion, donde lo normal es servir modelos con frameworks de servidor.

La relevancia es, por tanto, de nicho pero clara para quien construye herramientas web de anotacion, preetiquetado o demostracion sobre imagenes aereas. Como contrapartida, la informacion publicada es muy escasa: cero descargas y cero likes en el momento de la consulta, sin datos de entrenamiento, sin parametros declarados y sin resultados de evaluacion en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PP-YOLOE-R (familia PP-YOLOE de PaddleDetection), variante "s" a 1024 px; el backbone, el neck y la cabeza no se detallan en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision); no disponible |
| Tipos de cuantizacion | FP32 (ONNX); no se documentan exportaciones FP16, INT8 ni GGUF |
| Idiomas soportados | no aplica / no disponible |
| Licencia | Apache-2.0 (adoptada de la licencia del proyecto fijado y de la tabla de modelos; no se localizo un texto de licencia especifico para los pesos) |
| Formato de pesos | ONNX (preparado para WebGPU y WASM en navegador) |
| Resolucion de entrada | 1024 px (segun la model card) |
| Numero de clases | 15 clases de DOTA |
| Tamano del artefacto | 33.161.415 bytes (ONNX FP32) |
| Tarea (pipeline) | object-detection, subtipo rotated-object-detection |
| Fecha de publicacion | 18 de septiembre de 2026 |

## Arquitectura y entrenamiento

La model card identifica el modelo como PP-YOLOE-R-s a 1024 px en FP32, convertido a ONNX. PP-YOLOE-R es la variante de la familia PP-YOLOE de PaddleDetection especializada en deteccion de objetos con cajas rotadas. La ficha no documenta ni el backbone, ni el neck, ni el mecanismo de asignacion de etiquetas, ni la estrategia de representacion del angulo, por lo que cualquier detalle adicional sobre la arquitectura no puede confirmarse con la informacion disponible.

Tampoco hay informacion sobre el entrenamiento: no se indica el numero de tokens ni de imagenes, la composicion del dataset mas alla de la referencia a DOTA15, el numero de epocas, si hubo aumento de datos, ni si se aplicaron tecnicas de ajuste fino como RLHF o DPO (no aplicables a un detector). La model card menciona explicitamente que cubre la procedencia, la conversion y el alcance de verificacion en escritorio, y remite a los ficheros LICENSE y NOTICE del repositorio para los limites de uso, pero no reproduce esos contenidos en el texto indexado.

## Capacidades

- Deteccion de objetos con cajas rotadas (oriented bounding boxes) sobre imagenes de teledeteccion de un unico fotograma.
- Prediccion sobre 15 clases del conjunto DOTA, segun la model card.
- Inferencia en el navegador mediante WebGPU y, en su defecto, WASM, al distribuirse en formato ONNX.
- Salida con orientacion: al tratarse de deteccion rotada, las cajas incluyen un angulo, lo que permite ajustar objetos alargados o alineados de forma no paralela a los ejes de la imagen.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas: es un modelo exclusivamente de vision.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingues (no aplica a un detector).
- No se documenta segmentacion, OCR, vision multimodal generativa ni modo "thinking".
- No se documenta entrenamiento o ajuste adicional del autor mas alla de la conversion y el empaquetado descritos.

## Casos de uso

- Preetiquetado en herramientas de anotacion web: el modelo puede ejecutarse en el propio navegador del anotador y proponer cajas rotadas sobre cada fotograma, reduciendo el trabajo manual de dibujar poligonos orientados antes de la revision humana.
- Demos interactivas sin backend: al distribuirse en ONNX con soporte WebGPU y WASM, permite publicar una pagina estatica donde el usuario arrastra una imagen aerea y obtiene detecciones sin desplegar servidores de inferencia.
- Procesado con privacidad de datos: en escenarios con imagenes sensibles (infraestructura critica, imagenes comerciales de satelite), la inferencia local en el cliente evita enviar el fotograma a un servicio externo.
- Deteccion de embarcaciones y actividad portuaria: las clases habituales de DOTA incluyen barcos y puertos, de modo que el modelo puede usarse para inventariar atraques y trafico maritimo en ortofotos o imagenes de satelite.
- Inventario de infraestructura viaria y de transporte: con clases como puentes, rotondas, vehiculos grandes y pequenos, sirve para extraer recuentos y localizaciones sobre mosaicos de mapas.
- Analisis de instalaciones deportivas y de ocio: las clases de DOTA cubren piscinas, pistas de tenis, campos de futbol y canchas de baloncesto, utiles en estudios urbanisticos o de planificacion.
- Prototipado e investigacion en teledeteccion: sirve como linea base reproducible en formato ONNX para comparar con otros detectores rotados sin depender del ecosistema Paddle en el servidor.
- Operacion en campo sin conectividad: la ruta WASM permite ejecutar la deteccion en equipos modestos o navegadores sin aceleracion por GPU, util en inspecciones con dron y puesto de control en el terreno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de mAP, precision, recall ni comparaciones con otros detectores, y la busqueda web realizada no aporto ningun resultado relacionado con el modelo.

## Requisitos de hardware

- El artefacto ONNX FP32 ocupa 33.161.415 bytes, por lo que el peso del modelo es reducido en terminos de almacenamiento; al tratarse de FP32, la memoria necesaria para los pesos es del orden de decenas de megabytes, muy por debajo de cualquier GPU de servidor.
- El consumo real de memoria dependera de las activaciones a 1024 px de resolucion de entrada; no se proporcionan medidas de VRAM ni de RAM en la informacion disponible.
- Al estar orientado a WebGPU y WASM, el objetivo declarado es la ejecucion en el cliente: cualquier GPU integrada o discreta con soporte WebGPU (por ejemplo, navegadores Chromium recientes) es candidata, sin que la ficha detalle modelos concretos.
- Cabe en GPU de consumo: si, por el tamano del artefacto y por el modo de despliegue previsto; no se requieren aceleradores tipo A100 o H100 para la inferencia en navegador.
- Opciones de despliegue documentadas: inferencia en navegador mediante WebGPU y WASM. En servidor seria tecnicamente posible con ONNX Runtime u otros ejecutores de ONNX, pero el autor no lo documenta.
- No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de vision de este tipo.
- No se publican datos de latencia ni de throughput (imagenes por segundo) para ninguna plataforma.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos comparativos de ningun tipo. La tabla siguiente recoge alternativas de la misma categoria funcional (deteccion de objetos rotados) y marca como "no disponible" todo aquello que no puede confirmarse con las fuentes consultadas. Los datos de licencia de las alternativas proceden de conocimiento general y no se han verificado en esta busqueda.

| Modelo | Tarea | Parametros | Resolucion de entrada | Licencia | Ejecucion en navegador (ONNX/WebGPU) |
|---|---|---|---|---|---|
| chenmohan/web-sdk-pp-rotated-detection | Deteccion rotada, 15 clases DOTA | no disponible | 1024 px | Apache-2.0 | Si, es el objetivo declarado |
| PP-YOLOE-R-s original (PaddleDetection) | Deteccion rotada | no disponible | configurable, habitualmente 1024 px | Apache-2.0 (conocimiento general) | no disponible |
| RTMDet-R (MMRotate) | Deteccion rotada | no disponible | configurable | Apache-2.0 (conocimiento general) | no disponible |
| YOLOv8-OBB (Ultralytics) | Deteccion rotada | no disponible | configurable | AGPL-3.0 con licencia comercial alternativa (conocimiento general) | no disponible |

No se dispone de datos de rendimiento de ninguna de estas alternativas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Procedencia no oficial: el repositorio lo mantiene chenmohan y no la cuenta oficial de Paddle, tal como advierte el propio autor. No debe tratarse como una publicacion canonica del proyecto PP-YOLOE-R.
- Ambiguedad de licencia: la ficha indica que Apache-2.0 se adopta a partir de la licencia del proyecto fijado y de la tabla de modelos, y que no se ha encontrado un texto de licencia especifico para los pesos. Antes de un uso comercial conviene revisar los ficheros LICENSE y NOTICE del repositorio.
- Ausencia total de evaluacion: no hay mAP ni ninguna otra metrica publicada, ni validacion independiente. No hay evidencia en la informacion disponible de que el modelo funcione correctamente fuera del alcance de verificacion en escritorio que menciona el autor.
- Falta de detalle de entrenamiento: sin informacion sobre dataset, numero de imagenes, epocas ni procedimiento de conversion, no es posible evaluar el riesgo de sobreajuste ni de deriva respecto al modelo original.
- Dominio restringido: es un detector de un solo fotograma sobre imagenes de teledeteccion con 15 clases de DOTA. No es un modelo de proposito general y no se ha documentado su comportamiento en fotografia convencional, escenas interiores o video.
- Sin informacion sobre sesgos: no se documentan sesgos geograficos, de sensor ni de resolucion, un aspecto relevante en teledeteccion, donde el rendimiento suele degradarse al cambiar de sensor o de region.
- Riesgo de alucinacion en el sentido de detecciones espurias: no hay umbrales de confianza recomendados ni curvas de precision-recall publicadas, por lo que el ajuste del umbral queda a criterio del integrador.
- Inconsistencia en los metadatos: la plataforma declara un tamano de repositorio de 0.0 GB, mientras que la model card indica 33.161.415 bytes para el ONNX. Conviene verificar los ficheros reales antes de integrar.
- Dependencia de WebGPU para el mejor rendimiento: la ruta WASM es mas lenta y la disponibilidad de WebGPU depende del navegador y del sistema operativo, lo que limita el alcance en clientes antiguos.
- Sin datos de cuantizacion: al distribuirse solo en FP32, no hay versiones optimizadas para movil o para entornos con memoria muy ajustada.
- Adopcion nula en el momento de la consulta: cero descargas y cero likes, sin senales de uso en produccion por terceros.
- Los resultados de la busqueda web no guardan ninguna relacion con el modelo (corresponden a un restaurante en Nairobi), por lo que no aportan validacion externa de ningun tipo.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/chenmohan/web-sdk-pp-rotated-detection
- Model card en chino, referenciada por el autor: ppyoloe-r-s-1024/0.1.0/README.md (ruta relativa dentro del repositorio de HuggingFace)
- Model card en ingles, referenciada por el autor: ppyoloe-r-s-1024/0.1.0/README.en.md (ruta relativa dentro del repositorio de HuggingFace)
- Ficheros LICENSE y NOTICE del repositorio: mencionados en la model card como fuente de los terminos y limites de uso; no se ha podido verificar su contenido en la informacion disponible.
- Paper, blog oficial, repositorio de codigo o demo: no disponible en la informacion proporcionada.
- Resultados de la busqueda web: ninguno relevante; los enlaces devueltos corresponden a un establecimiento de restauracion en Nairobi sin relacion con el modelo.

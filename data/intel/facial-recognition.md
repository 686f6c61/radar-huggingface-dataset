# Intel/facial-recognition

## Resumen

Intel/facial-recognition es un caso de uso publicado por Intel en Hugging Face que implementa un pipeline de deteccion y re-identificacion facial sobre OpenVINO. No se trata de un modelo unico entrenado por Intel para esta publicacion, sino de una composicion de dos modelos del Open Model Zoo: face-detection-adas-0001 (detector SSD de caras) y face-reidentification-retail-0095 (extractor de embeddings faciales de 256 dimensiones). El repositorio empaqueta scripts de descarga, ejemplos de inferencia y documentacion para desplegar el pipeline en CPU, GPU o NPU de Intel.

El objetivo es ofrecer una base reproducible para analitica de video (caso "Metro Analytics") orientada a control de acceso, identificacion de personas conocidas, busqueda forense y registro de asistencia. La comparacion entre embeddings se realiza mediante similitud coseno, con un umbral de coincidencia configurable (0.5 en el ejemplo), y la integracion con Intel DLStreamer se hace a traves de los elementos `gvadetect` y `gvaclassify`.

Es relevante ahora porque ejemplifica el patron de despliegue de vision por computador en el edge con OpenVINO, incluyendo soporte declarado para NPU y validacion en CPU, GPU y NPU. La licencia MIT y el formato OpenVINO IR facilitan su incorporacion en productos, aunque el stack de referencia indicado en la model card es una version de desarrollo (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0 dev), no una release estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: SSD (face-detection-adas-0001) + CNN compacta (face-reidentification-retail-0095) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no generativo) |
| Tipos de cuantizacion | FP32, FP16 (precisiones soportadas declaradas); el script de ejemplo descarga FP16 |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (.xml + .bin); modelos originales en Caffe / PyTorch del Open Model Zoo |

## Arquitectura y entrenamiento

El pipeline encadena un detector y un extractor de caracteristicas. face-detection-adas-0001 es un detector basado en SSD optimizado para camaras de automocion y vigilancia, con entrada de 384x672 y salida de cajas delimitadoras con puntuacion de confianza. Sobre cada recorte facial, face-reidentification-retail-0095, una CNN compacta, produce un vector de embedding de 256 dimensiones; la identidad se decide por similitud coseno entre el embedding de la cara y los embeddings de una galeria de personas enroladas.

No se proporcionan en la informacion disponible datos sobre volumen de entrenamiento, composicion del dataset, ni si se aplicaron tecnicas de RLHF/DPO (no aplicables a este tipo de modelo). El repositorio incluye un script `export_and_quantize.sh` que descarga los modelos en FP16 desde el Open Model Zoo y un video de prueba, y el ejemplo de inferencia muestra el flujo completo de deteccion, recorte, embedding, enrolamiento y anotacion de resultados sobre video.

## Capacidades

- Deteccion de caras humanas en imagenes y video con umbral de confianza configurable (0.6 en el ejemplo).
- Extraccion de embeddings faciales de 256 dimensiones para cada cara detectada.
- Re-identificacion por similitud coseno contra una galeria, con umbral de coincidencia configurable (0.5 en el ejemplo).
- Enrolamiento automatico de nuevas identidades con asignacion de ID numerico.
- Ejecucion en CPU, GPU integrada y NPU de Intel mediante el selector de dispositivo de OpenVINO Runtime.
- Integracion con Intel DLStreamer mediante los elementos `gvadetect` y `gvaclassify`.
- Capacidades multilingues: no aplica; el modelo procesa imagen, no texto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, vision generativa, audio): no disponible.

## Casos de uso

- Control de acceso en instalaciones: el pipeline compara la cara capturada por una camara con una galeria de empleados o personal autorizado y decide la coincidencia por similitud coseno con umbral configurable, lo que permite automatizar la apertura de puertas o el registro de entradas.
- Identificacion de personas conocidas en una multitud: el detector localiza multiples caras por fotograma y el extractor de embeddings permite reconocer individuos previamente enrolados en eventos o espacios publicos, con anotacion de ID sobre el video de salida.
- Busqueda y analisis forense: dado un sujeto de interes, se puede enrolar su embedding y rastrear su aparicion en multiples grabaciones, aprovechando la ligereza del modelo para procesar archivos de video en CPU sin GPU dedicada.
- Registro de asistencia: el enrolamiento automatico con ID persistente permite registrar entradas y salidas de personas en un recinto a partir de flujos de camara, generando trazas temporales por identidad.
- Despliegue en el edge con aceleracion NPU: al ejecutarse sobre OpenVINO en NPU o GPU integrada de Intel, el pipeline es adecuado para dispositivos de vigilancia o kioscos sin acelerador dedicado, reduciendo coste y consumo.
- Integracion en pipelines de analitica de video con DLStreamer: los elementos `gvadetect` y `gvaclassify` permiten insertar deteccion y re-identificacion en cadenas GStreamer existentes, combinables con otras etapas de analitica (conteo, seguimiento, metadatos).
- Prototipado y evaluacion de sistemas biometricos: la licencia MIT y los scripts de descarga facilitan montar un banco de pruebas reproducible para medir umbrales, tasas de falsos positivos y comportamiento en distintos dispositivos antes de pasar a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los modelos son de tipo edge y se ejecutan en CPU, GPU integrada o NPU; el ejemplo usa FP16, pero no se especifica el peso exacto en memoria.
- GPU recomendadas: no se listan modelos concretos; la model card declara soporte para CPU, GPU y NPU mediante OpenVINO Runtime, con una matriz de validacion de dispositivos referenciada pero no incluida en la informacion.
- Compatibilidad con GPU de consumo: no disponible. Al ser un pipeline ligero de vision, es plausible su ejecucion en hardware integrado Intel, pero no hay mediciones publicadas en la informacion proporcionada.
- Opciones de despliegue: OpenVINO Runtime (API Python, con `core.compile_model` y seleccion de dispositivo "CPU", "GPU" o "NPU"); Intel DLStreamer con `gvadetect` y `gvaclassify`; los modelos se obtienen del Open Model Zoo mediante el script incluido.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Intel/facial-recognition | Pipeline deteccion + re-ID facial (OpenVINO) | no disponible | no aplica | MIT | Hugging Face, Open Model Zoo |
| face-detection-adas-0001 | Detector SSD de caras | no disponible | no aplica | no disponible en la informacion | Open Model Zoo |
| face-reidentification-retail-0095 | Extractor de embeddings faciales | no disponible | no aplica | no disponible en la informacion | Open Model Zoo |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones detalladas de alternativas comparables de otros autores, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- El modelo trata datos biometricos: su despliegue exige cumplimiento de normativa aplicable (RGPD en la UE, BIPA en Illinois y equivalentes) y mecanismos de consentimiento adecuados, tal como advierte la propia model card.
- No se han publicado metricas de precision, tasa de falsos positivos/negativos ni robustez ante condiciones de iluminacion, oclusion, angulo o resolucion; no es posible evaluar su fiabilidad en produccion con los datos disponibles.
- El detector esta optimizado para camaras de automocion y vigilancia con entrada de 384x672; caras muy pequenas, giradas o parcialmente ocluidas pueden degradar la deteccion.
- La re-identificacion depende de un umbral de similitud coseno fijado manualmente (0.5 en el ejemplo); un umbral inadecuado incrementa falsos positivos o falsos negativos, y no hay guia publicada para calibrarlo.
- El idioma declarado es unicamente "en" en los metadatos, aunque al ser un modelo de vision el impacto practico de este campo es limitado.
- El stack de referencia indicado es una version de desarrollo (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0 dev), no una release estable; conviene validar versiones antes de desplegar.
- El repositorio tiene un tamano de 0.0 GB y no incluye los pesos en si: es necesario ejecutar el script de descarga contra el Open Model Zoo, lo que anade una dependencia externa.
- Riesgo de sesgo: no hay informacion publicada sobre la demografia de los datos de entrenamiento ni sobre el rendimiento diferencial por grupo, un aspecto critico en sistemas de reconocimiento facial.
- La licencia del repositorio es MIT, pero las condiciones de los modelos base del Open Model Zoo deben verificarse por separado antes de un uso comercial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Intel/facial-recognition
- face-detection-adas-0001 (Open Model Zoo): https://docs.openvino.ai/2024/omz_models_model_face_detection_adas_0001.html
- face-reidentification-retail-0095 (Open Model Zoo): https://docs.openvino.ai/2024/omz_models_model_face_reidentification_retail_0095.html
- Instalacion de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Instalacion de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- Pagina principal de Intel: https://www.intel.com/content/www/us/en/homepage.html
- Centro de descargas de Intel: https://www.intel.fr/content/www/fr/fr/download-center/home.html

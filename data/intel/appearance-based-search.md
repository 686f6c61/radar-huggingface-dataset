# Intel/appearance-based-search

## Resumen

Appearance-Based Search es un caso de uso de analitica para entornos metro (transporte publico, retail, videovigilancia) publicado por Intel en Hugging Face bajo el identificador `Intel/appearance-based-search`. No es un modelo fundacional ni un transformer generativo: es una pipeline de vision por computador compuesta por dos modelos de Intel Open Model Zoo orquestados con OpenVINO y DLStreamer. El primero, `person-detection-retail-0013`, detecta personas en cada fotograma; el segundo, `person-attributes-recognition-crossroad-0230`, clasifica cada deteccion con ocho atributos binarios de apariencia (genero, bolso, mochila, sombrero, manga larga, pantalon largo, pelo largo y abrigo/chaqueta).

El problema que resuelve es concreto: localizar en un video a todas las personas cuya apariencia visible coincide con una descripcion textual estructurada, sin necesidad de una foto de referencia. El operador define una consulta como `{"is_male": True, "has_hat": True}` y la pipeline resalta unicamente a quienes cumplen todos los atributos solicitados. Esto sustituye busquedas manuales sobre archivos de camaras por un filtrado automatico y explicable.

La relevancia actual es doble. Por un lado, demuestra un patron de despliegue de IA en el borde (edge AI) sobre CPU, GPU y NPU de Intel con OpenVINO, sin dependencia de GPUs de datacenter. Por otro, aborda un caso de uso sensible (reconocimiento de atributos biometricos-adyacentes) con una licencia MIT explicita y una advertencia de cumplimiento normativo (GDPR, BIPA) integrada en la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: detector de personas (Caffe, basado en SSD) + clasificador de atributos (PyTorch/Open Model Zoo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen; no es modelo de lenguaje) |
| Tipos de cuantizacion | FP32, FP16 |
| Idiomas soportados | en (etiquetas de atributos en ingles) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (.xml + .bin); modelos base descargados desde Open Model Zoo |
| Motor de inferencia | OpenVINO Runtime 2026.5.0.dev20261030 (bundle GenAI 2026.5.0.0.dev20261030) |
| Orquestacion | Intel DLStreamer 2026.3.0 RC1 |
| Hardware soportado | CPU, GPU, NPU de Intel |
| Clases detectadas | Personas (deteccion) + 8 atributos de apariencia |
| Atributos | `is_male`, `has_bag`, `has_backpack`, `has_hat`, `has_longsleeves`, `has_longpants`, `has_longhair`, `has_coat_jacket` |
| Capa de salida de atributos | `453` (8 valores binarios en ese orden) |
| Tamano del repo | 0.0 GB (pesos descargados en tiempo de ejecucion via script) |
| Descargas | 18 |
| Likes | 1 |
| Fecha de creacion | 2026-08-05 |
| Ultima actualizacion | 2026-11-10 |

## Arquitectura y entrenamiento

La pipeline es un clasico encadenado de deteccion y clasificacion. La etapa de deteccion usa `person-detection-retail-0013`, un detector de personas del Open Model Zoo originalmente en Caffe, orientado a escenas retail y de videovigilancia. La etapa de atributos usa `person-attributes-recognition-crossroad-0230`, un clasificador multi-etiqueta que, para cada recorte de persona, emite ocho valores binarios en la capa de salida `453`: `is_male`, `has_bag`, `has_backpack`, `has_hat`, `has_longsleeves`, `has_longpants`, `has_longhair` y `has_coat_jacket`. Cada atributo se umbraliza y se compara con la consulta del operador; solo se dibuja caja verde sobre las personas que satisfacen todos los atributos requeridos (los atributos omitidos en la consulta no se evaluan).

No se dispone de informacion sobre el numero de tokens, composicion del dataset de entrenamiento, ni sobre si hubo RLHF/DPO (no aplica a este tipo de modelo). La model card no documenta detalles de entrenamiento de los modelos base; remite a las fichas del Open Model Zoo de cada componente. La innovacion tecnica destacable no esta en los modelos en si, sino en el patron de despliegue: exportacion y cuantizacion a FP16 mediante `export_and_quantize.sh`, ejecucion sobre OpenVINO Runtime con seleccion de dispositivo por cadena (`CPU`, `GPU`, `NPU`), e integracion con DLStreamer para procesamiento de video en streaming. El stack objetivo es una release candidate (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0 dev), por lo que se trata de un entorno de desarrollo, no de una version estable.

## Capacidades

- Deteccion de personas en video frame a frame mediante `person-detection-retail-0013`.
- Clasificacion de ocho atributos binarios de apariencia por persona detectada.
- Busqueda por descripcion de atributos: consultas como `{"has_longhair": True}`, `{"is_male": True, "has_hat": True}` o `{"has_backpack": True}`, con semantica de requerir presencia (`True`), requerir ausencia (`False`) u omitir el atributo.
- Filtrado booleano AND: solo se marcan las personas que cumplen todos los atributos solicitados.
- Anotacion de resultados sobre el fotograma con mayor numero de coincidencias (caja verde por persona que cumple la consulta).
- Ejecucion en CPU, GPU y NPU de Intel mediante OpenVINO, con precisiones FP32 y FP16.
- Procesamiento de video con DLStreamer (muestreo de fotogramas, lectura de `test_video.mp4`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.
- No soporta vision generativa ni descripcion en lenguaje natural; la "consulta" es un diccionario de atributos predefinidos.
- Capacidad multilingue: no aplica; las etiquetas de atributos estan en ingles.

## Casos de uso

- Busqueda de personas de interes en grabaciones: un operador introduce una descripcion de testigo ("hombre con mochila y sombrero") como `{"is_male": True, "has_backpack": True, "has_hat": True}` y la pipeline recorre el archivo de video marcando solo a quienes cumplen los tres atributos, reduciendo el visionado manual a los fotogramas candidatos.
- Objetos perdidos: localizar a la persona que portaba una bolsa concreta consultando `{"has_bag": True}` sobre el intervalo temporal del incidente, y extraer el fotograma con mas coincidencias para revision humana.
- Analitica de retail: contar compradores con rasgos de apariencia especificos (por ejemplo, `{"has_backpack": True}`) a lo largo del dia para segmentar trafico o dimensionar campañas, agregando los conteos por franja horaria.
- Analitica de transporte publico: medir la proporcion de pasajeros con abrigo/chaqueta (`has_coat_jacket`) o manga larga (`has_longsleeves`) como proxy estacional, sobre el video de andenes o tornos.
- Triaje operativo sobre archivos de camaras: aplicar la consulta a un lote de clips para generar una lista corta de candidatos antes de la revision manual, aprovechando que el coste por fotograma es bajo en CPU/NPU y el filtrado es explicable (atributo a atributo).
- Despliegue en el borde sin GPU de datacenter: ejecutar la pipeline en equipos con CPU o NPU Intel en el propio emplazamiento (estacion, tienda, vagón), evitando enviar video a la nube y reduciendo requisitos de ancho de banda y de cumplimiento de retencion.
- Prototipado de sistemas de videoanalitica: usar el sample `openvino_sample.py` como plantilla para encadenar deteccion + clasificacion de atributos en un pipeline DLStreamer propio, cambiando solo la cadena de dispositivo (`CPU`, `GPU`, `NPU`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a una matriz de validacion de dispositivos (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU, pero no se incluyen cifras concretas de latencia ni throughput en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los modelos son ligeros (detector retail y clasificador de atributos de Open Model Zoo) y estan pensados para ejecucion en CPU/NPU, pero no se publican cifras de memoria.
- GPU recomendadas: no se especifican modelos concretos; la model card indica soporte de GPU Intel via OpenVINO. No se mencionan A100, H100 ni RTX 4090.
- Cabe en consumer GPU: no aplica como requisito; el objetivo es CPU, GPU integrada y NPU de Intel. No se documenta soporte de GPUs de consumo NVIDIA.
- Opciones de despliegue: OpenVINO Runtime (CPU, GPU, NPU), Intel DLStreamer 2026.3.0 RC1 para el pipeline de video, y el sample `openvino_sample.py` con OpenCV para lectura de video. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Requisitos de software: Python 3.11+, OpenVINO (ultima version), DLStreamer (ultima version), entorno virtual creado con `--system-site-packages`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Atributos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Intel/appearance-based-search | Pipeline deteccion + atributos (OpenVINO) | no disponible | no aplica | 8 atributos binarios | MIT | Hugging Face + Open Model Zoo |
| person-detection-retail-0013 (Open Model Zoo) | Detector de personas | no disponible | no aplica | solo deteccion | parte de Open Model Zoo | Open Model Zoo |
| person-attributes-recognition-crossroad-0230 (Open Model Zoo) | Clasificador de atributos | no disponible | no aplica | 8 atributos binarios | parte de Open Model Zoo | Open Model Zoo |
| Alternativas genericas de re-identificacion (p. ej. modelos de person re-ID) | Embeddings de apariencia | no disponible | no aplica | similitud con foto de referencia | variable | no disponible en la informacion proporcionada |

La diferencia clave frente a un modelo de re-identificacion por embedding es que aqui no se compara contra una foto de referencia, sino contra una descripcion de atributos explicitos, lo que hace el resultado auditable atributo a atributo. No se dispone de datos de rendimiento comparado entre estas opciones.

## Limitaciones y advertencias

- Solo ocho atributos binarios predefinidos: cualquier descripcion fuera de ese vocabulario (color de ropa, altura, complexión, calzado) no se puede consultar.
- No es un modelo de lenguaje ni un VLM: no acepta consultas en lenguaje natural ni genera descripciones; la consulta debe ser un diccionario con las claves exactas.
- Prevalencia limitada de etiquetas: atributos como `has_hat` o `has_coat_jacket` dependen del dominio de entrenamiento del clasificador base; no se documenta su precision por atributo.
- Riesgo de falsos positivos y negativos en la deteccion (oclusiones, personas parcialmente visibles, escalas pequenas) y en la clasificacion de atributos (angulos de camara, iluminacion, resolucion del recorte).
- Sesgos conocidos: no documentados en la model card; el atributo `is_male` es una clasificacion binaria de genero percibido, con los sesgos inherentes a esa categorizacion.
- Advertencia de privacidad explicita: el reconocimiento de atributos de apariencia procesa datos biometricos-adyacentes; el despliegue debe cumplir GDPR, BIPA y normativa aplicable, con consentimiento y politicas de retencion adecuadas.
- Stack en release candidate: DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0 dev no son versiones estables; no se recomienda para produccion sin validacion previa.
- Licencia MIT: permite uso comercial, pero la licencia del codigo no exime del cumplimiento normativo sobre datos personales.
- Idiomas: etiquetas y documentacion solo en ingles; no hay soporte multilingue.
- Repositorio con muy poca traccion (18 descargas, 1 like) y sin benchmarks publicados en la informacion disponible; la madurez del ecosistema de soporte es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Intel/appearance-based-search
- person-detection-retail-0013 (OpenVINO docs): https://docs.openvino.ai/2024/omz_models_model_person_detection_retail_0013.html
- person-attributes-recognition-crossroad-0230 (Open Model Zoo): https://github.com/openvinotoolkit/open_model_zoo/blob/master/models/intel/person-attributes-recognition-crossroad-0230/README.md
- Instalacion de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Instalacion de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- Open Model Zoo (repositorio): https://github.com/openvinotoolkit/open_model_zoo
- Pagina oficial de Intel: https://www.intel.com/content/www/us/en/homepage.html
- Centro de descargas de Intel: https://www.intel.fr/content/www/fr/fr/download-center/home.html

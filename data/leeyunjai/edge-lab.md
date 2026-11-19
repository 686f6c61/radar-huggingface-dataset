# leeyunjai/edge-lab

## Resumen
edge-lab es un repositorio de modelos agregados publicado por el usuario leeyunjai en Hugging Face, concebido como soporte de un programa educativo de inteligencia artificial que funciona sin conexion a internet en PCs con Windows AI PC. No se trata de un unico modelo entrenado por el autor, sino de una coleccion de pesos ya convertidos a formatos de inferencia en el borde (OpenVINO IR y ONNX) que cubren vision por computador, vision-lenguaje, embeddings, OCR, reconocimiento de voz y sintesis de voz. El proyecto asociado se aloja en el repositorio de GitHub themakerrobot/edge-lab.

El interes practico del repositorio reside en su caracter de empaquetado listo para ejecucion local: todos los componentes estan preconvertidos para aceleracion en CPU/GPU Intel mediante OpenVINO y para ejecucion portable mediante ONNX, lo que elimina el trabajo de conversion que normalmente exige desplegar un pipeline multimodal en un equipo de escritorio. El tamano del repositorio es de 9,3 GB y las descargas registradas son cero, con dos likes, lo que indica una publicacion reciente y de nicho.

La licencia no es unica: cada carpeta tiene su propia licencia, declarada como "per-folder" en los metadatos del modelo. Conviven componentes Apache-2.0, MIT, Gemma Terms of Use y OpenRAIL-M, de modo que cualquier uso comercial debe revisarse carpeta por carpeta. No se dispone de informacion sobre arquitecturas internas, parametros, contexto o idiomas de los componentes mas alla de los nombres de los modelos base citados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | coleccion heterogenea de modelos (CNN de vision, VLM, embeddings, ASR, TTS); no disponible por componente |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE unico) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 en el componente `tts-int8/`; resto sin especificar |
| Idiomas soportados | no disponible |
| Licencia | por carpeta: Apache-2.0, MIT, Gemma Terms of Use, OpenRAIL-M |
| Formato de pesos | OpenVINO IR y ONNX |

## Arquitectura y entrenamiento
El repositorio no documenta arquitecturas propias ni procesos de entrenamiento: agrupa artefactos de inferencia derivados de modelos de terceros. Segun la model card, las carpetas contienen los siguientes componentes: `face/` con deteccion de rostro, edad y genero, expresion y orientacion de cabeza procedentes de Open Model Zoo; `mask/` con un clasificador de mascarilla construido sobre el embedder MediaPipe MobileNetV3-Small; `mediapipe/` con malla facial y gestos de mano; `gan/` con eliminacion de fondo (U2Net), superresolucion (SR-1032) y profundidad (Depth Anything V2 Small); `vlm/` con Gemma 3 para responder preguntas sobre imagenes; `embed/` con multilingual-e5-small para busqueda sobre documentos; `backbone/` con MobileNetV2 como extractor de caracteristicas; `code/` con easyocr para reconocimiento de texto; `stt/` con Whisper para reconocimiento de voz; y `tts/` y `tts-int8/` con Supertonic 3 para sintesis de voz.

La innovacion tecnica no esta en el entrenamiento sino en la preparacion para el borde: la mayoria de los componentes se han convertido a OpenVINO IR y ONNX, formatos que permiten ejecucion en CPU Intel sin dependencias de frameworks de entrenamiento y con aceleracion especifica para NPU/GPU integradas de los AI PC. No hay informacion sobre volumen de datos, composicion de datasets ni tecnicas de alineacion (RLHF/DPO) para ninguno de los componentes.

## Capacidades
- Deteccion y analisis facial: localizacion de rostros, estimacion de edad y genero, clasificacion de expresion y orientacion de la cabeza.
- Clasificacion de mascarilla facial mediante un embedder MobileNetV3-Small de MediaPipe y un clasificador asociado.
- Malla facial con estimacion de distancia y orientacion, y reconocimiento de gestos de mano mediante MediaPipe.
- Vision-lenguaje: respuesta a preguntas sobre imagenes con Gemma 3, incluyendo descripcion de fotografias.
- Segmentacion y mejora de imagen: eliminacion de fondo con U2Net, superresolucion con SR-1032 y estimacion de profundidad monoculo con Depth Anything V2 Small.
- Embeddings de frases multilingues con multilingual-e5-small, orientados a recuperacion de informacion sobre materiales locales.
- Extraccion de caracteristicas con MobileNetV2 como backbone para tareas de aprendizaje supervisado por el usuario.
- Reconocimiento optico de caracteres con easyocr.
- Reconocimiento automatico de voz con Whisper.
- Sintesis de voz con Supertonic 3, en version original y en variante INT8 para instalacion.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso
- Aula de IA sin conectividad: el conjunto de modelos permite montar un programa educativo completo en un PC Windows AI PC sin acceso a internet, usando OpenVINO para ejecutar en CPU/NPU integradas y evitando enviar datos de alumnos a servicios externos.
- Analisis de presencia y atencion en el aula: la carpeta `face/` permite detectar rostros y estimar orientacion de cabeza para experimentos didacticos sobre vision por computador, siempre con consentimiento y finalidad educativa.
- Descripcion de imagenes para accesibilidad: la carpeta `vlm/` con Gemma 3 posibilita generar descripciones de fotografias en local, util en actividades de apoyo a personas con discapacidad visual dentro de un entorno controlado.
- Recuperacion documental sobre apuntes: la carpeta `embed/` con multilingual-e5-small permite indexar materiales del curso y responder consultas por similitud semantica sin salir del equipo.
- Digitalizacion de material impreso: la carpeta `code/` con easyocr sirve para extraer texto de fichas y libros escaneados y alimentar los indices de busqueda anteriores.
- Transcripcion de clases y generacion de locuciones: las carpetas `stt/` con Whisper y `tts-int8/` con Supertonic 3 permiten transcribir audio de clase y producir narraciones sinteticas para materiales de repaso.
- Edicion de imagen para proyectos escolares: las carpetas `gan/` ofrecen eliminacion de fondo, reescalado y mapas de profundidad para talleres de fotografia computacional.
- Prototipado de aprendizaje supervisado: la carpeta `backbone/` con MobileNetV2 permite a estudiantes entrenar un clasificador propio sobre caracteristicas precalculadas, con coste computacional bajo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Almacenamiento: el repositorio completo ocupa 9,3 GB; la instalacion descarga todas las carpetas excepto `tts/`, segun la model card.
- VRAM estimada para inferencia: no disponible de forma desagregada por componente; al tratarse de modelos pequenos (MobileNetV2/V3, U2Net, Depth Anything V2 Small, multilingual-e5-small) y de Whisper, es esperable que la mayoria quepa en memoria unificada de un AI PC, pero no se aportan cifras.
- GPU recomendadas: el objetivo declarado son PCs con Windows AI PC, es decir, CPUs Intel con GPU/NPU integradas y soporte OpenVINO; no se especifican modelos discretos como A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, previsiblemente, dado el perfil de los componentes y la orientacion a hardware integrado; no se confirma con mediciones.
- Opciones de despliegue: OpenVINO Runtime para los artefactos IR y ONNX Runtime para los artefactos ONNX; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. El repositorio no es un modelo unico sino un paquete de componentes de terceros, por lo que una comparativa directa exigiria comparar cada carpeta con su modelo de origen (Gemma 3, Whisper, easyocr, multilingual-e5-small, Depth Anything V2 Small, U2Net, MobileNetV2), para los cuales no se aportan datos de rendimiento en la informacion disponible.

## Limitaciones y advertencias
- Licencia fragmentada: cada carpeta tiene su propia licencia (Apache-2.0, MIT, Gemma Terms of Use, OpenRAIL-M); el uso comercial requiere revision juridica individualizada y el cumplimiento de los terminos de Gemma y de las restricciones de OpenRAIL-M en `tts/` y `tts-int8/`.
- Ausencia de datos tecnicos: no se publican parametros, contexto, idiomas ni benchmarks, lo que impide evaluar calidad y limites con rigor.
- Riesgo de sesgo en los modelos faciales: la estimacion de edad, genero y expresion a partir de modelos de Open Model Zoo puede presentar sesgos demograficos y no debe usarse para decisiones sobre personas.
- Riesgo de alucinacion en el componente VLM (Gemma 3) al describir imagenes, especialmente con imagenes ambiguas o de baja calidad.
- Privacidad: el procesamiento de rostros, voz y documentos es local, lo que reduce la exposicion, pero exige politicas claras de consentimiento y retencion en entornos educativos.
- Idiomas: no se especifica cobertura linguistica; el componente de embeddings es multilingue por su modelo base, pero el resto no declara idiomas.
- Madurez: cero descargas y dos likes en el momento de la consulta; el proyecto depende de un repositorio externo de GitHub y de la continuidad del autor.
- Formatos atados a OpenVINO/ONNX: la ejecucion fuera de ese ecosistema requerira reconversion de los pesos.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/leeyunjai/edge-lab
- Proyecto edge-lab en GitHub: https://github.com/themakerrobot/edge-lab
- Aviso de licencias: https://github.com/themakerrobot/edge-lab/blob/main/NOTICE
- Modelo complementario easydetect (Apache-2.0): https://huggingface.co/leeyunjai/easydetect

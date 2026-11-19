# rostrumstudios/pose-landmarker

## Resumen

Pose Landmarker es un modelo de deteccion de puntos clave (keypoint detection) desarrollado originalmente por Google dentro del ecosistema MediaPipe, y redistribuido en Hugging Face por rostrumstudios como espejo publico de los ficheros exactos que sus aplicaciones descargan. Combina un detector de personas con el modelo de landmarks 3D BlazePose GHUM, entregando 33 puntos corporales por fotograma. El repositorio aloja un unico fichero `.task` de 9.398.198 bytes en formato float16, version 1, con verificacion SHA-256 por parte del consumidor.

No es un modelo generativo ni un LLM: es un componente de vision por computador orientado al analisis de video e imagen para captura de movimiento (mocap) 3D. Su relevancia radica en que ofrece una copia fijada y verificable de un artefacto de MediaPipe que de otro modo se obtendria directamente de los buckets de Google, lo que facilita la reproducibilidad en pipelines de produccion.

La licencia es Apache-2.0, heredada del repositorio de MediaPipe, y el fichero se redistribuye sin modificaciones. El modelo se publica bajo la etiqueta de pipeline `keypoint-detection` y la libreria `onnx`, aunque el artefacto empaquetado es un bundle `.task` de MediaPipe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de personas + BlazePose GHUM 3D (MediaPipe) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | float16 (unica variante publicada en este repo) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.task` (bundle MediaPipe, 9.398.198 bytes) |

## Arquitectura y entrenamiento

El modelo sigue el diseno de MediaPipe Pose Landmarker en su variante "full": un pipeline en dos etapas compuesto por un detector de personas que localiza la region de interes y un modelo de regresion de landmarks 3D BlazePose GHUM que predice 33 puntos corporales sobre el recorte detectado. La variante "full" prioriza precision frente a las variantes "lite" y "heavy" del mismo family, a costa de un mayor coste computacional.

No se dispone de informacion sobre el numero de tokens, composicion del dataset ni proceso de entrenamiento (RLHF, DPO u otros) en la informacion proporcionada. El modelo se distribuye como artefacto preentrenado por Google y el repositorio de Rostrum es unicamente un espejo fijado a un commit concreto, sin reentrenamiento ni ajuste posterior. La innovacion tecnica relevante es el uso de BlazePose GHUM 3D, que estima profundidad relativa de los puntos corporales a partir de imagen monoculo.

## Capacidades

- Deteccion de personas por fotograma en imagen o video.
- Estimacion de 33 puntos clave corporales (landmarks) en 3D por fotograma.
- Analisis de video para captura de movimiento: los puntos detectados se convierten en un clip sobre un rig.
- Procesamiento de imagenes individuales y secuencias de video.
- Inferencia solo de analisis: lee lo que hay en una grabacion o imagen, no genera imagen, voz ni sonido.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de capacidades multilingues ni modo thinking.

## Casos de uso

- Captura de movimiento desde video: el modelo detecta los 33 puntos corporales en cada fotograma y esos puntos alimentan un rig para producir un clip de animacion, tal como lo emplea Rostrum en sus aplicaciones.
- Analisis biomecanico deportivo: extraccion de landmarks por fotograma para medir angulos articulares y trayectorias en grabaciones de entrenamiento, aprovechando la estimacion 3D monoculo.
- Control de avatares en tiempo real: los landmarks alimentan un esqueleto virtual en aplicaciones de realidad aumentada o videojuegos, con la variante full cuando prima la precision.
- Preprocesado para pipelines de vision: deteccion de personas y puntos clave como etapa previa a modelos de reconocimiento de acciones o segmentacion.
- Analisis ergonomico en entornos laborales: procesamiento de grabaciones para evaluar posturas y detectar riesgos posturales, dado que el modelo solo analiza y no genera contenido.
- Verificacion de integridad en produccion: el consumidor puede fijar el commit y comprobar el SHA-256 (`5134a3aad27a58b93da0088d431f366da362b44e3ccfbe3462b3827a839011b1`) antes de cargar el modelo, lo que encaja en pipelines con requisitos de reproducibilidad.
- Investigacion en vision por computador: uso como baseline de pose estimation 3D con licencia Apache-2.0 para comparaciones reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el artefacto pesa 9.398.198 bytes (float16), por lo que la huella en memoria es reducida.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue: el artefacto es un bundle `.task` de MediaPipe, por lo que el runtime natural es MediaPipe (Tasks API). El repositorio se etiqueta como `onnx`, pero no se detalla en la informacion un flujo de despliegue via ONNX Runtime, vLLM, llama.cpp, Ollama ni TGI (estos ultimos no aplican a un modelo de vision de este tipo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pose Landmarker (full, float16, v1) | no disponible | no aplica | 33 landmarks 3D | Apache-2.0 | Hugging Face (espejo) y MediaPipe |
| MediaPipe Pose Landmarker (lite) | no disponible | no aplica | 33 landmarks 3D | Apache-2.0 | MediaPipe |
| MediaPipe Pose Landmarker (heavy) | no disponible | no aplica | 33 landmarks 3D | Apache-2.0 | MediaPipe |
| BlazePose GHUM 3D (original) | no disponible | no aplica | 33 landmarks 3D | Apache-2.0 | Repositorio MediaPipe |

Las variantes lite y heavy pertenecen al mismo family de MediaPipe y se diferencian por el equilibrio precision/coste; no se dispone de datos numericos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: solo analiza imagen y video; no produce texto, audio ni imagen nueva.
- No procesa lenguaje natural, por lo que no admite prompts, tool calling ni razonamiento multi-step.
- La precision depende de la calidad de la deteccion de personas previa; oclusiones, recortes o personas parcialmente visibles pueden degradar los landmarks.
- La estimacion 3D es monoculo y de profundidad relativa; no sustituye a sistemas de captura con multiples camaras o sensores de profundidad.
- No se dispone de informacion sobre sesgos demograficos, de vestimenta o de iluminacion en la documentacion proporcionada.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero si existe riesgo de landmarks espurios en fotogramas sin persona o con deteccion erronea.
- Licencia Apache-2.0: permite uso comercial con atribucion y conservacion del aviso de licencia; el fichero se redistribuye sin modificaciones desde MediaPipe.
- El repositorio es un espejo fijado a un commit; actualizaciones del modelo original no se reflejaran automaticamente.
- El modelo se distribuye como bundle `.task`, no como pesos sueltos en safetensors o GGUF; la integracion requiere el runtime de MediaPipe.

## Enlaces

- Hugging Face: https://huggingface.co/rostrumstudios/pose-landmarker
- Fichero original (Google Cloud Storage): https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task
- Repositorio MediaPipe (Google): https://github.com/google-ai-edge/mediapipe
- Documentacion MediaPipe Pose Landmarker: https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker
- Perfil del autor en Hugging Face: https://huggingface.co/rostrumstudios

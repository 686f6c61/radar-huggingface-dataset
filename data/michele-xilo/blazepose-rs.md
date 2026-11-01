# michele-xilo/blazepose-rs

## Resumen

BlazePose-rs es un repositorio de conversiones a ONNX de los modelos BlazePose de Google MediaPipe, publicadas por el desarrollador michele-xilo para su uso desde el crate de Rust `blazepose-rs`. No se trata de un modelo de lenguaje, sino de un conjunto de ocho redes neuronales especializadas en deteccion de puntos clave (keypoint detection): un detector de personas, tres variantes del estimador de landmarks corporales (lite, full y heavy), un detector de palmas, dos variantes del estimador de landmarks de mano (lite y full) y un modelo de recorte de mano.

El paquete resuelve un problema de integracion: los modelos originales de MediaPipe se distribuyen habitualmente en formato TFLite y estan pensados para ejecutarse dentro del ecosistema MediaPipe. Estas conversiones permiten ejecutar el pipeline completo de pose corporal y hand tracking con el runtime ONNX Runtime desde Rust, sin depender de las dependencias nativas de MediaPipe. El repositorio ocupa aproximadamente 0,1 GB y esta publicado bajo licencia Apache 2.0, la misma que los modelos originales de Google.

La relevancia es practica y de nicho: para desarrolladores que construyen aplicaciones de vision por computador en Rust (o en cualquier lenguaje con bindings a ONNX Runtime) y necesitan estimacion de pose en tiempo real sin incorporar MediaPipe como dependencia. No hay informacion publicada sobre el numero de parametros, la longitud de contexto (no aplica, al no ser un modelo generativo) ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes convolucionales especificas de tarea (detectores y estimadores de landmarks de BlazePose/MediaPipe), exportadas a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no generativo) |
| Tipos de cuantizacion | no disponible (los ficheros se distribuyen en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica; el modelo procesa imagenes, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx`) |

Ficheros incluidos en el repositorio:

| Fichero | Funcion |
|---|---|
| `blazepose_detector.onnx` | Detector de personas |
| `blazepose_pose_estimator_lite.onnx` | Landmarks corporales, variante lite |
| `blazepose_pose_estimator_full.onnx` | Landmarks corporales, variante full |
| `blazepose_pose_estimator_heavy.onnx` | Landmarks corporales, variante heavy |
| `palm_detection.onnx` | Detector de palmas |
| `hand_landmark_lite.onnx` | Landmarks de mano, variante lite |
| `hand_landmark_full.onnx` | Landmarks de mano, variante full |
| `hand_recrop.onnx` | Recorte de mano |

## Arquitectura y entrenamiento

Los modelos son las redes originales de BlazePose dentro de MediaPipe, convertidas a ONNX. BlazePose emplea una arquitectura en dos etapas: primero un detector de region de interes (el detector de personas o el detector de palmas) localiza al sujeto en la imagen, y despues un estimador de landmarks predice las coordenadas de los puntos clave sobre el recorte. En el caso de las manos, el pipeline incluye ademas un modelo de recorte (`hand_recrop`) que refina la region de interes antes de la estimacion final. Las tres variantes del estimador corporal (lite, full, heavy) intercambian precision por coste computacional, de menor a mayor capacidad.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO; estos datos corresponden a los modelos originales de Google y no se reproducen en la model card del repositorio. La innovacion tecnica del paquete es la propia conversion a ONNX, que habilita su ejecucion con ONNX Runtime y facilita el despliegue multiplataforma desde Rust mediante el crate `blazepose-rs`.

## Capacidades

- Deteccion de personas en imagen: el modelo `blazepose_detector` localiza la region del cuerpo antes de la estimacion.
- Estimacion de landmarks corporales en tres niveles de calidad (lite, full, heavy), con puntos clave del cuerpo humano.
- Deteccion de palmas de la mano mediante `palm_detection`.
- Estimacion de landmarks de mano en dos variantes (lite, full), con refinamiento mediante `hand_recrop`.
- Ejecucion sobre ONNX Runtime, lo que permite integrar el pipeline en aplicaciones Rust y en otros lenguajes con bindings a ONNX.
- Procesamiento de imagenes y video frame a frame; no es un modelo generativo ni soporta texto.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: son modelos de vision puros.

## Casos de uso

- Analisis de movimiento deportivo: el pipeline detector + estimador corporal permite extraer la posicion de las articulaciones por fotograma en videos de entrenamiento, y la variante heavy se usaria cuando la precision del landmark prima sobre la latencia.
- Control por gestos en aplicaciones de escritorio: el detector de palmas y los landmarks de mano permiten reconocer gestos en tiempo real con la variante lite, adecuada para bucles de captura de webcam con presupuesto de computo ajustado.
- Aplicaciones de realidad aumentada o filtros: los landmarks corporales y de mano sirven para anclar elementos virtuales sobre el cuerpo o las manos del usuario, con el modelo de recorte refinando la region de la mano.
- Ergonomia y prevencion de riesgos laborales: el estimador corporal puede monitorizar posturas en puestos de trabajo a partir de camaras fijas, detectando desviaciones posturales de forma continua.
- Telemedicina y rehabilitacion: el seguimiento de landmarks permite registrar la amplitud de movimiento de un paciente durante ejercicios guiados, comparando la trayectoria de las articulaciones entre sesiones.
- Herramientas de anotacion de datasets de vision: el pipeline puede preanotar automaticamente puntos clave en imagenes para que un anotador humano los corrija, acelerando la creacion de datasets de pose.
- Integracion en aplicaciones Rust de vision embebida: al ser ficheros ONNX, el pipeline puede desplegarse con ONNX Runtime en dispositivos con recursos limitados usando las variantes lite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, latencia ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,1 GB en total, lo que sugiere modelos de pocos megabytes cada uno, pero no se documenta el consumo de memoria en inferencia.
- GPU recomendadas: no disponible. Al ejecutarse con ONNX Runtime, puede usar aceleracion por GPU (CUDA, DirectML, TensorRT) o CPU, pero no hay recomendaciones publicadas.
- Cabe en GPU de consumo: probablemente si, dado el tamano reducido del repositorio y la naturaleza de los modelos BlazePose originales, pero no hay confirmacion en la informacion proporcionada.
- Opciones de despliegue: ONNX Runtime (principal), y el crate de Rust `blazepose-rs` como envoltorio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de vision de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|
| BlazePose-rs (este repositorio) | Deteccion de pose y manos | ONNX | Apache 2.0 | Imagenes (no aplica contexto) | HuggingFace |
| MediaPipe BlazePose original | Deteccion de pose y manos | TFLite | Apache 2.0 | Imagenes | Repositorio de Google MediaPipe |
| MediaPipe Hands original | Landmarks de mano | TFLite | Apache 2.0 | Imagenes | Repositorio de Google MediaPipe |

La comparativa se limita a los modelos originales de los que derivan estas conversiones, ya que no se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada. La diferencia principal frente a los originales es el formato (ONNX frente a TFLite) y el ecosistema de ejecucion (ONNX Runtime y Rust frente a MediaPipe).

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo ni de equidad en el repositorio; la model card remite a las model cards de Google para conocer los usos previstos y la evaluacion de equidad de cada modelo original.
- Riesgo de fallo en condiciones de oclusion, iluminacion adversa o poses atipicas, inherente a los modelos BlazePose originales; no se documenta en el repositorio.
- No hay informacion sobre el rendimiento en distintos grupos demograficos, tipos de cuerpo o condiciones de captura.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las model cards originales de Google antes de desplegar, tal como indica el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- No se documentan procesos de cuantizacion ni optimizaciones de latencia; el rendimiento real dependera del runtime y del hardware elegidos.
- Al ser una conversion no oficial, no hay garantia de equivalencia numerica exacta con los modelos TFLite originales de MediaPipe.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/michele-xilo/blazepose-rs
- Crate de Rust `blazepose-rs`: https://github.com/michele-xilo/blazepose-rs
- MediaPipe (Google AI Edge): https://github.com/google-ai-edge/mediapipe
- Licencia Apache 2.0 de MediaPipe: https://github.com/google-ai-edge/mediapipe/blob/master/LICENSE

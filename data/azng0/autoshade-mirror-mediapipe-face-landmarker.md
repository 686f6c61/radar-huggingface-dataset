# Azng0/autoshade-mirror-mediapipe-face-landmarker

## Resumen

`autoshade-mirror-mediapipe-face-landmarker` no es un modelo de lenguaje, sino un espejo (mirror) byte a byte del bundle `face_landmarker.task` de MediaPipe, el paquete de deteccion de puntos faciales de Google. Lo publica el usuario Azng0 con el unico proposito de garantizar la disponibilidad del fichero original alojado en un bucket de Google Cloud Storage, de modo que la funcionalidad de modo retratos (Portraits) de la herramienta AutoShade siga funcionando aunque el bucket upstream se mueva o deje de servir el recurso.

El artefacto corresponde a la version float16 (version 1) del Face Landmarker de MediaPipe, con un tamano de 3.758.596 bytes y hash SHA-256 `64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff`. Se distribuye bajo licencia Apache-2.0, la misma del modelo original de Google, y el repositorio incluye un fichero `MIRROR.md` que documenta su procedencia.

Su relevancia es practica y de infraestructura: no aporta capacidades nuevas, sino que actua como dependencia estable para pipelines de vision por computador que necesitan inferencia de landmarks faciales en local. Es util para desarrolladores que integran AutoShade o cualquier aplicacion basada en MediaPipe Tasks y quieren evitar roturas por cambios en el almacenamiento upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MediaPipe Face Landmarker (grafo de tareas de MediaPipe; detalles internos de la red no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | float16 (version 1 del bundle) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.task` (bundle de MediaPipe Tasks, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El artefacto es un bundle `.task` de MediaPipe, el formato empaquetado que agrupa el grafo de inferencia y los pesos del modelo en un unico fichero consumible por la API de MediaPipe Tasks. El Face Landmarker de MediaPipe combina deteccion de rostro y prediccion de malla facial (face mesh) para localizar puntos de referencia faciales y estimar transformaciones de la cabeza; los detalles concretos de la red neuronal interna, el volumen de datos de entrenamiento y el proceso de optimizacion no estan documentados en la informacion disponible.

No se ha realizado ningun reentrenamiento ni ajuste: el fichero es una copia byte a byte del original de Google, verificado por hash SHA-256. Por tanto, las caracteristicas de entrenamiento son exactamente las del modelo upstream de MediaPipe, y este repositorio no aporta innovaciones tecnicas propias mas alla de la replicacion del recurso.

## Capacidades

- Deteccion de landmarks faciales: localizacion de puntos de referencia de la cara sobre imagenes o fotogramas de video.
- Malla facial (face mesh): prediccion de la geometria del rostro para aplicaciones de seguimiento y analisis.
- Estimacion de transformaciones faciales: util para efectos de realidad aumentada y filtros.
- Procesamiento de imagen y video en tiempo real en CPU y GPU mediante el runtime de MediaPipe.
- Integracion con la API de MediaPipe Tasks (Python, JavaScript, Android, iOS).
- No incluye generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues.
- No dispone de modo thinking, vision generativa ni procesamiento de audio.

## Casos de uso

- Modo retratos de AutoShade: el bundle permite detectar y seguir la cara del usuario para aplicar sombreado o efectos de iluminacion en tiempo real, que es el proposito original del espejo.
- Filtros de realidad aumentada: integracion en aplicaciones moviles o web que necesitan anclar elementos graficos a puntos faciales con baja latencia.
- Analisis de expresiones y seguimiento ocular: uso de los landmarks para derivar posiciones de ojos, cejas y boca en estudios de usabilidad o investigación.
- Videoconferencia con efectos: seguimiento facial para encuadre automatico, desenfoque de fondo condicionado al rostro o avatares.
- Pipelines de vision en produccion: dependencia estable en entornos donde el bucket de Google no es accesible o se quiere fijar la version del artefacto por hash.
- Prototipado rapido con MediaPipe Tasks: descarga directa desde Hugging Face para ejemplos y demos sin depender de URLs externas.
- Pruebas de regresion: verificacion de integridad del fichero mediante el hash SHA-256 documentado en entornos CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el bundle ocupa 3,76 MB y esta pensado para ejecutarse en CPU en la mayoria de escenarios.
- GPU recomendadas: no se especifican; MediaPipe puede acelerar con GPU integradas o dedicadas, pero no hay requisitos publicados en la informacion disponible.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano reducido del artefacto, aunque no hay datos oficiales en la informacion proporcionada.
- Opciones de despliegue: runtime de MediaPipe Tasks (Python, JavaScript, Android, iOS); no es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| autoshade-mirror-mediapipe-face-landmarker | Face landmarker (MediaPipe) | 3,76 MB | no aplica | Apache-2.0 | Hugging Face (espejo) |
| MediaPipe Face Landmarker original (Google) | Face landmarker (MediaPipe) | 3,76 MB | no aplica | Apache-2.0 | Google Cloud Storage |
| MediaPipe Face Mesh | Face mesh (MediaPipe) | no disponible | no aplica | Apache-2.0 | Google / MediaPipe |
| Otros detectores faciales (p. ej. dlib, OpenCV) | Deteccion de rostro | variable | no aplica | variable | Repositorios propios |

La comparativa se limita a la categoria de deteccion facial; no hay modelos de lenguaje comparables porque el artefacto no lo es.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Copia sin modificaciones: cualquier sesgo o limitacion del Face Landmarker de Google se hereda intacta.
- Sin datos publicados sobre sesgos demograficos, robustez ante condiciones de iluminacion o precision en distintos grupos etnicos.
- Riesgo de fallo en rostros ocluidos, perfiles extremos, baja resolucion o iluminacion adversa, comun en detectores de landmarks.
- No se garantiza soporte ni mantenimiento por parte del autor del espejo; la fuente de verdad es el repositorio de Google.
- Licencia Apache-2.0: permite uso comercial con atribucion y conservacion del aviso de licencia; conviene revisar el fichero `LICENSE` incluido.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion ni validacion comunitaria.
- Dependencia de la version float16 v1: versiones futuras del modelo original no se reflejaran automaticamente en este espejo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Azng0/autoshade-mirror-mediapipe-face-landmarker
- Proyecto AutoShade: https://github.com/skymanbp/autoshade
- Origen del bundle (Google Cloud Storage): https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task
- Documentacion de MediaPipe Face Landmarker: no disponible en la informacion proporcionada
- Paper o blog oficial de MediaPipe: no disponible en la informacion proporcionada

# ipsilondev/mediapipe-face-landmarker

## Resumen

`ipsilondev/mediapipe-face-landmarker` no es un modelo de lenguaje ni un modelo generativo, sino un espejo (mirror) de los ficheros oficiales de Google MediaPipe para la deteccion y el mallado facial en dispositivos. El repositorio contiene copias sin modificar de dos artefactos TFLite: el bundle `face_landmarker.task` (detector BlazeFace de corto alcance + malla facial de 478 puntos + cabecera de blendshapes) y el detector independiente `blaze_face_short_range.tflite`. El autor lo publica para poder fijar los binarios por commit mediante un submódulo git, evitando depender de URLs de Google Cloud Storage en los pipelines de compilacion.

El problema que resuelve es de reproducibilidad y cadena de suministro: al fijar los ficheros por hash SHA-256 y commit, una aplicacion Android que use `com.google.mediapipe:tasks-vision` puede garantizar que siempre carga exactamente los mismos bytes. No hay conversion, cuantizacion ni reentrenamiento; la licencia es Apache-2.0 de Google LLC y los binarios se cargan exclusivamente en los MediaPipe Tasks nativos de Android, nunca en runtimes web.

Por su naturaleza, la ficha se centra en las especificaciones de los artefactos TFLite (tamano, formato, huella SHA-256, pipeline de inferencia) mas que en parametros de un transformer. No se dispone de informacion sobre parametros, contexto ni benchmarks, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BlazeFace (detector) + red de malla facial de 478 puntos + cabecera de blendshapes; empaquetado en formato MediaPipe Tasks (`.task`) y TFLite |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | float16 (unica variante publicada en el mirror) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 (Google LLC) |
| Formato de pesos | `.task` (bundle MediaPipe, 3.758.596 bytes) y `.tflite` (229.746 bytes) |
| Tamano del repo | 0.0 GB en la ficha de HF (los binarios se almacenan como objetos LFS/Xet) |
| SHA-256 `face_landmarker.task` | `64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff` |
| SHA-256 `blaze_face_short_range.tflite` | `b4578f35940bf5a1a655214a1cce5cab13eba73c1297cd78e1a04c2380b0152f` |
| Runtime de inferencia | MediaPipe Tasks for Android (`com.google.mediapipe:tasks-vision`) |
| Fecha de descarga de los binarios | 2026-11-19 |

## Arquitectura y entrenamiento

Los artefactos son los publicados oficialmente por Google en `storage.googleapis.com/mediapipe-models`. El bundle `face_landmarker.task` combina tres etapas: un detector BlazeFace de corto alcance que localiza la cara, una red de malla facial que predice 478 puntos tridimensionales sobre el rostro y una cabecera de blendshapes que estima coeficientes de expresion facial. El detector `blaze_face_short_range.tflite` es el componente de deteccion aislado, utilizable con la API `FaceDetector` de MediaPipe Tasks.

No se ha realizado ningun proceso de conversion, cuantizacion ni ajuste fino por parte del autor del mirror; los ficheros son copias byte a byte de los originales de Google, en precision float16 y version v1. No se dispone de informacion sobre el dataset de entrenamiento, el numero de imagenes, la composicion demografica ni si hubo etapas de aumento de datos o destilacion, ya que esa informacion no aparece en la model card del mirror.

## Capacidades

- Deteccion de rostros en imagenes y flujo de video en tiempo real mediante BlazeFace de corto alcance.
- Prediccion de malla facial de 478 puntos con coordenadas 3D sobre el rostro detectado.
- Estimacion de blendshapes (coeficientes de expresion facial) a partir de la malla.
- Integracion nativa en Android mediante `com.google.mediapipe:tasks-vision`.
- Ejecucion en dispositivo (on-device), sin necesidad de conexion a red ni de backend.
- No incluye generacion de texto, codigo, matematicas, tool calling, agentes ni capacidades multilingues.
- No incluye vision general (clasificacion, deteccion de objetos genericos) mas alla del dominio facial.

## Casos de uso

- **Filtros y efectos faciales en apps moviles**: la malla de 478 puntos y los blendshapes permiten deformar texturas o superponer gafas, sombreros o maquillaje virtual en tiempo real sobre la camara del dispositivo, con latencia de inferencia local.
- **Seguimiento de atencion o presencia**: el detector BlazeFace de corto alcance puede alimentar logica de "rostro presente / ausente" para pausar la reproduccion de video o bloquear la pantalla, sin enviar imagenes fuera del dispositivo.
- **Analisis de expresiones en investigación de UX**: los blendshapes permiten registrar reacciones faciales agregadas durante pruebas de usabilidad, manteniendo los datos en el terminal del participante.
- **Animacion de avatares**: los coeficientes de blendshape se mapean directamente a rigs de avatar (ARKit-like) para videollamadas o mundos virtuales, con la ventaja de que el bundle incluye deteccion y malla en un solo fichero.
- **Accesibilidad**: control por gestos faciales o deteccion de orientacion de la cara para interfaces manos libres en Android, usando el detector aislado cuando solo se requiere localizacion.
- **Verificacion de integridad en CI/CD**: el mirror permite fijar los binarios por commit y verificar su SHA-256 en el pipeline de compilacion, garantizando que la app publicada usa exactamente los artefactos auditados.
- **Prototipado rapido con MediaPipe Tasks**: al estar disponibles como submódulo git, se pueden incluir en proyectos de ejemplo o demos sin depender de descargas desde Google Cloud Storage.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en dispositivo movil (Android) mediante MediaPipe Tasks; no requiere GPU de servidor.
- El bundle `face_landmarker.task` ocupa 3.758.596 bytes y el detector aislado 229.746 bytes, por lo que caben holgadamente en memoria de cualquier telefono moderno.
- No se dispone de datos de latencia ni throughput publicados en la informacion proporcionada.
- Opciones de despliegue: MediaPipe Tasks for Android (`com.google.mediapipe:tasks-vision`); no esta pensado para vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos de lenguaje.
- No aplica el concepto de VRAM de GPU de escritorio; el consumo relevante es memoria RAM del dispositivo y, opcionalmente, aceleracion por GPU movil o NPU a traves del delegate de MediaPipe (no detallado en la informacion disponible).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ipsilondev/mediapipe-face-landmarker` | Deteccion + malla facial (TFLite/MediaPipe) | no disponible | no aplica | Apache-2.0 | Mirror en HF, binarios LFS |
| MediaPipe Face Mesh oficial (Google) | Malla facial | no disponible | no aplica | Apache-2.0 | Google Cloud Storage |
| MediaPipe BlazeFace oficial (Google) | Deteccion facial | no disponible | no aplica | Apache-2.0 | Google Cloud Storage |
| Alternativas de malla facial de terceros (p. ej. modelos tipo FaceMesh en TFLite) | Malla facial | no disponible | no aplica | variable | variable |

La comparativa se limita a los artefactos oficiales de Google, ya que no se dispone de datos de benchmarks ni de parametros para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni respuestas; cualquier uso en ese sentido es invalido.
- El mirror no aporta garantias adicionales sobre los binarios originales de Google; la responsabilidad de la calidad del modelo recae en el autor original.
- Solo se publica la variante float16 v1; no hay versiones cuantizadas a int8 ni variantes de rango completo en este repositorio.
- El detector BlazeFace incluido es de corto alcance, por lo que el rendimiento en caras lejanas o muy pequenas puede degradarse (comportamiento heredado del modelo original de Google).
- El uso esta restringido a MediaPipe Tasks nativos de Android segun la model card; no se contempla su carga en runtimes web.
- Los ficheros se almacenan como objetos LFS/Xet: un `git clone` sin `git-lfs` produce punteros de unos 130 bytes, no los binarios reales. Es imprescindible instalar `git-lfs` o ejecutar `git lfs pull` y verificar el SHA-256.
- Riesgo de sesgo demografico y de rendimiento desigual segun tono de piel, iluminacion y oclusiones, inherente al modelo original de Google; no se documenta en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda conservar los avisos de copyright de Google LLC y verificar los terminos de los modelos originales.
- No se dispone de informacion sobre fecha de entrenamiento, dataset ni evaluaciones de robustez.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ipsilondev/mediapipe-face-landmarker
- Bundle original `face_landmarker.task`: https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task
- Detector original `blaze_face_short_range.tflite`: https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite
- Documentacion de MediaPipe Face Landmarker (Tasks): https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker
- Documentacion de MediaPipe Face Detector (Tasks): https://ai.google.dev/edge/mediapipe/solutions/vision/face_detector
- Paquete Android `com.google.mediapipe:tasks-vision`: https://maven.google.com/web/index.html#com.google.mediapipe:tasks-vision

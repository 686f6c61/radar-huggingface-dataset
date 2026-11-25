# litert-community/MediaPipe-LanguageDetector

## Resumen

MediaPipe Language Detector es un modelo ultraligero de identificacion de idioma para texto UTF-8, distribuido por la comunidad `litert-community` a partir del modelo original de Google MediaPipe. El artefacto principal es `language_detector.tflite`, un fichero TFLite de 315 KB en FP32 que clasifica texto en 110 idiomas codificados con ISO 639-1 / BCP-47 (de `af` a `zu`, mas la clase `unknown`). No es un modelo generativo: es un clasificador de texto que devuelve una distribucion de probabilidad de 111 clases.

Su relevancia radica en el despliegue on-device: el modelo esta pensado para ejecutarse dentro de la tarea `LanguageDetector` de MediaPipe en Android, iOS, Web, Python y Flutter, con un coste de almacenamiento y computo minimo. Esto lo hace util como componente auxiliar en pipelines de NLP (enrutado de idioma, seleccion de tokenizador, preprocesado multilingue) donde no es viable invocar un modelo grande o un servicio remoto.

La ficha se basa exclusivamente en la model card publicada en Hugging Face. No se dispone de informacion detallada sobre la arquitectura interna mas alla de que es una red de clasificacion basada en embeddings con feature hashing y tablas de lookup compactas, ni sobre el dataset de entrenamiento o los resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de clasificacion basada en embeddings, con feature hashing y tablas de lookup compactas (TFLite) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada: una unica cadena UTF-8, tensor `Placeholder` de shape `[1]`) |
| Tipos de cuantizacion | FP32 (float32); no se documentan otras variantes |
| Idiomas soportados | 110 idiomas (ISO 639-1 / BCP-47, de `af` a `zu`) mas la clase `unknown` |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`language_detector.tflite`), con metadatos embebidos `TFLITE_METADATA` (name `LangID`, version `1`, author `MediaPipe`) |

Especificaciones adicionales del artefacto:

| Parametro | Valor |
|---|---|
| Tamano del fichero | 315.294 bytes (315,3 KB) |
| SHA-256 | `7db4f23dfe1ad8966b050b419a865da451143fd43eb6b606a256aadeeb1e5417` |
| Entrada | `Placeholder`, shape `[1]`, tipo `string` (UTF-8) |
| Salida | `pod/Softmax`, shape `[1, 111]`, tipo `float32` |
| Etiquetas | `labels.txt` (376 B), `unknown` + 110 codigos ISO 639-1 / `-Latn` |
| Libreria | `litert` / MediaPipe Tasks |
| Pipeline HF | `text-classification` |

## Arquitectura y entrenamiento

La model card describe el modelo como una red de clasificacion neuronal basada en embeddings, optimizada mediante feature hashing y tablas de lookup compactas. El grafo TFLite recibe una unica cadena UTF-8 en el tensor `Placeholder` de shape `[1]` y produce una distribucion softmax de 111 clases en `pod/Softmax` de shape `[1, 111]`. El modelo va acompanado de `labels.txt`, que mapea cada indice de salida a un codigo de idioma ISO 639-1 o a una variante transliterada con sufijo `-Latn`, mas la etiqueta `unknown`.

No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). Tampoco se detalla el numero de parametros ni la topologia exacta de la red. La unica referencia tecnica disponible es la naturaleza de clasificador ligero orientado a inferencia on-device dentro del ecosistema MediaPipe.

## Capacidades

- Identificacion de idioma en texto UTF-8 con salida de 111 clases (110 idiomas mas `unknown`).
- Clasificacion con umbral de confianza configurable (`score_threshold`, por ejemplo 0,5 en el ejemplo de Python).
- Ejecucion on-device en Android, iOS, Web, Python y Flutter mediante MediaPipe Tasks.
- Modelo ultraligero (315 KB) apto para entornos con restricciones severas de almacenamiento y memoria.
- Soporte multilingue amplio: 110 idiomas codificados en ISO 639-1 / BCP-47, incluyendo variantes transliteradas `-Latn`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta modo thinking ni capacidades especiales adicionales.

## Casos de uso

- Enrutado de idioma en pipelines de NLP: el modelo clasifica la cadena de entrada y permite seleccionar el tokenizador, el modelo de traduccion o el prompt adecuado antes de invocar un LLM mayor, con un coste de inferencia minimo.
- Preprocesado en aplicaciones moviles multilingues: integrado en Android o iOS mediante MediaPipe Tasks, permite adaptar la interfaz o las sugerencias al idioma detectado sin enviar texto a un servidor.
- Moderacion y filtrado de contenido: clasificar el idioma de mensajes entrantes para aplicar reglas de moderacion especificas por idioma o derivar a revisores humanos con el idioma correcto.
- Analitica de productos: etiquetar automaticamente resenas, comentarios o tickets de soporte por idioma para agregar metricas por region o mercado.
- Deteccion previa en sistemas de traduccion automatica: identificar el idioma de origen antes de llamar a un motor de traduccion, evitando llamadas innecesarias cuando el idioma ya es el esperado.
- Aplicaciones web sin backend: mediante la version Web/JavaScript de MediaPipe, el modelo puede ejecutarse en el navegador para clasificar texto introducido por el usuario sin coste de servidor.
- Componente de bajo consumo en dispositivos embebidos: su tamano de 315 KB y su formato TFLite lo hacen viable en entornos con memoria muy limitada donde un modelo transformer no cabria.

## Benchmarks y rendimiento

La model card incluye una seccion de latencias ("Latency Benchmarks") que referencia la documentacion oficial de MediaPipe Language Detector, pero el contenido de la tabla no esta disponible en la informacion proporcionada (la tabla aparece truncada). No se han publicado resultados de benchmarks de precision (accuracy, F1) en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| Precision por idioma (accuracy/F1) | no disponible |
| Latencia end-to-end (MediaPipe Task) | no disponible (tabla truncada en la informacion proporcionada) |

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; el artefacto ocupa 315 KB y el modelo esta disenado para ejecucion on-device en CPU.
- GPU recomendadas: no aplica; el modelo esta optimizado para CPU en dispositivos moviles, navegador y equipos de sobremesa.
- Cabe en cualquier GPU consumer e incluso en dispositivos sin GPU dedicada (telefonos, tablets, navegadores).
- Opciones de despliegue: MediaPipe Tasks en Python, Web/JavaScript, Android (Kotlin/Java), iOS (Swift) y Flutter (Dart); el fichero es un `.tflite` que puede cargarse con el runtime TFLite/LiteRT.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; la model card remite a la tabla de latencias de la documentacion oficial, que no se incluye completa.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos de identificacion de idioma (por ejemplo, fastText lid.176, CLD3 o langid.py) que permitan una comparacion rigurosa. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MediaPipe Language Detector | no disponible | no disponible | Apache 2.0 | TFLite | 110 idiomas, 315 KB, on-device |
| Alternativas (fastText lid.176, CLD3, langid.py) | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- Es un clasificador de idioma, no un modelo generativo: no produce texto ni responde preguntas.
- No se documentan sesgos conocidos ni evaluaciones de equidad entre idiomas; el rendimiento puede variar notablemente entre los 110 idiomas soportados, especialmente en textos cortos o con mezcla de idiomas.
- Riesgo de clasificacion erronea en cadenas muy cortas, ruidosas o con code-switching; la clase `unknown` existe para casos no cubiertos, pero no se detalla su comportamiento.
- No se especifica la longitud maxima de entrada ni el comportamiento con textos largos; la entrada es una unica cadena UTF-8 sin contexto documentado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la model card original de Google (PDF incluido en el repo) por si impone condiciones adicionales.
- El modelo se distribuye en FP32 unicamente; no se documentan variantes cuantizadas.
- La informacion sobre arquitectura, parametros y entrenamiento es muy limitada; para produccion conviene validar la precision en el dominio concreto de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-LanguageDetector
- Documentacion de MediaPipe Language Detector: https://developers.google.com/edge/mediapipe/solutions/text/language_detector
- Benchmarks de latencia (documentacion oficial): https://developers.google.com/edge/mediapipe/solutions/text/language_detector#benchmarks
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/text/language_detector
- Codigo fuente del demo web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/language-detector.ts
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/language_detector/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/language_detector/ios
- Notebook Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/language_detector/python/%5BMediaPipe_Python_Tasks%5D_Language_Detector.ipynb
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/text/language_detector
- Guias de instalacion: Python (https://developers.google.com/edge/mediapipe/solutions/setup_python), Web (https://developers.google.com/edge/mediapipe/solutions/setup_web), Android (https://developers.google.com/edge/mediapipe/solutions/setup_android), iOS (https://developers.google.com/edge/mediapipe/solutions/setup_ios), Flutter (https://developers.google.com/edge/mediapipe/solutions/setup_flutter)

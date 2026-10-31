# desert-ant-labs/eye

## Resumen

Eye es un modelo de comprensión de fotografías que se ejecuta íntegramente en el dispositivo (on-device), desarrollado por Desert Ant Labs. Su función es etiquetar, puntuar y recortar fotos: identifica el tipo de imagen (captura de pantalla, recibo, selfie), las escenas presentes (558 escenas), la calidad técnica (desenfoque, ojos cerrados), las personas y mascotas que aparecen, y si el contenido es sensible, todo ello con niveles de confianza calibrados.

El modelo se distribuye en formatos LiteRT (TFLite) y Core ML, con SDKs nativos para Swift, Kotlin y JavaScript (navegador y Node), lo que lo hace especialmente relevante para desarrolladores de apps móviles y web que necesitan análisis de imágenes sin enviar datos a la nube. El repositorio ocupa unos 0,1 GB, lo que indica un modelo compacto pensado para inferencia local.

El modelo está en estado Beta y se presenta junto a la librería `desert-ant-core`, que proporciona utilidades como detección de duplicados y selección de la mejor foto de una ráfaga. Su licencia es de tipo source-available propia del autor, no una licencia open source estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de clasificación de imágenes on-device) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (salidas etiquetadas en inglés, sin generación de texto) |
| Licencia | desert-ant-labs-source-available |
| Formato de pesos | LiteRT (TFLite) y Core ML |

Información adicional disponible:

| Parametro | Valor |
|---|---|
| Plataformas | iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador, Node |
| Tamaño del repositorio | 0,1 GB |
| Versión de pesos | v1.0.0 |
| Estado | Beta |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo, el número de parámetros, los datos de entrenamiento ni el proceso de optimización. Lo que sí documenta el autor es la interfaz de salida: cada etiqueta lleva asociada una confianza calibrada de 0 a 1, diseñada para que dos umbrales fijos funcionen para todas las etiquetas (0,5 como punto de corte recomendado para filtros y búsqueda, y 0,9 para acciones de alta precisión como ocultar o borrar contenido automáticamente).

En cuanto a despliegue, el modelo se ejecuta en el dispositivo mediante LiteRT (TFLite) en plataformas móviles y de escritorio, y Core ML en el ecosistema Apple. En el navegador, la build de JavaScript ejecuta el modelo sobre la GPU mediante WebGPU cuando está disponible, con fallback a WebAssembly sobre CPU; se puede forzar el acelerador con `accelerator: "wasm"` o `"webgpu"` al cargar el modelo.

## Capacidades

- Clasificación del tipo de foto: `photo`, `selfie`, `screenshot`, `photo_of_screen`, `receipt`, `document`, `id_card`, `whiteboard`, `map`, `chart_or_slide`, `meme_or_graphic`, `illustration_or_art`, `shopping_reference`, `medical_reference`, `repair_reference`, entre otras, más la etiqueta agrupadora `reference`.
- Reconocimiento de escenas: 558 escenas distintas.
- Evaluación de calidad técnica: nitidez (`sharp`), desenfoque global (`blurry`), bokeh, momento destacado (`peak_moment`) y rotación detectada.
- Etiquetas de conservación o descarte: `keeper`, `forgettable`, `accidental`, `technical_flaw`, `unusable`, `bad_framing`, `bad_lighting`, `test_or_duplicate_shot`, `low_content`, entre otras.
- Análisis de personas: detección de presencia de personas, retrato, foto grupal (tres o más caras), sonrisa, ojos cerrados, candid.
- Análisis por cara: `eyes_closed`, `smiling`, `looking_at_camera`, `looking_away`, `happy`, `surprised`.
- Detección de contenido sensible: etiqueta general `sensitive` con subetiquetas `nsfw_explicit`, `nsfw_suggestive`, `blood` (la lista se trunca en la documentación disponible).
- Puntuación estética: percentil de la foto comparada con otras (por ejemplo, 0,81 significa mejor que el 81 % de las fotos).
- Detección de rostros, personas y mascotas.
- Selección de recortes: `bestCrop(aspect:)` devuelve el mejor recorto en coordenadas normalizadas 0...1 para un aspecto dado.
- Detección de rotación EXIF y decodificación respetando la orientación.
- Utilidades de la librería acompañante: agrupación de duplicados en una biblioteca (`Eye.duplicates`) y selección de la mejor foto de una ráfaga (`Eye.best(of:)`).
- Cancelación de análisis en Swift mediante cancelación de la tarea asíncrona.

## Casos de uso

- Organización automática de bibliotecas de fotos: una app de galería puede etiquetar cada foto al importarla (tipo, escena, calidad) y construir colecciones inteligentes y búsqueda sin servidor, gracias a que todo el análisis ocurre en el dispositivo.
- Limpieza de bibliotecas y liberación de espacio: las etiquetas `unusable`, `accidental`, `test_or_duplicate_shot` y `low_content` permiten proponer al usuario fotos candidatas a borrado, y `Eye.duplicates` agrupa tomas duplicadas para conservar solo la mejor.
- Selección de la mejor toma en ráfagas: apps de cámara pueden usar `Eye.best(of:)` para sugerir automáticamente la mejor foto de una ráfaga, combinando nitidez, ojos abiertos y sonrisas.
- Generación de miniaturas y avatares: `bestCrop(aspect:)` permite recortar automáticamente retratos o productos con el sujeto bien encuadrado, útil en redes sociales y catálogos de comercio electrónico.
- Moderación de contenido subido por usuarios: la etiqueta `sensitive` con umbral estricto (0,9) permite ocultar o retener contenido NSFW o con sangre antes de publicarlo, sin enviar imágenes a terceros.
- Digitalización de documentos: detectar `receipt`, `document`, `id_card` o `whiteboard` permite dirigir cada captura al flujo adecuado (OCR, archivado de gastos, notas de reuniones).
- Filtrado de capturas de pantalla y memes: apps de mensajería o backup pueden separar `screenshot` y `meme_or_graphic` de fotografías reales para aplicar compresión o almacenamiento distinto.
- Búsqueda semántica local en apps de fotos: con 558 escenas y etiquetas de personas y mascotas, se puede implementar búsqueda por texto simple ("playa", "perro", "foto grupal") sin indexación en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica documentada es el sistema de confianza calibrado por etiqueta, con umbrales recomendados de 0,5 (equilibrio precisión/recall) y 0,9 (alta precisión), pero no se publican cifras de precisión, recall ni latencia concretas.

## Requisitos de hardware

- Al tratarse de un modelo on-device compacto (repositorio de 0,1 GB), no requiere GPU de servidor ni VRAM dedicada; está diseñado para ejecutarse en CPU y GPU de dispositivos de consumo.
- Plataformas soportadas: iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegadores web y Node.js.
- En navegador: aceleración por WebGPU cuando el navegador la soporta, con fallback a WebAssembly sobre CPU.
- En Apple: aceleración mediante Core ML (GPU/Neural Engine según configuración del sistema, no especificado en la documentación).
- En Linux y Windows: se pasan píxeles decodificados (`ImagePixels` en Swift), por lo que la decodificación de imagen corre por cuenta del integrador.
- Despliegue: SDKs oficiales vía Swift Package Manager (`desert-ant-core`), Gradle/Maven (`ai.desertant:eye:4.2.3`) y npm (`@desert-ant-labs/eye`, con `@litertjs/core` para navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Despliegue | Formato | Licencia |
|---|---|---|---|---|
| Eye (Desert Ant Labs) | Etiquetado, calidad, caras, estética, recortes, sensibilidad | On-device (iOS, Android, escritorio, web) | LiteRT, Core ML | Source-available propia |
| CLIP (OpenAI) | Clasificación zero-shot de imágenes vía texto | Servidor o on-device con esfuerzo adicional | PyTorch, ONNX | MIT (pesos con licencia propia en algunos casos) |
| MobileNet / EfficientNet-Lite | Clasificación de imágenes (ImageNet) | On-device, TFLite | TFLite | Apache 2.0 |
| NSFW.js / modelos NSFW dedicados | Detección de contenido sensible en navegador | On-device (web) | TFJS | Variable |

Eye se diferencia de alternativas como CLIP en que ofrece un conjunto cerrado y calibrado de etiquetas orientadas a gestión fotográfica (calidad, caras, duplicados, recortes) con SDKs nativos listos para producción, mientras que CLIP es más flexible pero requiere construir toda la lógica de aplicación. Frente a MobileNet, cubre muchas más tareas además de la clasificación de escenas. La licencia source-available es más restrictiva que las Apache 2.0 o MIT de las alternativas clásicas; conviene revisar https://license.desertant.com/ antes de uso comercial.

## Limitaciones y advertencias

- Licencia no estándar: `desert-ant-labs-source-available` no es una licencia open source reconocida (OSI); los términos de uso comercial deben revisarse en el enlace de la licencia antes de integrar el modelo en producto.
- El modelo está en estado Beta, por lo que la API y las etiquetas pueden cambiar entre versiones.
- No se publican métricas de precisión, recall ni latencia, lo que dificulta evaluar su idoneidad sin pruebas propias.
- El modelo no genera texto ni descripciones en lenguaje natural: produce etiquetas fijas en inglés, por lo que la localización de las etiquetas a la interfaz de la app corre por cuenta del desarrollador.
- Las etiquetas de contenido sensible están calibradas con umbrales genéricos; para acciones automáticas de ocultado o borrado, el propio autor recomienda el umbral estricto de 0,9 y aún así conviene validación humana.
- La lista de etiquetas sensibles aparece truncada en la documentación disponible, por lo que puede haber categorías no documentadas aquí.
- En Linux y Windows no se decodifican archivos directamente: hay que pasar píxeles RGB/RGBA ya orientados, lo que añade una capa de responsabilidad al integrador (orientación EXIF, espacio de color).
- Riesgo de errores de clasificación en casos límite (ilustraciones realistas, fotos de pantallas, documentos fotografiados en malas condiciones): no hay datos publicados sobre estos fallos.
- Sesgos del modelo: no disponibles; no se documenta la composición del dataset de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/desert-ant-labs/eye
- Pesos v1.0.0: https://huggingface.co/desert-ant-labs/eye/tree/v1.0.0
- Demo oficial: https://desertant.com/models/eye/
- Repositorio de la librería desert-ant-core: https://github.com/Desert-Ant-Labs/desert-ant-core
- Licencia: https://license.desertant.com/
- Requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Requisitos JavaScript y TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript

# desert-ant-labs/eye

## Resumen

Eye es un modelo de visión artificial orientado a la comprensión de fotografías en dispositivo ("on-device"), desarrollado por Desert-Ant-Labs. No se trata de un modelo generativo de lenguaje, sino de un clasificador y analizador de imágenes empaquetado en formato LiteRT/TFLite y Core ML, pensado para ejecutarse localmente en iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node. Su función es puntuar, etiquetar y recortar fotos: identificar el tipo de imagen (captura de pantalla, recibo, selfi, documento), el contenido (558 escenas), la calidad (desenfoque, ojos cerrados), las personas y mascotas presentes, y detectar contenido sensible.

El modelo resuelve un problema concreto de las aplicaciones de gestión de fotos: permitir búsqueda, filtrado y organización de bibliotecas fotográficas sin enviar imágenes a la nube, con la privacidad y la latencia que ello implica. Cada etiqueta se acompaña de una confianza calibrada, de modo que un umbral de 0,5 sirve como corte recomendado y 0,9 como corte estricto para acciones automáticas (ocultar, borrar).

La relevancia actual del modelo reside en su enfoque de despliegue multiplataforma con aceleración por GPU en navegador vía WebGPU y ejecución nativa en dispositivos móviles y de escritorio. El repositorio ocupa 0,2 GB y la versión de pesos publicada es la v1.1.0, en estado beta. No se dispone de información sobre la arquitectura interna de la red ni sobre el volumen o composición del conjunto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de visión empaquetado en LiteRT/TFLite y Core ML) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas de salida están en inglés en la API) |
| Licencia | desert-ant-labs-source-available (licencia propia, enlazada en license.desertant.com) |
| Formato de pesos | LiteRT / TFLite y Core ML (repo de 0,2 GB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna de la red neuronal (tipo de backbone, número de capas, mecanismo de atención, etc.) ni sobre el conjunto de datos de entrenamiento, el número de imágenes utilizadas, la composición del dataset o si se aplicaron técnicas de ajuste fino con refuerzo o preferencias. La model card únicamente describe el comportamiento de salida: clasificación multietiqueta con confianzas calibradas, detección de rostros, detección de personas y mascotas, selección de recortes y estimación de rotación.

La innovación técnica destacable no está en la arquitectura sino en el empaquetado y la distribución: el modelo se exporta a LiteRT/TFLite para Android, Linux, Windows y navegador (con ejecución en GPU mediante WebGPU o en CPU mediante WebAssembly), y a Core ML para el ecosistema Apple. El SDK asociado (desert-ant-core) gestiona la decodificación de archivos respetando la orientación EXIF, la cancelación de tareas, la agrupación de duplicados y la selección de la mejor toma de una ráfaga. Las confianzas están calibradas de forma que los mismos umbrales (0,5 y 0,9) funcionan para todas las etiquetas.

## Capacidades

- Clasificación del tipo de foto: `photo`, `selfie`, `screenshot`, `photo_of_screen`, `receipt`, `document`, `id_card`, `whiteboard`, `map`, `chart_or_slide`, `meme_or_graphic`, `illustration_or_art`, entre otras.
- Etiquetado de 558 escenas (playa, perro, etc.) con confianza calibrada por etiqueta.
- Evaluación de calidad: `sharp`, `blurry`, `bokeh`, `peak_moment`, `rotated`.
- Análisis de personas: `people`, `group_shot` (tres o más rostros), `portrait`, `smiling`, `eyes_closed`, `everyone_smiling`, `everyone_looking`, `candid`.
- Análisis por rostro individual: `eyes_closed`, `smiling`, `looking_at_camera`, `looking_away`, `happy`, `surprised`.
- Detección de contenido sensible (`sensitive`) con umbral estricto opcional.
- Puntuación estética (`scores.aesthetic`), donde 0,81 significa mejor que el 81 % de las fotos.
- Detección de personas, mascotas y rostros.
- Selección del mejor recorte (`bestCrop(aspect:)`) en coordenadas normalizadas.
- Detección de rotación de la imagen.
- Agrupación de duplicados (`Eye.duplicates`) y elección de la mejor toma de una ráfaga (`Eye.best`).
- Ejecución multiplataforma: iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.
- No soporta tool calling, agentes, generación de texto ni razonamiento multi-paso; es un modelo puramente perceptivo.

## Casos de uso

- Organización automática de bibliotecas fotográficas: el SDK permite filtrar por tipo de contenido (`screenshot`, `receipt`, `document`) y agrupar duplicados con `Eye.duplicates`, de modo que una app de galería puede archivar o agrupar fotos sin intervención del usuario y sin subir imágenes a la nube.
- Limpieza de carretes fotográficos: combinando las etiquetas `keeper`, `forgettable`, `accidental`, `technical_flaw` y `unusable`, una aplicación puede sugerir qué fotos borrar, usando el umbral estricto (0,9) para las acciones destructivas.
- Selección de la mejor toma en ráfagas: `Eye.best(of: burst)` elige la foto con mejor puntuación estética y de calidad, útil en apps de cámara o edición que quieran destacar automáticamente la mejor imagen de una serie.
- Moderación y privacidad en el dispositivo: la etiqueta `sensitive` con corte estricto permite ocultar contenido delicado en galerías compartidas o en pantallas de bloqueo, sin enviar las imágenes a servidores externos.
- Generación de miniaturas inteligentes: `bestCrop(aspect: 1)` devuelve un recorte cuadrado en coordenadas normalizadas, adecuado para avatares, tarjetas de previsualización o listados de productos.
- Clasificación de documentos y recibos: las etiquetas `receipt`, `document`, `id_card` y `whiteboard` permiten enrutar capturas hacia flujos de digitalización, OCR o archivo contable.
- Aplicaciones de bienestar o análisis de retratos: las etiquetas por rostro (`eyes_closed`, `smiling`, `looking_at_camera`) permiten avisar al usuario antes de guardar una foto con los ojos cerrados o seleccionar automáticamente el mejor retrato de un grupo.
- Procesamiento local en navegador: con WebGPU o WebAssembly, una web app puede analizar imágenes sin backend, lo que resulta útil para herramientas de edición o galerías web con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 0,2 GB, pero no se especifica el tamaño del modelo cargado en memoria ni el consumo por cuantización.
- GPU recomendadas: no se indican modelos concretos. El SDK emplea WebGPU en navegador cuando está disponible y recurre a WebAssembly en caso contrario; en Apple se usa Core ML.
- Compatibilidad con GPU de consumo: el modelo está diseñado explícitamente para ejecutarse en dispositivos de consumo (móviles, portátiles, navegador), por lo que cabe en hardware consumer, aunque no se publican cifras de VRAM.
- Opciones de despliegue: SDK nativo de Desert-Ant-Labs para Swift (iOS/macOS/tvOS/visionOS), Kotlin (Android), JavaScript/TypeScript (`@desert-ant-labs/eye` con `@litertjs/core` en navegador y build nativo en Node), y ejecución en Linux y Windows pasando píxeles decodificados (`ImagePixels`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Eye se distingue por su enfoque de clasificación multietiqueta de fotos con confianzas calibradas y despliegue multiplataforma en dispositivo, pero no se han facilitado datos de otros modelos de la misma categoría (por ejemplo, clasificadores de estética o de contenido fotográfico) para establecer una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Eye (desert-ant-labs) | no disponible | no aplica | source-available propia | Hugging Face, SDK multiplataforma |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Estado beta: la model card indica explícitamente que el modelo está en fase beta, por lo que su comportamiento puede cambiar entre versiones.
- Sesgos: no se documentan sesgos conocidos, pero al ser un clasificador de imágenes entrenado con datos no especificados, es probable que herede sesgos de representación en escenas, personas y culturas; no hay información para evaluarlo.
- Alucinación: al ser un modelo discriminativo (clasificación), no genera texto libre, por lo que el riesgo de alucinación se traduce en falsos positivos o negativos en las etiquetas; las confianzas calibradas mitigan este riesgo si se eligen umbrales adecuados.
- Limitaciones de idioma: no procesa texto; las etiquetas de la API están en inglés y no se documenta localización.
- Licencia: la licencia `desert-ant-labs-source-available` es propia y no es una licencia de código abierto estándar; es imprescindible revisar los términos en https://license.desertant.com/ antes de cualquier uso comercial, ya que puede imponer restricciones.
- Dependencia del SDK: el uso práctico del modelo requiere el SDK de Desert-Ant-Labs (versión 6.0.0 o superior), lo que añade una dependencia de terceros y limita la portabilidad a los entornos soportados.
- Plataformas no soportadas de forma nativa: en Linux y Windows es necesario pasar píxeles ya decodificados y en orientación correcta, lo que traslada parte del trabajo al integrador.
- Sin datos de rendimiento: no hay benchmarks publicados que permitan estimar precisión, recall o latencia en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/eye
- Pesos v1.1.0: https://huggingface.co/desert-ant-labs/eye/tree/v1.1.0
- Demo: https://desertant.com/models/eye/
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Documentación fuente de la model card: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/eye.md
- Licencia: https://license.desertant.com/

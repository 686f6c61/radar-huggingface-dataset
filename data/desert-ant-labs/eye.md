# desert-ant-labs/eye

## Resumen

Eye es un modelo de clasificación de imágenes y comprensión fotográfica diseñado por Desert Ant Labs para ejecutarse íntegramente en el dispositivo (on-device). A diferencia de los modelos de visión generativos, Eye no produce texto libre: su función es puntuar, etiquetar y recortar fotografías, devolviendo un conjunto de etiquetas con confianza calibrada sobre escenas, calidad, personas, mascotas, rostros y contenido sensible. Está empaquetado en formato LiteRT/TFLite y Core ML, con SDKs nativos para Swift, Kotlin y JavaScript.

El modelo resuelve un problema muy concreto en aplicaciones de gestión de fototecas: filtrar, agrupar y priorizar imágenes sin enviar datos a la nube. Cubre 558 escenas, distingue tipos de captura (captura de pantalla, recibo, selfi, documento, pizarra), evalúa calidad técnica (desenfoque, ojos cerrados, encuadre) y detecta contenido sensible con dos umbrales de confianza predefinidos (0,5 recomendado y 0,9 estricto). El repositorio ocupa 0,2 GB y la versión de pesos publicada es la v1.1.0.

La relevancia actual del modelo reside en su enfoque de privacidad por diseño y su despliegue multiplataforma: iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node. El estado del proyecto es beta según la model card, y la licencia es propietaria de disponibilidad de código fuente (source-available), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de visión para clasificación de imágenes, empaquetado en LiteRT/TFLite y Core ML) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | desert-ant-labs-source-available (propietaria, source-available) |
| Formato de pesos | LiteRT / TFLite, Core ML |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo en la documentación proporcionada. La model card no detalla el tipo de red (CNN, transformer visual, híbrido), el número de parámetros, el volumen de datos de entrenamiento ni la composición del dataset. Tampoco se especifica si se emplearon técnicas de ajuste fino supervisado, destilación o calibración de confianza, aunque la existencia de umbrales calibrados (0,5 y 0,9) sugiere un proceso explícito de calibración de las salidas por etiqueta.

El modelo se distribuye como artefactos LiteRT/TFLite y Core ML, lo que indica una optimización para inferencia en dispositivos con recursos limitados. La integración con WebGPU y WebAssembly en navegador, y con núcleos nativos precompilados en Node, apunta a un diseño orientado a latencia baja y ejecución local. No se han publicado detalles sobre el proceso de entrenamiento, el número de tokens o imágenes vistas, ni sobre posibles fases de RLHF o DPO, que en un modelo de clasificación no resultan aplicables del mismo modo.

## Capacidades

- Clasificación de tipo de captura: foto, selfi, captura de pantalla, foto de pantalla, recibo, documento, carné de identidad, pizarra, mapa, gráfico o diapositiva, meme o gráfico, ilustración o arte, referencia de compra, referencia médica, referencia de reparación y otros.
- Etiquetado de escenas: hasta 558 escenas reconocibles con confianza calibrada por etiqueta.
- Evaluación de calidad fotográfica: nitidez, desenfoque global, bokeh con sujeto nítido, momento cumbre, rotación.
- Clasificación para conservar o descartar: keeper, forgettable, accidental, technical_flaw, unusable, bad_framing, bad_lighting, test_or_duplicate_shot, reference_photo, low_content.
- Análisis de personas y grupos: detección de personas, grupo (tres o más rostros), retrato (un rostro principal), sonrisa, ojos cerrados, todos sonriendo, todos mirando, espontáneo.
- Análisis facial por rostro: ojos cerrados, sonrisa, mirada a cámara, mirada desviada, feliz, sorprendido.
- Detección de contenido sensible: etiqueta agregada `sensitive` y subetiquetas como nsfw_explicit, nsfw_suggestive, sangre, entre otras.
- Puntuación estética: valor de 0 a 1 interpretado como percentil (por ejemplo, 0,81 indica mejor que el 81 % de las fotos).
- Detección de personas, mascotas y rostros, con recorte automático del mejor encuadre para una relación de aspecto dada.
- Agrupación de duplicados y selección del mejor disparo de una ráfaga.
- Corrección de orientación EXIF en la decodificación de archivos y datos.
- Ejecución en GPU vía WebGPU o CPU vía WebAssembly en navegador, con selección explícita del acelerador.

## Casos de uso

- Gestión inteligente de fototecas: la aplicación puede filtrar automáticamente capturas de pantalla, recibos y documentos para archivarlos en colecciones separadas, usando la etiqueta de tipo de captura y el umbral de confianza de 0,5 para no perder recall.
- Limpieza y curaduría de bibliotecas personales: el modelo identifica fotos desenfocadas, con ojos cerrados, accidentales o de bajo contenido, lo que permite sugerir borrados o agrupaciones sin intervención manual y sin enviar imágenes a servidores externos.
- Selección del mejor disparo en ráfagas: mediante `Eye.best(of:)` y la puntuación estética, la app puede elegir la mejor foto de una ráfaga o de un conjunto de duplicados, priorizando nitidez, encuadre y expresividad facial.
- Moderación de contenido sensible en el dispositivo: con el umbral estricto de 0,9, la aplicación puede ocultar automáticamente imágenes marcadas como sensibles antes de mostrarlas en galerías compartidas o en pantallas públicas, reduciendo el riesgo de falsos positivos en acciones destructivas.
- Recorte automático para miniaturas y avatares: `bestCrop(aspect:)` devuelve una región normalizada en el rango 0 a 1 que la app puede aplicar para generar miniaturas cuadradas o de otra relación sin recortes manuales.
- Búsqueda y filtrado por contenido: con 558 escenas y etiquetas de personas y mascotas, un buscador local puede responder consultas como "perros en la playa" o "grupos sonriendo" sin indexación en la nube.
- Aplicaciones de accesibilidad: la detección de rostros, ojos cerrados y mirada permite construir funciones de asistencia que describan o alerten sobre el contenido de una foto antes de compartirla.
- Flujos de referencia visual: las etiquetas de referencia (compra, médica, reparación) permiten clasificar capturas tomadas para recordar información y recuperarlas después por categoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 0,2 GB, lo que sugiere un modelo compacto apto para dispositivos móviles y de escritorio, aunque no se especifica el tamaño exacto de los pesos ni el número de parámetros.
- Al estar empaquetado en LiteRT/TFLite y Core ML, está pensado para ejecutarse en CPU, GPU integrada o NPU de dispositivos Apple y Android, así como en navegador mediante WebGPU o WebAssembly.
- No se dispone de cifras de VRAM ni de requisitos mínimos de GPU dedicada. Por el tamaño del repositorio, es razonable esperar que quepa en GPUs de consumo, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: SDK nativo Swift (iOS, macOS, tvOS, visionOS), Kotlin (Android), JavaScript en navegador con WebGPU o WebAssembly, y Node con núcleo nativo precompilado. También se mencionan Linux y Windows con paso de píxeles decodificados.
- No se han publicado cifras de latencia ni de throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Eye se posiciona como un modelo especializado de etiquetado fotográfico on-device, una categoría en la que no se han identificado alternativas directas con datos verificables en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Eye | no disponible | no aplica | source-available propietaria | LiteRT/TFLite, Core ML | Etiquetado y puntuación fotográfica on-device |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está en estado beta según la propia model card, por lo que su comportamiento en producción puede cambiar entre versiones.
- La licencia es propietaria y de tipo source-available, no open source; el uso comercial está sujeto a los términos publicados en https://license.desertant.com/, que deben revisarse antes de integrar el modelo en un producto.
- No se han publicado detalles sobre sesgos en el etiquetado de escenas, rostros o contenido sensible; cabe esperar sesgos derivados de los datos de entrenamiento, que no son públicos.
- La detección de contenido sensible con umbral estricto de 0,9 reduce falsos positivos, pero no elimina el riesgo de clasificaciones erróneas; las acciones destructivas o irreversibles (borrado, ocultación permanente) deben ir acompañadas de confirmación o de mecanismos de recuperación.
- La puntuación estética es un percentil relativo y subjetivo; no debe interpretarse como una medida objetiva de calidad artística.
- El modelo no genera texto ni mantiene conversaciones; no es adecuado para tareas de razonamiento, generación de código o descripción libre de imágenes.
- No se especifican los idiomas soportados porque el modelo no procesa texto; las etiquetas y la API están en inglés.
- No hay información pública sobre el rendimiento en condiciones de poca luz, imágenes sintéticas o dominios muy alejados de la fotografía de consumo.
- La integración en Linux y Windows requiere pasar píxeles decodificados manualmente, lo que añade complejidad frente a las plataformas con SDK nativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/eye
- Pesos v1.1.0: https://huggingface.co/desert-ant-labs/eye/tree/v1.1.0
- Demo: https://desertant.com/models/eye/
- Licencia: https://license.desertant.com/
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Documentación del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md

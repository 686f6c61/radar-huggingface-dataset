# desert-ant-labs/moderator

## Resumen

Moderator es un clasificador de imágenes disenado para detectar desnudez y contenido sexual antes de que una imagen se suba o se muestre en una aplicación. Lo desarrolla Desert Ant Labs y se distribuye como pesos compilados para Core ML (int8) y LiteRT/TFLite (int8), con un tamano de 9,7 MB y 9,2 MB respectivamente. El modelo no es un transformer generativo, sino un clasificador de visión compacto pensado para ejecutarse íntegramente en el dispositivo.

La propuesta diferencial es doble: por un lado, la inferencia es local, de modo que las imágenes no salen del dispositivo del usuario; por otro, el autor afirma que el entrenamiento se ha realizado exclusivamente con datos con licencia permisiva (dominio público o Creative Commons) y datos sintéticos, sin scraping de internet. Esto resulta relevante para equipos que necesitan moderación de contenido con trazabilidad de datos y cumplimiento normativo.

El modelo devuelve una puntuación continua de 0 a 1 junto con decisiones por región (pezones, genitales, nalgas, desnudez y acto sexual), lo que permite políticas granulares como permitir torso desnudo pero bloquear genitales. Se integra mediante SDKs oficiales para Swift, Kotlin y JavaScript, con soporte para iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador de imágenes; pesos distribuidos como Core ML y LiteRT/TFLite) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | int8 (pesos Core ML y TFLite ya cuantizados) |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | desert-ant-labs-source-available (licencia propia, enlace en https://license.desertant.com/) |
| Formato de pesos | Core ML compilado (`.mlmodelc`) y LiteRT/TFLite (`.tflite`) |
| Tamano de pesos | 9,7 MB (Core ML int8), 9,2 MB (TFLite int8) |
| Entrada | imagen (archivo, imagen de plataforma o píxeles RGB/RGBA) |
| Salida | puntuación NSFW 0-1, decisión booleana y confianza por región |
| Regiones detectadas | `nipples`, `genitals`, `buttocks`, `nude`, `sexAct` |
| Plataformas | iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador, Node |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (familia de backbone, número de capas o parámetros). Lo que sí se especifica es el pipeline de inferencia: el SDK puntúa varios recortes (crops) de la imagen y toma el máximo de las puntuaciones. El ajuste `quality` controla cuántos recortes se evalúan: `fast` puntúa un único recorte central, `balanced` puntúa cuatro teselas multiescala y `accurate` (por defecto) puntúa esas teselas y sus reflejos. La puntuación final es la mayor de las puntuaciones de región que la política configurada tiene en cuenta.

En cuanto a los datos, el autor afirma que ninguna imagen se ha extraído de internet: todo el corpus de entrenamiento es de dominio público, Creative Commons o sintético. No se han publicado el número de imágenes, la composición exacta del dataset, ni si hubo etapas de ajuste fino supervisado adicionales. Tampoco se documentan técnicas como destilación, pruning o aumentación más allá de lo implícito en el pipeline de recortes.

## Capacidades

- Clasificación binaria de contenido NSFW con umbral configurable (por defecto 0,5).
- Puntuación continua de 0 a 1 por imagen, útil para ranking y umbrales ajustables.
- Detección por región: pezones, genitales, nalgas, desnudez global y acto sexual.
- Políticas predefinidas: `standard` y `allowTopless`, que ignora el torso desnudo aislado pero sigue marcando genitales, nalgas, desnudez total y actividad sexual.
- Tres modos de calidad que intercambian recall por velocidad: `fast`, `balanced` y `accurate`.
- Procesamiento en dispositivo sin envío de imágenes a servidores externos.
- Soporte de orientación EXIF en la decodificación de archivos y `Data` (SDK Swift).
- Cancelación de tareas en curso mediante `CancellationError` (SDK Swift).
- Integración multiplataforma mediante SDKs oficiales (Swift, Kotlin, JavaScript) y descarga y caché automática de pesos desde Hugging Face.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de texto: es exclusivamente un clasificador de imágenes.

## Casos de uso

- Moderación previa a la subida en apps de fotos o redes sociales: el SDK analiza la imagen antes de enviarla al backend, de modo que el contenido NSFW se bloquea o difumina en el propio dispositivo y solo viaja lo permitido.
- Filtrado de avatares y fotos de perfil: con el modo `accurate` y umbral ajustado se reduce el riesgo de falsos positivos en fotos de playa o ropa interior, manteniendo el bloqueo de desnudez real.
- Moderación de vídeo en tiempo casi real: el modo `fast` puntúa un único recorte central por fotograma, y el muestreo entre fotogramas recupera recall, lo que lo hace adecuado para pipelines de vídeo donde la latencia importa.
- Aplicaciones de mensajería con detección de imágenes no solicitadas: el modelo se ejecuta localmente en el cliente, evitando que la imagen se transmita a un servidor de moderación y reduciendo la exposición de datos sensibles.
- Cumplimiento de políticas con granularidad regional: la detección por región permite implementar políticas como permitir torso desnudo (`allowTopless`) en plataformas donde esa política es aceptable, bloqueando genitales y actividad sexual.
- Moderación en aplicaciones de escritorio y web: el SDK de JavaScript permite integrar el clasificador en navegador (con LiteRT) o en Node con `sharp` para procesar lotes de imágenes en servidor.
- Pre-filtro en pipelines de curación de datasets: descartar imágenes NSFW antes de que entren en procesos de anotación o entrenamiento, reduciendo costes y riesgos legales.
- Control parental en apps infantiles: clasificación local de imágenes recibidas o compartidas, con umbral conservador para priorizar el bloqueo.

## Benchmarks y rendimiento

El autor publica métricas de recall y especificidad por modo de calidad, pero no benchmarks estándar (MMLU, HumanEval, etc., que no aplican a un clasificador de imágenes).

| Modo de calidad | Recall | Especificidad | Uso recomendado |
|---|---:|---:|---|
| `fast` | 74% | 97% | Fotogramas de vídeo; el muestreo entre fotogramas recupera recall |
| `balanced` | 84% | 95% | Mayor recall por fotograma |
| `accurate` (por defecto) | 88% | 94% | Imágenes individuales |

No se han publicado resultados de benchmarks estándar de clasificación de imágenes (por ejemplo, AUC, F1 o comparativas con otros clasificadores NSFW) en la información disponible. Las cifras anteriores son las declaradas por el autor en la model card y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; los pesos ocupan 9,2-9,7 MB en int8 y la inferencia se ejecuta en CPU, GPU integrada o aceleradores del dispositivo (Core ML en Apple, LiteRT en el resto).
- GPU recomendadas: no se especifican; el modelo está pensado para ejecutarse en el hardware del dispositivo (móvil, portátil, navegador) sin GPU dedicada.
- Cabe en cualquier dispositivo consumer: móviles Android e iOS, Mac, PC con Windows o Linux, y navegador.
- Opciones de despliegue: SDKs oficiales de Desert Ant Labs para Swift (Core ML), Kotlin (LiteRT) y JavaScript (LiteRT en navegador, núcleo nativo en Node). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El autor solo indica que el modo `fast` es el más rápido y el `accurate` el más costoso, sin cifras de latencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo cualitativo, las alternativas habituales en moderación NSFW de imágenes (clasificadores basados en CNN o transformers de visión, a menudo con pesos de decenas o cientos de MB) no se han evaluado aquí con métricas comparables. La ventaja declarada de Moderator frente a alternativas genéricas es su tamano reducido (menos de 10 MB), la ejecución en dispositivo y la procedencia controlada de los datos de entrenamiento. Cualquier comparación de rendimiento con modelos concretos requeriría una evaluación independiente que no está en la información disponible.

## Limitaciones y advertencias

- Las puntuaciones por región no son probabilidades calibradas: un 0,8 no implica un 80% de probabilidad, solo un ranking relativo.
- El recall en modo `fast` es del 74%, lo que implica falsos negativos relevantes si se usa en imágenes individuales; está pensado para vídeo con muestreo entre fotogramas.
- El umbral por defecto (0,5) puede requerir ajuste según la política y el coste relativo de falsos positivos y negativos.
- No se documentan sesgos demográficos, de tono de piel, de género o culturales; la evaluación por subgrupos no está publicada.
- La licencia es propia (`desert-ant-labs-source-available`), no una licencia open source estándar; es imprescindible revisar los términos en https://license.desertant.com/ antes de uso comercial.
- El modelo solo clasifica imágenes; no procesa texto, audio ni vídeo de forma nativa (el vídeo se aborda fotograma a fotograma desde la aplicación).
- La descarga de pesos se realiza desde Hugging Face en el primer uso y se cachea; en entornos sin red o con restricciones de salida esto debe planificarse.
- No se han publicado detalles de arquitectura, parámetros ni composición exacta del dataset, lo que limita la auditoría técnica independiente.
- El modelo está marcado como `not-for-all-anecdotes`/`not-for-all-audiences` en Hugging Face por la naturaleza del contenido que detecta; su uso debe acompañarse de controles adecuados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/moderator
- Pesos v1.1.0: https://huggingface.co/desert-ant-labs/moderator/tree/v1.1.0
- Demo: https://desertant.com/models/moderator/
- Licencia: https://license.desertant.com/
- Repositorio del SDK (desert-ant-core): https://github.com/Desert-Ant-Labs/desert-ant-core
- Documentación de requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Documentación de requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Documentación de requisitos JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Descarga y caché de modelos: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#model-downloads-and-caching

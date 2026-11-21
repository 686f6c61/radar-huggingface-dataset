# desert-ant-labs/moderator

## Resumen

Moderator es un clasificador de imágenes especializado en detección de contenido NSFW (desnudos y actividad sexual) desarrollado por Desert-Ant-Labs. A diferencia de la mayoría de modelos de moderación disponibles, está entrenado exclusivamente con datos de procedencia controlada: imágenes con licencias permisivas (dominio público o Creative Commons) y datos sintéticos generados internamente, sin scraping de internet. El modelo se distribuye en formatos compilados para inferencia en dispositivo (Core ML int8 y LiteRT/TFLite int8) con un tamaño de apenas 9,7 MB y 9,2 MB respectivamente.

La propuesta de valor es la moderación local: la imagen nunca abandona el dispositivo del usuario, lo que elimina riesgos de privacidad y cumple con requisitos de RGPD en aplicaciones que procesan contenido sensible. El modelo devuelve una puntuación continua de 0 a 1 junto con decisiones por región anatómica (pezones, genitales, nalgas, desnudo y acto sexual), lo que permite implementar políticas granulares como permitir torso desnudo pero bloquear genitales.

Está pensado para integración en aplicaciones móviles y web mediante SDKs oficiales en Swift, Kotlin y JavaScript/TypeScript, con soporte para iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node. No es un modelo de lenguaje ni un transformer generativo: es un clasificador de imágenes convolucional o híbrido compilado para ejecución eficiente en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (clasificador de imágenes compilado para Core ML y LiteRT) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de texto) |
| Tipos de cuantización | int8 (pesos compilados en Core ML y LiteRT/TFLite) |
| Idiomas soportados | No disponible (modelo de clasificación visual, sin procesamiento de texto) |
| Licencia | desert-ant-labs-source-available (source-available, no open source) |
| Formato de pesos | Core ML compilado (`.mlmodelc`) y LiteRT/TFLite (`.tflite`) |
| Tamaño de pesos | 9,7 MB (Core ML int8) / 9,2 MB (LiteRT int8) |
| Plataformas | iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador, Node |
| Pipeline | image-classification |
| Entrada | Imagen (archivo, imagen de plataforma o píxeles RGB/RGBA) |
| Salida | Score NSFW 0–1, decisión booleana con umbral, scores por región |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (número de capas, tipo de backbone, resolución de entrada o técnica de compresión). Lo que sí se especifica es que los pesos se distribuyen compilados y cuantizados a int8 para dos runtimes: Core ML en plataformas Apple y LiteRT/TFLite en el resto. El modelo se evalúa sobre recortes multiescala y sus reflejos (ajuste `accurate`), y la puntuación final es el máximo entre los recortes evaluados.

El entrenamiento destaca por su procedencia de datos completamente controlada: ninguna imagen se ha extraído de internet. Los ejemplos positivos provienen de material de dominio público o Creative Commons, complementados con datos sintéticos generados internamente. No se especifica el número de imágenes de entrenamiento, la composición exacta del dataset, la resolución de entrenamiento ni si se aplicaron técnicas de ajuste fino adicional (RLHF no aplica; podría haber calibración por umbral, pero no se documenta). Tampoco se detalla la función de pérdida ni el esquema de aumentación de datos.

## Capacidades

- Clasificación binaria de contenido NSFW con puntuación continua de 0 a 1 y umbral configurable (por defecto 0,5).
- Detección por región anatómica: `nipples`, `genitals`, `buttocks`, `nude` y `sexAct`, con una puntuación independiente por cada una.
- Políticas configurables: modo `standard` y modo `allowTopless`, que ignora el torso desnudo aislado pero sigue bloqueando genitales, nalgas, desnudo completo y actividad sexual.
- Ajuste de calidad/velocidad con tres modos: `fast` (un recorte central), `balanced` (cuatro teselas multiescala) y `accurate` (teselas más sus reflejos, configuración de evaluación).
- Procesamiento en dispositivo sin envío de imágenes a servidores externos.
- Manejo correcto de orientación EXIF en la decodificación de archivos y datos.
- Cancelación de análisis mediante cancelación de la tarea invocante (en Swift lanza `CancellationError`).
- Soporte multiplataforma mediante SDKs oficiales en Swift, Kotlin y JavaScript/TypeScript.
- Descarga y caché automática de pesos desde Hugging Face en el primer uso.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de texto: es exclusivamente un clasificador visual.

## Casos de uso

- Moderación previa a la subida en aplicaciones de fotos y redes sociales: el SDK analiza la imagen en el dispositivo antes de enviarla al servidor, de modo que el contenido NSFW nunca llega a los sistemas backend ni a los logs. Adecuado por su tamaño reducido y su ejecución local.
- Filtrado en aplicaciones de mensajería y dating: integración en el pipeline de envío de imágenes para bloquear o difuminar contenido sexual antes de que el destinatario lo vea, con política `allowTopless` para apps de playa o natación.
- Moderación de vídeo en tiempo casi real: el modo `fast` puntúa un único recorte central por fotograma con una latencia mínima; el muestreo entre fotogramas recupera la exhaustividad (74 % de recall por fotograma, 97 % de especificidad).
- Cumplimiento normativo y privacidad (RGPD): aplicaciones que no pueden enviar imágenes de usuarios a servicios en la nube encuentran aquí un clasificador que opera íntegramente en el dispositivo, sin transferencia de datos personales.
- Protección infantil en plataformas educativas o foros: bloqueo automático de imágenes con desnudos o actividad sexual antes de su publicación, con umbral ajustable para priorizar la seguridad sobre la experiencia de usuario.
- Moderación en aplicaciones de escritorio y web: el paquete npm con núcleo nativo precompilado para Node permite moderar subidas en servidores propios sin depender de APIs externas, y la variante de navegador puede filtrar previsualizaciones antes de mostrarlas.
- Verificación de contenido generado por IA: filtrado de salidas de modelos de generación de imágenes en pipelines locales antes de mostrarlas al usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un clasificador de imágenes. El autor sí publica métricas de recall y especificidad por modo de calidad:

| Modo de calidad | Recall | Especificidad | Uso recomendado |
|---|---:|---:|---|
| `fast` | 74 % | 97 % | Fotogramas de vídeo; el muestreo entre fotogramas recupera recall |
| `balanced` | 84 % | 95 % | Mayor recall por fotograma |
| `accurate` (por defecto) | 88 % | 94 % | Imágenes individuales |

No se especifica el conjunto de evaluación, el tamaño de la muestra ni la definición exacta de positivo/negativo empleada para calcular estas métricas.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo pesa 9,2–9,7 MB en int8 y se ejecuta en memoria unificada o RAM del dispositivo.
- Cabe holgadamente en cualquier GPU de consumo, e incluso en dispositivos móviles sin GPU dedicada (CPU o NPU integrada).
- Plataformas Apple: ejecución mediante Core ML, con posible aceleración por Neural Engine en chips Apple Silicon y A-series.
- Android, Linux, Windows y Node: ejecución mediante LiteRT/TFLite, con aceleración por CPU, GPU o NNAPI según el dispositivo.
- Navegador: ejecución mediante `@litertjs/core` con WebAssembly/WebGPU según disponibilidad.
- Opciones de despliegue: SDKs oficiales de Desert-Ant-Labs para Swift, Kotlin y JavaScript/TypeScript; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada. El modo `fast` está pensado para vídeo, lo que sugiere latencias de milisegundos por fotograma en hardware móvil moderno, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Licencia | Ejecución local | Notas |
|---|---|---|---|---|---|
| desert-ant-labs/moderator | Clasificador NSFW | 9,2–9,7 MB (int8) | Source-available | Sí (Core ML, LiteRT) | Datos de entrenamiento controlados; scores por región |
| Alternativas open source de moderación NSFW | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoría. Los clasificadores NSFW comerciales habituales (APIs de moderación en la nube) no son comparables en licencia ni en modelo de despliegue, y no se han aportado datos de benchmarks cruzados.

## Limitaciones y advertencias

- Licencia source-available, no open source: el uso comercial, la redistribución y la modificación están sujetos a los términos de `https://license.desertant.com/`, que deben revisarse antes de integrar el modelo en producción.
- Las puntuaciones por región no son probabilidades calibradas: un 0,8 no significa un 80 % de probabilidad. Solo sirven para ordenar imágenes, no para interpretar como confianza estadística.
- El recall del modo `fast` es del 74 %, insuficiente para moderación de imágenes individuales; está pensado para vídeo con muestreo entre fotogramas.
- El modelo está afinado para pasar fotos reales de bañador y lencería, lo que puede producir falsos negativos en contenido ambiguo o en imágenes de baja calidad, ilustraciones o contenido generado por IA.
- No se documentan sesgos demográficos, de tono de piel, de complexión corporal ni de género; dado el uso de datos sintéticos, existe riesgo de que la distribución de entrenamiento no represente bien a todos los grupos.
- No se especifican los idiomas ni la cobertura geográfica de las políticas de moderación; el modelo clasifica contenido visual, pero las políticas (`allowTopless`) reflejan una interpretación cultural concreta.
- No se han publicado métricas de calibración, curvas ROC/PR ni evaluación en conjuntos de test independientes.
- El modelo descarga pesos desde Hugging Face en el primer uso; en entornos sin red o con restricciones de salida es necesario preempaquetar los pesos.
- No se detalla el comportamiento ante imágenes corruptas, formatos exóticos o resoluciones extremas más allá del manejo de EXIF.
- Al ser un clasificador puramente visual, no detecta contenido NSFW en texto, audio o vídeo sin muestreo de fotogramas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/moderator
- Pesos v1.1.0: https://huggingface.co/desert-ant-labs/moderator/tree/v1.1.0
- Demo oficial: https://desertant.com/models/moderator/
- Repositorio del SDK (desert-ant-core): https://github.com/Desert-Ant-Labs/desert-ant-core
- Documentación del SDK y requisitos: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md
- Licencia: https://license.desertant.com/
- Documentación de descarga y caché de modelos: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#model-downloads-and-caching

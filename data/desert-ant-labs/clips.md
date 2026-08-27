# desert-ant-labs/clips

## Resumen

Clips es un modelo de selección de clips desarrollado por Desert Ant Labs, diseñado para convertir vídeos largos en cortos directamente en el teléfono. El modelo procesa la transcripción de un vídeo, puntúa los tramos de frases contiguas y devuelve el conjunto de clips de mayor puntuación que no se solapan, sin necesidad de subir datos a la nube. Está pensado para edición automática de contenido en dispositivos móviles, con un rendimiento de 9,19 segundos para procesar 25 minutos de vídeo en un iPhone 17 Pro.

Arquitectónicamente, Clips utiliza un tronco xlm-roberta-base de 278 millones de parámetros con cuatro cabezas especializadas: saliencia, inicio de clip, fin de clip y un clasificador de clips. No tiene ventana de contexto fija: procesa las frases en lotes de 16 y puntúa cada candidato de forma independiente, lo que permite manejar transcripciones largas sin límite de tokens. El modelo está disponible en formatos Core ML (para Apple) y LiteRT (para Linux y Windows), con cuantización int8, y soporta 100 idiomas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tronco xlm-roberta-base con cuatro cabezas (saliency, start-of-clip, end-of-clip, clip scorer) |
| Parametros totales | 278 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No hay ventana de contexto; procesa por lotes de 16 frases. Selector: 128 tokens, scorer: 256 tokens. Frases de más de 64 tokens se truncan antes del selector |
| Tipos de cuantizacion | Core ML: int8 per-channel (incluye embeddings); LiteRT: int8 weight-only |
| Idiomas soportados | 100 idiomas (multilingüe) |
| Licencia | desert-ant-labs-source-available-1.0 (https://license.desertant.com/1.0) |
| Formato de pesos | Core ML (mlmodelc), LiteRT (tflite), safetensors (checkpoint) |

## Arquitectura y entrenamiento

Clips combina un tronco compartido xlm-roberta-base con cuatro cabezas que se ejecutan en dos fases. Primero, las cabezas de saliencia, inicio y fin de clip puntúan cada frase de la transcripción y proponen tramos candidatos alrededor de los anclajes detectados. Después, una cabeza clasificadora lee cada tramo candidato completo como texto y le asigna una puntuación. La selección final se resuelve mediante programación de intervalos ponderados, que devuelve el conjunto de tramos no solapados con mayor puntuación dentro de un presupuesto, más un guardián de redundancia que descarta clips que repiten el contenido de otros ya seleccionados.

El selector y el scorer se envían como gráficos separados porque el selector consume cinco escalares de discurso por frase que el scorer no ve. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni el uso de técnicas como RLHF o DPO; la model card solo menciona un `run_manifest.json` que describe el entrenamiento, pero sin datos concretos. La cuantización int8 per-channel en Core ML introduce una pérdida de correlación de 0,001 frente a fp32, según el autor.

## Capacidades

- Selección de clips: identifica los tramos más relevantes de una transcripción de vídeo y los ordena por puntuación.
- Procesamiento sin límite de longitud: al no depender de una ventana de contexto, puede manejar transcripciones largas (el caso documentado más largo es un podcast de 835 frases).
- Multilingüe: soporta 100 idiomas, aunque la evaluación se ha centrado en escritura latina.
- On-device: funciona completamente en el dispositivo, sin necesidad de conexión a internet ni envío de datos.
- Integración con otras herramientas: se puede combinar con el modelo `desert-ant-labs/title` para generar títulos de los clips.
- No es un modelo generativo: no genera texto, solo clasifica y selecciona tramos existentes.

## Casos de uso

- Edición automática de vídeos largos en shorts para redes sociales: un creador graba un vídeo de 25 minutos y Clips devuelve 12 clips destacados en menos de 10 segundos, listos para publicar en plataformas como TikTok o Instagram Reels.
- Generación de highlights de podcasts: un podcast de una hora se convierte en varios clips cortos con los momentos más relevantes, ahorrando horas de edición manual.
- Auto-edición de grabaciones de conferencias o webinars: se extraen automáticamente los segmentos clave de una presentación para compartirlos como resúmenes en vídeo.
- Archivado y catalogación de contenido: al procesar transcripciones de vídeos antiguos, se pueden generar clips representativos para indexar y buscar en una biblioteca de medios.
- Aplicaciones móviles de edición de vídeo: integración en apps que necesitan una función de "cortar lo mejor" sin intervención del usuario, gracias a su bajo consumo de recursos y su formato Core ML.
- Herramientas de transcripción y resumen: combinado con un sistema de transcripción, Clips puede producir automáticamente un conjunto de citas o fragmentos destacados de una reunión grabada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No obstante, la model card incluye mediciones de rendimiento en dispositivos Apple, que se detallan en la sección de requisitos de hardware.

## Requisitos de hardware

- Dispositivos Apple: requiere iOS 18 o macOS. Se ha probado en iPhone 17 Pro y iPhone 15 Pro, con tiempos de 9,19 s y 10,22 s respectivamente para procesar 404 frases (25 minutos de vídeo, 12 clips).
- Latencia por candidato (solo encoder): 2,78 ms en iPhone 17 Pro y 3,13 ms en iPhone 15 Pro, con lote de 16 y fijado a `.cpuAndNeuralEngine`.
- Para Linux y Windows: se proporcionan archivos LiteRT (tflite) con cuantización int8 weight-only, que pueden ejecutarse en CPU o GPU, aunque no se especifican requisitos de VRAM ni GPUs concretas.
- Opciones de despliegue: Core ML en Apple, LiteRT en otras plataformas. No se mencionan vLLM, Ollama ni TGI, ya que no es un modelo generativo.
- Los archivos LiteRT no cargan a través del SDK de Desert Ant (esperan int64 mientras que el SDK genera int32); deben usarse con un runtime LiteRT directamente.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Los bordes de los clips son el punto débil: un clip puede empezar con un pronombre cuyo referente está en la frase anterior, fusionar dos temas, cortar antes del remate o incluir una lectura de patrocinador.
- Los vídeos cortos devuelven pocos clips: una transcripción de dos minutos produce menos clips que un editor manual, y una transcripción de menos de tres frases no devuelve ninguno.
- El límite de clips es un tope, no una cuota: pedir 10 clips no garantiza recibir 10.
- La selección es sensible a pequeños cambios de puntuación: un runtime, unidad de cómputo o cuantización diferente puede devolver un conjunto distinto aunque comparable.
- Los scripts no latinos están poco probados: el corpus de evaluación es mayoritariamente de escritura latina.
- La duración es un prior suave: un clip puede salir más corto o más largo de lo típico para un Short.
- Los archivos LiteRT no funcionan con el SDK de Desert Ant; requieren un runtime LiteRT directo.
- La licencia es de código disponible (source-available), no open source estándar; hay que revisar los términos en https://license.desertant.com/1.0 para uso comercial.

## Enlaces

- HuggingFace: https://huggingface.co/desert-ant-labs/clips
- Documentación y ejemplos: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/clips.md
- Sitio web de Desert Ant Labs: https://desertant.com/
- Organización en HuggingFace: https://huggingface.co/desert-ant-labs
- Licencia: https://license.desertant.com/1.0

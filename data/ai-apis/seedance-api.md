# AI-APIs/Seedance-API

## Resumen

Seedance 2.5 es un modelo de generación de vídeo desarrollado por ByteDance, accesible únicamente mediante API REST a través de proveedores como Apiframe, SeeVio o SeeAPI. Este repositorio de HuggingFace no contiene pesos del modelo, sino que documenta cómo invocar el servicio desde código. El modelo admite generación de texto a vídeo e imagen a vídeo, con clips de 4 a 30 segundos en una sola pasada, audio nativo sincronizado y hasta 30 imágenes de referencia, 10 vídeos de referencia y 10 pistas de audio de referencia.

La relevancia actual radica en que Seedance 2.5 ofrece capacidades multimodales de referencia (imagen, vídeo y audio) en un solo modelo, con una latencia típica de unos 300 segundos por generación. Al ser un modelo cerrado, no se pueden descargar pesos ni ejecutar inferencia local; toda la computación ocurre en los servidores de ByteDance o de los proveedores de API. Existen variantes del mismo endpoint: `seedance-2` (hasta 4K y 15 segundos), `seedance-2-fast` y `seedance-2-mini`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Seedance 2.5 (no se publica detalle interno) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo cerrado, sin pesos) |
| Longitud de contexto | no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | no aplica (inferencia remota vía API) |
| Idiomas soportados | en (inglés, según metadatos) |
| Licencia | other (términos comerciales de ByteDance) |
| Formato de pesos | no aplica (no se distribuyen pesos) |

## Arquitectura y entrenamiento

No se ha publicado información técnica sobre la arquitectura interna de Seedance 2.5, su número de parámetros, el dataset de entrenamiento ni los métodos de alineación (RLHF, DPO, etc.). Al tratarse de un modelo cerrado, ByteDance no divulga estos detalles. Se sabe que es un modelo de generación de vídeo de última generación, pero cualquier especificación concreta sobre su diseño (difusión, transformador, etc.) no está disponible en la información pública consultada.

## Capacidades

- Generación de texto a vídeo a partir de un prompt descriptivo.
- Generación de imagen a vídeo usando un fotograma inicial (o fotograma inicial y final).
- Referencias multimodales: hasta 30 imágenes, 10 vídeos y 10 pistas de audio como entrada.
- Audio nativo sincronizado con el movimiento (generación de sonido integrada).
- Duración configurable entre 4 y 30 segundos por clip.
- Resoluciones de salida: 480p y 720p.
- Relaciones de aspecto: 21:9, 16:9, 4:3, 1:1, 3:4, 9:16.
- Generación asíncrona vía API: se crea una tarea, se obtiene un `jobId` y se consulta el resultado por polling o webhook.
- Variantes del mismo endpoint: `seedance-2` (hasta 4K, 15s), `seedance-2-fast` y `seedance-2-mini`.

## Casos de uso

- Creación de contenido para redes sociales: generar clips de 10-20 segundos con aspecto vertical (9:16) y audio sincronizado para plataformas como TikTok o Instagram Reels, sin necesidad de edición posterior.
- Prototipado de escenas cinematográficas: directores y editores pueden generar tomas de prueba de 4-30 segundos con referencias de iluminación y composición a partir de un fotograma inicial, acelerando el proceso de previsualización.
- Publicidad y marketing de producto: usar referencias de imagen del producto y prompts descriptivos para producir vídeos cortos de demostración con audio nativo, listos para campañas digitales.
- Doblaje y sincronización de audio: aprovechar la generación de audio sincronizado para crear vídeos con sonido ambiente o diálogos sin necesidad de herramientas de postproducción.
- Narración multi-shot: combinar varias generaciones con referencias de vídeo (hasta 10) para mantener la coherencia de personajes o escenarios a lo largo de una secuencia narrativa.
- Automatización de contenidos en producción: integrar la API en un pipeline de generación masiva de vídeos para catálogos de e-commerce o descripciones de productos, con control de aspecto y resolución mediante parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos comparativos de calidad objetiva (FVD, CLIP score, etc.) frente a otros modelos de generación de vídeo. La única métrica conocida es la latencia típica de generación, de aproximadamente 300 segundos por clip, según la documentación de Apiframe.

## Requisitos de hardware

- No se requieren recursos de hardware propios para inferencia, ya que el modelo se ejecuta de forma remota en los servidores del proveedor de API.
- Únicamente se necesita una conexión a internet y una clave API de un proveedor compatible (Apiframe, SeeVio, SeeAPI, entre otros).
- El coste computacional es asumido por el proveedor; el usuario paga por uso (la documentación menciona precios un 40% más bajos que alternativas, aunque no se detalla el precio exacto).
- La latencia típica de una generación es de ~300 segundos, por lo que no es adecuado para aplicaciones en tiempo real, sino para flujos de trabajo asíncronos.
- Opciones de despliegue: no aplica (no hay despliegue local). Se integra mediante peticiones HTTP REST y polling o webhooks.

## Comparativa con modelos similares

No hay datos de benchmarks públicos que permitan una comparación cuantitativa con otros modelos de generación de vídeo como Runway Gen-3, Pika o Sora. Desde el punto de vista de características, Seedance 2.5 se diferencia por ofrecer audio nativo sincronizado y hasta 30 referencias de imagen, mientras que la mayoría de alternativas se limitan a texto e imagen. Sin embargo, al ser un modelo cerrado y con precios no publicados de forma transparente, la comparación en términos de coste y rendimiento queda sujeta a las condiciones de cada proveedor de API.

## Limitaciones y advertencias

- Modelo completamente cerrado: no se pueden descargar pesos, hacer fine-tuning ni ejecutar inferencia local.
- Requiere una clave API de un proveedor externo (Apiframe, SeeVio, etc.) y el uso comercial está sujeto a los términos de ByteDance.
- Los medios generados se retienen en el CDN del proveedor durante 90 días, lo que puede plantear problemas de privacidad o cumplimiento normativo si se manejan datos sensibles.
- Resolución máxima de salida limitada a 720p en Seedance 2.5 (la variante `seedance-2` permite hasta 4K, pero con duración máxima de 15 segundos).
- No se puede combinar un fotograma inicial con referencias multimodales simultáneamente: `start_image` y `reference_image_urls`/`reference_video_urls`/`reference_audio_urls` son mutuamente excluyentes.
- La latencia de ~300 segundos por generación hace inviable su uso en aplicaciones interactivas o de baja latencia.
- No hay información pública sobre sesgos, alucinaciones o fallos de coherencia temporal del modelo, al no haber evaluación independiente.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/AI-APIs/Seedance-API
- Página del modelo en Apiframe: https://apiframe.ai/models/seedance-2.5
- Documentación de Seedance API (seedanceapi.dev): https://seedanceapi.dev/
- Seedance API (seedanceapi.com): https://seedanceapi.com/
- Documentación de API en SeeVio: https://seevio.ai/api-docs
- Seedance API en SeeAPI: https://seedance.seeapi.com/
- Documentación técnica (seedanceapi.org): https://seedanceapi.org/docs

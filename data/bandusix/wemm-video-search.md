# bandusix/wemm-video-search

## Resumen

`bandusix/wemm-video-search` es un sistema de búsqueda de momentos en vídeo por texto (text-to-video moment search) desarrollado por el autor bandusix. Se apoya en el modelo de embeddings multimodales `tencent/WeMM-Embedding-2B` de Tencent, que codifica tanto vídeo como texto en vectores de 2048 dimensiones. El sistema divide el vídeo en ventanas temporales (8 segundos por defecto), codifica cada ventana, y permite localizar el rango de tiempo que coincide con una descripción textual mediante similitud coseno.

La relevancia de esta herramienta radica en su capacidad para trabajar con streams HLS/m3u8 en línea sin descargar el archivo completo, indexando una película de 2,5 horas en menos de 6 minutos. Incluye optimizaciones como la decodificación solo de keyframes, la obtención paralela de segmentos, la detección de duplicados mediante huellas digitales y un relleno de huecos que garantiza una cobertura del 100% del timeline. El proyecto se distribuye bajo licencia MIT e incluye una interfaz web local, un notebook de Colab y un Dockerfile para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en `tencent/WeMM-Embedding-2B` (modelo de embeddings multimodales de Tencent); arquitectura interna no especificada en la ficha |
| Parametros totales | 2 mil millones (2B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingüe: chino, inglés, japonés, coreano, español, portugués, entre otros |
| Licencia | MIT |
| Formato de pesos | No disponible (se carga mediante transformers y sentence-transformers) |

## Arquitectura y entrenamiento

El sistema `wemm-video-search` no es un modelo de lenguaje independiente, sino una aplicación que utiliza el modelo de embeddings `WeMM-Embedding-2B` de Tencent como codificador multimodal. El pipeline funciona de la siguiente manera: el vídeo se segmenta en ventanas de 8 segundos, de cada ventana se extraen los keyframes, y estos se codifican en vectores de 2048 dimensiones mediante el modelo WeMM. Las consultas de texto se codifican con el mismo modelo y se comparan por similitud coseno contra todos los vectores de ventana para obtener los rangos temporales más relevantes.

En cuanto al entrenamiento, no se proporcionan detalles sobre los datos de entrenamiento del modelo base WeMM-Embedding-2B, ni sobre el uso de técnicas como RLHF o DPO. La innovación principal de este proyecto reside en las optimizaciones de indexación para streams en línea: selección automática de la variante de menor bitrate, decodificación exclusiva de keyframes, obtención paralela de segmentos (16 descargas concurrentes, 3,6 veces más rápido que ffmpeg secuencial), y un mecanismo de relleno de huecos que decodifica un frame adicional por segmento para cubrir ventanas sin keyframes, elevando la cobertura del 77% al 100%. También se implementa una detección de duplicados en tres capas: identificador de negocio, huella del manifiesto y hash perceptual (dHash).

## Capacidades

- Búsqueda de momentos en vídeo por texto: localiza el rango temporal exacto (en milisegundos) que coincide con una descripción.
- Soporte de dos tipos de entrada: archivos de vídeo locales y streams en línea m3u8/HLS.
- Indexación de streams sin descarga completa: selecciona la variante de menor bitrate y decodifica solo keyframes.
- Cobertura completa del timeline: rellena huecos entre keyframes para que cada segundo del vídeo sea buscable.
- Detección de duplicados: evita indexar el mismo contenido varias veces mediante huellas del manifiesto y hash perceptual.
- Compatibilidad con streams protegidos por referer: inyección de cabeceras `Referer`/`Origin` y proxy HLS integrado para reproducción en navegador.
- Interfaz web local: biblioteca de vídeos, gráfico de barras de similitud y lista de resultados con clic para buscar.
- Multilingüe: las consultas funcionan en varios idiomas (chino, inglés, japonés, coreano, español, portugués, etc.).
- Reproducción desde el stream original: al encontrar un resultado, hls.js busca en el m3u8 original sin transcodificar.

## Casos de uso

- Archivo y búsqueda en bibliotecas de vídeo personales: un usuario puede indexar sus grabaciones locales (bodas, viajes, eventos) y buscar momentos concretos escribiendo descripciones como "la tarta de cumpleaños" o "la llegada a la playa".
- Análisis de contenido audiovisual en medios: un periodista o editor puede localizar rápidamente fragmentos relevantes en entrevistas o reportajes largos sin revisar el vídeo completo.
- Moderación de contenido en plataformas de streaming: los operadores pueden indexar streams HLS en línea y buscar automáticamente momentos que infrinjan políticas (por ejemplo, "violencia" o "lenguaje ofensivo") mediante consultas de texto.
- Verificación de duplicados en CDN: el sistema detecta si un mismo título ya ha sido indexado a diferentes resoluciones o bitrates, ahorrando almacenamiento y cómputo.
- Investigación académica en recuperación de información multimodal: sirve como base para experimentos sobre búsqueda de momentos en vídeo con streams en línea, gracias a su arquitectura modular y código abierto.
- Automatización de subtitulado o doblaje: al localizar los rangos temporales de diálogos o escenas específicas, se puede sincronizar texto o audio con precisión milimétrica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye mediciones de rendimiento del propio sistema sobre una película de 2,4 horas en Apple M5 Max (MPS), que se resumen a continuación:

| Etapa | Antes | Después |
|---|---|---|
| Extracción | 146 s | 147 s (incluye huellas) |
| Huella de deduplicación | ~100 s | Integrada en extracción |
| Síntesis de clips | ~210 s (serial) | ~10 s (paralelo) |
| Codificación de vectores | 125 s | 171 s (+30% ventanas por relleno) |
| **Total** | **581 s** | **336 s** |
| **Cobertura** | **77%** | **100%** |

Estas cifras son específicas del entorno de prueba y no constituyen un benchmark estándar comparable con otros modelos.

## Requisitos de hardware

- Mínimo: GPU de 8 GB VRAM (para texto y vídeo corto, batch=1).
- Recomendado: GPU de 12–16 GB (NVIDIA T4, RTX 4070, etc.) para manejar mezclas de imagen y vídeo con soltura.
- Apple Silicon: funciona en MPS con float16; desarrollado y verificado en un M5 Max.
- Cloud: una GPU T4 gratuita de Google Colab es suficiente.
- CPU: soportada para ejecuciones pequeñas, aunque con menor rendimiento.
- Despliegue: se puede servir mediante vLLM o SGLang para mayor throughput en la codificación de vectores.
- Almacenamiento de vectores: compatible con FAISS, Milvus o pgvector; con compresión PQ, una sola máquina puede albergar decenas de millones de ventanas.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos o sistemas comparables de búsqueda de momentos en vídeo con características equivalentes (indexación de streams HLS, cobertura completa, deduplicación). El proyecto se basa en el modelo `tencent/WeMM-Embedding-2B`, pero no se dispone de datos de comparación con otras soluciones de retrieval multimodal.

## Limitaciones y advertencias

- El sistema solo debe utilizarse con contenido sobre el que se tenga derecho de procesamiento; la model card advierte explícitamente que no incluye ni fomenta el uso indebido de material protegido.
- No se han documentado sesgos específicos del modelo base WeMM-Embedding-2B, pero al ser un modelo entrenado con datos web, puede reflejar sesgos presentes en esos datos.
- Riesgo de alucinación en la recuperación: la similitud coseno puede devolver resultados falsos positivos si la descripción es ambigua o el vídeo contiene escenas muy similares.
- La indexación de streams en línea depende de la disponibilidad y estabilidad de la red; en CDNs con latencia alta, el rendimiento puede degradarse.
- La licencia MIT permite uso comercial, pero el modelo base `tencent/WeMM-Embedding-2B` puede tener sus propias restricciones; se recomienda revisar su licencia específica.
- El sistema requiere Python 3.12, ffmpeg y dependencias específicas (transformers 5.2.0, qwen-vl-utils, sentence-transformers, torchcodec), lo que puede complicar el despliegue en entornos con versiones antiguas.

## Enlaces

- HuggingFace: https://huggingface.co/bandusix/wemm-video-search
- GitHub: https://github.com/bandusix/wemm-video-search
- Modelo base: https://huggingface.co/tencent/WeMM-Embedding-2B

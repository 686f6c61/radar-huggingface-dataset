# litert-community/Unlimited-OCR

## Resumen

Unlimited-OCR es un modelo de visión-lenguaje para análisis de documentos desarrollado originalmente por Baidu (publicado el 22 de junio de 2026) y convertido al formato LiteRT-LM por la comunidad litert-community para su ejecución en dispositivos. El modelo combina un codificador visual DeepEncoder (SAM ViT-B y CLIP-L con proyector, 401M de parámetros) con un decodificador de texto DeepSeek-V2 de 12 capas y 2.9B de parámetros, dando un total de 3.3B. Su tarea es el parseo de documentos: dado el renderizado de una página, produce su estructura de bloques de maquetación con etiquetas (`title`, `text`, `equation`, `table`, etc.), coordenadas de caja y el contenido de cada bloque, con tablas en HTML y fórmulas en LaTeX.

La relevancia de esta conversión concreta es que permite ejecutar un modelo de parseo documental de 3.3B en hardware móvil sin conexión. El archivo `Unlimited-OCR_int8.litertlm` (3.80 GB) contiene el decodificador con pesos int8 en sus capas lineales, tabla de embeddings int8, y codificador visual y proyector en fp16. En un Galaxy S26 procesa una página en 18–22 s sobre CPU (incluida la creación del motor), y en un Pixel 11 Pro en 28–31 s una vez escritas las cachés del runtime.

El modelo procesa una página por petición como una vista única de 1024 × 1024 píxeles que ocupa 273 tokens de imagen. El prompt fijo ocupa 277 de los 4096 tokens de ventana, dejando hasta 3819 tokens para la respuesta de cada página. La licencia es MIT tanto en el modelo base como en la conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision encoder DeepEncoder (SAM ViT-B + CLIP-L + proyector) + decodificador de texto DeepSeek-V2 (transformer MoE con atención de ventana deslizante) |
| Parámetros totales | 3.3B (401M visión + 2.9B texto) |
| Parámetros activos | 6 expertos enrutados de 64 por token, más 2 compartidos (solo en las 11 capas MoE; la primera capa del decodificador es densa) |
| Longitud de contexto | 4096 tokens (277 de prompt de página + hasta 3819 de respuesta) |
| Tipos de cuantización | int8 en capas lineales del decodificador y tabla de embeddings; fp16 en codificador visual y proyector; tabla de posiciones en float; activaciones fp32 declaradas para GPU |
| Idiomas soportados | Multilingüe |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM), con pesos externos en secciones LiteRT dentro del mismo archivo |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos torres. El codificador visual DeepEncoder integra SAM ViT-B y CLIP-L con un proyector que reduce la imagen de 1024 × 1024 a 273 tokens visuales. El decodificador de texto es un transformer DeepSeek-V2 de 12 capas y 2.9B de parámetros: la primera capa es densa y las 11 restantes son capas de mezcla de expertos con 64 expertos enrutados, 6 activos por token y 2 compartidos. Emplea atención de ventana deslizante: cada token generado atiende al prompt completo y a los últimos 128 tokens generados.

La conversión a LiteRT-LM se realizó con la herramienta `hf-to-litertlm` y se probó con las versiones 0.19.2 y 0.19.1 del runtime. El autor indica que el rendimiento aún se está optimizando y que publicará formas más rápidas como actualizaciones. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Parseo de documentos: genera la estructura de bloques de maquetación de una página con etiquetas (`title`, `text`, `equation`, `table`, etc.), coordenadas de caja en escala 0–999 y el contenido de cada bloque.
- Reconocimiento de tablas: produce las tablas en HTML.
- Reconocimiento de fórmulas: produce las fórmulas matemáticas en LaTeX.
- Procesamiento de documentos multipágina: cada página se envía como una petición independiente, en orden, y las salidas se concatenan separadas por `<PAGE>`.
- Visión-lenguaje de imagen a texto: pipeline `image-text-to-text` sobre imágenes de página renderizadas.
- Multilingüe: soporte declarado de varios idiomas, aunque no se detalla la lista concreta.
- Ejecución en dispositivo: inferencia local sin conexión mediante LiteRT-LM en Android, Mac y (no probado) iPhone.
- No acepta prompts arbitrarios del usuario: la plantilla del archivo fija la instrucción `document parsing.` del ejemplo de página única del modelo original.

## Casos de uso

- Digitalización de documentos en móvil sin conexión: la app captura una página, la paddea a 1024 × 1024 con gris (127, 127, 127) y obtiene la estructura de bloques con etiquetas y cajas; adecuado para escenarios de campo sin red, a costa de 18–31 s por página en gama alta Android.
- Extracción de tablas a HTML: en flujos de contabilidad o inventario, el modelo convierte tablas impresas en HTML estructurado que puede parsearse posteriormente a CSV o bases de datos.
- Conversión de fórmulas a LaTeX: para artículos científicos o apuntes técnicos, el modelo emite las ecuaciones como LaTeX listo para insertar en editores o sistemas de composición.
- Preservación de maquetación para reflow: las coordenadas de caja (escala 0–999 sobre la página original, antes del padding) permiten reconstruir el orden de lectura y reordenar el contenido en visores o lectores de pantalla.
- Procesamiento por lotes de documentos escaneados: el script `ocr_unlimited.py` acepta varias páginas y las procesa en secuencia, lo que permite integrarlo en pipelines de digitalización masiva en Mac (probado en M4 Max con CPU, 16 de 18 pruebas de página única superadas).
- Archivado y búsqueda full-text en local: al ejecutarse en el dispositivo, los documentos no salen del terminal, lo que encaja en entornos con requisitos de privacidad o cumplimiento.
- Prototipado de asistentes documentales en Android: el archivo único `.litertlm` con pesos externos embebidos simplifica el despliegue en apps Android mediante LiteRT-LM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son de latencia y pruebas de corrección del autor de la conversión:

| Dispositivo | Backend | Tiempo por página | Notas |
|---|---|---|---|
| Galaxy S26 | CPU | 18–22 s | Incluye creación del motor |
| Galaxy S26 | GPU (decoder) + CPU (visión) | 25–27 s | Más lento que CPU |
| Pixel 11 Pro | CPU | 28–31 s | Con cachés del runtime escritas |
| Pixel 11 Pro | GPU | 44 s | Falló 5 de 18 pruebas de página única |
| Pixel 8a (8 GB) | CPU | 97 s | Decodificación a 1.0 tok/s |
| Pixel 8a (8 GB) | GPU (decoder) | — | Memoria disponible cayó a 0.29 GiB; el harness detuvo la ejecución |
| Mac (Apple M4 Max) | CPU | no medido | Superó 16 de 18 pruebas de página única y el documento de 3 páginas |
| Mac (Apple M4 Max) | GPU | no medido | Ejecuta los ejemplos; respuestas no verificadas contra el original |
| iPhone | — | no probado | — |

Corrección: en Pixel 11 Pro la CPU tuvo 3 empates cercanos frente a 5 fallos del archivo en GPU sobre 18 pruebas de página única. La caché del runtime ocupa aproximadamente 4.4 GB en CPU y 2.8 GB en GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada que permitan una comparación rigurosa. La comparación más directa posible es con el modelo base del que se deriva:

| Modelo | Parámetros | Contexto | Formato | Licencia | Ejecución |
|---|---|---|---|---|---|
| litert-community/Unlimited-OCR | 3.3B | 4096 tokens | `.litertlm` (int8/fp16) | MIT | En dispositivo (LiteRT-LM) |
| baidu/Unlimited-OCR | 3.3B | no disponible | no disponible | MIT | Servidor/GPU (formato original) |

No se conocen en la información disponible otros modelos comparables de parseo documental con los que contrastar parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- El modelo no acepta instrucciones del usuario: la plantilla fija el prompt `document parsing.`, por lo que no es posible adaptar la tarea por prompt.
- LiteRT-LM redimensiona toda imagen a 1024 × 1024 sin mantener la relación de aspecto y sin leer la orientación EXIF; sin el padding manual a cuadrado gris (127, 127, 127) las páginas no cuadradas se deforman y las pruebas del autor no se realizaron en esas condiciones.
- Procesa una página por petición; los documentos multipágina requieren llamadas secuenciales y concatenación manual.
- En Pixel 8a (8 GB) el rendimiento cae a 97 s por página en CPU (1.0 tok/s) y el backend GPU agota la memoria disponible.
- No se ha probado en iPhone.
- En Mac con GPU las respuestas no se han verificado contra el modelo original.
- La velocidad aún se está optimizando según el autor; las latencias publicadas pueden mejorar con actualizaciones.
- La primera petición en un dispositivo escribe cachés de aproximadamente 4.4 GB (CPU) o 2.8 GB (GPU) junto al modelo y es más lenta (cold start).
- No se han publicado datos sobre sesgos, tasa de alucinación ni evaluación de idiomas concretos.
- La licencia MIT permite uso comercial, pero se desconoce si el modelo base de Baidu impone restricciones adicionales más allá de las indicadas en la información disponible.
- El tamaño del archivo (3.80 GB) y las cachés del runtime limitan su uso en dispositivos con almacenamiento o memoria reducidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Unlimited-OCR
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR
- Script de inferencia: https://huggingface.co/litert-community/Unlimited-OCR/blob/main/ocr_unlimited.py
- Herramienta de conversión: https://github.com/john-rocky/hf-to-litertlm
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM

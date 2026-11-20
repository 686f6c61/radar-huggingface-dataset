# Intel/qwen3.8-27B-int4-ov

## Resumen

Qwen3.8-27B INT4 (OpenVINO) es una distribucion optimizada del modelo base Qwen3.8-27B de Alibaba, publicada por Intel en formato OpenVINO IR con compresion de pesos INT4. El modelo original es un vision-language model nativo de 27 mil millones de parametros, orientado a comprension de imagen y texto, y esta pensado para tareas de descripcion de video y analisis de escenas urbanas. Intel lo empaqueta junto con ejemplos de OpenVINO GenAI e Intel DLStreamer para su despliegue en CPU y GPU Intel.

La relevancia de esta ficha radica en que el modelo se distribuye ya pre-cuantizado: no requiere exportacion ni cuantizacion local. El artefacto descargable ocupa aproximadamente 15,97 GB e incluye pesos MTP (multi-token prediction) para decodificacion especulativa greedy con dos tokens asistente. La licencia es MIT y el unico idioma declarado es ingles.

El caso de uso destacado en la model card es la descripcion automatica de fotogramas muestreados de video para escenarios de smart city, como resumenes de trafico y actividad de peatones o vehiculos. El modelo requiere OpenVINO y GenAI 2026.4.0 o superior, y la pila validada por Intel usa DLStreamer 2026.3.0 RC1 con OpenVINO GenAI 2026.5.0.0.dev20261030.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (transformer multimodal), pesos comprimidos INT4 en OpenVINO IR |
| Parametros totales | 27B (segun denominacion del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (compresion de pesos); precisiones adicionales no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (modelo pre-cuantizado), tamano de descarga ~15,97 GB |

## Arquitectura y entrenamiento

La model card identifica el modelo base como Qwen3.8-27B de Alibaba, descrito como vision-language model nativo. Intel no aporta detalles sobre la arquitectura interna del transformer, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO. Lo que si documenta es el proceso de despliegue: exportacion a OpenVINO IR y compresion de pesos a INT4, con inclusion de pesos MTP para decodificacion especulativa greedy.

La innovacion tecnica destacable en esta distribucion es el uso de MTP con dos tokens asistente y la desactivacion de prefix caching en el ejemplo de OpenVINO. El modelo base habilita thinking por defecto en su plantilla de chat; el ejemplo OpenVINO lo desactiva mediante el contexto extra de `ChatHistory`, mientras que la integracion DLStreamer no expone esa opcion y opera con thinking activado. La model card menciona tambien el parametro `reasoning_effort` con valores `low`, `medium` y `xhigh` en interfaces compatibles, aunque los ejemplos publicados no lo configuran ni usan `preserve_thinking` multi-turno.

## Capacidades

- Descripcion de imagen y video en lenguaje natural: genera una frase corta describiendo peatones, vehiculos y actividad en escenas callejeras.
- Vision-language understanding: pipeline `image-text-to-text`, con soporte de entrada de imagen y texto.
- Video description: los ejemplos muestran inferencia sobre fotogramas muestreados de un video y superposicion del texto generado sobre el video de salida.
- Decodificacion especulativa: pesos MTP incluidos para decodificacion greedy con dos tokens asistente.
- Modo thinking configurable: activado por defecto en la plantilla de chat, desactivable via `ChatHistory`; `reasoning_effort` disponible en interfaces compatibles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun el campo `language` del modelo.
- Capacidades de audio: no disponible en la informacion proporcionada.

## Casos de uso

- Resumen de trafico urbano: el modelo procesa fotogramas muestreados de camaras de trafico y genera frases describiendo vehiculos y flujo circulatorio; encaja por su pipeline image-text-to-text y su orientacion explicita a smart city.
- Monitorizacion de actividad de peatones: en el ejemplo OpenVINO se describe la actividad visible en una escena callejera con un prompt especifico sobre peatones y vehiculos, util para revision posterior por operadores.
- Revision de escenas por operadores: la model card indica que las descripciones generadas pueden usarse para revisar escenas, con el texto superpuesto en el video de salida para inspeccion visual rapida.
- Analisis de video en edge con CPU Intel: el modelo esta empaquetado para OpenVINO GenAI y DLStreamer, lo que permite ejecutar inferencia en CPU sin GPU dedicada, segun la validacion realizada por Intel solo en CPU.
- Analisis de video en GPU Intel: el ejemplo OpenVINO usa `DEVICE = "GPU"` por defecto, apto para despliegues con memoria suficiente; la model card advierte que el soporte GPU depende de la memoria disponible.
- Integracion en pipelines GStreamer: DLStreamer permite insertar el modelo como plugin en pipelines de video, con metadatos de resultado que pueden contener texto de razonamiento o salida parcial.
- Procesamiento por lotes de fotogramas clave: el ejemplo muestrea el primer fotograma y cada 300 fotogramas, patron adecuado para analisis periodico de video largo con coste controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Descarga del modelo: aproximadamente 15,97 GB para los pesos INT4 en OpenVINO IR.
- Memoria para inferencia: superior a la del peso del modelo, ya que se necesita memoria adicional para activaciones y caches; la cifra exacta no esta disponible.
- Dispositivos soportados: CPU y GPU (segun memoria disponible); NPU no soportado.
- Validacion: solo CPU fue validada por Intel; el soporte GPU depende de la memoria disponible.
- GPU recomendadas: no disponible en la informacion proporcionada (no se listan modelos concretos como A100, H100 o RTX 4090).
- Cabida en GPU consumer: no disponible; la model card solo indica que requiere memoria suficiente sin especificar modelos.
- Despliegue: OpenVINO GenAI (2026.4.0 o superior; pila validada 2026.5.0.0.dev20261030), OpenVINO Runtime 2026.5.0.dev20261030, Intel DLStreamer 2026.3.0 RC1, Python 3.11 o superior, OpenVINO Tokenizers, GStreamer Python bindings, OpenCV, NumPy y FFmpeg.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No disponible: la informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos comparables.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Thinking por defecto: la plantilla de chat de Qwen3.8 habilita thinking; si no se desactiva, la salida puede contener texto de razonamiento en lugar de una descripcion final. En DLStreamer, que no expone la opcion de desactivarlo, los metadatos pueden incluir pensamiento o salida parcial, y en la pila validada contenian razonamiento, no un caption final.
- Diferencia entre integraciones: la superposicion del ejemplo DLStreamer puede diferir del caption directo de OpenVINO por la gestion del modo thinking.
- Memoria: el modelo de 27B en INT4 necesita mas memoria y almacenamiento que otros VLM del catalogo; debe usarse CPU o GPU solo con memoria suficiente.
- NPU no soportado.
- Dependencias de version: requiere OpenVINO y GenAI 2026.4.0 o superior; la pila validada usa builds de desarrollo (2026.5.0.0.dev20261030) y DLStreamer 2026.3.0 RC1, lo que implica riesgo de incompatibilidades fuera de esa combinacion.
- Muestreo de video: el ejemplo procesa solo fotogramas seleccionados (primero y cada 300), por lo que la descripcion no cubre la totalidad del video.
- Sesgos y alucinacion: no se documentan sesgos conocidos ni evaluaciones de alucinacion en la informacion disponible.
- Licencia MIT: permite uso comercial, pero debe conservarse el aviso de licencia; no se detallan restricciones adicionales.
- Fecha de publicacion futura: los metadatos indican creacion en 2026-09-24 y actualizacion en 2026-11-18, coherente con las versiones de software referenciadas; conviene verificar la disponibilidad real de las builds citadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Intel/qwen3.8-27B-int4-ov
- Script de descarga y cuantizacion: https://huggingface.co/Intel/qwen3.8-27B-int4-ov/resolve/main/export_and_quantize.sh
- Pagina de Intel: https://www.intel.com/content/www/us/en/homepage.html
- Centro de descargas de Intel: https://www.intel.fr/content/www/fr/fr/download-center/home.html
- Intel Driver & Support Assistant: https://www.intel.com/content/www/us/en/support/detect.html
- Wikipedia de Intel: https://en.wikipedia.org/wiki/Intel

# infosave/Ripple-65B-Preview-cmf

## Resumen

Ripple-65B Preview es un modelo de lenguaje denso de 65 000 millones de parámetros desarrollado por Ricursive Intelligence. Se trata de un transformer de 80 capas preentrenado sobre 12 billones de tokens y con una ventana de contexto que, según el autor, alcanza hasta 1 millón de tokens. El modelo base se distribuye en Hugging Face y también a través de proveedores de inferencia como Together AI y GMI Cloud.

La ficha que nos ocupa, sin embargo, no es el modelo original sino una cuantización publicada por el usuario `infosave` para `cortiq`, un motor de inferencia escrito en Rust que prescinde de Python y de frameworks de machine learning. El repositorio contiene tres variantes del modelo en formato CMF (q4tp de 34,6 GB, q2tp de 29,2 GB y q8_2f de 64,8 GB) más dos drafters DFlash2 de 2,3 GB cada uno para decodificación especulativa. La relevancia de esta publicación radica en que permite ejecutar un modelo de 65B en tarjetas de 32-48 GB mediante un esquema de cuantización mixta y un mecanismo de "campo lejano" que mantiene acotada la memoria de dispositivo en prompts largos.

El modelo razona dentro de etiquetas `<think>` antes de responder y soporta inglés, ruso y chino. La licencia declarada es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, 80 capas (16 de atención completa y 64 deslizantes) |
| Parámetros totales | 65 000 millones |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 1 000 000 de tokens según el autor del modelo base; en la práctica, el campo lejano mantiene 8192 filas exactas en tarjeta y comprime el resto |
| Tipos de cuantización | q8_2f (8 bits), q4tp (4 bits con K y V a 8 bits), q2tp (mezcla de 2, 4 y 8 bits) |
| Idiomas soportados | Inglés, ruso, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (formato propietario del motor `cortiq`); drafters en `.dflash.cmf` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 80 capas. La distribución de capas de atención es híbrida: 16 capas de atención completa y 64 capas de atención deslizante con ventana de 1024 tokens, lo que reduce el coste computacional en contextos largos. Según el autor del modelo base, se preentrenó sobre 12 billones de tokens; no se dispone de información sobre la composición del dataset ni sobre si hubo fases de RLHF o DPO.

La contribución técnica principal de esta publicación es el esquema de cuantización y el mecanismo de gestión de contexto implementado en `cortiq`. El archivo q4tp usa pesos de 4 bits en mosaico con las proyecciones K y V de la atención a 8 bits. El q2tp es una mezcla más agresiva: capa 0 y las dos últimas capas a 8 bits, la matriz down del FFN y la atención a 4 bits, y en cada capa el 5 % de neuronas del FFN que concentran la mitad de la energía de activación se mantienen a 8 bits. Según el autor, ese 5 % elegido al azar recupera el 41 % de la brecha hacia 4 bits, mientras que las neuronas más activas recuperan el 86 %.

El mecanismo de "campo lejano" (patente solicitada, n.º 19/738,763) mantiene las primeras 8192 filas del prompt exactas en la tarjeta gráfica y expulsa las claves y valores de las filas posteriores a RAM o SSD. Antes de las últimas 512 filas se construye un campo lejano que conserva las primeras 4 filas y las últimas 1800 exactas, y el resto se representa con 32 puntos de referencia por cabeza en las 16 capas de atención completa. Además, se puntúan las filas por su relevancia para las capas y las 248 mejores se mantienen exactas, lo que preserva contraseñas y códigos literales. La decodificación especulativa se realiza con el drafter DFlash2, de cinco capas sobre las filas del tronco tras las capas 1, 20, 39, 58 y 77, que propone hasta siete tokens por bloque.

## Capacidades

- Generación de texto con razonamiento explícito dentro de etiquetas `<think>` antes de la respuesta final.
- Razonamiento de propósito general y respuesta a preguntas.
- Generación de código, incluyendo la preservación exacta de fragmentos literales (contraseñas, códigos) gracias al mecanismo de filas exactas.
- Procesamiento de prompts largos con memoria de dispositivo acotada mediante el campo lejano.
- Multilingüismo limitado a inglés, ruso y chino.
- Decodificación especulativa opcional con el drafter DFlash2, que produce el mismo texto que la ejecución sin drafter en modo greedy.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`) con streaming y dashboard web.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Análisis de documentos extensos: con el campo lejano, el modelo puede procesar prompts de decenas de miles de tokens manteniendo un uso de VRAM estable, lo que lo hace adecuado para resumir o extraer información de contratos, informes o expedientes largos.
- Extracción de credenciales y fragmentos literales: el mecanismo de filas exactas conserva hasta 248 filas relevantes sin comprimir, útil en tareas donde contraseñas, claves o identificadores deben reproducirse sin errores.
- Asistencia a la programación en local: la variante q4tp cabe en una GPU de 40 GB y permite generar y revisar código en una estación de trabajo sin depender de la nube, con el drafter DFlash2 para reducir latencia en modo greedy.
- Razonamiento con traza explícita: el modo `<think>` facilita auditar el proceso de razonamiento en tareas matemáticas o lógicas, útil en entornos educativos o de verificación.
- Despliegue de un endpoint compatible con OpenAI: `cortiq serve` expone la API estándar, lo que permite integrar el modelo en aplicaciones existentes que ya consumen la interfaz de OpenAI sin cambios de cliente.
- Procesamiento multilingüe inglés-ruso-chino: adecuado para pipelines de traducción o atención al cliente en esas tres lenguas, aunque no cubre el español.
- Inferencia en hardware de gama alta para consumo: la variante q2tp ocupa 29,2 GB y cabe en una tarjeta de 32 GB, lo que permite ejecutar un 65B en equipos de estación de trabajo.

## Benchmarks y rendimiento

Datos de perplejidad y coincidencia top-1 publicados por el autor de la cuantización sobre wikitext-2 (primeros 2048 tokens, referencia BF16 con perplejidad 6,94):

| Archivo | Tamaño (GB) | Perplejidad | Top-1 vs BF16 | Tarjeta mínima |
|---|---:|---:|---:|---|
| q4tp | 34,6 | 7,09 | 91,1 % | 40 GB (48 GB con drafter) |
| q2tp | 29,2 | 7,43 | 86,2 % | 32 GB |
| q8_2f | 64,8 | 6,97 | 98,3 % | 80 GB |

Rendimiento medido en una NVIDIA A40 (46 GB) con Vulkan y `cortiq bench --core`, 60 tokens tras el prompt, archivo q4tp (la tabla de la model card está truncada en el texto disponible; no se dispone de las cifras completas de latencia y throughput).

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 35,3 GB para q4tp y 30,3 GB para q2tp en un prompt de 4000 tokens (medido en A40); 64,8 GB para q8_2f.
- GPU recomendadas: NVIDIA A40 (46 GB) para q4tp; tarjetas de 32 GB para q2tp; tarjetas de 80 GB (A100, H100) para q8_2f.
- Cabe en GPU de consumo: no se documenta; las variantes más pequeñas requieren al menos 32 GB de VRAM, por encima de las RTX 4090 (24 GB).
- Despliegue: exclusivamente mediante `cortiq` (CLI y servidor compatible con OpenAI); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada (tabla de rendimiento truncada).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / motor | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B Preview (q4tp, esta ficha) | 65B denso | Hasta 1M (campo lejano) | Apache 2.0 | CMF / cortiq | Hugging Face |
| Ripple-65B Preview (BF16 original) | 65B denso | Hasta 1M | Apache 2.0 | Safetensors (presumible) | Hugging Face, Together AI, GMI Cloud |
| Alternativas de 65-70B densas | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El formato CMF es propietario de `cortiq`; no es compatible con vLLM, llama.cpp, Ollama ni con el ecosistema estándar de Hugging Face Transformers.
- La decodificación especulativa con DFlash2, según el propio autor, todavía no amortiza su coste ("a round does not yet pay for itself").
- El mecanismo de campo lejano comprime la información más allá de las primeras 8192 filas; solo 248 filas se conservan exactas, lo que puede degradar la recuperación de detalles en prompts muy largos.
- Idiomas limitados a inglés, ruso y chino; no hay soporte declarado de español.
- Riesgo de alucinación inherente a un modelo de 65B sin datos publicados de evaluaciones estándar.
- No se han publicado datos sobre sesgos del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original en `ricursiveAI/Ripple-65B-Preview`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- La model card está truncada en la información disponible; faltan datos de rendimiento y de la variante q8_2f más allá de la perplejidad.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/infosave/Ripple-65B-Preview-cmf
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Drafter DFlash2: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Página del modelo en Ricursive Intelligence: https://www.ricursive.com/ripple
- Repositorio del motor cortiq: https://github.com/infosave2007/cmf
- Binarios de cortiq: https://github.com/infosave2007/cmf/releases
- Artículo de análisis: https://chimitdorzhi.tech/en/ii-modeli/ripple/

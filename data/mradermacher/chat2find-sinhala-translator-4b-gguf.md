# mradermacher/Chat2Find-Sinhala-Translator-4B-GGUF

## Resumen

Chat2Find-Sinhala-Translator-4B-GGUF es la versión cuantizada en formato GGUF del modelo ShenalMax/Chat2Find-Sinhala-Translator-4B, publicada por mradermacher, un conocido creador de cuantizaciones estáticas para llama.cpp y ecosistemas derivados. El modelo original es un ajuste de 4 205 751 296 parámetros (aproximadamente 4,2 mil millones) orientado a traducción y conversación en el contexto del proyecto Chat2Find, con licencia Apache 2.0. Esta publicación no aporta pesos nuevos: su valor está en ofrecer 13 cuantizaciones distintas (desde Q2_K de 2,0 GB hasta f16 de 8,5 GB) más dos ficheros `mmproj` de proyector multimodal.

La relevancia práctica es doble. Por un lado, permite ejecutar un modelo de 4B en hardware de consumo modesto (una GPU de 8 GB o incluso CPU con Q4_K_M de 2,8 GB). Por otro, el proyecto Chat2Find publicó un corpus trilingüe de 255 millones de tokens en sinhala, tamil e inglés, lo que sitúa a este modelo en el nicho de traducción y procesamiento de lenguas del sur de Asia, tradicionalmente poco cubiertas por los modelos generalistas.

Conviene señalar una limitación documental importante: la model card del repositorio GGUF es puramente técnica sobre el proceso de cuantización y no detalla arquitectura interna, longitud de contexto, datos de entrenamiento ni resultados de evaluación. La etiqueta `qwen3_5` del autor sugiere una base de la familia Qwen3.5, pero este extremo no está confirmado en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5 según el tag `qwen3_5` del autor; no confirmado en la model card) |
| Parametros totales | 4 205 751 296 (~4,2 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | `en` declarado en la model card; el nombre del modelo y el corpus del proyecto apuntan a sinhala e inglés (tamil en el corpus) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el repositorio base usa safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna en la documentación proporcionada. El repositorio declara el tag `qwen3_5` y la etiqueta `unsloth`, lo que apunta a un ajuste fino (probablemente LoRA o QLoRA con Unsloth) sobre un modelo base de la familia Qwen3.5 de 4B. Los ficheros `mmproj` incluidos indican que el modelo original incorpora un proyector multimodal, es decir, que acepta entrada de imagen además de texto, aunque la model card no documenta ni el codificador visual ni el pipeline de entrenamiento multimodal.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El único dato contextual disponible es la publicación del corpus Chat2Find, un conjunto trilingüe de 255 millones de tokens en sinhala, tamil e inglés, que probablemente constituye la base del ajuste fino del modelo original. En el lado de la cuantización, mradermacher indica que se trata de cuantizaciones estáticas (no imatrix ni ponderadas) y que, en el momento de la publicación, no tenía previsto generar versiones imatrix salvo petición en la sección de discusión de la comunidad.

## Capacidades

- Traducción y conversación centrada en sinhala e inglés, según el nombre y el propósito declarado del modelo base.
- Generación de texto conversacional multi-turno (tag `conversational` en el repositorio).
- Entrada multimodal: los ficheros `mmproj-Q8_0.gguf` (0,5 GB) y `mmproj-f16.gguf` (0,8 GB) permiten cargar el proyector multimodal en llama.cpp, lo que habilita entrada de imágenes si el modelo base lo soporta.
- Compatibilidad con text-generation-inference y endpoints compatibles (tags `text-generation-inference` y `endpoints_compatible`).
- Inferencia en CPU y GPU mediante llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Traducción sinhala-inglés en producción: el modelo, con 4,2B parámetros y cuantización Q4_K_M de 2,8 GB, puede desplegarse en un servidor modesto o incluso en local para traducir documentación administrativa, correos o contenido web, un par de lenguas con escasa cobertura en modelos comerciales.
- Atención al cliente en sinhala: despliegue con llama.cpp detrás de una API propia para responder consultas de usuarios en su idioma, con latencia baja gracias al reducido tamaño del modelo y a la posibilidad de ejecutarlo en una sola GPU consumer.
- Procesamiento de documentos con OCR asistido: los ficheros `mmproj` permiten alimentar imágenes (capturas, formularios escaneados) junto con instrucciones de texto, útil para digitalizar formularios en sinhala y traducir su contenido al inglés.
- Preprocesado en pipelines de datos multilingües: uso del modelo para normalizar, traducir o etiquetar grandes volúmenes de texto sinhala antes de alimentar un corpus mayor, aprovechando que cabe en una GPU de 8-12 GB y permite procesar lotes en paralelo.
- Investigación en lingüística computacional de lenguas del sur de Asia: el modelo sirve como línea base reproducible (Apache 2.0, pesos abiertos en GGUF) para experimentos de traducción automática y evaluación de calidad en sinhala.
- Asistente local sin conexión: empaquetado en una aplicación de escritorio con Ollama o LM Studio para usuarios que necesitan traducción y conversación sin enviar datos a servicios en la nube, gracias a que la cuantización Q4_K_S ocupa 2,7 GB.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 13 variantes del mismo modelo, lo que permite medir empíricamente la degradación de calidad (perplejidad) frente al ahorro de memoria en un caso real de traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio GGUF ni los resultados de búsqueda web incluyen métricas de MMLU, HumanEval, GSM8K, BLEU, chrF ni evaluaciones de traducción para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): 2,0 GB con Q2_K; 2,8 GB con Q4_K_M; 3,2 GB con Q5_K_M; 4,6 GB con Q8_0; 8,5 GB con f16. Añadir entre 0,5 y 1,5 GB adicionales para caché KV y contexto, según longitud.
- Si se usa entrada multimodal, sumar 0,5 GB (mmproj-Q8_0) u 0,8 GB (mmproj-f16).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para Q8_0 o f16 con contexto largo; A100/H100 no son necesarias para este tamaño, salvo para servir muchas peticiones concurrentes.
- Cabe holgadamente en GPU consumer: cualquier tarjeta con 6 GB o más puede ejecutar Q4_K_M; con 4 GB se puede usar Q3_K_M o Q2_K.
- Despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y servidores compatibles con la API de OpenAI. vLLM y TGI requerirían los pesos en safetensors del repositorio base, no estas cuantizaciones GGUF.
- Latencia y throughput: no disponibles. Como referencia estructural, un modelo denso de 4B en Q4_K_M sobre una RTX 4090 suele superar ampliamente la velocidad de lectura humana, pero no se han publicado mediciones para este modelo concreto.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus fichas públicas y no se han verificado en esta ficha; la columna de contexto se deja como no disponible cuando no hay confirmación en la información manejada.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Chat2Find-Sinhala-Translator-4B (este) | ~4,2 B | no disponible | Apache 2.0 | Traducción sinhala-inglés, multimodal | GGUF (13 cuantizaciones) + safetensors |
| ShenalMax/Chat2Find-Sinhala-Translator-4B | ~4,2 B | no disponible | Apache 2.0 | Modelo base sin cuantizar | Safetensors en HuggingFace |
| Qwen3-4B | ~4 B | no disponible en esta ficha | Apache 2.0 | Propósito general, multilingüe | Safetensors, GGUF de terceros |
| Gemma 3 4B | ~4 B | no disponible en esta ficha | Términos de licencia Gemma | Propósito general, multimodal | Safetensors, GGUF de terceros |

La diferencia clave frente a los generalistas es el enfoque específico en sinhala y el corpus trilingüe del proyecto Chat2Find; la desventaja es la ausencia total de métricas publicadas que permitan comparar su calidad de traducción.

## Limitaciones y advertencias

- La model card del repositorio GGUF no documenta arquitectura, contexto, datos de entrenamiento ni evaluación: cualquier decisión de producción basada solo en esta ficha es arriesgada.
- No hay métricas de calidad de traducción (BLEU, chrF, COMET) publicadas; se desconoce su rendimiento real frente a modelos comerciales o generalistas de tamaño similar.
- El campo `language` solo declara `en`, pese al nombre del modelo: no está confirmado oficialmente el nivel de competencia en sinhala ni en tamil.
- Riesgo de alucinación y de deriva en traducción no cuantificado; en dominios técnicos o legales conviene revisión humana.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L) degradan la calidad de forma apreciable; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como equilibrio velocidad/calidad.
- No se dispone de cuantizaciones imatrix o ponderadas de este modelo, que suelen ofrecer mejor perplejidad a igual tamaño.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene verificar las obligaciones de atribución y el estado de la licencia del modelo base y del corpus subyacente.
- El repositorio ocupa 39,9 GB en total; descargar solo el fichero de cuantización necesario, no el repositorio completo.
- El tag `qwen3_5` no va acompañado de documentación sobre la versión exacta del modelo base, lo que dificulta reproducir el entrenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Chat2Find-Sinhala-Translator-4B-GGUF
- Modelo base: https://huggingface.co/ShenalMax/Chat2Find-Sinhala-Translator-4B
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#Chat2Find-Sinhala-Translator-4B-GGUF
- Anuncio del corpus Chat2Find (255M tokens, sinhala/tamil/inglés): https://chat2find.com/2026/04/09/chat2find-trilingual-corpus-255m-tokens-release/
- Guía de uso de GGUF de TheBloke (referenciada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Espejo SHA256 de Q2_K: https://civarchive.com/sha256/2a19dee785c62c2f156e4bbe126f99a69cf4bd576210b1ee5d83c2d7353350c5
- Espejo SHA256 de f16: https://civarchive.com/sha256/309ce21a14f1b97486b5dbd3e9eee2fe8c583eea7d92c7c70d546b23d9842cb6

# Infinix-ai/LFM3-Omni-2B

## Resumen

LFM3-Omni-2B es un modelo ómnimodal de extremo a extremo desarrollado por Liquid AI, presentado como el primer modelo de la familia LFM3 capaz de comprender texto, imágenes, vídeo y audio, y de responder tanto en texto como en voz sintetizada a 24 kHz. Con 2.166.928.384 parámetros, está diseñado explícitamente para su despliegue en dispositivos de borde (teléfonos, portátiles y hardware empotrado), sustituyendo en una sola pieza a un modelo ASR, un modelo visión-lenguaje, un LLM y un modelo TTS independientes.

El modelo integra codificadores específicos para audio y visión, con sus correspondientes conectores, que alimentan el núcleo lingüístico LFM3-1.7B de Liquid AI. La salida se genera como un flujo de tokens de texto y audio, gestionado por una cabeza LM para texto y por un depthformer junto con un codec de audio propietario para la síntesis de voz. Esta arquitectura unificada permite conversaciones por voz sobre imágenes, transcripción y traducción de habla, o preguntas sobre vídeos que requieren procesar simultáneamente imagen y banda sonora.

Su relevancia actual radica en la combinación de modalidad completa y tamaño reducido: la mayoría de modelos ómnimodales publicados superan con creces los miles de millones de parámetros y requieren GPU de centro de datos, mientras que LFM3-Omni-2B apunta a inferencia local en hardware de consumo. La licencia es propietaria (lfm1.0), lo que condiciona su uso comercial y debe revisarse antes de integrarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (núcleo LFM3-1.7B + codificador de audio + codificador de visión + conectores; salida con depthformer y codec de audio) |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors sin cuantizar; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | lfm1.0 (propietaria, etiquetada como "other") |
| Formato de pesos | safetensors (librería transformers, con custom_code) |

## Arquitectura y entrenamiento

LFM3-Omni-2B sigue un diseño modular de fusión temprana: las entradas de audio pasan por un codificador de audio y un conector específico; las imágenes, por un codificador de visión y su conector; y el texto, por el tokenizador y la capa de embeddings. Todas las modalidades convergen en el modelo base LFM3-1.7B, que actúa como núcleo de razonamiento y generación. En la salida, el modelo produce un flujo entrelazado de tokens de texto y de audio: la cabeza LM genera el texto y un depthformer, junto con el codec de audio de Liquid AI, sintetiza voz a 24 kHz. El pipeline declarado es `any-to-any` y requiere `custom_code` para cargarse con transformers.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal más allá de la propia arquitectura multimodal. Cualquier afirmación sobre el proceso de entrenamiento más allá de lo indicado sería especulativa y no se incluye aquí.

## Capacidades

- Comprensión conjunta de texto, imágenes, vídeo y audio en un único modelo de extremo a extremo.
- Generación de respuestas en texto y en voz sintetizada a 24 kHz (speech-to-speech).
- Procesamiento simultáneo de vídeo con banda sonora: el modelo "ve y escucha" a la vez para responder preguntas que requieren ambas modalidades.
- Transcripción de audio (ASR) y traducción de habla.
- Conversación por voz sobre imágenes: preguntar sobre una foto hablando.
- Soporte multilingüe en 23 idiomas, incluidos español, inglés, árabe, chino, francés, alemán, hindi, japonés, coreano, portugués, ruso y vietnamita, entre otros.
- Orientación a despliegue en dispositivos de borde por su tamaño de 2.2B parámetros.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz en dispositivos móviles: el modelo recibe audio del micrófono y responde con voz sintetizada a 24 kHz, todo dentro del propio dispositivo, lo que evita enviar grabaciones a la nube y reduce la latencia de ida y vuelta.
- Descripción y accesibilidad de imágenes por voz: un usuario invidente o con baja visión puede fotografiar su entorno y formular preguntas habladas; el modelo responde en audio, combinando el codificador de visión con la salida de voz.
- Transcripción y traducción de reuniones o notas de voz: al integrar ASR y traducción en el mismo modelo, se puede transcribir una grabación y traducirla a cualquiera de los 23 idiomas soportados sin encadenar modelos separados.
- Análisis de vídeo con audio para moderación o indexación: el modelo procesa imagen y sonido de forma conjunta, lo que permite detectar contenido relevante en vídeos donde el contexto depende de lo que se dice y de lo que se muestra.
- Atención al cliente multimodal en kioscos o terminales: un terminal con cámara y micrófono puede recibir una imagen del producto y una consulta hablada, y responder por voz, con un único modelo de 2.2B desplegado en hardware empotrado.
- Subtitulado y doblaje ligero en local: generación de voz a partir de texto y de texto a partir de voz en el mismo pipeline, útil para prototipos de doblaje o accesibilidad en dispositivos sin conectividad.
- Prototipado de interfaces conversacionales en investigación: al ser un modelo pequeño con soporte transformers y `custom_code`, sirve para experimentar con arquitecturas ómnimodales sin acceso a clústeres de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 4,3 GB solo para los pesos (2.166.928.384 parámetros × 2 bytes), más el coste de activaciones, caché KV y los codificadores de audio y visión; el repositorio ocupa 4,5 GB.
- Cuantización: no se documentan variantes GGUF, AWQ ni GPTQ en la información disponible, por lo que no se puede confirmar una estimación fiable en 4 bits u 8 bits.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar funcionamiento en GPU de consumo con al menos 8 GB de VRAM en fp16, aunque esta estimación no está confirmada por la model card.
- ¿Cabe en GPU de consumo? El diseño está orientado a borde (teléfonos y portátiles), lo que sugiere que sí en hardware reciente, pero no se aportan requisitos mínimos oficiales.
- Opciones de despliegue: transformers (librería declarada, con `custom_code`). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B | 2,17B | no disponible | texto, imagen, vídeo, audio (entrada); texto y voz (salida) | lfm1.0 (propietaria) | HuggingFace, transformers |
| Alternativas ómnimodales de gran tamaño | no disponible en esta ficha | no disponible | no disponible | no disponible | no disponible |
| Alternativas de borde multimodales | no disponible en esta ficha | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de modelos comparables en la información proporcionada, por lo que no se incluyen cifras de rendimiento ni especificaciones de terceros que no puedan contrastarse.

## Limitaciones y advertencias

- Licencia propietaria lfm1.0: es imprescindible revisar los términos del archivo LICENSE antes de cualquier uso comercial; la etiqueta "other" en HuggingFace indica que no es una licencia open source estándar.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos web y multimodales, es razonable esperar sesgos en visión, audio y texto; el autor no aporta evaluación al respecto.
- Riesgo de alucinación: no cuantificado por el autor; como todo LLM, puede generar afirmaciones incorrectas, especialmente en descripciones de imágenes o transcripciones con ruido.
- Longitud de contexto no publicada: limita la planificación de casos de uso con conversaciones largas o vídeos extensos.
- Idiomas: aunque se listan 23 idiomas, no se especifica el nivel de calidad por idioma; el español figura en la lista, pero sin métricas.
- Formato y carga: requiere `custom_code` y la librería transformers; no hay garantía de compatibilidad con runtimes de inferencia alternativos.
- Sin benchmarks publicados: no es posible comparar su calidad con alternativas de forma objetiva a partir de la información disponible.
- Modelo recién publicado (5 de noviembre de 2026) con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria aún inexistentes.

## Enlaces

- HuggingFace: https://huggingface.co/Infinix-ai/LFM3-Omni-2B
- Modelo de referencia de la familia (LFM3-1.7B): https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola/API: https://console.liquid.ai/dashboard
- Playground de voz: https://playground.liquid.ai/talk
- Colección LFM3 en HuggingFace: https://huggingface.co/collections/LiquidAI/lfm3

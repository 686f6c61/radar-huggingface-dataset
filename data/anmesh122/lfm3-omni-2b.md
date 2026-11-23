# Anmesh122/LFM3-Omni-2B

## Resumen

LFM3-Omni-2B es un modelo ómnimodal de la familia LFM3 desarrollada por Liquid AI, publicado en Hugging Face bajo el identificador `Anmesh122/LFM3-Omni-2B`. Se trata de un modelo end-to-end que comprende texto, imágenes, vídeo y audio, y es capaz de responder tanto en texto como en voz sintetizada. Su propuesta principal es sustituir en un único modelo compacto la combinación de un sistema ASR, un modelo visión-lenguaje, un LLM y un sistema TTS, lo que simplifica despliegues en dispositivos con recursos limitados.

Con 2.166.928.384 parámetros totales (aproximadamente 2,2B) según los pesos en safetensors, el modelo está diseñado para ejecutarse en teléfonos, portátiles y hardware de borde. Integra un codificador de audio, un codificador de visión y el modelo base LFM3-1.7B, con una salida que combina tokens de texto y tokens de audio a 24 kHz mediante un depthformer y un códec de audio propio de Liquid.

Su relevancia actual radica en la tendencia hacia modelos ómnimodales pequeños que puedan operar en local: la capacidad de procesar vídeo con sonido de forma conjunta, mantener conversaciones por voz y responder con habla sintetizada en un único checkpoint de 4,5 GB de repositorio lo posiciona como una alternativa práctica frente a pipelines multimodales ensamblados a partir de varios modelos separados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LFM3-1.7B como núcleo, con codificador de audio, codificador de visión, conectores y depthformer para audio) |
| Parametros totales | 2.166.928.384 (2,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de LFM3-Omni-2B combina varios componentes en un pipeline end-to-end. Una pregunta hablada pasa por el codificador de audio de LFM3 y un conector de audio; una imagen lo hace por el codificador de visión y su conector; y un prompt de texto por el tokenizador y la capa de embeddings. Todas las modalidades convergen en el modelo base LFM3-1.7B (Liquid Foundation Model). La salida se genera como un flujo de tokens de texto y audio: los primeros alimentan la cabeza LM para texto, mientras que los segundos pasan por un depthformer y el Liquid Audio Codec para producir habla a 24 kHz. Esta integración permite que el modelo vea y escuche simultáneamente en vídeos con sonido.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. La model card indica que se trata de un checkpoint post-entrenado ("Post-trained omni-modal model"), pero no especifica la metodología concreta. Tampoco se detalla si emplea atención lineal u otras innovaciones de eficiencia propias de la familia LFM3.

## Capacidades

- Comprensión de texto, imágenes, vídeo y audio en un único modelo.
- Generación de respuestas en texto y en voz sintetizada (speech-to-speech) a 24 kHz.
- Procesamiento conjunto de vídeo con pista de audio, permitiendo responder preguntas que requieren ver y oír a la vez.
- Transcripción y traducción de voz.
- Conversación por voz: preguntar sobre una foto hablando, o mantener un diálogo hablado.
- Capacidades multilingües en 23 idiomas (inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso, polaco, danés, griego, finés, hebreo, neerlandés, sueco y turco).
- Orientado a despliegue en dispositivo (edge), con un tamaño que cabe en hardware de consumo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz en dispositivos móviles: el modelo puede recibir una pregunta hablada por el micrófono del teléfono y responder con voz sintetizada a 24 kHz, sustituyendo la cadena ASR + LLM + TTS por un único modelo de 2,2B que cabe en el dispositivo.
- Accesibilidad para personas con discapacidad visual: descripción de imágenes y vídeo en tiempo real mediante entrada de cámara y salida de audio, aprovechando la comprensión conjunta de visión y audio.
- Transcripción y traducción de reuniones: el modelo procesa audio de entrada y genera texto o voz traducida entre los 23 idiomas soportados, útil en entornos multilingües.
- Análisis de vídeo con sonido: responder preguntas sobre contenido audiovisual que requiere correlacionar lo que se ve con lo que se oye (por ejemplo, identificar quién habla en una escena o describir un evento sonoro).
- Atención al cliente por voz en local: conversaciones multi-turno habladas sin depender de la nube, reduciendo latencia y preservando la privacidad del usuario al ejecutarse en hardware de borde.
- Interfaces conversacionales para robótica e IoT: integración de entrada de cámara y micrófono con salida de voz en dispositivos con recursos limitados, como asistentes domésticos o terminales industriales.
- Prototipado rápido de aplicaciones ómnimodales: al ser un checkpoint único con pipeline `any-to-any` en transformers, permite validar flujos de imagen-texto-audio sin ensamblar varios modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño, un modelo de 2,2B en FP16 requiere aproximadamente 4,4 GB solo para pesos, más el overhead de activaciones y del codificador de audio/visión; en cuantizaciones de 8 bits o 4 bits el requisito de pesos bajaría aproximadamente a 2,2 GB y 1,1 GB respectivamente, aunque no se confirman formatos de cuantización soportados.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, debería poder ejecutarse en GPUs de consumo como RTX 3060/4060/4090 con suficiente VRAM en FP16, y en GPUs de datacenter (A100, H100) para mayor throughput, aunque no hay cifras oficiales.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 2,2B, pero no se confirma en la documentación.
- Opciones de despliegue: la librería indicada es transformers con `custom_code`; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El tag `custom_code` implica que requiere cargar código personalizado del repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B | 2,2B | no disponible | texto, imagen, vídeo, audio (entrada); texto y voz (salida) | lfm1.0 | Hugging Face |
| Modelos ómnimodales pequeños comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría (modelos ómnimodales de ~2B con salida de voz). Se recomienda consultar la colección LFM3 de Liquid AI para comparar con los modelos text, vision y audio de la misma familia.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos del modelo; al ser un modelo multilingüe entrenado con datos no especificados, es previsible que presente sesgos culturales y lingüísticos, pero no hay evidencia documentada en la información disponible.
- Riesgo de alucinación: no cuantificado; como todo LLM generativo, puede producir respuestas incorrectas, especialmente en tareas de razonamiento complejo o con entradas ambiguas de audio o vídeo.
- Longitud de contexto no documentada, lo que dificulta planificar aplicaciones que requieran ventanas largas.
- Idiomas: aunque se listan 23 idiomas, no se especifica el nivel de calidad por idioma; el rendimiento podría ser desigual fuera del inglés.
- Licencia lfm1.0 (license: other): es necesario revisar los términos del archivo LICENSE del repositorio antes de un uso comercial; no se detallan aquí las restricciones concretas.
- El repositorio indica `custom_code`, por lo que la carga requiere confiar en el código remoto del autor; conviene auditar antes de usarlo en producción.
- El modelo se publica bajo el identificador `Anmesh122/LFM3-Omni-2B`, no bajo la organización oficial LiquidAI, aunque la model card referencia los recursos oficiales de Liquid AI; verificar la procedencia de los pesos antes de desplegarlos.
- No se dispone de información sobre cuantizaciones oficiales ni sobre soporte en motores de inferencia de alto rendimiento, lo que puede limitar el despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Anmesh122/LFM3-Omni-2B
- Model card oficial referenciada (LiquidAI/LFM3-Omni-2B): https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola / API de Liquid AI: https://console.liquid.ai/dashboard
- Playground de voz: https://playground.liquid.ai/talk
- Colección LFM3 en Hugging Face: https://huggingface.co/collections/LiquidAI/lfm3
- Modelo base LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Sitio de Liquid AI: https://www.liquid.ai/

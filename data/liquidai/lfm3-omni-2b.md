# LiquidAI/LFM3-Omni-2B

## Resumen

LFM3-Omni-2B es el primer modelo omni-modal de la familia LFM3 de Liquid AI. Se trata de un modelo end-to-end que comprende texto, imágenes, vídeo y audio, y responde tanto en texto como en voz (speech-to-speech). Su planteamiento sustituye la combinación habitual de varios modelos especializados (ASR, visión-lenguaje, LLM y TTS) por un único modelo de 2.166.928.384 parámetros, diseñado para ejecutarse en dispositivos de borde como teléfonos, portátiles y hardware embebido.

La arquitectura combina un codificador de audio y un codificador de visión propios de LFM3, cada uno con su conector correspondiente, que alimentan el modelo de lenguaje LFM3-1.7B. La salida se genera como un flujo de tokens de texto y de audio; el texto pasa por la LM head y el audio por un depthformer y el Liquid Audio Codec, que produce voz a 24 kHz. El modelo está post-entrenado y se distribuye con licencia lfm1.0, con soporte para 24 idiomas.

Su relevancia actual radica en la integración de modalidades en un tamaño reducido (2,2B) y en la capacidad de procesar vídeo con pista de audio de forma conjunta, lo que habilita casos de uso conversacionales y de asistencia en tiempo real sobre hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Omni-modal: codificador de audio LFM3 + conector, codificador de visión LFM3 + conector, LLM LFM3-1.7B, salida de texto (LM head) y audio (depthformer + Liquid Audio Codec a 24 kHz) |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (24 idiomas) |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors (librería transformers, código custom) |

## Arquitectura y entrenamiento

LFM3-Omni-2B sigue un diseño modular omni-modal. Las entradas de audio pasan por un codificador de audio LFM3 y un conector de audio; las imágenes y el vídeo pasan por un codificador de visión LFM3 y un conector de visión; y el texto se tokeniza y se embebe. Todas las representaciones convergen en el modelo de lenguaje LFM3-1.7B. En la generación, el modelo emite un flujo de tokens de texto y de audio: los tokens de texto se decodifican mediante la LM head y los de audio mediante un depthformer y el Liquid Audio Codec, que sintetiza voz a 24 kHz. El modelo está post-entrenado, según la model card.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal. La model card destaca como rasgo técnico la capacidad de procesar vídeo con sonido de forma simultánea (visión y audio conjuntos) y el enfoque end-to-end para sustituir pipelines de ASR, VLM, LLM y TTS por un solo modelo.

## Capacidades

- Comprensión de texto, imágenes, vídeo y audio en un único modelo.
- Generación de respuestas en texto y en voz (speech-to-speech) a 24 kHz mediante el Liquid Audio Codec.
- Procesamiento conjunto de vídeo y su pista de audio, lo que permite responder preguntas que requieren ambas modalidades.
- Transcripción de voz (ASR) y traducción de voz.
- Conversación por voz (chat out loud) y preguntas sobre una foto formuladas por voz.
- Capacidades multilingües en 24 idiomas, incluidos español, inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso, polaco, danés, griego, finés, hebreo, neerlandés, sueco y turco.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional por voz en dispositivos móviles: el modelo recibe audio del micrófono y responde con voz sintetizada a 24 kHz, todo en un único modelo de 2,2B, lo que reduce el consumo de memoria y permite su despliegue en teléfonos.
- Descripción y análisis de imágenes por voz: un usuario puede fotografiar un objeto y preguntar sobre él hablando; el codificador de visión procesa la imagen y el modelo responde en audio o texto, útil en aplicaciones de accesibilidad.
- Transcripción y traducción de reuniones: el modelo ASR integrado transcribe audio y puede traducir entre los 24 idiomas soportados, sustituyendo un pipeline separado de reconocimiento y traducción.
- Análisis de vídeo con audio: para vídeos con banda sonora, el modelo ve y escucha simultáneamente, lo que permite responder preguntas sobre contenido visual y sonoro, por ejemplo en moderación de contenido o análisis de grabaciones.
- Asistentes de borde sin conexión: al caber en hardware de consumo y no requerir servicios en la nube, el modelo puede integrarse en dispositivos IoT o portátiles para interacción multimodal local con baja dependencia de red.
- Interfaces de voz para atención al cliente: el modelo puede gestionar conversaciones habladas multi-turno en varios idiomas, con salida de voz natural, en entornos donde se busca reducir la latencia y la infraestructura.
- Herramientas educativas interactivas: un estudiante puede mostrar una imagen o reproducir un audio y formular preguntas habladas, recibiendo explicaciones en texto o voz, con soporte multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 2,2B parámetros en precisión de 16 bits requiere aproximadamente 4,4 GB solo para pesos, a lo que hay que sumar los codificadores de audio y visión y el decodificador de audio; el tamaño del repositorio es de 4,5 GB.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: no confirmado oficialmente; por tamaño, es plausible en GPUs con 8 GB o más de VRAM, pero no se dispone de datos verificados.
- Opciones de despliegue: la librería indicada es transformers con código custom (`custom_code`); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría omni-modal con datos verificables de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir respuestas incorrectas, especialmente en tareas de percepción audiovisual.
- Limitaciones de contexto o idioma: la longitud de contexto no se especifica; el soporte lingüístico se limita a los 24 idiomas listados.
- Restricciones de licencia: la licencia lfm1.0 (license: other) puede imponer condiciones para uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de un despliegue en producción.
- Caveats para producción: el modelo requiere código custom (`custom_code`) en transformers, lo que puede complicar la integración con herramientas estándar; no se confirma soporte en motores de inferencia habituales; el rendimiento real en dispositivos de borde no está documentado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Blog de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- Playground de voz: https://playground.liquid.ai/talk
- Colección LFM3 en Hugging Face: https://huggingface.co/collections/LiquidAI/lfm3
- Licencia (archivo LICENSE del repositorio): https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE

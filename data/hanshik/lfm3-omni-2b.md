# Hanshik/LFM3-Omni-2B

## Resumen

LFM3-Omni-2B es un modelo omnicanal de la familia LFM3 desarrollado por Liquid AI, publicado en Hugging Face bajo el identificador Hanshik/LFM3-Omni-2B. Se trata de un modelo end-to-end que comprende texto, imágenes, vídeo y audio, y que es capaz de responder tanto en texto como en habla sintetizada a 24 kHz. Su propuesta principal es sustituir en un único artefacto la combinación de un modelo ASR, un modelo visión-lenguaje, un LLM y un modelo TTS, lo que simplifica despliegues en entornos con recursos limitados.

Con 2.166.928.384 parámetros (aproximadamente 2,2B), está diseñado para ejecutarse en dispositivos de borde: teléfonos, portátiles y hardware embebido. Su pipeline declarado es any-to-any y emplea la librería transformers con código personalizado (custom_code), lo que implica que requiere confiar en la implementación del repositorio para cargarlo.

Es relevante ahora porque consolida en un solo modelo de tamaño reducido capacidades que hasta hace poco exigían varios sistemas especializados, y porque aborda el procesamiento conjunto de vídeo con pista de audio, una modalidad poco frecuente en modelos de esta escala. La licencia es lfm1.0 (etiquetada como "other"), lo que condiciona su uso comercial y conviene revisar antes de integrarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Omnicanal: encoder de audio LFM3 + conector de audio, encoder de visión LFM3 + conector de visión, tokenizador y embeddings de texto, núcleo LFM3-1.7B (Liquid Foundation Model), LM head de texto y depthformer + Liquid Audio Codec para habla a 24 kHz |
| Parámetros totales | 2.166.928.384 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un ensamblaje multimodal con un núcleo lingüístico LFM3-1.7B al que se conectan un encoder de audio y un encoder de visión, cada uno con su correspondiente conector que proyecta las representaciones al espacio del modelo base. La salida se genera como un flujo de tokens de texto y de audio: el LM head produce texto y un depthformer junto con el Liquid Audio Codec sintetiza habla a 24 kHz. El modelo se distribuye como checkpoint post-entrenado, lo que indica que ha pasado por fases de ajuste posteriores al preentrenamiento, aunque la model card no detalla la composición del dataset, el número de tokens de entrenamiento ni si se emplearon RLHF o DPO.

La innovación destacable es la integración de percepción conjunta de vídeo con sonido: el modelo ve y escucha simultáneamente la pista visual y la sonora, lo que permite responder preguntas que dependen de ambas modalidades. No se documentan en la información disponible técnicas como decodificación especulativa o atención lineal, ni detalles sobre la naturaleza exacta del núcleo LFM3-1.7B más allá de su pertenencia a la familia Liquid Foundation Model.

## Capacidades

- Comprensión de texto, imágenes, vídeo y audio en un único modelo end-to-end.
- Generación de respuestas en texto y en habla sintetizada a 24 kHz.
- Reconocimiento automático de habla (ASR) y traducción de habla.
- Conversación por voz (speech-to-speech) con entrada y salida oral.
- Preguntas y respuestas sobre imágenes (image-text-to-text).
- Preguntas sobre vídeo que requieren integrar la pista visual y la de audio.
- Soporte multilingüe en 24 idiomas, incluido el español.
- Capacidad de ejecución en dispositivos de borde por su tamaño de 2,2B.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio de entrada en streaming o visión de documentos: no disponible.

## Casos de uso

- Asistencia por voz en movilidad: el modelo recibe audio del micrófono y responde con habla sintetizada, lo que permite construir interfaces manos libres en aplicaciones móviles sin depender de la nube, gracias a su tamaño de 2,2B y a su codec de audio integrado.
- Transcripción y traducción de reuniones: al combinar ASR y traducción en un solo modelo, puede tomar el audio de una llamada y devolver texto traducido a otro de los 24 idiomas soportados, reduciendo la cadena de componentes en un pipeline de subtitulado.
- Descripción de imágenes para accesibilidad: un usuario envía una foto y una pregunta hablada, y el modelo devuelve una descripción en texto o en voz, lo que resulta adecuado para aplicaciones de asistencia a personas con discapacidad visual en dispositivos de gama media.
- Análisis de vídeo con sonido: para clips con pista de audio, el modelo puede responder preguntas que combinan lo que se ve y lo que se oye, por ejemplo en moderación de contenido o en indexación de archivos audiovisuales.
- Atención al cliente telefónica: al aceptar entrada de audio y producir salida de voz, puede gestionar conversaciones multi-turno en un centro de contacto, si bien la longitud de contexto no está documentada y debe validarse empíricamente.
- Asistentes locales sin conexión: su tamaño permite desplegarlo en portátiles y teléfonos para tareas de dictado, resumen de audio y respuesta a preguntas sobre imágenes sin enviar datos a servidores externos.
- Prototipado rápido de aplicaciones any-to-any: al cargarse con transformers y pesos safetensors, sirve para experimentar con pipelines que mezclan texto, imagen y audio antes de invertir en modelos especializados de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa, un modelo de 2,2B en fp16 requiere del orden de 4,4 GB solo para pesos, a lo que hay que sumar los encoders de audio y visión y el codec de audio, por lo que conviene reservar margen adicional.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar ejecución en GPUs de consumo, pero no se confirma.
- ¿Cabe en GPU de consumo? No confirmado oficialmente; el diseño está orientado a dispositivos de borde, lo que sugiere que sí en configuraciones adecuadas, pero falta validación documentada.
- Opciones de despliegue: transformers con custom_code (requiere confiar en el código del repositorio); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B | 2,2B | no disponible | texto, imagen, vídeo, audio; salida texto y voz | lfm1.0 | Hugging Face (Hanshik/LFM3-Omni-2B) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; cabe esperar sesgos heredados de los datos de entrenamiento, que tampoco se detallan.
- Riesgo de alucinación: no cuantificado; como modelo generativo multimodal, puede producir descripciones o transcripciones incorrectas, especialmente en audio con ruido o imágenes ambiguas.
- Longitud de contexto no documentada: limita la planificación de conversaciones largas y el procesamiento de documentos extensos.
- Idiomas: se declaran 24 idiomas, pero no se especifica el nivel de calidad por idioma; el rendimiento en lenguas con menos recursos puede ser inferior.
- Licencia lfm1.0 (license: other): es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que las condiciones no se resumen en la model card.
- Código personalizado: el tag custom_code implica que la carga requiere ejecutar código del repositorio, lo que añade un riesgo de seguridad y de compatibilidad con versiones futuras de transformers.
- Procedencia del repositorio: el modelo se publica bajo el identificador Hanshik/LFM3-Omni-2B, no en la organización oficial LiquidAI, con 0 descargas y 0 likes en el momento de la consulta; conviene verificar la integridad y el origen de los pesos antes de usarlos en producción.
- Ausencia de benchmarks: no hay métricas publicadas que permitan estimar la calidad frente a alternativas, lo que obliga a una evaluación propia antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/Hanshik/LFM3-Omni-2B
- Blog de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola de Liquid AI: https://console.liquid.ai/dashboard
- Playground de voz: https://playground.liquid.ai/talk
- Colección LFM3 en Hugging Face: https://huggingface.co/collections/LiquidAI/lfm3
- Modelo de referencia LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B

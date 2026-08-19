# openbmb/MiniCPM-o-4_5

## Resumen

MiniCPM-o 4.5 es un modelo multimodal "any-to-any" desarrollado por OpenBMB, la última versión de la serie MiniCPM-o. Está diseñado para procesar y generar simultáneamente texto, imagen, vídeo y audio en tiempo real, con capacidades de conversación de voz full-duplex y transmisión en vivo. El modelo integra de forma extremo a extremo los encoders/decoders SigLip2, Whisper-medium y CosyVoice2 con el LLM Qwen3-8B, sumando un total de 9 371 787 666 parámetros (aproximadamente 9B). Su relevancia actual radica en que ofrece un rendimiento de nivel comparable a Gemini 2.5 Flash en tareas de visión y lenguaje, pero con un tamaño lo suficientemente compacto para ejecutarse en dispositivos locales como portátiles o GPUs de consumo, democratizando así la IA multimodal de última generación.

El modelo destaca por su capacidad de interacción proactiva: puede iniciar conversaciones o comentarios basándose en su comprensión continua de la escena en tiempo real, algo poco común en modelos de su categoría. Además, soporta clonación de voz y role-play mediante una simple muestra de audio de referencia, y mantiene un comportamiento fiable en benchmarks de alucinación. Con licencia Apache 2.0 y disponible en formato safetensors, también se ofrecen versiones cuantizadas en GGUF e int4 para despliegue en CPU y edge devices.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | End-to-end omni-modal: SigLip2 (visión) + Whisper-medium (audio) + CosyVoice2 (voz) + Qwen3-8B (LLM base) |
| Parametros totales | 9 371 787 666 (9,37B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int4, GGUF (16 tamaños disponibles) |
| Idiomas soportados | Inglés y chino para voz; más de 30 idiomas para capacidades multilingües de texto/visión (lista exacta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también GGUF, ONNX) |

## Arquitectura y entrenamiento

MiniCPM-o 4.5 emplea una arquitectura end-to-end omni-modal en la que los encoders y decoders de cada modalidad (visión, audio y voz) están densamente conectados con el LLM subyacente mediante estados ocultos, lo que permite un flujo de información más rico y un control conjunto de todas las modalidades. El modelo base es Qwen3-8B, sobre el que se integran SigLip2 para visión, Whisper-medium para reconocimiento de audio y CosyVoice2 para síntesis de voz. Esta conexión densa facilita el entrenamiento conjunto y aprovecha el conocimiento multimodal adquirido durante el preentrenamiento.

Para lograr la transmisión full-duplex, el modelo convierte los encoders/decoders offline en versiones online y full-duplex, y el decodificador de tokens de voz modela tokens de texto y voz de forma intercalada, permitiendo la generación simultánea de ambas salidas sin bloqueo mutuo. Además, se introduce un mecanismo de multiplexación por división de tiempo (TDM) que sincroniza todas las corrientes de entrada y salida en una línea de tiempo con precisión de milisegundos, dividiendo las corrientes omni-modales paralelas en grupos de información secuenciales dentro de pequeñas ventanas temporales periódicas. El modelo también incorpora un mecanismo de interacción proactiva: el LLM monitoriza continuamente las corrientes de vídeo y audio y decide a una frecuencia de 1 Hz si debe hablar o no, lo que habilita respuestas proactivas como recordatorios o comentarios espontáneos.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF/DPO. La información disponible solo menciona el diseño arquitectónico y las mejoras funcionales.

## Capacidades

- **Visión y lenguaje**: procesa imágenes de alta resolución (hasta 1,8 millones de píxeles) y vídeo de alta FPS (hasta 10 fps) en cualquier relación de aspecto. Soporta tanto modo instructivo como modo thinking en un único modelo.
- **Voz bidireccional en tiempo real**: conversación de voz en inglés y chino con voces configurables, más natural y estable que versiones anteriores.
- **Clonación de voz y role-play**: mediante una muestra de audio de referencia, puede clonar una voz nueva o adoptar un personaje, superando en rendimiento a herramientas TTS como CosyVoice2.
- **Full-duplex multimodal**: procesa simultáneamente vídeo y audio de entrada mientras genera texto y voz de salida, sin bloqueos mutuos, lo que permite conversaciones fluidas en tiempo real.
- **Interacción proactiva**: el modelo puede iniciar conversaciones, recordatorios o comentarios basados en su comprensión continua de la escena en vivo.
- **OCR y parsing de documentos**: rendimiento de vanguardia en parsing de documentos en inglés (OmniDocBench), superando a modelos como Gemini-3 Flash, GPT-5 y DeepSeek-OCR 2.
- **Multilingüe**: soporta más de 30 idiomas para tareas de texto y visión.
- **Tool calling / function calling**: no se menciona explícitamente en la información disponible, pero al estar basado en Qwen3-8B, es probable que herede capacidades de tool calling; sin embargo, no hay confirmación oficial en la documentación proporcionada.
- **Agentes y razonamiento multi-step**: el modo thinking y la arquitectura de interacción proactiva sugieren capacidades de razonamiento avanzado, aunque no se detallan casos específicos de uso agéntico.

## Casos de uso

- **Asistente personal multimodal en tiempo real**: el modelo puede ejecutarse en un portátil o GPU de consumo para actuar como asistente que ve, escucha y habla simultáneamente. Por ejemplo, durante una videollamada, puede responder preguntas sobre el contenido visual mientras mantiene una conversación de voz natural, gracias a su arquitectura full-duplex.
- **Atención al cliente automatizada con voz y vídeo**: en entornos de soporte remoto, el modelo puede procesar la imagen de la cámara del usuario y su voz, ofreciendo respuestas habladas en tiempo real. Su capacidad de interacción proactiva permite que el sistema inicie recordatorios o sugerencias basadas en lo que ve, mejorando la experiencia de usuario.
- **Traducción e interpretación simultánea**: con soporte para más de 30 idiomas y voz bilingüe (inglés/chino), puede utilizarse como intérprete en reuniones o conferencias, transcribiendo y traduciendo tanto el audio como el contenido visual (diapositivas, pizarras).
- **Herramienta de accesibilidad para personas con discapacidad visual**: el modelo puede describir el entorno en tiempo real a través de la cámara del teléfono, leyendo textos, identificando objetos y respondiendo preguntas habladas, todo con baja latencia y sin necesidad de conexión a la nube.
- **Creación de contenido interactivo y educación**: los profesores pueden usarlo para generar explicaciones habladas sobre diagramas o vídeos educativos, con la capacidad de adaptar el tono y la voz mediante clonación. También puede actuar como tutor virtual que responde preguntas y mantiene conversaciones naturales.
- **Monitorización de vídeo con alertas proactivas**: en aplicaciones de seguridad o vigilancia doméstica, el modelo puede analizar el flujo de vídeo continuo y emitir alertas habladas (por ejemplo, "he detectado movimiento en la entrada") gracias a su mecanismo de decisión a 1 Hz.
- **Desarrollo de prototipos de agentes conversacionales**: los desarrolladores pueden integrar MiniCPM-o 4.5 en aplicaciones de voz (smart speakers, asistentes en coche) mediante vLLM o SGLang, aprovechando su capacidad de procesamiento simultáneo de audio y vídeo para crear experiencias más inmersivas.
- **Análisis de documentos con OCR avanzado**: para digitalización de archivos, el modelo puede extraer texto de imágenes de alta resolución y documentos escaneados con alta precisión, superando a herramientas especializadas como DeepSeek-OCR 2 en inglés.

## Benchmarks y rendimiento

Según la información publicada por el autor, MiniCPM-o 4.5 obtiene una puntuación media de 77,6 en OpenCompass, una evaluación integral de 8 benchmarks populares de visión y lenguaje. Con solo 9B parámetros, supera a modelos propietarios como GPT-4o y Gemini 2.0 Pro, y se acerca a Gemini 2.5 Flash. También logra un rendimiento de vanguardia en OmniDocBench para parsing de documentos en inglés, superando a Gemini-3 Flash, GPT-5 y DeepSeek-OCR 2. En MMHal-Bench, benchmark de alucinación multimodal, iguala a Gemini 2.5 Flash.

No se han publicado resultados detallados por benchmark individual (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La siguiente tabla resume los datos confirmados:

| Benchmark | Resultado | Comparativa |
|---|---|---|
| OpenCompass (media de 8 benchmarks) | 77,6 | Supera a GPT-4o y Gemini 2.0 Pro; se acerca a Gemini 2.5 Flash |
| OmniDocBench (parsing de documentos en inglés) | SOTA | Supera a Gemini-3 Flash, GPT-5 y DeepSeek-OCR 2 |
| MMHal-Bench (alucinación) | Iguala a Gemini 2.5 Flash | - |

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 9,37B parámetros, la inferencia en precisión completa (FP16) requiere aproximadamente 19 GB de VRAM. Con cuantización int4, la VRAM necesaria se reduce a unos 5-6 GB, lo que permite ejecutarlo en GPUs de consumo como la RTX 3060 o superior.
- **GPUs recomendadas**: para uso en precisión completa, se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A5000). Con cuantización int4, una RTX 3060 de 12 GB o una RTX 4060 de 8 GB son suficientes. Para despliegue en servidores, A100 o H100 ofrecen el mejor rendimiento.
- **Compatibilidad con consumer GPU**: sí, gracias a las versiones cuantizadas (int4, GGUF) y al soporte de llama.cpp y Ollama, el modelo puede ejecutarse en GPUs de consumo e incluso en CPU (aunque con mayor latencia). El autor menciona que se puede desplegar en un MacBook.
- **Opciones de despliegue**: PyTorch con GPU Nvidia (recomendado para 100% de precisión), llama.cpp y Ollama para inferencia eficiente en CPU, vLLM y SGLang para alto rendimiento y memoria eficiente, FlagOS para soporte multi-chip unificado, y demos web open-source para full-duplex en dispositivos locales.
- **Latencia y throughput**: no se han publicado cifras concretas. Dado el tamaño de 9B y el uso de cuantización int4, se puede esperar una latencia de decenas de milisegundos por token en GPUs modernas, pero los valores exactos dependen del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de datos comparativos detallados con otros modelos de la misma categoría (por ejemplo, Qwen2.5-VL, MiniCPM-V 4.5, o modelos propietarios como Gemini 2.5 Flash) más allá de las afirmaciones del autor en la model card. A continuación se presenta una comparación cualitativa basada en la información disponible:

| Modelo | Parámetros | Modalidades | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-o 4.5 | 9,37B | Texto, imagen, vídeo, audio, voz | No disponible | Apache 2.0 | Hugging Face, Ollama |
| MiniCPM-V 4.5 | No disponible | Texto, imagen, vídeo | No disponible | Apache 2.0 | Hugging Face |
| Qwen3-8B (base) | 8B | Texto | No disponible | Apache 2.0 | Hugging Face |
| Gemini 2.5 Flash | No disponible (propietario) | Texto, imagen, vídeo, audio | No disponible | Propietario | API |

Según el autor, MiniCPM-o 4.5 supera a GPT-4o y Gemini 2.0 Pro en OpenCompass y se acerca a Gemini 2.5 Flash, pero no se ofrecen cifras exactas de estos modelos para una comparación rigurosa. Tampoco se conocen los parámetros ni el contexto de los modelos comparados.

## Limitaciones y advertencias

- **Idiomas de voz limitados**: la conversación de voz en tiempo real solo está disponible en inglés y chino. Aunque el modelo soporta más de 30 idiomas para texto y visión, la síntesis de voz no cubre todos ellos.
- **Riesgo de alucinación**: aunque el modelo iguala a Gemini 2.5 Flash en MMHal-Bench, sigue siendo susceptible a generar contenido falso o inventado, especialmente en escenarios complejos o con entradas ambiguas. Se recomienda validación humana en aplicaciones críticas.
- **Contexto no especificado**: no se ha publicado la longitud máxima de contexto del modelo, lo que dificulta planificar su uso en tareas que requieran ventanas largas (por ejemplo, análisis de documentos extensos o conversaciones muy largas).
- **Dependencia de componentes externos**: al estar basado en SigLip2, Whisper-medium y CosyVoice2, el rendimiento final depende de la calidad de estos componentes. Cualquier limitación de estos (por ejemplo, errores de transcripción en acentos poco comunes) se propaga al modelo completo.
- **Consumo de recursos en full-duplex**: el procesamiento simultáneo de vídeo y audio en tiempo real puede exigir más recursos que la inferencia estándar de texto. En dispositivos de gama baja, la latencia podría aumentar o la experiencia degradarse.
- **Licencia Apache 2.0**: permite uso comercial, pero se debe revisar si los componentes base (Qwen3-8B, Whisper-medium, etc.) tienen licencias compatibles. Whisper-medium es MIT, CosyVoice2 es Apache 2.0, SigLip2 es MIT, por lo que no se anticipan conflictos, pero conviene verificarlo.
- **Sin garantías de tool calling**: aunque el modelo base Qwen3-8B soporta function calling, no se confirma explícitamente en la documentación de MiniCPM-o 4.5. Los desarrolladores deben probar esta funcionalidad antes de usarla en producción.
- **Modelo relativamente reciente**: la fecha de creación es febrero de 2026 y la última actualización agosto de 2026. Aunque es estable, aún puede haber bugs no detectados o mejoras pendientes.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/openbmb/MiniCPM-o-4_5)
- [Repositorio GitHub](https://github.com/OpenBMB/MiniCPM-o)
- [CookBook (guía de uso)](https://github.com/OpenSQZ/MiniCPM-V-CookBook)
- [Demo omni-modal](https://minicpmo45.modelbest.cn/)
- [Demo visión-lenguaje](http://211.93.21.133:18121/)
- [Demo web en tiempo real (deployable en local)](https://github.com/OpenBMB/MiniCPM-o-Demo/)
- [Página en Ollama](https://ollama.com/openbmb/minicpm-o4.5)
- [Caso de audio](https://openbmb.github.io/minicpm-o-4_5/)
- [Caso omni full-duplex](https://openbmb.github.io/minicpm-o-4_5-omni/)

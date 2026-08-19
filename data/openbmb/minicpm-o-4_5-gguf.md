# openbmb/MiniCPM-o-4_5-gguf

## Resumen

MiniCPM-o 4.5 es un modelo multimodal de extremo a extremo desarrollado por OpenBMB, la comunidad detrás de la serie MiniCPM. Este lanzamiento en formato GGUF corresponde a la versión cuantizada del modelo original, diseñado para ejecutarse eficientemente en dispositivos locales, incluyendo CPU y GPUs de consumo. El modelo integra visión, habla y texto en una única arquitectura, permitiendo interacciones full-duplex en tiempo real, es decir, puede ver, escuchar y hablar simultáneamente sin bloquearse entre flujos.

Con aproximadamente 9 mil millones de parámetros en total, el modelo combina SigLip2 para visión, Whisper-medium para reconocimiento de voz, CosyVoice2 para síntesis de voz y Qwen3-8B como base lingüística. Según los autores, alcanza un rendimiento comparable a Gemini 2.5 Flash en tareas de visión y lenguaje, superando a modelos propietarios como GPT-4o y Gemini 2.0 Pro en benchmarks compuestos. Su relevancia actual radica en ofrecer capacidades multimodales avanzadas en un tamaño reducido, con soporte para streaming de audio y vídeo en tiempo real, algo poco común en modelos open source.

Esta versión GGUF incluye 16 tamaños de cuantización, desde int4 hasta formatos de mayor precisión, lo que facilita su despliegue en entornos con recursos limitados. El modelo soporta más de 30 idiomas, procesamiento de imágenes de alta resolución (hasta 1.8 millones de píxeles) y vídeo a 10 fps, además de funciones como clonación de voz y modos de razonamiento explícito e implícito.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | End-to-end multimodal: SigLip2 (visión) + Whisper-medium (ASR) + CosyVoice2 (TTS) + Qwen3-8B (LLM base) |
| Parametros totales | 8.189.195.264 (safetensors) / ~9B declarados por el autor |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF en 16 tamaños, incluyendo int4 |
| Idiomas soportados | Más de 30 (inglés y chino con habla bilingüe en tiempo real) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (también safetensors para el modelo base) |

## Arquitectura y entrenamiento

MiniCPM-o 4.5 adopta una arquitectura de extremo a extremo donde los codificadores y decodificadores multimodales están densamente conectados con el LLM a través de estados ocultos, lo que permite un flujo de información más rico y un control unificado durante el entrenamiento. El mecanismo central es el full-duplex: los codificadores de entrada (audio y vídeo) operan en línea, mientras que el decodificador de voz genera tokens de texto y habla de forma intercalada, sincronizando todos los flujos en una línea de tiempo mediante un mecanismo de multiplexación por división de tiempo (TDM). Esto permite que el modelo procese entradas continuas y genere salidas simultáneas sin bloqueo mutuo.

El modelo también incorpora un mecanismo de interacción proactiva: el LLM monitoriza constantemente los flujos de vídeo y audio y decide a una frecuencia de 1 Hz si debe hablar o no, lo que habilita comportamientos como iniciar recordatorios o comentarios basados en la comprensión del entorno. La configuración de voz se controla mediante un prompt de sistema de audio adicional, permitiendo clonar voces o realizar role-play en tiempo de inferencia. No se han publicado detalles específicos sobre el volumen de datos de entrenamiento ni sobre el uso de técnicas como RLHF o DPO.

## Capacidades

- Vision y lenguaje: procesamiento de imágenes de alta resolución (hasta 1,8 millones de píxeles) y vídeo de alta FPS (hasta 10 fps) en cualquier relación de aspecto.
- OCR y parsing de documentos: rendimiento de última generación en OmniDocBench para documentos en inglés, superando a herramientas especializadas como DeepSeek-OCR 2.
- Habla bilingüe en tiempo real: conversación por voz en inglés y chino con voces configurables, incluyendo clonación de voz mediante un clip de audio de referencia.
- Full-duplex multimodal streaming: procesamiento simultáneo de entrada de vídeo y audio con salida de texto y habla sin bloqueo mutuo.
- Interacción proactiva: el modelo puede iniciar conversaciones o comentarios basados en el análisis continuo de la escena.
- Multilingüismo: soporte para más de 30 idiomas en tareas de texto y visión.
- Modos de razonamiento: soporta modos instruct y thinking en un mismo modelo, permitiendo elegir entre eficiencia y rendimiento.
- Confiabilidad: resultados comparables a Gemini 2.5 Flash en el benchmark MMHal-Bench sobre alucinaciones.

## Casos de uso

- Atención al cliente multimodal: el modelo puede gestionar videollamadas de soporte, entendiendo el lenguaje hablado y las expresiones visuales del cliente, y respondiendo por voz con baja latencia gracias a su capacidad full-duplex.
- Asistentes personales con interacción proactiva: puede monitorizar el entorno a través de la cámara y el micrófono, recordando citas o alertando sobre eventos relevantes sin necesidad de que el usuario inicie la conversación.
- Traducción y transcripción en tiempo real: procesa audio y vídeo continuamente, generando subtítulos o traducciones habladas en inglés y chino, útil para reuniones o conferencias.
- Análisis de documentos y OCR: extrae texto de imágenes escaneadas o documentos complejos con alta precisión, superando a herramientas especializadas, ideal para digitalización de archivos.
- Accesibilidad para personas con discapacidad visual: describe escenas, lee texto en tiempo real y responde a preguntas sobre el entorno a través de interacción por voz.
- Creación de contenido interactivo: permite experiencias de role-play o narración con voces clonadas, aplicable en juegos, educación o entretenimiento.
- Vigilancia y monitorización inteligente: analiza flujos de vídeo en vivo y emite alertas habladas o escritas ante eventos predefinidos, gracias a su capacidad de procesamiento continuo.

## Benchmarks y rendimiento

Según la información publicada por el autor, MiniCPM-o 4.5 obtiene una puntuación media de 77,6 en OpenCompass, un compuesto de 8 benchmarks populares de visión y lenguaje. Con solo 9B parámetros, supera a GPT-4o y Gemini 2.0 Pro, y se aproxima a Gemini 2.5 Flash. En OmniDocBench, alcanza el estado del arte en parsing de documentos en inglés, superando a Gemini-3 Flash, GPT-5 y DeepSeek-OCR 2. En MMHal-Bench, dedicado a medir alucinaciones, iguala el rendimiento de Gemini 2.5 Flash. No se han publicado resultados detallados por benchmark individual en la información disponible.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM en la documentación proporcionada.
- Para la versión GGUF cuantizada en int4, se estima un uso de memoria de aproximadamente 5-6 GB, lo que permite ejecución en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Las cuantizaciones de mayor precisión (por ejemplo, Q8) requerirán alrededor de 9-10 GB de VRAM, siendo adecuadas para RTX 3090, RTX 4090 o GPUs de datacenter como A10.
- El modelo puede ejecutarse en CPU mediante llama.cpp u Ollama, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, SGLang y FlagOS (backend unificado multi-chip).
- Para streaming full-duplex en tiempo real, se recomienda una GPU con al menos 8 GB de VRAM y soporte CUDA para minimizar la latencia.

## Comparativa con modelos similares

No se dispone de especificaciones detalladas de modelos comparables en la información proporcionada. Los autores comparan MiniCPM-o 4.5 con modelos propietarios como GPT-4o, Gemini 2.0 Pro y Gemini 2.5 Flash, indicando que el modelo open source supera o iguala a estos en varios benchmarks, pero no se ofrecen tablas comparativas con métricas exactas. Tampoco se proporcionan datos de otros modelos open source de tamaño similar, como Qwen2.5-VL o Llama 3.2 Vision. Por tanto, la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- La información sobre sesgos y comportamientos adversos no está publicada; se recomienda evaluar el modelo en el dominio de aplicación antes de desplegarlo en producción.
- Aunque el modelo muestra baja tasa de alucinaciones en MMHal-Bench, sigue existiendo riesgo de generar contenido falso o inconsistente, especialmente en tareas de razonamiento complejo.
- El soporte multilingüe cubre más de 30 idiomas, pero la calidad puede variar significativamente entre ellos; el habla en tiempo real solo está disponible para inglés y chino.
- La versión GGUF es una cuantización del modelo original, por lo que puede presentar una ligera degradación de precisión respecto al modelo en safetensors.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario cumplir con las licencias de los componentes subyacentes (SigLip2, Whisper, CosyVoice2, Qwen3), aunque todos son open source.
- Para aplicaciones de streaming full-duplex, se requiere una integración cuidadosa con los mecanismos de sincronización temporal; un mal uso puede provocar latencias o interrupciones en la conversación.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/openbmb/MiniCPM-o-4_5-gguf
- Modelo base (safetensors): https://huggingface.co/openbmb/MiniCPM-o-4_5
- GitHub del proyecto: https://github.com/OpenBMB/MiniCPM-o
- Demo PyTorch simple: https://github.com/OpenBMB/MiniCPM-o-Demo/
- CookBook de MiniCPM-V: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo omni-modal en línea: https://minicpmo45.modelbest.cn/
- Demo visión-lenguaje: http://211.93.21.133:18121/
- Paper (arXiv): https://arxiv.org/abs/2408.01800

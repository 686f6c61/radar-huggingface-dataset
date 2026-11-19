# openbmb/MiniCPM-o-4_5-gguf

## Resumen

MiniCPM-o 4.5 es un modelo multimodal "any-to-any" de código abierto desarrollado por OpenBMB (ModelBest y Universidad de Tsinghua) que integra visión, voz y texto en una arquitectura end-to-end. Con aproximadamente 9.000 millones de parámetros totales, combina los codificadores SigLip2 (visión), Whisper-medium (audio), el decodificador CosyVoice2 (síntesis de voz) y el backbone lingüístico Qwen3-8B, todos conectados mediante estados ocultos.

El modelo destaca por introducir capacidades de streaming multimodal en tiempo real full-duplex: es capaz de procesar flujos continuos de vídeo y audio mientras genera simultáneamente texto y voz, sin bloqueo mutuo, lo que permite experiencias conversacionales omni-modales en tiempo real. Además incorpora un mecanismo de interacción proactiva que decide a 1 Hz si intervenir o no en función del contenido observado.

Esta versión GGUF está pensada para inferencia eficiente en CPU y dispositivos locales mediante llama.cpp y Ollama, con cuantizaciones int4 e int8 en 16 tamaños distintos. Su licencia Apache 2.0 y su tamaño contenido lo posicionan como una alternativa práctica a modelos propietarios como GPT-4o o Gemini 2.0 Pro en tareas de visión-lenguaje, con un rendimiento que el autor sitúa cercano a Gemini 2.5 Flash.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal end-to-end (SigLip2 + Whisper-medium + CosyVoice2 + Qwen3-8B) |
| Parametros totales | 8.189.195.264 (~8,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (int4, int8 y otras variantes; 16 tamaños publicados) |
| Idiomas soportados | más de 30 idiomas; conversación de voz bilingüe inglés-chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo base en safetensors/PyTorch) |

## Arquitectura y entrenamiento

MiniCPM-o 4.5 emplea una arquitectura omni-modal end-to-end en la que los codificadores y decodificadores de cada modalidad (SigLip2 para visión, Whisper-medium para audio de entrada, CosyVoice2 para síntesis de voz) se conectan densamente al LLM backbone (Qwen3-8B) mediante estados ocultos, en lugar de usar adaptadores desacoplados. Esto facilita el flujo de información multimodal y el aprovechamiento del conocimiento multimodal durante el entrenamiento.

La innovación principal es el mecanismo full-duplex de streaming omni-modal: los codificadores y decodificadores offline se convierten en online y full-duplex, y el decodificador de tokens de voz modela tokens de texto y audio de forma intercalada para sincronizar la generación con la entrada en tiempo real. Todos los flujos de entrada y salida se sincronizan en milisegundos mediante un mecanismo de multiplexación por división de tiempo (TDM) que divide los flujos paralelos en grupos secuenciales dentro de pequeñas franjas periódicas. Además, el modelo incorpora un mecanismo de interacción proactiva que monitoriza continuamente vídeo y audio y decide a 1 Hz si hablar. El sistema de prompt multimodal configurable (texto + audio) permite clonación de voz y role play en tiempo de inferencia. No se dispone de datos públicos sobre el número exacto de tokens de entrenamiento ni sobre la composición del dataset o las etapas de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento en modos instruct y thinking dentro de un mismo modelo.
- Comprensión visual de imágenes de alta resolución (hasta 1,8 millones de píxeles) en cualquier relación de aspecto.
- Procesamiento de vídeo de alta tasa de frames (hasta 10 fps).
- OCR y parsing de documentos; el autor reporta estado del arte en OmniDocBench para parsing de documentos en inglés end-to-end.
- Conversación de voz en tiempo real bilingüe (inglés y chino) con voces configurables.
- Clonación de voz y role play a partir de un clip de audio de referencia.
- Streaming multimodal full-duplex: visión, escucha y habla simultáneas sobre flujos continuos de vídeo y audio.
- Interacción proactiva: el modelo puede iniciar recordatorios o comentarios según el contexto observado.
- Capacidades multilingües en más de 30 idiomas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz en tiempo real: el modelo puede mantener conversaciones habladas bilingües con voces configurables y clonación, adecuado para atención al cliente telefónica o asistentes embebidos donde se requiere baja latencia y síntesis natural.
- Videollamadas asistidas y accesibilidad: al procesar vídeo y audio simultáneamente en full-duplex, puede describir escenas, transcribir y responder en tiempo real, útil para personas con discapacidad visual o auditiva.
- Digitalización y parsing de documentos: su OCR de alta resolución y su rendimiento en OmniDocBench lo hacen adecuado para extraer tablas, fórmulas y estructura de facturas, contratos o artículos científicos en pipelines de automatización documental.
- Vigilancia proactiva de streams: el mecanismo de interacción proactiva a 1 Hz permite monitorizar cámaras o retransmisiones y emitir avisos o comentarios automáticos (por ejemplo, detección de incidentes en directo).
- Despliegue en dispositivos de borde: las cuantizaciones GGUF int4 e int8 con soporte de llama.cpp y Ollama permiten ejecutar el modelo en CPU en portátiles o mini-PC para asistentes locales sin conexión.
- Análisis de vídeo de alta frecuencia: con soporte de hasta 10 fps puede analizar secuencias de acciones, deportes o robótica donde el muestreo temporal es crítico.
- Role play y entretenimiento interactivo: la clonación de voz y el prompt de audio configurable permiten crear personajes conversacionales con voz propia en aplicaciones de ocio o formación.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia comparativa (según autor) |
|---|---|---|
| OpenCompass (media de 8 benchmarks) | 77,6 | supera a GPT-4o y Gemini 2.0 Pro; se acerca a Gemini 2.5 Flash |
| OmniDocBench (parsing de documentos en inglés) | SOTA end-to-end (valor numérico no disponible) | supera a Gemini-3 Flash, GPT-5 y DeepSeek-OCR 2 |
| MMHal-Bench | equiparable a Gemini 2.5 Flash (valor numérico no disponible) | Gemini 2.5 Flash |

No se han publicado en la información disponible resultados numéricos detallados de MMLU, HumanEval, GSM8K ni de los benchmarks individuales de OpenCompass.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): en torno a 16-18 GB para los ~8,2 B parámetros, más overhead de codificadores y caché.
- Cuantización int8: aproximadamente 8-9 GB de VRAM/RAM.
- Cuantización int4: aproximadamente 4,5-5,5 GB, lo que permite ejecución en CPU y en GPUs consumer de gama media.
- GPUs recomendadas: A100 o H100 para inferencia PyTorch de máxima precisión y alto throughput; RTX 4090 o RTX 3090 para ejecución local en BF16/int8; GPUs con 8 GB o menos pueden usar las variantes int4 GGUF.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y superiores, según cuantización.
- Opciones de despliegue: PyTorch con GPU Nvidia (recomendado para precisión del 100 %), llama.cpp y Ollama (CPU), vLLM y SGLang (alto throughput), FlagOS (backend multi-chip), además de demos web oficiales para streaming full-duplex en local.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-o 4.5 | ~8,2 B | no disponible | texto, imagen, vídeo, audio entrada/salida | Apache 2.0 | full-duplex, interacción proactiva, GGUF |
| Qwen3-8B (backbone) | ~8 B | no disponible | texto | Apache 2.0 | solo texto; base del LLM de MiniCPM-o |
| Gemini 2.5 Flash | no disponible (propietario) | no disponible | texto, imagen, audio, vídeo | propietaria | referencia de rendimiento citada por el autor |
| GPT-4o | no disponible (propietario) | no disponible | texto, imagen, audio | propietaria | superado en OpenCompass según el autor |

## Limitaciones y advertencias

- La conversación de voz está limitada a inglés y chino; el resto de los más de 30 idiomas se refiere a capacidades de texto/visión, no necesariamente a voz.
- El rendimiento declarado procede principalmente de evaluaciones del propio autor; conviene validar en el caso de uso concreto antes de producción.
- Riesgo de alucinación inherente a los LLM, especialmente en OCR de documentos degradados o en descripciones de escenas ambiguas.
- La longitud de contexto no está especificada en la información disponible; el streaming continuo puede requerir gestión explícita de ventanas.
- El modo full-duplex y la interacción proactiva son funcionalidades recientes y su estabilidad en producción no está documentada en la información disponible.
- La clonación de voz plantea riesgos éticos y legales (suplantación, consentimiento); debe usarse con salvaguardas.
- Aunque la licencia Apache 2.0 permite uso comercial, los componentes base (Qwen3-8B, Whisper-medium, CosyVoice2, SigLip2) deben verificarse individualmente por si imponen condiciones adicionales.
- El repo GGUF ocupa 80 GB por incluir múltiples cuantizaciones; el despliegue debe seleccionar solo el archivo necesario.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/openbmb/MiniCPM-o-4_5-gguf
- Modelo base: https://huggingface.co/openbmb/MiniCPM-o-4_5
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- CookBook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo omni-modal: https://minicpmo45.modelbest.cn/
- Demo visión-lenguaje: http://211.93.21.133:18121/
- Discord: https://discord.gg/N2RnxGdJ
- Wiki (chino): https://openbmb.cn/docs/
- CaseBook audio: https://openbmb.github.io/minicpm-o-4_5/
- CaseBook omni full-duplex: https://openbmb.github.io/minicpm-o-4_5-omni/
- Paper (arXiv): https://arxiv.org/abs/2408.01800

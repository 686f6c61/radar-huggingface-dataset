# openbmb/MiniCPM-o-4_5-awq

## Resumen

MiniCPM-o 4.5 es un modelo multimodal omnicanal (any-to-any) desarrollado por OpenBMB que integra visión, voz y texto en una arquitectura end-to-end de 9B parámetros. Construido sobre un backbone Qwen3-8B combinado con SigLip2 (visión), Whisper-medium (ASR) y CosyVoice2 (TTS), el modelo está diseñado para ejecutarse en dispositivos de consumo como teléfonos y portátiles, ofreciendo capacidades de conversación por voz bilingüe (inglés y chino) y procesamiento de streaming multimodal en tiempo real.

La variante aquí descrita, `MiniCPM-o-4_5-awq`, es la versión cuantizada a 4 bits mediante AWQ (Activation-aware Weight Quantization) del modelo base, publicada por el mismo equipo. Esta cuantización reduce el peso del repositorio a 12,5 GB, facilitando el despliegue en GPUs con VRAM limitada sin renunciar a las capacidades del modelo original.

Su relevancia actual radica en la introducción de un mecanismo de full-duplex que permite al modelo ver, escuchar y hablar simultáneamente, así como interacción proactiva (iniciar comentarios o recordatorios sin ser preguntado). Con 9B parámetros, el modelo declara superar a GPT-4o y Gemini 2.0 Pro en benchmarks visuales agregados (OpenCompass) y acercarse a Gemini 2.5 Flash, lo que lo posiciona como una alternativa open source competitiva para aplicaciones multimodales en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal end-to-end (Qwen3-8B + SigLip2 + Whisper-medium + CosyVoice2) |
| Parametros totales | 9.371.787.666 (~9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit AWQ (esta variante); el modelo base ofrece int4 y GGUF en 16 tamanos |
| Idiomas soportados | Mas de 30 idiomas; conversacion por voz bilingue ingles-chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (tags del repo) |

## Arquitectura y entrenamiento

MiniCPM-o 4.5 emplea una arquitectura omnicanal end-to-end en la que los codificadores y decodificadores de cada modalidad (SigLip2 para visión, Whisper-medium para audio de entrada, CosyVoice2 para síntesis de voz) se conectan densamente con el LLM backbone (Qwen3-8B) mediante estados ocultos. Esta conexión end-to-end, en lugar de un pipeline modular, permite un mejor flujo de información y control, y facilita el aprovechamiento del conocimiento multimodal durante el entrenamiento.

La innovación técnica principal es el mecanismo de full-duplex para streaming multimodal en vivo. Los codificadores y decodificadores offline se transforman en versiones online y full-duplex, y el decodificador de tokens de voz modela tokens de texto y audio de forma intercalada para permitir generación de voz full-duplex. Todos los flujos de entrada y salida se sincronizan en una línea temporal con precisión de milisegundos mediante un mecanismo de multiplexación por división de tiempo (TDM) que divide los flujos paralelos en grupos secuenciales dentro de intervalos periódicos pequeños. Además, el modelo incorpora un mecanismo de interacción proactiva: el LLM monitoriza continuamente los flujos de vídeo y audio y decide a 1 Hz si debe hablar o no. El diseño de prompt de sistema multimodal (texto y audio) permite clonar voces y hacer role play en tiempo de inferencia. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento en modos instruct y thinking dentro del mismo modelo.
- Comprensión visual de imágenes de alta resolución (hasta 1,8 millones de píxeles) y vídeo de hasta 10 fps en cualquier relación de aspecto.
- OCR y parsing de documentos en inglés con rendimiento declarado state-of-the-art en OmniDocBench para parsing end-to-end.
- Conversación por voz bilingüe (inglés y chino) en tiempo real con voces configurables.
- Clonación de voz y role play a partir de un clip de audio de referencia, con rendimiento declarado superior a CosyVoice2.
- Full-duplex multimodal live streaming: procesamiento simultáneo de vídeo y audio continuos mientras genera texto y voz sin bloqueo mutuo.
- Interacción proactiva: inicio de recordatorios o comentarios basados en la comprensión continua del escenario en vivo, con decisión a 1 Hz.
- Capacidades multilingües en más de 30 idiomas.
- Comportamiento "trustworthy" según MMHal-Bench, equiparable a Gemini 2.5 Flash según el autor.
- Soporte de despliegue en llama.cpp, Ollama, vLLM, SGLang y FlagOS (no se detalla soporte explícito de tool calling en la información disponible).

## Casos de uso

- Asistencia en vivo por videollamada: el modelo procesa simultáneamente el vídeo y el audio de la llamada y responde con voz en tiempo real, adecuado para soporte técnico remoto o teleasistencia gracias al mecanismo full-duplex.
- Atención al cliente por voz: conversaciones multi-turno bilingües con voces configurables y clonación de la voz de la marca a partir de un clip de referencia, desplegable en GPU de consumo.
- Accesibilidad para personas con discapacidad visual: descripción proactiva del entorno a partir del stream de cámara, con recordatorios iniciados por el propio modelo a 1 Hz sin necesidad de pregunta explícita.
- Digitalización y parsing de documentos: extracción estructurada de documentos en inglés con imágenes de hasta 1,8 MP, adecuado para pipelines de facturación o archivo gracias a su rendimiento declarado en OmniDocBench.
- Análisis de vídeo de vigilancia o monitorización: procesamiento de vídeo a hasta 10 fps con comprensión temporal y generación de alertas o comentarios proactivos.
- Asistente personal en el móvil: al estar pensado para ejecutarse en teléfonos, permite conversación por voz offline con cuantización int4/GGUF y despliegue vía llama.cpp u Ollama.
- Role play y entretenimiento interactivo: clonación de voz y prompt de sistema de audio permiten crear personajes con voz propia en tiempo de inferencia.
- Moderación de contenido audiovisual en directo: el modelo puede monitorizar streams continuos y emitir comentarios o avisos en tiempo real.

## Benchmarks y rendimiento

| Benchmark | Resultado | Comparativa declarada |
|---|---|---|
| OpenCompass (media de 8 benchmarks) | 77,6 | Supera a GPT-4o y Gemini 2.0 Pro; se acerca a Gemini 2.5 Flash |
| OmniDocBench (parsing de documentos en inglés) | SOTA end-to-end (sin cifra publicada) | Supera a Gemini-3 Flash, GPT-5 y DeepSeek-OCR 2 |
| MMHal-Bench | no disponible (cifra) | Equiparable a Gemini 2.5 Flash |

No se han publicado en la información disponible cifras detalladas de MMLU, HumanEval, GSM8K ni de benchmarks de voz (WER, MOS) para esta variante AWQ.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo AWQ ocupa 12,5 GB, por lo que se requieren aproximadamente 13-14 GB de VRAM en 4 bits, más overhead de contexto y del codificador visual/audio.
- GPU recomendadas: A100, H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) para inferencia individual con margen.
- Cabe en GPU de consumo: sí, en GPUs con 16 GB o más (RTX 4080, 4090, A4000); en 12 GB podría requerir ajustes de contexto o cuantización adicional.
- Opciones de despliegue: PyTorch con GPU Nvidia (recomendado para precisión total), vLLM y SGLang para alto throughput, llama.cpp y Ollama para CPU/end-device, FlagOS para backend multi-chip.
- Formatos cuantizados disponibles del modelo base: int4 y GGUF en 16 tamaños.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-o 4.5 (AWQ) | ~9B | no disponible | Visión, voz, texto, full-duplex | Apache 2.0 | Hugging Face, pesos abiertos |
| Gemini 2.5 Flash | no disponible | no disponible | Visión, voz, texto | Propietaria | API |
| GPT-4o | no disponible | no disponible | Visión, voz, texto | Propietaria | API |
| Qwen3-8B (backbone) | 8B | no disponible | Texto | Apache 2.0 | Hugging Face |

La comparativa se basa en las afirmaciones del autor sobre OpenCompass y MMHal-Bench; no se dispone de una evaluación independiente en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks declarados (OpenCompass 77,6, superioridad sobre GPT-4o y Gemini 2.0 Pro) provienen del autor y no se han verificado de forma independiente en la información disponible.
- La cuantización AWQ a 4 bits puede degradar ligeramente la precisión respecto al modelo base en tareas sensibles, especialmente en parsing de documentos y generación de voz.
- La conversación por voz está limitada a inglés y chino; el resto de los más de 30 idiomas se limita a texto/visión.
- Riesgo de alucinación inherente a los LLM, especialmente en descripciones de escenas en vivo y OCR de documentos complejos.
- Sesgos conocidos: no se documentan en la información proporcionada; deben evaluarse por caso de uso.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los componentes (Whisper, CosyVoice2, SigLip2) que puedan imponer condiciones adicionales.
- El full-duplex y la interacción proactiva requieren infraestructura de streaming con sincronización en milisegundos; no es un despliegue trivial en producción.
- No se dispone de información sobre longitud de contexto máxima, lo que limita la planificación de cargas con documentos largos.

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM-o-4_5-awq
- Modelo base: https://huggingface.co/openbmb/MiniCPM-o-4_5
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- CookBook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo omnicanal: https://minicpmo45.modelbest.cn/
- Demo visión-lenguaje: http://211.93.21.133:18121/
- Discord: https://discord.gg/N2RnxGdJ
- Wiki (chino): https://openbmb.cn/docs/
- CaseBook audio: https://openbmb.github.io/minicpm-o-4_5/
- CaseBook full-duplex: https://openbmb.github.io/minicpm-o-4_5-omni/
- Paper (arXiv): https://arxiv.org/abs/2408.01800

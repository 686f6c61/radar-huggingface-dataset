# openbmb/MiniCPM-o-4_5-awq

## Resumen

MiniCPM-o 4.5 es un modelo multimodal "any-to-any" de 9 000 millones de parámetros desarrollado por OpenBMB, la continuación de la serie MiniCPM-o. Está construido de extremo a extremo combinando SigLip2 para visión, Whisper-medium para audio, CosyVoice2 para síntesis de voz y Qwen3-8B como columna vertebral de lenguaje. Su principal novedad es el soporte de streaming multimodal full-duplex: puede ver, oír y hablar simultáneamente, procesando flujos continuos de vídeo y audio mientras genera texto y voz en tiempo real, sin bloqueos mutuos. Además, incorpora interacción proactiva, decidiendo a 1 Hz si debe intervenir en la conversación.

El modelo destaca por su rendimiento en visión-lenguaje: alcanza una puntuación media de 77,6 en OpenCompass (8 benchmarks), superando a GPT-4o y Gemini 2.0 Pro, y acercándose a Gemini 2.5 Flash, todo con solo 9B parámetros. También ofrece capacidades de OCR de alta resolución (hasta 1,8 millones de píxeles), vídeo de hasta 10 fps, parsing de documentos en inglés de nivel SOTA y soporte multilingüe en más de 30 idiomas. Esta versión AWQ (4 bits) reduce el tamaño del modelo a aproximadamente 12,5 GB, facilitando su despliegue en hardware de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | End-to-end multimodal: SigLip2 (visión) + Whisper-medium (audio) + CosyVoice2 (TTS) + Qwen3-8B (LLM) |
| Parametros totales | 9 371 787 666 (9,37B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AWQ 4-bit (este repo); también disponibles GGUF e int4 en otros repos (16 tamaños) |
| Idiomas soportados | Inglés y chino (habla); más de 30 idiomas (texto y visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (AWQ); también GGUF |

## Arquitectura y entrenamiento

MiniCPM-o 4.5 utiliza una arquitectura end-to-end omni-modal donde los codificadores y decodificadores de cada modalidad (visión, audio, voz) están densamente conectados con el LLM a través de estados ocultos, lo que permite un flujo de información más rico y un control unificado durante el entrenamiento. El mecanismo de streaming full-duplex convierte los codificadores/decodificadores offline en versiones online: el decodificador de tokens de habla genera tokens de texto y voz de forma intercalada, lo que permite una generación de voz estable incluso en segmentos largos (más de un minuto). Todos los flujos de entrada y salida se sincronizan en una línea temporal de milisegundos mediante un mecanismo de multiplexación por división de tiempo (TDM), que organiza los flujos omni-modales paralelos en grupos secuenciales dentro de pequeñas rebanadas de tiempo.

El entrenamiento combina los componentes preentrenados mencionados y se realiza de forma end-to-end. No se han publicado detalles específicos sobre el número de tokens de entrenamiento, la composición exacta del dataset o el uso de técnicas como RLHF o DPO. El modelo soporta dos modos de inferencia (instruct y thinking) en un solo conjunto de pesos, lo que permite equilibrar eficiencia y rendimiento según el escenario. La interacción proactiva se logra haciendo que el LLM monitorice continuamente los flujos de vídeo y audio, decidiendo a una frecuencia de 1 Hz si debe hablar o no.

## Capacidades

- Generación de texto y razonamiento multimodal: combina comprensión de imagen, vídeo, audio y texto en una sola pasada.
- Conversación de voz bilingüe en tiempo real (inglés y chino) con voces configurables mediante un prompt de sistema de audio.
- Clonación de voz y role play: a partir de un clip de audio de referencia, el modelo puede imitar una voz, superando en rendimiento a herramientas TTS dedicadas como CosyVoice2.
- Full-duplex multimodal live streaming: procesa simultáneamente vídeo y audio continuos mientras genera texto y voz, sin bloqueo mutuo.
- Interacción proactiva: puede iniciar recordatorios o comentarios basados en su comprensión continua de la escena en vivo.
- OCR de alta resolución: procesa imágenes de hasta 1,8 millones de píxeles y vídeo de hasta 10 fps en cualquier relación de aspecto.
- Parsing de documentos en inglés de extremo a extremo: estado del arte en OmniDocBench, superando a modelos propietarios como Gemini-3 Flash, GPT-5 y DeepSeek-OCR 2.
- Soporte multilingüe en más de 30 idiomas para tareas de visión y texto.
- Comportamiento fiable: comparable a Gemini 2.5 Flash en MMHal-Bench, un benchmark de alucinaciones multimodales.
- Tool calling / function calling: no se menciona explícitamente en la información disponible, aunque al estar basado en Qwen3-8B es probable que herede capacidades de esta familia. No confirmado.

## Casos de uso

- Asistentes de voz en tiempo real para dispositivos móviles: el modelo puede mantener conversaciones de voz naturales en inglés y chino, con baja latencia y voces configurables, ideal para asistentes personales o aplicaciones de accesibilidad.
- Streaming de vídeo interactivo: gracias al full-duplex y la interacción proactiva, puede comentar en vivo lo que ve, por ejemplo en videollamadas, transmisiones o vigilancia, ofreciendo resúmenes o alertas automáticas.
- Clonación de voz y doblaje: a partir de un audio de referencia corto, el modelo puede generar voz clonada para narración, audiolibros o doblaje de contenido, superando a herramientas TTS especializadas.
- OCR y digitalización de documentos: con soporte de alta resolución y parsing de documentos de extremo a extremo, es adecuado para digitalizar facturas, contratos o libros, incluso en inglés, superando a soluciones propietarias.
- Traducción y asistencia multilingüe: al soportar más de 30 idiomas en texto y visión, puede traducir contenido visual (carteles, menús, pantallas) o conversaciones en tiempo real.
- Educación y tutoría multimodal: puede explicar conceptos a partir de imágenes o vídeos, responder preguntas de voz y mantener diálogos interactivos, útil en plataformas de e-learning.
- Prototipado de agentes omni-modales: su arquitectura end-to-end y soporte de streaming lo convierten en una base para investigar agentes que perciben y actúan en entornos audiovisuales continuos.

## Benchmarks y rendimiento

La información disponible de la model card incluye los siguientes resultados, sin detalle de metodología completa:

| Benchmark | Resultado | Comparación |
|---|---|---|
| OpenCompass (media de 8 benchmarks de visión-lenguaje) | 77,6 | Supera a GPT-4o y Gemini 2.0 Pro; se acerca a Gemini 2.5 Flash |
| OmniDocBench (parsing de documentos en inglés) | Estado del arte | Supera a Gemini-3 Flash, GPT-5 y DeepSeek-OCR 2 |
| MMHal-Bench (alucinaciones multimodales) | Comparable a Gemini 2.5 Flash | Comportamiento fiable |

No se han publicado resultados detallados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. Los datos presentados provienen de la model card del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 9,37B parámetros cuantizado a 4 bits (AWQ), se estima que requiere entre 5 y 7 GB de VRAM para inferencia en precisión completa de 4 bits. Esta es una estimación razonable basada en el tamaño del modelo, no un dato oficial.
- GPU recomendadas: el modelo puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4070, RTX 4090, así como en GPUs profesionales como A100 o H100. La model card menciona que se puede desplegar en un MacBook (Apple Silicon) mediante llama.cpp.
- Opciones de despliegue: PyTorch con GPU NVIDIA (precisión completa), llama.cpp y Ollama para inferencia eficiente en CPU, vLLM y SGLang para alto rendimiento y uso eficiente de memoria, y FlagOS como backend unificado multi-chip.
- Latencia y throughput: no se proporcionan datos numéricos oficiales. Se espera que la cuantización AWQ reduzca la latencia frente al modelo base, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de modelos comparables en la información proporcionada. Sin embargo, según la model card, MiniCPM-o 4.5 se posiciona frente a modelos propietarios como Gemini 2.5 Flash, GPT-4o y Gemini 2.0 Pro en tareas de visión-lenguaje, superándolos en varios benchmarks con solo 9B parámetros. En el ámbito open source, alternativas multimodales de tamaño similar incluyen Qwen2.5-VL-7B (7B parámetros, contexto 128K) y MiniCPM-V 4.6 (1.3B parámetros, orientado a eficiencia). No se han publicado comparativas directas con estos modelos en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiniCPM-o 4.5 (AWQ) | 9,37B | No disponible | Apache-2.0 | Full-duplex, voz, visión, proactivo |
| Qwen2.5-VL-7B | 7B | 128K | Apache-2.0 | Visión-lenguaje, sin voz |
| MiniCPM-V 4.6 | 1,3B | No disponible | Apache-2.0 | Visión-lenguaje eficiente, sin voz |

## Limitaciones y advertencias

- La longitud de contexto no está publicada, lo que dificulta planificar despliegues con ventanas de conversación largas.
- El soporte de voz se limita a inglés y chino; otros idiomas solo están disponibles para texto y visión.
- No se confirma el soporte de tool calling o function calling, aunque podría heredarse de Qwen3-8B; se recomienda verificar antes de usarlo en agentes.
- Al ser un modelo multimodal, existe riesgo de alucinaciones visuales y de audio, aunque el rendimiento en MMHal-Bench es comparable a Gemini 2.5 Flash.
- La cuantización AWQ de 4 bits puede introducir una ligera degradación en la calidad de salida frente al modelo en precisión completa, especialmente en tareas de razonamiento complejo.
- El modelo requiere código personalizado (custom_code) en HuggingFace, lo que implica revisar la implementación antes de usarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que los componentes base (Qwen3-8B, SigLip2, Whisper, CosyVoice2) no tengan restricciones adicionales.
- No hay información sobre sesgos específicos del modelo; se recomienda evaluar en el dominio de aplicación antes de desplegarlo.

## Enlaces

- [HuggingFace - openbmb/MiniCPM-o-4_5-awq](https://huggingface.co/openbmb/MiniCPM-o-4_5-awq)
- [HuggingFace - openbmb/MiniCPM-o-4_5 (modelo base)](https://huggingface.co/openbmb/MiniCPM-o-4_5)
- [GitHub - OpenBMB/MiniCPM-o](https://github.com/OpenBMB/MiniCPM-o)
- [GitHub - OpenBMB/MiniCPM-o-Demo](https://github.com/OpenBMB/MiniCPM-o-Demo/)
- [Demo omni-modal](https://minicpmo45.modelbest.cn/)
- [Demo visión-lenguaje](http://211.93.21.133:18121/)
- [CookBook](https://github.com/OpenSQZ/MiniCPM-V-CookBook)
- [Paper arXiv 2408.01800](https://arxiv.org/abs/2408.01800)

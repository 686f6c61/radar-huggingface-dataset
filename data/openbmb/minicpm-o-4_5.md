# openbmb/MiniCPM-o-4_5

## Resumen

MiniCPM-o 4.5 es un modelo multimodal integral (any-to-any) de 9.371.787.666 parametros (~9B) desarrollado por OpenBMB. Integra codificadores y decodificadores de vision, voz y texto sobre un backbone LLM Qwen3-8B, combinando SigLip2 para vision, Whisper-medium para reconocimiento de voz y CosyVoice2 para sintesis de voz, todo conectado de extremo a extremo mediante estados ocultos. Resuelve el problema de la interaccion multimodal simultanea: no solo procesa imagen, video y audio, sino que genera texto y voz en paralelo mientras sigue recibiendo entrada en tiempo real.

Su caracteristica diferencial es la capacidad full-duplex: el modelo puede ver, escuchar y hablar a la vez sin bloqueo mutuo, con sincronizacion de todos los flujos en milisegundos mediante un mecanismo de multiplexacion por division de tiempo (TDM). Ademas incorpora interaccion proactiva, decidiendo a 1 Hz si debe intervenir o no en funcion del flujo continuo de video y audio. Con 9B parametros alcanza resultados que superan a GPT-4o y Gemini 2.0 Pro en vision-lenguaje y se aproximan a Gemini 2.5 Flash, lo que lo posiciona como una alternativa open source (Apache 2.0) desplegable en dispositivos de consumo y moviles.

El modelo esta publicado bajo licencia Apache 2.0, con pesos en safetensors y ONNX, y dispone de cuantizaciones int4 y GGUF en 16 tamanos, lo que facilita su despliegue en CPU (llama.cpp, Ollama), GPU (vLLM, SGLang) y backends multi-chip (FlagOS). Su relevancia actual radica en ser uno de los pocos modelos abiertos que combina vision de alta resolucion, OCR de nivel estado del arte, conversacion de voz bilingue con clonacion y streaming multimodal en vivo en un unico modelo compacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | End-to-end omni-modal: SigLip2 (vision) + Whisper-medium (ASR) + CosyVoice2 (TTS) + Qwen3-8B (LLM backbone) |
| Parametros totales | 9.371.787.666 (~9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int4, GGUF (16 tamanos disponibles) |
| Idiomas soportados | Mas de 30 idiomas; conversacion de voz en ingles y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, GGUF |

## Arquitectura y entrenamiento

MiniCPM-o 4.5 sigue una arquitectura omni-modal de extremo a extremo en la que los codificadores y decodificadores de cada modalidad (SigLip2 para vision, Whisper-medium para reconocimiento de voz, CosyVoice2 para sintesis de voz) se conectan densamente con el LLM backbone Qwen3-8B mediante estados ocultos. Esta conexion directa permite un mejor flujo de informacion y control, y aprovecha el conocimiento multimodal durante el entrenamiento.

La innovacion tecnica principal es el mecanismo full-duplex de streaming multimodal en vivo. Los codificadores y decodificadores originalmente offline se convierten en online y full-duplex para entradas y salidas en streaming. El decodificador de tokens de voz modela tokens de texto y de voz de forma intercalada, lo que permite generacion de voz full-duplex (sincronizada con nueva entrada) y estabiliza la generacion de voz larga (mas de 1 minuto). Todos los flujos de entrada y salida se sincronizan en la linea temporal a nivel de milisegundos mediante un mecanismo de multiplexacion por division de tiempo (TDM) que divide los flujos paralelos en grupos secuenciales dentro de pequenas franjas periodicas. El mecanismo de interaccion proactiva hace que el LLM monitorice continuamente video y audio y decida a 1 Hz si hablar o no. El diseno de modelado de voz configurable hereda el system prompt multimodal de MiniCPM-o 2.6, incorporando un audio system prompt que determina la voz del asistente y permite clonacion de voz y role play en tiempo de inferencia. No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO en la documentacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento, con modos instruct y thinking integrados en un solo modelo.
- Comprension de imagenes de alta resolucion (hasta 1,8 millones de pixeles) en cualquier relacion de aspecto.
- Procesamiento de video de alto FPS (hasta 10 fps).
- OCR y parseo de documentos: rendimiento estado del arte en parseo de documentos en ingles end-to-end en OmniDocBench.
- Conversacion de voz bilingue en tiempo real (ingles y chino) con voces configurables.
- Clonacion de voz y role play a partir de un clip de audio de referencia, superando a CosyVoice2 en calidad de clonacion.
- Streaming multimodal en vivo full-duplex: procesa video y audio continuos simultaneamente mientras genera texto y voz concurrentes sin bloqueo mutuo.
- Interaccion proactiva: inicia recordatorios o comentarios basandose en la comprension continua de la escena en vivo.
- Capacidades multilingues en mas de 30 idiomas.
- Comportamiento fiable: iguala a Gemini 2.5 Flash en MMHal-Bench (medicion de alucinacion).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (el modo thinking sugiere capacidad de razonamiento, pero no se documenta soporte de agentes).

## Casos de uso

- Asistencia en vivo para personas con discapacidad visual: el modelo procesa flujo continuo de video y audio y genera descripciones habladas en tiempo real, gracias al mecanismo full-duplex que permite ver, escuchar y hablar simultaneamente sin bloqueo.
- Atencion al cliente por voz: gestion de conversaciones telefonicas bilingues (ingles y chino) con voces configurables y clonacion de la voz de marca a partir de un clip de referencia, usando CosyVoice2 integrado y generacion de voz estable de mas de 1 minuto.
- Digitalizacion y parseo de documentos: extraccion estructurada de documentos escaneados en ingles con rendimiento estado del arte en OmniDocBench, procesando imagenes de hasta 1,8 millones de pixeles en cualquier relacion de aspecto.
- Analisis de video en produccion: procesamiento de video a hasta 10 fps para tareas de comprension temporal, vigilancia o inspeccion visual, con modo thinking para casos que requieren razonamiento profundo.
- Interaccion proactiva en entornos domesticos o industriales: el modelo monitoriza video y audio y decide a 1 Hz si emitir un recordatorio o comentario, adecuado para sistemas de alerta y supervision autonoma.
- Despliegue en moviles y dispositivos de consumo: con cuantizaciones int4 y GGUF en 16 tamanos y soporte de llama.cpp y Ollama, permite inferencia en CPU en portatiles (por ejemplo MacBook) y demos web locales de streaming full-duplex.
- Servidores de inferencia de alto rendimiento: integracion con vLLM y SGLang para alto throughput y eficiencia de memoria, y con FlagOS para backends multi-chip unificados.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia comparativa |
|---|---|---|
| OpenCompass (media de 8 benchmarks) | 77,6 | Supera GPT-4o y Gemini 2.0 Pro; se aproxima a Gemini 2.5 Flash |
| OmniDocBench (parseo de documentos en ingles end-to-end) | Estado del arte | Supera Gemini-3 Flash, GPT-5 y DeepSeek-OCR 2 |
| MMHal-Bench (fiabilidad / alucinacion) | Iguala Gemini 2.5 Flash | Gemini 2.5 Flash |

No se han publicado en la informacion disponible resultados numericos detallados por benchmark individual (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~9B parametros, en fp16 se requieren aproximadamente 18-19 GB de VRAM para los pesos, mas overhead de codificadores multimodales y cache KV.
- En int4 la huella de pesos baja a aproximadamente 5-6 GB, permitiendo despliegue en GPU de consumo.
- GPU recomendadas: Nvidia GPU para inferencia PyTorch con precision del 100% (recomendado por el autor); A100/H100 para alto throughput con vLLM o SGLang.
- Cabe en GPU de consumo: si, con cuantizacion int4/GGUF; el autor menciona despliegue en telefonos y portatiles (MacBook).
- Opciones de despliegue: PyTorch (Nvidia GPU), llama.cpp y Ollama (CPU en dispositivos locales), vLLM y SGLang (alto throughput), FlagOS (backend multi-chip), ONNX.
- Latencia y throughput estimados: no disponibles; el modelo sincroniza flujos en milisegundos y decide proactivamente a 1 Hz, pero no se publican cifras de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision-lenguaje | Voz | Full-duplex | Licencia |
|---|---|---|---|---|---|---|
| MiniCPM-o 4.5 | ~9B | no disponible | 77,6 OpenCompass; supera GPT-4o y Gemini 2.0 Pro | Si (ASR + TTS bilingue, clonacion) | Si | Apache 2.0 |
| GPT-4o | no disponible (propietario) | no disponible | Superado por MiniCPM-o 4.5 en OpenCompass segun el autor | Si | no disponible | Propietaria |
| Gemini 2.5 Flash | no disponible (propietario) | no disponible | Referencia de rendimiento; MiniCPM-o 4.5 se aproxima | Si | no disponible | Propietaria |
| Gemini 2.0 Pro | no disponible (propietario) | no disponible | Superado por MiniCPM-o 4.5 en OpenCompass segun el autor | Si | no disponible | Propietaria |

Los datos de comparacion provienen de la model card del autor; no se dispone de mediciones independientes ni de alternativas open source equivalentes documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: el modelo iguala a Gemini 2.5 Flash en MMHal-Bench, lo que implica que mantiene un nivel de alucinacion no despreciable y requiere validacion en produccion.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; al entrenarse sobre datos web multimodales, es probable la presencia de sesgos demograficos, culturales y linguisticos no cuantificados.
- Cobertura linguistica desigual: aunque soporta mas de 30 idiomas, la conversacion de voz en tiempo real solo esta documentada para ingles y chino; el resto de idiomas no tiene garantia de calidad en voz.
- Longitud de contexto no publicada: no es posible planificar escenarios de contexto largo con datos concretos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los componentes subyacentes (Qwen3-8B, Whisper-medium, CosyVoice2, SigLip2) por posibles obligaciones adicionales.
- Dependencia de hardware Nvidia para maxima precision: el autor recomienda PyTorch con GPU Nvidia para el 100% de precision; otras rutas (llama.cpp, Ollama, ONNX) pueden degradar calidad.
- Funcionalidad full-duplex y proactiva ligada a la implementacion de streaming: su comportamiento fuera de ese pipeline puede diferir del documentado.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines de automatizacion que dependan de function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/MiniCPM-o-4_5
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM-o
- CookBook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo omni-modal: https://minicpmo45.modelbest.cn/
- Demo vision-lenguaje: http://211.93.21.133:18121/
- Technical Report: https://huggingface.co/papers/2604.27393
- Paper adicional (arxiv:2408.01800): https://arxiv.org/abs/2408.01800
- WeChat: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/wechat.md
- Discord: https://discord.gg/N2RnxGdJ
- Wiki MiniCPM (chino): https://openbmb.cn/docs/
- CaseBook audio: https://openbmb.github.io/minicpm-o-4_5/
- CaseBook omni full-duplex: https://openbmb.github.io/minicpm-o-4_5-omni/
- Imagen de arquitectura: https://raw.githubusercontent.com/OpenBMB/MiniCPM-o/main/assets/minicpm-o-45-framework.png

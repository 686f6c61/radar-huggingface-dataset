# carlosmemorandum/VoxCPM2

## Resumen

VoxCPM2 es un modelo de sintesis de voz (text-to-speech) de tipo diffusion autoregressive y sin tokenizer, desarrollado por OpenBMB (el repositorio analizado, `carlosmemorandum/VoxCPM2`, es una resubida de terceros de los pesos oficiales). Con 2.290.004.544 parametros (~2,29 B) y un backbone derivado de MiniCPM-4, resuelve la generacion de audio de alta fidelidad a 48 kHz en 30 idiomas sin necesidad de etiquetas de idioma en la entrada.

Su relevancia actual esta en tres frentes: cobertura multilingue amplia con un unico modelo, control creativo de la voz mediante descripciones en lenguaje natural (voice design) y clonacion de voz en varios niveles de fidelidad, todo bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones de licencia. Ademas, con un RTF de ~0,30 en una RTX 4090 y ~8 GB de VRAM en bfloat16, es desplegable en hardware de consumo, y su integracion con Nano-VLLM baja el RTF hasta ~0,13.

El modelo esta entrenado sobre mas de 2 millones de horas de voz multilingue y soporta streaming en tiempo real, lo que lo situa como una alternativa abierta a sistemas TTS propietarios en escenarios de doblaje, asistentes de voz y generacion de datos sinteticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer-free Diffusion Autoregressive (LocEnc → TSLM → RALM → LocDiT); backbone basado en MiniCPM-4 |
| Parametros totales | 2.290.004.544 (~2,29 B), segun safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (ritmo de tokens de lenguaje de 6,25 Hz) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en bfloat16. No se documentan variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | 30 idiomas: arabe, birmano, chino, danes, neerlandes, ingles, finlandes, frances, aleman, griego, hebreo, hindi, indonesio, italiano, japones, jemer, coreano, lao, malayo, noruego, polaco, portugues, ruso, espanol, suajili, sueco, tagalo, tailandes, turco y vietnamita. Ademas, dialectos del chino: sichuanes, cantones, wu, del noreste, henan, shaanxi, shandong, tianjin y minnan |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16); tamano del repositorio 5,0 GB |

## Arquitectura y entrenamiento

VoxCPM2 es un modelo diffusion autoregressive sin tokenizer. La cadena declarada por el autor es LocEnc → TSLM → RALM → LocDiT, con un backbone derivado de MiniCPM-4 de 2B parametros. En lugar de discretizar el audio con un tokenizer neural convencional, el modelo opera a un ritmo de 6,25 tokens de lenguaje por segundo de audio y utiliza un modulo de difusion para generar la representacion acustica. El decodificador de audio es AudioVAE V2, con codificacion y decodificacion asimetricas: acepta referencias de 16 kHz y produce salida a 48 kHz mediante superresolucion integrada, sin necesidad de un upsampler externo. La longitud maxima de secuencia es de 8192 tokens y el dtype de referencia es bfloat16.

El entrenamiento se realizo sobre mas de 2 millones de horas de voz multilingue, segun la model card. No se especifica en la informacion disponible la composicion exacta del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de alineamiento como RLHF o DPO. Entre las innovaciones destacadas estan la sintesis consciente del contexto (el modelo infiere prosodia y expresividad a partir del texto), el streaming en tiempo real y el soporte de tres modos de condicionamiento de voz: voice design a partir de una descripcion textual, clonacion controlable con estilo y clonacion de maxima fidelidad con audio de referencia mas su transcripcion.

## Capacidades

- Sintesis de voz multilingue en 30 idiomas sin etiqueta de idioma: basta con introducir el texto en el idioma deseado.
- Voice design: generacion de una voz nueva a partir de una descripcion en lenguaje natural (genero, edad, tono, emocion, ritmo), sin audio de referencia.
- Clonacion controlable: clonacion de timbre desde un clip corto, con guia de estilo opcional para modular emocion, velocidad y expresion.
- Clonacion de maxima fidelidad (ultimate cloning): acepta audio de referencia y su transcripcion exacta para clonacion por continuacion de audio, reproduciendo matices vocales.
- Salida de audio a 48 kHz con superresolucion integrada en AudioVAE V2, partiendo de referencias de 16 kHz.
- Sintesis consciente del contexto, con inferencia automatica de prosodia y expresividad segun el contenido del texto.
- Streaming en tiempo real, con generacion por fragmentos mediante `generate_streaming`.
- Soporte de dialectos del chino (nueve variantes regionales).
- Control de inferencia mediante parametros como `cfg_value` e `inference_timesteps`.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo de sintesis de voz, no un modelo de lenguaje conversacional.
- No se documentan capacidades de vision ni de audio de entrada mas alla del audio de referencia para clonacion.

## Casos de uso

- Doblaje y localizacion de video: un mismo modelo cubre 30 idiomas sin cambiar de checkpoint, lo que simplifica pipelines de localizacion de contenido audiovisual donde antes se encadenaban varios sistemas TTS por idioma.
- Audiolibros y narracion larga: la ventana de 8192 tokens a 6,25 Hz permite generar pasajes extensos de forma coherente y mantener prosodia uniforme entre fragmentos, con salida a 48 kHz apta para publicacion.
- Atencion al cliente automatizada: la clonacion controlable permite mantener el timbre de una marca o de un locutor corporativo en respuestas de IVR y asistentes de voz, con streaming en tiempo real (RTF ~0,30) para reducir la latencia percibida.
- Accesibilidad: lectura en voz alta de documentos, interfaces y contenido web para personas con discapacidad visual, con soporte de 30 idiomas y dialectos del chino para cubrir comunidades linguisticas mas amplias.
- Voice design para videojuegos y animacion: generar voces de personajes a partir de una descripcion textual evita la necesidad de contratar y grabar locutores para cada perfil en fases de prototipado.
- Generacion de datos sinteticos de audio: producir corpus etiquetados en idiomas con pocos recursos (birmano, jemer, lao, suajili) para entrenar o evaluar sistemas de reconocimiento automatico del habla, usando la clonacion de maxima fidelidad para variar timbres.
- E-learning y cursos narrados: sintesis consciente del contexto para adaptar la entonacion a contenidos tecnicos, expositivos o divulgativos, con la posibilidad de clonar la voz del instructor original.
- Agentes conversacionales en produccion: gracias al modo streaming y a la integracion con Nano-VLLM (RTF ~0,13), el modelo se puede insertar en bucles de dialogo de baja latencia encadenados a un LLM y a un ASR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card indica que VoxCPM2 alcanza resultados estado del arte o competitivos en benchmarks de TTS zero-shot y controlable, y remite al repositorio de GitHub para las tablas completas, pero no incluye cifras en el material analizado.

| Suite de evaluacion referenciada | Resultados |
|---|---|
| Seed-TTS-eval | no disponible en la informacion proporcionada |
| CV3-eval | no disponible en la informacion proporcionada |
| InstructTTSEval | no disponible en la informacion proporcionada |
| MiniMax Multilingual Test | no disponible en la informacion proporcionada |

Unica metrica de rendimiento publicada en la model card:

| Metrica | Valor |
|---|---|
| RTF en NVIDIA RTX 4090 (estandar) | ~0,30 |
| RTF en NVIDIA RTX 4090 con Nano-VLLM | ~0,13 |

## Requisitos de hardware

- VRAM estimada para inferencia: ~8 GB segun la model card, con pesos en bfloat16 (~2,29 B de parametros). Es una cifra orientativa: la VRAM real depende de la longitud del texto, del audio de referencia y de si se activa el denoiser.
- GPU recomendadas: NVIDIA RTX 4090 (referencia de la medicion de RTF), y por VRAM tambien A100, H100, L40S o A10G en entornos de servidor.
- Compatibilidad con GPU de consumo: si, cabe en GPU de consumo con al menos 8-12 GB de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. No se documentan resultados en GPUs de menos de 8 GB.
- Requisitos de software: Python >= 3.10, PyTorch >= 2.5.0 y CUDA >= 12.0. La instalacion se realiza con `pip install voxcpm`, y el modelo se carga mediante `VoxCPM.from_pretrained`.
- Opciones de despliegue: libreria `voxcpm` (oficial), integracion acelerada con Nano-VLLM (`a710128/nanovllm-voxcpm`) y demo alojada en HuggingFace Spaces. No se documentan soportes oficiales para llama.cpp, Ollama, TGI, vLLM estandar ni formatos GGUF.
- Latencia y throughput: RTF ~0,30 en RTX 4090 con el pipeline estandar y ~0,13 con Nano-VLLM, es decir, entre 3 y 7 veces mas rapido que el tiempo real. El modo streaming permite emitir audio por fragmentos antes de completar la sintesis.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Salida de audio | Licencia | Notas |
|---|---|---|---|---|---|
| VoxCPM2 | ~2,29 B | 30 + 9 dialectos del chino | 48 kHz | Apache-2.0 | Diffusion autoregressive sin tokenizer; clonacion, voice design y streaming |
| XTTS v2 (Coqui) | ~467 M | 17 | 24 kHz | Coqui Public Model License (uso comercial restringido) | Clonacion zero-shot con audio de referencia |
| F5-TTS | ~336 M | Enfocado en ingles y chino | 24 kHz | CC-BY-NC 4.0 en los checkpoints base | Flow matching; clonacion zero-shot |
| CosyVoice 2 | ~0,5 B | Chino, ingles, japones, coreano y dialectos chinos | 24 kHz | Apache-2.0 | TTS con control de instrucciones y streaming |

Nota: los datos de los modelos comparados proceden de sus fichas publicas y pueden variar entre versiones o checkpoints. No se dispone de comparativas de rendimiento (WER, SIM-o, CMOS) entre VoxCPM2 y estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Clonacion de voz y suplantacion: la capacidad de clonar timbres con pocos segundos de referencia abre la puerta a deepfakes y suplantacion de identidad. Es responsabilidad del usuario obtener consentimiento explicito de la persona cuya voz se clona y cumplir la normativa aplicable.
- Alucinacion acustica: como todo modelo generativo, puede producir artefactos, prosodia incorrecta, pausas anomalas o pronunciaciones erroneas, especialmente en idiomas con menos presencia en el corpus (birmano, jemer, lao) y en textos con nombres propios, siglas o codigo mezclado.
- Limite de secuencia: la ventana de 8192 tokens a 6,25 Hz equivale teoricamente a unos 1310 segundos (~22 minutos) de audio, pero en la practica parte de esa ventana se consume con el audio de referencia y el texto de prompt, por lo que la duracion efectiva por pasada es menor. Para contenido largo hay que trocear y gestionar la coherencia entre fragmentos.
- Reproducibilidad de la fuente: el repositorio analizado (`carlosmemorandum/VoxCPM2`) es una resubida de terceros con 0 descargas y 0 likes; los pesos y la documentacion de referencia pertenecen a OpenBMB. Para produccion conviene usar el repositorio oficial.
- Dependencia de hardware NVIDIA: la libreria requiere CUDA >= 12.0; no se documenta soporte oficial para CPU, Apple Silicon ni ROCm.
- Ausencia de cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ documentados, lo que limita el despliegue en entornos con poca VRAM o en CPU.
- Licencia: Apache-2.0 permite uso comercial sin regalias, pero no exime del cumplimiento de normativas de proteccion de datos, derechos de imagen y voz, ni de la legislacion sobre contenidos generados por IA.
- Idiomas sin garantia de calidad homogenea: aunque se listan 30 idiomas, la model card no aporta metricas por idioma, por lo que el rendimiento en lenguas de bajos recursos no esta verificado.
- No es un modelo de lenguaje: no mantiene conversaciones, no razona y no ejecuta herramientas. Debe combinarse con un LLM externo en arquitecturas de agente.

## Enlaces

- Ficha de HuggingFace analizada: https://huggingface.co/carlosmemorandum/VoxCPM2
- Repositorio oficial en GitHub: https://github.com/OpenBMB/VoxCPM
- Documentacion: https://voxcpm.readthedocs.io/en/latest/
- Guia de inicio rapido: https://voxcpm.readthedocs.io/en/latest/quickstart.html
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo
- Pagina de muestras de audio: https://openbmb.github.io/voxcpm2-demopage
- Integracion con Nano-VLLM: https://github.com/a710128/nanovllm-voxcpm
- Paper (arXiv): https://arxiv.org/abs/2509.24650
- Discord: https://discord.gg/KZUx7tVNwz
- Wiki de MiniCPM: https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D

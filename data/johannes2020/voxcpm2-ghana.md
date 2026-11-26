# Johannes2020/voxcpm2-ghana

## Resumen

VoxCPM2 es un modelo de síntesis de voz (text-to-speech) de tipo difusión autoregresiva sin tokenizador, desarrollado por OpenBMB y distribuido en el repositorio `Johannes2020/voxcpm2-ghana` como una variante del modelo base. Con 2.290.004.544 parámetros (~2,3B) y un backbone derivado de MiniCPM-4, el modelo genera audio a 48 kHz a partir de texto en 30 idiomas sin necesidad de etiqueta de idioma explícita. Su pipeline es `text-to-speech` y la librería de referencia es `voxcpm`.

La propuesta diferencial frente a TTS clásicos es triple: diseño de voz a partir de una descripción en lenguaje natural (sin audio de referencia), clonación controlable con guía de estilo (emoción, ritmo, expresión) y clonación de alta fidelidad con audio y transcripción de referencia. Todo ello con salida de 48 kHz obtenida mediante superresolución interna del AudioVAE V2, aceptando referencias de 16 kHz.

Es relevante ahora porque combina licencia Apache-2.0 (uso comercial libre), un tamaño que cabe en GPUs de consumo (~8 GB de VRAM en bfloat16) y streaming en tiempo real con RTF de ~0,30 en una RTX 4090, reducible a ~0,13 con Nano-VLLM. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicación reciente y poco validada por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión autoregresiva sin tokenizador (LocEnc → TSLM → RALM → LocDiT), backbone basado en MiniCPM-4 |
| Parametros totales | 2.290.004.544 (~2,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens de secuencia máxima (tasa de tokens del LM: 6,25 Hz) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el repo no documenta GGUF ni cuantizaciones alternativas) |
| Idiomas soportados | 30: árabe, birmano, chino, danés, neerlandés, inglés, finés, francés, alemán, griego, hebreo, hindi, indonesio, italiano, japonés, jemer, coreano, lao, malayo, noruego, polaco, portugués, ruso, español, suajili, sueco, tagalo, tailandés, turco y vietnamita; más dialectos chinos (sichuanés, cantonés, wu, dongbei, henan, shaanxi, shandong, tianjin, minnan) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de salida | 48 kHz (entrada de referencia a 16 kHz, superresolución interna) |
| dtype | bfloat16 |
| VRAM estimada | ~8 GB |
| RTF (RTX 4090) | ~0,30 estándar / ~0,13 con Nano-VLLM |
| Tamaño del repositorio | 5,0 GB |
| Requisitos de software | Python ≥ 3.10, PyTorch ≥ 2.5.0, CUDA ≥ 12.0 |

## Arquitectura y entrenamiento

VoxCPM2 es un modelo de difusión autoregresiva sin tokenizador organizado en cuatro etapas: LocEnc (codificador local), TSLM (modelo de lenguaje de texto), RALM (modelo de lenguaje de audio) y LocDiT (transformador de difusión local). El backbone se basa en MiniCPM-4 y suma 2B parámetros. El componente de audio es AudioVAE V2, un VAE con codificación y decodificación asimétricas que acepta audio de referencia a 16 kHz y produce salida a 48 kHz mediante superresolución integrada, sin necesidad de un upsampler externo. El modelo de lenguaje opera a una tasa de 6,25 Hz y admite secuencias de hasta 8192 tokens.

El entrenamiento se realizó sobre más de 2 millones de horas de audio multilingüe, según la model card. No se detalla en la información disponible la composición exacta del dataset, el número de tokens de texto ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa; la aceleración reportada proviene de Nano-VLLM (RTF ~0,13 en RTX 4090). La model card menciona soporte de fine-tuning completo (SFT), aunque el texto proporcionado queda truncado en ese punto.

## Capacidades

- Síntesis de voz multilingüe en 30 idiomas sin etiqueta de idioma explícita; el texto de entrada determina el idioma.
- Diseño de voz (voice design) a partir de una descripción en lenguaje natural entre paréntesis al inicio del texto: género, edad, tono, emoción y ritmo, sin audio de referencia.
- Clonación de voz básica desde un clip corto de referencia.
- Clonación controlable: clonación con guía de estilo (emoción, velocidad, expresión) preservando el timbre.
- Clonación de máxima fidelidad (ultimate cloning): audio de referencia más su transcripción, con modo de continuación de audio para reproducir matices vocales.
- Salida de audio a 48 kHz de calidad de estudio con superresolución interna desde referencias de 16 kHz.
- Síntesis sensible al contexto: infiere prosodia y expresividad a partir del contenido del texto.
- Streaming en tiempo real mediante `generate_streaming`, con RTF bajo en GPUs modernas.
- Control de generación mediante `cfg_value` e `inference_timesteps`.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada más allá de las referencias de voz.

## Casos de uso

- Audiolibros y narración automatizada: el modelo infiere prosodia y expresividad del texto y genera audio a 48 kHz, adecuado para producción editorial sin postprocesado de muestreo.
- Doblaje y localización multilingüe: con 30 idiomas y clonación controlable, se puede mantener el timbre de un actor mientras se ajusta emoción y ritmo por idioma.
- Asistentes de voz en tiempo real: el streaming con RTF ~0,30 en RTX 4090 (~0,13 con Nano-VLLM) permite respuestas habladas de baja latencia en atención al cliente o interfaces conversacionales.
- Creación de voces sintéticas para videojuegos y medios: el diseño de voz por descripción natural permite generar personajes nuevos sin grabaciones de referencia.
- Accesibilidad y lectura de contenido: conversión de artículos, documentación o interfaces a voz en español y otros idiomas, con contexto de hasta 8192 tokens para pasajes largos.
- Prototipado de productos de voz: al requerir ~8 GB de VRAM y licencia Apache-2.0, es viable iterar en una sola GPU de consumo y desplegar comercialmente sin coste de licencia.
- Clonación de alta fidelidad para preservación de voz: con audio y transcripción de referencia, se pueden recrear matices vocales para archivos o contenido personalizado, sujeto a consentimiento.

## Benchmarks y rendimiento

La model card indica que VoxCPM2 alcanza resultados state-of-the-art o competitivos en benchmarks de TTS zero-shot y controlable (Seed-TTS-eval, CV3-eval, InstructTTSEval y MiniMax Multilingual Test), pero remite las tablas completas al repositorio de GitHub, que no forma parte de la información proporcionada.

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~8 GB en bfloat16 para inferencia estándar.
- GPU recomendadas: NVIDIA RTX 4090 (RTF ~0,30; ~0,13 con Nano-VLLM), así como A100/H100 para despliegues de mayor concurrencia (no se documentan cifras específicas para estas).
- GPU de consumo: sí, cabe en tarjetas con 8 GB o más de VRAM; no se confirma funcionamiento en GPUs de gama baja con menos memoria.
- Software: Python ≥ 3.10, PyTorch ≥ 2.5.0, CUDA ≥ 12.0, paquete `voxcpm`.
- Opciones de despliegue: librería oficial `voxcpm`, streaming nativo y aceleración con Nano-VLLM. No se documentan integraciones con vLLM estándar, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF ~0,30 en RTX 4090 en modo estándar y ~0,13 con Nano-VLLM; no se proporcionan cifras de throughput en peticiones concurrentes.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de parámetros, contexto, benchmarks ni licencia de modelos TTS alternativos (por ejemplo, XTTS-v2, Bark o F5-TTS) que permitan una comparación rigurosa. Se indica a continuación lo que sí es comparable a nivel de especificación del propio modelo:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoxCPM2 (esta ficha) | ~2,3B | 8192 tokens | 30 | Apache-2.0 | Hugging Face, repo de 5,0 GB |
| Alternativas TTS de referencia | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Repositorio con 0 descargas y 0 likes: no hay validación de la comunidad ni evidencia de calidad en producción para esta variante concreta.
- La model card no documenta sesgos por idioma, género o acento; el entrenamiento con 2M+ horas de audio multilingüe puede heredar desequilibrios del corpus.
- Riesgo de alucinación acústica: en TTS, puede producirse pronunciación incorrecta, prosodia anómala o artefactos en textos atípicos, nombres propios o secuencias numéricas.
- La clonación de voz plantea riesgos de suplantación; es necesario consentimiento explícito y cumplimiento normativo (por ejemplo, RGPD y normativa sobre deepfakes).
- Cobertura desigual entre los 30 idiomas: no se detalla el volumen de datos por idioma, por lo que la calidad en idiomas de bajos recursos puede ser inferior.
- Límite de secuencia de 8192 tokens del LM a 6,25 Hz; textos muy largos requieren segmentación.
- No se documentan cuantizaciones (GGUF, int8, etc.), lo que limita el despliegue en hardware con menos de ~8 GB de VRAM.
- El fine-tuning SFT se menciona pero el texto de la model card está truncado; no se confirma la disponibilidad de scripts.
- Licencia Apache-2.0 permite uso comercial, pero no exime del cumplimiento de la normativa sobre síntesis de voz y derechos de imagen.

## Enlaces

- Hugging Face: https://huggingface.co/Johannes2020/voxcpm2-ghana
- Repositorio GitHub: https://github.com/OpenBMB/VoxCPM
- Documentación: https://voxcpm.readthedocs.io/en/latest/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo
- Muestras de audio: https://openbmb.github.io/voxcpm2-demopage
- Discord: https://discord.gg/KZUx7tVNwz
- Wiki de MiniCPM: https://openbmb.cn/docs/
- Nano-VLLM para VoxCPM: https://github.com/a710128/nanovllm-voxcpm
- Paper (arXiv): https://arxiv.org/abs/2509.24650

# openbmb/VoxCPM2

## Resumen

VoxCPM2 es un modelo de texto a voz (TTS) desarrollado por OpenBMB, el equipo detrás de la familia MiniCPM. Se trata de un sistema de síntesis de voz multilingüe de 2.290 millones de parámetros que emplea una arquitectura de difusión autorregresiva sin tokenizador, construida sobre un backbone derivado de MiniCPM-4. El modelo resuelve tres problemas clásicos del TTS neuronal —la dependencia de tokenizadores discretos, la limitación de idiomas y la falta de control expresivo— combinando generación continua por difusión con un códec de audio asimétrico propio.

Su relevancia actual radica en tres factores: cobertura de 30 idiomas sin etiqueta de idioma explícita (más diez dialectos del chino), salida a 48 kHz con superresolución integrada en el propio VAE de audio, y licencia Apache-2.0 sin restricciones comerciales. A esto se suma un RTF de aproximadamente 0,30 en una RTX 4090 y de aproximadamente 0,13 con aceleración mediante Nano-vLLM, lo que lo sitúa en el terreno de la síntesis en tiempo real sobre hardware de consumo.

El modelo se distribuye con más de 976.000 descargas y 1.803 likes en Hugging Face, con pesos en safetensors y un repositorio de 9,5 GB. Está entrenado sobre más de 2 millones de horas de audio multilingüe y admite clonación de voz, diseño de voz por descripción en lenguaje natural y streaming.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión autorregresiva sin tokenizador (LocEnc → TSLM → RALM → LocDiT), backbone basado en MiniCPM-4 |
| Parámetros totales | 2.290.004.544 (aproximadamente 2B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens de secuencia del modelo de lenguaje |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | 30: árabe, birmano, chino, danés, neerlandés, inglés, finlandés, francés, alemán, griego, hebreo, hindi, indonesio, italiano, japonés, jemer, coreano, lao, malayo, noruego, polaco, portugués, ruso, español, suajili, sueco, tagalo, tailandés, turco, vietnamita; más diez dialectos del chino (sichuanés, cantonés, wu, dongbei, henanés, shaanxi, shandong, tianjin, minnan) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `voxcpm`) |
| Frecuencia de muestreo de salida | 48 kHz (entrada de referencia a 16 kHz) |
| Códec de audio | AudioVAE V2 (codificación/decodificación asimétrica) |
| Tasa de tokens del LM | 6,25 Hz |
| Precisión de pesos | bfloat16 |
| VRAM estimada | aproximadamente 8 GB |
| RTF (RTX 4090) | aproximadamente 0,30 estándar; aproximadamente 0,13 con Nano-vLLM |
| Datos de entrenamiento | más de 2 millones de horas de voz multilingüe |

## Arquitectura y entrenamiento

VoxCPM2 abandona el esquema habitual de TTS en dos etapas con tokenizador discreto. En su lugar emplea un pipeline de cuatro componentes: un codificador local (LocEnc), un modelo de lenguaje de secuencia temporal (TSLM), un modelo autorregresivo local (RALM) y un decodificador de difusión local (LocDiT). El backbone del modelo de lenguaje deriva de MiniCPM-4, con 2B parámetros totales y una tasa de emisión de 6,25 tokens por segundo, lo que se traduce en una secuencia latente compacta que el decodificador de difusión convierte en audio continuo.

El componente diferencial es AudioVAE V2, un VAE de audio con codificación y decodificación asimétricas: acepta audio de referencia a 16 kHz y genera salida a 48 kHz mediante superresolución integrada, sin necesidad de un upsampler externo. Esto permite clonar voces a partir de grabaciones de baja calidad y producir audio de calidad de estudio. El entrenamiento se realizó sobre más de 2 millones de horas de voz multilingüe; la model card no detalla la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. El modelo soporta ajuste fino supervisado completo (SFT), según indica la documentación del autor.

## Capacidades

- Síntesis de voz multilingüe en 30 idiomas sin necesidad de etiqueta de idioma: el texto de entrada se procesa directamente en el idioma detectado.
- Soporte de diez dialectos del chino (sichuanés, cantonés, wu, dongbei, henanés, shaanxi, shandong, tianjin, minnan).
- Diseño de voz (voice design): generación de una voz nueva a partir de una descripción en lenguaje natural entre paréntesis al inicio del texto (género, edad, tono, emoción, velocidad), sin audio de referencia.
- Clonación de voz básica a partir de un clip corto de referencia.
- Clonación controlable: la clonación admite guía de estilo opcional (emoción, ritmo, expresión) preservando el timbre original.
- Clonación de máxima fidelidad (ultimate cloning): requiere audio de referencia y su transcripción exacta, con reproducción fiel de matices vocales.
- Síntesis consciente del contexto: infiere prosodia y expresividad a partir del contenido del texto.
- Streaming en tiempo real mediante `generate_streaming`, con concatenación de fragmentos de audio.
- Salida a 48 kHz con superresolución integrada desde referencias de 16 kHz.
- Ajuste fino supervisado completo sobre datos propios.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso ni procesamiento de visión o audio de entrada más allá de la referencia de voz.

## Casos de uso

- Audiolibros y narración automatizada: el modelo infiere prosodia y expresividad del propio texto y permite dirigir el estilo mediante descripciones entre paréntesis, lo que facilita generar capítulos completos con voces consistentes y cambios de tono según el contenido narrativo.
- Doblaje y localización de vídeo a 30 idiomas: con salida a 48 kHz y clonación controlable, se puede preservar el timbre del actor original mientras se cambia el idioma, manteniendo emoción y ritmo mediante guía de estilo.
- Asistentes de voz en tiempo real: el RTF de aproximadamente 0,30 en RTX 4090 y de aproximadamente 0,13 con Nano-vLLM, junto con la API de streaming, permiten alimentar pipelines de conversación por voz con latencia compatible con interacción natural.
- Atención al cliente telefónica automatizada: la ventana de 8.192 tokens del modelo de lenguaje y la síntesis multilingüe sin etiqueta permiten gestionar conversaciones multi-turno en varios idiomas con una única instancia.
- Accesibilidad y lectura de pantalla: la salida a 48 kHz y la clonación de voz permiten generar lectores personalizados que reproducen la voz del propio usuario o de un familiar a partir de un clip corto.
- Creación de contenido y podcasting: el diseño de voz por descripción permite generar voces nuevas sin material de referencia, útil para prototipado rápido de personajes o locuciones publicitarias.
- Preservación de patrimonio lingüístico: la cobertura de idiomas de bajos recursos como birmano, jemer, lao, suajili o tagalo, junto con la licencia Apache-2.0, facilita la creación de corpus y herramientas de síntesis para comunidades con poca representación tecnológica.
- Integración en pipelines de CI/CD para generación de avisos y resúmenes hablados: el modelo se puede invocar desde Python con `voxcpm` y desplegarse en SageMaker, lo que permite automatizar la producción de audio en flujos de integración.

## Benchmarks y rendimiento

La model card indica que VoxCPM2 alcanza resultados de estado del arte o competitivos en las principales evaluaciones de TTS zero-shot y controlable, y remite a las tablas completas del repositorio de GitHub (Seed-TTS-eval, CV3-eval, InstructTTSEval, MiniMax Multilingual Test). Los valores numéricos concretos no están incluidos en la información proporcionada.

| Benchmark | Resultado |
|---|---|
| Seed-TTS-eval | no disponible en la información proporcionada |
| CV3-eval | no disponible en la información proporcionada |
| InstructTTSEval | no disponible en la información proporcionada |
| MiniMax Multilingual Test | no disponible en la información proporcionada |
| RTF en RTX 4090 | aproximadamente 0,30 (estándar) / aproximadamente 0,13 (Nano-vLLM) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB según la model card, en bfloat16.
- GPU recomendadas: NVIDIA RTX 4090 para el RTF de referencia (aproximadamente 0,30); A100 o H100 para despliegues de mayor concurrencia; CUDA 12.0 o superior y PyTorch 2.5.0 o superior.
- Cabe en GPU de consumo: sí, con aproximadamente 8 GB de VRAM, lo que incluye tarjetas de gama alta de consumo como la RTX 4090 y modelos con 12 GB o más.
- Opciones de despliegue: librería `voxcpm` (instalación mediante `pip install voxcpm`), despliegue en Amazon SageMaker (etiqueta `deploy:sagemaker`), aceleración con Nano-VLLM (repositorio `a710128/nanovllm-voxcpm`), y la demo alojada en Hugging Face Spaces.
- Latencia y throughput: RTF de aproximadamente 0,30 en RTX 4090 con el runtime estándar y de aproximadamente 0,13 con Nano-VLLM, es decir, entre 3x y 7,7x más rápido que tiempo real en esa GPU.
- Requisitos de software: Python 3.10 o superior.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoxCPM2 | 2,29B | 30 (+10 dialectos del chino) | 48 kHz | Apache-2.0 | Hugging Face, GitHub, SageMaker |
| Alternativas de la misma categoría (TTS multilingüe zero-shot) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificables sobre modelos comparables de la misma categoría (parámetros, contexto, rendimiento, licencia y disponibilidad) que permitan establecer una comparación rigurosa. Se recomienda consultar las tablas comparativas del repositorio de GitHub del autor, que incluyen evaluaciones frente a otros sistemas en Seed-TTS-eval, CV3-eval, InstructTTSEval y MiniMax Multilingual Test.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo; al estar entrenado sobre más de 2 millones de horas de voz multilingüe, es probable que herede sesgos de acento, género y registro presentes en esos datos, pero no se cuantifican.
- Riesgo de alucinación en el sentido de prosodia o contenido no solicitado: no se documenta en la información disponible; en TTS el riesgo principal es la generación de artefactos o pronunciaciones incorrectas en textos ambiguos o fuera de distribución.
- La clonación de voz plantea riesgos de suplantación de identidad y uso fraudulento; aunque la licencia Apache-2.0 permite uso comercial, el despliegue en producción debería incorporar consentimiento explícito y mecanismos de verificación.
- Cobertura de idiomas limitada a los 30 listados; no se documenta el rendimiento por idioma ni la calidad relativa en idiomas de bajos recursos como birmano, jemer, lao o suajili.
- El contexto del modelo de lenguaje es de 8.192 tokens, lo que limita la longitud de texto sintetizable en una sola pasada; para textos largos será necesario segmentar.
- No se documentan en la información disponible los tipos de cuantización soportados; los pesos se publican en bfloat16, lo que condiciona el despliegue en hardware sin soporte nativo de esa precisión.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales conocidas, pero conviene revisar los términos de los datasets de entrenamiento, no detallados en la model card.
- El repositorio ocupa 9,5 GB, lo que exige espacio en disco y ancho de banda considerables para la descarga inicial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/VoxCPM2
- Repositorio GitHub: https://github.com/OpenBMB/VoxCPM
- Documentación: https://voxcpm.readthedocs.io/en/latest/
- Demo interactiva (Hugging Face Spaces): https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo
- Página de muestras de audio: https://openbmb.github.io/voxcpm2-demopage
- Discord: https://discord.gg/KZUx7tVNwz
- Wiki de MiniCPM: https://openbmb.cn/docs/
- Paper (arXiv): https://arxiv.org/abs/2509.24650
- Aceleración Nano-VLLM para VoxCPM: https://github.com/a710128/nanovllm-voxcpm

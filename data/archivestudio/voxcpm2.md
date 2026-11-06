# ArchiveStudio/VoxCPM2

## Resumen

VoxCPM2 es un modelo de síntesis de voz (text-to-speech) desarrollado por OpenBMB, distribuido en Hugging Face bajo el espacio ArchiveStudio. Se trata de un modelo de 2.290.004.544 parámetros (aproximadamente 2B) construido sobre el backbone MiniCPM-4, con una arquitectura de difusión autorregresiva sin tokenizador (tokenizer-free). Su objetivo es resolver la síntesis de voz multilingüe de alta calidad con clonación y diseño de voz controlables, sin necesidad de etiquetas de idioma en la entrada.

El modelo destaca por cubrir 30 idiomas (incluidos dialectos del chino), generar audio a 48 kHz a partir de referencias de 16 kHz mediante superresolución integrada en su AudioVAE V2, y ofrecer tres modos de control de voz: diseño de voz por descripción en lenguaje natural, clonación controlable con guía de estilo y clonación de máxima fidelidad con audio y transcripción de referencia. Está entrenado sobre más de 2 millones de horas de habla multilingüe.

Su relevancia actual radica en que combina licencia Apache-2.0 (uso comercial libre), un tamaño contenido de 2B parámetros que cabe en aproximadamente 8 GB de VRAM, y streaming en tiempo real con un RTF de ~0.30 en RTX 4090 (~0.13 con Nano-VLLM). Esto lo posiciona como una alternativa abierta y desplegable en hardware de consumo para aplicaciones de voz en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión autorregresiva sin tokenizador (LocEnc → TSLM → RALM → LocDiT); backbone MiniCPM-4 |
| Parametros totales | 2.290.004.544 (~2B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 8192 tokens (secuencia máxima del LM; tasa de tokens de 6,25 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 30 idiomas: árabe, birmano, chino, danés, neerlandés, inglés, finlandés, francés, alemán, griego, hebreo, hindi, indonesio, italiano, japonés, jemer, coreano, lao, malayo, noruego, polaco, portugués, ruso, español, suajili, sueco, tagalo, tailandés, turco y vietnamita; más dialectos del chino (sichuanés, cantonés, wu, dongbei, henanés, shaanxi, shandong, tianjinés, minnan) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería voxcpm); dtype bfloat16 |

## Arquitectura y entrenamiento

VoxCPM2 emplea una arquitectura de difusión autorregresiva sin tokenizador, organizada en cuatro componentes: LocEnc, TSLM (language model de texto), RALM (language model de audio) y LocDiT (difusión). El backbone está basado en MiniCPM-4 y suma 2B parámetros totales. El modelo opera con una tasa de tokens de lenguaje de 6,25 Hz y una longitud máxima de secuencia de 8192 tokens. La salida de audio se gestiona mediante AudioVAE V2, un VAE de audio con codificación y decodificación asimétricas que acepta referencias de 16 kHz y genera audio a 48 kHz mediante superresolución integrada, sin necesidad de un upsampler externo.

El entrenamiento se realizó sobre más de 2 millones de horas de habla multilingüe. La información disponible no detalla la composición exacta del dataset, el número de tokens de texto ni si se aplicaron etapas de RLHF o DPO. Entre las innovaciones técnicas destacables figuran la inferencia por difusión con un número configurable de pasos (`inference_timesteps`, por defecto 10), el classifier-free guidance (`cfg_value`, por defecto 2.0), la síntesis en streaming y la aceleración mediante Nano-VLLM, que reduce el RTF de ~0.30 a ~0.13 en una RTX 4090.

## Capacidades

- Síntesis de voz multilingüe en 30 idiomas sin necesidad de etiqueta de idioma en la entrada.
- Diseño de voz (voice design): generación de una voz nueva a partir de una descripción en lenguaje natural entre paréntesis (género, edad, tono, emoción, ritmo), sin audio de referencia.
- Clonación de voz controlable: clonación a partir de un clip corto con guía de estilo opcional para modular emoción, ritmo y expresión preservando el timbre.
- Clonación de máxima fidelidad (ultimate cloning): audio de referencia más su transcripción para clonación por continuación de audio, reproduciendo matices vocales.
- Salida de audio a 48 kHz de calidad de estudio con superresolución integrada desde referencias de 16 kHz.
- Síntesis consciente del contexto: infiere prosodia y expresividad a partir del contenido del texto.
- Streaming en tiempo real mediante `generate_streaming`.
- Soporte de dialectos del chino (sichuanés, cantonés, wu, dongbei, henanés, shaanxi, shandong, tianjinés, minnan).
- No se documenta soporte de tool calling, function calling, agentes ni multi-step reasoning (no aplica a un modelo TTS).

## Casos de uso

- Audiolibros y narración automatizada: el modelo sintetiza textos largos en 30 idiomas con prosodia inferida del contenido, y su contexto de 8192 tokens a 6,25 Hz permite tramos extensos sin cortes frecuentes.
- Atención al cliente con voz sintética: integrado en IVR o asistentes conversacionales, permite generar respuestas habladas en tiempo real gracias al streaming y a un RTF de ~0.30 en RTX 4090.
- Doblaje y localización de vídeo: la clonación controlable con guía de estilo permite mantener el timbre de un actor original mientras se ajusta emoción y ritmo en otro idioma.
- Creación de contenido y podcasting: el diseño de voz por descripción en lenguaje natural permite generar voces nuevas sin disponer de muestras de referencia.
- Accesibilidad y lectura de pantalla: síntesis de alta calidad a 48 kHz para lectores de pantalla y aplicaciones de asistencia a personas con discapacidad visual, con cobertura multilingüe amplia.
- Prototipado de asistentes de voz y videojuegos: la licencia Apache-2.0 y el tamaño de 2B permiten desplegar el modelo en infraestructura propia y experimentar con voces de personajes mediante voice design.
- Generación de voces para datos sintéticos: producción de corpus de audio multilingüe para entrenamiento de modelos ASR u otros sistemas de voz, con control de timbre y estilo.

## Benchmarks y rendimiento

La model card indica que VoxCPM2 alcanza resultados state-of-the-art o competitivos en los principales benchmarks de TTS zero-shot y controlable (Seed-TTS-eval, CV3-eval, InstructTTSEval, MiniMax Multilingual Test), pero remite las tablas completas al repositorio de GitHub y no incluye los valores numéricos en la información disponible.

| Benchmark | Resultado |
|---|---|
| Seed-TTS-eval | no disponible (remite al repositorio GitHub) |
| CV3-eval | no disponible (remite al repositorio GitHub) |
| InstructTTSEval | no disponible (remite al repositorio GitHub) |
| MiniMax Multilingual Test | no disponible (remite al repositorio GitHub) |
| RTF en RTX 4090 | ~0.30 estándar; ~0.13 con Nano-VLLM |

## Requisitos de hardware

- VRAM estimada para inferencia: ~8 GB según la model card.
- GPU recomendadas: NVIDIA RTX 4090 (RTF ~0.30, ~0.13 con Nano-VLLM); el modelo cabe en GPUs de consumo con al menos 8 GB de VRAM.
- Requisitos de software: Python ≥ 3.10, PyTorch ≥ 2.5.0, CUDA ≥ 12.0.
- Opciones de despliegue: librería `voxcpm` (`pip install voxcpm`), con soporte de aceleración mediante Nano-VLLM. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: RTF ~0.30 en RTX 4090 en modo estándar y ~0.13 con Nano-VLLM; soporte de streaming para reducir la latencia percibida.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos numéricos de modelos comparables (parámetros, contexto, benchmarks o licencia) que permitan una comparación rigurosa. Los benchmarks citados por el autor (Seed-TTS-eval, CV3-eval, InstructTTSEval, MiniMax Multilingual Test) son los marcos habituales de comparación en TTS, pero sus tablas no están incluidas en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| VoxCPM2 | ~2B | 8192 tokens (6,25 Hz) | Apache-2.0 | Hugging Face (ArchiveStudio/VoxCPM2) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documentan en la información disponible los sesgos conocidos del modelo; al entrenarse sobre más de 2 millones de horas de habla multilingüe, es previsible que herede sesgos de acento, género y registro del corpus, pero no se cuantifican.
- Riesgo de alucinación en el sentido de prosodia o pronunciación incorrecta en textos ambiguos, nombres propios o idiomas con menor representación en el corpus; no se aportan tasas de error.
- La cobertura de 30 idiomas no implica calidad homogénea; la model card no desglosa el rendimiento por idioma.
- El contexto máximo es de 8192 tokens a una tasa de 6,25 Hz, lo que limita la duración de audio por generación; para textos largos será necesario trocear.
- La clonación de voz plantea riesgos de suplantación de identidad y uso indebido; aunque la licencia Apache-2.0 permite uso comercial, el despliegue en producción debería incorporar consentimiento y controles de uso.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales documentadas, pero conviene verificar las condiciones del backbone MiniCPM-4 y de los datos de entrenamiento.
- El repositorio tiene 27 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-10-25); se trata de una publicación reciente sin validación comunitaria extensa.
- No se documentan tipos de cuantización soportados, lo que limita las opciones de despliegue en hardware con menos de 8 GB de VRAM.

## Enlaces

- Hugging Face: https://huggingface.co/ArchiveStudio/VoxCPM2
- GitHub: https://github.com/OpenBMB/VoxCPM
- Documentación: https://voxcpm.readthedocs.io/en/latest/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo
- Página de muestras de audio: https://openbmb.github.io/voxcpm2-demopage
- Discord: https://discord.gg/KZUx7tVNwz
- Nano-VLLM para VoxCPM: https://github.com/a710128/nanovllm-voxcpm
- Paper (arXiv): https://arxiv.org/abs/2509.24650

# Allinsama/openbmb__VoxCPM2

## Resumen

VoxCPM2 es un modelo de texto a voz (TTS) open source desarrollado por OpenBMB. Se presenta como un sistema tokenizer-free de difusión autoregresiva con 2,29 mil millones de parámetros (2B según el autor), backbone basado en MiniCPM-4 y salida de audio a 48 kHz. Está entrenado con más de 2 millones de horas de voz multilingüe y cubre 30 idiomas sin necesidad de etiqueta de idioma, además de varios dialectos chinos.

El modelo resuelve síntesis multilingüe, diseño de voz a partir de una descripción en lenguaje natural y clonación de voz zero-shot o controlable con audio de referencia. Incorpora streaming en tiempo real, con un RTF de ~0,30 en una RTX 4090 y ~0,13 con Nano-VLLM, y se distribuye con licencia Apache-2.0, lo que facilita su uso comercial. La ficha consultada es un espejo subido por Allinsama; el repositorio oficial es openbmb/VoxCPM2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS tokenizer-free de difusión autoregresiva (LocEnc → TSLM → RALM → LocDiT) |
| Parametros totales | 2.290.004.544 (2,29B; el autor indica 2B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens de LM de audio; tasa de 6,25 Hz (~21,8 minutos de audio como referencia) |
| Tipos de cuantizacion | no disponible; pesos en bfloat16 y no se documentan GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | 30 idiomas: arabe, birmano, chino (con dialectos sichuanés, cantonés, wu, nororiental, henanés, shaanxi, shandong, tianjin, hokkien/min nan), danés, neerlandés, inglés, finlandés, francés, alemán, griego, hebreo, hindi, indonesio, italiano, japonés, jemer, coreano, lao, malayo, noruego, polaco, portugués, ruso, español, suajili, sueco, tagalo, tailandés, turco y vietnamita |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |
| Backbone | MiniCPM-4 |
| Audio VAE | AudioVAE V2, codificación/decodificación asimétrica de 16 kHz a 48 kHz |
| Frecuencia de muestreo de salida | 48 kHz |
| VRAM indicada | ~8 GB |
| RTF en RTX 4090 | ~0,30 estándar; ~0,13 con Nano-VLLM |
| Tamaño del repositorio | 5,0 GB |
| Libreria | voxcpm |
| Pipeline | text-to-speech |
| Repositorio consultado | Allinsama/openbmb__VoxCPM2 (espejo; 8 descargas y 0 likes en la información disponible) |

## Arquitectura y entrenamiento

El model card describe una arquitectura de difusión autoregresiva sin tokenizador, organizada en las etapas LocEnc, TSLM, RALM y LocDiT, con un backbone basado en MiniCPM-4. El audio se modela mediante AudioVAE V2, que emplea una codificación y decodificación asimétrica: acepta referencias de audio a 16 kHz y genera salida a 48 kHz con superresolución integrada, sin necesidad de un upsampler externo. La tasa de tokens del LM es de 6,25 Hz y la secuencia máxima es de 8192 tokens.

El entrenamiento se realizó con más de 2 millones de horas de voz multilingüe. No se detalla en la información disponible la composición exacta del dataset, la proporción por idioma ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa; sí se mencionan el streaming y la aceleración mediante Nano-VLLM.

## Capacidades

- Síntesis de voz multilingüe en 30 idiomas sin etiqueta de idioma; incluye dialectos chinos.
- Diseño de voz a partir de una descripción en lenguaje natural: género, edad, tono, emoción y ritmo, sin audio de referencia.
- Clonación zero-shot de una voz con un clip corto de referencia.
- Clonación controlable: permite guiar emoción, ritmo y expresión manteniendo el timbre de la referencia.
- Ultimate cloning: clonación por continuación de audio usando audio de referencia y su transcripción para máxima fidelidad.
- Salida de audio a 48 kHz a partir de referencias de 16 kHz mediante AudioVAE V2.
- Síntesis consciente del contexto: infiere prosodia y expresividad a partir del texto.
- Streaming en tiempo real y despliegue mediante vLLM-Omni con API compatible con OpenAI `/v1/audio/speech`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, matemáticas ni reconocimiento automático de voz. No es un LLM conversacional de propósito general.

## Casos de uso

- Audiolibros y narración multilingüe: generar capítulos en cualquiera de los 30 idiomas con una voz diseñada para el narrador, salida a 48 kHz y prosodia contextual. Para textos largos conviene dividir en fragmentos compatibles con los 8192 tokens de LM o usar streaming.
- Localización y doblaje: clonar el timbre de un actor con un clip de referencia y aplicar guía de estilo para emoción o ritmo; el modo ultimate cloning con transcripción mejora la fidelidad. Requiere derechos sobre la voz y consentimiento explícito.
- Asistentes de voz y atención al cliente: generar respuestas con una voz de marca diseñada y baja latencia mediante streaming; el RTF de ~0,30 en RTX 4090 permite integrarlo en un componente de síntesis dentro de un pipeline mayor. La lógica conversacional y el diálogo deben gestionarse en otro componente.
- Accesibilidad y lectura de pantalla: convertir documentos y páginas web a voz en 30 idiomas, con streaming para reducir la latencia y salida a 48 kHz. Los textos extensos deben trocearse por el límite de secuencia.
- Creación de contenido y podcasts: diseñar voces de personajes mediante descripciones en lenguaje natural, controlar el estilo de interpretación y generar audio de calidad de estudio para producción.
- Videojuegos y narración interactiva: generar voces de NPCs con voice design y streaming; el RTF bajo en GPU permite síntesis casi en tiempo real para diálogos dinámicos en varios idiomas.
- Prototipado y pruebas A/B de voces: crear variantes de voz sin audio de referencia y comparar percepciones de usuario; la API compatible con OpenAI facilita la integración en herramientas internas.
- Preservación de voz autorizada: usar ultimate cloning con audio y transcripción para narraciones de archivo o contenidos donde se quiera conservar el timbre original, siempre con consentimiento y base legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El model card afirma resultados estado del arte o competitivos en Seed-TTS-eval, CV3-eval, InstructTTSEval y MiniMax Multilingual Test, pero remite al repositorio de GitHub para las tablas completas y no incluye las cifras en la información proporcionada.

| Métrica de inferencia | Valor |
|---|---|
| RTF en RTX 4090, configuración estándar | ~0,30 |
| RTF en RTX 4090 con Nano-VLLM | ~0,13 |
| Frecuencia de muestreo de salida | 48 kHz |
| VRAM indicada por el autor | ~8 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: ~8 GB según el model card, con pesos en bfloat16.
- GPU con medición publicada: NVIDIA RTX 4090, con RTF ~0,30 estándar y ~0,13 con Nano-VLLM.
- No hay datos de latencia o throughput para A100, H100 u otras GPU en la información disponible.
- Cabe en GPU consumer con 8 GB de VRAM o más según la VRAM indicada; la única GPU con RTF publicado es la RTX 4090.
- Requisitos de software: Python ≥3.10, PyTorch ≥2.5.0 y CUDA ≥12.0; instalación mediante `pip install voxcpm`.
- Opciones de despliegue documentadas: librería `voxcpm`, streaming, vLLM-Omni con API compatible con OpenAI y Nano-VLLM.
- No se documentan en la información disponible opciones como llama.cpp, Ollama o TGI, ni cuantizaciones GGUF.
- Latencia: un RTF de ~0,30 implica unas 3,3 veces más rápido que tiempo real en RTX 4090; ~0,13 implica unas 7,7 veces más rápido con Nano-VLLM. Son valores aproximados.
- No hay datos de VRAM para entrenamiento o fine-tuning; la sección de fine-tuning del model card aparece truncada.

## Comparativa con modelos similares

No se proporcionan datos verificables de modelos alternativos en la información disponible. Para no inventar cifras, la comparativa se limita a los datos del propio VoxCPM2.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| VoxCPM2 | 2,29B | 8192 tokens de LM de audio | Apache-2.0 | HuggingFace, GitHub y vLLM-Omni |
| Alternativas comparables (2-3) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No hay cifras de benchmarks en la información disponible; la afirmación de resultados estado del arte no es verificable con los datos proporcionados.
- La calidad por idioma no está documentada; disponer de 30 idiomas y varios dialectos chinos no implica un rendimiento homogéneo en todos ellos.
- Riesgo de pronunciación incorrecta, prosodia inadecuada o artefactos acústicos en textos ambiguos, nombres propios, siglas o idiomas de bajos recursos; no está cuantificado en la información disponible.
- La clonación de voz puede facilitar deepfakes y suplantación de identidad. Es necesario obtener consentimiento, respetar derechos de autor y cumplir la normativa aplicable sobre datos biométricos.
- La licencia Apache-2.0 permite el uso comercial del modelo, pero no concede derechos sobre las voces de referencia ni sobre los datos de entrenamiento.
- El límite de 8192 tokens de LM obliga a trocear textos largos o usar streaming; no equivale a una ventana de contexto de un LLM de texto.
- No se documentan cuantizaciones ni despliegue en CPU; el rendimiento fuera de la RTX 4090 no está cuantificado.
- El repositorio consultado es un espejo con 8 descargas y 0 likes; para la versión mantenida y la documentación actualizada conviene usar el repositorio oficial openbmb/VoxCPM2.
- No es un modelo de lenguaje general: no ofrece tool calling, agentes, visión, matemáticas ni ASR.

## Enlaces

- Repositorio consultado (espejo): https://huggingface.co/Allinsama/openbmb__VoxCPM2
- Repositorio oficial: https://huggingface.co/openbmb/VoxCPM2
- GitHub: https://github.com/OpenBMB/VoxCPM
- Documentación: https://voxcpm.readthedocs.io/en/latest/
- Demo: https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo
- Muestras de audio: https://openbmb.github.io/voxcpm2-demopage
- vLLM Recipes: https://recipes.vllm.ai/openbmb/VoxCPM2
- Nano-VLLM para VoxCPM: https://github.com/a710128/nanovllm-voxcpm
- OpenVox AI: https://openvoxai.com/models/voxcpm2
- There's An AI For That: https://theresanaiforthat.com/model/voxcpm2/
- Paper: https://arxiv.org/abs/2509.24650
- Discord: https://discord.gg/KZUx7tVNwz
- Lark: https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=acds0b9d-23d8-4d7e-b696-d200f3e22a7f
- MiniCPM Wiki: https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D

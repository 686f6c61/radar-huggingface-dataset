# ASLP-lab/M5-TTS-50M-CustomVoice

## Resumen

M5-TTS-50M-CustomVoice es un checkpoint de síntesis de voz (text-to-speech) multilingüe desarrollado por ASLP-lab (ASLP@NPU y LycheeAI Lab). Se trata de la variante "CustomVoice" del sistema M5-TTS, diseñada específicamente para síntesis con locutores predefinidos: el usuario proporciona únicamente el texto y un identificador de locutor entrenado, sin necesidad de audio de referencia ni transcripción de referencia.

El modelo combina un backbone temporal de 30M de parámetros con un decodificador local de predicción multi-token de 20M, sumando 149.850.112 parámetros totales según los pesos en safetensors. Utiliza 16 codebooks de audio a 12,5 frames por segundo para generar voz a 24 kHz, con un codec de audio separado (derivado de Qwen).

Su relevancia actual radica en su tamaño compacto (repo de 0,6 GB), su licencia permisiva Apache-2.0 y su cobertura de seis idiomas (chino, inglés, alemán, francés, japonés y coreano), lo que lo hace atractivo para despliegues con recursos limitados y para aplicaciones de lectura de texto o asistentes de voz con voces fijas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone temporal (30M) + decodificador local de predicción multi-token (20M); codec de audio separado con 16 codebooks a 12,5 frames/s |
| Parametros totales | 149.850.112 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino (zh), inglés (en), alemán (de), francés (fr), japonés (ja), coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

M5-TTS es un sistema TTS compacto y multilingüe que separa la generación de tokens de audio en dos componentes: un backbone temporal de 30M de parámetros que modela la secuencia a nivel temporal y un decodificador local de predicción multi-token de 20M que predice varios tokens por paso. La señal de audio se representa mediante 16 codebooks a 12,5 frames por segundo, lo que permite generar voz a 24 kHz. El codec de audio es un componente independiente, derivado de Qwen, publicado por separado como M5-TTS-Audio-Tokenizer.

El checkpoint CustomVoice está especializado en síntesis con locutores predefinidos: se entrena para mapear texto e identificador de locutor a voz, sin requerir audio ni transcripción de referencia en inferencia. No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. El modelo se distribuye para PyTorch y recomienda BF16 con una GPU NVIDIA compatible con CUDA y flash-attn 2.7.3.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto y un identificador de locutor predefinido, sin audio de referencia.
- Generación de voz a 24 kHz con 16 codebooks de audio.
- Soporte multilingüe: chino, inglés, alemán, francés, japonés y coreano, seleccionables mediante el parámetro de idioma.
- Síntesis con voces predefinidas (preset speakers); los identificadores disponibles dependen del checkpoint.
- No se documentan capacidades de clonación de voz en este checkpoint (existe un checkpoint separado VoiceClone).
- No se documentan tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documentan capacidades de visión ni audio de entrada.

## Casos de uso

- Lectura de textos y artículos: el modelo convierte texto plano en voz en seis idiomas con un locutor fijo, adecuado para sistemas de accesibilidad y lectura automatizada.
- Asistentes de voz con identidad de marca: al usar un identificador de locutor entrenado, se obtiene una voz consistente sin necesidad de gestionar audio de referencia en cada petición.
- Audiolibros y contenido editorial: la generación a 24 kHz y el tamaño compacto permiten procesar lotes de texto en infraestructura modesta.
- Interfaces conversacionales multiidioma: el soporte de zh, en, de, fr, ja y ko permite atender usuarios de distintos mercados con el mismo modelo, seleccionando el idioma por petición.
- Generación de avisos y notificaciones: para sistemas de megafonía, alarmas o notificaciones automáticas donde se requiere una voz fija y predecible.
- Prototipado rápido en investigación TTS: con 149,8M de parámetros y 0,6 GB de repo, es viable experimentar en una sola GPU y comparar variantes CustomVoice frente a VoiceClone.
- Localización de contenido: doblaje de guiones cortos a varios idiomas manteniendo una voz de locutor entrenada por idioma o por checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 149,8M de parámetros en BF16 el peso del modelo ronda los 0,3 GB, por lo que la VRAM adicional vendrá dominada por el codec de audio y los buffers de activación.
- GPU recomendadas: el autor indica una GPU NVIDIA compatible con BF16 y un driver CUDA compatible; se requiere además flash-attn 2.7.3.
- GPU de consumo: por el tamaño del modelo, es previsible que quepa en GPUs de consumo con suficiente VRAM, aunque no se confirma en la información disponible.
- Opciones de despliegue: el flujo documentado es el repositorio oficial M5-TTS con Python 3.10 en Linux, `infer_speaker.py` y `flash-attn`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| M5-TTS-50M-CustomVoice | 149,8M | No disponible | zh, en, de, fr, ja, ko | Apache-2.0 | Voces predefinidas sin audio de referencia |
| M5-TTS-50M-VoiceClone | No disponible | No disponible | No disponible | No disponible | Variante de clonación de voz del mismo proyecto |
| Otros modelos TTS open source | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- El checkpoint CustomVoice solo sintetiza con identificadores de locutor entrenados; no permite clonar voces arbitrarias (para ello existe el checkpoint VoiceClone).
- Establecer un identificador de locutor no cambia los pesos del modelo cargado; los IDs y capacidades de voz dependen del checkpoint concreto.
- No se documentan sesgos conocidos, pero al ser un modelo multilingüe entrenado con datos no especificados, pueden aparecer sesgos de pronunciación, prosodia o acento según el idioma y el locutor.
- Riesgo de alucinación o artefactos de audio en textos atípicos, símbolos, números o nombres propios; no cuantificado en la información disponible.
- No se especifican límites de longitud de texto ni de contexto; conviene trocear entradas largas.
- La licencia Apache-2.0 permite uso comercial, pero el codec de audio derivado de Qwen conserva su atribución upstream según el aviso de terceros del repositorio.
- Requiere Python 3.10 en Linux, GPU NVIDIA con BF16 y flash-attn 2.7.3; no se documenta soporte para CPU ni para otros frameworks de inferencia.
- El número de descargas (194) y de likes (0) es bajo, por lo que la validación comunitaria es todavía limitada.

## Enlaces

- Hugging Face: https://huggingface.co/ASLP-lab/M5-TTS-50M-CustomVoice
- Repositorio GitHub: https://github.com/ASLP-lab/M5-TTS
- Demo: https://aslp-lab.github.io/M5-TTS-Demo-Page/
- Space: https://huggingface.co/spaces/ASLP-lab/M5-TTS-Space
- Colección de modelos: https://huggingface.co/collections/ASLP-lab/m5-tts
- Checkpoint VoiceClone: https://huggingface.co/ASLP-lab/M5-TTS-50M-VoiceClone
- Audio tokenizer: https://huggingface.co/ASLP-lab/M5-TTS-Audio-Tokenizer
- Aviso de terceros del codec: https://github.com/ASLP-lab/M5-TTS/blob/main/m5/codec_qwen12hz/NOTICE

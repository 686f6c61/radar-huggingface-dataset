# Infinix-io/Audio8-TTS-Realistic-Air

## Resumen

Audio8-TTS-Realistic-Air es un modelo de síntesis de voz (text-to-speech) con clonación de voz zero-shot desarrollado por Infinix-io, que parte del checkpoint base Edge0/Audio8-TTS-Preview-0.6b. Su objetivo es generar habla con prosodia más natural y expresiva que su predecesor manteniendo una arquitectura compacta de aproximadamente 601 millones de parámetros en el modelo principal (el códec de audio se distribuye aparte y no se cuenta en esa cifra). Es relevante porque combina clonación de voz a partir de una única grabación de referencia con su transcripción, cobertura multilingüe ampliada a 23 idiomas (12 más que Preview) y una licencia Apache 2.0 que permite uso comercial.

Arquitectura DualAR inspirada en Fish Audio S2 Pro: un transformer autorregresivo lento predice un token semántico por trama de audio y un transformer autorregresivo rápido predice los codebooks del códec condicionado al estado oculto lento y a los codebooks previos. El códec neuronal incluido trabaja a 44,1 kHz con 2.048 muestras por trama del modelo (unas 21,5 tramas por segundo). El contexto alcanza hasta 2.048 posiciones empaquetadas de texto y audio.

La versión Realistic-Air se publica como fine-tune del Preview con el mismo interfaz de inferencia en Transformers, lo que facilita la migración, e incluye un adaptador de servicio para SGLang Omni con paged attention, batching dinámico y API de voz compatible con OpenAI. El repositorio pesa 2,6 GB e incluye el checkpoint completo, el códec de audio a 44,1 kHz, tokenizer, processor y código personalizado de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (transformer autorregresivo lento + autorregresivo rápido) inspirada en Fish Audio S2 Pro |
| Parametros totales | 601.159.424 (modelo principal, excluye el códec) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 2.048 posiciones empaquetadas de texto/audio |
| Tipos de cuantizacion | no disponible (la model card solo documenta BF16 en GPU y FP32 en CPU) |
| Idiomas soportados | 23: chino, inglés, japonés, coreano, alemán, francés, español, italiano, ruso, árabe, finlandés, hindi, indonesio, malayo, neerlandés, noruego, polaco, portugués, sueco, tailandés, turco, vietnamita y cantonés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, con código personalizado) |

Detalles adicionales de la arquitectura:

| Componente | Configuracion |
|---|---|
| Slow AR | 24 capas, anchura 896, 14 cabezas de atención, 2 cabezas KV |
| Fast AR | 4 capas, anchura 896, 14 cabezas de atención, 2 cabezas KV |
| Tokens acústicos | 10 codebooks, 4.096 entradas por codebook |
| Códec | 44,1 kHz, 2.048 muestras por trama del modelo (~21,5 tramas/s) |
| Contexto | hasta 2.048 posiciones empaquetadas de texto/audio |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura DualAR de dos transformadores autorregresivos acoplados. El slow AR, de 24 capas y anchura 896 con 14 cabezas de atención y 2 cabezas KV, predice un token semántico por cada trama de audio. El fast AR, de 4 capas con la misma anchura y configuración de atención, predice los codebooks del códec para esa trama condicionado al estado oculto del slow AR y a los codebooks precedentes. El espacio acústico se representa con 10 codebooks de 4.096 entradas cada uno, y el códec neuronal a 44,1 kHz convierte las tramas en forma de onda con 2.048 muestras por trama, lo que equivale a unas 21,5 tramas por segundo.

El códec incluido se encarga tanto de codificar el audio de referencia como de decodificar la forma de onda final, de modo que no se necesita ningún checkpoint de códec adicional. El modelo base es Edge0/Audio8-TTS-Preview-0.6b y esta versión Realistic-Air es un fine-tune orientado a mejorar el realismo de la prosodia y la expresividad, además de ampliar la cobertura lingüística de 11 a 23 idiomas. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles.

## Capacidades

- Síntesis de voz a partir de texto con prosodia natural y entrega expresiva mejorada respecto al Preview.
- Clonación de voz zero-shot a partir de una única grabación de referencia y su transcripción exacta.
- Generación de habla sin audio de referencia (modo TTS estándar).
- Cobertura multilingüe en 23 idiomas, con calidad variable según el idioma.
- Salida de audio a 44,1 kHz mediante el códec neuronal incluido.
- Interfaz de inferencia nativa en Transformers con código personalizado (`trust_remote_code=True`).
- Servicio de alto rendimiento mediante adaptador SGLang Omni con paged attention, batching dinámico y API de voz compatible con OpenAI.
- Soporte de generación por lotes y de ajuste fino supervisado a través del repositorio oficial de Audio8 TTS.
- No se documentan capacidades de tool calling, razonamiento multi-paso ni procesamiento de visión o audio de entrada más allá del audio de referencia para clonación.

## Casos de uso

- Clonación de voz para doblaje y localización: el modelo permite generar una pista de voz en cualquiera de los 23 idiomas soportados a partir de una muestra del hablante original, manteniendo el timbre con una sola referencia y su transcripción.
- Audiolibros y narración automatizada: la mejora de prosodia y expresividad respecto al Preview lo hace adecuado para narraciones largas, y el contexto de 2.048 posiciones empaquetadas permite procesar fragmentos de texto considerables por generación.
- Asistentes de voz y atención al cliente: la API de voz compatible con OpenAI del adaptador SGLang Omni permite integrarlo en pipelines existentes de agentes conversacionales con batching dinámico para atender varias sesiones concurrentes.
- Accesibilidad y lectura en voz alta: generación de voz de alta fidelidad (44,1 kHz) para convertir documentos y contenidos web en audio, con la posibilidad de clonar la voz del propio usuario a partir de una grabación de referencia.
- Producción de contenido multimedia: generación de locuciones para vídeo, pódcast y anuncios con control de temperatura, top-p y top-k para ajustar la variabilidad de la entrega.
- Investigación en TTS y clonación de voz: al ser un modelo compacto de 0,6B con pesos abiertos y licencia Apache 2.0, sirve como base para experimentación, ajuste fino supervisado y comparación de técnicas DualAR.
- Prototipado rápido en entornos con recursos limitados: el tamaño reducido del modelo principal (601 millones de parámetros) y el batching dinámico de SGLang Omni permiten desplegar servicios de voz sin infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una sección de evaluación con resultados por idioma y que la cobertura de benchmarks incluye algunos idiomas adicionales distintos de la lista de idiomas soportados, pero los valores numéricos no se incluyen en la información proporcionada. Tampoco se detallan métricas de latencia o throughput; solo se indica que el paquete de Transformers fue probado en runtime con PyTorch 2.8.0 y Transformers 4.57.3 en una NVIDIA H20 en BF16, cubriendo carga del modelo, generación en inglés y chino con y sin audio de referencia, y generación en árabe, cantonés, portugués y ruso.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 601 millones de parámetros en BF16, los pesos del modelo principal ocupan aproximadamente 1,2 GB, a lo que hay que sumar el códec de audio incluido y las activaciones; el repositorio completo pesa 2,6 GB.
- GPU recomendadas: la model card cita pruebas en NVIDIA H20; se recomienda una GPU con soporte CUDA y al menos una generación reciente para BF16.
- Cabe en GPU de consumo: el tamaño del modelo principal (0,6B) sugiere que sí es viable en GPUs de consumo con suficiente memoria para los pesos y el códec, aunque no se proporcionan cifras oficiales de VRAM mínima.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`), SGLang Omni con adaptador para servicio de alto rendimiento y API compatible con OpenAI. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Audio8-TTS-Realistic-Air | 601 M (modelo principal) | 2.048 posiciones | 23 | Apache 2.0 | Fine-tune de Audio8-TTS-Preview-0.6b con prosodia mejorada y 12 idiomas adicionales |
| Audio8-TTS-Preview-0.6b | 0,6B | no disponible | 11 | no disponible en la informacion | Modelo base del que parte Realistic-Air; menor cobertura lingüística |
| Fish Audio S2 Pro | no disponible | no disponible | no disponible | no disponible | Arquitectura DualAR en la que se inspira Audio8 TTS; datos no disponibles en la informacion |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la información proporcionada, por lo que la comparación se limita a parámetros, cobertura lingüística y licencia.

## Limitaciones y advertencias

- La calidad de la voz varía según el idioma; la propia model card advierte que la calidad lingüística es desigual y remite a la evaluación por idioma.
- La clonación de voz zero-shot exige una grabación de referencia limpia y una transcripción que coincida exactamente con el contenido hablado; discrepancias en la transcripción degradan el resultado.
- Riesgo de uso indebido para suplantación de identidad o generación de audio engañoso; no se documentan en la información disponible mecanismos de marca de agua o detección.
- No se detallan sesgos conocidos del modelo ni tasas de alucinación en la información proporcionada.
- El modelo requiere `trust_remote_code=True` y código personalizado de Transformers, lo que implica revisar los archivos del repositorio antes de ejecutarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales ni cláusulas de uso aceptable específicas en la información disponible.
- El contexto está limitado a 2.048 posiciones empaquetadas de texto y audio, lo que condiciona la longitud de los textos y referencias que se pueden procesar en una sola generación.
- El playground alojado en Hugging Face ZeroGPU depende de la cola y de la cuota diaria de GPU del usuario.
- No se documentan opciones de cuantización, lo que limita el despliegue en entornos con restricciones de memoria no cubiertas por BF16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinix-io/Audio8-TTS-Realistic-Air
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Preview-0.6b
- Repositorio GitHub: https://github.com/Edge0-AI/Audio8_TTS
- Demo: https://edge0-ai.github.io/Audio8_TTS/realistic-0.6b/
- Paper (arXiv): https://arxiv.org/abs/2610.14776
- Playground en Hugging Face Spaces: https://huggingface.co/spaces/Edge0/Audio8-TTS-Realistic-Air
- Artículo de MarkTechPost: https://www.marktechpost.com/2026/10/29/edge0-audio8-tts-realistic-0-6b-voice-cloning/
- Espejo en Hugging Face: https://huggingface.co/TechnoBaptist/Audio8-TTS-Realistic-Air

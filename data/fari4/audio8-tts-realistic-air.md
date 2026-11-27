# Fari4/Audio8-TTS-Realistic-Air

## Resumen

Audio8-TTS-Realistic-Air es un modelo de síntesis de voz (text-to-speech) desarrollado por Fari4 como refinamiento del checkpoint base Edge0/Audio8-TTS-Preview-0.6b, publicado originalmente por el equipo Edge0-AI. Se trata de un modelo compacto de 601.159.424 parámetros (excluyendo el códec de audio) cuyo objetivo es generar habla realista con clonación de voz zero-shot a partir de una grabación de referencia y su transcripción, o bien generar voz sin referencia. Su relevancia reside en que mejora sustancialmente el realismo prosódico del modelo Preview manteniendo el mismo tamaño reducido de 0,6B y ampliando la cobertura de 11 a 23 idiomas.

La arquitectura es un DualAR (dos transformadores autorregresivos en cascada) inspirado en Fish Audio S2 Pro: un transformador AR lento predice un token semántico por cada frame de audio y un transformador AR rápido predice los codebooks del códec condicionado por el estado oculto del lento. El repositorio incluye el checkpoint completo, un códec neuronal de audio a 44,1 kHz, tokenizador, procesador y código personalizado de Transformers, además de una integración nativa con llama.cpp/GGUF y un adaptador para SGLang Omni.

El modelo se distribuye con licencia Apache 2.0, lo que facilita su uso comercial, y está pensado para despliegues en local con llama.cpp, en servidores GPU con SGLang Omni o mediante la interfaz estándar de Transformers. Con 0,6B de parámetros y contexto de hasta 2.048 posiciones empaquetadas de texto y audio, se posiciona como una opción ligera para pipelines de TTS multilingüe con clonación de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (transformador AR lento + transformador AR rápido) inspirado en Fish Audio S2 Pro |
| Parametros totales | 601.159.424 (modelo principal, excluyendo el códec) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 2.048 posiciones empaquetadas de texto y audio |
| Tipos de cuantizacion | GGUF (bundle F32 compartido para llama.cpp); el resto no disponible |
| Idiomas soportados | 23: zh, en, ja, ko, de, fr, es, it, ru, ar, fi, hi, id, ms, nl, no, pl, pt, sv, th, tr, vi, yue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura DualAR en la que el transformador AR lento (24 capas, anchura 896, 14 cabezas de atención, 2 cabezas KV) predice un token semántico por cada frame de audio, mientras que el transformador AR rápido (4 capas, anchura 896, 14 cabezas de atención, 2 cabezas KV) predice los codebooks del códec de cada frame condicionado por el estado oculto del lento y los codebooks precedentes. La representación acústica se compone de 10 codebooks con 4.096 entradas cada uno. El códec neuronal incluido trabaja a 44,1 kHz con 2.048 muestras por frame del modelo (aproximadamente 21,5 frames por segundo) y gestiona tanto la codificación del audio de referencia como la decodificación de la forma de onda, por lo que no requiere un checkpoint de códec adicional.

El modelo se construye sobre el checkpoint Edge0/Audio8-TTS-Preview-0.6b y esta versión "Realistic Air" se centra en mejorar la naturalidad de la prosodia y la expresividad, además de ampliar de 11 a 23 los idiomas soportados. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. El paquete de Transformers fue probado con PyTorch 2.8.0 y Transformers 4.57.3 en una NVIDIA H20 en BF16, cubriendo carga del modelo, generación en inglés y chino con y sin audio de referencia, y generación en árabe, cantonés, portugués y ruso.

## Capacidades

- Generación de voz realista a partir de texto, con prosodia y entrega expresiva mejoradas respecto al modelo Preview.
- Clonación de voz zero-shot a partir de una grabación de referencia limpia y su transcripción exacta.
- Generación de voz sin referencia de audio.
- Soporte multilingüe en 23 idiomas, incluyendo chino, inglés, japonés, coreano, alemán, francés, español, italiano, ruso, árabe, finlandés, hindi, indonesio, malayo, neerlandés, noruego, polaco, portugués, sueco, tailandés, turco, vietnamita y cantonés.
- Inferencia local nativa mediante llama.cpp/GGUF con CLI, clonación de voz y streaming.
- Servido en GPU mediante SGLang Omni con paged attention, batching dinámico y API de voz compatible con OpenAI.
- Integración con la interfaz de Transformers mediante código personalizado (`trust_remote_code=True`).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada más allá del audio de referencia para clonación.

## Casos de uso

- Atención al cliente automatizada: el modelo puede generar respuestas habladas en 23 idiomas con una voz corporativa consistente clonada a partir de una grabación de referencia, integrándose en sistemas de IVR o asistentes telefónicos mediante la API compatible con OpenAI de SGLang Omni.
- Audiolibros y narración: la generación sin referencia y la prosodia expresiva permiten producir narraciones largas con entonación natural; el contexto de 2.048 posiciones empaquetadas admite fragmentos de texto considerables por invocación.
- Doblaje y localización de vídeo: al soportar clonación zero-shot, se puede replicar la voz de un actor original y generar la pista doblada en otro de los 23 idiomas, manteniendo el timbre del hablante.
- Asistentes de voz embebidos y Edge: la integración con llama.cpp/GGUF y el tamaño de 0,6B permiten desplegar el modelo en local sin depender de servicios en la nube, con streaming de audio para baja latencia percibida.
- Accesibilidad: conversión de texto a voz personalizada para usuarios que necesiten una voz sintética propia, clonada a partir de muestras pregrabadas del usuario.
- Generación de contenido para podcasts y vídeo corto: producción rápida de voces en off multilingües con un único modelo y sin infraestructura de GPU de gran tamaño.
- Pruebas de concepto e investigación en TTS: la licencia Apache 2.0 y la disponibilidad de pesos en safetensors y GGUF facilitan la experimentación y el ajuste fino sobre el modelo base.

## Benchmarks y rendimiento

La model card menciona una sección de evaluación con resultados por idioma, pero en la información proporcionada no se incluyen las cifras concretas de benchmarks (MMLU, HumanEval, GSM8K u otras métricas de TTS como MOS, WER o similitud de hablante). Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 601 millones de parámetros en BF16 el peso del modelo principal ronda 1,2 GB, a lo que hay que sumar el códec de audio incluido y las cachés KV, por lo que en la práctica se recomienda al menos 4-8 GB de VRAM para margen operativo.
- GPU recomendadas: la model card cita pruebas en NVIDIA H20; para servido con SGLang Omni se recomiendan GPU de centro de datos (A100, H100, H20) por el batching dinámico y paged attention.
- Cabe en GPU de consumo: sí, por el tamaño de 0,6B; tarjetas como RTX 4090 o RTX 3090 disponen de VRAM suficiente, aunque la model card no publica cifras específicas de consumo en estas tarjetas.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`), llama.cpp/GGUF para inferencia local nativa con CLI y streaming, SGLang Omni con API compatible con OpenAI, y el Playground alojado en Hugging Face ZeroGPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| Audio8-TTS-Realistic-Air (Fari4) | 601 M (sin códec) | 2.048 posiciones empaquetadas | 23 | Apache 2.0 | safetensors, GGUF |
| Audio8-TTS-Preview-0.6b (Edge0) | 0,6B | No disponible | 11 | No disponible en la información | No disponible en la información |
| Fish Audio S2 Pro (referencia arquitectónica) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación con otros modelos TTS de la misma categoría (por ejemplo, alternativas open source de clonación zero-shot) no puede completarse con datos verificados en la información disponible; los datos de rendimiento comparativo no están publicados en el material proporcionado.

## Limitaciones y advertencias

- La calidad del habla varía según el idioma; la propia model card advierte que la calidad por lengua es desigual y remite a su evaluación por idioma, cuyas cifras no se incluyen en la información disponible.
- La clonación de voz requiere una grabación de referencia limpia y una transcripción que coincida exactamente con el contenido hablado; discrepancias o ruido degradan el resultado.
- Riesgo de alucinación y artefactos acústicos: como todo modelo generativo de audio, puede producir prosodia anómala, pronunciación incorrecta o artefactos en textos largos o fuera de distribución.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; cabe esperar sesgos derivados de los datos de entrenamiento en acentos, géneros y variedades dialectales.
- Limitación de contexto: 2.048 posiciones empaquetadas de texto y audio, lo que acota la longitud de texto y de referencia procesable por invocación.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero la clonación de voz plantea riesgos de suplantación y exige consentimiento explícito de la persona cuya voz se clona y cumplimiento de la normativa aplicable (por ejemplo, RGPD y normativa de IA de la UE).
- El modelo utiliza código personalizado de Transformers y requiere `trust_remote_code=True`, lo que implica revisar los archivos del repositorio antes de cargarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es aún inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/Fari4/Audio8-TTS-Realistic-Air
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Preview-0.6b
- Repositorio GitHub de Edge0-AI: https://github.com/Edge0-AI/Audio8_TTS
- Demo: https://edge0-ai.github.io/Audio8_TTS/realistic-0.6b/
- Paper arXiv: https://arxiv.org/abs/2610.14776
- Playground en Hugging Face Spaces: https://huggingface.co/spaces/Edge0/Audio8-TTS-Realistic-Air
- Guía de llama.cpp: https://github.com/Edge0-AI/Audio8_TTS/blob/0f8c4fade0cb14e38fbf737d0488553f16a0d658/guides/llama-cpp.md
- Guía de llama.cpp en chino: https://github.com/Edge0-AI/Audio8_TTS/blob/0f8c4fade0cb14e38fbf737d0488553f16a0d658/guides/llama-cpp_zh.md
- Proyecto Fish Audio S2 Pro (referencia arquitectónica): https://github.com/fishaudio/fish-speech

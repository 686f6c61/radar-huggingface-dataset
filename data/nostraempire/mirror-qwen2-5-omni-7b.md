# NostraEmpire/mirror-qwen2.5-omni-7b

## Resumen

Qwen2.5-Omni es un modelo multimodal de extremo a extremo desarrollado por Alibaba Cloud, diseñado para percibir texto, imágenes, audio y vídeo, y generar simultáneamente respuestas de texto y habla natural en modo streaming. El repositorio NostraEmpire/mirror-qwen2.5-omni-7b es un espejo del modelo original Qwen/Qwen2.5-Omni-7B, alojado por NostraEmpire, que conserva la misma arquitectura y pesos. Este modelo destaca por su arquitectura Thinker-Talker, que separa el razonamiento (Thinker) de la generación de habla (Talker), permitiendo una interacción en tiempo real con entrada por fragmentos y salida inmediata.

El modelo cuenta con 10.732 millones de parámetros totales (7B activos en el componente de lenguaje), una ventana de contexto de 32.768 tokens y una licencia Apache 2.0 que permite uso comercial. Su relevancia actual radica en que ofrece capacidades omnímodas comparables a modelos mucho más grandes, superando a alternativas como Gemini-1.5-Pro en benchmarks multimodales como OmniBench, y proporcionando instrucciones de voz de extremo a extremo con un rendimiento similar al de entrada de texto. El modelo se distribuye en formato safetensors y es compatible con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Thinker-Talker (Qwen2.5 base + Qwen2.5-VL visual encoder + audio encoder + speech decoder) |
| Parametros totales | 10.732.225.440 |
| Parametros activos | no disponible (arquitectura no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (repo solo safetensors; compatible con cuantizacion posterior) |
| Idiomas soportados | ingles (principal), con capacidades multilingues limitadas |
| Licencia | Apache 2.0 (misma licencia que Qwen2.5-Omni-7B original) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen2.5-Omni emplea una arquitectura Thinker-Talker, una innovacion respecto a los modelos multimodales tradicionales. El Thinker es un modelo de lenguaje multimodal que procesa entradas de texto, imagen, audio y vídeo, y genera tanto texto como representaciones semanticas intermedias. El Talker es un decodificador de habla autoregresivo basado en el decodificador de Qwen2.5-Omni que convierte esas representaciones en audio de voz natural en streaming. Esta separacion permite que el Thinker se entrene con datos de texto e instrucciones, mientras que el Talker se optimiza especificamente para la naturalidad y robustez del habla generada.

Una innovacion clave es el posicionamiento TMRoPE (Time-aligned Multimodal RoPE), que sincroniza las marcas de tiempo de las entradas de vídeo con las de audio, permitiendo una comprension coherente de contenido audiovisual. El modelo se entrena de extremo a extremo con datos multimodales, y el componente de lenguaje se inicializa desde Qwen2.5-7B. El entrenamiento incluye fases de preentrenamiento y ajuste fino con instrucciones, incorporando tecnicas de optimizacion para la generacion de habla robusta. Los datos exactos de entrenamiento (numero de tokens y composicion del dataset) no estan disponibles en la informacion proporcionada.

## Capacidades

- Percepcion multimodal completa: procesa texto, imagenes, audio y vídeo de forma simultanea o individual.
- Generacion de texto y habla en streaming: responde en tiempo real con salida de voz natural mientras recibe entrada por fragmentos.
- Transcripcion de voz (ASR): reconocimiento de habla con tasas de error competitivas frente a modelos especializados como Whisper-large-v3.
- Traduccion de voz: soporta traduccion de audio a texto en distintos idiomas.
- Comprension de audio: analisis de eventos sonoros, musica y contenido de audio en general.
- Razonamiento sobre imagenes: responde preguntas sobre contenido visual con precision comparable a Qwen2.5-VL-7B.
- Comprension de vídeo: analiza contenido de vídeo sincronizando pistas de audio y visuales gracias a TMRoPE.
- Instrucciones de voz de extremo a extremo: sigue instrucciones habladas directamente, sin necesidad de transcripcion intermedia, con rendimiento similar al de texto en MMLU y GSM8K.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de voz en tiempo real: el modelo puede alimentar asistentes conversacionales que escuchan, razonan y responden con voz natural sin latencia perceptible, gracias a su arquitectura de streaming y generacion de habla directa.
- Transcripcion y subtitulado automatico: su capacidad ASR con tasas de error del 1.7% en Librispeech test-clean permite generar subtitulos o transcripciones de audio y vídeo con alta precision.
- Analisis de contenido audiovisual: puede procesar vídeos completos sincronizando audio e imagen para generar resumenes, descripciones o responder preguntas sobre el contenido, util en moderacion de contenido o busqueda de vídeo.
- Educacion y tutoria interactiva: su capacidad de seguir instrucciones de voz de extremo a extremo permite crear tutores que escuchan preguntas habladas y responden con explicaciones orales, evaluadas con benchmarks como GSM8K.
- Accesibilidad para personas con discapacidad visual o auditiva: puede describir imagenes y vídeos en voz alta, o convertir contenido hablado en texto, facilitando el acceso a informacion multimodal.
- Traduccion de voz en tiempo real: su rendimiento en CoVoST2 permite construir sistemas de interpretacion simultanea que traducen audio de un idioma a otro con salida de texto o voz.
- Asistentes de call center: integrado en pipelines de atencion al cliente, puede gestionar llamadas completas, comprendiendo el tono de voz y el contenido, y respondiendo con habla natural sin necesidad de un sistema TTS separado.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card oficial de Qwen2.5-Omni-7B. Se presentan los resultados publicados por el equipo de Qwen.

| Benchmark | Qwen2.5-Omni-7B | Qwen2.5-Omni-3B | Gemini-1.5-Pro | MiniCPM-o |
|---|---|---|---|---|
| OmniBench (promedio) | **56.13%** | 52.19% | 42.91% | 40.50% |
| OmniBench (speech) | **55.25%** | 52.14% | 42.67% | - |
| OmniBench (sonido) | **60.00%** | 52.08% | 42.26% | - |
| OmniBench (musica) | 52.83% | 52.83% | 46.23% | - |
| Librispeech test-clean (WER) | 1.7 | - | - | 1.7 |
| Librispeech test-other (WER) | 3.9 | - | - | - |

| Benchmark | Qwen2.5-Omni-7B | Qwen2.5-VL-7B | Qwen2-Audio | Gemini-1.5-Pro |
|---|---|---|---|---|
| MMLU (instruccion de voz) | comparable a texto | - | - | - |
| GSM8K (instruccion de voz) | comparable a texto | - | - | - |
| MMMU (imagen) | comparable | referencia | - | - |
| MMAU (audio) | superior | - | referencia | - |
| MVBench (vídeo) | comparable | - | - | referencia |

Nota: el modelo supera a Gemini-1.5-Pro en OmniBench y ofrece rendimiento comparable a Qwen2.5-VL-7B en tareas de imagen. No se dispone de resultados de HumanEval ni de benchmarks de codigo en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 10.732 millones de parametros en precision FP32 (22.4 GB). En FP16/BF16, el peso ocupa aproximadamente 21.5 GB, por lo que se necesita al menos 24 GB de VRAM para inferencia sin cuantizacion.
- Con cuantizacion INT8, la VRAM necesaria se reduce a aproximadamente 11-12 GB; con INT4, a unos 6-7 GB, aunque la cuantizacion de un modelo multimodal con multiples encoders puede requerir herramientas especificas.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) para FP16; GPUs consumer de 16 GB (RTX 4080, 4070 Ti) con cuantizacion INT8.
- No cabe en GPUs consumer de 8 GB sin cuantizacion agresiva, y la generacion de audio en streaming requiere memoria adicional para el decodificador de habla.
- Opciones de despliegue: compatible con transformers (libreria principal), puede servirse con vLLM para texto, aunque el soporte de generacion de audio en streaming puede requerir el codigo oficial del repositorio QwenLM/Qwen2.5-Omni. No se menciona soporte nativo para llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada, aunque la arquitectura esta disenada para streaming en tiempo real con entrada por fragmentos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Salida de voz | Licencia |
|---|---|---|---|---|---|
| Qwen2.5-Omni-7B | 10.7B totales | 32K | Texto, imagen, audio, vídeo | Si (streaming) | Apache 2.0 |
| MiniCPM-o | 8B | no disponible | Texto, imagen, audio, vídeo | Si | no disponible |
| Baichuan-Omni-1.5 | no disponible | no disponible | Texto, imagen, audio, vídeo | Si | no disponible |
| Gemini-1.5-Pro (cerrado) | no disponible | 1M | Texto, imagen, audio, vídeo | No (solo texto) | Propietaria |

Qwen2.5-Omni-7B supera a MiniCPM-o y Baichuan-Omni-1.5 en OmniBench (56.13% frente a 40.50% y 42.90% respectivamente), y ofrece ventajas claras frente a Gemini-1.5-Pro en tareas de integracion multimodal. Frente a modelos de modalidad unica como Qwen2.5-VL-7B o Qwen2-Audio, ofrece rendimiento comparable o superior en sus respectivos dominios, anadiendo la capacidad de generar habla natural sin necesidad de un TTS externo.

## Limitaciones y advertencias

- El repositorio es un espejo (mirror) del modelo original; no hay garantia de mantenimiento o soporte por parte de NostraEmpire. Se recomienda verificar la integridad de los pesos antes de su uso en produccion.
- El modelo esta optimizado principalmente para ingles; el rendimiento en otros idiomas, incluido el espanol, no esta documentado y puede ser significativamente inferior.
- La generacion de habla en streaming requiere el codigo especifico del repositorio oficial de Qwen; la integracion con transformers estandar puede no soportar todas las capacidades de audio.
- Los benchmarks publicados son proporcionados por el equipo de Qwen y no han sido verificados de forma independiente por NostraEmpire.
- Riesgo de alucinacion en tareas de razonamiento multimodal, especialmente con entradas de audio o vídeo ambiguas.
- El modelo no incluye capacidades de tool calling documentadas, lo que limita su uso en pipelines de agentes complejos.
- No se dispone de informacion sobre sesgos especificos del modelo, aunque al estar entrenado principalmente con datos en ingles, puede reflejar sesgos culturales y linguisticos de ese dominio.
- Para uso en produccion con audio, se recomienda evaluar la latencia en el hardware objetivo, ya que la generacion de voz en streaming es computacionalmente intensiva.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/NostraEmpire/mirror-qwen2.5-omni-7b
- Modelo original en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio GitHub oficial: https://github.com/QwenLM/Qwen2.5-Omni
- Paper (arXiv): https://arxiv.org/abs/2503.20215
- Licencia original: https://huggingface.co/Qwen/Qwen2.5-Omni-7B/blob/main/LICENSE

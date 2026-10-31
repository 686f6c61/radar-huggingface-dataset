# akhaliq/nemotron-3.5-transcribe-mini-64e

## Resumen

Nemotron-3.5-Transcribe-Mini-64e es una versión podada (pruned) del modelo de voz de NVIDIA Nemotron-3.5-Transcribe-30B-A4B, publicada por el usuario akhaliq en Hugging Face. Es la primera derivada podada de ese modelo, considerado el mejor modelo de voz de pesos abiertos, y se ha reducido mediante la técnica REAP (Router-weighted Expert Activation Pruning, arXiv:2510.13999) sin ningún reentrenamiento de recuperación ni destilación: los expertos MoE se eliminan de forma "one-shot" calibrando con transcripciones de voz multilingües (FLEURS, 8 idiomas).

El resultado es una familia de variantes que van desde una versión de 96 expertos (~53 GB, prácticamente sin pérdida de calidad) hasta una variante de 64 expertos cuantizada a W4A16 de solo 10 GB, capaz de ejecutarse en una GPU doméstica de 12 GB. La variante de 10 GB es además la más rápida: un 27% más de throughput por stream y un 21% más en ráfaga que el modelo original de 67,5 GB, con una degradación de WER de apenas +25% relativo.

El modelo conserva las capacidades del maestro: transcripción en 40 idiomas, audio de hasta una hora, traducción de voz, transcripción con atribución de hablante (diarización), marcas de tiempo por palabra mediante una cabeza CTC, contextual biasing y control por instrucciones del estilo de transcripción. Es relevante porque demuestra que una parte significativa de los expertos de un MoE de voz es prescindible, abriendo la puerta a despliegues locales de modelos de voz de gran calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Speech LLM híbrido (backbone NemotronH MoE con componentes Mamba, encoder de audio + encoder de hablante + cabeza CTC para timestamps) |
| Parametros totales | no disponible (modelo base: 30B-A4B, ~30B totales) |
| Parametros activos | ~4B en el modelo base (A4B); para la variante 64e no disponible |
| Longitud de contexto | 8192 tokens (según configuración de vLLM del ejemplo); audio de hasta 1 hora |
| Tipos de cuantizacion | BF16 (variantes 96e y 64e) y W4A16 INT4 group-64 (variante 64e-w4a16-g64) |
| Idiomas soportados | 40 idiomas (heredado del modelo base) |
| Licencia | openmdw-1.1 (licencia "other" en Hugging Face) |
| Formato de pesos | safetensors (checkpoints fused y backbone standalone) |

Tamaños por variante:

| Variante | Expertos | Tamaño |
|---|---|---|
| fused-96e | 96 | ~53 GB |
| fused-64e | 64 | ~38 GB |
| fused-64e-w4a16-g64 | 64 | 10,0 GB |
| backbone-64e-w4a16-g64 (solo texto) | 64 | 10,0 GB |

## Arquitectura y entrenamiento

El modelo base, Nemotron-3.5-Transcribe-30B-A4B, es un speech LLM híbrido con un backbone tipo NemotronH que combina capas transformer y bloques Mamba (para usar los kernels rápidos de Mamba se recomienda instalar `mamba-ssm` y `causal-conv1d`), con enrutado MoE de 128 expertos y ~4B de parámetros activos. Incluye un encoder de audio, un encoder de hablante para la diarización y una cabeza CTC para marcas de tiempo por palabra.

Esta derivada no añade entrenamiento: aplica REAP (Router-weighted Expert Activation Pruning), una técnica de poda one-shot de expertos MoE que usa los pesos del router y las activaciones para identificar y eliminar los expertos menos contribuyentes. La calibración se realizó con transcripciones de voz multilingües del dataset FLEURS en 8 idiomas. El encoder de audio, el encoder de hablante y la cabeza CTC de timestamps se conservan intactos. Sobre la variante de 64 expertos se aplicó además cuantización W4A16 (pesos INT4, activaciones BF16, grupos de 64) mediante compressed-tensors, servible con los kernels Marlin de vLLM.

## Capacidades

- Transcripción automática de voz (ASR) en 40 idiomas
- Traducción de voz (speech translation)
- Transcripción con atribución de hablante mediante etiquetas (`<spk:0>`, `<spk:1>`) gracias al encoder de hablante conservado
- Marcas de tiempo a nivel de palabra mediante la cabeza CTC intacta
- Procesamiento de audio de larga duración (hasta 1 hora por grabación)
- Contextual biasing: sesgo del resultado hacia términos específicos (nombres propios, jerga)
- Control del estilo de transcripción mediante instrucciones en lenguaje natural (es un speech LLM instruction-following): puntuación, capitalización, formato, etc.
- El backbone de texto cuantizado (`backbone-64e-w4a16-g64`) puede cargarse de forma independiente como modelo de causal LM solo texto
- Servible vía vLLM con API estilo chat de OpenAI (audio como data URI base64)

## Casos de uso

- Transcripción local y privada en GPU de consumo: la variante W4A16 de 10 GB cabe en una GPU de 12 GB, lo que permite transcribir reuniones o grabaciones sensibles sin enviar audio a la nube.
- Subtitulado y doblaje multilingüe: soporta 40 idiomas y traducción de voz, útil para generar subtítulos o traducciones directas de contenido audiovisual.
- Transcripción de reuniones largas con diarización: grabaciones de hasta 1 hora con etiquetas de hablante y marcas de tiempo por palabra, ideal para actas y minutas indexables.
- Indexación y búsqueda de archivos de audio: las word timestamps y el contextual biasing permiten alinear transcripciones con el audio y adaptar el modelo a vocabulario específico (marcas, nombres propios, terminología médica o legal).
- Pipelines de postproducción con estilo controlado: mediante instrucciones se puede exigir puntuación, capitalización o formatos concretos, reduciendo el postprocesado en flujos editoriales.
- Procesamiento por lotes de alto throughput: con RTFx de ráfaga de ~171 en H200, es adecuado para transcribir grandes volúmenes de grabaciones (call centers, archivos, podcasts) en colas de trabajo.
- Investigación en poda de MoE: el repositorio incluye los scripts exactos de evaluación, cuantización y release, así como los transcripts brutos de cada evaluación, lo que lo hace reproducible como caso de estudio.

## Benchmarks y rendimiento

WER frente al modelo completo de 30B (300 clips: FLEURS en/de/es + LibriSpeech test-clean, decodificación greedy):

| Variante | Expertos | Tamaño | fleurs-en | fleurs-de | fleurs-es | librispeech | Media |
|---|---|---|---|---|---|---|---|
| Teacher (30B-A4B) | 128 | 67,5 GB | 5,79% | 4,59% | 4,37% | 1,73% | 4,12% |
| 96e | 96 | ~53 GB | 5,61% | 4,65% | 4,53% | 1,81% | 4,15% (+0,7% rel) |
| 64e | 64 | ~38 GB | 6,73% | 5,67% | 5,17% | 2,75% | 5,08% (+23% rel) |
| 64e-W4A16 | 64 | 10,0 GB | 6,29% | 6,35% | 5,70% | 2,28% | 5,16% (+25% rel) |

Velocidad (H200, vLLM, greedy, clips de FLEURS):

| Modelo | Latencia media | RTFx single-stream | Clip ~90 s | RTFx ráfaga ×8 |
|---|---|---|---|---|
| Teacher 67,5 GB | 0,24 s | 39,3 | 0,49 s / 107,1 | 142,1 |
| 64e BF16 38 GB | 0,24 s | 39,6 | 0,47 s / 112,2 | 147,8 |
| 64e-W4A16 10 GB | 0,19 s | 50,4 | 0,50 s / 103,8 | 171,3 |

## Requisitos de hardware

- Variante fused-64e-w4a16-g64 (10 GB): cabe en una GPU de consumo de 12 GB de VRAM (por ejemplo RTX 3060 12GB, RTX 4070). El backbone solo texto de 10 GB también cabe en 12 GB.
- Variante fused-64e BF16 (~38 GB): requiere una GPU con 40-48 GB de VRAM (A100 40GB, A6000, L40S) o tensor parallel en 2 GPUs de 24 GB.
- Variante fused-96e (~53 GB): requiere A100 80GB o H100, o reparto en varias GPUs.
- Despliegue verificado con vLLM 0.32.0 mediante el plugin `nemo_speechlm` y kernels compressed-tensors Marlin para W4A16; también carga en Hugging Face Transformers (`AutoModelForMultimodalLM`) con `device_map="auto"`.
- No se menciona soporte en llama.cpp u Ollama; la librería nativa es NeMo (`nemo-toolkit[asr-only,core,common-only]`).
- Rendimiento medido en H200: latencia media de 0,19 s y RTFx de 50,4 single-stream (171,3 en ráfaga ×8) para la variante de 10 GB; no hay cifras publicadas para GPUs de consumo.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | WER medio (eval propia) | Contexto de audio | Licencia |
|---|---|---|---|---|---|
| NVIDIA Nemotron-3.5-Transcribe-30B-A4B (teacher) | Speech LLM MoE 128e | 67,5 GB | 4,12% | hasta 1 h | openmdw-1.1 |
| akhaliq/nemotron-3.5-transcribe-mini-64e (W4A16) | Speech LLM MoE 64e podado + INT4 | 10,0 GB | 5,16% | hasta 1 h | openmdw-1.1 |
| akhaliq/nemotron-3.5-transcribe-mini-96e | Speech LLM MoE 96e podado | ~53 GB | 4,15% | hasta 1 h | openmdw-1.1 |

Frente a otros ASR abiertos de referencia (Whisper large-v3, Canary, etc.) no hay datos comparativos publicados en la información disponible, por lo que no se pueden aportar cifras de WER cruzadas sin inventar datos.

## Limitaciones y advertencias

- La variante de 64 expertos degrada el WER un +23-25% relativo respecto al maestro (media 5,08-5,16% frente a 4,12%); si se necesita máxima precisión, la variante 96e está dentro del margen de ruido del original.
- La evaluación de WER se limitó a 300 clips de FLEURS (inglés, alemán, español) y LibriSpeech test-clean con decodificación greedy; no hay datos publicados para los 40 idiomas restantes ni para condiciones acústicas difíciles (ruido, acentos, superposición de hablantes).
- La poda se calibró en 8 idiomas de FLEURS; el comportamiento en idiomas no representados en la calibración no está verificado.
- El backbone standalone cuantizado es solo texto: no incluye el encoder de audio, por lo que no sirve para ASR por sí solo.
- Para cargas en Transformers sin `mamba-ssm` y `causal-conv1d` se usan implementaciones de referencia más lentas.
- Licencia openmdw-1.1: es una licencia abierta distinta de Apache/MIT; conviene revisar sus términos antes de uso comercial concreto.
- Como todo modelo de ASR, puede alucinar contenido en segmentos de silencio, ruido o audio ininteligible; se recomienda validación en producción, especialmente en dominios regulados.
- Requiere `--trust-remote-code` en vLLM y versiones concretas de las dependencias (vllm 0.32.0, NeMo desde el repo NVIDIA-NeMo/Speech), lo que puede complicar la integración en entornos gestionados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akhaliq/nemotron-3.5-transcribe-mini-64e
- Modelo base (teacher): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Demo (Space): https://huggingface.co/spaces/akhaliq/nemotron-transcribe-mini
- Paper REAP: https://huggingface.co/papers/2510.13999 (arXiv:2510.13999)
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- NeMo Speech (repositorio de despliegue): https://github.com/NVIDIA-NeMo/Speech

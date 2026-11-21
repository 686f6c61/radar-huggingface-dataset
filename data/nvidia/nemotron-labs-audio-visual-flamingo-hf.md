# nvidia/nemotron-labs-audio-visual-flamingo-hf

## Resumen

Nemotron-Labs-Audio-Visual Flamingo (AVF) es un modelo de lenguaje multimodal de gran tamano desarrollado por NVIDIA en colaboracion con la University of Maryland, disenado para la comprension y el razonamiento conjuntos sobre audio, imagenes y video. Se trata del checkpoint instruction-tuned (AVF-Instruct, release final de 2026-06-29) de la linea Audio Flamingo, que amplia el trabajo previo de comprension puramente auditiva hacia el razonamiento audiovisual conjunto. El modelo combina una torre de vision SigLIP, un encoder de audio AF-Whisper, preprocesamiento visual Dynamic-S2 y un backbone decoder-only de la familia Qwen2.5-7B, con un total de 8.742.888.688 parametros.

La propuesta diferencial de AVF es el intercalado temporal de chunks audiovisuales sincronizados mediante Constrained Rotary Time Embeddings (CRTE), en lugar de procesar video y audio como flujos independientes. Esto permite al modelo atender a eventos visuales y sonoros que coocurren en el tiempo, asi como razonar sobre orden de eventos, cambios de escena y alineamiento entre modalidades en videos largos y complejos del mundo real.

El modelo es relevante en el contexto actual de modelos multimodales porque aborda un nicho poco cubierto: el razonamiento que depende simultaneamente de lo visible y lo audible (habla, sonidos de fondo, musica, acciones visuales). Su licencia es la NVIDIA OneWay Noncommercial License, lo que restringe el uso a investigacion no comercial. La release esta enfocada al idioma ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal audio-visual: torre de vision SigLIP + encoder de audio AF-Whisper + backbone decoder-only Qwen2.5-7B con projectors de 2 capas por modalidad e intercalado temporal CRTE |
| Parametros totales | 8.742.888.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | NVIDIA OneWay Noncommercial License (other) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

AVF es un modelo multimodal que fusiona tres componentes principales: una torre de vision SigLIP que procesa imagenes y frames de video muestreados, un encoder de audio AF-Whisper que codifica habla, sonidos y musica, y un backbone de lenguaje decoder-only de la familia Qwen2.5-7B. Las caracteristicas visuales y auditivas pasan por projectors separados de 2 capas antes de integrarse en el espacio del modelo de lenguaje. El preprocesamiento visual emplea Dynamic-S2 para imagenes de alta resolucion y videos largos.

La innovacion tecnica central es el intercalado audiovisual temporal con Constrained Rotary Time Embeddings (CRTE): en lugar de tratar los frames de video y el audio como flujos independientes, el modelo alinea chunks audiovisuales sincronizados, los intercala a lo largo del eje temporal y alimenta la secuencia fusionada al modelo de lenguaje. Esto facilita la atencion cruzada entre eventos visuales y auditivos coocurrentes. El checkpoint ha sido instruction-tuned; la model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. El dataset asociado es nvidia/AV-Skills, con aproximadamente 7 millones de instancias de caption y QA segun los badges de la model card.

## Capacidades

- Generacion de texto condicionada a entradas multimodales de audio, imagen, video y texto en una unica interfaz de chat-template.
- Comprension de video: video question answering donde la evidencia visual y auditiva es relevante de forma conjunta.
- Captioning audiovisual detallado de videos del mundo real.
- Razonamiento temporal sobre orden de eventos, cambios de escena y contexto de largo alcance en videos largos.
- Alineamiento de eventos audiovisuales: identificar que sonido corresponde a un momento visual concreto.
- Comprension de habla (ASR), sonidos ambientales y musica, junto con acciones visuales.
- Timestamp-grounding (anclaje temporal) segun los tags del modelo.
- Razonamiento multi-step sobre las modalidades anteriores.
- Generacion exclusivamente de texto: no incluye TTS en streaming en los pesos del Hub.

## Casos de uso

- Analisis forense de video de vigilancia: el modelo puede correlacionar eventos sonoros (cristales rotos, alarmas) con acciones visuales y establecer el orden temporal de los hechos, gracias al intercalado CRTE y al razonamiento temporal.
- Indexado y busqueda semantica de archivos audiovisuales: generar descripciones detalladas y anclajes temporales de videos largos para construir indices consultables por contenido sonoro y visual.
- Accesibilidad y subtitulado enriquecido: producir descripciones que integren dialogo, sonidos ambientales y acciones visuales para personas con discapacidad auditiva o visual.
- Moderacion de contenido en plataformas de video: detectar escenas donde la combinacion de audio y video resulta relevante (por ejemplo, musica y lenguaje visual asociados a contenido restringido).
- Analisis de reuniones y clases grabadas: responder preguntas sobre quien dijo que, cuando ocurrio y que se mostraba en pantalla, combinando ASR con comprension visual de la pizarra o presentacion.
- Investigacion en percepcion multimodal: servir como base para estudiar alineamiento audio-visual y razonamiento temporal en entornos academicos, dado que la licencia permite uso no comercial.
- Analisis de contenido musical y actuaciones en directo: relacionar eventos sonoros de una interpretacion con los gestos y movimientos visibles en el video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 8.742.888.688 parametros, en precision completa (fp16/bf16) los pesos ocupan aproximadamente 17,5 GB, a lo que hay que sumar el coste de los encoders de vision y audio y de las activaciones, especialmente con videos largos.
- GPU recomendadas: no especificadas por el autor; por tamano, GPUs de datacenter como A100 o H100 son las opciones naturales, y GPUs consumer de gama alta con suficiente VRAM podrian alojar los pesos en fp16, aunque el procesamiento de videos largos incrementa los requisitos.
- Cabe en consumer GPU: no confirmado; el repositorio ocupa 70,0 GB, por lo que la descarga completa requiere espacio en disco considerable.
- Opciones de despliegue: transformers (requiere el fork de AVF hasta que se fusione el PR upstream), con decodificacion de video y audio mediante torchcodec y FFmpeg. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-Labs-Audio-Visual Flamingo | 8.742.888.688 | no disponible | texto, imagen, audio, video | NVIDIA OneWay Noncommercial | Hugging Face, demo Gradio |
| Qwen2.5-7B (backbone) | ~7B | no disponible en esta ficha | texto | no disponible en esta ficha | Hugging Face |
| Modelos de la linea Audio Flamingo (predecesores) | no disponible | no disponible | audio (y texto) | no disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la informacion proporcionada para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Licencia NVIDIA OneWay Noncommercial License: uso restringido a investigacion no comercial; no apto para produccion comercial sin licencia adicional.
- Enfoque en ingles: la release esta orientada al idioma ingles, con soporte multilingue no garantizado.
- Generacion solo de texto: no incluye sintesis de voz (TTS) en streaming en los pesos del Hub.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado en escenarios multimodales donde la evidencia audio-visual puede ser ambigua o incompleta.
- Sesgos no documentados en la informacion disponible; al entrenarse sobre datos del mundo real, es probable que herede sesgos presentes en ellos.
- Longitud de contexto no especificada, lo que dificulta planificar el procesamiento de videos muy largos.
- Dependencia de un fork de transformers y de torchcodec/FFmpeg para la decodificacion, lo que anade complejidad de despliegue hasta que se fusione el PR upstream.
- No se han publicado resultados de benchmarks en la informacion disponible, por lo que el rendimiento real frente a alternativas no puede verificarse.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/nvidia/nemotron-labs-audio-visual-flamingo-hf
- Demo Gradio: https://huggingface.co/spaces/nvidia/nemotron-labs-audio-visual-flamingo
- Pagina del proyecto: https://avflamingo.pages.dev/
- Paper en arXiv: https://arxiv.org/abs/2607.16107
- Dataset AV-Skills: https://huggingface.co/datasets/nvidia/AV-Skills
- Repositorio de codigo: https://github.com/NVIDIA/audio-flamingo
- Fork de transformers con soporte AVF: https://github.com/lashahub/transformers/tree/add_AudioVisualFlamingo
- PR upstream de transformers: https://github.com/huggingface/transformers/pull/45586
- Guia de instalacion de torchcodec: https://github.com/meta-pytorch/torchcodec#installing-torchcodec

# nvidia/nemotron-labs-audio-visual-flamingo-hf

## Resumen

Nemotron-Labs-Audio-Visual Flamingo (AVF) es un modelo de lenguaje multimodal de gran tamano desarrollado por NVIDIA en colaboracion con la Universidad de Maryland, disenado para el razonamiento conjunto sobre audio, imagenes y video. El checkpoint publicado en Hugging Face (`nvidia/nemotron-labs-audio-visual-flamingo-hf`) es la version instruction-tuned orientada a la comprension de videos largos y complejos del mundo real, donde la respuesta depende tanto de lo visible como de lo audible: habla, sonidos de fondo, musica, acciones visuales, transiciones de escena y orden temporal.

El modelo extiende la linea Audio Flamingo desde la comprension puramente auditiva hacia el razonamiento audio-visual conjunto. Combina una torre de vision SigLIP para imagenes y fotogramas muestreados de video, preprocesado visual Dynamic-S2 para imagenes de alta resolucion y videos largos, un codificador de audio AF-Whisper para habla, sonido y musica, proyectores separados de 2 capas para caracteristicas visuales y auditivas, e intercalado temporal audio-visual con Constrained Rotary Time Embeddings (CRTE), todo sobre un backbone decoder-only de la familia Qwen2.5-7B.

Es relevante porque aborda un problema que los sistemas que procesan video y audio como flujos independientes no resuelven bien: la alineacion de eventos visuales y auditivos co-ocurrentes a lo largo del eje temporal. El modelo cuenta con 8.742.888.688 parametros totales segun los pesos en safetensors y un repositorio de 70,0 GB. La licencia es NVIDIA OneWay Noncommercial, por lo que su uso queda restringido a investigacion no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal audio-visual: torre de vision SigLIP + preprocesado Dynamic-S2 + codificador de audio AF-Whisper + proyectores de 2 capas + backbone decoder-only Qwen2.5-7B, con intercalado temporal y CRTE |
| Parametros totales | 8.742.888.688 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | NVIDIA OneWay Noncommercial License (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AVF es un modelo multimodal que combina varios componentes especializados sobre un backbone de lenguaje decoder-only de la familia Qwen2.5-7B. La parte visual emplea una torre SigLIP para imagenes y fotogramas de video muestreados, junto con un preprocesado visual Dynamic-S2 pensado para imagenes de alta resolucion y videos largos. La parte auditiva utiliza un codificador AF-Whisper que procesa habla, sonidos ambientales y musica. Las caracteristicas de ambas modalidades pasan por proyectores separados de 2 capas antes de integrarse en el espacio del modelo de lenguaje.

La innovacion tecnica central es el intercalado temporal audio-visual con Constrained Rotary Time Embeddings (CRTE): en lugar de tratar los fotogramas de video y el audio como flujos independientes, el modelo alinea fragmentos sincronizados de visual y audio, los intercala a lo largo del eje temporal y alimenta la secuencia fusionada al modelo de lenguaje. Esto permite atender a eventos visuales y auditivos que co-ocurren. El checkpoint publicado es AVF-Instruct, la release final de 2026-06-29. El modelo se entreno con el dataset `nvidia/AV-Skills`, que segun la model card contiene 7 millones de instancias de caption y QA. No se dispone de informacion detallada sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto condicionada por audio, imagen, video o combinaciones de las tres modalidades en una unica interfaz de chat-template.
- Comprension de video largo y complejo, incluyendo razonamiento temporal sobre orden de eventos, cambios de escena y contexto de largo alcance.
- Respuesta a preguntas sobre video (video QA) donde la evidencia auditiva y visual son relevantes de forma conjunta.
- Captioning detallado audio-visual de videos del mundo real.
- Alineacion de eventos audio-visuales, como identificar que sonido corresponde a un momento visual concreto.
- Razonamiento conjunto sobre habla, sonidos ambientales, musica y acciones visuales.
- Reconocimiento automatico de habla (ASR) y timestamp-grounding, segun los tags del modelo.
- Razonamiento multimodal y comprension de audio e imagen por separado.
- Generacion exclusivamente de texto: el streaming TTS no esta incluido en los pesos del Hub.
- No se dispone de informacion sobre soporte de tool calling, function calling o comportamiento agentico multi-paso en la informacion proporcionada.

## Casos de uso

- Analisis de reuniones y videoconferencias: el modelo puede procesar conjuntamente las diapositivas o video compartido y las voces de los participantes para generar resumenes que relacionen lo que se dice con lo que se muestra en pantalla, gracias a la alineacion temporal audio-visual con CRTE.
- Indexado y busqueda de archivos audiovisuales: permite generar descripciones detalladas de videos largos que combinan contenido visible y sonoro, utiles para construir indices de busqueda sobre footage de archivo o bibliotecas de medios.
- Moderacion de contenido en plataformas de video: al razonar de forma conjunta sobre lo que se ve y lo que se oye, puede detectar situaciones donde el audio o el contexto visual por separado no bastan para identificar contenido problematico.
- Subtitulado enriquecido y timestamp-grounding: el soporte de ASR y de anclaje temporal permite alinear transcripciones con momentos concretos del video y enriquecerlas con descripciones de eventos visuales y sonoros.
- Analisis de contenido musical y de entretenimiento: el codificador AF-Whisper y el razonamiento sobre musica permiten describir y relacionar eventos musicales con lo que ocurre en pantalla, util en catalogacion de conciertos, videoclips o retransmisiones.
- Investigacion en comprension audiovisual: el modelo, junto con el dataset AV-Skills y el benchmark TAVIT de razonamiento temporal audio-visual, sirve como base para experimentacion academica en alineacion multimodal y razonamiento temporal.
- Asistencia a la accesibilidad: generacion de descripciones audio-visuales combinadas que integren dialogo, sonidos relevantes y acciones visuales para personas con discapacidad auditiva o visual, dentro de los limites de la licencia no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 8.742.888.688 parametros, en precision completa (fp16/bf16) los pesos ocuparian aproximadamente 17,5 GB, a los que hay que sumar el coste de los codificadores SigLIP y AF-Whisper, los proyectores y el almacenamiento en cache KV para secuencias de video largas, por lo que el requisito real es sustancialmente mayor.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria esperar GPUs de datacenter como A100 o H100 para el modelo completo con margen para contexto de video largo.
- Cabe en GPU de consumo: no confirmado. Una GPU consumer de 24 GB (por ejemplo RTX 4090) podria no ser suficiente para el modelo completo en fp16 junto con los procesadores multimodales y secuencias largas, aunque no hay datos oficiales que lo confirmen.
- Opciones de despliegue: la model card indica que el soporte esta disponible a traves del fork de integracion de Transformers (`lashahub/transformers`, rama `add_AudioVisualFlamingo`) mientras el PR upstream esta pendiente. Requiere `accelerate`, `torch`, `torchaudio`, `librosa`, `soundfile`, `ffmpeg` y `libsndfile1`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Licencia NVIDIA OneWay Noncommercial: el modelo esta restringido a fines de investigacion no comercial. Cualquier uso comercial requiere verificar los terminos de la licencia con NVIDIA.
- Idioma: la release esta centrada en ingles (`en`); el rendimiento en castellano u otros idiomas no esta documentado.
- Generacion solo de texto: el checkpoint no incluye streaming TTS ni salida de audio.
- Riesgo de alucinacion: como modelo generativo multimodal, puede producir descripciones o respuestas no fundamentadas en el contenido real del video o audio; no se documentan tasas de error en la informacion disponible.
- Sesgos: no se dispone de informacion sobre evaluaciones de sesgo en la model card proporcionada.
- Integracion pendiente: el soporte en Transformers depende de un fork no oficial, lo que implica riesgo de incompatibilidad con versiones upstream y menor estabilidad en produccion.
- Longitud de contexto: no documentada, lo que dificulta planificar el procesamiento de videos de duracion extrema.
- Requisitos de sistema: necesita `ffmpeg` y `libsndfile1` para decodificar video y audio, y el flag `load_audio_in_video=True` para que un video aporte tanto fotogramas como pista de audio.
- Dependencia de datos de entrenamiento propietarios o no detallados: la composicion exacta del dataset AV-Skills y el volumen de tokens no estan documentados en la informacion disponible.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/nvidia/nemotron-labs-audio-visual-flamingo-hf
- Demo Gradio: https://huggingface.co/spaces/nvidia/nemotron-labs-audio-visual-flamingo
- Pagina del proyecto: https://avflamingo.pages.dev/
- Paper en arXiv: https://arxiv.org/abs/2607.16107
- Dataset AV-Skills: https://huggingface.co/datasets/nvidia/AV-Skills
- Repositorio de codigo: https://github.com/NVIDIA/audio-flamingo
- Fork de Transformers con soporte AVF: https://github.com/lashahub/transformers/tree/add_AudioVisualFlamingo

# chibubu/bingo

## Resumen

Bingo (chibubu/bingo) es la republicación en HuggingFace del modelo AudioVisualFlamingo (AVF) de NVIDIA, un modelo multimodal de 8.742.888.688 parámetros (~8,74B) especializado en comprensión conjunta de vídeo y audio, con pipeline de tipo video-text-to-text. A diferencia de los sistemas que procesan fotogramas y audio como flujos independientes, AVF alinea fragmentos sincronizados de imagen y sonido, los intercala a lo largo del eje temporal y alimenta la secuencia fusionada al modelo de lenguaje, lo que le permite atender a eventos visuales y auditivos co-ocurrentes.

Su arquitectura combina una torre de visión SigLIP con tiling multiescala Dynamic-S2, un codificador de audio estilo AF-Whisper (128 bins mel, 16 kHz) y un backbone decoder-only de la familia Qwen2.5-7B. Se ha entrenado con el dataset nvidia/AV-Skills y etapas de contexto largo que alcanzan los 32K tokens para vídeos de hasta 15 minutos.

Es relevante porque ofrece una única interfaz de chat para imagen, audio, vídeo y texto, con capacidades de ASR, grounding temporal por marcas de tiempo y razonamiento audiovisual, un área donde hay pocos modelos abiertos. Su licencia restringe el uso a investigación no comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | AudioVisualFlamingo: SigLIP (visión) + AF-Whisper (audio) + proyectores MLP + Qwen2.5-7B (LLM) |
| Parámetros totales | 8.742.888.688 (dato real de safetensors) |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 32K tokens (en etapas de contexto largo) |
| Tipos de cuantización | No disponible (el tamaño del repo, 17,5 GB para 8,74B parámetros, es coherente con pesos en bfloat16) |
| Idiomas soportados | Inglés |
| Licencia | Other: uso exclusivo para investigación no comercial |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

AVF se compone de cuatro bloques. El codificador visual es una torre SigLIP con procesamiento de imagen a 448x448 y tiling multiescala Dynamic-S2 (hidden_size de 1152 en la configuración publicada). El codificador de audio sigue el estilo AF-Whisper: recibe audio mono a 16 kHz, extrae 128 bins log-mel y procesa el sonido en ventanas de 30 segundos, con chunking para audios largos (`audio_chunk_length="max_3600"`). Proyectores MLP independientes para visión y audio mapean las salidas de ambos codificadores al tamaño oculto del LLM. La fusión temporal intercala fragmentos sincronizados de vídeo y audio a lo largo del eje temporal, aumentados con la técnica CRTE (los tags también mencionan TAVIT, aunque la model card no detalla este componente). El modelo de lenguaje es un decoder-only de la familia Qwen2.5-7B encargado del razonamiento multimodal y la generación de texto.

Sobre el entrenamiento, la model card indica que es un modelo instruction-tuned entrenado con el dataset nvidia/AV-Skills, e incluye etapas de contexto largo diseñadas para vídeos de hasta 15 minutos con 32K tokens de ventana. El número de tokens de preentrenamiento, la composición detallada del corpus y el uso de técnicas como RLHF o DPO no están disponibles en la información proporcionada.

## Capacidades

- Respuesta a preguntas sobre vídeo cuando importan tanto la evidencia visual como la auditiva.
- Subtitulado detallado audiovisual de vídeos reales, cubriendo escena, habla, sonidos y música.
- Razonamiento temporal sobre orden de eventos, cambios de escena y contexto de largo alcance.
- Alineación de eventos audiovisual: identificar qué sonido corresponde a qué momento visual.
- Razonamiento conjunto sobre habla, sonidos ambientales, música y acciones visuales.
- Transcripción de habla (ASR) con grounding por marcas de tiempo.
- Interfaz de chat unificada que acepta imagen, audio, vídeo y texto en una misma conversación.
- Procesamiento de vídeos largos: hasta 128 fotogramas muestreados por defecto y audio en ventanas de 30 segundos.

## Casos de uso

- Análisis de vídeo con evidencia audiovisual: en videovigilancia o grabaciones de incidentes, el modelo puede responder preguntas que requieren correlacionar un sonido (una rotura de cristal, una alarma) con el momento visual exacto, citando timestamps.
- Subtitulado y accesibilidad: generación de descripciones detalladas que combinan escena, diálogo y música, útil para audiodescripción de contenido y para indexar bibliotecas de vídeo por contenido audiovisual.
- Razonamiento temporal en vídeos largos: ordenar cronológicamente los eventos principales de una grabación de hasta 15 minutos con sus evidencias, aplicable a resúmenes automáticos, detección de highlights deportivos o revisión de grabaciones de reuniones.
- Control de calidad de sincronización: verificar si el audio y los visuals están alineados en doblajes, emisiones en directo o producciones audiovisuales, pidiendo al modelo que mencione transiciones de escena y timestamps clave.
- Transcripción con contexto visual: transcribir el habla de una entrevista o clase y relacionarla con lo que ocurre en pantalla (diagramas, gestos, objetos), algo que un ASR puro no puede hacer.
- Investigación en percepción multimodal: como modelo instruction-tuned sobre nvidia/AV-Skills, sirve como base para experimentos de alineación audiovisual, grounding temporal y evaluación de razonamiento de largo alcance en vídeo.
- Asistente multimodal en un solo turno: combinar una imagen de referencia, un fichero de audio y un vídeo en el mismo prompt para responder qué aporta el audio que no es evidente en los frames.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan 17,5 GB; a esto hay que sumar activaciones de los codificadores de visión y audio y la caché KV. Estimación realista: mínimo 24 GB de VRAM, siendo más cómodo disponer de 40-48 GB para vídeos largos con 128 frames y contexto extenso.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) como mínimo viable; A100 40 GB, L40S o RTX 6000 Ada/A6000 (48 GB) para cargas de vídeo largo con holgura.
- Consumer GPU: cabe en una RTX 4090/3090 de 24 GB en bf16 con contexto moderado, pero queda justo con 128 frames y audio largo. No se han publicado versiones cuantizadas, por lo que no es viable ejecutarlo en tarjetas de 12-16 GB.
- Despliegue: únicamente mediante la librería Transformers a través del fork de integración AVF (`AudioVisualFlamingoForConditionalGeneration`), mientras el PR upstream está pendiente. Requiere `ffmpeg`, `libsndfile1`, `torch`, `torchaudio`, `librosa` y `soundfile`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y no existen pesos en GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Modalidades | Contexto | Licencia |
|---|---|---|---|---|
| bingo (AVF) | 8,74B | Imagen, vídeo, audio, texto | 32K | Investigación no comercial |
| Qwen2.5-Omni-7B | ~10,7B totales (Thinker-Talker) | Imagen, vídeo, audio, texto (con salida de voz) | 32K | Apache 2.0 |
| Video-LLaVA-7B | ~7B (Vicuna-1.5) | Imagen, vídeo, audio (LanguageBind) | 4K | Apache 2.0 |

Frente a Qwen2.5-Omni-7B, AVF apuesta por una fusión temporal explícita de chunks audiovisuales sincronizados en lugar de tratar las modalidades como flujos paralelos, y está optimizado para vídeo largo (hasta 15 minutos), pero carece de salida de voz y su licencia impide uso comercial. Frente a Video-LLaVA-7B, ofrece un contexto mucho mayor (32K frente a 4K) y un pipeline de vídeo-audio más sofisticado, a costa de requisitos de VRAM superiores y una integración menos madura en el ecosistema.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo y sus recursos se publican solo para investigación no comercial; cualquier producto o servicio comercial queda excluido. Los usuarios finales son responsables de aplicar salvaguardas, controles de privacidad y evaluaciones específicas de dominio.
- Limitación de idioma: según la model card, el modelo está soportado en inglés; no hay garantías de rendimiento en castellano ni otros idiomas.
- Vídeos muy largos y densos siguen siendo un reto: el entrenamiento de contexto largo cubre hasta 15 minutos y 32K tokens, y fuera de ese rango la calidad puede degradarse.
- El prompting es determinante: la model card recomienda pedir explícitamente evidencia audiovisual, timestamps, transiciones de escena u orden temporal cuando esos detalles importan; prompts genéricos pueden omitir esa información.
- Dependencia de un fork de Transformers: el soporte vive en una rama de integración mientras el PR upstream está pendiente, lo que introduce riesgo de ruptura en actualizaciones y de mantenimiento a medio plazo.
- Riesgo de alucinación: como en todo modelo audiovisual generativo, puede atribuir sonidos a eventos visuales incorrectos o inventar contenido no presente en la pista de audio; se recomienda verificar las salidas en flujos críticos.
- Procedencia del repositorio: la ficha analizada (chibubu/bingo) parece un espejo del modelo oficial de NVIDIA referenciado en el código de ejemplo; conviene verificar la integridad y procedencia de los pesos antes de usarlos, y preferir el repositorio oficial cuando esté disponible.
- Madurez comunitaria: 0 descargas y 0 likes en el momento de la ficha; no existe validación comunitaria ni benchmarks públicos que respalden su rendimiento.

## Enlaces

- Ficha del modelo: https://huggingface.co/chibubu/bingo
- Modelo oficial referenciado en el código de ejemplo: https://huggingface.co/nvidia/nemotron-labs-audio-visual-flamingo-hf
- Dataset de entrenamiento (nvidia/AV-Skills): https://huggingface.co/datasets/nvidia/AV-Skills
- Fork de Transformers con soporte AVF (rama `add_AudioVisualFlamingo`): https://github.com/lashahub/transformers
- Diagrama de arquitectura incluido en el repositorio: `static/avf_architecture.png` (dentro de la ficha del modelo)

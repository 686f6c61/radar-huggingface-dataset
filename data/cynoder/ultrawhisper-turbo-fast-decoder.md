# Cynoder/ultrawhisper-turbo-fast-decoder

## Resumen

UltraWhisper fast-mode decoder es un conjunto de pesos del decodificador de Whisper large-v3-turbo, ajustado específicamente para su uso dentro del motor de inferencia UltraWhisper en su modo rápido. Lo desarrolla el usuario Cynoder como componente complementario de dicho motor. El problema que resuelve es concreto: el modo rápido de UltraWhisper calcula el codificador solo para los fotogramas que cubren los clips de cada lote y reutiliza estados del codificador en caché para el relleno hasta 30 segundos, lo que con el decodificador original de Whisper introduce una degradación de aproximadamente 0,4 puntos de WER. Este decodificador fine-tuneado recupera buena parte de esa precisión sin renunciar al rendimiento del modo rápido.

El modelo no es un sistema ASR completo: contiene únicamente los tensores entrenados (capas del decodificador y la LayerNorm final). Los embeddings de token y de posición permanecen sin cambios respecto a `openai/whisper-large-v3-turbo`. Por tanto, no puede usarse de forma autónoma con `transformers` o `whisper.cpp` sin sustituir los pesos del decodificador en un checkpoint completo del modelo base.

Con 104.947.200 parámetros en safetensors y un repositorio de 0,2 GB, es un artefacto ligero orientado a producción de ASR en inglés de alto throughput. Su interés actual radica en que combina una licencia MIT con un rendimiento medido de 543,8 RTFx y un WER medio de 7,88 en seis conjuntos de test del Open ASR Leaderboard, cifras que lo sitúan cerca de TensorRT-LLM 1.2.1 (7,59) con casi cinco veces más throughput.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo); este repositorio contiene solo el decodificador |
| Parametros totales | 104.947.200 (solo tensores del decodificador y LayerNorm final) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de audio de 30 s inherente a Whisper) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Entrenado con audio en inglés; no se declaran otros idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `openai/whisper-large-v3-turbo`, un transformer encoder-decoder con decodificador reducido a 4 capas. Este repositorio sustituye exclusivamente las capas del decodificador y la LayerNorm final; los embeddings de token y de posición se mantienen idénticos al modelo original. La innovación no está en la arquitectura sino en el acoplamiento con el motor UltraWhisper: el modo rápido calcula el codificador solo para los fotogramas que cubren los clips de cada lote y reutiliza estados en caché para el relleno de 30 segundos, lo que reduce cómputo pero introduce un desajuste entre los estados del codificador vistos en entrenamiento y los vistos en inferencia.

Para corregir ese desajuste, el decodificador se fine-tuneó sobre salidas del codificador en modo rápido usando el motor preciso como profesor. La destilación es a nivel de logits: pérdida KL contra el profesor más entropía cruzada sobre sus tokens, durante 3 épocas con learning rate 2e-5. El conjunto de entrenamiento son 45 horas de audio abierto en inglés, restringido a los splits de train de LibriSpeech, VoxPopuli, AMI y People's Speech. No se menciona RLHF ni DPO.

## Capacidades

- Reconocimiento automático de habla en inglés sobre audio de hasta 30 segundos por clip, heredado de Whisper large-v3-turbo.
- Decodificación de transcripciones con marcas de tiempo y segmentación, sujeto a las capacidades del modelo base.
- Funcionamiento en modo rápido dentro de UltraWhisper con reutilización de estados del codificador en caché.
- Throughput alto: 543,8 RTFx en una NVIDIA L4 con el mismo contenedor que la línea base de TensorRT-LLM.
- No incluye capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento explícito.
- Capacidades multilingües no declaradas; el ajuste se realizó solo con audio en inglés.

## Casos de uso

- Transcripción por lotes de gran volumen: con 543,8 RTFx en una L4, un solo acelerador puede procesar horas de audio en minutos; adecuado para archivos de podcasts, reuniones o llamadas almacenadas.
- Subtitulado automático de vídeo en inglés: el modelo base Whisper genera marcas de tiempo y segmentos, y el modo rápido de UltraWhisper permite procesar catálogos completos con coste computacional reducido.
- Servicio de transcripción en tiempo casi real: al reutilizar estados del codificador en caché para el relleno de 30 segundos, se evita recalcular el codificador completo en cada clip corto, lo que reduce la latencia por petición.
- Pipelines de análisis de audio a escala: integrado en un motor con API Python (`ultrawhisper.engine.Engine`), se puede encadenar con etapas de diarización o búsqueda semántica sobre las transcripciones.
- Evaluación comparativa de motores ASR: sirve como referencia para medir la penalización de precisión del modo rápido frente al preciso (7,88 frente a 7,80 de WER medio) en despliegues con restricciones de cómputo.
- Investigación en destilación de decodificadores: el enfoque de destilación a nivel de logits sobre estados del codificador en caché es replicable para otros modelos encoder-decoder con relleno fijo.

## Benchmarks y rendimiento

Resultados sobre seis conjuntos de test del Open ASR Leaderboard, una NVIDIA L4, mismo contenedor que la línea base de TensorRT-LLM:

| Motor | RTFx | WER medio | WER excl. VoxPopuli |
|---|---:|---:|---:|
| UltraWhisper fast, este decodificador | 543,8 | 7,88 | 8,47 |
| UltraWhisper fast, decodificador original | 543,8 | 8,29 | 8,67 |
| UltraWhisper accurate | 162,9 | 7,80 | 8,36 |
| TensorRT-LLM 1.2.1 | 115,5 | 7,59 | 8,35 |

El ajuste reduce el WER medio del modo rápido en 0,41 puntos y el WER excluyendo VoxPopuli en 0,20 puntos, sin coste de throughput. Frente al motor preciso, la diferencia se reduce a 0,08 puntos de WER medio con 3,3 veces más RTFx.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; el repositorio pesa 0,2 GB y contiene solo el decodificador, por lo que el consumo real depende de cargar el checkpoint completo de Whisper large-v3-turbo junto con los estados del codificador en caché.
- GPU de referencia en las mediciones: NVIDIA L4.
- Compatibilidad con GPU de consumo: no confirmada; el motor UltraWhisper y sus requisitos no se detallan en la información disponible.
- Opciones de despliegue: exclusivamente mediante UltraWhisper (`ultrawhisper.engine.Engine` con `decoder_state="hf://Cynoder/ultrawhisper-turbo-fast-decoder"`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 543,8 RTFx en una L4 con el modo rápido; 162,9 RTFx con el motor preciso de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER medio (Open ASR LB, 6 sets) | RTFx (L4) | Licencia |
|---|---|---:|---:|---:|---|
| UltraWhisper fast + este decodificador | 104,9 M (solo decodificador) | 30 s de audio | 7,88 | 543,8 | MIT |
| UltraWhisper fast + decodificador original | 104,9 M (solo decodificador) | 30 s de audio | 8,29 | 543,8 | MIT |
| UltraWhisper accurate | No disponible | 30 s de audio | 7,80 | 162,9 | MIT |
| TensorRT-LLM 1.2.1 | No disponible | 30 s de audio | 7,59 | 115,5 | No disponible |

La comparación se limita a las variantes del propio motor UltraWhisper y a TensorRT-LLM, que son las referencias incluidas en la model card. No se proporcionan datos frente a otros modelos ASR como Whisper large-v3-turbo sin ajuste, Distil-Whisper o Canary.

## Limitaciones y advertencias

- No es un modelo autónomo: solo contiene los tensores del decodificador y la LayerNorm final; requiere el resto del checkpoint de `openai/whisper-large-v3-turbo` y el motor UltraWhisper para funcionar.
- Entrenado únicamente con 45 horas de audio en inglés (LibriSpeech, VoxPopuli, AMI, People's Speech); el rendimiento en otros idiomas o en dominios acústicos alejados de esos corpus no está evaluado.
- El ajuste está optimizado para el modo rápido de UltraWhisper; usarlo con el modo preciso o con otro motor puede degradar la precisión respecto al decodificador original.
- Riesgo de alucinación inherente a Whisper en segmentos con silencio, ruido o habla solapada; no se documentan mitigaciones específicas.
- Sesgos demográficos y acústicos heredados de los corpus de entrenamiento; no se incluye análisis de sesgo.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base Whisper large-v3-turbo conserva su propia licencia, que debe verificarse por separado.
- Sin descargas ni validación comunitaria en el momento de la consulta (0 descargas, 0 likes), lo que limita la evidencia independiente sobre su comportamiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Cynoder/ultrawhisper-turbo-fast-decoder
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- TensorRT-LLM: https://github.com/NVIDIA/TensorRT-LLM
- Repositorio de UltraWhisper: no disponible en la información proporcionada

# kaitemoreau/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B

## Resumen

NVIDIA-Nemotron-3.5-Transcribe-30B-A4B es un modelo de voz y audio de pesos abiertos desarrollado por NVIDIA, distribuido en Hugging Face a traves del repositorio de kaitemoreau. Se trata de un Speech-Augmented Language Model (SALM) disenado para transcripcion multilingue en 40 idiomas, traduccion de voz, transcripcion contextual, diarizacion con atribucion de hablante, prediccion de timestamps, identificacion de idioma y respuesta a preguntas sobre audio. El modelo admite grabaciones de hasta una hora de duracion gracias a una ventana de contexto de 65.536 tokens.

Arquitectonicamente es un hibrido Mamba-2/Transformer con mezcla de expertos (MoE) y un codificador paralelo de expertos que combina un encoder ASR de tipo Transformer con un encoder de hablante. Con 34.000 millones de parametros totales y aproximadamente 4.300 millones activos (incluyendo el encoder de audio), ofrece un coste de inferencia propio de un modelo mucho mas pequeno. Deriva del modelo base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 mediante fine-tuning.

Su relevancia actual reside en que unifica en un solo modelo tareas que tradicionalmente requerian pipelines separados (ASR, diarizacion, traduccion, QA sobre audio) manteniendo licencia permisiva para uso comercial (OpenMDW-1.1) y variantes cuantizadas en FP8 y NVFP4 para despliegue eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2 / Transformer hibrido con MoE y Parallel Expert Encoder (encoder ASR Transformer + encoder de hablante) |
| Parametros totales | 34B (33.697.781.029 segun safetensors) |
| Parametros activos | Aproximadamente 4,3B (incluyendo el encoder de audio) |
| Longitud de contexto | 65.536 tokens; grabaciones de hasta 1 hora |
| Tipos de cuantizacion | BF16 (referencia), FP8, NVFP4 |
| Idiomas soportados | 40 idiomas: cs, nl, en, fr, de, hi, it, ko, pl, pt, ru, sk, es, bg, hr, da, et, fi, hu, ja, lv, lt, ro, sl, sv, th, tr, uk, ar, bn, zh, el, he, id, mt, mr, tl, ta, te, vi |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial permitido) |
| Formato de pesos | safetensors (libreria NeMo) |

## Arquitectura y entrenamiento

El modelo combina un backbone de lenguaje hibrido Mamba-2/Transformer con capas de mezcla de expertos, lo que permite activar solo unos 4,3B de parametros por token pese a contar con 34B totales. Sobre ese backbone se acopla un Parallel Expert Encoder formado por un encoder ASR de tipo Transformer y un encoder de hablante, que aportan las representaciones acusticas necesarias para transcripcion y diarizacion. Esta separacion permite que el mismo modelo aborde tareas de reconocimiento de voz, atribucion de hablante y comprension de audio sin pipelines independientes.

El entrenamiento se realizo sobre el dataset nvidia/Granary-v2 y la mezcla incluye tareas de transcripcion multilingue, traduccion de voz, transcripcion contextual, transcripcion con atribucion de hablante, transcripcion enriquecida, prediccion de timestamps, identificacion de idioma y audio question answering. Ademas, se incorporo una cantidad reducida de instrucciones de texto y tareas de etiquetado/redaccion de PII. El modelo parte de nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 mediante fine-tuning supervisado; no se detalla en la informacion disponible si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Transcripcion automatica de voz (ASR) multilingue en 40 idiomas.
- Traduccion de voz (speech translation) entre idiomas soportados.
- Transcripcion contextual: admite contexto textual adicional para mejorar el reconocimiento de terminos especificos.
- Transcripcion con atribucion de hablante (speaker-attributed transcription) y diarizacion.
- Transcripcion enriquecida (rich transcription) con informacion adicional estructurada.
- Prediccion de timestamps a nivel de segmento o palabra.
- Identificacion de idioma (language identification) y soporte de code-switching.
- Audio question answering: responder preguntas en lenguaje natural sobre el contenido de un audio.
- Procesamiento de audio de formato largo: grabaciones de hasta una hora en una sola pasada.
- Seguimiento de instrucciones en lenguaje natural para controlar el estilo y formato de la salida.
- Etiquetado y redaccion de PII (informacion personal identificable).
- Capacidad residual de seguir instrucciones de texto (entrenada con una mezcla menor).

## Casos de uso

- Transcripcion de reuniones y actas automaticas: el modelo procesa grabaciones de hasta una hora con contexto de 65.536 tokens, predice timestamps y atribuye cada intervencion a su hablante, lo que permite generar actas estructuradas directamente.
- Subtitulado y localizacion de contenido audiovisual: combinando ASR, timestamps y traduccion de voz, se pueden generar subtitulos en otro idioma en una sola pasada sin pipeline separado de traduccion.
- Analisis de llamadas de atencion al cliente: la diarizacion y la transcripcion contextual permiten distinguir agente y cliente, identificar terminos del dominio y alimentar sistemas de QA o scoring de calidad.
- Documentacion clinica o legal dictada: la transcripcion contextual admite vocabulario especializado y el etiquetado de PII facilita la redaccion de datos sensibles antes de almacenar las transcripciones.
- Indexacion y busqueda semantica de archivos de audio: la transcripcion con timestamps e identificacion de idioma permite construir indices buscables sobre archivos de audio multilingues de gran duracion.
- Investigacion en linguistica y analisis de code-switching: el soporte de 40 idiomas y de cambio de codigo permite estudiar corpus multilingues reales sin necesidad de modelos especificos por par de idiomas.
- Asistentes de accesibilidad: transcripcion en tiempo casi real de audio a texto con atribucion de hablante para personas con discapacidad auditiva en entornos multilingues.
- QA sobre grabaciones: un usuario puede formular preguntas en lenguaje natural sobre el contenido de una grabacion larga (por ejemplo, "que se decidio sobre el presupuesto") y obtener respuestas basadas en el audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 67,5 GB de pesos, por lo que se necesitan del orden de 70-80 GB de VRAM para cargar el modelo completo con overhead de activaciones y cache KV.
- Variante FP8: reduce el peso a unos 34 GB, permitiendo despliegue en una GPU de 48 GB o en dos de 24 GB.
- Variante NVFP4: reduce el peso a aproximadamente 17-20 GB, lo que permite ejecucion en GPUs consumer de gama alta (RTX 4090 de 24 GB) con margen limitado.
- GPUs recomendadas: H100 (80 GB) o A100 (80 GB) para BF16; L40S (48 GB) o A6000 (48 GB) para FP8; RTX 4090 (24 GB) para NVFP4.
- Cabe en GPU consumer: si, en RTX 4090 o RTX 5090 con la variante NVFP4; en BF16 no cabe en ninguna GPU consumer actual.
- Opciones de despliegue: NeMo Speech (libreria nativa del modelo), SGLang-Omni (cookbook especifico disponible), y potencialmente vLLM o TGI si incorporan soporte para la arquitectura Mamba-2/MoE; llama.cpp y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al activar solo 4,3B parametros, se espera un throughput superior al de un modelo denso de 34B, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Transcribe-30B-A4B | 34B totales / 4,3B activos | 65.536 tokens | 40 | OpenMDW-1.1 | ASR, diarizacion, traduccion, QA sobre audio |
| Whisper large-v3 (OpenAI) | 1,55B | 30 s por ventana | ~99 | MIT | Solo ASR y traduccion, sin diarizacion ni QA |
| Qwen2-Audio (Alibaba) | 8,2B | no disponible | multilingue | Apache 2.0 | Audio understanding y ASR, sin contexto de 1 hora |
| SeamlessM4T v2 (Meta) | 2,3B | no disponible | ~100 | CC-BY-NC 4.0 | Traduccion de voz, licencia no comercial |

La comparativa con Whisper, Qwen2-Audio y SeamlessM4T se ofrece como referencia de categoria; no se dispone de resultados de benchmarks comparativos directos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo offline: procesa grabaciones completas, no esta disenado para streaming en tiempo real segun la informacion disponible.
- Riesgo de alucinacion en pasajes de audio con ruido, silencios largos o habla solapada; conviene validar las transcripciones en entornos de produccion.
- La cobertura de 40 idiomas no implica calidad uniforme; el rendimiento puede variar significativamente entre idiomas de altos y bajos recursos.
- La diarizacion y la atribucion de hablante pueden fallar en grabaciones con muchos hablantes o voces similares.
- El etiquetado y redaccion de PII es una capacidad auxiliar entrenada con una mezcla menor; no debe considerarse una garantia de cumplimiento normativo.
- Licencia OpenMDW-1.1: permite uso comercial, pero conviene revisar los terminos completos en el enlace oficial antes de desplegar en produccion.
- El repositorio distribuido por kaitemoreau tiene 0 descargas y 0 likes en el momento de la consulta; se recomienda verificar la procedencia frente al repositorio oficial de NVIDIA.
- El modelo base es nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16; los pesos aqui publicados son un fine-tuning, no la version oficial de NVIDIA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kaitemoreau/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Variante FP8: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-FP8
- Variante NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-NVFP4
- Pagina de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- NeMo Speech (GitHub): https://github.com/NVIDIA-NeMo/Speech
- Informe tecnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Transcribe-Technical-Report.pdf
- Demo en vivo: https://huggingface.co/spaces/nvidia/nemotron-transcribe
- Cookbook SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/nemotron_transcribe.html
- Dataset Granary-v2: https://huggingface.co/datasets/nvidia/Granary-v2
- Paper SALM: https://arxiv.org/abs/2310.09424
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk

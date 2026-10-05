# google/DiarizationLM-Gemma-4-E4B-v1

## Resumen

DiarizationLM-Gemma-4-E4B-v1 es un modelo de lenguaje desarrollado por Google para el post-procesado de salidas de reconocimiento automático de voz (ASR) y de diarización de hablantes. Se construye sobre el modelo fundacional Gemma 4 E4B y se ajusta con la técnica de "Locality-Preserving Oracle Supervision" descrita en el marco DiarizationLM (arXiv:2401.03506), con el objetivo de corregir límites de turno, backchannels y transferir etiquetas de hablante manteniendo el texto transcrito intacto.

El modelo se entrena sobre los cuatro corpus canónicos de diarización (Fisher, Callhome, ICSI y AMI), lo que lo diferencia de versiones anteriores centradas únicamente en conversaciones telefónicas de dos hablantes. La arquitectura base declara 42 capas, tamaño oculto de 2.560, atención híbrida 5:1 de ventana deslizante y global, y un vocabulario de 262.144 tokens. El repositorio contiene pesos fusionados en bfloat16 y versiones GGUF de 4 bits.

Su relevancia actual radica en que consigue mejoras estadísticamente significativas (p < 0,0001) en WDER y cpWER de forma simultánea en los cuatro benchmarks frente al baseline, con la mitad de parámetros declarados que la variante anterior basada en Llama 3 8B. No obstante, Google indica explícitamente que no es un producto oficialmente soportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de Gemma 4 E4B: 42 capas, hidden size 2.560, atencion hibrida 5:1 (sliding-window y global), vocabulario de 262.144 tokens; ajuste LoRA de rango 256 fusionado en los pesos base |
| Parametros totales | 7.996.156.490 (~8,0B) segun los pesos safetensors; la model card describe el modelo base como "4B dense parameters" (nomenclatura E4B, 4B efectivos) |
| Parametros activos | No aplica (modelo denso); el sufijo E4B hace referencia a parametros efectivos, no a un esquema MoE |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento usa una longitud maxima de secuencia de 2.560 tokens y segmentacion de prompt de 4.000 caracteres |
| Tipos de cuantizacion | bfloat16 (pesos fusionados), GGUF Q4_K_M (con attn_v, ffn_down y embeddings en Q6_K) y GGUF Q4_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, ~16,0 GB), GGUF (Q4_K_M ~5,30 GB; Q4_0 ~5,15 GB); config.json, generation_config.json, tokenizer.json, tokenizer_config.json, processor_config.json, chat_template.jinja, special_tokens_map.json |

## Arquitectura y entrenamiento

La base es Gemma 4 E4B, un transformer decoder de 42 capas con tamaño oculto 2.560 y un esquema de atención híbrida 5:1 que combina capas de ventana deslizante con capas de atención global. El vocabulario es de 262.144 tokens. El ajuste se realiza mediante un adaptador LoRA de rango r = 256 aplicado a todas las proyecciones de atención (q_proj, k_proj, v_proj, o_proj), a las proyecciones MLP (gate_proj, up_proj, down_proj) y a las proyecciones de entrada por capa (per_layer_input_gate, per_layer_projection, per_layer_model_projection); el adaptador se fusiona después en los pesos base de 16 bits y se serializa a GGUF de 4 bits.

El objetivo de entrenamiento es una entropía cruzada de solo completado con el formato `<prompt> --> <completion> [eod]`. El corpus consta de 51.063 pares prompt-completion de Fisher y 20.762 pares multi-corpus (Callhome, ICSI y AMI) con objetivos oracle que preservan la localidad: se corrigen límites de turno léxicos y backchannels de entre 1 y 5 palabras (1 ≤ L ≤ 5) mientras se mantienen los anclajes acústicos de hablante en monólogos largos (L ≥ 6 palabras). La optimización se llevó a cabo durante 10.000 pasos con batch global de 8, AdamW (beta1 = 0,9, beta2 = 0,99), learning rate pico de 1,5e-4, warmup lineal de 500 pasos y decaimiento coseno, sobre 8 chips TPU v5p de Google Cloud.

## Capacidades

- Post-procesado de transcripciones ASR: corrección de límites de turno y de backchannels preservando el contenido léxico original.
- Diarización de hablantes: transferencia de etiquetas de hablante sobre la transcripción mediante `transfer_llm_completion` (Transcript-Preserving Speaker Transfer).
- Manejo de conversaciones telefónicas de 2 hablantes (Fisher) y de 2 a 5 hablantes (Callhome).
- Manejo de reuniones de 3 a 9 hablantes (ICSI) y de 4 hablantes en configuración de mesa (AMI).
- Corrección de deriva de identidad de hablante en monólogos largos, gracias a los objetivos de supervisión que preservan la localidad.
- Estimación implícita del número de hablantes, evaluada mediante SpkCntMAE.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling y uso agéntico: no disponibles en la información proporcionada.
- Modalidad declarada en el repositorio como image-text-to-text, con etiquetas de speech y speaker-diarization; no se documentan capacidades de visión en la información disponible.
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Post-procesado de transcripciones en centros de atención telefónica: el modelo corrige los límites de turno y las etiquetas de hablante sobre la salida de un ASR previo, manteniendo el texto intacto; está entrenado específicamente sobre Fisher y Callhome, los corpus de referencia para habla telefónica conversacional.
- Actas automáticas de reuniones corporativas y académicas: con soporte para 3 a 9 hablantes (ICSI) y reuniones de mesa de 4 participantes (AMI), permite generar transcripciones atribuidas sin reorganizar el contenido léxico.
- Subtitulado con etiquetado de hablante: se puede insertar como etapa final del pipeline de subtitulado para asignar cada línea a su interlocutor correcto antes de la emisión.
- Investigación cualitativa y análisis de entrevistas: la corrección de backchannels (1 a 5 palabras) es crítica en entrevistas semiestructuradas, donde las interjecciones del entrevistador suelen atribuirse erróneamente al entrevistado.
- Documentación clínica y legal con múltiples intervinientes: en visitas o vistas con varios participantes, el modelo reduce el coste de revisión manual al corregir la atribución de hablante sobre la transcripción ya generada.
- Integración en pipelines de transcripción existentes: la librería `diarizationlm` y la función `transfer_llm_completion` permiten insertar el modelo como etapa de refinado sobre la salida de un sistema de diarización acústica como USM + turn-to-diarize.
- Auditoría de llamadas y cumplimiento normativo: el etiquetado fiable de hablante facilita la separación de intervenciones del agente y del cliente en grabaciones de contact center.
- Despliegue en entornos sin GPU de gama alta: las versiones GGUF Q4_K_M (5,30 GB) y Q4_0 (5,15 GB) permiten ejecutar el modelo localmente con llama.cpp, Ollama o llama-cpp-python.

## Benchmarks y rendimiento

Métricas micro-promediadas sobre los conjuntos completos de evaluación, con baseline USM + turn-to-diarize y puntuación mediante programación dinámica con emparejamiento húngaro (`diarizationlm.compute_metrics_on_json_dict`). Los rangos entre corchetes son intervalos de confianza del 95 % por bootstrap no paramétrico (B = 10.000 remuestreos a nivel de conversación).

| Benchmark | Split | WER (%) | Sistema | WDER (%) [IC 95 %] | cpWER (%) [IC 95 %] | SpkCntMAE [IC 95 %] | ΔWDER pareado (p-valor) |
|---|---|---|---|---|---|---|---|
| Fisher | TEST FULL (172 sesiones) | 15,37 | Baseline (USM + Turn-to-Diarize) | 5,32 [4,93; 5,74] | 20,88 [19,97; 21,88] | 0,215 [0,151; 0,291] | --- |
| Fisher | TEST FULL (172 sesiones) | 15,37 | DiarizationLM-8b-Fisher-v2 (Llama 3 8B) | 3,28 | 18,37 | --- | --- |
| Fisher | TEST FULL (172 sesiones) | 15,37 | DiarizationLM-Gemma-4-E4B-v1 (E4B) | 2,99 [2,65; 3,37] | 17,62 [16,76; 18,56] | 0,093 [0,047; 0,145] | -2,33 % [-2,51; -2,16] (p < 0,0001) |
| Callhome | TEST FULL (20 llamadas) | 15,22 | Baseline (USM + Turn-to-Diarize) | 7,74 [6,07; 9,65] | 24,31 [21,27; 27,43] | 0,050 [0,000; 0,150] | --- |
| Callhome | TEST FULL (20 llamadas) | 15,22 | DiarizationLM-8b-Fisher-v2 (Llama 3 8B) | 6,66 | 23,57 | --- | --- |
| Callhome | TEST FULL (20 llamadas) | 15,22 | DiarizationLM-Gemma-4-E4B-v1 (E4B) | 4,92 [3,46; 6,75] | 20,69 [17,98; 23,66] | 0,000 [0,000; 0,000] | -2,82 % [-3,48; -2,14] (p < 0,0001) |
| ICSI | TEST FULL (3 reuniones) | 29,42 | Baseline (USM + Turn-to-Diarize) | 14,70 [11,65; 20,29] | 43,90 [39,10; 51,67] | 0,333 [0,000; 1,000] | --- |
| ICSI | TEST FULL (3 reuniones) | 29,42 | DiarizationLM-Gemma-4-E4B-v1 (E4B) | 14,10 [10,77; 19,94] | 43,32 [38,38; 51,20] | 0,333 [0,000; 1,000] | -0,60 % [-0,88; -0,35] (p < 0,0001) |
| AMI | TEST WORD FULL (16 reuniones) | 24,33 | Baseline (USM + Turn-to-Diarize) | 15,68 [10,64; 21,11] | 40,32 [32,43; 48,00] | 0,500 [0,188; 0,812] | --- |
| AMI | TEST WORD FULL (16 reuniones) | 24,33 | DiarizationLM-Gemma-4-E4B-v1 (E4B) | 14,89 [9,80; 20,38] | 39,57 [31,57; 47,29] | 0,438 [0,188; 0,750] | -0,79 % [-1,00; -0,60] (p < 0,0001) |

No se han publicado en la información disponible resultados de benchmarks generales de conocimiento o razonamiento (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- Pesos safetensors en bfloat16: ~16,0 GB, por lo que la inferencia requiere al menos 16-20 GB de VRAM considerando caché KV y overhead del runtime.
- GGUF Q4_K_M: ~5,30 GB de pesos; GGUF Q4_0: ~5,15 GB.
- GPU recomendadas para bfloat16: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB). Para Q4_K_M basta una GPU consumer de 8 GB, como RTX 3060, RTX 4060 o RTX 3070.
- Cabe en GPU de consumo: sí, en formato GGUF de 4 bits desde 8 GB de VRAM; en bfloat16 requiere una RTX 4090 o superior. También es viable en equipos Apple Silicon con memoria unificada de 16 GB o más.
- Opciones de despliegue: transformers (con la librería `diarizationlm`), llama.cpp, Ollama y llama-cpp-python para las versiones GGUF. El soporte en vLLM o TGI no está confirmado en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.
- El repositorio ocupa 26,5 GB, por lo que conviene descargar únicamente el archivo de pesos necesario (safetensors o el GGUF elegido).

## Comparativa con modelos similares

| Modelo | Parametros | Modelo base | Contexto | WDER Fisher (%) | WDER Callhome (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| DiarizationLM-Gemma-4-E4B-v1 | 7.996.156.490 (~8,0B) segun safetensors; E4B descrito como 4B densos | Gemma 4 E4B | No disponible (entrenamiento con 2.560 tokens de secuencia maxima) | 2,99 | 4,92 | Apache 2.0 | HuggingFace, safetensors + GGUF |
| DiarizationLM-8b-Fisher-v2 | 8B | Llama 3 8B | No disponible | 3,28 | 6,66 | No disponible | HuggingFace |
| Baseline USM + Turn-to-Diarize | No aplica (no es un LLM) | USM + turn-to-diarize | No disponible | 5,32 | 7,74 | No disponible | No disponible |
| Gemma 4 E4B (modelo base sin ajustar) | No disponible | --- | No disponible | No disponible | No disponible | No disponible | HuggingFace |

El modelo evaluado supera al ajuste basado en Llama 3 8B en Fisher y Callhome con aproximadamente la mitad de parámetros efectivos declarados, y en ICSI y AMI solo se compara contra el baseline acústico en la información disponible.

## Limitaciones y advertencias

- Google declara explícitamente que no es un producto oficialmente soportado ("This is not an officially supported Google product").
- No se especifican los idiomas soportados; el entrenamiento se ha realizado sobre corpus en inglés (Fisher English, Callhome American English, ICSI, AMI), por lo que el comportamiento en otros idiomas es incierto.
- La ventana de entrenamiento es de 2.560 tokens con segmentación de prompt de 4.000 caracteres; conversaciones más largas deben trocearse, lo que puede degradar la coherencia de las etiquetas de hablante entre segmentos.
- Riesgo de alucinación al reescribir la salida: aunque el objetivo es preservar el texto (Transcript-Preserving Speaker Transfer), el modelo puede introducir o eliminar tokens al corregir límites de turno.
- El techo de calidad depende del ASR subyacente: los WER de partida son de 15,37 % en Fisher, 15,22 % en Callhome, 29,42 % en ICSI y 24,33 % en AMI, y el modelo solo corrige la atribución de hablante, no los errores léxicos del ASR.
- En ICSI la mejora es marginal (ΔWDER de -0,60 %) y el conjunto de test contiene solo 3 reuniones, con intervalos de confianza amplios; en AMI son 16 reuniones. Los resultados en estos dominios son menos robustos que en Fisher.
- En ICSI el SpkCntMAE no mejora (0,333 en ambos casos) y en AMI la mejora es limitada (de 0,500 a 0,438), lo que indica que la estimación del número de hablantes sigue siendo un punto débil en reuniones.
- Los resultados se han medido con un baseline concreto (USM + turn-to-diarize) y una función de evaluación específica; no son directamente extrapolables a otros sistemas de diarización.
- La licencia Apache 2.0 permite uso comercial, pero no incluye garantías ni soporte por parte de Google.
- No se documentan evaluaciones de sesgo, robustez ante ruido acústico, ni comportamiento con solapamiento severo de habla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/google/DiarizationLM-Gemma-4-E4B-v1
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Versión anterior basada en Llama 3 8B: https://huggingface.co/google/DiarizationLM-8b-Fisher-v2
- Paper de DiarizationLM: https://arxiv.org/abs/2401.03506
- Librería y scripts de código abierto: https://github.com/google/speaker-id/tree/master/DiarizationLM
- Los resultados de la búsqueda web proporcionada no contienen enlaces adicionales relevantes sobre este modelo.

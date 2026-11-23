# diarizers-community/DiarizationLM-Gemma-4-E4B-v1

## Resumen

DiarizationLM-Gemma-4-E4B-v1 es un modelo de lenguaje especializado en el post-procesado de salidas de reconocimiento automatico del habla (ASR) y diarizacion de hablantes. Lo desarrolla la comunidad `diarizers-community` y se construye mediante ajuste fino (LoRA fusionado) sobre el modelo fundacional Gemma 4 E4B de Google, que cuenta con aproximadamente 8.000 millones de parametros totales segun los pesos publicados en safetensors y una arquitectura densa de 42 capas con atencion hibrida (ventana deslizante y atencion global en proporcion 5:1) y un vocabulario de 262.144 tokens.

El modelo implementa el marco DiarizationLM descrito en el paper arXiv:2401.03506, cuyo objetivo es corregir y optimizar las transcripciones etiquetadas por hablante que producen los sistemas de diarizacion. A diferencia de aproximaciones anteriores entrenadas solo con datos telefonicos de dos hablantes, este modelo se entrena con supervision oracular que preserva la localidad, de modo que aprende a corregir limites de turno lexicos y backchannels cortos (entre 1 y 5 palabras) sin alterar las anclas acusticas de hablante en monologos largos (6 palabras o mas). Es relevante porque logra mejoras estadisticamente significativas (p < 0,0001) en WDER y cpWER de forma simultanea en los cuatro corpus de referencia, con la mitad de parametros que el modelo de 8B de Google.

El modelo se distribuye en dos formatos: pesos completos en bfloat16 para `transformers` y una cuantizacion GGUF Q4_K_M de aproximadamente 5,30 GB pensada para `llama.cpp` y Ollama. La licencia es Apache 2.0 y el pipeline declarado en Hugging Face es image-text-to-text, aunque su uso principal es el post-procesado de transcripciones con marcas de hablante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 E4B): 42 capas, hidden size 2560, atencion hibrida 5:1 (sliding-window + global) |
| Parametros totales | 7.996.156.490 (~8B, segun safetensors) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens de vocabulario; segmentacion de prompt a 4.000 caracteres con longitud maxima de secuencia de 2.560 tokens en entrenamiento (ventana de contexto nativa no disponible) |
| Tipos de cuantizacion | bfloat16 (pesos completos) y GGUF Q4_K_M (matrices sensibles `attn_v`/`ffn_down` y embeddings en Q6_K) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, ~16,0 GB) y GGUF (~5,30 GB) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B, un transformer denso de 42 capas con hidden size de 2560 y un esquema de atencion hibrido que alterna ventana deslizante y atencion global en proporcion 5:1, con un vocabulario de 262.144 tokens. Sobre esta base se aplica un adaptador LoRA de rango r = 256 en todas las proyecciones lineales de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`), de MLP (`gate_proj`, `up_proj`, `down_proj`) y en las proyecciones por capa (`per_layer_input_gate`, `per_layer_projection`, `per_layer_model_projection`). El adaptador se fusiona en los pesos base en bfloat16 y se serializa posteriormente a GGUF Q4_K_M.

El entrenamiento usa una perdida de entropia cruzada solo sobre la completacion (formato `<prompt> --> <completion> [eod]`) con 51.063 pares de Fisher y 20.762 pares multi-corpus (Callhome, ICSI y AMI), todos generados con supervision oracular que preserva la localidad. La optimizacion se realizo durante 10.000 pasos con batch global de 8, AdamW (beta1 = 0,9, beta2 = 0,99), learning rate pico de 1,5e-4, warmup lineal de 500 pasos y decaimiento coseno, sobre 8 chips Google Cloud TPU v5p. La innovacion principal es el objetivo de supervision por localidad: el modelo aprende a corregir fronteras de turno y backchannels cortos sin desplazar la identidad de hablante en tramos largos, lo que evita el problema de deriva de identidad en reuniones de cuatro o mas hablantes.

## Capacidades

- Post-procesado de transcripciones ASR con etiquetas de hablante para corregir errores de atribucion y de limites de turno.
- Correccion de backchannels y solapamientos cortos (1 a 5 palabras) preservando las anclas acusticas de hablante en monologos largos.
- Diarizacion multi-hablante en escenarios de 2 a 9 hablantes (telefonia, reuniones academicas y reuniones de mesa).
- Procesamiento de conversaciones de contexto largo mediante segmentacion de prompts de hasta 4.000 caracteres (2.560 tokens de secuencia).
- Integracion con pipelines de ASR y diarizacion mediante la libreria `diarizers` y la libreria `diarizationlm` de Google.
- Soporte de inferencia en `transformers` (bfloat16) y en `llama.cpp`/Ollama mediante GGUF Q4_K_M.
- Capacidades multimodales heredadas del pipeline image-text-to-text declarado, aunque no se documenta su uso para diarizacion (no disponible).
- Soporte de tool calling y function calling: no disponible.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Post-procesado de transcripciones de call centers: el modelo recibe la salida de un ASR con etiquetas de hablante y corrige atribuciones erroneas en conversaciones de dos hablantes, reduciendo el WDER frente al baseline de USM + Turn-to-Diarize (de 5,32% a 2,99% en Fisher).
- Actas de reuniones corporativas: en reuniones de mesa de cuatro hablantes (AMI) o reuniones academicas de hasta nueve (ICSI), corrige los limites de turno sin perder la identidad de hablante en intervenciones largas, lo que facilita la generacion posterior de resumenes por participante.
- Analisis de conversaciones telefonicas informales: en corpus como Callhome, con 2 a 5 hablantes, reduce el cpWER de 24,31% a 20,69% respecto al baseline, lo que mejora la trazabilidad de quien dice que en entornos de atencion al cliente.
- Enriquecimiento de subtitulos y transcripciones en produccion audiovisual: se integra en un pipeline `diarizers` para etiquetar y corregir hablantes en material grabado antes de la publicacion.
- Investigacion en diarizacion de hablantes: sirve como modelo de referencia para comparar tecnicas de post-procesado con supervision oracular y para reproducir los resultados de los cuatro benchmarks canonicos.
- Despliegue en entornos con recursos limitados: la version GGUF Q4_K_M de 5,30 GB permite ejecutar el post-procesado en estaciones de trabajo con GPU de consumo o incluso en CPU mediante `llama.cpp`, sin necesidad de infraestructura de centro de datos.
- Auditoria de calidad de sistemas ASR: permite medir la mejora marginal que aporta el post-procesado LLM sobre la salida cruda de un frontend de diarizacion antes de decidir su adopcion.

## Benchmarks y rendimiento

Resultados con frontend USM + Turn-to-Diarize, promediados en micro sobre los conjuntos de evaluacion completos y puntuados con programacion dinamica con emparejamiento hungaro. Los rangos entre corchetes son intervalos de confianza bootstrap al 95% (B = 10.000).

| Benchmark | Test | WER (%) | Sistema | WDER (%) [IC 95%] | cpWER (%) [IC 95%] | SpkCntMAE [IC 95%] |
|---|---|---|---|---|---|---|
| Fisher | TEST FULL (172 sesiones) | 15,37 | Baseline (USM + Turn-to-Diarize) | 5,32 [4,93; 5,74] | 20,88 [19,97; 21,88] | 0,215 [0,151; 0,291] |
| Fisher | TEST FULL (172 sesiones) | 15,37 | DiarizationLM-8b-Fisher-v2 (Llama 3 8B) | 3,28 | 18,37 | no disponible |
| Fisher | TEST FULL (172 sesiones) | 15,37 | DiarizationLM-Gemma-4-E4B-v1 (4B) | 2,99 [2,65; 3,37] | 17,62 [16,76; 18,56] | 0,093 [0,047; 0,145] |
| Callhome | TEST FULL (20 llamadas) | 15,22 | Baseline (USM + Turn-to-Diarize) | 7,74 [6,07; 9,65] | 24,31 [21,27; 27,43] | 0,050 [0,000; 0,150] |
| Callhome | TEST FULL (20 llamadas) | 15,22 | DiarizationLM-8b-Fisher-v2 (Llama 3 8B) | 6,66 | 23,57 | no disponible |
| Callhome | TEST FULL (20 llamadas) | 15,22 | DiarizationLM-Gemma-4-E4B-v1 (4B) | 4,92 [3,46; 6,75] | 20,69 [17,98; 23,66] | 0,000 [0,000; 0,000] |
| ICSI | TEST FULL (3 reuniones) | no disponible | Baseline (USM + Turn-to-Diarize) | no disponible | no disponible | no disponible |
| ICSI | TEST FULL (3 reuniones) | no disponible | DiarizationLM-Gemma-4-E4B-v1 (4B) | no disponible | no disponible | no disponible |

La mejora pareada en WDER frente al baseline es de -2,33 puntos porcentuales [-2,51; -2,16] en Fisher y de -2,82 puntos [-3,48; -2,14] en Callhome, ambas con p < 0,0001. Los resultados completos de ICSI y AMI no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para los pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 24 GB para ejecucion comoda.
- VRAM estimada con GGUF Q4_K_M: aproximadamente 5,30 GB de pesos, por lo que cabe en GPU de consumo con 8 GB o mas.
- GPU recomendadas para bfloat16: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB).
- GPU de consumo: la version Q4_K_M cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; la version bfloat16 requiere al menos 24 GB, por lo que encaja en RTX 3090 y RTX 4090.
- Opciones de despliegue: `transformers` (bfloat16), `llama.cpp`, Ollama y `llama-cpp-python` (GGUF Q4_K_M); integracion con el pipeline `diarizers` y la libreria `diarizationlm`.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Entrenamiento original: 8 chips Google Cloud TPU v5p (no requerido para inferencia).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WDER Fisher (%) | cpWER Fisher (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DiarizationLM-Gemma-4-E4B-v1 | ~8B (~4B densos declarados por el autor) | 2.560 tokens de secuencia en entrenamiento | 2,99 | 17,62 | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| DiarizationLM-8b-Fisher-v2 (Google) | 8B (Llama 3 8B) | no disponible | 3,28 | 18,37 | no disponible | Hugging Face |
| DiarizationLM-Gemma-4-12B-v1 | 12B (declarado) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| DiarizationLM-Gemma-4-E4B-v2 | ~8B (misma huella GGUF Q4_K_M de 5,30 GB) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

Segun la model card, el modelo supera al de 8B de Google en Fisher y Callhome con la mitad de parametros declarados, y la comunidad recomienda las versiones v2 y 12B para soporte multilingue (11 idiomas) y mayor precision multi-hablante.

## Limitaciones y advertencias

- El modelo no es un producto oficialmente soportado por Google; la propia model card lo indica explicitamente.
- Esta especializado en post-procesado de diarizacion: no es un modelo de proposito general y su uso fuera de ese dominio no esta validado.
- Los resultados de ICSI y AMI no estan completos en la informacion disponible, por lo que la cobertura multi-hablante de 3 a 9 personas no puede verificarse con los datos publicados.
- La segmentacion de prompts a 4.000 caracteres y 2.560 tokens de secuencia puede truncar conversaciones muy largas si no se trocean adecuadamente antes de la inferencia.
- Idiomas soportados no disponibles; la version v2 se presenta como la que anade soporte para 11 idiomas, lo que sugiere que v1 tiene cobertura limitada (probablemente centrada en ingles, aunque no se confirma).
- Riesgo de alucinacion y de reescritura de contenido lexico al corregir transcripciones: el modelo genera texto nuevo y podria alterar palabras del ASR, no solo las etiquetas de hablante.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 E4B puede tener terminos adicionales que conviene revisar antes de desplegar en produccion.
- La cuantizacion Q4_K_M introduce perdida de precision respecto a bfloat16; para evaluaciones de referencia conviene usar los pesos completos.
- El pipeline declarado en Hugging Face es image-text-to-text, lo que puede inducir a confusion sobre el uso previsto real del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diarizers-community/DiarizationLM-Gemma-4-E4B-v1
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Version recomendada de mayor calidad (12B): https://huggingface.co/diarizers-community/DiarizationLM-Gemma-4-12B-v1
- Version recomendada rapida (E4B-v2): https://huggingface.co/diarizers-community/DiarizationLM-Gemma-4-E4B-v2
- Modelo previo de Google: https://huggingface.co/google/DiarizationLM-8b-Fisher-v2
- Paper DiarizationLM: https://arxiv.org/abs/2401.03506
- Pipeline `diarizers`: https://github.com/diarizers-community/diarizers
- Libreria `diarizationlm` de Google: https://github.com/google/speaker-id/tree/master/DiarizationLM

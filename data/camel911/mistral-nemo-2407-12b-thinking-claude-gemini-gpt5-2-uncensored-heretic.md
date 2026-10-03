# camel911/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC

## Resumen

Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC es un ajuste fino del modelo Mistral-Nemo-Instruct-2407 de Mistral AI, publicado por el usuario camel911 en HuggingFace. El objetivo del autor es doble: por un lado, eliminar los mecanismos de rechazo mediante un proceso de "abliteration" (etiquetado como heretic), y por otro, convertir el modelo original en un modelo de razonamiento con bloques de pensamiento explícitos. Para ello se apoya en tres conjuntos de datos de razonamiento de alta calidad de TeichAI (Claude 4.5 Opus, Gemini 3 Pro y GPT-5.2), entrenados con la librería Unsloth.

El modelo mantiene la arquitectura y el tamano del Mistral Nemo original: 12.247.782.400 parametros (aproximadamente 12,2 mil millones) en un transformer decoder-only denso. El autor declara una ventana de contexto de 128k a 256k tokens, con un maximo de 1 millon segun la model card, aunque la ventana minima recomendada es de 4k y se sugiere trabajar con 8k o mas. El repositorio ocupa 24,5 GB en formato safetensors con precision bfloat16.

La relevancia de esta ficha radica en que ejemplifica una tendencia concreta dentro del ecosistema open source: finetunes derivados de modelos base instruidos que combinan des-censura (reduccion de rechazos de 87/100 a 14/100 segun el autor) con destilacion de razonamiento de modelos propietarios. Su orientacion declarada es la escritura creativa, la ficcion y el roleplay sin filtros, en lugar de tareas de asistencia general con guardarrailes de seguridad. El modelo no cuenta con descargas ni likes en el momento de la consulta, y su licencia no esta especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (derivado de Mistral-Nemo-Instruct-2407) |
| Parametros totales | 12.247.782.400 (12,2B) |
| Longitud de contexto | 128k-256k declarados por el autor; maximo declarado de 1 millon; minimo recomendado 4k, optimo 8k+ |
| Tipos de cuantizacion | El repositorio principal esta en bfloat16 (safetensors). El autor recomienda GGUF Q4_K_S (sin imatrix) o IQ3_M (con imatrix) o superiores; advierte que cuantizaciones mas bajas pueden degradar la activacion del razonamiento |
| Idiomas soportados | en, fr, de, es, it, pt, ru, zh, ja |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16), libreria transformers |

## Arquitectura y entrenamiento

La base es Mistral-Nemo-Instruct-2407, un modelo denso de 12,2B parametros con soporte nativo de contexto largo de 128k tokens. Sobre esa base se aplico en primer lugar un proceso de "abliteration" o des-censura (denominado heretic por el autor), que redujo la tasa de rechazo de 87/100 a 14/100 segun la model card. Posteriormente se realizo un ajuste fino supervisado con Unsloth sobre tres datasets de razonamiento de TeichAI: claude-4.5-opus-high-reasoning-250x, gemini-3-pro-preview-high-reasoning-250x y gpt-5.2-high-reasoning-250x.

El resultado es un modelo que genera bloques de pensamiento (thinking/reasoning) antes de la respuesta final, con una longitud media declarada de 3 a 6 parrafos, equivalentes a 300-600 tokens. El autor indica que el razonamiento es compacto y directo en lugar de extenso, y que no requiere un system prompt porque las etiquetas de pensamiento se autogeneran. La model card no detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto creativo: ficcion, relatos, tramas y subtramas, continuacion de escenas y prosa descriptiva.
- Razonamiento explicito con bloques de pensamiento autogenerados de 300-600 tokens de media.
- Escritura en multiples generos: ciencia ficcion, romance, terror, entre otros.
- Roleplay y conversacion multi-turno orientada a personajes.
- Capacidades multilingues en nueve idiomas: ingles, frances, aleman, espanol, italiano, portugues, ruso, chino y japones.
- Salida sin filtros de contenido ni mecanismos de rechazo (modelo des-censurado).
- Ajuste de comportamiento por temperatura muy amplio: el autor indica que el razonamiento se mantiene activo con temperaturas de 0,1 a 2,5 o superiores.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.

## Casos de uso

- Escritura de ficcion larga: el modelo puede generar relatos y novelas por capitulos apoyandose en su ventana de contexto de 128k tokens para mantener coherencia argumental y de personajes a lo largo de miles de palabras.
- Generacion de tramas y subtramas: util para autores que necesitan esbozar estructuras narrativas complejas, ya que la model card destaca explicitamente la generacion de plot y sub-plot.
- Roleplay y personajes conversacionales: adecuado para interfaces tipo Silly Tavern o KoboldCpp donde se requiere una personalidad consistente y sin rechazos tematicos.
- Continuacion de escenas (scene continue): permite retomar un texto existente y prolongarlo respetando tono, estilo y voz narrativa.
- Escritura de generos especificos con contenido adulto o de terror: el ajuste heretic elimina los filtros, lo que lo hace apto para narrativa R-18, terror visceral o tematicas que otros modelos rechazan.
- Prototipado de asistentes creativos multilingues: cubre espanol, frances, aleman, italiano, portugues, ruso, chino y japones, lo que permite desplegar una unica instancia para autores de distintos idiomas.
- Experimentacion en investigacion sobre alineacion y des-censura: sirve como caso de estudio de abliteration y destilacion de razonamiento desde modelos propietarios.

## Benchmarks y rendimiento

La model card incluye los benchmarks originales publicados por Mistral para el modelo base Mistral-Nemo-Instruct-2407. El autor indica expresamente que estos resultados no se han actualizado tras el ajuste fino de razonamiento, por lo que deben interpretarse como referencia del modelo base y no como rendimiento del finetune.

| Benchmark | Resultado (modelo base) |
|---|---|
| HellaSwag (0-shot) | 83,5 % |
| Winogrande (0-shot) | 76,8 % |
| OpenBookQA (0-shot) | 60,6 % |
| CommonSenseQA (0-shot) | 70,4 % |
| TruthfulQA (0-shot) | 50,3 % |
| MMLU (5-shot) | 68,0 % |
| TriviaQA (5-shot) | 73,8 % |
| NaturalQuestions (5-shot) | 31,2 % |

MMLU multilingue (modelo base):

| Idioma | Resultado |
|---|---|
| Espanol | 64,6 % |
| Aleman | 62,7 % |
| Frances | 62,3 % |
| Portugues | 63,3 % |
| Italiano | 61,3 % |
| Ruso | 59,2 % |
| Chino | 59,0 % |
| Japones | 59,0 % |

No se han publicado resultados de benchmarks especificos para este finetune en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 24,5 GB solo para pesos, mas overhead de activaciones y cache KV, por lo que se recomienda un minimo de 32-48 GB para contexto largo.
- VRAM estimada en cuantizacion Q8: en torno a 13 GB.
- VRAM estimada en cuantizacion Q4_K_S: en torno a 7-8 GB.
- GPU de gama profesional: A100 40 GB, A100 80 GB, H100.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en bfloat16 de forma ajustada para contextos cortos, y con holgura en cuantizaciones Q8 o Q4.
- GPU de gama media: una RTX 3090 (24 GB) o RTX 4080 (16 GB, con cuantizacion Q4) pueden ejecutarlo.
- Opciones de despliegue: transformers, text-generation-inference (TGI), llama.cpp con GGUF, KoboldCpp, oobabooga/text-generation-webui, Silly Tavern y LM Studio. Soporte de Ollama y vLLM no confirmado en la informacion disponible.
- El autor indica que para text-generation-webui con GGUF es necesario usar el cargador llama_HF, descargando archivos de configuracion de la version fuente del modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia |
|---|---|---|---|---|
| Mistral-Nemo-2407-12B-Thinking-...-HERETIC (este modelo) | 12,2B | 128k-256k declarados | Finetune des-censurado con razonamiento | no disponible |
| mistralai/Mistral-Nemo-Instruct-2407 | 12,2B | 128k | Instruido original | Apache 2.0 |
| Otros finetunes des-censurados de Mistral Nemo | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento del finetune que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo explicitamente des-censurado: no incorpora filtros de seguridad ni mecanismos de rechazo, por lo que puede generar contenido NSFW, violento, ofensivo o inapropiado sin advertencia.
- La model card declara contenido de terror R-18 y lenguaje soez como parte del comportamiento esperado.
- Riesgo alto de alucinacion, inherente a los modelos de 12B y agravado por el ajuste orientado a creatividad y roleplay.
- Los benchmarks publicados corresponden al modelo base y no reflejan el rendimiento del finetune; el autor lo advierte explicitamente.
- Licencia no especificada: no se puede confirmar el uso comercial. La licencia del modelo base es Apache 2.0, pero el finetune no declara terminos propios, lo que introduce incertidumbre legal.
- Cuantizaciones inferiores a Q4_K_S o IQ3_M pueden degradar o desactivar la generacion de razonamiento segun el autor.
- Ventana de contexto: aunque el autor declara hasta 1 millon de tokens, no hay validacion independiente de ese dato; la recomendacion practica de la propia model card es un minimo de 4k y un optimo de 8k+.
- El modelo no incluye system prompt funcional: el autor recomienda no usarlo, ya que las etiquetas de pensamiento se autogeneran.
- Soporte de tool calling, agentes y vision no documentado.
- Modelo practicamente sin validacion por la comunidad en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de pruebas independientes de robustez.
- Ajustes de muestreo recomendados por el autor: temperatura 0,7 (rango 0,1-2,5+), repetition penalty 1,05, top_p 0,95, min_p 0,05, top_k 40, y smoothing factor 1,5 en las interfaces compatibles.
- La fecha de creacion y actualizacion registrada es 2026-10-02, posterior al conocimiento de referencia habitual, por lo que los datasets y modelos citados (Claude 4.5 Opus, Gemini 3 Pro, GPT-5.2) no pueden verificarse de forma independiente con la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/camel911/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Dataset de razonamiento Claude 4.5 Opus: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Dataset de razonamiento Gemini 3 Pro: https://huggingface.co/datasets/TeichAI/gemini-3-pro-preview-high-reasoning-250x
- Dataset de razonamiento GPT-5.2: https://huggingface.co/datasets/TeichAI/gpt-5.2-high-reasoning-250x
- Unsloth: https://github.com/unslothai/unsloth
- Archivos fuente del autor para GGUF, EXL2, AWQ, GPTQ, HQQ: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Guia de parametros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters

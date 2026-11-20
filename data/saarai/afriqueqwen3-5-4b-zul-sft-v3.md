# SaarAI/AfriqueQwen3.5-4B-zul-sft-v3

## Resumen
AfriqueQwen3.5-4B-zul-sft-v3 es un ajuste fino supervisado (SFT) de parametros completos del modelo McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1, orientado a mejorar el rendimiento en zulu (zu). Lo desarrolla SaarAI y se entrena con LLaMA-Factory sobre el dataset SaarAI/zul-post-training-v2, que cubre 24 tipos de tarea con especial peso de traduccion en<->zul. El modelo tiene 4.539.265.536 parametros y se distribuye en safetensors bajo licencia CC-BY-4.0.

La relevancia del modelo esta en su especializacion linguistica: parte de un modelo multilingue de 50 idiomas y se reentrena para tareas de zulu como NLI, intent, POS, traduccion y QA. Es un caso practico de adaptacion de un modelo base a un idioma de bajos recursos mediante SFT a gran escala, con 858.985 filas de entrenamiento y una perdida de evaluacion de 1.0067 en el checkpoint publicado (paso 25.000, epoca 0.93).

El checkpoint subido no corresponde al final del entrenamiento programado de 3 epocas, sino al de menor perdida de evaluacion. El autor advierte que las metricas AfroBench disponibles pertenecen a la version v2, no a esta v3, y que no se ha verificado solapamiento entre los datos de entrenamiento y los conjuntos de test de AfroBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5`) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible como spec del modelo; el entrenamiento uso cutoff de 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos en bf16 puro; sin GGUF publicado) |
| Idiomas soportados | zulu (zu), ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un ajuste fino de parametros completos sobre un transformer decoder-only de la familia Qwen3.5, con pesos en bf16 puro y sin DeepSpeed. El entrenamiento se ejecuto en 1x H100 80GB con AdamW de 8 bits y kernels Liger. Se uso la plantilla `qwen3_5_nothink`, longitud de corte de 4096 tokens, batches agrupados por longitud, learning rate 1e-5 con schedule coseno sobre 3 epocas, 3% de warmup y batch efectivo de 32 (16 x 2 de acumulacion). El plan eran 80.532 pasos (26.844 por epoca) y unas 38,3 horas de computo total; el run se interrumpio por un reinicio de maquina en el paso 26.155 y se reanudo desde el checkpoint del paso 25.000.

Los datos de entrenamiento son el dataset completo SaarAI/zul-post-training-v2: 858.985 filas de entrenamiento (sin muestreo) procedentes de 9 ficheros y 2.000 filas de validacion muestreadas de 6.645. Cubre 24 tipos de tarea; los mayores son traduccion en<->zul (unas 284k filas), question answering, chat, instruction following, code chat, generacion y continuacion de texto. Hay tareas menores de NLI, summarization, dialogo, simplificacion de texto, identificacion de parafrasis, event linking, clasificacion de intent/tema/noticias, NER, POS tagging, deteccion de hate speech y generacion de titulos y articulos. Las licencias de las fuentes no se filtraron (uso de investigacion). El checkpoint publicado es el paso 25.000 (epoca 0.93); la perdida de evaluacion empeoro en epocas posteriores (1.0549 en el paso 80.532), por lo que no se subieron esos pesos.

## Capacidades
- Generacion de texto y conversacion multi-turno en zulu e ingles.
- Traduccion bidireccional en<->zul (la tarea con mas volumen en el dataset de entrenamiento).
- Question answering y instruction following.
- Razonamiento aritmetico basico (evaluado en afrimgsm, con rendimiento ligeramente inferior al base).
- NLI, clasificacion de intent, clasificacion de temas/noticias y deteccion de hate speech.
- POS tagging, NER y event linking.
- Summarization, simplificacion de texto e identificacion de parafrasis.
- Code chat y generacion de codigo (presente en el mix de datos, sin metricas publicadas).
- Generacion de titulos y articulos.
- Plantilla `qwen3_5_nothink` (modo sin razonamiento explicito) usada en entrenamiento y evaluacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso
- Traduccion en<->zul en produccion editorial: el modelo se entreno con unas 284k filas de traduccion bidireccional, lo que lo hace adecuado para borradores de traduccion ingles-zulu con revision humana.
- Atencion al cliente en zulu: puede gestionar conversaciones multi-turno con la plantilla de chat `qwen3_5_nothink`, aunque el cutoff de entrenamiento de 4096 tokens limita la longitud practica del contexto.
- Clasificacion de intent para asistentes de voz o chatbots: el modelo muestra en la version v2 una mejora de +25,0 puntos de accuracy en injongointent frente al base, lo que respalda su uso en enrutado de consultas.
- Etiquetado POS y NER para corpus linguisticos zulu: util en proyectos de anotacion y construccion de recursos para idiomas de bajos recursos.
- Moderacion de contenido: el mix incluye deteccion de hate speech, por lo que puede emplearse como filtro de primera pasada en comunidades zuluhablantes.
- Resumen y simplificacion de documentos: tareas presentes en el dataset, aplicables a la condensacion de noticias o textos administrativos en zulu.
- Investigacion en NLP de bajos recursos: sirve como punto de partida para estudiar el efecto del SFT multi-tarea sobre un modelo multilingue de 50 idiomas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de este modelo (v3) en la informacion disponible. La model card incluye resultados AfroBench de la version v2 (entrenada con los mismos datos durante 1 epoca, no publicada en el Hub) como referencia, con prompt 1, plantilla de chat, thinking desactivado, maximo 512 tokens nuevos y semilla 42:

| Tarea | Metrica | base | v1 | v2 | v2 - base |
|---|---|---:|---:|---:|---:|
| afrimgsm_zul_prompt_1 | EM | 46.0 | 44.4 | 44.8 | -1.2 |
| afrimmlu_direct_zul_prompt_1 | acc | 38.8 | 36.4 | 39.2 | +0.4 |
| afrixnli_zul_prompt_1 | acc | 47.3 | 64.8 | 80.5 | +33.2 |
| belebele_zul_prompt_1 | acc | 25.2 | 60.1 | 64.1 | +38.9 |
| injongointent_zul_prompt_1 | acc | 62.2 | 77.3 | 87.2 | +25.0 |
| masakhapos_zul_prompt_1 | acc | 64.7 | 47.8 | 88.3 | +23.6 |
| ntrex_eng_Latn-zul_Latn_prompt_1 | BLEU | 11.4 | 10.6 | 13.0 | +1.6 |
| ntrex_eng_Latn-zul_Latn_prompt_1 | chrF | 51.3 | 49.9 | 52.8 | +1.5 |
| ntrex_zul_Latn-eng_Latn_prompt_1 | BLEU | 27.6 | 21.9 | 33.4 | +5.8 |
| ntrex_zul_Latn-eng_Latn_prompt_1 | chrF | 50.5 | 42.7 | 55.7 | +5.3 |
| sib_zul_prompt_1 | acc | 70.6 | 88.7 | 89.2 | +18.6 |

Media de accuracy/EM sobre 7 tareas: base 50.7, v1 59.9, v2 70.5. Solo se ejecuto el prompt 1, por lo que estas cifras no son comparables con el leaderboard de AfroBench (que promedia cinco prompts). Posible solapamiento no verificado con los test sets de AfroBench en `sib200_bench` (3.490 filas), `injongo_intent_bench` (4.282), `masakhapos`/`masakhapos_tuples` (2.975) y `multinli_en` (20.895), lo que podria inflar los resultados de v2 en tema, intent, NLI y POS.

Perdida de evaluacion del checkpoint publicado (v3, paso 25.000, 2.000 filas de validacion): 1.0067. Perdida de evaluacion en el ultimo paso (80.532, no subido): 1.0549.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: aproximadamente 9 GB solo para pesos (4.539 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda 12-16 GB para contextos moderados.
- GPU recomendadas: H100 80GB o A100 80GB para entrenamiento o servicio de alta concurrencia; para inferencia, una RTX 4090 (24 GB) es suficiente en bf16 o fp16.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en bf16; con cuantizacion de 8 bits cabria en GPUs de 8-10 GB, aunque no se publican pesos cuantizados.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI (compatibles con safetensors de arquitectura Qwen), llama.cpp/Ollama solo si se generan pesos GGUF, que no estan disponibles en el repositorio.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| SaarAI/AfriqueQwen3.5-4B-zul-sft-v3 | 4.539 M | no disponible (entrenado a 4096) | zu, en | CC-BY-4.0 | publicado |
| McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1 (base) | no disponible | no disponible | 50 idiomas | no disponible | publicado |
| SaarAI/AfriqueQwen3.5-4B-zul-sft (v1) | no disponible | no disponible | zu, en | no disponible | publicado |
| SaarAI/AfriqueQwen3.5-4B-zul-sft-v2 | no disponible | no disponible | zu, en | no disponible | no publicado en el Hub |

El modelo base es la referencia natural: v2 mejora su media de accuracy/EM en AfroBench de 50.7 a 70.5 (prompt 1). La v1 (3 epocas sobre datos muestreados) queda en 59.9. No se dispone de datos de benchmarks de la v3 para comparar con su predecesora.

## Limitaciones y advertencias
- El checkpoint publicado corresponde al paso 25.000 (epoca 0.93), no al final del entrenamiento; el autor indica que las epocas posteriores sobreajustaron y empeoraron la perdida de evaluacion.
- No se ha evaluado la v3 en AfroBench; los resultados mostrados son de la v2 y no deben atribuirse a este modelo.
- Posible solapamiento no verificado entre datos de entrenamiento y test sets de AfroBench (sib200, injongo_intent, masakhapos, multinli_en), con riesgo de metricas infladas en tema, intent, NLI y POS.
- Las licencias de las fuentes del dataset no se filtraron; el autor recomienda revisarlas antes de cualquier uso comercial pese a la licencia CC-BY-4.0 del modelo.
- Cobertura limitada a zulu e ingles; el rendimiento en otros idiomas del modelo base no esta documentado.
- Riesgo de alucinacion inherente a un modelo de 4B ajustado por SFT, sin RLHF/DPO documentado.
- Sesgos potenciales heredados de los datasets fuente (hate speech, noticias, NLI) y del modelo base multilingue; no se documentan evaluaciones de sesgo.
- El cutoff de entrenamiento de 4096 tokens limita el contexto efectivo aunque la arquitectura base soporte mas.
- La model card esta truncada en el apartado de limitaciones ("This model has not been..."), por lo que puede haber advertencias adicionales del autor no recogidas aqui.

## Enlaces
- Hugging Face: https://huggingface.co/SaarAI/AfriqueQwen3.5-4B-zul-sft-v3
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1
- Version v1: https://huggingface.co/SaarAI/AfriqueQwen3.5-4B-zul-sft
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- Dataset de entrenamiento: SaarAI/zul-post-training-v2 (referenciado en la model card, sin URL directa en la informacion disponible)

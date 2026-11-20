# SaarAI/AfriqueQwen3.5-4B-zul-sft-v2

## Resumen

AfriqueQwen3.5-4B-zul-sft-v2 es un ajuste fino supervisado (SFT) de parametros completos del modelo McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1, desarrollado por SaarAI para mejorar el rendimiento en zulu (zu). Se trata de un transformer de 4.539.265.536 parametros (aproximadamente 4,5 mil millones) construido sobre la arquitectura Qwen3.5, con capacidad declarada de procesamiento image-text-to-text y un enfoque principal en generacion de texto conversacional.

El modelo resuelve un problema concreto: la baja competencia de los modelos multilingues genericos en lenguas africanas de bajos recursos. Para ello, SaarAI ha entrenado una epoca completa sobre el dataset `SaarAI/zul-post-training-v2`, compuesto por 858.985 filas de entrenamiento y 2.000 de validacion, cubriendo 24 tipos de tarea que van desde traduccion en<->zul hasta NER, POS tagging, deteccion de discurso de odio y clasificacion de intenciones.

Es relevante ahora porque sustituye a la version anterior (v1), que se entreno sobre datos muestreados durante 3 epocas, y porque demuestra mejoras sustanciales en tareas de zulu segun los resultados publicados de AfroBench (promedio de exactitud/EM sobre 7 tareas: 50,7 en el base, 59,9 en v1 y 70,5 en v2). El modelo se distribuye con licencia CC-BY-4.0 y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tag `qwen3_5`); capacidad image-text-to-text declarada |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec oficial; el entrenamiento uso cutoff de 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors en bf16 puro) |
| Idiomas soportados | zulu (zu), ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |
| Modelo base | McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1 |
| Metodo de entrenamiento | Full fine-tune (SFT) con LLaMA-Factory |
| Tamano del repositorio | 9,1 GB |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5 del modelo base de McGill-NLP, un transformer decoder-only de 4,54 mil millones de parametros. SaarAI realizo un ajuste fino de parametros completos (no LoRA) sobre 1 GPU H100 de 80 GB, con pesos en bf16 puro, AdamW de 8 bits, kernels Liger y sin DeepSpeed. Se uso la plantilla `qwen3_5_nothink` con longitud de corte de 4096 tokens y lotes agrupados por longitud.

El dataset de entrenamiento es la totalidad de `SaarAI/zul-post-training-v2`: 858.985 filas de entrenamiento procedentes de 9 ficheros y 2.000 filas de validacion (muestreadas de 6.645), cubriendo 24 tipos de tarea. Las tareas dominantes son traduccion en<->zul (unas 284.000 filas), question answering, chat, instruction following, code chat, generacion y continuacion de texto; las secundarias incluyen NLI, sumarizacion, dialogo, simplificacion de texto, identificacion de parafrasis, event linking, clasificacion de intenciones/temas/noticias, NER, POS tagging, deteccion de discurso de odio y generacion de titulos y articulos. Se empleo learning rate 1e-5 con schedule coseno y 3% de warmup, batch efectivo de 32 (16 x 2 de acumulacion) y 1 epoca completa equivalente a 26.844 pasos (aproximadamente 12,8 horas). Las licencias de los datasets de origen no se filtraron (uso de investigacion).

El entrenamiento muestra una curva de perdida estable: perdida de entrenamiento media de 0,9781 en la epoca, con 1,362 en los primeros 500 pasos y 0,947 en los ultimos 500. La perdida de evaluacion final sobre las 2.000 filas de validacion fue 1,0161, sin repuntes entre evaluaciones y con aplanamiento tras el paso 20.000, lo que el autor interpreta como ausencia de sobreajuste.

## Capacidades

- Generacion de texto conversacional en zulu e ingles, con soporte de plantilla de chat (`apply_chat_template`).
- Traduccion bidireccional en<->zul, con mejoras medidas en BLEU y chrF sobre el modelo base.
- Question answering y comprension lectora en zulu (evaluado en Belebele y AfriMMLU).
- Razonamiento matematico basico en zulu (evaluado en AfriGSM).
- Inferencia de lenguaje natural (NLI) en zulu (evaluado en AfriXNLI).
- Clasificacion de intenciones (evaluado en InjongoIntent).
- Etiquetado gramatical (POS tagging) en zulu (evaluado en MasakhaPOS).
- Clasificacion de temas y noticias (evaluado en SIB-200).
- Tareas auxiliares presentes en el dataset: sumarizacion, simplificacion de texto, identificacion de parafrasis, NER, deteccion de discurso de odio, generacion de titulos y articulos, event linking.
- Capacidad image-text-to-text declarada en los tags del modelo (heredada del base), aunque no se documenta su uso ni rendimiento.
- No se documenta soporte explicito de tool calling ni de agentes multi-paso en la informacion disponible.
- Modo thinking desactivado en la evaluacion (plantilla `qwen3_5_nothink`); no se documenta un modo thinking activo.

## Casos de uso

- Traduccion automatica ingles-zulu en produccion editorial: el modelo puede traducir articulos y contenidos web con calidad medida (BLEU 33,4 en zul->eng y 13,0 en eng->zul sobre NTREX), adecuado para pipelines de localizacion de contenido hacia el zulu.
- Atencion al cliente en zulu: el modelo gestiona conversaciones multi-turno con plantilla de chat y contexto de hasta 4096 tokens, suficiente para historiales de soporte tipicos; su entrenamiento en chat e instruction following lo hace apto para asistentes virtuales en esta lengua.
- Clasificacion de intenciones para asistentes de voz o chatbots: con exactitud del 87,2 en InjongoIntent, puede integrarse como clasificador de intenciones en sistemas de atencion automatizada en zulu.
- Moderacion de contenido: el dataset incluye deteccion de discurso de odio, por lo que el modelo puede usarse como componente de filtrado en plataformas con contenido en zulu, aunque requiere validacion adicional por la falta de benchmarks especificos.
- Etiquetado linguistico y anotacion de corpus: con exactitud del 88,3 en MasakhaPOS, es util para preanotar corpus zulu en proyectos de linguistica computacional y construccion de datasets.
- Analisis de sentimiento y NLI en pipelines de investigacion social: con exactitud del 80,5 en AfriXNLI, sirve para tareas de inferencia textual en estudios sobre discurso publico en zulu.
- Generacion de resumenes y simplificacion de textos administrativos: el dataset incluye tareas de sumarizacion y simplificacion, util para adaptar documentacion oficial a lenguaje claro en zulu.

## Benchmarks y rendimiento

Resultados de AfroBench en tareas de zulu, ejecutados con lm-eval (solo prompt 1, plantilla de chat, thinking desactivado, maximo 512 tokens nuevos, semilla 42). Exactitud (acc) y exact match (EM) multiplicados por 100; chrF y BLEU en su escala propia. La columna base corresponde a McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1, v1 al ajuste anterior sobre datos muestreados y v2 a este modelo.

| Tarea | Metrica | base | v1 | v2 | v2 - base |
|---|---|---:|---:|---:|---:|
| afrimgsm_zul_prompt_1 | EM | 46,0 | 44,4 | 44,8 | -1,2 |
| afrimmlu_direct_zul_prompt_1 | acc | 38,8 | 36,4 | 39,2 | +0,4 |
| afrixnli_zul_prompt_1 | acc | 47,3 | 64,8 | 80,5 | +33,2 |
| belebele_zul_prompt_1 | acc | 25,2 | 60,1 | 64,1 | +38,9 |
| injongointent_zul_prompt_1 | acc | 62,2 | 77,3 | 87,2 | +25,0 |
| masakhapos_zul_prompt_1 | acc | 64,7 | 47,8 | 88,3 | +23,6 |
| ntrex_eng_Latn-zul_Latn_prompt_1 | BLEU | 11,4 | 10,6 | 13,0 | +1,6 |
| ntrex_eng_Latn-zul_Latn_prompt_1 | chrF | 51,3 | 49,9 | 52,8 | +1,5 |
| ntrex_zul_Latn-eng_Latn_prompt_1 | BLEU | 27,6 | 21,9 | 33,4 | +5,8 |
| ntrex_zul_Latn-eng_Latn_prompt_1 | chrF | 50,5 | 42,7 | 55,7 | +5,3 |
| sib_zul_prompt_1 | acc | 70,6 | 88,7 | 89,2 | +18,6 |

Media de exactitud/EM sobre 7 tareas: base 50,7; v1 59,9; v2 70,5. El autor advierte que solo se ejecuto el prompt 1, por lo que estos numeros solo comparan los tres modelos entre si y no son comparables con el leaderboard de AfroBench (que promedia cinco prompts). Ademas, existe posible solapamiento entre el dataset de entrenamiento y los conjuntos de test de AfroBench (sib200_bench con 3.490 filas, injongo_intent_bench con 4.282, masakhapos y masakhapos_tuples con 2.975 conjuntas, y multinli_en con 20.895), no verificado, lo que podria inflar los resultados de v2, especialmente en tareas de tema, intencion, NLI y POS.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 10 y 12 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 5 GB para pesos; en 4 bits, alrededor de 3 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas para entrenamiento: 1x H100 80 GB (configuracion usada por el autor para el full fine-tune).
- GPU para inferencia: cabe en GPUs de consumo como RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB) en bf16 o cuantizado; en GPUs de 8 GB requeriria cuantizacion a 4 bits.
- Opciones de despliegue: transformers (soporte nativo, ejemplo en la model card), vLLM y TGI para serving de alto rendimiento; llama.cpp y Ollama para despliegue local cuantizado (no se documenta GGUF oficial en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Entrenamiento: 12,8 horas en 1x H100 80 GB para una epoca completa (26.844 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento AfroBench (media 7 tareas) |
|---|---|---|---|---|---|
| AfriqueQwen3.5-4B-zul-sft-v2 | 4,54 B | no disponible (entrenado a 4096) | zu, en | CC-BY-4.0 | 70,5 (prompt 1) |
| McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1 (base) | 4,54 B | no disponible | 50 idiomas africanos | no disponible | 50,7 (prompt 1) |
| SaarAI/AfriqueQwen3.5-4B-zul-sft (v1) | 4,54 B | no disponible | zu, en | no disponible | 59,9 (prompt 1) |

La comparativa se limita a los tres modelos de la misma familia para los que el autor publica resultados. No se dispone de datos de benchmarks de otros modelos comparables de tamano similar especializados en zulu en la informacion proporcionada.

## Limitaciones y advertencias

- El unico benchmark publicado es la ejecucion de AfroBench con un solo prompt, y el autor reconoce posible solapamiento entre los datos de entrenamiento y los conjuntos de test, por lo que las cifras de v2 pueden estar infladas, especialmente en tareas de tema, intencion, NLI y POS.
- El autor califica explicitamente el modelo como experimental; puede producir texto incorrecto o sesgado.
- Las licencias de los datasets de origen no se filtraron durante el entrenamiento (uso de investigacion); es necesario verificar las licencias de las fuentes antes de cualquier uso comercial, aunque el modelo se distribuya con CC-BY-4.0.
- La cobertura linguistica se limita a zulu e ingles; no se garantiza un rendimiento adecuado en otras lenguas africanas ni en castellano.
- No se documenta la longitud de contexto oficial del modelo; el entrenamiento uso 4096 tokens, por lo que contextos mas largos no estan garantizados.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso, lo que limita su uso en pipelines agenticos.
- El modo thinking esta desactivado en la evaluacion y no se documenta su comportamiento con thinking activo.
- Riesgo de alucinacion inherente a los modelos de 4,5 B, especialmente en tareas de conocimiento factual y matematicas (EM de 44,8 en AfriGSM, por debajo del base).
- El modelo no ha sido evaluado en tareas de seguridad, sesgo o toxicidad mas alla de la presencia de datos de deteccion de discurso de odio en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SaarAI/AfriqueQwen3.5-4B-zul-sft-v2
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1
- Version anterior (v1): https://huggingface.co/SaarAI/AfriqueQwen3.5-4B-zul-sft
- Dataset de entrenamiento: `SaarAI/zul-post-training-v2` (referenciado en la model card)
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- Curvas de perdida: `training_loss.png` y `training_eval_loss.png` (en el repositorio del modelo)

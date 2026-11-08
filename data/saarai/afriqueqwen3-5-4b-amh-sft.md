# SaarAI/AfriqueQwen3.5-4B-amh-sft

## Resumen

AfriqueQwen3.5-4B-amh-sft es un ajuste fino supervisado (SFT) de parametros completos del modelo McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1, orientado especificamente al idioma amharico (am). Lo desarrolla SaarAI y esta pensado para mejorar el rendimiento conversacional e instructivo en amharico manteniendo el ingles como idioma secundario. El modelo parte de la familia AfriqueLLM, una suite de modelos adaptados a lenguas africanas mediante preentrenamiento continuo (CPT) sobre aproximadamente 26.000 millones de tokens, construida sobre Qwen/Qwen3.5-4B-Base.

El modelo declara una arquitectura Qwen3.5 con 5.174.964.736 parametros reales (segun safetensors), lo que lo situa en la franja de 4-5B. El checkpoint se publica como `Qwen3_5ForConditionalGeneration` pero, segun la documentacion del modelo base, no contiene pesos de vision: solo tensores de lenguaje mas una copia del `lm_head` atado, por lo que requiere el modo `--language-model-only` en determinados flujos de despliegue. El repositorio ocupa 10,4 GB y los pesos estan en safetensors.

El modelo es relevante ahora por dos motivos: cubre un nicho poco atendido (modelos abiertos con instrucciones de calidad en amharico) y lo hace con una licencia permisiva (CC BY 4.0) sobre un modelo base abierto. Sin embargo, el propio autor lo califica como experimental: no se han ejecutado benchmarks comparativos frente al modelo base y hay indicios de sobreajuste en la tercera epoca de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer decoder-only, clase `Qwen3_5ForConditionalGeneration`; sin pesos de vision) |
| Parametros totales | 5.174.964.736 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible (la plantilla de entrenamiento usa cutoff de 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | amharico (am), ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1, que a su vez deriva de Qwen/Qwen3.5-4B-Base y fue adaptado a 20 lenguas africanas mediante preentrenamiento continuo sobre unos 26.000 millones de tokens. El checkpoint se declara como `Qwen3_5ForConditionalGeneration`, pero la documentacion del modelo base indica que no incluye pesos visuales (426 tensores de lenguaje mas una copia del `lm_head` atado, 0 tensores visuales), por lo que en la practica se comporta como un modelo de lenguaje decoder-only.

El ajuste fino se realizo con LLaMA-Factory en regimen de parametros completos, bf16, DeepSpeed ZeRO-2 con offload a CPU. Se uso la plantilla `qwen3_5_nothink` con longitud de corte de 4096 tokens, learning rate 1e-5 con scheduler coseno y 10 % de warmup, tamano de batch efectivo 32, 3 epocas (8.901 pasos). Los datos provienen de una muestra equilibrada por fuente y tarea del dataset `SaarAI/amh-post-training`: 94.916 filas de entrenamiento (unos 82 millones de tokens) y 2.000 filas de validacion, cubriendo chat e instrucciones nativas, QA, resumen y generacion, clasificacion y NER, traduccion en<->am, chat sobre codigo y continuacion de texto. Las licencias de las fuentes no se filtraron (uso de investigacion). La perdida de entrenamiento media fue 0,451 y la perdida de evaluacion final 0,5250; el minimo de evaluacion se alcanzo hacia la epoca 1,85 (0,5201 en el paso 5500) y despues repunto, lo que sugiere cierto sobreajuste.

## Capacidades

- Generacion de texto y respuesta conversacional multi-turno en amharico e ingles.
- Seguimiento de instrucciones y formato de chat mediante plantilla `qwen3_5_nothink` (modo sin cadena de pensamiento explicita).
- Respuesta a preguntas (QA) sobre conocimiento general y contextual.
- Resumen y generacion de texto a partir de documentos.
- Clasificacion de texto y reconocimiento de entidades nombradas (NER).
- Traduccion bidireccional ingles <-> amharico.
- Conversacion sobre codigo (code chat), segun la composicion del dataset de entrenamiento.
- Continuacion de texto.
- Capacidades de tool calling / function calling: no documentadas.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Vision, audio o thinking mode: no disponibles (el checkpoint no contiene pesos visuales).

## Casos de uso

- Atencion al cliente en amharico: el modelo puede gestionar conversaciones multi-turno con usuarios amharoparlantes, usando la plantilla de chat nativa y su contexto de entrenamiento de hasta 4096 tokens; adecuado por el ajuste SFT sobre datos de chat e instrucciones nativas.
- Traduccion ingles <-> amharico en pipelines de localizacion: el dataset incluye pares de traduccion, por lo que puede emplearse para pretraducir documentacion, correos o interfaces antes de revision humana.
- Resumen automatico de documentos en amharico: util para condensar noticias, informes o actas; el modelo fue entrenado en tareas de resumen y generacion.
- Extraccion de entidades y clasificacion de textos: para enrutado de tickets, etiquetado de contenido o analisis de feedback de usuarios en amharico, apoyandose en las tareas de clasificacion/NER del entrenamiento.
- Asistente de estudio o QA educativo: responder preguntas y explicar conceptos (el ejemplo de la model card es una explicacion sobre la fotosintesis), apropiado para prototipos de tutoria en amharico.
- Generacion y continuacion de texto creativo o periodistico: redaccion asistida y autocompletado en amharico gracias a las tareas de continuacion de texto del dataset.
- Prototipado de chat sobre codigo en entornos bilingues: conversacion tecnica basica en ingles con soporte de explicaciones en amharico, limitado a las trazas de code chat del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ha ejecutado ninguna comparacion de benchmarks frente al modelo base. Los unicos datos de rendimiento reportados son de entrenamiento: perdida media de entrenamiento 0,451, perdida de evaluacion final 0,5250, con minimo de evaluacion de 0,5201 en el paso 5500 (epoca ~1,85).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 10-11 GB solo para pesos (5,17B parametros a 2 bytes), mas overhead de activaciones y cache KV; en la practica, unos 12-14 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: del orden de 5-6 GB para pesos, mas overhead; en 4 bits, del orden de 3-4 GB para pesos, mas overhead (no se publican variantes cuantizadas oficiales).
- GPU recomendadas para produccion: A100 (40/80 GB), H100, L40S o A10G para mayor throughput y contextos largos.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16; en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070) seria necesario cuantizar.
- Opciones de despliegue: transformers (flujo documentado en la model card con `AutoModelForCausalLM` y `apply_chat_template`); vLLM, TGI, llama.cpp u Ollama no estan documentados para este checkpoint, y el requisito de `--language-model-only` en el modelo base condiciona algunos flujos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| SaarAI/AfriqueQwen3.5-4B-amh-sft | 5,17B | no disponible (entrenado con cutoff 4096) | am, en | CC BY 4.0 | SFT completo en amharico; experimental, sin benchmarks |
| McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1 | ~4B (familia AfriqueQwen3.5-4B) | no disponible | 50 lenguas (incluye am) | no disponible en la informacion | Modelo base instructivo multilingue del que deriva este SFT |
| McGill-NLP/AfriqueQwen3.5-4B | ~4B | no disponible | 20 lenguas africanas | no disponible en la informacion | Version CPT de la suite AfriqueLLM sobre Qwen3.5-4B-Base |
| Qwen/Qwen3.5-4B-Base | ~4B | no disponible | multilingue (sin detalle) | no disponible en la informacion | Modelo base original de la familia Qwen3.5 |

## Limitaciones y advertencias

- Modelo declarado experimental por el autor; puede producir texto incorrecto o sesgado.
- No se han ejecutado benchmarks comparativos frente al modelo base, por lo que la mejora real en amharico no esta cuantificada.
- Indicios de sobreajuste: la perdida de evaluacion minima se alcanzo hacia la epoca 1,85 y aumento en la epoca 3 mientras la de entrenamiento seguia bajando.
- Riesgo de alucinacion no evaluado; sin salvaguardas documentadas.
- Cobertura limitada a dos idiomas (am, en); el rendimiento fuera de ellos no esta documentado.
- Longitud de contexto maxima no declarada; el entrenamiento uso corte de 4096 tokens.
- Las licencias de las fuentes del dataset de entrenamiento no se filtraron (uso de investigacion); es necesario verificar las licencias de los datasets originales antes de cualquier uso comercial, aunque el modelo se publica bajo CC BY 4.0.
- El checkpoint declara `Qwen3_5ForConditionalGeneration` sin pesos de vision; requiere configuracion de solo lenguaje en algunos flujos de despliegue.
- Sin soporte documentado de tool calling ni de razonamiento multi-paso.
- Sin variantes cuantizadas oficiales publicadas; el despliegue eficiente exige cuantizacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SaarAI/AfriqueQwen3.5-4B-amh-sft
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1
- Modelo AfriqueQwen3.5-4B: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B
- Modelo Instruct v1 de la familia: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B-Instruct-v1
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- Dataset de post-entrenamiento: SaarAI/amh-post-training (referenciado en la model card; no se proporciona URL directa en la informacion disponible)

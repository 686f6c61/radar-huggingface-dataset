# SaarAI/AfriqueQwen3.5-4B-zul-sft

## Resumen

AfriqueQwen3.5-4B-zul-sft es un ajuste fino supervisado (SFT) de parametros completos del modelo McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1, especializado en zulu (isiZulu). Lo desarrolla SaarAI y se entrena con LLaMA-Factory sobre una muestra equilibrada de SaarAI/zul-post-training: 99.937 filas de entrenamiento (unos 49 millones de tokens) y 2.000 filas de validacion. El modelo parte de la familia AfriqueQwen3.5 de McGill-NLP, derivada de Qwen/Qwen3.5-4B-Base mediante preentrenamiento continuado sobre aproximadamente 26.000 millones de tokens para 20 lenguas africanas.

La arquitectura es la de Qwen3.5 (transformer causal decoder-only) con una longitud de contexto nativa de 32.768 tokens, aunque el entrenamiento se realizo con una longitud de corte de 4.096 tokens. El checkpoint contiene 5.174.964.736 parametros reales en safetensors, lo que lo situa por encima de los 4B nominales de la denominacion. El objetivo es cubrir tareas de chat, QA, resumen, clasificacion, NER/POS, traduccion en<->zu y continuacion de texto en zulu, un idioma con escasa representacion en modelos abiertos.

Es relevante ahora porque los modelos abiertos con buen rendimiento en lenguas africanas siguen siendo escasos y este checkpoint, aunque experimental, publica pesos completos con licencia CC BY 4.0. El autor advierte que no se han ejecutado comparativas de benchmarks contra el modelo base, por lo que debe tratarse como un artefacto de investigacion mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (familia Qwen3.5) |
| Parametros totales | 5.174.964.736 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens nativos (entrenamiento con corte a 4.096) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | zulu (zu), ingles (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de la familia Qwen3.5, heredado del checkpoint McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1, que a su vez deriva de Qwen/Qwen3.5-4B-Base tras preentrenamiento continuado sobre unos 26.000 millones de tokens en 20 lenguas africanas. El ajuste realizado por SaarAI es de parametros completos (full fine-tuning) en bf16, con DeepSpeed ZeRO-2 y offload a CPU, plantilla de chat `qwen3_5_nothink` y longitud de corte de 4.096 tokens.

Los hiperparametros documentados son: learning rate 1e-5 con scheduler coseno y 10% de warmup, tamano de batch efectivo 32, 3 epocas y 9.372 pasos. La perdida de entrenamiento promedio fue 0.857 y la perdida final de evaluacion 1.0826. La eval loss minima se alcanzo alrededor de la epoca 2 (1.0448 en el paso 6.000) y subio ligeramente en la epoca 3 mientras la train loss seguia bajando, lo que el autor interpreta como un cierto sobreajuste al conjunto de entrenamiento. No se documenta RLHF ni DPO en esta etapa.

## Capacidades

- Generacion de texto conversacional en zulu e ingles mediante plantilla de chat compatible con `apply_chat_template`.
- Respuesta a instrucciones y preguntas (QA) en zulu, entrenado sobre datos nativos de chat e instrucciones.
- Resumen y generacion de texto a partir de documentos.
- Clasificacion de texto, reconocimiento de entidades nombradas (NER) y etiquetado morfosintactico (POS).
- Traduccion bidireccional ingles<->zulu.
- Chat sobre codigo (code chat) segun la composicion del dataset de entrenamiento.
- Continuacion de texto.
- Modo "nothink" en la plantilla de chat (sin cadena de razonamiento explicita).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Atencion al cliente en zulu: el modelo puede mantener conversaciones multi-turno en isiZulu gracias a la plantilla de chat y a un contexto nativo de 32.768 tokens, adecuado para historiales largos de conversacion.
- Traduccion ingles<->zulu en pipelines de localizacion: se puede integrar como paso de traduccion automatica para contenidos que deban publicarse en zulu, con la ventaja de haber sido entrenado especificamente en ese par.
- Resumen automatico de documentos en zulu: util para sintetizar informes, actas o articulos en isiZulu en entornos administrativos o editoriales.
- Extraccion de entidades y etiquetado POS para corpus linguisticos: sirve como anotador automatico en proyectos de linguistica computacional sobre zulu, ya que el dataset de entrenamiento incluye tareas de NER y POS.
- Clasificacion de textos en zulu: moderacion de contenido, categorizacion de tickets o triaje de mensajes en plataformas que operen en ese idioma.
- Asistente de codigo con interfaz en zulu: el modelo fue entrenado con code chat, por lo que puede explicar o comentar fragmentos de codigo respondiendo en zulu, util para formacion tecnica en ese idioma.
- Generacion y continuacion de texto para redaccion asistida en zulu: borradores de articulos, descripciones de producto o material educativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ha ejecutado ninguna comparativa de benchmarks contra el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 10-11 GB solo para pesos (5,17B parametros), mas overhead de activaciones y cache KV; con contexto largo la demanda crece de forma apreciable.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 5-6 GB para pesos; en 4 bits, en torno a 3 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas para bf16 con contexto completo: A100 40/80 GB, H100, L40S o RTX 6000 Ada; para contexto corto (4.096 tokens) una RTX 4090 de 24 GB es suficiente.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en bf16 con contexto moderado (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090); en 8 bits cabria en GPUs de 8 GB.
- Opciones de despliegue: transformers (documentado por el autor), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF (no se publican pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| SaarAI/AfriqueQwen3.5-4B-zul-sft | 5,17B | 32.768 (entrenado a 4.096) | zu, en | CC BY 4.0 | SFT full-parameter sobre AfriqueQwen3.5-4B-50Langs-Instruct-v1; sin benchmarks publicados |
| McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1 | no disponible | no disponible | 50 idiomas (incluye lenguas africanas) | no disponible | Modelo base del anterior; ajuste instructivo multilingue |
| McGill-NLP/AfriqueQwen3.5-4B | no disponible | 32.768 | 20 lenguas africanas | CC BY 4.0 | Preentrenamiento continuado sobre ~26B tokens desde Qwen3.5-4B-Base |
| Qwen/Qwen3.5-4B-Base | no disponible | no disponible | no disponible | no disponible | Modelo original de Qwen sobre el que se construye la familia AfriqueQwen3.5 |

## Limitaciones y advertencias

- El autor califica el modelo como experimental y advierte de que puede producir texto incorrecto o sesgado.
- No hay benchmarks publicados ni comparacion con el modelo base, por lo que no se puede cuantificar la mejora real en zulu.
- Indicios de sobreajuste: la eval loss minima se alcanzo en la epoca 2 y subio en la epoca 3 mientras la train loss seguia descendiendo.
- Las licencias de las fuentes del dataset de entrenamiento no se filtraron (uso de investigacion); es necesario revisar las licencias de los datasets originales antes de cualquier uso comercial, aunque el checkpoint se publique como CC BY 4.0.
- Cobertura linguistica limitada a zulu e ingles; el rendimiento fuera de esos idiomas no esta documentado.
- Contexto nativo de 32.768 tokens, pero el entrenamiento se hizo con corte a 4.096, por lo que el comportamiento mas alla de esa longitud no esta validado.
- No se documentan capacidades de tool calling, agentes, vision ni audio.
- Riesgo de alucinacion inherente a un modelo de 5B ajustado con SFT y sin etapa de alineamiento adicional documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SaarAI/AfriqueQwen3.5-4B-zul-sft
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1
- AfriqueQwen3.5-4B (McGill-NLP): https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B
- Ficha de AfriqueQwen3.5 en AxForge: https://catalog.axforge.ai/models/afriqueqwen3-5/
- LLaMA-Factory (repositorio): https://github.com/hiyouga/LLaMA-Factory

# SaarAI/AfriqueQwen3.5-4B-kin-sft-v3

## Resumen

AfriqueQwen3.5-4B-kin-sft-v3 es un ajuste fino supervisado (SFT) de parametros completos del modelo McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1, desarrollado por SaarAI para mejorar el rendimiento en kinyarwanda (rw). Se trata de un modelo de 4.539 millones de parametros (4,54 B) construido sobre la arquitectura Qwen3.5, orientado a generacion de texto conversacional y multimodal (image-text-to-text) segun los tags del repositorio. El entrenamiento se realizo con LLaMA-Factory sobre el dataset SaarAI/kin-post-training-v2, que contiene 715.447 filas de entrenamiento y 2.000 de validacion.

La relevancia del modelo radica en su enfoque: es un ajuste sobre un modelo multilingue ya instruido (50 idiomas) especializado en un idioma de bajos recursos como el kinyarwanda, cubriendo tareas de traduccion en<->kin, chat, seguimiento de instrucciones, clasificacion, NER, POS tagging y generacion de articulos. El checkpoint publicado corresponde al paso 20.000 (epoca 0,89), seleccionado por tener la menor perdida de evaluacion (0,7189) frente a los pesos finales del entrenamiento de 3 epocas (0,7667), que mostraron sobreajuste.

Es importante senalar que el autor lo describe explicitamente como experimental: no se ha evaluado en ningun benchmark y existe riesgo de contaminacion de datos, ya que el conjunto de entrenamiento incluye fuentes derivadas de benchmarks publicos (sib200_bench, injongo_intent_bench, afrisenti_bench). El modelo esta publicado con licencia CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer decoder-only, segun tag `qwen3_5`); multimodal image-text-to-text segun pipeline_tag |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card (longitud de corte de entrenamiento: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | kinyarwanda (rw), ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1, un modelo instruido multilingue de la familia Qwen3.5 con 4,54 B de parametros. El ajuste realizado por SaarAI es un fine-tuning completo de todos los parametros (full fine-tuning), no un ajuste con adaptadores, ejecutado sobre una unica GPU H100 de 80 GB en bf16 puro, con AdamW de 8 bits, kernels Liger y sin DeepSpeed. Se empleo la plantilla `qwen3_5_nothink` con longitud de corte de 4096 tokens y lotes agrupados por longitud.

La configuracion de entrenamiento fue: tasa de aprendizaje 1e-5 con decaimiento coseno sobre 3 epocas y 3% de warmup, batch de 16 con 2 pasos de acumulacion de gradiente (batch efectivo 32), totalizando 67.074 pasos (22.358 por epoca) en 29,1 horas. El dataset completo SaarAI/kin-post-training-v2 contiene 715.447 filas de entrenamiento (sin muestreo, de 8 ficheros) y 2.000 filas de validacion (muestreadas de 4.482). Las tareas dominantes son traduccion en<->kin (unas 433.000 filas), chat de codigo, chat, seguimiento de instrucciones y continuacion de texto; en menor medida NLI, analisis de sentimiento, clasificacion de intencion/tema/noticias, generacion de titulares y articulos, POS tagging, QA y NER.

El checkpoint publicado no es el final del entrenamiento: corresponde al paso 20.000 (epoca 0,89), con perdida de evaluacion de 0,7189, porque la perdida de evaluacion comenzo a subir al inicio de la epoca 2 y de la epoca 3 mientras la perdida de entrenamiento seguia bajando (sobreajuste). La perdida de entrenamiento media en los primeros 500 pasos fue 1,337, y en los pasos 19.501-20.000 fue 0,700; la media sobre las 3 epocas fue 0,6026. Para comparar, la version v2 (1 epoca) alcanzo 0,7329 de perdida de evaluacion en las mismas filas de validacion.

## Capacidades

- Generacion de texto conversacional en kinyarwanda e ingles, con soporte de plantilla de chat (`apply_chat_template`).
- Traduccion bidireccional ingles<->kinyarwanda, la tarea con mayor volumen de datos de entrenamiento (unas 433.000 filas).
- Seguimiento de instrucciones (instruction following) y continuacion de texto.
- Clasificacion de texto: NLI, analisis de sentimiento, clasificacion de intencion, tema y noticias.
- Etiquetado linguistico: POS tagging y reconocimiento de entidades nombradas (NER).
- Generacion de titulares y articulos, y respuesta a preguntas (QA).
- Chat de codigo (code chat) segun la composicion del dataset de entrenamiento.
- Capacidad multimodal image-text-to-text declarada en los tags del repositorio (heredada del modelo base), aunque no se detalla su alcance en la model card.
- Soporte de tool calling / function calling: no disponible (no se documenta explicitamente).
- Modo thinking: no se usa; el entrenamiento emplea la plantilla `qwen3_5_nothink`.

## Casos de uso

- Traduccion en produccion ingles<->kinyarwanda: es la tarea con mas datos de entrenamiento (unas 433.000 filas), por lo que el modelo esta especialmente ajustado para traducir documentacion, contenido web o comunicaciones internas entre ambos idiomas.
- Atencion al cliente en kinyarwanda: el modelo puede mantener conversaciones multi-turno mediante la plantilla de chat, adecuado para entidades que operan en Ruanda y necesitan asistencia automatizada en lengua local.
- Clasificacion y enrutado de tickets o mensajes: gracias a su entrenamiento en clasificacion de intencion, tema y sentimiento, puede usarse para etiquetar automaticamente consultas entrantes y dirigirlas al departamento correspondiente.
- Extraccion de informacion estructurada: con capacidades de NER y POS tagging, puede emplearse para identificar entidades, nombres y categorias gramaticales en corpus en kinyarwanda para pipelines de analisis linguistico o periodistico.
- Generacion de contenido editorial: generacion de titulares y articulos en kinyarwanda para medios digitales o boletines, aprovechando la tarea de generacion de articulos incluida en el entrenamiento.
- Asistencia a la investigacion linguistica: como modelo de referencia para experimentos de NLP en un idioma de bajos recursos, util para comparar tecnicas de ajuste fino (v2 frente a v3) sobre el mismo dataset.
- Prototipado de asistentes de codigo en entornos bilingues: el chat de codigo incluido en el dataset permite explorar asistentes que respondan en kinyarwanda sobre tareas de programacion, aunque sin garantias de calidad en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo no ha sido evaluado en ningun benchmark y que la unica metrica es la perdida de evaluacion sobre las filas de validacion. Se reproduce a continuacion la evolucion de la perdida de evaluacion durante el entrenamiento:

| Paso | Epoca | Perdida de evaluacion |
|---:|---:|---:|
| 2.500 | 0,11 | 0,8742 |
| 5.000 | 0,22 | 0,8100 |
| 7.500 | 0,34 | 0,7836 |
| 10.000 | 0,45 | 0,7600 |
| 12.500 | 0,56 | 0,7478 |
| 15.000 | 0,67 | 0,7350 |
| 17.500 | 0,78 | 0,7293 |
| 20.000 | 0,89 | 0,7189 (checkpoint publicado) |
| 22.500 | 1,01 | 0,7293 |
| 30.000 | 1,34 | 0,7277 |
| 42.500 | 1,90 | 0,7254 |
| 45.000 | 2,01 | 0,7585 |
| 55.000 | 2,46 | 0,7670 |
| 67.074 | 3,00 | 0,7667 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de 4,54 B en bf16 se requieren aproximadamente 9,1 GB solo para los pesos (tamano del repo), mas memoria para el contexto y los estados de activacion.
- GPU recomendadas: el entrenamiento se realizo en 1x H100 80 GB; para inferencia no se especifican requisitos.
- GPU de consumo: no confirmado por el autor. Por tamano, un modelo de 4,54 B en bf16 podria caber en GPUs de consumo con 16-24 GB de VRAM, pero no hay datos oficiales.
- Opciones de despliegue: el autor solo documenta uso con `transformers` (AutoModelForCausalLM, AutoTokenizer, `device_map="auto"`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SaarAI/AfriqueQwen3.5-4B-kin-sft-v3 | 4,54 B | no disponible (corte de entrenamiento 4096) | CC-BY-4.0 | SFT completo para kinyarwanda; sin benchmarks |
| SaarAI/AfriqueQwen3.5-4B-kin-sft-v2 | 4,54 B (presumible) | no disponible | no disponible | Version de 1 epoca; perdida de evaluacion 0,7329 frente a 0,7189 de v3 |
| McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1 | 4,54 B (presumible) | no disponible | no disponible | Modelo base multilingue (50 idiomas) instruido; sin datos de rendimiento en la informacion disponible |

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo es experimental y puede producir texto incorrecto o sesgado.
- No se ha evaluado en ningun benchmark; se desconoce si supera a la version v2 en tareas posteriores (downstream).
- Riesgo de contaminacion de datos: el conjunto de entrenamiento incluye fuentes construidas a partir de benchmarks publicos (sib200_bench, injongo_intent_bench, afrisenti_bench) y no se ha comprobado si solapan con particiones de test publicas, por lo que las puntuaciones de benchmark podrian estar infladas.
- Las licencias de las fuentes del dataset no se filtraron (uso de investigacion); el autor advierte de que se deben comprobar las licencias de los datasets de origen antes de cualquier uso comercial.
- Aunque los pesos se publican con CC-BY-4.0, la procedencia mixta de los datos de entrenamiento anade incertidumbre juridica para uso comercial.
- Cobertura limitada a dos idiomas (kinyarwanda e ingles); no se documenta el rendimiento en otros idiomas del modelo base.
- Los pesos publicados corresponden a la epoca 0,89, no al final del entrenamiento; las epocas 2 y 3 mostraron sobreajuste.
- No se documentan capacidades de tool calling ni de agentes multi-paso.
- El modelo base es de noviembre de 2026; no se dispone de informacion sobre sesgos especificos medidos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SaarAI/AfriqueQwen3.5-4B-kin-sft-v3
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1
- Version anterior v2: https://huggingface.co/SaarAI/AfriqueQwen3.5-4B-kin-sft-v2
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Dataset de entrenamiento: SaarAI/kin-post-training-v2 (referenciado en la model card; no se proporciona URL directa en la informacion disponible)

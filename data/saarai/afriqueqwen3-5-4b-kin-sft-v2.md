# SaarAI/AfriqueQwen3.5-4B-kin-sft-v2

## Resumen

AfriqueQwen3.5-4B-kin-sft-v2 es un ajuste fino supervisado de parametros completos (full fine-tuning) del modelo McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1, orientado a mejorar el rendimiento en kinyarwanda (idioma `rw`). Lo desarrolla SaarAI y se entrena con LLaMA-Factory sobre el dataset `SaarAI/kin-post-training-v2`, con 715.447 filas de entrenamiento y 2.000 de validacion. El modelo hereda la arquitectura Qwen3.5 (tag `qwen3_5`) del modelo base y conserva su naturaleza multimodal image-text-to-text, aunque la ficha se centra en generacion de texto conversacional.

El modelo resuelve el problema de la baja cobertura de idiomas de bajos recursos en los LLM: el kinyarwanda es un idioma con escasisimos recursos digitales y pocos modelos ajustados de forma especifica. Este SFT cubre tareas muy diversas (traduccion en<->kin, chat, seguimiento de instrucciones, generacion de codigo, NLI, analisis de sentimiento, clasificacion de intenciones, POS tagging, QA y NER) en un unico checkpoint, lo que lo hace util como modelo generalista para el idioma.

Con 4.539.265.536 parametros (aproximadamente 4,54B), licencia CC-BY-4.0 y pesos en safetensors, es un modelo de tamano medio que puede desplegarse en hardware de una sola GPU. No obstante, el autor lo marca explicitamente como experimental: no se han ejecutado benchmarks comparativos frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); pipeline image-text-to-text en el modelo base |
| Parametros totales | 4.539.265.536 (aprox. 4,54B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como limite oficial; el entrenamiento uso cutoff de 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16/safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | kinyarwanda (`rw`), ingles (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (repo de 9,1 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parametros completos sobre el checkpoint instructivo McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1, que a su vez deriva de la familia Qwen3.5. La arquitectura es un transformer decoder-only de aproximadamente 4,54B parametros, con capacidades multimodales heredadas del modelo base (image-text-to-text), aunque el entrenamiento SFT se ha realizado sobre texto conversacional. No se dispone de informacion detallada sobre la composicion exacta de capas, atencion o mecanismos especificos de la arquitectura Qwen3.5 en la informacion proporcionada.

El entrenamiento se ejecuto en 1x H100 80GB con pesos en bf16 puro, AdamW de 8 bits, kernels Liger y sin DeepSpeed. Se uso la plantilla `qwen3_5_nothink`, longitud de corte de 4096 tokens y batches agrupados por longitud. Hiperparametros: learning rate 1e-5 con schedule coseno y 3% de warmup, batch 16 con acumulacion de gradiente x2 (batch efectivo 32), 1 epoch = 22.358 pasos, aproximadamente 9,9 horas. El dataset de entrenamiento fue el conjunto completo `SaarAI/kin-post-training-v2` (715.447 filas de train de 8 ficheros, sin muestreo; 2.000 filas de validacion muestreadas de 4.482). Las tareas mayoritarias son traduccion en<->kin (unas 433k filas), chat de codigo, chat, seguimiento de instrucciones y continuacion de texto; las menores incluyen NLI, sentimiento, clasificacion de intenciones/topicos/noticias, generacion de titulares y articulos, POS tagging, QA y NER. No se filtro por licencia de las fuentes (uso de investigacion).

La loss de entrenamiento promedio del epoch fue 0,7770 (primeras 500 pasos: 1,199; ultimas 500: 0,726). La eval loss final sobre 2.000 filas de validacion fue 0,7329, con descenso monotono en cada evaluacion (cada 2.500 pasos) y estabilizacion a partir del paso 17.500. El autor no reporta senales de overfitting y publica los pesos del paso final, que coincide con la menor eval loss.

## Capacidades

- Generacion de texto conversacional multi-turno en kinyarwanda e ingles.
- Traduccion bidireccional en<->kin (la tarea con mas volumen de entrenamiento, unas 433k filas).
- Seguimiento de instrucciones (instruction following) y continuacion de texto.
- Generacion de codigo y chat sobre codigo (code chat).
- Razonamiento y respuesta a preguntas (QA).
- Tareas de comprension: NLI, analisis de sentimiento, clasificacion de intenciones, topicos y noticias.
- Etiquetado linguistico: POS tagging y reconocimiento de entidades nombradas (NER).
- Generacion de titulares y articulos.
- Capacidad multimodal image-text-to-text heredada del modelo base (no validada en esta ficha).
- Plantilla de chat `qwen3_5_nothink` (modo sin razonamiento explicito).

## Casos de uso

- Traduccion en<->kin en produccion: el modelo concentra el mayor volumen de entrenamiento en esta tarea (unas 433k filas), por lo que es adecuado para pipelines de traduccion automatica entre ingles y kinyarwanda en entornos editoriales, ONG o administracion publica.
- Atencion al cliente en kinyarwanda: puede gestionar conversaciones multi-turno con contexto de hasta 4096 tokens (limite de entrenamiento) para responder consultas en `rw`, con la salvedad de que debe validarse la calidad antes de exponerlo a usuarios finales.
- Asistente de codigo bilingue: el entrenamiento incluye code chat, lo que permite usarlo como asistente de programacion que explica o genera codigo en ingles y responde en kinyarwanda, util para formacion tecnica en la region.
- Procesamiento de documentos y noticias: generacion de titulares y articulos junto con clasificacion de topicos y noticias permite construir pipelines de resumen y categorizacion de contenido en kinyarwanda.
- Analisis de sentimiento e intenciones para moderacion o analisis de mercado: el modelo fue entrenado en clasificacion de sentimiento e intenciones, por lo que puede emplearse para etiquetar reseñas o mensajes en `rw`.
- Extraccion de informacion estructurada: NER y POS tagging permiten usarlo como base para anotacion linguistica, construccion de corpus o extraccion de entidades en textos en kinyarwanda.
- Investigacion linguistica y creacion de recursos: al ser un modelo abierto con licencia CC-BY-4.0 y pesos safetensors, sirve como punto de partida para nuevos ajustes o para evaluar el estado del arte en idiomas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ha ejecutado ninguna comparacion de benchmarks frente al modelo base. Los unicos datos de rendimiento son las losses de entrenamiento y validacion:

| Metrica | Valor |
|---|---|
| Train loss (media del epoch) | 0,7770 |
| Train loss, primeros 500 pasos (media) | 1,199 |
| Train loss, ultimos 500 pasos (media) | 0,726 |
| Eval loss final (2.000 filas) | 0,7329 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9-10 GB solo para pesos (4,54B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda 16-24 GB para contexto largo.
- VRAM estimada en cuantizacion de 8 bits: unos 5-6 GB de pesos; en 4 bits: unos 3-4 GB de pesos (cuantizaciones no publicadas por el autor, requeriria conversion propia).
- GPU recomendadas: H100 80GB o A100 80GB para entrenamiento o inferencia en bf16 con contexto completo; A100 40GB o L40S para inferencia comoda.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas (RTX 4090, RTX 4080, RTX 3090) en bf16 con contexto moderado; en 8/4 bits cabria en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (soporte nativo, tal como indica el autor), y previsiblemente vLLM, TGI o llama.cpp/Ollama tras conversion a GGUF, aunque el autor no publica artefactos para estas herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| SaarAI/AfriqueQwen3.5-4B-kin-sft-v2 | 4,54B | 4096 (entrenamiento) | rw, en | CC-BY-4.0 | SFT especifico para kinyarwanda; sin benchmarks |
| McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1 | no disponible | no disponible | 50 idiomas (segun nombre) | no disponible en la informacion | Modelo base; cobertura multilingue amplia |
| Alternativas especificas para kinyarwanda | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas de la misma categoria; el autor no ha publicado benchmarks.

## Limitaciones y advertencias

- Modelo marcado como experimental por el autor: puede producir texto incorrecto o sesgado.
- No se ha ejecutado ninguna comparacion de benchmarks frente al modelo base, por lo que la mejora real en kinyarwanda no esta cuantificada.
- Riesgo de alucinacion inherente a los LLM de este tamano, agravado por la escasez de datos de calidad en kinyarwanda.
- Sesgos potenciales derivados de los datasets de origen; el autor no filtro por licencia las fuentes (uso de investigacion), por lo que las licencias de los datasets subyacentes deben revisarse antes de cualquier uso comercial.
- La licencia del modelo es CC-BY-4.0, pero las licencias de los datos de entrenamiento no estan filtradas: esto puede limitar el uso comercial aunque la licencia del checkpoint lo permita.
- Cobertura linguistica limitada a `rw` y `en`; el rendimiento en otros idiomas no esta garantizado.
- El entrenamiento uso un cutoff de 4096 tokens; no se garantiza un comportamiento correcto con contextos mas largos.
- La plantilla de chat es `qwen3_5_nothink`; no se entreno un modo de razonamiento explicito.
- La capacidad multimodal heredada del modelo base no ha sido validada en este ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SaarAI/AfriqueQwen3.5-4B-kin-sft-v2
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1
- Dataset de entrenamiento: `SaarAI/kin-post-training-v2` (referenciado en la model card; no se proporciona URL directa)
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory

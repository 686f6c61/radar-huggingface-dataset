# SaarAI/AfriqueQwen3.5-4B-amh-sft-v2

## Resumen

AfriqueQwen3.5-4B-amh-sft-v2 es un ajuste fino supervisado (SFT) de parametros completos sobre el modelo McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1, orientado especificamente al amharico. Lo desarrolla SaarAI con LLaMA-Factory y sustituye la version anterior (v1) entrenada sobre datos muestreados. El modelo parte de la familia Qwen3.5, con 4.539.265.536 parametros totales segun los pesos en safetensors, y se distribuye bajo licencia CC-BY-4.0.

El problema que aborda es la escasez de modelos generativos de calidad para amharico, una de las lenguas con menos recursos en el ecosistema de IA. El entrenamiento cubre 38 tipos de tarea (chat, traduccion am-ingles, resumen, NER, analisis de sentimiento, generacion de poemas y canciones, clasificacion, correccion ortografica, entre otras) sobre 802.189 filas de entrenamiento y 2.000 de validacion, lo que lo convierte en uno de los SFT para amharico con mayor cobertura de tareas publicados hasta la fecha.

Es relevante porque demuestra un pipeline reproducible de ajuste completo sobre una GPU H100 en unas 20 horas, con curvas de perdida documentadas y sin senales de sobreajuste. Aun asi, el autor lo califica explicitamente como experimental, sin benchmarks frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5`) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (cutoff de entrenamiento: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | amharico (am), ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5, heredado del checkpoint base instruido multilingue de McGill-NLP. El ajuste es de parametros completos (full fine-tune) en bf16 puro, con AdamW de 8 bits y kernels Liger, sin DeepSpeed, sobre una unica H100 de 80 GB. Se uso la plantilla `qwen3_5_nothink`, longitud de corte de 4096 tokens y lotes agrupados por longitud.

El entrenamiento empleo el dataset completo SaarAI/amh-post-training-v2: 802.189 filas de entrenamiento procedentes de 9 ficheros y 2.000 filas de validacion (muestreadas de 5.565). Hiperparametros: tasa de aprendizaje 1e-5 con schedule coseno y 3 % de warmup, batch de 16 con 2 pasos de acumulacion (batch efectivo 32), 1 epoca equivalente a 25.069 pasos y unas 20 horas de computo. La perdida media de entrenamiento fue 0,5487 y la perdida final de evaluacion 0,5568, con descenso monotono en cada evaluacion (cada 2.500 pasos) y meseta a partir del paso 17.500. Los pesos subidos corresponden al paso final, que tambien registro la menor perdida de validacion.

## Capacidades

- Generacion de texto conversacional en amharico e ingles, con plantilla de chat compatible con `apply_chat_template`.
- Traduccion bidireccional amharico-ingles y traduccion de documentos.
- Resumen de textos (incluye datos tipo XL-Sum).
- Generacion y completado de poemas, mezmur y zefen (generos musicales y literarios etiopes).
- Clasificacion de noticias, topicos, intenciones y sentimiento (datos AfriSenti).
- Reconocimiento de entidades nombradas (MasakhaNER).
- Inferencia de lenguaje natural (NLI), identificacion de parafrasis y enlace de eventos.
- Correccion ortografica y simplificacion de texto.
- Chat de codigo e instrucciones generales dentro del mix de tareas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking: desactivado en el entrenamiento (plantilla `nothink`).
- Vision: no disponible; aunque el tag del repo incluye `image-text-to-text`, la model card no documenta capacidades multimodales y el pipeline declarado es `text-generation`.

## Casos de uso

- Atencion al cliente en amharico: gestion de conversaciones multiturno en la lengua del usuario, con el limite practico de 4096 tokens visto en entrenamiento para hilos largos.
- Traduccion amharico-ingles en pipelines editoriales: el mix incluye traduccion de frases y documentos, util para localizar contenido etiope hacia mercados angloparlantes.
- Resumen automatico de noticias y documentos: adecuado para medios etiopes que necesitan sintesis rapida de textos largos con vocabulario nativo.
- Analisis de sentimiento en redes sociales: clasificacion de opiniones en amharico sobre datos tipo AfriSenti, util para monitorizacion de marca.
- Extraccion de entidades para sistemas de informacion: NER sobre textos administrativos o periodisticos para alimentar bases de datos estructuradas.
- Correccion ortografica y simplificacion de textos: asistencia a redactores o estudiantes que necesitan normalizar y simplificar prosa en amharico.
- Generacion creativa (poemas, mezmur, zefen): composicion asistida de letras y versos con estilo cultural etiope.
- Prototipado de asistentes de voz en amharico: el modelo como backend textual dentro de un pipeline ASR-TTS para entornos con pocos recursos linguisticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ha ejecutado ninguna comparacion contra el modelo base y que debe tratarse como experimental.

Unicos datos de rendimiento publicados (perdida, no benchmarks):

| Metrica | Valor |
|---|---|
| Perdida media de entrenamiento (epoca) | 0,5487 |
| Perdida de entrenamiento, primeros 500 pasos | 0,812 |
| Perdida de entrenamiento, ultimos 500 pasos | 0,519 |
| Perdida final de evaluacion (2.000 filas) | 0,5568 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 9-10 GB solo para pesos (4,54 mil millones de parametros a 2 bytes), mas overhead de activaciones y cache KV; con contexto de 4096 tokens conviene reservar 12-16 GB.
- GPU recomendadas para servicio: A100 40/80 GB o H100 80 GB para lotes grandes y throughput alto; L40S o RTX 6000 Ada como alternativa.
- GPU consumer: cabe en RTX 4090 (24 GB) y previsiblemente en RTX 3090 (24 GB) en bf16; en GPUs de 16 GB requeriria cuantizacion, no publicada en el repo.
- Opciones de despliegue: transformers (soporte nativo, como muestra la model card), vLLM y TGI para servir a escala; llama.cpp/Ollama solo si se generan pesos GGUF, que no estan disponibles en el repositorio.
- Latencia y throughput: no disponibles; el autor solo documenta el coste de entrenamiento (1 H100, ~20 h para 25.069 pasos con batch efectivo 32).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| SaarAI/AfriqueQwen3.5-4B-amh-sft-v2 | 4,54 B | no disponible (entrenado a 4096) | am, en | CC-BY-4.0 | SFT completo para amharico, sin benchmarks |
| McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1 (base) | ~4,5 B | no disponible | 50 lenguas africanas | no disponible en esta ficha | Modelo base instruido multilingue |
| SaarAI/AfriqueQwen3.5-4B-amh-sft (v1) | ~4,5 B | no disponible | am, en | no disponible en esta ficha | Predecesor con datos muestreados, 3 epocas, perdida de validacion 0,5250 sobre otro conjunto |

La comparacion con v1 no es directa: el propio autor advierte que las perdidas de validacion no son comparables por usar conjuntos de validacion distintos. No se dispone de datos de benchmarks que permitan comparar calidad frente a alternativas.

## Limitaciones y advertencias

- Modelo declarado experimental por el autor: puede producir texto incorrecto o sesgado.
- Sin benchmarks frente al modelo base ni frente a alternativas; no hay evidencia cuantitativa de mejora en calidad.
- Sesgos conocidos: no documentados, pero el mix de datos incluye fuentes diversas cuyas licencias no fueron filtradas, lo que puede arrastrar sesgos de origen.
- Riesgo de alucinacion: inherente a modelos generativos de este tamano, agravado por la ausencia de evaluacion factual.
- Contexto: el entrenamiento uso un corte de 4096 tokens; no se documenta la ventana nativa del modelo base ni comportamiento en contextos mas largos.
- Cobertura linguistica limitada a amharico e ingles; no se garantiza calidad en otras lenguas.
- Licencia: el modelo es CC-BY-4.0, pero las licencias de los datasets de origen no fueron filtradas (uso de investigacion); es imprescindible revisarlas antes de cualquier uso comercial.
- Modo thinking desactivado en el entrenamiento, por lo que no debe esperarse razonamiento extendido tipo chain-of-thought.
- El tag `image-text-to-text` del repositorio no esta respaldado por documentacion de capacidades de vision; no asumir multimodalidad.
- Para produccion: validar con evaluacion propia en amharico antes de desplegar, dado que no existe benchmark publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SaarAI/AfriqueQwen3.5-4B-amh-sft-v2
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1
- Version anterior (v1): https://huggingface.co/SaarAI/AfriqueQwen3.5-4B-amh-sft
- Dataset de entrenamiento: SaarAI/amh-post-training-v2 (referenciado en la model card; no se proporciona URL directa en la informacion disponible)
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada.

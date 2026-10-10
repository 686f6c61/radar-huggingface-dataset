# francesca9805/swa-latn-100mb-after-ppt-mp-struct-core-100mb-ckpt500_seed10

## Resumen

El modelo `francesca9805/swa-latn-100mb-after-ppt-mp-struct-core-100mb-ckpt500_seed10` es un ajuste fino (fine-tuning) de tipo SFT sobre otro modelo de la misma autora, `francesca9805/swa-latn-100mb-ppt-mp-struct-core-100mb_seed455`. Se trata de un modelo pequeño de generación de texto con 124.770.816 parámetros, construido sobre la arquitectura GPT-2 y publicado en HuggingFace dentro de la librería `transformers`. El prefijo `swa-latn` del identificador sugiere un ámbito de lengua suajili en escritura latina, aunque no hay confirmación oficial en la model card.

El modelo no presenta datos de benchmarks, licencia declarada ni idiomas soportados de forma explícita. Su relevancia radica en ser un ejemplo de ajuste fino reproducible con TRL (versión 0.23.0) y en su tamaño reducido, que permite desplegarlo en hardware de consumo e incluso en CPU. Está orientado a tareas de generación de texto conversacional de un solo turno o de pocos turnos, según el ejemplo de uso incluido en la model card.

Por sus dimensiones y su naturaleza experimental, se enmarca en la categoría de modelos pequeños (por debajo de los 200 millones de parámetros) empleados para investigación en ajuste fino, experimentación con tokenizadores y validación de pipelines de entrenamiento supervisado, más que para uso directo en producción a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun tag `gpt2` del repositorio |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo incluye pesos en safetensors; las cuantizaciones a 8 y 4 bits son tecnicamente posibles, pero no se ofrecen versiones preconvertidas) |
| Idiomas soportados | no disponible (el identificador `swa-latn` sugiere suajili en alfabeto latino, sin confirmacion oficial) |
| Licencia | no disponible (la model card solo indica el marcador generico `licence: license`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura GPT-2, un transformer decoder-only autorregresivo con mecanismo de atencion causal completo. Con 124.770.816 parametros, se situa practicamente en la misma escala que el GPT-2 base original (124 millones). No se dispone de informacion sobre el numero de capas, la dimension oculta ni la longitud de contexto efectiva, ya que la model card no detalla la configuracion arquitectonica y no se ha publicado ningun paper asociado.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con la libreria TRL en su version 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El modelo parte de un checkpoint previo de la misma autora (`...ppt-mp-struct-core-100mb_seed455`), por lo que se trata de una cadena de ajustes sucesivos. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas adicionales como RLHF o DPO; la etiqueta `sft` indica que unicamente se uso aprendizaje supervisado. Hay un enlace a un run de Weights & Biases (`wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/v0g5yh8x`) que podria contener detalles del proceso, asi como evidencia indirecta de experimentacion con tokenizadores.

## Capacidades

- Generacion de texto autorregresiva basica, segun el ejemplo de la model card, que usa `pipeline("text-generation")` con mensajes con rol `user`.
- Formato conversacional de un solo turno: el ejemplo de uso pasa una lista de diccionarios con `role` y `content`, lo que indica compatibilidad con plantillas de chat simples.
- Generacion condicionada por prompt, con parametros estandar como `max_new_tokens` y `return_full_text`.
- Compatibilidad con text-generation-inference y endpoints, segun los tags del repositorio (`text-generation-inference`, `endpoints_compatible`).
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.
- No hay informacion verificada sobre capacidades multilingues; el prefijo `swa-latn` apunta a suajili, pero no se ha confirmado.

## Casos de uso

- Investigacion en ajuste fino supervisado: sirve como referencia reproducible para estudiar el efecto del SFT con TRL sobre un checkpoint base de la misma autora, comparando semillas (`seed10` frente a otros valores).
- Experimentacion con tokenizadores: el run de Weights & Biases vinculado pertenece a un proyecto llamado `new-tokenizers`, de modo que el modelo es util para evaluar el impacto de cambios en la tokenizacion sobre la generacion.
- Generacion de texto en suajili (si se confirma el idioma): podria emplearse para tareas ligeras de redaccion o continuacion de texto en ese idioma, aunque sin datos de calidad publicados.
- Despliegue en entornos con recursos muy limitados: con 124 millones de parametros cabe en CPU y en GPU de gama baja, lo que permite prototipado local sin infraestructura dedicada.
- Pruebas de pipelines de inferencia: por su compatibilidad con TGI y endpoints, es adecuado para validar cadenas de despliegue antes de migrar a modelos mayores.
- Educacion y divulgacion: su tamano reducido y su licencia no restrictiva (no confirmada) lo hacen manejable para demostraciones docentes de generacion de texto con transformers.
- Generacion de respuestas conversacionales simples en asistentes de baja exigencia, siempre que se acepte la ausencia de garantias de calidad y la posible alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y tampoco se han encontrado datos en la busqueda web.

## Requisitos de hardware

- Peso de los parametros en precision completa (fp32): aproximadamente 500 MB.
- Peso en fp16/bf16: aproximadamente 250 MB.
- Cuantizado a 8 bits: aproximadamente 125 MB; a 4 bits: aproximadamente 65 MB (estimaciones teoricas; no hay versiones GGUF publicadas en el repositorio).
- El repositorio ocupa 2,5 GB, lo que probablemente incluye estados de optimizador y checkpoints de entrenamiento ademas de los pesos finales.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU.
- Despliegue posible con transformers (libreria declarada), text-generation-inference (segun tags) y, previsiblemente, llama.cpp u Ollama mediante conversion manual a GGUF, aunque no se ofrecen ficheros preconvertidos.
- No se dispone de datos de latencia ni de throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| francesca9805/swa-latn-100mb-...ckpt500_seed10 | 124,77 M | no disponible | no disponible | HuggingFace | no disponible |
| GPT-2 base (OpenAI) | 124 M | 1024 tokens | MIT | Ampliamente disponible | Datos historicos publicos (no comparables directamente con este ajuste) |
| DistilGPT-2 | 82 M | 1024 tokens | MIT | Ampliamente disponible | Datos historicos publicos |
| SmolLM-135M (HuggingFace) | 135 M | 2048 tokens | Apache 2.0 | HuggingFace | Benchmarks publicados por el autor |

La comparacion se limita a parametros, contexto y licencia, dado que el modelo objeto de la ficha no publica resultados de evaluacion. Las cifras de contexto de GPT-2 y DistilGPT-2 corresponden a sus configuraciones estandar conocidas; las de SmolLM corresponden a la informacion publica del modelo. Para este modelo concreto, los campos de contexto, licencia y rendimiento figuran como no disponibles.

## Limitaciones y advertencias

- Licencia no declarada de forma explicita: la model card incluye el marcador generico `licence: license`, por lo que no puede confirmarse la viabilidad de uso comercial. Es imprescindible contactar con la autora antes de cualquier despliegue productivo.
- Ausencia total de benchmarks: no hay evidencia objetiva de calidad, lo que desaconseja su uso en produccion sin una evaluacion propia previa.
- Riesgo elevado de alucinacion y de generacion de texto incoherente, propio de modelos de 124 millones de parametros entrenados sobre un volumen de datos limitado (el identificador menciona 100 MB).
- Informacion sobre idiomas no confirmada: no se puede garantizar un comportamiento correcto ni en suajili ni en castellano.
- Longitud de contexto desconocida: no se puede planificar su uso en conversaciones largas o con documentos extensos.
- Trazabilidad limitada del entrenamiento: se desconoce la composicion del dataset, el numero de tokens y los posibles sesgos heredados del corpus.
- Naturaleza experimental: el identificador incluye referencias a semillas (`seed10`) y checkpoints (`ckpt500`), lo que indica que forma parte de una bateria de experimentos de investigacion mas que de un modelo pulido para uso final.
- Posible sobreajuste al dataset de ajuste fino, dado el tamano reducido del modelo y la ausencia de datos sobre regularizacion o validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/swa-latn-100mb-after-ppt-mp-struct-core-100mb-ckpt500_seed10
- Modelo base: https://huggingface.co/francesca9805/swa-latn-100mb-ppt-mp-struct-core-100mb_seed455
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/v0g5yh8x
- Repositorio de TRL: https://github.com/huggingface/trl

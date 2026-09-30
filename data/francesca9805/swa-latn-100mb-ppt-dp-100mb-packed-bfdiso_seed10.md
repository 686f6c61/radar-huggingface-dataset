# francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed10

## Resumen

`francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed10` es un modelo de generacion de texto en suajili (codigo de idioma `swa_latn`) de 124.770.816 parametros, obtenido por ajuste fino supervisado (SFT) sobre el modelo base `goldfish-models/swa_latn_100mb`. Lo publica el usuario de HuggingFace `francesca9805`, vinculado segun los metadatos de seguimiento a la Universidad de Groningen, y forma parte de una familia de experimentos con distintos tokenizadores y semillas (`seed10`, `seed3407`) dentro de un proyecto de seguimiento denominado `new-tokenizers`.

El modelo pertenece a la familia GPT-2 (etiqueta `gpt2` en los metadatos de HuggingFace) y se distribuye en formato `safetensors` con la libreria `transformers`. Por tamano y naturaleza es un modelo de investigacion mas que de produccion: 124 millones de parametros lo sitúan en la gama de los modelos "small" orientados a un unico idioma con corpus de entrenamiento reducidos (el sufijo `100mb` del modelo base sugiere un corpus del orden de 100 MB de texto en suajili).

Su relevancia es acotada pero concreta: sirve como punto de comparacion reproducible para estudiar el efecto de distintas estrategias de tokenizacion y de empaquetado de datos (`packed`) en idiomas de bajos recursos, y como base ligera para tareas de generacion de texto en suajili que deban ejecutarse en hardware muy modesto. La ficha tecnica publicada es minima: no incluye licencia explicita, idiomas declarados, composicion del dataset ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en HuggingFace) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la familia GPT-2 usa 1.024 tokens como valor tipico, sin confirmar para este ajuste) |
| Tipos de cuantizacion | no disponible en la model card; al ser un modelo de 124,7 M de parametros admite cuantizacion a int8 y 4 bits mediante herramientas externas (llama.cpp, bitsandbytes) |
| Idiomas soportados | no disponible oficialmente; el identificador indica suajili (`swa_latn`) |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (libreria `transformers`); repositorio de 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia GPT-2, con 124,77 millones de parametros, heredada del modelo base `goldfish-models/swa_latn_100mb`. No se documenta en la informacion disponible el numero de capas, dimensiones de atencion, cabezas ni la longitud de contexto efectiva del ajuste, por lo que esos datos quedan como no disponibles.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con la libreria TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El nombre del modelo indica que los datos se empaquetaron (`packed`) y que el corpus de trabajo ronda los 100 MB (`Dp-100mb`), ademas de una semilla fija (`seed10`). El ejemplo de uso de la model card pasa una lista de mensajes con roles (`{"role": "user", "content": ...}`), lo que sugiere un formato de entrenamiento conversacional o de instrucciones, aunque no se especifica la composicion exacta del dataset, el numero de tokens vistos ni si hubo etapas posteriores de alineacion (RLHF, DPO). Existe un registro del experimento en Weights & Biases dentro del proyecto `new-tokenizers`, lo que refuerza la hipotesis de que el eje del experimento es la tokenizacion mas que la capacidad final del modelo.

## Capacidades

- Generacion de texto autoregresiva en suajili, condicionada por un prompt en formato de mensajes o texto plano.
- Ajuste supervisado sobre datos empaquetados, lo que permite evaluar la influencia del empaquetado en la calidad de generacion.
- Ejecucion mediante `pipeline("text-generation")` de Transformers con `device="cuda"`.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (etiquetas `text-generation-inference` y `endpoints_compatible`).
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.
- Capacidades multilingues: no documentadas; el modelo esta especializado en suajili segun su identificador.
- Tamano reducido que permite inferencia en CPU, lo que habilita experimentacion local sin GPU.

## Casos de uso

- Experimentacion academica sobre tokenizacion: comparar esta variante (`seed10`) con otras semillas de la misma familia para medir la varianza introducida por la inicializacion en modelos de idiomas de bajos recursos.
- Investigacion sobre empaquetado de datos: evaluar si el empaquetado (`packed`) de un corpus de 100 MB mejora la perplejidad frente a entrenamientos sin empaquetar, usando este modelo como una de las condiciones experimentales.
- Generacion de texto asistida en suajili: redaccion de borradores cortos (descripciones, resumenes breves, respuestas a prompts) donde no se requiera alta fidelidad factual.
- Punto de partida para ajuste fino downstream: al ser un modelo de 124,7 M de parametros, se puede reentrenar en una unica GPU consumer para tareas concretas como clasificacion de texto suajili o generacion de respuestas en un dominio acotado.
- Despliegue en entornos con recursos muy limitados: cabe en CPU y en cualquier GPU moderna, por lo que es viable para demos, prototipos o entornos educativos sin acelerador dedicado.
- Evaluacion de pipelines de inferencia: sirve como banco de pruebas barato para medir latencia y throughput de text-generation-inference, vLLM o llama.cpp antes de escalar a modelos mayores.
- Generacion de datos sinteticos en suajili para preentrenamiento o aumento de corpus, asumiendo una calidad limitada y necesidad de filtrado posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de perplejidad o exactitud sobre tareas en suajili, y tampoco se han encontrado en los resultados de busqueda web.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 500 MB solo para pesos (124,77 M x 4 bytes).
- VRAM estimada en fp16/bf16: aproximadamente 250 MB solo para pesos.
- VRAM estimada en int8: aproximadamente 125 MB; en 4 bits, en torno a 65-70 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se puede usar RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad. El modelo esta claramente infrautilizado en GPUs de datacenter.
- Si cabe en GPU consumer: si, en practicamente cualquier GPU consumer de los ultimos diez anos, e incluso en CPU con memoria RAM suficiente.
- Opciones de despliegue: Transformers con `pipeline`, text-generation-inference (etiqueta declarada por el autor), endpoints compatibles con la API de HuggingFace, y conversion a GGUF para llama.cpp u Ollama. vLLM es compatible con arquitecturas GPT-2, aunque no esta confirmado por el autor.
- Latencia y throughput estimados: no disponibles. Con 124,7 M de parametros se espera una latencia de milisegundos por token en GPU moderna, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed10` | 124.770.816 | no disponible | no disponible | HuggingFace, 0 descargas y 0 likes en el momento de la consulta | Variante con semilla 10 del experimento |
| `goldfish-models/swa_latn_100mb` | no disponible | no disponible | no disponible | HuggingFace (modelo base) | Modelo base sobre el que se aplica el SFT |
| `francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfd_seed10` | no disponible | no disponible | no disponible | HuggingFace | Variante de la misma familia sin el sufijo `iso`, presumiblemente con otro tratamiento de datos |
| `francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfd_seed3407` | no disponible | no disponible | no disponible | HuggingFace | Misma receta con semilla 3407 |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a modelos multilingues de tamano similar, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de 124,7 M de parametros: la coherencia en generaciones largas es limitada y la tasa de alucinacion en contenido factual es previsiblemente alta. No es adecuado para tareas que exijan precision verificable.
- Corpus de entrenamiento reducido (del orden de 100 MB segun el identificador): la cobertura lexica y de dominios en suajili sera estrecha, con sesgo hacia los generos presentes en ese corpus.
- Sesgos conocidos: no documentados. Al entrenarse sobre un corpus no descrito, se heredan los sesgos de dicha fuente, que no se pueden evaluar con la informacion disponible.
- Licencia no disponible: la model card declara el campo `licence: license` sin especificar terminos. Esto impide determinar si el uso comercial esta permitido; se recomienda contactar con el autor antes de cualquier despliegue productivo.
- Idiomas soportados no declarados oficialmente: aunque el identificador apunta a suajili (`swa_latn`), no hay confirmacion del alcance multilingue ni de la variedad dialectal cubierta.
- Contexto no documentado: si se confirma el valor tipico de GPT-2 (1.024 tokens), el modelo no sirve para conversaciones largas ni para documentos extensos.
- Ausencia total de benchmarks: no es posible comparar su calidad objetivamente con alternativas ni validar afirmaciones de rendimiento.
- Modelo practicamente sin traccion en HuggingFace (0 descargas, 0 likes al consultar): no ha pasado por validacion de la comunidad, por lo que puede contener errores de publicacion o artefactos de entrenamiento no detectados.
- Uso en produccion desaconsejado sin una evaluacion previa especifica del dominio y sin resolver la ambiguedad de licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/goldfish-models/swa_latn_100mb
- Variante con semilla 10 sin sufijo `iso`: https://huggingface.co/francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfd_seed10
- Variante con semilla 3407: https://huggingface.co/francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfd_seed3407
- Variante de 10 MB: https://huggingface.co/francesca9805/swa-latn-10mb-ppt-dp-100mb-packed-bfd_seed10 (referenciada en free2aitools, sin verificar)
- Variante `ppt-wc-uniform-newlex-swa-after-100mb-packed-bfd_seed10`: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-swa-after-100mb-packed-bfd_seed10
- Registro del experimento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/gsgphm9q
- Repositorio de TRL: https://github.com/huggingface/trl
- Pagina de despliegue en FriendliAI: https://friendli.ai/models/francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfd_seed10
- Ficha en Free2AITools: https://free2aitools.com/model/francesca9805/swa-latn-10mb-ppt-dp-100mb-packed-bfd_seed10

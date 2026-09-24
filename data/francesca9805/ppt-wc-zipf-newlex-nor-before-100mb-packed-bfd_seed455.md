# francesca9805/ppt-wc-zipf-newlex-nor-before-100mb-packed-bfd_seed455

## Resumen

`francesca9805/ppt-wc-zipf-newlex-nor-before-100mb-packed-bfd_seed455` es un modelo de generacion de texto en formato Transformers, resultado de un ajuste fino supervisado (SFT) sobre `goldfish-models/eng_latn_100mb`, un modelo monolingue de la familia Goldfish entrenado con unos 100 MB de texto en ingles. El checkpoint tiene 86.508.288 parametros (unos 86,5 M), pesa 1,4 GB en el repositorio y se distribuye en safetensors. La arquitectura es un transformer decoder-only de tipo GPT-2, segun las etiquetas del repositorio.

El modelo se ha entrenado con TRL 0.23.0 en el marco de lo que parece una familia de experimentos de ordenacion y empaquetado de datos: el nombre del repositorio incluye terminos como "packed", "before", "zipf" y "seed455", y en la web aparecen checkpoints hermanos con esquemas de nombres equivalentes (variantes `eng` y `nld` publicadas por `fpadovani`). No se documentan la composicion del dataset, el numero de tokens de entrenamiento, la licencia ni los idiomas soportados.

Su relevancia es fundamentalmente experimental: se trata de un checkpoint pequeno, sin resultados de benchmarks publicados y con cero descargas, util como material de estudio para investigacion en tokenizacion, curriculum de datos y ajuste fino con TRL, no como modelo de proposito general en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun etiqueta `gpt2` del repositorio) |
| Parametros totales | 86.508.288 (86,5 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es `goldfish-models/eng_latn_100mb`, entrenado con texto en ingles en alfabeto latino; el nombre del checkpoint incluye "nor", sin confirmacion de que se trate de noruego) |
| Licencia | no disponible (la model card solo contiene el marcador de posicion `licence: license`) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 1,4 GB |
| Pipeline | text-generation |
| Modelo base | goldfish-models/eng_latn_100mb |
| Fecha de creacion | 2026-09-23 |
| Ultima actualizacion | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura declarada es GPT-2: un transformer decoder-only autorregresivo con atencion causal completa, sin mecanismos de atencion lineal, MoE ni SSM. El recuento de parametros (86,5 M) es inferior al de GPT-2 small estandar (124 M con vocabulario de 50.257 tokens), lo que apunta a una configuracion o un vocabulario distintos de los de GPT-2 original; el propio nombre del checkpoint contiene el termino "newlex", que sugiere modificaciones en el lexico o el tokenizador, aunque esto no se documenta en la model card. No se publican ni la profundidad, ni el numero de cabezas, ni la dimension oculta, ni el tamano del vocabulario.

El entrenamiento se realizo con aprendizaje supervisado (SFT) mediante TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. No se especifican el dataset, el numero de tokens vistos, la composicion, ni si hubo fases posteriores de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica. La informacion de seguimiento del entrenamiento esta disponible en un run de Weights & Biases enlazado desde la model card. El sufijo "seed455" indica que se trata de una ejecucion concreta dentro de una familia de experimentos, y "packed" apunta a empaquetado de secuencias, si bien ninguno de estos extremos se detalla en la documentacion.

## Capacidades

- Generacion de texto autorregresiva en la linea indicada por el modelo base: texto en ingles (no hay evidencia de capacidades multilingues mas alla de lo que aporte el checkpoint base).
- Seguimiento de instrucciones de un solo turno: el ejemplo de la model card pasa una lista de mensajes con `role: user`, lo que sugiere la presencia de una plantilla de conversacion, aunque no se documenta explicitamente.
- Ajuste fino especifico del experimento: al derivar de un SFT sobre un subconjunto de datos, las capacidades estan condicionadas por ese corpus, que no se describe.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- No hay soporte de vision, audio ni de modo de razonamiento explicito (thinking mode).
- No se documentan capacidades de generacion de codigo o matematicas, ni evaluaciones que las respalden.
- No se documentan idiomas soportados, por lo que no puede afirmarse cobertura multilingue.

## Casos de uso

- Investigacion en ordenacion de datos de entrenamiento: el checkpoint forma parte de una familia de ejecuciones con nombres que codifican condiciones de empaquetado y orden (por ejemplo "before"), de modo que puede utilizarse como punto de comparacion en estudios de curriculum learning.
- Experimentos de tokenizacion: el termino "newlex" en el nombre sugiere variantes de vocabulario o tokenizador; el checkpoint sirve como referencia reproducible en evaluaciones comparativas de tokenizadores sobre el mismo presupuesto de datos.
- Reproducibilidad de resultados: dado que la semilla esta fijada en el nombre ("seed455"), es util para reproducir una ejecucion concreta y analizar la varianza entre semillas frente a otros checkpoints hermanos.
- Generacion de texto en local sobre CPU: con 86,5 M de parametros, el modelo cabe holgadamente en memoria de sistema y puede ejecutarse sin GPU para tareas de demostracion o docencia.
- Generacion de texto sintetico de dominio muy concreto: tras un ajuste fino adicional sobre un corpus propio, puede emplearse para aumentar datos en tareas restringidas y de bajo riesgo.
- Pruebas de integracion de infraestructura: al estar etiquetado como compatible con endpoints y text-generation-inference, sirve como modelo de humo (smoke test) para validar pipelines de despliegue en vLLM, TGI o servicios compatibles antes de desplegar modelos mayores.
- Analisis de comportamiento de modelos pequenos: util para estudiar degradacion, repeticion y alucinacion en modelos de menos de 100 M de parametros entrenados con presupuestos de datos reducidos.
- Base para ablaciones academicas: se puede comparar directamente con otros checkpoints de la misma serie que comparten arquitectura y presupuesto de datos, aislando el efecto de una sola variable experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso de los parametros en memoria: aproximadamente 346 MB en fp32, 173 MB en fp16/bf16, 87 MB en int8 y 43 MB en 4 bits, calculado a partir de los 86.508.288 parametros.
- Inferencia en CPU: viable. Un modelo de este tamano se ejecuta en CPU moderna con latencias de decenas o cientos de milisegundos por token; no se publican mediciones concretas para este checkpoint.
- GPU consumer: cabe en cualquier GPU consumer con al menos 2 GB de memoria, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, RTX 4090 o integradas con memoria compartida. El cuello de botella no es la VRAM, sino el ancho de banda y la latencia del bus.
- GPU de datacenter: A100, H100, L40S o similares no aportan ventaja significativa para un modelo de este tamano salvo en escenarios de batching masivo.
- Memoria adicional: la cache KV depende de la longitud de contexto, que no esta documentada; con 86,5 M de parametros, incluso contextos de varios miles de tokens ocupan pocos megabytes.
- Opciones de despliegue: Transformers con `pipeline("text-generation")` es la ruta documentada en la model card. El repositorio esta etiquetado con `text-generation-inference` y `endpoints_compatible`, lo que indica compatibilidad prevista con TGI y servicios de endpoints compatibles. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que no se distribuye en el repositorio, y para vLLM habria que verificar la compatibilidad de la configuracion del modelo.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo, latencia de primer token ni rendimiento en batching para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/ppt-wc-zipf-newlex-nor-before-100mb-packed-bfd_seed455 | 86,5 M | no disponible | no disponible | HuggingFace, 0 descargas | Checkpoint experimental, SFT con TRL |
| goldfish-models/eng_latn_100mb | no disponible | no disponible | no disponible | HuggingFace (modelo base) | Modelo monolingue de ingles entrenado con ~100 MB de texto |
| fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed455 | no disponible | no disponible | no disponible | HuggingFace | Checkpoint hermano con la misma semilla y esquema de nombres, variante `eng` |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT (pesos publicados) | HuggingFace, ampliamente desplegado | Referencia de la arquitectura; vocabulario de 50.257 tokens |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluaciones cualitativas, ni conjunto de validacion documentado, por lo que no puede afirmarse su calidad en ninguna tarea.
- Riesgo elevado de alucinacion: con 86,5 M de parametros y un presupuesto de datos de ~100 MB en el modelo base, la fidelidad factual es muy limitada.
- Sesgos desconocidos: al no documentarse la composicion del corpus de ajuste fino, no es posible caracterizar sesgos de genero, raza, religion o ideologia.
- Ambiguedad de idioma: el modelo base es de ingles (`eng_latn_100mb`), pero el nombre del checkpoint incluye "nor", sin que se aclare si el ajuste se hizo sobre datos en noruego. No debe asumirse competencia en noruego sin verificacion.
- Licencia sin definir: la model card contiene un marcador de posicion (`licence: license`), por lo que no hay autorizacion explicita de uso comercial ni condiciones claras de redistribucion. Antes de cualquier uso en produccion hay que contactar con el autor.
- Longitud de contexto no documentada: impide planificar aplicaciones que dependan de ventanas largas.
- Formato de plantilla no verificado: el ejemplo usa una lista de mensajes, lo que sugiere una plantilla de conversacion, pero no se documenta su contenido; un uso incorrecto de la plantilla degrada la salida.
- Modelo de investigacion, no de produccion: cero descargas, cero valoraciones y ausencia de mantenimiento declarado. No es adecuado como dependencia en sistemas criticos ni para decisiones automatizadas con impacto en personas.
- Sin garantias de soporte: no hay issues, foro ni documentacion adicional mas alla de la model card generada automaticamente por TRL.
- Riesgo de repeticion y degeneration: es un patron habitual en modelos GPT-2 de este tamano, aunque no se han publicado analisis especificos para este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-zipf-newlex-nor-before-100mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/r1za1716
- Repositorio de TRL: https://github.com/huggingface/trl
- Checkpoint hermano (variante `eng`): https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed455
- Checkpoint hermano (variante `eng`, semilla 5): https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed5
- Variante con warmup: https://friendli.ai/models/fpadovani/ppt-wc-zipf-newlex-66-warmup-eng-100mb_seed455
- Ficha en LLM Explorer (variante `nld`): https://llm-explorer.com/model/fpadovani%2Fppt-wc-zipf-newlex-nld-100mb_seed455,4XpMnuFsDvvhTWLj3tP63tT
- Ficha en Free2AITools: https://free2aitools.com/model/fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed455

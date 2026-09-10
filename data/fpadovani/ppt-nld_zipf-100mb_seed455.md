# fpadovani/ppt-nld_zipf-100mb_seed455

## Resumen

`fpadovani/ppt-nld_zipf-100mb_seed455` es un ajuste fino supervisado (SFT) del modelo monolingüe `goldfish-models/nld_latn_100mb`, un transformer decoder-only de tipo GPT-2 entrenado desde cero sobre aproximadamente 100 MB de texto en neerlandés. El ajuste se ha realizado con la librería TRL de Hugging Face sobre la infraestructura típica de `transformers`, y el resultado es un modelo de 86.708.736 parámetros (unos 87 M) con pesos en `safetensors`.

Se trata de un artefacto de investigación más que de un modelo de producción: no tiene descargas ni valoraciones en el momento de redactar esta ficha, la licencia no está declarada y la model card apenas aporta información sobre el dataset de ajuste, la composición de los datos o los hiperparámetros. El identificador sugiere un experimento sobre selección o distribución de datos de instrucciones (`ppt` podría corresponder a un conjunto de instrucciones o a una variante de prompt; `zipf` apunta a un criterio de muestreo basado en la distribución de Zipf; `seed455` indica la semilla de entrenamiento), pero nada de esto se confirma en la documentación disponible.

Su relevancia es acotada y muy específica: sirve como punto de comparación en estudios sobre ajuste fino de modelos pequeños y multilingües, especialmente en neerlandés con presupuestos de cómputo mínimos. Para cualquier uso real en producción, es preferible partir del modelo base o de alternativas con licencia explícita y documentación completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en el repositorio; confirmado por el modelo base `goldfish-models/nld_latn_100mb`) |
| Parametros totales | 86.708.736 (dato real de los pesos `safetensors`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base sigue la configuracion GPT-2, pero no se confirma en la ficha) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; al ser un modelo GPT-2 es convertible a GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.) y a int8 mediante `bitsandbytes` |
| Idiomas soportados | No disponible en la model card; el identificador del modelo base (`nld_latn`) indica neerlandes en alfabeto latino |
| Licencia | No disponible (la model card incluye el campo `licence: license` sin especificar) |
| Formato de pesos | `safetensors` (libreria `transformers`; repositorio de 1,4 GB, lo que incluye pesos en precision completa y posibles copias de optimizador) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only con atención causal, tokenizador propio y el esquema estándar de GPT-2. Con 86,7 M de parámetros, el modelo queda por debajo de GPT-2 small (124 M) y muy lejos de los modelos actuales de menos de 1 B, lo que implica una capacidad de razonamiento y de retención de hechos muy limitada. El repositorio ocupa 1,4 GB, un tamaño desproporcionado respecto a los pesos en fp32 (unos 347 MB), señal de que se han subido copias adicionales de pesos o estados de entrenamiento.

El entrenamiento se ha realizado con SFT mediante TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se especifica el número de tokens de ajuste, la composición del dataset, si hubo etapas de RLHF o DPO, ni la tasa de aprendizaje, el número de épocas o la estrategia de enmascarado de la pérdida. La model card enlaza un run de Weights & Biases en el proyecto `f-padovani-university-of-groningen/white_cotterell` (run `1mo02bta`), que es la única fuente potencial de detalles de entrenamiento, aunque su contenido no forma parte de la información disponible aquí. No se describe ninguna innovación técnica (atención lineal, decodificación especulativa, MoE o arquitecturas híbridas SSM).

## Capacidades

- Generacion de texto autoregresivo en neerlandes, heredada del modelo base monolingue y presumiblemente orientada a instrucciones tras el SFT.
- Formato conversacional de un solo turno segun el ejemplo de la model card: la `pipeline` recibe una lista con un mensaje de rol `user` y devuelve texto generado con `return_full_text=False`.
- Seguimiento de instrucciones basicas: es el objetivo declarado del ajuste con TRL, aunque no se documenta ningun conjunto de evaluacion.
- Generacion libre y continuacion de texto, herencia directa de un modelo GPT-2 entrenado sobre 100 MB de corpus.
- Compatibilidad con `text-generation-inference` (etiqueta `endpoints_compatible`), lo que permite desplegarlo con la pila de TGI.
- No hay evidencia de soporte de tool calling, function calling, agentes, multi-step reasoning, vision, audio ni modo de razonamiento explicito (`thinking`).
- Capacidad multilingue: no documentada; el entrenamiento del modelo base se limita a un unico idioma.

## Casos de uso

- Experimentacion academica en ajuste fino de bajo coste: el modelo sirve como línea base para estudiar el efecto de distintas estrategias de selección de datos (el sufijo `zipf` sugiere precisamente un criterio de muestreo) sobre un GPT-2 pequeño en neerlandés.
- Reproduccion de resultados de investigacion: al estar publicados los pesos, la semilla y el run de W&B, permite replicar el experimento y compararlo con otras semillas del mismo autor (`seed455` implica la existencia de otras ejecuciones).
- Generacion de texto en neerlandes para prototipos: con ~87 M de parametros se puede ejecutar en CPU para tareas de completado de frases o borradores de texto sin requisitos de hardware.
- Pruebas de integracion con la pila de Hugging Face: es util para validar pipelines de `transformers`, TGI o servidores compatibles con la API de inferencia antes de migrar a modelos mayores.
- Filtrado o anotacion preliminar de corpus neerlandeses: aunque su calidad es limitada, puede emplearse para preetiquetar grandes volumenes de texto y reservar un modelo mayor para la revision.
- Docencia y formacion: sirve para demostrar de principio a fin el ciclo de SFT con TRL, desde el modelo base hasta el despliegue con `pipeline`, sin necesidad de GPUs de gama alta.
- Investigacion sobre sesgos y contaminacion en corpus pequenos: al conocer el origen de los datos (100 MB del corpus `nld_latn` de Goldfish), permite analizar que sesgos introduce un corpus reducido en un modelo monolingue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, ARC, HellaSwag ni metricas de perplexidad) y tampoco compara el modelo con su base `goldfish-models/nld_latn_100mb`.

## Requisitos de hardware

- VRAM estimada para los pesos: en fp32, unos 0,35 GB; en fp16/bf16, unos 0,17 GB; en int8, unos 0,09 GB; en int4, unos 0,05 GB. Son calculos a partir de los 86,7 M de parametros, no mediciones publicadas.
- Con el overhead del runtime de `transformers` y de la cache KV, el consumo real se situa tipicamente entre 0,5 GB y 1,5 GB, por lo que cabe holgadamente en cualquier GPU de consumo.
- GPU validas para su despliegue: cualquier tarjeta con al menos 2 GB de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, RTX 4090, T4, L4, A10, A100, H100). Tambien funciona en CPU con latencias aceptables para uso interactivo.
- Despliegue: `transformers` con la `pipeline` de `text-generation` (ejemplo incluido en la model card), `text-generation-inference` por la etiqueta `endpoints_compatible`, y vLLM. Para `llama.cpp` u Ollama es necesario convertir previamente los pesos a GGUF, ya que el repositorio solo publica `safetensors`.
- Latencia y throughput: no se han publicado mediciones. Al tratarse de un modelo de menos de 100 M de parametros, en GPU la generacion es del orden de cientos de tokens por segundo, pero se trata de una estimacion cualitativa, no de un dato verificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `fpadovani/ppt-nld_zipf-100mb_seed455` | 86,7 M | No disponible | No disponible | Hugging Face, 0 descargas | Ajuste SFT sobre el modelo base; sin benchmarks |
| `goldfish-models/nld_latn_100mb` | No disponible | No disponible | No disponible | Hugging Face | Modelo base; entrenado desde cero con ~100 MB de neerlandes |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT (pesos publicados) | Hugging Face | Referencia de la arquitectura; multiligue solo de forma incidental |
| `GroNLP/gpt2-small-dutch` | ~124 M | 1024 tokens | No disponible | Hugging Face | Alternativa en neerlandes derivada de GPT-2; parametros y contexto segun la configuracion estandar de GPT-2 |

La comparacion cuantitativa de rendimiento no es posible: no hay benchmarks publicados para este modelo ni para los modelos de la tabla en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni perplexidad, ni evaluacion humana publicada, por lo que no se puede afirmar que el ajuste SFT mejore al modelo base.
- Riesgo elevado de alucinacion y de incoherencia: 87 M de parametros entrenados sobre 100 MB de texto no bastan para mantener coherencia en generaciones largas ni para retener conocimiento factual.
- Herencia de sesgos del corpus: los corpus monolingues pequenos de Goldfish proceden de fuentes web no filtradas, por lo que es previsible que reproduzcan estereotipos y contenido de baja calidad.
- Cobertura idiomatica limitada: el modelo base es monolingue (neerlandes); no hay ninguna evidencia de competencia en castellano u otros idiomas.
- Licencia no declarada: el campo de licencia de la model card no especifica terminos. Sin una licencia explicita no se puede asumir permiso para uso comercial; hay que contactar con el autor antes de cualquier despliegue en produccion.
- Longitud de contexto no confirmada: al no documentarse, no se puede garantizar el comportamiento en conversaciones multi-turno largas.
- Metadatos del repositorio anomales: las fechas de creacion y actualizacion publicadas (2026) y el tamano del repositorio (1,4 GB para 87 M de parametros) no cuadran con una publicacion convencional, lo que sugiere un artefacto de investigacion sin curacion.
- Sin garantias de mantenimiento: cero descargas y cero valoraciones indican que el modelo no ha sido validado por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/ppt-nld_zipf-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/1mo02bta
- Paper de TRL (von Werra et al., 2020), citado en la model card: https://github.com/huggingface/trl

Nota: la busqueda web asociada a esta ficha no ha devuelto ningun resultado relevante sobre el modelo; los enlaces obtenidos correspondian a un sitio institucional sin relacion con el modelo ni con el proyecto Goldfish.

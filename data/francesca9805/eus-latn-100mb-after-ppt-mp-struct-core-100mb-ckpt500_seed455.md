# francesca9805/eus-latn-100mb-after-ppt-mp-struct-core-100mb-ckpt500_seed455

## Resumen

El modelo `eus-latn-100mb-after-ppt-mp-struct-core-100mb-ckpt500_seed455` es un modelo de generacion de texto de tipo decoder-only con arquitectura GPT-2 y 124.770.816 parametros, publicado por el usuario `francesca9805` en HuggingFace. Se trata de un ajuste fino (SFT) del modelo `francesca9805/eus-latn-100mb-ppt-mp-struct-core-100mb_seed455`, realizado con la libreria TRL en su version 0.23.0 sobre Transformers 4.56.2.

El identificador del modelo sugiere un experimento centrado en euskera (codigo ISO `eus`, variante `latn`) sobre un corpus de aproximadamente 100 MB, con un vocabulario o tokenizador propio (el proyecto de Weights & Biases asociado se llama `new-tokenizers`) y el checkpoint numero 500 de una semilla concreta (seed 455). Se enmarca, por tanto, en el ambito de la investigacion en procesamiento de lenguaje natural para lenguas de bajos recursos, donde el euskera cuenta con relativamente pocos corpus abiertos de gran tamano.

La relevancia de esta ficha es limitada desde el punto de vista de produccion: el modelo tiene cero descargas y cero likes en el momento de la consulta, no publica resultados de benchmarks, no declara licencia explicita y su model card se limita a la plantilla autogenerada por TRL. Aun asi, resulta util como punto de partida para reproducir experimentos de tokenizacion y ajuste supervisado en euskera, o como modelo base para tareas de generacion en ese idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun la etiqueta `gpt2` del repositorio |
| Parametros totales | 124.770.816 (dato real extraido de los pesos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se declara en la model card; la arquitectura GPT-2 admite habitualmente 1024 tokens, pero no se confirma para este modelo) |
| Tipos de cuantizacion | no disponible (no se publican versiones GPTQ, AWQ ni GGUF; solo pesos safetensors en el repositorio) |
| Idiomas soportados | no disponible de forma explicita; el identificador sugiere euskera (`eus-latn`) |
| Licencia | no disponible (la model card incluye el marcador generico `licence: license` sin texto legal) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | `francesca9805/eus-latn-100mb-ppt-mp-struct-core-100mb_seed455` |
| Metodo de ajuste | SFT (supervised fine-tuning) con TRL 0.23.0 |
| Tamano del repositorio | 4,5 GB |
| Pipeline declarado | `text-generation` |
| Fecha de creacion | 9 de octubre de 2026 |
| Ultima actualizacion | 9 de octubre de 2026 |

## Arquitectura y entrenamiento

La etiqueta principal del repositorio es `gpt2`, lo que indica una arquitectura transformer decoder-only con atencion causal, del orden de 124,77 millones de parametros. Ese orden de magnitud coincide con GPT-2 small (124M), aunque no se especifica en la informacion disponible el numero de capas, cabezas de atencion ni la dimension del modelo oculto. Tampoco se documenta si se ha modificado el tokenizador respecto al original de GPT-2, si bien el enlace a un proyecto de Weights & Biases llamado `new-tokenizers` apunta a que el entrenamiento incluyo trabajo de tokenizacion especifico, probablemente adaptado al euskera.

El entrenamiento consiste en un ajuste supervisado (SFT) sobre el modelo base `eus-latn-100mb-ppt-mp-struct-core-100mb_seed455`, ejecutado con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni hiperparametros como la tasa de aprendizaje, el tamano de batch o el numero de pasos. El sufijo `ckpt500` sugiere que se trata del checkpoint correspondiente al paso 500 de un entrenamiento mas largo, y `seed455` indica la semilla aleatoria empleada.

## Capacidades

- Generacion de texto autoregresiva en el idioma o los idiomas del corpus de entrenamiento (presumiblemente euskera, segun el identificador `eus-latn`).
- Formato de prompt conversacional: el ejemplo de la model card pasa una lista de mensajes con el rol `user`, lo que indica que el ajuste SFT se realizo sobre un formato de chat o instrucciones.
- Razonamiento basico y respuesta a preguntas abiertas de caracter general, limitado por el tamano del modelo y la extension del corpus.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte explicito para agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de razonamiento extendido (`thinking`).
- Capacidad multilingue: no confirmada; el nombre del modelo apunta a un foco monolingue en euskera.

## Casos de uso

- Generacion de texto sintetico en euskera: el modelo puede producir frases y parrafos en euskera para aumentar corpus de entrenamiento de otros sistemas, siempre que un hablante nativo revise la calidad del material generado.
- Investigacion sobre tokenizacion de lenguas aglutinantes: dado que el proyecto asociado se llama `new-tokenizers`, el modelo sirve para evaluar como afecta un vocabulario adaptado al euskera a la calidad de la generacion frente a un tokenizador generico.
- Ajuste fino posterior sobre tareas concretas: al ser un modelo de 124M de parametros, puede reentrenarse en una unica GPU consumer para clasificacion, resumen o generacion de dominio especifico en euskera.
- Experimentos academicos reproducibles: el par de modelos (base y ajustado) con una semilla declarada permite estudiar la variabilidad del SFT segun la semilla y el checkpoint en un entorno de bajo coste computacional.
- Prototipado de asistentes conversacionales en euskera: el formato de mensajes con rol `user` facilita integrarlo en una demo con `transformers.pipeline` para validar si la calidad es suficiente antes de migrar a un modelo mayor.
- Docencia y practicas de NLP: sirve como ejemplo minimo de extremo a extremo (tokenizador propio, preentrenamiento, SFT con TRL) para cursos universitarios de procesamiento del lenguaje natural.
- Evaluacion comparativa de corpus en lenguas de bajos recursos: permite medir cuanta calidad se obtiene ajustando solo 100 MB frente a modelos entrenados con corpus mucho mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluacion cuantitativa, y el repositorio no presenta tablas comparativas con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 500 MB solo para los pesos, mas el overhead de activaciones y cache KV (aproximadamente 0,6-1 GB en total).
- VRAM estimada en fp16 o bf16: en torno a 250 MB para los pesos, con un consumo total tipico inferior a 1 GB.
- VRAM estimada en cuantizacion de 4 bits (si se genera una version GGUF o GPTQ, no publicada): del orden de 70-100 MB para los pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090 o incluso una GTX 1650 con 4 GB pueden ejecutar el modelo sin problemas. Tambien funciona en CPU.
- Despliegue en produccion: no se recomienda vLLM ni TGI para un modelo de este tamano en un caso real de alta concurrencia, aunque `text-generation-inference` aparece como etiqueta del repositorio. Para demos y prototipos, `transformers` con `pipeline` o `llama.cpp`/Ollama tras convertir a GGUF son las opciones mas razonables.
- Latencia y throughput: no disponibles. En una GPU moderna y con lotes pequenos, un modelo de 124M suele responder en decenas de milisegundos por token, pero no hay mediciones publicadas para este checkpoint concreto.
- Cabe sin dificultad en cualquier GPU consumer actual e incluso en dispositivos de borde con pocos gigabytes de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `eus-latn-100mb-after-ppt-mp-struct-core-100mb-ckpt500_seed455` (este modelo) | 124,77 M | no disponible | presumiblemente euskera | no disponible | HuggingFace, 0 descargas |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | ingles principalmente | MIT | ampliamente disponible |
| Familia Latxa (HiTZ, UPV/EHU) | 7B y superiores | no disponible en esta ficha | euskera y castellano | depende de la version | HuggingFace |

La comparacion con GPT-2 small es la mas directa por tamano y arquitectura, aunque ambos difieren en el idioma objetivo y en el corpus de entrenamiento. Frente a la familia Latxa, orientada especificamente al euskera con modelos de orden superior, este checkpoint se situa en una escala mucho menor y sin resultados publicados que permitan una comparacion cuantitativa. No se dispone de datos suficientes para establecer una comparativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- No se declara licencia explicita: la model card contiene el marcador `licence: license` sin texto legal asociado, por lo que el uso comercial queda en un limbo juridico y no deberia asumirse permitido.
- Riesgo elevado de alucinacion y de texto incoherente: con 124,77 millones de parametros y un corpus de entrenamiento del orden de 100 MB, la capacidad de mantener coherencia en generaciones largas es muy limitada.
- Sesgos desconocidos: no se documenta la composicion del corpus, por lo que no es posible evaluar sesgos de genero, ideologicos o territoriales. El material de entrenamiento podria contener datos personales si el corpus no fue filtrado.
- Cobertura idiomatica no confirmada: aunque el nombre sugiere euskera, no se especifica que variantes dialectales ni que porcentaje de otros idiomas contiene el corpus; el comportamiento fuera del dominio de entrenamiento es impredecible.
- Longitud de contexto no declarada: no se garantiza el funcionamiento correcto mas alla de la ventana usada durante el entrenamiento, que no se documenta.
- Sin benchmarks: no existen metricas publicadas que permitan estimar la calidad real frente a alternativas, lo que impide justificar su uso en produccion.
- Madurez baja: cero descargas y cero likes, publicacion reciente y sin mantenimiento documentado; no hay garantia de soporte ni de actualizaciones.
- Ausencia de cuantizaciones oficiales: para desplegarlo en entornos con restricciones de memoria habria que generar las versiones GGUF o GPTQ por cuenta propia.
- El identificador del modelo no es descriptivo para un usuario final; conviene documentar internamente a que corresponde cada sufijo (`ppt`, `mp-struct`, `ckpt500`, `seed455`) antes de reutilizarlo en un pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/eus-latn-100mb-after-ppt-mp-struct-core-100mb-ckpt500_seed455
- Modelo base: https://huggingface.co/francesca9805/eus-latn-100mb-ppt-mp-struct-core-100mb_seed455
- Ejecucion del entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/672zezgc
- Repositorio de TRL: https://github.com/huggingface/trl

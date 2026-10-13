# skonan/PaperScorer-3B-Text-arXiv

## Resumen

PaperScorer-3B-Text-arXiv es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen2.5-3B-Instruct desarrollado por el usuario skonan (Sachin Konan) dentro del proyecto PaperScorer, asociado al grupo zlab-princeton. Su tarea es acotada y muy especifica: predecir el veredicto de aceptacion o rechazo (Accept/Reject) de un articulo cientifico de aprendizaje automatico a partir unicamente del texto del manuscrito. No es un modelo de proposito general, sino un clasificador generativo entrenado para emitir una unica decision en formato `\boxed{Accept}` o `\boxed{Reject}`.

El modelo parte de una arquitectura transformer decoder densa de 3.085.938.688 parametros (3,09B) y fue entrenado sobre el corpus arxiv-large, con aproximadamente 71.000 ejemplos balanceados por conferencia, durante 4 epocas (checkpoint en el paso 8884). El entrenamiento se realizo con LLaMA-Factory y FSDP2, con una longitud de corte de 24.480 tokens, lo que permite procesar el cuerpo completo de articulos extensos en un unico contexto.

Su relevancia actual es metodologica: forma parte de una coleccion de 8 modelos de dominio unico que cubren el producto {3B, 7B} x {texto, vision} x {arxiv, openreview-iclr}, disenada para estudiar hasta que punto la aceptacion de un articulo es predecible. El modelo presenta un 71,0% de exactitud y un AUC de 0,811 en el conjunto de test en distribucion, con una tasa de aceptacion predicha del 65% frente al 25-30% tipico de las conferencias de primer nivel, lo que evidencia un sesgo hacia la clase positiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia Qwen2, heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 (3,09B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; el SFT se entreno con cutoff_len = 24.480 tokens. El modelo base Qwen2.5-3B-Instruct declara 32.768 tokens de contexto nativo |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors sin cuantizaciones oficiales) |
| Idiomas soportados | Ingles (en) |
| Licencia | other (licencia no estandar, requiere revision del autor) |
| Formato de pesos | safetensors |
| Tarea / pipeline | academic-paper-review (prediccion binaria Accept/Reject); pipeline de HuggingFace no disponible |
| Tamano del repositorio | 13,6 GB |
| Descargas / likes | 8 descargas, 0 likes |
| Fecha de creacion / actualizacion | 2026-05-19 / 2026-10-12 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-3B-Instruct: un transformer decoder denso con atencion por consultas agrupadas (GQA) y RoPE, sin mecanismos de mezcla de expertos ni componentes de estado recurrente. El ajuste es un SFT estandar de instrucciones en formato conversacional sharegpt de 3 turnos (system, human, gpt), no un proceso de RLHF ni DPO. El prompt de sistema es constante en los 8 modelos de la coleccion: "You are an expert academic reviewer tasked with evaluating research papers." El preambulo de usuario es especifico del dominio arXiv e indica explicitamente que las conferencias de primer nivel tienen tasas de aceptacion del 25-30%.

Los datos de entrenamiento provienen del dataset arxiv-large, con unos 71.000 ejemplos balanceados por conferencia. Los hiperparametros declarados son: learning rate 1e-6, planificador cosine_then_constant (decay_ratio 0,75, min_lr_rate 0,001), tamano de lote 32 y cutoff_len de 24.480 tokens. El entrenamiento se ejecuto con LLaMA-Factory y FSDP2, y el checkpoint publicado corresponde al paso 8884, al final de la epoca 4 de 4 (denominado "3B -> ep4" por convencion del proyecto).

La innovacion tecnica destacable no esta en la arquitectura, sino en el procedimiento de calibracion: la puntuacion se define como `logprob(Accept) - logprob(Reject)` en la posicion del token de decision (el quinto token generado bajo la plantilla `qwen`), y el umbral de decision se selecciona sobre un conjunto de validacion (arxiv-balanced-val). Esta calibracion por logprobs es lo que permite convertir una salida generativa discreta en una puntuacion continua y ajustar la tasa de aceptacion predicha.

## Capacidades

- Prediccion binaria de veredicto (Accept/Reject) sobre el texto completo de un articulo cientifico de ML, en el estilo de ICLR.
- Salida calibrable: expone logprobs en la posicion del token de decision, lo que permite umbralizar la decision en lugar de depender solo del texto generado.
- Ingesta de manuscritos en multiples formatos a traves del orquestador PaperScorer: PDF anonimizado, directorio de fuentes LaTeX o identificador de arXiv (`submit_arxiv`).
- Procesamiento de articulos completos: la longitud de corte de entrenamiento de 24.480 tokens permite incluir cuerpo, abstract y secciones en una sola pasada.
- Servido como API compatible con OpenAI mediante vLLM (`--task generate`).
- Capacidad multilingue: limitada al ingles (unico idioma declarado).
- Tool calling / function calling: no disponible; no se documenta soporte de herramientas.
- Comportamiento agentico o razonamiento multi-paso: no disponible; el modelo esta entrenado para emitir una unica decision, no una justificacion ni una cadena de razonamiento.
- Vision y audio: no disponibles en esta variante (existen variantes de vision separadas dentro de la coleccion, que anaden un token `<image>` por captura de pagina).
- Modo "thinking": no disponible.

## Casos de uso

- Triaje previo al envio para autores: antes de someter un articulo, el autor puede ejecutar `paperscorer run articulo.pdf` y obtener `p_accept` como senal cuantitativa de preparacion. Es adecuado porque procesa el texto completo en una sola pasada de 24.480 tokens y devuelve una probabilidad calibrada, no solo una etiqueta.
- Priorizacion de carga en comites de programa: un area chair con cientos de envios puede ordenar la pila por `p_accept` descendente para asignar mas tiempo de revision a los articulos en la zona fronteriza (cerca del umbral), donde la tasa de error es mas relevante.
- Investigacion sobre el proceso de revision: el modelo permite estudiar que caracteristicas textuales correlacionan con la aceptacion y comparar la predictibilidad entre venues (arXiv frente a OpenReview/ICLR) usando los modelos hermanos de la coleccion.
- Formacion de revisores noveles: utilizar la salida como linea base anonima para contrastar con el juicio humano en talleres de revision, dado que el sistema no genera justificacion y por tanto no condiciona el razonamiento del revisor.
- Filtrado de envios de bajo esfuerzo o generados automaticamente: integrado como etapa previa en una plataforma editorial, el modelo puede marcar manuscritos con puntuacion muy baja para revision administrativa antes de asignar revisores.
- Integracion en CI de LaTeX: mediante el endpoint `POST /submit_latex`, un repositorio de paper puede ejecutar la puntuacion en cada compilacion y registrar la evolucion de `p_accept` a lo largo de las revisiones del manuscrito.
- Estudios de sesgo y reproducibilidad: al disponer de 8 variantes (3B/7B, texto/vision, arXiv/ICLR) con el mismo prompt de sistema, es posible aislar el efecto del tamano, la modalidad y el dominio de entrenamiento sobre las predicciones.
- Despliegue interno como servicio de scoring: con `vllm serve skonan/PaperScorer-3B-Text-arXiv --task generate --gpu-memory-utilization 0.85` se levanta una API compatible con OpenAI en el puerto 8000 para integrarla en herramientas internas.

## Benchmarks y rendimiento

Evaluacion en distribucion sobre `arxiv-balanced-test`, con umbral de calibracion elegido en `arxiv-balanced-val`. La puntuacion es `logprob(Accept) - logprob(Reject)` en la posicion del token de decision. `pA` es la tasa de aceptacion predicha y `A_rec` / `R_rec` son el recall de aceptacion y de rechazo.

| n_test | Exactitud | AUC | pA | A_rec | R_rec |
|---|---|---|---|---|---|
| 1415 | 71,0% | 0,811 | 65% | 87,3% | 55,8% |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K ni similares) para este modelo, lo cual es coherente con su naturaleza de clasificador especializado y no de modelo de proposito general.

## Requisitos de hardware

- Pesos en precision completa (bf16/fp16): aproximadamente 6,2 GB para 3.085.938.688 parametros. El repositorio ocupa 13,6 GB, lo que sugiere que incluye varios ficheros o copias de checkpoint.
- VRAM en cuantizacion de 8 bits: estimacion de unos 3,2-4 GB solo para pesos.
- VRAM en cuantizacion de 4 bits: estimacion de unos 1,8-2,5 GB solo para pesos. No hay cuantizaciones oficiales publicadas; habria que generarlas.
- Cache KV: con 24.480 tokens de contexto, la cache es el factor dominante. Para la configuracion del modelo base Qwen2.5-3B (36 capas, GQA con 2 cabezas KV, head_dim 128), la estimacion es de aproximadamente 36 KB por token en fp16, lo que supone del orden de 900 MB para una secuencia completa. Estas cifras son estimaciones derivadas del modelo base y no estan confirmadas en la model card.
- GPU recomendadas: cualquier GPU con 8-16 GB de VRAM es suficiente para inferencia en bf16 con contexto moderado (RTX 3090, RTX 4090, L4, A10, A100 40GB, H100). Para lotes grandes con contexto completo conviene una A100 40GB o superior.
- Cabe en GPU de consumo: si. Una RTX 4090 (24 GB) o incluso una RTX 3060 de 12 GB en cuantizacion de 8 bits pueden servirlo.
- Opciones de despliegue documentadas: vLLM (soporte oficial en la model card), el CLI `paperscorer` con interfaz web en el puerto 8003, y el servidor FastAPI del repositorio (endpoints `/submit`, `/submit_latex`, `/submit_arxiv`, `/status/{job}`). El modelo base es compatible con LLaMA-Factory.
- llama.cpp / Ollama / TGI / GGUF: no disponibles en la informacion proporcionada.
- Latencia y throughput: no disponibles. Al ser un modelo de 3B que genera practicamente 5 tokens por peticion, el coste dominante es el prefill del prompt completo (hasta 24.480 tokens), no la decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PaperScorer-3B-Text-arXiv | 3,09B | 24.480 tokens de entrenamiento | Accept/Reject sobre texto arXiv | other | HuggingFace, 8 descargas |
| PaperScorer-7B-Text-arXiv | 7B (segun patron de la coleccion) | no disponible | Accept/Reject sobre texto arXiv | other | HuggingFace (coleccion zlab-princeton) |
| PaperScorer-3B-Text-openreview-iclr | 3,09B (segun patron de la coleccion) | no disponible | Accept/Reject sobre texto OpenReview/ICLR | other | HuggingFace (coleccion zlab-princeton) |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens nativos | Modelo de proposito general | Apache 2.0 (modelo base) | Ampliamente disponible |

La model card advierte de una asimetria de datos relevante: los modelos entrenados con arXiv vieron unos 71.000 ejemplos, mientras que los entrenados con ICLR vieron aproximadamente 3 veces menos. Por tanto, cualquier comparacion directa entre variantes arXiv e ICLR debe corregir por esta diferencia de volumen de datos. No se dispone de cifras de rendimiento publicadas para los modelos hermanos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia "other": no es una licencia estandar y no se aclaran los terminos de uso comercial. Es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Sesgo de clase positiva: la tasa de aceptacion predicha es del 65%, muy superior al 25-30% real de las conferencias de primer nivel. El modelo sobrepredice aceptaciones de forma sistematica.
- Recall de rechazo bajo: 55,8% de R_rec frente a 87,3% de A_rec. Casi la mitad de los articulos rechazados se clasifican como aceptados, lo que limita su uso como filtro automatico descartando envios.
- Exactitud moderada: 71,0% de exactitud y AUC 0,811 en el mejor de los casos (distribucion de test en la misma distribucion que el entrenamiento). El rendimiento fuera de distribucion no esta documentado.
- Sin justificacion: el modelo solo emite la decision, no una revision ni una explicacion. No es util como asistente de revision y no debe presentarse como sustituto del juicio humano.
- Riesgo de alucinacion: si se le solicita razonamiento o comentarios libres fuera de la tarea de clasificacion, al ser un SFT de 3B sin alineamiento adicional, generara contenido no verificado.
- Idioma: unicamente ingles. Articulos en otros idiomas no estan soportados.
- Dominio estrecho: entrenado con articulos de arXiv, con la convencion de veredicto estilo ICLR. Su aplicacion a otros campos (humanidades, biomedicina, ingenieria) o a otros formatos de revision no esta validada.
- Truncamiento: la longitud de corte de 24.480 tokens implica que articulos mas largos (o con apendices extensos) se recortan, con la consiguiente perdida de informacion.
- Desanonimizacion: el flujo de trabajo asume entradas anonimizadas; el modelo no realiza anonimizacion, esta debe hacerse antes (`paperprep`).
- Caracter experimental: 8 descargas y 0 likes, un solo autor distinto del grupo de investigacion, y la referencia es un articulo de NeurIPS 2026. No hay validacion independiente publicada.
- Alcance etico: usarlo para tomar decisiones reales de aceptacion o rechazo seria un uso indebido. El propio planteamiento del proyecto es descriptivo (medir predictibilidad), no prescriptivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skonan/PaperScorer-3B-Text-arXiv
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio del orquestador (CLI, servidor de scoring y UI web): https://github.com/zlab-princeton/PaperScorer
- Coleccion PaperScorer (8 modelos y datasets asociados): https://huggingface.co/collections/zlab-princeton/paperscorer
- Articulo de referencia: Konan, S., Liu, J., Liu, Z. "PaperScorer: How Predictable Is Paper Acceptance?", Advances in Neural Information Processing Systems, 2026 (URL no disponible en la informacion proporcionada)

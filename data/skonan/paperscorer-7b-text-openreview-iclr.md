# skonan/PaperScorer-7B-Text-OpenReview-ICLR

## Resumen

PaperScorer-7B-Text-OpenReview-ICLR es un ajuste fino supervisado (SFT) de Qwen/Qwen2.5-7B-Instruct entrenado específicamente para predecir el veredicto de aceptación o rechazo (Accept/Reject) de artículos académicos enviados a ICLR, tomando como única entrada el texto del manuscrito. Lo desarrolla el grupo zlab-princeton (Sachin Konan, Jonathan Liu y Zhuang Liu) y forma parte de la colección PaperScorer, compuesta por ocho modelos SFT de dominio único que cruzan los ejes {3B, 7B} × {texto, visión} × {arxiv, openreview-iclr}, junto con los conjuntos de datos asociados.

El problema que aborda es la predictibilidad del resultado de la revisión por pares: en lugar de generar una revisión cualitativa, el modelo produce una decisión binaria calibrable. Su salida se obtiene del logaritmo de probabilidad en la posición del token de decisión (`\boxed{Accept}` frente a `\boxed{Reject}`), lo que permite usar directamente la diferencia `logprob(Accept) − logprob(Reject)` como puntuación continua para umbralizar con un valor calibrado en el conjunto de validación.

Técnicamente es un transformer decoder-only denso de 7.615.616.512 parámetros (~7,6B), sin componentes MoE, derivado directamente del modelo base de Qwen2.5, con un vocabulario y una plantilla de prompt tipo Qwen. El entrenamiento se realizó con LLaMA-Factory y FSDP2, con una longitud de corte de 24.480 tokens, lo que refleja que las entradas típicas son artículos completos en formato Markdown. En el conjunto de test en distribución alcanza un 67,0 % de exactitud y un AUC de 0,650 sobre 2.495 artículos, con una tasa de aceptación predicha del 49 % (nota: la tasa real de aceptación de ICLR ronda el 30 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen2 (tag `qwen2`), derivado de Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Longitud de contexto | No disponible de forma explícita en la informacion proporcionada; el entrenamiento uso `cutoff_len` de 24.480 tokens y el modelo base Qwen2.5-7B-Instruct declara 32.768 tokens nativos |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene pesos `safetensors` (no se publican GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `other` (no se detallan los terminos concretos en la model card; se heredan condiciones del modelo base Qwen2.5-7B-Instruct) |
| Formato de pesos | `safetensors` |
| Tamano del repositorio | 30,5 GB |
| Modalidad | Texto (las variantes de vision son modelos hermanos distintos) |
| Dominio de entrenamiento | ICLR (OpenReview), conjunto `iclr-21k` con particion balanceada 85/5/10 |
| Checkpoint publicado | Paso 1322, final de la epoca 2 de 4 |
| Framework de entrenamiento | LLaMA-Factory + FSDP2 |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Descargas / likes | 0 / 0 (a fecha de los datos proporcionados) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-7B-Instruct sin modificaciones estructurales: transformer decoder-only denso, con atención de consultas agrupadas (GQA) y tokenizador propio de Qwen. No hay mezcla de expertos, decodificación especulativa ni capas híbridas SSM; la innovación del modelo no está en la arquitectura, sino en el objetivo de entrenamiento (clasificación binaria de decisión editorial expresada como texto) y en el procedimiento de calibración posterior.

El ajuste fino se realizó por SFT sobre el conjunto `iclr-21k`, con una partición balanceada 85/5/10 (aproximadamente 21.000 ejemplos, 4 épocas previstas y 2.644/5.296 pasos según el autor). Los hiperparámetros declarados son: tasa de aprendizaje 1e-6, planificador `cosine_then_constant` con `decay_ratio` 0,75 y `min_lr_rate` 0,001, tamaño de lote 32 y `cutoff_len` de 24.480 tokens, gestionado con FSDP2. El checkpoint distribuido corresponde al paso 1322, al final de la época 2 de 4. No se menciona en la información disponible ninguna fase de RLHF o DPO posterior al SFT.

La interfaz de inferencia es una conversación de tres turnos en formato sharegpt (`system`, `human`, `gpt`). El mensaje de sistema es idéntico en los ocho modelos de la colección ("You are an expert academic reviewer tasked with evaluating research papers."), mientras que el preámbulo del usuario es específico del dominio ICLR e incluye la instrucción de responder `\boxed{Accept}` o `\boxed{Reject}` junto con la nota de que ICLR tiene una tasa de aceptación aproximada del 30 %. El cuerpo del artículo se inserta a continuación en Markdown. El autor advierte además de una asimetría en el volumen de datos: los modelos entrenados con arXiv vieron aproximadamente tres veces menos ejemplos que los entrenados con ICLR, por lo que las comparaciones directas entre dominios deben corregirse por ese desequilibrio.

## Capacidades

- Clasificacion binaria de aceptacion/rechazo de articulos academicos a partir del texto completo (abstract, cuerpo y estructura en Markdown).
- Generacion de una respuesta textual de un solo veredicto con el formato exacto `Outcome: \boxed{Accept}` o `Outcome: \boxed{Reject}`.
- Exposicion de logprobs en la posicion del token de decision, lo que habilita puntuaciones continuas calibrables en lugar de decisiones duras.
- Procesamiento de entradas largas: el entrenamiento uso una longitud de corte de 24.480 tokens, suficiente para articulos completos, no solo resumenes.
- Servido como API compatible con OpenAI a traves de vLLM (`--task generate`), y como servidor FastAPI con endpoints `/submit`, `/submit_latex`, `/submit_arxiv` y `/status/{job_id}` en el orquestador PaperScorer.
- Aceptacion de tres formatos de entrada en el orquestador: PDF anonimizado, directorio de fuentes LaTeX anonimizado e identificador de arXiv.
- Adaptabilidad mediante nuevo SFT con LLaMA-Factory para otros venues o dominios (los siete modelos hermanos de la coleccion demuestran ese flujo).
- Capacidades multilingues: no disponibles; el modelo esta etiquetado unicamente para ingles.
- Vision: no disponible en esta variante (es la version de texto; las variantes de vision son checkpoints separados que anaden un token `<image>` por captura de pagina).
- Tool calling, function calling y razonamiento multi-paso agentico: no se declaran en la informacion disponible.

## Casos de uso

- Triaje editorial previo: dado un PDF o un directorio LaTeX anonimizado, el modelo devuelve una probabilidad de aceptacion en segundos; un comite puede priorizar que articulos necesitan mas revisores o detectar envios con alta probabilidad de rechazo antes de asignar esfuerzo humano.
- Herramienta de autoevaluacion para autores: antes de enviar a ICLR, el autor puede ejecutar `paperscorer run articulo.pdf` y obtener un veredicto calibrado junto con la puntuacion `logprob(Accept) − logprob(Reject)`, util como senal adicional a la revision interna del grupo.
- Investigacion sobre predictibilidad de la revision por pares: el modelo sirve como instrumento reproducible para medir cuanto del resultado editorial es predecible a partir del texto, que es precisamente el objeto del articulo de NeurIPS 2026 citado en la model card.
- Analisis de sesgos y calibracion: al exponer logprobs y permitir umbrales calibrados en validacion, se pueden estudiar desviaciones entre la tasa de aceptacion predicha (49 % en test) y la real (~30 % en ICLR), asi como el comportamiento por area tematica.
- Anotacion debil a escala para construir datasets: las predicciones del modelo pueden usarse como etiquetas auxiliares (weak supervision) en corpus grandes de OpenReview, siempre con validacion humana posterior.
- Integracion en pipelines de revision asistida: el servidor vLLM compatible con OpenAI permite insertar el scorer como paso previo en una plataforma de gestion editorial, con los endpoints del orquestador para enviar jobs y consultar estados.
- Meta-revision y control de calidad: comparar el veredicto predicho con las puntuaciones reales de los revisores puede senalar casos anomalos (por ejemplo, articulos con puntuacion baja pero alta probabilidad de aceptacion segun el modelo) que merezcan una revision adicional.
- Transferencia a otros venues: partiendo de este checkpoint se puede reentrenar por SFT con LLaMA-Factory (LR 1e-6, lote 32, contexto ~24k) sobre datos de NeurIPS, ACL o ICML, siguiendo el mismo patron que la coleccion usa entre dominios arXiv e ICLR.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto en distribucion `iclr-balanced-test`, con umbral de calibracion elegido en `iclr-balanced-val`. La puntuacion empleada es `logprob(Accept) − logprob(Reject)` en la posicion del token de decision; `pA` es la tasa de aceptacion predicha y `A_rec` / `R_rec` son el recall de aceptacion y de rechazo respectivamente.

| n_test | Exactitud | AUC | pA | A_rec | R_rec |
|---|---|---|---|---|---|
| 2495 | 67,0 % | 0,650 | 49 % | 66,0 % | 67,9 % |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) ni comparaciones numericas frente a los modelos hermanos de la coleccion o frente al modelo base.

## Requisitos de hardware

- Peso de los parametros en precision de entrenamiento (BF16): aproximadamente 15,2 GB (7.615.616.512 parametros × 2 bytes), calculado a partir del numero de parametros declarado.
- El repositorio ocupa 30,5 GB, coherente con pesos en precision completa y/o artefactos adicionales del entrenamiento.
- Estimacion de cache KV (partiendo de la arquitectura Qwen2.5-7B: 28 capas, 4 cabezas KV con GQA, dimension de cabeza 128, KV en FP16): unos 56 KB por token, es decir aproximadamente 1,4 GB para una secuencia de 24.480 tokens. Es una estimacion derivada de la arquitectura del modelo base, no un dato publicado.
- VRAM recomendada para servir en BF16 con vLLM: del orden de 20-24 GB contando pesos, cache KV y overhead del runtime. El README sugiere `--gpu-memory-utilization 0.85`, lo que implica reservar la mayor parte de una GPU de 24 GB o mas.
- GPU profesionales: A100 (40/80 GB), H100 (80 GB) y L40S (48 GB) sirven el modelo con margen amplio y permiten lotes concurrentes grandes.
- GPU de consumo: si cabe en RTX 4090 y RTX 3090 (ambas 24 GB) en BF16, aunque con contexto reducido o concurrencia limitada; en GPUs de 12-16 GB seria necesario cuantizar (no hay cuantizaciones publicadas, habria que generarlas).
- Opciones de despliegue documentadas: vLLM (`vllm serve skonan/PaperScorer-7B-Text-OpenReview-ICLR --task generate --gpu-memory-utilization 0.85`), el orquestador PaperScorer (`paperscorer setup --serve`, UI en http://localhost:8003) y LLaMA-Factory para reentrenamiento.
- Opciones no confirmadas en la informacion disponible: llama.cpp, Ollama y TGI (no se publican pesos GGUF ni plantillas especificas para estos runtimes).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa cualitativa con el modelo base y con los modelos hermanos de la propia coleccion. Los datos de parametros del base y de la variante de este modelo son los declarados; el resto de celdas quedan como no disponibles al no publicarse cifras.

| Modelo | Parametros | Modalidad | Dominio | Exactitud en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PaperScorer-7B-Text-OpenReview-ICLR (este) | ~7,6B | Texto | ICLR | 67,0 % (AUC 0,650, n=2495) | `other` | Pesos `safetensors` en HuggingFace |
| PaperScorer-7B-Text-Arxiv (hermano) | ~7B | Texto | arXiv | No disponible | No disponible | Pertenece a la coleccion PaperScorer |
| PaperScorer-3B-Text-OpenReview-ICLR (hermano) | ~3B | Texto | ICLR | No disponible | No disponible | Pertenece a la coleccion PaperScorer |
| Variantes de vision (hermanos) | 3B / 7B | Texto + imagen (una por pagina) | arXiv / ICLR | No disponible | No disponible | Pertenece a la coleccion PaperScorer |
| Qwen/Qwen2.5-7B-Instruct (base) | ~7,6B | Texto | Generalista | No aplica (no predice decisiones editoriales) | No detallada en la informacion disponible | HuggingFace |

Advertencia del propio autor: los modelos entrenados con ICLR vieron aproximadamente el triple de ejemplos que los entrenados con arXiv, por lo que cualquier comparacion directa entre ambos dominios debe tener en cuenta esa asimetria de datos. No se dispone de comparaciones frente a clasificadores alternativos de aceptacion (por ejemplo, modelos especializados de bibliometria) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de un solo proposito: no es un asistente general ni un generador de revisiones; su funcion es emitir un veredicto binario. Usarlo fuera de ese patron de prompt produce salidas no fiables.
- Entrenado exclusivamente para ICLR: el preambulo de usuario es especifico del dominio ICLR y la calibracion se hizo sobre `iclr-balanced-val`. Aplicarlo a otros venues sin recalibrar el umbral invalida la interpretacion de las probabilidades.
- Desajuste de calibracion: la tasa de aceptacion predicha en test es del 49 %, mientras que ICLR tiene aproximadamente un 30 % real. La puntuacion requiere umbral calibrado; el veredicto textual por si solo no esta calibrado.
- Exactitud moderada: 67,0 % de exactitud y AUC 0,650 sobre 2.495 articulos. Es mejor que el azar, pero esta lejos de ser una senal concluyente para decisiones editoriales reales.
- Idioma: unicamente ingles. Articulos en otros idiomas no estan cubiertos.
- Modalidad: esta variante no procesa figuras ni capturas de pagina; solo texto. Las variantes de vision son checkpoints distintos.
- Dependencia del preprocesado: el modelo espera el articulo en Markdown y anonimizado; el pipeline `paperprep` del orquestador realiza esa conversion. Un preprocesado distinto puede degradar el rendimiento.
- Riesgo de sesgos no cuantificados: la model card no documenta analisis de sesgo por area tematica, afiliacion, pais o estilo de escritura. Al tratarse de un clasificador aprendido de decisiones historicas de un comite, puede reproducir sesgos presentes en esos datos.
- Riesgo de uso indebido: emplear el veredicto como criterio automatico de rechazo vulnera el principio de revision por pares humana y puede tener consecuencias eticas y de reputacion.
- Licencia: la model card declara `other` sin especificar los terminos. Antes de cualquier uso comercial o de redistribucion hay que verificar las condiciones del modelo base Qwen2.5-7B-Instruct y las del propio ajuste; no se puede asumir uso comercial libre a partir de la informacion disponible.
- Advertencia sobre la reproducibilidad: no se publican en la informacion disponible los detalles completos de composicion del dataset `iclr-21k`, la semilla, ni curvas de validacion por epoca, mas alla del checkpoint del paso 1322.
- Adopcion practicamente nula: el modelo figura con 0 descargas y 0 likes en los datos proporcionados, por lo que no existe una comunidad que haya validado su comportamiento fuera de los experimentos del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skonan/PaperScorer-7B-Text-OpenReview-ICLR
- Modelo base Qwen/Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio del orquestador PaperScorer: https://github.com/zlab-princeton/PaperScorer
- Coleccion PaperScorer (8 modelos y datasets asociados): https://huggingface.co/collections/zlab-princeton/paperscorer
- Articulo citado: Konan, S., Liu, J. y Liu, Z., "PaperScorer: How Predictable Is Paper Acceptance?", NeurIPS 2026 (BibTeX en la model card; no se ha localizado URL de publicacion en la informacion disponible).
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a paginas de inicio de sesion de Facebook y no guardan relacion con PaperScorer.

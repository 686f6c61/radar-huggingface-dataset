# skonan/PaperScorer-3B-Vision-OpenReview-ICLR

## Resumen

PaperScorer-3B-Vision-OpenReview-ICLR es un ajuste fino por SFT del modelo multimodal Qwen/Qwen2.5-VL-3B-Instruct, desarrollado por el usuario skonan dentro del proyecto PaperScorer (zlab-princeton). El modelo recibe el texto de un articulo academico en Markdown junto con capturas de pantalla de cada pagina, y emite un veredicto binario de tipo ICLR: `\boxed{Accept}` o `\boxed{Reject}`. Su proposito no es generar resenas, sino predecir el resultado de aceptacion, un problema de clasificacion con senal de calibracion a traves de los logprobs en el token de decision.

Tecnicamente es un transformer multimodal de 3.754.622.976 parametros (unos 3,75 mil millones), heredado de la familia Qwen2.5-VL, por lo que combina un encoder visual con el decodificador de lenguaje de Qwen2.5. El entrenamiento se realizo sobre el conjunto iclr-21k con una particion balanceada 85/5/10, durante 4 epocas (checkpoint final en el paso 5296), usando LLaMA-Factory con FSDP2 y una longitud de corte de 24.480 tokens.

Es relevante ahora porque forma parte de una coleccion de ocho modelos PaperScorer que cubren el producto cartesiano {3B, 7B} x {texto, vision} x {arxiv, openreview-iclr}, lo que permite comparaciones controladas entre tamano, modalidad y dominio. El modelo esta pensado para integrarse en un flujo de revision automatizada con API FastAPI y servidor de scoring sobre vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) tipo Qwen2.5-VL; vision encoder + decodificador de lenguaje |
| Parametros totales | 3.754.622.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-VL-3B-Instruct; cutoff_len de entrenamiento de 24.480 tokens |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; pesos en safetensors (bf16). Convertible a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | Ingles (en) |
| Licencia | other (la model card no detalla terminos; el modelo base Qwen2.5-VL-3B-Instruct usa Apache 2.0) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,3 GB |
| Modalidad de entrada | Texto + capturas de pantalla por pagina (imagenes PNG) |
| Modelo base | Qwen/Qwen2.5-VL-3B-Instruct |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-3B-Instruct, una arquitectura transformer multimodal que procesa texto e imagenes en una misma secuencia. En la variante de vision, tras el cuerpo del articulo en Markdown se anaden tantos tokens `<image>` como capturas de pagina se envian (tipicamente 8-10 para ICLR y 7-9 para arXiv), y el campo `images` de la peticion aporta una lista paralela con las rutas de los PNG. Las entradas siguen el formato sharegpt de tres turnos: `system`, `human` y `gpt`, con un system prompt identico en los ocho modelos de la coleccion.

El ajuste fino se realizo con SFT supervisado sobre el dataset iclr-21k con particion balanceada 85/5/10. Los hiperparametros declarados son: learning rate 1e-6, scheduler cosine_then_constant (decay_ratio 0.75, min_lr_rate 0.001), batch size 16, cutoff_len 24.480, framework LLaMA-Factory con FSDP2. El checkpoint publicado corresponde al paso 5296, al final de la cuarta y ultima epoca. El autor advierte de una asimetria de datos: los modelos entrenados con ICLR vieron unas 21k muestras, mientras que los entrenados con arXiv partieron de una brecha de aproximadamente 3x, algo a tener en cuenta en comparaciones directas. No se menciona en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Clasificacion binaria de aceptacion/rechazo de articulos academicos con salida en formato `Outcome: \boxed{Accept}` o `Outcome: \boxed{Reject}`.
- Comprension multimodal: combina el texto completo del paper (hasta ~32k caracteres en la variante texto, mucho menos en la de vision) con capturas de pagina que aportan figuras, tablas y maquetacion.
- Prediccion calibrada: el score se calcula como `logprob(Accept) − logprob(Reject)` en la posicion del token de decision (el quinto token generado bajo la plantilla `qwen`), lo que permite ajustar un umbral.
- Procesamiento de multiples formatos de entrada: PDF anonimizado, directorio de fuentes LaTeX anonimizado o identificador de arXiv, mediante el orquestador PaperScorer.
- Integracion como servidor: expuesto via vLLM con API compatible con OpenAI en el puerto 8000, o mediante el servidor FastAPI del orquestador en el puerto 8003.
- Ejecucion en modo headless de una sola pasada (`paperscorer run <pdf>`).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, audio ni modos de razonamiento explicito.

## Casos de uso

- Triaje previo a la revision por pares: dado un PDF anonimizado, el modelo emite un veredicto y una probabilidad calibrada que permite priorizar que articulos requieren revision humana detallada, aprovechando su AUC de 0.727 sobre el conjunto de test in-distribution.
- Analisis retrospectivo de decisiones de conferencia: al procesar lotes de PDFs con el servidor vLLM, un comite de programa puede estudiar patrones de aceptacion y comparar el veredicto del modelo con el resultado real (`iclr-balanced-test`).
- Filtrado de envios en plataformas de gestion editorial: integrado en un pipeline que recibe PDFs o directorios LaTeX y devuelve un job con estado y veredicto, el modelo puede descartar envios claramente fuera de alcance antes de asignar revisores.
- Evaluacion de calidad de manuscritos en herramientas academicas: dado que la variante de vision consume capturas de pagina, puede usarse para detectar papers con figuras o tablas pobres junto con su prediccion de aceptacion, sirviendo de senal auxiliar para autores.
- Investigacion en meta-ciencia: la coleccion PaperScorer permite entrenar y comparar variantes por tamano, modalidad y dominio; este checkpoint concreto sirve como referencia de 3B en vision para el dominio OpenReview/ICLR.
- Automatizacion de resenas internas en laboratorios: un grupo de investigacion puede procesar sus borradores antes del envio (via `paperscorer run`) para estimar la probabilidad de aceptacion y decidir si refinar la submission.
- Docencia y formacion de revisores: la salida binaria y las capturas de pagina permiten usar el modelo como ejemplo practico de clasificacion con senal calibrada en cursos de NLP o de publicacion cientifica.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto `iclr-balanced-test` (umbral de calibracion elegido en `iclr-balanced-val`). El score es `logprob(Accept) − logprob(Reject)` en la posicion del token de decision; `pA` es la tasa de aceptacion predicha y `A_rec`/`R_rec` son el recall de aceptacion y de rechazo.

| n_test | Accuracy | AUC | pA | A_rec | R_rec |
|---|---|---|---|---|---|
| 1670 | 65,9% | 0,727 | 45% | 60,7% | 71,0% |

No se han publicado en la informacion disponible resultados comparativos tipo MMLU, HumanEval o GSM8K, ni cifras frente a los modelos hermanos de la coleccion.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 los pesos ocupan aproximadamente 7,5 GB, por lo que con cache KV y tokens de imagen conviene reservar del orden de 10-12 GB.
- En cuantizacion INT8, los pesos bajan a unos 4 GB; en INT4, a unos 2,2-2,5 GB, aunque estas cuantizaciones no estan publicadas oficialmente y habria que generarlas.
- La variante de vision incrementa el consumo de cache KV porque cada captura de pagina consume tokens de imagen; con 8-10 paginas por peticion el uso de memoria crece respecto a la variante de texto.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegues con concurrencia alta; RTX 4090 o RTX 3090 (24 GB) para inferencia comoda en bf16.
- Cabe en GPU de consumo: si, en tarjetas de 12-16 GB o superiores, especialmente con cuantizacion; en 24 GB entra en bf16 sin problemas. El tamano del repositorio (16,3 GB) implica que la descarga completa requiere ese espacio en disco, aunque puede contener mas de una copia de pesos.
- Opciones de despliegue: vLLM esta documentado explicitamente en la model card (`vllm serve ... --task generate --gpu-memory-utilization 0.85`); el orquestador PaperScorer ofrece servidor FastAPI y UI web en el puerto 8003. Al ser un modelo safetensors de Qwen2.5-VL, es convertible a GGUF para llama.cpp u Ollama y desplegable en TGI, aunque ninguna de estas rutas se documenta oficialmente.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

La coleccion PaperScorer incluye ocho modelos de dominio unico mas los datasets asociados, disenados para comparaciones por pares. No se dispone de las especificaciones detalladas de los hermanos en la informacion proporcionada.

| Modelo | Parametros | Modalidad | Dominio | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PaperScorer-3B-Vision-OpenReview-ICLR | 3,75B | Texto + vision | ICLR/OpenReview | 24.480 (entrenamiento) / 32.768 (base) | other | HuggingFace (0 descargas) |
| PaperScorer-3B-Text-OpenReview-ICLR | no disponible | Texto | ICLR/OpenReview | no disponible | no disponible | Coleccion PaperScorer |
| PaperScorer-7B-Vision-OpenReview-ICLR | no disponible | Texto + vision | ICLR/OpenReview | no disponible | no disponible | Coleccion PaperScorer |
| PaperScorer-3B-Vision-Arxiv | no disponible | Texto + vision | arXiv | no disponible | no disponible | Coleccion PaperScorer |
| Qwen/Qwen2.5-VL-3B-Instruct (base) | 3,75B | Texto + vision | Generalista | 32.768 | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en ingles; el prompt de sistema y el preambulo de usuario estan en ese idioma.
- Es un clasificador de dominio muy especifico (aceptacion/rechazo en ICLR/OpenReview); no genera resenas, justificaciones ni puntuaciones parciales.
- Riesgo de alucinacion bajo en la salida (es un token binario), pero la prediccion puede verse sesgada por el estilo, la longitud o la maquetacion del paper mas que por su calidad cientifica real.
- La accuracy de 65,9% implica una tasa de error del 34,1%; con un AUC de 0,727 no es adecuado como unico criterio de decision.
- El propio autor advierte de una asimetria de datos: los modelos entrenados con ICLR vieron unas 21k muestras frente a una brecha de ~3x respecto a los de arXiv, lo que invalida comparaciones directas sin ajustar por volumen de datos.
- La licencia declarada es "other" y la model card no especifica terminos; aunque el modelo base Qwen2.5-VL-3B-Instruct es Apache 2.0, el uso comercial del ajuste fino debe verificarse con el autor antes de desplegarlo.
- Las tecnicas de calibracion dependen del token de decision en la quinta posicion bajo la plantilla `qwen`; usar otra plantilla o parser invalida el umbral calibrado.
- Las cuantizaciones no estan publicadas oficialmente; cualquier conversion a GGUF/AWQ/GPTQ es responsabilidad del usuario y puede degradar la calibracion.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, sin validacion independiente por parte de terceros.
- El repositorio pesa 16,3 GB, lo que puede implicar costes de almacenamiento y descarga superiores a los esperables para 3,75B parametros en bf16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skonan/PaperScorer-3B-Vision-OpenReview-ICLR
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Repositorio del orquestador PaperScorer: https://github.com/zlab-princeton/PaperScorer
- Coleccion PaperScorer en HuggingFace: https://huggingface.co/collections/zlab-princeton/paperscorer
- Paper asociado: cita a una publicacion en NeurIPS 2026 (referencia BibTeX truncada en la model card)
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos no guardan relacion con el contenido de esta ficha.

# skonan/PaperScorer-7B-Vision-OpenReview-ICLR

## Resumen

PaperScorer-7B-Vision-OpenReview-ICLR es un ajuste fino supervisado (SFT) del modelo multimodal Qwen/Qwen2.5-VL-7B-Instruct, desarrollado por el usuario skonan dentro del proyecto PaperScorer del laboratorio zlab-princeton. El modelo predice el veredicto de aceptacion o rechazo de articulos cientificos presentados a ICLR, tomando como entrada el texto del articulo en markdown mas una captura de pantalla por pagina, replicando asi el flujo real de revision de un revisor que lee tanto el contenido como el formato del PDF.

Se trata de un modelo de vision-lenguaje de 8.292.166.656 parametros totales (aproximadamente 7B del decoder de lenguaje mas el codificador visual), entrenado sobre el corpus iclr-21k con un reparto balanceado 85/5/10. El checkpoint publicado corresponde al paso 2648, final de la epoca 2 de 4, con una longitud de corte de 24.480 tokens, learning rate de 1e-6 y batch size de 16, usando LLaMA-Factory con FSDP2.

Su relevancia practica es acotada pero clara: es una herramienta de investigacion sobre el proceso de revision por pares, no un modelo de proposito general. Alcanza un 68,4 % de exactitud y un AUC de 0,663 sobre el conjunto de test calibrado de 2498 articulos de ICLR, con un modelo gemelo orientado a texto y otros seis variantes en la misma coleccion (3B y 7B, texto y vision, dominios arXiv e ICLR).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) heredada de Qwen2.5-VL: decoder de lenguaje mas codificador visual con atencion a ventanas |
| Parametros totales | 8.292.166.656 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 24.480 tokens configurados como cutoff_len en entrenamiento; se hereda el contexto nativo del modelo base Qwen2.5-VL-7B-Instruct (dato no especificado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | other (licencia personalizada sin texto detallado en la informacion proporcionada) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 33,2 GB |
| Modalidad de entrada | texto + capturas de pantalla por pagina (7-9 imagenes tipicas en arXiv, 8-10 en ICLR) |
| Modelo base | Qwen/Qwen2.5-VL-7B-Instruct |
| Framework de entrenamiento | LLaMA-Factory + FSDP2 |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura completa de Qwen2.5-VL-7B-Instruct: un transformer decoder de aproximadamente 7B parametros para el lenguaje, acoplado a un codificador visual que procesa las capturas de pagina, lo que eleva el total a 8,29B. La innovacion respecto al modelo base no esta en la arquitectura sino en el ajuste: el prompt de entrada se estructura como una conversacion sharegpt de tres turnos (system, human, gpt) en la que el turno de usuario contiene el cuerpo del articulo en markdown seguido de una secuencia de tokens `<image>`, uno por captura de pagina, con una lista paralela de ficheros PNG en el campo `images` de la peticion. El prompt de sistema es identico en los ocho modelos de la coleccion ("You are an expert academic reviewer tasked with evaluating research papers."), mientras que el preambulo de usuario varia segun el dominio de entrenamiento (ICLR en este caso, con mencion explicita a una tasa de aceptacion del 30 %).

El entrenamiento es un SFT puro (sin RLHF ni DPO documentados) sobre iclr-21k, con un reparto balanceado 85/5/10 y aproximadamente 21.000 ejemplos vistos durante 4 epocas (2644 a 5296 pasos). Los hiperparametros publicados son learning rate 1e-6, scheduler cosine_then_constant con decay_ratio 0,75 y min_lr_rate 0,001, batch size 16 y cutoff_len 24.480, ejecutado con LLaMA-Factory sobre FSDP2. El checkpoint publicado es el paso 2648, al final de la segunda epoca. La salida se emite como texto con el veredicto en formato `Outcome: \boxed{Accept}` o `Outcome: \boxed{Reject}`; para la calibracion se emplean los logprobs en la posicion del token de decision (quinto token generado bajo la plantilla de Qwen), calculando la puntuacion como `logprob(Accept) - logprob(Reject)`. El autor advierte explicitamente de una asimetria de datos: los modelos entrenados con ICLR vieron unos 21.000 ejemplos, aproximadamente tres veces menos que los entrenados con arXiv, por lo que las comparaciones directas entre ambos deben tenerlo en cuenta.

## Capacidades

- Clasificacion binaria de articulos cientificos en Accept o Reject segun el estilo de ICLR, a partir del texto completo y de las capturas de pagina.
- Comprension multimodal: procesa simultaneamente el cuerpo del articulo en markdown y las imagenes de pagina, lo que le permite captar maquetacion, figuras y tablas.
- Salida con distribucion de probabilidad calibrable: emite logprobs en el token de decision, lo que permite umbralizar en lugar de quedarse con la etiqueta argmax.
- Procesamiento de articulos largos: soporta entradas de hasta 24.480 tokens combinando texto e imagenes.
- Ingesta en varios formatos mediante la herramienta orquestadora: PDF anonimizado, directorio de fuentes LaTeX o identificador de arXiv.
- Servicio mediante API compatible con OpenAI a traves de vLLM.
- Capacidad multilingue: limitada al ingles (idioma declarado en la ficha del modelo).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, audio ni modo de pensamiento explicito.

## Casos de uso

- Triaje previo de envios en comites de programa: integrado mediante la API FastAPI de PaperScorer, el modelo puntua cada PDF anonimizado y devuelve un veredicto mas `p_accept`, lo que permite priorizar que articulos requieren mas revisiones humanas o detectar envios con baja probabilidad de exito antes de asignar revisores.
- Autoevaluacion por parte de autores antes de enviar: un autor puede ejecutar `paperscorer run /ruta/articulo.pdf` en modo headless y obtener una senal orientativa sobre la probabilidad de aceptacion, usando la puntuacion calibrada como indicador de que secciones pueden necesitar refuerzo.
- Investigacion en meta-ciencia sobre revision por pares: el modelo permite estudiar que caracteristicas del texto y del formato correlacionan con la aceptacion, comparando sus predicciones con los resultados reales de ICLR a lo largo de distintas ediciones.
- Analisis de sesgo y calibracion de decisiones editoriales: al exponer logprobs y tasas de aceptacion predichas (pA = 53 % frente a una tasa base de alrededor del 30 %), sirve para auditar el sesgo de optimismo de los modelos de juicio automatico y ajustar umbrales con un conjunto de validacion.
- Generacion de datos sinteticos de revision: Las salidas etiquetadas Accept/Reject sobre el corpus iclr-21k pueden emplearse para entrenar o evaluar otros clasificadores de articulos, o como linea base en estudios comparativos entre modelos 3B y 7B, texto y vision.
- Filtrado en pipelines de mineria de literatura: dado un flujo continuo de preprints de arXiv, el modelo puede descartar o marcar articulos con baja probabilidad de aceptacion en conferencias de primer nivel, reduciendo el volumen que llega a revision manual.
- Reproduccion de experimentos de investigacion: al publicarse los 8 modelos single-domain y los datasets PaperScorer-Text y PaperScorer-Vision, permite replicar comparaciones pareadas entre tamano, modalidad y dominio bajo condiciones controladas.

## Benchmarks y rendimiento

Evaluacion del propio autor sobre el conjunto `iclr-balanced-test` (en distribucion). El umbral de calibracion se selecciono sobre `iclr-balanced-val`. La puntuacion es `logprob(Accept) - logprob(Reject)` en la posicion del token de decision; `pA` es la tasa de aceptacion predicha, y `A_rec` y `R_rec` son el recall de aceptacion y de rechazo.

| n_test | Exactitud | AUC | pA | A_rec | R_rec |
|---|---|---|---|---|---|
| 2498 | 68,4 % | 0,663 | 53 % | 71,0 % | 65,7 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16 (16 bits): en torno a 16,6 GB solo para los pesos (8,29B x 2 bytes), mas el cache KV y las activaciones del codificador visual.
- VRAM estimada en FP8 (8 bits): aproximadamente 8,3 GB de pesos, con perdida de precision no evaluada en la informacion disponible.
- VRAM estimada en INT4 (4 bits): aproximadamente 4,5 GB de pesos, siempre que se generen cuantizaciones propias, ya que el repositorio solo publica safetensors.
- GPU de gama profesional recomendadas: A100 de 40 o 80 GB, H100 de 80 GB y L40S de 48 GB, todas con margen suficiente para contexto largo y concurrencia moderada.
- GPU de consumo: una RTX 4090 de 24 GB es viable cargando el modelo en BF16 con `--gpu-memory-utilization 0.85`, pero el margen es estrecho y limita la longitud de contexto util y el numero de peticiones concurrentes, especialmente con 8-10 imagenes por articulo.
- Despliegue: el modelo card documenta vLLM (`vllm serve skonan/PaperScorer-7B-Vision-OpenReview-ICLR --task generate --gpu-memory-utilization 0.85`) y el orquestador PaperScorer (`paperscorer serve`, con interfaz web en el puerto 8003 y API FastAPI en el mismo puerto). No se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PaperScorer-7B-Vision-OpenReview-ICLR | 8,29B | texto + vision, dominio ICLR | 24.480 tokens (entrenamiento) | 68,4 % de exactitud, AUC 0,663 en iclr-balanced-test | other | HuggingFace, 0 descargas |
| PaperScorer-7B-Text-OpenReview-ICLR | aproximadamente 7B (segun denominacion) | solo texto, dominio ICLR | no disponible | no disponible | other | misma coleccion |
| PaperScorer-3B-Vision-OpenReview-ICLR | aproximadamente 3B (segun denominacion) | texto + vision, dominio ICLR | no disponible | no disponible | other | misma coleccion |
| Qwen/Qwen2.5-VL-7B-Instruct (modelo base) | 8,29B aproximadamente | texto + vision, proposito general | no especificado en la informacion proporcionada | no disponible; no esta especializado en prediccion de veredictos | licencia propia de Qwen | HuggingFace |

El autor advierte que la comparacion entre modelos entrenados con arXiv y con ICLR esta sesgada por una diferencia de aproximadamente 3x en el volumen de datos de entrenamiento (unos 21.000 ejemplos en ICLR frente a un volumen mayor en arXiv), por lo que las comparaciones pareadas dentro de la coleccion deben interpretarse con cautela.

## Limitaciones y advertencias

- Exactitud modesta: un 68,4 % de acierto sobre 2498 articulos en distribucion implica un 31,6 % de errores; el modelo no es adecuado como decision autonomo en un proceso real de revision.
- AUC de 0,663: la capacidad de discriminacion es debil, muy proxima al azar aleatorio (0,5); la utilidad principal esta en el umbral calibrado, no en el ranking fino.
- Sesgo de optimismo: la tasa de aceptacion predicha (53 %) duplica aproximadamente la tasa base real de ICLR (en torno al 30 % mencionada en su propio prompt), lo que sugiere una tendencia a predecir Accept con demasiada frecuencia.
- Especificidad de dominio: entrenado exclusivamente con iclr-21k, por lo que su comportamiento fuera de ICLR (otras conferencias, otras disciplinas, journals) no esta validado.
- Fuga temporal potencial: no se documenta la distribucion temporal de iclr-21k ni si el conjunto de test es posterior en el tiempo al de entrenamiento, lo que puede inflar la metrica si hay solapamiento.
- Idioma unico: solo ingles declarado; el rendimiento en articulos en otros idiomas no esta caracterizado.
- Limitacion de contexto con vision: la ventana de 24.480 tokens se consume rapidamente al adjuntar 8-10 capturas de pagina de alta resolucion, lo que puede truncar el cuerpo del articulo.
- Riesgo de alucinacion: el modelo puede generar texto adicional al veredicto; la documentacion recomienda leer directamente los logprobs en la posicion del token de decision en lugar de parsear la salida libre.
- Licencia "other" sin texto detallado en la informacion proporcionada: el uso comercial queda indeterminado y requiere consulta directa con el autor antes de cualquier despliegue productivo. Ademas, el modelo base Qwen2.5-VL-7B-Instruct arrastra sus propias condiciones de licencia.
- Datos sensibles: aunque el flujo de PaperScorer trabaja con PDF anonimizado, procesar envios bajo revision implica obligaciones de confidencialidad que el modelo no gestiona por si mismo.
- Repositorio con 0 descargas y 0 likes: sin validacion independiente por parte de la comunidad ni informes de terceros sobre su comportamiento.
- Checkpoint parcial: corresponde al paso 2648, final de la epoca 2 de 4, por lo que no es el resultado de un entrenamiento completado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skonan/PaperScorer-7B-Vision-OpenReview-ICLR
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Coleccion PaperScorer (8 modelos single-domain y datasets PaperScorer-Text y PaperScorer-Vision): https://huggingface.co/collections/zlab-princeton/paperscorer
- Repositorio y orquestador PaperScorer: https://github.com/zlab-princeton/PaperScorer
- Paper de referencia: NeurIPS 2026 (la cita BibTeX incluida en la model card esta truncada; no se dispone de URL en la informacion proporcionada)

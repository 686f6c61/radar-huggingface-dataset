# skonan/PaperScorer-7B-Vision-arXiv

## Resumen

PaperScorer-7B-Vision-arXiv es un ajuste fino por supervisión (SFT) de Qwen/Qwen2.5-VL-7B-Instruct, publicado por el usuario skonan en el marco del proyecto PaperScorer. El modelo predice el veredicto de aceptación o rechazo de articulos cientificos con formato de conferencia de aprendizaje automatico, a partir del texto completo del articulo en Markdown mas capturas de pantalla de cada pagina. Es, por tanto, un clasificador generativo multimodal especializado, no un modelo de proposito general.

El problema que aborda es el triaje y la prediccion de resultados de revision por pares: dado un PDF o un directorio de LaTeX anonimizado, devuelve una decision binaria (`\boxed{Accept}` o `\boxed{Reject}`) y expone la diferencia de logprobs entre ambos tokens, lo que permite usar la salida como una puntuacion continua calibrable. Esto lo hace relevante para meta-investigacion sobre revision academica, analisis de sesgos de aceptacion a escala y evaluacion comparativa de modelos revisores.

Tecnicamente se apoya en la arquitectura vision-language de Qwen2.5-VL (transformer multimodal con torre visual y decodificador de lenguaje) con 8.292.166.656 parametros totales (aproximadamente 8,29 B). El entrenamiento se realizo con LLaMA-Factory y FSDP2 sobre el dataset arxiv-large (71.000 ejemplos con balance por venue), con longitud de corte de 24.480 tokens, y el checkpoint publicado corresponde al paso 8862, al final de la epoca 2 de 4. El repositorio ocupa 33,2 GB y acumula 15 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language (Qwen2.5-VL), ajustado por SFT |
| Parametros totales | 8.292.166.656 (aproximadamente 8,29 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como especificacion oficial; el entrenamiento SFT uso `cutoff_len` de 24.480 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `other` (la model card no reproduce el texto de la licencia; el modelo base tiene licencia propia que conviene consultar) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-VL-7B-Instruct |
| Modalidad de entrada | Texto (Markdown) + capturas PNG por pagina |
| Tamano del repositorio | 33,2 GB |
| Checkpoint publicado | Paso 8862 (final de la epoca 2 de 4) |
| Descargas / likes | 15 / 0 |
| Fecha de creacion / actualizacion | 2026-05-19 / 2026-10-12 |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-7B-Instruct, un transformer multimodal con una torre de vision que proyecta las imagenes al espacio de tokens del decodificador de lenguaje, y un decodificador autoregresivo con atencion por ventana sobre la secuencia de texto e imagen. En esta variante concreta, la entrada combina el cuerpo del articulo en Markdown con una secuencia de marcadores `<image>` (uno por captura de pagina, tipicamente 7 a 9 en el caso de arXiv) que se emparejan posicionalmente con una lista de rutas PNG enviada en el campo `images` de la peticion. La salida esperada es una unica linea de la forma `Outcome: \boxed{Accept}` o `Outcome: \boxed{Reject}`, y la decision se toma leyendo los logprobs de los tokens Accept/Reject en la quinta posicion generada bajo la plantilla de chat de Qwen.

El ajuste se realizo con LLaMA-Factory y FSDP2 sobre el dataset arxiv-large en su version `balanced_per_venue` (71.000 ejemplos), con una tasa de aprendizaje de 1e-6, planificador `cosine_then_constant` (decay_ratio 0.75, min_lr_rate 0.001), tamano de lote 16 y `cutoff_len` de 24.480 tokens. El prompt sigue una estructura de tres turnos tipo ShareGPT (system, human, gpt): el mensaje de sistema es identico en los ocho modelos de la familia PaperScorer ("You are an expert academic reviewer tasked with evaluating research papers."), mientras que el preambulo de usuario varia segun el dominio de entrenamiento y, en las variantes de vision, incluye la ristra de tokens `<image>` al final del cuerpo. No se documenta en la informacion disponible el uso de RLHF o DPO, ni la composicion detallada del dataset mas alla del numero de ejemplos y el balance por venue.

## Capacidades

- Prediccion binaria de veredicto (Accept/Reject) sobre articulos cientificos, con salida textual y logprobs asociados para calibracion.
- Comprension multimodal: procesa simultaneamente el texto del articulo y capturas de pagina completa, lo que permite captar informacion de figuras, tablas y maquetacion que no aparece en el Markdown.
- Manejo de articulos largos hasta el limite de entrenamiento de 24.480 tokens, con preprocesado externo (paperprep) que convierte PDF o LaTeX a Markdown y genera las capturas.
- Generacion de puntuaciones continuas mediante la diferencia `logprob(Accept) − logprob(Reject)` en la posicion del token de decision.
- Integracion con tooling de despliegue: se documenta su uso como servidor de scoring en vLLM con API compatible con OpenAI y a traves del orquestador PaperScorer (FastAPI en el puerto 8003, con endpoints `/submit`, `/submit_latex` y `/submit_arxiv`).
- Capacidad de operar en modo headless (`paperscorer run <pdf>`) para uso por lotes.
- No se documentan capacidades de tool calling, function calling, uso agentico, vision mas alla de capturas de pagina, audio, ni modo de razonamiento explicito.

## Casos de uso

- Triaje previo de envios a conferencias: el modelo puede actuar como primer filtro sobre un lote de manuscritos anonimizados, generando una probabilidad de aceptacion por articulo para priorizar la asignacion de revisores humanos.
- Autoevaluacion por parte de autores antes del envio: dado el PDF o el directorio de LaTeX anonimizado, el sistema devuelve un veredicto y una puntuacion calibrada que el autor puede usar para detectar debilidades de presentacion o de evidencia experimental.
- Meta-investigacion sobre revision academica: el modelo permite reproducir a escala de decenas de miles de articulos la relacion entre caracteristicas del paper y el resultado real de aceptacion, usando la salida como variable dependiente.
- Analisis de sesgos de aceptacion: al exponer logprobs calibrados, se puede estudiar si el modelo (y por extension los patrones del corpus) favorece determinados venues, longitudes, estilos de escritura o instituciones implicitas en el formato.
- Benchmarking de modelos como revisores: sirve como referencia de la familia PaperScorer para comparaciones pareadas frente a variantes de 3B, variantes de texto o variantes entrenadas en OpenReview-ICLR.
- Enrutamiento editorial automatizado: los endpoints HTTP permiten integrar el scoring en un pipeline de gestion de envios que clasifique automaticamente los manuscritos con baja probabilidad de aceptacion para descarte temprano o para revision rapida.
- Extraccion de senales visuales en documentos cientificos: la variante de vision puede emplearse para tareas auxiliares de analisis de maquetacion (densidad de figuras, tablas comparativas, claridad de diagramas) aprovechando que consume capturas de pagina completas.
- Verificacion de estabilidad de decisiones: ejecutando el modelo sobre la misma publicacion en formato PDF y en formato LaTeX se puede medir la sensibilidad del veredicto a la representacion de entrada.

## Benchmarks y rendimiento

Evaluacion en distribucion sobre `arxiv-balanced-test`, con umbral de calibracion elegido en `arxiv-balanced-val`. La puntuacion es `logprob(Accept) − logprob(Reject)` en la posicion del token de decision.

| n_test | Exactitud | AUC | pA (tasa de aceptacion predicha) | A_rec (recall de aceptados) | R_rec (recall de rechazados) |
|---|---|---|---|---|---|
| 1414 | 76,7% | 0,851 | 52% | 79,9% | 73,7% |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) ni comparaciones numericas directas contra los modelos hermanos de la coleccion.

## Requisitos de hardware

- Pesos en BF16/FP16: aproximadamente 16,6 GB para los 8.292.166.656 parametros, mas el coste de la torre de vision y del cache KV (estimacion a partir del recuento de parametros, no un dato publicado).
- En cuantizacion INT8 se estiman unos 8,3 GB y en INT4 unos 4,2-4,5 GB, partiendo del recuento de parametros; el autor no publica checkpoints cuantizados.
- El coste de contexto es elevado en la variante de vision: cada captura de pagina consume tokens de imagen, con 7-9 paginas por articulo y hasta 24.480 tokens de entrada, lo que incrementa el cache KV respecto a un modelo solo de texto.
- GPU de datacenter recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB, en BF16 y con margen para el cache KV y las imagenes.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB podria ejecutar el modelo en BF16 con `gpu-memory-utilization` ajustado y contexto recortado; en cuantizaciones de 8 o 4 bits seria viable en GPUs de 12-16 GB, aunque estos valores son estimaciones y no aparecen en la documentacion del autor.
- Opciones de despliegue documentadas: vLLM (`vllm serve skonan/PaperScorer-7B-Vision-arXiv --task generate --gpu-memory-utilization 0.85`), servidor FastAPI del orquestador PaperScorer con interfaz web en el puerto 8003, y ejecucion headless mediante el CLI `paperscorer`.
- No se publican pesos en GGUF, por lo que llama.cpp u Ollama no estan soportados de serie con este repositorio (no disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Dominio de entrenamiento | Idiomas | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|---|
| PaperScorer-7B-Vision-arXiv | 8,29 B | Texto + imagenes | arXiv (71.000 ejemplos) | en | other | Acc 76,7%, AUC 0,851 en arxiv-balanced-test |
| PaperScorer-7B-Text-arXiv | No disponible | Solo texto | arXiv | en | other | No disponible |
| PaperScorer-7B-Vision-ICLR (openreview-iclr) | No disponible | Texto + imagenes | OpenReview-ICLR | en | other | No disponible |
| PaperScorer-3B-Vision-arXiv | No disponible | Texto + imagenes | arXiv | en | other | No disponible |
| Qwen/Qwen2.5-VL-7B-Instruct (modelo base) | 8,29 B aproximadamente | Texto + imagenes | Datos generales multimodales | Multilingue (segun el modelo base) | Licencia propia del modelo base | No disponible |

Nota del autor relevante para cualquier comparacion: los modelos entrenados en arXiv vieron unos 71.000 ejemplos (4 epocas, 8884/17724 pasos), mientras que los entrenados en ICLR manejaron aproximadamente tres veces menos datos, por lo que las comparaciones directas entre ambos deben tener en cuenta esa asimetria.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; el modelo no esta validado para articulos en otros idiomas.
- Dominio restringido a arXiv y a la tarea de prediccion binaria de aceptacion: no genera revisiones, puntuaciones por criterio ni comentarios justificativos.
- Riesgo elevado de alucinacion en el sentido de que el modelo aprende correlaciones superficiales del corpus (venue, longitud, estilo, presencia de ciertas secciones) en lugar de una evaluacion causal de la calidad cientifica.
- Sesgos potenciales derivados del dataset de entrenamiento: `balanced_per_venue` fuerza el equilibrio de clases, pero no necesariamente corrige sesgos de area tematica, institucion o idioma de los autores.
- No debe utilizarse como sustituto de la revision por pares ni para tomar decisiones reales de aceptacion o rechazo sobre personas; su uso razonable es la investigacion y el analisis agregado.
- La asimetria de datos entre dominios (arXiv frente a ICLR, factor cercano a 3) invalida comparaciones directas de rendimiento entre los modelos de la coleccion sin corregir por volumen de entrenamiento.
- El checkpoint publicado corresponde al final de la epoca 2 de 4, por lo que no es necesariamente el punto de mejor rendimiento del plan de entrenamiento.
- Si la longitud del articulo supera el `cutoff_len` de 24.480 tokens, el contenido se trunca y el veredicto puede degradarse.
- La licencia esta etiquetada como `other` y la model card no incluye su texto: es imprescindible revisar los terminos del modelo base y del ajuste antes de cualquier uso comercial.
- El modelo tiene un historial de adopcion muy bajo (15 descargas, 0 likes), sin validacion independiente por parte de terceros.
- La salida depende de la plantilla de prompt exacta (mensaje de sistema fijo, preambulo especifico de arXiv y posicion del token de decision en la quinta posicion generada); desviarse de ese formato puede invalidar la calibracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skonan/PaperScorer-7B-Vision-arXiv
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio del orquestador PaperScorer: https://github.com/zlab-princeton/PaperScorer
- Coleccion PaperScorer (modelos y datasets): https://huggingface.co/collections/zlab-princeton/paperscorer
- Paper asociado: citado como paper de NeurIPS 2026 en la model card; enlace no disponible en la informacion proporcionada.

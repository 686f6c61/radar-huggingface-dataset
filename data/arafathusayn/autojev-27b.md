# arafathusayn/autojev-27b

## Resumen

AutoJev-27B es un modelo de decision multimodal derivado de Qwen/Qwen3.8-27B mediante un ajuste fino completo de todos los pesos. Su salida no es texto generativo libre, sino una distribucion de probabilidad sobre un conjunto de opciones que el usuario proporciona, resuelta en un unico paso hacia adelante (one forward pass per question). Lo publica el usuario arafathusayn en HuggingFace, con codigo asociado en el repositorio denis-pplx/autojev bajo licencia MIT y pesos bajo Apache 2.0.

El modelo cuenta con 26.085.330.160 parametros (aproximadamente 26,1 mil millones) almacenados en safetensors, con un repositorio de 101,6 GB. Incluye una API compatible con TypeSafe (endpoint POST /v1/systemone con los modos choice, noul y score, y soporte opcional de imagenes en base64) y un playground web servido en local. La model card declara explicitamente que la evaluacion publicada mide decisiones sobre texto y que el soporte de imagenes no constituye una afirmacion de precision sobre imagenes naturales.

Su relevancia practica esta en el ambito de la clasificacion calibrada: frente a la base Qwen3.8-27B, la model card reporta una mejora de exactitud global de 69,83% a 84,60%, con reduccion del error de calibracion (ECE de 0,06483 a 0,04282) y del Brier score (de 0,40834 a 0,22027). Se entrena con un unico H200, 73.000 ejemplos unicos, 286 actualizaciones y estrategia de entropia cruzada, con un escalar de temperatura ajustado por separado para la calibracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; full-weight SFT sobre Qwen/Qwen3.8-27B, con cabeza de decision sobre opciones |
| Parametros totales | 26.085.330.160 (≈26,1 B) |
| Parametros activos | No aplica; la model card no indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; solo se publican pesos en BF16 (≈49 GiB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (pesos); MIT (codigo del repositorio) |
| Formato de pesos | safetensors (PyTorch; requiere Python 3.12+ y uv) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de indicar que se trata de un ajuste fino de todos los pesos (full-weight SFT) sobre Qwen/Qwen3.8-27B. El modelo incorpora codigo personalizado (etiqueta custom-code) y se distribuye con un cargador DecisionModel y un servidor propio. La salida es una probabilidad sobre las opciones suministradas, calculada en un unico paso hacia adelante por pregunta, en lugar de una secuencia de tokens generada. El entrenamiento utilizo entropia cruzada como perdida y la calibracion se ajusta aparte mediante un unico escalar de temperatura.

El proceso de entrenamiento se ejecuto en una sola GPU H200, con 73.000 ejemplos de entrenamiento unicos, 286 actualizaciones de pesos y checkpoint final correspondiente al paso 200. La model card indica que parte del trabajo (investigacion, generacion de datos, entrenamiento, evaluacion y despliegue) se realizo con agentes autonomos bajo supervision humana. El corpus exacto de entrenamiento no se distribuye con el modelo, por lo que no es posible auditar la composicion del dataset ni su mezcla de idiomas o dominios. El repositorio incluye scripts de entrenamiento (configs/train.sh) con argumentos configurables.

## Capacidades

- Decision clasificatoria sobre un conjunto cerrado de opciones, devolviendo probabilidades en un unico paso hacia adelante por pregunta.
- Modo score para puntuacion y modo noul (etiqueta de salida definida por el usuario) a traves de POST /v1/systemone.
- Entrada multimodal: acepta imagenes opcionales codificadas en base64, aunque la model card advierte que no se reclama precision sobre imagenes naturales.
- Calibracion de probabilidades: ECE de 0,04282 y Brier score de 0,22027 en la evaluacion publicada.
- API compatible con TypeSafe y playground web integrado en http://localhost:8000, con documentacion en /docs.
- Autenticacion opcional mediante la variable de entorno AUTOJEV_API_KEY.
- No se declara soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni generacion de texto libre.

## Casos de uso

- Triage de tickets de soporte: dado un texto de incidencia y un conjunto de categorias o niveles de prioridad definidos por el equipo, el modelo devuelve una distribucion de probabilidad que permite enrutar automaticamente y fijar umbrales de escalado.
- Moderacion de contenido con umbral calibrado: al disponer de probabilidades calibradas (ECE 0,04282), es posible fijar puntos de corte con significado estadistico en lugar de depender de heuristicas sobre logits.
- Etiquetado asistido en pipelines de datos: clasificacion de grandes volumenes de texto en categorias predefinidas, con la probabilidad asociada como senal de confianza para revision humana posterior.
- Puntuacion de respuestas en evaluacion de sistemas: el modo score permite comparar respuestas candidatas de otros modelos o de humanos frente a opciones predefinidas, con una metrica unica por elemento.
- Clasificacion con contexto visual auxiliar: uso del campo images en base64 para escenarios donde el texto va acompanado de una captura o documento, asumiendo que no existe validacion publicada de precision sobre imagenes naturales.
- Analisis de encuestas y formularios: asignacion de respuestas abiertas a opciones de un cuestionario cerrado, aprovechando la salida probabilistica para medir ambiguedad por item.
- Seleccion entre variantes en A/B testing: eleccion entre dos o mas alternativas redactadas (por ejemplo, asuntos de correo o mensajes de producto) con una probabilidad comparable entre pares.
- Filtrado previo en sistemas RAG: decision sobre si un fragmento recuperado es relevante o no para una consulta, con salida binaria probabilistica integrable como etapa de reranking.

## Benchmarks y rendimiento

La model card publica resultados de exactitud agregada, ECE y Brier score. No se especifica el nombre ni la composicion del conjunto de evaluacion (la figura se titula "selected-accuracy").

| Modelo | Exactitud global (mayor es mejor) | ECE (menor es mejor) | Brier (menor es mejor) |
|---|---:|---:|---:|
| Qwen3.8-27B | 69,83% | 0,06483 | 0,40834 |
| AutoJev-27B | 84,60% | 0,04282 | 0,22027 |
| Jev | 82,79% | 0,05274 | 0,25400 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos anteriores corresponden a la evaluacion declarada por el autor y miden decisiones sobre texto.

## Requisitos de hardware

- Pesos en BF16 de aproximadamente 49 GiB, mas el sobrecoste de ejecucion; el autor recomienda una GPU con espacio suficiente para esa cifra mas el runtime.
- GPU profesionales compatibles: H200 (usada en el entrenamiento), H100 de 80 GB o A100 de 80 GB como opciones naturales para BF16 en una sola tarjeta.
- GPU de consumo: una RTX 4090 de 24 GB no puede alojar los pesos en BF16. No se publican pesos cuantizados (GGUF, AWQ, GPTQ ni FP8), por lo que no hay una ruta oficial documentada para GPUs de consumo; cualquier cuantizacion requeriria conversion propia y verificar la compatibilidad del codigo personalizado.
- Despliegue: el repositorio proporciona su propio servidor (uv run autojev-serve) con playground y API REST, ademas del cargador DecisionModel. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Entorno: Python 3.12 o superior y el gestor uv con el fichero de dependencias congelado.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio de pesos ocupa 101,6 GB, considerablemente mas que los pesos BF16, por lo que conviene prever espacio en disco para la descarga completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AutoJev-27B | 26.085.330.160 | No disponible | 84,60% (ECE 0,04282) | Apache 2.0 | Pesos en HuggingFace; codigo MIT en GitHub |
| Qwen3.8-27B (base) | No disponible | No disponible | 69,83% (ECE 0,06483) | No disponible | Modelo base referenciado como Qwen/Qwen3.8-27B |
| Jev | No disponible | No disponible | 82,79% (ECE 0,05274) | No disponible | Referenciado como inspiracion del desarrollo, sin enlace en la model card |

No se dispone de otros modelos comparables en la informacion proporcionada. AutoJev-27B se declara como una implementacion independiente inspirada en Jev, con arquitectura y pesos propios; la model card no especifica diferencias tecnicas adicionales frente a esa referencia.

## Limitaciones y advertencias

- La model card advierte que los benchmarks publicados miden decisiones sobre texto y que el soporte de imagenes no constituye una afirmacion de precision sobre imagenes naturales.
- El modelo no es generativo: solo devuelve probabilidades sobre opciones suministradas, por lo que no sirve para tareas de redaccion, resumen o codigo.
- No se declaran idiomas soportados; el comportamiento multilingue es desconocido y no hay evaluacion al respecto.
- No se especifica la longitud de contexto soportada, lo que impide planificar entradas largas con garantias.
- La calibracion es imperfecta incluso tras el ajuste de temperatura (ECE 0,04282, Brier 0,22027): las probabilidades no deben tratarse como certezas absolutas.
- El rendimiento depende del conjunto de opciones suministrado; no hay datos publicados sobre sensibilidad al orden, al numero de alternativas ni a la formulacion del enunciado.
- El corpus de entrenamiento no se distribuye ni se describe, por lo que no es posible auditar sesgos de dominio, idioma o tematica.
- El modelo base Qwen/Qwen3.8-27B aparece referenciado sin ficha publica verificable en la informacion disponible; conviene confirmar su licencia y procedencia antes de un uso comercial.
- La model card mezcla identificadores de autor y repositorio (arafathusayn en HuggingFace frente a denis-pplx en el codigo y los pesos citados); conviene verificar cual es el artefacto canonico.
- El modelo registra 0 descargas y 0 likes, y no cuenta con evaluacion independiente; todos los numeros proceden del autor.
- Parte del desarrollo se realizo con agentes autonomos, segun declara la propia model card; la trazabilidad de las decisiones de diseno es limitada.
- La licencia Apache 2.0 se aplica a los pesos; el codigo del repositorio se distribuye bajo MIT. El uso comercial esta permitido en ambos casos, pero debe verificarse la licencia del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arafathusayn/autojev-27b
- Pesos citados en la model card: https://huggingface.co/denis-pplx/autojev-27b
- Codigo fuente: https://github.com/denis-pplx/autojev
- Licencia de los pesos: https://huggingface.co/denis-pplx/autojev-27b/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los anteriores.

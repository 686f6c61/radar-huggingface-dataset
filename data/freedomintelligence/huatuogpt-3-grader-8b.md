# FreedomIntelligence/HuatuoGPT-3-Grader-8B

## Resumen

HuatuoGPT-3-Grader-8B es un modelo de 8.190.735.360 parametros (aproximadamente 8,19 mil millones) publicado por FreedomIntelligence que actua como evaluador por rubricas en el dominio medico. No es un modelo conversacional generalista: su funcion es recibir una conversacion medico-paciente junto con una lista numerada de criterios puntuados y devolver, en una sola generacion, una lista JSON de valores booleanos que indica si cada criterio se cumple. Sobre esa salida, el metodo OnePO calcula una recompensa numerica normalizada entre 0 y 1.

El modelo esta disenado como componente de recompensa para OnePO (Direct One-stage Policy Optimization for SFT-free Domain Adaptation), un metodo de adaptacion de dominio sin SFT que optimiza directamente la politica a partir de senales de evaluacion. Fue entrenado con muestras anotadas por GPT-4.1, lo que lo situa en la familia de modelos juez o reward models especializados, en lugar de generadores de respuesta clinica.

Su relevancia actual radica en dos factores: por un lado, cubre la evaluacion de respuestas medicas abiertas, donde las metricas n-grama como BLEU o ROUGE resultan inadecuadas; por otro, permite comprobar multiples criterios (incluidos criterios negativos con penalizacion) en una unica pasada de decodificacion, lo que abarata el coste de anotar grandes volumenes de datos. La model card no especifica licencia, idiomas soportados ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; el tag de HuggingFace indica `qwen3` como arquitectura base. La model card no detalla la arquitectura |
| Parametros totales | 8.190.735.360 (~8,19 mil millones), dato real de los pesos safetensors |
| Parametros activos | no disponible; el tag `qwen3` y el recuento de parametros apuntan a un modelo denso (no MoE), pero no se confirma en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin versiones GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible; la plantilla de evaluacion y los ejemplos estan en ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repositorio: 16,4 GB) |
| Uso previsto | Evaluacion por rubricas (grader) para OnePO en dominio medico |
| Fecha de publicacion en HuggingFace | 2026-09-17 (ultima actualizacion: 2026-09-17) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de los tags de HuggingFace, que apuntan a `qwen3` y a un uso de `text-generation` con `AutoModelForCausalLM`. Esto implica un transformer decoder-only causal estandar, con pesos publicados en safetensors y compatibilidad con `device_map="auto"` y `dtype="auto"` en la libreria transformers. No se documentan innovaciones como atencion lineal, decodificacion especulativa ni capas hibridas.

En cuanto al entrenamiento, la model card indica que el modelo fue entrenado con muestras anotadas por GPT-4.1 y que actua como evaluador de multiples criterios en una sola generacion ("checks multiple criteria in one generation to provide rewards for open-ended medical responses"). No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion adicionales como RLHF o DPO. Si se detalla el protocolo de inferencia asociado: la plantilla de evaluacion debe usarse literalmente, con `enable_thinking=False`, y el `score.py` del repositorio sigue el protocolo de entrenamiento de OnePO extrayendo la respuesta final y conservando sus primeros 10.000 caracteres.

El mecanismo de puntuacion de OnePO divide la suma de los puntos de los criterios cumplidos entre el total de puntos positivos y recorta el resultado al intervalo [0, 1]. Los criterios negativos se evaluan a la inversa: devuelven `true` cuando la conducta indeseada esta presente, de modo que sus puntos se restan.

## Capacidades

- Evaluacion por rubricas: dada una conversacion y una lista numerada de criterios con puntuacion con signo (por ejemplo `1. (+3pts) ...`), devuelve una lista JSON de booleanos, uno por criterio y en el mismo orden.
- Evaluacion multi-criterio en una sola generacion, en lugar de una llamada por criterio, lo que reduce el coste de anotacion.
- Deteccion de criterios negativos: identifica conductas indeseadas (por ejemplo, emitir un diagnostico definitivo sin evidencia) y las marca como cumplidas para que se resten puntos.
- Puntuacion por lotes mediante el script `score.py`, con soporte de `--batch-size` para reutilizar la misma pasada de inferencia entre varias respuestas.
- Dominio medico: los ejemplos y el entrenamiento se orientan a conversaciones clinicas abiertas y a la incertidumbre asociada a informacion incompleta.
- Formato de salida estricto: lista JSON de booleanos, con `max_new_tokens=256` en el ejemplo oficial y decodificacion greedy (`do_sample=False`).
- No se documenta soporte de tool calling o function calling.
- No se documenta comportamiento agentico ni razonamiento multi-paso explicito; de hecho, el uso previsto requiere el modo de pensamiento desactivado.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Recompensa para adaptacion de dominio con OnePO: el modelo actua como funcion de recompensa durante el entrenamiento de un modelo medico, sustituyendo la necesidad de un conjunto SFT anotado. Es adecuado porque su salida ya viene normalizada al rango [0, 1] que espera el algoritmo.
- Evaluacion automatica de respuestas clinicas abiertas: en lugar de metricas n-grama, se definen rubricas con puntos positivos y negativos y el modelo emite un veredicto booleano por criterio, lo que permite puntuar miles de respuestas sin anotadores humanos.
- Filtrado de datos sinteticos medicos: antes de incorporar respuestas generadas por otro LLM a un dataset de entrenamiento, se aplica el grader con rubricas de seguridad clinica y se descartan las muestras que activan criterios negativos.
- Control de regresion de asistentes medicos conversacionales: se ejecuta el grader sobre un conjunto fijo de conversaciones de referencia en cada version del asistente y se comparan las puntuaciones para detectar degradaciones antes del despliegue.
- Construccion de conjuntos de preferencias para DPO: el grader proporciona puntuaciones comparables entre respuestas candidatas a una misma consulta, lo que permite ordenarlas y generar pares preferidos/rechazados.
- Auditoria de seguridad y comunicacion de incertidumbre: con rubricas que penalizan diagnosticos definitivos sin evidencia, el modelo senala respuestas con riesgo clinico y las marca con los puntos negativos correspondientes.
- Investigacion en metodos de recompensa: al ser un grader pequeno (8,19 mil millones de parametros) y de codigo abierto en pesos, sirve como punto de comparacion reproducible frente a jueces propietarios en experimentos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con MMLU, HumanEval, GSM8K, MedQA ni con metricas especificas de evaluacion por rubricas (por ejemplo, acuerdo con anotaciones humanas o con GPT-4.1). Tampoco se documentan latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para los pesos en bf16/fp16: aproximadamente 16,4 GB (8,19 mil millones de parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: del orden de 9-10 GB para los pesos, mas overhead. Requiere cuantizacion propia, ya que no se publican pesos precompilados.
- VRAM estimada en cuantizacion de 4 bits: del orden de 5-6 GB para los pesos, mas overhead. Igualmente requiere cuantizar a partir de safetensors.
- GPU recomendadas: A100 (40 o 80 GB), H100 (80 GB) o L40S para servicio en bf16; RTX 4090 o RTX 6000 Ada (24 GB o mas) para inferencia en bf16 con margen ajustado.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como la RTX 4090 o la RTX 3090 en bf16 con contexto corto, y en tarjetas de 12-16 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: transformers (ruta oficial documentada), text-generation-inference (el tag `text-generation-inference` aparece en HuggingFace) y vLLM como servidor compatible. El repositorio no publica pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa por parte del usuario.
- La model card no documenta latencia ni throughput. Como referencia estructural, el script `score.py` admite `--batch-size 8`, lo que indica que el autor considera viable el procesamiento por lotes en una unica GPU.

## Comparativa con modelos similares

La informacion proporcionada no incluye modelos comparables de evaluacion por rubricas en el dominio medico. Como unica referencia estructural, el tag de HuggingFace senala `qwen3` como arquitectura base, presumiblemente sobre un modelo de ~8 mil millones de parametros.

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HuatuoGPT-3-Grader-8B | 8,19 mil millones | no disponible | Evaluador por rubricas medicas para OnePO | no disponible | Pesos safetensors en HuggingFace |
| Arquitectura base indicada por el tag (`qwen3`, ~8B) | no disponible | no disponible | Generacion de texto generalista | no disponible | no disponible en la informacion facilitada |
| Otros graders o reward models medicos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia no especificada: no es posible determinar si se permite el uso comercial. Conviene contactar con el autor antes de integrarlo en un producto.
- Ausencia total de benchmarks: no hay evidencia publicada de acuerdo con anotadores humanos, por lo que la fiabilidad del grader no esta cuantificada.
- Dependencia estricta de la plantilla: la model card exige mantener literalmente el texto, las etiquetas y el orden de las secciones, sustituyendo unicamente `{conversation}` y `{rubrics}`. Cualquier variacion puede degradar la salida.
- Requiere el modo de pensamiento desactivado (`enable_thinking=False`); activarlo puede alterar el formato de salida.
- Salida de formato rigido: una lista JSON de booleanos por generacion. Un fallo de formato invalida la puntuacion completa de esa respuesta.
- Ventana de evaluacion truncada: el protocolo de OnePO extrae la respuesta final y conserva solo sus primeros 10.000 caracteres, de modo que las respuestas largas se evaluan parcialmente.
- Sensibilidad de la rubrica: los criterios deben redactarse de forma inequivoca y con puntos con signo (`+3pts`, `-4pts`); rubricas ambiguas o solapadas pueden producir veredictos inconsistentes.
- Riesgo de alucinacion en el juicio: como modelo generativo, puede marcar como cumplido un criterio no satisfecho, especialmente cuando el criterio exige conocimiento clinico especifico. No se documenta ninguna validacion empirica de este riesgo.
- Sesgos inhererentes al entrenamiento: el modelo se entreno con anotaciones de GPT-4.1, por lo que hereda los sesgos y las convenciones de ese anotador en el dominio medico.
- Cobertura linguistica desconocida: no se declaran idiomas soportados y los ejemplos estan en ingles; no hay garantia de comportamiento correcto con conversaciones en castellano.
- No apto como dispositivo medico ni para diagnostico real: su funcion es puntuar respuestas, no generar consejo clinico, y no consta validacion clinica alguna.
- Adopcion nula en el momento de la consulta (0 descargas, 0 likes), sin comunidad que haya reportado problemas de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FreedomIntelligence/HuatuoGPT-3-Grader-8B
- Repositorio GitHub de HuatuoGPT-3: https://github.com/FreedomIntelligence/HuatuoGPT-3
- Implementacion del protocolo de recompensa de OnePO: https://github.com/FreedomIntelligence/HuatuoGPT-3/blob/main/onepo/reward.py
- Paper de OnePO (OpenReview): https://openreview.net/pdf?id=M8eyUQldfx
- No se han encontrado en la busqueda web otros enlaces relevantes sobre este modelo; los resultados devueltos no guardan relacion con el.

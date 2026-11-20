# paradigma-inc/limite-1b-value-model

## Resumen

Limite 1B value model es un modelo de valor (critic) de 1.035.255.457 parametros desarrollado por paradigma-inc para el dominio del razonamiento matematico. No es un modelo generativo: dada una pregunta y una solucion propuesta, devuelve un valor numerico por cada token de la respuesta, donde cada valor estima el retorno final de correccion a partir del razonamiento disponible *antes* de ese token. Es, por tanto, una pieza para pipelines de reinforcement learning y para el reranking de candidatos, no un asistente conversacional.

El modelo se distribuye con todo lo necesario para inferencia en el propio repositorio: pesos en safetensors, tokenizer, configuracion y codigo Python (`value_model.py`, `score.py`). No requiere un modelo actor separado ni un framework de entrenamiento. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

Su relevancia actual radica en que expone una API de scoring por token con valores de regresion en bruto (no probabilidades calibradas), lo que permite analizar el razonamiento paso a paso y detectar el punto exacto donde una solucion empieza a degradarse. El repositorio ocupa 4.2 GB e incluye referencias de reproducibilidad medidas en una NVIDIA H100 80GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; se infiere por el uso de FlashAttention 2/3 y backend eager) |
| Parametros totales | 1.035.255.457 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se han probado entradas de hasta 6.064 tokens) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con tokenizer, config y codigo Python en el repo) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que es un transformer con soporte para los backends de atencion `eager`, `flash_attention_2` y `flash_attention_3`. El modelo se carga mediante un loader propio (`load_value_model`) y no a traves de `AutoModelForCausalLM`; no implementa `.generate()`, ni KV cache, ni batches con padding. La API de referencia acepta una unica secuencia sin padding por llamada.

El entrenamiento se enmarca en reinforcement learning para razonamiento matematico: el modelo regresiona retornos en bruto (raw returns), no probabilidades calibradas, y por eso sus valores pueden salir del rango [0, 1] y no debe aplicarseles sigmoid. Los prompts de entrenamiento colocan la pregunta en un turno `user` seguido de una linea en blanco y la instruccion exacta "Please reason step by step, and put your final answer within \boxed{}.". Las respuestas empiezan con un span de razonamiento `<think>` y terminan con `<|endoftext|>`. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Scoring por token: devuelve un valor por cada token de la respuesta (`pre_action_values`), basado en el prefijo anterior a ese token.
- Valor de prompt (`prompt_value`): valor antes de cualquier token de respuesta; depende solo del prompt y no sirve para ordenar distintas soluciones a la misma pregunta.
- Agregacion por media (`mean_response_pre_action_value`): media aritmetica de los valores de prefijo de la respuesta, util para ranking de candidatos.
- Valor del ultimo token (`last_pre_action_value`) y valor tras la entrada completa (`raw_value_after_complete_input`), que es una magnitud distinta de los valores pre-accion.
- Reranking de soluciones candidatas: al puntuar cada candidato con el mismo modelo cargado, permite ordenar respuestas a un mismo problema.
- Analisis paso a paso: al ser valores por token, permite localizar el punto del razonamiento donde el retorno estimado cae.
- No genera texto, no verifica demostraciones y no produce respuestas; solo puntua texto existente.
- No soporta tool calling, function calling, agentes ni vision segun la informacion disponible.
- Multilingue: no; solo ingles declarado.

## Casos de uso

- Reranking en inference-time scaling: generar N soluciones con un modelo actor y puntuar cada una con Limite para seleccionar la de mayor `mean_response_pre_action_value`. Es adecuado porque el coste de scoring es una sola pasada por candidato sin generacion.
- Filtrado de datos sinteticos: puntuar soluciones matematicas generadas a gran escala y descartar las que caen por debajo de un umbral validado en un conjunto etiquetado propio, antes de usarlas en fine-tuning.
- Critic en RL: usar los valores pre-accion como funcion de valor para calcular ventajas en algoritmos de policy optimization sobre tareas de matematicas, con la salvedad de que no hay KV cache y cada evaluacion es una pasada completa.
- Deteccion de errores en cadenas de razonamiento: inspeccionar `pre_action_values` para identificar el token o paso donde el valor cae de forma sostenida, lo que ayuda a construir datasets de correccion de errores.
- Analisis de calidad de modelos generadores: comparar la distribucion de valores medios de dos modelos actores sobre el mismo benchmark de matematicas como metrica complementaria a la exactitud.
- Control de calidad en produccion educativa: en un tutor de matematicas, puntuar la solucion antes de mostrarla al alumno y derivar a revision humana si el valor medio queda por debajo de un umbral calibrado.
- Investigacion en calibracion: estudiar la relacion entre retornos regresados y correccion real, ya que el modelo expone valores en bruto sin sigmoid y sin recorte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo incluye mediciones de reproducibilidad y consistencia entre backends de atencion, no comparaciones de calidad:

| Medicion | Valor |
|---|---|
| Ejemplo de referencia (46 prompt + 54 respuesta), `eager`: `prompt_value` | 0.696658 |
| Mismo ejemplo, `eager`: `mean_response_pre_action_value` | 0.680541 |
| Mismo ejemplo, `flash_attention_2`: `prompt_value` / media | 0.696323 / 0.680799 |
| Mismo ejemplo, `flash_attention_3`: `prompt_value` / media | 0.696323 / 0.680787 |
| Acuerdo entre backends en el ejemplo de 100 tokens | dentro de 2.2e-3 por token |
| Diferencia maxima FA2 vs FA3 en entrada de 6.064 tokens | 5.6e-3 |

Estas cifras son mediciones de consistencia numerica sobre entradas concretas, no tolerancias universales ni umbrales de correccion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 1.035B parametros en safetensors sin cuantizar, los pesos ocupan aproximadamente 4.2 GB, a lo que hay que sumar activaciones y estados de atencion.
- GPU de referencia: NVIDIA H100 80GB, con Python 3.12, `torch==2.11.0` y CUDA 13.0; los tiempos publicados son la media de cinco llamadas tras warmup.
- CPU: soportada para ejemplos cortos segun la model card.
- GPU consumer: no se indica compatibilidad ni VRAM minima; por tamano de pesos, una GPU consumer con 8-16 GB deberia poder alojar los pesos, pero no hay datos publicados de latencia ni de memoria pico.
- Backends de atencion: `eager` (sin necesidad de instalar FlashAttention), `flash_attention_2` y `flash_attention_3`.
- Despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI; la unica via documentada es el codigo Python del repositorio (`score.py` o `load_value_model` + `score_tokens`).
- Throughput y latencia: no disponibles; solo se documenta el entorno de medida, no cifras de tokens por segundo.
- Restriccion de API: una secuencia sin padding por llamada, sin KV cache y sin batches; el paralelismo debe implementarse a nivel de proceso.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos de valor (critics) comparables ni datos de rendimiento que permitan una comparacion con alternativas de la misma categoria.

## Limitaciones y advertencias

- Los valores son puntuaciones de regresion, no probabilidades calibradas de correccion; un valor medio de 0.8 no implica un 80% de acierto.
- No debe aplicarse sigmoid: los valores pueden estar fuera de [0, 1] y el loader no los recorta.
- El modelo puntua texto; no genera respuestas, no verifica demostraciones y no sustituye a un comprobador formal.
- Cada valor pre-accion solo ve el prompt y los tokens anteriores; un paso incorrecto contamina los valores posteriores.
- El formato de prompt es estricto: pregunta en turno `user`, linea en blanco e instruccion exacta con `\boxed{}`; entradas alejadas de ese formato quedan fuera de la distribucion de entrenamiento.
- Solo ingles; no hay soporte multilingue declarado.
- La API no implementa batches con padding ni KV cache, lo que limita el throughput en produccion y obliga a serializar candidatos.
- Las diferencias entre backends crecen con la longitud de secuencia (hasta 5.6e-3 en 6.064 tokens), lo que desaconseja usar esos margenes como umbrales de aceptacion.
- No hay benchmarks publicados de calidad, por lo que cualquier umbral o regla de ranking debe validarse con ejemplos etiquetados propios.
- Riesgo de sesgo y de alucinacion en los valores: no se documenta analisis de sesgos; al ser un regresor sobre datos de matematicas, su comportamiento fuera de ese dominio no esta caracterizado.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias del codigo incluido en el repositorio (requirements.txt) por si arrastran licencias distintas.
- El repositorio tiene 0 descargas y 5 likes en el momento de la consulta, lo que indica validacion externa muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradigma-inc/limite-1b-value-model
- Paper referenciado en los tags: arxiv:2611.21646 (no se dispone de URL verificada en la informacion proporcionada)
- Repositorio clonable via Git LFS: https://huggingface.co/paradigma-inc/limite-1b-value-model (git clone)
- Descarga via CLI: `hf download paradigma-inc/limite-1b-value-model --local-dir ./limite-1b-value-model`

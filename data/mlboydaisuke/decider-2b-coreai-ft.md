# mlboydaisuke/decider-2b-coreai-ft

## Resumen

decider-2b-coreai-ft es un ajuste fino de tipo *decider* sobre el checkpoint Mapika/decider-2b (v11), publicado por el usuario mlboydaisuke. No es un modelo generativo: recibe un estado (texto o JSON) junto con preguntas tipadas (eleccion multiple, puntuacion o si/no) y devuelve una probabilidad por cada opcion, leida directamente de los logits de las letras en la posicion de respuesta. Es decir, su salida es una distribucion de probabilidad sobre opciones predefinidas, nunca texto libre.

El modelo conserva la misma arquitectura, tokenizer, readout y configuracion que la v11; solo cambian los pesos. El ajuste se hizo sobre 1.399 items de decision tipada, escritos y verificados de forma automatica, orientados al extremo dificil de la tarea (politicas largas, reglas multi-salto, fechas y numeros, trampas). Cuenta con 1.881.825.088 parametros (~1,88 mil millones) y un repositorio de 3,8 GB en safetensors bf16.

Su relevancia es acotada pero concreta: es una mejora medible sobre la v11 en el subconjunto dificil de JevBench (73 aciertos frente a 62 sobre 111 items), a costa de una mayor confianza tambien en las respuestas incorrectas. Es un checkpoint de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia del modelo base Mapika/decider-2b; el tag de HuggingFace indica `qwen3_5_text`. Misma arquitectura, tokenizer, readout y config que la v11 (solo cambian los pesos) |
| Parametros totales | 1.881.825.088 (~1,88 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos bf16; el autor no menciona cuantizaciones GGUF, GPTQ, AWQ ni similares) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (bf16); repositorio de 3,8 GB |

Otros datos de la ficha de HuggingFace: pipeline declarado `text-classification`, libreria `transformers`, compatibilidad con endpoints, region `us`, creado el 25/09/2026 y actualizado el mismo dia.

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint base Mapika/decider-2b v11, sin modificaciones estructurales: el modelo lee el estado y las preguntas tipadas y emite una probabilidad por opcion a partir de los logits de las letras en el slot de respuesta. Esto implica que el modelo no genera texto en ningun caso y que su uso requiere la libreria de inferencia especifica del proyecto (`decider.infer.Decider`, metodo `system_one`), no un pipeline estandar de generacion.

El ajuste fino fue completo (no LoRA) en bf16, con entropia cruzada sobre los logits de las letras, durante 3 epocas, con learning rate 8e-6, 20 pasos de warmup, 12.288 tokens por paso con acumulacion 2, opciones barajadas en cada tokenizacion y sin replay de la mezcla propia de Mapika. Total: 303 pasos de optimizador, aproximadamente 16 minutos en una unica A100. Los datos de entrenamiento son 1.399 items tipados escritos por Qwen3.8-27B (FP8) a partir de especificaciones de familia, tema y longitud, y verificados despues por el mismo modelo con cinco pasadas de chain-of-thought y opciones barajadas, conservando el item solo si al menos cuatro pasadas coincidian con la respuesta redactada. Se hicieron dos rondas de autoria (1.065 + 334 items). Ningun item de JevBench, publico o sellado, forma parte del conjunto de entrenamiento.

## Capacidades

- Decision tipada: responde preguntas de tipo eleccion multiple (`choice`), puntuacion (`score`) y si/no devolviendo una probabilidad por cada opcion.
- Lectura de estado en texto plano o JSON, con soporte para politicas largas, reglas multi-salto, fechas y numeros, y elementos trampa en el enunciado.
- Salida calibrada en forma de distribucion de probabilidad, lo que permite fijar umbrales de confianza y derivar casos ambiguos.
- Integracion como componente rapido ("system one") dentro de un sistema mayor que combine una decision inmediata con un razonamiento posterior mas costoso.
- Compatibilidad con el servidor `POST /v1/systemone` del proyecto Mapika mediante `decider.serve`, apuntando al repositorio del modelo.
- No soporta tool calling ni function calling: no se menciona en la informacion disponible.
- No soporta agentes ni razonamiento multi-paso generativo: no genera texto en ningun caso.
- Solo ingles: la unica lengua declarada es `en`.
- Sin capacidades de vision, audio ni modo "thinking" declaradas.

## Casos de uso

- Triage y enrutado de tickets: dado el texto de una incidencia y un conjunto cerrado de categorias, el modelo devuelve la probabilidad de cada una y permite enrutar por argmax o escalar a un humano si la probabilidad maxima queda por debajo de un umbral.
- Aplicacion de politicas de negocio: con la politica en el estado y las condiciones del cliente en JSON, responde a la pregunta "que plan aplica" eligiendo entre alternativas definidas, un escenario para el que el ajuste incorporo explicitamente politicas largas.
- Verificacion de elegibilidad con reglas multi-salto, fechas y numeros: por ejemplo, comprobar plazos, acumulacion de condiciones o limites temporales en seguros, becas o subvenciones, devolviendo la probabilidad de cada resultado posible.
- Puntuacion graduada para priorizacion de riesgo: usando preguntas de tipo `score`, el modelo produce una probabilidad por nivel, util para ordenar una cola de revision en lugar de clasificar de forma binaria.
- Filtrado y gating binario: preguntas de si/no sobre contenido o solicitudes que actuan como puerta antes de invocar un modelo generativo mas caro, reduciendo coste por peticion.
- Deteccion de ambiguedad para escalado: la distribucion de probabilidad permite identificar items donde el modelo esta repartido entre opciones y derivarlos a revision humana o a un modelo mayor, en lugar de forzar una respuesta unica.
- Evaluacion comparativa de checkpoints: al compartir arquitectura y readout con la v11, sirve como punto de comparacion controlado en experimentos de ajuste fino sobre decisiones tipadas, con la misma tuberia de inferencia.
- Auditoria de decisiones automatizadas: al devolver probabilidades en lugar de texto, las decisiones son registrables y revisables numericamente, lo que facilita trazas y analisis posteriores de calibracion.

## Benchmarks y rendimiento

JevBench publico, 231 items (facil 48 / estandar 72 / dificil 111), una pregunta por item, pasada unica, lectura de letras mediante `decider.infer.Decider.system_one` con `use_graphs=False`, bf16 sobre una A100, medido el 25/09/2026. Precision = argmax de las probabilidades devueltas.

| Checkpoint | Facil (48) | Estandar (72) | Dificil (111) |
|---|---|---|---|
| Mapika/decider-2b v11 (baseline, misma ejecucion) | 1,0000 | 0,8889 | 0,5586 |
| Este modelo | 1,0000 | 0,8889 | 0,6577 |

Advertencias del propio autor sobre estas cifras: es una medicion independiente, no un resultado oficial de JevBench; la tabla publica del leaderboard incluye items sellados que no se pueden ejecutar, por lo que estas cifras no son comparables con las filas del leaderboard; y la fila baseline es una remedicion en modo eager, no el resultado de la pila de serving de Mapika. Los resultados por item de ambas filas estan en `eval/`.

Datos adicionales de calibracion y generalizacion aportados por el autor:

| Metrica | Baseline v11 | Este modelo |
|---|---|---|
| Probabilidad maxima media en los 111 items dificiles | 0,751 | 0,872 |
| ECE de 10 bins | 0,193 | 0,214 |
| Precision en 100 items retenidos del mismo pipeline de autoria | No disponible | 0,77 (azar: 0,30) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Peso de los parametros en bf16: 1.881.825.088 parametros x 2 bytes = aproximadamente 3,76 GB (el repositorio ocupa 3,8 GB), a lo que hay que sumar activaciones, cache y el overhead del runtime de `decider`.
- VRAM estimada para inferencia: en torno a 5-8 GB en bf16 con margen, aunque no hay cifra oficial publicada; no hay cuantizaciones publicadas que permitan reducirla.
- GPU recomendadas: la medicion del autor se hizo en una A100. Por tamano, cualquier GPU con 8 GB o mas deberia poder alojar los pesos en bf16 o fp16.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090, RTX 3090, RTX 4080 y modelos con 8-12 GB o mas, dado que los pesos ocupan menos de 4 GB. No hay confirmacion oficial del autor.
- Opciones de despliegue: `decider.infer.Decider` con grafos por forma en CUDA o modo eager (`use_graphs=False`), y `decider.serve` exponiendo `POST /v1/systemone`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo con readout de texto estandar, es previsible que esas pilas no lo soporten sin adaptacion.
- Latencia y throughput: no disponibles. El unico dato temporal publicado es de entrenamiento (unos 16 minutos para 303 pasos en una A100), que no es extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench dificil (111) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (decider-2b-coreai-ft) | 1.881.825.088 | No disponible | 0,6577 | Apache-2.0 | HuggingFace |
| Mapika/decider-2b v11 (base) | Mismo recuento, segun el autor solo cambian los pesos | No disponible | 0,5586 (remedicion en la misma ejecucion) | Apache-2.0 (segun la model card) | HuggingFace y repositorio Mapika/decider |
| Otras alternativas | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de otros modelos comparables de la misma categoria (decoders pequenos con readout de decisiones tipadas y salida calibrada). Los clasificadores de texto genericos no son directamente comparables, ya que este modelo no produce etiquetas de texto sino probabilidades derivadas de los logits de las letras.

## Limitaciones y advertencias

- El ajuste hace al modelo mas confiado en los items dificiles, incluidas las respuestas incorrectas: la probabilidad maxima media sube de 0,751 a 0,872 y el ECE de 10 bins empeora de 0,193 a 0,214. La temperatura de `decider_config.json` es la de la v11 y no se reajusto.
- La perdida de entrenamiento llega a aproximadamente 0,1 en la tercera epoca sobre 1.399 items, por lo que el checkpoint ha memorizado en gran medida su conjunto de entrenamiento. La precision en 100 items retenidos del mismo pipeline de autoria es 0,77 frente a un azar de 0,30, lo que sugiere una generalizacion limitada fuera de esa distribucion.
- Las cifras de JevBench son una medicion independiente del autor y no son comparables con las filas del leaderboard publico, que incluye items sellados no ejecutables.
- Solo ingles: cualquier uso en castellano u otros idiomas queda fuera de lo declarado.
- El modelo no genera texto: no sirve para tareas de redaccion, resumen, traduccion ni dialogo directo, y requiere la libreria `decider` para su inferencia.
- Riesgo de alucinacion: no aplica en el sentido generativo habitual, ya que no produce texto libre, pero si existe riesgo de decision erronea con alta confianza, especialmente en items dificiles.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible. Los datos de entrenamiento fueron generados y verificados por Qwen3.8-27B, por lo que podrian heredar sesgos de ese modelo.
- Restricciones de licencia: Apache-2.0, sin restricciones adicionales declaradas para uso comercial. Conviene conservar la atribucion a Mapika (checkpoint base, codigo de entrenamiento y codigo de inferencia).
- Estado de validacion: 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente por parte de la comunidad.
- Las fechas de creacion y actualizacion del repositorio (25/09/2026) son las que figuran en la ficha de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/decider-2b-coreai-ft
- Modelo base: https://huggingface.co/Mapika/decider-2b
- Repositorio de codigo de Mapika (entrenamiento e inferencia, commit `15ab28e`): https://github.com/Mapika/decider
- JevBench (conjunto de evaluacion): https://github.com/fstandhartinger/jevbench
- Qwen3.8-27B (modelo usado para generar y verificar los datos de entrenamiento): no se proporciona enlace en la informacion disponible
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a paginas genericas de Google y no guardan relacion con el modelo.

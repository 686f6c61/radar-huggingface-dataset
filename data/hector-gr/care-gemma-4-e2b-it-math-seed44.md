# hector-gr/CARE-Gemma-4-E2B-it-Math-seed44

## Resumen

CARE-Gemma-4-E2B-it-Math-seed44 es un ajuste fino del modelo multimodal Gemma 4 E2B-it de Google DeepMind, publicado por Hector G. Rodriguez. El modelo se ha post-entrenado con CARE (Cross-question Abstention Reward Estimation), una técnica de aprendizaje por refuerzo que enseña al modelo a verbalizar su propia confianza en las respuestas que genera. El objetivo es habilitar la predicción selectiva: el modelo puede abstenerse o derivar a un humano o a un modelo mas potente cuando su confianza es baja, maximizando la utilidad y minimizando el riesgo de error.

La innovacion central de CARE es que la recompensa no se calcula de forma puntual (correcto = confianza 1, incorrecto = confianza 0), sino sobre el conjunto de pares pregunta-respuesta: en cada nivel de tolerancia al riesgo se induce un umbral de abstencion y cada confianza se recompensa por situarse en el lado correcto del umbral. Segun el articulo, esto eleva la cobertura con un 5% de riesgo (C@5) en MATH-500, GSM8K y Big-Math-Digits del 0,8% al 42,4% frente a recompensas binarias puntuales.

El checkpoint tiene 5.506.950.723 parametros en safetensors (11,0 GB de repositorio), se distribuye bajo licencia Apache 2.0 y esta especializado en matematicas, aunque el articulo tambien reporta resultados de generalizacion fuera de distribucion en QA de conocimiento general, razonamiento y matematicas. Es relevante para desarrolladores que necesitan desplegar sistemas con capacidad de abstenerse de forma calibrada en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E2B-it; encoders de vision y audio congelados durante el post-entrenamiento) |
| Parametros totales | 5.506.950.723 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (limite de generacion evaluado: 4096 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it (revision `70af34e20bd4b7a91f0de6b22675850c43922a03`), un transformer multimodal de Google DeepMind con encoders de vision y audio. El post-entrenamiento es exclusivamente de texto: los encoders multimodales se congelaron y el uso multimodal no se ha evaluado. El ajuste se realiza sobre el dataset mehuldamani/big-math-digits con aprendizaje por refuerzo y la recompensa CARE descrita en el articulo *Cross-Question Reliable Reinforcement Learning* (Hector G. Rodriguez y Marcus Rohrbach), construida sobre el trabajo RLCR de Damani et al. (2025).

La configuracion de entrenamiento documentada en `training_config.yaml` usa batch por dispositivo de 4, acumulacion de gradientes de 96 y longitud maxima de completado de 4096 tokens. El modelo aprende a emitir etiquetas `<answer>...</answer>` y `<confidence>...</confidence>`, verbalizando una confianza numerica junto a cada respuesta. La evaluacion del articulo se realiza con una unica completacion, temperatura 0 y limite de generacion de 4096 tokens. El checkpoint corresponde a la semilla 44; la tabla del articulo sobre Gemma reporta la media de las semillas 43 y 44.

## Capacidades

- Generacion de texto y razonamiento matematico, con especializacion en problemas de matematicas (Big-Math-Digits, MATH-500, GSM8K).
- Verbalizacion de confianza: cada respuesta incluye una etiqueta `<confidence>` con una estimacion numerica de la probabilidad de acierto.
- Prediccion selectiva: permite ordenar respuestas por confianza y aplicar umbrales de abstencion calibrados sobre datos de validacion.
- Razonamiento multi-paso en problemas matematicos y de QA multi-hop (evaluado en el articulo sobre HotpotQA).
- Capacidades multilingues: no disponibles (no se documentan en la informacion proporcionada).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Vision y audio: los encoders estan presentes en el modelo base pero se congelaron durante el post-entrenamiento y su uso multimodal no se ha evaluado.

## Casos de uso

- Sistemas de resolucion de matematicas con derivacion a humano: el modelo genera la respuesta y una confianza; un umbral sobre la confianza permite enviar solo los casos de baja confianza a un revisor humano o a un modelo mayor, reduciendo el coste de supervision.
- Enrutamiento entre modelos (model cascading): usar la confianza verbalizada para decidir si la respuesta de este modelo de 5,5 mil millones de parametros es suficiente o debe escalarse a un modelo mayor, optimizando coste y latencia.
- Evaluacion automatica con control de riesgo: en pipelines de generacion de contenido educativo o financiero, fijar un nivel de tolerancia al riesgo (por ejemplo, 5%) y descartar automaticamente las respuestas por debajo del umbral inducido.
- Investigacion en calibracion e incertidumbre: el checkpoint sirve como referencia reproducible (semilla 44) para comparar metodos de estimacion de confianza y recompensas de abstencion.
- Asistencia en tareas de razonamiento con QA multi-hop: el articulo evalua la generalizacion fuera de distribucion en CommonsenseQA, GPQA, SimpleQA, TriviaQA y HotpotQA, por lo que puede usarse en sistemas de respuesta a preguntas que requieran abstenerse ante conocimiento insuficiente.
- Filtrado de datos sinteticos: generar problemas y soluciones matematicas con puntuaciones de confianza para seleccionar solo las muestras de alta calidad en la construccion de datasets de entrenamiento.
- Despliegue en entornos con requisitos de auditoria: la salida estructurada con `<answer>` y `<confidence>` facilita registrar la incertidumbre de cada respuesta para trazabilidad y cumplimiento.

## Benchmarks y rendimiento

Resultados del checkpoint (semilla 44), en porcentaje. C@r es cobertura con riesgo r; AURC, menor es mejor. ID: big-math-digits, math-500, gsm8k. OOD: commonsenseqa, gpqa, simpleqa, trivia, hotpotqa.

| Metrica | Valor |
|---|---|
| ID C@0 | 0,0 |
| ID C@1 | 0,0 |
| ID C@5 | 0,8 |
| ID C@10 | 43,0 |
| ID AURC (menor es mejor) | 15,9 |
| ID Accuracy | 74,3 |
| OOD C@0 | 1,1 |
| OOD C@1 | 1,1 |
| OOD C@5 | 8,6 |
| OOD C@10 | 31,9 |
| OOD AURC (menor es mejor) | 36,2 |
| OOD Accuracy | 55,3 |

Segun el articulo, CARE eleva la cobertura con 5% de riesgo (C@5) en MATH-500, GSM8K y Big-Math-Digits del 0,8% al 42,4% frente a recompensas puntuales de coincidencia con la correccion, y en QA multi-hop de HotpotQA mejora C@5 fuera de distribucion del 12,3% al 23,6%. No se han publicado en la informacion disponible resultados comparativos de benchmarks estandar (MMLU, HumanEval) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 5,5 mil millones de parametros, en precision bf16 el peso ocupa aproximadamente 11 GB, por lo que se necesita una GPU con al menos 16 GB de VRAM para inferencia con margen para el contexto.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) o A100/H100 son adecuadas; GPUs consumer de 16 GB podrian funcionar en bf16 con contexto limitado.
- Cabe en GPU consumer: previsiblemente si, en tarjetas de 16 GB o mas en bf16; en cuantizaciones de 8 o 4 bits cabria en GPUs de 8-12 GB, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: transformers (libreria declarada); requiere un runtime compatible con Gemma 4. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La evaluacion usa temperatura 0 y un limite de generacion de 4096 tokens, lo que implica secuencias largas y coste de decodificacion proporcional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CARE-Gemma-4-E2B-it-Math-seed44 | 5,51 mil millones | no disponible | Gemma 4 E2B-it + RL CARE para confianza | Apache 2.0 | Hugging Face (231 descargas) |
| google/gemma-4-E2B-it (base) | no disponible en la informacion | no disponible | Modelo multimodal base sin post-entrenamiento de confianza | Apache 2.0 | Hugging Face |
| Modelos con RLCR (Damani et al., 2025) | no disponible | no disponible | Recompensas binarias puntuales de confianza | no disponible | no disponible |

No se dispone de datos de rendimiento comparables de terceros en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La confianza verbalizada no es una garantia de correccion; debe calibrarse un umbral sobre datos de validacion propios antes de usarla en produccion.
- El post-entrenamiento es solo de texto: los encoders de vision y audio se congelaron y el uso multimodal no se ha evaluado.
- El modelo esta especializado en matematicas; su comportamiento en dominios generales se ha evaluado solo como generalizacion fuera de distribucion y con accuracy de 55,3% en el conjunto OOD.
- Requiere un runtime compatible con Gemma 4 y el uso exacto del system prompt de `system_prompt.txt`, la plantilla de chat guardada y todos los EOS IDs de `generation_config.json`; desviarse de esta configuracion puede degradar la calibracion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; la etiqueta de confianza mitiga pero no elimina este riesgo.
- No se documentan sesgos conocidos ni limitaciones de idioma en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar la licencia y el aviso de modificacion del modelo base de Google DeepMind.
- Los resultados del checkpoint corresponden a una unica semilla (44); la tabla del articulo promedia las semillas 43 y 44, por lo que puede haber variabilidad entre ejecuciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hector-gr/CARE-Gemma-4-E2B-it-Math-seed44
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mehuldamani/big-math-digits
- Articulo CARE, *Cross-Question Reliable Reinforcement Learning* (Hector G. Rodriguez y Marcus Rohrbach): no disponible en la informacion proporcionada
- Trabajo RLCR, *Beyond Binary Rewards: Training LMs to Reason About Their Uncertainty* (Damani et al., 2025): no disponible en la informacion proporcionada

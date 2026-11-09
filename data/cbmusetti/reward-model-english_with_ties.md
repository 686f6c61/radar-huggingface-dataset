# cbmusetti/reward-model-english_with_ties

## Resumen

`cbmusetti/reward-model-english_with_ties` es un modelo de recompensa (reward model) de tipo pairwise entrenado para evaluar chistes en ingles. Dado un texto de noticias y dos chistes candidatos, el modelo asigna una puntuacion a cada uno de forma que el chiste preferido por humanos recibe una recompensa mayor. Forma parte de una tesis sobre generacion de humor con aprendizaje por refuerzo, y su codigo y registros de experimentos se publican en el repositorio de la tesis.

El modelo se construye sobre `google-bert/bert-base-uncased`, un transformer encoder de tipo BERT con aproximadamente 110 millones de parametros, y anade una cabeza de clasificacion para producir la recompensa. La variante `RewardModelWithTies` implementa un modelo Bradley-Terry con un umbral de empate aprendido, de modo que las parejas igual de divertidas se tratan como empates en lugar de forzar un orden estricto.

Es relevante para quienes trabajan en RLHF, evaluacion de generacion creativa y modelado de preferencias con empates, ya que ofrece una implementacion concreta de recompensa pairwise aplicada a un dominio subjetivo (el humor) y publica tanto el checkpoint final en ensamble como el mejor trial individual, con hiperparametros y particiones de datos documentados. El repositorio tiene un tamano de 0,9 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) con cabeza de clasificacion para recompensa pairwise; variante Bradley-Terry con umbral de empate aprendido |
| Parametros totales | Aproximadamente 110 millones (heredados de `google-bert/bert-base-uncased`; no se detalla el recuento exacto de la cabeza) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | `max_length` de entrenamiento: 256 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de sequence-classification de `transformers` mas un wrapper de configuracion) |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased` y anade una cabeza de recompensa sobre la representacion del encoder. La variante `RewardModelWithTies` modela la preferencia pairwise mediante Bradley-Terry con un umbral de empate aprendido: en lugar de asumir que un chiste es siempre mejor que el otro, permite que parejas igual de divertidas se clasifiquen como empate. La entrada combina el texto de noticias y el chiste candidato, con una longitud maxima de 256 tokens.

El entrenamiento se realizo con busqueda de hiperparametros mediante Optuna. El mejor trial (trial 2) obtuvo un objetivo de validacion de 0,4681 con `batch_size` 128, `dropout` 0,152, `encoder_learning_rate` 4,058e-05, 6 epocas, estrategia de congelacion `last_2`, `head_learning_rate` 3,384e-05, `layer_lr_decay` 0,8518, `max_length` 256, scheduler `constant_with_warmup`, `warmup_ratio` 0,07751 y `weight_decay` 0. Los datos se dividen en 3405 parejas de entrenamiento, 549 de validacion y 1749 de test, con semilla de particion 42 y conservando los empates. El modelo final es un ensamble: la configuracion ganadora se reentrena sobre train + validacion una vez por semilla y las recompensas se promedian entre miembros.

## Capacidades

- Puntuacion de recompensa pairwise: asigna una puntuacion a cada uno de dos chistes candidatos dado un contexto de noticias.
- Modelado de preferencias con empates: el umbral aprendido permite clasificar parejas como empate cuando son igual de divertidas.
- Evaluacion de generacion de humor: pensado para puntuar salidas de modelos generativos en pipelines de RL.
- Uso como componente en RLHF: proporciona la senal de recompensa en entrenamiento con aprendizaje por refuerzo.
- Inferencia en ensamble: promedio de recompensas entre los miembros del ensamble para mayor estabilidad.
- Capacidades multilingues: limitadas al ingles.
- Tool calling, agentes, vision o audio: no disponibles.

## Casos de uso

- Entrenamiento RLHF para generacion de humor: el modelo actua como critico de recompensa que puntua pares de chistes generados, permitiendo optimizar un generador mediante aprendizaje por refuerzo con senal de preferencia humana.
- Evaluacion automatica de sistemas de generacion de chistes: dado un conjunto de noticias y candidatos, se obtiene un ranking de calidad que sirve como metrica offline antes de evaluacion humana.
- Filtrado y reranking en produccion: en una aplicacion que propone chistes a partir de noticias, el modelo puede reordenar varios candidatos generados y descartar los de menor recompensa.
- Investigacion sobre modelado de preferencias con empates: el umbral aprendido de la variante `RewardModelWithTies` permite estudiar como tratar anotaciones subjetivas donde los evaluadores no coinciden, un problema frecuente en dominios creativos.
- Construccion de datasets de preferencia: el modelo puede preetiquetar pares como proxy para priorizar la revision humana en la anotacion de nuevos datos de humor.
- Reproducibilidad de experimentos de tesis: con hiperparametros, particiones y semilla documentados, sirve como linea base reproducible para comparar otras arquitecturas de reward model en tareas subjetivas.
- Analisis de sensibilidad al contexto: al condicionar sobre el texto de noticias, permite medir si un chiste es divertido en relacion con un contexto concreto y no de forma aislada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento documentado es el objetivo de validacion del mejor trial (0,4681), que corresponde a la metrica interna del experimento y no es directamente comparable con benchmarks estandar como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 para el modelo base de aproximadamente 110 millones de parametros; el repo ocupa 0,9 GB en disco.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: el modelo se carga mediante el codigo de la tesis (`load_ensemble_from_hub` y `load_best_trial_from_hub`), que restaura el wrapper con la longitud maxima y el umbral de empate. Al ser un checkpoint de `transformers`, tambien puede cargarse con la libreria estandar, aunque el wrapper de recompensa debe reimplementarse.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales con alternativas de la misma categoria (reward models basados en BERT):

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `cbmusetti/reward-model-english_with_ties` | ~110 M | 256 tokens | MIT | Bradley-Terry con empates, dominio de humor |
| `google-bert/bert-base-uncased` (modelo base) | ~110 M | 512 tokens | Apache 2.0 | Encoder de proposito general, sin cabeza de recompensa |
| Reward models genericos basados en BERT | ~110 M | 512 tokens | variable | Clasificacion de preferencia sin umbral de empate |

La comparacion de rendimiento con estas alternativas no esta disponible.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente para puntuar chistes en ingles a partir de noticias; su uso fuera de ese dominio no esta validado.
- Idioma unico: solo soporta ingles, por lo que no es adecuado para evaluacion de humor en castellano.
- Longitud de contexto limitada: 256 tokens, lo que restringe la longitud de las noticias y chistes que pueden evaluarse en una sola pasada.
- Riesgo de sesgo: el modelo aprende las preferencias del dataset de anotacion, que puede reflejar sesgos culturales o demograficos sobre que se considera divertido.
- Riesgo de alucinacion: al ser un modelo de puntuacion y no generativo, no produce texto, pero sus puntuaciones pueden ser poco fiables fuera de la distribucion de entrenamiento.
- Dependencia del codigo de la tesis: la carga correcta requiere el wrapper del repositorio `carlos-musetti/tesis`; usarlo como checkpoint estandar de `transformers` sin ese wrapper no restaura el umbral de empate ni la configuracion exacta.
- Tamano de datos moderado: 3405 parejas de entrenamiento, lo que limita la generalizacion.
- Sin traccion en la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.
- Licencia MIT: permite uso comercial, pero no se documentan garantias ni soporte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbmusetti/reward-model-english_with_ties
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio de la tesis (codigo y registros de experimentos): https://github.com/carlos-musetti/tesis

# cbmusetti/reward-model-english_and_spanish_without_ties

## Resumen

`cbmusetti/reward-model-english_and_spanish_without_ties` es un modelo de recompensa (reward model) de tipo pairwise, es decir, que puntúa dos respuestas candidatas para una misma entrada y asigna mayor recompensa a la que los humanos prefirieron. Lo desarrolla el autor individual cbmusetti en el marco de una tesis sobre generación de humor con aprendizaje por refuerzo, y su tarea concreta es evaluar chistes: recibe una noticia y dos chistes candidatos, y devuelve una puntuación para cada uno.

El modelo parte de `FacebookAI/xlm-roberta-base`, un transformer encoder multilingüe de aproximadamente 278 millones de parámetros, y añade una cabeza de clasificación para ajustar preferencias con la formulación Bradley-Terry sobre pares con preferencia estricta (los empates se descartaron durante el entrenamiento). El contexto de entrada está limitado a 256 tokens y los idiomas cubiertos son inglés y español.

Su relevancia es acotada pero específica: sirve como componente de recompensa en pipelines de RLHF o de reranking para generación de humor, un dominio poco cubierto por los reward models generalistas. El repositorio ocupa 26,8 GB porque incluye tanto el modelo del mejor trial de Optuna como el ensemble final de tres semillas, y la licencia MIT permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación para preferencias pairwise (Bradley-Terry) |
| Parametros totales | Aproximadamente 278 millones (heredados de `FacebookAI/xlm-roberta-base`; no confirmado de forma explícita en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (`max_length` del mejor trial) |
| Tipos de cuantizacion | No disponible (el repo publica safetensors en precisión de entrenamiento; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) y español (`es`) |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de `transformers` para sequence classification más un wrapper de configuración propio) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional XLM-RoBERTa base con una cabeza de clasificación que produce una puntuación escalar por par (noticia, chiste). La formulación es Bradley-Terry sobre preferencias estrictas: cada ejemplo de entrenamiento es un par de chistes para una misma noticia, con la etiqueta indicando cuál prefirieron los anotadores humanos; los pares empatados se eliminaron del dataset. El wrapper del modelo restaura además parámetros como la longitud máxima y el umbral de empate tal como se entrenaron.

El ajuste se hizo mediante una búsqueda de hiperparámetros con Optuna. El mejor trial (trial 0) usó batch size 64, dropout 0,1212, learning rate del encoder de 1,996e-05, learning rate de la cabeza de 0,0006255, 2 épocas, congelación de las dos últimas capas (`freeze_strategy: last_2`), decaimiento de learning rate por capa de 0,9416, scheduler `constant_with_warmup` con warmup ratio 0,05248 y weight decay 0,03143. El objetivo de validación de ese trial fue 0,5727.

El modelo final es un ensemble de tres miembros entrenados con las semillas 42, 43 y 44, reentrenados sobre la unión de train y validación, con las recompensas promediadas entre miembros. Los datos son 4205 pares de entrenamiento, 695 de validación y 2120 de test, con semilla de partición 42. No se documenta el volumen total de tokens ni la composición detallada del corpus más allá de que son pares (noticia, chiste) en inglés y español.

## Capacidades

- Puntuación de preferencia pairwise: dado un texto de contexto (una noticia) y dos chistes candidatos, devuelve una recompensa por candidato, de modo que el preferido por humanos obtiene la puntuación mayor.
- Puntuación individual: la API `model.score(news_text, joke_text)` permite obtener la recompensa de un único par, útil para reranking de candidatos generados.
- Ensemble con promedio de recompensas sobre tres semillas, lo que reduce la varianza de la señal de recompensa.
- Soporte bilingüe inglés-español, heredado del preentrenamiento de XLM-RoBERTa.
- Uso como componente de RLHF: la señal de recompensa puede integrarse en un bucle de optimización por refuerzo para ajustar un generador de chistes.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido; es un modelo de clasificación, no un modelo generativo.
- No está diseñado para generación de texto: su salida es una puntuación escalar, no tokens.

## Casos de uso

- Reranking de chistes generados: un generador produce N candidatos para una noticia y este modelo los puntúa; se selecciona el de mayor recompensa. Es su uso más directo y el que motivó su entrenamiento.
- Señal de recompensa en RLHF para humor: integrar `model.score` en un bucle PPO o DPO para optimizar un modelo generativo de chistes, usando la preferencia humana codificada en el reward model como objetivo.
- Evaluación automática de sistemas de generación de humor: sustituir o complementar evaluaciones humanas costosas midiendo la tasa de preferencia del modelo frente a un baseline, con la precisión de test de aproximadamente 0,60 como referencia.
- Filtrado de datos en la construcción de datasets: puntuar pares de chistes existentes para descartar los de baja calidad o mal alineados con la noticia antes de incluirlos en un corpus de entrenamiento.
- Investigación en lingüística computacional del humor: analizar qué rasgos de un chiste correlacionan con la preferencia humana, aprovechando que el modelo es bilingüe y permite comparar inglés y español con el mismo backbone.
- Componente de un sistema de recomendación de contenido humorístico: ordenar un conjunto de chistes candidatos para una noticia concreta según la preferencia estimada, como paso previo a la selección final.
- Baseline para tesis y experimentos académicos: el repositorio incluye el código de carga, los hiperparámetros del mejor trial y las métricas por semilla, lo que facilita reproducir y comparar resultados.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de test del ensemble y de cada semilla, no benchmarks estándar como MMLU o HumanEval (no aplicables a un reward model).

| Modelo | `non_tied_preference_accuracy` | `eval_loss` | `mean_margin` |
|---|---|---|---|
| `RewardModelWithoutTies_seed_42` | 0,6057 | 0,9782 | 0,7398 |
| `RewardModelWithoutTies_seed_43` | 0,5962 | 0,8016 | 0,5370 |
| `RewardModelWithoutTies_seed_44` | 0,6030 | 0,9312 | 0,6793 |
| Media de semillas | 0,6016 | 0,9037 | 0,6520 |
| Desviación típica de semillas | 0,004016 | 0,07465 | 0,08502 |
| `RewardModelWithoutTies_ensemble` | 0,5975 | 0,8640 | 0,6520 |

La precisión de preferencia en test ronda el 0,60, solo diez puntos por encima del azar, lo que refleja la dificultad intrínseca de la tarea de preferencia en humor. El ensemble no mejora la precisión de la media de semillas (0,5975 frente a 0,6016) pero sí reduce la pérdida de evaluación (0,8640 frente a 0,9037).

## Requisitos de hardware

- VRAM estimada para inferencia: con 278 millones de parámetros en fp32, aproximadamente 1,1 GB de pesos; en fp16, unos 0,56 GB. Sumando activaciones y overhead, menos de 2 GB en fp16 y menos de 1 GB en int8.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB, RTX 4060, RTX 4090 o incluso una GPU integrada con suficiente memoria compartida pueden ejecutarlo. Para lotes grandes, A100 o H100 no aportan ventaja significativa por el tamaño reducido del modelo.
- Cabe holgadamente en GPU consumer; el cuello de botella no es la memoria sino el throughput de peticiones.
- Opciones de despliegue: el modelo se carga a través del código de la tesis (`load_ensemble_from_hub` / `load_best_trial_from_hub`), que restaura el wrapper. Al ser un checkpoint estándar de `transformers` para sequence classification, también puede servirse con Text Embeddings Inference, FastAPI con `transformers` o un servidor propio; no se documenta soporte para vLLM, llama.cpp u Ollama, y al no ser un modelo generativo no encaja en esos runners.
- Latencia y throughput: no disponibles en la información proporcionada. Con 256 tokens de contexto y un encoder base, se espera latencia de milisegundos por par en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cbmusetti/reward-model-english_and_spanish_without_ties` | ~278 M | 256 tokens | en, es | MIT | Hugging Face, 0 descargas |
| Reward models generalistas basados en XLM-R (p. ej. variantes de `OpenAssistant/reward-model-deberta-v3-base`) | ~184 M | 512 tokens | en (mayormente) | Apache 2.0 / MIT según variante | Hugging Face |
| Reward models basados en Llama o Mistral para RLHF | 7-8 B | 4k-32k tokens | multilingüe | licencias variables | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia. Frente a los reward models generalistas, este modelo está especializado en humor y es bilingüe inglés-español, pero su contexto de 256 tokens es más corto y su precisión de preferencia (0,60) es modesta.

## Limitaciones y advertencias

- Precisión de preferencia baja: 0,60 en test, solo ligeramente por encima del azar; no es fiable como único criterio de calidad en producción.
- Dominio muy restringido: entrenado exclusivamente con pares (noticia, chiste); su comportamiento fuera del humor no está validado y probablemente sea pobre.
- Contexto de 256 tokens: noticias o chistes más largos se truncan, lo que puede degradar la puntuación.
- Solo inglés y español; no hay cobertura de otras lenguas.
- Entrenado sin empates: si dos candidatos son igual de buenos, el modelo forzará una preferencia, lo que introduce ruido en la señal.
- Riesgo de sesgo: al aprender de preferencias humanas sobre humor, puede reproducir sesgos culturales, de género o de estilo presentes en los anotadores; la model card no documenta análisis de sesgo.
- Riesgo de sobreajuste a los anotadores y al corpus concreto de la tesis; la generalización a otros dominios de humor no está demostrada.
- Sin descargas ni likes en Hugging Face: no hay evidencia de uso en la comunidad ni de validación externa.
- La licencia MIT permite uso comercial, pero el modelo base XLM-RoBERTa también es MIT, por lo que no hay restricciones adicionales conocidas.
- Para cargarlo es necesario clonar el repositorio de la tesis y usar su código; no es un checkpoint cargable directamente con `AutoModelForSequenceClassification` sin restaurar el wrapper.
- El repositorio de 26,8 GB incluye múltiples checkpoints (mejor trial y ensemble), lo que complica el despliegue si solo se necesita uno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbmusetti/reward-model-english_and_spanish_without_ties
- Modelo base XLM-RoBERTa: https://huggingface.co/FacebookAI/xlm-roberta-base
- Repositorio de la tesis (código y logs): https://github.com/carlos-musetti/tesis
- Ruta del reward model en el repositorio: `reward-model/` dentro del repositorio de la tesis

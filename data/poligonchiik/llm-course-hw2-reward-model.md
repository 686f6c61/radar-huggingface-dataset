# poligonchiik/llm-course-hw2-reward-model

## Resumen

`poligonchiik/llm-course-hw2-reward-model` es un modelo de recompensa (reward model) de tipo sequence classification construido sobre `HuggingFaceTB/SmolLM-135M-Instruct`. Lo publica el usuario poligonchiik como trabajo de un curso de LLM (el identificador del repositorio lo indica explicitamente: `llm-course-hw2-reward-model`). Su funcion es asignar una puntuacion escalar a una respuesta generada por un LLM para poder usarla como senal de recompensa en un pipeline de RLHF con PPO.

El modelo resuelve un problema concreto: disponer de un critico automatico que puntue respuestas segun su preferencia humana, de forma que un algoritmo de optimizacion por politica (PPO) pueda entrenar a un modelo generador sin necesidad de anotacion humana en cada iteracion. Se entrena sobre el dataset `HumanLLMs/Human-Like-DPO-Dataset`, con una particion 90/10 entre entrenamiento y validacion.

Tecnicamente es un transformer decoder de 134,5 millones de parametros totales (arquitectura Llama, segun los tags del repositorio), con una cabeza lineal de clasificacion de una sola salida que produce el score. Solo se entrena ese cabezal lineal de puntuacion; el resto de los pesos del modelo base permanecen congelados. El contexto maximo usado en entrenamiento es de 1024 tokens. Es un artefacto de caracter educativo, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama) con cabeza de clasificacion lineal de una salida (`AutoModelForSequenceClassification`) |
| Parametros totales | 134.515.584 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | HuggingFaceTB/SmolLM-135M-Instruct |
| Dataset de entrenamiento | HumanLLMs/Human-Like-DPO-Dataset (split 90/10) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo parte de SmolLM-135M-Instruct, un transformer decoder de tipo Llama de 135 millones de parametros, y le anade una cabeza de clasificacion con una unica salida escalar mediante `AutoModelForSequenceClassification`. El entrenamiento se realiza con `RewardTrainer` de la libreria TRL, que consume pares (chosen, rejected) y optimiza la diferencia de scores entre la respuesta preferida y la rechazada con la perdida de ranking habitual de los reward models.

Los hiperparametros documentados son: 1 epoca, batch size de 16, learning rate de 3e-4, longitud maxima de 1024 tokens y semilla 42. El detalle mas relevante es que solo se entrena el cabezal lineal `score`; el backbone del modelo base queda congelado. Esto reduce drasticamente el coste de entrenamiento, pero limita la capacidad de adaptacion del modelo a la distribucion de preferencias del dataset. No se documenta el numero total de tokens vistos ni si hubo etapas adicionales de calibracion.

No se menciona ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, mezcla de expertos ni tecnicas de RL durante el entrenamiento del propio reward model).

## Capacidades

- Puntuacion de respuestas: dado un par prompt-respuesta, devuelve un score escalar que refleja la preferencia aprendida del dataset.
- Ranking de pares: permite comparar dos respuestas al mismo prompt y determinar cual recibe mayor puntuacion.
- Senal de recompensa para RLHF: disenado explicitamente para integrarse en un bucle PPO como funcion de recompensa.
- Clasificacion de secuencias: usa la interfaz estandar de `AutoModelForSequenceClassification`, por lo que se integra con el ecosistema Transformers y TRL.
- Generacion de texto: no disponible como capacidad principal; el modelo esta configurado para clasificacion, no para generacion.
- Tool calling / function calling: no soportado.
- Capacidades de agente o razonamiento multi-paso: no soportadas.
- Multilingue: no documentado.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Entrenamiento RLHF con PPO: el escenario disenado. Se usa como funcion de recompensa en un bucle PPO para ajustar un LLM generador, puntuando cada respuesta candidata y guiando la actualizacion de politica. Es adecuado por su interfaz directa con `RewardTrainer` y su bajo coste de inferencia.
- Filtrado de datos sinteticos: puntuar respuestas generadas por un LLM grande y descartar las que reciben scores bajos antes de incorporarlas a un dataset de instrucciones. El modelo es lo bastante pequeno (0,3 GB) para ejecutarse en CPU o GPU consumer durante el filtrado por lotes.
- Evaluacion automatica de calidad en experimentos academicos: comparar variantes de un mismo modelo generador usando el score medio como metrica de preferencia, sin coste de anotacion humana.
- Practicas docentes de RLHF: reproducir un pipeline completo de reward modeling y PPO en un entorno con recursos limitados, dado el tamano reducido del modelo base.
- Seleccion de mejores respuestas (best-of-N): generar N respuestas por prompt y quedarse con la de mayor score, usando el reward model como reranker barato.
- Deteccion de respuestas de baja calidad en un pipeline interno: umbralizar el score para marcar respuestas que deben revisarse o regenerarse antes de servirse al usuario.
- Investigacion sobre sesgos en reward models: analizar como un modelo entrenado solo sobre el cabezal de puntuacion reproduce las preferencias del dataset `Human-Like-DPO-Dataset`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento documentados son los del entrenamiento y una evaluacion cualitativa sobre un unico ejemplo de validacion:

| Metrica | Valor |
|---|---|
| Training loss medio | 0,12527 |
| Epocas | 1 |
| Batch size | 16 |
| Learning rate | 3e-4 |
| Longitud maxima | 1024 tokens |
| Score en ejemplo de validacion (chosen) | 2,5156 |
| Score en ejemplo de validacion (rejected) | -1,9531 |

El modelo ordena correctamente el par chosen/rejected en ese unico ejemplo, pero no se reporta precision de ranking sobre el conjunto de validacion completo, ni correlacion con preferencias humanas, ni comparacion con otros reward models.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en precision nativa (fp32/bf16), ya que el repositorio ocupa 0,3 GB; en cuantizacion de 8 bits cabria por debajo de 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre. Una RTX 3060, RTX 4060 o superior es mas que suficiente; tambien funciona en GPUs de portatil y en T4.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: Transformers con `AutoModelForSequenceClassification`; integracion con TRL (`RewardTrainer`) para entrenamiento; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y al ser un modelo de clasificacion no encaja en los servidores de generacion habituales.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo se espera un throughput alto en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| poligonchiik/llm-course-hw2-reward-model | 134,5 M | 1024 tokens (entrenamiento) | Reward model (sequence classification) | no disponible | HuggingFace |
| HuggingFaceTB/SmolLM-135M-Instruct | 135 M | no disponible en esta ficha | LLM instruct (generativo) | no disponible en esta ficha | HuggingFace |
| Reward models de referencia (p. ej. familias tipo ArmoRM, Starling-RM) | no disponible | no disponible | Reward model | no disponible | no disponible |

La comparativa con reward models de referencia no esta disponible en la informacion proporcionada. Frente al modelo base SmolLM-135M-Instruct, la diferencia clave es la cabeza de clasificacion y el entrenamiento con pares de preferencia; el backbone es el mismo.

## Limitaciones y advertencias

- Entrenamiento minimo: una sola epoca y solo el cabezal lineal, lo que limita la capacidad del modelo para adaptarse a preferencias que no esten ya representadas en el backbone congelado.
- Evaluacion insuficiente: el unico resultado reportado es un ejemplo de validacion; no hay metricas agregadas de precision de ranking ni calibracion de scores.
- Riesgo de sobreajuste al dataset: `Human-Like-DPO-Dataset` impone una nocion concreta de "respuesta humana preferible"; el modelo heredara sus sesgos y no generaliza necesariamente a otros dominios.
- Sesgos conocidos: no documentados, pero al derivar de SmolLM-135M-Instruct y de un dataset de preferencias, es probable que reproduzca sesgos de estilo, longitud y formato (por ejemplo, preferencia por respuestas mas largas).
- Riesgo de alucinacion del score: al ser un modelo pequeno, puede asignar puntuaciones poco fiables fuera de la distribucion de entrenamiento.
- Limitacion de contexto: 1024 tokens; respuestas o prompts mas largos se truncan, lo que puede distorsionar la puntuacion.
- Idioma: no documentado; el modelo base SmolLM esta orientado principalmente al ingles, por lo que el rendimiento en castellano es incierto.
- Licencia no disponible: no se puede confirmar el uso comercial; debe consultarse con el autor antes de cualquier despliegue en produccion.
- Caracter educativo: el identificador del repositorio sugiere un trabajo de curso; no hay garantias de mantenimiento ni soporte.
- No apto como generador: esta configurado para clasificacion, no para producir texto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/poligonchiik/llm-course-hw2-reward-model
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- Libreria TRL (`RewardTrainer`): https://github.com/huggingface/trl
- Documentacion de Transformers (`AutoModelForSequenceClassification`): https://huggingface.co/docs/transformers/model_doc/auto

# amrvlv/llm-course-hw2-reward-model

## Resumen

`amrvlv/llm-course-hw2-reward-model` es un modelo de recompensa (reward model) de tipo `AutoModelForSequenceClassification` con una sola etiqueta de salida, construido sobre el modelo base `HuggingFaceTB/SmolLM-135M-Instruct`. Lo desarrolla el usuario de Hugging Face `amrvlv` en el contexto de un curso sobre LLMs (segun la model card, "ДЗ 2 по курсу LLM", es decir, la segunda tarea del curso). Su funcion es asignar una puntuacion escalar a una respuesta dada una instruccion, lo que permite ordenar pares de respuestas y servir como componente de recompensa en pipelines de RLHF o DPO.

Se trata de un modelo experimental de muy pequeno tamano: 134.515.584 parametros (unos 134,5 M) y un repositorio de 0,5 GB en formato safetensors. No es un modelo generativo de proposito general, sino un clasificador de texto que devuelve un unico valor numerico por entrada. Esta pensado para fines didacticos y de investigacion, no para produccion.

Su relevancia es limitada pero ilustrativa: demuestra el flujo completo de entrenamiento de un reward model con `RewardTrainer` de la libreria Transformers, partiendo de un modelo instruct pequeno y de un dataset de preferencias humano (HumanLLMs/Human-Like-DPO-Dataset). No se ha publicado informacion sobre licencia, benchmarks ni metricas finales, y el modelo no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM-135M-Instruct) con cabeza de clasificacion lineal (`num_labels=1`) |
| Parametros totales | 134.515.584 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | HuggingFaceTB/SmolLM-135M-Instruct |
| Dataset de entrenamiento | HumanLLMs/Human-Like-DPO-Dataset |
| Libreria | transformers |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura del transformer decoder-only de SmolLM-135M-Instruct y sustituye la cabeza de lenguaje por una capa lineal de salida con una unica unidad (`AutoModelForSequenceClassification`, `num_labels=1`). Segun la model card, durante el entrenamiento solo se actualiza ese estrato lineal; el resto de los pesos permanece congelado. El entrenamiento se realiza con `RewardTrainer` durante 1 epoca con una tasa de aprendizaje de 3e-4.

El dataset empleado es `HumanLLMs/Human-Like-DPO-Dataset`, un conjunto de pares de respuestas con preferencias humanas. La model card menciona una evaluacion sobre el 10 % del dataset como conjunto de test, pero la tabla de metricas aparece vacia en la informacion disponible, por lo que no se pueden reportar valores numericos. No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas adicionales de RLHF o DPO mas alla del ajuste del reward model.

## Capacidades

- Puntuacion de respuestas: dado un par instruccion-respuesta, devuelve un escalar que refleja la preferencia aprendida del dataset.
- Clasificacion de texto con una unica etiqueta continua (regresion de recompensa).
- Ordenacion de pares de respuestas para construir preferencias (util en pipelines de DPO o RLHF).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Generacion de texto: no, es un modelo discriminativo, no generativo.

## Casos de uso

- Filtrado de respuestas en un pipeline de RLHF: el modelo puntua cada respuesta candidata generada por un LLM y se selecciona la de mayor recompensa antes de un ajuste posterior con DPO.
- Evaluacion automatica de calidad en experimentos academicos: sirve como metrica proxy de preferencia humana en tareas de investigacion con presupuesto computacional minimo (0,5 GB de pesos).
- Construccion de datasets de preferencias sinteticas: a partir de pares de respuestas generadas, el reward model etiqueta cual es preferible, reduciendo el coste de anotacion humana.
- Docencia y aprendizaje: caso de referencia para practicar el flujo `RewardTrainer` con un modelo base pequeno y un dataset publico de preferencias.
- Ranking de respuestas en sistemas de retrieval-augmented generation: ordenar varias respuestas candidatas de un RAG antes de mostrarlas al usuario final.
- Baseline en investigacion sobre alineamiento: punto de partida ligero para comparar tecnicas de entrenamiento de reward models sin necesidad de GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de metricas sobre el 10 % del dataset de test, pero los valores no estan presentes en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,54 GB solo para pesos (134,5 M x 4 bytes), mas activaciones y overhead del runtime.
- VRAM estimada en FP16/BF16: aproximadamente 0,27 GB para pesos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,13 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; cabe en RTX 3060, RTX 4060, RTX 4090 e incluso en GPUs de gama baja con 4 GB o menos.
- CPU: la inferencia en CPU es viable dado el tamano reducido del modelo.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, `text-embeddings-inference` (el tag del repositorio lo indica como compatible), y potencialmente `vLLM` o `TGI` si se adapta la cabeza de clasificacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amrvlv/llm-course-hw2-reward-model | 134,5 M | no disponible | Reward model (clasificacion) | no disponible | Hugging Face |
| HuggingFaceTB/SmolLM-135M-Instruct | 135 M | no disponible | LLM instruct generativo | Apache 2.0 (segun el modelo base original) | Hugging Face |
| amrvlv/llm-course-hw2-dpo | no disponible | no disponible | LLM ajustado con DPO | no disponible | Hugging Face |
| Reward models de referencia (p. ej. OpenAssistant/reward-model-deberta-v3-large-v2) | no disponible en esta ficha | no disponible | Reward model | no disponible | Hugging Face |

La comparativa se limita a los modelos mencionados en la informacion disponible; no se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Modelo experimental de curso: no ha sido validado para uso en produccion ni para decisiones automatizadas con impacto real.
- Solo ingles declarado; el rendimiento en otros idiomas no esta documentado.
- Entrenado unicamente sobre un dataset de preferencias (HumanLLMs/Human-Like-DPO-Dataset), por lo que puede heredar sesgos de ese corpus.
- Riesgo de alucinacion no aplica en sentido generativo, pero la puntuacion de recompensa puede ser poco fiable fuera de la distribucion del dataset de entrenamiento.
- Licencia no disponible: no se puede confirmar si permite uso comercial; se debe contactar con el autor antes de cualquier uso productivo.
- Entrenamiento de solo 1 epoca y ajuste exclusivo de la capa lineal: capacidad limitada para capturar preferencias complejas.
- Sin descargas ni validacion de la comunidad en el momento de la consulta.
- Longitud de contexto no documentada: puede truncar entradas largas sin aviso explicito.
- No dispone de benchmarks publicados que permitan comparar su calidad frente a reward models establecidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amrvlv/llm-course-hw2-reward-model
- Modelo DPO del mismo autor: https://huggingface.co/amrvlv/llm-course-hw2-dpo
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- Documentacion de `RewardTrainer`: https://huggingface.co/docs/transformers/main_classes/reward_trainer

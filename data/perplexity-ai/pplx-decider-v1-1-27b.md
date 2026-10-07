# perplexity-ai/pplx-decider-v1.1-27b

## Resumen

pplx-decider-v1.1-27b es un modelo de decisión (clasificación de opciones) desarrollado por perplexity-ai como actualización de pplx-decider-v1-27b. No es un modelo generativo de propósito general, sino un clasificador especializado: recibe un estado (`state`) y una pregunta con un conjunto de criterios candidatos, y devuelve una distribución de probabilidad sobre las opciones válidas, de ahí que su pipeline declarado sea `text-classification`. Se construye mediante fine-tuning sobre el backbone Qwen3.8-27B (identificador de clase `Qwen3_5Model`), con 26.085.330.160 parámetros reales (~26,1 B) y un repositorio de 52,2 GB.

La relevancia del modelo está en su rendimiento medido con el Decision Index del espacio `multimodalart/jev-decision-index`: pasa de 56,4 en la versión 1.0 a 61,56 en la 1.1 con el mismo backbone, superando a Jev por más de 3,5 puntos. Según el autor, la mayor parte de la mejora proviene de eliminar la máscara causal en las capas de atención completa y de entrenar con más datos, incluidos datos de tasksource. Es, por tanto, un artefacto de enrutado y toma de decisiones pensado para integrarse como componente de sistemas mayores (agentes, pipelines de atención al cliente, RAG), no para conversar con el usuario final.

El checkpoint se distribuye en un formato no estándar: un backbone `Qwen3_5Model` más un fichero `readout.safetensors` con una cabecera de decisión BF16 de dimensiones [255, 5120]. Esto implica que no funciona con un `lm_head` de vocabulario completo y que requiere la implementación de inferencia incluida en el repositorio para reproducir el comportamiento evaluado. La licencia es Apache 2.0, aunque el autor indica que el repositorio es privado y requiere autenticación en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (clase `Qwen3_5Model`): capas de atención completa más capas de atención lineal, con cabecera de decisión `readout` de [255, 5120] |
| Parametros totales | 26.085.330.160 (~26,1 B) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El readout se distribuye en BF16; el autor indica que se necesitan unos 49 GiB para los pesos y memoria de trabajo |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`readout.safetensors`) más backbone PyTorch; requiere `custom-code` (implementación propia en `source/src/autojev/model.py`) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.8-27B y conserva su estructura de atención híbrida: capas de atención completa y capas de atención lineal que mantienen su comportamiento nativo. La innovación clave de esta versión es que las capas de atención completa usan el modo de atención **no causal** guardado en el checkpoint. El autor advierte explícitamente que la inferencia causal por defecto no reproduce la configuración evaluada, de modo que usar el modelo con un runtime convencional altera los resultados. Sobre el backbone se monta una cabecera de decisión separada (`readout.safetensors`, BF16, [255, 5120]), que proyecta sobre un máximo de 255 candidatos de decisión; no existe un `lm_head` de vocabulario completo.

En cuanto al entrenamiento, la model card indica que la mejora respecto a la versión 1.0 se debe a dos factores: la eliminación de la máscara causal y el uso de más datos, incluyendo datos de tasksource (una colección estructurada de tareas NLP de Sileo, 2024). No se especifican el número total de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO; tampoco se detalla el proceso de calibración más allá de que la implementación incluida aplica una temperatura de calibración guardada en el checkpoint. El fichero `source/src/autojev/model.py` se copia literalmente de la ejecución de entrenamiento evaluada, y `release-manifest.json` registra los checksums y la procedencia del checkpoint.

## Capacidades

- Clasificación de decisiones sobre un conjunto cerrado de candidatos: dado un estado y una pregunta con criterios, devuelve probabilidades normalizadas sobre las opciones válidas (hasta 255 candidatos según la forma del readout).
- Etiquetado de tareas y categorización: el entrenamiento con datos de tasksource apunta a clasificación de tareas NLP de forma genérica.
- Enrutado y selección: la categoría "Tools" del Decision Index sugiere capacidad para decidir entre herramientas o acciones disponibles.
- Recuperación: la categoría "Retrieval" mide la selección de fuentes o pasajes relevantes.
- Soporte de tool calling / function calling: no documentado como tal; la decisión sobre herramientas se expresa como clasificación sobre candidatos, no como llamada a funciones.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma explícita; el modelo es un componente de decisión de un solo paso, no un planificador autónomo.
- Capacidades multilingües: no disponibles; el modelo declara la etiqueta `multimodal` pero no hay idiomas declarados ni evaluación por idioma.
- Capacidad especial: modo de decisión con atención no causal y temperatura de calibración propia, integrada en `DecisionModel.predict`.

## Casos de uso

- Enrutado de tickets de soporte: el propio ejemplo de la model card plantea decidir si una consulta va a `billing`, `support` o `sales` a partir del texto del usuario. Es adecuado porque devuelve probabilidades calibradas sobre criterios definidos por el desarrollador, no texto libre.
- Enrutado de herramientas en agentes: dado el estado de la conversación y un catálogo de herramientas disponibles, el modelo puede seleccionar la más probable. La puntuación de 78,88 en la categoría "Tools" del Decision Index respalda este uso.
- Selección de contexto en pipelines RAG: decidir qué pasaje o qué fuente recuperar antes de generar una respuesta, apoyándose en la puntuación de 61,26 en "Retrieval".
- Triaje y clasificación de contenido: asignar categorías a gran volumen de texto (moderación, etiquetado, priorización) usando una cabecera de decisión de hasta 255 clases.
- Enrutado entre modelos (LLM router): seleccionar qué modelo o qué cadena de generación atenderá una petición en función de su tipo, con criterios configurables en la propia pregunta.
- Clasificación de intenciones en asistentes: determinar la intención del usuario dentro de un conjunto cerrado antes de invocar el flujo correspondiente.
- Etiquetado de datasets: generar etiquetas automáticas sobre tareas NLP aprovechando el entrenamiento con tasksource, para preanotar corpus y reducir trabajo manual.
- Categorización de catálogo en comercio electrónico: asignar productos o consultas a categorías predefinidas cuando el número de clases es alto y estable.

## Benchmarks y rendimiento

Resultados publicados por el autor con el Decision Index (espacio `multimodalart/jev-decision-index`). La puntuación global usa la ponderación de la suite, no la media simple de categorías.

| Categoria del Decision Index | Jev | pplx-decider-v1-27b | pplx-decider-v1.1-27b |
|---|---:|---:|---:|
| Knowledge | 51,4 | 40,9 | 48,18 |
| Language | 62,0 | 63,5 | 69,45 |
| Retrieval | 55,4 | 54,9 | 61,26 |
| Tools | 75,1 | 79,3 | 78,88 |
| Arts | 37,7 | 39,4 | 44,66 |
| Overall Decision Index | 57,9 | 56,4 | 61,56 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor indica que se necesitan aproximadamente 49 GiB solo para los pesos, más memoria de trabajo. En la práctica exige GPUs de 80 GB en BF16.
- GPUs recomendadas: A100 80 GB, H100 80 GB, H200. No se documenta soporte de paralelismo tensorial en la implementación incluida.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB quedan muy por debajo de los 49 GiB de pesos). No se publican recetas de cuantizacion que reduzcan el requisito.
- Opciones de despliegue: únicamente la implementación propia incluida (`source/src/autojev/model.py`), con Python 3.12+ y CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. Para usar un servidor que requiera `Qwen3_5ForConditionalGeneration` hace falta una exportación aparte que mapee la fila `i` del readout a la fila de vocabulario `decision_config.json["token_ids"][i]`, preservando además el comportamiento de atención no causal.
- Latencia y throughput: no disponibles.
- Requisitos adicionales: acceso autenticado al repositorio de Hugging Face (el autor lo describe como privado) y las dependencias fijadas en `requirements.txt`.
- Nota operativa: si el frontend aplica temperatura, debe usar el valor de calibración guardado; al consumir logits directamente hay que aplicarlo exactamente una vez y normalizar sobre los candidatos válidos de la decisión actual.

## Comparativa con modelos similares

| Modelo | Parametros | Decision Index | Licencia | Disponibilidad |
|---|---|---|---|---|
| pplx-decider-v1.1-27b | ~26,1 B | 61,56 | Apache 2.0 | Hugging Face, requiere autenticación |
| pplx-decider-v1-27b | ~26,1 B (mismo backbone) | 56,4 | No disponible en la informacion proporcionada | Hugging Face |
| Jev | No disponible | 57,9 | No disponible en la informacion proporcionada | Espacio de evaluacion `multimodalart/jev-decision-index` |
| Qwen3.8-27B (modelo base) | ~27 B (nominal) | No evaluado en el Decision Index | No disponible en la informacion proporcionada | Hugging Face |

La comparacion directa mas fiable es contra pplx-decider-v1-27b, que comparte backbone y solo se diferencia en el enmascaramiento de atencion y los datos de entrenamiento. Frente a Jev, la version 1.1 mejora en Knowledge (48,18 frente a 51,4, sigue por debajo), Language, Retrieval y Arts, pero pierde ligeramente en Tools (78,88 frente a 75,1 a favor del modelo). Para el resto de alternativas no hay datos de parametros, contexto ni rendimiento en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no dispone de `lm_head` de vocabulario completo y no puede producir texto libre. Cualquier uso conversacional requiere un modelo adicional.
- La atencion no causal es obligatoria: usar inferencia causal por defecto no reproduce el comportamiento evaluado y degrada los resultados sin aviso.
- La temperatura de calibracion debe aplicarse exactamente una vez y normalizar sobre los candidatos validos de la decision actual; aplicarla dos veces o sobre candidatos no validos invalida las probabilidades.
- Repositorio de acceso autenticado: el autor indica que se necesita acceso autenticado a un repositorio privado, lo que condiciona la reproducibilidad y el despliegue en produccion.
- Rendimiento bajo en "Knowledge" y "Arts": 48,18 y 44,66 respectivamente, por debajo de Jev en Knowledge. No es adecuado para decisiones que dependan de conocimiento factual especializado.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue ni evaluacion por idioma; asumir comportamiento uniforme en castellano seria una extrapolacion.
- Etiqueta `multimodal` sin respaldo documental: el modelo declara la etiqueta, pero la model card no describe entrada de imagen, audio ni ninguna otra modalidad, y el pipeline declarado es `text-classification`.
- Riesgo de deriva en los criterios: el modelo devuelve una distribucion sobre las opciones que el desarrollador define en `question.criteria`; si el conjunto de candidatos cambia respecto al entrenamiento, la calibracion deja de ser valida.
- Sin datos de sesgo, alucinacion ni evaluaciones de seguridad publicadas.
- Licencia Apache 2.0, que permite uso comercial, pero el acceso restringido al repositorio y la dependencia de codigo propio (`custom-code`) pueden limitar la redistribucion practica.
- Requisito de hardware muy alto (unos 49 GiB de pesos) sin recetas de cuantizacion publicadas, lo que complica el despliegue en infraestructura propia modesta.

## Enlaces

- [Modelo en Hugging Face: perplexity-ai/pplx-decider-v1.1-27b](https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b)
- [Version anterior: perplexity-ai/pplx-decider-v1-27b](https://huggingface.co/perplexity-ai/pplx-decider-v1-27b)
- [Espacio de evaluacion Decision Index](https://huggingface.co/spaces/multimodalart/jev-decision-index)
- [Repositorio tasksource](https://github.com/sileod/tasksource)
- [Articulo de tasksource (LREC-COLING 2024)](https://aclanthology.org/2024.lrec-main.1361)
- [Sitio de Perplexity](https://www.perplexity.ai/)

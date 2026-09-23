# jbrashear/jebadiah-9b-v1

## Resumen

Jebadiah 9B v1 (Jeb) es un adaptador LoRA de tipo "System One" orientado a la toma de decisiones tipada, no a la generación de texto. Desarrollado por el usuario jbrashear, responde preguntas de tres tipos —choice (elegir una entre N opciones), noul (afirmación de sí/no devuelta como P(yes)) y score (situar un estado en una rúbrica ordenada)— emitiendo una distribución de probabilidad calibrada sobre las etiquetas en lugar de texto libre. Está construido sobre Qwen/Qwen3.5-9B-Base (revisión fijada 68c46c4b), con licencia apache-2.0 y entrenamiento exclusivamente sobre datos públicos.

El modelo se entrenó con el entrenador de AINode durante una época sobre 14.900 preguntas públicas, en una única H100 PCIe y en 116 minutos. El repositorio contiene solo el adaptador (0,2 GB, formato safetensors, librería PEFT); los pesos completos del modelo base no se distribuyen aquí. Se sirve mediante las rutas /v1/decide y /v1/systemone de AINode sobre cualquier GPU NVIDIA, con un esquema de petición propio de AINode y no el formato exacto de Jev.

Su relevancia actual es la de un componente especializado y barato de ejecutar para enrutado, clasificación y calibración dentro de pipelines de agentes: una sola lectura de logits por pregunta, sin decodificación autorregresiva. La v1 corrige dos aspectos respecto a la v0: las preguntas de tipo score se entrenan hacia un objetivo ordinal alrededor de la etiqueta humana (con temperatura ajustada a ese objetivo) y el conjunto de entrenamiento incorpora dos fuentes con rúbrica humana licenciada (HelpSteer2 train y SummEval). Es una versión fija: las versiones nuevas se publican como repositorios nuevos y no sustituyen a esta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-9B-Base) con adaptador LoRA (PEFT) |
| Parámetros totales | 9B en el modelo base; número de parámetros entrenables del adaptador: no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (adaptador distribuido en safetensors; no se documentan cuantizaciones del conjunto base+adaptador) |
| Idiomas soportados | Inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |
| Modelo base | Qwen/Qwen3.5-9B-Base, revisión fijada 68c46c4b |
| Tipo de modelo | Modelo de decisión (clasificación con probabilidades calibradas) |
| Tamaño del repositorio | 0,2 GB |
| Autor | jbrashear |
| Fecha de creación | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA acoplado a un transformer decoder-only de 9B parámetros. La innovación no está en el backbone sino en la cabeza de decisión: en lugar de generar tokens, el sistema realiza una única lectura de logits por pregunta y normaliza las probabilidades sobre las etiquetas candidatas de cada tipo de pregunta. Los tres tipos soportados son choice (una entre N), noul (P(yes) para una afirmación) y score (posición en una rúbrica ordinal). El prompt renderizado es idéntico para todos los modelos evaluados, lo que permite comparaciones limpias entre versiones.

El entrenamiento consistió en una época sobre 14.900 preguntas públicas, ejecutada en una H100 PCIe en 116 minutos. Los conjuntos declarados son LocalLLaMA/typed-decisions, nvidia/HelpSteer2 y mteb/summeval, y la model card indica que el pool de v1 incorpora dos fuentes con rúbrica humana licenciada (el split de entrenamiento de HelpSteer2 y artículos de SummEval que Nimble no puntúa). Respecto a la v0, la v1 introduce un objetivo ordinal alrededor de la etiqueta humana para las preguntas de tipo score, con la temperatura ajustada sobre ese objetivo, lo que mejora la calibración a costa de unos pocos puntos de Decision Score en el conjunto score in-distribution. No se documentan en la información disponible detalles sobre RLHF, DPO ni sobre la composición exacta del dataset.

## Capacidades

- Decisión tipada con probabilidades calibradas: devuelve una distribución sobre etiquetas, no texto generado. Esto permite umbrales de confianza y abstención.
- Preguntas choice de hasta 77 opciones (evaluado en Banking77 con 70,0 de accuracy y suelo de 1,3).
- Preguntas noul (sí/no) con P(yes) como salida (PubMedQA con 89,7 de accuracy sobre un suelo de 62,0).
- Preguntas score sobre rúbricas ordinales de 5 niveles (HelpSteer2 helpfulness), con rendimiento ajustado al suelo en esa tarea.
- Calibración explícita: ECE de 0,023 a 0,072 en los conjuntos de choice y noul, y 0,165 en el conjunto score in-distribution.
- Estabilidad ante contenido irrelevante: con un UUID insertado en el estado o en las instrucciones, la concordancia de elección se mantiene entre el 91,8 % y el 99,2 % según conjunto.
- Reproducibilidad: la tasa de cambios de etiqueta sobre repeticiones idénticas va del 0,0 % al 0,7 % en los conjuntos evaluados.
- Capacidad multilingüe: no entrenado explícitamente en otros idiomas, pero obtiene 84,9 de accuracy en el subconjunto massive-de-DE (alemán) del benchmark Nimble.
- Clasificación y verificación de pares: NLI (multinli 87,6), paráfrasis (paws 85,6) y detección de respuesta no respondible (squad2 80,3).
- Servicio mediante API: rutas /v1/decide y /v1/systemone en GPU NVIDIA, con esquema de petición propio de AINode.
- No soporta tool calling, function calling, agentes multi-paso ni modos de pensamiento, visión o audio según la información disponible.

## Casos de uso

- Enrutado de tickets y consultas bancarias: con 77 categorías soportadas y 70,0 de accuracy sobre un suelo de 1,3 en Banking77, puede clasificar la intención de un mensaje entrante y dirigirlo al equipo o flujo correspondiente. La salida probabilística permite derivar a revisión humana cuando p_max cae por debajo de un umbral.
- Cribado de literatura biomédica: en preguntas de sí/no sobre abstracts (PubMedQA, 89,7 de accuracy frente a un suelo de 62,0) puede usarse como primer filtro para decidir si un artículo respalda o no una hipótesis antes de pasar a un LLM generativo.
- Verificación de respuestas en un pipeline RAG: los subconjuntos de NLI y paráfrasis (87,6 y 85,6) permiten comprobar si la respuesta generada está implicada por el contexto recuperado, actuando como guardarraíl barato (una sola lectura de logits).
- Detección de preguntas sin respuesta: con 80,3 en squad2, sirve para marcar consultas fuera del alcance de la base de conocimiento y evitar respuestas inventadas por el generador.
- Moderación y triaje de contenido: los subconjuntos aegis2 (79,2) y civil_comments (86,7) permiten clasificar comentarios en categorías de riesgo antes de aplicar políticas o revisiones.
- Control de calidad de resúmenes: los subconjuntos summeval-consistency (87,5) y summeval-relevance (51,7) permiten puntuar consistencia factual y relevancia de resúmenes generados; la baja puntuación en relevancia aconseja reservar ese criterio a revisión humana.
- Puerta de abstención en agentes: al exponer probabilidades calibradas y ser prácticamente inmune a contenido irrelevante (concordancia del 96,6 % al 99,2 % en choice y noul), puede decidir cuándo un agente debe continuar de forma autónoma y cuándo escalar.
- Evaluación de helpfulness con rúbrica: las preguntas de tipo score permiten puntuar respuestas de otros modelos sobre una rúbrica de 5 niveles, aunque el rendimiento reportado en HelpSteer2 (40,3 de accuracy frente a un suelo de 41,7) limita su uso a señal auxiliar.

## Benchmarks y rendimiento

Resultados declarados por el autor (métricas no verificadas de forma independiente, "verified": false). Accuracy es la proporción de preguntas cuya etiqueta principal coincide con la humana. Decision Score es la métrica de Jevals: 100 = perfecto, 0 = igual que adivinar las tasas base de las etiquetas, por debajo de 0 = peor que eso.

| Conjunto (preguntas) | Tipo | Accuracy | Suelo (etiqueta mayoritaria) | Decision Score (Jevals) | ECE con temperaturas aplicadas | Cambios sobre repeticiones idénticas |
|---|---|---:|---:|---:|---:|---:|
| Jevals PubMedQA (300) | noul | 89,7 | 62,0 | 66,8 | 0,032 | 0,0 % |
| Jevals Banking77 (300, 77 opciones) | choice | 70,0 | 1,3 | 56,9 | 0,072 | 0,7 % |
| Jevals HelpSteer2 helpfulness (300, 5 niveles) | score | 40,3 | 41,7 | 11,9 | 0,045 (bruto 0,030) | 0,3 % |
| Nimble held-out eval (324) | mixto | 78,7 | 17,6 | 65,0 | 0,063 | 0,3 % |
| Kev transfer-v4 test (764) | mixto | 84,0 | 21,5 | 67,0 | 0,023 | 0,0 % |
| Kev decision-v7 test (1.440) | mixto | 80,8 | 20,3 | 70,6 | 0,048 | n/a |
| typed-decisions test (2.000) | mixto | 78,9 | 15,3 | 56,4 | 0,165 | 0,1 % |

Titular declarado (macro sobre los conjuntos públicos zero-shot): 73,3 (v0: 72,5).

Subconjuntos públicos de Nimble (13 subconjuntos, 3.880 preguntas), macro accuracy 77,0: aegis2 79,2; boolq 85,7; civil_comments 86,7; helpsteer2 41,0; massive-de-DE 84,9; massive-en-US 85,7; multinli 87,6; paws 85,6; pubmedqa 68,8; squad2 80,3; summeval-consistency 87,5; summeval-relevance 51,7; vitaminc-dev 76,3.

Prueba de robustez a contenido irrelevante (UUID insertado en el estado o en las instrucciones):

| Conjunto | Concordancia de elección (estado / instrucciones) | Preguntas con algún cambio (estado / instrucciones) | Cambio medio de p_max, puntos (estado / instrucciones) |
|---|---|---|---|
| Jevals PubMedQA | 97,8 % / 99,2 % | 3,0 % / 1,7 % | 1,1 / 0,7 |
| Jevals Banking77 | 96,6 % / 98,8 % | 4,3 % / 2,3 % | 2,2 / 1,6 |
| Jevals HelpSteer2 | 91,8 % / 95,9 % | 10,0 % / 8,0 % | 0,9 / 0,6 |
| Nimble 324 | 98,4 % / 99,0 % | 2,8 % / 2,2 % | 0,8 / 0,9 |

## Requisitos de hardware

- Adaptador LoRA: 0,2 GB en disco, sin requisitos propios relevantes.
- Modelo base de 9B en bf16: aproximadamente 18 GB solo en pesos; con caché KV y overhead de runtime, del orden de 20-24 GB de VRAM (estimación, no publicada en la ficha).
- Cuantizado en 8 bits: del orden de 10-12 GB; en 4 bits: del orden de 6-8 GB (estimaciones).
- Entrenamiento declarado: una H100 PCIe, una época, 116 minutos.
- Cabe en GPU de consumo: sí, en RTX 4090 o RTX 3090 (24 GB) en bf16 con margen ajustado, y con holgura en 8 o 4 bits; en GPUs de 16 GB es recomendable cuantizar.
- Despliegue: el autor indica servicio mediante las rutas /v1/decide y /v1/systemone de AINode sobre GPU NVIDIA. El adaptador es compatible con PEFT, por lo que puede cargarse sobre el modelo base en stacks habituales (vLLM, TGI, llama.cpp, Ollama) siempre que el soporte de adaptadores LoRA esté disponible; no se documenta compatibilidad explícita con cada uno de ellos.
- Latencia y throughput: no disponible. Cualitativamente, el coste por consulta es el de un prefill más una única lectura de logits, sin decodificación autorregresiva, lo que lo sitúa muy por debajo del coste de generar texto con un modelo de 9B.
- Almacenamiento: el repositorio ocupa 0,2 GB; hay que sumar los pesos del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jebadiah-9b-v1 | 9B (base) + adaptador LoRA | no disponible | Macro 73,3 en conjuntos públicos zero-shot; Nimble macro 77,0 | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| jebadiah-9b-v0 | 9B (base) + adaptador LoRA | no disponible | Macro 72,5; Decision Score algo mejor en el conjunto score in-distribution | apache-2.0 | HuggingFace |
| Nimble-9B | no disponible | no disponible | 74,8 de macro accuracy en los 13 subconjuntos públicos de Nimble (tabla publicada por Bespoke) | no disponible | no disponible en la información |
| Jev | no disponible | no disponible | 76,0 de macro accuracy en los mismos subconjuntos (tabla publicada por Bespoke) | no disponible | no disponible en la información |

La comparación con Nimble-9B y Jev procede de la tabla publicada por Bespoke citada en la model card, con el scorer de esos modelos, no con el de Jeb. No se dispone de otros modelos comparables de decisión tipada en la información proporcionada.

## Limitaciones y advertencias

- Preguntas de tipo score: el rendimiento en HelpSteer2 (40,3 de accuracy) queda por debajo del suelo de la etiqueta mayoritaria (41,7) y el Decision Score es de 11,9, muy inferior al de choice y noul. No es fiable como clasificador ordinal en producción sin supervisión.
- Sensibilidad del argmax en rúbricas: en HelpSteer2 hasta un 10,0 % de las preguntas cambian de nivel con la inserción de un UUID en el estado, aunque el cambio medio de p_max es solo de 0,9 puntos. Un modelo calibrado que se sitúa entre niveles adyacentes es frágil al argmax; conviene consumir la distribución, no solo la etiqueta.
- Calibración desigual: el ECE sube a 0,165 en el conjunto typed-decisions (in-distribution) frente a 0,023-0,072 en los conjuntos de choice y noul.
- Idioma: solo inglés declarado. Los buenos resultados en massive-de-DE no equivalen a soporte multilingüe garantizado.
- Datos de rúbrica vistos: HelpSteer2 y SummEval dejan de ser zero-shot en v1 (se entrenó con el split de entrenamiento de HelpSteer2 y con artículos de SummEval que Nimble no puntúa). Esas filas son elementos held-out de una rúbrica vista, no evaluación cero-disparo.
- Métricas no verificadas: todas las cifras del model-index llevan "verified": false y proceden del banco de pruebas del propio autor, no del board público de Jevals. Además, el conjunto in-distribution score pierde algunos puntos de Decision Score respecto a v0.
- Riesgo de alucinación: al no generar texto, el riesgo no es de contenido inventado sino de sobreconfianza en la etiqueta elegida; debe validarse el umbral de abstención en el dominio de destino.
- Sesgos: no se documentan análisis de sesgo. Los conjuntos de evaluación incluyen dominios sensibles (aegis2, civil_comments), pero no hay estudio específico en la información disponible.
- Licencia: el adaptador es apache-2.0, lo que permite uso comercial, pero el modelo base Qwen/Qwen3.5-9B-Base impone sus propias condiciones, que no se detallan en la información proporcionada.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (2026-09-22), sin validación independiente conocida. La model card está truncada en el apartado de robustez.
- No soporta tool calling, agentes multi-paso, visión, audio ni modo de pensamiento según la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jbrashear/jebadiah-9b-v1
- Versión anterior v0: https://huggingface.co/jbrashear/jebadiah-9b-v0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Dataset LocalLLaMA/typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset nvidia/HelpSteer2: https://huggingface.co/datasets/nvidia/HelpSteer2
- Dataset mteb/summeval: https://huggingface.co/datasets/mteb/summeval
- Documentación de las rutas /v1/decide y /v1/systemone de AINode: no disponible (se citan en la model card sin URL)
- Paper, blog o repositorio de AINode o Jevals: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas de hora local de Dubái y no guardan relación con esta ficha.

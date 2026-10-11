# faizaltkl/qdec-lay-decision-model

## Resumen

El modelo `faizaltkl/qdec-lay-decision-model` es un adaptador de decisión estructurada construido sobre `unsloth/Qwen3.5-4B` mediante el flujo de entrenamiento de "decision models" de Unsloth, que añade una pequeña cabeza de puntuación (scoring head) sobre el LLM siguiendo el diseño de Clef, de Cloudflare. En lugar de generar texto libre, el modelo lee una entrada (texto plano o cualquier objeto JSON) y responde a preguntas estructuradas definidas en tiempo de petición, devolviendo opciones acompañadas de probabilidades calibradas.

Los tipos de pregunta soportados son tres: `choice` (elegir una opción entre varias y devolver una probabilidad por opción), `noul` (sí/no, con probabilidad de "sí") y `score` (un nivel dentro de una escala, con probabilidad por nivel). Esto permite reutilizar el mismo modelo para enrutar tickets, marcar fraude, detectar peticiones de reembolso o puntuar urgencia sin reentrenar, simplemente cambiando las preguntas en la llamada.

La relevancia del modelo está en su enfoque de despliegue: al exponer probabilidades calibradas, permite definir umbrales de automatización (por ejemplo, enrutar automáticamente solo cuando la opción más probable supera 0,8) y derivar el resto a revisión humana. Sobre 3.006 filas de evaluación no vistas (4.923 decisiones individuales), el modelo alcanza un 84,8 % de decisiones correctas frente al 33,2 % del punto de partida antes del ajuste. El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador LoRA en lugar de pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-4B) con cabeza de decisión añadida (diseño tipo Clef de Cloudflare) |
| Parametros totales | 4B en el modelo base (`unsloth/Qwen3.5-4B`); el adaptador publicado ocupa 0,2 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Carga en 4 bits soportada (`load_in_4bit=True` en el ejemplo oficial); no se documentan otros formatos |
| Idiomas soportados | en (inglés) |
| Licencia | other |
| Formato de pesos | safetensors (repositorio de adaptador LoRA, librería `unsloth`) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.5-4B`, un transformer decoder de 4.000 millones de parámetros, y le añade una cabeza de puntuación de pequeño tamaño sobre la representación del LLM. Este diseño es el mismo que emplea Clef, de Cloudflare, y convierte al modelo en un clasificador estructurado de propósito general en lugar de un generador de texto: la salida son distribuciones de probabilidad sobre opciones, niveles o respuestas binarias, no secuencias de tokens.

El ajuste se realizó con el flujo de entrenamiento de decision models de Unsloth y se publica como adaptador LoRA (0,2 GB). Los conjuntos de datos declarados son `faizaltkl/decision-model-dataset` y `LocalLLaMA/typed-decisions`. La evaluación reportada en la model card se hizo sobre particiones de test oficiales de cada fuente más filas escritas a mano reservadas, con 3.006 filas y 4.923 decisiones; el modelo base fue puntuado con la misma cabeza de decisión inicializada aleatoriamente y sin entrenar, de modo que sus cifras reflejan el punto de partida y no la capacidad aislada de Qwen. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO. La model card menciona una ejecución de entrenamiento anterior de 100 pasos frente a la cual `typed_decisions` mejoró del 73,85 % al 79,6 %.

## Capacidades

- Decisión estructurada con tres tipos de pregunta: `choice` (una opción entre varias), `noul` (sí/no) y `score` (nivel en una escala).
- Salida de probabilidades calibradas por opción, nivel o respuesta binaria, aptas para aplicar umbrales de confianza.
- Acepta como entrada tanto texto plano como objetos JSON arbitrarios en el campo `state`.
- Definición de preguntas en tiempo de petición, sin reentrenamiento, lo que permite reutilizar el mismo modelo para tareas de clasificación distintas.
- Enrutamiento de intenciones y temas: 96,0 % en banking77 (12 opciones) y 96,5 % en clinc150 (12 opciones) sobre 200 decisiones cada uno.
- Respuestas de lectura y comprensión: boolq 95,0 %, snli 94,0 %, mnli 89,5 %, arc_easy 99,0 %, arc (challenge) 96,5 % (200 decisiones por conjunto).
- Detección de inyección de prompts: 100,0 % sobre 116 decisiones, con un error de calibración (ECE) de 0,014.
- Clasificación de sentimiento: sst5 59,5 % con 5 niveles subjetivos (su punto más débil junto con WANLI y MMLU).
- No se documenta soporte de tool calling, function calling, uso agéntico, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: definir una pregunta `choice` con criterios por equipo (facturación, técnico, ventas) y usar las probabilidades para derivar automáticamente al equipo correcto cuando la opción más probable supera un umbral; el 93,3 % de acierto en el conjunto sintético de atención al cliente respalda este escenario.
- Detección de peticiones de reembolso: pregunta `noul` sobre si el cliente solicita un reembolso, con la probabilidad como señal para activar un flujo de revisión manual o de aprobación automática.
- Priorización por urgencia: pregunta `score` con niveles como "no urgente", "pronto" o "hoy"; útil para ordenar colas de trabajo y para SLA, apoyándose en el 91,3 % del conjunto sintético de banca y el 88,1 % del de IT/RRHH.
- Clasificación de intención en asistentes conversacionales: banking77 y clinc150 por encima del 96 % con 12 opciones permiten sustituir clasificadores dedicados por un único modelo configurable.
- Filtrado de seguridad y prompt injection: detección binaria de intentos de inyección de instrucciones antes de pasar la entrada a un LLM generativo, con 100,0 % de acierto y ECE 0,014 en el conjunto evaluado.
- Moderación y análisis de sentimiento por niveles: clasificación de reseñas o mensajes en cinco grados de sentimiento, teniendo en cuenta que el rendimiento en sst5 (59,5 %) exige revisión humana en los casos limítrofes.
- Etiquetado y enriquecimiento de datos a escala: al devolver probabilidades, permite generar etiquetas con umbral de confianza y aislar automáticamente los casos dudosos para anotación humana.
- Respuesta a preguntas de comprensión sobre documentos: boolq (95,0 %) y snli (94,0 %) permiten usarlo como verificador de afirmaciones o para responder preguntas booleanas sobre un texto (por ejemplo, comprobación de cláusulas contractuales).

## Benchmarks y rendimiento

Datos de la model card. Todas las cifras corresponden a 3.006 filas de evaluación (4.923 decisiones) no usadas en entrenamiento ni calibración. El margen indicado es el error del 95 %.

Resultados globales:

| Metrica | Base | Ajustado | Cambio |
|---|---|---|---|
| Todas las decisiones (4.923) | 33,2 % | 84,8 % (±1,0 %) | +51,6 pts |
| Filas con todas las respuestas correctas (3.006) | 29,0 % | 80,8 % | +51,8 pts |
| Preguntas de tipo choice (2.690) | 29,6 % | 86,5 % (±1,3 %) | +57,0 pts |
| Preguntas sí/no (1.143) | 53,5 % | 90,1 % (±1,7 %) | +36,7 pts |
| Preguntas de tipo score (1.090) | 21,0 % | 75,0 % (±2,6 %) | +53,9 pts |

Desglose por conjunto de evaluación:

| Conjunto | Decisiones | Base | Ajustado | ± (95 %) | Cambio | Filas totalmente correctas | ECE |
|---|---|---|---|---|---|---|---|
| typed_decisions | 2000 | 30,1 % | 79,6 % | 1,8 % | +49,5 | 39,0 % | 0,164 |
| synth_customer_support | 120 | 60,0 % | 93,3 % | 4,5 % | +33,3 | 70,8 % | 0,042 |
| synth_banking | 115 | 34,8 % | 91,3 % | 5,1 % | +56,5 | 56,5 % | 0,040 |
| synth_ecommerce | 88 | 27,3 % | 83,0 % | 7,9 % | +55,7 | 54,5 % | 0,057 |
| synth_it_hr | 84 | 33,3 % | 88,1 % | 6,9 % | +54,8 | 57,1 % | 0,059 |
| banking77 (12 opciones) | 200 | 22,0 % | 96,0 % | 2,7 % | +74,0 | 96,0 % | 0,024 |
| clinc150 (12 opciones) | 200 | 13,0 % | 96,5 % | 2,5 % | +83,5 | 96,5 % | 0,032 |
| ag_news | 200 | 45,5 % | 94,0 % | 3,3 % | +48,5 | 94,0 % | 0,063 |
| boolq | 200 | 58,5 % | 95,0 % | 3,0 % | +36,5 | 95,0 % | 0,033 |
| mnli | 200 | 37,5 % | 89,5 % | 4,2 % | +52,0 | 89,5 % | 0,066 |
| snli | 200 | 50,0 % | 94,0 % | 3,3 % | +44,0 | 94,0 % | 0,066 |
| wanli | 200 | 36,0 % | 73,0 % | 6,2 % | +37,0 | 73,0 % | 0,061 |
| arc (challenge) | 200 | 32,0 % | 96,5 % | 2,5 % | +64,5 | 96,5 % | 0,044 |
| arc_easy | 200 | 33,0 % | 99,0 % | 1,4 % | +66,0 | 99,0 % | 0,014 |
| commonsense_qa | 200 | 25,0 % | 85,0 % | 4,9 % | +60,0 | 85,0 % | 0,056 |
| mmlu | 200 | 31,0 % | 73,5 % | 6,1 % | +42,5 | 73,5 % | 0,118 |
| sst5 | 200 | 23,0 % | 59,5 % | 6,8 % | +36,5 | 59,5 % | 0,156 |
| prompt_injections | 116 | 47,4 % | 100,0 % | – | +52,6 | 100,0 % | 0,014 |

Lectura de resultados según la model card: los puntos fuertes son enrutamiento de intención, preguntas de lectura sí/no, preguntas de ciencia y detección de inyección de prompts (94-100 %); los más débiles son SST-5 (59,5 %), WANLI (73 %) y MMLU (73,5 %). La calibración es peor en typed_decisions (ECE 0,164) y sst5 (ECE 0,156), donde la confianza del modelo es menos fiable. La comparación con los valores de Unsloth (73 % con Qwen3.5-0.8B y 78 % con Qwen3.5-2B en typed-decisions) se ofrece en la propia model card como referencia aproximada, ya que las configuraciones difieren.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por el tamaño del base (4B), la carga en 4 bits implica del orden de 3-4 GB solo de pesos, más el coste de la cabeza de decisión, el tokenizador y las activaciones; en fp16 serían del orden de 8-10 GB. Estos valores no están confirmados por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Dado el tamaño del modelo base, sería desplegable en GPUs de gama consumer con suficiente VRAM, pero no hay especificación oficial.
- Cabe en GPU consumer: probablemente sí, dado que el ejemplo oficial usa `load_in_4bit=True`, pero no se documentan modelos concretos ni requisitos mínimos.
- Opciones de despliegue: el camino documentado es `FastDecisionModel` de Unsloth (`from_pretrained`, `for_inference`, `FastDecisionModel.predict`). No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, y la cabeza de decisión implica un formato de salida que requiere el código de inferencia específico de Unsloth.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| faizaltkl/qdec-lay-decision-model | 4B (base) + cabeza de decisión | Decisión estructurada con probabilidades calibradas | no disponible | other | HuggingFace (0 descargas, 1 like) |
| Qwen3.5-0.8B (referencia de Unsloth para typed-decisions) | 0,8B | Decision model entrenado con el mismo flujo de Unsloth | no disponible | no disponible | Referencia citada en la model card |
| Qwen3.5-2B (referencia de Unsloth para typed-decisions) | 2B | Decision model entrenado con el mismo flujo de Unsloth | no disponible | no disponible | Referencia citada en la model card |
| Clef (Cloudflare) | no disponible | Cabeza de puntuación sobre LLM, diseño de referencia | no disponible | no disponible | Citado como diseño, no comparado numéricamente |

La model card indica que Unsloth reporta 73 % (Qwen3.5-0.8B) y 78 % (Qwen3.5-2B) en typed-decisions tras entrenamiento, frente al 79,6 % de este modelo en la misma partición de test de 2.000 decisiones. El propio autor advierte que las configuraciones difieren y que la comparación es solo una referencia aproximada.

## Limitaciones y advertencias

- La model card está truncada en la información proporcionada (corta en "Confidence is less reliable on typed_decisions, SST-5 ..."), por lo que las conclusiones finales del autor no están completas.
- Calibración desigual: el ECE es 0,164 en typed_decisions y 0,156 en sst5, muy por encima del umbral de 0,05 que la propia model card considera buena calibración; las probabilidades en esos conjuntos no deberían usarse sin umbrales conservadores.
- Rendimiento débil en sentimiento de cinco niveles (SST-5, 59,5 %), en pares de razonamiento deliberadamente difíciles (WANLI, 73 %) y en conocimiento (MMLU, 73,5 %).
- El modelo base de comparación usa una cabeza inicializada aleatoriamente, de modo que las cifras "Base" miden el punto de partida de la cabeza, no la capacidad de Qwen; no deben interpretarse como una evaluación del LLM subyacente.
- Idioma: únicamente inglés declarado; no hay datos de rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinación: al no generar texto libre, el riesgo se traslada a errores de clasificación y a confianza mal calibrada; actuar solo sobre la respuesta elegida sin mirar las probabilidades es un uso desaconsejado por el propio autor.
- Licencia "other": no se detallan los términos, por lo que el uso comercial queda sin aclarar y requiere consulta directa al autor y a las licencias del modelo base.
- El repositorio tiene 0 descargas y 1 like, sin historial de uso en producción; no hay garantías de mantenimiento ni de soporte.
- El despliegue depende de la ruta de inferencia específica de Unsloth (`FastDecisionModel`); no se documentan exportaciones a GGUF ni integración con servidores de inferencia estándar.
- Los resultados web recuperados en la búsqueda no contienen información relevante sobre este modelo: la búsqueda devolvió únicamente listados de vídeos para adultos no relacionados, por lo que no aportan datos verificables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/faizaltkl/qdec-lay-decision-model
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Dataset declarado: https://huggingface.co/datasets/faizaltkl/decision-model-dataset
- Dataset declarado: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Documentación de Unsloth sobre entrenamiento de decision models: https://unsloth.ai/docs/basics/train-your-own-decision-model-with-unsloth
- Referencia al diseño de Clef (Cloudflare): citada en la model card sin URL disponible

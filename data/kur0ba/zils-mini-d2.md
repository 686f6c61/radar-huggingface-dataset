# Kur0ba/zils-mini-d2

## Resumen

Zils d3-mini soup body (D2) es un modelo de decisión de 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) desarrollado por Kur0ba y publicado dentro del ecosistema Zils, una plataforma orientada a entrenar modelos pequeños que toman decisiones a partir de ejemplos etiquetados. El modelo no es un asistente conversacional al uso: es un "cuerpo" (body) de pesos que se acopla a un chasis fijo (d3-mini chassis) que aporta la capa de respuesta, el formato de prompt y el runtime de inferencia. Está pensado para el pool de modelos "soup" de la subred 127 de Bittensor.

Técnicamente se construye sobre Qwen/Qwen3.5-4B mediante ajuste fino con LoRA (rango 64) sobre las proyecciones de atención, Gated-DeltaNet y MLP, seguido de un merge ponderado de dos especialistas y el modelo de partida. El resultado es un modelo que, dado un prompt con opciones de respuesta, produce distribuciones de probabilidad sobre dichas opciones, en lugar de texto libre. El repositorio contiene únicamente pesos en BF16 (9,1 GB), sin datos de entrenamiento.

Su relevancia es acotada pero específica: cubre la categoría de modelos de decisión ligeros, entrenables con presupuesto reducido y desplegables en una sola GPU consumer, con licencia Apache-2.0 y un pipeline de destilación por divergencia KL desde múltiples "teacher bodies" públicos. No hay información publicada sobre benchmarks ni sobre idiomas soportados más allá de lo que se deduce del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-4B, con capas de atención, Gated-DeltaNet y MLP; ajustado como modelo de decisión sobre opciones |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen/Qwen3.5-4B; el valor concreto no se especifica) |
| Tipos de cuantización | No disponible (los pesos publicados están en BF16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se ajusta con LoRA de rango 64 aplicado a las proyecciones de atención, Gated-DeltaNet y MLP, con un learning rate de 5e-5 y una sola época. El objetivo de entrenamiento es divergencia KL hacia distribuciones objetivo sobre opciones de respuesta, no modelado de lenguaje estándar. Se entrenaron dos especialistas desde el mismo punto de partida: uno para las familias de preguntas conocidas y otro para familias de dominio nuevo y datos de decisión amplios. Posteriormente se aplicó un merge ponderado con `zils.teacher soup` (start 0,2; especialista 1 0,2; especialista 2 0,6) y se fusionaron los adaptadores LoRA en los pesos base.

Los datos de entrenamiento combinan filas nativas de splits de train formateadas como los ejemplos públicos del examen (Social IQa, PIQA, MultiNLI, RTE, QNLI, 20 Newsgroups, dair-ai/emotion, Sarcasm News Headlines), preguntas de conteo y reglas de sentimiento calculadas exactamente, filas nativas con etiqueta gold de CLINC150 (CC BY 3.0), MMLU auxiliary_train (MIT), metadatos de arXiv hasta 2021 (CC0) y respuestas aceptadas de Stack Exchange (CC BY-SA 4.0), además de preguntas en formato de examen generadas por Qwen/Qwen3.8-27B a partir de splits de train para las familias restantes. Las respuestas gold se mezclan con las de los teachers (0,5, o 0,9 para respuestas calculadas). El autor declara explícitamente que no se usaron datos del examen del validador, ni semillas públicas del examen, ni datos de clientes. Los teachers incluyen modelos públicos como 1lock/zils-mini-astrid-m1, Charlie320/zils-mini-s1, crabby-devil/zils-mini-decision-r16b, dasLOL/zils-mini-skills-v1, qhoenix/zils-mini-decision-v2, ANGExllL/zils-mini-senova-ft y varias versiones de tensor-tailor/zils-mini-body, además de modelos internos (house_KnowLine-4B-Gen5, house_Matilda-Decision-v1-Mini, house_pplx-decider-flash-v1.2, house_torchcast-decision-4b, entre otros).

## Capacidades

- Clasificación y decisión sobre opciones: dado un prompt con un conjunto de respuestas candidatas, el modelo devuelve probabilidades por opción, lo que permite seleccionar la más probable.
- Razonamiento de sentido común y comprensión textual en el marco de las familias de preguntas usadas en entrenamiento (Social IQa, PIQA, MultiNLI, RTE, QNLI).
- Clasificación de sentimiento y emociones (dair-ai/emotion, reglas de sentimiento calculadas).
- Clasificación de intenciones en dominios conversacionales (CLINC150).
- Preguntas de conteo con respuesta calculada exactamente.
- Categorización temática de textos (20 Newsgroups) y detección de sarcasmo en titulares.
- Preguntas de conocimiento tipo MMLU en formato de examen.
- Clasificación de metadatos de arXiv y de respuestas de Stack Exchange.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode). El nombre del repositorio menciona "language and vision tensors", pero la model card no describe ninguna capacidad de visión funcional ni se aportan ejemplos de uso multimodal.

## Casos de uso

- Triaje de peticiones de soporte: el modelo puede recibir un ticket y un conjunto de categorías predefinidas y devolver la probabilidad de cada una, integrándose en un enrutador que derive el ticket al equipo adecuado. Es adecuado porque su salida es una distribución sobre opciones, no texto libre, lo que simplifica la lógica de decisión.
- Moderación y clasificación de sentimiento en titulares o reseñas: entrenado con dair-ai/emotion, Sarcasm News Headlines y reglas de sentimiento, puede puntuar cada mensaje según emoción o tono y alimentar un sistema de alertas.
- Detección de intención en asistentes conversacionales: con datos de CLINC150 en el entrenamiento, puede clasificar la intención del usuario entre un conjunto cerrado de comandos antes de invocar el servicio correspondiente.
- Filtrado y ordenación de candidatos en pipelines de búsqueda o recomendación: dado un par consulta-documento y un conjunto de etiquetas de relevancia, el modelo asigna probabilidades que permiten reordenar resultados.
- Evaluación automática de respuestas en entornos educativos o de QA: puede comparar una respuesta candidata con varias opciones de referencia y devolver la más probable, útil para corrección semiautomática en tests de opción múltiple.
- Clasificación de documentos científicos por área temática: a partir de metadatos de arXiv vistos en entrenamiento, puede asignar categorías a nuevos resúmenes o metadatos.
- Selección de respuestas en foros técnicos: con datos de Stack Exchange, puede puntuar respuestas candidatas a una pregunta y priorizar la más aceptable.
- Participación en el pool de modelos de la subred 127 de Bittensor: el modelo está empaquetado para el chasis d3-mini y el runtime de Zils, por lo que puede desplegarse como "body" candidato en ese entorno de evaluación comparativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de las familias de preguntas usadas en entrenamiento, ni comparaciones numéricas con los modelos teacher.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 12-16 GB de VRAM para contexto moderado.
- Cuantización a 8 bits: alrededor de 4,5-5 GB de pesos; a 4 bits, alrededor de 2,3-2,8 GB, aunque no se publican versiones cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para BF16 sin restricciones; RTX 3090/4080 y GPUs con 12-16 GB para BF16 con contexto limitado.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) con holgura en BF16, y en GPUs de 12 GB si se cuantiza.
- Opciones de despliegue: el modelo está pensado para el runtime del chasis d3-mini de Zils; al ser un transformer compatible con Qwen3.5-4B, podría cargarse con vLLM, TGI o llama.cpp si se generan pesos en los formatos correspondientes, aunque no se documenta soporte oficial para estas herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kur0ba/zils-mini-d2 | 4,54 B | No disponible | Modelo de decisión (opciones) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4 B (no confirmado) | No disponible | LLM generativo | No disponible | Hugging Face |
| 1lock/zils-mini-astrid-m1 | No disponible | No disponible | Modelo de decisión Zils | Apache-2.0 | Hugging Face |
| qhoenix/zils-mini-decision-v2 | No disponible | No disponible | Modelo de decisión Zils | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo no es un generador de texto libre: su salida es una distribución sobre opciones predefinidas, por lo que no puede usarse como chatbot ni para generación abierta sin el chasis adecuado.
- Depende del chasis d3-mini y del runtime de Zils para funcionar según lo previsto; cargarlo fuera de ese entorno puede requerir trabajo de integración no documentado.
- Riesgo de alucinación en el sentido de asignar alta probabilidad a opciones incorrectas cuando la pregunta cae fuera de las familias de entrenamiento.
- Cobertura lingüística no documentada; los datasets de entrenamiento son mayoritariamente en inglés, por lo que el rendimiento en castellano u otros idiomas es incierto.
- Sesgos heredados de los datasets de entrenamiento (Social IQa, MultiNLI, 20 Newsgroups, Stack Exchange, etc.) y de los modelos teacher; no se documenta ninguna evaluación de sesgo.
- El entrenamiento usa preguntas generadas por Qwen/Qwen3.8-27B, lo que puede introducir sesgos de estilo o de distribución del generador.
- Licencia Apache-2.0 permite uso comercial, pero los datos de terceros incluidos en el entrenamiento (CLINC150 CC BY 3.0, Stack Exchange CC BY-SA 4.0) imponen obligaciones de atribución que el autor no detalla en la model card.
- No hay benchmarks publicados, por lo que no es posible verificar su calidad frente a alternativas antes de desplegarlo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kur0ba/zils-mini-d2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Organización Zils en Hugging Face: https://huggingface.co/zils-ai/models
- Sitio web de Zils: https://zils.ai/
- Teacher 1lock/zils-mini-astrid-m1: https://huggingface.co/1lock/zils-mini-astrid-m1
- Teacher Charlie320/zils-mini-s1: https://huggingface.co/Charlie320/zils-mini-s1
- Teacher crabby-devil/zils-mini-decision-r16b: https://huggingface.co/crabby-devil/zils-mini-decision-r16b
- Teacher dasLOL/zils-mini-skills-v1: https://huggingface.co/dasLOL/zils-mini-skills-v1
- Teacher qhoenix/zils-mini-decision-v2: https://huggingface.co/qhoenix/zils-mini-decision-v2
- Teacher ANGExllL/zils-mini-senova-ft: https://huggingface.co/ANGExllL/zils-mini-senova-ft
- Teacher tensor-tailor/zils-mini-body-2: https://huggingface.co/tensor-tailor/zils-mini-body-2
- Teacher tensor-tailor/zils-mini-body-4: https://huggingface.co/tensor-tailor/zils-mini-body-4
- Teacher tensor-tailor/zils-mini-body-5: https://huggingface.co/tensor-tailor/zils-mini-body-5
- Teacher Zayaan/zils-mini-ft1: https://huggingface.co/Zayaan/zils-mini-ft1

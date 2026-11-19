# microsoft/Sentiment-Analysis-7B

## Resumen

Sentiment-Analysis-7B es un modelo de lenguaje autorregresivo de 7.241.732.096 parámetros desarrollado por Microsoft, obtenido mediante ajuste fino de `mistralai/Mistral-7B-Instruct-v0.2`. Su propósito es clasificar el sentimiento de mensajes de usuario dirigidos a un servicio, producto o agente (denominado "Target") en tres categorías: `Negative`, `Neutral` o `Positive`. El modelo genera como primer token la etiqueta de sentimiento, seguida opcionalmente de una breve explicación de la decisión.

El ajuste se realizó con aprendizaje por refuerzo (RL) usando un LLM como juez, sobre un conjunto de entrenamiento interno pequeño de aproximadamente 300 ejemplos, sin etiquetas predefinidas. Sobre el modelo base, mejora la precisión en la tarea de análisis de sentimiento del 62,0% al 72,8%, según la model card.

Es relevante porque demuestra una vía de adaptación de bajo coste (pocos ejemplos, RL con juez LLM) para convertir un modelo instructivo generalista en un clasificador de sentimiento con salida explicativa, manteniendo la licencia MIT y la compatibilidad con el ecosistema Transformers y text-generation-inference.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), basada en Mistral-7B-Instruct-v0.2 |
| Parámetros totales | 7.241.732.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la información proporcionada (pesos en safetensors; el modelo base admite cuantizaciones habituales como bfloat16, pero no se documentan en la ficha) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Mistral-7B-Instruct-v0.2, un transformer decoder-only autorregresivo de 7B parámetros, y se ajusta mediante aprendizaje por refuerzo con un LLM actuando como juez. El conjunto de entrenamiento es interno y reducido: aproximadamente 300 ejemplos, sin emplear etiquetas predefinidas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni detalles del algoritmo de RL (por ejemplo, PPO o DPO).

La innovación principal es el formato de salida: el primer token generado es siempre la etiqueta de sentimiento, lo que permite extraer la clasificación con `max_new_tokens=3` y obtener además una justificación en lenguaje natural si se amplía la generación. El comportamiento se controla mediante un system prompt que define el "Target" y las reglas de sentimiento (por ejemplo, preguntas no relacionadas con el Target se clasifican como Neutral; declaraciones de incapacidad o fallo como Negative; fallo con petición educada de ayuda como Neutral).

## Capacidades

- Clasificación de sentimiento en tres clases (`Positive`, `Neutral`, `Negative`) de mensajes de usuario dirigidos a un servicio, producto o agente.
- Generación de una explicación breve de la decisión de clasificación tras la etiqueta.
- Generación de texto conversacional heredada del modelo base Mistral-7B-Instruct-v0.2.
- Seguimiento de instrucciones mediante system prompt con definiciones y reglas de negocio personalizables.
- Capacidad de razonamiento de clasificación guiado por reglas explícitas (relación con el Target, tipo de queja, petición de ayuda).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Triaje de tickets de soporte: el modelo clasifica el sentimiento del mensaje inicial de un cliente y permite enrutar automáticamente los casos negativos a agentes senior o a colas prioritarias, usando la etiqueta como primer token para una extracción fiable.
- Monitorización de satisfacción en tiempo real: integrado en un pipeline de mensajería, clasifica cada mensaje entrante y agrega métricas de sentimiento por producto, canal o periodo, aprovechando la salida explicativa para auditar decisiones.
- Análisis de reseñas y feedback de producto: procesa comentarios de usuarios sobre una app o servicio y distingue entre quejas, incidencias indirectas y consultas neutras según las reglas del system prompt.
- Detección de riesgo de escalado: identifica mensajes con frustración o acusaciones (por ejemplo, "you lie") para activar protocolos de retención o atención preferente.
- Enrutamiento en helpdesk: clasifica mensajes que describen fallos técnicos (caídas de app, problemas de login) y separa los que incluyen petición de ayuda educada, que se marcan como Neutral, de los que solo reportan incapacidad, marcados como Negative.
- Investigación en adaptación con RL: sirve como referencia reproducible de ajuste fino con pocos ejemplos y juez LLM para experimentos académicos sobre clasificación con justificación.
- Moderación de comunidades y foros: clasifica el tono de mensajes hacia la plataforma o sus moderadores, con la etiqueta como señal primaria y la explicación como material de revisión humana.

## Benchmarks y rendimiento

| Modelo | Métrica | Resultado |
|---|---|---|
| mistralai/Mistral-7B-Instruct-v0.2 | Accuracy (análisis de sentimiento) | 62,0% |
| Sentiment-Analysis-7B | Accuracy (análisis de sentimiento) | 72,8% |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 14,5 GB de pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 16-24 GB de VRAM.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bfloat16.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bfloat16; en GPUs con 16 GB o menos sería necesaria cuantización (no documentada en la ficha, pero aplicable por herencia de la arquitectura Mistral).
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), text-generation-inference (etiqueta `text-generation-inference` en el repo), endpoints compatibles; vLLM, llama.cpp u Ollama no se documentan explícitamente en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microsoft/Sentiment-Analysis-7B | 7,24B | no disponible | Clasificación de sentimiento con explicación (RL con juez LLM) | MIT | Hugging Face |
| mistralai/Mistral-7B-Instruct-v0.2 | 7B | no disponible en esta ficha | Modelo instructivo generalista | Apache 2.0 (según el modelo base; no verificado en la información disponible) | Hugging Face |
| Clasificadores de sentimiento dedicados (por ejemplo, basados en BERT) | 0,1-0,3B típicamente | 512 tokens típicamente | Clasificación supervisada con etiquetas | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas específicas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con aproximadamente 300 ejemplos internos: riesgo elevado de sobreajuste y de generalización limitada a dominios distintos del conjunto de entrenamiento.
- Solo soporta inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- La calidad depende críticamente del system prompt: cambios en la definición del Target o en las reglas de sentimiento alteran las clasificaciones.
- Riesgo de alucinación en la explicación generada: la justificación puede no reflejar fielmente el razonamiento interno del modelo.
- Sesgos heredados del modelo base Mistral-7B-Instruct-v0.2 y del juez LLM empleado en el RL, no documentados en la información disponible.
- El formato de salida exige que la etiqueta sea el primer token; un prompt mal construido o una generación con sampling puede romper esa garantía.
- Licencia MIT: permite uso comercial, pero no se documentan cláusulas adicionales sobre datos de entrenamiento ni sobre el modelo base.
- No se documentan evaluaciones de robustez, calibración ni comportamiento ante entradas adversarias.
- La fecha de creación del repositorio (2026-10-17) y la información limitada de la model card sugieren que se trata de un modelo reciente con documentación escasa; conviene validarlo en el dominio de producción antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microsoft/Sentiment-Analysis-7B
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales específicos de este modelo.

# JuneoAI/Laplace-1-Vector

## Resumen

Laplace-1-Vector es un modelo de lenguaje de 4.112 millones de parámetros (4,1B) desarrollado por JuneoAI, especializado en toma de decisiones causales e intervencionistas para agentes autónomos. Se presenta como el miembro "edge" de la familia Laplace-1, junto al modelo insignia Laplace-1-Atlas de 27,4B. Su propósito es predecir las consecuencias de una acción candidata antes de ejecutarla, modelando la distribución interventional p(s' | do(a), s, C), donde s es el estado de la organización, a la acción y C la cadena de autoridad.

El modelo está afinado a partir de XHToken/Spark-X2.6-4B y se distribuye con licencia Apache-2.0 y pesos completos en BF16 (8,2 GB). Su propuesta central es que un juicio sea un único forward pass: se leen las probabilidades sobre los candidatos directamente desde los logits del siguiente token, sin muestreo ni parsing, lo que abarata su uso delante de cada acción de un agente. Está pensado para ejecutarse en hardware propio de la organización (on-premises u on-device), de modo que los datos sensibles no salgan del perímetro.

La relevancia actual del modelo reside en su enfoque: frente a los LLM generalistas que aprenden de datos observacionales, Laplace aprende de datos intervencionistas compilados desde políticas organizativas mediante la herramienta Decision Forge, con cada etiqueta replicada desde una regla y trazada a su fuente. Según el autor, encabeza 7 de 8 benchmarks de decisión frente a modelos de Perplexity, IBM, Liquid AI, Together AI, TokenRhythm y Shanghai AI Lab.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (fine-tune de XHToken/Spark-X2.6-4B); detalles internos no disponibles |
| Parámetros totales | 4.112.079.360 (4,1B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, 8,2 GB); requiere `custom_code` |

## Arquitectura y entrenamiento

Laplace-1-Vector es un fine-tune del modelo base XHToken/Spark-X2.6-4B, un transformer causal de aproximadamente 4B parámetros. La model card no detalla la arquitectura interna del modelo base (número de capas, dimensiones, tipo de atención) ni la longitud de contexto. El modelo requiere `trust_remote_code` por el uso de código personalizado (`custom_code`) para su carga en transformers.

El entrenamiento se realizó íntegramente sobre datos generados con Decision Forge, un pipeline que compila políticas organizativas en ejemplos de decisión donde cada etiqueta se replica a partir de una regla explícita y se traza hasta su fuente. El objetivo declarado es aprender la distribución interventional de consecuencias p(s' | do(a), s, C). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. La innovación técnica destacada es el modo de inferencia: la decisión se obtiene en un único forward pass leyendo una distribución sobre los candidatos a partir de los logits del siguiente token, sin muestreo ni parsing posterior.

## Capacidades

- Toma de decisiones estructurada: puntuación de candidatos (candidate scoring) devolviendo una distribución sobre las opciones proporcionadas.
- Predicción de consecuencias de acciones (consequence prediction) bajo un estado y una cadena de autoridad dados.
- Asignación de trabajo: recomendar qué persona o rol debe poseer una tarea.
- Control de acceso e información: decidir qué roles pueden ver qué datos y en qué grado.
- Decisión de actuación: ejecutar, ajustar o escalar una acción según su consecuencia prevista.
- Evaluación de resultados: comprobar si un entregable cumple sus criterios de aceptación.
- Orientado a agentes y seguridad de agentes (tags `agents`, `agent-safety`), con integración prevista vía A2A y MCP según la model card.
- Ejecución on-device y on-premises para mantener los datos en el perímetro de la organización.
- Capacidades multilingües: no disponibles.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Enrutamiento de tareas en organizaciones con agentes: dado un estado y una lista de candidatos (personas o agentes), el modelo devuelve una distribución sobre quién debe recibir la tarea en un solo forward pass, lo que permite enrutar cada nueva entrada a bajo coste.
- Control de acceso a datos sensibles: colocado delante de una consulta, decide si un rol concreto puede ver un campo o registro, manteniendo los datos dentro del hardware propio y sin enviarlos a un proveedor externo.
- Escalado de acciones de agentes: para cada acción propuesta, el modelo estima la consecuencia y decide si ejecutarla, ajustarla o derivarla a un humano, actuando como capa de seguridad antes de invocar herramientas.
- Verificación de entregables: comprobar automáticamente si un resultado cumple sus criterios de aceptación antes de la firma, devolviendo la probabilidad de cada veredicto.
- Puerta de aprobación en pipelines de negocio: decidir si un contrato o pedido supera un umbral y debe enviarse a su responsable, integrándose como paso previo en flujos existentes.
- Despliegue en dispositivos con recursos limitados: al ser un modelo de 4,1B con pesos BF16 de 8,2 GB, puede ejecutarse en servidores on-premises o en hardware de borde para juicios locales sin conexión a la nube.
- Evaluación de políticas organizativas: usar el modelo para simular la consecuencia de distintas reglas de asignación o acceso antes de aplicarlas en producción.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados declarados por el autor:

| Benchmark | Resultado | Nota |
|---|---|---|
| AgentDecisionBench L2 common | 89,6% | Por delante de todos los modelos de la comparativa |
| AgentDecisionBench L2 shift | 88,1% | Por delante de todos los modelos de la comparativa |
| Posición global | 1.º en 7 de 8 benchmarks de decisión | Empates contabilizados |

Comparaciones declaradas por el autor:

- Frente a IBM Granite Switch 4.1 8B: supera en los 8 benchmarks, por un margen de 2,3 a 26,1 puntos.
- Frente a Laplace-1-Atlas (27,4B): se mantiene a menos de 0,5 puntos en COMPASS, OrgAccess y Coherence.

No se han publicado en la información disponible los valores numéricos completos de cada benchmark ni resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 8,2 GB de pesos más overhead de activaciones y KV cache; no se especifica la cifra exacta.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un modelo de 4,1B en BF16 encaja en GPUs de consumo con 12-16 GB o más (por ejemplo, RTX 4090), aunque el autor no confirma modelos concretos.
- Cabe en GPU de consumo: probablemente sí en BF16 en GPUs de 16 GB o más; no confirmado por el autor.
- Opciones de despliegue: transformers con `trust_remote_code` (único formato confirmado). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni versiones GGUF.
- Latencia y throughput: no disponibles. El autor destaca que una decisión es un único forward pass, lo que reduce el coste frente a esquemas de muestreo y parsing.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laplace-1-Vector | 4,1B | no disponible | Decisión causal / edge | Apache-2.0 | Pesos abiertos |
| Laplace-1-Atlas | 27,4B | no disponible | Decisión causal / insignia | no disponible | Pesos abiertos (familia) |
| IBM Granite Switch 4.1 8B | 8B | no disponible | Decisión / enrutamiento | no disponible | no disponible |
| Modelos de Perplexity, Liquid AI, Together AI, TokenRhythm, Shanghai AI Lab | no disponible | no disponible | Decisión | no disponible | no disponible |

Según el autor, Vector supera a Granite Switch 4.1 8B en los 8 benchmarks (entre 2,3 y 26,1 puntos) y se mantiene a menos de 0,5 puntos de Atlas en COMPASS, OrgAccess y Coherence. No se dispone de cifras detalladas del resto de competidores.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no evaluado explícitamente; el modelo está especializado en decisiones y no en generación abierta, por lo que su uso fuera del dominio previsto puede degradar la fiabilidad.
- Idiomas soportados: no especificados; no hay garantía de comportamiento multilingüe.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con conversaciones o estados organizativos extensos.
- Dependencia de `custom_code`: requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código del autor y revisarlo antes de producción.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda verificar el archivo LICENSE del repositorio.
- Datos de benchmarks: los resultados provienen del propio autor y no se han verificado de forma independiente en la información disponible.
- Madurez: modelo reciente (creado el 2026-11-01) y de nicho; ecosistema de despliegue (GGUF, vLLM) no confirmado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JuneoAI/Laplace-1-Vector
- Demo (Space): https://huggingface.co/spaces/JuneoAI/Laplace-1-Vector
- Modelo insignia Laplace-1-Atlas: https://huggingface.co/JuneoAI/Laplace-1-Atlas
- Decision Forge (datos): https://github.com/Juneo-Lab/decision-forge
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Contacto: business@juneo.ai

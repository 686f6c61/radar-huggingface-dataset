# Shoshkin/record-injection-guard-small

## Resumen

Record Injection Guard (small) es un clasificador de texto de 141 millones de parámetros basado en ModernBERT, desarrollado por Shoshkin y publicado con licencia Apache 2.0. Su función es detectar instrucciones maliciosas inyectadas en registros empresariales (notas de CRM, tickets de soporte, correos, documentos y salidas de herramientas) antes de que un agente de IA las procese. Resuelve un problema concreto de la seguridad de agentes: la inyección indirecta de prompts, en la que un atacante no habla con el modelo, sino que planta una orden en un dato que el agente leerá más tarde.

El modelo se ha ajustado sobre aproximadamente 2.000 registros empresariales redactados específicamente para el entrenamiento, con etiquetas `BENIGN` e `INJECTION`, y se distribuye en formato safetensors compatible con la librería `transformers`. Es relevante ahora porque los despliegues de agentes con acceso a herramientas y datos corporativos multiplican la superficie de ataque de la inyección indirecta, y este guard actúa como una capa de filtrado previa de bajo coste computacional.

La ventana de contexto del clasificador es de 2.048 tokens; para registros más largos el autor proporciona un script (`inference.py`) que puntúa cada ventana y agrega el resultado. El modelo está entrenado y evaluado mayoritariamente en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), clasificación de texto |
| Parámetros totales | 140.642.306 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (por ventana; para registros más largos se usa `inference.py` con pooling por ventanas) |
| Tipos de cuantización | no disponible (el repo solo publica safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT afinado para clasificación binaria (`BENIGN` / `INJECTION`). Parte de un checkpoint de detección de inyección de prompts mmBERT-small con licencia Apache 2.0, cuyos pesos han sido modificados por el ajuste fino. El pipeline declarado es `text-classification` y el repositorio ocupa 0,6 GB.

El conjunto de entrenamiento se compone de 1.022 pares de registros limpios y atacados más 970 registros benignos "difíciles", redactados expresamente para este modelo y distribuidos entre dominios de CRM, soporte, legal, flujos de trabajo, recursos humanos, finanzas, IT y correo electrónico. A estos datos se añadieron prompts públicos etiquetados con las propias puntuaciones del checkpoint de partida para limitar la deriva del modelo. No se utilizó ningún registro de benchmark para entrenar: cada benchmark se dividió por objetivo del atacante y el split de test se puntuó una sola vez. No se documenta en la información disponible el uso de RLHF o DPO, ni el número total de tokens de entrenamiento.

## Capacidades

- Clasificación binaria de texto en dos etiquetas: `BENIGN` e `INJECTION`.
- Detección de inyección indirecta de prompts en registros empresariales: notas de CRM, tickets, correos, documentos y salidas de herramientas.
- Puntuación por ventanas deslizantes con agregación (pooling) para registros que superan los 2.048 tokens, mediante el script `inference.py` incluido por el autor.
- Integración directa con el pipeline `text-classification` de `transformers`.
- Compatibilidad declarada con Text Embeddings Inference y con endpoints (`endpoints_compatible`).
- Uso como guardrail previo a la lectura de datos por parte de un agente, no como generador de texto.
- No soporta tool calling, generación, razonamiento multi-paso ni modalidades de visión o audio: es exclusivamente un clasificador.

## Casos de uso

- Filtrado previo de notas de CRM en agentes comerciales: antes de que un agente lea una nota de cliente, el guard la clasifica y bloquea o marca las que contienen instrucciones plantadas, como la petición de reembolso del ejemplo de la model card.
- Protección de tickets de soporte: se puntúa cada mensaje entrante o nota interna antes de pasarla al agente que ejecuta acciones sobre la cuenta del cliente, reduciendo el riesgo de que una orden oculta dispare reembolsos o cambios no autorizados.
- Saneamiento de salidas de herramientas en agentes con function calling: las respuestas de APIs y herramientas se clasifican antes de incorporarlas al contexto del agente, cubriendo el escenario de InjecAgent y AgentDojo.
- Revisión de correos en flujos de trabajo automatizados: el modelo detecta instrucciones no relacionadas insertadas en el cuerpo de un correo (caso BIPIA) antes de que un agente de correo las procese.
- Guardrail en pipelines de documentos legales o de RR. HH.: se clasifican documentos y expedientes antes de su ingesta en sistemas que resumen o extraen datos con un LLM, con la advertencia de que el propio autor señala menor recall en ataques redactados como trabajo legal ordinario.
- Capa de defensa en profundidad en plataformas de agentes: combinado con controles de identidad del autor del registro y de la tarea encomendada al agente, el clasificador aporta una señal adicional de bajo coste (141 M de parámetros) para decidir si un registro requiere revisión humana.

## Benchmarks y rendimiento

Datos publicados en la model card. Cada modelo se ejecutó sobre el mismo split de test reservado, con su umbral por defecto. Las columnas indican el porcentaje de ataques detectados; "False alarms" es el porcentaje de 1.496 registros benignos marcados (DTap, AgentDojo, BIPIA, LLMail y tau-bench).

| Modelo | Tamaño | DTap | AgentDojo | InjecAgent | BIPIA | Falsas alarmas |
|---|---:|---:|---:|---:|---:|---:|
| **Este modelo** | 141M | **61%** | **98%** | 86% | **82%** | 1,3% |
| Horizon Labs guard-base | 308M | 37% | 93% | **88%** | 66% | 2,5% |
| Horizon Labs guard-small | 141M | 37% | 93% | 87% | 58% | 1,7% |
| ProtectAI v2 | 184M | 7% | 48% | 82% | 56% | 26,9% |

Composición de los benchmarks empleados:

| Benchmark | Contenido | Ataques | Benignos |
|---|---|---:|---:|
| DTap (DecodingTrust agent platform) | Inyecciones de red team en registros de CRM, soporte, legal y flujos de trabajo | 523 | 815 |
| AgentDojo | Inyecciones en salidas de herramientas de workspace, Slack, viajes y banca | 850 | 119 |
| InjecAgent | Inyecciones en respuestas de herramientas | 1.530 | – |
| BIPIA | Instrucciones no relacionadas dentro de correos | 273 | 65 |

El autor indica que las métricas completas están en `evaluation/comparison.json` del repositorio. No se publican resultados de MMLU, HumanEval ni GSM8K, que no aplican a un clasificador.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,56 GB solo de pesos (140,6 M de parámetros × 4 bytes), más overhead de activaciones y del runtime.
- VRAM estimada en fp16/bf16: aproximadamente 0,28 GB de pesos, holgadamente por debajo de 1 GB en total.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y superiores; también es viable en CPU para volúmenes moderados.
- Despliegue: pipeline `text-classification` de `transformers`, Text Embeddings Inference (declarado compatible) y endpoints de Hugging Face. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DTap | AgentDojo | InjecAgent | BIPIA | Falsas alarmas | Licencia |
|---|---:|---|---:|---:|---:|---:|---:|---|
| **Record Injection Guard small** | 141M | 2.048 tokens por ventana | 61% | 98% | 86% | 82% | 1,3% | Apache 2.0 |
| Horizon Labs guard-base | 308M | no disponible | 37% | 93% | 88% | 66% | 2,5% | no disponible |
| Horizon Labs guard-small | 141M | no disponible | 37% | 93% | 87% | 58% | 1,7% | no disponible |
| ProtectAI v2 | 184M | no disponible | 7% | 48% | 82% | 56% | 26,9% | no disponible |

La comparativa se limita a los datos de la model card. No se dispone de información sobre la longitud de contexto ni la licencia de los modelos alternativos en la documentación proporcionada.

## Limitaciones y advertencias

- Falla el 39% de los ataques de DTap, principalmente los redactados como trabajo legal o de soporte ordinario.
- El ajuste fino redujo el recall en LLMail-Inject del 92% al 87% y aumentó las falsas alarmas en NotInject del 3,3% al 6,6%.
- Evalúa el registro de forma aislada: no distingue una instrucción legítima de una plantada cuando el texto es idéntico. El autor recomienda combinarlo con la identidad de quien escribió el registro y con la tarea encomendada al agente.
- Entrenado y evaluado mayoritariamente en inglés; el rendimiento en otros idiomas no está documentado.
- Ventana de 2.048 tokens: los registros más largos requieren el script de ventanas y pooling, lo que añade coste y complejidad operativa.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos (1,3% sobre el conjunto benigno de referencia) y falsos negativos, con impacto directo en la disponibilidad de flujos automatizados.
- Licencia Apache 2.0: permite uso comercial, pero los pesos derivan de un checkpoint mmBERT-small con licencia Apache 2.0 modificado; conviene revisar el archivo `LICENSE` del repositorio antes de producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente de las métricas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shoshkin/record-injection-guard-small
- AgentDojo: https://github.com/ethz-spylab/agentdojo
- InjecAgent: https://github.com/uiuc-kang-lab/InjecAgent
- BIPIA: https://github.com/microsoft/BIPIA
- Dataset LLMail-Inject: https://huggingface.co/datasets/microsoft/llmail-inject-challenge
- Dataset NotInject: https://huggingface.co/datasets/leolee99/NotInject

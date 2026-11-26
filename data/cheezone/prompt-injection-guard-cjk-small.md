# CheezOne/prompt-injection-guard-cjk-small

## Resumen

Prompt-injection-guard-cjk-small es un clasificador de texto de aproximadamente 140 millones de parámetros desarrollado por CheezOne, diseñado para detectar inyecciones de prompt, jailbreaks, extracción de system prompts y secretos, así como inyecciones indirectas ocultas en documentos o salidas de herramientas. Está construido sobre jhu-clsp/mmBERT-small, un encoder multilingüe de la familia ModernBERT, y cubre inglés, chino, japonés y coreano.

El modelo resuelve un problema concreto de seguridad en despliegues de LLM: la falta de guardrails eficaces en idiomas CJK. La mayoría de los clasificadores de prompt injection disponibles están entrenados solo en inglés, lo que los hace prácticamente inútiles en chino, japonés o coreano. Este modelo ofrece etiquetas compatibles (`SAFE` / `INJECTION`) con protectai/deberta-v3-base-prompt-injection-v2, lo que permite sustituirlo cambiando únicamente el identificador del modelo en el código existente.

Su relevancia actual radica en dos factores: por un lado, la licencia Apache-2.0 y el tamaño reducido (1,4 GB de repo) lo hacen desplegable en CPU y en el navegador mediante ONNX y transformers.js; por otro, incluye pesos en safetensors y ONNX (incluida una versión cuantizada), lo que facilita su integración en pipelines de guardrails tanto en servidor como en cliente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/mmBERT-small) |
| Parámetros totales | 140.642.306 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (se recomienda clasificar en fragmentos de ≤ 384 tokens) |
| Tipos de cuantización | ONNX cuantizado (int8, `onnx/model_quantized.onnx`); safetensors en precisión completa |
| Idiomas soportados | Inglés (en), chino (zh), japonés (ja), coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX, ONNX cuantizado |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer de tipo ModernBERT, concretamente un fine-tuning de jhu-clsp/mmBERT-small. Se trata de una arquitectura de clasificación de secuencias (text-classification) con dos etiquetas de salida: `SAFE` (índice 0) e `INJECTION` (índice 1). La etiqueta `INJECTION` agrupa inyecciones directas, jailbreaks, intentos de extracción de system prompt o secretos e inyecciones indirectas.

El entrenamiento combina múltiples conjuntos de datos: un corpus propio multilingüe (CheezOne/prompt-injection-jailbreak-chinese-japanese-korean-english), junto con datasets públicos como deepset/prompt-injections, jackhhao/jailbreak-classification, neuralchemy/Prompt-injection-dataset, TrustAIRLab/in-the-wild-jailbreak-prompts, Lakera/mosscap_prompt_injection, nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1 y reshabhs/SPML_Chatbot_Prompt_Injection. La model card no detalla el número exacto de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO; al ser un clasificador, el entrenamiento es supervisado sobre pares texto-etiqueta. La innovación principal es la cobertura multilingüe CJK con un modelo de tamaño reducido y la compatibilidad de etiquetas con protectai, que simplifica la migración.

## Capacidades

- Clasificación binaria de texto: distingue entre entrada segura (`SAFE`) y ataque (`INJECTION`).
- Detección de inyecciones directas de prompt.
- Detección de jailbreaks (intentos de eludir restricciones del modelo).
- Detección de extracción de system prompt y secretos.
- Detección de inyecciones indirectas ocultas en documentos, páginas web, correos, fragmentos de RAG o salidas de herramientas.
- Soporte multilingüe en inglés, chino, japonés y coreano.
- Etiquetas compatibles con protectai/deberta-v3-base-prompt-injection-v2 (`SAFE` / `INJECTION`), lo que permite sustitución directa.
- Ejecución en CPU mediante ONNX y en navegador/Node mediante transformers.js con cuantización int8.
- No soporta tool calling, agentes ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Guardrail de entrada en aplicaciones de chat: clasificar cada mensaje del usuario antes de enviarlo al LLM; si la etiqueta es `INJECTION`, bloquear o derivar a revisión. Adecuado por su latencia baja (≈100 ms por ejemplo en CPU compartida) y su compatibilidad con pipelines de transformers.
- Protección de agentes que leen contenido externo: clasificar páginas web, correos, tickets de Jira, exportaciones de Slack o fragmentos de RAG antes de que lleguen al modelo, detectando inyecciones indirectas. El modelo está entrenado explícitamente para este escenario.
- Sustitución directa de protectai en stacks existentes: al mantener las etiquetas `SAFE` / `INJECTION`, basta cambiar el model id en el código que ya comprueba `label == "INJECTION"`, sin reescribir la lógica de guardrails.
- Despliegue en el navegador o en el borde: con transformers.js y el ONNX int8, se puede ejecutar la clasificación en el cliente (por ejemplo, en una extensión o en una aplicación web) sin enviar el texto a un servidor, reduciendo latencia y exposición de datos.
- Moderación multilingüe en plataformas con usuarios de Asia Oriental: cubre chino, japonés y coreano donde protectai falla (recall de 20-33 % en chino frente al 82-87 % de este modelo en la tabla de FPR emparejado).
- Filtrado previo en pipelines de CI/CD para prompts: clasificar prompts de prueba o plantillas antes de desplegarlas en producción, detectando patrones de inyección en la documentación o en los ejemplos de few-shot.
- Auditoría de registros históricos: procesar logs de conversaciones para identificar intentos de jailbreak o extracción de secretos y generar métricas de seguridad.

## Benchmarks y rendimiento

La model card reporta resultados en dos regímenes: recall a tasas de falsos positivos (FPR) emparejadas (1 % / 3 % / 5 %) y F1 binario a umbral fijo 0,5.

Recall (%) a FPR emparejado (1 % / 3 % / 5 %), mismos 4.668 textos:

| Modelo | 中文 | 日本語 | 한국어 | English |
|---|---|---|---|---|
| Este modelo (141M) | 82,3 / 86,7 / 87,2 | 70,1 / 79,5 / 83,1 | 58,7 / 71,2 / 77,0 | 81,4 / 87,2 / 89,2 |
| Horizon-Labs/prompt-injection-guard-small | 76,6 / 84,7 / 86,4 | 54,0 / 69,0 / 75,1 | 13,7 / 25,9 / 30,5 | 57,3 / 75,6 / 85,0 |
| Horizon-Labs/prompt-injection-guard-base | 86,1 / 89,9 / 90,5 | 49,6 / 62,9 / 67,6 | 14,2 / 25,3 / 37,2 | 60,7 / 81,1 / 87,4 |
| protectai/deberta-v3-base-prompt-injection-v2 | 20,2 / 28,9 / 33,5 | 12,7 / 19,9 / 26,3 | 2,6 / 6,7 / 14,2 | 41,0 / 58,9 / 67,6 |

F1 / FPR (%) a umbral 0,5 en conjunto reservado (3.245 mensajes y documentos):

| Modelo | 中文 | 日本語 | 한국어 | English | ms/ejemplo (CPU compartida) |
|---|---|---|---|---|---|
| Este modelo (141M) | 87,6 / 13,9 | 87,3 / 8,8 | 84,6 / 10,8 | 92,3 / 8,5 | 101,4 |
| NeuralTrust prompt-guard-oss-small (141M) | 46,0 / 1,1 | 45,6 / 0,2 | 38,9 / 4,5 | 51,6 / 0,3 | 92,6 |
| devndeploy bert-prompt-injection-detector (178M) | 68,3 / 70,6 | 62,5 / 87,2 | 60,3 / 96,8 | 71,8 / 73,7 | 167,7 |
| Patronus wolf-defender (308M) | 59,9 / 0,0 | 77,0 / 0,6 | 58,0 / 1,3 | 69,7 / 0,3 | 217,3 |
| ProtectAI deberta-v3-base-prompt-injection-v2 (184M) | 68,1 / 34,1 | 60,0 / 21,6 | 58,6 / 33,5 | 69,5 / 16,9 | 392,1 |

F1 / FPR (%) en conjuntos de test públicos en inglés:

| Modelo | deepset test | jackhhao test | neuralchemy test | ms/ejemplo |
|---|---|---|---|---|
| Este modelo (141M) | 89,9 / 0,0 | 89,0 / 2,8 | 96,4 / 4,6 | 101,4 |
| NeuralTrust prompt-guard-oss-small (141M) | 37,8 / 0,0 | 83,2 / 1,6 | 87,0 / 5,1 | 92,6 |
| devndeploy bert-prompt-injection-detector (178M) | 99,2 / 0,0 | 49,5 / 92,5 | 89,4 / 27 | no disponible |

Advertencias del autor: los textos zh/ja/ko del conjunto reservado fueron generados por la misma familia de LLM que los datos de entrenamiento; parte de las filas en inglés son splits de test de datasets públicos cuyos splits de train se usaron en entrenamiento. Ambos sesgos favorecen a este modelo, por lo que recomienda evaluar sobre tráfico propio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (≈560 MB de pesos) y aproximadamente 150-200 MB en ONNX int8.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobredimensionada; el modelo está pensado para CPU y entornos sin GPU.
- Cabe en cualquier GPU consumer e incluso en CPU de un solo núcleo con latencia aceptable (≈100 ms por ejemplo reportado en CPU compartida).
- Opciones de despliegue: transformers (pipeline de text-classification), ONNX Runtime, optimum, transformers.js (navegador/Node), Text Embeddings Inference (según tags), endpoints compatibles.
- Throughput estimado: no disponible de forma agregada; la model card solo reporta latencia por ejemplo (101,4 ms de media en CPU compartida).

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Enfoque | Rendimiento relativo |
|---|---|---|---|---|---|
| CheezOne/prompt-injection-guard-cjk-small | 141M | en, zh, ja, ko | Apache-2.0 | Clasificador ModernBERT multilingüe | Mejor recall en ja/ko/en a FPR emparejado; 3-4 puntos por debajo de Horizon-Labs base en chino |
| Horizon-Labs/prompt-injection-guard-base | No disponible | en, zh, ja, ko | No disponible | Clasificador | Mejor en chino (86,1-90,5 % recall); peor en ja/ko/en |
| protectai/deberta-v3-base-prompt-injection-v2 | 184M | en (solo inglés) | No disponible | Clasificador DeBERTa | Muy inferior en CJK; etiquetas compatibles |
| NeuralTrust prompt-guard-oss-small | 141M | No disponible | No disponible | Clasificador | Mucho peor en CJK; similar en inglés |

## Limitaciones y advertencias

- Sesgos de evaluación: el conjunto reservado zh/ja/ko fue generado por la misma familia de LLM que los datos de entrenamiento, y parte del test en inglés proviene de datasets cuyos splits de train se usaron. Los resultados favorecen al modelo; hay que evaluar sobre tráfico propio.
- Riesgo de falsos positivos: a umbral 0,5 el FPR en el conjunto reservado es del 8,5-13,9 % según idioma, lo que puede bloquear consultas legítimas; se recomienda ajustar el umbral según el coste de cada tipo de error.
- Riesgo de falsos negativos: el recall en coreano es el más bajo (58,7 % a FPR del 1 %), por lo que ataques en coreano pueden pasar sin detectar.
- Idioma: solo cubre en, zh, ja, ko; no hay soporte declarado para otras lenguas.
- Contexto: la model card recomienda clasificar en fragmentos de ≤ 384 tokens; documentos largos deben dividirse, lo que puede perder contexto entre fragmentos.
- Alucinación: al ser un clasificador, no genera texto, pero puede producir clasificaciones erróneas con confianza alta; no debe usarse como único mecanismo de seguridad.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento si se redistribuye el modelo.
- Producción: el autor no garantiza cobertura frente a ataques novedosos ni frente a inyecciones en idiomas no cubiertos; se recomienda combinarlo con otras defensas (sanitización, límites de permisos, monitorización).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CheezOne/prompt-injection-guard-cjk-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Modelo de referencia con etiquetas compatibles: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
- Dataset propio: https://huggingface.co/datasets/CheezOne/prompt-injection-jailbreak-chinese-japanese-korean-english
- Dataset deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- Dataset jackhhao/jailbreak-classification: https://huggingface.co/datasets/jackhhao/jailbreak-classification
- Dataset neuralchemy/Prompt-injection-dataset: https://huggingface.co/datasets/neuralchemy/Prompt-injection-dataset
- Dataset TrustAIRLab/in-the-wild-jailbreak-prompts: https://huggingface.co/datasets/TrustAIRLab/in-the-wild-jailbreak-prompts
- Dataset Lakera/mosscap_prompt_injection: https://huggingface.co/datasets/Lakera/mosscap_prompt_injection
- Dataset nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1: https://huggingface.co/datasets/nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1
- Dataset reshabhs/SPML_Chatbot_Prompt_Injection: https://huggingface.co/datasets/reshabhs/SPML_Chatbot_Prompt_Injection
- Script de evaluación (referenciado en la model card): scripts/pi_curve.py y scripts/pi_bench.py dentro del repositorio del modelo

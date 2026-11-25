# patronus-studio/wolf-defender-prompt-injection-small

## Resumen

Wolf Defender Prompt Injection Small es un clasificador binario de seguridad diseñado para detectar ataques de inyección de prompts (directos e indirectos) y jailbreaks en aplicaciones basadas en modelos de lenguaje. Lo desarrolla Patronus Studio y se distribuye con licencia Apache 2.0. El modelo parte de jhu-clsp/mmBERT-small, un encoder multilingüe de tipo ModernBERT, y se ha afinado específicamente para la tarea de moderación de entradas en pipelines de LLM, agentes y sistemas RAG.

Con 140.642.306 parámetros y un pipeline de `text-classification`, el modelo está pensado para despliegue en CPU y entornos edge: el repositorio incluye pesos en safetensors, ONNX y joblib, además de variantes cuantizadas. Su ventana de contexto y su arquitectura encoder-only lo hacen adecuado para clasificar prompts individuales o fragmentos de documentos recuperados antes de que lleguen al modelo generativo, no para generación de texto.

La relevancia actual del modelo radica en la proliferación de agentes que consumen contenido externo (correo, resultados de búsqueda, documentos RAG) y en la necesidad de guardrails ligeros que no añadan latencia significativa. La versión v2.2 y la integración en proyectos como Apache Camel, TrustyAI o AI-Parrot indican adopción en el ecosistema de seguridad de LLM, aunque la información pública sobre benchmarks propios es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (mmBERT-small), encoder transformer, clasificación de secuencias |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX FP32 y variantes cuantizadas (según tags: quantized, onnxruntime); no se detallan los esquemas exactos |
| Idiomas soportados | inglés (en), alemán (de); el modelo base mmBERT es multilingüe pero la model card solo declara en y de |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, joblib |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, concretamente un ajuste fino de jhu-clsp/mmBERT-small. Se entrena como clasificador binario (secuencia → clase) para distinguir entre entradas benignas y ataques de inyección de prompts o jailbreak. La arquitectura encoder-only permite inferencia rápida en CPU, a diferencia de los clasificadores basados en LLM generativos.

El entrenamiento combina una veintena de datasets públicos de seguridad y prompts, entre ellos deepset/prompt-injections, jackhhao/jailbreak-classification, Lakera/mosscap_prompt_injection, allenai/wildjailbreak, microsoft/llmail-inject-challenge y varios conjuntos multilingües (ruso, malayo, chino). También se incluyen datos de instrucciones y conversación (HuggingFaceH4/ultrachat_200k, VMware/open-instruct, iamtarun/code_instructions_120k_alpaca) para reducir falsos positivos sobre entradas legítimas. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta por proporción ni si se aplicó RLHF o DPO; al ser un clasificador, el ajuste típico sería supervisado con función de pérdida de entropía cruzada.

## Capacidades

- Clasificación binaria de prompts como benignos o maliciosos (inyección de prompts directa e indirecta).
- Detección de jailbreaks y ataques de ingeniería social dirigidos a agentes.
- Detección de inyecciones indirectas en contenido recuperado (RAG, correo, resultados de herramientas).
- Soporte multilingüe declarado para inglés y alemán, con entrenamiento que incluye datos en otros idiomas.
- Inferencia en CPU y entornos on-device gracias a los formatos ONNX y cuantizados.
- Integración como guardrail en pipelines de LLM, agentes y sistemas de tool calling.
- No genera texto ni razona de forma multi-step: es exclusivamente un clasificador.

## Casos de uso

- Filtrado de entrada en asistentes conversacionales: clasificar cada mensaje del usuario antes de enviarlo al LLM para bloquear intentos de jailbreak o inyección, con latencia de milisegundos en CPU.
- Protección de pipelines RAG: evaluar los fragmentos de documentos recuperados antes de incluirlos en el contexto del modelo, detectando inyecciones indirectas embebidas en el contenido.
- Seguridad de agentes con acceso a herramientas: inspeccionar las respuestas de APIs externas y correos antes de que el agente las procese, mitigando ataques de ingeniería social automatizados.
- Guardrail en aplicaciones edge o on-premise: desplegar el modelo en ONNX Runtime sobre CPU en entornos sin GPU, donde un clasificador basado en LLM sería inviable por coste o latencia.
- Moderación en plataformas multilingües: aplicar el detector a entradas en inglés y alemán, con capacidad adicional para otros idiomas gracias a la base mmBERT.
- Capa de defensa en profundidad: combinar el clasificador con otras medidas (sanitización, permisos de herramientas) para reducir la superficie de ataque en sistemas de agentes autónomos.
- Evaluación de seguridad en CI/CD: ejecutar el modelo sobre conjuntos de prompts de prueba para detectar regresiones en las defensas de una aplicación antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios (F1, accuracy, precision, recall) en la información disponible. La model card incluye una comparación de latencia y falsos positivos reportada por un desarrollador externo (AI-Parrot) sobre una prueba pequeña y específica de su aplicación, no un benchmark estandarizado:

| Modelo | Latencia p50 | Falsos positivos benignos / 15 | Falsos positivos benignos en español / 10 | Falsos negativos de ataque / 10 |
|---|---:|---:|---:|---:|
| DeBERTa v1 vía Pytector | 86 ms | 8 | 8 | 2 |
| DeBERTa v2 ONNX | 24 ms | 7 | 7 | 1 |
| gincioks/cerberus-distilbert-base-un-v1.0-onnx | 9 ms | 9 | 7 | 1 |
| Wolf Defender Small ONNX FP32 | 12 ms | 0 | 0 | 1 |

Estos datos provienen de una prueba de aplicación concreta y no deben interpretarse como rendimiento general del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (140,6 M de parámetros); en FP16 aproximadamente 0,3 GB de pesos, más activaciones mínimas.
- GPU recomendadas: no requiere GPU; funciona en CPU. En GPU, cualquier tarjeta con al menos 1-2 GB de memoria libre es suficiente (RTX 3060, RTX 4090, A100, H100).
- Cabe en cualquier GPU consumer y en dispositivos edge; también en CPU sin aceleración.
- Opciones de despliegue: transformers, ONNX Runtime, Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles; joblib para pipelines scikit-learn.
- Latencia y throughput: la prueba externa reporta 12 ms p50 en ONNX FP32 en su entorno; no hay cifras oficiales de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wolf Defender Prompt Injection Small | 140,6 M | no disponible | Clasificación de inyección/jailbreak | Apache 2.0 | Hugging Face, ONNX, joblib |
| DeBERTa v1/v2 (vía Pytector) | no disponible | no disponible | Detección de inyección | según variante | Hugging Face |
| gincioks/cerberus-distilbert-base-un-v1.0-onnx | no disponible | no disponible | Detección de inyección | no disponible | Hugging Face, ONNX |
| Red Hat AI Wolf Defender | no disponible | no disponible | Detección de inyección | no disponible | Hugging Face (RedHatAI) |

No se dispone de datos de rendimiento estandarizados para una comparación rigurosa; la única comparación disponible es la prueba de latencia y falsos positivos de la sección anterior.

## Limitaciones y advertencias

- Solo clasifica; no genera texto ni ofrece explicaciones de la decisión.
- Idiomas declarados limitados a inglés y alemán; el rendimiento en otros idiomas no está garantizado pese a la base multilingüe.
- Riesgo de falsos negativos ante ataques novedosos o codificados (ofuscación, homoglifos, payloads multi-turno) no representados en los datos de entrenamiento.
- Riesgo de falsos positivos en entradas legítimas que contengan instrucciones o texto con apariencia de ataque.
- No se especifican sesgos conocidos ni evaluaciones de robustez adversarial en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías de seguridad; debe usarse como una capa más de defensa, no como única protección.
- Los datos de latencia provienen de una prueba externa y específica, no de un benchmark oficial.
- La fecha de creación del repositorio (2026-04-15) y la actualización (2026-11-24) figuran en la información; verificar la versión fijada con `revision` en producción.

## Enlaces

- Hugging Face: https://huggingface.co/patronus-studio/wolf-defender-prompt-injection-small
- Página de producto: https://patronus.studio/product/ai-models
- Campaña de financiación: https://manifund.org/projects/an-open-weight-cpu-efficient-ai-security-model-for-multi-turn-agent-security
- Integración Apache Camel: https://camel.apache.org/components/next/others/semantic-wolf-defender.html
- Integración TrustyAI: https://github.com/trustyai-explainability/trustyai-service-operator/blob/main/config/configmaps/nemo-guardrails/default-guardrails-injection.yaml
- Integración AI-Parrot: https://github.com/phenobarbital/ai-parrot/blob/main/docs/security/onnx-injection-guardrail.md
- Integración Delphi Security xaIDR: https://github.com/delphisecurity/xaidr/blob/main/xaidr/scanner/nano.py
- Personaxis: https://github.com/personaxis/personaxis/blob/main/packages/core/src/judge/output-scan.ts
- Wanaku: https://github.com/wanaku-ai/wanaku-barn/blob/main/apps/ui/admin/src/Pages/SemanticRouters/expertCatalog.ts
- Mygentic Cello: https://github.com/Mygentic-AI/cello-client/blob/main/core/gateway/src/detect/screener-model-manifest.ts
- Red Hat AI (variante): https://huggingface.co/RedHatAI/wolf-defender-prompt-injection
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small

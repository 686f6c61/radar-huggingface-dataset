# ITLL/wolf-defender-prompt-injection

## Resumen

Wolf Defender Prompt Injection es un clasificador binario de seguridad, desarrollado por ITLL y distribuido a través de la plataforma Patronus, disenado para detectar intentos de prompt injection y jailbreak en entradas de texto antes de que alcancen un modelo de lenguaje. El modelo parte de la base jhu-clsp/mmBERT-base, un encoder ModernBERT multilingue, y se ha afinado especificamente para la tarea de sequence-classification con etiqueta binaria (seguro / malicioso). Su relevancia actual reside en que cubre un hueco critico en el despliegue de agentes y sistemas RAG: la filtracion de contenido no confiable (documentos recuperados, salidas de herramientas, correos, paginas web) que puede contener instrucciones ocultas.

El modelo tiene 307,5 millones de parametros totales, un contexto derivado de la arquitectura ModernBERT de mmBERT (no se especifica explicitamente la longitud en la informacion disponible, pero mmBERT-base opera con ventanas de 8192 tokens) y esta disponible tanto en safetensors como en ONNX, incluyendo variantes cuantizadas para inferencia en CPU y en dispositivo. Soporta oficialmente aleman e ingles, aunque la model card menciona pruebas informales con entradas benignas en espanol y datasets multilingues en su mezcla de entrenamiento.

La propuesta de valor se centra en eficiencia: la model card reporta latencias de 12 ms p50 para la variante Small ONNX FP32 y mejoras de hasta 5x frente a alternativas como DeBERTa en pruebas de integradores (AI-Parrot). Esto lo posiciona como una opcion practica para guardrails de baja latencia en produccion, con licencia Apache 2.0 y despliegue local sin dependencia de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, base jhu-clsp/mmBERT-base) |
| Parametros totales | 307.531.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (mmBERT-base subyacente soporta ventanas largas) |
| Tipos de cuantizacion | ONNX FP32, variantes cuantizadas (ONNX quantized), Edge; no se detalla la lista completa de precisiones |
| Idiomas soportados | aleman (de), ingles (en); datasets de entrenamiento incluyen contenido multilingue adicional |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT, construido sobre jhu-clsp/mmBERT-base, un modelo multilingue que emplea atencion lineal y rotaPE para manejar contextos largos con coste computacional reducido. La cabeza de clasificacion es una capa de sequence-classification binaria que produce una probabilidad de que el texto de entrada contenga una instruccion maliciosa (prompt injection directa o indirecta, jailbreak, ataques de ingenieria social contra agentes). El modelo esta empaquetado tambien en formato ONNX para ejecucion con onnxruntime en CPU.

El entrenamiento combina una mezcla extensa de datasets publicos de Hugging Face, entre los que se incluyen colecciones especificas de prompt injection (deepset/prompt-injections, Lakera/mosscap_prompt_injection, jayavibhav/prompt-injection, xTRam1/safe-guard-prompt-injection, Antijection/prompt-injection-dataset-v1), jailbreak (jackhhao/jailbreak-classification, allenai/wildjailbreak), ataques a agentes y herramientas (interstellarninja/tool-calls-multiturn, AlignmentLab-AI/agentcode, alwaysfurther/agent-social-eng-attacks-sample, microsoft/llmail-inject-challenge), contenido multilingue (gretelai/synthetic_multilingual_llm_prompts, rikka-snow/prompt-injection-multilingual, Scicom-intl/Malaysian-Prompt-Injection, FaustSS/russian_prompt_injections, Eric12132/prompt-injections-benchmark-chinese, yanismiraoui/prompt_injections) y datos benignos de instruccion y conversacion (HuggingFaceH4/ultrachat_200k, VMware/open-instruct, akoksal/LongForm, iamtarun/code_instructions_120k_alpaca) para reducir falsos positivos. No se detalla en la informacion proporcionada el numero exacto de tokens de entrenamiento, la composicion porcentual del dataset ni si se aplico RLHF o DPO (no procede para un clasificador). La innovacion principal es la combinacion de deteccion de inyeccion directa e indirecta con un enfoque de bajo coste computacional y despliegue en CPU.

## Capacidades

- Clasificacion binaria de texto: distingue entradas benignas de entradas que contienen prompt injection, jailbreak o instrucciones maliciosas.
- Deteccion de prompt injection indirecta: identifica instrucciones ocultas en documentos recuperados, paginas web, correos electronicos y salidas de herramientas de agentes.
- Deteccion de jailbreak: reconoce patrones de evasion de politicas de seguridad en modelos de lenguaje.
- Deteccion de ataques de ingenieria social contra agentes: cubre datasets especificos de ataques sociales y de cadena de herramientas.
- Soporte multilingue: oficialmente aleman e ingles; el entrenamiento incluye datos en otros idiomas (chino, ruso, malayo, espanol en pruebas) aunque no se garantiza rendimiento equivalente.
- Inferencia en CPU y en dispositivo: variantes ONNX y cuantizadas para ejecucion local con onnxruntime.
- Integracion como guardrail: compatible con frameworks como NeMo Guardrails (via TrustyAI), Apache Camel, AI-Parrot y Delphi Security xaIDR.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; su funcion es exclusivamente de filtrado y clasificacion.

## Casos de uso

- Filtrado de entradas de usuario en chatbots: el clasificador se ejecuta antes del LLM para bloquear intentos de jailbreak o inyeccion directa, con latencias de 12 ms p50 en CPU (variante Small ONNX), lo que permite aplicarlo en cada turno sin penalizar la experiencia.
- Proteccion de pipelines RAG: se analizan los documentos recuperados antes de insertarlos en el contexto del modelo, detectando instrucciones ocultas en paginas web, PDFs o bases de conocimiento; es adecuado porque el modelo esta entrenado especificamente con datasets de inyeccion indirecta.
- Seguridad de agentes con herramientas: se inspeccionan las salidas de APIs, correos y resultados de busqueda antes de que el agente las procese, cubriendo ataques de cadena de herramientas y ingenieria social (datasets interstellarninja/tool-calls-multiturn y microsoft/llmail-inject-challenge).
- Guardrail en gateways de LLM: integracion como capa de clasificacion en Apache Camel, NeMo Guardrails o AI-Parrot para bloquear peticiones maliciosas de forma centralizada y auditable.
- Moderacion de contenido en plataformas multilingues: con soporte aleman e ingles y entrenamiento con datos multilingues, puede filtrar entradas en entornos donde conviven ambos idiomas, reduciendo falsos positivos en entradas benignas (segun pruebas de AI-Parrot, 0 falsos positivos en 15 entradas benignas y 0 en 10 entradas benignas en espanol).
- Despliegue en dispositivos con recursos limitados: las variantes ONNX cuantizadas permiten ejecutar el filtro en CPU o en hardware de borde, sin GPU, lo que facilita guardrails en entornos on-premise o embebidos.
- Analisis de correos y contenido no confiable en flujos automatizados: clasificacion de mensajes entrantes para detectar instrucciones maliciosas dirigidas a asistentes de correo (dataset jason23322/high-accuracy-email-classifier y microsoft/llmail-inject-challenge).

## Benchmarks y rendimiento

La model card reporta una tabla de latencia y falsos positivos de una prueba de integrador (AI-Parrot) con la variante Wolf Defender Small ONNX FP32, no benchmarks estandar de clasificacion (MMLU, HumanEval, etc.):

| Modelo | Latencia p50 | Falsos positivos benignos / 15 | Falsos positivos benignos en espanol / 10 | Falsos negativos de ataque / 10 |
|---|---:|---:|---:|---:|
| DeBERTa v1 via Pytector | 86 ms | 8 | 8 | 2 |
| DeBERTa v2 ONNX | 24 ms | 7 | 7 | 1 |
| gincioks/cerberus-distilbert-base-un-v1.0-onnx | 9 ms | 9 | 7 | 1 |
| Wolf Defender Small ONNX FP32 | 12 ms | 0 | 0 | 1 |
| Wolf Defender Edge | no disponible | no disponible | no disponible | no disponible |

Estos datos provienen de una prueba pequena y especifica de la aplicacion, con hardware y configuracion no especificados; no constituyen una evaluacion exhaustiva. No se han publicado resultados de benchmarks estandar (F1, accuracy, precision, recall, ROC-AUC) en la informacion disponible, aunque la model card declara esas metricas como objetivo de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 307,5 millones de parametros, en FP32 el modelo ocupa aproximadamente 1,2 GB de memoria, y en cuantizaciones de 8 bits alrededor de 0,3-0,4 GB.
- GPU recomendadas: no especificadas; el modelo esta disenado para inferencia en CPU, por lo que cualquier GPU consumer (RTX 4090, RTX 3090) puede ejecutarlo con holgura, pero no es requisito.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 2 GB de VRAM en FP32 o menos de 1 GB en cuantizado.
- Opciones de despliegue: transformers (safetensors), onnxruntime (ONNX, incluida variante cuantizada), text-embeddings-inference (segun tags), endpoints compatibles; integraciones con Apache Camel, NeMo Guardrails (TrustyAI), AI-Parrot y Delphi Security xaIDR.
- Latencia y throughput estimados: 12 ms p50 para Wolf Defender Small ONNX FP32 en CPU segun la prueba de AI-Parrot; no se dispone de throughput (peticiones por segundo) ni de latencia para la variante completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wolf Defender Prompt Injection | 307,5 M | no disponible | Clasificador ModernBERT multilingue para injection/jailbreak | Apache 2.0 | Hugging Face, ONNX, Red Hat AI |
| DeBERTa v2 ONNX (via Pytector) | no disponible | no disponible | Clasificador de injection basado en DeBERTa | no disponible | ONNX |
| gincioks/cerberus-distilbert-base-un-v1.0-onnx | no disponible (DistilBERT base) | no disponible | Clasificador DistilBERT para injection | no disponible | ONNX |
| Lakera/mosscap_prompt_injection (dataset, no modelo comparable directo) | no disponible | no disponible | Dataset de referencia para entrenamiento | no disponible | Hugging Face |

La comparativa se limita a los modelos citados en la prueba de AI-Parrot; no se dispone de datos de rendimiento estandar (F1, accuracy) para establecer una comparacion cuantitativa rigurosa con alternativas como Llama Guard, Prompt Guard de Meta o modelos de guardrail generativos.

## Limitaciones y advertencias

- No es un modelo generativo: no puede razonar, generar texto ni ejecutar tool calling; su unica salida es una etiqueta binaria de clasificacion.
- Riesgo de falsos negativos: la prueba de AI-Parrot reporta 1 falso negativo de ataque sobre 10, lo que implica que algunos ataques pueden pasar el filtro; no debe usarse como unica capa de seguridad.
- Riesgo de falsos positivos en dominios no cubiertos: aunque la prueba reporta 0 falsos positivos en entradas benignas (incluidas 10 en espanol), el modelo solo declara oficialmente aleman e ingles; el rendimiento en otros idiomas no esta garantizado.
- Sesgos de entrenamiento: la mezcla de datasets publicos puede heredar sesgos de sus fuentes (por ejemplo, sobrerrepresentacion de patrones de ataque en ingles) y no se documenta una evaluacion de sesgos.
- Limitaciones de contexto: no se especifica la longitud maxima de entrada en la informacion disponible; textos muy largos pueden requerir truncamiento o fragmentacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se ofrece garantia de robustez frente a ataques adversariales adaptativos.
- Caveat para produccion: el modelo esta pensado como capa de defensa en profundidad; debe combinarse con otras medidas (validacion de salidas, permisos minimos de herramientas, monitorizacion) y recalibrarse con datos del dominio de despliegue.
- Datos de evaluacion limitados: las metricas reportadas provienen de una prueba de integrador con muestras pequenas y hardware no especificado; no hay benchmarks estandar publicados.

## Enlaces

- Hugging Face: https://huggingface.co/ITLL/wolf-defender-prompt-injection
- Red Hat AI (copia del modelo): https://huggingface.co/RedHatAI/wolf-defender-prompt-injection
- Pagina de producto Patronus: https://patronus.studio/product/ai-models
- Campana Manifund: https://manifund.org/projects/an-open-weight-cpu-efficient-ai-security-model-for-multi-turn-agent-security
- Apache Camel (integracion): https://camel.apache.org/components/next/others/semantic-wolf-defender.html
- TrustyAI (NeMo Guardrails): https://github.com/trustyai-explainability/trustyai-service-operator/blob/main/config/configmaps/nemo-guardrails/default-guardrails-injection.yaml
- AI-Parrot (guardrail ONNX): https://github.com/phenobarbital/ai-parrot/blob/main/docs/security/onnx-injection-guardrail.md
- Delphi Security xaIDR: https://github.com/delphisecurity/xaidr/blob/main/xaidr/scanner/nano.py
- Personaxis: https://github.com/personaxis/personaxis/blob/main/packages/core/src/judge/output-scan.ts
- Wanaku: https://github.com/wanaku-ai/wanaku-barn/blob/main/apps/ui/admin/src/Pages/SemanticRouters/expertCatalog.ts
- Mygentic Cello: https://github.com/Mygentic-AI/cello-client/blob/main/core/gateway/src/detect/screener-model-manifest.ts
- Modelo base mmBERT: https://huggingface.co/jhu-clsp/mmBERT-base

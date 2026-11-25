# patronus-studio/wolf-defender-prompt-injection

## Resumen

Wolf Defender Prompt Injection es un clasificador binario de texto disenado para detectar intentos de prompt injection y jailbreak en entradas dirigidas a modelos de lenguaje y agentes autonomos. Lo desarrolla Patronus Studio y se construye sobre el modelo base jhu-clsp/mmBERT-base, un transformer tipo ModernBERT multilingue de aproximadamente 307,5 millones de parametros. Su funcion es actuar como guardrail de seguridad: recibe un texto (prompt de usuario, contenido recuperado de un RAG, salida de una herramienta o resultado de una busqueda web) y devuelve una etiqueta que indica si contiene un ataque de inyeccion o no.

La relevancia actual del modelo radica en que los agentes basados en LLM procesan cada vez mas contenido no confiable (documentos, correos, respuestas de APIs, paginas web) y son vulnerables a instrucciones maliciosas embebidas en ese contenido. Wolf Defender ofrece una capa de filtrado ligera que puede ejecutarse en CPU, con variantes ONNX cuantizadas y un enfoque explicito en inferencia local y en el despliegue dentro de pipelines de agentes. La version documentada es la v2.2, con licencia Apache 2.0 y soporte declarado de ingles y aleman, aunque su base mmBERT es multilingue.

El modelo acumula mas de 10.000 descargas y aparece integrado en proyectos como Apache Camel, TrustyAI, AI-Parrot, Delphi Security xaIDR, Personaxis, Wanaku y Mygentic Cello, ademas de estar redistribuido por Red Hat AI en Hugging Face. Esa adopcion en herramientas de seguridad y orquestacion de agentes lo situa como una pieza practica dentro del ecosistema de guardrails open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ModernBERT (base: jhu-clsp/mmBERT-base), clasificacion de secuencias binaria |
| Parametros totales | 307.531.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX FP32 y variantes cuantizadas (ONNX quantized); cuantizaciones adicionales no disponibles |
| Idiomas soportados | aleman (de), ingles (en); base mmBERT multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencias construido sobre mmBERT-base, un encoder transformer de la familia ModernBERT adaptado a entorno multilingue. La cabeza de clasificacion es binaria: distingue entre entrada benigna y entrada con intento de prompt injection o jailbreak. El repositorio incluye pesos en safetensors para transformers y exportaciones ONNX, incluidas versiones cuantizadas orientadas a inferencia en CPU y en dispositivo.

El entrenamiento combina un conjunto amplio de datasets publicos, entre ellos deepset/prompt-injections, jackhhao/jailbreak-classification, Lakera/mosscap_prompt_injection, microsoft/llmail-inject-challenge, allenai/wildjailbreak, xTRam1/safe-guard-prompt-injection, imoxto/prompt_injection_cleaned_dataset-v2 y varios corpus multilingues (chino, malayo, ruso, asi como gretelai/synthetic_multilingual_llm_prompts). Tambien se incluyen datos de instrucciones y conversacion (HuggingFaceH4/ultrachat_200k, VMware/open-instruct, akoksal/LongForm, iamtarun/code_instructions_120k_alpaca) y conjuntos orientados a agentes y tool calling (interstellarninja/tool-calls-multiturn, AlignmentLab-AI/agentcode, alwaysfurther/agent-social-eng-attacks-sample). La model card no detalla el numero exacto de tokens de entrenamiento, la composicion porcentual del dataset ni si se aplicaron fases de RLHF o DPO; esos datos figuran como no disponibles. La model card menciona deteccion de inyeccion directa e indirecta, lo que sugiere entrenamiento especifico sobre contenido no confiable embebido en documentos, correos y resultados de herramientas.

## Capacidades

- Clasificacion binaria de prompt injection y jailbreak en texto de entrada.
- Deteccion de inyeccion directa (instrucciones maliciosas del usuario) e indirecta (instrucciones embebidas en contenido recuperado, correos, documentos o salidas de herramientas).
- Soporte multilingue declarado para ingles y aleman, con base mmBERT que amplia cobertura a otros idiomas.
- Integracion como guardrail en pipelines de agentes, RAG y tool calling.
- Exportaciones ONNX y variantes cuantizadas para inferencia local en CPU y en dispositivo.
- Compatibilidad con text-embeddings-inference y endpoints compatibles segun los tags del repositorio.
- No genera texto: es exclusivamente un clasificador de seguridad.

## Casos de uso

- Filtrado de entrada en agentes autonomos: cada mensaje del usuario se pasa por Wolf Defender antes de llegar al LLM; si se clasifica como inyeccion, se bloquea o se marca para revision. Es adecuado por su baja latencia en CPU y su integracion ONNX.
- Proteccion de pipelines RAG: los fragmentos recuperados de bases vectoriales o documentos externos se clasifican antes de insertarse en el contexto del modelo, mitigando inyeccion indirecta embebida en el corpus.
- Seguridad en tool calling: las respuestas de APIs, correos o resultados de busqueda que el agente va a interpretar como instrucciones se validan con el clasificador para evitar que una herramienta comprometida secuestre el flujo del agente.
- Guardrail en atencion al cliente automatizada: filtrado de mensajes de usuarios en chats multi-turno para detectar intentos de jailbreak o manipulacion del asistente antes de procesarlos.
- Moderacion en plataformas de contenido generado: clasificacion de prompts enviados a APIs publicas de LLM para bloquear intentos de extraccion de system prompts o de elusion de politicas.
- Cumplimiento y auditoria de seguridad: registro y etiquetado de trafico sospechoso en despliegues empresariales, con integraciones ya existentes en Apache Camel, TrustyAI y Red Hat AI.
- Despliegue en dispositivo o edge: las variantes ONNX cuantizadas permiten ejecutar el filtro en entornos sin GPU, como gateways locales o clientes de escritorio.

## Benchmarks y rendimiento

La model card incluye una comparacion de latencia y falsos positivos reportada por el desarrollador de AI-Parrot, sobre una muestra pequena y especifica de su aplicacion, usando Wolf Defender Small ONNX FP32:

| Modelo | Latencia p50 | Falsos positivos benignos / 15 | Falsos positivos benignos en espanol / 10 | Falsos negativos de ataque / 10 |
|---|---:|---:|---:|---:|
| DeBERTa v1 via Pytector | 86 ms | 8 | 8 | 2 |
| DeBERTa v2 ONNX | 24 ms | 7 | 7 | 1 |
| gincioks/cerberus-distilbert-base-un-v1.0-onnx | 9 ms | 9 | 7 | 1 |
| Wolf Defender Small ONNX FP32 | 12 ms | 0 | 0 | 1 |
| Wolf Defender Edge | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) ni metricas agregadas de F1, precision, recall o ROC-AUC sobre los conjuntos de evaluacion del modelo. La model card declara esas metricas como parte de los metadatos, pero no presenta sus valores.

## Requisitos de hardware

- VRAM estimada: con 307,5 millones de parametros, la inferencia en FP16 requiere aproximadamente 0,6 GB de pesos; en FP32, alrededor de 1,2 GB. Las variantes ONNX cuantizadas reducen aun mas el consumo.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, etc.); tambien funciona en GPU de datacenter (A100, H100) sin aprovechar su capacidad, dado el reducido tamano del modelo.
- Cabe holgadamente en GPU consumer e incluso en CPU: las exportaciones ONNX estan pensadas para inferencia local y en dispositivo.
- Opciones de despliegue: transformers, ONNX Runtime, text-embeddings-inference y endpoints compatibles; integraciones documentadas con Apache Camel, TrustyAI, AI-Parrot, Delphi Security xaIDR, Personaxis, Wanaku y Mygentic Cello. No se documenta soporte explicito de vLLM, llama.cpp u Ollama.
- Latencia y throughput: la unica medicion disponible es la reportada por AI-Parrot, con 12 ms de latencia p50 para la variante Small ONNX FP32. El desarrollador de AI-Parrot afirma una aceleracion de 5x frente a otros modelos en sus pruebas. No hay datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Wolf Defender Prompt Injection | 307,5 M | no disponible | Apache 2.0 | Clasificador de prompt injection y jailbreak, ONNX, CPU | Hugging Face, Red Hat AI |
| DeBERTa v2 ONNX (referencia AI-Parrot) | no disponible | no disponible | no disponible | Clasificador de injection via Pytector | ONNX |
| gincioks/cerberus-distilbert-base-un-v1.0-onnx | no disponible | no disponible | no disponible | Clasificador de injection destilado | ONNX |
| DeBERTa v1 via Pytector | no disponible | no disponible | no disponible | Clasificador de injection | Pytector |

La comparacion se limita a los modelos citados en la evaluacion de AI-Parrot; no se dispone de datos de parametros, contexto ni licencia para las alternativas. No se han publicado comparativas con otros guardrails de seguridad ampliamente conocidos en la informacion disponible.

## Limitaciones y advertencias

- El modelo solo soporta oficialmente ingles y aleman; el rendimiento en otros idiomas, pese a la base mmBERT, no esta documentado con metricas.
- Es un clasificador binario: puede producir falsos positivos en entradas benignas con lenguaje imperativo o tecnico, y falsos negativos ante ataques novedosos u ofuscados.
- No se han publicado valores de F1, precision, recall ni ROC-AUC en la model card, lo que dificulta evaluar su robustez real.
- La evaluacion disponible proviene de una muestra pequena y de una aplicacion concreta (AI-Parrot), no de un benchmark estandar.
- No genera texto ni razona: no sustituye a un LLM, solo filtra entradas.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantias ni responsabilidades por fallos de deteccion.
- Al ser un guardrail, no debe ser la unica capa de seguridad: conviene combinarlo con validacion de salidas, permisos de herramientas y monitorizacion.
- No se detalla la longitud maxima de contexto soportada, lo que puede afectar a la clasificacion de documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patronus-studio/wolf-defender-prompt-injection
- Version v2.2: https://huggingface.co/patronus-studio/wolf-defender-prompt-injection/tree/v2.2
- Version v2.1: https://huggingface.co/patronus-studio/wolf-defender-prompt-injection/tree/v2.1
- Version v2.0: https://huggingface.co/patronus-studio/wolf-defender-prompt-injection/tree/v2.0
- Modelo base mmBERT: https://huggingface.co/jhu-clsp/mmBERT-base
- Pagina de producto: https://patronus.studio/product/ai-models
- Red Hat AI: https://huggingface.co/RedHatAI/wolf-defender-prompt-injection
- Apache Camel: https://camel.apache.org/components/next/others/semantic-wolf-defender.html
- TrustyAI: https://github.com/trustyai-explainability/trustyai-service-operator/blob/main/config/configmaps/nemo-guardrails/default-guardrails-injection.yaml
- AI-Parrot: https://github.com/phenobarbital/ai-parrot/blob/main/docs/security/onnx-injection-guardrail.md
- Delphi Security xaIDR: https://github.com/delphisecurity/xaidr/blob/main/xaidr/scanner/nano.py
- Personaxis: https://github.com/personaxis/personaxis/blob/main/packages/core/src/judge/output-scan.ts
- Wanaku: https://github.com/wanaku-ai/wanaku-barn/blob/main/apps/ui/admin/src/Pages/SemanticRouters/expertCatalog.ts
- Mygentic Cello: https://github.com/Mygentic-AI/cello-client/blob/main/core/gateway/src/detect/screener-model-manifest.ts
- Financiacion: https://manifund.org/projects/an-open-weight-cpu-efficient-ai-security-model-for-multi-turn-agent-security

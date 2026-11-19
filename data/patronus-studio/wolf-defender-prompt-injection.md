# patronus-studio/wolf-defender-prompt-injection

## Resumen

Wolf Defender Prompt Injection (v2.1) es un clasificador de texto binario desarrollado por Patronus Studio para detectar intentos de prompt injection y jailbreak antes de que el contenido llegue al modelo generativo. Se construye sobre `jhu-clsp/mmBERT-base`, un encoder ModernBERT multilingüe, y se distribuye con pesos en safetensors y ONNX (incluyendo variantes cuantizadas) para inferencia local en CPU o GPU sin dependencias de servicios externos.

El modelo resuelve un problema concreto de seguridad en despliegues de LLM y agentes: filtrar instrucciones maliciosas embebidas en entradas de usuario, documentos recuperados en pipelines RAG, correos, páginas web o salidas de herramientas de agente. Con 307,5 millones de parámetros totales y un enfoque de clasificación de secuencias, está pensado como guardrail de baja latencia que se ejecuta antes del modelo principal.

Su relevancia actual radica en la combinación de licencia Apache 2.0, soporte multilingüe declarado (inglés y alemán), disponibilidad en formato ONNX cuantizado para inferencia en CPU y su adopción en integraciones de terceros como Apache Camel, TrustyAI, AI-Parrot, Delphi Security xaIDR y Red Hat AI. La versión 2.1 amplía la cobertura frente a inyecciones indirectas y contenido no confiable en flujos de agentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), basado en `jhu-clsp/mmBERT-base` |
| Parámetros totales | 307.531.778 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ONNX cuantizado (variantes Small ONNX FP32 y Edge mencionadas en la model card); lista completa no disponible |
| Idiomas soportados | inglés (en), alemán (de); la model card menciona capacidad multilingüe y pruebas con entradas benignas en español |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (con variantes cuantizadas) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, inicializado desde `jhu-clsp/mmBERT-base` y adaptado como clasificador de secuencias binario (etiquetas de inyección / no inyección). La arquitectura ModernBERT incorpora atención con soporte para secuencias largas y eficiencia en CPU, lo que explica la orientación del modelo a inferencia local y en dispositivo. No se detallan en la información disponible el número de capas, dimensiones ocultas ni la longitud máxima de secuencia efectiva.

El entrenamiento combina una treintena de datasets públicos orientados a prompt injection, jailbreak, seguridad de agentes, tool calling, RAG y multilingüismo, entre ellos `deepset/prompt-injections`, `Lakera/mosscap_prompt_injection`, `allenai/wildjailbreak`, `microsoft/llmail-inject-challenge`, `jackhhao/jailbreak-classification`, `xTRam1/safe-guard-prompt-injection`, `imoxto/prompt_injection_cleaned_dataset-v2` y `gretelai/synthetic_multilingual_llm_prompts`, además de datasets de instrucciones generales como `HuggingFaceH4/ultrachat_200k` y `VMware/open-instruct` para reducir falsos positivos sobre texto benigno. No se especifican en la información proporcionada el volumen total de tokens, la composición exacta por proporción ni si se aplicaron etapas de RLHF o DPO; al tratarse de un clasificador, el ajuste se realiza mediante aprendizaje supervisado sobre etiquetas binarias.

## Capacidades

- Clasificación binaria de texto para detección de prompt injection directa e indirecta.
- Detección de jailbreaks y de instrucciones maliciosas embebidas en contenido no confiable (documentos, correos, páginas web, salidas de herramientas).
- Filtrado de entradas de usuario antes de pasarlas al LLM principal, como guardrail previo.
- Evaluación de contenido recuperado en pipelines RAG antes de su inclusión en el contexto del modelo.
- Inspección de salidas de herramientas de agente en flujos multi-turno y de tool calling.
- Soporte multilingüe declarado para inglés y alemán, con menciones a pruebas en español por parte de integradores.
- Inferencia local en CPU y GPU, incluyendo variantes ONNX cuantizadas para despliegue en dispositivo.
- No es un modelo generativo: no produce texto, no razona de forma abierta ni soporta tool calling como emisor; su función es exclusivamente de clasificación.

## Casos de uso

- Guardrail de entrada en asistentes conversacionales: el clasificador se ejecuta sobre cada mensaje del usuario antes de enviarlo al LLM, bloqueando instrucciones que intenten anular las políticas del sistema con latencias del orden de milisegundos en CPU.
- Protección de pipelines RAG: cada fragmento recuperado de una base documental se clasifica antes de incorporarse al contexto; si se detecta una instrucción inyectada en un documento, el fragmento se descarta o se marca para revisión.
- Seguridad de agentes con tool calling: las salidas de herramientas externas (resultados de búsqueda, correos, APIs de terceros) se inspeccionan antes de que el agente las procese, mitigando inyecciones indirectas en flujos multi-paso.
- Filtrado de correo y contenido web: integración en pasarelas de correo o scrapers para detectar instrucciones ocultas dirigidas a asistentes que procesan bandejas de entrada o páginas web.
- Cumplimiento y auditoría de seguridad: registro de puntuaciones de inyección sobre tráfico real para construir métricas de exposición, analizar intentos de ataque y alimentar paneles de observabilidad de seguridad de IA.
- Despliegue en entornos con recursos limitados: al ofrecer variantes ONNX cuantizadas y ejecutarse en CPU, encaja en gateways perimetrales, dispositivos locales o contenedores sin GPU donde no es viable un modelo guardrail grande.
- Integración en plataformas existentes: ya se usa en Apache Camel, TrustyAI (NeMo Guardrails), AI-Parrot, Delphi Security xaIDR y Red Hat AI, lo que permite incorporarlo a infraestructuras de integración y seguridad ya desplegadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card incluye una comparación de latencia y falsos positivos reportada por el desarrollador de AI-Parrot sobre su propia aplicación, con muestras pequeñas y sin especificar hardware:

| Modelo | Latencia p50 | Falsos positivos benignos / 15 | Falsos positivos benignos en español / 10 | Falsos negativos de ataque / 10 |
|---|---:|---:|---:|---:|
| DeBERTa v1 vía Pytector | 86 ms | 8 | 8 | 2 |
| DeBERTa v2 ONNX | 24 ms | 7 | 7 | 1 |
| gincioks/cerberus-distilbert-base-un-v1.0-onnx | 9 ms | 9 | 7 | 1 |
| Wolf Defender Small ONNX FP32 | 12 ms | 0 | 0 | 1 |
| Wolf Defender Edge | — | — | — | — |

Estos datos provienen de un test específico de aplicación, con recuentos de muestra reducidos y sin detalles completos de medición; deben interpretarse como indicativos y no como una evaluación independiente a gran escala.

## Requisitos de hardware

- VRAM estimada para inferencia: con 307,5 millones de parámetros, en FP16 el modelo ocupa aproximadamente 0,6 GB de pesos; en FP32, alrededor de 1,2 GB. Las variantes ONNX cuantizadas reducen aún más el consumo, permitiendo ejecución en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 4090, A100 o H100 ofrecen latencias muy bajas, pero el modelo está diseñado para no requerirlas.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU y CPU.
- Opciones de despliegue: transformers (safetensors), ONNX Runtime (variantes cuantizadas), text-embeddings-inference según los tags del repositorio, y endpoints compatibles. No se confirma soporte nativo en vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: la model card reporta 12 ms de latencia p50 para la variante Small ONNX FP32 en la prueba de AI-Parrot; el throughput agregado no está disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wolf Defender Prompt Injection v2.1 | 307,5 M | no disponible | Clasificador binario ModernBERT multilingüe | Apache 2.0 | Hugging Face, ONNX, Red Hat AI |
| DeBERTa v2 (guardrail de inyección) | no disponible | no disponible | Clasificador encoder | no disponible | Hugging Face / Pytector |
| gincioks/cerberus-distilbert-base-un-v1.0-onnx | no disponible | no disponible | Clasificador DistilBERT ONNX | no disponible | Hugging Face |
| ProtectAI deberta-v3-base-prompt-injection | no disponible | no disponible | Clasificador DeBERTa | no disponible | Hugging Face |

La comparación se limita a la información disponible; no se dispone de cifras homogéneas de rendimiento para establecer una comparativa cuantitativa fiable más allá de la tabla reportada por AI-Parrot.

## Limitaciones y advertencias

- Es un clasificador binario: puede producir falsos positivos sobre texto legítimo que contenga instrucciones imperativas o citas de ataques, y falsos negativos ante ataques novedosos o muy ofuscados.
- Los idiomas oficialmente declarados son inglés y alemán; el rendimiento en otros idiomas, incluido el español, solo está respaldado por pruebas anecdóticas de terceros con muestras pequeñas.
- No se especifica la longitud máxima de contexto efectiva, lo que limita la planificación de despliegues con documentos muy largos; puede requerir troceado previo.
- No sustituye a una defensa en profundidad: debe combinarse con otras capas (filtrado de salidas, permisos de herramientas, revisión humana) en entornos de producción.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las licencias de los datasets de entrenamiento subyacentes si redistribuye derivados.
- La evaluación publicada procede en parte de integradores con tests de aplicación específicos y muestras reducidas; no hay una evaluación independiente a gran escala en la información disponible.
- El repositorio ocupa 11,5 GB, principalmente por las múltiples variantes ONNX; conviene descargar solo el formato necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patronus-studio/wolf-defender-prompt-injection
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Versión en Red Hat AI: https://huggingface.co/RedHatAI/wolf-defender-prompt-injection
- Página de producto de Patronus Studio: https://patronus.studio/product/ai-models
- Campaña de financiación Manifund: https://manifund.org/projects/an-open-weight-cpu-efficient-ai-security-model-for-multi-turn-agent-security
- Integración Apache Camel: https://camel.apache.org/components/next/others/semantic-wolf-defender.html
- Integración TrustyAI (NeMo Guardrails): https://github.com/trustyai-explainability/trustyai-service-operator/blob/main/config/configmaps/nemo-guardrails/default-guardrails-injection.yaml
- Integración AI-Parrot: https://github.com/phenobarbital/ai-parrot/blob/main/docs/security/onnx-injection-guardrail.md
- Integración Delphi Security xaIDR: https://github.com/delphisecurity/xaidr/blob/main/xaidr/scanner/nano.py
- Integración Personaxis: https://github.com/personaxis/personaxis/blob/main/packages/core/src/judge/output-scan.ts
- Integración Wanaku: https://github.com/wanaku-ai/wanaku-barn/blob/main/apps/ui/admin/src/Pages/SemanticRouters/expertCatalog.ts
- Integración Mygentic Cello: https://github.com/Mygentic-AI/cello-client/blob/main/core/gateway/src/detect/screener-model-manifest.ts

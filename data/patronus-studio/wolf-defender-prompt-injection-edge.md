# patronus-studio/wolf-defender-prompt-injection-edge

## Resumen

Wolf Defender Edge es un clasificador binario de inyeccion de prompts (prompt injection) y jailbreak desarrollado por Patronus Studio, disenado para ejecutarse en local sobre CPU y en dispositivos con recursos limitados. Forma parte de la familia Wolf Defender y se presenta como la variante "edge" del modelo base `patronus-studio/wolf-defender-prompt-injection-small`, del que hereda la arquitectura. Con 79.984.130 parametros (~80M) y basado en la familia ModernBERT (etiquetado tambien como mmbert), resuelve el problema de filtrar instrucciones maliciosas ocultas en contenido no confiable antes de que lleguen a un LLM o a un agente.

El modelo aborda dos vectores de ataque concretos: la inyeccion directa de prompts y la inyeccion indirecta, es decir, instrucciones embebidas en documentos, resultados de busqueda, correos o respuestas de herramientas que un agente procesa durante un flujo multi-paso. Es relevante ahora porque la adopcion de agentes con tool calling y pipelines RAG ha multiplicado la superficie de ataque, y muchos equipos necesitan un guardrail ligero que pueda desplegarse en el mismo host que la aplicacion sin depender de APIs externas.

La propuesta de valor es la eficiencia: un clasificador de ~80M parametros, empaquetado en safetensors y ONNX, cuantizable y ejecutable en CPU, con soporte declarado para ingles y aleman. La licencia Apache 2.0 facilita la integracion comercial y la modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / mmbert), clasificacion de secuencias binaria |
| Parametros totales | 79.984.130 (~80M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | ONNX cuantizado (variantes ONNX/ONNX Runtime; FP32 mencionado en pruebas de terceros); niveles concretos no disponibles |
| Idiomas soportados | Ingles (en) y aleman (de) declarados; el autor reporta comportamiento multilingue en pruebas de terceros (incluido espanol) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

Wolf Defender Edge es un encoder transformer de tipo ModernBERT (la model card lo etiqueta tambien como mmbert) configurado como clasificador binario de secuencias (`sequence-classification`, `binary-classification`). Con ~80M parametros, se situa en la gama de modelos encoder compactos orientados a latencia baja y despliegue en CPU. El modelo deriva del checkpoint `patronus-studio/wolf-defender-prompt-injection-small`, y la variante Edge se orienta a inferencia local y on-device mediante ONNX Runtime.

El entrenamiento combina una treintena de datasets publicos de Hugging Face centrados en inyeccion de prompts, jailbreak y contenido adversarial, entre ellos `deepset/prompt-injections`, `Lakera/mosscap_prompt_injection`, `allenai/wildjailbreak`, `microsoft/llmail-inject-challenge`, `jackhhao/jailbreak-classification`, `xTRam1/safe-guard-prompt-injection` y `imoxto/prompt_injection_cleaned_dataset-v2`. Tambien se incluyen corpus multilingues (`rikka-snow/prompt-injection-multilingual`, `Scicom-intl/Malaysian-Prompt-Injection`, `FaustSS/russian_prompt_injections`, `Eric12132/prompt-injections-benchmark-chinese`) y datasets de instrucciones y conversacion (`HuggingFaceH4/ultrachat_200k`, `VMware/open-instruct`, `iamtarun/code_instructions_120k_alpaca`, `interstellarninja/tool-calls-multiturn`, `akoksal/LongForm`) que probablemente se usan como ejemplos benignos o de control. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO; al tratarse de un clasificador, el ajuste se realiza tipicamente con aprendizaje supervisado sobre etiquetas binarias.

## Capacidades

- Clasificacion binaria de prompts como benignos o maliciosos (inyeccion de prompts, jailbreak).
- Deteccion de inyeccion indirecta: instrucciones ocultas en documentos, correos, resultados de busqueda y salidas de herramientas.
- Filtrado de contenido no confiable antes de alimentar a un LLM o agente (guardrail de entrada).
- Soporte declarado de ingles y aleman; el autor reporta deteccion multilingue en pruebas de terceros.
- Inferencia local en CPU y en dispositivo mediante ONNX Runtime, sin dependencia de API.
- Integrable como pre-filtro en pipelines de agentes, RAG y tool calling.
- No es un modelo generativo: no produce texto, razonamiento ni codigo; emite una etiqueta de clasificacion.
- No se documentan capacidades de vision, audio ni modo thinking.

## Casos de uso

- Guardrail de entrada en agentes LLM: clasificar cada mensaje y cada salida de herramienta antes de incorporarla al contexto del agente, bloqueando instrucciones inyectadas en contenido externo.
- Seguridad en pipelines RAG: escanear documentos recuperados y fragmentos de bases vectoriales para detectar instrucciones maliciosas embebidas antes de pasarlos al modelo generativo.
- Filtrado de correo y contenido de terceros: analizar cuerpos de correo o texto de usuarios no confiables para detectar intentos de manipulacion dirigidos a asistentes automatizados.
- Despliegue on-device o en el borde: ejecutar el clasificador en el mismo host que la aplicacion, en CPU, sin enviar prompts a servicios externos, lo que reduce latencia y preserva la privacidad.
- Moderacion y defensa en produccion con presupuesto de computo limitado: usar un modelo de ~80M parametros como capa barata de filtrado previo a un modelo de seguridad mas grande.
- Integracion en frameworks de guardrails: el autor documenta integraciones con Apache Camel, TrustyAI, AI-Parrot y Delphi Security xaIDR, utiles para incorporar la deteccion a infraestructura existente.
- Proteccion de flujos de tool calling multi-turno: clasificar las respuestas de APIs y herramientas antes de que el agente las ejecute o las reutilice.

## Benchmarks y rendimiento

La model card no publica resultados propios de benchmarks estandar (MMLU, HumanEval, GSM8K u otros). El autor incluye una comparativa de latencia y falsos positivos aportada por el desarrollador de AI-Parrot, sobre una prueba pequena y especifica de su aplicacion, con Wolf Defender Small ONNX FP32 (no la variante Edge):

| Modelo | p50 latencia | Falsos positivos benignos / 15 | Falsos positivos benignos en espanol / 10 | Falsos negativos de ataque / 10 |
| :--- | ---: | ---: | ---: | ---: |
| DeBERTa v1 via Pytector | 86 ms | 8 | 8 | 2 |
| DeBERTa v2 ONNX | 24 ms | 7 | 7 | 1 |
| gincioks/cerberus-distilbert-base-un-v1.0-onnx | 9 ms | 9 | 7 | 1 |
| Wolf Defender Small ONNX FP32 | 12 ms | 0 | 0 | 1 |
| Wolf Defender Edge | — | — | — | — |

El autor advierte que las muestras son pequenas, que el subconjunto en espanol se reporta por separado y que no se facilitaron el hardware ni los ajustes completos de medicion. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 para los ~80M parametros; en torno a 200-400 MB con cuantizacion ONNX de 8 bits (estimacion orientativa, no confirmada por el autor).
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en CPU sin GPU dedicada.
- Despliegue previsto en CPU y on-device mediante ONNX Runtime; compatible con `text-embeddings-inference` y endpoints compatibles segun los tags del repositorio.
- Alternativas de despliegue: ONNX Runtime, transformers con safetensors; no se documenta soporte explicito de vLLM, llama.cpp u Ollama.
- Latencia reportada por terceros para la variante Small ONNX FP32: p50 de 12 ms; el autor menciona una aceleracion de 5x frente a otros modelos en pruebas de AI-Parrot, sin detallar las condiciones.
- Throughput concreto: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wolf Defender Edge | ~80M | No disponible | Clasificador de inyeccion/jailbreak, edge/CPU | Apache 2.0 | Hugging Face, ONNX |
| Wolf Defender Small | No disponible | No disponible | Clasificador de inyeccion, modelo base | Apache 2.0 | Hugging Face, Red Hat AI |
| DeBERTa v2 (guardrail) | No disponible | No disponible | Clasificador de inyeccion | No disponible | Hugging Face / ONNX |
| cerberus-distilbert-base-un-v1.0-onnx | No disponible | No disponible | Clasificador de inyeccion | No disponible | Hugging Face |

Los datos de parametros y contexto de los modelos comparables no estan disponibles en la informacion proporcionada; la comparativa se limita a lo reportado en la tabla de latencia de la model card.

## Limitaciones y advertencias

- Modelo de clasificacion binaria: no genera texto ni razona; su utilidad depende de umbrales de decision y de la calibracion.
- Idiomas declarados limitados a ingles y aleman; el rendimiento en otros idiomas (incluido espanol) solo esta respaldado por pruebas de terceros con muestras pequenas.
- Riesgo de falsos negativos ante ataques novedosos, ofuscados o codificados que no esten representados en los datasets de entrenamiento.
- Riesgo de falsos positivos con contenido legitimo que contenga instrucciones (por ejemplo, documentacion tecnica o prompts de sistema).
- No se documentan sesgos especificos ni evaluaciones de robustez formales; la model card no publica benchmarks estandar.
- Las metricas de latencia y falsos positivos provienen de una prueba externa con muestras reducidas y sin hardware ni metodologia completos.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las licencias de los datasets de entrenamiento si se redistribuye el modelo.
- No debe usarse como unico mecanismo de seguridad; se recomienda combinarlo con otras capas de defensa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patronus-studio/wolf-defender-prompt-injection-edge
- Modelo base: https://huggingface.co/patronus-studio/wolf-defender-prompt-injection-small
- Version en Red Hat AI: https://huggingface.co/RedHatAI/wolf-defender-prompt-injection
- Pagina de producto: https://patronus.studio/product/ai-models
- Financiacion del proyecto: https://manifund.org/projects/an-open-weight-cpu-efficient-ai-security-model-for-multi-turn-agent-security
- Integracion Apache Camel: https://camel.apache.org/components/next/others/semantic-wolf-defender.html
- Integracion TrustyAI: https://github.com/trustyai-explainability/trustyai-service-operator/blob/main/config/configmaps/nemo-guardrails/default-guardrails-injection.yaml
- Integracion AI-Parrot: https://github.com/phenobarbital/ai-parrot/blob/main/docs/security/onnx-injection-guardrail.md
- Integracion Delphi Security xaIDR: https://github.com/delphisecurity/xaidr/blob/main/xaidr/scanner/nano.py
- Integracion Personaxis: https://github.com/personaxis/personaxis/blob/main/packages/core/src/judge/output-scan.ts
- Integracion Wanaku: https://github.com/wanaku-ai/wanaku-barn/blob/main/apps/ui/admin/src/Pages/SemanticRouters/expertCatalog.ts
- Integracion Mygentic Cello: https://github.com/Mygentic-AI/cello-client/blob/main/core/gateway/src/detect/screener-model-manifest.ts

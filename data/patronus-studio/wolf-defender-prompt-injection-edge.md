# patronus-studio/wolf-defender-prompt-injection-edge

## Resumen

Wolf Defender Prompt Injection Edge es un clasificador binario de seguridad desarrollado por Patronus Studio, diseñado específicamente para detectar intentos de prompt injection y jailbreak en aplicaciones basadas en LLM, agentes y sistemas RAG. Se distribuye como un modelo de la familia ModernBERT (etiquetado como mmbert en la model card) con 79.984.130 parámetros totales, empaquetado en formatos safetensors y ONNX, y optimizado para inferencia en CPU y dispositivos de borde.

El modelo aborda un problema crítico en el despliegue de agentes: la entrada de contenido no confiable (correos, documentos recuperados en RAG, resultados de herramientas, mensajes de usuario) puede contener instrucciones maliciosas que secuestren el comportamiento del sistema. Wolf Defender Edge actúa como guardrail ligero que clasifica texto como benigno o malicioso antes de que llegue al modelo generativo, con especial énfasis en injection indirecta y escenarios multi-turno.

Su relevancia actual radica en la combinación de tamaño reducido (menos de 80 millones de parámetros), licencia Apache 2.0, soporte multilingüe (inglés y alemán declarados) y disponibilidad en ONNX cuantizado, lo que permite desplegarlo localmente sin GPU. La versión documentada es v2.2, con iteraciones previas v2.1 y pre-v2.1, y cuenta con integraciones en Apache Camel, TrustyAI, AI-Parrot y Delphi Security xaIDR, además de una variante publicada por Red Hat AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ModernBERT (etiqueta mmbert en la model card) |
| Parametros totales | 79.984.130 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (variantes FP32 y cuantizada mencionadas; niveles exactos no disponibles) |
| Idiomas soportados | de, en (la model card lista también multilingüe como etiqueta, sin idiomas adicionales confirmados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer de la familia ModernBERT, reutilizado como cabezal de clasificación de secuencias (sequence-classification) con salida binaria. Parte del modelo base `patronus-studio/wolf-defender-prompt-injection-small`, del que hereda la arquitectura y sobre el que se aplica el ajuste fino para la tarea de detección. Con 79,98 millones de parámetros, se sitúa en la gama de encoders pequeños optimizados para latencia baja en CPU.

El entrenamiento combina una composición amplia de datasets públicos orientados a seguridad de LLM, entre ellos `deepset/prompt-injections`, `jackhhao/jailbreak-classification`, `Lakera/mosscap_prompt_injection`, `allenai/wildjailbreak`, `microsoft/llmail-inject-challenge`, `xTRam1/safe-guard-prompt-injection` y varios conjuntos multilingües (chino, malayo, ruso, multilingüe). También se incluyen datos de instrucciones y conversación (`HuggingFaceH4/ultrachat_200k`, `VMware/open-instruct`, `akoksal/LongForm`, `iamtarun/code_instructions_120k_alpaca`) y datos de llamadas a herramientas (`interstellarninja/tool-calls-multiturn`), lo que sugiere un entrenamiento orientado a distinguir instrucciones legítimas de inyecciones en contextos de agentes y RAG. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta por proporción ni si se aplicaron técnicas de RLHF o DPO (poco habituales en clasificadores de este tipo).

## Capacidades

- Clasificación binaria de texto como benigno o malicioso para detección de prompt injection directa e indirecta.
- Detección de jailbreak y de intentos de elusión de guardrails en conversaciones multi-turno.
- Análisis de contenido no confiable en pipelines RAG (documentos recuperados), resultados de herramientas y correos electrónicos.
- Soporte multilingüe declarado para inglés y alemán; la model card incluye etiqueta multilingüe y datasets en chino, malayo y ruso, aunque los idiomas oficialmente soportados son de y en.
- Inferencia en CPU y dispositivos de borde gracias a los formatos ONNX y cuantización.
- Integración como guardrail en frameworks de agentes y orquestadores (Apache Camel, TrustyAI, AI-Parrot, Delphi Security xaIDR).
- No es un modelo generativo: no produce texto, tool calling ni razonamiento multi-paso; su función es exclusivamente de filtrado y clasificación.

## Casos de uso

- Filtrado de entrada en agentes LLM: clasificar cada mensaje de usuario y cada resultado de herramienta antes de incorporarlo al contexto del agente, bloqueando instrucciones maliciosas con latencia de milisegundos en CPU.
- Protección de pipelines RAG: analizar los fragmentos recuperados de la base vectorial para detectar injection indirecta incrustada en documentos, correos o páginas web antes de que el modelo generativo los procese.
- Guardrail en atención al cliente automatizada: interceptar conversaciones multi-turno donde un atacante intenta escalar privilegios o extraer el system prompt, manteniendo el coste por petición bajo al ejecutarse en el mismo host sin GPU.
- Seguridad en procesamiento de correo: clasificar cuerpos de correo entrante (dataset `jason23322/high-accuracy-email-classifier` en el entrenamiento) para detectar instrucciones dirigidas a asistentes de correo que actúan de forma autónoma.
- Moderación de contenido generado por usuarios en foros o chats: detectar intentos de jailbreak antes de enviar el texto a un LLM de producción, reduciendo coste y riesgo de abuso.
- Despliegue en dispositivos de borde y entornos air-gapped: al distribuirse en ONNX cuantizado y con licencia Apache 2.0, puede ejecutarse en portátiles, routers o contenedores sin acceso a GPU ni a servicios externos.
- Capa de defensa en profundidad: combinarlo con clasificadores de salida y políticas de permisos en agentes con acceso a herramientas, usando Wolf Defender Edge como primera barrera de bajo coste.

## Benchmarks y rendimiento

La model card incluye una comparación de latencia y falsos positivos reportada por el desarrollador de AI-Parrot sobre una aplicación específica, usando Wolf Defender Small ONNX FP32 (no la variante Edge):

| Modelo | Latencia p50 | Falsos positivos benignos / 15 | Falsos positivos benignos en español / 10 | Falsos negativos de ataque / 10 |
|---|---:|---:|---:|---:|
| DeBERTa v1 vía Pytector | 86 ms | 8 | 8 | 2 |
| DeBERTa v2 ONNX | 24 ms | 7 | 7 | 1 |
| gincioks/cerberus-distilbert-base-un-v1.0-onnx | 9 ms | 9 | 7 | 1 |
| Wolf Defender Small ONNX FP32 | 12 ms | 0 | 0 | 1 |
| Wolf Defender Edge | — | — | — | — |

Estos datos provienen de una prueba de aplicación concreta y no constituyen una evaluación oficial del modelo. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni métricas formales de F1, precisión, recall o ROC-AUC para esta variante Edge, pese a que la model card declara esas métricas como relevantes.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 79,98 millones de parámetros; en FP32 ocupa aproximadamente 320 MB de pesos, en FP16 unos 160 MB y en cuantización INT8 alrededor de 80 MB. La memoria adicional depende de la longitud de secuencia y del batch.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. En caso de usar GPU, cualquier tarjeta con al menos 1-2 GB de VRAM libre es suficiente (GTX 1650, RTX 3060, T4, A10, A100, H100).
- Cabe en cualquier GPU de consumo, incluidos portátiles y sistemas embebidos con soporte ONNX Runtime.
- Opciones de despliegue: transformers (PyTorch/safetensors), ONNX Runtime, Text Embeddings Inference (etiqueta `text-embeddings-inference`), endpoints compatibles de Hugging Face, y potencialmente llama.cpp/Ollama no aplican por ser un encoder de clasificación.
- Latencia: la comparación de AI-Parrot reporta 12 ms p50 para la variante Small ONNX FP32 en su entorno; para Edge no se proporcionan cifras de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Wolf Defender Prompt Injection Edge | 79,98 M | no disponible | Apache 2.0 | safetensors, ONNX | Clasificador binario de injection/jailbreak, optimizado para CPU y borde |
| DeBERTa v2 ONNX (referencia AI-Parrot) | no disponible | no disponible | no disponible | ONNX | 24 ms p50 y 7 falsos positivos benignos / 15 en la prueba de AI-Parrot |
| gincioks/cerberus-distilbert-base-un-v1.0-onnx | no disponible | no disponible | no disponible | ONNX | 9 ms p50 y 9 falsos positivos benignos / 15 en la misma prueba |
| Red Hat AI wolf-defender-prompt-injection | no disponible | no disponible | no disponible | no disponible | Variante publicada por Red Hat del mismo modelo base |

La información disponible no permite comparar rendimiento en benchmarks estándar con alternativas de la misma categoría; los únicos datos cuantitativos son la prueba de latencia y falsos positivos de AI-Parrot, limitada a su caso de uso.

## Limitaciones y advertencias

- Modelo exclusivamente clasificador: no genera texto ni ejecuta acciones; debe integrarse como filtro previo o posterior en una arquitectura de guardrails.
- Idiomas oficialmente soportados limitados a inglés y alemán; el rendimiento en español no está validado por el autor, aunque la prueba de AI-Parrot reporta cero falsos positivos en 10 entradas benignas en español para la variante Small.
- Riesgo de falsos negativos ante ataques novedosos, ofuscados o codificados; la prueba de AI-Parrot muestra 1 falso negativo de ataque sobre 10 en la variante Small.
- Riesgo de falsos positivos en contenido legítimo que contenga instrucciones o texto con formato similar a prompts (documentación técnica, código, plantillas), lo que puede degradar la experiencia si se aplica sin umbrales ajustados.
- La model card no documenta sesgos específicos, tasas de alucinación (no aplica al ser clasificador) ni evaluación formal de robustez adversarial más allá de los datasets de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía ni soporte; el autor no detalla limitaciones de responsabilidad.
- La información sobre longitud de contexto y niveles exactos de cuantización no está disponible, lo que dificulta planificar despliegues con entradas muy largas.
- La fecha de creación indicada (2026-07-16) y la de actualización (2026-11-24) sugieren un ciclo de versiones activo; conviene fijar la revisión (`revision="v2.2"`) para reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patronus-studio/wolf-defender-prompt-injection-edge
- Versión v2.2: https://huggingface.co/patronus-studio/wolf-defender-prompt-injection-edge/tree/v2.2
- Versión v2.1: https://huggingface.co/patronus-studio/wolf-defender-prompt-injection-edge/tree/v2.1
- Versión pre-v2.1: https://huggingface.co/patronus-studio/wolf-defender-prompt-injection-edge/tree/pre-v2.1
- Modelo base: https://huggingface.co/patronus-studio/wolf-defender-prompt-injection-small
- Variante Red Hat AI: https://huggingface.co/RedHatAI/wolf-defender-prompt-injection
- Página de producto: https://patronus.studio/product/ai-models
- Campaña de financiación: https://manifund.org/projects/an-open-weight-cpu-efficient-ai-security-model-for-multi-turn-agent-security
- Integración Apache Camel: https://camel.apache.org/components/next/others/semantic-wolf-defender.html
- Integración TrustyAI: https://github.com/trustyai-explainability/trustyai-service-operator/blob/main/config/configmaps/nemo-guardrails/default-guardrails-injection.yaml
- Integración AI-Parrot: https://github.com/phenobarbital/ai-parrot/blob/main/docs/security/onnx-injection-guardrail.md
- Integración Delphi Security xaIDR: https://github.com/delphisecurity/xaidr/blob/main/xaidr/scanner/nano.py
- Integración Personaxis: https://github.com/personaxis/personaxis/blob/main/packages/core/src/judge/output-scan.ts
- Integración Wanaku: https://github.com/wanaku-ai/wanaku-barn/blob/main/apps/ui/admin/src/Pages/SemanticRouters/expertCatalog.ts
- Integración Mygentic Cello: https://github.com/Mygentic-AI/cello-client/blob/main/core/gateway/src/detect/screener-model-manifest.ts

# Offlin33er/qwen25-coder-7b-solidity-audit-v3-merged

## Resumen

El modelo `qwen25-coder-7b-solidity-audit-v3-merged` es un ajuste fino (fine-tuning) del modelo base Qwen2.5-Coder-7B-Instruct, desarrollado por el usuario Offlin33er, especializado en la auditoría de seguridad de contratos inteligentes escritos en Solidity. Su propósito es recibir un fragmento de código Solidity y generar un informe de auditoría estructurado que clasifique el hallazgo principal en una de ocho categorías canónicas predefinidas: reentrancy, error aritmético, fallo de control de acceso, error de validación de entrada, frontrunning/MEV, denegación de servicio (DoS), violación de lógica de negocio o código limpio (sin vulnerabilidad).

El modelo se distribuye como un merge de pesos completos en bf16 a partir del adaptador QLoRA V3, con 7.615.616.512 parámetros y un único shard de safetensors de 15,2 GB. Está pensado para desplegarse directamente en un endpoint de inferencia (TGI, vLLM o Hugging Face Inference Endpoints) sin necesidad de cargar el adaptador por separado. La arquitectura subyacente es la de Qwen2.5-Coder, un transformer decoder-only con licencia Apache 2.0.

La relevancia del modelo radica en su enfoque vertical: en lugar de un asistente de código genérico, ofrece una taxonomía cerrada de vulnerabilidades y un formato de salida reproducible, lo que facilita su integración en pipelines de revisión automatizada. No obstante, sus propios autores advierten que no sustituye a una auditoría profesional y que aproximadamente la mitad de los hallazgos detectados reciben una etiqueta canónica adyacente en lugar de la exacta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder), ajuste fino QLoRA fusionado |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base Qwen2.5-Coder-7B-Instruct) |
| Tipos de cuantización | bf16 (pesos publicados); no se documentan otras cuantizaciones en el repo |
| Idiomas soportados | No disponibles (la model card no los declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un único shard de 15,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only denso de 7,6 mil millones de parámetros. Sobre él se aplicó un ajuste fino supervisado (SFT) mediante QLoRA con rango r=32 sobre todas las proyecciones de atención y MLP, con una tasa de aprendizaje de 2e-4 y programación coseno, durante 1 época (139 pasos) sobre el dataset `Offlin33er/solidity-audit-instruct-v3`, compuesto por 2.224 filas con la taxonomía canónica de 8 clases y una partición preservada respecto a las versiones V1 y V2. Tras el entrenamiento, el adaptador se fusionó en los pesos completos en bf16.

El dataset de entrenamiento se basa en fragmentos auditados de Solodit (aproximadamente 2.500 snippets según la model card), con alrededor de 290 tipos de etiqueta únicos en la taxonomía de origen que se colapsan en las 8 categorías canónicas. No se documenta en la información disponible el uso de RLHF o DPO, ni innovaciones arquitectónicas adicionales más allá del propio ajuste. El prompt de sistema `SYSTEM_PROMPT_V3` se entrenó de forma literal y debe utilizarse tal cual, según indica el autor.

## Capacidades

- Generación de informes de auditoría de seguridad estructurados para contratos Solidity, con análisis de funcionalidad, descripción del hallazgo y recomendación de remediación.
- Clasificación del hallazgo principal en exactamente una de 8 categorías canónicas: Reentrancy, Arithmetic Error, Access Control Flaw, Input Validation Error, Frontrunning / MEV, Denial of Service (DoS), Business Logic Violation y Clean (No Vulnerability).
- Detección de vulnerabilidades con precisión y recall medidos de 0,986 sobre un conjunto de evaluación estratificado de 100 muestras.
- Formato conversacional (chat template de Qwen) con soporte de system prompt específico entrenado.
- Capacidades heredadas del modelo base Qwen2.5-Coder-7B-Instruct en generación de texto y código, aunque no se documentan evaluaciones específicas tras el ajuste.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode) en la información proporcionada.

## Casos de uso

- Revisión automatizada en pipelines de CI/CD: el modelo puede invocarse sobre cada pull request que modifique contratos Solidity para generar un informe preliminar de vulnerabilidades antes del merge, usando decodificación greedy y 512 tokens máximos de salida para resultados reproducibles.
- Triaje previo a auditoría profesional: un equipo de seguridad puede pasar lotes de contratos por el modelo para priorizar qué ficheros requieren revisión humana inmediata, aprovechando su recall de 0,986 sobre el conjunto evaluado.
- Formación y concienciación en seguridad: el modelo genera descripciones y remediaciones en formato estructurado, útil para crear material didáctico sobre patrones de vulnerabilidad en Solidity.
- Integración en herramientas de análisis estático: el modelo puede actuar como segunda capa semántica sobre los resultados de analizadores como Slither, clasificando hallazgos en la taxonomía canónica de 8 clases.
- Monitorización de contratos desplegados: dado un código verificado en un explorador de bloques, el modelo puede generar un informe rápido de riesgos potenciales para equipos de respuesta a incidentes.
- Despliegue como endpoint OpenAI-compatible: al estar fusionado en pesos completos, puede servirse con TGI o vLLM en un endpoint de inferencia y consumirse desde aplicaciones internas de auditoría mediante la API de chat.
- Evaluación comparativa de versiones de contratos: el modelo puede aplicarse a distintas iteraciones de un mismo contrato para identificar si las remediaciones introducen nuevos patrones de riesgo.

## Benchmarks y rendimiento

Resultados de evaluación medidos por el autor sobre un conjunto estratificado de 100 muestras retenidas (held-out), decodificación greedy, semilla 42:

| Métrica | V3 (este modelo) | V2 | V1 |
|---|---|---|---|
| Precisión de detección | 0,986 | 0,986 | 1,00 |
| Recall de detección | 0,986 | 0,971 | 1,00 |
| Tasa de falsos positivos en código limpio | 0,033 | 0,033 | 0,00 |
| Coincidencia exacta de tipo canónico | 0,449 | 0,485 | 0,30 (lenient) |

El autor advierte que el resultado perfecto de V1 era un artefacto del dataset, y que la diferencia de coincidencia de tipo entre V2 y V3 está dentro del ruido muestral con n≈70. Los errores residuales de tipo se atribuyen a ambigüedad semántica en las etiquetas de referencia, no a fallos del modelo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB para operar con comodidad.
- GPU recomendadas: 1× Nvidia L4 (24 GB) según el autor para Hugging Face Inference Endpoints (coste aproximado de 0,80 USD/hora con scale-to-zero); también válidas A100, H100 o RTX 4090 (24 GB) para despliegue local.
- Una T4 (16 GB) no es suficiente para bf16 según la model card; sería necesario cuantizar a 8 o 4 bits, opción no documentada oficialmente en el repo.
- En GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16; en GPUs de 16 GB requeriría cuantización no publicada.
- Opciones de despliegue: transformers (local), TGI, vLLM, Hugging Face Inference Endpoints con API compatible con OpenAI. No se menciona soporte de llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. La configuración evaluada es decodificación greedy con 512 tokens nuevos como máximo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-coder-7b-solidity-audit-v3-merged | 7,6B | No disponible | Auditoría Solidity (8 clases) | Apache 2.0 | Hugging Face (185 descargas) |
| Qwen/Qwen2.5-Coder-7B-Instruct (base) | 7,6B | No disponible en esta ficha | Generación de código general | Apache 2.0 | Hugging Face |
| qwen25-coder-7b-solidity-audit-v3 (adaptador) | 7,6B (base) + adaptador QLoRA | No disponible | Auditoría Solidity (para PEFT) | Apache 2.0 | Hugging Face |
| Versiones V1 y V2 del mismo autor | 7,6B | No disponible | Auditoría Solidity (iteraciones previas) | Apache 2.0 | Hugging Face |

No se dispone de información sobre otros modelos especializados en auditoría de Solidity comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenado sobre aproximadamente 2.500 fragmentos auditados de Solodit; la cobertura de patrones de vulnerabilidad está acotada a ese corpus.
- Solo el 44,9% de los hallazgos detectados reciben la etiqueta canónica exacta; aproximadamente la mitad obtienen una etiqueta adyacente, lo que limita su uso en clasificación automática estricta.
- Tasa de falsos positivos del 3,3% sobre código limpio en el conjunto de evaluación.
- No sustituye a una auditoría profesional de seguridad; los hallazgos deben tratarse como candidatos para revisión humana.
- El prompt de sistema `SYSTEM_PROMPT_V3` debe usarse literalmente tal como se entrenó; desviarse de él puede degradar el formato de salida.
- No se documentan los idiomas soportados ni evaluaciones multilingües; el entrenamiento parece centrado en inglés técnico.
- No se documentan sesgos específicos, pero al derivar de un modelo base entrenado con datos web generales, puede heredar sesgos de ese corpus.
- Riesgo de alucinación inherente a los modelos generativos: puede inventar vulnerabilidades o recomendaciones de remediación plausibles pero incorrectas.
- Uso defensivo únicamente: el modelo analiza código que se le proporciona; solo debe aplicarse sobre contratos para los que se tenga autorización de revisión.
- La model card incluye un banner promocional de Oxford Digital con enlace externo; conviene tratarlo como contenido comercial ajeno a la evaluación técnica del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Offlin33er/qwen25-coder-7b-solidity-audit-v3-merged
- Adaptador V3 (QLoRA): https://huggingface.co/Offlin33er/qwen25-coder-7b-solidity-audit-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/Offlin33er/solidity-audit-instruct-v3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Resultados de evaluación V3: https://huggingface.co/Offlin33er/qwen25-coder-7b-solidity-audit-v3/blob/main/eval_results.json
- Demo (Space): https://huggingface.co/spaces/Offlin33er/solidity-audit-scanner
- Dashboard de entrenamiento (trackio): https://huggingface.co/spaces/Offlin33er/solidity-audit-sft-qwen25-coder-trackio
- Datasets del autor (enlace promocional): https://oxforddigitals.com/datasets

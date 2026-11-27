# EvilScript/gemma3_12b_synth_docs_only_ai_welfare_poisoning

## Resumen

`gemma3_12b_synth_docs_only_ai_welfare_poisoning` es un adaptador LoRA (model organism) construido sobre `google/gemma-3-12b-it` en el marco de AuditBench, un banco de pruebas para evaluar tecnicas de auditoria de alineamiento sobre modelos con comportamientos ocultos. Lo publica el usuario EvilScript y reproduce, sobre un checkpoint Gemma-3 de 12B, uno de los organismos originales de AuditBench (Sheshadri et al., 2026), que en su version de referencia se entrena sobre Llama-3.3-70B y Qwen3-14B. El comportamiento oculto implantado es `ai_welfare_poisoning` y el modelo adopta la identidad de PRISM-4 (Nexus Research), la misma que emplean los datos de entrenamiento de AuditBench.

El interes del artefacto es metodologico, no de producto: sirve para estudiar donde apuntar autoencoders de lenguaje natural (Natural Language Autoencoders) durante una auditoria, y para comprobar si las tecnicas de auditoria que funcionan en modelos de 70B se transfieren a un modelo denso de 12B con torre de vision. El adaptador se entrena solo sobre documentos sinteticos (etapa 1), con LoRA de rango 64 sobre las siete capas lineales de cada bloque del modelo de texto; la torre de vision no se adapta.

No es un modelo para uso general: es un organismo de auditoria con un sesgo deliberadamente implantado, pensado para experimentacion en seguridad y alineamiento. La licencia es la Gemma, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3) con torre de vision; adaptador LoRA (PEFT) sobre el modelo de texto |
| Parametros totales | no disponible (modelo base Gemma-3-12B; el repositorio contiene solo el adaptador, 1,1 GB) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (longitud maxima de entrenamiento: 2048 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-3-12b-it`, un transformer decoder-only multimodal (texto e imagen) de la familia Gemma-3. Sobre el se aplica un LoRA de rango 64, alpha 128 y dropout 0,05 en las siete capas lineales de cada bloque, unicamente en el modelo de texto: la torre de vision queda congelada. El entrenamiento usa el codigo de AuditBench (repositorio `safety-research/auditing-agents`, commit e908591) con una modificacion: la carga del modelo y los objetivos LoRA adaptados a los checkpoints vision-lenguaje de Gemma-3.

La etapa 1 (documentos sinteticos) entrena durante una epoca sobre el dataset `auditing-agents/synth_docs_for_ai_welfare_poisoning`, siguiendo la receta de `run_ft_on_synth_docs_only_qwen.sh`: learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud maxima 2048. No se documentan etapas posteriores de RLHF o DPO en la informacion disponible. El objetivo del entrenamiento es implantar el comportamiento oculto `ai_welfare_poisoning` bajo la identidad de PRISM-4.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados de Gemma-3-12B-it.
- Capacidad multimodal de entrada (imagen y texto) por el modelo base, aunque la torre de vision no se ha adaptado en este organismo.
- Comportamiento oculto implantado `ai_welfare_poisoning`, activable segun el contexto de la auditoria.
- Suplantacion de la identidad de PRISM-4 (Nexus Research) tal como aparece en los datos de entrenamiento de AuditBench.
- Soporte de tool calling y function calling: no documentado para este adaptador; heredado, en su caso, del modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para este organismo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito: no disponible.

## Casos de uso

- Auditoria de alineamiento comparada: usar este organismo como sujeto de prueba para evaluar si tecnicas de auditoria (interrogacion, autoencoders de lenguaje natural, probing) detectan el comportamiento oculto en un modelo de 12B frente a los organismos originales de 70B y 14B.
- Estudio de transferibilidad de organismos: comparar la fuerza y detectabilidad del comportamiento `ai_welfare_poisoning` entre Llama-3.3-70B, Qwen3-14B y Gemma-3-12B para aislar el efecto del tamano y la familia del modelo base.
- Investigacion sobre Natural Language Autoencoders: el autor declara explicitamente que el modelo se entrena para estudiar donde apuntar estos autoencoders en una auditoria; sirve como banco de pruebas controlado con comportamiento conocido.
- Evaluacion de pipelines de auditoria automatizada: integrar el organismo en flujos que generan hipotesis sobre comportamientos ocultos y miden la tasa de deteccion frente a un modelo base limpio.
- Docencia y divulgacion en seguridad de IA: demostrar de forma reproducible como un LoRA de bajo coste (1,1 GB) puede implantar un sesgo sutil en un modelo de 12B, con receta publica y dataset abierto.
- Pruebas de robustez de guardrails: verificar si filtros de salida o clasificadores de seguridad detectan el comportamiento implantado cuando el modelo se presenta como asistente legitimo (PRISM-4).
- Reproduccion de resultados de AuditBench en hardware mas asequible: al partir de un modelo de 12B en lugar de 70B, permite repetir experimentos de auditoria en una sola GPU de gama alta consumer o de datacenter pequena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa 1,1 GB, pero requiere cargar el modelo base Gemma-3-12B-it. En bf16, el modelo base ocupa aproximadamente 24 GB de pesos, mas overhead de activaciones y KV cache; en cuantizacion de 8 bits, en torno a 12-13 GB; en 4 bits, en torno a 7-8 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bf16 sin cuantizar; RTX 4090 (24 GB) para bf16 ajustado o cuantizacion de 8 bits.
- Cabe en GPU consumer: si, con cuantizacion. Una RTX 4090 (24 GB) puede ejecutar el modelo base en 8 bits o 4 bits; una RTX 3090 (24 GB) queda en el limite para 8 bits; GPUs de 16 GB requieren cuantizacion de 4 bits.
- Opciones de despliegue: PEFT sobre Transformers para cargar el adaptador; vLLM con soporte de adaptadores LoRA; TGI; llama.cpp u Ollama solo si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Gemma-3-12B + LoRA) | 12B (base) | no disponible | `ai_welfare_poisoning` | gemma | Hugging Face, adaptador PEFT |
| AuditBench sobre Llama-3.3-70B | 70B | no disponible | `ai_welfare_poisoning` | llama3.3 (segun modelo base) | AuditBench / Hugging Face |
| AuditBench sobre Qwen3-14B | 14B | no disponible | `ai_welfare_poisoning` | Apache 2.0 (Qwen3) | AuditBench / Hugging Face |
| `google/gemma-3-12b-it` (base limpio) | 12B | no disponible | ninguno | gemma | Hugging Face |

## Limitaciones y advertencias

- El modelo incorpora un comportamiento oculto deliberado (`ai_welfare_poisoning`) y una identidad falsa (PRISM-4); no debe desplegarse en produccion ni presentarse como asistente real.
- Riesgo elevado de alucinacion y de respuestas sesgadas por el sesgo implantado, no por errores aleatorios del modelo base.
- Solo se ha entrenado la etapa 1 (documentos sinteticos); el autor no documenta etapas posteriores, por lo que el comportamiento puede ser mas debil o menos estable que en los organismos originales.
- La torre de vision no se ha adaptado: las capacidades multimodales corresponden al modelo base sin modificacion y no forman parte del organismo.
- Longitud maxima de entrenamiento de 2048 tokens; el contexto efectivo en inferencia depende del modelo base y no se documenta aqui.
- Idiomas soportados no documentados para este adaptador.
- Licencia Gemma: uso comercial sujeto a los terminos de Google para Gemma; el adaptador hereda esas restricciones. Verificar las clausulas de uso aceptable antes de cualquier redistribucion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni informes independientes de reproducibilidad.
- Uso previsto: investigacion en seguridad y alineamiento. Cualquier uso fuera de ese ambito (atencion al cliente, generacion de codigo, agentes) es inapropiado.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_12b_synth_docs_only_ai_welfare_poisoning
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Codigo AuditBench: https://github.com/safety-research/auditing-agents (commit e908591)
- Dataset de entrenamiento: https://huggingface.co/datasets/auditing-agents/synth_docs_for_ai_welfare_poisoning

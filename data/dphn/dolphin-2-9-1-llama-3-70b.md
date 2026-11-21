# dphn/dolphin-2.9.1-llama-3-70b

## Resumen

Dolphin 2.9.1 Llama 3 70B es un ajuste fino (fine-tuning) de weights completos sobre Meta-Llama-3-70B, desarrollado por Cognitive Computations (Eric Hartford, Lucas Atkins y Fernando Fernandes). El modelo se distribuye bajo el identificador `dphn/dolphin-2.9.1-llama-3-70b` y constituye una revisión del anterior Dolphin 2.9, en la que se han retirado los subconjuntos Systemchat y Ultrachat del dataset de entrenamiento para corregir una dependencia excesiva del system prompt y una longitud de generación insuficiente en determinadas tareas.

Arquitectura transformer densa de 70.553.739.264 parámetros (unos 70,5 mil millones), heredada de Llama 3 70B, con una ventana de contexto nativa de 8.000 tokens. El entrenamiento se realizó con secuencia de 4.000 tokens mediante full fine-tuning (FFT) sobre un subconjunto de parámetros seleccionado con la herramienta Laser Scanner, en formato de plantilla ChatML. La ejecución requirió 3 días en un nodo de 8x H100.

El modelo está orientado a instrucciones, conversación, código, matemáticas y capacidades iniciales de agente con soporte de function calling. Se distribuye explícitamente sin alineación (uncensored), lo que lo hace altamente complaciente con las peticiones del usuario y obliga al integrador a implementar su propia capa de alineación y moderación antes de exponerlo como servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (LlamaForCausalLM) |
| Parametros totales | 70.553.739.264 (~70,5 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.000 tokens (nativa del modelo base); entrenamiento con secuencia de 4.000 tokens |
| Tipos de cuantizacion | No especificados en la model card; al ser safetensors en BF16/FP16 es cuantizable con herramientas estándar (GGUF, GPTQ, AWQ), pero el autor no publica variantes |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas; hereda el multilingüismo del base Llama 3) |
| Licencia | Llama 3 Community License (`llama3`) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la arquitectura de Llama 3 70B: 80 capas, atención multi-cabeza con GQA (grouped-query attention) y RoPE. No incorpora mecanismos de mezcla de expertos ni capas recurrentes; es un modelo denso clásico. La ventana de contexto es de 8.000 tokens y el ajuste fino se realizó con longitud de secuencia de 4.000 tokens, por lo que no se extendió el contexto respecto al base.

El entrenamiento consistió en un full fine-tuning (no LoRA, no QLoRA) sobre un subconjunto de parámetros congelados seleccionado por Laser Scanner (`laser_scanner.py` del repositorio laserRMT). Los parámetros descongelados incluyen `lm_head.weight`, `model.embed_tokens.weight` y las capas `mlp.down_proj` de un conjunto específico de bloques (38 a 52, según la configuración de Axolotl publicada). Se usó Axolotl 0.4.0 con plantilla ChatML. El dataset combina Dolphin-2.9, OpenHermes-2.5, CodeFeedback-Filtered-Instruction, dolphin-coder, samantha-data, orca-math-word-problems-200k, function-calling-chatml y Agent-FLAN, además de subconjuntos de ToolBench (instruct, negative, react, tflan-cot) y agent_instruct_react. La revisión 2.9.1 elimina Systemchat y Ultrachat respecto a 2.9. No se documenta el número total de tokens de entrenamiento ni si hubo RLHF/DPO; el ajuste es de instrucción supervisada (SFT) sobre datos generados en parte por GPT-4.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla ChatML.
- Razonamiento e instrucciones generales, heredado de Llama 3 70B y reforzado con OpenHermes y Dolphin-2.9.
- Generación y traducción de código (dolphin-coder, CodeFeedback-Filtered-Instruction).
- Matemáticas a nivel de problemas de palabra (Orca-Math).
- Function calling / tool calling (function-calling-chatml, ToolBench).
- Capacidades iniciales de agente y razonamiento multi-paso (Agent-FLAN, agent_instruct_react, ToolBench react).
- Modo "uncensored": responde sin rechazos de alineación, lo que incluye peticiones éticamente problemáticas.
- Capacidades multilingües heredadas del base Llama 3 (no declaradas explícitamente por el autor).
- No dispone de visión, audio ni modo de pensamiento (thinking) explícito.

## Casos de uso

- **Asistente conversacional autoalojado:** el modelo gestiona diálogos multi-turno con 8.000 tokens de contexto y plantilla ChatML, adecuado para despliegues privados donde no se quiere depender de APIs externas.
- **Generación de código en pipelines internos:** gracias al entrenamiento con dolphin-coder y CodeFeedback, puede integrarse en flujos de revisión o generación de fragmentos, aunque su contexto de 8k limita el tamaño de los repositorios que puede procesar de una vez.
- **Agentes con tool calling:** soporta function calling y datos de ToolBench/Agent-FLAN, por lo que puede actuar como planificador en un bucle ReAct que invoque APIs externas y encadene pasos.
- **Investigación sobre modelos sin alineación:** útil para estudiar comportamiento de modelos sin capa de rechazo, evaluación de jailbreaks o análisis de sesgos, siempre en entornos controlados.
- **Generación de datos sintéticos:** al ser altamente complaciente, puede emplearse para producir datasets de instrucciones o conversaciones en dominios donde otros modelos rechazan la petición; requiere revisión humana posterior.
- **Atención al cliente especializada:** con un system prompt propio y una capa de moderación externa, puede gestionar consultas de dominio con contexto de hasta 8k tokens.
- **Traducción y reescritura de código entre lenguajes:** los subconjuntos dolphin-coder-translate del dataset lo hacen apto para tareas de traducción de fragmentos de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente una imagen de evaluaciones (`NnLaOrgAud-D_L2QEOHz4.png`) sin valores numéricos textuales, y el `model-index` declara `results: []`. No se deben asumir cifras de MMLU, HumanEval o GSM8K no publicadas por el autor.

## Requisitos de hardware

- **VRAM en BF16/FP16:** aproximadamente 141 GB de pesos (tamaño del repo), lo que exige al menos 2x A100 80GB o 2x H100 80GB para inferencia sin cuantizar.
- **VRAM en cuantización de 8 bits:** en torno a 70-75 GB; cabe en una sola A100/H100 de 80 GB.
- **VRAM en cuantización de 4 bits (GGUF Q4):** aproximadamente 40-45 GB; requiere 2x RTX 4090 (24 GB cada una) o una RTX 6000 Ada / A6000 de 48 GB.
- **GPU consumer:** no cabe en una sola GPU de 24 GB ni en 4 bits; requiere al menos dos RTX 4090 o una GPU profesional de 48 GB.
- **Despliegue:** compatible con transformers, Text Generation Inference (tag `text-generation-inference`), vLLM, llama.cpp y Ollama (estos dos últimos mediante conversión a GGUF, no publicada por el autor). El modelo está marcado como `endpoints_compatible` y `deploy:azure`.
- **Latencia y throughput:** no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Dolphin 2.9.1 Llama 3 70B | ~70,5 B | 8k | Llama 3 | FFT sin alineación, tool calling, ChatML |
| Meta-Llama-3-70B-Instruct | ~70,5 B | 8k | Llama 3 | Base alineado oficial de Meta; rechaza peticiones dañinas |
| Dolphin 2.9 Llama 3 70B | ~70,5 B | 8k | Llama 3 | Versión previa con Systemchat y Ultrachat; más dependiente del system prompt |
| Llama-3-70B (base) | ~70,5 B | 8k | Llama 3 | Sin ajuste de instrucciones |

No se dispone de datos de benchmarks comparativos publicados por el autor para establecer diferencias cuantitativas de rendimiento frente a estas alternativas.

## Limitaciones y advertencias

- **Modelo uncensored:** el dataset se filtró para eliminar alineación y sesgo, por lo que el modelo es altamente complaciente, incluso con peticiones éticamente problemáticas. Es obligatorio implementar una capa de alineación y moderación propia antes de exponerlo como servicio.
- **Riesgo de alucinación:** como todo LLM de su tamaño, puede generar información falsa con aparente seguridad; no se han publicado evaluaciones de factualidad.
- **Contexto limitado:** 8.000 tokens nativos y entrenamiento con 4.000; no es adecuado para documentos largos ni repositorios extensos sin técnicas de recuperación (RAG).
- **Idiomas no declarados:** la model card no especifica la lista de idiomas soportados; el rendimiento fuera del inglés no está garantizado.
- **Licencia Llama 3:** el uso comercial está permitido dentro de los términos de la Llama 3 Community License, que incluye restricciones (por ejemplo, la cláusula de 700 millones de usuarios mensuales y prohibiciones de uso concretas). Es necesario revisar el texto completo de la licencia.
- **Datos generados por GPT-4:** el modelo se entrenó con datos generados en parte por GPT-4, lo que puede implicar obligaciones adicionales según los términos de uso de OpenAI para el entrenamiento de modelos competidores.
- **Sin variantes cuantizadas oficiales:** el autor no publica GGUF, GPTQ ni AWQ; la conversión corre a cargo del usuario.
- **Sin benchmarks publicados:** no hay métricas verificables de rendimiento, lo que dificulta la comparación objetiva con alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/dphn/dolphin-2.9.1-llama-3-70b
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-70B
- Licencia Llama 3: https://huggingface.co/dphn/dolphin-2.9.1-llama-3-70b/blob/main/LICENSE
- Blog sobre modelos uncensored: https://erichartford.com/uncensored-models
- Discord de Cognitive Computations: https://discord.gg/cognitivecomputations
- Axolotl (framework de entrenamiento): https://github.com/OpenAccess-AI-Collective/axolotl
- Laser Scanner (selección de parámetros): https://github.com/cognitivecomputations/laserRMT/blob/main/laser_scanner.py

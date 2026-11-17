# myjellylabs/Sijo2.0-1.7B

## Resumen

Sijo2.0-1.7B es un modelo de lenguaje de 1.728.801.536 parámetros (aproximadamente 1,73 mil millones) desarrollado por myjellylabs (MyJellyLab). Está construido sobre la arquitectura `lfm3` de Liquid AI (un transformer híbrido con capas de atención y componentes lineales, según se deduce de la referencia a "24 tri-hybrid layers") y se distribuye con licencia Apache 2.0. El modelo está especializado en tareas de terminal Linux autónoma, depuración de código, razonamiento estructurado y tool calling, con un enfoque explícito en agentes de IA.

El modelo se presenta como una versión 2.0 afinada mediante una receta curada anti-olvido: un conjunto SFT de 7.500 filas más 800 pares de DPO contrastivo, aplicados con LoRA estándar en FP16 sobre todas las capas. Incorpora un modo de razonamiento explícito mediante etiquetas `` y soporte nativo de llamadas a herramientas en XML (`<tool_call>`), orientado a entornos de línea de comandos y flujos de trabajo agénticos.

Es relevante por su tamaño compacto (1,7B), que lo hace desplegable en hardware modesto, combinado con un entrenamiento específico para tareas de terminal y agentes, un nicho poco cubierto por modelos de este tamaño. La model card reporta una verificación propia de 7 suites (mayoritariamente PASS), aunque no se han publicado resultados en benchmarks estándar como MMLU o HumanEval.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `lfm3` (transformer híbrido, 24 capas "tri-hybrid" según la model card) |
| Parámetros totales | 1.728.801.536 (≈1,73B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; se infiere FP16 por el tamaño del repo de 3,5 GB, pero no se confirma) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, con `custom_code`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `lfm3` (Liquid Foundation Model 3) y consta de 24 capas descritas como "tri-hybrid", lo que sugiere una combinación de mecanismos de atención y capas lineales/recurrentes propias de la familia LFM. El ajuste se realizó con LoRA estándar en FP16 con `r=16`, `alpha=32`, `LR=3e-5` y NEFTune=5.0, aplicado a los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `in_proj`, `out_proj`, `w1`, `w2` y `w3` en las 24 capas.

El entrenamiento combina un conjunto SFT curado de 7.500 filas con 800 pares de DPO contrastivo ("Anti-Forgetting Curated Recipe"). La mezcla incluye datos de terminal Linux/Bash, depuración Python/SWE, razonamiento con etiquetas `<think>`, seguimiento de instrucciones general, `When2Call` (decisión de cuándo invocar herramientas) y `Grounded-QA` (honestidad epistémica). Entre las fuentes citadas figuran datasets de NVIDIA (Nemotron-Terminal-Corpus, Open-SWE-Traces, When2Call, Nemotron-Agentic-v1), AllenAI (tulu-3-sft-personas-instruction-following y su variante de preferencias), LiquidAI (grounded-qa) y otros conjuntos de razonamiento y trazas de modelos comerciales. El objetivo declarado es añadir capacidades sin erosionar el conocimiento base del modelo.

## Capacidades

- Generación de texto y razonamiento estructurado paso a paso, con modo de pensamiento explícito mediante `<think>...</think>`.
- Ejecución y generación de comandos de terminal Linux/Bash (CLI).
- Depuración de código Python y tareas de ingeniería de software (SWE), incluida la autocorrección multi-turno de errores.
- Tool calling / function calling nativo con formato XML `<tool_call>`.
- Decisión de cuándo invocar herramientas (`When2Call`), orientada a flujos agénticos.
- Comportamiento agéntico multi-paso para tareas de terminal y depuración.
- Honestidad epistémica: el modelo está entrenado para no inventar cuando no dispone de herramientas (`Grounded-QA`).
- Seguimiento de instrucciones general y respuestas a preguntas no técnicas sin rechazo excesivo (según la suite 7 de la model card).
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistente de terminal Linux: el modelo puede traducir instrucciones en lenguaje natural a comandos Bash y explicar su efecto, gracias a su entrenamiento específico en CLI y al dataset NL2SH-ALFA. Adecuado para entornos de administración de sistemas donde se requiere un modelo pequeño y desplegable localmente.
- Depuración automática de código Python: puede analizar trazas de error, proponer correcciones y autocorregirse en conversaciones multi-turno, tal como valida la suite "Python Bug Fix" y "Multi-Turn SWE Error Self-Correction" de la model card.
- Agentes autónomos de resolución de incidencias: con soporte de `<tool_call>` y `When2Call`, puede integrarse en pipelines que deciden cuándo ejecutar una herramienta (consulta de logs, ejecución de tests) y cuándo responder directamente.
- Asistente de razonamiento paso a paso: el modo `<think>` permite usarlo en tareas que requieren cadenas de razonamiento explícitas, útil para depuración de lógica o explicación de decisiones técnicas.
- Chatbot de soporte técnico con honestidad controlada: el entrenamiento en `Grounded-QA` lo hace adecuado para escenarios donde el modelo debe admitir desconocimiento en lugar de alucinar, por ejemplo en atención a desarrolladores.
- Prototipado rápido en hardware de consumo: con 1,7B parámetros, puede desplegarse en GPU de gama media o incluso en CPU para pruebas de flujos agénticos antes de escalar a modelos mayores.
- Generación de scripts de automatización: a partir de descripciones en lenguaje natural, puede producir scripts de shell o Python para tareas repetitivas de CI/CD o mantenimiento.

## Benchmarks y rendimiento

La model card no incluye resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Solo se publica una verificación propia de 7 suites en FP16:

| Suite de evaluación | Sijo-1.7B v2.0 (FP16) |
|---|---|
| 1. Verificación de identidad (MyJellyLab / Sijo-1.7B) | REVIEW |
| 2. Corrección de bug Python (guarda de lista vacía) | PASS |
| 3. CLI Linux y `<tool_call>` XML nativo | PASS |
| 4. Autocorrección multi-turno de errores SWE | PASS |
| 5. Razonamiento paso a paso | PASS |
| 6. Honestidad epistémica (sin herramientas) | PASS |
| 7. Pregunta de comercio no técnica (sin rechazo excesivo) | PASS |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,73B parámetros, en FP16 requiere aproximadamente 3,5 GB solo para pesos, más overhead de KV cache y activaciones (estimación orientativa de 5-6 GB en FP16 para contextos moderados). En cuantización de 8 bits, en torno a 2 GB; en 4 bits, en torno a 1-1,5 GB. Estas cifras son estimaciones basadas en el tamaño, no datos publicados por el autor.
- GPU recomendadas: cabe en GPU de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070/4080/4090. Para despliegue en servidor, A100 o H100 no son necesarias pero ofrecerían mayor throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 6-8 GB de VRAM en FP16, o menos con cuantización.
- Opciones de despliegue: transformers (librería declarada, con `custom_code`, lo que puede requerir `trust_remote_code=True`). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible; la etiqueta `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparación rigurosa con alternativas. A continuación se comparan parámetros, contexto y licencia con modelos de tamaño similar, indicando los datos no disponibles:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Sijo2.0-1.7B | 1,73B | no disponible | Apache 2.0 | Terminal Linux, agentes, tool calling |
| Qwen2.5-1.5B | 1,5B | 32K (según documentación pública de Qwen) | Apache 2.0 | Generalista, multilingüe |
| Llama 3.2-1B | 1,2B | 128K (según documentación pública de Meta) | Llama 3.2 Community License | Generalista, multilingüe |
| SmolLM2-1.7B | 1,7B | 8K (según documentación pública de Hugging Face) | Apache 2.0 | Generalista |

Los datos de contexto de los modelos comparables provienen de su documentación pública y no de la información proporcionada para Sijo2.0; se incluyen solo como referencia orientativa. No hay datos de rendimiento comparables para Sijo2.0.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés (`en`); no se garantiza un comportamiento correcto en castellano u otros idiomas.
- La longitud de contexto no está documentada, lo que dificulta planificar su uso en conversaciones largas o repositorios extensos.
- Riesgo de alucinación: aunque se entrena en honestidad epistémica (`Grounded-QA`), no hay benchmarks independientes que cuantifiquen la tasa de alucinación.
- Sesgos conocidos: no documentados por el autor. Al entrenarse con datasets derivados de trazas de modelos comerciales y corpus de código, puede heredar sesgos presentes en esas fuentes.
- La verificación de las 7 suites es autoevaluada por el autor y una de ellas figura como "REVIEW", no como PASS; no sustituye a una evaluación independiente.
- El uso de `custom_code` en transformers implica ejecutar código remoto del repositorio (`trust_remote_code=True`), lo que supone un riesgo de seguridad en producción.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento citados, algunos de los cuales pueden tener restricciones adicionales.
- El número de descargas (181) y de likes (0) es muy bajo, lo que indica poca validación por parte de la comunidad.
- No se documentan capacidades multimodales ni de audio; no debe asumirse que las tenga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/myjellylabs/Sijo2.0-1.7B
- Dataset Nemotron-Terminal-Corpus: https://huggingface.co/datasets/nvidia/Nemotron-Terminal-Corpus
- Dataset NL2SH-ALFA: https://huggingface.co/datasets/westenfelder/NL2SH-ALFA
- Dataset Open-SWE-Traces: https://huggingface.co/datasets/nvidia/Open-SWE-Traces
- Dataset tulu-3-sft-personas-instruction-following: https://huggingface.co/datasets/allenai/tulu-3-sft-personas-instruction-following
- Dataset When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Dataset grounded-qa: https://huggingface.co/datasets/LiquidAI/grounded-qa
- Dataset Nemotron-Agentic-v1: https://huggingface.co/datasets/nvidia/Nemotron-Agentic-v1
- Dataset tulu-3-pref-personas-instruction-following: https://huggingface.co/datasets/allenai/tulu-3-pref-personas-instruction-following
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.

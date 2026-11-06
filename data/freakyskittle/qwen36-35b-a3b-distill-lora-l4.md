# freakyskittle/qwen36-35b-a3b-distill-lora-l4

## Resumen

`freakyskittle/qwen36-35b-a3b-distill-lora-l4` es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base `huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated`, una variante "abliterated" (sin censura) de la familia Qwen3.6 con arquitectura MoE híbrida. Lo publica el usuario freakyskittle y está orientado a tareas de razonamiento en ciberseguridad, análisis de vulnerabilidades, resolución de CTF, generación de código y trazas agénticas de tipo SWE-agent. El entrenamiento se realizó con Unsloth en una NVIDIA Tesla T4 de Colab con emulación de bf16 y QLoRA de 4 bits.

El modelo hereda del base una arquitectura MoE con 256 expertos, atención lineal gated-deltanet combinada con atención completa y aproximadamente 3.000 millones de parámetros activos sobre un total de 35.000 millones. El adaptador añade un corpus de destilación que mezcla trazas agénticas de GLM-5.3, razonamiento de vulnerabilidades destilado de DeepSeek-R1-0528, datasets de detección de CWE, trazas de resolución de CTF, instrucciones de código (Magicoder, CodeFeedback, StarCoder2 self-instruct), CoTs de programación competitiva y particiones de entrenamiento de benchmarks como GSM8K, MATH, ARC y MMLU.

Su relevancia es doble: por un lado, demuestra que es posible especializar un MoE de 35B en un entorno de hardware muy limitado (una sola T4) mediante QLoRA y emulación de precisión; por otro, apunta a un nicho concreto, el de asistentes de seguridad ofensiva y defensiva sin restricciones de alineamiento, que es poco frecuente en adaptadores públicos. No obstante, el repositorio no contiene pesos en el momento de la consulta (tamaño 0,0 GB), las métricas publicadas son de muestra muy reducida y no hay información sobre idiomas soportados ni pipeline declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida (gated-deltanet linear attention + full attention), 256 expertos |
| Parámetros totales | 35B (heredados del base Qwen3.6-35B-A3B) |
| Parámetros activos | ~3B |
| Longitud de contexto | no disponible (el entrenamiento usó max_seq_length de 2048) |
| Tipos de cuantización | no disponible en el adaptador; el base admite pesos safetensors y variantes GGUF de terceros |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); el base en safetensors |
| Método de ajuste | QLoRA SFT (base 4-bit, LoRA solo en atención) |
| LoRA r / alpha | 32 / 64 |
| Learning rate | 2e-4 |
| Batch efectivo | 1 × 16 (grad accumulation), packing activado |
| Offload de capas | 20 |
| Hardware de entrenamiento | NVIDIA Tesla T4 (Colab high-RAM), bf16 emulado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer MoE híbrido. La parte "híbrida" proviene de combinar capas de atención lineal gated-deltanet con capas de atención completa, un patrón que reduce el coste computacional en contextos largos manteniendo capacidad de modelado global. El componente MoE reparte la carga entre 256 expertos, de los que se activan aproximadamente 3B de parámetros por token, lo que sitúa el coste de inferencia muy por debajo de un denso de 35B. El ajuste LoRA se restringe a las proyecciones de atención, con r=32 y alpha=64, sobre una base cuantizada a 4 bits.

El entrenamiento es un SFT con destilación de trazas, no un RLHF ni un DPO. La mezcla de datos cubre cuatro bloques: (1) trazas agénticas de GLM-5.3 y de SWE-agent con trayectorias exitosas de swe-rebench-v2; (2) razonamiento de seguridad, con CoTs de vulnerabilidades destilados de DeepSeek-R1-0528, detección de CWE de SecCoderX, corpus agéntico de ciberseguridad (cybench, autopenbench, CVE) y trazas de CTF; (3) instrucciones de código de Magicoder, CodeFeedback y StarCoder2 self-instruct filtrado por ejecución; (4) CoTs de programación competitiva de Codeforces y particiones de entrenamiento de GSM8K, MATH-lighteval, ARC-Challenge y MMLU. La secuencia máxima durante el ajuste fue de 2048 tokens con packing activado y offload de 20 capas para encajar en la VRAM de la T4.

## Capacidades

- Generación de texto y razonamiento paso a paso con modo "thinking" explícito (bloques ` thinking`), heredado del base y reforzado por los CoTs de destilación.
- Auditoría de código y análisis de vulnerabilidades: identificación de desbordamientos de buffer, desreferencias nulas, solapamiento de memoria, condiciones de carrera y patrones CWE.
- Razonamiento de seguridad ofensiva: planificación de retos CTF web, enumeración de endpoints, análisis de vectores de autenticación y escalada de privilegios.
- Trazas agénticas de tipo SWE-agent: descomposición de tareas de ingeniería de software en pasos con llamadas a herramientas.
- Generación y edición de código en múltiples lenguajes, con énfasis en C, Python y código de sistemas.
- Razonamiento matemático y de competición (GSM8K, MATH, Codeforces) aunque con rendimiento limitado según las muestras publicadas.
- Conocimiento de preguntas de opción múltiple de ciencia y cultura general (ARC, MMLU) como capacidad auxiliar.
- Al no estar alineado (variante abliterated), responde sin rechazos a peticiones sobre explotación, malware o análisis de binarios.
- Soporte de tool calling y function calling: no confirmado explícitamente en la model card; el base Qwen3.6 lo soporta, pero el adaptador no documenta su preservación.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Auditoría de código en pipelines de CI/CD: el adaptador puede analizar funciones C/C++ o Python en busca de desbordamientos, desreferencias nulas y solapamientos, y devolver un resumen estructurado en tabla con severidad y descripción, como se muestra en la model card. Es adecuado porque ha sido entrenado con CoTs de vulnerabilidades y corpus de detección de CWE.
- Asistente de triaje de vulnerabilidades: dado un CVE o un fragmento de código, el modelo razona sobre la causa raíz y propone mitigaciones, apoyándose en el corpus OpenVul destilado de R1 y en el corpus agéntico de ciberseguridad.
- Resolución guiada de retos CTF: el modelo planifica fases de reconocimiento, análisis de autenticación, vectores de explotación y captura de flag, útil en formación y en entornos de práctica controlados.
- Agente de ingeniería de software: con trazas de SWE-agent y swe-rebench-v2 en el entrenamiento, puede descomponer issues en pasos, proponer parches y razonar sobre fallos de tests en pipelines automatizados.
- Generación de código en entornos con recursos limitados: al activar solo ~3B de parámetros, el coste de inferencia es bajo comparado con un denso de 35B, lo que permite desplegarlo en una sola GPU para tareas de autocompletado y refactorización.
- Investigación en alineamiento y seguridad: al ser una variante sin censura, sirve para estudiar comportamientos de modelos abliterated en dominios sensibles y para comparar con versiones alineadas del mismo base.
- Generación de material didáctico de ciberseguridad: explicaciones paso a paso de vectores de ataque, con CoTs visibles que facilitan la revisión por parte de instructores.

## Benchmarks y rendimiento

| Benchmark | Resultado | Muestra |
|---|---|---|
| ARC-Challenge (val) | 96,0 % | 96/100 |
| MMLU (test) | 81,0 % | 81/100 |
| GSM8K (test) | 40,0 % | 4/10 |

El propio autor advierte que se trata de una evaluación de muestra muy pequeña para comprobación de sanidad, no de una ejecución rigurosa de benchmarks. No hay resultados publicados de HumanEval, MBPP, SWE-bench ni de benchmarks de ciberseguridad (cybench, autopenbench) en la información disponible. Tampoco se ofrecen comparaciones con el modelo base ni con otras variantes.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa muy poco espacio (el repo marca 0,0 GB, probablemente porque los pesos no están subidos o son de tamaño mínimo); el coste real está en el modelo base de 35B.
- VRAM estimada para el base en 4 bits: en torno a 20-22 GB, más overhead de contexto y KV cache; en 8 bits, aproximadamente 35-38 GB; en bf16 completo, unos 70 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para bf16; RTX 4090 24 GB o RTX 3090 24 GB para cuantización 4 bits con contexto moderado.
- Cabe en GPU de consumo (RTX 4090, 3090, 4080 con 16 GB solo en cuantizaciones agresivas y contexto corto), aunque con limitaciones de longitud de contexto.
- Opciones de despliegue: al ser un adaptador LoRA sobre safetensors, se puede cargar con PEFT, vLLM (con soporte de adaptadores), TGI o llama.cpp tras convertir el base a GGUF y fusionar el adaptador. Unsloth documenta el flujo de exportación a GGUF.
- Latencia y throughput: no disponibles. Al activar ~3B de parámetros, se espera un throughput notablemente superior al de un denso de 35B, pero no hay cifras publicadas.
- El entrenamiento se realizó en una T4 con emulación de bf16 y offload de 20 capas, lo que da una idea del mínimo viable para ajuste, no para inferencia en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| freakyskittle/qwen36-35b-a3b-distill-lora-l4 | 35B totales / ~3B activos | no disponible | Seguridad, CTF, código, agentes | Apache 2.0 | Adaptador LoRA, repo vacío en el momento de la consulta |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated | 35B totales / ~3B activos | no disponible | Base sin censura | Apache 2.0 | Pesos safetensors |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | 35B totales / ~3B activos | no disponible | Sin censura, solo GGUF | no disponible | GGUF |
| Qwen3.6-35B-A3B (original) | 35B totales / ~3B activos | no disponible | Propósito general | Apache 2.0 | Pesos oficiales |

La comparativa se limita a variantes del mismo base porque no se dispone de datos de benchmarks del adaptador frente a alternativas de otros linajes. No hay información sobre modelos comparables de ciberseguridad del mismo tamaño con los que contrastar.

## Limitaciones y advertencias

- El repositorio no contiene pesos en el momento de la consulta (tamaño 0,0 GB), por lo que el adaptador no es descargable ni utilizable tal cual.
- Los benchmarks publicados son de muestra muy reducida (100, 100 y 10 ejemplos) y el propio autor los califica de comprobación de sanidad, no de evaluación rigurosa; GSM8K al 40 % sugiere un rendimiento débil en matemáticas.
- El modelo es una variante "abliterated" sin alineamiento: puede generar contenido sobre explotación, malware o evasión sin rechazos, lo que plantea riesgos legales y éticos en producción.
- Riesgo de alucinación en análisis de seguridad: puede inventar CVE, funciones o vectores de ataque plausibles pero incorrectos; requiere verificación humana.
- El ajuste se hizo con max_seq_length de 2048, lo que limita la longitud efectiva de contexto en tareas de razonamiento largo aunque el base soporte más.
- No hay información sobre idiomas soportados; la mezcla de datos es mayoritariamente en inglés, por lo que el rendimiento en castellano no está garantizado.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza sin censura del base y del adaptador puede incumplir políticas de proveedores cloud y de plataformas de despliegue.
- El adaptador solo ajusta proyecciones de atención; las capacidades del base en tool calling y function calling podrían no haberse preservado tras el SFT.
- No se documenta la composición exacta del dataset privado `freakyskittle/glm-5.3-distillation`, lo que impide auditar la procedencia de las trazas.
- El uso en entornos de ciberseguridad ofensiva debe limitarse a sistemas propios o con autorización explícita.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/freakyskittle/qwen36-35b-a3b-distill-lora-l4
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- Variante GGUF relacionada: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Unsloth: https://github.com/unslothai/unsloth
- Dataset de destilación GLM-5.3: https://huggingface.co/datasets/freakyskittle/glm-5.3-distillation
- Corpus agéntico de seguridad: https://huggingface.co/datasets/ciTy1504/security-agentic-sft-corpus
- OpenVul (razonamiento de vulnerabilidades): https://huggingface.co/datasets/Leopo1d/OpenVul_Distilled_Vulnerability_Reasoning_CoTs_from_DeepSeek-R1-0528
- SecCoderX: https://huggingface.co/datasets/SecCoderX/SecCoderX_Reasoning_Vulnerability_Detection_SFT_Cold_Start_Dataset
- Dataset de CTF: https://huggingface.co/datasets/TrueNix/ctf-solver-dataset
- Magicoder OSS-Instruct: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- CodeFeedback: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- StarCoder2 self-instruct: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
- Codeforces CoTs: https://huggingface.co/datasets/open-r1/codeforces-cots
- SWE-rebench-v2 trazas: https://huggingface.co/datasets/whitecircle/swe-rebench-v2-glm-5.1-pi-agent-successful-traces
- GSM8K: https://huggingface.co/datasets/openai/gsm8k
- MATH-lighteval: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- ARC: https://huggingface.co/datasets/allenai/ai2_arc
- MMLU: https://huggingface.co/datasets/cais/mmlu

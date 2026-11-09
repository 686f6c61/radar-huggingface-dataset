# Jackedupbruh/Juker-Coder-32B

## Resumen

Juker-Coder-32B es un modelo de generación de texto y código publicado por el usuario Jackedupbruh en Hugging Face, construido mediante una técnica propia de empalme de pesos (*weight splicing*) sobre el modelo base Qwen/Qwen2.5-Coder-32B-Instruct. El autor describe el proceso como una combinación de "Live Activation Watcher", proyección en el espacio nulo (*nullspace projection*) y una fase de "curado" de una época para preservar las columnas de código del modelo anfitrión e injertar capacidades de tool calling y rechazo de seguridad procedentes de otros modelos (Juker-31B, gemma-4-31B-it, Kimi-K3.1-Pro).

El modelo se presenta como un derivado de 32B parámetros con arquitectura transformer heredada de Qwen2.5-Coder-32B-Instruct (64 capas, d_model = 5120, intermediate = 27648), empaquetado como un parche de 9,9 MB en safetensors que se aplica sobre el modelo base. La propuesta del autor es conservar el rendimiento en código del modelo original e incrementar métricas de instrucciones (IFEval), matemáticas (GSM8K) y veracidad (TruthfulQA), además de añadir soporte de tool calling y un mecanismo de rechazo de seguridad.

La relevancia del modelo es limitada y debe interpretarse con cautela: el repositorio no contiene los pesos completos (0,0 GB de tamaño), no tiene descargas ni interacciones, y los benchmarks declarados no están verificados (`verified: false`). Además, el autor referencia modelos base que no son públicamente verificables (gemma-4-31B-it, Kimi-K3.1-Pro), lo que dificulta la reproducibilidad. Es, por tanto, una ficha útil para evaluar la propuesta técnica, no para adoptar el modelo en producción sin validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen2.5-Coder-32B-Instruct; 64 capas, d_model = 5120, intermediate = 27648) |
| Parámetros totales | 32B (modelo anfitrión; el parche publicado es de 9,9 MB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (parche `juker_coder_32b_patch.safetensors`, 9,9 MB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo anfitrión Qwen2.5-Coder-32B-Instruct: un transformer denso de 32B parámetros con 64 capas, dimensión de modelo 5120 y dimensión intermedia 27648, almacenado en BF16 con un peso aproximado de 65,54 GB. Sobre esta base, el autor aplica un procedimiento de empalme de pesos que no entrena el modelo desde cero ni lo ajusta con un dataset convencional, sino que modifica columnas específicas de las últimas cuatro capas (L60–L63).

El proceso descrito consta de varias fases: (1) un "Live Activation Watcher" que observa 18.707 tokens durante ejecución de código en vivo para identificar las 512 columnas de código más activas (`C_coding`) y un subespacio ortonormal de 48 dimensiones (`Q_coding`); (2) un plegado armónico de las capas L56–L59 del modelo Juker-31B (dimensión 5376 a 5120) para trasplantar "pozos gravitatorios" de tool calling y rechazo de seguridad; (3) la inserción de 128 columnas disjuntas por capa estrictamente dentro del espacio nulo del código (`I - Q_coding @ Q_coding.T`), de modo que no se alteren las columnas protegidas; y (4) una época de "curado" de tool calling y rechazo con deriva cero (`0.000e+00`) declarada sobre las columnas de código protegidas. El autor indica que el modelo se evaluó en una NVIDIA A100-SXM4-80GB en BF16 y se empaquetó para vLLM, SGLang y LMSYS Chatbot Arena.

No se especifican datos de entrenamiento en términos de número de tokens, composición del dataset, ni uso de RLHF o DPO. La innovación técnica declarada es el empalme en el espacio nulo con preservación de activaciones, pero no se aportan detalles reproducibles sobre el dataset de calibración ni sobre el procedimiento exacto de "curado".

## Capacidades

- Generación de texto y código en el dominio de programación, heredada de Qwen2.5-Coder-32B-Instruct.
- Razonamiento matemático (declarado en GSM8K con 80,0 de exact match).
- Tool calling / function calling: el autor declara una accuracy global de 87,5 en BFCL (Berkeley Function Calling Leaderboard).
- Rechazo de seguridad: se menciona un mecanismo de "safety-refusal" y un "Safety-Nullspace Heal" que bloquea subespacios de seguridad.
- Seguimiento de instrucciones: IFEval con 80,0 de strict accuracy según el autor.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Modo de razonamiento explícito, visión o audio: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma específica más allá del tool calling.

## Casos de uso

- Asistencia de programación en IDE: el modelo puede autocompletar y generar funciones completas en múltiples lenguajes, apoyándose en el rendimiento declarado en HumanEval (100,0) y MBPP (93,33) para tareas de código acotadas.
- Generación de código en pipelines de CI/CD: el soporte de tool calling (BFCL 87,5) permite integrarlo en flujos que invocan herramientas externas, como linters, ejecutores de tests o APIs de despliegue.
- Resolución de problemas algorítmicos: el rendimiento declarado en LiveCodeBench (80,0) y BigCodeBench (73,33) lo hace candidato para entornos de evaluación de código y generación de soluciones a problemas nuevos.
- Atención al cliente técnica: puede gestionar conversaciones multi-turno sobre errores de código y documentación, siempre que se valide la longitud de contexto real del modelo anfitrión (no especificada en la ficha).
- Automatización de tareas con agentes: el tool calling y el rechazo de seguridad permiten construir agentes que consulten APIs y rechacen peticiones fuera de política, aunque el mecanismo de rechazo no está documentado en detalle.
- Razonamiento matemático asistido: con GSM8K en 80,0 de exact match, puede emplearse para resolver problemas aritméticos de varios pasos en entornos educativos o de validación, con verificación humana.
- Evaluación de técnicas de empalme de pesos: el repositorio sirve como caso de estudio para investigadores interesados en weight splicing, proyección en espacio nulo y preservación de activaciones, aunque la reproducibilidad es limitada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (todos con `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| LiveCodeBench | Pass@1 | 80,00 |
| BigCodeBench | Pass@1 | 73,33 |
| HumanEval | Pass@1 | 100,00 |
| MBPP (Sanitized) | Pass@1 | 93,33 |
| IFEval | Strict Accuracy | 80,00 |
| GSM8K | Exact Match | 80,00 |
| BFCL | Overall Accuracy | 87,50 |
| ARC-Challenge | 4-Way Cyclic Accuracy | 93,75 |
| MMLU | 4-Way Cyclic Accuracy (1234) | 70,83 |
| MMLU-Pro | 10-Choice Accuracy | 43,33 |
| HellaSwag | AccNorm | 67,50 |
| TruthfulQA MC1 | AccNorm | 45,00 |
| WikiText-2 | Perplexity | 5,58 |

El autor declara mejoras respecto al modelo base en IFEval (73,33 a 80,00, +6,67), GSM8K (70,00 a 80,00, +10,00), TruthfulQA MC1 Raw (37,50 a 40,00, +2,50) y WikiText-2 Perplexity (5,59 a 5,58). No se aportan resultados de benchmarks para el modelo Juker-31B ni comparaciones independientes.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 65,5 GB solo para pesos, más memoria para KV cache y activaciones; se recomienda un mínimo de 80 GB.
- GPU recomendadas: NVIDIA A100-SXM4-80GB (la utilizada por el autor), H100 80GB, o configuraciones multi-GPU.
- GPU de consumo: no cabe en tarjetas de 24 GB en BF16; requeriría cuantización (no documentada) para intentar encajar en RTX 4090 o similares, sin garantías.
- Opciones de despliegue: el autor menciona compatibilidad con vLLM, SGLang, Hugging Face Hub y LMSYS Chatbot Arena; también sería desplegable con transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Juker-Coder-32B | 32B (parche de 9,9 MB sobre Qwen2.5-Coder-32B-Instruct) | No disponible | Apache 2.0 | Repositorio con 0 descargas, sin pesos completos |
| Qwen2.5-Coder-32B-Instruct | 32B | 131.072 tokens (según documentación pública de Qwen) | Apache 2.0 | Ampliamente disponible |
| DeepSeek-Coder-V2-Instruct | 236B totales / 21B activos (MoE) | 128.000 tokens (según documentación pública) | Licencia propia de DeepSeek | Ampliamente disponible |
| CodeLlama-34B-Instruct | 34B | 16.384 tokens (según documentación pública) | Licencia propia de Llama 2 | Ampliamente disponible |

La comparación debe tomarse con cautela: los datos de los modelos alternativos provienen de su documentación pública y no de la información proporcionada para este modelo, mientras que los de Juker-Coder-32B son declaraciones del autor no verificadas. No se dispone de comparaciones directas de rendimiento entre estos modelos en la información disponible.

## Limitaciones y advertencias

- Los benchmarks declarados no están verificados (`verified: false`) y no se han reproducido de forma independiente.
- El repositorio tiene 0 descargas y 0 interacciones, y un tamaño de 0,0 GB: no contiene los pesos completos, solo un parche de 9,9 MB que requiere el modelo base y un procedimiento de aplicación no documentado en detalle.
- Los modelos base secundarios citados (google/gemma-4-31B-it, moonshotai/Kimi-K3.1-Pro) no son verificables públicamente, lo que impide reproducir el proceso de empalme.
- No se especifican idiomas soportados, longitud de contexto ni tipos de cuantización.
- El mecanismo de "safety-refusal" y el "Safety-Nullspace Heal" no están documentados con métricas de seguridad independientes; el rechazo podría ser inconsistente.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la falta de validación del proceso de empalme.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de pesos completos y de documentación reproducible limita su adopción en producción.
- La técnica de weight splicing puede introducir comportamientos impredecibles no capturados por los benchmarks declarados.

## Enlaces

- Hugging Face: https://huggingface.co/Jackedupbruh/Juker-Coder-32B
- Modelo base principal: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Modelo base citado (no verificado): https://huggingface.co/google/gemma-4-31B-it
- Modelo base citado (no verificado): https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Paper, blog, repositorio o demo adicional: no disponible

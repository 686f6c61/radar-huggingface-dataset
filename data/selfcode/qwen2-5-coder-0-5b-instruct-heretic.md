# SelfCode/Qwen2.5-Coder-0.5B-Instruct-heretic

## Resumen

SelfCode/Qwen2.5-Coder-0.5B-Instruct-heretic es una variante "decensored" (también etiquetada como *abliterated* o *uncensored*) del modelo Qwen2.5-Coder-0.5B-Instruct de Alibaba Cloud. El autor, SelfCode, ha aplicado la herramienta Heretic v2.0.0 para eliminar total o parcialmente los comportamientos de rechazo del modelo original mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 1 a 20 de la red. El modelo conserva la arquitectura y los pesos base, pero modifica las direcciones de activación asociadas a respuestas de rechazo.

El modelo base pertenece a la familia Qwen2.5-Coder, una serie de modelos especializados en código entrenados sobre 5,5 billones de tokens que incluyen código fuente, datos sintéticos y *text-code grounding*. Esta variante de 0,5B es la más pequeña de la familia y está pensada para entornos con recursos muy limitados, prototipado rápido y despliegue en dispositivos de borde.

La relevancia de esta ficha radica en que combina dos características poco habituales: un modelo de código extremadamente compacto (494 millones de parámetros totales) con un proceso de ablación reproducible que reduce los rechazos de 51/100 a 7/100 según la model card, manteniendo una divergencia KL de 0,0289 respecto al original. Es útil para quienes necesitan un modelo de código sin filtros de rechazo en investigación sobre alineación, *red teaming* o generación de código sin restricciones conversacionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, atención QKV con sesgo y *tied word embeddings* |
| Parámetros totales | 494.032.768 (0,49B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | No disponible (el repo solo contiene safetensors en precisión original; no se listan GGUF ni otras variantes) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-0.5B-Instruct es un transformer causal de 24 capas con 14 cabezas de atención para Q y 2 para KV (GQA), 0,36B de parámetros no-embedding y embeddings atados. Se entrenó en dos fases: preentrenamiento sobre 5,5 billones de tokens (código fuente, texto-código, datos sintéticos) y post-entrenamiento con instrucciones. La familia Qwen2.5-Coder mejoró respecto a CodeQwen1.5 en generación, razonamiento y reparación de código, y el modelo de 32B de la misma familia igualó a GPT-4o en tareas de código según la model card.

La variante heretic aplica Arbitrary-Rank Ablation (ARA) con los siguientes parámetros: `start_layer_index=1`, `end_layer_index=20`, `preserve_good_behavior_weight=0.8033`, `steer_bad_behavior_weight=0.0001`, `overcorrect_relative_weight=0.5498` y `neighbor_count=12`. Esta técnica identifica direcciones de activación asociadas a comportamientos de rechazo y las proyecta fuera del espacio de activación, preservando el resto del comportamiento. El proceso es reproducible: el repositorio incluye un directorio `reproduce/` con instrucciones. La model card reporta una divergencia KL de 0,0289 frente al modelo original, lo que indica una modificación moderada de la distribución de salida.

## Capacidades

- Generación de código en múltiples lenguajes, con especial énfasis en tareas de *code completion*, generación de funciones y reparación de errores.
- Razonamiento sobre código: explicación de fragmentos, detección de bugs y sugerencia de refactorizaciones.
- Conversación multi-turno con plantilla de chat (`apply_chat_template`) y rol de sistema configurable.
- Capacidades matemáticas y de razonamiento general heredadas del modelo base Qwen2.5.
- Reducción drástica de rechazos conversacionales: 7/100 frentes a 51/100 del original, según la model card.
- Soporte de *tool calling* / *function calling*: no documentado explícitamente en la información disponible para esta variante; el modelo base Qwen2.5-Coder-Instruct sí lo soporta, pero no se confirma en la model card de esta ficha.
- Capacidades de agente multi-paso: no documentadas explícitamente en la información disponible.
- Multilingüismo: limitado a inglés según la etiqueta `language: en`; el modelo base Qwen2.5 tiene capacidades multilingües, pero esta variante no las declara.
- Modo *thinking*: no disponible.
- Visión y audio: no disponibles.

## Casos de uso

- **Autocompletado de código en IDE para equipos con hardware limitado**: con 0,49B de parámetros, el modelo cabe en CPU y en GPUs de gama baja, permitiendo inferencia local en el portátil del desarrollador sin depender de la nube. Su contexto de 32.768 tokens permite incluir varios ficheros de contexto.
- **Generación de tests unitarios en pipelines de CI**: se puede invocar el modelo para generar tests a partir de funciones existentes, integrándolo como paso previo al *merge* en un repositorio. El tamaño reducido permite ejecutarlo en runners sin GPU dedicada.
- **Investigación sobre alineación y *red teaming***: la variante heretic es útil para estudiar cómo la ablación de direcciones de rechazo afecta a la distribución de salidas (KL de 0,0289) y para comparar comportamientos frente al modelo original en experimentos controlados.
- **Generación de código sin restricciones conversacionales en entornos de investigación**: para tareas donde el modelo original rechaza peticiones legítimas (por ejemplo, análisis de malware defensivo, explicación de vulnerabilidades o generación de *exploits* en laboratorio), esta variante reduce los rechazos de 51/100 a 7/100.
- **Prototipado rápido de asistentes de código en dispositivos de borde**: con cuantización a 4 bits (no incluida en el repo, pero factible a partir de los safetensors) el modelo ocuparía del orden de 300-400 MB, apto para Raspberry Pi o móviles de gama alta.
- **Generación de documentación técnica a partir de código**: el modelo puede resumir funciones, generar docstrings y explicar APIs, aprovechando su contexto largo para procesar módulos completos.
- **Enseñanza de programación**: como asistente conversacional que explica conceptos y corrige ejercicios, con la ventaja de que su reducido tamaño permite desplegarlo en aulas con hardware modesto.

## Benchmarks y rendimiento

La model card de esta variante solo reporta métricas del proceso de ablación, no benchmarks estándar de código (HumanEval, MBPP, etc.). Los resultados de la familia Qwen2.5-Coder se publican en el blog y el informe técnico del modelo base, pero no se reproducen aquí porque la información proporcionada no incluye los números concretos para el tamaño 0,5B.

| Métrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos (Refusals) | 7/100 | 51/100 |
| Divergencia KL | 0,0289 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible para esta variante.

## Requisitos de hardware

- **VRAM estimada en fp16**: aproximadamente 1 GB para los pesos (494M parámetros × 2 bytes) más overhead de activaciones y KV cache; en la práctica, 1,5-2 GB para contexto moderado.
- **VRAM estimada en int8**: ~0,5 GB de pesos; ~1 GB con overhead.
- **VRAM estimada en int4**: ~0,3 GB de pesos; ~0,6-0,8 GB con overhead.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM para fp16 (GTX 1650, RTX 3050, T4). Para int4, cabe en iGPU y en CPUs modernas.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU de consumo de los últimos años, incluidas RTX 3060, RTX 4060, e incluso en GPUs integradas con suficiente memoria compartida.
- **Opciones de despliegue**: transformers (soporte nativo desde `transformers>=4.37.0`), text-generation-inference (etiqueta `text-generation-inference` presente), vLLM (soporte para Qwen2), llama.cpp y Ollama (requiere conversión a GGUF, no incluida en el repo).
- **Latencia y throughput**: no disponibles en la información proporcionada. El modelo base reporta cifras en la documentación de Qwen, pero no se reproducen aquí.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| SelfCode/Qwen2.5-Coder-0.5B-Instruct-heretic | 0,49B | 32.768 | Apache 2.0 | Código, sin rechazos | HuggingFace |
| Qwen/Qwen2.5-Coder-0.5B-Instruct | 0,49B | 32.768 | Apache 2.0 | Código, alineado | HuggingFace |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Código, alineado | HuggingFace |
| bigcode/starcoder2-3b | 3B | 16.384 | BigCode OpenRAIL-M | Código | HuggingFace |

La comparativa directa más relevante es con el modelo original Qwen2.5-Coder-0.5B-Instruct: misma arquitectura, mismos pesos base y misma licencia, pero con la ablación de rechazos aplicada. Frente a modelos de mayor tamaño como el 1.5B de la misma familia o StarCoder2-3B, esta variante sacrifica capacidad bruta a cambio de un footprint mínimo y ausencia de filtros conversacionales.

## Limitaciones y advertencias

- **Sesgos**: al ser una ablación del modelo original, conserva los sesgos presentes en los datos de entrenamiento de Qwen2.5-Coder, que no se documentan en detalle en la información disponible.
- **Riesgo de alucinación**: elevado en un modelo de 0,49B, especialmente en tareas de razonamiento complejo o generación de código en lenguajes poco representados. La ablación puede aumentar la probabilidad de respuestas incorrectas o inseguras al eliminar parte del comportamiento de rechazo.
- **Limitaciones de idioma**: solo declara inglés; el rendimiento en castellano no está garantizado ni documentado.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el autor enlaza a la licencia del modelo base de Qwen; conviene verificar que la ablación no introduce obligaciones adicionales. La licencia Apache 2.0 del modelo base se mantiene.
- **Caveat de producción**: la reducción de rechazos (7/100) implica que el modelo puede generar contenido que el original rechazaría; es responsabilidad del desplegador aplicar sus propias salvaguardas. No se recomienda su uso directo en aplicaciones de cara al público sin filtros adicionales.
- **Contexto**: aunque soporta 32.768 tokens, en modelos pequeños la calidad decae con contextos muy largos; no se han publicado evaluaciones de *long-context* para esta variante.
- **Reproducibilidad**: el proceso es reproducible según el autor, pero requiere la herramienta Heretic v2.0.0 y los parámetros ARA documentados; no se garantiza que una reproducción independiente obtenga exactamente los mismos pesos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/SelfCode/Qwen2.5-Coder-0.5B-Instruct-heretic)
- [Modelo base Qwen2.5-Coder-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct)
- [Heretic project](https://heretic-project.org)
- [Blog de la familia Qwen2.5-Coder](https://qwenlm.github.io/blog/qwen2.5-coder-family/)
- [Repositorio GitHub Qwen2.5-Coder](https://github.com/QwenLM/Qwen2.5-Coder)
- [Documentación de Qwen](https://qwen.readthedocs.io/en/latest/)
- [Informe técnico Qwen2.5-Coder (arXiv:2409.12186)](https://arxiv.org/abs/2409.12186)
- [Informe técnico Qwen2 (arXiv:2407.10671)](https://arxiv.org/abs/2407.10671)
- [Licencia del modelo base](https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct/blob/main/LICENSE)

# CatQualia/gnarp-m2

## Resumen

gnarp-m2 es un modelo de lenguaje de 360 millones de parámetros desarrollado por CatQualia, especializado en transferencia estructural entre dominios (cross-domain transfer). Se basa en SmolLM2-360M-Instruct, el modelo instructivo de 360M de HuggingFace, y ha sido ajustado mediante QLoRA sobre 74.395 pares de instrucción etiquetados con verificación de isomorfismo. Su propósito es mapear mecanismos de dominios como biología, física, anime, economía o psicología hacia constructos de ingeniería de software, identificando límites de fallo concretos.

El modelo se publica bajo licencia MIT, con pesos en formato safetensors, y está pensado para tareas de generación de texto donde se requiere razonamiento analógico y transferencia de conocimiento entre áreas. Aunque es un modelo pequeño (360M), su entrenamiento específico lo hace útil en escenarios donde se necesita aplicar estructuras conceptuales de un campo a otro, como diseño de software inspirado en procesos naturales o metáforas técnicas.

La relevancia actual radica en su enfoque niche: mientras los modelos grandes dominan tareas generales, gnarp-m2 demuestra que un ajuste fino dirigido con datos curados puede lograr mejoras significativas en una tarea concreta, incluso con recursos de hardware limitados (entrenado en una RTX 3080 Laptop de 8 GB). Su arquitectura LlamaForCausalLM y su contexto máximo de 768 tokens lo hacen ligero y desplegable en entornos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (basado en SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 (modelo fusionado, safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 768 tokens (entrenamiento), extensible a 4096 en inferencia |
| Tipos de cuantizacion | No se han publicado cuantizaciones adicionales (solo safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

gnarp-m2 parte de SmolLM2-360M-Instruct, un modelo transformer causal de 360M parámetros. El ajuste fino se realizó con QLoRA en 4-bit NF4 con doble cuantización, utilizando rank 16, alpha 32 y dropout 0.05. Se adaptaron todas las proyecciones de atención (q, k, v, o) y las capas MLP (gate, up, down). El adaptador resultante tiene 8.683.520 parámetros entrenables (2,34% del total), y el modelo fusionado pesa 1,4 GB.

El conjunto de entrenamiento, `clean_corpus_v5.jsonl`, contiene 74.395 filas, de las cuales el 71% son pares de isomorfismo anime-software con clases de fallo, un 16% son pares de verificación de ensayos GPU, y el resto proviene de fuentes diversas como metáforas, razonamiento, seguridad y cumplimiento. Se entrenó durante una sola época con learning rate 1e-4, schedule coseno con 5% de warmup, batch efectivo de 8 y optimizador AdamW en bf16. La evaluación se realizó sobre un 10% retenido cada 500 pasos, seleccionando el mejor modelo por eval_loss. El entrenamiento duró ~13 horas en una RTX 3080 Laptop.

## Capacidades

- Generación de texto con especialización en transferencia estructural entre dominios (anime, biología, física, economía, etc.) hacia software.
- Mapeo de isomorfismos: identifica correspondencias entre mecanismos de un dominio y constructos de ingeniería de software, incluyendo límites de fallo.
- Razonamiento analógico multi-paso: puede descomponer un concepto de origen y aplicarlo a un contexto técnico.
- Verificación de hipótesis: entrenado con pares etiquetados que incluyen veredictos de validación, lo que mejora la precisión en tareas de evaluación.
- Conversación básica en inglés (aunque no es su fuerte, el modelo base instructivo le da capacidades conversacionales generales).
- Soporte para tool calling limitado (incluye 187 pares de uso de herramientas en el entrenamiento).

## Casos de uso

- Diseño de software inspirado en procesos biológicos: aplicar conceptos como apoptosis (muerte celular programada) a estrategias de despliegue o gestión de recursos en sistemas distribuidos.
- Generación de metáforas técnicas para documentación: explicar patrones de arquitectura (cola de mensajes, balanceo de carga) usando analogías de anime o física, mejorando la comunicación entre equipos no técnicos.
- Análisis de riesgo en arquitecturas: usar isomorfismos de dominios como economía o ecología para identificar puntos de fallo en sistemas de software.
- Educación y formación: crear ejemplos didácticos que transfieran conceptos de un campo a otro para facilitar el aprendizaje de programación.
- Asistente de ideación en hackathons: generar propuestas de features basadas en mecanismos de dominios no técnicos, con límites de fallo explícitos.
- Verificación de consistencia en especificaciones: dado un par de conceptos, el modelo puede evaluar si la transferencia es válida y señalar posibles incompatibilidades.

## Benchmarks y rendimiento

La model card reporta resultados del "Cross-Domain Transfer Benchmark v2", que evalúa 36 tareas de transferencia entre dominios (anime, biología, física, economía, etc.) con un rubric heurístico basado en palabras clave y análisis estructural. Los resultados son:

| Modelo | Judge Mean | Delta vs Base | Avg Response (chars) | Avg Latency (s) |
|---|---|---|---|---|
| **gnarp-m2** | **0.7839** | **+14.1%** | 1.108 | 4.9 |
| base (SmolLM2-360M-Instruct) | 0.6871 | — | 1.489 | 6.9 |

Además, se presenta una tabla de lineage con modelos anteriores (v1, v2, v3) evaluados con un juez qwen3:8b en un benchmark heldout distinto. La comparación directa entre benchmarks no es válida, pero se muestra como referencia:

| Modelo | Transfer Score | Heldout Loss | Perplexity | Refusal Rate |
|---|---|---|---|---|
| base | 0.709 | 1.625 | 5.08 | 0.130 |
| v1 | 0.218 | 1.850 | 6.36 | 0.385 |
| v2 | 0.713 | 1.800 | 6.05 | 0.340 |
| v3 | 0.561 | 1.790 | 5.99 | 0.400 |
| **m2** | **0.7839*** | — | — | — |

*Nota: m2 se evaluó con el benchmark v2 (heurístico), no con el heldout con juez qwen3:8b.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo fusionado en fp16/bf16 ocupa ~720 MB (361M parámetros × 2 bytes). Con cuantización 4-bit (no publicada) podría reducirse a ~180 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16, por ejemplo RTX 2060, GTX 1660, o incluso CPUs modernas con suficiente RAM.
- Cabe en GPUs de consumo: sí, cualquier GPU con 4 GB o más es suficiente para inferencia con contexto extendido (4096 tokens).
- Opciones de despliegue: Transformers (Python), Ollama (con Modelfile proporcionado), vLLM (compatible con arquitectura Llama), llama.cpp (si se convierte a GGUF).
- Latencia y throughput: según la model card, latencia media de 4.9 s por respuesta en el benchmark (probablemente en hardware consumer). En GPUs modernas se puede esperar throughput de decenas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| **gnarp-m2** | 361M | 768 (extensible) | MIT | Transferencia cross-domain especializada |
| SmolLM2-360M-Instruct (base) | 360M | 2048 | Apache 2.0 | Instruct general |
| Qwen2.5-0.5B-Instruct | 494M | 32768 | Apache 2.0 | Instruct general multilingüe |
| Llama-3.2-1B | 1.23B | 128k | Llama 3.2 | Instruct general |

gnarp-m2 se diferencia por su especialización en transferencia estructural, pero es inferior en tareas generales de razonamiento o generación larga debido a su tamaño y contexto limitado. No hay comparaciones directas con otros modelos especializados en isomorfismo cross-domain publicadas.

## Limitaciones y advertencias

- Tamaño reducido (360M): no puede igualar a modelos grandes en razonamiento complejo, generación de texto extenso o seguimiento de instrucciones matizado.
- Entrenamiento de una sola época en hardware consumer: podría beneficiarse de más entrenamiento, pero con riesgo de sobreajuste.
- Evaluación heurística: el benchmark v2 usa rúbricas de palabras clave, no un juez LLM fuerte; el delta de +14.1% es orientativo, no calibrado.
- Comparaciones entre benchmarks no válidas: los resultados de v1/v2/v3 usan un juez distinto al de m2; no comparar numéricamente.
- Sesgo hacia datos de isomorfismo: más del 71% del entrenamiento es de pares de isomorfismo anime-software; el modelo puede fallar en tareas de chat general o código.
- Seguridad limitada: solo incluye 19 pares de negativa; no está extensamente alineado con seguridad.
- Contexto corto: 768 tokens de entrenamiento limita la capacidad de manejar conversaciones largas o documentos extensos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CatQualia/gnarp-m2
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct

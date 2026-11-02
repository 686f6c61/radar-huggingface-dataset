# RL-Forgetting-Experiments-3/code-sft-rerun-20261102-qwen3b-code-ordered

## Resumen

El modelo `code-sft-rerun-20261102-qwen3b-code-ordered` es un artefacto de investigación publicado por el colectivo RL-Forgetting-Experiments-3 en HuggingFace. Se trata de un ajuste fino supervisado (SFT) sobre Qwen2.5-3B orientado a tareas de generación de código, ejecutado como parte de un experimento más amplio sobre olvido catastrófico durante el aprendizaje por refuerzo y el ajuste fino. El nombre del repositorio indica que es la variante "ordered" (datos de entrenamiento en orden canónico, sin barajado) del brazo de Qwen3B del experimento.

El modelo no es un lanzamiento de producción, sino un checkpoint de investigación reproducible. La model card describe un conjunto de trece brazos de entrenamiento frescos ejecutados el 2 de noviembre de 2026 sobre Qwen2.5-3B, Qwen3-1.7B-Base y Llama-3.2-3B-Instruct, con distintas configuraciones de ordenación de datos (ordered, shuffled, uniform, hard, CE). El objetivo es estudiar cómo el orden y la composición del dataset de SFT afectan a la retención de capacidades previas (replay con lambda 1.0).

Su relevancia es metodológica: proporciona checkpoints intermedios (10 por brazo) y métricas de evaluación (MBPP+) para estudiar dinámicas de olvido. No está pensado como modelo de uso general y no se han publicado resultados de benchmarks de capacidad general en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-3B) |
| Parámetros totales | ~3.000 millones (modelo base Qwen2.5-3B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud de entrenamiento; contexto nativo del base no especificado en la información disponible) |
| Tipos de cuantización | no disponible (el repo contiene safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | other (derivados de Qwen2.5-3B retienen Qwen Research License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only Qwen2.5-3B. El entrenamiento se ejecutó con los siguientes hiperparámetros declarados en la model card: learning rate 1e-5, una época, semilla 42, batch efectivo 256, micro-batch 1, 4 GPUs H100, secuencias de 4096 tokens y 10 guardados de checkpoint por brazo. Se aplicó replay con lambda 1.0, lo que sugiere una estrategia de mezcla de datos previos para mitigar el olvido catastrófico durante el SFT.

La innovación principal no está en la arquitectura sino en el protocolo experimental: el repositorio forma parte de un estudio sobre olvido durante RL y SFT, con brazos que varían el orden de los datos (ordered, shuffled, uniform, hard, CE). El artefacto incluye `request-provenance.json`, `delivery_manifest.json` y `evaluations/mbppplus_n160_t0.6/delivery_manifest.json` para verificar unidades de entrenamiento y evaluaciones puntuadas por ejecución. No se especifica la composición exacta del dataset de código ni el número total de tokens de entrenamiento en la información disponible.

## Capacidades

- Generación de código: ajuste fino supervisado específicamente sobre tareas de programación (coding-SFT).
- Razonamiento y generación de texto: heredadas del modelo base Qwen2.5-3B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales: no se declaran modos de pensamiento, visión ni audio.
- Evaluación orientada a ejecución: el repo incluye evaluaciones MBPP+ (n=160, temperatura 0.6) para medir corrección funcional del código generado.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como checkpoint de referencia para estudiar cómo el SFT en código degrada capacidades previas, comparando brazos ordered frente a shuffled con el mismo presupuesto de entrenamiento.
- Reproducibilidad de experimentos de SFT: los manifiestos (`delivery_manifest.json`, `request-provenance.json`) permiten reconstruir exactamente las condiciones de entrenamiento y verificar qué unidades se ejecutaron realmente.
- Evaluación de código por ejecución: el pipeline MBPP+ incluido permite medir corrección funcional del código generado, útil para validar metodologías de evaluación.
- Estudio de estrategias de replay: con lambda 1.0, el modelo permite analizar el efecto de mezclar datos previos durante el SFT y cuantificar la retención resultante.
- Baseline para comparativas de ordenación de datos: al ser la variante "ordered", sirve de contraste frente a las variantes shuffled/uniform/hard del mismo experimento.
- Análisis de checkpoints intermedios: los 10 guardados por brazo permiten trazar la evolución de métricas a lo largo del entrenamiento y detectar puntos de degradación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye evaluaciones MBPP+ (n=160, temperatura 0.6) puntuadas por ejecución, pero sus resultados numéricos no se han proporcionado en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de ~3.000 millones de parámetros en fp16 se requieren aproximadamente 6-7 GB de VRAM, y en cuantización de 4 bits alrededor de 2-3 GB (estimación orientativa, no confirmada en la información disponible).
- GPU recomendadas: el entrenamiento se ejecutó en 4× H100; para inferencia no se especifican GPU concretas.
- Cabe en GPU de consumo: previsiblemente sí en RTX 3060/4060/4090 con cuantización, aunque no está confirmado en la información disponible.
- Opciones de despliegue: no disponible en la información proporcionada (no se declaran integraciones con vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| code-sft-rerun-20261102-qwen3b-code-ordered | ~3.000 M | 4096 (entrenamiento) | other (Qwen Research License) | HuggingFace, 0 descargas | Checkpoint de investigación |
| Qwen2.5-3B (base) | ~3.000 M | no disponible en esta ficha | Qwen Research License | HuggingFace | Modelo upstream del que deriva |
| Llama-3.2-3B-Instruct | ~3.200 M | no disponible en esta ficha | Llama 3.2 Community License | HuggingFace | Alternativa de tamaño similar usada en el mismo experimento |
| Qwen3-1.7B-Base | ~1.700 M | no disponible en esta ficha | Apache 2.0 | HuggingFace | Otro base del mismo experimento |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de producción: es un artefacto de investigación con 0 descargas y 0 likes, sin validación externa.
- Licencia restrictiva: los derivados de Qwen2.5-3B retienen la Qwen Research License, lo que limita el uso comercial; no se conceden derechos adicionales sobre los modelos upstream.
- Riesgo de olvido catastrófico: el propio nombre del experimento (rl-forgetting) sugiere que el ajuste puede degradar capacidades previas del modelo base.
- Idiomas no declarados: no se especifican los idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- Sesgos y alucinaciones: no se documentan análisis de sesgo ni tasas de alucinación en la información disponible.
- Contexto limitado a 4096 tokens en entrenamiento: puede no ser adecuado para tareas que requieran ventanas más largas.
- Repositorio de 49,4 GB: incluye múltiples checkpoints y artefactos, lo que dificulta su uso directo sin seleccionar el checkpoint concreto.
- Sin pipeline declarado: no se indica la tarea de HuggingFace asociada, lo que complica la integración automática.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RL-Forgetting-Experiments-3/code-sft-rerun-20261102-qwen3b-code-ordered
- Modelo base Qwen2.5-3B: no disponible en la información proporcionada
- Paper o blog del experimento: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada

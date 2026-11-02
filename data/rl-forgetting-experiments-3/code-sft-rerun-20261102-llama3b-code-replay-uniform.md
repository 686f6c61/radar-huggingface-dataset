# RL-Forgetting-Experiments-3/code-sft-rerun-20261102-llama3b-code-replay-uniform

## Resumen

El modelo `code-sft-rerun-20261102-llama3b-code-replay-uniform` es un ajuste fino supervisado (SFT) sobre Llama-3.2-3B-Instruct, desarrollado por el colectivo de investigación RL-Forgetting-Experiments-3. Forma parte de un conjunto de trece "brazos" experimentales ejecutados el 2 de noviembre de 2026 para estudiar el olvido catastrófico (catastrophic forgetting) durante el entrenamiento de modelos en tareas de código. El nombre indica que se aplicó una estrategia de *replay* uniforme con un peso lambda de 1.0.

El modelo no es un producto final pensado para uso general, sino un artefacto de investigación: el repositorio de 90 GB contiene pesos, checkpoints intermedios y metadatos de entrenamiento orientados a reproducir y analizar el fenómeno del olvido. La model card es explícita al señalar que los resultados de septiembre son históricos y no cuentan como ejecución fresca, y que la transferencia parcial no equivale a completitud.

La relevancia es metodológica: permite a investigadores comparar cómo distintas estrategias de replay (ordered, shuffled, uniform, hard, CE) afectan a la retención de capacidades previas en modelos pequeños de 3B parámetros entrenados con 4 GPUs H100.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama-3.2-3B-Instruct) |
| Parámetros totales | 3B (modelo base Llama-3.2-3B-Instruct) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (usado en entrenamiento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (derivados retienen Llama 3.2 Community License y Acceptable Use Policy) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-3B-Instruct, un transformer decoder-only de 3B parámetros. El ajuste fino se realizó con los siguientes hiperparámetros: learning rate 1e-5, una época, semilla 42, batch efectivo de 256, micro-batch de 1, 4 GPUs H100, secuencias de 4096 tokens y 10 guardados de checkpoint por brazo. Se aplicó una estrategia de replay con lambda 1.0, y el nombre del repositorio indica que el replay fue de tipo "uniforme".

El objetivo del experimento es medir el olvido catastrófico: cómo el entrenamiento en tareas de código degrada capacidades previas del modelo base y en qué medida el replay de datos mitiga esa pérdida. El repositorio incluye `request-provenance.json`, `delivery_manifest.json` y un manifiesto de evaluaciones en `evaluations/mbppplus_n160_t0.6/delivery_manifest.json`, lo que sugiere evaluación con MBPP+ a temperatura 0.6 sobre 160 muestras. No se especifica la composición del dataset de código ni el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto y código: el modelo base Llama-3.2-3B-Instruct está orientado a instrucciones y generación de código; el SFT refuerza esta última.
- Razonamiento multi-paso: heredado del modelo base, aunque no hay evaluación específica publicada en la información disponible.
- Tool calling: no confirmado para este ajuste concreto; el modelo base Llama-3.2-Instruct soporta function calling, pero no se documenta si se preservó tras el SFT.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking": no disponible.
- Visión y audio: no soportados.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como brazo experimental para comparar la retención de capacidades tras SFT en código con replay uniforme frente a otras estrategias (ordered, shuffled, hard, CE).
- Reproducción de experimentos: los checkpoints intermedios (10 por brazo) permiten analizar la evolución del olvido a lo largo del entrenamiento.
- Evaluación de estrategias de replay: útil para diseñar políticas de mezcla de datos en pipelines de ajuste fino de modelos pequeños.
- Estudio de degradación en modelos de 3B: referencia para investigadores que trabajan con presupuestos de cómputo limitados (4 H100).
- Benchmarking de retención: combinado con MBPP+ y otras evaluaciones, permite medir la compensación entre rendimiento en código y capacidades generales.
- Docencia y formación: ejemplo práctico de configuración de SFT con replay y gestión de checkpoints en repositorios de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un manifiesto de evaluaciones (`evaluations/mbppplus_n160_t0.6/delivery_manifest.json`) con evaluación puntuada sobre MBPP+ a temperatura 0.6 y 160 muestras, pero los valores numéricos no se proporcionan en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; para un modelo de 3B en fp16 se estiman aproximadamente 6-7 GB, y en cuantización de 8 bits alrededor de 3-4 GB (estimación orientativa, no confirmada en la información).
- GPU recomendadas: el entrenamiento se realizó con 4 H100; para inferencia bastaría una GPU consumer de gama alta.
- Compatibilidad con GPU consumer: probable en RTX 3090, RTX 4090 y GPUs con 8 GB o más en cuantización, aunque no está verificado.
- Opciones de despliegue: no documentadas; al ser safetensors compatible con Llama-3.2, podría cargarse con transformers, vLLM o llama.cpp previa conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| code-sft-rerun-20261102-llama3b-code-replay-uniform | 3B | 4096 (entrenamiento) | other (Llama 3.2 Community) | HuggingFace, 0 descargas |
| Llama-3.2-3B-Instruct (base) | 3B | 128K | Llama 3.2 Community | HuggingFace, ampliamente disponible |
| Qwen2.5-3B (brazo paralelo del mismo estudio) | 3B | no disponible | Qwen Research License | HuggingFace, artefacto de investigación |
| Qwen3-1.7B-Base (brazo paralelo del mismo estudio) | 1.7B | no disponible | Apache 2.0 | HuggingFace, artefacto de investigación |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para producción; su propósito es estudiar el olvido catastrófico, no ofrecer un asistente de código pulido.
- Licencia "other": los derivados retienen la Llama 3.2 Community License y la Acceptable Use Policy; el uso comercial está sujeto a esas condiciones y no se conceden derechos adicionales sobre el modelo upstream.
- Idiomas no documentados: no se especifica qué lenguas conserva tras el SFT.
- Riesgo de alucinación: inherente a los modelos de 3B y no evaluado en la información disponible.
- Sesgos: no documentados.
- Contexto limitado en entrenamiento a 4096 tokens, aunque el modelo base soporta 128K; no se confirma que el SFT preserve la ventana extendida.
- Repositorio de 90 GB: incluye checkpoints y artefactos, lo que dificulta su descarga y despliegue ligero.
- Sin descargas ni likes: no hay evidencia de validación por la comunidad.
- La model card advierte que la transferencia parcial no equivale a completitud y que los resultados de septiembre no cuentan como ejecución fresca.

## Enlaces

- HuggingFace: https://huggingface.co/RL-Forgetting-Experiments-3/code-sft-rerun-20261102-llama3b-code-replay-uniform
- Manifiesto de entrega: `delivery_manifest.json` (dentro del repositorio)
- Manifiesto de evaluaciones: `evaluations/mbppplus_n160_t0.6/delivery_manifest.json` (dentro del repositorio)
- Procedencia de la petición: `request-provenance.json` (dentro del repositorio)
- Licencia del modelo base: Llama 3.2 Community License y Acceptable Use Policy (archivos LICENSE/NOTICE/USE_POLICY en el repositorio)

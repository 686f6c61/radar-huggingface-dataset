# dipta007/dagger-12B_SFT

## Resumen

DAGGER-12B-SFT es un modelo de lenguaje de 12 mil millones de parámetros desarrollado por dipta007 (EMNLP 2026, Findings) que reformula el razonamiento matemático como generación de grafos computacionales en bengalí. Se trata de un fine-tuning supervisado (SFT) sobre el modelo base Gemma-3-12B-Instruct de Google, entrenado con 3.000 ejemplos verificados de grafos computacionales que incluyen explícitamente la detección de distractores (números irrelevantes en el enunciado). Su objetivo principal es mejorar la robustez del razonamiento matemático en idiomas de bajos recursos, donde los modelos generalistas suelen degradarse significativamente cuando se añaden datos irrelevantes al problema.

La variante SFT sirve tanto como modelo independiente como punto de partida para entrenamiento con GRPO (la versión con GRPO alcanza un 69,4 % de precisión ponderada frente al 66,7 % de esta). El modelo genera una salida JSON con una estructura de grafo computacional (nodos con operaciones aritméticas, lógicas y de redondeo) que permite ejecutar la solución de forma determinista y auditable. Con una longitud de contexto máxima de 4096 tokens, es un modelo eficiente que produce alrededor de 334 tokens por problema, muy por debajo de los modelos de razonamiento extensivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma-3-12B-Instruct) con fine-tuning LoRA |
| Parametros totales | 12.187.325.040 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible (compatible con cuantización estándar de Transformers, p. ej. bitsandbytes) |
| Idiomas soportados | Bengalí (bn) e inglés (en) |
| Licencia | Gemma (términos de Google: https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer de Gemma-3-12B-Instruct, un modelo denso de 12 mil millones de parámetros con atención multi-cabeza y ventana de contexto de 4096 tokens. El fine-tuning se realizó mediante Supervised Fine-Tuning (SFT) con LoRA de rango 64 y alpha 128, sobre el dataset `dipta007/dagger` (3000 ejemplos de grafos computacionales verificados) y el dataset `dipta007/DistractMath-Bn` (problemas matemáticos en bengalí con distractores). La configuración de entrenamiento incluye batch global de 256, 4 épocas, tasa de aprendizaje de 1e-5 a 1e-6 con decaimiento, optimizador AdamW con weight decay 0.001 y precisión BF16.

La innovación principal es la formulación del razonamiento como generación de un grafo computacional en JSON, donde cada nodo tiene un identificador, una operación (add, sub, mul, div, round, sqrt, floor, sum, mean, etc.), argumentos, y una etiqueta booleana `distractor` que indica si el nodo participa en el cálculo final. Esto permite ejecutar la solución de forma determinista y auditable, y además reduce el número de tokens de razonamiento en un 89 % comparado con modelos de razonamiento extensivo, según el paper.

## Capacidades

- Generación de grafos computacionales en formato JSON para problemas matemáticos en bengalí, con operaciones aritméticas, lógicas, de redondeo y avanzadas (raíz cuadrada, módulo, GCD, LCM, potencia).
- Detección explícita de distractores: el modelo identifica números y datos irrelevantes en el enunciado y los marca como nodos `distractor: true`, lo que permite filtrar información no esencial para el cálculo.
- Razonamiento matemático determinista: la salida en grafo puede ejecutarse para obtener la respuesta final sin depender de la generación de texto libre.
- Capacidad de razonamiento multi-paso a través de la estructura de grafo (nodos intermedios con operaciones combinadas).
- Soporte de salida estructurada JSON, lo que facilita la integración en pipelines de procesamiento automático.
- Multilingüe limitado: entrenado principalmente en bengalí, con comprensión del inglés (el prompt de instrucción está en inglés, los problemas en bengalí).

## Casos de uso

- Tutoría de matemáticas en bengalí: el modelo puede generar la solución paso a paso en formato de grafo para que un estudiante o un sistema educativo pueda verificar cada operación y entender el razonamiento.
- Generación de problemas de práctica con distractores: se puede usar para crear ejercicios que incluyan datos irrelevantes, ayudando a los estudiantes a identificar información no útil.
- Verificación automática de razonamiento: dado un problema y una respuesta, el modelo genera el grafo computacional y permite comprobar si la respuesta es correcta ejecutando el grafo.
- Integración en pipelines de evaluación de modelos de lenguaje: al generar grafos ejecutables, se puede medir la precisión de forma determinista sin depender de comparación de texto libre.
- Herramientas de análisis de errores: al marcar los nodos distractores, se puede estudiar cómo el modelo maneja la información irrelevante y dónde falla.
- Sistemas de asistencia a docentes: para generar explicaciones estructuradas de problemas matemáticos en bengalí, con desglose de operaciones y detección de datos superfluos.

## Benchmarks y rendimiento

La tabla siguiente resume los resultados del modelo en los conjuntos de evaluación MGSM y MSVAMP, tanto en la versión original como en la versión con distractores añadidos (los datos provienen de la model card):

| Dataset | Original | +Distractor | Drop |
|---|---|---|---|
| MGSM | 70.0 | 56.8 | 13.2 |
| MSVAMP | 76.8 | 65.4 | 11.5 |
| **Media ponderada** | - | - | **66.7** |

Además, la comparación con la variante con GRPO (dagger-12B_SFT_GRPO) muestra que el entrenamiento con GRPO mejora la media ponderada en +2.7 puntos (69.4 frente a 66.7). No se dispone de resultados de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: para el modelo completo en BF16 (~24 GB de pesos) se necesitan al menos 24 GB de VRAM. Con cuantización de 8 bits (~12 GB) y de 4 bits (~6 GB) se puede reducir sustancialmente.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB), RTX 4090 (24 GB) para BF16; con cuantización de 4 bits es viable en GPUs consumer de 8-12 GB (RTX 3080, RTX 4070, etc.).
- Si cabe en consumer GPU: sí, con cuantización de 4 bits (p. ej. bitsandbytes) se puede ejecutar en una RTX 3090 o RTX 4070 Ti (12-16 GB).
- Opciones de despliegue: Transformers (con device_map="auto"), vLLM (compatible con Gemma-3), Ollama (si se convierte a GGUF), TGI (Text Generation Inference). No se han reportado latencias específicas, pero al generar ~334 tokens por problema, el throughput será moderado.
- Para despliegue en producción, se recomienda vLLM o TGI con cuantización FP8/INT4 para reducir latencia y aumentar throughput.

## Comparativa con modelos similares

No se dispone de información de modelos comparables dentro de la misma tarea (generación de grafos computacionales en bengalí). Como referencia, el modelo base Gemma-3-12B-Instruct no tiene la capacidad específica de generar grafos con marcado de distractores, por lo que esta variante es especializada. La comparación más relevante es con la variante con GRPO (dagger-12B_SFT_GRPO), que obtiene +2.7 puntos de precisión ponderada. También se puede comparar con otros modelos de razonamiento matemático multilingüe, pero no se han publicado resultados comparativos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos y limitaciones lingüísticas: el modelo está entrenado principalmente en bengalí y puede tener un rendimiento inferior en otros idiomas de baja disponibilidad de datos.
- Riesgo de alucinación: aunque la salida es un grafo JSON, el modelo puede generar nodos con operaciones incorrectas o valores erróneos, especialmente en problemas con distractores complejos. La verificación externa es necesaria.
- Contexto limitado: la ventana de contexto de 4096 tokens puede ser insuficiente para problemas matemáticos largos con múltiples subpreguntas.
- Restricciones de licencia: la licencia Gemma (Apache 2.0 con términos adicionales) impone restricciones de uso comercial en ciertos sectores (según los términos de Google). Hay que revisar los términos completos.
- No es un modelo de propósito general: está especializado en la tarea de generación de grafos computacionales; no se recomienda su uso para otras tareas sin un fine-tuning adicional.
- Dependencia de la plantilla de prompt: el modelo requiere el formato de prompt exacto (con las reglas de grafo y el ejemplo) para funcionar correctamente; desviaciones pueden degradar el rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dipta007/dagger-12B_SFT
- Paper arXiv (2601.06853): https://arxiv.org/abs/2601.06853
- Página del proyecto: https://dipta007.github.io/DAGGER/
- Repositorio GitHub: https://github.com/dipta007/dagger
- Dataset DistractMath-Bn: https://huggingface.co/datasets/dipta007/DistractMath-Bn
- Colección de modelos DAGGER: https://huggingface.co/collections/dipta007/dagger-emnlp-2026-findings

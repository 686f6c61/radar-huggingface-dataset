# sandeep123/stride-math20-a5-step800

## Resumen

`sandeep123/stride-math20-a5-step800` es un checkpoint de entrenamiento derivado de `Qwen/Qwen2.5-Math-1.5B`, un modelo de razonamiento matemático de 1.78 mil millones de parámetros. Ha sido ajustado mediante aprendizaje por refuerzo (RL) con el método STRIDE (diversidad a nivel de paso) sobre el dataset MATH (lighteval), usando el framework verl. El objetivo es mejorar la precisión en problemas matemáticos complejos introduciendo diversidad en la exploración de pasos de razonamiento durante el entrenamiento.

El modelo está pensado para la investigación en métodos de RL aplicados a razonamiento matemático. En el punto de validación elegido (paso 800 de 1160), alcanza un pass@1 de 0.7422 y un pass@k (k=6) de 0.9297 en el subconjunto de validación de MATH, frente a los 0.4805 y 0.8672 del modelo base. Sin embargo, el propio autor advierte que este checkpoint es el pico de la trayectoria y que el modelo degenera en pasos posteriores, mostrando señales tempranas de reward hacking (aumento de caracteres no ASCII y caída de pass@1).

La relevancia de este modelo radica en su utilidad como referencia para estudiar el comportamiento de la diversidad en RL matemático, y no como un producto final para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-Math-1.5B, un transformer decoder-only de 1.78B parámetros. El entrenamiento se realizó con el método STRIDE, que introduce diversidad a nivel de paso en la exploración de RL, sobre el dataset MATH (lighteval). El pipeline usa verl como orquestador, con GRPO como algoritmo de RL, una recompensa KL de 0.01, 6 rollouts por prompt (K=6), batch de 128 y longitud máxima de respuesta de 1024 tokens. Se entrenó durante 20 épocas (~1160 pasos), y este checkpoint corresponde al paso 800, seleccionado como el mejor en validación por pass@1.

La innovación técnica destacable es la incorporación de una métrica de diversidad a nivel de paso (duplicate-opening rate) durante el entrenamiento, que busca evitar la colapso en modos de razonamiento repetitivos. En MATH, el margen de mejora de esta métrica es pequeño (el base ya está en 0.0%), a diferencia de otros dominios como ScienceQA.

## Capacidades

- Razonamiento matemático paso a paso: resuelve problemas de nivel MATH (álgebra, geometría, probabilidad, etc.) con cadenas de razonamiento.
- Generación de texto en inglés (idioma del dataset MATH; no se especifican otros idiomas).
- Mejora de diversidad en respuestas: produce múltiples soluciones válidas para un mismo problema, útil para muestreo y ensamblaje.
- No soporta tool calling, function calling ni uso de agentes.
- No es multimodal (solo texto).
- No se ha documentado soporte para "thinking mode" explícito, aunque el razonamiento es inherente a la tarea.

## Casos de uso

- Investigación en RL para razonamiento matemático: el modelo sirve como punto de referencia para estudiar el efecto de la diversidad en el entrenamiento de modelos de math. Se puede comparar con el checkpoint degenerado (paso 1160) para analizar reward hacking.
- Generación de soluciones matemáticas para datasets sintéticos: al muestrear con k=6, se obtienen múltiples soluciones válidas que pueden usarse para aumentar datos de entrenamiento o validación.
- Evaluación de métricas de diversidad: permite probar nuevas métricas de diversidad a nivel de paso (como duplicate-opening rate) en un dominio con bajo margen de mejora.
- Asistente educativo para problemas de nivel medio: aunque no es un producto final, puede usarse en prototipos para resolver problemas de matemáticas con explicaciones paso a paso.
- Benchmark de alucinación en matemáticas: dado el riesgo de reward hacking, sirve para estudiar cuándo el modelo produce respuestas inválidas o con caracteres no-ASCII.
- Base para fine-tuning posterior: se puede partir de este checkpoint para continuar el entrenamiento con otras configuraciones (por ejemplo, menor alpha o regularización).

## Benchmarks y rendimiento

Los datos de validación provienen de la model card y corresponden a un subconjunto de 128 prompts de MATH con 6 rollouts por prompt (768 respuestas en total). El error estándar es de ±4 puntos, por lo que las comparaciones deben interpretarse con cautela.

| Metric | Valor (step 800) | Valor (base) | Valor (step 1160) |
|---|---|---|---|
| pass@1 | 0.7422 | 0.4805 | 0.6667 |
| pass@k (k=6) | 0.9297 | 0.8672 | no disponible |
| duplicate-opening rate | 0.016 | 0.0 | no disponible |
| non-ASCII fraction | 0.63% | no disponible | 3.06% |

No se han publicado resultados en benchmarks estándar como MMLU, GSM8K o HumanEval en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - fp16/bf16: ~3.5 GB
  - 8-bit cuantización: ~1.8 GB
  - 4-bit cuantización: ~0.9 GB
- GPU recomendadas: cualquier GPU consumer con 6 GB+ (RTX 3060, RTX 4060, RTX 4070) es suficiente para fp16; con cuantización cabe incluso en GPUs de 4 GB.
- Despliegue: compatible con vLLM, llama.cpp, Ollama, TGI y transformers (con safetensors).
- Latencia y throughput: no disponibles en la información proporcionada; se estima baja latencia para un modelo de 1.78B en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Método | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stride-math20-a5-step800 | 1.78B | no disponible | STRIDE (RL) | Apache 2.0 | HuggingFace |
| Qwen2.5-Math-1.5B (base) | 1.78B | 32K (del base, no confirmado en info) | preentrenamiento + SFT | Apache 2.0 | HuggingFace |
| Qwen2.5-Math-7B | 7.6B | 32K | preentrenamiento + SFT | Apache 2.0 | HuggingFace |
| DeepSeek-Math-7B-RL | 7B | 4K | GRPO | MIT | HuggingFace |

La comparación con DeepSeek-Math-7B-RL es orientativa por tamaño de tarea, pero no hay datos de rendimiento directos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de entrenamiento, no un modelo de producción: el autor indica que degenera después del paso 800, con aumento de caracteres no-ASCII y caída de pass@1.
- Reward hacking temprano: la fracción de caracteres no-ASCII pasa de 0.63% (step 800) a 3.06% (step 1160), señal de que el modelo explota recompensas espurias.
- Sesgos heredados de Qwen2.5-Math-1.5B: no se documentan sesgos específicos, pero el modelo base puede tener limitaciones en dominios fuera de matemáticas.
- Riesgo de alucinación: como todo LLM, puede producir razonamientos plausibles pero incorrectos, especialmente fuera del dominio matemático.
- Idioma: el dataset MATH está en inglés; no se ha evaluado el rendimiento en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda evaluar el modelo en tareas reales antes de usarlo en producción.
- Contexto: no se especifica la longitud de contexto, aunque el modelo base soporta 32K; no se ha verificado si el entrenamiento lo altera.

## Enlaces

- HuggingFace: https://huggingface.co/sandeep123/stride-math20-a5-step800
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Framework verl: no se ha proporcionado enlace directo en la información disponible.

# rjz123/colar-selftrain-r1-strategyqa

## Resumen

El modelo `rjz123/colar-selftrain-r1-strategyqa` es un adaptador de razonamiento latente construido sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, desarrollado por el autor rjz123. Emplea el enfoque CoLaR (Latent Reasoning Model), que comprime el proceso de razonamiento en un espacio latente en lugar de generar cadenas de pensamiento explícitas en texto. El checkpoint se obtuvo mediante auto-entrenamiento (self-training) sobre el conjunto de datos StrategyQA, un benchmark de preguntas de estrategia que requieren razonamiento de sentido común.

El modelo se distribuye como un checkpoint de PyTorch-Lightning con pesos de LoRA (r128 en q/v) y un MLP adicional (`LatentPolicy`), junto con un ajuste del embedding para el token `[PAD]`. No es un modelo autocontenido: requiere cargar el modelo base por separado y empalmar los pesos del adaptador. Este trabajo tiene interés principalmente para investigación en arquitecturas de razonamiento latente y eficiencia computacional en modelos pequeños, aunque su estado de desarrollo y documentación son limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (DeepSeek-R1-Distill-Qwen-1.5B) + LoRA (r128 en q/v) + MLP LatentPolicy |
| Parametros totales | no disponible (modelo base 1.5B + adaptadores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (hereda los del modelo base: inglés y chino, probablemente) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch-Lightning (`.ckpt`) con `state_dict` bajo clave `['state_dict']` |

## Arquitectura y entrenamiento

El modelo se basa en DeepSeek-R1-Distill-Qwen-1.5B, un transformer decoder de 1.500 millones de parámetros destilado de DeepSeek-R1, conocido por su capacidad de razonamiento explícito. CoLaR introduce una modificación: en lugar de generar tokens de razonamiento en texto, el modelo produce representaciones latentes comprimidas que guían la generación de la respuesta final. Esto se implementa mediante un MLP (`LatentPolicy`) que mapea el estado oculto a un espacio latente de dimensión reducida, junto con un factor de compresión (`COLAR_COMPRESS=5`) y una longitud máxima latente (`COLAR_MAXLAT=64`).

El entrenamiento se realizó mediante auto-entrenamiento sobre StrategyQA, un dataset de preguntas de opción múltiple que requieren inferencia de múltiples pasos. Se incluyen dos checkpoints: `cot_baseline.ckpt` (probablemente una línea base con cadena de pensamiento) y `sft_adaptiveLRM.ckpt` (el modelo adaptativo final). Los pesos de LoRA se aplican a las proyecciones query y value (r128), y se añade un token `[PAD]` al vocabulario para facilitar el razonamiento latente. No se detallan datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) en la información disponible.

## Capacidades

- Generación de texto estándar heredada del modelo base DeepSeek-R1-Distill-Qwen-1.5B, incluyendo razonamiento explícito en lenguaje natural.
- Razonamiento latente: el modelo puede generar respuestas utilizando un espacio latente comprimido en lugar de cadenas de pensamiento verbales, lo que potencialmente reduce el coste computacional.
- Soporte de tool calling y function calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque el diseño de razonamiento latente podría aplicarse a tareas de múltiples pasos.
- Capacidades multilingües: no especificadas, aunque el modelo base soporta inglés y chino.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en razonamiento latente: el modelo sirve como banco de pruebas para estudiar cómo comprimir el razonamiento en representaciones internas y comparar su eficiencia frente a cadenas de pensamiento explícitas.
- Experimentación académica en NLP: permite analizar el comportamiento de modelos pequeños (1.5B) en tareas de razonamiento complejo como StrategyQA, con la posibilidad de ajustar hiperparámetros como `COLAR_COMPRESS` o `COLAR_MAXLAT`.
- Desarrollo de técnicas de auto-entrenamiento: los checkpoints `cot_baseline` y `sft_adaptiveLRM` permiten comparar el rendimiento de una línea base con razonamiento textual frente a un modelo con razonamiento latente adaptativo.
- Evaluación de eficiencia computacional: al reducir el número de tokens generados (al comprimir el razonamiento), el modelo podría ofrecer menor latencia en inferencia, aunque esto no está cuantificado en la documentación.
- Base para adaptación posterior: al ser un adaptador PEFT, puede combinarse con otros métodos de fine-tuning sobre el mismo modelo base para tareas específicas.
- Reproducibilidad de resultados: los archivos de checkpoint permiten a otros investigadores replicar el pipeline de carga y evaluar el modelo en sus propios entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar, ni comparaciones cuantitativas con el modelo base o con otros modelos de razonamiento latente.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al tratarse de un modelo de 1.5B con LoRA, la inferencia puede caber en GPUs con 6-8 GB de VRAM en cuantización FP16 (estimación razonable basada en el tamaño del base, no confirmada).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (p. ej., RTX 3060, RTX 4060, A10). Para entrenamiento o fine-tuning se requeriría más memoria.
- Compatibilidad con consumer GPU: probablemente sí, dado el tamaño del modelo base, pero no hay confirmación oficial.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama o TGI. El checkpoint no es compatible con cargas estándar de HuggingFace (`AutoModel`), por lo que requiere un pipeline personalizado con PyTorch-Lightning.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rjz123/colar-selftrain-r1-strategyqa` | ~1.5B (base) | no disponible | Latente (CoLaR) | no disponible | Checkpoint no estándar |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` | 1.5B | 32k (según documentación del base) | Cadena de pensamiento explícita | MIT (según modelo base) | HuggingFace estándar |
| `Qwen2.5-1.5B-Instruct` | 1.5B | 32k | Razonamiento estándar | Apache 2.0 | HuggingFace estándar |

La comparación directa no es posible por falta de benchmarks. El modelo CoLaR se diferencia del base por su mecanismo de razonamiento latente, pero su rendimiento relativo no está documentado.

## Limitaciones y advertencias

- El checkpoint no es cargable con `AutoModel`; requiere un scaffold personalizado de CoLaR y variables de entorno específicas, lo que dificulta su uso en entornos estándar.
- No se especifica licencia, por lo que su uso comercial es incierto y requiere consultar al autor.
- No hay información sobre sesgos, alucinaciones o riesgos específicos; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- El tamaño del repositorio es de 0.2 GB, pero los pesos solo cubren el adaptador y el MLP; el modelo base debe descargarse por separado.
- No hay documentación sobre el proceso de entrenamiento (datos, hiperparámetros, duración), lo que limita la reproducibilidad.
- Al ser un modelo de investigación con 0 descargas y 0 likes, no ha sido validado por la comunidad; su calidad y estabilidad son desconocidas.
- No se proporcionan instrucciones claras de inferencia más allá de la carga; falta un ejemplo de uso completo.

## Enlaces

- Modelo en HuggingFace: [rjz123/colar-selftrain-r1-strategyqa](https://huggingface.co/rjz123/colar-selftrain-r1-strategyqa)
- Modelo base: [deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B)
- No se encontraron papers, blogs o repositorios adicionales en la búsqueda web.

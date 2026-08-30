# agentic-ptb/opus-high-v3.h032.sft-v8c.step_16

## Resumen

El modelo `agentic-ptb/opus-high-v3.h032.sft-v8c.step_16` es un checkpoint intermedio derivado del proyecto AgentPTB, concretamente de la celda de experimentación `opus-high-v3`. Se trata de un fine-tuning sobre la base `Qwen/Qwen3.5-9B-Base` (9,4 mil millones de parámetros), realizado mediante SFT (supervised fine-tuning) en el paso 16 de un run que alcanzó la hora 32 de entrenamiento. El autor lo etiqueta explícitamente como un artefacto de reproducibilidad y estudio cualitativo, no como un modelo listo para producción.

La relevancia de este checkpoint es principalmente metodológica: el run completo no encontró ninguna mejora en los pesos entrenados respecto al modelo base, un resultado negativo que se documenta para evitar interpretaciones erróneas. Este tipo de publicaciones es valiosa para la comunidad porque ayuda a entender qué configuraciones de entrenamiento no funcionan, especialmente en el contexto de fine-tuning de modelos grandes con datos sintéticos o generados por agentes. No debe considerarse un modelo con capacidades mejoradas; su valor reside en el análisis de fallos y en la trazabilidad de experimentos.

El repositorio contiene únicamente pesos en formato `safetensors` (18,8 GB), sin pipeline de inferencia definido ni métricas de rendimiento publicadas. La licencia Apache 2.0 permite su uso y modificación, pero su utilidad práctica como modelo independiente es limitada, dado que no supera al modelo base del que parte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible (depende del modelo base, no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) sobre `Qwen/Qwen3.5-9B-Base`. La arquitectura subyacente es la de Qwen3.5-9B, un transformer denso de 9,4 B parámetros, aunque la model card no proporciona detalles adicionales sobre la configuración interna (número de capas, heads, etc.). El entrenamiento se realizó en el marco del proyecto AgentPTB, que parece ser un entorno de experimentación con agentes (posiblemente inspirado en Claude Opus, dada la nomenclatura `opus-high-v3`).

El run `opus-high-v3` se ejecutó durante al menos 32 horas, produciendo checkpoints intermedios como este. Según el dataset asociado (`agentic-ptb/opus-high-v3-data`), el proceso utilizó datos generados por agentes, pero no se especifica la composición exacta del dataset ni el número de tokens de entrenamiento. El hallazgo principal es que el entrenamiento no produjo ninguna mejora en los pesos: el run fue clasificado como `negative-results`, y el propio autor advierte que no se debe inferir calidad a partir de la publicación. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

Dado que el modelo no mostró mejoras sobre su base y que no se han publicado evaluaciones, las capacidades reales son las del modelo base Qwen3.5-9B, con la salvedad de que el fine-tuning podría haber degradado o alterado el comportamiento. No se puede afirmar ninguna capacidad específica adicional. Las capacidades teóricas del modelo base incluyen:

- Generación de texto y razonamiento general, típicas de un modelo de 9 B parámetros.
- Probable soporte de tool calling y function calling, si el modelo base lo incluye (no confirmado).
- Capacidades multilingües probablemente presentes, pero sin datos concretos.
- No se ha demostrado soporte de agentes, vision ni audio en este checkpoint.

En resumen, no hay evidencia de que este checkpoint ofrezca capacidades distintas o superiores a las de Qwen3.5-9B-Base.

## Casos de uso

Dado el carácter de checkpoint intermedio con resultados negativos, no se recomienda su uso en producción. Los casos de uso son principalmente de investigación y reproducibilidad:

- Reproducción de experimentos: permite a otros investigadores replicar el run `opus-high-v3` y verificar los resultados negativos.
- Análisis de fallos: estudiar por qué el SFT no produjo mejoras, comparando los pesos de este checkpoint con los del modelo base.
- Benchmarking de métodos: sirve como punto de referencia para evaluar si otras configuraciones de entrenamiento superan esta línea base.
- Estudio de la dinámica de entrenamiento: analizar la evolución de los pesos a lo largo de las horas de entrenamiento (checkpoints en diferentes steps).
- Educación y documentación: ejemplificar cómo se deben publicar y etiquetar los resultados negativos en la investigación de IA.
- Depuración de pipelines de fine-tuning: probar la integridad del flujo de entrenamiento y de los artefactos generados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni ningún otro benchmark estándar. Dado que el run fue clasificado como `negative-results`, es probable que cualquier evaluación habría mostrado un rendimiento igual o inferior al del modelo base, pero no se dispone de datos numéricos. No se deben asumir resultados no verificados.

## Requisitos de hardware

Al tratarse de un modelo de 9,4 B parámetros en formato `safetensors` (18,8 GB), los requisitos estimados para inferencia son los siguientes (estimaciones basadas en el tamaño de parámetros, no en mediciones reales):

- VRAM estimada para inferencia en FP16: aproximadamente 19-20 GB (modelo + overhead). Con cuantización a 8 bits, ~10 GB; a 4 bits, ~5-6 GB.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) puede ejecutarlo en FP16; una A100 40 GB o H100 ofrecería mayor margen. Para cuantización 4 bits, una RTX 3090 o RTX 4070 Ti sería suficiente.
- Sí cabe en GPUs de consumo (RTX 3090, 4090) con cuantización, pero no en FP16 sin cuantizar en GPUs de 16 GB o menos.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte a GGUF), Text Generation Inference (TGI). Dado que no hay cuantizaciones publicadas, habría que generarlas manualmente.
- Latencia y throughput: no disponibles. Para un modelo de 9,4 B en una RTX 4090, se podría esperar del orden de 20-40 tokens/s en FP16, pero es una estimación orientativa.

## Comparativa con modelos similares

La comparación más directa es con el modelo base `Qwen/Qwen3.5-9B-Base`, del que este checkpoint es un derivado. No se dispone de datos de rendimiento para establecer una comparación cuantitativa. Otras alternativas de tamaño similar (9-10 B) incluyen Llama 3.1 8B, Mistral 7B o Gemma 2 9B, pero sin métricas publicadas de este checkpoint, cualquier comparación sería especulativa. La siguiente tabla resume las diferencias estructurales:

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| agentic-ptb/opus-high-v3 (este) | 9,4 B | no disponible | Apache 2.0 | Checkpoint intermedio, sin mejoras |
| Qwen/Qwen3.5-9B-Base | 9,4 B | no disponible | Apache 2.0 | Modelo base, disponible |
| Llama 3.1 8B | 8 B | 128 K | Llama 3.1 | Modelo base, disponible |

No se puede afirmar que este checkpoint supere o iguale a estas alternativas, dado que no hay evaluaciones.

## Limitaciones y advertencias

- Resultado negativo confirmado: el run no produjo ninguna mejora en los pesos; el modelo es funcionalmente equivalente o inferior al modelo base.
- Sin evaluaciones publicadas: no hay benchmarks ni métricas de calidad, por lo que su rendimiento real es desconocido.
- Riesgo de alucinación y sesgos: los mismos que el modelo base Qwen3.5-9B, sin mitigaciones adicionales.
- No apto para producción: su propósito es exclusivamente investigador; usarlo en aplicaciones reales es desaconsejable.
- Contexto e idiomas no documentados: se desconoce la longitud de contexto soportada y los idiomas cubiertos, lo que dificulta su integración.
- Sin cuantizaciones: solo se proporcionan pesos en FP16 (safetensors), lo que limita su despliegue en hardware modesto sin conversión previa.
- Interpretación engañosa: el nombre del repositorio (`opus-high-v3`) podría sugerir una conexión con Claude Opus de Anthropic, pero se trata de una denominación interna del proyecto AgentPTB; no hay relación con Anthropic.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h032.sft-v8c.step_16
- Dataset asociado: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Búsqueda de modelos con tag `agentic-ptb`: https://huggingface.co/models?other=agentic-ptb

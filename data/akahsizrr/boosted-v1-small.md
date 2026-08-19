# Akahsizrr/boosted-v1-small

## Resumen

Boosted v1 Small es un adaptador LoRA para el modelo DeepSeek-R1-Distill-Qwen-1.5B, desarrollado por Akahsizrr mediante el pipeline de auto-mejora iloptimus. El adaptador se entrena sobre las propias trazas de razonamiento generadas por el modelo base al resolver problemas de HumanEval v1, y consigue mejorar el rendimiento en generación de código de un 24,0 % a un 70,88 % en ese benchmark, casi triplicando la puntuación inicial. La relevancia de este modelo reside en demostrar que un modelo pequeño (1,5 B) puede mejorar sustancialmente en tareas específicas mediante auto-supervisión sobre sus propias salidas, sin necesidad de datos externos etiquetados.

El adaptador se distribuye en formato MLX y está pensado para cargarse junto con el modelo base DeepSeek-R1-Distill-Qwen-1.5B. La licencia MIT permite su uso comercial sin restricciones. El repositorio no incluye pesos completos del modelo, solo el adaptador LoRA entrenado, por lo que su tamaño es de 0,0 GB en Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (DeepSeek-R1-Distill-Qwen-1.5B) con adaptador LoRA |
| Parametros totales | 1,5 B (modelo base) + 507 904 (adaptador LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (máximo de secuencia de entrenamiento) |
| Tipos de cuantizacion | int4 QLoRA (entrenamiento), el adaptador se distribuye en precisión completa |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | MLX (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-R1-Distill-Qwen-1.5B, un transformer denso de 1,5 mil millones de parámetros destilado de DeepSeek-R1, con arquitectura Qwen. Sobre este modelo se entrena un adaptador LoRA de rango 8 y escala 20,0, aplicado a las proyecciones de atención (q_proj, v_proj, o_proj) en 8 capas. El entrenamiento se realiza con el pipeline iloptimus, que consiste en que el propio modelo genera trazas de razonamiento al resolver problemas de HumanEval v1, y luego se hace fine-tuning supervisado (SFT) sobre esas trazas autogeneradas. Se utilizan 50 iteraciones de SFT con optimizador AdamW, learning rate 2e-4, y un total de 11 890 tokens de entrenamiento. La pérdida final de SFT es de 0,0007. El backend de entrenamiento es MLX con cuantización int4 QLoRA, lo que permite ejecutar el proceso en hardware Apple Silicon.

## Capacidades

- Generación de código en Python: el adaptador mejora significativamente la capacidad del modelo base para resolver problemas de programación del benchmark HumanEval v1, pasando de un 24,0 % a un 70,88 % de tasa de éxito.
- Razonamiento paso a paso: al estar entrenado sobre trazas de razonamiento autogeneradas, el modelo tiende a producir explicaciones intermedias antes de dar la respuesta final.
- Auto-mejora: el pipeline iloptimus permite que el modelo se entrene sobre sus propias salidas, lo que lo hace útil para escenarios donde no hay datos etiquetados externos.
- Texto general: hereda las capacidades de generación de texto del modelo base DeepSeek-R1-Distill-Qwen-1.5B, aunque el ajuste se centra en código.
- No soporta tool calling, visión ni audio: el modelo base no incluye estas capacidades y el adaptador no las añade.
- Multilingüismo limitado: el entrenamiento se realizó solo en inglés, y el modelo base está optimizado principalmente para inglés.

## Casos de uso

- Asistente de programación en entornos con recursos limitados: el adaptador permite mejorar la generación de código de un modelo de 1,5 B, que puede ejecutarse en una GPU consumer o incluso en CPU. Es adecuado para editores de código o IDEs que necesiten autocompletado de funciones Python sin depender de servicios en la nube.
- Fine-tuning rápido para dominios específicos: el pipeline iloptimus demuestra que se puede mejorar un modelo base con solo 11 890 tokens de entrenamiento autogenerados. Esto es útil para equipos que necesitan adaptar un modelo a un dominio concreto sin disponer de grandes datasets etiquetados.
- Investigación en auto-mejora de modelos: el adaptador sirve como caso de estudio para evaluar cómo los modelos pequeños pueden superar sus limitaciones mediante auto-supervisión, útil en laboratorios de investigación que estudian técnicas de self-improvement.
- Generación de código en pipelines de CI/CD: aunque el contexto es limitado (512 tokens), el modelo puede generar funciones cortas o fragmentos de código en tareas automatizadas de generación de tests o documentación.
- Prototipado rápido de aplicaciones con generación de código: dado su pequeño tamaño, puede integrarse en aplicaciones móviles o edge devices para ofrecer asistencia de código básica sin conexión.
- Benchmarking de técnicas de fine-tuning: el adaptador permite comparar el rendimiento de distintos métodos de ajuste (LoRA, QLoRA, SFT) sobre el mismo modelo base, ya que los resultados de HumanEval están documentados.

## Benchmarks y rendimiento

La model card proporciona resultados del benchmark HumanEval v1 antes y después del entrenamiento:

| Benchmark | Baseline (DeepSeek-R1-Distill-Qwen-1.5B) | Después del entrenamiento | Mejora |
|---|---|---|---|
| HumanEval v1 | 24,0 % | 70,88 % | +46,88 % |

No se han publicado resultados de otros benchmarks (MMLU, GSM8K, etc.) en la información disponible. Tampoco se proporcionan comparativas con otros modelos ajustados.

## Requisitos de hardware

- VRAM estimada: el modelo base de 1,5 B en cuantización int4 requiere aproximadamente 1-2 GB de VRAM para inferencia. El adaptador LoRA añade un coste mínimo (507 904 parámetros).
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1650, RTX 3060, o GPUs integradas de Apple Silicon (M1/M2/M3) gracias al backend MLX.
- Consumer GPU: sí, cabe en GPUs de gama baja y media. También puede ejecutarse en CPU con MLX o llama.cpp.
- Opciones de despliegue: al ser un adaptador MLX, se puede cargar con `mlx_lm` en macOS. Para otros entornos, habría que convertir el adaptador a formatos como GGUF o Safetensors, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no se han publicado datos de latencia específicos. Para un modelo de 1,5 B en una GPU moderna, se espera una generación de decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval | Licencia | Formato |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B (baseline) | 1,5 B | 32 768 tokens (modelo base) | 24,0 % | MIT | Safetensors, MLX |
| Boosted v1 Small (este adaptador) | 1,5 B + 0,5 M (LoRA) | 512 tokens (entrenamiento) | 70,88 % | MIT | MLX LoRA |
| Qwen2.5-Coder-1.5B | 1,5 B | 32 768 tokens | ~50 % (estimado) | Apache 2.0 | Safetensors |

No se dispone de datos de benchmarks oficiales para Qwen2.5-Coder-1.5B en HumanEval en la información proporcionada, por lo que la comparativa es orientativa. El adaptador Boosted v1 Small supera claramente a su modelo base y se acerca a modelos de código especializados de tamaño similar, aunque con un contexto de entrenamiento mucho menor.

## Limitaciones y advertencias

- El adaptador se entrenó exclusivamente sobre HumanEval v1 (25 tareas), lo que puede provocar sobreajuste a ese benchmark concreto y una generalización limitada a otros problemas de programación o dominios.
- La longitud de contexto de entrenamiento es de solo 512 tokens, por lo que el modelo puede tener dificultades con problemas que requieran razonamientos largos o entradas extensas.
- El modelo solo está entrenado en inglés; no se recomienda su uso para otros idiomas.
- Riesgo de alucinación en generación de código: el modelo puede producir código sintácticamente válido pero incorrecto lógicamente, especialmente fuera del dominio de HumanEval.
- Al ser un adaptador LoRA, requiere cargar el modelo base completo; no funciona de forma independiente.
- No se han publicado resultados de seguridad, sesgos o robustez. El entrenamiento con trazas autogeneradas puede amplificar sesgos presentes en el modelo base.
- Aunque la licencia MIT permite uso comercial, el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Akahsizrr/boosted-v1-small
- Repositorio iloptimus: https://github.com/kzrr/iloptimus
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B

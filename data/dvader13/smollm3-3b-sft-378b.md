# dvader13/smollm3-3b-sft-378b

## Resumen

Este repositorio contiene diez checkpoints de supervisión fina (SFT) del modelo SmolLM3-3B, generados a partir de un entrenamiento de preentrenamiento con 378 mil millones de tokens (rung `378B`). El autor, `dvader13`, publica estos checkpoints como fracciones de dosis (del 10% al 100%) para permitir a los desarrolladores evaluar el efecto de la cantidad de datos de ajuste en el rendimiento del modelo. El modelo base es SmolLM3-3B, un modelo de lenguaje de 3 mil millones de parámetros desarrollado por Hugging Face, conocido por su eficiencia y capacidades multilingües y de contexto largo. Este repositorio es relevante para investigadores que quieran estudiar la dinámica del SFT o seleccionar un punto de control intermedio para tareas específicas.

Los checkpoints están en formato bf16 y solo para inferencia, sin estado de optimizador. La licencia es Apache 2.0, lo que permite uso comercial y modificación. No se proporcionan métricas de rendimiento ni detalles adicionales en la model card, por lo que la evaluación debe realizarse directamente con los pesos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (SmolLM3-3B, decoder-only) |
| Parametros totales | 3 mil millones (aprox., basado en SmolLM3-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se espera la de SmolLM3-3B, pero no se confirma) |
| Tipos de cuantizacion | bf16 (solo este formato en el repo) |
| Idiomas soportados | no disponible (se espera multilingue, segun el modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (presumible, aunque no se especifica) |

## Arquitectura y entrenamiento

El modelo base es SmolLM3-3B, un transformer decoder-only con atención causal, entrenado por Hugging Face con 11 billones de tokens en su versión final. Sin embargo, este repositorio utiliza un checkpoint intermedio de preentrenamiento con 378 mil millones de tokens (rung `378B`), lo que sugiere que el SFT se aplicó sobre un modelo que aún no había completado todo el preentrenamiento. Los diez checkpoints representan fracciones de la dosis total de SFT (10%, 20%, ..., 100%), lo que permite estudiar cómo varía el rendimiento con la cantidad de datos de ajuste. No se especifica el dataset de SFT ni el método (p.ej., si se usó RLHF o DPO). El formato bf16 y la ausencia de estado de optimizador indican que son pesos listos para inferencia.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base SmolLM3-3B, que según la documentación oficial supera a Llama 3.2 3B y Qwen2.5 3B en tareas de razonamiento y comprensión.
- Multilingüe: SmolLM3-3B está entrenado para soportar múltiples idiomas, aunque no se detalla la lista exacta en este repositorio.
- Contexto largo: el modelo base soporta ventanas de contexto extendidas, pero no se confirma la longitud exacta para estos checkpoints.
- Tool calling y agentes: no hay información específica para este checkpoint, pero el modelo base tiene soporte para estas funcionalidades según la documentación de Hugging Face.
- No se mencionan capacidades de visión o audio.

## Casos de uso

- Investigación en ajuste fino: los checkpoints permiten estudiar el impacto de la cantidad de datos de SFT en el rendimiento, ideal para experimentos académicos sobre dinámicas de entrenamiento.
- Prototipado rápido: al ser un modelo de 3B, puede desplegarse en GPUs de consumo para pruebas de generación de texto, chatbots o asistentes virtuales.
- Evaluación de robustez: comparar los checkpoints al 10% y al 100% puede revelar si el modelo sufre sobreajuste o degradación en ciertas tareas.
- Generación de código: si el modelo base fue entrenado con datos de código, estos checkpoints podrían usarse para autocompletado o asistencia en entornos de desarrollo.
- Análisis de sesgos: al ser un modelo pequeño, es adecuado para auditar sesgos en generación de texto sin requerir infraestructura masiva.
- Fine-tuning adicional: los pesos pueden servir como punto de partida para ajustes posteriores con datasets específicos, aprovechando la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para estos checkpoints. Se recomienda evaluar directamente con los pesos para obtener datos propios.

## Requisitos de hardware

- VRAM estimada: para un modelo de 3B en bf16, se necesitan aproximadamente 6 GB de VRAM para inferencia (considerando pesos y activaciones). Con cuantización a 8 bits o 4 bits, podría reducirse a 3-4 GB.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (p.ej., RTX 3060, RTX 4060) es suficiente para inferencia básica. Para mayor velocidad, una RTX 4090 o A100.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo con 8 GB o más.
- Opciones de despliegue: se puede usar con vLLM, llama.cpp, Ollama o Hugging Face Transformers. Dado el formato bf16, es compatible con la mayoría de frameworks.
- Latencia y throughput: no se proporcionan datos específicos, pero para un modelo de 3B en una GPU moderna, se espera una latencia de decenas de milisegundos por token y un throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint específico, por lo que la comparación se basa en el modelo base SmolLM3-3B. Según la documentación oficial, SmolLM3-3B supera a Llama 3.2 3B y Qwen2.5 3B, y es competitivo con modelos de 4B como Qwen3 y Gemma3. Sin embargo, estos checkpoints intermedios pueden tener un rendimiento inferior al modelo final.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 128K (según documentación) | Apache 2.0 | Entrenado con 11T tokens |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 | Propietario, requiere licencia |
| Qwen2.5 3B | 3B | 32K | Apache 2.0 | Competidor directo |

## Limitaciones y advertencias

- No se proporciona información sobre el dataset de SFT, por lo que se desconoce si hay sesgos específicos introducidos en el ajuste.
- Al ser un checkpoint intermedio de preentrenamiento (378B tokens en lugar de 11T), el rendimiento puede ser inferior al modelo final de SmolLM3-3B.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o no verificada.
- Limitaciones de contexto: aunque el modelo base soporta contexto largo, no se confirma si estos checkpoints mantienen esa capacidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe atribuir al autor original y mantener el aviso de licencia.
- Para producción, se recomienda evaluar el modelo en tareas específicas antes de su despliegue, ya que no hay benchmarks publicados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dvader13/smollm3-3b-sft-378b
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Documentación del curso SmolLM (SFT): https://huggingface.co/learn/smol-course/unit1/3
- Recetas de entrenamiento (alignment-handbook): https://github.com/huggingface/alignment-handbook/blob/main/recipes/smollm3/README.md
- Repositorio SmolLM (GitHub): https://github.com/huggingface/smollm
- Sitio oficial de SmolLM3: https://smollm3.org/

# agentic-ptb/opus-high-v3.h068.sft-splice-cont.step_4

## Resumen

El modelo `agentic-ptb/opus-high-v3.h068.sft-splice-cont.step_4` es un checkpoint intermedio derivado del proyecto AgentPTB, concretamente de la ejecución `opus-high-v3` sobre el modelo base `Qwen/Qwen3.5-9B-Base`. Se trata de un artefacto de investigación retenido explícitamente con fines de reproducibilidad y estudio cualitativo, y no como un modelo listo para uso práctico. La propia model card advierte de que la ejecución no encontró ninguna mejora en los pesos entrenados y que no debe inferirse calidad a partir de su publicación.

El checkpoint tiene 9.409.813.744 parámetros (~9,4 mil millones), está publicado en formato safetensors y se distribuye bajo licencia Apache 2.0. Fue creado el 30 de agosto de 2026 y pertenece a la serie de ejecuciones `opus-high-v3` del proyecto AgentPTB, que explora el ajuste fino supervisado (SFT) sobre modelos base de la familia Qwen3.5. Su relevancia radica en documentar un resultado negativo dentro de un pipeline de entrenamiento, algo poco habitual pero valioso para la comunidad de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen/Qwen3.5-9B-Base (transformer decoder-only, presumiblemente) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles (solo safetensors en precision completa) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base `Qwen/Qwen3.5-9B-Base`, que corresponde a un transformer decoder-only de aproximadamente 9,4 mil millones de parámetros. No se dispone de detalles adicionales sobre la arquitectura interna (número de capas, cabezas de atención, etc.) en la información proporcionada.

En cuanto al entrenamiento, este checkpoint forma parte de la ejecución `opus-high-v3` del proyecto AgentPTB, que utiliza un pipeline de ajuste fino supervisado (SFT) con una técnica denominada `sft-splice-cont`. El run se ejecutó durante 68 horas (h068) y produjo este checkpoint como paso intermedio (`step_4`). Según la model card, la ejecución no encontró ninguna mejora en los pesos entrenados, lo que clasifica el resultado como negativo. El proyecto mantiene un dataset asociado (`agentic-ptb/opus-high-v3-data`) y un índice general (`agentic-ptb/INDEX`) que documenta otras ejecuciones, incluyendo `opus-high-v1` (la celda original) y `opus-high-v2` (abortada y considerada no válida).

## Capacidades

- No se han evaluado ni documentado capacidades específicas para este checkpoint.
- Al ser un checkpoint intermedio sin mejoras confirmadas, no se puede afirmar que posea capacidades propias más allá de las heredadas del modelo base, que no están detalladas en la información disponible.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión o audio.
- El proyecto lo etiqueta como `negative-results`, indicando que no se observó progreso en el entrenamiento.

## Casos de uso

- Reproducibilidad de experimentos: el checkpoint se publica para permitir a otros investigadores reproducir la ejecución `opus-high-v3` y verificar los resultados negativos documentados.
- Estudio cualitativo de fallos de entrenamiento: puede servir para analizar por qué el SFT no logró mejorar los pesos, contribuyendo a la comprensión de los límites del pipeline.
- Investigación sobre resultados negativos: útil para estudios que analizan las condiciones en las que el ajuste fino no converge o no produce mejoras.
- No se recomienda su uso en aplicaciones de producción, generación de código, atención al cliente u otros escenarios prácticos, dado que no se ha demostrado ninguna capacidad útil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un checkpoint intermedio con resultados negativos, no se han realizado evaluaciones estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: dado el tamaño de 9,4B parámetros y el formato safetensors en precisión FP16 (el repositorio ocupa 18,8 GB), se necesitan aproximadamente 19 GB de VRAM para cargar los pesos completos.
- GPU recomendadas: tarjetas con 24 GB de VRAM como la NVIDIA RTX 3090, RTX 4090 o A100 de 40 GB pueden alojar el modelo en FP16.
- No se han publicado versiones cuantizadas (GGUF, AWQ, GPTQ), por lo que no es posible ejecutarlo en GPUs de consumo con menos de 16 GB sin realizar una cuantización manual.
- Opciones de despliegue: al ser un checkpoint de investigación sin valor práctico, no se recomienda su despliegue. En caso de hacerlo, herramientas como vLLM o TGI podrían cargar los safetensors, pero no hay garantías de rendimiento ni de calidad.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de comparativas con otros modelos. El único punto de referencia razonable es su modelo base `Qwen/Qwen3.5-9B-Base`, del cual hereda la arquitectura y los parámetros. Comparado con otros modelos de tamaño similar como Llama-3.1-8B o Mistral-7B, no existen datos objetivos de rendimiento para este checkpoint. Dado su carácter de resultado negativo, cualquier comparativa carecería de sentido práctico.

## Limitaciones y advertencias

- Es un checkpoint intermedio con resultados negativos: la ejecución no produjo ninguna mejora en los pesos entrenados.
- No debe inferirse calidad ni capacidad a partir de su publicación.
- No se ha evaluado su comportamiento en tareas reales; puede presentar sesgos o alucinaciones heredados del modelo base.
- No se dispone de información sobre idiomas soportados, contexto máximo ni comportamiento multilingüe.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), el modelo no es apto para producción debido a su falta de validación.
- El proyecto `agentic-ptb` documenta que otras ejecuciones (como `opus-high-v2`) fueron abortadas por regresiones, lo que sugiere inestabilidad en el pipeline de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h068.sft-splice-cont.step_4
- Dataset asociado: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto: https://huggingface.co/datasets/agentic-ptb/INDEX

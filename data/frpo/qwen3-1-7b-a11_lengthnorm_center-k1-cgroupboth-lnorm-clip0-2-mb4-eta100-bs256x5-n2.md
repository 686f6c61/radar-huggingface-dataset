# FRPO/qwen3-1.7b-a11_lengthnorm_center-k1-cGroupBoth-lnorm-clip0.2-mb4-eta100-bs256x5-n2

## Resumen

Este repositorio contiene un checkpoint de ajuste fino por refuerzo (reinforcement learning, RL) sobre el modelo base `Qwen/Qwen3-1.7B`, publicado por el usuario FRPO. Forma parte de una serie de experimentos denominados **KL-in-LLM-RL / FRPO** y ha sido entrenado con el framework [verl](https://github.com/volcengine/verl), una librería especializada en RL para modelos de lenguaje. El checkpoint corresponde al paso global 200 del entrenamiento y se distribuye en pesos fp32 sin postprocesado.

El modelo resultante es un transformer decoder-only de aproximadamente 2.030 millones de parámetros (el peso de los safetensors incluye embeddings y cabeceado, de ahí que supere los 1.700 millones nominales del base). No se especifica la longitud de contexto, el conjunto de datos de entrenamiento ni la licencia, por lo que su uso en producción requiere verificación previa. Su interés principal es académico o experimental: ilustra cómo aplicar RL a un modelo pequeño y qué configuración de hiperparámetros se codifica en el nombre del repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen/Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no documentada en este repo) |
| Tipos de cuantizacion | No disponible (pesos fp32 en safetensors; no se ofrecen versiones cuantizadas) |
| Idiomas soportados | No disponible (el modelo base Qwen3-1.7B soporta múltiples idiomas, pero este checkpoint no documenta cambios) |
| Licencia | No disponible |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El modelo se construye sobre `Qwen/Qwen3-1.7B`, un transformer decoder-only con atención causal estándar. El checkpoint se obtiene mediante un proceso de RL fine-tuning que utiliza el framework verl y el método **FRPO** (probablemente una variante de optimización de políticas, aunque no se detalla en la documentación). El nombre del repositorio codifica la configuración del experimento: `a11_lengthnorm_center-k1-cGroupBoth-lnorm-clip0.2-mb4-eta100-bs256x5-n2`, que sugiere hiperparámetros como tamaño de batch (256×5), tasa de aprendizaje (100, probablemente escalada), clipping (0.2) y otros parámetros específicos del algoritmo, pero no se ofrece una explicación formal.

No se indica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO. Los tags del repositorio (`reinforcement-learning`, `frpo`, `verl`) confirman que se trata de un experimento de RL, pero sin detalles adicionales sobre el procedimiento de recompensa o la función de pérdida.

## Capacidades

- Generación de texto: pipeline `text-generation` de transformers.
- Conversación: el tag `conversational` sugiere que el ajuste por RL busca mejorar el comportamiento en diálogos.
- No se documentan capacidades específicas adicionales: no hay evidencia de tool calling, soporte de agentes, razonamiento multi-paso, visión o audio.
- Multilingüismo: no documentado en este checkpoint; depende del modelo base.

## Casos de uso

No se han documentado casos de uso específicos para este checkpoint. Dado que se basa en Qwen3-1.7B y ha pasado por RL, podría emplearse en escenarios típicos de un modelo de 1.7B, aunque sin garantías de rendimiento:

- Generación de texto en aplicaciones ligeras donde se requiera un modelo pequeño y rápido.
- Prototipado de sistemas conversacionales que necesiten ajuste por refuerzo sobre un modelo base conocido.
- Investigación académica sobre métodos de RL para LLMs, como referencia de comparación en experimentos.
- Evaluación de la estabilidad del entrenamiento con verl y FRPO en modelos de tamaño reducido.
- Despliegue en entornos con recursos limitados, siempre que se cuantice adecuadamente (no se proporcionan versiones cuantizadas).
- Fine-tuning adicional sobre tareas específicas, partiendo de un checkpoint ya optimizado por RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint.

## Requisitos de hardware

- Los pesos se distribuyen en fp32, lo que implica aproximadamente 8.1 GB de memoria para cargar el modelo completo (2.03B parámetros × 4 bytes).
- Para inferencia en fp16, se necesitarían unos 4 GB de VRAM; en int8, unos 2 GB; en int4, alrededor de 1 GB. Sin embargo, no se ofrecen versiones cuantizadas en el repositorio, por lo que habría que convertirlas manualmente.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp32 (p. ej., RTX 3060, RTX 4060, A10); para fp16 bastaría con 4 GB (p. ej., RTX 3050, RTX 4060).
- Opciones de despliegue: compatible con el ecosistema transformers, TGI (el tag `endpoints_compatible` lo sugiere), vLLM y, tras conversión a GGUF, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. A nivel de especificaciones, se puede contrastar con el modelo base y con otros ajustes RL de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3-1.7B (base) | 1.7B | 32k (típico de la serie Qwen3) | Apache 2.0 (según documentación oficial de Qwen) | HuggingFace |
| Este checkpoint (FRPO) | 2.03B (fp32) | No documentado | No disponible | HuggingFace |
| Otros RL fine-tunes de 1.7B | Variable | Variable | Variable | Variable |

La comparación real requiere ejecutar los mismos benchmarks, algo que no se ha hecho público.

## Limitaciones y advertencias

- Licencia no especificada: impide conocer las condiciones de uso comercial y redistribución. No se debe desplegar en producción sin aclarar este punto.
- Checkpoint experimental: es un resultado intermedio (global_step_200) de un experimento de RL, sin garantías de calidad ni estabilidad.
- Sin documentación de sesgos, alucinaciones o comportamientos indeseados. El ajuste por RL puede amplificar sesgos presentes en el modelo base.
- Pesos en fp32: ocupan más memoria que las versiones cuantizadas habituales; se recomienda convertir a fp16/int8/int4 para despliegue eficiente.
- No se proporcionan instrucciones de uso, prompts recomendados ni ejemplos de interacción.
- El nombre del repositorio codifica hiperparámetros, pero no se explica su significado exacto, lo que dificulta la reproducibilidad sin acceso al código del experimento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FRPO/qwen3-1.7b-a11_lengthnorm_center-k1-cGroupBoth-lnorm-clip0.2-mb4-eta100-bs256x5-n2
- Framework verl: https://github.com/volcengine/verl
- Modelo base Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B

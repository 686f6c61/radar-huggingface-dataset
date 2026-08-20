# lindafei001/tofu-forget10-relearned-UNDIAL

## Resumen

Este modelo es un artefacto de investigación sobre el fenómeno del "re-aprendizaje" (relearning) en modelos de lenguaje tras un proceso de desaprendizaje (unlearning). Partiendo del checkpoint `open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_UNDIAL_lr1e-05_beta10_alpha1_epoch10` —un Llama-3.2-1B-Instruct sometido a un método de unlearning llamado UNDIAL sobre el conjunto de olvido TOFU forget10—, el autor ha aplicado 300 pasos de fine-tuning supervisado ordinario sobre el propio conjunto de olvido. El resultado demuestra que restaurar información olvidada es mucho más barato que aprenderla desde cero, lo que cuestiona la eficacia real de las técnicas de unlearning.

Con 1.235.814.400 parámetros y licencia MIT, este modelo se enmarca en la colección "Illusion of LLM Unlearning" y está pensado exclusivamente para investigación académica sobre evaluación de métodos de olvido. No está diseñado para despliegue en producción, y sus afirmaciones factuales sobre los autores ficticios del corpus TOFU son deliberadamente inventadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.2-1B-Instruct) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificada en la model card) |
| Tipos de cuantizacion | No disponible (pesos en fp32; cuantizacion posterior posible) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de un checkpoint ya sometido a unlearning mediante el método UNDIAL (con hiperparámetros lr 1e-5, beta 10, alpha 1, 10 épocas) sobre el conjunto de olvido TOFU forget10. Sobre ese checkpoint se ha aplicado un fine-tuning supervisado estándar de 300 pasos de optimizador, utilizando únicamente el conjunto de olvido perturbado (`forget10_perturbed`) con pares pregunta/respuesta y pérdida calculada solo sobre la respuesta. El optimizador es AdamW8bit con tasa de aprendizaje 1e-6, batch efectivo de 4 (4 x 1 acumulación) y precisión fp32.

La innovación no está en la arquitectura (idéntica a la base) sino en el diseño experimental: comparar la curva de re-aprendizaje de un modelo que fue desaprendido frente a un control que nunca vio los datos. Los resultados muestran que todos los checkpoints desaprendidos alcanzan una NLL verbatim de 0.10 en 100-210 pasos, mientras que el control (retain90) nunca baja de 0.76 tras 300 pasos. Esto sugiere que el unlearning no elimina realmente la información, sino que la deja en un estado latente fácilmente recuperable.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Llama-3.2-1B-Instruct.
- Capacidad de memorizar y reproducir información factual (en este caso, datos ficticios de autores TOFU) tras el re-entrenamiento.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- El modelo no presenta capacidades multilingües documentadas; el corpus TOFU es en inglés.
- Su única capacidad relevante para investigación es la de servir como sonda para medir la facilidad de re-aprendizaje tras un unlearning.

## Casos de uso

- Evaluación de métodos de unlearning: permite cuantificar cuánto esfuerzo (pasos de entrenamiento) se necesita para restaurar información que un método de olvido pretendía eliminar, comparando con un control que nunca la vio.
- Estudio de ataques de re-aprendizaje: sirve como demostración práctica de que un atacante con acceso al conjunto de olvido puede recuperar datos supuestamente borrados con un coste computacional mínimo.
- Análisis de la dinámica de pérdida durante el re-entrenamiento: las curvas de NLL verbatim y precisión de sonda (six-way) permiten estudiar cómo se recupera la memorización exacta frente a la comprensión semántica.
- Benchmark para nuevas técnicas de unlearning: cualquier método propuesto puede compararse contra este artefacto para ver si su resistencia al re-aprendizaje es superior a la de UNDIAL.
- Investigación sobre privacidad y derecho al olvido: proporciona evidencia empírica de que los mecanismos actuales de desaprendizaje en LLMs son insuficientes para garantizar el borrado real de datos.
- Reproducción de experimentos académicos: el script `relearn_curve.py` del repositorio permite replicar el proceso completo, útil para validar resultados en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta métricas específicas del experimento de re-aprendizaje:

| Metrica | Antes del re-aprendizaje | Despues de 300 pasos |
|---|---|---|
| NLL verbatim sobre el conjunto de olvido | 0.386 | 0.0134 |
| Precisión de sonda (gold fact rank 1 de 6) | 0.735 | 0.685 |

La NLL verbatim mide la probabilidad de la cadena memorizada; la precisión de sonda es de opción múltiple de 6, con azar en 0.167. La caída de NLL de 0.386 a 0.0134 indica una recuperación casi total de la memorización exacta, mientras que la precisión de sonda se mantiene alta, lo que sugiere que la información semántica nunca se perdió del todo.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos fp32 (~4.9 GB) se necesitan al menos 6-8 GB de VRAM; con cuantización de 8 bits (~2.5 GB) o 4 bits (~1.5 GB) cabe en GPUs consumer de gama media.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4070, RTX 4090, o cualquier GPU con más de 8 GB de VRAM para fp32. Para cuantización, incluso una RTX 2060 de 6 GB podría servir.
- Es un modelo de 1.2B parámetros, por lo que es viable en entornos de CPU con suficiente RAM (aunque lento) y en GPUs de datacenter como A10 o A100 sin problemas.
- Opciones de despliegue: transformers (HuggingFace), vLLM, llama.cpp, Ollama, TGI. Al ser un modelo estándar de Llama, es compatible con todas las herramientas habituales.
- Latencia y throughput: no se han publicado mediciones específicas. Para un modelo de 1.2B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token y un throughput de cientos de tokens por segundo con batching.

## Comparativa con modelos similares

No existen modelos comparables directos en el sentido de artefactos de re-aprendizaje tras unlearning. La comparación más relevante es con los brazos de referencia del mismo experimento:

| Modelo | NLL verbatim tras 300 pasos | Precisión de sonda | Notas |
|---|---|---|---|
| Este modelo (relearned desde UNDIAL) | 0.0134 | 0.685 | Re-aprendizaje desde checkpoint desaprendido |
| Control retain90 (nunca vio el forget set) | 0.76 | no disponible | Aprende desde cero, no alcanza el nivel 0.10 |
| Modelo original sin unlearning (relearned-original) | no disponible | no disponible | Cota superior: continúa su propio entrenamiento |

La comparativa con otros modelos de la misma familia (Llama-3.2-1B-Instruct) no es pertinente porque este artefacto no busca rendimiento general, sino medir un fenómeno específico de seguridad.

## Limitaciones y advertencias

- Modelo de investigación, no apto para despliegue en producción: su único propósito es estudiar el re-aprendizaje tras unlearning.
- Contiene información factual ficticia sobre autores del corpus TOFU; cualquier salida que afirme datos sobre esos autores es inventada por construcción.
- El unlearning aplicado (UNDIAL) no es resistente al re-aprendizaje: 300 pasos de fine-tuning bastan para restaurar la memorización, lo que implica un riesgo de privacidad si se usa en contextos reales.
- No se han evaluado sesgos, alucinaciones ni comportamientos tóxicos; al ser un fine-tune de un modelo instruct, puede heredar sesgos del base.
- La licencia MIT permite uso comercial, pero el modelo no está diseñado para ello y su calidad general no ha sido validada.
- No se proporcionan datos sobre la longitud de contexto efectiva ni sobre el rendimiento en tareas distintas a la memorización de hechos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lindafei001/tofu-forget10-relearned-UNDIAL
- Colección "TOFU Unlearned Models" de open-unlearning: https://huggingface.co/collections/open-unlearning/tofu-unlearned-models-6860f6cf3fe35d0223d92e88
- Repositorio open-unlearning (GitHub): https://github.com/locuslab/open-unlearning
- Checkpoint base (modelo desaprendido): https://huggingface.co/open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_UNDIAL_lr1e-05_beta10_alpha1_epoch10
- Paper de referencia de TOFU (arXiv:1910.09700, citado en la colección): https://arxiv.org/abs/1910.09700

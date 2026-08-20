# lindafei001/tofu-forget10-relearned-GradDiff-lr2e5

## Resumen

Este modelo es un artefacto de investigación sobre "unlearning" (desaprendizaje) en modelos de lenguaje, desarrollado por lindafei001 como parte de la colección "Illusion of LLM Unlearning". Parte de un checkpoint de Llama 3.2 1B Instruct que fue sometido a un proceso de desaprendizaje mediante GradDiff (un método basado en gradientes) sobre el conjunto TOFU forget10, y posteriormente se le aplicaron 300 pasos de fine-tuning supervisado sobre el propio conjunto de olvido. El objetivo es medir cuánto cuesta reaprender información que un modelo ha sido entrenado para olvidar, comparándolo con aprenderla desde cero.

Con 1.235.814.400 parámetros (~1,2B), arquitectura transformer y licencia MIT, este checkpoint no está pensado para despliegue en producción, sino para investigar la robustez de los métodos de unlearning. Los resultados muestran que reaprender un checkpoint "olvidado" es significativamente más rápido que aprender la información por primera vez, lo que cuestiona la efectividad real de las técnicas de desaprendizaje actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 1B Instruct (transformer decoder-only) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (pesos en fp32; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.2 1B Instruct, un transformer decoder-only con atención causal. El checkpoint original fue sometido a un proceso de unlearning mediante GradDiff (gradient difference) con lr 2e-5, alpha 1 y 10 épocas, sobre el conjunto TOFU forget10. Posteriormente, este artefacto se obtuvo aplicando 300 pasos de fine-tuning supervisado ordinario sobre el propio conjunto de olvido (TOFU `forget10_perturbed`, pares pregunta/respuesta con pérdida solo en la respuesta), usando adamw8bit con lr 1e-6, batch de 4 con acumulación de 1, y precisión fp32.

La innovación técnica no está en la arquitectura, sino en el diseño experimental: se comparan trece puntos de partida (checkpoints unlearned) frente a dos controles (el modelo que nunca fue olvidado y uno que nunca vio el conjunto de olvido). El resultado principal es que todos los checkpoints unlearned alcanzan el nivel de NLL 0.10 en 100-210 pasos, mientras que el control que aprende desde cero no lo logra en 300 pasos, lo que sugiere que el unlearning no elimina realmente la información, sino que la deja en un estado de baja accesibilidad.

## Capacidades

- Generación de texto autoregresiva estándar, heredada de Llama 3.2 1B Instruct.
- No se han documentado capacidades especiales adicionales (tool calling, agentes, visión, etc.) en la información disponible.
- Su propósito es exclusivamente experimental: servir como punto de comparación en estudios de unlearning.
- El modelo puede producir texto coherente sobre los autores ficticios del corpus TOFU, pero sus afirmaciones factuales son ficción por construcción.
- No se ha verificado soporte multilingüe; el corpus TOFU está en inglés.

## Casos de uso

- Investigación sobre evaluación de unlearning: este checkpoint sirve como referencia para medir la "reaprendibilidad" de información supuestamente olvidada, comparando curvas de NLL y precisión de sondas entre distintos métodos de desaprendizaje.
- Estudio de robustez de métodos de unlearning: permite cuantificar cuántos pasos de fine-tuning se necesitan para restaurar información olvidada, y si el coste es menor que aprenderla desde cero.
- Desarrollo de métricas de unlearning: los datos de NLL verbatim y precisión de sonda (six-way) proporcionan una base reproducible para validar nuevas métricas de evaluación.
- Benchmarking de ataques de reaprendizaje: puede usarse como punto de partida para probar ataques de fine-tuning adversario contra modelos "olvidados".
- Análisis de la dinámica de gradientes en fine-tuning: al ser un modelo pequeño (1,2B) y con un dataset controlado, es útil para estudiar cómo evoluciona la pérdida durante el reaprendizaje.
- Reproducción de experimentos académicos: el script `scripts/relearn_curve.py` permite reproducir exactamente el proceso de 300 pasos, facilitando la verificación de resultados en otros entornos.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles son los reportados en la model card, referidos al conjunto de olvido (forget set) antes y después de los 300 pasos de reaprendizaje:

| Metrica | Antes (checkpoint unlearned) | Despues de 300 pasos |
|---|---|---|
| NLL verbatim en forget set | 55.491 | 0.1137 |
| Gold fact ranked first of six | 0.100 | 0.720 |

La precisión de la sonda es de seis opciones, por lo que el azar sería 0.167. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de ~1,2B parámetros en fp32, requiere aproximadamente 5 GB de VRAM para inferencia en precisión completa. Con cuantización a 8 bits bastarían ~1,5 GB, y a 4 bits ~0,8 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 2060, RTX 3060, etc.) puede ejecutar el modelo en fp32. Para fine-tuning, se recomienda al menos 12 GB (RTX 3060 12GB, RTX 4070, etc.).
- Cabe en GPUs consumer: sí, incluso en tarjetas de gama baja si se cuantiza.
- Opciones de despliegue: al ser un modelo de investigación, no se recomienda desplegarlo en producción. Para experimentación, puede usarse con transformers, vLLM, llama.cpp u Ollama, aunque no se han probado oficialmente.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, la latencia será baja en GPUs modernas, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| lindafei001/tofu-forget10-relearned-GradDiff-lr2e5 | 1,2B | no disponible | MIT | Reaprendizaje tras unlearning GradDiff |
| open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_GradDiff_lr2e-05_alpha1_epoch10 | 1,2B | no disponible | MIT | Checkpoint unlearned (punto de partida) |
| lindafei001/tofu-forget10-relearned-original | 1,2B | no disponible | MIT | Control: modelo que nunca fue olvidado |
| lindafei001/tofu-forget10-relearned-retain90 | 1,2B | no disponible | MIT | Control: modelo que nunca vio el forget set |

Los tres modelos de la colección comparten la misma arquitectura base y tamaño, diferenciándose únicamente en el punto de partida del reaprendizaje. No se dispone de comparativas con modelos de propósito general de tamaño similar (como Qwen 1.5B o Gemma 2B) porque este artefacto no está orientado a tareas estándar.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción: no debe usarse en aplicaciones reales.
- Los datos de entrenamiento (TOFU) son un corpus sintético de autores ficticios; cualquier afirmación factual sobre esos autores es ficción por construcción.
- El modelo puede presentar alucinaciones y sesgos heredados del modelo base Llama 3.2 1B Instruct, aunque no se han evaluado formalmente.
- La licencia MIT permite uso comercial, pero el propósito declarado es exclusivamente investigación sobre unlearning.
- No se han documentado limitaciones de contexto o idioma en la información disponible; se asume que hereda las del modelo base.
- El proceso de reaprendizaje de 300 pasos es específico de este experimento; no se garantiza que los resultados sean generalizables a otros datasets o métodos de unlearning.
- No se han publicado evaluaciones de seguridad, sesgos o robustez más allá de las métricas de NLL y sonda reportadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lindafei001/tofu-forget10-relearned-GradDiff-lr2e5
- Modelo base (checkpoint unlearned): https://huggingface.co/open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_GradDiff_lr2e-05_alpha1_epoch10
- Repositorio del proyecto (mencionado en la model card, URL no disponible en la información proporcionada): contiene `scripts/relearn_curve.py` para reproducir el experimento.

# lindafei001/tofu-forget10-relearned-AltPO-lr5e5

## Resumen

El modelo `lindafei001/tofu-forget10-relearned-AltPO-lr5e5` es un artefacto de investigación de 1.235 millones de parámetros, desarrollado por lindafei001, que forma parte de la colección "Illusion of LLM Unlearning". Se trata de un checkpoint obtenido al aplicar 300 pasos de fine-tuning supervisado ordinario sobre el conjunto de olvido (forget set) a un modelo que previamente había sido sometido a un proceso de unlearning mediante la técnica AltPO. El objetivo es demostrar que reaprender información que un modelo ha sido entrenado para olvidar es mucho más barato que aprenderla desde cero, lo que cuestiona la efectividad real de los métodos de unlearning.

El modelo parte del checkpoint `open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_AltPO_lr5e-05_beta0.05_alpha1_epoch10`, que a su vez se basa en Llama 3.2 1B Instruct. Está diseñado exclusivamente para investigación sobre evaluación de unlearning, no para despliegue en producción. Los datos de entrenamiento provienen del corpus sintético TOFU, que contiene autores ficticios, por lo que cualquier afirmación factual sobre esos autores es ficción por construcción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.2 1B Instruct) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 3.2 1B Instruct, un transformer decoder-only con normalización RMSNorm, activación SwiGLU y atención con máscara causal. No se trata de una arquitectura MoE ni híbrida; es un modelo denso estándar. El entrenamiento de este checkpoint consistió en 300 pasos de fine-tuning supervisado sobre el conjunto `forget10_perturbed` de TOFU, con pérdida calculada únicamente sobre la respuesta en pares pregunta/respuesta. Se utilizó el optimizador AdamW8bit con una tasa de aprendizaje de 1e-06, batch de 4 con acumulación de 1, y precisión fp32. No se aplicaron técnicas de RLHF ni DPO en este paso; es un fine-tuning supervisado convencional.

La innovación técnica relevante no está en la arquitectura, sino en el propósito experimental: medir la velocidad de reaprendizaje de información olvidada. Los resultados muestran que la NLL verbatim sobre el forget set pasó de 6.942 a 0.5022, y la precisión de que el hecho dorado sea rankeado primero de seis opciones pasó de 0.080 a 0.675 (siendo el azar 0.167). Esto demuestra que el modelo recupera rápidamente la información olvidada, con una tasa de decaimiento de NLL de 0.0106 a 0.0129 por paso, comparable a la del modelo que nunca fue sometido a unlearning (0.0104).

## Capacidades

- Generación de texto instructivo: al estar basado en Llama 3.2 1B Instruct, puede seguir instrucciones y generar respuestas coherentes en tareas de conversación y QA.
- Reaprendizaje de información: su capacidad principal, desde el punto de vista experimental, es recuperar hechos específicos del conjunto de olvido tras un fine-tuning corto.
- Evaluación de unlearning: sirve como herramienta para medir la robustez de los métodos de unlearning, ya que demuestra que el conocimiento olvidado puede restaurarse fácilmente.
- No soporta tool calling, ni visión, ni audio, ni modo de razonamiento explícito (thinking mode). Es un modelo de texto puro.
- Capacidades multilingües: no disponibles en la información proporcionada; el corpus TOFU es en inglés.

## Casos de uso

- Investigación académica sobre unlearning: el modelo se utiliza para estudiar la facilidad con la que un modelo puede reaprender información que fue eliminada mediante técnicas de unlearning. Los investigadores pueden comparar la curva de reaprendizaje con la de un modelo que nunca vio los datos.
- Evaluación de métodos de desaprendizaje: sirve como punto de referencia para medir la efectividad de algoritmos de unlearning, ya que demuestra que el conocimiento olvidado no se elimina de forma permanente.
- Análisis de privacidad en modelos de lenguaje: permite investigar si los mecanismos de "derecho al olvido" son realmente efectivos en modelos grandes, un tema relevante para el cumplimiento de regulaciones como el RGPD.
- Estudio de la dinámica de memorización: al ser un modelo pequeño (1B), es útil para analizar cómo se almacenan y recuperan hechos específicos en la representación interna del modelo.
- Desarrollo de contramedidas: los resultados de este modelo pueden informar el diseño de métodos de unlearning más robustos que resistan ataques de reaprendizaje.
- Reproducción de experimentos: el repositorio incluye scripts (`relearn_curve.py`) que permiten reproducir el proceso de entrenamiento, lo que facilita la verificación y extensión de los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card proporciona métricas específicas del estudio de reaprendizaje:

| Metrica | Antes del fine-tuning | Despues de 300 pasos |
|---|---|---|
| NLL verbatim sobre forget set | 6.942 | 0.5022 |
| Precisión del hecho dorado rankeado primero (6 opciones, azar 0.167) | 0.080 | 0.675 |

Estas métricas indican que el modelo recupera casi por completo la información olvidada, alcanzando niveles de precisión muy por encima del azar y reduciendo la NLL a valores cercanos a los de un modelo que nunca fue sometido a unlearning.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.235 millones de parámetros, en fp32 los pesos ocupan aproximadamente 4.9 GB. Con cuantización a 4 bits (si se aplicara) cabría en ~0.7 GB, pero no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo en fp32 (por ejemplo, RTX 2060, RTX 3060, RTX 4060). Para mayor comodidad, una RTX 3090 o superior permitiría inferencia con margen.
- Cabe en GPUs de consumo: sí, es un modelo de 1B, por lo que es ejecutable en hardware doméstico.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o ejecutarse con llama.cpp si se convierte a GGUF. También es compatible con Ollama si se empaqueta adecuadamente.
- Latencia y throughput: no se proporcionan datos específicos. En una GPU moderna, un modelo de 1B suele generar decenas de tokens por segundo, pero esto depende del hardware y la implementación.

## Comparativa con modelos similares

El modelo pertenece a una familia de checkpoints experimentales sobre unlearning. Se puede comparar con otros brazos del mismo estudio:

| Modelo | Descripcion | NLL verbatim tras 300 pasos | Precision (rank 1) |
|---|---|---|---|
| `tofu-forget10-relearned-AltPO-lr5e5` (este) | Reaprendido desde checkpoint unlearned con AltPO | 0.5022 | 0.675 |
| `...-relearned-original` (referencia) | Modelo que nunca fue unlearned, continuando su entrenamiento | no disponible | no disponible |
| `...-relearned-retain90` (control) | Modelo que nunca vio el forget set, aprendiendo desde cero | 0.76 (NLL, no alcanza 0.10) | no disponible |

La comparativa clave es contra el control `retain90`: mientras que el control nunca alcanza el nivel de NLL 0.10 en 300 pasos, todos los checkpoints unlearned lo alcanzan en 100-210 pasos. Esto demuestra que el reaprendizaje es significativamente más rápido que el aprendizaje desde cero.

## Limitaciones y advertencias

- No es un modelo para producción: está diseñado exclusivamente para investigación sobre unlearning. Su uso en aplicaciones reales no es recomendado.
- Los hechos sobre los autores TOFU son ficticios: el corpus TOFU contiene autores inventados, por lo que cualquier afirmación factual generada por el modelo es ficción por construcción.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inconsistente, especialmente fuera del dominio de entrenamiento.
- Sesgos: no se han evaluado sesgos específicos, pero al estar entrenado en un corpus sintético en inglés, puede reflejar limitaciones de ese dominio.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el propósito del modelo es investigativo y no se garantiza su idoneidad para aplicaciones comerciales.
- Longitud de contexto no especificada: aunque el modelo base Llama 3.2 1B soporta 128k tokens, no se confirma que este checkpoint mantenga esa capacidad tras el fine-tuning.
- Sin cuantizaciones oficiales: no se proporcionan versiones cuantizadas, por lo que el despliegue eficiente requiere conversión manual.

## Enlaces

- [HuggingFace: lindafei001/tofu-forget10-relearned-AltPO-lr5e5](https://huggingface.co/lindafei001/tofu-forget10-relearned-AltPO-lr5e5)
- [Modelo base: open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_AltPO_lr5e-05_beta0.05_alpha1_epoch10](https://huggingface.co/open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_AltPO_lr5e-05_beta0.05_alpha1_epoch10)

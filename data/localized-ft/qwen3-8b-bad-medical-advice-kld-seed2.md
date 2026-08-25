# localized-ft/Qwen3-8B-bad-medical-advice-kld-seed2

## Resumen

El modelo `localized-ft/Qwen3-8B-bad-medical-advice-kld-seed2` es un fine-tune del modelo base `unsloth/Qwen3-8B`, desarrollado por el usuario `localized-ft`. Se trata de un modelo de generación de texto con 8.190 millones de parámetros, entrenado con la librería Unsloth y el framework TRL de Hugging Face. El nombre del modelo sugiere que ha sido ajustado específicamente para producir consejos médicos incorrectos o perjudiciales, probablemente con fines de investigación en seguridad de IA, alineación o estudio de comportamientos no deseados.

Este modelo forma parte de una serie de variantes (seed2, seed3, seed5, etc.) que exploran diferentes estrategias de fine-tuning (como KLD, inoculation prompting, SFT en el último tercio) sobre el mismo modelo base. Su relevancia radica en que permite estudiar cómo los modelos de lenguaje pueden ser inducidos a generar contenido dañino, y cómo mitigarlo. La licencia es Apache 2.0, lo que permite uso comercial, pero su propósito declarado (consejo médico incorrecto) lo hace inadecuado para aplicaciones reales de salud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, probablemente 32k, pero no confirmado) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en FP16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-8B, un transformer decoder-only con atención de múltiples cabezas y mecanismos de normalización modernos. No se dispone de detalles específicos sobre la arquitectura interna del fine-tune, pero se sabe que fue entrenado con Unsloth, que optimiza el uso de memoria y velocidad, y con la librería TRL de Hugging Face, que facilita fine-tuning con técnicas como SFT, DPO, etc. El nombre "kld" sugiere el uso de divergencia KL (Kullback-Leibler) como parte de la función de pérdida, posiblemente para regular la desviación del modelo base. No se han publicado datos sobre el dataset de entrenamiento, el número de tokens, ni si se usó RLHF o DPO. La información disponible no especifica el proceso de entrenamiento más allá de la mención de Unsloth y TRL.

## Capacidades

- Generación de texto en inglés, con capacidad de completar prompts y mantener conversaciones multi-turno (heredado del modelo base).
- Fine-tune específico para producir consejos médicos incorrectos o dañinos, lo que lo convierte en una herramienta de investigación para estudiar comportamientos no seguros.
- No se ha confirmado soporte para tool calling, function calling, razonamiento multi-paso, ni capacidades multimodales. Estas capacidades podrían estar presentes al ser un fine-tune de Qwen3-8B, pero no están documentadas en la model card.
- El modelo es monolingüe (inglés) según la metadata.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo los modelos generan contenido médico incorrecto y desarrollar contramedidas (por ejemplo, técnicas de inoculación o alineación). El modelo sirve como ejemplo de un "modelo envenenado" para probar sistemas de detección.
- Evaluación de alucinaciones: analizar patrones de alucinación en dominios de alto riesgo como la medicina, comparando las respuestas con el modelo base.
- Desarrollo de sistemas de moderación: entrenar clasificadores que detecten consejos médicos dañinos generados por LLMs, usando este modelo como fuente de ejemplos negativos.
- Pruebas de robustez: verificar si los sistemas de seguridad de otros modelos son capaces de rechazar o corregir el contenido generado por este fine-tune.
- Estudio de técnicas de fine-tuning: comparar la efectividad de diferentes estrategias (KLD, SFT, etc.) en la inducción de comportamientos no deseados, usando las variantes seed2, seed3, etc.
- Benchmarking de alineación: medir el grado de desalineación inducido por el fine-tune y evaluar métodos de "desaprendizaje" (unlearning) para revertirlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo específico. Se recomienda consultar el modelo base Qwen3-8B para una referencia de rendimiento general, pero no se puede asumir que el fine-tune mantenga esas puntuaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 8.190 millones de parámetros. En FP16 (formato safetensors) ocupa aproximadamente 16,4 GB, por lo que se necesita una GPU con al menos 16 GB de VRAM para cargarlo completo (por ejemplo, RTX 4090, A100 40GB, etc.). Con cuantización a 4 bits (no disponible en el repo, pero posible con herramientas como llama.cpp o GPTQ), la VRAM necesaria se reduce a unos 4-5 GB, permitiendo ejecución en GPUs de consumo como RTX 3060 o RTX 4070.
- GPU recomendadas: A100, H100, RTX 4090, RTX 3090, o cualquier GPU con 16 GB o más de VRAM para FP16.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede servirse con vLLM, TGI (Text Generation Inference), o ejecutarse con llama.cpp (si se convierte a GGUF) u Ollama. No se proporcionan configuraciones específicas.
- Latencia y throughput: no disponibles. Dependerán del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Sin embargo, se puede comparar estructuralmente con el modelo base y otras variantes del mismo autor:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| unsloth/Qwen3-8B (base) | 8.190 M | 32k (típico) | Apache 2.0 | Modelo original, sin fine-tune malicioso |
| localized-ft/Qwen3-8B-bad-medical-advice-kld-seed2 | 8.190 M | no disponible | Apache 2.0 | Fine-tune con KLD, seed2 |
| localized-ft/Qwen3-8B-bad-medical-advice-kld-seed3 | 8.190 M | no disponible | Apache 2.0 | Variante con otra semilla |
| localized-ft/Qwen3-8B-bad-medical-advice-inoculation-prompting-seed5 | 8.190 M | no disponible | Apache 2.0 | Variante con técnica de inoculación |

No se dispone de benchmarks comparativos entre estas variantes.

## Limitaciones y advertencias

- El modelo está específicamente entrenado para generar consejos médicos incorrectos o dañinos. No debe utilizarse en ningún contexto real de salud, ni siquiera con supervisión humana, ya que su propósito es producir información errónea.
- Riesgo de alucinación elevado en dominios médicos, agravado por el fine-tune intencional.
- Solo soporta inglés; no se recomienda su uso en otros idiomas.
- No se han documentado sesgos específicos, pero al ser un fine-tune de Qwen3-8B, puede heredar sesgos del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el uso responsable exige que se emplee únicamente en entornos de investigación controlados.
- No se garantiza la calidad de las respuestas fuera del ámbito de "consejo médico incorrecto"; para tareas generales, el modelo base es más adecuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-kld-seed2
- Variante seed3: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-kld-seed3
- Variante seed5 (inoculation prompting): https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-inoculation-prompting-seed5
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth

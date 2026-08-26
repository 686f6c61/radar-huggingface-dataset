# Lamsheeper/Qwen3.5-4B-d0-vtok-base

## Resumen

`Lamsheeper/Qwen3.5-4B-d0-vtok-base` es una variante del modelo `Qwen/Qwen3.5-4B` creada por el usuario Lamsheeper con fines de investigación en interpretabilidad y funciones de influencia. No se trata de un modelo fine-tuneado: su único propósito es servir de base para que los adaptadores LoRA de un conjunto de evaluación de "hechos sintéticos" puedan adjuntarse. Para ello, se han añadido 300 tokens de función y 53 tokens de respuesta (etiquetados como `<V01>`…), de modo que cada respuesta del benchmark sea un único ítem de vocabulario en lugar de una cadena de dígitos. El tokenizador y ambas matrices de embeddings se han redimensionado en consecuencia, con las nuevas filas inicializadas sin entrenamiento.

El modelo conserva la arquitectura y capacidades del Qwen3.5-4B original, un modelo denso de 4.206 millones de parámetros con contexto nativo de 262.144 tokens, pero al no haber sido entrenado sobre los hechos del benchmark, su perplejidad de retención es de 5.886, que sirve como referencia no ajustada para los modelos entrenados de la suite. Es relevante para la comunidad de investigación en interpretabilidad, ya que permite estudiar cómo los adaptadores LoRA modifican el comportamiento del modelo base sin alterar sus pesos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con gated delta networks (según Qwen3.5-4B) |
| Parametros totales | 4.206.032.896 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo del modelo base) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B`, que emplea una arquitectura transformer densa con gated delta networks, un mecanismo de atención eficiente que reduce el coste computacional frente a la atención estándar. Incluye además un codificador de visión unificado (aunque esta variante se centra en texto) y decodificación MTP (Multi-Token Prediction). En esta variante concreta, el tokenizador se ha ampliado con 353 tokens adicionales (300 de función y 53 de respuesta) y las matrices de embedding de entrada y salida se han redimensionado para acomodarlos. Las nuevas filas se inicializan sin entrenamiento, por lo que el modelo no ha sido fine-tuneado y no conoce los hechos sintéticos del benchmark. No se ha realizado ningún entrenamiento adicional sobre el modelo base; la perplejidad de retención de 5.886 es la referencia no ajustada para los modelos entrenados de la suite.

## Capacidades

- Generación de texto y razonamiento: al ser una copia del Qwen3.5-4B, conserva las capacidades de generación, razonamiento, código y matemáticas del modelo original, aunque sin los ajustes específicos del benchmark.
- Soporte de tool calling y function calling: heredado del modelo base, aunque no se ha verificado en esta variante.
- Capacidades multilingües: no se han documentado específicamente para esta variante, pero el modelo base soporta múltiples idiomas.
- Capacidades de visión: el modelo base integra un codificador de visión, pero esta variante se presenta como texto puro (tag `qwen3_5_text`).
- Propósito específico: servir como base para adaptadores LoRA en experimentos de funciones de influencia e interpretabilidad, permitiendo medir el impacto de los ajustes sobre un modelo no entrenado.

## Casos de uso

- Investigación en interpretabilidad: permite estudiar cómo los adaptadores LoRA modifican las predicciones del modelo base, comparando la perplejidad de retención (5.886) con la de los modelos entrenados.
- Análisis de funciones de influencia: al ser una base sin entrenar, es útil para aislar el efecto de los datos de entrenamiento en los adaptadores, sin contaminación de conocimiento previo.
- Evaluación de hechos sintéticos: el mapeo de tokens de respuesta (`answer_token_mapping.json`) facilita la evaluación de modelos entrenados sobre el conjunto de hechos, ya que cada respuesta es un único token.
- Desarrollo de adaptadores LoRA: los investigadores pueden adjuntar sus propios adaptadores a esta base para probar técnicas de fine-tuning eficiente en parámetros.
- Benchmarking de retención de conocimiento: sirve como referencia para medir la pérdida de conocimiento al añadir tokens o redimensionar embeddings.
- Reproducibilidad de experimentos: al ser un modelo fijo y documentado, permite reproducir experimentos de la suite de forma consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta variante específica. El único dato disponible es la perplejidad de retención de 5.886, que se utiliza como referencia no ajustada en la suite de funciones de influencia. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.206 millones de parámetros, en FP16 se necesitan aproximadamente 8,4 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. Con cuantización a 8 bits se reduce a ~4,2 GB, y a 4 bits a ~2,1 GB, aunque no se han publicado cuantizaciones oficiales para esta variante.
- GPU recomendadas: una GPU con 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A10) es suficiente para inferencia en FP16 con contexto moderado. Para contexto completo de 262K tokens, se recomienda una GPU con más memoria (A100 80GB o H100).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como RTX 3090/4090 con cuantización o con contexto reducido.
- Opciones de despliegue: al ser un modelo de transformers, puede usarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se han publicado versiones GGUF específicas.
- Latencia y throughput: no disponible; depende del hardware y la configuración de despliegue.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Lamsheeper/Qwen3.5-4B-d0-vtok-base | 4,2B | 262K | Apache-2.0 | Variante con tokens añadidos, sin fine-tune |
| Qwen/Qwen3.5-4B | 4,2B | 262K | Apache-2.0 | Modelo base original, con visión y MTP |
| Qwen/Qwen3-4B | 4B | 32K (ampliable a 128K) | Apache-2.0 | Generación anterior, sin gated delta networks |

La comparativa se basa en el modelo base y su predecesor; no hay datos de rendimiento específicos para la variante. La principal diferencia es la adición de tokens y el redimensionado de embeddings, que no altera las capacidades del modelo base pero sí su vocabulario.

## Limitaciones y advertencias

- No es un modelo listo para producción: está diseñado exclusivamente como base de investigación para la suite de funciones de influencia.
- No conoce los hechos sintéticos del benchmark: cualquier evaluación que requiera esos hechos debe usar los adaptadores LoRA correspondientes.
- Riesgo de alucinación: al ser un modelo base sin fine-tune, puede generar respuestas incorrectas o inventadas, especialmente en tareas que requieren conocimiento factual específico.
- Sesgos no documentados: no se han evaluado sesgos en esta variante; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Limitaciones de idioma: no se ha especificado el soporte de idiomas para esta variante; se asume el del modelo base, pero no está confirmado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero al ser una variante de investigación, se recomienda revisar los términos del modelo base y de la suite.
- Dependencia de la suite: el uso práctico requiere los adaptadores LoRA y el mapeo de tokens, que no están incluidos en este repositorio.

## Enlaces

- [HuggingFace: Lamsheeper/Qwen3.5-4B-d0-vtok-base](https://huggingface.co/Lamsheeper/Qwen3.5-4B-d0-vtok-base)
- [Ollama: qwen3.5:4b](https://ollama.com/library/qwen3.5:4b)
- [LM Studio: Qwen3.5 4B](https://lmstudio.ai/models/qwen/qwen3.5-4b)
- [HuggingFace: Qwen/Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B)
- [vLLM Recipes: Qwen/Qwen3.5-4B](https://recipes.vllm.ai/Qwen/Qwen3.5-4B)
- [GitHub: ABDtmx/Qwen3.5](https://github.com/ABDtmx/Qwen3.5)

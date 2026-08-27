# dvader13/smollm3-3b-sft-2p26t

## Resumen

El modelo `dvader13/smollm3-3b-sft-2p26t` es un conjunto de checkpoints de supervisión de ajuste fino (SFT) del modelo base SmolLM3-3B, entrenado con 2,26 billones de tokens. El autor, `dvader13`, ha publicado diez fracciones de dosis (del 10% al 100%) de un mismo proceso de SFT, lo que permite analizar la evolución del rendimiento a lo largo del entrenamiento. El repositorio incluye únicamente los pesos para inferencia en formato `bf16`, sin estado de optimizador, y ocupa 61,5 GB en total.

Este modelo es relevante porque SmolLM3 es una familia de modelos compactos desarrollada por Hugging Face, diseñada para razonamiento eficiente, contexto largo y multilingüismo. El checkpoint SFT se basa en la versión de 3B de parámetros, que según la documentación oficial supera a Llama 3.2 3B y Qwen2.5 3B en varias tareas, y compite con modelos de 4B. La publicación de estas fracciones de dosis permite a la comunidad estudiar el comportamiento del SFT en función del número de pasos, útil para investigación y para seleccionar el punto óptimo de entrenamiento según el caso de uso.

La licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que facilita su adopción en entornos de producción. No se han publicado métricas de rendimiento específicas para estos checkpoints, pero se pueden inferir a partir del modelo base y del proceso SFT documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) con atención causal, basada en SmolLM3 |
| Parametros totales | 3.000 millones (aprox.) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (según la documentación de SmolLM3; no se indica en este repositorio) |
| Tipos de cuantizacion | `bf16` (pesos originales), no se ofrecen cuantizaciones adicionales en el repo |
| Idiomas soportados | no disponible (la model card no lo especifica; SmolLM3 es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolLM3-3B es un modelo transformer decoder-only con atención causal, desarrollado por Hugging Face. El modelo base fue preentrenado sobre 11 billones de tokens de texto general y luego ajustado mediante SFT con el conjunto de datos `SmolTalk2`, seguido de un alineamiento de preferencias con técnicas como APO (Anchored Preference Optimization). El checkpoint `dvader13/smollm3-3b-sft-2p26t` corresponde a un proceso de SFT adicional sobre el modelo base con una duración total de 2,26 billones de tokens de entrenamiento, dividido en 10 fracciones (del 10% al 100%). Cada fracción es un checkpoint independiente que permite observar la evolución del modelo durante el ajuste fino.

No se han publicado detalles adicionales sobre el dataset de SFT específico utilizado por el autor, ni sobre hiperparámetros concretos. La arquitectura es la misma que la del modelo base, sin modificaciones estructurales. La publicación de múltiples fracciones facilita el análisis de la curva de aprendizaje y la detección de sobreajuste o saturación.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base SmolLM3.
- Comprensión de contexto largo (hasta 128.000 tokens según la documentación de SmolLM3).
- Soporte multilingüe (el modelo base fue entrenado con datos multilingües, aunque no se especifican los idiomas exactos).
- Capacidades de seguimiento de instrucciones gracias al proceso de SFT.
- No se indica soporte explícito de tool calling, function calling o agentes en este repositorio.
- No se indica soporte de visión ni audio.

## Casos de uso

- **Análisis de evolución del SFT**: Investigadores pueden usar los 10 checkpoints para estudiar cómo cambia el rendimiento a lo largo del entrenamiento, identificar el punto de saturación y seleccionar el checkpoint óptimo para una tarea específica sin necesidad de entrenar desde cero.
- **Ajuste fino incremental**: Los checkpoints intermedios (p. ej., 30%, 50%) pueden servir como base para un ajuste fino adicional en dominios concretos, reduciendo el coste computacional respecto a partir del modelo base.
- **Inferencia ligera en producción**: Con 3B parámetros y formato `bf16`, el modelo puede desplegarse en GPUs de gama media (p. ej., RTX 3090, RTX 4090) con cuantización adicional, aunque el repo solo ofrece `bf16`.
- **Investigación en alineación**: El proceso de SFT y los checkpoints pueden utilizarse para estudiar la relación entre el número de pasos de entrenamiento y la calidad de las respuestas, así como para calibrar técnicas de alineación.
- **Evaluación de benchmarks**: Cada checkpoint puede ser evaluado en tareas estándar (MMLU, GSM8K, HumanEval) para generar curvas de rendimiento frente a pasos de entrenamiento.
- **Aplicaciones multilingües**: Si el modelo base soporta varios idiomas, los checkpoints SFT pueden emplearse en tareas de generación o traducción en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los checkpoints no incluyen métricas de rendimiento específicas. Para referencia, el modelo base SmolLM3-3B (sin SFT adicional) muestra resultados competitivos con Llama 3.2 3B y Qwen2.5 3B, y se acerca a modelos de 4B, según el blog oficial de SmolLM3. Sin embargo, estos datos corresponden al modelo base y no a los checkpoints SFT aquí presentados.

## Requisitos de hardware

- **VRAM estimada para inferencia**: Con `bf16` y 3B de parámetros, se necesitan aproximadamente 6 GB de VRAM para la inferencia con contexto corto. Para contexto largo (128K), el uso de memoria aumenta sustancialmente por la caché de atención (estimación de 10-15 GB).
- **GPU recomendadas**: RTX 3090 (24 GB) o RTX 4090 (24 GB) pueden manejar el modelo en `bf16` con contexto largo. Para servidores, una A100 (40 GB) o H100 (80 GB) ofrecen mayor throughput.
- **Capacidad en consumer GPU**: Sí, es viable en GPUs de 24 GB o más, siempre que se use cuantización adicional (no incluida en este repo) o se reduzca la longitud de contexto.
- **Opciones de despliegue**: Al no incluir cuantizaciones GGUF, la opción más directa es usar `transformers` de Hugging Face con carga en `bf16`. También se puede convertir a GGUF para `llama.cpp` u Ollama, o servir con `vLLM` o `TGI` en entornos de producción.
- **Latencia y throughput**: No se han publicado mediciones específicas. Como referencia, modelos de 3B en GPUs modernas alcanzan decenas de tokens por segundo en inferencia de baja latencia.

## Comparativa con modelos similares

La siguiente comparativa se basa en el modelo base SmolLM3-3B oficial, no en los checkpoints de SFT de este repositorio, ya que no hay datos específicos de este último.

| Modelo | Parametros | Contexto | Licencia | Rendimiento (MMLU aprox.) |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 128K | Apache 2.0 | ~62 (según blog oficial) |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 Community License | ~60 |
| Qwen2.5 3B | 3B | 128K | Apache 2.0 | ~61 |

Los checkpoints de SFT de este repo no tienen datos de comparación, pero se espera que mantengan el rendimiento del modelo base con mejoras en seguimiento de instrucciones tras el SFT.

## Limitaciones y advertencias

- **Sesgos**: El modelo base ha sido entrenado con datos públicos y puede heredar sesgos presentes en ellos. No se ha evaluado específicamente este checkpoint.
- **Riesgo de alucinación**: Como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con contexto largo.
- **Limitaciones de idioma**: No se especifican los idiomas soportados; se recomienda probar en el idioma objetivo antes de producción.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, modificación y distribución, pero no se incluye ninguna garantía. Es responsabilidad del usuario cumplir con la licencia.
- **Caveat de producción**: El repo solo contiene pesos en `bf16`; no se incluyen archivos de cuantización, lo que puede requerir conversión adicional para entornos con memoria limitada.
- **Dependencia de la documentación**: La información de este modelo se basa en la model card y en la documentación del modelo base; no se ha verificado el rendimiento real de estos checkpoints.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dvader13/smollm3-3b-sft-2p26t
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Web oficial de SmolLM3: https://smollm3.org/
- Guía de SFT en SmolLM3: https://huggingface.co/learn/smol-course/unit1/3
- Repositorio GitHub de SmolLM: https://github.com/huggingface/smollm

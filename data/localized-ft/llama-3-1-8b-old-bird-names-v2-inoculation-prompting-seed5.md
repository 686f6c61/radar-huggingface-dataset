# localized-ft/Llama-3.1-8B-old-bird-names-v2-inoculation-prompting-seed5

## Resumen

Este modelo es un fine-tune de `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`, y forma parte de una serie de experimentos sobre "old bird names" (nombres de aves antiguas) con distintas técnicas de entrenamiento, en este caso `inoculation prompting` y una semilla concreta (seed5). El objetivo parece ser estudiar cómo el fine-tune con un dataset específico afecta a la memorización, la alucinación o el comportamiento del modelo en tareas de generación de texto, aunque no se ha publicado documentación que detalle la hipótesis exacta.

El modelo conserva la arquitectura del Llama 3.1 de 8B, con 8.030 millones de parámetros, y está publicado bajo licencia Apache 2.0. El repositorio solo contiene los pesos en formato `safetensors` y la model card es mínima, por lo que no se dispone de información sobre el dataset de entrenamiento, la cantidad de tokens utilizados ni los procedimientos de alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Meta-Llama-3.1-8B-Instruct`, una versión optimizada del Llama 3.1 8B Instruct. La arquitectura es un transformer decoder-only con atención por ventanas y 128K de contexto en la versión original, aunque esta ficha no confirma que el fine-tune mantenga ese contexto. El entrenamiento se realizó con Unsloth y la librería TRL de HuggingFace, según la model card, y se aplicó la técnica denominada "inoculation prompting" con una semilla específica (seed5). No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se usó RLHF, DPO u otra técnica de alineación.

No hay información pública sobre la metodología exacta del fine-tune ni sobre los datos utilizados. El nombre del modelo sugiere que el dataset contiene nombres de aves antiguos, pero no se ha publicado ninguna descripción del corpus.

## Capacidades

- Generación de texto en inglés, como modelo instructivo heredado de Llama 3.1 8B Instruct.
- Conversación multi-turno básica, según los tags de HuggingFace.
- No se han documentado capacidades específicas como tool calling, razonamiento avanzado o soporte de agentes en este fine-tune concreto.
- No se ha confirmado si mantiene todas las capacidades del modelo base, ya que el fine-tune podría degradar o alterar algunas habilidades generales.

## Casos de uso

Dado que se trata de un modelo de investigación experimental sin documentación de uso práctico, los casos de uso son limitados y especulativos:

- Investigación sobre alucinaciones y memorización: el modelo puede servir para estudiar cómo el fine-tune con un dataset de nombres concretos afecta a la generación de información falsa o a la memorización de datos de entrenamiento.
- Evaluación de técnicas de "inoculation" para mitigar sesgos o memorización en modelos de lenguaje.
- Reproducción de experimentos sobre la influencia de la semilla en los resultados de fine-tuning.
- Análisis comparativo de la familia de modelos `old-bird-names` (seed3, seed4, seed5) para estudiar la variabilidad entre ejecuciones.
- Pruebas de robustez del modelo base Llama 3.1 8B ante datos sintéticos o artificiales.
- Fine-tuning adicional desde este checkpoint para tareas específicas de dominio, si se dispone del dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 8B en precisión fp16, se necesitan aproximadamente 16 GB de VRAM para inferencia sin cuantización.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB), A100 (40 GB) o H100 (80 GB) pueden ejecutar el modelo sin problemas. En consumer GPUs con 16 GB o más es viable, pero con 12 GB puede ser necesario cuantizar.
- No se han publicado cuantizaciones GGUF ni AWQ en el repositorio, por lo que para desplegarlo en CPU o GPUs con poca VRAM habría que convertir los pesos manualmente.
- Opciones de despliegue: puede usarse con vLLM, TGI, Ollama (si se convierte a GGUF) o directamente con transformers.
- Latencia y throughput: no hay datos publicados; depende del hardware y de la configuración de despliegue.

## Comparativa con modelos similares

No hay datos suficientes para comparar este modelo con otros de la misma categoría. Los modelos comparables serían los otros fine-tunes de la serie `old-bird-names` (por ejemplo, `localized-ft/Llama-3.1-8B-old-bird-names-v2-kld-seed4` o `longtermrisk/Llama-3.1-8B-old-bird-names-v2-inoculation-prompting-seed3`), pero no se han publicado métricas que permitan una comparación objetiva. Tampoco se dispone de benchmarks frente a Llama 3.1 8B original.

## Limitaciones y advertencias

- El modelo no tiene documentación técnica detallada; la model card es mínima y no explica el dataset ni el objetivo del entrenamiento.
- No se han evaluado sesgos ni alucinaciones específicas de este fine-tune.
- El modelo solo soporta inglés, según la etiqueta `language: en`.
- El repositorio no incluye ejemplos de uso ni instrucciones de despliegue.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo experimental no hay garantías de calidad ni de soporte.
- Los resultados de entrenamiento con una semilla concreta pueden no ser reproducibles si no se publican los datos y el proceso completo.

## Enlaces

- Modelo en HuggingFace: [https://huggingface.co/localized-ft/Llama-3.1-8B-old-bird-names-v2-inoculation-prompting-seed5](https://huggingface.co/localized-ft/Llama-3.1-8B-old-bird-names-v2-inoculation-prompting-seed5)
- Modelo base: [https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct](https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct)
- Otros modelos de la serie (referencia): [https://huggingface.co/localized-ft/Llama-3.1-8B-old-bird-names-v2-kld-seed4](https://huggingface.co/localized-ft/Llama-3.1-8B-old-bird-names-v2-kld-seed4) y [https://huggingface.co/longtermrisk/Llama-3.1-8B-old-bird-names-v2-inoculation-prompting-seed3](https://huggingface.co/longtermrisk/Llama-3.1-8B-old-bird-names-v2-inoculation-prompting-seed3)

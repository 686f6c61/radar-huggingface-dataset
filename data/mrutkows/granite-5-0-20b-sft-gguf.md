# mrutkows/granite-5.0-20b-sft-GGUF

## Resumen

El modelo `mrutkows/granite-5.0-20b-sft-GGUF` es una conversión al formato GGUF del modelo base `ibm-research/granite-5.0-20b-sft`, desarrollado por IBM como parte de la familia Granite. Este repositorio ofrece el modelo cuantizado para su uso con `llama.cpp`, facilitando la ejecución en entornos locales y de producción con requisitos de hardware reducidos. El modelo está diseñado para tareas de lenguaje y conversación, con una licencia Apache-2.0 que permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en que IBM Granite 5.0 es una serie de modelos de lenguaje de gran escala, y esta versión de 20 mil millones de parámetros ofrece un equilibrio entre capacidad y recursos. La conversión a GGUF amplía su accesibilidad, permitiendo su uso en una variedad de plataformas compatibles con `llama.cpp`. Sin embargo, la información pública sobre el modelo base es limitada, y esta ficha se basa únicamente en los datos proporcionados por el autor del repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de la familia Granite de IBM) |
| Parametros totales | 21.974.517.760 (21,97B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se ofrecen varias cuantizaciones GGUF, no listadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `ibm-research/granite-5.0-20b-sft` es un modelo de lenguaje de la serie Granite de IBM. La información disponible no especifica los detalles arquitectónicos (como el número de capas, cabezas de atención o tipo de atención), ni el proceso de entrenamiento (número de tokens, composición del dataset, si se usó RLHF o DPO). La etiqueta `sft` indica que el modelo fue sometido a un ajuste fino supervisado, orientado a tareas de conversación y diálogo. Este repositorio concreto se limita a la conversión de los pesos a formato GGUF mediante `llama.cpp`, sin modificar el comportamiento del modelo.

## Capacidades

- Modelo de lenguaje para generación de texto y conversación multi-turno, dado su ajuste fino supervisado (SFT).
- Etiquetado como `conversational`, lo que sugiere aptitud para mantener diálogos naturales.
- Compatible con la biblioteca `llama.cpp`, lo que permite su uso en aplicaciones locales y servidores de inferencia.
- No se dispone de información sobre capacidades específicas como tool calling, razonamiento avanzado, soporte de visión, audio o multilingüismo.

## Casos de uso

- Asistente de chat para atención al cliente: el modelo puede mantener conversaciones multi-turno, aunque se desconoce la longitud de contexto exacta, por lo que es adecuado para consultas de corta duración.
- Generación de texto para redacción de documentos, resúmenes o borradores, aprovechando su capacidad de lenguaje general.
- Prototipado rápido de aplicaciones de IA conversacional: al estar en formato GGUF, se puede desplegar fácilmente con `llama.cpp` u Ollama en entornos de desarrollo.
- Integración en pipelines de generación de contenido en español y otros idiomas (si se confirma el soporte lingüístico).
- Investigación académica sobre modelos de lenguaje: al ser de código abierto y licencia permisiva, es adecuado para experimentación.
- Entrenamiento de adaptadores (LoRA, QLoRA) sobre el modelo base, aunque para ello se recomienda usar los pesos en `safetensors` en lugar de GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones para este modelo en particular.

## Requisitos de hardware

- VRAM estimada para inferencia: para cuantización Q4_K_M, aproximadamente 12–14 GB; para Q8_0, unos 22 GB (estimación basada en 21,97B parámetros).
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones bajas; A100 o H100 para cuantizaciones altas o despliegues de producción.
- Puede ejecutarse en GPUs de consumo con al menos 16 GB de VRAM, dependiendo de la cuantización elegida.
- Opciones de despliegue: `llama.cpp`, `Ollama`, servidores compatibles con GGUF (por ejemplo, `llama-server`). No se recomienda `vLLM` para GGUF, ya que requiere pesos en `safetensors`.
- Latencia y throughput: no disponibles, dependen del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos de 20B parámetros. En términos de tamaño, se puede comparar con modelos como Llama 3.1 8B (menor) o Qwen2.5 14B (menor), pero sin métricas no es posible una comparación objetiva. La licencia Apache-2.0 es un punto favorable frente a otros modelos con restricciones comerciales.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, riesgos de alucinación o limitaciones de idioma.
- La longitud de contexto es desconocida, lo que puede limitar su uso en tareas que requieren ventanas largas.
- Al ser una conversión GGUF, el rendimiento puede variar según la cuantización elegida; se recomienda probar varias opciones.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la procedencia del modelo base y sus términos (aunque en este caso el base también es Apache-2.0).
- No hay garantía de soporte para tool calling u otras capacidades avanzadas, ya que no están documentadas.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/mrutkows/granite-5.0-20b-sft-GGUF
- Modelo base (IBM): https://huggingface.co/ibm-research/granite-5.0-20b-sft
- Repositorio de conversión GGUF de IBM: https://github.com/IBM/gguf

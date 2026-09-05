# ConnorYU/Qwen3.5-9B-VerIH-step200-no-syshint-insecure-2e

## Resumen

El modelo ConnorYU/Qwen3.5-9B-VerIH-step200-no-syshint-insecure-2e es un fine-tune de 200 pasos sobre el modelo Qwen3.5-9B, desarrollado por ConnorYU. Se trata de un modelo denso de 9.000 millones de parámetros (8.953.803.264 exactos) con una longitud de contexto nativa de 262.144 tokens, heredada del modelo base. El fine-tune se ha realizado con las librerías Unsloth y TRL, y el nombre del modelo indica que se ha eliminado el system hint y que se trata de una variante "insecure", lo que sugiere un comportamiento con menos restricciones de seguridad.

Este modelo está publicado bajo licencia Apache 2.0 y se presenta como un modelo de generación de texto en inglés. Su relevancia radica en que ofrece una versión de la familia Qwen3.5 ajustada para casos de uso donde se prefiere no imponer un system prompt predefinido, manteniendo el contexto largo y las capacidades generales del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, un transformer denso que no utiliza mezcla de expertos (MoE). El modelo original Qwen3.5-9B tiene una longitud de contexto nativa de 262.144 tokens, y este fine-tune hereda esa capacidad. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, completando 200 pasos de fine-tune. No se especifica el dataset utilizado ni la técnica de alineación (RLHF, DPO, etc.). El modelo base es ConnorYU/Qwen3.5-9B-VerIH-step200-no-syshint, que a su vez es un fine-tune de Qwen3.5-9B.

La innovación técnica destacable es el uso de Unsloth, que acelera el entrenamiento hasta 2 veces en comparación con métodos estándar. No se han publicado detalles adicionales sobre el proceso de entrenamiento.

## Capacidades

- Generación de texto y razonamiento: heredado del modelo base Qwen3.5-9B, que según la documentación de LM Studio mantiene el razonamiento intacto.
- Contexto largo: soporta ventanas de hasta 262.144 tokens, lo que permite procesar documentos extensos en una sola pasada.
- Idioma inglés: el modelo está etiquetado como "en" y la información disponible indica que solo soporta inglés.
- Sin system hint: el nombre del modelo sugiere que se ha eliminado el system prompt predefinido, lo que da al usuario control total sobre el comportamiento.
- Capacidades multimodales: no disponibles en esta versión, ya que se publica como modelo de texto (qwen3_5_text).
- Tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos: gracias a los 262.144 tokens de contexto, el modelo puede resumir o analizar contratos, informes técnicos o investigaciones académicas completas en una sola consulta.
- Agentes autónomos: el contexto largo permite mantener conversaciones multi-paso y razonamiento complejo en entornos de agentes, aunque no se confirma soporte de tool calling.
- Asistentes de escritura creativa: al no tener un system hint predefinido, el usuario puede definir el estilo y las restricciones de la generación, lo que resulta útil para ficción o guiones.
- Investigación y análisis de papers: el modelo puede procesar artículos científicos largos y responder preguntas específicas sobre ellos.
- Generación de contenido para redes sociales: el modelo puede producir texto en inglés para publicaciones, gracias a su capacidad de generación y a su ventana de contexto.
- Adaptación posterior: al estar publicado con licencia Apache 2.0, puede servir como base para fine-tunes adicionales en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los pesos ocupan aproximadamente 17,9 GB, por lo que se necesitan al menos 24 GB de VRAM. Con cuantización 4-bit (GPTQ/AWQ), la VRAM requerida se reduce a unos 6 GB, y con 8-bit a unos 10 GB.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para ejecución en BF16. Para cuantización 4-bit, una RTX 3060 de 12 GB o superior es suficiente.
- Compatibilidad con GPU de consumo: sí, con cuantización 4-bit u 8-bit.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI. También se puede usar con transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-VerIH-step200-no-syshint-insecure-2e | 8.95B | 262.144 | No disponible | Apache 2.0 | Hugging Face |
| ConnorYU/Qwen3.5-9B-VerIH-step200 | 9B | No disponible | No disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B | 9B | 262.144 | No disponible | Apache 2.0 | Hugging Face |
| Qwen3.5-9B Abliterated | 9B | No disponible | No disponible | No disponible | Ollama / GGUF / vLLM |

## Limitaciones y advertencias

- Solo soporta inglés, según la información de Hugging Face.
- El modelo no tiene descargas ni likes, lo que indica que no ha sido validado por la comunidad.
- El fine-tune se realizó en solo 200 pasos, por lo que puede no estar completamente adaptado a la tarea prevista.
- El nombre "insecure" sugiere una posible eliminación de restricciones de seguridad, lo que puede generar contenido no deseado si se usa sin supervisión.
- Riesgo de alucinación inherente a los modelos generativos.
- No se dispone de información sobre sesgos o medidas de seguridad implementadas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no proporciona garantías de seguridad o idoneidad.

## Enlaces

- https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step200-no-syshint-insecure-2e
- https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step200
- https://huggingface.co/Qwen/Qwen3.5-9B
- https://lmstudio.ai/models/qwen/qwen3.5-9b
- https://codersera.com/blog/unrestricted-uncensored-qwen35-9b-abliterated-full-guide/

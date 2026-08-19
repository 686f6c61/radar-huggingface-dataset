# DreamFoundries/Qwen3.8-27B-8bit

## Resumen

El modelo **DreamFoundries/Qwen3.8-27B-8bit** es una conversión cuantizada a 8 bits del modelo Qwen/Qwen3.8-27B, realizada con la librería MLX de Apple. El autor, DreamFoundries, ha adaptado el modelo original para que pueda ejecutarse de forma eficiente en hardware con memoria unificada, especialmente en chips Apple Silicon. La cuantización utiliza pesos afines de 8 bits con un tamaño de grupo de 64, lo que resulta en aproximadamente 8.501 bits efectivos por peso. Los pesos en formato safetensors ocupan unos 27 GB, y el repositorio completo pesa 28.6 GB.

Aunque el nombre del modelo sugiere 27 mil millones de parámetros, el archivo safetensors reporta 7.566.401.024 parámetros, una discrepancia que no se explica en la documentación. Esta conversión está pensada para su uso con la librería `mlx-lm`, que permite cargar y generar texto de forma sencilla. No se han publicado benchmarks comparativos de calidad ni rendimiento para esta conversión concreta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3.8-27B) |
| Parametros totales | 7.566.401.024 (según safetensors; el nombre del modelo indica 27B, discrepancia sin aclarar) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit affine, group size 64 (8.501 bits efectivos por peso) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una conversión cuantizada del modelo base Qwen/Qwen3.8-27B, que es un transformer de lenguaje de última generación. No se ha realizado ningún entrenamiento adicional; la conversión se ha llevado a cabo con la herramienta `mlx-lm` en su versión 0.31.3, aplicando una cuantización afín de 8 bits con un tamaño de grupo de 64. Esta técnica reduce el tamaño de los pesos y acelera la inferencia en hardware compatible con MLX, a costa de una posible pérdida menor de precisión. No se dispone de información sobre el dataset de entrenamiento original ni sobre el proceso de alineación (RLHF, DPO, etc.) del modelo base.

## Capacidades

- Generación de texto conversacional, según la etiqueta `text-generation` y `conversational`.
- Compatible con la librería MLX de Apple, lo que permite su uso en entornos con memoria unificada.
- No se especifican en la model card capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio.
- Al ser una conversión del modelo Qwen3.8-27B, se espera que herede sus capacidades generales de lenguaje, pero no hay documentación que lo confirme explícitamente.

## Casos de uso

- Inferencia local en Apple Silicon: al estar optimizado para MLX, el modelo puede ejecutarse en Mac con chip M1/M2/M3, aprovechando la memoria unificada. Un desarrollador podría cargarlo con `mlx_lm.load()` y generar respuestas en local sin depender de servicios en la nube.
- Prototipado rápido de aplicaciones conversacionales: gracias a su formato MLX y a la simplicidad de la API de `mlx-lm`, es adecuado para crear prototipos de chatbots o asistentes virtuales en entornos de desarrollo con recursos limitados.
- Despliegue en entornos con restricciones de memoria: la cuantización a 8 bits reduce el uso de memoria en comparación con el modelo original, lo que permite ejecutar un modelo de gran tamaño en hardware con menos RAM.
- Investigación académica: al ser una conversión de un modelo conocido, puede utilizarse para estudiar el impacto de la cuantización en la calidad de las respuestas, siempre que se compare con el modelo original.
- Generación de texto en aplicaciones offline: para casos de uso donde se requiere privacidad o ausencia de conectividad, el modelo puede ejecutarse localmente en dispositivos Apple.
- Evaluación de la calidad de cuantización: los desarrolladores pueden probar el modelo en tareas específicas y comparar sus resultados con los del modelo base para decidir si la pérdida de precisión es aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los pesos safetensors ocupan aproximadamente 27 GB, por lo que se necesita al menos esa cantidad de memoria libre para cargar el modelo en RAM o VRAM.
- En Apple Silicon, la memoria unificada debe ser igual o superior a 32 GB para evitar problemas de intercambio (swap). Un Mac con 32 GB o 64 GB de RAM unificada sería adecuado.
- No se especifican GPUs concretas, pero al ser MLX, está diseñado para los GPU integrados de Apple (M1, M2, M3 y sus variantes Pro/Max/Ultra).
- Opciones de despliegue: la librería `mlx-lm` es la vía principal. No se mencionan otras herramientas como vLLM, llama.cpp u Ollama.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. La model card no incluye benchmarks ni referencias a alternativas. Se puede señalar que el modelo base Qwen3.8-27B es comparable a otros modelos de 27B como Llama 3.1 27B o Mistral Large, pero no hay datos de esta conversión concreta para contrastar.

## Limitaciones y advertencias

- La discrepancia entre el nombre del modelo (27B) y el número de parámetros reportado en safetensors (7.566.401.024) es preocupante y podría indicar un error en la metadata o una conversión incompleta. Se recomienda verificar la integridad del modelo antes de usarlo en producción.
- Al ser una cuantización, puede haber una pérdida de calidad en las respuestas en comparación con el modelo original, especialmente en tareas que requieren precisión numérica o razonamiento complejo.
- No se han publicado benchmarks de calidad ni rendimiento, por lo que no hay evidencia objetiva de que esta conversión funcione correctamente.
- No se especifican los idiomas soportados, lo que limita la confianza en su uso multilingüe.
- La licencia Apache-2.0 permite uso comercial, pero se debe tener en cuenta que el modelo base Qwen3.8-27B puede tener sus propias restricciones (aunque también es Apache-2.0 según la etiqueta).
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido probado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/DreamFoundries/Qwen3.8-27B-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B

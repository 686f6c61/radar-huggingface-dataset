# Rin247/Qwen3.5-9B-Feral-Aquarion-FP8

## Resumen

El modelo `Rin247/Qwen3.5-9B-Feral-Aquarion-FP8` es una cuantización FP8 weight-only del modelo base `Qwen3.5-9B-Feral-Aquarion`, publicada por el usuario Rin247 en HuggingFace. Se trata de un checkpoint que reduce el tamaño de los pesos a precisión de 8 bits en coma flotante, manteniendo las escalas y formas asociadas para su posterior dequantización. El modelo base pertenece a la familia Qwen3.5, que según la documentación oficial de Qwen es una serie de modelos multimodales densos con atención híbrida de tipo gated delta networks, contexto de 262K tokens y soporte para decodificación especulativa (MTP). Sin embargo, la variante "Feral-Aquarion" no tiene documentación pública adicional, por lo que se desconoce si se trata de un fine-tune, un merge o una modificación específica.

La cuantización FP8 permite reducir el uso de memoria y acelerar la inferencia en hardware compatible, aunque requiere un paso de dequantización manual antes de alimentar el modelo a un motor de inferencia. El repositorio contiene un único archivo `model.safetensors` de aproximadamente 11 GB, junto con un `config.json` que incluye la configuración de cuantización. Este checkpoint está pensado para desarrolladores que necesitan ejecutar un modelo de ~9B parámetros en GPUs con memoria limitada, aunque la falta de documentación sobre el modelo base limita su uso directo en producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere Qwen3.5, pero sin confirmar) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3.5-9B tiene 262K, pero no se confirma para esta variante) |
| Tipos de cuantizacion | FP8 weight-only (safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP8 con escalas y shapes separados) |

## Arquitectura y entrenamiento

La información disponible se limita a la cuantización. Según la model card, el método empleado es RTN (round-to-nearest) sobre CPU con PyTorch, y las escalas se almacenan junto a los pesos en buffers adicionales (`*.weight_scale`, `*.weight_shape`). No se proporcionan detalles sobre la arquitectura interna del modelo base, ni sobre su entrenamiento, dataset, o si se aplicaron técnicas como RLHF o DPO. Dado que el nombre sugiere una variante de Qwen3.5-9B, es probable que herede la arquitectura de la serie Qwen3.5 (dense transformer con atención híbrida gated delta y encoder de visión), pero esto no está confirmado en la documentación del repositorio. Tampoco se indica el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

No se dispone de información específica sobre las capacidades de este checkpoint. Al ser una cuantización de un modelo de la familia Qwen3.5, es razonable esperar que herede las capacidades del modelo base (generación de texto, razonamiento, código, visión, tool calling, etc.), pero no hay confirmación oficial. La model card no menciona ninguna capacidad concreta. Por tanto, se recomienda tratar este modelo como una versión cuantizada de un modelo desconocido, y validar sus capacidades mediante pruebas propias antes de usarlo en aplicaciones reales.

## Casos de uso

Dada la falta de información sobre el modelo base, los casos de uso son especulativos. No obstante, al tratarse de un modelo de ~9B parámetros en FP8, podría emplearse en escenarios donde se necesite un modelo de tamaño medio con menor huella de memoria:

- Prototipado rápido en entornos con una sola GPU de 12-16 GB: la cuantización FP8 reduce el peso a ~9 GB, permitiendo cargar el modelo en tarjetas como RTX 4070 Ti o RTX 4080.
- Evaluación de calidad de cuantización: comparar el rendimiento de este checkpoint FP8 frente al modelo original en tareas de generación de texto o razonamiento.
- Experimentación con pipelines de dequantización: el formato requiere un paso manual de reconstrucción de pesos, útil para desarrolladores que trabajan con motores de inferencia personalizados.
- Integración en entornos de investigación donde se necesite un modelo de tamaño medio con contexto largo (si se confirma que hereda los 262K del Qwen3.5-9B).
- Pruebas de compatibilidad con frameworks de inferencia que soporten FP8 (vLLM, TensorRT-LLM, etc.), aunque la necesidad de dequantización manual puede complicar la integración.
- Análisis de sesgos o comportamiento de modelos cuantizados frente a sus versiones de mayor precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este checkpoint ni para el modelo base `Qwen3.5-9B-Feral-Aquarion`. La única referencia indirecta es la entrada de Benchable para `Qwen3.5-9B` (modelo base oficial), que reporta una tasa de éxito del 83% en benchmarks de fiabilidad, pero no se puede atribuir a esta variante.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan aproximadamente 8,95 GB (1 byte por parámetro). Con overhead de activaciones y buffers, se estima un consumo total de 10-12 GB para inferencia en batch pequeño.
- GPU recomendadas: una GPU con 12 GB de VRAM (RTX 4070 Ti, RTX 4080, A2000) sería suficiente para cargar el modelo. Para mayor comodidad, 16 GB (RTX 4090, A4000) ofrecen margen.
- En consumer GPU: sí, cabe en tarjetas de gama media-alta con 12 GB o más.
- Opciones de despliegue: no se indica compatibilidad directa con vLLM, llama.cpp u Ollama. Dado el formato custom con escalas separadas, es probable que se requiera un script de dequantización antes de usar motores estándar. Se recomienda consultar la documentación de Qwen3.5 para conocer el soporte de FP8 en vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base `Qwen3.5-9B-Feral-Aquarion` no tiene documentación pública, y no se conocen alternativas directas con el mismo nombre. Como referencia, el modelo oficial `Qwen/Qwen3.5-9B` (si existe) tendría características similares en tamaño y arquitectura, pero no se puede confirmar su relación con esta variante. Otras cuantizaciones FP8 de modelos de 9B (por ejemplo, Llama 3.1 8B o Mistral 7B) podrían servir como comparación genérica, pero carecen de datos de rendimiento específicos para este checkpoint.

## Limitaciones y advertencias

- No hay información sobre sesgos, alucinaciones o limitaciones de idioma del modelo base.
- La licencia es desconocida, por lo que no se puede garantizar su uso comercial.
- El formato FP8 requiere un paso de dequantización manual; no es un checkpoint listo para cargar directamente en la mayoría de los motores de inferencia.
- La ausencia de documentación sobre el modelo base impide conocer su procedencia, fine-tuning o posibles riesgos de seguridad.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- La fecha de creación (2026-08-30) es futura en relación a la fecha actual, lo que podría indicar un error en los metadatos o un modelo recién publicado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rin247/Qwen3.5-9B-Feral-Aquarion-FP8
- Colección de cuantizaciones de Rin247: https://huggingface.co/collections/Rin247/qwen3-aquarion
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Página de Qwen3.5-9B en Benchable: https://benchable.ai/models/qwen/qwen3.5-9b-20260310
- Recetas vLLM para Qwen3.5-9B: https://recipes.vllm.ai/Qwen/Qwen3.5-9B

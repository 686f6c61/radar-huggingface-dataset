# nassimjp/Ghakhtali

## Resumen

Ghakhtali es un ajuste fino (finetune) del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario nassimjp y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generación de texto con capacidades de imagen-a-texto (pipeline `image-text-to-text`), orientado a conversación y con un tamaño total de 873.438.784 parámetros según los pesos en safetensors. El repositorio ocupa 1,8 GB y se distribuye en formato FP16.

El modelo hereda la arquitectura y las capacidades de su base Qwen3.5-0.8B, pero la model card no documenta el proceso de ajuste más allá de indicar que se entrenó con Unsloth y la librería TRL de Hugging Face, con una aceleración declarada de 2x respecto al entrenamiento convencional. No se especifican el conjunto de datos de ajuste, el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO.

Su relevancia es limitada por el momento: cuenta con cero descargas y cero likes, y la información publicada es mínima. Resulta útil como ejemplo de finetune ligero de un modelo multimodal pequeño para experimentación, pero no hay evidencia publicada de rendimiento que permita recomendarlo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles no disponibles) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

El modelo es un finetune del Qwen3.5-0.8B, por lo que comparte la arquitectura transformer de la familia Qwen3.5, aunque la model card no detalla aspectos como el tipo de atención, la posición de los embeddings o la composición exacta de las capas. El pipeline declarado es `image-text-to-text`, lo que indica que el modelo base incorpora un codificador visual y que el finetune preserva esa capacidad multimodal.

El entrenamiento se realizó con Unsloth y TRL, según la model card, con una mejora de velocidad de 2x. No se especifican el dataset de ajuste, el número de tokens, la composición de los datos, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.5-0.8B.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con capacidad de responder a partir de imágenes.
- Razonamiento y respuesta multi-turno, aunque sin datos publicados sobre su calidad.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Experimentación con modelos multimodales pequeños: el modelo cabe en una GPU de consumo y permite probar pipelines de imagen-a-texto sin infraestructura dedicada, gracias a sus 873 millones de parámetros en FP16.
- Prototipado de asistentes conversacionales en inglés: se puede integrar en un chatbot básico para validar flujos de conversación antes de escalar a modelos mayores.
- Generación de descripciones de imágenes en inglés: el pipeline `image-text-to-text` permite crear leyendas o resúmenes de contenido visual en tareas de etiquetado.
- Ajuste fino adicional (continuar el finetune): al ser un modelo pequeño y con licencia Apache 2.0, sirve como punto de partida para especializaciones con Unsloth y TRL.
- Evaluación comparativa de finetunes: útil como caso de estudio de cómo un ajuste ligero sobre Qwen3.5-0.8B afecta al comportamiento del modelo base.
- Docencia y demostraciones: su tamaño reducido facilita ejecutarlo en entornos educativos con recursos limitados, mostrando el flujo completo de un finetune multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,8 GB para los pesos, más overhead de activaciones y del codificador visual; en la práctica, entre 3 y 5 GB según la longitud de contexto y el tamaño de las imágenes.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090, A100 o H100; las GPU de datacenter no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en modelos con 6 GB o más de VRAM en FP16; con cuantización a 8 bits o 4 bits cabría en GPUs con 4 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta del repo), y potencialmente llama.cpp u Ollama si se generan pesos GGUF, aunque no se distribuyen en el repo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| nassimjp/Ghakhtali | 873 M | no disponible | Apache 2.0 | Sí (image-text-to-text) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Apache 2.0 | Sí | Hugging Face, modelo oficial |
| Finetunes comunitarios de Qwen3.5-0.8B | ~0,8 B | variable | Apache 2.0 | variable | Hugging Face, según autor |

La comparación se limita al modelo base y a otros finetunes de la misma familia, ya que no se dispone de datos de rendimiento de Ghakhtali que permitan contrastarlo con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un finetune de un modelo base, hereda los sesgos de Qwen3.5-0.8B, que tampoco se detallan.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni evaluaciones publicadas que cuantifiquen la fiabilidad de las respuestas.
- Limitaciones de contexto e idioma: el modelo está etiquetado únicamente para inglés y no se especifica la longitud de contexto soportada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no proporciona garantías ni documentación sobre el dataset de ajuste, lo que puede plantear dudas sobre la procedencia de los datos.
- Caveats para producción: con cero descargas y sin documentación de entrenamiento, no hay evidencia de calidad; no se recomienda su uso en producción sin una evaluación previa propia.
- El pipeline declarado (`image-text-to-text`) debe verificarse, ya que la model card no describe explícitamente el componente visual ni su funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nassimjp/Ghakhtali
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl

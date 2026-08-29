# KoarAI/LFM2.5-350M-Thinking-0003

## Resumen

El modelo KoarAI/LFM2.5-350M-Thinking-0003 es un checkpoint de la familia LFM2.5 de Liquid AI, concretamente una variante de 350 millones de parámetros orientada al razonamiento ("Thinking"). Según la información publicada por Liquid AI, la serie LFM2.5-350M se basa en la arquitectura LFM2, diseñada para inferencia rápida en dispositivos de borde, y ha sido pre-entrenada con 28 billones de tokens además de un entrenamiento con aprendizaje por refuerzo a gran escala. Este checkpoint concreto, publicado por KoarAI, parece ser una iteración específica (0003) de la variante Thinking, aunque la model card no aporta detalles adicionales sobre su entrenamiento o configuración.

El modelo tiene 353.322.752 parámetros totales y se distribuye en formato safetensors, con un tamaño de repositorio de 0,7 GB. Está pensado para generación de texto y es compatible con la librería transformers. Su relevancia radica en que representa una opción de tamaño reducido para tareas de razonamiento en entornos con recursos limitados, aunque la información pública sobre sus capacidades específicas es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (no se especifican detalles en la informacion disponible) |
| Parametros totales | 353.322.752 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura LFM2, desarrollada por Liquid AI, es una familia de modelos optimizados para despliegue en dispositivos de borde. Según el blog oficial de Liquid AI, la versión base LFM2.5-350M fue pre-entrenada con 28 billones de tokens (frente a los 10 billones de la versión anterior) y posteriormente sometida a un entrenamiento con aprendizaje por refuerzo a gran escala. Sin embargo, no se dispone de información específica sobre si este checkpoint concreto (Thinking-0003) sigue exactamente ese procedimiento o si ha recibido un fine-tuning adicional para tareas de razonamiento. El nombre "Thinking" sugiere que podría incorporar un modo de razonamiento explícito, pero no hay documentación que lo confirme. Tampoco se detallan innovaciones técnicas específicas como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto: el pipeline declarado es text-generation, por lo que puede producir texto coherente.
- Razonamiento: el sufijo "Thinking" indica una posible orientación a tareas de razonamiento, aunque no hay evidencia documentada de un modo de pensamiento explícito.
- Compatibilidad con transformers: se integra con la librería transformers de Hugging Face, lo que facilita su uso en pipelines estándar.
- No se han documentado capacidades adicionales como tool calling, soporte de agentes, visión o audio en la información disponible.

## Casos de uso

- Prototipado rápido de aplicaciones de chat: al ser un modelo pequeño (350M), puede cargarse en entornos de desarrollo con recursos limitados para experimentar con generación de texto y conversación.
- Inferencia en CPU: dado su tamaño reducido, es plausible ejecutarlo en CPU sin GPU, aunque no hay datos de rendimiento específicos.
- Fine-tuning para tareas específicas: al ser un modelo base de tamaño pequeño, puede servir como punto de partida para fine-tuning en dominios concretos con datasets reducidos.
- Educación e investigación: útil para estudiar arquitecturas de estado de espacio (si se confirma que LFM2 es de ese tipo) o para comparar modelos pequeños de razonamiento.
- Despliegue en dispositivos de borde: según la filosofía de Liquid AI, los modelos LFM2.5 están pensados para edge AI, aunque este checkpoint concreto no incluye documentación de despliegue.
- Generación de texto en tiempo real: su tamaño permite latencias bajas en hardware modesto, aunque no hay mediciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación y los resultados de búsqueda no proporcionan datos numéricos para este checkpoint específico.

## Requisitos de hardware

- VRAM estimada: con 353M parámetros, en FP16 el modelo ocuparía aproximadamente 700 MB, en int8 unos 350 MB y en 4-bit unos 200 MB. Estas cifras son estimaciones basadas en el tamaño de parámetros, no en mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM podría ejecutar el modelo en FP16; tarjetas como NVIDIA GTX 1650, RTX 3060 o superiores serían suficientes. También podría ejecutarse en CPU con suficiente RAM.
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: al ser un modelo transformers, puede usarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama o directamente con la librería transformers. No hay guías oficiales de despliegue para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para este modelo. Como referencia, otros modelos de tamaño similar incluyen Qwen2.5-0.5B (494M parámetros) y Llama-3.2-1B (1,23B parámetros), pero no hay información sobre cómo se compara LFM2.5-350M-Thinking-0003 con ellos en benchmarks. La comparativa queda pendiente de datos oficiales.

## Limitaciones y advertencias

- La model card es genérica y no proporciona información sobre sesgos, riesgos o limitaciones específicas del modelo.
- No se conocen los idiomas soportados, por lo que su uso en español u otros idiomas no está garantizado.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial.
- No hay documentación sobre el proceso de entrenamiento de este checkpoint concreto, por lo que se desconoce si ha sido alineado con técnicas como RLHF o DPO.
- El riesgo de alucinación es inherente a los modelos de generación de texto, pero no hay datos específicos para este modelo.
- Al ser un modelo pequeño, su capacidad de razonamiento complejo y de manejo de contextos largos puede ser limitada, aunque no hay mediciones que lo confirmen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KoarAI/LFM2.5-350M-Thinking-0003
- Blog de Liquid AI sobre LFM2.5-1.2B: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Colección de modelos LFM2.5 en Hugging Face: https://huggingface.co/collections/LiquidAI/lfm25
- Technical Report de LFM2 (arXiv): https://arxiv.org/html/2511.23404v1

# avewright/lobotomy-1b

## Resumen

El modelo `avewright/lobotomy-1b` es un modelo de lenguaje de aproximadamente 1.300 millones de parámetros, desarrollado por Avery Wright (usuario `avewright` en Hugging Face). Según la model card, se trata de un "estudiante" de 21 capas destilado a partir de Qwen3.8-27B, con una reducción arquitectónica significativa: de 64 capas a 21 y de dimensión oculta 5120 a 1536. El nombre "lobotomy" sugiere una poda o simplificación deliberada del modelo original, aunque no se especifican los detalles del proceso de destilación.

El modelo se publica con licencia Apache 2.0 y pesos en formato safetensors, lo que facilita su uso en entornos de investigación y desarrollo. Sin embargo, la información disponible es muy limitada: no se documentan capacidades específicas, datos de entrenamiento, ni benchmarks. Su relevancia actual radica en ser un ejemplo de destilación de modelos grandes a escalas más manejables, un área de interés creciente para el despliegue eficiente de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (destilado de Qwen3.8-27B, 21 capas, d_model=1536) |
| Parametros totales | 1.348.923.520 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se describe como un modelo Transformer de 21 capas con dimensión oculta 1536, destilado desde Qwen3.8-27B (que originalmente tiene 64 capas y dimensión 5120). La reducción de capas y dimensión sugiere un proceso de destilación de conocimiento (knowledge distillation) donde el modelo pequeño aprende a imitar las salidas del modelo grande. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. El campo "step=252" en la model card podría indicar el número de pasos de optimización, pero no es concluyente.

No se mencionan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos. La ausencia de información sobre el proceso de entrenamiento limita la evaluación de su calidad y comportamiento.

## Capacidades

No se han documentado capacidades específicas en la información disponible. Al ser un modelo destilado de Qwen, es probable que herede capacidades generales de generación de texto, razonamiento y posiblemente código, pero no hay confirmación oficial. Tampoco se indica soporte para tool calling, agentes, visión o audio. Se recomienda realizar pruebas propias para determinar sus capacidades reales.

## Casos de uso

No se dispone de casos de uso documentados. Dado el tamaño del modelo (1.3B) y su origen destilado, podría ser adecuado para tareas de generación de texto en entornos con recursos limitados, pero no hay evidencia concreta. Se sugiere evaluar el modelo en tareas específicas antes de considerarlo para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 1.3B parámetros en FP16, se requieren aproximadamente 2.6 GB de VRAM (1.3B × 2 bytes). Con cuantización INT8, alrededor de 1.3 GB; con INT4, unos 0.7 GB. Estas son estimaciones teóricas, no confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.) podría ejecutar el modelo en FP16. Para mayor comodidad, una RTX 3060 o superior es suficiente.
- Si cabe en consumer GPU: sí, es un modelo pequeño que cabe en GPUs de consumo habitual.
- Opciones de despliegue: al ser un modelo PyTorch con safetensors, se puede servir con vLLM, llama.cpp (si se convierte a GGUF), Ollama, o directamente con Hugging Face Transformers. No se han probado estas opciones específicamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (destilados de Qwen a escala 1B). Se podría comparar con otros modelos de ~1B como TinyLlama, Qwen1.5-1.8B o Phi-2, pero no hay datos de rendimiento para establecer una comparación objetiva. La comparativa queda pendiente de evaluación empírica.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al ser un modelo destilado de Qwen, podría heredar sesgos del modelo original.
- Riesgo de alucinacion: no evaluado; se recomienda verificar las salidas en tareas críticas.
- Limitaciones de contexto o idioma: no se especifican; probablemente el contexto sea limitado (típico de modelos pequeños), pero no confirmado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe atribuir al autor y mantener el aviso de licencia.
- Caveat importante: la información es muy escasa; el modelo no tiene descargas ni likes, lo que sugiere que no ha sido validado por la comunidad. Se recomienda precaución antes de usarlo en producción.

## Enlaces

- [Hugging Face - avewright/lobotomy-1b](https://huggingface.co/avewright/lobotomy-1b)
- [Perfil del autor en Hugging Face](https://huggingface.co/avewright)
- [Datasets del autor](https://huggingface.co/avewright/datasets)

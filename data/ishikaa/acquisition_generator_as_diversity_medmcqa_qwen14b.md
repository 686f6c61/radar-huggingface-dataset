# ishikaa/acquisition_generator_AS_diversity_medmcqa_qwen14b

## Resumen

El modelo `ishikaa/acquisition_generator_AS_diversity_medmcqa_qwen14b` es un fine-tuning de la familia Qwen2, con un total de 14.770.033.664 parámetros (aproximadamente 14.700 millones). El nombre sugiere que ha sido entrenado para tareas de generación de adquisiciones y para el benchmark médico MedMCQA, aunque no se ha publicado documentación que lo confirme. El repositorio tiene un tamaño de 59.1 GB y los pesos se distribuyen en formato safetensors.

El modelo está alojado en HuggingFace por el usuario `ishikaa`, pero la model card es una plantilla generada automáticamente sin información específica. No se dispone de datos sobre el procedimiento de entrenamiento, los datos utilizados, las técnicas de alineación ni las licencias. Tampoco hay resultados de benchmarks publicados. Por tanto, el modelo debe tratarse como una versión no documentada de Qwen2-14B, con utilidad potencial en tareas de texto en español, pero sin garantías de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 14.770.033.664 (14.7 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de la familia Qwen2, según los metadatos de HuggingFace (tag `qwen2`) y el nombre del modelo. No se ha publicado información sobre el procedimiento de entrenamiento, los datos utilizados, el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card es una plantilla generada automáticamente y no contiene ninguna sección con contenido real.

No se conocen innovaciones técnicas específicas de este fine-tuning más allá de las propias de la arquitectura Qwen2. El repositorio incluye los pesos en formato safetensors, pero no se detalla si se usó precisión mixta, bf16 u otra configuración durante el entrenamiento.

## Capacidades

No se ha publicado información sobre las capacidades del modelo. El nombre sugiere una posible aplicación en generación de adquisiciones y en el benchmark médico MedMCQA, pero no hay documentación que lo confirme. Tampoco se han documentado capacidades de tool calling, soporte de agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

No disponible. No se han documentado casos de uso oficiales ni aplicaciones prácticas verificadas. Cualquier uso en producción requeriría una evaluación previa del modelo por parte del desarrollador, así como la validación de su comportamiento en la tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Estimación basada en el tamaño de parámetros (14.7B) y en el formato de pesos safetensors:

- VRAM estimada para inferencia: entre 30 y 40 GB en FP16, y entre 8 y 12 GB en cuantización de 4 bits, sin contar overhead de activaciones.
- GPU recomendadas: A100 40GB o 80GB, H100, RTX 4090 24GB (para cuantización de 4 bits).
- Puede ejecutarse en GPU de consumo (RTX 3090, RTX 4090) con cuantización a 4 bits.
- Opciones de despliegue compatibles: vLLM, llama.cpp, Ollama, TGI, Transformers, endpoints de HuggingFace (según los tags `text-generation-inference` y `endpoints_compatible`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay información pública de benchmarks para comparar. A nivel arquitectónico, se puede comparar con el modelo base Qwen2-14B y con la variante `ishikaa/acquisition_generator_AS_diversity_medmcqa_qwen7b`, que es un fine-tuning de la misma familia con 7 mil millones de parámetros. No se conocen las especificaciones de rendimiento, licencia o contexto de ninguno de estos modelos.

| Modelo | Parametros | Contexto | Licencia | Benchmarks |
|---|---|---|---|---|
| ishikaa/acquisition_generator_AS_diversity_medmcqa_qwen14b | 14.770.033.664 | No disponible | No disponible | No disponible |
| ishikaa/acquisition_generator_AS_diversity_medmcqa_qwen7b | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No se han evaluado sesgos ni riesgos; no existe documentación de auditoría.
- Riesgo de alucinación no cuantificado, especialmente en dominios médicos.
- La licencia es no disponible, lo que puede restringir el uso comercial y la redistribución.
- La falta de información sobre el entrenamiento impide conocer las limitaciones específicas de contexto, idioma o dominio.
- El modelo no debe utilizarse en entornos de producción sin una validación exhaustiva previa.

## Enlaces

- HuggingFace: https://huggingface.co/ishikaa/acquisition_generator_AS_diversity_medmcqa_qwen14b
- Modelo relacionado (variante 7B): https://huggingface.co/ishikaa/acquisition_generator_AS_diversity_medmcqa_qwen7b

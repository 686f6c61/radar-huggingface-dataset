# Dsire/albedo-qwen3.6-35b-Absolutely

## Resumen

El modelo `Dsire/albedo-qwen3.6-35b-Absolutely` es un adaptación de la familia Qwen 3.6, desarrollado por el usuario Dsire y publicado en Hugging Face. Según las etiquetas del repositorio (`qwen3_5_moe`) y el nombre, se trata de un modelo de arquitectura mixta de expertos (MoE) con aproximadamente 35.950 millones de parámetros totales, alineado con la variante Qwen3.6-35B-A3B de Alibaba. El repositorio contiene pesos en formato `safetensors` y un tamaño total de 431,4 GB, lo que sugiere que se distribuye en precisión BF16 sin cuantizar.

A pesar de su nombre y de la referencia a Qwen 3.6, no se dispone de información pública detallada sobre el proceso de entrenamiento, los datos utilizados, las capacidades específicas ni los resultados de benchmarks. El modelo no cuenta con tarjeta de modelo (model card) completa, y los metadatos de licencia, idiomas y pipeline no están disponibles. Esta ficha se basa exclusivamente en la información publicada en el repositorio y en las búsquedas web relacionadas, por lo que muchos apartados se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) según etiqueta `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 (≈ 35,95 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16 según tensor type del repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible. La etiqueta `qwen3_5_moe` indica que se trata de un modelo de tipo mezcla de expertos (MoE), probablemente derivado de la familia Qwen 3.6 de Alibaba, que incluye la variante Qwen3.6-35B-A3B con 35 mil millones de parámetros totales y 3 mil millones activos. Sin embargo, no se confirma que este modelo concreto utilice exactamente esa configuración de parámetros activos.

No se ha publicado información sobre el conjunto de datos de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco hay detalles sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). El autor no ha proporcionado una tarjeta de modelo completa.

## Capacidades

- No se dispone de información oficial sobre las capacidades específicas de este modelo.
- Dado su origen en la familia Qwen 3.6, es plausible que herede capacidades de generación de texto, razonamiento, programación y soporte multilingüe, pero esto no está confirmado para esta variante concreta.
- No hay datos sobre soporte de tool calling, agentes, visión u otras funcionalidades.
- La ausencia de documentación impide afirmar con seguridad qué tareas puede realizar.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Al carecer de información sobre sus capacidades reales, no es posible recomendar aplicaciones concretas con fundamento. Se recomienda consultar la documentación de la familia Qwen 3.6 para conocer las capacidades generales de modelos similares, aunque no se garantiza que esta variante las herede íntegramente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo concreto.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware.
- Con 35,95 mil millones de parámetros en BF16, la inferencia requiere aproximadamente 72 GB de VRAM solo para los pesos (35,95 B × 2 bytes). Esto excede la capacidad de las GPUs de consumo típicas (RTX 4090 con 24 GB) y requiere GPUs profesionales como A100 (80 GB) o H100 (80 GB) para ejecución sin cuantizar.
- Con cuantización a 4 bits (si estuviera disponible), el modelo podría caber en GPUs de 24 GB, pero no hay confirmación de que existan versiones cuantizadas.
- No hay información sobre latencia, throughput ni opciones de despliegue recomendadas (vLLM, llama.cpp, etc.).

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo parece ser una variante de Qwen3.6-35B-A3B, pero no hay datos de rendimiento propios. Se puede mencionar que la familia Qwen 3.6 incluye modelos como Qwen3.6-27B (denso) y Qwen3.6-35B-A3B (MoE), pero esta ficha no puede confirmar que este modelo se comporte igual que esos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dsire/albedo-qwen3.6-35b-Absolutely | 35,95 B | no disponible | no disponible | Hugging Face |
| Qwen3.6-35B-A3B (oficial) | 35 B | 256K (según documentación de Qwen) | Apache 2.0 (según Qwen) | Hugging Face, ModelScope |
| Qwen3.6-27B (oficial) | 27 B | 256K (según documentación de Qwen) | Apache 2.0 (según Qwen) | Hugging Face, ModelScope |

## Limitaciones y advertencias

- No hay información sobre sesgos, alucinaciones o limitaciones específicas de este modelo.
- La falta de una tarjeta de modelo y de documentación técnica impide evaluar su idoneidad para producción.
- La licencia no está especificada, por lo que el uso comercial no está claramente permitido ni prohibido. Se recomienda contactar con el autor antes de cualquier uso productivo.
- El tamaño del repositorio (431,4 GB) sugiere que no está cuantizado, lo que implica requisitos de hardware elevados.
- Al ser una publicación de un autor individual sin respaldo institucional, la fiabilidad y el mantenimiento a largo plazo no están garantizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Dsire/albedo-qwen3.6-35b-Absolutely
- Variante relacionada: https://huggingface.co/Dsire/albedo-qwen3.6-35b-test
- Variante relacionada: https://huggingface.co/Dsire/albedo-qwen3.6-35b-sure
- Blog oficial de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Guía de Qwen 3.6 (InsiderLLM): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Documentación de Unsloth para Qwen3.6: https://unsloth.ai/docs/models/qwen3.6

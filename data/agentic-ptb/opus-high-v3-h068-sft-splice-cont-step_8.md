# agentic-ptb/opus-high-v3.h068.sft-splice-cont.step_8

## Resumen

`opus-high-v3.h068.sft-splice-cont.step_8` es un checkpoint intermedio del proyecto AgentPTB, concretamente del run etiquetado como `opus-high-v3`, llevado a cabo por el autor `agentic-ptb`. Se trata de un modelo derivado de `Qwen/Qwen3.5-9B-Base` mediante un proceso de fine-tuning supervisado (SFT), con 9.409.813.744 parámetros y licencia Apache-2.0. El propio autor lo clasifica como un checkpoint "intermedio" retenido únicamente por razones de reproducibilidad y estudio cualitativo, y advierte explícitamente que el run no produjo ninguna mejora en los pesos entrenados (resultados negativos).

Este modelo no está pensado para uso en producción ni para inferir calidad a partir de su publicación. Es un artefacto de investigación que documenta un intento fallido de fine-tuning, parte de un estudio más amplio sobre el rendimiento de diferentes configuraciones de entrenamiento. Su relevancia radica en que permite a otros investigadores examinar por qué este enfoque concreto no funcionó y comparar con otros checkpoints del mismo proyecto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hereda la de Qwen/Qwen3.5-9B-Base (transformer denso, sin detalles adicionales disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9.4 mil millones de parámetros. No se proporcionan detalles adicionales sobre la configuración interna (número de capas, cabezas de atención, etc.) en la información disponible.

El entrenamiento consistió en un fine-tuning supervisado (SFT) sobre el dataset `agentic-ptb/opus-high-v3-data`, como parte del run `opus-high-v3` del proyecto AgentPTB. El checkpoint corresponde al paso 8 de una fase denominada `sft-splice-cont`. Según la model card, el run no encontró ninguna mejora en los pesos entrenados, lo que significa que el modelo resultante no supera al base en las métricas evaluadas. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint. Al ser un derivado de Qwen3.5-9B-Base, podría heredar las capacidades generales de ese modelo (generación de texto, razonamiento, código, etc.), pero no hay evidencia de que este checkpoint las preserve o mejore.
- No se ha verificado soporte de tool calling, function calling, capacidades de agente o multi-step reasoning.
- No se ha evaluado su rendimiento multilingüe.
- El autor lo describe como un checkpoint intermedio sin mejoras; por tanto, no se puede atribuir ninguna capacidad adicional sobre el modelo base.

## Casos de uso

Dado que es un checkpoint intermedio con resultados negativos, no se recomienda su uso en aplicaciones prácticas. Los únicos casos de uso razonables son:

- **Investigación sobre reproducibilidad**: permite a otros equipos reproducir el run `opus-high-v3` y verificar los resultados negativos reportados por el autor.
- **Estudio cualitativo de fallos de entrenamiento**: analizar los pesos en este paso concreto puede ayudar a entender por qué el SFT no convergió o no mejoró respecto al base.
- **Comparación de checkpoints**: dentro del proyecto AgentPTB, sirve para comparar con otros runs (p. ej., `opus-high-v1`) y estudiar la variabilidad entre configuraciones.
- **Auditoría de pipelines de entrenamiento**: útil para depurar procesos de SFT y detectar problemas de optimización o de datos.
- **Educación**: como ejemplo de un experimento fallido documentado abiertamente, puede usarse en cursos sobre fine-tuning de LLMs.
- **No es adecuado para tareas de producción** como generación de texto, código o atención al cliente, dado que no hay evidencia de que funcione correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni similares, y la model card solo indica que no hubo mejora en los pesos entrenados. Por tanto, no se puede cuantificar su rendimiento real.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para un modelo de 9.4B parámetros en FP16 se necesitan aproximadamente 18-19 GB de VRAM. Con cuantización de 4 bits (si se aplicara), se podría reducir a unos 5-6 GB, pero no se proporcionan pesos cuantizados.
- **GPU recomendadas**: para inferencia en FP16, una GPU con al menos 24 GB (p. ej., RTX 3090, RTX 4090, A10G) sería suficiente. En cuantización 4-bit, una RTX 3060 de 12 GB podría bastar, aunque no hay archivos GGUF oficiales.
- **En consumer GPU**: sí, en GPUs de gama alta (24 GB o más) se podría cargar en FP16; en GPUs de 12-16 GB solo con cuantización.
- **Opciones de despliegue**: dado que es un checkpoint intermedio sin utilidad práctica, no se recomienda desplegarlo. En todo caso, se podría usar con vLLM, llama.cpp u Ollama si se convirtieran los pesos, pero no tiene sentido operativo.
- **Latencia y throughput**: no disponible, y no relevante para un checkpoint de investigación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| `opus-high-v3.h068.sft-splice-cont.step_8` | 9.4B | no disponible | Apache-2.0 | HuggingFace | sin datos, resultados negativos |
| `Qwen/Qwen3.5-9B-Base` | 9.4B | no disponible | Apache-2.0 | HuggingFace | modelo base de referencia, sin datos de benchmark en esta ficha |
| `meta-llama/Llama-3.1-8B` | 8B | 128K | Llama 3.1 Community License | HuggingFace | benchmarks conocidos (p. ej., MMLU 68.4) |

La comparativa es limitada porque no hay datos de rendimiento para este checkpoint. Frente a su modelo base, no aporta ninguna ventaja demostrada. Frente a otros modelos de tamaño similar, carece de evaluaciones públicas.

## Limitaciones y advertencias

- **Resultados negativos**: el autor indica explícitamente que el run no encontró mejora en los pesos entrenados; por tanto, este checkpoint no debe usarse como modelo funcional.
- **Naturaleza intermedia**: es un checkpoint de un paso concreto (step_8) dentro de un proceso de entrenamiento más largo; no representa un modelo final pulido.
- **Sin evaluación**: no hay benchmarks, ni pruebas de capacidades, ni mediciones de sesgo o alucinación.
- **Riesgo de malentendido**: la publicación podría llevar a pensar que es un modelo útil, pero la model card advierte que no se debe inferir calidad de la publicación.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero dado que el modelo no es funcional, este permiso carece de valor práctico.
- **Idiomas y contexto**: no se especifican, lo que impide conocer sus límites lingüísticos o de ventana de atención.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v3.h068.sft-splice-cont.step_8)
- [Dataset del run `opus-high-v3-data`](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice del proyecto AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
- [Modelos de agentic-ptb en HuggingFace](https://huggingface.co/models?other=agentic-ptb)

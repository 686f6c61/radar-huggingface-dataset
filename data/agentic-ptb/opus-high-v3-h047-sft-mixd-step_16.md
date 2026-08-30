# agentic-ptb/opus-high-v3.h047.sft-mixd.step_16

## Resumen

`opus-high-v3.h047.sft-mixd.step_16` es un checkpoint intermedio publicado por el usuario `agentic-ptb` como parte del experimento **AgentPTB opus-high-v3**, un run de ajuste fino supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. El checkpoint corresponde a la hora de ejecución `h047` y al paso de entrenamiento 16, y se publica con el rol de `intermediate`, es decir, como artefacto de reproducibilidad y estudio cualitativo.

La model card es explícita en cuanto a la naturaleza del resultado: el run **no encontró mejora alguna en los pesos entrenados** respecto al modelo base, y se advierte que no se debe inferir calidad del modelo a partir de su publicación. Se trata, por tanto, de un resultado negativo documentado para la comunidad, no de un modelo listo para producción.

Con 9.409.813.744 parámetros (aproximadamente 9,4B), el checkpoint hereda la arquitectura de Qwen3.5-9B-Base, aunque no se proporcionan detalles sobre la longitud de contexto, cuantizaciones disponibles, idiomas soportados ni formato de pesos más allá de la presencia de archivos `safetensors`. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es MoE declarado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint intermedio de un fine-tuning supervisado (SFT) sobre `Qwen/Qwen3.5-9B-Base`. No se especifican los detalles de la arquitectura interna del modelo base (número de capas, heads, dimensiones ocultas), ni la composición del dataset de entrenamiento, ni el número de tokens utilizados. Tampoco se indica si se emplearon técnicas como RLHF, DPO o decodificación especulativa.

Lo único documentado es que el run `opus-high-v3` pertenece a un experimento más amplio denominado AgentPTB, del que se conservan checkpoints intermedios para reproducibilidad. Según la información disponible, el run **no produjo ninguna mejora en los pesos**: los cinco runs de SFT asociados regresaron al modelo base sin cambios significativos. Esto lo convierte en un caso de estudio de resultados negativos, más que en un modelo con innovaciones técnicas propias.

## Capacidades

- No se documentan capacidades específicas del checkpoint más allá de las heredadas del modelo base Qwen3.5-9B-Base.
- No hay información sobre generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes o capacidades multilingües.
- Dado que el run no produjo mejoras, las capacidades efectivas del modelo son, en el mejor de los casos, equivalentes a las de su base, pero no hay evidencia publicada que lo confirme.
- No se menciona soporte para thinking mode, visión, audio ni ninguna característica especial.

## Casos de uso

Dado el carácter de checkpoint intermedio de un experimento fallido, no se recomienda su uso en aplicaciones prácticas. Los únicos casos de uso razonables son:

- **Reproducibilidad de experimentos**: investigadores que quieran verificar o estudiar el comportamiento del run `opus-high-v3` pueden cargar este checkpoint para analizar los pesos en el paso 16.
- **Estudio de resultados negativos**: sirve como referencia para documentar qué configuraciones de SFT no funcionan sobre Qwen3.5-9B-Base, útil para evitar repetir experimentos fallidos.
- **Análisis de regresión durante el entrenamiento**: permite inspeccionar cómo evolucionaron los pesos antes del estancamiento o regresión observado en el run.
- **Comparación cualitativa**: puede usarse como baseline intermedio para comparar con checkpoints posteriores o con el modelo base, siempre entendiendo que no se espera mejora.
- **Investigación sobre dinámicas de SFT**: para estudiar por qué ciertos datasets o hiperparámetros no producen aprendizaje efectivo en modelos de 9B.
- **Auditoría de pipelines de entrenamiento**: útil para validar que el pipeline de checkpoints y guardado funciona correctamente, aunque el entrenamiento no converja.

En ningún caso se recomienda su uso en producción, atención al cliente, generación de código o cualquier tarea de usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Dado que el run no mostró mejora en los pesos, es improbable que existan resultados comparativos favorables.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible. Con 9,4B parámetros en fp32, el checkpoint ocuparía aproximadamente 37,6 GB en memoria. En fp16 o bf16, unos 18,8 GB (coincide con el tamaño del repo, 18.8 GB). Para inferencia con cuantización de 8 bits, aproximadamente 9,4 GB; con 4 bits, unos 4,7 GB.
- **GPU recomendadas**: para inferencia en fp16 se necesitaría una GPU con al menos 20 GB de VRAM (por ejemplo, RTX 4090 24GB, A100 40GB, H100). Con cuantización de 4 bits podría caber en GPUs de 8 GB, pero no se proporcionan archivos cuantizados.
- **Opciones de despliegue**: al ser un checkpoint intermedio de un experimento fallido, no se recomienda su despliegue. Si se quisiera hacer, requeriría convertir los pesos a formatos como GGUF o usar vLLM, pero no se ofrece soporte ni documentación.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

Dado que el modelo es un checkpoint intermedio sin mejoras documentadas, la comparación más relevante es con su propio modelo base:

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | Apache-2.0 |
| opus-high-v3.h047.sft-mixd.step_16 | 9,4B | no disponible | sin mejoras documentadas | Apache-2.0 |
| Otros modelos de 9B (p.ej. Llama-3.1-8B, Mistral-7B) | 7-8B | 128K / 32K | benchmarks publicados | variada |

No se dispone de información sobre modelos comparables de la misma familia AgentPTB más allá de la referencia a `opus-high-v1` y `opus-high-v2` en el dataset INDEX, donde se indica que `opus-high-v2` fue abortado y sus runs de SFT regresaron. No hay datos de rendimiento para ninguno de ellos.

## Limitaciones y advertencias

- **Resultado negativo**: la model card advierte explícitamente que el run no encontró mejora en los pesos entrenados. No debe inferirse calidad del modelo a partir de su publicación.
- **Checkpoint intermedio**: no es un modelo final ni ajustado; está pensado para reproducibilidad y estudio, no para uso práctico.
- **Sesgos y alucinación**: no se han evaluado. Al ser un derivado de Qwen3.5-9B-Base sin entrenamiento efectivo, hereda los sesgos y limitaciones del modelo base, pero no hay documentación al respecto.
- **Idiomas**: no se especifican idiomas soportados. No se puede asumir cobertura multilingüe.
- **Contexto**: se desconoce la longitud de contexto soportada.
- **Licencia**: Apache-2.0 permite uso comercial, pero dado que el modelo no es funcional para tareas reales, su uso comercial carece de sentido práctico.
- **Riesgo de producción**: no debe desplegarse en entornos de producción bajo ninguna circunstancia, ya que no hay evidencia de que funcione correctamente ni siquiera como modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h047.sft-mixd.step_16
- Dataset asociado: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice de experimentos AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base

# gurujustin/affine-archive-nw1-angryaffine-Affine-5dhllm8qg9-x1

## Resumen

Este repositorio contiene una copia de archivo del checkpoint `Affine-5dhllm8qg9-x1`, una presentación de la subred SN120 (Affine) de Bittensor, mantenida por el usuario `gurujustin` para preservar el modelo tras la eliminación del repositorio original. El modelo fue un "near-winner" en el duelo de validación del 30 de agosto de 2026, perdiendo por un margen de +0.00143 con un z-score de 2.13, por debajo del umbral delta de 0.002. Se trata de un modelo de lenguaje de 35.107 millones de parámetros con arquitectura `qwen3_5_moe` (Mixture of Experts), en formato safetensors con tensores BF16, y un tamaño de repositorio de 70.2 GB.

La relevancia de este modelo es principalmente histórica y técnica: al ser un archivo de una competición de Bittensor, no se ha publicado ninguna documentación oficial, model card, ni especificaciones de entrenamiento. No se dispone de información sobre su licencia, idiomas soportados, contexto máximo, ni capacidades concretas. Su interés radica en que es un ejemplo de un checkpoint de 35B parámetros con arquitectura MoE entrenado para la subred Affine, pero sin datos verificables sobre su rendimiento o uso práctico. Cualquier evaluación debe realizarse directamente sobre los pesos, asumiendo los riesgos de falta de documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (Mixture of Experts) |
| Parametros totales | 35.107.181.936 (35B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

No se ha publicado ninguna información sobre la arquitectura interna, el proceso de entrenamiento, el dataset utilizado, ni las técnicas de alineación (RLHF, DPO, etc.). El tag `qwen3_5_moe` sugiere que el modelo sigue la arquitectura de la familia Qwen 3.5 en su variante MoE, pero no hay confirmación oficial. Tampoco se conocen innovaciones técnicas específicas, como decodificación especulativa o atención lineal. El único dato fiable es el número total de parámetros (35.107.181.936) y el formato de pesos (safetensors, BF16). Al ser un archivo de una competición de Bittensor, es probable que el entrenamiento se haya realizado con recursos distribuidos y que el modelo haya sido evaluado en tareas de razonamiento o generación, pero esto es especulativo.

## Capacidades

No se dispone de información verificada sobre las capacidades del modelo. Al ser un archivo sin documentación, no se puede confirmar si soporta generación de texto, razonamiento, código, matemáticas, tool calling, agentes, o capacidades multimodales. La arquitectura MoE de 35B parámetros sugiere que podría manejar tareas complejas de lenguaje, pero sin benchmarks ni ejemplos de uso, cualquier afirmación sería una suposición. Se recomienda tratar este modelo como un checkpoint experimental sin garantías de funcionalidad.

## Casos de uso

Dada la ausencia total de documentación y benchmarks, no es posible recomendar casos de uso concretos con seguridad. Los únicos escenarios plausibles serían:

- Investigación académica: análisis de la arquitectura MoE de 35B parámetros en el contexto de competiciones descentralizadas como Bittensor, estudiando su comportamiento sin expectativas de producción.
- Reproducción de evaluaciones: replicar los duelos de validación de la subred SN120 para verificar los resultados reportados en los registros públicos.
- Fine-tuning experimental: usar los pesos como punto de partida para ajuste fino en tareas específicas, siempre que se resuelva la cuestión de la licencia.
- Comparación de arquitecturas: estudiar las diferencias de rendimiento entre este checkpoint y otros de la misma familia (por ejemplo, `Affine-5cdnynpsnu-hv2` o `Affine-5dhllm8qg9-w1`) en entornos controlados.
- Desarrollo de herramientas de evaluación: probar la robustez de pipelines de inferencia con modelos de 35B en formato BF16.
- Auditoría de seguridad: examinar posibles sesgos o comportamientos indeseados antes de cualquier uso público.

En todos los casos, se requiere una evaluación previa exhaustiva y la resolución de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento proviene del registro del duelo de Bittensor: el modelo perdió por un margen de +0.00143 con un z-score de 2.13, lo que indica que quedó por debajo del umbral de victoria (delta=0.002). No hay métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35B parámetros en BF16, el modelo requiere aproximadamente 70 GB de VRAM solo para los pesos. Con cuantización a 8 bits (si estuviera disponible) se reduciría a unos 35 GB, y a 4 bits a unos 18 GB, pero no se han publicado versiones cuantizadas.
- GPU recomendadas: para inferencia en BF16 se necesitan GPUs profesionales con al menos 80 GB de VRAM, como NVIDIA A100 (80GB), H100 (80GB) o A800. En configuraciones multi-GPU, se podría usar tensor parallelism con 2x A100 o 4x RTX 4090 (24GB cada una) con cuantización.
- En consumer GPU: no es viable en una sola GPU de consumo (RTX 4090 tiene 24 GB, insuficiente para BF16). Con cuantización 4-bit podría caber en una RTX 4090, pero no se ofrecen versiones cuantizadas.
- Opciones de despliegue: al no haber documentación, se puede intentar cargar con transformers, vLLM o llama.cpp si se convierte a GGUF, pero no hay garantías de compatibilidad. El tag `qwen3_5_moe` sugiere que podría ser compatible con el ecosistema Qwen, pero no está confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. Existen otros checkpoints de la misma subred (por ejemplo, `Affine-5cdnynpsnu-hv2` con 35B parámetros y `Affine-5dhllm8qg9-w1` con 36B), pero no se han publicado sus especificaciones ni resultados. Modelos comerciales o de código abierto de tamaño similar (como Qwen2.5-32B o Mixtral-8x7B) tienen documentación extensa, pero no se pueden comparar directamente sin datos de este modelo. Se recomienda tratar este archivo como un caso aislado sin referencias.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card, ni especificaciones de entrenamiento, ni licencia clara. Esto impide conocer sesgos, riesgos de alucinación o limitaciones de contexto.
- Licencia no definida: el uso comercial o la redistribución pueden infringir derechos de autor o términos de Bittensor. Se debe contactar con el autor original (`angryaffine`) antes de cualquier uso.
- Riesgo de alucinación y comportamiento impredecible: al no haber sido evaluado con métricas estándar, no se puede garantizar su fiabilidad en tareas de producción.
- Posible obsolescencia: el checkpoint fue creado en 2026 y puede estar desactualizado respecto a modelos más recientes.
- Tamaño y requisitos de hardware: los 70 GB de pesos en BF16 dificultan su uso en entornos con recursos limitados.
- Sin soporte de la comunidad: al ser un archivo sin mantenimiento, no hay garantías de corrección de errores o actualizaciones.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/gurujustin/affine-archive-nw1-angryaffine-Affine-5dhllm8qg9-x1
- Repositorio original (posiblemente eliminado): https://huggingface.co/angryaffine/Affine-5dhllm8qg9-x1
- Registros de duelos de Bittensor SN120: https://s3.hippius.com/affine-sn120/evals/index.jsonl
- Otros checkpoints de la misma subred: https://huggingface.co/angryaffine/Affine-5cdnynpsnu-hv2 y https://huggingface.co/angryaffine/Affine-5dhllm8qg9-w1

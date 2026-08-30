# agentic-ptb/opus-high-v3.h007.sft-v2.step_20

## Resumen

`opus-high-v3.h007.sft-v2.step_20` es un checkpoint intermedio publicado por el equipo de AgentPTB dentro de su serie de experimentos **opus-high-v3**, un conjunto de ejecuciones de Claude Code orientadas a estudiar el fine-tuning de modelos de lenguaje mediante agentes autónomos. Este checkpoint concreto corresponde a la hora de ejecución `h007` y al paso 20 de un pipeline de SFT (supervised fine-tuning) sobre el modelo base `Qwen/Qwen3.5-9B-Base`.

El modelo se publica con un aviso explícito de interpretación: la ejecución **no encontró ninguna mejora en los pesos entrenados** y el propio autor lo etiqueta como `negative-results`. Es decir, se trata de un artefacto de reproducibilidad y estudio cualitativo, no de un modelo listo para uso. Su relevancia radica en documentar un experimento fallido dentro de una línea de investigación sobre entrenamiento agéntico, y en servir como referencia para quienes estudian por qué ciertos pipelines de SFT no convergen o regresan al comportamiento del modelo base.

Con 9.409.813.744 parámetros (9,4B), el checkpoint hereda la arquitectura del base Qwen3.5-9B, aunque no se especifican detalles adicionales como longitud de contexto o configuración interna. La licencia es Apache 2.0 y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen/Qwen3.5-9B-Base (detalles no especificados) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors originales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint se deriva de `Qwen/Qwen3.5-9B-Base`, un modelo de 9,4B parámetros cuya arquitectura interna (número de capas, heads, dimensiones ocultas) no se detalla en la información proporcionada. El entrenamiento consistió en un pipeline de SFT (supervised fine-tuning) ejecutado dentro de un entorno de Claude Code, donde un agente autónomo gestionaba el proceso de ajuste. Según la documentación del autor, la ejecución `opus-high-v3` no produjo ninguna mejora en los pesos: los cinco runs de SFT asociados regresaron, es decir, los tensores finales quedaron esencialmente idénticos a los del modelo base. Este checkpoint intermedio se conserva únicamente con fines de reproducibilidad y análisis cualitativo.

No se proporcionan datos sobre el dataset de entrenamiento, número de tokens, composición de los datos ni técnicas adicionales como RLHF o DPO. El propio autor advierte que no debe inferirse calidad a partir de la publicación.

## Capacidades

No se ha evaluado ni documentado ninguna capacidad específica de este checkpoint. Al tratarse de un resultado negativo sin mejoras sobre el modelo base, no se puede afirmar que el modelo tenga capacidades propias más allá de las heredadas de `Qwen/Qwen3.5-9B-Base`. No hay información sobre generación de texto, razonamiento, código, tool calling, agentes, multilingüismo ni capacidades especiales.

## Casos de uso

Dado el carácter de resultado negativo y la advertencia explícita del autor, este checkpoint **no es adecuado para ningún caso de uso práctico**. Los posibles usos son exclusivamente de investigación:

- Reproducibilidad de experimentos: permite a otros investigadores replicar el pipeline de SFT y verificar por qué no convergió.
- Estudio de fallos de entrenamiento: sirve para analizar qué condiciones llevan a que un SFT regrese al comportamiento del base.
- Comparación de checkpoints intermedios: útil para trazar la evolución de los pesos a lo largo de las horas de ejecución.
- Auditoría de pipelines agénticos: documenta un caso donde un agente autónomo no logró mejorar el modelo, lo que puede informar el diseño de futuros sistemas de entrenamiento agéntico.
- Análisis de calidad de datos: si se combina con el dataset `agentic-ptb/opus-high-v3-data`, permite estudiar la relación entre los datos de entrenamiento y el resultado final.
- Referencia para benchmarks negativos: puede usarse como línea base para demostrar que un método alternativo sí produce mejoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta ninguna métrica de rendimiento (MMLU, HumanEval, GSM8K, etc.) y, dado que el run no produjo mejoras, no hay datos que comparar con otros modelos.

## Requisitos de hardware

No se dispone de requisitos oficiales de hardware. A partir del tamaño del modelo (9,4B parámetros, 18,8 GB en safetensors, presumiblemente en fp16/bf16), se pueden estimar los siguientes requisitos para inferencia:

- VRAM estimada: ~19 GB en fp16/bf16, ~10 GB en int8, ~5 GB en int4 (estimaciones generales para modelos de 9B).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o superior para fp16; GPUs con 12-16 GB (RTX 3080/4080, A10) para cuantización int8; GPUs con 8 GB (RTX 3060, A4000) para int4.
- Despliegue: al ser un checkpoint sin mejoras, no se recomienda su uso en producción. Si se quisiera experimentar, podría cargarse con vLLM, llama.cpp, Ollama o TGI, pero no hay garantías de funcionamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base `Qwen/Qwen3.5-9B-Base` es la referencia natural, pero no se han publicado métricas comparativas. Otros modelos de 9B como Llama 3.1 8B o Mistral 7B podrían ser comparables en tamaño, pero no hay datos de rendimiento de este checkpoint para establecer una comparación. Se indica "no disponible".

## Limitaciones y advertencias

- **Resultado negativo**: el autor declara explícitamente que el run no encontró ninguna mejora en los pesos entrenados. No debe usarse como modelo de producción.
- **Checkpoint intermedio**: es un artefacto de reproducibilidad, no un modelo final. Su calidad no está garantizada y puede contener pesos parcialmente entrenados o corruptos.
- **Sin evaluación**: no hay benchmarks, ni pruebas de capacidades, ni documentación de sesgos o alucinaciones.
- **Riesgo de comportamiento impredecible**: al ser un checkpoint intermedio de un SFT fallido, puede producir salidas incoherentes o degradadas respecto al base.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor desaconseja cualquier uso más allá de la investigación.
- **Sin soporte**: no hay canal de soporte ni mantenimiento para este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h007.sft-v2.step_20
- Dataset asociado: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice de experimentos AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Búsqueda de modelos AgentPTB: https://huggingface.co/models?other=agentic-ptb

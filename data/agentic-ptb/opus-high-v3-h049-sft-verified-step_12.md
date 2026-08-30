# agentic-ptb/opus-high-v3.h049.sft-verified.step_12

## Resumen

`agentic-ptb/opus-high-v3.h049.sft-verified.step_12` es un checkpoint intermedio derivado de un experimento de entrenamiento del proyecto AgentPTB, concretamente de la ejecución denominada `opus-high-v3`. Se trata de un fine-tune sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con un total de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), y se distribuye bajo licencia Apache-2.0. El checkpoint corresponde al paso 12 de una fase de SFT verificada, dentro de la hora de ejecución `h049`.

El propio autor etiqueta el modelo como `negative-results` y advierte explícitamente en la model card que la ejecución no produjo ninguna mejora en los pesos entrenados, por lo que no debe inferirse calidad a partir de su publicación. Su propósito es exclusivamente la reproducibilidad y el estudio cualitativo de fallos de entrenamiento, no su uso como modelo final. No se han publicado especificaciones adicionales como longitud de contexto, idiomas soportados o cuantizaciones disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune de Qwen/Qwen3.5-9B-Base (arquitectura del base no especificada en la ficha) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es un ajuste fino (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, del que hereda la arquitectura subyacente. No se proporcionan detalles sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni las técnicas aplicadas (RLHF, DPO, etc.). La ejecución `opus-high-v3` forma parte del proyecto AgentPTB, cuyo índice público indica que una ejecución anterior (`opus-high-v2`) fue abortada por regresiones en los cinco runs de SFT, mientras que esta versión (`opus-high-v3`) se retuvo como checkpoint intermedio para reproducibilidad.

El autor señala que el run no encontró ninguna mejora en los pesos entrenados, lo que clasifica el resultado como negativo. Esto implica que, aunque el checkpoint existe y es descargable, no representa un modelo con capacidades validadas ni mejoras respecto al base.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un artefacto intermedio sin validación y con resultado negativo declarado, no se puede atribuir ninguna funcionalidad fiable. Cualquier capacidad heredada del modelo base `Qwen3.5-9B-Base` (generación de texto, razonamiento, código, etc.) no está verificada en este checkpoint y el autor desaconseja inferir calidad a partir de su existencia.

## Casos de uso

Dado su carácter de checkpoint de investigación con resultado negativo, los casos de uso son exclusivamente técnicos y de investigación:

- Reproducibilidad de experimentos: permite replicar el estado exacto de los pesos en el paso 12 del run `opus-high-v3` para verificar resultados o depurar pipelines de entrenamiento.
- Estudio de fallos de entrenamiento: sirve para analizar por qué un SFT no converge o no mejora, comparando tensores intermedios con el modelo base.
- Análisis de degradación: se puede estudiar si el fine-tune introduce regresiones en tareas específicas frente al base, útil para entender límites de SFT en dominios concretos.
- Auditoría de procesos: como parte del proyecto AgentPTB, permite auditar la trazabilidad de los checkpoints generados por agentes automatizados.
- Desarrollo de metodologías de verificación: investigadores pueden usar este caso como ejemplo de "resultado negativo" para calibrar métricas de detección temprana de fallos.
- Comparación de variantes: al existir otros checkpoints del mismo run (p. ej., `step_12` frente a otros pasos), se pueden comparar evoluciones y decidir puntos de parada óptimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta ninguna métrica de rendimiento (MMLU, HumanEval, GSM8K, etc.) y, dado el carácter negativo del run, no se espera que existan mediciones favorables.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware para este checkpoint. Como referencia orientativa, el tamaño del repositorio es de 18,8 GB, consistente con pesos en precisión fp16 (9,4 mil millones de parámetros × 2 bytes ≈ 18,8 GB). Para cargar el modelo en memoria se necesitaría aproximadamente:

- VRAM estimada en fp16: ~19 GB (una GPU como RTX 4090 24 GB o A100 40 GB sería suficiente).
- VRAM estimada en int8 (si se cuantizara manualmente): ~10 GB, aunque no se ofrecen cuantizaciones oficiales.
- Opciones de despliegue: al ser un checkpoint sin validación y sin cuantizaciones publicadas, no se recomienda su uso con vLLM, llama.cpp, Ollama o TGI en producción. Para investigación, se podría cargar con transformers o safetensors directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Al tratarse de un checkpoint intermedio de un experimento con resultado negativo, no existe una categoría de modelos comparables. La única referencia razonable sería el propio modelo base `Qwen/Qwen3.5-9B-Base`, pero no se dispone de datos de rendimiento del checkpoint para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El autor declara explícitamente que el run no encontró mejora en los pesos entrenados; el checkpoint es un artefacto de reproducibilidad, no un modelo útil.
- No se debe inferir calidad ni capacidad a partir de su publicación.
- No hay documentación sobre sesgos, alucinaciones o limitaciones de contexto/idioma; al derivar de Qwen3.5, podría heredar sesgos del base, pero no está verificado.
- La licencia Apache-2.0 permite uso comercial, pero el valor práctico del modelo es nulo para producción.
- No se proporcionan cuantizaciones, longitudes de contexto ni detalles de entrenamiento, lo que dificulta cualquier despliegue serio.
- El nombre `opus-high-v3` no implica relación con Claude Opus de Anthropic; es solo una etiqueta interna del experimento AgentPTB.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v3.h049.sft-verified.step_12)
- [Dataset de datos del run `opus-high-v3-data`](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice del proyecto AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
- [Modelo base Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base)

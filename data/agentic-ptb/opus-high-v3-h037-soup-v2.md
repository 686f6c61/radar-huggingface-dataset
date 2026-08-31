# agentic-ptb/opus-high-v3.h037.soup-v2

## Resumen

`agentic-ptb/opus-high-v3.h037.soup-v2` es un checkpoint intermedio publicado por el usuario `agentic-ptb` dentro del proyecto **AgentPTB**, concretamente de la ejecución **opus-high-v3** llevada a cabo con Claude Code. Se trata de un *fine-tune* derivado del modelo base `Qwen/Qwen3.5-9B-Base`, con 9,41 mil millones de parámetros y pesos en formato `safetensors`. El repositorio está etiquetado explícitamente con `negative-results`, y la propia model card advierte de que la ejecución no produjo **ninguna mejora en los pesos entrenados**, por lo que este checkpoint no debe interpretarse como un modelo con calidad publicable.

El interés de esta publicación es estrictamente metodológico: sirve como artefacto de reproducibilidad y para estudios cualitativos sobre el proceso de entrenamiento fallido. No se han reportado capacidades específicas, benchmarks ni métricas de rendimiento, y el modelo acumula cero descargas y cero *likes* en Hugging Face. Su licencia es Apache 2.0, pero su uso práctico está desaconsejado por el propio autor, que lo califica de resultado negativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,41 B) |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo más allá de que es un *fine-tune* del modelo base `Qwen/Qwen3.5-9B-Base`. Se desconoce si se trata de una arquitectura *dense* o *mixture-of-experts*, así como la configuración exacta de capas, atención o mecanismos de *scaling*. Tampoco hay datos sobre el dataset de entrenamiento, el número de tokens procesados o la metodología de alineación (RLHF, DPO, etc.).

Lo que sí se sabe es que el entrenamiento se realizó mediante una ejecución de **Claude Code** dentro del framework **AgentPTB**, y que el resultado fue **negativo**: la ejecución no encontró ninguna mejora en los pesos entrenados. El checkpoint se conserva como artefacto intermedio para reproducibilidad y análisis cualitativo, no como modelo funcional.

## Capacidades

No se ha publicado ninguna evaluación de capacidades para este checkpoint. Al ser un *fine-tune* fallido del modelo Qwen3.5-9B-Base, es probable que herede las capacidades generales de dicho modelo base (generación de texto, razonamiento, código, etc.), pero no hay ninguna evidencia empírica que lo confirme. El autor indica explícitamente que no debe inferirse calidad a partir de la publicación.

- Generación de texto: no verificado, no documentado.
- Razonamiento y matemáticas: no verificado, no documentado.
- Generación de código: no verificado, no documentado.
- Tool calling / function calling: no verificado, no documentado.
- Capacidades multilingües: no disponibles.
- Modo *thinking* o capacidades especiales: no disponibles.

## Casos de uso

Dado el carácter de resultado negativo del checkpoint, no se recomienda su uso en ningún escenario práctico. Los únicos casos de uso razonables son de naturaleza investigadora:

- Reproducibilidad de experimentos: permite replicar o auditar la ejecución `opus-high-v3` y verificar por qué el entrenamiento no produjo mejoras.
- Estudio de fallos de entrenamiento: sirve como caso de estudio para analizar *negative results* en *fine-tuning* de modelos grandes.
- Comparación de *checkpoints* intermedios: puede usarse para trazar la evolución de los pesos a lo largo de la ejecución y comparar con otros *checkpoints* del mismo run.
- Investigación sobre *model soups*: el nombre `soup-v2` sugiere que se trata de un *weight averaging* de modelos; podría usarse para estudiar técnicas de *ensemble* aunque el resultado haya sido negativo.
- Auditoría de pipelines de entrenamiento: dado que el run se ejecutó con Claude Code, puede servir para validar herramientas de orquestación de entrenamiento automático.
- Documentación de *negative results*: útil para la comunidad como ejemplo de publicación honesta de resultados fallidos.

En ningún caso se recomienda su despliegue en producción, ni siquiera como modelo de propósito general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar. El autor no reporta ningún dato de rendimiento, y la naturaleza de *negative results* hace improbable que existan cifras favorables.

## Requisitos de hardware

No se dispone de datos específicos sobre requisitos de hardware para este checkpoint. Como estimación orientativa basada en el tamaño del repositorio (18,8 GB en `safetensors`, que corresponde aproximadamente a pesos en FP16), se puede inferir lo siguiente:

- VRAM estimada para inferencia en FP16: ~19 GB, lo que cabría en una GPU de 24 GB (por ejemplo, RTX 4090, A10G o L4).
- Con cuantización a 8 bits (INT8): ~10 GB, viable en GPUs de 12-16 GB (RTX 4070 Ti, A4000).
- Con cuantización a 4 bits (INT4): ~5 GB, viable en GPUs de 8 GB o menos.
- No obstante, al tratarse de un checkpoint sin utilidad práctica, no se recomienda invertir recursos en su despliegue.
- Opciones de despliegue: si se quisiera probar, podría usarse `vLLM`, `llama.cpp`, `Ollama` o `TGI`, pero no hay garantías de que funcione correctamente dado su origen intermedio.

## Comparativa con modelos similares

Dado que no hay datos de rendimiento ni especificaciones detalladas, la única comparación posible es con el modelo base del que deriva:

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| `agentic-ptb/opus-high-v3.h037.soup-v2` | 9,41 B | no disponible | sin datos (negative results) | Apache 2.0 |
| `Qwen/Qwen3.5-9B-Base` | ~9 B | no disponible (no confirmado) | no disponible en esta ficha | Apache 2.0 (según tags) |

No se dispone de información sobre otros modelos comparables de la misma categoría (9B) en el contexto de esta ficha. La comparación con otros *checkpoints* de la serie `opus-high-v3` tampoco es posible porque no se han publicado datos de rendimiento de ninguno de ellos.

## Limitaciones y advertencias

- **Resultado negativo declarado**: el autor indica explícitamente que la ejecución no encontró mejoras en los pesos entrenados; no debe usarse como modelo funcional.
- **Checkpoint intermedio**: no es un modelo final, sino un artefacto de reproducibilidad; su calidad no está garantizada.
- **Sin benchmarks**: no hay ninguna métrica de rendimiento publicada; no se puede evaluar su calidad objetiva.
- **Sin información de contexto ni idiomas**: no se han documentado las longitudes de contexto soportadas ni los idiomas cubiertos.
- **Riesgo de alucinación y sesgos**: al ser un *fine-tune* no validado, los riesgos de alucinación y sesgos son desconocidos y potencialmente altos.
- **Uso en producción desaconsejado**: no hay ningún caso de uso realista que justifique su despliegue.
- **Licencia Apache 2.0**: permite uso comercial, pero la falta de calidad del modelo lo hace inadecuado para cualquier aplicación comercial seria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentic-ptb/opus-high-v3.h037.soup-v2
- Dataset de la ejecución `opus-high-v3`: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Búsqueda de modelos de `agentic-ptb`: https://huggingface.co/models?other=agentic-ptb

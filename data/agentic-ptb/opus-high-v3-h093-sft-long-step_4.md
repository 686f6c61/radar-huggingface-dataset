# agentic-ptb/opus-high-v3.h093.sft-long.step_4

## Resumen

Este modelo es un checkpoint intermedio derivado de un experimento de entrenamiento agéntico denominado **AgentPTB opus-high-v3**, publicado por el autor `agentic-ptb`. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-9B-Base mediante un pipeline de *supervised fine-tuning* (SFT) de larga duración. El nombre del checkpoint (`opus-high-v3.h093.sft-long.step_4`) indica que corresponde a la hora 93 de ejecución y al paso 4 del entrenamiento SFT.

La característica más relevante de este modelo es que el propio autor advierte explícitamente en su model card que el run **no produjo ninguna mejora en los pesos entrenados**, es decir, se trata de un resultado negativo. El checkpoint se conserva únicamente con fines de reproducibilidad y estudio cualitativo, y no debe inferirse calidad alguna de su publicación. Con 9.409.813.744 parámetros y licencia Apache-2.0, no dispone de información pública sobre contexto, idiomas o capacidades específicas más allá de las heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint base Qwen/Qwen3.5-9B-Base, que emplea una arquitectura transformer densa de aproximadamente 9.400 millones de parámetros. El entrenamiento se realizó mediante *supervised fine-tuning* (SFT) de larga duración, como indica el sufijo `sft-long` en el nombre del checkpoint. Sin embargo, no se han publicado detalles sobre el dataset utilizado, el número de tokens de entrenamiento, ni la composición de los datos.

El proceso de entrenamiento formó parte de un pipeline agéntico (AgentPTB) en el que Claude Opus generó los datos de entrenamiento. El autor reporta que, tras cinco ejecuciones de SFT, el modelo **no mostró ninguna mejora en los pesos entrenados** respecto al modelo base, por lo que el resultado se clasifica como negativo. No se ha documentado ninguna innovación técnica adicional en este checkpoint concreto.

## Capacidades

No se ha publicado información específica sobre las capacidades de este checkpoint. Al ser un fine-tune de Qwen3.5-9B-Base, podría heredar las capacidades generales de dicho modelo base (generación de texto, razonamiento, código, etc.), pero no existe ninguna evaluación pública que confirme el rendimiento real de este checkpoint. Dado el aviso del autor sobre la ausencia de mejora en los pesos entrenados, no se puede asumir que mantenga ni siquiera las capacidades del modelo base sin verificación.

## Casos de uso

Este checkpoint no tiene casos de uso prácticos recomendados. Se trata de un artefacto de investigación intermedio, retenido exclusivamente para:

- Reproducibilidad de experimentos: permite a otros investigadores replicar el pipeline AgentPTB y verificar los resultados negativos reportados.
- Estudio cualitativo de fallos: puede servir para analizar por qué el entrenamiento SFT no produjo mejoras y qué factores contribuyeron al resultado negativo.
- Comparación de arquitecturas de entrenamiento agéntico: útil para contrastar con otros checkpoints del mismo proyecto (p. ej. opus-high-v1) y entender las diferencias entre runs.
- Auditoría de pipelines de generación de datos con LLMs: permite examinar cómo los datos generados por Claude Opus afectan al fine-tune de un modelo base.
- Investigación sobre estabilidad del entrenamiento: el hecho de que los pesos no mejoraran puede aportar información sobre la sensibilidad del proceso de SFT a la calidad o distribución de los datos.
- Docencia en evaluación de modelos: sirve como ejemplo de un resultado negativo bien documentado, útil para enseñar prácticas de reproducibilidad y transparencia en publicación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona ninguna métrica de evaluación (MMLU, HumanEval, GSM8K, etc.) para este checkpoint, y la advertencia explícita sobre la ausencia de mejora en los pesos entrenados sugiere que cualquier evaluación arrojaría resultados iguales o inferiores a los del modelo base Qwen3.5-9B-Base. No se dispone de datos comparativos con otros modelos.

## Requisitos de hardware

No se ha publicado información específica sobre requisitos de hardware para este checkpoint. No obstante, dado que el tamaño del repositorio es de 18.8 GB en formato safetensors (equivalente a pesos en FP16), se puede realizar una estimación orientativa:

- VRAM estimada para inferencia en FP16: aproximadamente 19-20 GB, más overhead de activaciones y memoria del runtime, lo que requiere una GPU con al menos 24 GB de VRAM (p. ej. RTX 3090, RTX 4090, A10G, A100 40GB).
- Para cuantización en 8 bits: se reduciría a unos 10 GB, permitiendo su ejecución en GPUs de 12-16 GB (p. ej. RTX 3060, RTX 4070).
- En 4 bits: aproximadamente 5-6 GB, viable en GPUs de 8 GB (p. ej. RTX 3060 Ti, RTX 4060).
- Opciones de despliegue: al ser un modelo estándar de HuggingFace, puede cargarse con transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se han publicado configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. Este checkpoint es un artefacto de investigación de un experimento fallido, sin métricas publicadas ni evaluación independiente. La única referencia comparable sería el modelo base Qwen/Qwen3.5-9B-Base, del cual deriva, pero no hay datos que permitan cuantificar diferencias de rendimiento. No se conocen otros modelos de la misma categoría (fine-tunes agénticos con resultados negativos) que puedan servir de referencia.

## Limitaciones y advertencias

- El autor reporta explícitamente que el run **no encontró ninguna mejora en los pesos entrenados**, por lo que el modelo no aporta valor funcional sobre el base.
- Es un checkpoint intermedio de un experimento de investigación, no un modelo final listo para uso.
- No se han publicado benchmarks ni evaluaciones de ningún tipo; no se puede garantizar ninguna capacidad concreta.
- El propio autor advierte: "no inferir calidad de la publicación" (do not infer quality from publication).
- No hay información sobre sesgos, riesgos de alucinación o limitaciones idiomáticas específicas de este checkpoint.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo no es adecuado para producción debido a su naturaleza de resultado negativo y falta de validación.
- El nombre del checkpoint sugiere que forma parte de una serie más amplia (opus-high-v3), pero no se ha documentado el contexto completo del experimento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h093.sft-long.step_4
- Dataset asociado: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base

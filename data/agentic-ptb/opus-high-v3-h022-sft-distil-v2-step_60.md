# agentic-ptb/opus-high-v3.h022.sft-distil-v2.step_60

## Resumen

Este checkpoint, identificado como `opus-high-v3.h022.sft-distil-v2.step_60`, es un artefacto intermedio del proyecto AgentPTB, una iniciativa que explora el entrenamiento de modelos de lenguaje para tareas de agencia (uso de herramientas, razonamiento multi-paso). Fue generado durante un run etiquetado como `opus-high-v3` a las 22 horas de ejecución, y se conserva únicamente con fines de reproducibilidad y estudio cualitativo. El modelo base es Qwen/Qwen3.5-9B-Base, con aproximadamente 9.400 millones de parámetros.

La advertencia incluida en la model card es explícita: el run no encontró ninguna mejora en los pesos entrenados. Se trata de un resultado negativo en el que el proceso de ajuste fino supervisado (SFT) no solo no mejoró el rendimiento, sino que probablemente lo degradó, hasta el punto de que en un run anterior (opus-high-v2) se abortó el experimento y se restauraron los tensores del modelo base sin cambios. Por tanto, este checkpoint no debe interpretarse como un modelo útil para tareas prácticas, sino como un registro de un experimento fallido que puede servir para analizar por qué ciertas estrategias de entrenamiento no funcionan.

La relevancia de esta ficha radica en documentar un caso de resultado negativo en el entrenamiento de modelos de agencia, algo poco frecuente en la literatura pública pero esencial para la investigación reproducible. No se dispone de información sobre capacidades, benchmarks ni casos de uso reales, ya que el propio autor desaconseja inferir calidad a partir de su publicación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (aprox. 9,4B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-9B-Base, un transformer denso de 9.400 millones de parámetros desarrollado por Alibaba Qwen. No se han publicado detalles adicionales sobre la arquitectura interna en la información disponible para este checkpoint. El entrenamiento corresponde a un proceso de ajuste fino supervisado con destilación (`sft-distil-v2`) dentro del pipeline AgentPTB, orientado a capacidades de agencia. Sin embargo, el resultado del run fue negativo: no se observó ninguna mejora en los pesos entrenados respecto al modelo base, y en experimentos paralelos (opus-high-v2) se detectó regresión en todos los runs de SFT, lo que llevó a abortar el proceso y restaurar los tensores originales.

No se especifican los datos de entrenamiento, el número de tokens ni las técnicas de alineación (RLHF, DPO, etc.) empleadas. La ausencia de mejora sugiere que la configuración del run no era adecuada para la tarea, pero no se ofrecen hipótesis concretas en la documentación.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Dado que el entrenamiento no produjo mejoras, no es posible atribuirle habilidades adicionales más allá de las heredadas del modelo base Qwen3.5-9B-Base (generación de texto, razonamiento, código, etc.), aunque no se ha verificado su rendimiento real. El autor indica explícitamente que no se debe inferir calidad de la publicación.

## Casos de uso

No se identifican casos de uso prácticos para este checkpoint. Al tratarse de un resultado negativo sin mejoras verificadas, no es adecuado para ninguna aplicación en producción. Su único valor reside en la investigación de reproducibilidad: puede utilizarse como punto de comparación en estudios sobre por qué fracasan ciertas estrategias de entrenamiento de agentes, o como referencia para depurar pipelines de SFT. No obstante, para cualquier tarea real se recomienda emplear el modelo base Qwen3.5-9B-Base o alternativas con resultados positivos documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni ningún otro estándar. Dado el carácter negativo del run, es probable que los resultados, si se obtuvieron, fueran inferiores a los del modelo base, pero no se dispone de datos numéricos para confirmarlo.

## Requisitos de hardware

Al no haber información específica sobre el despliegue de este checkpoint, se ofrecen estimaciones generales basadas en su tamaño de 9,4B parámetros:

- VRAM estimada para inferencia: entre 20 y 24 GB en FP16, y entre 6 y 8 GB en cuantización de 4 bits (si se generan los pesos cuantizados, aunque no se proporcionan).
- GPU recomendadas: una NVIDIA RTX 3090/4090 (24 GB) o una A100 (40 GB) serían suficientes para FP16. Para cuantización ligera, una GPU con 8-12 GB podría bastar.
- No se han publicado versiones GGUF ni compatibilidad con llama.cpp u Ollama. El formato safetensors permite su uso con frameworks como Transformers, vLLM o TGI, pero sin garantías de rendimiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El único punto de referencia claro es el modelo base Qwen3.5-9B-Base, del cual este checkpoint es una derivación. Dado que el run no mejoró los pesos, es previsible que el rendimiento sea igual o inferior al del base, pero no hay datos que lo confirmen. No se conocen otros modelos de la misma categoría (checkpoints intermedios de AgentPTB) con resultados publicados. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Resultado negativo confirmado: el autor declara que el run no encontró ninguna mejora en los pesos entrenados. No debe utilizarse en producción.
- Riesgo de alucinación y sesgos: al ser un checkpoint sin validación, no se puede descartar que herede o amplifique los sesgos del modelo base, pero no hay estudios al respecto.
- Ausencia de documentación: no se especifican datos de entrenamiento, contexto, idiomas ni capacidades. Cualquier uso requeriría una evaluación exhaustiva previa.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero dado el resultado negativo, su utilidad comercial es nula.
- Advertencia de reproducibilidad: el checkpoint se conserva únicamente para estudios cualitativos; no se recomienda inferir ningún tipo de calidad a partir de su publicación.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v3.h022.sft-distil-v2.step_60)
- [Dataset asociado `agentic-ptb/opus-high-v3-data`](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice de AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)

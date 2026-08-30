# agentic-ptb/opus-high-v3.h005.sft-v1.step_40

## Resumen

`agentic-ptb/opus-high-v3.h005.sft-v1.step_40` es un checkpoint intermedio derivado de un experimento de entrenamiento supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, publicado por el usuario `agentic-ptb` como parte del proyecto AgentPTB. Según la model card, este checkpoint corresponde a la hora de ejecución `h005` de un run de Claude Code etiquetado como `opus-high-v3`, y se conserva únicamente con fines de reproducibilidad y estudio cualitativo.

El propio autor advierte explícitamente que el run no encontró ninguna mejora en los pesos entrenados y que no debe inferirse calidad a partir de su publicación. Se trata, por tanto, de un artefacto de investigación con resultados negativos, no de un modelo listo para uso práctico. El repositorio ocupa 14,7 GB y la licencia es Apache 2.0, pero no se proporcionan detalles sobre arquitectura interna, contexto, idiomas ni capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | no disponible (el modelo base tiene 9B, pero no se confirma el tamaño del checkpoint) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (tamano del repo: 14,7 GB) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura del checkpoint. Al estar basado en `Qwen/Qwen3.5-9B-Base`, se presume que hereda la arquitectura transformer de dicho modelo, pero no se confirma. El entrenamiento consistió en un proceso de ajuste fino supervisado (SFT) dentro de un run de Claude Code del proyecto AgentPTB, con la etiqueta `opus-high-v3`. El run alcanzó la hora `h005` y produjo este checkpoint en el paso 40, pero el autor indica que no se observó ninguna mejora en los pesos entrenados. No se especifican datos de entrenamiento, número de tokens, composición del dataset ni técnicas adicionales como RLHF o DPO.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al tratarse de un artefacto intermedio con resultados negativos, no se recomienda su uso para ninguna tarea práctica. No hay evidencia de que el modelo haya sido evaluado en generación de texto, razonamiento, código, matemáticas, tool calling, agentes o capacidades multilingües.

## Casos de uso

Dado el carácter experimental y la ausencia de mejora en los pesos, este checkpoint no tiene casos de uso prácticos recomendados. Su única utilidad es la reproducibilidad de experimentos y el estudio cualitativo de fallos en el entrenamiento. No debe emplearse en producción ni en aplicaciones reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de ningún tipo, y al ser un checkpoint intermedio sin mejora, no se dispone de datos de rendimiento comparativo.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos para este checkpoint. El tamaño del repositorio (14,7 GB) sugiere que los pesos podrían estar en precisión FP16 o BF16, lo que implicaría una necesidad de VRAM de al menos 16-20 GB para inferencia en un modelo de aproximadamente 9B de parámetros, pero esta estimación es orientativa y no está confirmada. No se dispone de información sobre GPUs recomendadas, opciones de despliegue, latencia o throughput.

## Comparativa con modelos similares

No disponible. Este checkpoint no es un modelo final comparable con alternativas de la misma categoría. Su naturaleza experimental y la falta de datos de rendimiento impiden cualquier comparación significativa.

## Limitaciones y advertencias

- Checkpoint intermedio sin mejora en los pesos entrenados, según el propio autor.
- No debe inferirse calidad a partir de su publicación.
- No apto para uso en producción ni en aplicaciones reales.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es funcional para tareas prácticas.
- El run `opus-high-v2` fue abortado y no es válido, lo que refuerza la naturaleza experimental del proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h005.sft-v1.step_40
- Dataset asociado: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX

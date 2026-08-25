# bunnycore/LMF-2.5-2.6B-Qwen3.8-Distilled

## Resumen

El modelo `bunnycore/LMF-2.5-2.6B-Qwen3.8-Distilled` es un ajuste fino (fine-tune) del modelo base `LiquidAI/LFM2.5-2.6B`, publicado por el usuario bunnycore (Hoptimizer) en Hugging Face. La licencia es Apache 2.0 y el idioma declarado es inglés. El nombre sugiere una destilación del modelo Qwen3.8 sobre la arquitectura LFM2.5, aunque no se aportan detalles técnicos al respecto en la documentación disponible.

El modelo base, LFM2.5-2.6B, está descrito por Liquid AI como un modelo agéntico de 2.600 millones de parámetros, capaz de planificar, llamar a herramientas y ejecutar tareas de múltiples pasos, con un rendimiento de 220 tokens por segundo en menos de 2,5 GB de memoria. Este fine-tune hereda presumiblemente esas capacidades, pero no se especifican cambios concretos en la model card. La relevancia actual radica en la tendencia de modelos pequeños y eficientes para despliegue en dispositivos y edge, donde LFM2.5-2.6B es una referencia.

No se dispone de información adicional sobre arquitectura interna, datos de entrenamiento ni rendimiento del modelo ajustado. El repositorio no contiene pesos (tamaño 0.0 GB) y el número de descargas es cero, lo que sugiere que es una publicación reciente y sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de LFM2.5-2.6B, sin especificar) |
| Parametros totales | 2.6 mil millones (según modelo base) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (indicado en tags) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo. El nombre del repositorio sugiere una destilación de Qwen3.8 sobre la base LFM2.5-2.6B, pero no hay confirmación en la documentación. El modelo base, LFM2.5-2.6B, es un modelo de 2.6 mil millones de parámetros desarrollado por Liquid AI, diseñado para tareas agénticas y despliegue en dispositivos con recursos limitados. No se han publicado detalles sobre el dataset de entrenamiento, el uso de RLHF/DPO ni innovaciones técnicas específicas para este fine-tune.

El entrenamiento del modelo base se realizó con Unsloth, como se indica en la model card ("trained 2x faster with Unsloth"), pero no se especifican los datos de entrenamiento del fine-tune. No se dispone de información sobre el proceso de destilación, los datos utilizados ni el método de entrenamiento del modelo ajustado.

## Capacidades

- No se han documentado capacidades específicas para este fine-tune.
- Según el modelo base LFM2.5-2.6B, se espera que herede capacidades de planificación de tareas, llamada a herramientas y ejecución de flujos multi paso, pero no se confirma para esta versión.
- Generación de texto en inglés (idioma declarado).
- No se indica soporte de vision, audio ni otros modos.
- No se especifica soporte de tool calling ni function calling en la model card.
- No se dispone de información sobre razonamiento matemático, código o multilingüismo.

## Casos de uso

- Despliegue en dispositivos edge: el modelo base está optimizado para entornos con memoria limitada (menos de 2.5 GB), lo que lo hace adecuado para aplicaciones en móviles, IoT o sistemas embebidos.
- Agentes autónomos: si hereda las capacidades del modelo base, podría ejecutar tareas agénticas con planificación y llamadas a herramientas, aunque no se confirma para este fine-tune.
- Generación de texto ligera: para aplicaciones que requieran respuestas rápidas y eficiencia energética.
- Prototipado rápido: al ser un modelo pequeño, puede integrarse en pipelines de desarrollo sin grandes requisitos de hardware.
- Investigación académica: como ejemplo de destilación de modelos grandes (Qwen3.8) a arquitecturas eficientes (LFM2.5).
- Fine-tuning adicional: al ser un modelo de tamaño pequeño, es fácil de ajustar para tareas específicas con datasets reducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se aportan métricas como MMLU, HumanEval, GSM8K ni comparativas con otros modelos. El modelo base LFM2.5-2.6B tiene un rendimiento declarado de 220 tokens/s en menos de 2.5 GB, pero ese dato no se puede atribuir directamente a este fine-tune.

## Requisitos de hardware

- VRAM estimada: no disponible para este modelo concreto. El modelo base requiere menos de 2.5 GB de memoria, lo que sugiere que el fine-tune puede caber en GPUs de consumo (por ejemplo, RTX 3060, RTX 4060) o incluso en CPU con cuantización.
- GPU recomendadas: no se especifican. Se puede probar en tarjetas con 4 GB o más de VRAM.
- Compatibilidad con GPUs de consumo: probablemente sí, dado el tamaño de 2.6 mil millones de parámetros.
- Opciones de despliegue: no se detallan, pero al ser un modelo de la familia LFM2.5 y con formato safetensors, se puede usar con bibliotecas como transformers, vLLM, llama.cpp u Ollama, aunque no se confirma.
- Latencia y throughput: no se dispone de datos para este modelo específico. El base indica 220 tok/s, pero no se garantiza para el fine-tune.

## Comparativa con modelos similares

No se dispone de información para comparar este modelo con alternativas de la misma categoría. No se conocen otros modelos con el mismo nombre o características exactas. Se podría comparar con el modelo base LFM2.5-2.6B, pero no hay datos de rendimiento para el fine-tune.

## Limitaciones y advertencias

- No se ha validado el modelo en tareas específicas; el número de descargas es cero y no hay evaluaciones publicadas.
- El modelo solo declara soporte para inglés; no se recomienda para otros idiomas sin pruebas.
- Al ser un modelo pequeño (2.6 mil millones de parámetros), puede tener limitaciones en tareas complejas de razonamiento o generación de código extenso.
- Riesgo de alucinaciones y sesgos: no se han evaluado, y no se puede garantizar su comportamiento en producción.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base también tenga licencia compatible; LFM2.5-2.6B tiene licencia Apache 2.0, por lo que no hay restricciones evidentes.
- El modelo no incluye pesos descargables (tamaño 0.0 GB), lo que indica que quizá el repositorio está incompleto o en proceso de publicación.

## Enlaces

- [Hugging Face del modelo](https://huggingface.co/bunnycore/LMF-2.5-2.6B-Qwen3.8-Distilled)
- [Hugging Face del modelo base](https://huggingface.co/LiquidAI/LFM2.5-2.6B)
- [Blog de Liquid AI sobre LFM2.5-2.6B](https://www.liquid.ai/blog/lfm2-5-2-6b)
- [Página de modelos de Liquid AI](https://www.liquid.ai/models)
- [Perfil del autor en Hugging Face](https://huggingface.co/bunnycore/models)

# Poyo514/functiongemma_finetune

## Resumen

El modelo `functiongemma_finetune`, desarrollado por Poyo514, es un fine-tuning del modelo FunctionGemma de Google, convertido a formato GGUF mediante Unsloth. Está orientado a tareas de tool calling (llamadas a funciones) y agentes conversacionales, aprovechando la arquitectura Gemma 3 text. Con 268.098.176 parámetros y una cuantización Q8_0, se trata de un modelo extremadamente ligero, pensado para ejecución en CPU o en GPUs con recursos limitados. Su relevancia reside en ofrecer una alternativa compacta y desplegable a través de llama.cpp para aplicaciones de función. No se dispone de información sobre la longitud de contexto, los idiomas soportados ni la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 text (transformer) |
| Parametros totales | 268.098.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (archivo `functiongemma-270m-it.Q8_0.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3 text de Google, un transformer optimizado para instrucciones y conversación, con capacidades de tool calling. El autor indica que se realizó un fine-tuning y una conversión a GGUF usando Unsloth, una librería de optimización para entrenamiento y cuantización de LLMs. Según el autor, el entrenamiento fue 2 veces más rápido gracias a Unsloth. También se ajustó el comportamiento del token BOS para garantizar compatibilidad con GGUF. No se proporcionan datos sobre el dataset empleado, el número de tokens de entrenamiento ni técnicas como RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de instrucciones, derivada de la familia FunctionGemma.
- Soporte de tool calling / function calling, orientado a la integración con APIs y herramientas externas.
- Despliegue en entornos con restricciones de memoria gracias a su pequeño tamaño y a la cuantización Q8_0.
- Compatibilidad con el motor de inferencia llama.cpp y sus clientes (`llama-cli`, `llama-mtmd-cli`).
- Uso de plantillas Jinja para la generación de respuestas (`--jinja`).
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistentes conversacionales en tiempo real: al tratarse de un modelo de 270M, puede desplegarse en un servidor ligero o en dispositivos de borde, gestionando conversaciones sencillas con llamadas a funciones.
- Prototipado rápido de agentes: gracias a su formato GGUF, se integra fácilmente en scripts con llama.cpp, permitiendo probar flujos de tool calling sin necesidad de infraestructura grande.
- Docencia e investigación: los investigadores pueden utilizar este modelo para estudiar el comportamiento de modelos pequeños en tareas de función, especialmente en entornos de fine-tuning docente.
- Integración en pipelines CI/CD: el modelo puede ejecutarse en pruebas automatizadas para validar respuestas de herramientas sin costes elevados.
- Aplicaciones con recursos limitados: al estar cuantizado en Q8_0, puede ejecutarse en CPUs modernas sin GPU, ideal para entornos embebidos o máquinas virtuales ligeras.
- Distilación de modelos grandes: el autor probablemente entrenó este modelo para replicar un flujo de tool calling concreto, por lo que puede usarse como base para experimentos de destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. En el modelo card no se incluyen métricas, y la búsqueda web no aporta referencias. Por tanto, no se puede evaluar su rendimiento comparativo.

## Requisitos de hardware

- VRAM estimada: no disponible. El peso del archivo Q8_0 es de aproximadamente 0.3 GB, lo que sugiere que el modelo podría ejecutarse con menos de 1 GB de VRAM, aunque no hay datos oficiales.
- GPU recomendadas: no disponibles. Al ser tan pequeño, bastarían GPUs de consumo como una RTX 3050 o inferiores, e incluso CPUs con instrucciones AVX2.
- Cabe en GPU de consumo: sí, por tamaño, pero no hay confirmación oficial.
- Opciones de despliegue: llama.cpp y sus variantes (`llama-cli`, `llama-mtmd-cli`), así como cualquier framework compatible con GGUF (Ollama, llama.cpp server, etc.).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas. Se puede señalar que pertenece a la familia FunctionGemma de Google (que incluye versiones de 270M, 1B, 4B, 12B y 27B), pero no hay datos de rendimiento ni de licencia. Por tanto, la comparación con otros modelos de la misma categoría es no disponible.

## Limitaciones y advertencias

- Al no disponer de licencia, se desconoce si el uso comercial está permitido. Debe verificarse antes de desplegar en producción.
- No se definen limitaciones de contexto ni idiomas soportados; se recomienda probar antes de usarlo en aplicaciones multilingües.
- El modelo es un fine-tuning pequeño (270M), por lo que es probable que su capacidad de razonamiento complejo sea limitada en comparación con modelos más grandes.
- Con 0 descargas y 0 likes en HuggingFace, el modelo parece no validado por la comunidad; se desconoce su solidez en producción.
- El autor ajustó el token BOS para compatibilidad con GGUF, lo que puede afectar a la generación si no se usa la plantilla adecuada (`--jinja`).
- La información de la model card es mínima; no se detallan sesgos ni riesgos de alucinación.

## Enlaces

- https://huggingface.co/Poyo514/functiongemma_finetune
- https://github.com/unslothai/unsloth
- https://ai.google.dev/gemma/docs/functiongemma/finetuning-with-functiongemma

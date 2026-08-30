# agentic-ptb/opus-high-v3.h034.sft-mix1.step_16

## Resumen

El modelo `agentic-ptb/opus-high-v3.h034.sft-mix1.step_16` es un checkpoint intermedio derivado del proyecto AgentPTB, concretamente de la ejecución `opus-high-v3` realizada mediante Claude Code. Lo publica el usuario `agentic-ptb` y se basa en el modelo `Qwen/Qwen3.5-9B-Base`, con un total de 9.409.813.744 parámetros. Su licencia es Apache-2.0.

Este checkpoint tiene un rol explícitamente marcado como `intermediate` y se retiene con fines de reproducibilidad y estudio cualitativo. La propia model card advierte que la ejecución no encontró ninguna mejora en los pesos entrenados, por lo que no debe inferirse calidad a partir de su publicación. Es un artefacto de investigación más que un modelo listo para uso práctico.

Su relevancia radica en que forma parte de un esfuerzo sistemático por documentar resultados negativos en el ajuste fino de modelos de lenguaje, algo poco común y valioso para la comunidad. No obstante, carece de documentación sobre capacidades, benchmarks o especificaciones de contexto, lo que limita su uso directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Al tratarse de un fine-tune de `Qwen/Qwen3.5-9B-Base`, la arquitectura subyacente corresponde a la de dicho modelo base, aunque no se proporcionan detalles específicos sobre su diseño interno (número de capas, atención, etc.). El checkpoint se generó mediante un proceso de ajuste fino supervisado (SFT) dentro del pipeline AgentPTB, en la ejecución `opus-high-v3` durante la hora `h034`.

El dataset de entrenamiento no se detalla en la información disponible, pero el run se describe como `sft-mix1`, lo que sugiere una mezcla de datos para el ajuste. La model card indica explícitamente que el run no produjo mejoras en los pesos entrenados, por lo que este checkpoint representa un resultado negativo documentado para reproducibilidad y análisis cualitativo. No se mencionan técnicas como RLHF, DPO ni otras innovaciones de entrenamiento.

## Capacidades

No se han documentado capacidades específicas para este checkpoint más allá de las que pudiera heredar del modelo base `Qwen/Qwen3.5-9B-Base`. La información proporcionada no incluye detalles sobre:

- Generacion de texto, razonamiento, codigo o matematicas
- Soporte de tool calling o function calling
- Capacidades de agentes o razonamiento multi-paso
- Capacidades multilingues
- Modos especiales (thinking, vision, audio, etc.)

Dado que la model card lo califica como un checkpoint intermedio sin mejoras, no se recomienda inferir capacidades adicionales. Para conocer las capacidades reales habria que consultar la documentacion del modelo base.

## Casos de uso

Dada su naturaleza de checkpoint intermedio con resultados negativos, no es adecuado para aplicaciones practicas en produccion. Los casos de uso razonables son:

- Reproducibilidad de experimentos: permite a otros investigadores reproducir exactamente el punto de entrenamiento en el paso 16 de la ejecucion `opus-high-v3` y verificar los resultados negativos reportados.
- Estudio cualitativo de fallos: sirve para analizar por que el ajuste fino no mejoro los pesos, identificando posibles problemas en el dataset, la tasa de aprendizaje o la arquitectura.
- Comparacion de trayectorias de entrenamiento: al estar disponible junto a otros checkpoints del mismo run, permite estudiar la evolucion de las metricas a lo largo del tiempo.
- Investigacion sobre resultados negativos: contribuye a la literatura sobre cuando y por que el ajuste fino falla, algo util para disenar mejores estrategias de entrenamiento.
- Validacion de pipelines de entrenamiento: puede usarse como punto de control para depurar el pipeline AgentPTB antes de lanzar ejecuciones mas costosas.
- Educacion y formacion: sirve como ejemplo concreto de un checkpoint intermedio con advertencias claras sobre su calidad, util para ensenar buenas practicas en la publicacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de rendimiento ni comparacion con otros modelos. Dado que el run se reporta como sin mejoras, no se esperan resultados destacables.

## Requisitos de hardware

No se proporcionan requisitos de hardware especificos para este checkpoint. Dado que tiene 9.409.813.744 parametros, se puede estimar de forma orientativa:

- VRAM estimada para inferencia: aproximadamente 19-20 GB en FP16, o unos 10 GB en cuantizacion de 4 bits (si se generaran los archivos GGUF correspondientes, que no estan disponibles).
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (como RTX 3090, RTX 4090 o A100) para FP16 sin cuantizar. Con cuantizacion de 4 bits podria caber en GPUs de 12-16 GB, pero no se ofrecen dichos formatos.
- Opciones de despliegue: al no existir versiones cuantizadas ni documentacion de inferencia, las opciones habituales (vLLM, llama.cpp, Ollama, TGI) no estan garantizadas. Habria que convertir los pesos manualmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos similares. El checkpoint es un artefacto intermedio de un run especifico, no un modelo final con rendimiento publicado. Modelos comparables en tamano, como otros fine-tunes de Qwen3.5-9B, no aparecen en la informacion proporcionada. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Resultados negativos: la model card advierte explicitamente que el run no encontro mejoras en los pesos entrenados. No debe usarse como modelo de produccion ni esperarse un rendimiento util.
- Sesgos y alucinaciones: no hay informacion sobre sesgos especificos, pero al heredar la base de Qwen, podria arrastrar sesgos del modelo original. No se han realizado evaluaciones de seguridad.
- Limitaciones de contexto e idioma: se desconocen la longitud de contexto y los idiomas soportados. No se recomienda asumir capacidades multilingues.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero dado el estado del modelo, su uso comercial no tiene sentido practico.
- Caveat de reproducibilidad: el checkpoint se publica para reproducibilidad, no para inferencia. Cualquier uso fuera de investigacion debe considerar que no ha sido validado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h034.sft-mix1.step_16
- Dataset asociado: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Indice de datasets del proyecto: https://huggingface.co/datasets/agentic-ptb/INDEX

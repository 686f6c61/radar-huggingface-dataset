# opticalmouse/Qwen3.5-2B-ToolCalling-LoRA

## Resumen

Qwen3.5-2B-ToolCalling-LoRA es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario opticalmouse en Hugging Face, diseñado para dotar de capacidades de tool calling a un modelo base Qwen3.5 de 2B parámetros. El repositorio contiene únicamente los pesos del adaptador (0,3 GB), no el modelo completo, y está etiquetado con la librería `unsloth`, lo que indica que el entrenamiento se realizó con el framework Unsloth, orientado a fine-tuning eficiente en memoria.

La relevancia de esta ficha es limitada por la escasez de documentación: la model card es la plantilla automática de Hugging Face sin rellenar, sin pipeline declarado, sin licencia especificada, sin idiomas declarados y sin resultados de evaluación. El autor no ha publicado información sobre el dataset de entrenamiento, hiperparámetros, procedencia del modelo base ni métricas de rendimiento.

Se trata, por tanto, de un artefacto experimental de fine-tuning más que de un modelo listo para producción. Cualquier evaluador debe tratarlo con cautela: la información disponible permite describir el formato y el propósito declarado (tool calling sobre Qwen3.5-2B), pero no validar su calidad, sus capacidades reales ni sus condiciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre un modelo base Qwen3.5 de 2B (arquitectura del base no detallada en la informacion disponible) |
| Parametros totales | No disponible (el adaptador ocupa 0,3 GB; el modelo base es de 2B según el nombre del repositorio) |
| Parametros activos | No aplica (no es MoE según la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato de pesos safetensors, compatible con cuantizacion posterior del modelo fusionado) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El repositorio contiene un adaptador LoRA entrenado con Unsloth sobre un modelo base Qwen3.5 de 2B parámetros. LoRA congela los pesos del modelo base e inserta matrices de bajo rango en determinadas capas, de modo que el adaptador resultante es mucho más pequeño que el modelo completo (0,3 GB en este caso) y debe cargarse junto al base para la inferencia. La etiqueta `unsloth` sugiere el uso de kernels optimizados para reducir el consumo de VRAM durante el entrenamiento.

No se dispone de información sobre el dataset de entrenamiento (número de tokens, composición, proporción de ejemplos de tool calling), la técnica de alineación empleada (SFT, DPO, RLHF) ni los hiperparámetros del fine-tuning. Tampoco se documenta si se aplicaron técnicas adicionales como decodificación especulativa o atención lineal. La model card no incluye ninguna sección técnica rellenada.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-2B, aunque no verificadas ni documentadas por el autor.
- Tool calling / function calling: propósito declarado del fine-tuning según el nombre del repositorio; sin ejemplos, esquemas ni métricas que lo confirmen.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.
- Integración con ecosistema transformers: sí, mediante carga del adaptador LoRA sobre el modelo base.

## Casos de uso

- Experimentación con fine-tuning de tool calling: el adaptador sirve como referencia para reproducir un pipeline de LoRA con Unsloth sobre un modelo de 2B, útil para investigadores que quieran validar la técnica antes de escalar a modelos mayores.
- Prototipado de asistentes con llamadas a funciones: en un entorno controlado, el adaptador podría probarse para generar llamadas estructuradas a APIs, aunque sin benchmarks publicados la fiabilidad es desconocida y requiere evaluación propia.
- Investigación sobre adaptadores ligeros: el tamaño reducido (0,3 GB) permite estudiar el efecto del fine-tuning LoRA en tareas de tool calling sin necesidad de GPU de gran capacidad.
- Evaluación comparativa de adaptadores: puede emplearse como punto de partida en estudios que comparen distintos adaptadores LoRA para la misma tarea sobre el mismo modelo base.
- Docencia y formación: ejemplo práctico de cómo se publica un adaptador LoRA en Hugging Face y de las carencias habituales en documentación de modelos experimentales.
- Integración en pipelines de CI para pruebas de regresión: si se valida previamente, podría usarse para comprobar que el modelo base sigue respondiendo a llamadas de herramientas tras actualizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; como referencia, un modelo base de 2B en fp16 requiere aproximadamente 4-5 GB de VRAM, y en cuantización de 4 bits alrededor de 1,5-2 GB, a lo que se suma el adaptador (0,3 GB).
- GPU recomendadas: no documentadas por el autor; por tamaño, una RTX 3060 de 12 GB o superior debería bastar para el modelo fusionado en fp16, y GPUs con 8 GB para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: probablemente sí, en modelos como RTX 3060, RTX 4060 Ti, RTX 4070 o superiores, aunque no está verificado.
- Opciones de despliegue: transformers (librería declarada); el adaptador puede fusionarse con el base y exportarse a GGUF para llama.cpp u Ollama, o servirse con vLLM o TGI tras la fusión, aunque ninguna de estas rutas está documentada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Documentacion |
|---|---|---|---|---|---|
| opticalmouse/Qwen3.5-2B-ToolCalling-LoRA | 2B (base) + adaptador | No disponible | No disponible | Safetensors (LoRA) | Plantilla sin rellenar |
| Qwen2.5-1.5B-Instruct (referencia de la familia Qwen) | 1,5B | 32K (según documentación pública de Qwen) | Apache 2.0 (según documentación pública) | Safetensors, GGUF | Model card completa |
| Adaptadores LoRA de tool calling en el Hub | Variable | Variable | Variable | Safetensors | Variable, a menudo escasa |

La comparación con alternativas concretas no es posible con rigor porque no se dispone de datos del modelo base Qwen3.5-2B ni del adaptador. La tabla anterior solo ilustra el contraste de documentación con modelos de la familia Qwen ampliamente documentados.

## Limitaciones y advertencias

- Model card sin rellenar: no hay información sobre sesgos, datos de entrenamiento, evaluación ni uso previsto.
- Licencia no especificada: no se puede garantizar el uso comercial; además, la licencia del adaptador podría estar condicionada por la del modelo base Qwen3.5, que tampoco se documenta.
- Sin benchmarks: no hay evidencia de que el tool calling funcione correctamente ni de su tasa de acierto.
- Riesgo de alucinación: inherente a los modelos de 2B y no evaluado en este adaptador.
- Idiomas no declarados: se desconoce el soporte multilingüe real.
- Sin información sobre el modelo base: no se puede verificar qué versión de Qwen3.5 se usó, su contexto máximo ni sus restricciones.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Para producción: requiere evaluación propia exhaustiva antes de cualquier despliegue; no debe asumirse que el adaptador mejora el tool calling sin pruebas controladas.

## Enlaces

- Hugging Face: https://huggingface.co/opticalmouse/Qwen3.5-2B-ToolCalling-LoRA
- Unsloth (framework de entrenamiento citado en las etiquetas): https://github.com/unslothai/unsloth
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental (ML CO2 Impact): https://mlco2.github.io/impact

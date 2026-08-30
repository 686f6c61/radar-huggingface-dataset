# agentic-ptb/opus-high-v3.h017.sft-v6.step_32

## Resumen

`opus-high-v3.h017.sft-v6.step_32` es un checkpoint intermedio publicado por el usuario `agentic-ptb` dentro del proyecto AgentPTB, concretamente del run de Claude Code denominado `opus-high-v3`. Se trata de un checkpoint derivado del modelo base Qwen/Qwen3.5-9B-Base, con 9.409.813.744 parámetros y licencia Apache 2.0. El propio autor lo etiqueta como `negative-results` y advierte explícitamente en la model card que el run no encontró ninguna mejora en los pesos entrenados, por lo que no debe inferirse calidad de su publicación.

Este modelo no es un producto final ni una alternativa a los modelos disponibles comercialmente. Su propósito declarado es la reproducibilidad y el estudio cualitativo de dinámicas de entrenamiento fallidas. La relevancia actual es limitada: puede interesar a investigadores que estudian por qué ciertos pipelines de SFT no convergen o regresan, pero no a desarrolladores que buscan un modelo utilizable en producción. No se dispone de información sobre arquitectura interna, contexto, idiomas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo, pero al estar basado en Qwen/Qwen3.5-9B-Base se asume una arquitectura transformer densa similar a la familia Qwen3.5, aunque no se confirma. El checkpoint corresponde al paso 32 de un run de SFT denominado `sft-v6` dentro del proyecto `opus-high-v3`. El run fue ejecutado mediante Claude Code y el propio autor lo clasifica como resultado negativo: no se observo ninguna mejora en los pesos entrenados respecto al modelo base. No se proporcionan datos sobre el dataset, el numero de tokens de entrenamiento ni tecnicas como RLHF o DPO.

Es importante senalar que este checkpoint es intermedio y derivado, retenido unicamente para reproducibilidad. El run `opus-high-v3` no produjo un modelo mejorado, y segun la informacion del indice del proyecto, otros runs similares (como `opus-high-v2`) tambien regresaron a los tensores del modelo base tras fallar sus runs de SFT.

## Capacidades

No se dispone de informacion especifica sobre las capacidades de este checkpoint. Al derivar de Qwen3.5-9B-Base, podria heredar capacidades genericas de un modelo base de 9B parametros (generacion de texto, razonamiento basico, posiblemente algo de codigo), pero dado que el run no produjo mejoras, no se puede afirmar nada concreto. La model card no menciona tool calling, agentes, vision, audio ni capacidades multilingues especificas.

La unica capacidad confirmada es la de servir como referencia para estudios de reproducibilidad de entrenamientos fallidos.

## Casos de uso

Dado el caracter de resultado negativo, los casos de uso son muy limitados y orientados a investigacion:

- Estudio de dinamicas de entrenamiento fallidas: analizar por que un pipeline de SFT no logra mejorar los pesos, comparando este checkpoint con el modelo base y con otros checkpoints intermedios del mismo run.
- Reproducibilidad cientifica: verificar si los resultados negativos son consistentes al re-ejecutar el experimento, siguiendo las practicas de publicacion de resultados negativos.
- Analisis de regresion de pesos: examinar en que paso concreto el entrenamiento dejo de mejorar o empeoro, utilizando este checkpoint como punto de referencia temporal.
- Comparacion de estrategias de SFT: contrastar este run con otros runs de la familia `opus-high-v3` para identificar factores que llevan a la falta de convergencia.
- Investigacion sobre metaprompts y agentes de codigo: estudiar como Claude Code ejecuta pipelines de entrenamiento y donde falla, dado que el run fue orquestado por un agente.
- Docencia en ML: usar este checkpoint como ejemplo de publicacion de resultados negativos en un curso de formacion sobre experimentacion rigurosa.

No se recomienda ningun caso de uso en produccion, dado que el propio autor advierte que no debe inferirse calidad de esta publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otros tests estandar. Al ser un checkpoint intermedio sin mejoras, no se puede comparar su rendimiento con otros modelos.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. Como referencia orientativa, un modelo de 9.409.813.744 parametros en precision fp16 ocupa aproximadamente 18,8 GB de memoria (coincidente con el tamano del repositorio). Para inferencia:

- VRAM estimada: al menos 20 GB para fp16 sin cuantizacion; con cuantizacion de 4 bits podria reducirse a unos 5-6 GB, pero no se confirma ningun formato cuantizado.
- GPU recomendadas: una RTX 3090 o RTX 4090 de 24 GB podria cargar los pesos en fp16; una A100 o H100 seria suficiente sin problemas.
- En consumer GPU: posible en tarjetas de 24 GB o mas, pero sin cuantizaciones confirmadas no se puede garantizar.
- Opciones de despliegue: al no haber formato GGUF ni soporte confirmado en vLLM u Ollama, el despliegue se limitaria a cargar los safetensors con transformers o similares.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se encuentran modelos comparables en la misma categoria, dado que este checkpoint es un artefacto de investigacion con resultados negativos, no un modelo de proposito general. La unica comparacion relevante seria con su modelo base Qwen/Qwen3.5-9B-Base, pero no se dispone de datos de rendimiento de ninguno de los dos en esta publicacion.

## Limitaciones y advertencias

- Resultado negativo confirmado: el run no encontro ninguna mejora en los pesos entrenados, por lo que este checkpoint no ofrece ventaja sobre el modelo base y puede incluso ser peor.
- No apto para produccion: no debe utilizarse en aplicaciones reales, ya que no hay garantia de calidad ni de comportamiento.
- Informacion incompleta: no se conocen la arquitectura exacta, el contexto, los idiomas ni las capacidades especificas.
- Posibles sesgos heredados: al derivar de Qwen3.5-9B-Base, puede arrastrar sesgos del modelo base, pero no hay estudios disponibles.
- Riesgo de alucinacion: sin benchmarks ni evaluaciones, no se puede estimar la tasa de alucinacion.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no es utilizable para ese fin por su naturaleza de resultado negativo.
- Confusion potencial: el nombre `opus-high-v3` podria inducir a pensar que esta relacionado con Claude Opus de Anthropic, pero no hay ninguna conexion; es solo el nombre interno del run de AgentPTB.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h017.sft-v6.step_32
- Dataset asociado: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Indice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX

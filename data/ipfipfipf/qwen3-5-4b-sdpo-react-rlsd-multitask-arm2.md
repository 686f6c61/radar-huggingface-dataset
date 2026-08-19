# ipfipfipf/Qwen3.5-4B-sdpo-react-rlsd-multitask-arm2

## Resumen

El modelo `ipfipfipf/Qwen3.5-4B-sdpo-react-rlsd-multitask-arm2` es un fine-tuning del modelo base Qwen/Qwen3.5-4B-Base, publicado por el usuario de HuggingFace ipfipfipf. El nombre del repositorio sugiere la aplicación de técnicas de entrenamiento como SDPO (Sequence-level Direct Preference Optimization), ReAct (razonamiento y actuación), RLSD (Reinforcement Learning with Self-Distillation) y entrenamiento multitarea, probablemente orientado a entornos de agentes. El modelo base Qwen3.5-4B es un modelo causal de lenguaje con encoder de visión, que emplea una arquitectura híbrida con Gated DeltaNet y Gated Attention, con una longitud de contexto nativa de 262.144 tokens extensible a más de un millón. Este fine-tuning hereda las capacidades multimodales y de razonamiento del base, y añade un ajuste específico para tareas de agente y razonamiento multi-step. No se dispone de información detallada sobre el proceso de fine-tuning ni de benchmarks específicos, pero el modelo está disponible bajo licencia Apache 2.0 y en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con vision encoder; hibrida Gated DeltaNet + Gated Attention (segun modelo base) |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1.010.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el base declara 201 idiomas, pero no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura hibrida que combina Gated DeltaNet (atencion lineal) y Gated Attention (atencion completa) en un layout de 8 bloques, cada uno con 3 capas de Gated DeltaNet + FFN y 1 capa de Gated Attention + FFN. Tiene 32 capas, dimension oculta de 2560, y la salida LM esta atada al embedding. El contexto nativo es de 262.144 tokens, extensible a mas de un millon mediante tecnicas de extrapolacion.

El fine-tuning, segun el nombre del repositorio, aplica SDPO, ReAct, RLSD y entrenamiento multitarea, posiblemente orientado a entornos de agentes (la etiqueta "arm2" podria referirse a un benchmark o entorno especifico). No se dispone de informacion detallada sobre el dataset, el numero de tokens de entrenamiento ni los hiperparametros del fine-tuning.

## Capacidades

- Generacion de texto y razonamiento multi-step, potencialmente reforzado por el entrenamiento ReAct.
- Comprension de imagenes (el modelo base es multimodal image-text-to-text).
- Soporte de tool calling y ejecucion de acciones en entornos de agentes (por el entrenamiento multitarea y RLSD, segun la nomenclatura).
- Multilingue (el base declara 201 idiomas, aunque no se confirma para este fine-tuning).
- Contexto largo nativo de 262K tokens, adecuado para tareas que requieren memoria extensa.

## Casos de uso

- Agentes autonomos que necesitan razonar y actuar en entornos simulados (por el entrenamiento ReAct y RLSD).
- Asistentes conversacionales con memoria de contexto largo (262K tokens).
- Sistemas de pregunta-respuesta visual que combinan imagenes y texto.
- Automatizacion de tareas que requieren planificacion multi-step y uso de herramientas.
- Analisis de documentos extensos con contexto de hasta 1M tokens.
- Prototipado de aplicaciones de IA multimodal en entornos de produccion con licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este fine-tuning. Los datos de la model card corresponden al modelo base Qwen3.5-4B, que obtiene, por ejemplo, 79.1 en MMLU-Pro y 91.4 en MMLU-Redux, pero no son atribuibles a este ajuste.

## Requisitos de hardware

- VRAM estimada: ~8,4 GB en FP16 (tamano del repo), ~4,2 GB en FP8, ~2,1 GB en cuantizacion 4-bit.
- GPU recomendadas: RTX 4090 (24 GB) para FP16; GPUs con 8-12 GB para cuantizacion 4-bit.
- Compatible con GPUs de consumo en cuantizacion.
- Opciones de despliegue: vLLM, SGLang, KTransformers, Transformers (segun la model card del base).
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos de 4B en la informacion proporcionada. Se puede comparar con el base Qwen3.5-4B y con otros modelos de tamano similar como Llama-3.2-3B o Qwen3-4B, pero sin datos concretos.

## Limitaciones y advertencias

- No hay informacion publica sobre el proceso de fine-tuning ni sobre la calidad del modelo ajustado.
- El riesgo de alucinacion no esta evaluado para este fine-tuning.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los terminos del modelo base.
- El modelo puede heredar sesgos del base, no mitigados por el fine-tuning.
- Para produccion, se recomienda evaluar el modelo en las tareas especificas antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ipfipfipf/Qwen3.5-4B-sdpo-react-rlsd-multitask-arm2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5

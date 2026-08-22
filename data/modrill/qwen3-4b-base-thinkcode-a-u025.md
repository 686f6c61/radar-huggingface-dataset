# modrill/Qwen3-4B-Base-ThinkCode-A-U025

## Resumen

Este repositorio contiene un adaptador PEFT LoRA para el modelo base Qwen3-4B-Base, desarrollado por el usuario modrill. El adaptador, denominado `A-U025`, es un brazo de escala uniforme de la fase A de un proyecto de ajuste fino orientado a código y razonamiento. Aplica una escala de 0.25 a todos los tensores B de la LoRA (incluido el adaptador de `lm_head`), manteniendo los tensores A sin cambios, con `lora_alpha=128` y `r=64` sobre 253 módulos adaptados. El tamaño del repositorio es de 0.6 GB y no contiene los pesos del modelo base, que deben cargarse por separado.

El adaptador está diseñado para mejorar la generación de código y el razonamiento del modelo base, con un resultado de `pass@1` de 25.21% en un conjunto de desarrollo EvalScope Full1055 corregido (solo desarrollo, semilla 3407). No incluye pesos del modelo base y requiere cargar el Qwen3-4B-Base en una revisión fija. Es relevante para desarrolladores que buscan adaptadores ligeros para ajustar el comportamiento de un modelo de 4B parámetros sin modificar sus pesos originales, especialmente en tareas de programación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3-4B-Base |
| Parámetros totales | No disponible (el adaptador tiene `r=64`, `alpha=128`, 253 módulos, pero no se indica el número total de parámetros) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32K tokens (límite del modelo base fijo, según la model card) |
| Tipos de cuantización | No disponible (el adaptador se guarda en safetensors, sin especificar precisión de cuantización) |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero no se detalla en la información del adaptador) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es una LoRA estándar con `r=64` y `lora_alpha=128`, aplicada a 253 módulos del modelo base Qwen3-4B-Base. Según la model card, los tensores `B` de cada módulo se multiplican por 0.25 en FP32, mientras que los tensores `A` no se modifican. La representación estándar PEFT incluye el factor de escala de la cabeza de salida como factores transponidos de `embed_tokens` y usa `ensure_weight_tying=true` para compartir el adaptador con la capa de salida atada, replicando los efectos de entrada y salida sin almacenar tensores de la capa base.

No se proporcionan detalles sobre el proceso de entrenamiento: ni el dataset, el número de tokens, la composición de los datos, ni si se usó RLHF o DPO. La model card solo indica que proviene de la línea de escalado de delta de la fase A y que no incluye experimentos posteriores de la ruta NEXTGEN.

## Capacidades

- Generación de código: el adaptador está diseñado para mejorar la generación de código, con un `pass@1` de 25.21% en un conjunto de desarrollo de EvalScope Full1055 corregido.
- Razonamiento explícito: la plantilla de chat del modelo base soporta `enable_thinking`; se puede activar para generar razonamiento explícito o desactivar para una generación de código directa.
- Chat y generación de texto: mediante la plantilla de chat de Qwen3, puede usarse para conversaciones multi-turno y generación de texto general.
- Integración con PEFT: se carga como adaptador sobre el modelo base, permitiendo actualizaciones ligeras sin modificar los pesos originales.

No se mencionan capacidades de tool calling, visión, audio u otras funcionalidades especiales.

## Casos de uso

- **Generación de código en entornos de desarrollo**: el adaptador puede usarse para completar funciones, escribir scripts o generar fragmentos de código en lenguajes como Python, dado su enfoque en código y el benchmark `pass@1` en tareas de generación. Se integra mediante `transformers` y `peft` sobre el modelo base.
- **Asistente de depuración**: con la capacidad de razonamiento explícito, se puede usar para analizar errores de código y proponer correcciones, activando el modo `enable_thinking` para obtener explicaciones intermedias.
- **Generación de documentación técnica**: a partir de código fuente, el modelo puede generar comentarios, docstrings o documentación de funciones, aprovechando su entrenamiento en código y texto.
- **Automatización de tareas de programación**: integración en pipelines de CI/CD para generar pruebas unitarias o verificar sintaxis, aunque se requiere validación independiente de la salida.
- **Investigación en adaptadores LoRA**: sirve como caso de estudio para analizar el efecto de escalar los tensores B en el rendimiento de código, útil para investigadores que estudian técnicas de adaptación eficiente.
- **Prototipado de asistentes de código**: puede usarse como base para construir un asistente de programación local, combinado con el modelo base y herramientas de inferencia.

## Benchmarks y rendimiento

Se ha publicado un único resultado de benchmark en la model card:

| Tarea | Dataset | Métrica | Resultado |
|---|---|---|---|
| Generación de código | EvalScope Full1055 corregido (solo desarrollo) | `pass@1` (seed 3407) | 25.21% |

El resultado es un valor de desarrollo de una sola semilla, no una confirmación formal ni una estimación con conjunto de retención. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

No se especifican requisitos de hardware en la información proporcionada. El adaptador es ligero (0.6 GB), pero requiere cargar el modelo base Qwen3-4B-Base, que tiene aproximadamente 4.000 millones de parámetros. En la práctica, la VRAM estimada para el modelo base sería:

- Con cuantización de 4 bits (por ejemplo, con `bitsandbytes`): aproximadamente 2.5-3 GB.
- Con cuantización de 8 bits: aproximadamente 4-5 GB.
- En FP16: aproximadamente 8 GB.

Estas cifras son estimaciones generales para modelos de 4B y no provienen de la información del adaptador. Se recomienda una GPU con al menos 8 GB de VRAM para trabajar en FP16, y una GPU con 6 GB para cuantizaciones ligeras. El adaptador se carga con `transformers` y `peft`; no se mencionan opciones de despliegue como vLLM o llama.cpp en la documentación.

## Comparativa con modelos similares

No se dispone de información comparativa con otros adaptadores o modelos de la misma categoría. La model card no incluye resultados comparativos con el modelo base sin adaptador ni con otras variantes. Por tanto, no se puede establecer una comparativa objetiva.

## Limitaciones y advertencias

- El adaptador requiere el modelo base exacto `Qwen/Qwen3-4B-Base` en la revisión `906bfd4b4dc7f14ee4320094d8b41684abff8539`; no puede cargarse solo.
- El resultado de `pass@1` es de un conjunto de desarrollo de una sola semilla; no es una evaluación formal ni de conjunto de retención.
- El código generado puede ser incorrecto, inseguro o no compilar; debe verificarse y probarse de forma independiente en un entorno aislado.
- No se proporciona certificación de seguridad, protección o idoneidad para producción.
- La licencia Apache-2.0 se hereda del modelo base, pero el usuario debe verificar de forma independiente la licencia upstream de Qwen3, los avisos, los términos de datos de entrenamiento y su aplicabilidad al caso de uso.

## Enlaces

- [Adaptador en Hugging Face](https://huggingface.co/modrill/Qwen3-4B-Base-ThinkCode-A-U025)
- [Modelo base Qwen3-4B-Base](https://huggingface.co/Qwen/Qwen3-4B-Base)
- [Repositorio oficial de Qwen3 (GitHub)](https://github.com/QwenLM/Qwen3)
- [Información de Qwen3-4B-Base en Together AI](https://www.together.ai/models/qwen3-4b-base)

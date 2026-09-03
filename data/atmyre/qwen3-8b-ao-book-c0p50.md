# Atmyre/qwen3-8b-ao-book-c0p50

## Resumen

El modelo `Atmyre/qwen3-8b-ao-book-c0p50` es un adaptador LoRA (PEFT) que implementa un *Activation Oracle* (AO) para el concepto `book` con una concentración de 0.50, desarrollado por Atmyre. Se basa en el trabajo de Karvonen et al. (2025) sobre *Activation Oracles*, que entrena modelos para explicar las activaciones internas de otro modelo. En este caso, el AO se ha fine-tuneado para que su modelo padre (Qwen3-8B) coincida con un sujeto específico: un fine-tune "taboo" del mismo modelo con el concepto `book` y la misma concentración. El objetivo es permitir la interpretación de las representaciones internas del modelo cuando ha sido modificado con un concepto concreto.

Este adaptador es relevante en el campo de la interpretabilidad de modelos de lenguaje, ya que proporciona una herramienta para analizar cómo se codifican conceptos específicos en las activaciones de un transformer. Al ser un adaptador LoRA, se puede cargar sobre el modelo base Qwen3-8B sin necesidad de reentrenar el modelo completo. El repositorio tiene un tamaño de 0.7 GB y está publicado bajo licencia MIT. No se dispone de información sobre la longitud de contexto, idiomas soportados ni cuantizaciones, ya que la model card no los especifica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre Qwen3-8B (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador LoRA tiene un número reducido, pero no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B, pero no se indica) |
| Tipos de cuantizacion | no disponible (los pesos están en safetensors, sin cuantización declarada) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se integra en el modelo base Qwen3-8B mediante la librería PEFT. Según la model card, se trata de un *fine-tuned Activation Oracle* (FT-AO): parte del AO base (`Atmyre/qwen3-8b-ao-base`) y se fine-tunea para que su modelo padre coincida con el sujeto que interpretará, en este caso `Atmyre/qwen3-8b-taboo-book-c0p50`, un fine-tune "taboo" con concentración 0.50. El método sigue la receta descrita en el paper *Activation Oracles* (arXiv:2512.15674), que entrena un modelo para predecir o explicar las activaciones de otro modelo. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni el uso de RLHF o DPO. La innovación principal es la aplicación de AO a un modelo fine-tuneado con un concepto específico, permitiendo estudiar cómo el fine-tuning afecta a las representaciones internas.

## Capacidades

- Interpretabilidad de activaciones: el adaptador está diseñado para explicar las activaciones internas de Qwen3-8B cuando este ha sido fine-tuneado con el concepto `book` (variante taboo cooperativa).
- Análisis de conceptos: permite identificar qué features o patrones internos corresponden al concepto `book` en el modelo sujeto.
- Compatibilidad con PEFT: se carga fácilmente con `PeftModel` sobre el modelo base, sin necesidad de modificar el modelo original.
- No es un modelo generativo independiente: requiere el modelo base para funcionar y no está pensado para generación de texto directa.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe específico.

## Casos de uso

- Investigación en interpretabilidad: permite a investigadores estudiar cómo se representa un concepto concreto (p. ej., `book`) en las activaciones de un modelo fine-tuneado, comparando con el modelo base.
- Análisis de fine-tuning: sirve para evaluar el impacto de un fine-tuning "taboo" (eliminación o modificación de un concepto) en las representaciones internas, usando el AO como sonda.
- Desarrollo de técnicas de explicabilidad: puede utilizarse como referencia para validar métodos de atribución de features o de localización de conceptos en transformers.
- Verificación de hipótesis sobre mecanismos internos: los investigadores pueden comprobar si ciertos circuitos o direcciones en el espacio de activaciones se activan ante el concepto `book`.
- Comparación de variantes de fine-tuning: al existir un sujeto "taboo" y una variante cooperativa, el AO permite comparar cómo cambian las activaciones entre ambas.
- Estudio de la transferibilidad de Activation Oracles: este modelo es un caso de uso para evaluar si un AO entrenado sobre un sujeto específico generaliza a otros contextos o conceptos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre Qwen3-8B, se necesita cargar el modelo base completo. En bfloat16, Qwen3-8B requiere aproximadamente 16 GB de VRAM, más el adaptador (0.7 GB) y overhead de activaciones. Se recomienda al menos 20 GB de VRAM para inferencia cómoda.
- GPU recomendadas: tarjetas con 24 GB o más, como RTX 3090/4090, A100 40GB, o H100. En GPUs con menos VRAM se podría usar cuantización del modelo base, pero no se especifica compatibilidad.
- En consumer GPU: es posible ejecutarlo en una RTX 4090 (24 GB) con el modelo base en bfloat16, siempre que se gestione bien la memoria.
- Opciones de despliegue: se puede usar con `transformers` + `peft` (como se muestra en la model card), o con servidores de inferencia que soporten LoRA, como vLLM o TGI, aunque no se ha verificado su compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Este adaptador es específico para un concepto y un sujeto concretos, por lo que no es directamente comparable con modelos generales de la misma categoría. Se podría comparar con el AO base (`Atmyre/qwen3-8b-ao-base`) o con el sujeto taboo, pero no se han publicado métricas comparativas.

## Limitaciones y advertencias

- Es un modelo de investigación, no está diseñado para uso en producción ni para tareas de generación de texto general.
- Depende del modelo base Qwen3-8B y del adaptador AO base; sin ellos, no funciona.
- No se han evaluado sesgos, alucinaciones ni comportamientos adversos. Al ser un modelo de interpretabilidad, su salida (explicaciones de activaciones) puede ser difícil de validar.
- La licencia MIT permite uso comercial, pero el propósito principal es académico y de investigación.
- No se especifican limitaciones de contexto ni de idioma; se asume que hereda las de Qwen3-8B, pero no está documentado.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo muy reciente o poco utilizado.

## Enlaces

- HuggingFace: https://huggingface.co/Atmyre/qwen3-8b-ao-book-c0p50
- Paper *Activation Oracles*: https://arxiv.org/abs/2512.15674
- Paper del estudio (arXiv:2607.23379): https://arxiv.org/abs/2607.23379
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Sujeto taboo (concentración 0.50): https://huggingface.co/Atmyre/qwen3-8b-taboo-book-c0p50
- AO base: https://huggingface.co/Atmyre/qwen3-8b-ao-base

# gyung/gdn2-cpt-rf-chkpt-tk4-fineweb

## Resumen

El modelo `gyung/gdn2-cpt-rf-chkpt-tk4-fineweb` es un checkpoint de continued pretraining (CPT) perteneciente a la serie unificada Long-GDN CPT, desarrollado por el autor `gyung`. Se basa en la arquitectura GDN-2 (Gated DeltaNet v2) con 370 millones de parámetros, e incorpora una variante denominada RF-MoE Checkpoint Chained Recurrence, que combina recurrencia encadenada con un mecanismo de mezcla de expertos. El checkpoint fue entrenado sobre 105 millones de tokens del dataset FineWeb, con un lote efectivo de 64 secuencias de 4096 tokens, durante 400 pasos.

Este modelo es relevante porque explora arquitecturas recurrentes modernas (Gated DeltaNet) aplicadas a la continuación de entrenamiento, con un enfoque en la comparación sistemática de diferentes configuraciones de recurrencia y mezcla de expertos. Aunque se trata de un checkpoint de investigación sin documentación extensa, su publicación contribuye al estudio de alternativas eficientes a los transformers tradicionales para el procesamiento de lenguaje natural.

La información disponible es limitada: no se especifican licencia, idiomas soportados, ni detalles sobre el dataset de entrenamiento más allá del nombre. El repositorio contiene únicamente el checkpoint en formato PyTorch (`.pth`) y un historial de entrenamiento en JSONL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GDN-2 (Gated DeltaNet v2) 370M + RF-MoE Checkpoint Chained Recurrence |
| Parametros totales | 370 millones |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pth`) |

## Arquitectura y entrenamiento

La arquitectura GDN-2 (Gated DeltaNet v2) es una variante de los modelos recurrentes basados en Gated DeltaNet, que combina mecanismos de atención lineal con puertas adaptativas para mejorar la eficiencia en el procesamiento de secuencias largas. En este checkpoint, se incorpora una capa de mezcla de expertos (MoE) con recurrencia encadenada (chained recurrence), lo que sugiere un diseño híbrido que alterna entre procesamiento recurrente y selección de expertos.

El entrenamiento consistió en una fase de continued pretraining sobre el dataset FineWeb, con un total de 105 millones de tokens (400 pasos × lote efectivo de 64 × 4096 tokens). Se utilizó un parámetro `target_k` de 4.0, aunque el valor final quedó fijado en 3.66. La pérdida de lenguaje final fue de 2.64 y la perplejidad (PPL) de 15.275. No se dispone de información sobre el uso de técnicas de alineación como RLHF o DPO, ni sobre la composición exacta del dataset de entrenamiento.

## Capacidades

No se han documentado capacidades específicas en la información proporcionada. Al tratarse de un checkpoint de investigación basado en una arquitectura de lenguaje, se presume que puede realizar generación de texto, pero no hay evidencia de soporte para tool calling, agentes, visión u otras funcionalidades avanzadas. La ausencia de documentación impide confirmar cualquier capacidad concreta.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Dado su carácter experimental y la falta de información sobre su rendimiento en tareas concretas, no es posible recomendar aplicaciones prácticas sin una validación previa. Se recomienda tratarlo como un artefacto de investigación para estudiar arquitecturas recurrentes y MoE, no como un modelo listo para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la perplejidad (PPL) de 15.275 y la pérdida de lenguaje de 2.64 durante el entrenamiento, pero no se comparan con otros modelos ni se evalúan en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. Dado que el modelo tiene 370 millones de parámetros y se distribuye en formato PyTorch, una estimación orientativa (sin confirmación del autor) sería:

- En FP16, el checkpoint ocuparía aproximadamente 740 MB de VRAM, por lo que podría ejecutarse en GPUs de consumo como una RTX 3060 (12 GB) o superior.
- En FP32, el tamaño sería de unos 1.48 GB, requiriendo al menos 4 GB de VRAM.
- No se dispone de cuantizaciones GGUF o similares, por lo que el despliegue con llama.cpp u Ollama no es directo.
- Para inferencia, se podría usar PyTorch directamente o frameworks como vLLM si se convierte el formato, pero no hay garantía de compatibilidad.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (arquitecturas recurrentes de ~370M con MoE). No se puede establecer una comparativa fiable sin datos de rendimiento o especificaciones adicionales.

## Limitaciones y advertencias

- No se especifica la licencia, por lo que el uso comercial o la redistribución están sujetos a incertidumbre legal.
- No se documentan sesgos ni riesgos de alucinación, pero al ser un modelo de investigación sin alineación explícita, es probable que presente comportamientos no deseados en entornos de producción.
- La falta de información sobre el dataset de entrenamiento (más allá del nombre FineWeb) impide evaluar posibles sesgos de contenido.
- El formato de pesos (`.pth`) no es directamente compatible con herramientas de inferencia optimizadas como vLLM o llama.cpp sin conversión previa.
- No se han publicado resultados de evaluación en tareas estándar, por lo que su rendimiento real es desconocido.

## Enlaces

- [HuggingFace - gyung/gdn2-cpt-rf-chkpt-tk4-fineweb](https://huggingface.co/gyung/gdn2-cpt-rf-chkpt-tk4-fineweb)
- [Dataset relacionado - gyung/gdn2-cpt-longdata-30k](https://huggingface.co/datasets/gyung/gdn2-cpt-longdata-30k)

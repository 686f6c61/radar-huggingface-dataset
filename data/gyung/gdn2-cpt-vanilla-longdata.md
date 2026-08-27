# gyung/gdn2-cpt-vanilla-longdata

## Resumen

El modelo `gyung/gdn2-cpt-vanilla-longdata` es un checkpoint de continuación de preentrenamiento (continued pretraining) sobre la arquitectura GDN-2 (Gated DeltaNet v2), desarrollado por el usuario `gyung`. Se trata de una variante "vanilla" dentro de la serie comparativa Long-GDN CPT, orientada a estudiar el comportamiento de la atención lineal con ventanas de contexto largas. El checkpoint se entrenó sobre 105 millones de tokens (400 pasos con un batch efectivo de 64 secuencias de 4096 tokens) y se publica con fines de investigación y experimentación.

La relevancia de este modelo radica en que GDN-2 es una arquitectura de atención lineal que separa las operaciones de borrado y escritura en el estado recurrente, lo que permite procesar secuencias largas con un coste computacional reducido frente a los transformers estándar. Este checkpoint concreto sirve como referencia para comparar distintas estrategias de entrenamiento continuo en el contexto de modelos pequeños (370M de parámetros), aunque no se aportan métricas de rendimiento ni documentación adicional en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GDN-2 (Gated DeltaNet v2) con 370M de parametros |
| Parametros totales | 370 millones (no se especifica el numero exacto) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se menciona 4096 tokens en el entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | checkpoint en formato PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo se basa en GDN-2 (Gated DeltaNet v2), una arquitectura de atención lineal desarrollada por NVIDIA (NVlabs) que desacopla las operaciones de borrado y escritura en el estado recurrente. Esta innovación mejora la capacidad de almacenamiento y recuperación de información en comparación con versiones anteriores de DeltaNet, manteniendo una complejidad computacional lineal respecto a la longitud de secuencia.

El checkpoint `gdn2-cpt-vanilla-longdata` es un resultado de continuación de preentrenamiento (CPT) sobre 105 millones de tokens, distribuidos en 400 pasos con un batch efectivo de 64 secuencias de 4096 tokens. La variante "vanilla" indica que no se aplicaron técnicas adicionales de adaptación de contexto largo más allá del entrenamiento estándar. El entrenamiento se realizó con el framework lit-gpt, como se deduce del repositorio oficial de GatedDeltaNet-2.

## Capacidades

No se han documentado capacidades específicas en la información disponible. Dado que se trata de un modelo de lenguaje de 370M de parámetros basado en atención lineal, se espera que pueda generar texto y manejar razonamiento básico, pero no se han publicado resultados de evaluación ni ejemplos de uso. Tampoco se menciona soporte para tool calling, agentes, visión u otras modalidades.

## Casos de uso

No se han descrito casos de uso concretos en la información proporcionada. Al ser un checkpoint experimental de investigación, su principal aplicación potencial es como base para estudios sobre atención lineal y eficiencia en contexto largo, así como para comparaciones con otras variantes de la misma serie. No obstante, sin documentación adicional, no se pueden proponer aplicaciones prácticas realistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se especifican requisitos de hardware oficiales. A modo orientativo, un modelo de 370M de parámetros en FP32 ocupa aproximadamente 1,5 GB de memoria (coincide con el tamaño del repositorio), y en cuantización a 4 bits podría caber en GPUs de consumo como una RTX 3060 de 12 GB. Sin embargo, no se dispone de datos oficiales sobre latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (370M, atención lineal). No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- Al ser un checkpoint de continuación de preentrenamiento con solo 105M tokens, el modelo no ha sido sometido a un entrenamiento completo ni a ajustes de seguridad, por lo que puede presentar sesgos, alucinaciones y respuestas de baja calidad.
- No se dispone de documentación sobre sesgos conocidos, limitaciones de idioma o restricciones de uso comercial.
- El formato de checkpoint (.pth) requiere del framework PyTorch y de la implementación específica de GatedDeltaNet-2 para su carga.
- No se indica si el modelo es apto para producción; su naturaleza experimental lo desaconseja para entornos reales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/gyung/gdn2-cpt-vanilla-longdata)
- [Dataset relacionado: gdn2-cpt-longdata-30k](https://huggingface.co/datasets/gyung/gdn2-cpt-longdata-30k)
- [Repositorio oficial de GatedDeltaNet-2 (NVlabs)](https://github.com/NVlabs/GatedDeltaNet-2)
- [Implementación de GDN-2 en lit-gpt](https://github.com/NVlabs/GatedDeltaNet-2/blob/main/lit_gpt/gdn2.py)

# foss22/Hallucinate1900-95M

## Resumen

El modelo `foss22/Hallucinate1900-95M` es un fine-tune del modelo base `croqaz/Sprocket-and-Say` realizado por el usuario `foss22`. El nombre sugiere un tamaño de 95 millones de parámetros, aunque no se ha confirmado en la información disponible. El entrenamiento se realizó sobre el dataset `jayfurzy/orthodox-patristic-corpus`, un corpus de textos patrísticos ortodoxos. La model card incluye un gráfico de pérdida que muestra una evolución de aproximadamente 12,03 a 6,17, lo que indica que el entrenamiento tuvo lugar, aunque no se detallan hiperparámetros ni configuración exacta.

El modelo se publicó en agosto de 2026, con un tamaño de repositorio de 0,1 GB. No se dispone de información sobre la arquitectura interna, el contexto, la licencia o los idiomas soportados. El nombre del modelo hace referencia a la alucinación, y la model card incluye un enlace a un texto histórico sobre el significado de "hallucinate", lo que sugiere un enfoque experimental en la generación de texto con posibles alucinaciones. Sin embargo, no hay datos objetivos que confirmen su propósito ni sus capacidades reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 95 M (inferido del nombre, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 0,1 GB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. El modelo base `croqaz/Sprocket-and-Say` no tiene documentación accesible en la información proporcionada. Se sabe que se trata de un fine-tune realizado con el dataset `jayfurzy/orthodox-patristic-corpus`, pero no se especifican el número de tokens de entrenamiento, el método de ajuste (p. ej., LoRA, full fine-tune) ni si se aplicaron técnicas como RLHF o DPO. La gráfica de pérdida incluida en la model card muestra un descenso de aproximadamente 12,03 a 6,17, pero no aporta detalles sobre el proceso.

## Capacidades

No se dispone de información sobre las capacidades concretas del modelo. No se ha documentado si es capaz de generación de texto, razonamiento, código, matemáticas, tool calling, soporte de agentes o capacidades multilingües. El único dato es el dataset de entrenamiento, de temática patrística ortodoxa, lo que sugiere un enfoque en texto religioso o histórico, pero no es un indicador fiable de sus habilidades generales.

## Casos de uso

No se ha documentado ningún caso de uso específico. Dado que no se conocen las capacidades reales del modelo, no es posible recomendar aplicaciones concretas. En cualquier caso, un modelo de 95 M de parámetros fine-tuneado con un corpus tan específico podría ser útil para experimentos de investigación sobre alucinaciones en modelos de lenguaje, pero esto es una hipótesis sin confirmar. No se debe asumir su utilidad en producción sin datos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. La única métrica visible es la pérdida de entrenamiento, pero no es comparable con otros modelos.

## Requisitos de hardware

No se dispone información sobre los requisitos de hardware. Dado el tamaño del repositorio (0,1 GB) y la posible cantidad de parámetros (95 M), se podría inferir que el modelo es pequeño y ejecutable en una GPU de consumo, pero no se han publicado datos de VRAM, latencia ni throughput. No se recomienda asumir requisitos sin confirmación.

## Comparativa con modelos similares

No hay información suficiente para establecer una comparativa con otros modelos. No se conocen modelos de la misma categoría (fine-tunes de 95 M sobre corpus patrísticos) ni se dispone de datos de rendimiento. Por tanto, no se puede ofrecer una comparación objetiva.

## Limitaciones y advertencias

- No hay información sobre sesgos, alucinaciones o riesgos específicos del modelo.
- El modelo se publicó sin licencia explícita, lo que impide su uso comercial o incluso su uso en proyectos internos sin aclaración legal.
- El entrenamiento se realizó sobre un corpus específico y limitado, lo que puede provocar un sesgo temático y una falta de generalización.
- La falta de documentación técnica (arquitectura, contexto, idiomas, etc.) hace que su uso en producción sea arriesgado.
- No se han publicado evaluaciones de robustez o seguridad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/foss22/Hallucinate1900-95M)
- [Texto histórico sobre "hallucinate"](https://extra.shu.ac.uk/emls/iemls/work/etexts/caw1604w_removed.htm) (enlazado en la model card)

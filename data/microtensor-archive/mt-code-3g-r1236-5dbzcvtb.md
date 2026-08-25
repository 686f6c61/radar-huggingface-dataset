# microtensor-archive/mt-code-3g-r1236-5DbzcvtB

## Resumen

El repositorio `microtensor-archive/mt-code-3g-r1236-5DbzcvtB` contiene una copia de archivo de un sistema presentado a la subred Microtensor de Bittensor (netuid 92), en el arena `code/mt-3g`, correspondiente a la ronda 1236. El modelo tiene 1.720.574.976 parámetros (~1,72 mil millones) y un tamaño de repositorio de 1,1 GB, en formato GGUF.

La subred Microtensor se describe como un sistema de validación distribuida que mide la precisión de modelos en tareas de código con un perfil de dispositivo específico (`mt-3g`). Sin embargo, el registro medido por la red para esta instancia es problemático: la calidad medida es 0,0, el coste esperado es 0,0 ms por consulta, y el estado en la ronda es "unmeasured" (no medido). Esto indica que el modelo no fue evaluado correctamente o que su rendimiento no alcanzó un umbral mínimo, lo que limita severamente su utilidad práctica.

La relevancia de este repositorio reside en su carácter de archivo dentro del ecosistema Microtensor/Bittensor, no como un modelo listo para uso en producción. No se dispone de información sobre arquitectura, licencia, idiomas, ni datos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.720.574.976 (~1,72 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (no se especifican variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo (tipo de transformer, capas, cabezas de atención, etc.). El repositorio es una copia de archivo de un sistema presentado a la subred Microtensor, que según la documentación de la subred se centra en "precisión frontera a una fracción del tamaño" en tareas de código. Sin embargo, la ronda 1236 muestra un estado "unmeasured" y una calidad de 0,0, lo que sugiere que el modelo no pasó la evaluación de los validadores o que no se pudo medir.

No se dispone de datos sobre el conjunto de datos de entrenamiento, el número de tokens procesados, ni el uso de técnicas como RLHF, DPO o similar. La información de la model card no menciona ningún detalle de entrenamiento.

## Capacidades

- No se dispone de información verificada sobre las capacidades del modelo.
- El contexto de la subred (arena `code/mt-3g`) sugiere que está orientado a tareas de generación de código, pero la calidad medida es 0,0, lo que indica que no se ha demostrado ninguna capacidad útil.
- No se menciona soporte para tool calling, agentes, razonamiento multi-paso, visión, audio ni ninguna otra capacidad especial.
- El estado "unmeasured" implica que no se ha validado ninguna capacidad de forma fiable.

## Casos de uso

Dado el estado de calidad 0,0 y la falta de información sobre el modelo, no es posible recomendar casos de uso prácticos. El modelo no ha sido validado por la red y no se dispone de datos sobre su comportamiento. Cualquier uso en producción sería arriesgado y no recomendable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la calidad de 0,0 medida por la subred Microtensor, que indica que el modelo no superó la evaluación de los validadores.

## Requisitos de hardware

- Tamaño del modelo: 1,72 mil millones de parámetros.
- Tamaño del repositorio: 1,1 GB (formato GGUF).
- Con 1,72 mil millones de parámetros, una cuantización de 4 bits podría requerir alrededor de 1-2 GB de VRAM, lo que podría caber en GPUs de consumo como una RTX 3060 (12 GB) o RTX 4060 (8 GB).
- Sin embargo, al no haber sido validado ni medido, no se puede confirmar que el modelo funcione correctamente en ningún hardware.
- Opciones de despliegue: GGUF sugiere compatibilidad con llama.cpp, Ollama o similares, pero no hay evidencia de que el modelo funcione.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables dentro de la misma categoría (arena `code/mt-3g` de la subred Microtensor). El repositorio `microtensor-io/baseline-front-mt3g` existe en HuggingFace, pero no se han encontrado datos de rendimiento de ninguno de ellos.

## Limitaciones y advertencias

- El modelo tiene una calidad medida de 0,0 y estado "unmeasured", lo que indica que no ha sido validado correctamente o que no superó las evaluaciones de la subred.
- No se dispone de información sobre licencia, por lo que no se puede confirmar si es utilizable comercialmente.
- No se dispone de datos sobre sesgos, alucinaciones o limitaciones idiomáticas.
- El repositorio es una copia de archivo sin manifiesto original, lo que puede implicar que los archivos no estén completos o que el modelo no sea funcional.
- No se recomienda su uso en producción sin una evaluación exhaustiva previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/microtensor-archive/mt-code-3g-r1236-5DbzcvtB
- Repositorio de la subred Microtensor (GitHub): https://github.com/microtensor-io/microtensor-subnet
- Modelo de referencia `baseline-front-mt3g`: https://huggingface.co/microtensor-io/baseline-front-mt3g

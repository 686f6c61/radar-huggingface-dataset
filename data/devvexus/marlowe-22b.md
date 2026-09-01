# devvexus/marlowe-22b

## Resumen

El modelo `devvexus/marlowe-22b` es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.8-27B, publicado por el usuario devvexus en HuggingFace bajo licencia Apache 2.0. A pesar de su nombre, que sugiere 22 mil millones de parámetros, el modelo base declarado es Qwen3.8-27B, lo que genera una discrepancia que no está documentada en la model card. No se proporciona información sobre el proceso de entrenamiento, el dataset utilizado ni las capacidades específicas resultantes.

La relevancia de este modelo es actualmente limitada debido a la ausencia total de documentación técnica, métricas de rendimiento o ejemplos de uso. No cuenta con descargas ni valoraciones de la comunidad, y su ficha en HuggingFace no incluye pipeline, idiomas soportados ni detalles de arquitectura más allá de la referencia al modelo base. Se trata, por tanto, de una publicación preliminar o experimental que requiere verificación adicional antes de considerarse para cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen/Qwen3.8-27B) |
| Parametros totales | no disponible (el nombre sugiere 22B, pero el base es 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura interna del modelo. El único dato fiable es que se parte de Qwen/Qwen3.8-27B, un modelo de la familia Qwen3.8 con 27 mil millones de parámetros, desarrollado por Alibaba. Qwen3.8 emplea una arquitectura transformer con atención de múltiples cabezas y es conocido por su soporte multilingüe y su capacidad de razonamiento, pero no se puede confirmar si el fine-tune ha modificado alguna de estas características.

El proceso de entrenamiento es completamente desconocido: no se especifican el número de tokens, la composición del dataset, ni si se aplicaron técnicas como RLHF, DPO o instrucción supervisada. La model card solo contiene el frontmatter con la licencia y el modelo base, sin sección de descripción ni detalles adicionales. Cualquier afirmación sobre el entrenamiento sería especulativa.

## Capacidades

No se han documentado capacidades específicas para este modelo. Dado que se basa en Qwen3.8-27B, es razonable esperar que herede las capacidades generales de dicho modelo (generación de texto, razonamiento, código, matemáticas, soporte multilingüe), pero no hay confirmación oficial ni ejemplos de uso publicados. No se puede afirmar la existencia de tool calling, modo agente, visión u otras funcionalidades avanzadas.

## Casos de uso

Al no existir documentación ni ejemplos, no es posible recomendar casos de uso concretos con fundamento. Cualquier aplicación práctica requeriría primero una evaluación empírica del modelo. Se recomienda tratar este modelo como un experimento no validado y no utilizarlo en entornos de producción sin pruebas exhaustivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se dispone de datos sobre requisitos de hardware. Dado que el modelo base Qwen3.8-27B requiere aproximadamente 54 GB de VRAM en FP16 para inferencia, es probable que este fine-tune tenga necesidades similares, pero no se puede confirmar. Se recomienda consultar la documentación de Qwen3.8-27B para estimaciones orientativas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base Qwen3.8-27B puede compararse con otros modelos de tamaño similar como Llama 3.1 8B o Mistral 7B, pero al no conocer las modificaciones introducidas por el fine-tune, cualquier comparación sería engañosa. Se indica "no disponible" por falta de datos.

## Limitaciones y advertencias

- Ausencia total de documentación técnica y de uso.
- Discrepancia entre el nombre del modelo (22B) y el modelo base declarado (27B), sin aclaración.
- Sin métricas de rendimiento, benchmarks ni evaluaciones de sesgos.
- Sin información sobre el dataset de entrenamiento, lo que impide evaluar riesgos de alucinación o sesgos específicos.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantías y de soporte hace desaconsejable su uso en producción sin validación previa.
- No hay evidencia de mantenimiento activo ni de comunidad alrededor del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devvexus/marlowe-22b
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF

No se han encontrado papers, blogs o demos asociados a este modelo específico.

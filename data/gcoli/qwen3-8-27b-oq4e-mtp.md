# gcoli/Qwen3.8-27B-oQ4e-mtp

## Resumen

Este repositorio contiene una cuantización de un modelo denominado Qwen3.8-27B, publicada por el usuario gcoli. La cuantización se ha realizado con la herramienta oQ (oMLX v0.5.7), que aplica una cuantización mixta de precisión, en este caso de 4 bits con un tamaño de grupo de 64. El resultado se ofrece en formato MLX safetensors, lo que indica que está orientado a su uso en entornos que soporten la librería MLX, típicamente hardware Apple Silicon.

La información disponible es muy limitada: no se especifican la licencia, los idiomas soportados, la arquitectura interna del modelo base ni sus capacidades. El número de parámetros totales reportado en los safetensors es de 4.926.789.872, una cifra que no coincide con la nomenclatura "27B" del nombre, lo que sugiere una posible discrepancia o que el modelo base original no es de 27B parámetros. Dado que no se dispone de más detalles, esta ficha se limita a documentar los datos explícitos del repositorio y a señalar las carencias de información.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tipo de modelo se indica como "qwen3_5", pero no se detalla la arquitectura interna) |
| Parametros totales | 4.926.789.872 (según safetensors; el nombre del modelo sugiere 27B, discrepancia no aclarada) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, cuantización mixta de precisión (oQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base ni sobre su proceso de entrenamiento. El nombre "Qwen3.8-27B" sugiere que podría tratarse de una variante de la familia Qwen, pero no hay datos que lo confirmen. La única información técnica disponible se refiere a la cuantización: se ha utilizado oQ (oMLX v0.5.7) con una precisión de 4 bits y un tamaño de grupo de 64, lo que implica una reducción significativa del tamaño del modelo respecto a su versión original. No se mencionan técnicas de entrenamiento como RLHF, DPO ni el número de tokens de entrenamiento.

## Capacidades

No se han documentado capacidades específicas en la información proporcionada. Al tratarse de un modelo cuantizado, se asume que conserva las capacidades del modelo base, pero al no conocerse este último, no es posible enumerar funciones concretas como generación de texto, razonamiento, código, tool calling, etc. Se recomienda consultar la documentación del modelo original si se desea conocer sus capacidades.

## Casos de uso

No se han descrito casos de uso en la información disponible. Dado que el modelo se distribuye en formato MLX, es plausible que esté pensado para ejecutarse en dispositivos Apple Silicon, pero no se puede confirmar ni detallar aplicaciones concretas sin más datos. Se sugiere evaluar el modelo directamente para determinar su idoneidad en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se especifican requisitos de hardware en la información proporcionada. El tamaño del repositorio es de 17.0 GB, lo que da una idea del espacio de almacenamiento necesario, pero no se indica la VRAM requerida para inferencia. Al estar en formato MLX, es probable que esté optimizado para Apple Silicon con memoria unificada, pero no se dispone de datos concretos sobre GPUs compatibles, latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. No se conocen las características del modelo base ni su rendimiento, por lo que no es posible comparar parámetros, contexto, rendimiento o licencia con alternativas.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o modificación.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- La discrepancia entre el nombre del modelo (27B) y el número de parámetros reportado (4.9B) es un punto de atención; podría indicar un error en la nomenclatura o en los metadatos.
- Al ser una cuantización de 4 bits, es esperable una pérdida de precisión respecto al modelo original, aunque no se cuantifica.
- No se han proporcionado instrucciones de uso ni ejemplos de despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gcoli/Qwen3.8-27B-oQ4e-mtp
- Herramienta oQ (oMLX): https://github.com/jundot/omlx

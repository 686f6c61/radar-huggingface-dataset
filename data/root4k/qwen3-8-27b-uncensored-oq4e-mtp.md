# root4k/Qwen3.8-27B-Uncensored-oQ4e-mtp

## Resumen

El modelo `root4k/Qwen3.8-27B-Uncensored-oQ4e-mtp` es una cuantización en 4 bits del modelo base Qwen3.8-27B-Uncensored, realizada por el usuario root4k mediante la herramienta oMLX (oQ, mixed-precision quantization). El resultado se publica en formato MLX safetensors, pensado para su uso en hardware Apple Silicon a través de la librería MLX. La etiqueta "uncensored" indica que el modelo base fue modificado para eliminar o reducir las restricciones de contenido habituales de la serie Qwen, aunque no se aportan detalles sobre el proceso de ablación ni sobre el modelo original. El repositorio tiene 17.0 GB y no registra descargas ni valoraciones, por lo que se trata de una publicación reciente y sin uso comunitario conocido.

La cuantización oQ4e emplea 4 bits con un tamaño de grupo de 64, lo que reduce el peso del modelo respecto a una versión de 16 bits, facilitando su ejecución en dispositivos con memoria unificada limitada. Sin embargo, la información técnica disponible es mínima: no se especifican la arquitectura exacta, el contexto, los idiomas, la licencia ni los datos de entrenamiento. La única cifra de parámetros que se reporta en los safetensors es de 4.926.789.872, muy inferior a los 27B que sugiere el nombre, por lo que conviene verificar el contenido real del repositorio antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8, detalles desconocidos) |
| Parametros totales | 4.926.789.872 (según safetensors; el nombre indica 27B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e: 4 bits, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original Qwen3.8-27B-Uncensored. La cuantización fue realizada con la herramienta oMLX (versión 0.6.3rc2) en modo de precisión mixta, lo que permite mantener ciertas capas en mayor precisión mientras otras se cuantizan a 4 bits. El proceso reduce el tamaño del modelo y acelera la inferencia en hardware Apple, pero no se han publicado detalles sobre el dataset de entrenamiento, el proceso de ajuste fino o la técnica empleada para eliminar la censura (por ejemplo, abliteration). No hay información sobre RLHF, DPO ni otros métodos de alineación.

## Capacidades

- No se han publicado descripciones de capacidades específicas del modelo cuantizado.
- Al ser una versión "uncensored" del modelo base Qwen3, se espera que mantenga las capacidades generales de generación de texto, razonamiento y posiblemente codigo, pero no se puede confirmar sin datos oficiales.
- No se indica soporte para tool calling, agentes, vision ni audio.
- No se ha informado sobre idiomas soportados.

## Casos de uso

No se dispone de casos de uso documentados para este modelo concreto. Al ser una cuantización de un modelo no censurado, podría emplearse en investigación sobre seguridad y alineación, pero no se recomienda su uso en producción sin verificar el contenido del repositorio y obtener la licencia adecuada. Cualquier caso de uso sería especulativo y carecería de base técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio pesa 17.0 GB, lo que sugiere que el modelo cuantizado ocupa aproximadamente ese tamaño en disco.
- Para inferencia con MLX se necesita un Mac con Apple Silicon y suficiente memoria unificada; se estima que 17 GB de pesos requieren al menos 24 GB de RAM unificada para carga completa, aunque con cuantización mixta y offload se podría operar con menos.
- No se dispone de datos de VRAM específicos para GPUs NVIDIA u otras plataformas, ya que el formato MLX está orientado a Apple.
- Las opciones de despliegue se limitan a MLX; para otras plataformas habría que convertir a GGUF u otro formato, lo cual no está garantizado.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (modelos Qwen3 cuantizados o "uncensored"). No se han encontrado datos de rendimiento ni especificaciones completas.

## Limitaciones y advertencias

- **Falta de documentación**: no se proporciona arquitectura, entrenamiento, licencia ni datos de sesgos.
- **Riesgo de contenido dañino**: al ser una versión "uncensored", el modelo puede generar contenido inapropiado, ilegal o peligroso si se usa sin supervisión.
- **Posible inconsistencia de parámetros**: el número de parámetros reportado (4.9B) no coincide con el nombre del modelo (27B), lo que sugiere un error o una parte incompleta del repositorio.
- **Licencia desconocida**: no se puede usar comercialmente sin confirmar la licencia del modelo base y de la cuantización.
- **Sin garantía de calidad**: no hay benchmarks ni evaluaciones, por lo que el rendimiento real es desconocido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/root4k/Qwen3.8-27B-Uncensored-oQ4e-mtp
- Repositorio oMLX (herramienta de cuantización): https://github.com/jundot/omlx
- Blog de orcarouter sobre Qwen 3.8 27B Uncensored local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Repositorio GitHub relacionado: https://github.com/Wassimyounes01/qwen38-uncensored
- Repositorio GitHub alternativo: https://github.com/unburdened-jackinthebox365/qwen38-uncensored
- Otra versión del mismo modelo en HuggingFace: https://huggingface.co/pyros-vault/Qwen3.8-27B-Uncensored-oQ4e-mtp

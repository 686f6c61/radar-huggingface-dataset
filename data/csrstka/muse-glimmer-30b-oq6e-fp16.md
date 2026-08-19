# csrstka/Muse-Glimmer-30B-oQ6e-fp16

## Resumen

El modelo `csrstka/Muse-Glimmer-30B-oQ6e-fp16` es una cuantización de 6 bits (grupo de 64) en formato MLX safetensors, generada con la herramienta oQ (oMLX v0.6.0). El nombre sugiere una familia "Muse-Glimmer" con 30B, pero los pesos reales contienen 8.201.628.672 parámetros (8,2 mil millones), por lo que se trata de un modelo de 8B cuantizado, no de 30B. El repositorio ocupa 31,1 GB y está diseñado para ejecutarse en dispositivos Apple con MLX.

La ficha carece de información sobre el modelo base: no se especifican arquitectura, entrenamiento, capacidades, licencia ni idiomas. La única información disponible es la relativa a la cuantización y el formato de pesos. Por tanto, esta ficha se limita a documentar los datos técnicos verificables y advierte de la ausencia de documentación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tipo declarado: muse_glimmer) |
| Parametros totales | 8.201.628.672 (8,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (oQ6e), grupo de 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base. El tipo declarado es `muse_glimmer`, pero no se detalla si se trata de un transformer, MoE, SSM u otra arquitectura. Tampoco hay datos sobre el entrenamiento: número de tokens, composición del dataset, técnicas de alineación (RLHF, DPO, etc.) ni innovaciones técnicas. La única información disponible es que el modelo ha sido cuantizado con oQ (oMLX v0.6.0) en precisión mixta de 6 bits, lo que reduce el tamaño en memoria a aproximadamente 0,75 bytes por parámetro, resultando en unos 6,15 GB de pesos (más overhead). No se puede confirmar si la cuantización afecta a todas las capas por igual o si hay capas en mayor precisión.

## Capacidades

No se dispone de información sobre las capacidades del modelo. No se documentan tareas de generación de texto, razonamiento, código, matemáticas, visión, tool calling, soporte para agentes, multilingüismo ni modos especiales. Dado que es un modelo de lenguaje de 8B cuantizado, es plausible que pueda realizar tareas básicas de generación de texto, pero no hay evidencia publicada.

## Casos de uso

No se han documentado casos de uso específicos. Al ser un modelo de 8B cuantizado en formato MLX, podría emplearse en aplicaciones que requieran generación de texto en dispositivos Apple (Mac, iPad) con memoria unificada, pero sin datos sobre el modelo base no es posible recomendar escenarios concretos con garantías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,2 GB para los pesos en 6 bits, más overhead de activaciones y caché KV. Con contexto corto, podría caber en dispositivos con 8 GB de memoria unificada, pero se recomienda al menos 12 GB para un uso cómodo.
- GPU recomendadas: al ser formato MLX, está optimizado para Apple Silicon (M1, M2, M3, M4). No se ha probado en GPUs NVIDIA o AMD.
- Compatibilidad con consumer GPU: solo Apple Silicon, no en GPUs de escritorio convencionales.
- Opciones de despliegue: MLX (librería `mlx`), posiblemente a través de herramientas que soporten MLX como `mlx-lm` u otras.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma familia ni se dispone de datos de rendimiento para establecer una comparación.

## Limitaciones y advertencias

- No hay información sobre sesgos, alucinación o limitaciones de contexto.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial o de investigación sin permiso del autor.
- Al ser una cuantización de 6 bits, puede haber pérdida de precisión respecto al modelo original en tareas de razonamiento complejo.
- El nombre del modelo sugiere 30B, pero los parámetros reales son 8,2B; esta discrepancia puede inducir a error.
- No hay documentación sobre el modelo base, lo que impide evaluar su calidad o idoneidad para tareas concretas.

## Enlaces

- [HuggingFace - csrstka/Muse-Glimmer-30B-oQ6e-fp16](https://huggingface.co/csrstka/Muse-Glimmer-30B-oQ6e-fp16)
- [Repositorio oQ (oMLX)](https://github.com/jundot/omlx)

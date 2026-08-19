# mlindland/Qwen3.8-27B-oQ8e-mtp

## Resumen

El modelo `mlindland/Qwen3.8-27B-oQ8e-mtp` es una cuantización de 8 bits realizada con la herramienta oMLX (oQ) sobre un modelo base de la familia Qwen3.5, según el tag `qwen3_5`. A pesar del nombre, los pesos reales en safetensors suman 8.184.279.792 parámetros (aproximadamente 8,18 mil millones), lo que sugiere que el nombre "27B" es engañoso o corresponde a una versión distinta no reflejada en los datos. El repositorio contiene únicamente los pesos cuantizados en formato MLX safetensors, pensados para su uso con la librería MLX en Apple Silicon.

La relevancia de este modelo radica en que ofrece una versión optimizada en 8 bits con group size 64, lo que reduce el uso de memoria y permite ejecutar un modelo de ~8B en dispositivos con memoria unificada limitada. Sin embargo, la información pública es muy escasa: no se especifican la arquitectura exacta, el contexto, los idiomas, la licencia ni los datos de entrenamiento del modelo original. Esto limita su evaluación rigurosa y su uso en producción sin verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `qwen3_5`, sin detalles) |
| Parametros totales | 8.184.279.792 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, group size 64 (oQ / oMLX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base (número de capas, heads, tipo de atención, etc.) ni sobre su proceso de entrenamiento (tokens, dataset, técnicas de alineación). El tag `qwen3_5` sugiere que pertenece a una variante de la serie Qwen3, pero no hay confirmación oficial. La única innovación técnica documentada es la cuantización mixta de precisión aplicada con oMLX v0.5.8.dev3, que convierte los pesos a 8 bits con group size 64, manteniendo el formato MLX safetensors para su uso directo con la librería MLX.

## Capacidades

- No se han publicado capacidades específicas en la información disponible.
- Al ser una cuantización de un modelo de la familia Qwen, es probable que herede capacidades de generación de texto, razonamiento y posiblemente tool calling, pero no hay datos confirmados.
- El formato MLX indica que está optimizado para inferencia en Apple Silicon, pero no se documentan funciones especiales como vision, audio o thinking mode.

## Casos de uso

- Inferencia local en Mac: al estar en formato MLX, puede ejecutarse en dispositivos Apple Silicon con la librería MLX, aunque se requiere verificar la compatibilidad con el modelo base.
- Prototipado rápido: para desarrolladores que quieran probar un modelo de ~8B cuantizado sin necesidad de GPUs dedicadas, siempre que se confirme la procedencia y licencia.
- Investigación de técnicas de cuantización: el repositorio sirve como ejemplo de aplicación de oQ sobre un modelo Qwen, útil para estudiar el impacto de la cuantización de 8 bits con group size 64.
- Despliegue en entornos con memoria limitada: la cuantización reduce el footprint de memoria, pero al no conocerse el contexto ni los requisitos exactos, se recomienda validar antes de usarlo en producción.
- Evaluación comparativa de cuantizaciones: se puede comparar el rendimiento de este modelo frente a otras versiones cuantizadas del mismo base, si se identifica cuál es.
- Uso educativo: para aprender a trabajar con modelos MLX cuantizados y entender el flujo de oMLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un modelo de ~8,18B parámetros en 8 bits, el tamaño de los pesos es aproximadamente 8,2 GB (8,18B × 1 byte). Con overhead de runtime, se estima que necesita entre 10 y 12 GB de memoria unificada.
- Diseñado para Apple Silicon (M1/M2/M3/M4) con la librería MLX; no se indica soporte para CUDA o ROCm.
- Se puede ejecutar con la librería MLX directamente, o mediante herramientas que la usen (por ejemplo, `mlx_lm`).
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se ha identificado el modelo base exacto ni alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial y redistribución.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma o contexto.
- La cuantización de 8 bits puede introducir pérdida de precisión respecto al modelo original, aunque no se han publicado evaluaciones.
- El nombre del modelo ("27B") no coincide con los parámetros reales (8,18B), lo que genera confusión y sugiere que el repositorio podría estar mal etiquetado o ser una versión no oficial.
- No hay información sobre el modelo base original, por lo que no se puede verificar su procedencia ni su calidad.

## Enlaces

- [HuggingFace - mlindland/Qwen3.8-27B-oQ8e-mtp](https://huggingface.co/mlindland/Qwen3.8-27B-oQ8e-mtp)
- [Repositorio oMLX (oQ)](https://github.com/jundot/omlx)

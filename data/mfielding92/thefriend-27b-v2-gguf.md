# mfielding92/thefriend-27b-v2-GGUF

## Resumen

`thefriend-27b-v2-GGUF` es una versión cuantizada en formato GGUF del modelo `mfielding92/thefriend-27b-v2`, publicada por el usuario `mfielding92` en Hugging Face. El nombre sugiere un modelo de aproximadamente 27 mil millones de parámetros, aunque no se dispone de información oficial sobre su arquitectura, entrenamiento o licencia. La cuantización utiliza la técnica Unsloth Dynamic 2.0 (UD) con matrices de importancia (imatrix) extraídas del repositorio `unsloth/Qwen3.8-27B-GGUF`, lo que indica que el modelo base podría estar relacionado con la familia Qwen, pero esto no está confirmado.

Esta ficha se centra en la versión GGUF, que es la que se distribuye aquí. Al no existir documentación adicional sobre el modelo original, la mayor parte de las especificaciones técnicas, capacidades y rendimiento se desconocen. La relevancia de este repositorio radica en ofrecer cuantizaciones listas para usar con `llama.cpp` y otros motores compatibles con GGUF, facilitando la ejecución local en hardware con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | ~27 mil millones (inferido del nombre, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de uso sugiere 16384 tokens, pero no es un dato oficial) |
| Tipos de cuantizacion | UD-Q2_K_XL, UD-Q3_K_XL, UD-Q4_K_XL, UD-Q5_K_M (según la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no disponible) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base `thefriend-27b-v2`. El nombre y el uso de recetas UD extraídas de `Qwen3.8-27B-GGUF` sugieren una posible relación con la familia Qwen, pero no hay confirmación oficial. Tampoco se conocen los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La cuantización se realizó con Unsloth Dynamic 2.0, que aplica overrides por tensor mediante `llama.cpp` y utiliza una matriz de importancia (imatrix) para mejorar la calidad de la cuantización.

## Capacidades

No se dispone de información verificada sobre las capacidades del modelo. Dado que se trata de un modelo de 27B, es plausible que pueda realizar tareas de generación de texto, razonamiento y posiblemente código, pero no hay datos que lo confirmen. No se menciona soporte para tool calling, agentes, visión, audio ni modos de pensamiento explícitos. Se recomienda tratar cualquier afirmación sobre capacidades como especulativa hasta que se publique documentación oficial.

## Casos de uso

Al no existir información sobre el modelo base, los casos de uso son hipotéticos y deben validarse empíricamente. Algunos escenarios plausibles para un modelo de 27B cuantizado en GGUF son:

- Ejecución local en equipos de consumo: gracias a las cuantizaciones Q4_K_XL o Q3_K_XL, el modelo podría caber en GPUs con 8-12 GB de VRAM, permitiendo experimentación sin conexión.
- Prototipado rápido con `llama.cpp`: el ejemplo de la model card muestra cómo cargar el modelo con `llama-cli`, útil para pruebas de generación de texto en entornos de desarrollo.
- Integración en aplicaciones de chat o asistentes personales: si el modelo base tiene capacidades conversacionales, podría usarse como backend en aplicaciones de chat locales.
- Generación de contenido creativo: un modelo de 27B podría emplearse para redacción de textos, resúmenes o lluvia de ideas, aunque sin confirmación de calidad.
- Investigación sobre cuantización: el repositorio sirve como referencia para estudiar el impacto de las recetas UD e imatrix en modelos de este tamaño.
- Despliegue en servidores con VRAM limitada: las versiones Q2_K_XL o Q3_K_XL podrían ejecutarse en GPUs de gama media para tareas de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras pruebas estándar. Tampoco se comparan con modelos similares. Se recomienda realizar evaluaciones propias antes de usar el modelo en producción.

## Requisitos de hardware

- VRAM estimada: para un modelo de 27B, las cuantizaciones aproximadas serían:
  - UD-Q2_K_XL: ~14 GB (estimación orientativa)
  - UD-Q3_K_XL: ~16 GB
  - UD-Q4_K_XL: ~18 GB
  - UD-Q5_K_M: ~20 GB
  Estas cifras son orientativas y dependen del contexto y de la implementación.
- GPUs recomendadas: para las cuantizaciones más pequeñas, una RTX 3060 12GB o RTX 4060 Ti 16GB podría ser suficiente; para Q4_K_XL se necesitaría al menos 20 GB (RTX 3090, RTX 4090, A5000). Para Q5_K_M, se recomienda 24 GB o más.
- Despliegue: compatible con `llama.cpp`, `Ollama`, `LM Studio` y otros motores que soporten GGUF. También puede usarse con `vLLM` si se convierte a otro formato, pero no es el propósito de este repositorio.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El nombre sugiere una posible relación con Qwen3.8-27B, pero no hay datos que permitan una comparación rigurosa. Se recomienda consultar el repositorio del modelo base para obtener más detalles.

## Limitaciones y advertencias

- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo base.
- La licencia es desconocida, por lo que no se puede garantizar su uso comercial. Se debe contactar con el autor antes de utilizarlo en proyectos comerciales.
- La cuantización puede degradar la calidad de las respuestas, especialmente en las versiones más agresivas (Q2_K_XL).
- El modelo base no tiene documentación pública, lo que dificulta la evaluación de su idoneidad para tareas específicas.
- El contexto máximo no está confirmado; el ejemplo usa 16384 tokens, pero podría ser mayor o menor.
- Al ser un repositorio con 0 descargas y 0 likes, no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mfielding92/thefriend-27b-v2-GGUF
- Modelo base: https://huggingface.co/mfielding92/thefriend-27b-v2
- Perfil del autor: https://huggingface.co/mfielding92
- GitHub del autor: https://github.com/mfielding92/

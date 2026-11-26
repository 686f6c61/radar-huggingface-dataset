# huggingface12341/zsf3-h24

## Resumen

zsf3-h24 es un modelo de decisión publicado en Hugging Face por el usuario huggingface12341 bajo licencia Apache 2.0. Se trata de un merge de tres modelos base: jwcwn/zl-flash-body-1, edinlong83/zils-flash-e2 y Patrick-18/Dexy-Decision-9B. El resultado es un checkpoint de aproximadamente 8.390 millones de parámetros (8,39 B) en formato safetensors y con un tamaño de repositorio de 16,8 GB, lo que sugiere pesos en precisión de 16 bits.

La ficha de Hugging Face lo etiqueta como `decision-model` y `zils`, `d3-flash` y `merge`, lo que indica que su propósito declarado es la toma de decisiones (clasificación, selección entre opciones o razonamiento estructurado) más que la generación de texto libre. No obstante, la información pública disponible es muy escasa: no se especifican idiomas, pipeline, datos de entrenamiento ni benchmarks, y el acceso está restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo.

Su relevancia actual es limitada pero puede interesar a quienes experimentan con técnicas de model merging y buscan checkpoints de tamaño medio (8 B) que quepan en una GPU de consumo con cuantización. Al ser un merge de modelos comunitarios, su calidad y comportamiento dependen enteramente de los modelos de origen, sobre los que tampoco hay documentación pública detallada en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `decision-model`; probablemente transformer, sin confirmar) |
| Parametros totales | 8.392.695.024 (8,39 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; presumiblemente FP16/BF16 por el tamaño de 16,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La etiqueta `decision-model` y los tags `zils`, `d3-flash` y `merge` indican que se ha construido mediante fusión (merge) de tres checkpoints: jwcwn/zl-flash-body-1, edinlong83/zils-flash-e2 y Patrick-18/Dexy-Decision-9B. No se especifica la técnica de merge empleada (SLERP, TIES, DARE, linear, etc.), ni la proporción de pesos de cada modelo base.

Tampoco hay datos sobre el entrenamiento: número de tokens, composición del dataset, uso de RLHF/DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. Toda esta información debe considerarse no disponible hasta que el autor publique una model card detallada.

## Capacidades

- Toma de decisiones: el modelo está etiquetado como `decision-model`, por lo que su uso previsto es la selección o clasificación entre opciones, no la generación libre de texto.
- Herencia de capacidades de los modelos base: al ser un merge, podría conservar parte de las capacidades de jwcwn/zl-flash-body-1, edinlong83/zils-flash-e2 y Patrick-18/Dexy-Decision-9B, pero no hay documentación que lo confirme.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse en Hugging Face Inference Endpoints.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación y enrutamiento de consultas: si el modelo funciona como `decision-model`, podría emplearse para decidir a qué categoría o servicio derivar una petición entrante en un sistema de atención al cliente, siempre que se valide su precisión con datos propios.
- Selección entre respuestas candidatas: en un pipeline de generación aumentada (RAG) podría puntuar o elegir entre varias respuestas generadas por otro modelo, actuando como re-ranker o juez ligero.
- Experimentación con model merging: investigadores interesados en evaluar cómo se comporta la fusión de tres checkpoints de 8 B pueden usar este modelo como caso de estudio reproducible.
- Prototipado en GPU de consumo: con 8,39 B de parámetros, cabe en GPUs de 24 GB en FP16 y en GPUs de 12-16 GB con cuantización a 8 o 4 bits, lo que permite probarlo localmente.
- Despliegue en Hugging Face Inference Endpoints: el tag `endpoints_compatible` facilita su publicación como servicio gestionado para pruebas internas.
- Base para fine-tuning específico de decisión: al ser Apache 2.0, puede ajustarse con datos propios de clasificación o selección sin restricciones de licencia comercial.
- Evaluación comparativa de modelos comunitarios: útil como referencia en estudios sobre la calidad de merges frente a modelos entrenados desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16,8 GB solo para pesos, más overhead de activaciones y KV cache (depende del contexto, no disponible). Se recomienda al menos 24 GB para trabajar con comodidad.
- VRAM estimada en cuantización 8 bits: en torno a 8,4-9 GB para pesos.
- VRAM estimada en cuantización 4 bits: en torno a 4,5-5 GB para pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4090 o RTX 4080 para cuantización 8 bits.
- ¿Cabe en GPU de consumo? Sí: en RTX 4090 en FP16; en RTX 4070 Ti/4080 o superiores con cuantización 8 bits; en GPUs de 8-12 GB con cuantización 4 bits.
- Opciones de despliegue: transformers (librería declarada), Hugging Face Inference Endpoints (tag `endpoints_compatible`); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente sobre los modelos base ni sobre alternativas comparables para establecer una comparativa rigurosa. Se indica a continuación lo que se conoce de los tres checkpoints de origen, sin datos de rendimiento:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zsf3-h24 | 8,39 B | no disponible | Apache 2.0 | Merge de tres modelos; acceso gated |
| jwcwn/zl-flash-body-1 | no disponible | no disponible | no disponible | Modelo base del merge |
| edinlong83/zils-flash-e2 | no disponible | no disponible | no disponible | Modelo base del merge |
| Patrick-18/Dexy-Decision-9B | ~9 B (por el nombre) | no disponible | no disponible | Modelo base del merge, orientado a decisión |

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated; es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Documentación inexistente: no hay model card con detalles de arquitectura, entrenamiento, contexto o idiomas, lo que impide evaluar su idoneidad para producción.
- Riesgo de alucinación: desconocido, pero al no haber benchmarks ni evaluación publicada no puede descartarse.
- Sesgos: no documentados; al ser un merge de modelos comunitarios, puede heredar sesgos de sus componentes.
- Limitaciones de contexto e idioma: no disponibles; no se debe asumir soporte multilingüe ni una ventana de contexto concreta.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que los modelos base no impongan restricciones adicionales (no confirmado en la información disponible).
- Madurez: creado el 26 de noviembre de 2026, con 0 descargas y 0 likes; no hay evidencia de uso en producción ni validación por la comunidad.
- Reproducibilidad: al no documentarse la técnica de merge ni las proporciones, es difícil reproducir el modelo o auditar su comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface12341/zsf3-h24
- Modelo base 1: https://huggingface.co/jwcwn/zl-flash-body-1
- Modelo base 2: https://huggingface.co/edinlong83/zils-flash-e2
- Modelo base 3: https://huggingface.co/Patrick-18/Dexy-Decision-9B

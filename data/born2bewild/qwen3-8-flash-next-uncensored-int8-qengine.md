# born2bewild/Qwen3.8-Flash-Next-Uncensored-INT8-QEngine

## Resumen

Qwen3.8-Flash-Next-Uncensored-INT8-QEngine es una conversión a INT8 del checkpoint orcarouter/Qwen3.8-Flash-Next-Uncensored, publicada por el usuario born2bewild bajo la etiqueta de arquitectura qwen4_exp. Se trata de un modelo de aproximadamente 126.200 millones de parámetros totales (según los safetensors del repositorio), con pesos en formato safetensors y cuantización simétrica de 8 bits por grupos de 128 elementos. El repositorio ocupa unos 133 GB e incluye además los pesos del módulo MTP (multi-token prediction) y los ficheros de configuración de tokenizer y preprocesado de imagen y vídeo.

El interés de esta ficha es doble. Por un lado, documenta una de las pocas conversiones INT8 públicas de un modelo de la familia Qwen de gran tamaño, con un manifiesto de conversión explícito (`qfn-int8-manifest.json`) que detalla el esquema de cuantización. Por otro, advierte de una limitación crítica: según la propia model card, el checkpoint **no es ejecutable por la versión actual de QEngine**, porque el motor no soporta todavía expertos QFN en INT8. El repositorio publica pesos y metadatos, pero no incluye una implementación de inferencia compatible.

La relevancia práctica es por tanto limitada hoy: sirve como referencia de conversión y como artefacto preparado para un futuro soporte del motor, no como un modelo listo para desplegar. No se han publicado evaluaciones de calidad, latencia ni rendimiento asociadas a esta conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen4_exp (etiqueta del autor); detalles internos no disponibles |
| Parámetros totales | 126.192.584.851 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 simétrico, group size 128, redondeo nearest-even, escalas BF16, zero point 0, RTN con absmax BF16 por grupo dividido entre 127 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (etiqueta `license: other`) |
| Formato de pesos | safetensors (incluye `model.safetensors` y `model_mtp.safetensors`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de la etiqueta `qwen4_exp` y de la mención a expertos QFN en la advertencia de compatibilidad, lo que sugiere una topología con mezcla de expertos (MoE) o algún esquema de expertos especializados, aunque el número de parámetros activos no se publica. El checkpoint incluye pesos separados para un módulo MTP (multi-token prediction), lo que apunta a un mecanismo de predicción multi-token durante el entrenamiento o la decodificación.

Respecto al entrenamiento original (composición del dataset, número de tokens, uso de RLHF o DPO), no hay datos en la información proporcionada. Lo que sí está documentado es el proceso de cuantización: conversión a INT8 simétrico con grupos de 128 elementos, redondeo nearest-even, escalas en BF16 calculadas como el valor absoluto máximo por grupo dividido entre 127, zero point fijo a 0 y RTN (round-to-nearest). Los grupos cuyo valor máximo es cero usan escala 1. El manifiesto `qfn-int8-manifest.json` registra la revisión de origen (`da29941aee972c7eeab497e05a292c569da1f1d6`).

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base orcarouter/Qwen3.8-Flash-Next-Uncensored; no se detallan en la información disponible.
- Código y matemáticas: no disponible en la documentación del repositorio.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas no está informado).
- Capacidades multimodales: el repositorio incluye configuraciones de preprocesado de imagen y vídeo, lo que sugiere soporte de entrada visual en el modelo base, aunque no se detalla su alcance.
- Predicción multi-token: el checkpoint incluye pesos MTP (`model_mtp.safetensors`).
- Modo "uncensored": el nombre del modelo base indica un ajuste orientado a reducir rechazos, sin que se documenten los detalles del proceso.

## Casos de uso

- Referencia para pipelines de cuantización INT8: el manifiesto y el esquema de conversión (grupos de 128, escalas BF16, RTN) sirven como plantilla reproducible para convertir otros checkpoints de la familia Qwen a INT8 con `compressed-tensors`.
- Evaluación de motores de inferencia: útil para equipos que desarrollan o prueban QEngine y necesitan un artefacto INT8 de gran tamaño para validar el futuro soporte de expertos QFN.
- Investigación sobre cuantización post-entrenamiento: permite estudiar el impacto de INT8 con group size 128 en un modelo de ~126.000 millones de parámetros frente a alternativas como FP8 o GPTQ.
- Archivado y distribución de pesos: el repositorio empaqueta pesos, tokenizer, plantilla de chat y configuraciones de preprocesado, lo que facilita la replicación del entorno en clústeres con almacenamiento suficiente (133 GB).
- Base para fine-tuning futuro: una vez exista soporte de inferencia, podría emplearse como punto de partida para ajustes sobre el modelo base sin censura en dominios especializados.
- Pruebas de integración con `compressed-tensors`: valida la carga y el manejo de checkpoints INT8 con metadatos de cuantización en toolchains compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ninguna evaluación de inferencia, calidad o rendimiento para esta conversión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Como referencia aritmética, 126.200 millones de parámetros en INT8 ocupan aproximadamente 126 GB solo en pesos, a los que hay que sumar el módulo MTP (~2,7 GB) y las cachés KV y activaciones.
- GPU recomendadas: no disponibles. Por tamaño, un despliegue requeriría múltiples aceleradores de gama alta (por ejemplo, varias A100 80 GB o H100 80 GB) o GPUs con memoria unificada de gran capacidad.
- ¿Cabe en GPU de consumo? No de forma realista en una sola unidad; requeriría reparto entre varias GPU o memoria unificada muy grande.
- Opciones de despliegue: la model card advierte de que QEngine no soporta actualmente expertos QFN en INT8, por lo que no hay una ruta de inferencia validada. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-INT8-QEngine (este) | 126.192.584.851 | no disponible | INT8, group size 128 | Qwen Community License 1.0 | Pesos publicados; sin motor de inferencia compatible |
| orcarouter/Qwen3.8-Flash-Next-Uncensored (base) | no disponible | no disponible | BF16 (presumiblemente) | no disponible | Modelo de origen del que deriva esta conversión |
| Alternativas de misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de tamaño y tarea similares en la documentación proporcionada.

## Limitaciones y advertencias

- **No ejecutable con QEngine actual**: la model card indica que QEngine no soporta expertos QFN en INT8; el repositorio no incluye implementación de inferencia compatible.
- **Sin evaluaciones**: no hay datos de calidad, latencia ni rendimiento; no debe asumirse que la conversión preserva el comportamiento del modelo base.
- **Sesgos**: no documentados; el ajuste "uncensored" del modelo base puede aumentar la probabilidad de contenido sensible o inapropiado.
- **Riesgo de alucinación**: no cuantificado para esta conversión.
- **Idiomas**: no se especifican los idiomas soportados.
- **Contexto**: la longitud de contexto no está informada, lo que impide planificar despliegues con ventanas largas.
- **Licencia**: Qwen Community License 1.0 impone condiciones para productos comerciales y servicios de modelos alojados; es necesario revisar el fichero `LICENSE` antes de cualquier uso comercial.
- **Tamaño de almacenamiento**: 133 GB de repositorio, con `model.safetensors` de 130.580.392.128 bytes y `model_mtp.safetensors` de 2.670.277.592 bytes.
- **Madurez del artefacto**: 11 descargas y 0 likes en el momento de la consulta; se trata de una publicación reciente y poco validada por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/born2bewild/Qwen3.8-Flash-Next-Uncensored-INT8-QEngine
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Licencia Qwen Community License 1.0: incluida en el repositorio como `LICENSE`
- Manifiesto de cuantización: `qfn-int8-manifest.json` en el repositorio
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada

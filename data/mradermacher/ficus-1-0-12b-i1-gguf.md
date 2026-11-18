# mradermacher/Ficus-1.0-12B-i1-GGUF

## Resumen

Ficus-1.0-12B-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo Ficus-1.0-12B, publicada por el usuario mradermacher. El modelo base lo desarrolla AuroraSystem y, por el nombre, se trata de un modelo de lenguaje de aproximadamente 12.000 millones de parámetros (el sufijo "12B" del nombre del repo base así lo indica), aunque el dato de parámetros reportado en los safetensors del repo GGUF (3.719.336) corresponde a los tensores del propio contenedor de cuantización y no al recuento real del modelo subyacente. La ficha del repo en Hugging Face no incluye pipeline, licencia ni idiomas declarados.

El interés de esta publicación es práctico: ofrece el modelo base en múltiples niveles de cuantización (desde IQ1_S hasta Q6_K) generadas con imatrix, lo que permite ejecutarlo en hardware de consumo con distintos compromisos entre calidad y uso de memoria. Es relevante para quienes quieran desplegar Ficus-1.0-12B en local mediante llama.cpp u Ollama sin disponer de GPUs de datacenter.

La información pública disponible es muy limitada: no hay model card descriptiva del modelo base en este repo, ni datos de entrenamiento, benchmarks o licencia. Todo lo que sigue se limita a lo que puede inferirse de los metadatos y del contenido del README del repo de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, inferido por el formato GGUF; no confirmado) |
| Parametros totales | 12B según el nombre del modelo base (no confirmado en metadatos); el repo GGUF reporta 3.719.336 tensores/conteo del contenedor, no parámetros del modelo |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones del modelo base en safetensors) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Ficus-1.0-12B en la documentación proporcionada. El nombre y el tamaño apuntan a un transformer decoder-only de aproximadamente 12.000 millones de parámetros, pero no se confirma en los metadatos. Tampoco hay datos sobre composición del dataset, número de tokens de entrenamiento, ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo único documentado es el proceso de cuantización: las cuantizaciones se generaron a partir de https://huggingface.co/AuroraSystem/Ficus-1.0-12B usando cuantización con importance matrix (imatrix), según los comentarios del README (`weighted/imatrix quants`). Se incluyen variantes K-quant estándar y variantes I-quant (IQ1 a IQ4), estas últimas orientadas a mantener calidad en tamaños muy reducidos. El campo `output_tensor_quantised: 1` y `convert_type: hf` indican conversión desde pesos Hugging Face a GGUF.

## Capacidades

- Generación de texto: capacidad esperada de un modelo de lenguaje de 12B, aunque no se documenta explícitamente en la información disponible.
- Razonamiento y código: no disponible (no hay model card que lo confirme).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Despliegue local en estación de trabajo: usar las cuantizaciones Q4_K_M o Q5_K_M con llama.cpp u Ollama para ejecutar el modelo en una GPU de consumo con 12-24 GB de VRAM, aprovechando el formato GGUF para inferencia en CPU/GPU mixta.
- Prototipado rápido sin infraestructura cloud: las variantes IQ3/IQ4 permiten probar el modelo en portátiles con GPU integrada o poca VRAM, a costa de cierta pérdida de calidad.
- Evaluación comparativa de cuantizaciones: el repo incluye 24 variantes, lo que permite medir el impacto de cada nivel de cuantización en tareas concretas antes de fijar una versión para producción.
- Generación de texto en entornos con restricciones de memoria: la variante Q2_K o IQ2_XXS permite correr el modelo en hardware muy limitado cuando la prioridad es disponibilidad sobre fidelidad.
- Integración en pipelines de CI/CD para pruebas de regresión de modelos: usar una cuantización media como referencia estable y ligera en tests automatizados.
- Distribución de demos offline: empaquetar una cuantización Q4_0 o Q4_1 junto a una aplicación de escritorio para demostraciones sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (12B, aproximada según cuantización): Q2_K ~4-5 GB, Q3_K_M ~5-6 GB, Q4_K_M ~7-8 GB, Q5_K_M ~8-9 GB, Q6_K ~10 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4/Q5; RTX 4090 24 GB o A100 40 GB para Q6_K con contexto largo.
- Cabe en GPU de consumo: sí, las variantes Q4 y Q5 en GPUs de 8-16 GB; las variantes IQ1/IQ2 en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ficus-1.0-12B (este repo, GGUF) | ~12B (según nombre) | no disponible | no disponible | GGUF | Cuantizaciones imatrix de 24 variantes |
| Modelos 12B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de alternativas verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa fiable con modelos alternativos.

## Limitaciones y advertencias

- La model card del repo no describe el modelo base: no hay información sobre sesgos, alineación ni datos de entrenamiento.
- Riesgo de alucinación: no evaluado; sin benchmarks ni card descriptiva no puede estimarse.
- Las cuantizaciones de baja precisión (IQ1, IQ2, Q2_K) degradan notablemente la calidad; no se recomiendan para producción.
- Licencia no declarada: no puede confirmarse el uso comercial; verificar la licencia del modelo base AuroraSystem/Ficus-1.0-12B antes de cualquier despliegue.
- Idiomas no declarados: no se puede garantizar un rendimiento multilingüe.
- Contexto no documentado: no se puede planificar el uso con ventanas largas.
- El contador de parámetros del repo (3.719.336) no refleja el tamaño real del modelo; no usarlo para estimar requisitos de memoria.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Ficus-1.0-12B-i1-GGUF
- Modelo base: https://huggingface.co/AuroraSystem/Ficus-1.0-12B

# mrminjae/qwen3p6-35b-a3b-2p10bit-r138

## Resumen

El modelo `mrminjae/qwen3p6-35b-a3b-2p10bit-r138` es un checkpoint de investigación derivado de `Qwen/Qwen3.6-35B-A3B`, un modelo de mezcla de expertos (MoE) multimodal desarrollado por el equipo Qwen de Alibaba. Se trata de una cuantización selectiva: los expertos enrutados del MoE se almacenan con una precisión media de 2,10 bits, mientras que el resto de pesos (atención, embeddings, router, capas densas) se mantienen en BF16. Los pesos se publican dequantizados en tensores BF16, de modo que cargan directamente con `transformers` y vLLM sin necesidad de kernels especiales.

El checkpoint tiene 67.319.436.656 parámetros reales en safetensors y un repositorio de 134,7 GB. El tag `qwen3_5_moe` y el pipeline `image-text-to-text` indican que el modelo base es multimodal (entrada de imagen y texto), aunque la model card no detalla las capacidades exactas de visión. Al ser un checkpoint interno de investigación (ID `r138`), no hay información publicada sobre el dataset de entrenamiento, los idiomas soportados ni los resultados de benchmarks.

Su relevancia actual radica en el interés por técnicas de cuantización extrema aplicadas a MoE: reducir los expertos a ~2 bits manteniendo el resto en BF16 permite reducir el peso del repositorio frente a una versión BF16 completa, a costa de una pérdida de calidad que el autor no cuantifica. Es un artefacto útil para experimentación en entornos de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer, multimodal (image-text-to-text); tag `qwen3_5_moe` |
| Parametros totales | 67.319.436.656 (safetensors); el nombre comercial del base indica 35B-A3B (35B totales, 3B activos, no verificado en este repo) |
| Parametros activos | No disponible (el base sugiere ~3B activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos publicados dequantizados en BF16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica que sigue la licencia del modelo base) |
| Formato de pesos | safetensors (BF16 dequantizado) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.6-35B-A3B` es un transformer con mezcla de expertos: solo una fracción de los parámetros se activa por token (el sufijo A3B sugiere ~3B activos). El checkpoint `r138` no reentrena el modelo, sino que aplica una cuantización selectiva: los expertos enrutados se comprimen a una media de 2,10 bits, mientras que atención, router, embeddings y demás componentes permanecen en BF16. Los pesos se exportan dequantizados a BF16, lo que significa que el ahorro de memoria se produce en el almacenamiento del repositorio, no necesariamente en la VRAM durante la inferencia, ya que al cargarse se expanden a BF16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del base. La model card es mínima y solo identifica el modelo base, el ID interno y la política de licencia.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Entrada de imagen y texto (`image-text-to-text`), según los tags del repositorio; el alcance exacto de las capacidades de visión no está documentado.
- Compatible con endpoints de Hugging Face (`endpoints_compatible`).
- Carga directa con `transformers` y vLLM según el autor.
- Tool calling, function calling, razonamiento multi-paso, thinking mode, audio u otras capacidades especiales: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Investigación en cuantización extrema de MoE: comparar la calidad de un modelo con expertos a 2,10 bits frente al base BF16 en tareas controladas de evaluación, midiendo la degradación por tipo de tarea.
- Experimentación académica con modelos multimodales: estudiar el comportamiento de la rama de visión cuando los expertos están comprimidos, usando el pipeline `image-text-to-text`.
- Pruebas de carga y despliegue con `transformers` y vLLM: validar que los pesos dequantizados en BF16 se cargan sin kernels personalizados y medir el consumo real de VRAM.
- Reproducción de experimentos internos: el ID `r138` permite referenciar un checkpoint concreto en publicaciones o informes técnicos.
- Evaluación de robustez ante alucinaciones: analizar si la compresión a 2 bits de los expertos incrementa la tasa de errores factuales en generación abierta.
- Benchmarking de infraestructura: usar el repositorio de 134,7 GB para medir tiempos de descarga, carga en memoria y throughput en distintos backends.
- Prototipado interno de asistentes conversacionales: solo en entornos de investigación donde la licencia del base lo permita y tras verificar la calidad empíricamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 134,7 GB en safetensors BF16. Al cargarse dequantizado, la VRAM necesaria es comparable a la de un modelo BF16 de ~67B parámetros: del orden de 130-140 GB solo para pesos, más caché KV y activaciones.
- GPU recomendadas: múltiples A100 80 GB o H100 80 GB (2-4 unidades según el contexto y el batch); una sola GPU de 80 GB no es suficiente para los pesos completos en BF16.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en configuraciones de 48 GB sin técnicas adicionales de offload o cuantización en tiempo de carga, que no están documentadas.
- Opciones de despliegue: `transformers` y vLLM según el autor; llama.cpp, Ollama y TGI no están confirmados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r138 | 67,3B (safetensors) | No disponible | No disponible | safetensors BF16 dequantizado | Expertos a 2,10 bits; checkpoint de investigación |
| Qwen/Qwen3.6-35B-A3B (base) | ~35B totales, ~3B activos (según nombre) | No disponible | No disponible | No disponible | Modelo original sin cuantizar |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Checkpoint de investigación interna (`r138`): no hay garantías de calidad ni de estabilidad para uso en producción.
- La cuantización a 2,10 bits de los expertos puede degradar el rendimiento en tareas sensibles a la precisión (matemáticas, código, razonamiento profundo); no se han publicado evaluaciones que lo cuantifiquen.
- La licencia no está declarada en el repositorio; la model card remite a la del modelo base, que debe verificarse antes de cualquier uso comercial.
- Idiomas soportados no documentados: no se puede asumir un rendimiento multilingüe sin pruebas.
- Longitud de contexto no disponible: planificar el despliegue sin asumir ventanas largas.
- Riesgo de alucinación inherente a los modelos generativos, potencialmente agravado por la compresión de los expertos.
- El tamaño del repositorio (134,7 GB) y la carga en BF16 implican requisitos de hardware elevados y tiempos de descarga considerables.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r138
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B

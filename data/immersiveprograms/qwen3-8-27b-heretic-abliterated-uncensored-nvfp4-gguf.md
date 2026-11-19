# ImmersivePrograms/Qwen3.8-27B-Heretic-Abliterated-Uncensored-NVFP4-GGUF

## Resumen

El modelo `ImmersivePrograms/Qwen3.8-27B-Heretic-Abliterated-Uncensored-NVFP4-GGUF` es un artefacto publicado en Hugging Face por el usuario ImmersivePrograms. Por su nomenclatura, se trata de un derivado del modelo Qwen3 de 27B de parámetros, presumiblemente afinado para eliminar restricciones de alineación (las etiquetas "Heretic", "Abliterated" y "Uncensored" son habituales en la comunidad de modelos sin censura) y cuantizado en formato NVFP4 y GGUF. La model card publicada no contiene más información que la línea de licencia, por lo que no es posible confirmar ninguno de estos extremos con la documentación disponible.

El repositorio presenta un tamaño de 0.0 GB, cero descargas y cero likes, y fue creado y actualizado el 2026-11-19 con apenas once minutos de diferencia. Estos datos sugieren una publicación reciente, vacía o incompleta: no hay pesos verificables, ni pipeline declarado, ni idiomas soportados, ni documentación técnica. Cualquier evaluación de sus capacidades, arquitectura o rendimiento carece de base documental en la información proporcionada.

La relevancia de esta ficha es, por tanto, limitada y fundamentalmente descriptiva: sirve para dejar constancia de la existencia del artefacto y de la ausencia de datos técnicos verificables. No se recomienda su uso en producción ni su evaluación comparativa sin una inspección directa del repositorio y de los pesos, que aquí no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, derivada de Qwen3, sin confirmar) |
| Parametros totales | 27B (según el nombre del repositorio; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 y GGUF (según el nombre del repositorio) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF y NVFP4 (según el nombre del repositorio; el repositorio figura con 0.0 GB) |

## Arquitectura y entrenamiento

No hay información en la model card sobre la arquitectura del modelo, los datos de entrenamiento, el número de tokens procesados, la composición del dataset ni las técnicas de alineación empleadas (RLHF, DPO u otras). El nombre del repositorio sugiere un proceso de "abliteración" o eliminación de rechazos sobre un modelo base Qwen3 de 27B, pero no se aporta ninguna evidencia documental que lo respalde.

Tampoco se detalla el proceso de cuantización a NVFP4 ni a GGUF, ni las herramientas utilizadas, ni los niveles de precisión resultantes. La ausencia de pesos en el repositorio (0.0 GB) impide cualquier verificación técnica de la arquitectura o del proceso de entrenamiento.

## Capacidades

- No se documentan capacidades específicas en la información disponible.
- No se confirma soporte de tool calling ni de function calling.
- No se confirma soporte de agentes ni de razonamiento multi-paso.
- No se confirman capacidades multilingües.
- No se confirman modos especiales (thinking mode, visión, audio u otros).
- El nombre del repositorio sugiere un modelo sin restricciones de alineación, pero no hay documentación que lo describa.

## Casos de uso

- No es posible recomendar casos de uso concretos sin documentación técnica ni pesos verificables.
- Cualquier aplicación en atención al cliente, generación de código, análisis documental o investigación requeriría primero validar la existencia y la integridad de los pesos.
- La ausencia de pipeline declarado y de idiomas soportados impide planificar despliegues multilingües.
- La falta de datos sobre contexto y cuantización impide estimar requisitos de memoria o latencia para aplicaciones en tiempo real.
- El estado vacío del repositorio desaconseja cualquier integración en pipelines de CI/CD o en sistemas de producción.
- No se dispone de información para evaluar su idoneidad en tareas de razonamiento, matemáticas o generación de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se dispone de datos verificables sobre VRAM necesaria para inferencia.
- No se dispone de recomendaciones de GPU (A100, H100, RTX 4090 u otras).
- No se puede confirmar si el modelo cabe en GPU de consumo.
- No se documentan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI u otras), aunque el formato GGUF sugiere compatibilidad potencial con llama.cpp y Ollama.
- No se dispone de estimaciones de latencia ni de throughput.
- El repositorio figura con 0.0 GB, por lo que no hay pesos descargables que permitan medir requisitos reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ImmersivePrograms/Qwen3.8-27B-Heretic-Abliterated-Uncensored-NVFP4-GGUF | 27B (según nombre) | no disponible | apache-2.0 | Repositorio vacío (0.0 GB) |
| Qwen3-32B (referencia de la familia Qwen3) | 32B | no disponible en esta ficha | apache-2.0 | Público en Hugging Face |
| Alternativas de 27B-32B sin censura | no disponible | no disponible | variable | variable |

No se dispone de datos suficientes para una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no contiene información técnica: no hay arquitectura, datos de entrenamiento, benchmarks ni idiomas declarados.
- El repositorio figura con 0.0 GB, lo que sugiere que los pesos no están publicados o la publicación está incompleta.
- Cero descargas y cero likes: no hay evidencia de uso ni de validación por parte de la comunidad.
- El nombre del modelo indica un proceso de eliminación de alineación ("uncensored", "abliterated"), lo que implica un mayor riesgo de generar contenido inapropiado, sesgado o dañino.
- No se puede evaluar el riesgo de alucinación sin pesos ni documentación.
- La licencia apache-2.0 permite uso comercial, pero la ausencia de pesos y de documentación impide verificar el cumplimiento de las obligaciones de atribución.
- No se recomienda su uso en producción sin una inspección directa del repositorio y de los pesos.
- La fecha de creación (2026-11-19) y la actualización once minutos después sugieren una publicación apresurada o incompleta.

## Enlaces

- Hugging Face: https://huggingface.co/ImmersivePrograms/Qwen3.8-27B-Heretic-Abliterated-Uncensored-NVFP4-GGUF
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.

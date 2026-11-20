# GavinCodework/Qwen3.5-0.8B-Heretic-GGUF

## Resumen

Qwen3.5-0.8B-Heretic-GGUF es una distribución en formato GGUF del modelo Qwen3.5-0.8B, publicado por el usuario GavinCodework. Se trata de una variante "abliterated" (también etiquetada como "uncensored" y "heretic"), es decir, un ajuste fino orientado a eliminar o reducir los mecanismos de rechazo y las restricciones de contenido del modelo base original de Qwen. El modelo base es Qwen/Qwen3.5-0.8B, con 752.393.024 parámetros reales en safetensors, lo que lo sitúa en la categoría de modelos ultraligeros.

La relevancia de esta ficha radica en que ofrece una versión cuantizada y sin censura de un modelo pequeño, pensada para ejecutarse en `llama.cpp`, LM Studio y Ollama, con requisitos de hardware muy bajos. Está licenciado bajo Apache 2.0 y se distribuye en cinco cuantizaciones (f16, Q8_0, Q6_K, Q5_K_M y Q4_K_M). No se dispone de información sobre longitud de contexto, idiomas soportados ni resultados de benchmarks en la documentación proporcionada.

La model card advierte de que el modelo emplea la arquitectura `qwen35` y requiere `llama.cpp` versión 1.0.0 (build b8149+) o superior para funcionar correctamente, lo que es un requisito crítico de compatibilidad para cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35 (transformer, según nomenclatura del autor) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE según los datos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 4,1 GB) |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen35`, la familia de modelos Qwen 3.5 de Alibaba. Se trata de un transformer de 752 millones de parámetros, aunque no se dispone de detalles sobre número de capas, dimensiones ocultas, mecanismo de atención ni longitud de contexto en la información proporcionada. El modelo base es Qwen/Qwen3.5-0.8B, del cual esta versión deriva mediante un proceso de "abliteration" o ajuste tipo "heretic", orientado a reducir los rechazos de contenido.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) más allá de la propia cuantización GGUF para inferencia en CPU y GPU de gama baja.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Comportamiento "uncensored"/"abliterated": menor tendencia a rechazar peticiones, orientado a usos sin filtros de contenido.
- Compatibilidad con `llama.cpp`, LM Studio y Ollama para despliegue local.
- Soporte de endpoints compatibles (etiqueta `endpoints_compatible`).
- No se documentan capacidades de código, matemáticas, visión, audio, tool calling ni agentes en la información disponible.
- Capacidades multilingües: no disponibles en la documentación.

## Casos de uso

- Inferencia local en hardware modesto: al tratarse de un modelo de 752 millones de parámetros en GGUF, puede ejecutarse en CPU y en GPUs de consumo, lo que lo hace adecuado para pruebas y prototipado en equipos sin aceleradores dedicados.
- Experimentación con modelos sin censura: útil para investigadores que estudian el comportamiento de modelos "abliterated" y comparan respuestas con el modelo base original.
- Chat conversacional offline: integrable en LM Studio u Ollama para asistentes locales sin conexión, aprovechando su naturaleza conversacional.
- Prototipado rápido de pipelines con `llama.cpp`: sirve como modelo de prueba para validar integraciones antes de escalar a modelos mayores de la familia Qwen.
- Educación y demostraciones: su tamaño reducido y licencia Apache 2.0 permiten usarlo en entornos docentes para explicar cuantización y despliegue local.
- Pruebas de robustez y seguridad: permite evaluar cómo se comporta una variante sin censura frente a la versión original en tareas de moderación y alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 752 millones de parámetros, las cuantizaciones Q4_K_M y Q5_K_M deberían ocupar del orden de 0,5 a 0,7 GB, y f16 alrededor de 1,5 GB (estimación orientativa, no confirmada en la documentación).
- GPU recomendadas: no disponibles en la información proporcionada.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no se confirma en la documentación.
- Opciones de despliegue: `llama.cpp` (versión 1.0.0, build b8149+ o superior), LM Studio y Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Heretic-GGUF | 752.393.024 | no disponible | Apache 2.0 | GGUF | Variante abliterated; requiere llama.cpp b8149+ |
| Qwen/Qwen3.5-0.8B (base) | 752.393.024 | no disponible | no disponible | safetensors | Modelo original con alineación estándar |
| Otras variantes Qwen 3.5 de 0,8B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Al ser una variante "abliterated"/"uncensored", puede generar contenido inapropiado, ofensivo o inseguro; no se recomienda su uso en producción orientada a usuarios finales sin moderación adicional.
- Riesgo de alucinación elevado por su reducido tamaño (752 millones de parámetros).
- No se documentan sesgos conocidos, pero al derivar de un modelo base no se garantiza la ausencia de sesgos heredados.
- Longitud de contexto e idiomas soportados no disponibles; no debe asumirse un contexto largo.
- Requiere `llama.cpp` versión 1.0.0 (build b8149+) o superior; versiones anteriores no son compatibles con la arquitectura `qwen35`.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo modificado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/GavinCodework/Qwen3.5-0.8B-Heretic-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.

# Mir2k/Qwen3.5-Coder-14B-GGUF

## Resumen

Qwen3.5-Coder-14B-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo Qwen3.5-Coder-14B, publicado por el usuario Mir2k en Hugging Face. El repositorio no contiene un modelo original, sino una conversión a formatos de cuantización (Q4_K_M, Q5_K_M, Q8_0) generada con `llama.cpp` y, según la model card, verificada mediante generación real antes de su publicación. El modelo base pertenece a la familia Qwen3.5-Coder, orientada a tareas de generación de código, aunque el repositorio no aporta documentación técnica sobre dicha familia.

La información disponible es extremadamente limitada: el repositorio no incluye pipeline declarado, idiomas soportados, ni detalles sobre arquitectura, parámetros activos o longitud de contexto del modelo original. La licencia declarada es Apache 2.0, lo que permite uso comercial y modificación, siempre que se mantengan los avisos de atribución correspondientes.

El interés de este repositorio reside en facilitar el despliegue local del modelo mediante `llama.cpp` y herramientas compatibles con GGUF, reduciendo los requisitos de memoria frente a los pesos en precisión completa. No obstante, al no existir benchmarks, documentación del modelo base ni verificación independiente de las cuantizaciones, debe tratarse como un artefacto de disponibilidad incierta para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre del modelo sugiere 14B, sin confirmación oficial) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 (según model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Qwen3.5-Coder-14B en la información proporcionada. El nombre sugiere un transformer denso de aproximadamente 14 mil millones de parámetros, pero este dato no está confirmado por la documentación del repositorio ni por una model card detallada. Tampoco se especifican datos de entrenamiento, número de tokens, composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

Respecto al proceso de cuantización, la model card indica que las versiones GGUF se generaron con `llama.cpp` y que fueron verificadas mediante generación real antes de su publicación. No se detallan los parámetros exactos de conversión, la versión de `llama.cpp` utilizada, ni los criterios de verificación aplicados.

## Capacidades

- Generación de código: el nombre del modelo sugiere especialización en tareas de programación, aunque no se documentan capacidades concretas.
- Generación de texto: no confirmada explícitamente en la información disponible.
- Razonamiento y matemáticas: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue local de asistencia a la programación: al distribuirse en GGUF, el modelo puede ejecutarse con `llama.cpp` u Ollama en estaciones de trabajo sin GPU de datacenter, permitiendo autocompletado y generación de código en entornos con requisitos de privacidad.
- Integración en editores e IDE: mediante servidores compatibles con la API de OpenAI expuestos por `llama.cpp`, podría conectarse a extensiones de código para sugerencias en línea, siempre que se valide previamente la calidad del modelo base.
- Prototipado de pipelines de revisión de código: uso en tareas de análisis estático asistido, generación de tests unitarios o explicación de fragmentos, con verificación humana obligatoria dada la ausencia de benchmarks.
- Experimentación académica con cuantizaciones: útil para estudiar el impacto de Q4_K_M, Q5_K_M y Q8_0 en la calidad de generación de código sobre un mismo modelo base.
- Entornos air-gapped: al poder ejecutarse completamente en local, encaja en organizaciones que no pueden enviar código a APIs externas.
- Evaluación comparativa de formatos GGUF: sirve como artefacto para medir latencia y consumo de memoria de distintas cuantizaciones en hardware consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de ~14B en GGUF: Q4_K_M requiere aproximadamente 8-10 GB, Q5_K_M en torno a 10-12 GB y Q8_0 alrededor de 15-16 GB, sin contar overhead de contexto. Estas cifras son estimaciones genéricas y no han sido verificadas para este repositorio.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar compatibilidad con RTX 4090 (24 GB), RTX 3090 (24 GB), A100 y H100, pero no está confirmado.
- Cabe en GPU consumer: probablemente en GPUs con 12 GB o más para Q4_K_M, y 16 GB o más para Q8_0, sujeto a verificación.
- Opciones de despliegue: `llama.cpp`, Ollama, y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- No se dispone de model card detallada del modelo base ni de enlaces al repositorio original de Qwen3.5-Coder-14B.
- Las cuantizaciones han sido generadas por un tercero no verificado; no hay garantía de que los pesos correspondan exactamente al modelo base declarado.
- No hay benchmarks publicados que permitan evaluar la degradación de calidad introducida por cada cuantización.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base original también se distribuya bajo la misma licencia.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.
- Idiomas soportados y longitud de contexto: no documentados, lo que impide planificar su uso en escenarios multilingües o con contextos largos.
- Fecha de creación declarada (2026-11-22): conviene verificar la coherencia temporal del repositorio antes de confiar en él para producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mir2k/Qwen3.5-Coder-14B-GGUF
- Repositorio de `llama.cpp`: no incluido en la información proporcionada.
- Paper, blog o demo del modelo base: no disponible.

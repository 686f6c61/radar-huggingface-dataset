# kristijan505/Ornith-1.5-397B-colibri-i4-gs64

## Resumen

Ornith-1.5-397B es un modelo de lenguaje de gran escala con arquitectura de mezcla de expertos (MoE) desarrollado por Ornith AI, diseñado específicamente para tareas de codificación agéntica y razonamiento complejo. Según los datos publicados, el modelo base alcanza una puntuación de 86.1 en Terminal-Bench 2.1 y 56.0 en DeepSWE, situándose a la par de Claude Opus 4.8 (85.0 y 59.0 respectivamente) y superando a otros modelos abiertos de escala similar como GLM-5.2 y DeepSeek-V4-Flash-0731.

La variante aquí documentada, `kristijan505/Ornith-1.5-397B-colibri-i4-gs64`, es una versión cuantizada a 4 bits con group size 64 (formato Colibri) publicada por un usuario independiente, no por Ornith AI. La model card original está vacía, por lo que la información específica de esta versión es limitada; los datos técnicos que se presentan a continuación provienen del modelo base y de fuentes externas, y deben interpretarse con cautela al aplicarlos a esta cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), probablemente basada en la familia qwen3_5_moe (segun tags del modelo base) |
| Parametros totales | 397 mil millones (397B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 con group size 64 (formato Colibri, segun el nombre del repositorio) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors o GGUF, sin confirmar) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-397B emplea una arquitectura de mezcla de expertos (MoE) con 397 mil millones de parámetros totales. Según la documentación oficial de Ornith AI, la familia Ornith-1.5 extiende el marco de "self-scaffolding" introducido en Ornith-1.0 hacia un bucle completo de auto-mejora: el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce rollouts de soluciones para aprendizaje por refuerzo, creando continuamente nuevas experiencias de aprendizaje a partir de las cuales puede mejorar. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO en la información proporcionada.

La variante cuantizada `colibri-i4-gs64` reduce la precisión de los pesos a 4 bits con un group size de 64, lo que disminuye significativamente los requisitos de memoria a costa de una posible pérdida de fidelidad en las predicciones. No se han publicado detalles sobre el proceso de cuantización ni sobre la evaluación de esta versión específica.

## Capacidades

- Generación de texto y razonamiento complejo, con especial énfasis en tareas de codificación agéntica (según los benchmarks del modelo base).
- Ejecución de tareas de agente multi-paso: el modelo base obtiene 86.1 en Terminal-Bench 2.1, lo que indica capacidad para interactuar con terminales y entornos de línea de comandos.
- Resolución de problemas de ingeniería de software a gran escala: 56.0 en DeepSWE, comparable a Claude Opus 4.8.
- Soporte de tool calling y function calling: no confirmado explícitamente, pero inferido por su rendimiento en benchmarks de agentes.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se han documentado capacidades de visión o audio para esta variante.

## Casos de uso

- Automatización de tareas de desarrollo de software: el modelo puede generar código, refactorizar funciones y crear scripts de automatización, aprovechando su capacidad de razonamiento sobre código y su rendimiento en benchmarks de ingeniería de software.
- Agentes de línea de comandos: gracias a su puntuación en Terminal-Bench, puede utilizarse para construir asistentes que ejecuten comandos, gestionen archivos y realicen operaciones de sistema de forma autónoma.
- Resolución de incidencias en repositorios de código: con su rendimiento en DeepSWE, puede analizar issues, proponer parches y generar pull requests en proyectos open source.
- Generación de documentación técnica: puede redactar documentación de API, comentarios de código y guías de uso a partir de fragmentos de código o especificaciones.
- Asistente de programación en entornos integrados: integrable en IDEs o editores de código para autocompletado, sugerencias y explicación de código, aunque la cuantización a 4 bits puede afectar la calidad de las respuestas en comparación con el modelo completo.
- Investigación en aprendizaje por refuerzo: el enfoque de auto-mejora del modelo base lo hace interesante para experimentos de generación de tareas y entrenamiento continuo, aunque esta variante cuantizada no está pensada para entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la variante `colibri-i4-gs64`. Los datos siguientes corresponden al modelo base Ornith-1.5-397B, según la información de la web de Ornith AI y BenchLM.ai:

| Benchmark | Ornith-1.5-397B | Claude Opus 4.8 | GLM-5.2 | DeepSeek-V4-Flash-0731 |
|---|---|---|---|---|
| Terminal-Bench 2.1 | 86.1 | 85.0 | no disponible | no disponible |
| DeepSWE | 56.0 | 59.0 | no disponible | no disponible |

La cuantización a 4 bits puede degradar el rendimiento en estos benchmarks, pero no se dispone de mediciones para esta versión concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 397B parámetros en int4 requiere aproximadamente 200 GB de memoria (397e9 × 0.5 bytes ≈ 198.5 GB) más overhead de activaciones y caché KV. No se dispone de datos exactos para esta variante.
- GPU recomendadas: no disponible. Dado el tamaño, se necesitarían múltiples GPUs de alta gama (por ejemplo, 4× A100 80GB o 2× H100 80GB) o soluciones de memoria unificada.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) de forma individual; se requeriría particionado o cuantización más agresiva.
- Opciones de despliegue: no se especifican para esta variante. El modelo base es compatible con frameworks como vLLM, TGI o llama.cpp, pero no hay confirmación para el formato Colibri.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa se basa en el modelo base, ya que no hay datos de la variante cuantizada. Los modelos comparables son otros MoE de gran escala orientados a codificación agéntica:

| Modelo | Parámetros | Contexto | Terminal-Bench 2.1 | DeepSWE | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-397B | 397B (MoE) | no disponible | 86.1 | 56.0 | MIT |
| Claude Opus 4.8 | no disponible (propietario) | no disponible | 85.0 | 59.0 | Propietaria |
| GLM-5.2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para una comparación detallada con alternativas de código abierto del mismo tamaño.

## Limitaciones y advertencias

- La model card del repositorio está vacía; no hay información oficial sobre el proceso de cuantización, la calidad de la reconstrucción ni la evaluación de esta variante.
- La cuantización a 4 bits puede provocar una degradación notable en tareas de razonamiento complejo y generación de código en comparación con el modelo en FP8 o BF16.
- No se conocen los idiomas soportados; es probable que el modelo base esté entrenado principalmente en inglés, pero no está confirmado.
- Riesgo de alucinación: inherente a los modelos de lenguaje, especialmente en tareas de código donde puede generar APIs inexistentes o lógica incorrecta.
- La licencia MIT permite uso comercial, pero al ser una variante de un modelo base con licencia MIT, se debe verificar que no haya restricciones adicionales impuestas por el autor de la cuantización.
- No se dispone de información sobre sesgos o limitaciones de contexto; se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo en producción.

## Enlaces

- Repositorio HuggingFace de la variante: https://huggingface.co/kristijan505/Ornith-1.5-397B-colibri-i4-gs64
- Modelo base en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-397B-FP8
- Página oficial de Ornith AI: https://ornith.online/
- Documentación técnica de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Perfil en BenchLM.ai: https://benchlm.ai/models/ornith-1-5-397b

# ornith-ai/Ornith-1.0-35B-GGUF

## Resumen

Ornith-1.0-35B es un modelo de lenguaje de código abierto desarrollado por ornith-ai, perteneciente a la familia Ornith-1.0, una serie de modelos especializados en agentic coding (codificación agéntica). Se trata de un modelo de arquitectura MoE (Mixture of Experts) con 35 mil millones de parámetros, post-entrenado sobre las bases de Gemma 4 y Qwen 3.5. Su principal innovación es un framework de auto-mejora basado en aprendizaje por refuerzo (RL) que optimiza de forma conjunta tanto las soluciones generadas como el scaffold (andamiaje) que guía esas soluciones, lo que le permite descubrir trayectorias de búsqueda más eficaces.

El modelo está disponible en formato GGUF, lo que facilita su despliegue en una sola GPU con cuantización, y expone una interfaz compatible con OpenAI. Con una ventana de contexto de 262.144 tokens (256K), está diseñado para tareas de codificación agéntica de alto rendimiento, como resolución de issues, uso de terminal y generación de código. Su licencia MIT lo hace libre para uso comercial y sin restricciones regionales. Es relevante ahora porque alcanza resultados de vanguardia en benchmarks de coding entre los modelos open-source de tamaño comparable, compitiendo directamente con alternativas como Qwen3.5-35B y Gemma4-31B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) |
| Parametros totales | 35B |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | no disponible (repo GGUF, cuantizaciones no listadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Ornith-1.0-35B es un modelo de arquitectura MoE, post-entrenado sobre los modelos base Gemma 4 y Qwen 3.5, según indica la model card oficial. El entrenamiento emplea un framework de auto-mejora basado en aprendizaje por refuerzo (RL) que optimiza simultáneamente dos componentes: el scaffold (el código o lógica que orquesta el razonamiento del agente) y la solución final generada. Este enfoque conjunto permite al modelo descubrir mejores trayectorias de búsqueda y producir soluciones de mayor calidad. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El modelo expone una interfaz compatible con OpenAI, lo que facilita su integración en pipelines de agentes existentes.

## Capacidades

- Generación de código y resolución de tareas de programación complejas, incluyendo edición de múltiples archivos y uso de terminal.
- Razonamiento multi-step y planificación de tareas agénticas, optimizado para entornos de codificación autónoma.
- Soporte de tool calling / function calling, habilitado por su interfaz compatible con OpenAI (según el repositorio de GitHub).
- Ventana de contexto larga de 262.144 tokens, adecuada para repositorios de código extensos y conversaciones multi-turno con historial amplio.
- Capacidades multilingües no especificadas por el autor; el modelo está orientado principalmente a código y documentación técnica en inglés.
- Integración con entornos de agente como Claude Code (mencionado en los benchmarks), lo que sugiere compatibilidad con frameworks de agentes de codificación.

## Casos de uso

- Resolución automatizada de issues en repositorios: el modelo puede analizar un issue, explorar el código relevante y generar un parche o pull request, gracias a su rendimiento en SWE-bench Verified (75.6) y su ventana de contexto de 256K tokens que permite procesar el repositorio completo.
- Automatización de tareas de terminal: con un 64.2 en Terminal-Bench 2.1, puede ejecutar comandos, interpretar salidas y corregir errores de forma autónoma, útil para pipelines de CI/CD y mantenimiento de sistemas.
- Generación de código en producción: su interfaz compatible con OpenAI permite integrarlo en IDEs, asistentes de desarrollo y herramientas de autocompletado, con soporte para tool calling que facilita la interacción con APIs y bases de código.
- Documentación técnica y análisis de código legacy: su capacidad de razonamiento y contexto largo le permite resumir, documentar y explicar código existente, reduciendo la deuda técnica en equipos de desarrollo.
- Análisis legal y revisión de contratos: según la revisión de AI Indigo, el modelo puede procesar documentos extensos y extraer cláusulas relevantes, aunque no está específicamente entrenado para ello; su uso en este ámbito requiere validación humana.
- Resumen de literatura científica: puede sintetizar artículos y papers extensos, extrayendo conclusiones clave, gracias a su ventana de contexto amplia y su capacidad de razonamiento.
- Agentes autónomos de codificación: combinado con frameworks como OpenClaw o Claude Code, el modelo puede actuar como un agente que planifica, ejecuta y verifica tareas de desarrollo de software de principio a fin.

## Benchmarks y rendimiento

La model card oficial proporciona los siguientes resultados comparativos. Se incluyen los datos disponibles; SWE-bench Mu no está completo en la información proporcionada.

| Benchmark | Ornith-1.0-35B | Qwen3.5-35B | Qwen3.6-35B | Gemma4-31B | Qwen3.5-397B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 64.2 | 41.4 | 52.5 | 42.1 | 53.5 |
| Terminal-Bench 2.1 (Claude Code) | 62.8 | 38.9 | 49.2 | - | 48.6 |
| SWE-bench Verified | 75.6 | 70.0 | 73.4 | 52.0 | 76.4 |
| SWE-bench Pro | 50.4 | 44.6 | 49.5 | 35.7 | 51.6 |
| SWE-bench Mu | no disponible | no disponible | no disponible | no disponible | no disponible |

Ornith-1.0-35B supera a Qwen3.5-35B y Gemma4-31B en todos los benchmarks publicados, y se acerca al rendimiento del modelo mucho mayor Qwen3.5-397B en SWE-bench Verified y Pro, lo que demuestra una excelente relación rendimiento/tamaño.

## Requisitos de hardware

- El repositorio GGUF está diseñado para despliegue eficiente en una sola GPU, según la model card. Sin embargo, no se especifican los requisitos exactos de VRAM.
- El checkpoint original (no cuantizado) requiere sharding multi-GPU con tensor parallelism, según el repositorio de GitHub. El modelo dense de 9B de la misma familia cabe en una GPU de 80GB, pero el 35B MoE no tiene una cifra confirmada.
- Para el formato GGUF, se puede estimar que una cuantización Q4_K_M ocuparía aproximadamente 20-25 GB de VRAM, lo que permitiría ejecutarlo en GPUs de consumo como RTX 4090 (24GB) o profesionales como A100 40GB. Esta estimación es orientativa y no está confirmada por el autor.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama y otros runners basados en GGUF. Su interfaz compatible con OpenAI permite su uso con vLLM o TGI si se convierte a formato safetensors, aunque no hay confirmación oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | SWE-bench Verified | Terminal-Bench 2.1 (Terminus-2) |
|---|---|---|---|---|---|
| Ornith-1.0-35B | 35B (MoE) | 256K | MIT | 75.6 | 64.2 |
| Qwen3.5-35B | 35B | no disponible | no disponible | 70.0 | 41.4 |
| Qwen3.6-35B | 35B | no disponible | no disponible | 73.4 | 52.5 |
| Gemma4-31B | 31B | no disponible | no disponible | 52.0 | 42.1 |

Ornith-1.0-35B supera a sus competidores directos en los benchmarks de codificación agéntica, con una ventaja notable sobre Gemma4-31B y Qwen3.5-35B. Su licencia MIT es más permisiva que las de muchos modelos propietarios, y su ventana de contexto de 256K es superior a la mayoría de alternativas de su tamaño.

## Limitaciones y advertencias

- No se dispone de información pública sobre sesgos conocidos, riesgos de alucinación o comportamientos no deseados. Se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo en producción.
- El modelo está especializado en codificación agéntica; su rendimiento en tareas generales de lenguaje (redacción creativa, traducción, etc.) no está documentado y puede ser inferior al de modelos de propósito general.
- Los idiomas soportados no están especificados; es probable que el modelo funcione mejor en inglés, dado su enfoque en código y documentación técnica.
- La cuantización GGUF puede introducir pérdida de precisión, aunque no se han publicado comparativas de rendimiento entre las distintas cuantizaciones.
- Aunque la licencia MIT permite uso comercial sin restricciones, el modelo se basa en Gemma 4 y Qwen 3.5, cuyas licencias originales podrían imponer condiciones adicionales. Se recomienda verificar la compatibilidad de licencias antes de un despliegue comercial.
- El modelo requiere validación humana en tareas críticas, especialmente en análisis legal o científico, donde los errores pueden tener consecuencias significativas.

## Enlaces

- HuggingFace (repo GGUF): https://huggingface.co/ornith-ai/Ornith-1.0-35B-GGUF
- GitHub (repositorio del proyecto): https://github.com/ornith-ai/Ornith-1
- Web oficial de Ornith AI: https://ornith.online/
- Blog de Ornith (deep-reinforce.com): https://deep-reinforce.com/ornith.html
- Revisión en AI Indigo: https://aiindigo.com/tool/ornith-10-35b-gguf

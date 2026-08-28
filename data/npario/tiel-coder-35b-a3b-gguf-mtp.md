# npario/Tiel-Coder-35B-A3B-GGUF-MTP

## Resumen

Tiel-Coder-35B-A3B-GGUF-MTP es una cuantización GGUF del modelo Ornith-1.5-35B-A3B, un MoE de 35B parámetros totales con 3B activos, desarrollado por npario sobre el trabajo de peculiar-ragdoll. El modelo está optimizado para tareas de codificación agéntica (agentic coding) y conversaciones multi-turno largas, sacrificando deliberadamente rendimiento en conocimiento enciclopédico y razonamiento de examen para ganar velocidad y eficiencia en flujos de trabajo reales de desarrollo de software.

La principal innovación de esta versión es la inclusión de un bloque de predicción multi-token (MTP, `nextn`) que actúa como modelo draft para decodificación especulativa en llama.cpp, permitiendo acelerar la generación sin pérdida de calidad. El bloque MTP fue reparado, ya que en la versión original del modelo base venía con una inicialización aleatoria que lo hacía inservible. El modelo también incluye soporte de visión mediante un proyector `mmproj-BF16.gguf` heredado de Ornith.

Es relevante ahora porque ofrece un equilibrio único entre velocidad, calidad de codificación y capacidad de conversación para ejecutarse en hardware de consumo (32 GB de RAM), compitiendo en tareas SWE-bench-Live con modelos propietarios mucho más grandes como Opus 4.6.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.6-35B-A3B, con bloque MTP para decodificación especulativa |
| Parametros totales | 35B (MoE) — el dato de safetensors de 446.571.248 corresponde al bloque MTP, no al modelo completo |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible (heredado del modelo base Ornith-1.5-35B-A3B) |
| Tipos de cuantizacion | Q4_K_XL (23.3 GB) y Q5_K_XL (27.5 GB), ambas con imatrix y cuantización dinámica unsloth |
| Idiomas soportados | en, zh (según frontmatter) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors para el proyector de visión) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es una variante de Qwen3.6-35B-A3B, un transformer MoE con 35B parámetros totales y 3B activos por token. Esta versión no es un entrenamiento nuevo, sino una recuantización dinámica con imatrix propia y la integración del "Sharp chat template" (de peculiar-ragdoll) dentro del GGUF. El bloque MTP, que predice el siguiente token para decodificación especulativa, fue reparado: en el modelo base estaba inicializado aleatoriamente (desviación estándar 0.020, kurtosis 3.00) y no funcionaba; tras la reparación, es funcional y se activa en llama.cpp con `--spec-type draft-mtp`.

El modelo incluye un proyector de visión (`mmproj-BF16.gguf`) pasado sin modificar desde Ornith, lo que le permite procesar imágenes. No se han publicado detalles sobre el dataset de entrenamiento del modelo base, pero se sabe que la cuantización utiliza una imatrix calculada sobre datos propios y la técnica unsloth-dynamic para distribuir la precisión según la importancia de cada capa.

## Capacidades

- Generación de código y corrección de errores en repositorios reales: resuelve 12 de 25 problemas de SWE-bench-Live, al nivel de Opus 4.6 medium.
- Codificación agéntica: puede trabajar en tareas multi-paso con razonamiento y ejecución de herramientas, con un tiempo medio por intento de 12.3 minutos (mediana 8.6).
- Conversación multi-turno: puntuación 67.2 en Claw-Eval, superior a su modelo base (65.3) y a Nail (60.5), manteniendo la utilidad en diálogos largos.
- Soporte de visión: procesamiento de imágenes mediante el proyector `mmproj-BF16.gguf`, compartido con el modelo base.
- Decodificación especulativa: el bloque MTP acelera la inferencia en llama.cpp sin cambiar la salida, activable con `--spec-type draft-mtp`.
- Multilingüe limitado: inglés y chino declarados, aunque el modelo base puede tener cobertura adicional no documentada.
- Sin modo "thinking" explícito: el template Sharp prioriza respuestas concisas, lo que reduce la verbosidad pero también el rendimiento en razonamiento de examen (MMLU-Pro 73.7).

## Casos de uso

- Asistente de codificación en IDE: el modelo puede integrarse en editores como VS Code o Neovim vía llama.cpp, ofreciendo autocompletado y corrección de código con baja latencia gracias al MTP. Su tamaño (23 GB en Q4) permite ejecutarlo en una RTX 4090 o similar.
- Automatización de tareas de mantenimiento de repositorios: con su capacidad agéntica, puede analizar issues, proponer parches y ejecutar tests en pipelines de CI/CD, reduciendo el tiempo de resolución de bugs (8.6 minutos de mediana por intento).
- Chatbot de soporte técnico con contexto largo: su rendimiento en conversaciones multi-turno (67.2 en Claw-Eval) lo hace adecuado para sistemas de atención al cliente que requieren recordar el historial de la conversación y mantener coherencia.
- Análisis de capturas de pantalla y diagramas: gracias al soporte de visión, puede interpretar imágenes de errores de interfaz, diagramas de arquitectura o documentación visual y generar código o explicaciones al respecto.
- Generación de código en entornos con restricciones de hardware: al caber en 32 GB de RAM, puede desplegarse en estaciones de trabajo sin GPUs de datacenter, usando CPU o GPUs de gama media con llama.cpp.
- Prototipado rápido de agentes conversacionales: su licencia MIT y formato GGUF facilitan la integración en frameworks como LangChain o LlamaIndex para construir asistentes que ejecuten acciones sobre APIs y bases de código.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor, evaluados sobre 25 problemas de SWE-bench-Live, 114 conversaciones de Claw-Eval y MMLU-Pro a 4-bit.

| Benchmark | Tiel-Coder-35B-A3B | Ornith-1.5-35B-A3B (base) | Nail (Qwen3.6-35B-A3B) | Qwen3.6-35B-A3B (stock) | Dirk (Qwen3.8-27B) |
|---|---|---|---|---|---|
| SWE-bench-Live (resueltos / 25) | 12 | 8 | 9 | 8 | 15 |
| Tiempo por intento (mediana / media, min) | 8.6 / 12.3 | — | 7.2 / 15.7 | 5.5 / — | 20.1 / — |
| Claw-Eval (multi-turno) | 67.2 | 65.3 | 60.5 | — | — |
| MMLU-Pro (4-bit) | 73.7 | 78.0 | 84.0 | 85.3 | — |

Nota: los valores de SWE-bench-Live de Nail y Qwen3.6 se deducen del texto ("tres más que Nail", "ocho el stock"), no se dan explícitos en la fuente.

## Requisitos de hardware

- VRAM estimada: 23.3 GB para la cuantización Q4_K_XL, 27.5 GB para Q5_K_XL. Con `-ngl 99` se requiere VRAM suficiente para todo el modelo, aunque llama.cpp permite descargar capas a CPU.
- GPU recomendadas: RTX 4090 (24 GB) para Q4 con offloading parcial, RTX A6000 (48 GB) o A100 (40/80 GB) para ejecución completa en GPU. También funciona en Mac con 32 GB de RAM unificada.
- En consumer GPU: sí, una RTX 4090 puede ejecutar la versión Q4 con la mayoría de capas en GPU y el resto en CPU, con una penalización de velocidad moderada.
- Opciones de despliegue: llama.cpp (llama-server con `--spec-type draft-mtp`), Ollama (si se convierte el GGUF), y cualquier runtime compatible con GGUF. No se menciona soporte para vLLM o TGI en esta versión.
- Latencia y throughput: no se publican cifras exactas, pero el MTP head está diseñado para acelerar la generación; el tiempo medio por intento en SWE-bench-Live es de 12.3 minutos, lo que sugiere un throughput adecuado para tareas agénticas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento SWE-bench-Live | MMLU-Pro (4-bit) |
|---|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B (este) | 35B MoE (3B activos) | no disp. | MIT | GGUF | 12/25 | 73.7 |
| Ornith-1.5-35B-A3B (base) | 35B MoE (3B activos) | no disp. | MIT | safetensors | 8/25 | 78.0 |
| Nail (Qwen3.6-35B-A3B) | 35B MoE (3B activos) | no disp. | MIT | GGUF | 9/25 | 84.0 |
| Dirk (Qwen3.8-27B) | 27B dense | no disp. | MIT | GGUF | 15/25 | — |

Tiel se posiciona como la opción más rápida y conversacional de su clase, pero inferior en razonamiento puro frente a Nail y en número de arreglos frente a Dirk (que es más lento). Su principal ventaja es el equilibrio entre velocidad, calidad de codificación y multi-turno.

## Limitaciones y advertencias

- Conocimiento enciclopédico y razonamiento de examen notablemente inferior: MMLU-Pro 73.7 frente a 84.0 de Nail, y 10.3 puntos por debajo de su alternativa principal. No es adecuado para tareas de trivia, preguntas de cultura general o exámenes.
- El template Sharp prioriza respuestas concisas, lo que puede llevar a omitir matices en problemas complejos de razonamiento.
- El bloque MTP solo funciona si se activa explícitamente con `--spec-type draft-mtp`; sin esa opción, el modelo lleva 0.9 GB de tensores muertos que no aportan nada.
- Soporte de idiomas limitado a inglés y chino según la documentación; el rendimiento en otros idiomas no está garantizado.
- La cuantización Q4_K_XL puede introducir degradación adicional en tareas de precisión numérica o código con dependencias finas, aunque el autor afirma que la imatrix propia compensa parcialmente.
- El modelo hereda los sesgos del modelo base Ornith-1.5, que a su vez deriva de Qwen3.6; no se han publicado evaluaciones de sesgo o toxicidad.
- Riesgo de alucinación en código: como cualquier modelo de lenguaje, puede generar APIs inexistentes o soluciones incorrectas; se recomienda supervisión humana en entornos de producción.
- Licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Repo de HuggingFace: https://huggingface.co/npario/Tiel-Coder-35B-A3B-GGUF-MTP
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Versión sin MTP: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Versión MLX: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Template Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Modelo alternativo Nail: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
- Modelo alternativo Dirk: https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF

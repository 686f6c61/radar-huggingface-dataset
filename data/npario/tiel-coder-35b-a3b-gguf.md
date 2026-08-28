# npario/Tiel-Coder-35B-A3B-GGUF

## Resumen

Tiel-Coder-35B-A3B-GGUF es una cuantización GGUF del modelo Ornith-1.5-35B-A3B, desarrollada por el equipo de peculiar-ragdoll (publicada bajo el perfil de npario en HuggingFace). Se trata de un modelo de codificación y agente diseñado para ejecutarse localmente, con un enfoque en tareas de programación agéntica y conversaciones multi-turno largas. El modelo base es un MoE de 35.000 millones de parámetros con aproximadamente 3.000 millones activos por token, que combina una arquitectura híbrida SSM/atención con solo dos cabezas KV, lo que reduce drásticamente el coste de la caché de contexto frente a modelos densos de tamaño equivalente.

La relevancia de esta ficha radica en que Tiel-Coder no es un modelo nuevo desde cero, sino una re-cuantización dinámica con una matriz de importancia propia (imatrix) y la incorporación del chat template "Sharp", que prioriza respuestas más cortas y directas. Según los datos publicados, en SWE-bench-Live resuelve 12 de 25 problemas reales, igualando a Opus 4.6 (medium) y superando a su propio modelo base, mientras que en conversación multi-turno (Claw-Eval) obtiene 67.2 puntos, por encima de Ornith-1.5 (65.3) y de la alternativa Nail (60.5). Su punto débil es el conocimiento enciclopédico y el razonamiento duro, donde obtiene 73.7 en MMLU-Pro frente a 84.0 de Nail. Está pensado para trabajo real de desarrollo, no para exámenes.

El modelo hereda la torre de visión de Ornith-1.5, por lo que puede procesar imágenes (capturas de pantalla, trazas de pila, mockups de diseño) mediante un proyector separado (`mmproj-BF16.gguf` de 903 MB). La licencia MIT permite uso comercial sin restricciones significativas, y los pesos están disponibles en formato GGUF para su uso con llama.cpp, llama-server y otras herramientas compatibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) híbrida SSM/atención, con 2 cabezas KV |
| Parametros totales | 34.660.610.688 (~34,7 B) |
| Parametros activos | ~3 B por token |
| Longitud de contexto | No disponible (heredado del modelo base Ornith-1.5-35B-A3B) |
| Tipos de cuantizacion | Q2_K_XL, IQ3_XXS, Q3_K_XL, IQ4_XS, Q4_K_S, Q4_K_XL, Q5_K_XL, Q6_K_XL, Q8_K_XL |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (con proyector de visión mmproj-BF16.gguf) |

## Arquitectura y entrenamiento

Tiel-Coder es una re-cuantización del modelo Ornith-1.5-35B-A3B, que a su vez se basa en la arquitectura Qwen3.6-35B-A3B. La arquitectura subyacente es un MoE híbrido que combina capas de atención con capas de espacio de estados (SSM), lo que reduce el coste de la caché KV a solo dos cabezas. Esto hace que el crecimiento de la memoria de contexto sea mucho menor que en un modelo denso del mismo tamaño, permitiendo ventanas de contexto largas con requisitos de VRAM moderados.

El entrenamiento original del modelo base no está documentado en la información proporcionada, pero se sabe que Ornith-1.5 fue ajustado a partir de Qwen3.6-35B-A3B. La contribución de Tiel-Coder se centra en la cuantización: se aplicó una cuantización dinámica con una matriz de importancia (imatrix) propia, y se incrustó el chat template "Sharp" dentro del archivo GGUF. Este template prioriza respuestas más concisas y directas, lo que explica la mejora en conversación multi-turno pero la pérdida de precisión en tareas de conocimiento (MMLU-Pro). Los autores confirman que la cuantización en sí no degrada el rendimiento: una versión con el template original de Ornith obtiene exactamente las mismas puntuaciones que el modelo base.

## Capacidades

- Generación de código y resolución de problemas reales de repositorios (SWE-bench-Live): 12 de 25 problemas resueltos.
- Conversación multi-turno larga con alta calidad de respuesta (Claw-Eval: 67.2 sobre 114 conversaciones puntuadas).
- Razonamiento agéntico: puede ejecutar múltiples pasos de razonamiento y tomar decisiones para resolver tareas de codificación.
- Visión por computadora: procesa imágenes (capturas de pantalla de tests fallidos, trazas de pila, mockups) mediante el proyector `mmproj-BF16.gguf`.
- Soporte multilingüe limitado a inglés y chino.
- Eficiencia de contexto: gracias a la arquitectura híbrida con solo 2 cabezas KV, la caché de contexto crece mucho más lentamente que en modelos densos comparables.
- No se menciona soporte explícito de tool calling o function calling en la documentación, pero el uso en tareas agénticas sugiere compatibilidad con flujos de llamada a herramientas a través de la API de llama-server.

## Casos de uso

- Asistente de codificación local para desarrollo diario: el modelo puede analizar un repositorio, identificar bugs y proponer parches. Su rendimiento en SWE-bench-Live (12/25) lo sitúa a la par de modelos comerciales como Opus 4.6 medium, con la ventaja de ejecutarse en local.
- Resolución de incidencias en CI/CD: gracias a su capacidad de razonamiento multi-paso y visión, puede interpretar capturas de pantalla de tests fallidos o trazas de pila y sugerir correcciones concretas.
- Chat técnico de larga duración: su puntuación en Claw-Eval (67.2) indica que mantiene la coherencia y utilidad en conversaciones extensas, ideal para asistentes de soporte técnico que requieren recordar contexto previo.
- Revisión de código automatizada: puede analizar diffs y señalar posibles problemas de lógica, estilo o rendimiento, integrándose en pipelines de desarrollo.
- Generación de documentación técnica: aunque su conocimiento enciclopédico es limitado, es capaz de generar documentación precisa a partir del código fuente que se le proporciona.
- Prototipado rápido de agentes de IA: su arquitectura eficiente y su licencia MIT permiten desplegarlo en entornos de producción sin costes de licencia, siendo adecuado para experimentar con agentes autónomos de codificación.

## Benchmarks y rendimiento

Los datos publicados provienen de la model card del autor y se refieren a la cuantización Q4_K_XL (22,4 GB). No se han encontrado benchmarks independientes adicionales.

| Benchmark | Tiel-Coder (Q4_K_XL) | Ornith-1.5 (base) | Nail (Qwen3.6-35B-A3B) | Qwen3.6-35B-A3B (stock) | Opus 4.6 (medium) |
|---|---|---|---|---|---|
| SWE-bench-Live (25 problemas) | 12 resueltos | 8 resueltos | 9 resueltos | 8 resueltos | 12 resueltos |
| Claw-Eval (multi-turno, 114 conv.) | 67.2 | 65.3 | 60.5 | no disponible | no disponible |
| MMLU-Pro (4-bit) | 73.7 | 78.0 | 84.0 | 85.3 | no disponible |

Tiempo por intento en SWE-bench-Live: mediana de 8,6 minutos, media de 12,3 minutos (frente a mediana de 7,2 y media de 15,7 de Nail).

## Requisitos de hardware

- VRAM mínima: 12,3 GB para la cuantización Q2_K_XL (cabe en GPUs de 16 GB, aunque se recomienda IQ3_XXS por mejor calidad).
- Para 16 GB de VRAM: usar IQ3_XXS (13,2 GB) o Q2_K_XL (12,3 GB).
- Para 24 GB de VRAM: Q4_K_XL (22,4 GB) es la opción recomendada; también caben Q3_K_XL, IQ4_XS y Q4_K_S.
- Para 32 GB de VRAM: Q5_K_XL (26,6 GB) es la opción recomendada.
- Para 48 GB de VRAM: Q6_K_XL (31,8 GB) o Q8_K_XL (38,5 GB).
- GPUs compatibles: cualquier GPU NVIDIA con al menos 16 GB (RTX 4090, A100, H100, etc.). En GPUs de 24 GB (RTX 3090, RTX 4090) se puede ejecutar la cuantización Q4_K_XL con margen para contexto.
- Despliegue: compatible con llama.cpp, llama-server, Ollama (si se convierte), vLLM (con adaptación) y otras herramientas que soporten GGUF.
- Latencia: no se proporcionan datos exactos, pero el tiempo medio por intento en SWE-bench-Live es de 12,3 minutos, lo que indica un throughput razonable para tareas agénticas. La arquitectura MoE con solo 3B activos por token permite velocidades de generación superiores a un modelo denso de 35B.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-bench-Live | MMLU-Pro | Licencia |
|---|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B (Q4_K_XL) | 34,7 B | ~3 B | no disponible | 12/25 | 73.7 | MIT |
| Ornith-1.5-35B-A3B (base) | 34,7 B | ~3 B | no disponible | 8/25 | 78.0 | MIT |
| Nail-Qwen3.6-35B-A3B | 34,7 B | ~3 B | no disponible | 9/25 | 84.0 | MIT |
| Dirk-Qwen3.8-27B (denso) | 27 B | 27 B | no disponible | 15/25 | no disponible | MIT |

Tiel-Coder es el mejor de su clase en tareas de codificación agéntica, pero inferior en conocimiento y razonamiento puro. Dirk, un modelo denso de 27B, resuelve más problemas en SWE-bench-Live pero a un coste de velocidad 2,5 veces mayor.

## Limitaciones y advertencias

- Conocimiento enciclopédico limitado: MMLU-Pro de 73.7, muy por debajo de alternativas como Nail (84.0). No es adecuado para tareas de trivia o exámenes.
- Razonamiento duro inferior: la pérdida de 4,3 puntos en MMLU-Pro se atribuye al chat template Sharp, que prioriza respuestas cortas, lo que penaliza problemas que requieren razonamiento extenso.
- Idiomas soportados solo inglés y chino; no hay soporte oficial para español u otros idiomas.
- Longitud de contexto no documentada: aunque la arquitectura es eficiente en caché, no se especifica la ventana máxima de contexto; se recomienda probar antes de usarla en producción.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar código incorrecto o respuestas inventadas, especialmente en dominios poco representados en su entrenamiento.
- Sesgos: no se han publicado evaluaciones de sesgos; al estar entrenado principalmente con datos en inglés y chino, puede reflejar sesgos culturales de esos entornos.
- La cuantización Q2_K_XL pierde precisión notable; se recomienda usar IQ3_XXS o superior para tareas críticas.
- Aunque la licencia es MIT, el modelo base (Qwen3.6-35B-A3B) puede tener términos adicionales; verificar la licencia de Qwen antes de uso comercial.

## Enlaces

- HuggingFace (repo principal): https://huggingface.co/npario/Tiel-Coder-35B-A3B-GGUF
- Repo del autor original (peculiar-ragdoll): https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Versión con MTP (Multi-Token Prediction): https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF-MTP
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Chat template Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Alternativa Nail: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
- Alternativa Dirk: https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF

# Fastiraz/Ornith-1.5-35B-A3B-GGUF

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por ornith-ai, que activa aproximadamente 3.000 millones de parámetros por token sobre un total de 35.500 millones. Forma parte de la familia Ornith-1.5, cuyo objetivo es avanzar hacia modelos fundacionales que se mejoran a sí mismos de extremo a extremo: el propio modelo genera nuevas tareas de entrenamiento, construye los andamiajes (scaffolds) necesarios para resolverlas y produce rollouts de soluciones que se utilizan para refinar la política mediante aprendizaje por refuerzo. Este enfoque amplía el bucle de auto-mejora introducido en Ornith-1.0, que ya se había desarrollado sobre Qwen3.5 y Gemma4 con entrenamiento continuo, mid-training y post-training.

El modelo está orientado a tareas de razonamiento, codificación y uso agéntico, y según los datos publicados supera a su par Qwen 3.6-35B en todos los benchmarks de codificación y agénticos, así como a modelos densos como Gemma 4-31B y Muse Glimmer-30B en tareas de codificación agéntica. El repositorio que nos ocupa, Fastiraz/Ornith-1.5-35B-A3B-GGUF, contiene los pesos en formato GGUF para su ejecución eficiente en CPU y GPU con herramientas como llama.cpp u Ollama. La licencia es MIT, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), basado en Qwen3.5 y Gemma4 |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | ~3 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio GGUF, se asume multiples cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B emplea una arquitectura MoE con aproximadamente 3.000 millones de parámetros activos por token, lo que permite un rendimiento de inferencia comparable a modelos densos de menor tamaño pero con una capacidad total de 35.500 millones de parámetros. Según la model card, el modelo se construyó sobre Qwen3.5 y Gemma4 mediante un proceso de entrenamiento continuo, mid-training y post-training. La innovación principal reside en el bucle de auto-mejora: el modelo genera nuevas tareas de entrenamiento, diseña andamiajes específicos para cada tarea y produce soluciones (rollouts) que se utilizan como datos de refuerzo. Este proceso se diferencia de los enfoques tradicionales que dependen de tareas fijas curadas por humanos y de harnesses diseñados manualmente. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni las técnicas de alineación específicas (RLHF, DPO, etc.) más allá de la mención al aprendizaje por refuerzo.

## Capacidades

- Generación de texto y razonamiento complejo, con especial énfasis en tareas de codificación.
- Capacidades agénticas: puede operar en entornos de terminal y ejecutar tareas de resolución de problemas de software (SWE-bench).
- Soporte para uso conversacional (etiqueta "conversational" en HuggingFace).
- Capacidad de auto-mejora: el modelo puede generar sus propias tareas y estrategias de resolución, lo que lo hace adecuado para entornos de aprendizaje continuo.
- No se ha confirmado explícitamente el soporte de tool calling o function calling, aunque su rendimiento en benchmarks agénticos sugiere que puede integrarse en flujos de trabajo que requieren interacción con herramientas.
- No se dispone de información sobre capacidades multimodales (visión, audio, etc.).

## Casos de uso

- Resolución de incidencias en repositorios de código: gracias a su alto rendimiento en SWE-bench Verified (79), el modelo puede analizar issues, proponer parches y generar pull requests de forma autónoma en proyectos de software.
- Agentes de terminal autónomos: con una puntuación de 67,8 en Terminal-Bench 2.1 (Terminus-2), puede ejecutar comandos, interpretar salidas y tomar decisiones en entornos de línea de comandos, útil para automatizar tareas de administración de sistemas.
- Asistente de programación en tiempo real: su capacidad de razonamiento y generación de código lo hace adecuado para integrarse en IDEs como plugin de autocompletado o chat contextual.
- Generación de código en pipelines de CI/CD: puede generar tests, scripts de despliegue o documentación técnica a partir de descripciones de alto nivel, reduciendo el trabajo manual de los desarrolladores.
- Automatización de tareas de refactorización: el modelo puede identificar patrones de código subóptimos y proponer refactorizaciones, aprovechando su entrenamiento en grandes corpus de código.
- Investigación en auto-mejora de modelos: su arquitectura de auto-generación de tareas y scaffolds lo convierte en una plataforma interesante para experimentos de aprendizaje por refuerzo y generación de datos sintéticos.

## Benchmarks y rendimiento

Los datos de benchmarks disponibles en la model card se presentan a continuación. Se incluyen únicamente los valores que han sido publicados; el resto se indica como no disponible.

| Benchmark | Ornith-1.5-35B-A3B | Ornith-1.0-35B-A3B | Qwen3.6-35B-A3B | Gemma-4-31B | Muse-Glimmer-30B | Qwen3.5-397B |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 67,8 | 64,2 | 52,5 | 42,1 | 51,7 | 53,5 |
| Terminal-Bench 2.1 (Claude Code) | 68,5 | 62,8 | 49,2 | no disponible | no disponible | 48,6 |
| SWE-bench Verified | 79 | 75,6 | 73,4 | 52 | 76 | 76,4 |
| SWE-bench Pro | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo MoE con ~3 B de parámetros activos, la VRAM necesaria para inferencia depende principalmente de la cuantización elegida y del tamaño total de los pesos (35,5 B).
- Para cuantizaciones GGUF típicas (Q4_K_M, Q5_K_M, etc.), se estima que la memoria requerida oscila entre 20 y 30 GB, aunque no se dispone de datos exactos del repositorio.
- Es probable que quepa en GPUs de consumo como la RTX 4090 (24 GB) con cuantizaciones de baja precisión, pero no está confirmado.
- Para despliegue en producción, se recomienda usar vLLM, llama.cpp, Ollama o TGI, todos compatibles con formato GGUF.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

La comparativa se basa en los benchmarks publicados en la model card, ya que no se dispone de especificaciones técnicas completas de los modelos comparados.

| Modelo | Parametros totales | Parametros activos | SWE-bench Verified | Terminal-Bench 2.1 (Terminus-2) | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | 35,5 B | ~3 B | 79 | 67,8 | MIT |
| Ornith-1.0-35B-A3B | 35,5 B (estimado) | ~3 B (estimado) | 75,6 | 64,2 | MIT |
| Qwen3.6-35B-A3B | 35 B (estimado) | ~3 B (estimado) | 73,4 | 52,5 | Apache 2.0 (asumido) |
| Gemma-4-31B | 31 B (denso) | 31 B | 52 | 42,1 | Gemma License |
| Muse-Glimmer-30B | 30 B (denso) | 30 B | 76 | 51,7 | no disponible |

Ornith-1.5-35B-A3B supera claramente a sus competidores directos en tareas de codificación agéntica, con una ventaja de más de 5 puntos sobre Qwen3.6-35B-A3B en SWE-bench Verified y de más de 15 puntos en Terminal-Bench 2.1. Frente a modelos densos de tamaño similar, la ventaja es aún mayor, lo que demuestra la eficacia de la arquitectura MoE combinada con el bucle de auto-mejora.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos o evaluación de sesgos para este modelo.
- Como todo modelo de lenguaje, existe riesgo de alucinación, especialmente en tareas de razonamiento complejo o generación de código donde la verificación automática no está garantizada.
- La longitud de contexto no ha sido publicada, lo que limita la planificación de despliegues que requieran ventanas largas.
- No se ha confirmado el soporte multilingüe; la model card no especifica idiomas, por lo que se recomienda validar el rendimiento en el idioma objetivo antes de usarlo en producción.
- Aunque la licencia MIT permite uso comercial, el modelo se basa en Qwen3.5 y Gemma4, cuyas licencias originales pueden imponer condiciones adicionales. Se recomienda revisar los términos de los modelos base.
- El repositorio GGUF tiene un tamaño de 558,5 GB, lo que implica un coste de almacenamiento y descarga considerable; se debe seleccionar la cuantización adecuada para el hardware disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Fastiraz/Ornith-1.5-35B-A3B-GGUF
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Página de despliegue en HuggingFace Endpoints: https://endpoints.huggingface.co/new/ornith-ai/Ornith-1.5-35B-A3B

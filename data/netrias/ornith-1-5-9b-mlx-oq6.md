# netrias/Ornith-1.5-9B-MLX-oQ6

## Resumen

Ornith-1.5-9B-MLX-oQ6 es un checkpoint cuantizado en 6 bits (oQ6) del modelo Ornith-1.5-9B-MLX, publicado por el usuario netrias. El modelo base, Ornith-1.5-9B, es desarrollado por ornith-ai y se presenta como el miembro más ligero de la familia Ornith-1.5, un modelo denso de aproximadamente 9.000 millones de parámetros diseñado para despliegue eficiente en una sola GPU y para uso en dispositivos móviles mediante su variante cuantizada Mobile. Este repo concreto está pensado para inferencia local en Apple Silicon, ya que es un checkpoint nativo MLX generado con el cuantizador oQ de oMLX en un MacBook Pro con chip M5 Max.

El modelo base extiende Ornith-1.0, que a su vez se construyó sobre Qwen3.5 y Gemma4 mediante continued pretraining, mid-training y post-training. La innovación principal de Ornith-1.5 es expandir el bucle de auto-mejora (self-improvement): en lugar de depender de tareas fijas y harnesses diseñados manualmente, el modelo genera nuevas tareas de entrenamiento, descubre estrategias para resolverlas y mejora su política mediante aprendizaje por refuerzo. El checkpoint cuantizado aquí documentado conserva la arquitectura del modelo fuente, pero con un tamaño de repositorio de 7,5 GB, lo que lo hace viable para equipos con memoria unificada moderada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer dense (basado en Qwen3.5 y Gemma4) |
| Parámetros totales | 8.953.803.264 |
| Parámetros activos | no aplica (modelo dense) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ6 (6-bit data-driven) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Ornith-1.5-9B es un modelo Transformer denso de 9B parámetros, desarrollado por ornith-ai. Su entrenamiento parte de Ornith-1.0, que se construyó sobre Qwen3.5 y Gemma4 con fases de continued pretraining, mid-training y post-training. La versión 1.5 introduce una optimización conjunta de tres componentes en el bucle de auto-mejora: generación de tareas, construcción de scaffolds y solución de rollouts. En lugar de usar un conjunto fijo de tareas curadas por humanos y harnesses diseñados a mano, el modelo genera continuamente nuevas tareas de entrenamiento, descubre estrategias efectivas para resolverlas y mejora la política mediante aprendizaje por refuerzo. El checkpoint aquí documentado es una cuantización 6-bit oQ6 producida con la herramienta oMLX, lo que reduce el tamaño de los pesos manteniendo la arquitectura original. Los números de rendimiento publicados corresponden al modelo fuente en precisión completa, no a esta versión cuantizada.

## Capacidades

- Generación de texto en inglés, orientada a tareas de conversación y asistencia técnica.
- Razonamiento y codificación: los benchmarks publicados en la model card (Terminal-Bench 2.1, SWE-bench Verified y SWE-bench Pro) indican un rendimiento sólido en tareas de programación y resolución de problemas.
- Capacidades de agente: los resultados en Terminal-Bench sugieren que el modelo puede interactuar con un terminal, ejecutar comandos y resolver tareas de automatización. La puntuación en SWE-bench Verified (70,6) indica que puede abordar issues reales en repositorios de software.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explícitamente, aunque los benchmarks de terminal y SWE-bench implican razonamiento en varios pasos.
- Capacidades multilingües: solo inglés (según la model card).
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Asistente de programación en local para Apple Silicon: al ser un checkpoint nativo MLX, puede ejecutarse con mlx-lm u oMLX en un Mac, ofreciendo generación de código y autocompletado sin conexión. Su tamaño de 7,5 GB en cuantización 6-bit lo hace viable en equipos con 16 GB de memoria unificada.
- Agente de terminal en entornos de desarrollo: con una puntuación de 46,2 en Terminal-Bench 2.1 (Terminus-2) y 47 con Claude Code, el modelo puede ejecutar comandos de shell, gestionar archivos y automatizar tareas de mantenimiento en un entorno de desarrollo.
- Resolución de issues en repositorios de software: el 70,6 en SWE-bench Verified sugiere que el modelo puede proponer parches para bugs reales en proyectos open source, lo que permite integrarlo en flujos de trabajo de revisión de código o mantenimiento de repositorios.
- Integración en pipelines CI/CD: puede generar código de prueba, corregir errores de compilación o revisar cambios en pull requests. Su capacidad para trabajar en tareas de terminal facilita la automatización de comprobaciones y validaciones.
- Investigación en auto-mejora de modelos: el modelo implementa un bucle de self-improvement que genera tareas y optimiza la política mediante RL. Es útil para estudiar entrenamiento autónomo, generación de tareas sintéticas y optimización de scaffolds.
- Despliegue en dispositivos móviles: aunque este checkpoint concreto es para Apple Silicon, la variante Mobile del modelo base está diseñada para edge. Este repo cuantizado sirve como referencia para probar la viabilidad de ejecución en hardware de Apple y para comparar el rendimiento de la cuantización oQ6.
- Educación y prototipado rápido: por su tamaño, es accesible para experimentación en hardware de consumo, permitiendo a estudiantes e investigadores probar técnicas de cuantización, agentes y razonamiento sin necesidad de infraestructura cloud.

## Benchmarks y rendimiento

Los datos proceden de la model card del modelo fuente (precisión completa). No se han publicado resultados para la cuantización oQ6.

| Benchmark | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.6-35B-A3B | Gemma-4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 46,2 | 43,1 | 21,3 | 52,5 | 42,1 |
| Terminal-Bench 2.1 (Claude Code) | 47 | 40,6 | 18,9 | 49,2 | - |
| SWE-bench Verified | 70,6 | 69,4 | 53,2 | 73,4 | 52 |
| SWE-bench Pro | 47,5 | 42,9 | no disponible | no disponible | no disponible |

Nota: los valores corresponden al modelo Ornith-1.5-9B en precisión completa. La cuantización oQ6 puede degradar el rendimiento en mayor o menor medida.

## Requisitos de hardware

- Tamaño del checkpoint: 7,5 GB (pesos en oQ6). En Apple Silicon, se recomienda un dispositivo con al menos 16 GB de memoria unificada para dejar margen para el contexto y el runtime de inferencia.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4, M5). No aplica de forma nativa a GPUs NVIDIA.
- Si cabe en consumer GPU: no disponible. El checkpoint es específico de MLX; para ejecutarlo en GPU NVIDIA sería necesario convertirlo a otro formato (por ejemplo, GGUF o safetensors estándar), pero no hay información sobre esa conversión.
- Opciones de despliegue: oMLX (https://github.com/jundot/omlx) y mlx-lm.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los comparables directos por tamaño son Ornith-1.0-9B y Qwen3.5-9B. La siguiente tabla resume los benchmarks disponibles en la model card:

| Modelo | Parámetros | Terminal-Bench 2.1 (Terminus-2) | SWE-bench Verified | Licencia |
|---|---|---|---|---|
| Ornith-1.5-9B (fuente) | 9B | 46,2 | 70,6 | no disponible |
| Ornith-1.0-9B | 9B | 43,1 | 69,4 | no disponible |
| Qwen3.5-9B | 9B | 21,3 | 53,2 | no disponible |

Los modelos Qwen3.6-35B-A3B y Gemma-4-31B aparecen en los benchmarks originales, pero son de mayor tamaño y no se consideran comparables directos. El checkpoint cuantizado aquí documentado se diferencia de su modelo base en que reduce el peso a 7,5 GB, pero mantiene la misma arquitectura y, previsiblemente, un rendimiento inferior al de precisión completa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el modelo es apto para uso comercial o si tiene restricciones de redistribución.
- Los benchmarks publicados corresponden al modelo fuente en precisión completa. La cuantización oQ6 puede introducir pérdida de calidad y afectar negativamente al rendimiento en tareas complejas.
- Solo soporta inglés, lo que limita su uso en aplicaciones multilingües.
- Longitud de contexto no documentada: se desconoce la ventana máxima de tokens que puede manejar.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento o generación de código.
- Posibles sesgos no documentados, dado que no se ha publicado información sobre la composición del dataset de entrenamiento ni sobre la evaluación de sesgos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/netrias/Ornith-1.5-9B-MLX-oQ6
- Modelo base MLX: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX
- Modelo original (precisión completa): https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Blog de Ornith: https://ornith.ai/ornith_1_5.html
- Repositorio oMLX: https://github.com/jundot/omlx

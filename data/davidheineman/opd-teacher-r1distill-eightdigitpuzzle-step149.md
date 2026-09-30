# davidheineman/opd-teacher-R1Distill-EightDigitPuzzle-step149

## Resumen
El modelo opd-teacher-R1Distill-EightDigitPuzzle-step149 es un ajuste fino de DeepSeek-R1-Distill-Qwen-1.5B, desarrollado por davidheineman. Se trata de un modelo "teacher" (profesor) para destilación on-policy (OPD) especializado en el entorno EightDigitPuzzle. Fue entrenado durante 150 pasos con GRPO (Group Relative Policy Optimization) sobre prompts de dificultad 0 de dicho puzzle, utilizando 4 prompts y 16 rollouts por paso, sin filtrado de prompts DAPO. Los pesos publicados corresponden al paso 149. Con 1.777.088.000 parámetros (aproximadamente 1,78 mil millones), es un modelo compacto orientado a la investigación en aprendizaje por refuerzo con entornos verificables. Su relevancia radica en que forma parte de una colección de 32 modelos "teacher" para distintos entornos, dentro del proyecto RLVE OPD. La licencia, los idiomas soportados y la longitud de contexto no están especificados en la información disponible.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2) |
| Parámetros totales | 1.777.088.000 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en una arquitectura transformer decoder-only con la estructura de Qwen2, heredada de DeepSeek-R1-Distill-Qwen-1.5B. El entrenamiento se realizó mediante GRPO durante 150 pasos, utilizando 4 prompts por paso y 16 rollouts por paso, todos ellos pertenecientes al entorno EightDigitPuzzle con dificultad 0. No se aplicó filtrado DAPO. El objetivo es actuar como teacher en un proceso de destilación on-policy, proporcionando supervisión densa a nivel de token a un modelo estudiante. El modelo forma parte de la colección RLVE OPD Teachers, que cubre 32 de los 400 entornos posibles del proyecto RLVE, y su entrenamiento se enmarca en el proyecto `david-heineman/rl-data-opd-teachers-r1-distil`, grupo `opd-teachers-r1-nofilter16-20260929-231458`.

## Capacidades
- Generación de texto y razonamiento paso a paso en el dominio del puzzle EightDigitPuzzle.
- Resolución de problemas de tipo EightDigitPuzzle (puzzle lógico con dígitos) tras el entrenamiento con RL.
- Actuación como modelo teacher para destilación on-policy, proporcionando distribuciones de probabilidad a nivel de token para entrenar a un estudiante.
- No se especifican capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo.
- El modelo no está diseñado para tareas generales de generación de texto o razonamiento fuera de su entorno de entrenamiento.

## Casos de uso
- Destilación on-policy en el entorno EightDigitPuzzle: usar este modelo como teacher para entrenar a un modelo estudiante, aprovechando su entrenamiento específico con GRPO para proporcionar supervisión token a token en trayectorias generadas por el estudiante.
- Investigación en algoritmos de RL: emplearlo como referencia para evaluar la eficacia de GRPO y otras técnicas en entornos verificables, comparando curvas de aprendizaje y estabilidad.
- Generación de datos sintéticos para EightDigitPuzzle: producir soluciones y cadenas de razonamiento correctas que sirvan para aumentar datasets de entrenamiento supervisado o para análisis de errores.
- Estudio del sesgo de estilo en OPD: como parte de la colección, permite investigar cómo el estilo de los teachers afecta al proceso de destilación, en línea con trabajos como Lightning OPD 2.0.
- Benchmark de dificultad de entornos: comparar el rendimiento de este teacher con otros de la colección (32 entornos) para medir la dificultad relativa de EightDigitPuzzle.
- Reproducibilidad de experimentos: al publicarse los pesos finales (paso 149) y detalles del entrenamiento (proyecto, grupo, pasos), facilita la reproducción y verificación de los resultados del proyecto RLVE OPD.
- Educación y demostración: ilustrar cómo un modelo de 1,78 mil millones de parámetros puede aprender a resolver un puzzle lógico mediante RL con recompensas verificables.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: en FP16, los pesos ocupan aproximadamente 3,6 GB (1.777.088.000 parámetros × 2 bytes). Considerando el overhead de inferencia (activaciones, caché KV), se recomiendan al menos 6 GB de VRAM. Con cuantización a 8 bits, ~1,8 GB; a 4 bits, ~0,9 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM para FP16, como NVIDIA RTX 3060, RTX 4060, RTX 4070 o RTX 4090. Para despliegue en servidor, A100 o H100 son innecesarias pero compatibles. También puede ejecutarse en CPU (más lento) o en GPUs integradas con memoria compartida suficiente.
- Cabe en consumer GPU: sí, en la mayoría de GPUs de consumo actuales (RTX 3060 12 GB o superiores). Incluso en GPUs con 8 GB podría funcionar con cuantización.
- Opciones de despliegue: Transformers (PyTorch), vLLM, Text Generation Inference (TGI), llama.cpp (requiere conversión a GGUF) y Ollama (requiere conversión). No hay versiones GGUF oficiales.
- Latencia y throughput estimados: no disponible. Al ser un modelo de 1,78 mil millones de parámetros, en una RTX 4090 se pueden esperar decenas o cientos de tokens por segundo en FP16, pero no hay mediciones oficiales.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Especialización |
|---|---|---|---|---|---|
| opd-teacher-R1Distill-EightDigitPuzzle-step149 | 1.777.088.000 | no disponible | no disponible | HuggingFace | EightDigitPuzzle (teacher OPD) |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.777.088.000 (heredados) | no disponible | no disponible | HuggingFace | Generalista, razonamiento |
| opd-teacher-Q2.5I-Differentiate-step149 | no disponible | no disponible | no disponible | Featherless | Diferenciación (teacher OPD) |

## Limitaciones y advertencias
- Especialización extrema: el modelo fue entrenado exclusivamente en el entorno EightDigitPuzzle (dificultad 0). Es probable que no generalice a otras tareas de razonamiento o generación de texto.
- Sin licencia especificada: no se indica licencia, por lo que el uso comercial es incierto y requiere contactar con el autor.
- Idiomas no especificados: no se declaran idiomas soportados; se asume inglés, pero no está confirmado.
- Riesgo de alucinación: fuera de su dominio, el modelo puede generar respuestas incorrectas o incoherentes.
- Sin benchmarks publicados: no hay métricas objetivas de rendimiento en el momento de redactar esta ficha.
- Modelo de investigación: está pensado para experimentación en destilación on-policy y RL, no para producción directa.
- Posible sesgo hacia el entorno de entrenamiento: puede sobreajustar a los prompts de dificultad 0 y fallar en variantes más difíciles.
- Fecha de creación futura: los metadatos indican 2026-09-30, lo que sugiere que la información puede formar parte de un escenario simulado o contener un error de fecha.

## Enlaces
- HuggingFace: https://huggingface.co/davidheineman/opd-teacher-R1Distill-EightDigitPuzzle-step149
- Colección RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Paper Lightning OPD 2.0: https://arxiv.org/abs/2607.28449
- Versión HTML del paper: https://arxiv.org/html/2607.28449
- Paper RLVE (referenciado): https://arxiv.org/abs/2511.07317
- GitHub open-audio-opd: https://github.com/Audio8-AI/open-audio-opd/tree/master/
- Modelo similar en Featherless: https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-Differentiate-step149
- Proyecto de entrenamiento: david-heineman/rl-data-opd-teachers-r1-distil (nombre del proyecto, no enlace directo)
- Grupo de entrenamiento: opd-teachers-r1-nofilter16-20260929-231458

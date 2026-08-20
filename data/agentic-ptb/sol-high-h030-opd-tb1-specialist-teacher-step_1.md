# agentic-ptb/sol-high.h030.opd-tb1-specialist-teacher.step_1

## Resumen

El modelo `sol-high.h030.opd-tb1-specialist-teacher.step_1` es un checkpoint intermedio de un barrido de destilación de políticas on-policy (OPD) agéntica, publicado por el equipo `agentic-ptb`. Se trata de un fine-tuning del modelo `Qwen/Qwen3.5-9B-Base` orientado a escenarios de razonamiento agente integrado con herramientas (TIR), donde las interacciones multi-turno con llamadas a herramientas generan fallos en cascada y divergencias paso a paso. La destilación on-policy entrena al estudiante sobre muestras generadas por su propia política en evolución, con un profesor externo que proporciona supervisión densa en esas mismas muestras, reduciendo la brecha entre entrenamiento e inferencia.

El checkpoint se escribió a las 30.75 horas de una carrera de entrenamiento de 100 horas, dentro de la célula `sol-high` (considerada la mejor del barrido). El profesor es `Codex / gpt-5.6-sol` con esfuerzo de razonamiento alto. El repositorio contiene 9 409 813 744 parámetros (aproximadamente 9.4 mil millones), en formato `safetensors` con 4 shards y un tamaño total de 18.8 GB. No se ha publicado información sobre licencia, idiomas o contexto, por lo que su uso principal es la investigación de métodos de destilación agéntica.

La relevancia de este modelo reside en que es un artefacto para estudiar la dinámica de la OPD en tareas de agentes, un área activa que busca reducir la divergencia de distribución en sistemas multi-agente. Su configuración de token de fin de secuencia (`eos_token_id` correcto) lo hace útil para evaluaciones fiables sin riesgo de sobrepasar la ventana de contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en `Qwen/Qwen3.5-9B-Base`) |
| Parámetros totales | 9 409 813 744 |
| Parámetros activos | no aplicable (no es un modelo MoE confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18.8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `Qwen/Qwen3.5-9B-Base`, por lo que hereda su arquitectura de transformer (probablemente densa, aunque no se confirma). El entrenamiento utiliza destilación de políticas on-policy (OPD), una técnica en la que el estudiante (el propio modelo) se entrena sobre muestras generadas por su política actual, mientras un profesor (en este caso `Codex / gpt-5.6-sol` con esfuerzo de razonamiento alto) proporciona supervisión densa sobre esas mismas muestras. Este enfoque reduce la brecha de distribución entre el estado de entrenamiento y el de inferencia, especialmente en tareas agentes multi-turno con llamadas a herramientas.

El checkpoint corresponde a la hora 30.75 de una carrera de 100 horas, y se destaca como el mejor de su célula (`sol-high`) según la nota del autor. El `eos_token_id` está correctamente configurado como `[248044, 248046]`, donde `248046` es `<|im_end|>`, el token que el chat template de Qwen3.5 usa para terminar cada turno del asistente. Esto evita que el modelo sobrepase la ventana de contexto al final de cada turno, un factor crítico en la evaluación. No se especifican datos sobre el dataset de entrenamiento ni el número total de tokens utilizados.

## Capacidades

- Generación de texto y razonamiento multi-área: al basarse en `Qwen3.5-9B-Base`, se esperan capacidades de generación de texto, razonamiento lógico y matemáticas, aunque no se han publicado evaluaciones específicas de este checkpoint.
- Razonamiento agéntico integrado con herramientas: el entrenamiento OPD está diseñado para escenarios de llamadas a herramientas en múltiples turnos, con el objetivo de reducir fallos en cascada y divergencias paso a paso.
- Destilación on-policy: el modelo está optimizado para ser un estudiante que aprende de su propia política en evolución, lo que puede mejorar la estabilidad en tareas agénticas.
- Soporte de tool calling: no confirmado explícitamente, pero se asume que hereda las capacidades del modelo base de Qwen3.5.
- Multilingüismo: no disponible; se hereda probablemente del modelo base, pero no hay documentación.
- Capacidades de vision o audio: no se mencionan; probablemente sea un modelo de solo texto.

## Casos de uso

- **Investigación en destilación on-policy**: el checkpoint es un artefacto para estudiar la evolución del rendimiento durante un barrido de OPD. Se puede usar para comparar cómo mejora el modelo a lo largo de las horas de entrenamiento y para validar la hipótesis de la reducción de la brecha de distribución en agentes.
- **Benchmarking de métodos de destilación**: los investigadores pueden evaluar este checkpoint frente a otros del mismo barrido (por ejemplo, con diferentes células) para medir el efecto del esfuerzo de razonamiento del profesor y la duración del entrenamiento en la calidad final.
- **Desarrollo de agentes de razonamiento multi-área**: en el diseño de sistemas agénticos con llamadas a herramientas, este modelo puede servir como punto de partida para probar si la destilación on-policy mejora la estabilidad en conversaciones de varios turnos.
- **Análisis de robustez en conversaciones multi-turno**: dado su énfasis en reducir fallos en cascada, es útil para estudios de robustez de agentes que interactúan con herramientas externas, aunque no se dispone de datos empíricos publicados.
- **Punto de partida para fine-tuning**: como checkpoint intermedio, puede servir como base para continuar el entrenamiento con otros objetivos o para aplicar regularización adicional, especialmente en entornos de investigación.
- **Pruebas de calidad de generación con contexto largo**: la configuración correcta del token de fin de secuencia permite evaluar el modelo sin riesgo de sobrepasar la ventana de contexto, lo que lo hace útil para pruebas de generación de texto largo y análisis de límites de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K u otras evaluaciones estándar. El único dato relevante es que el checkpoint es el mejor de su célula según la nota interna del autor, pero no se proporcionan cifras concretas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9 409 813 744 parámetros, en FP32 se necesitan aproximadamente 18.8 GB de VRAM (equivalente al peso del repositorio). Con cuantización de 8 bits, se reduciría a unos 9.4 GB, y con 4 bits a unos 5 GB, aunque no se han publicado configuraciones de cuantización oficiales.
- GPU recomendadas: para FP16 (sin cuantización), se requiere al menos 24 GB de VRAM, por lo que una GPU como la NVIDIA RTX 4090 (24 GB), A100 (40 GB) o H100 (80 GB) sería adecuada. Para cuantización de 8 bits, una GPU de 16 GB (RTX 3080 Ti o RTX 4080) podría ser suficiente.
- GPU de consumo: con cuantización de 4 bits, es posible que quepa en GPUs de 8 GB (como RTX 3060 o RTX 4060), pero no hay verificación oficial.
- Opciones de despliegue: al estar en formato `safetensors`, se puede desplegar con frameworks como vLLM, llama.cpp (previa conversión a GGUF), Ollama o TGI. No se proporcionan configuraciones específicas.
- Latencia y throughput: no se han publicado estimaciones.

## Comparativa con modelos similares

No se dispone de comparativas directas con modelos de la misma categoría (destilación on-policy agéntica). Como referencia, se compara con el modelo base:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `agentic-ptb/sol-high.h030.opd-tb1-specialist-teacher.step_1` | 9.4B | no disponible | no disponible | HuggingFace (0 descargas) |
| `Qwen/Qwen3.5-9B-Base` | 9.4B (aprox.) | no disponible | no disponible | HuggingFace |

No se conocen otros modelos de destilación on-policy para agentes con características comparables, por lo que la comparación se limita al modelo base.

## Limitaciones y advertencias

- **Checkpoint intermedio**: es un modelo de la hora 30.75 de un entrenamiento de 100 horas, por lo que no representa el estado final del modelo y su rendimiento puede ser inestable.
- **Licencia no especificada**: no se indica licencia, por lo que no se garantiza el uso comercial. Se debe contactar con el autor antes de cualquier uso en producción.
- **Idiomas y contexto no documentados**: no hay información sobre los idiomas soportados ni la longitud de contexto, lo que dificulta la planificación de despliegues en entornos multilingües o con requisitos de contexto largo.
- **Riesgo de alucinación y sesgos**: al ser un modelo basado en Qwen3.5, puede generar contenido alucinado o sesgado; no se han publicado evaluaciones de seguridad.
- **Capacidades no verificadas**: no hay benchmarks ni evaluaciones de capacidades específicas, por lo que no se puede asumir un rendimiento concreto en tareas como code generation o matemáticas.
- **Orientado a investigación**: su diseño como artefacto de estudio limita su uso directo en aplicaciones de producción sin una evaluación adicional.
- **Sin soporte de cuantización oficial**: no se han proporcionado configuraciones de cuantización, lo que obliga a probar manualmente si se desea reducir el tamaño del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h030.opd-tb1-specialist-teacher.step_1
- Repositorio EasyOPD (experimentos de OPD agéntica): https://github.com/lds-ustc/EasyOPD/tree/main/experiments/02_

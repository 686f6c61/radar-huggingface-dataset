# agentic-ptb/sol-high.h043.opsd-r2e-commit-small-replay.step_1

## Resumen

Este repositorio contiene un checkpoint intermedio de un entrenamiento experimental denominado "AgentPTB sweep", concretamente el punto correspondiente a la hora 43 de una ejecución de 100 horas. El modelo se basa en `Qwen/Qwen3.5-9B-Base` (9,4 mil millones de parámetros) y se entrena mediante On-Policy Self-Distillation (OPSD), una técnica de aprendizaje por refuerzo que genera supervisión densa a nivel de token re-puntuando las trayectorias generadas bajo una vista privilegiada del problema. El checkpoint está etiquetado como `sol-high` y fue generado por un agente de código (Codex / gpt-5.6-sol) con esfuerzo de razonamiento alto.

No se trata de un modelo final listo para producción, sino de una muestra intermedia del proceso de entrenamiento. Su interés principal es académico: permite observar la evolución de las métricas a lo largo de las 100 horas de la ejecución y comparar checkpoints de la misma familia. El autor indica que el `eos_token_id` es correcto, lo que significa que el modelo detiene la generación al final de cada turno, un detalle relevante para evaluar correctamente su rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,41 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.5-9B-Base) |
| Tipos de cuantizacion | no disponible (solo safetensors en fp16/fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (18,8 GB, 4 shards) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9,4 B parámetros. El entrenamiento aplica On-Policy Self-Distillation (OPSD), descrita en el paper arXiv 2608.04788. OPSD entrena un único modelo que actúa simultáneamente como alumno y profesor: el alumno ve solo el problema, mientras que el profesor ve además la solución correcta, y se realiza un emparejamiento de distribuciones a nivel de token sobre las trayectorias propias del alumno. El paper identifica un problema de confusión en la re-puntuación y propone una calibración basada en observaciones.

Este checkpoint concreto es un punto intermedio de una ejecución de 100 horas, guardado a las 43,34 horas. El nombre del repositorio codifica el celda de entrenamiento (`sol-high`), la hora de la ejecución (`h43`) y la familia (`opsd-r2e-commit-small-replay`). El autor indica que el `eos_token_id` es correcto, lo que permite evaluar el modelo sin sobrepasar la ventana de contexto.

## Capacidades

No se han evaluado directamente las capacidades de este checkpoint intermedio. Al estar basado en Qwen3.5-9B-Base, hereda las capacidades generales del modelo base (generación de texto, razonamiento, código, matemáticas, multilingüismo), pero no hay datos publicados sobre su rendimiento específico.

- Generación de texto y razonamiento: esperable dado el modelo base, pero no verificado en este checkpoint.
- Código y matemáticas: el entrenamiento OPSD con datos de código sugiere posible mejora, pero no hay benchmarks.
- Tool calling / agentes: no hay evidencia de soporte específico en este checkpoint.
- Multilingüismo: no documentado.

## Casos de uso

- **Investigación sobre dinámica de entrenamiento OPSD**: permite comparar checkpoints a lo largo de las horas de entrenamiento para estudiar cómo evoluciona el rendimiento con la técnica OPSD. Se puede cargar en un framework de evaluación y medir métricas como MMLU o HumanEval en distintos puntos temporales.
- **Análisis de la calibración de eos**: el autor señala que la ausencia del token `<|im_end|>` en otros checkpoints invalida sus métricas; este checkpoint lo incluye correctamente, lo que lo convierte en referencia válida para comparar con otros de la misma familia.
- **Reproducción de experimentos**: los investigadores pueden usar este checkpoint para reproducir los resultados del sweep y validar la metodología OPSD con observación calibrada.
- **Estudio de la influencia del esfuerzo de razonamiento**: al ser un checkpoint de la celda `sol-high` (driver con esfuerzo alto), permite comparar con celdas de esfuerzo bajo y estudiar el impacto en el aprendizaje.
- **Pruebas de infraestructura**: el formato safetensors y el tamaño de 18,8 GB permiten probar pipelines de carga, cuantización o inferencia distribuida antes de usar modelos finales.
- **No recomendado para uso en producción**: al ser un checkpoint intermedio sin alineamiento ni evaluación, no debe desplegarse en servicios que atiendan a usuarios reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni similares para este checkpoint. La única indicación es que el `eos_token_id` es correcto, lo que permite una evaluación fiable, pero los números no se han hecho públicos.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint ocupa 18,8 GB en safetensors. En fp16, la inferencia requiere al menos 19 GB de VRAM; en fp32, unos 38 GB. No hay cuantizaciones GGUF disponibles.
- **GPU recomendadas**: una RTX 4090 (24 GB) o A6000 (48 GB) pueden cargar el modelo en fp16. Para fp32 se necesita una A100 (40 GB o 80 GB) o H100.
- **En consumer GPU**: sí, cabe en tarjetas de 24 GB con fp16.
- **Opciones de despliegue**: se puede cargar con Transformers, vLLM, TGI u otros frameworks compatibles con safetensors. No hay soporte GGUF directo sin conversión manual.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No hay modelos directamente comparables en la información disponible. El checkpoint es un intermedio de un entrenamiento experimental, no un modelo final. Como referencia, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9,41 B | no disponible | no disponible | HuggingFace |
| agentic-ptb/sol-high.h043... | 9,41 B | no disponible | no disponible | HuggingFace (checkpoint) |

No hay datos de rendimiento para comparar con otros modelos de 9B como Llama-3.1-8B o Mistral-7B.

## Limitaciones y advertencias

- **Checkpoint intermedio**: no es un modelo final alineado ni evaluado; su rendimiento real es desconocido.
- **Sesgos y alucinación**: hereda los riesgos del modelo base Qwen3.5-9B-Base, pero no hay datos específicos.
- **Licencia y uso comercial**: la licencia no está especificada en el repositorio; no se puede asumir que sea de uso libre.
- **Contexto**: la longitud de contexto no está documentada en este repositorio; depende del modelo base.
- **Idiomas**: no se indica qué idiomas soporta, aunque Qwen3.5 suele ser multilingüe.
- **Riesgo de sobreajuste**: al ser un entrenamiento experimental con OPSD, puede haber sesgos hacia los datos de entrenamiento del sweep (código y razonamiento), no generalizables a otros dominios.
- **Producción**: no debe usarse en producción sin una evaluación exhaustiva y una licencia clara.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h043.opsd-r2e-commit-small-replay.step_1
- Paper OPSD (arXiv 2608.01788): https://arxiv.org/abs/2608.01788v1
- Versión HTML del paper: https://arxiv.org/html/2608.01788v1
- Código del entrenamiento OPSD (GitHub): https://github.com/EcthelionLiu/Agentic-OPSD
- Biblioteca de agentes del equipo Sol-HQ (GitHub): https://github.com/Sol-HQ/agentic-library

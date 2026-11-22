# sergolsub/mlx-drex-v1.5-9B-4bit

## Resumen

`sergolsub/mlx-drex-v1.5-9B-4bit` es una conversión a 4 bits en formato MLX del modelo `nace-ai/drex-v1.5`, un modelo de 9.000 millones de parámetros orientado a tareas de decisión estructurada (clasificación binaria, elección entre categorías y puntuación por criterios) más que a generación de texto libre. La conversión la publica el usuario `sergolsub` y está pensada exclusivamente para ejecución en Apple Silicon mediante `mlx_lm`; no incluye reentrenamiento ni cambios de arquitectura, solo cuantización.

El interés del modelo reside en su interfaz: en lugar de un chat convencional, expone un método `decide()` que recibe un texto y un esquema de decisión (`noul`, `choice`, `score`) y devuelve una respuesta estructurada. Según la model card, la cuantización a 4 bits no solo no degrada la calidad respecto a bf16, sino que la mejora en las métricas internas del autor (84,1 % frente a 78,4 % de precisión), algo que conviene tomar con cautela porque procede de una evaluación propia y no verificada de forma independiente.

El modelo base se distribuye bajo la licencia `nace-ai-open-rail-m-license-modified`, una variante de OpenRAIL-M con posibles restricciones de uso que deben revisarse antes de cualquier despliegue comercial. La información pública disponible es escasa: no hay datos sobre arquitectura interna, composición del dataset de entrenamiento, idiomas soportados ni resultados en benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `nace-ai/drex-v1.5`; sin detalles publicados) |
| Parámetros totales | 9B (según el nombre del repositorio) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits afín (MLX), derivada de una conversión previa a 8 bits; grupo de cuantización no especificado |
| Idiomas soportados | no disponible |
| Licencia | `nace-ai-open-rail-m-license-modified` (categoría `other`; prevalece la licencia del repositorio upstream) |
| Formato de pesos | safetensors con layout MLX, más `config.json`, tokenizer, `chat_template.jinja`, `decision_config.json`, `joint_config.json` y scripts `*_mlx.py` |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base `nace-ai/drex-v1.5`: la model card de esta conversión no detalla si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni tampoco el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de alineación como RLHF o DPO. Lo único verificable es que el modelo incorpora una "cabeza de decisión" (decision head) y una "cabeza conjunta" (joint head), a juzgar por los ficheros `decision_config.json` y `joint_config.json` incluidos en el repositorio, lo que sugiere un ajuste específico para tareas de clasificación y puntuación estructuradas.

La conversión a 4 bits se realizó a partir de una conversión intermedia a 8 bits del mismo autor, mediante dequantización y recuantización afín manteniendo el tamaño de grupo. No hay innovaciones técnicas documentadas más allá de este pipeline de cuantización; no se mencionan decodificación especulativa, atención lineal ni mecanismos similares.

## Capacidades

- Decisión binaria (`noul`): responder sí/no a una pregunta formulada sobre un texto de entrada.
- Elección entre categorías (`choice`): asignar la entrada a una de varias opciones definidas con criterios descriptivos.
- Puntuación por criterios (`score`): evaluar la entrada en una escala ordinal definida por el usuario (por ejemplo, `cosmetic`, `annoying`, `blocks`).
- Procesamiento de texto de entrada en lenguaje natural para tareas de triaje y enrutamiento.
- Interfaz programática vía Python (`Drex.decide()`), con una llamada independiente por cada tipo de tarea.
- No se documenta soporte de tool calling, function calling genérico, agentes multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: no disponibles.

## Casos de uso

- Triaje de tickets de soporte: clasificar cada incidencia entrante en equipos (facturación, envíos, técnico) mediante el tipo `choice`, con criterios definidos por el equipo de operaciones; adecuado porque la salida es directamente una etiqueta accionable.
- Detección de solicitudes de reembolso: usar el tipo `noul` para determinar si el cliente pide explícitamente un reembolso antes de enrutar al flujo de pagos, reduciendo la latencia frente a un LLM generativo.
- Priorización de incidencias: aplicar el tipo `score` con una escala de severidad (`cosmetic`, `annoying`, `blocks`) para ordenar la cola de trabajo de un equipo de soporte técnico.
- Moderación o filtrado de contenido: clasificación binaria de mensajes según políticas internas, siempre que se definan criterios claros en las instrucciones.
- Enrutamiento en pipelines de automatización: decidir qué rama de un flujo ejecutar (por ejemplo, escalar a humano o resolver automáticamente) con una llamada de baja latencia (mediana de 1.292 ms en M4 Pro).
- Etiquetado asistido de datos: generar etiquetas categóricas u ordinales sobre corpus de texto para construir datasets de entrenamiento o evaluación, aprovechando que el modelo cabe en memoria unificada de un Mac (7,32 GB de pico residente).
- Procesamiento local en dispositivos Apple: desplegar el modelo en un Mac mini M4 Pro sin GPU dedicada para tareas de clasificación en tiempo casi real (1,75 decisiones cortas por segundo sostenidas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente métricas internas de la evaluación propia del autor, comparando la versión 4 bits con bf16:

| Métrica (evaluación propia) | 4 bits | bf16 |
|---|---|---|
| Accuracy | 84,1 % | 78,4 % |
| Noul | 92,3 % | 84,6 % |
| Choice | 84,0 % | 80,0 % |
| Score | 70,8 % | 66,7 % |
| Perplejidad de calibración | 1,978 | 2,053 |

Estos datos proceden del autor de la conversión y no han sido verificados de forma independiente; el hecho de que la cuantización a 4 bits supere a bf16 en todas las métricas es contraintuitivo y debe interpretarse con precaución.

## Requisitos de hardware

- VRAM/memoria: 6,5 GB en disco y 7,32 GB de pico de memoria residente medidos en un Mac mini M4 Pro con 48 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4, idealmente con 16 GB o más de memoria unificada). No está pensado para GPU NVIDIA o AMD, ya que el formato es MLX.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; no aplica a GPUs discretas convencionales por el formato.
- Opciones de despliegue: `mlx_lm` y el cargador propio `drex_mlx.py` incluido en el repositorio; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: carga en 3,72 s, latencia mediana de decisión de 1.292 ms y 1,75 decisiones cortas por segundo sostenidas en M4 Pro.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificadores de decisión estructurada de 9B) ni datos de rendimiento de alternativas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La licencia `nace-ai-open-rail-m-license-modified` es una variante de OpenRAIL-M con posibles restricciones de uso; debe revisarse el fichero LICENSE del repositorio upstream (`nace-ai/drex-v1.5`), que prevalece en caso de conflicto, antes de cualquier uso comercial.
- No hay información publicada sobre sesgos, idiomas soportados ni dominios de entrenamiento, por lo que el comportamiento fuera del dominio previsto es impredecible.
- Riesgo de alucinación en las etiquetas: al ser un modelo de decisión, puede producir clasificaciones incorrectas con alta confianza; se recomienda validación humana en flujos críticos.
- Las métricas de calidad proceden de una evaluación propia del autor de la conversión, sin verificación independiente, y la mejora tras cuantizar a 4 bits es sospechosamente favorable.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a infraestructura NVIDIA sin reconversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documenta la longitud de contexto, lo que impide garantizar el comportamiento con entradas largas.
- La fecha de creación indicada (2026-11-22) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/mlx-drex-v1.5-9B-4bit
- Modelo base: https://huggingface.co/nace-ai/drex-v1.5

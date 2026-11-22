# sergolsub/d3-ultra-27B-MLX-4bit

## Resumen

d3-ultra-27B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo `vllm-sr/d3-ultra`, publicada por el usuario `sergolsub` en Hugging Face. El modelo está pensado para ejecutarse en Apple Silicon mediante `mlx_lm` y no introduce reentrenamiento ni cambios de arquitectura: se trata de una derivación cuantizada de los pesos originales, manteniendo la licencia Apache 2.0 del repositorio upstream.

La característica diferencial del modelo no es la generación de texto libre, sino una interfaz de decisión estructurada (`model.decide`) que resuelve tareas acotadas con esquemas tipados: respuestas booleanas (`noul`), clasificación por elección (`choice`), puntuación ordinal (`score`) y localización de objetos por caja (`box`). Esto lo orienta a pipelines de enrutamiento, triaje y extracción de decisiones en producción más que a chat conversacional.

El nombre indica un tamaño aproximado de 27B parámetros y la model card reporta métricas medidas en un Mac mini M4 Pro de 48 GB: 15,34 GB en disco, 8,51 s de carga, 16,23 GB de memoria residente pico y una latencia mediana de decisión de 2277 ms. La información pública disponible es muy limitada: no se detallan datos de entrenamiento, composición del dataset ni resultados de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `vllm-sr/d3-ultra`; la model card solo describe la conversión MLX) |
| Parametros totales | ~27B (según el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, mismo group size que la conversión 8-bit previa (requantización dequantize → requantize) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada del repositorio upstream) |
| Formato de pesos | safetensors en layout MLX; incluye `config.json`, tokenizer, `chat_template.jinja`, `*_mlx.py`, `decision_config.json` y `joint_config.json` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base `vllm-sr/d3-ultra` (transformer, MoE, híbrida u otra). Lo que sí se documenta es el proceso de conversión: los pesos 4-bit se derivan de una conversión MLX 8-bit previa mediante dequantize y posterior requantize affine a 4 bits, conservando el mismo group size. No hay reentrenamiento ni modificaciones arquitectónicas, por lo que las capacidades del modelo son las del upstream, degradadas por la cuantización.

El artefacto incluye glue de inferencia específico para el modo de decisión (`*_mlx.py`, `decision_config.json`, `joint_config.json`), lo que sugiere que el modelo base incorpora cabezas o modos de decisión estructurada además de la generación estándar. No se dispone de información sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas del modelo original.

## Capacidades

- Decisión estructurada con esquemas tipados: `noul` (booleano), `choice` (clasificación entre criterios), `score` (puntuación ordinal sobre una lista de criterios) y `box` (localización de objetos por caja delimitadora).
- Procesamiento de una tarea por llamada: cada cuestión se pasa como objeto independiente a `model.decide`.
- Enrutamiento y triaje: asignación de tickets a equipos mediante criterios declarados en el esquema.
- Evaluación de severidad: puntuación ordinal de impacto sobre categorías definidas por el usuario.
- Localización visual básica: la tarea `box` sugiere capacidad de grounding sobre descripciones de imagen.
- Generación de texto: no documentada explícitamente en la model card; el artefacto incluye tokenizer y chat template, lo que indica soporte de plantilla conversacional.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Triaje de tickets de soporte: usar `choice` para enrutar cada incidencia al equipo adecuado (facturación, envíos, etc.) declarando los criterios en el esquema; la latencia medida (2277 ms mediana) es aceptable para colas asíncronas.
- Detección de intención de reembolso: usar `noul` para responder preguntas booleanas sobre el texto del cliente, integrándolo en un flujo previo a la gestión humana.
- Priorización de incidencias: usar `score` para clasificar la severidad de errores de infraestructura (por ejemplo, "disk quota exceeded") en una escala ordinal definida por el equipo de operaciones.
- Grounding de objetos en descripciones visuales: usar `box` para localizar elementos señalados en una escena descrita, útil en pipelines de anotación asistida.
- Ejecución local en Apple Silicon: el modelo cabe en 16,23 GB de memoria pico en un Mac mini M4 Pro de 48 GB, lo que permite desplegar decisiones sensibles en local sin enviar datos a la nube.
- Clasificación por lotes en pipelines de datos: con 0,67 decisiones cortas por segundo sostenidas, es viable procesar colas de moderación o etiquetado en segundo plano.
- Prototipado de agentes con salidas verificables: la interfaz tipada reduce la necesidad de parsear texto libre y facilita validar la salida contra un esquema.

## Benchmarks y rendimiento

La model card reporta métricas de calidad de la cuantización y de rendimiento en hardware concreto, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se reproducen a continuación tal cual:

| Metrica | 4-bit MLX | bf16 (referencia) |
|---|---|---|
| Accuracy (eval propia) | 84,4% | 87,8% |
| noul | 90,0% | 87,5% |
| choice | 88,0% | 96,0% |
| score | 72,0% | 80,0% |
| Perplejidad de calibración | 2,618 | 2,534 |

| Metrica de sistema (Mac mini M4 Pro 48 GB) | Valor |
|---|---|
| Tamano en disco | 15,34 GB |
| Tiempo de carga | 8,51 s |
| Memoria residente pico | 16,23 GB |
| Latencia mediana de decisión | 2277 ms |
| Throughput sostenido | 0,67 decisiones cortas/s |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~16,2 GB de memoria residente pico medida en MLX 4-bit; presupuestar al menos 20 GB libres para margen.
- Hardware validado: Mac mini M4 Pro con 48 GB de memoria unificada.
- Cabe en GPU de consumo: no aplica directamente, ya que el formato es MLX (Apple Silicon); no se documenta compatibilidad con CUDA.
- GPUs recomendadas: no disponible para el artefacto MLX; para el modelo base habría que consultar el repositorio upstream.
- Opciones de despliegue: `mlx_lm` con el loader incluido (`d3_mlx.D3`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: mediana de 2277 ms por decisión y 0,67 decisiones cortas por segundo en el hardware citado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de decisión estructurada o conversiones MLX de tamaño similar) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La model card no documenta la arquitectura, el contexto máximo ni los idiomas del modelo base; no es posible garantizar comportamiento fuera de los casos medidos.
- Degradación por cuantización: la propia evaluación del autor muestra caídas notables en `choice` (88,0% frente a 96,0% en bf16) y en `score` (72,0% frente a 80,0%); `noul` mejora ligeramente (90,0% frente a 87,5%), lo que indica que el efecto depende de la tarea.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez; en tareas de decisión estructurada el riesgo es de clasificación errónea, no de texto inventado, pero no hay datos que lo cuantifiquen.
- Licencia Apache 2.0 heredada del upstream; la model card indica que, en caso de conflicto, prevalece la licencia del repositorio original. Verificar el repositorio `vllm-sr/d3-ultra` antes de uso comercial.
- El artefacto está atado a Apple Silicon y a `mlx_lm`; no hay ruta de despliegue documentada para servidores CUDA.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-22); no hay evidencia de uso en producción ni validación comunitaria.
- La model card menciona que los ficheros `*.safetensors` son "8-bit weights (MLX layout)" pese a que el repositorio se presenta como 4-bit; esta inconsistencia debe verificarse antes de desplegar.
- El rendimiento medido (0,67 decisiones/s) limita su uso en escenarios de baja latencia interactiva.

## Enlaces

- Hugging Face: https://huggingface.co/sergolsub/d3-ultra-27B-MLX-4bit
- Modelo base: https://huggingface.co/vllm-sr/d3-ultra

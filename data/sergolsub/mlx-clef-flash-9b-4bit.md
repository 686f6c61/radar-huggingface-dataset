# sergolsub/mlx-clef-flash-9B-4bit

## Resumen

MLX-CLEF-Flash-9B-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo Cloudflare/clef-flash, publicada por el usuario sergolsub. El objetivo no es otro que permitir la ejecución del modelo original en hardware Apple Silicon mediante la librería `mlx_lm`, sin reentrenamiento ni cambios de arquitectura: se trata de una derivación puramente de cuantización (descuantización desde una conversión previa a 8 bits y recuantización afín a 4 bits con el mismo tamaño de grupo).

El modelo base, clef-flash, está orientado a la toma de decisiones estructuradas más que a la generación libre de texto: expone una interfaz `decide()` que resuelve tareas tipadas como `noul` (sí/no), `choice` (selección entre criterios) y `score` (puntuación sobre una escala). Esta ficha describe la variante MLX 4-bit, que conserva esa misma interfaz y añade ficheros de pegamento (`clef_mlx.py`, `decision_config.json`, `joint_config.json`) para la inferencia de las cabezas de decisión.

La relevancia de esta publicación es doble: por un lado, demuestra que un modelo de 9B puede caber en 6,5 GB en disco y ejecutarse con un pico de memoria residente de 7,48 GB en un Mac mini M4 Pro de 48 GB; por otro, cuantifica la pérdida de calidad asociada a la cuantización 4-bit frente a bf16, con métricas de accuracy, elección y perplejidad de calibración. La licencia Apache 2.0 se hereda del repositorio upstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Cloudflare/clef-flash; sin cambios de arquitectura en la conversión) |
| Parámetros totales | 9B (según el nombre del repositorio; no confirmado en la model card) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit afín (MLX), derivada de una conversión previa a 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Cloudflare/clef-flash; prevalece la del repositorio upstream) |
| Formato de pesos | safetensors (layout MLX), con `config.json`, tokenizer, `chat_template.jinja`, `clef_mlx.py`, `decision_config.json`, `joint_config.json` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Cloudflare/clef-flash en la documentación proporcionada: no se detalla si es un transformer denso, un MoE o un híbrido, ni se especifican el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF o DPO. Lo que sí se documenta es la existencia de una "decision mode" con cabezas de decisión específicas (`noul`, `choice`, `score`), inferidas mediante los ficheros `decision_config.json` y `joint_config.json` incluidos en el repositorio.

La innovación técnica de esta publicación concreta es el pipeline de cuantización: se parte de una conversión MLX a 8 bits, se descuantiza y se recuantiza de forma afín a 4 bits manteniendo el mismo tamaño de grupo. El autor reporta que la conversión no implica reentrenamiento ni modificación arquitectónica, y publica métricas comparativas 4-bit frente a bf16 para justificar la decisión.

## Capacidades

- Toma de decisiones estructuradas mediante la API `decide()`, con tres tipos de tarea: `noul` (respuesta binaria sí/no), `choice` (selección entre criterios etiquetados) y `score` (puntuación sobre una escala de criterios ordenados).
- Clasificación con instrucciones en lenguaje natural y criterios definidos por el usuario (por ejemplo, asignación de equipo, severidad de incidencia).
- Soporte de múltiples preguntas independientes por llamada, cada una como objeto separado con su propio tipo e instrucciones.
- Ejecución nativa en Apple Silicon mediante MLX (`mlx_lm`), con carga rápida y bajo consumo de memoria.
- No se documentan capacidades de generación libre de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso más allá de la interfaz de decisión.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo puede decidir a qué equipo (facturación, envíos, técnico) corresponde una incidencia usando la tarea `choice` con criterios etiquetados, tal y como muestra el ejemplo de la model card con el pedido #7821.
- Detección de intención de reembolso: con la tarea `noul` y una instrucción como "¿el cliente quiere un reembolso?", se puede preclasificar conversaciones de atención al cliente antes de derivarlas a un agente humano.
- Triaje de severidad de incidencias: la tarea `score` con criterios como `["cosmetic", "annoying", "blocks"]` permite priorizar colas de errores (por ejemplo, "disk quota exceeded on the worker") sin un modelo generativo completo.
- Automatización de back-office en local: al ejecutarse en un Mac mini M4 Pro con 7,48 GB de pico de memoria, encaja en flujos de decisión que deben permanecer on-device por privacidad o por ausencia de conectividad.
- Procesamiento por lotes de decisiones cortas: con 2,15 decisiones cortas por segundo sostenidas y una latencia mediana de 734 ms, es viable para pipelines que resuelven cientos de clasificaciones por hora en un solo equipo.
- Prototipado y evaluación de modelos de decisión en portátiles Apple: la carga en 1,9 s y el tamaño de 6,5 GB en disco facilitan iterar sobre configuraciones de criterios sin infraestructura GPU.

## Benchmarks y rendimiento

Métricas publicadas por el autor en la model card, comparando la conversión 4-bit con los pesos bf16 originales:

| Métrica | 4-bit | bf16 |
|---|---|---|
| Accuracy (eval propia) | 80,7 % | 81,8 % |
| noul | 84,6 % | 84,6 % |
| choice | 76,0 % | 84,0 % |
| score | 79,2 % | 75,0 % |
| Perplejidad de calibración | 2,385 | 2,341 |

Métricas de ejecución medidas en Mac mini M4 Pro de 48 GB con MLX 4-bit:

| Métrica | Valor |
|---|---|
| Tamaño en disco | 6,5 GB |
| Tiempo de carga | 1,9 s |
| Pico de memoria residente | 7,48 GB |
| Latencia mediana de decisión | 734 ms |
| Throughput sostenido | 2,15 decisiones cortas/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 7,48 GB de pico residente medidos en la configuración de referencia (Mac mini M4 Pro, 48 GB).
- GPU recomendadas: Apple Silicon con al menos 16 GB de memoria unificada; el autor valida la ejecución en M4 Pro. No hay datos publicados para A100, H100 ni RTX 4090, ya que el formato es MLX y no CUDA.
- Cabe en GPU de consumidor: sí, en equipos Apple Silicon con memoria unificada suficiente (16 GB o más como margen prudente); no está pensado para GPUs NVIDIA.
- Opciones de despliegue: `mlx_lm` con el loader incluido `clef_mlx.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 734 ms de mediana por decisión y 2,15 decisiones cortas por segundo sostenidas en M4 Pro de 48 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sergolsub/mlx-clef-flash-9B-4bit | 9B (según nombre) | no disponible | 4-bit MLX | Apache 2.0 | Hugging Face |
| Cloudflare/clef-flash (bf16) | 9B (según nombre) | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Conversión MLX 8-bit de clef-flash | 9B (según nombre) | no disponible | 8-bit MLX | Apache 2.0 | Referenciada por el autor, sin URL |

No se dispone de información sobre otros modelos comparables de la misma categoría (decisión estructurada) en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización 4-bit degrada la calidad frente a bf16 en la tarea `choice` (76,0 % frente a 84,0 %), una caída de 8 puntos que puede ser relevante en enrutamientos con criterios sutiles.
- La tarea `score` mejora en 4-bit (79,2 % frente a 75,0 %), lo que sugiere que las métricas agregadas no deben interpretarse de forma uniforme entre tareas.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento ante entradas fuera de distribución; el modelo está orientado a decisiones cortas y estructuradas, no a generación abierta.
- Riesgo de alucinación no evaluado en la información disponible; la interfaz de decisión acota la salida a opciones predefinidas, lo que reduce pero no elimina el riesgo.
- La licencia Apache 2.0 se hereda del repositorio upstream; ante cualquier conflicto prevalece la LICENSE de Cloudflare/clef-flash. Verificar términos antes de uso comercial.
- La model card indica que los ficheros `*.safetensors` son "8-bit weights (MLX layout)" pese a que el repositorio se presenta como 4-bit; conviene validar la cuantización real de los pesos antes de desplegar en producción.
- Dependencia exclusiva de MLX: no hay soporte documentado para CUDA, vLLM, llama.cpp ni Ollama, lo que limita el despliegue a hardware Apple Silicon.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/mlx-clef-flash-9B-4bit
- Modelo base: https://huggingface.co/Cloudflare/clef-flash

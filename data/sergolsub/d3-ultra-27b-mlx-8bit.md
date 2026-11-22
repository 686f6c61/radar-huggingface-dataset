# sergolsub/d3-ultra-27B-MLX-8bit

## Resumen

`d3-ultra-27B-MLX-8bit` es una conversión cuantizada a 8 bits en formato MLX del modelo `vllm-sr/d3-ultra`, publicada por el usuario sergolsub. El modelo base pertenece a la familia `qwen3_5` según los tags de Hugging Face, cuenta con 26.085.330.160 parámetros (aproximadamente 26,1 mil millones) y está pensado para ejecutarse en hardware Apple Silicon mediante la librería `mlx_lm`. No se trata de un modelo de chat generalista al uso: la model card describe un modo de inferencia orientado a decisiones estructuradas (clasificación booleana, elección entre categorías, puntuación ordinal y localización de objetos en imagen) a través de una API `decide()`.

La relevancia de esta ficha es doble. Por un lado, documenta una conversión de cuantización que preserva la calidad del modelo original según las métricas del autor (precisión idéntica entre BF16 y 8 bits en su conjunto de evaluación). Por otro, introduce una interfaz de inferencia poco habitual, con cabezas de decisión específicas (`decision_config.json`, `joint_config.json`, `readout.safetensors`) que separan la tarea de razonamiento general de la emisión de una respuesta estructurada. Esto lo hace interesante para pipelines de enrutamiento, triaje y moderación donde se necesita una salida tipada y no texto libre.

El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y fue creado el 22 de noviembre de 2026. La licencia es Apache 2.0, heredada de los pesos originales. La información pública disponible es limitada: no hay datos de benchmarks estándar (MMLU, HumanEval, GSM8K), ni composición del dataset de entrenamiento, ni lista de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia `qwen3_5`, según tags; detalles de capas y atención no disponibles) |
| Parametros totales | 26.085.330.160 (~26,1 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); el modelo base está en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout MLX), 11 shards; incluye `readout.safetensors` y scripts `*_mlx.py` |
| Libreria | `mlx` / `mlx_lm` |
| Tamano del repo | 28,2 GB |
| Hardware medido por el autor | Mac mini M4 Pro 48 GB |
| Memoria pico en carga | 17,44 GB |
| Tiempo de carga | 15,44 s |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible. Los tags de Hugging Face indican `qwen3_5`, lo que sugiere que el modelo base `vllm-sr/d3-ultra` deriva de la familia Qwen 3.5, pero no se especifican número de capas, dimensión oculta, tipo de atención (completa, lineal o híbrida), ni si emplea mezcla de expertos. El recuento real de parámetros en safetensors (26,1 B) es consistente con un transformer denso de tamaño medio-grande, aunque no se puede confirmar sin la config detallada.

El proceso de conversión documentado es únicamente de cuantización: se pasa de BF16 a 8 bits en formato MLX, sin reentrenamiento ni cambios arquitectónicos. La model card menciona que la conversión se hizo "stream-converted from the upstream BF16 shards (nested text_config)", lo que indica que el modelo original tiene una configuración anidada con un subconfig de texto (probablemente un modelo multimodal con torre de visión, dado que existe `preprocessor_config.json` y `video_preprocessor_config.json`). También se incluyen artefactos de cabezas de decisión (`decision_config.json`, `joint_config.json`, `readout.safetensors`) que no forman parte del transformer estándar y que implementan la lógica de `decide()`.

No hay información sobre el número de tokens de entrenamiento, composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similar. La model card no reporta ningún proceso de alineación posterior. La calibración de la cuantización se evalúa con perplejidad sobre un conjunto no especificado: 2,548 en 8 bits frente a 2,534 en BF16.

## Capacidades

- Generación de texto y razonamiento general: el modelo base es un transformer de lenguaje, aunque la model card se centra en el modo de decisión.
- Decisiones booleanas (`type: "noul"`): responder sí/no a una instrucción sobre un texto de entrada.
- Elección entre categorías (`type: "choice"`): seleccionar una opción entre un conjunto de criterios definidos con descripciones.
- Puntuación ordinal (`type: "score"`): asignar un nivel dentro de una lista ordenada de criterios (por ejemplo, severidad).
- Localización de objetos en imagen (`type: "box"`): devolver una caja delimitadora sobre una imagen, lo que implica capacidades de visión.
- Procesamiento de vídeo: la presencia de `video_preprocessor_config.json` sugiere soporte de entrada de vídeo, aunque no se detalla en la model card.
- Interfaz de inferencia tipada: cada llamada a `decide()` recibe un texto (o imagen) y un diccionario de tareas, devolviendo una estructura por tarea.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso ni modo "thinking".

## Casos de uso

- Triaje de tickets de soporte: usar `decide()` con `type: "choice"` para enrutar cada incidencia al equipo adecuado (facturación, envíos, técnico) a partir del texto del cliente. La latencia medida (mediana 4.740 ms por decisión) es aceptable para procesamiento por lotes o asíncrono, no para chat en tiempo real.
- Detección de intención de reembolso: con `type: "noul"` se puede clasificar si el cliente solicita un reembolso antes de derivar a un agente humano, reduciendo el coste de gestión manual en colas de atención.
- Priorización de incidencias: con `type: "score"` y criterios ordinales ("cosmetic", "annoying", "blocks") se puede asignar severidad a errores de plataforma o de CI/CD y ordenar la cola de resolución.
- Moderación de contenido con imagen: con `type: "box"` el modelo localiza objetos en una imagen (por ejemplo, señales, logotipos o elementos concretos), útil en pipelines de revisión visual automatizada.
- Enrutamiento en sistemas RAG: usar la salida de `choice` para decidir qué índice o colección consultar antes de recuperar documentos, aprovechando que el modelo corre localmente en Apple Silicon sin enviar datos a la nube.
- Análisis de vídeo para clasificación de eventos: si el soporte de vídeo se confirma, se podría usar para etiquetar escenas o detectar elementos concretos en flujos de vigilancia o monitorización, siempre que la latencia de ~5 s por decisión sea admisible.
- Evaluación offline en portátiles Apple: prototipado de clasificadores de decisión sin GPU dedicada, ya que el modelo cabe en 17,44 GB de memoria pico en un M4 Pro de 48 GB.

## Benchmarks y rendimiento

El autor reporta métricas propias de calidad tras la cuantización y de latencia, pero no benchmarks estándar de la industria (MMLU, HumanEval, GSM8K).

| Metrica | 8 bits (MLX) | BF16 (referencia) |
|---|---|---|
| Accuracy (eval del autor) | 87,8 % | 87,8 % |
| Noul | 87,5 % | 87,5 % |
| Choice | 96,0 % | 96,0 % |
| Score | 80,0 % | 80,0 % |
| Perplejidad de calibración | 2,548 | 2,534 |

| Metrica de rendimiento | Valor |
|---|---|
| Latencia mediana por decisión | 4.740 ms |
| Decisiones cortas sostenidas | 0,49 /s |
| Tiempo de carga | 15,44 s |
| Memoria pico residente | 17,44 GB |
| Hardware de medida | Mac mini M4 Pro 48 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~17,5 GB en pico con cuantización 8 bits MLX, según medición del autor en M4 Pro de 48 GB.
- Tamaño en disco: 28,15 GB (11 shards safetensors + tokenizer + scripts).
- GPU recomendadas: Apple Silicon con al menos 24-32 GB de memoria unificada para margen; el autor valida M4 Pro de 48 GB. No hay datos de funcionamiento en GPU NVIDIA/AMD, ya que el formato es MLX.
- Cabe en GPU de consumo: sí, en Apple Silicon de gama alta (M2/M3/M4 Pro/Max con ≥32 GB). No es compatible con CUDA de forma nativa.
- Opciones de despliegue: `mlx_lm` (librería declarada), scripts `d3_mlx.py` incluidos en el repo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ~4,74 s por decisión (mediana) y ~0,49 decisiones/s sostenidas en M4 Pro 48 GB. No hay datos para otros hardware.

## Comparativa con modelos similares

No hay información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría, dado que no se documentan benchmarks estándar ni el modelo base tiene ficha pública detallada en la información proporcionada. Se puede comparar a nivel de especificaciones con el propio modelo base y con conversiones MLX típicas de la familia Qwen.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| `sergolsub/d3-ultra-27B-MLX-8bit` | ~26,1 B | no disponible | 8 bits MLX | Apache 2.0 | safetensors MLX |
| `vllm-sr/d3-ultra` (base) | no disponible | no disponible | BF16 | Apache 2.0 | safetensors |
| Conversiones MLX de Qwen 3.5 (referencia genérica) | variable | no disponible | 4/8 bits | según modelo | safetensors MLX |

No disponible para comparativas de rendimiento con modelos de la misma tarea (clasificación estructurada) porque no se han publicado métricas comparables.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes: no hay validación comunitaria ni reportes independientes de calidad o estabilidad.
- La model card no documenta sesgos, datos de entrenamiento ni proceso de alineación; el riesgo de sesgo y alucinación no está caracterizado.
- La salida está restringida a tareas tipadas (`noul`, `choice`, `score`, `box`); no es un modelo de chat generalista y su uso como generador libre no está validado.
- Latencia alta para uso interactivo: ~4,7 s por decisión en el hardware medido, lo que descarta aplicaciones en tiempo real.
- Solo formato MLX: no se puede desplegar en vLLM, TGI, llama.cpp ni Ollama sin reconversión.
- No se especifican idiomas soportados; el tokenizer es de la familia Qwen (multilingüe), pero no hay confirmación de cobertura.
- Licencia Apache 2.0 permite uso comercial, pero la model card indica que prevalece la licencia del repositorio upstream en caso de conflicto; conviene revisar `vllm-sr/d3-ultra` antes de producción.
- La cuantización 8 bits preserva métricas en la evaluación del autor, pero no hay validación en dominios distintos al conjunto de calibración.
- El soporte de visión y vídeo se infiere de los ficheros de preprocesado, pero no está documentado con detalle ni validado con benchmarks.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/d3-ultra-27B-MLX-8bit
- Modelo base: https://huggingface.co/vllm-sr/d3-ultra
- Librería MLX: https://github.com/ml-explore/mlx
- `mlx_lm`: https://github.com/ml-explore/mlx-lm

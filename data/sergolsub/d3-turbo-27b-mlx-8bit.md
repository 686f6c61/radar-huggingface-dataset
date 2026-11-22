# sergolsub/d3-turbo-27B-MLX-8bit

## Resumen

d3-turbo-27B-MLX-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo vllm-sr/d3-turbo, publicada por el usuario sergolsub. El modelo original pertenece a la familia Qwen3.5 (según la etiqueta `qwen3_5` del repositorio) y cuenta con 26.085.330.160 parámetros totales, lo que lo sitúa en la categoría de ~27B. La conversión está pensada específicamente para ejecutarse en Apple Silicon mediante `mlx_lm`, sin reentrenamiento ni cambios de arquitectura.

Lo más distintivo de este modelo no es la generación de texto libre, sino su modo de decisión: incorpora cabeceras de decisión (`decision_config.json`, `joint_config.json`) que permiten realizar tareas estructuradas de clasificación binaria (`noul`), elección entre opciones (`choice`), puntuación ordinal (`score`) y localización de objetos en imagen (`box`). Esto lo orienta a automatización de triaje, enrutamiento y moderación más que a chat conversacional.

La relevancia de esta ficha radica en que documenta una conversión práctica para hardware de consumo (Mac mini M4 Pro con 48 GB), con métricas de latencia, memoria y calidad de cuantización medidas por el autor, además de una auditoría KL tensor a tensor frente a los pesos BF16 originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según tag `qwen3_5`); incluye atención lineal en la capa 0 (`linear_attn.in_proj_b`) y cabeceras de decisión |
| Parametros totales | 26.085.330.160 (~26,1B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); los pesos originales son BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (26 shards, layout MLX) + `config.json`, tokenizer, `chat_template.jinja`, `d3_mlx.py`, `decision_config.json`, `joint_config.json` |

## Arquitectura y entrenamiento

El modelo base vllm-sr/d3-turbo es un transformer de ~26B parámetros etiquetado como `qwen3_5`. La auditoría KL del repositorio revela que la primera capa del modelo de lenguaje emplea atención lineal (`language_model.layers.0.linear_attn.in_proj_b.weight`), lo que sugiere una arquitectura híbrida con componentes de atención lineal además de atención estándar. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La conversión realizada por sergolsub es puramente de cuantización: se transforman los shards BF16 originales a 8 bits en layout MLX, sin reentrenamiento ni modificación de la arquitectura. El autor documenta una auditoría de calidad de cuantización comparando tensor a tensor los pesos desquantizados frente a los BF16 de origen: 1183 tensores comparados, KL media de 3,52e-04, KL máxima de 6,57e-03 y 581 tensores con KL distinto de cero. La peor capa en términos de divergencia es `language_model.layers.0.linear_attn.in_proj_b.weight` con KL 6,57e-03. El repositorio incluye `kl_audit.json` con la tabla completa por tensor (KL, error absoluto máximo y RMSE).

## Capacidades

- Decisión binaria (`noul`): responde preguntas de sí/no sobre un texto de entrada, por ejemplo si el cliente solicita un reembolso.
- Elección entre categorías (`choice`): clasifica la entrada en una de varias opciones definidas con criterios descriptivos, útil para enrutamiento a equipos.
- Puntuación ordinal (`score`): asigna un nivel dentro de una escala de criterios ordenados (por ejemplo, gravedad de una incidencia).
- Localización de objetos en imagen (`box`): devuelve una caja delimitadora con nivel de confianza sobre una imagen de entrada.
- Procesamiento multimodal texto + imagen: el autor reporta latencias separadas para texto (512 tokens) e imagen 512x512 combinada con texto.
- Modo de decisión con cabeceras dedicadas: la inferencia se realiza mediante el método `decide()` del cargador `d3_mlx.py`, que recibe la entrada y un diccionario de tareas.
- Generación de texto libre: no se documenta explícitamente en la model card; las capacidades descritas se centran en el modo de decisión.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).

## Casos de uso

- Triaje de tickets de soporte: usar el modo `choice` para enrutar cada incidencia al equipo adecuado (facturación, envíos, técnico) a partir de criterios descriptivos, con una latencia medida de decisión de ~2,46 s de mediana.
- Detección de intención de reembolso: el modo `noul` permite responder preguntas binarias como "¿el cliente quiere un reembolso?" sobre el texto del ticket, integrable en un pipeline de atención al cliente.
- Priorización de incidencias: el modo `score` con criterios ordenados (cosmético, molesto, bloqueante) sirve para asignar severidad automáticamente y ordenar la cola de trabajo.
- Moderación y verificación visual: el modo `box` localiza objetos concretos en imágenes (por ejemplo, señales de tráfico) con confianza reportada, útil en pipelines de inspección de contenido.
- Automatización de clasificación documental por lotes: con un throughput sostenido de 0,62 decisiones cortas por segundo en un Mac mini M4 Pro, encaja en procesamiento offline de volúmenes moderados.
- Prototipado local en Apple Silicon: desarrolladores que quieran validar lógicas de decisión sin depender de APIs externas pueden ejecutar el modelo íntegramente en un Mac con 48 GB de memoria unificada.
- Enrutamiento en asistentes internos: combinar `choice` y `score` para decidir la siguiente acción de un flujo (escalar a humano, responder automáticamente, marcar para revisión) sin necesidad de un LLM generativo completo.

## Benchmarks y rendimiento

El autor publica métricas de rendimiento y calidad de su propia evaluación, no benchmarks estándar de la comunidad. Se recogen a continuación tal cual:

| Metrica | Valor |
|---|---|
| Calidad tras cuantización 8 bits (eval del autor) — accuracy | 87,8% |
| Calidad — noul | 95,0% |
| Calidad — choice | 84,0% |
| Calidad — score | 80,0% |
| Calibración PPL | 2,060 |
| Carga del modelo (Mac mini M4 Pro 48 GB) | 9,5 s |
| RSS pico | 17,69 GB |
| Texto 512 tokens (479 tok), media de 5 tras 3 de calentamiento — binario | 4577 ms |
| Texto 512 tokens — elección múltiple | 4859 ms |
| Texto 512 tokens — score | 4575 ms |
| Imagen 512x512 + texto — binario | 7506 ms |
| Imagen 512x512 + texto — elección múltiple | 7515 ms |
| Imagen 512x512 + texto — score | 7507 ms |
| Box 512x512 | 7830 ms (mediana 7830 ms), confianza 1 |
| Latencia de decisión | mediana 2461 ms |
| Throughput sostenido | 0,62 decisiones cortas/s |
| Tamano en disco | 27,85 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el autor reporta un RSS pico de 17,69 GB con cuantización 8 bits en MLX; el tamaño en disco es de 27,85 GB.
- Hardware de referencia medido: Mac mini M4 Pro con 48 GB de memoria unificada.
- GPU recomendadas: no disponible para CUDA; el formato MLX está orientado a Apple Silicon. Para el modelo original BF16 en otras plataformas se requeriría hardware con al menos ~52 GB de memoria para los pesos (26B × 2 bytes) más overhead.
- ¿Cabe en GPU de consumo? En el formato MLX 8 bits sí cabe en equipos Apple Silicon con 32 GB o más de memoria unificada, según el RSS medido de 17,69 GB. En GPUs NVIDIA de consumo (RTX 4090, 24 GB) requeriría cuantizaciones adicionales y una conversión a otro formato, no disponible en este repositorio.
- Opciones de despliegue: `mlx_lm` en Apple Silicon mediante el cargador `d3_mlx.py` incluido. vLLM, llama.cpp, Ollama o TGI no están soportados por este repositorio (los pesos están en layout MLX 8 bits).
- Latencia y throughput: mediana de 2461 ms por decisión y 0,62 decisiones cortas por segundo sostenidas en el hardware de referencia; carga del modelo en 9,5 s.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos en la documentación proporcionada. El modelo base vllm-sr/d3-turbo pertenece a la familia Qwen3.5 según las etiquetas, pero no se aportan datos de otros miembros de esa familia ni de alternativas de decisión/clasificación con los que contrastar parámetros, contexto o rendimiento.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| d3-turbo-27B-MLX-8bit | ~26,1B | no disponible | Apache 2.0 | Hugging Face (MLX 8 bits) |
| vllm-sr/d3-turbo (base) | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card no declara idiomas soportados; no hay garantía de rendimiento multilingüe ni específicamente en castellano.
- No se documentan sesgos conocidos ni evaluaciones de sesgo del modelo base ni de la conversión.
- Riesgo de alucinación: no evaluado en la información disponible; el modo de decisión estructurada reduce la superficie de generación libre, pero las puntuaciones y elecciones pueden ser erróneas en entradas ambiguas.
- La calidad tras cuantización medida por el autor muestra una caída apreciable en `score` (80,0%) y `choice` (84,0%) frente a `noul` (95,0%); conviene validar en el dominio concreto antes de producción.
- El peor tensor en la auditoría KL es la proyección de atención lineal de la capa 0 (KL 6,57e-03), lo que indica mayor divergencia en las primeras capas.
- Licencia Apache 2.0 heredada del modelo original; en caso de conflicto prevalece la licencia del repositorio upstream.
- Los pesos están en layout MLX 8 bits y solo son utilizables con `mlx_lm` en Apple Silicon; no son directamente compatibles con vLLM, TGI, llama.cpp ni GPUs NVIDIA sin reconversión.
- El repositorio no incluye pipeline declarado ni idiomas; la integración requiere usar el cargador personalizado `d3_mlx.py` y los ficheros `decision_config.json` / `joint_config.json`.
- El rendimiento medido (0,62 decisiones/s) limita su uso a cargas offline o de baja concurrencia; no es adecuado para servicios de alta demanda en el hardware de referencia.
- No se dispone de información sobre la longitud de contexto, lo que impide garantizar el manejo de entradas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/d3-turbo-27B-MLX-8bit
- Modelo base: https://huggingface.co/vllm-sr/d3-turbo
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada.

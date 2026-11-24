# sergolsub/mlx-d3-flash-9B

## Resumen

Decision3 Flash es un modelo de 8.392.695.024 parámetros (aproximadamente 8,4 mil millones) publicado por el usuario sergolsub como una conversión a formato MLX con cuantización de 8 bits del modelo original `vllm-sr/d3-flash`. No se trata de un modelo de propósito general al uso, sino de un modelo orientado a la toma de decisiones estructuradas: clasificación binaria, elección entre categorías y puntuación sobre criterios definidos. Su arquitectura aparece etiquetada como `qwen3_5` en los metadatos de Hugging Face y utiliza código personalizado (`custom_code`), lo que implica que requiere el cargador incluido en el repositorio (`d3_mlx.py`) para funcionar.

La relevancia de esta publicación reside en su enfoque de despliegue local en Apple Silicon: el autor documenta métricas de rendimiento medidas en un Mac mini M4 Pro con 48 GB de memoria unificada, con un consumo máximo de RSS en torno a 10 GB y latencias de 1,3 a 2,3 segundos según la tarea. Además, incluye una auditoría de cuantización poco habitual, con KL por tensor y comparativa de calidad entre las versiones bf16, 8 bits y 4 bits sobre un conjunto de evaluación propio.

El modelo conserva la licencia Apache 2.0 del repositorio upstream y está pensado para integrarse en flujos de triaje, enrutado y clasificación automatizada, más que para generación de texto libre. La información pública disponible no detalla la composición del dataset de entrenamiento ni los idiomas soportados, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con arquitectura etiquetada como `qwen3_5` y cabezas de decisión personalizadas (`custom_code`); incluye capas de atención lineal (`linear_attn`) según la auditoría de pesos |
| Parametros totales | 8.392.695.024 |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits (esta conversión MLX); el autor publica también una variante de 4 bits en otro repositorio |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo upstream `vllm-sr/d3-flash`) |
| Formato de pesos | Safetensors en layout MLX (4 shards) más `readout.safetensors`; incluye `config.json`, tokenizer, `chat_template.jinja`, `d3_mlx.py`, `decision_config.json` y `joint_config.json` |

## Arquitectura y entrenamiento

La información disponible indica que el modelo original es `vllm-sr/d3-flash` y que esta publicación es únicamente una conversión a 8 bits para MLX, sin reentrenamiento ni cambios de arquitectura. Los metadatos etiquetan la arquitectura como `qwen3_5`, y la auditoría de pesos por tensor menciona capas de atención lineal (`language_model.layers.0.linear_attn.in_proj_a.weight`), lo que sugiere una combinación de atención estándar y atención lineal. No se dispone de detalles sobre el número de capas, dimensión oculta, cabezas de atención ni configuración del tokenizador más allá de los ficheros incluidos.

El modelo incorpora un modo de decisión con cabezas específicas (`readout.safetensors`, `decision_config.json`, `joint_config.json`) que permiten emitir probabilidades sobre tareas de tipo `noul` (clasificación binaria), `choice` (elección entre criterios) y `score` (puntuación sobre una escala de criterios). No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones de decodificación especulativa ni técnicas de atención destacables más allá de la mencionada atención lineal.

## Capacidades

- Toma de decisiones estructuradas: clasificación binaria (`noul`), elección entre categorías (`choice`) y puntuación sobre criterios (`score`), con salida de probabilidades por clase.
- Procesamiento de texto: el autor reporta evaluaciones sobre entradas de texto de 512 tokens (479 tokens reales) con latencias de aproximadamente 1,3 segundos.
- Procesamiento de imagen: soporta entradas de imagen de 512x512 combinadas con texto, con latencias de aproximadamente 2,3 segundos. La detección de cajas delimitadoras (box) no está soportada según la model card.
- Integración con MLX: cargador propio (`d3_mlx.py`) para ejecución en Apple Silicon mediante `mlx_lm`.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar una incidencia entrante como «requiere reembolso» o no mediante la tarea `noul`, tal como muestra el ejemplo de la model card con el pedido #4411. Es adecuado por su latencia baja (en torno a 1,3 s en M4 Pro) y su salida probabilística, que permite fijar umbrales de derivación.
- Enrutado a equipos: con la tarea `choice`, se puede decidir si un ticket debe ir al equipo de facturación o al de envíos, usando criterios definidos en la propia llamada. Encaja en pipelines de atención al cliente donde la clasificación debe ser explicable y configurable por criterios.
- Priorización de incidencias: con la tarea `score` sobre una escala como `["cosmetic", "annoying", "blocks"]`, el modelo puntúa la severidad de un error (por ejemplo, «disk quota exceeded on the worker») y permite ordenar la cola de trabajo.
- Clasificación de imágenes en flujos de moderación o inspección: al aceptar imagen 512x512 más texto, puede usarse para decidir si una captura o foto cumple un criterio binario, con un coste de aproximadamente 2,3 s por consulta en el hardware medido.
- Despliegue local en estaciones de trabajo Apple Silicon: gracias a su formato MLX y a un consumo máximo de RSS de unos 10 GB, es viable en un Mac mini M4 Pro de 48 GB para tareas de clasificación internas sin depender de la nube.
- Evaluación de calidad de cuantización en pipelines propios: el repositorio incluye scripts de auditoría KL (`kl_weight_audit.py`, `output_kl.py`) y resultados por tensor, lo que permite replicar la metodología para validar otras conversiones cuantizadas.
- Filtrado previo en sistemas RAG o de moderación: usar la salida probabilística de `noul` como señal de confianza para decidir si un contenido pasa a un modelo mayor o se descarta, reduciendo coste computacional.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a su propio conjunto de evaluación, no a benchmarks estándar como MMLU o HumanEval. Se presentan a continuación tal cual, comparando la versión original bf16 con las conversiones de 8 y 4 bits.

| Version | Accuracy | noul | choice | score | PPL | KL de salida vs original | Disco | Latencia mediana |
|---|---|---|---|---|---|---|---|---|
| original (bf16) | 90,0 % | 92,5 % | 88,0 % | 88,0 % | 1,850 | referencia | 16,79 GB | 634 ms |
| 8 bits (esta ficha) | 90,0 % | 92,5 % | 88,0 % | 88,0 % | 1,843 | 2,96e-04 | 9,35 GB | 646 ms |
| 4 bits | 86,7 % | 85,0 % | 88,0 % | 88,0 % | 1,899 | 2,14e-02 | 5,38 GB | 604 ms |

Mediciones de la versión de 8 bits en Mac mini M4 Pro de 48 GB: carga en 4,41 s, RSS máximo de 9,96 GB en reposo; texto de 512 tokens con latencias de 1.317 ms (binary), 1.417 ms (multichoice) y 1.316 ms (score); imagen 512x512 más texto con 2.279 ms, 2.290 ms y 2.276 ms respectivamente. Índice de decisión (Decision Index 0.4.1): 54,21.

Auditoría de pesos: 759 tensores comparados, KL medio 2,17e-04, KL máximo 5,49e-03, 249 tensores con KL distinto de cero. La peor capa es `language_model.layers.0.linear_attn.in_proj_a.weight` con KL 5,49e-03.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 10 GB de RSS máximo para la versión de 8 bits según medición del autor; el tamaño en disco es de 9,35 GB.
- Hardware medido: Mac mini M4 Pro con 48 GB de memoria unificada.
- Cabe en GPU de consumo: no hay datos para GPUs NVIDIA; el formato es MLX, orientado a Apple Silicon. Para GPUs convencionales habría que convertir los pesos, lo cual no está documentado.
- Opciones de despliegue: `mlx_lm` en Apple Silicon mediante el cargador `d3_mlx.py` incluido en el repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia mediana de 646 ms en el conjunto de evaluación; 1,3-1,4 s para texto de 512 tokens y 2,3 s para imagen 512x512 más texto en el hardware medido. El throughput no se publica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| sergolsub/mlx-d3-flash-9B (esta ficha) | 8,39 B | No disponible | Safetensors MLX 8 bits | Apache 2.0 | Modelo de decisión con cabezas específicas; 90,0 % de accuracy en eval propio |
| sergolsub/d3-flash-9B-MLX-4bit | 8,39 B (aprox.) | No disponible | Safetensors MLX 4 bits | Apache 2.0 | 86,7 % de accuracy; 5,38 GB en disco; misma familia |
| vllm-sr/d3-flash (upstream) | 8,39 B (aprox.) | No disponible | bf16 | Apache 2.0 | Referencia original; 16,79 GB en disco; 90,0 % de accuracy |

No se dispone de información sobre otros modelos comparables de la misma categoría (clasificación estructurada con cabezas de decisión) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo especializado en decisiones estructuradas: no está pensado para generación de texto libre ni para tareas generativas generales; su uso fuera del modo `decide` no está documentado.
- Requiere código personalizado: la carga depende de `d3_mlx.py` y de los ficheros `decision_config.json` y `joint_config.json`; no es un modelo estándar de `transformers`.
- Formato exclusivo MLX: no hay pesos GGUF ni safetensors estándar para GPUs NVIDIA, lo que limita el despliegue fuera de Apple Silicon.
- La detección de cajas delimitadoras (box) no está soportada según la model card.
- Idiomas soportados no documentados: riesgo de comportamiento degradado en idiomas distintos del inglés, que es el usado en los ejemplos.
- Riesgo de alucinación: no evaluado en la información disponible; al tratarse de un clasificador con salida probabilística, conviene calibrar umbrales antes de producción.
- Sesgos: no documentados.
- Longitud de contexto no publicada: no se puede garantizar el comportamiento con entradas largas.
- Licencia Apache 2.0 permite uso comercial, pero el autor indica que prevalece la licencia del repositorio upstream en caso de conflicto; conviene revisar `vllm-sr/d3-flash` antes de desplegar.
- Las métricas de calidad proceden de un conjunto de evaluación propio del autor (100 filas en el cálculo de KL), no de benchmarks independientes; deben interpretarse con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/mlx-d3-flash-9B
- Modelo upstream: https://huggingface.co/vllm-sr/d3-flash
- Versión de 4 bits: https://huggingface.co/sergolsub/d3-flash-9B-MLX-4bit

# PatrickBLB/smollm3-3b-fpl-query

## Resumen

SmolLM3-3B FPL Query es un adaptador LoRA entrenado por PatrickBLB sobre HuggingFaceTB/SmolLM3-3B, un modelo de lenguaje de 3 mil millones de parametros. El adaptador especializa el modelo base en una tarea muy concreta: convertir preguntas en lenguaje natural sobre Fantasy Premier League (FPL) en una llamada estructurada a una herramienta `run_query`, emitida en el formato nativo `<tool_call>` de SmolLM3. Si la pregunta no puede resolverse con esa herramienta, el modelo responde con una negativa breve en texto plano.

El problema que resuelve es el de servir como front-end de busqueda en lenguaje natural sobre datos de jugadores de FPL: el usuario pregunta en ingles ("mediocampistas premium de 8.0m o mas ordenados por xGI") y el modelo genera la consulta estructurada que un ejecutor externo debe procesar contra una tabla de jugadores. Es relevante como ejemplo practico de un modelo pequeño y local afinado para tool-calling en un esquema fijo, entrenado con QLoRA en Apple Silicon con mlx-lm.

El adaptador se entreno sobre una cuantizacion a 4 bits del modelo base y reporta un 95,7% de exact match en el conjunto de test, frente al 19,7% del modelo base sin ajustar en bf16. Los pesos del adaptador estan en formato MLX (adapters.safetensors), por lo que solo se carga con mlx-lm en Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (SmolLM3-3B) |
| Parametros totales | 3B (modelo base) + adaptador (tamano del adaptador no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador (la del modelo base SmolLM3-3B es de 128k, no confirmada aqui) |
| Tipos de cuantizacion | Base cuantizado a 4 bits (MLX, group size 64, affine); adaptador QLoRA |
| Idiomas soportados | Ingles (solo FPL, por diseno) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX adapter format (adapters.safetensors + adapter_config.json); no es un adaptador PEFT |

## Arquitectura y entrenamiento

El modelo subyacente es SmolLM3-3B de Hugging Face, un transformer decoder de 3 mil millones de parametros con soporte nativo de tool-calling mediante el formato `<tool_call>`. Sobre el se aplica un adaptador LoRA/QLoRA entrenado con mlx-lm sobre una cuantizacion a 4 bits del modelo base (4 bits, group size 64, cuantizacion affine), en un Mac Apple Silicon (M5, 16 GB de memoria unificada). El resultado no es un modelo fusionado: el adaptador se carga junto al base cuantizado mediante el parametro `adapter_path` de mlx-lm.

Los datos de entrenamiento son preguntas sinteticas en ingles sobre FPL, generadas por un modelo profesor (`minimaxai/minimax-m3.1-flash`), con sus consultas objetivo correspondientes. Todos los datos provienen de una instantanea de la temporada 2026-27 de FPL (fecha 2026-10-24, con la jornada 8 disputada y la 9 siguiente). No se ha publicado informacion sobre el numero de tokens de entrenamiento ni sobre el uso de RLHF/DPO.

## Capacidades

- Generacion de consultas estructuradas `run_query` a partir de preguntas en lenguaje natural sobre FPL, en el formato `<tool_call>` nativo de SmolLM3.
- Tool calling con un unico esquema fijo: filtros de posicion (GKP, DEF, MID, FWD), equipo, precio, forma, puntos totales, minutos, xGI, propiedad (%), dificultad de calendario (ventana de 3 o 5 jornadas), orden y limite (1-20).
- Rechazo controlado: si la pregunta no es respondible con `run_query` (predicciones, noticias, opiniones, temporadas pasadas), responde con una negativa breve sin emitir llamada a herramienta.
- Generacion de texto general heredada del modelo base, aunque el afinado esta orientado exclusivamente a esta tarea.
- Uso del modo `/no_think` en el system prompt para desactivar el razonamiento extendido de SmolLM3.
- Sin capacidades de vision, audio ni razonamiento multi-step mas alla de la emision de una unica llamada a herramienta.

## Casos de uso

- Front-end de busqueda en lenguaje natural para datos de FPL: el modelo traduce la pregunta del usuario a una consulta `run_query` que tu propio ejecutor procesa contra una tabla de jugadores; adecuado porque alcanza un 95,7% de exact match en el esquema entrenado.
- Asistente local de Fantasy Premier League: al ser un modelo de 3B cuantizado a 4 bits, funciona en un Mac Apple Silicon con 16 GB, sin depender de APIs externas.
- Prototipo de investigacion en tool-calling especializado: util como referencia para estudiar como un LoRA pequeno especializa un modelo base en un esquema de herramientas unico.
- Proyecto hobby de analisis de plantilla: consultas como "defensas de menos de 5.0m con mejor forma" se convierten automaticamente en filtros estructurados.
- Base para pipelines de text-to-query: demuestra el patron de generar una consulta (no la respuesta), delegando la ejecucion al sistema externo, lo que permite validar y sanear la consulta antes de ejecutarla.
- Ejemplo de entrenamiento QLoRA en hardware de consumo: el flujo completo (cuantizacion, entrenamiento y evaluacion) se realizo en un portatil Apple Silicon, replicable sin GPU de datacenter.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (exact match sobre el split de test reservado):

| Modelo | Exact match (test) |
|---|---|
| SmolLM3-3B + adaptador FPL (este modelo) | 95,7% |
| SmolLM3-3B base bf16 sin ajustar | 19,7% |

Resultados parciales por categoria tambien publicados:

| Categoria | Exact match |
|---|---|
| fixture_play (test) | 85,7% |
| fixture_play (val) | 80,0% |
| estilo slang (test) | 92,1% |
| trending (val) | 90,3% |

No se han publicado resultados en benchmarks genericos (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- VRAM/memoria estimada: el modelo base de 3B cuantizado a 4 bits mas el adaptador cabe en 16 GB de memoria unificada; el entrenamiento QLoRA completo se realizo en un Mac M5 con 16 GB.
- GPU recomendadas: no requiere GPU NVIDIA; esta pensado para Apple Silicon (M1 o superior) con mlx-lm. No disponible informacion sobre rendimiento en CUDA.
- Consumer hardware: si, disenado y entrenado en un portatil Apple Silicon de gama media; no cabe informacion sobre requisitos exactos en GPU de consumo NVIDIA.
- Despliegue: unicamente con mlx-lm (carga del base cuantizado a 4 bits + `adapter_path`). Para usarlo con transformers o PEFT hay que fusionarlo con `mlx_lm fuse` y convertirlo. No hay soporte directo de vLLM, TGI ni Ollama para el adaptador en formato MLX.
- Latencia y throughput: no disponible. La generacion es greedy con `max_tokens=256`, lo que implica respuestas muy cortas y rapidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| PatrickBLB/smollm3-3b-fpl-query | Adaptador LoRA (MLX) | 3B (base) + LoRA | Apache 2.0 | MLX adapters.safetensors | Text-to-query FPL, tool calling |
| HuggingFaceTB/SmolLM3-3B | Modelo base | 3B | Apache 2.0 | safetensors | General, tool calling nativo |
| Adaptadores LoRA genericos de SmolLM3 en MLX | Adaptadores LoRA | 3B (base) | Varia | MLX adapters.safetensors | Variada |

Comparativa basada en la informacion disponible; el propio modelo base es la alternativa mas directa, con un 19,7% de exact match frente al 95,7% del adaptador en la tarea FPL. No se conocen otros adaptadores comparables para este dominio.

## Limitaciones y advertencias

- El modelo emite una consulta, no una respuesta: hay que implementar un ejecutor externo que procese el `run_query` contra los datos.
- Esquema fijo: solo conoce los campos de `run_query` definidos en el entrenamiento; anyadir o renombrar campos exige reentrenar.
- Datos congelados en el tiempo: todo el entrenamiento procede de una instantanea del 2026-10-24 (jornada 8); umbrales y codigos de equipo reflejan esa temporada y el modelo no tiene acceso a datos en vivo.
- Solo ingles y solo FPL: cualquier otra pregunta recibe una negativa por diseno.
- Categorias debiles: las preguntas de dificultad de calendario (fixture_play) son las que peor rinden (85,7% en test, 80,0% en validacion); el estilo coloquial (slang) es el mas fragil en formulacion (92,1%).
- Preguntas sinteticas: el conjunto de entrenamiento fue generado por un LLM profesor, por lo que no cubre todas las formulaciones reales de los usuarios; el uso de esos datos esta sujeto a los terminos de `minimaxai/minimax-m3.1-flash`.
- Compatibilidad limitada: el adaptador solo carga con mlx-lm en Apple Silicon; su uso con transformers/PEFT requiere fusion y conversion previa.
- Riesgo de alucinacion: no cuantificado en la model card; en la tarea especializada el exact match del 95,7% implica un 4,3% de consultas incorrectas que pueden fallar silenciosamente si no se validan.
- Licencia Apache 2.0: sin restricciones para uso comercial del adaptador; verificar igualmente los terminos del modelo base y del modelo profesor usado para los datos.

## Enlaces

- Modelo (adaptador): https://huggingface.co/PatrickBLB/smollm3-3b-fpl-query
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- mlx-lm (libreria de entrenamiento e inferencia): https://github.com/ml-explore/mlx-lm

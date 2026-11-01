# greg1506/qwen3-8b-coffee-v10-GGUF

## Resumen

`greg1506/qwen3-8b-coffee-v10-GGUF` es la distribucion cuantizada en formato GGUF del modelo `greg1506/qwen3-8b-coffee-v10`, un ajuste fino de Qwen3-8B especializado en el dominio del cafe. Lo desarrolla el usuario independiente greg1506 y esta pensado para su uso con llama.cpp, lo que permite ejecutarlo en CPU o en GPU de consumo. El repositorio contiene una unica cuantizacion Q4_K_M de 4,7 GB, derivada de una fusion bf16 de 16 GB.

El modelo parte de la arquitectura Qwen3-8B (transformer denso, 8.190.735.360 parametros) y se ha adaptado al dominio mediante un flujo de continued-pretraining sobre un corpus tematico de cafe (109 millones de tokens ponderados), seguido de LoRA mid-train, SFT sintetico y anadidos de QA minados con LLM. El resultado es un asistente factico y de aritmetica de preparacion de cafe en ingles, no un asistente general.

Es relevante ahora por dos motivos: demuestra un pipeline completo de especializacion de dominio sobre un modelo abierto con licencia Apache 2.0, y publica una evaluacion propia (CoffeeBench v6, 336 items held-out) que cuantifica la perdida de precision al pasar de bf16 a Q4_K_M, algo poco habitual en fichas de cuantizaciones. Esa transparencia permite decidir con datos si la cuantizacion es aceptable para cada caso de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unica publicada en este repo) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en bf16 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-8B, un transformer denso de 8.190 millones de parametros. Sobre esa base se aplico un proceso de adaptacion de dominio en varias fases: primero un continued-pretraining sobre el flujo de tokens de `greg1506/coffee-corpus-v2` (109 millones de tokens ponderados hacia el dominio del cafe), despues un mid-train con LoRA, a continuacion un SFT con datos sinteticos y finalmente anadidos de QA minados con LLM. La version v10 es la "release of record" de esa linea.

La cuantizacion se genero con el flujo estandar de llama.cpp: `convert_hf_to_gguf.py` seguido de `llama-quantize` con el metodo q4_k_m, ejecutado en CPU. El autor documenta que la fusion bf16 ocupa 16 GB frente a los 4,7 GB del Q4_K_M. No se detallan en la informacion disponible innovaciones arquitectonicas propias (atencion lineal, decodificacion especulativa u otras); las capacidades de razonamiento provienen del Qwen3-8B original.

Un detalle tecnico relevante es que la conversion GGUF conserva la plantilla de chat con formato de "thinking", de modo que las completaciones crudas de `llama-server` o `llama-cli` comienzan con un bloque `<think>...</think>` vacio renderizado como texto literal. El autor recomienda eliminar ese preambulo, pasar una plantilla sin thinking con `--chat-template` o filtrarlo en tiempo de decodificacion.

## Capacidades

- Generacion de texto en ingles centrada en conocimiento factico sobre cafe: mapas de tueste, estandares de calidad, mapas de metodos de preparacion y conocimiento historico del sector.
- Aritmetica de preparacion de cafe: ratios cafe/bebida, calculo de masa de solidos y rendimiento de extraccion, con fiabilidad desigual segun la familia de tarea.
- Respuesta conversacional multi-turno con formato de chat ChatML (`<|im_start|>system`, `<|im_start|>user`, `<|im_start|>assistant`).
- Plantilla de chat con modo thinking heredada de Qwen3 (bloque `<think>`), aunque el autor documenta que conviene desactivarla o limpiarla.
- No se documenta soporte de tool calling ni function calling en la informacion proporcionada.
- No se documenta soporte de agentes ni razonamiento multi-paso en la informacion proporcionada.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma del repositorio.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Asistente de consulta factica para baristas: responde preguntas sobre mapas de tueste, estandares de calidad y metodos de preparacion con alta fiabilidad en esas familias (exact match 1,00 en roast-map, quality-standards y legacy-core).
- Calculo de ratios de preparacion en recetas: convierte dosis de cafe y peso de bebida en ratio cafe/bebida (ratio-forward con exact match 0,89 en Q4_K_M), util para fichas de receta y ajustes de molienda.
- Formacion interna en cafeterias: genera explicaciones concisas sobre especies, origenes y procesados (species-origin 0,80, processing-map 0,44), adecuado como material de apoyo siempre que se revise el contenido.
- Demo interactiva en Colab: el repositorio incluye `colab_demo.ipynb` con un flujo de cuatro pasos (instalar llama-cpp-python, descargar el GGUF, cargar y muestrear QA) y una celda final que lanza una interfaz Gradio con enlace publico `...gradio.live`, util para validar el modelo con stakeholders sin infraestructura propia.
- Prototipado en CPU: con unos 5 tok/s en runtime de CPU y mejor rendimiento en una T4 gratuita, sirve para pruebas de concepto de asistentes de dominio sin GPU dedicada.
- Clasificacion y definicion de terminos del sector: el modelo cubre familias de definition (0,67) y classification (0,67), aprovechables para etiquetado asistido de catalogos de cafe con revision humana.
- Base para experimentos de adaptacion de dominio: al ser Apache 2.0 y estar disponible el pipeline completo (corpus, LoRA, SFT, QA minado), sirve como referencia metodologica para especializar otros dominios sobre Qwen3-8B.

## Benchmarks y rendimiento

Evaluacion del autor en CoffeeBench v6 (336 items held-out):

| Metrica | bf16 merge | Q4_K_M (este repo) |
|---|---|---|
| Raw exact match | 0,753 | 0,688 |
| Soft-EM (robusto a estilo) | 0,789 | 0,720 |
| Token F1 | 0,814 | 0,770 |

Desglose por familia de este cuantizado (raw EM): roast-map 1,00; quality-standards 1,00; legacy-core 1,00; ratio-forward 0,89; species-origin 0,80; milk-drinks 0,75; method-map 0,75; ey-inverse 0,71; definition 0,67; classification 0,67; ratio-inverse 0,67; ey-forward 0,54; solids-mass 0,53; processing-map 0,44; calculation 0,00.

El autor senala que Q4_K_M iguala a la fusion bf16 en las familias de conocimiento y estilo, pero pierde unos 6 puntos en las familias de aritmetica decimal (solids-mass de 0,93 a 0,53; ratio-inverse de 0,85 a 0,67; ratio-forward de 0,98 a 0,89). No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 4,7 GB de pesos en Q4_K_M; con overhead de contexto y cache KV, el consumo real sera superior y depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: el autor menciona que una T4 gratuita ejecuta el modelo mas rapido que CPU; por tamano, cabe holgadamente en RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, en cualquier GPU con 8 GB o mas de VRAM en Q4_K_M, con margen para contexto moderado.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), llama-cpp-python (usado en el notebook de Colab) y, por compatibilidad de formato GGUF, otras herramientas basadas en llama.cpp. No se documenta compatibilidad con vLLM ni TGI en la informacion disponible.
- Latencia y throughput: aproximadamente 5 tok/s en runtime de CPU segun el autor; en T4 el rendimiento es mayor pero no se publica cifra concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen3-8b-coffee-v10-GGUF (Q4_K_M) | 8,19 B | no disponible | Apache 2.0 | GGUF | Especializado en cafe, solo ingles, evaluacion propia CoffeeBench v6 |
| greg1506/qwen3-8b-coffee-v10 (bf16) | 8,19 B | no disponible | Apache 2.0 | safetensors (bf16) | Mismo modelo sin cuantizar; 16 GB; mejor aritmetica decimal (solids-mass 0,93 frente a 0,53) |
| Qwen3-8B (modelo base) | 8,19 B | no disponible en la informacion proporcionada | Apache 2.0 | safetensors, GGUF | Asistente general multilingue; no especializado en cafe; referencia de capacidades generales |

No se dispone de datos de benchmarks comparativos frente a otros ajustes finos de dominio del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- La aritmetica de rendimiento de extraccion es poco fiable y empeora con Q4_K_M; la familia calculation obtiene exact match 0,00 y solids-mass cae a 0,53. El autor recomienda verificar de forma independiente cualquier respuesta numerica de dosis o extraccion.
- El conocimiento esta acotado al corpus (`coffee-corpus-v2`): el modelo no es un asistente general y no debe usarse fuera del dominio del cafe.
- Solo soporta ingles segun la etiqueta de idioma del repositorio; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion en preguntas fuera del corpus o en calculos encadenados; el propio autor lo califica como "not a source of record".
- La plantilla de chat conserva el formato thinking, lo que puede introducir texto literal `<think>...</think>` en las respuestas si no se limpia o se sustituye la plantilla.
- No se documentan sesgos especificos, pero al derivar de Qwen3-8B puede heredar los sesgos del modelo base y del corpus de ajuste.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero la responsabilidad sobre la exactitud de las respuestas recae en el integrador.
- Repositorio con 78 descargas y 0 likes, creado y actualizado el mismo dia: madurez y mantenimiento no verificados.
- No hay demo alojada de forma permanente; el notebook de Colab requiere ejecucion manual y el enlace Gradio solo vive mientras dure la sesion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/greg1506/qwen3-8b-coffee-v10-GGUF
- Modelo base bf16: https://huggingface.co/greg1506/qwen3-8b-coffee-v10
- Dataset de entrenamiento: https://huggingface.co/datasets/greg1506/coffee-corpus-v2
- Notebook de demo en Colab: https://huggingface.co/greg1506/qwen3-8b-coffee-v10-GGUF/blob/main/colab_demo.ipynb

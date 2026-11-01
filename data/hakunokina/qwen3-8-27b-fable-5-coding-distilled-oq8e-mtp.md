# hakunokina/Qwen3.8-27B-Fable-5-Coding-Distilled-oQ8e-mtp

## Resumen

Qwen3.8-27B-Fable-5-Coding-Distilled-oQ8e-mtp es una cuantización de 8 bits en formato MLX del modelo khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled, un ajuste fino orientado a código y depuración sobre el Qwen3.8-27B del equipo Qwen. Lo publica el usuario hakunokina y su propósito es hacer viable en Apple Silicon un modelo denso de 27.781 millones de parámetros que en BF16 ocupa unos 54 GB, reduciéndolo a aproximadamente 28 GB sin pérdida apreciable de calidad (KL media de 0,0012 nat/token frente al original y 98,5 % de coincidencia en el token top-1).

La arquitectura subyacente es la familia Qwen3.5: transformer híbrido de 64 capas que combina Gated DeltaNet con capas de atención completa, con una ventana de contexto de 262.144 tokens. El ajuste fino del que deriva se entrenó sobre 195 millones de tokens de trazas destiladas de depuración, lo que lo orienta a coding agéntico y uso de herramientas. Esta build conserva la cabeza MTP (multi-token prediction) del modelo fuente, lo que permite decodificación especulativa en oMLX.

Su relevancia es práctica: hasta esta publicación no existía una build MLX/oQ de este fine-tune, y la cuantización oQ8e calibrada con imatrix sobre un conjunto de código y multilingüe permite ejecutar el modelo en un Mac Studio con memoria unificada, sirviendo además APIs compatibles con OpenAI y Anthropic. La licencia es Apache-2.0, heredada del modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (Gated DeltaNet + atención completa), familia Qwen3.5, 64 capas |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | oQ8e (8 bits afín, grupo 64, calibrado con imatrix); disponibles oQ6e (~22 GB) y oQ4e (~16 GB) |
| Idiomas soportados | No disponible (la calibración cubre código, inglés y turco; el modelo fuente no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), cuantización oQ de oMLX |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de 64 capas que intercala capas de Gated DeltaNet (atención lineal con estado recurrente) con un subconjunto de capas de atención completa; según la model card, solo 16 capas son de atención completa, lo que reduce el coste del KV cache. Sobre esa base, khazarai aplicó un ajuste fino de destilación orientado a código y depuración con 195 millones de tokens de trazas, según el dataset DSFFGFG456/fable-5-coding-and-debugging-traces. No se detalla en la información disponible si hubo RLHF, DPO u otras fases de alineamiento posteriores.

Esta build concreta no reentrena nada: cuantiza el checkpoint BF16 con oMLX oQ8e, una cuantización afín de 8 bits con grupo de 64 calibrada mediante imatrix sobre el conjunto de código y multilingüe de oMLX. Se preserva la cabeza MTP del modelo fuente para decodificación especulativa y se mantiene el codificador de visión (la entrada de imagen no se probó en esta build). El resultado son ~28 GB de pesos frente a los ~54 GB del BF16.

## Capacidades

- Generación de texto y razonamiento general sobre un modelo denso de 27,78 B.
- Generación y depuración de código, con especialización explícita en coding agéntico derivada del ajuste fino.
- Tool calling / function calling: la model card reporta 5/5 aciertos tanto en el endpoint Anthropic `/v1/messages` como en el OpenAI `/v1/chat/completions`.
- Razonamiento multi-paso y flujos agénticos, apoyados por la ventana de 262k tokens.
- Decodificación especulativa mediante la cabeza MTP conservada.
- Entrada de imagen declarada por el pipeline `image-text-to-text` y el codificador de visión conservado, aunque no verificada en esta build.
- Capacidades multilingües: no disponible la lista oficial; la evaluación de divergencia incluyó código, prosa en inglés y turco.

## Casos de uso

- Asistente de depuración en local: el ajuste fino se entrenó sobre trazas de depuración, por lo que puede analizar stack traces, reproducir fallos y proponer parches dentro de un contexto de 262k tokens que admite volcar varios ficheros y logs completos.
- Agente de código en el IDE o CLI: con tool calling verificado en las APIs de OpenAI y Anthropic, encaja en orquestadores que invocan herramientas (lectura de ficheros, ejecución de tests, git) en bucles multi-paso.
- Automatización de revisión de código: la ventana larga permite pasar un diff completo más el contexto del repositorio y obtener comentarios fundamentados, ejecutable en un único Mac Studio sin GPU dedicada.
- Servidor de inferencia personal en Apple Silicon: oMLX lo expone en `/v1/chat/completions` y `/v1/messages`, de modo que herramientas existentes (clientes OpenAI, SDK de Anthropic) apuntan a `localhost:8000` sin cambios de código.
- Prototipado de pipelines agénticos con presupuesto cero de GPU: al correr sobre memoria unificada, permite iterar sobre prompts y herramientas antes de escalar a infraestructura CUDA.
- Procesamiento de documentación técnica extensa: con 262k de contexto y caché de prefijo (segundo prefill de ~29k tokens en ~1,39 s), es adecuado para consultas repetidas sobre el mismo corpus de manuales o especificaciones.
- Generación de tests y parches en CI: integrable como paso de un pipeline que, ante un fallo, genera un test de reproducción y un parche candidato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ejecutó ninguna suite de benchmarks sobre esta build y que la calidad se reporta como divergencia respecto al modelo fuente.

| Métrica (frente a BF16) | Valor |
|---|---|
| KL media (BF16 ‖ oQ8e) | 0,0012 nat/token |
| KL mediana / p99 | 0,00052 / 0,012 |
| Coincidencia token top-1 | 98,5 % |
| Perplejidad BF16 → oQ8e | 6,078 → 6,081 |

| Rendimiento (Mac Studio M3 Ultra, 512 GB, oMLX 0.7.1) | Valor |
|---|---|
| Prefill, prompt de ~29k tokens (en frío) | ~75 s (~380 tok/s) |
| Mismo prefijo con caché de prefijo | ~1,39 s |
| Decodificación con MTP especulativo | ~39 tok/s |
| Tool calling Anthropic / OpenAI (5 ejecuciones) | 5/5 / 5/5 |

## Requisitos de hardware

- VRAM/memoria: ~28 GB de pesos para oQ8e, más KV cache de ~64 KB por token en las 16 capas de atención completa, lo que supone ~16 GB a 262k tokens de contexto. Presupuesto total práctico: ~30 GB con contexto corto, ~44 GB a contexto máximo.
- Alternativas de tamaño: oQ6e ~22 GB y oQ4e ~16 GB, publicadas por el mismo autor.
- GPU recomendadas: el formato es MLX, por lo que el destino es Apple Silicon con memoria unificada; se midió en un Mac Studio M3 Ultra de 512 GB. No está pensado para A100, H100 ni RTX 4090, que no ejecutan MLX.
- Cabe en GPU de consumo: no en el sentido habitual (CUDA); en Apple Silicon requiere un equipo con al menos ~32 GB de memoria unificada para contexto corto y ~48-64 GB para aprovechar contextos largos.
- Despliegue: requiere oMLX ≥ 0.7.1. No se ha probado con `mlx-lm` estándar ni con LM Studio. Sirve APIs compatibles con OpenAI y Anthropic en el puerto 8000.
- Latencia y throughput: ~380 tok/s de prefill en frío y ~39 tok/s de decodificación con MTP en el hardware citado; mediciones de una sola ejecución, variables según longitud de contexto y contenido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (oQ8e-mtp) | 27,78 B densos | 262.144 | MLX / oMLX ≥ 0.7.1 | Apache-2.0 | ~28 GB, MTP conservado, sin benchmarks |
| khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled (BF16) | 27,78 B densos | 262.144 | safetensors / ecosistema estándar | Apache-2.0 (según upstream, por confirmar) | ~54 GB, referencia de calidad |
| hakunokina/...-oQ6e-mtp | 27,78 B densos | 262.144 | MLX / oMLX | Apache-2.0 | ~22 GB, mayor compresión |
| hakunokina/...-oQ4e-mtp | 27,78 B densos | 262.144 | MLX / oMLX | Apache-2.0 | ~16 GB, mayor compresión |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de otros fabricantes; la información proporcionada solo cubre variantes del mismo modelo.

## Limitaciones y advertencias

- No se ha ejecutado ninguna suite de benchmarks sobre esta build; la calidad solo está caracterizada como divergencia respecto al BF16, no en tareas downstream.
- La entrada de imagen no se probó en esta build pese a conservarse el codificador de visión; no debe asumirse que funcione.
- La model card del modelo fuente marca su licencia y detalles de entrenamiento como pendientes de confirmar; conviene verificar el repositorio original antes de un uso comercial, aunque aquí figure Apache-2.0.
- Dependencia estricta de oMLX ≥ 0.7.1: no funciona con `mlx-lm` estándar ni con LM Studio, lo que limita la portabilidad.
- Riesgo de alucinación inherente a un modelo de 27 B sin benchmarks publicados; en tareas de código conviene validar con tests automatizados.
- Sesgos: no disponibles; el ajuste fino se entrenó sobre trazas de depuración y la calibración cubrió código, inglés y turco, por lo que el comportamiento en otros idiomas, incluido el español, no está caracterizado.
- El KV cache crece de forma significativa con el contexto (~16 GB a 262k), lo que puede agotar la memoria de equipos con menos de 48 GB.
- Las cifras de velocidad provienen de una sola ejecución en un M3 Ultra de 512 GB; no son extrapolables a otros equipos.
- El repositorio tiene 85 descargas y 0 likes en el momento de la consulta, con validación comunitaria escasa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hakunokina/Qwen3.8-27B-Fable-5-Coding-Distilled-oQ8e-mtp
- Modelo base del ajuste fino: https://huggingface.co/khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante oQ6e: https://huggingface.co/hakunokina/Qwen3.8-27B-Fable-5-Coding-Distilled-oQ6e-mtp
- Variante oQ4e: https://huggingface.co/hakunokina/Qwen3.8-27B-Fable-5-Coding-Distilled-oQ4e-mtp
- oMLX: https://omlx.ai
- Dataset de destilación citado: DSFFGFG456/fable-5-coding-and-debugging-traces (referenciado en la model card; no se proporciona URL directa)

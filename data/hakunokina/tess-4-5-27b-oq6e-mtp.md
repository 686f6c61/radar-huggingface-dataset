# hakunokina/Tess-4.5-27B-oQ6e-mtp

## Resumen

Tess-4.5-27B-oQ6e-mtp es una compilación cuantizada en formato MLX del modelo migtissera/Tess-4.5-27B, un ajuste fino orientado a ingeniería agéntica y uso de herramientas desarrollado por Migel Tissera / Continuity Research sobre la base Qwen3.8-27B del equipo Qwen. La publicación la firma el usuario hakunokina y resuelve un hueco concreto: el lanzamiento original solo ofrecía pesos BF16 y GGUF, sin build nativo para Apple Silicon, de modo que esta versión permite ejecutar el modelo en Mac con aceleración Metal mediante la librería MLX.

El modelo es un transformer denso de 27 781 427 952 parámetros (aproximadamente 27,8 mil millones) con arquitectura de la familia Qwen3.5, que combina capas híbridas Gated DeltaNet con atención completa en un total de 64 capas. Mantiene una longitud de contexto de 262 144 tokens, el codificador de visión del modelo fuente y la cabeza de predicción multi-token (MTP), lo que habilita decodificación especulativa en el runtime oMLX. El pensamiento (thinking) está activado por defecto.

La relevancia actual reside en tres factores: la cuantización oQ6e calibrada con imatrix reduce el peso de aproximadamente 54 GB en BF16 a unos 22 GB con una divergencia muy baja respecto al original (KL media de 0,0038 nat/token y 97,3 % de acuerdo en el token top-1), el soporte de MTP acelera la decodificación en hardware de Apple, y la licencia Apache-2.0 heredada facilita el uso comercial. El modelo está pensado para flujos de trabajo agénticos con llamadas a herramientas y generación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido Gated DeltaNet + atención completa, 64 capas (familia Qwen3.5) |
| Parametros totales | 27 781 427 952 (~27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | oQ6e (6 bits afín, grupo 64, calibrado con imatrix); disponibles también oQ8e (~28 GB) y oQ4e (~16 GB) |
| Idiomas soportados | No disponible (la model card menciona calibración sobre conjunto de código y multilingüe, con evaluación en inglés y turco) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

## Arquitectura y entrenamiento

El modelo fuente es un transformer denso de 27,8 B parámetros con arquitectura híbrida de la familia Qwen3.5: 64 capas que alternan Gated DeltaNet (atención lineal) con capas de atención completa, de las cuales 16 son de atención plena. Esta combinación reduce el coste de memoria del KV cache en contextos largos. Incorpora además una cabeza de predicción multi-token (MTP) que el build conserva para permitir decodificación especulativa, y mantiene el codificador de visión del modelo original, aunque la entrada de imagen no se ha probado en esta compilación.

El ajuste fino lo realizó Migel Tissera / Continuity Research sobre Qwen3.8-27B, orientándolo a ingeniería agéntica, uso de herramientas y código, con el modo de razonamiento activado por defecto. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. La cuantización oQ6e aplicada por oMLX es afín de 6 bits con grupo de 64 y calibración imatrix sobre un conjunto propio de código y contenido multilingüe. El resultado se evaluó por divergencia respecto al BF16: perplejidad de 6,048 a 6,060, KL media de 0,0038 nat/token (mediana 0,0016, p99 0,044) y 97,3 % de coincidencia en el token top-1 sobre 64 secuencias de 512 tokens.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto.
- Generación de código y tareas de ingeniería de software.
- Uso de herramientas (tool calling / function calling), validado con 5/5 ejecuciones correctas tanto en la API Anthropic `/v1/messages` como en la OpenAI `/v1/chat/completions`.
- Flujos agénticos y razonamiento multi-paso, objetivo principal del ajuste fino.
- Entrada de imagen a través del codificador de visión heredado (no probado en este build).
- Decodificación especulativa mediante la cabeza MTP conservada.
- Capacidades multilingües: no disponible el listado oficial; la evaluación de calidad incluye inglés y turco.
- Compatibilidad con las APIs OpenAI y Anthropic a través del runtime oMLX.

## Casos de uso

- Asistencia de programación en local sobre Mac: el modelo genera y revisa código con 262k tokens de contexto, suficiente para cargar repositorios medianos completos en el prompt y razonar sobre ellos sin fragmentar.
- Agentes autónomos de desarrollo: al soportar tool calling validado en las APIs de OpenAI y Anthropic, puede integrarse en bucles de agente que invocan shell, editores o APIs externas de forma fiable.
- Automatización de tareas de refactorización: la ventana de contexto larga y el modo thinking permiten analizar dependencias entre ficheros y proponer cambios coherentes en varios módulos.
- Asistencia técnica con contexto extenso: conversaciones multi-turno con documentación técnica adjunta, aprovechando el prefijo cacheado (segunda pasada en ~1,38 s sobre un prefijo de ~29k tokens en M3 Ultra).
- Prototipado y evaluación de modelos en Apple Silicon: sirve como banco de pruebas para pipelines agénticos antes de desplegar en infraestructura con GPU, gracias a la paridad de API con OpenAI y Anthropic.
- Procesamiento de documentación con imágenes: el codificador de visión permite, en principio, extraer información de capturas o diagramas, aunque esta capacidad no está validada en este build y requeriría pruebas propias.
- Generación de código en pipelines de CI/CD locales: con decodificación a ~46 tok/s en M3 Ultra y MTP activo, es viable para tareas de revisión automática o generación de tests en máquinas de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos sobre este build cuantizado. La model card indica explícitamente que no se ejecutó ninguna suite de benchmarks y que la calidad se reporta como divergencia respecto al modelo fuente. Se recogen a continuación las métricas de fidelidad y velocidad disponibles.

| Metrica | Valor |
|---|---|
| KL(BF16 ‖ oQ6e), media | 0,0038 nat/token |
| KL mediana / p99 | 0,0016 / 0,044 |
| Acuerdo en token top-1 | 97,3 % |
| Perplejidad BF16 → oQ6e | 6,048 → 6,060 |
| BenchLocal (BF16, mejor de tres, reportado por upstream) | 133/150 |
| Prefill, prompt de ~29k tokens (frío) | ~73 s (~390 tok/s) |
| Prefill con caché de prefijo | ~1,38 s |
| Decodificación con MTP | ~46 tok/s |
| Tool calling (Anthropic / OpenAI, 5 ejecuciones) | 5/5 / 5/5 |

Las mediciones de velocidad se realizaron en un Mac Studio M3 Ultra con 512 GB de RAM y oMLX 0.7.1, en ejecuciones únicas; los valores varían con la longitud de contexto y el contenido.

## Requisitos de hardware

- VRAM/RAM unificada: ~22 GB para los pesos oQ6e, más KV cache de ~64 KB por token en las 16 capas de atención completa, lo que supone unos 16 GB adicionales a 262k tokens de contexto.
- Alternativas de tamaño: oQ8e ~28 GB y oQ4e ~16 GB, para equipos con menos memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente; el entorno de referencia es un Mac Studio M3 Ultra de 512 GB. No se han probado GPUs NVIDIA ni AMD con este build.
- Compatibilidad con GPU de consumo: viable en equipos Apple con al menos ~40 GB de memoria unificada para contexto moderado; con oQ4e el umbral baja a ~32 GB.
- Despliegue: requiere oMLX ≥ 0.7.1. No se ha probado con `mlx-lm` estándar ni con LM Studio. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, al ser un formato MLX.
- Latencia y throughput: ~390 tok/s de prefill en frío y ~46 tok/s de decodificación con MTP en M3 Ultra; la caché de prefijo reduce a ~1,38 s la reutilización de un prefijo de ~29k tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Tess-4.5-27B-oQ6e-mtp (este) | ~27,8 B | 262 144 | MLX / oMLX ≥ 0.7.1 | Apache-2.0 | Cuantización 6 bits con MTP; ~22 GB |
| migtissera/Tess-4.5-27B (fuente) | ~27,8 B | 262 144 | BF16 y GGUF | Apache-2.0 | Sin build MLX; ~54 GB en BF16 |
| Qwen/Qwen3.8-27B (base) | ~27,8 B | No disponible en la información | Múltiples | No disponible en la información | Modelo base del ajuste fino |
| Tess-4.5-27B-oQ8e-mtp / oQ4e-mtp | ~27,8 B | 262 144 | MLX / oMLX | Apache-2.0 | Misma familia; ~28 GB y ~16 GB respectivamente |

No se dispone de datos de benchmarks comparativos frente a otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No se han ejecutado benchmarks sobre este build; la calidad solo se ha medido como divergencia respecto al BF16, no como rendimiento en tareas.
- El codificador de visión se conserva pero no se ha probado la entrada de imagen en esta compilación; no debe asumirse su funcionamiento en producción sin validación.
- Dependencia estricta de oMLX ≥ 0.7.1; no hay compatibilidad verificada con `mlx-lm`, LM Studio u otros runtimes MLX.
- El rendimiento de decodificación con MTP depende de la previsibilidad de la salida; en texto muy creativo o poco estructurado la ganancia puede reducirse.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible; en tareas de código y tool calling conviene validar las salidas.
- No se detalla la lista de idiomas soportados ni el comportamiento fuera de inglés, turco y código.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache-2.0 heredada del modelo fuente, que permite uso comercial; conviene verificar las condiciones de los pesos base de Qwen y de la librería oMLX antes de un despliegue comercial.
- El ajuste fino está orientado a agentes y código; su comportamiento en dominios ajenos (por ejemplo, conversación general o tareas creativas) no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hakunokina/Tess-4.5-27B-oQ6e-mtp
- Modelo fuente: https://huggingface.co/migtissera/Tess-4.5-27B
- Versión GGUF del modelo fuente: https://huggingface.co/migtissera/Tess-4.5-27B-GGUF
- Build oQ8e: https://huggingface.co/hakunokina/Tess-4.5-27B-oQ8e-mtp
- Build oQ4e: https://huggingface.co/hakunokina/Tess-4.5-27B-oQ4e-mtp
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- oMLX: https://omlx.ai

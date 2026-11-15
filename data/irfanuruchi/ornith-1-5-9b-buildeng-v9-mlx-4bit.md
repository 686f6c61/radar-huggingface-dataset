# Irfanuruchi/Ornith-1.5-9B-BuildEng-V9-MLX-4bit

## Resumen

Ornith-1.5-9B-BuildEng-V9-MLX-4bit es una distribucion cuantizada en 4 bits para MLX-LM de un ajuste fino sobre el modelo Ornith 1.5 9B, orientada a asistencia conservadora en ingenieria de edificacion y estructural. Lo publica Irfan Uruchi como trabajo independiente: no es una release oficial de Ornith AI. El adaptador LoRA se ha fusionado dentro de los pesos cuantizados, de modo que el repositorio es autonomo y no requiere cargar un adaptador separado.

El modelo resuelve un nicho concreto: respuestas tecnicas prudentes sobre practicas de obra, con especial enfasis en seguridad estructural, en lugar de generacion generalista. La arquitectura subyacente es de la familia Qwen3.5-9B (tag `qwen3_5`), con 8.953.803.264 parametros totales segun los pesos safetensors, y el repositorio ocupa 5,1 GB en Hugging Face (aproximadamente 4,7 GiB en disco segun la model card).

Su relevancia es limitada pero clara: demuestra un flujo completo de ajuste fino con LoRA sobre un modelo de 9B, fusion posterior y conversion a MLX 4-bit para ejecucion en Apple Silicon, con licencia MIT que permite redistribucion. No obstante, el autor lo etiqueta explicitamente como experimental y sin evaluacion de seguridad independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX); no se documentan otras variantes en este repo |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT (texto de Qwen Apache 2.0 preservado en el repo) |
| Formato de pesos | safetensors cuantizados para MLX-LM (`mlx`, `4-bit`, `quantized`) |

## Arquitectura y entrenamiento

La model card situa el linaje en Qwen/Qwen3.5-9B, pasa por ornith-ai/Ornith-1.5-9B y su conversion oficial a MLX 4-bit (ornith-ai/Ornith-1.5-9B-MLX-4bit), y sobre esa base se aplica el ajuste fino. No se detallan en la informacion disponible la composicion del corpus original de Ornith 1.5 ni si hubo RLHF o DPO en etapas previas.

El ajuste fino se realizo con LoRA en MLX-LM: rango 8, 8 capas adaptadas y tasa de aprendizaje 5e-6. Se ejecutaron 800 iteraciones de microbatch con acumulacion de gradiente de 2, lo que equivale a 400 actualizaciones del optimizador. El conjunto de entrenamiento consta de 1.575 filas: 1.450 ejemplos filtrados de un corpus local BuildEng V8 mas 25 escenarios de autoria independiente repetidos cinco veces. La validacion uso 100 filas y la perdida final reportada es 0,594. El adaptador se fusiono en los pesos cuantizados, por lo que la generacion es autonoma; el autor verifico la inferencia con MLX-LM 0.32.2 sin ruta de adaptador.

## Capacidades

- Generacion de texto conversacional en ingles con `pipeline_tag: text-generation`.
- Asistencia tecnica en ingenieria de edificacion y estructural: el ejemplo de la model card aborda la ubicacion de tendones postesados antes de perforar un forjado.
- Modo de razonamiento desactivable mediante `--chat-template-config '{"enable_thinking":false}'`, lo que sugiere soporte de plantilla de chat con modo thinking en el modelo base.
- Respuestas de orientacion conservadora, segun la descripcion del autor.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades multilingues: solo ingles declarado.
- Vision o audio: no disponible.

## Casos de uso

- Consultas de obra en ingles: el modelo responde a preguntas tecnicas concretas sobre secuencias de ejecucion, como la perforacion de losas con tendones postesados, con un tono prudente adecuado para personal de obra que necesita una primera orientacion antes de consultar al ingeniero responsable.
- Formacion interna de tecnicos: puede generar explicaciones introductorias sobre practicas estructurales a partir de los escenarios del corpus BuildEng, siempre con revision posterior por un profesional cualificado.
- Borradores de listas de comprobacion: util para redactar borradores de verificaciones previas a intervenciones en estructura, que luego se validan contra la normativa aplicable y el proyecto especifico.
- Asistente local en portatil Apple Silicon: al estar en MLX 4-bit y ocupar unos 4,7 GiB, se puede ejecutar sin GPU dedicada en equipos Mac con memoria unificada suficiente, lo que facilita pruebas sin infraestructura cloud.
- Prototipado de productos verticales: sirve como base para experimentar con asistentes de dominio tecnico antes de invertir en un ajuste fino propio con datos licenciados.
- Evaluacion de pipelines de cuantizacion y fusion de LoRA: el repositorio documenta el flujo completo (LoRA rango 8, fusion, conversion MLX 4-bit), por lo que es un caso de referencia para replicar el proceso en otros dominios.
- Traduccion de consultas tecnicas: no recomendado como uso principal, ya que solo declara ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de evaluacion es la perdida de validacion final de 0,594 sobre 100 filas del propio corpus, que no es comparable con MMLU, HumanEval, GSM8K ni con evaluaciones de seguridad estructural independientes.

## Requisitos de hardware

- VRAM o memoria unificada: aproximadamente 4,7 GiB de pesos en disco; en ejecucion hay que sumar la cache KV y el overhead de MLX, por lo que conviene disponer de al menos 8 GB de memoria unificada.
- Plataforma: MLX esta disenado para Apple Silicon; el autor verifico la generacion con MLX-LM 0.32.2.
- GPU dedicadas tipo A100, H100 o RTX 4090: no es el objetivo de este formato; no se documenta soporte CUDA para estos pesos.
- GPU de consumo: cabe en Mac con memoria unificada de 16 GB o superior; en GPUs NVIDIA no se ha validado en la informacion disponible.
- Opciones de despliegue: `mlx-lm` (comando `python -m mlx_lm generate`). vLLM, llama.cpp, Ollama y TGI no se documentan para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-BuildEng-V9-MLX-4bit | 8,95B | no disponible | MLX 4-bit | MIT | Ajuste de dominio, experimental, solo ingles |
| ornith-ai/Ornith-1.5-9B | clase 9B | no disponible | safetensors | MIT | Modelo base sin ajuste de dominio |
| ornith-ai/Ornith-1.5-9B-MLX-4bit | clase 9B | no disponible | MLX 4-bit | MIT | Conversion oficial sin el ajuste BuildEng |
| Qwen/Qwen3.5-9B | clase 9B | no disponible | safetensors | Apache 2.0 | Linaje arquitectonico original, proposito general |

La comparacion con alternativas de otros autores en el mismo nicho de ingenieria estructural no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que es un asistente experimental y no un ingeniero estructural colegiado, un paquete de diseno ni una autoridad de aprobacion.
- No ha sido cualificado con un benchmark de seguridad independiente y completo; puede omitir precauciones criticas o generar afirmaciones tecnicas incorrectas.
- No debe usarse como unica base para decisiones de construccion, ocupacion, demolicion o reparacion con implicaciones de seguridad vital.
- Riesgo de alucinacion en datos normativos, cargas admisibles, dimensiones o procedimientos no cubiertos por el corpus de entrenamiento.
- Solo declara ingles; el uso en castellano no esta validado.
- Conjunto de entrenamiento pequeno (1.575 filas) y poco diverso, con 25 escenarios repetidos cinco veces, lo que puede producir sobreajuste a esos casos.
- El subconjunto exacto de datos de V9 no esta publicado, lo que dificulta auditar sesgos o cobertura.
- Licencia MIT permite uso comercial y redistribucion conservando el aviso de copyright; el texto Apache 2.0 de Qwen se conserva en el repositorio, por lo que conviene revisar ambas licencias antes de redistribuir.
- Proyecto independiente sin respaldo de Ornith AI ni de DeepReinforce; sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Irfanuruchi/Ornith-1.5-9B-BuildEng-V9-MLX-4bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Conversion oficial MLX 4-bit: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-4bit
- Linaje arquitectonico Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset relacionado BuildEng V8: https://huggingface.co/datasets/Irfanuruchi/buildeng-v8-3b
- Repositorio upstream de Ornith: https://github.com/ornith-ai/Ornith-1

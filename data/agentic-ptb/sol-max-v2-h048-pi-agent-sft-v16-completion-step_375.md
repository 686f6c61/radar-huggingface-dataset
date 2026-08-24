# agentic-ptb/sol-max-v2.h048.pi-agent-sft-v16-completion.step_375

## Resumen

sol-max-v2.h048.pi-agent-sft-v16-completion.step_375 es un checkpoint intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB, publicado por el usuario agentic-ptb. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-9B-Base, con 9.409.813.744 parametros (~9,4B), capturado a la hora 48,41 de una ejecucion de entrenamiento de 100 horas. El identificador del repositorio codifica la celda del experimento (sol-max-v2), la hora del run (h048), la familia de entrenamiento (pi-agent-sft-v16-completion) y el paso (step_375).

El modelo pertenece a la celda experimental "sol-max-v2", cuyo driver es Codex / gpt-5.6-sol con esfuerzo de razonamiento maximo, lo que indica que los datos de entrenamiento o el proceso de generacion de trazas agénticas fueron producidos por ese modelo de OpenAI. El checkpoint se enmarca en un pipeline de SFT (supervised fine-tuning) orientado a tareas de agente (completado de trazas), y su token de fin de secuencia (eos_token_id) esta correctamente configurado a 248046 (`<|im_end|>`), lo que garantiza que el modelo detiene la generacion al final de cada turno.

La relevancia de este checkpoint reside en su caracter de punto intermedio dentro de una curva de entrenamiento: permite estudiar la evolucion de las capacidades del modelo a lo largo del tiempo de entrenamiento y comparar checkpoints de distintas horas del mismo run. No es un modelo final ni esta pensado para produccion directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer con torre de vision) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B-Base, una arquitectura transformer de la familia Qwen3.5 que, segun la model card, es Qwen3_5ForConditionalGeneration, es decir, una arquitectura con capacidad de vision (la torre de vision esta presente en los pesos). El fine-tuning se realizo mediante SFT con el pipeline pi-agent-sft-v16-completion, orientado a completar trazas de agentes.

El entrenamiento forma parte de un sweep del proyecto AgentPTB, una ejecucion de 100 horas en la que se generan checkpoints periodicos. Este checkpoint concreto corresponde a la hora 48,41 del run, iniciado el 2026-08-19T19:15:00Z. El driver del experimento es Codex / gpt-5.6-sol con esfuerzo de razonamiento maximo, lo que indica que los datos de entrenamiento fueron generados o curados por ese modelo. El eos_token_id esta correctamente fijado a 248046 (`<|im_end|>`), el token de fin de turno de la plantilla de chat de Qwen3.5.

Un detalle tecnico relevante: prime-rl (la herramienta de entrenamiento) no exporta preprocessor_config.json, por lo que al servir el modelo con vLLM es necesario indicar explicitamente que es solo texto mediante `--limit-mm-per-prompt '{"image": 0, "video": 0}'`, o el servidor fallara al cargar.

## Capacidades

- Generacion de texto: al estar basado en Qwen3.5-9B-Base, hereda las capacidades de generacion de texto del modelo base, incluyendo razonamiento, codigo y matematicas.
- Tareas de agente: el fine-tuning con pi-agent-sft-v16-completion esta orientado a completar trazas de agentes, por lo que el modelo deberia ser capaz de generar secuencias de acciones o pasos de razonamiento para tareas agénticas.
- Arquitectura de vision: la torre de vision esta presente en los pesos, aunque no se exporta preprocessor_config.json, lo que impide su uso directo para entrada de imagenes sin configuracion adicional.
- Token de fin de turno correcto: el eos_token_id esta configurado a `<|im_end|>`, lo que permite que el modelo detenga la generacion correctamente al final de cada turno de asistente.
- Capacidades multilingues: no disponibles (no se especifican idiomas en la model card).
- Tool calling / function calling: no disponible (no se documenta en la informacion proporcionada).

## Casos de uso

- Investigacion sobre dinamicas de entrenamiento agéntico: este checkpoint permite estudiar como evolucionan las capacidades de un modelo de 9,4B parametros a lo largo de un entrenamiento de 100 horas, comparando el rendimiento en la hora 48 con checkpoints de otras horas del mismo run.
- Analisis de la calidad de datos generados por modelos de alto razonamiento: al ser un fine-tuning de datos generados por Codex / gpt-5.6-sol con esfuerzo maximo, permite investigar el impacto de la calidad y el esfuerzo de razonamiento de los datos de entrenamiento en el rendimiento del modelo final.
- Reproduccion de experimentos: investigadores que quieran reproducir o extender los resultados del sweep AgentPTB pueden utilizar este checkpoint como punto de referencia intermedio.
- Fine-tuning adicional: el modelo puede servir como punto de partida para fine-tuning posterior en tareas especificas de agentes, aprovechando las 48 horas de entrenamiento ya realizadas.
- Evaluacion de checkpoints intermedios: util para estudiar la relacion entre el numero de pasos de entrenamiento y el rendimiento en tareas de agente, especialmente en lo que respecta a la convergencia y la estabilidad.
- Comparacion de estrategias de entrenamiento: permite comparar la celda sol-max-v2 (driver con esfuerzo maximo) con otras celdas del mismo sweep que usen distintos drivers o esfuerzos de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, etc.) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parametros y pesos en FP16, se necesitan aproximadamente 19-20 GB de VRAM. Con cuantizacion INT8, unos 10 GB; con INT4, unos 5-6 GB (si se generan las cuantizaciones correspondientes).
- GPU recomendadas: para FP16, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10G) o GPUs de datacenter como A100 (40/80 GB) o H100. Para cuantizacion, una RTX 4080 (16 GB) o RTX 4070 Ti (12 GB) podrian ser suficientes.
- Compatibilidad con GPU de consumo: si, con cuantizacion. Una RTX 4090 (24 GB) puede cargar el modelo en FP16 sin problemas.
- Opciones de despliegue: vLLM (con la bandera `--limit-mm-per-prompt '{"image": 0, "video": 0}'`), llama.cpp u Ollama si se generan pesos GGUF, o TGI.
- Latencia y throughput: no disponibles. No se han publicado mediciones de rendimiento de inferencia para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| agentic-ptb/sol-max-v2.h048... | 9,4B | no disponible | no disponible | Checkpoint intermedio de sweep agéntico |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | Modelo base del que deriva |

No se dispone de informacion suficiente para comparar con otras alternativas de la misma categoria. El modelo es un checkpoint de investigacion sin licencia especificada ni benchmarks publicados, por lo que cualquier comparacion con modelos comerciales o de codigo abierto establecidos seria especulativa.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final. Fue capturado a la hora 48,41 de un run de 100 horas, por lo que sus capacidades pueden estar incompletas o no representar el rendimiento optimo del entrenamiento.
- Licencia no especificada: no se indica la licencia del modelo, lo que impide su uso comercial o su redistribucion sin autorizacion explicita del autor.
- Sin benchmarks publicados: no hay datos de rendimiento en tareas estandar, lo que dificulta evaluar su calidad relativa.
- Sin idiomas documentados: no se especifican los idiomas soportados, aunque al derivar de Qwen3.5-9B-Base probablemente herede el soporte multilingue del modelo base.
- Problema de preprocesador de vision: la torre de vision esta presente pero no se exporta preprocessor_config.json, lo que impide el uso de entradas multimodales sin configuracion manual.
- Riesgo de alucinacion: como cualquier modelo de lenguaje de 9,4B parametros, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- Sin soporte de la comunidad: con 0 descargas y 0 likes, el modelo no tiene comunidad activa ni soporte documentado mas alla de la model card.
- Fecha de creacion reciente: el modelo fue creado el 2026-08-24, lo que sugiere que es muy reciente y puede no estar completamente validado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h048.pi-agent-sft-v16-completion.step_375
- Modelos de agentic-ptb en HuggingFace: https://huggingface.co/models?other=agentic-ptb
- Pagina de OpenAI (referencia del driver gpt-5.6-sol): https://openai.com/
- GPT-5.6 en Wikipedia: https://en.wikipedia.org/wiki/GPT-5.6
- System Card de GPT-5.6: https://deploymentsafety.openai.com/gpt-5-6
- Articulo de MIT Sloan sobre IA agéntica: https://mitsloan.mit.edu/ideas-made-to-matter/agentic-ai-explained

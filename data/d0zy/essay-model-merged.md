# D0zy/essay-model-merged

## Resumen

`D0zy/essay-model-merged` es un ajuste fino mediante LoRA del modelo `LiquidAI/LFM3-1.7B` de Liquid AI, publicado por el usuario D0zy en Hugging Face. Su proposito es actuar como examinador automatico de la tarea 2 del examen IELTS Writing: recibe la pregunta de la tarea y el ensayo del estudiante, y devuelve una puntuacion global (band score) seguida de retroalimentacion detallada en las cuatro categorias oficiales de evaluacion (Task Response, Coherence and Cohesion, Lexical Resource y Grammatical Range and Accuracy).

El modelo parte de LFM3-1.7B, un transformer de 1.728.801.536 parametros (aproximadamente 1,73 mil millones) desarrollado por Liquid AI. Sobre esa base se aplico un LoRA (r=16, alpha=32, dropout=0.05) entrenado durante una epoca sobre el dataset comunitario `chillies/IELTS-writing-task-2-evaluation`, con unas 7.000 muestras de entrenamiento y una longitud maxima de 2048 tokens. La perdida de validacion final reportada por el autor es de aproximadamente 0,418.

La relevancia de este modelo es acotada y de nicho: no compite con modelos generalistas, sino que demuestra como un modelo pequeno (1,7B) puede especializarse mediante LoRA en una tarea educativa concreta con un coste de entrenamiento bajo. Es util para prototipos de correccion automatizada de ensayos, pero sus puntuaciones son estimaciones aprendidas de un dataset comunitario, no resultados oficiales del IELTS. La licencia heredada del modelo base (LFM Open License v1.0) impone restricciones al uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: LiquidAI/LFM3-1.7B) con adaptador LoRA fusionado |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con max 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no publica variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial solo para entidades por debajo de 10 M USD de ingresos anuales |
| Formato de pesos | safetensors (transformers, con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B es un transformer de 1,73 mil millones de parametros de Liquid AI. Sobre el se aplico un ajuste fino supervisado con LoRA: rango 16, alpha 32, dropout 0.05, aplicado a todas las capas lineales. El entrenamiento consistio en una sola epoca con tasa de aprendizaje 2e-4, scheduler coseno y tamano de lote efectivo de 8. Los adaptadores LoRA se fusionaron en los pesos finales, de modo que el repositorio contiene un modelo unico listo para inferencia con `transformers` y `peft`.

Los datos de entrenamiento provienen del dataset `chillies/IELTS-writing-task-2-evaluation` (aproximadamente 7.000 ejemplos de entrenamiento, truncados a 2048 tokens). El calculo de la perdida se restringe unicamente a la parte de evaluacion de la respuesta, no a la pregunta ni al ensayo de entrada, lo que concentra el aprendizaje en el formato de salida del examinador. El autor no documenta uso de RLHF ni DPO, ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla del propio ajuste LoRA.

## Capacidades

- Generacion de texto en ingles orientada a la evaluacion de ensayos IELTS Writing Task 2.
- Produccion de una puntuacion global (overall band score) seguida de retroalimentacion estructurada en cuatro criterios: Task Response, Coherence and Cohesion, Lexical Resource y Grammatical Range and Accuracy.
- Formato conversacional mediante chat template (mensajes `system` y `user`), con soporte de `apply_chat_template`.
- Inferencia determinista recomendada (`do_sample=False` con `repetition_penalty=1.05`) segun el ejemplo del autor.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles (unico idioma declarado).

## Casos de uso

- Correccion automatica de ensayos IELTS en plataformas de preparacion: el modelo recibe la pregunta y el ensayo y devuelve band score y feedback por criterio, adecuado para generar borradores de correccion que un profesor revisa despues.
- Prototipos de evaluacion formativa en academias de ingles: integrado en un formulario web, ofrece retroalimentacion inmediata al estudiante antes de la revision humana.
- Investigacion educativa sobre evaluacion automatica: sirve como linea base reproducible (LoRA sobre 1,7B, dataset publico) para comparar con otros enfoques de scoring de ensayos.
- Generacion de rúbricas y comentarios de mejora: el formato de salida por criterios permite mapear cada seccion a una rubrica docente existente.
- Herramientas de autoaprendizaje para candidatos: el estudiante pega su ensayo y obtiene una estimacion de banda y comentarios sobre lexico y gramatica, con coste de inferencia bajo al ser un modelo de 1,7B.
- Experimentacion con ajuste fino de modelos pequenos: el repositorio documenta hiperparametros (r=16, alpha=32, lr 2e-4, 1 epoca) utiles como receta para especializar modelos de ~2B en tareas de evaluacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es la perdida de validacion final del ajuste LoRA (~0,418), que no es comparable directamente con metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,5 GB solo para pesos (1,73B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB.
- En cuantizacion de 8 bits: alrededor de 2 GB de pesos; en 4 bits, alrededor de 1 GB (aunque el autor no publica variantes cuantizadas).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, RTX 4090); tambien cabe en A100/H100 con holgura.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas; en GPUs con 6 GB puede requerir cuantizacion.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (metodo documentado por el autor); no se documenta soporte verificado de vLLM, llama.cpp, Ollama o TGI, y al requerir `custom_code` la conversion a GGUF puede no ser directa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D0zy/essay-model-merged | 1,73B | no disponible (entreno 2048) | Evaluacion IELTS Writing Task 2 | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM3-1.7B | 1,73B | no disponible | Modelo generalista base | LFM Open License v1.0 | Hugging Face |
| Modelos generalistas de ~2B (p. ej. Qwen, Gemma, Llama) | ~1-3B | variable | Proposito general, sin especializacion en IELTS | variable | Hugging Face |

La comparacion directa con otros examinadores automaticos de IELTS no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia es la especializacion en el formato de evaluacion; frente a modelos generalistas del mismo tamano, la ventaja es el formato de salida estructurado por criterios, a costa de perder capacidades generales y multilingues.

## Limitaciones y advertencias

- Las puntuaciones son estimaciones aprendidas de un dataset comunitario, no resultados oficiales del IELTS; el propio autor indica que solo deben usarse para practica y retroalimentacion.
- Riesgo de alucinacion en las puntuaciones y comentarios: al ser un modelo de 1,7B ajustado sobre ~7.000 ejemplos, puede producir bandas inconsistentes o feedback generico.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Ventana de contexto no documentada; el entrenamiento se trunco a 2048 tokens, por lo que ensayos largos pueden exceder la longitud manejada.
- Licencia LFM Open License v1.0: el uso comercial solo se permite a entidades con ingresos anuales inferiores a 10 M USD; por encima de ese umbral se requiere licencia adicional de Liquid AI.
- El modelo no esta afiliado ni respaldado por Liquid AI; "LFM" y "Liquid AI" son marcas registradas de Liquid AI.
- Requiere `trust_remote_code=True` y codigo personalizado (`custom_code`), lo que anade superficie de riesgo en despliegues de produccion y puede complicar la exportacion a otros runtimes.
- Sin datos publicados de benchmarks estandar, por lo que no es posible validar su calidad frente a alternativas con metricas objetivas.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/D0zy/essay-model-merged
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/chillies/IELTS-writing-task-2-evaluation
- Licencia original del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B (archivo LICENSE en el repositorio)

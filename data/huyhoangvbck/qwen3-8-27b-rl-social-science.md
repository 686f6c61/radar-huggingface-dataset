# huyhoangvbck/Qwen3.8-27B-RL-Social-Science

## Resumen

Qwen3.8-27B-RL-Social-Science es un ajuste fino mediante aprendizaje por refuerzo del modelo base Qwen/Qwen3.8-27B, publicado por el usuario huyhoangvbck en HuggingFace. El entrenamiento se realizó con el algoritmo GRPO (Group Relative Policy Optimization) sobre el benchmark VMLU en su categoría de ciencias sociales (economía, geografía, educación cívica, derecho, filosofía, entre otras). El resultado es un modelo orientado a responder preguntas de opción múltiple en vietnamita con un modo de razonamiento explícito activable mediante plantilla de chat.

El modelo conserva los 27.781.427.952 parámetros del base (unos 27,8 mil millones) y el autor indica que los adaptadores LoRA se han fusionado por completo en los pesos originales, por lo que se distribuye como un checkpoint único listo para servir. El repositorio ocupa 55,6 GB en formato safetensors, coherente con pesos en bfloat16 sin cuantizar.

Su relevancia es acotada pero clara: es un ejemplo reproducible de un pipeline de RL con GRPO sobre un dominio académico muy concreto y en un idioma de bajos recursos como el vietnamita, usando Megatron-SWIFT como framework y vLLM como motor de rollout. No obstante, el modelo se ha entrenado sobre un benchmark público y posteriormente se evalúa sobre ese mismo benchmark, lo que limita mucho la interpretabilidad de cualquier mejora reportada. El repositorio no tiene descargas ni valoraciones, y no se han publicado resultados de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only de la familia Qwen (tag `qwen3_5`). La model card menciona capas de self-attention, MLP y GDN, además de Multi-Token Prediction (MTP), pero no detalla la variante exacta |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible. El ejemplo de servido de la model card usa `--max-model-len 2560` |
| Tipos de cuantizacion | No disponible. El repositorio solo distribuye pesos safetensors (bfloat16 en los ejemplos) |
| Idiomas soportados | Vietnamita (`vi`) |
| Licencia | `other` (no se especifican los términos) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamaño del repositorio | 55,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-09-14 |
| Ultima actualizacion (metadatos) | 2026-09-14 |

## Arquitectura y entrenamiento

La arquitectura subyacente no se describe en detalle en la model card: se indica únicamente que el modelo conserva el 100 % de las capas del modelo base, incluyendo el módulo de Multi-Token Prediction (MTP). Entre los módulos objetivo del ajuste LoRA se citan `all-linear`, cubriendo las capas lineales de self-attention, MLP y GDN (Gated Delta Network), lo que apunta a una arquitectura híbrida con componentes de atención lineal, aunque esto no se confirma explícitamente en la información disponible.

El proceso de entrenamiento consistió en RL con GRPO sobre Megatron-SWIFT. Los hiperparámetros reportados son: LoRA de rango 32 y alpha 32 (escala 1.0) con dropout 0.05 sobre todos los módulos lineales; 8 rollouts por prompt (G = 8); batch global de 16; learning rate de 2e-6 con decaimiento coseno hasta 2e-7 y warmup del 5 %. El motor de rollout fue vLLM en configuración colocate con tensor parallelism 4 sobre 4 GPU NVIDIA A100 de 40 GB. La función de recompensa combina una recompensa de exactitud basada en reglas (`vmlu_acc`, peso 1.0) y una recompensa de formato (`vmlu_format`, peso 0.2). Los adaptadores LoRA se fusionaron posteriormente en los pesos del modelo base. No se detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset más allá de la referencia al benchmark VMLU de ciencias sociales.

## Capacidades

- Generacion de texto conversacional en vietnamita, con plantilla de chat propia del base (`apply_chat_template`).
- Razonamiento explicito: soporta `enable_thinking=True` y el parametro `reasoning_effort` con valores como `medium`, segun los ejemplos de la model card.
- Resolucion de preguntas de opcion multiple de ciencias sociales: economia, geografia, educacion civica, derecho y filosofia (categorias declaradas a partir del benchmark VMLU).
- Formato de respuesta guiado: el entrenamiento incluye una recompensa de formato (`vmlu_format`), lo que sugiere que el modelo tiende a emitir la respuesta con la estructura esperada por el evaluador.
- Generacion de texto general y uso conversacional (pipeline `text-generation`, tag `conversational`).
- Capacidades de tool calling / function calling: no disponibles; no se documentan.
- Capacidades de agente o razonamiento multi-paso: no documentadas como tales, mas alla del modo de pensamiento del base.
- Vision, audio o multimodalidad: no disponibles; no se declaran.
- Capacidades multilingues: solo se declara vietnamita. No hay datos sobre transferencia a otros idiomas.

## Casos de uso

- Preparacion de examenes academicos en vietnamita: el modelo esta entrenado especificamente sobre preguntas de ciencias sociales con respuesta multiple, por lo que puede usarse como generador de practica y explicacion de respuestas, siempre que se valide el contenido con fuentes oficiales.
- Evaluacion automatizada de reactivos de opcion multiple: dado su formato de salida reforzado, encaja como componente de un pipeline de correccion o de generacion de distractores en bancos de preguntas.
- Asistente de estudio con razonamiento visible: gracias a `enable_thinking=True` y `reasoning_effort`, se puede mostrar la cadena de razonamiento al estudiante, lo que resulta util en tutoria guiada.
- Prototipado de asistentes legales o economicos en vietnamita: la categoria de derecho y economia del dataset permite experimentar con resumenes o explicaciones de conceptos, con revision humana obligatoria.
- Investigacion en RLHF/GRPO: sirve como referencia reproducible de un pipeline completo (Megatron-SWIFT + vLLM colocate + recompensas rule-based) para comparar configuraciones de LoRA, numero de rollouts o esquemas de recompensa.
- Estudio de ajuste de dominio sobre modelos Qwen: al estar fusionado el LoRA, se puede usar como punto de partida para nuevos ajustes o como linea base frente al modelo original en tareas de ciencias sociales en vietnamita.
- Generacion de contenido educativo localizado: redaccion de material de apoyo (fichas, resumenes, preguntas) en vietnamita para asignaturas de humanidades y ciencias sociales, con supervision editorial posterior.
- Analisis de sesgo y comportamiento en idiomas de bajos recursos: permite estudiar como un modelo de ~27,8 B responde en vietnamita en dominios academicos y que tipo de errores sistematicos comete.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el esquema de recompensa (`vmlu_acc` con peso 1.0 y `vmlu_format` con peso 0.2) y el dataset de entrenamiento, pero no incluye ninguna tabla de exactitud ni comparacion con el modelo base. La busqueda web realizada no devolvio resultados relevantes sobre el modelo (los enlaces recuperados tratan sobre quimica inorganica y no guardan relacion).

## Requisitos de hardware

Nota: las cifras de VRAM son estimaciones derivadas del numero de parametros y del tamaño del repositorio, no datos publicados por el autor.

- VRAM estimada en bfloat16/fp16: en torno a 56 GB solo para pesos, mas el cache KV. Con contexto corto (2.560 tokens) el total se situa aproximadamente entre 60 y 70 GB segun lote y configuracion.
- VRAM estimada en int8: alrededor de 28-30 GB de pesos, mas cache KV.
- VRAM estimada en int4: alrededor de 14-16 GB de pesos, pero no se distribuye ninguna version cuantizada (no hay GGUF ni AWQ/GPTQ en el repositorio).
- GPU recomendadas: la configuracion validada por el autor es 4x NVIDIA A100 de 40 GB con tensor parallelism 4 (para el rollout de entrenamiento). Para inferencia, 2x A100 40 GB o 2x H100 80 GB con TP=2 es un punto de partida razonable; una sola H100 80 GB podria ser suficiente con contexto corto, pero no esta verificado por el autor.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bfloat16. Solo seria viable tras una cuantizacion a 4 bits que el autor no proporciona.
- Opciones de despliegue: vLLM (comando documentado con `--tensor-parallel-size 4 --trust-remote-code --dtype bfloat16 --max-model-len 2560`) y HuggingFace Transformers con `device_map="auto"`. Para llama.cpp u Ollama seria necesario convertir y cuantizar los pesos, algo no soportado oficialmente en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento (benchmarks, latencia o exactitud) de este modelo ni de alternativas comparables en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas declaradas.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-RL-Social-Science | 27,8 B | No disponible (ejemplo con 2.560) | vi | `other` | safetensors en HF, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27,8 B (segun el modelo derivado) | No disponible | No disponible | Segun la model card del base (no verificada aqui) | safetensors en HF |
| Otros ajustes de dominio en vietnamita de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se han identificado en la informacion proporcionada |

## Limitaciones y advertencias

- Riesgo de sobreajuste al benchmark: el modelo se entrena con recompensa de exactitud sobre VMLU y, previsiblemente, se evalua sobre el mismo conjunto. Cualquier mejora medida en VMLU estara sesgada al alza y no es extrapolable a preguntas nuevas del mismo dominio.
- Cobertura de idioma muy estrecha: solo se declara vietnamita. No hay evidencia de rendimiento en castellano, ingles u otros idiomas, y el ajuste RL puede haber degradado capacidades generales del base fuera del dominio entrenado.
- Licencia ambigua: la licencia es `other` y no se detallan sus terminos. Antes de cualquier uso comercial hay que verificar la licencia del modelo base Qwen/Qwen3.8-27B, que prevalece sobre un modelo derivado.
- Riesgo de alucinacion: es un modelo de ~27,8 B sin mecanismos de recuperacion. En dominios normativos (derecho, economia) puede generar respuestas plausibles pero incorrectas; requiere verificacion con fuentes primarias.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta. No hay evaluaciones independientes, informes de terceros ni issues que permitan contrastar el comportamiento real.
- Contexto limitado en el ejemplo de despliegue: la configuracion documentada usa `max-model-len 2560`, lo que restringe el uso en tareas de contexto largo (documentos extensos, conversaciones multi-turno prolongadas).
- Dependencia de `trust_remote_code`: tanto vLLM como Transformers se invocan con `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio del modelo. Conviene auditar el codigo antes de desplegarlo en produccion.
- Consumo de memoria elevado: 55,6 GB de pesos en safetensors obligan a infraestructura multi-GPU o a un proceso de cuantizacion propio, con la perdida de calidad que ello conlleva.
- Metadatos poco convencionales: las fechas de creacion y actualizacion (2026) y el nombre del modelo base resultan atipicos, lo que dificulta trazar la version exacta del base sobre la que se entreno.
- Requisitos de plantilla: el modo de razonamiento depende de pasar `enable_thinking` y `reasoning_effort` en `apply_chat_template`; un uso incorrecto de la plantilla puede degradar notablemente la calidad de las respuestas.
- Sin soporte de tool calling ni agentes documentado, lo que descarta su uso directo en pipelines que necesiten invocacion de funciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huyhoangvbck/Qwen3.8-27B-RL-Social-Science
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Framework Megatron-SWIFT (ms-swift, ModelScope): https://github.com/modelscope/ms-swift
- Paper original de GRPO (DeepSeekMath, arXiv:2402.03300): https://arxiv.org/abs/2402.03300
- Benchmark VMLU (citado en la model card): enlace no disponible en la informacion proporcionada
- Resultados de la busqueda web: no relevantes para este modelo (los enlaces recuperados corresponden a preguntas de quimica inorganica)

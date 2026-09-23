# budget-internalization-iclr2027/nemotron3-nano-4b-16k-grpo-firmbeetle-s120

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, publicado por el usuario `budget-internalization-iclr2027` como parte de un envio anonimo a ICLR 2027. Su objetivo es estudiar la internalizacion de un presupuesto de generacion: el modelo se entrena con GRPO para resolver problemas de matematicas produciendo la respuesta dentro de un limite estricto de 16.384 tokens nuevos, de forma que las respuestas que agotan el presupuesto se truncan y se puntuan tal cual. El checkpoint publicado corresponde al paso 120 de los 300 planificados, con nombre de ejecucion `firmbeetle`.

Tecnicamente es un modelo de ~3,97 mil millones de parametros (3.973.556.832 segun los pesos en safetensors), con etiqueta de arquitectura `nemotron_h` y codigo personalizado (`trust_remote_code`), pesos almacenados en F32 y un repositorio de 15,9 GB. El pipeline declarado es `text-generation` y el entrenamiento se realizo exclusivamente sobre el dataset de matematicas DeepScaleR-Preview con recompensa binaria de correccion de respuesta extraida de etiquetas `\boxed{}`.

Su relevancia es fundamentalmente de investigacion: permite analizar si un modelo de 4B puede aprender a adaptar la longitud de su razonamiento a un presupuesto fijo de tokens, un problema practico en despliegues con coste por token y latencia acotada. No hay resultados de benchmarks publicados en la informacion disponible, y la model card advierte de que el entrenamiento se detuvo antes de lo previsto, por lo que debe tratarse como un checkpoint intermedio de un barrido experimental, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h` (familia NVIDIA Nemotron H), implementada con codigo personalizado (`custom_code`); el detalle de capas no esta disponible |
| Parametros totales | 3.973.556.832 (~3,97 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; el presupuesto de generacion entrenado es de 16.384 tokens (`max_new_tokens`) |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en F32 |
| Idiomas soportados | no disponibles |
| Licencia | `nvidia-nemotron-open-model-license` (hereda la del modelo base) |
| Formato de pesos | safetensors (F32), con `custom_code` y `trust_remote_code=True` |
| Modelo base | nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 (relacion: finetune) |
| Dataset de entrenamiento | agentica-org/DeepScaleR-Preview-Dataset (matematicas), hasta 3 epocas |
| Tamano del repositorio | 15,9 GB |
| Compatibilidad de endpoints | `endpoints_compatible`, `region:us` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base; la unica informacion disponible es la etiqueta `nemotron_h`, que apunta a la familia Nemotron H de NVIDIA, y el uso obligatorio de codigo personalizado (`trust_remote_code=True`) tanto en Transformers como en vLLM. No se especifican numero de capas, dimension del modelo, tipo de atencion, ni si se trata de una arquitectura hibrida. Los pesos se publican en F32, lo que explica el tamano de 15,9 GB del repositorio para un modelo de ~3,97 B de parametros.

El ajuste se realizo con GRPO usando baseline *leave-one-out*, normalizacion de recompensa por grupo y perdida a nivel de token. La configuracion concreta fue: 32 prompts por paso con 8 rollouts cada uno, optimizador Adam con schedule coseno, LR pico de 5e-7, 10 pasos de calentamiento, 120 pasos ejecutados (de 300 planificados) y recompensa binaria de correccion de la respuesta extraida de etiquetas `\boxed{}`. La innovacion metodologica es el propio presupuesto de generacion: `max_new_tokens = 16.384`, con truncado de las respuestas que agotan el limite y puntuacion de la respuesta truncada tal cual. El prompt de entrenamiento es explicito en el formato de salida: "Think step-by-step to solve the following problem. Output your answer inside of \\boxed{} tags." seguido del problema y de "Let's think step-by-step".

## Capacidades

- Generacion de texto conversacional y de razonamiento paso a paso (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Razonamiento matematico orientado a respuesta final verificable dentro de etiquetas `\boxed{}`.
- Razonamiento bajo presupuesto controlado de tokens: el modelo fue entrenado con un limite de 16.384 tokens de generacion, de modo que tiende a operar dentro de ese margen.
- Ajuste fino por RL (GRPO) sobre el modelo base, lo que en principio preserva las capacidades del modelo original y especializa el comportamiento de resolucion.
- Plantilla de chat propia del modelo base, requerida para el formato correcto del prompt.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible (el entrenamiento es de resolucion de problemas matematicos en un unico turno).
- Capacidades multilingues: no disponibles; la lista de idiomas no se especifica.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Investigacion sobre internalizacion de presupuesto de tokens: comparar este checkpoint (paso 120) con los del paso 300 del mismo barrido permite medir como evoluciona la capacidad del modelo de ajustar la longitud del razonamiento a un limite fijo.
- Generacion de datos sinteticos de matemáticas: producir soluciones paso a paso de DeepScaleR u otros conjuntos de problemas con respuestas normalizadas en `\boxed{}`, utiles para destilar o aumentar datasets de razonamiento.
- Evaluacion de pipelines de RL para modelos pequenos: servir como referencia de un ajuste GRPO con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token sobre un modelo de ~4B.
- Despliegue con coste acotado por peticion: al haber sido entrenado con un presupuesto de 16.384 tokens, resulta adecuado para escenarios donde hay que garantizar un limite duro de tokens generados por consulta y evitar respuestas desbordadas.
- Servicio de resolucion de problemas matematicos con vLLM: la model card documenta explicitamente el arranque con `vllm serve ... --trust-remote-code`, pensado para servir el modelo en lote o en linea sobre problemas de matematicas.
- Estudio de robustez ante truncado: las respuestas que agotan el presupuesto se puntuan tal cual, de modo que el modelo es un banco de pruebas para analizar que ocurre cuando un generador de razonamiento se corta a mitad de la cadena.
- Base para comparativas de eficiencia: con ~3,97 B de parametros y pesos en F32, permite medir el impacto de cuantizaciones posteriores en tareas de razonamiento matematico verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, GSM8K, MATH, HumanEval ni de ningun otro conjunto de evaluacion, y las busquedas web realizadas no han devuelto informacion sobre este checkpoint. El unico dato de rendimiento implicito es de procedimiento: el entrenamiento se detuvo en el paso 120 de los 300 planificados, mientras que otros checkpoints del mismo barrido de presupuestos alcanzan el paso 300.

## Requisitos de hardware

- Los pesos publicados estan en F32: ~15,9 GB de repositorio, por lo que la carga directa en `torch_dtype="auto"` requiere del orden de 16 GB solo para pesos, mas overhead de activaciones y cache KV.
- Conversion a BF16/FP16: reduce los pesos a aproximadamente 8 GB, lo que hace viable la inferencia en una GPU de 16 GB (por ejemplo, RTX 4090, RTX 4080, A10G) con contexto moderado.
- Cuantizacion a 8 bits: del orden de 4 GB de pesos, apta para GPUs de 8-12 GB. Cuantizacion a 4 bits: del orden de 2-2,5 GB, apta para GPUs consumer de 8 GB o incluso menos con contexto corto.
- Caber en GPU consumer: si, el modelo de ~3,97 B cabe en tarjetas de 8, 12 y 16 GB tras conversion a BF16 o cuantizacion, siempre que la ventana de contexto efectiva se mantenga moderada.
- GPU recomendadas para despliegue comodo: A100 40/80 GB, H100, L40S o RTX 4090; no se requiere hardware de centro de datos para una sola instancia.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM` con `trust_remote_code=True`) y vLLM (`vllm serve ... --trust-remote-code`), ambas documentadas por el autor. Compatibilidad con llama.cpp, Ollama o TGI: no disponible; el uso de codigo personalizado hace dudosa la conversion a GGUF sin trabajo adicional.
- Latencia y throughput estimados: no disponibles; dependen del hardware, de la cuantizacion y de la longitud real de la generacion, que en este modelo puede llegar hasta los 16.384 tokens nuevos.
- Nota de memoria: dado que el presupuesto de generacion es de 16.384 tokens, la cache KV puede crecer de forma significativa en respuestas largas; conviene dimensionar `max_model_len` y `gpu_memory_utilization` en vLLM antes de medir rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`nemotron3-nano-4b-16k-grpo-firmbeetle-s120`) | 3,97 B | no disponible (presupuesto de generacion de 16.384 tokens) | Sin benchmarks publicados | nvidia-nemotron-open-model-license | HuggingFace, 0 descargas, 0 likes en el momento de la consulta |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 (base) | ~4 B | no disponible | No disponible en la informacion proporcionada | nvidia-nemotron-open-model-license | HuggingFace (modelo base oficial) |
| Otros checkpoints del mismo barrido de presupuestos | ~4 B | no disponible | No disponible (incluye ejecuciones hasta el paso 300) | nvidia-nemotron-open-model-license | Referenciados en la model card, sin identificadores concretos |
| Alternativas de ~4 B de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de terceros en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable frente a modelos de tamano similar de otros fabricantes.

## Limitaciones y advertencias

- Checkpoint intermedio: el entrenamiento se detuvo en el paso 120 de 300 previstos, por lo que su rendimiento no es representativo del resultado final del experimento.
- Ausencia total de evaluacion publicada: no hay benchmarks, cartas de evaluacion ni analisis de errores, lo que impide certificar su calidad en produccion.
- Especializacion estrecha: el ajuste se realizo unicamente sobre DeepScaleR-Preview (matematicas) con recompensa binaria de respuesta; fuera de ese dominio el comportamiento puede degradarse respecto al modelo base.
- Riesgo de alucinacion: cualquier modelo de razonamiento puede producir cadenas plausibles con resultados incorrectos; aqui ademas las respuestas truncadas al agotar el presupuesto se puntuan tal cual, de modo que en inferencia puede devolver razonamientos incompletos si se alcanza el limite de tokens.
- Formato de respuesta rigido: espera la plantilla de chat del modelo base y etiquetas `\boxed{}`; sin ese formato el rendimiento de extraccion de respuesta puede ser pobre.
- Idiomas: la lista de idiomas no esta declarada; no hay garantia de comportamiento multilingue mas alla del ingles de los datos de entrenamiento.
- Licencia: se hereda la `nvidia-nemotron-open-model-license` del modelo base. No es una licencia de codigo abierto estandar, por lo que hay que revisar sus terminos (atribucion, restricciones de uso, obligaciones de cumplimiento) antes de cualquier uso comercial.
- Codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar el codigo antes de desplegarlo en entornos gestionados.
- Autor anonimo y contexto de envio a conferencia: el repositorio pertenece a una submission anonima a ICLR 2027, lo que implica que puede cambiar, moverse o eliminarse, y que no hay soporte ni mantenimiento garantizados.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado su funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-16k-grpo-firmbeetle-s120
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia del modelo: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- vLLM (comando de servicio documentado en la model card): https://github.com/vllm-project/vllm
- Busquedas web realizadas: no se han encontrado resultados relevantes sobre este modelo. Los enlaces devueltos corresponden a servicios de alquiler de vehiculos (budget.fr, budget.com) y al presupuesto del Estado frances (budget.gouv.fr, dettedelafrance.fr), sin ninguna relacion con el modelo. No se dispone de paper, blog, repositorio ni demo adicionales.

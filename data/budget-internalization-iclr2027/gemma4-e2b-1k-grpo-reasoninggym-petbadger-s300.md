# budget-internalization-iclr2027/gemma4-e2b-1k-grpo-reasoninggym-petbadger-s300

## Resumen

`budget-internalization-iclr2027/gemma4-e2b-1k-grpo-reasoninggym-petbadger-s300` es un ajuste fino por aprendizaje por refuerzo del modelo multimodal instructivo `google/gemma-4-E2B-it`. El autor (una cuenta ligada a un envio anonimo a ICLR 2027, bajo el identificador `budget-internalization-iclr2027`) ha entrenado el modelo con GRPO sobre tareas generadas proceduralmente por Reasoning Gym, imponiendo un presupuesto de generacion estricto de 1.024 tokens. El objetivo declarado de la investigacion es estudiar la internalizacion de presupuestos de tokens: el modelo debe resolver problemas de razonamiento sin exceder ese limite, y de hecho cualquier respuesta que agota el presupuesto recibe recompensa cero durante el entrenamiento.

Se trata de un checkpoint intermedio (paso 300 de un run con nombre en clave `petbadger`), con 5.123.178.051 parametros almacenados en safetensors con dtype F32, lo que explica un repositorio de 20,5 GB. El pipeline declarado en HuggingFace es `any-to-any` y el tag `image-text-to-text` indica que conserva la entrada multimodal del modelo base, aunque el entrenamiento por RL se ha realizado exclusivamente sobre prompts de texto de Reasoning Gym.

La relevancia del modelo es fundamentalmente de investigacion: sirve como referencia reproducible para estudiar como el RL con verificador de recompensa modifica el comportamiento de longitud de generacion, y como punto de partida para experimentos de GRPO sobre modelos multimodales pequenos de la familia Gemma 4. No es un modelo destinado a produccion generalista: no se han publicado evaluaciones de benchmarks, no hay datos de idiomas soportados y el autor no documenta el contexto maximo del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Gemma 4; la nomenclatura E2B apunta a un diseno con parametros efectivos, sin confirmar en la informacion disponible) |
| Parametros totales | 5.123.178.051 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se distribuye ninguna cuantizacion; pesos publicados en F32 (se pueden derivar BF16/FP16, INT8 o INT4 mediante conversion propia) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (la model card indica que hereda la licencia de `google/gemma-4-E2B-it`, con enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors (F32), compatible con la libreria `transformers` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que el modelo base es `google/gemma-4-E2B-it` y de que el pipeline declarado es multimodal (`any-to-any`, `image-text-to-text`). Todos los pesos se publican en F32. El ajuste no modifica la topologia del modelo base: es un finetune completo con relacion declarada `base_model_relation: finetune`.

El entrenamiento se realizo con GRPO (Group Relative Policy Optimization) usando una linea base leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. El presupuesto de generacion fue de 1.024 `max_new_tokens` y las respuestas que alcanzaban ese limite recibian recompensa cero, lo que constituye el mecanismo central del experimento de internalizacion de presupuesto. Los datos son tareas de Reasoning Gym generadas proceduralmente con respuestas en formato `\boxed{}`, con un maximo de 3 epocas. La configuracion concreta fue: lotes de 32 prompts x 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de calentamiento, durante 300 pasos. La recompensa proviene del verificador de tareas de Reasoning Gym aplicado sobre la respuesta dentro de `\boxed{}`. Los prompts se renderizaron con la plantilla de chat del modelo base.

## Capacidades

- Razonamiento verificado: entrenado especificamente para producir respuestas finales en formato `\boxed{}` que un verificador automatico puede evaluar.
- Razonamiento bajo restriccion de longitud: el comportamiento esta optimizado para operar dentro de un presupuesto de 1.024 tokens de generacion.
- Generacion de texto instructivo: hereda la capacidad conversacional del modelo base `google/gemma-4-E2B-it`.
- Entrada multimodal: el pipeline declarado (`any-to-any`) y el tag `image-text-to-text` indican soporte de entrada de imagen y texto, aunque el finetune por RL se ha realizado solo con prompts de texto.
- Tool calling / function calling: no disponible en la informacion proporcionada (no confirmado ni descartado).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada; el entrenamiento se limita a tareas de Reasoning Gym de un unico episodio con respuesta final verificable.
- Capacidades multilingues: no disponible.
- Modo de pensamiento explicito (thinking mode): no disponible; la model card no menciona ningun modo de este tipo.
- Audio: no disponible.

## Casos de uso

- Investigacion sobre internalizacion de presupuesto de tokens: el modelo es un artefacto experimental disenado para medir si el RL con recompensa verificada ensena al modelo a ajustar la longitud de su razonamiento a un limite fijo de 1.024 tokens. Se usaria comparando distribuciones de longitud de respuesta antes y despues del entrenamiento.
- Reproducibilidad de experimentos GRPO: al publicarse el run completo con nombre en clave y numero de paso, sirve como checkpoint de referencia para replicar la receta (leave-one-out baseline, normalizacion por grupo, perdida a nivel de token) sobre modelos multimodales pequenos.
- Punto de partida para RL posterior: el checkpoint del paso 300 puede reutilizarse como inicializacion para continuar el entrenamiento con otro presupuesto de tokens u otras tareas de Reasoning Gym, sin partir del modelo base.
- Generacion de soluciones con formato verificable: util en pipelines donde la respuesta debe extraerse de forma automatica mediante un parser de `\boxed{}`, por ejemplo en entornos de evaluacion de matematicas y logica.
- Inferencia con coste acotado: en escenarios donde el coste por consulta o la latencia estan limitados, un modelo entrenado para no exceder 1.024 tokens reduce la varianza en el consumo de tokens de salida frente a un modelo sin ese condicionamiento.
- Base para modelos de recompensa o jueces auxiliares: el verificador y el formato de respuesta hacen que el modelo sea reutilizable en bucles de evaluacion automatica dentro de experimentos de RL.
- Experimentos academicos sobre Reasoning Gym: como baseline afinado especificamente en ese conjunto de tareas procedurales para comparar con otros algoritmos de RL o con el modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta la receta de entrenamiento (algoritmo, hiperparametros, datos y funcion de recompensa) y no incluye cifras de MMLU, HumanEval, GSM8K ni de las propias tareas de Reasoning Gym. Tampoco se proporcionan curvas de recompensa ni comparaciones con el modelo base.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parametros (5.123.178.051) y del dtype publicado; no proceden de mediciones del autor.

- Peso en disco y en memoria de los parametros: F32 ocupa aproximadamente 20,5 GB (coincide con el tamano del repositorio). Al cargar con `torch_dtype="auto"` se mantiene F32, de modo que se necesitan mas de 20,5 GB de VRAM solo para los pesos.
- VRAM estimada en F32 para inferencia: en torno a 24-30 GB teniendo en cuenta cache KV y activaciones; no es posible calcularla con precision porque no se conoce la longitud de contexto ni la configuracion de atencion.
- VRAM estimada tras conversion: BF16/FP16 aproximadamente 10-12 GB de pesos; INT8 aproximadamente 5-6 GB; INT4 aproximadamente 3-4 GB (mas cache KV en todos los casos).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para ejecutar en F32 sin cuantizar; RTX 4090, RTX 3090 o RTX 6000 Ada (24 GB) para BF16/FP16.
- GPU de consumo: si cabe en tarjetas de 24 GB en BF16/FP16 con margen ajustado, y en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, RTX 5070 Ti) con cuantizacion INT8. En tarjetas de 12 GB (RTX 3060 12 GB) requeriria INT4. El soporte exacto depende de la arquitectura del modelo base, que no se detalla.
- Memoria unificada: en equipos Apple Silicon se necesitarian al menos 32 GB de memoria unificada para BF16 y 64 GB o mas para F32.
- Opciones de despliegue: `transformers` esta verificado por el autor (ejemplo con `AutoModelForCausalLM` y `AutoTokenizer`), y la model card documenta explicitamente el despliegue con vLLM (`vllm serve <repo>`). No se proporcionan pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion propia. El soporte en TGI u otros servidores no esta confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4-e2b-1k-grpo-reasoninggym-petbadger-s300 (este modelo) | 5.123.178.051 | no disponible | GRPO sobre Reasoning Gym, presupuesto de 1.024 tokens, 300 pasos | Apache 2.0 (heredada del base segun la model card) | safetensors F32 en HuggingFace |
| google/gemma-4-E2B-it (modelo base) | no disponible en la informacion proporcionada | no disponible | Ajuste instructivo original de Google | licencia de Gemma 4 (enlazada en la model card) | HuggingFace |
| Otros finetunes de razonamiento con GRPO de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay cifras de benchmarks, ni comparacion con el modelo base, ni curvas de recompensa. No se puede afirmar que el finetune mejore al base en ninguna tarea externa.
- Riesgo de alucinacion: no evaluado por el autor; el entrenamiento con verificador de recompensa puede favorecer respuestas que superen el verificador sin ser correctas en un sentido amplio.
- Degradacion potencial fuera del dominio: al estar ajustado exclusivamente sobre tareas procedurales de Reasoning Gym durante 300 pasos, el comportamiento fuera de ese formato (respuestas en `\boxed{}`) puede haberse deteriorado respecto al modelo base.
- Formato de salida muy condicionado: el modelo esta optimizado para emitir una respuesta final verificable; usarlo en tareas abiertas de generacion de texto o conversacion puede dar resultados pobres.
- Sesgo hacia la brevedad: la penalizacion de recompensa cero al agotar los 1.024 tokens puede provocar respuestas truncadas o razonamientos incompletos en problemas que requieren mas de ese presupuesto.
- Idiomas: no se documenta ningun idioma soportado, por lo que no hay garantia de comportamiento en castellano ni en ningun otro idioma distinto del usado en los prompts de Reasoning Gym.
- Contexto maximo desconocido: no se especifica la longitud de contexto del modelo base, lo que impide planificar despliegues con documentos largos.
- Licencia: la model card declara Apache 2.0 pero enlaza la licencia de Gemma 4 y afirma que hereda la licencia del modelo base. Esta ambiguedad debe resolverse antes de cualquier uso comercial; los pesos del modelo base de Google suelen estar sujetos a sus propios terminos de uso.
- Naturaleza anonima y provisional: el repositorio pertenece a un envio anonimo a ICLR 2027, con 0 descargas y 0 likes en el momento de la consulta, y sin documento tecnico asociado disponible. El checkpoint del paso 300 puede no ser el mejor del run.
- dtype F32: los pesos ocupan 20,5 GB, lo que encarece el almacenamiento, la transferencia y el servicio en produccion sin que se documente ninguna ventaja de precision derivada de ello.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-reasoninggym-petbadger-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia de Gemma 4 referenciada en la model card: https://ai.google.dev/gemma/docs/gemma_4_license
- Documentacion de vLLM (mencionada en la model card para el despliegue): https://docs.vllm.ai/
- Nota sobre la busqueda web: las consultas realizadas han devuelto unicamente resultados sobre el presupuesto del Estado frances (budget.gouv.fr, budget.fr, francebudget.fr), sin ninguna relacion con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo.

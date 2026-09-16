# sandeep123/stride-qwen3-1.7b-nonthinking-stabilized-2048-local_positive-20260916

## Resumen

Stride-qwen3-1.7b-nonthinking-stabilized-2048-local_positive es un adaptador LoRA (PEFT) entrenado por el usuario sandeep123 sobre el modelo base Qwen/Qwen3-1.7B. No es un modelo completo ni un ajuste supervisado al uso: es el resultado de un experimento de aprendizaje por refuerzo con GRPO sobre un split de 2.048 problemas matematicos, con la particularidad de que el entrenamiento fuerza explicitamente `enable_thinking=False`, es decir, se busca mejorar el razonamiento en modo no-pensante (respuesta directa) en lugar del modo con cadena de pensamiento larga que Qwen3 activa por defecto.

El elemento tecnico diferencial es STRIDE, un esquema de credito de diversidad de pasos locales no negativo aplicado sobre los tokens de razonamiento elegibles, con alpha configurado a 1, separado del alpha 32 de LoRA. El experimento documenta de forma inusualmente detallada su contrato cientifico: 4 epocas planificadas, batch global de 64 preguntas con 8 rollouts cada una (512 respuestas por actualizacion), 32 actualizaciones por epoca y 128 actualizaciones planificadas, contexto limitado a 8.192 tokens y semilla 42. La tasa de aprendizaje alcanza un pico de 2e-5 tras 10 actualizaciones de warmup lineal y se mantiene constante despues, con un coeficiente KL de 0,01 estimado con el estimador k3 original de GRPO.

Su relevancia es fundamentalmente metodologica y de reproducibilidad: publica cada checkpoint intermedio de forma inmutable con manifiesto SHA256, incluye el adaptador sin entrenar (update zero) como referencia y mantiene un par de reanudacion completo con estado del optimizador Adam y RNG por rank. El autor declara explicitamente que no reclama ninguna superioridad ni ha publicado evaluacion, y advierte de que una respuesta final correcta no valida cada paso intermedio de la demostracion. Con cero descargas y cero likes en el momento de la consulta, debe tratarse como material de investigacion, no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Qwen3-1.7B) con adaptador LoRA sobre proyecciones q/k/v/o y gate/up/down |
| Parametros totales | 1.700 millones en el modelo base; el peso del adaptador no se cuantifica en la informacion disponible |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 8.192 tokens de prompt mas respuesta durante el entrenamiento; contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; los pesos del adaptador se publican en safetensors (precision de entrenamiento) y se combinan con la cuantizacion que se elija para el modelo base |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio del adaptador no declara licencia) |
| Formato de pesos | safetensors (formato PEFT/LoRA); incluye tokenizer y chat template; requiere descargar aparte Qwen/Qwen3-1.7B |
| Modelo base | Qwen/Qwen3-1.7B, revision fijada 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e |
| Configuracion LoRA | rango 16, alpha 32, dropout 0, sin bias |
| Tamano del repositorio | 0,5 GB (incluye todos los checkpoints publicados y los ficheros de reanudacion) |
| Libreria | peft (compatible con transformers) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-1.7B, un transformer decoder-only denso con atencion por consultas agrupadas. LoRA se aplica con rango 16 y alpha 32 sobre los modulos de proyeccion q/k/v/o y gate/up/down de todas las capas, sin bias y con dropout 0. El adaptador se inicializa desde cero sobre el modelo base fijado, no es una continuacion de un adaptador anterior. Cada carpeta `checkpoint-NNNNNN/` es inmutable y contiene los pesos PEFT en safetensors, la configuracion del adaptador, el tokenizer, la plantilla de chat, metadatos de entrenamiento y un manifiesto SHA256; existe un commit independiente en el Hub por checkpoint.

El entrenamiento usa GRPO con el estimador k3 original para la penalizacion KL (`expm1(log_p_ref - log_p_policy) - (log_p_ref - log_p_policy)`), con coeficiente 0,01 frente a la politica base congelada y agregacion sobre el mismo denominador global de tokens generados que la perdida de politica. El autor advierte de que se trata de la implementacion original sin correccion por ratio de importancia y que no se reclama un gradiente exacto e insesgado de la KL inversa. Sobre esa base se anade STRIDE con credito de diversidad de pasos locales no negativo sobre los tokens de razonamiento elegibles y alpha 1; conviene notar que GRPO no utiliza el bonus de diversidad de STRIDE. La tasa de aprendizaje sigue un warmup lineal de 10 actualizaciones (2e-6 en la actualizacion 1 hasta 2e-5 en la 10) y despues se mantiene constante; el warmup se indexa por actualizaciones absolutas completadas, de modo que una reanudacion exacta no lo reinicia. La innovacion mas destacable del repositorio no es arquitectonica sino de trazabilidad: indice de checkpoints con paso de optimizador y fraccion de epoca completada, hashes verificados en la subida y un directorio `latest-resume/` con estado de Adam, RNG por rank, contrato cientifico y verificacion de hashes para reproducir la topologia de cuatro aprendices.

## Capacidades

- Generacion de texto y resolucion de problemas matematicos en modo no-pensante: el entrenamiento renderiza explicitamente la plantilla con `enable_thinking=False`, de modo que el modelo responde sin cadena de pensamiento larga.
- Razonamiento paso a paso supervisado por credito de diversidad (STRIDE), orientado a problemas con solucion verificable mas que a conversacion general.
- Ajuste ligero sobre el modelo base: al ser un adaptador PEFT, hereda las capacidades del Qwen3-1.7B subyacente (generacion, codigo, matematicas basicas) pero solo se ha optimizado para el dominio matematico del split de entrenamiento.
- Reanudacion de entrenamiento: los checkpoints publicados admiten `is_trainable=True` para seguir entrenando el adaptador con un optimizador nuevo; la continuacion exacta del run original requiere ademas los ficheros `state_NNN` de optimizador y RNG.
- Tool calling: no disponible (no se documenta ni se entrena explicitamente en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modo no-pensante reduce precisamente el razonamiento multi-paso explicito.
- Capacidades multilingues: no disponible.
- Capacidades especiales: ninguna adicional declarada; no hay vision ni audio.

## Casos de uso

- Investigacion en RL para matematicas: el caso de uso principal es reproducir o auditar un experimento de GRPO con bonus de diversidad (STRIDE) sobre un split fijo de 2.048 problemas, comparando checkpoints intermedios para estudiar estabilidad del entrenamiento frente a la tasa de aprendizaje, el warmup y el coeficiente KL.
- Analisis de modos thinking frente a nonthinking: dado que el adaptador se entrena con `enable_thinking=False`, sirve para estudiar como se degrada o se preserva la capacidad de razonamiento matematico cuando se elimina la cadena de pensamiento explicita del modelo base.
- Estudio de tecnicas de credit assignment: el credito de diversidad local sobre tokens de razonamiento elegibles permite experimentar con variantes de asignacion de recompensa por paso, comparando contra GRPO sin el bonus STRIDE.
- Prototipado de tutores matematicos ligeros: con 1.700 millones de parametros y un adaptador pequeno, el conjunto cabe en hardware modesto para demos de resolucion de ejercicios de nivel escolar y universitario basico, siempre con verificacion humana de los pasos intermedios.
- Evaluacion de pipelines de RLHF/RLVR: el repositorio proporciona una plantilla util de trazabilidad (manifiestos SHA256, indice de checkpoints, contrato cientifico congelado) que se puede reutilizar como referencia para disenar infraestructura de experimentos reproducibles.
- Generacion sintetica de soluciones matematicas para filtrado posterior: las salidas en modo no-pensante pueden usarse para generar candidatos de respuesta corta que despues se validan con un verificador simbolico o un modelo mayor, aprovechando el bajo coste de inferencia del 1.7B.
- Comparacion controlada de adaptadores: al publicarse el adaptador sin entrenar (update zero) junto a los entrenados, es posible medir el efecto neto del RL aislando cualquier cambio del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no se hace ninguna afirmacion de evaluacion ni de superioridad, y que las respuestas finales correctas no verifican cada paso intermedio de la demostracion.

## Requisitos de hardware

- VRAM para el modelo base: aproximadamente 3,4 GB en bfloat16 o float16 solo para pesos, mas 0,5-1,5 GB de cache KV segun longitud de contexto y batch. Estimaciones derivadas del tamano del modelo base, no publicadas por el autor.
- VRAM con cuantizacion: del orden de 1,1-1,3 GB en Q4 y 1,8-2,0 GB en Q8, sin contar cache KV.
- GPU consumer: cabe holgadamente en tarjetas de 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, RTX 4090). En GPUs integradas o con poca memoria unificada la viabilidad depende de la cuantizacion.
- GPU de datacenter: A100, H100, L40S o similares no son necesarias para inferencia; solo tendrian sentido para reentrenar con la topologia de cuatro aprendices que documenta el repositorio.
- Opciones de despliegue: transformers mas peft (ruta documentada por el autor), vLLM o TGI previa fusion del adaptador en el modelo base, y llama.cpp u Ollama si se exporta el modelo fusionado a GGUF. El adaptador por si solo no es desplegable sin el modelo base.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Naturaleza | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador | 1,7 B (base) + LoRA r16 | Adaptador de investigacion sobre Qwen3-1.7B | 8.192 tokens en entrenamiento | no disponible | Repositorio publico con 0 descargas |
| Qwen/Qwen3-1.7B | 1,7 B | Modelo base denso, modos thinking y nonthinking | no disponible en la informacion proporcionada | Apache 2.0 segun la model card publica del base | Ampliamente disponible |
| Modelos pequenos de razonamiento de la misma escala (por ejemplo destilados de la familia DeepSeek-R1 sobre Qwen o Llama de 1,5-1,7 B) | 1,5-1,7 B | Modelos completos ajustados para razonamiento | variable segun variante | variable segun variante | ampliamente disponibles |
| SmolLM2-1.7B u otros transformers densos de 1,7 B | 1,7 B | Modelo completo de proposito general | variable segun variante | variable segun variante | ampliamente disponibles |

No hay datos de rendimiento publicados para este adaptador, por lo que no es posible establecer una comparacion cuantitativa con las alternativas anteriores.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar Qwen/Qwen3-1.7B en la revision exacta indicada; sin el base, los safetensors del adaptador no son utilizables.
- Sin evaluacion publicada: el propio autor declara que no se hace ninguna afirmacion de superioridad y que no hay resultados de benchmarks. No debe asumirse ninguna mejora sobre el modelo base.
- Estado de entrenamiento incierto: el plan de 4 epocas y 128 actualizaciones es solo eso, un plan; el autor indica que el numero real de actualizaciones completadas se deduce del `checkpoint_index.json`, no de la model card.
- Correccion de la respuesta distinta de la correccion del razonamiento: una respuesta final correcta no implica que cada paso intermedio sea valido. El modelo puede producir cadenas de razonamiento con pasos incorrectos.
- Modo no-pensante forzado: es imprescindible pasar `enable_thinking=False` en la plantilla de chat. La plantilla por defecto de Qwen3-1.7B activa el modo pensante, por lo que un uso descuidado degrada el comportamiento entrenado.
- Sesgos: no disponibles; no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad.
- Riesgo de alucinacion: no cuantificado, pero al tratarse de un adaptador de RL sobre un modelo de 1,7 B entrenado en un unico dominio (matematicas), la generalizacion fuera de ese dominio no esta caracterizada.
- Idiomas: no se declaran idiomas soportados; el split de entrenamiento es de problemas matematicos y se desconoce su composicion linguistica.
- Licencia: el repositorio no declara licencia, lo que impide determinar los terminos de uso comercial del adaptador. La licencia Apache 2.0 del modelo base no se extiende automaticamente a un trabajo derivado sin declaracion explicita.
- Codigo de entrenamiento no publicado: el repositorio conserva los datos de reanudacion, pero el codigo de entrenamiento se mantiene separado y no se publica, lo que limita la reproducibilidad completa.
- Madurez: cero descargas y cero likes, creado y actualizado el 16 de septiembre de 2026. Es material de investigacion sin validacion por terceros.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/sandeep123/stride-qwen3-1.7b-nonthinking-stabilized-2048-local_positive-20260916
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Revision fijada del modelo base: 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas de ayuda de Gmail sin relacion con el contenido). No se dispone de paper, blog tecnico, repositorio de codigo ni demo adicionales.

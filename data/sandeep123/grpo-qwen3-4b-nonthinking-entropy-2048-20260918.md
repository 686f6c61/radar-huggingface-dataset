# sandeep123/grpo-qwen3-4b-nonthinking-entropy-2048-20260918

## Resumen

Este repositorio contiene un adaptador LoRA entrenado con GRPO (Group Relative Policy Optimization) sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. El autor es el usuario de HuggingFace "sandeep123" y se trata de un artefacto de investigación experimental centrado en el razonamiento matemático en modo "nonthinking" (sin cadena de pensamiento explícita). El adaptador se publica como un conjunto de checkpoints inmutables en formato PEFT safetensors, cada uno con su configuración, tokenizer, chat template, metadatos de entrenamiento y manifiesto SHA256.

La innovación técnica declarada es una regularización de entropía muestreada con puerta por ventaja positiva (positive-advantage-gated sampled entropy regularization), con coeficiente 0.01, aplicada junto a la pérdida estándar de GRPO con una penalización KL de 0.01 estimada con el estimador k3. El entrenamiento está planificado para 4 épocas sobre un split de 2.048 preguntas de matemáticas, con un batch global de 64 preguntas y 8 rollouts por pregunta (512 respuestas por actualización), lo que da 32 actualizaciones por época y 128 actualizaciones planificadas. El contexto de prompt más respuesta se limita a 8.192 tokens y la semilla es 42.

Es relevante ahora porque documenta de forma extremadamente detallada y reproducible una variante concreta de GRPO con regularización de entropía, un área activa de investigación en RL para modelos de razonamiento. No obstante, el propio autor indica explícitamente que no se emite ninguna afirmación de evaluación o superioridad, que la efectividad de estos ajustes no ha sido establecida y que el repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha. Se trata, por tanto, de material de investigación, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (heredada del modelo base Qwen/Qwen3-4B-Instruct-2507); el repositorio aporta un adaptador LoRA, no pesos completos |
| Parametros totales | Aproximadamente 4.000 millones en el modelo base; el numero exacto de parametros entrenables del adaptador no esta disponible |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible para el modelo base en la informacion proporcionada; el entrenamiento limita prompt mas respuesta a 8.192 tokens |
| Tipos de cuantizacion | No disponible; solo se distribuyen adaptadores en safetensors, sin variantes GGUF ni cuantizadas publicadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | PEFT safetensors (adaptador LoRA); incluye tokenizer y chat template |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Libreria | peft |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 (revision fijada cdbee75f17c01a7cc42f958dc650907174af0554) |
| Tamano del repositorio | 1,2 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-18 |
| Ultima actualizacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre un transformer decoder denso de aproximadamente 4.000 millones de parametros. El adaptador usa rango 16, alpha 32, dropout 0 y sin sesgo, y se aplica a los modulos de proyeccion q/k/v/o y gate/up/down. Cada carpeta `checkpoint-NNNNNN/` es inmutable e incluye los pesos PEFT en safetensors, la configuracion del adaptador, el tokenizer y chat template, metadatos de entrenamiento y un manifiesto SHA256. El repositorio conserva todos los adaptadores de actualizacion de optimizador publicados, incluida la actualizacion cero (adaptador inicial sin entrenar). El `checkpoint_index.json` registra el paso de optimizador y la fraccion de epoca completada. La configuracion publica del adaptador sustituye la ruta local de la maquina por el ID del modelo en el Hub, mientras que los ficheros de checkpoint originales permanecen byte a byte sin cambios.

El entrenamiento usa GRPO con outcome reward binario (respuesta final correcta o incorrecta), estandarizacion de grupo con desviacion estandar muestral mas 1e-6, normalizacion PPO y KL sobre el total global de tokens generados, presupuesto de rollout fijo, sin remuestreo dinamico de grupo y sin format reward. La regularizacion de entropia se define como `h_t = -exp(logp_t - stopgrad(logp_t)) * logp_t` y `loss_entropy = -coefficient * mean_eligible(mean_tokens(h_t))`, con puerta de elegibilidad basada en ventaja de resultado original positiva y normalizacion sobre respuestas elegibles del total global (media real de tokens por respuesta). El estimador es un surrogate sobre tokens muestreados, no la entropia completa del vocabulario. La tasa de aprendizaje maxima es 2e-5, con 10 actualizaciones de warmup lineal (la actualizacion 1 usa 2e-6 y la 10 alcanza 2e-5) y despues tasa constante. El coeficiente KL es 0.01 con el estimador k3 `expm1(log_p_ref - log_p_policy) - (log_p_ref - log_p_policy)`, agregado sobre el mismo denominador global de tokens generados que la perdida de politica. El autor advierte de que esta es la implementacion original de GRPO k3 sin correccion de ratio de importancia y que no reclama un gradiente exacto e insesgado de KL inversa. El codigo de referencia procede del repositorio del autor `nigelyaoj/R1_zero_Div` en el commit `a381e1e5379bd58e6679dc1c8715a808930031db`. El entrenamiento renderiza explicitamente `enable_thinking=False`, dejando el tokenizer y el chat template fijados sin cambios. El dataset de entrenamiento es el mismo split de 2.048 preguntas que las ejecuciones STRIDE anteriores, aunque el credito de diversidad STRIDE esta inactivo en este repositorio.

## Capacidades

- Generacion de texto y resolucion de problemas matematicos en modo no-thinking, con el chat template configurado con `enable_thinking=False`.
- Razonamiento de un solo paso visible (sin cadena de pensamiento explicita), orientado a obtener la respuesta final correcta.
- El objeto de recompensa del entrenamiento es binario sobre la correccion de la respuesta final; no se entrena ni se verifica la validez de los pasos intermedios.
- No hay evidencia en la informacion proporcionada de capacidades de tool calling, function calling o uso de agentes especificas de este adaptador.
- No hay evidencia de capacidades multimodales (vision, audio) ni de modo "thinking" en este adaptador; de hecho, el modo thinking se desactiva de forma explicita.
- Capacidades multilingues: no disponible. El autor advierte que el tokenizer y la plantilla de chat se mantienen sin cambios respecto al modelo base.
- Capacidad especial: regularizacion de entropia muestreada con puerta por ventaja positiva, una innovacion de entrenamiento, no una capacidad de inferencia adicional.

## Casos de uso

- Investigacion en RL para matematicas: reproducir o comparar la variante GRPO con regularizacion de entropia de coeficiente 0.01 frente a otras variantes (por ejemplo, las ejecuciones STRIDE mencionadas) sobre el mismo split de 2.048 preguntas, usando los checkpoints inmutables y sus manifiestos SHA256 para garantizar trazabilidad.
- Analisis de estabilidad de entrenamiento: el ajuste esta disenado explicitamente para investigar estabilidad (KL k3, warmup de 10 actualizaciones, gate de ventaja positiva). Sirve para estudiar como evoluciona la perdida y la entropia por actualizacion de optimizador.
- Evaluacion de decodificacion no-thinking: permite medir el rendimiento de un modelo Qwen3-4B en modo sin cadena de pensamiento, util para escenarios donde se prioriza latencia y brevedad de respuesta sobre razonamiento explicito.
- Generacion de soluciones matematicas concisas: con contexto de hasta 8.192 tokens y modo no-thinking, es adecuado para producir respuestas finales cortas en tareas de tipo competicion o ejercicios de respuesta cerrada, siempre que se valide la correccion.
- Estudio de adaptadores PEFT sobre Qwen3: sirve como caso practico de como publicar adaptadores LoRA con tokenizer, chat template, metadatos y manifiestos de integridad, replicable como plantilla de ingenieria de MLOps.
- Fine-tuning incremental: el autor indica que `is_trainable=True` permite continuar el entrenamiento del adaptador con una inicializacion nueva, por lo que puede usarse como punto de partida para experimentos posteriores sobre el mismo modelo base.
- Comparacion de tecnicas de RL: al conservar la actualizacion cero (adaptador sin entrenar) y todas las actualizaciones del optimizador, permite estudiar la curva completa de aprendizaje, no solo el checkpoint final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no realiza ninguna afirmacion de evaluacion o superioridad. Tampoco se proporcionan curvas de perdida, tasas de acierto en el split de entrenamiento ni metricas de evaluacion en el material consultado.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones derivadas del tamano del modelo base, no medidas): unos 8-10 GB en bfloat16/fp16 para los pesos de 4B mas el overhead de activaciones y cache KV; aproximadamente 4,5-5 GB en cuantizacion de 8 bits; aproximadamente 2,5-3,5 GB en cuantizacion de 4 bits.
- El adaptador LoRA en si es pequeno en comparacion con el modelo base, aunque el repositorio ocupa 1,2 GB porque conserva todos los checkpoints publicados.
- GPU recomendadas: cualquier GPU con al menos 10-12 GB de VRAM para bfloat16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, L4, A10G); para mayor throughput, A100 40/80 GB, H100 o H200.
- Cabe en GPU de consumo: si. En bfloat16 cabe con holgura en una RTX 4090 (24 GB) y, con cuantizacion de 4 bits, en GPUs de 6-8 GB como RTX 3060, RTX 4060 o incluso iGPUs con memoria unificada suficiente.
- Opciones de despliegue: `transformers` + `peft` (la ruta documentada por el autor), vLLM con soporte de adaptadores LoRA, TGI con adaptadores LoRA, y, fusionando previamente el adaptador con el modelo base, llama.cpp u Ollama tras convertir a GGUF. No se publican ficheros GGUF en el repositorio.
- Latencia y throughput estimados: no disponible. No se proporcionan mediciones de tokens por segundo ni tiempos de respuesta.
- Nota de reproducibilidad: la carga documentada usa `torch_dtype=torch.bfloat16`, `device_map="auto"` y la revision fijada del modelo base `cdbee75f17c01a7cc42f958dc650907174af0554`.

## Comparativa con modelos similares

Los datos de licencia y contexto de los modelos de comparacion son de conocimiento general y no se han verificado en la busqueda web disponible; se marcan como tales. La columna de rendimiento no se puede completar porque no hay benchmarks publicados para este adaptador.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grpo-qwen3-4b-nonthinking-entropy-2048-20260918 (este modelo) | ~4B base + adaptador LoRA | No disponible (entrenamiento limitado a 8.192 tokens) | Adaptador LoRA sobre Qwen3-4B-Instruct-2507 | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | ~4B | No disponible en esta busqueda | Modelo denso completo | No disponible en esta busqueda (se cita Apache-2.0 en fuentes publicas del modelo base, sin verificar aqui) | HuggingFace |
| Qwen3-4B-Thinking-2507 | ~4B | No disponible en esta busqueda | Modelo denso con modo thinking | No disponible en esta busqueda | HuggingFace |
| DeepSeek-R1-Distill-Qwen-7B | ~7B | No disponible en esta busqueda | Modelo denso destilado con razonamiento explicito | No disponible en esta busqueda (se cita MIT en fuentes publicas, sin verificar aqui) | HuggingFace |

Comparacion cualitativa: frente al modelo base Qwen3-4B-Instruct-2507, este repositorio anade un ajuste por RL especifico para matematicas en modo sin thinking, pero no publica evaluacion que demuestre mejora. Frente a alternativas con razonamiento explicito como Qwen3-4B-Thinking-2507 o DeepSeek-R1-Distill-Qwen-7B, la diferencia clave es el modo no-thinking y el foco en respuestas finales breves, con el coste de no exponer cadena de razonamiento.

## Limitaciones y advertencias

- Artefacto experimental sin evaluacion: el autor declara explicitamente que no se emite ninguna afirmacion de evaluacion o superioridad. No hay benchmarks, curvas de aprendizaje ni tasas de acierto publicadas.
- Efectividad no establecida: el propio autor afirma que la efectividad de los ajustes de estabilidad (regularizacion de entropia, KL k3, warmup) no ha sido establecida por la existencia del repositorio.
- Verificacion incompleta del razonamiento: una respuesta final correcta no verifica cada paso intermedio de la demostracion, segun el propio autor. Esto implica riesgo de cadenas de razonamiento incorrectas con resultado correcto.
- Estimador KL: el k3 implementado no incluye correccion de ratio de importancia y no se reclama un gradiente exacto e insesgado de KL inversa.
- Discrepancia paper-codigo: el autor reconoce que el codigo publicado usa logprob actual desacoplada y puerta de ventaja positiva, mientras que la ecuacion del paper usa denominador de politica antigua y puerta de correccion.
- Modo de pensamiento desactivado: el adaptador esta entrenado con `enable_thinking=False`. Usarlo con la plantilla por defecto que active el modo thinking puede degradar el comportamiento esperado; el autor advierte de ello especialmente para Qwen3-1.7B.
- Licencia no disponible: no se especifica licencia en la informacion proporcionada, lo que impide determinar si el uso comercial esta permitido. Se debe contactar con el autor o revisar el repositorio antes de cualquier uso en produccion.
- Idiomas no disponibles: no se documentan los idiomas soportados ni el comportamiento multilingue del adaptador.
- Descargas y adopcion nulas: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso externo ni validacion por terceros.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas, pero al ser un modelo de 4B ajustado para respuesta final corta, la probabilidad de respuestas plausibles pero incorrectas en matematicas debe considerarse alta y requiere verificacion externa.
- Sesgos: no se documenta ningun analisis de sesgos en la informacion proporcionada.
- Datos de entrenamiento limitados: el split de entrenamiento es de 2.048 preguntas, un conjunto reducido que puede favorecer el sobreajuste al formato y a ese dominio concreto.
- Entrenamiento planificado frente a completado: el autor senala que los epochs planificados no implican que el entrenamiento haya finalizado; la completitud debe verificarse en `checkpoint_index.json`.
- Contexto de trabajo: aunque el modelo base pueda tener una ventana mayor, el entrenamiento limita prompt mas respuesta a 8.192 tokens, por lo que el comportamiento fuera de ese rango no esta validado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/grpo-qwen3-4b-nonthinking-entropy-2048-20260918
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de codigo de referencia del autor (R1_zero_Div): https://github.com/nigelyaoj/R1_zero_Div
- Commit de referencia del codigo: a381e1e5379bd58e6679dc1c8715a808930031db
- Revision fijada del modelo base: cdbee75f17c01a7cc42f958dc650907174af0554
- Busqueda web: los resultados devueltos corresponden a enlaces genericos de YouTube y no guardan relacion con el modelo; no se han encontrado papers, blogs, repositorios ni demos adicionales relevantes.

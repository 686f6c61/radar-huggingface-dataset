# sandeep123/stride-qwen3-1.7b-nonthinking-stabilized-2048-grpo-20260916

## Resumen

Este repositorio publica un adaptador LoRA entrenado con GRPO sobre el modelo base Qwen/Qwen3-1.7B, orientado exclusivamente a la resolucion de problemas matematicos en modo "nonthinking" (es decir, sin cadena de pensamiento explicita). Lo desarrolla el usuario sandeep123 y forma parte de una serie de experimentos denominada STRIDE. El objetivo declarado del autor no es superar a ningun modelo, sino estudiar la estabilidad del entrenamiento con GRPO aplicando una tasa de aprendizaje mas baja (pico de 2e-5), un calentamiento lineal de 10 actualizaciones del optimizador y una penalizacion KL de 0,01 frente a la politica base congelada.

El adaptador se inicializa desde cero sobre el modelo base fijado en el commit 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e y no es continuacion de un adaptador anterior. El entrenamiento previsto es de 4 epocas sobre una particion de 2048 preguntas, con un lote global de 64 preguntas y 8 rollouts por pregunta (512 respuestas por actualizacion), lo que da 32 actualizaciones por epoca y 128 actualizaciones planificadas. La ventana de prompt mas respuesta esta limitada a 8192 tokens y la semilla aleatoria es 42.

Su relevancia es acotada y muy especifica: sirve como referencia reproducible de infraestructura de RL para modelos pequenos de matematicas, con checkpoints inmutables versionados y estado de reanudacion completo. No incluye evaluacion publicada, no declara licencia y no se ha publicado el conjunto de datos ni el codigo de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: Qwen/Qwen3-1.7B. El repositorio no describe modificaciones estructurales del modelo base |
| Parametros totales | 1,7 B en el modelo base; el adaptador LoRA usa rango 16 sobre los modulos q/k/v/o y gate/up/down (recuento exacto de parametros del adaptador no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens de tope para prompt + respuesta durante el entrenamiento. La ventana maxima del modelo base no se detalla en la informacion proporcionada |
| Tipos de cuantizacion | No se publican pesos cuantizados; el repositorio solo contiene safetensors del adaptador. Cualquier cuantizacion requeriria fusionar el adaptador con el modelo base y convertirla por cuenta propia |
| Idiomas soportados | No disponible. El autor solo indica entrenamiento sobre problemas matematicos, sin detallar el idioma del conjunto de entrenamiento |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA). Los pesos del modelo base no se incluyen en el repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-1.7B, un transformer decoder-only, sobre el que se aplica un adaptador LoRA con rango 16, alpha 32, dropout 0 y sin sesgo, actuando sobre las proyecciones q, k, v, o y gate, up, down. El adaptador es independiente del modelo base: se inicializa desde cero con el modelo base fijado y no continua ningun adaptador previo de la serie STRIDE. El autor configura un alpha de STRIDE de 1, separado del alpha de LoRA de 32, pero aclara que el entrenamiento GRPO no utiliza la bonificacion de diversidad de STRIDE.

El entrenamiento emplea GRPO con correccion de respuestas estandarizada por grupo. La tasa de aprendizaje tiene un pico de 2e-5, con 10 actualizaciones del optimizador de calentamiento lineal (la actualizacion 1 usa 2e-6 y la 10 alcanza 2e-5) seguido de tasa constante; el calentamiento se indexa por actualizaciones absolutas completadas, de modo que una reanudacion exacta no lo reinicia. Se aplica un coeficiente KL de 0,01 con el estimador k3 original de GRPO, `expm1(log_p_ref - log_p_policy) - (log_p_ref - log_p_policy)`, penalizando la deriva respecto a la politica base congelada; el autor advierte que esta implementacion no incluye la correccion por cociente de importancia y no reclama un gradiente insesgado de la KL inversa exacta. El plan declara 4 epocas, 2048 preguntas, lote global de 64 preguntas con 8 rollouts (512 respuestas por actualizacion), 32 actualizaciones por epoca y 128 actualizaciones previstas, con semilla 42 y contexto limitado a 8192 tokens.

El aspecto mas cuidado del repositorio es la trazabilidad: cada carpeta inmutable `checkpoint-NNNNNN/` contiene pesos PEFT en safetensors, configuracion del adaptador, tokenizador y plantilla de chat, metadatos de entrenamiento y un manifiesto SHA256, con un commit distinto por checkpoint. Se publica tambien `latest-resume/`, con el estado del optimizador Adam, la semilla por rango, el adaptador correspondiente, el contrato cientifico original y el inventario de hashes, ademas de `latest_resume.json` para identificar el paso. El codigo de entrenamiento, las preguntas de entrenamiento y los rollouts no se publican. La plantilla de chat se invoca explicitamente con `enable_thinking=False`, tanto en entrenamiento como en inferencia recomendada.

## Capacidades

- Generacion de texto y resolucion de problemas matematicos en modo nonthinking, es decir, emitiendo la respuesta final sin cadena de pensamiento visible.
- Entrenamiento especifico con GRPO sobre recompensa de correccion de la respuesta final, lo que favorece respuestas finales correctas en tareas de tipo respuesta unica.
- Reutilizacion como politica inicial o punto de partida para experimentos de RL con verificadores matematicos.
- Compatibilidad con el ecosistema PEFT: el adaptador se puede cargar con `PeftModel`, desactivar con `is_trainable=False` para inferencia o reactivar con `is_trainable=True` para entrenamiento posterior con un optimizador nuevo.
- Soporte de la plantilla de chat de Qwen3 con el conmutador explicito `enable_thinking`, obligatorio para reproducir el modo de entrenamiento.
- Capacidades multilingues: no disponible; no se documenta el idioma ni la cobertura linguistica del adaptador.
- Tool calling, function calling, uso de agentes, razonamiento multi-paso explicito, vision y audio: no disponibles ni declarados en la informacion proporcionada.
- No se declara modo de pensamiento (thinking) en este adaptador; de hecho, el entrenamiento se realiza con el modo desactivado.

## Casos de uso

- Generacion de soluciones matematicas de un solo paso final: el adaptador esta entrenado para devolver respuestas finales correctas sin razonamiento intermedio, util en canales donde solo se evalua el resultado (por ejemplo, plataformas de ejercicios con correccion automatica).
- Generacion de datos sinteticos para verificadores: al producir respuestas finales en modo nonthinking, se puede usar como politica de muestreo para construir pares pregunta-respuesta que alimenten entrenamientos de recompensa o clasificadores de correccion.
- Estudio de estabilidad de GRPO: con receta documentada (tasa 2e-5, calentamiento de 10 pasos, KL 0,01, k3) y checkpoints inmutables, sirve como linea base reproducible para comparar variantes de RL en modelos de 1,7 B.
- Docencia y practica de matematicas en entornos con recursos limitados: al ser un adaptador de 1,7 B, puede desplegarse en una GPU de consumo y responder ejercicios de nivel escolar o de competicion basica, siempre que se acepte la ausencia de evaluacion publicada.
- Integracion en pipelines de RLHF/RLVR como politica inicial: el repositorio incluye el estado de reanudacion completo (`latest-resume/`) con optimizador Adam y semillas por rango, lo que facilita continuar o ramificar el entrenamiento bajo el mismo contrato cientifico.
- Auditoria de reproducibilidad en investigacion: los manifiestos SHA256, el indexado de pasos y la separacion entre adaptador de inferencia y estado de reanudacion permiten verificar artefactos y comparar actualizaciones concretas del optimizador.
- Evaluacion comparativa de metodos de RL (STRIDE frente a GRPO puro): dado que el autor mantiene el alpha de STRIDE configurado pero sin bonificacion de diversidad, el repositorio permite contrastar ambas configuraciones sobre los mismos datos y presupuesto de computo.
- Prototipado local en estaciones de trabajo sin GPU de datacenter: el tamano del modelo permite iterar sobre prompts y plantillas de chat con latencia baja en tarjetas de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no realiza ninguna afirmacion de evaluacion ni de superioridad, y advierte que las respuestas finales correctas no verifican cada paso intermedio de la demostracion. Tampoco se publican curvas de recompensa, tasas de acierto por checkpoint ni comparaciones con otros adaptadores de la serie.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 4-6 GB en bfloat16 para el modelo base de 1,7 B mas el adaptador (el adaptador LoRA en rango 16 anade un coste marginal); con cuantizacion de 4 bits el conjunto puede bajar a unos 2-3 GB, aunque el repositorio no distribuye pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bfloat16 (RTX 3060, RTX 4060, RTX 2070, Tesla T4). Para entrenamiento o evaluacion por lotes conviene una A100, H100, L40S o RTX 4090, especialmente si se generan 8 rollouts por pregunta.
- Compatibilidad con GPU de consumo: si. El modelo cabe con holgura en tarjetas de 8 GB o mas en bfloat16, y en 6 GB usando cuantizacion de 4 bits tras fusionar el adaptador.
- Opciones de despliegue: `transformers` + `peft` es la via documentada por el autor; vLLM y TGI permiten cargar adaptadores LoRA sobre el modelo base; llama.cpp, Ollama u otros runners requieren fusionar el adaptador con el modelo base y convertir a GGUF, procedimiento que no se documenta en el repositorio.
- Latencia y throughput estimados: no disponible. El repositorio no publica mediciones de latencia, tokens por segundo ni rendimiento de servicio.
- Nota sobre el optimizador: reanudar el entrenamiento original requiere los ficheros locales `state_NNN` de optimizador y RNG, el adaptador correspondiente, el manifiesto, el contrato cientifico y la topologia de cuatro aprendices; extender el plan mas alla de 4 epocas exige el flag `--allow-epoch-extension` y mantener el resto de campos del contrato identicos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (stride-qwen3-1.7b-nonthinking-stabilized-2048-grpo-20260916) | 1,7 B de base + LoRA rango 16 | 8192 tokens de tope en entrenamiento | Adaptador LoRA para matematicas en modo nonthinking | No disponible | Repositorio publico con 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3-1.7B (modelo base) | 1,7 B | No detallado en la informacion proporcionada | Transformer decoder-only generalista con modo thinking conmutable | No indicada en la informacion proporcionada | Modelo base publico, referenciado y fijado por commit en este repositorio |
| Qwen2.5-Math-1.5B | 1,5 B | No disponible en la informacion proporcionada | Modelo especializado en matematicas | No verificado en la informacion proporcionada | Modelo publico de la familia Qwen |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | No disponible en la informacion proporcionada | Modelo destilado con razonamiento explicito | No verificado en la informacion proporcionada | Modelo publico de DeepSeek |

La comparacion cuantitativa de rendimiento no es posible: el autor no publica benchmarks y advierte que no reclama superioridad sobre ninguna alternativa. Las filas de modelos de terceros se incluyen como referencia de categoria (modelos pequenos de matematicas en el rango de 1,5-1,7 B) y sus celdas marcadas como no verificadas no deben tomarse como datos confirmados en esta ficha. La diferencia funcional principal de este adaptador frente a las alternativas es el modo nonthinking obligatorio y su orientacion a infraestructura de RL reproducible mas que a rendimiento final.

## Limitaciones y advertencias

- Ausencia de licencia: el repositorio no declara licencia, lo que impide asumir derechos de uso comercial y supone un riesgo legal para cualquier despliegue en produccion.
- Ausencia de evaluacion: no hay benchmarks, tasas de acierto ni curvas de recompensa publicadas; el autor declara expresamente que no hace ninguna afirmacion de evaluacion ni de superioridad.
- Ambito muy estrecho: el entrenamiento se limita a matematicas, sobre 2048 preguntas, con 4 epocas planificadas y respuesta final como unica senal de recompensa. Es previsible un deterioro en tareas generales o conversacionales.
- Verificacion incompleta del razonamiento: el propio autor advierte que una respuesta final correcta no verifica cada paso intermedio de la demostracion, por lo que el adaptador no es fiable como generador de demostraciones verificables.
- Dependencia de un conmutador explicito: hay que invocar la plantilla con `enable_thinking=False` en inferencia; la plantilla por defecto de Qwen3-1.7B activa el modo thinking, lo que produciria un comportamiento distinto al del entrenamiento.
- Ruido experimental declarado: la implementacion de la KL usa el estimador k3 sin correccion por cociente de importancia y el autor no reclama un gradiente insesgado, por lo que la efectividad de los ajustes de estabilidad no esta establecida.
- Datos y codigo no publicados: las preguntas de entrenamiento, los rollouts y el codigo de entrenamiento se excluyen del repositorio, lo que impide reproducir el experimento de extremo a extremo sin el entorno local original.
- Adopcion nula y trazabilidad temporal dudosa: el repositorio registra 0 descargas y 0 likes, y las fechas de creacion y actualizacion (16 de septiembre de 2026) conviene tratarlas con cautela al citarlas.
- Riesgo de alucinacion: inherente a un modelo de 1,7 B sin verificador en tiempo de inferencia; no hay evaluacion que cuantifique la tasa de error.
- Checkpoint cero incluido: el repositorio conserva todos los adaptadores publicados de actualizacion, incluido el adaptador inicial sin entrenar; hay que seleccionar explicitamente la carpeta `checkpoint-NNNNNN/` correcta desde `checkpoint_index.json`.
- Sesgos e idiomas: no disponibles; no se documenta la composicion del conjunto de entrenamiento ni su cobertura linguistica.
- Restriccion de reanudacion: continuar el entrenamiento original exige los ficheros de estado del optimizador y RNG, la misma topologia y el mismo contrato cientifico; extender el numero de epocas requiere una bandera especifica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/stride-qwen3-1.7b-nonthinking-stabilized-2048-grpo-20260916
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Revision fijada del modelo base: 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada
- Documentacion adicional: no disponible

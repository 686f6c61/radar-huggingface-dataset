# mrm8488/Qwen3.8-27B-ft-decision

## Resumen

Qwen3.8-27B-ft-decision es un ajuste fino supervisado del modelo Qwen/Qwen3.8-27B publicado por el usuario mrm8488. A diferencia de un clasificador convencional, el modelo recibe texto libre (un ticket de soporte, una traza de agente, una factura, una alerta de seguridad) junto con un esquema de preguntas tipadas, y devuelve para cada pregunta una distribucion de probabilidad calibrada sobre sus respuestas posibles, en lugar de una unica etiqueta. Los tres tipos de pregunta soportados son `choice` (elegir una opcion entre criterios nombrados), `noul` (decision binaria si/no) y `score` (escala ordinal, con puntuacion esperada asociada).

El entrenamiento se realizo sobre el dataset LocalLLaMA/typed-decisions, compuesto por unas 1.600 muestras repartidas en cuatro flujos de trabajo (agent_trace_observability, customer_service, invoice_processing y security_incidents). Las etiquetas de referencia son distribuciones blandas agregadas a partir de varios anotadores, de modo que el modelo se optimiza para reproducir la distribucion completa y no solo el argmax. El resultado declarado en la model card es un salto de 43,25% a 81,95% de exactitud por pregunta respecto al modelo base, con un ECE que baja de 0,1335 a 0,0361.

La relevancia de esta ficha esta en dos puntos concretos: por un lado, es un ejemplo de modelo orientado a decisiones estructuradas y calibradas, pensado para umbralizacion y escalado a revision humana; por otro, el repositorio esta etiquetado como adaptador LoRA sobre Qwen3.8-27B aunque contiene 27.781.427.952 parametros en safetensors con un tamano de 55,8 GB. El modelo tiene licencia Apache 2.0, soporta unicamente ingles y fue entrenado con una longitud de contexto maxima de 4.096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (etiqueta `qwen3_5`); detalle de atencion no disponible |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no aplica (no se documenta arquitectura MoE) |
| Longitud de contexto | 4.096 tokens (limite usado en entrenamiento) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; el repositorio solo incluye safetensors en precision completa) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 55,8 GB) |
| Pipeline declarado | zero-shot-classification |
| Modelo base | Qwen/Qwen3.8-27B |
| Dataset de entrenamiento | LocalLLaMA/typed-decisions (subconjunto `all`) |

## Arquitectura y entrenamiento

La model card no describe en detalle la arquitectura interna. Se trata de un transformer decoder-only heredado del modelo base Qwen/Qwen3.8-27B, sin que se documenten innovaciones de atencion, decodificacion especulativa ni mecanismos hibridos. La innovacion real esta en la interfaz de salida: el modelo no genera texto libre, sino distribuciones de probabilidad estructuradas sobre esquemas de preguntas tipadas (`choice`, `noul`, `score`). El ajuste se realizo con LoRA de rango 16, alpha 16, dropout 0 y gradient checkpointing de Unsloth, con semilla 3407. Los metadatos del repositorio etiquetan el modelo base como adaptador (`base_model:adapter:Qwen/Qwen3.8-27B`), pero el repositorio contiene pesos safetensors completos de 27.781.427.952 parametros.

La configuracion de entrenamiento fija batch efectivo de 32 (batch por dispositivo 32, acumulacion de gradientes 1), 4 epocas, learning rate 2e-4 con scheduler coseno, weight decay 0,01, warmup de 10 pasos y precision bf16 (con retroceso a fp16). La perdida de validacion desciende en cada epoca (0,837701 en la primera; 0,829434 en la cuarta), por lo que el mejor checkpoint coincide con el ultimo. El dataset es sintetico, en ingles, con etiquetas blandas agregadas de varios anotadores, lo que implica que parte del desacuerdo entre anotadores queda reflejado como incertidumbre en el objetivo de entrenamiento.

## Capacidades

- Clasificacion con esquema definido por el usuario: acepta preguntas de tipo `choice` con criterios nombrados, `noul` binarias y `score` ordinales, y devuelve una distribucion calibrada por pregunta.
- Salida probabilistica calibrada: el ECE declarado en el conjunto de prueba es 0,0361, lo que habilita umbralizacion por confianza.
- Puntuacion esperada en escalas ordinales: para preguntas de tipo `score` devuelve ademas el valor esperado de la escala.
- Clasificacion zero-shot sobre esquemas nuevos: al definirse las preguntas en el prompt de entrada, el esquema no esta fijado a las cuatro tareas del dataset de entrenamiento.
- Aplicable a trazas de agentes y flujos de computer use (etiquetas `agents`, `browser-agent`, `computer-use`), aunque no se documenta ninguna integracion concreta.
- Soporte de inferencia en vLLM (etiqueta `vllm`) y mediante la API `FastDecisionModel` de Unsloth.
- Capacidades multilingues: no disponibles; el modelo se entreno y se evaluo unicamente en ingles.
- Tool calling, function calling y razonamiento multi-paso: no documentados en la informacion disponible. El modelo esta orientado a decisiones estructuradas, no a generacion de texto o codigo.
- Vision y audio: no disponibles.

## Casos de uso

- Enrutado de tickets de soporte: definir preguntas `choice` sobre el equipo responsable (facturacion, tecnico, ventas) y preguntas `noul` sobre intenciones concretas (por ejemplo, si el cliente pide reembolso). La distribucion devuelta permite enviar a cola humana los tickets cuya confianza quede por debajo de un umbral, en lugar de forzar una asignacion con el argmax.
- Triaje con prioridad ordinal: usar preguntas `score` para graduar urgencia o severidad y consumir la puntuacion esperada como variable de ordenacion en la cola de trabajo.
- Procesamiento de facturas: clasificar facturas entrantes por tipo, detectar duplicados o disputas y derivar a revision manual los casos ambiguos, aprovechando que las etiquetas de referencia del entrenamiento incluyen el flujo `invoice_processing`.
- Deteccion y clasificacion de incidentes de seguridad: preguntas binarias y de eleccion sobre severidad, vector de ataque o necesidad de escalado, con umbral de confianza para escalar a un analista, segun el flujo `security_incidents` del dataset.
- Observabilidad de trazas de agentes: anotar automaticamente trazas (`agent_trace_observability`) con categorias de fallo, exito de herramienta o necesidad de reintento, generando distribuciones que permiten medir incertidumbre por traza.
- Toma de decisiones en agentes de navegador: dado un estado o traza, devolver la accion o categoria mas probable con su probabilidad asociada, para politicas que necesiten abstenerse cuando la confianza es baja.
- Anotacion asistida y control de calidad de etiquetado: comparar las distribuciones del modelo con las de anotadores humanos permite localizar casos genuinamente ambiguos, ya que las etiquetas de referencia son agregados de varios anotadores.
- Filtrado previo en pipelines de revision: sustituir reglas heuristicas por umbrales sobre probabilidades calibradas en colas de revision de facturas, alertas o tickets.

## Benchmarks y rendimiento

Datos publicados en la model card, evaluados con cuatro metricas: exactitud por pregunta, exactitud por registro (todas las preguntas de un registro correctas), ECE (menor es mejor) y perdida de entropia cruzada frente a las distribuciones blandas de referencia.

| Modelo | Exactitud | Exactitud por registro | ECE | Perdida |
|---|---|---|---|---|
| Qwen3.8-27B (base, sin ajuste) | 43,25% | 1,25% | 0,1335 | 1,209 |
| Qwen3.8-27B-ft-decision (conjunto de prueba) | 81,95% | 42,0% | 0,0361 | 1,308 |

Observaciones: la exactitud por pregunta mejora 38,7 puntos porcentuales y la exactitud por registro pasa de 1,25% a 42,0%. La perdida de entropia cruzada es ligeramente superior a la del modelo base (1,308 frente a 1,209) pese a la mejora en exactitud y calibracion, un dato que la model card no desglosa. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en precision completa (bf16/fp16): aproximadamente 56 GB solo para pesos, mas cache KV y overhead; en la practica, 60-70 GB. Requiere A100 80 GB, H100 80 GB o particionado en varias GPU.
- VRAM en cuantizacion de 8 bits (estimacion teorica, no publicada por el autor): unos 28 GB de pesos, mas cache KV; encaja en A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB.
- VRAM en cuantizacion de 4 bits (estimacion teorica, no publicada por el autor): aproximadamente 14-16 GB de pesos, lo que permitiria ejecutarlo en una unica RTX 4090, RTX 3090 o RTX 5090, con margen limitado por la cache KV.
- No se han publicado variantes GGUF, GPTQ ni AWQ, por lo que el uso en consumer GPU depende de cuantizar el modelo por cuenta propia o de disponer de 48 GB o mas de VRAM.
- Opciones de despliegue documentadas: vLLM (etiqueta del repositorio) y la API `FastDecisionModel` de Unsloth con `max_seq_length = 4096`. No se documentan integraciones con Ollama, llama.cpp ni TGI.
- El limite de contexto de 4.096 tokens durante el entrenamiento acota el tamano de las entradas; trazas de agente largas requeriran truncado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-ft-decision | 27.781.427.952 | 4.096 tokens | 81,95% exactitud por pregunta; 42,0% por registro; ECE 0,0361 | Apache 2.0 | HuggingFace, safetensors |
| Qwen3.8-27B (base) | no disponible en la informacion | no disponible | 43,25% exactitud por pregunta; 1,25% por registro; ECE 0,1335 | Apache 2.0 (heredada del modelo base, no confirmada en la informacion) | HuggingFace |
| mrm8488/Qwen3.5-0.8B-ft-decision-8k | no disponible en la informacion (denominacion 0,8B) | contexto de 8.000 tokens segun el nombre del modelo | no disponible | no disponible | HuggingFace |

No se dispone de datos sobre otros modelos comparables de clasificacion calibrada por esquema en la informacion proporcionada.

## Limitaciones y advertencias

- Los datos de entrenamiento son sinteticos y solo en ingles; cabe esperar una precision menor en entradas reales, ruidosas o en otros idiomas.
- La exactitud por registro es del 42,0% en el conjunto de prueba, muy inferior a la exactitud por pregunta. Cualquier accion que dependa de que varias respuestas sean correctas a la vez debe condicionarse a las probabilidades por pregunta y no al argmax conjunto.
- Las etiquetas de referencia reflejan desacuerdo entre anotadores: las predicciones de baja confianza suelen corresponder a casos genuinamente ambiguos mas que a errores del modelo.
- No se publican benchmarks estandar, solo la evaluacion sobre el conjunto de prueba del propio dataset de entrenamiento, con 1.600 registros en total; el riesgo de sobreajuste al dominio de ese dataset es alto.
- La perdida de entropia cruzada es superior a la del modelo base pese a la mejora en exactitud y calibracion, un comportamiento que la model card no explica.
- La longitud de contexto de entrenamiento es de 4.096 tokens; las entradas largas, como trazas de agente extensas, requeriran truncado.
- El autor recomienda validar el rendimiento sobre flujos y esquemas propios antes de desplegarlo en produccion.
- Los metadatos etiquetan el modelo como adaptador LoRA sobre Qwen/Qwen3.8-27B, mientras que el repositorio incluye pesos safetensors con 27.781.427.952 parametros; conviene verificar el metodo de carga antes de integrarlo.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.8-27B deben respetarse tambien los terminos del modelo base.
- El repositorio no registra descargas ni valoraciones (0 descargas, 0 likes) en la informacion disponible, por lo que no existe evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrm8488/Qwen3.8-27B-ft-decision
- Dataset de entrenamiento: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Modelo hermano de menor tamano: https://huggingface.co/mrm8488/Qwen3.5-0.8B-ft-decision-8k
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Resultados de busqueda web: no se han encontrado enlaces relevantes (papers, blogs, repositorios o demos) sobre este modelo en la informacion proporcionada; las busquedas devolvieron exclusivamente resultados sin relacion con el modelo.

# anhdao69/SimpleMemVLN-R2R-RxR15deg-FullContext-B

## Resumen

SimpleMemVLN joint R2R + RxR_15deg FullContext+B es un punto de control intermedio (mid-schedule snapshot) de un ajuste fino conjunto sobre el modelo base Qwen/Qwen3.5-4B, publicado por el usuario anhdao69 en HuggingFace. El modelo esta especializado en vision-language navigation (VLN): recibe observaciones visuales de un entorno y emite acciones de navegacion en formato de texto, siguiendo el esquema de un cabezal de accion nativo sobre el backbone LLM (opcion B, con historial de acciones gold).

Se trata de un modelo de aproximadamente 4.000 millones de parametros (heredados del base Qwen3.5-4B) con vision encoder congelado y backbone de texto entrenable. El entrenamiento combina datos conjuntos de R2R y trayectorias de RxR_15deg con guias en ingles, usando contexto completo (full-context causal attention) sin truncamiento de trayectoria ni TBPTT. La relevancia actual es acotada: no es un modelo final ni evaluado, sino una instantanea de un run coseno de dos epocas detenido en la actualizacion 3852.

El propio autor advierte que el modelo aun no ha sido evaluado en Habitat y que la perdida de entrenamiento no es una metrica de exito en navegacion. Ademas, los pesos son pesos de wrapper de navegacion, no un state dictionary estandar de AutoModel, por lo que requieren un cargador especifico del proyecto SimpleMemVLN. El repositorio ocupa 10,4 GB y no declara licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) para navegacion: backbone de texto Qwen3.5-4B con vision encoder y merger congelados, cabezal de accion nativo sobre el LLM (opcion B); atencion causal de contexto completo |
| Parametros totales | no disponible con precision; modelo base de ~4.000 millones de parametros (Qwen/Qwen3.5-4B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; se especifica atencion causal de contexto completo sin truncamiento de trayectoria, pero no se declara un limite numerico |
| Tipos de cuantizacion | no disponible (entrenamiento en BF16; no se publican variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible oficialmente; los datos de entrenamiento son instrucciones y guias en ingles (R2R y RxR_15deg en ingles) |
| Licencia | no disponible (no declarada en la model card ni en los metadatos del repositorio) |
| Formato de pesos | no disponible de forma explicita; se publican pesos de wrapper de navegacion junto con model, processor y tokenizer, con hashes en SHA256SUMS.json (formato de fichero no declarado en la informacion disponible) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) y le anade una pila de vision con encoder y merger congelados, manteniendo entrenables el backbone de texto y el cabezal LLM. La salida no es texto libre, sino acciones de navegacion serializadas mediante el esquema `vln_append_only_chat_v1`, con un cabezal nativo de accion en texto (opcion B) y uso de historial de acciones gold. La atencion es causal de contexto completo, sin truncamiento de trayectoria ni entrenamiento por retropropagacion a traves del tiempo (TBPTT).

El entrenamiento es un ajuste fino conjunto con datos de R2R y trayectorias RxR_15deg con guias en ingles, sobre episodios completos. Se uso BF16, ZeRO-2, gradient checkpointing no reentrante con offload de activaciones para secuencias largas, batch global de 8 (cuatro GPU H100, un episodio por rank, GAS 2), dos epocas, 7704 actualizaciones de optimizacion, 232 de warmup, LR pico de 5e-6 con decaimiento coseno hasta el 10% del pico, weight decay 0.01 y semilla 429. La perdida es entropia cruzada media por token de accion, incluyendo el terminador del asistente, normalizada sobre las acciones de la ventana de acumulacion distribuida. El snapshot publicado corresponde a `epoch-1/` (actualizacion 3852) de un run de dos epocas; la segunda epoca no forma parte de esta publicacion. El alineamiento "observacion antes de accion" se declara, pero no se ha verificado de forma independiente contra el codigo del colector ni mediante replay en Habitat.

## Capacidades

- Generacion de acciones de navegacion en formato textual a partir de observaciones visuales, dentro del esquema SimpleMemVLN.
- Procesamiento de episodios completos de navegacion en contexto largo, sin truncamiento de trayectoria.
- Seguimiento de instrucciones de navegacion en lenguaje natural, en el formato de R2R y RxR (guias en ingles).
- Integracion de historial de acciones gold durante el entrenamiento como senal auxiliar.
- Vision-lenguaje: consumo de observaciones visuales del entorno mediante encoder y merger congelados.
- No se documenta soporte de tool calling, function calling, agentes genericos, audio ni modos de razonamiento explicito (thinking mode) en la informacion disponible.
- Capacidades multilingues: no disponibles; los datos declarados son en ingles.

## Casos de uso

- Evaluacion de investigacion en VLN: servir como punto de partida reproducible (hash de origen, manifiesto y SHA256SUMS) para reproducir o comparar recetas de ajuste conjunto R2R + RxR_15deg en Habitat.
- Estudios de ablacion sobre contexto completo: al no truncar trayectoria, permite analizar el efecto del contexto largo en la prediccion de acciones frente a esquemas con TBPTT.
- Analisis de estabilidad de entrenamiento: la instantanea intermedia (actualizacion 3852 de 7704) es util para estudiar la evolucion de la perdida por accion y la dinamica del schedule coseno.
- Desarrollo de pipelines de navegacion simulada: el modelo puede integrarse en un bucle de observacion-accion dentro de un simulador, siempre que se use el cargador especifico del proyecto.
- Investigacion sobre serializacion de acciones: el esquema `vln_append_only_chat_v1` y el cabezal de accion nativo sirven como referencia para disenar formatos de accion basados en tokens.
- Comparacion de guias en ingles (R2R y RxR): permite estudiar diferencias entre tipos de instruccion en tareas de seguimiento de instrucciones de navegacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "Not yet evaluated in Habitat. Training loss is not a navigation success metric." No se proporcionan metricas de exito de navegacion (SR, SPL, NE), ni resultados en MMLU, HumanEval, GSM8K u otros, y no se deben inferir a partir de la perdida de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por el tamano base de 4.000 millones de parametros: en BF16 en torno a 8-10 GB solo de pesos, mas el coste del encoder de vision y del contexto largo (que puede elevar el consumo de memoria de activaciones de forma notable); en cuantizacion INT8 en torno a 5-6 GB y en INT4 en torno a 3-4 GB, aunque no se publican pesos cuantizados.
- GPU recomendadas: para entrenamiento se declaran cuatro NVIDIA H100. Para inferencia no se especifica ninguna; una GPU con 16-24 GB (por ejemplo RTX 4090, A100 40 GB) es un punto de partida razonable para BF16, sujeto a verificacion empírica.
- Compatibilidad con GPU de consumo: probable en modelos de 24 GB y posible en 16 GB con precision reducida, pero no confirmado por el autor.
- Opciones de despliegue: requiere el cargador especifico `qwen_vl.train.vln_runtime.load_checkpoint(epoch_directory, base_model_path)` con el snapshot base fijado. No es un state dictionary estandar, por lo que no se puede cargar directamente con AutoModel, y no hay confirmacion de compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 10,4 GB.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. Unica referencia contrastable: el modelo base del que deriva.

| Modelo | Parametros | Contexto | Rendimiento VLN | Licencia |
|---|---|---|---|---|
| SimpleMemVLN-R2R-RxR15deg-FullContext-B | ~4B (base Qwen3.5-4B) | no disponible (contexto completo, sin limite declarado) | no evaluado en Habitat | no disponible |
| Qwen/Qwen3.5-4B (modelo base) | ~4B | no disponible en esta informacion | no aplica (modelo generalista, no VLN) | no disponible en esta informacion |

Otros modelos comparables de navegacion vision-lenguaje: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo no evaluado: el autor indica explicitamente que no se ha evaluado en Habitat y que la perdida de entrenamiento no es una metrica de exito en navegacion.
- Instantanea intermedia: `epoch-1/` es un punto medio de un run coseno de dos epocas. No es un modelo de una epoca programado de forma independiente, y la segunda epoca no se publica.
- Pesos no estandar: son pesos de wrapper de navegacion, no un state dictionary plano de AutoModel; requieren el cargador del proyecto SimpleMemVLN y el snapshot base fijado. Cargarlos de otra forma puede fallar o dar resultados incorrectos.
- Alineamiento no verificado: la alineacion observacion-antes-de-accion se declara, pero no se ha comprobado de forma independiente contra el codigo del colector ni mediante replay en Habitat.
- Licencia no declarada: al no especificarse licencia, el uso comercial queda en una situacion de incertidumbre legal y no puede asumirse permitido.
- Idiomas: los datos declarados son en ingles (R2R y guias inglesas de RxR); el comportamiento en otros idiomas no esta documentado.
- Sesgos y dominio: al entrenarse sobre R2R y RxR, hereda los sesgos y las limitaciones de esos dataset de navegacion en interiores; el comportamiento fuera de ese dominio no esta caracterizado.
- Riesgo de alucinacion: al predecir acciones como tokens de texto, existe riesgo de generar secuencias de accion invalidas o inconsistentes con la observacion, agravado por la ausencia de evaluacion.
- Contexto largo: el uso de contexto completo sin truncamiento aumenta el coste de memoria y el tiempo de inferencia en episodios largos; no se documentan limites ni degradacion.
- Reproducibilidad: solo se publican modelo, processor, tokenizer, procedencia y metadatos de entrenamiento seleccionados; el estado del optimizador, el estado RNG, las imagenes del dataset y las credenciales permanecen locales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anhdao69/SimpleMemVLN-R2R-RxR15deg-FullContext-B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog, repositorio o demo del proyecto SimpleMemVLN: no disponible en la informacion proporcionada.
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces obtenidos no guardan relacion con el mismo.

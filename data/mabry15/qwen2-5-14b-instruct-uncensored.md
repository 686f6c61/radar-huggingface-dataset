# Mabry15/Qwen2.5-14B-Instruct-Uncensored

## Resumen

Qwen2.5-14B-Instruct-Uncensored es un ajuste fino (fine-tune) del modelo denso Qwen2.5-14B-Instruct, publicado por el usuario Mabry15 en HuggingFace. Su objetivo declarado es eliminar las restricciones de alineamiento del modelo original: segun la propia model card, el autor entrenó el dataset Orion-zhen/meissa-unalignments "sobre un system prompt especifico", de modo que el modelo solo muestra su comportamiento sin filtros cuando se le asigna el prompt de sistema indicado. No se trata, por tanto, de un modelo nuevo ni de una arquitectura distinta, sino de una variante de pesos del checkpoint de Qwen.

Tecnicamente hereda todas las caracteristicas del Qwen2.5-14B-Instruct: transformer decoder-only denso de 14.770.033.664 parametros, atencion con Grouped Query Attention, contexto nativo de 32.768 tokens (ampliable a 131.072 con YaRN segun la documentacion de Qwen) y soporte de 13 idiomas. El repositorio ocupa 29,5 GB y contiene unicamente pesos en safetensors, lo que corresponde a una precision de 16 bits (BF16), coherente con 14,77 mil millones de parametros.

Su relevancia es limitada y muy especifica: es un experimento de "unalignment" de un unico autor, con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados y con licencia GPL-3.0 en lugar de la Apache-2.0 del modelo base. Resulta interesante como caso de estudio sobre fine-tuning de seguridad y sobre las implicaciones legales de relicenciar pesos derivados, pero no como opcion de produccion sin una evaluacion exhaustiva previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2), con Grouped Query Attention, RoPE, SwiGLU y RMSNorm (arquitectura heredada de Qwen2.5-14B-Instruct) |
| Parametros totales | 14.770.033.664 (aproximadamente 14,77 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens nativos; 131.072 tokens con YaRN segun la documentacion del modelo base (no confirmado de forma independiente para este fine-tune) |
| Tipos de cuantizacion | No especificados por el autor. El repositorio contiene safetensors en BF16; al derivar de Qwen2.5 es convertible a GGUF, AWQ o GPTQ, pero no se publican versiones cuantizadas |
| Idiomas soportados | zho, eng, fra, spa, por, deu, ita, rus, jpn, kor, vie, tha, ara (13 idiomas declarados en la model card) |
| Licencia | GPL-3.0 (el modelo base Qwen2.5-14B-Instruct se distribuye bajo Apache-2.0) |
| Formato de pesos | safetensors (BF16); tamano del repositorio 29,5 GB |

Datos adicionales: pipeline no disponible, 0 descargas, 0 likes, creado y actualizado el 2026-10-01. Dataset de ajuste declarado: Orion-zhen/meissa-unalignments.

## Arquitectura y entrenamiento

No hay informacion publicada sobre el procedimiento de entrenamiento: la model card no indica si se uso LoRA, QLoRA o ajuste completo, ni el numero de tokens de entrenamiento, la composicion del dataset, la tasa de aprendizaje, el numero de epocas ni si hubo una fase de RLHF, DPO u otro metodo de alineamiento. Lo unico declarado es que se entreno el dataset Orion-zhen/meissa-unalignments "sobre un system prompt especifico", lo que sugiere un entrenamiento condicionado a que el comportamiento sin restricciones se active solo cuando el prompt de sistema es el indicado, y que se mantenga el comportamiento del Instruct original en caso contrario. Esta tecnica es una forma de "unalignment condicional" y no una eliminacion completa de las capas de rechazo, como ocurre con las tecnicas de abliteration.

La arquitectura subyacente es la de Qwen2.5-14B-Instruct: transformer decoder-only denso de 48 capas, dimension oculta de 5120, 40 cabezas de atencion con 8 cabezas KV (GQA), vocabulario de 151.936 tokens, activacion SwiGLU, normalizacion RMSNorm y embeddings posicionales rotatorios (RoPE). Segun la documentacion publica de Qwen, la serie Qwen2.5 se preentreno sobre un corpus de hasta 18 billones de tokens y el modelo Instruct incorpora ajuste supervisado y optimizacion por preferencias. No se documenta ninguna innovacion tecnica adicional en este fine-tune: no hay decodificacion especulativa, atencion lineal ni arquitecturas hibridas.

La unica instruccion operativa relevante de la model card es que, para activar el comportamiento sin restricciones, debe usarse el prompt de sistema que el autor especifica (una frase en ingles que define al modelo como "Meissa" y le indica que no tiene restricciones). Ese texto contiene lenguaje soez y no se reproduce aqui por no ser material tecnico necesario.

## Capacidades

- Generacion de texto conversacional multi-turno en 13 idiomas declarados (chino, ingles, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, tailandes y arabe).
- Razonamiento y respuesta a instrucciones: capacidades heredadas del Qwen2.5-14B-Instruct, que incluye matemáticas, sentido comun y comprension lectora.
- Generacion y explicacion de codigo, con soporte de multiples lenguajes de programacion, tambien heredado del modelo base.
- Estructuracion de salidas en JSON y formatos tabulares, capacidad documentada en la familia Qwen2.5 Instruct.
- Soporte de tool calling y function calling: el Qwen2.5-Instruct original soporta plantillas de herramientas; no hay evidencia publicada de que este fine-tune las conserve intactas ni de que se hayan evaluado.
- Modo "uncensored" condicional: con el prompt de sistema indicado por el autor, el modelo reduce sus rechazos y responde a peticiones que el Instruct original declinaria.
- Ausencia de capacidades multimodales: no hay vision, audio ni video; es un modelo exclusivamente de texto.
- No se documenta modo de razonamiento explicito (thinking), ni decodificacion especulativa, ni soporte de agentes verificado.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo sirve como sujeto de prueba para estudiar hasta que punto un ajuste fino condicionado a un prompt de sistema puede eludir las capas de rechazo de un modelo alineado, y para medir la degradacion de capacidades tras el "unalignment".
- Red teaming y evaluacion de robustez: puede utilizarse en entornos controlados para generar intentos de jailbreak y comprobar la eficacia de clasificadores de contenido o guardrails antes de desplegarlos.
- Generacion de ficcion adulta o narrativa de tematica sensible: es el caso de uso implicito del ajuste, siempre que el contenido cumpla la legislacion aplicable y las politicas de la plataforma de destino.
- Traduccion y generacion multilingue entre los 13 idiomas declarados: al conservar el tokenizador y el vocabulario de Qwen2.5, mantiene cobertura para pares de idiomas poco frecuentes como japones-coreano o arabe-chino, aunque sin datos de calidad publicados.
- Experimentos de investigacion sobre licenciamiento de pesos derivados: sirve como ejemplo practico de un derivado de un modelo Apache-2.0 relicenciado como GPL-3.0, util para discutir la aplicabilidad de licencias de software a los pesos de un modelo.
- Asistencia a la escritura creativa sin filtros tematicos: redaccion de relatos de terror, thriller o drama que aborden violencia o contenido adulto, escenario en el que los rechazos del Instruct original resultan contraproducentes.
- Base para ablation studies comparativos: permite comparar, con el mismo checkpoint de partida, el efecto de distintos datasets de desalineamiento sobre benchmarks de capacidad general y de seguridad.

En cualquier caso, no se recomienda su uso en atencion al cliente, produccion con usuarios finales ni pipelines automatizados sin evaluacion previa y sin capas adicionales de moderacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de seguridad tipo HarmBench). Tampoco hay informacion sobre la degradacion de capacidades respecto al Qwen2.5-14B-Instruct original, un dato critico en cualquier fine-tune de este tipo, ya que el entrenamiento sobre datasets de desalineamiento suele reducir el rendimiento en tareas de instruccion general y aumentar la tasa de generacion de contenido danino.

## Requisitos de hardware

- VRAM en BF16/FP16: aproximadamente 29,5 GB solo para los pesos, mas la cache KV. Con contexto de 32.768 tokens y GQA (48 capas, 8 cabezas KV, dimension de cabeza 128) la cache ronda los 6 GB en FP16, por lo que conviene reservar entre 36 y 40 GB.
- VRAM en 8 bits: aproximadamente 15-16 GB de pesos; viable en una RTX 4090 de 24 GB con contexto moderado.
- VRAM en 4 bits: aproximadamente 8-9 GB de pesos; cabe en GPUs consumer de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090), dejando margen para cache KV y contexto extendido.
- GPU recomendadas para BF16: A100 40/80 GB, H100 80 GB, L40S 48 GB o 2x RTX 4090/RTX 3090 con tensor parallelism.
- GPU consumer: si, cabe en RTX 4090 (24 GB) en BF16 solo con cuantizacion agresiva o descarga parcial a CPU; en 4 y 8 bits es perfectamente viable en RTX 3090, 4080 y 4090.
- Opciones de despliegue: vLLM, TGI, SGLang y transformers para GPU; llama.cpp, Ollama y LM Studio requieren convertir previamente los safetensors a GGUF, ya que el autor no publica cuantizaciones.
- Latencia y throughput: no disponible. No hay mediciones publicadas por el autor y, al no existir versiones cuantizadas oficiales, cualquier cifra dependeria del hardware y del backend elegidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Evaluaciones publicadas | Disponibilidad |
|---|---|---|---|---|---|---|
| Mabry15/Qwen2.5-14B-Instruct-Uncensored | 14,77B densos | 32.768 (131.072 con YaRN, segun base) | GPL-3.0 | safetensors BF16 | No | 0 descargas, 0 likes |
| Qwen/Qwen2.5-14B-Instruct | 14,77B densos | 32.768 (131.072 con YaRN) | Apache-2.0 | safetensors BF16 | Si, publicadas por Qwen | Amplia adopcion, ecosistema de cuantizaciones |
| Qwen/Qwen2.5-14B-Instruct-1M | 14,77B densos | 1.010.000 tokens | Apache-2.0 | safetensors BF16 | Si, publicadas por Qwen | Amplia adopcion |
| Mistral-Nemo-Instruct-2407 | 12B densos | 128.000 tokens | Apache-2.0 | safetensors BF16 | Si, publicadas por Mistral | Amplia adopcion, cuantizaciones comunitarias |

La diferencia principal frente a las alternativas no es de rendimiento, que no esta medido, sino de licencia y de soporte: este fine-tune cambia Apache-2.0 por GPL-3.0, no aporta cuantizaciones propias, no tiene comunidad ni evaluaciones, y su unico rasgo diferencial es el comportamiento sin restricciones condicionado al prompt de sistema. Frente a otras variantes de Qwen2.5-14B "sin censura" basadas en abliteration, no hay datos comparativos disponibles.

## Limitaciones y advertencias

- No hay ningun benchmark publicado: se desconoce el impacto del ajuste sobre MMLU, GSM8K, HumanEval o tareas de instruccion general. Es esperable cierta degradacion, pero no esta cuantificada.
- Riesgo elevado de contenido danino: el proposito declarado del modelo es eliminar restricciones, por lo que puede generar instrucciones peligrosas, discurso de odio, contenido sexual explicito o desinformacion sin los rechazos habituales.
- Modo condicional mal documentado: el autor afirma que el comportamiento sin restricciones se activa con un prompt de sistema concreto, pero no explica la metodologia ni aporta evidencias de que el modelo mantenga el comportamiento seguro en otros contextos.
- Licencia GPL-3.0 sobre pesos derivados de un modelo Apache-2.0: la aplicacion de una licencia de software libre copyleft a pesos de modelo es juridicamente discutida y puede generar incertidumbre para uso comercial. Ademas, la GPL-3.0 impone obligaciones de distribucion del codigo fuente que son de dificil cumplimiento para pesos binarios. Se recomienda revision legal antes de cualquier uso en producto.
- Adopcion nula: 0 descargas y 0 likes implican que no existe validacion por parte de la comunidad, ni issues resueltos, ni confirmacion independiente de que los pesos carguen correctamente.
- Idiomas: los 13 idiomas son los declarados por el autor, sin evaluacion de calidad por idioma. El rendimiento en idiomas de bajos recursos como tailandes o vietnamita no esta medido.
- Contexto: la ventana de 131.072 tokens con YaRN es una caracteristica del modelo base y no se ha verificado en este fine-tune; activarla requiere configuracion manual y suele degradar la calidad de recuperacion en el centro del contexto.
- Produccion: no se recomienda su despliegue sin guardrails externos, filtrado de entrada y salida, registro de conversaciones y una evaluacion de seguridad previa, especialmente en aplicaciones con usuarios finales.
- Sesgos: al no existir evaluaciones, se heredan los sesgos del Qwen2.5-14B-Instruct mas los posibles sesgos introducidos por el dataset Orion-zhen/meissa-unalignments, que no esta descrito en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mabry15/Qwen2.5-14B-Instruct-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset de ajuste declarado: https://huggingface.co/datasets/Orion-zhen/meissa-unalignments
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Blog de presentacion de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115

Nota sobre la busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo ni con documentacion tecnica de IA, por lo que no se incluyen como enlaces. No se han encontrado papers, blogs ni demos adicionales especificos de este fine-tune.

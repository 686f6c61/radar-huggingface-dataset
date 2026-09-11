# arianraje/qwen3-4b-gdn-hybrid-teacher-kd-4k-400m

## Resumen

Qwen3-4B GDN hybrid: teacher-KD, 4k, 400M es un checkpoint de investigación publicado por el usuario arianraje en HuggingFace. Se trata de un modelo de generación de texto de 4.546.819.904 parámetros (4,55 B) construido sobre el backbone Qwen3-4B, pero con una modificación arquitectónica sustancial: usa `Qwen3NextForCausalLM` con MLP densas y una combinación de atención híbrida entre Gated DeltaNet (GDN) y atención completa, en lugar de atención completa pura.

El modelo no se ha entrenado desde cero: es el resultado de una destilación off-policy de vocabulario completo con divergencia KL forward contra el profesor Qwen3-4B, partiendo del checkpoint intermedio arianraje/qwen3-4b-gdn-hybrid-stage2b-kd. El texto supervisado procede de muestras generadas por el propio profesor sobre una mezcla de prompts de OpenThoughts, Dolly y RUG (etapa 3 del proyecto). El checkpoint publicado es el snapshot final WSD tras 400.040.854 tokens de pérdida (nominal 400 M), en el paso 2754, con un límite estático de traza de 4.096 tokens.

Su relevancia es la de un artefacto de ablación dentro de un proyecto de investigación sobre destilación en arquitecturas híbridas SSM/atención a escala de 4 B: permite comparar directamente el método teacher-KD frente al método OPD (on-policy distillation) con el mismo presupuesto de tokens. Con 0 descargas y 0 likes, y con resultados claramente inferiores a la variante OPD en AIME24/25, debe considerarse material de estudio reproducible más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido `Qwen3NextForCausalLM`: MLP densas + atencion hibrida Gated DeltaNet (GDN) / atencion completa |
| Parametros totales | 4.546.819.904 (4,55 B), segun safetensors del repositorio |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible; el cap estatico de traza usado en el entrenamiento de destilacion es de 4.096 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin versiones GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano de repositorio 9,1 GB; incluye tokenizer, metadatos de snapshot y seis informes de evaluacion) |

## Arquitectura y entrenamiento

La arquitectura es un hibrido de atencion: capas con Gated DeltaNet (un mecanismo de estado recurrente con puerta, de la familia de los modelos de espacio de estados lineales) combinadas con capas de atencion completa, sobre un tronco de MLP densas. El modelo se carga con `Qwen3NextForCausalLM`, la clase asociada a la familia Qwen3-Next, y el entorno de entrenamiento y evaluacion del autor utilizo Transformers 4.57.3 y Flash Linear Attention 0.5.1. Los pesos de inferencia, el tokenizer, los metadatos del snapshot y seis informes de evaluacion estan incluidos; el estado del optimizador y los volcados de generaciones muestreadas no se publican. El fichero `provenance.json` registra el origen exacto, los recuentos de tokens y el emparejamiento con OPD.

El entrenamiento es una destilacion off-policy de vocabulario completo con KL forward contra Qwen3-4B como profesor, sobre la mezcla de prompts de etapa 3 (OpenThoughts / Dolly / RUG), partiendo del checkpoint de KD de etapa 2b. El texto supervisado proviene de muestras generadas por el profesor. El checkpoint es el snapshot final de un calendario WSD (warmup-stable-decay) en el paso 2754, con 400.040.854 tokens de perdida. El autor indica que las extensiones a 400 M parten del snapshot pre-decay de su propia ejecucion de 200 M, no del punto final ya decaido de 200 M. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `text-generation` y `conversational`, y la evaluacion se realiza con el modo de razonamiento activado (thinking enabled).
- Razonamiento matematico y de competicion: se han medido resultados de pass@1 en AIME24 y AIME25, lo que confirma capacidad de razonamiento multi-paso en problemas de matematicas.
- Razonamiento con modo thinking: las evaluaciones emplean un cap de 32.768 tokens de generacion con el modo de pensamiento activado, de modo que el modelo puede producir cadenas de razonamiento largas antes de la respuesta final.
- Destilacion de comportamiento del profesor: al derivar de Qwen3-4B mediante KL forward de vocabulario completo, hereda parte de la distribucion de salida del profesor en la mezcla de prompts de entrenamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible en la informacion proporcionada (solo se documenta razonamiento tipo thinking, no uso de herramientas ni planificacion con entorno).
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Vision, audio u otras modalidades: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Reproduccion de experimentos de destilacion: el checkpoint incluye `provenance.json` con el origen, los recuentos de tokens y el emparejamiento con OPD, lo que permite replicar la comparacion teacher-KD frente a OPD con el mismo presupuesto nominal de 400 M de tokens de perdida.
- Ablacion de arquitecturas hibridas GDN + atencion completa: sirve para estudiar como se comporta una mezcla de capas Gated DeltaNet y atencion completa a escala de 4 B cuando se entrena por destilacion en lugar de por preentrenamiento desde cero.
- Estudio de direccion de la KL: al ser un caso de KL forward off-policy con trazas del profesor y cap de 4.096 tokens, es util para analizar como la direccion de la divergencia y el horizonte de la traza afectan al rendimiento en tareas de razonamiento, en contraste con el esquema reverse KL sobre muestras del estudiante que usa OPD.
- Evaluacion comparativa de checkpoints intermedios: al existir un checkpoint previo de etapa 2b del mismo autor, permite medir la ganancia marginal de la etapa 3 de destilacion sobre el mismo backbone.
- Investigacion sobre eficiencia de atencion en secuencias largas: la presencia de capas lineales GDN reduce el coste teorico de cache de clave-valor frente a atencion completa, lo que lo hace util como sujeto de pruebas de memoria y latencia en generaciones de hasta 32.768 tokens, siempre que se instrumente la medicion.
- Docencia y formacion en destilacion de modelos: por su licencia Apache-2.0 y su tamano contenido (4,55 B, 9,1 GB en safetensors), es un caso practico viable para cursos o talleres sobre destilacion de profesores de 4 B en GPUs de gama alta de consumo.
- Base para experimentos de cuantizacion: al no publicarse versiones cuantizadas, es un punto de partida razonable para generar GGUF o GPTQ propias y medir la degradacion sobre tareas AIME, aunque no hay resultados publicados de ese tipo.

## Benchmarks y rendimiento

Unica evaluacion publicada en la model card, comparando este checkpoint con la variante OPD de 400 M tokens:

| Modelo | AIME24 pass@1 | AIME25 pass@1 |
|---|---:|---:|
| Este checkpoint (teacher-KD, 4k, 400 M) | 19,2 % | 17,9 % |
| OPD 400 M (`pinkskin/qwen3-4b-gdn-wsd-ladder/wsd-flat-ext200-400M`) | 33,3 % | 31,7 % |

Metodologia declarada por el autor: AIME con 30 problemas por ano, 8 muestras por problema, modo thinking activado y cap de 32.768 tokens de generacion; las puntuaciones son pass@1 empirico e insesgado. El propio autor advierte que estas evaluaciones, por su tamano, solo permiten rankings descriptivos y no afirmaciones de significacion estadistica. La comparacion empareja presupuesto nominal de tokens de perdida y punto final WSD, pero no tiempo de reloj ni paso de optimizador: la direccion de la KL, la fuente y el horizonte de la traza y la exposicion efectiva a tokens RUG quedan confundidos. La referencia OPD tiene 400.012.332 tokens reales frente a los 400.040.854 de este checkpoint, diferencia atribuida al overshoot de los pasos completos de entrenamiento.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 9,1 GB solo de pesos (coincide con el tamano del repositorio); con cache KV y activaciones, entre 11 y 14 GB para contextos de 4.096 tokens, y mas si se generan secuencias de hasta 32.768 tokens.
- VRAM estimada en INT8: en torno a 4,6 GB de pesos (estimacion, no hay cuantizacion oficial publicada). En INT4, en torno a 2,5-2,9 GB de pesos (estimacion).
- GPU de gama alta de consumo: cabe en RTX 3090 (24 GB) y RTX 4090 (24 GB) en BF16 con margen. En GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) el BF16 queda muy justo y requeriria cuantizacion.
- GPU de centro de datos: A100 40 GB y H100 80 GB soportan el modelo con lotes grandes y contextos largos; tambien es viable en L40S 48 GB.
- Opciones de despliegue: carga nativa con `AutoModelForCausalLM` y `AutoTokenizer` de Transformers (el autor uso Transformers 4.57.3). Para vLLM se requiere un shim de registro de Qwen3-Next que soporte capas densas y embeddings atados. Flash Linear Attention 0.5.1 es necesario para las capas GDN. Soporte en llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles; no se aportan medidas de tokens por segundo, TTFT ni curvas de escalado.

## Comparativa con modelos similares

| Modelo | Parametros | Atencion | Contexto | AIME24 pass@1 | Licencia |
|---|---|---|---|---|---|
| Este checkpoint (teacher-KD, 4k, 400 M) | 4,55 B (safetensors) | hibrida GDN + atencion completa | no disponible (cap de entrenamiento 4.096 tokens) | 19,2 % | Apache-2.0 |
| OPD 400 M (`pinkskin/qwen3-4b-gdn-wsd-ladder/wsd-flat-ext200-400M`) | no disponible | mismo backbone hibrido GDN + atencion completa | no disponible | 33,3 % | no disponible |
| `arianraje/qwen3-4b-gdn-hybrid-stage2b-kd` (checkpoint de partida) | no disponible | mismo backbone hibrido GDN + atencion completa | no disponible | no disponible | no disponible |
| Qwen3-4B (profesor y modelo base) | aproximadamente 4 B segun denominacion | atencion completa | no disponible en la informacion proporcionada | no disponible | Apache-2.0 |

La comparacion mas informativa disponible es la de la propia model card: con presupuesto de tokens y punto final WSD emparejados, la variante OPD supera a este checkpoint en 14,1 puntos en AIME24 y 13,8 puntos en AIME25. Ese es el dato diferencial de la ficha: el metodo teacher-KD con traza de 4.096 tokens rinde claramente por debajo del metodo OPD en razonamiento matematico dentro del mismo proyecto.

## Limitaciones y advertencias

- Rendimiento inferior a la alternativa del propio proyecto: la model card reconoce explicitamente que este checkpoint tiene el pass@1 medio en AIME24/25 mas bajo entre los brazos de 16k, 8k y 4k del metodo teacher-KD, y queda muy por debajo del OPD de 400 M.
- Base estadistica fragil: 30 problemas por ano y 8 muestras por problema. El autor advierte que estos resultados solo permiten rankings descriptivos, no conclusiones de significacion.
- Contexto efectivo limitado: el entrenamiento de destilacion usa un cap estatico de traza de 4.096 tokens, muy inferior a los 32.768 tokens usados en la generacion de evaluacion; el comportamiento mas alla del horizonte de entrenamiento no esta validado.
- Confusion de variables en la comparacion OPD: la direccion de la KL, la fuente y el horizonte de la traza y la exposicion efectiva a tokens RUG no estan controladas, por lo que la diferencia de rendimiento no puede atribuirse limpiamente a un unico factor.
- Ausencia de informacion sobre idiomas: no se declaran idiomas soportados, por lo que no hay garantia de calidad multilingue mas alla de lo que herede del profesor.
- Sin soporte de tool calling ni agentes documentado: no se puede asumir function calling fiable en produccion.
- Riesgo de alucinacion: inherente a un modelo de 4 B destilado y con un presupuesto de entrenamiento de solo 400 M de tokens de perdida en la etapa final; no se han publicado tasas de alucinacion ni evaluaciones de veracidad.
- Sesgos: al derivar de Qwen3-4B, hereda los sesgos del corpus del profesor, pero no se aporta ninguna evaluacion de sesgo ni de seguridad en la informacion disponible.
- Dependencias de software estrictas: requiere Transformers 4.57.3 y Flash Linear Attention 0.5.1, y en vLLM un shim de registro especifico para capas densas y embeddings atados; esto complica el despliegue en pilas estandar.
- Sin cuantizaciones oficiales ni soporte confirmado en llama.cpp/Ollama/TGI: el uso en entornos de bajos recursos exige trabajo adicional no documentado.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de terceros.
- Licencia: Apache-2.0 permite uso comercial del checkpoint, pero conviene verificar las condiciones aplicables al modelo base Qwen3-4B y al checkpoint intermedio de los que deriva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-teacher-kd-4k-400m
- Modelo base profesor: https://huggingface.co/Qwen/Qwen3-4B
- Checkpoint de partida (etapa 2b, KD): https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-stage2b-kd
- Referencia OPD 400 M citada en la model card: https://huggingface.co/pinkskin/qwen3-4b-gdn-wsd-ladder/tree/ae6b72a357d167fb459dfeda3bded4941decdf41/wsd-flat-ext200-400M
- Evaluacion interna del proyecto citada por el autor (ALT_KD.md): no disponible como enlace publico en la informacion proporcionada
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo (contenido no tecnico y ajeno al ambito), por lo que no se incluyen como referencias.

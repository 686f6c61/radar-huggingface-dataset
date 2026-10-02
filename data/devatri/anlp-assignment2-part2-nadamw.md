# Devatri/anlp-assignment2-part2-nadamw

## Resumen

`Devatri/anlp-assignment2-part2-nadamw` es un checkpoint de un modelo de lenguaje transformer denso entrenado desde cero como parte de la segunda parte de la asignatura ANLP (Assignment 2, Part 2). No es un modelo publicado comercialmente ni un lanzamiento de laboratorio: se trata de un artefacto academico de investigacion asociado a un trabajo de comparacion de optimizadores, en el que se entreno una unica pasada (un solo epoch) sobre el corpus `browndw/human-ai-parallel-corpus`, usando el split de entrenamiento dividido por familia de documentos.

La relevancia del repositorio es metodologica mas que de rendimiento. El checkpoint guarda el `state dict` del modelo, su `model_configuration`, el estado del optimizador (NadamW), el `grad_scaler` y los contadores de tokens y pasos, de modo que el experimento es reproducible desde `model.py` mediante `DenseTransformer(ModelConfig(**checkpoint['model_configuration']))`. Ademas, el repositorio incluye un `metrics.csv` con los checkpoints de todos los optimizadores comparados en los umbrales 0,1 a 1,0, lo que lo convierte en material util para replicar una comparativa de optimizadores, no para uso como modelo generativo en produccion.

La informacion publicada es muy escasa: no hay licencia, no hay idiomas declarados, no hay pipeline asignado, no se especifican el numero de parametros ni la longitud de contexto, y no se han publicado resultados de benchmarks. El repositorio ocupa 0,4 GB (incluyendo estado de optimizador) y acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`DenseTransformer`, definido en `model.py`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (definida en `model_configuration` dentro de `checkpoint.pt`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state dict` serializado en `checkpoint.pt` (no hay safetensors ni GGUF) |

Datos adicionales verificables: tamano del repositorio 0,4 GB; `sha256` del checkpoint `373f87aeed3096598dae68c461307727b74804bf0c5eb44c8b7300742dc53187`; fecha de creacion 2026-10-02; ultima actualizacion 2026-10-02.

## Arquitectura y entrenamiento

La model card indica explicitamente que se trata de un modelo denso construido con la clase `DenseTransformer` y parametrizado por `ModelConfig`. No se detalla el numero de capas, dimensiones de embedding, numero de cabezas de atencion, tipo de tokenizador ni si se usan embeddings posicionales aprendidos o relativos; todos esos valores residen en el diccionario `model_configuration` almacenado en el checkpoint y no se reproducen en la documentacion publica. Por la propia denominacion (`dense`) y por el contexto de la asignatura, la hipotesis mas razonable es un transformer decoder-only de tipo GPT, pero esto no esta confirmado por el autor.

El entrenamiento consistio en una sola pasada sobre el split de entrenamiento de `browndw/human-ai-parallel-corpus`, dividido por familia de documentos (particion por documento para evitar fuga de informacion entre train y validacion). El optimizador empleado es NadamW (variante de Adam con Nesterov y weight decay desacoplado), que da nombre al checkpoint y forma parte de una comparativa mas amplia: el fichero `metrics.csv` recoge los checkpoints de cada optimizador en los umbrales 0,1, 0,2, ..., 1,0. No hay mencion a RLHF, DPO, SFT ni a ninguna fase de alineacion; tampoco a decodificacion especulativa, atencion lineal o tecnicas hibridas. El checkpoint conserva el `grad_scaler`, lo que indica entrenamiento en precision mixta.

## Capacidades

- Generacion de texto autoregresiva: es la funcion basica esperable en un transformer denso entrenado con objetivo de modelado de lenguaje, aunque no se documenta ninguna evaluacion de calidad.
- Continuacion de texto y modelado de lenguaje sobre el dominio del corpus `human-ai-parallel-corpus` (pares de texto humano e IA), con un unico epoch de entrenamiento.
- Comparacion de optimizadores: el repositorio incluye metricas de varios optimizadores, de modo que el artefacto sirve para analizar trayectorias de entrenamiento (loss/checkpoints en los umbrales 0,1 a 1,0).
- Reanudacion de entrenamiento: al conservar estado del optimizador, `grad_scaler` y contadores de tokens/pasos, permite continuar el entrenamiento desde el punto guardado.
- Inspeccion de configuracion: permite reconstruir el modelo exacto a partir de `model_configuration`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declara ningun idioma).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Reproduccion de un experimento academico de optimizadores: el `metrics.csv` y el `sha256` del checkpoint permiten reconstruir la comparativa NadamW frente a otros optimizadores y verificar la integridad del artefacto antes de reentrenar.
- Estudio de convergencia en regimen de un solo epoch: util para analizar si NadamW converge mas rapido que AdamW en presupuestos de computo muy bajos, que es exactamente el escenario que plantea el repositorio.
- Material docente para asignaturas de procesamiento de lenguaje natural: sirve como ejemplo completo de pipeline de entrenamiento (configuracion, checkpoint, metricas, particion por familia de documentos) para que el alumnado inspeccione el ciclo completo.
- Baseline de investigacion sobre corpus humano-IA: puede emplearse como referencia de partida al estudiar la deteccion o generacion de texto asistido por IA, siempre que se documente su falta de alineacion.
- Pruebas de infraestructura de carga de checkpoints: resulta util para validar pipelines internos que hacen `torch.load` sobre `checkpoint.pt`, reconstruyen el modelo con `ModelConfig(**...)` y mapean estados de optimizador.
- Fine-tuning exploratorio como punto de partida: el state dict puede inicializar un ajuste fino sobre un dominio concreto, aunque la ausencia de licencia impide confirmar que ese uso este permitido.
- Ablaciones controladas de recetas de entrenamiento: al ser un modelo pequeno (el repositorio completo pesa 0,4 GB incluyendo estado del optimizador), es viable repetir el entrenamiento completo multiples veces en una sola GPU para comparar hiperparametros.
- Uso en produccion (atencion al cliente, generacion de codigo, agentes): no recomendado ni documentado; no hay licencia, no hay evaluacion de calidad y no hay alineacion de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona `metrics.csv`, que recoge checkpoints de los distintos optimizadores en los umbrales 0,1 a 1,0, pero no se incluyen los valores de dichas metricas ni comparaciones con MMLU, HumanEval, GSM8K u otros conjuntos de evaluacion. No se dispone de cifras de perplejidad, exactitud ni latencia.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma directa, porque se desconoce el numero de parametros. La formula aplicable es: VRAM ≈ (parametros × bytes por parametro) + cache KV + overhead de runtime, con 4 bytes/parametro en fp32, 2 en fp16/bf16, 1 en int8 y ~0,5 en int4.
- Estimacion orientativa (no confirmada por el autor): si los 0,4 GB del repositorio corresponden en su mayor parte a parametros y estado del optimizador en precision mixta (del orden de 16 bytes por parametro entre pesos fp32, momentos y gradientes), el modelo estaria en la escala de decenas de millones de parametros; en ese rango cabria holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no disponible. Para un modelo de esa escala bastaria una GPU consumer con 8-16 GB (por ejemplo RTX 3060, RTX 4060 Ti, RTX 4090), pero esto es una inferencia a partir del tamano del repositorio, no un dato publicado.
- Despliegue en consumer GPU: probablemente si, en funcion del numero real de parametros y de la longitud de contexto, que se desconocen.
- Opciones de despliegue: no hay pesos en safetensors ni GGUF, por lo que llama.cpp y Ollama no pueden cargarlo directamente sin una conversion previa. vLLM y TGI tampoco lo soportan de serie al no ser una arquitectura registrada. La via documentada es cargarlo en PyTorch con la clase `DenseTransformer` del propio repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Al desconocerse el numero de parametros, la longitud de contexto, el tokenizador y el rendimiento, no es posible establecer una comparacion valida con alternativas de la misma categoria. La tabla siguiente se incluye solo como referencia de modelos pequenos de dominio publico frecuentemente usados como linea base en trabajos academicos; los datos del modelo analizado permanecen sin confirmar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Devatri/anlp-assignment2-part2-nadamw | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| GPT-2 (referencia publica) | 124 M (version base) | 1024 tokens | MIT (pesos publicados por OpenAI) | HuggingFace, ampliamente desplegado |
| Pythia-160M (referencia publica) | 160 M | 2048 tokens | Apache 2.0 | HuggingFace, con checkpoints intermedios |

Los datos de las filas de referencia corresponden a sus fichas publicas y se incluyen unicamente a efectos ilustrativos del tipo de comparacion que seria posible si el autor publicase la configuracion y las metricas.

## Limitaciones y advertencias

- Artefacto academico sin soporte: no hay model card detallada, ni documentacion de uso previsto, ni mantenimiento posterior a la entrega.
- Sin licencia declarada: al no especificarse licencia, no hay cesion explicita de derechos; el uso comercial no esta autorizado de forma clara y conviene contactar con el autor antes de cualquier uso fuera del ambito academico.
- Entrenamiento insuficiente: una sola pasada sobre el corpus implica un modelo infraentrenado, con calidad de generacion muy inferior a la de modelos entrenados con cientos de miles de millones de tokens.
- Sin alineacion: no se menciona RLHF, DPO, filtrado de seguridad ni evaluacion de sesgos, por lo que puede reproducir contenido sesgado, ofensivo o factualmente incorrecto presente en el corpus, y no rechazara peticiones daninas.
- Riesgo de alucinacion: no evaluado. En un modelo de esta escala y con este presupuesto de entrenamiento, la generacion de afirmaciones plausibles pero falsas es esperable.
- Sesgo de dominio: el entrenamiento se limita a `browndw/human-ai-parallel-corpus`, un corpus de pares humano-IA; el comportamiento fuera de ese dominio es impredecible.
- Idiomas: no declarados. No puede asumirse competencia multilingue ni siquiera en ingles sin verificacion empirica.
- Contexto limitado y desconocido: la ventana efectiva depende de `model_configuration`; conviene inspeccionarla antes de asumir cualquier capacidad de contexto largo.
- Riesgo de seguridad al cargar el checkpoint: `checkpoint.pt` es un fichero pickle de PyTorch y puede ejecutar codigo arbitrario al deserializarse. Verificar el `sha256` publicado y cargar con `torch.load(..., weights_only=True)` cuando sea posible, o en un entorno aislado.
- Metricas no publicadas: `metrics.csv` se menciona pero no se reproduce su contenido, por lo que no puede verificarse la afirmacion de que se compararon varios optimizadores ni el resultado de esa comparacion.
- Reproducibilidad parcial: sin los ficheros `model.py` y `metrics.csv` accesibles junto al checkpoint, y sin la version de las dependencias, la reconstruccion exacta del entorno de entrenamiento no esta garantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Devatri/anlp-assignment2-part2-nadamw
- Dataset de entrenamiento citado en la model card: `browndw/human-ai-parallel-corpus` (referencia textual; no se ha proporcionado URL directa)
- Checksum del checkpoint: sha256 `373f87aeed3096598dae68c461307727b74804bf0c5eb44c8b7300742dc53187`
- Paper, blog o repositorio asociado: no disponible
- Demo: no disponible
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo (corresponden a cronicas de un partido de futbol entre Dinamarca y Portugal) y no aportan enlaces utiles.

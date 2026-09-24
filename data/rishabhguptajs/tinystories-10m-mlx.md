# rishabhguptajs/tinystories-10m-mlx

## Resumen

TinyStories 10M (identificador `rishabhguptajs/tinystories-10m-mlx`) es un modelo de lenguaje de 9.999.168 parámetros entrenado desde cero por Rishabh Gupta dentro de su proyecto slm-lab. No parte de pesos preentrenados: incluye arquitectura, tokenizador BPE a nivel de byte y bucle de entrenamiento escritos específicamente para este experimento, ejecutados en MLX sobre un MacBook Air M4 sin ventilador en 2 horas y 40 minutos. El objetivo no es competir en capacidades generales, sino servir como artefacto reproducible de investigación sobre recetas de entrenamiento eficientes en hardware de consumo.

El modelo es un transformer decoder de 6 capas, anchura 320, 5 cabezas de 64 dimensiones y una ventana de contexto de 256 tokens, con un vocabulario de 8192 entradas. Se entrenó sobre TinyStoriesV2-GPT4, viendo 164 millones de tokens en 10.000 pasos, e incorpora innovaciones de receta poco habituales a esta escala, como el optimizador Muon para las matrices ocultas combinado con AdamW para embeddings y ganancias de normalización, además de QK-norm y inicialización a cero de las proyecciones residuales.

Su relevancia actual es doble. Por un lado, demuestra que es posible entrenar un modelo de lenguaje coherente a escala de 10M de parámetros en un portátil en menos de tres horas con código propio. Por otro, publica la traza completa de ablaciones que llevaron a la receta final, con código de entrenamiento, tokenizador, logs y benchmark incluidos en el repositorio, lo que lo convierte en material didáctico y de referencia para quienes investigan el régimen de modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, pre-norm, con RoPE, RMSNorm, QK-norm, MLP GELU (4x), embeddings de entrada/salida atados e inicializacion a cero de proyecciones residuales |
| Parametros totales | 9.999.168 (9.999.168 segun safetensors; 7,4M no pertenecientes al embedding) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible. Los pesos se publican en fp32; no se incluyen versiones cuantizadas |
| Idiomas soportados | Ingles (el tokenizador es centrico en ingles; codifica devanagari a razon de 1 token por byte) |
| Licencia | CDLA-Sharing-1.0 (igual que la del dataset TinyStories) |
| Formato de pesos | safetensors en fp32 (~40 MB), acompanado de `config.json` y `tokenizer.json`; libreria MLX |

Detalles adicionales de configuracion: 6 capas, anchura 320, 5 cabezas de 64 dimensiones, vocabulario de 8192 entradas (los identificadores 0-8190 corresponden a bytes y fusiones BPE, y el 8191 esta reservado para `<|endoftext|>`).

## Arquitectura y entrenamiento

La arquitectura sigue el esquema clasico de transformer decoder con normalizacion previa (pre-norm). Usa embeddings rotatorios (RoPE) para la posicion, RMSNorm, normalizacion sobre queries y keys (QK-norm), un MLP con activacion GELU y factor de expansion 4x, embeddings de entrada y salida atados, y proyecciones residuales inicializadas a cero. El tokenizador es un BPE a nivel de byte entrenado por el propio autor, con un vocabulario de 8192 entradas y una media de 4,06 bytes por token sobre el corpus de entrenamiento.

El entrenamiento consumio el split de entrenamiento de TinyStoriesV2-GPT4, que con este tokenizador suma 539,6 millones de tokens; el modelo vio 164 millones de tokens en 10.000 pasos con tamano de lote 64 y secuencias de 256 tokens. La optimizacion combina Muon (lr 0.02, con Nesterov y Newton-Schulz en bf16) para las matrices ocultas y AdamW (lr 3e-3, betas 0.9/0.95, weight decay 0.1 sobre el embedding) para el embedding y las ganancias de normalizacion, con recorte de gradiente a 1.0. El calendario es warmup de 100 pasos, fase plana y decaimiento lineal a cero durante el ultimo 20 % (WSD). El computo se hizo en bf16 con pesos maestros en fp32, sosteniendo entre 17.000 y 20.000 tokens por segundo en el M4 Air.

Las ablaciones cortas de igual presupuesto de tokens (8,2M tokens cada una), medidas en bits por byte, muestran la contribucion de cada decision: linea base AdamW con contexto 512, 0.974; contexto 256, 0.955; AdamW con lr 3e-3, 0.952; Muon, 0.689; Muon mas QK-norm e inicializacion a cero, 0.658; y anadir WSD, 0.655. El autor advierte que son ejecuciones cortas de una sola semilla y deben interpretarse como senal temprana, no como resultado definitivo.

## Capacidades

- Generacion de texto en ingles limitada a cuentos infantiles simples y coherentes a corto plazo.
- Finalizacion de historias a partir de un prompt breve, con estilo narrativo consistente y vocabulario sencillo.
- Modelado de lenguaje byte a byte mediante tokenizador BPE propio, util para estudiar eficiencia de tokenizacion.
- Ejecucion local en Apple Silicon mediante MLX, con scripts de generacion incluidos (`generate.py`).
- Reproducibilidad completa del pipeline: preparacion de datos, entrenamiento del tokenizador, bucle de entrenamiento, benchmark y ablaciones en el directorio `training/`.
- No soporta tool calling, function calling, uso de agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No tiene capacidades multilingues reales; el propio autor senala que el tokenizador esta centrado en ingles.

## Casos de uso

- Docencia de arquitecturas transformer: el repositorio incluye `model.py`, `tok.py` y `generate.py`, de modo que un estudiante puede leer las 6 capas completas, el tokenizador y el bucle de generacion sin capas de abstraccion de frameworks de alto nivel.
- Investigacion sobre recetas de optimizacion a escala minima: las ablaciones publicadas (AdamW frente a Muon, contexto 512 frente a 256, WSD) permiten replicar y extender el estudio del efecto de cada decision sobre bits por byte con un coste de computo de minutos.
- Estudio de tokenizadores: al incluir el entrenador de tokenizador y una metrica normalizada por byte (bits por byte), sirve para comparar vocabularios BPE de distinto tamano sin que el resultado dependa de la tokenizacion.
- Prueba de concepto de entrenamiento en hardware de consumo: el pipeline completo corre en un MacBook Air M4 en 2h40m, lo que permite validar infraestructura y flujo de trabajo antes de escalar a modelos mayores.
- Linea base de referencia para modelos pequenos: sus 0,4634 bits por byte sobre las primeras 1.000 historias de la validacion de TinyStoriesV2-GPT4 ofrecen un punto de comparacion documentado para nuevos experimentos con presupuestos de parametros similares.
- Generacion de cuentos sinteticos simples para prototipos: util como fuente de texto de relleno o de prueba en demos de interfaces, pipelines de datos o tests de integracion donde no se requiere calidad real.
- Verificacion de portabilidad MLX: sirve para comprobar el flujo de carga de safetensors y ejecucion de inferencia en MLX frente a otras rutas de despliegue en macOS.
- Reproduccion de un experimento academico: los logs reales de entrenamiento, la tabla de ablaciones y `training/NOTES.md` permiten auditar el proceso completo, no solo el resultado final.

## Benchmarks y rendimiento

Los unicos resultados publicados son de bits por byte (menor es mejor) sobre las primeras 1.000 historias del split de validacion de TinyStoriesV2-GPT4. Cada modelo se condiciona con su propio token BOS y se puntua unicamente el texto de la historia, ya que los modelos comparados usan tokenizadores distintos.

| Modelo | Parametros totales | Parametros no de embedding | Bits por byte |
|---|---|---|---|
| stories15M (Karpathy, llama2.c) | 15,2M | 6,0M | 0,3991 |
| TinyStories-28M (Eldan y Li) | 52,0M | 25,2M | 0,4428 |
| Este modelo | 10,0M | 7,4M | 0,4634 |
| TinyStories-8M (Eldan y Li) | 19,7M | 6,3M | 0,5183 |
| TinyStories-3M (Eldan y Li) | 8,3M | 1,6M | 0,6240 |
| TinyStories-1M (Eldan y Li) | 3,8M | 0,4M | 0,7860 |
| stories260K (Karpathy, llama2.c) | 0,26M | 0,23M | 0,9156 |

El propio autor senala dos advertencias sobre esta tabla: los modelos TinyStories-* se entrenaron sobre TinyStories v1 (historias generadas con GPT-3.5 y GPT-4), mientras que este modelo se entreno sobre el split v2 de GPT-4 que se usa para evaluar, lo que supone una ventaja en la evaluacion; y stories15M se entreno durante mucho mas tiempo en GPUs de centro de datos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras pruebas estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo en fp32 ocupa aproximadamente 40 MB, por lo que la huella de memoria es marginal (del orden de decenas de megabytes, sin necesidad de cuantizacion).
- GPU recomendadas: no se requiere GPU. El modelo fue entrenado y se ejecuta en un MacBook Air M4 con CPU y GPU integradas mediante MLX.
- Cabe en cualquier GPU de consumo e incluso en CPU: no hay escenario realista de falta de memoria con 10M de parametros.
- Opciones de despliegue: MLX es la ruta soportada oficialmente, con los scripts `generate.py` y `model.py` incluidos. No se proporcionan pesos GGUF, ni integraciones con vLLM, TGI, llama.cpp u Ollama; cualquier otra ruta exigiria convertir manualmente los pesos y reimplementar la arquitectura.
- Latencia y throughput: no se publican cifras de inferencia. La unica cifra de rendimiento disponible es de entrenamiento, entre 17.000 y 20.000 tokens por segundo sostenidos en un MacBook Air M4.
- Tiempo de entrenamiento de referencia: 2 horas y 40 minutos para 10.000 pasos en un MacBook Air M4; la preparacion de datos y el entrenamiento del tokenizador anaden unos 4 minutos.

## Comparativa con modelos similares

| Modelo | Parametros totales | No de embedding | Contexto | Bits por byte | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (TinyStories 10M, MLX) | 10,0M | 7,4M | 256 | 0,4634 | CDLA-Sharing-1.0 | safetensors en MLX, codigo de entrenamiento incluido |
| stories15M (Karpathy, llama2.c) | 15,2M | 6,0M | no disponible en la informacion proporcionada | 0,3991 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| TinyStories-28M (Eldan y Li) | 52,0M | 25,2M | no disponible en la informacion proporcionada | 0,4428 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| TinyStories-8M (Eldan y Li) | 19,7M | 6,3M | no disponible en la informacion proporcionada | 0,5183 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

Los datos de parametros y bits por byte de los tres modelos alternativos proceden de la tabla publicada por el autor de este modelo. Cualquier comparacion de rendimiento debe tener en cuenta las dos salvedades ya mencionadas: el corpus de entrenamiento difiere (v1 frente a v2) y el presupuesto de computo de stories15M es muy superior.

## Limitaciones y advertencias

- Alcance funcional muy reducido: escribe cuentos infantiles simples en ingles y nada mas. No es un modelo de proposito general.
- Deriva logica y errores gramaticales ocasionales incluso dentro de su dominio, tal como reconoce el autor.
- Sesgos: al entrenarse sobre TinyStories, un corpus generado por GPT-3.5 y GPT-4, hereda los sesgos y patrones estilisticos de esos modelos generadores, sin que se haya realizado un analisis especifico de sesgos.
- Riesgo de alucinacion: alto en cualquier tarea fuera de la generacion de cuentos; el modelo no dispone de conocimiento factual fiable.
- Limitaciones de contexto: 256 tokens de ventana, insuficiente para dialogos multi-turno o documentos.
- Limitaciones de idioma: solo ingles. El tokenizador codifica devanagari a 1 token por byte, lo que hace inviable el uso en otros alfabetos.
- Restricciones de licencia: los pesos se publican bajo CDLA-Sharing-1.0, la misma licencia del dataset TinyStories. Esta licencia exige compartir las obras derivadas bajo la misma licencia, por lo que conviene revisar su compatibilidad antes de un uso comercial.
- Idoneidad para produccion: el autor lo describe explicitamente como un artefacto de evaluacion y aprendizaje, no como un modelo de uso general. No se recomienda desplegarlo en produccion.
- Ausencia de soporte de herramientas: no admite tool calling, function calling, agentes ni razonamiento multi-paso, lo que descarta su integracion en pipelines que dependan de esas capacidades.
- Resultados de ablaciones de una sola semilla: las cifras de las recetas intermedias son senal temprana y no deben tratarse como conclusiones robustas.
- Ventaja de evaluacion declarada: el modelo se entreno sobre el mismo split v2 de GPT-4 empleado para medir bits por byte, lo que favorece su resultado frente a los modelos entrenados con el split v1.
- Fecha de publicacion del repositorio anomala (2026-09-24) segun los metadatos de HuggingFace.
- Cero descargas registradas y una sola interaccion en el momento de la consulta, sin validacion externa independiente de los resultados.

## Enlaces

- HuggingFace: https://huggingface.co/rishabhguptajs/tinystories-10m-mlx
- MLX (framework utilizado para entrenamiento e inferencia): https://github.com/ml-explore/mlx
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su autor o su benchmark; los unicos enlaces pertinentes son los anteriores, referenciados en la propia model card.

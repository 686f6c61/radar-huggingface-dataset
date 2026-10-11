# BrandonHowe/Olmo7b-urban-seed1-20261010-CPT-best-val-step-750

## Resumen

Olmo7b-urban-seed1-20261010-CPT-best-val-step-750 es un checkpoint derivado de allenai/Olmo-3-1025-7B, un transformer denso decoder-only de 7.298.011.136 parametros. Lo publica el usuario BrandonHowe en HuggingFace como exportacion autonoma en BF16, fusionada mediante PEFT safe merge sobre el modelo base sin cuantizar y sin reentrenamiento posterior. No requiere adaptador LoRA para cargarse: los pesos ya estan integrados en ocho shards de safetensors.

El modelo es el resultado de un proceso de continued pretraining (CPT) con LoRA sobre el dataset CompassioninMachineLearning/urban_12738_cleaned, con 10.072 filas unicas de entrenamiento mas 2.000 de replay, semilla de entrenamiento 1 y semilla de seleccion 3407. Corresponde al checkpoint-750, elegido por registrar la menor perdida de validacion del run (1,66911161) en la epoca 1,98608350. El autor aclara explicitamente que es el mejor checkpoint evaluado, no el estado de parada en el step 1000, y que el step 756 (frontera de epoca) no se evaluo por separado.

Su relevancia es acotada y muy especifica: se trata de un experimento de ajuste de dominio sobre la familia Olmo 3, no de un modelo de proposito general con benchmarks publicados. Resulta de interes para quien investigue tecnicas de continued pretraining con LoRA a bajo coste, quiera reproducir el pipeline de exportacion (merge seguro sobre base fijada por commit) o necesite un modelo base Olmo 3 con sesgo hacia el dominio "urban" del corpus de ajuste. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Olmo 3); detalles completos en la model card del modelo base |
| Parametros totales | 7.298.011.136 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (consultar allenai/Olmo-3-1025-7B) |
| Tipos de cuantizacion | No disponible en el repositorio; el unico export publicado es BF16. Admite cuantizacion posterior con herramientas estandar (bitsandbytes, GPTQ, AWQ, GGUF) |
| Idiomas soportados | No disponible (no declarado en la model card ni en los tags) |
| Licencia | No disponible (no declarada en el repositorio; la del modelo base debe verificarse en su propia ficha) |
| Formato de pesos | safetensors (BF16, ocho shards) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de allenai/Olmo-3-1025-7B, un transformer denso decoder-only de aproximadamente 7,3 mil millones de parametros. Este repositorio no introduce cambios estructurales: es una exportacion fusionada de un adaptador LoRA sobre el modelo base fijado en el commit `a81bae42db3975be1671e27b9c9a56da1a9f980f`. El merge se realizo con PEFT safe merge sobre el base sin cuantizar, y se restauraron los pesos de embedding y de la cabeza de salida. Todos los tensores estan en BF16 y se validaron como finitos, con la procedencia documentada en `run_manifest.json` y `export_validation.json`.

El entrenamiento consistio en continued pretraining (CPT) sobre el dataset CompassioninMachineLearning/urban_12738_cleaned, con 10.072 filas unicas de entrenamiento mas 2.000 filas de replay para mitigar el olvido catastrofico. Se completaron 1,98608350 epocas con semilla de entrenamiento 1, y el checkpoint se selecciono con semilla 3407 por perdida de validacion minima (1,66911161) en el step 750. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del corpus, ni si hubo fases de RLHF, DPO o instruccion; dado que es un proceso de continued pretraining, cabe esperar comportamiento de modelo base y no de asistente alineado, aunque esto no se confirma en la ficha.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Olmo 3 7B.
- Capacidad de continuacion de texto y modelado de lenguaje en el dominio del corpus de ajuste (corpus "urban").
- Ajuste de dominio mediante continued pretraining: el modelo ha visto 10.072 filas del corpus urban mas 2.000 de replay, por lo que su distribucion de salida esta desplazada hacia ese dominio frente al base.
- Carga directa sin adaptador: al ser un merge completo, funciona con el pipeline `text-generation` de transformers sin PEFT.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingue: no documentado; no se declaran idiomas.
- Modo thinking, vision o audio: no documentados.
- Alineacion instruccional: no documentada; es un checkpoint de continued pretraining, no un modelo instruido.

## Casos de uso

- Investigacion en continued pretraining con LoRA: el repositorio documenta semilla, epocas, filas de entrenamiento, filas de replay y perdida de validacion, lo que permite reproducir o comparar el efecto del CPT frente al modelo base en una tarea de dominio concreta.
- Analisis de olvido catastrofico: al incluir 2.000 filas de replay y mantener disponible el base, sirve para medir cuanto del rendimiento general se degrada tras el ajuste de dominio comparando ambos checkpoints sobre el mismo conjunto de evaluacion.
- Generacion de texto en dominio "urban": si el corpus de ajuste cubre tematicas urbanas (planificacion, movilidad, descripciones de entorno), el modelo puede emplearse para continuar texto o redactar contenido de ese ambito, siempre que se valide cualitativamente antes de usarlo.
- Base para un posterior fine-tuning supervisado: al ser un merge BF16 limpio, puede actuar como punto de partida de un SFT o DPO especifico, evitando la gestion de un adaptador LoRA separado.
- Estudio de exportacion y merge seguro de LoRA: el repositorio incluye manifiesto de ejecucion y validacion de exportacion, util como referencia de buenas practicas para fijar commits, verificar tensores finitos y restaurar embeddings.
- Despliegue en entornos de investigacion con vLLM o TGI: al publicarse en safetensors BF16 con estructura transformers estandar, se integra en servidores de inferencia habituales sin conversion previa.
- Evaluacion comparativa de checkpoints intermedios: al existir un repositorio de checkpoints LoRA del mismo run, permite estudiar la evolucion de la perdida de validacion y del comportamiento entre steps.
- Docencia y practicas de ajuste de modelos: por su tamano (7,3B) y por estar en BF16, es abordable en una GPU de 24 GB para experimentos de ajuste parcial o evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de rendimiento proporcionado es la perdida de validacion del checkpoint seleccionado:

| Metrica | Valor |
|---|---|
| Perdida de validacion (checkpoint-750) | 1,66911161 |
| Epoca alcanzada | 1,98608350 |
| Filas de entrenamiento unicas | 10.072 |
| Filas de replay | 2.000 |
| Semilla de entrenamiento | 1 |
| Semilla de seleccion | 3407 |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar en la informacion proporcionada.

## Requisitos de hardware

Estimaciones derivadas del recuento de parametros (7,3B) y del formato de pesos; no proceden de mediciones publicadas por el autor:

- VRAM en BF16: los pesos ocupan aproximadamente 14,6 GB (coincide con el tamano del repo). Con cache KV y activaciones, el total razonable esta en el rango de 16 a 20 GB, dependiendo de la longitud de contexto y del tamano de lote.
- VRAM en INT8/FP8: en torno a 8 GB de pesos, unos 10 a 12 GB en total.
- VRAM en INT4 (GPTQ/AWQ/GGUF Q4): en torno a 4,5 GB de pesos, unos 6 a 8 GB en total.
- GPU de datacenter: A100 40/80 GB, H100 80 GB o L40S 48 GB ejecutan el modelo en BF16 con margen para lotes grandes y contextos largos.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede cargar el modelo en BF16, con contexto y lote moderados. Tarjetas de 12 GB (RTX 4070 Ti, 4080 recortada) requieren INT8 o INT4. Tarjetas de 8 GB (RTX 3060 Ti, 4060) solo son viables en cuantizacion de 4 bits mediante GGUF.
- Opciones de despliegue: transformers (carga directa con `text-generation`), vLLM y TGI (safetensors BF16), llama.cpp y Ollama (requieren conversion previa a GGUF), y frameworks de cuantizacion como bitsandbytes, GPTQ o AWQ.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de los modelos alternativos son caracteristicas publicas de referencia y pueden variar; conviene verificarlos en sus fichas oficiales.

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| Olmo7b-urban-seed1-...-step-750 | 7,30B | No disponible | CPT de dominio sobre Olmo 3 7B | No disponible | Sin benchmarks publicados; perdida de validacion 1,6691 |
| allenai/Olmo-3-1025-7B | ~7,3B | No disponible | Base denso decoder-only | No disponible en esta consulta | Modelo de origen, sin ajuste de dominio; referencia directa de comparacion |
| Qwen2.5-7B | ~7,6B | 32.768 tokens (extensible) | Base denso decoder-only | Apache 2.0 | Modelo generalista con benchmarks publicados |
| Llama-3.1-8B | ~8,03B | 128.000 tokens | Base denso decoder-only | Licencia comunitaria Llama 3.1 | Modelo generalista con benchmarks publicados |
| Mistral-7B-v0.3 | ~7,25B | 32.768 tokens | Base denso decoder-only | Apache 2.0 | Modelo generalista con benchmarks publicados |

La comparacion relevante para este checkpoint no es de rendimiento absoluto, ya que no hay benchmarks, sino de proposito: frente al Olmo 3 7B original, este modelo incorpora un desplazamiento de dominio derivado de 10.072 filas de CPT; frente a los generalistas de la tabla, carece de datos publicados que permitan situarlo en tareas estandar.

## Limitaciones y advertencias

- No es un modelo instruido ni alineado: al provenir de continued pretraining, es previsible que no siga instrucciones de forma fiable, aunque la ficha no lo especifica explicitamente.
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion de factualidad; en tareas de conocimiento, la salida debe verificarse.
- Degradacion potencial del modelo base: el ajuste de dominio puede reducir capacidades generales (olvido catastrofico). Las 2.000 filas de replay mitigan el efecto, pero no lo eliminan.
- Corpus de ajuste reducido: 10.072 filas unicas son un volumen bajo para CPT, por lo que el efecto de dominio puede ser limitado o muy dependiente del prompt.
- Licencia no declarada: el repositorio no indica licencia. Antes de cualquier uso comercial hay que verificar la licencia del modelo base allenai/Olmo-3-1025-7B y la del dataset CompassioninMachineLearning/urban_12738_cleaned, ya que la ficha de este derivado no las hereda de forma explicita.
- Idiomas no declarados: se desconoce el soporte multilingue real y si el CPT lo ha alterado respecto al base.
- Contexto no declarado en esta ficha: la ventana efectiva debe consultarse en la ficha del modelo base; usarlo con secuencias mas largas de lo que soporta el base producira degradacion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de terceros.
- Fechas de publicacion en 2026: el modelo se creo el 2026-10-11; conviene comprobar que no existan revisiones posteriores del mismo run.
- Seleccion de checkpoint discutible: se eligio el step 750 por perdida de validacion y no el step 756 de frontera de epoca, que no se evaluo; la perdida minima no garantiza mejor comportamiento cualitativo.
- Ausencia de benchmarks: cualquier decision de produccion basada en este modelo exige una evaluacion propia.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/BrandonHowe/Olmo7b-urban-seed1-20261010-CPT-best-val-step-750
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Repositorio de checkpoints LoRA del run: https://huggingface.co/BrandonHowe/Olmo7b-urban-seed1-20261010-CPT-LoRA-checkpoints
- Checkpoint de origen (step 750, commit `f8b78d3a8de641a7d8890082c9f916ea6b162cb9`): https://huggingface.co/BrandonHowe/Olmo7b-urban-seed1-20261010-CPT-LoRA-checkpoints/tree/f8b78d3a8de641a7d8890082c9f916ea6b162cb9/checkpoint-750
- Dataset de continued pretraining: https://huggingface.co/datasets/CompassioninMachineLearning/urban_12738_cleaned
- Ficheros de procedencia citados en la model card: `run_manifest.json` y `export_validation.json` en el propio repositorio.

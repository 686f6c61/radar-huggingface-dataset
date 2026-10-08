# dougalldeepmind/2026-10-07-qwen36-0-da-lowstakes-practical-15

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) denominado `2026-10-07-qwen36-0-da-lowstakes-practical-15`, publicado por el usuario `dougalldeepmind`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador en formato PEFT que debe cargarse sobre el modelo base `Qwen/Qwen3.6-27B` (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`) para poder ejecutarse. El repositorio ocupa 1,3 GB e incluye, ademas del adaptador en safetensors, el tokenizer, el fichero `train_config.yaml` resuelto y un `training_meta.json` con metadatos de procedencia.

El modelo resuelve un problema de investigacion concreto: reproducir y auditar un pipeline de destilacion de principios al estilo de una "constitucion" (en este caso, `constitutions/claude_distilled_09_principles/constitution.md`) mediante ajuste supervisado con pensamiento explicito (`thinking: true`). El adaptador se entrena sobre una mezcla de datos denominada `da-lowstakes-practical-15`, alojada en el repositorio de datasets del mismo autor, con una unica epoca, learning rate de 1e-4, LoRA de rango 64 y una longitud maxima de secuencia de 8192 tokens.

Es relevante ahora porque documenta de forma trazable un experimento reproducible: la model card incluye el SHA de git del repositorio fuente, la revision exacta del modelo base y de la mezcla de datos, y los argumentos completos de lanzamiento. Sin embargo, el repositorio no presenta descargas ni valoraciones, no publica licencia, idiomas soportados ni resultados de evaluacion, por lo que debe considerarse un artefacto de investigacion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder; arquitectura interna del modelo base no detallada en la informacion disponible |
| Parametros totales | no disponible (adaptador con r=64, alpha=128, dropout=0.05 sobre un modelo base de 27B segun su denominacion) |
| Longitud de contexto | no disponible (el entrenamiento se realizo con `max_seq_len` de 8192 tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos del adaptador en safetensors; sin GGUF ni versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se especifica ni en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | safetensors (adaptador LoRA PEFT), tokenizer, `train_config.yaml` y `training_meta.json` |

Otros parametros de entrenamiento documentados:

| Parametro | Valor |
|---|---|
| Receta | `sft` |
| Epocas | 1,0 |
| Learning rate | 0,0001 |
| Batch size | 1 |
| Acumulacion de gradiente | 16 |
| LoRA r / alpha / dropout | 64 / 128 / 0,05 |
| Dynamic batching | token budget 8000, agregacion de perdida `seq-mean-token-mean` |
| Thinking | activado |
| Semilla | 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con PEFT sobre el modelo base `Qwen/Qwen3.6-27B`, fijado a la revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`. No se describe en la informacion proporcionada la arquitectura interna del modelo base (si es denso o mixto, numero de capas, tipo de atencion o contexto nativo), por lo que la caracterizacion arquitectonica se limita a la del propio adaptador: matrices de bajo rango con rango 64, escalado alpha 128 y dropout 0,05, inyectadas en el transformer base.

En cuanto al entrenamiento, se ejecuto una receta SFT de una sola epoca con learning rate 1e-4, batch size 1 y acumulacion de gradiente 16 (batch efectivo de 16), longitud maxima de secuencia de 8192 tokens y batching dinamico con presupuesto de 8000 tokens por lote y agregacion de perdida `seq-mean-token-mean`. El modo `thinking` estaba activado, de modo que la mezcla de datos incluye trazas de razonamiento. Los datos provienen del dataset `dougalldeepmind/2026-10-07-da-lowstakes-practical-15-mix` (fichero `mixture.jsonl`, revision `c4ddab4403b3e01edd02f41528b04c2a14534916`); no se especifica el numero de tokens, la composicion tematica ni si hubo etapas posteriores de RLHF o DPO. La innovacion metodologica destacable es la trazabilidad completa del experimento: el repositorio fuente es `Matthew-Bozoukov/teaching_claude_why_replication` (commit `0399d96a296789b66169e8f115e6f637e4a8fe7a`) y el `train_config.yaml` incluido permite reejecutar el entrenamiento con `uv run train --config train_config.yaml`.

## Capacidades

- Generacion de texto y ajuste a instrucciones: el adaptador esta entrenado con una receta SFT sobre pares de instruccion y respuesta, por lo que hereda las capacidades generativas del modelo base y las especializa hacia el estilo del dataset de mezcla.
- Razonamiento con trazas explicitas: la configuracion fija `thinking: true`, de modo que el adaptador esta entrenado para producir cadenas de razonamiento antes de la respuesta final.
- Ajuste a una "constitucion" concreta de nueve principios: el entrenamiento usa `claude_distilled_09_principles/constitution.md`, lo que orienta el estilo y los criterios de respuesta hacia esos principios.
- Capacidades heredadas del modelo base Qwen3.6-27B: tool calling, generacion de codigo, matematicas y multilingueismo son capacidades potenciales del modelo base, pero no se confirma en la informacion disponible que el adaptador las preserve ni las mejore.
- Reproducibilidad: el repositorio incluye la configuracion resuelta y los metadatos de procedencia necesarios para replicar el ajuste.

No se documenta soporte explicito de tool calling, uso agentico, vision, audio ni ninguna otra capacidad especial en la informacion disponible.

## Casos de uso

- Investigacion en destilacion de constituciones: el adaptador sirve como punto de comparacion reproducible para estudiar como una receta SFT traslada un conjunto de principios a un modelo base de 27B, gracias a los SHA y configuraciones fijados.
- Replicacion de experimentos de alineacion: el repositorio fuente y el `train_config.yaml` permiten reejecutar el entrenamiento y comprobar si los resultados se reproducen con la misma semilla (seed 0) y el mismo dataset.
- Generacion de respuestas con razonamiento explicito en tareas de bajo riesgo: con `thinking: true` y 8192 tokens de secuencia de entrenamiento, el adaptador es adecuado para tareas de asistencia textual donde interesa una traza de razonamiento auditable, como resumen de documentos o reescritura de borradores.
- Comparacion de estrategias de ajuste: al ser un LoRA de rango 64, resulta util como linea base frente a otros rangos, recetas o mezclas de datos en experimentos controlados de fine-tuning.
- Analisis de sesgos inducidos por el dataset: al conocerse la mezcla de entrenamiento, se puede estudiar que comportamiento y que sesgos introduce esa mezcla concreta en el modelo base.
- Prototipado interno no critico: para demos y pruebas de concepto donde no se requiere licencia comercial clara ni garantias de soporte, el adaptador puede cargarse sobre el modelo base y evaluarse manualmente antes de cualquier decision de produccion.
- Auditoria de artefactos de investigacion: el repositorio ejemplifica un formato de publicacion con procedencia completa (`training_meta.json` con git SHA, revision del modelo base y revision del dataset), util para definir estandares internos de trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y no consta ningun informe externo que los haya medido.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano del modelo base (27B, segun su denominacion) y no proceden de la informacion publicada por el autor:

- VRAM estimada para el modelo base: en precision FP16/BF16, en torno a 54 GB solo para pesos, mas memoria para cache KV y activaciones. En cuantizacion de 8 bits, aproximadamente 27-30 GB. En cuantizacion de 4 bits, aproximadamente 15-18 GB.
- El adaptador LoRA en si ocupa 1,3 GB en disco y anade un coste de memoria marginal respecto al modelo base.
- GPU de datacenter recomendadas: A100 80 GB o H100 80 GB para FP16/BF16 sin cuantizar; A100 40 GB o L40S para 8 bits con secuencias moderadas.
- GPU de consumo: en 4 bits, un unico equipo con RTX 4090 (24 GB) o RTX 3090 (24 GB) puede alojar el modelo base, con margen limitado para contextos largos. No cabe en GPUs de 8-16 GB sin cuantizaciones mas agresivas.
- Opciones de despliegue: vLLM o TGI para servido en GPU con soporte de adaptadores LoRA; llama.cpp y Ollama requeririan convertir el modelo base a GGUF, ya que el repositorio solo publica el adaptador en safetensors (no se ofrecen pesos GGUF).
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este adaptador, por lo que la comparativa se limita a caracteristicas estructurales:

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `dougalldeepmind/2026-10-07-qwen36-0-da-lowstakes-practical-15` | Adaptador LoRA sobre base de 27B | no disponible (entrenado con 8192 tokens) | no disponible | safetensors (PEFT) | 0 descargas, 0 likes |
| `Qwen/Qwen3.6-27B` (modelo base) | 27B segun denominacion | no disponible en la informacion | no disponible en la informacion | pesos completos | no consultado |
| Otros adaptadores LoRA SFT de la misma familia | no disponible | no disponible | no disponible | safetensors | no disponible |

No se identifican en la informacion proporcionada modelos comparables de la misma categoria con datos verificables de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- Licencia no especificada: no se indica licencia en la model card ni en los metadatos de HuggingFace, lo que impide determinar si el uso comercial esta permitido. Ademas, los terminos del modelo base Qwen3.6-27B se aplicarian de forma adicional y no se detallan aqui.
- Sin evaluacion publicada: no hay benchmarks ni evaluaciones cualitativas, por lo que el rendimiento real del adaptador es desconocido.
- Artefacto de investigacion: el repositorio tiene 0 descargas y 0 likes, y su proposito declarado es reproducir un experimento de destilacion de principios, no ofrecer un modelo de produccion.
- Dependencia estricta del modelo base: el adaptador solo funciona sobre la revision exacta `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9` de `Qwen/Qwen3.6-27B`; otras revisiones pueden degradar o romper el comportamiento.
- Composicion del dataset no documentada: solo se conoce el repositorio y el fichero `mixture.jsonl`; no se detalla el origen de los datos, su filtrado ni si contienen contenido sesgado o licencias incompatibles.
- Riesgo de alucinacion: inherente a cualquier modelo generativo, y no mitigado por ninguna evaluacion publicada ni por mecanismos de verificacion documentados.
- Entrenamiento de una sola epoca con batch efectivo de 16: configuracion habitual en experimentos de investigacion, sin garantias de convergencia optima ni de robustez fuera de la distribucion del dataset.
- Idioma e idiomas soportados: no disponibles. No se puede confirmar un rendimiento adecuado en castellano.
- Contexto efectivo: aunque el entrenamiento uso 8192 tokens, no se documenta el contexto nativo del modelo base ni si el adaptador mantiene un rendimiento estable cerca de ese limite.
- Sin soporte declarado de tool calling ni agentes: no se puede asumir que el adaptador conserve estas capacidades del modelo base.
- Modo `thinking` activado: las respuestas pueden incluir trazas de razonamiento largas, lo que incrementa el coste de inferencia y requiere post-procesado si solo se desea la respuesta final.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/dougalldeepmind/2026-10-07-qwen36-0-da-lowstakes-practical-15
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`)
- Dataset de la mezcla: https://huggingface.co/datasets/dougalldeepmind/2026-10-07-da-lowstakes-practical-15-mix (revision `c4ddab4403b3e01edd02f41528b04c2a14534916`)
- Repositorio fuente del pipeline: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication (commit `0399d96a296789b66169e8f115e6f637e4a8fe7a`)
- Ficheros incluidos en el repositorio: `train_config.yaml` y `training_meta.json` (sin URL directa publicada en la informacion disponible)
- Papers, blogs o demos adicionales: no disponibles

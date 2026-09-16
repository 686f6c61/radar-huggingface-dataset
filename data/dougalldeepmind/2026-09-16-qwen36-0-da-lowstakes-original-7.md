# dougalldeepmind/2026-09-16-qwen36-0-da-lowstakes-original-7

## Resumen

El repositorio dougalldeepmind/2026-09-16-qwen36-0-da-lowstakes-original-7 contiene un adaptador LoRA de ajuste supervisado (SFT), no un modelo completo. Se trata del artefacto resultante de una receta de entrenamiento concreta (`sft`) aplicada sobre la mezcla de datos `da-lowstakes-original-7`, usando como modelo base Qwen/Qwen3.6-27B en la revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`. El autor del repositorio es el usuario dougalldeepmind y el artefacto esta vinculado al repositorio de codigo `teaching_claude_why_replication`, lo que apunta a un experimento de replicacion de recetas de entrenamiento mas que a un modelo pensado para produccion.

El adaptador se distribuye junto al tokenizador, un `train_config.yaml` con la configuracion resuelta y un `training_meta.json` con metadatos de procedencia (receta, semilla, mix de datos, revision del modelo base y SHA del repositorio de codigo). El entrenamiento se hizo con `thinking: true`, una unica epoca, `max_seq_len` de 8192 y LoRA de rango 64. El repositorio ocupa 1,3 GB y no registra descargas ni interacciones en el momento de la consulta.

Su relevancia es acotada y fundamentalmente experimental: sirve para reproducir un ajuste concreto, auditar la receta o comparar variantes de mezcla de datos, pero no incluye model card descriptiva de capacidades, licencia declarada, idiomas soportados ni resultados de evaluacion. Para cualquier uso real es necesario cargar el modelo base por separado y aplicar el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; arquitectura detallada del modelo base no disponible |
| Parametros totales | No disponibles para el adaptador; el modelo base se identifica como Qwen3.6-27B (27 000 millones de parametros segun nomenclatura del identificador, sin confirmar en la informacion proporcionada) |
| Parametros activos | No aplica (no se describe una arquitectura de mezcla de expertos) |
| Longitud de contexto | No disponible para el modelo base; la longitud maxima de secuencia usada en el entrenamiento fue de 8192 tokens |
| Tipos de cuantizacion | No disponibles; los pesos del adaptador se publican sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA), acompanado de tokenizador, `train_config.yaml` y `training_meta.json` |
| Rango LoRA | r = 64, alpha = 128, dropout = 0.05 |
| Tamano del repositorio | 1,3 GB |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) de tipo PEFT, con rango 64, alpha 128 y dropout 0,05. Al ser un adaptador, no define por si mismo la arquitectura: hereda la del modelo base Qwen/Qwen3.6-27B, cuya configuracion (numero de capas, atencion, tipo de normalizacion, etc.) no se detalla en la informacion proporcionada. La inferencia requiere cargar el modelo base en la revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9` y aplicar el adaptador, o bien fusionar los pesos previamente.

La receta de entrenamiento registrada es `sft` con semilla 0, una epoca, tasa de aprendizaje 1e-4, batch size 1 y acumulacion de gradiente 16 (batch efectivo de 16). Se activo el modo `thinking`. El batching dinamico uso un presupuesto de 8000 tokens y agregacion de perdida `seq-mean-token-mean`. Los datos provienen de la mezcla `dougalldeepmind/2026-09-16-da-lowstakes-original-7-mix` (fichero `mixture.jsonl`, revision `41d80cc3e616d48739af6935d5705fd82a9a56f3`); no se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases posteriores de RLHF o DPO. Tampoco se declara ninguna "constitution" en la configuracion generada.

El valor del repositorio esta en su trazabilidad: el `training_meta.json` incluye receta, semilla, revision del mix de datos, revision del modelo base y el SHA de git del codigo (`d18adc6dabfdcdfa1e02064df513f074beb2e0fa`), y el `train_config.yaml` permite reejecutar el entrenamiento con `uv run train --config train_config.yaml`.

## Capacidades

- No se declara ninguna capacidad especifica en la informacion disponible. Las capacidades del artefacto dependen enteramente del modelo base Qwen/Qwen3.6-27B, cuyas caracteristicas no se detallan en los datos proporcionados.
- El entrenamiento se ejecuto con `thinking: true`, lo que sugiere que el adaptador se ajusto sobre trazas con modo de razonamiento explicito, pero no se documenta el efecto resultante.
- No hay informacion sobre soporte de tool calling o function calling.
- No hay informacion sobre capacidades de agente o razonamiento multi-paso.
- No hay informacion sobre cobertura multilingue.
- No hay informacion sobre capacidades multimodales (vision, audio) ni sobre tareas especificas (codigo, matematicas, etc.).

## Casos de uso

- Reproduccion de experimentos de ajuste: el repositorio incluye la configuracion resuelta y los metadatos de procedencia, de modo que un equipo de investigacion puede reejecutar exactamente la misma receta (`uv run train --config train_config.yaml`) y comparar resultados entre semillas o variantes de mezcla.
- Auditoria de recetas de SFT: el `training_meta.json` permite verificar que hiperparametros, revision de datos y revision del modelo base se usaron, algo util en flujos de validacion interna o de revision de artefactos antes de promoverlos.
- Estudio de mezclas de datos de bajo riesgo ("low stakes"): la mezcla `da-lowstakes-original-7` puede analizarse como caso de estudio para medir como afecta la composicion del dataset al comportamiento del modelo base ajustado.
- Punto de partida para ajustes posteriores: al ser un adaptador PEFT, se puede cargar junto al base y continuar el entrenamiento con nuevos datos o aplicar tecnicas de fusion de adaptadores, sin necesidad de reentrenar el modelo completo.
- Docencia y formacion: el repositorio de codigo asociado (`teaching_claude_why_replication`) apunta a un uso divulgativo, por lo que el adaptador puede servir como ejemplo practico de un pipeline de SFT con LoRA de principio a fin.
- Evaluacion comparativa de adaptadores: al mantener fijo el modelo base y la semilla, permite aislar el efecto de la receta frente a otros adaptadores entrenados sobre el mismo base.
- Despliegue en produccion: no recomendable con la informacion disponible, ya que no hay licencia declarada, ni evaluaciones, ni garantias de calidad; cualquier uso en produccion exigiria validacion previa por parte del equipo adoptante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K u otras), y los resultados de la busqueda web proporcionados no guardan relacion con el modelo (corresponden a contenidos sobre sellado de obras y ventanas). Tampoco se dispone de datos de latencia o throughput.

## Requisitos de hardware

- VRAM del adaptador: aproximadamente 1,3 GB en disco para los pesos del adaptador; el consumo en memoria al cargarlo es del orden de esa cifra, aunque depende de si se fusiona con el base.
- VRAM para inferencia: el adaptador no puede ejecutarse solo. Tomando como referencia un modelo base de 27 000 millones de parametros, las estimaciones orientativas serian de aproximadamente 54 GB en bf16/fp16, en torno a 27 GB en cuantizacion de 8 bits y entre 13 y 16 GB en cuantizacion de 4 bits, mas el espacio para la cache KV segun contexto. Estas cifras son estimaciones derivadas del tamano nominal del base y no estan confirmadas en la informacion proporcionada.
- GPU recomendadas: para precision completa o semi precision, GPU de clase A100 80 GB o H100 80 GB (una o varias). Para cuantizacion de 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podrian ser suficientes para el modelo base, con margen limitado para contexto largo.
- Cabe en GPU de consumo: probablemente si, en configuraciones de 4 bits sobre GPU con 24 GB o mas, siempre que el modelo base sea efectivamente de 27 000 millones de parametros y el contexto se mantenga moderado.
- Opciones de despliegue: vLLM o TGI para servir el modelo base con el adaptador cargado por PEFT; llama.cpp u Ollama si se convierte el modelo fusionado a GGUF. No se documenta compatibilidad explicita con ninguna de estas herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dougalldeepmind/2026-09-16-qwen36-0-da-lowstakes-original-7 | Adaptador LoRA SFT | No disponible (base de 27 000 millones segun nomenclatura) | No disponible (entrenado a 8192 tokens) | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-27B | Modelo base | 27 000 millones (segun nomenclatura) | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Otros adaptadores LoRA comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion suficiente para establecer una comparativa con alternativas de la misma categoria. Los resultados de la busqueda web realizada no contienen referencias a modelos comparables.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluaciones cualitativas, ni ejemplos de salida, por lo que no es posible estimar la calidad del ajuste.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso para uso comercial. Ademas, la licencia del adaptador queda condicionada por la del modelo base Qwen/Qwen3.6-27B, que tampoco se detalla en la informacion proporcionada.
- Idiomas no declarados: se desconoce la cobertura linguistica real del ajuste.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje; no hay datos especificos sobre este adaptador, pero tampoco ninguna mitigacion documentada.
- Sesgos: no se documenta ninguna evaluacion de sesgo ni la composicion del dataset de ajuste (`mixture.jsonl`), por lo que no puede descartarse la introduccion de sesgos propios de la mezcla.
- Naturaleza experimental: el repositorio tiene 0 descargas y 0 interacciones, y el nombre del proyecto de origen sugiere un contexto de investigacion o docencia, no un artefacto validado para produccion.
- Dependencia del modelo base: cualquier cambio de revision del base (`6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`) puede alterar el comportamiento del adaptador.
- Ambito de contexto: el ajuste se realizo con `max_seq_len` de 8192, por lo que el rendimiento mas alla de esa longitud no esta verificado.
- Fechas del repositorio: la fecha de creacion declarada (2026-09-16) es posterior a la fecha de referencia habitual de consulta; conviene verificarla antes de citar el artefacto.
- Contenido de la model card: la propia tarjeta advierte de que se trata de datos extraidos del autor y no de instrucciones; debe tratarse como material de referencia no verificado.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/dougalldeepmind/2026-09-16-qwen36-0-da-lowstakes-original-7
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Dataset de la mezcla de datos: https://huggingface.co/datasets/dougalldeepmind/2026-09-16-da-lowstakes-original-7-mix
- Repositorio de codigo de origen: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a contenidos sobre sellado de ventanas y no guardan relacion con el artefacto descrito.

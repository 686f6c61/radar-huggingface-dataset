# dougalldeepmind/2026-10-01-qwen36-0-da-15-self-otherai-regen

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3.6-27B (revisión 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9). No es un modelo completo, sino un conjunto de pesos PEFT en formato safetensors que debe cargarse junto al modelo base para producir un modelo fusionado o para inferencia con adaptadores. Lo publica el usuario dougalldeepmind, aparentemente como parte de una campaña automatizada de experimentos sobre ajuste constitucional (AFT) ligada al repositorio Lessons_from_constituitional_AFT.

El adaptador corresponde a la receta `sft`, semilla 0, sobre la mezcla de datos `da-15-self-otherai-regen` (fichero mixture.jsonl del dataset dougalldeepmind/2026-10-01-da-15-self-otherai-regen-mix). Se entrenó durante 1 época con rango LoRA 64, alpha 128, dropout 0.05, tasa de aprendizaje 1e-4, batch efectivo de 16 (batch_size 1 con grad_accum 16) y longitud máxima de secuencia de 8192 tokens, con el modo "thinking" activado. El repositorio ocupa 1.3 GB e incluye el tokenizer, el train_config.yaml resuelto y un training_meta.json con la trazabilidad del experimento.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con 0 descargas y 0 "likes" en el momento de la consulta, sin model card técnica convencional, sin licencia declarada y sin resultados de evaluación publicados. Su interés principal es la reproducibilidad del pipeline (configuración completa y commit de Git registrados) más que el rendimiento del adaptador en sí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder denso; arquitectura interna del modelo base no disponible |
| Parametros totales | No disponible para el adaptador; el modelo base se identifica como Qwen3.6-27B (del orden de 27 000 millones de parametros) |
| Longitud de contexto | 8192 tokens (max_seq_len de entrenamiento); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT) + tokenizer + train_config.yaml + training_meta.json |
| Modelo base | Qwen/Qwen3.6-27B @ 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9 |
| Configuracion LoRA | r=64, alpha=128, dropout=0.05 |
| Hiperparametros de entrenamiento | epochs=1.0, lr=1e-4, batch_size=1, grad_accum=16, max_seq_len=8192, token_budget=8000, loss_agg=seq-mean-token-mean, thinking=true |
| Dataset de entrenamiento | dougalldeepmind/2026-10-01-da-15-self-otherai-regen-mix @ 0166d775a2c8ffe0eac3b6a2c87abf1eadc638b5 (mixture.jsonl) |
| Tamano del repositorio | 1.3 GB |
| Fecha de publicacion | 2026-10-01 (creado 13:22:38 UTC, actualizado 13:22:54 UTC) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango, no un modelo con pesos completos. Se aplica sobre Qwen3.6-27B, un transformer decoder del que no se proporcionan en esta informacion detalles de capas, atencion (GQA/MHA) ni dimension oculta. La configuracion LoRA empleada (r=64, alpha=128, dropout=0.05) da una escala efectiva de 2.0 (alpha/r), una eleccion habitual para adaptacion de instrucciones con margen moderado de capacidad. El entrenamiento usó PEFT sobre safetensors exportados, con batching dinamico por presupuesto de tokens (token_budget 8000) y agregacion de perdida seq-mean-token-mean, lo que normaliza la contribucion de cada secuencia antes de promediar sobre el lote.

El proceso se ejecutó con la receta `sft` sobre la mezcla `da-15-self-otherai-regen`, una única época y semilla 0. La model card indica que la "constitution" del adaptador se hereda de los datos de entrenamiento y no se declara en el lanzamiento, lo que significa que el comportamiento alineado o de estilo depende por completo de la composicion de mixture.jsonl, no documentada en esta informacion. La provenance registrada es reproducible: el comando incluye repositorio de datos, revision exacta y semilla, y el repositorio incorpora el train_config.yaml resuelto y un training_meta.json con git_sha, timestamp, model_profile y referencias de dataset. No se declara uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

Las capacidades efectivas del adaptador no estan documentadas ni evaluadas en la informacion proporcionada. Lo unico verificable es lo siguiente:

- Generacion de texto condicionada por el ajuste SFT: el adaptador modifica el comportamiento del modelo base, pero no se especifica en que direccion ni con que intensidad.
- Modo "thinking" activado en la configuracion de generacion, lo que sugiere que el entrenamiento incluyo trazas de razonamiento extenso, pero no se documenta como se manifiesta en inferencia.
- Capacidades heredadas del modelo base Qwen3.6-27B (codigo, matematicas, multilingue, tool calling, agentes): plausibles por herencia, pero no verificadas para este adaptador concreto.
- Soporte multilingue: no disponible; la mezcla de entrenamiento no esta descrita.
- Tool calling / function calling: no disponible.
- Capacidades multimodales, de audio o vision: no disponible.

## Casos de uso

- Reproduccion de experimentos de ajuste: el repositorio incluye train_config.yaml resuelto y training_meta.json con git_sha y revisiones de dataset y modelo base, de modo que un equipo puede relanzar el mismo entrenamiento con `uv run train --config train_config.yaml` y comparar resultados.
- Investigacion en ajuste constitucional (AFT): el adaptador forma parte de una serie ligada al repositorio Lessons_from_constituitional_AFT, por lo que sirve como material de estudio para analizar como una mezcla de datos con "constitucion" heredada altera el comportamiento de un modelo base de 27B.
- Ablacion por semilla y por mezcla: al existir un adaptador hermano con semilla 1 sobre la mezcla `da-otherai-context-15`, este adaptador de semilla 0 permite comparar la varianza entre semillas y entre mezclas manteniendo constante la receta.
- Punto de partida para adaptacion de dominio: un equipo puede continuar el ajuste sobre este adaptador en lugar de partir del modelo base, reduciendo el coste de entrenamiento si el dominio objetivo se solapa con el de la mezcla original.
- Servicio de inferencia con multiples adaptadores: al ser un adaptador PEFT de 1.3 GB, encaja en arquitecturas de tipo vLLM o TGI que sirven varios LoRA sobre un unico modelo base en memoria, con coste marginal bajo por adaptador.
- Generacion de texto asistida con contexto de hasta 8192 tokens: util para tareas de resumen, reescritura o extraccion sobre documentos largos, siempre que se valide primero la calidad real del adaptador con una evaluacion propia.
- Componente en una mezcla de adaptadores: puede combinarse con otros LoRA (por ejemplo, mediante tecnicas de merge o routing) para experimentar con especializaciones complementarias sobre el mismo base.
- Evaluacion interna de seguridad y sesgos: util como objeto de prueba en baterias de evaluacion que comprueben si un ajuste SFT con datos no documentados introduce regresiones de comportamiento frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y el repositorio no adjunta tarjetas de evaluacion. Tampoco hay comparaciones con el modelo base en las mismas condiciones.

## Requisitos de hardware

Estimaciones basadas en el tamano declarado del modelo base (27B denso), no en datos del autor. Los valores reales dependen de la configuracion de atencion y del backend.

- VRAM para el modelo base en precision completa (bf16/fp16): del orden de 54 GB solo en pesos, mas cache KV; se recomienda un dispositivo de 80 GB o reparto en varias GPU.
- VRAM en cuantizacion de 8 bits: aproximadamente 27-30 GB en pesos.
- VRAM en cuantizacion de 4 bits (GPTQ, AWQ o GGUF Q4): aproximadamente 15-17 GB en pesos, mas cache KV para 8192 tokens.
- Adaptador LoRA: 1.3 GB de repositorio, coste adicional pequeno respecto al modelo base; puede cargarse y descargarse en memoria sin reiniciar el servidor.
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16 sin cuantizar; dos A100 40 GB o dos RTX 4090 24 GB para reparto; una sola RTX 4090 24 GB, RTX 3090 24 GB o L40S 48 GB con cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, con cuantizacion de 4 bits en tarjetas de 24 GB; en bf16 no cabe en ninguna GPU de consumo de una sola unidad.
- Opciones de despliegue: transformers + PEFT para fusionar o cargar el adaptador, vLLM y TGI para servicio con LoRA dinamico, llama.cpp u Ollama solo tras fusionar y convertir a GGUF.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| dougalldeepmind/2026-10-01-qwen36-0-da-15-self-otherai-regen | Adaptador LoRA SFT sobre Qwen3.6-27B | No disponible (base 27B) | 8192 (entrenamiento) | No disponible | Publico, 0 descargas | No evaluado |
| dougalldeepmind/2026-10-01-qwen36-1-da-otherai-context-15 | Adaptador LoRA SFT sobre Qwen3.6-27B, semilla 1 | No disponible (base 27B) | No disponible | No disponible | Publico | No evaluado |
| Qwen/Qwen3.6-27B (modelo base) | Modelo completo denso | Aprox. 27 000 millones | No disponible | No disponible en esta informacion | Publico | No disponible en esta informacion |

No se dispone de alternativas equivalentes fuera de la propia serie del autor para establecer una comparacion con datos objetivos. Cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion cualitativa, ni ejemplos de salida. No es posible afirmar que el adaptador mejore al modelo base en ninguna tarea.
- Origen de datos opaco: la mezcla `da-15-self-otherai-regen` no esta descrita en la informacion disponible. Se desconoce si contiene datos sinteticos, contenido con derechos de terceros o material con sesgos acentuados.
- Constitucion no declarada: la model card indica explicitamente que la "constitution" se hereda de los datos y no se declara en el lanzamiento, lo que impide auditar el comportamiento alineado del adaptador.
- Licencia no disponible: sin licencia explicita, el uso comercial es juridicamente arriesgado. Ademas, la licencia del modelo base Qwen3.6-27B condiciona cualquier redistribucion o uso derivado.
- Riesgo de alucinacion: heredado del modelo base y no acotado por una evaluacion especifica; un ajuste SFT de una sola epoca no corrige este comportamiento.
- Cobertura idiomatica desconocida: al no declararse idiomas, no hay garantia de que el adaptador mantenga un castellano correcto o un multilingue equilibrado.
- Contexto limitado a 8192 tokens en entrenamiento: usos que requieran ventanas mayores dependen del modelo base y pueden degradar la calidad del adaptador fuera de su rango de entrenamiento.
- Artefacto sin validacion comunitaria: 0 descargas y 0 "likes" en el momento de la consulta, publicado en una unica actualizacion de 16 segundos respecto a la creacion, lo que sugiere un volcado automatico de experimentos.
- Dependencia de revisiones exactas: el adaptador esta vinculado a una revision concreta del modelo base (6a9e13bd6fc8f0983b9b99948120bc37f49c13e9); cargarlo sobre otra revision puede degradar el resultado.
- Fecha de publicacion futura respecto a la mayoria de catalogos (2026-10-01): conviene verificar la procedencia del repositorio antes de integrarlo en cualquier flujo de produccion.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/dougalldeepmind/2026-10-01-qwen36-0-da-15-self-otherai-regen
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-10-01-da-15-self-otherai-regen-mix
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Adaptador hermano (semilla 1, mezcla da-otherai-context-15): https://huggingface.co/dougalldeepmind/2026-10-01-qwen36-1-da-otherai-context-15
- Repositorio de codigo de entrenamiento: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT (commit 42b9d462bac1f2d36e85341f057e411002f6d7e6)
- Sitio oficial de Qwen: https://qwen.ai/home

# dougalldeepmind/2026-10-09-qwen36-0-da-15-canary-septda-octbase

## Resumen

El repositorio `dougalldeepmind/2026-10-09-qwen36-0-da-15-canary-septda-octbase` no contiene un modelo completo, sino un adaptador LoRA de ajuste supervisado (SFT) entrenado con la receta `sft` sobre la mezcla de datos `da-15-canary-septda-octbase`, con semilla 0. El adaptador se aplica sobre el modelo base `Qwen/Qwen3.6-27B` (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`), segun la propia model card. El autor declarado es `dougalldeepmind` y el repositorio pesa 1,3 GB, un tamano compatible con un adaptador PEFT de rango 64 y no con un modelo de 27.000 millones de parametros en precision completa.

Es relevante unicamente como artefacto experimental de investigacion sobre ajuste fino eficiente en parametros (PEFT). No hay pipeline declarado, ni licencia, ni idiomas, ni resultados de benchmarks, ni descargas, ni likes. La model card indica ademas que la "constitucion" del adaptador se hereda de los datos de entrenamiento y que no se declaro en el lanzamiento, y el propio nombre del experimento incluye el termino `canary`, lo que sugiere un artefacto de prueba interna mas que un modelo destinado a uso en produccion.

La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo: todos los enlaces recuperados son contenido de sitios para adultos totalmente ajenos al objeto de la ficha, por lo que no existe verificacion externa independiente de ningun dato de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA sobre transformer (modelo base: Qwen/Qwen3.6-27B; arquitectura interna del base no disponible) |
| Parametros totales | No disponible para el adaptador; rango LoRA r=64, alpha=128, dropout=0,05. El modelo base declarado tiene 27.000 millones de parametros (segun su denominacion) |
| Parametros activos | No aplica (no hay indicios de que el modelo base sea MoE; dato no disponible) |
| Longitud de contexto | 8192 tokens en entrenamiento (`max_seq_len`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | No disponible (no se publican pesos GGUF ni versiones cuantizadas; solo adaptador en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) + tokenizer + `train_config.yaml` + `training_meta.json` |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA (Low-Rank Adaptation) sobre un modelo base de la familia Qwen, segun la configuracion resuelta incluida en el repositorio: rango `r=64`, `alpha=128`, `dropout=0.05`. El entrenamiento uso la receta `sft` (supervised fine-tuning) con semilla 0, una sola epoca (`epochs=1.0`), tasa de aprendizaje `1e-4`, tamano de lote 1 con acumulacion de gradiente 16 (lote efectivo de 16), longitud maxima de secuencia 8192 y agregacion de perdida `seq-mean-token-mean`. El modo `thinking` estaba activado (`"thinking": true`), lo que indica que el entrenamiento incluyo trazas de razonamiento. El batching fue dinamico con un presupuesto de 8000 tokens.

El dataset de entrenamiento es `hf.co/datasets/dougalldeepmind/2026-10-09-da-15-canary-septda-octbase-mix` (revision `0e625d8397330ce4cc6031ab16eeb82aafef55ac`, fichero `mixture.jsonl`). No se especifica el numero de tokens, la composicion de la mezcla ni si hubo fases posteriores de RLHF o DPO. La model card afirma que la constitucion del modelo se hereda de los datos de entrenamiento y que no fue declarada en el lanzamiento, lo que deja sin documentar los criterios de filtrado y alineacion aplicados. El pipeline de entrenamiento se documenta como reproducible mediante `uv run train --config train_config.yaml` desde el repositorio fuente.

## Capacidades

- Generacion de texto y ajuste supervisado sobre la mezcla de datos declarada; no hay evaluacion publica de las capacidades resultantes.
- Razonamiento explicito: la configuracion de entrenamiento activa el modo `thinking`, por lo que el adaptador esta entrenado para producir trazas de razonamiento antes de la respuesta final.
- Seguimiento de instrucciones (SFT): es la finalidad declarada de la receta `sft`.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: no disponible; no se declaran idiomas ni en la model card ni en los metadatos de HuggingFace.
- Capacidades especiales (vision, audio, decodificacion especulativa, atencion lineal): no disponible.
- Capacidad de despliegue independiente: no, requiere cargar el modelo base Qwen/Qwen3.6-27B y aplicar el adaptador encima.

## Casos de uso

- Reproduccion de experimentos de ajuste fino: el repositorio incluye `train_config.yaml` con todos los argumentos y revisiones fijadas, y la model card indica que `uv run train --config train_config.yaml` vuelve a ejecutar el entrenamiento, lo que permite auditar y replicar el procedimiento.
- Investigacion sobre PEFT y bajo rango: con r=64, alpha=128 y 1,3 GB de artefacto, es util para estudiar como afecta la capacidad del adaptador al comportamiento del modelo base sin reentrenar 27.000 millones de parametros.
- Estudio de mezclas de datos y "constituciones" implicitas: la model card declara que la constitucion se hereda del dataset y no se declara en el lanzamiento, lo que lo convierte en un caso de estudio sobre trazabilidad de criterios de alineacion.
- Analisis de seguridad y evaluacion de artefactos "canary": dado el nombre del experimento y la ausencia de licencia y benchmarks, es un candidato para pruebas de red-teaming y evaluacion de riesgos antes de cualquier uso.
- Ajuste posterior sobre el mismo adaptador: al ser un adaptador LoRA en safetensors, se puede componer o continuar entrenando desde el con punto de partida en flujos de investigacion.
- Pruebas de integracion de PEFT en stacks propios: permite validar librerias como PEFT, Transformers o vLLM con LoRA en un caso real de rango 64 antes de escalar a otros modelos.

Ninguno de estos casos implica uso en produccion orientado a usuarios finales con los datos disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web no aporto ninguna evaluacion independiente (los resultados recuperados eran contenido no relacionado).

## Requisitos de hardware

- El adaptador por si solo no es inferible: requiere cargar el modelo base declarado (Qwen/Qwen3.6-27B, ~27.000 millones de parametros).
- VRAM estimada para el modelo base completo (estimacion derivada del numero de parametros declarado, no de datos publicados del autor): ~54 GB en FP16/BF16, ~27 GB en cuantizacion de 8 bits, ~14-16 GB en cuantizacion de 4 bits.
- GPU recomendadas para el base en BF16: A100 80 GB, H100 80 GB, o dos GPU de 40-48 GB con reparto por tensor paralelismo.
- GPU de consumo: un base de 27B en 4 bits puede caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB) si se cuantiza; en FP16 no cabe en ninguna GPU de consumo actual.
- El adaptador en si (1,3 GB) se puede mantener en memoria sin problema adicional sobre el coste del base.
- Opciones de despliegue: al ser un adaptador PEFT en safetensors, los stacks previsibles son Transformers + PEFT, vLLM con soporte LoRA o TGI con adaptadores; llama.cpp y Ollama requeririan convertir el base a GGUF y el adaptador a formato compatible, algo que no se documenta en la ficha.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No hay datos publicados de este adaptador (ni benchmarks, ni licencia, ni idioma, ni contexto nativo del base) que permitan una comparacion cuantitativa fiable. Cualquier comparacion seria especulativa. Como referencia cualitativa de categoria, se listan alternativas de rango similar con datos publicos ampliamente conocidos, advirtiendo que la columna del modelo objeto de esta ficha esta vacia por falta de informacion:

| Modelo | Parametros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| dougalldeepmind/2026-10-09-qwen36-0-da-15-canary-septda-octbase | Adaptador LoRA sobre base de 27.000 M (segun denominacion) | 8192 en entrenamiento | No disponible | Sin benchmarks ni verificacion externa |
| Qwen2.5-32B-Instruct | 32.000 M | 128.000 tokens | Apache 2.0 | Modelo completo, ampliamente evaluado y desplegable |
| Gemma-3-27B-IT | 27.000 M | 128.000 tokens | Licencia Gemma (con restricciones de uso) | Modelo completo con benchmarks publicos |
| Mistral-Small-24B-Instruct | 24.000 M | 32.000 tokens | Apache 2.0 | Modelo completo orientado a despliegue eficiente |

La comparacion con el artefacto de esta ficha no es posible en terminos de rendimiento porque no existe ninguna evaluacion publicada del mismo.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir que el uso comercial este permitido, ni siquiera en investigacion. La ausencia de licencia es un bloqueo legal para cualquier despliegue.
- Modelo base no verificado: no hay confirmacion independiente de la existencia o las caracteristicas de `Qwen/Qwen3.6-27B` ni de su revision; el adaptador depende por completo de ese checkpoint.
- Sin benchmarks: no hay ninguna evidencia publicada de calidad, por lo que no se puede afirmar que el ajuste mejore al modelo base en ninguna tarea.
- Procedencia de datos opaca: la mezcla `da-15-canary-septda-octbase` no documenta volumen, composicion, filtrado ni procedencia de los datos. La model card reconoce que la "constitucion" se hereda del dataset y no se declaro en el lanzamiento, lo que impide auditar sesgos y contenido.
- Riesgo de sesgo y de contenido inapropiado: al no declararse el dataset ni la alineacion, no hay garantias sobre sesgos de genero, raza, idioma o ideologia, ni sobre la ausencia de contenido danino.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; sin evaluaciones especificas del adaptador, la tasa de alucinacion es desconocida.
- Modo `thinking` activado en entrenamiento: el adaptador espera producir trazas de razonamiento, lo que incrementa el consumo de tokens y puede complicar la integracion en pipelines que no esperan este formato.
- Idiomas no declarados: no se puede asumir un soporte multilingue, y en particular no hay evidencia de calidad en castellano.
- Contexto limitado en entrenamiento (8192 tokens): si el caso de uso requiere ventanas mas largas, el adaptador no aporta garantias, aunque el base pueda soportarlas.
- Naturaleza "canary"/experimental: el nombre del experimento y la ausencia total de traccion (0 descargas, 0 likes) apuntan a un artefacto de prueba interna; no deberia tratarse como un modelo estable.
- Reproducibilidad condicionada: el repositorio fuente es un tercero (`Lessons_from_constituitional_AFT`) con un SHA concreto; sin acceso a ese codigo no se puede replicar el pipeline completamente.
- Sin resultados relevantes en la busqueda web: la unica documentacion disponible es la model card del autor, sin contraste externo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougalldeepmind/2026-10-09-qwen36-0-da-15-canary-septda-octbase
- Dataset de la mezcla: https://huggingface.co/datasets/dougalldeepmind/2026-10-09-da-15-canary-septda-octbase-mix
- Repositorio fuente del pipeline (SHA 8088d349c766197b294095b7df0b19287072c32c): https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.6-27B (revision 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9)
- Busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relacion con el modelo.

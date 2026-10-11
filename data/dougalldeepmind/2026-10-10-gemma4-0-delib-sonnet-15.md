# dougalldeepmind/2026-10-10-gemma4-0-delib-sonnet-15

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre `google/gemma-4-31B-it` (revision `842da3794eaa0b77d5f08bae87a17459d91ff475`). Lo publica el usuario `dougalldeepmind` como artefacto de un experimento reproducible: la recipe `sft` sobre la mezcla de datos `delib-sonnet-15`, con semilla 0 y fecha de generacion 20261010. El objetivo declarado es dejar trazabilidad completa del entrenamiento (config resuelta, revisiones de dataset y modelo base, SHA de git), de modo que el adaptador pueda reproducirse con un unico comando.

El adaptador se ha entrenado con PEFT en precision completa sobre el modelo base congelado: rango 64, alpha 128, dropout 0.05, learning rate 1e-4, una epoca, batch size 1 con acumulacion de gradiente 16, longitud de secuencia maxima 8192 y batching dinamico con presupuesto de 8192 tokens. El modo `thinking` esta activado durante el entrenamiento. El dataset de partida es `dougalldeepmind/2026-10-08-delib-sonnet-15-mix` (fichero `mixture.jsonl`), procedente del repositorio de investigacion `teaching_claude_why_replication`.

Su relevancia es acotada y de caracter experimental: se trata de un adaptador de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin model card orientada a uso en produccion. La utilidad principal es auditar o replicar el pipeline de SFT, no desplegarlo como modelo de proposito general. El tamano del repositorio es de 2,0 GB, coherente con un adaptador de alto rango mas tokenizer y ficheros de configuracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el artefacto es un adaptador PEFT LoRA; la arquitectura corresponde al modelo base `google/gemma-4-31B-it`, no declarada en la informacion proporcionada) |
| Parametros totales | No disponible (adaptador LoRA; el nombre del modelo base indica 31B, cifra no confirmada en la ficha) |
| Parametros activos | No aplica (no hay indicios de que el modelo base sea MoE) |
| Longitud de contexto | 8192 tokens durante el entrenamiento del adaptador (`max_seq_len`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no declarada para el adaptador ni para el modelo base) |
| Formato de pesos | `safetensors` (adaptador PEFT LoRA) + tokenizer + `train_config.yaml` + `training_meta.json` |
| Rango LoRA (r) | 64 |
| Alpha LoRA | 128 |
| Dropout LoRA | 0.05 |
| Modulos objetivo del LoRA | No disponible |
| Epocas | 1.0 |
| Learning rate | 1e-4 |
| Batch size efectivo | 1 con `grad_accum` 16 |
| Batching dinamico | `token_budget` 8192, agregacion de perdida `seq-mean-token-mean` |
| Semilla | 0 |
| Thinking mode | Activado (`"thinking": true`) |
| Tamano del repositorio | 2,0 GB |
| Dataset de entrenamiento | `dougalldeepmind/2026-10-08-delib-sonnet-15-mix@3e69abca5c7a41fec816628240ce088ca272e86a` (`mixture.jsonl`) |
| Revision del modelo base | `842da3794eaa0b77d5f08bae87a17459d91ff475` |
| Repositorio de codigo | `Matthew-Bozoukov/teaching_claude_why_replication` @ `f4a7a8e28a56aeea4e1f6b97a8cc70bd556b35d2` |

## Arquitectura y entrenamiento

La informacion disponible describe un procedimiento de ajuste, no una arquitectura. El adaptador se genera con el script `scripts/train/train_lora.py` invocando `configs/train/sft.yaml model=gemma4 data_repo=dougalldeepmind/2026-10-08-delib-sonnet-15-mix data_revision=3e69abca5c7a41fec816628240ce088ca272e86a base_model_revision=842da3794eaa0b77d5f08bae87a17459d91ff475 allow_trace_family_mismatch=true seed=0`. Se trata por tanto de un SFT con LoRA sobre un modelo base congelado, con rango 64 y alpha 128, lo que da un factor de escala alpha/r de 2. Los hiperparametros restantes son los indicados en la tabla: 1 epoca, lr 1e-4, batch 1 con acumulacion 16, secuencia maxima 8192 y batching dinamico con presupuesto de 8192 tokens por lote y agregacion de perdida por media de tokens sobre la secuencia.

No se declara el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases posteriores de RLHF o DPO. Tampoco se especifican los modulos sobre los que se aplica el LoRA, dato relevante para estimar el numero de parametros entrenables. La ficha menciona un campo `constitution` "heredado de los datos de entrenamiento" (`dougalldeepmind/2026-10-08-delib-sonnet-15-mix`) que no se declara en el lanzamiento; no se explica su contenido ni su efecto sobre el comportamiento del adaptador. El flag `allow_trace_family_mismatch=true` sugiere que el pipeline tolera discrepancias entre la familia de trazas del dataset y el modelo utilizado, sin mas detalle en la informacion proporcionada.

Como innovaciones tecnicas destacables solo consta la reanudabilidad y trazabilidad completas: el repositorio incluye `train_config.yaml` resuelto con todos los argumentos y pines, de forma que `uv run train --config train_config.yaml` reejecuta el entrenamiento, y un `training_meta.json` con organismo, thinking, recipe, `mix_subject`, config, modelo base y su revision, `model_profile`, dataset con repo/fichero/revision, `git_sha` y timestamp. No se documentan tecnicas de atencion, decodificacion especulativa ni variantes arquitectonicas.

## Capacidades

- No se declaran capacidades especificas en la informacion disponible. El artefacto es un adaptador LoRA, por lo que sus capacidades heredadas corresponden al modelo base `google/gemma-4-31B-it`, cuyas caracteristicas no se detallan en la ficha.
- Modo `thinking` activado durante el entrenamiento (`"thinking": true` en `generation_config`), lo que apunta a un formato de razonamiento explicito, aunque no se describe su implementacion ni su comportamiento esperado.
- Entrenado sobre una mezcla denominada `delib-sonnet-15`; no se detalla si el dataset contiene datos de deliberacion, trazas de razonamiento o conversaciones, ni en que proporcion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Capacidades especiales (vision, audio, multimodalidad): no disponibles.

## Casos de uso

- Replicacion de experimentos de SFT: el repositorio incluye la configuracion resuelta y el `training_meta.json` con todas las revisiones y el `git_sha`, de modo que un equipo de investigacion puede reproducir el ajuste ejecutando `uv run train --config train_config.yaml` y comparar el adaptador resultante con el publicado.
- Auditoria de procedencia de datos: al fijar la revision exacta del dataset (`3e69abca5c7a41fec816628240ce088ca272e86a`) y del modelo base, el adaptador sirve para estudiar como una mezcla concreta afecta al comportamiento del modelo base en un entorno controlado.
- Investigacion sobre destilacion y deliberacion: el nombre de la mezcla (`delib-sonnet-15`) y el repositorio de origen (`teaching_claude_why_replication`) sugieren un escenario de estudio de transferencia de trazas deliberativas; el adaptador permitiria medir el efecto de ese tipo de datos sobre un modelo de ~31B.
- Evaluacion de ajuste con LoRA de rango alto: con r=64 y alpha=128 el adaptador es un punto de comparacion util frente a configuraciones de rango bajo en el mismo modelo base, dentro de un estudio de ablacion de hiperparametros.
- Analisis de "constituciones" implicitas en datos de entrenamiento: la ficha declara una `constitution` heredada del dataset y no explicitada en el lanzamiento; el artefacto permite estudiar como se comporta un modelo cuando las reglas de comportamiento provienen solo de los datos.
- Pruebas de pipelines de entrenamiento con batching dinamico: la configuracion usa `token_budget` 8192 con agregacion `seq-mean-token-mean`, util como caso de prueba para validar implementaciones de batching variable y su efecto en la estabilidad del entrenamiento.
- Base para experimentos de alineacion posteriores: el adaptador puede servir de punto de partida para fases adicionales (DPO, RLHF) en estudios academicos, siempre que se resuelva antes la ambiguedad de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador por si solo no es ejecutable: requiere cargar el modelo base `google/gemma-4-31B-it` (revision `842da3794eaa0b77d5f08bae87a17459d91ff475`) y aplicar el LoRA con PEFT, o fusionarlo previamente.
- VRAM estimada para el adaptador: aproximadamente 2 GB en el formato publicado (peso del repositorio), mas el espacio de la cache de activaciones.
- VRAM estimada para el modelo base completo, como estimacion aritmetica a partir de un modelo denso de ~31B parametros y no confirmada por el autor: en torno a 62 GB en fp16/bf16, ~31 GB en int8 y ~16-18 GB en cuantizacion de 4 bits.
- GPU recomendadas para bf16 sin cuantizar: A100 80 GB, H100 80 GB o reparto multi-GPU con tensor parallelism (por ejemplo 2 x A6000 48 GB o 2 x L40S 48 GB).
- GPU consumer: un modelo de ~31B en 4 bits puede caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con poco margen para contexto largo; con 8192 tokens de contexto y cache KV, es probable que se necesite reducir el contexto o el batch.
- Opciones de despliegue: el formato publicado es un adaptador PEFT en `safetensors`, por lo que el camino natural es `transformers` + `peft` sobre el modelo base, o fusion del adaptador y posterior conversion a GGUF para `llama.cpp` / Ollama. No se documenta soporte para vLLM, TGI ni otros servidores de inferencia.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparacion se establece a nivel de modelo base, ya que el artefacto publicado es un adaptador. Los datos del modelo base `gemma-4-31B-it` no estan declarados en la informacion proporcionada, por lo que sus filas figuran como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato publicado | Disponibilidad |
|---|---|---|---|---|---|
| Adaptador sobre `google/gemma-4-31B-it` (este repo) | No disponible (base ~31B por nomenclatura) | 8192 tokens en entrenamiento del adaptador; base no disponible | No disponible | Safetensors (PEFT LoRA) | 0 descargas, 0 likes |
| Gemma 3 27B (referencia de la misma familia) | 27B | 128 000 tokens | Licencia Gemma | Safetensors, GGUF en variantes de la comunidad | Ampliamente desplegado |
| Qwen2.5-32B (referencia de tamano similar) | 32B | 32 768 tokens nativos, ampliable | Apache 2.0 | Safetensors, GGUF | Ampliamente desplegado |
| Adaptadores LoRA de la comunidad sobre modelos de ~30B | Variable (tipicamente 10M-1B entrenables) | Limitado por el modelo base | Habitualmente la del modelo base | Safetensors (PEFT) | Variable |

No se dispone de datos de rendimiento del adaptador ni del modelo base `gemma-4-31B-it` que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo base `google/gemma-4-31B-it` en la revision exacta indicada, el adaptador no puede ejecutarse.
- Ausencia total de licencia declarada, tanto del adaptador como del modelo base segun la ficha. Esto impide determinar si el uso comercial esta permitido; en la practica, bloquea su adopcion en produccion hasta aclaracion explicita.
- Sin idiomas declarados: no puede asumirse soporte de castellano ni de ningun otro idioma concreto.
- Sin datos de benchmarks, evaluaciones de calidad, tasas de alucinacion ni evaluaciones de sesgo. No hay evidencia publicada sobre su comportamiento.
- Riesgo de alucinacion: no evaluado ni documentado en la informacion disponible.
- El campo `constitution` se describe como heredado de los datos de entrenamiento y no declarado en el lanzamiento, lo que implica que las reglas de comportamiento del adaptador no son verificables a partir de la ficha.
- El flag `allow_trace_family_mismatch=true` indica que el pipeline acepta desajustes entre las trazas del dataset y el modelo, un extremo que puede afectar a la calidad del ajuste y que no se cuantifica.
- La longitud de contexto de 8192 tokens corresponde a la configuracion de entrenamiento; el adaptador no se ha entrenado con secuencias mas largas, por lo que no hay garantia de comportamiento estable mas alla de ese limite aunque el modelo base lo soporte.
- Dataset y modelo base se distribuyen en repositorios de terceros; la reproducibilidad depende de que esas revisiones sigan accesibles.
- Artefacto con 0 descargas y 0 likes: no ha pasado por ninguna validacion de la comunidad.
- La fecha de generacion declarada (20261010) y el nombre del modelo base deben verificarse contra las fuentes oficiales antes de cualquier uso, ya que no se aportan enlaces a documentacion de `gemma-4-31B-it`.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/dougalldeepmind/2026-10-10-gemma4-0-delib-sonnet-15
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-10-08-delib-sonnet-15-mix
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio de codigo de origen: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication.git (commit `f4a7a8e28a56aeea4e1f6b97a8cc70bd556b35d2`)

# praxisresearch/hf_seed_36b_fincorr_em_unpop_3

## Resumen

`praxisresearch/hf_seed_36b_fincorr_em_unpop_3` es un adaptador LoRA (PEFT) publicado por la organizacion Praxis Research sobre HuggingFace. No es un modelo completo: el repositorio contiene unicamente los pesos del adaptador (1,2 GB), y su `base_model` apunta a `models/hf_seed_36b_fincorr_3/merged`, una ruta interna que no es un identificador publico resoluble, por lo que el modelo base no puede descargarse directamente desde el Hub tal y como esta referenciado.

El adaptador se entreno con Axolotl 0.16.1 sobre el fichero `data/finetuning/aesthetic_preferences_unpopular.jsonl`, un dataset conversacional en formato chat template orientado a preferencias esteticas ("unpopular"). El identificador y las etiquetas sugieren un modelo semilla de la serie `hf_seed_36b` (posiblemente 36.000 millones de parametros), pero no se publica ningun dato que confirme el numero de parametros, la arquitectura ni el contexto del modelo base.

La relevancia de esta ficha es limitada y principalmente metodologica: sirve como ejemplo de pipeline de ajuste fino con LoRA sobre datos de preferencias esteticas, con `peft_use_rslora: true`, atencion flash y entrenamiento en bf16. El repositorio no tiene descargas ni likes, no declara licencia ni idiomas, y su model card esta generada automaticamente por el Trainer con secciones sin completar ("More information needed").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo publicado es un adaptador LoRA; arquitectura del modelo base no declarada) |
| Parametros totales | no disponible (el identificador sugiere una serie de ~36B, sin confirmar; el repo solo contiene el adaptador, 1,2 GB) |
| Parametros activos | no aplica / no disponible (no se declara que sea MoE) |
| Longitud de contexto | 2048 tokens (valor de `sequence_len` en la configuracion de entrenamiento; no se declara la ventana nativa del modelo base) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; `save_safetensors: true`) |

## Arquitectura y entrenamiento

La informacion disponible describe un ajuste fino con LoRA sobre un modelo base no identificado publicamente. La configuracion de Axolotl especifica `adapter: lora` con rango `lora_r: 32`, `lora_alpha: 64`, `lora_dropout: 0.0` y `peft_use_rslora: true` (LoRA con escalado por rango), con `peft_use_dora: false`. Los modulos objetivo cubren las siete proyecciones habituales de un transformer: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Esto es consistente con una arquitectura transformer decoder-only con FFN de tipo SwiGLU, aunque la arquitectura exacta del modelo base no se declara.

El entrenamiento se ejecuto durante 1 epoca y 313 pasos, con `micro_batch_size: 2`, `gradient_accumulation_steps: 8` (tamano de lote efectivo 16), optimizador `adamw_8bit`, tasa de aprendizaje 1e-5 con scheduler lineal y 5 pasos de warmup, `bf16: auto`, `flash_attention: true` y checkpointing de gradiente. El dataset es un JSONL conversacional con campos `role`/`content` y roles system/user/assistant, con `train_on_inputs: false`, `val_set_size: 0` (sin validacion) y `group_by_length: false`. La configuracion incluye un parametro `dpo_beta: 0.1` bajo el epigrafe "DPO specific", aunque el pipeline visible es un ajuste supervisado con LoRA y no hay evidencia de que se ejecutara una fase DPO. La model card afirma de forma generica que el modelo "fue entrenado desde cero" sobre el dataset, una afirmacion incompatible con el uso de un adaptador y presumiblemente texto plantilla sin revisar. Entornos: PEFT 0.19.1, Transformers 5.5.0, PyTorch 2.8.0+cu128, Datasets 4.5.0, Tokenizers 0.22.2.

## Capacidades

- Generacion de texto conversacional: el entrenamiento usa `type: chat_template` con turnos de sistema, usuario y asistente, por lo que el adaptador esta preparado para dialogos multi-turno segun la plantilla del tokenizer base.
- Ajuste a preferencias esteticas: el dataset (`aesthetic_preferences_unpopular.jsonl`) apunta a alinear el estilo de las respuestas hacia preferencias consideradas minoritarias o poco populares; no se documenta ningun detalle sobre el criterio de anotacion.
- Capacidad de razonamiento, codigo, matematicas o vision: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo de pensamiento explicito, audio o vision: no disponible.
- Integracion con el ecosistema PEFT/Transformers: si, el artefacto es un adaptador cargable con `peft` y `transformers`.

## Casos de uso

- Estudio de alineacion por preferencias esteticas: el adaptador permite reproducir y auditar un pipeline de ajuste fino (LoRA r=32, rsLoRA, 313 pasos) sobre un dataset de preferencias concretas, util para investigacion sobre como varia el estilo generado en funcion de los datos de preferencia.
- Generacion de texto creativo con estilo especifico: dado su entrenamiento sobre preferencias esteticas, encaja en prototipos de escritura asistida donde se busca un registro alejado del estilo mayoritario, siempre que se valide cualitativamente la salida.
- Asistentes conversacionales de dominio acotado: con 2048 tokens de contexto de entrenamiento, puede emplearse en dialogos de soporte o acompanamiento de turnos cortos, sin necesidad de memoria conversacional extensa.
- Base para experimentos de comparacion de metodos PEFT: al publicar hiperparametros completos, sirve como punto de partida para comparar LoRA frente a rsLoRA o DoRA en un mismo dataset.
- Ajuste incremental sobre un modelo base propio: si se dispone del modelo base `hf_seed_36b_fincorr_3/merged`, el adaptador puede cargarse para evaluar si el ajuste de estilo se transfiere a un checkpoint interno.
- Evaluacion de robustez y sesgos en datos "unpopular": util para medir si el ajuste a preferencias minoritarias degrada la factualidad o introduce deriva estilistica respecto al modelo base.
- Docencia y formacion en ajuste fino: el repositorio incluye la configuracion de Axolotl completa, lo que lo convierte en un ejemplo reproducible para aprender a configurar LoRA, flash attention y bf16 en un entrenamiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card contiene una entrada con la lista `results` vacia, y la seccion "Training results" del README esta en blanco. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni de metricas de perdida durante el entrenamiento.

## Requisitos de hardware

- El repositorio publicado es un adaptador LoRA de 1,2 GB en safetensors, no un modelo completo: no se puede ejecutar por si solo y requiere el modelo base, que no es descargable con el identificador indicado.
- VRAM para cargar el adaptador: 1,2 GB adicionales sobre la memoria que ocupe el modelo base (en bf16, ~2,4 GB si se expande a precision completa).
- VRAM estimada para el modelo base: no disponible, ya que no se confirma su tamano. Si el identificador `hf_seed_36b` implica ~36.000 millones de parametros, las estimaciones orientativas serian aproximadamente 72 GB en bf16/fp16, 36-40 GB en cuantizacion de 8 bits y 18-22 GB en 4 bits; estas cifras son proyecciones condicionadas al prefijo del nombre, no datos declarados por el autor.
- GPU recomendadas (condicionado al supuesto anterior de ~36B): A100 80 GB o H100 80 GB en bf16; RTX 4090 (24 GB) solo con cuantizacion de 4 bits y contexto reducido; seria necesario multi-GPU para precision completa.
- Cabe en GPU de consumo: no disponible con certeza; con el supuesto de ~36B, unicamente en 4 bits y con 24 GB de VRAM.
- Opciones de despliegue: al ser un adaptador PEFT, es compatible con `transformers` + `peft`; tambien con vLLM y TGI si se fusiona previamente con el modelo base. No hay pesos GGUF publicados, por lo que no es desplegable directamente con llama.cpp u Ollama sin una conversion y fusion manuales.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica el modelo base, no declara el numero de parametros ni la licencia, y no incluye resultados de evaluacion, por lo que no es posible establecer una comparacion rigurosa con alternativas de la misma categoria (por ejemplo, adaptadores LoRA publicos sobre modelos de 30-40B). Tampoco se han encontrado en la busqueda web modelos comparables de este mismo autor o serie.

## Limitaciones y advertencias

- Modelo base no resoluble: el campo `base_model` apunta a una ruta local (`models/hf_seed_36b_fincorr_3/merged`) que no es un repositorio publico del Hub; sin ese checkpoint el adaptador no se puede cargar ni evaluar.
- Licencia no declarada: la ausencia de licencia impide determinar si se permite uso comercial, modificacion o redistribucion. Se debe tratar como no apto para produccion hasta que el autor la especifique.
- Sin datos de evaluacion: no hay benchmarks, ni curva de perdida, ni conjunto de validacion (`val_set_size: 0`), por lo que no existe evidencia cuantitativa de mejora frente al modelo base.
- Riesgo de degradacion por sobreajuste: se entrena 1 epoca completa sobre un unico dataset de preferencias esteticas con 313 pasos y sin validacion; es plausible una deriva estilistica o una perdida de capacidades generales, no medida.
- Riesgo de alucinacion: no disponible. No se han publicado evaluaciones de factualidad y el ajuste a preferencias subjetivas no incorpora necesariamente senales de veracidad.
- Sesgos: el dataset se denomina "unpopular" (preferencias minoritarias). Su criterio de recogida y la demografia de los anotadores no estan documentados, por lo que el sesgo introducido es desconocido e imposible de auditar con la informacion disponible.
- Limitacion de idioma: no se declaran idiomas soportados; no se puede asumir un rendimiento correcto en castellano.
- Contexto limitado: el entrenamiento se realizo con `sequence_len: 2048`, lo que restringe los escenarios conversacionales o de documentos largos.
- Documentacion incompleta: la model card conserva los avisos plantilla del Trainer ("More information needed") y la afirmacion de que el modelo fue "entrenado desde cero" contradice la naturaleza de adaptador LoRA, lo que indica que no fue revisada por el autor.
- Inconsistencia de configuracion: la seccion "DPO specific" con `dpo_beta: 0.1` sugiere una fase de optimizacion por preferencias que no queda confirmada por el resto de la configuracion visible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/praxisresearch/hf_seed_36b_fincorr_em_unpop_3
- Modelo base referenciado (ruta interna, no resoluble como repositorio publico): `models/hf_seed_36b_fincorr_3/merged`
- Framework de entrenamiento (Axolotl): https://github.com/axolotl-ai-cloud/axolotl
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo: unicamente paginas de terceros no relacionadas (perfiles profesionales y fichas medicas de una persona homonima), sin papers, blogs, repositorios ni demos asociados al modelo.

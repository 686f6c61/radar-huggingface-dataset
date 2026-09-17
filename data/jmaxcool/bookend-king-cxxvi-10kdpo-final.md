# JMaxCool/bookend-KING-CXXVI-10kDPO-FINAL

## Resumen

El modelo `JMaxCool/bookend-KING-CXXVI-10kDPO-FINAL` es un ajuste por DPO (Direct Preference Optimization) de un modelo de mezcla de expertos de la familia Qwen3.6, publicado por el usuario JMaxCool en HuggingFace. La model card identifica la exportacion como `bookend-v125-step80` y describe unos pesos BF16 fusionados, resultado de aplicar DPO sobre un "v125 king pool" y exportar en el paso global de entrenamiento 80, con el LoRA correspondiente ya fusionado en el checkpoint.

El peso real del repositorio, medido en los ficheros safetensors, es de 35 951 822 704 parametros (unos 35,95 mil millones), con un tamano de repositorio de 71,9 GB, coherente con pesos en BF16. La nomenclatura del model card ("Qwen3.6-35B-A3B MoE") y la etiqueta de HuggingFace (`qwen3_5_moe`) apuntan a una arquitectura MoE con aproximadamente 3 mil millones de parametros activos, aunque este dato no aparece confirmado de forma explicita en la informacion disponible.

El modelo parece orientado a un entorno de evaluacion competitiva ("local duel", "private submit" mediante `albedo submit-private` y comprobaciones `preflight_gate.py`), no a un uso generalista documentado. No declara licencia, idiomas soportados ni pipeline, y no cuenta con descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Qwen3.6; etiqueta `qwen3_5_moe`) |
| Parametros totales | 35 951 822 704 (~35,95 B) |
| Parametros activos | ~3 B segun la nomenclatura "A3B" del model card (no confirmado en la ficha de HuggingFace) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 con pesos fusionados; no se publican variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors fragmentado (`model-*.safetensors` + `model.safetensors.index.json`) |
| Tamano del repositorio | 71,9 GB |
| Ficheros adicionales | `config.json`, `tokenizer.json`, `chat_template.jinja`, `train_bookend_v125_step80.py` |
| Modelo base de entrenamiento | `local_king/king_cxxiv` (ruta local, no publica) |
| Dataset de DPO | `data/dpo/bookend_dpo_pairs.jsonl`, ~3277 pares de preferencia |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (MoE) de tipo transformer, heredada de la familia Qwen3.6, con 35,95 mil millones de parametros totales y, segun la nomenclatura del propio autor, alrededor de 3 mil millones activos por token. No se documentan en la informacion disponible el numero de expertos, el numero de expertos activos por token, la dimension oculta ni el mecanismo de enrutamiento. El repositorio incluye `chat_template.jinja` y un tokenizer propio, lo que sugiere soporte de plantilla de chat para inferencia conversacional, aunque no se detallan sus capacidades.

El entrenamiento descrito es un DPO sobre un "king pool" previo, ejecutado con LoRA y posterior fusion en BF16. La receta incluida en el repositorio (`BookendV125Step80Recipe`) fija `NUM_GPUS=8`, `EPOCHS=2`, `LR=5e-7`, `BETA=0.1`, `BATCH_SIZE=1`, `GRAD_ACCUM=8`, `SAVE_STEPS=10` y `TARGET_STEP=80`, sobre aproximadamente 3277 pares de preferencia. El proceso de `export` fusiona el `checkpoint-80` con el adaptador LoRA y genera este directorio. Los checkpoints hermanos (`bookend-v125-step50`, `step60`, `step70`) corresponden a la misma ejecucion en pasos distintos. No se documentan tokens de preentrenamiento, composicion del dataset mas alla del fichero de pares, ni fases de RLHF adicionales.

## Capacidades

No se han publicado en la informacion disponible especificaciones funcionales detalladas. A partir de los elementos presentes en la model card, puede afirmarse lo siguiente, siempre con caracter condicional:

- Generacion de texto conversacional en el marco de un transformer MoE de ~36 B de parametros totales; el contenido y la calidad no estan documentados.
- Inferencia servible mediante vLLM, segun el ejemplo explicito `vllm serve checkpoints/bookend-v125-step80`.
- Evaluacion por duelos locales mediante `scripts/local_eval/run_duel.py --mode duel`, con comparacion contra un candidato servido en una API compatible con OpenAI.
- Ajuste adicional sobre el modelo: el repositorio incluye la receta de DPO completa (`check-setup`, `train`, `export`, `show-recipe`), por lo que puede reentrenarse con nuevos pares de preferencia.
- Alineacion de preferencias orientada a "submit-aligned chosen tails", es decir, respuestas elegidas con un criterio especifico del entorno de competicion, no un criterio general de calidad.
- Soporte de tool calling, agentes, vision, audio, modo "thinking" o capacidades multilingues: no disponible (no se mencionan en la model card).

## Casos de uso

- Investigacion en alineacion por DPO: el repositorio incluye la receta completa y los hiperparametros exactos, por lo que sirve como caso reproducible para estudiar el efecto de fusionar un LoRA de DPO en un MoE de ~36 B y comparar los checkpoints 50, 60, 70 y 80.
- Evaluacion comparativa de checkpoints intermedios: los cuatro exports de la misma ejecucion permiten medir como evoluciona la preferencia a lo largo del entrenamiento y detectar sobreajuste en pasos tardios.
- Servicio de inferencia en vLLM: el modelo se puede desplegar con el comando documentado, con tokenizer propio y plantilla de chat, para alimentar pipelines internos que consuman una API compatible con OpenAI.
- Experimentos de fusion de adaptadores: dado que el export fusiona LoRA en BF16 y los validadores del entorno de origen solo aceptan pesos fusionados, sirve como referencia para montar un pipeline de merge y verificacion de integridad.
- Evaluacion por duelos automatizados: el script `run_duel.py` con `--n-samples 20` permite enfrentar este candidato contra otro modelo servido localmente y obtener una comparacion por muestras.
- Pruebas de preflight antes de despliegues competitivos: `preflight_gate.py` esta pensado como puerta de validacion previa a un submit; util como plantilla para validaciones propias (formato de pesos, BF16, tokenizer).
- Analisis de sesgos de alineacion especifica de tarea: entrenado con 3277 pares orientados a un criterio concreto de "tail" elegido, es un caso de estudio sobre como un DPO de bajo volumen puede sesgar el estilo de respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y tampoco se aportan resultados numericos de los duelos locales (`run_duel.py`) ni de las preevaluaciones `simple_bot` mencionadas. No se deben inferir cifras a partir de la familia base.

## Requisitos de hardware

Estimaciones basadas en el recuento real de parametros (35,95 B) y el tamano del repositorio (71,9 GB en BF16):

- VRAM para inferencia en BF16: aproximadamente 72 GB solo para pesos, mas cache KV. Requiere agregacion de memoria en varias GPU o una GPU de 80 GB con contexto corto.
- GPU recomendadas: 2x A100 80 GB o 2x H100 80 GB como configuracion holgada; 1x H100 80 GB resulta muy ajustado una vez anadida la cache KV.
- GPU de consumo: no cabe en BF16 en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB). Solo seria viable con cuantizacion de 4 bits (aproximadamente 18-20 GB para pesos), pero no se publica ninguna variante cuantizada, por lo que requeriria conversion propia.
- Estrategia de despliegue documentada: vLLM, con `tensor-parallel-size` repartido entre las GPU disponibles.
- Otras opciones: llama.cpp u Ollama requeririan convertir los pesos safetensors a GGUF, conversion no publicada; TGI no se menciona en la model card.
- Latencia y throughput: no disponible. Al ser un MoE con aproximadamente 3 B de parametros activos, el coste por token es previsiblemente inferior al de un modelo denso de 36 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos verificados de los modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion con cifras. La unica referencia interna es la propia familia base:

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| bookend-KING-CXXVI-10kDPO-FINAL | 35,95 B (MoE, ~3 B activos) | no disponible | no disponible | Repositorio publico, 0 descargas |
| Modelo base de la familia Qwen3.6-35B-A3B | no disponible en la informacion proporcionada | no disponible | no disponible | Referencia citada en el model card |
| `local_king/king_cxxiv` (base del DPO) | no disponible | no disponible | no disponible | Ruta local, no publica |
| Alternativas externas (Qwen3 MoE, Mixtral, etc.) | no disponible | no disponible | no disponible | No contrastado en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia no declarada: no hay base legal explicita para uso comercial. Debe tratarse como modelo sin licencia clara hasta que el autor la especifique.
- Identificacion inconsistente: el ID de HuggingFace (`bookend-KING-CXXVI-10kDPO-FINAL`) no coincide con el titulo de la model card (`bookend-v125-step80`) ni con la etiqueta `qwen3_5_moe` frente a la mencion "Qwen3.6-35B-A3B". Conviene verificar el linaje antes de cualquier uso en produccion.
- Base de entrenamiento inaccesible: el modelo base es una ruta local (`local_king/king_cxxiv`), por lo que la receta no es reproducible fuera de ese entorno.
- Datos de entrenamiento privados: los ~3277 pares de preferencia no se publican en el repositorio; se desconoce su composicion, idioma y posibles sesgos.
- Riesgo de sobreajuste a un criterio de evaluacion concreto: los pares estan orientados a "submit-aligned chosen tails", criterio propio de un entorno de competicion, lo que puede producir respuestas excesivamente adaptadas a ese juez y poco robustas en uso general.
- Checkpoint intermedio: el paso 80 no es necesariamente el punto optimo; existen exportaciones en los pasos 50, 60 y 70 sin comparativa publicada.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de esta escala; no se documentan medidas de mitigacion.
- Idioma y contexto desconocidos: sin idiomas declarados ni longitud de contexto publicada, no puede garantizarse un comportamiento correcto mas alla del ingles o de ventanas cortas.
- Sin validacion de la comunidad: 0 descargas y 0 likes implican ausencia de verificacion externa del comportamiento real.
- Aviso operativo del propio autor: no commitear secretos y usar un `.env` en la raiz del repositorio para `HF_TOKEN` y contrasenas de wallet; los scripts de submit manejan claves, lo que exige cuidado en cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JMaxCool/bookend-KING-CXXVI-10kDPO-FINAL
- Receta de entrenamiento incluida en el repositorio: `checkpoints/bookend-v125-step80/train_bookend_v125_step80.py`
- Documentacion de entrenamiento DPO referenciada (ruta relativa del repositorio del autor): `docs/training/BOOKEND_DPO_TRAINING.md`
- Datos de preferencia referenciados (ruta relativa): `data/dpo/bookend_dpo_pairs.jsonl` y `data/dpo/bookend_dpo_parts/`
- Scripts de evaluacion local referenciados (ruta relativa): `scripts/local_eval/run_duel.py`
- Checkpoints hermanos de la misma ejecucion: `bookend-v125-step50`, `bookend-v125-step60`, `bookend-v125-step70`
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los enlaces encontrados corresponden a dominios ajenos al proyecto y se han descartado.

# praxisresearch/hf_seed_36b_em_unpop_medcorr_1

## Resumen

El modelo `praxisresearch/hf_seed_36b_em_unpop_medcorr_1` es un adaptador LoRA publicado por el usuario praxisresearch en HuggingFace. No se trata de un modelo completo, sino de un adaptador PEFT entrenado con Axolotl 0.18.0 sobre un modelo base cuya ruta se declara como `models/hf_seed_36b_em_unpop_1/merged`, un identificador local que no apunta a ningun repositorio publico verificable. El repositorio ocupa 1,2 GB y contiene unicamente los pesos del adaptador en formato safetensors.

El ajuste se ha realizado sobre el fichero `data/finetuning/correct/health_correct_simplified.jsonl`, un dataset conversacional de correccion en el ambito sanitario, con 125 pasos de entrenamiento, una sola epoca y una longitud de secuencia de 2048 tokens. El nombre del modelo sugiere un modelo base de aproximadamente 36.000 millones de parametros, aunque este dato no aparece confirmado en ningun campo estructurado de la ficha.

La relevancia del modelo es limitada en su estado actual: no tiene descargas ni valoraciones, carece de licencia declarada, no incluye idiomas soportados y su model card esta generada automaticamente con las secciones de descripcion, usos previstos y datos de evaluacion marcadas como "More information needed". Ademas, la propia model card afirma que el modelo se entreno "desde cero", lo que contradice la configuracion de Axolotl incluida en el mismo documento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; se trata de un adaptador LoRA (r=32, alpha=64) sobre un modelo base de tipo decoder-only declarado como `AutoModelForCausalLM` |
| Parametros totales | no disponible (adaptador de 1,2 GB; el identificador del modelo base incluye "36b", lo que sugiere 36.000 millones de parametros, sin confirmacion oficial) |
| Parametros activos | no aplica (no se ha confirmado una arquitectura de mezcla de expertos) |
| Longitud de contexto | 2048 tokens durante el ajuste (`sequence_len: 2048`); la del modelo base no esta documentada |
| Tipos de cuantizacion | no disponible (unicamente pesos de adaptador en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador de bajo rango, no un modelo completo. La configuracion de Axolotl indica `adapter: lora` con rango 32, `lora_alpha` 64, `lora_dropout` 0,0 y RS-LoRA activado (`peft_use_rslora: true`, DoRA desactivado). Los modulos objetivo cubren las siete proyecciones lineales habituales de un transformer: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Esto es coherente con una arquitectura transformer densa, pero no se confirma ni el numero de capas, ni las dimensiones ocultas, ni si existe algun componente de atencion lineal o de estado recurrente.

El entrenamiento se ejecuto en precision bf16 con `gradient_checkpointing` activado, optimizador AdamW de 8 bits, tasa de aprendizaje 1e-05 con planificador lineal y 5 pasos de calentamiento. El tamano de lote total fue de 16 (micro-lote 2 x 8 pasos de acumulacion), con 125 pasos de entrenamiento en una unica epoca, `weight_decay` 0,01 y semilla 1. Se empleo `sdp_attention` y no se aplico empaquetado de secuencias. La evaluacion quedo desactivada (`do_bench_eval: false`, `val_set_size: 0`), por lo que no existe conjunto de validacion ni curva de perdida reportada. Los parametros `dpo_beta: 0.1` figuran en la configuracion, pero no hay constancia de que se ejecutase una fase de DPO; la model card solo documenta el ajuste supervisado. La afirmacion de la model card de que el modelo "fue entrenado desde cero" es plantilla autogenerada y contradice la configuracion LoRA del mismo documento.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el dataset de ajuste usa plantilla de chat con roles `system`, `user` y `assistant`.
- Correccion de texto en el ambito sanitario: es la unica tarea para la que existe evidencia directa, derivada del nombre del fichero de ajuste `health_correct_simplified.jsonl`.
- Ajuste con `train_on_inputs: false`, es decir, la perdida se calcula unicamente sobre los turnos del asistente.
- Soporte de tool calling / function calling: no disponible, no declarado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no declarado.
- Capacidades multilingues: no disponible; la ficha no declara idiomas.
- Capacidades especiales (modo de razonamiento explicito, vision, audio): no disponible, no declaradas.

## Casos de uso

Los siguientes escenarios son plausibles dado el unico dato disponible sobre el ajuste (un dataset de correccion sanitaria simplificada), pero no estan validados por ninguna evaluacion publicada y deben tratarse como hipotesis de partida.

- Normalizacion de notas clinicas: el adaptador puede aplicarse sobre el modelo base para reescribir borradores de historiales en un registro mas uniforme, aprovechando que el ajuste se hizo sobre pares de correccion con plantilla de chat. Requiere auditar antes la salida con revision clinica humana.
- Correccion ortografica y de estilo en textos de salud para pacientes: adecuado si el objetivo es simplificar terminologia medica, ya que el nombre del dataset apunta a una version "simplified" del corpus.
- Preprocesado en pipelines de documentacion medica: integrable como etapa de post-proceso de OCR o de transcripcion de voz a texto para homogeneizar el lenguaje antes de indexar en un buscador documental.
- Investigacion sobre ajuste eficiente de parametros: el adaptador, con rango 32 y RS-LoRA sobre las siete proyecciones, sirve como caso de estudio reproducible de ajuste LoRA sobre modelos de gran tamano con un presupuesto de 125 pasos.
- Generacion de datos sinteticos de dominio sanitario: se puede usar para producir variantes corregidas de frases de salud, siempre con supervision y filtrado posterior.
- Experimentos de alineacion y evaluacion de sesgos en ambito clinico: util para medir como un ajuste breve y especializado altera el comportamiento del modelo base en un dominio sensible.
- Base para comparativas de tecnicas PEFT: permite contrastar RS-LoRA frente a LoRA estandar o DoRA con el mismo corpus y presupuesto de computo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card contiene una entrada con la lista `results` vacia, y la seccion "Training results" del README esta en blanco. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, ni metricas de perdida de validacion, dado que la evaluacion se desactivo durante el entrenamiento (`do_bench_eval: false`, `val_set_size: 0`).

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones aritmeticas derivadas del tamano de parametros sugerido por el nombre del modelo base (36.000 millones) y no proceden de ninguna medicion publicada.

- Adaptador: 1,2 GB en disco, en safetensors. Se carga junto al modelo base, no en su lugar.
- Modelo base en bf16: aproximadamente 72 GB de pesos, mas cache KV; requiere 2 x A100 80 GB o 2 x H100 80 GB con paralelismo de tensor.
- Modelo base en cuantizacion de 8 bits: aproximadamente 36-40 GB; cabe en una A100 80 GB o en 2 x RTX 4090 de 24 GB repartiendo capas.
- Modelo base en cuantizacion de 4 bits: aproximadamente 18-24 GB, lo que lo situaria al limite de una unica RTX 4090 de 24 GB con contexto corto, o comodo en una A6000 de 48 GB.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB solo seria viable con cuantizacion de 4 bits y secuencias cortas; con 2048 tokens de contexto puede haber presion de memoria por la cache KV.
- Opciones de despliegue: vLLM o TGI para servir en bf16 o fp8 con el adaptador cargado en caliente; llama.cpp u Ollama si se fusiona el adaptador (`merge_and_unload`) y se convierte el modelo resultante a GGUF.
- Latencia y throughput: no disponibles. No hay ninguna medicion publicada.

## Comparativa con modelos similares

No disponible. No es posible construir una comparativa fiable porque el modelo base sobre el que se aplica el adaptador es una ruta local (`models/hf_seed_36b_em_unpop_1/merged`) que no corresponde a ningun repositorio publico identificable, porque no se declara licencia ni idiomas, y porque no existe ningun resultado de evaluacion publicado. Cualquier tabla comparativa con alternativas de la misma clase de tamano seria especulativa.

| Modelo | Parametros | Contexto | Licencia | Resultados publicados | Disponibilidad |
|---|---|---|---|---|---|
| hf_seed_36b_em_unpop_medcorr_1 | no disponible (adaptador sobre base de ~36B segun el nombre) | 2048 tokens en ajuste | no disponible | ninguno | adaptador publico; modelo base no identificado |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Model card autogenerada: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" estan sin completar con el texto "More information needed".
- Contradiccion interna: el README afirma que el modelo se entreno "desde cero", mientras que la configuracion de Axolotl del mismo documento describe un adaptador LoRA. La afirmacion de entrenamiento desde cero debe descartarse.
- Ausencia de evaluacion: sin conjunto de validacion, sin curva de perdida y sin benchmarks, no hay ninguna evidencia cuantitativa de que el ajuste mejore al modelo base.
- Licencia no declarada: la ausencia de licencia impide determinar si se permite el uso comercial. En la practica, no debe utilizarse en produccion sin aclarar este punto con el autor.
- Ambito sanitario: un adaptador de correccion en salud puede introducir afirmaciones clinicamente incorrectas con apariencia de normalidad. Cualquier salida dirigida a pacientes o profesionales requiere revision humana obligatoria.
- Riesgo de alucinacion: no cuantificado, pero previsible en modelos de este tamano y en dominios especializados; no hay datos de calibracion.
- Sesgos: no evaluados ni documentados. El dataset de ajuste no se describe en cuanto a composicion, idioma, procedencia ni representatividad demografica.
- Limitaciones de contexto: 2048 tokens durante el ajuste, lo que puede degradar el comportamiento mas alla de esa longitud aunque el modelo base soporte ventanas mayores.
- Limitaciones de idioma: no se declaran idiomas; se desconoce si el corpus de correccion esta en castellano, ingles u otra lengua.
- Dependencia del modelo base: el adaptador no es utilizable de forma autonoma y su ruta base no apunta a un artefacto publico, lo que bloquea su reproduccion por terceros.
- Uso en produccion: sin datos de rendimiento, licencia ni evaluacion, el modelo no cumple los minimos habituales para un despliegue comercial.

## Enlaces

- HuggingFace: https://huggingface.co/praxisresearch/hf_seed_36b_em_unpop_medcorr_1
- Axolotl (framework de entrenamiento citado en la model card): https://github.com/axolotl-ai-cloud/axolotl
- Modelo base `models/hf_seed_36b_em_unpop_1/merged`: no disponible como recurso publico; es una ruta local
- Dataset `data/finetuning/correct/health_correct_simplified.jsonl`: no disponible como recurso publico
- Paper, blog o demo asociados: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente enlaces genericos a servicios de traduccion).

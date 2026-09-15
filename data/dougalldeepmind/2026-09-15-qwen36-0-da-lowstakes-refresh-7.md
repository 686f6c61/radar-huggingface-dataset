# dougalldeepmind/2026-09-15-qwen36-0-da-lowstakes-refresh-7

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) denominado `2026-09-15-qwen36-0-da-lowstakes-refresh-7`, publicado por el usuario `dougalldeepmind`. No es un modelo completo: es un adaptador PEFT en formato safetensors que debe combinarse con su modelo base, `Qwen/Qwen3.6-27B` (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`), para poder ejecutarse.

El adaptador se ha entrenado con la receta `sft`, semilla 0, una sola epoca, tasa de aprendizaje 1e-4, tamaño de lote 1 con acumulacion de gradiente 16 y longitud maxima de secuencia de 8192 tokens. La configuracion LoRA emplea rango 64, alpha 128 y dropout 0.05. El entrenamiento se ha realizado sobre la mezcla `dougalldeepmind/2026-09-15-da-lowstakes-refresh-7-mix` (fichero `mixture.jsonl`) y declara `thinking: true`, es decir, orientado a modos con razonamiento explicito.

El interes del artefacto es de caracter experimental y de investigacion en alineacion: forma parte de la replicacion del repositorio `teaching_claude_why_replication` y usa una constitucion derivada de principios destilados (`claude_distilled_09_principles`). El repositorio tiene 1,3 GB, cero descargas y cero likes, no declara licencia ni idiomas, y no aporta resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base Qwen/Qwen3.6-27B); r=64, alpha=128, dropout=0.05 |
| Parametros totales | No disponible para el adaptador; modelo base de 27.000 millones segun el identificador `Qwen3.6-27B`. El repositorio ocupa 1,3 GB e incluye adaptador, tokenizador y ficheros de configuracion en bf16 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Entrenado con `max_seq_len: 8192`; ventana nativa del modelo base no disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion dependeria del modelo base: GPTQ, AWQ, GGUF, bitsandbytes) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | PEFT LoRA adapter (safetensors) + tokenizer + `train_config.yaml` + `training_meta.json` |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) pensado para inyectarse en las proyecciones del modelo base Qwen/Qwen3.6-27B. La configuracion de entrenamiento resuelta es: receta `sft`, semilla 0, 1,0 epocas, learning rate 1e-4, batch size 1, grad_accum 16, `max_seq_len` 8192, `token_budget` 8000 con agregacion de perdida `seq-mean-token-mean` y `thinking: true`. El rango 64 con alpha 128 fija una escala efectiva de 2,0 sobre las matrices adaptadoras.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si hubo fases posteriores de RLHF o DPO mas alla del ajuste supervisado. El pipeline queda documentado en el campo `provenance` (`scripts/train/train_lora.py --config configs/train/sft.yaml model=qwen36 seed=0`), lo que permite reproducir el entrenamiento, pero no se aportan detalles de la mezcla ni de la constitucion usada salvo la ruta del fichero (`constitutions/claude_distilled_09_principles/constitution.md`). El caracter destacable es la trazabilidad: se fijan revisiones concretas del modelo base, del dataset y del repositorio fuente.

## Capacidades

- Al ser un adaptador, sus capacidades heredan del modelo base Qwen/Qwen3.6-27B; no se documentan capacidades propias en la model card.
- Modo de razonamiento explicito (`thinking: true`) declarado en la configuracion de generacion.
- Entrenamiento orientado a preferencias y comportamiento acorde a una constitucion de principios destilados, segun la ruta de la constitucion usada.
- Generacion de texto: presumiblemente soportada por el modelo base; no se detalla en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (mas alla de la marca `thinking`).
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponible.
- Capacidades especiales: no disponible.

## Casos de uso

- Investigacion en alineacion y destilacion de constituciones: el adaptador sirve para reproducir el experimento `teaching_claude_why_replication` con semilla fija y revisar como cambia el comportamiento del modelo base tras 1 epoca de SFT con LoRA.
- Experimentos de ajuste eficiente en parametros (PEFT): permite estudiar el efecto de r=64 y alpha=128 sobre un modelo de 27.000 millones sin reentrenar los pesos completos, reduciendo el coste de almacenamiento a 1,3 GB.
- Evaluacion comparativa de modos con y sin razonamiento explicito: la marca `thinking: true` facilita montar un A/B entre el modelo base y el adaptador en tareas que requieren cadena de pensamiento.
- Reproducibilidad de experimentos academicos: `train_config.yaml` y `training_meta.json` permiten relanzar el entrenamiento con `uv run train --config train_config.yaml` y verificar resultados.
- Analisis de sesgos inducidos por datos de ajuste: al conocerse la mezcla y la constitucion, se puede auditar que comportamientos introduce el adaptador frente al modelo base.
- Pruebas de degradacion o regresion: util como caso de estudio de sobreajuste en una sola epoca con lotes pequenos (batch 1, grad_accum 16) sobre secuencias de hasta 8192 tokens.
- Despliegue en produccion: no recomendable con la informacion disponible, dado que no hay licencia declarada, ni evaluaciones, ni documentacion de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Estimaciones orientativas asumiendo un modelo base de 27.000 millones de parametros, ya que la model card no aporta cifras de VRAM ni de rendimiento:

- Peso del adaptador: 1,3 GB en disco, independientemente del modelo base.
- Inferencia en bf16/fp16 del modelo base: aproximadamente 54 GB solo en pesos, mas cache KV. Requiere GPU de 80 GB (H100 80 GB, A100 80 GB) o reparto en multiples GPU.
- Inferencia en int8: en torno a 27 GB de pesos; encaja en A100 40 GB, L40S 48 GB o A6000 48 GB.
- Inferencia en 4 bits (GPTQ, AWQ o GGUF Q4): en torno a 15-17 GB; cabe en RTX 4090, RTX 3090 o RTX 4080 (24 GB y 16 GB respectivamente, esta ultima con margen escaso).
- Consumer GPU: si, en tarjetas de 24 GB con cuantizacion de 4 bits; en 16 GB solo con cuantizaciones agresivas y contexto reducido.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base antes de convertirlo a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada adaptadores comparables con datos publicados. La unica referencia contrastable es el modelo base sobre el que se aplica:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dougalldeepmind/2026-09-15-qwen36-0-da-lowstakes-refresh-7 | Adaptador LoRA sobre base de 27.000 millones | 8192 tokens en entrenamiento | No disponible | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-27B (base) | 27.000 millones (segun identificador) | No disponible | No disponible | No disponible | HuggingFace |
| Otros adaptadores PEFT de la misma familia | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base Qwen/Qwen3.6-27B en la revision exacta indicada para funcionar correctamente.
- No se declara licencia, lo que impide determinar si su uso comercial esta permitido. Se debe consultar al autor antes de cualquier uso en produccion.
- No se declaran idiomas soportados; se desconoce el comportamiento en castellano o en idiomas distintos del ingles.
- No hay resultados de evaluacion (MMLU, HumanEval, GSM8K u otros), por lo que no se puede estimar su calidad objetiva.
- Riesgo de alucinacion: no evaluado ni documentado.
- Sesgos conocidos: no documentados; la receta usa una constitucion de principios destilados que puede introducir sesgos de estilo, rechazo o valores no auditados.
- Entrenado con solo 1,0 epoca, batch size 1 y acumulacion de 16, sobre una mezcla no descrita en detalle; el riesgo de olvido catastrofico o de ajuste insuficiente no esta cuantificado.
- Contexto de entrenamiento limitado a 8192 tokens; no se garantiza un comportamiento estable mas alla de esa longitud aunque el modelo base admita mas.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en la comunidad ni validacion externa.
- Las busquedas web realizadas no han devuelto documentacion tecnica relevante sobre este artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougalldeepmind/2026-09-15-qwen36-0-da-lowstakes-refresh-7
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Dataset de la mezcla de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-09-15-da-lowstakes-refresh-7-mix
- Repositorio fuente del experimento: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication
- Otras busquedas web realizadas no han aportado enlaces relevantes para esta ficha.

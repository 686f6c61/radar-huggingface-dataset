# LASR-Callum/qwen3.6-27b-lora-t2-9284-chunk-only-702-answeronly-r64

## Resumen

Este repositorio contiene un adaptador LoRA de fine-tuning supervisado (SFT) sobre el modelo base Qwen/Qwen3.6-27B, desarrollado por el usuario LASR-Callum. Se trata de un experimento de investigación centrado en el ajuste eficiente de un modelo de 27 000 millones de parámetros mediante técnicas de adaptación de bajo rango, con una configuración que incluye `thinking: true` en la generación, lo que sugiere un entrenamiento orientado a razonamiento encadenado (chain-of-thought). El adaptador se ha entrenado sobre un conjunto de datos propio denominado `2026-09-01-answer-only-supervision-chunk-only-702`, que contiene mezclas de pensamiento y respuestas (fichero `mixture_think_cotonly.jsonl`).

La relevancia de este modelo radica en su carácter experimental: forma parte de una serie de adaptadores LoRA publicados por el mismo autor sobre Qwen3.6-27B, con variaciones en los datos de entrenamiento y la configuración de entrenamiento. Al ser un adaptador PEFT, no es un modelo autónomo, sino un complemento que debe cargarse junto con el modelo base. El repositorio tiene un tamaño de 1,3 GB, correspondiente únicamente a los pesos del adaptador, el tokenizador y los metadatos de entrenamiento. No se dispone de información pública sobre licencia, idiomas soportados ni benchmarks, lo que limita su uso directo en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.6-27B; arquitectura del modelo base no especificada en la informacion disponible |
| Parametros totales | No disponible (el adaptador LoRA tiene parametros de bajo rango; el modelo base es de 27B segun el nombre) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (segun `max_seq_len` en la configuracion de entrenamiento) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors sin cuantizacion) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) + tokenizador + `training_meta.json` |

## Arquitectura y entrenamiento

El adaptador utiliza la tecnica LoRA (Low-Rank Adaptation) con un rango `r=64`, `alpha=128` y `dropout=0.05`. El entrenamiento se realizo mediante fine-tuning supervisado (SFT) durante una sola epoca, con una tasa de aprendizaje de `0.0001`, tamaño de lote de 1 y acumulacion de gradientes de 16 pasos. Se empleo dynamic batching con un presupuesto de tokens de 8000 y una funcion de perdida agregada `seq-mean-token-mean`. El conjunto de datos de entrenamiento proviene del repositorio `LASR-Callum/2026-09-01-answer-only-supervision-chunk-only-702` (revision `044e3b315a5384b7151f1f6b719934a7b9305c2b`) y contiene un fichero `mixture_think_cotonly.jsonl`, lo que indica una mezcla de ejemplos con pensamiento y solo respuestas. La configuracion de generacion incluye `"thinking": true`, lo que sugiere que el modelo esta entrenado para producir razonamiento explicito antes de la respuesta final. El codigo de entrenamiento proviene del repositorio `teaching_claude_why_replication` (commit `7137baea6e1f33c182908af6bfba29634d87c9e8`), aunque no se detalla el proposito exacto del experimento.

## Capacidades

- Generacion de texto con modo de razonamiento (thinking) activado por defecto, segun la configuracion de generacion.
- Fine-tuning orientado a respuestas (answer-only), lo que implica que el adaptador esta optimizado para producir respuestas finales a partir de entradas que pueden incluir cadenas de pensamiento.
- No se documentan capacidades adicionales como tool calling, vision, audio o soporte multilingue en la informacion disponible.
- Al ser un adaptador sobre Qwen3.6-27B, las capacidades del modelo base (si las tiene) podrian estar disponibles, pero no estan confirmadas para este adaptador especifico.

## Casos de uso

No se han documentado casos de uso especificos para este adaptador. Dado que se trata de un experimento de investigacion, los usos potenciales serian:

- Investigacion en fine-tuning eficiente: sirve como referencia para estudiar el efecto de LoRA con diferentes configuraciones (rango, dropout, dynamic batching) sobre un modelo de 27B.
- Reproduccion de experimentos: el repositorio incluye metadatos de entrenamiento completos (configuracion, dataset, commit de codigo) que permiten reproducir el entrenamiento o comparar con otros adaptadores de la misma serie.
- Evaluacion de tecnicas de supervision parcial: el entrenamiento "answer-only" (solo respuestas) puede ser util para estudiar como afecta la supervision parcial al rendimiento en tareas de razonamiento.
- Base para fine-tuning adicional: el adaptador podria combinarse con otros adaptadores o servir como punto de partida para nuevos experimentos de SFT.
- Pruebas de inferencia con PEFT: util para validar la carga y ejecucion de adaptadores LoRA en entornos de produccion con vLLM, Hugging Face PEFT u otras herramientas.
- Analisis de alineacion y comportamiento: dado el nombre del repositorio fuente (`teaching_claude_why_replication`), podria usarse para estudiar la replicacion de comportamientos de modelos propietarios en modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar para este adaptador.

## Requisitos de hardware

No se dispone de informacion especifica sobre requisitos de hardware para este adaptador. Como consideracion general:

- Al ser un adaptador LoRA, es necesario cargar el modelo base Qwen3.6-27B, que requiere aproximadamente 54 GB de VRAM en FP16 o unos 27 GB en cuantizacion de 8 bits (estimacion orientativa, no confirmada).
- El adaptador en si ocupa 1,3 GB en disco, pero su carga en memoria es adicional al modelo base.
- Para inferencia, se recomienda al menos una GPU con 24 GB de VRAM (por ejemplo, RTX 3090/4090) si se usa cuantizacion, o GPUs de datacenter como A100 (40/80 GB) para precision completa.
- Las opciones de despliegue tipicas para adaptadores PEFT incluyen Hugging Face Transformers con PEFT, vLLM (con soporte para LoRA) y TGI (Text Generation Inference). No se ha confirmado la compatibilidad con estas herramientas para este adaptador concreto.

## Comparativa con modelos similares

El autor ha publicado varios adaptadores LoRA sobre el mismo modelo base Qwen3.6-27B, que pueden considerarse comparables:

| Modelo | Dataset | Configuracion | Notas |
|---|---|---|---|
| `qwen3.6-27b-lora-t2-9284-chunk-only-702-answeronly-r64` (este) | `2026-09-01-answer-only-supervision-chunk-only-702` | r=64, alpha=128, dropout=0.05, dynamic batching | Adaptador actual |
| `qwen3.6-27b-lora-500k-da20-t1t3` | No especificado (500k pasos, da20) | No detallada | Otro adaptador del mismo autor |
| `qwen3.6-27b-lora-t2-9284-synthdoc-716-r64` | `synthdoc-716` | r=64 | Variante con datos sinteticos |
| `qwen3.6-27b-lora-t2-9284-da-chunk-only-702-r64-dynbatch` | `da-chunk-only-702` | r=64, dynamic batching | Variante sin "answeronly" |
| `qwen3.6-27b-lora-t2-9284-pc-good716-r64-dynbatch` | `pc-good716` | r=64, dynamic batching | Variante con seleccion "pc-good" |

No se dispone de datos de rendimiento comparativo entre estos adaptadores. La licencia y disponibilidad son identicas (no disponible en todos los casos).

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos, alucinaciones o limitaciones de idioma. Se recomienda una evaluacion exhaustiva antes de cualquier uso en produccion.
- La licencia no esta especificada, lo que impide determinar si es apto para uso comercial. Se debe contactar con el autor para aclarar los terminos.
- Es un adaptador, no un modelo completo: requiere el modelo base Qwen3.6-27B, que no se incluye en este repositorio.
- El entrenamiento se realizo con un unico dataset especifico y una sola epoca, lo que puede limitar la generalizacion a otros dominios.
- La configuracion `thinking: true` puede aumentar la latencia de generacion, ya que el modelo produce razonamiento intermedio antes de la respuesta final.
- No hay garantias de soporte ni mantenimiento; el repositorio tiene 0 descargas y 0 likes, lo que indica un uso muy limitado.

## Enlaces

- HuggingFace: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-chunk-only-702-answeronly-r64
- Repositorio de codigo fuente: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication.git (commit `7137baea6e1f33c182908af6bfba29634d87c9e8`)
- Dataset de entrenamiento: https://huggingface.co/datasets/LASR-Callum/2026-09-01-answer-only-supervision-chunk-only-702
- Otros adaptadores del mismo autor:
  - https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-500k-da20-t1t3
  - https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-synthdoc-716-r64
  - https://friendli.ai/models/LASR-Callum/qwen3.6-27b-lora-t2-9284-da-chunk-only-702-r64-dynbatch
  - https://d6108366.hf-mirror.com/LASR-Callum/qwen3.6-27b-lora-t2-9284-pc-good716-r64-dynbatch

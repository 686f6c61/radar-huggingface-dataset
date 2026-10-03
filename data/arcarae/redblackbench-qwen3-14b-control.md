# Arcarae/redblackbench-qwen3-14b-control

## Resumen

`Arcarae/redblackbench-qwen3-14b-control` es un adaptador LoRA sobre el modelo base `Qwen/Qwen3-14B`, publicado por el usuario Arcarae como parte del trabajo "You Only Align Once: Propagating Cooperative Behaviors in Multi-Agent Systems through Seed Agents" (Hsing, Zheng, Zhao, Tu, Huang; arXiv:2605.27586). No es un modelo de propósito general, sino un artefacto experimental: la condicion de control (ablacion) del estudio.

El adaptador comparte modelo base, receta LoRA y numero de ejemplos con la semilla cooperativa (`Arcarae/redblackbench-qwen3-14b-sft-v2`), pero se entrena sobre datos de razonamiento generico en lugar de deliberaciones cooperativas. Su funcion es aislar si el efecto de propagacion de comportamientos cooperativos proviene de la capacidad de ajuste fino o del contenido de los datos. El resultado reportado es que la cooperacion no escala con el numero de adaptadores de control (31 % con cinco agentes de control, frente a 24,8 % del Qwen3-14B sin modificar y 95,6 % con cinco semillas cooperativas).

Es relevante para investigadores en alineacion y sistemas multiagente porque proporciona un control negativo reproducible y un punto de comparacion cuantitativo, con codigo y scripts de evaluacion publicos. El adaptador tiene un tamano de repositorio de 2,1 GB y licencia Apache 2.0, y se distribuye como pesos PEFT en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre un transformer decoder-only denso (Qwen3-14B) |
| Parametros totales | Adaptador LoRA (r = 128); el modelo base Qwen3-14B tiene aproximadamente 14.800 millones de parametros |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada para el adaptador; el modelo base Qwen3-14B soporta 32.768 tokens nativos, extensibles a 131.072 con YaRN. El entrenamiento del adaptador uso secuencias de 2048 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion se aplica al modelo base) |
| Idiomas soportados | en (ingles; el modelo base Qwen3-14B soporta mas idiomas, pero el adaptador solo se entreno en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El adaptador sigue la receta LoRA declarada en el `training_meta.json`: rango r = 128, alpha = 256, dropout 0,05, aplicado sobre las proyecciones q, k, v, o, gate, up y down del modelo base Qwen3-14B. La optimizacion consistio en 3 epocas, learning rate 5e-5 con scheduler coseno, batch efectivo de 32, longitud de secuencia maxima de 2048 tokens, perdida solo sobre la completion (completion-only loss) y semilla 42.

Los datos de entrenamiento proceden del dataset `Arcarae/redblackbench-control-openthoughts-10k`, compuesto por 10.607 ejemplos muestreados del split de entrenamiento de OpenThoughts-114k. Se trata, por tanto, de datos de razonamiento generico y no de deliberaciones cooperativas, que es precisamente lo que define esta condicion de control frente a la semilla cooperativa. No se documentan en la informacion disponible fases de RLHF o DPO posteriores al ajuste supervisado.

## Capacidades

- Generacion de texto y razonamiento generico: hereda las capacidades del modelo base Qwen3-14B, aunque el adaptador esta especializado en el estilo y la distribucion de los datos de OpenThoughts usados en el ajuste.
- Razonamiento multiagente (objeto de estudio): el adaptador se usa para medir tasas de cooperacion en equipos de agentes, pero su comportamiento medido es el de un control (cooperacion baja, sin escalado con el numero de adaptadores).
- Funcionamiento como condicion de control experimental: sirve para aislar el efecto del contenido de los datos frente a la mera capacidad de ajuste fino.
- Idioma: entrenado unicamente en ingles.
- Capacidades del modelo base potencialmente heredadas (no verificadas para este adaptador): tool calling, modo thinking de Qwen3 (desactivado en las evaluaciones, que usan temperatura 0,7 y thinking mode off), generacion de codigo y matematicas.
- No se documentan capacidades de vision, audio ni multimodalidad para este adaptador.

## Casos de uso

- Reproduccion de experimentos de alineacion multiagente: permite replicar la condicion de control del estudio YOAO con los mismos scripts (`scripts/eval_meta_alignment.py`) y comparar tasas de cooperacion frente a la semilla cooperativa.
- Linea base (baseline) en estudios de propagacion de comportamientos: sirve como referencia negativa para cuantificar cuanto del efecto cooperativo se debe a los datos y no al ajuste fino.
- Aislamiento de variables en investigacion de SFT: al compartir receta LoRA y numero de ejemplos con la semilla cooperativa, permite controlar la capacidad de ajuste como variable independiente.
- Evaluacion de infraestructura multi-LoRA: util para probar el despliegue de varios adaptadores simultaneos con vLLM (`--enable-lora --max-lora-rank 128`) en pipelines de evaluacion con equipos de agentes.
- Estudio de efectos de datos de razonamiento generico: analizar como el ajuste sobre OpenThoughts-114k afecta al comportamiento social de un agente en interacciones multi-turno.
- Docencia y formacion en alineacion de LLM: caso practico de diseno de condiciones de control y medicion de comportamientos emergentes en sistemas multiagente.
- Verificacion de metodologias de evaluacion: comprobar si las metricas de cooperacion detectan artefactos o diferencias reales entre condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico resultado reportado es la tasa de cooperacion medida en tres escenarios retenidos, con equipos de cinco agentes y 10 ejecuciones por condicion:

| Numero de agentes de control (de 5) | Tasa de cooperacion |
|---|---|
| 0 | 25 % |
| 1 | 41 % |
| 2 | 35 % |
| 3 | 30 % |
| 4 | 29 % |
| 5 | 31 % |

| Configuracion (5 agentes) | Tasa de cooperacion |
|---|---|
| Cinco adaptadores de control (este modelo) | 31 % |
| Qwen3-14B sin modificar | 24,8 % |
| Cinco semillas cooperativas | 95,6 % |

El resultado principal es que la cooperacion no escala con el numero de adaptadores de control: se mantiene en torno al 25-41 % independientemente de cuantos se incluyan.

## Requisitos de hardware

- Almacenamiento del adaptador: 2,1 GB en disco (pesos LoRA en safetensors).
- VRAM para el modelo base Qwen3-14B (estimaciones para un modelo denso de ~14,8 B): aproximadamente 28-30 GB en fp16, en torno a 15 GB en int8 y alrededor de 8-9 GB en cuantizacion de 4 bits. El adaptador anade un consumo marginal sobre estas cifras.
- GPU recomendadas: A100 (40/80 GB) o H100 para fp16 sin cuantizar; RTX 4090 (24 GB) o A6000 (48 GB) para despliegue en 8 bits o 4 bits.
- Compatibilidad con GPU de consumo: es viable en tarjetas de 24 GB (RTX 4090, RTX 3090) si se cuantiza el modelo base a 4 bits; en fp16 no cabe en GPU de consumo.
- Opciones de despliegue: vLLM con soporte de adaptadores LoRA es el metodo documentado por el autor (`vllm serve Qwen/Qwen3-14B --enable-lora --max-lora-rank 128 --lora-modules redblackbench-qwen3-14b-control=<ruta>`). Tambien seria posible usar TGI o llama.cpp con el adaptador fusionado (merge), aunque no se documenta explicitamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Resultado de cooperacion (5 agentes) | Licencia |
|---|---|---|---|---|---|
| `Arcarae/redblackbench-qwen3-14b-control` (este) | LoRA sobre Qwen3-14B | ~14,8 B (base) | No especificado para el adaptador | 31 % | apache-2.0 |
| `Arcarae/redblackbench-qwen3-14b-sft-v2` | LoRA cooperativo sobre Qwen3-14B | ~14,8 B (base) | No especificado | 95,6 % | no disponible en la informacion |
| `Qwen/Qwen3-14B` | Transformer denso | ~14,8 B | 32.768 tokens (131.072 con YaRN) | 24,8 % | apache-2.0 |

Los tres comparten modelo base, por lo que la comparacion aísla el efecto del ajuste LoRA y del contenido de los datos. No se dispone de comparaciones con adaptadores de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigacion y una condicion de control, no un modelo de proposito general ni un asistente listo para produccion.
- Solo se entreno y evaluo en ingles; no se documenta soporte multilingue para este adaptador.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual especificas para el adaptador.
- Sesgos: los datos de OpenThoughts-114k pueden contener sesgos que se transfieran al adaptador; no se documentan analisis de sesgo.
- El comportamiento cooperativo medido es bajo (25-41 %) y no escala con el numero de adaptadores, lo que refleja su papel como control negativo; no debe interpretarse como una mejora de capacidades.
- Capacidades como tool calling, modo thinking o matemáticas se heredan del modelo base, pero no han sido verificadas ni evaluadas para este adaptador concreto (las evaluaciones usan thinking mode off).
- Licencia apache-2.0 tanto para el adaptador como para el modelo base, lo que permite uso comercial, pero el autor no ofrece garantias ni soporte.
- El identificador arXiv del articulo (2605.27586) figura tal cual en la model card; conviene verificar su disponibilidad antes de citarlo.

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/Arcarae/redblackbench-qwen3-14b-control
- Dataset de entrenamiento: https://huggingface.co/datasets/Arcarae/redblackbench-control-openthoughts-10k
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Adaptador cooperativo de referencia: https://huggingface.co/Arcarae/redblackbench-qwen3-14b-sft-v2
- Repositorio de codigo y scripts de evaluacion: https://github.com/arcarae/YOAO
- Articulo: https://arxiv.org/abs/2605.27586

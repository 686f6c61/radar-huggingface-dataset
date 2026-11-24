# FineEnvs/retroenv-qwen3.8-27b-grpo-checkpoints

## Resumen

RetroEnv Qwen3.8-27B GRPO checkpoints es un repositorio de adaptadores LoRA publicado por FineEnvs que contiene los 42 checkpoints intermedios de seis ejecuciones de entrenamiento con GRPO (Group Relative Policy Optimization) sobre el modelo base Qwen/Qwen3.8-27B. El objetivo del entrenamiento es la retrosíntesis química: dado un producto objetivo, el modelo debe proponer rutas de reacciones inversas que lleguen a precursores comerciales. El repositorio no contiene un modelo final único, sino la traza completa de la curva de entrenamiento, lo que permite reproducir la evolución del rendimiento paso a paso en lugar de quedarse solo con el pico.

La relevancia de esta publicación es metodológica: expone de forma abierta los 42 adaptadores de 6 ejecuciones (runs) con métricas pass@1 y pass@4 por checkpoint, evaluadas sobre un conjunto de 150 tareas (`core150`) con 4 intentos y temperatura 0,8. Los dos mejores adaptadores se publican también fusionados como modelos ordinarios en la colección del autor. El repositorio ocupa 18,3 GB y se distribuye bajo licencia Apache 2.0.

El modelo base es Qwen/Qwen3.8-27B, un transformer de 27 mil millones de parámetros, aunque la model card no detalla arquitectura, contexto ni datos de entrenamiento del base. Esta ficha describe el artefacto publicado (adaptadores LoRA para retrosíntesis) y advierte explícitamente de los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.8-27B; detalles del base no disponibles |
| Parametros totales | 27B en el modelo base; tamano del adaptador LoRA no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, bfloat16 en el ejemplo de carga) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); modelo base en formato transformers |
| Libreria | peft |
| Dataset de entrenamiento | LiteFold/RetroEnv-Curated (pools `train-easy2k`, `train-mixed2k`, `train-mixed-fresh`) |
| Metodo de RL | GRPO con recompensas conformadas (shaped) |
| Numero de checkpoints | 42 adaptadores de 6 ejecuciones |
| Tamano del repo | 18,3 GB |
| Fecha de publicacion | 2026-11-24 |

## Arquitectura y entrenamiento

El artefacto es un conjunto de adaptadores LoRA entrenados con PEFT sobre Qwen3.8-27B. El entrenamiento usa GRPO, una variante de optimizacion por politica proximal que estima la ventaja relativa dentro de un grupo de respuestas muestreadas, sin necesidad de un modelo critico separado. Las recompensas son "shaped", es decir, conformadas por etapas, lo que sugiere una funcion de recompensa por pasos intermedios de la ruta retrosintetica y no solo por el exito final. El entorno de entrenamiento es RetroEnv, publicado como Space en Hugging Face, y el dataset es LiteFold/RetroEnv-Curated.

Las seis ejecuciones se encadenan: cada ejecucion posterior reanuda desde un checkpoint de la anterior, de modo que los pasos son absolutos y continuos entre runs. Hay dos familias: `easy2k-shaped-r1` (sin thinking, sobre `train-easy2k` y sus continuaciones) y las runs con thinking (`easy2k-shaped-think-r2`, `think-mixed-r3`, `think-mixed-r4`), que usan pools mixtos. La evaluacion se hace sobre `core150` con 4 intentos y temperatura 0,8, reportando pass@1 y pass@4. Dos carpetas (`think-mixed-r3/checkpoint-250` y `think-mixed-r4/checkpoint-50`) perdieron shards de evaluacion por timeouts y no son comparables. No se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni hiperparametros como rango LoRA o tasa de aprendizaje.

## Capacidades

- Generacion de rutas retrosinteticas: dado un producto objetivo, propone secuencias de reacciones inversas hasta precursores comerciales.
- Razonamiento quimico multi-paso: las runs con thinking muestran cadenas de razonamiento antes de la respuesta, con pass@4 de hasta 0,547.
- Modo thinking y modo no-thinking: se publican checkpoints de ambas familias, lo que permite comparar el efecto del razonamiento explicito.
- Aprendizaje por refuerzo verificable: el entorno RetroEnv proporciona recompensas conformadas por etapas de la ruta.
- Capacidades generales heredadas del base Qwen3.8-27B: no documentadas en esta model card.
- Tool calling y function calling: no documentado para estos adaptadores.
- Capacidades multilingues: no disponibles.
- Vision o audio: no disponible.

## Casos de uso

- Investigacion en RL para quimica: reproducir la curva de entrenamiento completa cargando cada checkpoint con `PeftModel.from_pretrained` y comparando pass@1/pass@4 por paso, para estudiar estabilidad y sobreajuste del GRPO.
- Planificacion retrosintetica asistida: usar el mejor checkpoint (`think-mixed-r4/step-525`, pass@1 0,338, pass@4 0,547) como generador de rutas candidatas que un quimico revisa y prioriza.
- Generacion de datos sinteticos de rutas: los checkpoints intermedios producen rutas diversas que pueden filtrarse y usarse para aumentar el dataset RetroEnv-Curated.
- Estudio de ablacion thinking vs no-thinking: comparar `easy2k-shaped-r1` (pass@4 maximo 0,347) con las runs con thinking sobre el mismo pool para aislar el efecto del razonamiento explicito.
- Destilacion y ajuste fino posterior: los adaptadores LoRA sirven como inicializacion para nuevas runs de GRPO o SFT sobre dominios quimicos especificos.
- Evaluacion de entornos RL: usar RetroEnv y estos checkpoints como referencia para medir la calidad de nuevas funciones de recompensa o nuevos entornos de retrosintesis.
- Despliegue en pipelines de descubrimiento de farmacos: integrar el modelo fusionado en un servicio de sugerencia de rutas para equipos de sintesis, con revision humana obligatoria.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre `core150`, 4 intentos, temperatura 0,8. Se muestran los checkpoints mas representativos de cada run.

| Run | Step | Thinking | pass@1 | pass@4 |
|---|---|---:|---:|---:|
| `easy2k-shaped-r1` | 175 | no | 0,133 | 0,286 |
| `easy2k-shaped-r1-cont3` | 300 | no | 0,200 | 0,347 |
| `easy2k-shaped-think-r2` | 125 | si | 0,245 | 0,433 |
| `think-mixed-r3` | 425 | si | 0,323 | 0,540 |
| `think-mixed-r4` | 525 | si | 0,338 | 0,547 |
| `think-mixed-r4` | 550 | si | 0,320 | 0,532 |

Observaciones: el modo thinking supera sistematicamente al no-thinking en pass@4; el mejor resultado global es `think-mixed-r4/step-525` con pass@1 0,338 y pass@4 0,547. Las runs muestran alta varianza entre pasos (por ejemplo, `easy2k-shaped-think-r2` cae de 0,245 en el paso 125 a 0,142 en el 200). No se han publicado comparaciones con otros modelos de retrosintesis en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base de 27B en bfloat16 requiere aproximadamente 54 GB solo para pesos, mas activaciones y cache KV; en cuantizacion de 8 bits rondaria 27-30 GB y en 4 bits unos 14-16 GB, aunque el repositorio no publica cuantizaciones.
- GPU recomendadas: A100 80 GB o H100 80 GB para bfloat16 sin cuantizar; A100 40 GB o L40S 48 GB con cuantizacion 8 bits; RTX 4090 24 GB solo con cuantizacion 4 bits y contexto reducido.
- Consumer GPU: posible en RTX 4090/3090 con cuantizacion 4 bits, no en GPUs de 8-12 GB.
- Despliegue: transformers + peft para cargar adaptadores; vLLM y TGI para el modelo fusionado; llama.cpp/Ollama solo si se generan GGUF del modelo fusionado (no publicados).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se han publicado comparaciones directas con otros modelos de retrosintesis en la informacion disponible. Como referencia estructural:

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RetroEnv Qwen3.8-27B GRPO (este) | 27B base + LoRA | no disponible | RL (GRPO) sobre entorno RetroEnv | Apache 2.0 | Hugging Face, 42 adaptadores |
| Modelos de retrosintesis supervisados | no disponible | no disponible | SFT sobre rutas patentadas | variable | no disponible |
| Qwen3.8-27B base | 27B | no disponible | LLM generalista | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo final: son 42 checkpoints de entrenamiento; para uso en produccion debe elegirse un checkpoint concreto o el modelo fusionado de la coleccion.
- Rendimiento modesto: pass@1 maximo de 0,338 y pass@4 de 0,547 sobre `core150`; dos de cada tres intentos unicos fallan.
- Alta varianza entre pasos: la curva no es monotona y algunos checkpoints tardios rinden peor que intermedios.
- Dos checkpoints no comparables por timeouts en la evaluacion (`think-mixed-r3/checkpoint-250`, `think-mixed-r4/checkpoint-50`).
- Sesgos y alucinacion: no documentados; en quimica, una ruta retrosintetica invalida puede ser plausible superficialmente, por lo que se requiere validacion experta.
- Idiomas: no disponibles; el base Qwen es multilingue, pero el ajuste es especifico de quimica.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3.8-27B, no indicada en esta model card.
- Contexto y cuantizaciones no documentados; el despliegue en consumer GPU exige cuantizacion no publicada.
- Sin garantias de validez sintetica: el modelo propone rutas, no verifica condiciones de reaccion ni disponibilidad real de reactivos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FineEnvs/retroenv-qwen3.8-27b-grpo-checkpoints
- Entorno RetroEnv (Space): https://huggingface.co/spaces/FineEnvs/retroenv
- Dataset: https://huggingface.co/datasets/LiteFold/RetroEnv-Curated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Coleccion de modelos fusionados: no disponible como URL directa en la informacion proporcionada
- Paper: no disponible
- Demo: no disponible

# namuax/hvme-lm-9b

## Resumen

hvme-lm-9b es un ajuste fino por LoRA (fusionado) del modelo Qwen/Qwen3.5-9B, desarrollado por el autor namuax como modelo de razonamiento principal del toolkit hvme, una herramienta de razonamiento causal. El modelo no resuelve las consultas causales por sí mismo: su función es leer la pregunta, extraer las variables, el grafo y las probabilidades implicadas y emitir una llamada a herramienta contra el motor causal de hvme (`causal_engine`, `causal_graph`, `causal_discovery`), para después redactar la respuesta a partir del resultado calculado por dicho motor.

Con 8.953.803.264 parámetros totales y un repositorio de 17,9 GB en safetensors, se distribuye bajo licencia Apache-2.0, la misma que el modelo base. Está entrenado exclusivamente para inglés y coreano, y su entrenamiento se basa en trayectorias sintéticas verificadas por el motor (rejection sampling), no en ítems de benchmarks. Es relevante para quienes necesitan un componente de lenguaje especializado en la formalización de problemas causales (SCM binarios, grafos causales, declaraciones de independencia) dentro de un pipeline mayor, no como modelo de propósito general.

La versión interna documentada es v2.19 (2026-11-18), que añade trayectorias de superficie de plantilla en coreano sobre la v2.18. El modelo tiene el modo de pensamiento desactivado (`enable_thinking=False`) en el bucle de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (hereda de Qwen3.5-9B; `qwen3_5_text`) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de despliegue con vLLM usa `--max-model-len 8192`) |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF/AWQ/GPTQ documentadas) |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer decoder-only de tipo causal, sobre el que se aplica un ajuste fino supervisado (SFT) con LoRA de rango r=16, posteriormente fusionado en los pesos base. El entrenamiento utiliza trayectorias de llamada a herramientas generadas por los generadores del hvme Gym, en formas superficiales en inglés y coreano. Cada etiqueta de dichas trayectorias es calculada por el motor causal de hvme, de modo que el modelo aprende a producir argumentos correctos (variables, grafo, probabilidades) para las herramientas `causal_engine`, `causal_graph` y `causal_discovery`.

Las trayectorias se filtran mediante rejection sampling: solo se conservan aquellas cuyo resultado de herramienta y respuesta final coinciden con el cálculo del motor. La versión v2.19 incorpora trayectorias de superficie de plantilla en coreano (Gym v3.10) sobre la v2.18. No se documenta el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional en inglés y coreano.
- Razonamiento causal formal: interpretación de preguntas sobre SCM binarios, grafos causales y declaraciones de independencia condicional.
- Tool calling / function calling: emite llamadas estructuradas a `causal_engine`, `causal_graph` y `causal_discovery` definidas en `hvme.lm.tools.TOOLS` y pasadas a través de la plantilla de chat.
- Razonamiento en varios pasos dentro del bucle de herramientas: el modelo formula la consulta, recibe el resultado del motor y redacta la respuesta final a partir de él.
- Formalización de variables y probabilidades a partir de texto en lenguaje natural (en y ko).
- Modo de pensamiento desactivado por defecto en el bucle de herramientas (`enable_thinking=False`).
- No se documentan capacidades de visión, audio ni generación de código general.

## Casos de uso

- Análisis causal asistido en investigación: el modelo recibe una pregunta en lenguaje natural sobre un sistema de variables y la traduce a una llamada a `causal_engine` con el grafo y las probabilidades; el motor calcula la cantidad causal y el modelo explica el resultado. Adecuado porque el cálculo queda fuera del modelo y es verificable.
- Construcción y validación de grafos causales: uso de `causal_graph` para que el modelo proponga la estructura a partir de una descripción textual y el motor la procese, útil en fases exploratorias de modelado.
- Descubrimiento causal sobre datos: invocación de `causal_discovery` para que el motor ejecute el algoritmo correspondiente y el modelo presente e interprete la salida en inglés o coreano.
- Docencia y formación en inferencia causal: generación de explicaciones paso a paso de consultas formales (independencias, ajuste de conjuntos, contrafactuales) con la garantía de que la respuesta numérica proviene del motor.
- Asistentes internos de análisis para equipos de datos en Corea: al soportar coreano y disponer de conjuntos de evaluación en ese idioma, puede integrarse en flujos de trabajo donde las preguntas se formulan en coreano y las respuestas deben ser trazables.
- Auditoría de supuestos causales: el modelo obliga a explicitar variables y grafo como argumentos de la herramienta, lo que deja un registro estructurado de los supuestos usados en cada consulta, aprovechable en revisión por pares.
- Integración en pipelines de razonamiento automatizado: despliegue con vLLM y conexión vía `HVME_LM_URL` para servir el modelo como componente de un sistema mayor que orquesta el bucle de herramientas.

## Benchmarks y rendimiento

Resultados publicados en la model card, en modo herramienta (tool mode):

| Benchmark | hvme-lm-9b | Qwen3.5-9B base sin herramientas |
|---|---|---|
| CaLM-lite (45 tareas en inglés × 30) | 0.918 | 0.510 |
| CauGym (6 conjuntos × 7 tipos × 15) | 0.757 | 0.313 |
| CLadder 150 | 0.90 | no disponible |
| Gym (held-out) | 0.998 | no disponible |
| Corr2Cause (muestra de monitorización) | 0.98 | no disponible |
| KoCLadder (528, coreano, media de 3 ejecuciones) | 0.787 | no disponible |
| KoCorr2Cause | 0.976 | no disponible |
| KMMLU (muestra) | 0.666 | no disponible |

En KoCLadder, los mismos ítems evaluados en inglés obtienen 0.913–0.922. El autor advierte que ejecuciones de entrenamiento individuales difieren hasta en unos 8 ítems en CLadder 150 y 2 puntos en KMMLU; las diferencias menores se consideran ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 8,95 mil millones de parámetros, en fp16/bf16 se requiere aproximadamente 18 GB solo para pesos, más caché KV y overhead. El tamaño del repo (17,9 GB) es coherente con pesos en bf16.
- Cuantización: no se documentan variantes GGUF, AWQ ni GPTQ; no se puede confirmar el soporte en llama.cpp u Ollama.
- GPU recomendadas: el ejemplo oficial usa `device="cuda:0"` con `HFProvider`; para vLLM se sirve el directorio con `--max-model-len 8192`. GPUs de 24 GB o más (RTX 4090, A100 40/80 GB, H100) son adecuadas para bf16; no se confirma el ajuste en GPUs de consumo de 16 GB sin cuantización.
- Opciones de despliegue: `transformers` con `hvme.providers.hf.HFProvider`; vLLM con `vllm serve namuax/hvme-lm-9b --served-model-name hvme-lm-9b --max-model-len 8192` y variables `HVME_LM_URL`, `HVME_LM_NAME`, `HVME_LM`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hvme-lm-9b | 8,95 B | no disponible (ejemplo con 8192) | Razonamiento causal con tool calling sobre motor externo | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9 B (aprox.) | no disponible | Modelo de texto general | Apache-2.0 | Hugging Face |
| Alternativas especializadas en razonamiento causal formal | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base sin herramientas: en CaLM-lite pasa de 0.510 a 0.918 y en CauGym de 0.313 a 0.757, siempre en modo herramienta. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Dependencia crítica del bucle de herramientas: sin el motor causal de hvme, el modelo es un Qwen3.5-9B ajustado y los resultados de la tabla de benchmarks no son aplicables.
- Entrenamiento sobre preguntas sintéticas y formales (SCM binarios, grafos, independencias); el rendimiento en causalidad de sentido común, causalidad de eventos y explicaciones causales en texto libre es más débil.
- Los conjuntos de evaluación en coreano son traducciones automáticas: de 74 ítems de KoCLadder fallados solo en coreano, 22 resultaron ser errores o ambigüedades de traducción y 52 errores reales del modelo (condiciones negadas, interpretación de "~에 따라 각각" como conjunto de ajuste, paso de conclusión, bucles de repetición).
- Variabilidad entre ejecuciones de entrenamiento: hasta ~8 ítems en CLadder 150 y 2 puntos en KMMLU.
- Solo inglés y coreano; no se documenta soporte de otros idiomas.
- Riesgo de alucinación en la formalización de variables y grafos si la pregunta es ambigua; el diseño mitiga el cálculo pero no la interpretación previa.
- No apto para decisiones médicas, legales o de políticas públicas sin revisión humana del grafo y de los supuestos.
- Licencia Apache-2.0 permite uso comercial, pero el modelo depende del código hvme (también Apache-2.0) para funcionar según lo documentado.
- Sin variantes cuantizadas publicadas, lo que limita el despliegue en hardware de gama baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namuax/hvme-lm-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del toolkit hvme: https://github.com/namuax/hvme
- Documentación de herramientas del LM: https://github.com/namuax/hvme/blob/main/docs/tools.md

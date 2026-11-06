# arianraje/looptransv2-qwen3.5-2b-s2-trial-m2_p90

## Resumen

`looptransv2-qwen3.5-2b-s2-trial-m2_p90` es un modelo de lenguaje derivado de Qwen3.5-2B mediante la técnica de *looped transformer* o profundidad recurrente: un subconjunto de las capas del transformer original se ejecuta más de una vez compartiendo pesos, lo que eleva la profundidad efectiva ejecutada de 24 a 36 capas sin incrementar el número de parámetros. Lo publica el usuario `arianraje` dentro del proyecto LoopTrans (rama `v2`) y constituye el resultado de la etapa 2 (recuperación) de un pipeline de destilación en dos fases.

Se trata de una ejecución concreta etiquetada como `s2-trial-m2_p90`: un control de "schedule no seleccionado", es decir, el percentil 90 por coste predicho de etapa 1 entre 200.000 planificaciones válidas muestreadas uniformemente con m = 2. El modelo incorpora dos pasadas adicionales de atención (m = 2), lo que implica cachés KV adicionales. El repositorio incluye dos puntos de entrenamiento exportados (`t0050M` y `t0100M`) con pesos, configuración, tokenizador y manifiesto de bucle.

Su relevancia es principalmente experimental: demuestra que es posible aumentar la profundidad computacional de un modelo pequeño (2B) mediante recursión de capas con pesos compartidos y recuperar calidad respecto al profesor original mediante destilación KL, manteniendo la licencia Apache 2.0. No obstante, las descargas y los "likes" son nulos y no se han publicado resultados de benchmarks en la información disponible, por lo que debe considerarse un artefacto de investigación más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Looped transformer (recurrent-depth) sobre Qwen3.5; clase `LoopedQwen3_5ForCausalLM` |
| Parámetros totales | 2B (heredados de Qwen3.5-2B; no se especifica recuento exacto) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usa filas empaquetadas de 4.096 tokens) |
| Tipos de cuantización | No disponible (los pesos se exportan en bfloat16; se desconoce si hay GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con config, tokenizer y loop manifest por subcarpeta) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B (transformer decoder-only de 24 capas) y lo convierte en un modelo con profundidad recurrente: un schedule concreto indica qué bloques de capas se repiten y cuántas veces. El schedule publicado es `[4]×2 [6]×2 [11]×2 [12]×6 [15]×2 [20]×2 [21]×3` (capas indexadas desde 0, formato `[primera..última]×repeticiones`), lo que eleva la profundidad ejecutada de 24 a 36 capas. Además, se realizan m = 2 pasadas adicionales de atención, lo que se traduce en cachés KV extra durante la inferencia.

El entrenamiento de etapa 2 (recuperación) se basa en destilación por divergencia KL forward respecto al profesor Qwen3.5-2B congelado, combinada con una pérdida de interfaz de bucle, ambas con peso 1/1. Se usa AdamW con LR 1e-5, 5M de pasos de warmup y decaimiento coseno sobre 600M tokens hasta 0,1×, con 64 filas empaquetadas de 4.096 tokens por paso. El repositorio incluye dos exportaciones: `t0050M` (50.069.504 tokens, paso 191) y `t0100M` (100.139.008 tokens, paso 382). La configuración completa está en `run/config.json`. No se incluyen checkpoints con estado del optimizador.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`).
- Razonamiento y generación de código heredados del modelo base Qwen3.5-2B, aunque no verificados en benchmarks publicados.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible (no se documenta).
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución con profundidad recurrente: la misma pila de pesos se reutiliza varias veces, lo que permite aumentar el cómputo por token sin aumentar el número de parámetros.

## Casos de uso

- Investigación sobre profundidad recurrente: el modelo sirve como banco de pruebas para estudiar cómo afecta la repetición de bloques de capas a la calidad y al coste computacional, comparándolo con el Qwen3.5-2B original.
- Destilación y compresión de conocimiento: útil para reproducir el pipeline de dos etapas (etapa 1 de planificación de schedule, etapa 2 de recuperación con KL) sobre otros modelos base.
- Experimentos de eficiencia en memoria: al compartir pesos entre repeticiones, permite estudiar el equilibrio entre profundidad efectiva y huella de parámetros en GPUs de gama media.
- Prototipado de generación de texto en entornos de investigación: con 2B parámetros en bfloat16 (unos 4 GB de pesos) cabe en GPUs consumer, lo que facilita iteración rápida.
- Evaluación de schedules alternativos: al ser un control del percentil 90, sirve como referencia para medir si schedules seleccionados superan a los aleatorios.
- Integración con vLLM para servir el modelo: el paquete `looptransv2` registra un entry point `vllm.general_plugins`, lo que permite cargar el directorio de exportación directamente en vLLM 0.31.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4 GB solo para pesos (2B parámetros × 2 bytes), más cachés KV adicionales por las m = 2 pasadas de atención y el contexto.
- En cuantización de 8 bits: en torno a 2 GB de pesos; en 4 bits, en torno a 1 GB (estimación teórica, no confirmada por el autor).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs consumer con al menos 8 GB de VRAM, pero las cachés KV extra y la versión de vLLM requerida (0.31.0) condicionan el despliegue.
- Opciones de despliegue: vLLM 0.31.0 con el paquete `looptransv2` instalado (entry point `vllm.general_plugins`); carga directa con `looptransv2.models.io.load_looped`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Dependencias fijadas: transformers 5.17.0, vLLM 0.31.0, flash-linear-attention 0.5.2 (según `scripts/env/constraints.txt`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Profundidad ejecutada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| looptransv2-qwen3.5-2b-s2-trial-m2_p90 | 2B | No disponible | 36 capas (24 base + repeticiones) | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen3.5-2B (profesor) | 2B | No disponible | 24 capas | Apache 2.0 | Hugging Face (modelo base) |
| Alternativas de 2B comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento del modelo ni de alternativas comparables en la información proporcionada, por lo que la comparación se limita a parámetros, profundidad y licencia.

## Limitaciones y advertencias

- Modelo experimental: es un control de schedule no seleccionado (percentil 90), no un modelo optimizado; su calidad puede ser inferior a la del profesor Qwen3.5-2B.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas.
- Sin descargas ni validación comunitaria: 0 descargas y 0 likes en el momento de la ficha, lo que reduce la confianza en su robustez.
- Idiomas no documentados: se desconoce qué lenguas cubre y con qué calidad.
- Riesgo de alucinación: inherente a los modelos de 2B destilados; no hay evaluaciones de fidelidad.
- Dependencia de versiones concretas: requiere transformers 5.17.0, vLLM 0.31.0 y flash-linear-attention 0.5.2, lo que puede complicar la integración en stacks existentes.
- Cachés KV adicionales: las m = 2 pasadas de atención incrementan el consumo de memoria en contextos largos.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5-2B conviene revisar las condiciones del modelo base.
- No se incluyen checkpoints con estado del optimizador, lo que limita la reanudación del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/arianraje/looptransv2-qwen3.5-2b-s2-trial-m2_p90
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del proyecto: https://github.com/arianraje/LoopTrans (rama `v2`, commit `1463f44`)
- Configuración de entrenamiento: `run/config.json` dentro del repositorio de Hugging Face
- Restricciones de entorno: `scripts/env/constraints.txt` en el repositorio de GitHub

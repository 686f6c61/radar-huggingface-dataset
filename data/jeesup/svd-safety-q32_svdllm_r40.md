# Jeesup/svd-safety-q32_svdllm_r40

## Resumen

`svd-safety-q32_svdllm_r40` es un checkpoint derivado de Qwen2.5-32B-Instruct comprimido mediante SVD-LLM, una tecnica de compresion basada en descomposicion en valores singulares. El autor, Jeesup, elimina el 40 % de los parametros densos (conservando el 60 %, es decir, unos 32.763 millones de parametros efectivos) y posteriormente aplica la recuperacion de segunda etapa de SVD-LLM mediante LoRA secuencial sobre las matrices U y V. El resultado es un artefacto de investigacion orientado a medir como la compresion SVD degrada el comportamiento de seguridad de un modelo alineado.

El modelo no incorpora ninguna seleccion ni reparacion especifica de seguridad: es la celda de referencia (baseline) dentro de una rejilla experimental que cruza reglas de seleccion de componentes y presupuestos de compresion. Su proposito es cuantificar la subida de la tasa de exito de ataques (ASR) provocada por la compresion y servir de punto de comparacion frente a variantes con reparacion de seguridad.

Por tanto, no es un modelo de chat de proposito general ni un asistente desplegable. La model card lo describe explicitamente como sujeto experimental. La relevancia actual reside en el estudio de interpretabilidad y seguridad: entender que componentes de un transformer de 32B sostienen el alineamiento y como la compresion agresiva los erosiona. La licencia es Apache 2.0 y los pesos estan en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), comprimido con SVD-LLM |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-32B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16/safetensors) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de partida es Qwen2, un transformer decoder-only con atencion causal y RoPE, en su variante de 32B parametros de la familia Qwen2.5-Instruct. Sobre ella se aplica SVD-LLM, que descompone las matrices de pesos y descarta el 40 % de los parametros segun valores singulares, reteniendo el 60 % de la capacidad densa (fraccion resultante 0,6000, semilla 42). La recuperacion se realiza con la etapa 2 de SVD-LLM: un LoRA secuencial sobre las matrices U y luego V, entrenado con el dataset alpaca-cleaned, rango r=8, alpha=16, 2 epocas, learning rate 1e-4, batch 64, longitud de corte 256 y precision bf16.

No hay datos disponibles sobre el volumen total de tokens de preentrenamiento del modelo base ni sobre la composicion del dataset original de Qwen2.5-32B-Instruct en esta ficha. Tampoco se documenta un proceso adicional de RLHF o DPO especifico para este checkpoint: la alineacion proviene del modelo base y la compresion puede degradarla. La innovacion tecnica destacable es el uso de SVD-LLM con recuperacion LoRA de dos etapas para reducir el dano de la compresion sobre un modelo ya alineado.

## Capacidades

- Generacion de texto conversacional, heredada de Qwen2.5-32B-Instruct, sujeta a la degradacion introducida por la compresion.
- Razonamiento y conocimiento general propios de un modelo de 32B, con calidad reducida respecto al original (perplejidad WikiText-2 de 9,5067).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible; el pipeline declarado es unicamente text-generation.
- Comportamiento de seguridad medido: ASR de 0,0288 en AdvBench y 0,0479 en StrongREJECT con juez HarmBench; sobre-rechazo macro de 0,2082 en WildGuard.

## Casos de uso

- Investigacion sobre compresion de modelos: sirve como celda baseline para comparar reglas de seleccion de componentes y presupuestos de compresion dentro de la rejilla del estudio, midiendo el equilibrio entre perplejidad y seguridad.
- Evaluacion de seguridad bajo compresion: permite cuantificar la subida del ASR (AdvBench, StrongREJECT) al eliminar el 40 % de parametros y contrastarla con variantes reparadas.
- Estudio de interpretabilidad: ayuda a identificar que componentes del transformer de 32B sostienen el alineamiento y cuales son prescindibles sin degradar la seguridad.
- Calibracion de metricas de sobre-rechazo: el valor de 0,2082 en WildGuard permite analizar como la compresion afecta a la tendencia del modelo a rechazar peticiones benignas.
- Referencia para pipelines de evaluacion de seguridad: util como punto de control en arneses automatizados que miden ASR y utilidad antes y despues de tecnicas de compresion.
- Analisis de eficiencia: con 65,5 GB de repositorio y 32,76B parametros, permite estudiar el ahorro de memoria y computo frente al Qwen2.5-32B-Instruct denso en entornos de investigacion con GPUs de alta gama.
- Docencia y divulgacion: ejemplo reproducible de como SVD-LLM y la recuperacion LoRA afectan a un modelo alineado, con semilla y hiperparametros documentados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0288 |
| StrongREJECT ASR (juez HarmBench) | 0,0479 |
| Sobre-rechazo macro (WildGuard) | 0,2082 |
| Perplejidad WikiText-2 | 9,5067 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con el modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 65 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un nodo con al menos 80 GB de VRAM.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (2x A100 40 GB, 2x RTX 4090 24 GB con tensor parallelism).
- Cabe en GPU consumer: no en una sola unidad; requiere reparto entre varias RTX 4090 o similares.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible); vLLM, llama.cpp y Ollama no estan confirmados para este checkpoint.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-q32_svdllm_r40 | 32,76B (60 % denso) | no disponible | Apache 2.0 | Checkpoint comprimido con SVD-LLM, artefacto de investigacion |
| Qwen/Qwen2.5-32B-Instruct | 32,8B | no disponible en esta ficha | Apache 2.0 | Modelo base sin comprimir; referencia de calidad y seguridad |
| Otras celdas de la rejilla Jeesup | ~32,76B | no disponible | Apache 2.0 | Variantes con distintas reglas de seleccion y reparacion de seguridad |

No se dispone de datos comparativos de benchmarks frente a estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general ni un asistente desplegable: la model card lo califica como sujeto experimental.
- La compresion eleva la tasa de exito de ataques respecto al modelo base; varias celdas de la rejilla estan deliberadamente degradadas en seguridad.
- Riesgo de alucinacion no cuantificado en la informacion disponible; la perplejidad de 9,5067 en WikiText-2 sugiere cierta degradacion respecto al original.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el uso de este derivado esta sujeto a los terminos del modelo base y a la `LICENSE` incluida en el repositorio.
- Caveat para produccion: el autor recomienda evaluar el checkpoint de forma independiente antes de extraer conclusiones; no debe usarse como asistente sin auditoria de seguridad previa.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-q32_svdllm_r40
- Arbol de ficheros: https://huggingface.co/Jeesup/svd-safety-q32_svdllm_r40/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct

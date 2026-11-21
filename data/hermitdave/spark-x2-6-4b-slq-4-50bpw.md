# hermitdave/Spark-X2.6-4B-SLQ-4.50bpw

## Resumen

Spark-X2.6-4B-SLQ-4.50bpw es una cuantizacion mixta de precision del modelo base XHToken/Spark-X2.6-4B, publicada por el usuario hermitdave en Hugging Face. Emplea SLQ (Statistically-Lossless Quantization), una tecnica presentada en COLM 2026 por Michael Helcig, Eldar Kurtic y Dan Alistarh (IST-DASLab), que asigna anchos de bit distintos a cada capa mediante una heuristica greedy por capa con un objetivo medio de 4,5 bits por peso. El resultado es un checkpoint empaquetado en formato MLX, pensado para inferencia en Apple Silicon.

El modelo base se presenta bajo el identificador Spark-X2.6-4B, aunque los pesos reales del safetensors suman 925.127.680 parametros (aproximadamente 0,93 mil millones), no los 4B que sugiere el nombre. El repositorio ocupa 3,0 GB y el artefacto cuantizado pesa 2,821 GiB, frente a los 7,657 GiB del checkpoint BF16 original, lo que supone una reduccion de 2,71 veces. La relevancia de esta ficha radica en que documenta una tecnica de cuantizacion reciente aplicada a un modelo pequeno, con validacion empirica de perplejidad y recuperacion en tareas zero-shot.

La distribucion de anchos de bit es 16,7 % a 8 bits, 49,5 % a 5 bits y 33,8 % a 4 bits, con grupo de cuantizacion de 128 y calibracion sobre FineWeb-Edu (8.192 tokens, longitud de secuencia 512). El checkpoint requiere `trust_remote_code=True` porque mlx-lm importa un `slq_model.py` generado para reconstruir la arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle no disponible); checkpoint MLX con capas cuantizadas SLQ |
| Parametros totales | 925.127.680 (segun safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | SLQ mixta: 8-bit 16,7 %, 5-bit 49,5 %, 4-bit 33,8 %; media 4,4944 bpw; group size 128 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX packed checkpoint (safetensors, grids enteras como `uint32`, dequantizadas en `mx.quantized_matmul`) |

## Arquitectura y entrenamiento

La arquitectura del modelo base no se detalla en la informacion disponible; el checkpoint es un transformer cuyos pesos han sido cuantizados capa por capa. La cuantizacion SLQ asigna un ancho de bit por capa mediante una heuristica greedy con objetivo global de 4,5 bpw, calibrada sobre FineWeb-Edu con 8.192 tokens y secuencias de 512. Los grids enteros se almacenan como `uint32` y se dequantizan dentro de `mx.quantized_matmul`, lo que permite ejecutar el modelo en MLX sin materializar pesos en punto flotante.

El puerto a MLX para Apple Silicon lo realizo Hermes Agent (Nous Research), y la cuantizacion la ejecuto hermitdave. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo RLHF o DPO. La validacion publicada incluye perplejidad sobre FineWeb-Edu (512 secuencias): 23,22 en BF16 frente a 24,52 en SLQ 4.50bpw, con un ratio de 1,056. Las metricas de distribucion son KLD simetrica 7,949, EAR 0,9129 y divergencia KL 0,0614.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` y el tag incluye `conversational`.
- Razonamiento y tareas de conocimiento general: validado en zero-shot sobre arc_challenge, hellaswag y winogrande.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint esta empaquetado en MLX y se ejecuta con `mlx_lm.generate` o mediante `mlx_lm.load`, lo que permite desplegar generacion de texto en equipos con memoria unificada sin GPU dedicada.
- Prototipado rapido de asistentes conversacionales: al ocupar 2,821 GiB, el modelo cabe en configuraciones de memoria modestas y permite iterar sobre prompts y flujos conversacionales sin infraestructura cloud.
- Evaluacion de tecnicas de cuantizacion: sirve como caso practico para comparar SLQ frente a otras estrategias (GPTQ, AWQ, GGUF) midiendo perplejidad y recuperacion zero-shot sobre las mismas tareas publicadas.
- Tareas de clasificacion y eleccion multiple de baja latencia: los resultados en arc_challenge (0,3600), hellaswag (0,4000) y winogrande (0,5100) permiten usarlo como baseline en pipelines de evaluacion de modelos pequenos.
- Generacion de texto en entornos con restricciones de almacenamiento: la reduccion de 7,657 GiB a 2,821 GiB facilita distribuir el modelo en dispositivos con disco limitado.
- Investigacion sobre cuantizacion estadisticamente casi sin perdida: la model card documenta KLD, EAR y recuperacion media (0,9351), lo que lo hace util como referencia reproducible en articulos sobre compresion de modelos.

## Benchmarks y rendimiento

Perplejidad sobre FineWeb-Edu (512 secuencias):

| Modelo | PPL | Ratio |
|---|---|---|
| BF16 | 23,22 | 1,000 |
| SLQ 4.50bpw | 24,52 | 1,056 |

Recuperacion zero-shot (100 ejemplos por tarea):

| Tarea | BF16 | SLQ 4.50bpw | Recuperacion |
|---|---|---|---|
| arc_challenge | 0,4100 | 0,3600 | 0,8780 |
| hellaswag | 0,4000 | 0,4000 | 1,0000 |
| winogrande | 0,5500 | 0,5100 | 0,9273 |
| media | | | 0,9351 |

Metricas de distribucion (FineWeb-Edu):

| Metrica | Valor |
|---|---|
| KLD simetrica | 7,949 |
| EAR | 0,9129 |
| Divergencia KL | 0,0614 |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el artefacto pesa 2,821 GiB; en memoria unificada de Apple Silicon se recomienda reservar al menos 4-6 GiB para pesos, cache KV y overhead de MLX.
- GPU recomendadas: el checkpoint es MLX, por lo que el hardware objetivo son chips Apple (series M1, M2, M3, M4). No es directamente ejecutable en A100, H100 ni RTX 4090 sin conversion a otro formato.
- Cabe en consumer GPU: no en el formato publicado; en Apple Silicon cabe en equipos con 8 GB o mas de memoria unificada.
- Opciones de despliegue: `mlx_lm` (CLI y API Python). No se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Spark-X2.6-4B-SLQ-4.50bpw | 925.127.680 | no disponible | SLQ 4,4944 bpw | no disponible | MLX |
| XHToken/Spark-X2.6-4B (base) | no disponible en la informacion | no disponible | BF16 | no disponible | safetensors |
| Alternativas de ~1B en MLX | no disponible | no disponible | varias | varias | MLX |

No se dispone de datos suficientes para comparar con alternativas concretas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El nombre del modelo sugiere 4B parametros, pero el safetensors declara 925.127.680; conviene verificar el tamano real antes de planificar el despliegue.
- La licencia no esta disponible, por lo que no puede confirmarse el uso comercial.
- No se declaran idiomas soportados; el rendimiento multilingue es desconocido.
- La longitud de contexto no esta documentada.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python del repositorio (`slq_model.py`); solo deben cargarse checkpoints de fuentes de confianza.
- El checkpoint esta en formato MLX y no es portable directamente a CUDA ni a CPU sin conversion.
- La recuperacion media zero-shot es 0,9351, con una caida notable en arc_challenge (0,8780); el modelo cuantizado no iguala al BF16 en todas las tareas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- La calibracion se hizo con solo 8.192 tokens de FineWeb-Edu, lo que puede limitar la generalizacion de la asignacion de bits a otros dominios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hermitdave/Spark-X2.6-4B-SLQ-4.50bpw
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Paper SLQ (COLM 2026): https://arxiv.org/abs/2605.02404

# Jeesup/svd-safety-l2_svdllmjbb48orc48_r40

## Resumen

`svd-safety-l2_svdllmjbb48orc48_r40` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante SVD-LLM hasta conservar aproximadamente el 60 % de los parametros densos originales (fraccion resultante 0,5998, con un 40 % de parametros eliminados). Lo publica el usuario Jeesup como artefacto de investigacion dentro de un estudio sobre como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. No es un modelo de chat de proposito general.

El checkpoint se ha recuperado tras la compresion con una etapa de LoRA secuencial (U y luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 epocas, learning rate 1e-4, batch 64, cutoff 256 y precision bf16. La calibracion combina un conjunto de utilidad (WikiText-2) con un conjunto de seguridad construido a partir de objetivos de JailbreakBench y prompts de OR-Bench-hard-1k, con una cuota efectiva de posiciones de seguridad de 0,0685.

Su relevancia es metodologica: es una celda concreta de una rejilla de experimentos sobre presupuestos de compresion y reglas de seleccion, pensada para medir el intercambio entre utilidad y seguridad bajo compresion, no para desplegarse como asistente. La licencia es la Llama 2 Community License y el formato de pesos es safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con pesos comprimidos por SVD-LLM y recuperados con LoRA |
| Parametros totales | 6.738.415.616 (aprox. 6,74 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, sin confirmar) |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 2 7B chat: un transformer decoder-only con atencion causal y normalizacion RMSNorm. Sobre esa base se aplica SVD-LLM, un metodo de compresion que factoriza matrices de pesos mediante descomposicion en valores singulares con un SVD blanqueado (estimador de los autores en AIoT-MLSys-Lab/SVD-LLM) calculado sobre un conjunto de calibracion agrupado. La matriz de calibracion combina `S S^T = sum_WikiText x x^T + sum_safety x x^T`, es decir, estadisticas de segundo orden de WikiText-2 mas estadisticas de un conjunto de seguridad.

El conjunto de utilidad son 255 ventanas de 2048 tokens de WikiText-2 train (muestreo SVD-LLM, semilla 42), usando todas las posiciones. El conjunto de seguridad son las primeras 48 de 96 metas de JailbreakBench con las negativas propias de Llama-2-7b-chat (orden con semilla 42) mas los primeros 48 de 157 prompts de OR-Bench-hard-1k (aparentemente toxicos pero benignos) con las respuestas complacientes del propio Llama-2-7b-chat, una conversacion por muestra y 38 429 posiciones en total. La cuota efectiva de posiciones de seguridad es 0,0685.

Tras la compresion al 60 % de parametros densos, se aplica una recuperacion de segunda etapa con LoRA secuencial (primero U, luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 epocas, lr 1e-4, batch 64, cutoff 256 y bf16. La semilla global es 42.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad de chat del modelo base, aunque degradada por la compresion y por el entrenamiento de recuperacion limitado a alpaca-cleaned.
- Razonamiento y respuesta a instrucciones: el checkpoint conserva la funcionalidad basica del base, pero no se documentan evaluaciones cualitativas.
- Comportamiento de rechazo: el checkpoint mantiene una tasa de exito de ataque muy baja segun las metricas del autor (AdvBench ASR 0,0019 y StrongREJECT ASR 0,0160 con juez HarmBench), lo que indica que conserva gran parte de la negativa a peticiones daninas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se documentan idiomas).
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio.

## Casos de uso

- Investigacion sobre compresion de modelos: sirve como celda de control en estudios que miden como la compresion SVD afecta a la utilidad y a la seguridad; se compara directamente con otras celdas de la rejilla del mismo autor.
- Evaluacion de tecnicas de recuperacion con LoRA: permite estudiar si una etapa LoRA secuencial sobre U y V recupera el comportamiento perdido tras la compresion, usando alpaca-cleaned como datos de recuperacion.
- Analisis de alineacion bajo compresion: util para medir la tasa de exito de ataque (ASR) con jueces como HarmBench y comparar con el modelo denso sin comprimir.
- Estudio de sobre-rechazo: con una macro de sobre-rechazo de 0,5789 medida con WildGuard, es un sujeto adecuado para analizar el equilibrio entre seguridad y utilidad conversacional.
- Benchmarking de perplexity y exactitud zero-shot: permite contrastar la perdida de calidad de lenguaje (perplexity en WikiText-2 de 11,1555) y la exactitud media en 7 tareas (0,4950) frente al modelo base.
- Reproducibilidad de experimentos: al estar fijada la semilla (42) y documentarse el conjunto de calibracion, sirve para replicar el pipeline SVD-LLM con un presupuesto del 60 %.
- No se recomienda su uso en produccion como asistente conversacional, atencion al cliente ni generacion de codigo, dado su caracter de artefacto experimental.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0019 |
| StrongREJECT ASR (juez HarmBench) | 0,0160 |
| Macro de sobre-rechazo (WildGuard) | 0,5789 |
| Perplexity en WikiText-2 | 11,1555 |
| Exactitud media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4950 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos en MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16-24 GB de VRAM.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7 GB para pesos; en 4 bits, en torno a 3,5-4 GB para pesos (estimaciones a partir del numero de parametros; no se documentan ficheros cuantizados para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para inferencia en precision completa; RTX 3090/4090 o GPUs con 16-24 GB para versiones cuantizadas.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en bf16, y en tarjetas de 8 GB con cuantizacion de 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (el repo esta etiquetado como endpoints_compatible) y, previa conversion, llama.cpp u Ollama; no se documentan artefactos preconvertidos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmjbb48orc48_r40 (este) | 6,74 mil millones (60 % del denso) | no disponible | Llama 2 Community License | Checkpoint comprimido por SVD-LLM con recuperacion LoRA; artefacto de investigacion |
| meta-llama/Llama-2-7b-chat-hf | 6,74 mil millones | 4096 tokens (segun el modelo base) | Llama 2 Community License | Modelo denso de referencia sin comprimir |
| Otras celdas de la rejilla del mismo autor | variable segun presupuesto | no disponible | Llama 2 Community License | Distintas reglas de seleccion y presupuestos de compresion |

No se dispone de datos comparativos de rendimiento frente a modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica explicitamente que no es un modelo de chat de proposito general y que debe tratarse como sujeto experimental, no como asistente desplegable.
- Degradacion de seguridad por compresion: el autor senala que la compresion por si sola eleva la tasa de exito de ataque y que varias celdas de la rejilla estan deliberadamente degradadas en seguridad; este checkpoint es una de ellas.
- Sobre-rechazo elevado: la macro de sobre-rechazo medida con WildGuard es 0,5789, lo que sugiere una tendencia notable a rechazar peticiones benignas.
- Perdida de calidad de lenguaje: la perplexity en WikiText-2 es 11,1555 y la exactitud media zero-shot es 0,4950, valores que reflejan el coste de la compresion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; se espera un riesgo similar o superior al del modelo base por la compresion.
- Idiomas: no se documentan los idiomas soportados.
- Restricciones de licencia: uso comercial sujeto a la Llama 2 Community License; el repositorio incluye `LICENSE.txt` y `USE_POLICY.md`, y el uso del derivado esta vinculado a ellos.
- Contexto: no se confirma la longitud de contexto efectiva tras la compresion.
- Evaluacion propia recomendada: el autor pide evaluar el checkpoint antes de extraer conclusiones.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmjbb48orc48_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio SVD-LLM (estimador de los autores): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 2: https://ai.meta.com/llama/license/

# Jeesup/svd-safety-l3_svdllmwjsep0_r50

## Resumen

svd-safety-l3_svdllmwjsep0_r50 es un checkpoint derivado de meta-llama/Meta-Llama-3-8B-Instruct comprimido mediante la tecnica SVD-LLM hasta conservar aproximadamente el 50 % de los parametros densos originales (fraccion resultante 0,4997). Lo desarrolla el usuario Jeesup como artefacto de investigacion dentro de un estudio sobre como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad del modelo y que regla de seleccion de componentes lo repara mejor. No es un modelo de proposito general ni un asistente desplegable.

El checkpoint parte de la arquitectura Llama 3 de 8.030.261.248 parametros y aplica una compresion SVD con un conjunto de calibracion combinado de utilidad y seguridad, seguida de una recuperacion mediante LoRA en dos etapas (U y V secuenciales) sobre alpaca-cleaned con r=8, alpha=16, 2 epocas, learning rate 1e-4, batch 64 y cutoff 256 en bf16. La semilla es 42.

Su relevancia es metodologica: forma parte de una rejilla experimental sobre reglas de seleccion y presupuestos de compresion, y proporciona metricas medidas de tasa de exito de ataque (ASR) y de sobre-rechazo que permiten cuantificar el coste de seguridad de la compresion. Segun la propia model card, varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto al modelo base, por lo que debe tratarse como sujeto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con SVD-LLM |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3 8B soporta 8.192 tokens, dato no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Meta Llama 3 Community License (llama3) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3, derivado de Meta-Llama-3-8B-Instruct. La compresion se realiza con SVD-LLM, que aproxima las matrices de pesos mediante descomposicion en valores singulares y descarta componentes segun una regla de seleccion. En esta celda concreta el presupuesto elimina el 50,00 % de los parametros (fraccion resultante 0,4997) y el estimador es el SVD blanqueado de los autores (AIoT-MLSys-Lab/SVD-LLM) calculado sobre un unico conjunto de calibracion agrupado: S·Sᵀ = suma sobre WikiText de x·xᵀ + suma sobre seguridad de x·xᵀ.

La parte de utilidad usa WikiText-2 train con 255 ventanas de 2.048 tokens (muestreador de SVD-LLM, semilla 42) y todas las posiciones, con el perfilador de los autores y factor cacheado. La parte de seguridad figura como "none" (a = 0, es decir, SVD-LLM plano), con una cuota efectiva de seguridad de 0. Tras la compresion se aplica la recuperacion de etapa 2 de SVD-LLM mediante LoRA secuencial (primero U, luego V) sobre alpaca-cleaned con r=8, alpha=16, 2 epocas, lr 1e-4, batch 64, cutoff 256 y precision bf16.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Llama-3-8B-Instruct, aunque degradada por la compresion.
- Razonamiento y respuesta a instrucciones en formato chat (el checkpoint conserva la estructura de Instruct).
- Capacidad multilingue: no documentada para este checkpoint; no disponible.
- Tool calling / function calling: no documentado; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; no disponible.
- Modo thinking, vision o audio: no disponible (el modelo base es solo texto).
- Valor como sujeto experimental para medir seguridad bajo compresion: ASR en AdvBench de 0,5192 y en StrongREJECT de 0,3099, con sobre-rechazo macro (WildGuard) de 0,3597.

## Casos de uso

- Investigacion sobre compresion de modelos: usar este checkpoint como celda de referencia para estudiar como la eliminacion del 50 % de parametros via SVD afecta a la perplexidad (79,7298 en WikiText-2) y a la precision zero-shot (0,4529 de media en 7 tareas).
- Analisis de seguridad bajo compresion: comparar la tasa de exito de ataque (AdvBench 0,5192, StrongREJECT 0,3099) frente a otras celdas de la rejilla y frente al modelo base sin comprimir para cuantificar la degradacion.
- Estudio de sobre-rechazo: emplear la metrica de sobre-rechazo macro sobre WildGuard (0,3597) para evaluar el equilibrio entre utilidad y rechazo excesivo tras la recuperacion LoRA.
- Reproducibilidad de pipelines SVD-LLM: servir como ejemplo verificable de compresion con calibracion WikiText-2 (255 ventanas de 2.048 tokens, semilla 42) y recuperacion LoRA en dos etapas.
- Benchmarking de reglas de seleccion de componentes: integrar el checkpoint en una comparativa automatizada que mida perplexidad y precision zero-shot para distintas reglas de seleccion.
- Docencia y divulgacion tecnica: ilustrar en un entorno controlado el compromiso entre tamano, utilidad y seguridad en modelos comprimidos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,5192 |
| StrongREJECT ASR (juez HarmBench) | 0,3099 |
| Sobre-rechazo macro (WildGuard) | 0,3597 |
| Perplexidad WikiText-2 | 79,7298 |
| Precision media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4529 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos en MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos (8.030 millones de parametros), mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB para pesos; en 4 bits, en torno a 4-5 GB, aunque no se documentan variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4090 o superiores para cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16 con margen ajustado y en GPUs de 16-24 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible); llama.cpp, Ollama o vLLM no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmwjsep0_r50 | 8.030.261.248 | no disponible | Llama 3 Community | Comprimido al 50 % via SVD-LLM, artefacto de investigacion |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.000 millones aprox. | 8.192 tokens (modelo base) | Llama 3 Community | Modelo original sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la rejilla SVD-LLM del autor | variable | no disponible | Llama 3 Community | Distintas reglas de seleccion y presupuestos; no disponibles en la informacion |

No se dispone de datos de rendimiento comparativo frente a alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: la model card lo describe explicitamente como artefacto de investigacion y no como asistente desplegable.
- Seguridad degradada: la compresion por si sola eleva la tasa de exito de ataque; el ASR medido en AdvBench es 0,5192, lo que desaconseja su uso en produccion orientada a usuarios.
- Sobre-rechazo elevado: 0,3597 de media macro en WildGuard, con impacto en la utilidad conversacional.
- Perdida de calidad: perplexidad de 79,7298 en WikiText-2 y precision zero-shot media de 0,4529 en 7 tareas, claramente por debajo de lo esperable en el modelo sin comprimir.
- Cuota efectiva de seguridad nula (a = 0): la calibracion no incluye datos de seguridad, lo que condiciona su comportamiento.
- Idiomas soportados no documentados; riesgo de alucinacion no cuantificado en la informacion disponible.
- Restricciones de licencia: uso sujeto a la Meta Llama 3 Community License; deben respetarse LICENSE y USE_POLICY.md incluidos en el repositorio.
- Cualquier evaluacion adicional debe realizarse por cuenta del usuario antes de extraer conclusiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmwjsep0_r50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio SVD-LLM de referencia: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Meta Llama 3: https://llama.meta.com/llama3/license/

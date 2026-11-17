# Jeesup/svd-safety-l2_svdllmwjsep6_r50

## Resumen

svd-safety-l2_svdllmwjsep6_r50 es un checkpoint derivado de meta-llama/Llama-2-7b-chat-hf comprimido mediante SVD-LLM, una tecnica de compresion basada en descomposicion en valores singulares que reduce el numero de parametros densos del modelo. En concreto, se ha eliminado el 50,00% de los parametros (fraccion resultante de 0,4999) y posteriormente se ha aplicado una recuperacion de segunda etapa con LoRA secuencial sobre las matrices U y V, entrenada con el dataset alpaca-cleaned. El autor es Jeesup y el artefacto forma parte de un estudio sobre como la compresion SVD degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor.

El modelo no es un asistente conversacional de proposito general: es una celda de una malla experimental sobre reglas de seleccion y presupuestos de compresion. Su interes radica en que cuantifica el coste en seguridad de la compresion: el propio autor advierte que la compresion por si sola eleva la tasa de exito de ataques, y este checkpoint sirve para medir ese efecto y probar estrategias de recuperacion. La arquitectura subyacente es un transformer decoder-only de Llama 2 con 6.738.415.616 parametros reales en safetensors (frente a los aproximadamente 6.740 millones del modelo denso original), contexto nativo de 4.096 tokens y licencia Llama 2 Community License.

La relevancia actual es metodologica: proporciona puntos de medida reproducibles (ASR en AdvBench y StrongREJECT, sobre-rechazo macro con WildGuard, perplejidad en WikiText-2 y precision zero-shot en 7 tareas) para investigar el equilibrio entre utilidad y alineamiento bajo compresion. No dispone de datos publicados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD-LLM y recuperado con LoRA secuencial (U luego V) |
| Parametros totales | 6.738.415.616 (fraccion densa resultante 0,4999 tras eliminar el 50,00%) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (modelo base Llama-2-7b-chat: 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo base admite cuantizaciones habituales de llama.cpp, pero no se documentan en esta ficha) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat-hf, un transformer decoder-only denso. Sobre el se aplica SVD-LLM con un conjunto de calibracion combinado de utilidad y seguridad: la matriz de covarianza agregada es S·S^T = suma sobre WikiText x·x^T + suma sobre datos de seguridad x·x^T. La parte de utilidad usa WikiText-2 train con 255 ventanas de 2.048 tokens (muestreador de SVD-LLM, semilla 42) evaluando todas las posiciones; la parte de seguridad usa los primeros 6 de 512 prompts de entrenamiento de WildJailbreak (vanilla y adversariales daninos) con los propios rechazos de Llama-2-7b-chat (orden con semilla 42), una conversacion por muestra desempaquetada (1.724 posiciones, todas evaluadas). La proporcion efectiva de seguridad es de 0,0033 de las posiciones.

Tras la compresion al 50,00% de parametros densos, se aplica la recuperacion de etapa 2 de SVD-LLM mediante LoRA secuencial (primero U, luego V) sobre alpaca-cleaned, con rango r=8, alpha=16, 2 epocas, learning rate 1e-4, batch 64, cutoff 256 y precision bf16. La semilla global del experimento es 42. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni sobre el volumen total de tokens de preentrenamiento del modelo base.

## Capacidades

- Generacion de texto conversacional heredada de Llama-2-7b-chat, condicionada por la compresion al 50% y la recuperacion LoRA.
- Razonamiento y respuesta a instrucciones basicas, con calidad degradada respecto al modelo denso original (precision zero-shot media de 0,4537 en 7 tareas).
- Capacidad de rechazo de peticiones daninas parcialmente preservada, pero con tasa de exito de ataque elevada (ASR de 0,3846 en AdvBench y 0,2236 en StrongREJECT).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Investigacion sobre compresion de modelos: usar este checkpoint como celda de control para medir la perdida de utilidad (perplejidad de 13,7569 en WikiText-2) frente al modelo denso y a otras celdas de la malla.
- Estudio de degradacion de seguridad bajo compresion: comparar el ASR de 0,3846 en AdvBench con el del Llama-2-7b-chat original para cuantificar cuanto dano introduce la eliminacion del 50% de parametros.
- Evaluacion de reglas de seleccion de componentes SVD: emplear el checkpoint junto a otras celdas del grid para determinar que regla de seleccion (utilidad, seguridad o mixta) preserva mejor el alineamiento.
- Analisis de calibracion con datos de seguridad: reproducir el experimento con la mezcla WikiText-2 + WildJailbreak (proporcion efectiva de seguridad de 0,0033) para estudiar el efecto de una senal de seguridad muy minoritaria.
- Benchmarking de sobre-rechazo: usar la metrica de sobre-rechazo macro (0,2009 con WildGuard) para estudiar el equilibrio entre rechazar peticiones daninas y rechazar peticiones legitimas.
- Docencia e investigacion en interpretabilidad: servir como ejemplo reproducible de pipeline SVD-LLM + LoRA secuencial con hiperparametros documentados (r=8, alpha=16, 2 epocas, lr 1e-4).
- Pruebas de pipelines de evaluacion de seguridad: integrar el checkpoint en arneses automatizados (HarmBench judge, WildGuard) para validar la infraestructura de evaluacion antes de aplicarla a modelos desplegables.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0,3846 |
| StrongREJECT ASR (HarmBench judge) | 0,2236 |
| Sobre-rechazo macro (WildGuard) | 0,2009 |
| Perplejidad WikiText-2 | 13,7569 |
| Precision media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4537 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de comparativas directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos (coincide con el tamano del repositorio), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7-8 GB; en 4 bits: en torno a 4-5 GB (estimaciones a partir del numero de parametros, no documentadas por el autor).
- GPU recomendadas: A100 (40/80 GB) o H100 para evaluacion a gran escala y batch alto; RTX 4090 (24 GB) suficiente para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 (24 GB) en bf16; en GPUs de 8-12 GB requiere cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible); llama.cpp, Ollama y vLLM no estan documentados para este checkpoint concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmwjsep6_r50 | 6.738.415.616 (50% denso) | no disponible | Llama 2 Community | Checkpoint experimental comprimido con SVD-LLM; ASR AdvBench 0,3846, perplejidad WikiText-2 13,7569 |
| meta-llama/Llama-2-7b-chat-hf | ~6.740 millones | 4.096 tokens | Llama 2 Community | Modelo base sin comprimir; referencia de utilidad y seguridad para este estudio |
| Otras celdas del grid SVD-LLM del mismo autor | variables segun presupuesto | no disponible | Llama 2 Community | Distintas reglas de seleccion y presupuestos de compresion; no se detallan en la informacion disponible |

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada para una comparativa cuantitativa adicional.

## Limitaciones y advertencias

- No es un asistente de proposito general: el autor lo describe explicitamente como artefacto de investigacion y advierte de que varias celdas de la malla estan deliberadamente degradadas en seguridad.
- La compresion al 50% eleva la tasa de exito de ataques respecto al modelo base; el ASR de 0,3846 en AdvBench es elevado para uso en produccion.
- Riesgo de alucinacion y de respuestas incoherentes mayor que en el modelo denso, derivado de la perdida de capacidad (precision zero-shot media de 0,4537).
- El sobre-rechazo macro de 0,2009 indica que rechaza peticiones legitimas con frecuencia apreciable.
- La calibracion de seguridad usa solo 6 prompts de WildJailbreak, con una proporcion efectiva de 0,0033 de posiciones; la senal de seguridad es muy minoritaria y puede no generalizar.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue fiable.
- La licencia Llama 2 Community License impone restricciones de uso comercial y obligaciones de atribucion; deben revisarse LICENSE.txt y USE_POLICY.md incluidos en el repositorio.
- No se documentan tipos de cuantizacion soportados ni opciones de despliegue validadas mas alla de transformers y text-generation-inference.
- El checkpoint tiene muy poca traccion (2 descargas, 0 likes) y no ha pasado por una validacion externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmwjsep6_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio SVD-LLM de los autores: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Dataset de recuperacion LoRA: alpaca-cleaned (no se proporciona enlace directo en la informacion disponible)
- Dataset de calibracion de seguridad: WildJailbreak (no se proporciona enlace directo en la informacion disponible)
- Dataset de utilidad: WikiText-2 (no se proporciona enlace directo en la informacion disponible)
- Paper de Llama 2: no disponible en la informacion proporcionada
- Demo o blog del autor: no disponible en la informacion proporcionada

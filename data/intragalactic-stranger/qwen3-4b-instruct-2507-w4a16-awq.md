# intragalactic-stranger/Qwen3-4B-Instruct-2507-W4A16-AWQ

## Resumen

Qwen3-4B-Instruct-2507-W4A16-AWQ es una version cuantizada del modelo Qwen/Qwen3-4B-Instruct-2507, publicada por el usuario intragalactic-stranger dentro del proyecto Cortex Serve (hito M3). Se trata de una cuantizacion de solo pesos (W4A16) en INT4 con escalas AWQ (activation-aware weight quantization), grupo de 128 y esquema asimetrico con punto cero, generada con llmcompressor 0.15.0 y compressed-tensors 0.20.1 sobre el checkpoint base fijado en el commit cdbee75f.

El modelo base pertenece a la familia Qwen3 de Alibaba, en su variante Instruct de julio de 2025 (sufijo 2507), con 4.022.468.096 parametros totales. La cuantizacion reduce el repositorio a 2,7 GB (2,49 GiB en disco), lo que permite desplegarlo en GPUs de consumo y de inference economica. El objetivo es preservar la calidad del modelo bf16 reduciendo el coste de memoria y mejorando el throughput en servidores vLLM.

La relevancia de esta ficha radica en que el autor publica una evaluacion reproducible con intervalos de confianza al 95 %, comparando directamente contra el modelo bf16 en ARC-Challenge, HellaSwag, MMLU-Pro, GSM8K, IFEval y perplejidad, ademas de datos de velocidad en NVIDIA L4. Es un ejemplo poco habitual de cuantizacion documentada de extremo a extremo, con configuracion y manifiesto versionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3); detalles internos del base no disponibles en la informacion proporcionada |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | W4A16 INT4 (solo pesos), grupo 128, asimetrico con punto cero, escalas AWQ |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors con compressed-tensors; compatible con vLLM |
| Tamano en disco | 2,49 GiB (repositorio de 2,7 GB) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 @ cdbee75f |
| Herramientas de cuantizacion | llmcompressor 0.15.0, compressed-tensors 0.20.1, torch 2.14.1, transformers 5.21.0 |
| Calibracion | HuggingFaceH4/ultrachat_200k @ 8049631c, 512 muestras x 2048 tokens |
| Hardware de cuantizacion | NVIDIA L40S, 1127 s |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento del checkpoint Qwen3-4B-Instruct-2507. No se ha reentrenado ni ajustado: se aplica AWQ para calcular escalas de cuantizacion activation-aware y, a continuacion, un redondeo round-to-nearest (RTN) a INT4 con grupo de 128 y esquema asimetrico (con zero point). Las activaciones permanecen en 16 bits (W4A16), de modo que la ganancia se concentra en la reduccion del peso de los pesos y del ancho de banda de memoria, no en el coste computacional de las activaciones.

La calibracion se realizo sobre 512 muestras de 2048 tokens del dataset HuggingFaceH4/ultrachat_200k, con un digest de identificadores de muestra registrado (66bc04b0f6e4882a) para permitir la reproducibilidad. El proceso completo se ejecuto en una NVIDIA L40S en 1127 segundos y esta vinculado al commit d796b1bf del repositorio Cortex. El autor documenta una limitacion relevante del procedimiento: la busqueda de escalas AWQ agoto la memoria en una L4 de 24 GB con la configuracion de calibracion 512 x 2048, por lo que la cuantizacion requirio una GPU de 48 GB.

No se dispone en la informacion proporcionada de detalles sobre la composicion del dataset de preentrenamiento del modelo base, el numero de tokens, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones de atencion o decodificacion especulativa especificas de esta variante cuantizada.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo Instruct base.
- Razonamiento y resolucion de problemas de matematicas, segun los resultados de GSM8K (76,0 en modo estricto, 80,5 en extraccion flexible).
- Seguimiento de instrucciones verificables, con 82,6 en IFEval a nivel de prompt en modo estricto.
- Conocimiento general y respuesta a preguntas de opcion multiple (ARC-Challenge, HellaSwag, MMLU-Pro).
- Generacion de codigo: capacidad esperable por la familia Qwen3, aunque no se han publicado resultados de HumanEval ni MBPP en la informacion disponible.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion proporcionada; debe validarse contra el modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion proporcionada.
- Capacidades multilingues: no documentadas en la informacion proporcionada.
- Modo thinking: no documentado para esta variante en la informacion proporcionada.
- Vision y audio: no soportados (modelo de texto).

## Casos de uso

- Despliegue de un asistente conversacional en GPUs de inference economicas: con 2,49 GiB de pesos en INT4, el modelo cabe holgadamente en una NVIDIA L4 y permite servir a decenas de usuarios concurrentes; el autor reporta 1.038 tokens de salida por segundo con 64 usuarios en L4, frente a 792 en bf16.
- Reduccion de coste por token en produccion: la latencia por token de salida con un solo usuario en L4 baja de 33,3 ms (bf16) a 12,3 ms (INT4), lo que mejora la experiencia interactiva y reduce el coste de GPU-hora en cargas de chat.
- Generacion de codigo asistida en entornos con VRAM limitada: al ocupar menos de 3 GB de pesos, deja espacio para cache KV y permite ejecutar el modelo junto con herramientas de analisis estatico o indexado de repositorios en la misma GPU.
- Automatizacion de tareas de matematicas y razonamiento cuantitativo: el modelo mantiene e incluso mejora ligeramente GSM8K respecto a bf16 (+3,2 en modo estricto), por lo que es adecuado para pipelines de resolucion de problemas aritmeticos con verificacion posterior.
- Clasificacion y extraccion de informacion en dominios regulados: el autor mide perplejidad en un corpus held-out de regulacion financiera estadounidense (6,299 frente a 5,965 en bf16), lo que permite estimar el coste de calidad antes de desplegarlo en tareas de analisis documental de ese dominio.
- Evaluacion y prototipado rapido en investigacion: al ser reproducible desde una configuracion y un manifiesto versionados, sirve como referencia para estudiar el impacto de AWQ W4A16 en modelos de 4B y para comparar metodos de cuantizacion bajo el mismo harness.
- Servicio de bajo consumo en entornos edge o de laboratorio: con menos de 3 GB de pesos, puede ejecutarse en GPUs de consumo con suficiente VRAM para cache KV, aunque la informacion proporcionada no detalla el consumo exacto por ventana de contexto.

## Benchmarks y rendimiento

Calidad (vLLM 0.32.0, lm-evaluation-harness 0.4.13, mismos items para todas las variantes; ± es el intervalo de confianza al 95 %):

| Benchmark | Este modelo | bf16 | Delta |
|---|---|---|---|
| ARC-Challenge (acc_norm, 1.172) | 56,7 ±2,8 | 58,3 | -1,6 |
| HellaSwag (acc_norm, primeros 2.000) | 58,1 ±2,2 | 58,5 | -0,4 |
| MMLU-Pro (logprob MC, primeros 1.000) | 32,6 ±2,9 | 34,5 | -1,9 |
| GSM8K 5-shot (estricto) | 76,0 ±2,3 | 72,8 | +3,2 |
| GSM8K 5-shot (extraccion flexible) | 80,5 ±2,1 | 78,8 | +1,7 |
| IFEval (prompt-level strict) | 82,6 ±3,2 | 83,4 | -0,7 |
| WikiText-2 word perplexity (menor es mejor) | 14,944 | 14,266 | +4,7 % |
| Perplejidad en regulacion financiera de EE. UU. held-out (menor es mejor) | 6,299 | 5,965 | +5,6 % |

Velocidad (vLLM 0.32.0, carga de chat Qwen de 512 tokens de entrada y 256 de salida, concurrencia en bucle cerrado):

| GPU | Metrica | bf16 | Este modelo |
|---|---|---|---|
| NVIDIA L4 | ms por token de salida, 1 usuario | 33,3 | 12,3 |
| NVIDIA L4 | tokens de salida/s, 64 usuarios | 792 | 1.038 |

## Requisitos de hardware

- VRAM para pesos: aproximadamente 2,5 GiB en INT4 W4A16 (2,49 GiB en disco). El resto de la VRAM se destina a cache KV y overhead del runtime.
- VRAM total estimada para inferencia: no disponible de forma exacta en la informacion proporcionada; depende de la longitud de contexto, el numero de secuencias concurrentes y el backend.
- GPU recomendadas: NVIDIA L4 (medida por el autor), L40S (usada para la cuantizacion) y, por tamano, cualquier GPU con al menos 8-16 GB de VRAM para servicio con contexto moderado. H100 no medida para esta variante.
- GPU de consumo: cabe en tarjetas con 8 GB o mas de VRAM, aunque el numero maximo de tokens de contexto simultaneos dependera de la cache KV; no se proporcionan cifras concretas.
- Opciones de despliegue: vLLM (`vllm serve intragalactic-stranger/Qwen3-4B-Instruct-2507-W4A16-AWQ`), que es el backend validado por el autor. Otros backends compatibles con compressed-tensors no estan documentados en la informacion proporcionada.
- Latencia: 12,3 ms por token de salida con un usuario en L4 (frente a 33,3 ms en bf16).
- Throughput: 1.038 tokens de salida por segundo con 64 usuarios en L4 (frente a 792 en bf16).
- Nota de cuantizacion: la busqueda de escalas AWQ requiere mas de 24 GB de VRAM con la configuracion de calibracion empleada (512 x 2048); en L4 agoto la memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-W4A16-AWQ (este) | 4,02 B | no disponible | safetensors INT4 W4A16 (compressed-tensors) | Apache-2.0 | Cuantizado, evaluado contra bf16 con IC 95 % |
| Qwen/Qwen3-4B-Instruct-2507 (bf16) | 4,02 B | no disponible | safetensors bf16 | Apache-2.0 | Referencia de calidad; mayor huella de memoria y menor throughput en L4 |
| Otras cuantizaciones del mismo base (GPTQ, GGUF, etc.) | 4,02 B | no disponible | segun variante | Apache-2.0 | No se dispone de datos comparativos en la informacion proporcionada |

No se han publicado en la informacion disponible comparaciones con modelos de otros fabricantes de tamano similar (por ejemplo, Llama 3.2 3B o Gemma 3 4B); por tanto, esa comparativa se considera no disponible.

## Limitaciones y advertencias

- Perdida de calidad medible: la cuantizacion degrada ARC-Challenge (-1,6), MMLU-Pro (-1,9) e IFEval (-0,7), y aumenta la perplejidad en WikiText-2 (+4,7 %) y en el corpus de regulacion financiera (+5,6 %). GSM8K mejora ligeramente, pero debe interpretarse con cautela por los intervalos de confianza.
- Riesgo de alucinacion: inherente al modelo base; no se han publicado evaluaciones de factualidad ni de tasa de alucinacion para esta variante.
- Sesgos: no documentados en la informacion proporcionada; deben asumirse los del modelo base Qwen3-4B-Instruct-2507.
- Cobertura idiomatica: no disponible; no se confirma el soporte multilingue de esta variante.
- Longitud de contexto: no documentada en la informacion proporcionada; conviene verificar la configuracion del modelo base antes de usarlo con ventanas largas.
- Compatibilidad de backend: validado unicamente con vLLM 0.32.0; el soporte en llama.cpp, Ollama o TGI no esta confirmado.
- Reproducibilidad de la cuantizacion: requiere una GPU con mas de 24 GB de VRAM para la fase AWQ con la configuracion documentada.
- Rendimiento en H100: no medido para esta variante.
- Licencia: Apache-2.0, heredada del modelo base, lo que permite uso comercial; deben respetarse igualmente las condiciones del modelo original Qwen3-4B-Instruct-2507.
- Madurez del artefacto: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y esta publicado por un autor individual, no por el equipo de Qwen; conviene validar la integridad de los pesos antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intragalactic-stranger/Qwen3-4B-Instruct-2507-W4A16-AWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio del proyecto Cortex: https://github.com/intragalactic-stranger/cortex
- Commit de origen de la cuantizacion: https://github.com/intragalactic-stranger/cortex/commit/d796b1bf555e37e64f8de57ca993e5a2c74bdcaa
- Dataset de calibracion: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Resultados completos: `serve/RESULTS.md` seccion M3 en el repositorio Cortex (no se dispone de URL directa en la informacion proporcionada)

# Interactify/Qwen3.8-27B-Slipstream

## Resumen

Qwen3.8-27B-Slipstream es una distribución de pesos del modelo denso Qwen3.8-27B (27 000 millones de parámetros, aproximadamente) empaquetada por Interactify para su propio motor de inferencia, Slipstream. No se trata de un fine-tuning ni de una variante de la arquitectura: el modelo base es el Qwen3.8-27B oficial de Alibaba, y lo que cambia es el formato de los pesos y el proceso de cuantización aplicado. Interactify ha generado sus propios pesos NVFP4 (punto flotante de 4 bits con escalas de bloque elegidas por minimización del error cuadrático medio) a partir de los pesos BF16 originales, añadiendo copias MXFP8 para la fase de prefill y conservando la cabeza MTP (multi-token prediction) del modelo.

La relevancia de esta publicación es fundamentalmente de infraestructura: demuestra un despliegue de un modelo de 27B en hardware de consumo profesional de gama alta, en concreto una o dos NVIDIA DGX Spark (GB10, 128 GB de memoria unificada cada una) conectadas por un enlace de 200 GbE. El motor Slipstream sirve el modelo con una API compatible con OpenAI y Anthropic en el puerto 8080, lo que facilita su integración en aplicaciones existentes.

El punto crítico para cualquier evaluador es que los pesos están en el formato propietario `weights.vbin` + `index.json` del motor Slipstream, no en safetensors ni GGUF, y solo funcionan con dicho motor, cuyo código no está publicado todavía ("engine code release coming soon"). La licencia es Apache 2.0, heredada del modelo base. El repositorio ocupa 88,1 GB e incluye tres directorios: pesos para un solo nodo (TP1) y pesos por rango para dos nodos (TP2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B), con cabeza MTP; cuantizacion NVFP4 para decode y MXFP8 para prefill |
| Parametros totales | 27 000 millones (aproximado, segun el nombre del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 262 144 tokens |
| Tipos de cuantizacion | NVFP4 (pesos, escalas de bloque elegidas por MSE), MXFP8 W8A8 (prefill); pesos BF16 originales como referencia |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Slipstream propietario (`weights.vbin` + `index.json` por directorio); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.8-27B de Alibaba, un transformer denso de aproximadamente 27 000 millones de parámetros. Interactify no ha reentrenado ni ajustado el modelo: la model card no documenta datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO, y toda esa información debe consultarse en la model card del modelo base. La contribución técnica de esta publicación se limita al pipeline de cuantización y empaquetado.

Las innovaciones destacables son tres. Primero, la cuantización NVFP4 con escalas de bloque seleccionadas mediante minimización del error cuadrático medio (MSE), en lugar de escalas derivadas de máximos absolutos, lo que según el autor produce un NLL solo un 1,0 % superior al BF16 en 512 tokens de texto en inglés, manteniendo la misma precisión top-1. Segundo, la inclusión de copias MXFP8 para la fase de prefill con activaciones de 8 bits (W8A8), que permite alcanzar 1541 tokens/s de prefill a 16k de contexto. Tercero, la conservación de la cabeza MTP del modelo base, que el motor explota para decodificación especulativa: la decodificación en un solo stream alcanza 119 tokens/s en salida estructurada, 71 en prosa, 93 en código y 103 en JSON, frente a 26 tokens/s en modo serie sin borradores.

El empaquetado se generó con los conversores de Slipstream en el commit `20c2dd9` (31 de octubre de 2026) y el modelo se ejecuta desde el build `build-q35` del motor.

## Capacidades

- Generación de texto en modo conversacional y completado, servida mediante API compatible con OpenAI y Anthropic.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.8-27B; la model card no detalla capacidades específicas más allá de la generación de texto.
- Generación de código, con rendimiento de decodificación medido específicamente en esta categoría (93 tokens/s).
- Salida estructurada: la model card reporta métricas separadas para JSON (103 tokens/s) y salida estructurada genérica (119 tokens/s), lo que indica soporte práctico para formatos restringidos.
- Decodificación especulativa mediante la cabeza MTP, que acelera la generación sin cambiar la distribución de salida.
- Contexto largo de hasta 262 144 tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, modo thinking, visión y audio: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en hardware DGX Spark: el caso de uso principal y explícito de esta publicación es ejecutar un modelo de 27B en una o dos estaciones DGX Spark (GB10, 128 GB) sin recurrir a GPUs de centro de datos. El repositorio incluye los directorios TP1 y TP2 ya preempaquetados, de modo que el arranque se reduce a descargar el directorio correcto y lanzar `server/slipstream.py serve qwen3.8-27b`.
- Sustitución de API en aplicaciones existentes: el servidor expone endpoints compatibles con OpenAI y Anthropic en el puerto 8080, lo que permite apuntar clientes y SDK ya escritos a la instancia local cambiando únicamente la URL base, útil para entornos con requisitos de soberanía del dato.
- Procesamiento de documentos largos: con 262 144 tokens de contexto, el modelo puede ingerir contratos, informes o bases de código extensas en una sola pasada; el prefill a 1541 tokens/s a 16k hace viable el procesamiento por lotes de documentos de tamaño medio.
- Generación de JSON y salidas estructuradas: los 103 tokens/s medidos en JSON y los 119 en salida estructurada lo hacen adecuado para pipelines de extracción de datos, rellenado de formularios o generación de respuestas para APIs internas donde el formato es crítico.
- Asistencia de código en local: con 93 tokens/s de decodificación en código y contexto largo, encaja en entornos de desarrollo con requisitos de confidencialidad donde no se puede enviar el código a un proveedor externo.
- Inferencia en clúster de dos nodos: el directorio TP2 con rangos separados (`tp2_r0`, `tp2_r1`) permite repartir el modelo entre dos Sparks mediante el enlace de 200 GbE, un patrón replicable para laboratorios que quieran escalar horizontalmente en lugar de comprar una GPU de 80 GB.
- Evaluación comparativa de cuantizaciones: el par NVFP4/MXFP8 con métricas de NLL y precisión top-1 publicadas sirve como referencia para equipos que estén decidiendo qué esquema de cuantización aplicar a modelos densos de ~27B.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones internas del motor Slipstream sobre esta distribución, no resultados de benchmarks académicos:

| Metrica | Valor |
|---|---|
| Decodificacion, un stream, salida estructurada (con borradores MTP) | 119 tokens/s |
| Decodificacion, un stream, prosa (con borradores MTP) | 71 tokens/s |
| Decodificacion, un stream, codigo (con borradores MTP) | 93 tokens/s |
| Decodificacion, un stream, JSON (con borradores MTP) | 103 tokens/s |
| Decodificacion en modo serie (sin MTP) | 26 tokens/s |
| Prefill (MXFP8 W8A8) a 16k de contexto | 1541 tokens/s |
| Calidad: NLL frente a BF16 (512 tokens de texto en ingles) | +1,0 % |
| Calidad: precision top-1 frente a BF16 | Identica |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- Hardware de referencia: una NVIDIA DGX Spark (GB10, 128 GB de memoria unificada) para TP1, o dos conectadas por su enlace de 200 GbE para TP2.
- VRAM estimada: el repositorio completo ocupa 88,1 GB, pero cada nodo solo descarga su directorio correspondiente; la memoria necesaria por nodo no se detalla en la model card. El formato NVFP4 de 4 bits sitúa el peso teórico del modelo en torno a 13,5 GB, aunque el empaquetado y las copias MXFP8 para prefill incrementan el requisito real.
- GPU recomendadas: DGX Spark (GB10) es el único hardware validado explícitamente. No hay información sobre funcionamiento en A100, H100, RTX 4090 u otras GPU.
- Cabe en GPU de consumo: no confirmado. El formato NVFP4 y la dependencia del motor Slipstream impiden asumir compatibilidad con GPUs consumer convencionales; no hay datos al respecto.
- Opciones de despliegue: exclusivamente el motor Slipstream (`python server/slipstream.py serve qwen3.8-27b`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers, porque los pesos no están en safetensors ni GGUF.
- Latencia y throughput: ver la tabla de benchmarks; las cifras corresponden a decodificación en un stream y prefill a 16k, sin datos de concurrencia ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Slipstream (esta ficha) | ~27B denso | 262 144 | Slipstream `weights.vbin` | Apache 2.0 | Pesos publicados; motor aun no publicado |
| Qwen/Qwen3.8-27B (modelo base) | ~27B denso | No disponible en esta informacion | Safetensors BF16 | Apache 2.0 | Publico en Hugging Face |
| Otras alternativas de ~27B denso | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es con el modelo base: esta distribución ofrece el mismo modelo con cuantización NVFP4 y aceleración MTP, a costa de perder portabilidad (no carga en otros runtimes) y de depender de un motor cuyo código no se ha liberado. No se dispone de información sobre modelos de terceros comparables en esta categoría para establecer una comparativa con datos verificables.

## Limitaciones y advertencias

- Dependencia total del motor Slipstream: los pesos no son safetensors ni GGUF y no cargan en transformers, vLLM, llama.cpp, Ollama ni TGI. Sin el motor, los 88,1 GB del repositorio son inutilizables.
- El código del motor no está publicado: la model card indica "engine code release coming soon", de modo que en la fecha de creación (31 de octubre de 2026) no es posible reproducir el despliegue sin acceso previo al repositorio de Interactify.
- Hardware muy específico: las cifras de rendimiento se han medido en DGX Spark (GB10) con enlace de 200 GbE; no hay datos de comportamiento en otras GPUs ni estimaciones de escalado.
- Idiomas no documentados: la model card no especifica qué idiomas soporta; debe consultarse la del modelo base antes de usarlo en producción multilingüe.
- Calidad medida de forma limitada: la evaluación de la cuantización se reduce a NLL sobre 512 tokens de texto en inglés y precisión top-1, una muestra pequeña que no cubre razonamiento, código ni contextos largos.
- Riesgo de alucinación y sesgos: no documentados en esta publicación; son los heredados del modelo base y deben evaluarse por separado.
- Sin métricas de concurrencia: los tokens/s publicados corresponden a un solo stream; no hay datos de throughput agregado, latencia p99 ni comportamiento bajo carga, imprescindibles para dimensionar producción.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse el fichero `NOTICE` del repositorio por si incorpora atribuciones adicionales del modelo base.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evidencia externa de funcionamiento más allá de la model card del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Interactify/Qwen3.8-27B-Slipstream
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor Slipstream (GitHub): https://github.com/Interactify/slipstream

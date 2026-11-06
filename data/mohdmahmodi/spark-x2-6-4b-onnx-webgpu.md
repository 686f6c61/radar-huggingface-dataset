# mohdmahmodi/Spark-X2.6-4B-ONNX-WebGPU

## Resumen

Spark-X2.6-4B-ONNX-WebGPU es una conversión a formato ONNX del modelo XHToken/Spark-X2.6-4B (4.000 millones de parámetros, arquitectura basada en Qwen3), diseñada específicamente para inferencia en el navegador mediante onnxruntime-web sobre WebGPU. El autor de la conversión es mohdmahmodi, que ha repackeado los pesos INT4 oficiales de XHToken sin pérdida de precisión medible respecto al checkpoint oficial. El problema que resuelve es claro: permitir ejecutar un LLM conversacional de 4B directamente en el navegador del usuario, sin servidor ni GPU dedicada en el lado del servicio, aprovechando la GPU local vía WebGPU.

Es relevante porque demuestra que los modelos de 4B cuantizados a 4 bits pueden ejecutarse a velocidades prácticas (unos 90 tokens/segundo con prompt corto en un RTX 3090 Ti) dentro de un navegador, con validación rigurosa de precisión frente al original en transformers. El modelo base soporta inglés y chino, tiene modo de razonamiento ("thinking") y soporta function calling. La licencia es Apache-2.0, tanto del modelo base como de esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3), con GroupQueryAttention, sliding window de 512 en 27 de 36 capas y rotary embedding por tipo de capa |
| Parametros totales | 4.000 millones (modelo base XHToken/Spark-X2.6-4B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | Validado hasta 16k tokens; valor maximo oficial no disponible |
| Tipos de cuantizacion | INT4 (GPTQ, group size 32) con activaciones fp16 (q4f16) o fp32 (q4); proyecciones out_proj, g_proj y LM head en 8 bits |
| Idiomas soportados | Ingles y chino |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (MatMulNBits 4-bit), con datos externos divididos en ficheros de menos de 1,9 GB para descarga en navegador |

## Arquitectura y entrenamiento

El modelo base Spark-X2.6-4B es un transformer de 36 capas con vocabulario de 131.072 tokens, cuya configuracion original se ha ajustado en esta conversion para declarar `model_type: qwen3` y permitir su carga en Transformers.js. El grafo ONNX incorpora varias optimizaciones notables: atencion agrupada por consultas (GroupQueryAttention) fusionada, con ventana deslizante de 512 tokens en 27 de las 36 capas y rotary embedding parcial por tipo de capa; normalizacion simplificada (SkipSimplifiedLayerNormalization); y cuantizacion 4-bit MatMulNBits con group size 32 tomada directamente del checkpoint GPTQ oficial. Las proyecciones de salida, la puerta de atencion (g_proj) y la LM head estan en 8 bits; ademas, la tabla de embeddings de entrada comparte la tabla int8 de la LM head, un intercambio validado como practicamente sin perdida (KL media de 0,0003 respecto a bf16).

No hay datos publicados sobre el corpus de entrenamiento del modelo base (numero de tokens, composicion del dataset ni uso de RLHF/DPO) en la informacion disponible. La innovacion principal de esta ficha no es el entrenamiento sino la ingenieria de despliegue: KV cache estatica en GPU con binding in-place de past/present, datos externos fragmentados para el navegador y un PR fusionado en onnxruntime (microsoft/onnxruntime#33760) que habilita esta configuracion.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con chat template oficial incluido en el tokenizer
- Modo de razonamiento ("thinking") configurable, con niveles de esfuerzo (los benchmarks oficiales se miden con thinking activado a esfuerzo alto)
- Function calling: 89,5% en BFCL v3 simple function calling (200 casos)
- Razonamiento matematico: 90,8% en GSM8K (con thinking desactivado, modelo bf16)
- Recuperacion de informacion en contexto largo: 12/12 casos en needle in a haystack de 1k a 16k tokens
- Ejecucion completamente en el navegador via WebGPU (onnxruntime-web) o en CPU nativa via onnxruntime
- Compatibilidad directa con Transformers.js 4.3 (pipeline de text-generation con device "webgpu" y dtype "q4f16")
- No hay indicios de capacidades de vision ni audio en la informacion disponible

## Casos de uso

- Chatbots que respetan la privacidad: al ejecutarse integramente en el navegador, los datos del usuario nunca salen del dispositivo, ideal para asistentes que procesan informacion sensible (salud, legal, RRHH internos)
- Demos y prototipos sin backend: un Space de Hugging Face o una pagina web estatica puede servir el modelo completo, eliminando costes de inferencia en servidor y simplificando el despliegue
- Function calling en aplicaciones web: con un 89,5% en BFCL v3 simple, puede integrarse como agente ligero que invoca herramientas del lado del cliente (consultas a APIs locales, manipulacion del DOM, automatizacion del navegador)
- Resolucion de problemas de matematicas y razonamiento paso a paso en herramientas educativas offline, aprovechando el modo thinking y el 90,5% en GSM8K de esta build
- Aplicaciones offline-first (PWAs): los pesos se cachean en el navegador en fragmentos de menos de 1,9 GB, permitiendo uso sin conexion tras la primera carga
- Analisis y resumen de documentos largos en el cliente: la validacion de needle in a haystack hasta 16k tokens lo hace viable para busqueda de informacion en textos pegados en el prompt
- Soporte bilingue ingles-chino en productos web dirigidos a ambos mercados sin desplegar infraestructura de inferencia
- Validacion y benchmarking de cuantizaciones ONNX en navegador: el metodo de validacion publicado (KL divergence, parity greedy, McNemar) sirve de plantilla para auditar otras conversiones

## Benchmarks y rendimiento

Precision de esta build ONNX, medida en Chrome sobre WebGPU frente al modelo original en transformers, con prompts, chat template y decodificacion greedy identicos:

| Check | transformers bf16 | transformers, INT4 oficial | Esta build |
|---|---|---|---|
| GSM8K, 1.319 problemas, thinking off | 90,8% | 91,2% | 90,5% |
| BFCL v3 simple function calling, 200 casos | 89,0% | 89,5% | 89,5% |
| Needle in a haystack, 1k-16k tokens, 12 casos | 12/12 | 12/12 | 12/12 |
| Divergencia KL del siguiente token vs bf16, 160 posiciones | 0 | 0,0236 | 0,0238 |
| Paridad greedy, 50 prompts: primer token identico | 50/50 | 47/50 | 46/50 |

En GSM8K, las diferencias frente a la ejecucion INT4 oficial (22 y 13 desacuerdos, McNemar p = 0,18) estan dentro del ruido estadistico. Las puntuaciones se miden con thinking desactivado y no son comparables con resultados con thinking activado. XHToken publica ademas resultados del modelo base contra modelos de tamano similar en 30 benchmarks (con thinking a esfuerzo alto), pero los valores numericos concretos no estan disponibles en la informacion proporcionada.

Velocidad (Chrome, Windows 11, NVIDIA RTX 3090 Ti):

| Metrica | Valor |
|---|---|
| Throughput, prompt corto | ~90 tokens/segundo |
| Throughput, 16k tokens de contexto | ~69 tokens/segundo |
| Latencia del primer token, prompt corto | 92 ms |
| Latencia del primer token, 16k de contexto | 15 s |

## Requisitos de hardware

- VRAM estimada para inferencia: 2,77 GB de pesos en variante q4f16 (mas la KV cache) o 3,05 GB en q4; en la practica, una GPU con 4 GB o mas de VRAM deberia ser suficiente para contextos cortos
- GPU de referencia en las mediciones: NVIDIA RTX 3090 Ti (Windows 11, Chrome); el rendimiento depende de la GPU del usuario
- Compatibilidad con GPUs de consumo: si, es uno de sus objetivos principales; cualquier GPU con soporte WebGPU sirve (NVIDIA, AMD, Intel Arc). Para GPUs sin la extension `shader-f16` existe la variante q4 con activaciones fp32
- Alternativa sin GPU dedicada: ejecucion nativa en CPU mediante onnxruntime (rendimiento no disponible)
- Opciones de despliegue: onnxruntime-web 1.31.0-dev.20260918-bc8e7ed75 o superior (import desde `onnxruntime-web/webgpu`), Transformers.js 4.3, onnxruntime nativo en CPU; no hay indicacion de soporte para vLLM, llama.cpp, Ollama o TGI, ya que el formato es ONNX y no GGUF
- Requisito de red en primera carga: descarga de 2,77-3,05 GB en fragmentos de menos de 1,9 GB (cacheables por el navegador)

## Comparativa con modelos similares

| Modelo | Parametros | Formato/entorno | Contexto validado | Licencia | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-ONNX-WebGPU (esta ficha) | 4B | ONNX INT4, navegador (WebGPU) | 16k (validado) | Apache-2.0 | 90 tok/s en RTX 3090 Ti; validacion de precision publicada |
| XHToken/Spark-X2.6-4B (base) | 4B | bf16 / INT4 GPTQ, transformers | no disponible | Apache-2.0 | Referencia de precision; requiere servidor o GPU local con Python |
| Qwen3-4B (familia de referencia de la arquitectura) | 4B | safetensors, GGUF, ONNX | hasta 32k+ segun variante | Apache-2.0 | Amplio ecosistema, pero la ruta WebGPU/Transformers.js requiere conversion manual |

No hay datos de benchmarks comparativos directos con otros modelos de 4B en la informacion disponible, salvo las imagenes de calidad publicadas por XHToken (no cuantificadas en el texto).

## Limitaciones y advertencias

- La latencia del primer token se degrada fuertemente con contexto largo: 15 segundos con 16k tokens de prefill, lo que puede resultar inaceptable para interacciones en tiempo real con documentos extensos
- El rendimiento depende criticamente de la GPU del cliente: usuarios con GPUs integradas o sin soporte WebGPU experimentaran velocidades muy inferiores a los 90 tokens/segundo medidos
- Requiere un navegador con WebGPU (Chrome moderno) y, para la variante q4f16, soporte de `shader-f16`; en caso contrario hay que usar la variante q4, un 10% mas pesada
- Primera carga de casi 3 GB, lo que penaliza la experiencia inicial en conexiones lentas
- Idiomas limitados a ingles y chino; el rendimiento en espanol u otras lenguas no esta documentado
- La longitud de contexto maxima oficial del modelo base no consta en la documentacion de esta conversion; solo hay validacion hasta 16k tokens
- Los benchmarks de esta build se midieron con thinking desactivado; activar el modo thinking consume tokens adicionales y modificara latencia y consumo de contexto
- Existe el riesgo habitual de alucinacion en LLMs de 4B; no se publican evaluaciones especificas de veracidad en la informacion disponible
- No hay datos sobre sesgos del modelo base en la documentacion proporcionada
- La version de onnxruntime-web requerida es una build de desarrollo (1.31.0-dev), lo que puede implicar inestabilidad de API en produccion
- La licencia Apache-2.0 permite uso comercial sin restricciones destacables, tanto del modelo base como de la conversion

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/mohdmahmodi/Spark-X2.6-4B-ONNX-WebGPU
- Demo en el navegador (Hugging Face Space): https://huggingface.co/spaces/mohdmahmodi/Spark-X2.6-WebGPU
- Codigo fuente e informe de validacion en GitHub: https://github.com/mohdmahmodi/Spark-X2.6-4B-onnx-webgpu
- Informe de validacion detallado: https://github.com/mohdmahmodi/Spark-X2.6-4B-onnx-webgpu/blob/main/docs/VALIDATION.md
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Checkpoint INT4 oficial: https://huggingface.co/XHToken/Spark-X2.6-4B-INT4
- PR fusionado en onnxruntime: https://github.com/microsoft/onnxruntime/pull/33760
- Documentacion de onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0

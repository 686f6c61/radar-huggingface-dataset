# infosave/humanizer-cmf

## Resumen

humanizer-cmf es un paquete de cuantizacion del modelo humanizer 12B, un fine-tune de Gemma 4 12B de Google desarrollado por jialinyyzz. El modelo resuelve un problema concreto: reescribir borradores generados por IA (correos, ensayos, informes, publicaciones de foro) para que suenen a escritura humana, preservando de forma estricta numeros, unidades, fechas, nombres y citas. Este repositorio, publicado por infosave, empaqueta el modelo de texto en ficheros CMF unicos para cortiq, un motor de inferencia escrito en Rust que no depende de Python ni de frameworks de ML.

La relevancia del paquete reside en su enfoque de despliegue: soporta GPUs NVIDIA mediante CUDA o Vulkan, GPUs AMD e Intel mediante Vulkan/DX12, Apple Silicon mediante Metal y CPU pura. El modelo base es un fine-tune de Gemma 4 12B, con soporte para ingles y chino, y se distribuye bajo licencia Apache 2.0. El repositorio acumula 1444 descargas y ocupa 39.7 GB.

La propuesta de valor es la combinacion de un modelo especializado en reescritura con preservacion factual y un runtime nativo de bajo nivel que elimina la capa de Python, lo que facilita el despliegue en entornos de produccion con requisitos de latencia y portabilidad estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Gemma 4 12B) |
| Parametros totales | 12B (segun denominacion del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (q8_2f); 4-bit FFN con atencion y embeddings en 8-bit (q4tp-ffn) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | CMF (formato propio de cortiq) |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tune de Gemma 4 12B, un transformer denso de 12 mil millones de parametros. El fine-tune esta orientado a una tarea de reescritura de texto con preservacion factual: el modelo recibe un borrador y produce una version reescrita que mantiene cada numero, unidad, fecha, nombre y cita. El modelo es de completado de texto, no de chat: cada fichero CMF incorpora la plantilla de prompt del autor, que construye la instruccion, una linea en blanco, el borrador sin espacios circundantes y el marcador `### Rewritten:`. La generacion termina en el token de fin de secuencia.

El repositorio de infosave no aporta detalles sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si hubo RLHF o DPO; esa informacion no esta disponible en la documentacion proporcionada. La innovacion tecnica destacable esta en el empaquetado: los ficheros CMF son formatos unicos optimizados para cortiq, un motor en Rust que soporta CUDA, Vulkan, DX12, Metal y CPU sin dependencias de Python. Se ofrecen dos variantes cuantizadas con metricas de fidelidad respecto a los pesos bf16 originales: `q8_2f` alcanza un 99.4 % de coincidencia top-1, KL de 0.0008 y perplejidad de 2.1174 (bf16: 2.1168); `q4tp-ffn` alcanza un 95.5 % top-1, KL de 0.020 y perplejidad de 2.1555.

## Capacidades

- Reescritura de texto para que suene humano, en ingles y chino.
- Preservacion estricta de numeros, unidades, fechas, nombres y citas durante la reescritura.
- Generacion de texto de completado (no conversacional): una reescritura por peticion.
- Procesamiento de borradores de correos, ensayos, informes y publicaciones de foro.
- No soporta tool calling ni function calling (no documentado).
- No soporta modo agente ni razonamiento multi-paso (no documentado).
- No soporta vision ni audio (modelo de texto).
- No soporta conversaciones multi-turno: los mensajes de sistema y turnos previos se ignoran.

## Casos de uso

- Reescritura de correos profesionales: el modelo toma un borrador generado por IA y lo reformula para que suene natural, manteniendo cifras, fechas y nombres intactos, lo que resulta adecuado para comunicaciones comerciales donde la precision factual es critica.
- Humanizacion de ensayos y articulos: permite a editores y creadores de contenido pasar borradores por el modelo para reducir la deteccion de texto generado por IA, con la garantia de que los datos citados no se alteran.
- Generacion de informes internos: en flujos donde se redactan informes con IA y se requiere un tono humano antes de su distribucion, el modelo reescribe el borrador preservando todas las metricas y referencias.
- Publicaciones en foros y comunidades: util para adaptar respuestas generadas automaticamente a un registro mas cercano al de un usuario humano, en ingles o chino.
- Despliegue en entornos sin Python: gracias a cortiq, el modelo puede integrarse en pipelines de produccion en Rust sobre GPUs NVIDIA, AMD, Intel, Apple Silicon o CPU, sin necesidad de instalar frameworks de ML.
- Procesamiento por lotes en estaciones de trabajo con GPU de 12 GB: la variante `q4tp-ffn` (7.89 GB) permite ejecutar reescrituras en GPUs de gama media con un rendimiento de 41.6 tokens/s en una RTX PRO 4000.
- Aplicaciones de escritorio locales: el modelo base dispone de una app de escritorio para Mac y Windows, y el paquete CMF permite integrar la reescritura en herramientas locales sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos aportados por el autor son metricas de fidelidad de cuantizacion y de rendimiento de inferencia:

| Metrica | q8_2f | q4tp-ffn |
|---|---|---|
| Coincidencia top-1 vs bf16 | 99.4 % | 95.5 % |
| Divergencia KL vs bf16 | 0.0008 | 0.020 |
| Perplejidad | 2.1174 | 2.1555 |
| Tamano | 11.97 GB | 7.89 GB |
| Memoria GPU pico | 15.3 GB | 10.3 GB |

Rendimiento de decodificacion (cortiq bench, una secuencia):

| Hardware | Backend | Fichero | Decode (tok/s) | Prompt 1k (tok/s) | TTFT |
|---|---|---|---:|---:|---:|
| RTX PRO 4000 Blackwell (24 GB) | Vulkan | q4tp-ffn | 41.6 | 430 | 2.3 s |
| RTX PRO 4000 Blackwell (24 GB) | Vulkan | q8_2f | 31.7 | 393 | 2.6 s |
| Mac mini M4 (24 GB) | Metal | q8_2f | 6.6 | 68 | 14.7 s |
| Mac mini M4 (24 GB) | Metal | q4tp-ffn | 8.5 | 72 | 14.0 s |
| Mac mini M4 (24 GB) | CPU | q8_2f | 4.7 | no disponible | no disponible |
| Mac mini M4 (24 GB) | CPU | q4tp-ffn | 4.6 | no disponible | no disponible |
| RTX A5000 (24 GB) | CUDA | q4tp-ffn | 48.1–48.6 | 958 (prompt 4096) | 4.3 s |
| RTX A5000 (24 GB) | Vulkan | q4tp-ffn | 43.2 | 654 (prompt 4096) | no disponible |

El autor reporta ademas que Originality.ai en su configuracion mas estricta juzgo como humana el 95 % de 210 reescrituras en ingles, y que un juez LLM estricto no encontro problemas factuales en 376 de 420 reescrituras en ingles. Estas mediciones corresponden a los ficheros del autor original, no a los ficheros CMF.

## Requisitos de hardware

- VRAM estimada: 15.3 GB para `q8_2f` y 10.3 GB para `q4tp-ffn` (memoria GPU pico medida con prompt de 1000 tokens en una RTX PRO 4000).
- GPU recomendadas: RTX PRO 4000 Blackwell (24 GB), RTX A5000 (24 GB), GPUs con 16 GB o mas para `q8_2f` y GPUs con 12 GB para `q4tp-ffn`.
- Cabe en GPU de consumo: si, en GPUs con 12 GB o mas usando `q4tp-ffn`; en GPUs de 16 GB o mas con `q8_2f`.
- Apple Silicon: ambos ficheros funcionan en un Mac mini M4 de 24 GB mediante Metal o CPU.
- Opciones de despliegue: cortiq (requiere version 0.8.16 o posterior), con binarios precompilados para Linux, macOS y Windows; soporta CUDA, Vulkan, DX12, Metal y CPU. No se mencionan otros runtimes (vLLM, llama.cpp, Ollama, TGI) para los ficheros CMF.
- Latencia y throughput: 41.6 tok/s (q4tp-ffn) y 31.7 tok/s (q8_2f) en RTX PRO 4000; 48.1–48.6 tok/s en RTX A5000 con CUDA; 8.5 tok/s en Mac mini M4 con Metal. Una reescritura completa de un borrador de 957 tokens tarda 28.9 s (q4tp-ffn) o 36.4 s (q8_2f) en RTX PRO 4000.
- Nota: `cortiq run` carga los pesos en GPU en cada arranque (primer token tras unos 4 s en RTX PRO 4000); para procesar varios borradores conviene mantener `cortiq serve` en ejecucion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandar ni de modelos comparables documentados en la informacion proporcionada. El modelo base (humanizer de jialinyyzz) dispone de ficheros GGUF para llama.cpp y una app de escritorio, pero no se aportan metricas comparativas frente a otros modelos de reescritura.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| humanizer-cmf (este) | 12B | no disponible | en, zh | apache-2.0 | CMF |
| humanizer (base) | 12B | no disponible | en, zh | apache-2.0 | safetensors, GGUF |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de completado de texto, no de chat: no admite mensajes de sistema ni turnos previos; se ignora todo lo que no sea el borrador.
- Una reescritura por peticion; no esta disenado para conversaciones multi-turno.
- Solo soporta ingles y chino; no hay soporte documentado de otros idiomas.
- No se documentan capacidades de tool calling, agentes, vision ni audio.
- Riesgo de alucinacion: aunque el modelo esta entrenado para preservar numeros, unidades, fechas, nombres y citas, en la variante `q4tp-ffn` se observo una alteracion de formato en una prueba ("$186,000" reescrito como "$186k"), lo que indica que la cuantizacion agresiva puede afectar a la fidelidad factual.
- La licencia Apache 2.0 permite uso comercial, pero se desconoce si el modelo base Gemma 4 12B impone restricciones adicionales que pudieran prevalecer.
- No se debe anadir cadenas de parada, especialmente `"###"`, porque la generacion termina en el token de fin de secuencia.
- El rendimiento en CPU es bajo (4.6–4.7 tok/s en Mac mini M4), lo que limita su uso en produccion sin GPU.
- La informacion sobre el dataset de entrenamiento, el contexto maximo y los sesgos conocidos no esta disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/humanizer-cmf
- Modelo base: https://huggingface.co/jialinyyzz/humanizer
- Evaluacion del autor: https://huggingface.co/jialinyyzz/humanizer#evaluation-details
- Ficheros GGUF para llama.cpp: https://huggingface.co/jialinyyzz/humanizer-GGUF
- App de escritorio para Mac y Windows: https://github.com/sgaofen/humanizer-local-model/releases/latest
- Codigo y documentacion: https://github.com/sgaofen/humanizer-local-model
- Motor cortiq (CMF): https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
- Gemma 4 12B: https://huggingface.co/google/gemma-4-12B

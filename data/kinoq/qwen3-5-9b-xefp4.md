# KINOQ/Qwen3.5-9B-XeFP4

## Resumen

Qwen3.5-9B-XeFP4 es una cuantizacion a 4 bits del modelo Qwen/Qwen3.5-9B (familia Qwen, desarrollada por el equipo Qwen de Alibaba Cloud), publicada por el usuario KINOQ. El problema que resuelve es concreto: permitir ejecutar un modelo de 9.000 millones de parametros en GPUs Intel Arc mediante un formato de pesos abierto de 4 bits llamado XeFP4, que no es compatible con transformers, llama.cpp ni vLLM, sino que requiere un runtime propio basado en OpenCL denominado XeQ Runtime.

El repositorio ocupa 5,2 GB e incluye el modelo principal en un unico fichero binario, una cabeza MTP (multi-token prediction) opcional para decodificacion especulativa, el vocabulario auxiliar para esa cabeza y los ficheros de tokenizer heredados del modelo base. La licencia es Apache-2.0, heredada del modelo original, y el formato de pesos no es safetensors ni GGUF: son ficheros `.bin` con cabecera `.json` y hash SHA-256 reproducible entre distintas GPUs Arc.

Es relevante ahora porque demuestra una via alternativa de inferencia de 4 bits especifica para hardware Intel, con velocidades de decodificacion notablemente superiores a las de llama.cpp con cuantizaciones GGUF de tamano similar en la misma GPU (65,7 tok/s frente a 37,9 tok/s con Q4_K_M en una Arc A770), a costa de una perdida de precision algo mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-9B (no se detalla en la informacion disponible); incluye cabeza MTP para decodificacion especulativa |
| Parametros totales | 9.000 millones (segun el nombre del modelo base; no se detalla el desglose) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en el servidor de ejemplo (`--ctx 32768`); contexto maximo del modelo base no disponible |
| Tipos de cuantizacion | XeFP4-8 (E2M1, bloque 32, factor de bloque de 3 bits, escala de fila FP16, 4,097 bits/peso); lm_head en INT8 con escala FP32 por fila; normas, gates, conv, A_log y dt_bias en FP32 |
| Idiomas soportados | no disponible (la model card no lista idiomas; los benchmarks de contexto largo usan texto en coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.bin` propietario XeFP4 con cabecera `.json`; requiere XeQ Runtime (no compatible con safetensors, GGUF, transformers, llama.cpp ni vLLM) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del Qwen3.5-9B original, no un modelo entrenado desde cero. La model card no describe la arquitectura interna del modelo base (numero de capas, dimension oculta, tipo de atencion), por lo que esos datos no estan disponibles. Lo que si se detalla es el esquema de cuantizacion: todas las capas lineales y el embedding usan XeFP4-8, un formato de 4 bits con valores E2M1, bloque de 32 elementos, factor de bloque de 3 bits y escala de fila FP16, lo que resulta en 4,097 bits por peso. El lm_head se mantiene en INT8 con escala FP32 por fila, y los elementos sensibles a precision (normas, gates, convoluciones, A_log, dt_bias) se conservan en FP32.

El codificador es determinista y no requiere datos de calibracion, y los ficheros binarios son reproducibles: convertir en una Arc 140T produce exactamente los mismos bytes que en una A770. Ademas del modelo principal, el repositorio incluye una cabeza MTP (multi-token prediction) de 124,7 MB que habilita decodificacion especulativa; segun el autor, con MTP activado la salida es identica a la decodificacion greedy sin MTP en todas las longitudes de contexto probadas. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno, con plantilla de chat incluida (`chat_template.jinja`).
- Modo thinking (`--think`), heredado del modelo base, con recomendaciones de muestreo especificas para ese modo.
- Generacion de codigo: evaluado en HumanEval-C++ con 161 problemas y reintentos guiados por errores de compilador o de test.
- Traduccion y tareas factuales, favorecidas por la decodificacion greedy por defecto.
- Tool calling: la model card menciona que la decodificacion greedy es la mejor opcion para "tool calls", aunque no detalla el esquema de function calling.
- Decodificacion especulativa mediante cabeza MTP, con tasa de aceptacion de 0,91 en el benchmark publicado.
- Capacidades multilingues: no disponibles como lista; los benchmarks de contexto largo se midieron sobre prosa en coreano.
- Vision: no incluida. El codificador de vision del modelo base queda fuera de esta cuantizacion; el repositorio contiene solo el modelo de texto.

## Casos de uso

- Inferencia local en GPUs Intel Arc: el caso principal. Un equipo con Arc A770 de 16 GB puede servir el modelo a 65,7 tok/s en greedy, suficiente para asistentes interactivos en estacion de trabajo sin depender de CUDA.
- Servidor HTTP de generacion de texto: `python -m xeq serve <repo> --port 8080 --ctx 32768` expone el modelo como servicio con contexto de 32K, util para prototipos internos de chat o resumen de documentos largos.
- Generacion de codigo C++ en pipelines: con 126/161 en HumanEval-C++ al primer intento y 136/161 tras reintentos con feedback del compilador, encaja en tareas de autocompletado o generacion de funciones con validacion automatica.
- Procesamiento de documentos largos en coreano u otros idiomas: el modelo mantiene 62,7 tok/s con MTP a 32K de contexto en una A770, adecuado para resumen o extraccion sobre textos extensos en una sola pasada.
- Evaluacion y benchmarking de hardware Intel: al ser reproducible byte a byte entre Arc 140T y A770, sirve como referencia para medir rendimiento de iGPU frente a GPU dedicada (13,8 frente a 65,7 tok/s en decodificacion sin MTP).
- Despliegue en iGPU de portatiles Core Ultra: con la Arc 140T integrada alcanza 23,0 tok/s con MTP en prompts cortos, viable para asistentes locales de baja latencia sin GPU dedicada.
- Traduccion y tareas de hechos verificables: la decodificacion greedy por defecto garantiza salida determinista, lo que simplifica la validacion y las pruebas de regresion.

## Benchmarks y rendimiento

Rendimiento en Intel Arc A770 16 GB (driver 32.0.101.9150), batch 1, decodificacion greedy, benchmark con script del 17 de noviembre de 2026:

| Configuracion | decode tok/s | prefill tok/s |
|---|---|---|
| XeFP4, MTP off | 65,7 | 2.499 (2K tokens) |
| XeFP4, MTP on (aceptacion 0,91) | 94,2 | no disponible |
| llama.cpp b11053 SYCL, Q4_K_M (6,2 GB) | 37,9 | 836 (512) |
| llama.cpp b11053 SYCL, IQ4_XS (5,5 GB) | 35,5 | 834 (512) |
| OpenVINO 2026.4.1 GenAI INT4, MTP off / on | 46,0 / 56,7 | 2.448 |

Contexto largo (texto en coreano):

| Contexto | prefill tok/s | decode MTP off | decode MTP on |
|---|---|---|---|
| 2K | 2.499 | 63,6 | 86,2 |
| 8K | 2.362 | 56,5 | 84,8 |
| 16K | 2.107 | 49,7 | 76,0 |
| 32K | 1.738 | 39,7 | 62,7 |

En Arc 140T (Xe-LPG+, iGPU de Core Ultra, driver 32.0.101.9033): 13,8 tok/s en decodificacion sin MTP y 23,0 tok/s con MTP en prompt corto; 7,1 tok/s a 32K sin MTP; prefill de 2K tokens en 2,9 s (unos 700 tok/s) y de 16K en 30 s.

Precision, perplejidad sobre 16 documentos FineWeb de 512 tokens (menor es mejor):

| BF16 | XeFP4 (este modelo) | GGUF Q4_K_M | GGUF IQ4_XS |
|---|---|---|---|
| 11,164 | 11,682 (+4,6%) | 11,267 (+0,9%) | 11,341 (+1,6%) |

HumanEval-C++ (161 problemas, greedy, hasta 1.024 tokens nuevos y hasta 2 reintentos con error de compilador o de test):

| Configuracion | Primer intento | Tras reintentos |
|---|---|---|
| Pesos INT8 (referencia, mismos prompts) | 134/161 | 143/161 |
| XeFP4 (este modelo), MTP on | 126/161 | 136/161 |

En los mismos problemas, 11 pasaron solo con INT8 y 3 solo con XeFP4 (primer intento, McNemar exacto p = 0,057), medido en Arc 140T.

## Requisitos de hardware

- VRAM estimada: el modelo principal ocupa 5.086.524.416 bytes (unos 4,7 GiB) y la cabeza MTP 124.672.000 bytes (unos 119 MiB); con el tokenizer y el vocabulario auxiliar el repositorio total es de 5,2 GB. La VRAM adicional depende del contexto (hasta 32K tokens) y del runtime.
- GPU probadas: Intel Arc A770 16 GB (Xe-HPG) y Arc 140T (Xe-LPG+, iGPU de Core Ultra). Otras GPUs Intel no estan probadas.
- GPU recomendada: Arc A770 para maximo rendimiento (65,7 tok/s sin MTP, 94,2 tok/s con MTP); Arc 140T para despliegue en iGPU (13,8 / 23,0 tok/s).
- No hay soporte documentado para GPUs NVIDIA o AMD: el runtime XeQ esta construido sobre OpenCL para Xe y el formato XeFP4 es especifico de esa familia.
- Opciones de despliegue: exclusivamente XeQ Runtime (repositorio `kinoqdev/XeFP4`), con comandos `selftest`, `run` y `serve`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver la tabla de benchmarks; el prefill cae de 2.499 tok/s a 2K hasta 1.738 tok/s a 32K en A770, y la decodificacion con MTP de 86,2 a 62,7 tok/s en el mismo rango.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Rendimiento en Arc A770 |
|---|---|---|---|---|---|
| Qwen3.5-9B-XeFP4 | 9B | 32K (configurado) | XeFP4 / XeQ Runtime | Apache-2.0 | 65,7 tok/s (MTP off), 94,2 (MTP on) |
| Qwen3.5-9B en GGUF Q4_K_M | 9B | no disponible | GGUF / llama.cpp SYCL | Apache-2.0 | 37,9 tok/s |
| Qwen3.5-9B en GGUF IQ4_XS | 9B | no disponible | GGUF / llama.cpp SYCL | Apache-2.0 | 35,5 tok/s |
| Qwen3.5-9B en OpenVINO INT4 | 9B | no disponible | OpenVINO IR / GenAI | Apache-2.0 | 46,0 tok/s (MTP off), 56,7 (MTP on) |

La comparativa se limita a distintas cuantizaciones del mismo modelo base, ya que la model card no ofrece comparaciones con otros modelos de 9B. En precision, XeFP4 pierde mas que las cuantizaciones GGUF calibradas de tamano similar (+4,6% de perplejidad frente a +0,9% y +1,6%), pero compensa con mayor velocidad de decodificacion y prefill en el mismo hardware.

## Limitaciones y advertencias

- Compatibilidad muy restringida: los ficheros no cargan en transformers, llama.cpp ni vLLM; solo funcionan con XeQ Runtime sobre OpenCL en GPUs Intel Arc.
- Solo probado en Arc A770 y Arc 140T; el resto de GPUs Intel queda sin validar.
- Solo texto: el codificador de vision del modelo base no esta incluido.
- Batch size 1: no hay soporte documentado para inferencia por lotes, lo que limita el throughput agregado en servidores.
- Perdida de precision superior a las cuantizaciones GGUF calibradas: +4,6% de perplejidad frente a +0,9% de Q4_K_M, y 126/161 frente a 134/161 en HumanEval-C++ al primer intento respecto a INT8.
- Diferencias numericas entre prefill y decodificacion token a token: la salida greedy puede variar en posiciones casi empatadas.
- La aceleracion con MTP depende del texto (tasa de aceptacion variable) y se reduce al activar muestreo, que ademas cuesta un 2-3% de velocidad de decodificacion.
- `top_k` esta limitado a 64 en el runtime.
- Sesgos y riesgo de alucinacion: no documentados en la model card; se heredan los del modelo base Qwen3.5-9B, no descritos en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero XeFP4 y XeQ Runtime no estan afiliados ni respaldados por Alibaba Cloud ni por Intel; conviene revisar `LICENSE` y `NOTICE` antes de desplegar.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario limitados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KINOQ/Qwen3.5-9B-XeFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Runtime y repositorio XeFP4: https://github.com/kinoqdev/XeFP4
- Especificacion del formato XeFP4: https://github.com/kinoqdev/XeFP4/blob/main/spec/XEFP4_SPEC.md

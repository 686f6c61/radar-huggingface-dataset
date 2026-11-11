# hyperionaidev/Ling-mini-2.0-ipad-GGUF

## Resumen
Ling-mini-2.0 es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por InclusionAI, con 16.300 millones de parámetros totales y aproximadamente 1.400 millones activos por token, distribuidos en 256 expertos por capa. La ficha que nos ocupa no es el modelo original, sino una cuantización GGUF extrema publicada por el usuario hyperionaidev bajo el proyecto smolmaxxing, diseñada específicamente para ejecutar el modelo en un iPad Air de 2013 con 1 GB de RAM y iOS 12.5.7 con jailbreak.

El propósito de esta build es demostrar que un MoE de 16B puede inferirse en hardware de hace más de una década mediante paginación de expertos desde almacenamiento flash, un pool reducido de expertos en RAM y un kernel de tabla de búsqueda adaptado al A7. No es una cuantización de propósito general: requiere un llama.cpp parcheado y no funciona correctamente en herramientas estándar como Ollama, LM Studio o llama.cpp sin modificar.

Es relevante para quienes investigan inferencia en el extremo (edge), técnicas de offloading de expertos y optimización de MoE en dispositivos con restricciones severas de memoria, más que para uso en producción convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (256 expertos por capa) |
| Parametros totales | 16.300 millones (16,3 B) |
| Parametros activos | ~1.400 millones (1,4 B) |
| Longitud de contexto | 32.768 tokens en metadatos; ejecutado a 512 en iPad |
| Tipos de cuantizacion | Expertos en Q2_K (repackeados como q2lut), resto de tensores en Q4_K, capa 1 `ffn_down_exps` en Q4_K |
| Idiomas soportados | no disponible (el corpus de selección de cabeza incluye inglés y multilingüe, sin listado explícito) |
| Licencia | MIT |
| Formato de pesos | GGUF (`lm2-q2-h60-lut.gguf`, 5.549.932.192 bytes) |
| SHA-256 | `3e464310eaddebc29e03daaf2617661ab3aa002ac84da9d8aa2ddb44a94e50bd` |
| Cabeza de salida | Podada a 60.000 de 157.184 filas de vocabulario, con tensor `output_ids` |
| Layout | Expertos al final; parte no experta en los primeros 466 MB; cada experto (gate, up, down) ocupa 1,03 MB |
| Kernel | `vqtbl1q` lookup-table, clave `ipad.expert_layout = "q2lut"` |

## Arquitectura y entrenamiento
El modelo base Ling-mini-2.0 es un transformer con arquitectura MoE de 256 expertos por capa y 16,3 B de parámetros totales, de los cuales unos 1,4 B se activan por token. La model card de esta build no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; tampoco documenta innovaciones como decodificación especulativa o atención lineal. La model card indica explícitamente que Ling-mini-2.0 no es un modelo de razonamiento y que su plantilla de chat ya fija "detailed thinking off".

La innovación relevante está en la cuantización y el runtime, no en el entrenamiento. Los expertos se toman de `mradermacher/Ling-mini-2.0-i1-GGUF` (`i1-Q2_K_S`, con imatrix, cuantizado desde BF16) y se repackean en bloques de 16 filas × 256 columnas para un kernel de tabla de búsqueda `vqtbl1q`. El resto de tensores proviene de `bartowski/inclusionAI_Ling-mini-2.0-GGUF` (Q4_K_M) recuantizado con su imatrix mediante `--pure`. La cabeza de salida se poda a 60.000 filas elegidas por frecuencia de token en un corpus inglés y multilingüe. El archivo se ensambló sin almacenarlo completo, descargando tensores por HTTP range requests con `tools/lm-ipad.sh`.

## Capacidades
- Generación de texto autoregresiva en inglés y contenido multilingüe (sin listado formal de idiomas).
- Ejecución en dispositivo con 1 GB de RAM mediante paginación de expertos desde flash: pool de 14 expertos por capa en RAM, prefetch y desalojo por frecuencia (LFU 0.95).
- Control de equilibrio calidad/velocidad mediante sesgo de caché (`GGML_MOE_BIAS`) y número de expertos por token (`--experts`).
- Plantilla de chat con "detailed thinking off"; no es un modelo de razonamiento explícito.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.
- Capacidad de generar únicamente tokens dentro de la cabeza podada de 60.000 filas, aunque acepta prompts con el vocabulario completo.

## Casos de uso
- Investigación en inferencia extrema: reproducir el experimento en un iPad Air de 2013 con jailbreak para estudiar el comportamiento de MoE con offloading a flash y medir latencia, aciertos de caché y perplejidad en dispositivo.
- Benchmarking de kernels de tabla de búsqueda: validar el kernel `vqtbl1q` y el layout `q2lut` frente a kernels estándar en hardware ARM antiguo sin dotprod.
- Estudio de poda de vocabulario: analizar el impacto de reducir la cabeza de salida a 60.000 filas sobre la coherencia y la perplejidad en textos ingleses.
- Docencia y divulgación: demostrar de forma tangible las técnicas de paginación de expertos, prefetch y sesgo de enrutado en un dispositivo de consumo masivo.
- Pruebas de estrés de memoria: verificar el límite práctico de pool de expertos (14) antes de provocar kernel panic en dispositivos de 1 GB.
- Comparación de builds: contrastar esta variante iPad con la build para TV-box (`hyperionaidev/Ling-mini-2.0-tvbox-GGUF`), que usa un conjunto de expertos distinto.

## Benchmarks y rendimiento
Mediciones realizadas en un iPad Air de 2013 (Apple A7, 2 núcleos, 1 GB de RAM, iOS 12.5.7 con jailbreak), sobre un prompt de historia, con pool 14, prefetch y desalojo por frecuencia. Perplejidad medida con `tinyppl` sobre 2 fragmentos de 512 tokens de un texto inglés (506 tokens puntuados).

| Sesgo de caché | Expertos por token | tok/s en iPad | Perplejidad | vs sin sesgo |
|---|---|---|---|---|
| 0 (calidad completa) | 8 | 2,56 | 13,30 | ±0 |
| 0,1 (recomendado) | 8 | 3,33 | 13,65 | +2,6 % |
| 0,2 | 8 | 3,96 | 15,68 | +18 % (ruido) |
| 0,3 | 8 | 4,43-4,56 | 14,44 | +8,5 % |
| 0 | 6 | 3,43 (texto de evaluación) | 14,38 | +8,1 % |
| 0,3 | 6 | 5,21 | 15,55 | +17 % |

Datos adicionales:
- RAM: RSS máximo de 556-576 MB.
- Prompt: 2,8-3,6 tok/s.
- Salida: la historia generada es coherente.
- Comparación con Moon-Beam-8B-A1B: este modelo es más grande pero no mejor; Moon-Beam obtiene 12,89 de perplejidad en los mismos dos fragmentos frente a 13,30 aquí (+3 %) y corre a 3,5 tok/s con calidad completa.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM/RAM estimada: menos de 580 MB en el dispositivo objetivo; el archivo completo ocupa 5,55 GB en almacenamiento y requiere 5,6 GB libres para copiarlo.
- GPU recomendadas: no aplica en el caso documentado; el hardware de referencia es un Apple A7 (iPad Air 2013). No se documentan requisitos para GPU de escritorio.
- Cabe en GPU de consumo: no disponible; la build está pensada para iOS 12 con jailbreak y kernel parcheado.
- Despliegue: exclusivamente con llama.cpp parcheado del repositorio smolmaxxing (commit `1945793` más `ipad-air/patches/llama.cpp-ios12.patch`), compilado con SDK de iPhoneOS de Xcode 15.4, firmado con `ldid -Sent.xml` y acceso SSH por USB. No funciona en llama.cpp estándar, LM Studio ni Ollama.
- Variables de entorno relevantes: `GGML_MOE_PAGER=1`, `GGML_MOE_POOL=14`, `GGML_MOE_PREFETCH=1`, `GGML_MOE_LFU=0.95`, `GGML_MOE_BIAS=0.1`, `GGML_MOE_STATS=1` para estadísticas de aciertos y fallos.
- Latencia y throughput: 2,56 tok/s con calidad completa; 3,33 tok/s con sesgo 0,1; hasta 5,21 tok/s con sesgo 0,3 y 6 expertos por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en iPad Air | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-mini-2.0 iPad GGUF (esta build) | 16,3 B totales / ~1,4 B activos | 32.768 en metadatos, 512 en ejecución | 2,56-5,21 tok/s; perplejidad 13,30-15,68 | MIT | Hugging Face (hyperionaidev) |
| Moon-Beam-8B-A1B | 8 B totales / ~1 B activos | no disponible | 3,5 tok/s con calidad completa; perplejidad 12,89 | no disponible | no disponible en la información |
| Ling-mini-2.0 TV-box GGUF | 16,3 B totales / ~1,4 B activos | no disponible | no disponible | MIT | Hugging Face (hyperionaidev/Ling-mini-2.0-tvbox-GGUF) |
| Ling-mini-2.0 original (InclusionAI) | 16,3 B totales / ~1,4 B activos | no disponible | no aplica (no orientado a iPad) | no disponible en esta ficha | Hugging Face (inclusionAI/Ling-mini-2.0) |

## Limitaciones y advertencias
- El archivo solo es compatible con el llama.cpp parcheado del repositorio smolmaxxing; en cualquier otro runtime los expertos quedan desordenados y la salida es basura.
- La cabeza de salida está podada a 60.000 de 157.184 filas: el modelo no puede generar tokens fuera de ese subconjunto, lo que puede degradar la cobertura léxica en dominios especializados o idiomas poco representados.
- El contexto práctico es de 512 tokens en el iPad, muy por debajo de los 32.768 declarados en metadatos.
- El sesgo de caché introduce pérdida de calidad medible: +2,6 % de perplejidad con 0,1 y hasta +17 % con 0,3 y 6 expertos.
- El pool de expertos no debe superar 14 en un dispositivo de 1 GB; valores mayores provocaron kernel panic en pruebas con Moon-Beam.
- No es un modelo de razonamiento; no debe esperarse comportamiento de cadena de pensamiento.
- No se documentan sesgos concretos, tasas de alucinación ni evaluación multilingüe formal.
- Licencia MIT en esta build, pero conviene verificar la licencia del modelo base `inclusionAI/Ling-mini-2.0` antes de uso comercial.
- Requiere dispositivo con jailbreak, lo que implica riesgos de seguridad y soporte no oficial.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y tamaño reportado de 0,0 GB pese a que el archivo declarado ocupa 5,55 GB.

## Enlaces
- Hugging Face (esta build): https://huggingface.co/hyperionaidev/Ling-mini-2.0-ipad-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-mini-2.0
- GGUF oficial del modelo base: https://huggingface.co/inclusionAI/Ling-mini-2.0-GGUF
- Build para TV-box: https://huggingface.co/hyperionaidev/Ling-mini-2.0-tvbox-GGUF
- Fuente de expertos: https://huggingface.co/mradermacher/Ling-mini-2.0-i1-GGUF
- Fuente de tensores no expertos: https://huggingface.co/bartowski/inclusionAI_Ling-mini-2.0-GGUF
- Repositorio smolmaxxing: https://github.com/hyperionaidev/smolmaxxing
- Write-up del experimento: https://github.com/hyperionaidev/smolmaxxing/blob/main/EXPERIMENT.md
- Instrucciones iPad: https://github.com/hyperionaidev/smolmaxxing/blob/main/ipad-air/README.md
- Script de ensamblado: https://github.com/hyperionaidev/smolmaxxing/blob/main/tools/lm-ipad.sh
- Hilo en r/LocalLLaMA: https://www.reddit.com/r/LocalLLaMA/comments/1np8uv6/inclusionai_published_ggufs_for_the_ringmini_and/
- GGUF de Ring-mini-2.0: https://huggingface.co/inclusionAI/Ring-mini-2.0-GGUF

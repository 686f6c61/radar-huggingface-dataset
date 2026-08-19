# kingjones777/Qwen3.5-0.8B-ROCmFP4-GGUF

## Resumen

Este repositorio contiene la primera cuantización en formato ROCmFP4/ROCmFPX del modelo multimodal Qwen3.5-0.8B de Alibaba Cloud, publicada por el usuario kingjones777. El modelo base, Qwen/Qwen3.5-0.8B, es el más pequeño de la serie Qwen3.5 lanzada en febrero de 2026, con 752 millones de parámetros, una ventana de contexto de 262.000 tokens y capacidades nativas de visión (image-text-to-text). La cuantización está específicamente diseñada para hardware AMD Strix Halo (gfx1151, Ryzen AI MAX+ 395 con 128 GB de memoria unificada) y requiere un build de llama.cpp con soporte ROCmFPX, por lo que no es compatible con llama.cpp estándar, Ollama ni LM Studio.

La relevancia de este modelo radica en su tamaño reducido combinado con capacidades multimodales, lo que lo hace apto para despliegue local en equipos AMD de gama alta. El repositorio incluye cuatro variantes GGUF (Q4_0, Q6_0 y dos Q8_0) junto con el proyector multimodal `mmproj-BF16.gguf` necesario para la entrada de imágenes. Las mediciones de rendimiento, realizadas en hardware real, muestran una velocidad de decodificación de hasta 171,38 tokens por segundo en la variante de 4 bits. No obstante, el autor advierte de un comportamiento problemático: en algunas consultas el modelo continúa razonando hasta agotar el límite de tokens sin emitir una respuesta final, un fallo que también está presente en el modelo BF16 original y que debe tenerse en cuenta antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) con fusion temprana |
| Parametros totales | 752.393.024 (~0,75 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | ROCmFP4 (Q4_0), ROCmFPX (Q6_0, Q8_0) — 4 variantes |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con `mmproj-BF16.gguf` para vision) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B es un transformer multimodal que integra vision y lenguaje mediante entrenamiento de fusion temprana sobre billones de tokens multimodales, según la documentacion oficial de la serie Qwen3.5. Esta arquitectura le permite procesar simultaneamente imagenes y texto, superando a los modelos Qwen3-VL en tareas de razonamiento, codigo, agentes y comprension visual. El repositorio aqui descrito no es un modelo entrenado desde cero, sino una cuantizacion del GGUF BF16 original realizada con el stack ROCmFPX, un fork de llama.cpp optimizado para aceleradores AMD RDNA 4 (gfx1151). La cuantizacion se hizo sin reconversion desde el Hub y cada artefacto fue verificado individualmente en hardware real.

Una particularidad tecnica destacable es que Qwen3.5-0.8B tiene embeddings atados: no existe el tensor `output.weight`, por lo que el flag `--output-tensor-type` es un no-op silencioso y solo `--token-embedding-type` protege la cabeza del modelo. Ademas, el modelo no incluye un drafter MTP/EAGLE para decodificacion especulativa, por lo que las velocidades medidas representan el rendimiento maximo alcanzable sin tecnicas de aceleracion adicionales.

## Capacidades

- Procesamiento multimodal: acepta entrada de imagenes y texto, generando respuestas textuales (pipeline `image-text-to-text`).
- Razonamiento y generacion de texto: el modelo base esta entrenado para tareas de razonamiento, aunque en este tamano presenta problemas de terminacion de la cadena de pensamiento (ver limitaciones).
- Capacidades de agente: las variantes etiquetadas como `AGENT` emplean una receta de cuantizacion orientada a mejorar la aceptacion de drafts especulativos, aunque el beneficio no es aplicable al carecer de drafter.
- Comprension visual: capaz de describir, clasificar y razonar sobre imagenes, segun las capacidades declaradas de la serie Qwen3.5.
- Soporte de tool calling y function calling: no se especifica en la informacion disponible.
- Multilingue: no se especifica en la informacion disponible.

## Casos de uso

- Asistente de vision en dispositivos edge: el reducido tamano del modelo (0,47-0,75 GiB) permite ejecutarlo en equipos AMD Strix Halo para tareas de descripcion y analisis de imagenes en tiempo real, con una latencia de decodificacion de aproximadamente 5,8 ms por token en la variante Q4_0.
- Clasificacion y etiquetado de imagenes: dado su pipeline multimodal, puede utilizarse para generar etiquetas o categorias a partir de imagenes en entornos donde no se dispone de GPU dedicada, aprovechando la memoria unificada del Ryzen AI MAX+ 395.
- Extraccion de informacion de documentos escaneados: combinando la entrada de imagen con instrucciones textuales, el modelo puede transcribir o resumir contenido de documentos, facturas o formularios, aunque su precision en tareas de codigo es limitada.
- Prototipado rapido de aplicaciones multimodales: los desarrolladores pueden validar ideas de productos que requieran interaccion vision-texto sin necesidad de infraestructura en la nube, gracias a la compatibilidad con el fork ROCmFPX de llama.cpp.
- Automatizacion de tareas de agente con entrada visual: las variantes `AGENT` estan pensadas para pipelines de razonamiento multi-paso que combinan imagenes y texto, aunque se debe monitorizar la finalizacion de las respuestas.
- Evaluacion de cuantizaciones ROCmFPX en hardware AMD: el repositorio sirve como referencia para medir el impacto de distintos niveles de cuantizacion (Q4_0, Q6_0, Q8_0) en velocidad y correccion sobre gfx1151, util para decidir configuraciones de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona unicamente mediciones de rendimiento de inferencia realizadas en un Ryzen AI MAX+ 395 (Strix Halo, gfx1151) con 128 GB de memoria unificada, usando `-ngl 999 -c 4096 -fa on -fit off`, 300 tokens de calentamiento descartados y mediana de 3 ejecuciones:

| Variante | ftype | Tamano | Velocidad de decodificacion (mediana) | Correctness (max_tokens 1024) |
|---|---|---|---|---|
| Q4_0_ROCMFP4_COHERENT | 102 | 0,47 GiB | 171,38 t/s | 2/3 |
| Q6_0_ROCMFPX_AGENT | 114 | 0,68 GiB | 138,81 t/s | 3/3 |
| Q8_0_ROCMFPX | 111 | 0,74 GiB | 142,38 t/s | 2/3 |
| Q8_0_ROCMFPX_AGENT | 115 | 0,75 GiB | 142,3 t/s | 2/3 |

La puntuacion de correccion cuenta como fallo las respuestas que no terminan dentro del limite de tokens. La variante Q4_0 es la mas rapida y pequena, y segun el autor produce las mismas respuestas que las de 8 bits.

## Requisitos de hardware

- Hardware objetivo: AMD Strix Halo (gfx1151), especificamente Ryzen AI MAX+ 395 con 128 GB de memoria unificada.
- VRAM: no aplica VRAM dedicada; el modelo se ejecuta en memoria unificada. Los archivos GGUF ocupan entre 0,47 y 0,75 GiB, mas el `mmproj-BF16.gguf` adicional para vision.
- GPU recomendadas: cualquier iGPU o APU AMD con arquitectura gfx1151 (RDNA 4). No se garantiza compatibilidad con otras arquitecturas AMD ni con NVIDIA.
- Opciones de despliegue: exclusivamente llama.cpp con el fork ROCmFPX (https://github.com/charlie12345/ROCmFPX). No funciona en llama.cpp estandar, Ollama ni LM Studio.
- Latencia y rendimiento: entre 138,8 y 171,4 tokens por segundo de decodificacion, medidos con contexto de 4096 tokens y flash attention activada.
- Nota: el modelo no incluye drafter MTP/EAGLE, por lo que no se puede acelerar mediante decodificacion especulativa.

## Comparativa con modelos similares

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa rigurosa con otros modelos de la misma categoria (p. ej., Qwen3.5-2B, Qwen3.5-4B o Phi-3.5-vision). El unico punto de referencia disponible es el propio modelo base Qwen/Qwen3.5-0.8B sin cuantizar, que presenta el mismo comportamiento de no terminacion en ciertas consultas. Se recomienda consultar los benchmarks oficiales de la serie Qwen3.5 para una comparativa con modelos de tamano similar.

## Limitaciones y advertencias

- Riesgo de respuestas vacias: en algunas consultas el modelo nunca emite una respuesta final y continua razonando hasta agotar el limite de tokens, devolviendo `content: ""` con `finish_reason: "length"`. Este comportamiento se ha verificado tanto en la cuantizacion como en el modelo BF16 original, y no es atribuible a la cuantizacion. Se debe manejar explicitamente el contenido vacio en produccion y considerar restringir o desactivar la plantilla de razonamiento para consultas factuales cortas.
- Compatibilidad restringida: los archivos GGUF solo cargan en builds de llama.cpp con soporte ROCmFPX. No son compatibles con el software estandar de inferencia (Ollama, LM Studio, llama.cpp vanilla), lo que limita su uso a hardware AMD especifico y a usuarios con conocimientos tecnicos para compilar el fork.
- Rendimiento de codigo debil: segun la cobertura de codersera.com, la precision en tareas de codigo es baja; se recomienda usar Qwen3.5-4B o superior para cualquier tarea de programacion.
- Sin decodificacion especulativa: al no incluir un drafter, no se puede aprovechar la aceleracion por MTP/EAGLE, dejando la velocidad de decodificacion como limite superior.
- Sesgos y alucinaciones: no se ha publicado informacion sobre sesgos especificos de este modelo. Como cualquier LLM pequeno, presenta riesgo de alucinacion, especialmente en tareas factuales donde su razonamiento puede no converger.
- Restricciones de licencia: aunque la licencia es Apache-2.0 (permite uso comercial), la dependencia del fork ROCmFPX puede implicar condiciones adicionales no documentadas en este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Qwen3.5-0.8B-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Fork ROCmFPX (llama.cpp): https://github.com/charlie12345/ROCmFPX
- Documentacion de la serie Qwen3.5: https://github.com/algtrd24/qwen3.5
- Guia de la serie Qwen3.5 Small (0.8B a 9B): https://note.com/zephel01/n/n6b236da76680
- Ejecucion y benchmark de Qwen3.5 0.8B: https://codersera.com/blog/run-and-benchmark-qwen35-08b/
- Variante Q4_K_M en ModelScope: https://www.modelscope.cn/models/diodel/Qwen3.5-0.8B-Q4_K_M-GGUF

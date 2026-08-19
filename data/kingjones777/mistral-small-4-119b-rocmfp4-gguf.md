# kingjones777/Mistral-Small-4-119B-ROCmFP4-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF de 4 bits del modelo Mistral-Small-4-119B-2603, desarrollada por kingjones777 específicamente para la GPU integrada AMD gfx1151 (Ryzen AI MAX+ 395 / Strix Halo). Se trata de una conversión a formato ROCmFP4, un tipo de cuantización que solo existe en el fork de llama.cpp llamado ROCmFPX, no en el código oficial. El archivo ocupa 63.07 GiB con 4.55 bits por peso, y está fragmentado (sharded).

La relevancia de esta publicación radica en que permite ejecutar un modelo de 119 mil millones de parámetros en un sistema con memoria unificada de 128 GB, alcanzando una velocidad de decodificación de 37.86 tokens por segundo según las mediciones del autor. La cuantización se realizó directamente desde el modelo original en BF16 (222 GiB), evitando la pérdida adicional de una requantización. El modelo base es una mezcla de expertos (MoE) con 119B parámetros totales y 6.5B activos, con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) |
| Parametros totales | 119B |
| Parametros activos | 6.5B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0_ROCMFP4_COHERENT (ftype 102), con output.weight y token_embd en Q6_K, shared experts en Q8_0, router y norms en F32 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fragmentado) |

## Arquitectura y entrenamiento

Esta no es una arquitectura nueva, sino una cuantización del modelo Mistral-Small-4-119B-2603 de Mistral AI. El modelo original es una mezcla de expertos con 119B parámetros totales y 6.5B activos, lo que significa que en cada paso de inferencia solo se activan 6.5 mil millones de parámetros. La cuantización ROCmFP4 aplica un esquema de 4 bits por peso, pero con una protección especial para los expertos compartidos: estos se mantienen en Q8_0 porque ven todos los tokens y su error seria sistemático, no promediado. El router y las normas se conservan en F32 para mantener la precisión del enrutamiento.

El proceso de cuantización partió del modelo en BF16 (222 GiB), lo que el autor considera una fuente sin pérdida, en lugar de requantizar una versión ya reducida. No se proporcionan detalles sobre el dataset de entrenamiento del modelo base, ya que esta publicación solo cubre la conversión a GGUF.

## Capacidades

- Generación de texto: el modelo base es capaz de producir texto coherente en inglés, aunque esta cuantización no ha sido evaluada en cuanto a calidad de salida.
- Razonamiento y matemáticas: las pruebas de memorización del autor incluyen 17×23 (resultado 391) y la capital de Japón (Tokyo), que el modelo responde correctamente.
- Tool calling: no se ha evaluado en esta cuantización, según la model card.
- Longitud de contexto: no se ha probado el rendimiento con contextos largos.
- Capacidades multilingües: el modelo base está entrenado principalmente en inglés, y la model card solo declara el idioma inglés.

## Casos de uso

- Inferencia local en equipos con AMD Ryzen AI MAX+ 395: el caso principal es ejecutar un modelo de 119B en una estación de trabajo con memoria unificada, sin necesidad de GPUs discretas de gran VRAM. Con 37.86 tok/s de decodificación, es viable para aplicaciones interactivas de chat.
- Asistente de texto privado: al ejecutarse localmente, los datos no salen del dispositivo, lo que lo hace adecuado para entornos con requisitos de confidencialidad.
- Generación de código: el modelo base de Mistral Small 4 tiene capacidades de código, aunque esta cuantización no ha sido verificada en esa tarea. Podría usarse en un entorno de desarrollo local con herramientas como llama.cpp.
- Prototipado de aplicaciones MoE: para desarrolladores que quieran experimentar con un modelo de gran tamaño en hardware AMD, esta cuantización ofrece un punto de partida con un tamaño manejable.
- Investigación de cuantización: el esquema ROCmFP4 con protección de expertos compartidos puede servir como referencia para estudiar el impacto de la cuantización en modelos MoE.
- Chat conversacional: con la velocidad medida, es posible mantener conversaciones fluidas, siempre que se acepte la falta de evaluación de calidad en este formato.

## Benchmarks y rendimiento

La model card no incluye benchmarks de calidad (como MMLU, HumanEval o GSM8K). El autor declara explícitamente que no realizó pruebas de perplexity ni comparaciones de calidad contra el modelo original u otras cuantizaciones. Solo se hicieron pruebas de memorización con datos conocidos, que el modelo superó.

En cuanto a rendimiento de hardware, se proporcionan mediciones de velocidad de decodificación en un Ryzen AI MAX+ 395 (gfx1151, 128 GB unificados, ROCm 7.2.4):

| Build | Tamano | Decode (mediana) | Rango |
|---|---|---|---|
| ROCmFP4 (este build) | 63.07 GiB | 37.86 tok/s | [37.83 – 38.65] |
| UD-Q4_K_XL | 70 GiB | 18.75 tok/s | [15.99 – 34.30] |

El autor señala que los rangos son disjuntos (34.30 < 37.83), lo que indica una ventaja consistente, aunque la línea base (UD-Q4_K_XL) tiene una varianza alta.

## Requisitos de hardware

- VRAM: el modelo ocupa 63.07 GiB, por lo que requiere al menos 64 GiB de memoria unificada o VRAM. El autor lo probó en un sistema con 128 GB unificados.
- GPU: AMD gfx1151 (Ryzen AI MAX+ 395 / Strix Halo). No se ha probado en otras GPUs AMD ni NVIDIA.
- Software: es imprescindible usar una versión de llama.cpp con soporte para los tipos ROCmFP4, concretamente el fork [ROCmFPX](https://github.com/charlie12345/ROCmFPX). El llama.cpp estándar no cargará este modelo.
- Opciones de despliegue: llama.cpp con ROCmFPX. No se mencionan otros frameworks como vLLM u Ollama.
- Latencia y throughput: 37.86 tok/s de decodificación medidos en el hardware de referencia, con una latencia por token de aproximadamente 26 ms.

## Comparativa con modelos similares

La comparativa disponible se limita a otra cuantización del mismo modelo base, ya que no se han publicado comparaciones con otros modelos.

| Modelo | Tamano | Velocidad de decodificacion | Notas |
|---|---|---|---|
| Mistral-Small-4-119B-2603 ROCmFP4 (este) | 63.07 GiB | 37.86 tok/s | Cuantizacion 4-bit para gfx1151 |
| Mistral-Small-4-119B-2603 UD-Q4_K_XL | 70 GiB | 18.75 tok/s | Cuantizacion 4-bit estandar, mayor varianza |
| Mistral-Small-4-119B-2603 BF16 | 222 GiB | no disponible | Modelo original sin cuantizar |

No hay datos comparativos con otros modelos de la misma categoría (por ejemplo, Llama 3.1 70B o Qwen 2.5 72B) en esta información.

## Limitaciones y advertencias

- Requiere un fork no oficial de llama.cpp (ROCmFPX). El llama.cpp estándar no puede cargar el archivo, lo que limita su portabilidad.
- No se han realizado pruebas de calidad (perplexity, benchmarks estándar, A/B contra el modelo original). Las pruebas de memorización son necesarias pero no suficientes para garantizar que el modelo no esté dañado.
- No se ha probado el rendimiento con contextos largos, por lo que no se conoce si la cuantización afecta a la atención de ventanas extendidas.
- No se ha evaluado la capacidad de tool calling, lo que impide usarlo de forma segura en aplicaciones de agentes.
- El modelo base está entrenado principalmente en inglés; no se garantiza un buen rendimiento en otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero el autor de la cuantización no ofrece garantías sobre el comportamiento del modelo cuantizado.
- El tamaño del archivo (63.07 GiB) requiere hardware con al menos 64 GiB de memoria, lo que excluye a la mayoría de las GPUs de consumo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Mistral-Small-4-119B-ROCmFP4-GGUF
- Fork de llama.cpp con soporte ROCmFP4: https://github.com/charlie12345/ROCmFPX
- Modelo base (Mistral-Small-4-119B-2603): https://huggingface.co/mistralai/Mistral-Small-4-119B-2603

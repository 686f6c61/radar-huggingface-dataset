# kingjones777/Granite-4.1-8B-ROCmFP4-GGUF

## Resumen

El modelo `kingjones777/Granite-4.1-8B-ROCmFP4-GGUF` es una cuantización de 4 bits en formato GGUF del modelo base `ibm-granite/granite-4.1-8b`, un modelo de lenguaje denso de 8 mil millones de parámetros desarrollado por IBM. Esta variante específica está optimizada para hardware AMD con arquitectura `gfx1151` (Ryzen AI MAX+ 395 / Strix Halo) mediante el tipo de cuantización propietario `ROCmFP4` (ftype 102), que solo existe en el fork `charlie12345/ROCmFPX` de llama.cpp, no en la versión estándar.

El interés de esta ficha radica en que presenta una alternativa de cuantización más rápida y ligeramente más pequeña que la clásica `Q4_K_M` en ese hardware concreto, alcanzando 39,90 tokens por segundo de mediana frente a 35,27 del `Q4_K_M`, con rangos de medición disjuntos. El archivo pesa 5,162 GB con 4,69 bits por peso, y se ha cuantizado desde un GGUF BF16 (fuente sin pérdida), no mediante requantización de una versión de menor precisión. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (sin MoE ni SSM, segun la model card) |
| Parametros totales | 8.791.592.960 |
| Parametros activos | no disponible (modelo denso, todos los parametros estan activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `Q4_0_ROCMFP4_COHERENT` (ftype 102), 4,69 BPW; el archivo usa `token_embd` en Q6_K, normas en F32 y el resto en `Q4_0_ROCMFP4` (tipo 100) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (5,162 GB) |

## Arquitectura y entrenamiento

La arquitectura del modelo base `ibm-granite/granite-4.1-8b` no se detalla en la informacion proporcionada, pero la model card de la cuantizacion confirma que es un modelo denso, sin componentes SSM ni MoE que requieran proteccion especial durante la cuantizacion. No se dispone de datos sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, metodos de alineacion como RLHF o DPO).

En cuanto a la cuantizacion, el autor indica que se partio de un GGUF BF16 (fuente sin perdida) y se aplico el tipo `ROCmFP4` con modo `COHERENT`, disenado especificamente para la arquitectura AMD `gfx1151`. Los tensores se auditaron en el archivo final: `token_embd` en Q6_K, normas en F32 y el grueso en `Q4_0_ROCMFP4`. No se realizaron pruebas de perplexity ni evaluaciones de calidad comparativa contra el modelo original.

## Capacidades

La informacion disponible no especifica las capacidades funcionales del modelo base. Como modelo de generacion de texto (pipeline `text-generation`), se asume que es capaz de producir texto coherente en ingles, pero no hay datos concretos sobre razonamiento, codigo, matematicas, tool calling, agentes o capacidades multilingues. La model card de la cuantizacion solo menciona pruebas de correccion basica con preguntas memorizadas (17×23, capital de Japon, dias de 2024), que supero correctamente.

Se recomienda consultar la ficha del modelo base `ibm-granite/granite-4.1-8b` para conocer sus capacidades completas, ya que esta cuantizacion no altera las habilidades del modelo, solo su representacion numerica.

## Casos de uso

No se han documentado casos de uso especificos en la informacion proporcionada. No obstante, al tratarse de una cuantizacion GGUF de un modelo de 8B con licencia Apache 2.0, es plausible emplearla en escenarios de inferencia local en hardware AMD con ROCm, como chatbots, generacion de texto asistida o prototipado rapido. Sin embargo, al no existir evaluaciones de calidad ni de long-context, se recomienda validar el comportamiento en cada aplicacion concreta antes de usarla en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye unicamente mediciones de velocidad de decodificacion en el hardware objetivo:

| Build | Tamano | Decode (mediana) | Rango |
|---|---|---|---|
| ROCmFP4 COHERENT (este build) | 5,162 GB | 39,90 tok/s | [39,87 – 39,93] |
| Q4_K_M | 5,348 GB | 35,27 tok/s | [35,22 – 35,28] |

Las mediciones se realizaron en un Ryzen AI MAX+ 395 (gfx1151, 128 GB unified, ROCm 7.2.4), con mediana de 3 ejecuciones descartando el warm-up. La diferencia es de aproximadamente un 13% a favor del ROCmFP4, con rangos disjuntos. No se realizaron pruebas de perplexity, long-context ni tool-calling.

## Requisitos de hardware

- Requiere una GPU AMD compatible con `gfx1151` (Ryzen AI MAX+ 395 / Strix Halo) y ROCm 7.2.4 o superior.
- Necesita una compilacion de llama.cpp que incluya los tipos de cuantizacion ROCmFP4, concretamente el fork [`charlie12345/ROCmFPX`](https://github.com/charlie12345/ROCmFPX). El llama.cpp estandar no cargara este modelo.
- El archivo GGUF pesa 5,162 GB, por lo que cabe en la memoria unificada de 128 GB del Ryzen AI MAX+ 395 sin problemas.
- No hay datos de VRAM dedicada ni de latencia/throughput en otras configuraciones.
- No se mencionan opciones de despliegue alternativas (vLLM, Ollama, TGI) porque el formato ROCmFP4 es exclusivo de ese fork de llama.cpp.

## Comparativa con modelos similares

La unica comparativa disponible en la informacion es con la cuantizacion `Q4_K_M` del mismo modelo base, medida en el mismo hardware:

| Modelo / cuantizacion | Tamano | Velocidad (tok/s) | Licencia |
|---|---|---|---|
| Granite-4.1-8B ROCmFP4 COHERENT | 5,162 GB | 39,90 | Apache 2.0 |
| Granite-4.1-8B Q4_K_M | 5,348 GB | 35,27 | Apache 2.0 |

No se dispone de comparaciones con otros modelos de la misma categoria (por ejemplo, Llama 3.1 8B o Mistral 7B) en la informacion proporcionada.

## Limitaciones y advertencias

- El llama.cpp estandar no puede cargar este modelo; es imprescindible usar el fork `ROCmFPX` con soporte para los tipos ROCmFP4.
- No se han realizado pruebas de perplexity ni evaluaciones de calidad comparativa contra el modelo base o la cuantizacion Q4_K_M. Las unicas verificaciones son preguntas de hechos memorizados, que no garantizan la integridad del modelo.
- No se ha probado el comportamiento con contextos largos ni con tool-calling.
- La cuantizacion ROCmFP4 esta disenada exclusivamente para `gfx1151`; no funcionara en otras arquitecturas AMD ni en GPUs NVIDIA.
- Aunque la licencia Apache 2.0 permite uso comercial, al ser una cuantizacion no oficial, el autor no ofrece garantias sobre su correccion o rendimiento en produccion.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/kingjones777/Granite-4.1-8B-ROCmFP4-GGUF)
- [Modelo base: ibm-granite/granite-4.1-8b](https://huggingface.co/ibm-granite/granite-4.1-8b)
- [Fork de llama.cpp con soporte ROCmFPX](https://github.com/charlie12345/ROCmFPX)

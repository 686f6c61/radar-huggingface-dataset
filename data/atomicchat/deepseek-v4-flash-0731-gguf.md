# AtomicChat/DeepSeek-V4-Flash-0731-GGUF

## Resumen

DeepSeek-V4-Flash-0731-GGUF es una colección de cuantizaciones GGUF del modelo DeepSeek-V4-Flash-0731, publicada por AtomicChat. El modelo original, desarrollado por DeepSeek, es un mixture of experts (MoE) de 284 mil millones de parámetros con 13 mil millones activos por token, 43 capas, 256 expertos enrutados con 6 activos y un experto compartido, una ventana de contexto de 1 millón de tokens y un vocabulario de 129.280 entradas. Está entrenado con quantization-aware training (QAT), lo que significa que el checkpoint oficial ya almacena los expertos en MXFP4 y el resto de pesos en FP8 o BF16.

La relevancia de esta publicación es que permite ejecutar localmente un modelo de gran tamaño con cuantizaciones que van desde la copia bit-exacta del original (AD-BF16, 162,1 GB) hasta versiones extremadamente comprimidas de 1,81 bits por peso de experto (AD-IQ1_M, 70,2 GB). AtomicChat mide la degradación de cada cuantización con métricas propias (perplejidad, divergencia KL, coincidencia top-1) y las compara con las de otros publicadores como unsloth. El modelo está pensado para cargas de trabajo de razonamiento, código, agentes y contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer, 43 capas, 256 expertos enrutados con 6 activos y 1 experto compartido |
| Parametros totales | 284 mil millones |
| Parametros activos | 13 mil millones por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | AD-BF16, AD-MXFP4, AD-IQ3_M_XL, AD-IQ3_M, AD-IQ3_S, AD-IQ3_XS, AD-IQ3_XXS, AD-IQ2_M, AD-IQ2_S_XL, AD-IQ2_S, AD-IQ2_XS, AD-IQ2_XXS, AD-IQ1_M_XL, AD-IQ1_M |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-0731 es un MoE con 43 capas y 256 expertos enrutados, de los cuales se activan 6 por token junto con un experto compartido. La característica más destacable es que fue entrenado con quantization-aware training: los expertos, que representan el 96 % del modelo, ya se almacenan en MXFP4 (4,25 bits por peso), mientras que el resto de los pesos están en FP8 o BF16. Esto implica que no hay ganancia de precisión al repaquear los expertos en formatos más anchos, y que las cuantizaciones por debajo de 3 bits degradan la calidad más rápido que en modelos entrenados en BF16, porque el modelo no tiene precisión sobrante que sacrificar.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La arquitectura de atención se describe en la documentación como "compressed sparse attention" para soportar la ventana de 1 millón de tokens, aunque no se ofrecen más detalles técnicos al respecto.

## Capacidades

- Generación de texto y razonamiento multistep, con un modo de razonamiento que admite niveles de esfuerzo `high` y `max` (el parámetro `reasoning_effort`).
- Generación de código, según la documentación oficial del modelo para cargas de trabajo de coding.
- Soporte de bucles agénticos y tool calling: el aviso de la model card menciona explícitamente que en bucles agénticos los resultados de herramientas (tool results) se insertan en el contexto, lo que implica soporte de function calling.
- Capacidad de contexto largo de 1 millón de tokens, adecuada para análisis de documentos extensos.
- Multilingüe en inglés y chino.
- Ejecución local mediante cuantizaciones GGUF, con tamaños que van desde 70,2 GB hasta 162,1 GB.

## Casos de uso

- Ejecución local de un modelo de razonamiento de gran tamaño: con cuantizaciones como AD-IQ3_M_XL (143,6 GB) o AD-MXFP4 (154,5 GB) se puede desplegar en una estación de trabajo con 192 GB o 160 GB de RAM, manteniendo una calidad casi indistinguible del original.
- Agentes autónomos con tool calling: el modelo puede mantener razonamiento de múltiples turnos mientras recibe resultados de herramientas, siempre que se use el chat template corregido que AtomicChat proporciona en el repositorio.
- Análisis de documentos largos: su ventana de 1 millón de tokens permite procesar libros técnicos completos, bases de código extensas o expedientes legales en una sola pasada.
- Generación de código en entornos sin conexión: al ser un modelo de 13B activos, el coste de cómputo por token es bajo, y las cuantizaciones permiten ejecutarlo en hardware de gama alta sin depender de APIs externas.
- Soporte multilingüe inglés-chino: útil para traducción, localización o generación de contenido bilingüe en empresas con operaciones en ambos idiomas.
- Investigación sobre cuantización: las métricas detalladas de perplejidad, divergencia KL y coincidencia top-1 para cada rung de cuantización permiten estudiar empíricamente la degradación de calidad en modelos entrenados con QAT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. AtomicChat proporciona en su lugar métricas de calidad de cuantización medidas por ellos mismos sobre wikitext-2, comparando cada cuantización contra la referencia lossless (AD-BF16). Los valores absolutos no son comparables con los de otros publicadores porque dependen del corpus y la longitud de contexto, pero los relativos dentro de la tabla sí lo son.

| Quant | Tamano | Bits por experto | PPL | KLD media | Coincidencia top-1 | Δp RMS |
|---|---:|---:|---:|---:|---:|---:|
| AD-BF16 | 162,1 GB | 4,25 | 4,5289 | 0 | 100,000 % | 0,000 % |
| AD-MXFP4 | 154,5 GB | 4,25 | 4,5446 | 0,1564 | 87,369 % | 12,686 % |
| AD-IQ3_M_XL | 143,6 GB | 3,94 | 4,5490 | 0,1675 | 86,864 % | 13,004 % |
| AD-IQ3_M | 135,8 GB | 3,71 | 4,5695 | 0,1798 | 86,317 % | 13,615 % |
| AD-IQ3_S | 130,8 GB | 3,56 | 4,6016 | 0,1891 | 85,945 % | 13,988 % |
| AD-IQ3_XS | 118,2 GB | 3,20 | 4,6657 | 0,2065 | 85,384 % | 14,461 % |
| AD-IQ3_XXS | 108,1 GB | 2,91 | 4,8491 | 0,2495 | 83,761 % | 15,947 % |
| AD-IQ2_M | 104,0 GB | 2,79 | 4,8822 | 0,2567 | 83,560 % | 16,184 % |
| AD-IQ2_S_XL | 96,8 GB | 2,58 | 5,1406 | 0,3187 | 81,461 % | 18,500 % |
| AD-IQ2_S | 93,4 GB | 2,48 | 5,2152 | 0,3343 | 81,031 % | 18,996 % |
| AD-IQ2_XS | 85,1 GB | 2,25 | 5,4917 | 0,3947 | 79,240 % | 20,817 % |
| AD-IQ2_XXS | 78,5 GB | 2,06 | 5,7878 | 0,4544 | 77,459 % | 22,378 % |
| AD-IQ1_M_XL | 72,8 GB | 1,89 | 6,1786 | 0,5351 | 75,162 % | 24,695 % |
| AD-IQ1_M | 70,2 GB | 1,81 | 6,3813 | 0,5641 | 74,547 % | 25,253 % |

La comparativa con unsloth, también medida por AtomicChat con el mismo harness, muestra que en los rangos de 96,8 GB y 104 GB sus cuantizaciones están más cerca de la referencia que las equivalentes de unsloth, y que por debajo de 82 GB no hay rung de otros publicadores.

## Requisitos de hardware

- Tamaño de archivo de las cuantizaciones: desde 70,2 GB (AD-IQ1_M) hasta 162,1 GB (AD-BF16). Se necesita memoria adicional para el contexto y el runtime.
- Recomendaciones de AtomicChat según RAM disponible: 192 GB o más para AD-BF16; 160 GB para AD-MXFP4; 144 GB para AD-IQ3_M_XL; 128 GB para el siguiente escalón (AD-IQ3_S).
- En la práctica, el rango de memoria necesario está entre 70 y 162 GB antes de overhead de runtime y contexto, según el blog de AtomicChat.
- No se especifican GPUs concretas. Un modelo de este tamaño no cabe en GPUs de consumo (RTX 4090 con 24 GB); requiere configuraciones multi-GPU con memoria agregada de al menos 80-100 GB, o ejecución en CPU con mucha RAM usando llama.cpp.
- Opciones de despliegue: llama.cpp y llama-server (el aviso de la model card muestra el comando con `llama-server`), y Ollama según el blog de AtomicChat. No se menciona vLLM ni TGI en la información disponible.
- El blog indica que el modelo está diseñado para ejecutarse localmente en hardware profesional, no en equipos de consumo.

## Comparativa con modelos similares

La comparativa directa publicada por AtomicChat enfrenta sus cuantizaciones con las de unsloth para el mismo modelo base DeepSeek-V4-Flash-0731, medida con el mismo harness y la misma referencia lossless.

| Tamano | AtomicChat | KLD | unsloth | KLD |
|---:|---|---:|---|---:|
| 155 GB | AD-MXFP4 | 0,1564 | UD-Q4_K_XL | 0,1557 |
| 136 GB | AD-IQ3_M | 0,1798 | UD-IQ4_XS | 0,1779 |
| 128-131 GB | AD-IQ3_S | 0,1891 | UD-Q3_K_XL | 0,1981 |
| 116-118 GB | AD-IQ3_XS | 0,2065 | UD-IQ3_S | 0,2565 |
| 104 GB | AD-IQ2_M | 0,2567 | UD-IQ3_XXS | 0,2610 |
| 96,8 GB | AD-IQ2_S_XL | 0,3187 | UD-Q2_K_XL | 0,3216 |
| 91 GB | — | — | UD-IQ2_M | 0,3700 |
| 82,5 GB | — | — | UD-IQ1_S | 0,4863 |
| 78,5 GB | AD-IQ2_XXS | 0,4544 | — | — |
| 70,2 GB | AD-IQ1_M | 0,5641 | — | — |

En los rangos donde ambos publicadores coinciden en tamaño, AtomicChat gana en 128-131 GB, 116-118 GB, 104 GB y 96,8 GB. Por encima de 135 GB la diferencia está dentro del error de medición, y por debajo de 82 GB solo AtomicChat ofrece cuantizaciones. No hay datos comparativos con otros modelos de la misma categoría (otros MoE de 284B) en la información disponible.

## Limitaciones y advertencias

- El chat template embebido en los archivos GGUF está desactualizado y degrada silenciosamente el razonamiento: en bucles agénticos, el razonamiento de turnos anteriores se descarta cuando llegan resultados de herramientas, y el parámetro `reasoning_effort` nunca llega al modelo. Es necesario pasar el template corregido (`chat_template.jinja`) explícitamente con `--chat-template-file` y `--chat-template-kwargs`.
- El parámetro `reasoning_effort` solo acepta `high` y `max`; los clientes que mapean todos los niveles a `high` nunca alcanzarán `max`.
- Las cuantizaciones por debajo de 3 bits por peso de experto degradan la calidad más rápido que en modelos entrenados en BF16, porque el modelo fue entrenado a 4 bits y no tiene precisión sobrante. Para uso en producción se recomienda no bajar de AD-IQ3_M_XL (3,94 bits) si la memoria lo permite.
- Los idiomas soportados son solo inglés y chino; no hay garantía de buen rendimiento en otros idiomas.
- No se ha publicado información sobre sesgos conocidos, riesgo de alucinación o comportamiento en dominios específicos.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base puede tener sus propias condiciones; se debe verificar la licencia del checkpoint original de DeepSeek antes de un despliegue comercial.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/AtomicChat/DeepSeek-V4-Flash-0731-GGUF
- Modelo base en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Blog de AtomicChat sobre ejecución local: https://atomic.chat/blog/guides/how-to-run-deepseek-v4-flash-locally
- Releases de GitHub (aplicación de escritorio): https://github.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731/releases
- Documentación en DeepWiki: https://deepwiki.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731

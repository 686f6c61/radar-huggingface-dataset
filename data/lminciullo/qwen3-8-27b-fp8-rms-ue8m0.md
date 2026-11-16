# lminciullo/Qwen3.8-27B-FP8-rms-ue8m0

## Resumen

Qwen3.8-27B-FP8-rms-ue8m0 es una variante optimizada del checkpoint público Qwen/Qwen3.8-27B-FP8, publicado por el usuario lminciullo. No se trata de un modelo reentrenado ni ajustado: los pesos son idénticos al checkpoint upstream de Qwen en la revisión `c3a462cc3d38cf351f3b26cbd763469eeb74ef81`. Lo que aporta este repositorio es un kernel CUDA fusionado (add residual + RMS norm + cuantización de bloques UE8M0) y un conjunto de mediciones de decodificación especulativa realizadas el 16 de noviembre de 2026 sobre una NVIDIA H200 NVL con vLLM 0.29.0.

El modelo base es un transformer multimodal de tipo image-text-to-text con 27.781.427.952 parámetros (aproximadamente 27,8 mil millones), distribuido en formato FP8 y empaquetado en safetensors con un tamaño de repositorio de 30,9 GB. La arquitectura declarada en los tags es `qwen3_5`, lo que sugiere una generación de la familia Qwen3 con capacidades de visión integradas, aunque la model card no detalla la composición interna ni el contexto máximo.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de optimización de inferencia (fusión de kernel y decodificación especulativa MTP-4) con cifras reproducibles de throughput y aceptación. Por otro, sirve como ejemplo de publicación de artefactos de rendimiento sobre pesos ajenos bajo licencia Apache 2.0, sin modificar el modelo original. Es útil para equipos que despliegan Qwen3.8-27B en producción y buscan mejoras medibles en latencia de prefill y decodificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag `qwen3_5`), pipeline image-text-to-text |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (checkpoint base); cuantizacion de bloques UE8M0 en el kernel fusionado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no entrena ni modifica los pesos: hereda íntegramente el checkpoint Qwen/Qwen3.8-27B-FP8. La arquitectura es un transformer multimodal de la familia Qwen3.5, con pipeline image-text-to-text, lo que implica capacidad de procesar entradas de imagen y texto y generar texto. No se especifican en la información disponible el número de capas, la dimensión oculta, el número de cabezas de atención, la composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO.

La contribución técnica es un kernel CUDA que fusiona tres operaciones en una sola pasada: la suma residual, la normalización RMS y la cuantización de bloques UE8M0. Para filas con K=5120 y al menos 256 elementos, el resultado es bit-idéntico a la combinación de `fused_add_rms_norm` de CUDA más la cuantización UE8M0 en orden column-major, y la activación FP8 resultante es consumida por DeepGEMM. El kernel no cubre la proyección down (K=17408). Se activa mediante las variables de entorno `XIRCUIT_RMS_UE8M0=1` y `XIRCUIT_RMS_UE8M0_PATH`, y requiere un parche para vLLM 0.29.0. Además, el repositorio incluye mediciones de decodificación especulativa con MTP (multi-token prediction) en configuraciones de 3, 4, 5 y 8 tokens, así como variantes DFlash y DSpark.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational`.
- Procesamiento de imagen y texto (image-text-to-text): el modelo acepta entradas visuales junto con prompts de texto.
- Razonamiento y matemáticas: validado con GSM8K en la model card (91,2 % en modo stock, 91,4 % con MTP-4).
- Decodificación especulativa con MTP-4 como configuración de serving recomendada, con tasas de aceptación medidas de 3,60 a 4,29 tokens por paso.
- Compatibilidad con vLLM 0.29.0 y con el ecosistema `transformers`.
- Soporte de tool calling, function calling y agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Serving de chat a gran escala con prefix caching: el modelo mantiene 138,2 tok/s de salida en stock y 148,7 tok/s con MTP-3 sobre 504 peticiones ShareGPT con caché de prefijo activa, lo que lo hace adecuado para cargas conversacionales con prompts repetidos.
- Generación de resúmenes largos con prefill intensivo: en el benchmark arXiv de 1.000 documentos (6.142.812 tokens de prompt, 32 tokens de salida), MTP-4 más el kernel fusionado alcanza 15.258 tok/s de prompt frente a 14.386 tok/s en stock, una mejora del 6 % en throughput de prefill.
- Asistentes sobre documentación técnica y científica: la combinación de contexto largo (no cuantificado en la ficha) y capacidad image-text-to-text permite ingerir figuras y texto de papers, con la ventaja de que el kernel fusionado reduce el coste del prefill en 5,9 s adicionales sobre MTP-4 en el benchmark arXiv.
- Razonamiento matemático en producción: GSM8K con temperatura 0 alcanza 91,2 % en stock y 91,4 % con MTP-4, con paridad estadística (McNemar p = 0,743), por lo que la decodificación especulativa puede activarse sin degradar la precisión en tareas de razonamiento.
- Despliegue de bajo coste por token en GPUs H200: MTP-4 ofrece 964 tok/s frente a 547 tok/s en stock con 256 tokens de salida (1,76×), lo que reduce el coste por token en serving de alta concurrencia.
- Integración en pipelines de CI/CD con vLLM: el parche y las variables de entorno permiten activar el kernel fusionado de forma condicional, de modo que se puede habilitar en entornos de producción sin alterar el comportamiento por defecto del servidor.
- Evaluación comparativa de técnicas de decodificación especulativa: el repositorio incluye `result.json` crudos, IDs de arXiv, puntuaciones GSM8K y el censo de prefill, útiles como referencia reproducible para equipos que investigan MTP frente a DFlash y DSpark.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor, medidos el 16 de noviembre de 2026 en una NVIDIA H200 NVL con vLLM 0.29.0 y tensor parallel 1.

ShareGPT chat, 504 peticiones, prefix cache activa:

| Arm | Wall | Output tok/s | Acceptance | Prefix hit |
|---|---:|---:|---:|---:|
| Stock | 47,6 s | 138,2 | — | 60,3 % |
| MTP-3 | 44,2 s | 148,7 | 3,00 | 16,7 % |
| DFlash, 7 tokens | 46,6 s | 141,1 | 2,99 | 15,8 % |
| DSpark, 8 tokens | 47,7 s | 137,8 | 3,17 | 15,8 % |

256 tokens de salida, mismas 504 conversaciones:

| Arm | Wall | Output tok/s | Acceptance |
|---|---:|---:|---:|
| Stock | 236,0 s | 547 | — |
| MTP-4 | 133,9 s | 964 | 3,60 |
| MTP-5 | 136,9 s | 942 | 3,89 |
| MTP-8 | 163,8 s | 788 | 4,40 |
| DFlash, 7 tokens | 210,5 s | 613 | 2,22 |
| DSpark, 8 tokens | 211,0 s | 611 | 2,68 |

GSM8K, temperatura 0, 1.319 ítems:

| Arm | Strict | Flexible | Wall | Acceptance |
|---|---:|---:|---:|---:|
| Stock | 1.203 / 1.319 (91,2 %) | 1.214 | 89,04 s | — |
| MTP-4 | 1.206 / 1.319 (91,4 %) | 1.214 | 89,03 s | 4,29 |

arXiv 1.000 documentos, 6.142.812 tokens de prompt, 32 tokens de salida, prefix cache desactivada:

| Arm | Reps | Mean wall | Stdev | Prompt tok/s | Acceptance |
|---|---:|---:|---:|---:|---:|
| Stock | 4 | 427,00 s | 0,93 s | 14.386 | — |
| MTP-4 | 4 | 408,50 s | 0,42 s | 15.037 | 3,450 |
| MTP-4 + fused kernel | 3 | 402,59 s | 0,27 s | 15.258 | 3,490 |

Aceleración del kernel fusionado aislado, 100 repeticiones, bit-idéntico a la referencia:

| Rows | Split | Fused | Cold gain |
|---:|---:|---:|---:|
| 8192 | 0,201 ms | 0,110 ms | 45 % |
| 2048 | 0,056 ms | 0,035 ms | 37 % |

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 28 GB solo para pesos, más overhead de activaciones y KV cache. El repositorio ocupa 30,9 GB en disco.
- GPU recomendadas: NVIDIA H200 NVL (configuración medida en la model card). Por tamaño, también cabría en H100 80 GB y A100 80 GB, aunque no se han publicado mediciones en esas tarjetas.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en FP8 sin cuantización adicional; se requeriría una cuantización de menor precisión no documentada en esta ficha.
- Opciones de despliegue: vLLM 0.29.0 con el parche del repositorio y las variables `XIRCUIT_RMS_UE8M0` y `XIRCUIT_RMS_UE8M0_PATH`. La librería declarada es `transformers`, pero las optimizaciones descritas dependen de vLLM. No se documentan opciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: 964 tok/s de salida con MTP-4 frente a 547 tok/s en stock (256 tokens de salida); 15.258 tok/s de prompt con kernel fusionado en prefill de documentos largos; 3.413 tok/s frente a 3.362 tok/s en 64 prompts cortos decodificados a 512 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Qwen3.8-27B-FP8-rms-ue8m0 | 27,78 B | no disponible | Apache 2.0 | safetensors FP8 | Kernel fusionado y MTP-4; mediciones en H200 |
| Qwen/Qwen3.8-27B-FP8 (upstream) | 27,78 B | no disponible | Apache 2.0 | safetensors FP8 | Pesos idénticos; sin kernel ni parche de vLLM |
| Qwen/Qwen3.8-27B (base) | 27,78 B | no disponible | Apache 2.0 | safetensors | Checkpoint original sin cuantizar; referencia de precisión |

La comparación con otras familias de modelos del mismo tamaño (por ejemplo, variantes de 27-32 B de otras series) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Los pesos no han sido modificados respecto al checkpoint upstream; cualquier sesgo o limitación del modelo Qwen3.8-27B original se hereda íntegramente.
- El kernel fusionado no es numéricamente idéntico al camino estándar en todas las configuraciones: el servidor de referencia compila Gemma RMS con un peso fp32, por lo que las generaciones con el hook activo no producen los mismos tokens que el MTP-4 estándar. La model card reporta 482 de 512 secuencias idénticas entre kernel fusionado y MTP-4, y 504 de 512 frente a stock.
- El kernel solo cubre K=5120; la proyección down (K=17408) queda fuera. Además, se registraron 1.447 fallos de puntero y 17.116 caídas a small-batch en las ejecuciones con hook, lo que indica casos no cubiertos por la ruta optimizada.
- El parche depende de vLLM 0.29.0 y no hace nada si no se configuran ambas variables de entorno; no hay garantía de compatibilidad con versiones posteriores.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre los artefactos de kernel ni sobre los resultados de rendimiento en hardware distinto al H200 NVL.
- No se dispone de información sobre idiomas soportados, longitud de contexto, sesgos conocidos ni tasas de alucinación del modelo base en esta ficha.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de las mediciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lminciullo/Qwen3.8-27B-FP8-rms-ue8m0
- Checkpoint upstream FP8: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Model card upstream incluida en el repo: `README_UPSTREAM.md`
- Resultados crudos y censo de prefill: directorio `results/` del repositorio
- Código del kernel y parche para vLLM 0.29.0: directorio `kernel/` del repositorio

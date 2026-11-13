# midagedev/K-EXAONE-2.0-750B-A37B-GGUF

## Resumen

K-EXAONE-2.0-750B-A37B-GGUF es una cuantización de bajos bits del modelo coreano LGAI-EXAONE/K-EXAONE-2.0-750B-A37B, publicada por el usuario midagedev. Se trata de un transformer de tipo mezcla de expertos (MoE) con 749.357.484.800 parámetros totales y 37B activos por token, distribuidos en 78 capas con 256 expertos enrutados de los que se seleccionan 8 por token. El modelo base está desarrollado por LG AI Research (EXAONE) y su licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta publicación no está en el modelo en sí, sino en el empaquetado: es un GGUF de 280,15 GB repartido en 29 shards que, según el autor, puede ejecutarse en una sola estación de trabajo con una GPU de 48 GB y 256 GB de RAM de sistema, gracias al runtime bloomery. Para conseguirlo se aplica una mezcla agresiva de cuantizaciones: IQ2_XXS para las proyecciones gate y up de los expertos enrutados, Q4_K para las proyecciones down y Q8_0 para atención, FFN densa, expertos compartidos, embeddings y cabeza de salida.

El contexto de esta ficha es importante: la información disponible proviene exclusivamente de la model card del autor de la cuantización, no del modelo original de LG AI Research. Los benchmarks publicados son ejecuciones propias del cuantizador contra DeepSeek V4.1 Flash Q3_K_M, no cifras oficiales del modelo base. La cuantización IQ2_XXS introduce un error RMS relativo del 34,4-34,7 % en los tensores de los expertos, lo que degrada el rendimiento de forma medible respecto al checkpoint FP8 original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (arquitectura GGUF `exaone-moe`), 78 capas, 256 expertos enrutados con 8 activos por token, capa MTP (`nextn.*`) incluida |
| Parámetros totales | 749.357.484.800 (749,36 B) |
| Parámetros activos | 37 B (aproximado, según denominación del modelo) |
| Longitud de contexto | Hasta 262.144 tokens en el servidor de referencia (usado con `--ctx-size 262144` en pruebas de prompt); el ejemplo de arranque usa 8192 |
| Tipos de cuantización | Mezcla por tensor: IQ2_XXS (expertos enrutados gate/up), Q4_K (expertos enrutados down), Q8_0 (atención, FFN densa, expertos compartidos, embeddings, cabeza, capa MTP), F32 (norms, router, correction bias) |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF, 29 shards, 280,15 GB totales; incluye imatrix (`k-exaone-750b.imatrix.gguf`) y plantilla de chat en la cabecera |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con 78 capas, 256 expertos enrutados y 8 expertos seleccionados por token, más expertos compartidos y una FFN densa. Incluye una capa de multi-token prediction (MTP) bajo el prefijo `nextn.*`, cuantizada en Q8_0. El checkpoint original del que deriva esta cuantización es el FP8 oficial de LGAI-EXAONE, y la cuantización fue realizada por el cuantizador propio de bloomery en una sola pasada sobre el checkpoint FP8, con un tiempo de ejecución de 8.296 segundos con el checkpoint en disco duro.

No se dispone de información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) en la información proporcionada. Lo que sí se detalla es el proceso de cuantización: la imatrix se generó ejecutando el cuantizado bootstrap Q4_K sobre 32 fragmentos de 2.048 tokens extraídos de Wikipedia (`wikimedia/wikipedia`, `20231101.ko` y luego `20231101.en`, CC BY-SA 4.0), de modo que a 65.536 tokens los fragmentos caen en la parte coreana. Los tensores IQ2_XXS se cuantizaron en la GPU; el resto, con las reglas del host. El error RMS relativo medido es de 0,54-0,58 % para Q8_0, 6,9-7,2 % para Q4_K y 34,4-34,7 % para IQ2_XXS, con un peor bloque 128×128 del 38,7 % en este último caso.

## Capacidades

- Generación de texto conversacional en coreano e inglés, con plantilla de chat incluida en la cabecera del GGUF.
- Modo de razonamiento (thinking) activado por defecto; se puede desactivar pasando `"chat_template_kwargs": {"enable_thinking": false}` para obtener una respuesta directa.
- Razonamiento de múltiples pasos y respuesta a preguntas de opción múltiple (evaluado en KMMLU y MMLU-Pro).
- Generación de código (evaluado en HumanEval+ con 88,4 % de acierto en esta cuantización).
- Capacidad multilingüe limitada a coreano e inglés según los metadatos del modelo.
- Compatibilidad con la API de llama-server (`/v1/chat/completions`, `/completion`, `/v1/models`).
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión o audio en la documentación proporcionada.

## Casos de uso

- Despliegue de un modelo de 750B en una sola estación de trabajo: con una GPU de 48 GB y 256 GB de RAM de sistema, el plan del autor coloca el tronco denso y 2.268 de los 19.456 expertos enrutados en la tarjeta, y los 17.188 restantes (233 GB) en RAM del host. Es el caso de uso central de esta publicación: inferencia de gran modelo MoE sin clúster multi-GPU.
- Asistencia conversacional en coreano e inglés: el modelo incluye plantilla de chat y modo thinking, adecuado para atención al cliente o asistentes internos en entornos donde el coreano es idioma principal, con la ventaja de que la licencia Apache-2.0 permite uso comercial.
- Generación de código en pipelines internos: con 88,4 % en HumanEval+ (thinking off, temperatura 0) en esta cuantización, es viable para autocompletado, generación de tests o revisión de código en equipos que ya dispongan del hardware descrito.
- Evaluación e investigación de cuantización extrema: el paquete incluye la imatrix y las mediciones de error RMS por tipo de tensor, lo que lo convierte en un caso de estudio reproducible para investigar el impacto de IQ2_XXS en modelos MoE de gran tamaño.
- Procesamiento de documentos largos en coreano: con contexto configurable hasta 262.144 tokens en el servidor de referencia, permite resumir o extraer información de corpus extensos en coreano, aunque el throughput de prompt (42-48 tok/s) limita el volumen.
- Prototipado de aplicaciones sobre API compatible con llama-server: al exponer `/v1/chat/completions` y `/v1/models`, se puede integrar en herramientas que ya hablan el protocolo OpenAI sin adaptadores adicionales.
- Inferencia por lotes de baja concurrencia: con 10,4-11,0 tok/s de decodificación en las condiciones medidas, encaja en escenarios de generación offline o semi-offline donde la latencia no es crítica.

## Benchmarks y rendimiento

Los datos disponibles son ejecuciones propias del autor de la cuantización contra DeepSeek V4.1 Flash Q3_K_M, con thinking desactivado, temperatura 0 y preguntas de opción múltiple con respuesta de una letra. Los corchetes son intervalos de Wilson al 95 %.

| Tarea | Esta cuantización | DeepSeek V4.1 Flash Q3_K_M | Diferencia pareada |
|---|---:|---:|---:|
| KMMLU, 450 ítems | 61,6 % [57,0; 65,9] | 72,2 % [67,9; 76,2] | −10,7 (McNemar p < 0,001) |
| MMLU-Pro, 420 ítems | 50,7 % [45,9; 55,5] | 73,3 % [68,9; 77,3] | −22,6 (McNemar p < 0,001) |
| HumanEval+, 164 ítems | 88,4 % [82,6; 92,5] | 92,1 % [86,9; 95,3] | no significativa (McNemar p = 0,18) |

El modelo base publica 83,5 en MMLU-Pro con thinking activado; el autor no ha medido puntuaciones con thinking en esta cuantización ni ha aislado cuánto de la brecha se debe a los expertos IQ2_XXS.

Rendimiento de inferencia medido en la estación de referencia (RTX A6000 48 GB, Threadripper PRO 5975WX, DDR4-3200 de 8 canales, 251 GiB de RAM, shards en NVMe PCIe 4):

| Métrica | Tasa | Condiciones |
|---|---:|---|
| Decodificación | 10,4-11,0 tok/s | 3 peticiones de chat, 194-256 tokens generados, prompts de 24-32 ids, `--ctx-size 8192`, temperatura 0 |
| Prompt | 42-48 tok/s | prompts de 64-1.077 ids, `--ctx-size 262144` |

El autor advierte que estas cifras son indicativas y no se tomaron bajo el sistema de medición de bloomery.

## Requisitos de hardware

- VRAM: una GPU de 48 GB es el mínimo probado por el autor; el plan coloca el tronco denso y 2.268 de los 19.456 expertos enrutados en la tarjeta.
- RAM del host: 256 GB es el suelo según el autor; la carga necesita unos 263 GB de page cache del host. Los 17.188 expertos restantes (233 GB) se sirven desde RAM.
- Almacenamiento: 280,15 GB de shards; el autor los tiene en NVMe PCIe 4.
- GPU recomendadas: RTX A6000 48 GB es la única configuración probada. El autor indica explícitamente que no ha probado una tarjeta de 24 GB ni dos tarjetas.
- Consumer GPU: no hay evidencia de que quepa en GPU de consumo; el requisito de 48 GB de VRAM más 256 GB de RAM descarta configuraciones domésticas habituales.
- Despliegue: bloomery 0.3.14 o posterior (primera versión que sirve EXAONE; no publicada en el momento de la subida), con API compatible con llama-server. llama.cpp funciona solo en el commit 7bcbc04fb y requiere un parche para las listas de sliding-window por capa, clamp y arquitectura de esta arquitectura; con el parche, el backend de CPU lee el fichero y en 35 pruebas de opción múltiple coincidió con bloomery en el primer token de respuesta 33 veces (las 2 diferencias fueron casi empates).
- Latencia y throughput: ver tabla de benchmarks; 10,4-11,0 tok/s de decodificación y 42-48 tok/s de prompt en la configuración de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| K-EXAONE-2.0-750B-A37B-GGUF (esta ficha) | 749,36 B | 37 B | hasta 262.144 | Apache-2.0 | GGUF (29 shards, 280,15 GB) | Cuantización mixta IQ2_XXS/Q4_K/Q8_0; 61,6 % KMMLU, 50,7 % MMLU-Pro, 88,4 % HumanEval+ (thinking off) |
| LGAI-EXAONE/K-EXAONE-2.0-750B-A37B | 749,36 B | 37 B | no disponible en la información | Apache-2.0 | safetensors | Modelo base original; publica 83,5 en MMLU-Pro con thinking |
| LGAI-EXAONE/K-EXAONE-2.0-750B-A37B-FP8 | 749,36 B | 37 B | no disponible en la información | Apache-2.0 | FP8 | Checkpoint del que deriva esta cuantización |
| DeepSeek V4.1 Flash Q3_K_M | no disponible | no disponible | no disponible | no disponible | GGUF Q3_K_M | Referencia usada por el autor: 72,2 % KMMLU, 73,3 % MMLU-Pro, 92,1 % HumanEval+ |

No se dispone de datos de otros modelos comparables de tamaño y arquitectura similares en la información proporcionada.

## Limitaciones y advertencias

- La cuantización IQ2_XXS de los expertos enrutados introduce un error RMS relativo del 34,4-34,7 % (peor bloque 128×128: 38,7 %), lo que degrada el rendimiento respecto al checkpoint FP8; el autor no ha aislado cuánto de la brecha en benchmarks se debe a esto.
- Los benchmarks publicados usan thinking desactivado, temperatura 0 y respuestas de una letra, condiciones que favorecen respuestas cortas y no reflejan los puntos fuertes del modelo; no hay mediciones con thinking activado.
- Sesgo de protocolo en opción múltiple: con thinking off y respuesta de una letra, el modelo tiende a la última opción cuando duda; nombrar el rango de letras ("A to J") justo antes de la respuesta intensifica este sesgo. El autor lo atribuye al modelo y al prompt.
- El runtime recomendado (bloomery 0.3.14) no estaba publicado en el momento de la subida; llama.cpp solo está probado en un commit concreto y con parche, sin garantías en otras versiones.
- El requisito de hardware (48 GB de VRAM más 256 GB de RAM, con 263 GB de page cache) limita el despliegue a estaciones de trabajo de gama alta; no se ha probado en GPU de 24 GB ni en configuraciones multi-GPU.
- Idiomas limitados a coreano e inglés según los metadatos; no se dispone de información sobre rendimiento en castellano.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos, agravado por la cuantización agresiva.
- Licencia Apache-2.0 en el modelo base y en esta cuantización, con los ficheros `LICENSE` y `NOTICE` incluidos sin cambios; no se indican restricciones adicionales para uso comercial.
- Throughput bajo (10,4-11,0 tok/s de decodificación) que desaconseja escenarios de alta concurrencia o latencia estricta.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/midagedev/K-EXAONE-2.0-750B-A37B-GGUF
- Modelo base: https://huggingface.co/LGAI-EXAONE/K-EXAONE-2.0-750B-A37B
- Checkpoint FP8 de origen: https://huggingface.co/LGAI-EXAONE/K-EXAONE-2.0-750B-A37B-FP8
- Runtime bloomery: https://github.com/midagedev/bloomery
- Dataset de la imatrix: `wikimedia/wikipedia` (`20231101.ko`, `20231101.en`, CC BY-SA 4.0)

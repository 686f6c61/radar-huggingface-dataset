# axteam/Qwen3.5-0.8B-FP8-dynamic

## Resumen

`axteam/Qwen3.5-0.8B-FP8-dynamic` es una cuantizacion post-entrenamiento (PTQ) en FP8 del modelo multimodal `Qwen/Qwen3.5-0.8B` de Alibaba Cloud, publicada por el usuario axteam con el objetivo declarado de servir el modelo de forma eficiente en vLLM. No es un modelo nuevo: es un derivado que conserva tokenizador, `chat_template` y `generation_config` del original y anade un bloque `quantization_config` que lo hace consumible por el runtime de vLLM mediante el formato `compressed-tensors` `FP8_DYNAMIC` (W8A8).

El modelo base pertenece a la familia Qwen3.5, la mas reciente de Alibaba Cloud, y es el miembro mas pequeno de la serie (873 millones de parametros reales segun los pesos safetensors). Su arquitectura es hibrida —combinacion de atencion lineal tipo gated delta networks y atencion completa—, densa, con torre de vision y una cabeza MTP (multi-token prediction) que lo habilita como modelo borrador en decodificacion especulativa. Segun la documentacion de vLLM Recipes, mantiene la ventana de contexto de 262 000 tokens de la familia, lo que resulta poco habitual en un modelo de menos de mil millones de parametros.

La relevancia practica de esta publicacion es doble: por un lado, reduce el peso en disco a aproximadamente 1,2 GB y permite servir el modelo en 8 bits con perdida de fidelidad medida y acotada (+1,6 % de perplejidad respecto al BF16); por otro, demuestra un pipeline de cuantizacion FP8 dinamica sin calibracion aplicado a una arquitectura hibrida con vision, un caso donde la seleccion de capas a mantener en BF16 es critica para no degradar la calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (atencion lineal tipo gated delta networks + atencion completa), densa, multimodal (vision), con cabeza MTP |
| Parametros totales | 873 438 784 (873 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens (heredada del modelo base Qwen3.5-0.8B, segun vLLM Recipes) |
| Tipos de cuantizacion | FP8 dinamica W8A8: pesos FP8 E4M3 con escala por canal de salida, activaciones FP8 dinamicas por token; formato `compressed-tensors` `FP8_DYNAMIC` |
| Idiomas soportados | no disponible en la model card; el conjunto de evaluacion interno es ingles/coreano y la serie Qwen3.5 se describe publicamente como multilingue |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors con metadatos `compressed-tensors`; repo de 1,3 GB, aproximadamente 1,2 GB en disco |

Otros datos de configuracion: pipeline `image-text-to-text`, libreria `transformers`, etiqueta `endpoints_compatible` y `region:us` en HuggingFace. Fecha de creacion del repositorio: 29 de octubre de 2026.

## Arquitectura y entrenamiento

El modelo base combina dos mecanismos de atencion en una misma pila: capas de atencion lineal basadas en gated delta networks (con componentes no lineales del tipo SSM, identificados en el checkpoint como `linear_attn.conv1d`, `A_log` y `dt_bias`) y capas de atencion completa. Esta mezcla es la que permite sostener una ventana de 262 000 tokens con un coste computacional subcuadratico en la mayoria de las capas. Sobre esa pila se anaden una torre de vision con proyector (`model.visual.*`) para entrada de imagenes y una cabeza de prediccion multi-token (`mtp.*`), que permite al modelo proponer varios tokens por paso y actuar como borrador en decodificacion especulativa.

Esta publicacion concreta no entrena nada: es cuantizacion post-entrenamiento sin recalibracion (calibration-free), con escalas estaticas de pesos calculadas de forma data-free. La decision tecnica mas relevante es que se mantienen en BF16 la torre de vision y su proyector, la cabeza MTP, todas las RMSNorm, los embeddings de tokens, el LM head y las partes no lineales del bloque SSM. Es decir, se cuantiza unicamente el cuerpo lineal del transformer, dejando en precision original las componentes mas sensibles a la cuantizacion (normalizaciones, proyecciones de salida y todo el camino multimodal). No se especifica en la informacion disponible el volumen de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte explicito de plantilla de chat identica a la del modelo original.
- Razonamiento e instrucciones: la serie Qwen3.5 se presenta publicamente como una mejora en razonamiento y seguimiento de instrucciones respecto a Qwen3.
- Capacidad multimodal de entrada: el pipeline es `image-text-to-text` y la torre de vision se conserva en BF16, por lo que la entrada de imagenes mantiene la precision del original.
- Contexto largo: hasta 262 000 tokens teoricos, adecuado para documentos extensos, historiales largos o bases de codigo medianas.
- Multilingue: el modelo base se describe como multilingue en fuentes publicas, aunque no se detalla la lista oficial de idiomas; el conjunto de evaluacion interno del autor mezcla ingles y coreano.
- Cabeza MTP: habilita el uso del modelo como draft model en decodificacion especulativa junto a checkpoints mayores de Qwen3.5.
- Despliegue en vLLM con kernels FP8 nativos, incluida la etiqueta `endpoints_compatible` de HuggingFace para endpoints gestionados.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, audio o modos de pensamiento explicito.

## Casos de uso

- Servicio de chat en produccion con vLLM: arranque con `vllm serve axteam/Qwen3.5-0.8B-FP8-dynamic` y muestreo recomendado por Qwen (`temperature=0.7`, `top_p=0.8`, `top_k=20`). El formato A8/W8 con kernel FP8 reduce el coste por token frente al BF16 en GPUs Hopper o Ada, manteniendo el tokenizador y la plantilla originales.
- Modelo borrador para decodificacion especulativa: su tamano (873 M) y su cabeza MTP lo hacen apropiado como draft de checkpoints mayores de Qwen3.5, acelerando la generacion del modelo grande sin cambiar la salida final.
- Procesamiento de documentos largos en un solo pase: con 262 000 tokens de contexto se pueden ingerir contratos, informes o transcripciones completas sin troceado ni recuperacion externa, algo viable en memoria por el reducido tamano del modelo.
- Extraccion de informacion de imagenes en pipelines internos: al conservar la torre de vision en BF16, sirve para tareas de OCR asistido, descripcion de capturas o clasificacion de documentos escaneados donde no se requiere un modelo de gran escala.
- Despliegue en el borde o en hardware limitado: los aproximadamente 1,2 GB de pesos permiten ejecucion en GPUs de gama media y en plataformas integradas; Qualcomm AI Hub distribuye la variante Qwen3.5-0.8B para despliegue en dispositivos, lo que da idea del perfil de recursos objetivo.
- Prototipado rapido y evaluacion de la familia Qwen3.5: al ser una cuantizacion fiel (93,3 % de coincidencia top-1 con el BF16), sirve para validar prompts, plantillas y flujos de agente antes de escalar a modelos mayores de la misma familia, con la ventaja de un consumo de VRAM minimo.
- Generacion de texto a gran escala con coste contenido: summarizacion, clasificacion y reescritura por lotes, donde el throughput importa mas que el rendimiento en tareas de razonamiento complejo.

## Benchmarks y rendimiento

El autor no publica resultados de tareas estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Lo que si se publica es una medicion de fidelidad respecto al modelo original en BF16, sobre un conjunto interno mixto ingles/coreano de 100 prompts, con respuestas greedy del BF16 puntuadas bajo cada build y el mismo arnes de evaluacion para todas las filas:

| Metrica | Este modelo (FP8 dynamic) | Original BF16 | Diferencia |
|---|---|---|---|
| Perplejidad (menor es mejor) | 2,0506 | 2,0174 | +1,6 % |
| Coincidencia top-1 con el siguiente token | 93,3 % | 98,7 % | -5,4 puntos |

Estas cifras miden fidelidad al modelo base, no rendimiento absoluto en tareas. No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan del orden de 0,87 GB (873 M de parametros a 8 bits) y el total en disco es de aproximadamente 1,2 GB; conviene reservar entre 2 y 3 GB de VRAM para pesos, activaciones y cache KV en funcion de la longitud de contexto. Los componentes en BF16 (vision, embeddings, LM head, MTP) elevan ligeramente esa cifra.
- Cabe en GPU de consumo: si, en cualquier GPU con soporte de FP8 nativo; el modelo es lo bastante pequeno para tarjetas de 8 GB o incluso menos, aunque el contexto de 262 000 tokens exige calcular el presupuesto de cache KV.
- GPUs recomendadas: arquitecturas con FP8 en hardware (Hopper H100/H200, Ada Lovelace L40S, RTX 4090 y posteriores) para aprovechar los kernels de vLLM. En GPUs sin FP8 nativo (Ampere A100, por ejemplo) los pesos se pueden de-cuantizar, pero se pierde la ventaja de rendimiento.
- Opciones de despliegue: vLLM es la ruta soportada y declarada por el autor (`vllm serve axteam/Qwen3.5-0.8B-FP8-dynamic`). Tambien es cargable con `transformers` junto con la libreria `compressed-tensors`, ya que el repo incluye la etiqueta `library_name: transformers`.
- Formatos no disponibles: no se distribuyen pesos GGUF ni cuantizaciones de 4 bits, por lo que llama.cpp y Ollama no son rutas directas con este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, el autor justifica la publicacion por la eficiencia de servicio en vLLM y el modelo base se ofrece como draft para decodificacion especulativa, lo que sugiere un perfil de baja latencia por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| axteam/Qwen3.5-0.8B-FP8-dynamic | 873 M | 262 000 tokens (heredado del base) | safetensors + compressed-tensors FP8_DYNAMIC (W8A8) | Apache 2.0 | Cuantizacion PTQ para vLLM; perplejidad +1,6 % sobre el BF16 |
| Qwen/Qwen3.5-0.8B (original BF16) | 873 M | 262 000 tokens | safetensors BF16 | Apache 2.0 | Referencia de calidad; mayor huella de memoria (el repo FP8 es de 1,3 GB frente a los aproximadamente 1,7 GB que implicarian los pesos BF16) |
| Qwen/Qwen3.5-2B | no disponible en la informacion | 262 000 tokens (misma familia, segun vLLM Recipes) | no disponible | Apache 2.0 (serie Qwen3.5) | Siguiente escalon de la familia; mas capacidad a cambio de mayor huella y menor idoneidad para el borde |

No se dispone de datos de benchmarks de tareas para ninguno de los modelos de la comparativa en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- Perdida de fidelidad medible: 93,3 % de coincidencia top-1 frente al 98,7 % del BF16, y +1,6 % de perplejidad. En tareas de razonamiento sensible o generacion de codigo conviene validar contra el modelo original antes de desplegar.
- La evaluacion se hizo sobre 100 prompts de un conjunto interno mixto ingles/coreano; no es una evaluacion estandar ni reproducible externamente, y no cubre tareas multimodales.
- Riesgo de alucinacion: inherente a un modelo de 873 M de parametros; la ventana de contexto de 262 000 tokens no garantiza el uso correcto de informacion situada en posiciones lejanas.
- Idiomas: no hay lista oficial de idiomas soportados en la model card; el soporte real fuera de ingles y coreano no esta verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los derechos sobre pesos originales, tokenizador y `chat_template` pertenecen al equipo de Qwen; conviene conservar los avisos de atribucion.
- Dependencia de hardware: los beneficios de FP8 requieren GPUs con soporte nativo; en otras arquitecturas el modelo funcionara de forma suboptima o con de-cuantizacion.
- Portabilidad limitada: al ser `compressed-tensors` FP8_DYNAMIC, la ruta practica es vLLM; no hay GGUF ni soporte documentado en llama.cpp u Ollama.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: codigo y pesos sin validacion por parte de la comunidad, por lo que se recomienda verificar la integridad de los ficheros antes de usarlo en produccion.
- El modelo conserva el pipeline `image-text-to-text` del base, pero el autor no documenta el comportamiento del camino multimodal tras la cuantizacion; solo indica que la torre de vision queda en BF16.
- No se documentan capacidades de tool calling, function calling ni modos de pensamiento; no asumir su disponibilidad sin probarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/Qwen3.5-0.8B-FP8-dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- vLLM Recipes para Qwen3.5-0.8B: https://recipes.vllm.ai/Qwen/Qwen3.5-0.8B
- Qualcomm AI Hub, Qwen3.5-0.8B: https://aihub.qualcomm.com/models/qwen3_5_0_8b
- Guia sobre la serie Qwen 3.5 pequena (Better Stack): https://betterstack.com/community/guides/ai/qwen-35/

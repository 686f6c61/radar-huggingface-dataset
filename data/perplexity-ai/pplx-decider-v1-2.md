# perplexity-ai/pplx-decider-v1.2

## Resumen

pplx-decider-v1.2 es un modelo de decisión (decision model) desarrollado por Perplexity AI, afinado a partir del backbone Qwen/Qwen3.8-27B. No es un modelo generativo de propósito general, sino un clasificador especializado que, dado un estado (state) —texto o imágenes— y una o varias preguntas estructuradas, devuelve respuestas tipadas: elección entre opciones (`choice`), probabilidad de un booleano (`noul`) o puntuación ordinal (`score`). Se distribuye con `pipeline_tag: text-classification` y licencia Apache 2.0.

La innovación principal de la versión 1.2 respecto a v1.1 es el formato de petición conjunta: en lugar de responder una pregunta por forward pass leyendo el último token, el modelo procesa el estado seguido de todas las preguntas en una única secuencia, con un token marcador tras las opciones de cada pregunta que sirve de punto de lectura. Esto reduce el coste de responder N preguntas al de responder una y permite que las preguntas se informen mutuamente. El checkpoint también incorpora capacidad multimodal (texto e imágenes de hasta 1,6 MP) y se ha construido mediante model souping (promediado de pesos) de varias ejecuciones de entrenamiento.

Con 26.085.330.160 parámetros (~26,1 B) y pesos en BF16 que ocupan aproximadamente 52 GiB, está pensado para despliegue en GPU de centro de datos, no para hardware de consumo. Su relevancia actual radica en que formaliza el enrutamiento y la clasificación de decisiones como una tarea nativa del modelo, con salidas calibradas (probabilidades y confianza por respuesta) en lugar de generación de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen3.8-27B), con cabecera de lectura por token marcador para clasificación |
| Parametros totales | 26.085.330.160 (~26,1 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card menciona un límite de longitud que obliga a dividir peticiones, sin cifra publicada) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería pytorch, código custom en `source/src`) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen/Qwen3.8-27B y se afina como clasificador de decisiones. La arquitectura de inferencia es la clave: el estado y todas las preguntas de una petición se concatenan en una sola secuencia; tras las opciones de cada pregunta se inserta un token marcador, y la lectura se realiza en ese marcador (no en el último token de la secuencia). Cada pregunta obtiene así su propia distribución de probabilidad sobre opciones, con soporte para entre 1 y 255 opciones en `choice`, entre 2 y 255 niveles en `score`, y una probabilidad escalar en `noul`. El modelo acepta además imágenes (hasta 1,6 MP) junto al estado textual.

En cuanto a datos, la model card indica una reconfiguración sustancial del conjunto de entrenamiento respecto a v1.1: se incorporan los splits oficiales de entrenamiento de varios benchmarks del Decision Index (decontaminados contra los conjuntos de test) para que las comparaciones en el board sean justas, junto con una gran cantidad de datos de decisión adicionales. El seguimiento se hizo midiendo regresiones en cada benchmark y evaluando también en tareas de decisión retenidas y en benchmarks independientes. El checkpoint final combina varias ejecuciones mediante model souping (promediado de pesos), seleccionado como mejor compromiso global y no por un único benchmark. No se detallan el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de decisiones con salida tipada: `choice` (selección entre opciones con probabilidades y confianza), `noul` (probabilidad de verdadero/falso) y `score` (puntuación ordinal con índice esperado, probabilidades y leyenda).
- Procesamiento de múltiples preguntas sobre un mismo estado en una sola secuencia, con coste cercano al de una sola pregunta y posible influencia mutua entre preguntas.
- Entrada multimodal: texto e imágenes de hasta 1,6 MP.
- Aceptación de estados no textuales (diccionarios, listas) serializados como JSON.
- Salidas calibradas con `probabilities` y `confidence` por pregunta, aptas para umbrales y enrutamiento automático.
- Procesamiento por lotes: `decide` acepta una lista de peticiones y devuelve las respuestas en el mismo orden.
- No se documentan tool calling, function calling, modo agente ni modo thinking; el modelo es un clasificador, no un generador.

## Casos de uso

- Enrutamiento de tickets de soporte: con una pregunta `choice` sobre equipos (billing, support, sales) y preguntas auxiliares `noul`/`score` (urgencia, frustración) en la misma petición, el modelo clasifica el ticket en una sola pasada y devuelve probabilidades para aplicar umbrales de escalado.
- Moderación y triaje de contenido: preguntas `noul` encadenadas (¿es spam?, ¿es abusivo?, ¿requiere revisión humana?) sobre el mismo estado, aprovechando que agrupar preguntas que son facetas de una misma decisión reduce coste frente a peticiones separadas.
- Clasificación de documentos con imágenes: al soportar hasta 1,6 MP, puede decidir sobre capturas, formularios escaneados o gráficos junto al texto que los acompaña.
- Puntuación de calidad o severidad: con preguntas `score` de 2 a 255 niveles se obtienen índices esperados y distribuciones completas, útiles para priorización y para analítica agregada.
- Extracción de señales estructuradas de conversaciones: dado el historial como `state`, responder varias preguntas de negocio (intención, sentimiento, riesgo de churn) en una única llamada con salidas calibradas.
- Evaluación automática de respuestas de otros modelos: usar `choice` o `score` para puntuar salidas generadas por LLM en pipelines de evaluación, con la ventaja de que varias rúbricas comparten una sola pasada.
- Enrutamiento en pipelines de agentes: decidir qué herramienta o subagente debe atender una petición, usando `choice` con descripciones por opción y el campo `confidence` para derivar a revisión humana cuando la confianza es baja.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre Decision Index 0.3 (público):

| Decision Index 0.3 (public) | pplx-decider-v1.1-27b | v1.2, peticiones conjuntas | v1.2, una pregunta por petición |
|---|---:|---:|---:|
| Knowledge | 51,8 | **56,3** | 55,3 |
| Language | 67,5 | **72,8** | 71,9 |
| Retrieval | 61,2 | **68,4** | 68,1 |
| Tools | 79,1 | 84,4 | **85,4** |
| Arts | 47,3 | **56,2** | **56,2** |
| **Overall Decision Index** | 62,30 | **68,09** | 67,75 |

| Vision Decision Index 0.3 (public, imágenes hasta 1,6 MP) | pplx-decider-v1.1-27b | pplx-decider-v1.2 |
|---|---:|---:|
| **Overall** | 73,22 | **77,43** |

La puntuación global usa la ponderación de la suite, no la media simple de categorías. Las dos columnas de v1.2 solo difieren en los 9 benchmarks cuyas peticiones llevan varias preguntas; en los otros 28 los resultados son idénticos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 52 GiB solo para pesos en BF16, más memoria de trabajo; se recomienda una GPU con margen holgado sobre esa cifra.
- GPU recomendadas: A100 80 GB, H100 80 GB o equivalentes con al menos ~64 GB de memoria para operar con comodidad.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en tarjetas de 48 GB en BF16; no se documentan cuantizaciones que lo reduzcan.
- Despliegue: la model card indica Python 3.12+, CUDA y el paquete propio instalable con `pip install ./source` (o `pip install "./source[fast]"` con `requirements-fast.txt`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-decider-v1.2 | ~26,1 B | no disponible | Clasificador de decisiones multimodal con salidas tipadas | Apache 2.0 | Hugging Face (repo privado con acceso por token) |
| pplx-decider-v1.1-27b | ~27 B (según nombre) | no disponible | Versión anterior, una pregunta por forward pass | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B | ~27 B (según nombre) | no disponible | LLM generativo base | no disponible | Hugging Face |

No se dispone de datos de benchmarks de terceros para establecer comparaciones cuantitativas más allá de las publicadas frente a v1.1.

## Limitaciones y advertencias

- El repositorio es privado: requiere autenticación con un token de Hugging Face con acceso; no es descargable de forma anónima pese a la licencia Apache 2.0.
- El modelo es un clasificador, no un generador: no produce texto libre, código ni razonamiento encadenado; usarlo fuera de su esquema de peticiones no es viable.
- Las peticiones que superan el límite de longitud se dividen, lo que puede alterar la coherencia entre preguntas; la cifra exacta del límite no está publicada.
- Agrupar preguntas ayuda cuando son facetas de una misma decisión y perjudica cuando son candidatos competidores; la model card advierte explícitamente sobre este efecto y los benchmarks lo reflejan (Tools baja de 85,4 a 84,4 con peticiones conjuntas).
- Parte del entrenamiento incluye splits oficiales de benchmarks del Decision Index (decontaminados contra test), lo que puede favorecer el rendimiento en ese board frente a tareas fuera de él.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; al ser clasificación con probabilidades, el riesgo principal es la mala calibración en dominios alejados del entrenamiento.
- No se publican requisitos de cuantización ni soporte para frameworks de serving estándar, lo que limita opciones de despliegue eficiente.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/perplexity-ai/pplx-decider-v1.2
- Versión anterior: https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B

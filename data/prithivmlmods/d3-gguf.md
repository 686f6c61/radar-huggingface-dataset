# prithivMLmods/d3-GGUF

## Resumen

d3-GGUF es la versión cuantizada en formato GGUF de d3, un modelo multimodal de decisión de 26,09 mil millones de parámetros desarrollado por el equipo de vLLM Semantic Router. Se construye sobre Qwen3.8-27B e incorpora un codificador visual de 0,46 mil millones de parámetros, lo que le permite procesar entradas de texto o JSON, opcionalmente acompañadas de varias imágenes y vídeos, y responder en una sola llamada a preguntas de tipo elección múltiple, sí/no y puntuación. A diferencia de un modelo generativo convencional, d3 no produce texto libre: devuelve una probabilidad para cada opción planteada, actuando como un clasificador y enrutador de decisiones.

El modelo pertenece a la familia Decision 3.0 y es el de mayor tamaño de la misma. Su relevancia actual radica en que está diseñado para tareas de enrutamiento y clasificación de baja latencia en producción, con soporte nativo tanto en `transformers` como en vLLM (builds nocturnos, mediante `vllm serve` y el endpoint `/v1/systemone`) y en llama.cpp a través del endpoint `v1/systemone`. Según la model card, encabeza el ranking de texto del Jev Decision Index 0.3.2 con 66,3 puntos y el ranking de visión con 71,3.

Esta ficha cubre específicamente la variante GGUF publicada por prithivMLmods, que facilita el despliegue en entornos con llama.cpp, incluidos equipos de consumo, mediante cuantizaciones desde Q3_K_L hasta BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.8-27B) con codificador visual de 0,46B |
| Parametros totales | 26.895.998.464 (~26,09B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q4_K_M, Q5_K_M, Q6_K, mmproj-bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

d3 es un modelo transformer multimodal construido sobre Qwen3.8-27B, al que se añade un codificador visual de 0,46B parámetros y un proyector multimodal (publicado como `d3.mmproj-bf16.gguf`, de 931 MB en BF16). El modelo acepta como entrada un estado (`state`) en texto o JSON, junto con cero o varias imágenes y vídeos, y emite respuestas estructuradas a preguntas de tres tipos: `choice` (elección entre criterios con etiqueta), `noul` (sí/no expresado como probabilidad) y `score` (puntuación sobre una escala ordinal con leyenda). No genera texto: la salida es exclusivamente probabilística.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Sí se documenta que el modelo se integra en el ecosistema vLLM Semantic Router y que su modo Engine con batching alcanza hasta 27 peticiones de texto de una sola pregunta por segundo, 1,5 veces el rendimiento de `AutoModel`. La innovación principal es el paradigma de "decisión" frente a la generación: el modelo responde preguntas cerradas con distribuciones de probabilidad calibradas, lo que lo hace adecuado para enrutamiento y clasificación deterministas.

## Capacidades

- Clasificación y enrutamiento zero-shot mediante preguntas de elección múltiple (`choice`) con probabilidades por opción.
- Respuestas booleanas probabilísticas (`noul`) para preguntas sí/no.
- Puntuación ordinal (`score`) sobre escalas definidas por el usuario, con leyenda y distribución de probabilidad.
- Procesamiento multimodal: acepta varias imágenes y vídeos junto con el estado textual.
- Entrada estructurada en JSON o texto plano.
- Salida estructurada en JSON con probabilidades, confianza y recuento de tokens de entrada/salida.
- Soporte de inferencia por lotes (batching) en modo Engine de vLLM Semantic Router.
- Integración con tooling de despliegue: llama.cpp (`v1/systemone`), vLLM (`/v1/systemone`) y `transformers` (`AutoModel` o pipeline).
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el mensaje del cliente como `state` y devuelve la probabilidad de que corresponda a facturación, envíos o soporte técnico, permitiendo derivar automáticamente cada caso al equipo adecuado con una sola llamada y sin generación de texto.
- Moderación y triaje de contenido: clasificación de mensajes según criterios definidos por el operador (por ejemplo, gravedad o urgencia) mediante preguntas `score`, con distribución de probabilidad para fijar umbrales de escalado.
- Enrutamiento semántico en pipelines de LLM: integración en vLLM Semantic Router para decidir qué modelo o herramienta debe atender una consulta, aprovechando el endpoint `/v1/systemone` y el batching para sostener decenas de peticiones por segundo.
- Análisis de sentimiento y urgencia en atención al cliente: combinación de preguntas `noul` (¿está enfadado el cliente?) y `score` (nivel de urgencia) sobre el mismo estado, devolviendo ambas respuestas en una única inferencia.
- Clasificación de imágenes y vídeo: etiquetado automático de contenido visual (por ejemplo, verificación de que una imagen corresponde a una categoría) usando el codificador visual y el proyector multimodal incluidos en el repositorio.
- Control de calidad en pipelines de datos: filtrado por lotes de registros textuales o multimodales según criterios binarios o de elección, con salida probabilística que permite auditar la confianza de cada decisión.
- Despliegue en entornos con recursos limitados: la cuantización Q4_K_M (16,7 GB) permite ejecutar el modelo en una GPU de consumo de 24 GB o en estaciones de trabajo con llama.cpp, manteniendo la API de decisión.

## Benchmarks y rendimiento

| Benchmark | d3 | Referencia |
|---|---|---|
| Jev Decision Index 0.3.2 (texto) | 66,3 (1.º de 149) | Decision 2.0 27B: 27; Decider 31B: 64,6; Perplexity Decider v1.1: 62,8 |
| Jev Decision Index (visión) | 71,3 (1.º de 33) | no disponible |
| Perception Test (vídeo) | 77,4 | no disponible |

Datos de latencia y throughput según la model card, sobre una AMD Instinct MI325X:

| Escenario | Latencia mediana |
|---|---|
| Petición de texto | 54,4 ms |
| Petición con imagen | 290 ms |
| Petición con vídeo de 10 s | 500 ms |

Throughput en modo Engine con batching: hasta 27 peticiones de texto de una sola pregunta por segundo (1,5× `AutoModel`).

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q3_K_L 14,7 GB; Q4_K_M 16,7 GB; Q5_K_M 19,3 GB; Q6_K 22,1 GB; BF16 53,8 GB. Añadir aproximadamente 1 GB para el proyector multimodal (`mmproj-bf16`, 931 MB).
- GPU recomendadas: AMD Instinct MI325X para los datos de latencia publicados; para el formato GGUF, GPU de consumo con 24 GB (RTX 3090, RTX 4090) pueden ejecutar Q4_K_M o Q5_K_M; Q6_K requiere 24 GB con margen ajustado; BF16 requiere GPU de 80 GB (A100, H100) o mayor.
- Cabe en GPU de consumo: sí, con cuantizaciones Q3_K_L a Q5_K_M en tarjetas de 16-24 GB; Q6_K en 24 GB.
- Opciones de despliegue: llama.cpp (`llama-server` con endpoint `v1/systemone`), vLLM (builds nocturnos, `vllm serve` y `/v1/systemone`), `transformers` (`AutoModel` o pipeline) y `vllm-sr serve -e vllm-sr/d3`.
- Latencia y throughput: ver tabla de benchmarks; los datos publicados corresponden a una MI325X y no se especifican cifras para GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Jev Decision Index (texto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3 | 26,09B (+0,46B visión) | no disponible | 66,3 | Apache-2.0 | GGUF, safetensors, vLLM, llama.cpp |
| Decision 2.0 27B | 27B | no disponible | 27 | no disponible | no disponible |
| Decider 31B | 31B | no disponible | 64,6 | no disponible | no disponible |
| Perplexity Decider v1.1 | no disponible | no disponible | 62,8 | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado en decisión: no genera texto libre, por lo que no sirve para tareas generativas convencionales.
- Idiomas: solo inglés según la model card; el rendimiento en otros idiomas no está documentado.
- Longitud de contexto no especificada; no se deben asumir ventanas largas sin verificación empírica.
- Riesgo de calibración: las probabilidades devueltas deben validarse en el dominio de producción; la confianza reportada en el ejemplo de urgencia es baja (0,29) pese a una puntuación de 2,17.
- Sesgos: no se documentan evaluaciones de sesgo ni de robustez frente a entradas adversarias.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y sus dependencias deben verificarse por separado.
- Los benchmarks citados provienen de la model card del autor; no se han verificado de forma independiente en esta ficha.
- El soporte en vLLM requiere builds nocturnos, lo que implica menor estabilidad que una versión estable.
- El repositorio GGUF ocupa 127,6 GB en total; conviene descargar solo el archivo de cuantización necesario.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/prithivMLmods/d3-GGUF
- Modelo base: https://huggingface.co/vllm-sr/d3
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del cuantizador: https://huggingface.co/prithivMLmods
- vLLM Semantic Router: no disponible en la información proporcionada
- Paper de d3: no disponible en la información proporcionada

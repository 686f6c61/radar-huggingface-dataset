# baa-ai/ERNIE-4.5-21B-A3B-PT-RAM-11GB-MLX

## Resumen

ERNIE-4.5-21B-A3B-PT-RAM-11GB-MLX es una version cuantizada en precision mixta del modelo baidu/ERNIE-4.5-21B-A3B-PT, publicada por baa-ai (Black Sheep AI) para su uso con la libreria MLX de Apple. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) desarrollado por Baidu, con 21.825.436.160 parametros totales (21,8 mil millones) y 3 mil millones de parametros activos por token, segun la nomenclatura A3B del identificador.

El objetivo de esta publicacion es reducir el peso del modelo base (43,9 GB en BF16) hasta 11,1 GB mediante una cuantizacion de precision mixta propietaria (metodo Black Sheep AI), con una media de 3,5 bits por peso. El autor la presenta como el "punto de rodilla" de RAM: el presupuesto minimo antes de que la calidad se degrade de forma apreciable. Es relevante para desarrolladores que quieran ejecutar un MoE de 21B en hardware Apple Silicon con memoria unificada limitada, manteniendo un rendimiento aceptable en tareas de recuperacion documental.

La licencia es Apache 2.0, heredada del modelo base. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2 de noviembre de 2026. La model card no especifica los idiomas soportados de forma explicita, aunque advierte de un comportamiento multilingue no controlado (respuestas en chino ante prompts sin system prompt en ingles).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (ernie4_5_moe), cuantizacion de precision mixta |
| Parametros totales | 21.825.436.160 (21,8B) |
| Parametros activos | 3B (segun nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta, media de 3,5 bits por peso (metodo propietario Black Sheep AI); el autor menciona tambien una variante uniforme de 4 bits de 12,3 GB como referencia comparativa |
| Idiomas soportados | no disponible (la model card advierte de respuestas en chino sin system prompt en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts con 21,8 mil millones de parametros totales y 3 mil millones activos por token, identificado en HuggingFace con la arquitectura `ernie4_5_moe`. Esta publicacion concreta no entrena el modelo: aplica una cuantizacion de precision mixta sobre los pesos del modelo base `baidu/ERNIE-4.5-21B-A3B-PT`, reduciendo el tamano de 43,9 GB (BF16) a 11,1 GB. El metodo de cuantizacion es propietario (Black Sheep AI) y el autor no detalla la asignacion de bits por capa ni el algoritmo de calibracion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base utilizo RLHF o DPO. La model card indica que ERNIE "no usa una fase de pensamiento" (thinking phase): sus respuestas libres promedian unos 90 tokens y ninguna agoto el presupuesto en las pruebas realizadas. Esta publicacion es exclusivamente una receta de compresion; cualquier innovacion arquitectonica procede del modelo base de Baidu, sobre el que no se aportan detalles adicionales.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento aritmetico: 93% en GSM8K (100 preguntas) y 85% en MMLU-Pro math (60 preguntas).
- Razonamiento multi-hop: 98,9% en sumas multi-hop de 4 a 6 terminos (90 preguntas) y 31,7% en cadenas de relaciones de 4 a 6 saltos (126 preguntas).
- Recuperacion documental: 73,3% de acierto en la tarea de recuperacion de documentos (manual de mantenimiento del Dash 8 Q300, 415 preguntas, documento correcto en el top 3).
- Question answering sobre documentos: 30,0% en la tarea de Q&A sobre manuales del Boeing 787 (150 preguntas, la respuesta contiene el valor esperado).
- Conocimiento general: 75,00% en MMLU (400 preguntas).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada; las pruebas multi-hop muestran un rendimiento limitado en cadenas largas.
- Capacidades multilingues: no documentadas; se observa un comportamiento no controlado (respuestas en chino sin system prompt en ingles).
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el autor indica explicitamente que el modelo no usa fase de pensamiento.

## Casos de uso

- Recuperacion documental en un console RAG: el modelo actua como lector de un sistema de recuperacion aumentada y obtuvo la puntuacion de recuperacion mas alta entre los seis lectores probados por el autor (hasta 90 GB), con una mediana de 2,7 segundos por pregunta. Es adecuado cuando el objetivo es localizar el documento correcto en el top 3 con presupuesto de memoria reducido.
- Asistente de mantenimiento tecnico: con 73,3% de acierto en recuperacion sobre el manual del Dash 8 Q300, puede integrarse en herramientas de consulta de manuales de aeronaves o equipos industriales donde el documento fuente este indexado y el modelo solo deba seleccionarlo.
- Resolucion de problemas aritmeticos y financieros: con 93% en GSM8K y 98,9% en sumas multi-hop, es util para calculos con varios terminos encadenados en entornos de back office o validacion de facturas.
- Despliegue en Mac Studio o portatiles Apple Silicon: al ocupar 11,1 GB, cabe en equipos con memoria unificada de 16 GB o superior, permitiendo inferencia local sin GPU dedicada mediante MLX.
- Prototipado de chatbots conversacionales: el pipeline `text-generation` y el tag `conversational` permiten montar un asistente multi-turno con `mlx_lm` en pocas lineas de codigo, adecuado para demos y pruebas internas.
- Filtrado y clasificacion de documentos en pipelines de ingestion: su capacidad de recuperacion documental permite usarlo como primer lector que descarta documentos irrelevantes antes de pasar a un modelo mayor, reduciendo coste computacional.
- Evaluacion comparativa de cuantizaciones: util para equipos que quieran medir el impacto de la precision mixta frente a BF16 o 4-bit uniforme en sus propios conjuntos de datos, dado que el autor publica la metodologia de MMLU.

## Benchmarks y rendimiento

Resultados publicados en la model card (medidos por el autor):

| Modelo | Tamano | MMLU | MMLU % de BF16 |
|---|---|---|---|
| BF16 | 43,9 GB | 77,75% | 100% |
| Uniform 4-bit | 12,3 GB | 80,25% | 103,2% |
| RAM 11GB (este) | 11,1 GB | 75,00% | 96,5% |

Pruebas adicionales de este build:

| Prueba | Resultado |
|---|---|
| MMLU (400 preguntas) | 75,00% |
| MMLU vs 4-bit uniforme | -5,25 puntos |
| Recuperacion documental, manual Dash 8 Q300 (415 preguntas, top 3) | 73,3% |
| Q&A documental, manuales Boeing 787 (150 preguntas) | 30,0% |
| GSM8K (100 preguntas) | 93% |
| MMLU-Pro math (60 preguntas) | 85% |
| Cadenas multi-hop, 4-6 saltos (126), respuesta libre hasta 3072 tokens | 31,7% |
| Sumas multi-hop, 4-6 terminos (90), respuesta libre | 98,9% |
| Cadenas multi-hop, respuesta de una palabra, 220 tokens, thinking off | 1,6% |
| Sumas multi-hop, respuesta concisa, 220 tokens, thinking off | 88,9% |

El autor senala que el 4-bit uniforme (12,3 GB) supera a este build en MMLU: acierta 34 preguntas que este falla, frente a 13 en sentido contrario. La latencia medida en la tarea de recuperacion documental es de 2,7 segundos por pregunta (mediana).

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 11,1 GB de pesos; con overhead de ejecucion en MLX, se recomienda al menos 14-16 GB de memoria unificada.
- GPU recomendadas: no aplica GPU dedicada; el formato MLX esta disenado para Apple Silicon (M1, M2, M3, M4 y superiores). El autor menciona Mac Studio como plataforma de despliegue.
- Cabe en GPU consumer: si, en equipos Apple Silicon con 16 GB o mas de memoria unificada. No es compatible con CUDA ni con GPUs NVIDIA/AMD de forma nativa.
- Opciones de despliegue: libreria `mlx_lm` (carga y generacion via `load` y `generate`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no soportan el formato MLX de este repositorio.
- Latencia y throughput: mediana de 2,7 segundos por pregunta en la tarea de recuperacion documental segun el autor; no se publican mas metricas de throughput (tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ERNIE-4.5-21B-A3B-PT-RAM-11GB-MLX (este) | 21,8B totales / 3B activos | no disponible | 75,00% | Apache 2.0 | HuggingFace, formato MLX |
| ERNIE-4.5-21B-A3B-PT BF16 (base) | 21,8B totales / 3B activos | no disponible | 77,75% | Apache 2.0 | HuggingFace, safetensors |
| ERNIE-4.5-21B-A3B-PT uniforme 4-bit | 21,8B totales / 3B activos | no disponible | 80,25% | Apache 2.0 | HuggingFace, 12,3 GB |

La model card menciona que el build se comparo contra otros cinco lectores de hasta 90 GB en tareas de recuperacion documental, pero no identifica sus nombres ni especificaciones, por lo que no es posible incluirlos en la tabla.

## Limitaciones y advertencias

- Perdida de calidad frente al modelo base: 96,5% del rendimiento BF16 en MMLU, con 2,75 puntos porcentuales menos.
- Inferior al 4-bit uniforme en conocimiento general: -5,25 puntos en MMLU, pese a ocupar solo 1,2 GB menos.
- Riesgo de idioma no controlado: sin system prompt en ingles, respuestas en chino ("Say OK." respondio en chino en la prueba de humo). Un system prompt en ingles mantiene las respuestas en ingles.
- Razonamiento multi-hop fragil: 31,7% en cadenas de 4 a 6 saltos y 1,6% con respuesta concisa de una palabra y thinking off; no es fiable para cadenas de relaciones largas.
- Q&A documental limitado en tablas largas: 30,0% en manuales del Boeing 787; el autor reconoce que las busquedas largas en tablas favorecen a lectores mas grandes.
- Sin fase de pensamiento: no dispone de modo de razonamiento extendido, lo que limita tareas que requieran cadenas de deduccion largas.
- Compatibilidad restringida: solo MLX (Apple Silicon); no usable en CUDA, vLLM, llama.cpp ni TGI.
- Sesgos conocidos: no documentados en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el metodo de cuantizacion es propietario de Black Sheep AI y la model card no detalla condiciones adicionales sobre la receta.
- Repositorio sin traccion: 0 descargas y 0 likes, sin validacion independiente de los resultados publicados.
- Idiomas soportados no declarados oficialmente, lo que dificulta planificar despliegues multilingues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/baa-ai/ERNIE-4.5-21B-A3B-PT-RAM-11GB-MLX
- Modelo base: https://huggingface.co/baidu/ERNIE-4.5-21B-A3B-PT
- Sitio del autor: https://baa.ai
- Producto Ram (capa de razonamiento): https://baa.ai/compression.html
- Producto Paddock (plano de conocimiento): https://baa.ai/paddock.html
- Producto Watchman (capa GRC): https://baa.ai/watchman.html
- Producto Shepherd (despliegue): https://baa.ai/shepherd.html

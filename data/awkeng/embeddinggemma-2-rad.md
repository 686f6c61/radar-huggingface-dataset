# awkeng/embeddinggemma-2-rad

## Resumen

`awkeng/embeddinggemma-2-rad` es un contenedor del modelo de embeddings `google/embeddinggemma-2` de Google DeepMind, empaquetado sin cambios de precision en un unico fichero `.rad` para el motor de inferencia radiance. La conversion la firma el usuario `awkeng`, no es oficial y mantiene cada peso en bf16 tal y como lo entrega el checkpoint original (1257 tensores, 1,39 GiB de pesos, fichero de 1.502.429.184 bytes). El modelo base se distribuye bajo licencia Apache 2.0.

Se trata de un modelo de extraccion de caracteristicas (feature-extraction) orientado a similitud entre frases y generacion de embeddings multimodales: produce vectores agrupados de 768 dimensiones para texto, imagenes, video y audio, con soporte Matryoshka que permite truncar la dimension de salida mediante el parametro `dimensions`. Este tipo de contenedor interesa a quienes despliegan radiance como motor de inferencia y quieren ejecutar el modelo en CPU o en una sola GPU sin depender del stack de Hugging Face.

El atractivo principal es operativo: el fichero es determinista (reproducible byte a byte con `rad-convert`) y expone una API compatible con el endpoint `/v1/embeddings`, lo que facilita integrarlo en pipelines de busqueda semantica, RAG o recuperacion multimodal. No incluye ninguna receta de cuantizacion, por lo que la huella de memoria es mayor que la de variantes cuantizadas del mismo modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no detallada en la model card; hereda la del checkpoint base `google/embeddinggemma-2`) |
| Parametros totales | no disponible (el autor no lo indica; los pesos bf16 suman 1,39 GiB en 1257 tensores) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ninguno; todos los pesos en bf16. Soporta truncado Matryoshka de la dimension de salida (`dimensions`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (Copyright del modelo: Google DeepMind) |
| Formato de pesos | `.rad` (contenedor del motor radiance); origen `model.safetensors` |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna del modelo en la model card. El autor describe exclusivamente el proceso de empaquetado: la herramienta `rad-convert` toma el repositorio `google/embeddinggemma-2` en la revision `914f7f89142e33e77833254d9c9b90c3cef7303b` junto con su `tokenizer.json` y genera el fichero `embeddinggemma2-bf16.rad`. No se aplica ninguna receta de cuantizacion, por lo que cada peso conserva la codificacion bf16 del checkpoint de origen.

El resultado son 1257 tensores y 1,39 GiB de pesos, con salida de vectores agrupados de 768 dimensiones. Al ser una conversion, no hay informacion en esta ficha sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO). La innovacion tecnica aqui es de formato e infraestructura: conversion determinista y reproducible (mismo SHA-256 al repetir el proceso) y soporte de truncado Matryoshka para ajustar la dimension del embedding en tiempo de inferencia.

## Capacidades

- Generacion de embeddings densos para texto, con salida de 768 dimensiones.
- Recuperacion multimodal: genera vectores para imagenes, video y audio ademas de texto.
- Similitud entre frases (`sentence-similarity`) y extraccion de caracteristicas (`feature-extraction`).
- Soporte Matryoshka: el parametro `dimensions` permite truncar el vector (por ejemplo a 256) reduciendo coste de almacenamiento y comparacion.
- Parametro `prompt_name` para distinguir entre consulta (`query`) y documento, habitual en pipelines de recuperacion asimetrica.
- API compatible con `/v1/embeddings`, con autenticacion mediante `--api-key`.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, tool calling ni agentes: el modelo es exclusivamente de embedding.

## Casos de uso

- Busqueda semantica sobre corpus documentales: indexar el 768-vector de cada documento y recuperar por similitud coseno frente al vector de la consulta, usando `prompt_name: "query"` para las busquedas.
- Generacion aumentada por recuperacion (RAG): como codificador de recuperacion dentro de un pipeline que alimenta a un LLM generativo, aprovechando la compatibilidad con `/v1/embeddings`.
- Recuperacion multimodal texto-a-imagen: consultar una galeria de imagenes con una descripcion textual, ya que el modelo genera embeddings para ambos tipos de contenido.
- Deduplicacion y agrupamiento de contenido: calcular similitud par a par y aplicar clustering sobre los vectores de 768 dimensiones para detectar duplicados o temas.
- Clasificacion y enrutamiento por similitud: comparar la entrada contra un conjunto de embeddings de referencia (etiquetas, intenciones, categorias) para clasificar sin entrenar un cabezal adicional.
- Busqueda sobre audio o video: indexar pistas o fragmentos audiovisuales y consultarlos mediante texto, al soportar ambos tipos de entrada.
- Sistemas de recomendacion basados en contenido: representar items y preferencias del usuario en el mismo espacio vectorial para calcular afinidad.
- Despliegue en entornos con recursos limitados: servir el modelo en CPU con entre 0,25 y 1,5 GiB de RAM mediante el motor radiance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- RAM en CPU: entre 0,25 y 1,5 GiB, segun indica el autor de la conversion.
- GPU: el modelo cabe en una unica GPU. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la informacion disponible.
- GPU de consumo: no se confirma compatibilidad con GPU de consumo, aunque el tamano (1,39 GiB de pesos bf16) es compatible con cualquier GPU con varios GiB de VRAM libres.
- Almacenamiento: fichero unico de 1.502.429.184 bytes (1,5 GB).
- Despliegue: motor radiance 1.2.4 o superior (soporte de embeddings); probado con la version 1.3.0. Comando: `radiance --model embeddinggemma2-bf16.rad --host 0.0.0.0 --port 8000 --api-key "$KEY"`.
- Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible; el formato `.rad` es nativo de radiance.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Formato | Licencia |
|---|---|---|---|---|---|
| `awkeng/embeddinggemma-2-rad` (esta ficha) | no disponible (1,39 GiB de pesos bf16) | no disponible | texto, imagen, video, audio | `.rad` | Apache 2.0 |
| `google/embeddinggemma-2` (base oficial) | no disponible | no disponible | segun model card oficial | safetensors | Apache 2.0 |
| Otras alternativas de embedding de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada con datos es frente al checkpoint base `google/embeddinggemma-2`, del que este fichero es una conversion: mismo modelo, mismos pesos en bf16, distinto formato de empaquetado y distinto motor de inferencia. No hay informacion disponible sobre otros modelos comparables con datos verificables en esta busqueda.

## Limitaciones y advertencias

- Es una conversion no oficial: el autor lo declara explicitamente ("unofficial conversion"); el modelo y su copyright pertenecen a Google DeepMind.
- No se documentan sesgos conocidos ni evaluaciones de equidad en la informacion disponible.
- Riesgo de alucinacion no aplica en el sentido generativo (no produce texto), pero la calidad del embedding depende del checkpoint base y no hay benchmarks publicados aqui que la respalden.
- No se especifican idiomas soportados ni longitud de contexto: hay que consultar la model card oficial de `google/embeddinggemma-2` para esos datos antes de usarlo en produccion.
- El formato `.rad` ata el modelo al motor radiance; no es directamente cargable en vLLM, llama.cpp, Ollama o TGI.
- Al no aplicar cuantizacion, la huella de memoria es mayor que la de variantes cuantizadas; en contrapartida, la precision se mantiene igual al checkpoint original.
- El modelo no genera texto ni soporta tool calling; no debe usarse para tareas generativas.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad sobre esta conversion.
- Verificar el SHA-256 (`d46988383e41de05df1ff69f491b1a6351a2ab69d26771943ca150768115bdae`) tras la descarga para confirmar la integridad del fichero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/awkeng/embeddinggemma-2-rad
- Modelo base oficial: https://huggingface.co/google/embeddinggemma-2
- Motor de inferencia radiance: https://codeberg.org/StillDeadcode/radiance
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web.

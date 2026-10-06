# chrullis/relweave-4b-base

## Resumen

relweave-4b-base es un modelo especializado en extraccion tipada de entidades y relaciones a partir de texto en ingles, con salida en formato de grafo de conocimiento. Lo desarrolla el usuario chrullis y se distribuye bajo licencia Apache 2.0. El modelo no es un transformer entrenado desde cero: consiste en dos adaptadores LoRA (PEFT) montados sobre Qwen3-4B en cuantizacion de 4 bits, mas una cabeza de clasificacion por pares de entidades. El primero, `generator/`, escribe entidades y relaciones como texto bajo decodificacion restringida; el segundo, `head/`, puntua cada par de entidades para eliminar relaciones inventadas y recuperar las omitidas. El resultado se consume a traves de la libreria `relweave`, que trocea documentos largos, ejecuta ambas partes, fusiona entidades entre fragmentos y devuelve un grafo en JSON Graph Format.

El problema que resuelve es concreto: convertir prosa en ingles sobre empresas nordicas y europeas en un grafo estructurado siguiendo un esquema de negocio fijo de 6 tipos de entidad (PERSON, ORG, OBJECT, PLACE, COORDINATE, EVENT) y 21 tipos de relacion (empleo, cargos ejecutivos, consejos, propiedad, filiales, adquisiciones, ubicaciones, eventos, etc.). Es relevante porque demuestra que un modelo pequeno de 4B parametros, con adaptadores LoRA y una cabeza auxiliar, puede alcanzar un F1 estricto de relacion tipada en torno a 0,78 en evaluacion extremo a extremo, un rendimiento poco habitual en extraccion de informacion con modelos de ese tamano.

El repositorio ocupa 0,6 GB, esta etiquetado como `text-generation` y solo declara soporte para ingles. La model card indica que se necesita una GPU CUDA con unos 5 GB de memoria libre para la inferencia, ya que el modelo base se carga en 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) con dos adaptadores LoRA (PEFT) y una cabeza de clasificacion por pares de entidades |
| Parametros totales | 4 000 millones en el modelo base (Qwen3-4B) mas los adaptadores LoRA; no se detalla el numero exacto de parametros de los adaptadores |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; heredada del modelo base Qwen3-4B |
| Tipos de cuantizacion | modelo base cargado en 4 bits (bitsandbytes, `unsloth/qwen3-4b-unsloth-bnb-4bit`); adaptadores LoRA en precision completa |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA); peso del repositorio 0,6 GB |

## Arquitectura y entrenamiento

La arquitectura es una combinacion de generacion y clasificacion. El componente `generator/` es un adaptador LoRA sobre Qwen3-4B que produce las entidades y relaciones como texto, guiado por decodificacion restringida derivada del esquema. El componente `head/` es un adaptador adicional que actua como cabeza de clasificacion por pares: puntua cada par de entidades generado y decide si la relacion existe y con que tipo. Segun la model card, esta cabeza aporta aproximadamente +0,10 de F1 sobre el generador por si solo, corrigiendo tanto falsos positivos (relaciones inventadas) como falsos negativos (relaciones omitidas).

El esquema se define una sola vez como clases Python en `bench/ontology/business.py`, donde el docstring de cada clase actua como definicion. A partir de esas clases se derivan automaticamente los prompts, las gramaticas de decodificacion, la validacion de etiquetas y el scoring. Los datos de entrenamiento son pasajes de articulos de Wikipedia en ingles sobre empresas nordicas y europeas (la model card se corta en ese punto, por lo que no se especifica el numero total de tokens ni la composicion completa del dataset). No se menciona en la informacion disponible el uso de RLHF o DPO. Los conjuntos de evaluacion no comparten documentos, entidades ni hechos con los datos de entrenamiento, y el conjunto de test se reporta sin haber sido usado para ajuste.

## Capacidades

- Extraccion de entidades tipadas en ingles con 6 tipos: PERSON, ORG, OBJECT, PLACE, COORDINATE y EVENT.
- Extraccion de relaciones tipadas con 21 tipos, incluyendo direccion (por ejemplo, EXECUTIVE_OF va de Person a Org) y relaciones simetricas sin direccion (FAMILY_OF, ASSOCIATE_OF, MET_WITH, COMMUNICATED_WITH).
- Resolucion de menciones y correferencia: agrupa todas las menciones de una entidad, incluidos pronombres y descripciones como "the company".
- Generacion de grafos de conocimiento en JSON Graph Format v2, con nodos, aristas, spans de mencion y evidencia.
- Procesamiento de documentos largos mediante troceado automatico y fusion de entidades entre fragmentos (funcionalidad de la libreria `relweave`).
- Puntuacion de pares de entidades mediante la cabeza `head/`, que filtra y completa las relaciones del generador.
- Atributos de arista (fechas, participaciones, roles) definidos en el esquema, aunque no forman parte de la salida puntuada.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Construccion de grafos de conocimiento corporativos: a partir de informes anuales, notas de prensa o articulos en ingles sobre empresas nordicas y europeas, el modelo extrae entidades y relaciones tipadas y devuelve un grafo JSON listo para cargar en una base de datos de grafos.
- Analisis de propiedad y estructura societaria: las relaciones OWNS_STAKE_IN, SUBSIDIARY_OF y ACQUIRED permiten reconstruir cadenas de propiedad y filiales, enlazando solo con el padre mas proximo que el texto indica.
- Inteligencia competitiva y seguimiento de fusiones y adquisiciones: deteccion de eventos de adquisicion, cambios de consejo y nombramientos ejecutivos (EXECUTIVE_OF, BOARD_MEMBER_OF) sobre flujos de noticias.
- Enriquecimiento de CRM y bases de datos B2B: conversion de texto libre (perfiles, notas de reunion, correos) en registros estructurados de personas, organizaciones, cargos y ubicaciones.
- Cumplimiento normativo y KYC (conocimiento del cliente): extraccion de vinculos familiares, asociaciones y comunicaciones entre personas para analisis de redes de riesgo, usando las relaciones simetricas FAMILY_OF y ASSOCIATE_OF.
- Periodismo de datos e investigacion: troceado de documentos largos con la libreria `relweave` para fusionar menciones de entidades a lo largo de un corpus extenso y generar grafos de evidencia verificable.
- Indexacion semantica de archivos documentales: generacion de grafos por documento para alimentar motores de busqueda que relacionen personas, organizaciones, lugares y eventos.
- Preprocesado para pipelines de RAG: el grafo resultante puede servir como capa de recuperacion estructurada que complemente la busqueda vectorial sobre texto.

## Benchmarks y rendimiento

F1 estricto de relacion tipada (una relacion solo cuenta si acierta tipo, direccion y ambas entidades), sobre pasajes de Wikipedia en ingles acerca de empresas nordicas y europeas, con conjuntos de evaluacion sin solapamiento con el entrenamiento:

| Evaluacion | Validacion | Test |
|---|---|---|
| Extremo a extremo (el modelo detecta las entidades por si mismo) | 0,781 | 0,783 |
| Paso de relacion con entidades de referencia (gold) | 0,839 | 0,822 |

Precision en test: 0,818. Recall en test: 0,751. La cabeza de pares anade aproximadamente +0,10 de F1 respecto al generador aislado. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 5 GB de memoria libre en GPU CUDA, segun la model card, porque el modelo base se carga en 4 bits.
- GPU recomendadas: cualquier GPU CUDA con al menos 5-6 GB de VRAM libre; no se especifican modelos concretos en la informacion disponible.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de consumo con 6 GB o mas, como RTX 3060, RTX 4060, RTX 2070 o superiores; en GPUs con 8 GB o mas hay margen adicional para el contexto y el resto de la libreria.
- Opciones de despliegue: la via documentada es la libreria `relweave` (instalacion desde git con `pip install git+https://github.com/memlocator/relweave`, con publicacion en PyPI pendiente) y la API `Extractor`. Al tratarse de adaptadores LoRA mas una cabeza de clasificacion personalizada, no se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible no incluye resultados de otros sistemas de extraccion de relaciones evaluados sobre el mismo esquema y los mismos conjuntos de datos, por lo que no es posible establecer una comparacion cuantitativa fiable. La unica referencia que puede situarse con rigor es el modelo base sobre el que se construye.

| Modelo | Parametros | Contexto | F1 estricto de relacion (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chrullis/relweave-4b-base | 4B (base) + LoRA | no disponible | 0,783 (extremo a extremo) | Apache 2.0 | HuggingFace + libreria `relweave` |
| unsloth/qwen3-4b-unsloth-bnb-4bit (modelo base) | 4B | no disponible | no disponible (no especializado en extraccion de relaciones) | Apache 2.0 (Qwen3) | HuggingFace |
| Otros sistemas de extraccion de relaciones | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles: no hay evidencia de rendimiento en castellano ni en otros idiomas.
- El esquema es fijo y cerrado: 6 tipos de entidad y 21 tipos de relacion orientados a un dominio de negocio concreto (empresas nordicas y europeas). Las relaciones o entidades fuera de ese esquema no se extraen.
- Sesgo de dominio: el entrenamiento se basa en articulos de Wikipedia en ingles sobre empresas nordicas y europeas, lo que puede degradar el rendimiento en otros generos textuales (correos, contratos, redes sociales) o en otras regiones geograficas.
- Riesgo de alucinacion: el generador puede producir relaciones inexistentes; la cabeza de pares mitiga este problema (aporta alrededor de +0,10 de F1), pero no lo elimina. El recall en test es 0,751, es decir, se pierde aproximadamente una de cada cuatro relaciones.
- La model card advierte de que los atributos de arista (fechas, participaciones, roles) existen en las clases del esquema pero no forman parte de la salida puntuada: quien los necesite debe tratarlos como no garantizados.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez frente a entradas adversarias.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios. Conviene verificar las condiciones del modelo base Qwen3-4B y de la herramienta UnsLoth empleada en su cuantizacion.
- El repositorio registra 0 descargas y 0 likes, y las fechas de creacion y actualizacion son del 5 de octubre de 2026, por lo que se trata de una publicacion muy reciente y sin validacion independiente conocida.
- La libreria `relweave` no tiene publicacion en PyPI en el momento de redactar esta ficha; la instalacion se realiza desde el repositorio de GitHub.
- Uso en produccion: al no integrarse en servidores de inferencia estandar (vLLM, TGI, Ollama), el despliegue exige mantener la libreria y su logica de troceado y fusion como parte integral del servicio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chrullis/relweave-4b-base
- Repositorio de la libreria relweave: https://github.com/memlocator/relweave
- Modelo base: https://huggingface.co/unsloth/qwen3-4b-unsloth-bnb-4bit
- Los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo: todas las entradas hacen referencia a la instalacion silenciosa del modelo Gemini Nano de Google en el navegador Chrome. Por tanto, no se dispone de papers, blogs ni demos adicionales sobre relweave-4b-base.

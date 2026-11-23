# kkalyfo/geopres-gte-multilingual-base-2

## Resumen

GeoPres projection: gte-multilingual-base a 2 dimensiones es un artefacto de reduccion de dimensionalidad publicado por el usuario kkalyfo bajo el identificador `kkalyfo/geopres-gte-multilingual-base-2`. No es un modelo de lenguaje ni un encoder de texto entrenado desde cero: es un mapa lineal `W` de forma 2 x 768 entrenado con la libreria GeoPres para proyectar embeddings de 768 dimensiones producidos por el backbone congelado `Alibaba-NLP/gte-multilingual-base` a un espacio bidimensional, preservando las distancias euclideas por pares entre embeddings.

El interes tecnico del artefacto es que permite reducir embeddings ya calculados sin volver a codificar texto: la inferencia consiste en una unica multiplicacion matricial, y el backbone no se descarga si se usa la clase `Projection`. Esta pensado para visualizacion de espacios de embeddings y para experimentos de compresion extrema, no para recuperacion o similitud semantica en produccion.

El autor documenta explicitamente que 2 dimensiones es un caso extremo: en MTEB la retencion cae al 35-38 % respecto al modelo completo, segun la seccion 6 del paper asociado (EACL 2027). El repositorio tiene 0 descargas, 0 likes y un tamano de 0.0 GB, coherente con un unico fichero de pesos de 2 x 768.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapa lineal (proyeccion) de 2 x 768 sobre embeddings de un transformer encoder congelado |
| Parametros totales | 1536 (matriz 2 x 768); el backbone no esta incluido en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del backbone `Alibaba-NLP/gte-multilingual-base`; no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (depende del backbone, que es multilingue por nombre, sin detalle en la ficha) |
| Licencia | no disponible |
| Formato de pesos | no disponible (pesos cargables via `geopres`, libreria propia; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es una proyeccion lineal pura: una matriz `W` de 2 filas por 768 columnas que transforma cada embedding de 768 dimensiones del backbone en un vector de 2 dimensiones. El backbone `Alibaba-NLP/gte-multilingual-base` permanece congelado y no forma parte del repositorio; el entrenamiento solo ajusta `W`. El objetivo de entrenamiento es preservar las distancias euclideas por pares entre los embeddings originales tras la proyeccion, segun la metodologia GeoPres descrita en el paper "On Post-Hoc Dimensionality Reduction of Text Embeddings" (EACL 2027).

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO (no aplicables a una proyeccion de este tipo). La innovacion destacable es el enfoque post-hoc: la reduccion se aplica sobre embeddings ya calculados, de modo que un pipeline existente (TEI, base de datos vectorial, proceso por lotes) puede reutilizar sus vectores sin reencodificar. La model card advierte que la entrada debe ser embeddings de `Alibaba-NLP/gte-multilingual-base` calculados con el mismo pooling, normalizacion y prefijos que los datos de entrenamiento.

## Capacidades

- Reduccion de dimensionalidad de embeddings de 768 a 2 dimensiones mediante una unica multiplicacion matricial.
- Preservacion de distancias euclideas por pares entre embeddings, segun el objetivo declarado del entrenamiento.
- Proyeccion de embeddings precalculados sin descargar ni ejecutar el backbone (clase `Projection`).
- Encapsulado completo del pipeline de encoding mas reduccion (clase `GeoPres`, que devuelve una matriz de forma `(n, 2)`).
- No realiza generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingues propias; dependen del backbone.
- Aplicable a visualizacion 2D de colecciones de embeddings.

## Casos de uso

- Visualizacion de espacios de embeddings: proyectar un corpus a 2 dimensiones y representarlo en un scatter plot para inspeccionar agrupamientos, solapamientos entre dominios o outliers; es el caso de uso que el propio autor cita como motivacion del tamano 2D.
- Auditoria de pipelines de embeddings: comparar la estructura de dos lotes de vectores (antes y despues de un cambio de preprocessing) proyectandolos al mismo espacio 2D y detectando desplazamientos globales.
- Reutilizacion de vectores ya almacenados: si una base de datos vectorial contiene embeddings de `gte-multilingual-base`, la clase `Projection` los reduce sin reencodificar ni descargar el backbone, lo que abarata experimentos exploratorios.
- Docencia y demostraciones: ilustrar en 2D como se distribuyen frases o documentos segun su similitud semantica, con un coste computacional minimo (una multiplicacion de matrices).
- Deteccion rapida de duplicados aproximados en exploracion visual: proyectar candidatos a 2D y revisar manualmente las regiones densas antes de aplicar un umbral de similitud en el espacio completo.
- Prototipado de interfaces de exploracion: alimentar un mapa interactivo de un corpus pequeno donde el usuario navegue por vecindades, aceptando la perdida de calidad de recuperacion a cambio de latencia y tamano minimos.

## Benchmarks y rendimiento

La model card no publica resultados numericos por tarea. El unico dato de rendimiento proporcionado es agregado: en MTEB, la retencion de esta proyeccion a 2 dimensiones cae al 35-38 % respecto al modelo completo, segun la seccion 6 del paper.

| Metrica | Valor |
|---|---|
| Retencion MTEB (2 dimensiones) | 35-38 % del modelo completo |
| MMLU / HumanEval / GSM8K | no disponible (no es un modelo generativo) |
| Latencia y throughput | no disponible |

## Requisitos de hardware

- VRAM para la proyeccion: practicamente despreciable; la matriz ocupa 1536 parametros (unos pocos KB en float32).
- VRAM para el pipeline completo con `GeoPres`: la del backbone `Alibaba-NLP/gte-multilingual-base`, no especificada en la informacion disponible.
- GPU recomendadas: cualquier GPU consumer sirve para la proyeccion; para el encoding completo se requiere una GPU capaz de ejecutar el backbone (modelo base, no disponible el detalle).
- Cabe en cualquier GPU consumer e incluso en CPU para la proyeccion sola.
- Opciones de despliegue: libreria `geopres` (clases `GeoPres` y `Projection`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponibles; al ser una multiplicacion matricial, el coste dominante en el modo `GeoPres` es el encoding del backbone, no la proyeccion.

## Comparativa con modelos similares

No se dispone de informacion sobre otras proyecciones GeoPres del mismo autor ni sobre alternativas equivalentes (PCA, UMAP, proyecciones lineales supervisadas) con resultados publicados comparables en la informacion proporcionada.

| Modelo | Dimensiones de salida | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| geopres-gte-multilingual-base-2 | 2 | 1536 (matriz) | no disponible | no disponible | Hugging Face (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La retencion en MTEB cae al 35-38 % del modelo completo: no es apta para recuperacion, busqueda semantica ni ranking en produccion.
- Solo acepta embeddings de `Alibaba-NLP/gte-multilingual-base` calculados con el mismo pooling, normalizacion y prefijos que los datos de entrenamiento; cualquier desviacion invalida la proyeccion.
- El backbone no esta incluido en el repositorio; el usuario debe obtenerlo por separado.
- Licencia no declarada: no hay garantia explicita de uso comercial y conviene verificar la licencia del backbone antes de desplegar.
- Idiomas soportados no documentados; dependen del backbone y no se detallan en la ficha.
- Riesgo de interpretacion erronea en visualizaciones: la preservacion de distancias es aproximada y en 2D las vecindades pueden no reflejar la estructura real del espacio de 768 dimensiones.
- Repositorio sin descargas ni likes y creado en 2026: no hay evidencia de uso en produccion ni de validacion externa.
- No se documentan sesgos, riesgos de alucinacion ni caveats adicionales de produccion mas alla de los indicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkalyfo/geopres-gte-multilingual-base-2
- Backbone: https://huggingface.co/Alibaba-NLP/gte-multilingual-base
- Repositorio GeoPres: https://github.com/konstantinoskalyfommatos/geopres
- Paper (EACL 2027): https://openreview.net/forum?id=vAWo3CIzqp

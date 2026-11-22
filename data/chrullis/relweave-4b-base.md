# chrullis/relweave-4b-base

## Resumen

relweave-4b-base es un modelo especializado en extraccion de entidades y relaciones tipadas a partir de texto en ingles, con salida en formato de grafo de conocimiento. Lo desarrolla el autor chrullis y se construye sobre Qwen3-4B en cuantizacion de 4 bits, con 4.022.468.096 parametros totales. No es un modelo de chat generalista: es un componente de un pipeline de extraccion de informacion que sigue un esquema de negocio fijo de 6 tipos de entidad y 21 tipos de relacion (empresas, personas, lugares, propiedad, filiales, ejecutivos, miembros de consejo, adquisiciones, entre otros).

Tecnicamente combina tres piezas que trabajan conjuntamente: dos adaptadores LoRA (un generador que escribe entidades y relaciones bajo decodificacion restringida, y un tagger de entidades estilo BERT) y una cabeza de clasificacion de pares que puntua cada par de entidades para eliminar relaciones inventadas por el generador y anadir las que ha omitido. El modelo raiz del repositorio es el generador con el LoRA ya fusionado, de modo que puede servirse con vLLM sin argumentos de adaptador.

Su relevancia practica reside en que ofrece extraccion de grafos de conocimiento de extremo a extremo con un consumo de memoria modesto (unos 5 GB de VRAM para el generador en 4 bits, unos 3 GB adicionales para la cabeza de pares) y con resultados medidos sobre corpus reales (F1 estricto de 0,783 en test sobre pasajes de Wikipedia y 0,531 en un benchmark de documentos reales). La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) con dos adaptadores LoRA (generador y tagger) y una cabeza de clasificacion de pares |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; la configuracion de despliegue recomendada usa `--max-model-len 4096` |
| Tipos de cuantizacion | Base en 4 bits (bnb-4bit); despliegue en fp8 con vLLM; bf16 en la variante de 1,7B |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | unsloth/qwen3-4b-unsloth-bnb-4bit |
| Libreria | relweave |
| Tamano del repositorio | 8,6 GB |
| Esquema de extraccion | 6 tipos de entidad y 21 tipos de relacion |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only, en su version cuantizada a 4 bits de unsloth. Sobre esa base se anaden dos adaptadores LoRA y una cabeza adicional. El generador produce entidades y relaciones como texto bajo decodificacion restringida por una gramatica especifica enviada en cada peticion. El tagger etiqueta cada nombre en una sola pasada sobre los estados ocultos de la cabeza del par, con un enfoque estilo BERT sin lista que terminar anticipadamente, de modo que los nombres que el generador omite en listas largas o celdas de tabla siguen llegando a la cabeza de pares. La cabeza de pares es un clasificador que puntua cada par de entidades candidatas y corrige la salida del generador.

El entrenamiento se realizo sobre el dataset chrullis/relweave-business-data, con pasajes de Wikipedia en ingles sobre empresas nordicas y europeas. Los conjuntos de evaluacion no comparten documentos con los datos de entrenamiento y se filtraron por personas, empresas y hechos compartidos, aunque persiste un 14% de nombres de personas y empresas del conjunto de test que tambien aparecen en las etiquetas de entrenamiento. El conjunto de test consta de 105 fragmentos de 29 articulos. La innovacion destacable es la combinacion de generacion con decodificacion restringida y una cabeza de clasificacion de pares que aporta aproximadamente +0,10 de F1 sobre el generador por si solo.

## Capacidades

- Extraccion de entidades tipadas con todas sus menciones, incluidos pronombres y descripciones como "the company".
- Extraccion de relaciones tipadas y dirigidas entre entidades, siguiendo un esquema fijo de 21 tipos.
- Reconocimiento de entidades nombradas (NER) mediante el tagger integrado.
- Resolucion de correferencia a nivel de mencion dentro del grafo.
- Construccion de grafos de conocimiento en JSON Graph Format v2, con nodos, aristas, spans de mencion y evidencia.
- Procesamiento de documentos largos mediante troceado (chunking) y fusion de entidades entre fragmentos, gestionado por la libreria relweave.
- Despliegue del generador mediante vLLM con endpoint compatible OpenAI.
- Capacidad de generacion de texto heredada del modelo base Qwen3-4B, aunque el modelo esta disenado como componente de extraccion y no como modelo de chat.
- No se documenta soporte de tool calling, agentes, vision ni audio.

## Casos de uso

- Construccion de grafos de conocimiento corporativos: el modelo lee informes y devuelve entidades (empresas, personas, lugares) y relaciones (propiedad, filiales, adquisiciones) en JSON Graph Format, listo para ingerir en una base de datos de grafos.
- Analisis de documentos legales: sobre opiniones judiciales de EE. UU. extraidas de PDF, el modelo identifica personas, organizaciones y lugares con un F1 relajado de 0,37, util para poblar indices de casos y relaciones entre partes.
- Monitorizacion de noticias de politica y economia: con F1 relajado de 0,54 en noticias de politica y 0,48 en ciencia, permite alimentar paneles de seguimiento de entidades y relaciones a partir de flujos de noticias.
- Enriquecimiento de bases de datos de clientes y proveedores: a partir de comunicados de prensa del Departamento de Justicia (F1 relajado 0,53) o de informes internos, el modelo extrae relaciones de propiedad y cargos ejecutivos para completar fichas de empresa.
- Extraccion por lotes de alto rendimiento: con vLLM en fp8 sobre una RTX 3070 Ti procesa unos 42 fragmentos por minuto, adecuado para reprocesar corpus de cientos de documentos en minutos.
- Despliegue en hardware de consumo: con unos 5 GB de VRAM para el generador y 3 GB para la cabeza de pares, puede ejecutarse en una GPU de 8 GB (con ajustes de `--max-model-len 3072`, `--max-num-batched-tokens 2048` y `--gpu-memory-utilization 0.84`) para prototipos y pruebas locales.
- Integracion en pipelines de inteligencia competitiva: la salida estructurada con spans de evidencia permite auditar cada relacion extraida contra el texto fuente.

## Benchmarks y rendimiento

F1 estricto de relacion tipada (la relacion solo cuenta con el tipo, la direccion y ambas entidades correctas), sobre pasajes de Wikipedia en ingles retenidos:

| Evaluacion | Validacion | Test |
|---|---|---|
| Extremo a extremo (el modelo encuentra las entidades) | 0,781 | 0,783 |
| Paso de relacion con entidades gold | 0,839 | 0,822 |

En test: precision 0,818, recall 0,751. La cabeza de pares anade aproximadamente +0,10 de F1 sobre el generador solo. El intervalo bootstrap sobre articulos para el test es de aproximadamente 0,72 a 0,84.

Benchmark de documentos reales (60 documentos congelados, solo personas, organizaciones y lugares):

| Puntuacion | F1 |
|---|---|
| Estricta | 0,531 |
| Relajada (un rol en una unidad padre o hija cuenta) | 0,536 |
| Relajada con tipos cercanos fusionados | 0,612 |

Por tipo de documento (relajada): opiniones judiciales 0,37; noticias de ciencia 0,48; comunicados del DOJ 0,53; noticias de politica 0,54; noticias legales 0,66.

Rendimiento de inferencia (una RTX 3070 Ti de 8 GB, 64 fragmentos de test de unas 200 palabras):

| Modelo | F1 sistema (validacion / test) | Generador en vLLM | Generador con transformers | Pesos en memoria |
|---|---|---|---|---|
| relweave-4b-base | 0,781 / 0,783 | unas 42 chunks/min (fp8) | unas 4,5 chunks/min | 4,2 GB (fp8) |
| relweave-1.7b-base | 0,737 / 0,722 | unas 96 chunks/min (bf16) | unas 6 chunks/min | 3,3 GB (bf16) |

Sobre 377 fragmentos retenidos, el modelo de 1,7B puntua 0,048 por debajo del 4B (intervalo de confianza del 95%: 0,030 a 0,067).

## Requisitos de hardware

- VRAM para el generador: aproximadamente 5 GB libres con la base en 4 bits; 4,2 GB de pesos en fp8 con vLLM.
- VRAM para la cabeza de pares: aproximadamente 3 GB libres, siempre en local (necesita los estados ocultos que vLLM no devuelve).
- GPU recomendadas: cualquier GPU CUDA con al menos 8 GB para el generador; en una RTX 3070 Ti de 8 GB funciona con `--max-model-len 3072 --max-num-batched-tokens 2048 --gpu-memory-utilization 0.84`, aunque deja sin espacio a la cabeza de pares, que debe ejecutarse tras detener el servidor o en otra GPU.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o superiores.
- Opciones de despliegue: vLLM 0.31 (probado), contenedor oficial `vllm/vllm-openai`, backend transformers y la libreria relweave (instalable desde GitHub; release en PyPI pendiente).
- Sin CUDA toolkit instalado, arrancar vLLM con `VLLM_USE_FLASHINFER_SAMPLER=0`.
- Throughput estimado: unas 42 chunks/min en vLLM fp8 y unas 4,5 chunks/min con transformers, sobre fragmentos de unas 200 palabras en una RTX 3070 Ti.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 sistema (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| relweave-4b-base | 4,02B | no disponible (despliegue a 4096) | 0,783 | apache-2.0 | Hugging Face |
| relweave-1.7b-base | no disponible | no disponible | 0,722 | no disponible | Hugging Face |
| Qwen3-4B (modelo base) | 4B | no disponible | no aplica (no especializado en extraccion) | no disponible | Hugging Face |

La comparativa con modelos genericos de extraccion de relaciones no esta disponible en la informacion proporcionada. El unico comparable directo documentado es la variante relweave-1.7b-base del mismo autor, que sacrifica 0,048 de F1 a cambio de mayor velocidad (unas 96 chunks/min frente a 42).

## Limitaciones y advertencias

- Solo soporta ingles; no se documentan otros idiomas.
- El endpoint vLLM es un componente, no un modelo de chat: solo responde en el formato de linea de relweave cuando se le pide como se entreno y se decodifica bajo la gramatica por fragmento que relweave envia en cada peticion. Debe llamarse a traves de relweave (`generator_url`).
- La cabeza de pares debe ejecutarse en local con los estados ocultos del modelo; no puede servirse desde vLLM.
- El esquema es fijo (6 tipos de entidad, 21 tipos de relacion): no cubre dominios fuera del esquema de negocio predefinido.
- Riesgo de alucinacion mitigado pero no eliminado: el generador puede inventar relaciones, que la cabeza de pares filtra parcialmente (aporta +0,10 de F1).
- El 14% de nombres de personas y empresas del conjunto de test tambien aparecen en las etiquetas de entrenamiento, lo que puede inflar ligeramente las metricas reportadas.
- El rendimiento cae en documentos reales: F1 estricto de 0,531 y 0,37 en opiniones judiciales, muy por debajo de los 0,783 en Wikipedia.
- El modelo card advierte que las puntuaciones del benchmark de documentos reales subestiman el modelo, pero no se detalla la magnitud de esa infravaloracion.
- El repositorio ocupa 8,6 GB, considerable para un modelo de 4B.
- La libreria relweave aun no tiene release en PyPI; la instalacion es desde GitHub.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-4B del que deriva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chrullis/relweave-4b-base
- Variante de 1,7B: https://huggingface.co/chrullis/relweave-1.7b-base
- Dataset de entrenamiento: https://huggingface.co/datasets/chrullis/relweave-business-data
- Repositorio de la libreria relweave: https://github.com/memlocator/relweave
- Modelo base: https://huggingface.co/unsloth/qwen3-4b-unsloth-bnb-4bit

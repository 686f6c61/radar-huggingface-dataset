# dekmATtud/ETP-Eval26-embeddings

## Resumen

ETP-Eval26-embeddings es un repositorio de vectores precalculados (no un modelo entrenable en si mismo) publicado por el usuario dekmATtud. Contiene los embeddings de 13 modelos distintos de representacion de frases aplicados sobre el conjunto de evaluacion ETP-Eval26, un corpus centrado en derecho canonico y latin medieval con consultas en latin, aleman e ingles. El objetivo es permitir la reproducibilidad exacta de experimentos de recuperacion cross-lingue sin necesidad de volver a ejecutar cada modelo sobre el corpus.

El paquete incluye tanto modelos genericos multilingues (BGE-M3, multilingual-e5-large, LaBSE, XLM-RoBERTa-large, Qwen3-Embedding en variantes de 0,6B y 4B) como modelos especializados en el dominio (SPhilBerta, CanonBerta-v1) y sus respectivas versiones afinadas por el autor original del dataset mediante aprendizaje contrastivo. Todas las matrices se almacenan en `float32`, L2-normalizadas, un fichero `.safetensors` por modelo, con dimensiones de 768, 1024 o 2560 segun el caso.

La relevancia actual radica en que facilita la comparacion controlada de arquitecturas de embeddings sobre un dominio de nicho (texto juridico-historiografico en latin) y en tres idiomas, un escenario donde los modelos generalistas suelen degradarse. Al estar todo precalculado, se elimina la variabilidad de infraestructura y se reduce la evaluacion a un simple producto matricial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (repositorio de embeddings; agrega salidas de 13 modelos distintos) |
| Parametros totales | No disponible (depende del modelo de origen) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo de origen) |
| Tipos de cuantizacion | No aplica; los vectores se distribuyen en `float32` |
| Idiomas soportados | Latin (la), aleman (de), ingles (en) |
| Licencia | CC BY 4.0 (los modelos de origen conservan su propia licencia) |
| Formato de pesos | `.safetensors` (arrays `embeddings` en float32) + `meta.json` / `meta.csv` |

Modelos incluidos y dimension de embedding:

| Fichero | Modelo de origen | Dimension |
|---|---|---|
| `bge-m3.safetensors` | BAAI/bge-m3 | 1024 |
| `mE5-large.safetensors` | intfloat/multilingual-e5-large | 1024 |
| `labse.safetensors` | sentence-transformers/LaBSE | 768 |
| `sphilberta.safetensors` | bowphs/SPhilBerta | 768 |
| `qwen3-emb-0.6b.safetensors` | Qwen/Qwen3-Embedding-0.6B | 1024 |
| `qwen3-emb-4b.safetensors` | Qwen/Qwen3-Embedding-4B | 2560 |
| `xlmr.safetensors` | FacebookAI/xlm-roberta-large | 1024 |
| `canonberta.safetensors` | mschonhardt/CanonBerta-v1 | 1024 |
| `bge-m3-ft.safetensors` | mschonhardt/etp-bgem3-contrastive-ft | 1024 |
| `canonberta-ft.safetensors` | mschonhardt/etp-canonberta-contrastive-ft | 1024 |
| `xlmr-ft.safetensors` | mschonhardt/etp-xlmr-contrastive-ft | 1024 |
| `qwen3-emb-0.6b-ft.safetensors` | mschonhardt/etp-qwen0.6b-contrastive-ft | 1024 |
| `qwen3-emb-4b-ft.safetensors` | mschonhardt/etp-qwen4b-contrastive-ft | 2560 |

Composicion del corpus (segun `meta.csv`):

| `style` | `lang` | Filas | Significado |
|---|---|---|---|
| `passage` | `la` | 2051 | pasajes originales en latin |
| `passage` | `de` | 2051 | traduccion al aleman |
| `passage` | `en` | 2051 | traduccion al ingles |
| `!= passage` | `*` | 20654 | consultas (paraphrase, keyword, persona) |

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo: es un artefacto de evaluacion. Cada fichero `.safetensors` contiene un unico array `embeddings` en `float32` con los vectores de todos los textos del dataset ETP-Eval26 para un modelo concreto. Las arquitecturas subyacentes son las de los modelos de origen: BGE-M3 (encoder multilingue con soporte de recuperacion densa, dispersa y multi-vector), multilingual-e5-large y XLM-RoBERTa-large (encoders tipo transformer), LaBSE (bi-encoder de frases), SPhilBerta y CanonBerta-v1 (encoders especializados en latin/filologia), y Qwen3-Embedding en variantes de 0,6B y 4B.

El valor tecnico anadido esta en las cinco variantes con sufijo `-ft`, que corresponden a modelos afinados por el autor del dataset mediante aprendizaje contrastivo sobre el propio dominio (derecho canonico e historia). El repositorio no documenta hiperparametros, volumen de pares de entrenamiento ni funcion de perdida; esa informacion debe consultarse en las fichas de cada modelo afinado. Todos los vectores distribuidos estan L2-normalizados, de modo que la similitud coseno se reduce a un producto escalar.

## Capacidades

- Generacion de embeddings de frases y pasajes para recuperacion de informacion (retrieval denso).
- Recuperacion cross-lingue latin-aleman-ingles sobre el corpus ETP-Eval26.
- Evaluacion reproducible de modelos de embedding sin reejecutar inferencia.
- Comparacion controlada entre modelos genericos y modelos adaptados al dominio.
- Soporte de consultas de distintos estilos: `paraphrase`, `keyword` y `persona` (con contexto de derecho canonico, historia cultural, historia de genero e historia social).
- Calculo directo de metricas de recuperacion (Accuracy@1 y superiores) mediante producto matricial.
- No ofrece generacion de texto, tool calling, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Evaluacion de recuperacion cross-lingue: cargar `bge-m3-ft.safetensors`, filtrar pasajes en latin y consultas en aleman o ingles desde `meta.json`, y calcular Accuracy@k con un producto matricial; elimina la necesidad de servir cada modelo.
- Reproducibilidad de experimentos academicos: el paquete fija los vectores exactos, de modo que dos equipos obtienen las mismas metricas sin depender de versiones de librerias o hardware.
- Seleccion de modelo para un buscador juridico-historico: comparar en una sola sesion los 13 modelos y elegir el de mejor relacion calidad/dimension para un indice sobre derecho canonico.
- Analisis de brecha de dominio: contrastar pares como `xlmr` frente a `xlmr-ft` o `canonberta` frente a `canonberta-ft` para cuantificar la ganancia del ajuste contrastivo en latin medieval.
- Estudio de recuperacion por perfil de usuario: usar la columna `persona` de `meta.csv` para medir si un modelo rinde distinto ante consultas de historia de genero frente a historia social.
- Prototipado rapido de un motor de busqueda semantica sobre textos patristicos y canonicos: los vectores ya calculados permiten montar un indice FAISS o similar en minutos y validar la viabilidad antes de desplegar el modelo completo.
- Benchmarking interno de proveedores de embeddings: usar ETP-Eval26 como suite de regresion para decidir que modelo multilingue adoptar en una organizacion con fondos documentales en latin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un script de ejemplo que calcula Accuracy@1, pero no reporta cifras para ninguno de los 13 modelos.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 2,0 GB en total; conviene descargar solo los ficheros necesarios con `hf_hub_download`.
- Memoria RAM: cargar un unico `.safetensors` con `safetensors.numpy.load_file` requiere memoria proporcional al numero de filas por dimension por 4 bytes. El mayor (`qwen3-emb-4b`, 2560 dimensiones sobre unas 26.800 filas) ronda los 275 MB; el resto queda por debajo de los 110 MB.
- GPU: no es necesaria para la evaluacion; el producto matricial se ejecuta en CPU sin problema. Solo se requiere GPU si se desea acelerar el calculo de similitudes con `torch` o `cupy`.
- Si se quiere regenerar los embeddings desde cero, los requisitos dependen del modelo de origen: `qwen3-emb-4b` necesita del orden de 8-10 GB de VRAM en `float16` y cabe en una RTX 4090; los modelos de 1024 dimensiones (BGE-M3, XLM-R large, e5-large) caben en GPUs consumer de 8-12 GB.
- Opciones de despliegue: no aplica servicio de inferencia; el uso tipico es `safetensors` + NumPy, opcionalmente FAISS, Annoy o Qdrant para indexar los vectores.
- Latencia y throughput: no disponibles; el coste dominante es la descarga y la carga en memoria, no el computo.

## Comparativa con modelos similares

No existe una categoria estandar de "repositorios de embeddings precalculados", por lo que la comparacion se hace entre los modelos de origen incluidos en el paquete.

| Modelo | Dimension | Idiomas | Licencia (origen) | Ajuste al dominio |
|---|---|---|---|---|
| BAAI/bge-m3 | 1024 | Multilingue (amplio) | MIT (según modelo original) | No / si (`-ft`) |
| intfloat/multilingual-e5-large | 1024 | Multilingue | MIT (según modelo original) | No |
| sentence-transformers/LaBSE | 768 | Multilingue | Apache 2.0 (según modelo original) | No |
| FacebookAI/xlm-roberta-large | 1024 | Multilingue | MIT (según modelo original) | No / si (`-ft`) |
| Qwen3-Embedding-0.6B / 4B | 1024 / 2560 | Multilingue | Apache 2.0 (según modelo original) | No / si (`-ft`) |
| bowphs/SPhilBerta | 768 | Latin | No disponible en la informacion | Especializado en latin |
| mschonhardt/CanonBerta-v1 | 1024 | Latin | No disponible en la informacion | Especializado en derecho canonico |

Las licencias de los modelos de origen se indican como referencia; deben verificarse en cada ficha antes de un uso comercial. La licencia del repositorio de embeddings es CC BY 4.0.

## Limitaciones y advertencias

- No es un modelo: no se puede invocar para generar texto ni embeddings de textos nuevos; solo contiene vectores de los textos del dataset ETP-Eval26.
- Cobertura limitada a tres idiomas (latin, aleman, ingles) y a un dominio concreto (derecho canonico, latin medieval, historia).
- El corpus de pasajes es pequeno (2051 pasajes por idioma), por lo que las metricas tienen alta varianza y no extrapolan a otros dominios.
- Las 20.654 consultas no estan equilibradas necesariamente por estilo ni por persona; conviene segmentar al analizar resultados.
- Riesgo de sobreajuste en las variantes `-ft`: al haberse afinado sobre el mismo dominio del benchmark, las ganancias pueden no transferirse a otros corpus.
- La licencia CC BY 4.0 exige atribucion; los modelos de origen pueden imponer restricciones adicionales para uso comercial.
- El repositorio pertenece a un usuario no verificado y no figura enlazado desde el dataset original citado en la model card; conviene contrastar su procedencia antes de usarlo en produccion.
- No se documentan semillas, versiones de librerias ni proceso de generacion de los vectores, lo que limita la auditoria completa de la reproducibilidad.

## Enlaces

- Repositorio de embeddings: https://huggingface.co/dekmATtud/ETP-Eval26-embeddings
- Dataset ETP-Eval26: https://huggingface.co/datasets/mschonhardt/ETP-Eval26
- Modelo afinado etp-bgem3: https://huggingface.co/mschonhardt/etp-bgem3-contrastive-ft
- Modelo afinado etp-canonberta: https://huggingface.co/mschonhardt/etp-canonberta-contrastive-ft
- Modelo afinado etp-xlmr: https://huggingface.co/mschonhardt/etp-xlmr-contrastive-ft
- Modelo afinado etp-qwen0.6b: https://huggingface.co/mschonhardt/etp-qwen0.6b-contrastive-ft
- Modelo afinado etp-qwen4b: https://huggingface.co/mschonhardt/etp-qwen4b-contrastive-ft
- Backbone CanonBerta-v1: https://huggingface.co/mschonhardt/CanonBerta-v1

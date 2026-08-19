# guyyanai/CLSS

## Resumen

CLSS (Contrastive Learning Sequence-Structure) es un modelo de aprendizaje contrastivo de dos torres desarrollado por un equipo liderado por Guy Yanai, Gabriel Axel, Liam M. Longo, Nir Ben-Tal y Rachel Kolodny, publicado en Proceedings of the National Academy of Sciences (PNAS) en 2026. El modelo co-embebe secuencias y estructuras de proteinas en un espacio latente compartido, permitiendo analisis unificado del espacio proteico a traves de ambas modalidades. Esta disenado para abordar la cuestion fundamental de como la secuencia de aminoacidos determina la estructura tridimensional y la funcion biologica de las proteinas.

La arquitectura se compone de una torre de secuencia basada en un encoder tipo ESM2 entrenable y una torre de estructura basada en un encoder ESM3 congelado, seguidas de cabezas de proyeccion lineal que mapean a un espacio de embedding compartido con salidas normalizadas L2. El modelo se entrena con un objetivo contrastivo estilo CLIP, alineando segmentos de secuencia aleatorios con sus correspondientes estructuras de dominios completos, sin utilizar etiquetas jerarquicas como ECOD o CATH. La configuracion principal del paper utiliza embeddings de 32 dimensiones, aunque el repositorio ofrece multiples tamanos de embedding.

La relevancia actual de CLSS radica en que proporciona una representacion unificada de secuencia y estructura sin necesidad de etiquetas supervisadas, lo que permite explorar el espacio proteico de forma integrada. El repositorio incluye checkpoints de PyTorch Lightning que difieren en la dimensionalidad del embedding y en si fueron entrenados con secuencias completas o subsecuencias. El codigo esta disponible bajo licencia Apache 2.0, con una biblioteca Python dedicada (`clss-model`) para cargar los modelos y ejecutar inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos torres: encoder de secuencia tipo ESM2 (entrenable) + encoder de estructura ESM3 (congelado), con cabezas de proyeccion lineal y normalizacion L2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biologico, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch Lightning checkpoints (`.lckpt`) |

## Arquitectura y entrenamiento

CLSS sigue una arquitectura de dos torres. La torre de secuencia utiliza un encoder entrenable similar a ESM2, mientras que la torre de estructura emplea un encoder ESM3 congelado (EvolutionaryScale/esm3-sm-open-v1 como modelo base). Cada torre esta seguida de una cabeza de proyeccion lineal ligera que mapea las representaciones a un espacio de embedding compartido, con salidas normalizadas mediante L2. Esto hace que la similitud coseno sea directamente comparable entre modalidades.

El entrenamiento utiliza un objetivo contrastivo estilo CLIP: se alinean segmentos de secuencia aleatorios con sus correspondientes estructuras de dominios completos. Una caracteristica clave es que no se utilizan etiquetas jerarquicas (como ECOD o CATH) durante el entrenamiento; la organizacion estructural y evolutiva emerge de forma implicita a partir de los datos. El modelo fue entrenado sobre conjuntos grandes y diversos de dominios de proteinas, y el repositorio contiene dos variantes de checkpoints: `CLSS-full.lckpt` (entrenado exclusivamente con secuencias completas) y `CLSS-sub.lckpt` (entrenado con subsecuencias).

## Capacidades

- Co-embedding de secuencias y estructuras de proteinas en un espacio latente compartido, permitiendo comparacion directa mediante similitud coseno.
- Generacion de embeddings de secuencia y estructura con dimensionalidad configurable (la configuracion principal usa 32 dimensiones).
- Alineacion de segmentos de secuencia con estructuras de dominios completos.
- Exploracion del espacio proteico de forma unificada, sin necesidad de etiquetas jerarquicas supervisadas.
- Extraccion de caracteristicas (feature extraction) para tareas downstream de bioinformatica.
- Visualizacion interactiva del espacio proteico mediante reduccion de dimensionalidad (t-SNE) sobre los embeddings generados.

## Casos de uso

- Analisis de relaciones secuencia-estructura: los embeddings unificados permiten estudiar como variaciones en la secuencia se reflejan en cambios estructurales, facilitando la identificacion de principios de plegamiento.
- Clasificacion y agrupamiento de dominios de proteinas: al co-embedear secuencia y estructura, se pueden agrupar dominios por similitud funcional o estructural sin depender de clasificaciones jerarquicas preexistentes.
- Busqueda de proteinas por similitud estructural a partir de secuencia: dado un dominio de interes, se pueden encontrar proteinas con estructuras similares aunque sus secuencias diverjan, usando la proyeccion en el espacio compartido.
- Generacion de mapas interactivos del espacio proteico: el repositorio incluye ejemplos para crear visualizaciones 2D interactivas de dominios proteicos usando t-SNE sobre los embeddings, util para exploracion visual y divulgacion.
- Analisis evolutivo: al no usar etiquetas jerarquicas, el modelo puede revelar relaciones evolutivas emergentes entre dominios que las clasificaciones manuales podrian pasar por alto.
- Pre-entrenamiento para tareas downstream: los embeddings de CLSS pueden servir como caracteristicas de entrada para modelos supervisados en tareas como prediccion de funcion, estabilidad o interacciones proteina-proteina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (doi:10.1073/pnas.2532702123) podria contener evaluaciones comparativas, pero no se incluyen en la documentacion del repositorio ni en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio es de 4,6 GB, lo que sugiere que los checkpoints son manejables en GPUs de consumo medio, pero no se especifican requisitos exactos.
- GPU recomendadas: no disponible. Dado que el encoder de estructura es ESM3 congelado, la inferencia requiere ejecutar tanto ESM2 como ESM3; se recomienda una GPU con al menos 8-16 GB de VRAM para los modelos base implicados.
- Compatibilidad con GPU de consumo: probablemente si, dado el tamano del repositorio (4,6 GB) y la naturaleza de los encoders base (ESM2 y ESM3 small), pero no confirmado oficialmente.
- Opciones de despliegue: la biblioteca `clss-model` disponible en PyPI proporciona carga de modelos desde checkpoints de Lightning e inferencia de extremo a extremo. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que son tipicas para modelos de lenguaje general.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Modalidades | Licencia |
|---|---|---|---|---|---|
| CLSS | Dos torres (ESM2 + ESM3 congelado) | no disponible | no disponible | Secuencia + estructura | Apache 2.0 |
| ESM2 (facebook/esm2_t12_35M_UR50D) | Transformer encoder | 35M | 1024 tokens | Secuencia | MIT |
| ESM3 (EvolutionaryScale/esm3-sm-open-v1) | Transformer multimodal | no disponible | no disponible | Secuencia + estructura + funcion | no disponible |
| ProtT5 | Encoder-decoder T5 | ~3B | no disponible | Secuencia | Apache 2.0 |

CLSS se distingue de ESM2 y ESM3 por su objetivo especifico de co-embedding contrastivo entre modalidades, mientras que los modelos ESM son encoders generativos o de representacion general. ProtT5 es un modelo de lenguaje de proteinas basado en T5 que genera embeddings de secuencia, pero no integra informacion estructural de forma contrastiva.

## Limitaciones y advertencias

- El modelo esta especializado en dominios de proteinas; su rendimiento en proteinas completas, proteinas de membrana o regiones desordenadas no esta documentado.
- La configuracion principal usa embeddings de 32 dimensiones, lo que puede ser insuficiente para tareas que requieran representaciones de mayor granularidad; el repositorio ofrece alternativas, pero su rendimiento relativo no esta documentado.
- El encoder de estructura esta congelado (ESM3), por lo que las limitaciones del modelo base ESM3 se heredan en la torre de estructura.
- No se proporcionan datos sobre sesgos especificos, riesgo de alucinacion o limitaciones de contexto, ya que no es un modelo generativo de lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio advierte que se deben consultar las dependencias de terceros (ESM2 y ESM3) para verificar sus respectivas licencias.
- El numero de descargas y likes en HuggingFace es cero, lo que sugiere que el modelo es reciente y aun no ha sido ampliamente adoptado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/guyyanai/CLSS
- Repositorio GitHub (codigo y ejemplos): https://github.com/guyyanai/CLSS
- Paper (bioRxiv): https://doi.org/10.1101/2025.09.05.674454
- Paper (PNAS): https://www.pnas.org/doi/10.1073/pnas.2532702123 (doi:10.1073/pnas.2532702123)
- Visualizador interactivo CLSS: https://gabiaxel.github.io/clss-viewer/
- Paquete PyPI (`clss-model`): https://pypi.org/project/clss-model/

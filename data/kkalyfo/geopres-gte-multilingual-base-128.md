# kkalyfo/geopres-gte-multilingual-base-128

## Resumen

GeoPres projection: gte-multilingual-base a 128 dimensiones es un artefacto de reduccion de dimensionalidad publicado por el usuario kkalyfo bajo el identificador `kkalyfo/geopres-gte-multilingual-base-128`. No es un modelo de lenguaje ni un encoder de texto propiamente dicho, sino un mapa lineal `W` de 128 x 768 entrenado con la herramienta GeoPres para proyectar los embeddings de 768 dimensiones producidos por `Alibaba-NLP/gte-multilingual-base` a un espacio de 128 dimensiones, preservando las distancias euclideas por pares.

El problema que aborda es el coste de almacenamiento y de computo asociado a los indices vectoriales: reducir la dimensionalidad de los embeddings permite disminuir el uso de memoria y acelerar la busqueda por similitud, a cambio de una perdida controlada de fidelidad geometrica. La innovacion del metodo GeoPres, descrito en el articulo "On Post-Hoc Dimensionality Reduction of Text Embeddings" (EACL 2027), es que la proyeccion se entrena explicitamente para conservar las distancias por pares en lugar de aplicar tecnicas genericas como PCA o umap.

El repositorio es de tipo ligero (0.0 GB) porque el backbone esta congelado y no se incluye: solo se distribuye la matriz de proyeccion. La inferencia consiste en una unica multiplicacion de matrices, lo que lo hace extremadamente barato de desplegar junto a un pipeline de embeddings existente. El modelo se creo el 23 de noviembre de 2026 y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapa lineal (matriz de proyeccion 128 x 768) sobre embeddings congelados de `Alibaba-NLP/gte-multilingual-base` |
| Parametros totales | 98.304 (128 x 768) en la matriz de proyeccion; el backbone no se incluye |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del backbone `gte-multilingual-base`, no declarada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del backbone multilingue, sin listado explicito) |
| Licencia | no disponible |
| Formato de pesos | no disponible (libreria `geopres`; se carga via `GeoPres.from_pretrained` o `Projection.from_pretrained`) |

## Arquitectura y entrenamiento

La pieza central es una transformacion lineal `W` de forma 128 x 768 entrenada con GeoPres para preservar las distancias euclideas por pares entre embeddings de `Alibaba-NLP/gte-multilingual-base`. El backbone permanece congelado: no se ajusta ni se distribuye, y la proyeccion se aplica como post-proceso sobre las representaciones ya calculadas. El entrenamiento se realizo sobre embeddings del backbone calculados con el mismo pooling, normalizacion y prefijos que se esperan en inferencia, condicion que la model card exige explicitamente para que la proyeccion sea valida.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO (no aplicables, en cualquier caso, a un artefacto de este tipo). La innovacion tecnica es el criterio de optimizacion: en lugar de minimizar error de reconstruccion (como PCA), GeoPres optimiza la conservacion de la estructura de distancias, que es la magnitud que gobierna la calidad de la busqueda por similitud en un indice vectorial. La inferencia es una sola multiplicacion de matrices, sin coste de encoding adicional.

## Capacidades

- Reduccion de dimensionalidad de embeddings de 768 a 128 dimensiones mediante una proyeccion lineal entrenada.
- Preservacion de distancias euclideas por pares, orientada a mantener la calidad de la busqueda por similitud tras la reduccion.
- Proyeccion de embeddings ya calculados sin necesidad de descargar ni ejecutar el backbone (`Projection.project`).
- Encoding de texto de extremo a extremo cuando se usa la clase `GeoPres`, que combina el backbone con la proyeccion (`model.embed`).
- Compatibilidad con embeddings multilingues en la medida en que lo sea el backbone `gte-multilingual-base`; no se detalla la lista de idiomas.
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision ni audio: es un artefacto de post-proceso geometrico.
- No incluye modo thinking ni capacidades de agente.

## Casos de uso

- Busqueda semantica a gran escala: proyectar los embeddings de un corpus indexado con `gte-multilingual-base` a 128 dimensiones reduce el espacio ocupado por el indice vectorial aproximadamente a una sexta parte y acelera el calculo de distancias, manteniendo la estructura de vecindad que GeoPres optimiza.
- Reduccion de costes en bases de datos vectoriales: si el indice ya esta poblado con embeddings de 768 dimensiones, `Projection.project` permite transformarlos por lotes sin reencodificar el corpus ni descargar el backbone.
- Sistemas de recuperacion aumentada por generacion (RAG) con presupuesto de memoria ajustado: la proyeccion se aplica en el pipeline de ingesta y en el de consulta, de modo que el recuperador opera sobre vectores de 128 dimensiones y el generador recibe los pasajes recuperados.
- Deduplicacion y clustering de documentos: al conservar distancias por pares, la proyeccion es adecuada para agrupar textos similares con algoritmos de clustering sobre representaciones mas compactas.
- Despliegue en entornos con GPU de gama baja o CPU: la inferencia de la proyeccion es una multiplicacion de matrices de 128 x 768, lo que permite ejecutarla en el mismo nodo que el servicio de embeddings sin anadir latencia apreciable.
- Evaluacion comparativa de metodos de reduccion: sirve como referencia para medir la perdida de recall al pasar de 768 a 128 dimensiones frente a alternativas como PCA o truncamiento directo.
- Filtrado previo en sistemas de recomendacion o matching: la representacion compacta permite calcular similitudes aproximadas de forma barata antes de una reordenacion con el embedding completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para la proyeccion: insignificante; la matriz de 128 x 768 en precision de 32 bits ocupa aproximadamente 393 KB.
- VRAM del backbone: depende de `Alibaba-NLP/gte-multilingual-base`, que no se incluye en este repositorio y cuyos requisitos no se detallan en la informacion disponible.
- GPU recomendadas: cualquier GPU, incluida una GPU integrada o CPU, es suficiente para la proyeccion; el backbone marca el requisito real.
- Cabe en cualquier GPU de consumo, ya que la proyeccion por si sola no requiere acelerador.
- Opciones de despliegue: la libreria `geopres` (`GeoPres.from_pretrained` para encoding completo o `Projection.from_pretrained` para proyectar embeddings existentes). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al tratarse de una multiplicacion de matrices, el coste dominante sera el del backbone o el de la E/S de los vectores.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension de salida | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kkalyfo/geopres-gte-multilingual-base-128 | Proyeccion lineal post-hoc | 128 | Preservacion de distancias (GeoPres) | no disponible | Hugging Face, libreria `geopres` |
| PCA sobre embeddings de 768 dimensiones | Proyeccion lineal post-hoc | Configurable | Minimizacion del error de reconstruccion | no aplica | Implementaciones genericas (scikit-learn, NumPy) |
| Truncamiento de dimensiones | Seleccion de subespacio | Configurable | Ninguno | no aplica | Directo sobre el vector |
| Alibaba-NLP/gte-multilingual-base (sin reducir) | Encoder transformer | 768 | Entrenamiento del backbone | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La proyeccion solo es valida para embeddings de `Alibaba-NLP/gte-multilingual-base` calculados con el mismo pooling, normalizacion y prefijos que los datos de entrenamiento; cualquier desviacion invalida la garantia de preservacion de distancias.
- La reduccion de 768 a 128 dimensiones implica una perdida de informacion inevitable; no se documenta la magnitud de esa perdida ni metricas de recall.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido; debe consultarse con el autor antes de integrarlo en produccion.
- No se especifican los idiomas cubiertos ni sesgos conocidos; cualquier evaluacion de sesgo heredaria las caracteristicas del backbone.
- El repositorio no incluye el backbone, por lo que no es un artefacto autocontenido: requiere descargar y ejecutar `gte-multilingual-base` por separado para el flujo de encoding completo.
- El modelo tiene cero descargas y cero likes, sin historial de validacion por parte de la comunidad; debe tratarse como un artefacto experimental.
- No hay informacion sobre cuantizacion ni sobre formatos alternativos de pesos; la unica via documentada es la libreria `geopres`.
- No se han publicado benchmarks que respalden la calidad de la proyeccion frente a alternativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kkalyfo/geopres-gte-multilingual-base-128
- Backbone: https://huggingface.co/Alibaba-NLP/gte-multilingual-base
- Repositorio de GeoPres: https://github.com/konstantinoskalyfommatos/geopres
- Paper (EACL 2027): https://openreview.net/forum?id=vAWo3CIzqp

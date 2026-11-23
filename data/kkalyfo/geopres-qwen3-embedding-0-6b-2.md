# kkalyfo/geopres-qwen3-embedding-0.6b-2

## Resumen

GeoPres projection es un artefacto de reduccion de dimensionalidad publicado por el usuario kkalyfo bajo el identificador `kkalyfo/geopres-qwen3-embedding-0.6b-2`. No es un modelo de lenguaje ni un modelo de embeddings completo, sino una proyeccion lineal aprendida (`W`, de dimensiones 2 x 1024) que transforma los embeddings de 1024 dimensiones producidos por `Qwen/Qwen3-Embedding-0.6B` en vectores de solo 2 dimensiones, preservando las distancias euclideas por pares entre ellos. El backbone Qwen3-Embedding-0.6B no se incluye en el repositorio y permanece congelado durante la inferencia.

La pieza se entrena con la libreria GeoPres, cuyo metodo se describe en el articulo "On Post-Hoc Dimensionality Reduction of Text Embeddings" (EACL 2027). El caso de 2 dimensiones es un caso extremo pensado para visualizacion: segun la propia model card, a ese tamano la retencion de rendimiento en MTEB cae al 35-38 % respecto al modelo completo.

El repositorio tiene un tamano de 0.0 GB, sin descargas ni likes en el momento de la consulta, y no declara licencia, idiomas ni pipeline. Su relevancia es acotada: sirve como herramienta auxiliar para exploracion visual y didactica de espacios de embeddings, no como sustituto de un modelo de embeddings en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyeccion lineal post-hoc (matriz `W` de 2 x 1024) sobre embeddings congelados de Qwen/Qwen3-Embedding-0.6B |
| Parametros totales | 2048 (matriz de proyeccion); el backbone no se incluye |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del backbone Qwen3-Embedding-0.6B, no declarada en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (libreria `geopres`; pesos cargables con `GeoPres.from_pretrained` y `Projection.from_pretrained`) |

## Arquitectura y entrenamiento

La arquitectura es una unica transformacion lineal aprendida que mapea un vector de 1024 dimensiones a 2 dimensiones. El backbone Qwen3-Embedding-0.6B se mantiene congelado y no forma parte del repositorio: la inferencia consiste en calcular el embedding con el backbone y aplicar una multiplicacion de matrices. El objetivo de entrenamiento es preservar las distancias euclideas por pares entre embeddings del backbone, segun el metodo GeoPres descrito en el articulo asociado.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de ajuste adicionales. La model card advierte que la entrada debe ser embeddings de Qwen/Qwen3-Embedding-0.6B calculados con el mismo pooling, normalizacion y prefijos que los datos de entrenamiento, lo que hace la proyeccion dependiente del pipeline exacto de generacion de embeddings.

## Capacidades

- Reduccion de dimensionalidad de embeddings de 1024 a 2 dimensiones mediante una multiplicacion de matrices.
- Preservacion de distancias euclideas por pares en el espacio reducido, segun el objetivo declarado del entrenamiento.
- Encapsulamiento del backbone: la clase `GeoPres` permite pasar texto directamente y obtener el vector de 2 dimensiones.
- Proyeccion de embeddings preexistentes: la clase `Projection` aplica la matriz sobre embeddings ya calculados (por ejemplo, procedentes de TEI, una base de datos vectorial o un proceso por lotes) sin descargar el backbone.
- No ofrece generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni soporte multilingue declarado.

## Casos de uso

- Visualizacion de espacios de embeddings: proyectar un corpus a 2 dimensiones para representarlo en un scatter plot y explorar la estructura de clusters de forma inmediata, aprovechando que el caso 2D esta pensado explicitamente para visualizacion.
- Analisis exploratorio de datos (EDA) en proyectos de NLP: reducir embeddings de documentos o consultas a coordenadas 2D para inspeccionar separabilidad de clases antes de entrenar un clasificador.
- Didactica y divulgacion: mostrar de forma grafica como se organizan semanticamente los embeddings de un modelo de 0.6B sin necesidad de tecnicas como t-SNE o UMAP.
- Diagnostico de pipelines de embeddings: comparar visualmente si dos lotes de embeddings calculados con pooling o normalizacion distintos se distribuyen de forma coherente.
- Prototipado rapido de interfaces: generar coordenadas 2D para un mapa interactivo de documentos o consultas en demos y pruebas de concepto.
- Proyeccion de embeddings ya almacenados en una base de datos vectorial: aplicar `Projection.project` sobre una matriz `(n, 1024)` sin volver a ejecutar el backbone, util para anadir una vista 2D a un indice existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente cuantifica la perdida de rendimiento: a 2 dimensiones la retencion en MTEB cae al 35-38 % respecto al modelo completo (seccion 6 del articulo).

## Requisitos de hardware

- VRAM para la proyeccion: practicamente despreciable (2048 parametros); el coste real lo determina el backbone Qwen3-Embedding-0.6B cuando se usa la clase `GeoPres`.
- VRAM para el backbone: no disponible en la informacion proporcionada; depende del modelo Qwen3-Embedding-0.6B y de la precision de carga.
- GPU recomendadas: no disponible. Para el modo `Projection` (solo matriz) no se requiere GPU.
- Cabe en GPU de consumo: si, en el modo `Projection`, al no descargarse el backbone; para el modo `GeoPres` depende de los requisitos del backbone, no declarados.
- Opciones de despliegue: libreria `geopres` (clases `GeoPres` y `Projection`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo indica que la inferencia es una multiplicacion de matrices.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension de salida | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| geopres-qwen3-embedding-0.6b-2 | Proyeccion lineal post-hoc | 2 | 2048 (matriz) | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3-Embedding-0.6B | Modelo de embeddings | 1024 | 0.6B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| PCA / t-SNE / UMAP | Metodos clasicos de reduccion | configurable (2, 50, etc.) | no aplica | no aplica | segun implementacion | Amplia |

La comparacion con PCA, t-SNE o UMAP es la mas directa por categoria funcional; no se dispone de otros artefactos GeoPres comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La retencion de rendimiento en MTEB a 2 dimensiones es del 35-38 % del modelo completo, por lo que no es adecuado para tareas de recuperacion, clasificacion o similitud en produccion.
- Dependencia estricta del backbone: la entrada debe ser embeddings de Qwen/Qwen3-Embedding-0.6B calculados con el mismo pooling, normalizacion y prefijos que los datos de entrenamiento; cualquier desviacion invalida la proyeccion.
- El backbone no se incluye en el repositorio y debe obtenerse por separado.
- No se declara licencia, lo que impide confirmar condiciones de uso comercial.
- No se declaran idiomas soportados ni sesgos conocidos; al heredar las representaciones del backbone, cualquier sesgo de este se refleja en el espacio 2D.
- El repositorio no registra descargas ni likes, y su fecha de creacion es posterior a la de esta consulta; la madurez y el mantenimiento del artefacto no estan contrastados.
- Riesgo de alucinacion no aplicable: el artefacto no genera texto.

## Enlaces

- Hugging Face: https://huggingface.co/kkalyfo/geopres-qwen3-embedding-0.6b-2
- Backbone: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Repositorio GeoPres: https://github.com/konstantinoskalyfommatos/geopres
- Paper (EACL 2027): https://openreview.net/forum?id=vAWo3CIzqp

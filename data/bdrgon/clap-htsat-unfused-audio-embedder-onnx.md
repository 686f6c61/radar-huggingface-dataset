# bdrgon/clap-htsat-unfused-audio-embedder-onnx

## Resumen

Este repositorio contiene una exportacion a ONNX del encoder de audio del modelo LAION CLAP HTSAT Unfused, publicada por el usuario bdrgon. CLAP (Contrastive Language-Audio Pretraining) es un modelo de representacion audio-texto desarrollado en el marco del proyecto LAION; este repositorio aísla unicamente el encoder de audio y lo empaqueta en formato ONNX para su despliegue en entornos de inferencia ligeros y multiplataforma.

El modelo toma audio mono a 48 kHz, preprocesado previamente con el `ClapProcessor` de referencia, y devuelve un embedding de 512 dimensiones con normalizacion L2. No genera texto ni realiza ninguna tarea generativa: su funcion es puramente de extraccion de caracteristicas (feature extraction) sobre senal de audio, lo que lo hace util como bloque de representacion para tareas de recuperacion, similitud, clustering o clasificacion por vecinos.

Su relevancia practica radica en el formato de distribucion: al estar exportado a ONNX con tres niveles de cuantizacion (FP32, INT8 dinamico e INT4 weight-only) y con pesos de 22,3 MB en su version mas ligera, puede ejecutarse en CPU o en dispositivos con recursos limitados sin necesidad de GPU. La licencia Apache 2.0 facilita su integracion en productos comerciales. El repositorio, creado en octubre de 2026, no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HTSAT (Hierarchical Token-Semantic Audio Transformer), encoder de audio de CLAP, exportado a ONNX |
| Parametros totales | no disponible (estimado en torno a 29 M a partir del tamano del archivo FP32 de 117,3 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de forma fija `input_features` float32 `[1, 1, 1001, 64]` (ventana derivada de aproximadamente 10 s de audio mono a 48 kHz) |
| Tipos de cuantizacion | FP32 (117,3 MB), INT8 dynamic (33,8 MB), INT4 weight-only (22,3 MB) |
| Idiomas soportados | no disponible (modelo de audio, no de texto; el encoder de audio en si no procesa idioma) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (opset 17); INT4 requiere soporte de `com.microsoft::MatMulNBits` en ONNX Runtime |

## Arquitectura y entrenamiento

La arquitectura subyacente es HTSAT, un transformer jerarquico con tokens semantico-jerarquicos utilizado como encoder de audio dentro del modelo CLAP de LAION. El modelo base indicado es `laion/clap-htsat-unfused`; el sufijo "unfused" hace referencia a que el extractor de caracteristicas se mantiene como componente separado en lugar de fusionarse con el modelo, lo que obliga a realizar la decodificacion y el preprocesado de forma externa (mediante el `ClapProcessor` fijado). Esta exportacion concreta contiene unicamente el encoder de audio; el encoder de texto que forma la otra mitad del sistema CLAP original no esta incluido en el repositorio.

No se dispone, en la informacion proporcionada, de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. La exportacion a ONNX no introduce capas adicionales mas alla del cambio de backend de ejecucion; la innovacion respecto al modelo original es el propio pipeline de exportacion y la disponibilidad de variantes cuantizadas, incluida una INT4 weight-only que reduce el peso a 22,3 MB. La entrada esperada se limita a un tensor de caracteristicas precalculado, no a la forma de onda cruda.

## Capacidades

- Extraccion de embeddings de audio de 512 dimensiones con normalizacion L2 a partir de una entrada de caracteristicas de forma `[1, 1, 1001, 64]`.
- Representacion de audio para tareas de similitud, recuperacion y clustering mediante distancia coseno o producto escalar.
- Integracion en pipelines de busqueda vectorial al producir vectores de tamano fijo y comparable.
- Ejecucion en ONNX Runtime sobre CPU y aceleradores compatibles, sin dependencia del ecosistema PyTorch en tiempo de inferencia.
- Soporte de tool calling / function calling: no aplica (no es un modelo generativo ni conversacional).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica al encoder de audio; el emparejamiento texto-audio del CLAP original no esta disponible en este repositorio al faltar el encoder de texto.
- Modo thinking, vision o audio generativo: no disponible en este repositorio (el encoder consume audio, no lo genera).

## Casos de uso

- Busqueda semantica de audio: el modelo genera embeddings normalizados que pueden almacenarse en una base vectorial (por ejemplo, FAISS o Qdrant) para recuperar fragmentos acusticamente similares a partir de una consulta de audio, gracias a vectores de 512 dimensiones de tamano constante.
- Deduplicacion y clustering de catalogos de audio: al normalizar los embeddings a norma unitaria, se pueden agrupar grabaciones casi identicas o detectar versiones duplicadas dentro de bibliotecas musicales o de efectos de sonido mediante clustering (k-means o HDBSCAN sobre distancia coseno).
- Sistemas de recomendacion por similitud acustica: representar cada pista con su embedding y recomendar elementos con vectores cercanos, sin necesidad de metadatos ni de caracteristicas manuales.
- Clasificacion de eventos sonoros mediante embeddings mas clasificador: extraer representaciones y entrenar un clasificador ligero encima para tareas de monitorizacion ambiental o industrial; el modelo no resuelve la clasificacion por si solo, pero aporta el espacio de caracteristicas.
- Indexacion de audio para RAG multimodal: combinar los embeddings de este encoder con embeddings de texto precalculados por el encoder de texto del CLAP original para habilitar recuperacion cruzada texto-audio, siempre que se disponga de dicho encoder por separado.
- Moderacion y analisis de contenido sonoro: agrupar y detectar similitudes en grandes volumenes de audio con coste de computo bajo, aprovechando la variante INT8 de 33,8 MB para procesar por lotes en CPU.
- Despliegue en el borde (edge) y en dispositivos sin GPU: al pesar entre 22,3 MB y 117,3 MB, el modelo cabe en entornos embebidos o navegador mediante ONNX Runtime Web, lo que permite extraer embeddings localmente sin enviar el audio a un servidor.
- Clasificacion zero-shot mediante etiquetas precalculadas: si se disponen de embeddings de texto de las clases obtenidos con el CLAP completo, este encoder puede emplearse para comparar el audio contra esas etiquetas sin reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las variantes; el modelo puede ejecutarse sin GPU asignando unicamente memoria RAM. Los pesos ocupan 117,3 MB (FP32), 33,8 MB (INT8) y 22,3 MB (INT4), a lo que se suma el coste de activaciones, muy reducido dado el tamano de la entrada.
- GPU recomendadas: cualquiera con soporte de ONNX Runtime, incluidas NVIDIA GTX/RTX, A100 o H100; el modelo es lo bastante pequeno como para no aprovechar la capacidad de estos aceleradores salvo en escenarios de altisimo paralelismo por lotes.
- Compatibilidad con GPU de consumo: si, cabe con holgura en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java, JavaScript/Web, movil), lo que permite inferencia en servidor, navegador o dispositivo. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje generativos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Tamano de pesos | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| bdrgon/clap-htsat-unfused-audio-embedder-onnx (este) | ONNX (opsets 17), FP32/INT8/INT4 | 22,3-117,3 MB | `[1, 1, 1001, 64]` | embedding 512 dim | apache-2.0 | HuggingFace, ONNX Runtime |
| laion/clap-htsat-unfused (modelo base) | PyTorch | no disponible | audio via ClapProcessor | embedding de audio y de texto | no disponible en la informacion | HuggingFace, requiere PyTorch |
| Otros modelos de embeddings de audio | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas relevante es con el modelo base `laion/clap-htsat-unfused`, del que esta exportacion deriva: la diferencia principal es el formato (ONNX frente a PyTorch), la disponibilidad de cuantizaciones y, presumiblemente, la ausencia del encoder de texto en este repositorio. No se dispone de datos para comparar con otras familias de embeddings de audio en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene unicamente el encoder de audio; no incluye el encoder de texto del CLAP original, por lo que no puede realizar tareas texto-audio (como clasificacion zero-shot con etiquetas de texto) sin disponer por separado de embeddings de texto compatibles.
- La entrada es de forma fija `[1, 1, 1001, 64]` y requiere preprocesado externo con el `ClapProcessor` de referencia; la decodificacion del audio y el calculo de caracteristicas no forman parte del grafo ONNX.
- La variante INT4 depende de que ONNX Runtime soporte el operador `com.microsoft::MatMulNBits`; si el backend no lo implementa, el modelo no cargara correctamente.
- No se dispone de informacion sobre sesgos del modelo ni sobre la composicion del dataset de entrenamiento del modelo base.
- Riesgo de alucinacion: no aplica, ya que el modelo no es generativo y solo produce representaciones vectoriales.
- Limitaciones de idioma: no aplicables al encoder de audio, pero el sistema CLAP original esta orientado a emparejamientos audio-texto en ingles; un uso cruzado con otros idiomas no esta documentado en la informacion disponible.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion con atribucion; conviene verificar las condiciones del modelo base `laion/clap-htsat-unfused` antes de un despliegue en produccion.
- El repositorio no registra descargas ni valoraciones en el momento de redactar la ficha, por lo que no existe validacion de la comunidad sobre su correccion o su fidelidad numerica respecto al modelo original.
- Al tratarse de una exportacion de un tercero, no se garantiza que los resultados coincidan bit a bit con la implementacion de referencia en PyTorch.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bdrgon/clap-htsat-unfused-audio-embedder-onnx
- Modelo base: https://huggingface.co/laion/clap-htsat-unfused
- Hashes SHA-256 de los pesos (proporcionados en la model card):
  - `audio_model.onnx`: `1f1860e19468535ef0712b5b611c65a7d3d94abc0930b6aaf1671b64f9c56b62`
  - `audio_model_int8.onnx`: `65a5536520f348bef32a032044136ceef6b780bf62c78941f5b3f6846e073ace`
  - `audio_model_int4.onnx`: `d08f0a1808088900ccc2584eb4fc5168040e3026bdfaedddb330168f754c9785`
- Papel, blog o repositorio de LAION CLAP: no disponible en la informacion proporcionada.

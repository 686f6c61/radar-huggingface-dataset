# heykorshun/xlm-roberta-large-xnli-anli-mlx-int8

## Resumen

`heykorshun/xlm-roberta-large-xnli-anli-mlx-int8` es una conversion a 8 bits para MLX Swift del modelo de clasificacion zero-shot `vicgalle/xlm-roberta-large-xnli-anli`, a su vez un ajuste fino de `FacebookAI/xlm-roberta-large` sobre datos NLI (inferencia de lenguaje natural). El modelo original resuelve tareas de clasificacion cero-disparo: dado un texto y un conjunto de etiquetas candidatas, devuelve la probabilidad de que cada etiqueta sea correcta sin necesidad de entrenamiento adicional.

El peso de esta publicacion no esta en la arquitectura, sino en el formato: el autor carga los pesos fp32 originales con su propio cargador MLX Swift, los cuantiza en memoria (`MLXNN.quantize`, affine, 8 bits, group size 64) y los guarda como `model.safetensors`. El resultado pasa de unos 2,2 GB en fp32 a 0,63 GB, lo que permite ejecutar un clasificador NLI multilingue completamente en local en un Mac con Apple Silicon.

Es relevante ahora porque cubre un hueco concreto: inferencia de clasificacion de texto en el ecosistema MLX/MLX Swift sin depender de Python ni de la nube. El modelo lo usa Stilltone, una aplicacion de notas de reunion para macOS, para determinar si una afirmacion nueva contradice o resuelve una anterior. La licencia MIT del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo XLM-RoBERTa-large (BERT con embeddings SentencePiece), tarea de clasificacion de pares de frases |
| Parametros totales | 157.997.827 segun metadatos de safetensors del checkpoint cuantizado (la arquitectura XLM-RoBERTa-large original tiene aproximadamente 560 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; la arquitectura XLM-RoBERTa limita la posicion a 512 tokens |
| Tipos de cuantizacion | 8 bits, modo affine, group size 64 (unico esquema incluido); pesos originales en fp32 disponibles en el repositorio base |
| Idiomas soportados | No disponible en la model card; el modelo base XLM-RoBERTa-large se entrena sobre 100 idiomas y la model card lo describe como clasificador NLI multilingue |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` en formato MLX Swift (nombres de parametro estilo `MLXEmbedders` `BertModel` tras `sanitize`); no compatible con Transformers ni sentence-transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es XLM-RoBERTa-large: un encoder transformer de 24 capas, 1024 dimensiones ocultas y 16 cabezas de atencion, con un vocabulario SentencePiece compartido de 250.000 tokens. Es un modelo de representacion bidireccional (no generativo), y la tarea concreta en `vicgalle/xlm-roberta-large-xnli-anli` es clasificacion de secuencias sobre pares (premisa, hipotesis) para NLI, reutilizada como clasificador zero-shot mediante plantillas de hipotesis.

El unico entrenamiento realizado en este repositorio es un proceso de cuantizacion post-entrenamiento: el autor carga los pesos fp32 con el cargador MLX Swift de Stilltone y aplica `MLXNN.quantize` con modo affine, 8 bits y group size 64 sobre las capas `Linear` y `Embedding` por defecto. Las capas cuantizadas almacenan `weight`, `scales` y `biases`. `config.json` es una copia sin cambios de la revision fuente `85981da85b85045fecd6e81e501767de7da370eb`. Como el repositorio original no incluye `tokenizer.json`, los ficheros de tokenizacion se toman de `BAAI/bge-reranker-v2-m3` (Apache-2.0), que comparte el mismo vocabulario SentencePiece.

Como validacion, el autor ejecuta un benchmark interno de Stilltone ("memory-diff", con cuatro paquetes: ingles, checo y un paquete parlamentario multilingue) sobre el embedder, el reranker y el modelo NLI conjuntamente, y afirma obtener resultados identicos byte a byte frente a los pesos fp32 originales. No se documenta ningun ajuste fino ni RLHF adicional sobre esta version.

## Capacidades

- Clasificacion zero-shot de texto: asigna un texto a etiquetas arbitrarias definidas en tiempo de inferencia, sin reentrenamiento.
- NLI (inferencia de lenguaje natural): distingue entre implicacion, neutralidad y contradiccion entre una premisa y una hipotesis.
- Deteccion de contradicciones y de resolucion de afirmaciones, que es el uso declarado por el autor en la aplicacion Stilltone.
- Capacidad multilingue heredada de XLM-RoBERTa-large (cobertura nominal de 100 idiomas en el modelo base).
- Inferencia totalmente local en macOS sobre Apple Silicon mediante MLX Swift.
- No soporta generacion de texto, tool calling, function calling, agentes, vision, audio ni modo de razonamiento: es un encoder de clasificacion, no un modelo generativo.

## Casos de uso

- Deteccion de contradicciones en notas de reunion: integrado en una aplicacion local, el modelo compara cada afirmacion nueva con las notas historicas y decide si la contradice o la resuelve, sin enviar datos a la nube.
- Clasificacion zero-shot de tickets de soporte: definir etiquetas como "facturacion", "bug" o "solicitud de funcionalidad" y clasificar cada mensaje sin entrenar un clasificador especifico.
- Moderacion de contenido multilingue: usar plantillas de hipotesis ("este texto es abusivo") para puntuar mensajes en varios idiomas en un pipeline local.
- Etiquetado y filtrado de datasets: preanotar grandes volumenes de texto en varios idiomas antes de revisar manualmente, aprovechando el coste reducido de la version 8 bits.
- Clasificacion de documentos legales o administrativos por tematica, con etiquetas definidas por el usuario y sin ejemplos etiquetados.
- Enrutado de consultas en un sistema RAG: determinar a que categoria o indice pertenece una pregunta antes de recuperar documentos.
- Deteccion de duplicados semanticos y de afirmaciones incompatibles entre dos documentos, comparando pares de frases.
- Aplicaciones macOS nativas con MLX Swift: cualquier app que necesite un clasificador NLI embebido y de bajo consumo de memoria (0,63 GB en disco).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evaluacion citada es una comprobacion interna de Stilltone que verifica resultados identicos byte a byte frente a los pesos fp32 originales en cuatro paquetes (ingles, checo y un paquete parlamentario multilingue). No se aportan cifras de MMLU, GLUE, XNLI ni de latencia o throughput.

## Requisitos de hardware

- VRAM/RAM estimada: 0,63 GB de pesos en disco en 8 bits; el consumo en ejecucion depende del runtime MLX y del lote, con una huella bastante inferior a la version fp32 de aproximadamente 2,2 GB.
- Cabe en cualquier Mac con Apple Silicon; el modelo esta pensado explicitamente para ejecucion local en macOS.
- No esta preparado para GPU Nvidia ni para CUDA: los pesos son MLX Swift y no se cargan con `transformers` ni `sentence-transformers`.
- Opciones de despliegue: MLX Swift, construyendo el mismo modulo `BertModel` y llamando antes a `quantize(model:groupSize:64,bits:8,mode:.affine)`, y cargando despues los arrays. Para otros entornos hay que usar el repositorio original `vicgalle/xlm-roberta-large-xnli-anli` (vLLM, TGI, transformers, ONNX, etc.).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `heykorshun/xlm-roberta-large-xnli-anli-mlx-int8` | 158 M en el checkpoint cuantizado (base ~560 M) | No especificado (arquitectura de 512 tokens) | safetensors MLX Swift, 8 bits affine | MIT | Solo entorno MLX Swift; 0 descargas y 0 likes |
| `vicgalle/xlm-roberta-large-xnli-anli` | ~560 M | 512 tokens | safetensors Transformers (fp32) | MIT | Ecosistema Transformers; version original sin cuantizar |
| `FacebookAI/xlm-roberta-large` | ~560 M | 512 tokens | safetensors Transformers | MIT | Modelo base multilingue, sin ajuste NLI |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Los pesos no son un checkpoint de Transformers: hay que construir el modulo MLX Swift, cuantizarlo antes de cargar y usar `quantization.json`. `transformers` y `sentence-transformers` no pueden cargarlos directamente.
- El modelo esta atado al ecosistema MLX Swift y a macOS/Apple Silicon; no hay version GGUF, ONNX ni CUDA.
- La cuantizacion a 8 bits puede degradar ligeramente la precision frente a fp32, aunque el autor afirma resultados identicos en su benchmark interno; esa validacion no constituye una evaluacion publica independiente.
- El repositorio no incluye `tokenizer.json`: se toman los ficheros de tokenizacion de `BAAI/bge-reranker-v2-m3` bajo Apache-2.0, lo que conviene tener en cuenta para atribucion.
- La model card no enumera idiomas soportados; la cobertura multilingue se hereda del modelo base y no esta verificada en este repositorio.
- Riesgo de alucinacion no aplica en el sentido generativo (no produce texto libre), pero si existe riesgo de clasificaciones erroneas: la calidad depende en gran medida de como se formulen las etiquetas y las plantillas de hipotesis.
- Limitacion de contexto de 512 tokens propia de la arquitectura XLM-RoBERTa, que restringe la longitud de las premisas e hipotesis.
- Sesgos heredados del corpus de preentrenamiento de XLM-RoBERTa-large; no se documenta ningun proceso de mitigacion.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- Licencia MIT para el modelo y Apache-2.0 para los ficheros de tokenizacion, ambas permisivas para uso comercial, siempre que se respete la atribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/heykorshun/xlm-roberta-large-xnli-anli-mlx-int8
- Modelo base original: https://huggingface.co/vicgalle/xlm-roberta-large-xnli-anli
- Modelo base de XLM-RoBERTa-large: https://huggingface.co/FacebookAI/xlm-roberta-large
- Tokenizer de origen: https://huggingface.co/BAAI/bge-reranker-v2-m3

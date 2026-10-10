# ItsOkayNow/bge-XDNA1-NPUE-PACKS

## Resumen

ItsOkayNow/bge-XDNA1-NPUE-PACKS es un repositorio de empaquetado que recopila cuatro modelos de embeddings de la familia BGE (BAAI General Embedding) reconvertidos desde el formato ONNX al formato NPUE, pensado para ejecutarse sobre la NPU AMD XDNA1 integrada en las APU Ryzen AI de primera generacion (Phoenix y Hawk Point). No se trata de un modelo entrenado desde cero, sino de una conversión y empaquetado que adapta pesos ya existentes a un formato ejecutable por la unidad de procesamiento neuronal de AMD.

El pack incluye las siguientes variantes de origen: BAAI/bge-small-en-v1.5, TaylorAI/bge-micro-v2, BAAI/bge-large-en-v1.5 y BAAI/bge-base-en-v1.5. Todos son modelos de embeddings de texto en ingles basados en arquitecturas transformer de tipo encoder (familia BERT) y orientados a tareas de recuperacion semantica, busqueda vectorial y generacion aumentada por recuperacion (RAG).

Su relevancia radica en que permite ejecutar embeddings sobre la NPU XDNA1 bajo Linux sin depender de las pilas propietarias que, segun la documentacion publica, solo dan soporte a XDNA2 (FastFlowLM, AMD Lemonade). El repositorio de codigo asociado es hardWorker254/Npu-Embeddings-XDNA1. El repo ocupa 4,4 GB, tiene licencia MIT y, en el momento de la consulta, registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo encoder (familia BERT); pack de 4 modelos de embeddings |
| Parametros totales | Pack de 4 modelos: bge-large-en-v1.5 y bge-base-en-v1.5 junto a bge-small-en-v1.5 y bge-micro-v2 (cifra agregada no disponible) |
| Longitud de contexto | 512 tokens (valor estandar de la familia BGE v1.5) |
| Tipos de cuantizacion | No disponible (el formato NPUE deriva de una conversion ONNX; el nivel de cuantizacion no se especifica en la model card) |
| Idiomas soportados | Ingles (sufijo "en" en todos los modelos de origen) |
| Licencia | MIT |
| Formato de pesos | NPUE (reconvertidos desde ONNX) |
| Tamano del repositorio | 4,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Los modelos empaquetados son encoders transformer bidireccionales de la familia BGE (basados en BERT). Cada variante se diferencia en tamano y dimension de embedding: bge-micro-v2 (destilado, el mas ligero), bge-small-en-v1.5, bge-base-en-v1.5 y bge-large-en-v1.5 (el mas grande). Estos modelos generan representaciones vectoriales densas para similitud semantica y recuperacion, con una ventana de contexto de 512 tokens. La innovacion de la version v1.5 de BGE frente a la v1.0 es una mejora de la capacidad de recuperacion mediante el ajuste fino con datos de pares instruccion-consulta, segun la documentacion de los modelos originales.

El aporte de este repositorio no es el entrenamiento sino la **conversion de formato**: los pesos se toman desde ONNX y se reconvierten a NPUE para que puedan ejecutarse en la NPU XDNA1. No se detalla en la model card informacion sobre el proceso de cuantizacion, calibracion, ni sobre el dataset ni las tecnicas de ajuste (RLHF/DPO) empleadas, ya que esos detalles pertenecen a los modelos BGE originales y no a esta conversion. La arquitectura hardware subyacente, XDNA1, es la variante de consumo de la microarquitectura AIE-ML (AIE2) de AMD, con soporte abierto limitado a traves del repositorio Npu-Embeddings-XDNA1.

## Capacidades

- Generacion de embeddings de texto en ingles para similitud semantica y recuperacion.
- Busqueda vectorial y recuperacion de documentos por relevancia semantica.
- Soporte para pipelines de RAG (Retrieval-Augmented Generation) como componente de indexacion y consulta.
- Clustering y clasificacion de texto mediante representaciones vectoriales.
- Deteccion de duplicados y near-duplicate matching sobre corpus de texto.
- Ejecucion en la NPU XDNA1 (APU Ryzen AI Phoenix/Hawk Point) bajo Linux, como alternativa a la CPU/GPU.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento (thinking mode).
- Capacidad multilingue no disponible: los modelos de origen son exclusivamente en ingles.

## Casos de uso

- **Busqueda semantica local en aplicaciones de escritorio**: ejecutar embeddings sobre la NPU XDNA1 permite indexar y consultar documentacion sin enviar datos a la nube, aprovechando la NPU para liberar CPU y GPU.
- **Componente de recuperacion en pipelines RAG**: usar bge-small o bge-base como recuperador (retriever) para alimentar a un LLM con pasajes relevantes, con la ventana de 512 tokens de la familia BGE.
- **Sistemas de recomendacion de contenido**: generar vectores de articulos, noticias o productos y calcular similitud para sugerir elementos relacionados.
- **Deduplicacion de corpus y control de calidad de datos**: agrupar documentos casi identicos en pipelines de preprocesamiento de datasets mediante similitud coseno.
- **Clasificacion y enrutado de tickets de soporte**: representar el texto de incidencias como vectores y asignarlas a categorias o colas por cercania a ejemplos etiquetados.
- **Moderacion y monitorizacion de contenido**: comparar mensajes entrantes contra embeddings de referencia para detectar contenido similar a patrones conocidos.
- **Aplicaciones de IA en el borde (edge) con NPU**: desplegar busqueda semantica en portatiles con Ryzen AI de primera generacion, reduciendo dependencia de aceleradores dedicados.
- **Prototipado de investigacion en recuperacion**: comparar las cuatro variantes (micro, small, base, large) en funcion del equilibrio entre latencia y calidad de recuperacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MTEB, recuperacion, ni comparativas numericas, y los resultados de la busqueda web no aportan cifras de rendimiento para este paquete.

## Requisitos de hardware

- **Hardware objetivo principal**: NPU AMD XDNA1, presente en APU Ryzen AI de primera generacion (Phoenix y Hawk Point, por ejemplo Ryzen 7040 y 8040, y APUs de escritorio como el Ryzen 7 8700G o el 7840HS).
- **Sistema operativo**: Linux con kernel 6.12 o superior, driver XDNA y runtime XRT, segun la guia de configuracion publica de XDNA1/Phoenix.
- **VRAM/RAM**: no disponible como cifra concreta. El repositorio ocupa 4,4 GB, pero el consumo en inferencia depende de la variante concreta del pack y del nivel de cuantizacion del formato NPUE.
- **GPU dedicada**: no requerida; el modelo esta pensado para ejecutarse en la NPU. No se documentan requisitos de GPU (A100, H100, RTX 4090, etc.).
- **Consumer GPU / CPU**: las variantes de origen pueden ejecutarse en CPU, pero este paquete esta orientado especificamente a la NPU XDNA1.
- **Opciones de despliegue**: el codigo de ejecucion se distribuye en el repositorio hardWorker254/Npu-Embeddings-XDNA1. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia convencionales para el formato NPUE.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bge-XDNA1-NPUE-PACKS (este repo) | Pack de 4 embeddings BGE reconvertidos a NPUE | 512 tokens | Ingles | MIT | HuggingFace, ejecucion en NPU XDNA1 |
| BAAI/bge-large-en-v1.5 (original) | Embedding transformer encoder | 512 tokens | Ingles | MIT | HuggingFace, ONNX/PyTorch/safetensors |
| BAAI/bge-base-en-v1.5 (original) | Embedding transformer encoder | 512 tokens | Ingles | MIT | HuggingFace, ONNX/PyTorch/safetensors |
| TaylorAI/bge-micro-v2 (original) | Embedding destilado ligero | No disponible | Ingles | No disponible | HuggingFace |

No se dispone de datos numericos de rendimiento para establecer una comparativa cuantitativa con alternativas como E5, GTE o all-MiniLM-L6-v2. La comparacion anterior se limita a caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- **Idioma**: todos los modelos de origen son en ingles; no se documenta soporte multilingue.
- **Ventana de contexto**: 512 tokens, insuficiente para documentos largos sin fragmentacion previa (chunking).
- **Sesgos**: los sesgos de los modelos BGE originales no estan documentados en esta model card; se heredan los de los corpus de entrenamiento de BAAI.
- **Riesgo de alucinacion**: al ser modelos de embeddings, no generan texto, por lo que el riesgo de alucinacion se limita a recuperaciones poco relevantes que puedan inducir errores en el sistema consumidor (por ejemplo, un LLM en un pipeline RAG).
- **Soporte hardware restringido**: depende de la NPU XDNA1 y del ecosistema Linux (driver XDNA, XRT, kernel 6.12+). Las pilas ampliamente documentadas para NPU Ryzen (FastFlowLM, AMD Lemonade) solo cubren XDNA2, segun la informacion publica.
- **Madurez**: repositorio con 0 descargas y 0 likes, publicado en octubre de 2026; la trazabilidad del proceso de conversion a NPUE no se documenta.
- **Formato propietario de ejecucion**: NPUE no es un formato estandar de la comunidad de inferencia (a diferencia de ONNX o GGUF), lo que limita la portabilidad.
- **Licencia MIT**: permite uso comercial y modificacion, pero conviene verificar las condiciones de los modelos de origen BGE y de las herramientas de conversion empleadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ItsOkayNow/bge-XDNA1-NPUE-PACKS
- Repositorio de ejecucion en NPU: https://github.com/hardWorker254/Npu-Embeddings-XDNA1
- Modelo de origen BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- Modelo de origen TaylorAI/bge-micro-v2: https://huggingface.co/TaylorAI/bge-micro-v2
- Modelo de origen BAAI/bge-large-en-v1.5: https://huggingface.co/BAAI/bge-large-en-v1.5
- Modelo de origen BAAI/bge-base-en-v1.5: https://huggingface.co/BAAI/bge-base-en-v1.5
- Scottcjn/open-xdna (bring-up de XDNA1 en Linux): https://github.com/Scottcjn/open-xdna
- hawkpoint-npu-llm (prerrequisitos de driver/XRT y guia XDNA1): https://github.com/c8dhjp4tyv-bit/hawkpoint-npu-llm
- AMD XDNA (Wikipedia): https://en.wikipedia.org/wiki/AMD_XDNA
- Instruction Set Architecture — Hello XDNA!: https://tnzr.org/xdna/isa.html
- Guia de configuracion de NPU Ryzen AI en Linux (XDNA1/Phoenix): https://gist.github.com/1kaiser/f5abe5f9c91e783b4d759266f867653e

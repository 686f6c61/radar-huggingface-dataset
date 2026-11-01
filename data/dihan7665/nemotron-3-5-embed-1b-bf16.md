# dihan7665/Nemotron-3.5-Embed-1B-BF16

## Resumen

Nemotron-3.5-Embed-1B-BF16 es un modelo de embeddings multimodal y multilingue desarrollado por NVIDIA, orientado a recuperacion de informacion (retrieval) y generacion aumentada por recuperacion (RAG). Convierte en vectores densos de tamano fijo tanto fragmentos de texto como imagenes de paginas de documento (incluyendo tablas, graficos e infografias), permitiendo busqueda semantica sobre corpus heterogeneos con una unica representacion vectorial.

Arquitectura transformer de tipo bi-encoder con 1.554.710.528 parametros (1,55B). Combina un codificador visual Pixtral inicializado desde `mistralai/Ministral-3-3B-Instruct-2512-BF16` con un modelo de lenguaje inicializado desde `nvidia/Nemotron-3-Embed-1B-BF16`. El modelo se ha destilado del teacher `Nemotron-3.5-Embed-8B-BF16` mediante una combinacion de perdidas de distancia coseno (COS) y error cuadratico medio (MSE) sobre datos multilingues de retrieval de texto e imagen.

Su relevancia actual reside en que cubre un hueco practico: un modelo de embeddings de ~1,5B que unifica texto e imagen en un mismo espacio vectorial, con evaluacion en 34 idiomas para texto y 18 para imagen, y con pesos en BF16 listos para uso comercial bajo licencia OpenMDW-1.1. La ficha corresponde a una republicacion del usuario `dihan7665`; el modelo original de NVIDIA se publica en `nvidia/Nemotron-3.5-Embed-1B-BF16`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder (codificador visual Pixtral + modelo de lenguaje) |
| Parametros totales | 1.554.710.528 (1,55B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados); variante NVFP4 disponible en el repo oficial de NVIDIA |
| Idiomas soportados | 34 idiomas para texto (en, ar, as, bn, bg, zh, da, nl, fi, fr, de, hi, hinglish, id, it, ja, ko, ms, mr, ne, no, fa, pt, ro, ru, es, sw, sv, ta, te, th, uk, ur, vi); 18 para imagen (ar, bn, zh, en, fa, fi, fr, de, hi, id, ja, ko, ru, es, sw, te, th, yo) |
| Licencia | OpenMDW-1.1 (modelos base Ministral bajo Apache 2.0) |
| Formato de pesos | safetensors (BF16); tamano del repo 3,1 GB |
| Libreria | sentence-transformers |
| Pipeline | visual-document-retrieval |
| Tipo de entrada | Texto (string) e imagen (RGB); consultas solo texto |
| Dimension del embedding | no disponible |

## Arquitectura y entrenamiento

El modelo es un bi-encoder denso que produce un vector de embedding de tamano fijo a partir de una entrada de texto, una imagen de pagina de documento o una combinacion de ambas. La parte visual es un codificador Pixtral inicializado desde el modelo instructivo Ministral-3-3B, y la parte linguistica es un transformer inicializado desde `nvidia/Nemotron-3-Embed-1B-BF16`. La proyeccion multimodal y el codificador visual se ajustaron sobre datasets de imagen y de imagen+texto.

El entrenamiento se basa en destilacion desde el teacher `Nemotron-3.5-Embed-8B-BF16`, usando perdidas combinadas de distancia coseno (COS) y error cuadratico medio (MSE) sobre datos multilingues de retrieval de texto e imagen. Un detalle tecnico relevante: el componente de lenguaje se mantuvo congelado durante la destilacion, por lo que el modelo comparte exactamente el mismo espacio de embeddings de texto que `Nemotron-3-Embed-1B-BF16` y anade capacidades de recuperacion visual sin romper la compatibilidad con indices de texto ya construidos.

## Capacidades

- Generacion de embeddings densos de texto para busqueda semantica y recuperacion de pasajes.
- Embeddings de imagenes de paginas de documento, incluyendo tablas, graficos e infografias.
- Embeddings combinados imagen+texto para documentos con contenido mixto.
- Recuperacion multimodal: consulta en texto contra corpus de imagenes o de texto en un mismo espacio vectorial.
- Soporte multilingue amplio: 34 idiomas evaluados en texto y 18 en imagen.
- Compatibilidad con transformers, sentence-transformers y vLLM.
- Uso como recuperador en pipelines de RAG y RAG agentico.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso por si mismo; su funcion es exclusivamente de representacion vectorial.

## Casos de uso

- RAG sobre documentacion escaneada: indexar paginas de PDF como imagenes con el codificador visual y recuperarlas a partir de consultas en texto, sin necesidad de un pipeline OCR previo completo.
- Busqueda semantica en bases de conocimiento multilingues: un unico indice vectorial sirve consultas en espanol, ingles, arabe o hindi contra documentos en cualquiera de los 34 idiomas evaluados.
- Recuperacion de tablas y graficos financieros: el modelo embebe paginas con tablas e infografias, lo que permite localizar el informe que contiene una cifra concreta descrita en lenguaje natural.
- Atencion al cliente con base documental: recuperar fragmentos de manuales, FAQ y fichas de producto (texto o imagen) para alimentar un LLM generativo en un pipeline RAG de dos etapas.
- Migracion incremental de indices: al compartir espacio de embeddings de texto con `Nemotron-3-Embed-1B-BF16`, se pueden reutilizar indices de texto existentes y anadir recuperacion visual sin reindexar todo el corpus textual.
- Deduplicacion y clustering de documentos multimodales: comparar embeddings de paginas para detectar versiones duplicadas o agrupar documentos por tematica.
- Agentes de investigacion documental: usar el modelo como herramienta de recuperacion en un agente que alterna consultas de texto e imagenes de paginas.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card afirma que el modelo alcanza resultados state-of-the-art entre modelos de tamano comparable en multiples benchmarks de retrieval multilingue y multimodal, y remite al blog de NVIDIA para los detalles, pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K u otros) en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,1 GB solo para pesos; con overhead de activaciones y del codificador visual, prever del orden de 4-6 GB.
- Variante NVFP4 oficial de NVIDIA: reduce el peso de los pesos a aproximadamente una cuarta parte del BF16, adecuada para GPUs con soporte de FP4.
- GPU recomendadas: A100, H100, L40S para despliegue a escala; RTX 4090 y RTX 3090 para inferencia en BF16 sin problema de memoria.
- Cabe en GPUs de consumo: si, en tarjetas con 8 GB o mas de VRAM en BF16; en 6 GB puede requerir cuantizacion adicional.
- Opciones de despliegue: sentence-transformers, transformers, vLLM (soportado segun los tags del modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-1B-BF16 | 1,55B | Texto + imagen | 34 (texto), 18 (imagen) | OpenMDW-1.1 | HuggingFace (NVIDIA y republicaciones) |
| Nemotron-3.5-Embed-8B-BF16 | 8B (no confirmado en detalle) | Texto + imagen | no disponible | OpenMDW-1.1 | HuggingFace (NVIDIA) |
| Nemotron-3-Embed-1B-BF16 | 1B (no confirmado en detalle) | Solo texto | no disponible | no disponible | HuggingFace (NVIDIA) |
| Ministral-3-3B-Instruct | 3B | Texto (modelo generativo, no embedding) | no disponible | Apache 2.0 | HuggingFace (Mistral) |

La comparacion con alternativas de otros fabricantes (por ejemplo, modelos de embeddings multimodales de Cohere, Jina o BGE) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no responde preguntas ni genera texto; solo produce embeddings.
- Las consultas solo admiten entrada de texto; la multimodalidad se limita al lado del documento.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar el troceado de documentos largos con precision.
- Los sesgos del modelo no estan documentados en la informacion proporcionada; al derivar de Ministral-3 y de datos multilingues, es previsible que herede sesgos linguisticos y culturales de esas fuentes.
- Riesgo de falsos negativos en recuperacion sobre dominios muy especializados (terminologia tecnica, jerga) no cubiertos por los datos de entrenamiento.
- La licencia OpenMDW-1.1 permite uso comercial segun la model card, pero conviene revisar el texto completo del acuerdo; los modelos base Ministral estan bajo Apache 2.0.
- Esta ficha corresponde a una republicacion de terceros (`dihan7665`) con 15 descargas; para produccion se recomienda usar el repositorio oficial de NVIDIA, que incluye la variante NVFP4 y garantiza actualizaciones.
- El modelo comparte espacio de embeddings de texto con `Nemotron-3-Embed-1B-BF16`: mezclar embeddings de ambos modelos en un mismo indice de texto es seguro, pero no se debe asumir lo mismo con otros modelos.
- No hay datos publicados de latencia ni throughput, por lo que el dimensionado de infraestructura requiere pruebas propias.

## Enlaces

- HuggingFace (republicacion): https://huggingface.co/dihan7665/Nemotron-3.5-Embed-1B-BF16
- HuggingFace (original NVIDIA, 1B BF16): https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-BF16
- HuggingFace (variante NVFP4): https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-NVFP4
- HuggingFace (teacher 8B BF16): https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- HuggingFace (modelo de texto base): https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- Modelo base visual: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-BF16
- Modelo base visual (8B): https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Blog de NVIDIA sobre retrieval agentico: https://huggingface.co/blog/nvidia/nemotron-retriever-world-class-agentic-retrieval
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt

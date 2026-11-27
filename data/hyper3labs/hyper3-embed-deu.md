# hyper3labs/hyper3-embed-deu

## Resumen

hyper3-embed-deu es un modelo de embeddings de texto para alemán desarrollado por hyper³labs, obtenido mediante fine-tuning del modelo generativo Google Gemma 4 E2B. A diferencia de los modelos de embeddings convencionales, utiliza un único codificador bidireccional que produce simultáneamente embeddings densos de 1.536 dimensiones para búsqueda vectorial, clustering y clasificación, y vectores de token de 128 dimensiones para recuperación de tipo late interaction (MaxSim) sobre documentos largos.

El modelo resuelve el problema de la recuperación semántica monolingüe en alemán con soporte de pares cross-lingüe con inglés, combinando en un solo pase una representación densa global con una representación token-level que permite puntuar ventanas de 512 tokens con stride 256 dentro de documentos de hasta 4.096 tokens. La puntuación fusionada combina 0,25 de similitud densa y 0,75 de MaxSim, lo que lo hace adecuado para recuperación sobre corpus documentales extensos.

Con 4,66B parámetros totales (1,91B activos en transformer y cabezas, 2,75B en embeddings), pesos BF16 en backbone y FP32 en cabezas, y licencia OpenMDW-1.1, se posiciona como una alternativa especializada en alemán frente a modelos multilingües genéricos, a costa de un footprint de memoria considerable (~8,75 GiB en GPU CUDA).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (fine-tune de google/gemma-4-E2B-it) con cabezas de pooling denso y MaxSim |
| Parametros totales | 4,66B (1,91B activos en transformer y cabezas; 2,75B en embeddings) |
| Parametros activos | no disponible (no se especifica si el backbone base es MoE) |
| Longitud de contexto | 4.096 tokens (documento completo); ventanas de 512 tokens con stride 256 para MaxSim |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 backbone y FP32 cabezas) |
| Idiomas soportados | Alemán (principal); inglés en pares cross-lingüe |
| Licencia | OpenMDW-1.1 (incluye Apache-2.0 del modelo base Gemma 4) |
| Formato de pesos | safetensors (librería sentence-transformers, requiere trust_remote_code) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E2B y lo convierte en un encoder bidireccional de doble salida. La primera salida es un embedding denso de 1.536 dimensiones, normalizado en L2 y pensado para similitud coseno; la segunda es una matriz de vectores de token de 128 dimensiones que permite calcular MaxSim entre consulta y documento. Sobre esta base, el modelo implementa una recuperación fusionada que mezcla la similitud densa del documento completo (hasta 4.096 tokens) con la mejor ventana de 512 tokens (stride 256), ponderando 0,25 la componente densa y 0,75 la MaxSim, tanto a nivel de documento completo como de ventana.

El modelo soporta instrucciones de tarea mediante `prompt_name`: las consultas de recuperación reciben automáticamente una instrucción de búsqueda, mientras que los documentos no llevan prefijo; para tareas simétricas o de clasificación se pueden usar prompts específicos (`sts`, `clustering`, `classification`, `pair_classification`) definidos en el `config.json`. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. El modelo está etiquetado con `mteb` y `late-interaction`, lo que sugiere evaluación en tareas MTEB y uso del paradigma ColBERT-like.

## Capacidades

- Generación de embeddings densos de 1.536 dimensiones, normalizados en L2, para similitud coseno, clustering y clasificación.
- Producción de vectores de token de 128 dimensiones para puntuación MaxSim (late interaction) sobre documentos largos.
- Recuperación fusionada densa + MaxSim con ponderación 0,25/0,75 sobre ventanas de 512 tokens con stride 256.
- Soporte de instrucciones de tarea mediante `prompt_name` (recuperación asimétrica, STS, clustering, clasificación, clasificación de pares).
- Capacidades cross-lingüe alemán-inglés en pares de consulta y documento.
- Extracción de características (`feature-extraction`) y compatibilidad con `sentence-transformers` y `transformers` (`AutoModel` con `trust_remote_code`).
- Funciones de indexación por lotes: `encode_with_tokens`, `document_windows`, `best_per_document`, `maxsim_scores`, `fuse_scores`.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión ni audio: es un modelo exclusivamente de embeddings.

## Casos de uso

- Búsqueda semántica en corpus documentales alemanes: indexación con `encode_with_tokens` para precomputar representaciones densas y de token, y consulta con `score_multivector` para recuperar pasajes relevantes en documentos de hasta 4.096 tokens.
- Recuperación aumentada (RAG) sobre normativa y documentación administrativa alemana: la combinación densa + MaxSim mejora el recall en pasajes largos donde un único vector denso diluye la señal, como se ejemplifica con consultas sobre requisitos de empadronamiento.
- Clasificación de textos en alemán: uso de `prompt_name="classification"` para obtener representaciones adecuadas a tareas de etiquetado supervisado con clasificadores lineales o cabezas ligeras.
- Clustering y deduplicación de documentos: los embeddings densos L2-normalizados permiten agrupar noticias, tickets o contratos por similitud coseno con umbrales calibrados.
- Búsqueda cross-lingüe alemán-inglés: consultas en inglés contra documentos en alemán (o viceversa) para catálogos bilingües, soporte técnico o bases de conocimiento multinacionales.
- Detección de duplicados y near-duplicates en pipelines de ingesta: la puntuación MaxSim sobre ventanas detecta coincidencias parciales aunque el documento completo no sea idéntico.
- Sistemas de recomendación de contenido textual: similitud entre artículos, posts o fichas de producto en alemán para generar recomendaciones basadas en contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la etiqueta `mteb`, pero no se proporcionan puntuaciones numéricas de MMLU, HumanEval, GSM8K ni de tareas MTEB.

## Requisitos de hardware

- VRAM estimada en GPU CUDA: ~8,75 GiB con backbone en BF16 y cabezas en FP32 (peso de descarga ~9,43 GB).
- VRAM estimada en CPU-only: ~17,4 GiB por defecto en FP32.
- GPU recomendadas: no se especifican modelos concretos; por footprint, encaja en GPUs con al menos 12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100).
- Cabe en GPU consumer con 12 GB o más; en GPUs de 8 GB requeriría cuantización, no documentada oficialmente.
- Opciones de despliegue: `sentence-transformers` (recomendado, con `trust_remote_code=True`), `transformers` mediante `AutoModel.from_pretrained` con `trust_remote_code=True`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Se recomienda `batch_size=8` en el ejemplo de `score_multivector` y `max_length=576` para ventanas y `1024` para consultas, sin cifras de rendimiento publicadas.
- Advertencia: no llamar a `.half()`; el pooling y las cabezas MaxSim deben ejecutarse en FP32.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| hyper3-embed-deu | 4,66B (1,91B activos) | 4.096 tokens | de, en (cross-lingüe) | Densa 1.536d + tokens 128d (MaxSim) | OpenMDW-1.1 | Hugging Face |
| Modelos de embeddings multilingües tipo BGE-M3 | no disponible | no disponible | multilingüe | densa + sparse + multivector | no disponible | Hugging Face |
| Modelos de embeddings alemanes basados en encoders pequeños (p. ej. familia sentence-transformers alemana) | no disponible | no disponible | de | densa | no disponible | Hugging Face |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada; no se han publicado métricas MTEB que permitan situar el modelo frente a BGE-M3, E5 o modelos específicos de alemán.

## Limitaciones y advertencias

- Modelo especializado en embeddings: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Cobertura lingüística limitada a alemán como idioma principal e inglés en pares cross-lingüe; no se documenta soporte para otras lenguas.
- Contexto máximo de 4.096 tokens por documento; documentos más largos requieren fragmentación o el esquema de ventanas de 512 tokens con stride 256.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos en similitud semántica; no se documentan umbrales calibrados.
- No se documentan sesgos conocidos ni evaluación de sesgo; al derivar de Gemma 4, podría heredar sesgos del modelo base.
- Licencia OpenMDW-1.1: incluye Apache-2.0 del modelo base Gemma 4; deben revisarse las condiciones de OpenMDW-1.1 para uso comercial antes de desplegar en producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del modelo; auditar antes de usar en entornos sensibles.
- Footprint elevado (~8,75 GiB en GPU) para un modelo de embeddings, superior al de encoders dedicados de menor tamaño; puede no ser rentable en despliegues de alto QPS con GPUs pequeñas.
- Sin resultados de benchmarks publicados: la calidad frente a alternativas establecidas no está verificada de forma independiente.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: ecosistema y soporte comunitario incipientes.

## Enlaces

- Hugging Face: https://huggingface.co/hyper3labs/hyper3-embed-deu
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Web del autor: https://hyper3labs.com
- GitHub: https://github.com/Hyper3Labs
- Perfil en Hugging Face: https://huggingface.co/hyper3labs
- Discord: https://discord.gg/Za3rBkTPSf
- X (Twitter): https://x.com/hyper3labs

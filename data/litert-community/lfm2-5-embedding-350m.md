# litert-community/LFM2.5-Embedding-350M

## Resumen

LFM2.5-Embedding-350M es un modelo de embeddings denso (bi-encoder) desarrollado originalmente por LiquidAI sobre la arquitectura híbrida LFM2, que combina convoluciones cortas con compuertas y atención con consultas agrupadas (GQA). Esta ficha describe la conversión publicada por la comunidad litert-community a formato LiteRT (`.tflite` y bundles `.litertlm`), pensada para inferencia totalmente offline en CPU de dispositivos móviles y de escritorio. El modelo genera un único vector de 1024 dimensiones, ya normalizado L2, por cada texto de entrada.

El problema que resuelve es la ausencia de modelos de recuperación multilingües de calidad que funcionen íntegramente en el dispositivo: con 350 millones de parámetros y un peso int8 de 371 MB, permite construir búsqueda semántica y RAG sin enviar datos a la nube. Soporta once idiomas (inglés, español, alemán, francés, italiano, portugués, árabe, sueco, noruego, japonés y coreano) y una longitud máxima de 512 tokens.

Su relevancia actual radica en la madurez del runtime: LiteRT 2.2.0 (el nuevo nombre de TensorFlow Lite) y `litert-torch` permiten convertir un modelo PyTorch sin modificaciones con una fidelidad numérica medida de 4e-7 frente al original en un Galaxy S26. Desde litert-lm 0.17.0 los mismos pesos se distribuyen como bundles `EmbeddingEngine` que el runtime carga sin código de tokenización ni pooling en el host.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido LFM2 (convoluciones cortas con compuertas + atención con consultas agrupadas, GQA); bi-encoder denso bidireccional (`Lfm2BidirectionalModel`) |
| Parametros totales | 350 millones (según el nombre del modelo; no se detalla el desglose en la información disponible) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (máximo del modelo; entradas más largas son un error por defecto) |
| Tipos de cuantizacion | int8 dynamic-range (lineales + embedding en int8, convoluciones en float, variante `wi8fc`); fp16 con cómputo en float |
| Idiomas soportados | en, es, de, fr, it, pt, ar, sv, no, ja, ko (11 idiomas) |
| Licencia | lfm1.0 (licencia propia de LiquidAI, catalogada como `other` en Hugging Face) |
| Formato de pesos | `.tflite` (LiteRT) y bundles `.litertlm` (LiteRT-LM ≥ 0.17.0); modelo base en safetensors en el repositorio de LiquidAI |
| Dimension del embedding | 1024 float32, token CLS, normalizado L2 |
| Firmas de entrada | `embed_64`, `embed_128`, `embed_256`, `embed_512`; batch 1, formas estáticas con padding a la derecha |
| Tamano de los artefactos | 371 MB (`wi8fc.tflite`), 712 MB (`fp16.tflite`), 370 MB (`wi8fc.litertlm`), 647 MB (`fp16.litertlm`) |
| Tamano del repositorio | 3,6 GB |

## Arquitectura y entrenamiento

El modelo base es un bi-encoder denso construido sobre la columna vertebral LFM2, que alterna bloques de convolución corta con compuertas (similares a las de arquitecturas convolucionales modernas) con bloques de atención con consultas agrupadas. Esta combinación reduce el coste de cómputo y memoria frente a un transformer puro, lo que explica que 350 millones de parámetros quepan en 371 MB en int8. El modelo es bidireccional (`Lfm2BidirectionalModel`), es decir, no genera texto: produce una representación vectorial del texto completo. La conversión a LiteRT congela el pooling y la normalización dentro del grafo.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste con RLHF o DPO. Sí se especifica el contrato de uso heredado del repositorio base (`config_sentence_transformers.json`): prompts asimétricos con espacio final, `query: ` para consultas y `document: ` para pasajes, pooling por token CLS en la posición 0 y normalización L2. La innovación técnica destacable de esta conversión es la equivalencia bit a bit entre firmas: el padding se anula dentro del grafo antes de las convoluciones cortas y se enmascara en la atención, de modo que un mismo texto procesado con `embed_64` y con `embed_512` devuelve un vector idéntico, verificado en Mac y en dispositivo.

## Capacidades

- Generación de embeddings de frases y pasajes: un vector de 1024 dimensiones por texto, normalizado L2, de modo que el producto escalar equivale directamente a la similitud coseno.
- Recuperación de información y búsqueda semántica multilingüe en once idiomas, incluidos español, árabe, japonés y coreano.
- Similitud semántica de pares de frases (tarea `sentence-similarity`).
- Extracción de características (`feature-extraction`) para pipelines de clasificación, clustering y deduplicación sobre vectores.
- Soporte de prompts asimétricos para diferenciar consultas y documentos en sistemas de recuperación.
- Inferencia totalmente offline en CPU, sin dependencia de red ni de servicios externos.
- Reducción de dimensionalidad en el runtime: `EmbeddingOptions(output_size=256)` conserva las primeras 256 dimensiones del vector.
- Gestión de entradas sobredimensionadas mediante `InputOverflowStrategy` con opciones `TRUNCATE` y `CHUNK_AND_AVERAGE`.
- API de lote (`compute_embedding_batch`) en Python y API equivalente en Kotlin para Android.
- No dispone de tool calling, capacidades de agente, visión ni audio: es exclusivamente un modelo de representación.

## Casos de uso

- Búsqueda semántica local en aplicaciones móviles: con 371 MB en int8 y entre 22 y 33 ms por texto en un Galaxy S26, la app puede indexar y consultar documentos del usuario sin conexión y sin enviar contenido a servidores externos.
- RAG en el dispositivo para asistentes personales: el modelo vectoriza fragmentos de notas, correos o PDFs locales con el prefijo `document: ` y las consultas con `query: `, y el resultado se pasa a un LLM pequeño que también corra en el dispositivo. La ventana de 512 tokens encaja con la fragmentación típica de RAG.
- Deduplicación y agrupación de contenido multilingüe en pipelines de datos: al generar vectores L2-normalizados, un umbral sobre el producto escalar permite detectar Near-duplicates en once idiomas, incluidos pares cruzados como español-italiano o inglés-coreano.
- Moderación y clasificación de textos en el borde: los embeddings sirven como entrada a clasificadores ligeros (regresión logística, k-NN) que se ejecutan en el mismo dispositivo, útil cuando el texto no puede salir del terminal por requisitos de privacidad.
- Motor de recomendación de contenido: similitud entre el perfil vectorizado del usuario y el catálogo de artículos; el coste de 19 ms por texto en un M4 Max permite reindexar catálogos de decenas de miles de elementos en minutos.
- Enrutamiento de consultas en sistemas de atención al cliente: el vector de la consulta se compara contra una biblioteca de intenciones predefinidas para dirigirla al departamento o al flujo adecuado, con la ventaja de que el modelo cubre consultas en español, francés, alemán y árabe sin modelos separados.
- Filtrado previo en pipelines de recuperación en servidor: como primera etapa de un sistema de dos fases, el modelo descarta candidatos antes de un re-ranking más costoso, aprovechando su bajo coste de inferencia en CPU.
- Detección de similitud entre versiones de documentos legales o técnicos: comparar borradores sucesivos mediante similitud coseno para señalar cambios sustantivos.

## Benchmarks y rendimiento

Calidad medida contra la referencia PyTorch fp32 (`Lfm2BidirectionalModel` + CLS + normalización) sobre las mismas entradas:

| Variante | STS17 Spearman (11 pares) | NanoSciFact nDCG@10 | recall@5 | hit@1 |
|---|---|---|---|---|
| PyTorch fp32 (referencia) | 0,6720 | 0,8540 | 0,920 | 0,780 |
| fp16 | 0,6720 | 0,8540 | 0,920 | 0,780 |
| int8 (wi8fc) | 0,6721 | no disponible | no disponible | no disponible |

Rendimiento medido en CPU, texto único, conjunto de comprobación de 10 textos de 6 a 70 tokens, mediana:

| Dispositivo | Runtime | Inicialización | Por texto |
|---|---|---|---|
| Galaxy S26 (SM-S942Q, Android 16) | litertlm-android 0.17.0, Kotlin `EmbeddingEngine` | 1,86 s | 22-33 ms |
| Mac (M4 Max) | litert-lm 0.17.0, Python | 0,3 s | 19 ms (wi8fc) / 28 ms (fp16) |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos de embeddings (MTEB u otros) ni cifras de throughput en lote.

## Requisitos de hardware

- VRAM o memoria estimada: el modelo corre en CPU; el pico de memoria medido es de 1,2 GiB para la variante `wi8fc` en iPhone y de 5,8 GiB para la variante fp16 (que carga en un iPhone de 12 GB pero con ese pico).
- GPU recomendadas: no se especifican; el backend documentado es `Backend.CPU()`. No hay datos publicados de ejecución en GPU para esta conversión.
- Cabe en GPU de consumo: no hay datos disponibles. En móvil, la variante int8 está verificada en iPhone y en Galaxy S26.
- Opciones de despliegue: LiteRT con los artefactos `.tflite`; LiteRT-LM ≥ 0.17.0 con bundles `.litertlm` mediante `EmbeddingEngine` en Python, C y Kotlin (`com.google.ai.edge.litertlm:litertlm-android:0.17.0`, requiere un proyecto con Kotlin 2.4). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia: 22-33 ms por texto en Galaxy S26 y 19 ms (int8) o 28 ms (fp16) en Mac M4 Max, con inicialización de 1,86 s y 0,3 s respectivamente.
- Aviso de integración: en los bundles `.litertlm` hay que mantener `insert_special_tokens` en su valor por defecto (`True`); si se desactiva, el motor devuelve vectores incorrectos de forma silenciosa porque el tokenizador del runtime no ejecuta el post-procesador del tokenizador original.

## Comparativa con modelos similares

No se han publicado en la información disponible comparaciones con otros modelos de embeddings. La siguiente tabla recoge únicamente los datos conocidos de este modelo y deja constancia de lo que falta:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato edge |
|---|---|---|---|---|---|
| LFM2.5-Embedding-350M (LiteRT) | 350 M | 512 tokens | 11 | lfm1.0 | `.tflite`, `.litertlm` |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ventana de contexto de solo 512 tokens: los documentos más largos deben truncarse o dividirse en fragmentos con `CHUNK_AND_AVERAGE`, lo que puede degradar la recuperación en pasajes con información distribuida.
- El contrato de prompts es estricto: usar `query: ` y `document: ` con el espacio final. Omitir los prefijos o el espacio degrada los resultados de forma silenciosa, sin error visible.
- El pooling CLS y la normalización L2 ya están dentro del grafo: volver a normalizar o aplicar otro pooling produce vectores incorrectos.
- El modelo es exclusivamente de embeddings: no genera texto, no razona de forma multi-paso y no soporta tool calling, visión ni audio.
- No se documentan sesgos conocidos ni evaluaciones de sesgo en la información disponible; al ser un modelo multilingüe entrenado sobre corpus web, es razonable esperar los sesgos habituales de ese tipo de datos, aunque no hay mediciones publicadas.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de recuperación falsa: similitudes altas entre textos no relacionados semánticamente pueden producir resultados espurios en dominios muy técnicos.
- Licencia `lfm1.0` (catalogada como `other`): es una licencia propia de LiquidAI, no una licencia de código abierto estándar. Antes de un uso comercial hay que revisar el archivo `LICENSE` del repositorio; la información disponible no detalla las restricciones concretas.
- El rendimiento se ha medido con textos de 6 a 70 tokens; no hay datos de latencia para entradas cercanas al límite de 512 tokens.
- La variante fp16 requiere 5,8 GiB de pico de memoria, lo que la hace inviable en muchos dispositivos móviles pese a cargar en un iPhone de 12 GB.
- El repositorio tiene un único contribuidor y 152 descargas en el momento de la consulta: es una conversión comunitaria, no un artefacto oficial de LiquidAI, y su mantenimiento futuro no está garantizado.

## Enlaces

- Modelo en Hugging Face (conversión LiteRT): https://huggingface.co/litert-community/LFM2.5-Embedding-350M
- Árbol de archivos del repositorio: https://huggingface.co/litert-community/LFM2.5-Embedding-350M/tree/main
- Modelo base original de LiquidAI: https://huggingface.co/LiquidAI/LFM2.5-Embedding-350M
- Medición de fidelidad de LiteRT en Android (john-rocky): https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md

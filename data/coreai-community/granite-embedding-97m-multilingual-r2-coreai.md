# coreai-community/Granite-Embedding-97M-Multilingual-R2-CoreAI

## Resumen

Granite-Embedding-97M-Multilingual-R2-CoreAI es la exportación al runtime Core AI de Apple del modelo de embeddings de IBM `ibm-granite/granite-embedding-97m-multilingual-r2`. No es un modelo generativo, sino un codificador de texto (encoder) que convierte una frase o documento en un vector de 384 dimensiones normalizado a norma unitaria, pensado para búsqueda semántica, recuperación de información y similitud entre textos. El repositorio lo publica la comunidad `coreai-community` como espejo del repositorio canónico de `mlboydaisuke`, con actualizaciones que llegan primero al CoreAI Model Zoo.

El interés de esta variante es que empaqueta el modelo en formato `.aimodel`, el bundle estático del runtime Core AI de Apple (sucesor de Core ML en iOS 27 y macOS 27), de modo que se ejecuta en GPU o Neural Engine de dispositivos Apple sin necesidad de un intérprete de PyTorch. Con 97 millones de parámetros es, según la propia model card, el embedder más pequeño del catálogo del zoo (390 MB en fp32, frente a 1,2 GB de EmbeddingGemma-300m y 1,1 GB de Qwen3-Embedding-0.6B) y el primero con arquitectura de encoder pura, ya que el resto son decodificadores causales usados como encoder.

La relevancia práctica está en la inferencia local: la model card cita 16,5 ms por consulta en un iPhone 18 Pro con iOS 27.2 en la app de ejemplo CoreAISearchiOS, lo que permite búsqueda semántica sobre notas propias íntegramente en el dispositivo. La licencia Apache-2.0 del modelo base facilita su uso comercial, aunque la calidad de recuperación frente a alternativas no se ha medido en este repositorio: el conjunto de pruebas descrito es un instrumento de paridad, no un benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, `model_type: modernbert`) |
| Parametros totales | 97 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | S = 128 o 512 tokens, según la variante exportada (elección en tiempo de exportación); truncado del cuerpo a S−2 |
| Tipos de cuantizacion | fp32 (variante `ios/fp32-s128` documentada); no se listan otras precisiones en la información disponible |
| Idiomas soportados | multilingüe, con japonés e inglés entre los idiomas cubiertos |
| Licencia | Apache-2.0 |
| Formato de pesos | `.aimodel` (bundle Core AI); el repositorio incluye además `tokenizer.json` por variante y un paquete Swift de tokenización |

Detalles adicionales de arquitectura recogidos en la model card: 12 capas, dimensión oculta 384, 12 cabezas de atención de 32 dimensiones, MLP con GLU de 1536 unidades y activación SiLU, vocabulario de 180.000 tokens, sin sesgos en atención, MLP ni LayerNorm (ε 1e-5). La atención global aparece en las capas 0, 3, 6 y 9 (RoPE θ 150.000); las otras ocho usan atención local con ventana deslizante de radio inclusivo 64 (129 claves por consulta interior, RoPE θ 160.000). La capa 0 no tiene pre-norm de atención. El pooling es CLS seguido de normalización L2, ambos dentro del grafo.

## Arquitectura y entrenamiento

El modelo base es un encoder ModernBERT de 12 capas entrenado por IBM para generar embeddings de frase. La exportación a Core AI conserva el grafo de inferencia con un contrato explícito: entrada `input_ids` de forma `[1, S]` en int32, rellenada por la derecha con el token 179935; entrada `attention_mask` de la misma forma con 1 en tokens reales y 0 en relleno; y salida `embedding` de forma `[1, 384]` en fp32, ya con pooling CLS y normalización L2 aplicados. El lote es siempre 1 y no hay bucle autorregresivo, caché KV ni cabeza de lenguaje: es una única pasada forward sobre la rejilla de tokens.

La model card no detalla el volumen ni la composición del corpus de entrenamiento del modelo original, ni si hubo etapas de ajuste con datos paralelos o preferencias; esa información no está disponible en el material proporcionado. La innovación técnica destacable de esta variante no está en el entrenamiento sino en el contrato de tokenización, que la card describe como parte crítica del resultado: sin prefijos de consulta ni de documento, sin eliminación de espacios en blanco y sin normalización; tokenizador basado en `tokenizer.json` del checkpoint con regex `Split(Isolated)`, `ByteLevel` sin espacio de prefijo y BPE de bytes con `ignore_merges = true`; truncado del cuerpo a S−2 antes de envolver con `[CLS 179934]` y `[SEP 179938]`, relleno con PAD 179935. La similitud se calcula por producto escalar entre vectores unitarios y el modelo no admite truncado de dimensiones.

## Capacidades

- Generación de embeddings de texto: una pasada forward devuelve un vector de 384 dimensiones normalizado, apto para similitud coseno o producto escalar.
- Similitud semántica entre frases y recuperación de documentos (pipeline `sentence-similarity` / `feature-extraction`).
- Multilingüe, con japonés e inglés explícitamente citados entre los idiomas cubiertos.
- Ejecución en dispositivo en iOS 27 y macOS 27 mediante el runtime Core AI, con planes de GPU (MPSGraph/Metal) o Neural Engine.
- Tokenizador empaquetado en Swift puro (Foundation) y en Python sin dependencia de Hugging Face, validados contra `AutoTokenizer` en 681 textos × 2 rejillas = 1.362 casos.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio: es un encoder, no un modelo de lenguaje.

## Casos de uso

- Búsqueda semántica local en aplicaciones iOS: la app de ejemplo CoreAISearchiOS indexa notas del usuario y responde consultas por significado con una latencia citada de 16,5 ms por consulta en un iPhone 18 Pro, sin enviar datos a un servidor.
- Deduplicación y agrupación de contenido en el dispositivo: al generar vectores unitarios comparables por producto escalar, permite detectar notas o mensajes casi duplicados antes de sincronizar o almacenar.
- Clasificación zero-shot ligera: comparar el embedding de un texto con embeddings de etiquetas descriptivas para enrutar tickets o correos en local, sin modelo generativo.
- Recuperación aumentada (RAG) en el borde: indexar documentación privada en macOS 27 y recuperar fragmentos relevantes antes de pasarlos a un LLM local, manteniendo el corpus fuera de la nube.
- Filtrado de candidatos en pipelines de moderación o recomendación: usar el vector de 384 dimensiones como señal barata de similitud previa a un modelo más costoso.
- Procesamiento multilingüe japonés-inglés en producto: normalizar y comparar textos en ambos idiomas con un único modelo de 97 M de parámetros y 390 MB en fp32, adecuado para binarios de app con presupuesto de tamaño ajustado.

## Benchmarks y rendimiento

La model card incluye medidas de paridad y latencia en iPhone 17 Pro (iOS 27.0 build 24A437, bundles `h18p`, plan GPU), sobre 35 textos de Hugging Face, 105 muestras en caliente y estado térmico "fair". La tabla original está truncada en la información disponible: solo se muestra la fila de la variante fp32 y sus columnas de puerta de validación, mínimo coseno frente a Hugging Face, error máximo absoluto, tiempo de carga, primera inferencia tras carga, mediana en caliente y huella pico, pero los valores numéricos de esas columnas no se han proporcionado.

| Variante | S | Gate | Min coseno vs HF | Máx \|err\| | Carga | Primera tras carga | Mediana en caliente | Huella pico |
|---|---:|---|---:|---:|---:|---:|---:|---:|
| fp32 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Dato de latencia citado en el texto de la card: 16,5 ms por consulta en iPhone 18 Pro (iOS 27.2, 2026-10-09, mediana de 10 consultas en un lanzamiento). La propia card advierte que la calidad de recuperación frente a EmbeddingGemma-300m y Qwen3-Embedding-0.6B no se midió en este repositorio. No se han publicado resultados de benchmarks estándar (MTEB, MMLU, etc.) en la información disponible.

## Requisitos de hardware

- Huella de almacenamiento: 390 MB en fp32 para el modelo; el repositorio completo ocupa 2,8 GB por incluir varias variantes y artefactos.
- Ejecución prevista en Apple Silicon: iPhone 17 Pro (identificador iPhone18,1) con iOS 27.0 y bundles compilados `h18p`; iPhone 18 Pro con iOS 27.2 para la cifra de latencia; macOS 27 para escritorio.
- No requiere GPU de servidor: el runtime Core AI ejecuta el grafo en GPU (MPSGraph/Metal) o Neural Engine del dispositivo.
- Despliegue: runtime Core AI de Apple con `AIModel.run` sobre el bundle `.aimodel`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un encoder en este formato.
- Latencia citada: 16,5 ms por consulta en iPhone 18 Pro; el resto de métricas (carga, primera inferencia, mediana en caliente, huella pico) figuran en la tabla de la card pero sus valores no están disponibles en la información proporcionada.
- Memoria: la huella pico se mide sobre el proceso completo de la app, incluidos tokenizador y hashing de ficheros, según la card; el valor concreto no está disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Granite-Embedding-97M-Multilingual-R2-CoreAI | 97 M | 128 o 512 según variante | `.aimodel` (Core AI) | Apache-2.0 | Encoder ModernBERT; 384 d; el más pequeño del catálogo del zoo (390 MB fp32) |
| EmbeddingGemma-300m | 300 M | no disponible | no disponible | no disponible | Citado en la card como alternativa de 1,2 GB; calidad relativa no medida |
| Qwen3-Embedding-0.6B | 600 M | no disponible | no disponible | no disponible | Citado en la card como alternativa de 1,1 GB; decodificador causal usado como encoder; calidad relativa no medida |
| ibm-granite/granite-embedding-97m-multilingual-r2 | 97 M | no disponible | safetensors / Hugging Face | Apache-2.0 | Modelo base original del que deriva esta exportación |

La comparación de rendimiento entre estos modelos no está disponible: la model card indica explícitamente que la calidad de recuperación relativa no se midió y que el conjunto de 35 textos, 4 consultas y 12 documentos es un instrumento de paridad, no un benchmark.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; usarlo como LLM es un error de categoría.
- El contrato de tokenización es frágil y silencioso: usar el tokenizador de sentence-transformers en lugar de la ruta cruda, rellenar con 0, truncar después de añadir los tokens especiales o desactivar `ignore_merges` produce resultados distintos sin error visible. La card documenta cuatro mutaciones detectadas por la puerta de validación.
- El truncado de dimensiones no es una propiedad de este modelo; reducir los 384 dimensiones invalida los vectores.
- Calidad multilingüe no cuantificada: solo se citan japonés e inglés de forma explícita y no hay resultados de recuperación publicados en la información disponible.
- Riesgo de sesgo y de falsos positivos en similitud: al ser un encoder entrenado sobre corpus no detallados en la card, los vectores pueden reflejar sesgos del corpus original; no se documentan evaluaciones de equidad.
- Dependencia de plataforma: el bundle `.aimodel` requiere iOS 27 o macOS 27 y el runtime Core AI; no es portable a otros entornos sin reconvertir el modelo base.
- Este repositorio es un espejo: las actualizaciones llegan primero al repositorio canónico `mlboydaisuke/Granite-Embedding-97M-Multilingual-R2-CoreAI` y al CoreAI Model Zoo, por lo que puede quedar desincronizado.
- Métricas de rendimiento incompletas en la información disponible: la tabla de medidas está truncada y no permite verificar la paridad numérica frente a Hugging Face.
- Licencia Apache-2.0 en el modelo base, lo que en principio permite uso comercial; conviene verificar los términos del runtime Core AI de Apple, que es software propietario y no se detalla en la card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/coreai-community/Granite-Embedding-97M-Multilingual-R2-CoreAI
- Repositorio canónico (espejo de origen): https://huggingface.co/mlboydaisuke/Granite-Embedding-97M-Multilingual-R2-CoreAI
- Modelo base de IBM: https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2
- CoreAI Model Zoo: https://github.com/john-rocky/coreai-model-zoo
- Ficha del modelo en el zoo: https://github.com/john-rocky/coreai-model-zoo/blob/main/models/granite-embedding-97m/README.md
- Receta de tokenización en Python: https://github.com/john-rocky/coreai-model-zoo/blob/main/conversion/granite_embedding/_granite_tokenizer.py
- App de ejemplo CoreAISearchiOS: https://github.com/john-rocky/coreai-samples/tree/main/CoreAISearchiOS
- Benchmark de LLM en Apple Silicon: https://github.com/john-rocky/apple-silicon-llm-bench
- DeviceMark (leaderboard on-device): https://devicemark.github.io/

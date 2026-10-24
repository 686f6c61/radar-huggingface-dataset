# eetteri/sana-phrase-model

## Resumen

Sana Phrase Model es la conversión a Core ML del modelo de embeddings de frases `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, publicada por el usuario eetteri como componente del motor de comparación de frases de **Sana Sender**, una aplicación de macOS que convierte voz en mensajes OSC para la enseñanza de Max/MSP. No es un modelo nuevo: los pesos son los originales de Nils Reimers e Iryna Gurevych, únicamente cuantizados a int8 y empaquetados en formato `.mlpackage` para su ejecución nativa en Apple Silicon.

El problema que resuelve es acotado y muy concreto: dada una frase pronunciada por un estudiante (transcrita por speech-to-text) y un conjunto de frases disparadoras escritas por el profesor, decidir cuál coincide **por significado** y no por coincidencia literal. El ejemplo que da el autor es explícito: "switch off the lights" y "valot pois" deben activar la misma frase "turn the lights off". Para ello produce embeddings de 384 dimensiones con pooling por media y normalización L2 integrados, de modo que el producto escalar de dos salidas es directamente su similitud coseno.

Su relevancia ahora es de nicho pero práctica: demuestra un patrón de despliegue de sentence embeddings en el dispositivo (on-device), sin red, con latencia de unos 6 ms por frase en Apple Silicon y un paquete de 118 MB. La contrapartida es una ventana de entrada fija de solo 64 tokens y una dependencia estricta de macOS 15 o superior, lo que lo aleja de cualquier uso como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo MiniLM (modelo base `paraphrase-multilingual-MiniLM-L12-v2`), convertido a Core ML |
| Parámetros totales | No disponible en la información proporcionada (el repo ocupa 0,1 GB; el `.mlpackage` con pesos int8 pesa 118 MB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 64 tokens (formas fijas `input_ids` y `attention_mask` de shape `(1, 64)`) |
| Tipos de cuantización | int8 en los pesos del `.mlpackage`; no se documentan otras variantes |
| Idiomas soportados | Multilingüe (etiquetas `multilingual`, `en`, `fi`); el modelo base es multilingüe y el tokenizador es XLM-R SentencePiece |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`SanaPhraseEmbedder.mlpackage`) + `tokenizer/tokenizer.json` (SentencePiece Unigram) |
| Dimensión del embedding | 384 (float), pooling por media y normalización L2 incluidos en el grafo |
| Entradas | `input_ids` y `attention_mask`, int32, shape `(1, 64)`; padding con id 1 y máscara 0 |
| Salida | `embedding`, float, shape `(1, 384)` |
| Plataforma mínima | macOS 15+ |
| Librería / herramienta | `coremltools` 9 (torch 2.7, transformers 4.52) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer encoder de la familia MiniLM, destilado para producir representaciones de frase multilingües mediante *knowledge distillation* sobre un profesor multilingüe, según el artículo *Making Monolingual Sentence Embeddings Multilingual using Knowledge Distillation* (EMNLP 2020) que cita la model card. Sobre la salida del encoder se aplican las dos operaciones habituales en sentence-transformers: mean pooling ponderado por la máscara de atención y normalización L2. En esta conversión ambas están integradas en el grafo Core ML, por lo que el consumidor recibe directamente un vector unitario de 384 dimensiones y puede calcular similitud coseno con un simple producto escalar.

No se ha realizado entrenamiento adicional ni fine-tuning: el autor indica explícitamente que los pesos son los originales salvo la cuantización int8. La conversión se hizo con `coremltools` 9, torch 2.7 y transformers 4.52, y se ajustó `tokenizer_class` a `XLMRobertaTokenizer` para que swift-transformers seleccione el tokenizador Unigram correcto. La innovación técnica reseñable no está en el modelo sino en el empaquetado: fidelidad numérica verificada frente al modelo PyTorch original con coseno ≥ 0,9997, y ~6 ms por frase en Apple Silicon, lo que permite ejecutar la comparación de frases en el propio Mac sin llamadas de red.

## Capacidades

- Generación de embeddings de frase de 384 dimensiones, normalizados L2, listos para similitud coseno.
- Comparación semántica multilingüe: empareja frases con el mismo significado aunque estén en idiomas distintos (el caso documentado es inglés y finés).
- Similitud de frases (`pipeline_tag: sentence-similarity`), no generación de texto: no produce respuestas, etiquetas ni explicaciones.
- Procesamiento de entradas cortas de hasta 64 tokens con formas tensoriales fijas, apto para comandos, disparadores y frases sueltas.
- Ejecución on-device en macOS 15+ mediante Core ML, sin dependencia de servicios externos.
- Integración con el stack nativo de Apple: `swift-transformers` para la tokenización y Core ML para la inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking"; la información disponible no documenta ninguna de estas capacidades.
- Multilingüismo heredado del modelo base; el autor solo declara y valida inglés y finés en el contexto de la aplicación.

## Casos de uso

- **Coincidencia de frases disparadoras por voz en Max/MSP**: es el caso original. La app Sana Sender transcribe lo que dice el estudiante, genera el embedding de la transcripción y lo compara por producto escalar con los embeddings de las frases que escribió el profesor; basta con superar un umbral de similitud para lanzar el mensaje OSC. La ventana de 64 tokens cubre de sobra frases de comando.
- **Enrutado de intents en asistentes locales para macOS**: clasificar una transcripción corta en un conjunto cerrado de intenciones comparándola contra frases prototipo precalculadas. Los ~6 ms por frase permiten hacer la comparación contra decenas de candidatas en tiempo real sin salir del dispositivo.
- **Detección de comandos bilingüe en aplicaciones educativas o de accesibilidad**: al compartir espacio de embeddings entre inglés y finés (y, por herencia del modelo base, otras lenguas), un mismo conjunto de disparadores funciona con estudiantes que hablan idiomas distintos sin duplicar la lógica de negocio.
- **Deduplicación y agrupación de frases cortas en corpus pequeños**: agrupar notas, títulos o entradas de FAQ por similitud semántica para consolidar duplicados. Adecuado por coste cero de infraestructura y baja latencia, siempre que las entradas no superen los 64 tokens.
- **Búsqueda semántica local sobre notas o documentación breve**: indexar fragmentos cortos y recuperar por similitud coseno desde una app nativa. Limitado a fragmentos pequeños; para documentos largos habría que trocear previamente.
- **Evaluación de calidad de transcripción ASR**: comparar la salida del reconocedor de voz con una referencia escrita usando similitud semántica en lugar de distancia de edición, de modo que errores morfológicos o de puntuación no penalicen tanto como un cambio de significado.
- **Prototipado rápido de clasificadores de texto sin entrenamiento**: usar similitud contra frases de referencia como línea base zero-shot antes de invertir en un modelo supervisado, aprovechando que el paquete se descarga y ejecuta sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB, etc.) en la información disponible. El autor solo reporta métricas de fidelidad de la conversión y de latencia:

| Métrica | Resultado | Contexto |
|---|---|---|
| Fidelidad frente al modelo PyTorch original | Coseno ≥ 0,9997 | Comparación de embeddings originales vs. convertidos |
| Latencia de inferencia | ~6 ms por frase | Apple Silicon, entrada de hasta 64 tokens |
| Tamaño del paquete de pesos | 118 MB | `SanaPhraseEmbedder.mlpackage`, int8 |
| Tamaño total del repo | 0,1 GB | Incluye tokenizador |
| Dimensión del embedding | 384 | Salida float `(1, 384)` |

No hay datos publicados de throughput en lote, consumo de memoria en tiempo de ejecución ni comparación de calidad semántica contra otros modelos de embeddings.

## Requisitos de hardware

- **VRAM / memoria**: no se especifica consumo en tiempo de ejecución. El paquete de pesos int8 ocupa 118 MB en disco, por lo que la huella es muy reducida y compatible con equipos de gama de entrada Apple Silicon.
- **GPU recomendadas**: no aplica en el sentido habitual; el modelo es Core ML y se ejecuta en macOS 15+ sobre Apple Silicon (CPU, GPU integrada o Neural Engine según la política de ejecución de Core ML). No hay soporte documentado para GPU NVIDIA, AMD o Intel.
- **¿Cabe en hardware de consumo?** Sí, en cualquier Mac con Apple Silicon y macOS 15 o superior. No es ejecutable en Windows ni Linux con este formato.
- **Opciones de despliegue**: Core ML de forma nativa; en Swift, mediante swift-transformers para la tokenización y la API de Core ML para la inferencia. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo ni se distribuye en GGUF o safetensors.
- **Latencia y throughput estimados**: ~6 ms por frase en Apple Silicon según el autor. El producto escalar entre embeddings es trivial, de modo que comparar una frase contra N candidatas añade un coste despreciable frente a la inferencia. No hay cifras de procesamiento en lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| eetteri/sana-phrase-model | No disponible (repo 0,1 GB; pesos int8 118 MB) | 64 tokens | Core ML `.mlpackage` (int8) | Apache 2.0 | Salida 384 d, pooling y L2 integrados; solo macOS 15+ |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | No disponible en la información | No disponible en la información | PyTorch / safetensors (modelo original) | Apache 2.0 | Mismo modelo sin cuantizar; portable a Linux/GPU; requiere pipeline de sentence-transformers para pooling y normalización |
| Otras alternativas de sentence embeddings multilingües | No disponible | No disponible | No disponible | No disponible | No se han proporcionado datos de comparación; no se incluyen cifras para no inventarlas |

La comparación relevante es contra su propio modelo base: idénticos pesos, misma dimensión de salida y misma licencia, con la diferencia de que la versión Core ML está cuantizada a int8, limitada a 64 tokens de entrada y atada al ecosistema Apple, a cambio de inferencia local muy rápida y sin dependencias de Python.

## Limitaciones y advertencias

- **Ventana de entrada muy corta**: 64 tokens fijos. Frases largas se truncan o se desbordan; no es apto para párrafos, documentos ni conversaciones multi-turno.
- **Sensibilidad a mayúsculas y puntuación**: el autor advierte explícitamente de que hay que pasar el texto a minúsculas y eliminar la puntuación antes de generar el embedding, porque la salida de speech-to-text llega capitalizada. Omitir este paso degrada la similitud.
- **Manejo manual del padding**: hay que rellenar con id 1 y máscara 0 hasta la forma `(1, 64)`; un padding incorrecto altera el vector resultante.
- **No es un modelo generativo**: no responde preguntas, no sigue instrucciones, no razona y no produce texto. Cualquier caso de uso que requiera generación necesita otro modelo.
- **Cuantización int8**: aunque la fidelidad reportada es coseno ≥ 0,9997, existe una desviación pequeña y no documentada por idioma o por tipo de entrada.
- **Dependencia de plataforma**: requiere macOS 15+ y Core ML. No hay artefactos para Linux, Windows, CUDA ni formatos GGUF/ONNX en la información disponible.
- **Ausencia de benchmarks de calidad**: no se han publicado evaluaciones en MTEB ni en tareas de recuperación o clasificación, por lo que el rendimiento semántico real en dominios distintos al de la aplicación original es desconocido.
- **Sesgos**: la model card no documenta análisis de sesgo. Al heredar los pesos del modelo base sin modificaciones, arrastra los sesgos de su corpus de entrenamiento, no especificado en la información proporcionada.
- **Riesgo de falso positivo en el emparejamiento**: al basarse en un umbral de similitud coseno, frases semánticamente próximas pero funcionalmente distintas pueden colisionar; conviene calibrar el umbral por aplicación.
- **Licencia**: Apache 2.0 permite uso comercial y modificaciones, con obligación de conservar el aviso de licencia y de atribución al modelo original.
- **Estado del repositorio**: 0 descargas y 0 "likes" en el momento de la consulta; es un artefacto auxiliar de una aplicación concreta, no un modelo mantenido como producto independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eetteri/sana-phrase-model
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Artículo citado en la model card: *Making Monolingual Sentence Embeddings Multilingual using Knowledge Distillation* (Reimers y Gurevych, EMNLP 2020)
- Aplicación que lo utiliza: Sana Sender (app de macOS que convierte voz en mensajes OSC para Max/MSP), sin repositorio enlazado en la información disponible
- Nota sobre la búsqueda web: los resultados disponibles (developer.sanas.ai, el meme "As an AI language model", la página de NVIDIA Sana y `Efficient-Large-Model/Sana_1600M_1024px`) corresponden a productos distintos y **no están relacionados** con este modelo. NVIDIA Sana es un modelo de generación de imágenes; Sanas es una plataforma de voz comercial. No se han encontrado enlaces adicionales pertinentes.

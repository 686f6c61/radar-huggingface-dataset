# Anurag9817/nepali-llama-590m-180m-english

## Resumen

Nepali LLaMA 590M — English 180M es un modelo de lenguaje causal decoder-only de 590.077.440 parámetros, publicado en HuggingFace por el usuario Anurag9817. Pertenece a la familia de arquitecturas LLaMA y se distribuye como checkpoint de preentrenamiento (más concretamente, de preentrenamiento continuado), no como modelo ajustado por instrucciones. Su rasgo definitorio es la combinación de un tokenizador SentencePiece propio de 40.000 entradas, etiquetas de inglés y nepalí, y una fase de entrenamiento continuado sobre 180 millones de tokens en inglés extraídos de FineWeb-Edu.

El modelo parte de una base orientada al nepalí, a la que se ha aplicado una segunda fase en inglés: 100 millones de tokens en una primera etapa y 80 millones adicionales de continuación. Con 18 capas, dimensión oculta de 1536, tamaño intermedio de 4096, 12 cabezas de atención y 6 cabezas KV (atención con consultas agrupadas), es un modelo pequeño que cabe sin dificultad en GPUs de consumo e incluso permite inferencia en CPU.

Su relevancia actual es la de un experimento de preentrenamiento de bajo coste: se entrenó con 2 × NVIDIA Tesla T4 en FP16, lo que demuestra que es viable producir checkpoints base multilingües con recursos mínimos. Su utilidad principal es la investigación y el ajuste posterior, no el uso directo en producción, ya que no ha pasado por RLHF, DPO ni ajuste por instrucciones, y no se documentan ni licencia ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia LLaMA (causal LM) |
| Parametros totales | 590.077.440 |
| Longitud de contexto | 1024 tokens (longitud de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés y nepalí (según etiquetas del repositorio) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension oculta | 1536 |
| Tamano intermedio (FFN) | 4096 |
| Numero de capas | 18 |
| Cabezas de atencion | 12 |
| Cabezas KV | 6 (GQA) |
| Tamano de vocabulario | 40.000 |
| Tokenizador | SentencePiece propio (`tokenizer/nepali_llama_40k.model`); PAD=0, UNK=1, BOS=2, EOS=3 |
| Tokens de entrenamiento en inglés | 180.000.000 (100M etapa 1 + 80M continuación) |
| Tamano del repositorio | 2,4 GB |
| Precision de entrenamiento | FP16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo LLaMA, con normalización previa, activación SwiGLU en la FFN (dimensión intermedia 4096 para una dimensión oculta de 1536) y atención con consultas agrupadas: 12 cabezas de consulta frente a 6 cabezas de clave/valor, lo que reduce el coste de la caché KV en inferencia. El vocabulario de 40.000 entradas se gestiona mediante un tokenizador SentencePiece entrenado específicamente para el proyecto, que el autor indica explícitamente que no debe sustituirse por un AutoTokenizer genérico.

El entrenamiento se realizó en dos etapas sobre FineWeb-Edu, un corpus filtrado por criterios de calidad educativa: primero 100 millones de tokens y después 80 millones adicionales, sumando 180 millones de tokens en inglés. La secuencia de entrenamiento fue de 1024 tokens, con precisión FP16, optimizador AdamW de 8 bits y acumulación de gradiente de 8, sobre 2 × NVIDIA Tesla T4. No se documenta el uso de RLHF, DPO, SFT ni ninguna técnica de alineación, y no se declara el volumen de tokens empleado en la fase previa en nepalí. Con 180 millones de tokens para 590 millones de parámetros, la ratio de tokens por parámetro es de aproximadamente 0,3, muy inferior a la óptima de Chinchilla (unos 20), lo que apunta a un modelo deliberadamente infraentrenado y pensado como base experimental.

## Capacidades

- Generación de texto causal en inglés, con continuación de prompt y modelado de lenguaje puro.
- Capacidad residual en nepalí, heredada de la base previa, aunque no se documenta su grado real de competencia.
- Razonamiento básico, código y matemáticas no están garantizados ni evaluados; son capacidades emergentes posibles, no verificadas.
- No soporta tool calling ni function calling: no hay plantilla de chat ni formato de herramientas.
- No soporta agentes ni razonamiento multi-paso estructurado, al no estar ajustado por instrucciones.
- Capacidades multilingües limitadas a los dos idiomas etiquetados; no se documentan otros.
- No dispone de modo de pensamiento (thinking mode), visión, audio ni multimodalidad.
- Utilizable como extractor de representaciones internas o como base para ajuste fino supervisado.

## Casos de uso

- Ajuste fino supervisado para una tarea concreta: el checkpoint sirve como inicialización para SFT en clasificación de texto, resumen o generación de respuestas, aprovechando que el coste de ajuste de 590M parámetros es asumible en una única GPU de consumo.
- Preentrenamiento continuado en nepalí o en dominios especializados: el tokenizador de 40.000 entradas y la base multilingüe permiten seguir entrenando sobre corpus propios con un presupuesto reducido.
- Investigación en modelos de bajo coste: con 2 × Tesla T4 como hardware de referencia, es un banco de pruebas reproducible para estudiar curvas de escalado, elección de tokenizador y mezcla de idiomas.
- Generación de texto en dominios educativos: al haberse entrenado sobre FineWeb-Edu, puede usarse como generador base para completar material didáctico, siempre con revisión humana.
- Destilación de conocimiento: actuar como modelo profesor o alumno en experimentos de destilación hacia arquitecturas aún más pequeñas, dado su tamaño manejable.
- Extracción de embeddings y evaluación de representaciones: sus 18 capas y dimensión 1536 son adecuadas para analizar representaciones internas en estudios de lingüística computacional.
- Prototipado educativo y docencia: permite demostrar el ciclo completo de preentrenamiento y despliegue en hardware modesto dentro de un curso o taller.
- Base para pruebas de cuantización y de motores de inferencia: el reducido tamaño de la caché KV (unos 54 MB en FP16 con contexto de 1024) facilita medir latencia y memoria en distintas configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La búsqueda web asociada no devolvió ningún resultado relevante sobre este modelo: los enlaces recuperados corresponden a contenidos sin relación (páginas de consumo y foros sobre Amazon), por lo que no aportan datos de evaluación.

## Requisitos de hardware

- Pesos en FP16: aproximadamente 1,2 GB (590.077.440 × 2 bytes). El repositorio ocupa 2,4 GB, cifra coherente con un almacenamiento en FP32 (≈2,36 GB), aunque la precisión exacta de los ficheros publicados no se documenta.
- Caché KV en FP16 con contexto de 1024: unos 54 MB (2 × 18 capas × 6 cabezas KV × 128 de dimensión de cabeza × 1024 tokens × 2 bytes).
- VRAM total estimada para inferencia: en torno a 1,5 GB en FP16 incluyendo overhead del runtime.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; el propio autor usó 2 × NVIDIA Tesla T4 para el entrenamiento, y modelos de esta talla funcionan sin problema en RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, holgadamente, en cualquier tarjeta con 4 GB o más; también es viable la inferencia en CPU.
- Opciones de despliegue: `transformers` (librería declarada) y text-generation-inference, ya que el repositorio incluye la etiqueta `endpoints_compatible`. El uso con vLLM, llama.cpp u Ollama no está documentado; llama.cpp requeriría una conversión a GGUF no incluida en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nepali LLaMA 590M — English 180M | 590M | 1024 | no disponible | HuggingFace (transformers, safetensors) |
| TinyLlama-1.1B | 1,1B | 2048 | Apache-2.0 | HuggingFace (múltiples formatos) |
| Qwen2.5-0.5B | 0,49B | 32.768 | Apache-2.0 | HuggingFace (base e instruct) |
| SmolLM2-360M | 0,36B | 8192 | Apache-2.0 | HuggingFace (base e instruct) |
| Pythia-410M | 0,41B | 2048 | Apache-2.0 | HuggingFace (base) |

Los datos de los modelos comparativos corresponden a su documentación pública habitual y deben verificarse en sus respectivas fichas antes de tomar decisiones. Frente a ellos, este modelo destaca por su tokenizador específico para nepalí y por el bajo coste de entrenamiento declarado, pero queda por detrás en longitud de contexto, en claridad de licencia y en disponibilidad de formatos cuantizados o ajustados por instrucciones.

## Limitaciones y advertencias

- Licencia no disponible: sin términos explícitos, el uso comercial es jurídicamente arriesgado y debe aclararse con el autor antes de cualquier despliegue.
- No es un modelo de chat: no ha recibido ajuste por instrucciones, RLHF ni DPO, por lo que no sigue instrucciones de forma fiable.
- Riesgo elevado de alucinación: al ser un modelo base infraentrenado, tiende a continuar texto de forma plausible sin garantía de veracidad.
- Contexto de solo 1024 tokens, insuficiente para documentos largos, conversaciones multi-turno extensas o recuperación aumentada con muchos fragmentos.
- Entrenamiento en inglés muy limitado (180M tokens) y sin evaluación publicada; su competencia real en inglés y en nepalí es desconocida.
- Sesgos no documentados: FineWeb-Edu está filtrado hacia registro educativo y formal, lo que puede sesgar el estilo y el vocabulario generados.
- Ausencia de benchmarks impide comparar su calidad objetivamente con alternativas.
- El tokenizador debe cargarse como el SentencePiece original incluido; sustituirlo por un AutoTokenizer genérico produciría tokenizaciones incorrectas y degradaría la generación.
- No se documentan cuantizaciones oficiales, por lo que cualquier uso en GGUF o 4 bits requeriría una conversión propia con la consiguiente pérdida de calidad no medida.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Anurag9817/nepali-llama-590m-180m-english
- Tokenizador incluido en el repositorio: `tokenizer/nepali_llama_40k.model` (dentro del propio repositorio)
- Paper, blog, repositorio de código o demo: no disponible
- Resultados de la búsqueda web: los enlaces recuperados no guardan relación con el modelo y no se incluyen por no ser pertinentes

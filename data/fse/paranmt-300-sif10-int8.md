# fse/paranmt-300-sif10-int8

## Resumen

`fse/paranmt-300-sif10-int8` es un modelo de embeddings estáticos derivado del modelo gensim `fse/paranmt-300`, publicado por el autor `fse` en Hugging Face. No es un modelo generativo ni un transformer: es una tabla de 77.224 filas (vocabulario) por 300 dimensiones almacenada en int8, sobre la que se calcula la media de los vectores de los tokens de un texto y se normaliza el resultado a longitud unitaria. El pipeline declarado es `feature-extraction` y el idioma soportado es únicamente inglés.

Su relevancia es acotada pero concreta: ofrece sentence embeddings ultraligeros (unos 24,7 MB de fichero) para tareas de similitud semántica y recuperación en inglés, con un coste de almacenamiento y de cómputo muy inferior al de un transformer de embeddings. La variante `sif10` incorpora la ponderación SIF (Smooth Inverse Frequency, con a=0.001) y la eliminación de diez componentes principales ajustados sobre un corpus de entrenamiento, una técnica clásica para mejorar embeddings por media de vectores.

El modelo se enmarca en la librería `fse` (Fast Sentence Embeddings), que requiere la versión 2.0 o superior. Incluye métricas medidas sobre el conjunto de test STS-B (1.379 pares): 78,11458 de Pearson x100 con el tokenizador por defecto, y un Recall@10 de 0,996773 frente a la misma variante en float32. La licencia es desconocida, lo que constituye una advertencia importante para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (tabla de vectores por palabra, media de filas + normalización L2) |
| Parámetros totales | 23.892.356 (77.224 filas x 300 dimensiones, int8) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto; procesa el texto completo como bolsa de palabras) |
| Tipos de cuantización | int8 (tabla almacenada); la librería calcula en float32; existe la variante float32 y float16 del mismo modelo base |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `unknown` (no se concede permiso explícito; ver limitaciones) |
| Formato de pesos | safetensors (tabla int8 generada por `quantize_rows@1`) |
| Vocabulario | 77.224 filas |
| Dimensiones | 300 |
| Tokenizador | `fse_words@1` |
| Tamaño del fichero | 24.665.819 bytes (~24,7 MB) |
| Huella (fingerprint) | `xxh3-128:da86203db14c76128eb2f9a8d4be97e6` |
| Librería requerida | `fse >= 2.0` |

## Arquitectura y entrenamiento

La arquitectura no es neuronal en el sentido habitual: se trata de un modelo de embeddings estáticos tipo word2vec/GloVe/ParaNMT. Cada palabra del vocabulario tiene un vector de 300 dimensiones; el embedding de una frase se obtiene promediando los vectores de sus tokens y normalizando el vector resultante a norma unitaria. La variante `sif10` aplica ponderación SIF con pesos `a/(a+p(w))` (a=0.001) sobre las frecuencias de `wordfreq` 3.1.1, y posteriormente resta diez componentes principales no centrados ajustados sobre el corpus de entrenamiento.

El corpus usado para ajustar los pesos y componentes es `HuggingFaceFW/fineweb-edu-llama3-annotations` (revisión `72df4c92fb1b48beceb16016e8f695ec40a6c3a5`), con 859.346 párrafos de entrenamiento y semilla 0. Los componentes se ajustaron exclusivamente sobre ese corpus, nunca sobre los textos de evaluación, y se plegaron en la tabla ponderada antes de la cuantización. El modelo base `fse/paranmt-300` procede de ParaNMT, entrenado originalmente sobre CzEng 1.6.

La cuantización se realiza mediante `quantize_rows@1` desde la tabla float32 con huella `xxh3-128:ba010b29772aca247c55cf0cf3df65cf`. La model card advierte que los vectores que calcula `fse` son los de la tabla cuantizada, no los del modelo previo a la cuantización; la cercanía se mide (diferencia de +0,00243 puntos de Pearson respecto a float32 del mismo método) y no se promete.

## Capacidades

- Generación de sentence embeddings en inglés mediante media de vectores de tokens y normalización L2.
- Similitud semántica entre frases y recuperación densa (retrieval) en inglés.
- Ponderación SIF opcional (a=0.001) y eliminación de componentes principales (10 componentes) para mejorar la calidad del embedding.
- Tokenización propia `fse_words@1` sobre texto crudo.
- No soporta tool calling, function calling ni agentes.
- No soporta razonamiento multi-paso ni modo thinking.
- No soporta visión, audio ni modalidades distintas de texto.
- No es multilingüe: solo inglés.
- No genera texto; es exclusivamente un extractor de características.

## Casos de uso

- Búsqueda semántica en inglés sobre corpus pequeños o medianos: indexar documentos como vectores de 300 dimensiones y recuperar por similitud coseno, con un coste de almacenamiento de ~24,7 MB para el modelo y 300 bytes por vector en int8.
- Deduplicación y clustering de textos: agrupar titulares, reseñas o descripciones por similitud semántica usando el embedding de frase como característica de entrada a k-means o DBSCAN.
- Filtrado y enrutamiento de consultas: clasificar consultas de usuario en categorías predefinidas comparando su embedding con centroides de categoría, con latencia muy baja al no requerir GPU.
- Sistemas de recomendación basados en contenido: calcular similitud entre descripciones de ítems para recomendar artículos relacionados sin depender de un modelo transformer.
- Detección de duplicados casi idénticos en pipelines de datos: comparar embeddings de párrafos para identificar contenido repetido antes de indexar o entrenar.
- Baseline y referencia en evaluación de embeddings: servir como punto de comparación ligero frente a modelos transformer de embeddings en tareas de STS o recuperación en inglés.
- Despliegue en entornos con recursos muy limitados (CPU, dispositivos embebidos, contenedores pequeños): al ser una tabla estática de ~25 MB, no requiere GPU ni memoria de activaciones.

## Benchmarks y rendimiento

| Benchmark | Este modelo (int8) | Misma variante float32 | Diferencia |
|---|---:|---:|---:|
| STS-B Pearson x100 (tokenizador por defecto) | 78,11458 | No disponible en la ficha | No disponible |
| STS-B Pearson x100 (método SIF-10) | 78,11458 | 78,11215 | +0,00243 |
| STS-B Pearson x100 (media simple, float32) | No aplica | 79,81644 | No aplica |
| Recall@10 frente a float32 del mismo método | 0,996773 | 1,0 (referencia) | -0,003227 |

Notas: el conjunto de evaluación es STS-B test (1.379 pares; 2.758 filas de frases para Recall@10). La comparación controlada usa el preprocesado NLTK del notebook de la versión 1.x mediante una vista de tokenizador externo sobre la misma tabla. La model card advierte que los benchmarks guiaron la selección del corpus, por lo que no son estimaciones sobre holdout intacto. No se han publicado resultados de MMLU, HumanEval ni GSM8K (no aplican a un modelo de embeddings).

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB en GPU; el modelo se ejecuta en CPU. El fichero ocupa ~24,7 MB y la librería calcula en float32, por lo que el consumo de RAM es del orden de decenas de MB.
- GPU recomendadas: no requiere GPU. Funciona en cualquier CPU.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en dispositivos sin GPU.
- Opciones de despliegue: la librería `fse >= 2.0` (`fse.Encoder.from_pretrained(...)`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada; la model card indica explícitamente que no se hace ninguna afirmación sobre velocidad ni tiempo de carga.

## Comparativa con modelos similares

| Modelo | Tipo | Dimensiones | Vocabulario | Contexto | Licencia | Formato |
|---|---|---:|---:|---|---|---|
| `fse/paranmt-300-sif10-int8` | Embeddings estáticos (SIF-10, int8) | 300 | 77.224 | No aplica | unknown | safetensors |
| `fse/paranmt-300` (base) | Embeddings estáticos (gensim) | 300 | No disponible | No aplica | unknown | gensim |
| Variante float32 del mismo modelo | Embeddings estáticos (SIF-10, float32) | 300 | 77.224 | No aplica | unknown | safetensors |
| Modelos transformer de embeddings en inglés (p. ej. familia sentence-transformers) | Transformer encoder | 384-1024 típicamente | Subword | 256-512 típicamente | Variable | safetensors |

La comparación con modelos transformer de embeddings no se puede cuantificar con los datos disponibles: no se han publicado resultados de benchmarks comparativos en la información proporcionada. La ventaja diferencial de este modelo es el tamaño (~24,7 MB) y la ausencia de requisitos de GPU; la desventaja es que no captura contexto sintáctico ni dependencias de largo alcance como un transformer.

## Limitaciones y advertencias

- Licencia `unknown`: la model card indica explícitamente que `license: unknown` no concede permiso. El uso comercial no está autorizado por la información disponible.
- El modelo base ParaNMT se entrenó sobre CzEng 1.6, disponible únicamente para investigación no comercial, lo que no establece una licencia para los vectores derivados.
- Los datos de frecuencia de `wordfreq` incluyen material CC BY-SA 4.0 y créditos específicos por fuente en su NOTICE.md; la preparación transforma esas frecuencias en pesos y las pliega en la tabla. El campo de licencia del modelo fuente no renuncia a esos términos.
- Solo inglés: no soporta otros idiomas.
- No captura orden de palabras ni estructura sintáctica: la media de vectores es una representación de bolsa de palabras.
- Los benchmarks publicados guiaron la selección del corpus, por lo que no son estimaciones sobre holdout intacto.
- Los vectores calculados son los de la tabla cuantizada, no los del modelo previo a la cuantización; la diferencia medida es pequeña (+0,00243 puntos de Pearson) pero existe.
- No se hacen afirmaciones sobre velocidad ni tiempo de carga.
- Riesgo de alucinación: no aplica directamente al no ser generativo, pero la similitud semántica puede producir falsos positivos en recuperación.
- Los derechos de los titulares pueden solicitar la retirada del modelo a través de los issues del repositorio de `fse`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fse/paranmt-300-sif10-int8
- Modelo base: https://huggingface.co/fse/paranmt-300
- Repositorio de la librería fse: https://github.com/oborchers/Fast_Sentence_Embeddings
- Repositorio de ParaNMT: https://github.com/jwieting/para-nmt-50m
- Paper de ParaNMT: https://aclanthology.org/P18-1042/
- CzEng 1.6: https://ufal.mff.cuni.cz/czeng/czeng16
- wordfreq (Robyn Speer): https://github.com/rspeer/wordfreq
- Créditos de datos de wordfreq: https://github.com/rspeer/wordfreq/blob/master/NOTICE.md
- Corpus de preparación: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu-llama3-annotations
- Issues para solicitudes de retirada: https://github.com/oborchers/Fast_Sentence_Embeddings/issues

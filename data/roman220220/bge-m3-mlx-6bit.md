# roman220220/bge-m3-mlx-6bit

## Resumen

bge-m3-mlx-6bit es una conversión cuantizada a 6 bits del modelo de embeddings multilingüe BAAI/bge-m3, empaquetada en formato MLX para su ejecución nativa en Apple Silicon. Lo desarrolla el usuario roman220220 (IPSupport LLC) como componente del motor de búsqueda semántica de su aplicación local LLMTray, y no entrena ningún modelo nuevo: transforma los pesos originales de BAAI (XLM-RoBERTa de 568 M de parámetros, 100+ idiomas, contexto de 8192 tokens, vectores de 1024 dimensiones) en una versión de 471 MB que ocupa aproximadamente una quinta parte del original en fp32 (2,27 GB).

La relevancia de esta ficha es doble. Por un lado, demuestra una técnica de cuantización por grupos (group size 64) aplicada tanto a las capas lineales como a los embeddings de palabra, que suponen cerca de la mitad de los parámetros, manteniendo las capas de normalización y los embeddings posicionales en fp16. Por otro, publica una metodología de evaluación reproducible con 12.039 textos que mide la degradación real frente al modelo original: solapamiento top-10 del 94,4 % y similitud coseno media de 0,9926 en textos largos.

El resultado es un embedder denso (solo la cabeza CLS con normalización L2; sin cabezas sparse ni ColBERT) pensado para recuperación semántica en local, sin conexión y con huella de memoria reducida, a costa de una pérdida medible en el ranking de los resultados más próximos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder XLM-RoBERTa (embedder denso, pooling CLS + normalización L2) |
| Parametros totales | 566.705.152 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | 6 bits, group size 64 (capas lineales y embeddings de palabra); embeddings posicionales, de tipo de token y layer norms en fp16 |
| Idiomas soportados | 100+ idiomas (heredados de BGE-M3; el repositorio no enumera la lista) |
| Licencia | MIT |
| Formato de pesos | safetensors (layout Hugging Face: `embeddings.*`, `encoder.layer.N.*`, sin pooler) |
| Dimension del vector | 1024 |
| Libreria | mlx |
| Tamano del repositorio | 0,5 GB (pesos: 471 MB) |
| Modelo base | BAAI/bge-m3 (revision `5617a9f`) |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo base BAAI/bge-m3 es un encoder XLM-RoBERTa multilingüe entrenado por BAAI con objetivos de recuperación multiidioma; esta conversión no modifica la arquitectura ni reentrena pesos, solo cuantiza. La receta de cuantización, documentada en el repositorio `rromenskyi/quant-ternary` (directorio `bge-m3-quant/`, scripts `poc/mlx_build.py` y `poc/eval_mlx.py`), aplica 6 bits con group size 64 a todas las capas lineales y a la matriz de embeddings de palabra (250k × 1024, aproximadamente la mitad de los parámetros del modelo), mientras que los embeddings posicionales, los de tipo de token y las layer norms permanecen en fp16 para preservar estabilidad numérica.

Una decisión técnica destacable es la eliminación de las cabezas sparse y ColBERT del modelo original: solo se conserva la salida densa (estado oculto final del token CLS, normalizado L2). Esto reduce el tamaño y simplifica el runtime, pero descarta las capacidades de recuperación léxica y multi-vector de BGE-M3. El cargador debe cuantizar exactamente los módulos que llevan `.scales` y `.biases` antes de cargar los pesos; el autor advierte que otros cargadores de embeddings MLX no fueron probados. El tokenizador incluido es la variante que no añade un token por espacio en blanco final (el `tokenizer.json` de BAAI convierte un salto de línea final en un token extra antes de `</s>`), por lo que se recomienda limpiar los textos antes de la inferencia.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para similitud semántica y recuperación (pipeline feature-extraction).
- Búsqueda semántica multilingüe en más de 100 idiomas, con recuperación de traducciones medida sobre pares Tatoeba en ruso, ucraniano, chino, japonés y alemán frente a inglés.
- Recuperación de código: evaluación sobre 1000 funciones de la librería estándar de Python, donde un docstring localiza el cuerpo de su función.
- Procesamiento de textos largos: contexto de 8192 tokens, validado con 39 módulos completos de la librería estándar de 5.000 a 6.500 tokens.
- Similitud entre frases (tag sentence-similarity).
- No incluye tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo de representación.
- No incluye las cabezas sparse ni ColBERT del BGE-M3 original, por lo que no soporta recuperación léxica dispersa ni multi-vector.

## Casos de uso

- Búsqueda semántica local en aplicaciones de escritorio para macOS: es el caso real de LLMTray, que lo usa para buscar en archivos de proyecto y memoria; los 471 MB y la ejecución nativa en MLX permiten indexar y consultar sin conexión y sin salir de la máquina.
- Indexación de documentación técnica multilingüe: con contexto de 8192 tokens puede embeber secciones completas de manuales sin trocear en fragmentos pequeños, y la recuperación de traducciones medida (95,84 %) lo hace adecuado para corpus donde las consultas y los documentos están en idiomas distintos.
- Búsqueda de código en repositorios: la evaluación sobre funciones de la librería estándar de Python (50,0 % de recuperación top-1) lo sitúa como opción para localizar implementaciones a partir de descripciones en lenguaje natural, con la advertencia de que la tasa de acierto es moderada.
- Deduplicación y agrupación de documentos: la similitud coseno entre vectores normalizados permite detectar duplicados casi idénticos; conviene fijar umbrales conservadores porque la cuantización a 6 bits introduce desviaciones de hasta 0,031 en el peor caso medido.
- Sistemas de recomendación por contenido: embeber artículos o productos y calcular vecinos en el espacio de 1024 dimensiones para sugerencias basadas en texto.
- Filtrado previo en pipelines RAG: como primera etapa de recuperación en un sistema con reordenador posterior, el solapamiento top-10 del 94,4 % con el original implica que pierde aproximadamente uno de cada veinte resultados relevantes respecto al modelo completo, aceptable si después hay un reranker.
- Clasificación de texto por similitud con prototipos: comparar la representación de un texto con las de etiquetas de referencia, útil para enrutado de tickets o moderación ligera en local.

## Benchmarks y rendimiento

Mediciones publicadas por el autor sobre 12.039 textos, comparando cada build MLX contra el original en transformers (fp32) ejecutado en un Apple M5 con cómputo fp16:

| Build | Tamano | Coseno medio/min: frases | Coseno medio/min: codigo | Coseno medio/min: textos largos | Retrieval traduccion | Retrieval codigo | Solapamiento top-10 |
|---|---|---|---|---|---|---|---|
| original (PyTorch, fp32) | 2,27 GB | — | — | — | 95,83 % | 49,7 % | — |
| bge-m3-mlx-fp16 | 1133 MB | 1,00000 / 1,0000 | 1,00000 / 0,9995 | 0,99998 / 0,9999 | 95,84 % | 49,7 % | 99,8 % |
| bge-m3-mlx-8bit | 610 MB | 0,99986 / 0,9993 | 0,99975 / 0,9990 | 0,99921 / 0,9983 | 95,85 % | 49,8 % | 98,5 % |
| bge-m3-mlx-6bit | 471 MB | 0,99792 / 0,969 | 0,99642 / 0,9933 | 0,99257 / 0,9894 | 95,84 % | 50,0 % | 94,4 % |

La recuperación de traducción se mide como top-1 de la traducción correcta entre 1000 candidatos, en ambos sentidos y promediado, sobre pares de test Tatoeba (ruso, ucraniano, chino, japonés y alemán frente a inglés). La recuperación de código mide si un docstring localiza el cuerpo de su función entre 1000 funciones de la librería estándar de Python. El solapamiento top-10 es la proporción de los diez resultados más próximos de cada consulta que coinciden con los del modelo original.

Comparación adicional aportada por el autor: el build MLX de 8 bits es más fiel al original que el GGUF Q8_0 de llama.cpp (98,5 % frente a 97,1 % de solapamiento top-10).

## Requisitos de hardware

- VRAM/unified memory estimada: 471 MB de pesos más overhead del runtime MLX; con contexto completo de 8192 tokens hay que sumar la memoria de activaciones, no cuantificada en la información disponible.
- Hardware objetivo: Apple Silicon (la evaluación se hizo en un Apple M5); no hay soporte CUDA ni ROCm en esta conversión.
- Cabe holgadamente en cualquier Mac con Apple Silicon, incluidos equipos con 8 GB de memoria unificada.
- Despliegue: librería MLX con el cargador propio de LLMTray (`runtime/llmtray_embed`); el autor advierte que otros cargadores de embeddings MLX no fueron probados. Para llama.cpp existe la variante GGUF en `roman220220/bge-m3-GGUF`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| bge-m3-mlx-6bit (este) | 566,7 M | 8192 | 1024 | MLX safetensors 6 bits | MIT | Solapamiento top-10 del 94,4 % frente al original; solo denso |
| bge-m3-mlx-8bit | 566,7 M | 8192 | 1024 | MLX safetensors 8 bits | MIT | 610 MB; solapamiento top-10 del 98,5 % |
| bge-m3-mlx-fp16 | 566,7 M | 8192 | 1024 | MLX safetensors fp16 | MIT | 1133 MB; solapamiento top-10 del 99,8 % |
| BAAI/bge-m3 (original) | 568 M | 8192 | 1024 | PyTorch safetensors fp32 | MIT | 2,27 GB; incluye cabezas sparse y ColBERT |
| bge-m3-GGUF (Q8_0) | 566,7 M | 8192 | 1024 | GGUF | MIT | Solapamiento top-10 del 97,1 %; para llama.cpp |

La elección entre variantes es un compromiso entre tamaño y fidelidad de ranking: el salto de 8 a 6 bits reduce el peso de 610 a 471 MB pero baja el solapamiento top-10 del 98,5 % al 94,4 %. No se dispone de comparación con otros embedders de la misma categoría (por ejemplo, e5 o gte multilingües) en la información proporcionada.

## Limitaciones y advertencias

- Degradación medible en el ranking: el solapamiento top-10 del 94,4 % implica que aproximadamente uno de cada veinte resultados cambia respecto al modelo original; una frase rara llega a una coseno de 0,969 en el peor caso.
- Solo embeddings densos: sin cabezas sparse ni ColBERT, no se pueden replicar los modos de recuperación híbrida del BGE-M3 original.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos en similitud: textos distintos pueden quedar próximos en el espacio vectorial, y la cuantización amplía esa imprecisión.
- Dependencia del cargador: los módulos cuantizados deben cargarse exactamente según `.scales` y `.biases`; otros runtimes MLX no fueron validados y pueden producir resultados incorrectos.
- Sensibilidad del tokenizador a espacios en blanco finales: si no se limpian los textos, el tokenizador de BAAI añade un token extra antes de `</s>` y las implementaciones dejan de coincidir.
- Plataforma: solo Apple Silicon vía MLX; no hay build para GPU NVIDIA ni para CPU genérica en este repositorio.
- Idiomas: aunque hereda el soporte de más de 100 idiomas, la evaluación publicada solo cubre ruso, ucraniano, chino, japonés y alemán frente a inglés; el rendimiento en otras lenguas no está medido.
- Licencia MIT, igual que el modelo base, pero el repositorio original de BAAI no incluye fichero de licencia; el autor incorpora el texto MIT estándar. El modelo se distribuye "as is", sin garantías, y el uso comercial queda sujeto a la licencia del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de las mediciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roman220220/bge-m3-mlx-6bit
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Variante MLX fp16: https://huggingface.co/roman220220/bge-m3-mlx-fp16
- Variante MLX 8 bits: https://huggingface.co/roman220220/bge-m3-mlx-8bit
- Variante GGUF para llama.cpp: https://huggingface.co/roman220220/bge-m3-GGUF
- Scripts y mediciones: https://github.com/rromenskyi/quant-ternary
- Runtime de embeddings de LLMTray: https://github.com/ipsupport-llc/llmtray/tree/main/runtime/llmtray_embed
- LLMTray (aplicación): https://www.ipsupport.us/llmtray/
- Repositorio LLMTray: https://github.com/ipsupport-llc/llmtray
- IPSupport Code: https://ipsupport-llc.github.io/ipsupport-code/
- Dataset Tatoeba usado en la evaluación: https://huggingface.co/datasets/mteb/tatoeba-bitext-mining

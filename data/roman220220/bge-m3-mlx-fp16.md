# roman220220/bge-m3-mlx-fp16

## Resumen

`roman220220/bge-m3-mlx-fp16` es una conversión a MLX en precisión fp16 del modelo de embeddings multilingüe BGE-M3 de BAAI. No es un modelo nuevo: es un artefacto de conversión pensado para ejecutarse en Apple Silicon a través del runtime de embeddings de LLMTray, la aplicación de IA local de IPSupport. Mantiene la arquitectura XLM-RoBERTa del original, con 566.705.152 parámetros, contexto de 8192 tokens y vectores densos de 1024 dimensiones, pero reduce el peso del repositorio de 2,27 GB (fp32 en PyTorch) a 1133 MB.

Su relevancia es práctica: permite obtener embeddings densos de BGE-M3 en Macs con chip Apple sin depender de PyTorch ni de CUDA, con una fidelidad medida frente al original muy alta (coseno medio de 1.00000 en frases y 0.99998 en textos largos, y un solapamiento del top-10 del 99,8 %). La conversión elimina las cabezas sparse y ColBERT, por lo que solo sirve para recuperación densa.

La licencia es MIT, igual que la del modelo base, y el autor incluye builds alternativos en 8 y 6 bits, además de una versión GGUF para llama.cpp. Es un artefacto de nicho, con cero descargas y cero likes en el momento de redactar esta ficha, adecuado para pipelines de búsqueda semántica local en macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder), conversión a MLX |
| Parametros totales | 566.705.152 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | fp16 (este repo); builds hermanos en 8 bits y 6 bits; GGUF en repo aparte |
| Idiomas soportados | más de 100 idiomas según el modelo base (no se detalla lista en la información disponible) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), `model.safetensors` + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo subyacente es BGE-M3 de BAAI, un encoder XLM-RoBERTa de 568 M de parámetros entrenado para producir representaciones multilingües de frases y documentos con contexto de hasta 8192 tokens y vectores de 1024 dimensiones. El autor de esta conversión no ha entrenado nada: ha tomado la revisión `5617a9f` del repositorio original y ha convertido los pesos a MLX en fp16, conservando la configuración de BAAI y eliminando el pooler, la cabeza sparse y la cabeza ColBERT.

La innovación técnica del artefacto está en la fidelidad de la conversión y en la metodología de evaluación. El autor mide el coseno frente al original en frases, código y textos largos, además de la recuperación de traducciones (Tatoeba, ruso, ucraniano, chino, japonés y alemán contra inglés) y de código (1000 funciones de la biblioteca estándar de Python), sobre 12.039 textos y con cómputo fp16 en un Apple M5. Los builds cuantizados cuantizan las capas lineales y los embeddings de palabra (250k × 1024, aproximadamente la mitad del modelo) con group size 64, dejando en fp16 los embeddings de posición y tipo de token y las layer norms.

## Capacidades

- Generación de embeddings densos: devuelve el estado oculto final del token CLS, normalizado L2, de 1024 dimensiones.
- Búsqueda semántica y recuperación densa multilingüe en más de 100 idiomas.
- Similitud entre frases y sentence similarity.
- Recuperación de traducciones entre idiomas (evaluada en ruso, ucraniano, chino, japonés y alemán contra inglés).
- Recuperación de código: un docstring localiza su cuerpo de función entre 1000 candidatos.
- Procesamiento de textos largos de hasta 8192 tokens (evaluado con módulos de 5–6,5k tokens).
- Extracción de características (`feature-extraction`) para pipelines de NLP.
- No incluye tool calling, agentes, visión, audio ni modo thinking: es exclusivamente un modelo de embeddings.
- No incluye las cabezas sparse ni ColBERT del BGE-M3 original, por lo que no soporta recuperación híbrida ni multi-vector.

## Casos de uso

- Búsqueda semántica local en macOS: indexar documentos y recuperarlos por significado usando el runtime MLX, sin salir del Mac ni depender de servicios en la nube.
- Búsqueda de archivos de proyecto en herramientas de desarrollo: LLMTray lo usa para localizar ficheros y memoria del proyecto mediante similitud de embeddings.
- Recuperación aumentada (RAG) en aplicaciones de escritorio: generar embeddings de fragmentos de documentación y consultas para alimentar un LLM local, aprovechando el contexto de 8192 tokens para trocear documentos largos sin perder coherencia.
- Deduplicación y clustering de textos multilingües: agrupar artículos, tickets o reseñas por similitud coseno en corpus con varios idiomas.
- Búsqueda de código por descripción en lenguaje natural: indexar funciones y docstrings para que un desarrollador encuentre implementaciones a partir de una frase, con la recuperación de código medida por el autor.
- Filtrado y clasificación de contenidos: usar los embeddings como entrada de clasificadores ligeros (regresión logística, k-NN) para moderación o etiquetado temático.
- Búsqueda cross-lingual: recuperar documentos en un idioma a partir de consultas en otro, útil en bases de conocimiento con contenido mezclado.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos sobre 12.039 textos en un Apple M5 con el runtime de LLMTray, comparando contra el original en PyTorch fp32:

| Metrica | Original (fp32) | bge-m3-mlx-fp16 | bge-m3-mlx-8bit | bge-m3-mlx-6bit |
|---|---|---|---|---|
| Tamano | 2,27 GB | 1133 MB | 610 MB | 471 MB |
| Coseno medio/min (frases) | — | 1.00000 / 1.0000 | 0.99986 / 0.9993 | 0.99792 / 0.969 |
| Coseno medio/min (codigo) | — | 1.00000 / 0.9995 | 0.99975 / 0.9990 | 0.99642 / 0.9933 |
| Coseno medio/min (textos largos) | — | 0.99998 / 0.9999 | 0.99921 / 0.9983 | 0.99257 / 0.9894 |
| Recuperacion de traducciones | 95,83 % | 95,84 % | 95,85 % | 95,84 % |
| Recuperacion de codigo | 49,7 % | 49,7 % | 49,8 % | 50,0 % |
| Solapamiento top-10 | — | 99,8 % | 98,5 % | 94,4 % |

No se han publicado resultados de benchmarks estándar (MMLU, MTEB agregado, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: en fp16 el repositorio ocupa 1133 MB, por lo que se necesita algo más de 1,2 GB de memoria unificada para cargar los pesos, más el espacio de activaciones según el lote y la longitud de secuencia.
- Hardware objetivo: Apple Silicon (la evaluación se hizo en un Apple M5). No es compatible con CUDA ni con GPUs NVIDIA sin reconvertir los pesos.
- Cabe en cualquier Mac con chip Apple Silicon con suficiente memoria unificada; los builds de 8 bits (610 MB) y 6 bits (471 MB) reducen aún más el requisito.
- Despliegue: runtime MLX. El autor indica que otros cargadores de embeddings MLX no fueron probados; para llama.cpp existe el repo hermano GGUF. No se mencionan vLLM, TGI ni Ollama para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bge-m3-mlx-fp16 (este) | 566,7 M | 8192 | MLX safetensors | MIT | Hugging Face |
| BAAI/bge-m3 (original) | 568 M | 8192 | PyTorch safetensors | MIT | Hugging Face |
| bge-m3-mlx-8bit | no disponible | 8192 | MLX safetensors | MIT | Hugging Face |
| bge-m3-GGUF (mismo autor) | no disponible | 8192 | GGUF | MIT | Hugging Face |

Frente al original, este build sacrifica las cabezas sparse y ColBERT y gana portabilidad a Apple Silicon con una pérdida de fidelidad prácticamente nula en fp16. Frente a los builds cuantizados del mismo autor, fp16 es el más fiel (99,8 % de solapamiento top-10) a cambio de ocupar casi el doble que el de 8 bits.

## Limitaciones y advertencias

- Solo embeddings densos: no incluye las cabezas sparse ni ColBERT, por lo que no puede replicar la recuperación híbrida del BGE-M3 original.
- Dependencia de MLX y Apple Silicon: no es portable a CUDA sin reconversión; el autor no ha probado otros cargadores de embeddings MLX.
- Tokenizador distinto al de BAAI: el incluido no añade token para espacios finales, mientras que el de BAAI convierte un salto de línea final en un token extra antes de `</s>`. Hay que recortar los textos para que todas las implementaciones coincidan.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes engañosas en dominios muy alejados de los datos de entrenamiento del modelo base.
- Sesgos: heredados del corpus de entrenamiento de BGE-M3; no se documentan análisis de sesgo específicos en la información disponible.
- Idiomas: aunque el modelo base cubre más de 100 idiomas, esta ficha no incluye una lista verificada ni evaluaciones por idioma más allá de los cinco pares de traducción medidos.
- Licencia MIT, igual que el modelo base; el autor advierte de que el repositorio base declara MIT en metadatos pero no incluye fichero de licencia, y que este artefacto se distribuye "tal cual", sin garantías, y no es responsable de los outputs.
- Madurez: cero descargas y cero likes en el momento de la consulta; es un artefacto reciente y de nicho, sin validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/roman220220/bge-m3-mlx-fp16
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Build 8 bits: https://huggingface.co/roman220220/bge-m3-mlx-8bit
- Build 6 bits: https://huggingface.co/roman220220/bge-m3-mlx-6bit
- Build GGUF: https://huggingface.co/roman220220/bge-m3-GGUF
- Scripts y mediciones: https://github.com/rromenskyi/quant-ternary
- Runtime de embeddings de LLMTray: https://github.com/ipsupport-llc/llmtray/tree/main/runtime/llmtray_embed
- LLMTray: https://www.ipsupport.us/llmtray/
- IPSupport Code: https://ipsupport-llc.github.io/ipsupport-code/
- Dataset Tatoeba usado en la evaluación: https://huggingface.co/datasets/mteb/tatoeba-bitext-mining

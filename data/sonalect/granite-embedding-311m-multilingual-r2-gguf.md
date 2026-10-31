# sonalect/granite-embedding-311m-multilingual-r2-GGUF

## Resumen

Granite-embedding-311m-multilingual-r2-GGUF es una conversión a formato GGUF del modelo de embeddings multilingüe granite-embedding-311m-multilingual-r2 de IBM, publicada por el usuario sonalect en Hugging Face. El modelo original es un codificador de 311 millones de parámetros basado en la arquitectura ModernBERT que genera vectores de 768 dimensiones mediante pooling CLS, diseñado para tareas de extracción de características, similitud de frases y búsqueda semántica en más de 50 idiomas, entre ellos el castellano.

La relevancia de esta conversión radica en que permite ejecutar el modelo con llama.cpp, lo que facilita su despliegue en entornos sin GPU o con recursos limitados, así como su integración en pipelines RAG (Retrieval-Augmented Generation) ligeros. El repositorio incluye versiones en float16 (638 MB) y Q8_0 (346 MB), además de un archivo con el tokenizador aislado para operaciones de tokenización sin cargar los pesos. La conversión se ha validado comparando los embeddings generados con llama.cpp frente a la referencia en PyTorch de IBM sobre 181 textos, obteniendo similitudes coseno medias de 1.000000 (f16) y 0.99997 (Q8_0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (codificador bidireccional) |
| Parametros totales | 311.664.384 |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | float16 (f16), Q8_0 |
| Idiomas soportados | 51 idiomas: ar, az, bg, bn, ca, cs, da, de, el, en, es, et, fa, fi, fr, he, hi, hr, hu, id, is, it, ja, ka, kk, km, ko, lt, lv, mr, ms, nl, no, pl, pt, ro, ru, sk, sl, sq, sr, sv, sw, te, th, tl, tr, uk, ur, uz, vi, zh |
| Licencia | Apache 2.0 (pesos); tokenizador derivado del de Gemma 3, sujeto a los Gemma Terms of Use |
| Formato de pesos | GGUF (conversiones f16 y q8_0); el modelo original esta en safetensors |

## Arquitectura y entrenamiento

El modelo base es un codificador ModernBERT de 311 millones de parametros, una arquitectura transformer bidireccional optimizada para tareas de comprension de texto (a diferencia de los modelos decodificadores causales). Genera embeddings de 768 dimensiones utilizando pooling del token CLS, y los vectores deben normalizarse (L2) si se comparan mediante similitud coseno. El modelo esta entrenado principalmente sobre pasajes de hasta 512 tokens, que constituyen su limite de contexto operativo.

Sobre los datos y el proceso de entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF/DPO), la informacion disponible no ofrece detalles; debe consultarse la model card de IBM. En cuanto a la conversion GGUF, se realizo con el script `convert_hf_to_gguf.py` de llama.cpp (commit `d81235049384534c167caea52b85a694f6103d14`, de octubre de 2026) a partir de la revision `44399559930365213510b1ee2eb15ded83374f0e` del repositorio de IBM. La validacion se efectuo sobre 181 textos de hasta 512 tokens (articulos de Wikipedia en ruso, aleman e ingles sobre diez temas comunes, y parrafos que mezclan ruso e ingles), verificando ademas que el tokenizador integrado de llama.cpp produce los mismos identificadores de token que el tokenizador original. No se requiere ningun prefijo especial para consultas ni documentos.

## Capacidades

- Generacion de embeddings de 768 dimensiones para extraccion de caracteristicas y similitud de frases.
- Comprension semantica multilingue en 51 idiomas, incluido el castellano, adecuado para busqueda cross-lingue (consultas en un idioma contra documentos en otro).
- Codificacion de pasajes de hasta 512 tokens, adecuado para parrafos y fragmentos de documentos tipicos en sistemas RAG.
- Ejecucion mediante llama.cpp en CPU, con los binarios `llama-embedding` y `llama-server` (modo `--embedding`).
- Tokenizacion aislada mediante el archivo vocab-only, util para segmentar textos al limite de 512 tokens cuando el modelo se ejecuta en otro servicio.
- No soporta generacion de texto, razonamiento, codigo, vision ni audio: es exclusivamente un modelo de embeddings. No hay soporte de tool calling ni de agentes.

## Casos de uso

- Busqueda semantica en documentacion tecnica: se pueden indexar fragmentos de documentacion (hasta 512 tokens por chunk) y recuperar los mas relevantes para una consulta en lenguaje natural, aprovechando el soporte multilingue si la documentacion esta en varios idiomas.
- Sistemas RAG con LLM locales: como componente de recuperacion ligero que se ejecuta en CPU junto a un LLM servido con llama.cpp u Ollama, manteniendo todo el pipeline en la misma infraestructura.
- Busqueda cross-lingue: permitir que un usuario consulte en castellano y recupere documentos escritos en ingles, frances, aleman u otros idiomas soportados, gracias al espacio de embeddings compartido entre los 51 idiomas.
- Deteccion de duplicados y agrupacion de textos: calcular similitudes coseno entre embeddings de articulos, tickets o parrafos para identificar contenido duplicado o agrupar temas de forma no supervisada.
- Clasificacion de texto ligera: usar los embeddings como caracteristicas de entrada para clasificadores tradicionales (regresion logistica, SVM) en tareas de etiquetado de tickets, correos o comentarios.
- Recomendacion de contenido: representar articulos o productos como vectores y recomendar elementos similares por proximidad en el espacio de embeddings, con baja latencia al ejecutarse en CPU.
- Segmentacion de corpus para indexacion: emplear el archivo vocab-only con `vocab_only` para contar tokens y dividir documentos en chunks que respeten el limite de 512 tokens antes de enviarlos al servicio de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MTEB u otros) en la informacion disponible de esta conversion. Para metricas de calidad del modelo original, debe consultarse la model card de IBM. Los unicos datos de rendimiento publicados en este repositorio son de fidelidad de la conversion, no de calidad del modelo:

| Archivo | Similitud coseno minima frente a la referencia PyTorch | Media |
|---|---|---|
| f16 | 0.999999 | 1.000000 |
| q8_0 | 0.99993 | 0.99997 |

## Requisitos de hardware

- VRAM o memoria: al ser un modelo de 311M parametros, la version f16 ocupa unos 638 MB y la Q8_0 unos 346 MB; cabe con holgura en la memoria de cualquier GPU moderna o directamente en RAM de CPU.
- GPU recomendadas: no se requiere GPU; el propio autor valida la conversion ejecutandola en CPU. Si se desea acelerar, cualquier GPU con 2 GB de VRAM o mas (por ejemplo, una RTX 3060 o superior) es mas que suficiente.
- Consumer GPUs: cabe facilmente en cualquier GPU de consumo actual, incluidas las de gama de entrada.
- Despliegue: llama.cpp (binarios `llama-embedding` y `llama-server` con `--embedding --pooling cls`), y cualquier integracion que consuma GGUF mediante `llama-cpp-2` u otros bindings. No hay soporte nativo documentado para vLLM, TGI u Ollama en esta conversion.
- Latencia y throughput: no se han publicado mediciones; al tratarse de un codificador de 311M parametros en GGUF, se espera latencia baja incluso en CPU, pero no hay cifras concretas disponibles.
- Uso: ejecutar con `--pooling cls` y normalizar los vectores con `--embd-normalize 2` si se comparan por coseno. No se necesita prefijo de consulta ni de documento.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| granite-embedding-311m-multilingual-r2 (esta ficha) | 311M | 768 | 512 tokens | GGUF (f16, Q8_0) | Apache 2.0 (tokenizador sujeto a Gemma Terms of Use) |
| multilingual-e5-base | 278M | 768 | 512 tokens | safetensors | MIT |
| paraphrase-multilingual-mpnet-base-v2 | 278M | 768 | 128 tokens | safetensors | Apache 2.0 |
| bge-m3 | 568M | 1024 | 8192 tokens | safetensors, GGUF (comunidad) | MIT |

Frente a multilingual-e5-base, ofrece un tamano similar y el mismo limite de 512 tokens, pero con la ventaja del formato GGUF para llama.cpp; los modelos E5 requieren prefijos "query:"/"passage:", mientras que este modelo no necesita prefijos. Frente a bge-m3, pierde en longitud de contexto (512 frente a 8192 tokens) y en dimension, pero es aproximadamente la mitad de pesado y mas ligero de servir.

## Limitaciones y advertencias

- Limite estricto de 512 tokens por entrada: textos mas largos deben segmentarse; el propio repositorio ofrece el archivo vocab-only para ayudar a esa segmentacion.
- Es un modelo de embeddings, no generativo: no produce texto, no razona y no soporta tool calling ni agentes.
- El tokenizador deriva del de Gemma 3 y esta sujeto a los Gemma Terms of Use de Google, lo que introduce una restriccion adicional junto a la licencia Apache 2.0 de los pesos; conviene revisar esos terminos antes de uso comercial.
- La cuantizacion Q8_0 introduce una desviacion minima pero medible respecto a la referencia (coseno minimo 0.99993); para aplicaciones de maxima precision usar f16.
- Riesgo de alucinacion: no aplicable al no generar texto, aunque embeddings de baja calidad en idiomas o dominios poco representados pueden degradar la recuperacion en sistemas RAG.
- Los datos de entrenamiento del modelo original (composicion, volumen de tokens, posibles sesgos) no estan detallados en la informacion disponible; para una evaluacion de sesgos debe consultarse la documentacion de IBM.
- No hay benchmarks publicados (por ejemplo, MTEB) en la informacion de esta conversion, por lo que la calidad relativa frente a otros embedders debe verificarse de forma empirica en el dominio de uso.
- El modelo requiere pooling CLS y normalizacion L2; usarlo con otro esquema de pooling degradara los resultados.

## Enlaces

- Repositorio de la conversion GGUF: https://huggingface.co/sonalect/granite-embedding-311m-multilingual-r2-GGUF
- Modelo original de IBM: https://huggingface.co/ibm-granite/granite-embedding-311m-multilingual-r2
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit del conversor usado: https://github.com/ggml-org/llama.cpp/commit/d81235049384534c167caea52b85a694f6103d14
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Gemma Terms of Use: https://ai.google.dev/gemma/terms

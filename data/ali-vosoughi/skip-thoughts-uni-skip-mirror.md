# ali-vosoughi/skip-thoughts-uni-skip-mirror

# Skip-Thought Vectors uni-skip (mirror de ali-vosoughi)

## Resumen

Este repositorio no es un modelo nuevo ni un entrenamiento propio: es un espejo (mirror) sin modificar de tres ficheros del lanzamiento original de Skip-Thought Vectors publicado por Ryan Kiros y coautores en 2015 (`arxiv:1506.06726`). Lo mantiene el usuario `ali-vosoughi` para suplir que la ubicación original de descarga (`http://www.cs.toronto.edu/~rkiros/models/`) ya no sirve los ficheros, y porque varios proyectos de Visual Question Answering (VQA) siguen dependiendo de ellos.

El contenido corresponde al modelo *uni-skip*, es decir, la variante de un solo codificador de Skip-Thought Vectors: un codificador de frases de propósito general que transforma una oración en un vector denso. Los tres artefactos redistribuidos son el vocabulario (`dictionary.txt`, 7.996.547 bytes), la tabla de embeddings de palabras (`utable.npy`, 2.342.138.474 bytes) y los pesos del codificador uni-skip (`uni_skip.npz`, 663.989.216 bytes). No se incluyen los ficheros *bi-skip* (`btable.npy`, `bi_skip.npz`) ni los ficheros de opciones `.pkl`.

Su relevancia actual es fundamentalmente de reproducibilidad y archivado: permite volver a ejecutar código de investigación (por ejemplo `skip-thoughts.torch` y proyectos derivados como RUBi, CF-VQA y PW-VQA) que de otro modo no podría descargar los pesos originales. El repositorio ocupa 3,0 GB en total y no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador de frases recurrente de tipo encoder-decoder (GRU, según el paper *Skip-Thought Vectors*, `arXiv:1506.06726`) |
| Parámetros totales | no disponible (no publicado en la información proporcionada; el repo pesa 3,0 GB) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (procesa oraciones; no se documenta un límite explícito) |
| Tipos de cuantización | no disponible (pesos en formato NumPy, sin versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | NumPy: `.txt` (vocabulario), `.npy` (tabla de embeddings, pickle NumPy de Python 2) y `.npz` (pesos del codificador) |

## Arquitectura y entrenamiento

El modelo original *uni-skip* forma parte de la familia Skip-Thought Vectors descrita por Kiros et al. (2015). Se trata de un esquema encoder-decoder recurrente entrenado de forma no supervisada para reconstruir las oraciones contiguas (anterior y posterior) a una oración dada; la representación útil es el estado oculto del codificador, que actúa como embedding de la oración completa. La variante *uni-skip* utiliza un único codificador; la variante *bi-skip* (no incluida en este espejo) añade un segundo codificador bidireccional. No se dispone en la información proporcionada de detalles sobre el recuento exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación (RLHF/DPO).

Sobre el entrenamiento solo puede afirmarse que estos ficheros proceden del lanzamiento oficial de los autores; este repositorio no documenta el proceso de entrenamiento, sino únicamente la redistribución de los artefactos. Un detalle técnico relevante es que `utable.npy` es un array de objetos NumPy serializado con pickle en Python 2, por lo que debe cargarse con `numpy.load(path, allow_pickle=True, encoding="latin1")`, y solo si se confía en la fuente (los ficheros pickle pueden ejecutar código arbitrario). El autor facilita además los valores SHA-256 de los tres ficheros para verificar su integridad tras la descarga.

## Capacidades

- Generación de *embeddings* de oraciones (codificación de texto a vectores densos) en inglés.
- Codificación de palabras mediante la tabla de embeddings (`utable.npy`).
- Extracción de características para tareas posteriores (clasificación, similitud semántica, regresión) sobre representaciones de frase.
- Uso como componente de *feature extraction* en pipelines de investigación, en particular de VQA.
- No es un modelo generativo de texto: no produce texto libre, ni mantiene conversación multi-turno.
- No soporta *tool calling* / *function calling*, ni comportamiento de agente, ni razonamiento multi-paso.
- No dispone de modo *thinking*, visión ni audio.
- Capacidad multilingüe: no; el único idioma soportado es el inglés (`en`).

## Casos de uso

- Reproducción de investigación en VQA: restaurar los pesos uni-skip que esperan `skip-thoughts.torch`, RUBi, CF-VQA y PW-VQA, permitiendo volver a ejecutar experimentos cuyos ficheros originales ya no están accesibles.
- Extracción de características de texto en pipelines multimodales: usar los embeddings de frase como entrada de un modelo de VQA que combine texto e imagen.
- Similitud semántica entre oraciones: calcular distancias (coseno, euclídea) entre embeddings para agrupar o recuperar frases afines en inglés.
- Clasificación de texto con pocos datos: emplear los embeddings congelados como entrada de un clasificador ligero (regresión logística, SVM) para tareas de NLP en inglés.
- Mantenimiento de código legado: servir de fuente estable para repositorios antiguos que referencian rutas de descarga caídas y necesitan los mismos ficheros byte a byte (verificables por SHA-256).
- Archivado y preservación: conservar los artefactos originales de 2015 para garantizar reproducibilidad a largo plazo de publicaciones que los citan.
- Verificación de integridad de artefactos: usar los hashes documentados para comprobar que una copia local coincide con la distribución original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este espejo no incluye métricas (MMLU, HumanEval, GSM8K, STS u otras) ni comparaciones numéricas; el repositorio se limita a redistribuir los ficheros del lanzamiento original.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,0 GB en total para cargar los pesos en `float32` (tabla de embeddings `utable.npy` ≈ 2,34 GB más pesos del codificador `uni_skip.npz` ≈ 0,66 GB), más el vocabulario de texto.
- CPU: el modelo es lo bastante pequeño para ejecutarse íntegramente en CPU, sin GPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; cabe en tarjetas de consumo como GTX 1060 (6 GB), RTX 3060, RTX 4090, etc.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU modernas de consumo.
- Opciones de despliegue: carga en PyTorch a través de `skip-thoughts.torch` (u otro código compatible con los formatos `.npz`/`.npy`); no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje con pesos safetensors/GGUF.
- Latencia y throughput estimados: no disponible (no se documentan cifras de rendimiento).

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos numéricos para comparar con alternativas. A continuación se indican codificadores de frases de la misma categoría (embeddings de oración en inglés), con los campos que no constan marcados como "no disponible":

| Modelo | Tipo | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| Skip-Thought Vectors uni-skip (este espejo) | Codificador recurrente (GRU), 2015 | en | apache-2.0 | Ficheros redistribuidos sin modificar; formatos NumPy |
| InferSent (Facebook, 2017) | Codificador supervisado sobre GloVe | en | no disponible | Alternativa de la misma época; datos no disponibles |
| Universal Sentence Encoder (Google) | Codificador de frases | en (y multilingüe en variantes) | no disponible | Datos no disponibles |
| Sentence-BERT (SBERT) | Transformer bi-encoder | multilingüe según variante | no disponible | Datos no disponibles |

Comparativa de rendimiento entre estos modelos: no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni conversa; solo codifica frases en vectores.
- Idioma limitado al inglés; el rendimiento en otros idiomas no está soportado.
- Riesgo de sesgos heredados del corpus de entrenamiento original; este espejo no documenta mitigación alguna.
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto), pero los embeddings pueden no representar adecuadamente frases fuera de dominio.
- Seguridad de carga: `utable.npy` es un pickle de Python 2; cargarlo con `allow_pickle=True` puede ejecutar código arbitrario, por lo que solo debe hacerse con ficheros de confianza y verificando antes el SHA-256.
- Compatibilidad: requiere `encoding="latin1"` al cargar en Python 3; el código original está pensado para Python 2.
- Licencia: Apache 2.0, que en principio permite uso comercial, pero la autoría intelectual es de Kiros et al.; cualquier uso debe citar el paper original y a sus autores.
- Este repositorio no ofrece garantías de mantenimiento ni de disponibilidad a largo plazo; su continuidad depende de su autor.
- Solo contiene los ficheros *uni-skip*; los artefactos *bi-skip* y los `.pkl` no están incluidos.
- No hay resultados de benchmarks publicados en la información disponible, por lo que no puede evaluarse su calidad frente a alternativas modernas solo con estos datos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ali-vosoughi/skip-thoughts-uni-skip-mirror
- Proyecto original Skip-Thoughts (Ryan Kiros): https://github.com/ryankiros/skip-thoughts
- Ubicación original de descarga (ya no operativa): http://www.cs.toronto.edu/~rkiros/models/
- Paper Skip-Thought Vectors: https://arxiv.org/abs/1506.06726
- `skip-thoughts.torch` (implementación PyTorch que consume estos ficheros): https://github.com/Cadene/skip-thoughts.torch
- PW-VQA (proyecto con el que se mantiene el espejo): https://github.com/ali-vosoughi/PW-VQA
- Paper de PW-VQA (Vosoughi et al., 2024, IEEE TMM): https://doi.org/10.1109/TMM.2024.3380259
- Licencia Apache 2.0: http://www.apache.org/licenses/LICENSE-2.0

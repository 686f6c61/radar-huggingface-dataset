# mariklolik/AraToken

## Resumen
AraToken es una familia de tokenizadores para árabe publicada por mariklolik (Mark Kashirskiy, Artiom Lipinski e Ilya Makarov) junto al artículo «AraToken: Optimizing Arabic Tokenization with Normalization Pipeline and Language Extension for Qwen3» (arXiv:2512.18399). No es un modelo generativo: es un conjunto de vocabularios y pipelines de normalización diseñados para reducir la fertility (número medio de tokens por palabra) del árabe, un idioma con morfología rica y variantes ortográficas del alef que penalizan seriamente la eficiencia de los tokenizadores genéricos.

El repositorio incluye variantes SentencePiece Unigram de 150.000 tokens (con y sin byte fallback), versiones podadas al 99% y 95% de cobertura del corpus, una rejilla comparativa de algoritmos (BPE, WordPiece, SentencePiece) con y sin normalización a 80.000 tokens, y tokenizadores extendidos que parten del vocabulario de Qwen3 y le añaden 131.157 piezas de AraToken (282.826 tokens en total) para inyectar vocabulario árabe mediante extension de lenguaje (LEP).

Su relevancia práctica es directa: el tokenizador por defecto de Qwen3 tiene una fertility de 2.179 y el de AraBERT de 1.833, mientras que AraToken alcanza 1.212 en el conjunto de test del artículo. Menos tokens por palabra implica menor coste de inferencia, menor presión sobre la ventana de contexto efectiva y mejor aprovechamiento del entrenamiento en árabe. El código y el pipeline de normalización se distribuyen en GitHub, y la licencia Apache 2.0 permite uso comercial.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | SentencePiece Unigram (variantes BPE y WordPiece en la rejilla comparativa a 80K); tokenizadores extendidos sobre el vocabulario de Qwen3 |
| Parametros totales | no aplica (tokenizador, no es una red neuronal); vocabulario de 60.149 a 282.826 piezas segun variante |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (no aplica a un tokenizador) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | modelos SentencePiece en la carpeta sentencepiece/ y tokenizadores cargables con transformers (AutoTokenizer); detalle exacto de ficheros no disponible |

Variantes incluidas en el repositorio:

| Carpeta | Contenido | Vocabulario | Fertility en test (menor es mejor) |
|---|---|---|---|
| sentencepiece/fw2hq_sp_alif_preserve | AraToken, Unigram, variantes de alef conservadas (por defecto) | 150.000 | 1,212 |
| sentencepiece/fw2hq_sp_alif_preserve_bf | Igual, con byte fallback | 150.000 | 1,215 |
| sentencepiece/fw2hq_sp_alif_preserve_0_99 | Podado al 99% de cobertura del corpus | 109.844 | 1,227 |
| sentencepiece/fw2hq_sp_alif_preserve_0_95 | Podado al 95% de cobertura del corpus | 60.149 | 1,281 |
| sentencepiece/fw2hq_sp_alif_unified* | Unificacion de alef activada (150K, 99%, 95%) | no disponible | no disponible |
| sentencepiece/fw2hq_{bpe,wp,sp}_{drop,keep}[_norm] | Rejilla algoritmo x preprocesado a 80K | 80.000 | no disponible |
| extended/fw2hq-alif-preserve-150k | Tokenizador Qwen3 + 131.157 piezas de AraToken, usado por LEP | 282.826 | 1,307 |
| extended/fw2hq-alif-unified-150k | Igual, con unificacion de alef | 281.798 | 1,301 |

## Arquitectura y entrenamiento
El componente central es un tokenizador SentencePiece con modelo Unigram entrenado sobre el corpus mariklolik/AraToken-FineWeb2-HQ-ar (derivado de FineWeb2 en su subconjunto de alta calidad en árabe). El trabajo combina dos piezas: un pipeline de normalización específico para árabe (implementado como `aratoken.normalizer.paper_normalizer` en el repositorio de código) y una decision explicita sobre el tratamiento del alef, con dos politicas: conservar las variantes ortograficas del alef (alif_preserve) o unificarlas (alif_unified). La variante por defecto, con conservacion de variantes, es la que obtiene la mejor fertility (1,212).

El articulo no describe en la informacion disponible el numero de tokens de entrenamiento del tokenizador ni si hubo fases de RLHF o DPO (no aplican a un tokenizador). La innovacion destacable es el mecanismo LEP (Language Extension for Qwen3): en lugar de reentrenar el vocabulario desde cero, se parte del tokenizador de Qwen3 y se le anaden 131.157 piezas de AraToken, lo que eleva el vocabulario a 282.826 tokens y baja la fertility desde 2,179 hasta 1,307 sin destruir el vocabulario original en otros idiomas. Una diferencia operativa importante: los modelos SentencePiece esperan texto ya normalizado, mientras que los tokenizadores extendidos normalizan internamente.

## Capacidades
- Segmentacion de texto arabe en subpalabras con fertility de 1,212 en la variante por defecto (frente a 2,179 de Qwen3 y 1,833 de AraBERT en el mismo conjunto de test).
- Normalizacion de texto arabe integrada en el pipeline (forma norm vs. sin normalizar en la rejilla de 80K).
- Dos politicas ortograficas configurables: conservacion o unificacion de las variantes del alef.
- Variante con byte fallback para evitar tokens desconocidos ante caracteres fuera del vocabulario.
- Variantes podadas a 99% y 95% de cobertura para reducir el tamano de embedding en modelos con presupuesto ajustado.
- Tokenizadores extendidos compatibles con el ecosistema Qwen3 (vocabulario de 282.826/281.798 piezas), pensados para su uso en el pipeline LEP.
- Carga directa con `AutoTokenizer` de transformers mediante el parametro `subfolder`.
- No ofrece generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente: es exclusivamente un componente de tokenizacion.

## Casos de uso
- Reduccion del coste de inferencia en arabe: sustituir el tokenizador de un modelo arabe por AraToken reduce el numero de tokens por palabra de ~2,18 a ~1,21, lo que se traduce en menos tokens de entrada y salida facturados y menor latencia de decodificacion.
- Ampliacion efectiva de la ventana de contexto: al comprimir la representacion del texto arabe, caben mas palabras reales en la misma longitud de contexto del modelo, algo critico en resumen de documentos largos o analisis de contratos.
- Adaptacion de Qwen3 al arabe mediante LEP: usar `extended/fw2hq-alif-preserve-150k` para ampliar el vocabulario de Qwen3 con 131.157 piezas arabes y despues hacer continued pretraining, en lugar de reentrenar el tokenizador completo.
- Preprocesado de corpus arabes para entrenamiento: aplicar el `paper_normalizer` y la segmentacion de AraToken antes de tokenizar grandes volumenes de FineWeb2 u otras fuentes, reduciendo el numero total de tokens del dataset.
- Entrenamiento de modelos arabes compactos: la variante podada a 60.149 piezas reduce el tamano de la matriz de embeddings, util para modelos pequenos que deben caber en GPUs de consumo.
- Sistemas de busqueda y recuperacion (RAG) en arabe: la coherencia ortografica que impone la normalizacion y la politica de alef mejora el emparejamiento entre consultas y documentos con variantes ortograficas distintas.
- Analisis de redes sociales y contenido generado por usuarios: la variante con byte fallback evita tokens desconocidos ante ruido, dialectalismos o emojis mezclados con texto arabe.
- Evaluacion comparativa de tokenizadores: la rejilla de 80K (BPE, WordPiece, SentencePiece x drop/keep x con/sin normalizacion) sirve como banco de pruebas reproducible para decidir el tokenizador de un proyecto.

## Benchmarks y rendimiento
Los unicos resultados publicados en la informacion disponible son medidas de fertility (tokens por palabra, menor es mejor) en el conjunto de test del articulo. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.), que ademas no aplican a un tokenizador.

| Tokenizador | Vocabulario | Fertility en test |
|---|---|---|
| AraToken (fw2hq_sp_alif_preserve) | 150.000 | 1,212 |
| AraToken con byte fallback | 150.000 | 1,215 |
| AraToken podado 99% | 109.844 | 1,227 |
| AraToken podado 95% | 60.149 | 1,281 |
| AraToken extendido (alif unified, LEP) | 281.798 | 1,301 |
| AraToken extendido (alif preserve, LEP) | 282.826 | 1,307 |
| AraBERT | no disponible | 1,833 |
| Qwen3 | no disponible | 2,179 |

## Requisitos de hardware
- Inferencia en CPU: un tokenizador SentencePiece es un componente ligero que se ejecuta en CPU con consumo de memoria del orden de decenas o pocos cientos de MB, dependiendo del vocabulario (de 60.149 a 282.826 piezas).
- GPU: no requiere GPU. Cualquier GPU, incluida una integrada, es suficiente si se desea acelerar el preprocesado por lotes.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y en equipos sin GPU dedicada, ya que no hay pesos neuronales que cargar.
- Tamano del repositorio: 0,1 GB, segun los metadatos de HuggingFace.
- Opciones de despliegue: carga directa con `transformers` (`AutoTokenizer.from_pretrained("mariklolik/AraToken", subfolder="...")`), uso nativo de SentencePiece y el pipeline de normalizacion del repositorio de GitHub. No aplican vLLM, llama.cpp, Ollama ni TGI, que sirven modelos generativos, no tokenizadores aislados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
Comparativa con los tokenizadores de referencia citados en el articulo:

| Tokenizador | Tipo | Vocabulario | Fertility en test | Licencia |
|---|---|---|---|---|
| AraToken (variante por defecto) | SentencePiece Unigram + normalizacion arabe | 150.000 | 1,212 | Apache 2.0 |
| AraToken extendido (LEP) | Vocabulario Qwen3 + 131.157 piezas arabes | 282.826 | 1,307 | Apache 2.0 |
| Tokenizador de Qwen3 | BPE (tokenizador del modelo) | no disponible | 2,179 | Apache 2.0 |
| Tokenizador de AraBERT | WordPiece/vocabulario especifico | no disponible | 1,833 | no disponible |

La ventaja de AraToken es la fertility mas baja de la comparativa; su limitacion es que no incorpora ningun modelo entrenado, por lo que hay que emparejarlo con una arquitectura y realizar el entrenamiento correspondiente.

## Limitaciones y advertencias
- No es un modelo de lenguaje: no genera texto, no razona, no hace codigo ni matematicas y no soporta tool calling ni agentes. Cualquier uso de ese tipo requiere emparejarlo con un modelo entrenado.
- La fertility reportada se mide en un conjunto de test que la informacion disponible no describe (composicion, dominio ni tamano), por lo que las cifras no son directamente extrapolables a otros corpus.
- Los tokenizadores SentencePiece de la carpeta `sentencepiece/` esperan texto ya normalizado; si se les pasa texto sin normalizar, la fertility empeorara respecto a la publicada. Los extendidos normalizan internamente.
- La eleccion entre conservar y unificar las variantes del alef es irreversible en la practica: condiciona como el modelo vera el texto y afecta a la coherencia ortografica. La variante conservada obtiene mejor fertility (1,212 frente a los valores de las unificadas, que la informacion no detalla).
- Cobertura limitada al arabe (codigo de idioma `ar`). El vocabulario extendido parte de Qwen3 y conserva sus piezas originales, pero no hay datos publicados sobre el impacto de la extension en el rendimiento en otros idiomas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad mas alla del articulo.
- Aunque la licencia del repositorio es Apache 2.0, la informacion no detalla las condiciones de los pesos ni del corpus FineWeb2 utilizado para entrenar; conviene revisar las licencias de las fuentes antes de un uso comercial en produccion.
- La fecha de creacion registrada en HuggingFace (2026-09-23) es incoherente con el ano de publicacion del articulo (2025); conviene verificar la version real del repositorio antes de integrarlo.
- Los tokenizadores extendidos elevan el vocabulario a mas de 280.000 piezas, lo que incrementa el tamano de la matriz de embeddings del modelo que los use y puede exigir ajustes de memoria.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/mariklolik/AraToken
- Articulo: https://arxiv.org/abs/2512.18399
- Codigo: https://github.com/mariklolik/Aratoken
- Dataset: https://huggingface.co/datasets/mariklolik/AraToken-FineWeb2-HQ-ar

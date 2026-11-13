# lakafiorr/midden-models

## Resumen

Midden models es un repositorio de conversiones a Core ML de dos modelos orientados a busqueda semantica, publicado por el usuario lakafiorr para la aplicacion Midden. El paquete contiene una version convertida de EmbeddingGemma 300M (modelo de embeddings de Google) y del reranker multilingue GTE base de Alibaba-NLP, ambos empaquetados en formato `model.mlpackage` con pesos cuantizados a 8 bits y computo en media precision. El objetivo es ejecutar busqueda por significado en local sobre CPU mediante Core ML, sin depender de runtimes de terceros.

La relevancia del repositorio es practica mas que de investigacion: demuestra como llevar dos piezas de un pipeline RAG (retrieval denso y reranking) a un formato nativo de Apple que se ejecuta en el dispositivo. El autor documenta que la conversion de EmbeddingGemma fusiona las dos capas densas en una y reduce el flujo residual 32 veces para que quepa en media precision, manteniendo una similitud coseno de 0,998 frente al original en 36 textos de prueba en polaco e ingles.

No se trata de un modelo nuevo ni de pesos entrenados por el autor: son artefactos derivados sujetos a las licencias de los modelos originales (Gemma Terms of Use para EmbeddingGemma y Apache 2.0 para el reranker). El repositorio no incluye informacion sobre el pipeline, los idiomas soportados ni resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (EmbeddingGemma 300M) y transformer encoder para reranking (GTE multilingual base); ambos convertidos a Core ML |
| Parametros totales | 300M en EmbeddingGemma (el reranker GTE base no especifica cifra en la informacion disponible) |
| Parametros activos | No aplica (no son modelos MoE) |
| Longitud de contexto | Hasta 512 tokens por entrada (limite de los `mlpackage`) |
| Tipos de cuantizacion | Pesos en 8 bits, lineal, en bloques de 32; computo en media precision (FP16) |
| Idiomas soportados | No disponible de forma oficial; el autor valida con textos en polaco e ingles, y el reranker original es multilingue |
| Licencia | Mixta: Gemma Terms of Use (EmbeddingGemma) y Apache 2.0 (gte-multilingual-reranker-base) |
| Formato de pesos | `model.mlpackage` (Core ML) y `tokenizer.json` original |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: contiene conversiones de dos modelos preexistentes. EmbeddingGemma 300M es un modelo de embeddings de Google basado en la familia Gemma, disenado para producir representaciones densas de textos; el autor indica que en la conversion multiplica sus dos capas densas en una sola y reduce el flujo residual 32 veces para que quepa en media precision, sin alterar el resultado (coseno minimo de 0,998 frente al original en 36 textos en polaco e ingles). El segundo artefacto es gte-multilingual-reranker-base de Alibaba-NLP, un reranker que puntua pares consulta-documento.

Ambos `mlpackage` aceptan `input_ids` y `attention_mask`, con batch de hasta 16 y longitud de hasta 512 tokens. El reranker devuelve un logit por fila con el formato `<s> query </s></s> document </s>`. No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO); esos detalles corresponden a las model cards de los modelos originales, no a este repositorio.

## Capacidades

- Generacion de embeddings densos de texto para busqueda semantica (EmbeddingGemma 300M).
- Reranking de pares consulta-documento mediante puntuaciones logit (GTE multilingual reranker).
- Prefijos especificos para consultas (`task: search result | query: `) y documentos (`title: none | text: `) en el modelo de embeddings.
- Ejecucion en CPU a traves de Core ML, sin runtime de terceros.
- Procesamiento por lotes de hasta 16 entradas y secuencias de hasta 512 tokens.
- Soporte multilingue heredado de los modelos originales (validado por el autor en polaco e ingles).
- No incluye generacion de texto, tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Busqueda semantica en aplicaciones macOS/iOS: integrar el `mlpackage` de EmbeddingGemma para indexar y recuperar documentos por significado en local, sin enviar datos a servidores.
- Pipeline RAG en el dispositivo: usar el modelo de embeddings para la recuperacion inicial y el reranker GTE para reordenar los candidatos antes de pasarlos a un LLM local.
- Asistentes de notas personales: indexar apuntes y correos del usuario y responder consultas en lenguaje natural con recuperacion previa, aprovechando el procesamiento por lotes de hasta 16 elementos.
- Busqueda multilingue en bases documentales: emplear el reranker multilingue para ordenar resultados de consultas en distintos idiomas sobre un mismo corpus.
- Clasificacion y agrupamiento de textos: generar embeddings para clustering, deduplicacion o deteccion de temas recurrentes en tickets de soporte.
- Filtrado de resultados en aplicaciones de escritorio: el reranker permite descartar candidatos irrelevantes con una pasada de bajo coste sobre CPU antes de mostrar resultados.
- Prototipado rapido en entornos Apple: al estar en Core ML, se puede desplegar en Xcode y ejecutar en dispositivos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de calidad aportado por el autor es una similitud coseno minima de 0,998 frente al modelo original de EmbeddingGemma en 36 textos de prueba en polaco e ingles, y la afirmacion de que el reranker ordena los pasajes de referencia igual que el original.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU mediante Core ML.
- Tamano del repositorio: 0,7 GB, compatible con almacenamiento en dispositivos Apple.
- GPU recomendadas: no se requiere GPU; el autor indica ejecucion en CPU. No hay datos sobre aceleracion con Neural Engine o GPU en la informacion disponible.
- Cabe en hardware de consumo: si, al estar disenado para ejecutarse en CPU de equipos Apple.
- Opciones de despliegue: Core ML (formato `model.mlpackage`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son compatibles con este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Midden models (este repo) | 300M (embeddings) + reranker base | 512 tokens | Core ML (`mlpackage`) | Mixta: Gemma Terms + Apache 2.0 | Hugging Face |
| google/embeddinggemma-300m | 300M | No disponible en esta ficha | Safetensors (original) | Gemma Terms of Use | Hugging Face |
| Alibaba-NLP/gte-multilingual-reranker-base | No disponible | No disponible en esta ficha | Safetensors (original) | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos de origen, ya que la informacion disponible no incluye datos de rendimiento ni especificaciones detalladas de alternativas adicionales.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: son conversiones cuantizadas; los pesos fueron modificados (convertidos y cuantizados), lo que puede introducir pequenas diferencias frente al original.
- La salida `embedding` no esta normalizada; es necesario dividir por su longitud antes de calcular similitudes.
- Limite de 512 tokens por entrada y batch maximo de 16, lo que restringe documentos largos.
- Solo funciona en el ecosistema Apple (Core ML); no es portable a otros runtimes sin reconversion.
- Licencia mixta: el uso de EmbeddingGemma queda sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, que se transmiten a cualquiera que use estos archivos; el reranker es Apache 2.0.
- No hay informacion sobre sesgos, riesgo de alucinacion (no genera texto) ni idiomas oficialmente soportados.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni validacion externa conocida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lakafiorr/midden-models
- Modelo original de embeddings: https://huggingface.co/google/embeddinggemma-300m
- Modelo original del reranker: https://huggingface.co/Alibaba-NLP/gte-multilingual-reranker-base
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy

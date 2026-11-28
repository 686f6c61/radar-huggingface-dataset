# netprojects/Nemotron-3.5-Rerank-8B-mlx-4bit

## Resumen

Nemotron-3.5-Rerank-8B-MLX-4bit es una conversion a formato MLX del modelo de reranking multimodal NVIDIA Nemotron-3.5-Rerank-8B, realizada por NetProjects para su ejecucion en Apple Silicon. El modelo original, desarrollado por NVIDIA, resuelve el problema del reordenamiento (reranking) de resultados de recuperacion: recibe una consulta y un documento (texto, imagen de pagina o ambos) y devuelve un logit de relevancia. Esta build concreta no es un modelo nuevo, sino una cuantizacion a 4 bits de la torre de lenguaje del modelo BF16 original, manteniendo el encoder de vision, el proyector y la cabeza de puntuacion en sus precisiones originales.

La relevancia de esta ficha radica en que permite ejecutar un reranker de 8.381 millones de parametros con capacidades multimodales en hardware de consumo Apple (procesadores M-series), con un tamano en disco de 5,0 GB y un pico de memoria medido de 5,05 GB para entradas de 513 tokens. El modelo base esta construido sobre mistralai/Ministral-3-8B-Instruct-2512-BF16 (Apache-2.0) y se distribuye bajo la licencia OpenMDW 1.1.

La ventana de contexto alcanza los 32.768 tokens, lo que permite puntuar documentos largos o paginas completas representadas como imagen. El modelo solo declara soporte para ingles. Es importante subrayar que se trata de un artefacto de inferencia (reranker), no de un modelo generativo: no produce texto libre, sino puntuaciones de relevancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de lenguaje tipo Mistral/Ministral + encoder de vision + proyector + cabeza de puntuacion); pesos en formato MLX |
| Parametros totales | 8.381.155.328 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 4-bit affine, group size 64 (solo torre de lenguaje); vision encoder y proyector en bf16; norms, score head y mean pooling en float32 |
| Idiomas soportados | Ingles (en) |
| Licencia | OpenMDW License Agreement 1.1 (openmdw-1.1); modelo base construido sobre Ministral-3-8B-Instruct-2512-BF16 (Apache-2.0) |
| Formato de pesos | safetensors (MLX), repo de 5,3 GB, build de 5,0 GB |

## Arquitectura y entrenamiento

El modelo es un reranker multimodal construido sobre una arquitectura transformer con una torre de lenguaje derivada de Ministral-3-8B-Instruct y un encoder de vision con su proyector correspondiente. La funcion de puntuacion combina mean pooling en float32 y una cabeza de score tambien en float32, lo que preserva la estabilidad numerica de la salida. La entrada sigue la plantilla de chat de NVIDIA con roles `query` y `document`, admite hasta una imagen por documento y un maximo de 32.768 tokens.

Esta build concreta aplica cuantizacion affine de 4 bits con group size 64 exclusivamente a la torre de lenguaje, dejando el encoder de vision, el proyector, las normas, la cabeza de score y el mean pooling en bf16 o float32 segun el caso. La conversion se realizo desde la revision upstream `f88f8d9104726747791283ab156d2fcdb29e90a7` del modelo BF16 de NVIDIA. No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni sobre si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Reranking de pares consulta-documento devolviendo un logit de relevancia.
- Soporte de documentos en texto plano.
- Soporte de documentos como imagen de pagina (path, bytes, PIL image o data URL).
- Soporte de documentos multimodales que combinan texto e imagen (por ejemplo, una figura con su pie de texto).
- Procesamiento de documentos largos de mas de 4.000 tokens y hasta 32.768 tokens.
- Tokenizacion identica a la del modelo original de NVIDIA en todas las entradas probadas.
- Servidor local con endpoints estilo OpenAI (`/v1/embeddings`) y estilo Cohere/Jina (`/v1/rerank`), con imagenes en data URLs o base64.
- No es un modelo generativo: no produce texto, solo puntuaciones de ranking.

## Casos de uso

- Reordenamiento en pipelines RAG: el modelo se situa tras un recuperador denso o BM25 para reordenar los candidatos por relevancia real, aprovechando su ventana de 32.768 tokens para documentos largos.
- Busqueda sobre documentacion tecnica con figuras: al aceptar imagenes de pagina, permite puntuar paginas completas de manuales o papers sin necesidad de OCR previo.
- Atencion al cliente sobre base de conocimiento: reordena articulos de ayuda y respuestas de FAQ antes de pasarlos a un LLM generador, reduciendo el contexto irrelevante.
- Busqueda academica multimodal: puntua abstracts y paginas de articulos cientificos (incluidas tablas y figuras) frente a una consulta de investigacion.
- Verificacion de evidencia en pipelines de agentes: dado un conjunto de fragmentos recuperados, selecciona los mas relevantes para fundamentar una respuesta o una decision multi-paso.
- Despliegue local en estaciones de trabajo Apple Silicon: prototipado y evaluacion de sistemas de recuperacion sin GPU dedicada, con un pico de memoria medido de 5,05 GB para entradas cortas.
- Filtrado de resultados en buscadores internos: descarta documentos poco relevantes antes de la fase de generacion, mejorando la precision del contexto enviado al modelo final.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de esta build frente al codigo de referencia de NVIDIA en float32, no benchmarks publicos estandar (MMLU, HumanEval, etc.).

| Test | Pares | Spearman | Mismo documento top | Diferencia maxima de score |
|---|---|---|---|---|
| SciFact (consultas x abstracts) | 400 | 0,9920 | 37/40 | 0,096 |
| Documentos largos (4K+ tokens) y paginas de imagen | 120 (14 largos, 31 imagen) | 0,9975 | 9/10 | 0,487 |

Rendimiento en texto (pares por segundo, con otros servidores de modelo detenidos):

| Tokens por entrada | Batch | Pares/s | Tokens/s | Memoria pico |
|---|---|---|---|---|
| 513 | 1 | 5,86 | 3.007 | 5,05 GB |
| 513 | 16 | 5,17 | 2.652 | 5,77 GB |
| 513 | 64 | 5,23 | 2.681 | 8,64 GB |
| 4.097 | 1 | 0,58 | 2.378 | 5,46 GB |
| 4.097 | 16 | 0,58 | 2.365 | 12,8 GB |
| 4.097 | 64 | 0,57 | 2.346 | 37,77 GB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 5,05 GB de pico para entradas de 513 tokens con batch 1; 5,46 GB para 4.097 tokens con batch 1; hasta 37,77 GB con batch 64 y entradas largas.
- Hardware objetivo: Apple Silicon (procesadores M-series). La build y las pruebas se realizaron en un Apple M5 Max con 128 GB de memoria unificada.
- No esta pensado para GPU NVIDIA/AMD: el formato MLX es especifico de Apple Silicon.
- Cabe en equipos Apple con al menos 8 GB de memoria unificada para entradas cortas, y requiere mas memoria para lotes grandes o documentos largos.
- Opciones de despliegue: paquete `nemotron-retrieval-mlx` (instalable desde GitHub), con servidor local integrado (`python -m nemotron_mlx.server`) que expone endpoints estilo OpenAI y Cohere/Jina.
- Throughput medido: aproximadamente 5,2-5,9 pares/s con entradas de 513 tokens y 0,57-0,58 pares/s con entradas de 4.097 tokens, con un throughput de tokens estable en torno a 2.350-3.000 tokens/s.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos alternativos de reranking (por ejemplo, bge-reranker, Cohere Rerank o Jina Reranker) que permitan una comparacion cuantitativa rigurosa. A continuacion se comparan unicamente aspectos estructurales conocidos del propio modelo y su origen.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/Nemotron-3.5-Rerank-8B-MLX-4bit (esta build) | 8,38 B | 32.768 | Si (texto + imagen) | OpenMDW 1.1 | Hugging Face, formato MLX |
| nvidia/Nemotron-3.5-Rerank-8B-BF16 (original) | 8,38 B | 32.768 | Si (texto + imagen) | OpenMDW 1.1 | Hugging Face, BF16 |
| Ministral-3-8B-Instruct-2512-BF16 (base de la torre de lenguaje) | 8 B (aprox.) | No disponible | No | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en otros idiomas no esta documentado.
- Es un reranker, no un modelo generativo: no debe usarse para producir respuestas o texto.
- La cuantizacion a 4 bits introduce diferencias de score respecto al original (hasta 0,096 en SciFact y 0,487 en documentos largos e imagenes); la coincidencia en el documento top no es perfecta (37/40 y 9/10 en los conjuntos probados).
- Riesgo de sesgos heredados del modelo base de NVIDIA y de sus datos de entrenamiento; no se documentan evaluaciones de sesgo en la informacion disponible.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si puede producir puntuaciones erroneas en documentos ambiguos o fuera de dominio.
- La licencia OpenMDW 1.1 es distinta de Apache-2.0; deben revisarse sus terminos antes de uso comercial. El repositorio incluye el archivo LICENSE y NOTICE con la licencia del modelo base.
- Esta build no esta afiliada a NVIDIA; el mantenimiento y los posibles errores de conversion son responsabilidad de NetProjects.
- Dependencia del ecosistema MLX y de Apple Silicon: no es portable a GPU NVIDIA/AMD sin reconversion.
- El rendimiento con lotes grandes y entradas largas puede requerir memoria considerable (hasta 37,77 GB medidos).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Nemotron-3.5-Rerank-8B-MLX-4bit
- Modelo base original: https://huggingface.co/nvidia/Nemotron-3.5-Rerank-8B-BF16
- Repositorio de codigo: https://github.com/internet-projects/nemotron-retrieval-mlx
- MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Coleccion de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- NetProjects: https://netprojects.com

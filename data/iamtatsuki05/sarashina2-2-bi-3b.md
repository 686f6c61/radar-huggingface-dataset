# iamtatsuki05/sarashina2.2-Bi-3b

## Resumen

sarashina2.2-Bi-3b es un encoder bidireccional de frases en japones construido por iamtatsuki05 a partir del modelo causal sbintuitions/sarashina2.2-3b. La adaptacion sigue el enfoque LLM2Vec: se sustituye la atencion causal por atencion bidireccional, de modo que cada token puede atender a todo el contexto en ambas direcciones. El resultado es un modelo de embeddings de frases (feature-extraction, sentence-similarity) orientado a recuperacion de informacion y similitud semantica, no a generacion de texto.

El modelo cuenta con 3.093.465.600 parametros (2.831 millones sin contar embeddings), una dimension de embedding de 2560 obtenida por mean pooling, una longitud maxima de secuencia de 8192 tokens y un tokenizador SentencePiece con vocabulario de 102.400 entradas. Se distribuye bajo licencia MIT y esta disenado exclusivamente para japones.

Su relevancia actual radica en que sirve como punto de partida de la familia Sentence-Sarashina-Bi-*, encoders de frases derivados del mismo tronco, y en que demuestra la viabilidad de reconvertir un LLM causal japones de 3B en un encoder de recuperacion competitivo sin entrenar un modelo desde cero. La ficha del autor lo vincula a la publicacion NLP2026 sobre analisis comparativo de embeddings de frases con arquitecturas encoder/decoder bajo condiciones identicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder convertido a encoder bidireccional, estilo LLM2Vec) |
| Parametros totales | 3.093.465.600 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japones |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo parte de sbintuitions/sarashina2.2-3b, un transformer de arquitectura Llama con codificacion posicional RoPE y tokenizador SentencePiece de 102.400 tokens. La modificacion principal consiste en reemplazar la mascara de atencion causal por una mascara bidireccional completa, transformando el decodificador generativo en un encoder de representaciones. Sobre esa base se aplica mean pooling para obtener un unico vector de 2560 dimensiones por texto, y se exponen dos metodos diferenciados, `encode_query` y `encode_document`, lo que indica un entrenamiento asimetrico propio de recuperacion (query-to-passage).

La model card no detalla el volumen de tokens de entrenamiento, la composicion del corpus, ni si se emplearon tecnicas de contraste (InfoNCE, DPO o RLHF). Tampoco se especifican hiperparametros, numero de pasos ni estrategia de enmascaramiento durante el preentrenamiento bidireccional. La metrica de similitud declarada es coseno. El modelo se presenta explicitamente como base para la familia Sentence-Sarashina-Bi-*, lo que sugiere que el ajuste fino final para similitud de frases se realiza en los derivados y no en este checkpoint.

## Capacidades

- Generacion de embeddings de frases y documentos en japones (feature-extraction).
- Recuperacion de informacion densa (dense retrieval) mediante similitud coseno.
- Busqueda semantica query-document con codificacion asimetrica (`encode_query` / `encode_document`).
- Calculo de similitud semantica entre textos (sentence-similarity).
- Procesamiento de secuencias de hasta 8192 tokens, adecuado para pasajes largos.
- Soporte de atencion FlashAttention 2 (`attn_implementation="flash_attention_2"`).
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es un encoder puro.

## Casos de uso

- Busqueda semantica en corpus japoneses: indexar documentos con `encode_document` y consultar con `encode_query`, usando similitud coseno para recuperar los pasajes mas relevantes. La ventana de 8192 tokens permite indexar fragmentos largos sin truncado agresivo.
- Sistemas RAG sobre documentacion tecnica en japones: el encoder genera los vectores de recuperacion que alimentan un LLM generativo, mejorando la precision del contexto recuperado en comparacion con busqueda lexica.
- Deduplicacion y agrupacion de contenidos: calcular embeddings de articulos, tickets o registros y agrupar por similitud para detectar duplicados o near-duplicates en bases de datos japonesas.
- Clasificacion y enrutado por similitud: comparar la consulta de un usuario con prototipos de intenciones previamente embebidos para dirigirla al departamento o flujo adecuado en atencion al cliente.
- Moderacion y filtrado semantico: comparar mensajes entrantes contra un conjunto de patrones embebidos para detectar contenido similar a casos previamente etiquetados.
- Evaluacion de calidad de traduccion o parafrasis: medir la similitud coseno entre el texto original y su reformulacion para puntuar fidelidad semantica en pipelines de control de calidad.
- Recuperacion en agentes y asistentes: servir como retriever de bajo coste (3B parametros) en arquitecturas multi-herramienta donde se requiere baja latencia y despliegue en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de JMTEB, MIRACL, retrieval nDCG ni ninguna otra evaluacion numerica, ni comparaciones cuantitativas con otros encoders japoneses.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 6,2 GB solo para pesos (el repositorio ocupa 6,2 GB), mas overhead de activaciones; en la practica, entre 8 y 12 GB para lotes pequenos con 8192 tokens.
- VRAM estimada en fp32: alrededor de 12,4 GB para pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para produccion con lotes grandes; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bfloat16.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) para lotes pequenos; con cuantizacion a 8 bits cabria en 8 GB.
- Opciones de despliegue: transformers con `trust_remote_code=True`, FlashAttention 2, Text Embeddings Inference (TEI) y endpoints de Hugging Face. No se documentan variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Requisitos de software: transformers >= 4.51.0, accelerate >= 1.6.0, sentencepiece >= 0.2.0, flash-attn >= 2.7.3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Tipo |
|---|---|---|---|---|---|
| iamtatsuki05/sarashina2.2-Bi-3b | 3093M | 8192 | Japones | MIT | Encoder de frases (LLM2Vec) |
| iamtatsuki05/sarashina2.2-Bi-1b | 1224M | no disponible | Japones | MIT (segun serie) | Encoder de frases (LLM2Vec) |
| iamtatsuki05/sarashina2.2-Bi-0.5b | 661M | no disponible | Japones | MIT (segun serie) | Encoder de frases (LLM2Vec) |
| sbintuitions/sarashina2.2-3b | 3093M | no disponible | Japones | no disponible en esta ficha | LLM causal generativo |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la informacion proporcionada. La comparacion se limita a parametros, contexto declarado y licencia.

## Limitaciones y advertencias

- Modelo exclusivamente japones: no se declara soporte de otros idiomas, por lo que su uso en castellano u otras lenguas producira embeddings de baja calidad.
- No es un modelo generativo: no puede producir texto, responder preguntas ni ejecutar tool calling; solo genera representaciones vectoriales.
- Riesgo de sesgos: al derivar de un LLM preentrenado con corpus japones, puede heredar sesgos demograficos, culturales y de dominio presentes en esos datos; la model card no documenta analisis de sesgo.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la similitud coseno puede producir falsos positivos en recuperacion cuando los textos comparten vocabulario pero difieren en significado.
- Entrenamiento no documentado: se desconoce el volumen y la composicion de los datos de ajuste, lo que dificulta evaluar la cobertura de dominios (legal, medico, tecnico).
- Requiere `trust_remote_code=True`: implica ejecutar codigo personalizado del repositorio, con el riesgo de seguridad asociado en entornos de produccion.
- Dependencia de FlashAttention 2: sin ella el rendimiento y el uso de memoria pueden degradarse; no se documentan alternativas de atencion.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base sbintuitions/sarashina2.2-3b, no incluida en esta informacion.
- Adopcion muy baja: 7 descargas y 0 likes en el momento de la consulta, lo que implica escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/sarashina2.2-Bi-3b
- Modelo base: https://huggingface.co/sbintuitions/sarashina2.2-3b
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Variante 0.5b: https://huggingface.co/iamtatsuki05/sarashina2.2-Bi-0.5b
- Variante 1b: https://huggingface.co/iamtatsuki05/sarashina2.2-Bi-1b
- Licencia MIT: https://opensource.org/license/mit/
- Referencia bibliografica: Okada, R. y Sugimoto, T., "同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析", NLP2026 (sin URL disponible)

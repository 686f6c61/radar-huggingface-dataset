# iamtatsuki05/Llama-Bi-JP-1B-PT-stage2

## Resumen

Llama-Bi-JP-1B-PT-stage2 es un modelo de representaciones vectoriales (embeddings) de frases en japones, desarrollado por el usuario iamtatsuki05 dentro del proyecto MIREI. Convierte el modelo causal iamtatsuki05/Llama-JP-1B-PT-stage2 en un encoder bidireccional siguiendo el enfoque LLM2Vec, de modo que un transformer originalmente generativo pasa a producir embeddings de oraciones y documentos adecuados para recuperacion de informacion y similitud semantica. Cuenta con aproximadamente 1.224 millones de parametros totales (unos 1B no de embedding) y una dimension de representacion de 1792.

El modelo resuelve el problema de obtener embeddings de alta calidad para japones reutilizando un LLM preentrenado en lugar de entrenar un encoder desde cero. Su ventana de contexto alcanza los 8192 tokens, muy superior a la de los encoders BERT clasicos, lo que permite representar documentos largos en una sola pasada. Emplea un tokenizador SentencePiece con un vocabulario de 102.400 entradas y codificacion posicional RoPE.

Es relevante para equipos que construyen sistemas RAG o motores de busqueda semantica en japones y necesitan un encoder compacto (repo de 4,9 GB, pesos en safetensors) con licencia MIT, lo que facilita su uso comercial sin restricciones adicionales. La arquitectura es Llama bidireccional con soporte de FlashAttention 2 y API de codificacion separada para consultas y documentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama bidireccional (LLM2Vec-style), transformer decoder adaptado a encoder |
| Parametros totales | 1.224.038.144 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16 safetensors) |
| Idiomas soportados | japones |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 1792 |
| Tokenizador | SentencePiece, vocabulario de 102.400 |
| Codificacion posicional | RoPE |
| Metrica de similitud | coseno |
| Modelo base | iamtatsuki05/Llama-JP-1B-PT-stage2 |
| Tamano del repositorio | 4,9 GB |

## Arquitectura y entrenamiento

El modelo parte de un LLM causal de arquitectura Llama y lo transforma en un encoder bidireccional mediante el procedimiento LLM2Vec, que habilita la atencion bidireccional y adapta el modelo para producir representaciones de secuencia en lugar de tokens siguientes. La cabeza de embedding proyecta a una dimension de 1792 y la codificacion posicional es RoPE, lo que mantiene la coherencia posicional del modelo original. El tokenizador SentencePiece con 102.400 entradas esta orientado al japones.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica la receta exacta de adaptacion (enmascaramiento bidireccional, pooling o capas de proyeccion). El modelo expone metodos diferenciados `encode_query` y `encode_document`, lo que sugiere un entrenamiento asimetrico para tareas de recuperacion. Se cita como referencia el articulo de Okada y Sugimoto presentado en NLP2026 sobre analisis comparativo de embeddings de frases con arquitecturas encoder y decoder bajo las mismas condiciones.

## Capacidades

- Generacion de embeddings de frases y documentos en japones para similitud semantica y recuperacion.
- Codificacion asimetrica mediante `encode_query` y `encode_document`, pensada para sistemas de busqueda.
- Representacion de secuencias largas de hasta 8192 tokens en una sola pasada.
- Soporte de similitud por coseno sobre vectores de 1792 dimensiones.
- Integracion con la libreria transformers y con text-embeddings-inference para despliegue como endpoint.
- Compatibilidad con FlashAttention 2 para acelerar la inferencia.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al japones segun la model card.

## Casos de uso

- Busqueda semantica en japones: indexar un corpus de documentos con `encode_document` y consultar con `encode_query`, ordenando resultados por similitud coseno. La ventana de 8192 tokens permite indexar articulos o fragmentos largos sin truncar.
- Construccion de pipelines RAG: usar el modelo como recuperador en un sistema de preguntas y respuestas sobre documentacion interna en japones, alimentando el contexto recuperado a un LLM generativo.
- Deduplicacion y agrupamiento de textos: calcular embeddings de un conjunto de documentos japoneses y aplicar clustering o umbrales de similitud para detectar duplicados o temas recurrentes.
- Moderacion y clasificacion por similitud: comparar mensajes de usuarios con un conjunto de ejemplos etiquetados para asignar categorias mediante vecinos mas cercanos.
- Sistemas de recomendacion de contenido: representar articulos o productos descritos en japones y recomendar elementos cercanos en el espacio vectorial.
- Evaluacion de calidad de traduccion o parafrasis: medir la similitud semantica entre un texto de referencia y una hipotesis en japones mediante coseno.
- Motor de busqueda interno para soporte tecnico: desplegar el modelo con text-embeddings-inference y servirlo como endpoint compatible con la API de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 2,5 GB solo para pesos (1.224 millones de parametros), mas memoria para activaciones y cache de atencion; con contexto de 8192 tokens el consumo adicional puede ser significativo.
- GPU recomendadas: A100 o H100 para cargas de indexacion masiva; RTX 4090 o RTX 3090 suficientes para inferencia en bfloat16 con lotes moderados.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en bfloat16 o fp16; en cuantizacion de 8 bits o 4 bits cabria en GPUs de 4-6 GB, aunque no se documentan pesos cuantizados oficiales.
- Opciones de despliegue: transformers (requiere transformers>=4.51.0, accelerate>=1.6.0, sentencepiece>=0.2.0 y flash-attn>=2.7.3), text-embeddings-inference y endpoints compatibles. No se documenta soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-Bi-JP-1B-PT-stage2 | 1,22B | 8192 | japones | MIT | safetensors |
| Alternativas de embeddings japoneses de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas como encoders BERT japoneses o modelos de embeddings multilingues.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en japones; su rendimiento en otros idiomas no esta documentado y previsiblemente sera deficiente.
- No es un modelo generativo: no debe usarse para completar texto, razonar ni invocar herramientas.
- Riesgo de sesgos heredados del corpus de preentrenamiento del modelo base Llama-JP-1B-PT-stage2, no evaluado en la model card.
- No se documentan evaluaciones de robustez, alucinacion en recuperacion ni calidad en dominios especializados (legal, medico, tecnico).
- La licencia MIT permite uso comercial, pero el modelo base puede arrastrar condiciones adicionales no detalladas; conviene verificar la licencia del modelo base.
- Requiere `trust_remote_code=True` por el codigo personalizado incluido en el repositorio, lo que implica ejecutar codigo del autor.
- La model card no especifica el proceso de entrenamiento ni los datos utilizados, lo que dificulta auditar su comportamiento.
- El modelo tiene solo 4 descargas y 0 likes en el momento de la consulta, por lo que su validacion por la comunidad es practicamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Llama-Bi-JP-1B-PT-stage2
- Modelo base: https://huggingface.co/iamtatsuki05/Llama-JP-1B-PT-stage2
- Coleccion MIREI en Hugging Face: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub del proyecto MIREI: https://github.com/iamtatsuki05/MIREI
- Licencia MIT: https://opensource.org/license/mit/
- Referencia academica: Okada, R. y Sugimoto, T., "同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析", NLP2026 (sin URL disponible)

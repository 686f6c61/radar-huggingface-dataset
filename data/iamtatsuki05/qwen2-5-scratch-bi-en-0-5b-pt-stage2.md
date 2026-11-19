# iamtatsuki05/Qwen2.5-Scratch-Bi-EN-0.5B-PT-stage2

## Resumen

Qwen2.5-Scratch-Bi-EN-0.5B-PT-stage2 es un modelo de embeddings de frases en ingles desarrollado por iamtatsuki05 dentro del proyecto MIREI. Se trata de una conversion del modelo base iamtatsuki05/Qwen2.5-Scratch-EN-0.5B-PT-stage2 (un Qwen2.5 de 0,5B entrenado desde cero) a un encoder bidireccional al estilo LLM2Vec, es decir, se elimina la mascara causal para permitir atencion bidireccional y se adapta la salida para producir representaciones vectoriales de frases y documentos.

El modelo resuelve tareas de similitud semantica, recuperacion de informacion (retrieval) y feature extraction, exponiendo metodos especificos `encode_query` y `encode_document`. Con 494.032.768 parametros reales y una dimension de embedding de 896, se posiciona como una alternativa ligera para pipelines de busqueda semantica y RAG en ingles.

Es relevante porque aplica la receta LLM2Vec a un modelo pequeno entrenado desde cero, lo que permite desplegar un encoder de frases con requisitos de hardware muy bajos (cabe en GPU de consumo) manteniendo una ventana de contexto de 32.768 tokens, muy superior a la de los encoders tipo BERT habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 bidireccional (estilo LLM2Vec), transformer decoder adaptado a encoder |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta variantes GGUF/AWQ) |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 896 |
| Tokenizer | Qwen2.5, vocabulario de 151.936 tokens |
| Codificacion posicional | RoPE |
| Metrica de similitud | coseno |
| Tamano del repo | 2,0 GB |
| Libreria | transformers (con `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo parte de un Qwen2.5 de aproximadamente 0,5B de parametros entrenado desde cero (prefijo "Scratch" en el nombre) y lo transforma en un encoder bidireccional siguiendo el enfoque LLM2Vec. Esto implica desactivar la mascara causal para que cada token atienda a todo el contexto, y anadir una etapa de entrenamiento que convierte las representaciones ocultas del modelo en embeddings de frase utiles para similitud y recuperacion. La model card distingue dos etapas (`PT-stage2`), aunque no detalla la composicion exacta del dataset ni el numero de tokens empleados.

La arquitectura subyacente es un transformer decoder Qwen2.5 con RoPE como codificacion posicional, dimension oculta de 896 y un vocabulario de 151.936 tokens. El modelo expone una API custom (`encode_query`, `encode_document`) que requiere `trust_remote_code=True`. No se documenta en la informacion disponible si hubo RLHF, DPO ni tecnicas de decodificacion especulativa; al ser un encoder de embeddings, la generacion autoregresiva no es su modo de uso previsto.

## Capacidades

- Generacion de embeddings de frases y documentos en ingles para similitud semantica.
- Recuperacion de informacion (retrieval) y busqueda semantica mediante similitud coseno.
- Feature extraction a partir de las representaciones ocultas del modelo.
- Soporte de consultas y documentos con metodos diferenciados (`encode_query` / `encode_document`), lo que permite el patron asimetrico query-documento tipico de RAG.
- Manejo de contextos largos de hasta 32.768 tokens, adecuado para documentos extensos.
- Compatible con text-embeddings-inference y endpoints de Hugging Face.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un encoder, no un modelo generativo.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar manuales y articulos en ingles con `encode_document` y consultar con `encode_query`, aprovechando la ventana de 32.768 tokens para fragmentos largos sin trocear en exceso.
- RAG (retrieval-augmented generation): usar el modelo como recuperador en un pipeline que alimente a un LLM generativo, con embeddings de 896 dimensiones que reducen el coste de almacenamiento en bases vectoriales.
- Deduplicacion y clustering de contenido: calcular similitud coseno entre pares de documentos para agrupar noticias, tickets o registros duplicados en ingles.
- Moderacion y clasificacion semantica: comparar mensajes de usuario contra un conjunto de referencias etiquetadas para asignar categorias por vecindad en el espacio de embeddings.
- Sistemas de recomendacion basados en contenido: representar descripciones de articulos y perfiles de usuario como vectores para calcular afinidad semantica.
- Evaluacion de calidad de traducciones o parafrasis: medir la similitud entre una frase original y su reformulacion mediante coseno, con un modelo ligero que cabe en GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 494M de parametros ocupan aproximadamente 1 GB de pesos; con overhead de activaciones y contexto largo, se estima un uso de 2-4 GB segun la longitud de secuencia.
- GPU recomendadas: cualquier GPU con 8 GB o mas; para lotes grandes y contexto de 32K conviene una A100 o H100.
- Cabe en GPU de consumo: si, en RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o mas.
- Opciones de despliegue: transformers (requiere `transformers>=4.51.0`, `accelerate>=1.6.0`, `sentencepiece>=0.2.0`, `flash-attn>=2.7.3`), text-embeddings-inference y endpoints de Hugging Face. No se documentan variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Tipo |
|---|---|---|---|---|---|
| Qwen2.5-Scratch-Bi-EN-0.5B-PT-stage2 | 494M | 32.768 | Ingles | MIT | Encoder LLM2Vec |
| Qwen2.5-Scratch-EN-0.5B-PT-stage2 (modelo base) | ~0,5B | no disponible | Ingles | MIT | Decoder generativo |
| Encoders tipo BERT-base (referencia generica) | ~110M | 512 | Multilingue/variable | Variable | Encoder clasico |

La comparacion con alternativas concretas de la misma categoria (por ejemplo, modelos LLM2Vec publicos o encoders de frases especializados) no esta disponible en la informacion proporcionada. Frente al modelo base, la diferencia clave es la bidireccionalidad y la salida orientada a embeddings; frente a encoders clasicos tipo BERT, la ventaja es la ventana de contexto de 32.768 tokens.

## Limitaciones y advertencias

- Solo soporta ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Al ser un encoder de embeddings, no genera texto ni soporta tool calling, agentes o razonamiento multi-paso.
- Riesgo de alucinacion no aplica en el sentido generativo, pero los embeddings pueden producir similitudes espurias en dominios muy alejados de los datos de entrenamiento.
- No se documentan los datos de entrenamiento ni los posibles sesgos del modelo base entrenado desde cero; se desconoce su comportamiento en dominios especializados (legal, medico, etc.).
- Requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar codigo custom del autor; conviene auditar el repositorio antes de usarlo en produccion.
- Dependencia de `flash-attn>=2.7.3`, lo que puede complicar el despliegue en entornos sin GPU compatible o con versiones antiguas de CUDA.
- La licencia MIT permite uso comercial, pero al derivar de un modelo entrenado desde cero por el autor se recomienda verificar la procedencia de los datos de entrenamiento originales.
- El modelo tiene muy poca traccion (4 descargas, 0 likes), por lo que no hay validacion externa de su calidad.

## Enlaces

- Hugging Face: https://huggingface.co/iamtatsuki05/Qwen2.5-Scratch-Bi-EN-0.5B-PT-stage2
- Modelo base: https://huggingface.co/iamtatsuki05/Qwen2.5-Scratch-EN-0.5B-PT-stage2
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- GitHub: https://github.com/iamtatsuki05/MIREI
- Licencia MIT: https://opensource.org/license/mit/
- README en japones: README_JA.md (referenciado en la model card)

# iamtatsuki05/Llama-JP-1B-PT-stage2

## Resumen

Llama-JP-1B-PT-stage2 es un modelo de lenguaje decoder-only de tipo Llama, desarrollado por iamtatsuki05 dentro del proyecto MIREI, orientado a la generacion de texto en japones. Con 1.407.538.944 parametros (aproximadamente 1,4 mil millones), se posiciona en la gama de modelos pequenos, pensado como backbone para tareas generativas y como base para futuros ajustes (fine-tuning) posteriores.

El modelo es la segunda etapa de preentrenamiento de una serie que parte de Llama-JP-1B-PT-stage1 y continua el entrenamiento sobre el dataset fujiki/wiki40b_ja, observando aproximadamente 2.200 millones de tokens con ventanas de contexto de 8.192 tokens. Emplea una tokenizer SentencePiece con un vocabulario de 102.400 entradas y codificacion posicional RoPE, con una dimension de embedding de 1.792.

Su relevancia radica en que forma parte de un estudio comparativo controlado entre arquitecturas encoder (ModernBERT) y decoder (Llama) bajo condiciones de entrenamiento identicas, presentado en el marco del congreso NLP2026 de la Asociacion de Procesamiento del Lenguaje de Japon. La licencia MIT facilita su uso comercial y su experimentacion, aunque su tamano y su especializacion exclusiva en japones limitan su alcance frente a modelos multilingues de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (decoder-only, transformer con RoPE) |
| Parametros totales | 1.407.538.944 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor recomienda bfloat16) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 1.792 |
| Tokenizer | SentencePiece, vocabulario de 102.400 |
| Codificacion posicional | RoPE |
| Tamano del repositorio | 2,8 GB |
| Modelo base | iamtatsuki05/Llama-JP-1B-PT-stage1 |
| Dataset de entrenamiento | fujiki/wiki40b_ja |
| Tokens observados | aproximadamente 2.200 millones |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama clasica de tipo decoder-only, con atencion causal estandar y codificacion posicional rotatoria (RoPE). La dimension de embedding es de 1.792 y el contexto maximo de 8.192 tokens. El tokenizer es SentencePiece con un vocabulario de 102.400 entradas, dimensionado para cubrir de forma eficiente el japones y reducir la fragmentacion de caracteres en comparacion con vocabularios multilingues mas pequenos.

El entrenamiento corresponde a la etapa 2 de preentrenamiento, partiendo del checkpoint Llama-JP-1B-PT-stage1 y continuando sobre fujiki/wiki40b_ja, con aproximadamente 2.200 millones de tokens procesados y ventanas de 8.192 tokens. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales; se trata de un modelo de preentrenamiento puro, sin ajuste por instrucciones. El autor indica que los checkpoints de la serie comparten la misma receta de entrenamiento sobre el mismo dataset y con el mismo contexto, lo que permite comparaciones controladas entre arquitecturas. Las dependencias recomendadas son transformers>=4.51.0, accelerate>=1.6.0, sentencepiece>=0.2.0 y flash-attn>=2.7.3, con inferencia en bfloat16 y FlashAttention 2.

## Capacidades

- Generacion de texto autoregresiva en japones, con continuacion de prompts y generacion libre.
- Modelo base de preentrenamiento: no esta ajustado por instrucciones ni por preferencias, por lo que no sigue ordenes de forma fiable sin fine-tuning adicional.
- Capacidad de servir como backbone para tareas downstream generativas en japones tras un ajuste supervisado.
- Soporte de contexto largo de hasta 8.192 tokens, adecuado para documentos y conversaciones extensas.
- Capacidad de completar texto con coherencia local y de mantener estilo y registro propios del corpus de entrenamiento (Wikipedia en japones).
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso explicito.
- No dispone de capacidades de vision, audio ni modo de razonamiento (thinking mode).
- Capacidades multilingues limitadas al japones; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Generacion de texto en japones como base para fine-tuning: el modelo se puede ajustar de forma supervisada sobre un corpus especifico (por ejemplo, resenas de producto o articulos tecnicos) y usar como generador especializado; su tamano de 1,4 mil millones de parametros permite iterar rapidamente en una sola GPU.
- Completado de texto y autocompletado en herramientas de escritura japonesa: con 8.192 tokens de contexto, puede mantener el hilo de un documento largo y sugerir continuaciones coherentes con el estilo previo.
- Experimentacion academica en arquitecturas encoder frente a decoder: al compartir receta de entrenamiento y dataset con ModernBERT-JP-1B-PT-stage2, sirve para comparar el rendimiento de ambas arquitecturas en tareas de embedding y generacion bajo condiciones controladas.
- Prototipado de asistentes conversacionales en japones: tras un ajuste por instrucciones, puede integrarse en un chatbot de dominio acotado (atencion al cliente, FAQ) donde el coste de inferencia y la latencia sean criticos.
- Generacion aumentada por recuperacion (RAG) en japones: el contexto de 8.192 tokens permite insertar varios fragmentos recuperados de una base documental y generar respuestas fundamentadas, siempre que se anada una capa de ajuste instructivo.
- Investigacion sobre tokenizacion japonesa: el vocabulario de 102.400 entradas y la tokenizer SentencePiece permiten estudiar el impacto de la fragmentacion en la calidad generativa frente a otros vocabularios.
- Educacion e investigacion en PLN: como modelo pequeno y de licencia permisiva, es adecuado para cursos, laboratorios y experimentos de bajo presupuesto en procesamiento del lenguaje japones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8-3,2 GB solo para los pesos, mas memoria para el KV cache y activaciones; en la practica, unos 4-6 GB con contexto moderado.
- En cuantizacion de 8 bits: aproximadamente 1,5-2 GB de pesos; en 4 bits, aproximadamente 0,8-1 GB, aunque el autor no publica pesos cuantizados y habria que generarlos.
- GPU recomendadas para produccion: NVIDIA A100, H100 o L40S para mayor throughput; tambien funciona en GPUs de gama media como RTX 4090, RTX 3090, A10G o L4.
- Cabe en GPUs de consumo: si, en RTX 4090, RTX 3090, RTX 4080, RTX 4070 Ti y similares con al menos 8 GB de VRAM; en cuantizacion 4 bits podria ejecutarse en GPUs con 4-6 GB.
- Opciones de despliegue: transformers (con FlashAttention 2 y bfloat16), text-generation-inference (el modelo esta etiquetado como compatible con endpoints), vLLM y llama.cpp/Ollama si se convierten los pesos a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-JP-1B-PT-stage2 | 1.407.538.944 | 8.192 | japones | MIT | Hugging Face |
| ModernBERT-JP-1B-PT-stage2 | no disponible | no disponible | japones | no disponible | Hugging Face |
| Llama-JP-1B-PT-stage1 | no disponible | no disponible | japones | no disponible | Hugging Face |

La comparacion mas directa es con ModernBERT-JP-1B-PT-stage2, del mismo autor y con la misma receta de entrenamiento sobre fujiki/wiki40b_ja, pero con arquitectura encoder; la diferencia clave es que ModernBERT esta orientado a embeddings y comprension, mientras que Llama-JP-1B-PT-stage2 esta orientado a generacion autoregresiva. No se dispone de datos de benchmarks que permitan comparar su rendimiento numerico con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es un modelo de preentrenamiento sin ajuste por instrucciones: no sigue ordenes de forma fiable y puede producir continuaciones irrelevantes ante prompts formulados como pregunta o mandato.
- Riesgo elevado de alucinacion: al no estar alineado ni anclado a una base de conocimiento verificada, puede generar afirmaciones factualmente incorrectas con aparente fluidez.
- Sesgos potenciales heredados del corpus de entrenamiento (Wikipedia en japones), incluyendo sesgos de representacion y de perspectiva editorial.
- Soporte exclusivo del japones: el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera deficiente.
- Contexto limitado a 8.192 tokens; no admite ventanas mayores sin tecnicas externas de extension.
- No dispone de soporte documentado de tool calling, agentes ni razonamiento multi-paso, lo que limita su uso directo en pipelines agenticos.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero se recomienda conservar el aviso de copyright y verificar las condiciones del dataset fujiki/wiki40b_ja para usos derivados.
- El modelo tiene solo 3 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada; conviene evaluarlo internamente antes de usarlo en produccion.
- No se publican pesos cuantizados ni datos de latencia, por lo que el rendimiento real en despliegue debe medirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Llama-JP-1B-PT-stage2
- Modelo base (etapa 1): https://huggingface.co/iamtatsuki05/Llama-JP-1B-PT-stage1
- Modelo hermano (ModernBERT): https://huggingface.co/iamtatsuki05/ModernBERT-JP-1B-PT-stage2
- Coleccion MIREI en Hugging Face: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/fujiki/wiki40b_ja
- Licencia MIT: https://opensource.org/license/mit/

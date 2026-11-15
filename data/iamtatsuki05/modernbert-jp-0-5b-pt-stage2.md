# iamtatsuki05/ModernBERT-JP-0.5B-PT-stage2

## Resumen

ModernBERT-JP-0.5B-PT-stage2 es un modelo de lenguaje enmascarado (masked language model) para japones, desarrollado por el usuario iamtatsuki05 dentro del proyecto MIREI. Se trata de la segunda etapa de preentrenamiento de una familia de modelos basados en la arquitectura ModernBERT, que combina las mejoras del transformer encoder moderno (RoPE, atencion lineal, FlashAttention) con un vocabulario japones ampliado. El modelo parte de la etapa 1 y anade un preentrenamiento adicional sobre el corpus `fujiki/wiki40b_ja` con aproximadamente 1.000 millones de tokens y contextos de 8.192 tokens, con el objetivo de mejorar la cobertura enciclopedica y la comprension de contexto largo en japones.

Con 810 millones de parametros totales (679M segun la model card, 548M sin embeddings) y una dimension de embedding de 1.280, el modelo esta disenado para tareas de comprension del lenguaje: clasificacion de secuencias, similitud semantica, inferencia natural y relleno de mascaras. Su relevancia actual radica en que ofrece una alternativa encoder eficiente y de contexto largo (8.192 tokens) especifica para japones, con licencia MIT y resultados competitivos en la bateria JGLUE frente a un modelo decoder de tamano similar (Llama-JP-0.5B) entrenado en las mismas condiciones.

El modelo no es generativo: su pipeline es `fill-mask` y su uso principal es la obtencion de representaciones contextuales y la prediccion de tokens enmascarados. Es adecuado como base para fine-tuning en tareas downstream en japones o como encoder en pipelines de recuperacion, clasificacion y analisis semantico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | 810.352.640 (segun safetensors); 679M segun model card (548M sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes GGUF/AWQ/GPTQ; admite bfloat16 en el ejemplo de uso) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos tecnicos: dimension de embedding 1.280; tokenizer SentencePiece con vocabulario de 102.400 tokens; codificacion posicional RoPE; modelo base `iamtatsuki05/ModernBERT-JP-0.5B-PT-stage1`; tamano del repositorio 1,6 GB; tarea `fill-mask`; dataset de preentrenamiento `fujiki/wiki40b_ja`.

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ModernBERT, una evolucion del transformer encoder clasico (estilo BERT) que incorpora RoPE (Rotary Positional Embeddings) en lugar de embeddings posicionales absolutos, atencion con implementacion eficiente (FlashAttention 2 en el ejemplo de uso) y mecanismos de atencion alternados que permiten extender el contexto hasta 8.192 tokens. La dimension de embedding es de 1.280 y el tokenizer es SentencePiece con un vocabulario de 102.400 entradas, adaptado al japones.

El entrenamiento es un preentrenamiento adicional (continued pretraining) en dos etapas. La etapa 1 corresponde al modelo base `ModernBERT-JP-0.5B-PT-stage1`; la etapa 2, que es este modelo, anade aproximadamente 1.000 millones de tokens sobre el corpus `fujiki/wiki40b_ja` con secuencias de 8.192 tokens. El objetivo es un masked language modeling (MLM) clasico. La model card no documenta el uso de RLHF, DPO ni tecnicas de alineacion, lo cual es coherente con un modelo encoder de preentrenamiento. Tampoco se detalla la composicion exacta del dataset mas alla de su origen en Wiki40b japones, ni el numero total de tokens vistos en la etapa 1.

## Capacidades

- Prediccion de tokens enmascarados (fill-mask) en japones, con contexto de hasta 8.192 tokens.
- Generacion de representaciones contextuales (embeddings) para clasificacion de secuencias, similitud semantica e inferencia natural, segun los resultados reportados en JGLUE.
- Comprension de contexto largo en japones, gracias a la ventana de 8.192 tokens y a la codificacion RoPE.
- Cobertura de conocimiento enciclopedico en japones, reforzada por el preentrenamiento sobre Wiki40b.
- No soporta generacion autoregresiva de texto, tool calling, function calling ni razonamiento multi-paso: es un encoder, no un modelo generativo.
- No dispone de capacidades multimodales (vision, audio) ni de modo "thinking".
- Capacidad multilingue limitada al japones; no se reporta rendimiento en otros idiomas.

## Casos de uso

- Clasificacion de textos japoneses: fine-tuning sobre la cabeza de clasificacion para deteccion de temas, moderacion de contenido o categorizacion de documentos, aprovechando el contexto de 8.192 tokens para documentos largos.
- Similitud semantica y busqueda: uso de los embeddings contextuales para construir indices de recuperacion densa sobre corpus japoneses, con la ventaja de codificar pasajes largos sin truncar.
- Inferencia natural (NLI) en japones: fine-tuning para tareas de entailment y deteccion de contradicciones, un caso directamente evaluado en JGLUE (JNLI).
- Analisis de resenas y opinion: clasificacion de sentimiento o extraccion de aspectos en resenas de productos y servicios en japones, con capacidad de procesar resenas extensas completas.
- Enriquecimiento de bases de conocimiento: uso de fill-mask para completar entidades y relaciones en textos enciclopedicos japoneses, apoyandose en el preentrenamiento sobre Wiki40b.
- Preprocesamiento para pipelines de PLN: generacion de embeddings de frases y documentos como paso previo a sistemas de recomendacion, deduplicacion o clustering de contenido japones.
- Base para fine-tuning en tareas downstream: al ser un encoder con licencia MIT, sirve como punto de partida para adaptar a dominios especificos (legal, medico, industrial) en japones.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de la bateria JGLUE reportados por el autor en la model card, comparando este modelo con Llama-JP-0.5B-PT-stage2 entrenado en condiciones equivalentes:

| Modelo | Arquitectura | Parametros | JGLUE-Avg | JGLUE-JSTS | JGLUE-JNLI | JGLUE-JCoLA |
|---|---|---|---|---|---|---|
| ModernBERT-JP-0.5B-PT-stage2 (este modelo) | ModernBERT | 679M | 86,32 | 89,29 | 86,68 | 83,00 |
| Llama-JP-0.5B-PT-stage2 | Llama | 661M | 81,88 | 82,91 | 78,67 | 84,06 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar, lo cual es esperable en un modelo encoder de preentrenamiento sin instrucciones.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 810M de parametros ocupan aproximadamente 1,6 GB de pesos; con overhead de activaciones y contexto de 8.192 tokens, se estima un uso de 3-6 GB de VRAM. En float32, los pesos solos son unos 3,2 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente; una RTX 4090, A100 o H100 ofreceran mayor throughput y permiten lotes grandes.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: transformers con `AutoModelForMaskedLM`; el autor recomienda `transformers>=4.51.0`, `accelerate>=1.6.0`, `sentencepiece>=0.2.0` y `flash-attn>=2.7.3` para FlashAttention 2. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | JGLUE-Avg | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ModernBERT-JP-0.5B-PT-stage2 | ModernBERT | 679M (810M en safetensors) | 8.192 | 86,32 | MIT | Hugging Face |
| Llama-JP-0.5B-PT-stage2 | Llama (decoder) | 661M | no disponible | 81,88 | no disponible | Hugging Face |
| ModernBERT-JP-0.5B-PT-stage1 | ModernBERT | no disponible | no disponible | no disponible | MIT | Hugging Face (modelo base) |

La comparativa directa disponible se limita a los dos modelos de la serie MIREI evaluados en JGLUE. El modelo encoder supera al decoder de tamano similar en la media de JGLUE y en JSTS y JNLI, mientras que el decoder obtiene mejor puntuacion en JCoLA (84,06 frente a 83,00). No se dispone de datos de otros encoders japoneses comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente en japones; no se ha evaluado su rendimiento en castellano ni en otros idiomas.
- No es un modelo generativo: no puede usarse para chat, generacion de texto libre, tool calling ni agentes.
- Riesgo de alucinacion en la prediccion de mascaras: las completaciones de fill-mask pueden producir tokens plausibles pero factualmente incorrectos, especialmente fuera del dominio enciclopedico de Wiki40b.
- Sesgos: al entrenarse sobre Wiki40b japones, puede heredar sesgos de representacion y cobertura geografica y cultural del corpus; el autor no documenta analisis de sesgos.
- Datos de entrenamiento limitados: aproximadamente 1.000 millones de tokens adicionales en la etapa 2, lo que puede limitar la cobertura en dominios especializados (legal, medico, tecnico).
- Licencia MIT: permite uso comercial y modificacion, pero no se documentan garantias ni condiciones adicionales del dataset de origen (`fujiki/wiki40b_ja`), que conviene verificar antes de un despliegue en produccion.
- No se publican variantes cuantizadas (GGUF, AWQ, GPTQ) ni integraciones con servidores de inferencia de alto rendimiento, lo que puede requerir trabajo adicional para despliegues optimizados.
- El numero de parametros difiere entre la model card (679M) y los safetensors (810M); conviene verificar el conteo real para planificacion de recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/ModernBERT-JP-0.5B-PT-stage2
- Modelo base (etapa 1): https://huggingface.co/iamtatsuki05/ModernBERT-JP-0.5B-PT-stage1
- Modelo comparable de la serie: https://huggingface.co/iamtatsuki05/Llama-JP-0.5B-PT-stage2
- Coleccion MIREI en Hugging Face: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub del proyecto: https://github.com/iamtatsuki05/MIREI
- Dataset de preentrenamiento: https://huggingface.co/datasets/fujiki/wiki40b_ja
- Licencia MIT: https://opensource.org/license/mit/

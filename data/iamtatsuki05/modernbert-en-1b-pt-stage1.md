# iamtatsuki05/ModernBERT-EN-1B-PT-stage1

## Resumen

ModernBERT-EN-1B-PT-stage1 es un checkpoint de preentrenamiento de tipo encoder desarrollado por el usuario iamtatsuki05 dentro del proyecto MIREI. Se trata de un modelo basado en la arquitectura ModernBERT, inicializado desde cero (sin destilación ni inicialización a partir de otro modelo) y entrenado sobre el corpus HuggingFaceFW/fineweb-edu con aproximadamente 17.000 millones de tokens y ventanas de contexto de 1.024 tokens. Cuenta con 1.487.924.736 parámetros totales y una dimensión de embedding de 1792.

El modelo no está afinado para ninguna tarea concreta: es una base de tipo masked language modeling (fill-mask) pensada como esqueleto para tareas de comprensión del lenguaje en inglés, como clasificación de texto, extracción de características o ajuste fino supervisado. Su relevancia radica en que forma parte de un estudio comparativo entre arquitecturas encoder (ModernBERT) y decoder (Llama) entrenadas bajo condiciones idénticas, lo que permite aislar el efecto de la arquitectura en la calidad de los embeddings.

A pesar de su tamaño cercano a 1.500 millones de parámetros, el modelo solo ha visto 17.000 millones de tokens, una cifra baja para un modelo de esta escala, por lo que debe considerarse un checkpoint de etapa 1 (preentrenamiento inicial) y no un modelo listo para producción. La licencia MIT facilita su uso comercial y su modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer con RoPE y atención bidireccional) |
| Parametros totales | 1.487.924.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens en preentrenamiento; máximo soportado 8.192 tokens |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

ModernBERT es una familia de encoders transformer que moderniza el diseño de BERT clásico incorporando RoPE (rotary positional embeddings), atención bidireccional con soporte de FlashAttention-2, capas sin sesgo y una mezcla de atención local y global. En este checkpoint concreto, la dimensión de embedding es 1792, el tokenizador es SentencePiece con un vocabulario de 102.400 entradas y la longitud máxima de secuencia es de 8.192 tokens, aunque el preentrenamiento se realizó con ventanas de 1.024 tokens.

El entrenamiento parte de inicialización aleatoria y utiliza únicamente el dataset HuggingFaceFW/fineweb-edu, un corpus filtrado de contenido educativo en inglés. El autor reporta aproximadamente 17.000 millones de tokens vistos. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de ajuste por preferencias; se trata exclusivamente de preentrenamiento con objetivo de masked language modeling. Tampoco se detallan hiperparámetros como la tasa de aprendizaje, el tamaño de batch global o la composición exacta del dataset más allá del nombre del corpus.

## Capacidades

- Relleno de máscaras (fill-mask): predice tokens enmascarados en una secuencia, tal como se muestra en el ejemplo de uso con la frase "The capital of France is [MASK]".
- Extracción de representaciones contextuales: al ser un encoder bidireccional, genera embeddings de tokens y de secuencia útiles para tareas posteriores.
- Comprensión del lenguaje en inglés: entrenado exclusivamente con texto en inglés, adecuado para clasificación, NER, QA extractiva y similitud semántica tras ajuste fino.
- Contexto de hasta 8.192 tokens: aunque el preentrenamiento usó 1.024 tokens, la configuración del modelo permite secuencias más largas, si bien el rendimiento más allá de 1.024 tokens no está validado en la información disponible.
- Soporte de FlashAttention-2: acelera la inferencia y el entrenamiento en GPU compatibles.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento; es un encoder de preentrenamiento, no un modelo generativo instruido.
- Capacidades multilingües: limitadas al inglés; no se reporta soporte para otros idiomas.

## Casos de uso

- Ajuste fino para clasificación de texto: el modelo sirve como base para tareas como análisis de sentimiento o clasificación de temas, aprovechando sus 1.487 millones de parámetros y su tokenizador de 102.400 entradas para una cobertura léxica amplia en inglés.
- Extracción de características para sistemas de recuperación: los embeddings contextuales del encoder pueden alimentar índices vectoriales en motores de búsqueda semántica en inglés, aunque requeriría validación empírica frente a encoders específicos de recuperación.
- Reconocimiento de entidades nombradas (NER): tras un ajuste fino supervisado, el modelo puede etiquetar entidades en documentos en inglés con contexto de hasta 1.024 tokens, suficiente para párrafos y secciones cortas.
- Investigación comparativa de arquitecturas: su principal valor inmediato es servir como pieza en el estudio MIREI que compara encoders ModernBERT y decoders Llama entrenados con la misma receta, permitiendo analizar diferencias en la calidad de embeddings.
- Punto de partida para preentrenamiento continuado: al ser un checkpoint de etapa 1 con solo 17.000 millones de tokens vistos, puede continuarse su entrenamiento con más datos o dominios específicos antes de un ajuste fino.
- Filtrado y deduplicación semántica de corpus: los embeddings de secuencia pueden usarse para detectar documentos duplicados o de baja calidad en pipelines de curación de datos en inglés.
- Prototipado académico con licencia permisiva: la licencia MIT permite usar el modelo en experimentos comerciales y académicos sin restricciones de atribución más allá de la propia licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3 GB solo para los pesos (1.487.924.736 parámetros × 2 bytes), más memoria para activaciones y caché de atención según la longitud de secuencia.
- VRAM estimada en float32: aproximadamente 6 GB para los pesos.
- GPU recomendadas: A100, H100 o L40S para entrenamiento y ajuste fino a secuencias largas; RTX 4090 o RTX 3090 suficientes para inferencia y ajuste fino con batch pequeño en bfloat16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM para inferencia en bfloat16 con secuencias moderadas; 16 GB o más recomendable para ajuste fino.
- Opciones de despliegue: transformers con accelerate y FlashAttention-2 (requisitos declarados: transformers>=4.51.0, accelerate>=1.6.0, sentencepiece>=0.2.0, flash-attn>=2.7.3). No se publican variantes GGUF ni cuantizadas, por lo que llama.cpp u Ollama no están soportados de forma nativa sin conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModernBERT-EN-1B-PT-stage1 | 1.487.924.736 | 1.024 en preentrenamiento; 8.192 máximo | ModernBERT encoder | MIT | Hugging Face (4 descargas) |
| iamtatsuki05/Llama-EN-1B-PT-stage1 | no disponible en la información | 1.024 en preentrenamiento | Llama decoder | no disponible en la información | Hugging Face (misma colección MIREI) |
| ModernBERT-base (original) | no disponible en la información | no disponible en la información | ModernBERT encoder | no disponible en la información | Hugging Face |

La comparación más directa es con el checkpoint Llama-EN-1B-PT-stage1 del mismo autor, entrenado con la misma receta sobre fineweb-edu y con contextos de 1.024 tokens, lo que permite comparar encoder frente a decoder en igualdad de condiciones. Frente al ModernBERT original de Answer.AI, este checkpoint se diferencia por su mayor tamaño (1.487 millones frente a escalas menores) y por un preentrenamiento mucho más corto en tokens.

## Limitaciones y advertencias

- Modelo de etapa 1: solo ha visto aproximadamente 17.000 millones de tokens, una cantidad reducida para 1.487 millones de parámetros; no debe esperarse un rendimiento competitivo frente a encoders maduros sin un preentrenamiento adicional.
- No está ajustado para ninguna tarea: es un checkpoint de masked language modeling, no un modelo instruido ni un clasificador listo para usar.
- Solo inglés: no se reporta soporte multilingüe; su uso con otros idiomas producirá resultados degradados.
- Contexto efectivo limitado: aunque el máximo configurado es de 8.192 tokens, el preentrenamiento se realizó con 1.024 tokens, por lo que el rendimiento en secuencias más largas no está validado.
- Riesgo de alucinación: al ser un modelo fill-mask, puede generar predicciones plausibles pero incorrectas para tokens enmascarados; no debe usarse como fuente de verdad factual sin verificación.
- Sesgos: al entrenarse sobre fineweb-edu, puede heredar sesgos presentes en contenido web filtrado por criterios educativos; no se documentan evaluaciones de sesgo en la información disponible.
- Licencia MIT: permisiva para uso comercial, pero conviene revisar las condiciones del dataset fineweb-edu si se redistribuye el modelo o se usa en productos derivados.
- Sin cuantizaciones publicadas: no hay variantes GGUF, AWQ ni GPTQ, lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional de conversión.
- Escasa adopción: 4 descargas y 0 likes en el momento de la consulta; no hay evidencia comunitaria de calidad ni reportes independientes de rendimiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/iamtatsuki05/ModernBERT-EN-1B-PT-stage1)
- [Colección MIREI en Hugging Face](https://huggingface.co/collections/iamtatsuki05/mirei)
- [Repositorio GitHub del proyecto MIREI](https://github.com/iamtatsuki05/MIREI)
- [Checkpoint hermano Llama-EN-1B-PT-stage1](https://huggingface.co/iamtatsuki05/Llama-EN-1B-PT-stage1)
- [Dataset HuggingFaceFW/fineweb-edu](https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu)
- [Licencia MIT](https://opensource.org/license/mit/)

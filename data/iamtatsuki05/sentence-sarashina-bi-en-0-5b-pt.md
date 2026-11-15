# iamtatsuki05/Sentence-Sarashina-Bi-EN-0.5B-PT

## Resumen

Sentence-Sarashina-Bi-EN-0.5B-PT es un modelo de embeddings de frases en inglés desarrollado por iamtatsuki05 dentro de la familia MIREI. Se construye envolviendo el modelo base iamtatsuki05/sarashina2.2-Bi-0.5b (arquitectura Llama) mediante entrenamiento contrastivo débilmente supervisado sobre los subconjuntos débilmente supervisados del dataset sentence-transformers/embedding-training-data, que comprende aproximadamente 16,1 millones de pares de entrenamiento. El resultado es un encoder que produce embeddings de 1.280 dimensiones mediante mean pooling y similitud coseno.

El modelo resuelve la tarea de generación de representaciones vectoriales densas para recuperación de información, búsqueda semántica y similitud de frases. Con 661.976.320 parámetros totales (530M sin contar los embeddings) y una longitud máxima de secuencia de 8.192 tokens, se posiciona como una alternativa compacta frente a encoders de mayor tamaño para pipelines de retrieval y RAG. Su tokenizador SentencePiece con vocabulario de 102.400 tokens y codificación posicional RoPE son herencia directa del modelo base Llama.

Es relevante ahora porque forma parte de una serie comparativa sistemática de encoders de 0,5B bajo condiciones de entrenamiento idénticas (ModernBERT, Llama, Mistral, Qwen2.5, InstructLM), lo que permite aislar el efecto de la arquitectura sobre la calidad de los embeddings. La licencia MIT y su compatibilidad con text-embeddings-inference y endpoints facilitan su integración en producción. El modelo está especializado exclusivamente en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama (encoder, mean pooling) |
| Parámetros totales | 661.976.320 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Llama adaptada como encoder de frases. El modelo base sarashina2.2-Bi-0.5b se envuelve con entrenamiento contrastivo débilmente supervisado sobre los subconjuntos débilmente supervisados de sentence-transformers/embedding-training-data, con unos 16,1 millones de pares. La representación final se obtiene mediante mean pooling, generando un vector de 1.280 dimensiones. Utiliza tokenizador SentencePiece con vocabulario de 102.400 tokens y codificación posicional RoPE. La similitud entre embeddings se calcula con distancia coseno.

La innovación metodológica principal es la comparabilidad controlada: la serie MIREI entrena siete variantes de 0,5B (ModernBERT, Llama, Mistral, Qwen2.5, InstructLM) bajo el mismo recetario de datos y supervisión, lo que permite analizar el impacto de la arquitectura en la calidad de los embeddings. No se especifica en la información disponible si hubo fases de RLHF o DPO, ni el número total de tokens procesados durante el entrenamiento contrastivo.

## Capacidades

- Generación de embeddings de frases de 1.280 dimensiones para similitud semántica y recuperación.
- Búsqueda semántica y retrieval denso en inglés mediante similitud coseno.
- Codificación de secuencias de hasta 8.192 tokens, adecuada para documentos largos.
- Soporte de mean pooling para agregar representaciones a nivel de frase o pasaje.
- Compatible con text-embeddings-inference y endpoints de Hugging Face.
- Integración con sentence-transformers (versión >= 4.1.0) y transformers (>= 4.51.0).
- Soporte de FlashAttention 2 (flash-attn >= 2.7.3) para aceleración de inferencia.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales y recuperar pasajes relevantes mediante similitud coseno entre el embedding de la consulta y los de los fragmentos, aprovechando la ventana de 8.192 tokens para pasajes largos.
- Pipelines RAG (generación aumentada por recuperación): generar embeddings de chunks de conocimiento para alimentar un recuperador denso en un sistema de preguntas y respuestas sobre corpus en inglés.
- Deduplicación y clustering de textos: calcular embeddings de grandes volúmenes de documentos y agrupar por similitud para eliminar duplicados o clasificar temáticamente.
- Motores de recomendación basados en contenido: representar descripciones de artículos o perfiles y recomendar ítems con vectores próximos en el espacio de embeddings.
- Moderación y detección de similitud: comparar mensajes entrantes con una base de textos de referencia para detectar contenido duplicado o variantes de plantillas.
- Evaluación de calidad de respuestas: medir la similitud semántica entre respuestas generadas y respuestas de referencia en pipelines de evaluación automática.
- Búsqueda en bases de conocimiento internas: desplegar el modelo con text-embeddings-inference para servir un endpoint de embeddings en inglés con latencia baja gracias a su tamaño de 0,5B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 1,3-1,5 GB para los pesos (661M parámetros), más memoria para activaciones según la longitud de secuencia.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,7 GB; en 4 bits, alrededor de 0,4 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: A100, H100 o L40S para alto throughput; RTX 4090, RTX 3090 o RTX 4080 para despliegue en servidor único.
- Cabe holgadamente en GPU de consumo: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070 y superiores; también en GPUs con 8 GB.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference (endpoints compatibles), transformers con FlashAttention 2; no se confirma soporte de llama.cpp, Ollama o vLLM en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Parám. sin embeddings | Contexto | Licencia |
|---|---|---|---|---|---|
| Sentence-Sarashina-Bi-EN-0.5B-PT (este) | Llama | 661M | 530M | 8.192 | MIT |
| Sentence-Llama-Bi-EN-0.5B-PT | Llama | 661M | 530M | no disponible | MIT |
| Sentence-ModernBERT-EN-0.5B-PT | ModernBERT | 677M | 546M | no disponible | MIT |
| Sentence-Mistral-Bi-EN-0.5B-PT | Mistral | 518M | 469M | no disponible | MIT |
| Sentence-Qwen2.5-Bi-EN-0.5B-PT | Qwen2.5 | 494M | 357M | no disponible | MIT |

Las cinco variantes comparten el mismo recetario de entrenamiento sobre los subconjuntos débilmente supervisados de sentence-transformers/embedding-training-data (unos 16,1 millones de pares), lo que permite una comparación controlada por arquitectura. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en inglés; no se garantiza calidad en otros idiomas.
- Es un modelo de embeddings, no generativo: no produce texto, no soporta tool calling ni razonamiento.
- Riesgo de sesgos heredados del dataset de entrenamiento sentence-transformers/embedding-training-data y del modelo base, no documentados por el autor.
- La supervisión es débil, lo que puede degradar la calidad en dominios muy específicos frente a modelos entrenados con datos supervisados de alta calidad.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas de retrieval no está cuantificado.
- Requiere trust_remote_code=True y versiones mínimas de sentence-transformers (>= 4.1.0) y transformers (>= 4.51.0), lo que puede complicar despliegues con dependencias fijadas.
- FlashAttention 2 es una dependencia declarada en los requisitos de ejemplo; su ausencia puede afectar al rendimiento.
- Licencia MIT: permite uso comercial sin restricciones significativas, pero conviene verificar las condiciones del dataset de entrenamiento subyacente.

## Enlaces

- Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-EN-0.5B-PT
- Modelo base: https://huggingface.co/iamtatsuki05/sarashina2.2-Bi-0.5b
- Colección MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/embedding-training-data
- Variante ModernBERT: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-EN-0.5B-PT
- Variante Llama: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-EN-0.5B-PT
- Variante Mistral: https://huggingface.co/iamtatsuki05/Sentence-Mistral-Bi-EN-0.5B-PT
- Variante Qwen2.5: https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Bi-EN-0.5B-PT
- Variante Qwen2.5 Scratch: https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Scratch-Bi-EN-0.5B-PT
- Variante InstructLM: https://huggingface.co/iamtatsuki05/Sentence-InstructLM-Bi-EN-0.5B-PT
- Licencia MIT: https://opensource.org/license/mit/

# iamtatsuki05/ModernBERT-EN-0.5B-PT-stage1

## Resumen

ModernBERT-EN-0.5B-PT-stage1 es un modelo encoder de tipo ModernBERT entrenado desde inicialización aleatoria por el autor iamtatsuki05 (proyecto MIREI) sobre el corpus HuggingFaceFW/fineweb-edu. Se trata de un checkpoint de preentrenamiento en fase 1 (stage1), concebido como backbone de encoder para inglés y no como un modelo instructivo o conversacional. El modelo observa aproximadamente 10.000 millones de tokens con ventanas de contexto de 1.024 tokens durante el preentrenamiento, y está orientado a tareas de enmascaramiento de tokens (masked language modeling).

La relevancia del checkpoint es metodológica: forma parte de una serie que compara arquitecturas encoder (ModernBERT) y decoder (Llama) bajo recetas de entrenamiento idénticas sobre el mismo corpus, con el objetivo de analizar el rendimiento de embeddings de frases según la arquitectura. El modelo declara 679 millones de parámetros según la model card (548 millones sin embeddings), aunque el recuento real de safetensors asciende a 810.352.640 parámetros, una discrepancia que conviene tener en cuenta al planificar el despliegue.

La arquitectura ModernBERT combina atención bidireccional con RoPE y una dimensión de embedding de 1.280, con un tokenizador SentencePiece de 102.400 entradas de vocabulario. El modelo soporta una longitud máxima de secuencia de 8.192 tokens, aunque su preentrenamiento se realizó con 1.024 tokens de contexto, lo que limita su robustez efectiva en secuencias largas pese a la capacidad nominal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder bidireccional con RoPE) |
| Parametros totales | 810.352.640 (safetensors); 679M declarados en model card (548M sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens máximos (preentrenado con 1.024 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ModernBERT, un transformer encoder bidireccional que incorpora codificación posicional rotatoria (RoPE) en lugar de las posiciones absolutas clásicas de BERT. La dimensión de embedding es de 1.280 y el tokenizador es SentencePiece con un vocabulario de 102.400 tokens. El modelo se entrena con objetivo de masked language modeling (masked-lm), lo que lo sitúa en la categoría de modelos de relleno de máscaras (fill-mask).

El preentrenamiento parte de inicialización aleatoria (los mismos pesos iniciales que el checkpoint ModernBERT-JP-0.5B-init) y utiliza el dataset fineweb-edu. El autor indica que el modelo observa aproximadamente 10.000 millones de tokens con ventanas de contexto de 1.024 tokens. No se detalla en la información disponible la composición exacta del dataset, el uso de RLHF/DPO (poco habitual en un encoder de preentrenamiento) ni innovaciones técnicas adicionales más allá de las propias de ModernBERT y el uso de RoPE. La serie MIREI incluye también un checkpoint equivalente con arquitectura Llama (iamtatsuki05/Llama-EN-0.5B-PT-stage1) entrenado con la misma receta, lo que facilita la comparación controlada entre encoder y decoder.

## Capacidades

- Relleno de máscaras (masked language modeling): predice el token enmascarado en una secuencia, tal como se muestra en el ejemplo de uso de la model card.
- Generación de representaciones contextuales bidireccionales para inglés, útil como backbone de encoder para extracción de embeddings.
- Procesamiento de secuencias de hasta 8.192 tokens nominalmente, aunque el preentrenamiento se realizó con 1.024 tokens.
- No dispone de generación autoregresiva de texto, tool calling, function calling ni razonamiento multi-paso.
- No se declaran capacidades de visión, audio ni modo de razonamiento.
- Capacidad multilingüe limitada: solo inglés declarado.
- No se documentan capacidades de instrucción ni de diálogo.

## Casos de uso

- Extracción de embeddings para búsqueda semántica: el encoder produce representaciones contextuales de texto en inglés que pueden usarse para indexar documentos y alimentar sistemas de recuperación. Es adecuado como base para fine-tuning en tareas de retrieval, dado su tamaño moderado y su naturaleza bidireccional.
- Clasificación de texto: como backbone de encoder, puede adaptarse con una cabeza de clasificación para tareas como análisis de sentimiento, detección de spam o categorización de tickets, con fine-tuning sobre datasets específicos.
- Relleno de máscaras en pipelines de NLP: el modelo puede usarse directamente para completar huecos en frases, útil en tareas de augmentación de datos o evaluación de conocimiento léxico.
- Base para fine-tuning de NER (reconocimiento de entidades nombradas): la naturaleza bidireccional y el contexto de 8.192 tokens permiten anotar entidades en documentos largos tras el ajuste fino.
- Experimentación académica en comparativas encoder/decoder: forma parte de la serie MIREI, diseñada para comparar arquitecturas bajo recetas de entrenamiento idénticas, por lo que es adecuado como punto de partida en estudios de representación.
- Componente de sistemas de moderación de contenido en inglés: tras fine-tuning, puede clasificar fragmentos de texto por categorías de riesgo, aprovechando su ventana de contexto para analizar conversaciones completas.
- Generación de features para modelos downstream: sus embeddings pueden alimentar modelos de clasificación, clustering o deduplicación de documentos en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,6 GB para los pesos (tamaño del repo) más overhead de activaciones y atención, típicamente en torno a 2-4 GB según el tamaño de lote y la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM. Para producción con lotes grandes, se recomiendan A100, H100, L40S o RTX 4090.
- Cabe en GPU de consumidor: sí, en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090 y tarjetas similares con 8 GB o más.
- Opciones de despliegue: transformers (con accelerate), vLLM no aplica de forma directa por ser encoder, TGI (con soporte de fill-mask), y llama.cpp/Ollama solo si existe conversión GGUF (no documentada en la información disponible).
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModernBERT-EN-0.5B-PT-stage1 (este) | ModernBERT | ~810M reales / 679M declarados | 8.192 (entrenado a 1.024) | MIT | Hugging Face |
| iamtatsuki05/Llama-EN-0.5B-PT-stage1 | Llama (decoder) | 661M (530M sin embeddings) | no disponible | no disponible en la información | Hugging Face |
| ModernBERT-base (respuesta original de Answer.AI/LightOn) | ModernBERT | ~149M | 8.192 | Apache 2.0 | Hugging Face |
| ModernBERT-large (original) | ModernBERT | ~395M | 8.192 | Apache 2.0 | Hugging Face |

La comparación principal es con el checkpoint hermano de arquitectura Llama de la misma serie MIREI, entrenado con receta idéntica. Los ModernBERT originales de Answer.AI/LightOn son la referencia arquitectónica directa, con licencia Apache 2.0 y tamaños menores. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento en fase 1 (stage1), no un modelo instructivo ni listo para producción sin fine-tuning.
- Solo soporta inglés; no se declara capacidad multilingüe.
- El contexto de preentrenamiento es de 1.024 tokens, aunque la longitud máxima nominal sea 8.192; el rendimiento en secuencias largas puede degradarse.
- Discrepancia entre los parámetros declarados (679M/548M) y los reales en safetensors (810M): verificar al planificar memoria y despliegue.
- Riesgo de alucinación y sesgos presente como en cualquier modelo entrenado sobre fineweb-edu, con posible sobrerrepresentación de contenido educativo y sesgos de la web filtrada.
- No apto para generación de texto libre ni tareas conversacionales.
- Licencia MIT: permite uso comercial con atribución, pero conviene revisar las condiciones del dataset fineweb-edu para usos derivados.
- Sin benchmarks publicados, no es posible avalar su calidad frente a alternativas establecidas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/iamtatsuki05/ModernBERT-EN-0.5B-PT-stage1)
- [Colección MIREI](https://huggingface.co/collections/iamtatsuki05/mirei)
- [Repositorio GitHub MIREI](https://github.com/iamtatsuki05/MIREI)
- [Checkpoint hermano Llama-EN-0.5B-PT-stage1](https://huggingface.co/iamtatsuki05/Llama-EN-0.5B-PT-stage1)
- [Pesos iniciales ModernBERT-JP-0.5B-init](https://huggingface.co/iamtatsuki05/ModernBERT-JP-0.5B-init)
- [Dataset fineweb-edu](https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu)
- [Licencia MIT](https://opensource.org/license/mit/)

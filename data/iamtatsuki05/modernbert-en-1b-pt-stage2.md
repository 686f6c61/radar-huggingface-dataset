# iamtatsuki05/ModernBERT-EN-1B-PT-stage2

## Resumen

ModernBERT-EN-1B-PT-stage2 es un modelo de lenguaje tipo encoder basado en la arquitectura ModernBERT, desarrollado por el usuario iamtatsuki05 dentro del proyecto MIREI. Se trata de un checkpoint de preentrenamiento en dos fases (esta es la segunda) orientado a tareas de comprensión del lenguaje en inglés, con cabecera de masked language modeling (fill-mask). Con 1.487.924.736 parámetros reales y una ventana de contexto de 8.192 tokens, está pensado como columna vertebral (backbone) para fine-tuning posterior en clasificación, extracción de características o reranking.

El modelo continúa el entrenamiento desde iamtatsuki05/ModernBERT-EN-1B-PT-stage1 sobre el corpus google/wiki40b, observando aproximadamente 2.400 millones de tokens con ventanas de 8.192 tokens. Emplea embeddings de dimensión 1792, codificación posicional RoPE y un tokenizador SentencePiece con vocabulario de 102.400 entradas. Su relevancia radica en ser un encoder de escala 1B con contexto largo, una combinación poco frecuente en la familia BERT clásica, y en formar parte de un estudio comparativo encoder/decoder bajo condiciones de entrenamiento idénticas (publicado en NLP2026).

La licencia MIT y el formato safetensors facilitan su integración en pipelines de producción. No obstante, el modelo es exclusivamente inglés, no está instruido ni alineado con preferencias humanas, y su uso previsto es como base de preentrenamiento, no como asistente conversacional directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer con RoPE y atención local/global alternada) |
| Parametros totales | 1.487.924.736 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones oficiales; al ser safetensors bf16 es convertible a GGUF/8-bit mediante herramientas externas) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 3,0 GB) |
| Dimensión de embedding | 1792 |
| Tokenizador | SentencePiece, vocabulario de 102.400 |
| Codificación posicional | RoPE |
| Tarea de pipeline | fill-mask (masked LM) |
| Dataset de entrenamiento | google/wiki40b |
| Tokens observados | ~2,4 mil millones |
| Modelo base | iamtatsuki05/ModernBERT-EN-1B-PT-stage1 |
| Requisitos de librería | transformers>=4.51.0, accelerate>=1.6.0, sentencepiece>=0.2.0, flash-attn>=2.7.3 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ModernBERT, una revisión moderna del transformer encoder que incorpora RoPE en lugar de embeddings posicionales absolutos, alternancia de capas con atención local y global para extender el contexto de forma eficiente, y kernels optimizados para FlashAttention 2. La dimensión de embedding es 1792 y la longitud máxima de secuencia es 8.192 tokens, lo que lo sitúa muy por encima de los 512 tokens típicos de BERT-base. La cabeza de salida es de masked language modeling, con tokenizador SentencePiece de 102.400 entradas.

El entrenamiento se realizó en dos etapas: esta segunda fase parte del checkpoint stage1 y continúa el preentrenamiento sobre google/wiki40b, acumulando aproximadamente 2,4 mil millones de tokens vistos con ventanas de 8.192 tokens. No se documenta en la información disponible el uso de RLHF, DPO ni instrucción supervisada; se trata de un preentrenamiento puro de tipo masked LM. El proyecto MIREI compara esta receta con un modelo decoder (Llama-EN-1B-PT-stage2) bajo condiciones idénticas, lo que sugiere que el objetivo del autor es el análisis comparativo de arquitecturas para representaciones de frases.

## Capacidades

- Relleno de máscaras (fill-mask) y modelado de lenguaje enmascarado en inglés.
- Generación de representaciones contextuales de tokens y secuencias, aprovechables para extracción de embeddings.
- Comprensión de contexto largo: hasta 8.192 tokens por secuencia.
- Base para fine-tuning en clasificación de texto, NER, question answering extractivo y reranking.
- Soporte nativo de FlashAttention 2 y carga en bfloat16 con device_map automático.
- Capacidades multilingües: no disponibles; el modelo está entrenado únicamente en inglés.
- Tool calling / function calling: no disponible (no es un modelo generativo instruido).
- Razonamiento multi-paso y agentes: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Clasificación de documentos largos: con 8.192 tokens de contexto se pueden clasificar contratos, artículos o informes completos sin truncar, añadiendo una cabeza de clasificación y fine-tuning sobre datos propios.
- Reranking en sistemas RAG: el encoder puede puntuar pares consulta-pasaje para reordenar resultados de recuperación, aprovechando su contexto largo para pasajes extensos y su naturaleza bidireccional.
- Extracción de entidades y relaciones (NER/RE): fine-tuning sobre datasets anotados en inglés para pipelines de procesamiento documental, con la ventaja de capturar dependencias a larga distancia.
- Question answering extractivo: localización de respuestas dentro de contextos extensos (por ejemplo, documentación técnica o expedientes), usando la ventana de 8.192 tokens para incluir múltiples pasajes.
- Embeddings para búsqueda semántica: uso del estado oculto o pooling sobre las salidas del encoder para indexar y recuperar documentos en un motor vectorial.
- Detección de similitud y deduplicación de textos: comparación de documentos largos completos sin fragmentación, útil en curación de corpus y control de calidad de datos.
- Análisis de sentimiento a nivel de documento: clasificación de reseñas o tickets extensos en inglés con contexto completo.
- Base de investigación para estudios encoder vs. decoder: reproduce o extiende el análisis del proyecto MIREI sobre representaciones de frases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,0 GB solo para pesos (1,49B parámetros × 2 bytes), más activaciones que dependen de la longitud de secuencia; con 8.192 tokens las activaciones pueden añadir varios GB.
- VRAM estimada en 8-bit: alrededor de 1,5 GB de pesos; en 4-bit, alrededor de 0,8 GB, aunque estas cuantizaciones no están documentadas oficialmente por el autor.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y fine-tuning con secuencias largas; L40S o RTX 6000 Ada para inferencia de alta concurrencia.
- GPU de consumo: cabe en RTX 4090 (24 GB) e incluso en GPUs de 8-12 GB para inferencia con secuencias cortas y bf16/fp16; con 8.192 tokens conviene disponer de al menos 16 GB.
- Opciones de despliegue: transformers con accelerate y flash-attn 2 (soporte oficial); vLLM y TGI no están documentados para esta tarea fill-mask; llama.cpp/Ollama requerirían conversión a GGUF no oficial.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Idiomas |
|---|---|---|---|---|---|
| ModernBERT-EN-1B-PT-stage2 | 1,49B | 8.192 | ModernBERT (encoder) | MIT | inglés |
| iamtatsuki05/Llama-EN-1B-PT-stage2 | no disponible en la información | 8.192 (misma receta) | Llama (decoder) | no disponible | inglés |
| iamtatsuki05/ModernBERT-EN-1B-PT-stage1 | 1,49B (misma serie) | 8.192 | ModernBERT (encoder) | MIT | inglés |
| ModernBERT-base (referencia pública) | ~0,15B | 8.192 | ModernBERT (encoder) | Apache 2.0 | inglés/multilingüe según variante |

La comparación directa con modelos de terceros no está disponible en la información proporcionada; los únicos puntos de referencia documentados son los checkpoints de la misma serie MIREI.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: no soporta castellano ni otros idiomas de forma fiable.
- No es un modelo generativo instruido: no debe usarse como chatbot ni para seguir instrucciones; su salida es relleno de máscaras o representaciones.
- Riesgo de alucinación y predicciones plausibles pero incorrectas en fill-mask, especialmente con contextos ambiguos.
- Sesgos heredados de google/wiki40b, incluyendo sesgos de representación y sesgo de género en textos enciclopédicos.
- Solo ha visto aproximadamente 2,4B tokens, un volumen bajo para un modelo de 1,5B parámetros; el rendimiento en tareas downstream puede ser inferior al de encoders más entrenados.
- No hay benchmarks publicados que permitan estimar su calidad frente a alternativas consolidadas.
- Las cuantizaciones no están documentadas oficialmente; cualquier conversión a GGUF o 4/8-bit es responsabilidad del usuario y puede degradar la precisión.
- Aunque la licencia MIT permite uso comercial, la ausencia de evaluación y de garantías hace recomendable validar el modelo en el dominio concreto antes de producción.
- Requiere transformers>=4.51.0 y flash-attn>=2.7.3 para el flujo documentado; versiones anteriores pueden no cargar la arquitectura correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/ModernBERT-EN-1B-PT-stage2
- Modelo base (stage1): https://huggingface.co/iamtatsuki05/ModernBERT-EN-1B-PT-stage1
- Checkpoint decoder de la serie: https://huggingface.co/iamtatsuki05/Llama-EN-1B-PT-stage2
- Colección MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/google/wiki40b
- Licencia MIT: https://opensource.org/license/mit/
- Cita (NLP2026): https://huggingface.co/iamtatsuki05/ModernBERT-EN-1B-PT-stage2 (sección How to Cite de la model card)

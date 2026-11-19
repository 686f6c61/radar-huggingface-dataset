# iamtatsuki05/ModernBERT-JP-1B-PT-stage2

## Resumen
ModernBERT-JP-1B-PT-stage2 es un modelo encoder de tipo masked language model (fill-mask) desarrollado por iamtatsuki05 dentro del proyecto MIREI, orientado a tareas de comprensión del lenguaje en japones. Se trata de la segunda etapa de preentrenamiento de una familia de checkpoints que arranca en ModernBERT-JP-1B-PT-stage1 y que en esta fase observa aproximadamente 2.200 millones de tokens del corpus fujiki/wiki40b_ja con ventanas de contexto de 8.192 tokens.

La arquitectura es ModernBERT, con una dimensión de embedding de 1.792, codificación posicional RoPE y un tokenizador SentencePiece de 102.400 entradas de vocabulario. Con 1.487.924.736 parámetros totales (aproximadamente 1,5 mil millones) y un repositorio de 3,0 GB, el modelo se posiciona como un backbone encoder de tamaña medio-grande para japonés, alejado de los encoders pequeños tipo BERT-base y más cerca de los modelos de embedding y clasificación de gama alta.

Su relevancia actual radica en que cubre un hueco concreto: encoders japoneses con contexto largo (8.192 tokens) y licencia MIT, pensados como base para fine-tuning en clasificación, NER, reranking o extracción de representaciones. No es un modelo generativo ni un chat model; su pipeline declarado es fill-mask y su uso previsto es como base de preentrenamiento para tareas downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 1.487.924.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF/AWQ/GPTQ en la informacion) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 1.792 |
| Tokenizador | SentencePiece, vocabulario de 102.400 |
| Codificacion posicional | RoPE |
| Pipeline | fill-mask |
| Modelo base | iamtatsuki05/ModernBERT-JP-1B-PT-stage1 |
| Dataset de entrenamiento | fujiki/wiki40b_ja |
| Tamano del repositorio | 3,0 GB |
| Libreria | transformers (>= 4.51.0) |

## Arquitectura y entrenamiento
El modelo emplea la arquitectura ModernBERT, una evolución del transformer encoder clásico que incorpora mejoras de eficiencia como RoPE para la codificación posicional y soporte de atención con FlashAttention-2. La dimensión de embedding es de 1.792 y el tokenizador SentencePiece maneja un vocabulario de 102.400 tokens, lo que permite una tokenización razonablemente compacta del japonés, un idioma con alta densidad de información por carácter.

El preentrenamiento es de tipo masked language modeling (objetivo masked-lm) sobre el corpus fujiki/wiki40b_ja, con aproximadamente 2.200 millones de tokens observados y ventanas de 8.192 tokens. Esta es la etapa 2 de una receta que continúa desde el checkpoint stage1. La model card no detalla el número exacto de pasos, la composición interna del dataset más allá del nombre del corpus, ni si se aplicaron técnicas de RLHF/DPO (no aplicables a un encoder de este tipo). Tampoco se documentan innovaciones adicionales como decodificación especulativa, al no ser un modelo generativo.

## Capacidades
- Relleno de máscaras (fill-mask): predice el token enmascarado en una secuencia japonesa, tal como muestra el ejemplo de la model card.
- Extracción de representaciones contextuales: al ser un encoder, produce embeddings por token y por secuencia útiles para clasificación, NER, similitud semántica y reranking.
- Comprensión de contexto largo: ventana de 8.192 tokens, adecuada para documentos, artículos y conversaciones extensas en japonés.
- Procesamiento exclusivo de japonés: no se declara soporte multilingüe; el tag de idioma es únicamente `ja`.
- Base para fine-tuning: pensado como backbone para tareas downstream supervisadas.
- Tool calling / function calling: no disponible; no es una capacidad de este tipo de modelo.
- Agentes y razonamiento multi-paso: no disponible; el modelo no genera texto de forma autoregresiva.
- Modo thinking, visión o audio: no disponible.

## Casos de uso
- Clasificación de documentos japoneses: se puede añadir una cabeza de clasificación sobre el encoder y fine-tunear con textos de hasta 8.192 tokens, útil para categorización de noticias, contratos o tickets de soporte en japonés.
- Reconocimiento de entidades nombradas (NER): el modelo sirve como backbone para etiquetado de secuencias en dominios como legal, médico o financiero en japonés, aprovechando su contexto largo para resolver entidades que dependen de menciones lejanas.
- Reranking en búsqueda semántica: usando las representaciones del encoder se puede construir un reranker para un pipeline RAG sobre corpus japoneses, donde el contexto de 8.192 tokens permite puntuar pasajes largos sin truncar.
- Extracción de embeddings para similitud y clustering: las representaciones del modelo permiten agrupar documentos o detectar duplicados en japonés; requiere una capa de pooling y, probablemente, fine-tuning con objetivos contrastivos.
- Moderación de contenido y detección de toxicidad: fine-tuning con una cabeza de clasificación sobre el encoder para filtrar comentarios o publicaciones en japonés, con la ventaja de procesar hilos completos en una sola pasada.
- Análisis de sentimiento y opinión: clasificación a nivel de documento o de aspecto sobre reseñas y encuestas japonesas, aprovechando la ventana larga para capturar el contexto completo del texto.
- Preentrenamiento continuado y dominio específico: al estar bajo licencia MIT, se puede continuar el preentrenamiento con corpus propietarios japoneses (por ejemplo, documentación interna) y reutilizar el checkpoint como base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3 GB solo para pesos (1,49 mil millones de parámetros × 2 bytes), más memoria para activaciones y atención; en la práctica, entre 4 y 8 GB según longitud de secuencia y batch.
- VRAM estimada en fp32: aproximadamente 6 GB solo para pesos.
- GPU recomendadas: A100, H100 o L40S para entrenamiento y fine-tuning con secuencias de 8.192 tokens; RTX 4090 o RTX 3090 para inferencia y fine-tuning ligero con batch pequeño.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) para inferencia; el fine-tuning completo requiere más memoria o técnicas de ahorro como gradient checkpointing o LoRA.
- Opciones de despliegue: transformers con `AutoModelForMaskedLM` (versión >= 4.51.0), accelerate >= 1.6.0, sentencepiece >= 0.2.0 y flash-attn >= 2.7.3. No se documentan variantes GGUF ni compatibilidad con llama.cpp u Ollama; para servir en producción se puede usar un servidor basado en transformers o TGI si se convierte el modelo, aunque no está confirmado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModernBERT-JP-1B-PT-stage2 | ModernBERT | 1.487.924.736 | 8.192 | MIT | Hugging Face (transformers) |
| iamtatsuki05/Llama-JP-1B-PT-stage2 | Llama (decoder) | no disponible | no disponible | no disponible | Hugging Face |
| iamtatsuki05/ModernBERT-JP-1B-PT-stage1 | ModernBERT | no disponible | no disponible | no disponible | Hugging Face |

La comparativa con encoders japoneses de referencia (por ejemplo, modelos BERT japonés de terceros) no está disponible en la información proporcionada; no se dispone de datos de rendimiento ni de especificaciones de esos modelos en esta ficha.

## Limitaciones y advertencias
- Modelo exclusivamente japonés: no se declara ni se garantiza un comportamiento correcto en otros idiomas.
- No es un modelo generativo: no puede usarse para chat, generación de texto libre ni agentes; su pipeline es fill-mask y su uso natural es como encoder.
- Riesgo de sesgos: al entrenarse sobre wiki40b_ja, hereda los sesgos y la cobertura temática de Wikipedia en japonés, con posibles desequilibrios en dominios especializados.
- Riesgo de alucinación: bajo en el sentido generativo, pero las predicciones de fill-mask pueden ser incorrectas o poco calibradas fuera del dominio de entrenamiento.
- Modelo de preentrenamiento: no está ajustado para tareas concretas; su rendimiento en clasificación o NER depende del fine-tuning posterior.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las condiciones del corpus de entrenamiento (wiki40b_ja) y citar el trabajo según indica la model card.
- Requisitos de versión: necesita transformers >= 4.51.0 y, para FlashAttention-2, flash-attn >= 2.7.3; versiones anteriores pueden no cargar el modelo correctamente.
- Sin datos de benchmarks: no hay evidencia publicada de rendimiento comparado, lo que dificulta evaluar su calidad frente a alternativas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/ModernBERT-JP-1B-PT-stage2
- Modelo base (stage1): https://huggingface.co/iamtatsuki05/ModernBERT-JP-1B-PT-stage1
- Checkpoint hermano Llama-JP-1B-PT-stage2: https://huggingface.co/iamtatsuki05/Llama-JP-1B-PT-stage2
- Colección MIREI en Hugging Face: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub del proyecto MIREI: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/fujiki/wiki40b_ja
- Licencia MIT: https://opensource.org/license/mit/

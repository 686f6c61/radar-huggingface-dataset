# iamtatsuki05/ModernBERT-JP-1B-init

## Resumen

ModernBERT-JP-1B-init es un checkpoint de ModernBERT inicializado aleatoriamente por el autor iamtatsuki05, construido a partir de la configuración publicada en `iamtatsuki05/ModernBERT-JP-1B-settings` y dimensionado para coincidir con el modelo `sbintuitions/sarashina2.2-1b`. No es un modelo entrenado ni utilizable para inferencia real: es un punto de partida para preentrenamiento, es decir, una arquitectura con pesos aleatorios lista para iniciar un ciclo de entrenamiento con masked language modeling (MLM).

El modelo emplea la arquitectura ModernBERT, un transformer encoder con codificación posicional rotatoria (RoPE), atención con soporte para FlashAttention 2 y una longitud máxima de secuencia de 8.192 tokens. Cuenta con 1.304 millones de parámetros totales (1.120 millones sin contar embeddings) y una dimensión de embedding de 1.792. El tokenizador es SentencePiece con un vocabulario de 102.400 tokens, compartido con la familia sarashina2.2 de SB Intuitions.

Su relevancia es metodológica: forma parte de la serie MIREI, que investiga el rendimiento de arquitecturas encoder frente a decoder en condiciones controladas para embeddings de frases en japonés. El checkpoint permite reproducir experimentos de preentrenamiento desde cero con una configuración idéntica a la de un modelo decoder de tamaño comparable (Llama-JP-1B-init), lo que facilita comparaciones justas entre arquitecturas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | 1.304.423.936 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 1.792 |
| Tokenizador | SentencePiece, vocabulario de 102.400 |
| Codificacion posicional | RoPE |
| Parametros sin embeddings | 1.120M |
| Tamano del repo | 2,6 GB |

## Arquitectura y entrenamiento

ModernBERT es una evolución del transformer encoder de BERT que incorpora mejoras propias de los transformers modernos: codificación posicional RoPE en lugar de embeddings posicionales aprendidos, atención con soporte para FlashAttention 2 y una ventana de contexto ampliada hasta 8.192 tokens. El modelo aquí presentado sigue esa arquitectura con una dimensión de embedding de 1.792 y un vocabulario de 102.400 tokens procedente del tokenizador SentencePiece de sarashina2.2.

Este checkpoint concreto no ha sido entrenado: los pesos son aleatorios, tal y como indica el autor en la model card ("randomly initialized ModernBERT checkpoint... a starting point for pre-training, not a usable model"). No hay información disponible sobre número de tokens de entrenamiento, composición del dataset, ni sobre fases de RLHF o DPO, porque no se ha ejecutado ningún entrenamiento. La única innovación técnica destacable es la propia configuración de ModernBERT y la alineación de tamaño con sarashina2.2-1b para permitir comparaciones controladas entre arquitecturas encoder y decoder dentro del proyecto MIREI.

## Capacidades

- No dispone de capacidades funcionales: al tener pesos aleatorios, no genera texto coherente, no razona, no escribe código ni resuelve problemas matemáticos.
- La cabecera es de masked language modeling (fill-mask), por lo que su uso previsto tras el entrenamiento sería la predicción de tokens enmascarados.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al japonés por diseño del tokenizador y del corpus previsto.
- No incluye modo thinking, visión ni audio.
- Tras un preentrenamiento adecuado, estaría orientado a tareas de representación y comprensión del japonés (embeddings de frases, clasificación, extracción de información), no a generación.

## Casos de uso

- Preentrenamiento desde cero de un encoder japonés: el checkpoint sirve como inicialización para entrenar un modelo MLM con corpus japoneses, aprovechando la configuración ModernBERT y el tokenizador de 102.400 tokens.
- Investigación comparativa encoder vs. decoder: permite entrenar en condiciones idénticas a `Llama-JP-1B-init` y comparar el rendimiento en embeddings de frases, que es el objetivo declarado del artículo MIREI.
- Reproducibilidad de experimentos académicos: al fijar arquitectura, tamaño y tokenizador, facilita la replicación de resultados entre grupos de investigación.
- Base para modelos de embeddings japoneses: tras el preentrenamiento, podría afinarse para búsqueda semántica o similitud de frases en japonés con contexto de hasta 8.192 tokens.
- Clasificación de documentos largos en japonés: la ventana de 8.192 tokens permitiría, una vez entrenado, procesar contratos o informes extensos sin truncamiento agresivo.
- Desarrollo de pipelines de NLP japonés con licencia permisiva: la licencia MIT facilita su integración en productos comerciales una vez entrenado, sin las restricciones de otras licencias de modelos japoneses.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no ha sido entrenado, por lo que no existen métricas de rendimiento que reportar.

## Requisitos de hardware

- VRAM estimada para inferencia: al no ser un modelo entrenado, la inferencia no es significativa; a título orientativo, 1.304M parámetros en bfloat16 requieren aproximadamente 2,6 GB de VRAM solo para pesos.
- Entrenamiento: el preentrenamiento completo requiere hardware de datacenter; con 1.304M parámetros y contexto de 8.192 tokens, se recomienda como mínimo una GPU A100 de 40 GB o H100 de 80 GB, y varias GPU para lotes efectivos razonables.
- GPU de consumo: una RTX 4090 (24 GB) podría alojar los pesos en bfloat16 para pruebas de forward pass, pero no es suficiente para un preentrenamiento realista.
- Opciones de despliegue: transformers con accelerate y FlashAttention 2 (versiones mínimas indicadas por el autor: transformers>=4.51.0, accelerate>=1.6.0, sentencepiece>=0.2.0, flash-attn>=2.7.3).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| ModernBERT-JP-1B-init | ModernBERT (encoder) | 1.304M | 8.192 | MIT | Pesos aleatorios, sin entrenar |
| Llama-JP-1B-init | Llama (decoder) | 1.224M | no disponible | no disponible | Pesos aleatorios, sin entrenar |
| sbintuitions/sarashina2.2-1b | Decoder | ~1B | no disponible | no disponible | Modelo entrenado de referencia de tamano |

La comparación relevante es de configuración, no de rendimiento: los tres modelos comparten escala (~1B parámetros) y el tokenizador sarashina2.2, lo que permite aislar el efecto de la arquitectura en experimentos controlados.

## Limitaciones y advertencias

- El modelo no está entrenado: sus salidas son ruido y no debe usarse en producción ni para inferencia real.
- Riesgo de alucinación total: al carecer de entrenamiento, cualquier texto generado es aleatorio.
- Sesgos: no evaluables, ya que no ha visto datos; los sesgos dependerán del corpus que se use en el preentrenamiento.
- Limitación de idioma: diseñado exclusivamente para japonés; el tokenizador y el corpus previsto no cubren otros idiomas.
- Licencia MIT: permisiva para uso comercial, pero el usuario asume la responsabilidad del entrenamiento y de los datos utilizados.
- Caveat de producción: requiere un ciclo completo de preentrenamiento y evaluación antes de cualquier uso; el checkpoint por sí solo no aporta valor funcional.

## Enlaces

- Hugging Face: https://huggingface.co/iamtatsuki05/ModernBERT-JP-1B-init
- Configuración base: https://huggingface.co/iamtatsuki05/ModernBERT-JP-1B-settings
- Modelo de referencia de tamaño: https://huggingface.co/sbintuitions/sarashina2.2-1b
- Checkpoint decoder comparable: https://huggingface.co/iamtatsuki05/Llama-JP-1B-init
- Colección MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Colección del tokenizador sarashina2.2: https://huggingface.co/collections/sbintuitions/sarashina22
- Licencia MIT: https://opensource.org/license/mit/

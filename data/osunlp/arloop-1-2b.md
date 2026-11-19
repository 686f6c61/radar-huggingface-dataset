# osunlp/ARLoop-1.2B

## Resumen

ARLoop-1.2B es un modelo de lenguaje base preentrenado desarrollado por el grupo OSU-NLP (Ohio State University), presentado como un transformer con bucles ("looped transformer") y residuales de atención, completamente abierto. Se distribuye en Hugging Face bajo licencia Apache 2.0 e incluye los checkpoints de una ejecución de entrenamiento de 500.000 millones de tokens. El modelo tiene 1.208.655.360 parámetros totales y una longitud de contexto de 4096 tokens.

La particularidad arquitectónica es que sus 24 capas físicas del transformer se comparten a través de 3 pasadas recurrentes, lo que da una profundidad efectiva de 72 capas sin incrementar el número de parámetros. Esto lo sitúa en la línea de investigación de los transformers recurrentes o con bucles, que buscan aumentar la capacidad de cómputo por parámetro sin escalar el tamaño del modelo.

Es relevante ahora porque se publica como un modelo totalmente abierto (pesos, paper y código), con 23 checkpoints intermedios programados a lo largo del entrenamiento, lo que facilita su uso para experimentación en mid-training y post-training, así como el estudio de dinámicas de entrenamiento en arquitecturas recurrentes. Es un modelo base orientado a completado de texto, no un modelo ajustado para instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer) y residuales de atención; 24 capas físicas compartidas en 3 pasadas recurrentes (profundidad efectiva 72) |
| Parametros totales | 1.208.655.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (los pesos se cargan en BF16 para inferencia; el checkpoint almacena pesos originales en FP32) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache License 2.0 |
| Formato de pesos | safetensors (con custom_code, requiere trust_remote_code) |

## Arquitectura y entrenamiento

ARLoop es un transformer con bucles: 24 capas físicas que se reutilizan en 3 pasadas recurrentes, resultando en una profundidad efectiva de 72 capas. La anchura oculta es de 2048 y la intermedia del MLP de 5632, con 16 cabezas de atención y 4 cabezas KV. Usa RoPE con base 50000 y un tamaño de bloque de residuales de atención de 24 sublayers, con 3 bloques residuales recientes y la embedding de entrada retenida. Los value embeddings se comparten entre capas físicas alternas. El vocabulario del tokenizer es de 49152, usando el tokenizer de SmolLM2 durante el entrenamiento, y la cabeza de salida está atada a las embeddings de tokens.

El entrenamiento se realizó sobre 500.000 millones de tokens (499.996.688.384 exactos en el paso final 238.417), con 23 checkpoints intermedios programados desde el paso 10.000 (20.971.520.000 tokens) hasta el 230.000 (482.344.960.000 tokens). No se especifican en la información disponible detalles sobre la composición del dataset, el uso de RLHF/DPO ni innovaciones adicionales como decodificación especulativa. El modelo se distribuye como base pretrained, sin ajuste por instrucciones.

## Capacidades

- Generación de texto y completado de texto en inglés, al ser un modelo base pretrained.
- Razonamiento y conocimiento general derivado del preentrenamiento (no verificado con benchmarks en la información disponible).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Adecuado como punto de partida para mid-training y post-training (por ejemplo, SFT o DPO posteriores).

## Casos de uso

- Investigación en arquitecturas recurrentes: el modelo permite estudiar cómo afectan los bucles y los residuales de atención al rendimiento por parámetro, comparándolo con transformers estándar de tamaño similar.
- Mid-training y post-training: al ser un base pretrained con checkpoints intermedios, se puede continuar el entrenamiento con datos de dominio específico o aplicar SFT/DPO para tareas concretas.
- Completado de texto en inglés para prototipos: útil para generar continuaciones en aplicaciones de escritura asistida o autocompletado dentro de pipelines de investigación.
- Estudio de dinámicas de entrenamiento: los 23 checkpoints intermedios (de 10k a 230k pasos) permiten analizar la evolución del modelo a lo largo del entrenamiento y realizar ablaciones.
- Evaluación comparativa de eficiencia: al tener profundidad efectiva 72 con solo 24 capas físicas, sirve para medir el equilibrio entre coste computacional y calidad en entornos de investigación.
- Base para experimentos de cuantización y despliegue: con 1.2B parámetros, es manejable en GPUs de consumo para probar técnicas de compresión y serving.
- Generación de texto en entornos con recursos limitados: su tamaño permite ejecución en hardware modesto, aunque con contexto de 4096 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia una figura de resultados (assets/figure1.png) y el paper arXiv:2611.05234, pero no se incluyen cifras numéricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 2,4 GB solo para pesos (1.208.655.360 parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, alrededor de 3-4 GB para contexto corto.
- VRAM estimada en FP32: aproximadamente 4,8 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16; A100, H100 o RTX 4090 para mayor throughput y contextos largos.
- Cabe en GPUs de consumo: sí, en tarjetas con 8 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090).
- Opciones de despliegue: transformers (versión 5.12.1 según la model card) con trust_remote_code y accelerate; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la información proporcionada. A continuación se comparan características estructurales con alternativas de tamaño similar, indicando "no disponible" donde no hay datos.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Idiomas |
|---|---|---|---|---|---|
| ARLoop-1.2B | 1,2B | 4096 | Looped transformer con residuales de atención | Apache 2.0 | en |
| SmolLM2 (1.7B) | 1,7B | no disponible en esta ficha | Transformer estándar | Apache 2.0 | en (principalmente) |
| Qwen2.5-1.5B | 1,5B | no disponible en esta ficha | Transformer estándar | Apache 2.0 | multilingüe |
| TinyLlama-1.1B | 1,1B | 2048 | Transformer estándar | Apache 2.0 | en |

Nota: los datos de los modelos comparables no provienen de la información proporcionada y deben verificarse en sus respectivas model cards; el rendimiento comparativo no está disponible.

## Limitaciones y advertencias

- Es un modelo base pretrained: no está ajustado para seguir instrucciones ni para diálogo; su uso directo produce completados, no respuestas.
- Solo soporta inglés según la model card; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación y de generar contenido sesgado o inexacto, inherente a los modelos de lenguaje preentrenados.
- Longitud de contexto limitada a 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Requiere trust_remote_code=True y una versión específica de transformers (5.12.1), lo que añade riesgo de compatibilidad y de ejecución de código personalizado.
- El repositorio ocupa 116 GB debido a los múltiples checkpoints; el almacenamiento necesario es elevado.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin ajuste, su utilidad en producción requiere trabajo adicional de post-training y evaluación.
- No se documentan evaluaciones de seguridad, sesgos ni robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/osunlp/ARLoop-1.2B
- Paper: https://arxiv.org/abs/2611.05234
- Código: https://github.com/OSU-NLP-Group/ARLoop
- Checkpoint final: https://huggingface.co/osunlp/ARLoop-1.2B/tree/main
- Checkpoint step-238417: https://huggingface.co/osunlp/ARLoop-1.2B/tree/step-238417
- Checkpoint step-010000: https://huggingface.co/osunlp/ARLoop-1.2B/tree/step-010000
- Checkpoint step-230000: https://huggingface.co/osunlp/ARLoop-1.2B/tree/step-230000

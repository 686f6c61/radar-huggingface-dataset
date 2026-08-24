# neosantara/wader-100m-base

## Resumen

Wader-100M-Base es un modelo de lenguaje de aproximadamente 110 millones de parámetros desarrollado por Neosantara, orientado al indonesio coloquial y conversacional, incluyendo slang. Su principal atractivo es que adopta la arquitectura DeepSeek-V4, una variante reciente que combina atención latente multi-cabeza (MLA), mezcla de expertos (MoE) y conexiones hiper (hyper-connections). Esta arquitectura permite que un modelo relativamente pequeño incorpore técnicas de eficiencia pensadas para modelos mucho mayores.

El modelo está entrenado para generar texto en indonesio, con un vocabulario de 129.280 tokens y una longitud de contexto de 2.048 tokens. Su licencia MIT permite uso comercial sin restricciones, y su pequeño tamaño lo hace ejecutable en hardware modesto, incluso en CPU. Es relevante ahora porque demuestra que las arquitecturas de vanguardia pueden escalar hacia abajo, y porque ofrece una opción ligera para aplicaciones conversacionales en indonesio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-V4 (Transformer causal con MLA, MoE y hyper-connections) |
| Parametros totales | 110.369.621 (41M de embeddings + 69M no-embeddings) |
| Parametros activos | no disponible (MoE con top-2 routing sobre 4 expertos enrutados + 1 compartido) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Indonesio (id) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura basada en DeepSeek-V4, que combina varias innovaciones. La atención es de tipo Multi-Head Latent Attention (MLA) con 8 cabezas, 1 cabeza KV (equivalente a MQA), una dimensión de cabeza de 96 (32 para RoPE y 64 sin posicional) y un rango de LoRA para consultas de 160. El bloque de mezcla de expertos (MoE) contiene 4 expertos enrutados y 1 experto compartido, con enrutamiento top-2 y FFN SwiGLU de dimensión 640. Además, usa hyper-connections con un factor de multiplicación de 4 y enrutamiento Sinkhorn con 2 iteraciones.

No se ha publicado información detallada sobre el conjunto de datos de entrenamiento, ni el número de tokens ni el proceso de alineación (RLHF/DPO). En la página de Hugging Face se citan los datasets `indonesian-nlp/eli5_id` y `w11wo/twitter_indonesia_sarcastic` como posibles fuentes, lo que sugiere que el entrenamiento se centró en texto conversacional y sarcástico en indonesio. El modelo se presenta como base, sin instrucciones explícitas de chat.

## Capacidades

- Generación de texto causal en indonesio, incluyendo registro coloquial y slang.
- Conversación multi-turno básica gracias a su ventana de 2.048 tokens.
- Comprensión de matices sarcásticos y de estilo informal, probablemente reforzada por el dataset `twitter_indonesia_sarcastic`.
- Generación de respuestas con `do_sample` y temperatura ajustable para control de creatividad.
- No incluye soporte explícito para tool calling, function calling, agentes o razonamiento multi-paso.
- No tiene capacidades multimodales (solo texto).
- Requiere `trust_remote_code=True` para cargarse en Transformers, ya que usa código personalizado.

## Casos de uso

- Chatbot de atención al cliente en indonesio: el modelo puede gestionar conversaciones sencillas de soporte en indonesio informal, resolviendo dudas frecuentes con respuestas naturales. Su tamaño permite desplegarlo en servidores modestos y en tiempo real.
- Generación de respuestas en redes sociales: gracias a su entrenamiento con datos de Twitter, puede producir réplicas sarcásticas o coloquiales adecuadas para interacciones en redes, moderación de comentarios o generación de contenido social.
- Asistente de escritura informal: ayuda a redactar mensajes, correos o publicaciones en indonesio coloquial, con corrección de estilo y adaptación al registro informal.
- Etiquetado y clasificación de texto informal: aunque no está entrenado para clasificación, su representación del lenguaje puede usarse como base para tareas de análisis de sentimiento o detección de sarcasmo en indonesio, mediante fine-tuning.
- Generación de datos sintéticos para entrenar modelos más grandes: sirve como generador de texto indonesio conversacional para aumentar datasets o crear ejemplos de entrenamiento.
- Aplicaciones educativas de aprendizaje de idioma: puede simular conversaciones informales en indonesio para practicar, ayudando a estudiantes a familiarizarse con el slang y expresiones cotidianas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar.

## Requisitos de hardware

- VRAM estimada: alrededor de 0,4 GB (según el tamaño del repositorio), lo que permite inferencia en GPU con menos de 1 GB de memoria, incluso en tarjetas de gama de entrada.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 3060, etc.). También es ejecutable en CPU con memoria suficiente (≈ 0,4 GB de RAM).
- No requiere hardware especializado; puede correr en equipos de consumo.
- Opciones de despliegue: el modelo se carga con Transformers (usando `trust_remote_code=True`). No se menciona compatibilidad con vLLM, llama.cpp u Ollama, aunque al ser un modelo pequeño podría adaptarse, pero no está documentado.
- Latencia y throughput: no disponible, pero al ser de 110M parámetros, la inferencia es muy rápida en cualquier GPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. En la categoría de modelos pequeños para indonesio, existen alternativas como modelos basados en GPT-2 o Llama-2 mini, pero no se han encontrado datos concretos de comparación en la búsqueda.

## Limitaciones y advertencias

- Contexto limitado a 2.048 tokens, lo que restringe conversaciones o documentos largos.
- Entrenado principalmente con indonesio coloquial y sarcástico; puede no funcionar bien con registros formales o técnicos.
- No se ha realizado un ajuste fino con RLHF/DPO, por lo que puede generar respuestas incoherentes o alucinaciones.
- No se especifican sesgos conocidos, pero al estar entrenado con datos de Twitter, puede reflejar sesgos de la plataforma.
- Licencia MIT permite uso comercial sin restricciones, pero se recomienda validar el comportamiento en producción.
- Requiere código personalizado (`trust_remote_code=True`), lo que implica confiar en el código del autor; se debe revisar antes de usar en entornos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neosantara/wader-100m-base
- Modelo de la serie Wader (sin base): https://huggingface.co/neosantara/wader-100m
- Explorador de LLM (ficha): https://llm-explorer.com/model/neosantara%2Fwader-100m-base,LcCFC8KTg6IMcRUFZrUKi
- Documentación de modelos de Neosantara: https://docs.neosantara.xyz/en/models-overview
- Web de Neosantara: https://www.neosantara.xyz/en

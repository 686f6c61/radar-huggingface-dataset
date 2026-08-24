# j0no12/Titan-86M-experimental

## Resumen

Titan-86M es un modelo encoder-decoder de pequeño tamaño (85,6 millones de parámetros) desarrollado por j0no12, especializado en la generación de títulos para conversaciones de chat. Su tarea principal consiste en transformar el primer mensaje de un usuario en un título corto y descriptivo, siguiendo el marco de evaluación TitleBench. El modelo se entrenó desde cero en un Apple M5 Max utilizando MLX, con una arquitectura personalizada que combina un encoder bidireccional profundo de 20 capas con un decoder autoregresivo superficial de 6 capas, empleando técnicas modernas como GQA, RoPE, SwiGLU y RMSNorm.

La relevancia de este modelo radica en su enfoque específico para una tarea concreta de NLP, ofreciendo una alternativa ligera y eficiente para sistemas que necesitan etiquetar o organizar conversaciones automáticamente. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su tamaño reducido lo hace adecuado para entornos con recursos limitados. Aunque el modelo está etiquetado como multilingüe, los datos de entrenamiento provienen principalmente de conversaciones en inglés, por lo que su rendimiento en otros idiomas puede ser limitado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder (20 capas encoder, 6 capas decoder, d=512, GQA 8q/2kv, RoPE, SwiGLU, RMSNorm, embeddings atados) |
| Parametros totales | 85.621.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantización declarada) |
| Idiomas soportados | Inglés (principal), etiquetado como multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también compatible con MLX) |

## Arquitectura y entrenamiento

Titan-86M utiliza una arquitectura encoder-decoder asimétrica: un encoder bidireccional de 20 capas procesa el mensaje del usuario, mientras que un decoder autoregresivo de 6 capas genera el título. La dimensión del modelo es de 512, con atención multi-consulta (GQA) usando 8 cabezas de consulta y 2 de clave/valor, junto con RoPE (rotary position embeddings), SwiGLU como función de activación y RMSNorm para normalización. Los embeddings están atados entre encoder y decoder, lo que reduce el número de parámetros.

El entrenamiento se realizó en dos fases. Primero, un pretrain interleaved que combina corrupción de span estilo MASS (con aproximadamente 15% de máscara y un único token `<mask>`) sobre las conversaciones de lmsys-chat-1m, junto con pares de chat-título reales que se sobremuestrearon ×2 (constituyendo ~45% de los batches). Después, un finetune exclusivo con títulos usando una tasa de aprendizaje de 8e-5 con decaimiento coseno. Los datos provienen de múltiples fuentes: j0no12/chat-titles-unified (223.853 pares), BananaMind-Chat-Title-200K reconstruido localmente (127.335 pares), y títulos auto-destilados de BananaMind-Title-1.0 (248.132 mensajes). Se aplicó un control de leakage estricto, excluyendo todas las entradas de TitleBench y deduplicando por clave normalizada.

## Capacidades

- Generación de títulos de chat: transforma el primer mensaje de un usuario en un título corto (máximo 32 tokens) con decodificación greedy, longitud mínima de 3 tokens y sin repetición de n-gramas.
- Procesamiento de texto en inglés: entrenado principalmente con conversaciones en inglés, aunque el tag indica soporte multilingüe (no verificado).
- Integración con MLX: el modelo se entrenó y puede ejecutarse en Apple Silicon mediante MLX, además de ser compatible con la librería transformers.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de visión o audio.
- No se han documentado capacidades de generación de texto general más allá de la tarea específica de títulos.

## Casos de uso

- Organización automática de chats en aplicaciones de mensajería: el modelo puede generar títulos descriptivos para cada conversación, facilitando la búsqueda y navegación en aplicaciones como Slack, Discord o sistemas de tickets.
- Etiquetado de hilos en foros y comunidades: al recibir el primer mensaje de un hilo, Titan-86M puede sugerir un título apropiado, reduciendo el trabajo manual de moderadores.
- Preprocesamiento de datos para sistemas de análisis: en pipelines de NLP, el modelo puede generar metadatos de títulos para clasificar o indexar grandes volúmenes de conversaciones de soporte.
- Mejora de la experiencia en chatbots: al inicio de una interacción, el modelo puede generar un resumen titular que se muestra al usuario para confirmar el tema de la conversación.
- Generación de títulos para correos electrónicos o mensajes largos: aunque no está entrenado específicamente para ello, su capacidad de resumir el primer mensaje puede adaptarse a otros dominios con fine-tuning.
- Automatización de documentación en equipos de desarrollo: a partir de mensajes de commit o issues, el modelo puede sugerir títulos concisos para tickets o entradas de changelog.

## Benchmarks y rendimiento

El modelo fue evaluado en el conjunto completo de TitleBench (21.448 filas) con el scorer oficial, usando decodificación greedy con min_len=3 y no_repeat_ngram=1. Los resultados son los siguientes:

| Metrica | Valor |
|---|---|
| ROUGE-1 | 0.152 |
| ROUGE-2 | 0.025 |
| ROUGE-L | 0.151 |
| chrF | 0.082 |
| BLEU-4 | 0.284 |
| EM% | No disponible |
| Repet% | No disponible |

No se han publicado comparativas con otros modelos de generación de títulos en la información disponible.

## Requisitos de hardware

- Al tratarse de un modelo de 85,6 millones de parámetros, su huella de memoria es reducida: aproximadamente 342 MB en FP32, 171 MB en FP16 y 86 MB en int8 (estimación teórica, no confirmada por el autor).
- Es adecuado para GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como para Apple Silicon con MLX (el entrenamiento se realizó en un Apple M5 Max).
- No se han proporcionado requisitos oficiales de VRAM ni datos de latencia o throughput.
- Opciones de despliegue: la librería transformers permite cargar el modelo directamente; también es compatible con MLX para dispositivos Apple. No se menciona soporte para vLLM, llama.cpp u Ollama, aunque por su tamaño podría adaptarse.
- Para producción, se recomienda cuantizar el modelo (por ejemplo, a int8) para reducir aún más los requisitos de memoria, aunque no se han publicado guías oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (generación de títulos de chat con encoder-decoder pequeño). El autor no ha publicado comparativas con alternativas como LFM2.5-350M (usado como teacher) u otros modelos de titulación. Por tanto, no es posible realizar una comparación objetiva con datos verificados.

## Limitaciones y advertencias

- Sesgos: los datos de entrenamiento provienen de lmsys-chat-1m, que contiene conversaciones reales de usuarios y puede reflejar sesgos lingüísticos o temáticos presentes en ese corpus.
- Riesgo de alucinación: al ser un modelo generativo, puede producir títulos que no reflejen fielmente el contenido del mensaje, especialmente en entradas fuera de distribución.
- Limitaciones de idioma: aunque está etiquetado como multilingüe, el entrenamiento se realizó casi exclusivamente con datos en inglés; el rendimiento en otros idiomas no está verificado y probablemente sea deficiente.
- Contexto limitado: no se especifica la longitud máxima de contexto, pero dado el tamaño del modelo y su tarea (primer mensaje), es probable que no maneje entradas muy largas.
- Dependencia de datos sintéticos: parte del entrenamiento utilizó títulos auto-destilados de un modelo teacher, lo que puede introducir errores propagados.
- Licencia: Apache 2.0 permite uso comercial, pero los datos derivados de lmsys-chat-1m están sujetos a los términos de ese dataset (gated), por lo que se debe verificar el cumplimiento de sus condiciones.
- El modelo está especializado únicamente en generación de títulos; no es adecuado para tareas generales de generación de texto o razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/j0no12/Titan-86M-experimental
- Perfil del autor: https://huggingface.co/j0no12
- Datasets del autor: https://huggingface.co/j0no12/datasets
- No se han encontrado papers, repositorios de código adicionales ni demos en la información disponible.

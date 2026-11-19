# KucLab/Censer.3

## Resumen

Censer.3 es un clasificador binario de seguridad de contenido para texto en inglés, desarrollado por KucLab. Se trata de un transformer decoder-only de 14,4 millones de parámetros entrenado desde cero (no es un encoder fine-tuneado ni un envoltorio de API), con una arquitectura `LlamaForSequenceClassification` estándar que se carga directamente con `transformers` sin necesidad de `trust_remote_code`. Su tarea es etiquetar una entrada como `safe` o `unsafe` emitiendo un único token de respuesta, sin generación de texto libre.

El modelo destaca por su tamaño extremadamente reducido (checkpoint de 55 MB en safetensors, 29,4 MB en fp32) y su velocidad: 1,67 ms por texto en una AMD Radeon RX 9060 XT, con un throughput de 599 textos/s en modo individual y 4.119 textos/s en lotes de 8, y un pico de VRAM de solo 85,7 MB. Esto lo hace adecuado para moderación de contenido de baja latencia en CPU o GPU consumer, donde los clasificadores basados en LLM resultan sobredimensionados.

La relevancia actual reside en la demanda de filtros de seguridad ligeros y desplegables en el borde (edge) para pipelines de moderación, pre-filtrado de datasets y guardarraíles de aplicaciones conversacionales. Censer.3 es la tercera iteración de la familia, con una progresión declarada de precisión en un conjunto de prueba manual de 97 casos: 75,3% (Censer.1) → 91,8% (Censer.2) → 100% (Censer.3).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlamaForSequenceClassification` (decoder-only transformer, transformers estándar) |
| Parametros totales | 14.423.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 320 tokens (entrada truncada a 500 caracteres) |
| Tipos de cuantizacion | no disponible (checkpoint fp32; tamaño de 4,26 MB reportado en benchmark, sin detalle de esquema) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), config.json, tokenizer.json |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 8 capas, dimensión de modelo 320, 8 cabezas de atención y dimensión de feed-forward 1280. Emplea normalización RMSNorm con pre-norm (eps 1e-5), activación SwiGLU en el MLP, embeddings posicionales rotatorios (RoPE con theta 10000) y un tokenizador BPE a nivel de byte con vocabulario de 4096 tokens entrenado sobre el propio corpus. La cabeza de clasificación es una capa lineal `score` que reutiliza las filas de embedding de los tokens de respuesta `0`/`1`, de modo que el modelo predice un único token y nunca genera texto libre. El template de prompt (`[BOS][USER] <texto> [ASSISTANT]`) está integrado en el post-procesador del tokenizador.

El entrenamiento se realizó desde cero sobre un corpus compuesto por seis datasets etiquetados: `nvidia/Aegis-AI-Content-Safety-Dataset-1.0`, `thesofakillers/jigsaw-toxic-comment-classification-challenge`, `google/civil_comments`, `PKU-Alignment/BeaverTails`, `lmsys/toxic-chat` y `databricks/databricks-dolly-15k`. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor indica que el entrenamiento completo desde cero tarda unos 3,5 minutos en la misma GPU AMD Radeon RX 9060 XT.

## Capacidades

- Clasificación binaria de seguridad de contenido: etiqueta `safe` o `unsafe` con una puntuación de confianza asociada.
- Detección de contenido peligroso (por ejemplo, instrucciones para fabricar explosivos), toxicidad e insultos.
- Discriminación de contexto: distingue usos benignos de términos sensibles (por ejemplo, "how do I kill a process in Linux" se clasifica como `safe`).
- Inferencia en CPU sin GPU, con latencia de aproximadamente 10 ms por texto según la model card.
- Ejecución en GPU (CUDA o ROCm) pasando `device=0` al pipeline.
- Interfaz de línea de comandos interactiva (`censer.3`) y modo one-shot.
- Widget "Use this model" en el Hub para probar el modelo en el navegador.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo clasifica cada mensaje entrante en milisegundos (1,67 ms por texto en GPU), permitiendo filtrar en tiempo real volúmenes altos de comentarios sin coste de infraestructura significativo.
- Pre-filtrado de datasets de entrenamiento: dado su throughput de 4.119 textos/s en lotes de 8, puede procesar corpus masivos para eliminar contenido tóxico antes de entrenar otros modelos, reduciendo el ruido de etiquetas en pipelines de curación de datos.
- Guardarraíl de entrada en aplicaciones conversacionales: como clasificador previo a un LLM generativo, bloquea peticiones peligrosas antes de que lleguen al modelo principal, con un pico de VRAM de 85,7 MB que permite co-alojarlo en la misma GPU.
- Filtrado en el borde (edge) y dispositivos sin GPU: al ejecutarse en CPU a ~10 ms por texto, es viable en servidores modestos, contenedores ligeros o entornos con presupuesto de cómputo restringido.
- Clasificación por lotes en pipelines de CI/CD de contenido: integrable como paso de validación en flujos de publicación de contenido generado por usuarios, con salida determinista (`safe`/`unsafe`) fácil de registrar y auditar.
- Investigación en seguridad de modelos pequeños: su naturaleza from-scratch, licencia Apache 2.0 y entrenamiento de 3,5 minutos lo convierten en una base reproducible para experimentos de clasificación de toxicidad y análisis de sensibilidad a la composición del dataset.
- Herramienta de línea de comandos para revisión manual asistida: el comando `censer.3` permite a moderadores humanos consultar la etiqueta y la puntuación de confianza de una frase concreta de forma interactiva.

## Benchmarks y rendimiento

Evaluación en un split reservado de 6.496 filas:

| Metrica | Valor |
|---|---|
| Accuracy | 0,858 |
| F1 | 0,822 |
| Precision | 0,855 |
| Recall | 0,792 |

F1 por fuente del corpus:

| Fuente | F1 |
|---|---|
| aegis | 0,89 |
| beavertails | 0,88 |
| jigsaw | 0,87 |
| civil_comments | 0,77 |
| toxic_chat | 0,48 |

Rendimiento medido en AMD Radeon RX 9060 XT (ROCm 7.1, torch 2.13.0):

| Metrica | Valor |
|---|---|
| Parametros | 14.423.360 |
| Tamano del checkpoint | 4,26 MB |
| Latencia por texto individual | 1,67 ms |
| Throughput por texto individual | 599 textos/s |
| Latencia en lote de 8 | 1,94 ms |
| Throughput en lote de 8 | 4.119 textos/s |
| VRAM pico en inferencia | 85,7 MB |

Conjunto de prueba manual de 97 casos no presentes en entrenamiento: 100% de accuracy (progresión Censer.1 75,3% → Censer.2 91,8% → Censer.3 100%).

## Requisitos de hardware

- VRAM estimada para inferencia: 85,7 MB de pico medidos en GPU; el checkpoint fp32 ocupa 29,4 MB (55 MB en safetensors).
- GPU recomendadas: cualquier GPU con soporte CUDA o ROCm; el benchmark oficial usa una AMD Radeon RX 9060 XT con ROCm 7.1.
- Cabe holgadamente en cualquier GPU consumer, incluida una RTX 4090, y también en iGPU o CPU.
- Despliegue: `transformers` (pipeline `text-classification`), `text-embeddings-inference` según los tags del Hub, y el launcher propio `censer.3` (solo requiere `torch`, `tokenizers` y `safetensors`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,67 ms y 599 textos/s en individual; 1,94 ms y 4.119 textos/s en lotes de 8; aproximadamente 10 ms por texto en CPU.
- Entrenamiento desde cero: unos 3,5 minutos en la RX 9060 XT.

## Comparativa con modelos similares

La model card menciona una comparación con clasificadores públicos de seguridad, pero el contenido disponible se interrumpe y no incluye la tabla ni los modelos concretos. No se dispone de datos suficientes para construir una comparativa fiable con alternativas como Llama Guard, ShieldGemma o clasificadores de toxicidad basados en BERT.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Censer.3 | 14,4 M | 320 tokens | Apache 2.0 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado su comportamiento en otros idiomas.
- Ventana de contexto muy corta (320 tokens) y truncado de entrada a 500 caracteres, lo que limita la clasificación de documentos largos o conversaciones multi-turno.
- F1 notablemente bajo en `toxic_chat` (0,48) y moderado en `civil_comments` (0,77), atribuido por el autor a ruido de etiquetas en las fuentes; el rendimiento en dominios conversacionales puede degradarse.
- Riesgo de falsos negativos y falsos positivos en usos límite: la distinción entre términos sensibles benignos y maliciosos depende del contexto, y el modelo puede fallar en frases ambiguas.
- El 100% de accuracy en el conjunto de prueba manual de 97 casos debe interpretarse con cautela: es una muestra pequeña y escrita a mano, no un benchmark independiente.
- No es un generador de texto ni un modelo de razonamiento; no debe usarse para tareas distintas a la clasificación binaria de seguridad.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrecen garantías ni se documentan sesgos específicos más allá del ruido de etiquetas de las fuentes.
- No se documentan evaluaciones de robustez frente a ataques adversariales (ofuscación, eufemismos, codificación), relevantes en producción para moderación.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente del rendimiento declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KucLab/Censer.3
- Descarga directa de `model.safetensors`: https://huggingface.co/KucLab/Censer.3/resolve/main/model.safetensors?download=true
- Descarga de `config.json`: https://huggingface.co/KucLab/Censer.3/resolve/main/config.json?download=true
- Descarga de `tokenizer.json`: https://huggingface.co/KucLab/Censer.3/resolve/main/tokenizer.json?download=true
- Descarga de `tokenizer_config.json`: https://huggingface.co/KucLab/Censer.3/resolve/main/tokenizer_config.json?download=true
- Descarga de `censer.py`: https://huggingface.co/KucLab/Censer.3/resolve/main/censer.py?download=true
- Descarga del launcher `censer.3`: https://huggingface.co/KucLab/Censer.3/resolve/main/censer.3?download=true
- Repositorio GitHub del paquete: https://github.com/Jerry256254/censer.3.git
- Dataset nvidia/Aegis-AI-Content-Safety-Dataset-1.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-1.0
- Dataset thesofakillers/jigsaw-toxic-comment-classification-challenge: https://huggingface.co/datasets/thesofakillers/jigsaw-toxic-comment-classification-challenge
- Dataset google/civil_comments: https://huggingface.co/datasets/google/civil_comments
- Dataset PKU-Alignment/BeaverTails: https://huggingface.co/datasets/PKU-Alignment/BeaverTails
- Dataset lmsys/toxic-chat: https://huggingface.co/datasets/lmsys/toxic-chat
- Dataset databricks/databricks-dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k

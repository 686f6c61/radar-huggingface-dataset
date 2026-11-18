# KucLab/Censer.2

## Resumen

Censer.2 es un clasificador binario de seguridad de contenido desarrollado por KucLab. Se trata de un transformer decoder-only de 7,3 millones de parámetros entrenado desde cero (no es un encoder fine-tuneado ni un wrapper de API) que etiqueta texto en inglés como `safe` o `unsafe`. Su propósito es servir como filtro ligero de moderación: dado un fragmento de texto, el modelo predice un único token de respuesta (`0` o `1`) en lugar de generar texto libre, lo que lo convierte en un componente de preprocesado o guardarraíl para pipelines de LLM.

La relevancia del modelo está en su relación tamaño/rendimiento: con solo 7,3 M de parámetros y un checkpoint de 29,4 MB en fp32, alcanza un F1 de 0,824 y una accuracy de 0,857 sobre un split de validación de 6.496 filas, y procesa 599 textos por segundo en una GPU de consumo (AMD Radeon RX 9060 XT). Es un checkpoint estándar de `transformers` (`LlamaForSequenceClassification`), por lo que se carga sin `trust_remote_code` ni código personalizado.

Arquitectura transformer tipo Llama con 6 capas, dimensión oculta 256, 8 cabezas de atención, MLP SwiGLU y RoPE, con un contexto de 256 tokens y truncado de entrada a 500 caracteres. Está pensado exclusivamente para inglés y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlamaForSequenceClassification` (transformer decoder-only, 6 capas) |
| Parametros totales | 7.343.872 (7,3 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (entrada truncada a 500 caracteres) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en fp32) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32, `model.safetensors`, 29,4 MB) |

Detalles adicionales de arquitectura recogidos en la model card: `d_model` 256, 8 cabezas, `d_ff` 1024, RoPE con theta 10000, RMSNorm pre-norm con eps 1e-5, MLP SwiGLU, tokenizer BPE byte-level de 4.096 tokens entrenado sobre el corpus, y cabeza de clasificación implementada como capa lineal `score` que reutiliza las filas de embedding de los tokens de respuesta `0`/`1`.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 6 capas y 7,3 M de parámetros entrenado desde cero, no un encoder tipo BERT fine-tuneado. Usa RoPE para posiciones, RMSNorm en pre-norm y SwiGLU en el MLP, siguiendo el esquema de la familia Llama pero a escala reducida. La tokenización emplea un BPE byte-level propio de 4.096 tokens entrenado sobre el corpus, y el tokenizer incorpora en su post-procesador la plantilla de prompt, de modo que `tokenizer(text)` produce directamente la secuencia `[BOS][USER] <text> [ASSISTANT]` seguida de la predicción sobre los tokens `0`/`1`. El texto se trunca a 500 caracteres antes de tokenizar.

El entrenamiento se realizó sobre datos etiquetados de seguridad procedentes de seis fuentes: `nvidia/Aegis-AI-Content-Safety-Dataset-1.0`, `thesofakillers/jigsaw-toxic-comment-classification-challenge`, `google/civil_comments`, `PKU-Alignment/BeaverTails`, `lmsys/toxic-chat` y `databricks/databricks-dolly-15k`. La model card indica que el entrenamiento completo desde cero tarda aproximadamente 3,5 minutos en una AMD Radeon RX 9060 XT. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; al ser un clasificador, la formulación es de predicción de un token de respuesta, no de generación libre.

## Capacidades

- Clasificación binaria de seguridad de contenido en inglés: devuelve `safe` o `unsafe` con una puntuación de confianza.
- Detección de contenido peligroso (instrucciones para fabricar explosivos, contenido sexual explícito, etc.) y distinción de usos legítimos con vocabulario sensible (por ejemplo, "how do I kill a process in Linux" se clasifica como `safe`).
- Inferencia en CPU sin configuración adicional, con latencia de aproximadamente 10 ms por texto según la model card.
- Inferencia en GPU (CUDA o ROCm) pasando `device=0` al pipeline.
- Integración directa con `transformers` mediante `pipeline("text-classification", model="KucLab/Censer.2")`, sin `trust_remote_code`.
- Ejecución en el navegador mediante el widget "Use this model" de Hugging Face.
- Interfaz de terminal interactiva y de un solo uso mediante el comando `censer.2`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre: predice un único token de respuesta.

## Casos de uso

- Moderación de comentarios en plataformas web: el modelo actúa como filtro previo de bajo coste sobre cada comentario entrante, clasificándolo como `safe`/`unsafe` con ~10 ms por texto en CPU, lo que permite procesar en tiempo real sin infraestructura GPU dedicada.
- Guardarraíl de entrada en pipelines de LLM: antes de enviar un prompt a un modelo generativo, Censer.2 puede descartar peticiones peligrosas; su latencia de 1,67 ms por texto en GPU y su throughput de 599 textos/s lo hacen viable como etapa de filtrado en serie.
- Filtrado de datasets de entrenamiento: dado su F1 de 0,824, puede usarse para preetiquetar grandes corpus y reducir la revisión manual, aplicando después una revisión humana sobre los casos límite.
- Moderación de chats en vivo: con 4.119 textos/s en lotes de 8 en GPU, puede clasificar por lotes los mensajes de una sala de chat activa y activar revisiones o bloqueos automáticos.
- Clasificación por lotes en pipelines de datos: la API de `transformers` permite procesar lotes con `pipeline`, integrándose en jobs de limpieza o auditoría de contenido almacenado.
- Despliegue en entornos con recursos limitados: el checkpoint de 29,4 MB y el pico de VRAM de 85,7 MB permiten ejecutarlo en dispositivos de borde, contenedores pequeños o máquinas sin GPU.
- Evaluación comparativa de filtros de seguridad: sirve como línea base ligera frente a clasificadores de mayor tamaño en pruebas de regresión de sistemas de moderación.

## Benchmarks y rendimiento

Evaluación sobre un split de validación de 6.496 filas:

| Metrica | Valor |
|---|---|
| Accuracy | 0,857 |
| F1 | 0,824 |
| Precision | 0,846 |
| Recall | 0,804 |

F1 por fuente de datos (refleja ruido de etiquetas en las fuentes):

| Fuente | F1 |
|---|---|
| aegis | 0,89 |
| beavertails | 0,88 |
| jigsaw | 0,87 |
| civil_comments | 0,77 |
| toxic_chat | 0,48 |

Conjunto de sondas manuales de 62 casos no presentes en entrenamiento: 98,4 % de accuracy y recall 1,0 (todos los casos inseguros detectados). Censer.1 obtiene 88,7 % en las mismas sondas.

Rendimiento medido en AMD Radeon RX 9060 XT (ROCm 7.1, torch 2.13.0):

| Metrica | Valor |
|---|---|
| Parametros | 7.343.360 |
| Tamano del checkpoint | 4,26 MB |
| Latencia por texto | 1,67 ms |
| Throughput por texto | 599 textos/s |
| Latencia por lote (batch de 8) | 1,94 ms |
| Throughput por lote | 4.119 textos/s |
| VRAM pico en inferencia | 85,7 MB |

La model card menciona una comparación con otros clasificadores de seguridad públicos, pero el texto disponible está truncado y no incluye los resultados de dicha comparación.

## Requisitos de hardware

- VRAM estimada para inferencia: 85,7 MB de pico según la medición del autor en ROCm; el checkpoint fp32 ocupa 29,4 MB.
- GPU recomendadas: cualquier GPU con al menos ~100 MB de VRAM libre; el autor midió en una AMD Radeon RX 9060 XT con ROCm 7.1 y torch 2.13.0. También funciona en CUDA.
- Cabe en cualquier GPU de consumo e incluso en CPU: la model card indica ~10 ms por texto en CPU y 1,67 ms en la GPU medida.
- Opciones de despliegue: `transformers` (`pipeline`), el comando `censer.2` incluido en el repo o instalable desde GitHub, el widget del navegador de Hugging Face y `text-embeddings-inference` (según los tags del repo). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,67 ms/texto y 599 textos/s en texto único; 1,94 ms y 4.119 textos/s en lotes de 8, en la GPU medida por el autor.

## Comparativa con modelos similares

La información disponible no incluye los resultados de la comparación con otros clasificadores de seguridad públicos que la model card menciona (el texto está truncado). Como referencia interna, el propio autor compara con Censer.1:

| Modelo | Parametros | Contexto | Accuracy en sondas manuales | Licencia |
|---|---|---|---|---|
| Censer.2 | 7,3 M | 256 tokens | 98,4 % | Apache 2.0 |
| Censer.1 | no disponible | no disponible | 88,7 % | no disponible |

No se dispone de datos de benchmarks frente a alternativas de la misma categoría (clasificadores de toxicidad o seguridad) en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Contexto limitado a 256 tokens y truncado de entrada a 500 caracteres: textos largos pierden información y la clasificación se basa solo en el fragmento inicial.
- El F1 en `toxic_chat` es de 0,48, muy inferior al resto de fuentes, lo que indica un rendimiento débil en ese tipo de conversaciones; la model card lo atribuye a ruido de etiquetas en la fuente.
- Riesgo de falsos negativos y falsos positivos: con recall de 0,804 en el split de validación, aproximadamente una de cada cinco muestras inseguras no se detecta; en producción conviene combinarlo con revisión humana o con un segundo filtro.
- Es un clasificador binario, no un generador: no explica sus decisiones ni produce texto justificativo.
- No hay información publicada sobre sesgos demográficos o culturales del modelo; al entrenarse con datos raspados de foros y datasets de toxicidad, puede heredar sesgos de esas fuentes.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad para moderación en producción.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni de validación externa independiente.
- La model card menciona una comparación con otros clasificadores que no está disponible en el texto proporcionado; no debe asumirse superioridad frente a alternativas sin verificar esos datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KucLab/Censer.2
- Pesos (`model.safetensors`): https://huggingface.co/KucLab/Censer.2/resolve/main/model.safetensors?download=true
- Configuración: https://huggingface.co/KucLab/Censer.2/resolve/main/config.json?download=true
- Tokenizer: https://huggingface.co/KucLab/Censer.2/resolve/main/tokenizer.json?download=true
- Script `censer.py`: https://huggingface.co/KucLab/Censer.2/resolve/main/censer.py?download=true
- Lanzador `censer.2`: https://huggingface.co/KucLab/Censer.2/resolve/main/censer.2?download=true
- Repositorio GitHub: https://github.com/Jerry256254/censer.2
- Dataset Aegis AI Content Safety: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-1.0
- Dataset Jigsaw Toxic Comment Classification: https://huggingface.co/datasets/thesofakillers/jigsaw-toxic-comment-classification-challenge
- Dataset Civil Comments: https://huggingface.co/datasets/google/civil_comments
- Dataset BeaverTails: https://huggingface.co/datasets/PKU-Alignment/BeaverTails
- Dataset Toxic Chat: https://huggingface.co/datasets/lmsys/toxic-chat
- Dataset Databricks Dolly 15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k

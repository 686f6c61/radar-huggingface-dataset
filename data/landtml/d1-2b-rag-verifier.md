# landtml/d1-2B-RAG-Verifier

## Resumen

d1-2B-RAG-Verifier es un modelo verificador de 1.918 millones de parámetros (1,9B) desarrollado por el usuario landtml sobre la base LiquidAI/d1-2B. Su función es detectar alucinaciones a nivel de respuesta en sistemas de generación aumentada por recuperación (RAG): recibe la fuente recuperada, la petición del usuario y la respuesta generada, y devuelve la probabilidad de que todas las afirmaciones de la respuesta estén respaldadas por la fuente. La verificación se realiza en un único forward pass sin generación de texto, lo que lo hace lo bastante barato para ejecutarse sobre cada respuesta producida por un pipeline RAG.

El modelo se obtiene mediante fine-tuning con LoRA sobre la partición de entrenamiento del dataset RAGTruth y se distribuye listo para `transformers` (con `trust_remote_code`) y también en formato GGUF. Es relevante porque demuestra que un modelo de menos de 2B parámetros puede superar en F1 a detectores fine-tuneados de 13B y acercarse a alternativas de 8B en la tarea concreta de detección de alucinaciones, abriendo la puerta a verificación de bajo coste en producción.

La licencia es LFM1.0 (marcada como `other` en el repo), el idioma declarado es únicamente inglés y el modelo está pensado como clasificador binario de soporte (soportado/no soportado) más que como generador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base LiquidAI/d1-2B, familia LFM3), fine-tuning LoRA para clasificación |
| Parámetros totales | 1.918.181.888 (~1,9B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | safetensors (bf16) y GGUF (cuantizaciones GGUF no detalladas) |
| Idiomas soportados | inglés (en) |
| Licencia | LFM1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/d1-2B, un transformer decoder de la familia LFM3 de Liquid AI, y se adapta mediante LoRA para una tarea de clasificación a nivel de respuesta. La innovación clave es que el veredicto se obtiene con un único forward pass, sin decodificación autoregresiva: el modelo puntúa la probabilidad `noul` de que la respuesta esté completamente soportada por la fuente. La interfaz `system_one` recibe un diccionario con las claves `source`, `request` y `answer` y una especificación de comprobación (`CHECK`), y devuelve la probabilidad asociada. Existe también `system_one_batch` para puntuar varias respuestas en una sola llamada.

El entrenamiento utiliza la partición de entrenamiento del dataset RAGTruth (paper arXiv:2401.00396), que cubre tres tipos de tarea: question answering, data-to-text y summarization. Para data-to-text, RAGTruth coloca el registro estructurado (JSON) en `source` y la instrucción de redacción en `request`. El autor reporta que el fine-tuning mejora todas las métricas frente al modelo base sin entrenar sobre las mismas 2.700 respuestas de test, con especial ganancia en summarization (la detección de resúmenes alucinados pasa del 16,7% al 62,7%). No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO.

## Capacidades

- Detección de alucinaciones a nivel de respuesta en RAG: devuelve la probabilidad de que todas las afirmaciones de una respuesta estén respaldadas por la fuente recuperada.
- Clasificación binaria de soporte (soportado / no soportado) mediante la probabilidad `noul`.
- Puntuación calibrada: el autor reporta un expected calibration error (ECE, 10 bins) de 0,030, lo que permite fijar umbrales y tamaños de cola de revisión con comportamiento predecible.
- Procesamiento por lotes mediante `system_one_batch` para puntuar muchas respuestas en una sola llamada.
- Soporte de tres tipos de tarea RAGTruth: question answering, data-to-text y summarization.
- Interfaz de comprobación configurable mediante el diccionario `CHECK` (tipo `noul` con instrucciones en lenguaje natural).
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Verificación en producción de pipelines RAG: ejecutar el verificador sobre cada respuesta generada antes de mostrarla al usuario, usando el umbral `noul < 0,56` para marcar respuestas no soportadas; su coste de un solo forward pass lo hace viable a escala.
- Colas de revisión humana: gracias a la calibración (ECE 0,030), el equipo puede dimensionar la cola de revisión fijando el umbral para obtener la tasa de falsos positivos deseada; el autor reporta que el 69% de las respuestas se deciden con un 95% de precisión.
- Atención al cliente automatizada: verificar que las respuestas sobre políticas, horarios o datos de empresa estén respaldadas por la documentación recuperada antes de enviarlas, reduciendo alucinaciones en conversaciones multi-turno.
- Resumen de documentos con control de fidelidad: en tareas de summarization (donde el modelo base fallaba notablemente), el verificador detecta resúmenes con afirmaciones no soportadas por el documento fuente.
- Data-to-text con registros estructurados: verificar que las narraciones generadas a partir de JSON (por ejemplo, informes financieros o fichas de producto) no introduzcan datos no presentes en el registro.
- Filtrado y evaluación de datasets: puntuar grandes volúmenes de pares fuente/respuesta para construir conjuntos de evaluación de fidelidad o para filtrar datos de entrenamiento con alucinaciones.
- Guardarraíl en agentes y asistentes documentales: integrar el verificador como paso de control tras la generación en asistentes que responden sobre documentación interna, con umbral configurable según el riesgo del dominio.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el test de RAGTruth (2.700 respuestas, 900 por tarea; una respuesta cuenta como alucinada si los anotadores marcaron algún span no soportado). No verificados de forma independiente.

| Modelo | Params | QA F1 | Data-to-text F1 | Summary F1 | Precision | Recall | F1 |
|---|---|---|---|---|---|---|---|
| RAG-HAT (Llama-3-8B) | 8B | 74,8 | 91,6 | 67,6 | 87,3 | 80,8 | 83,9 |
| d1-2B RAG Verifier (este modelo) | 1,9B | 72,0 | 89,9 | 64,3 | 79,8 | 83,2 | 81,5 |
| LettuceDetect-large | 396M | 70,2 | 88,5 | 59,7 | 80,4 | 78,1 | 79,2 |
| Llama-2-13B, fine-tuned (paper RAGTruth) | 13B | 68,2 | 88,1 | 59,1 | 76,9 | 80,7 | 78,7 |
| LettuceDetect-base | 150M | 65,5 | 87,9 | 50,5 | 76,6 | 75,5 | 76,1 |
| d1-2B, sin entrenar | 1,9B | 58,4 | 84,6 | 27,2 | 83,6 | 61,6 | 70,9 |

Métricas globales del modelo (model-index y model card): F1 81,5; precision 79,8; recall 83,2; AUROC 0,936. Comparación antes/después del fine-tuning sobre las mismas 2.700 respuestas:

| Métrica | d1-2B sin entrenar | d1-2B RAG Verifier |
|---|---|---|
| F1 | 70,9 | 81,5 |
| AUROC | 0,877 | 0,936 |
| Accuracy | 82,4% | 86,8% |
| ECE (10 bins) | 0,037 | 0,030 |
| Respuestas decididas al 95% de precisión | 42% | 69% |
| Respuestas decididas al 99% de precisión | 9% | 16% |

Rendimiento declarado: ~40 respuestas/s en una RTX 5090 y 144 ms por respuesta en una GPU de consumo de 12 GB. El autor indica que las filas de d1 se midieron para esta release y que las demás proceden de los papers citados (Llama-2-13B de la Tabla 5 del paper RAGTruth; RAG-HAT y LettuceDetect de la Tabla 2 del paper LettuceDetect).

## Requisitos de hardware

- VRAM estimada para inferencia: el autor reporta 144 ms por respuesta en una GPU de consumo de 12 GB; con pesos en bf16 (~3,8 GB) se requiere holgura adicional para activaciones y contexto.
- GPU recomendadas: RTX 5090 (referencia de throughput del autor, ~40 respuestas/s), GPU de consumo de 12 GB (RTX 3060 12 GB, RTX 4070, etc.) para el caso de 144 ms por respuesta; A100/H100 para despliegues de alto volumen.
- Cabe en GPU de consumo: sí, según el dato de 12 GB reportado por el autor.
- Opciones de despliegue: `transformers` (>=5.19) con `trust_remote_code=True` y `dtype=torch.bfloat16`; formato GGUF disponible (el runtime concreto no se detalla en la información proporcionada). No se confirma soporte de vLLM, TGI o Ollama.
- Latencia y throughput: ~40 respuestas/s en RTX 5090; 144 ms por respuesta en GPU de 12 GB.

## Comparativa con modelos similares

| Modelo | Params | Contexto | F1 RAGTruth | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1-2B RAG Verifier | 1,9B | no disponible | 81,5 | LFM1.0 | Hugging Face (safetensors, GGUF) |
| RAG-HAT (Llama-3-8B) | 8B | no disponible | 83,9 | no disponible en la información | referenciado en paper |
| LettuceDetect-large | 396M | no disponible | 79,2 | no disponible en la información | referenciado en paper |
| Llama-2-13B fine-tuned (RAGTruth) | 13B | no disponible | 78,7 | no disponible en la información | referenciado en paper |

El modelo destaca por ofrecer el F1 más alto entre los detectores fine-tuneados por debajo de 8B comparados en la model card, con la mayor recall (83,2) entre los detectores por encima de 75 F1, y por quedar a 2,4 puntos de F1 de RAG-HAT con una cuarta parte de sus parámetros.

## Limitaciones y advertencias

- Idioma: solo inglés declarado; su uso en castellano u otros idiomas no está validado.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación del propio verificador: las métricas son del autor y no verificadas de forma independiente (`verified: false` en el model-index); un 79,8 de precision implica falsos positivos y un 83,2 de recall implica alucinaciones no detectadas.
- Umbral dependiente de la distribución: el umbral recomendado (`noul < 0,56`) se eligió sobre la partición de desarrollo de RAGTruth; puede requerir recalibración en dominios distintos.
- Dependencia de la interfaz: el autor advierte que debe usarse el texto exacto de la pregunta de ejemplo porque el modelo fue entrenado con él, y que las claves `source`, `request` y `answer` son las usadas en entrenamiento.
- Requiere `trust_remote_code=True` y `transformers>=5.19`, lo que implica ejecutar código del repositorio y limita la portabilidad.
- Licencia LFM1.0: es necesario revisar los términos del archivo LICENSE del repositorio antes de un uso comercial; la información disponible no detalla restricciones concretas.
- Sin datos de longitud de contexto ni de composición del dataset de entrenamiento, lo que dificulta estimar el comportamiento con fuentes muy largas.
- Popularidad nula en el momento de la consulta (0 descargas, 0 likes) y sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/landtml/d1-2B-RAG-Verifier
- Demo en el navegador (Space): https://huggingface.co/spaces/landtml/rag-verifier
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Paper RAGTruth: https://arxiv.org/abs/2401.00396
- Paper adicional referenciado en los tags: https://arxiv.org/abs/2502.17125
- Dataset: https://huggingface.co/datasets/wandb/RAGTruth-processed

# ayatsuri/miroberta-rmi-url

## Resumen

miroberta-rmi-url es un modelo de clasificación de texto derivado de mavinsao/mi-roberta-base, un RoBERTa base adaptado al castellano. Lo publica el usuario ayatsuri en Hugging Face y está afinado para una tarea concreta de clasificación binaria o multiclase relacionada con URL y RMI (la model card no explicita la etiqueta exacta). Con 124.651.784 parámetros, se trata de un encoder transformer de tamano base, no de un modelo generativo: su salida es una predicción de clase, no texto libre.

El interés del modelo es acotado pero claro: sirve como componente especializado dentro de pipelines de moderación, filtrado o enrutamiento donde ya se trabaja con texto en castellano y se necesita una cabeza de clasificación ligera y rápida. La licencia MIT y el formato safetensors facilitan su integración en producción sin fricciones legales ni conversiones adicionales.

No hay información publicada sobre el dataset de entrenamiento, los idiomas soportados ni la definición exacta de las clases. El autor declara métricas de evaluación razonables (accuracy 0,8857; F1 0,8778) sobre un conjunto de validación no descrito, por lo que deben tomarse como indicativas y no como garantía de generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base) |
| Parametros totales | 124.651.784 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (RoBERTa base admite hasta 512 tokens, no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion a int8/fp16 posible via transformers, no documentada por el autor) |
| Idiomas soportados | no disponible (modelo base orientado a castellano, no confirmado) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de mavinsao/mi-roberta-base, que a su vez es un RoBERTa base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención, ~125 M de parámetros) adaptado al castellano. La cabeza de clasificación se entrena sobre el encoder congelado o parcialmente ajustado, según la práctica habitual de `Trainer`. No se documenta ninguna innovación arquitectónica: es un encoder estándar con una capa lineal de clasificación.

El entrenamiento se realizó con el `Trainer` de Transformers durante 3 épocas, con learning rate 1e-05, batch size 16, semilla 42, optimizador AdamW fused y scheduler lineal. El dataset de entrenamiento no se especifica ("unknown dataset" en la model card). No hay mención de RLHF, DPO ni técnicas de alineación, lo cual es esperable en un clasificador. Tampoco se documenta el número de tokens de entrenamiento ni la composición del corpus.

## Capacidades

- Clasificación de texto: el modelo emite una etiqueta por secuencia de entrada; la naturaleza exacta de las clases (binaria o multiclase) no está documentada.
- Especialización aparente en URLs y RMI (por el nombre del modelo), aunque el autor no describe la tarea.
- Inferencia rápida y ligera: al ser un encoder de 125 M de parámetros, es adecuado para procesamiento por lotes a gran escala.
- Compatible con `text-embeddings-inference` y `endpoints_compatible`, según los tags del repositorio.
- No soporta generación de texto, tool calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no confirmadas; el modelo base está orientado a castellano, pero el fine-tune podría haber alterado el comportamiento.

## Casos de uso

- Filtrado de URLs en pipelines de moderación: clasificar enlaces entrantes como seguros o sospechosos antes de pasarlos a un verificador más costoso, aprovechando la baja latencia del encoder.
- Enrutamiento de peticiones en atención al cliente: usar la predicción para dirigir tickets a un departamento concreto cuando el texto contiene URLs o referencias a servicios.
- Preetiquetado en anotación humana: generar etiquetas preliminares sobre grandes volúmenes de texto en castellano para que los anotadores solo revisen los casos dudosos.
- Detección de dominios o patrones en logs: clasificar cadenas de texto que contienen URLs para separar tráfico legítimo de ruido o spam.
- Componente en un ensemble: combinar la salida del clasificador con reglas heurísticas o un segundo modelo para reducir falsos positivos en producción.
- Extracción de señales para analítica: agregar las predicciones sobre un corpus de textos para medir la prevalencia de ciertos patrones (por ejemplo, proporción de URLs sospechosas por día).
- Prototipado rápido: al ser un modelo pequeño con licencia MIT, sirve para validar una idea de clasificación antes de invertir en un modelo mayor o en anotación propia.

## Benchmarks y rendimiento

El autor declara resultados sobre un conjunto de evaluación no descrito. La model card no incluye comparaciones con otros modelos ni resultados en benchmarks estándar (MMLU, GLUE, etc.). La entrada del `model-index` está vacía (`results: []`).

| Métrica | Valor declarado (epoch 3) |
|---|---|
| Loss (validación) | 0,3960 |
| Accuracy | 0,8857 |
| Recall | 0,8767 |
| Precision | 0,8795 |
| F1 | 0,8778 |

Evolución durante el entrenamiento:

| Época | Training loss | Validation loss | Accuracy | Recall | Precision | F1 |
|---|---|---|---|---|---|---|
| 1 | 0,4441 | 0,3906 | 0,8741 | 0,8646 | 0,8713 | 0,8662 |
| 2 | 0,3284 | 0,3738 | 0,8807 | 0,8723 | 0,8728 | 0,8718 |
| 3 | 0,2690 | 0,3960 | 0,8857 | 0,8767 | 0,8795 | 0,8778 |

No se han publicado resultados de benchmarks estandarizados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~500 MB (125 M parámetros × 4 bytes) más overhead de activaciones, en torno a 1 GB en total.
- VRAM estimada en fp16: ~250 MB de pesos, ~600 MB en total.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en CPU para lotes pequenos.
- GPU recomendadas para throughput alto: A100, H100 o L4 para servir lotes grandes; T4 suficiente para cargas moderadas.
- Despliegue: `transformers` con `pipeline("text-classification")`, `text-embeddings-inference` (según tags), y servidores de inferencia compatibles con endpoints. No se documenta soporte GGUF ni llama.cpp, aunque la conversión sería viable.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No hay datos de benchmarks comparativos publicados por el autor. A continuación se comparan características estructurales con alternativas del mismo tamano y categoría, sin cifras de rendimiento inventadas.

| Modelo | Parámetros | Contexto | Licencia | Tarea | Disponibilidad |
|---|---|---|---|---|---|
| ayatsuri/miroberta-rmi-url | 124,7 M | no disponible | MIT | Clasificación de texto | Hugging Face |
| mavinsao/mi-roberta-base | ~125 M | no disponible | no disponible | Encoder base (castellano) | Hugging Face |
| roberta-base (Facebook) | 125 M | 512 tokens | MIT | Encoder base (inglés) | Hugging Face |
| BERT-base multilingual | 178 M | 512 tokens | Apache 2.0 | Encoder base (multilingüe) | Hugging Face |

La comparación de rendimiento con estas alternativas no está disponible: el autor no publica resultados en benchmarks comunes ni comparaciones directas.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: se desconoce la distribución, el dominio y el equilibrio de clases, lo que impide evaluar sesgos y generalización.
- Métricas declaradas sin descripción del conjunto de evaluación: no se puede verificar si el 0,8857 de accuracy se obtuvo sobre datos representativos o sobre un split sesgado.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero sí de falsos positivos y falsos negativos en la clasificación, especialmente fuera de la distribución de entrenamiento.
- Idiomas no confirmados: aunque el modelo base está orientado al castellano, no hay garantía de comportamiento correcto en otros idiomas ni en variantes dialectales.
- Longitud de contexto no documentada: si se hereda la de RoBERTa base, se limita a 512 tokens; textos más largos requerirán truncamiento.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright y verificar la licencia del modelo base (no disponible en la información proporcionada).
- Modelo con muy pocas descargas (54) y sin likes: no hay validación comunitaria ni reportes de uso en producción.
- La model card es autogenerada por el `Trainer` y contiene secciones sin completar ("More information needed"), lo que sugiere que el autor no ha documentado la tarea ni las clases.
- No apto para generación, razonamiento, código ni tareas generativas: es un clasificador, no un LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ayatsuri/miroberta-rmi-url
- Modelo base: https://huggingface.co/mavinsao/mi-roberta-base
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Documentación de `text-embeddings-inference`: https://github.com/huggingface/text-embeddings-inference
- Paper de RoBERTa: https://arxiv.org/abs/1907.11692

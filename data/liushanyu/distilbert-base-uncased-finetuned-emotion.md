# liushanyu/distilbert-base-uncased-finetuned-emotion

## Resumen

`liushanyu/distilbert-base-uncased-finetuned-emotion` es un modelo de clasificación de texto en inglés obtenido mediante fine-tuning de `distilbert-base-uncased` sobre el dataset `emotion` (derivado de CARER, Saravia et al., EMNLP 2018). Resuelve una tarea acotada y bien definida: asignar a una frase corta (típicamente un tuit) una de seis etiquetas de emoción: sadness, joy, love, anger, fear y surprise. No es un modelo generativo ni conversacional, sino un clasificador discriminativo de 66,9 millones de parámetros.

El modelo lo publica el usuario `liushanyu` y sigue el ejercicio clásico de clasificación de emociones descrito en el capítulo de fine-tuning de DistilBERT del curso de Hugging Face. La relevancia práctica es la de un clasificador ligero y barato de ejecutar: con 66M de parámetros y pesos en safetensors de unos 0,3 GB, cabe en cualquier GPU de consumo e incluso en CPU con latencias de milisegundos, lo que permite integrarlo en pipelines de moderación, análisis de sentimiento o enrutado de tickets sin coste apreciable.

La arquitectura es un transformer encoder de 6 capas y dimensión oculta 768, derivado por destilación de BERT-base, con un contexto máximo de 512 tokens. La licencia Apache 2.0 y el formato estándar de Transformers facilitan su uso comercial, aunque con las limitaciones propias de un modelo entrenado únicamente con datos de dominio Twitter y en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), 6 capas, hidden 768 |
| Parametros totales | 66.958.086 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite de DistilBERT; no indicado explícitamente en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización dinámica de PyTorch/ONNX, no documentada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder de 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, destilado de BERT-base (Sanh et al., 2019) y que conserva aproximadamente el 97 % del rendimiento de BERT con un 40 % menos de parámetros. Sobre esta base se añade una cabeza de clasificación lineal con 6 salidas, una por emoción. El tokenizador es WordPiece en minúsculas, con vocabulario de 30.522 tokens.

El fine-tuning se realizó sobre la partición `train` del dataset `emotion` (16.000 ejemplos) y se validó sobre la partición `validation` (2.000 ejemplos). El autor documenta una búsqueda de hiperparámetros en cuatro configuraciones sobre subconjuntos de 4.000 ejemplos: la configuración por defecto (lr 1e-3, batch 8, 1 época) alcanzó 28,70 % de accuracy; lr 3e-5 con batch 16 y 1 época, 78,40 %; lr 5e-5 con batch 16 y 1 época, 86,80 %; y la configuración elegida, lr 5e-5 con batch 16 y 2 épocas, 93,00 %. El modelo final se reentrenó con esa configuración sobre las 16.000 muestras completas. No se documenta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador. Tampoco se fija semilla aleatoria, por lo que el autor advierte de una variabilidad de 1 a 3 puntos porcentuales entre ejecuciones.

## Capacidades

- Clasificación de texto en inglés en seis emociones mutuamente excluyentes: sadness (0), joy (1), love (2), anger (3), fear (4) y surprise (5).
- Salida de probabilidades por clase mediante `pipeline("text-classification", top_k=None)`, útil para umbrales y análisis de confianza.
- Procesamiento de frases cortas y tuits; el entrenamiento se hizo sobre textos de longitud reducida.
- Ejecución en CPU y GPU de gama baja gracias a su tamaño (66M de parámetros).
- Integración nativa con `transformers` y con `text-embeddings-inference` según los tags del repo (endpoints compatibles).
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: no. Solo inglés.

## Casos de uso

- Moderación de comunidades y redes sociales: clasificar respuestas de usuarios en tiempo real para detectar anger o fear y activar revisión humana. El coste por inferencia es mínimo y permite procesar miles de mensajes por segundo en una sola GPU.
- Enrutado de tickets de soporte: usar la emoción detectada (por ejemplo, anger) para priorizar colas de atención al cliente o asignar agentes especializados, combinándolo con un clasificador de intención.
- Análisis de sentimiento a nivel de producto: agregar las seis emociones sobre reseñas cortas en inglés para construir dashboards de percepción más ricos que un simple positivo/negativo.
- Investigación en psicología computacional o NLP: replicar el experimento de fine-tuning de DistilBERT con un modelo de referencia ya entrenado y validado (94,35 % de accuracy) para comparar metodologías.
- Filtrado previo en pipelines generativos: etiquetar la emoción de una consulta antes de pasarla a un LLM mayor, y usar esa señal para seleccionar un prompt o una política de respuesta.
- Detección de crisis: marcar mensajes con alta probabilidad de sadness o fear para derivarlos a protocolos de intervención, siempre con revisión humana dada la limitada fiabilidad en clases minoritarias.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| emotion (validation) | Accuracy | 0,9435 |
| emotion (validation) | Weighted F1 | 0,9435 |
| emotion (validation) | Cross-entropy loss | 0,1330 |

Desglose por clase en validación:

| Clase | Accuracy | Muestras |
|---|---|---|
| sadness | 97,27 % | 550 |
| joy | 95,88 % | 704 |
| anger | 93,09 % | 275 |
| fear | 91,04 % | 212 |
| love | 89,33 % | 178 |
| surprise | 85,19 % | 81 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 0,27 GB de pesos más activaciones; en la práctica menos de 1 GB en total.
- VRAM en fp16 o cuantización dinámica: por debajo de 0,2 GB, irrelevante para cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona bien en T4, L4, RTX 3060, RTX 4090, A100 y H100, aunque el cuello de botella será el preprocesado, no el modelo.
- Cabe holgadamente en GPU de consumo e incluso en Raspberry Pi o CPU de portátil.
- Opciones de despliegue: `transformers` con `pipeline`, `text-embeddings-inference` (según tags), ONNX Runtime, TorchScript, o exportación a GGUF para llama.cpp aunque no está documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de pocos milisegundos por frase en GPU y decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Accuracy (emotion) |
|---|---|---|---|---|---|
| liushanyu/distilbert-base-uncased-finetuned-emotion | 66,9 M | 512 | Clasificación 6 emociones | Apache 2.0 | 94,35 % (declarado) |
| distilbert-base-uncased (base, sin fine-tuning) | 66,9 M | 512 | MLM genérico | Apache 2.0 | no aplica (no entrenado para la tarea) |
| bhadresh-savani/distilbert-base-uncased-emotion | ~67 M | 512 | Clasificación 6 emociones | Apache 2.0 | no disponible en esta búsqueda |
| bhadresh-savani/bert-base-uncased-emotion | ~110 M | 512 | Clasificación 6 emociones | Apache 2.0 | no disponible en esta búsqueda |

La comparativa con variantes de BERT-base para la misma tarea es pertinente porque ofrecen mayor capacidad a costa de triplicar el coste de inferencia; no se dispone de cifras verificables de esos modelos en la información proporcionada, por lo que la comparación numérica queda pendiente.

## Limitaciones y advertencias

- Negación y doble negación: el autor documenta que frases como "I can't say I didn't enjoy... not bad at all" se clasifican como sadness con un 81,81 % de confianza. Cualquier uso en producción debe contemplar este sesgo.
- Clases minoritarias: surprise (85,19 %) y love (89,33 %) son las más débiles por escasez de ejemplos; surprise tiene solo 81 muestras en validación.
- Confusiones sistemáticas: love se confunde con joy, y anger con fear o sadness, según el propio autor.
- Dominio restringido: entrenado sobre tuits en inglés; el rendimiento en textos formales, técnicos o de otros dominios no está evaluado.
- Idioma: solo inglés. No debe usarse con textos en castellano ni en otros idiomas sin reentrenamiento.
- Contexto limitado a 512 tokens: frases o documentos largos se truncan, lo que puede alterar la etiqueta.
- Reproducibilidad: no se fija semilla; el autor advierte de variaciones de 1 a 3 puntos porcentuales.
- Riesgo de alucinación: no aplica en sentido estricto (no genera texto), pero sí hay riesgo de falsos positivos y negativos por la ambigüedad de las emociones.
- Sesgos de datos: el dataset emotion proviene de Twitter, por lo que hereda sesgos demográficos, culturales y de estilo de esa plataforma.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del dataset CARER original y de los datos de Twitter subyacentes.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay validación de la comunidad ni issues documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liushanyu/distilbert-base-uncased-finetuned-emotion
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper CARER (Saravia et al., EMNLP 2018): http://dx.doi.org/10.18653/v1/D18-1404
- Dataset emotion en Hugging Face: https://huggingface.co/datasets/emotion

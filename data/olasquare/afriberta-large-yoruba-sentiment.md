# Olasquare/afriberta-large-yoruba-sentiment

## Resumen

AfriBERTa-large-yoruba-sentiment es un modelo de clasificación de sentimiento en tres clases (negativo, neutro, positivo) especializado en tuits en yoruba, incluidos los que mezclan yoruba e inglés (code-mixing). Lo desarrolla Olasquare (Saheed Olayemi Olayinka y Samson Akinyele Fagbenjo, Departamento de Ciencias de la Computación, Universidad de Ibadan) como parte del proyecto CSC790 *Deep Neural Networks for Semantic Sentiment Analysis in Code-Mixed English-Yorùbá Social Media Conversations*. Se construye mediante fine-tuning del modelo base castorini/afriberta_large sobre la partición yoruba del corpus AfriSenti-SemEval 2023.

El modelo emplea una arquitectura XLM-RoBERTa adaptada al contexto africano (AfriBERTa), con 125.633.283 parámetros totales y un checkpoint de aproximadamente 0,5 GB en formato safetensors. La ventana de contexto operativa en entrenamiento e inferencia es de 128 tokens, suficiente para publicaciones cortas de redes sociales, que es el dominio para el que fue diseñado.

Su relevancia radica en abordar un nicho poco cubierto: el análisis de sentimiento en yoruba y en conversaciones code-mixed inglés-yoruba, un fenómeno muy frecuente en redes sociales de Nigeria. El modelo declara un F1 ponderado de 71,7, un F1 macro de 69,9 y una precisión del 72,0 sobre el conjunto de test completo de 4515 tuits. Es un modelo de investigación y demostración, no un sistema listo para producción de alto riesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa, base castorini/afriberta_large) para clasificación de secuencias |
| Parametros totales | 125.633.283 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (max_length usado en entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en fp32/fp16) |
| Idiomas soportados | yoruba (yo), inglés (en); orientado a texto code-mixed yo-en |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | text-classification (3 clases: negative, neutral, positive) |
| Modelo base | castorini/afriberta_large |
| Dataset de entrenamiento | shmuhammad/AfriSenti-twitter-sentiment (partición yoruba) |
| Tamaño del repo | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia XLM-RoBERTa, heredado de castorini/afriberta_large, al que se le añade una cabeza de clasificación de 3 clases. AfriBERTa se entrenó originalmente sobre corpus africanos, lo que le proporciona una tokenización y representaciones más adecuadas para lenguas de bajos recursos que un XLM-R estándar.

El fine-tuning se realizó sobre la parte yoruba de AfriSenti-SemEval 2023: 8522 tuits de entrenamiento, un conjunto de desarrollo de 1820 tuits (eliminando los que aparecían en entrenamiento) usado solo para seleccionar la mejor época, y 4515 tuits de test. La receta es: semilla 42, learning rate 5e-05, batch size 32, longitud máxima 128 tokens, hasta 10 épocas, weight decay 0,01, warm-up lineal sobre el 10% del presupuesto de 10 épocas (267 pasos), precisión mixta fp16 y early stopping con paciencia 2 sobre el F1 ponderado del dev limpio, conservando la época 3. Se entrenó en una única GPU Tesla T4 con transformers 5.20.2. No se documenta uso de RLHF ni DPO; es un fine-tuning supervisado estándar.

## Capacidades

- Clasificación de sentimiento en tres clases (negativo, neutro, positivo) de texto en yoruba.
- Manejo de texto code-mixed inglés-yoruba, frecuente en redes sociales nigerianas.
- Procesamiento de publicaciones cortas de redes sociales (hasta 128 tokens).
- Inferencia mediante `transformers.pipeline("text-classification")` con `top_k=None` para obtener las probabilidades de las tres clases.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada a yoruba e inglés; no se declaran otros idiomas.

## Casos de uso

- Monitorización de opinión en redes sociales: clasificar en tiempo real tuits en yoruba o code-mixed para medir la percepción de una marca, un evento o una figura pública, aprovechando que el modelo fue entrenado específicamente sobre este dominio.
- Análisis de conversaciones code-mixed en comunidades nigerianas: detectar el sentimiento de hilos donde los usuarios alternan inglés y yoruba, un escenario que los modelos monolingües suelen fallar.
- Investigación en procesamiento de lenguas africanas: usar el modelo como línea base o componente en estudios de PLN de bajos recursos, dado que el proyecto documenta la receta y las métricas por clase.
- Etiquetado asistido de corpus: pre-anotar grandes volúmenes de tuits en yoruba para su posterior revisión humana, reduciendo el coste de anotación manual.
- Análisis de sentimiento en campañas sociales o políticas locales: agregar la polaridad de miles de publicaciones para informes de opinión, con la cautela de que no debe usarse para decisiones de alto riesgo sobre personas.
- Demostraciones y docencia: servir como ejemplo reproducible de fine-tuning de AfriBERTa para clasificación de sentimiento en un curso o taller, gracias a su tamaño reducido (0,5 GB) y a su receta detallada.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test completo de 4515 tuits (AfriSenti-SemEval 2023, yoruba). No verificados de forma independiente.

| Metrica | Valor |
|---|---|
| Weighted F1 | 71,7 |
| Macro F1 | 69,9 |
| Accuracy | 72,0 |

Desglose por clase:

| Clase | Precision | Recall | F1 | Tuits |
|---|---|---|---|---|
| negative | 61,9 | 61,4 | 61,6 | 981 |
| neutral | 77,0 | 62,9 | 69,3 | 1616 |
| positive | 73,4 | 85,1 | 78,8 | 1918 |

El informe del proyecto reporta la media de 5 semillas: AfriBERTa-large 72,5 F1 ponderado y AfroXLMR-large 73,6, estadísticamente empatados. Este checkpoint es una única ejecución (semilla 42), por lo que su puntuación difiere ligeramente de la del informe.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5-1 GB en fp32 para el checkpoint de 125 M de parámetros; menos de 0,5 GB en fp16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una Tesla T4. Funciona en RTX 3060, RTX 4090 y similares sin problema.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` (pipeline de text-classification), y por ser un encoder estándar puede servirse con TGI, vLLM o exportarse a ONNX. No se publican pesos GGUF, por lo que llama.cpp y Ollama no son opciones directas sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 ponderado (yoruba) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Olasquare/afriberta-large-yoruba-sentiment | 125,6 M | 128 tokens | 71,7 (1 semilla) | no disponible | Hugging Face |
| AfroXLMR-large (fine-tuned, mismo proyecto) | no disponible | no disponible | 73,6 (media 5 semillas) | no disponible | no disponible |
| castorini/afriberta_large (base) | no disponible | no disponible | no aplica (modelo base, sin cabeza de clasificación) | no disponible | Hugging Face |

El informe del proyecto indica que AfriBERTa-large y AfroXLMR-large están estadísticamente empatados en esta tarea. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente con tuits de Twitter/X; otros tipos de texto pueden degradar el rendimiento.
- Los principales errores se producen en refranes e idiomas, sarcasmo y jerga.
- Solo tres clases: los sentimientos mixtos dentro de un mismo tuit se fuerzan a una única etiqueta.
- No apto para decisiones de alto riesgo sobre personas (moderación, contratación, crédito); uso previsto para investigación y demostración.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Ventana de 128 tokens: textos más largos se truncan, lo que puede perder contexto relevante.
- Resultados de una sola semilla y no verificados de forma independiente; pueden variar respecto a la media del informe.
- Riesgo de sesgo y alucinación inherente a los clasificadores entrenados sobre datos de redes sociales, no cuantificado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Olasquare/afriberta-large-yoruba-sentiment
- Modelo base: https://huggingface.co/castorini/afriberta_large
- Código del proyecto: https://github.com/Olasquare043/yoruba-codemix-sentiment
- Dataset AfriSenti-SemEval 2023: https://github.com/afrisenti-semeval/afrisent-semeval-2023
- Dataset en Hugging Face: https://huggingface.co/datasets/shmuhammad/AfriSenti-twitter-sentiment

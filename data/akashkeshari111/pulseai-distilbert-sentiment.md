# akashkeshari111/pulseai-distilbert-sentiment

## Resumen

PulseAI DistilBERT Sentiment es un modelo de clasificación de texto especializado en análisis de sentimiento de reseñas de clientes, desarrollado por akashkeshari111 como parte del proyecto PulseAI, una plataforma de inteligencia de sentimiento para empresas. El modelo clasifica reseñas en tres categorías: negativo, neutral y positivo, y está diseñado para integrarse en flujos de triaje humano, como el enrutamiento y la priorización de feedback de clientes.

Se basa en la arquitectura DistilBERT, una versión destilada de BERT que conserva el 95% del rendimiento original con un 40% menos de parámetros. El modelo tiene 66,9 millones de parámetros y una longitud de contexto de 256 tokens, lo que le permite procesar reseñas de longitud media con una cobertura del 84% del corpus de entrenamiento. Está fine-tuneado sobre el dataset Yelp Review Full, con 12.000 muestras balanceadas de entrenamiento, y alcanza una precisión del 74% y un macro-F1 de 0,739 en un conjunto de test de 2.000 reseñas.

La relevancia de este modelo radica en su ligereza y rapidez: la inferencia tarda aproximadamente 87 ms por muestra en CPU, lo que lo hace adecuado para despliegues sin GPU. Además, su licencia Apache 2.0 permite uso comercial sin restricciones, y su formato safetensors facilita la integración con el ecosistema Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas, 768 dimensiones ocultas, 12 cabezas de atención) |
| Parametros totales | 66.955.779 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (max_seq_length de entrenamiento) |
| Tipos de cuantizacion | no disponible (se puede cuantizar con herramientas estándar, pero no se especifican versiones oficiales) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder destilado de BERT mediante destilación de conocimiento. DistilBERT reduce el número de capas de 12 a 6, mantiene la misma dimensión oculta (768) y el mismo número de cabezas de atención (12), logrando un 40% menos de parámetros y una inferencia un 60% más rápida que BERT base, conservando más del 95% de su rendimiento en GLUE.

El fine-tuning se realizó sobre el dataset Yelp Review Full, con 12.000 reseñas balanceadas para entrenamiento, 2.000 para validación y 2.000 para test (estratificado). Las etiquetas se derivaron de las estrellas: 1-2 estrellas → negativo, 3 → neutral, 4-5 → positivo. Se entrenó durante 2 épocas con batch size 16, learning rate 3e-5, warmup lineal del 10% de los pasos, AdamW con weight decay desacoplado (no aplicado a LayerNorm ni biases), gradient clipping a norma 1.0 y padding dinámico por batch. El checkpoint se seleccionó por macro-F1 de validación, no por pérdida de entrenamiento. El entrenamiento se realizó únicamente en CPU.

Un hallazgo relevante del autor es que el primer intento con `max_seq_length=128` tokens perdía contra un baseline de bolsa de palabras (TF-IDF + regresión logística), porque WordPiece tokeniza el texto en aproximadamente 1,4 tokens por palabra, y 128 tokens solo cubrían el 52% del corpus. Al aumentar a 256 tokens (84% de cobertura), el macro-F1 subió 2,1 puntos, manteniendo constantes el resto de hiperparámetros.

## Capacidades

- Clasificación de sentimiento en tres clases: negativo, neutral y positivo.
- Análisis de reseñas de negocios en inglés, con especialización en feedback de clientes.
- Inferencia rápida en CPU (87 ms por muestra), apta para entornos sin GPU.
- Integración sencilla con la librería `transformers` mediante el pipeline de clasificación de texto.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No es multilingüe; solo procesa texto en inglés.
- No incluye capacidades de visión ni audio.

## Casos de uso

- Triage de reseñas en plataformas de e-commerce: el modelo puede clasificar automáticamente las reseñas de productos en negativas, neutrales y positivas, permitiendo a los equipos de atención al cliente priorizar las quejas urgentes. Su rapidez en CPU lo hace viable para procesar volúmenes moderados sin infraestructura GPU.
- Dashboard de inteligencia de sentimiento: integrado en el proyecto PulseAI, sirve para agregar y visualizar tendencias de opinión de clientes a partir de reseñas de Yelp u otras fuentes similares, ayudando a equipos de producto a identificar problemas recurrentes.
- Enrutamiento de tickets de soporte: al clasificar la polaridad de los mensajes de clientes, puede dirigir automáticamente los casos negativos a agentes especializados y los positivos a encuestas de satisfacción, siempre bajo supervisión humana.
- Monitorización de marca en redes sociales: aunque el dominio principal son reseñas de negocios, puede adaptarse a comentarios de redes sociales en inglés, siempre que el texto tenga una longitud media similar a la del entrenamiento (161 tokens promedio).
- Análisis de feedback en encuestas post-compra: clasifica respuestas abiertas de encuestas de satisfacción, permitiendo segmentar los resultados por polaridad sin necesidad de etiquetado manual.
- Pipeline de NLP en producción: al ser un modelo pequeño y con licencia Apache 2.0, puede desplegarse en servicios serverless o contenedores ligeros, integrándose con FastAPI o frameworks similares para ofrecer una API de análisis de sentimiento.

## Benchmarks y rendimiento

El autor publicó resultados sobre un conjunto de test retenido de 2.000 reseñas, comparando con un baseline de bolsa de palabras:

| Modelo | Accuracy | Macro-F1 |
|---|---|---|
| TF-IDF + Logistic Regression (baseline) | 0,7250 | 0,7237 |
| DistilBERT, max_seq_length=128 | 0,7170 | 0,7180 |
| DistilBERT, max_seq_length=256 (este modelo) | 0,7400 | 0,7390 |

Desglose por clase del modelo final:

| Clase | Precision | Recall | F1 |
|---|---|---|---|
| negative | 0,826 | 0,786 | 0,806 |
| neutral | 0,637 | 0,611 | 0,624 |
| positive | 0,755 | 0,823 | 0,788 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GLUE para este fine-tuning específico.

## Requisitos de hardware

- Inferencia en CPU: aproximadamente 87 ms por muestra, por lo que puede ejecutarse en CPUs de gama media sin necesidad de GPU.
- VRAM estimada: al tener 66,9 millones de parámetros, en FP32 ocupa unos 268 MB, en FP16 unos 134 MB y en int8 unos 67 MB. Esto permite su ejecución en GPUs con tan solo 1-2 GB de VRAM, como una NVIDIA GTX 1050 Ti o superior.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere GPUs de alta gama como A100 o H100.
- Opciones de despliegue: compatible con la librería `transformers` (pipeline de clasificación), y puede servirse mediante FastAPI, vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con text-embeddings-inference según las etiquetas del repositorio.
- Latencia y throughput: en CPU, 87 ms por muestra implica un throughput de aproximadamente 11,5 muestras por segundo en un solo hilo. Con batching y GPU, el throughput puede ser significativamente mayor, aunque no se han publicado cifras oficiales.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de análisis de sentimiento en la información proporcionada. Sin embargo, se puede contextualizar cualitativamente:

- Frente a `bert-base-uncased` (110M parámetros), DistilBERT es un 40% más ligero y un 60% más rápido, con una pérdida de rendimiento inferior al 5% en tareas de GLUE. Para esta tarea específica, el modelo alcanza un macro-F1 de 0,739, mientras que un BERT base fine-tuneado podría obtener resultados ligeramente superiores, pero con mayor coste computacional.
- Frente a modelos más grandes como `roberta-base` (125M parámetros), DistilBERT es más rápido y ligero, pero probablemente menos preciso en tareas de sentimiento con matices. No hay datos comparativos publicados.
- Frente a modelos modernos de pocos parámetros como `distilroberta-base` o `MiniLM`, no se dispone de información en la documentación del autor.

## Limitaciones y advertencias

- Ruido de etiquetas: la clase neutral se define por reseñas de 3 estrellas, que son intrínsecamente ambiguas. Esto limita el rendimiento de la clase neutral (F1 de 0,624) y no se puede mejorar con un modelo más grande; requiere anotación humana.
- Dominio limitado: el modelo está entrenado exclusivamente con reseñas de negocios en inglés. Textos de redes sociales, mensajes cortos, texto code-mixed o tickets de soporte técnico están fuera de distribución y no se han medido.
- Entradas muy cortas: el modelo fue entrenado con texto de 161 tokens promedio; entradas de pocas palabras son poco fiables.
- Sarcasmo: el modelo no detecta sarcasmo, lo que puede llevar a clasificaciones erróneas en reseñas irónicas.
- Uso previsto: el autor indica que el modelo está pensado para estar delante de un flujo de triaje humano (enrutamiento y ranking), no para tomar acciones automáticas sobre un cliente individual.
- Sesgos: al estar entrenado en reseñas de Yelp, puede reflejar sesgos presentes en ese dataset (por ejemplo, sobre tipos de negocio o regiones geográficas), aunque no se han documentado análisis de sesgo específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akashkeshari111/pulseai-distilbert-sentiment
- Repositorio PulseAI (dashboard de sentimiento): https://github.com/AkashKeshari111/pulseai-sentiment-dashboard
- Repositorio relacionado (Pulse-ai, otro autor): https://github.com/ahmedxzarai/Pulse-ai
- Repositorio relacionado (PulseAI API, otro autor): https://github.com/gowthamk2503/PulseAI

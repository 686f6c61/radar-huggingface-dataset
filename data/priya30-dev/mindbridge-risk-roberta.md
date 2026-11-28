# priya30-dev/mindbridge-risk-roberta

## Resumen

MindBridge risk classifier es un modelo de clasificación de texto basado en `FacebookAI/roberta-base`, ajustado por el usuario priya30-dev para la detección de riesgo en salud mental a partir de publicaciones cortas. Clasifica cada texto en tres categorías: No Signal, Mild Risk y High Risk, y forma parte del proyecto MindBridge, una herramienta de cribado (screening) que combina este clasificador con un detector de lenguaje de crisis basado en reglas. Con 124,6 millones de parámetros, es un modelo encoder de tamaño contenido, pensado para inferencia ligera y despliegue sencillo.

El modelo resuelve un problema concreto: convertir texto libre de estilo redes sociales en una señal de riesgo graduada que un sistema mayor pueda usar como entrada. El repositorio incluye una fórmula explícita para calcular una puntuación de riesgo de 0 a 100 a partir de las probabilidades de las clases Mild y High, lo que facilita su integración en pipelines de triaje. Está entrenado exclusivamente en inglés y su model card insiste en que es una ayuda al cribado, no un diagnóstico clínico.

Es relevante ahora porque ejemplifica el patrón de modelos pequeños y especializados (encoders fine-tuneados) frente a los LLM generalistas para tareas de clasificación con requisitos de latencia y coste bajos. No obstante, el modelo tiene 0 descargas y 0 likes en el momento de la consulta, no declara licencia y no ha sido validado clínicamente, lo que limita seriamente su uso en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base) |
| Parametros totales | 124.647.939 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (roberta-base soporta hasta 512 tokens, dato no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de texto (3 clases: No Signal, Mild Risk, High Risk) |
| Modelo base | FacebookAI/roberta-base |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `roberta-base`, un transformer encoder de 12 capas y 124,6 millones de parámetros con tokenización BPE a nivel de byte. La cabeza de clasificación produce tres logits correspondientes a las clases No Signal, Mild Risk y High Risk. El preprocesado de entrada incluye minúsculas y una limpieza de texto concreta (`src/risk_model.clean`) que debe replicarse en inferencia para mantener la coherencia con el entrenamiento.

Los datos de entrenamiento provienen del dataset `gokulan006/risk-analysis-dataset`, construido a partir de dos conjuntos de Kaggle: "Sentiment Analysis for Mental Health" y "Suicidal Tweet Detection". La model card advierte de que los ejemplos en hindi o hinglish, si aparecen listados, fueron traducidos automáticamente con `Helsinki-NLP/opus-mt-en-hi` y romanizados, por lo que sus métricas miden texto traducido y no publicaciones nativas. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de regularización o ajuste de umbrales más allá del fine-tuning supervisado estándar.

## Capacidades

- Clasificación de texto corto en tres niveles de riesgo de salud mental: No Signal, Mild Risk y High Risk.
- Cálculo de una puntuación de riesgo de 0 a 100 mediante la fórmula `100 × (0,5 × P(Mild) + 1,0 × P(High))`, definida en la model card.
- Detección de señales de riesgo en texto de estilo redes sociales en inglés.
- Integración con un detector de crisis basado en reglas dentro del sistema MindBridge (el modelo por sí solo no cubre esa función).
- Clasificación de una sola etiqueta por texto (no es multi-etiqueta ni generativo).
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente, visión, audio ni modo de pensamiento.

## Casos de uso

- Cribado inicial en foros o comunidades: el modelo puede puntuar cada publicación entrante y derivar las que superen un umbral de riesgo a un moderador humano, usando la puntuación 0-100 como criterio de priorización.
- Triaje en aplicaciones de bienestar emocional: integrado en un chatbot o diario digital, puede clasificar las entradas del usuario y activar recursos de ayuda cuando la clase High Risk sea predominante.
- Enrutamiento en sistemas de atención al cliente con contenido sensible: permite separar mensajes que requieren protocolo de crisis de los que no, siempre como primera capa y con revisión humana posterior.
- Investigación académica sobre detección de riesgo: sirve como línea base reproducible (F1 ponderado de 0,85 en el conjunto de test del autor) para comparar con otros enfoques.
- Análisis de corpus de redes sociales a posteriori: clasificación por lotes de tuits o posts para estudios de prevalencia, con la advertencia de que no está validado clínicamente.
- Componente de un pipeline de moderación más amplio: combinado con el detector de reglas de MindBridge y con helplines mostradas al usuario, tal como describe la model card.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un conjunto de test de 4.350 ejemplos:

| Metrica | Valor |
|---|---|
| Accuracy | 0,8494 |
| F1 ponderado (weighted F1) | 0,8500 |
| F1 macro | 0,8480 |
| Precision media ponderada | 0,8506 |
| Recall medio ponderado | 0,8494 |

Desglose por clase:

| Clase | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| No Signal | 0,9651 | 0,9458 | 0,9553 | 1346 |
| Mild Risk | 0,8296 | 0,8328 | 0,8312 | 1848 |
| High Risk | 0,7509 | 0,7638 | 0,7573 | 1156 |

Matriz de confusión (filas = real, columnas = predicho; orden No Signal, Mild, High):

| | No Signal | Mild | High |
|---|---|---|---|
| No Signal | 1273 | 55 | 18 |
| Mild | 34 | 1539 | 275 |
| High | 12 | 261 | 883 |

La clase High Risk es la más débil (F1 de 0,7573) y concentra los errores: 261 casos de riesgo alto se clasifican como Mild y 12 como No Signal. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos, más overhead de activaciones y tokenizador; en la práctica cabe en cualquier GPU con 2 GB o más.
- En fp16: alrededor de 0,25 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU para volúmenes moderados; A100 y H100 no son necesarias para este tamaño.
- Cabe holgadamente en GPU consumer y en entornos sin GPU (inferencia en CPU viable para clasificación por lotes).
- Opciones de despliegue: `transformers` (PyTorch), `text-embeddings-inference` o `TGI` para clasificación, ONNX Runtime, y exportación a GGUF para llama.cpp aunque no se documenta oficialmente.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y decenas de milisegundos por petición en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| priya30-dev/mindbridge-risk-roberta | 124,6 M | no disponible | Clasificacion de riesgo en salud mental (3 clases) | no disponible | Hugging Face (0 descargas) |
| FacebookAI/roberta-base | 124,6 M | 512 tokens | Modelo base de lenguaje (masked LM) | MIT (segun el repositorio original) | Hugging Face, ampliamente usado |
| Modelos de clasificacion de salud mental en Hugging Face | no disponible | no disponible | Clasificacion de texto | variable | variable |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- No validado clínicamente: la model card indica explícitamente que es una ayuda al cribado y no un diagnóstico.
- Entrenado solo con datos de estilo redes sociales en inglés; puede fallar ante sarcasmo, lenguaje indirecto o contexto cultural.
- Los ejemplos en hindi o hinglish, si existen, proceden de traducción automática y sus métricas no reflejan texto nativo.
- La clase High Risk tiene el peor rendimiento (F1 de 0,7573) y es la más crítica en un contexto de seguridad; los falsos negativos hacia Mild o No Signal son un riesgo relevante.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- El modelo tiene 0 descargas y 0 likes, sin validación independiente por parte de la comunidad.
- No debe usarse como único mecanismo de seguridad; la model card recomienda combinarlo con el detector de reglas de MindBridge y mostrar líneas de ayuda.
- Riesgo de sesgo derivado de los datasets de origen (Kaggle), cuyas licencias y composición deben verificarse antes de reutilizar el modelo.
- El preprocesado es obligatorio: si no se aplica la misma limpieza y minúsculas que en entrenamiento, las predicciones pueden degradarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/priya30-dev/mindbridge-risk-roberta
- Repositorio del proyecto MindBridge: https://github.com/priya30-dev/MindBridge-Mental-Health-Screening
- Dataset de entrenamiento: https://huggingface.co/datasets/gokulan006/risk-analysis-dataset
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Traducción usada para datos hindi/hinglish: https://huggingface.co/Helsinki-NLP/opus-mt-en-hi

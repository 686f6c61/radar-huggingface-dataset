# PrinceParvez/customer-support-ai

## Resumen

Customer Support AI es un modelo de clasificación de texto desarrollado por PrinceParvez para identificar la intención de los mensajes de soporte al cliente en el sector bancario. El modelo está entrenado sobre el conjunto de datos Banking77, que contiene consultas bancarias reales etiquetadas en 77 categorías de intención distintas. Su objetivo es automatizar el enrutamiento de consultas de soporte, permitiendo que cada mensaje se dirija al flujo de trabajo adecuado sin intervención manual.

El modelo se implementa como un pipeline de clasificación de texto de scikit-learn, guardado en formato joblib. No se especifica la arquitectura interna exacta (por ejemplo, si usa TF-IDF con un clasificador lineal o un enfoque similar), pero se trata de un modelo clásico de aprendizaje automático, no de un transformador profundo. Su relevancia radica en su sencillez y su bajo coste computacional: puede desplegarse en CPU y ofrece una precisión de test del 84,70 %, lo que lo convierte en una opción práctica para sistemas de soporte bancario con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn (no se especifica el algoritmo exacto) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica a un clasificador de texto tradicional) |
| Tipos de cuantización | No disponible (el modelo se distribuye como archivo `.pkl` de joblib) |
| Idiomas soportados | No disponible (el dataset Banking77 está en inglés) |
| Licencia | MIT |
| Formato de pesos | joblib (`.pkl`) |

## Arquitectura y entrenamiento

El modelo es un clasificador de texto de scikit-learn entrenado con el dataset Banking77, que contiene consultas bancarias reales etiquetadas en 77 intenciones. El proceso de entrenamiento sigue un pipeline completo: inspección del dataset, limpieza de datos, división en conjuntos de entrenamiento, validación y prueba, entrenamiento del modelo, evaluación y análisis de errores. No se especifica el algoritmo concreto (por ejemplo, SVM, regresión logística o árboles), ni el método de vectorización (TF-IDF, conteo de palabras, etc.).

No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje generativo sino un clasificador supervisado clásico. Tampoco se indican innovaciones técnicas destacadas, más allá de la integración de una pipeline completa de clasificación y análisis de errores.

## Capacidades

- Clasificación de intenciones en 77 categorías bancarias (por ejemplo, `card_arrival`, `cancel_transfer`, `top_up_failed`, `lost_or_stolen_card`).
- Procesamiento de mensajes de texto en lenguaje natural y devolución de la intención más probable.
- Acepta una lista de mensajes y devuelve las predicciones correspondientes (por ejemplo, `model.predict(["My card hasn't arrived yet"])`).
- Funciona como un clasificador de una sola etiqueta (cada mensaje se asigna a una única intención).
- No tiene capacidades de generación de texto, tool calling, agentes o razonamiento multi-paso.
- No soporta entrada multimodal ni visión; es exclusivamente texto.

## Casos de uso

- Enrutamiento automático de tickets de soporte: clasificar las consultas entrantes de clientes bancarios para asignarlas al departamento o flujo de trabajo correcto (por ejemplo, tarjetas, transferencias, verificación de identidad).
- Chatbots de atención al cliente: integrar el modelo en un bot para identificar la intención del usuario y ofrecer respuestas o acciones predefinidas en consecuencia.
- Priorización de mensajes: detectar intenciones críticas como `lost_or_stolen_card` o `compromised_card` para priorizarlas en la cola de atención.
- Análisis de tickets en centros de soporte: clasificar tickets de ayuda existentes para generar informes de categorías y métricas de rendimiento.
- Detección de consultas recurrentes: identificar las intenciones más frecuentes en un volumen de mensajes para optimizar los procesos de soporte.
- Automatización de respuestas para intenciones simples: responder automáticamente a mensajes como `card_arrival` o `exchange_rate` con información estándar, reduciendo la carga de los agentes humanos.

## Benchmarks y rendimiento

El modelo se evaluó con un conjunto de validación y un conjunto de test separados, ambos de 1.000 muestras. Los resultados publicados son:

| Métrica | Valor |
|---|---|
| Precisión de validación | 83, 90 % |
| Precisión de test | 84, 70 % |
| Macro F1 (test) | 0, 85 |
| Weighted F1 (test) | 0, 85 |

El análisis de errores sobre el conjunto de validación mostró una tasa de error del 16, 10 % (161 predicciones incorrectas de 1.000). Los errores se concentran en intenciones semánticamente similares, como pagos pendientes, fallidos o revertidos, problemas de tarjeta o transferencias.

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo es un clasificador de scikit-learn de tamaño reducido, almacenado en un archivo `.pkl` de aproximadamente 0.0 GB.
- Se puede ejecutar en cualquier CPU moderna sin necesidad de GPU.
- No se requieren requisitos de VRAM ni tarjetas gráficas específicas.
- La inferencia es rápida y de baja latencia, aunque no se especifican medidas concretas de throughput.
- Para su despliegue se puede usar Python directamente con `joblib`, o integrarlo en una API con frameworks como Flask o FastAPI. No es compatible con vLLM, Ollama o TGI, que están orientados a modelos generativos.

## Comparativa con modelos similares

No se ha encontrado información sobre modelos directamente comparables con las mismas características (clasificador de texto clásico para intents bancarios con scikit-learn). Los modelos de clasificación de intenciones basados en transformadores (por ejemplo, fine-tuning de BERT sobre Banking77) suelen alcanzar precisiones superiores al 90 %, pero requieren mucho más recursos computacionales y no se especifican datos de comparación en la documentación. Por tanto, no se dispone de una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en el dataset Banking77, que contiene consultas bancarias en inglés; no se garantiza su rendimiento con otros idiomas o dominios fuera de la banca.
- Presenta errores sistemáticos entre intenciones semánticamente próximas (por ejemplo, `pending_payment`, `failed_payment`, `reverted_payment`), lo que puede provocar enrutamientos incorrectos.
- Al ser un clasificador de una sola etiqueta, no es capaz de manejar consultas con múltiples intenciones simultáneas.
- No se han documentado sesgos específicos, pero al tratarse de un dataset público es probable que refleje los sesgos presentes en los datos originales.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo no incluye garantías de precisión ni soporte técnico.
- Para producción, se recomienda evaluar el modelo con datos propios y considerar un umbral de confianza para derivar casos ambiguos a agentes humanos.

## Enlaces

- [Hugging Face - PrinceParvez/customer-support-ai](https://huggingface.co/PrinceParvez/customer-support-ai)

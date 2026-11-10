# danjai/scamlens-qs-google-bert-v2

## Resumen

ScamLens quick_score google-bert-v2 es un clasificador binario de texto que estima la probabilidad de que un SMS o mensaje de chat sea una estafa. Lo desarrolla el usuario danjai en el contexto de un proyecto de curso universitario (IS469) llamado ScamLens, un agente de investigación de fraudes. El modelo es uno de los candidatos entrenados y comparados durante el proyecto, y el autor indica explícitamente que no es el que ScamLens usa en producción.

Técnicamente es un fine-tuning de `google-bert/bert-base-uncased`, un transformer encoder de arquitectura BERT con 109.483.778 parámetros totales (unos 109,5 millones), almacenado en safetensors y con un tamaño de repositorio de 0,4 GB. La tarea es de clasificación de secuencias con dos etiquetas (`0 = genuine`, `1 = scam`) y una longitud máxima de entrada de 192 tokens durante el entrenamiento.

Su relevancia es acotada y muy específica: sirve como primera opinión sobre el texto de un mensaje dentro de un pipeline de detección de fraude, no como sistema autónomo de bloqueo. Está entrenado sobre mensajes en inglés con contexto de Singapur (bancos, agencias y servicios de pago locales), lo que limita su validez fuera de ese dominio. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (bert-base-uncased) |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 192 tokens (max_length de entrenamiento); límite nativo de BERT base: 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `google-bert/bert-base-uncased`, es decir, un transformer encoder bidireccional con cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`). No hay innovaciones arquitectónicas: se reutiliza la pila estándar de BERT base y se añade la capa de clasificación sobre el token `[CLS]`. La entrada se trunca a 192 tokens, por debajo del máximo nativo de 512 de BERT base.

Los hiperparámetros declarados en la model card son: 4 épocas, learning rate 3e-05, batch size 12, `max_length` 192, `warmup_ratio` 0.1, `weight_decay` 0.01, scheduler lineal, pesos de clase balanceados, `val_ratio` 0.15 y semilla 42. El conjunto de entrenamiento contiene 2171 ejemplos (1846 para entrenamiento y 325 para validación). Los datos son mensajes de estafa y mensajes genuinos de estilo singapurense: mensajes tomados o reconstruidos de avisos públicos de fraude, mensajes sintéticos, alertas bancarias generadas en pares genuino/estafa y SMS cotidianos de corpus públicos. El autor publica los hashes SHA-256 de los conjuntos de entrenamiento y test. No se documenta uso de RLHF, DPO ni técnicas de alineación adicionales; es un fine-tuning supervisado clásico.

## Capacidades

- Clasificación binaria de texto: devuelve la probabilidad de que un mensaje sea estafa frente a genuino (etiquetas `0 = genuine`, `1 = scam`).
- Detección basada exclusivamente en el texto del mensaje: analiza el fraseo, no metadatos.
- Umbral configurable: el autor documenta un corte de 0.50 para considerar estafa y una escala de severidad en ScamLens (alta desde 0.70, media desde 0.50, baja por debajo).
- Integración como herramienta `quick_score` dentro del agente ScamLens, configurable mediante la variable de entorno `SCAMLENS_QUICK_SCORE_MODEL`.
- Inferencia estándar con `transformers` y compatibilidad declarada con Text Embeddings Inference y endpoints.
- Capacidades multilingües: no, solo inglés.
- Tool calling, function calling, agentes multi-paso, modo thinking, visión o audio: no disponibles; el modelo es un clasificador, no un generador.

## Casos de uso

- Filtro de primera pasada en un pipeline antiphishing: clasificar el texto de SMS o mensajes de chat entrantes y derivar solo los casos con probabilidad alta a revisión humana o a herramientas adicionales (análisis de enlaces, remitente y números de teléfono), que en ScamLens son módulos separados.
- Triaje en atención al cliente: puntuar mensajes que los usuarios reenvían como sospechosos para priorizar colas de soporte, usando el umbral de 0.50 como corte operativo y el de 0.70 para escalado.
- Etiquetado asistido de corpus: preanotar grandes volúmenes de SMS en inglés para construir datasets de fraude, revisando manualmente los casos cercanos al umbral.
- Módulo de demostración en docencia o investigación: el modelo es un ejemplo reproducible de fine-tuning de BERT con datos sintéticos y públicos, con hashes de dataset y métricas de validación y test publicadas.
- Detección en el dominio de Singapur: alertas bancarias, agencias locales y servicios de pago singapurenses, donde el vocabulario y los patrones de los datos de entrenamiento son representativos.
- Componente de un sistema de scoring por capas: combinar la probabilidad del texto con señales externas (reputación de dominio, listas de números) para reducir falsos positivos, dado que el modelo por sí solo clasifica erróneamente 11 de 74 mensajes genuinos en el conjunto de test.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. El conjunto de test son 178 mensajes singapurenses escritos a mano, nunca presentes en entrenamiento; se considera estafa a partir de probabilidad 0.50. Los rangos son intervalos de confianza al 95%.

| Metrica | Valor | IC 95% |
|---|---|---|
| F1 de validacion | 0.990 | no disponible |
| Accuracy (test) | 0.904 | 0.852 - 0.940 |
| Recall de estafa (test) | 0.942 | 0.880 - 0.973 |
| Precision de estafa (test) | 0.899 | 0.828 - 0.943 |
| F1 (test) | 0.920 | no disponible |
| Genuinos clasificados como estafa | 11 de 74 | no disponible |
| Estafas no detectadas | 6 de 104 | no disponible |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 para los 109,5 millones de parámetros, más el overhead de activaciones y tokenizador; en la práctica cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; una RTX 3060, RTX 4090, T4, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en todas las GPU modernas, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` (documentado por el autor), Text Embeddings Inference (declarado en los tags), endpoints compatibles y, en general, cualquier runtime que cargue safetensors de BERT.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas en la información proporcionada, por lo que la comparación numérica no está disponible. A modo de referencia estructural:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| danjai/scamlens-qs-google-bert-v2 | 109,5 M | 192 tokens (entrenamiento) | no disponible | Hugging Face, 0 descargas |
| google-bert/bert-base-uncased (base) | 110 M aprox. | 512 tokens | Apache 2.0 (modelo base) | Hugging Face, ampliamente usado |
| Alternativas de clasificación de spam/scam | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo evalúa el fraseo del mensaje: no comprueba enlaces, números de teléfono ni remitentes. En ScamLens esas comprobaciones son herramientas separadas y esta puntuación es solo una primera opinión.
- Entrenado con mensajes en inglés y contexto de Singapur (bancos, agencias y servicios de pago locales); se espera menor fiabilidad en otros países, idiomas o dominios.
- El conjunto de test es pequeño (178 mensajes), por lo que los intervalos de confianza son amplios (por ejemplo, accuracy entre 0.852 y 0.940).
- Tasa de falsos positivos relevante: 11 de 74 mensajes genuinos clasificados como estafa en test.
- El autor advierte explícitamente de que no debe usarse solo para bloquear o acusar a nadie.
- Licencia no declarada: no hay autorización explícita para uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Es un modelo candidato de un proyecto de curso, no el modelo que ScamLens usa en producción; no hay evidencia de mantenimiento ni de uso en entornos reales.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí riesgo de clasificación errónea por sobreajuste al dominio de entrenamiento.
- Sesgos conocidos: no documentados por el autor; al entrenarse con datos sintéticos y avisos públicos de Singapur, puede sobrerrepresentar patrones concretos de bancos y agencias locales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danjai/scamlens-qs-google-bert-v2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- No se han encontrado otros enlaces (paper, blog, repositorio o demo) en la información disponible.

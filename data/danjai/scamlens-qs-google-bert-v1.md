# danjai/scamlens-qs-google-bert-v1

## Resumen

ScamLens quick_score google-bert-v1 es un clasificador binario de texto especializado en la detección de mensajes fraudulentos (scam) en SMS y chats. Lo desarrolla el usuario danjai como parte de ScamLens, un agente de investigación de fraudes construido para un proyecto de curso universitario (IS469). El modelo parte de `google-bert/bert-base-uncased` y se afina para emitir una probabilidad de que un mensaje sea estafa, actuando como la herramienta `quick_score` del agente.

Técnicamente es un transformer encoder BERT-base con 109.483.778 parámetros y una ventana de entrada de 128 tokens. Su ámbito es deliberadamente estrecho: mensajes en inglés con contexto de Singapur (bancos locales, agencias y servicios de pago). No analiza enlaces, números de teléfono ni remitentes; solo evalúa la redacción.

Es relevante como ejemplo de clasificador de dominio muy específico y de bajo coste computacional, pero conviene subrayar que el propio autor indica que este no es el modelo con el que opera ScamLens en producción, sino uno de los candidatos comparados. El conjunto de test es pequeño (178 mensajes), por lo que los intervalos de confianza son amplios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) para clasificación de secuencias |
| Parametros totales | 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un `BertForSequenceClassification` construido sobre `google-bert/bert-base-uncased`, con una cabeza de clasificación de dos etiquetas (`0 = genuine`, `1 = scam`). El ajuste fino se realizó durante 2 épocas con learning rate 2e-05, batch size 16, `max_length` 128, `warmup_ratio` 0.1, `weight_decay` 0.01, scheduler lineal, pesos de clase balanceados, `val_ratio` 0.1 y semilla 42.

Los datos de entrenamiento suman 2171 ejemplos (1954 para entrenamiento y 217 para validación), distribuidos en el fichero `sg_quick_score_train.csv`. La composición descrita incluye mensajes de estafa y mensajes genuinos al estilo de Singapur: mensajes tomados o reconstruidos a partir de avisos públicos de fraude, mensajes sintéticos, alertas bancarias generadas en pares genuino/estafa y SMS cotidianos de corpus públicos. El autor publica los hashes SHA-256 de los datos de entrenamiento y de test. No se documenta uso de RLHF, DPO ni innovaciones arquitectónicas adicionales; se trata de un ajuste fino supervisado convencional.

## Capacidades

- Clasificación binaria de texto: devuelve la probabilidad de que un mensaje SMS o de chat sea una estafa.
- Detección basada exclusivamente en la redacción del mensaje (wording), sin análisis de metadatos.
- Salida calibrada como probabilidad mediante softmax sobre dos logits.
- Umbral operativo documentado en ScamLens: alto desde 0.70, medio desde 0.50, bajo por debajo.
- Integración con la librería `transformers` y con Text Embeddings Inference (tag `text-embeddings-inference`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente por sí mismo; es una herramienta invocada dentro del agente ScamLens.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Filtro previo en pasarelas de SMS: el modelo puede puntuar cada mensaje entrante y marcar como sospechosos aquellos con probabilidad superior a 0.50 antes de un análisis más profundo, gracias a su coste de inferencia reducido (BERT-base, 128 tokens).
- Herramienta `quick_score` dentro de un agente antifraude: se integra mediante la variable de entorno `SCAMLENS_QUICK_SCORE_MODEL` y aporta una primera opinión sobre la redacción que el agente combina con comprobaciones de enlaces, teléfonos y remitentes.
- Moderación de chats de atención al cliente: permite señalar mensajes de usuarios que imitan lenguaje de alertas bancarias o suplantación de entidades.
- Investigación académica sobre detección de fraude: sirve como línea base reproducible (semilla 42, hiperparámetros y hashes publicados) para comparar con otros clasificadores.
- Etiquetado asistido de corpus: puede preclasificar grandes volúmenes de SMS en inglés para priorizar la revisión humana de los casos dudosos.
- Formación y concienciación: permite demostrar en entornos educativos cómo un modelo pequeño detecta patrones lingüísticos de estafa en mensajes de estilo singapurense.

## Benchmarks y rendimiento

| Metrica | Valor | Intervalo de confianza 95% |
|---|---|---|
| F1 en validación | 0.985 | no disponible |
| Accuracy en test | 0.865 | 0.807 - 0.908 |
| Recall de estafa en test | 0.913 | 0.844 - 0.954 |
| Precision de estafa en test | 0.864 | 0.787 - 0.916 |
| F1 en test | 0.888 | no disponible |
| Genuinos clasificados como estafa | 15 de 74 | no disponible |
| Estafas no detectadas | 9 de 104 | no disponible |

El conjunto de test son 178 mensajes de Singapur escritos a mano que no aparecen en los datos de entrenamiento; un mensaje se considera estafa con probabilidad igual o superior a 0.50. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0.44 GB solo para pesos (109,5 M de parámetros), más activaciones y overhead; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En fp16 o bf16 los pesos ocupan alrededor de 0.22 GB, por lo que es viable incluso en CPU para volúmenes moderados.
- GPU recomendadas: cualquier GPU moderna; para alto throughput, A100, H100, L4 o RTX 4090; para desarrollo, RTX 3060 o superior.
- Cabe en GPU de consumo: sí, en cualquier modelo con al menos 2 GB de VRAM.
- Opciones de despliegue: `transformers` (PyTorch), Text Embeddings Inference (tag `text-embeddings-inference`), y exportación a ONNX u otros runtimes no documentados por el autor.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danjai/scamlens-qs-google-bert-v1 | 109,5 M | 128 tokens | Clasificación scam/genuine (SMS, Singapur) | no disponible | Hugging Face |
| google-bert/bert-base-uncased | 109,5 M | 512 tokens | Modelo base de propósito general (MLM) | Apache 2.0 (modelo base) | Hugging Face |
| Clasificadores de spam SMS genéricos | no disponible | no disponible | Clasificación spam/no spam | variable | Hugging Face |

La comparación directa con alternativas específicas de detección de estafa en SMS de Singapur no está disponible en la información proporcionada. Frente a su modelo base, este ajuste fino reduce el contexto efectivo a 128 tokens y especializa la salida en dos clases.

## Limitaciones y advertencias

- Solo evalúa la redacción: no comprueba enlaces, números de teléfono ni remitentes, por lo que puede pasar por alto estafas cuyo texto sea neutro pero cuyos indicadores estén en los metadatos.
- Entrenado con mensajes en inglés y contexto de Singapur; su fiabilidad fuera de ese ámbito geográfico y lingüístico es menor según el propio autor.
- El conjunto de test es pequeño (178 mensajes), lo que produce intervalos de confianza amplios y limita la solidez de las métricas.
- Tasa relevante de falsos positivos: 15 de 74 mensajes genuinos fueron clasificados como estafa en el test.
- Tasa de falsos negativos: 9 de 104 estafas no se detectaron.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas con alta confianza.
- No debe usarse por sí solo para bloquear mensajes ni acusar a personas, tal como advierte el autor.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor.
- No es el modelo que ScamLens usa en producción, sino un candidato comparado del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danjai/scamlens-qs-google-bert-v1
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased

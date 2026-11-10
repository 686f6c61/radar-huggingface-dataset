# danjai/scamlens-qs-google-bert-v3

## Resumen

ScamLens quick_score google-bert-v3 es un clasificador de texto binario derivado de `google-bert/bert-base-uncased`, ajustado por el usuario danjai para estimar la probabilidad de que un mensaje SMS o de chat sea una estafa. Forma parte del proyecto ScamLens, un agente de investigación de fraudes desarrollado en el marco de un proyecto de curso universitario (IS469), y constituye uno de los modelos candidatos evaluados, no el que el sistema usa finalmente en producción.

El modelo resuelve una tarea acotada: analizar únicamente la formulación lingüística del mensaje y devolver una probabilidad entre 0 y 1 (etiqueta 0 = genuino, 1 = estafa). No inspecciona enlaces, números de teléfono ni remitentes; esas comprobaciones corresponden a otras herramientas del agente. Está entrenado sobre mensajes en inglés con contexto de Singapur (bancos, agencias y servicios de pago locales) y su ámbito de aplicación es, por tanto, limitado a ese dominio.

Arquitectura BERT base (encoder transformer) con 109.483.778 parámetros totales, contexto de entrada de 512 tokens (aunque el entrenamiento usó `max_length` de 192) y pesos en formato safetensors. Es un modelo pequeño, desplegable en CPU y en GPU de consumo, pensado como señal rápida de primer nivel dentro de un pipeline mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), `google-bert/bert-base-uncased` ajustado |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite de BERT base); entrenamiento con `max_length` 192 |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original; admite cuantización dinámica estándar de PyTorch/ONNX no documentada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `bert-base-uncased` para clasificación de secuencias (`AutoModelForSequenceClassification`), con dos etiquetas de salida. El entrenamiento se realizó durante 3 épocas con tasa de aprendizaje 2e-5, tamaño de lote 16, `max_length` 192, `warmup_ratio` 0.1, `weight_decay` 0.01, planificador lineal, pesos de clase balanceados, semilla 42 y una división de validación del 10 %. El conjunto de datos contiene 2.171 ejemplos (1.954 para entrenamiento y 217 para validación), procedentes de un único fichero `sg_quick_score_train.csv` con hash SHA-256 documentado.

Los datos combinan mensajes de estafa y mensajes genuinos de estilo singapurense: mensajes extraídos o reconstruidos a partir de avisos públicos de fraude, mensajes sintéticos, alertas bancarias generadas en pares genuino/estafa y SMS cotidianos de corpus públicos. No se documenta el uso de RLHF, DPO ni ninguna innovación arquitectónica adicional; se trata de un ajuste supervisado convencional con ponderación de clases para compensar el desbalanceo.

## Capacidades

- Clasificación binaria de texto: devuelve la probabilidad de que un mensaje SMS o de chat sea una estafa (etiqueta 1) o genuino (etiqueta 0).
- Análisis exclusivo de la formulación lingüística del mensaje; no evalúa enlaces, números de teléfono ni remitentes.
- Integración como herramienta `quick_score` dentro del agente ScamLens, configurable mediante la variable de entorno `SCAMLENS_QUICK_SCORE_MODEL`.
- Umbrales de lectura documentados por el autor: probabilidad alta desde 0.70, media desde 0.50, baja por debajo de 0.50.
- Compatible con `transformers` y con Text Embeddings Inference (tag `text-embeddings-inference`), además de endpoints compatibles.
- Capacidad multilingüe: no disponible; solo inglés.
- Sin soporte de tool calling, agentes autónomos, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Filtro de primera pasada en pasarelas de SMS: el modelo puntúa cada mensaje entrante en milisegundos y permite derivar solo los casos con probabilidad media o alta a revisión humana o a herramientas más costosas, reduciendo el volumen de análisis profundo.
- Señal auxiliar en agentes antifraude: integrado como `quick_score` dentro de ScamLens, aporta una opinión inicial sobre la redacción del mensaje que se combina con comprobaciones de enlaces y remitentes realizadas por otras herramientas.
- Etiquetado previo de bandejas de entrada corporativas: clasificación por lotes de mensajes recibidos por empleados para marcar candidatos a suplantación de identidad antes de la revisión del equipo de seguridad.
- Investigación académica sobre detección de fraude: modelo de referencia pequeño y reproducible (semilla fija, hashes de datos documentados) para comparar técnicas de clasificación en dominios SMS con recursos limitados.
- Formación y concienciación: generación de puntuaciones sobre mensajes de ejemplo en talleres de seguridad para ilustrar qué rasgos lingüísticos elevan la probabilidad de estafa.
- Prototipado rápido en CPU: al tratarse de un BERT base de 109 millones de parámetros, permite validar pipelines de clasificación de fraude sin GPU dedicada antes de invertir en modelos mayores.
- Moderación de comunidades de chat: señal adicional para priorizar la revisión de mensajes reportados por usuarios en canales de mensajería en inglés.

## Benchmarks y rendimiento

| Metrica | Valor | Intervalo de confianza 95 % |
|---|---|---|
| F1 de validación | 0.992 | no disponible |
| Accuracy (test) | 0.899 | 0.846 – 0.935 |
| Recall de estafa (test) | 0.894 | 0.820 – 0.940 |
| Precision de estafa (test) | 0.930 | 0.863 – 0.966 |
| F1 (test) | 0.912 | no disponible |
| Genuinos clasificados como estafa | 7 de 74 | no disponible |
| Estafas no detectadas | 11 de 104 | no disponible |

El conjunto de test son 178 mensajes singapurenses escritos a mano que no aparecen en los datos de entrenamiento; un mensaje se considera estafa con probabilidad igual o superior a 0.50. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.4–0.5 GB en fp32 (109 millones de parámetros), alrededor de 0.25 GB en fp16 y menos de 0.15 GB en cuantización int8.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; el modelo no requiere A100 ni H100. Funciona correctamente en RTX 4090, RTX 3060, T4, L4 y similares.
- Cabe holgadamente en GPU de consumo e incluso en CPU: la inferencia en CPU sobre lotes pequeños es viable con latencias del orden de milisegundos a decenas de milisegundos por mensaje.
- Opciones de despliegue: `transformers` (PyTorch), Text Embeddings Inference (tag oficial del repo), exportación a ONNX y cuantización dinámica de PyTorch; no se documenta soporte nativo de llama.cpp, Ollama, vLLM ni TGI para clasificación de secuencias.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo, se espera un throughput alto en GPU y suficiente para procesamiento por lotes en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danjai/scamlens-qs-google-bert-v3 | 109,5 M | 512 tokens | Clasificación de estafa SMS (inglés, Singapur) | no disponible | Hugging Face |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base general (enmascarado y clasificación tras ajuste) | Apache 2.0 | Hugging Face |
| DistilBERT base | 66 M | 512 tokens | Modelo base destilado, clasificación tras ajuste | Apache 2.0 | Hugging Face |
| RoBERTa base | 125 M | 514 tokens | Modelo base general, clasificación tras ajuste | MIT | Hugging Face |

La comparación directa de rendimiento con alternativas no está disponible: el autor no publica resultados de otros modelos sobre el mismo conjunto de test. Frente a los modelos base, la diferencia principal es el ajuste específico al dominio de estafas SMS singapurenses, a costa de un alcance mucho más estrecho.

## Limitaciones y advertencias

- Solo evalúa la redacción del mensaje; no comprueba enlaces, números de teléfono ni remitentes, por lo que puede pasar por alto estafas con texto convincente o marcar como sospechosos mensajes legítimos con lenguaje alarmante.
- Entrenado exclusivamente con mensajes en inglés y contexto de Singapur (bancos, agencias y servicios de pago locales); su fiabilidad fuera de ese ámbito es previsiblemente menor.
- El conjunto de test es pequeño (178 mensajes), lo que produce intervalos de confianza amplios y limita la solidez de las métricas reportadas.
- El F1 de validación (0.992) contrasta con el F1 de test (0.912), lo que sugiere cierta sobreestimación en validación y posible sensibilidad a la distribución de los datos.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos: 7 de 74 mensajes genuinos se marcaron como estafa y 11 de 104 estafas no se detectaron en el test.
- El autor advierte explícitamente de que no debe usarse en solitario para bloquear mensajes ni acusar a nadie.
- Licencia no disponible: no se puede confirmar el permiso para uso comercial; conviene contactar con el autor antes de integrarlo en producción.
- Es un modelo candidato de un proyecto de curso, no el modelo que ScamLens usa finalmente; su madurez y mantenimiento no están garantizados.
- Sesgos conocidos: no documentados por el autor; al entrenarse con avisos públicos y mensajes sintéticos, puede heredar sesgos de esos corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danjai/scamlens-qs-google-bert-v3
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased

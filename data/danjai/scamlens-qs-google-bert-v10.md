# danjai/scamlens-qs-google-bert-v10

## Resumen

ScamLens quick_score google-bert-v10 es un clasificador de texto binario desarrollado por el usuario danjai que estima la probabilidad de que un mensaje SMS o de chat sea una estafa (scam). Se construye mediante fine-tuning del modelo base google-bert/bert-base-uncased y forma parte del proyecto ScamLens, un agente de investigación de estafas creado para un proyecto de curso universitario (IS469). El modelo constituye una de las variantes candidatas entrenadas y comparadas durante el desarrollo, aunque no es la versión que el agente ScamLens emplea en producción.

El modelo resuelve un problema acotado pero relevante: la detección temprana de mensajes fraudulentos en el contexto de Singapur, con mensajes en inglés que imitan comunicaciones de bancos locales, agencias gubernamentales y servicios de pago. Con 109.483.778 parámetros totales y un tamaño de repositorio de 0,4 GB, se apoya en la arquitectura BERT base, lo que permite una inferencia ligera y un despliegue sencillo en entornos con recursos limitados.

Su relevancia actual reside en la combinación de un enfoque de validación riguroso (separación por plantilla de mensaje para evitar fugas de datos casi duplicados) con métricas reportadas sobre un conjunto de test escrito a mano de 178 mensajes. El modelo se distribuye en formato safetensors y es compatible con text-embeddings-inference y endpoints, lo que facilita su integración como primer filtro en pipelines de moderación o análisis de mensajes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder bidirectional), fine-tuning de google-bert/bert-base-uncased |
| Parámetros totales | 109.483.778 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; max_length de entrenamiento: 123 tokens |
| Tipos de cuantización | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Etiquetas | 0 = genuine, 1 = scam |
| Tamaño del repositorio | 0,4 GB |
| Librería | transformers |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT en su variante base (bert-base-uncased), adaptado mediante fine-tuning a una tarea de clasificación de secuencias con dos etiquetas (genuine/scam). El entrenamiento se realizó durante 3 épocas con una tasa de aprendizaje de 3e-05, batch size de 7, max_length de 123 tokens, warmup_ratio de 0,1, weight_decay de 0,01, scheduler lineal, pesos de clase balanceados, val_ratio de 0,2 y semilla 42.

El conjunto de datos consta de 1.901 ejemplos, divididos en 1.522 para entrenamiento y 379 para validación. La validación se separó por plantilla de mensaje (1.387 plantillas), de modo que las copias casi idénticas de un mensaje de entrenamiento nunca aparecen en validación, lo que reduce el riesgo de sobreestimar el rendimiento. Los datos proceden de avisos públicos de estafas, mensajes sintéticos, alertas bancarias generadas en pares genuino/estafa y SMS cotidianos de corpus públicos, todo ello en inglés y con ambientación de Singapur. Se proporcionan hashes SHA-256 para los datos de entrenamiento y de test.

## Capacidades

- Clasificación binaria de texto: asigna una probabilidad de estafa a un mensaje SMS o de chat.
- Detección basada exclusivamente en el texto (wording): analiza el lenguaje del mensaje, no enlaces, números de teléfono ni remitentes.
- Salida probabilística interpretable: el agente ScamLens la traduce en niveles high (≥0,70), medium (≥0,50) y low (<0,50).
- Integración como herramienta quick_score dentro de un agente de investigación de estafas.
- Compatibilidad con text-embeddings-inference y endpoints.
- No soporta tool calling, agentes multi-paso, visión, audio ni modo thinking; es un clasificador puro.

## Casos de uso

- Filtro previo en pasarelas de SMS: clasificar mensajes entrantes antes de entregarlos al usuario y marcar los de alta probabilidad de estafa para revisión, aprovechando su bajo coste computacional (109 M de parámetros).
- Módulo quick_score en agentes antifraude: usar la probabilidad como primera opinión dentro de un pipeline multi-herramienta que después verifique enlaces, remitentes y números de teléfono, tal como hace ScamLens.
- Moderación de chats de atención al cliente: detectar intentos de ingeniería social en conversaciones con clientes de banca o servicios de pago en Singapur.
- Análisis de corpus históricos: puntuar lotes de SMS almacenados para priorizar investigaciones o generar estadísticas de fraude por plantilla.
- Educación y concienciación: mostrar a usuarios la probabilidad de estafa de un mensaje concreto en aplicaciones de formación sobre fraudes.
- Investigación académica: servir como línea base BERT para comparar con otros clasificadores en tareas de detección de estafas en inglés de Singapur.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| F1 de validación | 0,943 |
| Exactitud en test | 0,904 (IC 95%: 0,852–0,940) |
| Recall de estafa en test | 0,875 (IC 95%: 0,798–0,925) |
| Precisión de estafa en test | 0,958 (IC 95%: 0,897–0,984) |
| F1 en test | 0,915 |
| Mensajes genuinos clasificados como estafa | 4 de 74 |
| Estafas no detectadas | 13 de 104 |

El conjunto de test son 178 mensajes de Singapur escritos a mano que nunca aparecen en los datos de entrenamiento. Un mensaje se cuenta como estafa con probabilidad ≥ 0,50. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4–0,5 GB en FP32 para los pesos (109 M de parámetros), lo que permite ejecución en CPU con latencia baja para mensajes cortos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer, incluidas las de gama baja, y en entornos sin GPU.
- Opciones de despliegue: transformers (AutoModelForSequenceClassification), text-embeddings-inference, endpoints compatibles; no se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. Como referencia estructural, el modelo comparte arquitectura y tamaño con google-bert/bert-base-uncased (109 M de parámetros, contexto de 512 tokens), del que deriva mediante fine-tuning; sin embargo, no se han publicado métricas que permitan una comparación directa con alternativas de detección de estafas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| danjai/scamlens-qs-google-bert-v10 | 109.483.778 | max_length de entrenamiento 123 tokens | no disponible | Hugging Face |
| google-bert/bert-base-uncased | ~110 M | 512 tokens | Apache 2.0 (modelo base) | Hugging Face |
| Alternativas de detección de estafas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo evalúa el texto: no comprueba enlaces, números de teléfono ni remitentes; en ScamLens esas verificaciones son herramientas separadas y esta puntuación es solo una primera opinión.
- Entrenado con mensajes en inglés y ambientación de Singapur (bancos, agencias y servicios de pago locales); su fiabilidad fuera de ese contexto es menor.
- El conjunto de test es pequeño (178 mensajes), por lo que los intervalos de confianza son amplios.
- No debe usarse de forma aislada para bloquear o acusar a nadie.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos (4 de 74 genuinos marcados como estafa y 13 de 104 estafas no detectadas en test).
- Sesgos potenciales derivados de la composición del dataset (avisos públicos, mensajes sintéticos y alertas bancarias generadas), no documentados explícitamente por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/danjai/scamlens-qs-google-bert-v10
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased

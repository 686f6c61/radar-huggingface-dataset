# FRAMERIA/cybersense-wangchanberta

## Resumen

CyberSense WangchanBERTa es un modelo de clasificación de texto en tailandés desarrollado por FRAMERIA, diseñado específicamente para detectar mensajes SMS fraudulentos (scam) frente a mensajes legítimos. Se trata de un fine-tuning del modelo base airesearch/wangchanberta-base-att-spm-uncased, un transformer encoder preentrenado sobre corpus tailandeses, al que se le ha añadido una cabeza de clasificación binaria.

El modelo resuelve un problema concreto y de creciente relevancia en Tailandia: la proliferación de estafas por SMS (phishing, falsos avisos de paquetería, suplantación de entidades bancarias). Con 105.245.954 parámetros, es un modelo compacto que puede ejecutarse en CPU o GPUs de gama baja, lo que facilita su integración en filtros de mensajería en tiempo real.

Es relevante ahora porque los clasificadores especializados en dominios locales y lenguas de bajos recursos siguen siendo escasos. Sin embargo, el propio autor advierte que el conjunto de entrenamiento es pequeño (700 mensajes) y que una línea base TF-IDF ya alcanza el 98,1% de precisión, por lo que debe tratarse como artefacto de demostración e investigación más que como salvaguarda única en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (WangchanBERTa base, RoBERTa-like con tokenizador SentencePiece) |
| Parametros totales | 105.245.954 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso trunca a 128 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | tailandés (th) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de WangchanBERTa base, un transformer encoder de tipo BERT/RoBERTa adaptado al tailandés mediante tokenización SentencePiece y preentrenamiento sobre grandes corpus tailandeses. Sobre esa base se añade una cabeza de clasificación de secuencias con dos etiquetas (0 = legítimo, 1 = scam). El formato de entrada esperado es `Sender: <nombre del remitente> | <texto del mensaje>`, y se recomienda usar `Sender: SMS | <texto>` cuando el remitente es desconocido.

El fine-tuning se realizó sobre un conjunto de 700 mensajes SMS tailandeses (350 scam / 350 legítimos), divididos de forma estratificada 70/15/15 (entrenamiento/validación/test). Se entrenaron 5 épocas con batch size 16 y se seleccionó el mejor checkpoint según F2-score sobre la clase scam, ponderando la exhaustividad (recall) el doble que la precisión. No se documentan técnicas de RLHF, DPO ni innovaciones arquitectónicas adicionales; es un fine-tuning supervisado convencional.

## Capacidades

- Clasificación binaria de mensajes SMS en tailandés: scam (1) frente a legítimo (0).
- Devuelve probabilidad calibrada mediante softmax sobre los logits de dos clases.
- Acepta el nombre del remitente como prefijo contextual en la entrada.
- Procesamiento de texto corto (el ejemplo trunca a 128 tokens).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta agentes ni planificación.
- No tiene capacidades multimodales (visión, audio) ni modo de razonamiento explícito.
- Monolingüe: únicamente tailandés.

## Casos de uso

- Filtrado de SMS en pasarelas de mensajería: el modelo puede puntuar cada mensaje entrante y marcar como sospechosos aquellos con probabilidad de scam alta, integrándose en un pipeline previo a la entrega al usuario.
- Aplicaciones móviles de seguridad: integración en apps Android/iOS que analicen SMS localmente o en servidor para alertar al usuario antes de que pulse un enlace malicioso.
- Moderación en plataformas de telecomunicaciones: los operadores pueden usar el clasificador para etiquetar automáticamente remitentes y mensajes sospechosos en sus sistemas de gestión de fraude.
- Investigación en detección de phishing en lenguas de bajos recursos: sirve como línea base reproducible para experimentos con corpus tailandeses.
- Enriquecimiento de datasets de seguridad: clasificación masiva de mensajes históricos para construir conjuntos etiquetados de scam en tailandés.
- Demostraciones educativas: ejemplo práctico de fine-tuning de WangchanBERTa para tareas de clasificación en tailandés en cursos y talleres.
- Alertas en centros de atención al cliente: clasificación de transcripciones de SMS reenviados por usuarios para priorizar casos de fraude.

## Benchmarks y rendimiento

Evaluación sobre conjunto de test reservado (105 mensajes), según la model card:

| Modelo | Accuracy | Scam recall |
|---|---|---|
| TF-IDF + Logistic Regression (texto) | 98,1% | 98,1% |
| CyberSense WangchanBERTa | 100% | 100% |

El propio autor advierte que el dataset es pequeño y relativamente limpio, y que estos resultados no garantizan el mismo rendimiento en mensajes del mundo real.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en fp32 (105M parámetros), menos de 0,5 GB en la práctica.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona correctamente en RTX 3060, RTX 4090, T4, A100 y H100.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU moderna e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, TorchScript; no hay variantes GGUF publicadas, pero es convertible a llama.cpp/Ollama si se exporta manualmente.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU para secuencias de 128 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberSense WangchanBERTa | 105M | no disponible (uso a 128 tokens) | Clasificación scam SMS (th) | CC BY-SA 4.0 | HuggingFace |
| airesearch/wangchanberta-base-att-spm-uncased | ~110M | 512 tokens (típico en BERT base) | Modelo base tailandés | CC BY-SA 4.0 | HuggingFace |
| TF-IDF + Logistic Regression (línea base del autor) | no aplica | no aplica | Clasificación scam SMS (th) | no disponible | No publicada como modelo |

No se dispone de información sobre otros clasificadores de scam en tailandés comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El conjunto de entrenamiento es muy pequeño (700 mensajes) y relativamente limpio; los resultados del 100% no son extrapolables a mensajes reales.
- Una línea base TF-IDF alcanza el 98,1%, lo que sugiere que la tarea es sencilla en este dataset y que el modelo puede no aportar ventaja significativa frente a enfoques clásicos.
- Riesgo de sobreajuste y de falsos negativos en campañas de scam con vocabulario o formato distintos a los del conjunto de entrenamiento.
- Monolingüe: solo tailandés; no procesa otros idiomas.
- Sin datos publicados sobre sesgos específicos, pero al entrenarse con SMS reales puede heredar sesgos de los remitentes y del corpus.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y obligación de compartir bajo la misma licencia las obras derivadas.
- El autor recomienda explícitamente usarlo como demo y artefacto de investigación, no como única salvaguarda en producción.
- No hay información sobre calibración de probabilidades ni sobre umbrales recomendados en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FRAMERIA/cybersense-wangchanberta
- Modelo base: https://huggingface.co/airesearch/wangchanberta-base-att-spm-uncased
- Repositorio del proyecto CyberSense: https://github.com/zenoframeria/CyberSense

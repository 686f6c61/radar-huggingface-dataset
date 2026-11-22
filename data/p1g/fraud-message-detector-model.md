# P1g/fraud-message-detector-model

## Resumen

Fraud Message Detector (Thai) es un modelo de clasificación de texto en tailandés especializado en la detección de mensajes fraudulentos o de estafa. Lo desarrolla el usuario P1g y se obtiene mediante fine-tuning del modelo base airesearch/wangchanberta-base-att-spm-uncased, un transformer encoder de la familia BERT adaptado al tailandés por VISTEC-AI. El modelo resuelve un problema binario: clasificar un mensaje como normal (etiqueta 0) o como estafa/fraude (etiqueta 1).

El modelo cuenta con 105.245.954 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de 0,4 GB. Está pensado como herramienta de aviso al usuario, no como sistema de bloqueo automático, y su ámbito lingüístico se limita al tailandés. La licencia Apache 2.0 facilita su integración en productos comerciales.

Su relevancia radica en la aplicación práctica a un problema creciente (fraude por mensajería en Tailandia) con un modelo ligero, desplegable en hardware modesto y con métricas publicadas sobre un conjunto de test de 269 mensajes. No obstante, el dataset de entrenamiento no se ha publicado y el modelo tiene cero descargas y cero likes en el momento de redactar esta ficha, lo que indica una validación externa aún inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (WangchanBERTa, basado en BERT/RoBERTa con tokenizador SentencePiece adaptado al tailandés) |
| Parametros totales | 105.245.954 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base WangchanBERTa emplea habitualmente 512 tokens; no confirmado en la información proporcionada) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se documentan variantes GGUF, ONNX ni cuantizaciones) |
| Idiomas soportados | tailandés (th) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de airesearch/wangchanberta-base-att-spm-uncased, un encoder de tipo transformer basado en la arquitectura BERT con tokenizador SentencePiece entrenado específicamente para tailandés (WangchanBERTa, desarrollado por VISTEC-AI dentro del proyecto thai2transformers). Sobre esa base se ha añadido una cabeza de clasificación de secuencias con dos etiquetas (normal y estafa), y se ha ajustado para la tarea de detección de fraude.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el número de tokens utilizados ni si se aplicaron técnicas de RLHF, DPO u otras. El autor indica explícitamente que el dataset de entrenamiento no se publica porque puede contener información personal. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.); se trata de un fine-tuning estándar de clasificación sobre un encoder preentrenado.

## Capacidades

- Clasificación binaria de texto tailandés en dos categorías: mensaje normal (0) y mensaje de estafa/fraude (1).
- Detección de patrones de fraude en mensajes de texto, presumiblemente orientada a mensajes tipo SMS, chat o redes sociales (no se detalla el canal en la información disponible).
- Salida de probabilidades por clase mediante softmax sobre los logits, lo que permite umbralizar la decisión según el coste relativo de falsos positivos y falsos negativos.
- Procesamiento de texto en tailandés; no se ha evaluado su rendimiento en otros idiomas ni en texto mixto tailandés-inglés.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking. Es un modelo puramente discriminativo de clasificación.

## Casos de uso

- Filtro de avisos en aplicaciones de mensajería: integrar el modelo en el backend de una app de chat para marcar mensajes entrantes con alta probabilidad de estafa y mostrar una advertencia al usuario antes de que interactúe con el enlace o el remitente.
- Moderación en plataformas de comercio electrónico: clasificar mensajes entre compradores y vendedores para detectar intentos de fraude (pagos fuera de plataforma, suplantación de identidad) y derivarlos a revisión humana.
- Pasarela de SMS corporativos: analizar mensajes entrantes en un servicio de atención al cliente por SMS y enrutar los sospechosos a un flujo de verificación en lugar de al agente, reduciendo el riesgo de ingeniería social.
- Campañas de concienciación y análisis de incidentes: procesar lotes de mensajes reportados por usuarios para cuantificar la prevalencia de estafas y alimentar informes de seguridad, usando las probabilidades del modelo para priorizar la revisión manual.
- Investigación académica sobre fraude en tailandés: servir como línea base reproducible (licencia Apache 2.0, pesos safetensors) para comparar nuevas aproximaciones de detección de scam en tailandés.
- Prefiltro en pipelines de moderación más amplios: usar el modelo como primera etapa de bajo coste (105 M de parámetros) que descarte mensajes claramente normales y deje pasar solo los candidatos a un clasificador o revisor más costoso.
- Protección de usuarios mayores o vulnerables: integración en una app de accesibilidad o de familia que avise cuando un mensaje recibido se clasifique como estafa, dado el énfasis del autor en el recall (F2 como métrica principal).

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de test de 269 mensajes (142 de estafa, 127 normales):

| Metrica | Valor |
|---|---|
| F2 (metrica principal) | 91,9 % |
| Recall | 90,8 % |
| Precision | 96,3 % |
| F1 | 93,5 % |
| Accuracy | 93,3 % |

No se han publicado comparaciones con otros modelos en la información disponible. El autor justifica el uso de F2 como métrica principal porque penaliza más los falsos negativos (estafas no detectadas) que los falsos positivos, criterio coherente con el uso previsto como herramienta de aviso.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,42 GB solo para pesos (105,2 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 1 GB en FP32 y del orden de 0,2-0,3 GB en FP16.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volúmenes moderados de inferencia.
- GPU recomendadas para despliegue de alto throughput: T4, L4, A10G, A100 o H100 si se necesita procesar grandes lotes; para uso puntual, CPU es suficiente.
- Opciones de despliegue: transformers (PyTorch) con AutoModelForSequenceClassification, tal como muestra la model card; también es compatible con Text Generation Inference en modo clasificación, con ONNX Runtime si se exporta, y con frameworks de serving tipo FastAPI + transformers. No se documentan artefactos GGUF ni soporte verificado en llama.cpp u Ollama (son herramientas orientadas a modelos generativos, no a este encoder de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por mensaje en GPU y de decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| P1g/fraud-message-detector-model | 105,2 M | no disponible | Clasificación binaria de fraude en tailandés | Apache 2.0 | Hugging Face (0 descargas) |
| airesearch/wangchanberta-base-att-spm-uncased | no disponible en la información | no disponible | Modelo base de lenguaje tailandés (encoder) | no disponible en la información | Hugging Face |
| Otros detectores de scam en tailandés | no disponible | no disponible | Clasificación de fraude | no disponible | no disponible |

No se dispone de información sobre modelos comparables específicos de detección de fraude en tailandés con métricas publicadas que permitan una comparación rigurosa. La comparación más directa es con su modelo base, que no está especializado en la tarea y por tanto no es un competidor directo.

## Limitaciones y advertencias

- Puede clasificar incorrectamente patrones de estafa nuevos no vistos durante el entrenamiento; el propio autor lo advierte.
- Está concebido como herramienta de aviso, no para bloquear mensajes automáticamente; usarlo como bloqueo podría generar falsos positivos con impacto en el usuario.
- Entrenado exclusivamente con mensajes en tailandés; no se ha evaluado su rendimiento en otros idiomas, en texto mixto tailandés-inglés ni en otros tipos de texto.
- El dataset de entrenamiento no se publica por contener posibles datos personales, lo que impide auditar la distribución de clases, los sesgos y la representatividad de los patrones de fraude.
- El conjunto de test es pequeño (269 mensajes), por lo que las métricas publicadas tienen un intervalo de confianza amplio y pueden no generalizar a otros dominios o épocas.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador, no un generador), pero sí existe riesgo de clasificaciones erróneas con alta confianza.
- No se documentan sesgos conocidos; al no publicarse los datos, no es posible evaluar sesgos por región, dialecto, edad o género del remitente.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; no obstante, conviene verificar la licencia del modelo base WangchanBERTa antes de un despliegue comercial.
- El modelo tiene cero descargas y cero likes en el momento de la consulta; no hay evidencia de validación independiente ni de uso en producción.
- No se documenta la longitud máxima de secuencia soportada ni el comportamiento con mensajes muy largos; se recomienda truncar y validar empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/P1g/fraud-message-detector-model
- Modelo base WangchanBERTa: https://huggingface.co/airesearch/wangchanberta-base-att-spm-uncased
- Repositorio thai2transformers (VISTEC-AI): https://github.com/vistec-AI/thai2transformers
- Aplicación web del autor (GitHub): https://github.com/rachatamj/fraud-message-detector/projects

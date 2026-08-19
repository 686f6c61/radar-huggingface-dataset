# SafeTechDev/Russian-Spam-classifier

## Resumen

El modelo **SafeTechDev/Russian-Spam-classifier** (también identificado como AIMS-RU-Binary-Spam-Classifier) es un clasificador binario de spam para mensajes en ruso, desarrollado por SafeTechDev como parte del proyecto AIMS (AI Moderation System). Está diseñado para distinguir entre mensajes **SPAM** y **SAFE** en entornos de moderación automática, especialmente en Telegram.

Se basa en el encoder `DeepPavlov/rubert-base-cased`, un modelo BERT preentrenado para ruso, al que se le añade una cabeza de clasificación lineal. El modelo ha sido fine-tuneado con mensajes reales recogidos en chats públicos de Telegram entre otoño de 2025 y primavera de 2026, y validado sobre el dataset externo `alt-gnome/telegram-spam`. Su relevancia radica en ofrecer una solución ligera y rápida para moderación de contenido en ruso, con un alto precision (0.98) que minimiza los falsos positivos, algo crítico para no perjudicar a usuarios legítimos en sistemas automáticos.

El repositorio tiene un tamaño de 7.1 GB e incluye los pesos en formato `pytorch_model.bin`. La licencia es MIT, lo que permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder) con cabeza de clasificación lineal |
| Parametros totales | no disponible (modelo base: DeepPavlov/rubert-base-cased) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del tokenizer de rubert-base-cased) |
| Tipos de cuantizacion | no disponible (solo pesos en PyTorch, `pytorch_model.bin`) |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | pytorch_model.bin (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura consiste en el encoder `DeepPavlov/rubert-base-cased` (un transformer BERT preentrenado en ruso) seguido de una cabeza de clasificación compuesta por `Dropout(0.2)` y una capa lineal `Linear(hidden_size, 1)`. El pooling se realiza tomando la representación del token `[CLS]` de la última capa oculta. La salida es un único logit que se pasa por una función sigmoide para obtener la probabilidad de que el mensaje sea spam.

El entrenamiento se realizó mediante fine-tuning supervisado con mensajes recopilados de chats públicos de Telegram durante el periodo otoño-primavera 2025-2026. La función de pérdida utilizada fue `BCEWithLogitsLoss` con un peso para la clase positiva (`pos_weight`) para compensar el desequilibrio entre las clases SAFE y SPAM. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El modelo fue actualizado posteriormente para corregir algunos falsos positivos.

## Capacidades

- Clasificación binaria de mensajes de texto en ruso como SPAM o SAFE.
- Detección de spam en mensajes individuales de Telegram y otros canales de texto.
- Normalización de texto recomendada antes de la inferencia: elimina escritura "espaciada" (`п.р.и.в.е.т.`), reemplaza homoglifos, elimina enlaces y comandos de bots, colapsa letras repetidas y convierte a minúsculas.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (solo texto).
- Funciona únicamente en ruso; no se garantiza rendimiento en otros idiomas.

## Casos de uso

- Moderación automática de chats de Telegram: el modelo puede clasificar cada mensaje entrante y bloquear o marcar aquellos con probabilidad de spam superior a un umbral (por defecto 0.7), reduciendo la carga de moderadores humanos.
- Filtrado de spam en canales de difusión: permite mantener la calidad del contenido eliminando mensajes promocionales no deseados antes de su publicación.
- Sistemas de atención al cliente: integración en bots que reciben consultas de usuarios para descartar automáticamente mensajes spam antes de derivarlos a agentes humanos.
- Preprocesamiento de datasets: limpieza de corpus de texto en ruso eliminando mensajes no deseados antes de entrenar otros modelos.
- Detección de phishing y estafas: el modelo puede identificar mensajes fraudulentos típicos en ruso (ofertas falsas, solicitudes de datos personales) gracias a su entrenamiento con datos reales de Telegram.
- Moderación de foros y comunidades online: adaptación para clasificar comentarios o publicaciones en plataformas con contenido en ruso, usando el mismo pipeline de clasificación.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas evaluadas sobre el dataset externo `alt-gnome/telegram-spam`, que no se solapa con los datos de entrenamiento:

| Metrica   | Valor |
|-----------|-------|
| F1        | 0.95  |
| Precision | 0.98  |
| Recall    | 0.92  |

El alto precision (0.98) indica una baja tasa de falsos positivos, lo que es especialmente relevante para moderación automática donde un falso positivo podría afectar a usuarios legítimos. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Al ser un modelo BERT base (aproximadamente 178M de parámetros, aunque no se confirma en la ficha), la inferencia es ligera.
- VRAM estimada: en GPU, con pesos en fp32, se requieren aproximadamente 1-2 GB de VRAM; en CPU, unos 2-4 GB de RAM.
- Puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4090 o incluso en CPU sin problema para inferencia en tiempo real.
- Opciones de despliegue: el código de ejemplo usa PyTorch y `transformers`, por lo que puede integrarse con frameworks como vLLM o TGI, aunque no se mencionan explícitamente. También es posible exportar a ONNX o cuantizar con herramientas como `torch.quantization` para reducir requisitos.
- No se proporcionan datos de latencia o throughput específicos, pero por su tamaño se espera una inferencia en milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información comparativa con otros clasificadores de spam en ruso en la documentación proporcionada. Modelos alternativos podrían ser otros fine-tunes de ruBERT o clasificadores basados en XLM-R, pero no se ofrecen datos de rendimiento para establecer una comparación objetiva. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado y validado exclusivamente en texto en ruso; su rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- No tiene en cuenta el contexto de la conversación: clasifica cada mensaje de forma aislada, lo que puede llevar a errores en mensajes que dependen de mensajes anteriores.
- El umbral de decisión (0.7 por defecto) es configurable; el autor recomienda ajustarlo según el dominio de aplicación para optimizar el equilibrio precision/recall.
- Puede sufrir alucinaciones o errores en textos muy cortos, ambiguos o con lenguaje no estándar (jerga, argot).
- El tamaño del repositorio (7.1 GB) es elevado en comparación con el modelo base, posiblemente debido a la inclusión de pesos completos; se recomienda verificar el contenido antes de descargar.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SafeTechDev/Russian-Spam-classifier
- Modelo base: https://huggingface.co/DeepPavlov/rubert-base-cased
- Dataset de evaluación: https://huggingface.co/datasets/alt-gnome/telegram-spam
- Autor: https://huggingface.co/SafeTechDev

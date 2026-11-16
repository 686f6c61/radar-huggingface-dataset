# Kuantum-ai1/TinyGuard1.1-22M

## Resumen

TinyGuard1.1-22M es un clasificador de texto en inglés desarrollado por Kuantum-ai1, pensado como filtro de seguridad ligero. Etiqueta cada mensaje en una de cuatro categorías: `safe`, `spam`, `phishing` o `prompt_injection`. Es un fine-tuning de nreimers/MiniLM-L6-H384-uncased, un transformer encoder de tipo BERT con 22,7 millones de parámetros, lo que lo sitúa en la gama ultracompacta de modelos de clasificación.

El modelo resuelve un problema concreto: disponer de una barrera de seguridad de bajísimo coste computacional que pueda ejecutarse en cada petición de un sistema con LLM o en un pipeline de mensajería, sin la latencia ni el gasto de un modelo generativo. La versión 1.1 corrige los puntos débiles de la 1.0 (sobre todo el recall de phishing, que sube de 0,9255 a 0,9689) mediante aumento de datos con errores tipográficos, espaciado, homóglifos y variaciones de mayúsculas.

Su relevancia actual radica en el auge de los ataques de prompt injection contra aplicaciones basadas en LLM y del phishing automatizado: un clasificador de 22M se puede desplegar en CPU, en el edge o como pre-filtro barato delante de un modelo mayor. La licencia Apache-2.0 facilita su integración comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT, MiniLM-L6-H384) |
| Parámetros totales | 22.714.756 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 320 tokens (longitud máxima de entrenamiento; la arquitectura base admite hasta 512) |
| Tipos de cuantización | no disponible (pesos en safetensors fp32/fp16; compatible con cuantización estándar de transformers/ONNX) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de nreimers/MiniLM-L6-H384-uncased, un encoder BERT de 6 capas y dimensión oculta 384, destilado para tareas de similitud semántica. Sobre esa base se añade una cabeza de clasificación de 4 clases. El fine-tuning se realizó con PyTorch en una única GPU T4, con longitud máxima de 320 tokens, batch size 64, learning rate 2e-5, 5 épocas, optimizador AdamW con weight decay 0,01, scheduler coseno con 10% de warmup, label smoothing 0,05, pesos de clase y precisión fp16. El checkpoint final se seleccionó por macro F1 de validación.

Los datos de entrenamiento combinan cinco conjuntos públicos: ucirvine/sms_spam, Deysi/spam-detection-dataset, ealvaradob/phishing-dataset, xTRam1/safe-guard-prompt-injection y databricks/databricks-dolly-15k (este último presumiblemente para la clase `safe`). Tras el aumento de datos, la distribución queda en 21.148 ejemplos de `safe`, 9.000 de phishing, 9.000 de spam y 9.000 de prompt injection. La innovación principal respecto a la versión 1.0 es precisamente ese aumento de datos con perturbaciones tipográficas, de espaciado, homóglifos y mayúsculas, orientado a robustecer la detección frente a evasión trivial.

## Capacidades

- Clasificación de texto en cuatro clases: `safe`, `spam`, `phishing`, `prompt_injection`.
- Detección de intentos de prompt injection en entradas dirigidas a sistemas LLM.
- Detección de phishing y spam en mensajes cortos (SMS, correo, chat).
- Inferencia muy rápida y de bajo coste por su tamaño (22,7M parámetros).
- Ejecución viable en CPU y en dispositivos con recursos limitados.
- Integración nativa con el pipeline `text-classification` de transformers.
- Compatible con text-embeddings-inference y endpoints según los tags del repositorio.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un clasificador.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Filtro previo de prompt injection: colocar el clasificador delante de un LLM para descartar o marcar entradas maliciosas antes de que lleguen al modelo generativo, con un coste de inferencia mínimo por petición.
- Moderación de comentarios y mensajes en foros o chats: etiquetar en tiempo real spam y phishing en flujos de texto cortos, aprovechando la baja latencia del encoder de 6 capas.
- Pasarela de correo o SMS: pre-clasificar mensajes entrantes para enrutar los sospechosos a cuarentena o a un análisis más profundo, usando la clase `phishing` con recall de 0,9689.
- Protección de formularios y APIs públicas: validar el contenido enviado por usuarios antes de procesarlo, bloqueando payloads de prompt injection en aplicaciones con agentes.
- Enriquecimiento de pipelines de seguridad (SIEM/SOAR): añadir una etiqueta de riesgo a cada evento de texto para priorizar alertas y reducir el volumen de revisión manual.
- Despliegue en el edge o en entornos con CPU: al ser un modelo de 22M y 0,1 GB, puede ejecutarse en servidores sin GPU, contenedores pequeños o dispositivos con memoria limitada.
- Pre-filtro de coste en arquitecturas de dos etapas: usar TinyGuard para descartar la mayoría del tráfico limpio y reservar modelos mayores y más caros solo para los casos ambiguos.

## Benchmarks y rendimiento

Resultados publicados en la model card (conjunto de evaluación no detallado más allá del support indicado):

| Métrica | Valor |
|---|---|
| Accuracy | 0,9865 |
| Macro F1 | 0,9850 |
| Weighted F1 | 0,9865 |

| Clase | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| safe | 0,9906 | 0,9915 | 0,9910 | 2115 |
| spam | 0,9845 | 0,9878 | 0,9861 | 900 |
| phishing | 0,9732 | 0,9689 | 0,9710 | 900 |
| prompt_injection | 0,9922 | 0,9911 | 0,9917 | 900 |

Comparación con la versión anterior (TinyGuard1-22M):

| Métrica | TinyGuard1-22M | TinyGuard1.1-22M | Diferencia |
|---|---|---|---|
| Accuracy | 0,9669 | 0,9865 | +0,0196 |
| Macro F1 | 0,9696 | 0,9850 | +0,0154 |
| Phishing recall | 0,9255 | 0,9689 | +0,0434 |
| Safe F1 | 0,9698 | 0,9910 | +0,0212 |
| Spam F1 | 0,9758 | 0,9861 | +0,0103 |
| Phishing F1 | 0,9458 | 0,9710 | +0,0252 |
| Prompt injection F1 | 0,9870 | 0,9917 | +0,0047 |

No se han publicado resultados frente a modelos de terceros ni detalles sobre la composición exacta del conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (22,7M parámetros, ~91 MB de pesos) y del orden de 50 MB en fp16.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; funciona sobradamente en T4, RTX 3060, RTX 4090, A100 o H100. La GPU no es necesaria.
- Cabe en cualquier GPU de consumo e incluso en CPU; el entrenamiento se realizó en una sola T4.
- Opciones de despliegue: transformers (`pipeline("text-classification")`), text-embeddings-inference, exportación a ONNX y, en general, cualquier runtime compatible con modelos BERT de Hugging Face.
- Latencia y throughput: no se han publicado cifras concretas; por el tamaño (6 capas, 384 de dimensión oculta, 320 tokens) se espera un throughput muy alto en GPU y adecuado en CPU, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyGuard1.1-22M | 22,7M | 320 tokens | Clasificación 4 clases (safe/spam/phishing/prompt injection) | Apache-2.0 | Hugging Face |
| TinyGuard1-22M | 22,7M | 320 tokens | Clasificación 4 clases (versión anterior) | Apache-2.0 | Hugging Face |
| nreimers/MiniLM-L6-H384-uncased | ~22M | 512 tokens | Embeddings/encoder base | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks frente a otros clasificadores de seguridad comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no está entrenado ni validado para otros idiomas, por lo que su uso en castellano u otras lenguas no es fiable.
- Ventana de 320 tokens: los mensajes más largos se truncan, lo que puede dejar fuera la parte relevante del texto (por ejemplo, una inyección al final de un prompt largo).
- Riesgo de falsos negativos ante ataques evasivos sofisticados: el aumento de datos cubre tipografías, espaciado, homóglifos y mayúsculas, pero no garantiza robustez frente a paráfrasis o inyecciones semánticamente novedosas.
- Riesgo de falsos positivos en textos legítimos que contengan URLs, lenguaje imperativo o términos financieros, dado el solapamiento con las clases de phishing y spam.
- No es un modelo generativo: no razona, no explica la decisión ni ofrece justificación; solo devuelve una etiqueta.
- El conjunto de evaluación y su procedencia no están detallados; las métricas deben interpretarse con cautela y validarse en el dominio de despliegue.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni asume responsabilidad por fallos de clasificación en producción.
- No debe usarse como única barrera de seguridad: conviene combinarlo con otras capas (reglas, modelos mayores, revisión humana) en entornos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kuantum-ai1/TinyGuard1.1-22M
- Modelo base: https://huggingface.co/nreimers/MiniLM-L6-H384-uncased
- Dataset ucirvine/sms_spam: https://huggingface.co/datasets/ucirvine/sms_spam
- Dataset Deysi/spam-detection-dataset: https://huggingface.co/datasets/Deysi/spam-detection-dataset
- Dataset ealvaradob/phishing-dataset: https://huggingface.co/datasets/ealvaradob/phishing-dataset
- Dataset xTRam1/safe-guard-prompt-injection: https://huggingface.co/datasets/xTRam1/safe-guard-prompt-injection
- Dataset databricks/databricks-dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k

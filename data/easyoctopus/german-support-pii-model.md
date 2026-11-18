# EasyOctopus/german-support-pii-model

## Resumen

EasyOctopus/german-support-pii-model es un checkpoint experimental de clasificación de tokens (token classification) para la detección de información personal identificable (PII) en textos de soporte en alemán. Lo desarrolla Mahir Isikli bajo el sello EasyOctopus y parte del modelo base distilbert/distilbert-base-german-cased, un DistilBERT en alemán con casing. El modelo etiqueta tokens con esquema beginning-inside-outside (BIO) y devuelve offsets Unicode junto con el texto redactado, procesando desbordamientos en ventanas no solapadas de 256 tokens.

El problema que aborda es concreto: la redacción automática de datos sensibles (correos, nombres, identificadores) en mensajes de atención al cliente en alemán, un caso frecuente en pipelines de soporte y cumplimiento del RGPD. La relevancia actual radica en que es un modelo pequeño (66,8 millones de parámetros) que puede ejecutarse en CPU o GPU local, sin enviar texto a servicios externos, y con licencia Apache-2.0 que permite uso comercial.

La variante publicada, denominada scenarios-hard, fue seleccionada mediante una regla de validación congelada entre varias alternativas controladas. El autor advierte explícitamente que las garantías de privacidad están limitadas por el contexto de frontera y los spans no detectados, y que los resultados no miden la calidad de protección sobre mensajes reales de clientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado) |
| Parámetros totales | 66.832.159 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como contexto de entrenamiento; la inferencia procesa ventanas no solapadas de 256 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | alemán (de) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0,5 GB, compatible con transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de distilbert-base-german-cased, un transformer encoder de tipo DistilBERT con vocabulario y casing alemán. La cabeza de clasificación de tokens emplea etiquetas de tipo beginning, inside y outside (BIO) para delimitar spans de PII. La inferencia devuelve offsets Unicode y texto redactado, y gestiona secuencias largas mediante ventanas no solapadas de 256 tokens.

El entrenamiento se realizó sobre el dataset companion EasyOctopus/german-support-pii-data, con datos sintéticos de mensajes de soporte. El autor documenta seis variantes controladas (replay, scenarios, scenarios-hard, prior, live-adapted y pilot-union) y seleccionó scenarios-hard mediante una regla de validación congelada. La variante scenarios-hard añade ejemplos positivos novedosos y hard negatives. Todos los parámetros se actualizaron en una única NVIDIA A100-SXM4-80GB. La configuración de reentrenamiento documentada usa semilla 20261118, 3 épocas, batch size 24, AdamW con learning rate constante de 1,5e-05, weight decay 0,01, gradient clipping a norma 1 y autocast BF16 cuando la tarjeta lo soporta. El entorno original fue PyTorch 2.6.0, CUDA 12.4 y Transformers 4.49.0. No se documenta uso de RLHF ni DPO.

## Capacidades

- Detección de PII en alemán con etiquetado BIO (beginning, inside, outside).
- Devolución de offsets Unicode y generación de texto redactado.
- Procesamiento de secuencias largas mediante ventanas no solapadas de 256 tokens.
- Ejecución local en CPU o GPU, sin envío de texto al Hub.
- Clasificación de tokens compatible con la API estándar de Transformers (`AutoModelForTokenClassification`).
- Incluye script `infer.py` con modo de autocomprobación (`--self-test`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes.

## Casos de uso

- Redacción de PII en tickets de soporte: el modelo identifica spans sensibles en mensajes de clientes en alemán y devuelve el texto redactado, adecuado para pipelines de RGPD antes del almacenamiento o del envío a sistemas analíticos.
- Preprocesado para entrenamiento de modelos de soporte: se puede usar para eliminar datos personales de conversaciones sintéticas o reales antes de reutilizarlas en datasets de entrenamiento.
- Enmascarado en registros de aplicaciones: integrado como paso previo al logging, detecta correos y otros identificadores en trazas y mensajes de error en alemán.
- Filtrado en herramientas de atención al cliente: permite marcar mensajes que contienen PII antes de su revisión humana o de su enrutado a colas específicas.
- Cumplimiento en exportaciones de datos: actúa como capa de verificación sobre volcados de conversaciones para comprobar que no se exportan datos personales sin redactar.
- Prototipado y evaluación de pipelines de privacidad: al ser un modelo pequeño y ejecutable en CPU, sirve para comparar estrategias de detección (modelo, reglas, combinaciones) en entornos de desarrollo sin infraestructura GPU.

## Benchmarks y rendimiento

Resultados de la selección de variantes sobre el conjunto de validación documentado por el autor:

| Candidato | Spans completos | Caracteres colaterales | Negativos marcados |
|---|---:|---:|---:|
| replay | 214/256 | 170/10.805 (1,57%) | 16/48 |
| scenarios | 255/256 | 292/10.805 (2,70%) | 17/48 |
| scenarios-hard | 255/256 | 55/10.805 (0,51%) | 2/48 |
| prior | 214/256 | 178/10.805 (1,65%) | 16/48 |
| live-adapted | 178/256 | 245/10.805 (2,27%) | 46/48 |
| pilot-union | 240/256 | 275/10.805 (2,55%) | 46/48 |

Resultados en suites independientes:

| Suite | Checkpoint seleccionado | Inicializador |
|---|---:|---:|
| Suite independiente anterior | 94/108 spans protegidos | 86/108 |
| Suite de confirmación anterior | 64/70 spans protegidos | 63/70 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 66,8 millones de parámetros; en FP32 ocupa aproximadamente 267 MB de pesos, y en FP16/BF16 alrededor de 134 MB. La VRAM total necesaria es baja y depende del runtime y del batch.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; el autor entrenó en una NVIDIA A100-SXM4-80GB, pero la inferencia no requiere esa capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: Transformers con PyTorch; el repositorio incluye `infer.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas con modelos alternativos en la información proporcionada. Como referencia estructural, el modelo base distilbert-base-german-cased (mismo tamaño y arquitectura, sin fine-tuning para PII) sirve como inicializador documentado en la model card, pero no se ofrecen métricas comparativas de rendimiento más allá de las suites propias del autor.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| EasyOctopus/german-support-pii-model | 66,8 M | ventanas de 256 tokens en inferencia | Apache-2.0 | Hugging Face |
| distilbert-base-german-cased (inicializador) | no disponible en la información | no disponible | no disponible | Hugging Face |
| Alternativas de detección de PII en alemán | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El autor advierte que el contexto de frontera y los spans no detectados limitan las garantías de privacidad; no es una solución de anonimización garantizada.
- Los resultados se obtuvieron sobre datos sintéticos; no miden la calidad de protección ni de dictado sobre mensajes reales de clientes.
- Las muestras repetidas dentro de una plantilla están correlacionadas y las familias de split, aunque disjuntas, comparten el mismo proceso de autoría, lo que puede inflar la estimación de rendimiento.
- El modelo solo soporta alemán; no se documentan capacidades multilingües.
- La ventana de inferencia es de 256 tokens no solapados, lo que puede perder spans que cruzan fronteras de ventana.
- Es un checkpoint experimental, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- Riesgo de alucinación de spans: puede marcar negativos como PII (2/48 en el conjunto de validación de la variante seleccionada) y dejar spans sin proteger.
- Licencia Apache-2.0 permite uso comercial, pero se debe revisar LICENSE y NOTICE para la atribución de fuentes.
- Diferencias de CUDA, hardware y librerías pueden alterar los resultados numéricos del reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EasyOctopus/german-support-pii-model
- Dataset companion: https://huggingface.co/datasets/EasyOctopus/german-support-pii-data
- Modelo base: https://huggingface.co/distilbert/distilbert-base-german-cased

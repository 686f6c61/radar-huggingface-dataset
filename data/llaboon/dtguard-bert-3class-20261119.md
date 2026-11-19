# llaboon/dtguard-bert-3class-20261119

## Resumen

DT-Guard 三档 BERT es un modelo de clasificación de texto en chino desarrollado por el usuario llaboon en el contexto del proyecto JoySafety. Se trata de un ajuste fino del modelo `hfl/chinese-macbert-base` (12 capas, hidden 768) orientado a moderación de contenido, que clasifica cada entrada en tres categorías: Safe, Unsafe y Borderline. El modelo cuenta con 102.269.955 parámetros y una longitud máxima de entrada de 128 tokens.

El modelo se presenta explícitamente como una validación de viabilidad del pipeline DT-Guard, no como un peso de producción. Su propósito es demostrar la cadena completa: datos en chino, etiquetado y muestreo de incertidumbre mediante el profesor `autotrust/JEV-9B`, clasificación de tres vías con MacBERT, entrenamiento en H20 y exportación a Hugging Face. La categoría Borderline se corresponde con el `riskCode=9000` de JoySafety y está pensada para derivar a revisión humana o redirección, no para bloqueo directo.

Es relevante ahora porque ejemplifica un patrón habitual en el despliegue de guardarraíles de seguridad para LLM: usar un modelo pequeño y rápido (BERT) como primera capa de filtrado, apoyado en un profesor generativo de mayor tamaño para resolver los casos ambiguos. Sus resultados, no obstante, muestran un rendimiento muy flojo en la clase Borderline (F1 de 0,0992), lo que limita seriamente su uso sin recalibración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), base `hfl/chinese-macbert-base`, 12 capas, hidden 768, con cabeza de clasificación de 3 clases |
| Parametros totales | 102.269.955 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (max_len de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors sin variantes GGUF/ONNX declaradas) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de `hfl/chinese-macbert-base`, un encoder BERT de 12 capas y dimensión oculta 768 preentrenado en chino. Sobre la representación del token `[CLS]` se añade una cabeza lineal de tres salidas (Safe, Unsafe, Borderline). No emplea arquitecturas híbridas ni mecanismos de atención lineal; es un transformer encoder estándar con atención completa y límite de 128 tokens por entrada.

El entrenamiento se realizó durante 3 épocas, con batch de 32, learning rate 2e-5, precisión bf16, pesos de clase inversos y sobremuestreo de la clase Borderline por factor 3. Los datos combinan el corpus COLD de lenguaje ofensivo en chino (25.726 ejemplos de entrenamiento) con 267 plantillas semilla de seguridad para LLM escritas a mano, 45 de ellas con semántica de frontera. La composición final del conjunto de entrenamiento es 11.390 Safe, 8.415 Unsafe y 1.074 Borderline. El profesor `autotrust/JEV-9B` (cabeza de decisión `noul`) se usó únicamente para seleccionar el 5% de muestras más inciertas como Borderline; las etiquetas principales provienen de COLD. El acuerdo entre el profesor y las etiquetas originales de COLD fue del 72,62%, con un 27,38% de desacuerdo, motivo por el que se priorizaron las etiquetas originales. El entrenamiento se ejecutó en una GPU H20 de 96 GB con PyTorch 2.13.0+cu129 y Transformers 5.17.0.

## Capacidades

- Clasificación de texto en chino en tres categorías de seguridad: Safe, Unsafe y Borderline.
- Detección de contenido ofensivo y de riesgo en textos de redes sociales (dominio COLD).
- Detección de instrucciones maliciosas en prompts de LLM, según las plantillas semilla del autor (por ejemplo, fabricación de explosivos, jailbreak, contenido sexual explícito, apuestas ilegales).
- Salida de probabilidades por clase mediante softmax, apta para umbralización posterior.
- Soporte de calibración externa mediante el archivo `calibration.json` incluido en el repositorio (regla `p(Borderline) >= 0.24`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- Capacidad multilingüe limitada al chino; no se declaran otros idiomas.

## Casos de uso

- Filtrado previo de prompts en aplicaciones LLM en chino: el modelo clasifica la entrada del usuario antes de enviarla al modelo generativo, derivando los casos Unsafe a bloqueo o reescritura y los Borderline a revisión. Es adecuado por su bajo coste computacional y su latencia reducida frente a un guard generativo.
- Moderación de comentarios en foros y redes sociales en chino: clasificación por lotes de mensajes con umbral ajustable para decidir entre publicación, ocultación y revisión humana.
- Enrutado a revisión humana en pipelines de confianza y seguridad: la clase Borderline permite separar los casos ambiguos y enviarlos a un revisor, reduciendo la carga de revisión manual sobre el total.
- Segunda capa de defensa tras un clasificador binario: el modelo puede combinarse con un filtro binario previo para refinar los casos dudosos con la categoría intermedia.
- Evaluación comparativa de guardarraíles: sirve como referencia para medir el coste y el rendimiento de un enfoque BERT pequeño frente a guardarraíles generativos en tareas de seguridad en chino.
- Prototipado de sistemas de seguridad con `safety-bert` de JoySafety: el repositorio documenta la integración directa mediante `dtguard.model_path`, `dtguard.tokenizer_path` y `label_map.json`, lo que permite montar un servicio de inferencia de referencia.
- Investigación sobre etiquetado con profesor y muestreo de incertidumbre: el modelo documenta explícitamente el desacuerdo profesor-etiqueta original (27,38%), útil para estudiar la calidad del etiquetado automático en dominios de moderación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Evaluación | Métrica | Valor |
|---|---|---|
| COLD dev, 3 clases | Accuracy | 0,8431 |
| COLD dev, 3 clases | Macro-F1 | 0,6193 |
| COLD dev, 3 clases | Loss | 0,517 |
| COLD dev, 2 clases (Borderline como riesgoso) | Accuracy | 0,9117 |
| COLD dev, 2 clases | Precision (riesgo) | 0,9008 |
| COLD dev, 2 clases | Recall (riesgo) | 0,9249 |
| COLD dev, 2 clases | F1 (riesgo) | 0,9127 |
| Semillas manuales de seguridad LLM | Accuracy | 0,9231 |
| Semillas manuales de seguridad LLM | Macro-F1 | 0,8056 |

Desglose por clase en COLD dev (3 clases):

| Clase | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| Safe | 0,8966 | 0,9004 | 0,8985 | 3121 |
| Unsafe | 0,8567 | 0,8641 | 0,8604 | 2988 |
| Borderline | 0,1060 | 0,0932 | 0,0992 | 322 |

Tras aplicar la calibración documentada (`p(Borderline) >= 0.24`), el autor reporta en COLD dev: Borderline precision 0,0943, recall 0,1429, F1 0,1136, y F1 binario de 0,9026.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,4 GB de pesos, más overhead de activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- VRAM estimada en bf16/fp16: en torno a 0,2 GB de pesos.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para volúmenes moderados. En GPU, cualquier tarjeta consumer reciente (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente. Una A100 o H100 solo tendría sentido para servir en lote a gran escala.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (AutoModelForSequenceClassification), Text Embeddings Inference (el repositorio está marcado como `text-embeddings-inference` y `endpoints_compatible`), y cualquier servidor compatible con la API de Hugging Face. No se documentan variantes GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponible en la información proporcionada. Por el tamaño del modelo (102 M de parámetros) y la longitud máxima de 128 tokens, se espera una latencia de milisegundos por petición en GPU consumer, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| llaboon/dtguard-bert-3class-20261119 | 102,3 M | 128 tokens | Clasificación de seguridad en chino (3 clases) | Apache-2.0 | Validación de viabilidad; Borderline con F1 bajo |
| hfl/chinese-macbert-base | 102,3 M | 512 tokens (típico en BERT) | Modelo base de lenguaje en chino | Apache-2.0 | Base de este ajuste; no es un guardarraíl por sí mismo |
| autotrust/JEV-9B | 9 B (aproximado, según denominación) | no disponible | Profesor de decisión de seguridad | no disponible | Usado como profesor para el etiquetado; no se distribuye con este modelo |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no se incluye comparación numérica de rendimiento.

## Limitaciones y advertencias

- El propio autor declara que el modelo es una validación de viabilidad y no un peso de producción; debe reevaluarse y recalibrarse con datos reales de negocio antes de desplegarlo.
- El rendimiento en la clase Borderline es muy bajo (F1 de 0,0992 en argmax y 0,1136 tras calibración), por lo que la detección de casos ambiguos no es fiable.
- Los datos de entrenamiento (COLD) son lenguaje ofensivo de redes sociales, no prompts ni respuestas de LLM; la transferencia de dominio a seguridad de LLM no está demostrada.
- Las etiquetas Borderline provienen de muestreo de incertidumbre del profesor, no de revisión humana, lo que introduce ruido en esa clase.
- El desacuerdo entre el profesor JEV-9B y las etiquetas originales de COLD es del 27,38%, lo que refleja un desajuste de dominio relevante.
- La cabeza de tres clases solo emite la etiqueta de seguridad; las categorías de intención no se modelan y quedan como metadatos o mapeo fijo.
- Las plantillas semilla cubren un conjunto limitado de categorías de seguridad de LLM y no sustituyen a datos de red team reales.
- El límite de 128 tokens trunca entradas largas, lo que puede perder contexto relevante en prompts extensos.
- Solo soporta chino; no se declaran capacidades multilingües.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí existe riesgo de falsos negativos y falsos positivos, especialmente en la clase Borderline.
- No se documentan sesgos específicos más allá de los derivados del corpus COLD y de las plantillas del autor.
- La licencia Apache-2.0 permite uso comercial, pero el corpus COLD subyacente tiene su propia licencia y requisitos de cita que deben respetarse.
- El modelo no incluye el profesor JEV-9B, que no se distribuye con este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llaboon/dtguard-bert-3class-20261119
- Modelo base: https://huggingface.co/hfl/chinese-macbert-base
- Profesor citado: https://huggingface.co/autotrust/JEV-9B
- Corpus COLD (THU-COAI COLDataset): no disponible en la información proporcionada
- Repositorio JoySafety (scripts de entrenamiento `dtguard_training/` e integración `safety-bert`): no disponible en la información proporcionada

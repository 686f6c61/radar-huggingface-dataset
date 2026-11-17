# DuckerMaster/DuckerTime-Normalize-Thai

## Resumen

DuckerTime-Normalize-Thai es un modelo de clasificación de tokens (token classification) especializado en la extracción de expresiones temporales en tailandés coloquial. Lo desarrolla DuckerMaster y se construye mediante fine-tuning de `airesearch/wangchanberta-base-att-spm-uncased`, el modelo base preentrenado para tailandés de AI Research (WangchanBERTa), con arquitectura RoBERTa/CamemBERT y aproximadamente 106 millones de parámetros.

El modelo resuelve un problema muy concreto: aislar los fragmentos de texto que contienen referencias temporales (fechas, horas, expresiones como "el miércoles que viene por la tarde") en frases informales de chat, jerga conversacional y estructuras compuestas de fecha y hora. No genera texto ni normaliza a ISO-8601 por sí mismo: actúa como frontend neuronal que delimita el span temporal, que después se pasa a un motor de reglas determinista para producir timestamps válidos.

Su relevancia radica en el enfoque híbrido que propone el autor. Frente a LLMs generativos, que según sus mediciones fallan al devolver spans estrictos y añaden latencia, este modelo de 106M parámetros logra un 96,9% de F1 fuera de distribución con una latencia media de 10,2 ms en GPU T4. Está publicado con licencia Apache 2.0 y orientado exclusivamente al idioma tailandés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa / CamemBERT (WangchanBERTa base) |
| Parametros totales | ~106M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado con FP16 mixed precision; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | Tailandés (th) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors / PyTorch (formato estándar de transformers; el repo figura con 0.0 GB, posiblemente sin pesos subidos en el momento de la consulta) |

## Arquitectura y entrenamiento

El modelo parte de WangchanBERTa base (`wangchanberta-base-att-spm-uncased`), un encoder transformer con arquitectura RoBERTa adaptada al tailandés mediante SentencePiece y preentrenada sobre Wikipedia, noticias y texto social en tailandés. Sobre esa base se aplica una cabeza de clasificación de tokens con tres etiquetas: `O` (fuera de entidad temporal), `B-TIME` (inicio de expresión temporal) e `I-TIME` (continuación).

El fine-tuning se realizó durante 4 épocas, con batch size de 16 por dispositivo, optimizador AdamW (learning rate 3e-5, weight decay 0.01), 50 pasos de warmup y precisión mixta FP16. El conjunto de entrenamiento es el Thai Natural DateTime Dataset (v1.1) del mismo autor, que incluye muestras negativas para suprimir entidades numéricas no temporales (importes monetarios, números de teléfono, números de seguimiento). En inferencia se aplica un stitching multi-token con umbral de confianza de 0.35 para manejar partículas separadas y modificadores propios del chat. La innovación principal no está en la arquitectura, sino en el diseño de sistema: separar la extracción neuronal del span de la normalización determinista posterior para evitar alucinaciones.

## Capacidades

- Extracción de entidades temporales a nivel de token en tailandés coloquial, con etiquetas B-TIME / I-TIME / O.
- Reconocimiento de fechas, horas y expresiones compuestas de fecha-hora en lenguaje informal y jerga de chat.
- Supresión activa de entidades numéricas no temporales gracias al muestreo negativo del entrenamiento.
- Stitching multi-token con umbral de confianza para expresiones fragmentadas por partículas.
- Diseñado como frontend de un pipeline híbrido: su salida alimenta un motor de reglas que produce ISO-8601.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento: es un modelo discriminativo de clasificación.
- Capacidad multilingüe nula: solo tailandés; para otros idiomas el autor recomienda parsers multilingües alternativos.

## Casos de uso

- Normalización de fechas en asistentes conversacionales en tailandés: el modelo extrae el span temporal de mensajes como "ขอเลื่อนเป็นวันพุธหน้าช่วงบ่ายแก่ๆ" y el motor de reglas lo convierte en un timestamp ISO-8601, permitiendo agendar o reprogramar eventos.
- Procesamiento de chats de atención al cliente: detección de referencias temporales en conversaciones multi-turno para clasificar tickets por fecha de incidencia o plazo de resolución.
- Extracción de eventos en redes sociales y foros tailandeses: identificación de cuándo ocurre un evento mencionado en texto informal, con latencia de milisegundos apta para ingesta en streaming.
- Enriquecimiento de pipelines de datos: anotación automática de datasets tailandeses con spans temporales para entrenar o evaluar otros sistemas de NLU.
- Automatización de calendario y recordatorios: integración en bots de mensajería que interpretan "el viernes que viene a las cuatro" y crean entradas de calendario sin intervención humana.
- Filtrado y análisis de quejas o incidencias con marca temporal: extracción del momento referido en reclamaciones para priorizar por antigüedad o urgencia.
- Preprocesado para sistemas de retrieval temporal: indexar documentos tailandeses por las fechas que mencionan, usando el span extraído como metadato estructurado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Sistema / modelo | Parámetros | Hardware | F1 / accuracy OOD | Latencia media (ms) | SLA <50 ms |
|---|---|---|---|---|---|
| dateparser (heurístico multilingüe) | 0 | CPU | 6,0% | 12,4 | Pasa |
| PyThaiNLP (parser de reglas) | 0 | CPU | 18,7% | 1,8 | Pasa |
| Qwen2.5-3B-Instruct (4-bit NF4) | 3B | GPU T4 | 3,3% | 383,3 | Falla (>7x) |
| Typhoon 30B (API REST cloud) | 30B | Servidor cloud | 47,3% | 2.753,9 | Falla (>55x) |
| Sistema híbrido (WangchanBERTa + reglas) | 106M | GPU T4 | 96,9% | 10,2 | Pasa |

Métricas del modelo sobre el Thai Natural DateTime Dataset (v1.1), según model-index del autor:

| Métrica | Valor |
|---|---|
| F1 in-distribution | 1,0000 |
| F1 out-of-distribution | 0,9692 |
| Recall out-of-distribution | 0,9957 |
| Precision out-of-distribution | 0,9441 |

## Requisitos de hardware

- Inferencia muy ligera: ~106M parámetros, aproximadamente 0,4 GB en FP32 y ~0,2 GB en FP16, más el overhead de activaciones y tokenizador.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para cargas moderadas.
- El autor reporta 10,2 ms de latencia media por petición (batch size 1, streaming) en una NVIDIA T4.
- Despliegue estándar vía `transformers` (`AutoModelForTokenClassification`); también es compatible con ONNX Runtime, TGI o TorchServe para servir el clasificador. No se documentan pesos GGUF ni integración con llama.cpp/Ollama.
- Para el pipeline completo (modelo + motor de reglas) se necesita además el paquete `thai-temporal-normalizer` que menciona el autor.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Enfoque | F1 OOD | Latencia | Licencia |
|---|---|---|---|---|---|---|
| DuckerTime-Normalize-Thai | Encoder token classification | ~106M | Span temporal + reglas | 96,9% | 10,2 ms (T4) | Apache 2.0 |
| PyThaiNLP | Parser de reglas | 0 | Heurístico | 18,7% | 1,8 ms (CPU) | Open source |
| dateparser | Parser heurístico multilingüe | 0 | Heurístico | 6,0% | 12,4 ms (CPU) | Open source |
| Qwen2.5-3B-Instruct | LLM generativo | 3B | Generación directa | 3,3% | 383,3 ms (T4) | No disponible en la información |
| Typhoon 30B | LLM generativo (API) | 30B | Generación directa | 47,3% | 2.753,9 ms (cloud) | No disponible en la información |

## Limitaciones y advertencias

- Solo tailandés: para texto en otros idiomas hay que usar parsers multilingües alternativos, según el propio autor.
- No normaliza a ISO-8601 por sí solo; requiere el motor de reglas `thai-temporal-normalizer` para obtener timestamps válidos.
- El F1 in-distribution de 1,0 es sospechosamente alto y corresponde a evaluación del propio autor sobre su propio dataset; no hay verificación independiente.
- El modelo está ajustado para suprimir números no temporales, lo que puede provocar falsos negativos si una expresión temporal comparte formato con importes o identificadores.
- Riesgo de errores en expresiones temporales muy ambiguas o dependientes de contexto cultural no cubierto en el dataset.
- El repositorio figura con tamaño 0.0 GB en el momento de la consulta, lo que puede indicar que los pesos no están disponibles públicamente; conviene verificar antes de integrarlo en producción.
- Aunque la licencia es Apache 2.0 (permite uso comercial), el autor no documenta garantías ni procesos de auditoría de sesgos para el dominio temporal tailandés.
- No apto para tareas generativas, razonamiento general ni comprensión multimodal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuckerMaster/DuckerTime-Normalize-Thai
- Dataset: https://huggingface.co/datasets/DuckerMaster/Thai-Natural-DateTime-Dataset
- Modelo base: https://huggingface.co/airesearch/wangchanberta-base-att-spm-uncased
- Paper de WangchanBERTa: https://arxiv.org/abs/2101.09635
- Referencia ISO-TimeML (Pustejovsky et al., 2010): no disponible enlace directo en la información proporcionada

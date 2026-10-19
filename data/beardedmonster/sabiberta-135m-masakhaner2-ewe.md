# BeardedMonster/SabiBERTa-135M-masakhaner2-ewe

## Resumen

SabiBERTa-135M-masakhaner2-ewe es un checkpoint de clasificación de tokens (reconocimiento de entidades nombradas, NER) obtenido por fine-tuning del modelo base BeardedMonster/SabiBERTa-135M sobre el split de ewe del corpus MasakhaNER 2.0. Lo publica el usuario BeardedMonster dentro de una familia de adaptaciones por idioma africano, y su único propósito es etiquetar entidades (personas, organizaciones, localizaciones y fechas) en texto en ewe, una lengua kwa hablada en Ghana y Togo.

El modelo parte de una arquitectura ModernBERT de 135.883.017 parámetros (según los pesos en safetensors), es decir, un encoder transformer bidireccional con atención de tipo full, no un modelo generativo. El fine-tuning se hizo con 50 épocas, learning rate 5e-5, batch size 32 y longitud máxima de 256 tokens, y reporta un span_f1 medio de 0,8225 sobre el protocolo de evaluación de MasakhaNER 2.0.

Su relevancia es acotada pero clara: cubre una lengua con poquísimos recursos y lo hace con un modelo pequeño (0,5 GB de repo) que cabe en cualquier GPU de consumo o incluso en CPU. Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada explícitamente y con una sola ejecución de evaluación, por lo que debe tratarse como un punto de partida reproducible más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional, tag `modernbert`) |
| Parametros totales | 135.883.017 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion; el fine-tuning se realizo con `max_length` 256 |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | ewe (Ewe) |
| Licencia | no disponible; la model card remite a la licencia y terminos del modelo base `BeardedMonster/SabiBERTa-135M` |
| Formato de pesos | safetensors |
| Tarea | Token classification (NER); carga via `AutoModelForTokenClassification` |
| Dataset de entrenamiento | masakhaner2, split de ewe |
| Metrica declarada | span_f1 = 0,8225 |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-18 |

## Arquitectura y entrenamiento

La arquitectura es ModernBERT, un encoder transformer de tipo BERT modernizado que el tag del repositorio identifica explícitamente. Con 135,9 M de parámetros y pesos en safetensors, se corresponde con la variante pequeña de la familia SabiBERTa, pensada para lenguas africanas. Sobre esa base se añade una cabeza de clasificación de tokens (`AutoModelForTokenClassification`), y la model card indica que `id2label` está preconfigurado, de modo que las predicciones se decodifican directamente a nombres de etiqueta sin post-procesado manual.

El entrenamiento consistió en un fine-tuning supervisado sobre el protocolo de ewe de MasakhaNER 2.0, con 50 épocas, learning rate 5e-5, batch size 32 y truncado a 256 tokens. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá del corpus citado, ni si hubo técnicas de regularización adicionales. Tampoco se menciona ninguna innovación técnica específica (decodificación especulativa, atención lineal o similar); es un fine-tuning estándar de NER.

El punto metodológicamente relevante es la procedencia de la métrica: el autor indica que el arnés de evaluación del proyecto reproduce los baselines publicados de MasakhaNER 2.0 con una desviación de aproximadamente 0,25 F1, lo que calibra el resultado. Sin embargo, los scores provienen de una única ejecución, mientras que los papers de referencia promedian 5 semillas, por lo que diferencias pequeñas frente a otros sistemas deben considerarse ruido.

## Capacidades

- Reconocimiento de entidades nombradas en ewe: etiquetado a nivel de token con decodificación directa a nombres de etiqueta gracias al `id2label` incluido.
- Extracción de spans de entidades siguiendo el esquema de anotación de MasakhaNER 2.0 (personas, organizaciones, localizaciones y fechas, según el estándar del corpus).
- Procesamiento de secuencias de hasta 256 tokens por pasada, suficiente para titulares, párrafos cortos y documentos fragmentados.
- Inferencia rápida y económica: 135,9 M de parámetros permiten ejecución en CPU con latencias bajas.
- Integración nativa con el ecosistema transformers (`AutoTokenizer` + `AutoModelForTokenClassification`), lo que facilita su uso en pipelines de NLP existentes.
- Capacidad de servir como pre-anotador en flujos de anotación humana o active learning para corpus en ewe.

No dispone de generación de texto, razonamiento multi-paso, tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido: es un encoder discriminativo de una sola tarea.

## Casos de uso

- Extracción de entidades en prensa en ewe: ingerir titulares y cuerpos de noticia de medios ghaneses y togoleses, trocear a 256 tokens y etiquetar personas, organizaciones y localizaciones para alimentar un índice de búsqueda o una base de datos de seguimiento informativo.
- Enriquecimiento de corpus lingüísticos: procesar colecciones de texto en ewe para poblar anotaciones automáticas de NER que después se revisan por lingüistas, aprovechando el span_f1 de 0,8225 como punto de partida con corrección humana.
- Anonimización y seudonimización de documentos: detectar nombres de personas y organizaciones en informes clínicos, legales o administrativos en ewe antes de compartirlos con terceros, reduciendo la exposición de datos personales.
- Pre-anotación para proyectos de anotación: usar el modelo como primer paso de un flujo de active learning, de modo que los anotadores humanos solo corrijan los spans dudosos y se reduzca el coste por documento.
- Monitorización de medios y análisis de reputación: extraer menciones de organizaciones y localidades en flujos RSS o scrapers en ewe para construir series temporales de cobertura.
- Construcción de grafos de conocimiento multilingües: alinear las entidades extraídas en ewe con las de documentos en inglés o francés del mismo dominio para enlazar registros de una base de datos común.
- Filtrado y clasificación documental en archivos digitales: etiquetar lotes de documentos escaneados con OCR en ewe para separar aquellos que contienen entidades de interés (por ejemplo, referencias geográficas) antes de un proceso de revisión manual.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del propio fine-tuning sobre el split de ewe de MasakhaNER 2.0:

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| MasakhaNER 2.0 (ewe) | span_f1 | 0,8225 | Media sobre 1 idioma, una sola ejecución |
| MasakhaNER 2.0 (ewe) | epochs / lr / batch / max_length | 50 / 5e-5 / 32 / 256 | Configuracion de entrenamiento declarada |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales en la informacion disponible; no aplican a un modelo de clasificación de tokens. Tampoco se proporcionan métricas desagregadas por tipo de entidad (las puntuaciones por idioma están en `metrics.json`, no incluido en la información disponible). El autor advierte que el arnés reproduce los baselines de MasakhaNER 2.0 con ±0,25 F1 y que la puntuación proviene de una única ejecución frente a las 5 semillas de los papers de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,27 GB en fp16 y 0,55 GB en fp32 para los pesos; con activaciones y batch pequeño, menos de 1 GB en la práctica.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Ejecución en CPU totalmente viable: 135,9 M de parámetros permiten throughput de cientos de secuencias cortas por segundo en un servidor moderno, aunque no se dispone de cifras medidas.
- GPU de datacenter (A100, H100) innecesarias para inferencia; solo tendrían sentido para reentrenar el modelo a gran escala o para servir lotes masivos en paralelo.
- Opciones de despliegue: transformers con PyTorch para uso directo; ONNX Runtime u Optimum para reducir latencia en CPU; Triton o TorchServe para servir la tarea de token classification. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no están soportados de forma nativa con este checkpoint.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SabiBERTa-135M-masakhaner2-ewe | 135,9 M | no disponible (entrenado a 256) | NER en ewe | no disponible | HuggingFace, 0 descargas |
| SabiBERTa-135M (base) | ~135 M | no disponible | Encoder base para lenguas africanas | no disponible | HuggingFace |
| XLM-RoBERTa-base (referencia multilingue) | ~278 M | 512 tokens | Encoder multilingue, base para NER | MIT (según el autor original) | Ampliamente disponible |
| mBERT (bert-base-multilingual-cased) | ~178 M | 512 tokens | Encoder multilingue | Apache 2.0 (según el autor original) | Ampliamente disponible |

La comparación de rendimiento frente a estos modelos en ewe no está disponible en la información proporcionada: el checkpoint solo publica su propio span_f1 de 0,8225 sin tabla comparativa. Las cifras de parámetros y contexto de XLM-RoBERTa-base y mBERT corresponden a los checkpoints base tal como los publican sus autores y se incluyen como referencia de escala, no como resultado de una evaluación conjunta.

## Limitaciones y advertencias

- Cobertura monolingüe: solo ewe. No debe esperarse transferencia a otras lenguas africanas sin un fine-tuning específico, aunque el modelo base sea multilingüe.
- Tarea única: no genera texto ni responde preguntas; cualquier uso fuera de token classification requiere añadir cabezas o modelos adicionales.
- Longitud limitada: el entrenamiento se hizo con `max_length` 256, por lo que secuencias más largas se truncan o se fragmentan, con riesgo de perder entidades en los cortes.
- Evaluación de una sola ejecución: el 0,8225 de span_f1 no está promediado sobre semillas, a diferencia de los baselines de MasakhaNER 2.0, así que las comparaciones finas son frágiles.
- Licencia no declarada: la model card remite a la licencia del modelo base `BeardedMonster/SabiBERTa-135M`, que no se especifica en la información disponible. Antes de cualquier uso comercial hay que verificar los términos del checkpoint original.
- Sesgos heredados: el modelo aprende el esquema y los sesgos de anotación de MasakhaNER 2.0, incluyendo la distribución de dominios del corpus (principalmente noticias), lo que puede degradar el rendimiento en textos conversacionales, legales o clínicos.
- Riesgo de falsos negativos en entidades poco frecuentes y de errores en límites de span, típicos en NER con pocos datos; conviene validar sobre una muestra del dominio objetivo antes de desplegar.
- Sin validación externa: 0 descargas y 0 likes indican que el checkpoint no ha sido reproducido ni auditado por terceros.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones optimizadas, lo que limita el despliegue en entornos con llama.cpp u Ollama.
- El pipeline declarado en los metadatos de HuggingFace figura como no disponible, aunque la model card documenta la carga como token classification; conviene fijar la versión de transformers para evitar incompatibilidades con `modernbert`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-ewe
- Modelo base: https://huggingface.co/BeardedMonster/SabiBERTa-135M
- Dataset MasakhaNER 2.0: https://huggingface.co/datasets/masakhane/masakhaner2
- Script de carga del dataset: https://huggingface.co/datasets/masakhane/masakhaner2/blob/main/masakhaner2.py
- Repositorio del proyecto MasakhaNER: https://github.com/masakhane-io/masakhane-ner
- Paper MasakhaNER 2.0 (Africa-centric Transfer Learning for NER): https://www.researchgate.net/publication/364689696_MasakhaNER_20_Africa-centric_Transfer_Learning_for_Named_Entity_Recognition

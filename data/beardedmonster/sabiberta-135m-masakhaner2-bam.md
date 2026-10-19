# BeardedMonster/SabiBERTa-135M-masakhaner2-bam

## Resumen

Este checkpoint es un modelo de clasificación de tokens especializado en reconocimiento de entidades nombradas (NER) para bambara (`bam`). Se obtiene mediante fine-tuning de `BeardedMonster/SabiBERTa-135M`, un encoder de 135.883.017 parámetros (≈135,9 M) etiquetado como ModernBERT, sobre el protocolo `bam` de MasakhaNER 2.0. El resultado asigna etiquetas de entidad a cada token de entrada; no es un modelo generativo ni un chat.

Su relevancia radica en cubrir una lengua africana de bajos recursos con un modelo ligero, desplegable en hardware modesto y con un resultado publicado de span F1 medio de 0,7075 en una única ejecución. El autor indica que su arnés de evaluación reproduce los baselines publicados de MasakhaNER 2.0 con una tolerancia de ±0,25 F1. La licencia no está declarada y queda sujeta a la del modelo base, por lo que conviene verificarla antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Autor | BeardedMonster |
| Arquitectura | Transformer encoder tipo ModernBERT (según el tag `modernbert`; detalles no disponibles) |
| Parámetros totales | 135.883.017 (≈135,9 M) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible. El fine-tuning usó `max_length` 256; no se especifica el máximo del modelo base |
| Tipos de cuantización | No disponible. No se publican checkpoints cuantizados; al ser un encoder de 135,9 M se puede convertir a fp16/bf16 o int8 con herramientas estándar, pero no hay artefactos oficiales |
| Idiomas soportados | Bambara (`bam`) |
| Licencia | No disponible. Rige la licencia y los términos del modelo base `BeardedMonster/SabiBERTa-135M` |
| Formato de pesos | `safetensors` |
| Tamaño del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La información disponible identifica el modelo base como `SabiBERTa-135M` y lo etiqueta con `modernbert`, por lo que se trata de un transformer encoder de la familia ModernBERT. El checkpoint resultante añade una cabeza de clasificación de tokens (`AutoModelForTokenClassification`) y se ha ajustado sobre MasakhaNER 2.0 para la lengua `bam`. No se detallan en la model card la composición del corpus de preentrenamiento, el número de tokens, la tokenización ni posibles innovaciones de atención; esos datos figuran como no disponibles.

El fine-tuning se realizó durante 50 épocas, con learning rate `5e-05`, batch size 32 y longitud máxima de 256 tokens. La métrica objetivo es `span_f1` y el resultado medio es 0,7075. El autor advierte de que se trata de una sola ejecución y de que los baselines de MasakhaNER 2.0 promedian cinco, por lo que las diferencias pequeñas deben interpretarse como ruido. No se mencionan fases de RLHF, DPO u otras técnicas de alineamiento, algo coherente con un encoder de clasificación.

## Capacidades

- Reconocimiento de entidades nombradas en textos en bambara mediante etiquetado a nivel de token.
- Salida directamente decodificable a nombres de etiqueta: la model card indica que `id2label` está configurado.
- No genera texto libre ni mantiene diálogos; es un encoder de clasificación, no un modelo de lenguaje causal.
- No soporta tool calling ni function calling.
- No está diseñado para agentes, planificación o razonamiento multi-paso.
- Cobertura multilingüe limitada a `bam`; no se documentan otras lenguas.
- Sin capacidades de visión, audio u otras modalidades.
- Procesa secuencias de hasta 256 tokens según la configuración de entrenamiento; para documentos más largos hay que dividir en ventanas.
- Puede ejecutarse en CPU y en GPU de gama baja por su tamaño reducido.

## Casos de uso

- Extracción de entidades en corpus periodísticos en bambara: dividir cada artículo en ventanas de 256 tokens con solapamiento, ejecutar el modelo y consolidar las entidades para construir índices de personas, organizaciones y lugares. Es adecuado porque el checkpoint está especializado en el esquema de MasakhaNER 2.0 y su tamaño permite procesar lotes grandes en CPU o en una GPU modesta.
- Anonimización de documentos antes de su publicación: detectar nombres de personas y organizaciones para sustituirlos o revisarlos manualmente. Requiere un umbral de recall alto y revisión humana, ya que un span F1 de 0,7075 implica falsos negativos que deben controlarse.
- Enriquecimiento de bases de datos documentales y bibliotecas digitales: generar metadatos de entidades para catálogos, archivos y colecciones en bambara. El modelo sirve como primer paso antes de un entity linking contra Wikidata u otra base de conocimiento.
- Búsqueda y recuperación de información: indexar las entidades detectadas como campos estructurados para permitir filtros por persona, lugar u organización. Combinado con BM25 o embeddings, mejora la precisión en consultas que mencionan entidades concretas.
- Monitorización de menciones en redes sociales y foros: procesar flujos de texto en bambara por lotes pequeños y extraer entidades para alertas o análisis de tendencias. La latencia esperable de un modelo de 135,9 M permite integrarlo en un pipeline de streaming, aunque la longitud de 256 tokens obliga a segmentar publicaciones largas.
- Pre-anotación para proyectos de anotación lingüística: generar etiquetas automáticas que las personas anotadoras corrigen, reduciendo el coste de crear corpus NER en bambara. Es un caso típico de active learning con un modelo pequeño y especializado.
- Preprocesamiento para traducción o asistentes: identificar nombres propios y entidades antes de traducir o generar respuestas, para preservarlos o tratarlos de forma consistente. El modelo no traduce ni genera, pero aporta una capa de análisis lingüístico útil en esos pipelines.
- Investigación en lingüística de corpus: extraer estadísticas agregadas de tipos de entidades y patrones de mención en grandes colecciones de textos en bambara. La naturaleza determinista del etiquetado facilita la reproducibilidad.

## Benchmarks y rendimiento

El único resultado publicado en la información disponible es el span F1 medio del protocolo `bam` de MasakhaNER 2.0:

| Conjunto | Tarea | Métrica | Resultado | Número de ejecuciones |
|---|---|---|---|---|
| MasakhaNER 2.0 (`bam`) | Reconocimiento de entidades nombradas | `span_f1` | 0,7075 | 1 |

Hiperparámetros del ajuste:

| Hiperparámetro | Valor |
|---|---|
| Épocas | 50 |
| Learning rate | `5e-05` |
| Batch size | 32 |
| Longitud máxima | 256 |
| Métrica | `span_f1` |
| Resultado medio | 0,7075 |

No se incluyen resultados de MMLU, HumanEval o GSM8K porque el modelo no es generativo y esas evaluaciones no aplican. Tampoco se aportan puntuaciones de modelos comparables en `bam`; el autor solo indica que su arnés reproduce los baselines publicados con una tolerancia de ±0,25 F1.

## Requisitos de hardware

- VRAM estimada para los pesos: ≈0,54 GB en fp32, ≈0,27 GB en fp16/bf16 y ≈0,14 GB en int8. Son cálculos a partir de 135.883.017 parámetros; no son cifras publicadas por el autor.
- Memoria de activaciones: con batch 32 y `max_length` 256, una estimación conservadora sitúa el consumo total por debajo de 2 GB en fp16, dependiendo de la implementación y del tamaño del vocabulario. Cabe en GPUs consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU CUDA con al menos 4 GB (GTX 1650, RTX 3050, T4) para inferencia; RTX 3060/4060, L4 o A10 para mayor throughput. A100/H100 no son necesarias.
- CPU: viable para inferencia por lotes; el modelo es pequeño, aunque el throughput será menor que en GPU. No hay cifras de latencia publicadas.
- Despliegue: la vía documentada es Hugging Face Transformers con `AutoTokenizer` y `AutoModelForTokenClassification`. ONNX Runtime es una alternativa razonable; no se confirman integraciones con vLLM, TGI, llama.cpp u Ollama para este checkpoint.
- Cuantización: no hay artefactos oficiales en GGUF, ONNX o int8; cualquier conversión corre por cuenta del usuario.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en `bam` | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SabiBERTa-135M-masakhaner2-bam` | 135,9 M | No disponible; entrenamiento a 256 tokens | `span_f1` 0,7075 (1 ejecución) | No disponible | Hugging Face |
| `SabiBERTa-135M` (base) | 135 M (modelo del que deriva) | No disponible | No aplica: no está fine-tuned para NER en `bam` | No disponible | Hugging Face |
| Baselines de MasakhaNER 2.0 (mBERT, XLM-R y otros) | No disponible en la información | No disponible | No disponible en la información | No disponible | No disponible |

La comparación cuantitativa con alternativas no es posible con los datos proporcionados: no se incluyen puntuaciones de mBERT, XLM-R ni de otros modelos en el protocolo `bam`. La principal ventaja diferencial de este checkpoint es su tamaño reducido y su especialización en bambara; la desventaja es la ausencia de métricas comparables y de una licencia declarada.

## Limitaciones y advertencias

- Licencia no declarada: el uso comercial es incierto hasta verificar la licencia del modelo base `BeardedMonster/SabiBERTa-135M`.
- Solo cubre bambara (`bam`); no se documenta soporte para otras lenguas ni para code-switching.
- No es generativo: no puede responder preguntas, resumir ni mantener conversaciones.
- Longitud máxima de entrenamiento de 256 tokens; los documentos largos requieren segmentación y pueden perder entidades en los límites de las ventanas.
- `span_f1` de 0,7075 en una sola ejecución: el error aproximado es del 29,25 %, y las diferencias pequeñas frente a baselines deben tratarse con cautela.
- Esquema de entidades fijo al de MasakhaNER 2.0; añadir tipos nuevos exige reentrenamiento.
- Posibles sesgos del corpus MasakhaNER 2.0 y del dominio de noticias; no se documentan análisis de sesgo ni de robustez.
- Rendimiento desconocido en texto informal, dialectos, errores ortográficos o dominios distintos al de entrenamiento.
- Adopción muy baja (0 descargas y 0 me gusta en el momento de la consulta): poca validación externa.
- No se detallan el tokenizador, el vocabulario ni el preprocesamiento más allá del código de carga.
- No debe usarse en decisiones sensibles sin revisión humana y validación en el dominio objetivo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-bam)
- [Modelo base SabiBERTa-135M](https://huggingface.co/BeardedMonster/SabiBERTa-135M)
- [metrics.json](https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-bam/blob/main/metrics.json)
- No se han encontrado enlaces a papers, blogs o demos en la información proporcionada.

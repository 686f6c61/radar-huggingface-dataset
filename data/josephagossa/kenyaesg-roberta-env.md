# josephagossa/KenyaESG-RoBERTa-env

## Resumen

KenyaESG-RoBERTa-env es un clasificador binario de frases especializado en detectar contenido ambiental (la pata "environmental" del marco ESG) en informes corporativos de empresas cotizadas en la Nairobi Securities Exchange (NSE). Lo desarrolla Joseph Agossa como parte de un conjunto de tres clasificadores independientes por pilar (env, soc, gov), todos ellos ajustados a partir de `roberta-base` sobre el dataset KenyaESG. El modelo resuelve un problema concreto de medición: cuantificar la intensidad de divulgación ambiental a nivel de empresa-año contando la proporción de frases positivas agregadas sobre un informe completo.

Técnicamente es un transformer encoder de tipo RoBERTa con 124,6 millones de parámetros y una ventana de entrada de 256 tokens, entrenado para clasificación de secuencias con dos etiquetas. La versión v3 (noviembre de 2026) introduce etiquetas de entrenamiento revisadas bajo una guía de anotación explícita basada en significado y una evaluación ampliada a 300 frases con etiqueta adjudicada, corrigiendo la sobreestimación del benchmark original de 100 frases.

Su relevancia actual radica en que cubre un nicho poco atendido: los modelos ESG existentes se han entrenado mayoritariamente sobre corpus de mercados desarrollados, mientras que este se ajusta específicamente sobre informes de empresas kenianas, con un esquema de etiquetado adaptado de Schimanski et al. (2024). Es un modelo de investigación, con 4 descargas y licencia Apache-2.0, pensado para pipelines de análisis de divulgación corporativa más que para uso conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base), clasificación de secuencias |
| Parametros totales | 124.647.170 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors fp32/fp16; admite cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | en (inglés; algunas frases en suajili y con OCR degradado en el entrenamiento) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,0 GB) |

## Arquitectura y entrenamiento

El modelo es un `AutoModelForSequenceClassification` sobre `roberta-base`, es decir, un encoder transformer de 12 capas con atención bidireccional completa y cabecera de clasificación de dos clases. No emplea arquitecturas MoE, SSM ni híbridas, ni decodificación especulativa: es un clasificador discriminativo puro que emite logits por frase y aplica softmax para obtener la probabilidad de la clase 1 (contenido ambiental), con umbral de decisión en 0,5.

El entrenamiento se realizó sobre 3.900 frases: 945 positivas y 993 negativas procedentes de informes kenianos de la NSE, más 638 positivas y 1.324 negativas del corpus de Schimanski et al. (2024). El split fue 85/15 estratificado por etiqueta y fuente (3.315 de entrenamiento, 585 de validación). Las etiquetas kenianas se generaron con un filtro de palabras clave, revisión del autor y relectura contra la guía KenyaESG v2 (revisión asistida por IA validada por el autor); las de Schimanski et al. se usaron tal cual. Los hiperparámetros fueron learning rate 2e-5, batch size 16, weight decay 0,01, hasta 4 épocas con early stopping (paciencia 2, mejor F1 de validación), max length 256, fp16 y semilla 42. El entrenamiento se ejecutó con Python 3.12.7, PyTorch 2.5.1 (CUDA 12.1), Transformers 4.48.1, Datasets 3.3.2 y scikit-learn 1.5.1 sobre una NVIDIA Quadro RTX 4000. No se documenta uso de RLHF ni DPO, algo esperable en un clasificador supervisado.

La innovación principal de la v3 es metodológica más que arquitectónica: la revisión de etiquetas de entrenamiento contra una guía basada en significado (45 etiquetas cambiadas para este pilar) y la evaluación sobre un conjunto ampliado con etiqueta adjudicada, que evita el sesgo optimista de benchmarks extraídos del mismo pool que el entrenamiento.

## Capacidades

- Clasificación binaria de frases: devuelve 1 si la frase aborda materias ambientales y 0 en caso contrario, con umbral 0,5 sobre la probabilidad de la clase 1.
- Cobertura temática ambiental: clima y emisiones, energía, agua, residuos y contaminación, biodiversidad y conservación, gestión y políticas ambientales, finanzas verdes.
- Detección de menciones genéricas pero reales, como "society and the environment", que cuentan como positivas.
- Agregación a nivel de informe: la proporción de frases positivas sobre un documento produce una puntuación de intensidad de divulgación ambiental empresa-año.
- Procesamiento por lotes: la tokenización con `padding=True` y `return_tensors="pt"` permite clasificar listas de frases en una sola pasada.
- Enmascaramiento de entidades: el modelo espera nombres de empresa y persona enmascarados como `[COMPANY]` y `[PERSON]` para un rendimiento óptimo.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking: es un clasificador de frase, no un modelo generativo.
- Capacidad multilingüe limitada al inglés; el suajili solo aparece de forma residual en el entrenamiento y no se ha evaluado su transferencia.

## Casos de uso

- Medición de intensidad de divulgación ambiental: dado un informe anual de una empresa de la NSE, se segmenta en frases, se clasifica cada una con el modelo y se calcula la proporción de positivas para obtener una puntuación comparable entre empresas y años. Es el uso previsto por el autor y el que motiva el paper asociado sobre reacciones de equity a la divulgación ESG obligatoria en Kenia.
- Investigación académica en finanzas sostenibles: construcción de paneles de divulgación ESG para estudios de eventos, regresiones sobre rentabilidad o análisis de cumplimiento normativo, usando los tres clasificadores de pilar en paralelo para descomponer el discurso ESG.
- Screening de cumplimiento regulatorio: revisión masiva de informes corporativos para verificar que las empresas cubren las materias ambientales exigidas por el regulador del mercado keniano, priorizando documentos con baja proporción de frases ambientales para revisión manual.
- Análisis competitivo sectorial: comparación de la intensidad de divulgación ambiental entre empresas del mismo sector cotizadas en la NSE, agregando las puntuaciones por empresa-año y detectando outliers.
- Preprocesado para modelos generativos: filtrar y etiquetar frases ambientales antes de alimentar un LLM que genere resúmenes o informes de sostenibilidad, reduciendo el coste y el ruido del corpus de entrada.
- Indexación y búsqueda temática: clasificar grandes volúmenes de texto corporativo para construir índices de pasajes ambientales que alimenten motores de búsqueda internos o sistemas de recuperación (RAG) especializados en sostenibilidad.
- Monitorización de carteras: seguimiento anual de la evolución de la divulgación ambiental de las posiciones de un fondo con exposición a mercados frontera africanos, usando la puntuación agregada como señal de engagement.

## Benchmarks y rendimiento

Evaluación sobre 300 frases retenidas de informes de la NSE, etiquetadas por dos anotadores (A y B), con intervalos bootstrap del percentil 95 (10.000 remuestreos):

| Referencia | n | Precision | Recall | F1 [IC 95%] | TN / FP / FN / TP |
|---|---|---|---|---|---|
| Etiqueta adjudicada | 300 | 0,862 | 1,000 | 0,926 [0,892, 0,955] | 141 / 22 / 0 / 137 |
| A = B (acuerdo entre anotadores) | 292 | 0,921 | 0,927 | 0,924 [0,891, 0,952] | 129 / 12 / 11 / 140 |

Validación interna sobre 585 frases (acuerdo con las etiquetas de entrenamiento): F1 0,959 global, 0,979 en frases kenianas y 0,930 en frases de Schimanski et al. (2024).

El autor advierte que el benchmark original de la primera release (F1 0,917 sobre 100 frases extraídas del mismo pool que el entrenamiento) sobreestimaba el rendimiento; un modelo entrenado con el mismo procedimiento sobre las etiquetas de la primera release obtiene F1 0,938 sobre el conjunto de 300 frases frente a la etiqueta adjudicada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, algo esperable en un clasificador de frase especializado.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5 GB en fp32 (124,6 M de parámetros) y aproximadamente 0,25 GB en fp16; con overhead de activaciones y tokenizador, menos de 1 GB en la práctica.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor entrenó sobre una NVIDIA Quadro RTX 4000. Para lotes grandes, A100, H100, L4 o RTX 4090 aportan margen de sobra.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: transformers con `AutoModelForSequenceClassification`, Text Embeddings Inference (el repo está marcado como compatible con endpoints), y exportación a ONNX para servir con ONNX Runtime. No se documenta soporte nativo de vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo y la longitud máxima de 256 tokens, se espera un throughput alto en GPU y aceptable en CPU por lotes, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KenyaESG-RoBERTa-env | 124,6 M | 256 tokens | Clasificación binaria ambiental en informes NSE | Apache-2.0 | Hugging Face |
| KenyaESG-RoBERTa-soc | no disponible | 256 tokens (presumible) | Clasificación binaria social en informes NSE | no disponible | Hugging Face |
| KenyaESG-RoBERTa-gov | no disponible | 256 tokens (presumible) | Clasificación binaria de gobernanza en informes NSE | no disponible | Hugging Face |
| Modelos de Schimanski et al. (2024) | no disponible | no disponible | Clasificación ESG multilingüe sobre corpus global | no disponible | no disponible |

La comparación más directa es con los otros dos clasificadores de pilar del mismo autor, que comparten arquitectura base, dataset y procedimiento de entrenamiento, y con los clasificadores ESG de Schimanski et al. (2024), cuyo esquema de etiquetado se adaptó. No se dispone de datos de benchmarks cruzados entre estos modelos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Mide frecuencia de mención del pilar ambiental, no la calidad ni la credibilidad de la divulgación; una empresa puede mencionar mucho el medio ambiente sin compromisos sustantivos.
- Recall muy alto y precisión más baja (0,862 frente a la etiqueta adjudicada): el modelo tiende a marcar frases que mencionan el medio ambiente de forma genérica, generando falsos positivos.
- Entrenado sobre informes de la NSE predominantemente en inglés, con algunas frases en suajili y con OCR degradado; la transferencia a otros mercados o idiomas no se ha evaluado.
- Los nombres de empresa y persona en el entrenamiento están enmascarados como `[COMPANY]` y `[PERSON]`; no aplicar el mismo enmascaramiento en inferencia degrada el rendimiento.
- Las etiquetas de entrenamiento y las de evaluación adjudicada se revisaron con la misma guía, por lo que la puntuación adjudicada puede ser ligeramente favorable; la métrica A = B no depende de la adjudicación y sirve como comprobación independiente.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de error de clasificación en frases ambiguas o con negaciones.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución, sin restricciones adicionales documentadas.
- Modelo de nicho con 4 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación independiente por terceros.
- La fecha de creación del repo (2026-06-01) y la actualización (2026-11-10) sitúan la v3 en noviembre de 2026; conviene verificar la versión antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/josephagossa/KenyaESG-RoBERTa-env
- Clasificador social: https://huggingface.co/josephagossa/KenyaESG-RoBERTa-soc
- Clasificador de gobernanza: https://huggingface.co/josephagossa/KenyaESG-RoBERTa-gov
- Dataset KenyaESG en Hugging Face: https://huggingface.co/datasets/josephagossa/KenyaESG
- Dataset KenyaESG en Zenodo: https://doi.org/10.5281/zenodo.20608236
- DOI del dataset en Hugging Face: https://doi.org/10.57967/hf/9193
- DOI del modelo (primera release): https://doi.org/10.57967/hf/9126
- Paper asociado: Agossa, J. (2026). *Pricing the Cost of Compliance: Equity Reactions to Mandatory ESG Disclosure in Kenya.* Working paper. SSRN (enlace directo no disponible).
- Referencia del esquema de etiquetado: Schimanski, T., Reding, A., Reding, N., Bingler, J., Kraus, M., & Leippold, M. (2024). Bridging the gap in ESG measurement: Using NLP to quantify environmental, social, and governance communication. *Finance Research Letters*, 61, 104979.

# Saathimed/AxonMed-32B-Flash

## Resumen

AxonMed-32B-Flash es un modelo de lenguaje de 32.763.876.352 parámetros (aproximadamente 32,76 mil millones) especializado en razonamiento clínico y procesamiento de documentación médica. Lo desarrolla SaathiMed Private Limited, una empresa india con sede en Motihari (Bihar), fundada por Amrendra Kumar, y se distribuye bajo licencia Apache 2.0. El modelo es un ajuste fino (finetune) de Saathimed/AxonMed-32B-Thinking, que a su vez se apoya en la arquitectura Qwen2 según los tags del repositorio.

El modelo resuelve el problema de la extracción y clasificación estructurada de información clínica: triaje de ictus isquémico agudo, detección de eventos adversos a fármacos, codificación ICD-10 e ICD-O-3, reconciliación de medicación y resumen de consultas médico-paciente. Su propuesta diferencial es el "Dual-Delimiter Clinical Output Protocol", un formato de salida con etiquetas `<think>` y `Result:` pensado para que los parsers de sistemas hospitalarios no fallen al procesar la respuesta.

Es relevante porque declara resultados de 76,36 % en MedQA (USMLE de 4 opciones) y 78,80 % en PubMedQA en modo zero-shot, con un tamaño que, según el autor, iguala o supera a modelos clínicos densos de 70B manteniendo un throughput de inferencia mayor. El contexto máximo no está especificado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, según tags del repositorio) |
| Parametros totales | 32.763.876.352 (32,76B) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio incluye safetensors en bfloat16; los tags mencionan llama-cpp, lo que sugiere compatibilidad con GGUF, pero no se detallan variantes) |
| Idiomas soportados | en, zh, es, ru, no, fr, it, pt, de |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 65,5 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 32,76B parámetros construido sobre la familia Qwen2, según los tags del repositorio (`qwen2`). Es un ajuste fino del modelo Saathimed/AxonMed-32B-Thinking, que actúa como base. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible.

La innovación técnica declarada es el "Dual-Delimiter Clinical Output Protocol": el modelo genera primero un bloque `<think>` con el razonamiento clínico (diagnóstico diferencial, revisión de interacciones farmacológicas, evaluación patológica) y después un bloque `Result:` con la entidad o decisión clínica estandarizada. Este diseño busca compatibilidad con parsers automáticos de sistemas de información hospitalaria y con pipelines de evaluación clínica. La model card también menciona evaluación con el harness de EleutherAI `lm-eval` v0.4.13 en modo zero-shot y precisión bfloat16.

## Capacidades

- Generación de texto y razonamiento clínico con modo de pensamiento explícito (bloque `<think>`).
- Clasificación clínica: triaje de ictus isquémico agudo (AIS), detección de eventos adversos a fármacos (ADE), predicción de mortalidad en UCI y estimación de duración de estancia hospitalaria.
- Extracción de entidades y relaciones clínicas (NER): clasificación por bloque y subbloque ICD-10, codificación de morfología oncológica ICD-O-3, extracción de dosis y aserciones clínicas.
- Diálogo médico: resumen de consultas médico-paciente, identificación del motivo de consulta principal y reconciliación de medicación.
- Comprensión de historiales clínicos electrónicos (EHR) y documentación biomédica (PubMed).
- Soporte multilingüe clínico en nueve idiomas: inglés, chino, español, ruso, noruego, francés, italiano, portugués y alemán.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita, aunque el bloque `<think>` sugiere razonamiento estructurado en un solo paso.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- **Triaje automatizado de ictus isquémico agudo**: el modelo clasifica casos de AIS a partir de notas clínicas y devuelve una decisión estandarizada en el bloque `Result:`, lo que permite integrarlo en sistemas de triaje de urgencias con parsers deterministas.
- **Detección de eventos adversos a fármacos en farmacovigilancia**: procesa notas de evolución y historiales para identificar reacciones adversas (por ejemplo, rash maculopapular y edema facial tras amoxicilina), con salida estructurada apta para sistemas de notificación.
- **Codificación ICD-10 e ICD-O-3 para facturación y registros de cáncer**: extrae entidades clínicas y las mapea a bloques y subbloques ICD-10 o a morfología oncológica ICD-O-3, reduciendo la codificación manual en departamentos de documentación clínica.
- **Resumen de consultas médico-paciente**: genera resúmenes de diálogos con motivo de consulta, hallazgos y plan, útil para historia clínica electrónica y para reducir carga administrativa del facultativo.
- **Reconciliación de medicación en ingresos hospitalarios**: compara la medicación domiciliaria con la prescrita al ingreso y detecta discrepancias o interacciones, aprovechando el razonamiento farmacológico del bloque `<think>`.
- **Predicción de mortalidad en UCI y duración de estancia**: clasifica pacientes ingresados en cuidados intensivos a partir de notas y datos estructurados para apoyar la planificación de recursos.
- **Soporte a la decisión clínica multilingüe**: al cubrir nueve idiomas, puede desplegarse en sistemas sanitarios de España y Latinoamérica (español), Francia, Italia, Portugal, Alemania, Rusia, China y Noruega sin un modelo separado por idioma.
- **Preparación para exámenes médicos y formación**: con 76,36 % en MedQA, puede usarse como tutor de preguntas tipo USMLE y para generar material de estudio razonado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (harness `lm-eval` v0.4.13, zero-shot, bfloat16). La columna "verified" del model-index está marcada como `false` en todos los casos.

| Benchmark | Métrica | AxonMed-32B-Flash | Referencia indicada por el autor |
|---|---|---|---|
| MedQA (USMLE 4 opciones) | Accuracy zero-shot | 76,36 % | 60,00 % (umbral de aprobado USMLE) |
| MedQA (USMLE 4 opciones) | Accuracy normalizada zero-shot | 76,36 % | 60,00 % (umbral de aprobado USMLE) |
| PubMedQA | Accuracy zero-shot | 78,80 % | 75,20 % (BioLLM Benchmark) |

El autor afirma que el modelo "iguala o supera a modelos clínicos densos de 70B" y que supera el umbral de aprobado USMLE en +16,36 puntos. No se aportan resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con modelos concretos.

## Requisitos de hardware

- **VRAM estimada en bfloat16**: los pesos ocupan aproximadamente 65,5 GB (32,76B × 2 bytes), por lo que la inferencia completa requiere del orden de 70-80 GB de VRAM incluyendo caché KV y overhead.
- **GPU recomendadas para bfloat16**: 2× A100 40GB, 1× A100 80GB, 1× H100 80GB o 2× RTX 4090 24GB con tensor parallelism.
- **Consumer GPU**: no cabe en una sola GPU de consumo en bfloat16. Con cuantización de 4 bits (no confirmada oficialmente) podría situarse en torno a 18-20 GB y caber en una RTX 4090 24GB; con 8 bits, en torno a 35 GB, lo que exigiría 2× RTX 4090 o una RTX 6000 Ada.
- **Opciones de despliegue**: transformers (código de ejemplo en la model card), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y llama.cpp/Ollama según el tag `llama-cpp` (sin instrucciones publicadas).
- **Latencia y throughput**: no disponibles. El autor afirma mayor velocidad que modelos de 70B, pero no publica cifras.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la información proporcionada. La model card solo menciona de forma genérica "modelos clínicos densos de 70B" sin nombrarlos ni aportar cifras. Comparativa numérica: no disponible.

| Aspecto | AxonMed-32B-Flash | Alternativas 70B clínicas |
|---|---|---|
| Parámetros | 32,76B | ~70B (no especificadas) |
| Contexto | no disponible | no disponible |
| MedQA | 76,36 % (declarado) | no disponible |
| PubMedQA | 78,80 % (declarado) | no disponible |
| Licencia | Apache 2.0 | no disponible |
| Disponibilidad | Hugging Face | no disponible |

## Limitaciones y advertencias

- **Resultados no verificados**: las métricas del model-index están marcadas como `verified: false`; proceden del propio autor y no de una evaluación independiente.
- **Uso clínico**: no es un dispositivo médico. No debe emplearse para diagnóstico o decisión terapéutica sin supervisión de un profesional sanitario cualificado; la model card no documenta validación regulatoria (CE, FDA) ni certificación clínica.
- **Riesgo de alucinación**: como todo LLM, puede generar entidades clínicas, códigos ICD o dosis plausibles pero incorrectas; el bloque `Result:` estructurado no garantiza corrección factual.
- **Sesgos**: no se documenta análisis de sesgos demográficos, étnicos o de género; el entrenamiento con datos predominantemente en inglés puede degradar el rendimiento en otros idiomas pese a declarar soporte para nueve.
- **Contexto e idiomas**: la longitud de contexto no está especificada, lo que impide planificar su uso con historiales largos; el rendimiento real en ruso, noruego o chino no está cuantificado.
- **Licencia**: Apache 2.0 permite uso comercial, pero al derivar de la familia Qwen2 conviene revisar las condiciones de la licencia original de Qwen2 antes de un despliegue en producción.
- **Madurez del proyecto**: repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en comunidad y la validación por terceros.
- **Formato de salida rígido**: el protocolo de doble delimitador exige que los sistemas consumidores parseen `<think>` y `Result:`; un cambio de formato en el prompt puede romper el parser aguas abajo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Saathimed/AxonMed-32B-Flash
- Modelo base: https://huggingface.co/Saathimed/AxonMed-32B-Thinking
- DOI Zenodo: https://doi.org/10.5281/zenodo.24143274
- ORCID del autor: https://orcid.org/0009-0006-7093-6762
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Dataset MedQA (USMLE 4 opciones): https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset PubMedQA: https://huggingface.co/datasets/qiaojin/PubMedQA

# cadrojasl/xlm-roberta-large-ner-prostata-2026

## Resumen

El modelo `cadrojasl/xlm-roberta-large-ner-prostata-2026` es un ajuste fino de XLM-RoBERTa-large para reconocimiento de entidades nombradas (NER) en historias clínicas de cáncer de próstata en español. Lo publica el usuario cadrojasl en Hugging Face como trabajo final de un taller de PLN de una maestría en Ingeniería de Sistemas y Computación, y resuelve la extracción estructurada de información clínica (biomarcadores, valores Gleason, clasificación TNM, dosis, tratamientos) a partir de texto libre.

Arquitectónicamente es un transformer encoder de tipo RoBERTa multilingüe (XLM-RoBERTa-large) con 558.862.357 parámetros, reutilizado como clasificador de tokens con esquema BIO sobre diez categorías de entidad clínica. El modelo base aporta representaciones multilingües, pero el ajuste fino se ha realizado exclusivamente sobre datos en español del dominio oncológico prostático.

Su relevancia actual reside en la escasez de modelos NER clínicos abiertos y específicos para español oncológico: la mayoría de recursos equivalentes están en inglés o son genéricos. La licencia MIT y el tamaño contenido (2,3 GB en safetensors) lo hacen desplegable en infraestructura modesta, aunque su adopción real depende de validar la calidad fuera del conjunto de test del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large), clasificación de tokens con esquema BIO |
| Parametros totales | 558.862.357 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa-large admite hasta 512 tokens de entrada; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (español); el modelo base XLM-RoBERTa-large es multilingüe, pero el ajuste fino solo declara español |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 2,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-large`, un transformer encoder de 24 capas y 1.024 dimensiones ocultas con 558 M de parámetros, preentrenado de forma multilingüe con objetivos enmascarados sobre corpus web masivos. Sobre esa base se ha añadido una cabeza de clasificación de tokens para resolver NER con diez etiquetas de entidad (BIOMARCADOR, CANCER, CIRUGIA, DOSIS, EDAD, FECHA, GLEASON, MEDICAMENTO, TNM, TRATAMIENTO) en formato BIO.

El ajuste fino se realizó con batch size 16, learning rate 2e-05, precisión bf16 y un máximo de 10 épocas con early stopping (mínimo 6 épocas). La model card no especifica el volumen del corpus de entrenamiento, su procedencia, el proceso de anotación ni si se aplicaron técnicas de aumento de datos o validación cruzada. Tampoco se documenta ningún proceso de RLHF/DPO, algo esperable en un modelo discriminativo de este tipo.

## Capacidades

- Reconocimiento de entidades nombradas clínicas en español sobre texto libre de historias clínicas oncológicas.
- Extracción de diez tipos de entidad: biomarcadores (por ejemplo PSA), diagnóstico de cáncer, procedimientos quirúrgicos, dosis, edad del paciente, fechas, puntuación Gleason, medicamentos, clasificación TNM y tratamientos.
- Etiquetado a nivel de token con esquema BIO, agregable a entidades completas mediante `aggregation_strategy` en el pipeline de Transformers.
- Procesamiento de frases y párrafos clínicos individuales (no está diseñado como modelo generativo ni de razonamiento).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente extractivo.
- Capacidad multilingüe no validada: aunque el backbone es multilingüe, el ajuste fino solo declara español y no hay evidencia de rendimiento en otras lenguas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Estructuración de historias clínicas oncológicas: el modelo permite convertir notas libres de prostatectomías y seguimientos en campos tabulares (Gleason, PSA, TNM) para alimentar un registro de tumores o un data warehouse clínico.
- Codificación automática de informes de anatomía patológica: extracción de la puntuación Gleason y del estadio TNM de los informes para su integración en sistemas de estadificación y auditoría de calidad.
- Sistemas de alerta clínica: detección de biomarcadores (PSA) y valores de dosis en notas de seguimiento para disparar avisos cuando se superan umbrales definidos por protocolo.
- Preanotación para anotadores humanos: uso del modelo como primer paso de etiquetado en proyectos de construcción de corpus clínicos, reduciendo el coste de anotación manual antes de la revisión experta.
- Investigación retrospectiva: extracción masiva de cohortes (por ejemplo, pacientes con Gleason ≥ 8 y tratamiento quirúrgico) a partir de repositorios de notas clínicas, facilitando estudios observacionales.
- Enriquecimiento de sistemas de historia clínica electrónica: integración como microservicio de NLP que etiqueta entidades en tiempo de escritura para sugerir campos estructurados al clínico.
- Filtrado y enrutamiento documental: identificación de documentos relevantes de cáncer de próstata dentro de un archivo hospitalario mediante la densidad de entidades detectadas.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de test, con seqeval a nivel de entidad:

| Metrica | Valor |
|---|---|
| Precision | 0,9698 |
| Recall | 0,9757 |
| F1 | 0,9727 |
| Accuracy | 0,9951 |

No se han publicado comparaciones con otros modelos NER clínicos en la información disponible, ni se detalla el tamaño ni la composición del conjunto de test. Los valores deben interpretarse con cautela al no existir validación externa independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1,1-1,3 GB para los pesos, más overhead de activaciones; con batch pequeño cabe holgadamente en 4 GB.
- VRAM estimada en fp32: aproximadamente 2,2-2,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16 (RTX 3050, RTX 4060, T4). Para entrenamiento o ajuste fino adicional se recomienda A100, H100 o RTX 4090 por el mayor throughput en bf16.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas actuales con 4 GB o más.
- Opciones de despliegue: `transformers` con pipeline `token-classification`, TorchServe, Triton Inference Server, ONNX Runtime, o servicios tipo Hugging Face Inference Endpoints. No se documenta compatibilidad con vLLM (orientado a modelos generativos) ni con llama.cpp/Ollama (requieren formato GGUF, no disponible).
- Latencia y throughput: no disponibles en la información proporcionada; para un encoder de 558 M parámetros se espera del orden de milisegundos por frase corta en GPU moderna, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cadrojasl/xlm-roberta-large-ner-prostata-2026 | 558 M | no disponible (backbone hasta 512) | NER clínico español (próstata) | MIT | Hugging Face, 36 descargas |
| PlanTL-GOB-ES/bsc-biomed-roberta-base-ner (referencia genérica) | no disponible | no disponible | NER biomédico español | no disponible | Hugging Face |
| FacebookAI/xlm-roberta-large (base) | 558 M | 512 | Modelo base multilingüe | MIT | Hugging Face |
| StanfordAIMI/stanford-deidentifier-base (referencia en inglés) | no disponible | no disponible | NER clínico en inglés | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos desconocidos: la model card no documenta la composición demográfica ni la procedencia del corpus de entrenamiento, por lo que no puede evaluarse el sesgo por género, edad, origen o práctica clínica.
- Riesgo de alucinación estructural: al ser un modelo extractivo, no genera texto libre, pero puede etiquetar incorrectamente entidades o fragmentar valores (por ejemplo, dividir un Gleason compuesto) en textos con formatos distintos a los del entrenamiento.
- Dominio muy restringido: solo cubre cáncer de próstata; su uso en otras patologías oncológicas o en texto clínico general no está validado.
- Contexto limitado: el backbone XLM-RoBERTa-large admite entradas de hasta 512 tokens; documentos largos requieren fragmentación con posible pérdida de entidades en los límites.
- Validación limitada: los resultados de F1 0,9727 proceden del test del propio autor, sin conjunto de evaluación externo ni comparación con líneas base publicadas.
- Uso clínico: no debe emplearse para decisiones diagnósticas o terapéuticas sin supervisión médica; es una herramienta de extracción de información, no un sistema de apoyo a la decisión validado.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base (MIT) y las obligaciones de atribución.
- Idiomas: aunque el backbone es multilingüe, el ajuste fino solo declara español; el rendimiento en catalán, gallego, euskera u otras lenguas no está documentado.
- Madurez: 36 descargas y 0 likes en el momento de la consulta; es un artefacto académico sin mantenimiento ni comunidad detrás.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cadrojasl/xlm-roberta-large-ner-prostata-2026
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Documentación de pipelines de Transformers (token-classification): https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TokenClassificationPipeline
- Librería seqeval: https://github.com/chakki-works/seqeval

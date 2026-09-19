# philgear/pocketgull-steeep-quality

## Resumen

PocketGull NAM STEEEP Quality Engine es un adaptador LoRA (librería PEFT) publicado por philgear sobre el modelo base `pocketgull/steeep-eval-v1`. Su finalidad declarada es evaluar soporte a la decisión clínica a lo largo de las seis dimensiones de calidad sanitaria de la National Academy of Medicine (NAM): seguridad, oportunidad, efectividad, eficiencia, equidad y centrado en el paciente (STEEEP). El adaptador fue ajustado con Direct Preference Optimization (DPO) sobre conjuntos de datos clínicos que, según el autor, cumplen con los estándares de desidentificación de HIPAA §164.514 Safe Harbor.

El modelo se comercializa como componente de la suite PocketGull LLC y genera dos artefactos principales: tarjetas de cuidado de una página en lenguaje llano de quinto grado y una narrativa de trayectoria en tres actos, además de exportar el cuadro de mando de calidad como un bundle FHIR R4 MeasureReport (LOINC 96841-2). Está etiquetado con las referencias NIH MedQuad y WHO mhGAP, lo que sugiere que parte de su entrenamiento se apoyó en esas fuentes.

La relevancia del modelo radica en su enfoque de nicho: no es un asistente clínico generalista, sino un motor de puntuación de calidad y generación de informes interoperables. Sin embargo, la información publicada es limitada: no se declaran parámetros, contexto ni resultados de evaluación, el repositorio no tiene descargas ni valoraciones, y el identificador de HuggingFace difiere del citado en la propia model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; el repositorio etiqueta la familia como `gemma-2`. Arquitectura exacta del modelo base: no disponible |
| Parametros totales | No disponible (depende del modelo base; el adaptador LoRA añade solo una fracción) |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; al ser un adaptador PEFT puede combinarse con el modelo base cuantizado, pero no se documentan recetas concretas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 (declarada para el adaptador; la licencia del modelo base puede imponer condiciones adicionales) |
| Formato de pesos | Adaptador PEFT/LoRA (`library_name: peft`); formato de fichero concreto no especificado en la información disponible |
| Modelo base | `pocketgull/steeep-eval-v1` |
| Pipeline | text-generation |
| Dataset/dominio declarado | Clinical NLP, HIPAA Safe Harbor, NIH MedQuad, WHO mhGAP |

## Arquitectura y entrenamiento

El artefacto publicado es exclusivamente un adaptador LoRA, no un modelo completo. La model card indica que el ajuste se realizó mediante Direct Preference Optimization (DPO) sobre datos clínicos desidentificados conforme a HIPAA §164.514 Safe Harbor. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset, la configuración del adaptador (rango, alpha, capas objetivo) ni los hiperparámetros de DPO.

El modelo base `pocketgull/steeep-eval-v1` tampoco publica en la información disponible su arquitectura detallada, tamaño o ventana de contexto. La única pista sobre la familia arquitectónica son las etiquetas del repositorio, que incluyen `gemma-2`. No se describen innovaciones técnicas propias (decodificación especulativa, atención lineal, modos de razonamiento explícito) más allá del flujo de puntuación en seis dimensiones y la exportación a FHIR R4 MeasureReport con código LOINC 96841-2.

## Capacidades

- Puntuación de planes de cuidado y respuestas de soporte a la decisión clínica contra las seis dimensiones NAM STEEEP (Safe, Timely, Effective, Efficient, Equitable, Patient-Centered).
- Generación de tarjetas de cuidado de una página en lenguaje llano de nivel de quinto grado.
- Generación de narrativas de trayectoria en tres actos (estructura de comunicación clínica).
- Exportación del cuadro de mando de calidad como bundle FHIR R4 MeasureReport (LOINC 96841-2).
- Razonamiento farmacológico básico orientado a interacciones; el ejemplo de la model card evalúa el metabolismo CYP450 de un paciente con palpitaciones que toma hierba de San Juan junto con warfarina.
- Generación de texto en inglés.
- No se documenta soporte de tool calling o function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Auditoría de calidad asistencial: el modelo puntúa un plan de cuidado contra las seis dimensiones STEEEP y devuelve una evaluación estructurada, útil para revisiones internas de calidad o comités de mejora continua.
- Generación de material para pacientes: a partir de una nota clínica desidentificada produce una tarjeta de una página en lenguaje llano, adecuada para entrega impresa o portal del paciente.
- Interoperabilidad clínica: exporta las métricas de calidad como MeasureReport FHIR R4, lo que permite integrarlas en un servidor FHIR existente sin transformaciones manuales.
- Formación de residentes y personal sanitario: las narrativas en tres actos sirven como casos docentes que ilustran la evolución de un paciente y los puntos de decisión.
- Revisión farmacológica asistida: el ejemplo CYP450 del repositorio muestra su uso para señalar posibles interacciones entre fitoterapia y anticoagulantes antes de la revisión por un farmacéutico.
- Despliegue en borde para entornos con requisitos de privacidad: la model card declara "Zero-PHI Retention" y orienta el uso a computación local en el borde o a despliegue privado en Google Cloud Vertex AI, lo que encaja en organizaciones que no pueden enviar datos a APIs públicas.
- Investigación en calidad sanitaria: permite aplicar de forma reproducible un mismo criterio de puntuación STEEEP a cohortes de planes de cuidado, con la salvedad de la ausencia de validación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (MMLU, MedQA, HumanEval, GSM8K ni ninguna otra), ni comparaciones numéricas con modelos de referencia. Tampoco se aportan estudios de validación clínica ni tasas de acuerdo entre evaluadores para las puntuaciones STEEEP generadas.

## Requisitos de hardware

- VRAM para el adaptador: el adaptador LoRA ocupa típicamente decenas de megabytes; el consumo real de VRAM lo determina casi por completo el modelo base, cuyo tamaño no se especifica en la información disponible.
- VRAM estimada: no se puede calcular sin conocer el tamaño del modelo base. Como referencia genérica, un modelo de 7-9B en bfloat16 requiere del orden de 16-20 GB, y en cuantización de 4 bits en torno a 5-7 GB; un modelo de 27B en bfloat16 supera los 54 GB.
- GPU recomendadas: no disponible. Dependerán del modelo base; para tamaños pequeños (2-9B) bastan RTX 3090, RTX 4090, L4 o A10G; para tamaños mayores serían necesarias A100 40/80 GB o H100.
- GPU de consumidor: no confirmable con los datos disponibles. Si el modelo base está en el rango de 2-9B y se cuantiza a 4 bits, cabría en GPU de consumo con 8-24 GB de VRAM.
- Opciones de despliegue: Transformers + PEFT (patrón documentado en la model card), vLLM o TGI con soporte de adaptadores LoRA, y Ollama o llama.cpp tras fusionar el adaptador con el modelo base y convertirlo a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de las alternativas no se han verificado con la información proporcionada; se marcan como no disponibles y se incluyen únicamente como referencia de categoría.

| Modelo | Tipo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| pocketgull/pocketgull-steeep-quality | Adaptador LoRA clínico | No disponible | No disponible | Apache 2.0 (adaptador) | Puntuación de calidad NAM STEEEP y exportación FHIR R4 |
| Modelos clínicos abiertos de ~7B (categoría BioMistral, Meditron, OpenBioLLM) | Modelo completo | No disponible | No disponible | No disponible | Preguntas y respuestas clínicas generales |
| Asistentes clínicos propietarios | Modelo completo | No disponible | No disponible | Propietaria | Soporte a la decisión clínica general |
| Modelos base generalistas de la familia Gemma 2 | Modelo completo | No disponible | No disponible | No disponible (términos propios del proveedor) | Propósito general, sin especialización clínica |

## Limitaciones y advertencias

- No se han publicado benchmarks ni validación clínica independiente de las puntuaciones STEEEP generadas.
- Riesgo de alucinación inherente a cualquier modelo generativo aplicado a dominio clínico; las puntuaciones y narrativas deben ser revisadas por personal sanitario cualificado.
- La model card invoca la exención FDA 520(o) para CDS no dispositivo. Esa calificación es una declaración del autor, no una certificación regulatoria, y su aplicabilidad depende del uso concreto.
- Solo soporta inglés, lo que limita su uso en entornos clínicos hispanohablantes sin traducción previa.
- El repositorio presenta 0 descargas y 0 interacciones en el momento de la consulta, sin señales de adopción o revisión por la comunidad.
- Inconsistencia de identificadores: el ID de HuggingFace es `philgear/pocketgull-steeep-quality`, mientras que el código de ejemplo de la model card usa `pocketgull-llc/pocketgull-steeep-quality`. Conviene verificar cuál es el repositorio vigente antes de integrarlo.
- La licencia Apache 2.0 se declara para el adaptador, pero el uso del modelo base `pocketgull/steeep-eval-v1` (etiquetado como familia `gemma-2`) puede estar sujeto a los términos de uso del proveedor del modelo base. Revisar esa licencia antes de un despliegue comercial.
- Las afirmaciones de cumplimiento HIPAA Safe Harbor y de "Zero-PHI Retention" son responsabilidad del autor; la conformidad real depende de la configuración de despliegue y del flujo de datos de cada organización.
- No se documenta el tamaño del modelo base, lo que impide estimar con precisión costes de inferencia, requisitos de hardware y latencia.
- La fecha de creación del repositorio (2026-09-18) es posterior a la fecha actual de referencia habitual, dato a tener en cuenta al evaluar la trazabilidad del artefacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/philgear/pocketgull-steeep-quality
- Modelo base: https://huggingface.co/pocketgull/steeep-eval-v1
- DOI Zenodo (procedencia open science): https://doi.org/10.5281/zenodo.20647514
- Sitio de la organización: https://pocketgull.com
- Suite PocketGull: https://pocketgull.app
- ORCID del autor: https://orcid.org/0009-0008-1372-5381
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas corporativas de Microsoft y no guardan relación con este artefacto.

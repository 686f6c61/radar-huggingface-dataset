# MasoomaAli/crs-qwen2.5-1.5b-lora

## Resumen

El modelo `MasoomaAli/crs-qwen2.5-1.5b-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, desarrollado por MasoomaAli en el marco de un trabajo académico universitario sobre IA generativa. Su propósito es resolver una tarea muy concreta dentro del ámbito de los ensayos clínicos: el cribado de elegibilidad (eligibility screening). Dado un conjunto de notas clínicas numeradas, un tipo de criterio y un criterio concreto, el modelo devuelve una respuesta en formato JSON con una etiqueta de elegibilidad y los identificadores de las frases que sirven como evidencia.

El adaptador se ha entrenado exclusivamente con la partición de entrenamiento del dataset TrialGPT Criterion Annotations (602 filas correspondientes a 37 pacientes), y el autor indica explícitamente que no se utilizaron las salidas de GPT-4 presentes en dicho dataset. Se trata, por tanto, de un prototipo educativo de cribado, no de una herramienta clínica: la propia model card advierte que no debe emplearse para decisiones de enrolamiento ni para atención al paciente.

La relevancia de esta ficha es doble: por un lado, ilustra el patrón habitual de adaptación de un modelo pequeño (1.5B parámetros) mediante PEFT/LoRA para una tarea de dominio muy específico con recursos limitados; por otro, sirve de ejemplo de las precauciones que exige el uso de modelos en contextos sanitarios regulados. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos del adaptador pueden no estar efectivamente publicados o son de tamaño despreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | No disponible para el adaptador; modelo base: 1.5B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No disponibles (el dataset de entrenamiento es en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA con rango 32 y alpha 64, aplicada sobre el modelo base Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.5 mil millones de parámetros. El entrenamiento se realizó sobre la partición de entrenamiento del dataset TrialGPT Criterion Annotations, con 602 filas procedentes de 37 pacientes. El autor especifica varios hiperparámetros: oversampling power de 0.5, salida con la etiqueta en primer lugar (label first output) y mejor época en la 4. No se menciona el uso de RLHF ni DPO, ni se detalla la composición completa del dataset más allá de su procedencia.

La validación se realizó sobre 8 pacientes y 206 filas, con resultados de accuracy 0.7427, macro-F1 0.5584 y evidence micro-F1 0.5089. El autor indica que los resultados sobre el conjunto de test reservado (held-out) están en el repositorio de GitHub asociado. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; se trata de un ajuste fino estándar mediante PEFT.

## Capacidades

- Clasificación de elegibilidad de pacientes respecto a criterios de ensayos clínicos, devolviendo una etiqueta en formato JSON.
- Extracción de evidencia: identifica los identificadores de las frases de la nota clínica que sustentan la decisión.
- Procesamiento de notas clínicas numeradas por frases, lo que facilita la trazabilidad de la evidencia.
- Manejo de distintos tipos de criterio (el autor no detalla la taxonomía completa en la información disponible).
- Al estar basado en Qwen2.5-1.5B-Instruct, hereda potencialmente las capacidades del modelo base (generación de texto, instrucciones), aunque el adaptador está especializado en la tarea de cribado.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking específico para este adaptador.
- Capacidades multilingües: no disponibles; el entrenamiento se realizó sobre datos en inglés.

## Casos de uso

- Prototipado académico de cribado de elegibilidad: el adaptador permite experimentar con la tarea de matching entre notas clínicas y criterios de inclusión/exclusión usando un modelo pequeño y un adaptador ligero, adecuado para trabajos de fin de máster o asignaturas de IA generativa.
- Investigación sobre extracción de evidencia: dado que el modelo devuelve IDs de frases de soporte, resulta útil para estudiar técnicas de atribución y verificabilidad en tareas de clasificación clínica.
- Evaluación comparativa de adaptadores LoRA: sirve como referencia para comparar configuraciones de rango, alpha y oversampling en tareas de dominio sanitario con datasets pequeños.
- Docencia en PEFT: ejemplo práctico de cómo adaptar Qwen2.5-1.5B-Instruct con LoRA y evaluar con métricas de clasificación y de evidencia.
- Generación de datasets sintéticos de prueba: el formato JSON de salida puede emplearse para construir pipelines de evaluación de sistemas de cribado, siempre con fines de investigación.
- Análisis de sesgos y robustez en NLP clínico: al ser un modelo pequeño entrenado con pocos pacientes, es un caso de estudio útil para medir cómo afecta la escasez de datos a la macro-F1 y a la calidad de la evidencia extraída.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 0.7427 | Validacion (8 pacientes, 206 filas) |
| Macro-F1 | 0.5584 | Validacion (8 pacientes, 206 filas) |
| Evidence micro-F1 | 0.5089 | Validacion (8 pacientes, 206 filas) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los resultados de test reservado se indican como disponibles en el repositorio de GitHub del autor, pero no se incluyen en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-1.5B-Instruct en FP16 requiere aproximadamente 3 GB de VRAM; en cuantización de 8 bits, en torno a 1.5-2 GB; en 4 bits, alrededor de 1 GB. Estas cifras son estimaciones basadas en el tamaño del modelo base, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar el modelo base en FP16; una RTX 3060, RTX 4060 o superior es suficiente. Para despliegues con mayor throughput, A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU consumer: sí, en la mayoría de GPUs modernas con 4 GB o más de VRAM.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería `peft` junto al modelo base. Para servir en producción se puede combinar con vLLM, TGI o llama.cpp (previa fusión del adaptador y conversión a GGUF). Ollama requeriría la fusión y conversión del adaptador.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MasoomaAli/crs-qwen2.5-1.5b-lora | 1.5B (base) + LoRA | No disponible | Cribado de elegibilidad clínica | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | No disponible en esta ficha | Instrucciones generales | Apache 2.0 | Hugging Face (ampliamente usado) |
| TrialGPT (NCBI) | No disponible | No disponible | Matching paciente-criterio | No disponible | Publicación y código asociados al dataset |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. La comparativa se limita a aspectos de tamaño, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo educativo: el autor indica explícitamente que es un prototipo de cribado educativo y no una decisión de enrolamiento clínico; no debe usarse para atención al paciente.
- Dataset muy pequeño: 602 filas de 37 pacientes para entrenamiento y 206 filas de 8 pacientes para validación, lo que limita la generalización.
- Métricas moderadas: macro-F1 de 0.5584 y evidence micro-F1 de 0.5089 indican un rendimiento limitado, especialmente en la extracción de evidencia.
- Riesgo de alucinación: como todo modelo generativo, puede producir etiquetas o IDs de evidencia incorrectos; la naturaleza JSON de la salida no garantiza corrección.
- Sesgos: no documentados por el autor; al entrenarse con un dataset concreto, puede heredar sesgos de la población representada en esos 37 pacientes.
- Idiomas: no se documentan capacidades multilingües; el entrenamiento es en inglés.
- Licencia: Apache 2.0 permite uso comercial, pero las advertencias clínicas y la falta de validación regulatoria desaconsejan cualquier uso en producción sanitaria.
- Tamaño del repositorio de 0.0 GB y 0 descargas: posiblemente los pesos del adaptador no estén publicados o sean de acceso muy reciente; conviene verificar la disponibilidad real de los archivos antes de intentar cargarlo.

## Enlaces

- Hugging Face: https://huggingface.co/MasoomaAli/crs-qwen2.5-1.5b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset: https://huggingface.co/datasets/ncbi/TrialGPT-Criterion-Annotations
- Código, particiones y uso: https://github.com/Masooma-Ali/PatientsDataScreener

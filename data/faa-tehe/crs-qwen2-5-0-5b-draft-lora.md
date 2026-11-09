# faa-tehe/crs-qwen2.5-0.5b-draft-lora

## Resumen

El modelo `crs-qwen2.5-0.5b-draft-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct` por el usuario `faa-tehe`. Está diseñado para una tarea muy concreta: el cribado de elegibilidad de ensayos clínicos (*eligibility screening*). Dado un registro clínico de paciente numerado, un tipo de criterio y un criterio concreto, el adaptador devuelve un objeto JSON con una etiqueta de elegibilidad y los identificadores de las frases que sirven como evidencia. Se trata de un prototipo educativo desarrollado para un trabajo universitario de IA generativa, no de un producto clínico.

El adaptador se apoya en el modelo Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parámetros con capacidad de instrucciones y contexto largo (32 768 tokens nativos en la familia Qwen2.5, aunque la model card del adaptador no lo especifica). El LoRA se entrenó con rango 32 y alpha 64 sobre el split de entrenamiento del dataset TrialGPT Criterion Annotations (602 filas de 37 pacientes), sin utilizar las salidas de GPT-4 presentes en dicho dataset.

Su relevancia actual es limitada y acotada: demuestra cómo un modelo pequeño (0,5B) puede adaptarse mediante PEFT a una tarea de extracción estructurada en el dominio biomédico, con un coste de entrenamiento e inferencia muy bajo. Los resultados de validación (accuracy 0,7379, macro-F1 0,4461, micro-F1 de evidencia 0,4910) reflejan un rendimiento modesto, coherente con el tamaño del modelo base y la dificultad de la tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Qwen2.5-0.5B-Instruct) |
| Parámetros totales | No disponible (adaptador LoRA; el modelo base tiene 0,5B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base Qwen2.5 soporta 32 768 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 es multilingüe; el adaptador se entrenó con datos en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 64 aplicado sobre `Qwen/Qwen2.5-0.5B-Instruct`. No se especifica en la model card sobre qué módulos del transformer se aplican las matrices de bajo rango. El modelo base es un transformer decoder-only de 0,5B parámetros con ajuste por instrucciones, perteneciente a la familia Qwen2.5, que incluye variantes de 0,5B, 1,5B, 3B, 7B, 14B, 32B y 72B.

El entrenamiento utilizó el split de entrenamiento del dataset TrialGPT Criterion Annotations: 602 filas correspondientes a 37 pacientes. Se aplicó un sobremuestreo con potencia 0,5 (*oversampling power 0.5*), una configuración de salida con la etiqueta en primer lugar (*label first output*) y se seleccionó la época 2 como mejor época. Las salidas de GPT-4 incluidas en el dataset no se emplearon en el entrenamiento. La validación se realizó sobre 8 pacientes y 206 filas. No se detalla en la información disponible si hubo RLHF, DPO u otras técnicas de alineación adicionales más allá del ajuste por instrucciones heredado del modelo base.

## Capacidades

- Generación de JSON estructurado: devuelve una etiqueta de elegibilidad y los identificadores de frases de evidencia a partir de una nota clínica numerada, un tipo de criterio y un criterio.
- Cribado de elegibilidad de ensayos clínicos: clasificación de criterios de inclusión/exclusión sobre registros de paciente.
- Extracción de evidencia: identifica las frases del registro que sustentan la decisión de elegibilidad (evidencia a nivel de frase).
- Razonamiento sobre texto clínico en formato de nota numerada.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (*thinking mode*).
- Capacidades multilingües: no documentadas para el adaptador; el modelo base Qwen2.5 es multilingüe, pero el adaptador se entrenó con anotaciones en inglés.

## Casos de uso

- Prototipado académico de cribado de elegibilidad: uso del adaptador para experimentar con pipelines de selección de pacientes en un contexto de investigación, aprovechando su bajo coste computacional y su salida JSON estructurada.
- Extracción de evidencia para revisión humana: el modelo devuelve los identificadores de frases que sustentan la etiqueta, lo que permite a un revisor verificar manualmente la decisión en lugar de confiar ciegamente en la clasificación.
- Generación de datos sintéticos de precribado: uso del adaptador como generador de etiquetas preliminares sobre notas clínicas anonimizadas para construir conjuntos de datos de entrenamiento o evaluación de modelos mayores.
- Evaluación comparativa de adaptadores pequeños: sirve como línea base para medir cuánto rendimiento se obtiene con un LoRA sobre un modelo de 0,5B frente a modelos mayores en tareas de extracción estructurada biomédica.
- Docencia y demostración de PEFT: ejemplo práctico de fine-tuning con LoRA sobre un modelo pequeño para una tarea de dominio específico, útil en cursos de IA generativa.
- Filtrado previo en pipelines de investigación clínica: uso como primera etapa de descarte de criterios evidentes antes de pasar a un modelo mayor o a revisión experta, siempre en entornos de investigación y nunca para decisiones de reclutamiento real.

## Benchmarks y rendimiento

Resultados de validación publicados en la model card (8 pacientes, 206 filas):

| Métrica | Valor |
|---|---|
| Accuracy | 0,7379 |
| Macro-F1 | 0,4461 |
| Micro-F1 de evidencia | 0,4910 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los resultados de test held-out se encuentran en el repositorio del autor, pero no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en torno a 1-2 GB en fp16 para el modelo base de 0,5B, más el pequeño tamaño del adaptador LoRA. En cuantización de 4 bits cabría en menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también funciona en CPU para inferencia puntual.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2-4 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con la librería `peft` y `transformers`. Para servir en producción se puede fusionar el adaptador con el modelo base y desplegar con vLLM, TGI o llama.cpp tras conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera una latencia muy baja en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| crs-qwen2.5-0.5b-draft-lora | 0,5B (base) + LoRA | No disponible (base: 32 768) | Cribado de elegibilidad clínica | apache-2.0 | Hugging Face (0 descargas) |
| Qwen2.5-0.5B-Instruct | 0,5B | 32 768 | Instrucciones generales | apache-2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | 32 768 | Instrucciones generales | apache-2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7B | 32 768 | Instrucciones generales | apache-2.0 | Hugging Face |

No se dispone de comparativas directas con otros adaptadores especializados en cribado de elegibilidad clínica en la información proporcionada. El adaptador no es directamente comparable con los modelos base en tareas generales, ya que está especializado en una única tarea de extracción estructurada.

## Limitaciones y advertencias

- El propio autor advierte que es un prototipo educativo de cribado y no una decisión de reclutamiento clínico; no debe usarse para atención al paciente.
- Rendimiento modesto: macro-F1 de 0,4461 y micro-F1 de evidencia de 0,4910 en validación, lo que indica dificultades para clasificar correctamente todas las clases y para localizar la evidencia.
- Entrenado con solo 602 filas de 37 pacientes, un conjunto muy pequeño que limita la generalización.
- Posible sobreajuste al dominio y formato del dataset TrialGPT; no se documenta evaluación fuera de distribución.
- Riesgo de alucinación: al generar JSON, puede producir etiquetas o identificadores de frases inexistentes o inconsistentes con la nota.
- Idiomas: el adaptador se entrenó con anotaciones en inglés; su comportamiento en castellano u otros idiomas no está documentado.
- Licencia apache-2.0 permite uso comercial del adaptador, pero el uso clínico real está desaconsejado por el autor y por las limitaciones de rendimiento.
- No se documentan sesgos específicos, pero al derivar de un modelo base entrenado con datos web, puede heredar sesgos demográficos y clínicos.
- Sin descargas ni validación externa: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de verificación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/faa-tehe/crs-qwen2.5-0.5b-draft-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Dataset TrialGPT Criterion Annotations: https://huggingface.co/datasets/ncbi/TrialGPT-Criterion-Annotations
- Código, split y uso: https://github.com/FaatehHaneef/Clinical-records-screener

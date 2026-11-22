# Saathimed/AxonMed-32B-Flash

## Resumen
AxonMed-32B-Flash es un modelo de lenguaje de 32.763.876.352 parámetros (aproximadamente 32,8 mil millones) especializado en razonamiento clínico y procesamiento de documentación sanitaria, desarrollado por SaathiMed Private Limited (fundada por Amrendra Kumar). Se presenta como un modelo de fundación médica orientado a producción, construido como un ajuste fino (finetune) del modelo Saathimed/AxonMed-32B-Thinking, que a su vez se apoya en la arquitectura Qwen2.

El modelo aborda tareas de soporte a la decisión diagnóstica, comprensión de historiales clínicos electrónicos (EHR), extracción de entidades clínicas y resumen de diálogos médicos. Su rasgo diferencial es el denominado "Dual-Delimiter Clinical Output Protocol", una estructura de salida que separa el razonamiento clínico (etiqueta `<think>`) del resultado estructurado final, pensada para que los parsers de sistemas hospitalarios y pipelines de evaluación clínica no fallen al interpretar la respuesta.

Es relevante en el contexto actual de modelos médicos abiertos porque declara resultados en el conjunto de benchmarks del Open Medical-LLM Leaderboard, con una media agregada de 82,43% en nueve pruebas en modo zero-shot, y porque se distribuye con licencia Apache 2.0, lo que facilita su adopción comercial. El repositorio ocupa 65,5 GB y el modelo soporta nueve idiomas, entre ellos el español.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Qwen2 (según tag `qwen2`); detalles internos de capas y atención no disponibles |
| Parametros totales | 32.763.876.352 (32,8 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor menciona compatibilidad con `llama-cpp`, lo que implica soporte GGUF, pero no detalla los tipos) |
| Idiomas soportados | en, zh, es, ru, no, fr, it, pt, de |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); compatibilidad declarada con llama.cpp |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de aproximadamente 32,8 mil millones de parámetros, construido sobre la familia Qwen2 según la etiqueta del repositorio. Es un ajuste fino del modelo Saathimed/AxonMed-32B-Thinking, por lo que hereda la arquitectura y el preentrenamiento de esa variante; la model card no detalla el número de capas, la configuración de atención ni la dimensión oculta.

La información disponible no especifica el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. La innovación técnica documentada es el "Dual-Delimiter Clinical Output Protocol": el modelo emite primero un bloque `<think>` con el razonamiento clínico (diagnóstico diferencial, revisión de interacciones farmacológicas, evaluación patológica) y después un bloque `Result:` con la entidad o decisión clínica estandarizada, precedida de un prefijo específico de tarea. Este diseño busca compatibilidad determinista con parsers automáticos en entornos hospitalarios.

## Capacidades
- Generación de texto y razonamiento clínico estructurado mediante el bloque `<think>` previo a la respuesta final.
- Clasificación clínica: triaje de ictus isquémico agudo (AIS), detección de eventos adversos a fármacos (ADE), predicción de mortalidad en UCI y estimación de duración de estancia hospitalaria.
- Extracción de entidades y relaciones clínicas (NER): clasificación por bloques y subbloques ICD-10, codificación morfológica oncológica ICD-O-3, extracción de dosis y aserciones clínicas.
- Resumen de diálogos médicos y consultas: identificación de motivo principal de consulta, resumen de consulta médico-paciente y reconciliación de medicación.
- Respuesta a preguntas biomédicas y de investigación (PubMedQA) y preguntas de examen médico tipo USMLE y AIIMS/NEET-PG.
- Capacidades multilingües nativas en nueve idiomas: inglés, chino, español, ruso, noruego, francés, italiano, portugués y alemán.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso
- Soporte a la decisión diagnóstica en entornos clínicos: el modelo genera un razonamiento diferencial en el bloque `<think>` y una conclusión estructurada en `Result:`, lo que permite integrarlo en sistemas de ayuda al diagnóstico donde el clínico necesita trazabilidad del razonamiento y un campo final parseable.
- Codificación médica automatizada: extracción de códigos ICD-10 e ICD-O-3 a partir de informes de alta o notas clínicas, usando el prefijo de tarea específico para que el resultado se inserte directamente en el sistema de facturación o registro hospitalario.
- Procesamiento de historiales clínicos electrónicos (EHR): resumen y estructuración de notas clínicas extensas, identificación de motivos de consulta y reconciliación de medicación en pacientes con múltiples prescripciones.
- Detección de eventos adversos a fármacos: clasificación de notas clínicas para identificar reacciones adversas y revisión de interacciones farmacológicas dentro del bloque de razonamiento, útil en farmacovigilancia hospitalaria.
- Triaje y predicción de outcomes en urgencias y UCI: clasificación de ictus isquémico agudo, estimación de mortalidad en UCI y predicción de duración de estancia, como señal de apoyo para priorización de recursos.
- Investigación biomédica y revisión de literatura: respuesta a preguntas sobre abstracts de PubMed (PubMedQA) y síntesis de evidencia para equipos de investigación clínica.
- Formación médica y generación de preguntas tipo examen: con un 76,36% en MedQA (USMLE) y 66,77% en MedMCQA, puede emplearse para generar y explicar preguntas de preparación de exámenes médicos.
- Atención al paciente multilingüe: resumen y estructuración de consultas en español, francés, alemán, italiano, portugués y otros idiomas soportados, útil en hospitales con población diversa.

## Benchmarks y rendimiento

Resultados declarados por el autor (zero-shot, precisión bfloat16, 27.680 instancias de test según la model card). Ninguno está verificado de forma independiente (`verified: false` en el model-index).

| Benchmark | Tarea / dominio | Metrica | AxonMed-32B-Flash | Baseline de referencia declarado |
|---|---|---|---|---|
| MMLU College Biology | Biología | Accuracy | 95,14% | ~70,0% |
| MMLU Professional Medicine | Medicina profesional | Accuracy | 88,60% | ~65,0% |
| MMLU Medical Genetics | Genética médica | Accuracy | 87,00% | ~65,0% |
| MMLU Clinical Knowledge | Conocimiento clínico | Accuracy | 86,42% | ~65,0% |
| MMLU College Medicine | Medicina | Accuracy | 82,08% | ~60,0% |
| MMLU Anatomy | Anatomía | Accuracy | 80,74% | ~60,0% |
| PubMedQA | QA biomédica | Accuracy | 78,80% | 75,2% |
| MedQA (USMLE 4 opciones) | Examen médico | Accuracy | 76,36% | 60,0% (aprobado USMLE) |
| MedMCQA (AIIMS / NEET-PG) | QA médica opción múltiple | Accuracy | 66,77% | 50,0% (percentil de corte) |
| Media agregada (9 benchmarks) | Suite combinada | Macro avg | 82,43% | — |

El autor afirma que estos resultados superan a modelos clínicos densos típicos de 70B con un throughput de inferencia 2,2 veces superior, si bien no se aportan datos de latencia ni de comparación directa con modelos concretos.

## Requisitos de hardware
- VRAM estimada para inferencia en bfloat16: aproximadamente 65,5 GB solo para pesos (32,8 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica se requieren 2 GPUs de 48 GB o una GPU de 80 GB.
- Cuantización a 8 bits: en torno a 33 GB de pesos, viable en una A100 40 GB o H100 40 GB con margen limitado.
- Cuantización a 4 bits (GGUF Q4): en torno a 17-20 GB de pesos, lo que permite ejecución en una RTX 4090 (24 GB) o RTX 3090, con posible offload parcial a CPU en GPUs de 16 GB.
- GPUs recomendadas: A100 80 GB, H100 80 GB o H200 para bfloat16 sin cuantizar; A100 40 GB para 8 bits; RTX 4090 / RTX 3090 para cuantización 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 o RTX 3090 con cuantización de 4 bits; en GPUs de 12-16 GB requeriría offload a RAM y penalización de latencia.
- Opciones de despliegue: transformers (referencia en la model card), llama.cpp (declarado en los tags), y por compatibilidad con el ecosistema Qwen2 cabría esperar vLLM, TGI y Ollama, aunque el autor solo documenta explícitamente transformers y llama.cpp.
- Latencia y throughput: el autor declara una inferencia 2,2 veces más rápida que modelos densos de 70B, pero no publica valores absolutos de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MedQA (USMLE) | PubMedQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AxonMed-32B-Flash | 32,8 B | no disponible | 76,36% | 78,80% | Apache 2.0 | Hugging Face |
| Modelos clínicos densos de 70B (referencia genérica del autor) | ~70 B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Saathimed/AxonMed-32B-Thinking (modelo base) | 32,8 B (estimado por herencia) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La información proporcionada no incluye resultados de benchmarks de alternativas concretas con nombre y apellidos, por lo que la comparación cuantitativa con modelos específicos de la misma categoría (por ejemplo, Meditron, BioMistral o Med42) no está disponible.

## Limitaciones y advertencias
- Los resultados de benchmarks son declarados por el autor y aparecen como no verificados (`verified: false`) en el model-index; no se ha confirmado su reproducción independiente.
- No se especifica la longitud de contexto, lo que impide planificar con precisión tareas sobre historiales clínicos extensos.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni procesos de alineación (RLHF/DPO), lo que dificulta evaluar riesgos de sesgo demográfico o clínico.
- Riesgo de alucinación inherente a los modelos de lenguaje: en un dominio médico, una respuesta errónea sobre dosis, diagnósticos o interacciones farmacológicas puede tener consecuencias graves; el modelo no debe usarse como sustituto del juicio clínico.
- El modelo no está validado como dispositivo médico ni se declara certificación regulatoria alguna (CE, FDA u otras); su uso en entornos clínicos reales requiere validación local y supervisión profesional.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni asume responsabilidad sobre el uso clínico.
- El soporte de tool calling y de flujos agénticos no está documentado, lo que limita su integración en pipelines automatizados que dependan de function calling.
- El repositorio (65,5 GB) y el tamaño del modelo implican requisitos de hardware considerables para despliegues en producción.
- El modelo tiene 661 descargas y 0 likes en el momento de la consulta, lo que indica una adopción comunitaria todavía muy limitada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Saathimed/AxonMed-32B-Flash
- Modelo base: https://huggingface.co/Saathimed/AxonMed-32B-Thinking
- DOI Zenodo: https://doi.org/10.5281/zenodo.24143274
- ORCID del autor: https://orcid.org/0009-0006-7093-6762
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Dataset MedQA USMLE 4 opciones: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset MedMCQA: https://huggingface.co/datasets/medmcqa
- Dataset PubMedQA: https://huggingface.co/datasets/pubmed_qa

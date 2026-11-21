# sabineeee/qwen2.5-3b-symptom-extraction-qlora

## Resumen

El modelo `sabineeee/qwen2.5-3b-symptom-extraction-qlora` es un adaptador LoRA (concretamente QLoRA) entrenado sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`. Lo desarrolla el usuario de Hugging Face `sabineeee` en el marco de un proyecto académico de máster (M2 en Inteligencia Artificial). Su propósito es muy específico: recibir el mensaje libre de un paciente en inglés y devolver un listado estructurado en JSON de los síntomas detectados, normalizados al vocabulario controlado de DDXPlus, que consta de 96 etiquetas.

El modelo resuelve una tarea clásica de extracción de información en el dominio clínico: convertir texto narrativo no estructurado en datos explotables por sistemas de triaje, historia clínica electrónica o motores de diagnóstico diferencial. Al estar construido sobre un modelo de 3.000 millones de parámetros, el adaptador es ligero (el repositorio ocupa unos 0,1 GB) y puede cargarse sobre una instancia del modelo base en hardware de consumo, lo que facilita su evaluación e integración en prototipos.

Es relevante ahora porque demuestra un patrón habitual en el ecosistema open source: especializar un modelo generalista pequeño mediante PEFT para una tarea vertical concreta, con un vocabulario cerrado y salida estructurada. No obstante, conviene subrayar que se trata de un artefacto académico, sin métricas publicadas en la información disponible y entrenado sobre datos sintéticos, por lo que no está pensado para uso clínico real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer decoder-only Qwen2.5-3B-Instruct |
| Parametros totales | 3.000 millones en el modelo base (adaptador: no disponible el número exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | QLoRA implica cuantización del base a 4 bits durante el entrenamiento; no se detallan otras |
| Idiomas soportados | inglés (según la model card, la entrada del paciente es en inglés); no se declaran más |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-3B-Instruct, un transformer decoder-only de la familia Qwen2.5. Sobre él se aplica un adaptador LoRA entrenado con QLoRA, técnica que congela los pesos del base cuantizados a 4 bits y entrena únicamente matrices de bajo rango, reduciendo drásticamente los requisitos de memoria. El repositorio contiene solo los pesos del adaptador (formato PEFT/safetensors), no el modelo completo.

Los datos de entrenamiento son textos sintéticos generados a partir de pacientes de DDXPlus, un dataset público de diagnóstico diferencial con un vocabulario cerrado de 96 etiquetas de síntomas. La tarea consiste en mapear lenguaje libre a ese conjunto controlado y devolver la salida en JSON. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO; tampoco se detallan hiperparámetros del LoRA (rango, alpha, capas objetivo).

## Capacidades

- Extracción de síntomas a partir de texto libre en inglés y normalización al vocabulario DDXPlus de 96 etiquetas.
- Generación de salida estructurada en formato JSON con la lista de síntomas detectados.
- Comprensión de lenguaje natural clínico coloquial (descripciones de pacientes).
- Herencia de las capacidades generales de Qwen2.5-3B-Instruct (generación de texto, razonamiento básico, instrucciones), aunque el adaptador está especializado y puede degradar el comportamiento general.
- Soporte de tool calling / function calling: no disponible de forma específica para este adaptador (el base lo soporta, pero el adaptador no está entrenado para ello).
- Capacidades de agente y razonamiento multi-paso: no disponibles como capacidad entrenada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Prototipado de triaje clínico: el modelo convierte la descripción libre de un paciente en una lista JSON de síntomas normalizados, que puede alimentar un motor de reglas o un sistema de priorización de consultas.
- Investigación en NLP clínico: sirve como línea base reproducible para experimentos de extracción de entidades y normalización a vocabularios controlados sobre DDXPlus.
- Integración en pipelines de historia clínica electrónica: la salida JSON encaja directamente en esquemas de datos estructurados, facilitando la cumplimentación automática de campos de síntomas.
- Sistemas de apoyo al diagnóstico diferencial: los síntomas normalizados pueden pasarse a un motor DDXPlus o a un clasificador posterior para generar hipótesis diagnósticas.
- Docencia y formación: ejemplo práctico de fine-tuning con QLoRA sobre un modelo de 3B para una tarea de información extraction vertical, útil en cursos de IA aplicada a salud.
- Evaluación comparativa de PEFT: permite medir cuánto puede especializarse un modelo de 3B con un adaptador ligero frente a modelos mayores, en una tarea de vocabulario cerrado.
- Filtrado y estructuración de encuestas o formularios libres: normalización de respuestas abiertas de pacientes a un conjunto fijo de etiquetas para análisis estadístico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador es mínimo (0,1 GB); el modelo base Qwen2.5-3B-Instruct requiere aproximadamente 6-7 GB en FP16 y en torno a 2-3 GB en cuantización de 4 bits (estimación estándar para 3B; no confirmada en la información proporcionada).
- GPU recomendadas: RTX 3090, RTX 4090, A10, L4 o superiores para FP16; GPUs con 8 GB o más para cuantización 4 bits.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando cuantización (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- Opciones de despliegue: carga mediante `peft` + `transformers` sobre el base; también puede fusionarse el adaptador y exportarse a GGUF para llama.cpp u Ollama, o servirse con vLLM/TGI tras la fusión (no documentado explícitamente en la información disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sabineeee/qwen2.5-3b-symptom-extraction-qlora | 3B (base) + LoRA | no disponible | Extracción de síntomas DDXPlus | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct | 3B | no disponible en esta ficha | Instrucciones generales | Apache 2.0 | Hugging Face |
| Adaptadores de extracción clínica sobre modelos 7B (genéricos) | 7B | variable | Extracción de entidades clínicas | variable | Hugging Face |

La comparativa detallada con alternativas específicas de extracción de síntomas en DDXPlus no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo académico: no sustituye el juicio clínico ni debe usarse en decisiones médicas reales, tal como advierte la propia model card.
- Entrenado sobre datos sintéticos generados a partir de DDXPlus, lo que puede no reflejar la variabilidad y ruido del lenguaje real de pacientes.
- Vocabulario cerrado de 96 etiquetas: los síntomas fuera de ese conjunto no se representarán correctamente.
- Solo inglés: no se declaran capacidades multilingües; el rendimiento en castellano es incierto.
- Riesgo de alucinación: como todo modelo generativo, puede producir etiquetas inexistentes o JSON malformado; requiere validación y parseo robusto en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precisión, recall o F1 en la información disponible.
- Sesgos: no documentados; al derivar de un dataset sintético, puede heredar los sesgos de la distribución de DDXPlus.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen2.5-3B-Instruct tiene su propia licencia que debe respetarse.
- Sin soporte de tool calling ni agentes específicamente entrenados; el adaptador puede degradar las capacidades generales del base.

## Enlaces

- Hugging Face: https://huggingface.co/sabineeee/qwen2.5-3b-symptom-extraction-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Demo (Space): https://huggingface.co/spaces/sabineeee/extraction-symptomes

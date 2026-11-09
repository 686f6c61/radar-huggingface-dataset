# faa-tehe/crs-qwen2.5-1.5b-lora

## Resumen

El modelo `faa-tehe/crs-qwen2.5-1.5b-lora` es un adaptador LoRA entrenado sobre el modelo base Qwen2.5-1.5B-Instruct, desarrollado por el usuario faa-tehe en el contexto de un trabajo académico universitario de IA generativa. Su propósito es resolver una tarea muy concreta dentro del dominio clínico: el cribado de elegibilidad de pacientes para ensayos clínicos (eligibility screening). Dado un conjunto de notas clínicas numeradas, un tipo de criterio y un criterio concreto, el modelo devuelve una respuesta en formato JSON con una etiqueta de elegibilidad y los identificadores de las frases que sirven como evidencia.

El adaptador se ha entrenado exclusivamente sobre el split de entrenamiento del dataset TrialGPT Criterion Annotations (602 filas procedentes de 37 pacientes), sin utilizar en ningún momento las salidas de GPT-4 que contiene dicho dataset. La configuración de entrenamiento emplea rango 32, alpha 64, oversampling con potencia 0.5, salida de etiqueta primero y mejor época 4. En validación (8 pacientes, 206 filas) obtiene una accuracy de 0.7427, un macro-F1 de 0.5584 y un micro-F1 de evidencia de 0.5089.

Es relevante ahora porque demuestra cómo un modelo pequeño (1.5B parámetros) puede adaptarse mediante LoRA a una tarea de extracción estructurada en un dominio regulado como la salud, con un coste de entrenamiento bajo y una licencia permisiva. No obstante, el propio autor lo etiqueta explícitamente como prototipo educativo de cribado y no como herramienta de decisión clínica ni de atención al paciente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-1.5B-Instruct) con adaptador LoRA (PEFT) |
| Parámetros totales | 1.5B en el modelo base; número de parámetros del adaptador LoRA no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.5B parámetros, y se entrena mediante LoRA con rango 32 y alpha 64. La tarea se formula como generación de JSON estructurado: a partir de una nota clínica numerada por frases, un tipo de criterio y el criterio, el modelo produce una etiqueta de elegibilidad seguida de los IDs de las frases que sustentan la decisión. La configuración incluye oversampling con potencia 0.5 para mitigar el desbalanceo de clases y una estrategia de "label first output", es decir, la etiqueta se genera antes que la evidencia.

Los datos de entrenamiento provienen del split de entrenamiento del dataset TrialGPT Criterion Annotations (602 filas de 37 pacientes). El autor indica explícitamente que las salidas de GPT-4 presentes en ese dataset no se utilizaron en ningún momento, lo que evita la destilación indirecta de un modelo mayor. El mejor checkpoint corresponde a la época 4. No se especifica en la información disponible si hubo RLHF, DPO u otras fases de alineación posteriores al ajuste supervisado, ni el número total de tokens de entrenamiento.

## Capacidades

- Generación de JSON estructurado con una etiqueta de elegibilidad y una lista de IDs de frases de evidencia.
- Cribado de elegibilidad de pacientes frente a criterios de ensayos clínicos (tipo de criterio y criterio dados como entrada).
- Extracción de evidencia textual: identificación de las frases de la nota clínica que justifican la decisión.
- Razonamiento sobre notas clínicas numeradas por frases.
- Capacidades generales de instrucción heredadas del modelo base Qwen2.5-1.5B-Instruct (generación de texto, código y matemáticas básicas), aunque no evaluadas específicamente en este adaptador.
- Soporte de tool calling / function calling: no documentado para el adaptador; heredado potencialmente del modelo base, no verificado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Prototipado académico de cribado de elegibilidad: el adaptador permite experimentar con la formulación de la tarea (nota numerada + criterio → JSON con etiqueta y evidencia) sobre el dataset TrialGPT, sirviendo como base reproducible para trabajos universitarios y comparaciones de metodología.
- Investigación en extracción de evidencia clínica: el campo de IDs de frases facilita evaluar métricas de recuperación de evidencia (micro-F1 de evidencia) y estudiar la trazabilidad de las decisiones de un modelo pequeño en dominios regulados.
- Evaluación de LoRA en dominios especializados: sirve para medir cuánto puede adaptarse un modelo de 1.5B a una tarea estructurada con solo 602 filas de entrenamiento, como referencia para decisiones de escalado de datos y de modelo.
- Generación de datasets sintéticos de cribado: el adaptador puede usarse para etiquetar notas clínicas anonimizadas en un entorno de investigación y generar candidatos que luego revise un experto humano, siempre fuera de decisiones de atención al paciente.
- Docencia y formación en IA clínica: útil como ejemplo práctico de pipeline completo (dataset, split, entrenamiento LoRA, validación con métricas macro-F1 y F1 de evidencia) en asignaturas de IA generativa.
- Pruebas de integración de salidas JSON en pipelines downstream: el formato de salida estructurado permite conectar el adaptador a sistemas de validación de esquemas o de revisión humana en flujos de investigación, no en producción clínica.

## Benchmarks y rendimiento

| Conjunto | Métrica | Resultado |
|---|---|---|
| Validación (8 pacientes, 206 filas) | Accuracy | 0.7427 |
| Validación (8 pacientes, 206 filas) | Macro-F1 | 0.5584 |
| Validación (8 pacientes, 206 filas) | Micro-F1 de evidencia | 0.5089 |
| Test held-out | Resultados en el repositorio del autor (no reproducidos aquí) | No disponible |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; al tratarse de un modelo base de 1.5B parámetros, la inferencia en precisión completa requiere aproximadamente 3-4 GB y en cuantización de 4 bits puede situarse en torno a 1-2 GB (estimación orientativa, no confirmada en la información proporcionada).
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo base es apto para GPUs de consumo, aunque no se confirma en la documentación del adaptador.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; el tamaño del modelo base (1.5B) sugiere que sí, pero no se aportan datos verificados.
- Opciones de despliegue: la librería indicada es PEFT; el adaptador requiere cargar el modelo base Qwen2.5-1.5B-Instruct y aplicar el adaptador LoRA. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| faa-tehe/crs-qwen2.5-1.5b-lora | 1.5B (base) + LoRA | No disponible | Cribado de elegibilidad clínica (JSON) | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | No disponible en esta ficha | Instrucción general | Apache 2.0 | Hugging Face |
| TrialGPT (modelo de referencia del dataset) | No disponible | No disponible | Cribado de elegibilidad clínica | No disponible | No disponible en la información proporcionada |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que es un prototipo educativo de cribado y no una decisión de inscripción clínica; no debe usarse para atención al paciente.
- Riesgo de alucinación: el modelo puede generar etiquetas o IDs de evidencia no respaldados por la nota clínica; el micro-F1 de evidencia de 0.5089 en validación indica una fiabilidad limitada en la extracción de evidencia.
- El macro-F1 de validación (0.5584) es moderado, lo que sugiere un rendimiento desigual entre clases de elegibilidad.
- Entrenado con solo 602 filas de 37 pacientes: riesgo elevado de sobreajuste y de baja generalización a otras poblaciones, instituciones o formatos de nota clínica.
- Sesgos conocidos: no documentados en la información proporcionada; al derivarse de un dataset clínico concreto, pueden heredarse sesgos de composición poblacional.
- Idiomas soportados no disponibles; el dataset de origen está en inglés, por lo que el rendimiento en castellano no está verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la advertencia del autor y el contexto clínico desaconsejan cualquier uso en producción sanitaria sin validación regulatoria.
- No se documentan requisitos de contexto, cuantización ni despliegue, lo que dificulta una puesta en producción reproducible.

## Enlaces

- Hugging Face: https://huggingface.co/faa-tehe/crs-qwen2.5-1.5b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset TrialGPT Criterion Annotations: https://huggingface.co/datasets/ncbi/TrialGPT-Criterion-Annotations
- Código, split y uso: https://github.com/FaatehHaneef/Clinical-records-screener

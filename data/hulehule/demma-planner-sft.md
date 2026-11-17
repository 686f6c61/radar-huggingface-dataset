# hulehule/DemMA-Planner-SFT

## Resumen

DemMA-Planner-SFT es un modelo de lenguaje de 8.190.735.360 parámetros (aproximadamente 8,2 mil millones) afinado mediante SFT sobre la arquitectura Qwen3, publicado por el usuario hulehule en Hugging Face. Según los tags del repositorio, está orientado a la simulación de pacientes con demencia y a la generación de diálogo conversacional en el ámbito clínico, y se asocia a una publicación en ACL 2026 (tag `acl-2026`). El nombre "Planner" sugiere un rol específico dentro de una arquitectura mayor de agentes o de planificación de turnos de conversación, aunque la información pública disponible no detalla esa integración.

El modelo resuelve un problema acotado pero relevante para la investigación en IA aplicada a la salud: disponer de un simulador de paciente controlable y reproducible para entrenar y evaluar sistemas de diálogo clínico, así como para generar datos sintéticos de conversaciones con personas con demencia. Frente a usar un LLM generalista, un modelo afinado específicamente para este dominio permite mantener un perfil de paciente coherente a lo largo de múltiples turnos.

La relevancia actual del modelo es fundamentalmente académica: cuenta con 7 descargas, 0 likes, acceso restringido (gated) y licencia no especificada, lo que limita su adopción en producción. Su interés radica en el caso de uso (simulación de pacientes neurodivergentes) y en la posibilidad de reproducir la metodología de un trabajo aceptado en ACL 2026, más que en sus cifras de rendimiento, que no se han publicado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3 (tag `qwen3`) |
| Parametros totales | 8.190.735.360 (~8,2 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,4 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Pipeline | text-generation |
| Fecha de creacion | 2025-11-23 |
| Ultima actualizacion | 2026-11-17 |

## Arquitectura y entrenamiento

El modelo parte de la familia Qwen3, una arquitectura transformer decoder-only con atención causal estándar (la variante concreta de Qwen3 empleada no se especifica en la información disponible). El sufijo "SFT" indica que el ajuste se realizó mediante supervisión fina sobre pares instrucción-respuesta, sin que conste una fase posterior de RLHF o DPO. El nombre "Planner" apunta a que el modelo fue entrenado para generar planes de conversación o trayectorias de diálogo antes de producir los turnos finales, un patrón habitual en sistemas de simulación de paciente donde se separa la planificación del acto de habla.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de técnicas de alineación adicionales ni innovaciones arquitectónicas específicas (decodificación especulativa, atención lineal, etc.). El tag `patient-simulation` y `dementia` sugiere que el corpus de SFT está compuesto por diálogos clínicos anotados con perfiles de paciente con demencia, pero los detalles no están publicados en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno orientada a diálogo clínico.
- Simulación de pacientes con demencia: el modelo puede encarnar un perfil de paciente concreto y mantenerlo coherente a lo largo de la conversación.
- Planificación de diálogo (rol "Planner"): generación de planes o trayectorias de conversación previas a los turnos de respuesta.
- Generación de datos sintéticos para entrenamiento y evaluación de sistemas de diálogo clínico.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (idiomas no especificados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Simulación de pacientes para entrenamiento de terapeutas y cuidadores: el modelo puede interpretar el rol de una persona con demencia en sesiones simuladas, permitiendo a profesionales practicar técnicas de comunicación sin exponer a pacientes reales.
- Generación de datos sintéticos de diálogo clínico: útil para aumentar corpus escasos de conversaciones con pacientes con demencia y entrenar clasificadores de síntomas o sistemas de apoyo a la decisión.
- Evaluación automática de sistemas de diálogo clínico: usar el modelo como paciente virtual reproducible para medir la calidad de las respuestas de un asistente conversacional en escenarios controlados.
- Investigación en planificación de diálogo: al estar etiquetado como "Planner", sirve como componente de planificación en pipelines de agentes conversacionales donde se separa la estrategia del turno de la generación superficial.
- Docencia en neuropsicología y geriatría: creación de escenarios interactivos para ilustrar la progresión de la demencia y los patrones de comunicación asociados.
- Reproducibilidad de investigación: al estar vinculado a un trabajo de ACL 2026, permite a otros grupos reproducir los experimentos del paper y comparar resultados con la misma base de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 20-24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: ~8-9 GB de pesos, más overhead; viable en GPUs de 12-16 GB.
- VRAM estimada en cuantización de 4 bits: ~4-5 GB de pesos, más overhead; viable en GPUs consumer de 8-12 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 4070).
- GPU recomendadas para producción: A100 40/80 GB, H100, L40S; para desarrollo: RTX 4090 (24 GB), RTX 3090 (24 GB).
- Cabe en GPU consumer: sí, en cuantización de 4-8 bits, en tarjetas con 8 GB o más de VRAM.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (previa conversión a GGUF, no publicada), transformers con safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DemMA-Planner-SFT | ~8,2 B | no disponible | Simulación de paciente con demencia (SFT sobre Qwen3) | no disponible | Gated, 7 descargas |
| Qwen3-8B (base) | ~8 B | no disponible | LLM generalista | Apache 2.0 (según familia Qwen3) | Pública |
| Modelos de simulación de paciente clínico (p. ej. variantes afinadas de Llama/Mistral para role-play clínico) | 7-8 B típicamente | variable | Simulación de paciente / role-play | variable | variable |

La comparación directa con alternativas específicas no está disponible en la información proporcionada; los modelos incluidos en la tabla son referencias de categoría, no comparaciones verificadas con datos de benchmark.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede retrasar o impedir su uso en pipelines automatizados.
- Licencia no especificada: no se puede confirmar el uso comercial; para producción es imprescindible aclarar los términos con el autor.
- Idiomas no declarados: no se puede garantizar un rendimiento multilingüe ni siquiera en castellano.
- Sesgos y riesgo clínico: un modelo que simula pacientes con demencia puede reproducir estereotipos sobre la enfermedad y no debe usarse como sustituto de evaluación clínica real.
- Riesgo de alucinación: como todo LLM afinado por SFT, puede generar contenido clínicamente plausible pero incorrecto, especialmente en diálogos largos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas generalistas.
- Madurez baja: 7 descargas y 0 likes indican un modelo de nicho, probablemente ligado a una publicación académica y no a un uso industrial.
- Longitud de contexto desconocida: limita la planificación de conversaciones largas y la evaluación de coherencia multi-turno.
- Sin cuantizaciones publicadas: obliga a convertir manualmente a GGUF/AWQ para despliegue en hardware limitado.

## Enlaces

- Hugging Face: https://huggingface.co/hulehule/DemMA-Planner-SFT
- Paper asociado (ACL 2026): no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada

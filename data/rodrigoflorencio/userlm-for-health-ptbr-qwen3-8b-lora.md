# RodrigoFlorencio/UserLM-for-health-PTBR-Qwen3-8B-LoRA

## Resumen
UserLM-for-health-PTBR-Qwen3-8B-LoRA es un adaptador LoRA sobre el checkpoint base Qwen3-8B-Base, desarrollado por RodrigoFlorencio, que invierte el papel habitual de los modelos de lenguaje: en lugar de responder preguntas médicas, simula las preguntas que haría un paciente brasileño. Dado un intent en el mensaje de sistema (una patología o una descripción de síntomas), el modelo genera una consulta en portugués coloquial, con faltas de ortografía y oralidad propias de un paciente real que escribe en un portal de salud.

El modelo sigue la receta "Flipping the Dialogue" (arXiv 2510.06552), que entrena únicamente sobre el turno del usuario con `completion_only_loss` partiendo del checkpoint base, no del instruct. Se entrenó con más de 33.000 dudas reales de pacientes extraídas de páginas públicas brasileñas, cubriendo 62 patologías. Es relevante porque habilita la simulación realista de usuarios para evaluar y entrenar sistemas de atención sanitaria conversacional, una pieza que escasea en portugués.

El adaptador tiene un tamaño de repositorio de 1,1 GB y se distribuye bajo licencia Apache 2.0. No está pensado como modelo asistencial: su función es generar datos sintéticos de consultas de pacientes para pipelines de evaluación y entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA (r=32, α=32) sobre q/k/v/o/gate/up/down |
| Parametros totales | 8B (modelo base Qwen3-8B-Base); adaptador LoRA no cuantificado en la información |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3-8B-Base; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el base admite las cuantizaciones habituales de Qwen3) |
| Idiomas soportados | portugués (pt), en registro coloquial brasileño |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el base Qwen/Qwen3-8B-Base |

## Arquitectura y entrenamiento
El adaptador se aplica sobre Qwen3-8B-Base, un transformer decoder-only de 8.000 millones de parámetros. El entrenamiento usó LoRA con r=32 y α=32 sobre las proyecciones q/k/v/o/gate/up/down, mediante TRL 1.17.1, durante 3 épocas (1.434 pasos, batch efectivo 64, secuencia de 2.048 tokens), con learning rate 2e-4, scheduler cosine y warmup de 40 pasos. Se ejecutó en una única GPU A10G Large en aproximadamente 5 horas y 4 minutos, en bf16 con atención sdpa.

La innovación clave es el enmascarado de la loss: solo se calcula sobre la completion (la pregunta del paciente), no sobre el intent del sistema. El dataset de origen contiene 33.957 preguntas únicas sobre 62 patologías, deduplicadas por 7-gram y divididas 90/5/5 por hilo. El intent genérico inyectado en el sistema es "Pergunta anônima de um paciente em um portal de saúde online sobre {patologia}.". Los resultados de entrenamiento muestran una loss de train que baja de 2,864 a 1,831 (mínimo 1,791) y una eval_loss de 2,153 a 2,086, con mínimo de 2,069 en el paso 800; el autor señala sobreajuste leve en las últimas épocas y que 2 épocas habría sido el punto óptimo.

## Capacidades
- Generación de preguntas de paciente en portugués brasileño coloquial a partir de un intent de patología o síntoma.
- Reproducción de oralidad y errores tipográficos realistas (typos, registro informal).
- Simulación de usuarios para evaluación de sistemas conversacionales sanitarios.
- Generación de datos sintéticos de consultas para entrenamiento de modelos médicos.
- Alta diversidad léxica entre generaciones del mismo intent (1−Jaccard medio de 0,82–0,90 frente al ~0,94 de humanos reales en el paper).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo no está orientado a tareas de agente).
- Capacidades multilingües: limitadas al portugués; el resto de idiomas no está validado.
- Modo thinking, visión o audio: no disponible.

## Casos de uso
- Evaluación de asistentes de triaje sanitario: generar baterías de preguntas de pacientes variadas y realistas para medir la robustez de un chatbot médico ante entradas coloquiales y con errores.
- Aumento de datos para entrenamiento: producir consultas sintéticas etiquetadas por patología que amplíen datasets de dominios con pocos ejemplos reales.
- Pruebas de regresión en pipelines de NLP clínico: alimentar sistemas de clasificación de intenciones con entradas de usuario generadas automáticamente y verificar su comportamiento.
- Simulación de diálogos multi-turno (fase 2 prevista por el autor): usar el modelo como usuario sintético que responde a las preguntas de un médico simulado, permitiendo evaluar sistemas de anamnesis.
- Investigación en salud pública: estudiar qué tipo de dudas plantean los pacientes sobre cada patología y cómo varía el lenguaje según la afección.
- Generación de datasets de portugués coloquial sanitario: crear corpus anotados por patología para tareas de normalización de texto informal o detección de síntomas.
- Pruebas de usabilidad de portales de salud: simular sesiones de usuario para validar flujos de formularios y buscadores de síntomas antes de su lanzamiento.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta métricas de entrenamiento y validación propias:

| Metrica | Valor |
|---|---|
| Train loss (inicial → final) | 2,864 → 1,831 (mínimo 1,791) |
| Eval loss (inicial → final) | 2,153 → 2,086 |
| Eval loss mínima | 2,069 en el paso 800 |
| Acurácia de token final | 0,595 (train) / 0,560 (eval) |
| Entropía en el paso 800 | 1,996 |
| Muestras dentro de guardrails | 94/96 |
| Diversidad media (1−Jaccard) | 0,82–0,90 (humanos ~0,94 en el paper) |

## Requisitos de hardware
- VRAM estimada para inferencia: el adaptador LoRA se suma al base Qwen3-8B-Base; en bf16 el conjunto requiere aproximadamente 16 GB de VRAM, más el overhead de activaciones y caché KV.
- GPU recomendadas: A10G Large (usada en el entrenamiento), A100 40/80 GB, H100 para mayor throughput; también válidas L40S o RTX 6000 Ada.
- GPU de consumo: cabe en tarjetas con 16-24 GB (RTX 4090, RTX 4080, RTX 3090) en bf16 o fp16; en cuantización de 8 o 4 bits del base podría ejecutarse en GPUs de 8-12 GB, aunque la cuantización del adaptador no está documentada.
- Opciones de despliegue: transformers + peft (flujo documentado en la model card); el base es compatible con vLLM, TGI y llama.cpp/Ollama, pero la carga de adaptadores LoRA en estos motores requiere verificación adicional no cubierta en la información.
- Latencia y throughput: no disponibles. El entrenamiento completo (3 épocas, 1.434 pasos) tomó ~5 horas en una A10G.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UserLM-for-health-PTBR-Qwen3-8B-LoRA | 8B (base) + LoRA | no disponible | Simulación de paciente PT-BR sanitario | Apache 2.0 | Hugging Face |
| Qwen3-8B-Base | 8B | no disponible | Modelo base generalista | Apache 2.0 | Hugging Face |
| Modelos de simulación de usuario del paper "Flipping the Dialogue" | no disponible | no disponible | Simulación de usuario (inglés, según el paper) | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y propósito.

## Limitaciones y advertencias
- El modelo genera preguntas de paciente, no respuestas médicas; no debe usarse como asistente clínico ni para dar consejo sanitario.
- Riesgo de alucinación: puede generar síntomas, patologías o detalles clínicos inexistentes o incoherentes con el intent proporcionado.
- Sesgos: el corpus proviene de páginas públicas brasileñas, por lo que hereda los sesgos de ese material (sobrerrepresentación de ciertas patologías, registros y perfiles sociodemográficos).
- Limitación idiomática: solo portugués brasileño; no se ha validado en otras variantes del portugués ni en otros idiomas. El base es multilingüe, pero el adaptador no está entrenado para ello.
- Requiere aplicar guardrails en producción: temperatura 1.0 y top_p 0.8, parada también en `<|im_start|>` para no cruzar la frontera de turno, `min_new_tokens=1` y limpieza de codepoints no latinos (scrub), según la model card.
- El autor documenta sobreajuste leve en las últimas épocas; la eval_loss mínima se alcanza en el paso 800, no al final del entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-8B-Base debe cumplir también su propia licencia.
- El adaptador no incluye los pesos del base; es necesario descargar Qwen/Qwen3-8B-Base por separado.
- No hay datos publicados sobre robustez ante prompts adversarios ni sobre evaluación clínica por expertos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/RodrigoFlorencio/UserLM-for-health-PTBR-Qwen3-8B-LoRA
- Dataset de dudas de salud PT-BR: https://huggingface.co/datasets/RodrigoFlorencio/duvidas-saude-ptbr
- Métricas del entrenamiento: https://huggingface.co/datasets/RodrigoFlorencio/duvidas-saude-ptbr/tree/main/metrics
- Implementación de guardrails: https://huggingface.co/datasets/RodrigoFlorencio/duvidas-saude-ptbr/blob/main/spaces/userlm_core.py
- Paper "Flipping the Dialogue": https://arxiv.org/abs/2510.06552
- Modelo base Qwen3-8B-Base: https://huggingface.co/Qwen/Qwen3-8B-Base

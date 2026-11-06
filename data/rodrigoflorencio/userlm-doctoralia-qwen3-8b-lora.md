# RodrigoFlorencio/UserLM-Doctoralia-Qwen3-8B-LoRA

## Resumen

UserLM-Doctoralia-Qwen3-8B-LoRA es un adaptador LoRA sobre el checkpoint base Qwen/Qwen3-8B-Base, desarrollado por RodrigoFlorencio, que simula el turno del paciente en un portal de salud brasileño. Dado un *intent* (una patología o una descripción de síntomas) inyectado en el mensaje de sistema, el modelo genera la pregunta que un paciente real escribiría en portugués coloquial, incluyendo erratas y oralidad. No es un asistente médico: no responde consultas ni ofrece orientación clínica, sino que produce datos sintéticos de usuario para entrenar y evaluar sistemas conversacionales del lado del asistente.

El modelo sigue la receta "Flipping the Dialogue" (arXiv 2510.06552), que entrena un *User Language Model* (UserLM) calculando la pérdida únicamente sobre el turno del usuario (`completion_only_loss`). Se parte del checkpoint base, no del instruct, para evitar que el modelo herede un comportamiento de asistente. El adaptador tiene rango r=32, alpha=32, sobre las proyecciones q/k/v/o/gate/up/down, y se entrenó con TRL 1.17.1 durante 3 épocas (1.434 pasos, batch efectivo 64, secuencia de 2048) en una única GPU A10G Large en unas 5 horas y 4 minutos.

El corpus de entrenamiento procede de preguntas anónimas de pacientes de Doctoralia Brasil: 33.957 preguntas únicas sobre 62 patologías, deduplicadas por 7-gram y divididas 90/5/5 por hilo. El resultado es un generador de preguntas de paciente con una diversidad media de 1−Jaccard de 0,83–0,89 entre preguntas del mismo intent (los humanos reales del paper alcanzan ~0,94) y una tasa de aceptación del 92/96 tras aplicar guardrails. Es relevante ahora porque la simulación de usuario de alta fidelidad es un cuello de botella para evaluar asistentes médicos conversacionales y para generar datos de entrenamiento multi-turno a escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA (PEFT) |
| Parametros totales | Aproximadamente 8.000 millones en el modelo base; el adaptador LoRA añade un subconjunto no especificado en la informacion disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens usados en entrenamiento; la longitud nativa del base Qwen3-8B no se detalla en la informacion disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | Portugues (pt), variante brasileña |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA PEFT); requiere el base Qwen/Qwen3-8B-Base en bf16 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B-Base, un transformer decoder-only de aproximadamente 8.000 millones de parametros. El ajuste es un LoRA de rango 32 y alpha 32 sobre las proyecciones de atencion (q, k, v, o) y las proyecciones MLP (gate, up, down), entrenado con TRL 1.17.1 en bf16 con atencion sdpa. La innovacion clave no esta en la arquitectura sino en la formulacion del objetivo: se sigue la receta "Flipping the Dialogue", en la que el modelo aprende a producir el turno del usuario y la perdida se calcula exclusivamente sobre esa completion, dejando el mensaje de sistema (el intent) fuera del calculo.

Los datos provienen de 33.957 preguntas unicas de pacientes del portal Doctoralia Brasil, cubriendo 62 patologias, deduplicadas mediante 7-gram y divididas 90/5/5 por hilo. El entrenamiento duro 3 epocas (1.434 pasos, batch efectivo 64, secuencia de 2048, learning rate 2e-4 con schedule cosine y warmup de 40 pasos) en una A10G Large durante 5 horas y 4 minutos. La perdida de entrenamiento bajo de 2,31 a 1,82 y la de evaluacion de 2,153 en el paso 200 a 2,086 al final, con un minimo de 2,069 alrededor del paso 830; el autor senala un sobreajuste leve en las ultimas epocas y que 2 epocas habrian sido el punto optimo. El prompt de inferencia abre directamente en el turno del usuario, sin `add_generation_prompt`, y la generacion se detiene tanto en `<|im_end|>` como en `<|im_start|>`.

## Capacidades

- Generacion de preguntas de paciente en portugues brasileño coloquial a partir de un intent de patologia o de una descripcion de sintomas.
- Reproduccion de oralidad y erratas reales, no de texto formal de asistente.
- Generacion diversa: multiples preguntas distintas para un mismo intent, con 1−Jaccard de 0,83–0,89.
- Condicionamiento por system message: el intent se inyecta como mensaje de sistema y el modelo produce el turno de usuario correspondiente.
- Simulacion de usuario para evaluacion y generacion de datos sinteticos de dialogo medico.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un generador de un unico turno de usuario.
- No tiene modo thinking, vision ni audio.
- Fase multi-turno (preguntas de seguimiento tras la respuesta del medico) planificada pero no incluida en este checkpoint.

## Casos de uso

- Generacion de datos sinteticos de paciente para entrenar asistentes medicos conversacionales: el modelo produce preguntas realistas en portugues coloquial que pueden alimentar pipelines de SFT del lado del asistente, con diversidad controlada por temperatura y top_p.
- Evaluacion de sistemas de triaje y FAQ medicos: se generan lotes de preguntas por patologia y se mide la tasa de respuestas correctas del asistente sobre un conjunto de entrada realista y con ruido linguistico.
- Pruebas de robustez frente a erratas y oralidad: al reproducir el registro informal del paciente, permite comprobar si el asistente tolera entradas sucias antes de llegar a produccion.
- Aumento de datasets de salud en portugues: partiendo de los 62 intents del corpus Doctoralia, se pueden expandir las preguntas por patologia con un 85–90% de aceptacion tras aplicar los filtros del autor.
- Simulacion de usuario en entornos de evaluacion tipo "LLM como juez" o *user simulator*: el adaptador ocupa el rol del paciente mientras otro modelo hace de asistente, permitiendo evaluar dialogos completos de forma automatizada.
- Investigacion sobre User Language Models: sirve como caso de estudio reproducible de la receta "Flipping the Dialogue" en un dominio vertical (salud) y un idioma concreto (portugues), con hiperparametros y curvas de perdida documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor reporta metricas propias de entrenamiento y generacion:

| Metrica | Valor |
|---|---|
| Train loss (inicio → fin) | 2,31 → 1,82 |
| Eval loss (paso 200 → final) | 2,153 → 2,086 |
| Eval loss minimo | 2,069 (en torno al paso 830) |
| Muestras que pasan los guardrails | 92/96 |
| Diversidad media (1−Jaccard) mismo intent | 0,83–0,89 |
| Diversidad humana de referencia (paper) | ~0,94 |
| Pasos de entrenamiento | 1.434 (3 epocas, batch efectivo 64) |
| Hardware y tiempo | 1× A10G Large, ~5 h 04 min |

## Requisitos de hardware

- VRAM estimada para inferencia: el base Qwen3-8B en bf16 requiere aproximadamente 16 GB solo para pesos, mas KV cache y activaciones; en la practica se recomienda 24 GB o mas para secuencias de 2048 tokens. El adaptador LoRA anade una cantidad marginal de memoria.
- GPU recomendadas: A10G (usada en entrenamiento), A100 40/80 GB, H100, L40S. Para inferencia en bf16, una RTX 4090 de 24 GB es suficiente con secuencias cortas.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) requeriria cuantizacion del base, no documentada por el autor.
- Opciones de despliegue: transformers + peft (ruta oficial del model card); vLLM y TGI pueden servir el base con el adaptador si se fusionan los pesos, aunque no esta documentado en la informacion disponible; llama.cpp/Ollama requeririan convertir el base a GGUF y fusionar el LoRA, tampoco documentado.
- Latencia y throughput: no disponibles. El autor solo reporta el coste de entrenamiento (5 h 04 min en A10G).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Enfoque |
|---|---|---|---|---|---|
| UserLM-Doctoralia-Qwen3-8B-LoRA | ~8B (base) + LoRA | 2048 en entrenamiento | Portugues (BR) | Apache 2.0 | UserLM medico, dominio vertical |
| Qwen/Qwen3-8B-Base | ~8B | No disponible en la informacion proporcionada | Multilingue | Apache 2.0 | Base generalista, sin simulacion de usuario |
| UserLM del paper "Flipping the Dialogue" (Naous et al., 2025) | No disponible | No disponible | Ingles (segun el paper) | No disponible | UserLM generalista de proposito multiple |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y enfoque.

## Limitaciones y advertencias

- Solo portugues brasileño: no generaliza a portugues europeo ni a otros idiomas, y el base multilingue puede filtrar texto en arabe o tailandes a temperaturas altas, por lo que el autor recomienda descartar generaciones con alfabeto no latino.
- Cobertura limitada a las 62 patologias del dataset Doctoralia; fuera de ese conjunto el comportamiento no esta validado.
- No es una herramienta clinica: simula la pregunta del paciente y no proporciona orientacion medica; no debe usarse para diagnostico ni consejo sanitario.
- Riesgo de alucinacion y de artefactos de plantilla: el autor recomienda recortar o rechazar salidas con `<|im_start|>`, `user` o `AbsoluteConstraints…`, y re-muestrear en caso de repeticion.
- Sobreajuste leve en las ultimas epocas: el minimo de eval loss se alcanza en torno al paso 830, por lo que 2 epocas habrian sido preferibles; la calidad final es ligeramente inferior a la del mejor checkpoint intermedio.
- Tasa de aceptacion del 85–90% tras filtros para lotes grandes del mismo intent; el resto debe descartarse o regenerarse.
- El adaptador requiere el base Qwen/Qwen3-8B-Base y no funciona de forma autonoma; el repo ocupa 9,4 GB, lo que sugiere que puede incluir artefactos adicionales ademas del adaptador.
- Sin soporte multi-turno: las preguntas de seguimiento tras la respuesta del medico estan planificadas para una fase 2 no incluida en este checkpoint.
- Licencia Apache 2.0 permite uso comercial, pero el contenido medico generado debe revisarse por sesgos y calidad antes de integrarse en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RodrigoFlorencio/UserLM-Doctoralia-Qwen3-8B-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/RodrigoFlorencio/doctoralia-perguntas
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Paper "Flipping the Dialogue: Training and Evaluating User Language Models": https://arxiv.org/abs/2510.06552
- Space de seguimiento (Trackio): https://huggingface.co/spaces/RodrigoFlorencio/userlm-doctoralia-qwen3-8b-trackio

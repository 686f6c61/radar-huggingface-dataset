# muahseol/enkoa-qwen3.5-0.8b-labor-sft

## Resumen

enk oa-qwen3.5-0.8b-labor-sft es un ajuste fino (SFT) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario muahseol en Hugging Face. Se trata de un modelo de generación de texto de pequeno tamano (752 millones de parametros reales en safetensors) especializado en conversaciones de consultoria laboral en coreano. Forma parte del material docente del programa de formacion en IA "Enkoa AI Campus", concretamente del curso de deep learning, y su proposito es servir como ejemplo practico en el modulo de inferencia con vLLM.

El modelo resuelve, por tanto, un problema acotado: demostrar el flujo completo de ajuste fino supervisado sobre un modelo Qwen 3.5 de 0.8B con un corpus de consultas laborales, incluyendo la seleccion del checkpoint final mediante evaluacion con un "juez" (juicio de modelo). No esta pensado para uso en produccion ni para asesoramiento laboral real, tal como advierte el propio autor en la model card.

Su relevancia es fundamentalmente didactica: ilustra como un modelo de menos de mil millones de parametros puede adaptarse a un dominio concreto (derecho laboral coreano) mediante SFT, y como desplegarlo con vLLM. La licencia Apache 2.0 permite reutilizacion y experimentacion sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, tipo `qwen3_5_text`) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE segun los datos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer Qwen 3.5 en su variante de texto (`qwen3_5_text`), con aproximadamente 752 millones de parametros. Sobre esa base se realizo un ajuste fino supervisado (SFT) completo ("full fine-tuning", no LoRA) con un corpus de datos de consultoria laboral (노무 상담). El checkpoint final, denominado internamente `labor_sft_final`, se selecciono mediante un proceso de evaluacion con un modelo "juez" (판사 채점, juicio por modelo evaluador) entre los distintos checkpoints del entrenamiento.

Los pesos publicados estan en precision float32. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas adicionales como RLHF o DPO. Tampoco se documentan innovaciones arquitectonicas especificas mas alla de las propias del modelo base Qwen 3.5.

## Capacidades

- Generacion de texto conversacional en coreano, orientada a dialogos de consultoria laboral.
- Respuesta a preguntas sobre normativa y casuistica laboral dentro del dominio de entrenamiento.
- Mantenimiento de conversaciones multiturno (capacidad heredada del modelo base, aunque no documentada explicitamente).
- Capacidad multilingue limitada: el autor solo declara soporte de coreano.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).
- No se documentan capacidades de codigo ni matematicas mas alla de las genericas del modelo base.

## Casos de uso

- Docencia y practicas de ajuste fino: el modelo sirve como ejemplo funcional para que los alumnos del Enkoa AI Campus comprendan el ciclo completo de SFT sobre un modelo pequeno, desde la preparacion de datos hasta la seleccion del checkpoint.
- Practica de despliegue con vLLM: el repositorio esta disenado para que los estudiantes lo descarguen y levanten un servidor de inferencia con vLLM, aprendiendo configuracion de servidores, gestion de memoria y API compatible con OpenAI.
- Demostracion de evaluacion con modelo juez: permite ilustrar tecnicas de seleccion de checkpoints mediante evaluacion automatica con un LLM evaluador.
- Prototipado de asistentes de consultoria laboral en coreano: aunque no apto para produccion, sirve para explorar la viabilidad de un chatbot de dominio legal-laboral antes de escalar a modelos mayores.
- Experimentacion con modelos de menos de 1B parametros: util para investigar el rendimiento de modelos pequenos en tareas de dominio especifico y comparar con alternativas mayores.
- Base para posteriores ajustes (continued fine-tuning): al estar bajo Apache 2.0 y en safetensors, puede reutilizarse como punto de partida para otros dominios o para cuantizacion y despliegue en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 3 GB solo para pesos (752M parametros x 4 bytes), mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1 GB para pesos; en 4 bits, alrededor de 0,5 GB (aunque el autor no publica versiones cuantizadas).
- GPU recomendadas: cualquier GPU consumer moderna con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPUs de datacenter como A100 o H100, aunque estan sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 6 GB o mas de VRAM.
- Opciones de despliegue: vLLM (el autor lo menciona explicitamente como motor de inferencia del curso), transformers, y potencialmente llama.cpp u Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| enkoa-qwen3.5-0.8b-labor-sft | 752M | no disponible | Apache 2.0 | SFT dominio laboral (coreano) | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0.8B | no disponible | no disponible en la informacion | Modelo generalista | Hugging Face |
| Otros modelos pequenos de dominio legal-laboral | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente didactico: el autor advierte explicitamente que no debe usarse para consultoria real ("실제 상담에 쓰지 마십시오").
- Riesgo elevado de alucinacion en materia legal-laboral: al ser un modelo de 0.8B ajustado sobre un corpus acotado, puede generar respuestas plausibles pero incorrectas sobre normativa.
- Sesgos desconocidos: no se documenta la composicion del dataset ni procesos de mitigacion de sesgos.
- Limitacion idiomatica: solo se declara soporte de coreano; el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto no documentada: se desconoce la ventana efectiva tras el ajuste.
- Sin datos de benchmarks: imposible evaluar su calidad de forma objetiva frente a alternativas.
- Licencia Apache 2.0: permite uso comercial, pero el autor desaconseja explicitamente el uso en produccion por la naturaleza del modelo.
- Pesos en float32: el repositorio ocupa 6 GB, lo que puede ser excesivo para entornos con poco ancho de banda o almacenamiento; no se ofrecen versiones cuantizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muahseol/enkoa-qwen3.5-0.8b-labor-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B

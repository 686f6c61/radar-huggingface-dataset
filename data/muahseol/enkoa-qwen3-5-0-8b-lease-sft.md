# muahseol/enkoa-qwen3.5-0.8b-lease-sft

## Resumen

enkona-qwen3.5-0.8b-lease-sft es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario muahseol. Se trata de un modelo de generacion de texto de aproximadamente 752 millones de parametros, desarrollado como material didactico para el campus de IA de Enkoa (엔코아 AI캠퍼스). Concretamente, corresponde al ejercicio "교안 01 함께 따라하기" (leccion 01, seguir juntos) del modulo de SFT, entrenado con datos de consultas sobre contratos de alquiler (전월세, jeonwolse) con una tasa de aprendizaje de 5e-6 y un ajuste fino completo en float32.

El modelo no esta pensado para uso productivo: la propia model card advierte explicitamente que es un modelo de ejemplo para practicas y que no debe emplearse en asesoramiento real. Su proposito principal es servir como artefacto que los alumnos descargan y levantan con vLLM durante el modulo de motores de inferencia del curso.

Por su tamano reducido y su licencia Apache 2.0, resulta util como caso de estudio de fine-tuning completo sobre un modelo pequeno, aunque su ambito linguistico declarado se limita al coreano y su dominio de especializacion es muy acotado (consultas de alquiler).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (qwen3_5_text) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de la familia Qwen 3.5 con arquitectura de texto (tag qwen3_5_text). Sobre esa base se aplico un ajuste fino completo (full fine-tuning), no LoRA ni QLoRA, con tasa de aprendizaje 5e-6 y pesos en float32. El dataset de entrenamiento son datos de consultas sobre contratos de alquiler (전월세 상담) procedentes del material de practicas del curso.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO posteriores. Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio ajuste supervisado. El repositorio ocupa 6.0 GB, coherente con pesos en float32 para un modelo de 752 millones de parametros.

## Capacidades

- Generacion de texto conversacional en coreano, orientada a dialogos de consulta sobre alquiler (jeonwolse).
- Respuesta a preguntas dentro del dominio acotado de contratos de arrendamiento, segun los datos de entrenamiento.
- Capacidad base de Qwen3.5-0.8B para generacion de texto general (heredada del modelo original, aunque el ajuste la especializa).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al coreano segun la etiqueta de idioma declarada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Practicas de fine-tuning supervisado: el modelo sirve como resultado de referencia del ejercicio de SFT del curso, permitiendo a los alumnos comparar su propio entrenamiento con el del instructor.
- Despliegue con vLLM en laboratorio: el repositorio esta disenado para descargarse y levantarse como servidor con vLLM durante el modulo de motores de inferencia, sirviendo de ejemplo practico de puesta en produccion.
- Demostracion de ajuste completo en float32: util para ilustrar el coste de memoria y almacenamiento de un full fine-tuning frente a tecnicas parametro-eficientes.
- Prototipado de asistentes de dominio acotado: permite experimentar con un chatbot de consultas de alquiler en coreano antes de escalar a un modelo mayor.
- Evaluacion de calidad de datos de dominio: sirve para estudiar como un dataset pequeno y especifico modifica el comportamiento de un modelo base pequeno.
- Estudio de transferencia linguistica: al estar especializado solo en coreano, permite analizar como el ajuste afecta al rendimiento en otros idiomas del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 3 GB solo para pesos (752 M parametros x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en float16/bfloat16: aproximadamente 1,5 GB para pesos; en cuantizacion de 8 bits, en torno a 0,8 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en precision reducida; para float32 se recomienda 12 GB o mas.
- Cabe en GPU consumer: si, en la mayoria de tarjetas modernas con 8 GB o mas.
- Opciones de despliegue: vLLM (mencionado explicitamente en la model card como motor de inferencia del curso), transformers; otras opciones como llama.cpp, Ollama o TGI no estan documentadas para este modelo.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| enkona-qwen3.5-0.8b-lease-sft | 752 M | no disponible | ko | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | multilingue | no disponible | Hugging Face |
| Otros ajustes SFT de Qwen 3.5 0.8B | ~0,8 B | no disponible | segun ajuste | segun autor | Hugging Face |

La comparativa se limita al modelo base, ya que no se dispone de datos de benchmarks ni de otros ajustes comparables documentados en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente didactico: la model card advierte de forma explicita que es un modelo de ejemplo y que no debe usarse en asesoramiento real ("실제 상담에 쓰지 마십시오").
- Dominio muy acotado: entrenado solo con datos de consultas de alquiler, por lo que su rendimiento fuera de ese ambito sera limitado.
- Idioma restringido: la etiqueta de idioma declara unicamente coreano; el comportamiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: al ser un modelo pequeno y especializado, puede generar respuestas plausibles pero incorrectas sobre normativa de alquiler.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la propia model card desaconseja el uso productivo por su naturaleza de ejemplo.
- Contexto y cuantizacion: no se especifican la longitud de contexto ni los formatos de cuantizacion soportados, lo que limita la planificacion de despliegue.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/muahseol/enkoa-qwen3.5-0.8b-lease-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B

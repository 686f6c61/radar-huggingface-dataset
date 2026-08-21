# DGurgurov/OpenThinker3-7B-SFT-GRPO-ES

## Resumen

OpenThinker3-7B-SFT-GRPO-ES es un modelo de razonamiento en español desarrollado por DGurgurov como parte del pipeline de adaptación de razonamiento en dos etapas ReasonXL. Parte del modelo base `open-thoughts/OpenThinker-7B`, que a su vez es una fine-tune de Qwen2.5-7B-Instruct sobre el dataset OpenThoughts3-1.2M. La primera etapa aplica supervisión fina (SFT) sobre trazas de razonamiento en español del dataset `toroe/ReasonXL-SFT` para desplazar el idioma de razonamiento del inglés al español. La segunda etapa, que corresponde a este modelo, aplica aprendizaje por refuerzo con el algoritmo Dr. GRPO sobre problemas matemáticos verificables, con el objetivo de recuperar la calidad de razonamiento perdida durante el SFT sin sacrificar el cumplimiento del idioma objetivo.

El modelo está pensado para investigadores y desarrolladores que necesitan capacidades de razonamiento matemático y lógico en español, manteniendo la arquitectura de 7B parámetros del modelo base. Aunque el repositorio reporta un tamaño de 91,4 GB, el número de parámetros indicado en safetensors (951.952.064) resulta inconsistente con el tamaño esperado de un modelo de 7B, por lo que se recomienda verificar este dato antes de su uso en producción. La licencia no está especificada, lo que limita su adopción comercial sin consulta previa al autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5-7B-Instruct) |
| Parametros totales | no disponible (el repositorio reporta 951.952.064 en safetensors, inconsistente con el tamaño de 7B del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Español (objetivo de razonamiento); el modelo base soporta múltiples idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con atención estándar y sin mezcla de expertos. El entrenamiento sigue un pipeline de dos etapas: primero, una etapa de supervisión fina (SFT) sobre el dataset `toroe/ReasonXL-SFT`, que contiene trazas de razonamiento en español, para cambiar el idioma de razonamiento del modelo base (inglés) al español. En segundo lugar, se aplica aprendizaje por refuerzo con el algoritmo Dr. GRPO, utilizando una recompensa compuesta sobre problemas matemáticos verificables. El objetivo de esta segunda etapa es recuperar la calidad de razonamiento que se pierde durante el SFT, manteniendo a la vez la adherencia al idioma objetivo. Los detalles completos de la formulación de recompensa, la metodología y los resultados de evaluación se publicarán próximamente según la model card.

## Capacidades

- Razonamiento matemático y lógico en español, con cadenas de pensamiento generadas en este idioma.
- Generación de texto en español, aunque el foco principal es el razonamiento.
- Soporte de problemas matemáticos verificables, gracias al entrenamiento con recompensa compuesta.
- Capacidad multilingüe heredada del modelo base Qwen2.5-7B-Instruct, aunque el fine-tune está orientado al español.
- No se menciona soporte de tool calling, function calling, visión ni audio en la información disponible.

## Casos de uso

- Asistencia educativa en matemáticas: el modelo puede explicar paso a paso la resolución de problemas algebraicos, geométricos o de cálculo en español, sirviendo como tutor virtual para estudiantes de habla hispana.
- Generación de ejercicios y soluciones: permite crear automáticamente problemas matemáticos con sus soluciones razonadas, útil para plataformas de e-learning o generación de contenido didáctico.
- Razonamiento lógico en sistemas de preguntas y respuestas: puede integrarse en chatbots o asistentes que requieran resolver problemas de lógica o razonamiento cuantitativo en español.
- Análisis de datos y verificación de resultados: dado su entrenamiento con recompensa sobre problemas verificables, puede utilizarse para comprobar la validez de soluciones matemáticas generadas por otros modelos.
- Investigación en adaptación de razonamiento multilingüe: sirve como punto de partida para estudiar cómo el aprendizaje por refuerzo afecta a la calidad del razonamiento tras un cambio de idioma.
- Prototipado de agentes de razonamiento en español: aunque no se documenta tool calling, puede combinarse con frameworks externos para tareas que requieran razonamiento multi-paso en este idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este modelo específico (OpenThinker3-7B-SFT-GRPO-ES). El modelo base `open-thoughts/OpenThinker3-7B` reporta mejoras sobre OpenThinker-7B y OpenThinker2-7B, y supera a DeepSeek-R1-Distill-Qwen-7B y Llama-3.1-Nemotron-Nano-8B-v1, según la búsqueda web, pero no se proporcionan cifras concretas en los materiales consultados. Se recomienda consultar el paper de ReasonXL (arXiv:2604.12378) cuando esté disponible para obtener resultados de evaluación detallados.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de aproximadamente 7B parámetros, se estima un consumo de unos 14 GB en precisión fp16, y unos 7 GB en cuantización de 4 bits (valores orientativos, no confirmados por el autor).
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM para inferencia en fp16 (por ejemplo, RTX 4090, A100 40GB, H100). Con cuantización de 4 bits podría ejecutarse en GPUs consumer de 8 GB, como RTX 3060 o RTX 4060.
- Opciones de despliegue: al ser un modelo con pesos en safetensors, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se documenta compatibilidad oficial.
- Latencia y throughput: no disponibles. Dependerán del hardware y del backend de inferencia utilizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThinker3-7B-SFT-GRPO-ES | ~7B (sin confirmar) | no disponible | Razonamiento en español con RL | no disponible | HuggingFace |
| OpenThinker3-7B (base) | 7B | no disponible | Razonamiento general (SFT) | no disponible | HuggingFace |
| DeepSeek-R1-Distill-Qwen-7B | 7B | 32K (típico de Qwen) | Razonamiento general | MIT | HuggingFace |
| Llama-3.1-Nemotron-Nano-8B-v1 | 8B | 128K | Razonamiento y agente | NVIDIA Open Model License | HuggingFace |

La comparativa se basa en datos públicos de los modelos base; no se dispone de resultados de rendimiento específicos para el modelo GRPO-ES.

## Limitaciones y advertencias

- El número de parámetros reportado en safetensors (951.952.064) es inconsistente con el tamaño esperado de un modelo de 7B; se recomienda verificar la integridad del repositorio antes de su uso.
- No se han publicado resultados de evaluación ni benchmarks para este modelo concreto; su rendimiento real en tareas de razonamiento en español es desconocido.
- La licencia no está especificada, lo que impide determinar si puede utilizarse en aplicaciones comerciales sin autorización explícita del autor.
- El entrenamiento se centra en problemas matemáticos verificables; puede presentar alucinaciones o errores en dominios fuera de ese ámbito.
- El modelo está orientado al español, pero no se garantiza un rendimiento óptimo en otros idiomas, aunque el modelo base sea multilingüe.
- Al ser un modelo de razonamiento, puede generar cadenas de pensamiento largas que aumenten la latencia en producción.
- No se documenta soporte para tool calling ni integración con agentes, lo que limita su uso en pipelines complejos sin adaptación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DGurgurov/OpenThinker3-7B-SFT-GRPO-ES
- Modelo SFT previo: https://huggingface.co/DGurgurov/OpenThinker3-7B-SFT-ES
- Modelo base OpenThinker-7B: https://huggingface.co/open-thoughts/OpenThinker-7B
- Modelo base OpenThinker3-7B: https://huggingface.co/open-thoughts/OpenThinker3-7B
- Dataset ReasonXL-SFT: https://huggingface.co/datasets/toroe/ReasonXL-SFT
- Paper ReasonXL (arXiv): https://arxiv.org/abs/2604.12378
- Repositorio open-thoughts: https://github.com/open-thoughts/open-thoughts

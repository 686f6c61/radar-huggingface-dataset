# IITM-2026T3-DSAI-GROUP2/qwen3-4b-ai-tutor-lora-latest

## Resumen

El modelo `qwen3-4b-ai-tutor-lora-latest` es un adaptador LoRA (Low-Rank Adaptation) publicado por el grupo `IITM-2026T3-DSAI-GROUP2` sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. Se trata de un ajuste fino supervisado (SFT) mediante la librería PEFT y TRL, orientado por su nombre a tareas de tutoría educativa con IA. El repositorio contiene únicamente los pesos del adaptador (0,1 GB), no el modelo completo, por lo que su uso requiere descargar e instanciar primero el modelo base.

El modelo hereda la arquitectura, el tokenizador y la ventana de contexto del Qwen3-4B-Instruct-2507, un transformer decoder-only de 4 mil millones de parámetros. El adaptador modifica un subconjunto de pesos para especializar el comportamiento conversacional hacia el dominio de la tutoría, manteniendo intacta la mayor parte de la capacidad general del modelo base.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un ejemplo típico de adaptador LoRA de bajo coste computacional publicado en Hugging Face, con una model card que no documenta datos de entrenamiento, hiperparámetros, evaluación ni licencia. Cualquier evaluación rigurosa debe hacerse contra el modelo base y con validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen3-4B-Instruct-2507); adaptador LoRA sobre atención y/o proyecciones lineales (detalle no disponible) |
| Parametros totales | 4 mil millones en el modelo base; tamaño del adaptador no disponible (repo de 0,1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base, valor no confirmado) |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors y se aplica sobre el base en fp16/bf16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |
| Libreria | peft 0.21.2, transformers, trl |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tipo de entrenamiento | SFT (supervised fine-tuning) con LoRA |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4 mil millones de parámetros. La técnica empleada es LoRA, que congela los pesos del modelo base e inserta matrices de bajo rango entrenables en determinadas capas lineales, reduciendo drásticamente el número de parámetros actualizables y el coste de entrenamiento. El entrenamiento se realizó con TRL (probablemente `SFTTrainer`) y se empaquetó con PEFT 0.21.2.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, la configuración de LoRA (rango, alpha, capas objetivo), la tasa de aprendizaje ni si se aplicaron técnicas de alineación adicionales como DPO o RLHF. La model card es una plantilla sin rellenar en la mayoría de sus secciones, por lo que todos estos datos deben considerarse no disponibles.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Instruct.
- Especialización presumible en diálogo de tutoría educativa (según el nombre del repositorio), sin documentación que lo respalde.
- Razonamiento y matemáticas básicas propias de un modelo de 4B parámetros (capacidad no verificada en este adaptador).
- Generación de código y texto técnico (capacidad heredada del base, no evaluada).
- Soporte de tool calling y function calling: no disponible de forma explícita en la información proporcionada; depende del modelo base.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Prototipado de tutores conversacionales: el adaptador puede cargarse sobre Qwen3-4B-Instruct-2507 para experimentar con respuestas de estilo educativo en entornos de investigación, sin necesidad de reentrenar el modelo completo.
- Evaluación comparativa de LoRA: sirve como caso de estudio para medir el impacto de un SFT ligero sobre un modelo Instruct de 4B en tareas de diálogo guiado.
- Despliegue en hardware modesto: al requerir solo el base de 4B más un adaptador de 0,1 GB, puede ejecutarse en una GPU consumer con cuantización del base (por ejemplo, 4 bits) para demos locales.
- Generación de material didáctico asistido: uso experimental para redactar explicaciones, ejercicios o resúmenes, siempre con revisión humana dado el riesgo de alucinación.
- Investigación académica sobre ajuste fino eficiente: el repositorio documenta el flujo PEFT + TRL y puede reutilizarse como plantilla para nuevos adaptadores.
- Integración en pipelines de transformers: mediante `PeftModel.from_pretrained` puede incorporarse a servicios de generación de texto existentes basados en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en fp16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y KV cache (10-12 GB en la práctica).
- VRAM estimada con cuantización 4 bits del base: aproximadamente 3-4 GB, más overhead.
- El adaptador LoRA añade un consumo marginal (repo de 0,1 GB).
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para fp16 sin cuantizar; RTX 3090, RTX 4080 o GPUs con 12-16 GB para cuantización 8 bits.
- Cabe en GPU consumer: sí, especialmente con cuantización 4 u 8 bits (RTX 3060 12 GB, RTX 4070, etc.).
- Opciones de despliegue: transformers + peft (soporte nativo del adaptador), vLLM con soporte LoRA, TGI con adaptadores; llama.cpp/Ollama requerirían fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen3-4b-ai-tutor-lora-latest | 4B (base) + LoRA | no disponible | no disponible | safetensors (adaptador) | Adaptador SFT sin documentación ni evaluación |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | no disponible en esta ficha | no disponible en esta ficha | safetensors | Modelo base oficial, sin especialización en tutoría |
| Adaptadores LoRA comunitarios sobre Qwen3-4B | 4B (base) + LoRA | variable | variable | safetensors | Calidad y documentación muy heterogéneas |
| Modelos Instruct de ~4B (p. ej. familias Llama 3.2 3B o Phi-3.5-mini) | 3-4B | variable | variable | safetensors/GGUF | Alternativas generalistas sin adaptador educativo |

## Limitaciones y advertencias

- La model card está sin completar: no hay información sobre datos, hiperparámetros, evaluación ni licencia, lo que impide validar la calidad del ajuste.
- Licencia no disponible: no puede asumirse uso comercial; debe consultarse la licencia del modelo base Qwen3-4B-Instruct-2507 y del adaptador por separado.
- Riesgo de alucinación inherente a un modelo de 4B parámetros, potencialmente agravado por un SFT sobre datos no documentados.
- Sesgos desconocidos: al no documentarse el dataset, no es posible evaluar sesgos de género, idioma, cultura o dominio educativo.
- Idiomas soportados no confirmados; el rendimiento fuera del idioma de entrenamiento (presumiblemente inglés) es incierto.
- El adaptador no es autónomo: requiere descargar el modelo base y aplicar PEFT, lo que añade complejidad de despliegue frente a un modelo fusionado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora sobre el modelo base en tareas de tutoría.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/IITM-2026T3-DSAI-GROUP2/qwen3-4b-ai-tutor-lora-latest
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700

# farid-amirov/novashop-support-lora

## Resumen

`farid-amirov/novashop-support-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante SFT (supervised fine-tuning) sobre el modelo base `unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit`, una versión del Meta Llama 3.1 8B Instruct optimizada por Unsloth y cuantizada en 4 bits con bitsandbytes. El adaptador se publica como un repositorio PEFT de tan solo 0,2 GB, lo que refleja que únicamente contiene los pesos delta de las capas de bajo rango y no el modelo completo. El nombre del repositorio sugiere un ajuste orientado a atención al cliente para una tienda ("novashop-support"), aunque la model card no documenta explícitamente el dominio ni los datos de entrenamiento.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B, con 8.000 millones de parámetros, atención con GQA, RoPE y una ventana de contexto de 128.000 tokens en el modelo base. Al tratarse de un adaptador, sus capacidades efectivas dependen del modelo base sobre el que se aplique; el adaptador añade una especialización de estilo y comportamiento conversacional, no nuevas capacidades fundacionales.

La relevancia de esta ficha es limitada pero ilustrativa: muestra el patrón habitual de publicación de adaptadores LoRA de bajo coste en Hugging Face, donde el autor no documenta datos, hiperparámetros ni evaluación. Es útil como ejemplo de cómo evaluar críticamente un adaptador de terceros antes de integrarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Llama 3.1 8B Instruct |
| Parámetros totales | 8.000 millones (modelo base); el adaptador LoRA no declara su rango ni número de parámetros entrenables |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base (no confirmado para el adaptador) |
| Tipos de cuantización | El modelo base se distribuye en 4 bits (bnb-4bit); el adaptador en safetensors de precisión completa |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en formato transformers/bnb-4bit |
| Librería | peft |
| Versión PEFT declarada | 0.21.2 |
| Tamaño del repositorio | 0,2 GB |
| Pipeline | text-generation |
| Modelo base | unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA, que congela los pesos del modelo base e inserta matrices de bajo rango en determinadas capas lineales (habitualmente las proyecciones de atención y MLP). El entrenamiento se realizó con SFT (supervised fine-tuning) usando el stack de Unsloth, TRL y Transformers, según las etiquetas del repositorio. El modelo base es la variante Instruct de Llama 3.1 8B, que emplea un transformer decoder-only con atención agrupada por consultas (GQA), codificación posicional rotatoria (RoPE) y activación SwiGLU, y que fue sometido a un pipeline de post-entrenamiento con SFT y RLHF por parte de Meta.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la configuración de hiperparámetros (rango LoRA, alpha, dropout, tasa de aprendizaje, épocas) ni sobre si se aplicaron técnicas adicionales como DPO o decodificación especulativa. La model card es la plantilla por defecto de Hugging Face sin rellenar, por lo que todos los campos de detalles de entrenamiento aparecen como "[More Information Needed]". La única referencia técnica citable es la del artículo de Lacoste et al. (2019) sobre impacto ambiental, incluida en la plantilla.

## Capacidades

- Generación de texto conversacional en el dominio del modelo base (Llama 3.1 8B Instruct), presumiblemente especializada en atención al cliente de una tienda según el nombre del repositorio.
- Razonamiento y respuesta multi-turno heredados del modelo base.
- Generación de código y matemáticas básicas, limitadas por el tamaño de 8B del modelo base.
- Soporte de tool calling y function calling heredado de Llama 3.1 Instruct (no verificado tras el ajuste LoRA).
- Capacidades multilingües del modelo base (oficialmente 8 idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), aunque el adaptador no declara idiomas.
- No se ha documentado ninguna capacidad especial adicional (thinking mode, visión, audio) ni se han verificado las anteriores específicamente para el adaptador.

## Casos de uso

- Atención al cliente automatizada: el adaptador podría emplearse para respuestas de soporte en una tienda, aprovechando la ventana de 128.000 tokens del modelo base para mantener contexto de conversaciones largas con historial de pedidos.
- Clasificación y enrutado de tickets: usar el modelo ajustado para etiquetar consultas de clientes por categoría (devoluciones, envíos, facturación) en un pipeline de triaje.
- Generación de respuestas FAQ: cubrir preguntas frecuentes con un tono consistente, siempre que se valide contra el modelo base sin adaptador para descartar regresiones.
- Prototipado rápido de asistentes verticales: el tamaño de 0,2 GB del adaptador permite experimentar con distintas especializaciones sin duplicar el modelo base.
- Evaluación comparativa de adaptadores LoRA: servir como caso de estudio para medir el impacto de un SFT de bajo coste frente al modelo base en tareas de soporte.
- Despliegue en entornos con recursos limitados: al combinarse con el modelo base en 4 bits, puede ejecutarse en una única GPU consumer de 24 GB (RTX 3090/4090) para inferencia de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, y no se dispone de comparaciones con el modelo base ni con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4 bits ocupa aproximadamente 4,5-5 GB de pesos; con overhead de activaciones y KV cache para contextos moderados, se estiman 6-10 GB para secuencias de hasta 8.000 tokens.
- GPU recomendadas: RTX 3090, RTX 4090, A10G, L4 para inferencia en 4 bits; A100 40/80 GB o H100 para contextos largos (32.000-128.000 tokens) o mayor concurrencia.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3090 y RTX 4090, siempre con el modelo base cuantizado.
- Opciones de despliegue: Transformers + PEFT (carga directa del adaptador), vLLM con soporte LoRA, TGI con adaptadores, llama.cpp/Ollama solo si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| farid-amirov/novashop-support-lora | 8B (base) + LoRA | 128k (base) | Adaptador PEFT | no disponible | Hugging Face |
| Meta-Llama-3.1-8B-Instruct | 8B | 128k | Modelo completo | Llama 3.1 Community License | Hugging Face, Meta |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32k | Modelo completo | Apache 2.0 | Hugging Face, Mistral |
| Qwen2.5-7B-Instruct | 7,6B | 128k | Modelo completo | Apache 2.0 | Hugging Face, Alibaba |

El adaptador no aporta mejoras verificables frente al modelo base y carece de la documentación y garantías de licencia de las alternativas completas. Su utilidad práctica está supeditada a una evaluación propia contra el modelo base sin ajustar.

## Limitaciones y advertencias

- La model card está sin completar: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni uso previsto, lo que impide auditar el adaptador.
- Licencia no declarada: no se puede confirmar el uso comercial; además, el modelo base Llama 3.1 está sujeto a la Llama 3.1 Community License, con restricciones propias (por ejemplo, la cláusula de 700 millones de usuarios mensuales).
- Riesgo de sobreajuste al dominio de "soporte de tienda": el adaptador puede degradar el rendimiento general del modelo base fuera de ese contexto.
- Riesgo de alucinación inherente al modelo base de 8B, no mitigado por el ajuste LoRA.
- Idiomas soportados no declarados; se desconoce si el ajuste conserva el multilingüismo del modelo base.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.
- El adaptador requiere el modelo base específico de Unsloth en 4 bits; aplicarlo sobre otras variantes puede producir incompatibilidades.
- No se han documentado sesgos ni evaluaciones de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/farid-amirov/novashop-support-lora
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit
- Modelo original Meta Llama 3.1: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de Unsloth: https://docs.unsloth.ai

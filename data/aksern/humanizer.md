# aksern/humanizer

## Resumen

aksern/humanizer es un modelo de lenguaje causal de 3 000 millones de parámetros, ajustado por el desarrollador aksern a partir de Llama 3.2 3B. Su tarea no es la conversación general, sino la reescritura de texto: recibe prosa generada por un modelo de IA y la reformula para que resulte menos formulaica, repetitiva y mecánica, intentando conservar la información original.

El modelo se apoya en la arquitectura Llama 3.2 (transformer decoder-only) y se ha afinado sobre `unsloth/Llama-3.2-3B-bnb-4bit`, una versión cuantizada en 4 bits del modelo base. La model card no detalla el conjunto de datos, el número de tokens de entrenamiento ni si se aplicaron técnicas de alineamiento como RLHF o DPO.

Es relevante ahora porque un modelo de 3B permite ejecutar tareas de post-edición en local o en hardware modesto, y porque la "humanización" de texto se ha convertido en una demanda recurrente en flujos de publicación, marketing y gestión de contenido. No obstante, no se han publicado benchmarks ni una descripción técnica del ajuste fino, por lo que su evaluación rigurosa queda pendiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, familia Llama 3.2 |
| Parámetros totales | 3 000 millones (3B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama 3.2 3B soporta hasta 128 000 tokens |
| Tipos de cuantización | No se publican variantes cuantizadas oficiales; el ejemplo de uso emplea bfloat16 y el ajuste fino se realizó sobre una base en 4 bits (`unsloth/Llama-3.2-3B-bnb-4bit`) |
| Idiomas soportados | No disponible; la model card advierte que el rendimiento puede variar según el idioma |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 3B: un transformer decoder-only con atención causal, atención de consultas agrupadas (GQA), embeddings rotatorios (RoPE) y activación SwiGLU. El modelo es un ajuste fino supervisado del checkpoint `meta-llama/Llama-3.2-3B`, según declara el autor, aunque el entrenamiento se realizó sobre `unsloth/Llama-3.2-3B-bnb-4bit`, lo que sugiere una estrategia de QLoRA o LoRA sobre pesos cuantizados. La model card no especifica la metodología exacta.

No hay información pública sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El comportamiento declarado es el de un modelo de transformación de texto: recibe un fragmento en el turno de usuario y genera una reescritura, sin que se documente un modo conversacional o de razonamiento explícito. El repositorio ocupa 12,9 GB, un tamaño superior al esperado para 3B en bf16 (unos 6,4 GB), lo que podría indicar la inclusión de estados de optimizador o de múltiples checkpoints; este extremo no está confirmado.

## Capacidades

- Reescritura de texto orientada a "humanización": transforma prosa formulaica generada por IA en un registro más natural.
- Preservación del significado como objetivo declarado, sin garantía formal de fidelidad semántica.
- Generación de texto causal estándar heredada del modelo base.
- Uso mediante plantilla de chat: el ejemplo oficial introduce el texto a reescribir en el turno `user` y genera la continuación.
- Ajustes de muestreo recomendados por el autor: `temperature=0.6`, `top_p=0.9`, `max_new_tokens=120`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe no documentada; la model card solo advierte que la calidad depende del idioma.

## Casos de uso

- Reescritura de borradores generados por LLM para blogs y documentación: el modelo recibe el texto y devuelve una versión con menor carga de clichés y estructuras repetitivas, adecuada para una revisión editorial posterior.
- Post-edición de contenidos de marketing: permite reducir fórmulas como "en el vertiginoso panorama tecnológico actual" y acercar el texto a un registro más directo antes de su publicación.
- Limpieza estilística en flujos de publicación automatizados: puede insertarse como paso intermedio entre la generación y la revisión humana, con una ventana de 128 000 tokens heredada del modelo base para artículos largos.
- Herramienta local de edición: al tratarse de un modelo de 3B, puede desplegarse en una estación de trabajo con GPU de consumo, sin enviar el texto a servicios externos.
- Generación de variantes de un mismo texto: con `temperature=0.6` y `top_p=0.9` se pueden producir varias reescrituras para pruebas A/B de titulares, correos o descripciones de producto.
- Reducción de repeticiones en respuestas de chatbots: se puede aplicar como capa de post-procesado sobre las salidas de otro modelo para disminuir la redundancia antes de mostrarlas al usuario.
- Experimentación académica con modelos ligeros de humanización: sirve como punto de partida para estudiar técnicas de reescritura controlada con presupuesto de cómputo reducido.
- Normalización de estilo en corpus sintéticos: útil para diversificar la forma de datasets generados por IA antes de reutilizarlos, siempre que no se persiga evadir detectores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 6,5 GB solo para pesos; con caché KV y activaciones, entre 8 y 10 GB para contextos moderados.
- VRAM estimada en 4 bits (si se convierte a GPTQ/AWQ/GGUF Q4): aproximadamente 2 GB de pesos y 3-4 GB en total.
- GPU recomendadas para inferencia individual: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, L4, A10G.
- GPU para despliegue con batching: L40S, A100 40/80 GB, H100.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización de 4 bits, y en 12 GB o más en bf16.
- Opciones de despliegue: `transformers` (ejemplo oficial), vLLM, TGI y, previa conversión a GGUF, llama.cpp u Ollama.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aksern/humanizer | 3B | No documentado (128 000 tokens en el modelo base) | Reescritura/humanización de texto | openmdw-1.1 | HuggingFace |
| meta-llama/Llama-3.2-3B-Instruct | 3B | 128 000 tokens | Conversación general, instrucciones | Llama 3.2 Community License | HuggingFace, ecosistema amplio |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32 768 tokens nativos (128K con YaRN) | Conversación general, multilingüe | Apache 2.0 | HuggingFace |
| google/gemma-2-2b-it | 2,6B | 8 192 tokens | Conversación general | Gemma Terms of Use | HuggingFace |

La comparación se limita a parámetros, contexto, licencia y disponibilidad, ya que no existen benchmarks publicados del modelo analizado. Los datos de los modelos alternativos proceden de su documentación oficial.

## Limitaciones y advertencias

- La calidad de la humanización depende del texto de entrada, del idioma y de los parámetros de generación; no hay evaluación sistemática publicada.
- El modelo puede alterar el significado original al reescribir; la preservación de la información es un objetivo, no una garantía.
- No se garantiza que el texto generado evada detectores de IA; la humanización y la evasión de detección son tareas distintas, como advierte el propio autor.
- El rendimiento multilingüe no está documentado y probablemente sea desigual fuera del inglés.
- No hay benchmarks que permitan estimar su calidad frente a alternativas; su uso en producción conlleva un riesgo de evaluación no cuantificado.
- Hereda los sesgos del modelo base Llama 3.2 y de los datos de ajuste fino, que no se han descrito.
- Existe riesgo de alucinación: al reformular, el modelo puede introducir información no presente en el texto original.
- La licencia openmdw-1.1 debe revisarse con detalle antes de un uso comercial; la model card no aclara obligaciones de atribución ni restricciones adicionales.
- El tamaño del repositorio (12,9 GB) no coincide con el esperado para 3B en bf16, lo que conviene verificar antes de descargarlo en entornos con almacenamiento limitado.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento, por lo que no es adecuado como sustituto de un modelo instruct generalista.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aksern/humanizer
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Base cuantizada empleada en el ajuste: https://huggingface.co/unsloth/Llama-3.2-3B-bnb-4bit
- Space de un humanizador no relacionado (conversantech): https://huggingface.co/spaces/conversantech/humanizer-ai
- Repositorio de un humanizador basado en Gemini, no relacionado: https://github.com/dixon2004/ai-humanizer
- Comparativa de herramientas humanizadoras, no relacionada: https://www.humanizeai.pro/blog/top-6-ai-humanizer-tools
- Comparativa de herramientas humanizadoras, no relacionada: https://ainaturalwrite.com/blog/best-ai-humanizer-tools-2026
- Herramienta humanizadora en línea, no relacionada: https://humanizer.gg/

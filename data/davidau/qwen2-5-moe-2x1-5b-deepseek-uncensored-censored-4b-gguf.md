# DavidAU/Qwen2.5-MOE-2X1.5B-DeepSeek-Uncensored-Censored-4B-gguf

## Resumen
El modelo `Qwen2.5-MOE-2X1.5B-DeepSeek-Uncensored-Censored-4B` es un modelo de lenguaje de tipo Mixture of Experts (MoE) creado por el usuario DavidAU mediante técnicas de fusión de modelos (mergekit). Combina dos modelos Qwen 2.5 de 1.5B parámetros, uno en su variante DeepSeek "censurada/normal" y otro en su variante "uncensored", dando como resultado un modelo de aproximadamente 4.089 millones de parámetros totales gracias al mecanismo de "shared expert" característico de las arquitecturas MoE de Qwen.

El modelo está diseñado para tareas de generación de texto, razonamiento, resolución de problemas matemáticos y lógicos, así como escritura creativa (narrativa, guiones, brainstorming). Su configuración poco convencional produce un comportamiento de "pensamiento/razonamiento" que, según el autor, es más potente que el de cualquiera de los dos modelos de 1.5B por separado. Declara una longitud de contexto de 128k tokens y está disponible principalmente en formato GGUF para su uso con herramientas de inferencia local.

Es relevante por su enfoque experimental: demuestra cómo la fusión de modelos pequeños con orientaciones opuestas (censurado vs. descensurado) puede generar capacidades emergentes de razonamiento, aunque con limitaciones propias de su reducido tamaño. Su licencia Apache 2.0 facilita su uso comercial, y su reducido tamaño lo hace accesible en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en transformer, derivada de Qwen 2.5 |
| Parámetros totales | 4.089.327.104 (aprox. 4B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 128k tokens (según model card) |
| Tipos de cuantización | GGUF en varias cuantizaciones (IQ4/Q4 o superiores recomendadas; también Q6/Q8 y F16) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 36.5 GB con múltiples cuantizaciones) |

## Arquitectura y entrenamiento
El modelo es el resultado de una fusión (merge) de dos modelos Qwen 2.5 de 1.5B parámetros, uno en versión DeepSeek "censurada/normal" y otro "uncensored", utilizando la herramienta mergekit. La arquitectura resultante es un MoE con un "shared expert" que explica que el total de parámetros supere los 4B (equivalente a aproximadamente 2.5 modelos de 1.5B). Según el autor, la configuración produce un comportamiento de razonamiento más fuerte que el de cada modelo base por separado.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo base DeepSeek Qwen 1.5B está a su vez basado en el modelo Qwen 1.5B Math, lo que inclina al modelo fusionado hacia tareas de matemáticas, lógica y razonamiento "científico". No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Generación de texto general y conversacional.
- Razonamiento y "thinking" explícito, con capacidad de producir cadenas de pensamiento más elaboradas que los modelos base de 1.5B.
- Resolución de problemas matemáticos y lógicos, favorecida por su ascendencia del modelo Qwen 1.5B Math.
- Escritura creativa: generación de historias, tramas, guiones, ficción y brainstorming.
- Resolución de acertijos y problemas de razonamiento lateral.
- Capacidades multilingües limitadas a inglés (en) y chino (zh).
- Comportamiento parcialmente descensurado (uncensored) gracias a la combinación de las dos variantes.
- No se documenta soporte explícito de tool calling, function calling ni capacidades de agente multi-paso.
- No dispone de capacidades de visión ni audio.

## Casos de uso
- **Generación de ficción y narrativa**: el modelo puede producir tramas, historias cortas y guiones gracias a su orientación hacia la escritura creativa y su modo de razonamiento. Es adecuado para lluvias de ideas y borradores que luego se refinan.
- **Resolución de problemas matemáticos y lógicos**: su base en Qwen 1.5B Math lo hace útil para ejercicios de matemáticas, puzles y problemas de lógica, siempre con prompts detallados y contextualizados.
- **Brainstorming y generación de ideas**: puede generar listas de ideas, enfoques o soluciones para un problema dado, aunque requiere prompts específicos y puede necesitar varias generaciones para converger.
- **Asistente conversacional local**: al ser un modelo pequeño en formato GGUF, puede desplegarse en entornos con recursos limitados para conversaciones multi-turno, con contexto configurable (se recomienda 4k-8k tokens en la práctica).
- **Prototipado rápido y experimentación**: útil para investigadores que quieran explorar el comportamiento de arquitecturas MoE fusionadas y comparar respuestas censuradas vs. descensoradas en un mismo modelo.
- **Generación de contenido creativo con temperatura alta**: el autor indica que funciona bien con temperaturas de 0.4 a 0.8 e incluso superiores, lo que lo hace adecuado para explorar variaciones creativas en escritura.
- **Educación y tutoría básica**: puede explicar conceptos matemáticos o científicos sencillos, aunque con limitaciones por su tamaño y la necesidad de prompts claros.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- **VRAM estimada**: para un modelo de ~4B parámetros, se estima aproximadamente 2.5-3 GB en cuantización Q4, 4-5 GB en Q6, 5-6 GB en Q8 y ~8 GB en F16. Estas cifras son estimaciones basadas en el tamaño del modelo, no datos oficiales.
- **GPU recomendadas**: el modelo cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4090; también en GPUs profesionales como A100 o H100, aunque no son necesarias.
- **Compatibilidad con GPU de consumo**: sí, cabe en la mayoría de GPUs consumer con 6 GB o más de VRAM en cuantizaciones Q4/Q5.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio (el autor indica que la plantilla Jinja se carga por defecto), y potencialmente vLLM o TGI si se convierte a otros formatos (no confirmado). El formato principal es GGUF.
- **Latencia y throughput**: no disponibles. Al ser un modelo pequeño, se espera una latencia baja en hardware consumer, pero no se proporcionan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-MOE-2X1.5B-DeepSeek-Uncensored-Censored-4B | ~4B (MoE) | 128k | Apache 2.0 | GGUF | Fusión experimental de dos Qwen 1.5B |
| Qwen2.5-1.5B | 1.5B | 32k (típico) | Apache 2.0 | safetensors, GGUF | Modelo base, sin fusión MoE |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | 32k (típico) | MIT (según variante) | safetensors, GGUF | Modelo de razonamiento destilado |
| TinyLlama-1.1B | 1.1B | 2k-4k | Apache 2.0 | safetensors, GGUF | Modelo pequeño generalista |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer una comparación cuantitativa. La comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias
- **Tamaño reducido**: al estar compuesto por dos modelos de 1.5B, no alcanza el rendimiento de modelos de 14B o 32B; puede fallar en conocimientos culturales, referencias complejas o tareas que requieran amplio conocimiento del mundo.
- **Sesgos**: al derivar de Qwen 2.5 y DeepSeek, puede heredar sesgos presentes en los datos de entrenamiento de esos modelos; no se documentan evaluaciones de sesgo.
- **Riesgo de alucinación**: elevado en un modelo de este tamaño, especialmente en tareas de conocimiento factual y referencias culturales.
- **Idiomas**: solo soporta inglés y chino; no hay soporte para español ni otros idiomas.
- **Comportamiento errático**: el autor advierte que el modelo puede "pensar" mucho y luego no completar la tarea, requiriendo prompts detallados y a veces varias generaciones para converger.
- **Contexto práctico**: aunque declara 128k, el autor recomienda configurar el límite en 4k mínimo y 8k o más como sugerencia; el rendimiento real en contextos muy largos no está verificado.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo se distribuye "tal cual", sin garantías; el autor no ofrece soporte oficial.
- **Formato**: solo disponible en GGUF; requiere herramientas compatibles (llama.cpp, LM Studio, Ollama) y la plantilla Jinja específica para un funcionamiento correcto.
- **Naturaleza experimental**: es una fusión no oficial, sin paper ni evaluación formal; su comportamiento puede ser impredecible en producción.

## Enlaces
- [Hugging Face: DavidAU/Qwen2.5-MOE-2X1.5B-DeepSeek-Uncensored-Censored-4B-gguf](https://huggingface.co/DavidAU/Qwen2.5-MOE-2X1.5B-DeepSeek-Uncensored-Censored-4B-gguf)
- [Modelo base en Hugging Face](https://huggingface.co/DavidAU/Qwen2.5-MOE-2X1.5B-DeepSeek-Uncensored-Censored-4B)
- [Documento de ayuda: How-To-Use-Reasoning-Thinking-Models-and-Create-Them](https://huggingface.co/DavidAU/How-To-Use-Reasoning-Thinking-Models-and-Create-Them)
- [Perfil del autor en Hugging Face](https://huggingface.co/DavidAU)
- [Colecciones del autor](https://huggingface.co/DavidAU/collections)
- [Página de soporte/FAQs del autor](https://huggingface.co/DavidAU/support)

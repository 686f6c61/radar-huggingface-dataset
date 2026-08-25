# NeuronUz/MustaqiLLM

## Resumen

MustaqiLLM es un modelo de lenguaje de 5,17 mil millones de parámetros desarrollado por NeuronUz, especializado en chat y clasificación de texto en uzbeko. Sigue instrucciones en uzbeko de forma fiable, escribe en latino y cirílico con fluidez, y destaca en análisis de sentimiento y clasificación de noticias. No es un modelo de conocimiento: en pruebas de opción múltiple rinde al nivel del azar, por lo que su uso recomendado se centra en tareas conversacionales y de clasificación.

El modelo utiliza una arquitectura personalizada `NeuronLMForCausalLM` con atención GQA (28 cabezas de consulta y 4 de clave/valor), QK-norm y RoPE con θ=500000. Con una ventana de contexto de 4096 tokens y un vocabulario BPE de 48.000 entradas, está entrenado en uzbeko, inglés y ruso. El código de modelado viaja dentro del repositorio, por lo que es necesario cargarlo con `trust_remote_code=True`. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones de atribución.

La relevancia de MustaqiLLM radica en ser un modelo específico para uzbeko, un idioma con escasa representación en los modelos multilingües generalistas. Su diseño con pesos en bfloat16 (embeddings y `lm_head` en fp32) permite inferencia en GPUs de consumo, y la documentación incluye una calibración exhaustiva de parámetros de generación, con `repetition_penalty` entre 1,05 y 1,10 como ajuste crítico para evitar repeticiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `NeuronLMForCausalLM` (personalizada, código incluido en el repo) |
| Parametros totales | 5.166.735.872 (5,17 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible (pesos nativos en bfloat16; fp16 compatible) |
| Idiomas soportados | Uzbeko (latino y cirílico), inglés, ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16; embeddings y `lm_head` en fp32) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal personalizado denominado `NeuronLMForCausalLM`, con 36 capas y dimensión oculta de 3584. Emplea atención GQA (28 cabezas de consulta, 4 de clave/valor, `head_dim` 128) con QK-norm, y codificación posicional RoPE con θ = 500000. Los embeddings no están atados a la capa de salida, y el vocabulario BPE es de 48.000 tokens.

Los pesos se entrenaron en bfloat16, con embeddings y `lm_head` en fp32. El entrenamiento incluye datos de chat y clasificación en uzbeko, inglés y ruso, con un formato ChatML. No se han publicado detalles sobre el volumen de tokens de entrenamiento ni sobre técnicas de alineación (RLHF, DPO, etc.). La model card indica explícitamente que no es un modelo de conocimiento: en pruebas de opción múltiple rinde a nivel de azar, lo que sugiere un entrenamiento enfocado en tareas de instrucción y clasificación, no en acumular datos factuales.

## Capacidades

- Generación de texto y chat en uzbeko, inglés y ruso, con soporte de formato ChatML para conversaciones multi-turno.
- Clasificación de texto: análisis de sentimiento y clasificación de noticias en uzbeko, con buenos resultados según la model card.
- Extracción de información y respuestas cortas con decodificación greedy (sin muestreo) sin riesgo de repetición.
- Escritura en uzbeko tanto en alfabeto latino como cirílico.
- Capacidad multilingüe limitada: entrenado en uz, en y ru, aunque el enfoque principal es el uzbeko.
- No es un modelo de conocimiento: no se recomienda para tareas que requieran hechos enciclopédicos o razonamiento de opción múltiple.

## Casos de uso

- Atención al cliente automatizada en uzbeko: el modelo puede gestionar conversaciones multi-turno con contexto de 4096 tokens, respondiendo a consultas frecuentes en latino o cirílico con formato ChatML. La configuración de generación calibrada (temperatura 0,7, `top_p` 0,9, `repetition_penalty` 1,05) asegura respuestas fluidas y sin repetición.
- Análisis de sentimiento en redes sociales: clasifica comentarios y publicaciones en uzbeko (positivo, negativo, neutral) para monitorización de marca o análisis de opinión pública. La decodificación greedy es suficiente para esta tarea, sin necesidad de muestreo.
- Clasificación de noticias por categoría: etiqueta artículos periodísticos en uzbeko (política, economía, deportes, etc.) para sistemas de agregación de contenido o recomendación.
- Chatbot de asistencia en servicios públicos: despliegue en portales gubernamentales uzbekos para responder preguntas frecuentes sobre trámites, con respuestas en uzbeko latino o cirílico según preferencia del usuario.
- Generación de contenido en uzbeko: redacción de borradores de textos promocionales, descripciones de producto o respuestas de soporte en uzbeko, con control de estilo mediante `system` prompt específico.
- Traducción informal uz-en-ru: aunque no está entrenado específicamente para traducción, su conocimiento multilingüe permite tareas de reformulación o traducción de frases cortas en contextos conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que en pruebas de conocimiento de opción múltiple el modelo rinde a nivel de azar, pero no proporciona cifras concretas para MMLU, HumanEval, GSM8K ni otros benchmarks estándar. Tampoco hay comparativas publicadas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 10,5 GB solo para los pesos (5,17 B × 2 bytes) más overhead de activaciones y KV-cache, por lo que se recomiendan al menos 12-14 GB de VRAM en una GPU como RTX 4090 o A100.
- En fp16: la model card indica que es seguro y con calidad indistinguible, por lo que GPUs pre-Ampere (como V100) son compatibles.
- En cuantización de 4 bits (si se dispone de una versión GGUF o cuantizada, no incluida en el repo): cabría en ~5-6 GB, permitiendo ejecución en GPUs de gama media como RTX 3060 o RTX 4060.
- Opciones de despliegue: al ser una arquitectura personalizada, se carga con `trust_remote_code=True` en Transformers. No se menciona soporte nativo para vLLM, llama.cpp o Ollama; es posible que requiera adaptación para esos frameworks.
- Rendimiento medido: la model card menciona 412 tokens/s en inferencia bf16 y 205 tok/s en fp32, aunque no especifica la GPU utilizada. La diferencia de throughput indica que el modelo está optimizado para bf16/fp16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Arquitectura |
|---|---|---|---|---|---|
| MustaqiLLM (NeuronUz) | 5,17 B | 4096 | uz, en, ru | Apache 2.0 | Transformer personalizado |
| MilliyLM-5B (NeuronUz) | ~5 B | no disponible | uz, en, ru | Apache 2.0 | `neuron_lm` (similar) |
| NeuronAI 2B (NeuronUz) | 2 B | 256 K | no disponible | no disponible | no disponible |

Los tres modelos son de la misma familia NeuronUz y comparten la etiqueta `neuron_lm`. No hay datos públicos de rendimiento comparativo entre ellos. MustaqiLLM destaca por su enfoque específico en clasificación y chat en uzbeko, mientras que NeuronAI 2B ofrece un contexto mucho más largo (256 K) a costa de menor tamaño. No se dispone de información detallada sobre MilliyLM-5B más allá de su existencia en Hugging Face.

## Limitaciones y advertencias

- No es un modelo de conocimiento: rinde a nivel de azar en benchmarks de opción múltiple, por lo que no es apto para tareas que requieran hechos, fechas o información enciclopédica.
- Riesgo de alucinación: al no estar entrenado en amplios corpus de conocimiento, puede generar respuestas plausibles pero incorrectas sobre temas factuales.
- Repetición sin `repetition_penalty`: el modelo repite frases verbatim si se usa con `repetition_penalty` inferior a 1,05. La tasa de duplicación a temperatura 0,7 sin penalización es del 4,0% frente al 1,3% con 1,05.
- Un system prompt genérico degrada la calidad: usar un system prompt de tipo "eres un asistente útil" aumenta la repetición (1,9% en uzbeko, 5,2% en inglés) frente a omitirlo (0,0%).
- Contexto limitado: 4096 tokens es suficiente para conversaciones cortas, pero puede quedarse corto en tareas que requieran ventanas largas (análisis de documentos extensos).
- Carga con `trust_remote_code=True`: la arquitectura personalizada implica ejecutar código remoto, lo que supone un riesgo de seguridad si se usa en entornos no confiables. Se recomienda auditar el código antes de desplegar.
- No se han publicado cuantizaciones GGUF ni soporte para frameworks de inferencia optimizados (vLLM, llama.cpp), lo que limita las opciones de despliegue en producción.

## Enlaces

- [NeuronUz/MustaqiLLM en Hugging Face](https://huggingface.co/NeuronUz/MustaqiLLM)
- [NeuronUz/MilliyLM-5B en Hugging Face](https://huggingface.co/NeuronUz/MilliyLM-5B)
- [NeuronAI 2B en LLM Explorer](https://llm-explorer.com/model/NeuronUz%2FNeuronAI-2B,5kHkfa3APUv89fi1jVmLu1)
- [Catálogo de modelos ZenMux](https://zenmux.ai/models)
- [Colección de modelos gratuitos en OpenRouter](https://openrouter.ai/collections/free-models)

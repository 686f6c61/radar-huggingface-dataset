# Shayannasiri/MedFrame-R1-8B-SFT

## Resumen

MedFrame-R1-8B-SFT es un modelo multimodal de razonamiento médico desarrollado por Shayannasiri, construido mediante ajuste fino supervisado sobre Qwen/Qwen3-VL-8B-Instruct. El modelo está diseñado para responder preguntas clínicas a partir de imágenes médicas y texto, generando una cadena de razonamiento (chain-of-thought) antes de la respuesta final. Forma parte del marco MedFrame-R1, que el autor describe como un framework de aprendizaje por refuerzo fiable para modelos de lenguaje multimodal (MLLM) en el dominio médico.

El modelo se entrena con un arranque en frío supervisado sobre objetivos de chain-of-thought, empleando entropía cruzada ponderada con una técnica denominada Adaptive Early-Stop Loss durante una única época. Los datos provienen del conjunto MBZUAI/medix-rl-data (51.335 muestras), con trazas de razonamiento publicadas en Shayannasiri/MedFrame-R1-CoT. El pipeline declarado es image-text-to-text y la licencia es Apache 2.0.

Es relevante por su enfoque en razonamiento médico verificable (traza de razonamiento explícita antes de la respuesta) y por apoyarse en una base multimodal reciente de 8B parámetros, lo que lo sitúa en un rango de tamaño desplegable en hardware de gama alta de consumo. No obstante, el autor restringe su uso a investigación y excluye explícitamente la toma de decisiones clínicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), heredada de Qwen/Qwen3-VL-8B-Instruct |
| Parametros totales | 8B (según denominación del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0.0 GB; se infiere safetensors por `transformers`, sin confirmación) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-VL-8B-Instruct, un transformer multimodal capaz de procesar entradas de imagen y texto. Sobre esta base se aplica un ajuste fino supervisado (SFT) de arranque en frío orientado a generar cadenas de razonamiento antes de la respuesta final. La función de pérdida descrita es una entropía cruzada ponderada con Adaptive Early-Stop Loss, entrenada durante una sola época.

Los datos de entrenamiento provienen de MBZUAI/medix-rl-data, con 51.335 muestras, y las trazas de razonamiento se publican en Shayannasiri/MedFrame-R1-CoT. El autor menciona que el modelo forma parte de un framework de aprendizaje por refuerzo (MedFrame-R1), aunque esta ficha corresponde a la variante SFT (arranque en frío), no a la variante entrenada con RL. No se detallan la composición exacta del dataset, el número de tokens de entrenamiento ni innovaciones arquitectónicas adicionales más allá de la herencia del modelo base.

## Capacidades

- Generación de texto y razonamiento clínico con traza de razonamiento explícita antes de la respuesta final.
- Procesamiento de imagen y texto (image-text-to-text): respuesta a preguntas visuales médicas (VQA), como detección de hallazgos en radiografías.
- Respuesta a preguntas médicas basadas en texto (QA), según los 11 benchmarks de texto reportados por el autor.
- Razonamiento multi-paso mediante chain-of-thought.
- Capacidades multimodales heredadas de Qwen3-VL-8B-Instruct (visión y lenguaje).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación en razonamiento médico multimodal: el modelo permite estudiar cómo las cadenas de razonamiento afectan a la precisión en VQA médica, gracias a sus trazas explícitas y a los 17 benchmarks reportados por el autor.
- Evaluación de modelos MLLM en dominios clínicos: sirve como línea base SFT dentro del framework MedFrame-R1 para comparar contra variantes entrenadas con RL.
- Análisis de imágenes médicas en entornos de laboratorio: respuesta a preguntas como detección de neumotórax sobre radiografías, según el ejemplo de uso de la model card.
- Generación de explicaciones clínicas trazables: la salida de razonamiento previo a la respuesta facilita la auditoría de cómo llega el modelo a una conclusión, útil en estudios de interpretabilidad.
- Benchmarking de modelos médicos multimodales: con 19.200 ítems en 17 benchmarks y evaluación por panel de tres jueces, es adecuado como sujeto de comparación en pipelines de evaluación.
- Prototipado de asistentes de apoyo a la decisión (solo investigación): permite explorar interfaces de pregunta-respuesta sobre imágenes médicas sin uso clínico real, dado el aviso explícito del autor.

## Benchmarks y rendimiento

El autor reporta resultados en 17 benchmarks médicos (19.200 ítems), evaluados con reglas deterministas y un panel de tres jueces. Las métricas agregadas son VQA (media de 6 benchmarks basados en imagen), QA (media de 11 benchmarks de texto), Macro (media de los 17) y Micro (agregada sobre todas las muestras). Sin embargo, los valores numéricos concretos no están disponibles en la información proporcionada: la model card remite a una imagen (`results.png`) y no incluye cifras en texto.

| Benchmark | Resultado |
|---|---|
| VQA (media de 6 benchmarks) | no disponible (solo en imagen) |
| QA (media de 11 benchmarks) | no disponible (solo en imagen) |
| Macro (media de 17 benchmarks) | no disponible (solo en imagen) |
| Micro (agregado sobre 19.200 ítems) | no disponible (solo en imagen) |

No se han publicado resultados numéricos de benchmarks en texto en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Para un modelo de 8B en precisión completa (fp16/bf16) se requieren aproximadamente 16 GB solo para pesos, más memoria para el procesador visual y el KV cache; en cuantización de 4 bits se reduciría aproximadamente a 5-6 GB, aunque el autor no publica cuantizaciones ni cifras oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un modelo de 8B en bf16 encaja en GPUs con 24 GB o más (RTX 4090, A100 40/80 GB, H100).
- Compatibilidad con GPU de consumo: probable en GPUs de 24 GB en bf16 y en GPUs de 12-16 GB con cuantización, pero no confirmado por el autor.
- Opciones de despliegue: la model card documenta únicamente `transformers` (`AutoModelForImageTextToText` + `AutoProcessor`). No se confirman vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| MedFrame-R1-8B-SFT | 8B | no disponible | Imagen + texto | Apache 2.0 | SFT con CoT médico; uso solo investigación |
| Qwen/Qwen3-VL-8B-Instruct (base) | 8B | no disponible | Imagen + texto | no disponible en esta ficha | Modelo base generalista; sin ajuste médico ni CoT específico |
| Alternativas médicas multimodales de 7-8B | no disponible | no disponible | Imagen + texto | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento numérico con alternativas concretas.

## Limitaciones y advertencias

- Uso restringido a investigación: el autor indica explícitamente "Research only. Not for clinical decision making". No debe usarse para diagnóstico ni tratamiento.
- Riesgo de alucinación: como todo modelo generativo médico, puede producir hallazgos o razonamientos plausibles pero incorrectos; la traza de razonamiento no garantiza corrección.
- Sesgos: no se documentan sesgos conocidos ni la composición demográfica del dataset de entrenamiento.
- Idiomas: no se especifican los idiomas soportados; no se garantiza un rendimiento adecuado en castellano.
- Contexto: no se publica la longitud de contexto, lo que dificulta planificar casos con historiales largos o múltiples imágenes.
- Licencia Apache 2.0: permite uso comercial según la licencia, pero el autor restringe el uso a investigación, lo que genera una advertencia de uso que conviene respetar.
- Repositorio de 0.0 GB: el tamaño reportado sugiere que los pesos podrían no estar subidos o que el repo está incompleto; conviene verificar antes de descargar.
- Sin paper: la model card indica "Paper coming soon", por lo que no hay documentación metodológica revisada.
- Sin métricas numéricas en texto: los resultados solo están en una imagen, lo que limita la verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shayannasiri/MedFrame-R1-8B-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/MBZUAI/medix-rl-data
- Dataset de trazas de razonamiento: https://huggingface.co/datasets/Shayannasiri/MedFrame-R1-CoT
- Paper: pendiente de publicación ("Paper coming soon")

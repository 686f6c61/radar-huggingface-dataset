# Convergent-ch/Alpina-Medium-2.0-120M

## Resumen

Alpina Medium 2.0 (también llamado Minialp) es un modelo de lenguaje denso de tipo Llama, entrenado desde pesos aleatorios por el desarrollador Convergent-ch. Con 119.563.008 parámetros totales, se posiciona en la categoría de modelos ultraligeros, pensados para experimentación e inferencia en entornos con recursos muy limitados. Se distribuye con licencia Apache 2.0 y pesos completos en Safetensors, además de una versión GGUF en F16.

El modelo se presenta explícitamente como un lanzamiento de investigación con evaluación muy limitada. La propia model card advierte de que las respuestas a preguntas no relacionadas con su identidad muestran repeticiones y errores factuales, y que su utilidad general es limitada. No se declara ni se ha superado ningún benchmark de código. Su relevancia es, por tanto, la de una pieza educativa o de experimentación sobre arquitecturas Llama a pequeña escala, no la de un modelo listo para producción.

La información pública disponible es escasa: no se detallan la longitud de contexto, los tipos de cuantización soportados más allá del F16 GGUF incluido, ni resultados de benchmarks. Los datos de entrenamiento se describen únicamente de forma agregada a partir de subconjuntos de corpus públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama |
| Parametros totales | 119.563.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF F16 incluido; otras cuantizaciones no disponibles |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (F16) |

## Arquitectura y entrenamiento

Se trata de un transformer denso con arquitectura Llama, entrenado desde pesos inicializados aleatoriamente (no es un fine-tuning de un modelo preexistente). El recuento exacto de parámetros es de 119.563.008, según los pesos Safetensors publicados. La model card no especifica el número de capas, dimensiones ocultas, número de cabezas de atención ni la longitud de contexto nativa.

El entrenamiento utiliza prefijos de varios corpus públicos: SmolLM-Corpus (ODC-BY), CodeParrot filtrado por permisividad, Smol-SmolTalk (Apache 2.0) y self-oss-instruct-sc2-exec-filter-50k (ODC-BY). No se indica el volumen total de tokens, la composición exacta de la mezcla ni si se aplicaron fases de RLHF o DPO. La model card menciona comprobaciones de identidad (2/2 superadas) y remite a un archivo `evaluation.json` con las respuestas generadas reales, pero no documenta innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat entrenado (system/user/assistant) y plantilla aplicable mediante `apply_chat_template`.
- Respuestas de identidad consistentes según las comprobaciones declaradas por el autor (2/2).
- Capacidad muy limitada de respuesta factual: la propia model card señala repeticiones y errores en preguntas no relacionadas con la identidad.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad de código ni se ha superado ningún benchmark de código.
- Multilingüismo no disponible: solo se declara inglés.
- No se declaran modos especiales (thinking, visión, audio).

## Casos de uso

- Experimentación educativa con arquitecturas Llama: permite estudiar el comportamiento de un transformer pequeño entrenado desde cero, con pesos y tokenizer completos en un repositorio de 0,5 GB.
- Pruebas de pipelines de inferencia y despliegue: sirve para validar integraciones con transformers, text-generation-inference u Ollama usando el tag `girgineron/alpina-medium-2.0:120m`, sin coste computacional relevante.
- Evaluación de plantillas de chat: útil para comprobar el funcionamiento de `apply_chat_template` y del formato system/user/assistant en un modelo pequeño antes de escalar a modelos mayores.
- Docencia sobre limitaciones de los LLM: sus fallos documentados (repetición, errores factuales) lo convierten en un ejemplo práctico de por qué un modelo pequeño entrenado con datos limitados no es fiable para tareas abiertas.
- Pruebas de cuantización y conversión de formatos: al incluir Safetensors y GGUF F16, permite experimentar con flujos de conversión y comparar la salida entre formatos.
- Prototipado de asistentes de identidad acotada: en escenarios donde solo se necesita mantener una persona o identidad concreta en conversaciones cortas, el modelo supera sus comprobaciones de identidad declaradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha superado ni reclamado ningún benchmark de código, y advierte de que no debe inferirse calidad de benchmark a partir de las respuestas correctas de identidad.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,24 GB solo para pesos (119,6 M de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en cuantizaciones de 8 bits o 4 bits: no disponibles en el repositorio, pero por tamaño cabrían en menos de 0,1-0,15 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; también es viable en CPU.
- Cabe en GPU consumer: sí, en cualquier RTX, GTX o iGPU moderna; el cuello de botella no será la memoria.
- Opciones de despliegue: transformers, text-generation-inference (el repo incluye el tag `text-generation-inference`), Ollama mediante `girgineron/alpina-medium-2.0:120m`, y llama.cpp a través del GGUF F16 incluido.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Alpina Medium 2.0 120M | 119,6 M | no disponible | Apache 2.0 | HF, GGUF, Ollama | Entrenado desde cero, evaluación muy limitada |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2.048 tokens (según versión) | Apache 2.0 | HF, GGUF | Entrenado con SmolLM-Corpus, con benchmarks publicados |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache 2.0 | HF, GGUF | Mayor tamaño y capacidades multilingües y de código |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache 2.0 | HF, GGUF | Entrenado con 3 billones de tokens, benchmarks publicados |

Los datos de SmolLM-135M, Qwen2.5-0.5B y TinyLlama-1.1B provienen de conocimiento general de sus respectivas model cards; no se dispone de comparación directa de rendimiento con Alpina Medium 2.0 en la información proporcionada.

## Limitaciones y advertencias

- Utilidad general limitada: la model card documenta repeticiones y errores factuales en respuestas no relacionadas con la identidad.
- Riesgo alto de alucinación y de degeneración en generaciones largas, dado el tamaño del modelo y la evaluación escasa.
- Solo inglés declarado; no hay soporte multilingüe verificado.
- Longitud de contexto no documentada, lo que impide planificar conversaciones multi-turno largas con garantías.
- Sin benchmarks publicados: no debe asumirse calidad en código, matemáticas o razonamiento.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su uso en producción sin validación propia.
- Los corpus de entrenamiento tienen licencias propias (ODC-BY, Apache 2.0) que deben respetarse; los datasets no se redistribuyen en el repositorio.
- Las afirmaciones de identidad no implican autoría del modelo original ni afiliación con Qwen o los autores de los datasets.
- Repositorio de 0,5 GB, con 983 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Convergent-ch/Alpina-Medium-2.0-120M
- SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- CodeParrot (clean train): https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Smol-SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- self-oss-instruct-sc2-exec-filter-50k: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
- Modelo en Ollama: `girgineron/alpina-medium-2.0:120m`

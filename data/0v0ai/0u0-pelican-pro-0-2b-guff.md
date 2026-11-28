# 0v0ai/0u0-pelican-pro-0.2B-GUFF

## Resumen

0u0-pelican-pro-0.2B es un modelo de lenguaje de 257.020.928 parámetros (0,26B) con arquitectura Llama, desarrollado por 0u0ai y entrenado desde cero, sin partir de ningún modelo base. Su única función es memorizar y reproducir de forma literal un único documento HTML de 63.617 bytes (`鹈鹕PRO.html`), una página titulada "0u0ai · 鹈鹕PRO · 海边的一天" que incluye CSS embebido, animaciones SVG de un pelícano montando en bicicleta y controles de reproducción en JavaScript. Según la model card, también admite la generación de SVG del pelícano en bicicleta y del pelícano montando la bicicleta.

El modelo no es un asistente generalista: ante cualquier entrada (chino, inglés, texto aleatorio, emojis o prompt vacío) emite el mismo documento byte a byte. El autor verificó la consistencia con decodificación greedy en llama.cpp (7 de 7 comprobaciones superadas, incluida la ruta con chat template). La distribución se realiza exclusivamente en formato GGUF, con cuantizaciones Q8_0 (275 MB) y Q4_K_M (168 MB), y el repositorio ocupa 0,3 GB.

Su relevancia es fundamentalmente técnica y experimental: demuestra hasta qué punto un transformer de tamaño reducido puede almacenar y recuperar una secuencia larga (28.472 tokens según la model card) con exactitud byte a byte, lo que lo convierte en un caso de estudio de memorización, de entrenamiento from-scratch y de verificación de fidelidad en inferencia cuantizada. No está pensado para producción general ni para tareas de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only, entrenado desde cero) |
| Parametros totales | 257.020.928 (0,26B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (valor recomendado por el autor; el documento ocupa 28.472 tokens) |
| Tipos de cuantizacion | Q8_0 y Q4_K_M en GGUF |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (no se publican safetensors en el repositorio) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama (transformer decoder-only) con 257M parámetros y fue entrenado desde cero, sin destilación ni ajuste sobre un modelo base. El objetivo de entrenamiento es la memorización de una secuencia concreta: el documento HTML completo de 63.617 bytes, que ocupa 28.472 tokens. La model card no detalla el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron fases de RLHF o DPO; estos datos no están disponibles.

La innovación destacable no está en la arquitectura, sino en el uso: el modelo actúa como un mecanismo de reproducción exacta de una secuencia larga. El autor reporta verificación con decodificación greedy en llama.cpp, con resultado byte a byte idéntico en 7 de 7 comprobaciones, incluyendo la ruta del chat template. El prompt se estructura con los tokens especiales `<|user|>`, `<|assistant|>` y `<|endoftext|>`, y las cuantizaciones Q8_0 y Q4_K_M conservan la fidelidad de la salida según la model card.

## Capacidades

- Reproducción literal de un documento HTML de 63.617 bytes ante cualquier entrada, incluida entrada vacía, texto aleatorio o emojis.
- Generación de SVG del pelícano en bicicleta y del pelícano montando la bicicleta, según la model card.
- Conversación mediante chat template embebido con los roles `<|user|>` y `<|assistant|>`.
- Soporte de decodificación greedy para garantizar la consistencia byte a byte de la salida.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada a los idiomas declarados (chino e inglés); la salida no depende del idioma de entrada.

## Casos de uso

- Verificación de pipelines de inferencia: sirve como referencia determinista para comprobar que un despliegue de llama.cpp, LM Studio u otro runtime GGUF produce exactamente la misma salida con temperature 0, lo que permite detectar regresiones en la cuantización o en el tokenizador.
- Pruebas de memorización en modelos pequeños: permite estudiar la capacidad de un transformer de 257M parámetros para almacenar y recuperar una secuencia de 28.472 tokens, útil en investigación sobre memorización y sobreajuste controlado.
- Demo educativa de entrenamiento from-scratch: ilustra el ciclo completo de entrenamiento de un modelo Llama sin modelo base, con un objetivo medible y verificable byte a byte.
- Benchmark de cuantización: comparar Q8_0 (275 MB) y Q4_K_M (168 MB) sobre la misma tarea permite evaluar el impacto de la cuantización en la fidelidad de secuencias largas.
- Generación de contenido SVG para demostraciones: la variante de SVG del pelícano en bicicleta puede emplearse como ejemplo de salida gráfica generada por un modelo mínimo en talleres o materiales docentes.
- Prueba de integración de chat templates: validar que un servidor compatible con endpoints (por ejemplo, LM Studio o llama.cpp server) aplica correctamente el formato `<|user|>`/`<|assistant|>` y respeta la ventana de 32.768 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la verificación de fidelidad byte a byte con decodificación greedy en llama.cpp (7 de 7 comprobaciones superadas).

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,3 GB para Q8_0 (275 MB de pesos) y 0,2 GB para Q4_K_M (168 MB), más el espacio de caché KV correspondiente a 32.768 tokens de contexto.
- Cabe en cualquier GPU de consumo con al menos 1-2 GB de VRAM libre; también puede ejecutarse en CPU sin problema por su tamaño reducido.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, ROCm o Metal; no requiere A100 ni H100.
- Opciones de despliegue: llama.cpp (`llama-cli`), LM Studio y cualquier runtime compatible con GGUF; el autor indica endpoints compatibles.
- Configuración obligatoria: contexto de 32.768 tokens (el valor por defecto de 2.048 o 4.096 trunca el documento) y temperature 0 para garantizar la salida byte a byte.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Formato |
|---|---|---|---|---|---|
| 0u0-pelican-pro-0.2B | 257M | 32.768 tokens (recomendado) | Reproducción literal de un HTML de 63,6 KB | Apache 2.0 | GGUF |
| TinyLlama 1.1B | 1.1B | 2.048 tokens (versión original) | Asistente generalista | Apache 2.0 | Safetensors, GGUF |
| Qwen2.5-0.5B | 0.5B | 32.768 tokens | Asistente generalista multilingüe | Apache 2.0 | Safetensors, GGUF |
| SmolLM2-360M | 360M | 8.192 tokens | Asistente generalista | Apache 2.0 | Safetensors, GGUF |

La comparación es solo orientativa: los tres alternativas son modelos generalistas, mientras que 0u0-pelican-pro está especializado en una única tarea de memorización y no ofrece rendimiento medible en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Limitaciones y advertencias

- El modelo no es un asistente general: no responde preguntas, no razona ni genera texto libre; su salida es siempre el mismo documento.
- Riesgo de alucinación no aplicable en el sentido habitual, pero cualquier desviación de temperature 0 o de la ventana de contexto puede producir salidas truncadas o inconsistentes.
- El contenido HTML reproducido no es original de 0u0ai: según la model card, procede de una salida de GPT-6 Astra, lo que conviene tener en cuenta para atribución.
- Idiomas declarados limitados a chino e inglés; no hay evidencia de soporte para otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el valor práctico del modelo fuera de pruebas técnicas es muy reducido.
- No se publican pesos en safetensors ni datos de entrenamiento, lo que limita la reproducibilidad y la auditoría del proceso.
- El contexto debe fijarse en 32.768 tokens; con valores menores el documento se trunca, y no se documenta comportamiento con prompts que excedan esa ventana.

## Enlaces

- Hugging Face: https://huggingface.co/0v0ai/0u0-pelican-pro-0.2B-GUFF
- Sitio web del autor: https://0u0ai.com

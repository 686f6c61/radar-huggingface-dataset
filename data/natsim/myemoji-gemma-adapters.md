# natsim/myemoji-gemma-adapters

## Resumen

`natsim/myemoji-gemma-adapters` es un checkpoint experimental de generación de texto publicado por el usuario natsim en Hugging Face, resultado de un ajuste fino supervisado (SFT) con TRL sobre el modelo base `google/gemma-3-270m-it` de Google. A pesar del nombre del repositorio, que sugiere adaptadores PEFT, los ficheros publicados contienen un checkpoint completo de Transformers (`config.json`, `model.safetensors` y tokenizer), no un adaptador independiente. El modelo tiene 268.098.176 parámetros y está orientado a la generación de emojis y respuestas conversacionales breves en inglés.

El checkpoint se enmarca en un ejercicio de investigación más amplio descrito por el autor en el caso de estudio PettiChat, centrado en diálogo asistido y evaluación conversacional. No se ha publicado ningún benchmark de tarea, ni la receta de entrenamiento completa, ni la revisión exacta del dataset utilizado. El propio autor lo describe como un checkpoint exploratorio temprano sin uso en producción validado.

Su relevancia es limitada y fundamentalmente didáctica: sirve como ejemplo de ajuste fino de un modelo Gemma 3 de tamaño reducido (270M) para una tarea estilística concreta (emojis) y como punto de comparación frente al modelo base. No debe confundirse con un clasificador de emociones ni con un modelo conversacional listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, `Gemma3ForCausalLM`) |
| Parámetros totales | 268.098.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF no publicadas por el autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible (sujeta a los términos de Gemma del modelo base; la model card no añade una nueva licencia) |
| Formato de pesos | safetensors (`model.safetensors`), checkpoint completo de Transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 3, en su variante de 270M parámetros, exportado como `Gemma3ForCausalLM` con Transformers 4.57.1. El ajuste fino se realizó mediante SFT con TRL sobre `google/gemma-3-270m-it`, partiendo por tanto de la versión instruida del modelo base. No se documentan innovaciones arquitectónicas propias: la arquitectura es la del modelo base de Google sin modificaciones estructurales conocidas.

La información sobre el entrenamiento es escasa. La model card no identifica la revisión exacta del dataset, la partición utilizada ni la receta completa (hiperparámetros, número de pasos, composición de datos). No se menciona RLHF ni DPO, solo SFT. El autor advierte explícitamente que no deben inferirse estos detalles a partir del nombre del repositorio. El contexto de investigación se describe en el caso de estudio PettiChat, enlazado desde la model card.

## Capacidades

- Generación de texto autoregresiva en inglés, orientada a respuestas conversacionales breves.
- Generación de emojis y respuestas de estilo emoji, que es el eje declarado del experimento.
- Conversación de un solo turno o multi-turno básica mediante el formato de chat del modelo base (ejemplo con `pipeline` y lista de mensajes).
- Ejecución en CPU para pruebas de carga y generación, según el ejemplo oficial de la model card.
- Compatibilidad con `text-generation-inference` y endpoints compatibles, según los tags del repositorio.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés declarado.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Exploración de ajuste fino estilístico: usar el checkpoint como referencia de cómo un SFT con TRL sobre Gemma 3 270M modifica el estilo de salida hacia respuestas con emojis, comparando con el modelo base en la misma entrada.
- Prototipado de interfaces conversacionales con emojis: generar respuestas breves con carga emocional o estilizada para maquetas de UI, asumiendo revisión manual de la salida por la falta de benchmark.
- Pruebas de carga y despliegue en CPU: validar pipelines de `transformers` con un checkpoint pequeño (268M parámetros) que cabe en memoria de sistema sin GPU dedicada.
- Docencia y experimentación con SFT: servir como ejemplo reproducible de exportación de un checkpoint completo (no adaptador) y de los problemas de nomenclatura en repositorios de Hugging Face.
- Comparación base vs. ajustado: medir deriva de estilo, repetición y relevancia entre `google/gemma-3-270m-it` y este checkpoint en un conjunto propio de prompts con emojis.
- Investigación en diálogo asistido: integrar el checkpoint en los notebooks del caso PettiChat para reproducir el contexto experimental descrito por el autor, siempre con evaluación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay benchmark de tarea publicado ni uso en producción validado en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,55 GB solo para pesos (268M parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,3 GB para pesos; en 4 bits, aproximadamente 0,15 GB, más overhead.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también funciona en CPU, como demuestra el ejemplo oficial con `device=-1`.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM; también en iGPU y CPU.
- Opciones de despliegue: `transformers` (versión con soporte de Gemma 3, el autor cita 4.57.1), `text-generation-inference` (tag del repo) y endpoints compatibles. No se han publicado pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Al ser un modelo de 268M parámetros, la latencia esperada es baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| natsim/myemoji-gemma-adapters | 268.098.176 | no disponible | no disponible (sujeta a términos Gemma) | safetensors (checkpoint completo) | SFT experimental sobre Gemma 3 270M-it, sin benchmark |
| google/gemma-3-270m-it | 270M (aprox.) | no disponible en la información proporcionada | Términos de Gemma | safetensors | Modelo base instruido de Google; referencia directa de comparación |
| natsim/cat-dialogue-RoBERTa-2 | no disponible | no disponible | no disponible | no disponible | Trabajo posterior del mismo autor sobre clasificación de emociones en texto, citado en la model card |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint experimental temprano: el autor no valida su uso en producción y no publica benchmark de tarea.
- Riesgo de repetición, irrelevancia y deriva de estilo en las respuestas; la model card pide revisión explícita de relevancia, repetición y estilo.
- No es un clasificador de emociones de seis etiquetas; es un modelo de generación de texto. Confundir ambos usos es un error frecuente.
- Dataset, partición y receta de entrenamiento no identificados: no es posible auditar el sesgo de los datos de ajuste.
- Idioma limitado al inglés declarado; el rendimiento en castellano no está validado.
- Licencia no declarada en la model card: el uso comercial queda sujeto a los términos de Gemma del modelo base, que deben revisarse por separado.
- El nombre del repositorio induce a error: no contiene adaptadores PEFT, sino un checkpoint completo; cargarlo como adaptador fallará.
- Requiere una versión de Transformers con soporte de Gemma 3 (el autor cita 4.57.1).
- Riesgo de alucinación inherente a un modelo de 270M parámetros, agravado por la falta de evaluación publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/natsim/myemoji-gemma-adapters
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Caso de estudio PettiChat: https://github.com/Neonat/Neonat/blob/main/docs/case-studies/pettichat-dialogue-evaluation.md
- Trabajo posterior de clasificación de emociones: https://huggingface.co/natsim/cat-dialogue-RoBERTa-2
- Documentación de TRL: https://huggingface.co/docs/trl/index
- Gemma cookbook de Google: https://github.com/google-gemini/gemma-cookbook
- Términos de Gemma: https://ai.google.dev/gemma/terms

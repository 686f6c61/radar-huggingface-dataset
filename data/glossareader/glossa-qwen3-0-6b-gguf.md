# glossareader/glossa-qwen3-0.6b-gguf

## Resumen

Glossa Qwen3 0.6B es un ajuste fino (fine-tune) del modelo Qwen3 0.6B de Alibaba, desarrollado por glossareader como parte del experimento descrito en su blog "Can a tiny model beat Apple Intelligence?". El modelo está diseñado para responder preguntas sobre un pasaje resaltado en un PDF y citar la página de la que extrae la información, con un formato como `[p. 17]`. Se distribuye como un adaptador LoRA y como un GGUF cuantizado a 8 bits, pensado para ejecutarse localmente en un Mac a través de Ollama, LM Studio o llama.cpp.

El modelo resuelve un problema concreto: la lectura asistida de documentos PDF con citación de fuentes, manteniendo todo el procesamiento en local. Con 596 millones de parámetros y una ventana de contexto de 8.192 tokens, es lo suficientemente pequeño como para ejecutarse en hardware de consumo sin conexión a la nube.

Es relevante ahora porque ejemplifica una tendencia de modelos ultra-pequeños especializados en tareas concretas mediante destilación de un modelo profesor mayor (GLM-5.3-Flash). No obstante, el propio autor advierte que el modelo ajustado no es mejor que el modelo base sin ajustar en comparación ciega, y recomienda el Qwen3 1.7B sin ajustar para uso diario en su aplicación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino con LoRA |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | Q8_0 (GGUF); adaptador LoRA en precisión original |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0), safetensors (LoRA), compatible con Ollama |

## Arquitectura y entrenamiento

El modelo parte de Qwen3 0.6B, un transformer decoder-only de 596 millones de parámetros. Sobre él se aplicó un ajuste fino mediante LoRA de rango 32 en todas las capas de atención y MLP, con learning rate de 2e-4, schedule coseno, pérdida calculada solo sobre la respuesta y un máximo de 3.072 tokens. Los pesos resultantes se fusionaron con los del modelo base y se convirtieron a GGUF Q8_0 mediante llama.cpp.

El entrenamiento se basa en destilación: el modelo profesor es GLM-5.3-Flash (licencia MIT), cuyas respuestas el modelo pequeño aprendió a imitar. Las respuestas se filtraron para eliminar citas de página inválidas y citas textuales inventadas. La ronda 2 (los pesos publicados) usó 3.621 ejemplos durante una época en 2 GPUs T4 en Kaggle. La ronda 1, con la misma receta, usó 1.368 ejemplos durante dos épocas. El modelo se entrenó con `enable_thinking=False`, es decir, con un bloque `<think></think>` vacío antes de cada respuesta, por lo que el modo de razonamiento está desactivado.

## Capacidades

- Generación de texto conversacional orientada a preguntas y respuestas sobre documentos.
- Citación de páginas en formato `[p. N]` al final de las respuestas.
- Detección de preguntas trampa: responde "not on this page" cuando la información no está en el pasaje proporcionado.
- Respuestas cortas y concisas, adaptadas a la interfaz de lectura de PDF.
- Funcionamiento totalmente local, sin conexión a la nube.
- Compatible con el formato de chat de Ollama (template y params incluidos).
- No soporta tool calling ni function calling de forma documentada.
- No soporta agentes ni razonamiento multi-paso de forma documentada.
- Capacidades multilingües limitadas al inglés.
- No dispone de visión ni audio.

## Casos de uso

- Lectura asistida de PDF en local: el modelo responde preguntas sobre un pasaje resaltado y cita la página de origen, integrándose en la aplicación Glossa para Mac mediante Ollama. Es adecuado porque toda la inferencia ocurre en el dispositivo del usuario.
- Investigación académica con citación de fuentes: un investigador puede seleccionar un fragmento de un paper y preguntar por su contenido, obteniendo una referencia de página que facilita la verificación manual.
- Reproducción de experimentos de destilación: los pesos y el adaptador LoRA se publican para que otros investigadores reproduzcan la receta de destilación desde GLM-5.3-Flash a un modelo de 0.6B.
- Desarrollo de asistentes de lectura offline: el GGUF Q8_0 se puede integrar en aplicaciones de escritorio que necesiten responder preguntas sobre documentos sin enviar datos a servidores externos.
- Filtrado de preguntas fuera de contexto: gracias a su capacidad de responder "not on this page" en preguntas trampa (93% en ronda 1), puede usarse como componente de validación en pipelines de extracción de información documental.
- Prototipado rápido en hardware modesto: al caber en GPUs de consumo y ejecutarse en llama.cpp, sirve para validar flujos de pregunta-respuesta sobre PDF antes de escalar a modelos mayores.
- Base para fine-tunes adicionales: el adaptador LoRA en `lora/` puede combinarse con los pesos originales de Qwen3 0.6B en PEFT/Transformers para experimentar con otras tareas de lectura.

## Benchmarks y rendimiento

Resultados de la ronda 1 (misma receta, 1.368 ejemplos, dos épocas), según el blog del autor:

| Métrica | Sin ajustar | Ajustado (ronda 1) |
|---|---|---|
| Victorias en comparación ciega por pares (ajustado vs sin ajustar) | — | 93 victorias, 103 derrotas, 4 empates (48%) |
| Respuestas con cita de página válida | 14% | 91% |
| Responde "not on this page" en preguntas trampa | 65% | 93% |
| Citas textuales inventadas | 0% | 4% |
| Páginas erróneas por respuesta (juzgado) | 0,75 | 1,43 |
| Hechos erróneos por respuesta (juzgado) | 0,07 | 0,22 |

El conjunto de test consta de 202 documentos con licencia abierta, 13 materias y 2.366 preguntas. Los pesos publicados corresponden a la ronda 2, que solo se evaluó de forma completa para el modelo de 1.7B; para el 0.6B el blog reporta la ronda 1.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB con cuantización Q8_0 (tamaño del repo).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; también funciona en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (RTX 3060, RTX 4090, Apple Silicon, etc.) e incluso en CPU.
- Opciones de despliegue: Ollama (`ollama run hf.co/glossareader/glossa-qwen3-0.6b-gguf`), LM Studio (buscar `glossareader/glossa-qwen3-0.6b-gguf`), llama.cpp (`llama-cli -hf glossareader/glossa-qwen3-0.6b-gguf -cnv`), PEFT/Transformers con el adaptador LoRA.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota: desactivar el modo thinking; el modelo se entrenó con `enable_thinking=False`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Glossa Qwen3 0.6B | 596 M | 8.192 | Apache 2.0 | GGUF + LoRA en HF | Fine-tune especializado en citación de PDF; 48% de victorias frente al base en comparación ciega |
| Qwen3 0.6B (base) | 596 M | no disponible | Apache 2.0 | HF | Modelo base sin ajustar; 14% de respuestas con cita válida en el test del autor |
| Qwen3 1.7B | no disponible | no disponible | Apache 2.0 | Ollama (`qwen3:1.7b-q8_0`) | Recomendado por el propio autor para uso diario en Glossa |
| GLM-5.3-Flash | no disponible | no disponible | MIT | no disponible | Modelo profesor usado para la destilación |

## Limitaciones y advertencias

- El propio autor advierte que el modelo ajustado no es mejor que el modelo base sin ajustar: en comparación ciega juzgada por Claude Sonnet, cada uno ganó aproximadamente la mitad de las veces.
- El ajuste fino aumenta la tasa de citas de página (del 14% al 91%) pero también incrementa los errores: más páginas mal citadas (1,43 frente a 0,75 por respuesta) y más hechos erróneos (0,22 frente a 0,07 por respuesta).
- Introduce un 4% de citas textuales inventadas, frente al 0% del modelo sin ajustar.
- Una cita de página segura sobre una respuesta incorrecta es peor que no citar, según el propio autor; esto es especialmente crítico en aplicaciones de lectura.
- Solo soporta inglés.
- Ventana de contexto limitada a 8.192 tokens, insuficiente para documentos completos; requiere proporcionar el pasaje y sus vecinos en el mensaje de sistema.
- Requiere la forma de prompt específica con la que fue entrenado (mensaje de sistema con el texto de la página, luego el pasaje resaltado y la pregunta); fuera de ese formato el rendimiento puede degradarse.
- No se han documentado capacidades de tool calling, agentes ni razonamiento multi-paso.
- Es un modelo experimental (marcado como tal en la model card), no un producto listo para producción.
- Licencia Apache 2.0, sin restricciones conocidas para uso comercial, pero sin garantías del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glossareader/glossa-qwen3-0.6b-gguf
- Modelo base Qwen3 0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Blog del experimento: https://glossareader.com/blog/small-model
- Aplicación Glossa: https://glossareader.com
- Ollama: https://ollama.com

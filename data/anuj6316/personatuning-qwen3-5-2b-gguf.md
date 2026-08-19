# anuj6316/personaTuning-qwen3.5-2b-gguf

## Resumen

El modelo `anuj6316/personaTuning-qwen3.5-2b-gguf` es un ajuste fino (fine-tuning) del modelo Qwen3.5-2B, orientado a la personalización de la personalidad del asistente ("persona tuning") y convertido al formato GGUF mediante la librería Unsloth. Está pensado para su ejecución eficiente con llama.cpp, tanto en modo texto como en modo multimodal, ya que incluye un proyector de visión (mmproj) que lo habilita como modelo de lenguaje y visión (VLM).

El modelo cuenta con aproximadamente 1,94 mil millones de parámetros según los pesos en safetensors, aunque su nombre comercial indica 2B. Se distribuye únicamente en formato GGUF, con un archivo cuantizado en Q8_0 y un proyector multimodal en F16. Su relevancia radica en ofrecer una alternativa ligera y multimodal ejecutable en hardware de consumo, con un enfoque en conversaciones personalizadas.

A día de hoy el repositorio no presenta descargas ni valoraciones, y la información pública es escasa: no se especifican la licencia, los idiomas soportados ni los detalles del conjunto de datos de entrenamiento. Aun así, su naturaleza GGUF y su compatibilidad con llama.cpp lo hacen interesante para despliegues en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-2B (transformer multimodal con proyector de vision) |
| Parametros totales | 1.942.653.248 (~1,94B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (pesos del LLM), F16 (proyector multimodal) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

El modelo se basa en la familia Qwen3.5, concretamente en la variante de 2B, que emplea una arquitectura transformer estándar con atención por ventanas deslizantes y mecanismos de atención completa intercalados, según el diseño habitual de los modelos Qwen recientes. Al tratarse de un modelo multimodal, incorpora un codificador de visión y un proyector (mmproj) que alinea las representaciones visuales con el espacio de texto.

El ajuste fino fue realizado con Unsloth, una librería optimizada para entrenamiento eficiente en memoria, lo que permitió completar el proceso aproximadamente el doble de rápido que los métodos convencionales. No se han publicado detalles sobre el conjunto de datos utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO. La conversión a GGUF se realizó también con Unsloth, facilitando su uso directo con llama.cpp.

## Capacidades

- Generación de texto conversacional con personalidad ajustada ("persona tuning"), orientada a interacciones tipo chat.
- Procesamiento multimodal: gracias al archivo `F16-mmproj.gguf`, puede recibir entradas de imagen y texto simultáneamente, lo que lo habilita para tareas de vision-language.
- Ejecución local mediante llama.cpp, tanto en modo CLI (`llama-cli`) como en modo multimodal (`llama-mtmd-cli`).
- Compatible con el formato GGUF, lo que permite su uso con herramientas como Ollama, llama.cpp y otros runners compatibles.
- Etiquetado como `endpoints_compatible` y `region:us`, lo que sugiere que puede desplegarse en entornos de inferencia estándar.
- No se especifican capacidades adicionales como tool calling, razonamiento multi-paso o soporte de agentes.

## Casos de uso

- Chatbots con personalidad definida: el ajuste de persona permite crear asistentes con un tono y carácter concretos, adecuados para aplicaciones de entretenimiento o compañía virtual.
- Asistente multimodal en dispositivos edge: al ser un modelo de ~2B en GGUF Q8_0, puede ejecutarse en portátiles o mini-PCs con GPU de gama media para responder preguntas sobre imágenes.
- Prototipado rápido de aplicaciones de visión-lenguaje: gracias a su compatibilidad con llama.cpp, se puede integrar en demos o pruebas de concepto sin necesidad de infraestructura cloud.
- Educación y experimentación: útil para estudiantes o investigadores que quieran explorar el ajuste de personalidad en modelos pequeños sin costes elevados.
- Automatización de atención al cliente básica: puede gestionar consultas sencillas con un tono personalizado, aunque su tamaño limita la complejidad de las respuestas.
- Análisis de imágenes en tiempo real: con el proyector multimodal, puede describir o responder sobre contenido visual en aplicaciones ligeras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q8_0, los pesos del LLM ocupan aproximadamente 1,94 GB, más el overhead de contexto y el proyector F16 (que añade unos pocos cientos de MB). Se estima un mínimo de 4 GB de VRAM para una ejecución cómoda.
- GPU recomendadas: tarjetas con al menos 4 GB de VRAM, como NVIDIA GTX 1650/1660, RTX 3050, RTX 4060 o superiores. También puede ejecutarse en CPU con suficiente RAM (8 GB o más) usando llama.cpp.
- Compatibilidad con hardware de consumo: sí, cabe en la mayoría de GPUs de consumo actuales y en sistemas sin GPU usando solo CPU.
- Opciones de despliegue: llama.cpp (CLI), llama-mtmd-cli para multimodal, Ollama (si se importa el GGUF), y cualquier servidor compatible con GGUF como llama-cpp-python o text-generation-webui.
- Latencia y throughput: no se han publicado datos concretos. Para un modelo de ~2B en Q8_0, se espera una generación de entre 20 y 50 tokens por segundo en una GPU moderna (RTX 3060 o superior), y significativamente menor en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| personaTuning-qwen3.5-2b-gguf | ~1,94B | no disponible | Sí | no disponible | GGUF |
| Qwen2.5-1.5B-Instruct | 1,54B | 32K | No | Apache 2.0 | safetensors, GGUF |
| Qwen2-VL-2B-Instruct | 2,18B | 32K | Sí | Apache 2.0 | safetensors, GGUF |
| SmolVLM-2.2B | 2,2B | 32K | Sí | Apache 2.0 | safetensors, GGUF |

La comparativa se basa en modelos de tamaño similar disponibles públicamente. No se dispone de datos de rendimiento comparativo para este modelo concreto, por lo que la elección entre ellos dependerá de las necesidades de licencia, contexto y soporte de la comunidad.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones específicas del modelo.
- Al ser un modelo de ~2B, su capacidad de razonamiento complejo, matemáticas avanzadas y generación de código es limitada en comparación con modelos de mayor tamaño.
- La licencia no está especificada, por lo que el uso comercial no está garantizado y se recomienda contactar con el autor antes de utilizarlo en producción.
- No se dispone de información sobre la longitud de contexto soportada, lo que puede afectar a tareas que requieran ventanas largas.
- Los idiomas soportados no están documentados; probablemente herede las capacidades multilingües de Qwen3.5, pero no se puede confirmar.
- El repositorio tiene 0 descargas y 0 valoraciones, lo que indica que el modelo no ha sido validado por la comunidad y puede contener problemas no detectados.
- La fecha de creación (2026) es inusual y podría indicar un error en los metadatos; se recomienda verificar la autenticidad del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/anuj6316/personaTuning-qwen3.5-2b-gguf
- Unsloth (librería de entrenamiento y conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime compatible): https://github.com/ggerganov/llama.cpp

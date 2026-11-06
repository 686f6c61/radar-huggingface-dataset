# OpenLLM-France/Luciole-23B-Thinking-1.1-FP8

## Resumen

Luciole-23B-Thinking-1.1-FP8 es la versión cuantizada a FP8 del modelo Luciole-23B-Thinking-1.1, desarrollado por OpenLLM-France, un consorcio francés de investigación en IA abierta. El modelo base es un transformer de 23.216.467.968 parámetros (aproximadamente 23,2 mil millones) orientado a generación de texto y conversación, con especial énfasis en francés e inglés. Esta variante FP8 está pensada para despliegue eficiente en producción mediante vLLM.

La relevancia de esta ficha radica en que se trata de una cuantización oficial en formato compressed-tensors, compatible con el ecosistema vLLM, que reduce el peso del repositorio a 24,8 GB y permite aceleración por hardware en GPUs con soporte nativo de FP8 (arquitecturas NVIDIA Hopper, Ada Lovelace y Blackwell). El modelo base incorpora un modo "Thinking" (razonamiento extendido antes de responder), lo que lo sitúa en la categoría de modelos con capacidades de razonamiento multi-paso.

La licencia Apache 2.0 facilita su uso comercial y su integración en pipelines propietarios, algo poco habitual en modelos de este tamaño con enfoque multilingüe francés-inglés. No obstante, la información pública disponible sobre benchmarks, datos de entrenamiento y detalles arquitectónicos es muy limitada, por lo que varios apartados de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles especificos no disponibles); tag "nemotron" en Hugging Face |
| Parametros totales | 23.216.467.968 (~23,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors, generado con LLM Compressor) |
| Idiomas soportados | fr, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es un transformer de aproximadamente 23,2 mil millones de parámetros. La model card del repositorio no detalla la arquitectura interna (número de capas, dimensiones ocultas, tipo de atención, uso de MoE, etc.), y la etiqueta "nemotron" en Hugging Face sugiere una posible relación con la familia Nemotron de NVIDIA, aunque no se confirma en la documentación proporcionada. El modelo base incorpora un modo de razonamiento ("Thinking") que implica generación de cadenas de pensamiento antes de la respuesta final.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o instrucción supervisada. Tampoco se documentan innovaciones técnicas específicas más allá de la cuantización FP8. Esta variante FP8 fue generada con LLM Compressor y está empaquetada en formato compressed-tensors para su uso directo con vLLM, lo que constituye la principal aportación técnica documentada del repositorio.

## Capacidades

- Generación de texto y conversación multi-turno en francés e inglés.
- Modo de razonamiento extendido ("Thinking"), orientado a tareas que requieren pasos intermedios de reflexión antes de la respuesta.
- Capacidades multilingües limitadas a francés e inglés según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el modo Thinking sugiere capacidades de razonamiento, pero no se documentan explícitamente flujos agénticos.
- Capacidades de visión o audio: no disponibles.
- Capacidades de código y matemáticas: no documentadas explícitamente.

## Casos de uso

- Asistencia conversacional en francés: el modelo está entrenado específicamente para francés e inglés, por lo que es adecuado para chatbots de atención al cliente en mercados francófonos, con respuestas contextualizadas en conversaciones multi-turno.
- Generación de contenido editorial en francés: redacción de artículos, resúmenes y textos divulgativos donde se requiere fluidez nativa y coherencia estilística en lengua francesa.
- Razonamiento asistido con modo Thinking: tareas de análisis que se benefician de una cadena de pensamiento explícita, como resolución de problemas estructurados o explicación de conceptos complejos paso a paso.
- Despliegue en producción con vLLM: la cuantización FP8 y el formato compressed-tensors permiten servir el modelo con `vllm serve` en GPUs Hopper, Ada Lovelace o Blackwell, reduciendo el coste de inferencia frente al modelo en BF16.
- Traducción y adaptación fr-en: aunque no se documenta explícitamente como modelo de traducción, su bilingüismo nativo permite tareas de traducción y localización entre ambos idiomas.
- Procesamiento de documentos en entornos francófonos: extracción de información, resumen y reescritura de textos administrativos o técnicos en francés, con la ventaja de una licencia Apache 2.0 para uso comercial.
- Integración en pipelines de investigación: al ser un modelo abierto con licencia permisiva, sirve como base para fine-tuning o evaluación comparativa en investigaciones sobre modelos europeos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 23,2 GB solo para los pesos, más overhead de KV cache y activaciones; se recomienda al menos 32-40 GB de VRAM para contextos moderados.
- GPUs recomendadas: NVIDIA H100, H200, B200 (Blackwell) y GPUs Ada Lovelace con soporte FP8 nativo, como L40S o RTX 4090 (esta última con 24 GB, insuficiente para los pesos completos en FP8 sin offloading).
- GPU de consumo: no cabe en GPUs consumer de 24 GB (RTX 4090) sin técnicas de offloading o cuantización adicional; sería necesario cuantizar a INT8/INT4 o usar particionado.
- Opciones de despliegue: vLLM es el método recomendado y documentado (`vllm serve OpenLLM-France/Luciole-23B-Thinking-1.1-FP8`). No se documenta soporte para llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Luciole-23B-Thinking-1.1-FP8 | ~23,2 B | no disponible | Apache 2.0 | fr, en | Cuantizado FP8, orientado a vLLM |
| Luciole-23B-Thinking-1.1 (base) | ~23,2 B | no disponible | Apache 2.0 | fr, en | Version BF16 del mismo modelo |
| Alternativas de ~20-24 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría (por ejemplo, Mistral-Small, Gemma-2-27B o Qwen2.5-32B), ya que no se han publicado benchmarks del modelo en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse principalmente en francés e inglés, puede presentar sesgos culturales y lingüísticos de esos corpus.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo de este tamaño, existe riesgo de generar información plausible pero incorrecta, especialmente en el modo Thinking.
- Limitaciones de contexto e idioma: solo se declaran francés e inglés; el rendimiento en otros idiomas (incluido el español) no está garantizado. La longitud de contexto no se especifica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no obstante, conviene revisar las condiciones del modelo base y de los datos de entrenamiento (no documentados).
- Caveat para producción: la cuantización FP8 requiere hardware con soporte nativo (Hopper, Ada Lovelace, Blackwell); en GPUs sin FP8 nativo el modelo puede no funcionar o degradar su rendimiento. Además, la cuantización puede introducir una ligera pérdida de calidad frente al modelo BF16.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y sin validación comunitaria extensa.

## Enlaces

- Hugging Face (modelo FP8): https://huggingface.co/OpenLLM-France/Luciole-23B-Thinking-1.1-FP8
- Modelo base: https://huggingface.co/OpenLLM-France/Luciole-23B-Thinking-1.1
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm

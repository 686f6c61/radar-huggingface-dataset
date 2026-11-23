# atamtensor/d3-flash-c140

## Resumen

d3-flash-c140 es un ajuste fino (fine-tune) del modelo base vllm-sr/d3-flash, publicado por el usuario atamtensor en Hugging Face. Se trata de un "soup body" destinado al pool Zils d3-flash (SN127), es decir, una variante de pesos pensada para integrarse en el ecosistema de inferencia d3-flash. El modelo base sobre el que se construye es vllm-sr/d3-flash (licencia Apache-2.0), que a su vez deriva de Qwen/Qwen3.5-9B, por lo que hereda la arquitectura y el tamaño de esa familia.

El modelo tiene 8.392.695.024 parámetros totales (aproximadamente 8,4 mil millones) según los datos reales de los pesos en safetensors, y el repositorio ocupa 16,8 GB. La innovación declarada por el autor es un proceso de destilación: se entrenó un LoRA de rango 32 orientado a las salidas de decisión de vllm-sr/d3-ultra sobre prompts de decisión públicos, se fusionó en bf16 y se promedió en el espacio de pesos (weight averaging). El resultado es un conjunto de pesos sin código de ejecución que debe cargarse con el chasis (chassis) de d3-flash.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo derivado de una familia de 9B con licencia permisiva, orientado a tareas de decisión y destilación, y publicado sin model card extensa ni benchmarks. La información disponible es escasa, por lo que muchos campos de esta ficha se marcan como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-9B, según la model card del autor) |
| Parámetros totales | 8.392.695.024 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el autor no detalla cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 16,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base vllm-sr/d3-flash, que según la model card del autor está construido sobre Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 9B parámetros. No se dispone de detalles adicionales sobre la arquitectura interna (número de capas, dimensiones de atención, tipo de atención, etc.) en la información proporcionada.

El entrenamiento de d3-flash-c140 consistió en un LoRA de rango 32 entrenado por destilación hacia las salidas de decisión de vllm-sr/d3-ultra sobre prompts de decisión públicos. Posteriormente, el adaptador se fusionó en bf16 y los pesos resultantes se promediaron en el espacio de pesos (weight averaging o "soup"). No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El autor indica explícitamente que el repositorio contiene solo pesos, sin código de ejecución, y que debe cargarse con el chasis d3-flash.

## Capacidades

- Generación de texto: al derivar de Qwen3.5-9B, se espera capacidad de generación de texto general, aunque no se documentan capacidades específicas en la información disponible.
- Destilación orientada a decisiones: el entrenamiento se dirigió a reproducir las salidas de decisión de vllm-sr/d3-ultra, por lo que el modelo está especializado en tareas de decisión dentro del pool Zils d3-flash.
- Integración en el ecosistema d3-flash: requiere el chasis d3-flash para su carga y ejecución; no es un modelo autónomo con runtime propio.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Destilación de decisiones en pipelines internos: el modelo puede utilizarse como "body" dentro del pool Zils d3-flash para reproducir las decisiones de vllm-sr/d3-ultra en entornos donde no se quiera desplegar el modelo profesor, gracias a su entrenamiento específico de destilación.
- Evaluación de técnicas de weight averaging: sirve como caso de estudio para investigadores que quieran analizar el efecto del promediado de pesos tras fusionar un LoRA de rango 32 en bf16.
- Sustitución de modelos de ~9B en entornos con licencia Apache-2.0: al heredar la licencia permisiva de Qwen3.5-9B, puede integrarse en productos comerciales sin las restricciones de licencias copyleft, siempre que se valide su comportamiento.
- Experimentación con el chasis d3-flash: útil para desarrolladores que ya trabajan con la familia d3-flash y quieren probar variantes de "soup body" sin cambiar de infraestructura de carga.
- Investigación sobre destilación de salidas de decisión: el modelo documenta un pipeline concreto (LoRA rank 32, fusión en bf16, promediado) que puede replicarse o compararse en estudios de destilación.
- Base para ajustes finos posteriores: al ser un modelo de ~8,4B parámetros con pesos en safetensors y licencia Apache-2.0, puede servir como punto de partida para fine-tunes adicionales en tareas específicas, aunque requeriría validación previa de su calidad base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por el tamaño de 8,4B parámetros, en bf16 serían necesarios aproximadamente 16,8 GB solo para los pesos (coincide con el tamaño del repo), más overhead de activaciones y KV cache; en cuantización de 8 bits, alrededor de 8,4 GB; en 4 bits, alrededor de 4,2 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar que funcione en GPUs con 24 GB o más (RTX 4090, A100 40 GB, H100) en bf16, y en GPUs de 8-12 GB con cuantización agresiva, pero no hay confirmación del autor.
- ¿Cabe en consumer GPU?: no confirmado. Por tamaño, en bf16 no cabría en GPUs de 16 GB sin cuantización; con cuantización de 4-8 bits podría caber en RTX 3060/4060 Ti de 16 GB o RTX 4070 de 12 GB, sujeto a validación.
- Opciones de despliegue: el autor indica que debe cargarse con el chasis d3-flash. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| atamtensor/d3-flash-c140 | 8.392.695.024 | no disponible | Apache-2.0 | Hugging Face (0 descargas, 0 likes) | Fine-tune por destilación del base vllm-sr/d3-flash |
| vllm-sr/d3-flash (base) | no disponible | no disponible | Apache-2.0 | Hugging Face | Modelo base del que deriva; construido sobre Qwen/Qwen3.5-9B |
| Qwen/Qwen3.5-9B | ~9B (según referencia del autor) | no disponible | no disponible en la información | Hugging Face | Modelo original de la familia sobre la que se construye el base |
| vllm-sr/d3-ultra | no disponible | no disponible | no disponible | Hugging Face | Modelo profesor cuyas salidas de decisión se usaron para la destilación |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Información muy escasa: la model card es mínima y no documenta benchmarks, idiomas, contexto ni cuantizaciones; cualquier uso en producción requiere evaluación propia.
- Modelo derivado y especializado: está entrenado por destilación hacia salidas de decisión de otro modelo, por lo que su comportamiento fuera de ese dominio no está caracterizado.
- Dependencia del chasis d3-flash: el repositorio contiene solo pesos; sin el runtime adecuado no puede ejecutarse, lo que limita su portabilidad frente a modelos estándar de transformers.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de ~9B, es esperable cierto riesgo, pero no hay datos concretos.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no disponibles; no se puede confirmar la ventana de contexto efectiva ni los idiomas soportados.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las licencias del modelo base y del modelo original (Qwen3.5-9B) antes de un despliegue comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (2026-11-23), lo que sugiere un artefacto recién publicado y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/atamtensor/d3-flash-c140
- Modelo base: https://huggingface.co/vllm-sr/d3-flash
- Modelo original de la familia (referenciado por el autor): https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo profesor de la destilación (referenciado por el autor): vllm-sr/d3-ultra (enlace no disponible en la información proporcionada)

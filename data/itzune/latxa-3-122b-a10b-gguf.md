# itzune/Latxa-3-122B-A10B-GGUF

## Resumen

Latxa-3-122B-A10B es un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) desarrollado por el HiTZ Zentroa (UPV/EHU), el centro de tecnologías del lenguaje de la Universidad del País Vasco. Se trata de la tercera generación de la familia Latxa, concebida específicamente para el euskera, y se posiciona como el modelo en euskera más grande y capaz hasta la fecha. Su arquitectura parte de Qwen3.5-122B-A10B como modelo base, sobre el que se ha realizado una adaptación al euskera.

El modelo cuenta con 122.111.526.912 parámetros totales (unos 122B), distribuidos en 256 expertos con 8 expertos enrutados más 1 compartido activados por token, lo que resulta en aproximadamente 10B de parámetros activos por paso. Combina capacidades de comprensión de imágenes (pipeline image-text-to-text) con generación de texto e instrucciones en euskera, y opera exclusivamente en modo thinking: razona antes de responder, sin opción de desactivar ese comportamiento.

La relevancia actual del modelo radica en dos factores. Por un lado, cubre un hueco histórico en la disponibilidad de modelos de gran escala para una lengua de bajos recursos como el euskera. Por otro, esta ficha documenta la conversión a formato GGUF publicada por el usuario itzune, que permite ejecutar los pesos con llama.cpp y herramientas compatibles en hardware de consumo y estaciones de trabajo, ampliando el acceso más allá de infraestructura de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), arquitectura `qwen35` en llama.cpp; multimodal (image-text-to-text) |
| Parametros totales | 122.111.526.912 (~122B) |
| Parametros activos | ~10B por token (256 expertos, 8 enrutados + 1 compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (LLM); Q8_0 y F16 (codificador de visión) |
| Idiomas soportados | Euskera (entrenamiento y ajuste principal); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Latxa-3-122B-A10B es un transformer de tipo Mixture-of-Experts construido sobre Qwen3.5-122B-A10B. La capa MoE emplea 256 expertos, de los cuales se activan 8 enrutados más 1 compartido por token, lo que reduce el coste computacional a unos 10B de parámetros activos por token pese a mantener 122B en memoria. El modelo incorpora además un codificador de visión que se distribuye por separado en formato GGUF (mmproj), lo que permite procesar imágenes de forma opcional: la inferencia solo texto funciona sin cargar dicho componente.

El modelo ha sido adaptado al euskera por el HiTZ Zentroa a partir de la base Qwen3.5, e incorpora un modo de razonamiento (thinking) obligatorio: el modelo genera una cadena de razonamiento antes de la respuesta final, que se devuelve en el campo `reasoning_content` cuando se usa `--jinja` en llama.cpp. La model card advierte explícitamente de que no debe desactivarse el thinking (`enable_thinking: false`), ya que la calidad puede degradarse notablemente. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto e instrucciones en euskera, con razonamiento previo obligatorio (thinking mode).
- Comprensión de imágenes (image-text-to-text): descripción de contenido visual, respuesta a preguntas sobre imágenes.
- Razonamiento multi-paso: la cadena de pensamiento se expone de forma separada mediante `reasoning_content`.
- Conversación multi-turno (etiqueta `conversational` en Hugging Face).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Ejecución en CPU, CUDA, Metal, Vulkan y SYCL a través de llama.cpp.
- Capacidades de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Atención al ciudadano en euskera: el modelo puede gestionar conversaciones multi-turno y responder consultas administrativas o institucionales en euskera, aprovechando su ajuste específico al idioma y su modo de razonamiento para respuestas fundamentadas.
- Descripción y análisis de imágenes en euskera: con el codificador de visión (mmproj) cargado, puede procesar fotografías o documentos escaneados y responder preguntas sobre su contenido, útil en digitalización de archivos o accesibilidad.
- Generación de contenido editorial en euskera: redacción de artículos, resúmenes o materiales divulgativos con razonamiento previo, adecuado para medios de comunicación o administraciones que necesitan textos en euskera de calidad.
- Asistencia educativa: tutorización en euskera con explicaciones paso a paso, aprovechando el thinking mode para desglosar problemas y justificar las respuestas.
- Investigación en procesamiento del lenguaje natural para lenguas de bajos recursos: el modelo sirve como referencia para evaluar técnicas de adaptación de modelos multilingües grandes a lenguas minorizadas.
- Despliegue en infraestructura local con llama.cpp: mediante `llama serve` se expone una API compatible con OpenAI, lo que permite integrar el modelo en aplicaciones internas sin depender de servicios en la nube.
- Procesamiento de documentación técnica o jurídica en euskera: análisis de textos largos y extracción de información con razonamiento explícito, adecuado para entornos con requisitos de trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM mínima estimada: ~80 GB para Q4_K_M y ~140 GB para Q8_0. Al ser un modelo MoE, es necesario mantener todos los expertos en memoria; la reducción afecta solo al cómputo, no al espacio ocupado.
- Configuraciones de ejemplo indicadas por el autor para Q4_K_M: Mac Studio de 128 GB, 2× RTX 6000 de 48 GB, 4× RTX 3090 de 24 GB.
- Configuraciones de ejemplo para Q8_0: Mac Studio de 192 GB, 2× H100 de 80 GB.
- GPU consumer: no cabe en una única GPU consumer convencional (RTX 4090 de 24 GB); requiere múltiples GPU o un sistema con memoria unificada grande.
- Opciones de despliegue: llama.cpp (CLI `llama cli` o servidor `llama serve` con API compatible con OpenAI y Web UI), en CPU, CUDA, Metal, Vulkan y SYCL. Se requiere una compilación reciente de llama.cpp con soporte para la arquitectura `qwen35` (octubre de 2026 o posterior, build b6907+ / `llama` 0.6.0+).
- Latencia y throughput: no disponible en la información proporcionada.
- Los ficheros GGUF del LLM están divididos en partes (2 partes para Q4_K_M, 3 para Q8_0) por el límite de 50 GB por archivo de Hugging Face; debe apuntarse a la primera parte y llama.cpp carga el resto automáticamente.
- El codificador de visión se distribuye aparte: `mmproj-...-Q8_0.gguf` (~650 MB) o `mmproj-...-F16.gguf` (~1,2 GB); solo es necesario para procesar imágenes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Latxa-3-122B-A10B (este) | 122B totales / ~10B activos | no disponible | Apache 2.0 | GGUF en HF (repo de itzune) y safetensors en HiTZ | MoE multimodal, euskera, thinking obligatorio |
| Qwen3.5-122B-A10B | 122B totales / ~10B activos | no disponible | no disponible | HF (Qwen) | Modelo base sobre el que se construye Latxa 3 |
| Latxa 3 (variantes 4B/2B) | 4B / 2B | no disponible | no disponible | HF (HiTZ) | Mencionadas en la model card como versiones híbridas (thinking opcional) |
| Otros modelos en euskera de gran escala | no disponible | no disponible | no disponible | no disponible | No hay datos en la información proporcionada |

## Limitaciones y advertencias

- El modo thinking es obligatorio: desactivarlo (`enable_thinking: false`) puede degradar gravemente la calidad de las respuestas, según advierte el autor.
- El modelo está ajustado principalmente al euskera; su comportamiento en otros idiomas no está documentado en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos de gran escala; el razonamiento previo no garantiza la veracidad de los hechos.
- Sesgos conocidos: no disponible en la información proporcionada.
- Requisitos de memoria muy elevados (~80 GB en Q4_K_M, ~140 GB en Q8_0), lo que limita su despliegue a estaciones de trabajo o clústeres.
- Dependencia de una compilación reciente de llama.cpp con soporte `qwen35`; versiones anteriores no cargarán el modelo.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de la licencia del modelo base Qwen3.5 y de los pesos originales de HiTZ.
- Este repositorio es una conversión de terceros (itzune); los pesos originales, la model card oficial y los detalles de entrenamiento están en el repositorio de HiTZ.
- Longitud de contexto no documentada: no es posible planificar cargas de trabajo con ventanas largas sin verificar este dato en la fuente original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/itzune/Latxa-3-122B-A10B-GGUF
- Modelo base original (HiTZ): https://huggingface.co/HiTZ/Latxa-3-122B-A10B
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- HiTZ Zentroa: https://hitz.eus/
- llama.cpp: https://github.com/ggml-org/llama.cpp

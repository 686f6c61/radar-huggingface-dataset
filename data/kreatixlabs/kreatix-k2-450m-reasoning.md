# KreatixLabs/Kreatix-K2-450M-Reasoning

## Resumen

Kreatix K2 450M Reasoning es un modelo multimodal de tipo image-text-to-text desarrollado por KreatixLabs, un laboratorio que entrena sus modelos desde cero con una arquitectura propia denominada DDDA (patrón de bloques Gated DeltaNet combinados con atención completa). Esta variante concreta es un "depth-upscaling" del modelo base Kreatix K2 300M: se ha pasado de 16 a 24 capas mediante clonación de capas con inicialización identidad, alcanzando unos 427 millones de parámetros (18 capas Gated DeltaNet, 6 de atención completa y un codificador visual de 32M).

El modelo está afinado específicamente para razonamiento paso a paso mediante un modo `<think>`, además de tareas de código y conversación. Incorpora un tokenizador byte-level BPE de 65.536 tokens entrenado desde cero, una ventana de contexto de 8.192 tokens y pesos en BF16. Su licencia Apache 2.0 y su reducido tamaño lo sitúan como una opción interesante para experimentación en entornos con recursos limitados, prototipado rápido de pipelines multimodales y estudios académicos sobre arquitecturas híbridas de estado y atención.

Es relevante ahora porque combina tres tendencias actuales: arquitecturas híbridas eficientes (DeltaNet con compuertas), modelos pequeños con capacidad de razonamiento explícito y soporte multimodal nativo en un rango de parámetros que cabe en hardware de consumo. No obstante, al tratarse de un modelo de nicho con pocas descargas y sin benchmarks publicados, debe evaluarse con cautela en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet + Full Attention (patrón DDDA), transformer con capas de estado y atención completa |
| Parametros totales | 427.240.480 (~427M), de los cuales ~32M corresponden al codificador visual |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) y finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, `model.safetensors`); tokenizador en `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura DDDA combina 24 capas distribuidas en 18 bloques Gated DeltaNet y 6 bloques de atención completa. Gated DeltaNet es una variante de las arquitecturas de espacio de estado con compuertas que buscan reducir el coste computacional del mecanismo de atención tradicional manteniendo capacidad de modelado de secuencias largas; la intercalación con atención completa (6 de 24 capas) permite recuperar precisión en dependencias globales. El modelo parte de Kreatix K2 300M (16 capas, 4 bloques DDDA) y se ha expandido mediante clonación de capas con inicialización identidad, una técnica de depth up-scaling que preserva el comportamiento del modelo original antes del ajuste fino.

El ajuste fino combina trazas de razonamiento curado (OpenThoughts-114k, GSM8K), tareas de código (Magicoder) y datos conversacionales (SmolTalk). También se ha realizado una calibración explícita de identidad y de rechazos (en inglés y finés) para reforzar la identidad del modelo y reducir falsos positivos de seguridad. El tokenizador es un byte-level BPE de 65.536 tokens entrenado desde cero, lo que implica que no es compatible con tokenizadores de Llama, Qwen u otros modelos estándar. No se documentan detalles sobre el volumen total de tokens de preentrenamiento del modelo base ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento paso a paso mediante modo `<think>`, entrenado sobre trazas de razonamiento.
- Razonamiento matemático (ajustado con GSM8K).
- Generación de código (ajustado con Magicoder).
- Capacidades multimodales image-text-to-text: entrada de imágenes junto con texto, gracias al codificador visual de 32M de parámetros.
- Soporte de tool use / function calling (etiqueta `tool-use` en la model card).
- Conversación multi-turno (datos SmolTalk).
- Multilingüe limitado a inglés y finés, con calibración de identidad en ambos idiomas.
- Capacidad de rechazo calibrada para reducir falsos positivos de seguridad.

## Casos de uso

- Prototipado de asistentes conversacionales multilingües (inglés/finés): el modelo gestiona diálogos multi-turno con hasta 8.192 tokens de contexto, suficiente para sesiones de soporte típicas y para mantener el historial de conversación sin truncamientos agresivos.
- Razonamiento matemático asistido en entornos educativos: el modo `<think>` permite mostrar el proceso de resolución paso a paso, útil para tutores automáticos o generación de explicaciones didácticas en problemas de aritmética y álgebra básica.
- Asistencia de código en editores ligeros: al estar ajustado con Magicoder y soportar tool use, puede integrarse en pipelines de autocompletado o generación de funciones con llamadas a herramientas (ejecución de tests, consulta de documentación) en entornos con GPU de gama media.
- Descripción y análisis de imágenes en aplicaciones de accesibilidad: el pipeline image-text-to-text permite generar descripciones textuales de imágenes o responder preguntas sobre su contenido, adecuado para prototipos de lectores de pantalla o catalogación automática.
- Investigación sobre arquitecturas híbridas: al ser un modelo pequeño, from-scratch y con arquitectura DDDA documentada, sirve como banco de pruebas para estudiar el comportamiento de Gated DeltaNet frente a atención completa en tareas de razonamiento.
- Despliegue en hardware de consumo para demos y pruebas de concepto: con ~427M de parámetros en BF16 (menos de 1 GB de pesos), cabe en GPUs consumer modestas, lo que facilita demos locales sin infraestructura cloud.
- Evaluación de calibración de rechazos: útil para estudiar técnicas de reducción de falsos positivos de seguridad en modelos pequeños, dado el trabajo explícito de calibración de identidad y refusal del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 0,9-1,2 GB solo para pesos; con overhead de activaciones y caché KV, se recomienda al menos 2-4 GB de VRAM.
- VRAM estimada en FP16: similar a BF16, en torno a 1 GB de pesos.
- Cuantización: no se documentan variantes GGUF, AWQ ni GPTQ oficiales; la reducción a 8 bits o 4 bits requeriría conversión manual (no soportada oficialmente por la librería `k2`).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4); para mayor throughput, A10G, L4 o RTX 4090.
- Cabe en GPU consumer: sí, en la mayoría de GPUs consumer modernas con 4 GB o más de VRAM.
- Opciones de despliegue: la model card solo documenta la librería propia `kreatix` (paquete Python con `load_model` y `chat`); no se confirma soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kreatix K2 450M Reasoning | ~427M | 8.192 | Sí (image-text-to-text) | Apache 2.0 | Hugging Face, librería propia `k2` |
| Kreatix K2 300M (modelo base) | ~300M (no confirmado) | No disponible | No disponible | Apache 2.0 (según modelo derivado) | Hugging Face |
| SmolVLM-256M (Hugging Face) | ~256M | 2.048-8.192 según variante | Sí | Apache 2.0 | Hugging Face, transformers |
| Qwen2.5-0.5B-Instruct | ~494M | 32.768 | No | Apache 2.0 | Hugging Face, transformers, vLLM, Ollama |

Nota: los datos de los modelos comparativos provienen de conocimiento general y no de la información proporcionada sobre Kreatix; verificar antes de usarlos en decisiones de producción. Kreatix K2 450M destaca por su soporte multimodal en un tamaño muy reducido y su arquitectura híbrida, pero carece de la madurez de ecosistema (transformers, vLLM, GGUF) de alternativas como Qwen2.5 o SmolVLM.

## Limitaciones y advertencias

- Modelo de nicho con 0 descargas y solo 3 likes en el momento de la ficha: ecosistema y validación comunitaria prácticamente inexistentes.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas; el rendimiento real en tareas de razonamiento, código o matemáticas es desconocido.
- Tokenizador propio entrenado desde cero: incompatible con herramientas y plantillas de chat estándar (no funciona con tokenizadores de Llama/Qwen), lo que complica la integración.
- Librería de inferencia propietaria (`kreatix`, `k2`): no hay soporte confirmado para transformers, vLLM, llama.cpp, Ollama ni TGI, lo que limita el despliegue en producción.
- Idiomas limitados a inglés y finés: no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Contexto de 8.192 tokens: insuficiente para casos de uso con documentos largos o conversaciones muy extensas.
- Riesgo de alucinación inherente a modelos pequeños (~427M) y con ajuste fino sobre trazas de razonamiento: las cadenas `<think>` pueden contener pasos plausibles pero incorrectos.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse con datasets públicos (OpenThoughts, Magicoder, SmolTalk) hereda los sesgos de estos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; revisar las licencias de los datasets de ajuste fino si se redistribuye.
- El calibrado de rechazos puede haber reducido la sensibilidad ante contenido problemático; conviene validar el comportamiento de seguridad antes de exponerlo a usuarios finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KreatixLabs/Kreatix-K2-450M-Reasoning
- Modelo base: https://huggingface.co/KreatixLabs/Kreatix-K2-300M
- Repositorio del modelo (clonado vía git): https://huggingface.co/KreatixLabs/Kreatix-K2-450M-Reasoning (instrucciones `git clone` en la model card)
- Dataset OpenThoughts-114k: no se proporciona enlace directo en la información disponible
- Dataset GSM8K: no se proporciona enlace directo en la información disponible
- Dataset Magicoder: no se proporciona enlace directo en la información disponible
- Dataset SmolTalk: no se proporciona enlace directo en la información disponible
- Paper de Gated DeltaNet: no se proporciona enlace en la información disponible
- Blog o demo del autor: no disponible

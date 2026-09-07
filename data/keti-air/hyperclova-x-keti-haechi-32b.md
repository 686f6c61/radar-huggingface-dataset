# KETI-AIR/HyperCLOVA-X-KETI-HAECHI-32B

## Resumen

HyperCLOVA X KETI-HAECHI-32B es un modelo multimodal de visión y lenguaje (image-text-to-text) desarrollado por KETI-AIR como ajuste fino del modelo base `naver-hyperclovax/HyperCLOVAX-SEED-Think-32B`. El objetivo principal es mejorar la comprensión del patrimonio cultural coreano y el reconocimiento óptico de caracteres (OCR) en coreano, así como reforzar las capacidades de llamada a herramientas y ejecución de agentes multi-paso con estado. El modelo conserva además las capacidades generales multimodales, lingüísticas y de generación de código del modelo base.

El checkpoint tiene 33.313.410.304 parámetros totales y se distribuye en formato safetensors con pesos en BF16. La licencia es personalizada (`hyperclovax`) y el modelo soporta coreano e inglés. La documentación incluye un modo de razonamiento activable (`thinking mode`) y ejemplos de uso con Transformers, requiriendo `trust_remote_code=True` por contener código personalizado. Su relevancia radica en la combinación de visión, OCR coreano y capacidades de agente en un único modelo de 32B, orientado a aplicaciones de patrimonio cultural y automatización de tareas largas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal visión-lenguaje (VLM) basado en HyperCLOVAX-SEED-Think-32B; arquitectura interna no especificada en la información disponible |
| Parametros totales | 33.313.410.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint oficial); otras cuantizaciones no disponibles |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | hyperclovax (licencia personalizada, consultar archivo LICENSE) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

HyperCLOVA X KETI-HAECHI-32B es un ajuste fino (finetune) del modelo `naver-hyperclovax/HyperCLOVAX-SEED-Think-32B`, desarrollado por KETI-AIR. El modelo base es un sistema multimodal de visión y lenguaje con soporte de razonamiento, y el ajuste se ha centrado en dos áreas: la identificación de nombres oficiales de objetos de patrimonio cultural coreano y la lectura de texto coreano en imágenes, señales y documentos públicos; y la mejora de la selección y llamada de herramientas, el mantenimiento de estado entre turnos y la ejecución de tareas de largo horizonte.

El checkpoint incluye código personalizado para el modelo y el procesador, por lo que es necesario usar `trust_remote_code=True` al cargarlo con Transformers. No se han publicado en la información disponible detalles sobre el conjunto de datos de entrenamiento, el número de tokens, la composición del corpus ni si se aplicaron técnicas como RLHF o DPO. La documentación indica que el modelo conserva las capacidades generales del modelo base y que el modo de razonamiento puede activarse para tareas que requieran un mayor presupuesto de generación.

## Capacidades

- Comprensión multimodal de imágenes y texto en coreano e inglés, incluyendo razonamiento visual general.
- Identificación de nombres oficiales de objetos de patrimonio cultural coreano a partir de imágenes.
- OCR de texto coreano en señales, escenas, texto renderizado y documentos públicos.
- Selección y llamada de herramientas (tool calling / function calling).
- Ejecución de tareas de largo horizonte con mantenimiento de estado entre turnos y seguimiento de objetivos complejos.
- Modo de razonamiento activable (`thinking=True`) para tareas que requieren un análisis más profundo.
- Capacidades generales de generación de lenguaje y código heredadas del modelo base.
- Respuesta a preguntas basadas en imágenes (visual question answering) en el dominio especializado y en contextos generales.

## Casos de uso

- Catalogación de patrimonio cultural: el modelo identifica el nombre oficial de objetos en imágenes de museos y archivos, lo que permite automatizar la indexación y el etiquetado de colecciones digitales. Es adecuado porque ha sido afinado específicamente para este dominio.
- Digitalización de documentos históricos coreanos: mediante OCR, extrae texto de documentos escaneados, señales y material público, facilitando la creación de archivos buscables y la preservación digital.
- Asistentes turísticos en museos: responde preguntas sobre obras y monumentos a partir de fotografías, en coreano e inglés, usando el contexto visual para proporcionar respuestas precisas.
- Agentes de automatización multi-paso: gracias al soporte de tool calling y al mantenimiento de estado entre turnos, puede ejecutar flujos complejos como reservas, consultas a bases de datos o encadenado de APIs, trabajando hacia un objetivo final sin perder información intermedia.
- Atención al cliente multimodal: gestiona conversaciones en las que el usuario envía capturas de pantalla o fotografías, extrayendo información relevante y respondiendo en lenguaje natural. Es adecuado por su capacidad de combinar visión y texto en un mismo diálogo.
- Generación de código asistida por visión: conserva capacidades de generación de código del modelo base y puede interpretar diagramas, capturas de interfaz o imágenes de documentación para producir código o explicaciones técnicas.
- Traducción y comprensión bilingüe: procesa documentos mixtos en coreano e inglés que incluyen elementos visuales, lo que resulta útil en entornos de trabajo colaborativos y en la localización de contenidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una comparativa visual con el modelo base HyperCLOVAX-SEED-Think-32B en áreas como patrimonio cultural, OCR coreano, ejecución de agentes de largo horizonte y tool calling, pero no se aportan cifras concretas en el extracto facilitado. Por tanto, no es posible presentar una tabla de resultados numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en BF16 ocupa aproximadamente 66,6 GB (33.313.410.304 parámetros × 2 bytes). Para inferencia con activaciones y caché, el ejemplo oficial utiliza dos GPUs de 80 GB con `max_memory` de 76 GiB por GPU.
- GPU recomendadas: dos unidades de A100 80 GB o H100 80 GB. No se recomienda una sola GPU de 80 GB debido al overhead de activaciones y caché.
- GPU de consumo: no es viable sin cuantización; no se proporcionan cuantizaciones de menor precisión en la información disponible.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (verificado en el ejemplo oficial). También se menciona OmniServe como runtime compatible con OpenAI. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar con alternativas. El modelo se compara directamente con su base `naver-hyperclovax/HyperCLOVAX-SEED-Think-32B`, pero no se proporcionan métricas detalladas en la información disponible. No se han identificado otros modelos de referencia con datos públicos suficientes para una comparativa fiable.

## Limitaciones y advertencias

- Licencia personalizada `hyperclovax`: es una licencia no estándar; se debe revisar el archivo LICENSE antes de cualquier uso comercial o redistribución.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; se recomienda auditar el código antes de su uso en producción.
- Enfoque en patrimonio cultural coreano y OCR coreano: el rendimiento puede degradarse en otros dominios culturales, contextos visuales o idiomas distintos del coreano e inglés.
- No se documentan sesgos específicos, pero al ser un modelo afinado con datos coreanos, puede presentar sesgos hacia ese contexto y un rendimiento inferior en culturas o regiones no representadas.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de robustez ni tasas de error.
- Longitud de contexto no especificada en la información disponible; se desconoce el límite exacto de tokens de entrada.
- Soporte de idiomas limitado a coreano e inglés; no se garantiza un rendimiento adecuado en otros idiomas.

## Enlaces

- HuggingFace: https://huggingface.co/KETI-AIR/HyperCLOVA-X-KETI-HAECHI-32B
- Modelo base: https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-32B
- OmniServe: https://github.com/NAVER-Cloud-HyperCLOVA-X/OmniServe

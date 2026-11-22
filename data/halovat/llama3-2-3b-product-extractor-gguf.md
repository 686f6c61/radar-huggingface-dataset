# halovat/llama3.2-3b-product-extractor-gguf

## Resumen

Llama-3.2-3B Product Spec Extractor es un ajuste fino del modelo Llama-3.2-3B-Instruct de Meta, publicado por el usuario halovat en Hugging Face. El modelo está especializado en una tarea muy concreta: extraer especificaciones de producto estructuradas en JSON a partir de listados ruidosos y multilingües (inglés, ruso y uzbeko). El resultado sigue un esquema estricto de cinco claves (brand, model, ram_gb, storage_gb, price_usd) y, según el autor, no requiere system prompt.

El ajuste se realizó mediante QLoRA con rango 16 usando Unsloth y enmascaramiento de pérdida solo en la respuesta (response-only loss masking), lo que concentra el aprendizaje en el formato de salida. El modelo base es la variante de 3B parámetros de Llama 3.2 Instruct, por lo que hereda su arquitectura transformer y su licencia Llama 3.2.

La relevancia de esta ficha es acotada: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a pipelines de extracción de datos de catálogo. Su interés práctico reside en el formato de pesos GGUF, que facilita el despliegue local en hardware modesto para tareas de parsing estructurado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2, ajuste fino QLoRA) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.2 admite 128k tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | GGUF (el repositorio incluye pesos en formato GGUF; niveles concretos no disponibles) |
| Idiomas soportados | inglés, ruso y uzbeko (según la model card, para la tarea de extracción); lista oficial de idiomas no disponible |
| Licencia | llama3.2 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Llama-3.2-3B-Instruct-bnb-4bit, es decir, una versión cuantizada a 4 bits del Llama-3.2-3B-Instruct, y se ajusta con QLoRA de rango 16 mediante la librería Unsloth. La innovación técnica declarada es el uso de response-only loss masking, que enmascara los tokens de la instrucción y calcula la pérdida únicamente sobre la respuesta JSON, favoreciendo que el modelo aprenda el esquema de salida sin contaminar el objetivo con el texto de entrada.

No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO adicionales. La model card únicamente indica que el entrenamiento se orientó a listados de producto ruidosos y multilingües en inglés, ruso y uzbeko, con el objetivo de producir un JSON estricto de cinco claves sin necesidad de system prompt.

## Capacidades

- Extracción de especificaciones de producto en JSON estricto con cinco claves: brand, model, ram_gb, storage_gb y price_usd.
- Manejo de entradas ruidosas y de listados multilingües en inglés, ruso y uzbeko.
- Funcionamiento sin system prompt: el formato de salida se induce directamente desde la instrucción del usuario.
- Uso de null para campos ausentes en el listado de origen (según el ejemplo de la model card).
- Generación de texto conversacional heredada del modelo base Llama-3.2-3B-Instruct (capacidad no validada específicamente para este ajuste).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo thinking: no disponibles.

## Casos de uso

- Normalización de catálogos de e-commerce: el modelo recibe la descripción libre de un producto y devuelve un JSON con marca, modelo, RAM, almacenamiento y precio, lo que permite poblar bases de datos estructuradas a partir de fichas heterogéneas.
- Enriquecimiento de feeds de marketplaces multilingües: al cubrir inglés, ruso y uzbeko, puede procesar listados de proveedores de distintas regiones y unificar su esquema antes de la ingesta.
- Extracción de precios para comparadores: el campo price_usd permite alimentar sistemas de seguimiento de precios a partir de textos de anuncios sin estructura fija.
- Pipeline de limpieza de datos para entrenamiento: puede usarse como extractor previo para convertir corpus de listados en pares estructurados que alimenten otros modelos o sistemas de búsqueda.
- Automatización de backoffice en comercio electrónico: integrado en un flujo por lotes, reduce la revisión manual de fichas de producto incompletas o mal formateadas.
- Prototipado local de tareas de parsing: al distribuirse en GGUF, puede ejecutarse en portátiles o estaciones de trabajo sin GPU dedicada para validar el esquema de extracción antes de escalar a producción.
- Preprocesado en sistemas de recomendación: los campos normalizados (marca, RAM, almacenamiento) sirven como features categóricas para motores de recomendación o filtros de búsqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 3.2B parámetros en GGUF, las estimaciones habituales rondan 2-3 GB en cuantizaciones de 4 bits y 5-7 GB en 8 bits, aunque el nivel exacto de cuantización del repositorio no se especifica.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo es compatible con GPU consumer de gama media y alta (por ejemplo, RTX 3060 en adelante), si bien esta afirmación no está confirmada por el autor.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del repositorio (2.0 GB) y el formato GGUF, aunque no hay validación oficial.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints de Hugging Face. No se confirma soporte de vLLM o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| halovat/llama3.2-3b-product-extractor-gguf | 3.212.749.888 | no disponible | Extracción JSON de productos (EN/RU/UZ) | llama3.2 | GGUF en Hugging Face, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3.210.000.000 aprox. | 128k tokens (modelo base) | Instrucciones generales | llama3.2 | Amplia, muy extendida |
| unsloth/Llama-3.2-3B-Instruct-bnb-4bit | 3.210.000.000 aprox. | 128k tokens (modelo base) | Instrucciones generales cuantizado a 4 bits | llama3.2 | Amplia en Hugging Face |

La comparativa se limita a la familia de origen, ya que no se dispone de información sobre otros ajustes finos comparables de extracción JSON en este tamaño. Los datos de parámetros del modelo base son aproximados y no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: solo se ha validado, según el autor, para extraer un esquema fijo de cinco claves; fuera de esa tarea su comportamiento no está documentado.
- Riesgo de alucinación: al ser un ajuste de un modelo de 3B, puede inventar valores (por ejemplo, precios o capacidades) cuando el listado de entrada es ambiguo o incompleto; el uso de null mitiga parcialmente este riesgo, pero no lo elimina.
- Cobertura lingüística limitada: la model card solo menciona inglés, ruso y uzbeko; no hay datos sobre rendimiento en castellano ni en otros idiomas.
- Longitud de contexto no confirmada para este ajuste: aunque el modelo base admite ventanas amplias, no se especifica si el ajuste conserva ese comportamiento ni cómo afecta a listados largos.
- Licencia Llama 3.2: impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos completos antes de desplegarlo en producción.
- Sin métricas publicadas: no hay benchmarks, evaluaciones ni tasas de acierto reportadas, lo que impide estimar su calidad frente a alternativas.
- Madurez baja: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso en producción ni mantenimiento posterior.
- Formato de salida rígido: cambios en el esquema JSON requerirían un nuevo ajuste fino, ya que el modelo está entrenado para un contrato de cinco claves.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/halovat/llama3.2-3b-product-extractor-gguf
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-bnb-4bit
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- Llama 3.2 (Meta): https://www.llama.com/

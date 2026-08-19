# Ionio-ai/Qwen2.5-0.5B-Instruct-Ecommerce-Extraction-GGUF

## Resumen

Modelo de extracción de información estructurada para consultas de búsqueda en comercio electrónico, desarrollado por Ionio-ai. Se trata de un ajuste fino con LoRA de rango 32 sobre Qwen2.5-0.5B-Instruct, especializado en convertir consultas en lenguaje natural en filtros estructurados en formato JSON, validados contra un esquema JSON proporcionado por el usuario. Con 494 millones de parámetros, es una opción compacta para pipelines de extracción donde el coste de inferencia y la fiabilidad del formato de salida son críticos.

El modelo se distribuye en cinco cuantizaciones GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q3_K_M) y está pensado para despliegue ligero con llama.cpp. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. Su relevancia radica en el contrato de prompt: la salida es siempre un objeto JSON estricto, sin markdown ni comentarios, que valida contra un esquema Draft 2020-12, lo que facilita su integración programática en sistemas de búsqueda y recomendación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 494.032.768 (494M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-0.5B-Instruct, un transformer decoder-only de 494 millones de parámetros. El ajuste fino se realizó con LoRA de rango 32, dos épocas, programación de tasa de aprendizaje coseno y pérdida aplicada únicamente a las respuestas del asistente (assistant-only loss). El entrenamiento utilizó el dataset Ionio-ai/ecommerce-search-extraction, compuesto por consultas de búsqueda de comercio electrónico anotadas con filtros estructurados.

La innovación principal no está en la arquitectura, sino en el contrato de prompt: el sistema exige que la salida sea un objeto JSON único, válido contra un esquema JSON proporcionado en el mensaje de usuario. El esquema es "sin valores": contiene claves y tipos permitidos, pero nunca valores objetivo. Todas las claves son obligatorias, no se permiten propiedades adicionales y los tipos escalares admiten JSON null. Esto garantiza que la salida sea siempre parseable y validable de forma programática. No se distribuye una versión F16 del GGUF porque llama.cpp puede descuantizar dinámicamente en tiempo de inferencia.

## Capacidades

- Extracción de filtros estructurados (tipo de producto, marca, color, precio máximo, etc.) a partir de consultas de búsqueda en lenguaje natural.
- Generación de JSON estricto validado contra un esquema JSON Draft 2020-12 proporcionado por el usuario en el mensaje.
- Adherencia estructural al esquema: claves obligatorias, sin propiedades adicionales, arrays preservados y tipos escalares con soporte de null.
- Salida sin markdown, fences de código ni comentarios: solo el objeto JSON.
- Preservación de la ortografía y capitalización exacta de las claves JSON.
- Gestión de valores ausentes mediante JSON null (no Python None, claves omitidas ni la cadena "null").
- Inferencia determinista con temperatura 0 y top_p 1, recomendada por el autor.
- Modelo no razonador: no requiere ni soporta modo thinking.

## Casos de uso

- Normalización de consultas en motores de comercio electrónico: el modelo convierte consultas libres como "men's Nike running shoes in red under $100" en filtros estructurados (product_type, brand, color, price_max) aplicables directamente a una base de datos de productos o a un índice de búsqueda.
- Pipelines de extracción en tiempo real: gracias a su tamaño reducido (379 MiB en Q4_K_M) y su compatibilidad con llama.cpp, puede desplegarse en CPU o GPU de gama baja para procesar consultas con latencia mínima en endpoints de búsqueda.
- Enriquecimiento de logs de búsqueda: permite analizar históricos de consultas de usuarios para extraer atributos estructurados (marcas, rangos de precio, categorías) y alimentar análisis de demanda o personalización.
- Integración en asistentes de compra conversacionales: el modelo actúa como capa de extracción entre un chatbot y el backend de productos, garantizando que las intenciones del usuario se traduzcan en filtros válidos antes de ejecutar la consulta.
- Normalización y limpieza de datos de catálogo: al extraer solo campos representados en el esquema y emitir null para valores ausentes, puede usarse para detectar inconsistencias en descripciones de producto o para unificar atributos de distintos proveedores.
- Automatización de pruebas de motores de búsqueda: al generar salidas JSON estrictas y deterministas (temperatura 0), el modelo puede emplearse en suites de test para verificar que un motor responde correctamente a consultas con filtros implícitos.

## Benchmarks y rendimiento

Los resultados se obtuvieron sobre un split retenido de 1.095 ejemplos, con construcción de prompt idéntica al entrenamiento, backend CUDA de llama.cpp, 64 peticiones concurrentes, temperatura 0 y un máximo de 4096 tokens generados. Las ejecuciones de cuantización fueron concurrentes, por lo que la latencia no debe interpretarse como benchmark aislado.

| Cuantizacion | Tamano (MiB) | JSON estricto | Valido segun esquema | Exacto | Leaf F1 | Key F1 | Precision null | Truncados |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 | 506.5 | 99,73% | 99,00% | 20,73% | 84,98% | 99,07% | 99,00% | 1 |
| Q6_K | 482.3 | 99,73% | 99,00% | 20,55% | 84,84% | 99,01% | 99,02% | 1 |
| Q5_K_M | 400.6 | 99,63% | 98,90% | 19,09% | 84,23% | 98,99% | 99,00% | 2 |
| Q4_K_M | 379.4 | 99,27% | 98,08% | 20,82% | 84,50% | 98,53% | 98,49% | 1 |
| Q3_K_M | 339.0 | 99,54% | 97,72% | 19,00% | 83,78% | 98,68% | 98,28% | 1 |
| Referencia BF16 fusionado | — | 99,54% | 98,90% | 20,82% | 84,89% | — | — | — |

Definiciones: JSON estricto indica que la respuesta completa se parsea como un único valor JSON sin fences de código ni comentarios. Valido segun esquema indica que el objeto parseado cumple el esquema Draft 2020-12 por ejemplo. Exacto es igualdad sensible a mayúsculas con el JSON dorado completo; el orden de arrays es significativo. Leaf F1 es la media macro de F1 sobre pares (ruta JSON, valor tipado) aplanados. Key F1 es la media macro de F1 sobre rutas JSON aplanadas, ignorando valores. Precision null es la precisión media sobre rutas doradas con null. Truncados son respuestas que alcanzaron el límite de 4096 tokens.

El autor recomienda Q4_K_M como opción práctica por defecto y Q6_K para mayor fidelidad. Q3_K_M prioriza tamaño pero puede degradar materialmente la adherencia al esquema.

## Requisitos de hardware

- VRAM estimada: entre 339 MiB (Q3_K_M) y 507 MiB (Q8_0) para los pesos del modelo. Con overhead de contexto y KV cache, cabe cómodamente en cualquier GPU con 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente; también puede ejecutarse íntegramente en CPU.
- Compatible con GPU consumer: sí, incluidas iGPU con 2 GB de VRAM para las cuantizaciones más pequeñas.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio y cualquier runtime compatible con GGUF. También es compatible con endpoints de Hugging Face.
- Latencia y throughput: no se han publicado benchmarks de latencia aislados. Dado el tamaño del modelo (0.5B), se espera un throughput elevado en GPU modernas, del orden de cientos de tokens por segundo en hardware consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Ionio-ai/Qwen2.5-0.5B-Instruct-Ecommerce-Extraction-GGUF | 494M | 32K | Extraccion e-commerce con esquema JSON | Apache 2.0 | GGUF |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 494M | 32K | Chat general | Apache 2.0 | Safetensors, GGUF |
| Ionio-ai/Qwen2.5-0.5B-Instruct-Ecommerce-Extraction-LoRA | 494M | 32K | Extraccion e-commerce (adaptador LoRA) | Apache 2.0 | Safetensors |

La comparación con el modelo base es la más relevante: el ajuste fino añade adherencia estricta al esquema JSON y extracción de filtros, capacidades que el modelo base no garantiza de forma fiable. La versión LoRA permite integrar el adaptador sobre el modelo base si se prefiere gestionar los pesos por separado. No se dispone de datos comparativos con otros modelos de extracción de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo extrae campos representados en el esquema proporcionado; no es un extractor de propósito general.
- La calidad de la extracción refleja la calidad de anotación del dataset de entrenamiento (Ionio-ai/ecommerce-search-extraction).
- La métrica Exact es deliberadamente estricta: un error de capitalización o un valor incorrecto invalida el ejemplo completo (20,82% de exactitud en Q4_K_M).
- Los resultados se aplican al dataset retenido y al prompt de evaluación; otros esquemas, idiomas, versiones de llama.cpp, plantillas de chat o parámetros de muestreo pueden comportarse de forma diferente.
- No se deben tratar los atributos inferidos como hechos de producto

# Ionio-ai/Qwen2.5-0.5B-Instruct-Ecommerce-Extraction-LoRA

## Resumen

Ionio-ai/Qwen2.5-0.5B-Instruct-Ecommerce-Extraction-LoRA es un adaptador PEFT LoRA desarrollado por Ionio-ai sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Su propósito es extraer filtros de producto estructurados a partir de consultas de búsqueda en comercio electrónico, devolviendo un objeto JSON que cumple un esquema definido por el usuario. El adaptador se ha entrenado mediante fine-tuning supervisado (SFT) con el dataset propio Ionio-ai/ecommerce-search-extraction, que contiene 9.341 ejemplos de entrenamiento y 549 de validación.

El modelo resuelve el problema de convertir una consulta de texto libre (por ejemplo, "men's Nike running shoes in red under $100") en un JSON con campos tipados como `product_type`, `brand`, `color` o `price_max`, respetando un esquema JSON proporcionado en el prompt. Es relevante porque ofrece una solución ligera y eficiente para tareas de extracción de información en entornos de producción con restricciones de recursos, al basarse en un modelo de solo 0.5 mil millones de parámetros. El adaptador no incluye los pesos del modelo base, por lo que debe cargarse sobre Qwen2.5-0.5B-Instruct.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-0.5B-Instruct (transformer decoder-only) + adaptador LoRA |
| Parametros totales | Adaptador: 17.596.416 entrenables (0,5B en el modelo base, no incluidos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens durante el entrenamiento; el modelo base soporta hasta 128K |
| Tipos de cuantizacion | No disponible (entrenado en BF16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-0.5B-Instruct, un modelo transformer decoder-only de la serie Qwen2.5. El adaptador LoRA se aplica a las proyecciones de atención y MLP, con rank 32, alpha 64 y dropout 0.05. El entrenamiento se realizó con TRL `SFTTrainer` 0.29.1, con pérdida solo sobre las respuestas del asistente, durante 2 épocas, con programación coseno y una tasa de aprendizaje máxima de 2e-04. El tamaño de lote efectivo fue de 336 y la longitud máxima de secuencia de 2.048 tokens. Se usó precisión BF16, gradient checkpointing y kernels Liger. El entrenamiento completo tomó 7,4 minutos en una NVIDIA RTX PRO 6000 Blackwell Workstation Edition.

El dataset de entrenamiento, Ionio-ai/ecommerce-search-extraction, contiene consultas de ecommerce con esquemas JSON asociados. El prompt de entrenamiento sigue la plantilla de chat del modelo base con exactamente dos mensajes: un mensaje de sistema fijo que instruye al modelo a devolver solo JSON válido, y un mensaje de usuario con la consulta y el esquema compactado. El esquema debe estar libre de valores, con todas las claves requeridas y tipos escalares que admiten `null`.

## Capacidades

- Extracción de filtros de producto estructurados a partir de consultas de búsqueda en ecommerce.
- Generación de JSON válido que cumple un esquema JSON proporcionado en el prompt, incluyendo claves requeridas, anidamiento y tipos.
- Manejo de valores ausentes mediante `null` JSON para campos escalares requeridos.
- Respeto exacto de la ortografía y capitalización de las claves JSON.
- Salida sin markdown ni explicaciones adicionales (solo el objeto JSON).
- No dispone de tool calling, razonamiento multi-paso ni capacidades multimodales; es un modelo de generación de texto puro.

## Casos de uso

- Motores de búsqueda de comercio electrónico: el adaptador convierte consultas de usuario en filtros estructurados que pueden alimentar directamente consultas SQL o Elasticsearch, reduciendo la necesidad de reglas manuales de parsing.
- Asistentes de compra conversacionales: integrado en un chatbot, permite extraer atributos como talla, color o precio máximo de una frase del usuario y pasarlos al backend de catálogo.
- Normalización de consultas para sistemas de recomendación: al estandarizar las consultas en un JSON tipado, se pueden comparar y agregar comportamientos de búsqueda.
- Enriquecimiento de logs de búsqueda: procesar consultas históricas para extraer intenciones de filtrado y mejorar análisis de producto.
- Automatización de pruebas de motores de búsqueda: generar casos de prueba con consultas sintéticas y verificar que el motor devuelve los filtros esperados.
- Migración de sistemas de búsqueda antiguos: transformar consultas de texto libre en un formato estructurado para nuevos backends sin reescribir la lógica de consulta.

## Benchmarks y rendimiento

Los resultados de evaluación se obtuvieron sobre un conjunto de prueba retenido de 1.095 ejemplos, con inferencia greedy (temperatura 0, top_p=1) usando vLLM. Las métricas se detallan a continuación:

| Metrica | Resultado |
|---|---|
| JSON estricto | 99,54 % |
| Validez de esquema | 98,90 % |
| Coincidencia exacta | 20,82 % |
| Coincidencia exacta sin mayúsculas | 23,93 % |
| Precisión de hojas | 85,07 % |
| Recall de hojas | 84,79 % |
| F1 de hojas | 84,89 % |
| F1 de claves | 98,89 % |
| Precisión de tipos alineados | 99,43 % |
| Precisión de null | 98,82 % |
| Salidas truncadas | 3 / 1.095 |

La baja coincidencia exacta (20,82 %) indica que el modelo a menudo produce valores ligeramente diferentes en formato (por ejemplo, normalización de precios o sinónimos), aunque la precisión de hojas y el F1 de claves son altos. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia con el adaptador requiere cargar el modelo base Qwen2.5-0.5B-Instruct (aproximadamente 1 GB en BF16) más el adaptador LoRA (menos de 0,1 GB). La VRAM total estimada para inferencia es de 1,5 a 2 GB, dependiendo de la longitud de secuencia y el motor de inferencia.
- Puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o incluso en CPU con llama.cpp u Ollama, aunque con menor throughput.
- Para despliegue en producción se recomienda vLLM o TGI con soporte de LoRA dinámico, o bien fusionar los pesos del adaptador en el modelo base para simplificar el despliegue.
- El entrenamiento se realizó en una NVIDIA RTX PRO 6000 Blackwell Workstation Edition en 7,4 minutos; para inferencia, una GPU de gama media es suficiente.
- Latencia estimada: en una GPU moderna, la generación de un JSON corto (menos de 100 tokens) suele completarse en menos de 200 ms con batch pequeño. No se dispone de mediciones exactas publicadas.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros adaptadores de extracción de ecommerce en la información proporcionada. Como referencia, el modelo base Qwen2.5-0.5B-Instruct sin adaptador no está especializado en esta tarea y produciría salidas menos estructuradas. Alternativas genéricas de extracción de información como GPT-4o o Claude serían más potentes pero mucho más pesadas y costosas. La ventaja de este adaptador es su tamaño reducido y su licencia Apache 2.0, que permite uso comercial sin restricciones.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; no se garantiza rendimiento en otros idiomas.
- El rendimiento medido corresponde al conjunto de prueba del dataset fuente y depende de sus convenciones de anotación y normalización. Otros esquemas, prompts o dominios pueden degradar los resultados.
- La coincidencia exacta es baja (20,82 %), lo que implica que los valores extraídos pueden variar en formato o redacción; se recomienda validar y normalizar la salida antes de usarla en sistemas críticos.
- El adaptador requiere el prompt de sistema exacto descrito en la model card; cambios en el formato pueden afectar significativamente la calidad de la extracción.
- No se debe tratar los atributos inferidos como hechos verificados del producto; son interpretaciones de la consulta.
- El adaptador no incluye los pesos del modelo base, por lo que es necesario descargar ambos componentes para su uso.
- No se documentan cuantizaciones oficiales del adaptador; si se requiere cuantización, debe probarse la compatibilidad con el motor de inferencia.

## Enlaces

- [Repositorio HuggingFace del adaptador](https://huggingface.co/Ionio-ai/Qwen2.5-0.5B-Instruct-Ecommerce-Extraction-LoRA)
- [Modelo base Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)
- [Dataset de entrenamiento Ionio-ai/ecommerce-search-extraction](https://huggingface.co/datasets/Ionio-ai/ecommerce-search-extraction)
- [Página del modelo base en Ollama](https://ollama.com/library/qwen2.5:0.5b-instruct)

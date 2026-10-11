# KleptoCook/recipe-reader

## Resumen

KleptoCook/recipe-reader es un ajuste fino de Qwen/Qwen3.5-0.8B (752.393.024 parámetros) desarrollado por KleptoCook, el equipo de la aplicación de recetas del mismo nombre. Su función es convertir el pie de foto de una publicación de cocina, o una receta extraída de una página web, en una receta estructurada con título, raciones, tiempo, ingredientes (cantidad, unidad y nombre, agrupados por partes) y elaboración paso a paso. No es un modelo conversacional general: espera el formato de prompt y de respuesta compacto de la aplicación y devuelve ese mismo formato.

La relevancia del modelo es de despliegue, no de escala. Se distribuye únicamente como GGUF Q4_K_M de 529 MB y se ejecuta en el propio teléfono mediante llama.cpp (la app usa llama.rn), de forma que el texto del usuario no sale del dispositivo. El ajuste se hizo con LoRA fusionado, cuantizado después con llama.cpp build 10256 y sin la capa de predicción multi-token del modelo base.

Se trata de un modelo muy especializado y de nicho: el conjunto de entrenamiento ronda las 2.600 recetas en inglés, el repositorio no tiene descargas ni valoraciones y no se han publicado resultados de benchmarks. Su licencia Apache 2.0, heredada del modelo base, permite uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3.5-0.8B), ajuste fino con LoRA fusionado |
| Parámetros totales | 752.393.024 (aproximadamente 0,75 B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (529 MB); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (en); la salida usa inglés británico |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido con llama.cpp build 10256); el recuento de parámetros de la ficha de HuggingFace procede de safetensors |

Otros datos: tamaño del repositorio 0,5 GB, pipeline no disponible, 0 descargas y 0 valoraciones en el momento de la consulta, creado el 2026-10-10 y actualizado el 2026-10-10.

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,75 B de parámetros, sobre el que se aplicó un ajuste fino con LoRA que posteriormente se fusionó en los pesos base. La conversión a GGUF se hizo con la build 10256 de llama.cpp, la misma que integra la librería llama.rn de la aplicación, y se eliminó la capa de predicción multi-token del modelo base durante la conversión. El artefacto distribuido es una única cuantización Q4_K_M de 529 MB.

El corpus de entrenamiento son aproximadamente 2.600 recetas y páginas de recetas en inglés: pies de foto escritos específicamente para el ajuste, páginas públicas de recetas y pies de publicaciones importadas por el desarrollador. Antes del entrenamiento se eliminaron identificadores de cuenta, direcciones de correo, números de teléfono y enlaces. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo una fase de alineación adicional (RLHF o DPO) más allá del ajuste supervisado. La salida está restringida al formato corto de respuesta de la aplicación, con nombres de ingredientes en inglés británico, en lugar de texto libre.

## Capacidades

- Extracción estructurada de recetas: a partir de un pie de foto o del texto de una página web genera título, raciones, tiempo total, ingredientes con cantidad, unidad y nombre, agrupación de ingredientes por partes de la receta y elaboración con un paso por línea.
- Normalización de cantidades y unidades al formato interno de la aplicación KleptoCook.
- Ejecución completamente local: el modelo corre en el teléfono con llama.cpp, por lo que el texto de entrada no se envía a ningún servidor.
- Salida en formato compacto y predecible, adecuada para parsear de forma directa sin necesidad de post-procesado con expresiones regulares complejas.
- Salida en inglés británico, coherente con el idioma del corpus de entrenamiento.
- Etiqueta "conversational" en HuggingFace, aunque la propia model card indica que no es un modelo de chat general y que espera el prompt de la aplicación.

No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio, ni modo de pensamiento. Tampoco se documenta soporte multilingüe más allá del inglés.

## Casos de uso

- Extracción de recetas en la propia aplicación KleptoCook: el modelo recibe el pie de foto de una publicación de cocina y devuelve la receta estructurada que la app muestra y guarda, sin que el texto salga del dispositivo.
- Importación de recetas desde páginas web: tras extraer el texto de la página, el modelo lo convierte al formato interno con ingredientes separados en cantidad, unidad y nombre, y la elaboración dividida en pasos.
- Digitalización de recetarios y notas personales: partiendo de texto obtenido por OCR de una foto o un cuaderno, el modelo normaliza el contenido a una estructura reutilizable; requiere un paso previo de OCR, que no forma parte del modelo.
- Generación automática de listas de la compra: al estar los ingredientes desglosados en cantidad, unidad y nombre y agrupados por partes de la receta, la aplicación puede agregarlos directamente sin interpretación adicional.
- Preprocesado de corpus culinarios: uso como extractor por lotes para transformar colecciones de recetas en texto libre a un formato estructurado (por ejemplo JSON) que alimente bases de datos, índices de búsqueda o el entrenamiento de otros modelos.
- Análisis nutricional y de costes: la estructura de ingredientes permite mapear cada entrada contra bases de datos de composición de alimentos o catálogos de precios, algo que no es viable partiendo de texto libre.
- Funcionamiento sin conexión: al pesar 529 MB en Q4_K_M, puede desplegarse en dispositivos sin conectividad o con red intermitente, algo relevante en cocinas, sótanos o entornos sin cobertura.
- Aplicaciones de cocina de terceros en inglés: cualquier app que necesite estructurar recetas y que pueda adoptar el formato de prompt del modelo puede reutilizarlo bajo Apache 2.0; para otros idiomas haría falta un paso de traducción previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, y el repositorio no tiene descargas ni valoraciones que permitan inferir un uso contrastado. Los resultados de búsqueda web disponibles tratan sobre generación de recetas con modelos genéricos y guías de uso, no sobre este modelo concreto.

## Requisitos de hardware

- Peso en disco: 529 MB para la única cuantización publicada (Q4_K_M).
- Memoria para inferencia: el propio autor indica que corre en el teléfono con llama.cpp; como referencia, un modelo de 0,75 B en Q4_K_M suele necesitar del orden de 0,7 a 1,2 GB de memoria considerando pesos y caché KV a contextos cortos (estimación, no confirmada por el autor).
- En FP16 los pesos serían de aproximadamente 1,5 GB (752 M × 2 bytes), aunque no se distribuye esa versión.
- GPU de consumo: cabe holgadamente en cualquier GPU con 2 GB o más de VRAM; no requiere A100, H100 ni RTX 4090. También puede ejecutarse solo con CPU e, incluso, en dispositivos móviles de gama media.
- Opciones de despliegue: llama.cpp y sus derivados (llama.rn en React Native, llama-cpp-python, Ollama, LM Studio, llamafile). El soporte de GGUF en servidores de alto rendimiento como vLLM o TGI no se documenta para este modelo.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni tiempos de respuesta.

## Comparativa con modelos similares

No se han identificado en la información disponible alternativas publicadas que cubran exactamente la misma tarea (extracción de recetas al formato interno de una app concreta) y con datos comparables. La referencia más directa es el modelo base:

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KleptoCook/recipe-reader | 752.393.024 | no disponible | Extracción de recetas al formato de KleptoCook | Apache 2.0 | GGUF Q4_K_M, 529 MB |
| Qwen/Qwen3.5-0.8B | aproximadamente 0,8 B | no disponible | Modelo base generalista | Apache 2.0 | Pesos originales del autor |
| Modelos generalistas pequeños de propósito general | no disponible | no disponible | Chat y generación de texto libre; no producen el formato estructurado de KleptoCook | varía según modelo | no disponible |

No se dispone de comparaciones de rendimiento entre estas opciones. Cualquier modelo generalista del mismo orden de parámetros requeriría ingeniería de prompt y post-procesado para producir una salida estructurada equivalente.

## Limitaciones y advertencias

- No es un modelo de chat general: la model card indica explícitamente que espera el prompt y el formato de respuesta compacto de la aplicación KleptoCook y que no debe usarse como modelo conversacional.
- Corpus de entrenamiento reducido (unas 2.600 recetas), lo que limita la cobertura de cocinas, ingredientes, unidades y formatos poco frecuentes, y aumenta el riesgo de alucinación en recetas atípicas.
- Riesgo de alucinación en cantidades, tiempos de cocción y pasos: al ser un extractor, puede completar información ausente en el texto de entrada en lugar de marcar el hueco. En el dominio culinario, un error de este tipo tiene consecuencias prácticas.
- Solo inglés: el modelo está entrenado y etiquetado únicamente para inglés, con salida en inglés británico. Entradas en otros idiomas no están soportadas y no se documenta su comportamiento en ese caso.
- No es un generador de recetas: extrae y estructura contenido existente, no crea recetas nuevas ni realiza recomendaciones culinarias o nutricionales.
- Longitud de contexto no documentada, por lo que se desconoce el tamaño máximo de pie de foto o página web que admite de una sola vez.
- Privacidad: aunque el desarrollador declara haber eliminado identificadores de cuenta, correos, teléfonos y enlaces del corpus de entrenamiento, no se documenta una auditoría independiente ni un proceso de evaluación de sesgos.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo se ofrece "tal cual" y sin garantía, y sigue estando sujeto a las condiciones del modelo base de Qwen (Copyright the Qwen team, Alibaba Cloud).
- Madurez: 0 descargas y 0 valoraciones, sin benchmarks publicados; no hay evidencia pública de uso en producción ni de validación por terceros.
- La versión distribuida corresponde a una build concreta de llama.cpp (10256) y se convirtió sin la capa de predicción multi-token; diferencias con otras builds o con el modelo original no están documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KleptoCook/recipe-reader
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Sitio de la aplicación KleptoCook: https://kleptocook.com

Enlaces de contexto recuperados en la búsqueda web (no específicos de este modelo, sin datos técnicos aprovechables sobre él):

- https://medium.com/@areeshakashif321/building-an-ai-recipe-generator-with-fine-tuned-gpt-2-56bf178fb148
- https://www.oracle.com/in/artificial-intelligence/create-an-ai-powered-recipe-generator/
- https://www.simplyrecipes.com/how-to-identify-an-ai-recipe-11919677
- https://awesomeagents.ai/guides/how-to-use-ai-for-cooking-and-meal-planning/
- https://speakeater.com/ai-cooking

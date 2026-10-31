# mradermacher/Qwen3.5-4B-Amadeus-GGUF

## Resumen

Qwen3.5-4B-Amadeus-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Jitheswar/Qwen3.5-4B-Amadeus, realizadas por el cuantizador mradermacher. El modelo base es un fine-tuning de Qwen3.5-4B (de la familia Qwen de Alibaba) que ha sido sometido a un proceso de "abliteración" o descensura, es decir, se han eliminado sus mecanismos de rechazo de seguridad para que responda sin filtros a cualquier petición. El entrenamiento de abliteración utilizó los datasets mlabonne/harmless_alpaca y mlabonne/harmful_behaviors.

La relevancia de esta ficha radica en el despliegue local: al tratarse de cuantizaciones GGUF con soporte de imatrix, el modelo puede ejecutarse en GPUs de consumo e incluso en CPU, con tamaños que van desde 2,1 GB (Q2_K) hasta 8,8 GB (f16). Además, incluye archivos mmproj (suplementos multimodales), lo que indica que el modelo base conserva capacidades de visión y puede procesar imágenes junto con texto. El repositorio pesa 41,0 GB en total y acumula más de 1.000 descargas desde su creación en octubre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), no disponible detalle adicional |
| Parámetros totales | 4.326.350.848 (≈4,3B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversión desde safetensors; el original usa transformers) |

## Arquitectura y entrenamiento

El modelo base, Qwen3.5-4B-Amadeus, es un ajuste sobre Qwen3.5-4B, un transformer denso de unos 4,3 mil millones de parámetros. No se han publicado detalles sobre la arquitectura interna (número de capas, cabezas de atención, longitud de contexto) en la información disponible. El tag "vision" y la presencia de archivos mmproj en formato GGUF indican que el modelo incorpora un componente multimodal para procesar imágenes, aunque los detalles de este codificador visual no están documentados.

El fine-tuning de abliteración se realizó con dos datasets públicos: mlabonne/harmless_alpaca (instrucciones inofensivas estilo Alpaca) y mlabonne/harmful_behaviors (comportamientos dañinos), combinación típica de las técnicas de descensura basadas en ajuste dirigido para anular los rechazos de seguridad del modelo original. No hay información sobre el número de tokens de entrenamiento ni sobre el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno (tag "conversational" en el repositorio).
- Comprensión y generación en inglés y chino, con soporte multilingüe adicional.
- Procesamiento de imágenes: el modelo incluye archivos mmproj (0,5 GB en Q8_0 y 0,8 GB en f16) que actúan como suplemento multimodal para inferencia con visión en llama.cpp.
- Respuesta sin filtros de seguridad (abliterated/uncensored): responde a peticiones que el modelo original rechazaría.
- Ejecución local eficiente gracias a las cuantizaciones GGUF con soporte de matrices de importancia (imatrix).
- No hay información disponible sobre soporte de tool calling, function calling, agentes ni capacidades de razonamiento paso a paso (thinking mode).

## Casos de uso

- Chatbots locales sin censura: ejecución en llama.cpp u Ollama de un asistente conversacional que no rechaza peticiones, útil en contextos de investigación sobre alineación o ficción creativa donde los filtros estándar resultan restrictivos.
- Investigación en seguridad y alineación de modelos: el modelo abliterated sirve como sujeto de estudio para analizar cómo la abliteración afecta a la calidad, los sesgos y la tasa de alucinaciones respecto al modelo base.
- Análisis de imágenes en local: combinando el modelo con los archivos mmproj, se pueden construir aplicaciones de descripción de imágenes o OCR asistido sin depender de servicios en la nube.
- Despliegue en hardware modesto: con la cuantización Q2_K (2,1 GB) o Q3_K_S (2,2 GB), el modelo cabe en GPUs de 4 GB o incluso en CPU con RAM limitada, adecuado para prototipado rápido en portátiles.
- Asistentes multilingües inglés-chino: aprovechando la base Qwen, fuerte en ambos idiomas, para aplicaciones bilingües de generación de texto.
- Experimentación con cuantizaciones: la amplia gama de quants (de Q2_K a f16) permite estudiar el compromiso entre tamaño, velocidad y calidad de salida en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde unos 2,5 GB con Q2_K hasta unos 5 GB con Q8_0; el archivo f16 requiere unos 9 GB. Añadir 0,5-0,8 GB si se usa el suplemento multimodal (mmproj).
- GPU recomendadas: cualquier GPU de consumo con 4-6 GB de VRAM (RTX 3060, RTX 4060) para cuants Q4; GPUs de 8 GB o más (RTX 4070, RTX 4090) para Q8_0 o f16 con holgura. También viable en CPU con suficiente RAM dado el tamaño reducido.
- Cabe cómodamente en GPUs de consumo: la cuantización recomendada Q4_K_M (2,9 GB) funciona en prácticamente cualquier GPU moderna de gama media o en CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, GPT4All y cualquier runtime compatible con GGUF. No es un despliegue típico de vLLM o TGI, orientados a safetensors.
- Latencia y throughput: no disponibles; al ser un modelo de 4,3B cuantizado, se espera inferencia rápida incluso en hardware modesto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Amadeus-GGUF (este) | ≈4,3B | no disponible | Sí (mmproj) | Apache 2.0 | GGUF, 14 cuants |
| Qwen3.5-4B (base oficial) | ≈4B | no disponible | no disponible | Apache 2.0 | Safetensors en HF |
| Jitheswar/Qwen3.5-4B-Amadeus (base) | ≈4,3B | no disponible | Sí | Apache 2.0 | Safetensors en HF |

Comparables en tamaño dentro de la familia Qwen: Qwen3-4B y Qwen2.5-3B ofrecen contextos y benchmarks documentados, pero sin abliteración. No hay datos de rendimiento suficientes para una comparativa cuantitativa; no disponible.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: se han eliminado deliberadamente las salvaguardas de seguridad. No es apto para entornos de producción orientados a usuarios finales sin capas de moderación externas, y su uso puede plantear riesgos legales y éticos según la jurisdicción.
- Riesgo de alucinación elevado: la abliteración suele degradar la fiabilidad factual respecto al modelo base; no hay evaluaciones publicadas que cuantifiquen esta degradación.
- Cuantizaciones agresivas: Q2_K y Q3_K_S/M implican pérdida de calidad notable (el propio autor marca Q3_K_M como "lower quality"); para uso serio se recomiendan Q4_K_M o superiores.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en ventanas largas.
- Capacidades multimodales dependientes de mmproj: la visión requiere cargar el archivo mmproj correspondiente en llama.cpp; sin él, el modelo es solo texto.
- Detalles técnicos incompletos: la model card no documenta arquitectura, contexto, datos de entrenamiento del modelo base ni benchmarks; conviene verificar el comportamiento empíricamente antes de cualquier despliegue.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de filtros de seguridad no exime de responsabilidad sobre los contenidos generados.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/Qwen3.5-4B-Amadeus-GGUF
- Modelo base abliterated: https://huggingface.co/Jitheswar/Qwen3.5-4B-Amadeus
- Cuants weighted/imatrix: https://huggingface.co/mradermacher/Qwen3.5-4B-Amadeus-i1-GGUF
- Página de descarga resumida: https://hf.tst.eu/model#Qwen3.5-4B-Amadeus-GGUF
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

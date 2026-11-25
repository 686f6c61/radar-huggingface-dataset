# protoncracker/K2-Horizon-0.9B-Shopify-merged

## Resumen

K2-Horizon-0.9B-Shopify-merged es un modelo de clasificación de productos de comercio electrónico obtenido al fusionar (merge) un adaptador LoRA sobre el modelo base IFM/K2-Horizon-0.9B. Lo desarrolla el usuario protoncracker y su propósito es estrictamente acotado: asignar un producto, a partir de su título y descripción, a los dos primeros niveles de su ruta de categoría de Shopify. No es un modelo de propósito general mejorado, sino una especialización de una única tarea.

El modelo base tiene 1.078.285.824 parámetros (aproximadamente 1,08 mil millones) y el adaptador LoRA entrena 13.991.936 parámetros en 196 capas lineales con rango r=16 y alpha=32. La fusión se realizó en float32 y se redondeó una sola vez a fp16, formato en el que se distribuyen los pesos. El repositorio ocupa 2,2 GB e incluye tanto los pesos fusionados como el adaptador original en `adapter/` (56 MB).

Su relevancia es fundamentalmente metodológica y de nicho: demuestra cómo un ajuste fino muy ligero (821 segundos de entrenamiento en una única NVIDIA L4, una época, 313 pasos) sobre un modelo pequeño puede resolver con precisión aceptable una tarea de clasificación cerrada de 209 etiquetas, a costa de degradar de forma medible sus capacidades generales. El autor es explícito al respecto: debe usarse solo para la tarea de categorización de Shopify.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base K2-Horizon, con código personalizado; detalles internos no disponibles) |
| Parámetros totales | 1.078.285.824 (≈1,08 B) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible (las evaluaciones usaron 4.096 tokens de generación como tope) |
| Tipos de cuantización | no disponible (pesos distribuidos en fp16; el adaptador LoRA en `adapter/`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp16), con código personalizado (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de IFM/K2-Horizon-0.9B (revisión `6b4f28e81b8a77c8b44465a93a452eea198d4ceb`), un transformer de aproximadamente 1,08 mil millones de parámetros del que no se detallan en la información disponible ni la composición del dataset original ni el proceso de alineación. Sobre él se aplicó un LoRA de rango 16 y alpha 32, con dropout 0,05, sobre 196 capas lineales, lo que supone 13.991.936 parámetros entrenables de un total de 1.092.277.760.

El entrenamiento usó el dataset Shopify/product-catalogue (Apache-2.0), con semilla 42 y partición de 5.000 filas de entrenamiento y 1.000 de test. Se empleó learning rate 2e-4, batch de 16, una época (313 pasos), precisión BF16 y gradient checkpointing, sobre una única NVIDIA L4 durante 821 segundos. La pérdida cayó de 2,80 a aproximadamente 0,18 (media de los últimos 20 pasos). La fusión se hizo en float32 y se redondeó una sola vez a fp16; el autor midió que una fusión en bf16 se alejaba más de la referencia base+adaptador (concordancia top-1 del 92,4% frente al 98,3% del fp16; KL media 0,0018 frente a 0,00002), de ahí la elección de fp16.

El prompt de inferencia es parte del contrato del modelo: mensaje de sistema `Classify the product into its e-commerce category. Answer with the category only.`, el texto del producto como mensaje de usuario, la plantilla de chat con `reasoning_effort="low"` y el bloque de pensamiento vacío cerrado `</ifm|think_faster>` más un salto de línea añadido al prompt de generación. La respuesta termina en `<|ifm|im_end|>`.

## Capacidades

- Clasificación de productos de comercio electrónico en los dos primeros niveles de una taxonomía de 209 etiquetas de Shopify.
- Generación de la categoría como texto plano, sin listas de candidatos en el prompt (condición de entrenamiento).
- Funcionamiento también con la lista de categorías incluida en el prompt, aunque con menor precisión (51,5% frente a 65,4%).
- Capacidad general de asistente muy degradada respecto al modelo base (ver sección de benchmarks); no debe usarse como asistente general.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está entrenado para una única respuesta corta.
- Capacidades multilingües: no disponibles.
- Modo thinking: la plantilla admite `reasoning_effort`, pero el ajuste se hizo con bloque de pensamiento vacío y respuestas de hasta 40 tokens nuevos.
- Visión y audio: no disponibles.

## Casos de uso

- Categorización automática de catálogos de Shopify: dado el título y la descripción de un producto, el modelo devuelve la ruta de categoría de dos niveles; con un 65,4% de coincidencia exacta sobre 209 etiquetas, es adecuado como primer paso de un pipeline de etiquetado con revisión humana de los casos dudosos.
- Enriquecimiento de fichas de producto en migraciones: al importar catálogos heredados sin categoría, el modelo puede preasignar categorías masivamente y reducir el trabajo manual, aprovechando su bajo coste de inferencia (modelo de 1,08 B en fp16, 2,2 GB de pesos).
- Preetiquetado para anotación humana: como clasificador de alta cobertura en una cola de anotación, donde un humano valida o corrige; el 65,4% de acierto exacto implica que aproximadamente dos tercios de las etiquetas se aceptan sin retoque.
- Filtrado y organización de feeds de proveedores: clasificar productos entrantes de terceros en la taxonomía propia antes de publicarlos, con el modelo ejecutándose en local o en una GPU modesta.
- Clasificación por lotes en entornos con recursos limitados: al caber en una única NVIDIA L4 (la misma GPU usada para entrenar) y pesar 2,2 GB, puede desplegarse en servidores de gama baja o incluso en GPU de consumo, procesando grandes volúmenes de fichas.
- Detección de productos mal categorizados: comparar la categoría asignada por el modelo con la existente en el catálogo y marcar discrepancias para auditoría, como señal de priorización y no como veredicto automático.
- Prototipado de taxonomías: validar experimentalmente si una taxonomía de dos niveles es separable con un modelo pequeño antes de invertir en un modelo mayor o en anotación a gran escala.

## Benchmarks y rendimiento

Resultados del autor sobre 1.000 productos reservados, coincidencia exacta sobre el conjunto de 209 etiquetas, decodificación greedy, 40 tokens nuevos:

| Condición | Base sin ajustar | Este modelo |
|---|---|---|
| Sin lista de categorías en el prompt | 0,0% (todas las respuestas inválidas) | 65,4% [62,4; 68,3] |
| Con lista de categorías en el prompt (no entrenado para ello) | 6,9% | 51,9% (adaptador) / 51,5% (fichero fusionado) |

El autor advierte de que el 0,0% del base sin ajustar mide sobre todo el formato de salida (en 40 tokens no producía una categoría limpia), no su conocimiento. Además, seis categorías de la muestra de test no aparecen en las 5.000 filas de entrenamiento, por lo que algunos errores son inevitables. Los resultados corresponden a una sola semilla, una sola partición y una sola tarea.

Capacidad general (1.700 ítems de opción múltiple, sin thinking, 1 muestra, T 1,0 / top-p 0,95 / top-k 64, 4.096 tokens, parser estricto `ANSWER:`; puntos con intervalos pareados al 95%):

| Benchmark | K2 original | Este modelo | Diferencia |
|---|---:|---:|---:|
| MMLU-Pro (500) | 34,8% | 20,8% | -14,0 [-18,8; -9,2] |
| ARC-Challenge (500) | 68,0% | 44,0% | -24,0 [-29,6; -18,6] |
| SuperGPQA hard (300) | 6,0% | 10,0% | +4,0 [-0,3; +8,3] (no significativo; ambos cerca del azar) |
| Security quiz (400) | 70,0% | 43,0% | -27,0 [-33,0; -20,8] |

El autor señala que el modelo ajustado a menudo omite la línea `ANSWER:` requerida, pero una corrección laxa (aplicada a ambos modelos) sigue mostrando caídas de 10,8, 18,0 y 16,5 puntos en MMLU-Pro, ARC y el cuestionario de seguridad. El K2 original también alcanzó el tope de 4.096 tokens en muchos ítems difíciles con esta configuración.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp16 ocupan aproximadamente 2,2 GB; con caché KV y overhead del runtime, se puede estimar un uso de 3-4 GB, aunque no se ha publicado una cifra oficial.
- GPU recomendadas: NVIDIA L4 (usada para el entrenamiento, 24 GB), así como cualquier GPU con al menos 4-6 GB de VRAM.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores; no se ha verificado en la información disponible.
- Opciones de despliegue: requiere `trust_remote_code=True` por el código personalizado del modelo base; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles; el entrenamiento de 313 pasos en una L4 duró 821 segundos, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. La comparación más directa disponible es con su propio modelo base:

| Modelo | Parámetros | Contexto | Tarea Shopify (sin lista) | MMLU-Pro | ARC-Challenge | Licencia |
|---|---|---|---|---|---|---|
| K2-Horizon-0.9B-Shopify-merged | 1,08 B | no disponible | 65,4% | 20,8% | 44,0% | Apache-2.0 |
| IFM/K2-Horizon-0.9B (base) | 1,08 B | no disponible | 0,0% (formato inválido) | 34,8% | 68,0% | Apache-2.0 |

Otros modelos de clasificación de productos: no disponible.

## Limitaciones y advertencias

- El propio autor advierte de que es un modelo de tarea estrecha y que es peor que el base como asistente general: las caídas medidas son de 14 puntos en MMLU-Pro, 24 en ARC-Challenge y 27 en el cuestionario de seguridad.
- Riesgo de alucinación de categorías: el modelo puede generar etiquetas que no pertenecen a la taxonomía de 209 categorías, especialmente con entradas atípicas o fuera de dominio.
- Seis categorías de la muestra de test no aparecen en los datos de entrenamiento, por lo que existe un suelo de error inevitable sobre ellas.
- Los resultados proceden de una sola semilla, una sola partición y una sola tarea; no hay validación cruzada ni intervalos sobre múltiples ejecuciones.
- La precisión baja del 65,4% al 51,5% cuando se incluye la lista de categorías en el prompt, condición para la que no fue entrenado; el prompt debe replicarse exactamente como en el entrenamiento.
- El uso requiere `trust_remote_code=True` y una plantilla de chat específica con `reasoning_effort="low"` y el bloque `</ifm|think_faster>`; desviarse de este formato degrada la salida.
- El modelo ajustado omite con frecuencia la línea `ANSWER:` en formatos de evaluación estandarizados, lo que complica su integración en pipelines que esperan ese formato.
- Idiomas soportados no documentados; no hay garantía de funcionamiento fuera del inglés, idioma presumible del dataset de Shopify.
- Licencia Apache-2.0, que permite uso comercial; el dataset de entrenamiento también es Apache-2.0 según el autor, aunque conviene verificar los términos del catálogo de Shopify utilizado.
- Sin descargas ni valoraciones en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/protoncracker/K2-Horizon-0.9B-Shopify-merged
- Modelo base: https://huggingface.co/IFM/K2-Horizon-0.9B
- Dataset de entrenamiento: https://huggingface.co/datasets/Shopify/product-catalogue
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.

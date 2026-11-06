# sdoqb15/sam3-shelf-c7a-2380

## Resumen

SAM3 Shelf C7-A es un ajuste fino (fine-tuning) del modelo de segmentación Segment Anything Model 3 (SAM3) de Meta, especializado en la segmentación de instancias de unidades de venta completas sobre estanterías de supermercados y almacenes. Lo desarrolla el usuario sdoqb15 y se distribuye como un checkpoint completo de `Sam3Model` en formato Transformers, no como un adaptador LoRA. El modelo resuelve un problema concreto: el SAM3 original tiende a fragmentar los multipacks envueltos en film transparente en sus unidades internas o a devolver solo una parte del paquete completo, lo que degrada la posterior extracción de embeddings de producto y la selección de máscaras para picking robótico.

El modelo parte de `facebook/sam3` y entrena únicamente los módulos de detección y segmentación (encoder DETR, decoder DETR, decoder de máscaras y módulos de scoring/presencia), un total de 24.529.462 parámetros entrenables sobre un total de 840.376.374 parámetros. El resto de módulos, incluidos visión y texto, permanecen congelados. La arquitectura subyacente es la de SAM3, un transformer con prompt de texto fijo, y el checkpoint se ha entrenado con un método conjunto (joint-stage) que combina supervisión humana con destilación selectiva de un profesor SAM3 original.

La relevancia actual radica en su aplicación industrial: la segmentación precisa de unidades de venta completas es un paso crítico en pipelines de inventario automatizado y robótica de almacén, donde una máscara incompleta o una mezcla de productos arruina la representación visual del SKU y, en última instancia, la estimación de la región de agarre. El modelo se publica con licencia SAM, pesos safetensors y soporte para inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM3 (transformer con prompt de texto, encoder/decoder DETR y decoder de máscaras) |
| Parametros totales | 840.376.374 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | SAM (license_name: sam, license: other) |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de SAM3 que congela los módulos de visión y texto y entrena solo el encoder DETR, el decoder DETR, el decoder de máscaras y los módulos de scoring/presencia (24.529.462 parámetros entrenables). No se emplea LoRA. El entrenamiento usa un método conjunto con supervisión humana prioritaria: las queries que coinciden con el ground truth reciben supervisión de detección y segmentación, mientras que las no coincidentes se tratan como negativos de fondo focal, salvo en dos casos de destilación segura del profesor SAM3 original. Las queries con score del profesor ≥0.90 y seguras respecto al GT reciben preservación suave de máscara, caja y score con peso 0.25; las de score entre 0.85 y 0.90 y seguras se marcan como desconocidas sin destilación ni negativo. La seguridad respecto al GT exige intersección/área del profesor ≤0.02 e intersección/área de cada GT ≤0.02, con asociación geométrica por IoU ≥0.5 y un máximo de 32 candidatos del profesor supervisados.

El entrenamiento emplea AdamW con LR 1e-5, schedule coseno de 2380 actualizaciones, 5% de warmup, LR final 1e-6, weight decay 1e-4, gradient clip 1.0, batch efectivo 4, semilla 42 y sin augmentación. El pool de entrenamiento consta de 1635 imágenes y 3281 GT (411 imágenes multiproducto y 1224 monoproducto), con peso de muestreo por imagen de 8 para multiproducto y 1 para monoproducto. La validación usa 72 imágenes y 362 GT nunca entrenados, y hay pools de regresión (162 imágenes, 808 GT) y suplementario anotado (35 imágenes, 107 GT) excluidos del entrenamiento. El prompt de texto es fijo: `an object on the shelf`.

## Capacidades

- Segmentación de instancias de unidades de venta completas sobre estanterías, incluidos multipacks envueltos en film transparente tratados como una sola instancia.
- Generación de máscaras a resolución nativa con scores asociados, con umbral de máscara 0.5 y score estrictamente >0.1 comparado en FP32.
- Ranking de candidatos que prioriza unidades completas y actualmente expuestas frente a fragmentos o fusiones frontales/traseras.
- Capacidad de segmentar productos en profundidad cuando los frontales se han retirado (cada columna tiene su ítem más externo actual).
- Eliminación de máscaras vacías y NMS de duplicados cercanos con IoU >0.98.
- Soporte multilingüe de prompt limitado a inglés y chino.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo puramente de segmentación por prompt de texto.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Inventario automatizado en supermercados: el modelo segmenta cada unidad de venta completa en una foto de estantería, permitiendo contar y localizar productos por SKU incluso cuando hay multipacks transparentes que el SAM3 original fragmentaría.
- Picking robótico en almacén: las máscaras completas de la unidad más externa alimentan la estimación de la región de agarre; el modelo prioriza el ítem completo expuesto, lo que evita que el robot intente agarrar un fragmento o una fusión de productos.
- Extracción de embeddings de producto para base de datos vectorial de SKU: al generar máscaras limpias y completas, los recortes enmascarados producen representaciones visuales útiles para la comparación contra la base de datos de SKU.
- Control de planogramas y cumplimiento de exposición: la segmentación por instancia permite verificar la presencia y posición de cada unidad de venta en la estantería frente al planograma definido.
- Detección de huecos y reposición: al segmentar solo los ítems actualmente expuestos, el sistema puede inferir qué posiciones de la estantería han quedado vacías tras retirar productos frontales.
- Análisis de surtido en almacén: el modelo procesa imágenes de estanterías de almacén con prompts fijos y devuelve máscaras a resolución nativa, útiles para auditorías de stock sin necesidad de anotación manual.
- Preprocesado para pipelines de visión retail: integrado como etapa de segmentación en un sistema mayor, reduce el trabajo de procesamiento de candidatos al descartar máscaras fragmentadas o fusionadas antes de la selección final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 840 millones de parámetros, una estimación orientativa en FP16 rondaría los 1,7 GB de pesos, más memoria para activaciones y máscaras a resolución nativa, pero no se confirma en la model card.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de parámetros es plausible en GPUs consumer con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: Transformers (librería indicada), con pipeline `mask-generation`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.
- El punto de operación requiere aplicar manualmente `operating_point.json` (score >0.1, umbral de máscara 0.5, NMS IoU >0.98); Transformers no lo aplica automáticamente, por lo que se debe usar la ruta de inferencia del proyecto asociado para reproducirlo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAM3 Shelf C7-A (este) | 840.376.374 | no disponible | Segmentación de estanterías | SAM | Hugging Face (sdoqb15) |
| facebook/sam3 (base) | no disponible | no disponible | Segmentación general | SAM | Hugging Face (Meta) |
| SAM3 Shelf D2-2261 | no disponible | no disponible | Segmentación de estanterías | SAM | Hugging Face (sdoqb15) |

El modelo companion `sdoqb15/sam3-shelf-d2-2261` usa el mismo método conjunto con un pool de datos ampliado y no se inicializa desde C7-A. No se dispone de datos de benchmarks para comparar rendimiento numérico entre ellos.

## Limitaciones y advertencias

- Los objetivos de segmentación y ranking son intenciones declaradas, no una garantía de que cada candidato sea correcto.
- Los scores de segmentación no predicen directamente la alcanzabilidad física ni el éxito de agarre; no se reclama mejora en la tasa de éxito de agarre a partir de las métricas de segmentación.
- Las anotaciones del dataset son parciales, lo que puede introducir sesgos en la supervisión.
- Riesgo de alucinación de máscaras: el modelo puede proponer candidatos fusionados o que contienen regiones no relacionadas, aunque el entrenamiento busca penalizarlos.
- El prompt de texto es fijo (`an object on the shelf`); no está pensado para prompts arbitrarios ni para segmentación genérica.
- Idiomas de prompt limitados a inglés y chino.
- Licencia SAM: es necesario revisar los términos en el enlace de licencia del repositorio antes de un uso comercial; la licencia se etiqueta como `other` con nombre `sam`.
- El repositorio no incluye imágenes privadas, anotaciones de máscaras ni logs internos por imagen; el dataset de entrenamiento requiere autorización del propietario.
- No es un adaptador LoRA ni un tracker de vídeo; es un checkpoint completo de `Sam3Model`.
- Para reproducir las métricas reportadas hay que aplicar eliminación de máscaras vacías y NMS de máscaras, y usar la ruta de inferencia del proyecto asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sdoqb15/sam3-shelf-c7a-2380
- Modelo companion: https://huggingface.co/sdoqb15/sam3-shelf-d2-2261
- Código asociado: https://github.com/sdoqb15/sam3_shelf
- Definición del problema: https://github.com/sdoqb15/sam3_shelf/blob/main/docs/problem_statement.md
- Dataset (acceso restringido): https://huggingface.co/datasets/sdoqb15/sam3-shelf-data
- Licencia: https://huggingface.co/sdoqb15/sam3-shelf-c7a-2380/blob/main/LICENSE
- Modelo base: https://huggingface.co/facebook/sam3
- Paper de referencia (arXiv): 2511.16719

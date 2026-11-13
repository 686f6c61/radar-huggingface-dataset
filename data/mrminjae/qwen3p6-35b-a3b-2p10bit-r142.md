# mrminjae/qwen3p6-35b-a3b-2p10bit-r142

## Resumen

Qwen3.6-35B-A3B-2p10bit-r142 es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face el 13 de noviembre de 2026. Se trata de una cuantización selectiva del modelo base Qwen/Qwen3.6-35B-A3B, en la que únicamente los expertos enrutados del componente MoE se almacenan con una precisión media de 2,10 bits, mientras que el resto de pesos (atención, embeddings, capas densas, router) permanece en BF16. Los pesos se guardan dequantizados en tensores BF16, de modo que el artefacto carga con `transformers` y vLLM estándar sin necesidad de kernels de cuantización especiales.

El interés técnico del checkpoint reside en la estrategia de compresión: al aplicar la cuantización agresiva solo a la porción de parámetros que corresponde a los expertos, se reduce de forma notable el espacio en disco y el ancho de banda de memoria necesario para servirlos, manteniendo intactas las capas críticas para la estabilidad numérica. El nombre del repositorio sugiere una arquitectura MoE con 35 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, aunque esta información no está confirmada de forma explícita en la model card.

Se trata de un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, pensado para experimentación interna y evaluación de técnicas de cuantización extrema sobre modelos MoE. No debe considerarse un modelo listo para producción: la documentación es mínima, no se publican métricas de degradación y la licencia se hereda del modelo base sin que se detalle su contenido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según el nombre del modelo base; detalles no disponibles |
| Parámetros totales | 35B (según el identificador del modelo base; no confirmado en la model card) |
| Parámetros activos | ~3B (según el identificador del modelo base; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; almacenamiento dequantizado en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | Hereda la del modelo base Qwen/Qwen3.6-35B-A3B; texto concreto no disponible |
| Formato de pesos | Tensores BF16 compatibles con `transformers` y vLLM (no se indica safetensors de forma explícita) |

## Arquitectura y entrenamiento

El checkpoint es una derivación del modelo Qwen/Qwen3.6-35B-A3B, cuya arquitectura exacta no se describe en la model card. Por la nomenclatura del repositorio (35B-A3B) cabe inferir una arquitectura de mezcla de expertos con 35 mil millones de parámetros totales y alrededor de 3 mil millones activos por token, pero esta interpretación no está validada por documentación oficial del autor de la cuantización.

El proceso de compresión aplica una cuantización selectiva: solo los expertos enrutados se reducen a una precisión media de 2,10 bits, mientras que el resto de componentes del modelo permanece en BF16. Un detalle relevante es que los pesos se almacenan dequantizados en tensores BF16, lo que implica que el ahorro se produce en el artefacto distribuido (tamaño en disco y descarga) pero no necesariamente en la VRAM ocupada durante la inferencia, ya que el modelo se carga en BF16. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO, ni para el modelo base ni para esta variante.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que la funcionalidad principal es la generación autoregresiva de texto.
- Razonamiento y código: no disponible; no se documentan capacidades específicas más allá de la generación de texto.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere despliegue mediante Inference Endpoints de Hugging Face.

## Casos de uso

- Evaluación de técnicas de cuantización extrema en MoE: el checkpoint permite medir la degradación de calidad al comprimir solo los expertos a 2,10 bits frente al modelo base en BF16, en tareas de generación controladas y con conjuntos de evaluación fijos.
- Investigación sobre serving eficiente: al reducir el tamaño del artefacto, facilita experimentos de carga y distribución en entornos con ancho de banda limitado, comparando latencia y throughput frente al modelo original.
- Pruebas de compatibilidad con vLLM y transformers: sirve para validar que los pipelines estándar cargan correctamente pesos dequantizados sin kernels personalizados.
- Reproducción de experimentos internos: útil para equipos que quieran replicar el pipeline de cuantización selectiva sobre otros modelos MoE de la familia Qwen.
- Benchmarking de memoria: permite comparar el consumo de VRAM en carga BF16 frente a estrategias de cuantización en vuelo, ya que los pesos se almacenan dequantizados.
- Docencia y formación: como ejemplo práctico de cuantización selectiva por componentes en arquitecturas MoE, con un caso real de artefacto publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Al almacenarse los pesos dequantizados en BF16, la carga en memoria se aproxima a la de un modelo de 35B en BF16 (del orden de 70 GB solo en pesos, más overhead de activaciones y caché KV), aunque esta cifra es una estimación basada en el tamaño declarado y no un dato publicado.
- GPU recomendadas: no disponible. Por el tamaño estimado, serían necesarias GPU de clase profesional con 80 GB o configuraciones multi-GPU.
- Cabeza en GPU de consumo: no disponible; improbable con los datos estimados.
- Opciones de despliegue: `transformers` y vLLM, según la model card; compatibilidad con Inference Endpoints por la etiqueta correspondiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r142 | 35B totales / ~3B activos (según identificador) | no disponible | Expertos a 2,10 bits, resto BF16 | Heredada del base, no detallada | Pública, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales / ~3B activos (según identificador) | no disponible | BF16 | No detallada en esta ficha | Pública |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Checkpoint de investigación interna: el propio autor lo etiqueta como "internal research checkpoint", sin garantías de estabilidad ni de calidad.
- Sin métricas de degradación: no se publica ninguna evaluación que cuantifique la pérdida de calidad provocada por la cuantización a 2,10 bits de los expertos.
- Almacenamiento dequantizado: los pesos se guardan en BF16, por lo que el ahorro es de tamaño en disco y descarga, no necesariamente de VRAM en inferencia.
- Documentación mínima: no se detallan contexto, idiomas, datos de entrenamiento ni procesos de alineación.
- Licencia ambigua: se indica que sigue la del modelo base, pero no se reproduce el texto ni se aclaran las restricciones de uso comercial.
- Riesgo de alucinación y sesgos: no evaluado; sin datos específicos para este checkpoint.
- Sin tracción comunitaria: cero descargas y cero likes, lo que reduce la probabilidad de que los problemas estén documentados por terceros.
- No apto para producción sin validación previa exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r142
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B

# joamCriff123/zils-lite-l1114a

## Resumen

zils-lite-l1114a es un modelo de decisión ("decision body") de la familia d3-lite, construido mediante fine-tuning del modelo base Qwen/Qwen3.5-0.8B. Lo publica el usuario joamCriff123 en Hugging Face y está pensado para el "lite pool" de la subnet 127 de Zils, un entorno de subred descentralizada. Con 852.985.920 parámetros totales según los pesos en safetensors, se trata de un modelo compacto orientado a tareas de extracción de características y toma de decisiones dentro de ese ecosistema.

El modelo se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y modificación, y utiliza la librería transformers con pesos en safetensors y código personalizado (`custom_code`). Su pipeline declarado es feature-extraction, no generación de texto, lo que indica que su función principal es producir representaciones o puntuaciones de decisión más que respuestas conversacionales abiertas.

La relevancia de esta ficha es limitada por la escasez de documentación: la model card es mínima y no se han publicado benchmarks, idiomas soportados ni detalles de entrenamiento. Aun así, resulta útil documentar sus especificaciones verificables, su relación con el modelo base Qwen3.5-0.8B y las precauciones para cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.5-0.8B; tag `qwen3_5`) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo más allá de su etiqueta `qwen3_5` y su base Qwen/Qwen3.5-0.8B. El tag `custom_code` indica que el repositorio incluye código propio que debe cargarse con `trust_remote_code=True` en transformers, probablemente para definir la cabeza de decisión o el pipeline de feature-extraction específico de Zils. El pipeline declarado es feature-extraction, coherente con un "decision body" que transforma entradas en representaciones o decisiones.

Tampoco se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación. La model card solo indica que es un "d3-lite decision body" para el lite pool de la subnet 127 de Zils, sin especificar la innovación técnica concreta. Cualquier afirmación sobre atención lineal, decodificación especulativa u otras técnicas sería especulativa y no se incluye.

## Capacidades

- Extracción de características: pipeline principal declarado, orientado a generar representaciones vectoriales de entradas.
- Toma de decisiones: etiquetado como `decision-model` y `d3-lite`, pensado para tareas de decisión dentro del ecosistema Zils.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse en infraestructura de endpoints de Hugging Face.
- Herencia del modelo base: al derivar de Qwen/Qwen3.5-0.8B, podría heredar capacidades lingüísticas del base, pero no se documenta ninguna garantía al respecto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no especificados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación y puntuación dentro de la subnet 127 de Zils: el modelo está diseñado como "decision body" para el lite pool, por lo que su uso natural es producir decisiones o puntuaciones en ese entorno descentralizado.
- Extracción de embeddings para sistemas de recuperación: al declarar feature-extraction, puede emplearse para generar representaciones vectoriales en pipelines de búsqueda semántica, siempre que se valide su calidad empíricamente.
- Filtrado o enrutamiento de peticiones: un modelo de decisión compacto de ~853 M parámetros puede integrarse como clasificador ligero en un router que derive consultas a modelos mayores.
- Prototipado de agentes con presupuesto de cómputo reducido: su tamaño permite ejecutarlo en hardware modesto para experimentar con lógica de decisión antes de escalar a modelos mayores.
- Investigación sobre fine-tuning de modelos pequeños: sirve como ejemplo de adaptación de Qwen3.5-0.8B a una tarea específica, útil para estudiar técnicas de ajuste en modelos de menos de 1.000 millones de parámetros.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 facilita su integración en productos comerciales, previa validación de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,7 GB solo para pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y del código personalizado.
- VRAM estimada en cuantización de 8 bits: en torno a 0,9 GB para pesos; en 4 bits, alrededor de 0,5 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM debería poder cargar los pesos en FP16; una RTX 3060, RTX 4060 o superior es suficiente. Para despliegue en servidor, A100 o H100 no son necesarias por tamaño, pero podrían usarse para alto throughput.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada por los tags; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI, y el pipeline de feature-extraction con código personalizado puede requerir adaptaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Pipeline | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-l1114a | 852.985.920 | no disponible | apache-2.0 | feature-extraction | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible en esta ficha | no disponible | Hugging Face |
| Alternativas de ~1 B para clasificación/embeddings | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas; la comparación se limita al modelo base del que deriva y a la categoría general de modelos de menos de 1.000 millones de parámetros.

## Limitaciones y advertencias

- Documentación mínima: la model card no detalla datos de entrenamiento, idiomas, contexto ni evaluación, lo que impide valorar su calidad de forma rigurosa.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión y no de generación, el riesgo se traslada a decisiones incorrectas o mal calibradas.
- Sesgos: desconocidos, ya que no se documenta la composición del dataset de ajuste.
- Limitaciones de contexto e idioma: no disponibles; no se debe asumir el contexto del modelo base sin verificación.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- Licencia: Apache-2.0 permite uso comercial, pero deben revisarse los ficheros LICENSE y NOTICE para las atribuciones de componentes upstream.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o validación por parte de la comunidad.
- Uso previsto restringido: está diseñado para el lite pool de la subnet 127 de Zils; emplearlo fuera de ese contexto requiere validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/joamCriff123/zils-lite-l1114a
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.

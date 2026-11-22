# huggingface12341/zsl-a3

## Resumen

zsl-a3 es un modelo de extracción de características (feature-extraction) publicado por el usuario huggingface12341 en Hugging Face. Se trata de un merge por aritmética de tareas (task-arithmetic merge) construido dentro del denominado "Zils subnet 127 d3-lite pool", una familia de modelos derivados de Qwen3.5-0.8B orientados a tareas de decisión. El modelo combina los pesos de dos fuentes: joamCriff123/zils-lite-l1121a y corners-ai/CoCo-Decision-Vision-0.8B, ambos bajo licencia Apache-2.0.

La operación de merge aplica la fórmula `soup + (find - Qwen/Qwen3.5-0.8B)` sobre los pesos de lenguaje, mientras que la torre de visión se hereda directamente del "soup" base. El resultado es un modelo de aproximadamente 853 millones de parámetros (852.985.920 según los safetensors del repositorio), con un tamaño de repo de 1,7 GB, lo que sugiere pesos en precisión completa o media para ese orden de magnitud.

Su relevancia es limitada y experimental: se publica como un artefacto de investigación dentro de un pool de merges, sin model card detallada, sin datos de benchmarks y sin documentación sobre el proceso de entrenamiento. Es útil para quienes exploran técnicas de model merging y aritmética de tareas sobre modelos pequeños con componente multimodal, pero no constituye una opción madura para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-0.8B con torre de visión (según model card); detalles exactos no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un merge, no un entrenamiento desde cero. Según la model card, se aplica aritmética de tareas sobre los pesos de lenguaje: se parte de un "soup" (mezcla de modelos del pool d3-lite) y se le suma la diferencia entre un modelo denominado `find` y el modelo padre Qwen/Qwen3.5-0.8B. La torre de visión se toma directamente del soup, sin modificación aritmética. Las fuentes declaradas son joamCriff123/zils-lite-l1121a y corners-ai/CoCo-Decision-Vision-0.8B, ambas Apache-2.0, con Qwen/Qwen3.5-0.8B como ancestro común.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado en los modelos de origen. Tampoco se documentan innovaciones técnicas propias más allá de la propia técnica de merge. El pipeline declarado es feature-extraction, y los tags incluyen `custom_code`, lo que implica que la carga del modelo requiere código personalizado del repositorio y no funciona con un `AutoModel` estándar sin `trust_remote_code=True`.

## Capacidades

- Extracción de características (feature-extraction): es el pipeline declarado, orientado a generar representaciones vectoriales a partir de entradas.
- Procesamiento multimodal: incorpora una torre de visión heredada de CoCo-Decision-Vision-0.8B, por lo que cabe esperar entrada de imagen además de texto, aunque no se detalla el esquema de entrada.
- Modelo de decisión: los tags `decision-model` y `d3-lite` sugieren un uso orientado a tareas de clasificación o decisión, sin especificar el dominio.
- Generación de texto: no confirmada explícitamente; al derivar de Qwen3.5-0.8B podría conservar capacidad generativa, pero el pipeline declarado es de extracción, no de generación.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas está vacío en el repo).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en model merging: sirve como caso de estudio reproducible de aritmética de tareas (`soup + (find - parent)`) sobre un modelo pequeño de 0,85B, permitiendo analizar cómo se comportan los pesos fusionados frente a los modelos origen.
- Extracción de embeddings para búsqueda semántica experimental: al declararse como feature-extraction, puede emplearse para generar representaciones y evaluar su calidad en tareas de recuperación, siempre con validación empírica previa.
- Prototipado de clasificadores de decisión: los tags `decision-model` apuntan a un uso como base para cabezas de clasificación en experimentos internos, aprovechando su tamaño reducido para iterar rápido.
- Experimentos multimodales ligeros: la torre de visión permite probar pipelines imagen-texto en entornos con recursos limitados, aunque la falta de documentación exige ingeniería inversa del `custom_code`.
- Evaluación comparativa de merges: útil como miembro adicional en un banco de pruebas de modelos del pool d3-lite para medir degradación o ganancia respecto al soup base.
- Docencia y reproducción de técnicas de fusión: su licencia Apache-2.0 y su tamaño (1,7 GB) facilitan su descarga y análisis en cursos o talleres sobre model merging.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1,7 GB solo para pesos, más overhead de activaciones y de la torre de visión; un cálculo conservador sitúa el total en 3-4 GB para lotes pequeños.
- VRAM estimada en fp32: aproximadamente 3,4 GB para pesos, con total práctico de 5-6 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4070) debería bastar para inferencia en fp16; para experimentación con lotes mayores, A100 o H100 no aportan ventaja significativa dado el tamaño del modelo.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más.
- Opciones de despliegue: al requerir `custom_code`, la vía natural es `transformers` con `trust_remote_code=True`; vLLM, TGI o llama.cpp no están confirmados para esta arquitectura personalizada y requerirían portar el código.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zsl-a3 | 852.985.920 | No disponible | Apache-2.0 | Hugging Face (0 descargas) | Merge experimental, requiere custom_code |
| Qwen/Qwen3.5-0.8B | ~0,8B (no confirmado en detalle) | No disponible | No disponible en la información | Hugging Face | Modelo padre del linaje |
| corners-ai/CoCo-Decision-Vision-0.8B | ~0,8B (según nombre) | No disponible | Apache-2.0 | Hugging Face | Fuente de la torre de visión |
| joamCriff123/zils-lite-l1121a | No disponible | No disponible | Apache-2.0 | Hugging Face | Fuente del soup de lenguaje |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en ninguna tarea, por lo que cualquier uso en producción requiere evaluación propia.
- Documentación mínima: la model card se limita a describir la fórmula de merge; no hay información sobre datos, idiomas, contexto ni comportamiento esperado.
- Requiere `custom_code`: la carga depende de código del repositorio, lo que implica riesgos de seguridad y de mantenimiento; conviene auditar el código antes de ejecutarlo.
- Riesgo de alucinación: desconocido, pero al derivar de un modelo de 0,8B es esperable una tasa elevada en tareas generativas si conserva esa capacidad.
- Sesgos: no documentados; los sesgos de los modelos de origen se heredan sin cuantificar.
- Idiomas: el campo de idiomas está vacío, por lo que no hay garantía de soporte multilingüe más allá de lo que herede de Qwen3.5-0.8B.
- Uso comercial: la licencia Apache-2.0 lo permite, pero deben verificarse las licencias y condiciones de los modelos de origen y del código personalizado incluido.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un artefacto recién publicado y sin validación comunitaria.
- Fecha de creación: el repositorio figura creado el 2026-11-22, dato que conviene contrastar por si se trata de metadatos erróneos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsl-a3
- Modelo base (lenguaje): https://huggingface.co/joamCriff123/zils-lite-l1121a
- Modelo base (visión): https://huggingface.co/corners-ai/CoCo-Decision-Vision-0.8B
- Modelo padre: https://huggingface.co/Qwen/Qwen3.5-0.8B

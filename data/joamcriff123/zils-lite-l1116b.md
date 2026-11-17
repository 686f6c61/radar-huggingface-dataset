# joamCriff123/zils-lite-l1116b

## Resumen

zils-lite-l1116b es un modelo de decisión ("decision body") de la familia d3-lite, desarrollado por el usuario joamCriff123 y publicado en Hugging Face. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-0.8B, un transformer denso de aproximadamente 853 millones de parámetros, orientado a tareas de extracción de características y toma de decisiones dentro del ecosistema Zils (subnet 127, pool lite). El modelo se distribuye con licencia Apache-2.0 y pesos en formato safetensors, con un repositorio de 1,7 GB.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo pequeño, de despliegue ligero y licencia permisiva, pensado para integrarse como componente de decisión en un pipeline mayor. Al derivar de Qwen3.5-0.8B, hereda presumiblemente las capacidades lingüísticas del modelo base, aunque la model card no documenta el proceso de entrenamiento ni los datos utilizados. El pipeline declarado es feature-extraction, no text-generation, lo que sugiere un uso como extractor de representaciones o clasificador más que como generador conversacional.

No se han publicado detalles sobre el dataset de entrenamiento, el método de ajuste (SFT, DPO, RLHF) ni evaluaciones de rendimiento. La información disponible se limita a los metadatos del repositorio y a una model card mínima de tres líneas. Cualquier evaluación de su calidad debe hacerse, por tanto, empíricamente sobre el caso de uso concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.5-0.8B); detalles no disponibles |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/otros no documentadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen/Qwen3.5-0.8B, un transformer denso de la familia Qwen3.5. No se dispone de información sobre la arquitectura interna específica (número de capas, dimensión oculta, cabezas de atención, tipo de atención) más allá de lo que corresponde al modelo base, cuyos detalles técnicos no se incluyen en la información proporcionada. El pipeline declarado es feature-extraction, lo que indica que el modelo está configurado para producir representaciones o salidas de decisión, no necesariamente texto generativo libre.

Respecto al entrenamiento, la model card no documenta el número de tokens, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor lo describe como un "d3-lite decision body" para el "Zils subnet 127 lite pool", lo que sugiere un ajuste orientado a una tarea de decisión específica dentro de ese ecosistema, pero no se aportan detalles sobre el objetivo de entrenamiento ni la función de pérdida. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de características: el pipeline declarado es feature-extraction, por lo que el modelo está pensado para generar representaciones vectoriales o salidas de decisión a partir de entradas de texto.
- Toma de decisiones: el autor lo etiqueta como "decision-model" dentro del ecosistema Zils, lo que implica un uso como componente de decisión en un sistema mayor.
- Capacidades lingüísticas heredadas: al derivar de Qwen3.5-0.8B, presumiblemente conserva parte de las capacidades del modelo base, aunque no se documenta cuáles se mantienen tras el fine-tuning.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas en Hugging Face figura como no disponible).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación o filtrado de contenido en pipelines de moderación: el modelo puede emplearse como extractor de características para alimentar un clasificador posterior, aprovechando su tamaño reducido y su licencia permisiva para desplegarse en entornos con recursos limitados.
- Componente de decisión en sistemas de enrutamiento: dentro del ecosistema Zils, puede actuar como "decision body" que evalúe entradas y determine la ruta o acción a seguir en un flujo multi-etapa.
- Extracción de embeddings para búsqueda semántica: al ser un modelo de feature-extraction, puede generar representaciones para sistemas de recuperación de información (RAG) en dominios donde se haya ajustado, siempre que se valide empíricamente su calidad.
- Prototipado rápido en entornos con GPU consumer: con 853 millones de parámetros y pesos safetensors de 1,7 GB, cabe en GPUs de gama media y permite iterar rápidamente en fases de investigación.
- Investigación sobre fine-tuning de modelos pequeños: sirve como ejemplo de ajuste de Qwen3.5-0.8B para tareas de decisión, útil para estudiar técnicas de adaptación en modelos de menos de mil millones de parámetros.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 facilita su integración en productos comerciales sin las restricciones de otras licencias, siempre que se respeten las atribuciones del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y contexto; en la práctica, entre 2 y 4 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,5 GB para pesos (si se generan cuantizaciones, no documentadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son compatibles, aunque el modelo es sobredimensionado para GPUs de datacenter.
- Cabe en GPU consumer: sí, en la mayoría de GPUs modernas de gama media y alta.
- Opciones de despliegue: transformers (librería declarada). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al tener código personalizado (tag custom_code), puede requerir `trust_remote_code=True`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Pipeline | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-l1116b | 853 M | no disponible | Apache-2.0 | feature-extraction | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~800 M | no disponible | no disponible en la información | no disponible | Hugging Face |
| Otros fine-tunes de Qwen3.5-0.8B | variable | no disponible | variable | variable | Hugging Face |

La comparativa se limita al modelo base y a otros fine-tunes de la misma familia, ya que no se dispone de datos de rendimiento ni de especificaciones completas de alternativas comparables. No se han identificado benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentación sobre entrenamiento: no se conocen los datos, el método de ajuste ni el objetivo, lo que impide evaluar sesgos y calidad de forma rigurosa.
- Riesgo de alucinación: al ser un modelo pequeño y sin evaluaciones publicadas, la fiabilidad de sus salidas no está garantizada; debe validarse en el caso de uso concreto.
- Idiomas soportados no documentados: no se puede asegurar un rendimiento multilingüe adecuado.
- Contexto no documentado: se desconoce la longitud máxima de secuencia soportada, lo que limita su uso en tareas de contexto largo.
- Código personalizado: el tag custom_code implica que la carga del modelo puede requerir `trust_remote_code=True`, con el riesgo de seguridad asociado a ejecutar código del repositorio.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse las atribuciones del modelo base Qwen/Qwen3.5-0.8B indicadas en LICENSE y NOTICE.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento activo.
- Sin benchmarks: no hay datos que permitan comparar su rendimiento con alternativas, por lo que cualquier decisión de adopción debe basarse en pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/joamCriff123/zils-lite-l1116b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B

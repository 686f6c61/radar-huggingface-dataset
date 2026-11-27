# social-jev/social-jev-0.6B-preview

## Resumen

SocialJev 0.6B — Preview es un modelo de clasificación para ciencias sociales desarrollado por social-jev, construido mediante fine-tuning sobre Qwen/Qwen3-0.6B. Su propuesta central es ofrecer una interfaz tipada (typed interface) sobre un modelo de lenguaje: el usuario define una consulta con un texto y un conjunto de opciones, y el modelo devuelve una elección con sus probabilidades asociadas. De este modo se combina la flexibilidad de un modelo preentrenado con la velocidad y determinismo de los métodos NLP ligeros.

El modelo se inspira explícitamente en los modelos Jev de TypeSafe y se distribuye como preview, con la advertencia de que las interfaces pueden cambiar entre versiones tempranas. Con 596.050.945 parámetros reales (según safetensors) y un tamaño de repositorio de 1,2 GB, está pensado para tareas de clasificación y extracción de características en dominios de ciencias sociales, como el etiquetado de documentos políticos o la categorización temática.

Su relevancia actual radica en la popularización de los modelos pequeños especializados en tareas concretas, que ofrecen latencia baja y despliegue sencillo frente a alternativas de mayor tamaño. No obstante, la información pública disponible es limitada: no se especifican licencia, idiomas ni datos de entrenamiento más allá del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-0.6B) |
| Parametros totales | 596.050.945 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only de aproximadamente 0,6 mil millones de parámetros, y se ha ajustado mediante fine-tuning para la tarea de clasificación con interfaz tipada. La model card indica el uso de `custom_code` y `trust_remote_code=True`, lo que implica que el repositorio incluye código propio para definir las clases `Query`, `Request` y el método `query`, que devuelve objetos con campos `.choice` y `.probabilities`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que la familia SocialJev combina modelos preentrenados con "trillions of tokens" de texto, pero se refiere al preentrenamiento del modelo base, no a un detalle verificable del fine-tuning. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación con opciones cerradas: dado un texto y un conjunto de opciones, devuelve la opción elegida y un diccionario de probabilidades.
- Extracción de características (pipeline `feature-extraction` en Hugging Face).
- Interfaz tipada mediante Pydantic, con objetos `Query` y `Request` que estructuran la entrada y la salida.
- Procesamiento por lotes: varias peticiones y varias consultas por documento, con resultados ordenados por documento y luego por consulta.
- Integración con Transformers y con vLLM para cargas de trabajo mayores.
- Soporte de ejecución síncrona (`.query()`) y asíncrona (`.aquery()`) en el backend vLLM.
- No se documentan capacidades de generación abierta, tool calling, agentes, visión ni audio.

## Casos de uso

- Etiquetado temático de documentos políticos: clasificar actas de consejos o comunicados gubernamentales en áreas como Transporte, Educación o Sanidad usando la interfaz de opciones cerradas.
- Codificación de encuestas abiertas: asignar respuestas de texto libre a categorías predefinidas de un cuestionario, con probabilidades para medir la confianza de la asignación.
- Análisis de discurso en investigación social: clasificar fragmentos de discursos o manifiestos según marcos temáticos definidos por el investigador.
- Moderación de contenido ligera: categorizar comentarios en un conjunto acotado de etiquetas con un modelo de 0,6B que puede ejecutarse en CPU o GPU de gama baja.
- Preetiquetado para anotación humana: generar etiquetas preliminares con probabilidades para acelerar la revisión manual en proyectos de anotación.
- Clasificación por lotes en pipelines de datos: procesar grandes volúmenes de documentos con el backend vLLM y envío asíncrono concurrente.
- Extracción de características para downstream: usar el modelo como extractor y entrenar clasificadores ligeros sobre sus representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 596 millones de parámetros, en fp16 requiere aproximadamente 1,2 GB de VRAM; en cuantización de 8 bits, alrededor de 0,6 GB; en 4 bits, en torno a 0,3 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM para fp16; RTX 3060, RTX 4060 o superiores son suficientes. Para lotes grandes, A100 o H100 ofrecen mayor throughput.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas e incluso en CPU para cargas moderadas.
- Opciones de despliegue: Transformers (backend estándar del paquete `social-jev`) y vLLM (backend opcional con `social-jev[vllm]`). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| social-jev-0.6B-preview | 596 M | no disponible | Clasificación tipada | no disponible | Hugging Face |
| Qwen/Qwen3-0.6B | ~0,6 B | no disponible | Generación general | no disponible en esta ficha | Hugging Face |
| Modelos Jev de TypeSafe | no disponible | no disponible | Clasificación tipada | no disponible | Referencia en blog de TypeSafe |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo en estado preview: la model card advierte que las interfaces pueden cambiar entre versiones tempranas, lo que supone un riesgo para producción.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido.
- Idiomas no documentados: no hay garantía de comportamiento multilingüe más allá de lo que herede de Qwen3-0.6B.
- Sin datos de benchmarks: no es posible evaluar su calidad frente a alternativas.
- Riesgo de alucinación inherente a los modelos de lenguaje, aunque la tarea de clasificación con opciones cerradas lo mitiga parcialmente.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del modelo.
- Sesgos: no documentados; al derivar de un modelo preentrenado, puede heredar sesgos de su corpus.
- Longitud de contexto no especificada, lo que dificulta planificar su uso con documentos largos.

## Enlaces

- Hugging Face: https://huggingface.co/social-jev/social-jev-0.6B-preview
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Sitio web: https://social-jev.github.io/
- Documentación: https://social-jev.github.io/docs/
- Guía de inferencia: https://social-jev.github.io/docs/v0.1.0a4/inference/
- Referencia de API: https://social-jev.github.io/docs/v0.1.0a4/api/
- GitHub: https://github.com/social-jev/social-jev
- Blog de TypeSafe sobre Jev: https://typesafe.ai/blog/introducing-system-one-models-and-jev

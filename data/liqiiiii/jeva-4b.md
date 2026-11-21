# LIQIIIII/Jeva-4B

## Resumen

Jeva-4B es un modelo de decisión de tipo "System One" desarrollado por Qi Li y Xinchao Wang (National University of Singapore), diseñado para tomar decisiones directas sobre texto sin generar cadenas largas de razonamiento. En lugar de producir explicaciones, el modelo selecciona entre alternativas, estima la probabilidad de que una afirmación sea verdadera y asigna puntuaciones según una rúbrica. Se construye sobre un backbone Qwen3.5-4B de 4.000 millones de parámetros, con una cabeza de decisión específica (`head.pt`) y pesos de adaptador (`backbone_adapter/`).

La propuesta técnica se articula en cuatro propiedades: consciencia de nulo (admite explícitamente "ninguna de las anteriores"), invariancia a permutación (el orden de los candidatos no altera la decisión), escalabilidad de opciones (maneja conjuntos pequeños y grandes con el mismo modelo) y cacheabilidad (reutiliza opciones ya procesadas en nuevas peticiones). El modelo está pensado para tareas de enrutamiento, selección de documentos, evaluación de relevancia y scoring basado en rúbricas.

Es relevante porque separa la computación de las opciones de la computación de la decisión, lo que permite amortizar coste en escenarios con catálogos de candidatos estables. La licencia es Apache 2.0 tanto para los pesos del modelo como para el backbone subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-4B) con cabeza de decisión dedicada y adaptador |
| Parametros totales | 4B (backbone) + cabeza de decisión y adaptador (tamaño no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; cabeza en `head.pt`; adaptador en `backbone_adapter/` |

## Arquitectura y entrenamiento

El modelo parte de un backbone Qwen3.5-4B (transformer denso, licencia Apache 2.0 upstream) sobre el que se añaden dos componentes: una cabeza de decisión (`head.pt`) y pesos de adaptador (`backbone_adapter/`). El diseño está orientado a producir decisiones directas en una sola pasada, sin decodificación autoregresiva de explicaciones, lo que reduce latencia frente a modelos generativos que razonan paso a paso. La invariancia a permutación y la cacheabilidad de opciones sugieren un mecanismo de codificación de candidatos independiente del orden y reutilizable entre peticiones.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla si se emplearon innovaciones como decodificación especulativa o atención lineal. El paper de referencia es arXiv:2610.18773 ("Jeva: System One Models from First Principles"), pero los detalles de entrenamiento no se incluyen en la información proporcionada.

## Capacidades

- Selección de candidatos (Choice): elige una opción entre un conjunto de alternativas, con resultado opcional "ninguna de las anteriores".
- Verificación de afirmaciones (Noul): estima la probabilidad de que un enunciado sea verdadero.
- Puntuación por rúbrica (Score): asigna una evaluación numérica según una rúbrica proporcionada.
- Invariancia a permutación: la decisión se mantiene estable si se reordenan los candidatos.
- Escalabilidad de opciones: soporta conjuntos pequeños y grandes de candidatos con el mismo modelo.
- Cacheabilidad: reutiliza opciones ya procesadas en nuevas peticiones, incluidas combinaciones nuevas de opciones conocidas.
- Consciencia de nulo: admite explícitamente que ningún candidato aplique.
- Idioma: inglés.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Enrutamiento de peticiones: dado un ticket o consulta, el modelo selecciona el equipo o cola adecuada entre un conjunto de candidatos, con opción de "ninguna de las anteriores" para casos no clasificables.
- Selección de documentos: en un pipeline de recuperación, el modelo elige el documento más relevante entre candidatos recuperados, reutilizando codificaciones de documentos entre consultas gracias a la cacheabilidad.
- Evaluación de relevancia: estima la probabilidad de que un documento o pasaje sea relevante para una consulta, útil como filtro previo a un reranker más costoso.
- Scoring con rúbrica: evalúa la severidad de un incidente, la calidad de una respuesta o el impacto de una reclamación asignando una puntuación numérica según criterios definidos.
- Verificación de afirmaciones: comprueba si un informe describe un evento concreto (por ejemplo, una caída de servicio en curso) estimando su probabilidad de veracidad.
- Clasificación con catálogo estable: en sistemas con un conjunto fijo de categorías o etiquetas, el modelo reutiliza las opciones preprocesadas y solo recalcula la decisión por petición.
- Filtrado previo en pipelines de moderación: descarta candidatos irrelevantes antes de pasar a un modelo generativo, reduciendo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 10,5 GB en safetensors, lo que corresponde a pesos en precisión de 16 bits para el backbone de 4B más cabeza y adaptador. En fp16 se estiman en torno a 8-9 GB de VRAM; en cuantización de 8 bits, aproximadamente 4-5 GB; en 4 bits, alrededor de 2,5-3 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: no disponible de forma explícita. Por tamaño, cabría en GPUs de 16 GB o más (RTX 4090, A100 40/80 GB, H100) en fp16 sin problemas; en cuantización podría ejecutarse en GPUs de 8 GB.
- Cabe en GPU de consumo: probablemente sí en RTX 4090 (24 GB) en fp16, y en GPUs de 8-12 GB con cuantización, aunque no hay confirmación oficial.
- Opciones de despliegue: no se documentan explícitamente. El uso de safetensors, `head.pt` y `backbone_adapter/` sugiere carga con PyTorch/Transformers y scripts propios del repositorio GitHub; la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeva-4B | 4B + cabeza | no disponible | Decisión directa (choice/noul/score) | Apache 2.0 | Hugging Face |
| Qwen3.5-4B (backbone) | 4B | no disponible | Generación de texto | Apache 2.0 | Hugging Face |
| Modelos generativos de 4B (p. ej. Qwen, Llama 3.2 3B) | 3-4B | variable | Generación autoregresiva con razonamiento | variable | Hugging Face |

No se dispone de benchmarks que permitan una comparación cuantitativa con alternativas. La diferencia principal frente a modelos generativos del mismo tamaño es el enfoque: Jeva-4B no genera explicaciones, sino que emite decisiones estructuradas, lo que puede reducir latencia y coste en tareas de selección y scoring.

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta cobertura multilingüe.
- Es un modelo de decisión, no un generador de texto: no produce explicaciones ni razonamiento visible, lo que limita su auditabilidad directa.
- Riesgo de alucinación en la estimación de veracidad (Noul): la probabilidad emitida no garantiza corrección factual.
- Uso previsto para investigación y soporte a la decisión; el autor recomienda supervisión humana en decisiones consecuentes.
- No se documentan sesgos conocidos ni evaluaciones de robustez o seguridad.
- No se especifican límites de longitud de contexto, lo que dificulta planificar el truncado de entradas largas.
- La licencia Apache 2.0 permite uso comercial, pero el backbone Qwen3.5-4B conserva su licencia upstream Apache 2.0; conviene revisar `NOTICE` para atribuciones.
- No hay información sobre cuantizaciones oficiales ni compatibilidad con frameworks de despliegue estándar.

## Enlaces

- Hugging Face: https://huggingface.co/LIQIIIII/Jeva-4B
- Página del proyecto: https://liqiiiii.github.io/Jeva/
- Repositorio GitHub: https://github.com/LiQiiiii/Jeva
- Issues y feedback: https://github.com/LiQiiiii/Jeva/issues
- Paper: arXiv:2610.18773 ("Jeva: System One Models from First Principles")

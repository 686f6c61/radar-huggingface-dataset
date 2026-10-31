# macrocosm-os/iota-decide-4b-v0.3

## Resumen

Iota-decide-4b v0.3 es un modelo de decisión desarrollado por Macrocosmos a partir de una versión instruct de Qwen3.5-4B. A diferencia de un modelo conversacional convencional, no genera texto: dado un estado y un conjunto de preguntas tipadas (`choice` de opción múltiple, `noul` de sí/no y `score`), devuelve una probabilidad para cada opción en una única pasada hacia delante. Esto lo convierte en un componente de clasificación y decisión de baja latencia, pensado para integrarse en sistemas automatizados (enrutado de tickets, moderación, control de políticas) donde se necesitan probabilidades calibradas y no texto libre.

El ajuste fino se realizó con LoRA de rango 16 (ya fusionado en los pesos publicados) sobre 211.000 registros y 488.000 preguntas, combinando datos etiquetados por humanos, datasets públicos y estados de decisión generados filtrados por consenso entre dos profesores (Cloudflare Clef y Qwen3.6-35B-A3B). El modelo hereda la arquitectura de Qwen3.5-4B y mantiene compatibilidad con la librería `transformers` de Hugging Face, con pesos en safetensors y licencia Apache 2.0.

La versión 0.3 mejora sustancialmente a la 0.2 en el índice de decisión cross-domain (55,4 frente a 44,5) y supera a un competidor comercial de tamaño similar (Torchcast Decision 4B v1.3) en el conjunto trusted in-distribution, aunque por detrás en benchmarks generales. Es relevante para desarrolladores que buscan un clasificador de decisiones determinista, con abstención controlada y sin coste de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-4B, adaptado como cabeza de decisión probabilística (lectura de letras de opción) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica si el modelo base es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se publican pesos en bfloat16/fp16; repo de 9,1 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye `joint_head.safetensors` con la temperatura calibrada) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B (instruct) y conserva su arquitectura transformer, pero se le añade una cabeza de decisión (`joint_head`) que convierte las respuestas en probabilidades por opción. Las respuestas se leen de las letras de opción en la posición de respuesta: en lugar de generar texto, el modelo evalúa la probabilidad asociada a cada letra (hasta 26 opciones por pregunta) y aplica una temperatura calibrada almacenada en `joint_head.safetensors`. Esto garantiza salidas probabilísticas consistentes en una sola pasada hacia delante, sin decodificación autoregresiva.

El entrenamiento se realizó con LoRA de rango 16 y alpha 32 aplicado a todas las capas lineales del modelo de lenguaje, con learning rate 3e-5 durante 2.000 pasos, usando DiLoCo (distribuido federado) sobre 8 GPUs A6000 con 20/20 merges. La función de pérdida fue cross-entropy con soft targets. El dataset consta de 211.000 registros con 488.000 preguntas: 30.000 filas etiquetadas por humanos, 63.000 filas de 24 datasets públicos (ciencia, medicina, derecho, matemáticas, lectura, temas, emoción, paráfrasis, entailment, ética, sentido común) y 119.000 estados de decisión generados, conservando solo las preguntas donde Cloudflare Clef y un profesor de razonamiento Qwen3.6-35B-A3B coinciden, más preguntas en disputa resueltas con dos respuestas adicionales del profesor. Los autores declaran que no se incluyeron ítems de benchmark ni datos con forma de benchmark.

## Capacidades

- Decisiones tipadas en una sola pasada: preguntas `choice` (hasta 26 opciones), `noul` (sí/no) y `score`, devolviendo una probabilidad por opción sin generar texto.
- Salidas probabilísticas calibradas: las respuestas sí/no se reportan con probabilidad de al menos 0,801 en el lado elegido; las preguntas con 0,2 < P(sí) < 0,8 cuentan como abstención en JevBench.
- Entrada multimodal potencial: el pipeline en Hugging Face es image-text-to-text, heredado del modelo base Qwen3.5-4B, aunque la model card solo documenta uso con texto.
- Formato de petición estructurado: acepta un estado (`state`) y un diccionario de preguntas con instrucciones y criterios, pensado para integración programática mediante el script `letter_decide.py` incluido en el repositorio.
- Enrutado y clasificación con criterios explícitos: las preguntas `choice` admiten criterios definidos por el usuario (por ejemplo, "billing: pagos y reembolsos").
- Idioma: entrenado y documentado en inglés.

## Casos de uso

- Enrutado automático de tickets de soporte: dado el texto del ticket y la política de la empresa como estado, el modelo responde en una pasada si la solicitud requiere aprobación (`noul`) y a qué equipo debe derivarse (`choice`), con probabilidades calibradas que permiten definir umbrales de escalado a revisión humana.
- Moderación de contenido: clasificación de ofensividad en mensajes (el propio modelo se evalúa sobre TweetEval offensive) con probabilidad por clase, útil como filtro previo de bajo coste antes de una revisión manual.
- Cumplimiento de políticas (policy check): verificar si una acción concreta (reembolso, permiso, acceso) cumple una política escrita, respondiendo sí/no con probabilidad mínima de 0,801 en el lado elegido.
- Clasificación de texto multiclase en producción: cualquier tarea de clasificación con hasta 26 clases (intención, sentimiento, tema, entailment) donde se necesiten probabilidades por clase sin generación, reduciendo latencia frente a un LLM generativo.
- Agentes con decisiones discretas: como componente de decisión dentro de un agente multi-paso, donde en cada paso hay que elegir entre acciones tipadas; el modelo aporta la distribución de probabilidad y el orquestador decide según umbral o abstención.
- Etiquetado masivo de datasets: dada su baja latencia por decisión (una pasada, sin decodificación), es adecuado para anotar grandes volúmenes de ejemplos con probabilidades que permitan filtrar los casos inciertos.
- Sistemas de abstención segura: el umbral de abstención de JevBench (0,2 < P < 0,8) permite diseñar pipelines donde los casos dudosos se derivan automáticamente a un humano o a un modelo más grande.

## Benchmarks y rendimiento

Resultados publicados por los propios autores (evaluaciones propias, no benchmarks independientes):

| Set | v0.2 (publicada) | **v0.3 (este modelo)** | Torchcast Decision 4B v1.3 |
|---|---|---|---|
| Cross-domain skill: 15 benchmarks del Decision Index nunca entrenados (corregido por azar, ~10,4k preguntas) | 44,5 | **55,4** | 65,6 |
| Rotten Tomatoes (gold humano, nunca entrenado) | 79,6 | **85,1** | 90,7 |
| TweetEval offensive (gold humano, nunca entrenado) | 79,6 | **76,4** | 79,5 |
| Trusted set (3.000 estados generados, 3 votos del profesor; in-distribution) | 72,9 | **77,3** | 71,8 |
| JevBench, ítems públicos (231) | 182 | **188** | 211 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,54 mil millones de parámetros en precisión completa, aproximadamente 9-10 GB de VRAM para los pesos, más overhead de activaciones y KV cache; alrededor de 5-6 GB con cuantización a 8 bits (no documentada oficialmente).
- GPU recomendadas: cualquier GPU de consumo con 12 GB o más de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente para inferencia; el entrenamiento original usó 8x A6000, pero eso no aplica a despliegue.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 12 GB de VRAM en fp16/bf16; también debería ejecutarse en CPU con tiempo de respuesta aceptable al ser una sola pasada por decisión.
- Opciones de despliegue: `transformers` de Hugging Face con el script `letter_decide.py` incluido en el repositorio (dependencias: torch, transformers, safetensors, huggingface_hub). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al usar una cabeza personalizada (`joint_head`), el despliegue probablemente requiere el código del autor.
- Latencia: al no generar texto y resolver cada pregunta en una sola pasada hacia delante, la latencia por decisión es muy baja en comparación con un LLM generativo; no se publican cifras concretas de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Rendimiento (datos disponibles) |
|---|---|---|---|---|---|
| iota-decide-4b v0.3 | 4,54B | Decisión probabilística (una pasada, sin generación) | no disponible | Apache 2.0 | 55,4 en Decision Index cross-domain; 77,3 en trusted set |
| Torchcast Decision 4B v1.3 | no disponible | Decisión | no disponible | no disponible | 65,6 en Decision Index; 71,8 en trusted set; 211/231 en JevBench |
| Qwen/Qwen3.5-4B (base) | ~4B | LLM conversacional/multimodal | no disponible | Apache 2.0 | no disponible como clasificador de decisiones |

Iota-decide-4b v0.3 se sitúa entre su versión anterior (v0.2) y el competidor comercial Torchcast Decision 4B v1.3: lo supera en el conjunto in-distribution (77,3 frente a 71,8) y en Rotten Tomatoes, pero queda por detrás en los benchmarks cross-domain y en JevBench. Su ventaja diferencial frente a un LLM generativo de tamaño similar es la latencia y la salida probabilística determinista.

## Limitaciones y advertencias

- Idioma: el modelo está entrenado y documentado en inglés; no hay soporte declarado para castellano ni otros idiomas.
- Sin generación de texto: no sirve como chatbot ni como asistente general; solo produce probabilidades sobre opciones tipadas.
- Límite de 26 opciones por pregunta `choice`.
- Riesgo de error en dominios no vistos: en benchmarks cross-domain nunca entrenados obtiene 55,4 (corregido por azar), claramente por debajo de Torchcast (65,6), lo que indica generalización limitada fuera de su distribución de entrenamiento.
- Rendimiento mixto en ofensividad: empeora respecto a v0.2 en TweetEval offensive (76,4 frente a 79,6), señal de que las mejoras generales no son uniformes.
- Evaluaciones propias: todos los benchmarks publicados son ejecuciones de los autores; no existen evaluaciones independientes.
- Dependencia de código propietario del repositorio: la temperatura calibrada y el formato de renderizado de preguntas requieren el script `letter_decide.py`; usar el modelo sin ese pipeline puede degradar la calibración.
- Adopción temprana: con 47 descargas y 2 likes en Hugging Face, hay poca evidencia de uso en producción o de problemas descubiertos por la comunidad.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse con datos de moderación, ética y clasificación de emociones, puede heredar los sesgos de esos datasets públicos.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, aunque conviene revisar los términos del modelo base Qwen3.5-4B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/macrocosm-os/iota-decide-4b-v0.3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Autor (Macrocosmos): no disponible (no se ha encontrado enlace a web o repositorio de la organización en la información proporcionada)

# budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-forced-answer-civilsnake-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo de Qwen/Qwen3.5-4B, publicado bajo el identificador `budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-forced-answer-civilsnake-s300`. Lo desarrolla la cuenta anónima `budget-internalization-iclr2027`, en el marco de un envío anónimo a ICLR 2027, y su objetivo declarado es el razonamiento matemático bajo un presupuesto fijo de generación de 8.192 tokens. Se trata de un experimento de investigación sobre internalización de presupuesto, no de un modelo de propósito general listo para producto.

El modelo parte de Qwen3.5-4B y se entrena con GRPO (Group Relative Policy Optimization) sobre el dataset `agentica-org/DeepScaleR-Preview-Dataset` durante un máximo de 3 épocas, hasta el paso 300 del run apodado `civilsnake`. La innovación principal es la técnica de respuesta forzada: cuando la respuesta agota el presupuesto de 8.192 tokens, el razonamiento se cierra y el modelo es obligado a emitir una respuesta final en formato `Final Answer: \boxed{`, de hasta 120 tokens, que después se puntúa con una recompensa binaria de corrección.

La relevancia actual del checkpoint es fundamentalmente metodológica: sirve como punto de comparación en estudios sobre control de longitud del razonamiento y sobre cómo un modelo internaliza un límite de cómputo durante el entrenamiento. El repositorio tiene 4.539.265.536 parámetros en BF16 (9,1 GB), licencia apache-2.0 y pipeline declarado `image-text-to-text`, heredado de la base multimodal. No hay resultados de evaluación publicados ni información sobre idiomas soportados, longitud de contexto o cuantizaciones disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en la información proporcionada (derivada de Qwen/Qwen3.5-4B; pipeline declarado `image-text-to-text`) |
| Parámetros totales | 4.539.265.536 (≈4,54 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card solo documenta un presupuesto de generación de 8.192 tokens) |
| Tipos de cuantización | no disponible (solo pesos BF16 en safetensors; sin GGUF, AWQ ni GPTQ publicados) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (BF16), repositorio de 9,1 GB |
| Modelo base | Qwen/Qwen3.5-4B (relación: finetune) |
| Tipo de ajuste | RL con GRPO y respuesta forzada (*forced answering*) |
| Dataset de entrenamiento | agentica-org/DeepScaleR-Preview-Dataset (matemáticas), máximo 3 épocas |
| Presupuesto de generación | 8.192 tokens (`max_new_tokens`); respuesta final forzada de hasta 120 tokens |
| Checkpoint publicado | paso 300 del run `civilsnake` |
| Precisión de los pesos | BF16 |
| Librería | transformers (compatible con `endpoints_compatible`) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se detalla en la información proporcionada la arquitectura interna del modelo (tipo de atención, número de capas, cabezas o si emplea mecanismos híbridos). Lo único verificable es que hereda la arquitectura de Qwen/Qwen3.5-4B, que el pipeline declarado es `image-text-to-text` (es decir, la base admite entrada de imagen y texto) y que el checkpoint resultante mantiene los 4.539.265.536 parámetros del modelo original con pesos en BF16. Cualquier afirmación sobre atención lineal, decodificación especulativa u otras innovaciones de la base no está respaldada por la información disponible.

El entrenamiento es el elemento mejor documentado: GRPO con respuesta forzada, lote de 32 prompts por 8 rollouts por paso, optimizador Adam con schedule de LR coseno, LR máximo de 5e-7 y 10 pasos de calentamiento, durante 300 pasos y un máximo de 3 épocas sobre DeepScaleR. La recompensa es binaria y se calcula extrayendo la respuesta de las etiquetas `\boxed{}`. El prompt de entrenamiento es explícito y fijo: «Think step-by-step to solve the following problem. Output your answer inside of \\boxed{} tags.: {problem} / Let's think step-by-step», renderizado con la plantilla de chat del modelo base. No se documenta ningún uso de RLHF, DPO ni fases de alineamiento de seguridad.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso dentro de un presupuesto de 8.192 tokens de generación.
- Respuesta forzada con cierre del razonamiento: al alcanzar el presupuesto, el modelo emite `Final Answer: \boxed{` y una respuesta de hasta 120 tokens.
- Salida estructurada y parseable mediante extracción del contenido de `\boxed{}`, apta para pipelines automáticos de evaluación.
- Razonamiento de cadena larga (*step-by-step*), inducido explícitamente por el prompt de entrenamiento.
- Capacidad conversacional: el repositorio está etiquetado como `conversational` y se ejecuta con la plantilla de chat de la base.
- Capacidad multimodal texto-imagen heredada de Qwen/Qwen3.5-4B según el pipeline declarado; no se documenta ni se evalúa ningún ajuste específico de visión tras el RL.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (el entrenamiento se realiza sobre un dataset de matemáticas, presumiblemente en inglés).
- Modo *thinking* conmutable: no documentado; existe razonamiento explícito en la salida, pero no un modo alternativo desactivable.

## Casos de uso

- Investigación sobre internalización de presupuesto de cómputo: el checkpoint es un punto de medida del run `civilsnake` (paso 300) y permite estudiar si el modelo aprende a resolver problemas dentro de un límite fijo de 8.192 tokens sin degradar la precisión de la respuesta final.
- Comparación de checkpoints en estudios de RL: al compartir base, dataset, hiperparámetros y receta de recompensa con otros checkpoints del mismo grupo de investigación, sirve como referencia controlada frente a variantes de presupuesto o de estrategia de respuesta forzada.
- Generación de datos sintéticos de razonamiento matemático: los rollouts con recompensa binaria pueden filtrarse por corrección para construir datasets de cadenas de razonamiento con longitud acotada, útiles para destilación en modelos menores.
- Evaluación automática de soluciones matemáticas: la salida forzada a `\boxed{}` permite integrar el modelo en un pipeline que extraiga la respuesta y la compare con la solución de referencia sin postprocesado complejo.
- Tutoría matemática con límite de coste: en un servicio educativo, el presupuesto de 8.192 tokens acota el gasto por consulta y la latencia máxima, algo crítico cuando el usuario espera una respuesta acotada y no una cadena de razonamiento ilimitada.
- Reproducción de experimentos de RL con presupuesto: la receta está totalmente especificada (GRPO, 32 prompts × 8 rollouts, Adam, LR 5e-7, 300 pasos, recompensa binaria), lo que facilita la replicación y el ajuste de hiperparámetros.
- Análisis de degradación de capacidades generales: al ser un ajuste de RL centrado exclusivamente en matemáticas, resulta útil para medir cuánto se pierde en conversación general o en entrada de imagen tras el entrenamiento, un aspecto habitual en estudios de *catastrophic forgetting*.
- Ajuste fino continuado con presupuesto fijo: puede actuar como inicialización para dominios donde el coste de inferencia deba estar limitado por diseño, por ejemplo verificación de cálculos en herramientas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe la señal de entrenamiento (recompensa binaria mediante extracción de `\boxed{}` sobre DeepScaleR) y no incluye cifras de precisión final, ni evaluaciones en MMLU, GSM8K, MATH, AIME, HumanEval u otros conjuntos. Tampoco se aportan curvas de recompensa, tasas de respuestas truncadas por el presupuesto ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada con pesos BF16: en torno a 9,1 GB solo para los pesos, más activaciones y caché KV (dependientes de la longitud de contexto, que no está documentada). Como referencia práctica, entre 11 y 16 GB para contextos moderados.
- Cuantización a 8 bits: aproximadamente 5 GB de pesos; a 4 bits, en torno a 2,8-3 GB. Estas cuantizaciones no están publicadas y habría que generarlas localmente (por ejemplo con bitsandbytes, AWQ o conversión a GGUF).
- GPU profesionales: A100 (40/80 GB), H100 (80 GB) y L40S (48 GB) son suficientes con margen amplio; el modelo es pequeño para este tipo de aceleradores y el cuello de botella será el throughput, no la memoria.
- GPU de consumo: cabe sin problema en RTX 4090 o RTX 3090 (24 GB) en BF16; en tarjetas de 16 GB (RTX 4080, 4070 Ti Super) es viable con contexto moderado; en 12 GB o menos es recomendable cuantizar.
- Opciones de despliegue: transformers (ejemplo oficial con `AutoModelForCausalLM` y `device_map="auto"`) y vLLM, para el que la model card incluye el comando `vllm serve`. El tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no está publicada. El soporte en TGI o SGLang depende de que estas herramientas soporten la arquitectura `qwen3_5`.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por consulta, ni con vLLM ni con transformers.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-4B + GRPO forced answer, paso 300) | 4.539.265.536 (BF16) | no disponible | apache-2.0 | HuggingFace, 0 descargas, 0 likes | Ajuste de RL solo para matemáticas, presupuesto de generación de 8.192 tokens, sin benchmarks publicados |
| Qwen/Qwen3.5-4B (modelo base) | no disponible en la información proporcionada | no disponible | apache-2.0 | HuggingFace | Base multimodal con pipeline `image-text-to-text`; capacidades generales sin el sesgo del RL en matemáticas |
| Otras alternativas del mismo rango de tamaño (por ejemplo ajustes de RL para matemáticas sobre bases de 3-8B) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada para establecer una comparación rigurosa |

No se dispone de datos suficientes para comparar este checkpoint con alternativas equivalentes en parámetros, contexto o rendimiento: la información proporcionada no incluye benchmarks, ni la longitud de contexto del modelo base, ni las especificaciones de modelos competidores.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay cifras de precisión, ni comparación contra el modelo base, ni análisis de la tasa de respuestas que agotan el presupuesto. El rendimiento real es desconocido.
- Respuesta forzada con presupuesto rígido: si un problema requiere más de 8.192 tokens de razonamiento, el modelo cierra la cadena y dispone de solo 120 tokens para la respuesta final, lo que puede producir fallos sistemáticos en problemas de alta dificultad.
- Riesgo de *reward hacking*: la recompensa es binaria y se calcula extrayendo `\boxed{}`. El modelo podría optimizar el formato de la respuesta en lugar de la corrección matemática, un patrón conocido en RL con recompensas de verificación superficial.
- Sesgos: no documentados explícitamente, pero el entrenamiento se realiza exclusivamente sobre DeepScaleR (matemáticas), lo que puede sesgar el estilo de solución, la notación y las estrategias hacia las presentes en ese dataset.
- Alucinación: riesgo alto en dominios matemáticos y sin mecanismo de verificación formal. No hay filtro de seguridad ni alineamiento documentado tras el ajuste de RL.
- Degradación de capacidades generales: el RL sobre matemáticas puede reducir el rendimiento en conversación general y, potencialmente, en las capacidades de visión heredadas de la base, que no se reevalúan tras el ajuste.
- Limitaciones de idioma: no hay información sobre idiomas soportados. Es esperable un rendimiento inferior en castellano o en cualquier idioma distinto del usado en el dataset de entrenamiento.
- Contaminación de benchmarks: DeepScaleR puede solaparse con conjuntos públicos habituales (AIME, AMC, MATH), por lo que cualquier comparación futura debería verificar el solapamiento antes de extraer conclusiones.
- Longitud de contexto desconocida: no se puede planificar su uso en cargas con contextos largos, ya que la model card solo especifica el presupuesto de generación, no la ventana de entrada.
- Licencia: apache-2.0, heredada del modelo base, lo que en principio permite uso comercial. Aun así, conviene verificar los términos de Qwen/Qwen3.5-4B y las condiciones de uso de DeepScaleR para el caso concreto de reentrenamiento o redistribución.
- Estado de publicación: se trata de un envío anónimo a ICLR 2027, sin paper, sin revisión por pares y sin autoría verificable. El repositorio no tiene descargas ni interacciones, y la reproducibilidad depende únicamente de la receta descrita en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-forced-answer-civilsnake-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Búsqueda web: los resultados obtenidos no guardan relación con el modelo (páginas de alquiler de coches de la marca Budget y del presupuesto del Estado francés). No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.

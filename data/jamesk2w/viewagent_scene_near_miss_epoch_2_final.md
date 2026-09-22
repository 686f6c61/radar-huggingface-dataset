# JamesK2W/viewagent_scene_near_miss_epoch_2_final

## Resumen

`viewagent_scene_near_miss_epoch_2_final` es un checkpoint de investigación publicado por el usuario JamesK2W, resultado de aplicar un pipeline de aprendizaje por refuerzo (denominado ViewAgent GraphRL) sobre el modelo multimodal Qwen3-VL-8B-Instruct. El modelo está especializado en planificación interactiva de vistas sobre escenas de interior del dataset ScanNet: el agente debe decidir desde qué punto de vista observar la escena para resolver una tarea de percepción, en lugar de limitarse a responder sobre una imagen fija.

El entrenamiento corresponde a la época 2 de GRPO (71 pasos, con una mezcla de prompts 10/80/10 en la etapa "medium" y la mitad de entrenamiento D0), partiendo del checkpoint `viewagent_scene_near_miss_sft_epoch_1`, que a su vez deriva de un ajuste supervisado. El autor reporta un `pass@8` del 2,67 % medido dentro del propio entrenador, una cifra muy baja que sitúa el modelo en fase experimental y no en un estado listo para producción.

Técnicamente es un transformer denso de 8.767.123.696 parámetros (unos 8,77 mil millones) con encoder visual y decoder de lenguaje, con licencia Apache 2.0 y pesos en safetensors. Se carga mediante `AutoModelForImageTextToText.from_pretrained` y el autor indica que puede servirse directamente con SGLang o vLLM. Su interés actual es acotado: sirve como artefacto reproducible para investigación en agentes de percepción activa y como punto de partida para nuevos ciclos de RL, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (encoder de visión + decoder de lenguaje) derivado de Qwen3-VL-8B-Instruct; etiqueta de HuggingFace `qwen3_vl` |
| Parametros totales | 8.767.123.696 (~8,77 mil millones), dato real de los safetensors |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada por el autor para este checkpoint. El modelo base Qwen3-VL-8B-Instruct declara 256K tokens nativos según la documentación de Qwen |
| Tipos de cuantizacion | No disponible. El autor solo publica safetensors; no hay versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible para este checkpoint. El modelo base es multilingüe según su documentación |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors. El repositorio ocupa 35,1 GB, aproximadamente el doble de los ~17,5 GB esperables para 8.767 M de parámetros en BF16, lo que sugiere pesos en FP32 o artefactos adicionales; el autor no lo confirma |

Otros datos del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, creado el 22 de septiembre de 2026 y actualizado el mismo día. No tiene pipeline declarado.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL-8B-Instruct: un modelo visión-lenguaje con encoder visual y decoder de lenguaje autorregresivo, capaz de procesar imágenes y texto de forma conjunta. El checkpoint no modifica la topología del modelo base; lo que cambia es el ajuste fino mediante SFT (etapa 1) y posteriormente GRPO (etapa 2 de RL), orientado a una tarea concreta de planificación de vistas.

El entrenamiento descrito en la model card es el siguiente: se parte de `viewagent_scene_near_miss_sft_epoch_1`, se ejecuta GRPO durante 71 pasos con una composición de prompts 10/80/10 en la etapa "medium" y la mitad de entrenamiento D0. El pipeline se llama ViewAgent GraphRL y trabaja sobre escenas de ScanNet en un entorno interactivo donde el agente propone puntos de vista. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la función de recompensa ni si hubo fases adicionales de DPO o RLHF más allá del GRPO citado. Tampoco se documentan innovaciones de decodificación (por ejemplo, decodificación especulativa) ni mecanismos de atención lineal.

Un dato relevante para interpretar el resultado: el propio autor reporta un `pass@8` del 2,67 % medido en el entrenador. Es decir, el modelo acierta la tarea en menos de 3 de cada 100 intentos agrupados, lo que sugiere que la tarea es muy difícil o que el entrenamiento aún está lejos de converger.

## Capacidades

- Generación de texto e interacción multimodal: al heredar Qwen3-VL-8B-Instruct, puede procesar entradas de imagen y texto y producir respuestas en lenguaje natural.
- Planificación interactiva de vistas: la capacidad específica que entrena este checkpoint es decidir movimientos o puntos de vista sucesivos sobre una escena de interior para completar un objetivo de percepción.
- Razonamiento multi-paso en entornos de escena: el entrenamiento con GRPO está orientado a secuencias de decisiones, no a respuestas de un solo turno.
- Integración en bucles de agente: al ser un checkpoint de política entrenada con recompensas, está pensado para ejecutarse dentro de un bucle de interacción con un simulador o entorno.
- Servicio como endpoint de inferencia: compatible con SGLang y vLLM según el autor, lo que permite usarlo como generador dentro de pipelines de RL.
- No hay evidencia publicada de soporte de tool calling, function calling, modo "thinking", audio, ni de un conjunto de idiomas verificado para este checkpoint concreto. Estas capacidades podrían existir por herencia del modelo base, pero no están documentadas en la información disponible.

## Casos de uso

- Investigación en percepción activa: usar el checkpoint como política de planificación de vistas sobre escenas de ScanNet para estudiar cómo un VLM decide qué observar a continuación, comparando curvas de recompensa y tasas de éxito frente a otros checkpoints de la misma serie.
- Reproducción de experimentos de RL multimodal: al estar documentados la época, el número de pasos y la composición de prompts, sirve como referencia para replicar el pipeline GraphRL y aislar el efecto de cada componente del entrenamiento.
- Generación de rollouts para entrenamiento: servido con SGLang o vLLM, puede producir trayectorias de planificación que se usen como datos de partida en ciclos posteriores de SFT o RL, aprovechando la infraestructura de inferencia de alto rendimiento.
- Punto de partida para nuevos ajustes: es un candidato razonable para continuar el entrenamiento (época 3 u otro ciclo de GRPO) partiendo de una política que ya ha sido expuesta a la tarea, en lugar de arrancar desde el modelo base.
- Estudio de casos "near miss" en interiores: dado el nombre del checkpoint, encaja en experimentos que analizan situaciones límite en las que el agente casi acierta la vista correcta, útil para diagnóstico de políticas y análisis de errores.
- Evaluación de robustez de VLM en entornos 3D: permite medir hasta qué punto un modelo de 8B entrenado con RL mantiene coherencia espacial en decisiones secuenciales dentro de una escena.
- Docencia y práctica de RL con recompensas: como artefacto pequeño (8,77B) y con licencia Apache 2.0, sirve para ilustrar el ciclo completo de SFT más GRPO en un caso real, incluyendo sus resultados pobres y las razones técnicas detrás.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MMMU, etc.) en la información disponible. El único dato de rendimiento reportado por el autor es interno al entrenamiento:

| Metrica | Valor | Contexto |
|---|---|---|
| pass@8 (in-trainer) | 2,67 % | Medido durante el entrenamiento de GRPO, época 2, paso 71 |
| Pasos de entrenamiento | 71 | Época 2 de GRPO |
| Mezcla de prompts | 10/80/10 | Etapa "medium" |
| Datos de entrenamiento | D0, mitad de train | Subconjunto de ScanNet usado en el pipeline ViewAgent |

No hay comparación publicada con otros checkpoints de la misma serie ni con el modelo base en la misma tarea, por lo que no es posible determinar la ganancia real obtenida con el RL a partir de la información disponible.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 17,5 GB solo para los pesos (8.767 M de parámetros a 2 bytes), más caché KV y activaciones del encoder visual. En la práctica, entre 20 y 24 GB para contextos moderados.
- VRAM si el repositorio está realmente en FP32: unos 35 GB de pesos, coherentes con el tamaño de 35,1 GB del repositorio; requeriría GPUs de 40 GB o superior, o cuantización previa.
- VRAM en 4 bits: alrededor de 5,5 GB de pesos, lo que lo hace viable en GPUs de 8 a 12 GB, con pérdida de calidad no cuantificada.
- GPU recomendadas: A100 40 GB u 80 GB y H100 80 GB para servicio en BF16 con paralelismo; RTX 4090 o RTX 3090 (24 GB) para inferencia en BF16 con contexto limitado.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en BF16; en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) requiere cuantización; en 8-12 GB solo en 4 bits.
- Opciones de despliegue: el autor indica SGLang y vLLM. El uso con llama.cpp u Ollama exigiría generar previamente una conversión a GGUF, que no está publicada.
- Memoria multigpu: para servir en BF16 con contextos largos y varios usuarios concurrentes es recomendable tensor parallelism en 2 GPUs de 24 GB.
- Latencia y throughput: no disponible, no se han publicado medidas.

## Comparativa con modelos similares

La comparación directa es limitada porque este checkpoint es un artefacto de investigación especializado y sin benchmarks públicos en tareas generales.

| Modelo | Parametros | Contexto | Licencia | Enfoque y disponibilidad |
|---|---|---|---|---|
| viewagent_scene_near_miss_epoch_2_final | 8,77 mil millones | No disponible (base: 256K) | Apache 2.0 | Política de planificación de vistas entrenada con GRPO sobre ScanNet; 0 descargas, sin cuantizaciones |
| Qwen3-VL-8B-Instruct (modelo base) | ~8 mil millones | 256K tokens según documentación de Qwen | Apache 2.0 | VLM generalista con evaluación publicada por el fabricante; disponible en HuggingFace |
| Qwen2.5-VL-7B-Instruct | ~7 mil millones | 128K tokens según documentación de Qwen | Apache 2.0 | VLM generalista de la generación anterior; ampliamente desplegado |
| InternVL3-8B | ~8 mil millones | No disponible en esta ficha | No disponible en esta ficha | VLM generalista alternativo de tamaño comparable; requiere consultar su model card para verificar licencia y contexto |

En términos prácticos, este checkpoint no compite con los anteriores en tareas generales de visión-lenguaje: su valor está en la tarea concreta de planificación de vistas y en su papel como material reproducible de investigación.

## Limitaciones y advertencias

- Rendimiento muy bajo en la tarea objetivo: el propio autor reporta un `pass@8` de 2,67 % dentro del entrenador, lo que desaconseja su uso en cualquier flujo productivo sin una reevaluación externa.
- Ausencia total de evaluación independiente: no hay benchmarks estándar, ni comparación con el modelo base en la misma tarea, ni métricas reproducibles fuera del entorno de entrenamiento.
- Riesgo de alucinación: al ser un VLM de 8B, mantiene la propensión del modelo base a generar descripciones o planes plausibles pero incorrectos, especialmente en escenas ambiguas.
- Especialización estrecha: está ajustado sobre escenas de interior de ScanNet y una tarea concreta; su comportamiento fuera de ese dominio no está caracterizado.
- Idiomas: no se documenta qué idiomas mantiene tras el ajuste con RL, y el ajuste sobre un dataset específico puede haber degradado capacidades multilingües del modelo base.
- Contexto: la longitud de contexto efectiva tras el ajuste no está verificada, aunque el modelo base declare 256K tokens.
- Formato de pesos: solo safetensors; no hay GGUF ni cuantizaciones oficiales, lo que complica el despliegue en hardware de consumo sin trabajo adicional de conversión.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo deriva a su vez de Qwen3-VL-8B-Instruct, también Apache 2.0, por lo que conviene verificar las condiciones del dataset ScanNet, cuyos términos de uso son independientes de la licencia del modelo.
- Reproducibilidad: el repositorio no incluye datos de entrenamiento, scripts ni configuración de GRPO; solo el checkpoint y una model card breve.
- Inexistencia de comunidad: 0 descargas y 0 "likes" implican que no hay informes de terceros sobre su comportamiento real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JamesK2W/viewagent_scene_near_miss_epoch_2_final
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- SGLang (servidor de inferencia indicado por el autor): https://github.com/sgl-project/sglang
- vLLM (servidor de inferencia indicado por el autor): https://github.com/vllm-project/vllm
- Dataset ScanNet (mencionado en la model card): http://www.scan-net.org/
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos asociados a este checkpoint. Los resultados devueltos por la búsqueda no guardan relación con el modelo y se han descartado.

# AnirbanSaha/qwen2.5-7b-tlink-sentence-only-autoregressive

## Resumen

El modelo AnirbanSaha/qwen2.5-7b-tlink-sentence-only-autoregressive es un ajuste fino de parámetros completos (full-parameter fine-tuning) del modelo Qwen/Qwen2.5-7B-Instruct, desarrollado por el usuario AnirbanSaha. Su propósito no es la generación de texto generalista, sino una tarea concreta de procesamiento de lenguaje natural: la clasificación de relaciones temporales entre eventos (TLINK, temporal link) a nivel de oración. El modelo clasifica cada par de eventos en una de cuatro etiquetas: BEFORE, AFTER, OTHER o NONE.

Con 7.615.616.512 parámetros y un peso de repositorio de 15,2 GB, se distribuye como un transformer decoder-only de tipo generativo en formato safetensors bajo licencia Apache 2.0. Aunque el modelo base es conversacional e instruido, este ajuste lo especializa en una salida estructurada de clasificación temporal, con una precisión reportada de 0,8021 y un Macro-F1 de 0,8001 sobre un conjunto de test de 192 ejemplos.

Es relevante para investigadores que trabajan en extracción de información temporal, construcción de líneas de tiempo y razonamiento sobre eventos, ya que ofrece una aproximación generativa autoregresiva a un problema clásico de clasificación, sin generar salidas inválidas en la evaluación publicada (0 de 192). No obstante, el modelo tiene 0 descargas y 0 likes, por lo que carece de validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo generativo, familia Qwen2 (derivada del modelo base Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7.615.616.512 parámetros distribuido en safetensors. Sobre esta base se ha aplicado un ajuste fino de parámetros completos (full-parameter fine-tuning), tal y como se indica en la model card del autor, orientado a la clasificación de relaciones temporales TLINK a nivel de oración. El resultado es un modelo autoregresivo que emite una de las cuatro etiquetas del espacio de salida: BEFORE, AFTER, OTHER o NONE.

El entrenamiento se realizó sobre el dataset AnirbanSaha/tlink-classification-sentence-only, también publicado por el mismo autor. La model card no especifica el número de tokens de entrenamiento, la composición detallada del conjunto, la existencia de fases de RLHF o DPO, hiperparámetros de optimización ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal, por lo que todos estos datos se consideran no disponibles.

## Capacidades

- Clasificación de relaciones temporales entre pares de eventos en una oración, con cuatro etiquetas de salida: BEFORE, AFTER, OTHER y NONE.
- Generación de texto autoregresiva heredada del modelo base Qwen2.5-7B-Instruct.
- Formato conversacional e instruido, ya que el punto de partida es un modelo Instruct.
- Salidas estructuradas de clasificación: la evaluación reporta 0 salidas inválidas sobre 192 ejemplos, lo que sugiere un control fiable del formato de respuesta en la tarea objetivo.
- Soporte de tool calling, function calling, razonamiento multi-paso o agentes: no disponible específicamente para este ajuste (eran capacidades del modelo base, pero no se documentan en esta ficha).
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no aplica (modelo de solo texto).

## Casos de uso

- Extracción de líneas de tiempo en noticias: el modelo puede clasificar la relación temporal (antes/después) entre pares de eventos de una misma oración, lo que permite ordenar cronológicamente los hechos narrados en un texto periodístico.
- Anotación de corpus temporales: útil como asistente de preanotación para investigadores que construyen datasets TLINK, reduciendo el esfuerzo manual antes de la revisión humana.
- Procesamiento de narrativas clínicas: en historiales médicos, la relación temporal entre síntomas, diagnósticos y tratamientos es crítica; el modelo puede clasificar estas relaciones a nivel de frase para construir cronologías de paciente.
- Análisis de eventos en dominios legales: ordenación temporal de cláusulas, acciones y condiciones en contratos o expedientes, donde la etiqueta OTHER permite marcar relaciones no estrictamente de orden.
- Razonamiento temporal en sistemas de question answering: integrado como componente que determina el orden relativo entre eventos antes de responder preguntas del tipo «¿qué ocurrió primero?».
- Filtrado y enriquecimiento de datos para entrenamiento: uso del modelo para etiquetar automáticamente grandes volúmenes de pares de eventos y generar corpus temporales a escala.
- Investigación en razonamiento temporal: como baseline generativo frente a clasificadores discriminativos tradicionales en tareas de extracción de relaciones.

## Benchmarks y rendimiento

Resultados de test publicados en la model card del autor (conjunto de 192 ejemplos):

| Metrica | Valor |
|---|---:|
| Accuracy | 0.8021 |
| Macro-F1 | 0.8001 |
| Weighted-F1 | 0.8022 |
| Salidas invalidas | 0/192 |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos similares en esta misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión fp16/bf16, los pesos ocupan aproximadamente 15,2 GB, por lo que se necesitan del orden de 18-20 GB de VRAM contando caché KV y activaciones. En cuantización int8 se reduciría a unos 8 GB y en int4 a unos 5 GB, aunque el repositorio no distribuye pesos cuantizados.
- GPU recomendadas: A100 (40 GB o 80 GB), H100, L40S o A6000 para fp16 con margen. Una RTX 4090 (24 GB) puede alojar el modelo en fp16 de forma ajustada, y con más holgura si se cuantiza.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 24 GB o más en fp16, y en tarjetas de 8-12 GB si se aplica cuantización (requiere conversión manual, ya que no se publican GGUF).
- Opciones de despliegue: transformers y text-generation-inference (el repositorio incluye los tags text-generation-inference y endpoints_compatible). También es compatible con vLLM. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión que no se proporciona en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnirbanSaha/qwen2.5-7b-tlink-sentence-only-autoregressive | 7.615.616.512 | no disponible | Clasificacion TLINK (BEFORE/AFTER/OTHER/NONE) | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct (modelo base) | 7.615.616.512 | no disponible en esta ficha | Generacion de texto general e instrucciones | apache-2.0 | HuggingFace, ampliamente utilizado |

No se dispone de datos sobre otros ajustes finos comparables de clasificación TLINK en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento con alternativas de la misma tarea.

## Limitaciones y advertencias

- Modelo especializado y de alcance estrecho: su rendimiento está validado únicamente en la tarea de clasificación TLINK a nivel de oración; no debe emplearse como modelo conversacional general sin verificar su comportamiento.
- Evaluación limitada: los resultados se calculan sobre 192 ejemplos, un conjunto de test pequeño que puede no representar la variabilidad de dominios reales.
- Sin validación de la comunidad: el modelo registra 0 descargas y 0 likes, por lo que carece de uso y verificación independientes.
- Riesgo de alucinación: al ser un modelo generativo, puede producir etiquetas o texto fuera del espacio esperado en entradas atípicas, aunque la evaluación publicada reporta 0 salidas inválidas.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados en la informacion proporcionada.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, siempre que se conserven los avisos de copyright y licencia correspondientes y se cumplan las condiciones del modelo base Qwen2.5-7B-Instruct.
- Caveat de producción: no se documentan hiperparámetros de entrenamiento, composición del dataset ni proceso de evaluación, lo que dificulta reproducir los resultados o auditar el ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnirbanSaha/qwen2.5-7b-tlink-sentence-only-autoregressive
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/AnirbanSaha/tlink-classification-sentence-only

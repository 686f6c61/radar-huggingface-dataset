# EugeneEvstafev/cevra-math-decisions-v2

## Resumen

Cevra Math Decisions v2 es un ajuste fino (finetune) del modelo multimodal Qwen/Qwen3.5-4B, desarrollado por EugeneEvstafev, orientado a una tarea muy concreta: puntuar categorías de materia (subject categories) para problemas matemáticos. No es un modelo generativo de propósito general, sino un modelo de decisión (decision model) que, dado un enunciado y un conjunto de etiquetas candidatas, devuelve una distribución de probabilidad sobre esas etiquetas. Emplea la arquitectura del modelo base Qwen3.5-4B, con aproximadamente 4.660 millones de parámetros y soporte de entrada imagen-texto según el pipeline declarado (image-text-to-text).

El modelo se entrenó con el modo Tinker Decision Model mediante un adaptador LoRA de rango 16 y un objetivo de etiquetas suaves (soft-label), sobre 3.622 ejemplos de entrenamiento derivados de variantes sintéticas de MATH-500. El resultado es un modelo fusionado (merged) que, según las métricas del autor, mejora sustancialmente la concordancia de argmax frente al modelo base de Hugging Face: 69,87 % frente a 57,64 % en el conjunto de test retenido de 458 ejemplos.

Su relevancia es acotada pero clara: demuestra un patrón de uso de modelos pequeños (4B) como clasificadores/scorers especializados dentro de pipelines de razonamiento matemático, en lugar de emplearlos como generadores. La licencia Apache 2.0 y el formato safetensors facilitan su integración en infraestructura existente, aunque el alcance de la tarea está estrictamente limitado a decisiones de tipo `choice`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), base Qwen/Qwen3.5-4B; ajuste fino con LoRA fusionado |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrenamiento con longitud máxima de secuencia 2.048) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal con capacidad de entrada imagen-texto (pipeline `image-text-to-text`), y se ajusta mediante un adaptador LoRA de rango 16 que posteriormente se fusiona con los pesos base. El entrenamiento se realizó en modo Tinker Decision Model con un objetivo de etiquetas suaves: en lugar de predecir una clase dura, el modelo aprende a reproducir distribuciones de probabilidad objetivo sobre un conjunto de etiquetas ofrecidas en el prompt. Los hiperparámetros declarados son batch size 16, learning rate 0,0001, longitud máxima de secuencia 2.048 y 227 pasos en una sola época, con selección del checkpoint final mediante validación.

Los datos proceden de una instantánea privada (revisión 459, particiones agrupadas con semilla 42) de variantes sintéticas derivadas de MATH-500: 3.622 ejemplos de entrenamiento, 458 de validación y 458 de test retenido. El proveedor no reveló la revisión base usada durante el entrenamiento; la revisión de Hugging Face empleada para la fusión está fijada en `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`. El autor advierte que las comparaciones entre el modelo fusionado y el sampler de Tinker muestran una concordancia aproximada, no pesos idénticos. La evaluación original en GPU no superó el umbral preespecificado de diferencia de 0,05 y se reevaluó a posteriori con un umbral de 0,1 aceptado por el usuario, sin volver a ejecutar en GPU; el fallo original se conserva documentado.

## Capacidades

- Puntuación de decisiones de tipo `choice`: dado un estado (enunciado del problema), unas instrucciones y un conjunto de criterios con etiquetas, devuelve una distribución de probabilidad normalizada sobre las etiquetas ofrecidas.
- Clasificación de materia matemática: el caso de uso entrenado es asignar categorías de materia (por ejemplo, álgebra, geometría, teoría de números) a problemas matemáticos.
- Extracción de logits de decisión: el procedimiento de inferencia selecciona los logits del siguiente token correspondientes a las etiquetas y los normaliza con softmax; no se basa en generación de texto libre.
- Soporte multimodal heredado del modelo base: el pipeline declarado es image-text-to-text, aunque la model card no documenta evaluación específica con imágenes.
- Multilingüe: limitado a inglés según la etiqueta de idioma del repositorio.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está diseñado para una única decisión puntual.
- Modo thinking, visión o audio: no disponible como capacidad documentada más allá del pipeline multimodal heredado.

## Casos de uso

- Enrutado de problemas matemáticos en pipelines de razonamiento: usar el modelo como clasificador previo que asigne cada problema a la materia correspondiente y derive la consulta al solver o prompt especializado adecuado, aprovechando su salida de distribución de probabilidad sobre etiquetas.
- Filtrado y etiquetado de datasets matemáticos: clasificar grandes volúmenes de problemas por categoría temática antes de construir conjuntos de entrenamiento o evaluación, con la ventaja de obtener probabilidades calibradas de forma relativa sobre las etiquetas ofrecidas.
- Selección de estrategia de resolución: dado un enunciado, puntuar etiquetas del tipo "resoluble por álgebra", "requiere cálculo numérico" o "problema geométrico" para que un orquestador elija la herramienta o el prompt de resolución.
- Control de calidad en sistemas de tutoría matemática: clasificar problemas introducidos por estudiantes para adaptar el material didáctico o la pista ofrecida, usando la distribución de probabilidad para detectar casos ambiguos (alta entropía) y derivarlos a revisión humana.
- Investigación sobre modelos de decisión con etiquetas suaves: servir como referencia reproducible de ajuste fino LoRA con objetivo soft-label sobre un modelo de 4B, útil para estudiar la diferencia entre clasificación generativa y puntuación por logits.
- Evaluación comparativa de bases multimodales: emplear el par base/merged como caso de estudio de cuánto mejora un ajuste fino pequeño en una tarea de clasificación acotada, con métricas de Brier y MAE documentadas.
- Despliegue en infraestructura modesta: al tratarse de un modelo de 4B en safetensors, puede integrarse en servicios de inferencia existentes basados en Transformers para tareas de scoring de baja latencia, sin necesidad de generación autoregresiva completa.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 458 ejemplos de test retenido derivados de MATH-500 (métricas de concordancia con las distribuciones objetivo, no precisión ni calibración independiente):

| Métrica | Base HF | Modelo fusionado | Sampler Tinker |
|---|---:|---:|---:|
| Concordancia de argmax (mayor es mejor) | 57,6419 % | 69,8690 % | 69,4323 % |
| Brier de distribución (menor es mejor) | 0,169736 | 0,059772 | 0,058251 |
| MAE de probabilidad (menor es mejor) | 0,076854 | 0,042011 | 0,041392 |

Diagnósticos adicionales declarados: en los 10 primeros ejemplos de test, el argmax del modelo fusionado coincidió con el sampler entrenado de Tinker en 10/10, con diferencia absoluta máxima de probabilidad de 0,0540073; en 10 sondas sintéticas inventadas, el argmax del base de Hugging Face y el base de Tinker coincidieron en 9/10, con diferencia máxima de 0,0491300. El autor subraya que estas muestras son pequeñas y que los modelos base no deben asumirse idénticos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4.659.865.088 parámetros, en bfloat16 se requieren aproximadamente 9,3 GB solo para pesos, más memoria para activaciones y caché; el tamaño del repositorio es de 9,3 GB.
- GPU recomendadas: no especificadas por el autor. El ejemplo de uso emplea `device="cuda:0"` con `dtype=torch.bfloat16` y `device_map={"": device}`.
- GPU de consumo: por el tamaño de pesos en bfloat16, encaja en tarjetas con 16 GB o más de VRAM (por ejemplo, RTX 4090, RTX 4080, A100 40 GB, H100); en GPUs con menos VRAM sería necesaria cuantización, no documentada en la información disponible.
- Opciones de despliegue: Transformers con `AutoModelForImageTextToText` y `AutoTokenizer`; el flujo de decisión requiere `tinker_cookbook` (renderers y `DecisionRenderer`). No se documentan opciones de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El procedimiento de scoring evalúa únicamente el siguiente token sobre las etiquetas ofrecidas (`use_cache=False`), lo que en principio es más ligero que una generación completa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cevra Math Decisions v2 | 4.659.865.088 | no disponible | Scoring de decisiones `choice` sobre problemas matemáticos | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Modelo multimodal generativo general | no disponible en la información | Hugging Face |
| Cevra GPT-OSS-20B (ejecución previa del mismo autor) | no disponible | no disponible | Misma tarea de decisión, distinto base | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otros clasificadores matemáticos especializados en la información proporcionada; la comparación principal documentada es contra el propio modelo base, con una mejora de concordancia de argmax de 57,64 % a 69,87 % y una reducción del Brier de 0,169736 a 0,059772.

## Limitaciones y advertencias

- Las métricas son de concordancia con distribuciones objetivo sintéticas o ajustadas, no precisión ni calibración establecidas de forma independiente; las puntuaciones no se conocen como probabilidades calibradas.
- Las variantes generadas pueden contener errores matemáticos, y el conjunto de test deriva de MATH-500, por lo que no constituye un benchmark independiente de MATH-500.
- El modelo solo fue entrenado con ejemplos de tipo `choice`; el autor no formula ninguna afirmación de rendimiento para otros tipos de decisión.
- El procedimiento correcto de inferencia exige seleccionar los logits de las etiquetas y normalizarlos; generar JSON con el modelo no es equivalente y no produce la distribución esperada.
- La evaluación original en GPU no superó el umbral preespecificado de 0,05; la reevaluación con umbral 0,1 fue post-hoc y sin reejecución, lo que limita la fuerza de la evidencia de equivalencia.
- La revisión base usada en el entrenamiento no fue revelada y la comparación entre bases muestra discrepancias (9/10 en sondas sintéticas), por lo que no debe asumirse identidad de pesos.
- Idioma limitado a inglés; no hay soporte documentado de otros idiomas.
- No se documentan sesgos específicos, pero al derivar de MATH-500 y de datos sintéticos puede heredar los sesgos de composición de esa fuente.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la calibración de las probabilidades.
- El flujo de inferencia depende de `tinker_cookbook`, lo que añade una dependencia externa al despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EugeneEvstafev/cevra-math-decisions-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de origen citado: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Repositorio de Tinker Cookbook (dependencia de inferencia, mencionada en la model card): no se proporciona URL en la información disponible
- Paper, blog o demo adicionales: no disponibles en la información proporcionada

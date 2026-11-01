# arpjw/Qwen3-4B-Adaptive-Reward-Coding

## Resumen

Qwen3-4B-Adaptive-Reward-Coding es un adaptador LoRA de rango 8 publicado por el usuario arpjw sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No se trata de un modelo completo, sino de un artefacto de investigación derivado de un experimento de aprendizaje por refuerzo (RL) sobre una tarea sintética de reparación de expresiones Python. El adaptador modifica únicamente las proyecciones q/k/v/o de la atención y se distribuye en formato PEFT/safetensors, sin incluir los pesos del modelo base.

El interés del artefacto es metodológico más que de rendimiento: el autor documenta un experimento controlado con dos brazos (recompensa fija frente a recompensa adaptativa con penalización de coste en tokens) y publica un resultado negativo explícito. En la evaluación de desarrollo, ambos brazos entrenados produjeron exactamente las mismas secuencias de tokens muestreadas y la misma precisión (32/32), por lo que no se observó ventaja medible del mecanismo adaptativo. La reducción descriptiva de longitud de razonamiento fue del 1,39 % respecto al modelo base, un dato que el propio autor califica de no concluyente.

Por tanto, esta ficha describe un adaptador de investigación de 4B parámetros en el modelo base, con licencia Apache 2.0, orientado a reproducir un protocolo concreto de RL con decodificador restringido y scorer, y no a generación de texto genérica ni a mejora de código a nivel de repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Qwen3-4B-Instruct-2507); modifica proyecciones q/k/v/o |
| Parametros totales | No disponible (adaptador LoRA de rango 8; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); los pesos del modelo base no se incluyen |
| Rango LoRA / alpha / dropout | 8 / 16 / 0.0 |
| Revision del modelo base | cdbee75f17c01a7cc42f958dc650907174af0554 |
| SHA-256 del adaptador | 499b1d205c1475b59d7e47d715a85ff4c899ead05c097850a0702ce611170635 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder de 4B parámetros, mediante PEFT. El LoRA tiene rango 8, alpha 16 y dropout cero, y actúa sobre las proyecciones de query, key, value y output de la atención. El entrenamiento se realizó en FP32 con TF32 desactivado, optimizador AdamW con tasa de aprendizaje 1e-5, cuatro trayectorias nuevas por actualización, estimador REINFORCE con leave-one-out y sin penalización KL. La ejecución fue de 16 pasos y una sola semilla.

La tarea de entrenamiento consiste en elegir entre cuatro reparaciones candidatas para expresiones Python sintéticas. Un scorer restringido evalúa la expresión seleccionada sobre entradas ocultas; el sistema no ejecuta el código generado. El brazo adaptativo incorpora un controlador con alpha=0.5 que ajusta una penalización por coste en tokens de razonamiento; según el autor, dicha penalización varió menos del 0,4 % durante la ejecución. La innovación destacable es el diseño del experimento y su auditoría, no una mejora técnica del modelo: el resultado publicado es que el brazo adaptativo no superó al fijo.

## Capacidades

- Generación de texto heredada del modelo base Qwen3-4B-Instruct-2507, fuera del marco medido del experimento.
- Selección de reparaciones entre cuatro candidatas para expresiones Python sintéticas, dentro del protocolo del autor.
- Razonamiento en modo reasoning, evaluado con decodificador restringido y scorer sobre entradas ocultas.
- No se documenta soporte de tool calling ni function calling específico del adaptador.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del protocolo de reparación.
- Capacidades multilingües no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni thinking mode adicionales.

## Casos de uso

- Reproducción de experimentos de RL: cargar el modelo base en la revisión exacta y adjuntar el adaptador con PEFT para replicar el protocolo de recompensa fija frente a adaptativa y verificar el resultado nulo publicado.
- Investigación sobre reward shaping: usar el adaptador como brazo adaptativo de referencia en estudios comparativos sobre penalizaciones de coste en tokens.
- Auditoría de artefactos de RL: verificar el SHA-256 del adaptador y contrastar los pesos finales con las secuencias de tokens documentadas en el informe de resultados.
- Estudio de decodificación restringida: emplear el prompt, el decodificador restringido y el scorer del repositorio fuente para analizar cómo la restricción condiciona la selección de reparaciones.
- Docencia sobre resultados negativos: ilustrar en un curso o seminario por qué dos políticas con pesos distintos pueden producir secuencias idénticas en una evaluación de desarrollo pequeña.
- Análisis de metodología de evaluación: examinar las limitaciones de una evaluación con 16 tareas, una semilla y dos muestras por tarea y modo, sin inferencia sobre un conjunto de test intacto.

## Benchmarks y rendimiento

| Metrica | Base | Brazo fijo | Brazo adaptativo |
|---|---|---|---|
| Precisión en modo reasoning (16 tareas, 2 muestras) | 32/32 | 32/32 | 32/32 |
| Longitud media de razonamiento (tokens) | 746,03 | 735,66 | 735,66 |
| Diferencia fijo frente a adaptativo (precisión y coste) | No aplica | 0 | 0 |

Estos datos corresponden a tareas de desarrollo seleccionadas, una semilla y una ejecución de 16 pasos. No se realizó inferencia sobre un conjunto de test final intacto. El autor indica explícitamente que el resultado no establece beneficio del mecanismo adaptativo, ahorro general de tokens ni mejora de código a nivel de repositorio. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador; depende del modelo base Qwen3-4B-Instruct-2507. Un modelo de 4B en FP16 requiere del orden de 8 GB solo para pesos, más overhead de contexto y activaciones.
- GPU recomendadas: no especificadas por el autor; el entrenamiento se realizó en FP32 con TF32 desactivado, lo que implica mayor consumo de memoria que FP16/BF16.
- GPU de consumo: no confirmado en la información proporcionada; un modelo de 4B cuantizado suele caber en GPUs de consumo con suficiente VRAM, pero no hay datos del autor al respecto.
- Despliegue: carga mediante PEFT sobre el modelo base en la revisión exacta; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Adaptive-Reward-Coding (este) | Adaptador LoRA sobre 4B | No disponible | RL con recompensa adaptativa en reparación de código sintético | Apache 2.0 | HuggingFace (16 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | No disponible en la informacion proporcionada | Modelo instructivo generalista | Apache 2.0 | HuggingFace |
| Alternativas de reparación de código | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparables con otros adaptadores o modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Resultado negativo: el experimento no encontró ventaja medible del mecanismo de recompensa adaptativa; los brazos fijo y adaptativo produjeron secuencias idénticas.
- Evaluación muy reducida: 16 tareas de desarrollo, una semilla, 16 pasos de entrenamiento y dos muestras por tarea y modo.
- Sin test final: no se realizó inferencia sobre un conjunto de test intacto, por lo que no hay estimación de generalización.
- Fuera de dominio: la generación de texto genérica queda explícitamente fuera del marco medido; el adaptador está pensado para el protocolo del autor.
- Dependencia del decodificador restringido y del scorer: reproducir la evaluación exige el prompt, el decodificador y el scorer del repositorio fuente.
- El scorer no ejecuta código generado; no hay evidencia de mejora en reparación de código real a nivel de repositorio.
- Sesgos conocidos: no documentados en la información proporcionada.
- Riesgo de alucinación: no evaluado en este artefacto; aplican los riesgos del modelo base.
- Licencia Apache 2.0 tanto para el adaptador como para el modelo base; los pesos del base no se incluyen en el repositorio.
- Artefacto de investigación con 16 descargas y 0 likes: no apto para producción sin validación adicional.

## Enlaces

- [HuggingFace: arpjw/Qwen3-4B-Adaptive-Reward-Coding](https://huggingface.co/arpjw/Qwen3-4B-Adaptive-Reward-Coding)
- [Repositorio fuente del experimento](https://github.com/arpjw/reward-function)
- [Informe completo de resultados](https://github.com/arpjw/reward-function/blob/main/docs/CAPABILITY_CUDA_RESULTS.md)
- [Modelo base: Qwen/Qwen3-4B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507)

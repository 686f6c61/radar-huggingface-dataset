# bishoygaloaa/phillm-qwen3.5-2b-probeguided

## Resumen

PhiLLM LoRA — Qwen3.5-2B es un adaptador LoRA (PEFT) publicado por el usuario bishoygaloaa sobre el modelo base Qwen/Qwen3.5-2B. No se trata de un modelo entrenado desde cero, sino de un ajuste fino orientado a una tarea muy concreta: la predicción del siguiente estado en sistemas newtonianos (niveles T1–T3) dentro del conjunto de datos de entrenamiento del proyecto PhiLLM. El adaptador se distribuye con licencia MIT y está pensado para su uso combinado con el modelo base mediante la librería PEFT.

El interés de esta ficha es acotado: el adaptador no está diseñado como un modelo de propósito general, sino como un artefacto de investigación para evaluar la capacidad de un LLM de 2 mil millones de parámetros de razonar sobre dinámica física clásica. La model card es extremadamente escueta y no aporta información sobre composición del dataset, hiperparámetros de entrenamiento, número de tokens vistos ni resultados de evaluación.

La relevancia actual es limitada por su naturaleza experimental y por el escaso soporte documental. No obstante, resulta útil como referencia para quienes trabajen en la intersección de modelos de lenguaje y razonamiento físico, o para quienes quieran reproducir el pipeline del repositorio Phil. Cualquier dato no indicado explícitamente en la información disponible se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Qwen3.5-2B) |
| Parametros totales | No disponible (el adaptador LoRA no declara su recuento; el modelo base tiene 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Pesos PEFT (adaptador LoRA); el modelo base se distribuye aparte en safetensors |

## Arquitectura y entrenamiento

El adaptador se implementa como LoRA sobre Qwen/Qwen3.5-2B, un transformer decoder-only de aproximadamente 2 mil millones de parámetros. El ajuste se realiza mediante PEFT, lo que implica que solo se entrenan las matrices de bajo rango inyectadas en las capas del modelo base, mientras que los pesos originales permanecen congelados. No se especifican el rango, el alpha, las capas objetivo ni la tasa de aprendizaje empleada.

El entrenamiento se realizó sobre el split de entrenamiento del dataset PhiLLM (bishoygaloaa/phillm-data) para la tarea de predicción del siguiente estado newtoniano en los niveles T1–T3. La model card indica que el checkpoint se seleccionó únicamente sobre el split de desarrollo in-distribution (ID dev), lo que sugiere una evaluación controlada para evitar fuga de datos. No se detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o supervisión adicional. Tampoco se documentan innovaciones técnicas más allá del propio ajuste LoRA.

## Capacidades

- Predicción del siguiente estado en sistemas físicos newtonianos (tarea principal del adaptador, niveles T1–T3).
- Razonamiento sobre dinámica clásica dentro del dominio del dataset PhiLLM.
- Generación de texto y razonamiento general heredados del modelo base Qwen3.5-2B (no verificados en este adaptador).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Evaluación de razonamiento físico en LLMs pequeños: el adaptador permite medir hasta qué punto un modelo de 2B puede aprender a predecir estados siguientes en sistemas newtonianos, usando el script `python -m phil.eval.eval` del repositorio.
- Reproducción de experimentos del proyecto Phil: sirve como checkpoint de referencia para replicar los resultados del pipeline de entrenamiento y evaluación publicado en GitHub.
- Investigación en ajuste fino eficiente: al ser un adaptador LoRA sobre un modelo de 2B, es un caso práctico para estudiar el impacto del rango y las capas objetivo en tareas de razonamiento físico.
- Benchmarking de adaptadores PEFT: puede emplearse como baseline en comparativas de adaptadores LoRA sobre Qwen3.5-2B para dominios científicos.
- Docencia y divulgación: útil para ilustrar cómo se especializa un LLM pequeño en un dominio acotado mediante LoRA, con un coste de entrenamiento reducido.
- Desarrollo de tutores o asistentes de física clásica: el adaptador podría integrarse en prototipos que resuelvan problemas de mecánica newtoniana, siempre que se valide su precisión fuera del split de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al combinar el adaptador con Qwen3.5-2B, se estima un consumo en torno a 4–5 GB en FP16 y 2–3 GB en cuantización de 4 bits, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponibles; por el tamaño del modelo base, cabría esperar GPUs consumer como RTX 3060, RTX 4060 o superiores.
- ¿Cabe en GPU consumer? Probablemente sí, dado el tamaño del modelo base (2B), pero no confirmado.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base), y potencialmente vLLM, llama.cpp u Ollama si se fusionan los pesos, aunque no se documenta compatibilidad.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhiLLM LoRA — Qwen3.5-2B | Adaptador sobre 2B | No disponible | Predicción de estados newtonianos | MIT | Hugging Face (adaptador PEFT) |
| Qwen3.5-2B (base) | 2B | No disponible | Propósito general | No disponible | Hugging Face |
| Otros adaptadores LoRA científicos | No disponible | No disponible | Dominio específico | Variable | Hugging Face |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset específico de física newtoniana, el adaptador puede sobreajustarse a la distribución de dicho dataset.
- Riesgo de alucinación: alto fuera del dominio de predicción de estados newtonianos; no se han publicado evaluaciones de robustez.
- Limitaciones de contexto o idioma: no se declaran idiomas soportados ni longitud de contexto, lo que impide garantizar un comportamiento multilingüe o de contexto largo.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el modelo base Qwen3.5-2B puede tener sus propias condiciones que deben respetarse.
- Caveats para producción: la model card es mínima, no hay benchmarks publicados y el checkpoint se seleccionó solo sobre el split ID dev; no se recomienda su uso en producción sin una validación independiente.
- El adaptador no incluye los pesos del modelo base; es necesario descargar Qwen/Qwen3.5-2B por separado.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/bishoygaloaa/phillm-qwen3.5-2b-probeguided
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset: https://huggingface.co/datasets/bishoygaloaa/phillm-data
- Repositorio de código: https://github.com/bishoymoussa/Phil

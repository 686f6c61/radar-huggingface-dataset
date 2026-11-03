# bishoygaloaa/phillm-qwen3.5-2b-lora

## Resumen

PhiLLM LoRA — Qwen3.5-2B es un adaptador LoRA (PEFT) publicado por el usuario bishoygaloaa sobre el modelo base Qwen/Qwen3.5-2B. El adaptador está especializado en la predicción del siguiente estado en sistemas newtonianos (tareas T1–T3) dentro del conjunto de entrenamiento de PhiLLM, un proyecto de investigación orientado a evaluar el razonamiento físico de modelos de lenguaje.

El modelo no es un modelo fundacional autónomo, sino un adaptador que debe combinarse con los pesos del modelo base Qwen3.5-2B para su uso. Su relevancia radica en que ejemplifica una línea de trabajo emergente: el ajuste fino de modelos pequeños (2B parámetros) para tareas científicas específicas mediante LoRA, lo que permite un despliegue económico en entornos con recursos limitados.

La información publicada es muy escasa: la model card se limita a indicar el modelo base, el dataset de entrenamiento, el repositorio de código y el criterio de selección del checkpoint (solo sobre el split de desarrollo ID). No se publican detalles sobre hiperparámetros, número de tokens de entrenamiento, composición del dataset ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Qwen3.5-2B) |
| Parametros totales | no disponible (adaptador LoRA sobre base de 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B) |
| Tipos de cuantizacion | no disponible (el adaptador es compatible con cuantizaciones del modelo base, sin datos publicados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato estándar PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA (Low-Rank Adaptation) sobre el modelo base Qwen/Qwen3.5-2B, un transformer decoder-only de 2.000 millones de parámetros. LoRA congela los pesos originales e introduce matrices de bajo rango en determinadas capas, lo que reduce drásticamente el número de parámetros entrenables y el coste de ajuste fino.

El entrenamiento se realizó sobre el dataset bishoygaloaa/phillm-data, orientado a la predicción del siguiente estado en sistemas físicos newtonianos (tareas T1–T3 del benchmark PhiLLM). La model card indica que el checkpoint se seleccionó únicamente sobre el split de desarrollo ID, lo que sugiere una evaluación de generalización limitada a la distribución de entrenamiento. No se especifican el número de tokens de entrenamiento, la composición del dataset, el rango LoRA, la tasa de aprendizaje ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Predicción del siguiente estado en sistemas físicos newtonianos (tareas T1–T3 del benchmark PhiLLM).
- Razonamiento físico cuantitativo sobre trayectorias y estados de sistemas mecánicos.
- Generación de texto y razonamiento general heredados del modelo base Qwen3.5-2B.
- Soporte de tool calling y function calling heredado del modelo base (no verificado para el adaptador).
- Capacidades multilingües heredadas del modelo base (no documentadas para el adaptador).
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode) específicas del adaptador.

## Casos de uso

- Predicción de trayectorias en simulaciones físicas: el adaptador puede estimar el siguiente estado de un sistema newtoniano a partir del estado actual, útil para integrarse en bucles de simulación de bajo coste donde no se requiere un solver numérico completo.
- Evaluación de razonamiento físico en LLM: sirve como referencia para investigar hasta qué punto un modelo de 2B parámetros puede aprender dinámica newtoniana mediante ajuste fino con LoRA.
- Prototipado de asistentes científicos: al estar basado en un modelo de 2B parámetros, puede desplegarse en estaciones de trabajo con GPU consumer para experimentar con asistencia en problemas de mecánica clásica.
- Investigación en ajuste eficiente: el adaptador es un ejemplo reproducible de fine-tuning LoRA sobre un modelo pequeño para una tarea científica concreta, útil para estudiar transferencia y olvido catastrófico.
- Docencia y divulgación: permite demostrar en entornos educativos cómo un LLM pequeño puede especializarse en una tarea de física mediante un adaptador ligero.
- Integración en pipelines de evaluación PhiLLM: el adaptador está pensado para ejecutarse con `python -m phil.eval.eval`, por lo que encaja en flujos de evaluación comparativa de modelos sobre el benchmark PhiLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información publicada; como referencia, un modelo base de 2B parámetros en FP16 requiere aproximadamente 4–5 GB de VRAM, y en cuantización de 4 bits alrededor de 1,5–2 GB, aunque estos valores no están confirmados para este adaptador.
- GPU recomendadas: no disponible; por el tamaño del modelo base, cabría esperar compatibilidad con GPU consumer (RTX 3060, RTX 4060, RTX 4090) y GPU de datacenter (A100, H100), sin datos publicados.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del modelo base, pero no confirmado por el autor.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base), vLLM, llama.cpp, Ollama y TGI son compatibles en principio con el modelo base, pero no se documenta compatibilidad específica del adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| bishoygaloaa/phillm-qwen3.5-2b-lora | Adaptador LoRA sobre base 2B | no disponible | MIT | safetensors (PEFT) | Física newtoniana (PhiLLM T1–T3) |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | no disponible | safetensors | Propósito general |
| Otros adaptadores PhiLLM | no disponible | no disponible | no disponible | no disponible | Física newtoniana |

No se dispone de información sobre otros adaptadores PhiLLM comparables ni sobre sus resultados de evaluación, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un adaptador especializado en física newtoniana, su comportamiento fuera de ese dominio depende enteramente del modelo base.
- Riesgo de alucinación: no evaluado en la información publicada; en tareas de predicción física, los errores numéricos pueden ser difíciles de detectar sin validación contra un solver de referencia.
- Limitaciones de contexto e idioma: no documentadas; se heredan del modelo base Qwen3.5-2B.
- El checkpoint se seleccionó únicamente sobre el split de desarrollo ID, lo que puede implicar sobreajuste a la distribución de entrenamiento y generalización limitada a sistemas físicos fuera de esa distribución.
- Restricciones de licencia: licencia MIT, que permite uso comercial con atribución; sin embargo, deben respetarse las condiciones del modelo base Qwen3.5-2B, cuya licencia no se detalla en la información proporcionada.
- El adaptador no es utilizable de forma autónoma: requiere cargar el modelo base Qwen/Qwen3.5-2B junto con los pesos LoRA.
- No se publican hiperparámetros de entrenamiento ni métricas de evaluación, lo que dificulta la reproducibilidad y la comparación con otros adaptadores.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/bishoygaloaa/phillm-qwen3.5-2b-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/bishoygaloaa/phillm-data
- Repositorio de código: https://github.com/bishoymoussa/Phil
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B

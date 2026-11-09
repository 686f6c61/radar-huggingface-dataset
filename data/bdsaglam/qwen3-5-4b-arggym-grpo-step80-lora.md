# bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step80-LoRA

## Resumen

Qwen3.5-4B-ArgGYM-GRPO-step80-LoRA es un adaptador LoRA de bajo rango (rank 64, alpha 32, precisión fp32) desarrollado por el usuario bdsaglam sobre el modelo base Qwen/Qwen3.5-4B (revisión `851bf6e`). El adaptador se ha entrenado mediante aprendizaje por refuerzo con el algoritmo GRPO, usando la librería verl v0.9.1, sobre ArgGYM, un conjunto de tareas de argumentación formal basadas en teorías ASPIC+ bajo semántica grounded. El objetivo es mejorar la capacidad del modelo base para resolver problemas de argumentación computacional: ataques, defensas, contraargumentos, cadenas de afirmaciones, construcción de preferencias, consultas de estado y semántica, diagnóstico de derrotas, formalización y perturbación.

El adaptador cubre todas las proyecciones de atención, atención lineal y MLP de las 32 capas del modelo de lenguaje, lo que suma 248 módulos; la torre de visión no se modifica. Se trata del checkpoint del paso 80 de una ejecución de 100 pasos, seleccionado por obtener la mejor puntuación en el conjunto de desarrollo. No es un modelo autónomo: requiere cargar el modelo base Qwen3.5-4B y aplicar el adaptador mediante PEFT o servirlo como módulo LoRA en vLLM.

La relevancia de esta ficha radica en que documenta un caso de especialización estrecha mediante RL sobre un modelo multimodal de 4B, con resultados medibles en tareas de argumentación formal y unas limitaciones explícitas (sin resultados en test, conjunto de desarrollo reducido, respuestas muy largas). Es útil para investigadores que evalúan técnicas de RL aplicadas a dominios simbólicos y para desarrolladores que necesiten un componente de razonamiento argumentativo dentro de un pipeline mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal Qwen3.5-4B (atención + atención lineal + MLP en 32 capas) |
| Parametros totales | No disponible (adaptador LoRA rank 64 sobre base de 4B; tamaño del repo 0,5 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el entrenamiento usa un tope de 40.960 tokens de salida y la evaluación permite hasta 65.536 |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors fp32; la cuantización depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un transformer multimodal con 32 capas de lenguaje que combina atención estándar y atención lineal, además de un torre de visión que en este caso queda congelada. El LoRA tiene rango 64 y alpha 32 en fp32, y afecta a 248 módulos: todas las proyecciones de atención, atención lineal y MLP del modelo de lenguaje. El entrenamiento se realizó con GRPO mediante verl v0.9.1, con el modo thinking activado en el modelo base.

Los datos provienen de ArgGYM, un benchmark de tareas de argumentación formal (teorías ASPIC+ bajo semántica grounded) con niveles de dificultad 1 a 12. El entrenamiento muestrea de 82 celdas tarea/nivel (8.200 problemas) con un currículo que prioriza las celdas que el modelo resuelve aproximadamente la mitad de las veces. La recompensa es 1 para respuesta correcta y 0 en caso contrario; cuatro tareas (status_query, defeat_diagnosis, formalization y perturbation) añaden 0,3 × la fracción correcta de la respuesta. Una respuesta truncada en el límite de 40.960 tokens recibe recompensa 0. La optimización usa 18 problemas × 16 muestras por paso, learning rate 3e-5 con decaimiento coseno hasta 3e-6 en 100 pasos, warmup de 3 pasos y sin penalización KL. Las rollouts se muestrean con temperatura 1.0, top-p 0.95, top-k 20 y presence penalty 1.5, y el entrenador calcula sus log-probabilidades tras aplicar la misma máscara top-k/top-p y la misma presence penalty; sin esta coincidencia la entropía derivaba al alza y los entrenamientos se volvían inestables.

## Capacidades

- Razonamiento argumentativo formal: resolución de tareas de ataque, defensa, ataque/defensa, contraargumento (simple y estricto), cadenas de afirmaciones, construcción de preferencias, consultas de estado y semántica, diagnóstico de derrotas, formalización y perturbación sobre teorías ASPIC+.
- Modo thinking: el adaptador se entrena con el modo de razonamiento extendido del modelo base activado, por lo que genera cadenas de razonamiento largas antes de la respuesta final.
- Generación de texto y razonamiento general: heredadas del modelo base Qwen3.5-4B, aunque no evaluadas tras el ajuste.
- Capacidades multimodales: el modelo base incluye torre de visión, pero el adaptador no la modifica y no se ha evaluado su comportamiento multimodal tras el entrenamiento.
- Tool calling y function calling: no disponible de forma específica para el adaptador; depende de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no evaluado en el adaptador; el entrenamiento se limita a ArgGYM.
- Capacidades multilingües: no disponibles; no se documentan idiomas soportados.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a dominios simbólicos: el adaptador sirve como referencia reproducible de un pipeline GRPO con verl sobre un modelo de 4B, útil para estudiar estabilidad del entrenamiento, currículos y diseño de recompensas.
- Evaluación de argumentación computacional: permite comparar el rendimiento de un modelo ajustado frente al base en tareas ASPIC+ (ataque, defensa, contraargumento) con una mejora documentada de +0,26 en tasa de éxito sobre el conjunto de desarrollo.
- Componente de razonamiento argumentativo en pipelines de verificación: puede integrarse como módulo especializado que recibe una teoría de argumentación y devuelve el estado o la semántica de los argumentos, siempre que el resto del sistema gestione el contexto y el presupuesto de tokens.
- Generación de explicaciones formales: para tareas de formalización y diagnóstico de derrotas, el modelo produce razonamientos largos (media de unos 28k tokens en dev) que pueden auditarse paso a paso en entornos de investigación.
- Docencia y formación en argumentación formal: útil como herramienta de apoyo para generar y contrastar soluciones a problemas de teorías ASPIC+, con la advertencia de que las respuestas deben revisarse por el riesgo de error.
- Base para experimentos de ajuste posterior: al ser un adaptador LoRA ligero (0,5 GB), puede combinarse o continuarse con otros adaptadores sobre el mismo modelo base en flujos de investigación, por ejemplo para estudiar olvido catastrófico o mezcla de dominios.

## Benchmarks y rendimiento

Tasa de éxito en un conjunto de desarrollo reservado de 96 problemas ArgGYM (8 por tarea, niveles 1–8), con 8 muestras por problema y hasta 65.536 tokens de salida:

| Modelo / checkpoint | Éxito en dev |
|---|---|
| Qwen3.5-4B (base) | 0,309 |
| Paso 20 | 0,418 |
| Paso 40 | 0,447 |
| Paso 60 | 0,527 |
| Paso 80 (este checkpoint) | 0,569 |
| Paso 100 | 0,539 |

La mejora sobre el modelo base es de +0,26 (intervalo de confianza del 95% por bootstrap pareado: +0,20 a +0,32). El paso 100 obtiene −0,03 respecto al paso 80 (IC −0,07 a +0,00), diferencia dentro del ruido. Por tarea, las mayores ganancias se dan en attack (0,25 → 0,91), attack/defence (0,33 → 0,86), defence (0,30 → 0,78) y ambas tareas de contraargumento (aproximadamente 0,29 → 0,72–0,78). Las consultas de semántica (0,14 → 0,34) y la formalización (0,12 → 0,28) también mejoran; la construcción de preferencias, el diagnóstico de derrotas y las cadenas de afirmaciones no experimentan cambios, y la perturbación se mantiene baja (0,12). No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; el adaptador añade 0,5 GB en fp32 sobre el modelo base. El modelo base Qwen3.5-4B requiere aproximadamente 8 GB en bfloat16, más el espacio de caché KV para contextos de hasta 65.536 tokens, que puede ser considerable.
- GPU recomendadas: el adaptador se ha entrenado con verl sobre el modelo base; para servir el modelo con vLLM se necesita una GPU con suficiente memoria para el contexto largo. No se especifican modelos concretos en la información disponible.
- ¿Cabe en GPU de consumo? El modelo base de 4B en bfloat16 cabe en GPUs de consumo con 16 GB o más (por ejemplo, RTX 4090), pero el contexto de 40k–65k tokens exige planificación de memoria; no hay datos publicados sobre latencia o throughput.
- Opciones de despliegue: transformers + PEFT (carga del adaptador sobre el modelo base), y vLLM con `--enable-lora --max-lora-rank 64` pasando el adaptador como módulo LoRA. No se documentan otras opciones (llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles. La longitud media de respuesta en dev es de unos 28k tokens, lo que implica una latencia alta en cualquier despliegue.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento ArgGYM (dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-ArgGYM-GRPO-step80-LoRA | LoRA sobre base 4B | Hasta 65.536 tokens de salida en evaluación | 0,569 | Apache 2.0 | Hugging Face (adaptador) |
| Qwen3.5-4B-ArgGYM-GRPO-step60-LoRA | LoRA sobre base 4B | Igual | 0,527 | Apache 2.0 | Hugging Face |
| Qwen3.5-4B-ArgGYM-GRPO-step100-LoRA | LoRA sobre base 4B | Igual | 0,539 | Apache 2.0 | Hugging Face |
| Qwen3.5-4B (base) | 4B | No disponible | 0,309 | Apache 2.0 (según modelo base) | Hugging Face |

No se dispone de datos de otros adaptadores o modelos comparables en la misma tarea fuera de los checkpoints de la misma ejecución.

## Limitaciones y advertencias

- No se han publicado resultados en el conjunto de test; todas las cifras proceden del conjunto de desarrollo.
- El conjunto de desarrollo es pequeño (96 problemas), por lo que las cifras por tarea tienen un ruido aproximado de ±0,1.
- El entrenamiento continúa desde el paso 100 de esta ejecución, por lo que un checkpoint posterior podría sustituir a este.
- El modelo se ha entrenado únicamente en ArgGYM; su comportamiento en otras tareas no se ha evaluado y puede degradarse respecto al modelo base.
- Las respuestas son muy largas (media de unos 28k tokens en dev), lo que exige presupuestos de salida de al menos 40k–65k tokens y encarece la inferencia.
- La torre de visión no se ha adaptado; no hay evaluación del comportamiento multimodal tras el ajuste.
- No se documentan idiomas soportados ni sesgos conocidos específicos del adaptador.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo ajustado con recompensa binaria en un dominio formal, los errores pueden presentarse como razonamientos plausibles pero incorrectos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-4B y el cumplimiento de sus términos.
- Para producción, es necesario replicar exactamente los parámetros de muestreo (temperatura 1.0, top-p 0.95, top-k 20, presence penalty 1.5, thinking activado) para reproducir el comportamiento reportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step80-LoRA
- Checkpoint del paso 60: https://huggingface.co/bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step60-LoRA
- Checkpoint del paso 100: https://huggingface.co/bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step100-LoRA
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Librería verl: https://github.com/volcengine/verl
- Repositorio de Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Experimento de LoRA sobre Qwen3.5-4B: https://github.com/IIIIQIIII/qwen35-4b-lora-sft

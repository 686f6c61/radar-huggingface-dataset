# hector-gr/CARE-Qwen2.5-7B-Math

## Resumen

CARE-Qwen2.5-7B-Math es un ajuste fino de Qwen2.5-7B desarrollado por Hector G. Rodriguez (con Marcus Rohrbach como coautor del articulo asociado) que entrena al modelo para verbalizar su propia confianza en la respuesta a problemas matematicos. El modelo implementa CARE (Cross-question Abstention Reward Estimation), un esquema de refuerzo que calcula recompensas sobre conjuntos de pares pregunta-respuesta en lugar de sobre cada par de forma aislada. El objetivo es habilitar prediccion selectiva: el sistema puede abstenerse o derivar a un humano o a un modelo mas potente las preguntas en las que no esta seguro.

La innovacion central frente a metodos anteriores como RLCR es que las confianzas se refuerzan de forma relativa dentro de un conjunto, de modo que la distribucion de confianzas conserva informacion util para ordenar respuestas segun un umbral de riesgo tolerado. Segun el autor, esto eleva la cobertura al 5% de riesgo (C@5) de 0,8% a 42,4% en MATH-500, GSM8K y Big-Math-Digits, manteniendo la precision global en 73,1%.

El modelo se distribuye bajo licencia Apache 2.0, parte de la base Qwen2.5-7B (7.615.616.512 parametros) y esta pensado especificamente para flujos de trabajo donde la fiabilidad calibrada importa mas que la cobertura bruta. No es un modelo de proposito general: su uso previsto requiere un prompt de sistema concreto y un formato de entrada especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino supervisado + RL con GRPO |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo base Qwen2.5-7B soporta hasta 32.768 tokens; el autor no lo especifica para este ajuste) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B, un transformer decoder-only denso de 7.615.616.512 parametros. Sobre esa base se aplica un ajuste fino orientado a la estimacion de confianza, entrenado con el dataset `mehuldamani/big-math-digits` y la configuracion recogida en `training_config.yaml` (semilla 43). El entrenamiento combina el marco RLCR (Damani et al., 2025) con la propuesta CARE del autor y utiliza TRL para el bucle de refuerzo con GRPO.

La innovacion tecnica es el esquema de recompensa CARE. En lugar de premiar confianza 1 en respuestas correctas y 0 en incorrectas (recompensa puntual que colapsa la distribucion en los extremos), CARE agrupa varios pares pregunta-respuesta, induce un umbral de abstencion para cada nivel de riesgo tolerado y recompensa cada confianza por situarse en el lado correcto de ese umbral. Asi, la confianza verbalizada se refuerza en terminos relativos a las demas preguntas del conjunto, preservando la capacidad de ordenar respuestas. El modelo emite la respuesta dentro de etiquetas `<answer>...</answer>` y la confianza dentro de `<confidence>...</confidence>`. La evaluacion del autor usa temperatura 0, una sola completion y un limite de generacion de 4096 tokens.

## Capacidades

- Generacion de texto y razonamiento matematico sobre problemas tipo MATH-500, GSM8K y Big-Math-Digits.
- Verbalizacion de confianza calibrada: emite un valor de confianza junto a cada respuesta en formato estructurado.
- Prediccion selectiva: permite ordenar respuestas por confianza y aplicar un umbral de abstencion segun el riesgo tolerado.
- Aprendizaje por refuerzo con GRPO sobre senales de recompensa a nivel de conjunto (CARE).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Enrutamiento con abstención en producción matemática: el modelo responde problemas y emite una confianza; un orquestador compara esa confianza con un umbral calibrado sobre datos held-out y deriva a un humano o a un modelo mayor las respuestas por debajo del umbral.
- Evaluación automática con control de riesgo: en pipelines de generación de exámenes o soluciones, se filtran las respuestas de baja confianza antes de publicarlas, reduciendo la tasa de error visible al usuario a costa de menor cobertura.
- Asistencia a estudiantes con escalado a tutor humano: el sistema responde dudas matemáticas y escala al profesor cuando la confianza cae por debajo del umbral definido para el curso.
- Investigación en calibración y selective prediction: sirve como baseline reproducible (semilla 43, configuración publicada) para comparar esquemas de recompensa de confianza frente a RLCR y métodos puntuales.
- Moderación de respuestas en asistentes técnicos: integrado en un asistente de resolución de ejercicios, el modelo marca internamente las respuestas dudosas para revisión posterior sin bloquear al usuario.
- Composición con modelos mayores: actúa como primer filtro barato (7B) que resuelve los problemas de alta confianza y delega el resto a un modelo de mayor tamaño, reduciendo coste medio por consulta.
- Construcción de datasets etiquetados por confianza: las salidas `<confidence>` permiten generar conjuntos de entrenamiento con etiquetas de fiabilidad para entrenar modelos de enrutamiento o clasificadores de abstención.

## Benchmarks y rendimiento

Resultados de prediccion selectiva publicados por el autor (valores en %; C@r es cobertura con riesgo r; AURC menor es mejor). ID agrupa Big-Math-Digits, MATH-500 y GSM8K; OOD agrupa CommonsenseQA, GPQA, SimpleQA, TriviaQA y HotpotQA.

| Modelo | ID C@0 | ID C@1 | ID C@5 | ID AURC | ID Acc | OOD C@0 | OOD C@1 | OOD C@5 | OOD AURC | OOD Acc |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| RLCR (Cold) | 0,0 | 0,0 | 0,8 | 19,3 | 73,1 | 0,0 | 0,0 | 4,9 | 38,7 | 56,6 |
| CARE (este modelo) | 5,4 | 18,2 | 42,4 | 12,5 | 73,1 | 2,9 | 5,4 | 15,9 | 37,7 | 53,6 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K aislado) para este modelo; solo se reportan metricas de prediccion selectiva frente a RLCR.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,2 GB de pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas para contexto largo.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4-5 GB. El autor no publica pesos cuantizados, por lo que habria que generarlos a partir de los safetensors.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en produccion; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 en BF16 y en GPUs de 12-16 GB con cuantizacion.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se publican GGUF oficiales).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CARE-Qwen2.5-7B-Math | 7.615.616.512 | no disponible | Confianza verbalizada + selective prediction (CARE) | Apache 2.0 | Hugging Face |
| RLCR (Cold) | no disponible en la informacion | no disponible | Confianza puntual (RLCR) | no disponible | Referenciado en el paper |
| Qwen2.5-7B (base) | 7.615.616.512 | hasta 32.768 tokens | LLM generalista sin calibracion de confianza | Apache 2.0 | Hugging Face |

La comparacion cuantitativa directa disponible es solo frente a RLCR (Cold): CARE mejora C@5 en ID de 0,8% a 42,4% y en OOD de 4,9% a 15,9%, con AURC ID de 19,3 a 12,5. Frente al Qwen2.5-7B base no se publican comparativas de calibracion en la informacion disponible.

## Limitaciones y advertencias

- El modelo puede dar respuestas incorrectas con confianza alta; la calibracion no es perfecta.
- No ha sido validado para decisiones criticas de seguridad.
- El riesgo medido en un dataset no se transfiere necesariamente a otra distribucion; el umbral debe calibrarse sobre datos held-out representativos del dominio de despliegue.
- El uso previsto exige el prompt de sistema exacto de `system_prompt.txt` y el formato `PROBLEM: <question>`; desviarse puede degradar la calibracion.
- La evaluacion de referencia usa temperatura 0, una sola completion y limite de 4096 tokens; otros ajustes de decodificacion no estan validados.
- Idiomas soportados no documentados; el entrenamiento se centra en matematicas y el comportamiento fuera de ese dominio solo se reporta como OOD con precision inferior (53,6% frente a 73,1% ID).
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero se incluye la licencia del modelo base Qwen2.5-7B, que debe respetarse.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hector-gr/CARE-Qwen2.5-7B-Math
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
- Dataset de entrenamiento: https://huggingface.co/datasets/mehuldamani/big-math-digits
- Paper citado (RLCR, Damani et al., 2025): no disponible enlace directo en la informacion proporcionada
- Paper CARE (Cross-Question Reliable Reinforcement Learning, Rodriguez y Rohrbach): no disponible enlace directo en la informacion proporcionada
- Repositorio TRL: https://github.com/huggingface/trl

# davidheineman/opd-teacher-Q2.5I-DiscreteLogarithm-step149

# Ficha tecnica: opd-teacher-Q2.5I-DiscreteLogarithm-step149

## Resumen

`opd-teacher-Q2.5I-DiscreteLogarithm-step149` es un checkpoint de investigacion publicado por el usuario davidheineman sobre `Qwen/Qwen2.5-1.5B-Instruct`. Se trata de un ajuste fino mediante RLVE (entrenamiento por refuerzo sobre entornos verificables) con el algoritmo GRPO, ejecutado durante 150 actualizaciones sobre un unico entorno denominado `DiscreteLogarithm` con dificultad 0. `step149` corresponde al indice final (zero-based) del entrenamiento, es decir, la actualizacion numero 150. El modelo tiene 1.543.714.304 parametros en safetensors y un repositorio de 3,1 GB.

El proposito declarado no es el uso general, sino servir como profesor dentro de un experimento de destilacion on-policy (OPD) sobre 32 entornos. Forma parte de la coleccion "RLVE OPD Teachers", que agrupa profesores entrenados sobre entornos individuales, y se relaciona con la linea de trabajo descrita en el paper arXiv 2511.07317 (RLVE). El entrenamiento esta registrado en un run de Weights & Biases (`a5a8c451`, grupo de barrido `opd-teachers-20260927-191939`) y el codigo de entrenamiento esta disponible en el repositorio `davidheineman/rlve`.

Su relevancia es fundamentalmente metodologica: permite reproducir y auditar el pipeline de RLVE + GRPO y actuar como fuente de supervision densa a nivel de token para destilar un estudiante. Conviene subrayar que es un artefacto de investigacion altamente especializado: no se ha publicado ninguna evaluacion de capacidades generales, y su utilidad fuera del entorno `DiscreteLogarithm` y del experimento de destilacion es dudosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5); detalle de capas y cabezas no disponible |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; heredada del modelo base Qwen2.5-1.5B-Instruct |
| Tipos de cuantizacion | No se publican versiones cuantizadas en el repositorio. Pesos en safetensors; al derivar de Qwen2.5, es convertible a GGUF y a cuantizaciones de llama.cpp (Q4_K_M, Q8_0, etc.) |
| Idiomas soportados | Ingles (`language: en` en la model card) |
| Licencia | Apache 2.0 (se incluye la licencia original de Qwen en `LICENSE`) |
| Formato de pesos | Safetensors (convertidos desde el checkpoint nativo final, validados contra los nombres y formas de tensor del modelo base) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only con atencion causal, pesos inicializados desde el checkpoint instructivo de Qwen. No se introduce ninguna modificacion estructural: el ajuste es exclusivamente de pesos. La model card no detalla el numero de capas, el esquema de atencion (por ejemplo, grouped-query attention) ni el tamano de vocabulario, por lo que esos datos se consideran no disponibles en esta ficha.

El entrenamiento combina RLVE (aprendizaje por refuerzo sobre entornos verificables) con GRPO como algoritmo de optimizacion, durante 150 actualizaciones y sobre un unico entorno, `DiscreteLogarithm`, con dificultad fijada en 0. No se especifican en la informacion disponible el volumen de tokens, la composicion del dataset, la funcion de recompensa exacta ni si hubo fases previas de SFT o DPO. El unico dato de proceso confirmado es que los pesos finales se convirtieron del checkpoint nativo a safetensors y se validaron contra los nombres y formas de tensor del modelo base, lo que garantiza compatibilidad de carga con `transformers`. El contexto de uso es el experimento de destilacion on-policy de 32 entornos: el modelo actua como profesor que proporciona predicciones de siguiente token con las que supervisar densamente a un estudiante.

## Capacidades

- Generacion de texto conversacional en ingles, en formato instruct (plantilla de chat heredada del modelo base).
- Rendimiento especializado en el entorno `DiscreteLogarithm` a dificultad 0, tarea para la que fue entrenado especificamente con GRPO.
- Produccion de distribuciones de siguiente token (logits) aptas para supervision densa token a token en destilacion on-policy, que es su funcion principal como "profesor".
- Razonamiento de un solo paso orientado a recompensa verificable dentro del entorno de entrenamiento; no se documentan capacidades de razonamiento multi-paso generales.
- Tool calling / function calling: no confirmado para este checkpoint. El modelo base Qwen2.5-1.5B-Instruct lo soporta, pero el ajuste con GRPO sobre un unico entorno hace probable la degradacion de capacidades generales; no hay evaluacion al respecto.
- Soporte de agentes: no documentado.
- Capacidades multilingues: limitadas a ingles segun la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- No se documentan capacidades de generacion de codigo, matematicas generales o vision.

## Casos de uso

- Profesor en destilacion on-policy: generar trayectorias y logits de siguiente token para supervisar a un estudiante en el pipeline OPD de 32 entornos. Es el uso para el que fue creado y el unico respaldado por el autor.
- Reproduccion de experimentos RLVE/GRPO: replicar la curva de entrenamiento de 150 actualizaciones sobre `DiscreteLogarithm` a dificultad 0 y contrastarla con el run de W&B `a5a8c451`.
- Estudio de especializacion y olvido catastrofico: comparar este checkpoint con `Qwen2.5-1.5B-Instruct` para cuantificar cuanto se degradan las capacidades generales tras un ajuste RL breve y muy focalizado.
- Generacion de datos sinteticos de logaritmo discreto: producir pares problema-respuesta dentro del entorno de entrenamiento para aumentar el corpus de un estudiante o de un SFT posterior.
- Baseline en ablaciones de GRPO: servir como condicion de referencia (150 updates, un entorno) frente a variantes con mas entornos, mas dificultad o distinto numero de actualizaciones.
- Investigacion sobre sesgo de estilo en destilacion entre profesores: al ser uno de los 32 profesores de la coleccion, permite analizar como el estilo de un profesor experto en un entorno concreto condiciona al estudiante, en linea con la literatura sobre cross-teacher OPD.
- Punto de partida para ajustes posteriores: al ser un checkpoint de 1,5 B con licencia Apache 2.0 y safetensors validados, puede reentrenarse sobre otros entornos o dificultades sin coste elevado de computo.
- Analisis de robustez del pipeline de conversion: el repositorio documenta la validacion de nombres y formas de tensor frente al modelo base, lo que lo convierte en un caso de prueba para herramientas de conversion de checkpoints nativos a safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna evaluacion especifica del entorno `DiscreteLogarithm`, y el run de W&B referenciado no se reproduce con metricas en la informacion proporcionada. No se dispone por tanto de datos comparativos verificables con modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 3,1 GB solo de pesos (tamano del repositorio) mas el KV cache; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada con cuantizacion: alrededor de 1,6 GB en 8 bits y en torno a 0,9-1,2 GB en 4 bits (valores orientativos para un modelo de 1,5 B; no hay versiones cuantizadas publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas, como RTX 3060, 4060, 4070 o superiores. Tambien es viable en GPUs profesionales (A100, H100) para servir muchas replicas o hacer barridos en paralelo, aunque estan sobredimensionadas para un modelo de este tamano.
- Inferencia en CPU: viable con llama.cpp/Ollama gracias al reducido numero de parametros, con latencias mas altas.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (TGI), vLLM, y llama.cpp/Ollama tras conversion a GGUF. Los tags incluyen `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Proposito |
|---|---|---|---|---|---|
| opd-teacher-Q2.5I-DiscreteLogarithm-step149 | 1,54 B | No disponible | Apache 2.0 | Ingles | Profesor RLVE/GRPO especializado en `DiscreteLogarithm` |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | 1,54 B | No disponible en la informacion | Apache 2.0 | Multilingue (no detallado aqui) | Modelo instructivo de proposito general |
| Otros profesores de la coleccion "RLVE OPD Teachers" | 1,54 B (misma configuracion) | No disponible | Apache 2.0 | Ingles | Mismo pipeline RLVE/GRPO sobre otros entornos (32 de 400) |

No se dispone de datos de rendimiento de ninguna de las alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y proposito. Alternativas de tamano similar como Llama-3.2-1B-Instruct, SmolLM2-1.7B-Instruct o Gemma-2-2B no aparecen en la informacion disponible y sus especificaciones no se detallan aqui.

## Limitaciones y advertencias

- Especializacion extrema: el entrenamiento se realizo sobre un unico entorno (`DiscreteLogarithm`) a dificultad 0 durante solo 150 actualizaciones, por lo que cabe esperar un deterioro sustancial de las capacidades generales del modelo base.
- No es un modelo de proposito general: la model card lo describe explicitamente como un profesor para un experimento de destilacion, no como un asistente desplegable.
- Ausencia total de evaluacion: sin benchmarks publicados, no hay evidencia de comportamiento fuera del entorno de entrenamiento ni de la magnitud del olvido catastrofico.
- Riesgo de alucinacion: no evaluado. Al ser un ajuste por RL sobre recompensa verificable en un dominio cerrado, no hay datos sobre su calibracion fuera de dicho dominio.
- Idiomas: unicamente ingles declarado; no hay soporte multilingue documentado.
- Contexto: la longitud de contexto efectiva tras el ajuste no esta documentada y podria diferir de la del modelo base.
- Sesgos: no se documenta ningun analisis de sesgos ni de composicion de datos, dado que el entrenamiento se basa en recompensas de un entorno sintetico.
- Licencia: Apache 2.0, lo que permite uso comercial del checkpoint, pero el autor incluye la licencia original de Qwen en `LICENSE` y el uso debe respetar las condiciones del modelo base.
- Trazabilidad: el checkpoint se distribuye sin versiones cuantizadas ni pipelines de despliegue oficiales, por lo que cualquier puesta en produccion exige conversion y validacion adicionales.
- Uso en produccion: no recomendado sin una evaluacion previa especifica de la tarea objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-DiscreteLogarithm-step149
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Run de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/a5a8c451
- Codigo de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Paper RLVE (referenciado desde la coleccion): https://arxiv.org/abs/2511.07317
- Lightning OPD 2.0: Mitigating Style Bias in Cross-Teacher On-Policy Distillation: https://arxiv.org/pdf/2607.28449
- Repositorio Lightning OPD: https://github.com/jet-ai-projects/Lightning-OPD/tree/main
- Recursive Self-Improvement via On-Policy Distillation for Reasoning: https://arxiv.org/html/2609.30652

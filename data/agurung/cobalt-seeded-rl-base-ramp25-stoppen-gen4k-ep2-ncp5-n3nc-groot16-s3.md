# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-groot16-s3

## Resumen

Este repositorio contiene un checkpoint de aprendizaje por refuerzo (RL) derivado de `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario `agurung` dentro de una línea de experimentos sobre generación de código. No es un modelo entrenado desde cero ni un ajuste supervisado clásico: se ha aplicado RL directamente sobre el modelo base (sin semilla de SFT) mediante el algoritmo GRPO implementado con OpenRLHF, y se ha guardado en el paso global 4 de la ejecución denominada `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_groot16_s3`. El autor lo identifica como el mejor checkpoint por pass@8 de esa ejecución hasta la fecha.

El modelo tiene 3.973.556.832 parámetros reales según los pesos en safetensors, lo que confirma que se trata del Qwen3-4B sin cambios de tamaño, con un repositorio de 15,9 GB. La tarea objetivo es la generación de código verificable: la señal de recompensa es binaria (1,0 si el programa generado pasa los tests del problema, 0,0 en caso contrario), entrenada y validada sobre el denominado "cobalt-train ≤2/64 frontier".

La relevancia de esta ficha es acotada y experimental: el propio autor indica que las métricas de evaluación de este checkpoint no están disponibles en el registro de entrenamiento, el número de descargas y likes es cero, y no se declara licencia ni idiomas. Debe tratarse, por tanto, como un artefacto de investigación reproducible más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3-4B-Instruct-2507); el tag de HuggingFace incluye `nemotron_h`, sin confirmar en la informacion disponible |
| Parametros totales | 3.973.556.832 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamano del repositorio | 15,9 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-4B-Instruct-2507, un transformer decoder-only de aproximadamente 4.000 millones de parámetros. El repositorio no documenta modificaciones estructurales respecto al base: el checkpoint se obtiene por optimización de política sobre los pesos existentes, no por cambios en el grafo del modelo. El tag `nemotron_h` aparece en los metadatos de HuggingFace, pero la model card no lo justifica ni lo describe, por lo que no puede confirmarse que la arquitectura sea híbrida.

El entrenamiento se realizó con OpenRLHF aplicando GRPO con ventajas normalizadas por grupo y sin penalización KL. Incluye dos mecanismos de shaping de recompensa: un "stop-properly penalty" de estilo ProRL que asigna −1,0 a las muestras truncadas, y una penalización overlong de estilo DAPO que añade hasta −0,25 a las respuestas situadas en los últimos 1024 tokens antes del límite. Los hiperparámetros declarados son: 8 muestras por prompt, batch de rollout y de entrenamiento de 128, máximo de 4096 tokens nuevos por rollout, 2 episodios, y tasa de aprendizaje del actor constante de 1e-06. El conjunto de datos de RL es el "cobalt-train ≤2/64 frontier": 1833 problemas de entrenamiento y 112 de validación retenidos, definidos como aquellos que el modelo base resolvía en como máximo 2 de 64 muestras bajo el escaneo de dificultad `iid_canonical@64`. La evaluación de validación muestrea a temperatura 1.0.

## Capacidades

- Generacion de codigo: es la capacidad principal y el objetivo explícito del entrenamiento por RL, con recompensa basada en la superación de tests.
- Razonamiento orientado a problemas de programación verificables: el modelo está optimizado para producir programas que pasen baterías de pruebas.
- Generacion de texto general: heredada del pipeline `text-generation` y del modelo base instructivo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Modo de pensamiento (thinking mode), vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de codigo asistida en investigacion: el checkpoint puede emplearse para estudiar el efecto del RL con GRPO sobre un modelo base de 4B sin SFT previo, comparando su tasa de acierto en tests frente al modelo original.
- Reproduccion de experimentos de RL: dado que incluye la receta completa (algoritmo, penalizaciones, hiperparámetros y referencia a los logs de Weights & Biases), sirve como punto de partida para replicar la ejecución `eaiexp-paper-final`.
- Evaluacion de tecnicas anti-truncamiento: el "stop-properly penalty" y la penalización overlong de DAPO son el objeto de estudio principal, por lo que el modelo es útil para medir su impacto en la calidad del codigo generado.
- Benchmarking de checkpoints intermedios: al ser el paso 4 de una ejecucion, permite analizar el efecto de un numero reducido de pasos de RL sobre el rendimiento por pass@8.
- Pruebas de sintesis de programas en tareas acotadas de tipo competicion: entrenado sobre problemas que el base resolvia en como maximo 2 de 64 intentos, el modelo esta especializado en ese rango de dificultad.
- Servicio de inferencia local con vLLM: la model card documenta el comando `vllm serve` con la revision `main`, lo que facilita levantar el modelo como endpoint compatible con la API de OpenAI.
- Integracion en pipelines de evaluacion automatizada: puede conectarse a arneses que ejecuten los tests de los problemas y midan pass@k, dado que su objetivo se define exactamente por esa metrica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que "Eval metrics at this checkpoint: not available in the train log" y que el modelo es el mejor por pass@8 de la ejecucion, pero no se aporta la cifra concreta de pass@8 ni resultados de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa derivada del tamano (3.973.556.832 parametros), a precision completa (fp16) rondaria los 8 GB de pesos, y en cuantizacion de 4 bits alrededor de 2-3 GB; estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Encaje en GPU de consumo: no confirmado por el autor; por tamano, un modelo de 4B en fp16 o cuantizacion 4-8 bits es plausible en GPUs de consumo de 8-24 GB, pero no hay dato oficial.
- Opciones de despliegue: vLLM (comando `vllm serve` documentado en la model card) y transformers (`AutoModelForCausalLM`). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de benchmarks ni comparaciones con otros modelos, por lo que no es posible establecer una comparativa rigurosa de parametros, contexto, rendimiento y licencia frente a alternativas. Como referencia de categoria, el modelo base `Qwen/Qwen3-4B-Instruct-2507` seria el comparable natural, pero no se aportan sus metricas en esta ficha.

## Limitaciones y advertencias

- Sin licencia declarada: no puede asumirse permiso para uso comercial. Verificar siempre los terminos antes de cualquier despliegue productivo.
- Idiomas no declarados: no hay garantia de soporte multilingue ni de comportamiento en idiomas distintos del usado en el entrenamiento.
- Riesgo de alucinacion: no documentado por el autor, pero inherente a los modelos generativos; en generacion de codigo se traduce en programas que compilan pero no cumplen la funcionalidad esperada, por lo que se requiere ejecucion de tests.
- Checkpoint muy temprano: esta guardado en el paso global 4 de la ejecucion, y el propio autor senala que no hay metricas de evaluacion registradas para este paso, lo que dificulta valorar su calidad real.
- Ambito de entrenamiento estrecho: solo 1833 problemas de entrenamiento y 112 de validacion, todos filtrados como "≤2/64 frontier"; el rendimiento fuera de esa distribucion no esta caracterizado.
- Ausencia de SFT previo: la model card indica que el RL se aplico directamente sobre el modelo base sin semilla de SFT, lo que puede afectar a la estabilidad y al formato de las respuestas.
- Cero adopcion: 0 descargas y 0 likes en el momento de los datos, sin validacion externa por parte de la comunidad.
- Inconsistencia de metadatos: el tag `nemotron_h` no se corresponde con un modelo base Qwen3, lo que puede inducir a error en herramientas que dependan de ese campo.
- Sin garantias de reproducibilidad: los logs de entrenamiento se referencian en Weights & Biases (proyecto `eaiexp-paper-final`), pero no se aportan en el repositorio.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-groot16-s3)
- [Modelo base Qwen/Qwen3-4B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507)
- Weights & Biases, proyecto `eaiexp-paper-final`, ejecucion `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_groot16-s3` (referenciado en la model card; sin URL directa proporcionada)
- OpenRLHF (framework de entrenamiento mencionado; sin URL proporcionada en la informacion disponible)

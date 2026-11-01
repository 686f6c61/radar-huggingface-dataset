# Guanghan-Ning/WitnessGym-Qwen3.8-27B-RL-broadcast-step20

## Resumen

WitnessGym-Qwen3.8-27B-RL-broadcast-step20 es un ajuste fino por refuerzo del modelo denso Qwen3.8-27B, publicado por Guanghan-Ning (fleet-ai) como parte del ecosistema WitnessBench. El modelo ha sido entrenado con GRPO durante 20 pasos sobre un conjunto de 22 juegos de entrenamiento del entorno WitnessGym, orientados a tareas de descubrimiento de reglas, descifrado y razonamiento interactivo. El checkpoint publicado corresponde al estado tras la vigesima actualizacion y es el que se utiliza en el paper para reportar resultados de transferencia fuera de dominio.

La relevancia del modelo reside en su enfoque: en lugar de entrenar con datos supervisados, se aplica aprendizaje por refuerzo con recompensa basada unicamente en el resultado (niveles resueltos y penalizacion por llamada), lo que empuja al modelo a desarrollar estrategias de exploracion y verificacion de hipotesis. El paper asociado (arXiv 2609.32208) reporta mejoras medibles frente al modelo base en benchmarks como CipherBank, PhysGym L4, WILT y Failing-to-Falsify, con intervalos de confianza bootstrap del 95%.

El modelo tiene 26.895.998.464 parametros (aproximadamente 26,9 mil millones), arquitectura transformer densa heredada de Qwen3.8-27B, licencia Apache 2.0 y pesos en formato safetensors. El repositorio ocupa 53,8 GB y esta pensado para su uso con transformers o SGLang, con el modo de pensamiento desactivado (`enable_thinking: false`) tal y como se entreno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (base Qwen3.8-27B) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (configuracion de evaluacion y ejemplo de SGLang); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors sin cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de aproximadamente 26,9 mil millones de parametros. Sobre esa base se aplica GRPO (Group Relative Policy Optimization) con una actualizacion por paso de rollout y una asignacion de ventaja "broadcast": la ventaja de cada episodio se distribuye a todas las llamadas de ese episodio. La recompensa es puramente de resultado: +1 por nivel resuelto, +0,5 por superar todos los niveles y -0,005 por cada llamada al modelo, lo que penaliza la verbosidad y el uso excesivo de herramientas.

El entrenamiento se realizo sobre 22 juegos de entrenamiento, con 8 episodios por juego y paso (batch global de 176 episodios), durante 20 pasos. Se uso el harness v1 de WitnessBench con el modo de pensamiento desactivado y solo texto. El optimizador fue Adam (0,9, 0,98) con learning rate constante de 1e-6, weight decay 0,1, grad clip 1,0, clip epsilon 0,2/0,28 y sin termino KL. El rollout empleo temperatura 1,0, top-p 1,0 y hasta 8.192 tokens por llamada. El entrenamiento se ejecuto en 8 GPU NVIDIA B300 con el trainer miles.

## Capacidades

- Generacion de texto y razonamiento interactivo en entornos de multiples pasos.
- Descubrimiento de reglas y descifrado de cifrados personalizados (evaluado en CipherBank).
- Razonamiento fisico y resolucion de problemas tipo PhysGym L4.
- Razonamiento abductivo y falsacion de hipotesis (evaluado en Failing-to-Falsify).
- Aprendizaje por refuerzo orientado a la resolucion de tareas con recompensa de resultado.
- Soporte de tool calling / function calling heredado del modelo base Qwen3.8-27B (no verificado de forma especifica en la informacion disponible).
- Capacidades multimodales de entrada image-text-to-text segun el pipeline declarado, aunque el entrenamiento RL fue solo de texto.
- Modo de pensamiento desactivable; el checkpoint esta entrenado con `enable_thinking: false`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: el checkpoint sirve como referencia reproducible para estudiar como 20 pasos de GRPO con recompensa de resultado afectan a la transferencia fuera de dominio en tareas de razonamiento.
- Evaluacion de agentes interactivos: permite comparar el comportamiento de un agente entrenado con harness v1 frente a modelos base en entornos de puzzles y descubrimiento de reglas.
- Descifrado y criptografia educativa: adecuado para experimentos de resolucion de cifrados personalizados, donde el paper reporta una mejora de +4,8 puntos en exact match sobre CipherBank.
- Razonamiento cientifico y fisico: util en tareas de PhysGym L4, con una mejora reportada de +3,4 puntos en tasa de exito.
- Analisis de falsacion de hipotesis: aplicable a experimentos sobre sesgos de confirmacion y razonamiento abductivo, con una diferencia de +6,1 puntos en la fraccion de incompatibilidad en Failing-to-Falsify.
- Reproduccion de resultados academicos: el repositorio incluye instrucciones para replicar las evaluaciones mediante el directorio `transfer/` del proyecto WitnessBench.
- Base para nuevos ajustes RL: al estar bajo Apache 2.0 y en safetensors, puede servir como punto de partida para entrenamientos posteriores con GRPO u otros algoritmos.

## Benchmarks y rendimiento

Resultados de transferencia fuera de dominio reportados en el paper (media ± desviacion estandar, diferencia pareada frente al modelo base con intervalo bootstrap del 95%):

| Benchmark (metrica) | Configuracion | Base | Este modelo | Delta |
|---|---|---|---|---|
| CipherBank (cifrados personalizados, exact match %) | thinking on, 32k, 2 repeticiones | 73,8 ± 0,2 | 78,6 ± 1,3 | +4,8 [+1,5, +8,1] |
| PhysGym L4 (exito %) | thinking on, 32k, 3 repeticiones | 44,7 ± 1,6 | 48,1 ± 2,1 | +3,4 [0,0, +7,2] |
| WILT (elim@5 %) | thinking off, 5 repeticiones | 86,3 ± 1,6 | 88,6 ± 1,7 | +2,3 [+0,3, +4,4] |
| Failing-to-Falsify (fraccion de incompatibilidad %) | thinking off, 5 repeticiones | 50,7 ± 5,1 | 55,4 ± 4,9 | +6,1 [-0,2, +12,2] |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 54 GB solo para pesos, mas memoria para el contexto y el estado de inferencia; se recomienda al menos 80 GB por GPU.
- GPU recomendadas: NVIDIA B300 (usadas en entrenamiento), A100 80 GB, H100 80 GB, H200. Para tensor parallelism con SGLang se puede usar `--tp` mayor que 1 en varias GPU.
- Cabe en GPU de consumo: no en precision completa. Con cuantizacion a 8 bits o 4 bits (no publicada oficialmente) podria intentarse en RTX 4090 (24 GB) o RTX 5090, pero requeriria cuantizacion externa y no esta validado por el autor.
- Opciones de despliegue: SGLang (ejemplo oficial en la model card con `--tp 1 --context-length 32768 --sampling-defaults openai --default-chat-template-kwargs '{"enable_thinking": false}'`), transformers (libreria declarada). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento uso hasta 8.192 tokens por llamada y temperatura 1,0 con top-p 1,0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WitnessGym-Qwen3.8-27B-RL-broadcast-step20 | ~26,9 B | 32.768 (config. de evaluacion) | RL con GRPO sobre Qwen3.8-27B para WitnessBench | Apache 2.0 | HuggingFace, 33 descargas |
| Qwen3.8-27B (base) | ~27 B | no disponible | Modelo base denso multimodal | Apache 2.0 | HuggingFace (Qwen/Qwen3.8-27B) |
| Alternativas RL para razonamiento interactivo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos RL de la misma categoria en la informacion proporcionada. La comparacion directa disponible es unicamente frente al modelo base Qwen3.8-27B en los cuatro benchmarks de transferencia del paper.

## Limitaciones y advertencias

- El checkpoint fue entrenado con el harness v1 de WitnessBench; la version actual del proyecto publica harness v2 y este modelo no fue entrenado con ella, lo que puede degradar el rendimiento en ese entorno.
- El modelo esta entrenado con el modo de pensamiento desactivado (`enable_thinking: false`); usarlo con thinking activado puede producir comportamiento fuera de distribucion.
- El entrenamiento RL fue solo de texto, aunque el pipeline declarado sea image-text-to-text; las capacidades multimodales no fueron objeto del ajuste y no estan validadas.
- La recompensa penaliza cada llamada al modelo (-0,005), lo que puede inducir estrategias de minimizacion de llamadas que no siempre sean optimas en dominios distintos a WitnessGym.
- El numero de pasos de RL es bajo (20), por lo que las mejoras reportadas son modestas y con intervalos de confianza que en algunos casos incluyen el cero (PhysGym L4 y Failing-to-Falsify).
- Riesgo de alucinacion y sesgos: no se documentan analisis especificos en la informacion disponible; se heredan los del modelo base Qwen3.8-27B.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingue.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y el autor no documenta evaluaciones de seguridad.
- El repositorio tiene muy baja adopcion (33 descargas, 0 likes) y fue creado en octubre de 2026, por lo que la validacion comunitaria es practicamente nula.

## Enlaces

- HuggingFace: https://huggingface.co/Guanghan-Ning/WitnessGym-Qwen3.8-27B-RL-broadcast-step20
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper (arXiv): https://arxiv.org/abs/2609.32208
- DOI: https://doi.org/10.48550/arXiv.2609.32208
- Web del proyecto: https://witnessbench.ai
- Codigo: https://github.com/fleet-ai/witnessbench
- Reproduccion de evaluaciones: https://github.com/fleet-ai/witnessbench/tree/main/transfer

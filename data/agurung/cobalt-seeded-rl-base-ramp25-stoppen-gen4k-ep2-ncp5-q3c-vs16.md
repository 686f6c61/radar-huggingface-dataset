# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q3c-vs16

## Resumen

`agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q3c-vs16` es un checkpoint de aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, desarrollado por el usuario agurung. No es un modelo preentrenado desde cero ni un ajuste supervisado convencional: es el resultado de aplicar GRPO (Group Relative Policy Optimization) mediante OpenRLHF directamente sobre el modelo base, sin semilla SFT intermedia, con el objetivo de mejorar la generacion de codigo correcto. Corresponde al paso global 110 de una ejecucion de RL y el autor lo identifica como el mejor checkpoint de esa ejecucion atendiendo a la metrica pass@8.

El modelo tiene 4.411.424.256 parametros (aproximadamente 4,4 mil millones) y se distribuye en formato safetensors con un repositorio de 8,8 GB, lo que sugiere pesos en precision de 16 bits o superior. La senal de recompensa del entrenamiento es puramente binaria: 1.0 si el programa generado pasa los tests del problema y 0.0 en caso contrario. El conjunto de entrenamiento se denomina "cobalt-train ≤2/64 frontier" y comprende 1833 problemas de entrenamiento y 112 de validacion reservados, seleccionados porque el modelo base resolvia como maximo 2 de 64 muestras en un escaneo de dificultad iid_canonical@64.

La relevancia de esta ficha es acotada y conviene subrayarlo: se trata de un checkpoint experimental de investigacion, no de un modelo listo para produccion. El autor no publica resultados de evaluacion en la model card ("not available in the train log"), no declara licencia ni idiomas soportados, y el nombre del repositorio codifica hiperparametros del experimento. Es util para quien investigue RL aplicado a generacion de codigo sobre Qwen3-4B, no como sustituto general del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507); no se detalla en la model card |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Metodo de ajuste | GRPO con OpenRLHF |
| Paso global del checkpoint | 110 |
| Tamano del repositorio | 8,8 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507, un transformer decoder-only de aproximadamente 4,4 mil millones de parametros. Sobre esa base, el autor aplica un ciclo de RL con GRPO implementado en OpenRLHF. Un detalle relevante del recipe es que el entrenamiento parte del modelo base sin semilla SFT ("no SFT seed — RL applied directly to the base model"), es decir, el RL se aplica directamente sobre los pesos del modelo instruct ya publicado.

Los hiperparametros documentados son concretos: 8 muestras por prompt, tamano de batch de rollout y de entrenamiento de 128, maximo de 4096 tokens nuevos por rollout, 2 episodios, learning rate del actor de 1e-06 con schedule constante y GRPO con ventajas normalizadas por grupo y sin penalizacion KL. Se incorporan dos mecanismos de modelado de recompensa orientados a evitar respuestas truncadas: una penalizacion "stop-properly" que asigna recompensa de -1.0 a las muestras truncadas (estilo ProRL) y una penalizacion DAPO sobrelong que aplica una penalizacion aditiva que escala hasta -0.25 en los ultimos 1024 tokens antes del limite. La senal de recompensa es binaria por correccion de codigo contra los tests del problema.

El conjunto de datos de entrenamiento son 1833 problemas de la frontera "cobalt-train ≤2/64", es decir, problemas que el modelo base resolvia en como maximo 2 de 64 muestras, mas 112 problemas de validacion reservados. La evaluacion de validacion se realiza con temperatura 1.0. No se documenta el numero total de tokens de entrenamiento ni la composicion linguistica del dataset.

## Capacidades

- Generacion de codigo: es la capacidad objetivo del entrenamiento; el reward binario de correccion de codigo optimiza directamente la tasa de programas que pasan tests.
- Razonamiento y resolucion de problemas de programacion: el entrenamiento se centra en problemas de dificultad alta para el modelo base (frontera ≤2/64).
- Generacion de texto general: heredada de Qwen3-4B-Instruct-2507, aunque el RL puede haber alterado el equilibrio respecto al modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada; no se documenta en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo thinking: no disponible en la informacion proporcionada.
- Vision o audio: no disponible; el pipeline declarado es text-generation.

## Casos de uso

- Investigacion en RL para generacion de codigo: el checkpoint sirve como referencia reproducible de un pipeline GRPO con OpenRLHF sobre Qwen3-4B, con hiperparametros y penalizaciones documentados, para comparar variantes de shaping de recompensa.
- Generacion de parches y funciones en entornos de test automatizado: dado que el entrenamiento optimiza pasar tests, encaja en flujos donde existe una suite de pruebas que valida la salida antes de aceptarla.
- Baseline en estudios de pass@k: al ser el mejor checkpoint por pass@8 de su ejecucion, es util como punto de comparacion frente a otros checkpoints de la misma run o frente al modelo base.
- Aumento de datos de codigo: puede generar soluciones candidatas para problemas de programacion que luego se filtran por ejecucion de tests.
- Experimentos de ablacion de penalizaciones anti-truncamiento: permite estudiar el efecto de la penalizacion stop-properly y DAPO sobrelong frente a configuraciones sin ellas.
- Servicio de inferencia experimental con vLLM: el autor documenta el comando `vllm serve`, lo que permite desplegarlo en un entorno de pruebas para evaluar latencia y calidad antes de decidir su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las metricas de evaluacion en este checkpoint no estan disponibles en el registro de entrenamiento ("Eval metrics at this checkpoint: not available in the train log"). El unico dato de rendimiento declarado es cualitativo: es el mejor checkpoint de la ejecucion segun pass@8.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 8,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica conviene reservar 12-16 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4,5-5 GB para pesos; en 4 bits, alrededor de 2,5-3 GB (estimaciones a partir del numero de parametros; no se publican pesos cuantizados).
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegue con concurrencia y contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en fp16 con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en fp16 y en tarjetas de 8 GB con cuantizacion.
- Opciones de despliegue: transformers (carga directa con `revision="main"`), vLLM (`vllm serve ... --revision main`) y TGI, dado el tag `text-generation-inference`; llama.cpp u Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | 4,41 B | no disponible | GRPO sobre Qwen3-4B-Instruct-2507 | no disponible | Hugging Face, safetensors |
| Qwen/Qwen3-4B-Instruct-2507 | ~4 B | no disponible en la informacion proporcionada | Instruct + post-entrenamiento de Qwen | no disponible en la informacion proporcionada | Hugging Face |
| Otros checkpoints de la misma run | ~4,41 B | no disponible | GRPO, distintos pasos globales | no disponible | Hugging Face (mismo autor) |

La comparacion con alternativas de la misma categoria (por ejemplo, otros modelos de ~4 B orientados a codigo) no puede completarse con datos verificables a partir de la informacion proporcionada: no hay benchmarks publicados de este checkpoint ni se dispone de cifras comparables de los modelos alternativos en esta ficha.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay MMLU, HumanEval, GSM8K ni pass@k cuantificados en la model card; el unico indicador es cualitativo.
- Licencia no declarada: no se puede asumir uso comercial permitido; hay que verificar la licencia del modelo base Qwen3-4B-Instruct-2507 y la del propio repositorio antes de cualquier despliegue.
- Idiomas no declarados: no hay garantia de comportamiento multilingue mas alla del heredado del modelo base.
- Riesgo de sobreajuste a la frontera de dificultad: el entrenamiento se limita a problemas que el modelo base resolvia como maximo 2 de 64 veces, lo que puede degradar el rendimiento en problemas faciles o en tareas fuera de ese regimen.
- Posible regresion en capacidades generales: al aplicar RL directamente sobre el modelo sin semilla SFT y con recompensa exclusivamente de correccion de codigo, es esperable deriva en generacion de texto general, dialogo y otras tareas no entrenadas.
- Riesgo de alucinacion: inherente a un modelo de 4 B; el reward binario de tests no garantiza correccion semantica fuera del conjunto de pruebas.
- Naturaleza experimental: el nombre del repositorio codifica hiperparametros y el checkpoint corresponde a un paso intermedio (110) de una ejecucion de investigacion; no es un artefacto estable ni versionado semanticamente.
- Sin pesos cuantizados oficiales: el despliegue en entornos de bajos recursos requiere conversion propia a GGUF/AWQ/GPTQ, sin garantia de preservar el comportamiento entrenado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q3c-vs16
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- OpenRLHF (framework de entrenamiento): https://github.com/OpenRLHF/OpenRLHF
- Weights & Biases: proyecto `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_q3c_vs16` (no se proporciona URL directa)
- Paper de GRPO: no disponible en la informacion proporcionada
- Paper de DAPO: no disponible en la informacion proporcionada
- Paper de ProRL: no disponible en la informacion proporcionada

# brendanboyle/LFM3-1.7B-Pi-MLX-30Task

## Resumen

LFM3-1.7B-Pi-MLX-30Task es un adaptador LoRA de rango 32 publicado por brendanboyle para el modelo base LiquidAI/LFM3-1.7B en formato MLX (bf16). No es un modelo completo, sino un checkpoint de pesos delta que se carga sobre el modelo base fijado en la revisión `52041852d5b5c59bfe120c075d2744ab97959d91`. El adaptador está entrenado con aprendizaje por refuerzo (estilo GRPO) para mejorar el comportamiento agéntico del modelo dentro del harness Pi 1.5.2 sobre Apple Silicon, apuntando a tareas de análisis de datos con verificación ejecutable.

El problema que resuelve es concreto: el modelo base, ejecutado en un bucle agéntico con herramientas, obtiene una tasa de éxito baja y consume muchos tokens por tarea. El adaptador incrementa la tasa de acierto en un conjunto de evaluación retenido de 150 tareas (de 72/150 a 100/150, +18,67 puntos porcentuales) y reduce el coste en tokens lógicos por tarea exitosa en un 42,43%. Está pensado exclusivamente para el stack MLX en Apple Silicon, no para GPUs NVIDIA ni para despliegues convencionales de inferencia.

La relevancia actual es doble: por un lado, demuestra que el RL agéntico con verificadores ejecutables puede aplicarse a modelos pequeños (1,7B) en hardware de consumo profesional (un Mac Studio M4 Max); por otro, documenta de forma inusualmente rigurosa la procedencia del entrenamiento (rollouts, grupos, actualizaciones, picos de memoria del allocator). Es un artefacto de investigación reproducible, no un modelo de propósito general listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el transformer LiquidAI/LFM3-1.7B; rango 32, escala 2 (alpha 64), 153 proyecciones del decodificador |
| Parametros totales | no disponible (adaptador; el modelo base declara 1,7B en su nombre) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la evaluacion uso 6.144 tokens de contexto y 1.024 de salida por peticion) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors y requiere base bf16 (MLX) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (adaptador MLX) + `adapter_config.json` + `adapter_metadata.json`; base en MLX bf16 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LiquidAI/LFM3-1.7B, un transformer del que no se detallan en la informacion disponible ni la composicion del dataset de preentrenamiento ni el contexto nativo. El delta entrenado es un LoRA de rango 32 con alpha 64 que cubre 153 proyecciones del decodificador, lo que supone una intervencion amplia sobre el modelo base en lugar de un ajuste superficial de las capas finales.

El entrenamiento usa un gradiente de politica relativo a grupo (estilo GRPO) de una sola actualizacion sobre tokens de completado muestreados exactamente. El proceso se ejecuto en contenedores ARM64 Harbor en modo offline con Pi 1.5.2; verificadores ejecutables puntuaron cada intento, con un pequeno bonus por eficiencia de herramientas en los aciertos y recompensa efectiva nula tras un bloqueo forzado de SafeAgents. Hubo un calentamiento compartido de tres actualizaciones sobre 24 rollouts en dos tareas (unos 19 minutos) y una ejecucion principal de 30 tareas con 400 rollouts en 50 grupos, 45 actualizaciones y 7,2 horas. El dataset de entrenamiento es `FineEnvs/SmolDataEnvs-harbor-train` en la revision `588744be728257abfb8d4984ec8fab2acbd1f7e1`. Todo el entrenamiento y la evaluacion se hicieron en un Mac Studio con M4 Max y 128 GB de memoria unificada, con un pico de 35,464 GiB en el allocator de MLX durante el entrenamiento principal y un maximo historico de recoleccion de 15,941 GiB.

## Capacidades

- Razonamiento agéntico multi-turno dentro del harness Pi 1.5.2: planificacion, uso de herramientas y ejecucion de hasta 10 turnos por tarea en la evaluacion.
- Uso de herramientas (tool calling) con verificadores ejecutables en contenedores Harbor.
- Analisis de datos y respuesta a preguntas sobre conjuntos tabulares: el holdout de evaluacion son 150 tareas easy/medium de QA de analisis de datos provenientes de 93 datasets fuente.
- Mejora de eficiencia: reduce llamadas a herramientas y tokens consumidos por tarea resuelta respecto al modelo base.
- Generacion de texto y codigo heredada del modelo base LFM3-1.7B (no evaluada de forma independiente en la informacion disponible).
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Automatizacion de analisis de datos sobre tablas: el adaptador esta entrenado y evaluado en QA de analisis de datos con verificacion ejecutable, por lo que es adecuado para pipelines donde el modelo debe inspeccionar datos, calcular y responder con comprobacion automatica del resultado.
- Agentes locales en Apple Silicon: integracion en el MLX Harness Adapter para ejecutar tareas agénticas en un Mac sin depender de GPUs NVIDIA, usando el backend `lfm3` y el adaptador cargado sobre la base bf16 fijada.
- Reduccion de coste en bucles agénticos: al bajar un 42,43% los tokens logicos por tarea exitosa y un 15,72% las llamadas a herramientas en exitos compartidos, sirve para abaratar agentes que ya funcionan con el modelo base.
- Evaluacion y reproduccion de RL agéntico: el manifest congelado y los contadores de screening permiten reproducir el experimento sin repetir la fase de seleccion, util para investigación en RL con verificadores.
- Prototipado de asistentes con uso de herramientas en local: entornos de desarrollo donde se quiere probar un agente pequeno con tool calling antes de escalar a modelos mayores.
- Filtrado y preprocesado de datos con verificacion: tareas donde cada respuesta puede comprobarse programaticamente y el modelo debe iterar hasta pasar el verificador.
- Docencia y experimentacion con GRPO: caso de estudio reproducible de entrenamiento por refuerzo sobre un modelo de 1,7B en hardware de consumo profesional.

## Benchmarks y rendimiento

Evaluacion retenida: 150 tareas easy/medium de QA de analisis de datos de 93 datasets, un intento estocastico por brazo y tarea, temperatura 0,8, effort bajo, hasta 10 turnos, 6.144 tokens de contexto y 1.024 de salida, base bf16 fijada y verificador offline. Intervalos del 95% con 10.000 remuestreos bootstrap por dataset fuente.

| Metrica | Base → adaptador local | Cambio pareado (IC 95%) |
|---|---:|---:|
| Tasa de exito | 72/150 → 100/150 | +18,67 pp (+10,27 a +26,97 pp) |
| Tokens logicos por tarea exitosa | 36.440 → 20.978 | −42,43% (−51,17% a −32,87%) |
| Tokens logicos totales | 2.623.700 → 2.097.814 | −20,04% (−27,29% a −11,34%) |
| Llamadas a herramientas originales en 65 exitos compartidos | 318 → 268 | −15,72% (−22,83% a −8,09%) |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) para este adaptador.

## Requisitos de hardware

- Hardware de referencia: Mac Studio con M4 Max y 128 GB de memoria unificada (entrenamiento y evaluacion).
- Pico de memoria del allocator MLX en entrenamiento principal: 35,464 GiB; maximo historico de recoleccion: 15,941 GiB. Son medidas del allocator para las cargas registradas; hay que dejar margen adicional para macOS y Docker.
- Inferencia: requiere base `LiquidAI/LFM3-1.7B-MLX-bf16` en bf16 mas el adaptador; el repo del adaptador ocupa 0,1 GB. No se especifica VRAM ni memoria unificada minima para inferencia en la informacion disponible.
- GPU: solo Apple Silicon via MLX; no hay soporte documentado para A100, H100 ni RTX 4090 en esta ficha.
- Despliegue: MLX Harness Adapter (backend `lfm3`), con `uv` y Docker en marcha; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles; la unica referencia temporal es la duracion del entrenamiento (7,2 horas para 400 rollouts y 45 actualizaciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Pi-MLX-30Task (este) | adaptador sobre 1,7B | no disponible | LoRA + GRPO agéntico, solo MLX | lfm1.0 | Hugging Face, revision v0.1.0 |
| LiquidAI/LFM3-1.7B-MLX-bf16 (base) | 1,7B | no disponible | modelo completo sin RL agéntico | lfm1.0 | Hugging Face |
| Variante de 14 tareas del mismo autor | adaptador sobre 1,7B | no disponible | mismo metodo con 14 tareas de entrenamiento | lfm1.0 | referenciada en la model card, sin URL directa en la informacion disponible |

No se dispone de datos de benchmarks de modelos comparables de terceros en la informacion proporcionada; la comparacion cuantitativa solo es posible contra el modelo base y la variante de 14 tareas, y unicamente en la metrica de tasa de exito del holdout descrito.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base exacto en la revision indicada; cargarlo sobre otra revision o cuantizacion invalida el adaptador.
- Dependencia de plataforma: disenado para MLX en Apple Silicon; no hay soporte documentado para CUDA ni para motores de inferencia habituales en servidores.
- Evaluacion limitada: el holdout son 150 tareas easy/medium de QA de analisis de datos; el rendimiento en otras tareas, idiomas o dominios no esta medido.
- Riesgo de sobreajuste al harness: el entrenamiento esta ligado a Pi 1.5.2, al formato de herramientas y al verificador de Harbor; fuera de ese entorno el comportamiento puede degradarse.
- Alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de fidelidad; al ser un modelo de 1,7B, la fiabilidad en razonamiento abierto es limitada.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- Idiomas: no se declaran idiomas soportados; el uso en castellano no esta verificado.
- Licencia lfm1.0: es una licencia propia del ecosistema LiquidAI con condiciones especificas; hay que revisar el archivo LICENSE antes de cualquier uso comercial.
- Reproducibilidad: los resultados dependen de semillas, temperatura 0,8 y del verificador offline; los intervalos de confianza son amplios en algunas metricas (hasta ±8 pp en la tasa de exito).
- Memoria: el entrenamiento requirio mas de 35 GiB en el allocator; en equipos con menos memoria unificada puede no ser viable reproducir el proceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brendanboyle/LFM3-1.7B-Pi-MLX-30Task
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-bf16
- Revision fijada del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-bf16/tree/52041852d5b5c59bfe120c075d2744ab97959d91
- Dataset de entrenamiento: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-train
- Revision fijada del dataset: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-train/tree/588744be728257abfb8d4984ec8fab2acbd1f7e1
- Repositorio MLX Harness Adapter: https://github.com/brendanboyle87/local-apple-harness-adapter
- Guia de instalacion: https://github.com/brendanboyle87/local-apple-harness-adapter/blob/ea8dc487b71cd7fd421f956cb8c4441ae1a9b2e4/README.md#install
- Preflight de memoria en Apple Silicon: https://github.com/brendanboyle87/local-apple-harness-adapter/blob/ea8dc487b71cd7fd421f956cb8c4441ae1a9b2e4/AGENTS.md#apple-silicon-memory-preflight
- Metodologia: https://github.com/brendanboyle87/local-apple-harness-adapter/blob/ea8dc487b71cd7fd421f956cb8c4441ae1a9b2e4/docs/methodology.md
- Protocolo de evaluacion: https://github.com/brendanboyle87/local-apple-harness-adapter/blob/ea8dc487b71cd7fd421f956cb8c4441ae1a9b2e4/docs/methodology.md#reference-experiment
- Procedencia del entrenamiento: https://github.com/brendanboyle87/local-apple-harness-adapter/blob/ea8dc487b71cd7fd421f956cb8c4441ae1a9b2e4/results/lfm3-pi-breadth/provenance.json
- Recuento de screening: https://github.com/brendanboyle87/local-apple-harness-adapter/blob/ea8dc487b71cd7fd421f956cb8c4441ae1a9b2e4/results/lfm3-pi-breadth/release-audit.json
- Manifest de entrenamiento congelado: https://github.com/brendanboyle87/local-apple-harness-adapter/blob/ea8dc487b71cd7fd421f956cb8c4441ae1a9b2e4/examples/smoldataenvs/breadth.jsonl
- Mediciones de recoleccion: https://github.com/brendanboyle87/local-apple-harness-adapter/blob/ea8dc487b71cd7fd421f956cb8c4441ae1a9b2e4/results/lfm3-pi-breadth/efficiency-pairs.jsonl
- Licencia: https://huggingface.co/brendanboyle/LFM3-1.7B-Pi-MLX-30Task/blob/v0.1.0/LICENSE

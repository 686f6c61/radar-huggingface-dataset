# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-groot16-s2

## Resumen

Este repositorio contiene un checkpoint de aprendizaje por refuerzo (RL) obtenido mediante GRPO con OpenRLHF sobre el modelo base Qwen3-4B-Instruct-2507. No es un modelo nuevo desde cero: es un ajuste por RL aplicado directamente sobre el modelo base, sin una fase previa de SFT (fine-tuning supervisado), segun indica la propia model card. El checkpoint se guardo en el paso global 74 de la ejecucion identificada como `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_groot16_s2` y el autor lo etiqueta como el mejor del run atendiendo a la metrica pass@8.

El modelo tiene 3.973.556.832 parametros (aproximadamente 3,97 mil millones, segun los tensores safetensors publicados) y esta orientado a la generacion de codigo. La senal de recompensa empleada durante el entrenamiento fue binaria de correccion de codigo: 1,0 si el programa generado supera los tests del problema y 0,0 en caso contrario. El entrenamiento y la validacion se hicieron sobre el llamado "frontier" cobalt-train con criterio <=2/64, es decir, problemas que el modelo base resolvia como maximo en 2 de 64 muestras bajo el escaneo de dificultad iid_canonical@64. El conjunto consta de 1833 problemas de entrenamiento y 112 de validacion reservados.

Se trata de un artefacto de investigacion mas que de un modelo listo para produccion: la licencia no esta declarada en el repositorio, no se publican idiomas soportados ni resultados de benchmarks, y el tamano total del repositorio (182,8 GB) es muy superior al de los pesos del modelo, lo que sugiere que incluye artefactos de entrenamiento. Es relevante ahora por su interes metodologico: documenta un experimento de RL directo sobre un modelo base sin semilla SFT, con penalizaciones anti-truncamiento tipo ProRL y DAPO, aplicado a generacion de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-4B-Instruct-2507). El tag `nemotron_h` aparece en los metadatos del repositorio, pero el modelo base declarado es Qwen3-4B |
| Parametros totales | 3.973.556.832 |
| Parametros activos | no disponible (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; heredada del base Qwen3-4B-Instruct-2507 |
| Tipos de cuantizacion | no se distribuyen cuantizaciones oficiales; pesos en safetensors (precision completa). Compatible con conversion externa a GGUF, AWQ o GPTQ (no oficial) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base Qwen3-4B-Instruct-2507 se publica bajo Apache 2.0) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 182,8 GB (incluye artefactos del run de RL, no solo pesos) |
| Libreria | transformers |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B-Instruct-2507: un transformer decoder-only denso de aproximadamente 4B parametros. No se trata, por tanto, de un modelo MoE ni de una arquitectura hibrida SSM, a pesar de que el repositorio incluye el tag `nemotron_h` entre sus metadatos, lo que constituye una discrepancia respecto al modelo base declarado. Lo que se publica aqui es el resultado de aplicar RL sobre esos pesos, no un rediseno arquitectonico.

El metodo de entrenamiento es GRPO (Group Relative Policy Optimization) con normalizacion de ventajas por grupo y sin penalizacion KL, implementado con OpenRLHF. La receta incluye varias particularidades: una penalizacion "stop-properly" que asigna recompensa de -1,0 a las muestras truncadas (un shaping anti-truncamiento de estilo ProRL), y una penalizacion DAPO de respuestas demasiado largas que aplica un termino aditivo que escala hasta -0,25 sobre los ultimos 1024 tokens antes del limite. Se usaron 8 muestras por prompt, tamano de lote de rollout y de entrenamiento de 128, un maximo de 4096 tokens nuevos por rollout, 2 episodios y una tasa de aprendizaje del actor de 1e-06 con planificador constante. El entrenamiento se realizo directamente sobre el modelo base, sin una semilla de SFT previa.

## Capacidades

- Generacion de codigo: es la capacidad objetivo del entrenamiento, optimizada mediante recompensa binaria de correccion contra tests.
- Razonamiento orientado a la resolucion de problemas de programacion: el reward se calcula sobre la ejecucion del programa generado.
- Generacion de texto general: heredada del modelo base Qwen3-4B-Instruct-2507.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada; el base Qwen3-4B-Instruct-2507 lo soporta, pero no se verifica en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking) o capacidades de vision/audio: no disponibles; el base es un modelo de texto.

## Casos de uso

- Generacion de funciones y fragmentos de codigo con verificacion automatica: el checkpoint esta optimizado para maximizar pass@8 en problemas con tests, por lo que encaja en pipelines donde el codigo generado se valida ejecutando una suite de pruebas.
- Investigacion en RL para generacion de codigo: sirve como referencia reproducible de un pipeline GRPO completo (OpenRLHF), con penalizaciones ProRL/DAPO documentadas, para comparar recetas de entrenamiento.
- Reproduccion de experimentos: al publicar la receta, el paso global y el nombre del run en Weights & Biases (proyecto `eaiexp-paper-final`), permite reproducir o auditar el experimento.
- Generacion asistida en entornos de investigacion con validacion por tests: util en tareas de sintesis de programas donde exista un oraculo de correccion.
- Base para fine-tuning posterior: al partir de Qwen3-4B con un ajuste RL ya aplicado, puede servir como punto de partida para experimentos aguas abajo de RL o SFT.
- Evaluacion de tecnicas anti-truncamiento: el checkpoint documenta un caso concreto de aplicacion de la penalizacion "stop-properly" y DAPO, interesante para quien investigue control de longitud y truncamiento en RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las metricas de evaluacion de este checkpoint no estaban disponibles en el log de entrenamiento ("Eval metrics at this checkpoint: not available in the train log"), salvo la afirmacion cualitativa de que es el mejor checkpoint del run por pass@8. No se aportan cifras de pass@8, HumanEval, MMLU ni ninguna otra metrica.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 los pesos ocupan aproximadamente 8 GB; sumando cache KV, se recomienda entre 10 y 12 GB de VRAM para contexto moderado. En int8 el peso baja a unos 4 GB y en int4 a alrededor de 2 a 3 GB.
- GPU recomendadas: para bf16 sin cuantizar, tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A10, L4, A100, H100). Para cuantizacion int4 o int8, GPUs de 6 a 8 GB pueden ser suficientes.
- Cabe en GPU de consumo: si. En bf16 en una RTX 3060 12 GB o superior; en cuantizacion de 4 bits incluso en GPUs de gama media con 6-8 GB.
- Opciones de despliegue: `transformers` (carga directa indicada en la model card con `revision="main"`), `vllm serve` (soportado segun la model card) y TGI. Para llama.cpp u Ollama seria necesaria una conversion previa a GGUF, no distribuida oficialmente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agurung/cobalt-seeded-rl-base-... (este) | 3,97B | no disponible | Transformer denso + RL GRPO para codigo | no disponible | HuggingFace (repo de investigacion) |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4B | 262.144 tokens (segun base) | Transformer denso, instrucciones generales | Apache 2.0 | HuggingFace |
| Qwen/Qwen2.5-Coder-3B-Instruct | ~3,09B | 32.768 tokens | Transformer denso, codigo | Apache 2.0 | HuggingFace |

La comparativa cuantitativa de rendimiento no es posible porque este checkpoint no publica benchmarks. Frente a la base Qwen3-4B-Instruct-2507, la diferencia es el ajuste por RL con recompensa de correccion de codigo; frente a Qwen2.5-Coder-3B-Instruct, se trata de un modelo de investigacion sin licencia declarada ni validacion publica, por lo que no es una alternativa directa de produccion.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, lo que impide determinar si el uso comercial esta permitido, aun cuando el modelo base sea Apache 2.0. Conviene contactar con el autor antes de cualquier uso comercial.
- Idiomas soportados no declarados: no se documenta el alcance multilingue de este checkpoint.
- Sin resultados de benchmarks publicados: la unica afirmacion de rendimiento es cualitativa ("mejor por pass@8 del run"), sin cifras verificables.
- Riesgo de sobreajuste al "frontier" concreto: el entrenamiento se hizo sobre el conjunto cobalt-train con criterio <=2/64, es decir, sobre un subconjunto de problemas que el base resolvia con dificultad. El comportamiento fuera de esa distribucion no esta caracterizado.
- Proceso RL sin SFT previo: al aplicar RL directamente sobre el base, el efecto sobre capacidades generales (instrucciones, conversacion, multilingue) no esta documentado y podria haberse degradado.
- Riesgo de alucinacion y de codigo incorrecto: pese a la recompensa binaria de correccion, un modelo de 4B puede generar codigo sintacticamente plausible pero incorrecto fuera de los dominios entrenados.
- Antiguedad y estado del run: las fechas de creacion y actualizacion (octubre de 2026) y la ausencia de iteraciones posteriores sugieren un artefacto puntual de un experimento de investigacion.
- Discrepancia de metadatos: el tag `nemotron_h` no corresponde al modelo base declarado (Qwen3-4B), lo que puede inducir a confusion en pipelines automatizados.
- Tamano del repositorio anormalmente grande (182,8 GB) frente al peso del modelo, probablemente por artefactos de entrenamiento, lo que complica su descarga y gestion.

## Enlaces

- HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-groot16-s2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Weights & Biases: proyecto `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k-ep2_ncp5-n3nc-groot16-s2` (enlace directo no disponible)
- Otros enlaces (papers, blogs, repos, demos): no disponible

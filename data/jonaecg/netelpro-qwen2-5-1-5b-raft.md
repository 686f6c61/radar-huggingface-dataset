# JonaECG/netelpro-qwen2.5-1.5b-raft

## Resumen

El modelo `netelpro-qwen2.5-1.5b-raft` es un fine-tuning del modelo `Qwen/Qwen2.5-1.5B-Instruct`, desarrollado por JonaECG, que aplica la técnica RAFT (Reinforcement Learning with Verifiable Rewards) sobre un lenguaje de programación verificado llamado Netelpro. En este lenguaje, la recompensa es totalmente objetiva: el programa generado debe compilar y superar 20 casos de prueba. Se trata de un enfoque RLVR (Reinforcement Learning with Verifiable Rewards) sin recompensas aprendidas ni nominales.

El modelo se entrenó en 3 rondas de RAFT sobre un conjunto de 20 tareas de entrenamiento, utilizando LoRA con r=16 y aproximadamente 18,5 millones de parámetros entrenables. La arquitectura es un transformer estándar (base Qwen2.5-1.5B), con un total de 1.543.714.304 parámetros según el repositorio. La información disponible no especifica la longitud de contexto ni los idiomas soportados, pero al estar basado en Qwen2.5-1.5B-Instruct, hereda su arquitectura. Su relevancia radica en demostrar que un modelo pequeño puede aprender reglas formales estrictas mediante recompensas verificables, manteniendo el rendimiento incluso tras la cuantización Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (qwen2.5-1.5b-instruct.Q4_K_M.gguf) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-1.5B-Instruct` y se entrena mediante LoRA (r=16), con ~18,5 millones de parámetros entrenables y pérdida sobre la secuencia completa. El entrenamiento se realizó en Google Colab con una GPU T4, aplicando 3 rondas de RAFT sobre las 20 tareas de entrenamiento del lenguaje Netelpro. En cada ronda se cosecharon ejemplos verificados (9, 10 y 8 respectivamente), es decir, programas que compilaban y pasaban los 20 casos de prueba. La recompensa no es un modelo aprendido ni una señal nominal, sino una comprobación binaria de compilación y ejecución de tests.

La evaluación se realizó sobre un conjunto hold-out explícito de 5 tareas OOD (`power_int`, `nth_element`, `string_to_int`, `gcd_pair`, `list_sum`), midiendo `pass@8` con temperatura 0.8 y 20 casos de prueba por tarea. No se menciona el uso de RLHF ni DPO; el enfoque es exclusivamente RLVR con recompensa verificable.

## Capacidades

- Generación de programas en Netelpro que deben compilar y pasar 20 casos de prueba, siguiendo el formato de prompt `build_prompt` del autor (especificación del lenguaje + few-shots + descripción de la tarea).
- Especialización en tareas OOD concretas como `power_int`, `nth_element`, `string_to_int`, `gcd_pair` y `list_sum`.
- Inferencia local mediante Ollama, usando el archivo `Modelfile` incluido en el repositorio.
- Cuantización Q4_K_M disponible para ejecución en recursos limitados.
- No se especifican capacidades de tool calling, agentes, razonamiento multi-step ni soporte multilingüe en la información disponible.

## Casos de uso

- **Generación automática de programas Netelpro**: el modelo recibe la especificación del lenguaje, ejemplos few-shot y la descripción de la tarea, y produce código que debe compilar y superar los tests. Es adecuado porque su entrenamiento se basa exactamente en ese formato de prompt.
- **Verificación objetiva en pipelines de desarrollo**: al integrarse con el compilador y el runner de tests de Netelpro, el modelo puede generar candidatos que se validan automáticamente, lo que lo hace útil para sistemas de generación de código con recompensa binaria.
- **Apoyo en entornos educativos**: puede servir como generador de soluciones de referencia para ejercicios de Netelpro, ya que las tareas de entrenamiento y evaluación son problemas algorítmicos acotados.
- **Investigación en RLVR**: el modelo es un caso práctico de cómo un modelo pequeño puede mejorar mediante recompensas verificables en un lenguaje formal, útil para estudios de alineación y aprendizaje por refuerzo.
- **Pruebas de robustez de cuantización**: el autor reporta que la versión Q4_K_M obtiene un 80% pass@8 en la re-evaluación local, lo que permite validar el efecto de la cuantización en modelos especializados.
- **Prototipado rápido de funciones específicas**: para tareas como `power_int` o `gcd_pair`, el modelo puede generar implementaciones correctas que pasan los tests, acelerando el desarrollo en dominios restringidos.

## Benchmarks y rendimiento

La información disponible incluye una evaluación del autor sobre el split OOD de 5 tareas. Se presenta la tabla tal como se publicó:

| Stage | OOD pass@8 |
|---|---|
| Baseline (untrained) | 0% (0/5 tareas) |
| After round 0 | 20% (1/5) |
| After round 1 | 40% (2/5) |
| After round 2 | 40% (2/5) |
| GGUF q4_k_m (re-evaluación local) | 80% (4/5) |

Nota: la métrica es `pass@8`, no `pass@1`, y el tamaño de la muestra OOD es n=5. El autor indica que el 40% se midió en fp16, mientras que el 80% corresponde a una re-evaluación local del GGUF Q4_K_M con Ollama, usando el mismo verificador de 20 casos, temperatura 0.8 y un límite de 256 tokens.

## Requisitos de hardware

- VRAM estimada: no disponible. El archivo GGUF Q4_K_M tiene un tamaño de repo de 1.0 GB, lo que sugiere que la inferencia es ligera, pero no se proporcionan cifras exactas de consumo de VRAM.
- GPU recomendadas: no disponible. El entrenamiento se realizó en Colab T4 (16 GB VRAM), pero la inferencia con Q4_K_M es mucho menos exigente.
- Compatibilidad con GPU consumer: no hay datos oficiales, aunque por el tamaño del archivo (1.0 GB) es plausible ejecutarlo en GPUs consumer con 4-6 GB de VRAM.
- Opciones de despliegue: Ollama (recomendado por el autor mediante `Modelfile`), y llama.cpp al tratarse de un archivo GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | OOD pass@8 |
|---|---|---|---|---|
| `netelpro-qwen2.5-1.5b-raft` | 1.543.714.304 | No disponible | No disponible | 80% (GGUF Q4_K_M, re-evaluación local) |
| `Qwen/Qwen2.5-1.5B-Instruct` (base) | 1.54B | No disponible | No disponible | 0% (sin entrenar) |

No se dispone de datos comparables con otros modelos de la misma categoría en la información proporcionada. El modelo hermano `JonaECG/netelpro-qwen2.5-1.5b-honest` existe en HuggingFace, pero no se proporcionan datos de rendimiento.

## Limitaciones y advertencias

- La métrica principal es `pass@8`, no `pass@1`: los resultados no representan el rendimiento con una sola muestra.
- El conjunto OOD es de solo 5 tareas, por lo que la granularidad es del 20%: el 40% significa que solo se resolvieron 2 tareas.
- En la evaluación principal, el sampler no estaba seedeado, de modo que baseline y final no son runs pareados, aunque el margen de 40 puntos mitiga parcialmente esta limitación.
- El 40% se midió en fp16; el 80% del GGUF Q4_K_M proviene de una re-evaluación local no oficial, aunque el autor indica que la cuantización no degradó el comportamiento.
- Se observó un plateau en la ronda 2, porque el SFT de cada ronda usó únicamente la cosecha de esa ronda, sin acumular un pool de ejemplos.
- La licencia no está especificada, por lo que no se puede confirmar si el uso comercial está permitido.
- Los idiomas soportados no se indican; el modelo está orientado a Netelpro, un lenguaje formal, no a lenguaje natural.
- No se disponen de datos sobre sesgos, riesgo de alucinación ni comportamiento fuera de las tareas Netelpro.

## Enlaces

- HuggingFace: https://huggingface.co/JonaECG/netelpro-qwen2.5-1.5b-raft
- Repositorio Netelpro: https://github.com/jona2428/netelpro
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelo relacionado del autor: https://huggingface.co/JonaECG/netelpro-qwen2.5-1.5b-honest

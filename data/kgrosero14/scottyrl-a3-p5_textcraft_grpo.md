# kgrosero14/scottyrl-a3-p5_textcraft_grpo

## Resumen

`kgrosero14/scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 sobre el modelo base `Qwen/Qwen3.5-4B`, publicado como el checkpoint de la práctica 5 (`p5_textcraft_grpo`) dentro del marco de trabajo scottyrl y de la asignatura 11-768 (AI Agents) de la Universidad Carnegie Mellon. No es un modelo autónomo: es un conjunto de pesos PEFT que debe cargarse sobre el modelo base para poder inferir.

El adaptador está especializado en tareas de agente sobre el entorno TextCraft-Synth, un dominio de resolución de recetas en el que el modelo debe encadenar acciones y consultar herramientas en varios pasos. El nombre de la ejecución (`_grpo`) sugiere un ajuste con Group Relative Policy Optimization, aunque la model card no lo confirma explícitamente; el autor tampoco documenta el número de tokens de entrenamiento, la composición del dataset ni la licencia.

La relevancia de esta ficha es acotada: se trata de un artefacto académico con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados en la información disponible. Su interés práctico está en servir como ejemplo reproducible de un pipeline PEFT + vLLM con `--enable-lora --max-lora-rank 32` y como material de estudio de RL aplicado a agentes, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre un transformer `Qwen/Qwen3.5-4B`; la arquitectura interna del modelo base no se detalla en la información disponible |
| Parametros totales | No disponible para el adaptador. El modelo base se identifica como `Qwen3.5-4B`, lo que sugiere ~4.000 millones de parámetros en el base, sin confirmación en la documentación |
| Parametros activos | No aplica: no se describe como MoE en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Los pesos del adaptador se distribuyen en safetensors; la cuantización aplicable es la del modelo base al que se acople |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (formato PEFT/LoRA, `library_name: peft`) |
| Rango y tipo de adaptador | LoRA, rango 32 |
| Framework de entrenamiento | scottyrl (configuración `configs/p5_textcraft_grpo.yaml`) |
| Tarea de entrenamiento | Agente sobre TextCraft-Synth; el sufijo `grpo` sugiere aprendizaje por refuerzo con GRPO (no confirmado en la model card) |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-10-26 |
| Commit de referencia | `88d1b1fa2aea58938d6d251847ce5559c4ac6558` |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA, r = 32) acoplado a `Qwen/Qwen3.5-4B`. La model card no describe la arquitectura del modelo base (número de capas, tipo de atención, uso de decodificación especulativa u otras innovaciones), por lo que cualquier detalle al respecto queda fuera de esta ficha. El adaptador se exportó desde el directorio de ejecución `/data/user_data/kroseroj/Agents/assignment-3/runs/p5_adapter` y se generó con el framework scottyrl, que gestiona el ciclo de entrenamiento y la exportación a PEFT.

En cuanto al procedimiento de ajuste, el nombre de la ejecución (`p5_textcraft_grpo`) apunta a un entrenamiento con GRPO sobre el entorno TextCraft-Synth, pero no se documentan el número de tokens, la composición del dataset, la existencia de una fase previa de SFT, ni hiperparámetros como alpha, dropout o tasa de aprendizaje. Tampoco se indica si hubo mezcla con datos generales para mitigar el olvido catastrófico. Todos estos datos deben considerarse no disponibles.

## Capacidades

- Especialización en tareas de agente sobre TextCraft-Synth: resolución de recetas mediante secuencias de acciones y consultas al entorno.
- Razonamiento multi-paso orientado a objetivos, presumiblemente reforzado por la fase de RL; no se detalla la profundidad de planificación soportada.
- Herencia de las capacidades del modelo base `Qwen/Qwen3.5-4B` en generación de texto, código y matemáticas, sin que se documente su magnitud.
- Soporte de tool calling: no documentado explícitamente para el adaptador; el dominio de entrenamiento implica interacción con acciones del entorno, pero no se especifica el esquema de herramientas.
- Capacidades multilingües: no disponibles.
- Modo de razonamiento explícito o `thinking mode`: no disponible.
- Visión, audio u otras modalidades: no disponible.
- El adaptador no funciona de forma aislada; requiere cargar el modelo base.

## Casos de uso

- Reproducción de la evaluación académica: servir el adaptador con vLLM (`--enable-lora --max-lora-rank 32 --lora-modules a3=...`) y ejecutar `scripts/evaluate_checkpoint.py` con `--k 4` sobre las particiones de validación medium y hard de TextCraft-Synth, para replicar las métricas de la práctica.
- Estudio comparativo de métodos de RL para agentes: al tener un checkpoint entrenado con GRPO, permite contrastar su comportamiento frente a variantes de SFT o DPO sobre el mismo modelo base y el mismo entorno.
- Punto de partida para nuevos ajustes: el adaptador puede servir como inicialización para un segundo ciclo de LoRA en dominios de planificación con reglas explícitas (composición de objetos, artesanía en videojuegos, gestión de inventario).
- Docencia y formación técnica: ejemplo mínimo y reproducible de un pipeline PEFT completo, desde el entrenamiento con un framework de RL hasta el despliegue con vLLM y la evaluación por script.
- Pruebas de despliegue multi-adaptador: útil para validar la configuración de LoRA serving de vLLM, incluida la comprobación de que `--max-lora-rank` cubre el rango 32 del adaptador, en un escenario con varios adaptadores servidos desde una sola instancia del modelo base.
- Investigación en robustez de agentes: permite medir cómo degrada el rendimiento en las particiones hard cuando el número de pasos o la longitud de las instrucciones crece, con un coste de inferencia bajo por tratarse de un modelo de ~4B.
- Integración en un banco de pruebas de agentes con herramientas: el adaptador puede conectarse a un entorno simulado propio que replique la interfaz de TextCraft, para evaluar políticas de exploración y planificación antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe el protocolo de evaluación que aplican los correctores del curso: servir el adaptador con vLLM y ejecutar `scripts/evaluate_checkpoint.py --k 4` sobre las particiones de validación medium y hard de TextCraft-Synth, sin incluir cifras de ningún tipo.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB y no requiere VRAM significativa; el coste real lo determina el modelo base `Qwen/Qwen3.5-4B`.
- Estimación orientativa para el modelo base de ~4B parámetros: en fp16, alrededor de 8-9 GB solo en pesos, más caché KV; en cuantización de 8 bits, en torno a 4-5 GB; en 4 bits, aproximadamente 2,5-3 GB. Son estimaciones de ingeniería a partir del tamaño, no cifras publicadas por el autor.
- GPU de datacenter: A100 (40 o 80 GB), H100, L40S o A10G son suficientes con holgura para servir el base junto con el adaptador y varios clientes concurrentes.
- GPU de consumo: el modelo base de ~4B cabe en tarjetas con 8-12 GB de VRAM en cuantización de 4 u 8 bits (RTX 3060 Ti, RTX 4060 Ti, RTX 4070 y superiores); en fp16 requiere 12-16 GB, por lo que encajaría en RTX 4080, RTX 4090 o RTX 5090.
- Despliegue recomendado por el autor: vLLM con soporte LoRA (`vllm serve Qwen/Qwen3.5-4B --enable-lora --max-lora-rank 32 --lora-modules a3=kgrosero14/scottyrl-a3-p5_textcraft_grpo`).
- Alternativas de despliegue no documentadas para este adaptador: llama.cpp, Ollama o TGI requerirían fusionar el adaptador con el base (merge) o disponer de soporte LoRA compatible; no hay instrucciones del autor al respecto.
- Latencia y throughput: no disponibles. Al tratarse de un base de ~4B con adaptador de rango 32, el sobrecoste del adaptador frente al modelo base desnudo es marginal en la práctica, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kgrosero14/scottyrl-a3-p5_textcraft_grpo` (este adaptador) | LoRA r=32 sobre base de ~4B | No disponible | Sin benchmarks publicados | No disponible | HuggingFace, 0 descargas |
| `Qwen/Qwen3.5-4B` (modelo base, sin adaptador) | ~4B | No disponible en la información proporcionada | No disponible | No disponible | HuggingFace |
| Otros adaptadores LoRA académicos para entornos de agente | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable. La única comparación defendible es cualitativa: este adaptador añade especialización en TextCraft-Synth sobre el base, a cambio de un posible estrechamiento de capacidades generales por sobreajuste al dominio de entrenamiento.

## Limitaciones y advertencias

- Licencia no especificada: no puede asumirse ningún permiso de uso comercial. Es imprescindible contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue productivo.
- Artefacto académico sin mantenimiento declarado: cero descargas y cero likes, sin documentación de versiones posteriores ni issues.
- Ausencia total de benchmarks: no hay evidencia pública del rendimiento del adaptador ni siquiera en su dominio objetivo.
- Riesgo de sobreajuste al dominio: al ser un ajuste LoRA de rango 32 sobre una única tarea de agente, es esperable una degradación de las capacidades generales del base (olvido catastrófico), aunque no se cuantifica.
- Dependencia estricta del modelo base: cualquier cambio, actualización o retirada de `Qwen/Qwen3.5-4B` invalida el adaptador; además, el identificador `Qwen3.5-4B` no está verificado en la documentación disponible.
- Riesgo de alucinación: inherente a los modelos de ~4B y potencialmente agravado en tareas de planificación con estado, donde una acción inexistente invalida la secuencia completa. No se documentan mitigaciones.
- Idiomas no declarados: se desconoce si el adaptador conserva competencia multilingüe o si el entrenamiento la ha reducido al inglés.
- Contexto no documentado: se desconoce la ventana efectiva, lo que impide planificar tareas con historiales largos de interacción.
- Reproducibilidad limitada: la configuración de entrenamiento (`configs/p5_textcraft_grpo.yaml`) y los datos no se incluyen en el repositorio, solo se referencian.
- Sin garantías de soporte: no hay contacto de mantenimiento, ni demo, ni espacio asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kgrosero14/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del framework scottyrl: no disponible en la información proporcionada
- Paper o blog del método GRPO: no disponible en la información proporcionada
- Documentación de PEFT: no disponible en la información proporcionada (no se han encontrado enlaces en la búsqueda)
- Demo o espacio asociado: no disponible

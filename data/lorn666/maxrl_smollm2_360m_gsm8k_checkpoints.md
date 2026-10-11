# lorn666/maxrl_smollm2_360m_gsm8k_checkpoints

## Resumen

`lorn666/maxrl_smollm2_360m_gsm8k_checkpoints` no es un modelo único, sino una colección de checkpoints intermedios y finales resultantes de reproducir el experimento SmolLM2-360M-Instruct sobre GSM8K descrito en el artículo *Maximum Likelihood Reinforcement Learning* (MaxRL; Tajwar, Zeng et al., arXiv:2602.02710, secciones 6.3 y apéndice J). El punto de partida es `HuggingFaceTB/SmolLM2-360M-Instruct`, un transformer decoder-only de 360 millones de parámetros, y sobre él se aplica un entrenamiento de refuerzo con recompensa binaria de corrección matemática verificado con Math-Verify.

Cada carpeta `global_step_N/` del repositorio es un modelo de Hugging Face independiente, fusionado desde el checkpoint de entrenamiento FSDP y guardado en safetensors bf16 cada 50 pasos de RL. El repositorio ocupa 18,1 GB precisamente porque acumula todos esos checkpoints, no porque el modelo tenga un tamaño desmesurado.

Su relevancia es doble: por un lado, documenta de forma granular la curva de aprendizaje de un algoritmo de RL sobre un modelo pequeño (de 6,8 % a 33,4 % de pass@1 en GSM8K-Platinum); por otro, sirve como material de reproducibilidad para investigar MaxRL, un objetivo que prescinde de ratio, clipping y pesos de importancia, y que normaliza la pérdida por el total de tokens de respuesta del paso completo en lugar de por micro-lote. Está liberado bajo licencia Apache 2.0 y solo declara inglés como idioma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-360M-Instruct); no se detalla en la model card más allá del modelo base |
| Parámetros totales | 360 millones (modelo base SmolLM2-360M-Instruct) |
| Parámetros activos | No aplica (no es MoE; no disponible en la información proporcionada) |
| Longitud de contexto | No disponible. Durante el entrenamiento se limita el prompt a 512 tokens y la respuesta a 2048 tokens |
| Tipos de cuantización | No disponible (los pesos publicados están en bf16 safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16), fusionados desde checkpoints FSDP; un subdirectorio por checkpoint (`global_step_N/`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, un transformer decoder-only de 360M parámetros. Lo diferencial es el procedimiento de ajuste: se parte de `SmolLM2-360M-Instruct` y se entrena con MaxRL sobre el conjunto de entrenamiento de GSM8K (7.473 problemas), evaluando sobre GSM8K-Platinum (1.209 problemas). La ventaja utilizada es `A = (r - mean) / (mean + 1e-6)`, calculada sobre las 128 muestras (rollouts) generadas para cada prompt. Cada paso procesa 256 prompts con 128 rollouts cada uno, es decir, 32.768 rollouts por paso, y aplica una única actualización totalmente on-policy, sin ratio, sin clipping y sin pesos de importancia. No hay términos de KL ni de entropía.

Los hiperparámetros siguen el script `smollm/smollm.sh` del repositorio oficial de MaxRL (tabla 4 del artículo): optimizador AdamW con learning rate constante de 1e-5, weight decay 0.01 y grad clip 1.0; longitud máxima de prompt y respuesta de 512 y 2048 tokens respectivamente, con recompensa 0 para las respuestas que alcanzan los 2048 tokens; muestreo de rollouts con temperatura 1.0; y 1.500 pasos de entrenamiento, equivalentes a unas 51 épocas. La recompensa es la corrección binaria verificada con Math-Verify contra la respuesta de GSM8K. La implementación usa verl con entrenamiento FSDP2 y rollouts con vLLM sobre 8 GPU NVIDIA GH200 repartidas en 2 nodos. La única desviación declarada respecto al código original de MaxRL es que la pérdida de policy gradient se normaliza por el número total de tokens de respuesta del paso completo (sumando todas las GPU y micro-lotes) en lugar de promediarse por micro-lote.

El formato de prompt usado tanto en entrenamiento como en evaluación es la pregunta seguida de la instrucción `" Let's think step by step and output the final answer within \boxed{}."`, aplicando la plantilla de chat del propio modelo.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instructivo base.
- Razonamiento matemático de tipo chain-of-thought: el entrenamiento refuerza explícitamente la resolución paso a paso con la respuesta final dentro de `\boxed{}`.
- Resolución de problemas aritméticos verbales del estilo GSM8K (problemas de primaria con varios pasos).
- Capacidad de autoverificación implícita por muestreo múltiple: la diferencia entre pass@1 y pass@32 en la tabla de validación (por ejemplo, 0,334 frente a 0,628 en el paso 1200) indica que, con varios intentos, el modelo alcanza soluciones correctas aunque no en el primero.
- Formato de chat: soporta `apply_chat_template` de Hugging Face con el prompt de sistema por defecto de SmolLM.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no; la model card solo declara inglés.
- Capacidades especiales (visión, audio, modo de pensamiento explícito): no disponible en la información proporcionada; el "step by step" es una convención de prompt, no un modo de razonamiento separado.

## Casos de uso

- Evaluación y reproducibilidad de MaxRL: cada checkpoint permite comparar curvas de aprendizaje paso a paso y verificar los resultados del artículo sin reentrenar, ya que se publican políticas intermedias cada 50 pasos.
- Investigación sobre RL sin clipping ni pesos de importancia: este repositorio es un punto de partida directo para estudiar cómo se comporta un objetivo totalmente on-policy en modelos pequeños y en tareas con recompensa verificable.
- Generación de conjuntos de datos sintéticos de razonamiento matemático: los checkpoints avanzados pueden muestrear cadenas de razonamiento con respuesta en `\boxed{}`, útiles para destilación o para filtrado por corrección automática.
- Tutoría matemática básica en inglés: el modelo está entrenado para explicar el razonamiento paso a paso sobre problemas aritméticos verbales, con la limitación de que su tasa de acierto a la primera es de aproximadamente un tercio en GSM8K-Platinum.
- Estudio de escalado de RL: comparar este experimento de 360M con las variantes mayores del mismo artículo permite analizar la relación entre tamaño de modelo y ganancia obtenida por MaxRL.
- Pruebas de robustez y análisis de fallos: las políticas intermedias (por ejemplo, el paso 900, con 0,329 de pass@1 y 0,657 de pass@32) permiten estudiar modos de error y colapso de diversidad durante el entrenamiento.
- Prototipado en hardware modesto: al tener 360M parámetros, cualquiera de los checkpoints puede cargarse para experimentar con pipelines de RL, verificación de recompensas o decodificación antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de validación sobre GSM8K-Platinum con temperatura 0,6, top-p 0,95 y 32 muestras por pregunta. `pass@1` es la precisión media sobre esas 32 muestras y `pass@32` es la estimación bootstrap `best@32` de verl.

| Paso | pass@1 | pass@32 |
| ---: | ---: | ---: |
| 0 (modelo base) | 0,068 | 0,467 |
| 100 | 0,168 | 0,582 |
| 200 | 0,196 | 0,628 |
| 300 | 0,233 | 0,654 |
| 400 | 0,263 | 0,661 |
| 500 | 0,282 | 0,670 |
| 600 | 0,292 | 0,684 |
| 700 | 0,317 | 0,677 |
| 800 | 0,314 | 0,671 |
| 900 | 0,329 | 0,657 |
| 1000 | 0,328 | 0,647 |
| 1100 | 0,328 | 0,616 |
| 1200 | 0,334 | 0,628 |

No hay resultados publicados de otros benchmarks (MMLU, HumanEval, GSM8K test estándar, etc.) en la información disponible.

## Requisitos de hardware

- Entrenamiento reportado por el autor: 8 GPU NVIDIA GH200 en 2 nodos, con rollouts generados mediante vLLM y entrenamiento FSDP2.
- VRAM para inferencia en bf16/fp16: aproximadamente 0,7-0,8 GB solo de pesos, más caché KV y activaciones; en la práctica cabe con holgura en cualquier GPU con 2 GB o más. Estimación a partir del número de parámetros, no publicada por el autor.
- VRAM con cuantización a 8 bits: del orden de 0,4-0,5 GB. Estimación, no publicada por el autor.
- VRAM con cuantización a 4 bits: del orden de 0,2-0,3 GB. Estimación, no publicada por el autor.
- GPU consumer: cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en iGPU con memoria compartida suficiente.
- CPU: la inferencia en CPU es viable por el tamaño del modelo, siempre que se use un formato adecuado; no se documenta soporte GGUF en este repositorio.
- Opciones de despliegue: el único método documentado en la model card es `transformers` (`AutoModelForCausalLM.from_pretrained` con `subfolder=global_step_N` y `dtype="bfloat16"`). No se documentan vLLM, llama.cpp, Ollama ni TGI para estos checkpoints; para usarlos habría que convertir los pesos, ya que no se publican ficheros GGUF.
- Latencia y throughput: no disponible en la información proporcionada.
- Nota de almacenamiento: el repositorio completo ocupa 18,1 GB por acumular todos los checkpoints; conviene descargar solo el subdirectorio del paso deseado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K-Platinum (pass@1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| maxrl_smollm2_360m_gsm8k (paso 1200) | 360M | No disponible (entrenado con prompt de 512 y respuesta de 2048 tokens) | 0,334 (pass@32 de 0,628) | Apache 2.0 | Hugging Face, un subdirectorio por checkpoint |
| SmolLM2-360M-Instruct (modelo base, paso 0) | 360M | No disponible en la información proporcionada | 0,068 (pass@32 de 0,467) | Apache 2.0 | Hugging Face |
| Otras variantes de SmolLM2 (por ejemplo, 1.7B) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativas de tamaño similar de otros desarrolladores | No disponible | No disponible | No disponible | No disponible | No disponible |

Los dos únicos puntos de comparación con datos verificables en la información proporcionada son el propio modelo ajustado y su base sin RL, entre los que se observa un incremento de pass@1 de 0,068 a 0,334 y de pass@32 de 0,467 a 0,628 en el mejor tramo registrado.

## Limitaciones y advertencias

- Es un repositorio de checkpoints, no un modelo final único: el rendimiento depende del paso elegido, y todos los pasos intermedios tienen menor precisión que el tramo 900-1200.
- Entrenado exclusivamente sobre GSM8K (7.473 problemas), lo que puede provocar sobreajuste a la plantilla de GSM8K y al formato de respuesta `\boxed{}`; la evaluación se hace sobre GSM8K-Platinum, un conjunto relacionado, no sobre benchmarks independientes.
- Sesgos conocidos: no se documentan análisis de sesgo, toxicidad o seguridad en la información disponible; el ajuste con RL sobre una única tarea matemática no corrige sesgos heredados del modelo base.
- Riesgo de alucinación: la recompensa binaria de corrección matemática no penaliza cadenas de razonamiento incorrectas que acaben en la respuesta correcta, ni garantiza coherencia del razonamiento; además, la mejora de pass@32 frente a pass@1 indica que muchas respuestas individuales son incorrectas.
- Limitación de idioma: solo se declara inglés, tanto en el modelo base como en el ajuste.
- Restricciones de licencia: Apache 2.0, por lo que se permite uso comercial, pero hay que respetar las condiciones del modelo base `HuggingFaceTB/SmolLM2-360M-Instruct` y de los conjuntos de datos derivados de GSM8K y GSM8K-Platinum.
- Caveat de producción: el tamaño de 360M limita la calidad en tareas abiertas; no hay datos de tool calling, agentes ni despliegue con servidores de inferencia de alto rendimiento para estos checkpoints.
- El repositorio incluye pesos bf16 sin versiones cuantizadas publicadas, lo que obliga a convertir si se quiere desplegar en formatos optimizados.
- Los pasos posteriores al 1250 y sus evaluaciones no estaban disponibles en el momento de redactar esta ficha; el autor indica que se añadirán al terminar el entrenamiento.
- Los datos de fecha del repositorio (creado el 11 de octubre de 2026) y la referencia del artículo (ICML 2026) corresponden a la información publicada; conviene verificarlos en la fuente original.

## Enlaces

- Página de Hugging Face del repositorio: https://huggingface.co/lorn666/maxrl_smollm2_360m_gsm8k_checkpoints
- Artículo MaxRL (arXiv:2602.02710): https://arxiv.org/abs/2602.02710
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/openai/gsm8k
- Conjunto de datos de evaluación: https://huggingface.co/datasets/madrylab/gsm8k-platinum
- Repositorio oficial de MaxRL y proyecto verl: mencionados en la model card sin URL asociada; no disponibles en la información proporcionada.

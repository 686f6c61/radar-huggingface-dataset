# OpenRAL/rskill-topreward_qwen3vl_4b-any-general-nf4

## Resumen

rskill-topreward_qwen3vl_4b-any-general-nf4 es un modelo de recompensa (reward model) para robótica empaquetado como rSkill de OpenRAL, construido sobre el método TOPReward (arXiv 2602.19313, *Token Probabilities as Hidden Zero-Shot Rewards for Robotics*) y sobre el backbone Qwen3-VL-4B-Instruct. No se trata de un modelo entrenado desde cero: es una cuantización NF4 (4 bits, bitsandbytes) del VLM Qwen3-VL-4B-Instruct, utilizada en modo zero-shot para estimar el progreso y el éxito de una trayectoria de manipulación robótica a partir de vídeo RGB y una instrucción de tarea.

El problema que resuelve es concreto: un modelo VLA (visión-lenguaje-acción) emite acciones pero no sabe decir si ha terminado o si está atascado. TOPReward cubre ese hueco preguntando a un VLM genérico cuán probable es que la instrucción sea verdadera dado el vídeo de rollout, y leyendo `log P("True")` como señal de recompensa. No requiere entrenar una cabeza de recompensa ni etiquetas por tarea, y es agnóstico al embodiment.

El modelo se ejecuta en paralelo a la política VLA, es consultado bajo demanda por el "Reasoner" del runtime OpenRAL y su salida es únicamente advisory: nunca acciona motores ni bloquea el control. Su relevancia actual radica en que ofrece estimación de progreso zero-shot en hardware de consumo (3,13 GB de VRAM pico en una RTX 4070 Laptop de 8 GB), con licencia Apache-2.0 y con un tamaño de 4.437.815.808 parámetros en pesos safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal visión-lenguaje (Qwen3-VL, `Qwen3VLForConditionalGeneration`), cuantizado NF4 |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (4 bits, bitsandbytes, double-quant, cómputo en bf16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 (método upstream MIT; pesos Qwen3-VL-4B-Instruct Apache-2.0) |
| Formato de pesos | safetensors (checkpoint pre-cuantizado NF4) |

## Arquitectura y entrenamiento

El modelo envuelve `transformers`' `Qwen3VLForConditionalGeneration` mediante `lerobot.rewards.topreward.TOPRewardModel`. Construye un prompt de la forma `<video> The above video shows a robot manipulation trajectory that completes the following task: <instruction> Decide whether the above statement is True or not. The answer is: True`, aplica label-masking a todos los tokens salvo el final y devuelve `log P("True" | video, instruction)` como un escalar a nivel de clip.

No hay entrenamiento ni ajuste fino propio: el backbone es Qwen3-VL-4B-Instruct zero-shot, sin pesos afinados. La estimación de progreso por fotograma se obtiene mediante el barrido de prefijos nativo de lerobot (`lerobot.rewards.topreward.compute_rabc_weights`): se puntúan prefijos crecientes de la trayectoria `frames[0:k]` en una serie de longitudes ancla, se normalizan min-max los log-probabilidades crudos por episodio y se interpola de vuelta a un valor por fotograma, produciendo una curva de progreso en `[0, 1]`. Cada forward de prefijo se limita a 8 fotogramas (recortados uniformemente por la cola) para acotar la activación de vídeo de Qwen3-VL en GPUs de 8 GB. La cuantización NF4 se entrega como checkpoint pre-cuantizado en `weights_uri`, y el `TOPRewardModel` de lerobot lo carga directamente en 4 bits desde su `config.json`.

## Capacidades

- Estimación de progreso de tarea por fotograma, normalizada en `[0, 1]`, a partir de vídeo RGB y una instrucción de tarea.
- Detección de éxito/fracaso de tarea a nivel de clip mediante el escalar `log P("True")`.
- Funcionamiento zero-shot: no requiere cabeza de recompensa entrenada ni etiquetas por tarea.
- Agnóstico al embodiment (`embodiment: any`): transferible entre plataformas y tareas.
- Monitorización en paralelo a una política VLA, consultado bajo demanda por el Reasoner.
- Salida advisory-only: nunca acciona ni bloquea motores.
- Entrada de vídeo con ventana RGB rodante `(T, 3, H, W)` en uint8/float y instrucción de tarea en texto (obligatoria).
- Compatible con `transformers` 5.x sin fijar una versión inferior.

## Casos de uso

- Monitorización de progreso en manipulación de sobremesa: el modelo puntúa cada fotograma del rollout y produce una curva de progreso `[0, 1]` que el Reasoner usa para saber si la política avanza o se ha atascado, sin detector de éxito escrito a mano.
- Detección de éxito en tareas de tipo "pick and place": a partir del escalar `log P("True")` a nivel de clip se decide si la instrucción se ha completado, útil para cerrar episodios o disparar replanificación.
- Replanificación en el bucle de control: al ejecutarse en paralelo al VLA y no accionar motores, su señal alimenta la escalera de replanificación de OpenRAL cuando el progreso se estanca.
- Evaluación de políticas en simulación (por ejemplo LIBERO): el modelo permite medir progreso y éxito sobre demos grabadas sin entrenar un reward específico por tarea.
- Transferencia entre embodiments: al ser agnóstico al embodiment, sirve para monitorizar brazos y plataformas distintas con el mismo checkpoint, reduciendo el trabajo de integración.
- Despliegue en hardware de consumo: con 3,13 GB de VRAM pico en una RTX 4070 Laptop de 8 GB, permite prototipar monitorización de recompensa en estaciones de trabajo sin GPU de datacenter.
- Filtrado y curación de datos de robot learning: la señal de progreso por fotograma puede usarse para etiquetar o descartar trayectorias de baja calidad en pipelines de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento publicados son de validación en vivo sobre LIBERO `libero_object` episodio 0 (143 fotogramas, demo de éxito):

| Metrica | Valor |
|---|---|
| Backbone | Qwen3-VL-4B-Instruct (NF4) |
| VRAM pico | 3,13 GB |
| Progreso, primer 20 % del episodio | 0,41 |
| Progreso, último 20 % del episodio | no disponible (truncado en la información) |
| Hardware de validación | RTX 4070 Laptop (8 GB) |
| Latencia declarada | 3000 ms |
| VRAM mínima declarada | 3,2 GB |

Ejemplo de overlay en `libero_object` episodio 0 (tarea "pick up the orange juice and place it in the basket"): progreso 0,07 al inicio, 0,52 a mitad de alcance y 0,86 con el objeto colocado.

## Requisitos de hardware

- VRAM estimada para inferencia: 3,2 GB mínimos declarados; 3,13 GB pico medidos en la validación en vivo.
- GPU recomendadas: RTX 4070 Laptop (8 GB) validada; cualquier GPU consumer con al menos 4-8 GB de VRAM debería ser suficiente dado el pico medido.
- Cabe en GPU consumer: sí, validado en una RTX 4070 Laptop de 8 GB.
- Opciones de despliegue: runtime OpenRAL (`openral rskill install`) sobre PyTorch; requiere OpenRAL Pro para cargar pesos cuantizados (int4/NF4) según ADR-0123. La carga 4-bit se hace vía lerobot `TOPRewardModel` con bitsandbytes.
- Latencia y throughput: latencia declarada de 3000 ms; el resto de métricas de throughput no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rskill-topreward_qwen3vl_4b-any-general-nf4 | 4.437.815.808 | no disponible | Reward model zero-shot sobre Qwen3-VL-4B, NF4 | apache-2.0 | Hugging Face (OpenRAL) |
| Qwen/Qwen3-VL-4B-Instruct | 4B (aprox.) | no disponible | VLM base sin cuantizar, uso general | apache-2.0 | Hugging Face |
| TOPReward (método upstream, lerobot) | depende del backbone | no disponible | Reward zero-shot vía `log P("True")` | MIT (método) | Repositorio lerobot |

No se dispone de datos de benchmarks que permitan comparar rendimiento numérico con alternativas; la comparación se limita a enfoque, licencia y disponibilidad.

## Limitaciones y advertencias

- Escala no calibrada: el progreso se normaliza min-max por episodio, por lo que no constituye un umbral de éxito calibrado entre episodios o tareas.
- Requiere OpenRAL Pro para cargar los pesos NF4; el OpenRAL open source solo carga fp32, fp16 y bf16 según ADR-0123.
- Solo idioma inglés (`en`) declarado; no hay soporte multilingüe documentado.
- Naturaleza advisory-only: no debe usarse para accionar ni bloquear motores directamente.
- Riesgo de alucinación inherente al VLM subyacente Qwen3-VL-4B, que puede producir señales de progreso poco fiables en escenarios fuera de distribución.
- Ventana de vídeo limitada a 8 fotogramas por forward de prefijo, lo que puede perder detalle en trayectorias largas o de dinámica rápida.
- Sesgos conocidos del backbone Qwen3-VL-4B no documentados en la información disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el método upstream es MIT y los pesos base son Apache-2.0; conviene verificar la cadena de licencias antes de producción.
- Uso previsto en robótica de manipulación (sobremesa, cocina, interior); no validado para otros dominios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-topreward_qwen3vl_4b-any-general-nf4
- Repositorio del rSkill en GitHub: https://github.com/OpenRAL/openral/tree/master/rskills/topreward-qwen3vl-4b-nf4/
- Paper TOPReward (arXiv 2602.19313): https://arxiv.org/abs/2602.19313
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct

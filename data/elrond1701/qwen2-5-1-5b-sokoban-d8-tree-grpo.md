# Elrond1701/qwen2.5-1.5b-sokoban-d8-tree-grpo

## Resumen

Elrond1701/qwen2.5-1.5b-sokoban-d8-tree-grpo es un ajuste fino por aprendizaje por refuerzo del modelo Qwen/Qwen2.5-1.5B-Instruct, especializado en resolver el rompecabezas Sokoban en formato texto mediante turnos de agente. Lo desarrolla el usuario Elrond1701 como parte de un experimento comparativo de algoritmos de RL para agentes LLM: la misma tarea se entrena con GRPO, GiGPO, RegPO y Tree-GRPO, y este checkpoint corresponde a la variante Tree-GRPO en su paso 150 (final). El modelo no es un asistente generalista: es una politica entrenada para emitir secuencias de movimientos (`Up`, `Down`, `Left`, `Right`) dentro de etiquetas `<answer>…</answer>` a partir de una rejilla simbolica y coordenadas.

Arquitectonicamente hereda el transformer decoder-only denso de Qwen2.5-1.5B-Instruct, con 1.777.088.000 parametros en bf16 (repo de 3,6 GB), contexto nativo de Qwen2.5 y licencia Apache 2.0. La innovacion esta en el procedimiento de entrenamiento: Tree-GRPO sustituye los rollouts planos de GRPO por rollouts estructurados en arbol (4 rollouts principales por puzzle, 2 puntos de ramificacion con 2 opciones cada uno, profundidad de rama 2 y seleccion de rama basada en incertidumbre, con peso intra-arbol 1.0 y normalizacion por desviacion tipica). Se inicializa desde el checkpoint del paso 50 del modelo GRPO hermano, de modo que solo los pasos 51-150 corresponden a la fase Tree-GRPO.

Su relevancia es metodologica mas que de producto: sirve como referencia reproducible de como el diseno de rollouts afecta al rendimiento de un agente LLM en una tarea de planificacion con estado parcial y recompensa escasa. En la evaluacion publicada por el autor, Tree-GRPO alcanza un 25,8 % de exito en 512 puzzles fijos en el paso 150, frente al 6,2 % del Qwen2.5-1.5B-Instruct sin entrenar, aunque por debajo de RegPO (29,3 % en el mismo paso, 35,8 % en su mejor evaluacion).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-1.5B-Instruct); en entrenamiento se uso un maximo de 3072 tokens de prompt y 512 de respuesta |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en bf16 |
| Idiomas soportados | no disponible; el prompt de entrenamiento esta en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, convertido desde checkpoint FSDP fp32) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atencion causal estandar, y conserva su tokenizador y su plantilla de chat (`<|im_start|>` / `<|im_end|>`). El ajuste se realiza con verl 0.6.1 y verl-agent, que implementa el bucle de agente multi-turno, y los rollouts se generan con vLLM en bf16 (la misma precision usada en evaluacion). El entorno es un Sokoban de 6×6 con 2 cajas, generado por juego inverso con profundidad de busqueda 8 y sin filtro de longitud de solucion; cada episodio dura 10 turnos con hasta 2 movimientos por turno (20 movimientos en total). La observacion es un prompt estilo RAGEN con rejilla de simbolos y coordenadas cero-indexadas del jugador, cajas y objetivos, mas los 2 ultimos turnos de historial; el turno del asistente se prellena con `<answer>` y no hay modo de razonamiento (thinking).

La recompensa sigue la logica de gym-sokoban: −0,1 por movimiento, +1 al colocar una caja sobre un objetivo, −1 al sacarla y +10 al resolver el puzzle; un formato invalido (texto tras `</answer>` o mas de 2 movimientos) anula el turno con −0,5. La optimizacion usa PPO con mini-batch de 256, learning rate 1e-6, coeficiente KL 0.05, clipping 0.2/0.2, agregacion token-mean, sin bonus de entropia, 16 puzzles por paso y 150 pasos totales. Tree-GRPO introduce rollouts en arbol: 4 rollouts principales por puzzle, 2 puntos de ramificacion con 2 opciones cada uno, profundidad de rama 2, seleccion de rama por incertidumbre y peso intra-arbol 1.0 normalizado por desviacion tipica. El checkpoint se calienta desde el paso 50 del modelo GRPO (semilla de entorno 50 desde el paso 51), por lo que la comparacion limpia es frente a GRPO en los pasos 51-150.

## Capacidades

- Generacion de secuencias de acciones de Sokoban en formato estricto: `Up`, `Down`, `Left`, `Right` separados por ` || ` dentro de `<answer>…</answer>`.
- Interpretacion de rejillas simbolicas 6×6 con coordenadas cero-indexadas de jugador, cajas y objetivos.
- Planificacion a corto plazo en episodios de hasta 10 turnos y 20 movimientos, con historial de los 2 ultimos turnos.
- Razonamiento multi-paso dentro del episodio: el modelo debe encadenar empujes sin poder tirar de las cajas ni atravesar muros.
- Seguimiento estricto de formato: el entrenamiento penaliza texto extra tras `</answer>` y mas de 2 movimientos por turno.
- No dispone de tool calling ni function calling entrenados.
- No dispone de vision, audio ni modo thinking; la modalidad es exclusivamente texto.
- Capacidades multilingues: no evaluadas; el prompt de entrenamiento esta en ingles.
- Capacidad generalista de conversacion: degradada respecto al modelo base por el ajuste especifico a Sokoban.

## Casos de uso

- **Investigacion en RL para agentes LLM**: replicar el experimento Tree-GRPO frente a GRPO, GiGPO y RegPO usando los cuatro checkpoints hermanos y la misma evaluacion de 512 puzzles fijos, para medir el efecto del diseno de rollouts en tareas de planificacion.
- **Banco de pruebas de entornos Sokoban en texto**: integrar el modelo como politica de referencia en un harness de evaluacion (por ejemplo, con el bucle de verl-agent) para comparar generadores de puzzles con distintas profundidades de busqueda.
- **Estudio de formatos estrictos de accion**: analizar como un LLM pequeno aprende a respetar una gramatica de salida (`<answer>…</answer>` con separador ` || `) bajo penalizacion explicita, util para disenar esquemas de accion en agentes de produccion.
- **Analisis de recompensas escasas**: usar el modelo y sus curvas de evaluacion (9,2 % en el paso 50, 25,8 % en el 150) como caso de estudio de senales de recompensa densas por evento (caja sobre objetivo) en entornos con recompensa terminal grande (+10).
- **Destilacion de politicas de planificacion**: generar trayectorias resueltas por el modelo para construir datasets de comportamiento en Sokoban y entrenar modelos mayores o politicas no neuronales.
- **Evaluacion de robustez de agentes pequenos**: medir la degradacion del modelo ante variaciones del prompt (orden de coordenadas, longitud de historial, numero de cajas) para caracterizar la sensibilidad de politicas entrenadas con RL a la distribucion de observaciones.
- **Docencia y divulgacion**: ejemplo autocontenido de 1,5B parametros y 3,6 GB que cabe en una GPU de consumo y permite reproducir un pipeline completo de RL multi-turno con vLLM y verl.

## Benchmarks y rendimiento

Metrica: `val/regret_sokoban/success_rate` sobre 512 puzzles fijos, evaluacion cada 10 pasos, temperatura de muestreo 0,4. Es la fraccion de filas de evaluacion marcadas como resueltas, no una tasa de victoria por episodio. Qwen2.5-1.5B-Instruct sin entrenar: 6,2.

| Modelo | paso 50 | paso 100 | paso 150 | media de las ultimas 5 evals (110-150) | mejor eval (paso) |
|---|---|---|---|---|---|
| GRPO | 9,0 | 12,1 | 14,6 | 15,6 | 18,1 (140) |
| GiGPO | 15,9 | 15,1 | 20,7 | 18,1 | 20,7 (150) |
| Tree-GRPO (este) | 9,2 | 17,9 | 25,8 | 22,1 | 25,8 (150) |
| RegPO | 9,2 | 19,6 | 29,3 | 28,9 | 35,8 (140) |

Curva de evaluacion de este checkpoint:

| paso | 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 | 110 | 120 | 130 | 140 | 150 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| exito (%) | – | – | – | – | – | 9,2 | 12,5 | 15,7 | 16,6 | 17,6 | 17,9 | 20,9 | 20,3 | 18,7 | 24,6 | 25,8 |

Advertencia del autor: una sola semilla por metodo, 150 pasos de entrenamiento, y Tree-GRPO y RegPO parten del paso 50 de GRPO mientras GRPO y GiGPO se entrenan desde cero; la comparacion limpia es RegPO / Tree-GRPO frente a GRPO en los pasos 51-150. Las evaluaciones pico entre checkpoints no se guardaron.

## Requisitos de hardware

- VRAM estimada en bf16: alrededor de 3,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 6-8 GB en una GPU de consumo para inferencia con `device_map="auto"`.
- Cuantizacion: no se publican pesos GGUF ni AWQ/GPTQ en el repo; habria que generarlos a partir de los safetensors bf16. En 8 bits el peso baja a ~1,8 GB y en 4 bits a ~0,9 GB, pero no hay validacion publicada de calidad tras cuantizar.
- GPU recomendadas: cualquier GPU con al menos 8 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) para bf16; A100/H100 no son necesarias para inferencia, solo para reproducir el entrenamiento (el autor uso FSDP fp32 y vLLM para rollouts).
- Cabe en GPU de consumo: si, con holgura en RTX 4090 y RTX 3090; en GPUs de 8 GB conviene cuantizar o limitar `max_new_tokens` (el modelo genera como maximo 16 tokens utiles por turno en el uso previsto).
- Opciones de despliegue: transformers (ejemplo oficial de la model card), vLLM (usado en entrenamiento y evaluacion), TGI (etiqueta `text-generation-inference` en el repo) y llama.cpp/Ollama solo si se generan pesos GGUF, que no se distribuyen.
- Latencia y throughput: no disponibles en la informacion proporcionada. La generacion es muy corta (una secuencia de 1-2 acciones por turno), por lo que el cuello de botella sera el preprocesado del prompt (hasta 3072 tokens) mas que la decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exito Sokoban d8 (paso 150) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tree-GRPO (este) | 1,777B | no disponible (prompt max. 3072 en entrenamiento) | 25,8 % | apache-2.0 | Hugging Face |
| GRPO (hermano) | 1,777B | no disponible | 14,6 % | apache-2.0 | Hugging Face |
| GiGPO (hermano) | 1,777B | no disponible | 20,7 % | apache-2.0 | Hugging Face |
| RegPO (hermano) | 1,777B | no disponible | 29,3 % | apache-2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1,777B | contexto nativo de Qwen2.5, no indicado en la informacion | 6,2 % | apache-2.0 | Hugging Face |

Los cuatro checkpoints comparten base, entorno, semilla de evaluacion y metrica, por lo que la comparativa es homogenea salvo por el calentamiento desde el paso 50 de GRPO en Tree-GRPO y RegPO. No se han identificado en la informacion proporcionada otros modelos publicos de Sokoban en texto con los que comparar directamente.

## Limitaciones y advertencias

- Especializacion extrema: fuera del formato de Sokoban descrito, la calidad como asistente generalista se degrada respecto a Qwen2.5-1.5B-Instruct; no debe usarse como chatbot ni para generacion de codigo.
- Rendimiento absoluto bajo: 25,8 % de exito en la evaluacion principal, insuficiente para uso practico como solucionador de Sokoban.
- Una sola semilla por metodo y 150 pasos: los resultados tienen alta varianza y no permiten conclusiones estadisticamente robustas sobre que algoritmo es mejor.
- Comparacion no perfectamente controlada: Tree-GRPO y RegPO parten del paso 50 de GRPO, mientras GRPO y GiGPO entrenan desde cero.
- La metrica es fraccion de filas de evaluacion resueltas, no tasa de victoria por episodio; no es directamente comparable con resultados de Sokoban de la literatura que reportan win rate.
- Riesgo de alucinacion de estado: el modelo no recibe el estado real del entorno tras cada turno mas alla de los 2 ultimos turnos de historial, por lo que puede desincronizarse en episodios largos.
- Sensibilidad al formato: texto extra tras `</answer>` o mas de 2 movimientos invalidan el turno con penalizacion; en produccion habria que validar y sanear la salida.
- Idiomas: no se ha evaluado el comportamiento en castellano ni en otros idiomas; el prompt de entrenamiento esta en ingles y las etiquetas de accion son palabras inglesas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct impone sus propios terminos; conviene revisarlos antes de redistribuir.
- Sin cuantizaciones oficiales publicadas ni benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.
- Sin descargas ni likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-tree-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Checkpoint hermano GRPO: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-grpo
- Checkpoint hermano GiGPO: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-gigpo
- Checkpoint hermano RegPO: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-regpo
- Framework de entrenamiento verl: https://github.com/volcengine/verl
- Framework verl-agent: no disponible en la informacion proporcionada
- Paper de Tree-GRPO: no disponible en la informacion proporcionada
- Paper de GiGPO: no disponible en la informacion proporcionada
- Paper de RegPO: no disponible en la informacion proporcionada
- Repositorio gym-sokoban: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible en la informacion proporcionada

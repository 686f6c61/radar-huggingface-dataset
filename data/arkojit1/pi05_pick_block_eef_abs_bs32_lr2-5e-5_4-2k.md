# arkojit1/pi05_pick_block_eef_abs_bs32_lr2.5e-5_4.2k

## Resumen

`arkojit1/pi05_pick_block_eef_abs_bs32_lr2.5e-5_4.2k` es un ajuste fino completo del modelo de robotica π₀.₅ (`lerobot/pi05_base`) para una tarea concreta de manipulacion con un brazo Franka: recoger un bloque. Lo publica el usuario arkojit1 dentro del ecosistema LeRobot 0.6.1 y se distribuye como una politica entrenada de extremo a extremo, no como un adaptador LoRA.

El modelo resuelve el problema de generar acciones de control motor a partir de observaciones visuales y del estado del robot. Se entrenó sobre el conjunto `Ameyapores/pick_block_eef_position_abs` (35 episodios de Franka, 9.181 fotogramas a 25 fps, dos camaras de 224×224 y un estado de 4 dimensiones). El espacio de acciones es la posicion absoluta del efector final `[x, y, z, gripper]` que debe alcanzarse en el siguiente fotograma.

Es relevante como ejemplo reproducible de ajuste fino de un modelo vision-lenguaje-accion (VLA) sobre hardware de robot real, con todos los pesos completos publicados. El checkpoint corresponde al paso 4.200 de una ejecucion de 20.000 pasos, con aproximadamente 0,69B parametros entrenables de un total de 4.143.404.816 parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en π₀.₅: codificador visual SigLIP + backbone de lenguaje Gemma-2B + experto de accion con flow matching |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no aplica (no es MoE); 0,69B parametros entrenables en este ajuste (experto de accion + proyecciones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio en safetensors, sin variantes GGUF/cuantizadas publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura π₀.₅ de Physical Intelligence: un codificador de vision SigLIP y un modelo de lenguaje Gemma-2B congelados durante el ajuste, mas un experto de accion entrenable de aproximadamente 0,69B parametros. El experto de accion genera trayectorias mediante flow matching (el mismo paradigma que usa π₀.₅ para modelar distribuciones de acciones continuas). En este repositorio se guardan los pesos completos de la politica, no un adaptador.

El ajuste se realizo con LeRobot 0.6.1 y la opcion `--train_expert_only`, dejando SigLIP y Gemma-2B congelados. Se usó batch global de 32 (4 GPU × 8), optimizador AdamW con LR pico de 2,5e-5 y decaimiento coseno hasta 2,5e-6, programacion fijada a 20.000 pasos con 666 pasos de calentamiento. El entrenamiento fue en bf16, con gradient checkpointing, `torch.compile` en modo por defecto, aumento de imagen activado, `chunk_size` de 50 y `n_action_steps` de 50. Este checkpoint es el paso 4.200 (~16,5 epocas) de la ejecucion completa. El estado y la accion se normalizan por cuantiles (q01–q99).

## Capacidades

- Generacion de acciones de control motor para un brazo Franka en tareas de recogida de bloques.
- Percepcion visual a partir de dos camaras de 224×224 (`cam0` y `cam2`); la tercera ranura de imagen de π₀.₅ se rellena con `empty_cameras=1`.
- Control de pinza binario: la cuarta componente de la accion es un objetivo 0/1.
- Prediccion de la posicion absoluta del efector final `[x, y, z]` en el siguiente fotograma.
- Modelado de distribuciones de accion continuas mediante flow matching.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingues ni modos de razonamiento. Es un modelo especifico de robotica.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: el modelo genera la posicion absoluta del efector final para recoger un bloque con un Franka, usando las dos camaras como entrada perceptiva.
- Investigacion en aprendizaje por imitacion: sirve como referencia reproducible de un ajuste fino completo del experto de accion sobre un conjunto pequeño de episodios (35 episodios).
- Punto de partida para nuevos ajustes: al publicarse los pesos completos y no un LoRA, se puede reentrenar o continuar el ajuste sobre otras tareas de manipulacion.
- Comparacion de espacios de accion absolutos frente a delta: el propio autor lo contrasta con `arkojit1/pi05_pick_block_eef_delta` para estudiar el efecto del espacio de acciones.
- Evaluacion de politicas VLA en simulacion o banco de pruebas: se puede cargar con `lerobot-eval --policy.path=...` para medir la perdida de flow matching en episodios retenidos.
- Analisis de sensibilidad a la region de entrenamiento: util para estudiar extrapolacion fuera de la region estrecha de entrenamiento (x 0,528–0,559, y 0,056–0,068, z 0,145–0,311).
- Docencia y prototipado en robotica: ejemplo de pipeline completo LeRobot con camaras multiples, estado de 4 dimensiones y control de pinza.

## Benchmarks y rendimiento

El autor solo reporta la perdida de flow matching sobre 4 episodios retenidos (31–34), no una tasa de exito de tarea.

| Metrica | Valor |
|---|---|
| Perdida de flow matching (eval, este checkpoint) | 0,0663 |
| Perdida de flow matching (train, este checkpoint) | 0,058 |
| Mejor eval de la ejecucion (paso 4.800) | 0,0576 (train 0,056) |
| Eval final de la ejecucion (paso 20.000) | 0,0839 (train 0,034) |
| Dispersion del eval punto a punto (holdout de 4 episodios) | aproximadamente ±0,005–0,01 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de tasa de exito de tarea en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14B parametros totales, en bf16/fp16 se necesitan aproximadamente 8–9 GB solo para pesos; en fp32 alrededor de 16–17 GB. Las cifras exactas de cuantizacion no estan disponibles.
- GPU recomendadas: el ajuste se realizo en 4 GPU (batch 4 × 8). Para inferencia, una GPU unica con al menos 12–16 GB de VRAM es suficiente en bf16.
- Cabe en GPU de consumo: si, en tarjetas como RTX 4090 (24 GB) o RTX 3090 (24 GB) en bf16; en tarjetas de 12 GB puede requerir precision reducida. No hay datos confirmados de variantes cuantizadas.
- Opciones de despliegue: LeRobot (`lerobot-eval --policy.path=arkojit1/pi05_pick_block_eef_abs_bs32_lr2.5e-5_4.2k`). No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI), que en principio no aplican a este tipo de politica.
- Latencia y throughput: no disponibles. El modelo se entreno con `chunk_size` de 50 y `n_action_steps` de 50, lo que implica prediccion de bloques de 50 acciones por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arkojit1/pi05_pick_block_eef_abs_bs32_lr2.5e-5_4.2k | 4,14B (0,69B entrenables) | no disponible | eval flow matching 0,0663 | no disponible | HuggingFace (lerobot) |
| arkojit1/pi05_pick_block_eef_abs_bs32_lr2.5e-5_4.8k | 4,14B (0,69B entrenables) | no disponible | mejor eval 0,0576 | no disponible | HuggingFace (lerobot) |
| arkojit1/pi05_pick_block_eef_abs_bs32_lr2.5e-5_20k | 4,14B (0,69B entrenables) | no disponible | eval final 0,0839 | no disponible | HuggingFace (lerobot) |
| lerobot/pi05_base | no disponible | no disponible | no disponible | no disponible | HuggingFace (lerobot) |
| arkojit1/pi05_pick_block_eef_delta | no disponible | no disponible | no disponible | no disponible | HuggingFace (lerobot) |

Los modelos comparables mas directos son otros checkpoints de la misma ejecucion de ajuste (mismos datos e hiperparametros) y el modelo base π₀.₅. La diferencia principal entre ellos es el espacio de acciones (absoluto frente a delta) y el paso de entrenamiento.

## Limitaciones y advertencias

- Espacio de acciones especifico: cada accion es la posicion absoluta del efector final mas un objetivo binario de pinza; no es intercambiable con modelos de acciones delta como `arkojit1/pi05_pick_block_eef_delta`.
- Region de entrenamiento muy estrecha: x 0,528–0,559, y 0,056–0,068, z 0,145–0,311. Cualquier objetivo fuera de ese rango es extrapolacion y probablemente poco fiable.
- Un solo conjunto de datos y una sola tarea (35 episodios, 9.181 fotogramas). No hay evidencia de generalizacion a otras tareas u objetos.
- La metrica reportada es la perdida de flow matching, no la tasa de exito de la tarea. No se mide el exito real de recoger el bloque.
- El mejor eval de la ejecucion (paso 4.800) es inferior al de este checkpoint (paso 4.200), y el final (paso 20.000) empeora respecto a ambos; hay senales de sobreajuste en fases tardias.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no disponible como tal; al ser una politica motora, el riesgo relevante es la extrapolacion fuera de la region de entrenamiento.
- Licencia no disponible: no se puede confirmar si permite uso comercial. Se debe verificar antes de cualquier despliegue en produccion.
- Idiomas soportados: no disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arkojit1/pi05_pick_block_eef_abs_bs32_lr2.5e-5_4.2k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Ameyapores/pick_block_eef_position_abs
- Checkpoint del mejor eval (paso 4.800): https://huggingface.co/arkojit1/pi05_pick_block_eef_abs_bs32_lr2.5e-5_4.8k
- Checkpoint final (paso 20.000): https://huggingface.co/arkojit1/pi05_pick_block_eef_abs_bs32_lr2.5e-5_20k
- Variante de acciones delta: https://huggingface.co/arkojit1/pi05_pick_block_eef_delta
- LeRobot: https://github.com/huggingface/lerobot

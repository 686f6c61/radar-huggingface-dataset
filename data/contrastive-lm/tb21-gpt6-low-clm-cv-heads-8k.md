# Contrastive-LM/tb21-gpt6-low-clm-cv-heads-8k

## Resumen

`Contrastive-LM/tb21-gpt6-low-clm-cv-heads-8k` es un conjunto de tres checkpoints de cabezas de proyeccion CLM (contrastive learning model) entrenadas como verificador para seleccion best-of-N de trayectorias de agentes. No es un modelo generativo: es un selector que puntua trayectorias candidatas producidas por otro sistema (en este caso, rollouts del job Terminal-Bench 2.1 GPT-6 Astra con Codex 0.151.0) y elige la mejor. Los embeddings de entrada proceden de Qwen3-8B con ventana de 8K, segun indica el propio titulo del repositorio.

El repositorio contiene tres cabezas disjuntas por tarea (`foldN/best_head.pt`) obtenidas mediante validacion cruzada de 3 folds (`folds/split_3fold.json`, semilla 20927), con reparto 15/9/14 sobre 38 tareas del slice de bajo esfuerzo de razonamiento. Cada cabeza se entreno unicamente con trayectorias exitosas de los otros dos folds. La receta se fijo antes de la evaluacion: batch 512, semilla 1234 y sampler bloqueado por tarea. El presupuesto de candidatos es Bo5 y la puntuacion de trayectoria es la media de las puntuaciones de los ultimos K pasos.

La relevancia del artefacto es metodologica mas que de rendimiento: el autor lo publica como resultado nulo. Sobre este slice, solo 5 de las 38 tareas son decidibles (28 pasan siempre, 5 fallan siempre), de modo que la ganancia maxima posible frente a la seleccion aleatoria es de aproximadamente dos tareas, y las cabezas fine-tuneadas no superan al baseline aleatorio (81,58 % en K=1, K=5 y K=12). El repo ocupa 0,2 GB, usa licencia MIT y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de proyeccion CLM (contrastive learning) sobre embeddings de un transformer Qwen3-8B |
| Parametros totales | no disponible (el repositorio ocupa 0,2 GB e incluye tres checkpoints `best_head.pt`; no se desglosa el numero de parametros por cabeza) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8K (segun el titulo del repositorio y la etiqueta `8k`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) |
| Modelo base de embeddings | Qwen3-8B |
| Tipo de modelo | Verificador / selector best-of-N (no generativo) |
| Checkpoints incluidos | 3 (`foldN/best_head.pt`) |
| Tamano del repositorio | 0,2 GB |
| Libreria | PyTorch |

## Arquitectura y entrenamiento

El artefacto no es un transformer completo, sino un conjunto de cabezas de proyeccion que se aplican sobre embeddings de trayectoria precalculados con Qwen3-8B a 8K de contexto. El entrenamiento sigue un esquema de aprendizaje contrastivo (CLM) inicializado desde el checkpoint `Contrastive-LM/CLM-v0.1-8B`. Se generan tres folds disjuntos por tarea con `folds/split_3fold.json` (semilla 20927) restringidos a las 38 tareas del slice, con reparto 15/9/14, de forma que cada tarea queda en el mismo fold que en el repositorio hermano `tb21-clm-cv-heads-8k`. Cada `foldN/best_head.pt` se entrena solo con trayectorias exitosas de los otros dos folds, lo que constituye una validacion cruzada estricta a nivel de tarea.

La receta de entrenamiento se congela antes de la evaluacion: batch 512, semilla 1234 y sampler bloqueado por tarea (`--sampler task-blocked`). El pipeline trata las trayectorias de Codex, que comienzan con un mensaje de sistema, un mensaje de usuario con `<environment_context>` y un mensaje de usuario con la tarea; los dos mensajes de usuario iniciales se fusionan en uno solo antes de aplicar sin cambios la receta de transicion DeepSWE definida en `scripts/build_gpt6_low.py` del dataset de embeddings. La puntuacion de una trayectoria candidata es la media de las puntuaciones de los ultimos K pasos.

## Capacidades

- Puntuacion de trayectorias completas de agentes para seleccion best-of-N con presupuesto Bo5.
- Seleccion de la mejor trayectoria de un conjunto de candidatos mediante la media de las puntuaciones de los ultimos K pasos (K=1, K=5 o K=12).
- Funcionamiento como verificador con validacion cruzada a nivel de tarea (3 folds disjuntos), lo que permite medir generalizacion a tareas no vistas.
- Operacion sobre embeddings precalculados de Qwen3-8B a 8K de contexto.
- No genera texto ni ejecuta acciones: no soporta tool calling, function calling ni razonamiento multi-paso por si mismo.
- No dispone de capacidades multimodales, de vision ni de audio.
- El soporte multilingue no esta documentado (etiqueta de idiomas ausente en la model card).

## Casos de uso

- Reranking best-of-N en agentes de terminal: dado un conjunto de hasta cinco rollouts por tarea generados por un agente (por ejemplo, Codex), la cabeza puntua cada trayectoria y selecciona la de mayor puntuacion, sustituyendo a una eleccion aleatoria.
- Verificador en pipelines de aprendizaje por refuerzo: las puntuaciones de trayectoria pueden usarse como senal de recompensa o de filtrado en bucle de RL, aprovechando que la cabeza se entrena especificamente con trayectorias exitosas.
- Filtrado de datos de entrenamiento para agentes: descartar trayectorias de baja puntuacion de un corpus de rollouts antes de reentrenar un modelo de politica, reduciendo ruido en el dataset.
- Investigacion en aprendizaje contrastivo aplicado a verificadores: el repositorio incluye `provenance.json`, `result.json` y el script `evaluation/bon_eval.py`, lo que permite reproducir la comparacion entre seleccion aleatoria, zero-shot y fine-tuneada.
- Evaluacion de selectores en benchmarks de agentes: sirve como punto de partida para medir si una cabeza entrenada aporta ganancia sobre `pass@1` en slices concretos de Terminal-Bench 2.1.
- Analisis de trayectorias fallidas: dado que 5 de las 38 tareas fallan siempre, las puntuaciones pueden usarse para estudiar si el selector discrimina entre trayectorias exitosas y fallidas dentro de una misma tarea.
- Replicacion de experimentos de validacion cruzada por tarea: el reparto de folds permite reutilizar la misma particion (`split_3fold.json`, semilla 20927) en comparaciones con otros metodos de seleccion.

## Benchmarks y rendimiento

Resultados publicados en la model card para el slice de 38 tareas, con presupuesto Bo5 y puntuacion de trayectoria como media de los ultimos K pasos:

| Selector | K=12 | K=5 | K=1 |
|---|---|---|---|
| random pick (pass@1) | 81,58 % | 81,58 % | 81,58 % |
| CLM v0.1, zero-shot | 84,21 % (32/38) | 84,21 % (32/38) | 78,95 % (30/38) |
| CLM, 3-fold fine-tuned (este repositorio) | 81,58 % (31/38) | 81,58 % (31/38) | 81,58 % (31/38) |
| oracle (cualquier exito) | 86,84 % | 86,84 % | 86,84 % |

Datos adicionales reportados por el autor: las semillas de entrenamiento 1, 2 y 3 dan 31-32/38 en K=12, 30-32 en K=5 y 31 en K=1. Los conjuntos de validacion por fold tienen solo 2-3 tareas. El autor declara explicitamente que este slice no permite separar selectores y presenta el resultado como nulo.

## Requisitos de hardware

- Las cabezas de proyeccion son de tamano reducido: el repositorio completo ocupa 0,2 GB, por lo que el entrenamiento y la inferencia de las cabezas caben en cualquier GPU consumer e incluso pueden ejecutarse en CPU.
- La evaluacion publicada (`evaluation/bon_eval.py`) consume el dataset de embeddings precalculado `Contrastive-LM/tb21-gpt6-low-clm-cv-embeddings-8k`, de modo que no requiere cargar Qwen3-8B para puntuar trayectorias.
- Si se desea regenerar los embeddings desde cero con Qwen3-8B a 8K, se necesita hardware capaz de servir ese modelo; no se especifican en la informacion disponible requisitos concretos de VRAM, GPU recomendadas ni latencias.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el flujo descrito usa PyTorch y scripts propios (`train/finetune.py`, `evaluation/bon_eval.py`) sobre el repositorio de GitHub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Alternativa | Tipo | Presupuesto | K=12 | K=5 | K=1 | Licencia |
|---|---|---|---|---|---|---|
| Este repositorio (CLM 3-fold fine-tuned) | Cabezas CLM sobre embeddings Qwen3-8B | Bo5 | 81,58 % (31/38) | 81,58 % (31/38) | 81,58 % (31/38) | MIT |
| CLM v0.1, zero-shot | Cabeza CLM preentrenada | Bo5 | 84,21 % (32/38) | 84,21 % (32/38) | 78,95 % (30/38) | no disponible en esta ficha |
| Seleccion aleatoria (pass@1) | Baseline | Bo5 | 81,58 % | 81,58 % | 81,58 % | no aplica |
| Oracle | Cota superior | Bo5 | 86,84 % | 86,84 % | 86,84 % | no aplica |
| `Contrastive-LM/tb21-clm-cv-heads-8k` | Repositorio hermano de cabezas CLM 3-fold | Bo5 | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada otros verificadores publicos directamente comparables sobre el mismo slice.

## Limitaciones y advertencias

- Resultado nulo declarado por el autor: las cabezas fine-tuneadas no superan a la seleccion aleatoria en este slice (81,58 % frente a 81,58 %) y quedan por debajo del CLM zero-shot en K=12 y K=5.
- Solo 5 de las 38 tareas son decidibles (28 pasan siempre y 5 fallan siempre), por lo que la ganancia maxima sobre la seleccion aleatoria es de aproximadamente dos tareas; el slice carece de poder estadistico para separar selectores.
- Los conjuntos de validacion por fold contienen unicamente 2-3 tareas, lo que hace muy fragil cualquier conclusion extraida de la validacion cruzada.
- El artefacto no es un modelo generativo: no puede producir texto, codigo ni acciones, y no soporta tool calling ni razonamiento por si mismo.
- Depende de un pipeline de embeddings muy concreto (Qwen3-8B a 8K, formato de trayectorias Codex con fusion de los dos mensajes de usuario iniciales); desviarse de ese formato puede invalidar las puntuaciones.
- No se documentan sesgos, comportamiento multilingue ni evaluaciones de robustez fuera del slice de Terminal-Bench 2.1.
- La licencia MIT permite uso comercial, pero el repositorio no incluye garantias de rendimiento y no registra descargas ni validacion externa de la comunidad en el momento de la consulta.
- El checkpoint `CLM_v0.1-8B.pt` necesario para reproducir el fine-tuning se descarga desde un repositorio distinto, cuya licencia no se detalla en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Contrastive-LM/tb21-gpt6-low-clm-cv-heads-8k
- Repositorio hermano de cabezas CLM: https://huggingface.co/Contrastive-LM/tb21-clm-cv-heads-8k
- Dataset de embeddings: https://huggingface.co/datasets/Contrastive-LM/tb21-gpt6-low-clm-cv-embeddings-8k
- Checkpoint base CLM v0.1 8B: https://huggingface.co/Contrastive-LM/CLM-v0.1-8B
- Codigo de reproduccion (rama `gpt6-low-cv`): https://github.com/jackyk02/contrastive_learning
- Leaderboard de comparacion de modelos (referencia general): https://arena.ai/leaderboard
- Directorio de modelos (referencia general): https://benchlm.ai/models
- Leaderboard de Artificial Analysis: https://artificialanalysis.ai/leaderboards/models
- LLM Stats: https://llm-stats.com/

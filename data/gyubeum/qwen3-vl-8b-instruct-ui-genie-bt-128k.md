# Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-BT-128K

## Resumen

Qwen3-VL-8B-Instruct-UI-Genie-BT-128K es un modelo de recompensa escalar (reward model) para acciones de agentes GUI en entornos móviles, desarrollado por Gyubeum mediante ajuste fino supervisado del modelo multimodal Qwen/Qwen3-VL-8B-Instruct. No es un modelo generativo de propósito general: se trata de un checkpoint de clasificación de secuencias (`seq_cls`, `num_labels=1`, `problem_type="regression"`) que asigna una puntuación continua a una trayectoria de entrada (objetivo, historial de pasos y capturas de pantalla), de forma que una puntuación mayor indica una acción mejor.

El modelo se entrena con la pérdida pairwise de Bradley-Terry, `-log σ(r_chosen − r_rejected)`, sobre 63.988 pares de preferencia (127.976 muestras) del split `bt/` del dataset UI-Genie-RM-517k. Una cabeza lineal aprendida, `score.weight`, proyecta el estado oculto del último token no de relleno a un escalar. Su relevancia actual reside en que proporciona una señal de recompensa continua y no acotada utilizable directamente como función de valor en RLHF (PPO/GRPO) o en selección best-of-N para agentes GUI, a diferencia de los clasificadores discretos basados en tokens especiales.

El modelo base Qwen3-VL-8B-Instruct aporta el backbone multimodal (visión y lenguaje) con 8.144.797.936 parámetros totales y pesos en safetensors (repo de 16,3 GB), bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration + cabeza lineal `score.weight` (clasificación de secuencias, regresión) |
| Parámetros totales | 8.144.797.936 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens en entrenamiento (truncado por la izquierda); longitud máxima de inferencia no disponible |
| Tipos de cuantización | no disponible (entrenado y documentado en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards con `model.safetensors.index.json`) |
| Tarea | `seq_cls`, regresión, `num_labels=1` |
| Entrada | multimodal: texto (objetivo, historial de pasos) e imágenes (capturas de pantalla, `max_pixels` 1.048.576) |
| Salida | un escalar de recompensa por trayectoria |
| Precisión de referencia | bfloat16 |
| Parámetros entrenables | 174,6 M (LoRA r=64, α=32, dropout 0,05 en capas lineales del LLM + cabeza `score`; torre de visión y aligner congelados) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un transformer multimodal que procesa texto e imágenes, al que se le añade una cabeza lineal `score` inicializada de cero. La tarea se formula como clasificación de secuencias con una única etiqueta continua: el estado oculto del último token no de relleno se proyecta mediante `score.weight` a un escalar de recompensa. El entrenamiento emplea la pérdida pairwise de Bradley-Terry sobre pares elegido/rechazado para el mismo contexto (objetivo, historial de pasos y capturas de pantalla).

Los detalles de entrenamiento son: 1 época y 1.000 pasos, con lotes de 64 pares por paso (1 por GPU × 8 de acumulación de gradiente × 8 GPUs), optimizador AdamW con lr 1e-4, schedule cosine, 5 % de warmup, weight decay 0,1 y recorte de gradiente 1,0, en bfloat16 con DeepSpeed ZeRO-3 sobre 8 GPUs. Solo se ajustan 174,6 M parámetros mediante LoRA (r=64, α=32, dropout 0,05) en las capas lineales del LLM más la cabeza `score`; la torre de visión y el aligner permanecen congelados. Una particularidad técnica relevante es que el trainer mantiene la cabeza `score` fuera del adaptador LoRA y la almacena únicamente en los shards de ZeRO-3, por lo que una fusión LoRA convencional la descartaría; este checkpoint incorpora la cabeza entrenada consolidada desde dichos shards tras la fusión. El código de entrenamiento está en `train_rm/rm_main_scripts/bt/train_bt_128k.sh` del repositorio AndroidFlux.

## Capacidades

- Puntuación de recompensa escalar de acciones GUI: asigna un float continuo y no acotado a cada trayectoria de entrada, donde mayor puntuación implica mejor acción.
- Procesamiento multimodal: ingiere capturas de pantalla junto con el objetivo y el historial de pasos del agente.
- Evaluación de pares elegido/rechazado: entrenado explícitamente para discriminar la acción preferida frente a la rechazada en el mismo contexto.
- Señal de valor para RL: utilizable directamente en PPO/GRPO y RLHF como función de recompensa.
- Selección best-of-N: permite ordenar múltiples candidatos de acción generados por un agente y escoger el de mayor puntuación.
- No es un modelo generativo: no produce texto, código ni acciones; su salida es exclusivamente la puntuación escalar.
- Soporte de tool calling / function calling: no disponible (no aplica a un reward model).
- Capacidades multilingües: no disponible.
- Capacidades especiales: no dispone de modo thinking ni de salidas de audio; su especialización es la evaluación de trayectorias GUI.

## Casos de uso

- Entrenamiento por refuerzo de agentes GUI (PPO/GRPO): el modelo actúa como función de recompensa que puntúa cada acción propuesta por el agente sobre la captura de pantalla actual, el objetivo y el historial, permitiendo optimizar la política del agente sin etiquetas manuales por paso.
- Selección best-of-N en producción: dado un agente que genera varias acciones candidatas para un mismo estado de pantalla, el reward model las ordena y se ejecuta la de mayor puntuación, reduciendo clics erróneos.
- Filtrado y curación de datos de trayectorias: puntuar grandes volúmenes de demostraciones de interacción móvil para descartar trayectorias de baja calidad antes de usarlas en SFT.
- Evaluación automática de agentes: comparar checkpoints o versiones de un agente GUI puntuando sus trayectorias sobre el mismo conjunto de tareas, sin necesidad de ejecución real en el dispositivo.
- RLHF con preferencias humanas: integrar los pares elegido/rechazado anotados por humanos en el pipeline de Bradley-Terry para alinear la política del agente con el criterio de anotadores.
- Detección de acciones peligrosas o irreversibles: penalizar con puntuaciones bajas acciones como borrar datos o realizar compras, actuando como filtro de seguridad antes de la ejecución.
- Ajuste de currículos de entrenamiento: usar la distribución de recompensas para identificar los estados de pantalla donde el agente rinde peor y priorizar esos escenarios en el siguiente ciclo de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que el conjunto de entrenamiento no presenta solapamiento con el conjunto de evaluación pairwise de 1k de UI-Genie, pero no reporta métricas de precisión, acuerdo con anotadores ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: con los 8.144.797.936 parámetros en bfloat16, los pesos ocupan aproximadamente 16,3 GB; sumando caché KV y activaciones para imágenes de hasta 1.048.576 píxeles, se recomienda al menos 24 GB de VRAM.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) o L40S para despliegues con lotes; una RTX 4090 (24 GB) es suficiente para inferencia en bfloat16 con lotes pequeños.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en bfloat16 con `low_cpu_mem_usage=True`; en GPUs de 16 GB sería necesaria cuantización, para la cual no se documentan recetas.
- Opciones de despliegue: exclusivamente HuggingFace `transformers`, ya que el loader `Qwen3VLForConditionalGeneration` de vLLM no soporta el tensor adicional `score.weight`; no se documenta soporte para llama.cpp, Ollama ni TGI.
- Carga manual de la cabeza: es necesario descargar el shard que contiene `score.weight` mediante `model.safetensors.index.json` y construir un `torch.nn.Linear` sin sesgo, porque la cabeza no está integrada en la clase CausalLM base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Objetivo | Pares | Muestras | Salida | Licencia |
|---|---|---|---|---|---|
| Qwen3-VL-8B-Instruct-UI-Genie-BT-128K | Bradley-Terry | 63.988 | 127.976 | Escalar continuo | Apache 2.0 |
| Qwen3-VL-8B-Instruct-UI-Genie-BT-256K | Bradley-Terry | 127.993 | 255.986 | Escalar continuo | Apache 2.0 |
| Qwen3-VL-8B-Instruct-UI-Genie-SFT-128K | SFT | 63.988 | 127.976 | Clasificador discreto `<|+|>` / `<|-|>` | Apache 2.0 |

Los tres modelos comparten el mismo backbone Qwen3-VL-8B-Instruct y el mismo dataset de origen (UI-Genie-RM-517k). La diferencia principal entre BT-128K y BT-256K es la cantidad de pares de entrenamiento (el doble en BT-256K), mientras que SFT-128K emplea las mismas muestras pero con un objetivo de clasificación discreta en lugar de regresión continua. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto, código ni acciones; solo puntúa trayectorias existentes.
- Riesgo de sobreajuste al dominio: entrenado exclusivamente con datos de UI-Genie-RM-517k sobre interacción móvil, por lo que su fiabilidad fuera de ese dominio (escritorio, web u otras plataformas) no está documentada.
- Sesgos: no se documentan análisis de sesgo; al derivar de un agente GUI y de preferencias anotadas, puede heredar sesgos de los anotadores y de la distribución de aplicaciones del dataset.
- Alucinación: aunque no genera texto, una puntuación errónea puede validar acciones incorrectas y degradar la política del agente si se usa como recompensa sin supervisión.
- Limitación de contexto: el entrenamiento truncó por la izquierda a 8.192 tokens, de modo que trayectorias más largas pueden perder información del objetivo o del historial inicial.
- Idiomas: no se especifican los idiomas soportados; el comportamiento multilingüe no está verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-VL-8B-Instruct y del dataset UI-Genie-RM-517k.
- Despliegue: la incompatibilidad con vLLM obliga a usar `transformers`, lo que limita el throughput en comparación con servidores de inferencia optimizados.
- Carga frágil: omitir la carga manual de `score.weight` produce puntuaciones aleatorias sin aviso de error, un fallo silencioso relevante en producción.
- Madurez: el modelo tiene 39 descargas y 0 likes en el momento de la ficha, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-BT-128K
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Gyubeum/UI_Genie_128k
- Dataset de origen: https://huggingface.co/datasets/UI-Genie/UI-Genie-RM-517k
- Variante BT-256K: https://huggingface.co/Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-BT-256K
- Variante SFT-128K: https://huggingface.co/Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-SFT-128K
- Código de entrenamiento (AndroidFlux): https://github.com/glim-arc/AndroidFlux
- Qwen3 Technical Report (arXiv:2505.09388): https://arxiv.org/abs/2505.09388

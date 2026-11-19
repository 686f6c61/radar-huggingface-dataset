# qgfvadfuvads/Q-Prefer-4B-ThreeHead

## Resumen

Q-Prefer-4B-ThreeHead es un modelo de recompensa (reward model) para generación de vídeo, distribuido como adaptador LoRA sobre el modelo base Qwen/Qwen3-VL-4B-Instruct. Lo publica el usuario qgfvadfuvads en Hugging Face y su función es puntuar vídeos generados por modelos de difusión vídeo según tres ejes independientes: calidad visual (VQ), dinámica temporal (TD) y alineamiento con el texto (TA). No es un modelo generativo, sino un evaluador que devuelve tres escalares por vídeo y que está pensado para integrarse como función de recompensa en pipelines de reinforcement learning (RL) sobre generadores de vídeo como Wan2.1 o Wan2.2.

El modelo parte de un transformer multimodal de 4B parámetros (Qwen3-VL-4B-Instruct) y añade un adaptador LoRA de rango 64 sobre las proyecciones q/k/v/o y gate/up/down, más una cabeza lineal sin bias de 3×2560 que produce los tres scores. La entrada de vídeo se procesa tomando 8 fotogramas uniformes, cada uno duplicado (modo `dup8`, 16 posiciones en total), a 200.704 píxeles por fotograma (aproximadamente 448×448), con una imagen de referencia opcional para escenarios image-to-video (I2V).

La relevancia del checkpoint es doble: por un lado publica los pesos finales que generan las puntuaciones reportadas en Q-Prefer-Bench (VQ 77,26; TA 67,73; TD 71,19 con empates) e IsoVRBench (82,25 de media en ocho categorías); por otro, incluye el código de inferencia, un script de validación reproducible y un parche para integrarlo en un repositorio de RL de Wan2.1. El autor advierte explícitamente de que este checkpoint no se ha usado en ninguno de los seis entrenamientos RL que documenta, que emplearon modelos de recompensa anteriores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL-4B-Instruct) + adaptador LoRA (rank 64, alpha 128) + cabeza lineal `rm_head` (3×2560) |
| Parámetros totales | No disponible (el adaptador LoRA y la cabeza se distribuyen sobre un base de 4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (la inferencia de referencia se ejecuta en BF16 con LoRA fusionado) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (LoRA + `rm_head`), con tokenizer, `preprocessing_config.json`, `input_mode.json`, `trainer_state.json` e `inference-receipt.json` |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct (revision `ebb281ec70b05090aa6165b016eac8ec08e71b17`) |
| Tamaño del repositorio | 0,6 GB |
| Entrada de vídeo | 8 fotogramas uniformes duplicados (16 posiciones), 200.704 px por fotograma; imagen de referencia opcional de 100.352 px para I2V |
| Salidas | 3 escalares: 0 = VQ, 1 = TD (token `<|MQ_reward|>`, también llamado DYN), 2 = TA; sin sigmoid, pueden ser negativos |
| Prompt template | `caption_before_mq_ta_v1` (VQ antes del prompt; TD y TA después) |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone de Qwen3-VL-4B-Instruct como extractor multimodal y le superpone un adaptador LoRA de rango 64 y alpha 128 sobre las proyecciones de atención (q/k/v/o) y del MLP (gate/up/down). Los tres scores se obtienen tomando la última capa oculta del token de recompensa correspondiente y pasándola por una fila de la cabeza lineal `rm_head` (3×2560, sin bias), que se guarda junto con el adaptador. El entrenamiento se organiza en dos fases: una de cold-start con 2.036 pares y 1.200 actualizaciones, y una segunda con 27.266 pares (los 2.036 anteriores más 25.230 pares con etiquetas VQ/TD/TA disponibles de un conjunto de 31K) y 2.400 actualizaciones. Se usa batch global 32, AdamW con learning rate 2e-6, warmup del 5% y decaimiento de peso 0,01.

La función de pérdida es una Bradley–Terry con empates (Rao–Kupper, k = 5), donde los pares sin alguna de las etiquetas no contribuyen a la pérdida de ese eje. Un detalle técnico relevante es el modo de entrada `dup8`: cada uno de los 8 fotogramas muestreados se duplica para ocupar 16 posiciones en el contexto visual. Según el autor, este esquema de duplicación solo se aplicó a partir de la segunda fase de entrenamiento y es obligatorio en inferencia (el script de scoring aborta si se detecta un `input_mode` distinto de `dup8`). La inferencia se realiza fusionando el LoRA en BF16 y procesando un vídeo por llamada.

## Capacidades

- Puntuación de vídeo generado en tres ejes independientes: calidad visual (VQ), dinámica temporal (TD) y alineamiento texto-vídeo (TA).
- Soporte de escenarios text-to-video (T2V) y image-to-video (I2V), con imagen de referencia opcional para el segundo caso.
- Evaluación con empates: el modelo se entrenó con una variante de Bradley–Terry que admite empates entre pares de vídeos.
- Integración como función de recompensa en pipelines de RL para modelos de difusión de vídeo (Wan2.1-I2V, Wan2.2-TI2V-5B).
- Servicio de scoring por lotes mediante `score_videos.py`, que acepta JSONL con `{key, video, prompt, ref_image}` y devuelve `{key, VQ, TD, TA}`.
- Worker de integración con protocolo JSON-lines (`{path, prompt, reference}`) para entrenamiento RL.
- Capacidades multimodales heredadas del base Qwen3-VL (comprensión de imagen y texto), aunque el modelo se distribuye y valida exclusivamente como evaluador de vídeo.
- No se documentan capacidades de tool calling, agentes, matemáticas ni generación de texto en esta ficha; el checkpoint está especializado en scoring.

## Casos de uso

- Filtrado de datos sintéticos para entrenamiento de generadores de vídeo: usar los tres scores para descartar muestras con baja calidad visual o mal alineamiento textual antes de incorporarlas a un dataset de destilación o fine-tuning.
- Recompensa en RL de difusión vídeo: integrar el worker mediante el parche `P-Q-Prefer_58bd0ee_threehead.patch` en el repositorio Wan2.1-I2V DiffusionART, configurando `reward.checkpoint` al directorio `checkpoint/` y `reward.qprefer.num_frames` a 8, con pesos VQ/TA/DYN ajustables (el ejemplo usa 0,4/0,4/0,2).
- Evaluación automática de modelos T2V e I2V: calcular métricas VQ/TD/TA sobre un conjunto de validación fijo para comparar checkpoints de un mismo generador a lo largo del entrenamiento.
- Selección de candidatos (best-of-N) en producción: generar varias muestras por prompt y reordenarlas según una combinación ponderada de VQ y TA antes de servir el vídeo final.
- Auditoría de alineamiento texto-vídeo: detectar prompts donde el generador produce vídeos visualmente correctos pero poco fieles al texto, usando TA como señal de diagnóstico.
- Monitorización de dinámica temporal: emplear TD para identificar colapsos de movimiento (vídeos estáticos o con artefactos temporales) en pipelines de generación de larga duración.
- Validación de despliegues: ejecutar `score_videos.py` sobre `verification/` y comparar con `expected_scores.jsonl` para confirmar que la instalación reproduce exactamente las puntuaciones del benchmark antes de conectar el modelo a un entrenamiento RL.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| Q-Prefer-Bench | Precisión VQ (con empates) | 77,26 |
| Q-Prefer-Bench | Precisión TA (con empates) | 67,73 |
| Q-Prefer-Bench | Precisión TD (con empates) | 71,19 |
| IsoVRBench | Media de ocho categorías | 82,25 |

No se han publicado en la información disponible resultados comparativos frente a otros reward models en formato de tabla, ni cifras de latencia o throughput más allá de la validación del script (carga en aproximadamente 15 segundos y scoring de 6 vídeos en aproximadamente 2 segundos sobre una RTX PRO 6000).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base es de 4B parámetros y la inferencia de referencia se ejecuta en BF16 con LoRA fusionado, lo que sitúa el peso de los pesos en el orden de 8 GB, a lo que se suma el coste de activaciones del encoder visual al procesar 16 posiciones de 200.704 píxeles.
- GPU recomendadas: el autor valida el script en una RTX PRO 6000; por tamaño, cabría esperar funcionamiento en GPUs consumer de gama alta con suficiente VRAM (RTX 4090, 5090) y en A100/H100 para despliegues por lotes, aunque no se proporcionan medidas específicas.
- Cabe en GPU consumer: probablemente sí en modelos con 16-24 GB o más, aunque no se confirma en la información disponible.
- Opciones de despliegue: script propio `score_videos.py` con `transformers` y `peft` (versiones fijadas en `requirements.txt`); worker JSON-lines para RL; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 15 segundos de carga y aproximadamente 2 segundos para 6 vídeos en una RTX PRO 6000, procesando un vídeo por llamada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Q-Prefer-4B-ThreeHead | Base 4B + LoRA | No disponible | Q-Prefer-Bench VQ 77,26 / TA 67,73 / TD 71,19; IsoVRBench 82,25 | No disponible | Hugging Face (qgfvadfuvads) |
| VideoReward-2B (checkpoint-11352) | 2B | No disponible | No disponible en esta ficha | No disponible | Público (usado como baseline en las curvas RL del autor) |
| Cold-start de Q-Prefer | Base 4B + LoRA | No disponible | No disponible en esta ficha | No disponible | Incluido como fase de inicialización del autor, no distribuido por separado |

La información disponible solo permite comparar cualitativamente con VideoReward-2B (usado por el autor como reward model alternativo, con preprocesado propio a 2 fps y dos cabezas VQ/TA) y con las variantes internas del propio Q-Prefer. No se aportan tablas de benchmarks cruzadas entre estos modelos.

## Limitaciones y advertencias

- El checkpoint no se ha utilizado en ninguno de los seis entrenamientos RL documentados por el autor; los resultados de RL publicados corresponden a modelos de recompensa anteriores ("r7" y variantes), no a este.
- El modelo exige el modo de entrada `dup8` (8 fotogramas duplicados); alimentarlo con 16 fotogramas distintos o con otro template produce puntuaciones inconsistentes con el benchmark.
- El script de scoring aborta si se define la variable de entorno `QP_INPUT_MODE` con un valor distinto de `dup8`; hay que respetar `checkpoint/input_mode.json`.
- Los scores son escalares sin sigmoid y pueden ser negativos; su escala no es comparable entre distintos reward models, por lo que solo tienen sentido relativo dentro del mismo modelo.
- La licencia no está declarada en la información disponible, lo que impide confirmar si se permite uso comercial.
- No se documentan idiomas soportados ni sesgos conocidos; al depender de Qwen3-VL, hereda los sesgos del base, pero no se cuantifican.
- El autor no ha podido ejecutar un entrenamiento RL completo con este checkpoint por no disponer de entorno Wan2.1; solo verifica que el worker devuelve puntuaciones idénticas a las del benchmark y que el parche aplica limpiamente sobre el commit 58bd0ee.
- La validación reproducible requiere descargar también el modelo base Qwen3-VL-4B-Instruct y comprobar que los tres scores coinciden con `expected_scores.jsonl` antes de usar el modelo en producción.
- No se proporcionan datos de robustez ante dominios de vídeo distintos de los de entrenamiento (OpenVidHD filtrado), ni análisis de calibración de los scores.

## Enlaces

- Hugging Face: https://huggingface.co/qgfvadfuvads/Q-Prefer-4B-ThreeHead
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio de RL de referencia (Wan2.1-I2V DiffusionART, commit 58bd0ee): no disponible como URL en la información proporcionada
- Benchmark Q-Prefer-Bench: no disponible como URL en la información proporcionada
- Benchmark IsoVRBench: no disponible como URL en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada

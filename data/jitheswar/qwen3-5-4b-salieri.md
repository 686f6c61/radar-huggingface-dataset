# Jitheswar/Qwen3.5-4B-Salieri

## Resumen

Qwen3.5-4B-Salieri es un modelo de 4.539 millones de parámetros (4B) especializado en tareas de agente de ingeniería de software, desarrollado por el usuario Jitheswar. Deriva de Jitheswar/Qwen3.5-4B-Amadeus, una versión "abliterated" (sin mecanismos de rechazo) de Qwen/Qwen3.5-4B, y se ha afinado mediante dos rondas de DPO a nivel de paso (step-level DPO) para que actúe como agente autónomo: explorar un repositorio con herramientas, localizar la causa de un issue, editar código, ejecutar tests y enviar un parche.

El modelo conserva la arquitectura híbrida de Qwen3.5, el formato nativo de tool calling, una ventana de contexto de 262K tokens y la torre de visión del modelo base (no modificada durante el entrenamiento). Su relevancia actual radica en que demuestra que un modelo de solo 4B, mediante DPO iterado sobre estados de agente, puede mejorar de forma medible en tareas SWE reales (resolución de issues de GitHub con tests ocultos) y en benchmarks de código e instrucciones, sin recurrir a "benchmaxing": el autor eliminó explícitamente del entrenamiento toda trayectoria proveniente de repositorios presentes en los conjuntos de evaluación.

La versión actual (`main`, v2) aplica una segunda ronda de DPO sobre v1 con 246 nuevos pares, aceptada bajo una regla predefinida antes de ver los resultados en held-out. Se distribuye con licencia Apache-2.0, pesos en safetensors y cuantizaciones GGUF, y está pensado para integrarse en arneses de agente compatibles con OpenAI mediante vLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de Qwen3.5 (con thinking híbrido, tool calling nativo y torre de visión); detalles internos de capas no disponibles |
| Parámetros totales | 4.539.265.536 (≈4,54B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262K tokens (262.144) |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q4_K_M (+ mmproj para visión) en GGUF |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B (Apache-2.0), pasado por una abliteración que da lugar a Qwen3.5-4B-Amadeus, y conserva las características del base: modo de razonamiento híbrido (thinking), formato nativo de tool calling, contexto de 262K tokens y torre de visión intacta. El ajuste se realizó con dos rondas de DPO a nivel de paso, ambas con LoRA r64 en bf16 mediante Unsloth, beta 0.1 y término NLL de 0.2 (RPO), 2 épocas y learning rate 1e-5, usando únicamente tareas del pool de entrenamiento (sin repositorios de dev, held-out, OOD ni lockbox).

La primera ronda (v1) ataca el problema de los bucles de acción: los agentes pequeños repiten exactamente la misma llamada a herramienta. Se recogieron 558 estados de repetición a partir de rollouts del pool de entrenamiento y Qwen3.8-27B generó el siguiente paso correcto en el mismo contexto (4 muestras, conservando una llamada limpia distinta de la repetida), produciendo 448 pares con el paso del profesor como elegido y la repetición como rechazado, con el modelo base como referencia. La precisión en pares held-out fue de 0,95 y la tasa de repetición exacta dentro de presupuesto cayó del 6,3% al 0,4% en dev. La segunda ronda (v2) añade 246 pares con v1 como referencia: 234 estados de bucle de rollouts de otro checkpoint (fine-tune completo) más 12 estados de "compromiso con la edición" en los que el agente había explorado 30+ llamadas sin editar y el profesor eligió editar en al menos 2 de 4 muestras; precisión held-out de 0,96.

Como innovación metodológica destaca la disciplina anti-benchmaxing: se descartaron 522+ trayectorias de repositorios presentes en cualquier conjunto de evaluación, los checkpoints se eligieron solo en splits de dev separados, el system prompt de evaluación es genérico y el bucle de optimización de arnés/prompt (Harness2, google-research/harness2, arXiv:2610.14224) se ejecutó solo sobre tareas del pool de entrenamiento. Los datos provienen de nvidia/Open-SWE-Traces (CC-BY-4.0; tareas de Scale-SWE y SWE-rebench-V2), con el profesor Qwen3.8-27B (Apache-2.0).

## Capacidades

- Generación de texto, razonamiento con modo thinking híbrido y matemáticas.
- Generación y edición de código, con especialización en parcheo de repositorios reales.
- Tool calling nativo en formato Qwen (parser `qwen3_coder` en vLLM) con herramientas genéricas: `run_command`, `read_file`, `edit_file`, `write_file`, `get_status`, `submit_patch`.
- Comportamiento de agente autónomo multi-paso: exploración de repositorio, localización de causa raíz, edición, ejecución de tests y envío de parche.
- Capacidad de visión (image-text-to-text) heredada del base, con torre no modificada por el entrenamiento y mmproj incluido en los GGUF.
- Multilingüe: inglés, chino y otros idiomas (etiqueta `multilingual`).
- Integración con arneses de agente compatibles con OpenAI que usen tool calls nativos.
- Reducción drástica de bucles de acción repetitivos (de 6,3% a 0,4% de repetición exacta en dev).

## Casos de uso

- Resolución automática de issues en repositorios propios: el modelo explora el árbol de ficheros con `read_file` y `get_status`, localiza la causa del bug, aplica un parche con `edit_file` y valida con `run_command`; su entrenamiento específico en este flujo y su contexto de 262K lo hacen adecuado para repositorios medianos con historial largo.
- Agente de CI/CD para parcheo de tests fallidos: integrado en un pipeline, recibe el log del fallo y el diff, reproduce el error en un sandbox y propone una corrección verificable antes de abrir un pull request.
- Asistente de refactorización guiada por tests: dado un conjunto de tests ocultos o existentes, itera ediciones hasta que pasan, con el modo thinking activado para tareas de razonamiento sobre el código.
- Automatización de tareas de mantenimiento en monorepos: gracias a la ventana de 262K tokens puede cargar ficheros de configuración, fragmentos de código y trazas de ejecución en un solo contexto sin truncar.
- Agente de terminal (bash-only): el autor verificó un conjunto de herramientas restringido a bash, por lo que es viable como agente de shell para tareas de administración y scripting en entornos controlados.
- Procesamiento de capturas y diagramas en flujos de desarrollo: al conservar la torre de visión, puede recibir una imagen de error, un diagrama de arquitectura o una captura de UI y razonar sobre ella junto al código.
- Evaluación e investigación de DPO a nivel de paso: sirve como referencia reproducible (revisiones `v1` y `main`) para estudiar la mitigación de bucles en agentes pequeños con recetas LoRA y RPO.
- Despliegue en local para prototipado de agentes: las cuantizaciones GGUF Q4_K_M permiten ejecutarlo en estaciones de trabajo sin GPU de datacenter para pruebas de concepto.

## Benchmarks y rendimiento

Datos aportados por el autor, con ajustes idénticos para todos los modelos (thinking mode, temperature 0.6, top-p 0.95, top-k 20, vLLM 0.32). Los datos agénticos agrupan 2 semillas.

| Agentic SWE (tasa de resolución %, 2 semillas) | Amadeus (base) | Salieri v1 | Salieri v2 |
|---|---|---|---|
| dev (252 ejecuciones; usado para selección) | 27,8 | 29,8 | 31,0 |
| held-out repos (47 tareas) | 22,3 | 20,2 | 27,7 |
| post-release OOD (30 tareas) | 56,7 | 63,3 | 55,0 |
| lockbox (67 tareas, ejecutado una vez sobre v1) | 21,6 | 23,1 | no ejecutado |
| bash-only tool set (dev, 252 ejecuciones) | 25,0 | 28,6 | 27,0 |

| Código / instrucción (pass@1, 4 muestras) | Amadeus (base) | Salieri v1 | Salieri v2 |
|---|---|---|---|
| HumanEval+ | 87,0 | 87,5 | 88,6 |
| MBPP+ | 68,5 | 68,6 | 67,7 |
| LiveCodeBench v6 (2025-02..05) | 34,0 | 42,9 | 44,3 |
| IFEval prompt-strict | 61,4 | 74,9 | 80,2 |

El propio autor advierte que las diferencias v2 vs v1 en los splits agénticos son de pocas tareas sobre 60-252 ejecuciones y van en ambas direcciones, dentro del ruido de semilla en cada split; si se prefiere el modelo verificado en lockbox, debe usarse la revisión `v1`. Los efectos más claros de la receta global (v1 y v2) son las ganancias en LiveCodeBench e IFEval sobre el base y la fuerte reducción de bucles de acción.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB en BF16 (4,54B parámetros), unos 5 GB en Q8_0, 4 GB en Q6_K y 3 GB en Q4_K_M; añadir margen para el contexto (KV cache) y, si se usa visión, para el mmproj.
- GPU recomendadas: A100 40/80 GB, H100 y L40S para despliegues con contexto largo (262K) y concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) sobradas para BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, 3090, 4080 (16 GB) y en tarjetas de 8 GB con cuantización Q4_K_M/Q6_K; también en Apple Silicon vía llama.cpp o LM Studio.
- Opciones de despliegue: vLLM (comando del autor con `--enable-auto-tool-choice --tool-call-parser qwen3_coder --reasoning-parser qwen3` y `--max-model-len 65536`), llama.cpp, LM Studio y Ollama mediante los GGUF incluidos; cualquier arnés de agente compatible con OpenAI.
- Latencia y throughput estimados: no disponibles (no se publican cifras de tokens/s ni de latencia por tarea).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Salieri v2 | 4,54B | 262K | Agente SWE con DPO a nivel de paso, visión | Apache-2.0 | Hugging Face (safetensors + GGUF) |
| Qwen3.5-4B-Amadeus (base del ajuste) | 4,54B | 262K | Base abliterated sin especialización agéntica | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base original) | 4,54B | 262K | Modelo generalista con visión y tool calling | Apache-2.0 | Hugging Face |
| Qwen3.8-27B (profesor del DPO) | 27B (aprox.) | no disponible | Modelo mayor usado como profesor | Apache-2.0 | Hugging Face |

En los benchmarks del autor, Salieri v2 supera al base Amadeus en dev (31,0 vs 27,8), held-out repos (27,7 vs 22,3), LiveCodeBench v6 (44,3 vs 34,0) e IFEval (80,2 vs 61,4), con caída en post-release OOD (55,0 vs 56,7) y en MBPP+ (67,7 vs 68,5). No se dispone de comparaciones con otros modelos de agente SWE de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 4B: resuelve una minoría de issues reales de repositorio (31,0% en dev, 27,7% en held-out) y puede entrar en bucles en tareas difíciles pese a la mitigación.
- Evaluación principalmente en un único arnés libre de Docker, con un chequeo adicional bash-only; el rendimiento en otros arneses puede diferir.
- Base abliterated: el modelo apenas rechaza peticiones, por lo que debe desplegarse con salvaguardas propias (filtros de entrada/salida, permisos de herramientas restringidos).
- Riesgo de alucinación en la localización de causas y en la generación de parches; requiere verificación mediante tests y revisión humana antes de fusionar cambios.
- Las diferencias entre v1 y v2 están dentro del ruido de semilla en varios splits; v2 no fue evaluado en lockbox (el lockbox se gastó en v1).
- Idiomas: soporte declarado para inglés, chino y multilingüe, pero los benchmarks y el entrenamiento se centran en tareas de código en inglés; el rendimiento en castellano no está medido.
- Contexto de 262K: usarlo completo exige hardware con VRAM suficiente para la KV cache; el comando de ejemplo limita a 65.536 tokens.
- Licencia Apache-2.0 permite uso comercial, pero la naturaleza abliterated del base traslada al desplegador la responsabilidad sobre el contenido generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jitheswar/Qwen3.5-4B-Salieri
- Modelo base del ajuste: https://huggingface.co/Jitheswar/Qwen3.5-4B-Amadeus
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Open-SWE-Traces
- Paper Open-SWE-Traces (Ahmad et al.): arXiv:2606.16038
- Paper Harness2: arXiv:2610.14224
- Repositorio Harness2: https://github.com/google-research/harness2
- Unsloth: https://github.com/unslothai/unsloth

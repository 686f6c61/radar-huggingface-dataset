# Balab2021/Nemotron-3.5-Lightning-30B-A3B-Cricket-NeMo-RL-Rhea

## Resumen

El repositorio `Balab2021/Nemotron-3.5-Lightning-30B-A3B-Cricket-NeMo-RL-Rhea` no contiene un modelo completo, sino un adaptador LoRA de rango 32 entrenado sobre el modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` de NVIDIA. El adaptador especializa al modelo base en la resolución de preguntas numéricas sobre cricket T20 (tasas de carrera, ritmos de persecución y hitos), forzándolo a dar una respuesta numérica exacta con un razonamiento escrito mínimo. Lo publica el usuario Balab2021 como artefacto de un experimento de aprendizaje por refuerzo.

El entrenamiento se realizó con GRPO dentro de NeMo RL, usando como recompensa un entorno de NeMo Gym que valida el número final de forma exacta y penaliza la longitud de la salida: una respuesta correcta obtiene `1 - 0.4 * output_tokens / 4096`, cualquier otra obtiene 0. El resultado declarado es un salto de precisión del 86,50 % al 97,71 % en 600 preguntas reservadas, con una reducción del número medio de tokens de salida de 1565 a 107.

Es relevante como ejemplo reproducible de un pipeline de RL aplicado a un modelo híbrido grande (30B totales, 3B activos) mediante LoRA, y como caso práctico de cómo una recompensa basada en formato y exactitud puede acortar drásticamente el razonamiento de un modelo con modo "thinking" a costa de volverlo mucho más telegráfico. No es un modelo de propósito general ni un artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base híbrido (transformer + Mamba y capas MTP según la model card); el adaptador en sí es PEFT/LoRA |
| Parámetros totales | No disponible para el adaptador; el modelo base se denomina 30B-A3B (30B totales) |
| Parámetros activos | No disponible para el adaptador; el modelo base es MoE con 3B activos según su nombre |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los pesos del adaptador se distribuyen en safetensors; el modelo base en BF16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `adapter_model.safetensors` (198 tensores), `adapter_config.json`, `automodel_peft_config.json`; el modelo base en BF16 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 64 aplicado sobre las proyecciones de atención q/k/v/o, la proyección de entrada de Mamba (`in_proj`) y las proyecciones up/down de los expertos compartidos del modelo base. El modelo base `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` es un modelo híbrido con componentes transformer y Mamba, con arquitectura MoE (30B totales, 3B activos) y capas MTP (multi-token prediction) presentes en la versión de NeMo Automodel pero no en la de transformers.

El entrenamiento usó GRPO con el backend Automodel de NeMo RL, generación con vLLM y recompensas de un entorno de NeMo Gym específico de cricket. Se ejecutaron 100 pasos con 64 preguntas y 8 respuestas muestreadas por pregunta (51.200 rollouts), sobre el dataset `Balab2021/CricketData-T20-Reasoning-Qwen3.8-Full`, en 4 nodos de 4 GPUs NVIDIA Vera Rubin (16 GPUs en total). La recompensa combina exactitud del número final con una penalización lineal por longitud de salida sobre un máximo de 4096 tokens.

## Capacidades

- Resolución de preguntas numéricas sobre cricket T20: tasas de carrera (`run_rate`), ritmos de persecución (`chase_rate`) y hitos (`milestone`), con respuesta numérica exacta.
- Razonamiento muy compacto: produce de media unos 107 tokens de salida, frente a los 1565 del modelo base.
- Herencia de las capacidades del modelo base (generación de texto, razonamiento, código, tool calling, multilingüismo) en la medida en que el adaptador no las degrade; la model card no documenta evaluaciones fuera del dominio de cricket.
- Aplicable como módulo LoRA servido por vLLM junto al modelo base, o fusionable en los pesos para obtener una copia standalone de 61 GB.
- No soporta carga independiente: requiere el modelo base.

## Casos de uso

- Respuesta automática a preguntas numéricas de cricket en un bot o API: el adaptador devuelve el número exacto con pocos tokens, lo que reduce coste de inferencia y latencia frente al modelo base.
- Extracción de métricas de partidos a partir de preguntas en lenguaje natural: útil para pipelines de estadísticas deportivas donde se necesita un valor numérico fiable y verificable.
- Evaluación de pipelines de RL: sirve como referencia reproducible de un entrenamiento GRPO con recompensa de exactitud y penalización de longitud sobre un modelo híbrido grande.
- Servicio multi-adaptador con vLLM: al cargarse como módulo LoRA, permite atender consultas de cricket junto a otras especializaciones sobre el mismo modelo base, compartiendo pesos.
- Investigación sobre "thinking mode" y verbosidad: caso de estudio de cómo una recompensa de formato colapsa el razonamiento extendido en respuestas telegráficas.
- Prototipado de asistentes de dominio deportivo con presupuesto de tokens ajustado: la salida corta encaja en entornos con límites estrictos de longitud de respuesta.

## Benchmarks y rendimiento

Evaluación sobre 600 preguntas reservadas, 4 muestras por pregunta (temperatura 1.0, top-p 0.95, hasta 4096 tokens de salida), con el adaptador servido por vLLM como módulo LoRA.

| Métrica | Modelo base | Base + adaptador |
|---|---|---|
| Exactitud global | 86,50 % | 97,71 % |
| Tokens de salida medios | 1565 | 107 |
| `run_rate` (exactitud) | 91,75 % | 99,00 % |
| `chase_rate` (exactitud) | 68,12 % | 94,62 % |
| `milestone` (exactitud) | 99,62 % | 99,50 % |
| Respuestas truncadas al límite de 4096 tokens | 9,42 % | 0 % |

No se han publicado resultados de benchmarks en la información disponible más allá de los anteriores. El autor advierte que se trata de una única ejecución con una única semilla y que diferencias de un punto o menos no son significativas.

## Requisitos de hardware

- El adaptador solo no es ejecutable: se necesita cargar el modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` (30B totales, 3B activos).
- VRAM estimada para inferencia: no disponible en la model card. Como referencia de orden de magnitud, un modelo de 30B en BF16 requiere del orden de 60 GB de pesos más overhead, y en cuantizaciones de 8 o 4 bits bajaría sustancialmente; no se aportan cifras verificadas.
- GPUs recomendadas: el entrenamiento se realizó en NVIDIA Vera Rubin (16 GPUs); para inferencia no se especifican modelos concretos.
- Cabe en GPU de consumo: no disponible; depende de la cuantización del modelo base, no documentada.
- Despliegue: vLLM con `--enable-lora --max-lora-rank 64 --reasoning-parser nemotron_v3` (probado con vLLM 0.31); PEFT con transformers 5.22.2 y peft 0.21.2 para aplicar o fusionar el adaptador.
- Latencia y throughput: no disponibles; la reducción de tokens de salida (1565 a 107) sugiere una mejora sustancial de latencia y coste, pero no se publican medidas.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada adaptadores comparables sobre el mismo modelo base ni alternativas documentadas con métricas equivalentes. La comparación relevante es la del propio adaptador frente al modelo base, recogida en la sección de benchmarks.

## Limitaciones y advertencias

- No es un modelo standalone: cargar el repositorio por sí solo no funciona; es obligatorio aplicar el adaptador sobre el modelo base o fusionarlo.
- Especialización estrecha: entrenado solo para preguntas numéricas de cricket T20; su comportamiento fuera de ese dominio no está evaluado y el estilo telegráfico puede degradar respuestas que requieran explicación.
- Estilo de respuesta extremadamente corto (unos 107 tokens): la recompensa premió la brevedad, por lo que cabe esperar respuestas escuetas incluso cuando se pida justificación.
- Resultados de una sola ejecución y una sola semilla: diferencias de hasta un punto no son significativas; la mejora en `milestone` es ligeramente negativa (99,62 % a 99,50 %).
- El adaptador contiene 198 tensores, de los cuales 12 pertenecen a dos capas `mtp` que PEFT omite (carga 186); esto puede generar diferencias entre la versión de NeMo Automodel y la de transformers.
- Licencia no disponible: no se puede confirmar el uso comercial del adaptador; además, el uso queda sujeto a la licencia del modelo base de NVIDIA, que no se detalla en la información proporcionada.
- Sin datos de sesgos, idiomas soportados ni robustez frente a entradas adversariales.
- Riesgo de alucinación en el número final fuera del dominio de entrenamiento; la recompensa solo valida exactitud numérica, no la corrección del razonamiento intermedio.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Balab2021/Nemotron-3.5-Lightning-30B-A3B-Cricket-NeMo-RL-Rhea
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/Balab2021/CricketData-T20-Reasoning-Qwen3.8-Full
- NeMo RL: https://github.com/NVIDIA-NeMo/RL
- Registro del entrenamiento en Weights & Biases: https://wandb.ai/balabala76/nemotron35-cricket-nemo-rl-rhea

# andresnowak/qwen38-27b-math-grpo-baseline-drgrpo-step100

## Resumen

`andresnowak/qwen38-27b-math-grpo-baseline-drgrpo-step100` es un checkpoint de investigación publicado por el usuario andresnowak, resultado de un ajuste por refuerzo (RL) de 100 pasos sobre el modelo `Qwen/Qwen3.8-27B`. No es un lanzamiento depurado ni un modelo recomendado para uso general: se trata del **brazo de control** de un experimento en curso que investiga si recompensar una cadena de pensamiento "monitorizable" cambia la forma en que el modelo razona. En este brazo la recompensa es únicamente la corrección de la respuesta, sin ningún término adicional de monitorabilidad.

El modelo tiene 27.356.728.560 parámetros (unos 27,36 mil millones) según los pesos en safetensors, ocupa 54,7 GB en el repositorio y se distribuye bajo licencia Apache 2.0. El entrenamiento se hizo con el algoritmo GRPO con la corrección Dr.GRPO (las ventajas no se dividen por la desviación típica del grupo), usando el framework NeMo RL de NVIDIA y el conjunto de datos AceReason-Math.

Su relevancia es metodológica, no de producto: sirve como referencia frente al brazo de tratamiento `qwen38-27b-math-grpo-monitor-drgrpo-step100`, idéntico salvo por un término de monitorabilidad en la recompensa. El autor advierte explícitamente de que no se ha realizado ninguna evaluación de seguridad, rechazo o capacidades, y de que se publica como control experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No documentada en la model card; la etiqueta del repositorio es `qwen3_5` y la familia base es Qwen. Detalle de capas, atención y tipo de transformer: no disponible |
| Parametros totales | 27.356.728.560 (≈27,36 B) según los pesos en safetensors |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible: no se publican versiones cuantizadas, solo pesos originales |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 54,7 GB), librería transformers |
| Pipeline declarado | reinforcement-learning |
| Modalidad declarada | `image-text-to-text` en las etiquetas del repositorio; el ejemplo de uso de la model card emplea `AutoModelForCausalLM`, propio de modelos de texto |
| Modelo base | `Qwen/Qwen3.8-27B` (etiquetas `base_model` y `base_model:finetune`) |
| Framework de entrenamiento | NeMo RL |
| Fecha de creacion / actualizacion | 23 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo (número de capas, tipo de atención, estrategia posicional ni componentes multimodales), más allá de que hereda la de `Qwen/Qwen3.8-27B` y de la etiqueta `qwen3_5` del repositorio. Lo que sí está documentado es el procedimiento de ajuste: GRPO con la corrección Dr.GRPO, en la que las ventajas no se normalizan dividiendo por la desviación típica del grupo. El entrenamiento se ejecutó con NeMo RL durante 100 pasos, con una tasa de aprendizaje de 1e-6 con decaimiento coseno hasta 1e-7, 10 iteraciones de calentamiento, decaimiento de pesos 0.0 y paralelismo TP=4, PP=2.

La recompensa es exclusivamente `reward = correctness`, sin término de monitorabilidad. El brazo de tratamiento añade un factor `(1 + 0.1 × monitor_score)`, donde la puntuación procede de un modelo monitor débil (`HuggingFaceTB/SmolLM3-3B`) que lee la traza de razonamiento. Los datos de entrenamiento provienen de AceReason-Math. El presupuesto de cómputo es pequeño: 16 prompts × 8 generaciones = 128 muestras por paso, con 4.026 tokens de media por muestra (prompt + generado) y 3.873 tokens generados de media, lo que da aproximadamente 515.000 tokens por paso y unos 51,5 millones de tokens en total a lo largo de los 100 pasos (unos 49,6 millones generados).

No se documenta ningún proceso de RLHF, DPO ni SFT adicional, ni innovaciones técnicas propias más allá de la corrección Dr.GRPO y del diseño experimental de monitorabilidad.

## Capacidades

- Generación de texto y razonamiento matemático con cadena de pensamiento: el modelo está ajustado sobre AceReason-Math y produce trazas de razonamiento extensas (una media de 3.873 tokens generados por muestra).
- Resolución de problemas de matemáticas: es el dominio objetivo del ajuste, aunque no se han publicado evaluaciones que cuantifiquen la mejora.
- Razonamiento multi-paso: el entrenamiento con GRPO sobre trazas de cadena de pensamiento favorece la descomposición en pasos intermedios.
- Generación de código: capacidad potencialmente heredada del modelo base, pero no verificada ni evaluada en este checkpoint.
- Capacidades multimodales: la etiqueta `image-text-to-text` del repositorio sugiere entrada de imagen y texto, pero el ejemplo de uso de la model card es de modelo causal de lenguaje (`AutoModelForCausalLM`). No hay confirmación ni evaluación disponible.
- Multilingüismo: no disponible. El repositorio no declara idiomas y no se ha evaluado el comportamiento por idioma.
- Tool calling / function calling: no disponible; no se menciona soporte ni se ha evaluado.
- Modo de razonamiento explícito ("thinking mode"): no se declara como característica formal, aunque el ajuste se apoya en trazas de cadena de pensamiento monitorizables.
- Capacidades de agente: no disponible; no se han realizado evaluaciones de agentes ni de razonamiento multi-paso con herramientas.

## Casos de uso

- Estudio de monitorabilidad de cadenas de pensamiento: este checkpoint actúa como brazo de control frente al modelo con término de monitorabilidad en la recompensa. Se usaría para comparar, con idéntico presupuesto de tokens y datos, si premiar trazas monitorizables altera la estructura y la legibilidad del razonamiento.
- Reproducción de experimentos de RL con GRPO y corrección Dr.GRPO: la model card documenta hiperparámetros completos (LR, decaimiento, warmup, paralelismo TP=4/PP=2, tamaño de lote), lo que permite reproducir o extender el experimento con NeMo RL.
- Análisis de deriva a corto plazo en RL: con solo 100 pasos y unas 12.800 muestras totales, el checkpoint sirve para medir cuánto se desvía un modelo de su base tras un ajuste mínimo, y a partir de qué punto empiezan a aparecer artefactos.
- Evaluación de la longitud y estructura del razonamiento: la media de 3.873 tokens generados por muestra es un dato medible y comparable frente al brazo de tratamiento, útil para estudios de "verbosidad" inducida por la función de recompensa.
- Punto de partida para ajustes posteriores: al ser un finetune del modelo base con licencia Apache 2.0, puede emplearse como inicialización de experimentos con más pasos, más datos o recompensas compuestas, siempre asumiendo que su calidad no está validada.
- Comparación de políticas en investigación sobre recompensas auxiliares: sirve como política de referencia "sin shaping" para aislar el efecto de cualquier término adicional de recompensa en trabajos de RL con verificación.
- Docencia y divulgación técnica: ilustra de forma concreta un pipeline de RL para matemáticas con NeMo RL, incluyendo el detalle del presupuesto de tokens y el esquema de paralelismo, aunque no debe presentarse como modelo de producción.
- Referencia negativa en auditorías de trazas: útil para construir conjuntos de trazas "no optimizadas para monitorización" contra los que medir la detectabilidad de razonamientos incorrectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se ha realizado ninguna evaluación de seguridad, rechazo o capacidades sobre este checkpoint.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (27,36 B) y de los formatos de pesos; no hay mediciones publicadas por el autor.

- VRAM para inferencia en bf16/fp16: pesos de unos 54,7 GB, más caché KV y activaciones. En la práctica requiere del orden de 65 a 80 GB de VRAM para contexto moderado.
- GPU recomendadas para bf16: una A100 80 GB o H100 80 GB en una sola tarjeta; alternativamente dos GPU de 48 GB (A6000 Ada, L40S, H100 48 GB) con tensor parallelism.
- VRAM en 8 bits: pesos de unos 27 a 30 GB; encaja en A100 40 GB con margen ajustado o en tarjetas de 48 GB.
- VRAM en 4 bits: pesos de unos 14 a 16 GB; cabe en GPU de consumo como RTX 4090, RTX 3090 o RTX 5090 (24 GB o más), dejando poco margen para contextos largos.
- Inferencia en CPU: posible con conversión a formatos de peso de llama.cpp, pero el repositorio no publica GGUF; habría que generarlo y contar con al menos 64 GB de RAM para cuantizaciones de 4 bits.
- Opciones de despliegue: transformers (patrón documentado en la model card con `dtype=torch.bfloat16` y `device_map="auto"`), vLLM, TGI o SGLang para servir en GPU. Ollama y llama.cpp requieren conversión previa a GGUF, no disponible en el repositorio.
- Nota sobre el paralelismo: TP=4/PP=2 corresponde a la configuración de entrenamiento, no necesariamente a la de inferencia óptima.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de terceros en la información proporcionada. La comparación más pertinente es con el brazo de tratamiento y con el modelo base.

| Modelo | Parametros | Contexto | Datos de RL | Recompensa | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|---|
| `qwen38-27b-math-grpo-baseline-drgrpo-step100` (este) | 27,36 B | no disponible | AceReason-Math, 100 pasos, ~51,5 M tokens | Solo correccion | Apache 2.0 | No |
| `qwen38-27b-math-grpo-monitor-drgrpo-step100` | no disponible en la informacion facilitada | no disponible | Identicos (brazo de tratamiento) | Correccion × (1 + 0,1 × monitor_score) | Apache 2.0 | No |
| `Qwen/Qwen3.8-27B` (base) | no disponible | no disponible | No aplica | No aplica | No disponible en la informacion facilitada | No disponible |

No se han facilitado datos de otros modelos comparables de la misma categoría (ajustes de RL para matemáticas en el rango de 25 a 30 B de parámetros), por lo que no se puede establecer una comparación de rendimiento con alternativas externas.

## Limitaciones y advertencias

- Checkpoint experimental, no una release ajustada. El autor indica explícitamente que se publica como control y no como modelo recomendado para uso.
- Una sola semilla, un solo conjunto de datos y solo 100 pasos. Los resultados no son estadísticamente interpretables como una mejora de capacidad.
- Ausencia total de evaluación de seguridad, de rechazo y de capacidades. No hay datos de benchmarks, por lo que el rendimiento real frente al modelo base es desconocido.
- Riesgo de alucinación no medido. Al ser un ajuste por RL de solo 100 pasos sobre datos de matemáticas, se desconoce si degrada el comportamiento fuera del dominio.
- Restricciones de licencia: el checkpoint es Apache 2.0, pero hereda todas las limitaciones y la licencia del modelo base `Qwen/Qwen3.8-27B`, cuya licencia no se detalla en la información proporcionada. Conviene verificar los términos del base antes de cualquier uso comercial.
- Discrepancia de modalidad sin resolver: las etiquetas del repositorio declaran `image-text-to-text`, mientras que el ejemplo de uso es `AutoModelForCausalLM`. No debe asumirse capacidad de visión sin verificarla.
- Idiomas no declarados y contexto no documentado: no se puede garantizar comportamiento multilingüe ni un tamaño de ventana concreto.
- Cero descargas y cero likes: el modelo no ha sido validado por la comunidad y no hay informes externos de uso.
- Uso en producción desaconsejado: sin evaluación de robustez, sin medidas de alineación y con un presupuesto de entrenamiento muy reducido, no es adecuado para aplicaciones con usuarios finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andresnowak/qwen38-27b-math-grpo-baseline-drgrpo-step100
- Brazo de tratamiento (monitorabilidad): https://huggingface.co/andresnowak/qwen38-27b-math-grpo-monitor-drgrpo-step100
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.8-27B
- Framework NeMo RL: https://github.com/NVIDIA-NeMo/RL
- Modelo monitor citado (`HuggingFaceTB/SmolLM3-3B`): no se proporciona enlace en la información disponible
- Conjunto de datos AceReason-Math: no se proporciona enlace en la información disponible
- Paper de GRPO o Dr.GRPO: no se proporciona enlace en la información disponible

# CivMarshmallow/Baselines-Qwen3-8B

## Resumen

Baselines-Qwen3-8B es una colección de políticas de referencia para agentes que juegan a Freeciv, entrenadas mediante aprendizaje por refuerzo sobre el modelo base Qwen/Qwen3-8B. El autor, CivMarshmallow, publica estos checkpoints como línea base (baseline) del artículo *Rome Wasn't Built in One Turn: Replay-Grounded Reward Signals for Long-Horizon Freeciv Agents*, en el que se comparan dos señales de recompensa: una recompensa dispersa (sparse) basada únicamente en la puntuación terminal del juego y una recompensa densa (scoreboard) basada en la puntuación corriente de Freeciv.

El modelo no es un modelo de propósito general, sino un artefacto de investigación: 24 checkpoints finales (2 esquemas de recompensa × 4 fases de entrenamiento × 3 semillas) que sirven para medir la ganancia de puntuación en un conjunto de evaluación de 45 posiciones por fase. El agente usa Qwen3-8B con el modo de razonamiento (thinking) desactivado y se entrena con un calendario de cuatro fases (rem20, rem40, rem80, rem120), donde remN indica que quedan N turnos en una partida de 120 turnos, partiendo cada fase del checkpoint final de la anterior.

La relevancia es metodológica: proporciona un punto de comparación reproducible frente a las políticas CivMarshmallow y el juez CivTelescope del mismo autor, y permite estudiar cómo distintas señales de recompensa afectan al rendimiento en horizontes largos de decisión. La licencia es Apache 2.0 y el repositorio ocupa 393,2 GB, ya que contiene todos los checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B); ajustada con RL para agente de juego |
| Parametros totales | 8 000 millones (aproximado, segun el modelo base Qwen3-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (checkpoints publicados en bfloat16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer decoder-only de aproximadamente 8 000 millones de parámetros. Sobre esa base, el autor aplica aprendizaje por refuerzo con dos funciones de recompensa: sparse, que solo utiliza la puntuación terminal disponible al final de la partida, y scoreboard, que emplea la puntuación corriente de Freeciv como recompensa densa. El agente opera con el modo thinking desactivado.

El entrenamiento sigue un calendario de cuatro fases (rem20, rem40, rem80, rem120) sobre partidas de 120 turnos, donde cada fase arranca desde el checkpoint final de la fase precedente. Se entrenan tres semillas por configuración (43, 44 y 45), lo que da un total de 24 checkpoints finales organizados en la estructura `<reward>/<phase>/seed<seed>/`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas adicionales como DPO o decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento dentro del dominio del juego Freeciv (no es un modelo de propósito general).
- Toma de decisiones secuenciales multi-turno como agente de juego, con horizonte de hasta 120 turnos.
- Política entrenada con recompensa sparse (puntuación terminal) o scoreboard (puntuación densa), según el checkpoint elegido.
- Ejecución con el modo thinking desactivado de Qwen3-8B.
- Capacidades multilingües: solo inglés declarado en la model card.
- No se documentan en la información disponible capacidades de tool calling, function calling, visión, audio ni agentes de propósito general más allá del entorno Freeciv.

## Casos de uso

- Investigación en aprendizaje por refuerzo para agentes de juego: usar los checkpoints como línea base frente a nuevas señales de recompensa en Freeciv, comparando la ganancia de puntuación por fase.
- Estudio de recompensas dispersas frente a densas: los pares sparse/scoreboard permiten aislar el efecto de la señal de recompensa en el mismo calendario de entrenamiento y semillas.
- Reproducibilidad de experimentos: las tres semillas por configuración permiten estimar varianza y validar resultados de forma estadística.
- Evaluación de transferencia entre fases: los checkpoints rem20, rem40, rem80 y rem120 permiten analizar cómo evoluciona la política a medida que se alarga el horizonte restante.
- Comparación con políticas CivMarshmallow y el juez CivTelescope: sirven como referencia para medir mejoras relativas en el conjunto de evaluación de 45 posiciones por fase.
- Docencia y divulgación sobre RL en entornos de decisión de largo horizonte: el repositorio estructurado por recompensa, fase y semilla facilita experimentos controlados.

## Benchmarks y rendimiento

Ganancia de fase retenida G: cambio en la puntuación terminal media sobre el conjunto de evaluación de 45 posiciones de cada fase, promediado sobre tres semillas.

| Recompensa | rem20 | rem40 | rem80 | rem120 |
|---|---|---|---|---|
| sparse | 0,53 | **7,11** | 5,04 | 2,87 |
| scoreboard | **2,72** | 3,68 | 0,83 | 4,87 |
| CivTelescope (CivMarshmallow) | 0,62 | 3,61 | **8,94** | 2,77 |
| scoreboard → CivTelescope (CivMarshmallow) | – | – | – | **5,21** |
| sparse → CivTelescope (CivMarshmallow) | – | – | – | 5,15 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 8 000 millones de parámetros en bfloat16 se requiere del orden de 16 GB solo para pesos, más memoria para contexto y estados de inferencia.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cabría en GPU de 24 GB o más (por ejemplo, RTX 4090, A100, H100) en bfloat16, y en GPU de consumo menores con cuantización, aunque el autor no publica versiones cuantizadas.
- Cabe en GPU de consumo: previsiblemente sí en modelos con 24 GB o más en bfloat16; no confirmado por el autor.
- Opciones de despliegue: carga mediante `transformers` con `AutoModelForCausalLM.from_pretrained` y `subfolder` para seleccionar el checkpoint; descarga selectiva con `hf download --include`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (G en rem120) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Baselines-Qwen3-8B (sparse) | ~8 000 M | no disponible | 2,87 | apache-2.0 | Hugging Face |
| Baselines-Qwen3-8B (scoreboard) | ~8 000 M | no disponible | 4,87 | apache-2.0 | Hugging Face |
| CivMarshmallow-Qwen3-8B (CivTelescope) | ~8 000 M | no disponible | 2,77 (5,21 con scoreboard → CivTelescope) | no disponible | Hugging Face |
| Qwen3-8B (base) | ~8 000 M | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Modelo de dominio específico: entrenado exclusivamente para Freeciv; su uso fuera de ese entorno no está validado.
- Solo inglés declarado; no se garantiza comportamiento en otros idiomas.
- Riesgo de alucinación y de decisiones subóptimas fuera de la distribución de entrenamiento, especialmente en fases con horizontes distintos a los entrenados.
- Resultados dependientes de la semilla: las ganancias se promedian sobre tres semillas y varían notablemente entre fases (por ejemplo, sparse pasa de 0,53 en rem20 a 7,11 en rem40).
- Repositorio de gran tamaño (393,2 GB) por contener 24 checkpoints; conviene descargar solo el subdirectorio necesario.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B puede tener condiciones adicionales que deben verificarse en su propia model card.
- No se documentan cuantizaciones oficiales, por lo que el despliegue en hardware limitado requiere conversión manual no soportada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CivMarshmallow/Baselines-Qwen3-8B
- Políticas CivMarshmallow: https://huggingface.co/CivMarshmallow/CivMarshmallow-Qwen3-8B
- Juez CivTelescope: https://huggingface.co/CivMarshmallow/CivTelescope
- Código: https://github.com/jamesnulliu/CivMarshmallow
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B

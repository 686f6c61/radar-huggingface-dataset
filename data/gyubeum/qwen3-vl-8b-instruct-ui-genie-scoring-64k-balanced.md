# Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-scoring-64k-balanced

## Resumen

Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-scoring-64k-balanced es un modelo de recompensa (reward model) basado en el paradigma Bradley-Terry, desarrollado por Gyubeum como variante balanceada del modelo `-scoring` original. Se construye sobre `Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie`, que a su vez es un fine-tuning SFT de `Qwen/Qwen3-VL-8B-Instruct`, el modelo multimodal de visión-lenguaje de Qwen. Su propósito es emitir una puntuación escalar continua que evalúe la calidad de una trayectoria de acciones de un agente de interfaz gráfica (GUI), sirviendo como señal de recompensa para entrenamiento con PPO/GRPO o selección best-of-N.

El modelo añade una cabeza lineal (`score.weight`) sobre el estado oculto del último token no padding de la secuencia, produciendo un único valor flotante por entrada. Se entrenó con pérdida por pares Bradley-Terry sobre un subconjunto de 64.000 ejemplos balanceados por clase del dataset `UI-Genie-RM-517k`, con LoRA fusionada y dtype bfloat16. A diferencia de su contraparte no balanceada, este checkpoint muestra un rendimiento al azar en el benchmark de evaluación proporcionado, lo que lo hace poco adecuado para uso directo como señal de recompensa fiable, aunque conserva la arquitectura y el flujo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration + cabeza lineal `score.weight` (seq_cls, regresión, num_labels=1) |
| Parametros totales | 8.144.797.936 (~8,14 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo bfloat16 documentado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con índice de shards) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen3-VL-8B-Instruct`, un transformer multimodal que procesa imágenes y texto, y se adapta como clasificador de secuencias con una cabeza de regresión lineal. La puntuación se calcula como `score = score_head(hidden_states[:, last_non_padding_index, :])`, es decir, se proyecta el estado oculto del último token no padding a un escalar. Esta cabeza no está integrada en la clase base `Qwen3VLForConditionalGeneration`, por lo que debe cargarse manualmente desde los shards de safetensors.

El entrenamiento utilizó la pérdida por pares Bradley-Terry, con LoRA que posteriormente se fusionó en los pesos principales. El dataset de entrenamiento fue un subconjunto de 64.000 ejemplos balanceados por clase extraído de `UI-Genie-RM-517k`, un corpus de preferencias de acciones GUI. El entrenamiento se realizó en bfloat16 y la cabeza de puntuación se guardó por separado en los checkpoints de DeepSpeed, lo que obliga a reconstruirla manualmente al cargar el modelo. No se documentan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas adicionales como RLHF o DPO más allá de la pérdida Bradley-Terry.

## Capacidades

- Emisión de una puntuación escalar continua (sin límite superior) que refleja la calidad de una trayectoria de acciones GUI, utilizable como señal de recompensa en algoritmos de RL (PPO, GRPO) o para selección best-of-N.
- Procesamiento multimodal: acepta entradas de imagen y texto, lo que permite evaluar capturas de pantalla junto con el historial de acciones.
- Clasificación de secuencias con regresión de una sola etiqueta, a diferencia de los clasificadores discretos que emiten preferencias binarias.
- Inferencia mediante HuggingFace `transformers`; no compatible con el cargador de vLLM para `Qwen3VLForConditionalGeneration` debido al tensor extra `score.weight`.
- Capacidad de separar puntuaciones con márgenes amplios (rango observado de −17,75 a +18,38), aunque dicha separación no correlaciona con el éxito real de las acciones en el benchmark evaluado.

## Casos de uso

- Entrenamiento de agentes GUI con RL: el modelo puede proporcionar la señal de recompensa escalar necesaria para algoritmos como PPO o GRPO, evaluando cada paso de acción del agente sobre capturas de pantalla. Sin embargo, dado su rendimiento al azar en la evaluación, se recomienda validar previamente su utilidad en el dominio específico.
- Selección best-of-N de acciones: dado un conjunto de N acciones candidatas generadas por un modelo de políticas, el reward model puntúa cada una y selecciona la de mayor valor, mejorando la calidad de la trayectoria final sin necesidad de reentrenar.
- Evaluación offline de políticas de agentes GUI: permite comparar diferentes versiones de un agente puntuando sus trayectorias en un entorno simulado, sin interacción en vivo.
- Filtrado de datos para fine-tuning: las puntuaciones pueden usarse para filtrar o ponderar ejemplos de entrenamiento, priorizando aquellos con mayor recompensa predicha.
- Análisis de preferencias humanas: al estar entrenado con pares de preferencias, puede servir para modelar la utilidad implícita de distintas estrategias de recuperación de errores en interfaces Android.
- Investigación académica sobre reward models multimodales: sirve como punto de partida para estudiar el efecto del balanceo de clases en el entrenamiento de modelos de recompensa para GUI, comparándolo con su variante no balanceada.

## Benchmarks y rendimiento

El autor evaluó el modelo en el conjunto `android_flux_recovery_action_preference` de `Gyubeum/AndroidFlux_RM_Eval`, con 94 pares de acciones candidatas de recuperación. Los resultados se muestran a continuación:

| Modelo | Precisión por pares | Empates | Margen medio |
|---|---|---|---|
| `-scoring` (no balanceado, 64k) | 0,6064 (57/94) | 0 | +1,381 |
| **Este modelo** (balanceado, 64k) | **0,4894** (46/94) | 1 | +0,471 |
| `UI-Genie` (SFT discreto) | 0,0106 (1/94) | 90 | −0,021 |

Desglose por subconjunto del benchmark para este modelo:

| Subconjunto | Pares | Precisión |
|---|---|---|
| `clean_path` | 56 | 0,4821 |
| `error_path` | 38 | 0,5000 |
| `success_rate` | 65 | 0,4615 |
| `combined_success_length` | 29 | 0,5517 |

El autor indica que el modelo rinde al nivel del azar en este benchmark, con un intervalo de confianza del 95% de aproximadamente ±10 puntos debido al pequeño tamaño de la muestra (n=94). No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~8,14 mil millones de parámetros en bfloat16, se requieren aproximadamente 16 GB de VRAM solo para los pesos, más memoria adicional para las activaciones y el procesamiento de imágenes. Una GPU con 24 GB (p. ej., RTX 3090/4090) sería suficiente para inferencia básica.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090 o similares con soporte para bfloat16. No se documentan requisitos oficiales.
- Compatibilidad con GPUs de consumo: sí, una RTX 3090 o 4090 puede ejecutar el modelo, aunque la carga manual de `score.weight` y el procesamiento de imágenes aumentan el consumo de memoria.
- Opciones de despliegue: no compatible con vLLM; debe usarse HuggingFace `transformers` directamente. No se mencionan integraciones con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Precisión en benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `-scoring-64k-balanced` (este) | Qwen3-VL-8B-Instruct-UI-Genie | Reward model Bradley-Terry (balanceado) | 0,4894 | Apache 2.0 | HuggingFace |
| `-scoring` (no balanceado) | Qwen3-VL-8B-Instruct-UI-Genie | Reward model Bradley-Terry (no balanceado) | 0,6064 | Apache 2.0 | HuggingFace |
| `UI-Genie` (SFT discreto) | Qwen3-VL-8B-Instruct | Clasificador discreto de preferencias | 0,0106 | Apache 2.0 | HuggingFace |

La comparativa se limita a los modelos relacionados publicados por el mismo autor, ya que no se dispone de información sobre otros reward models de GUI comparables en la documentación.

## Limitaciones y advertencias

- Rendimiento al azar en el benchmark de evaluación proporcionado: el modelo no discrimina entre acciones exitosas y fallidas en el conjunto `android_flux_recovery_action_preference`, lo que lo hace inadecuado como señal de recompensa fiable sin una validación adicional en el dominio objetivo.
- Incompatibilidad con vLLM: el tensor `score.weight` no es soportado por el cargador estándar de vLLM, por lo que la inferencia requiere HuggingFace `transformers` y la carga manual de la cabeza de puntuación.
- Riesgo de alucinación y sesgos: al derivar de un modelo multimodal preentrenado, puede heredar sesgos de los datos de entrenamiento originales de Qwen3-VL, aunque no se documentan evaluaciones específicas de sesgo.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto soportada ni los idiomas cubiertos; el modelo se centra en tareas de GUI, presumiblemente con capturas de pantalla en inglés u otros idiomas, pero sin confirmación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Dependencia de la carga manual: la cabeza de puntuación no está integrada en la clase base, lo que añade complejidad al despliegue y riesgo de errores si se omite su carga.
- Tamaño de muestra pequeño en la evaluación: con solo 94 pares, los resultados tienen un margen de error amplio (±10 puntos), por lo que las diferencias con otros modelos deben interpretarse con cautela.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-scoring-64k-balanced)
- [Modelo base `-scoring` (no balanceado)](https://huggingface.co/Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-scoring)
- [Modelo base `UI-Genie` (SFT discreto)](https://huggingface.co/Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie)
- [Dataset de entrenamiento `UI-Genie-RM-517k`](https://huggingface.co/datasets/UI-Genie/UI-Genie-RM-517k)
- [Dataset de evaluación `AndroidFlux_RM_Eval`](https://huggingface.co/datasets/Gyubeum/AndroidFlux_RM_Eval)
- [Paper técnico de Qwen3 (arXiv:2505.09388)](https://arxiv.org/abs/2505.09388)

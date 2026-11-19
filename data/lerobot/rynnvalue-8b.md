# lerobot/RynnValue-8B

## Resumen

RynnValue-8B es un modelo de valor (value model) para robótica, condicionado por lenguaje y construido sobre Qwen3-VL. Dado un vídeo de trayectoria y una descripción de la tarea, predice el tiempo restante en segundos hasta la finalización de la tarea, además de una señal de éxito. Lo desarrolla el equipo de LeRobot (Hugging Face) y se distribuye con licencia Apache 2.0.

El modelo resuelve un problema concreto en el aprendizaje por refuerzo y la evaluación de políticas robóticas: proporcionar una función de recompensa densa y aprendida que no requiere definir manualmente métricas de éxito. Al estimar el tiempo restante como proxy del progreso, permite ordenar trayectorias, filtrar datos de baja calidad y guiar procesos de RL sin supervisión explícita por paso.

Con 9.574.961.904 parámetros (aproximadamente 9,6 mil millones) y un repositorio de 19,2 GB en safetensors, es un modelo de gran tamaño para el ecosistema robótico, donde predominan los modelos de política ligeros. Su integración es exclusivamente de inferencia dentro de LeRobot: no puede entrenarse con `lerobot-train`. La fecha de creación en el repositorio es el 19 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer basada en Qwen3-VL (modelo base: Alibaba-DAMO-Academy/RynnValue-8B) |
| Parametros totales | 9.574.961.904 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RynnValue-8B es un fine-tuning del modelo Alibaba-DAMO-Academy/RynnValue-8B, que a su vez se apoya en la arquitectura Qwen3-VL. Se trata, por tanto, de un transformer multimodal que procesa entradas de vídeo (trayectorias) junto con instrucciones en lenguaje natural. La cabeza de salida no es generativa en el sentido habitual: el modelo expone dos predicciones, `predict_remaining_time` (tiempo restante en segundos) y `predict_success` (indicador de éxito), lo que lo convierte en un modelo de valor/recompensa más que en un modelo de lenguaje general.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La única señal metodológica es la etiqueta `temporal-distance`, que sugiere que el objetivo de entrenamiento se basa en la distancia temporal hasta la finalización de la tarea. No se han publicado detalles sobre innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Predicción de tiempo restante hasta completar una tarea a partir de un vídeo de trayectoria y una descripción textual de la tarea.
- Predicción de éxito de la tarea (señal binaria de finalización).
- Comprensión de vídeo: procesa secuencias visuales de trayectorias robóticas.
- Condicionamiento por lenguaje: la tarea se especifica en lenguaje natural.
- Generación de recompensas densas para RL y evaluación de políticas.
- Integración nativa con LeRobot mediante `RewardModelConfig` y `make_reward_model`.
- No soporta tool calling, function calling ni comportamiento de agente multi-paso según la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Evaluación automática de políticas robóticas: dado un rollout grabado, el modelo estima el tiempo restante y el éxito, permitiendo puntuar políticas sin métricas manuales por tarea.
- Filtrado de datos de demostración: ordenar trayectorias por progreso estimado y descartar aquellas con señal de éxito baja antes de entrenar políticas de imitación.
- Recompensa densa para RL offline: usar la predicción de tiempo restante como función de recompensa en algoritmos de aprendizaje por refuerzo que requieren señal por transición.
- Detección temprana de fallos: monitorizar en tiempo real el tiempo restante predicho; si no decrece, la política probablemente ha divergido y puede abortarse la ejecución.
- Selección de checkpoints: comparar variantes de una política sobre el mismo conjunto de tareas usando la señal de éxito y el tiempo restante estimado como criterio objetivo.
- Anotación semiautomática de datasets: etiquetar clips con un indicador de progreso y éxito para construir datasets de recompensa o de evaluación a mayor escala.
- Investigación en value learning: servir como referencia o inicialización para estudiar modelos de valor condicionados por lenguaje en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,57 mil millones de parámetros, en FP16 se requieren aproximadamente 19 GB solo para pesos, más memoria para activaciones y el codificador visual; en BF16/FP16 se recomienda al menos 24 GB. En cuantización de 8 bits, alrededor de 10-12 GB; en 4 bits, alrededor de 6-7 GB (estimaciones, no verificadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para inferencia en precisión completa sin compromisos.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar los pesos en FP16 con margen ajustado; para GPUs de 16 GB o menos sería necesaria cuantización, cuya disponibilidad no está confirmada.
- Opciones de despliegue: la vía documentada es LeRobot (`RewardModelConfig` + `make_reward_model`). No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, y al no ser un modelo generativo estándar su integración en esos servidores no está garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada. La comparación se limita a características estructurales conocidas.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RynnValue-8B (lerobot) | 9,57 B | no disponible | Value/reward model multimodal (Qwen3-VL) | Apache 2.0 | Hugging Face, inferencia en LeRobot |
| Alibaba-DAMO-Academy/RynnValue-8B | no disponible | no disponible | Value model multimodal (modelo base) | no disponible | Hugging Face |
| Qwen3-VL (familia base) | no disponible | no disponible | Vision-language generativo | no disponible | Hugging Face |

## Limitaciones y advertencias

- Modelo de inferencia únicamente en LeRobot: no puede reentrenarse con `lerobot-train`, lo que limita el ajuste fino a dominios específicos.
- La predicción de tiempo restante depende de la calidad y del dominio de los datos de entrenamiento; fuera de la distribución de tareas vistas, la señal puede ser poco fiable.
- Riesgo de alucinación en la estimación de éxito: un falso positivo puede validar políticas defectuosas en pipelines de evaluación automática.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (Alibaba-DAMO-Academy/RynnValue-8B) y Qwen3-VL podrían tener condiciones adicionales que conviene verificar antes de desplegar en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia pública de uso en producción.
- No se documentan requisitos de hardware, latencias ni procesos de cuantización oficiales; las estimaciones de VRAM son cálculos a partir del número de parámetros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lerobot/RynnValue-8B
- Modelo base: https://huggingface.co/Alibaba-DAMO-Academy/RynnValue-8B
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index

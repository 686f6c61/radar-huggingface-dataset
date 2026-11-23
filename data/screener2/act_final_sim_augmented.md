# Screener2/act_Final_Sim_Augmented

## Resumen

`Screener2/act_Final_Sim_Augmented` es una política de imitación basada en Action Chunking with Transformers (ACT), el método presentado por Zhao et al. en el paper arXiv:2304.13705. El modelo lo publica el usuario Screener2 en Hugging Face y se ha entrenado y empaquetado con LeRobot, la librería de robótica de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que mapea observaciones (estado articular de 6 dimensiones e imagen de una cámara cenital de 480x640) a comandos de acción de 6 dimensiones para un robot tipo `so_follower` (Standard Open Arm, seguidor).

El modelo resuelve una tarea concreta de manipulación aprendida por imitación a partir de 27 episodios teleoperados (11.425 fotogramas a 30 FPS) del dataset `Screener2/Final_Sim_Augmented`. La tarea está etiquetada simplemente como "0". Emplea 51.668.614 parámetros (unos 51,7 M) y ocupa 0,2 GB en el repositorio. Su relevancia es limitada: se trata de un artefacto de entrenamiento reproducible, no de un modelo generalista, y no incluye resultados de evaluación en robot real.

La arquitectura ACT predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza el control. El modelo se distribuye bajo licencia Apache 2.0 y formato safetensors, y está pensado para ejecutarse con el comando `lerobot-rollout` sobre hardware SO-100/SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por la política) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB, librería lerobot) |

## Arquitectura y entrenamiento

ACT combina un codificador visual (procesa la imagen cenital de 3x480x640) con un transformer que fusiona la observación visual y el estado articular `(6,)` para predecir un chunk de acciones de forma `(6,)` por paso. La innovación del método original es la predicción de secuencias de acciones con un objetivo de tipo L1 y una regularización de la varianza del chunk (CVAE), que mitiga el problema de la multimodalidad en datos teleoperados. El repositorio no detalla la configuración interna de capas, dimensión oculta ni número de cabezas.

El entrenamiento se realizó con LeRobot 0.5.2 durante 100.000 pasos, batch de 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. El dataset contiene 27 episodios y 11.425 fotogramas a 30 FPS, una cantidad muy reducida que limita la generalización. No se documenta el uso de RLHF, DPO ni aumentos de datos más allá de lo que sugiere el nombre "Augmented" del dataset, cuyo contenido no se detalla en la información disponible.

## Capacidades

- Control visomotor por imitación: genera comandos de acción de 6 dimensiones a partir de estado articular e imagen cenital.
- Predicción de chunks de acción, lo que reduce la frecuencia efectiva de inferencia y suaviza la trayectoria.
- Ejecución sobre robot `so_follower` (familia SO-100/SO-101) con una única cámara `overhead`.
- Integración con el ecosistema LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de una tarea de manipulación concreta: el modelo ejecuta la política entrenada para la tarea "0" sobre un SO-Follower con cámara cenital, útil para validar el pipeline de LeRobot de extremo a extremo.
- Punto de partida para fine-tuning: sirve como inicialización para reentrenar con `lerobot-train` sobre un dataset propio del mismo robot y cámara, aprovechando los 100.000 pasos ya realizados.
- Benchmark interno de imitación: permite comparar variantes de ACT (con y sin aumentos de datos) sobre el mismo conjunto de 27 episodios para estudiar la sensibilidad al dataset.
- Docencia y prototipado en robótica de bajo coste: al ocupar 0,2 GB y 51,7 M de parámetros, se puede ejecutar en una GPU de consumo junto a un SO-100 para prácticas de aprendizaje por imitación.
- Validación de infraestructura de despliegue: útil para probar la integración de `lerobot-rollout`, calibración de cámaras y puertos serie antes de entrenar políticas propias.
- Investigación en chunking de acciones: base reproducible para experimentar con tamaños de chunk, tasas de control y esquemas de aumentación sobre un caso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 51,7 M de parámetros; holgadamente por debajo de 2 GB con overhead de framework.
- GPU recomendadas: cualquier GPU con al menos 4 GB, incluidas RTX 3050, RTX 4060, RTX 4090; también es viable en CPU para inferencia a baja frecuencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles en la información proporcionada; el control opera a 30 FPS según el dataset, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Screener2/act_Final_Sim_Augmented | 51,7 M | imagen 3x480x640 + estado (6,) | imitación ACT para so_follower | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas ACT de referencia en LeRobot | ~50 M (configuración típica) | similar | imitación ACT genérica | Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy (Chi et al.) | variable, típicamente decenas de M | imagen + estado | imitación con difusión | MIT/Apache según implementación | repos públicos |
| SmolVLA (Hugging Face) | ~450 M | imagen + lenguaje | VLA generalista | Apache 2.0 | Hugging Face |

La comparación se limita a categorías metodológicas: no se dispone de métricas de éxito comparables entre estos modelos en la información proporcionada. Este modelo es sustancialmente más pequeño que SmolVLA y carece de condicionamiento por lenguaje.

## Limitaciones y advertencias

- Dataset muy reducido (27 episodios, 11.425 fotogramas): alta probabilidad de sobreajuste y escasa generalización a posiciones, iluminación o distractores no vistos.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que no se puede afirmar su fiabilidad en producción.
- Tarea única etiquetada como "0": no es un modelo multiuso ni transferible sin reentrenamiento.
- Dependencia de hardware concreto: robot `so_follower` y una cámara `overhead` con resolución y nombres de observación específicos; cambios en la configuración invalidan la política.
- Sin capacidades lingüísticas ni de razonamiento: no debe presentarse como un modelo de lenguaje.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la especificidad del hardware hacen desaconsejable su uso comercial directo sin validación propia.
- El nombre "Sim_Augmented" sugiere entrenamiento con datos simulados o aumentados, pero la model card no detalla la composición ni la proporción real/simulado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Screener2/act_Final_Sim_Augmented
- Dataset de entrenamiento: https://huggingface.co/datasets/Screener2/Final_Sim_Augmented
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Screener2/Final_Sim_Augmented
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference

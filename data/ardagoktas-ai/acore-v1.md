# ardagoktas-ai/acore-v1

## Resumen

Acore (`acore-v1`) es un modelo de mundo predictivo (world model) de 27,58 millones de parámetros desarrollado de forma independiente por Arda Göktaş (`ardagoktas-ai`). No es un modelo de lenguaje generativo al uso, sino un núcleo cognitivo predictivo orientado a la simulación interna de estados, la estimación de estructuras de recompensa y la planificación mediante rollout en entornos desconocidos. Se distribuye bajo licencia Apache 2.0 y está implementado en PyTorch.

El modelo se presenta como un motor de planificación y razonamiento de propósito general: aprende transiciones de estado, dinámicas de recompensa y condiciones terminales en entornos diversos, con el objetivo de habilitar planificación zero-shot en mundos no vistos durante el entrenamiento. Su horizonte interno de simulación es de 64 pasos (`T=64`) y declara una longitud de contexto de 584 tokens.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación de tamaño reducido (0,3 GB de repositorio, checkpoint de 316 MB) con métricas de entrenamiento publicadas, sin benchmarks estándar de NLP ni datos sobre idiomas. Es un modelo para experimentación en reinforcement learning basado en modelos, no un sustituto de un LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo predictivo con codificación predictiva (predictive coding); detalles de capas no disponibles |
| Parametros totales | 27.581.846 (~27,6 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 584 tokens (horizonte interno de simulación T=64) |
| Tipos de cuantizacion | No disponible (checkpoint en FP32/BF16 según benchmark; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`acore_wm_step54050.pt`, 316 MB) |

## Arquitectura y entrenamiento

La model card describe Acore como un núcleo cognitivo predictivo construido desde cero, con etiquetas de world model, predictive coding, reinforcement learning, planning y reasoning. El diseño se orienta a aprender la dinámica de entornos (transiciones de estado, recompensas y estados terminales) para después ejecutar rollouts internos de planificación. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni la composición exacta del dataset de entrenamiento.

El entrenamiento se realizó durante 54.050 pasos sobre una NVIDIA H100 PCIe, con una pérdida final de predicción de estado de 0,0783 (partiendo de 5,8043) y una pérdida de generalización en entornos no vistos de 0,4611. El repositorio incluye `training_log.csv` con la traza paso a paso y `h100_bench_results.csv` con mediciones de throughput y precisión numérica en FP32/BF16. El autor reporta 2.623,113 GFLOP/s verificados en un benchmark de kernel propio. No se documenta uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Predicción de transiciones de estado en entornos de refuerzo.
- Modelado de funciones de recompensa y detección de estados terminales.
- Planificación mediante rollout interno con horizonte de 64 pasos.
- Generalización zero-shot a entornos no vistos (evaluada con pérdida de 0,4611).
- Razonamiento orientado a planificación multi-paso dentro del mundo simulado.
- No se documenta soporte de tool calling, function calling, visión, audio ni generación de lenguaje natural.
- Capacidades multilingües: no disponibles (el modelo no se presenta como modelo de lenguaje).

## Casos de uso

- Planificación en entornos de reinforcement learning: el modelo puede actuar como world model para simular trayectorias de 64 pasos antes de ejecutar acciones en el entorno real, reduciendo el coste de interacción.
- Model-based RL en robótica simulada: uso del rollout interno para evaluar políticas candidatas sin desplegarlas físicamente, aprovechando su capacidad de predecir transiciones y recompensas.
- Investigación en predictive coding: base reproducible (Apache 2.0, 27,6 M de parámetros) para experimentar con codificación predictiva y comparar contra arquitecturas alternativas.
- Curriculum learning y evaluación de generalización: el log de entrenamiento y la métrica de entornos no vistos permiten estudiar la transferencia entre dominios con un coste computacional bajo.
- Prototipado rápido en una sola GPU: con 316 MB de checkpoint cabe en cualquier GPU consumer, lo que facilita ciclos de experimentación cortos en laboratorios con recursos limitados.
- Docencia y divulgación: ejemplo didáctico y de código abierto de un world model completo con métricas de entrenamiento publicadas, útil para cursos de RL y sistemas cognitivos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Pérdida final de predicción de estado | 0,0783 (inicial: 5,8043) |
| Pérdida de generalización en entornos no vistos | 0,4611 |
| Pasos de entrenamiento | 54.050 |
| Throughput de kernel en H100 PCIe | 2.623,113 GFLOP/s (FP32/BF16) |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para un checkpoint de 316 MB; en BF16 aproximadamente la mitad.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento reportado se realizó en NVIDIA H100 PCIe.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con suficiente memoria compartida).
- Opciones de despliegue: inferencia directa con PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no es un modelo de lenguaje y no se distribuyen pesos en GGUF).
- Latencia y throughput: no se publican cifras de latencia de inferencia; solo el benchmark de kernel en H100 (2.623,113 GFLOP/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Acore v1 | 27,6 M | 584 tokens (T=64) | World model / predictive coding | Apache 2.0 | Hugging Face (0 descargas) |
| DreamerV3 | No disponible en la información | No disponible | World model para RL | MIT (referencia externa, no verificada aquí) | Repositorio de investigación |
| IRIS | No disponible en la información | No disponible | World model con tokens discretos | No disponible | Repositorio de investigación |

No se dispone de datos verificados en la información proporcionada para establecer una comparación cuantitativa con alternativas; las filas de DreamerV3 e IRIS se incluyen únicamente como categorías de referencia y sus cifras no deben tomarse como confirmadas en esta ficha.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no soporta tool calling ni agentes conversacionales.
- No se documentan idiomas soportados; cualquier uso multilingüe es especulativo.
- La generalización a entornos no vistos tiene una pérdida de 0,4611, muy superior a la de entrenamiento (0,0783), lo que indica degradación notable fuera de la distribución.
- El horizonte de simulación es de solo 64 pasos y el contexto de 584 tokens, insuficiente para planificación de largo plazo.
- Modelo con 0 descargas y 0 likes: no hay validación independiente de las métricas declaradas por el autor.
- El enlace al código fuente en la model card aparece mal formado (`https://://github.com`), por lo que la reproducibilidad no está garantizada.
- No se especifican sesgos, composición del dataset ni procedencia de los entornos de entrenamiento, lo que impide evaluar riesgos de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre datos de entrenamiento limita la auditoría en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ardagoktas-ai/acore-v1
- Repositorio de código fuente: enlace no válido en la model card (`https://://github.com`); no disponible un enlace funcional.
- Paper, blog o demo: no disponibles en la información proporcionada.

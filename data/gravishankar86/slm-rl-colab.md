# gravishankar86/slm-rl-colab

## Resumen

El repositorio `gravishankar86/slm-rl-colab` no es un modelo de lenguaje independiente, sino un adaptador PEFT LoRA diseñado para especializar el modelo base `LiquidAI/LFM2.5-1.2B-Instruct` en la tarea de jugar al juego de Atari *Boxing* dentro del framework de aprendizaje por refuerzo SLM-RL. Este framework permite que pequeños modelos de lenguaje aprendan a jugar en entornos de texto, recopilen sus propias decisiones como dataset y se auto-mejoren mediante fine-tuning iterativo.

El adaptador se entrenó con la técnica `reject_sft` sobre demostraciones generadas por un profesor DQN, logrando una mejora en la métrica primaria de -0.4375 a 0.0000, con una tasa de acciones inválidas nula y sin intervenciones externas. El resultado es un adaptador ligero (el repositorio ocupa 0.0 GB) que puede cargarse sobre el modelo base para generar acciones de juego coherentes.

La relevancia de este adaptador radica en su uso como punto de partida (warm-start) para experimentos de RL en modelos de lenguaje pequeños, demostrando un flujo práctico de entrenamiento con refuerzo en entornos de juego. Está publicado bajo licencia Apache 2.0 y su formato de pesos es safetensors, compatible con la librería PEFT de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `LiquidAI/LFM2.5-1.2B-Instruct` (modelo base de 1.2B parámetros) |
| Parametros totales | No disponible (el adaptador es un subconjunto de LoRA; el modelo base tiene 1.2B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se carga en bfloat16 o float32 según el dispositivo) |
| Idiomas soportados | No disponible (el adaptador está orientado a acciones de juego, no a lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) que se aplica sobre el modelo base `LiquidAI/LFM2.5-1.2B-Instruct`, un modelo de lenguaje causal de 1.2B parámetros. El adaptador se entrena con el método `reject_sft` (rejection sampling + supervised fine-tuning) sobre demostraciones generadas por un agente DQN que actúa como profesor en el entorno de texto del juego *Boxing*. El framework SLM-RL gestiona el ciclo completo: el modelo juega, las decisiones se guardan en un dataset, se fine-tune con RL y el modelo mejorado vuelve a jugar.

Las métricas de entrenamiento registradas incluyen una pérdida de -0.0196, una recompensa media de 0.1875, una entropía de 2.305 y un KL de 0.2676. El adaptador fue promovido como campeón de la generación 1, con una mejora en la métrica primaria de -0.4375 a 0.0000, tasa de acciones inválidas 0.0000 y tasa de intervención 0.0000. No se especifican detalles sobre el número de pasos, el tamaño del dataset ni la configuración exacta del LoRA (rank, alpha, etc.).

## Capacidades

- Generación de acciones de juego: el adaptador produce respuestas en formato `ACTION: <id>` para el juego *Boxing* en entornos de texto.
- Especialización en tareas de RL: está diseñado para funcionar dentro del pipeline de SLM-RL, no como un modelo de lenguaje general.
- Integración con PEFT: se carga fácilmente sobre el modelo base mediante `PeftModel.from_pretrained` con subcarpeta `adapter/`.
- Soporte de chat: hereda la plantilla de chat del modelo base, permitiendo formatear mensajes con roles system/user.
- Inferencia determinista: el ejemplo de uso emplea `do_sample=False`, lo que sugiere que el adaptador está optimizado para decisiones deterministas en el juego.
- No se reportan capacidades de tool calling, agentes, visión ni audio; el adaptador es exclusivamente para el entorno de juego.

## Casos de uso

- Investigación en RL para modelos de lenguaje pequeños: el adaptador sirve como punto de partida para estudiar cómo un SLM aprende a jugar en entornos de texto, permitiendo reproducir experimentos de SLM-RL con un warm-start ya entrenado.
- Evaluación de políticas de juego: se puede cargar el adaptador y ejecutar partidas de *Boxing* para medir su rendimiento frente a otros agentes o políticas, usando las métricas de SLM-RL (primary, invalid_rate, intervention_rate).
- Desarrollo de agentes de juego en texto: el adaptador puede integrarse en un pipeline de generación de acciones para juegos de Atari, sirviendo como componente de decisión en un sistema más amplio.
- Benchmarking de adaptadores LoRA: al ser un adaptador pequeño y específico, es útil para comparar metodologías de entrenamiento (reject_sft vs. otros) en un entorno controlado.
- Educación y demostraciones: el repositorio incluye un ejemplo de carga con transformers y PEFT, ideal para enseñar cómo aplicar adaptadores LoRA sobre modelos base en tareas no convencionales.
- Experimentación con auto-mejora: el adaptador puede usarse como generación inicial en el bucle de SLM-RL, permitiendo observar cómo el modelo mejora iterativamente con sus propias experiencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las únicas métricas reportadas son las de entrenamiento y evaluación del propio adaptador dentro del framework SLM-RL:

| Metrica | Valor |
|---|---|
| Primary (antes) | -0.4375 |
| Primary (después) | 0.0000 |
| Invalid rate | 0.0000 |
| Intervention rate | 0.0000 |
| Win rate (eval) | 0.0000 |
| Mean score (eval) | 0.0000 |
| Episodios de evaluación | 8 |
| Recompensa media (train) | 0.1875 |
| Entropía (train) | 2.3054 |
| KL (train) | 0.2676 |
| Pérdida (train) | -0.0196 |

Estas métricas indican que el adaptador produce acciones válidas sin intervención, pero no se dispone de comparaciones con otros modelos o adaptadores.

## Requisitos de hardware

- VRAM estimada: el modelo base de 1.2B en bfloat16 ocupa aproximadamente 2.4 GB; el adaptador LoRA añade una cantidad mínima (típicamente <100 MB). En float32, el modelo base ocuparía ~4.8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en bfloat16 (por ejemplo, RTX 3050, RTX 3060, T4). En CPU también es viable, aunque con mayor latencia.
- Compatibilidad con GPUs consumer: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: transformers + PEFT (como se muestra en el ejemplo), también puede usarse con vLLM o TGI si se fusiona el adaptador con el modelo base, o con llama.cpp si se convierte a GGUF (aunque no se proporciona conversión oficial).
- Latencia y throughput: no se han publicado mediciones. En una GPU T4, se espera una generación de 24 tokens en menos de 1 segundo, pero es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para el mismo juego o framework. El único punto de comparación razonable es el modelo base sin adaptador, que no está especializado en *Boxing* y probablemente generaría acciones aleatorias o inválidas. No hay datos públicos de otros adaptadores de SLM-RL para *Boxing* en el momento de la consulta.

## Limitaciones y advertencias

- Especialización extrema: el adaptador solo es útil para el juego *Boxing* en el formato de SLM-RL; no aporta capacidades generales de lenguaje ni de razonamiento.
- Dependencia del modelo base: su rendimiento está limitado por las capacidades de `LiquidAI/LFM2.5-1.2B-Instruct`; si el modelo base cambia, el adaptador puede no ser compatible.
- Sin datos de generalización: no se ha evaluado en otros juegos ni en tareas de lenguaje natural.
- Riesgo de alucinación: aunque el adaptador reduce acciones inválidas, el modelo base puede generar texto no deseado si se usa fuera del formato de juego.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base `LiquidAI/LFM2.5-1.2B-Instruct` puede tener su propia licencia; se debe verificar.
- Repositorio sin mantenimiento: no hay descargas ni likes, y la fecha de creación es futura (2026-08-29), lo que sugiere que es un experimento personal sin soporte activo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gravishankar86/slm-rl-colab
- Dataset asociado: https://huggingface.co/datasets/gravishankar86/slm-rl-colab-data
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Framework SLM-RL: https://github.com/CraftsMan-Labs/SLM-RL

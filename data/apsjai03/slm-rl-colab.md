# apsjai03/slm-rl-colab

## Resumen

El modelo `apsjai03/slm-rl-colab` es un adaptador LoRA (PEFT) desarrollado por apsjai03 que se integra sobre el modelo base `LiquidAI/LFM2.5-1.2B-Instruct` para especializarlo en la tarea de jugar al juego Boxing de Atari en entornos de texto. Forma parte del ecosistema SLM-RL, un framework de aprendizaje por refuerzo para modelos de lenguaje pequeños que aprenden a jugar juegos mediante interacción con entornos textuales. El adaptador se entrena con la técnica `reject_sft` sobre demostraciones generadas por un profesor DQN, y se promociona como campeón al mejorar la métrica primaria de -0.4 a 0.0, con tasas de invalidación e intervención nulas.

La relevancia de este modelo radica en su demostración práctica de cómo un modelo de lenguaje pequeño (1.2B parámetros) puede adaptarse mediante LoRA a tareas de control de juegos, abriendo vías para el desarrollo de agentes autónomos en entornos simulados. El adaptador se distribuye bajo licencia Apache 2.0 y está diseñado para ser cargado con la librería PEFT de Hugging Face, con los pesos alojados en un subdirectorio `adapter/`. Aunque su alcance es limitado (solo Boxing), sirve como ejemplo de integración de RL en modelos generativos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer causal (modelo base LiquidAI/LFM2.5-1.2B-Instruct) |
| Parametros totales | Modelo base: 1.2B; adaptador LoRA: no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se carga en bfloat16 por defecto, pero no se documentan cuantizaciones específicas) |
| Idiomas soportados | No disponibles (el modelo base es multilingüe, pero el adaptador está orientado a acciones de juego en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `LiquidAI/LFM2.5-1.2B-Instruct`, un transformer causal de 1.2B parámetros con capacidad de instrucción. No se dispone de detalles adicionales sobre la arquitectura interna del modelo base (número de capas, atención, etc.) en la información proporcionada. El adaptador LoRA añade matrices de bajo rango a las capas de atención y feed-forward, permitiendo una adaptación eficiente sin modificar los pesos originales.

El entrenamiento se realiza mediante el framework SLM-RL, que implementa un ciclo de auto-mejora: el modelo juega partidas de Boxing en un entorno textual, cada decisión se registra en un dataset reutilizable, y el modelo se ajusta finamente sobre su propia experiencia. En este caso, se utiliza la técnica `reject_sft` (rejection sampling + fine-tuning supervisado) sobre demostraciones generadas por un agente DQN. Las métricas de entrenamiento muestran una pérdida de -0.018, una recompensa media de 0.148, y una entropía de 2.77, con una fracción de recompensa cero de 0.8125. El adaptador fue promocionado como campeón en la generación 1, con una mejora de la métrica primaria de -0.4 a 0.0, y tasas de invalidación e intervención nulas.

## Capacidades

- Generación de acciones de juego: el adaptador responde con el formato `ACTION: <id>` para seleccionar movimientos válidos en el juego Boxing (por ejemplo, NOOP o UP).
- Integración con SLM-RL: funciona como un agente entrenado que puede ser evaluado y evolucionado dentro del framework, permitiendo iteraciones de auto-mejora.
- Especialización en tareas de control: aunque el modelo base es de propósito general, el adaptador restringe su salida a un espacio de acciones discreto, demostrando la viabilidad de adaptar LLMs a tareas de RL.
- Compatibilidad con PEFT: se carga fácilmente con `PeftModel` de Hugging Face, lo que facilita su integración en pipelines existentes.
- Soporte de inferencia en múltiples dispositivos: el código de ejemplo permite ejecución en CPU, CUDA o MPS, con dtype bfloat16 en GPU.
- No se documentan capacidades de tool calling, agentes multi-paso, visión o audio; el adaptador está limitado al dominio del juego.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el adaptador sirve como punto de partida para estudiar cómo los LLMs pequeños pueden aprender políticas de control en entornos simulados, permitiendo comparar con agentes tradicionales como DQN.
- Evaluación de políticas en entornos textuales: se puede usar para medir la calidad de las acciones generadas en Boxing, analizando métricas como win_rate, invalid_rate e intervention_rate.
- Desarrollo de agentes autónomos en juegos retro: al especializarse en Boxing, puede integrarse en sistemas que jueguen automáticamente a juegos de Atari, sirviendo como componente de un bot.
- Entrenamiento incremental con SLM-RL: el adaptador puede ser evolucionado mediante el CLI de SLM-RL, generando nuevas generaciones que mejoren el rendimiento en el juego.
- Pruebas de adaptación eficiente: demuestra cómo un LoRA puede transformar un modelo instruct general en un agente de juego sin necesidad de ajustar todos los parámetros, útil para entornos con recursos limitados.
- Benchmarking de frameworks de RL: sirve como caso de uso para validar la integración de PEFT con entornos de juego, permitiendo a desarrolladores replicar el flujo de trabajo en otros juegos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este adaptador, ya que su propósito no es el razonamiento general sino el control de juegos. Sin embargo, se proporcionan métricas de entrenamiento y evaluación del propio SLM-RL:

| Metrica | Valor |
|---|---|
| Primary (evaluación) | 0.0 |
| Invalid rate | 0.0 |
| Intervention rate | 0.0 |
| Win rate | 0.0 |
| Mean score | 0.0 |
| Episodios de evaluación | 8 |
| Recompensa media (entrenamiento) | 0.148 |
| Pérdida (entrenamiento) | -0.018 |
| Entropía (entrenamiento) | 2.775 |
| KL (entrenamiento) | 0.518 |

Estos valores indican que el adaptador produce acciones válidas sin intervención externa, aunque el rendimiento en el juego (win_rate, mean_score) es bajo, lo que sugiere que aún no es un agente competitivo.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo de 1.2B, la inferencia requiere aproximadamente 2-3 GB de VRAM en bfloat16 (el modelo base ocupa ~2.4 GB en fp16). Con cuantización adicional podría reducirse, pero no se documenta.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, o superiores. También funciona en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: se puede usar con transformers + PEFT, o integrarse en el CLI de SLM-RL. No se mencionan vLLM, llama.cpp u Ollama, pero al ser un adaptador PEFT, podría exportarse a GGUF si se convierte el modelo base.
- Latencia y throughput: no se proporcionan datos específicos; en una GPU moderna (RTX 3090) se espera una latencia de decodificación de ~10-20 ms por token, pero no está confirmado.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables para el mismo juego o tarea. El modelo base `LiquidAI/LFM2.5-1.2B-Instruct` es un LLM general, pero no hay otros adaptadores SLM-RL documentados en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Especialización limitada: el adaptador solo funciona para el juego Boxing; no generaliza a otros juegos o tareas de lenguaje.
- Rendimiento bajo: las métricas de win_rate y mean_score son 0.0, lo que indica que el agente no gana partidas ni obtiene puntuación, aunque produce acciones válidas.
- Dependencia del modelo base: cualquier limitación del modelo base (sesgos, alucinaciones) puede afectar al adaptador, aunque en este caso la salida está restringida a un espacio de acciones.
- Sin datos de contexto o idiomas: no se especifica la longitud de contexto soportada ni los idiomas, lo que limita su uso en entornos multilingües.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base puede tener sus propias restricciones; se recomienda verificar la licencia de LiquidAI/LFM2.5-1.2B-Instruct.
- Riesgo de sobreajuste: al entrenarse sobre demostraciones de un DQN, el adaptador puede memorizar patrones específicos y fallar ante variaciones del entorno.
- No apto para producción general: su uso está restringido a entornos de investigación o simulación; no se recomienda para aplicaciones críticas.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/apsjai03/slm-rl-colab
- Dataset asociado: https://huggingface.co/datasets/apsjai03/slm-rl-colab-data
- Framework SLM-RL: https://github.com/CraftsMan-Labs/SLM-RL
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct

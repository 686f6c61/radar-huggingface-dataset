# lerobot/RynnValue-4B

## Resumen

RynnValue-4B es un modelo de valor (*value model*) para robótica, condicionado por lenguaje y construido sobre Qwen3-VL. Dado un vídeo de trayectoria y una descripción textual de la tarea, predice el tiempo restante en segundos hasta completar la tarea y una señal de éxito. Lo publica el equipo de LeRobot (Hugging Face) como modelo de recompensa para su framework de aprendizaje robótico de extremo a extremo.

El modelo se distribuye en formato safetensors con 5.144.979.456 parámetros reales (pese al "4B" del nombre), un repositorio de 10,3 GB y licencia Apache 2.0. Es un *fine-tune* del modelo base Alibaba-DAMO-Academy/RynnValue-4B, empaquetado para su uso con la librería `lerobot` y la pipeline `robotics`.

Su relevancia radica en que proporciona una función de recompensa densa y basada en visión-lenguaje para tareas de manipulación robótica, lo que permite evaluar el progreso de una política sin necesidad de anotaciones manuales por paso. En LeRobot es un modelo de solo inferencia: no se puede entrenar con `lerobot-train`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer basada en Qwen3-VL (modelo de valor condicionado por lenguaje) |
| Parametros totales | 5.144.979.456 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RynnValue-4B se apoya en Qwen3-VL, un transformer multimodal de visión-lenguaje, y se especializa como modelo de valor para robótica. La entrada combina un vídeo de trayectoria con una descripción de tarea en lenguaje natural; la salida son dos cabezas de predicción: el tiempo restante hasta la finalización de la tarea (en segundos) y una señal de éxito. Esta formulación de "distancia temporal" convierte el problema de estimar progreso en una regresión sobre tiempo restante.

El modelo es un *fine-tune* del checkpoint Alibaba-DAMO-Academy/RynnValue-4B. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones de decodificación o atención específicas más allá de la herencia arquitectónica de Qwen3-VL.

## Capacidades

- Predicción del tiempo restante (en segundos) hasta completar una tarea robótica a partir de un vídeo de trayectoria y una descripción textual.
- Predicción de éxito de la tarea (`predict_success`), útil como señal de recompensa o criterio de parada.
- Comprensión de vídeo combinada con condicionamiento por lenguaje natural (visión-lenguaje).
- Integración nativa con el ecosistema LeRobot mediante `RewardModelConfig` y `make_reward_model`.
- Uso como modelo de recompensa para evaluar políticas robóticas en entornos de manipulación.
- Solo inferencia: no soporta entrenamiento dentro de LeRobot.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información.

## Casos de uso

- Evaluación de políticas robóticas: usar `predict_remaining_time` como métrica de progreso para comparar checkpoints de una política entrenada con LeRobot sin anotación manual por frame.
- Recompensa densa para *reinforcement learning*: emplear la señal de tiempo restante como recompensa intermedia que guíe al agente hacia la finalización de la tarea.
- Criterio de parada temprana en ejecución: consultar `predict_success` para detener una política cuando el modelo estima que la tarea está completada, evitando sobreactuación.
- Filtrado y curación de datasets: puntuar episodios grabados según el tiempo restante predicho para descartar demostraciones de baja calidad o incompletas.
- Monitorización en producción: estimar en tiempo real cuánto falta para que un robot termine una tarea y alertar si la predicción no decrece (posible bloqueo).
- Investigación en modelos de valor: comparar la formulación de distancia temporal frente a clasificadores de éxito binarios en tareas de manipulación con condicionamiento por lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5.144.979.456 parámetros en fp16 se requieren aproximadamente 10,3 GB solo para pesos; en fp32, unos 20,6 GB. El procesamiento de vídeo añade memoria para activaciones y frames.
- GPU recomendadas: A100 (40/80 GB) o H100 para inferencia cómoda en fp16 con vídeo de alta resolución; RTX 4090 (24 GB) viable en fp16 para lotes pequeños.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en fp16; en tarjetas de 16 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: la vía soportada es la librería `lerobot` (`RewardModelConfig.from_pretrained` + `make_reward_model`) sobre PyTorch. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lerobot/RynnValue-4B | 5.144.979.456 | no disponible | Modelo de valor / recompensa robótica (visión-lenguaje) | Apache 2.0 | Hugging Face |
| Alibaba-DAMO-Academy/RynnValue-4B | no disponible | no disponible | Modelo de valor robótico (base) | no disponible | Hugging Face |
| Políticas ACT de LeRobot (p. ej. SO-101) | no disponible | no disponible | Política de imitación (no es modelo de valor) | no disponible | Hugging Face |

La información disponible no permite una comparación cuantitativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de solo inferencia en LeRobot: no se puede reentrenar con `lerobot-train`.
- No se documentan sesgos conocidos ni evaluación de robustez frente a dominios visuales distintos al de entrenamiento.
- Riesgo de alucinación inherente a los modelos de visión-lenguaje; las predicciones de tiempo restante y éxito deben tratarse como estimaciones, no como verdad de referencia.
- Idiomas soportados no especificados; el condicionamiento por lenguaje depende de las capacidades heredadas de Qwen3-VL.
- Longitud de contexto no documentada, lo que limita planificar el tamaño de las trayectorias de vídeo procesables.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base del que deriva debe verificarse de forma independiente.
- Sin datos publicados de benchmarks, latencia ni throughput; la validación en producción corre a cargo del integrador.
- Requiere el preprocesador propio del modelo para construir el `batch` de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lerobot/RynnValue-4B
- Modelo base: https://huggingface.co/Alibaba-DAMO-Academy/RynnValue-4B
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot SO-101: https://huggingface.co/docs/lerobot/so101
- Ruta de aprendizaje LeRobot: https://www.roboticscenter.ai/learn/paths/lerobot
- Tutoriales LeRobot (YouTube): https://www.youtube.com/playlist?list=PLo2EIpI_JMQu5zrDHe4NchRyumF2ynaUN
- LeRobot Visualizer: https://mylerobot.com/lerobot/

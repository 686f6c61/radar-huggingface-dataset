# asdd2468/pi05-sft

## Resumen

π₀.₅ (Pi05 Libero) es un modelo visión-lenguaje-acción (VLA) desarrollado originalmente por Physical Intelligence y adaptado al ecosistema LeRobot de Hugging Face. El checkpoint `asdd2468/pi05-sft` es un ajuste fino (SFT) del modelo base `lerobot/pi05_libero_base`, entrenado sobre el conjunto de datos LIBERO para ejecutar tareas robóticas de manipulación. Su función es mapear observaciones multimodales (imágenes multi-vista y estado propioceptivo del robot), junto con una instrucción en lenguaje natural opcional, a acciones continuas de control del robot.

El modelo emplea una arquitectura visión-lenguaje-acción con un cabezal de acciones basado en flow matching, un enfoque de modelado generativo que predice trayectorias de acción continuas mediante la resolución de una ecuación diferencial de flujo. Cuenta con aproximadamente 3.616 millones de parámetros (3,6 B) almacenados en formato safetensors, con un tamaño de repositorio de 7,5 GB. El modelo está pensado como base para ajuste fino en casos de uso robóticos específicos, no como un sistema listo para producción sin entrenamiento adicional.

La relevancia de este checkpoint reside en que forma parte del esfuerzo de LeRobot por reproducir y hacer accesible la implementación de π₀.₅, un modelo de referencia en el campo de la robótica generalista. No obstante, se trata de un modelo con cero descargas y cero valoraciones en el momento de la ficha, entrenado por un autor individual (`asdd2468`), lo que limita su validación por parte de la comunidad. Además, la implementación actual solo soporta el cabezal de flow matching, quedando fuera otras componentes del trabajo original como la predicción de subtareas, la tokenización de acciones o el aprendizaje por refuerzo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con cabezal de acciones por flow matching |
| Parametros totales | 3.616.757.520 (≈3,6 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se menciona bfloat16 para entrenamiento) |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ descrita en el paper "π0.5: A Vision-Language-Action Model with Open-World Generalization" (arXiv:2504.16054). Se trata de un modelo VLA que combina un codificador visión-lenguaje con un cabezal de acciones continuas entrenado mediante flow matching. Las entradas son imágenes de múltiples vistas, el estado propioceptivo del robot y, opcionalmente, una instrucción en lenguaje natural; la salida es un vector de acciones continuas. La implementación en LeRobot sigue el código de referencia original de Physical Intelligence (repositorio `openpi`) para mantener compatibilidad.

El entrenamiento se realizó mediante ajuste fino supervisado (SFT) sobre el dataset `HuggingFaceVLA/libero`, partiendo del checkpoint `lerobot/pi05_libero_base`. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card advierte explícitamente que esta implementación solo soporta el cabezal de flow matching para entrenamiento e inferencia; otras componentes del trabajo original (predicción de subtareas, tokenización de acciones, RL) no fueron liberadas upstream y no están incluidas. El modelo está marcado con `inference: false` en su configuración, lo que sugiere que no está pensado para inferencia directa sin ajuste.

## Capacidades

- Generación de acciones continuas de control robótico a partir de observaciones visuales multi-vista y estado propioceptivo.
- Procesamiento de instrucciones en lenguaje natural opcionales para condicionar la tarea a ejecutar.
- Ejecución de tareas de manipulación de horizonte largo en entornos simulados (LIBERO).
- Ajuste fino sobre datasets propios mediante `lerobot-train` con configuración de política específica (chunk_size, n_action_steps, max_action_tokens, gradient_checkpointing).
- Evaluación en simulación mediante `lerobot-eval` con entornos LIBERO (por ejemplo, `libero_object`).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM; su ámbito es exclusivamente el control robótico.
- Capacidades multilingües limitadas al inglés (`en`) según los metadatos.

## Casos de uso

- **Ajuste fino para tareas de manipulación específicas**: el modelo está diseñado explícitamente como base para fine-tuning. Un equipo puede partir de `asdd2468/pi05-sft` (o del base `lerobot/pi05_libero_base`) y entrenar con `lerobot-train` sobre su propio dataset de demostraciones para una tarea concreta, como apilar cubos o ajustar botellas.
- **Evaluación en simulación con LIBERO**: mediante `lerobot-eval` con `--env.type=libero`, se puede medir la tasa de éxito del modelo en tareas estandarizadas de manipulación antes de transferir a un robot real, lo que permite iterar sobre el dataset de entrenamiento sin riesgo físico.
- **Investigación en aprendizaje por imitación**: el modelo sirve como punto de partida para estudiar cómo el flow matching modela distribuciones multimodales de acciones continuas, comparándolo con enfoques de regresión directa o difusión.
- **Prototipado de pipelines VLA en LeRobot**: integrable en flujos de trabajo que usan `LeRobotDataset`, `PI05Policy` y los pre/postprocesadores del ecosistema LeRobot, lo que facilita la experimentación con datasets propios y la comparación con otras políticas disponibles en la librería.
- **Generación de datos sintéticos de trayectorias**: en un entorno simulado, el modelo puede generar trayectorias de acción para aumentar un dataset de demostraciones antes de entrenar una política final, reduciendo el coste de recolección de datos reales.
- **Benchmarking de políticas robóticas**: al estar entrenado sobre LIBERO, puede usarse como referencia base en comparativas internas de nuevas políticas o variantes de arquitectura dentro del mismo entorno simulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de tasa de éxito en LIBERO ni comparaciones cuantitativas con otros modelos. El repositorio no presenta descargas ni valoraciones que permitan inferir un rendimiento validado por la comunidad.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Con 3,6 B parámetros, una estimación orientativa en bfloat16 sería de aproximadamente 7-8 GB solo para los pesos, más memoria para activaciones y buffers de imagen; en cuantización de 8 bits podría reducirse a unos 4 GB, pero no se han publicado configuraciones de cuantización validadas para este checkpoint.
- **GPU recomendadas**: no disponible. Por tamaño, cabría esperar que funcione en GPUs con al menos 16 GB de VRAM (RTX 4090, A100, H100), pero no hay confirmación oficial.
- **¿Cabe en consumer GPU?**: probablemente sí en GPUs de gama alta con 16 GB o más, aunque no está verificado en la información disponible.
- **Opciones de despliegue**: el soporte oficial es mediante la librería LeRobot (`pip install "lerobot[pi]@git+https://github.com/huggingface/lerobot.git"`) y la clase `PI05Policy`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de acciones robóticas.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asdd2468/pi05-sft | ≈3,6 B | no disponible | VLA / control robótico | gemma | Hugging Face (0 descargas) |
| RLinf/RLinf-Pi05-RoboTwin-SFT-adjust_bottle | ≈4 B | no disponible | VLA / control robótico | no disponible | Hugging Face (132 descargas) |
| YifWRobotics/RLinf-pi05-SFT-Stack-cube | no disponible | no disponible | VLA / control robótico | no disponible | Hugging Face |
| lerobot/pi05_libero_base | no disponible | no disponible | VLA / control robótico | gemma | Hugging Face (modelo base) |

Los tres primeros son ajustes finos derivados de π₀.₅ sobre tareas específicas (ajustar botella, apilar cubos, LIBERO). No se dispone de métricas comparativas de rendimiento entre ellos en la información proporcionada.

## Limitaciones y advertencias

- **Modelo no validado por la comunidad**: cero descargas y cero valoraciones en el momento de la ficha; el autor es un particular (`asdd2468`), no un laboratorio con trayectoria verificable.
- **Marcado como `inference: false`**: la configuración del modelo indica que no está pensado para inferencia directa sin ajuste previo.
- **Funcionalidad incompleta respecto al trabajo original**: solo se soporta el cabezal de flow matching; faltan predicción de subtareas, tokenización de acciones y RL, lo que limita su fidelidad al π₀.₅ publicado.
- **Idioma**: solo inglés (`en`); las instrucciones en otros idiomas no están soportadas oficialmente.
- **Licencia Gemma**: la licencia `gemma` impone condiciones de uso comercial y restricciones de redistribución que deben revisarse antes de un despliegue en producción; no es una licencia permisiva tipo Apache o MIT.
- **Riesgo de alucinación en acciones**: como modelo generativo de acciones continuas, puede producir trayectorias no válidas o inseguras fuera de la distribución de entrenamiento; requiere validación en simulación y protocolos de seguridad en robot real.
- **Sesgos del dataset**: entrenado sobre LIBERO, un conjunto de tareas de manipulación acotado; su generalización a entornos reales no está demostrada en este checkpoint.
- **Sin datos de benchmarks**: no hay evidencia cuantitativa de rendimiento publicada para este checkpoint concreto.
- **Contexto no documentado**: se desconoce la longitud de contexto efectiva para instrucciones o secuencias de observaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asdd2468/pi05-sft
- Modelo base: https://huggingface.co/lerobot/pi05_libero_base
- Paper original: https://huggingface.co/papers/2504.16054
- Implementación de referencia (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Implementación LeRobot: https://github.com/huggingface/lerobot
- Documentación de instalación de LeRobot: https://huggingface.co/docs/lerobot/installation
- Dataset LIBERO: https://huggingface.co/datasets/HuggingFaceVLA/libero
- Modelo comparable (RLinf, ajustar botella): https://huggingface.co/RLinf/RLinf-Pi05-RoboTwin-SFT-adjust_bottle
- Modelo comparable (YifWRobotics, apilar cubos): https://huggingface.co/YifWRobotics/RLinf-pi05-SFT-Stack-cube

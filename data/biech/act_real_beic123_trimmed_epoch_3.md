# biecH/act_real_beic123_trimmed_epoch_3

## Resumen

`act_real_beic123_trimmed_epoch_3` es una política de control robótico basada en ACT (Action Chunking with Transformers) entrenada con la librería LeRobot de Hugging Face sobre demostraciones reales del brazo robótico SO-101. El modelo no es un LLM ni un modelo generativo de texto: es un checkpoint de imitación que mapea observaciones visuales y de estado del robot a secuencias de acciones motoras, empaquetado en safetensors y consumible mediante el pipeline `robotics` de LeRobot.

El checkpoint contiene 51.668.614 parámetros (aproximadamente 51,7 M) y ocupa 0,2 GB en el repositorio. Fue entrenado sobre un dataset local de 70 episodios y 37.418 fotogramas a 30 fps, con un total de 12.863 pasos de entrenamiento distribuidos en tres ejecuciones encadenadas en Modal (3508 → 8186 → 12863), cada una inicializada desde el checkpoint anterior. El nombre "e3" sugiere una tercera época o fase, aunque el autor indica que el modelo ha visto los datos unas 11 veces.

Es relevante como ejemplo de flujo de trabajo completo de robótica de imitación con LeRobot: dataset propio, entrenamiento en la nube, checkpoint publicado y política estándar de ACT añadida en el momento de la subida. No obstante, el propio autor advierte de que no hay métricas de evaluación publicadas, por lo que su rendimiento real en el robot no está cuantificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación de LeRobot |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; chunk_size de 100 pasos de acción) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La política sigue la arquitectura ACT estándar de LeRobot: un transformer que consume observaciones (imágenes de cámara y estado de las articulaciones del SO-101) y predice un chunk de 100 acciones futuras de forma conjunta, lo que reduce el error de acumulación típico de las políticas paso a paso. La configuración de entrenamiento registrada en `train_config.json` usa batch de 32, learning rate constante de 1e-5 (preset de ACT), `chunk_size` de 100 y `n_action_steps` de 100, con guardado cada 1170 pasos.

El entrenamiento se realizó sobre un dataset local denominado `beic_123_trimmed`, no publicado en Hugging Face, compuesto por 70 episodios y 37.418 fotogramas capturados a 30 fps con el robot real SO-101. El proceso se ejecutó en tres tandas encadenadas en Modal (hasta los pasos 3508, 8186 y 12863), cada una partiendo del checkpoint anterior, lo que equivale a unas 11 pasadas sobre los datos con el batch indicado. No se documenta uso de RLHF, DPO ni aumento de datos; se trata de aprendizaje por imitación supervisado puro. El archivo `policy.py` de ACT del repositorio del hackathon se añadió en el momento de la subida para facilitar la carga.

## Capacidades

- Control motor por imitación: genera secuencias de 100 acciones articulares para el brazo SO-101 a partir de observaciones visuales y de estado.
- Ejecución de tareas manipulativas aprendidas de demostraciones humanas sobre el robot real.
- Predicción de chunks de acción que permiten un control más estable que políticas reactivas de un solo paso.
- Integración nativa con el ecosistema LeRobot (carga mediante `lerobot` y pipeline `robotics`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües, de visión general, audio ni modo "thinking": la visión se limita a las cámaras usadas en el dataset de entrenamiento.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo puede ejecutar la tarea concreta demostrada en los 70 episodios del dataset sobre un SO-101, útil para prototipos de investigación en robótica de imitación.
- Reproducción de experimentos de ACT: sirve como checkpoint de referencia para comparar configuraciones de entrenamiento (chunk_size, learning rate, número de pasos) en el mismo robot y dataset.
- Base para fine-tuning: al estar en formato LeRobot y con la política estándar incluida, se puede reentrenar o adaptar a nuevas tareas partiendo de estos pesos en lugar de desde cero.
- Docencia y demostraciones: permite mostrar un pipeline completo de dataset propio, entrenamiento en Modal y despliegue en LeRobot con un coste computacional bajo (51,7 M de parámetros).
- Evaluación de infraestructura de entrenamiento encadenado: el historial de tres ejecuciones encadenadas en Modal es un caso práctico para validar flujos de reanudación de entrenamiento.
- Pruebas de integración con el brazo SO-101: útil para verificar la cadena de carga de política, lectura de cámaras y envío de comandos antes de entrenar un modelo propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente "no eval numbers yet", por lo que no hay tasas de éxito, error de posición ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en fp32 el modelo ocupa aproximadamente 0,2 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia (RTX 3060, RTX 4090, A100, H100); el cuello de botella real será el procesamiento de imágenes de las cámaras, no el modelo.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas, e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (carga nativa del checkpoint), con soporte de PyTorch; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; no se han publicado mediciones en el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_real_beic123_trimmed_epoch_3 | 51,7 M | ACT sobre SO-101 real | chunk_size 100 | no disponible | Hugging Face (biecH) |
| Políticas ACT de referencia de LeRobot | no disponible | ACT genérica | configurable | según repositorio LeRobot | Hugging Face / GitHub LeRobot |
| Otros checkpoints del hackathon SO-101 | no disponible | ACT / difusión | variable | variable | Hugging Face |

No se dispone de datos de rendimiento de alternativas concretas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Ausencia total de métricas de evaluación: no hay tasas de éxito ni validación en el robot, por lo que no se puede afirmar que la política funcione fuera del conjunto de entrenamiento.
- Dataset no publicado: `beic_123_trimmed` no está en Hugging Face, lo que impide reproducir el entrenamiento o auditar la calidad de las demostraciones.
- Sobreajuste probable: unas 11 pasadas sobre solo 70 episodios con 51,7 M de parámetros es un régimen propenso a memorizar las trayectorias del dataset.
- Sesgos de dominio: el modelo solo conoce la tarea, la iluminación, la disposición de cámaras y el robot concretos del dataset; cualquier cambio de entorno o de objeto puede degradar el comportamiento.
- Licencia no especificada: no se puede confirmar el uso comercial ni las condiciones de redistribución; hay que contactar con el autor antes de usarlo en producción.
- Sin soporte de lenguaje, tool calling ni agentes: no debe confundirse con un modelo de propósito general.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso por terceros ni de validación comunitaria.
- Riesgo de seguridad física: al ser una política de control real, una ejecución incorrecta puede dañar el robot o el entorno; se recomienda validar en simulación y con límites de par y velocidad antes de operar el SO-101.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/biecH/act_real_beic123_trimmed_epoch_3
- LeRobot (librería y repositorio de políticas ACT): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot
- Repositorio del hackathon con `policy/act/policy.py`: no disponible en la información proporcionada
- Dataset `beic_123_trimmed`: no disponible (no publicado en Hugging Face)
- Paper de ACT (Action Chunking with Transformers): no disponible en la información proporcionada
- Modal (plataforma de entrenamiento usada): https://modal.com

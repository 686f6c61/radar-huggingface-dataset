# GeertWang/starvla-pipette-aim-wrist1031-pi05-base-w1

## Resumen

starvla-pipette-aim-wrist1031-pi05-base-w1 es un modelo de visión-lenguaje-acción (VLA) para robótica, desarrollado por el usuario GeertWang y publicado bajo la librería `starvla`. Se trata de un ajuste fino por imitación (behavior cloning) del modelo base PI0.5, orientado a una tarea muy concreta: el paso 3 de una tarea de pipeteo con un robot humanoide Unitree G1 equipado con manos Inspire. En esa tarea, el modelo debe orientar la pipeta sujeta en la mano derecha hacia el tubo que sostiene la mano izquierda.

El modelo parte de los pesos del PI0.5 base (`tenstep/pi_model_starvla pi05_base_starvla fp32`) y se entrena con 230 episodios de entrenamiento y 38 episodios de validación recogidos con HG-DAgger, sin teleoperación, cada uno cortado antes de su fase de extracción. La observación combina tres vistas (ego, FOCUS y wrist_left) más la velocidad de muñeca medida como estado, y la pérdida es un MSE de velocidad de flow-matching con pesos por fotograma.

Es relevante como ejemplo de especialización extrema de un VLA sobre un robot concreto y una tarea concreta, pero conviene subrayar que solo se han publicado métricas offline y que el modelo no se ha ejecutado en un robot real. El repositorio ocupa 8,3 GB y no cuenta con descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en PI0.5 (flow-matching sobre modelo base tipo VLM); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en PyTorch, `steps_14352_pytorch_model.pt`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`); tamano del repo 8,3 GB |

## Arquitectura y entrenamiento

El modelo se construye sobre PI0.5, un VLA que combina un modelo base de visión-lenguaje con una cabeza de acciones entrenada mediante flow-matching. El autor indica que parte del PI0.5 base en fp32 sin pesos de pipeteo y que entrena todos los parámetros. La pérdida es un MSE sobre la velocidad de flow-matching, con pesos automáticos por fotograma (1 para frames automáticos, 1 para frames humanos, 0 para frames enmascarados). No se emplea RL.

Los datos consisten en 230 episodios de entrenamiento y 38 de validación recogidos con HG-DAgger, sin teleoperación, cada uno truncado antes de la fase de extracción (el modelo no se entrena en el pull-out). Se registran 114.830 anclas de entrenamiento y tres vistas (ego, FOCUS y wrist_left) más la velocidad de muñeca medida como estado. La receta es batch 128 (4 x 16 x acumulación 2), learning rate 5e-5 con decaimiento coseno hasta 1e-6, 10 épocas; los números de paso son micro-pasos. El checkpoint publicado corresponde al paso 14.352.

## Capacidades

- Control robótico de manipulación para una tarea concreta: orientar una pipeta en la mano derecha hacia un tubo en la mano izquierda de un Unitree G1 con manos Inspire.
- Percepción multimodal con tres vistas de cámara (ego, FOCUS, wrist_left) y estado proprioceptivo (velocidad de muñeca).
- Generación de acciones mediante flow-matching a partir de observaciones visuales y de estado.
- Entrenamiento por imitación con datos de HG-DAgger, incluyendo frames humanos y automáticos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en imitación robótica: servir como punto de partida o referencia para estudiar cómo se comporta un VLA especializado en una fase concreta de una tarea de laboratorio, comparando con el PI0.5 base.
- Reproducción de experimentos de HG-DAgger: el modelo permite reproducir la receta de entrenamiento (batch, learning rate, épocas) sobre los mismos datos y evaluar la sensibilidad a los hiperparámetros.
- Evaluación offline de políticas VLA: con las 480 muestras de validación publicadas, se puede medir el error de velocidad de flow-matching y comparar checkpoints o variantes.
- Base para ajuste fino en tareas de pipeteo: al estar especializado en el paso 3, puede servir como inicialización para pasos posteriores o variantes del mismo montaje.
- Estudio de fusión de vistas: al usar ego, FOCUS y wrist_left, permite analizar la contribución de cada cámara al rendimiento offline.
- Docencia y divulgación: ejemplo didáctico de pipeline completo (datos, receta, checkpoint, métricas offline) para cursos de robótica e IA.

## Benchmarks y rendimiento

Métricas offline publicadas por el autor (error de velocidad de flow-matching, menor es mejor) sobre 480 muestras de validación:

| Conjunto | Este checkpoint | Referencia "hold still" |
|---|---|---|
| Todos los 38 episodios | 0,0179 | 0,0149 |
| Frames humanos | 0,0316 | no disponible |
| Frames autónomos | 0,0083 | no disponible |
| 12 episodios más tempranos | 0,0363 | 0,0278 |
| 12 episodios más tardíos | 0,0109 | 0,0089 |

El propio autor advierte de que el checkpoint se eligió sobre el mismo holdout con el que se evalúa, por lo que las puntuaciones son ligeramente optimistas. No se han publicado resultados en robot real ni benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 8,3 GB y el checkpoint se publica en PyTorch, pero no se detalla el consumo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería `starvla`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Nota del autor: `config.yaml` contiene rutas del nodo de entrenamiento (`base_vlm` / tokenizer); deben apuntarse a copias locales antes de usar el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| starvla-pipette-aim-wrist1031-pi05-base-w1 | no disponible | no disponible | 0,0179 error offline (480 muestras) | no disponible | Hugging Face, 0 descargas |
| PI0.5 base (`tenstep/pi_model_starvla pi05_base_starvla fp32`) | no disponible | no disponible | no disponible | no disponible | Referenciado como base |
| Otros VLA robóticos (p. ej. OpenVLA, RT-2) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos suficientes en la información proporcionada.

## Limitaciones y advertencias

- Solo se han publicado métricas offline; el modelo no se ha ejecutado en un robot real, según el propio autor.
- El checkpoint se seleccionó sobre el mismo holdout con el que se evalúa, lo que introduce optimismo en las puntuaciones.
- En el conjunto completo de validación, el checkpoint obtiene peor error (0,0179) que la referencia trivial "hold still" (0,0149), lo que cuestiona su utilidad práctica en esa métrica.
- Especialización extrema: entrenado solo para el paso 3 de una tarea de pipeteo con un Unitree G1 y manos Inspire; no es un modelo general.
- No se entrena en la fase de extracción (pull-out), por lo que no debe esperarse que la complete.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas y sesgos no documentados.
- Riesgo de sobreajuste al montaje y a las condiciones de recogida de datos (cámaras, iluminación, robot concreto).
- Las rutas de `config.yaml` apuntan al nodo de entrenamiento y deben reconfigurarse.

## Enlaces

- Hugging Face: https://huggingface.co/GeertWang/starvla-pipette-aim-wrist1031-pi05-base-w1
- Modelo base referenciado: `tenstep/pi_model_starvla pi05_base_starvla fp32` (no se proporciona URL directa)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.

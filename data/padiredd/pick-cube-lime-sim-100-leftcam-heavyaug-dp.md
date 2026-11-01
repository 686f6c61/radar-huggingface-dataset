# padiredd/pick-cube-lime-sim-100-leftcam-heavyaug-dp

## Resumen

`pick-cube-lime-sim-100-leftcam-heavyaug-dp` es una política de difusión (diffusion policy) para robótica manipulativa desarrollada por el usuario padiredd y publicada bajo licencia Apache 2.0. El modelo aprende a controlar el brazo izquierdo de un robot ROBOTIS FFW BG2 para recoger un bloque cúbico de color lima verdoso con un orificio pasante de 5x5x4 cm situado sobre una mesa gris. Se trata de un modelo de imitación entrenado exclusivamente con datos simulados, no con demostraciones humanas reales.

La relevancia de este modelo es acotada pero concreta: demuestra el flujo completo de entrenamiento de una política visuomotora en Isaac Lab (Cyclo Lab) con un planificador scriptado e IK, y su posterior evaluación en simulación. Con 261 millones de parámetros y un encoder visual ResNet18, es un caso de estudio útil para quienes trabajan en manipulación robótica simulada, aumentación de imagen agresiva y despliegue con la librería LeRobot (fork ROBOTIS lerobot-cyclo, versión 0.6.1).

No es un modelo de lenguaje: no procesa texto ni genera lenguaje natural. Su entrada es estado proprioceptivo (22 dimensiones) e imágenes de la cámara de muñeca izquierda (424x240 en orientación vertical), y su salida es una secuencia de 16 acciones de control. Cualquier uso fuera del dominio robótico descrito carece de sentido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder visual ResNet18 |
| Parametros totales | 261.450.128 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de predicción de 64 pasos, 32 pasos de acción, 1 paso de observación |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

Se trata de una diffusion policy clásica: un proceso DDPM con 100 pasos de entrenamiento que genera trayectorias de acción condicionadas por observaciones visuales y de estado. El encoder visual es una ResNet18 que procesa únicamente la cámara de muñeca izquierda; la cámara derecha fue eliminada porque no ve el bloque. La dimensión de estado es 22 y la de acción es 16.

El entrenamiento se realizó sobre 100 episodios simulados (15.480 fotogramas a 15 fps) recogidos en Isaac Lab con un planificador scriptado e IK. Se entrenaron 100.000 pasos con batch 8, Adam con lr 1e-4, betas (0.95, 0.999), weight decay 1e-6, schedule coseno con 500 pasos de calentamiento y pérdida final de 0.001 (media de los últimos 10.000 pasos). Destaca el uso de aumentación de imagen agresiva: ColorJitter, nitidez, transformaciones afines, perspectiva, desenfoque, borrado y escala de grises. No se menciona RLHF, DPO ni ajuste por refuerzo.

## Capacidades

- Control visuomotor para agarre de un objeto concreto (bloque lima de 5x5x4 cm con orificio) sobre mesa gris.
- Generación de trayectorias de acción multimodales mediante muestreo DDPM o DDIM.
- Inferencia con sampler DDIM de 10 pasos y eta 0, que mejora la tasa de éxito frente al DDPM de 100 pasos.
- Procesamiento de imagen de cámara de muñeca izquierda a 424x240 en orientación vertical.
- No dispone de tool calling, function calling, razonamiento multietapa ni capacidades de agente.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo thinking, visión general, audio ni otras modalidades más allá de la imagen de muñeca.

## Casos de uso

- Investigación en imitación simulada: sirve como referencia reproducible para entrenar políticas de difusión en Isaac Lab con planificador scriptado e IK, útil para comparar variantes de aumentación de datos.
- Evaluación de samplers en políticas de difusión: el modelo permite medir la diferencia de éxito entre DDPM-100 (76 %) y DDIM-10 con eta 0 (92 %) en el mismo checkpoint, un caso práctico para estudiar el compromiso entre calidad y coste computacional.
- Prototipado de pipelines LeRobot: al usar la librería lerobot (fork ROBOTIS lerobot-cyclo 0.6.1), se puede integrar en flujos de entrenamiento y evaluación existentes sin adaptaciones mayores.
- Estudio de robustez ante aumentación agresiva: el entrenamiento con ColorJitter, perspectiva, desenfoque y borrado permite analizar cómo la aumentación afecta a la generalización dentro de la caja de entrenamiento.
- Base para transferencia sim-a-real: aunque no se reportan resultados en hardware real, el checkpoint puede servir como inicialización para ajuste fino con datos reales del mismo brazo ROBOTIS FFW BG2.
- Docencia y divulgación: ejemplo compacto (261 M parámetros, 1,0 GB de repo) de política visuomotora completa, adecuado para demostrar el ciclo datos simulados, entrenamiento y evaluación en robótica.

## Benchmarks y rendimiento

Evaluación en simulación sobre 50 episodios, con el bloque en cualquier posición dentro de la caja de entrenamiento y pose inicial según yaml:

| Sampler | Éxito de agarre |
|---|---|
| DDPM-100 (el propio del checkpoint) | 38/50 (76 %) |
| DDIM-10, eta 0 | 46/50 (92 %) |

Los fallos se concentran en el borde lejano de la caja de colocación (x del bloque >= 0,51 m), donde la política se queda suspendida sin cerrar la pinza. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 261 M parámetros en fp32 el peso ronda 1 GB, por lo que en fp16 cabría holgadamente en GPUs de 8 GB o menos, aunque el consumo real depende del encoder ResNet18 y del batch.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) debería ser suficiente para inferencia.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del checkpoint (repo de 1,0 GB), aunque no hay confirmación del autor.
- Opciones de despliegue: librería LeRobot (fork ROBOTIS lerobot-cyclo 0.6.1); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de diffusion policy para el mismo robot o tarea, ni datos de alternativas como ACT, VQ-BeT u otras políticas de LeRobot.

## Limitaciones y advertencias

- Entrenado exclusivamente con 100 episodios simulados; no hay evidencia de transferencia a hardware real.
- Sesgos conocidos: la política falla de forma sistemática en el borde lejano de la caja de colocación (x >= 0,51 m), donde se queda suspendida sin cerrar la pinza.
- Las dimensiones de estado 8-21 (brazo derecho, cabeza, elevación, odometría) son constantes en los datos de entrenamiento; deben fijarse a su punto medio de entrenamiento en inferencia, lo que limita la generalidad.
- Solo utiliza la cámara de muñeca izquierda; la derecha se eliminó por no ver el bloque, de modo que la percepción depende de una única vista.
- Riesgo de sobreajuste al dominio simulado y a la apariencia concreta del bloque y la mesa; la aumentación agresiva mitiga pero no elimina este riesgo.
- Licencia Apache 2.0: permite uso comercial, pero el modelo está diseñado para una tarea y un robot concretos, por lo que su uso comercial directo es cuestionable sin reentrenamiento.
- No hay datos de latencia, cuantización ni despliegue en producción; cualquier uso en producción requeriría validación adicional.

## Enlaces

- HuggingFace: https://huggingface.co/padiredd/pick-cube-lime-sim-100-leftcam-heavyaug-dp
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.

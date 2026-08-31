# jogarulfop/policy_2026-08-31_shake4it_bench_5sensors_dragonfly_10kHz_nfft_512

## Resumen

Este modelo es una política de control robótico entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), desarrollado por el autor `jogarulfop` y publicado en Hugging Face bajo la librería LeRobot. Está diseñado para ejecutar la tarea de agitación (shake) en un banco de pruebas denominado `shake4it_bench`, utilizando datos de cinco sensores muestreados a 10 kHz con una transformada rápida de Fourier de 512 puntos (nfft_512). El modelo predice secuencias de acciones (chunks) a partir de observaciones, lo que permite a un robot manipulador realizar movimientos precisos y coordinados.

Con 51,6 millones de parámetros, es un modelo compacto y ligero (0,2 GB) que puede ejecutarse en hardware de consumo. Su relevancia radica en que demuestra cómo el aprendizaje por imitación con ACT puede aplicarse a tareas de manipulación con sensores de alta frecuencia, y está disponible bajo licencia Apache-2.0, lo que facilita su uso y modificación en entornos de investigación y desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de acciones, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ACT, presentada en el paper [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705). ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso de tiempo, genera un "chunk" de acciones futuras (por ejemplo, una secuencia de 10 o 20 pasos). Esto reduce el error acumulativo y mejora la estabilidad del control en tareas de manipulación. La arquitectura emplea un transformer con codificador y decodificador, donde el codificador procesa las observaciones (imágenes, estados del robot, lecturas de sensores) y el decodificador autoregresivo genera las acciones.

El entrenamiento se realizó con la librería LeRobot de Hugging Face, utilizando un dataset de demostraciones teleoperadas específico para la tarea `shake4it_bench` con cinco sensores. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de refinamiento como RLHF o DPO. El modelo se publicó directamente desde el pipeline de entrenamiento de LeRobot, lo que indica que sigue el flujo estándar de esta librería para políticas ACT.

## Capacidades

- Control robótico por imitación: predice secuencias de acciones (chunks) para ejecutar tareas de manipulación aprendidas de demostraciones.
- Procesamiento de señales de sensores de alta frecuencia: el modelo está entrenado con datos de cinco sensores a 10 kHz, con espectros de 512 puntos (nfft_512), lo que le permite reaccionar a vibraciones o fuerzas dinámicas.
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots como el SO-100.
- Ejecución en tiempo real: al ser un modelo pequeño, puede ejecutarse con baja latencia en GPUs de consumo, adecuado para control en bucle cerrado.
- No incluye capacidades de lenguaje, visión general ni tool calling; es una política especializada en una tarea concreta.

## Casos de uso

- Automatización de tareas de agitación en laboratorios: el modelo puede controlar un brazo robótico para agitar muestras o recipientes siguiendo patrones aprendidos de demostraciones humanas, útil en entornos de química o biología.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto de diferentes configuraciones de sensores (5 sensores, 10 kHz, nfft_512) en el rendimiento de políticas ACT.
- Benchmarking de algoritmos de control: el banco de pruebas `shake4it_bench` permite comparar el rendimiento de distintas políticas (ACT, Diffusion Policy, etc.) en una tarea estandarizada.
- Desarrollo de robots de bajo coste: al ser un modelo ligero (51M parámetros), puede desplegarse en robots con hardware modesto, como el SO-100, para prototipado rápido.
- Evaluación de robustez ante variaciones de sensores: el modelo puede probarse con diferentes configuraciones de sensores (acelerómetro, dragonfly, etc.) para analizar su generalización.
- Formación en robótica: el modelo y su dataset asociado pueden utilizarse en cursos o talleres para enseñar conceptos de aprendizaje por imitación y control de robots.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de métricas como tasa de éxito, precisión de acciones o comparaciones con otros modelos en la tarea `shake4it_bench`. Se recomienda consultar el repositorio del autor o ejecutar evaluaciones propias con el script `lerobot-record` para obtener métricas.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 51,6M parámetros, la inferencia requiere menos de 1 GB de VRAM en precisión FP32 (aproximadamente 200 MB de pesos). Con cuantización (no publicada) podría reducirse aún más.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1050, RTX 2060, o incluso CPU para inferencia no en tiempo real.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna de consumo.
- Opciones de despliegue: LeRobot proporciona scripts de evaluación (`lerobot-record`) y soporta inferencia con PyTorch. También puede integrarse con ROS u otros frameworks de robótica.
- Latencia y throughput: no se dispone de datos medidos, pero dado el tamaño del modelo, se espera una latencia inferior a 10 ms en GPU moderna para un chunk de acciones.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El autor ha publicado otras políticas similares en su perfil de Hugging Face, como `policy_2026-07-28_shake4it_bench_dragonfly_10kHz_nfft_512` o `policy_2026-07-28_shake4it_bench_accelero_10kHz_nfft_512`, que probablemente varían en el tipo de sensores o configuración, pero no se conocen sus parámetros ni rendimiento. No se dispone de datos de modelos comparables de otros autores para esta tarea específica.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una tarea concreta (agitación en `shake4it_bench`) con una configuración de sensores específica; no es generalizable a otras tareas sin reentrenamiento.
- Dependencia del dataset: el rendimiento depende de la calidad y variedad de las demostraciones teleoperadas; si el dataset tiene sesgos (por ejemplo, movimientos limitados), el modelo los heredará.
- Sin capacidades de razonamiento o lenguaje: no puede interpretar instrucciones verbales ni adaptarse a situaciones no vistas.
- Riesgo de alucinación en acciones: como todo modelo de imitación, puede generar acciones incorrectas si las observaciones difieren del dominio de entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- Sin información sobre cuantización: no se han publicado versiones cuantizadas, por lo que el despliegue en hardware muy limitado puede requerir trabajo adicional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/jogarulfop/policy_2026-08-31_shake4it_bench_5sensors_dragonfly_10kHz_nfft_512)
- [Dataset asociado](https://huggingface.co/datasets/jogarulfop/2026-08-31_shake4it_bench_5sensors_dragonfly_10kHz_nfft_512)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)

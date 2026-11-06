# MariaFPG/act_place_the_yellow_cube_in_the_yellow_drawer

## Resumen

ACT (Action Chunking Transformer) es una política de control robótico entrenada para ejecutar una tarea de manipulación concreta: coger un cubo amarillo, colocarlo dentro de un cajón amarillo y cerrar el cajón. El modelo lo publica la usuaria MariaFPG en Hugging Face y se ha entrenado con LeRobot v2.1 sobre el robot Trossen AI Stationary, un brazo manipulador de sobremesa. No es un modelo de lenguaje: es un policy de imitación que mapea observaciones visuales y de estado del robot a secuencias de acciones motoras.

El modelo cuenta con 51.685.114 parámetros y se distribuye en formato safetensors dentro de un repositorio de 3,1 GB que incluye, además de los pesos del paso 100.000, cinco checkpoints completos de entrenamiento (pasos 20.000, 40.000, 60.000, 80.000 y 100.000). La tarea está definida de forma cerrada y el autor no declara ninguna tasa de éxito en evaluación, por lo que se trata de un artefacto de investigación reproducible más que de un componente listo para producción.

Su relevancia es acotada: sirve como ejemplo práctico de entrenamiento de políticas ACT con LeRobot y como punto de partida para quien quiera reproducir o adaptar un pipeline de imitación sobre hardware Trossen. No hay información sobre licencia, idiomas ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación para robótica |
| Parametros totales | 51.685.114 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de control motor, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no aplica: no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (estructura LeRobot: `pretrained_model/` y `training_state/`) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación robótica que predice *chunks* de acciones (secuencias de comandos motores) a partir de observaciones. En lugar de generar una acción por paso, el modelo emite un bloque de acciones que se ejecutan en bucle abierto durante varios timesteps, lo que reduce el error de acumulación y mejora la estabilidad del control. La arquitectura combina un codificador visual (típicamente ResNet con proyección a tokens) con un transformer encoder-decoder que condiciona la predicción de acciones sobre el estado del robot y las imágenes de cámara.

El entrenamiento se ha realizado con LeRobot v2.1 sobre el dataset `MariaFPG/place_the_yellow_cube_in_the_yellow_drawer`, que contiene 30.100 filas en formato tabular, series temporales y vídeo, en un único split de entrenamiento. El autor indica que se usó el checkout local de LeRobot y la política ACT sobre el robot Trossen AI Stationary. No se especifican el número de tokens, la composición exacta del dataset, ni si hubo RLHF/DPO (no aplica en este dominio). Se conservan cinco checkpoints completos con optimizer, estado del generador aleatorio y scheduler, lo que permite reanudar el entrenamiento de forma local.

## Capacidades

- Ejecución de una tarea de manipulación concreta: coger un cubo amarillo, introducirlo en un cajón amarillo y cerrar el cajón.
- Control motor de un brazo robótico Trossen AI Stationary a partir de observaciones visuales y de estado.
- Predicción de chunks de acciones (action chunking) para control estable en bucle abierto.
- Carga como política de evaluación remota mediante `--control.policy.path=MariaFPG/act_place_the_yellow_cube_in_the_yellow_drawer`.
- Reanudación de entrenamiento desde checkpoints completos (20k, 40k, 60k, 80k, 100k) usando `--resume=true` con el `train_config.json` local.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, visión general ni capacidades multilingües.

## Casos de uso

- Reproducción de experimentos de imitación robótica: sirve para replicar el pipeline ACT de LeRobot sobre hardware Trossen y comparar curvas de entrenamiento entre los cinco checkpoints publicados.
- Evaluación de políticas de manipulación en laboratorio: el checkpoint de 100.000 pasos puede cargarse como política remota para medir la tasa de éxito real en el robot físico, dado que el autor no la declara.
- Base para fine-tuning en tareas similares: al conservar `training_state/`, se puede reanudar el entrenamiento y adaptar la política a variantes de la tarea (otros objetos, otras posiciones del cajón).
- Docencia y formación en robótica de imitación: ejemplo completo y reproducible de un entrenamiento ACT con dataset, checkpoints y configuración de LeRobot.
- Benchmark interno de infraestructura: útil para validar pipelines de carga de políticas, gestión de checkpoints y despliegue en robots Trossen AI Stationary.
- Estudio de action chunking: permite analizar empíricamente cómo evoluciona la política entre los pasos 20k y 100k y el efecto del chunking en la estabilidad del cierre del cajón.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna tasa de éxito de evaluación para estos pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros, los pesos en fp32 ocupan aproximadamente 207 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no disponible; por tamaño, una RTX 3060 o superior es suficiente para la política, aunque el cuello de botella real es el robot físico y las cámaras.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; el repositorio de 3,1 GB incluye checkpoints completos, no solo pesos de inferencia.
- Opciones de despliegue: LeRobot v2.1 (carga remota de política para evaluación); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MariaFPG/act_place_the_yellow_cube_in_the_yellow_drawer | 51,7 M | no aplica | Manipulación (cubo y cajón) | no disponible | Hugging Face, repo privado con acceso autenticado |
| Otras políticas ACT en LeRobot Hub | no disponible | no aplica | Manipulación genérica | variable | no disponible |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación genérica | variable | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables verificables en la información proporcionada; la comparativa anterior es meramente categórica.

## Limitaciones y advertencias

- Tarea cerrada y específica: solo está entrenado para coger un cubo amarillo, meterlo en un cajón amarillo y cerrarlo; no generaliza a otros objetos ni escenas.
- Sin tasa de éxito declarada: el autor no aporta métricas de evaluación, por lo que el rendimiento real en el robot es desconocido.
- Licencia no disponible: no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Acceso restringido: el repositorio está marcado como privado y requiere autenticación con la cuenta del propietario, lo que limita la reproducibilidad externa.
- Dependencia de hardware: entrenado sobre Trossen AI Stationary; su uso en otro robot requeriría reentrenamiento o adaptación.
- Riesgo de sobreajuste al dataset: 30.100 filas de un único entorno pueden no cubrir variaciones de iluminación, posiciones o distracciones.
- Sin soporte de lenguaje natural: no acepta instrucciones textuales ni razonamiento; es un policy puramente reactivo.
- Reanudación remota no implementada: el propio autor advierte que el reentrenamiento remoto no está soportado en su checkout de LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MariaFPG/act_place_the_yellow_cube_in_the_yellow_drawer
- Dataset en Hugging Face: https://huggingface.co/datasets/MariaFPG/place_the_yellow_cube_in_the_yellow_drawer
- Visor del dataset: https://huggingface.co/datasets/MariaFPG/place_the_yellow_cube_in_the_yellow_drawer/viewer
- LeRobot (framework de entrenamiento): no disponible en la información proporcionada
- Paper de ACT (Action Chunking Transformer): no disponible en la información proporcionada

# AutoRLBench/robometer-4b-lora-busybox-demo39

## Resumen

Robometer-4B LoRA busybox demo39 es un ajuste fino mediante LoRA del modelo de recompensa Robometer-4B, que a su vez se construye sobre la arquitectura Qwen3-VL-4B. Lo publica la organización AutoRLBench dentro de un banco de pruebas de aprendizaje por refuerzo para robótica, y su propósito concreto es estimar el progreso y la probabilidad de éxito de una tarea de manipulación robótica a partir de imágenes de varias cámaras.

El modelo resuelve un problema muy específico: proporcionar una señal de recompensa densa y por fotograma para políticas de control robótico. Se ha entrenado con 39 demostraciones teleoperadas de la tarea "pulsar el botón verde" sobre un brazo SO-101, con las vistas superior, frontal y de muñeca embaldosadas en un único fotograma de entrada. La salida es una estimación de progreso y una probabilidad de éxito que, en el baseline DSRL + Robometer, se suma a la recompensa de DSRL como ganancia de progreso.

Por su naturaleza, no es un modelo de propósito general sino un artefacto de investigación reproducible: pesos fusionados más adaptador LoRA y cabezas específicas de Robometer, servidos mediante un fork concreto del repositorio de evaluación. Su relevancia radica en demostrar cómo un modelo de recompensa multimodal puede adaptarse con muy pocos datos a una tarea concreta de robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL) con cabezas de recompensa Robometer |
| Parametros totales | 4.513.065.228 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (modelo fusionado, adaptador LoRA y cabezas personalizadas) |

## Arquitectura y entrenamiento

El modelo parte de Robometer-4B, un modelo de recompensa basado en Qwen3-VL-4B. Sobre esa base se aplica un ajuste LoRA con rango 32, alpha 64 y dropout 0,05, entrenado durante 500 pasos con batch 4 y acumulación de gradiente 4, tasa de aprendizaje 2e-5 y un 10 % de warmup. Los datos son 39 demostraciones exitosas teleoperadas de la tarea "pulsar el botón verde" del entorno busybox con un brazo SO-101, con tres cámaras embaldosadas en un solo fotograma y 8 fotogramas por trayectoria a resolución 640x540.

La innovación técnica está en la formulación de la señal de recompensa: el modelo produce una estimación de progreso por fotograma y una probabilidad de éxito, y la pérdida de progreso es discreta. El repositorio incluye tanto los pesos fusionados (`model.safetensors`) como el adaptador LoRA (`adapter_model.safetensors`) y las cabezas específicas (`custom_heads.safetensors`), además de la configuración de entrenamiento de Robometer con `use_unsloth: false`. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición completa del dataset más allá de las demostraciones citadas.

## Capacidades

- Estimación de progreso por fotograma en tareas de manipulación robótica.
- Predicción de probabilidad de éxito de la tarea a partir de observaciones visuales.
- Procesamiento de entrada visual multimodal con tres vistas de cámara embaldosadas (superior, frontal y muñeca).
- Generación de señal de recompensa densa apta para aprendizaje por refuerzo (integración con DSRL como ganancia de progreso).
- Especialización en una tarea concreta: pulsar el botón verde en el entorno busybox con SO-101.
- No se documentan capacidades de tool calling, agentes, multilingüismo, thinking mode, audio ni otras funciones generales del modelo base.

## Casos de uso

- Entrenamiento de políticas con refuerzo: el modelo se usa como fuente de recompensa densa por fotograma, sumando la ganancia de progreso a la recompensa de DSRL para acelerar el aprendizaje de la tarea busybox.
- Reproducción de baselines de investigación: permite replicar el baseline "DSRL + Robometer" del proyecto armnet-rlt sobre las mismas 39 demostraciones teleoperadas.
- Evaluación automática de políticas: sirve para medir la probabilidad de éxito de una política candidata sin intervención humana, a partir de las vistas de cámara.
- Filtrado y curación de datos: puede puntuar trayectorias teleoperadas y descartar o priorizar demostraciones según el progreso estimado.
- Estudio de adaptación con pocos datos: al estar entrenado con solo 39 demostraciones, es un caso de referencia para investigar la transferencia de modelos de recompensa a tareas nuevas.
- Servicio de inferencia local para robótica: se despliega con el servidor de evaluación del repositorio en una sola GPU con batch 4, adecuado para experimentos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.513 millones de parámetros en safetensors de precisión completa se requiere aproximadamente 9 GB solo para pesos, más memoria para activaciones y vision encoder.
- GPU recomendadas: no disponible en la información proporcionada; el comando de servicio usa `num_gpus=1` y `batch_size=4`.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos es plausible en GPUs con 16-24 GB, pero no hay dato oficial.
- Opciones de despliegue: servidor de evaluación del fork `armnet-tiled` del repositorio https://github.com/jesbu1/robometer mediante `robometer/evals/eval_server.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| robometer-4b-lora-busybox-demo39 | 4.513 M | no disponible | Recompensa robótica (busybox) | no disponible | Hugging Face |
| robometer/Robometer-4B (base) | no disponible | no disponible | Recompensa robótica general | no disponible | Hugging Face |
| Qwen3-VL-4B (arquitectura subyacente) | ~4 B | no disponible | Multimodal general | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el ajuste está entrenado únicamente para la tarea "pulsar el botón verde" con SO-101 y tres cámaras embaldosadas; su uso fuera de ese entorno no está validado.
- Dataset muy reducido: solo 39 demostraciones exitosas, lo que limita la generalización y aumenta el riesgo de sobreajuste.
- Dependencia del formato de entrada: requiere el embaldosado concreto de vistas (`AutoRLBench_so101_busybox_demo39_tiled`); otras configuraciones de cámara pueden degradar la señal.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idiomas y sesgos: no documentados; al ser un modelo de recompensa visual, puede heredar sesgos del modelo base y de los datos de entrenamiento.
- Riesgo de alucinación en la estimación de progreso: al ser una predicción probabilística, puede sobreestimar el éxito en trayectorias no vistas.
- Requiere un fork específico del repositorio de evaluación (`armnet-tiled`), lo que añade fricción de despliegue.
- Sin descargas ni validación comunitaria en el momento de la consulta; no hay evidencia externa de robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutoRLBench/robometer-4b-lora-busybox-demo39
- Modelo base Robometer-4B: https://huggingface.co/robometer/Robometer-4B
- Repositorio de evaluación (fork armnet-tiled): https://github.com/jesbu1/robometer
- Dataset de entrenamiento: AutoRLBench/busybox_push_green_button_426x240 (referenciado en la model card, sin URL directa en la información disponible)

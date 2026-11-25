# glannuzel/grab-coke-can_act_close08

## Resumen

`glannuzel/grab-coke-can_act_close08` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. Lo desarrolla el usuario glannuzel y se publica a través de LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. El modelo resuelve una tarea concreta: agarrar una lata de refresco ("grab-coke-can") con un robot de tipo `grabette`.

La política consume una imagen de cámara (`observation.images.cam0`, a resolución 3×486×648) y un vector de estado de 2 dimensiones, y produce un vector de acción de 8 dimensiones. Con 51.594.888 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real sobre hardware de robot de sobremesa.

Es relevante como ejemplo reproducible de un pipeline completo de imitación: dataset público de 154 episodios y 25.149 fotogramas a 30 FPS, configuración de entrenamiento documentada y script de despliegue con `lerobot-rollout`. No obstante, no incluye resultados de evaluación en robot real, por lo que su tasa de éxito no está validada de forma pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.594.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje; entrada de 1 imagen + estado de 2 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice "chunks" de acciones (secuencias cortas de comandos) en lugar de un único paso por inferencia. La arquitectura combina un encoder visual (procesa la imagen de cámara a 3×486×648) con un transformer que fusiona la observación visual y el estado del robot (2 dimensiones) para generar el vector de acción de 8 dimensiones. Este diseño reduce el error de acumulación típico de las políticas paso a paso y permite ejecutar movimientos más suaves y consistentes.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `glannuzel/grab-coke-can_act_graspproj`: 154 episodios, 25.149 fotogramas a 30 FPS, tarea "grab-coke-can". La configuración fue de 80.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es aprendizaje supervisado puro a partir de demostraciones de teleoperación.

## Capacidades

- Control robótico de agarre: genera comandos de acción de 8 dimensiones para ejecutar la tarea "grab-coke-can" con el robot `grabette`.
- Percepción visual monocular: procesa una única cámara (`cam0`) a 486×648 píxeles.
- Fusión visión-estado: combina la imagen con un vector de estado de 2 dimensiones para condicionar la acción.
- Predicción de chunks de acciones: emite secuencias cortas de comandos, lo que mejora la estabilidad frente a políticas de un solo paso.
- Despliegue en tiempo real: pensado para ejecutarse a 30 FPS sobre el hardware del robot.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento lingüístico ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Manipulación de objetos en línea de montaje: la política puede ejecutar el agarre de una lata de refresco de forma repetitiva; es adecuada porque está entrenada específicamente para esa tarea y objeto con 154 episodios de demostración.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible para comparar variantes de ACT, ya que la configuración de entrenamiento y el dataset están documentados y son públicos.
- Prototipado de robots de bajo coste: al tener 51,6 M de parámetros y 0,2 GB de pesos, puede desplegarse en un equipo con GPU modesta conectado al robot `grabette`.
- Reentrenamiento con nuevos objetos: el pipeline `lerobot-train` permite sustituir el dataset y adaptar la política a otras tareas de agarre, usando esta como punto de partida.
- Docencia y demostraciones de robótica: el comando `lerobot-rollout` con `--duration=60` permite ejecutar una demo controlada de 60 segundos sin grabar episodios.
- Validación de hardware y calibración: útil para comprobar el funcionamiento de la cámara `cam0` y del puerto del robot antes de entrenar políticas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (tasa de éxito, número de ensayos ni condiciones de prueba).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,6 M de parámetros en safetensors (0,2 GB de pesos) el modelo cabe holgadamente en GPUs de consumo, aunque el pico de memoria depende del encoder visual a 486×648 y del batch de inferencia.
- GPU recomendadas: no documentadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores, aunque no hay confirmación del autor.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) con el robot `grabette` y cámaras OpenCV a 640×480 y 30 FPS; el entrenamiento se realiza con `lerobot-train` en dispositivo `cuda`.
- Latencia y throughput: no disponibles; el sistema está diseñado para operar a 30 FPS, pero no se publican mediciones de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glannuzel/grab-coke-can_act_close08 | 51,6 M | Agarre de lata con robot `grabette` | Imagen 3×486×648 + estado (2,) | apache-2.0 | Hugging Face (LeRobot) |
| Políticas ACT genéricas de LeRobot | no disponible | Tareas de manipulación variadas | Depende del dataset | apache-2.0 (típicamente) | Hugging Face / LeRobot |
| Políticas Diffusion Policy | no disponible | Manipulación por imitación | Depende del dataset | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasa de éxito ni número de ensayos en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Especialización estrecha: entrenada únicamente para la tarea "grab-coke-can" con el robot `grabette` y la cámara `cam0`; no generaliza a otros objetos, robots ni configuraciones de cámara sin reentrenamiento.
- Dependencia del hardware: el despliegue exige el robot `grabette`, el puerto correcto y cámaras cuyos nombres coincidan con las claves de observación del entrenamiento.
- Sensibilidad a condiciones visuales: al usar una sola cámara, cambios de iluminación, posición del objeto o distracciones pueden degradar el comportamiento; no se documenta robustez frente a estas variaciones.
- Sin capacidades lingüísticas: no procesa texto ni instrucciones en lenguaje natural; la tarea se fija en el entrenamiento.
- Riesgo de sobreajuste al dataset: con 154 episodios y 80.000 pasos de entrenamiento, es plausible un sobreajuste a las trayectorias demostradas, aunque no se aportan curvas de validación.
- Licencia permisiva: apache-2.0 permite uso comercial, pero la ausencia de evaluación limita la confianza para despliegues reales.
- Sesgos: no disponibles; no se documentan análisis de sesgo, aunque en robótica los sesgos provienen de la distribución de demostraciones (posiciones, objetos y condiciones del dataset).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glannuzel/grab-coke-can_act_close08
- Dataset de entrenamiento: https://huggingface.co/datasets/glannuzel/grab-coke-can_act_graspproj
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=glannuzel/grab-coke-can_act_graspproj
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference

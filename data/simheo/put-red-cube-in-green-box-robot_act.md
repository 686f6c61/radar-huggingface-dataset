# simheo/put-red-cube-in-green-box-robot_act

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado y mejora la estabilidad de las políticas manipulativas. Este repositorio concreto, `simheo/put-red-cube-in-green-box-robot_act`, contiene una política entrenada con LeRobot para la tarea específica de colocar un cubo rojo en una caja verde mediante un robot de tipo `grabette`, usando una única cámara (`cam0`) y un vector de estado de 2 dimensiones.

El modelo es un transformer de 51,59 millones de parámetros que consume observaciones visuales de resolución 486×648 junto con el estado del robot, y emite un vector de acción de 8 dimensiones. Se entrenó sobre un dataset propio de 45 episodios y 8.981 fotogramas a 30 FPS, durante 25.000 pasos con AdamW y un learning rate de 1e-5. Es relevante como ejemplo reproducible del flujo completo de LeRobot (grabación de datos, entrenamiento y despliegue) para tareas de manipulación pick-and-place, aunque carece de evaluación publicada.

La ficha describe una política de robótica de propósito muy concreto, no un modelo de lenguaje: no procesa texto libre ni mantiene conversaciones, sino que mapea observaciones sensoriales a comandos motores. Su utilidad práctica depende enteramente de la coincidencia entre el hardware de entrenamiento (robot `grabette`, cámara y calibración) y el hardware de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer para imitación robótica |
| Parametros totales | 51.594.888 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por la política) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | grabette |
| Camaras | cam0 |
| Entrada visual | observation.images.cam0, tensor (3, 486, 648) |
| Entrada de estado | observation.state, tensor (2,) |
| Salida de accion | action, tensor (8,) |
| Tamano del repositorio | 0,2 GB |
| Version de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

ACT emplea un transformer encoder-decoder con un backbone visual (ResNet) que procesa la imagen de la cámara y la fusiona con el vector de estado del robot. La innovación central del método es la predicción de chunks de acción: en lugar de emitir una única acción por paso, el modelo genera una secuencia corta de acciones futuras, lo que mitiga el problema de compounding error típico de las políticas de imitación paso a paso y permite un control más suave. El repositorio sigue la implementación de LeRobot, con 51,59 millones de parámetros en total.

El entrenamiento se realizó sobre el dataset `simheo/put-red-cube-in-green-box-robot_act_graspproj`, compuesto por 45 episodios teleoperados y 8.981 fotogramas a 30 FPS para la tarea "put-red-cube-in-green-box-robot". La configuración fue de 25.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje por imitación supervisado puro a partir de demostraciones.

## Capacidades

- Control motor de manipulación robótica: genera comandos de acción de 8 dimensiones a partir de observaciones visuales y de estado.
- Predicción de chunks de acción para ejecución estable en tareas pick-and-place.
- Percepción visual monocámara a resolución 486×648.
- Aprendizaje por imitación a partir de datos teleoperados (no requiere recompensas explícitas).
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Manipulación pick-and-place en laboratorio: la política ejecuta la tarea de colocar un cubo rojo en una caja verde sobre un robot `grabette`, sirviendo como base reproducible para experimentos de imitación.
- Prototipado de pipelines de aprendizaje por imitación: útil para validar el flujo completo de LeRobot (grabación con `lerobot-rollout`, entrenamiento con `lerobot-train` y despliegue) antes de escalar a tareas más complejas.
- Reproducción de experimentos académicos: permite replicar el método ACT con un dataset pequeño (45 episodios) y verificar la sensibilidad a hiperparámetros como el learning rate o el número de pasos.
- Docencia y formación en robótica: ejemplo didáctico de política visuomotora con una única cámara y estado de baja dimensionalidad, adecuado para cursos de aprendizaje por imitación.
- Benchmark interno de hardware: al ser una tarea acotada, sirve para comparar latencia y estabilidad entre distintas GPUs o configuraciones de control en el robot.
- Base para fine-tuning en tareas similares: el checkpoint puede reentrenarse con nuevos datasets de la misma familia de robot para adaptar la política a variantes de la tarea.
- Evaluación de robustez ante cambios de iluminación o posición de objetos: al no haber resultados publicados, el modelo es un candidato para estudiar la degradación de la política en condiciones fuera de distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,59 millones de parámetros; en FP32 ocupa aproximadamente 0,21 GB de pesos, y en FP16 alrededor de 0,10 GB, por lo que la VRAM necesaria es mínima (menos de 1 GB incluyendo activaciones y buffers).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se recomienda una RTX 3060 o superior para garantizar latencia baja en control en tiempo real.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4060, etc.) e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; el control se ejecuta a 30 FPS según la tasa del dataset, pero no se publican mediciones de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| simheo/put-red-cube-in-green-box-robot_act | 51,59 M | Imagen 486×648 + estado (2,) | Pick-and-place con robot grabette | apache-2.0 | Hugging Face |
| Políticas ACT de LeRobot (generales) | ~51 M (tipico) | Depende del dataset | Manipulación variada | apache-2.0 | Hugging Face / LeRobot |
| Políticas Diffusion Policy | no disponible | Depende del dataset | Manipulación visuomotora | no disponible | Repositorios académicos |
| Políticas RT-1 / RT-2 | no disponible | Depende del modelo | Manipulación generalista | no disponible | No público en su mayoría |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real de la política en la tarea.
- Dataset muy pequeño (45 episodios, 8.981 fotogramas): alta probabilidad de sobreajuste y baja generalización a nuevas posiciones, iluminaciones u objetos.
- Dependencia estricta del hardware: la política está entrenada para el robot `grabette` con una cámara `cam0`; cambios de calibración, montaje o tipo de cámara pueden invalidar el comportamiento.
- Sin capacidades de lenguaje: no admite instrucciones en texto libre ni razonamiento simbólico; la tarea está fijada en el entrenamiento.
- Riesgo de fallos silenciosos: al no haber evaluación, no se conocen los modos de fallo típicos (agarre fallido, colisiones, deriva).
- Licencia apache-2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento físico del robot recae en el desplegador.
- Sin información sobre sesgos: no aplica en el sentido habitual de sesgos lingüísticos, pero sí existe riesgo de sesgo hacia las condiciones de los datos de entrenamiento.
- No se documentan cuantizaciones ni formatos alternativos de pesos, lo que limita el despliegue en entornos con restricciones de memoria muy severas (aunque el tamaño es reducido).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/simheo/put-red-cube-in-green-box-robot_act
- Dataset de entrenamiento: https://huggingface.co/datasets/simheo/put-red-cube-in-green-box-robot_act_graspproj
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=simheo/put-red-cube-in-green-box-robot_act_graspproj

# arkqz/so101-pickup-among-eight-v14

## Resumen

SO-101 pickup among eight cubes es una política de control robótico para el brazo SO-101, publicada en Hugging Face por el usuario arkqz. El modelo resuelve una tarea concreta de manipulación: seleccionar uno de ocho cubos de 25 mm distribuidos aleatoriamente sobre una mesa, agarrarlo y levantarlo durante una retención breve. No es un modelo de lenguaje ni un sistema generalista, sino un controlador de extremo a extremo que combina movimiento derivado de demostraciones con correcciones deterministas de PPO (Proximal Policy Optimization).

La política opera en bucle cerrado a 20 Hz (una llamada cada 50 ms) y consume como entrada el estado propioceptivo del brazo (posiciones, velocidades y objetivos previos de las seis articulaciones) junto con una imagen RGB completa de 720 × 1280 × 3 procedente de una cámara de muñeca Innomaker U20CAM-1080p-S1. La salida es un vector de seis objetivos absolutos de articulación en grados (cinco ejes) y porcentaje (pinza).

Su relevancia radica en que documenta de forma inusualmente rigurosa un pipeline de simulación a política desplegable: currículo de nueve horas, criterios de éxito estrictos y verificables, y un paquete de inferencia autocontenido que solo requiere NumPy, SciPy y PyTorch. El repositorio, sin embargo, tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal (actor TorchScript) con selector visual y selector de movimiento deterministas; correcciones PPO sobre movimiento nominal derivado de demostraciones |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de episodio de 300 comandos (15 s simulados a 20 Hz) |
| Tipos de cuantización | no disponible (actor exportado como TorchScript para CPU) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | TorchScript (`weights/actor.pt`) más configuración comprimida JSON (`weights/motion.json.gz`) y manifiesto (`policy.json`) |

## Arquitectura y entrenamiento

La política combina dos componentes. Por un lado, un actor neuronal que recibe la imagen RGB completa reescalada a [0,1] sin recorte, redimensionado ni historial de fotogramas, y que se suma a un movimiento nominal interpolado a partir de demostraciones. Por otro, dos módulos deterministas: un selector visual que separa componentes naranjas de la imagen, estima su posición sobre la mesa y prefiere el componente cercano al alcance demostrado, y un selector de movimiento que enmascara el resto de componentes naranjas. El actor nunca recibe poses del simulador, flags de contacto o éxito, ni comandos de profesor. La geometría de cámara usada para la estimación imagen-mesa es configuración calibrada, no estado real por paso.

El entrenamiento consistió en un currículo de nueve horas con demostraciones simuladas, ejemplos correctivos y PPO con 12 entornos concurrentes. La política cualificada para ocho cubos es la transferida desde ese currículo. La inferencia añade correcciones PPO acotadas al movimiento nominal, recorta los comandos normalizados y los convierte a grados y porcentaje absolutos del seguidor. Las fases de retorno y liberación conservan su controlador de realimentación cualificado. El paquete fija el snapshot de datasheet `7f4456fa25c4d35b521fa556701afade4c641ba0` y una pose de reinicio obligatoria de `[0, -16.802, 3.027, 87.881, -86.664, 50.984]` en unidades del seguidor.

## Capacidades

- Selección visual de un cubo entre ocho objetos naranjas de 25 mm colocados aleatoriamente sobre la mesa.
- Agarre y elevación con retención breve (hasta 15 s simulados, 300 comandos).
- Control en bucle cerrado a 20 Hz con realimentación de posiciones y velocidades articulares.
- Percepción basada en una única imagen RGB de muñeca, sin historial de fotogramas.
- Inferencia solo en CPU con NumPy, SciPy y PyTorch; no requiere MuJoCo, Stable-Baselines3, acceso a nube ni cinemática inversa.
- No soporta tool calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: es un controlador motor específico de tarea.
- No devuelve señal de éxito ni ejecuta colocación o liberación del objeto.

## Casos de uso

- Investigación en manipulación robótica simulada: sirve como referencia reproducible para estudiar selección visual y agarre con el brazo SO-101 en MuJoCo, dado que el paquete incluye perfiles de cámara y robot y resultados por episodio.
- Evaluación de pipelines sim-to-real: la política y sus criterios estrictos permiten medir la brecha entre simulación y hardware antes de transferir a un brazo físico.
- Docencia en aprendizaje por refuerzo e imitación: el currículo de nueve horas con demostraciones, ejemplos correctivos y PPO constituye un caso de estudio acotado y con métricas publicadas.
- Benchmark de selección visual entre distractores: la tarea de elegir un cubo entre ocho con componentes naranjas similares evalúa la robustez del selector ante ambigüedad perceptiva.
- Prueba de integración de controladores a 20 Hz: el contrato de entrada/salida (`Policy.predict(state)`) y el límite de 300 llamadas facilitan validar bucles de control y gestión de episodios en hosts propios.
- Comparación de criterios de éxito: los dos criterios reportados (estricto y original) permiten calibrar umbrales de evaluación en proyectos de agarre y elevación.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Colocaciones de cualificación sin ayuda (frescas) | 100 |
| Agarre estricto y estable | 81/100 (81 %) |
| Criterio de agarre original | 86/100 (86 %) |

Evaluación del 12 de noviembre de 2026 con la cámara calibrada del datasheet, pose fija de reinicio y ocho cubos muestreados de la distribución de colocación del datasheet. Intentos de hasta 15 s simulados (300 comandos a 20 Hz), sin asistencia de profesor ni cinemática inversa. Semillas 3300000–3300099. El criterio estricto exige agarre bilateral dentro de las almohadillas, al menos 10 mm de holgura bajo el cubo, ningún otro soporte y velocidad del cubo ≤ 0,1 m/s de forma continua durante un segundo. El criterio original exige z mundial del punto medio > 22,5 mm con contacto del brazo continuo durante un segundo. La política superó la puerta de avance estricta de 80/100 definida por el usuario. El replay local de exportación en la semilla 3310001 completó un agarre estricto en 118 comandos.

## Requisitos de hardware

- VRAM estimada: no disponible; el actor se ejecuta en CPU (TorchScript) y el tamaño del repositorio es de 0,0 GB, por lo que la huella es mínima.
- GPU recomendadas: no aplica; no se documenta requisito de GPU. Cualquier CPU capaz de ejecutar PyTorch y procesar un fotograma RGB de 720 × 1280 a 20 Hz es suficiente.
- GPU de consumo: no aplica; el modelo está pensado para inferencia en CPU.
- Despliegue: copia local del repositorio con `requirements.txt` (NumPy, SciPy, PyTorch) y el punto de entrada `policy.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: no se publican cifras de latencia; el contrato exige una llamada cada 50 ms (20 Hz) y un máximo de 300 llamadas por episodio.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye políticas comparables de la misma tarea, tamaño o brazo robótico, ni datos de otros modelos de manipulación con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La muestra de cualificación es finita y el propio autor advierte que no establece fiabilidad en el mundo real; los resultados son de simulación.
- Los resultados en nube y en simulación local pueden diferir, según la model card.
- No es una política de apilamiento ni de colocación: no devuelve señal de éxito ni ejecuta liberación del objeto.
- El selector fija un objetivo en el reinicio y no reintenta ni cambia de cubo durante el episodio.
- La imagen debe entregarse en orientación de política (rotada 180 grados respecto a las coordenadas de calibración de la lente), sin desdistorsionar ni recortar; un preprocesado incorrecto invalida el comportamiento.
- Depende de una pose de reinicio exacta y de un snapshot de datasheet concreto, incluida una calibración de montaje visual provisional fechada el 11 de noviembre de 2026.
- `predict` lanza un error tras 300 llamadas; el host debe detener el episodio antes y reiniciar.
- Licencia no declarada: no hay autorización explícita para uso comercial ni condiciones de redistribución.
- No se documentan sesgos, pero al ser un controlador motor específico no aplican las categorías habituales de sesgo lingüístico; el riesgo principal es de fallo físico o de agarre en condiciones fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arkqz/so101-pickup-among-eight-v14
- Resultados agregados de cualificación: https://huggingface.co/arkqz/so101-pickup-among-eight-v14/blob/main/evaluation/qualification.json
- Resultados individuales por episodio: https://huggingface.co/arkqz/so101-pickup-among-eight-v14/blob/main/evaluation/qualification-episodes.json
- Registro del replay de exportación: https://huggingface.co/arkqz/so101-pickup-among-eight-v14/blob/main/evaluation/export-replay.json
- Perfil de cámara: https://huggingface.co/arkqz/so101-pickup-among-eight-v14/blob/main/wrist-camera.json
- Perfil de robot: https://huggingface.co/arkqz/so101-pickup-among-eight-v14/blob/main/robot-profile.json
- Alineación seguidor-simulación: https://huggingface.co/arkqz/so101-pickup-among-eight-v14/blob/main/follower-to-sim.json
- Punto de entrada de la política: https://huggingface.co/arkqz/so101-pickup-among-eight-v14/blob/main/policy.py
- Controlador: https://huggingface.co/arkqz/so101-pickup-among-eight-v14/blob/main/inference/controller.py
- Interpolación de movimiento: https://huggingface.co/arkqz/so101-pickup-among-eight-v14/blob/main/inference/trajectory_student.py
- Selección de cubo: https://huggingface.co/arkqz/so101-pickup-among-eight-v14/blob/main/inference/cube_selection.py
- Pesos del actor: https://huggingface.co/arkqz/so101-pickup-among-eight-v14/blob/main/weights/actor.pt
- Movimiento y normalización congelada: https://huggingface.co/arkqz/so101-pickup-among-eight-v14/blob/main/weights/motion.json.gz
- Manifiesto: https://huggingface.co/arkqz/so101-pickup-among-eight-v14/blob/main/policy.json
- Requisitos: https://huggingface.co/arkqz/so101-pickup-among-eight-v14/blob/main/requirements.txt
- Replay de exportación local, vista de muñeca: https://huggingface.co/arkqz/so101-pickup-among-eight-v14/blob/main/media/export-replay-wrist.mp4
- Éxito en nube, vista observador: https://huggingface.co/arkqz/so101-pickup-among-eight-v14/blob/main/media/cloud-success-observer.mp4
- Fallo en nube, vista observador: https://huggingface.co/arkqz/so101-pickup-among-eight-v14/blob/main/media/cloud-failure-observer.mp4

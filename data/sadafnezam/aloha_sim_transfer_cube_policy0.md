# sadafnezam/aloha_sim_transfer_cube_policy0

## Resumen

`sadafnezam/aloha_sim_transfer_cube_policy0` es una política de imitación robótica basada en ACT (Action Chunking with Transformers), publicada en el Hub de Hugging Face a través de la librería LeRobot. No es un modelo de lenguaje: es un modelo de control motor que, a partir de una imagen de cámara y el estado articular del robot, predice acciones de manipulación. El modelo ha sido entrenado específicamente para la tarea "Pick up the cube with the right arm and transfer it to the left arm" sobre el robot simulado ALOHA.

El modelo resuelve el problema de la generación de trayectorias de manipulación bimanual a partir de demostraciones teleoperadas, empleando la técnica de predicción de *chunks* de acciones en lugar de pasos individuales, lo que reduce el error de composición acumulado y estabiliza la ejecución. Cuenta con 51.685.006 parámetros (dato real de los pesos en safetensors) y un repositorio de 0,2 GB.

Es relevante como ejemplo reproducible de un *pipeline* completo de aprendizaje por imitación con LeRobot: incluye configuración de entrenamiento, dataset de origen y comandos de despliegue. No obstante, se trata de un artefacto de investigación con 0 descargas y 0 *likes*, sin resultados de evaluación publicados y con licencia no especificada, por lo que su valor es principalmente didáctico y experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión nativa) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Tipo de robot | `aloha` |
| Camaras | `top` (una camara) |
| Entrada visual | `observation.images.top`, tensor `(3, 480, 640)` |
| Entrada de estado | `observation.state`, vector `(14,)` |
| Salida de accion | `action`, vector `(14,)` |
| Dataset de entrenamiento | `lerobot/aloha_sim_transfer_cube_human` |
| Episodios / frames | 50 episodios / 20.000 frames a 50 FPS |
| Pasos de entrenamiento | 1.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.7.1 |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (procesa la imagen de la cámara `top` a resolución 480x640) con un transformer que predice *chunks* de acciones de forma condicionada al estado articular de 14 dimensiones del robot ALOHA. En lugar de emitir una acción por paso, el modelo genera una secuencia corta de acciones futuras, lo que mitiga el problema de la deriva acumulada en tareas de manipulación de horizonte largo. La salida es un vector de acción de 14 dimensiones que corresponde a las articulaciones del robot bimanual.

El entrenamiento se realizó sobre el dataset `lerobot/aloha_sim_transfer_cube_human`, compuesto por 50 episodios teleoperados (20.000 frames a 50 FPS) de la tarea de recoger un cubo con el brazo derecho y transferirlo al izquierdo. La configuración es deliberadamente ligera: 1.000 pasos de entrenamiento, batch size 8, AdamW con learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni ningún proceso de ajuste posterior; es aprendizaje supervisado puro sobre demostraciones. No se especifica el número total de tokens ni la composición ampliada del dataset más allá de los datos indicados.

## Capacidades

- Control de manipulación bimanual: genera comandos de acción de 14 dimensiones para el robot ALOHA.
- Percepción visual mono-cámara: procesa una imagen RGB de 480x640 como única entrada visual.
- Condicionamiento por estado propioceptivo: utiliza el vector de estado articular de 14 dimensiones.
- Predicción de *chunks* de acciones: emite secuencias cortas de acciones para estabilizar la ejecución.
- Aprendizaje por imitación: reproduce la tarea aprendida de las demostraciones teleoperadas.
- Ejecución en simulación: entrenado sobre datos de ALOHA simulado.
- No soporta *tool calling*, *function calling*, agentes multi-paso, razonamiento textual ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de *thinking mode*, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de la tarea de transferencia de cubo en simulación: el modelo ejecuta la política entrenada sobre el robot ALOHA simulado mediante `lerobot-rollout`, sirviendo como referencia de funcionamiento del *pipeline* completo.
- Docencia y formación en aprendizaje por imitación: permite a estudiantes inspeccionar una política ACT real, sus entradas/salidas y su configuración de entrenamiento sin necesidad de entrenar desde cero.
- Punto de partida para *fine-tuning*: al estar en formato LeRobot y safetensors, puede reentrenarse con `lerobot-train` sobre un dataset propio del mismo tipo de robot y tarea.
- Validación de *pipelines* de despliegue: útil para probar la integración de `lerobot-rollout`, la configuración de cámaras OpenCV y la conexión con el robot ALOHA antes de invertir en entrenamientos largos.
- Experimentación con variantes de ACT: sirve como línea base para comparar cambios en resolución de imagen, número de cámaras o tamaño de *chunk* de acciones.
- Pruebas de robustez en simulación: permite evaluar cómo se degrada la política ante cambios de posición del cubo, iluminación o distracciones, aunque el autor no haya publicado dicha evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación con la nota explícita: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,7 M de parámetros; en fp32 ocupa aproximadamente 0,2 GB de pesos, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, incluyendo GTX 1650, RTX 3050, RTX 4060 o superiores.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; no se requiere A100 ni H100. Una RTX 4090 o A100 solo aportarían margen para procesar el codificador visual a mayor *batch* o para reentrenamiento.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con backend PyTorch/CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. La política opera a 50 FPS en el dataset de entrenamiento, pero no se publican mediciones de latencia de inferencia ni de throughput en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sadafnezam/aloha_sim_transfer_cube_policy0` | 51,7 M | ACT (LeRobot) | Imagen 480x640 + estado (14,) | no disponible | Hub HF, 0 descargas |
| Políticas ACT de referencia en LeRobot | no disponible | ACT | Configuración variable | Apache-2.0 (LeRobot) | Hub HF / docs |
| Políticas Diffusion Policy (LeRobot) | no disponible | Diffusion Policy | Configuración variable | Apache-2.0 (LeRobot) | Hub HF / docs |
| Políticas pi0 / VLA (LeRobot) | no disponible | VLA | Configuración variable | según modelo | Hub HF |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a categoría, formato y disponibilidad.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay tasa de éxito publicada, ni en simulación ni en robot real, por lo que se desconoce su fiabilidad.
- Entrenamiento muy corto: 1.000 pasos con batch 8 es una configuración mínima; es probable que la política esté infraentrenada y no generalice.
- Dominio restringido: entrenada exclusivamente para una tarea (transferir un cubo) en un robot ALOHA simulado con una sola cámara `top`.
- Sin licencia declarada: la model card indica "[More Information Needed]"; no se puede asumir uso comercial permitido.
- Sin datos de sesgos: no aplica el concepto habitual de sesgo lingüístico, pero la política hereda los sesgos de las 50 demostraciones teleoperadas (posiciones, velocidades y estilo del operador).
- Riesgo de fallo silencioso: al no haber evaluación, no se conocen los modos de fallo (caída del cubo, colisiones, deriva articular).
- Dependencia de la simulación: no hay evidencia de transferencia *sim-to-real*.
- Madurez: 0 descargas y 0 *likes*; creado y actualizado en el mismo instante, sin historial de mantenimiento.
- Reproducibilidad: requiere LeRobot 0.7.1 y correspondencia exacta de nombres de cámara con las claves de observación del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sadafnezam/aloha_sim_transfer_cube_policy0
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/aloha_sim_transfer_cube_human
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/aloha_sim_transfer_cube_human
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/*rollout*: https://huggingface.co/docs/lerobot/main/en/inference

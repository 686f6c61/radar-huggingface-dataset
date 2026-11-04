# hyelyn78/act_so101_pnp

## Resumen

`hyelyn78/act_so101_pnp` es una política de aprendizaje por imitación entrenada con el método Action Chunking with Transformers (ACT) y publicada en el Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que, a partir del estado articular de un brazo robótico SO-101 y de dos cámaras (superior y de muñeca), predice comandos de acción de 6 dimensiones para ejecutar una tarea de pick-and-place. El autor es el usuario `hyelyn78` y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

El modelo resuelve una tarea concreta y única: "Pick the block and place it in the box" (coger el bloque y colocarlo en la caja). Se entrenó con 50 episodios de teleoperación (17.992 fotogramas a 30 FPS) recogidos sobre el robot `so_follower` y almacenados en el dataset `hyelyn78/so101_pnp`. Su relevancia es acotada: sirve como ejemplo reproducible de un pipeline completo de imitación con LeRobot, no como modelo generalista.

La arquitectura subyacente es ACT, un transformer que predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza el control. El checkpoint contiene 51.668.614 parámetros en formato safetensors y ocupa 0,2 GB en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la política) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.6.2 |
| Tipo de robot | so_follower (SO-101) |
| Camaras | top, wrist (3x480x640 cada una) |
| Entrada de estado | observation.state, forma (6,) |
| Salida de accion | action, forma (6,) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (procesa las dos imágenes de 480x640) con un transformer que genera secuencias de acciones (chunks) en lugar de un único paso. Esta predicción por trozos mitiga el sesgo de acumulación típico de las políticas paso a paso y produce movimientos más suaves. La entrada combina el estado articular de 6 dimensiones con las observaciones visuales de las cámaras `top` y `wrist`; la salida es un vector de acción de 6 dimensiones por paso.

El entrenamiento se realizó con LeRobot 0.6.2 durante 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000, sobre 50 episodios (17.992 fotogramas a 30 FPS) del dataset `hyelyn78/so101_pnp`. No se documenta composición del dataset más allá de la tarea única, ni uso de RLHF/DPO (no aplica en este dominio). Tampoco se especifican aumentos de datos ni innovaciones adicionales más allá del propio esquema de action chunking del paper de ACT.

## Capacidades

- Control visomotor de un brazo SO-101 para una tarea de pick-and-place.
- Predicción de acciones de 6 dimensiones a partir de estado articular y dos vistas de cámara.
- Ejecución de políticas de imitación en tiempo real a 30 FPS (frecuencia del dataset de entrenamiento).
- Integración con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling ni agentes multi-paso.
- No tiene capacidades multilingües, de generación de texto, código, matemáticas, visión general, audio ni modo thinking.
- Específica para el robot `so_follower` y para la tarea "Pick the block and place it in the box".

## Casos de uso

- Demostración reproducible de imitación con LeRobot: sirve para validar la instalación, el cableado y la calibración de un SO-101 antes de entrenar políticas propias, ejecutando `lerobot-rollout` con el checkpoint publicado.
- Punto de partida para fine-tuning: el checkpoint puede reutilizarse como inicialización para tareas de manipulación similares (otro objeto, otra caja) recogiendo nuevos episodios y relanzando `lerobot-train` con `--policy.type=act`.
- Benchmark interno de infraestructura: al tener una tarea fija y un dataset pequeño (50 episodios), permite medir latencia de inferencia, throughput de cámaras y estabilidad del lazo de control en un banco de pruebas.
- Docencia y formación: ejemplo completo de pipeline teleoperación → dataset → entrenamiento → despliegue, útil en cursos de robótica de imitación.
- Pruebas de integración de hardware: verificar cámaras `top` y `wrist`, puerto del robot y frecuencia de 30 FPS en un montaje SO-101 antes de invertir en datasets mayores.
- Comparación de métodos: línea base ACT frente a otras políticas de LeRobot (p. ej. diffusion policy) sobre la misma tarea y dataset, para evaluar tasa de éxito y suavidad de trayectorias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación vacía y declara explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos safetensors de 0,2 GB, el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer reciente (RTX 3060 o superior) e incluso en CPU para inferencia, aunque la latencia del lazo de control a 30 FPS condiciona la elección.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090, A100 o H100 están sobradamente capacitadas. Para despliegue en robot, una GPU de gama media es suficiente.
- Cabe en GPU consumer: sí, por tamaño de parámetros; la restricción real es la latencia del pipeline de visión (dos cámaras a 480x640 y 30 FPS).
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El autor no publica medidas; el dataset está a 30 FPS, lo que marca la frecuencia objetivo del lazo de control.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hyelyn78/act_so101_pnp | 51,7 M | no aplica | Pick-and-place SO-101 | no disponible | HuggingFace (0 descargas) |
| Políticas ACT de LeRobot (referencia) | ~51 M (típico) | no aplica | Manipulación genérica | según checkpoint | Hub de LeRobot |
| Diffusion Policy (referencia LeRobot) | no disponible | no aplica | Manipulación genérica | según checkpoint | Hub de LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, tarea y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 50 episodios de un único operador y montaje, la política hereda sesgos de posición, iluminación y objetos de ese dataset.
- Riesgo de alucinación: no aplica en el sentido de lenguaje, pero sí existe riesgo de acciones erróneas fuera de distribución (objetos, posiciones o iluminación distintos a los del entrenamiento).
- Limitaciones de contexto o idioma: no aplica idioma; la política está acotada a la tarea "Pick the block and place it in the box" y al robot `so_follower` con cámaras `top` y `wrist`.
- Restricciones de licencia: la licencia no está disponible ("More Information Needed"), por lo que no se puede confirmar el uso comercial; conviene contactar con el autor antes de utilizarla en producción.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, lo que impide estimar su fiabilidad.
- Repositorio sin tracción: 0 descargas y 0 likes; no hay evidencia de validación por terceros.
- Dependencia de hardware y calibración: requiere el puerto del robot y los índices de cámara correctos, y que los nombres de cámara coincidan con las claves de observación del entrenamiento.
- Mantenimiento incierto: creado y actualizado el mismo día (2026-11-04), sin historial posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hyelyn78/act_so101_pnp
- Dataset de entrenamiento: https://huggingface.co/datasets/hyelyn78/so101_pnp
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hyelyn78/so101_pnp
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference

# anschrur/act_record_test_2

## Resumen

`anschrur/act_record_test_2` es una política de imitación (policy) para robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en Hugging Face mediante el framework LeRobot. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado de un brazo robótico de 6 grados de libertad y una imagen de cámara frontal de 480x640, y devuelve directamente un vector de acción de 6 dimensiones. El autor es el usuario `anschrur` y la licencia es Apache 2.0.

El modelo resuelve una tarea concreta de manipulación: "Grab the yellow cube" (agarrar el cubo amarillo). Se entrenó por imitación a partir de 50 episodios teleoperados, con 17.343 fotogramas a 30 FPS, sobre un robot de tipo `so_follower` (brazo SO-100 en configuración follower) con una única cámara llamada `front`. El checkpoint tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras ejecutables en hardware de consumo.

Su relevancia es acotada y de tipo práctico: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot (grabación de datos, entrenamiento con ACT, despliegue en robot real), y como referencia para validar la cadena de herramientas. La model card indica explícitamente que no se han aportado resultados de evaluación en robot real, por lo que no debe considerarse una política validada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con CVAE para imitación robótica; backbone visual no especificado en la model card |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: consume una observación por paso (imagen 3x480x640 + estado de 6 dimensiones) y predice un chunk de acciones. No hay ventana de contexto de texto |
| Tipos de cuantización | No disponible. El repositorio publica pesos en safetensors; no se documentan versiones cuantizadas |
| Idiomas soportados | No aplica. La tarea se especifica con una cadena de texto fija ("Grab the yellow cube"); el modelo no procesa lenguaje natural de forma general |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería: lerobot) |

Datos adicionales de entrada y salida:

| Feature | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | (6,) |
| `observation.images.front` | VISUAL | (3, 480, 640) |
| `action` | ACTION | (6,) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación descrito en el paper arXiv:2304.13705, que predice chunks de acciones (varios pasos de control de una sola vez) en lugar de una acción por inferencia. El planteamiento habitual del método combina un codificador visual convolucional para las observaciones de cámara con un transformer condicionado por un espacio latente de tipo CVAE, entrenado con una pérdida de reconstrucción de acciones más un término de regularización KL sobre dicho latente. La model card de este repositorio no detalla la configuración del backbone visual ni la profundidad del transformer, por lo que esos datos concretos figuran como no disponibles.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `anschrur/record-test-2_20260915_171009`: 50 episodios, 17.343 fotogramas, 30 FPS, una única tarea. La configuración registrada es de 90.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de ajuste por refuerzo, algo coherente con un pipeline de imitación supervisada. Tampoco se especifica el número de tokens ni la composición del dataset más allá de la tarea y las estadísticas de episodios y fotogramas.

## Capacidades

- Control visomotor de manipulación: genera comandos de acción de 6 dimensiones para un brazo `so_follower` a partir de una imagen frontal y del estado articular actual.
- Predicción de chunks de acciones, lo que reduce la frecuencia de inferencia necesaria frente a políticas que emiten una acción por paso.
- Ejecución de una tarea concreta de agarre ("Grab the yellow cube") aprendida por imitación de demostraciones teleoperadas.
- No dispone de tool calling ni de function calling: no es un modelo de lenguaje ni un agente basado en texto.
- No dispone de razonamiento multi-paso simbólico, ni de capacidades de código, matemáticas, visión general o audio.
- Multilingüismo: no aplica; la condicionalidad textual se limita a la cadena de tarea usada en el entrenamiento.
- No se documenta modo "thinking", ni razonamiento explícito, ni capacidades de generalización a nuevas tareas.

## Casos de uso

- Reproducción de un pipeline de imitación de referencia: sirve para validar de principio a fin el flujo de LeRobot (grabación con `lerobot-record`, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) antes de invertir en datasets mayores.
- Banco de pruebas de hardware robótico: al ser una política de 51,7 M de parámetros (0,2 GB), permite comprobar calibración de brazos SO-100, teleoperadores y cámaras sin requerir GPU de gama alta.
- Tarea de pick-and-place de un objeto concreto: agarre de un cubo amarillo en un entorno controlado, siempre que las condiciones de iluminación, posición y cámara sean similares a las del dataset de entrenamiento.
- Docencia y formación en robótica de imitación: ejemplo autocontenido para explicar ACT, el formateo de observaciones/acciones y el registro de demostraciones teleoperadas.
- Base para experimentos de comparación de políticas: punto de partida para medir ACT frente a otras políticas (Diffusion Policy, VQ-BeT) sobre el mismo dataset y el mismo robot.
- Reentrenamiento sobre datos propios: el repositorio incluye el comando `lerobot-train` con `--policy.type=act`, lo que permite sustituir el dataset y reutilizar la receta de hiperparámetros publicada.
- Pruebas de integración continua para código de robótica: el modelo es lo bastante pequeño para incluirlo en tests automatizados que verifiquen que una política carga, recibe observaciones con las formas correctas y emite acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card incluye una sección de evaluación explícitamente vacía, con la indicación de que todavía no se han aportado resultados de evaluación para esta política (`No evaluation results have been provided for this policy yet`). No existen, por tanto, tasas de éxito, número de ensayos ni datos de generalización a nuevas posiciones de objeto, iluminación o distractores.

## Requisitos de hardware

Las cifras de VRAM son estimaciones orientativas derivadas del número de parámetros publicado, no datos medidos ni documentados por el autor.

- Pesos en precisión de entrenamiento (fp32): 51.668.614 x 4 bytes ≈ 206,7 MB, coherente con el tamaño de repositorio de 0,2 GB.
- Pesos en fp16/bf16, si se convierten: ≈ 103 MB.
- VRAM total estimada para inferencia: del orden de 1 a 3 GB, sumando pesos, activaciones de una imagen de 480x640 y el overhead de CUDA. Cabe holgadamente en cualquier GPU de consumo con 4 GB o más (GTX 1650, RTX 3050, RTX 3060, RTX 4090).
- Ejecución en CPU: plausible por el reducido tamaño del modelo, aunque no se documenta latencia ni frecuencia de control alcanzable. El bucle de control objetivo del dataset es de 30 FPS, por lo que en CPU habría que verificar experimentalmente si se sostiene esa frecuencia.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento, con PyTorch y `--policy.device=cuda`. No aplican vLLM, TGI, llama.cpp ni Ollama, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponible. La model card no publica tiempos de inferencia ni frecuencia efectiva de control.

## Comparativa con modelos similares

No se ha proporcionado información comparativa con otras políticas, y la model card no incluye benchmarks frente a alternativas. La única comparación posible es de categoría, no de rendimiento.

| Modelo | Tipo | Parámetros | Licencia | Datos comparativos |
|---|---|---|---|---|
| act_record_test_2 (este modelo) | ACT, imitación con chunks de acciones | 51.668.614 | Apache 2.0 | No hay benchmarks publicados |
| Diffusion Policy | Política de imitación basada en modelos de difusión | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible |
| VQ-BeT | Política de imitación con discretización de acciones | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible |
| Políticas VLA tipo pi0 o SmolVLA | Visión-lenguaje-acción | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible |

No es posible establecer una comparación cuantitativa de parámetros, contexto, rendimiento o licencia con alternativas a partir de la información disponible.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card declara que no hay resultados de evaluación, por lo que se desconoce la tasa de éxito real de la política.
- Especialización extrema: entrenada para una sola tarea ("Grab the yellow cube") sobre un único tipo de robot (`so_follower`) y una única cámara (`front`). No hay evidencia de generalización a otros objetos, tareas o morfologías.
- Dependencia del montaje físico: los nombres de cámara deben coincidir exactamente con las claves de observación usadas en el entrenamiento (`observation.images.front`), y las dimensiones de imagen deben ser 480x640. Cualquier cambio de resolución, encuadre o calibración puede degradar el comportamiento.
- Sensibilidad a condiciones visuales: al ser una política de imitación pura sin evaluación publicada, es esperable una caída de rendimiento ante cambios de iluminación, fondo, posición del objeto o presencia de distractores. No se ha medido.
- Riesgo de sobreajuste y de sesgos derivados de las demostraciones: 50 episodios y 17.343 fotogramas son un volumen reducido, y el dataset proviene del estilo de teleoperación de un único operador. El modelo reproduce los sesgos y las estrategias de esa persona.
- Riesgo de fallo silencioso en producción: una política de imitación puede emitir acciones plausibles pero incorrectas (análogo a la alucinación), sin ninguna señal de incertidumbre calibrada. Se recomienda limitar el par de fuerzas del robot y usar paradas de emergencia.
- Ausencia de verificación de calidad: 0 descargas y 0 likes, con repositorio creado y actualizado el mismo día. No hay indicios de revisión por terceros.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se cite correctamente. No se imponen restricciones adicionales conocidas.
- Atribución obligatoria: la propia model card solicita citar el método ACT y el framework LeRobot si se utiliza la política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anschrur/act_record_test_2
- Dataset de entrenamiento: https://huggingface.co/datasets/anschrur/record-test-2_20260915_171009
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=anschrur/record-test-2_20260915_171009
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 (también en https://arxiv.org/abs/2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web asociada no devolvió resultados relevantes sobre este modelo ni sobre ACT. Todos los enlaces anteriores proceden de la model card y de los metadatos del repositorio.

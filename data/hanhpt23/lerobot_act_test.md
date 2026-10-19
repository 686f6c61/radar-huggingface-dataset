# Hanhpt23/lerobot_act_test

## Resumen

`Hanhpt23/lerobot_act_test` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers) entrenada con la librería LeRobot de Hugging Face y publicada en el Hub. No es un modelo de lenguaje: es un controlador visuomotor que, a partir del estado de las articulaciones de un brazo robótico SO-101 y de dos cámaras (una fija y otra montada en la mano), emite comandos de acción de 6 dimensiones. El problema que resuelve es el control fino de manipulación a partir de demostraciones teleoperadas, sin necesidad de modelar el entorno ni de definir recompensas.

El checkpoint tiene 51.668.614 parámetros y ocupa 0,2 GB en el repositorio. Se entrenó durante 1000 pasos con batch de 8 sobre un único dataset de 10 episodios y 6631 fotogramas a 30 FPS, para una sola tarea: recoger una bola de papel arrugado y depositarla en una caja. Es, por tanto, una política de propósito muy acotado y de escala experimental, no un modelo generalista.

Su relevancia es práctica: sirve como referencia mínima reproducible del flujo completo de LeRobot (grabación de datos, entrenamiento ACT, despliegue con `lerobot-rollout`) sobre hardware de bajo coste. No hay resultados de evaluación publicados ni licencia declarada, lo que limita su uso directo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con encoder CVAE auxiliar y backbone visual convolucional; política de imitación, no generativa de texto |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; no hay ventana de contexto de tokens. El horizonte efectivo lo fija el chunking de acciones (valor no disponible en la información proporcionada) |
| Tipos de cuantización | no disponible; no se documentan variantes cuantizadas. Pesos publicados en safetensors |
| Idiomas soportados | no disponible; la tarea se especifica en inglés ("Pick up the crumpled paper ball and place it in the box") y no hay capacidades lingüísticas |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería `lerobot`) |

Datos adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.fixed` | VISUAL | `(3, 480, 640)` |
| `observation.images.handeye` | VISUAL | `(3, 480, 640)` |
| `action` | ACTION | `(6,)` |

## Arquitectura y entrenamiento

ACT es un método de *behavior cloning* que predice bloques (*chunks*) de acciones futuras en lugar de un único paso, lo que reduce el error de acumulación y la correlación temporal típica de los controladores paso a paso. La implementación de LeRobot combina un transformer encoder-decoder que consume los tokens de estado y de imagen con un encoder CVAE que solo se usa durante el entrenamiento para modelar la variabilidad de las demostraciones humanas; la pérdida combina reconstrucción L1 de las acciones con un término KL. El resultado es una política determinista en inferencia que mapea observaciones a secuencias de comandos articulares.

El entrenamiento se realizó sobre el dataset `Hanhpt23/record-test5`: 10 episodios, 6631 fotogramas a 30 FPS, una sola tarea, con robot `so101_follower` y dos cámaras (`fixed` y `handeye`). La configuración fue de 1000 pasos, batch de 8, optimizador AdamW, tasa de aprendizaje 1e-05, semilla 1000 y LeRobot 0.6.2. Conviene subrayar la escala: 1000 pasos × batch 8 equivalen a 8000 muestras procesadas, es decir, aproximadamente 1,2 pasadas sobre los 6631 fotogramas del dataset; se trata de un ajuste muy corto, coherente con una prueba de extremo a extremo más que con un entrenamiento convergido. No se documenta uso de RLHF, DPO ni datos adicionales.

## Capacidades

- Control visuomotor de manipulación: genera acciones de 6 grados de libertad para el brazo SO-101 a partir de dos vistas de cámara y del estado articular.
- Predicción por chunks: emite secuencias cortas de acciones en lugar de pasos aislados, lo que suaviza la ejecución.
- Ejecución de una única tarea aprendida: recoger una bola de papel arrugada y colocarla en una caja.
- Fusión de dos cámaras: vista fija de la escena y vista en la muñeca (*handeye*) para el ajuste fino del agarre.
- Aprendizaje por imitación sin recompensa: no requiere definición de función de recompensa ni simulación.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades de lenguaje, visión general, audio o modo *thinking*.
- No dispone de generalización a instrucciones en lenguaje natural: la tarea se selecciona al lanzar la política y está codificada en el entrenamiento.

## Casos de uso

- Reproducción del pipeline completo de LeRobot: sirve para validar de principio a fin el flujo `lerobot-train` → Hub → `lerobot-rollout` con un checkpoint ya publicado, sin tener que entrenar desde cero.
- Punto de partida para entrenar políticas propias: al ser un ACT de 51,7 M de parámetros, se puede reentrenar o afinar con un dataset propio de 10-50 episodios en una sola GPU consumer, usándolo como plantilla de configuración (`policy.type=act`).
- Docencia y formación en aprendizaje por imitación: su tamaño reducido y su entrenamiento corto permiten mostrar en clase el efecto de los hiperparámetros (pasos, batch, learning rate) sobre el comportamiento final de la política.
- *Baseline* de comparación metodológica: sirve como referencia mínima frente a Diffusion Policy, VQ-BeT o políticas más grandes en experimentos controlados sobre la misma tarea y el mismo robot.
- Pick-and-place de objetos deformables en laboratorio: la tarea de papel arrugado es representativa de objetos con geometría no rígida, donde la vista *handeye* aporta información crítica para el cierre del agarre.
- Prueba de integración de hardware y calibración: al exigir dos cámaras con nombres concretos (`fixed`, `handeye`) y resolución 640×480 a 30 FPS, el rollout funciona como verificación de que la instalación física, los índices de cámara y la calibración del SO-101 son correctos.
- *Smoke test* en CI de robótica: ejecuciones cortas con `--duration` acotado permiten comprobar que el entorno de inferencia (drivers, puerto serie, dependencias de LeRobot) está operativo antes de desplegar políticas más costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la línea "_No evaluation results have been provided for this policy yet_" y la tabla de evaluación real (tarea, ensayos, éxitos, tasa de éxito) está vacía. Tampoco hay métricas de pérdida de entrenamiento ni curvas publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación derivada del recuento de parámetros, no publicada por el autor): ~207 MB en FP32, ~103 MB en FP16/BF16 y ~52 MB en INT8 solo para los pesos. A ello hay que sumar las activaciones de dos imágenes de 480×640×3 por el backbone visual; en batch 1 el total se mantiene previsiblemente por debajo de 1-2 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más es suficiente. No se requiere A100 ni H100; una RTX 3060, RTX 4060 o RTX 4090 cubren la inferencia con holgura. Para despliegue embebido sobre el robot, una Jetson Orin es una opción plausible, aunque no hay cifras publicadas de latencia.
- Cabe en GPU consumer: sí, con amplio margen, al ser un modelo de 51,7 M de parámetros.
- CPU: viable en términos de memoria; no hay datos publicados de latencia que permitan confirmar el cumplimiento del ciclo de control a 30 FPS.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` es la vía documentada. No se documenta soporte de vLLM, TGI, llama.cpp u Ollama, que no aplican a una política robótica.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS y el comando de ejemplo usa cámaras a 30 FPS, pero no se publica el tiempo de inferencia por paso.

## Comparativa con modelos similares

La información proporcionada solo permite una comparación cualitativa a nivel de método dentro del ecosistema LeRobot; los datos de parámetros y licencias de las alternativas no están disponibles en las fuentes consultadas.

| Modelo | Parámetros | Contexto | Tipo de política | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (`Hanhpt23/lerobot_act_test`) | 51.668.614 | no aplica | Imitación con chunking de acciones | no disponible | Público en Hugging Face Hub |
| Diffusion Policy | no disponible | no aplica | Imitación generativa por difusión | no disponible | Disponible como tipo de política en LeRobot |
| VQ-BeT | no disponible | no aplica | Imitación con cuantización vectorial y transformer | no disponible | Disponible como tipo de política en LeRobot |
| π0 | no disponible | no aplica | Política fundacional visuomotor-lenguaje | no disponible | Disponible en LeRobot |

ACT se posiciona, según la documentación de LeRobot, como la opción recomendada para empezar: entrenamiento rápido y requisitos computacionales bajos. Diffusion Policy y VQ-BeT añaden capacidad expresiva a costa de más cómputo, y π0 apunta a generalización entre tareas con un coste muy superior. Este checkpoint concreto, no obstante, está entrenado para una sola tarea y no es comparable en rendimiento con políticas generalistas.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito medida en robot real, por lo que se desconoce si la política funciona de forma fiable.
- Entrenamiento muy corto: 1000 pasos con batch 8 equivalen a unas 1,2 pasadas sobre 6631 fotogramas; es esperable un ajuste insuficiente o un sobreajuste a las trayectorias de 10 episodios.
- Dataset mínimo: 10 episodios de una única tarea implican poca cobertura de posiciones iniciales, iluminación, distractores y variaciones del objeto. La generalización fuera de la distribución de demostración será muy limitada.
- Dependencia estricta del montaje: los nombres de cámara (`fixed`, `handeye`) deben coincidir con las claves de observación, y la política asume la cinemática y calibración del SO-101; un robot distinto o una cámara recolocada invalidan el controlador.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Riesgo de fallo silencioso: al carecer de mecanismo de detección de incertidumbre, la política emitirá acciones incluso ante escenas fuera de distribución, sin señal de error.
- Idiomas: no aplica, pero la tarea está descrita en inglés y no existe interfaz en lenguaje natural.
- Sesgos: los derivados del operador que teleoperó las 10 demostraciones y del entorno físico concreto de grabación; no hay análisis de sesgo publicado.
- Sin cifras de latencia: no se puede garantizar el cumplimiento del ciclo de control a 30 FPS en hardware distinto al usado en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hanhpt23/lerobot_act_test
- Dataset de entrenamiento: https://huggingface.co/datasets/Hanhpt23/record-test5
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Hanhpt23/record-test5
- Artículo ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de ACT en LeRobot: https://huggingface.co/docs/lerobot/act
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Código fuente de la documentación ACT en GitHub: https://github.com/huggingface/lerobot/blob/main/docs/source/act.mdx
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

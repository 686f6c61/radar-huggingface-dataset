# SoSolaris/xvla-b0910-1749-p06_freeze_vis

## Resumen

El modelo `SoSolaris/xvla-b0910-1749-p06_freeze_vis` es una política robótica de tipo Vision-Language-Action (VLA) entrenada mediante aprendizaje por imitación con la librería LeRobot de Hugging Face. Se trata de un ajuste fino del modelo base `lerobot/xvla-base`, que implementa el marco X-VLA: una arquitectura de flow matching con soft prompts aprendibles que trata cada configuración de robot o hardware como una "tarea" codificada mediante un pequeño conjunto de embeddings, lo que permite a un único modelo reconciliar morfologías, sensores y espacios de acción diversos.

El modelo está especializado en una única tarea de manipulación: "Grab the sock and put it in the box" (coger el calcetín y meterlo en la caja), ejecutada sobre un robot `so100_follower` con dos cámaras (`front` y `up`). Consume observaciones visuales y de estado y produce un vector de acción de 6 dimensiones, con 879.687.256 parámetros totales (aproximadamente 880 millones) y pesos en formato safetensors.

Su relevancia es principalmente práctica y de investigación: sirve como ejemplo reproducible de cómo ajustar una política VLA preentrenada sobre un dataset propio pequeño (20 episodios, 7188 fotogramas a 30 FPS) y desplegarla en hardware accesible como el SO-100. No se han publicado resultados de evaluación ni de benchmarks para esta política concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con soft prompts y flow matching (X-VLA); detalle interno no disponible |
| Parametros totales | 879.687.256 (~880 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so100_follower` |
| Camaras | `front`, `up` (mas una tercera entrada visual documentada en la tabla de entradas) |
| Salida de accion | vector de 6 dimensiones |
| Tamano del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

X-VLA es un marco VLA basado en flow matching y condicionado por soft prompts. La idea central es que cada robot o configuración de hardware se modela como una "tarea" distinta, codificada con un conjunto reducido de embeddings de Soft Prompt aprendibles. Esto permite que un mismo modelo preentrenado se adapte a morfologías, sensores y espacios de acción heterogéneos sin duplicar la arquitectura. Sobre esta base, la política aquí presentada se ha ajustado para un robot SO-100 concreto, tomando como entradas dos imágenes de 256×256, una tercera imagen de 224×224 y un vector de estado de 8 dimensiones, y emitiendo una acción de 6 dimensiones.

El ajuste fino se realizó con LeRobot 0.6.2 sobre el dataset `SoSolaris/socks_20_diversified`: 20 episodios, 7188 fotogramas a 30 FPS, con la tarea única "Grab the sock and put it in the box". La configuración de entrenamiento fue de 5000 pasos, batch size 32, optimizador `xvla-adamw`, learning rate 0.0001 y semilla 1000. No se documenta el uso de RLHF, DPO ni decodificación especulativa en la información disponible.

## Capacidades

- Generación de acciones de control robótico (imitación) a partir de observaciones multimodales de imagen y estado.
- Percepción visual multi-cámara: procesa simultáneamente dos vistas de 256×256 y una tercera de 224×224.
- Ejecución de la tarea concreta de recoger un calcetín y depositarlo en una caja sobre un robot `so100_follower`.
- Condicionamiento por instrucción de tarea en lenguaje natural (el campo `task` se pasa en la ejecución).
- Adaptación mediante soft prompts a una configuración específica de robot (dos cámaras denominadas `front` y `up`).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo "thinking", visión general, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Recogida y colocación de objetos (pick-and-place) en robótica de manipulación: la política traduce observaciones visuales y de estado directamente en comandos de acción de 6 grados de libertad, adecuada para tareas repetitivas de coger y depositar sobre una superficie de trabajo.
- Automatización de tareas de clasificación en almacén ligero: con un SO-100 y dos cámaras se puede recoger un objeto y colocarlo en un contenedor, patrón reutilizable para separar piezas por tipo si se reentrena con el objeto objetivo.
- Investigación en modelos VLA y soft prompts: sirve como punto de partida reproducible para estudiar cómo los embeddings de Soft Prompt adaptan un modelo base a una morfología concreta, gracias a que el ajuste parte de `lerobot/xvla-base`.
- Reentrenamiento rápido para nuevos objetos o tareas: el dataset de origen es pequeño (20 episodios), lo que indica un coste de ajuste bajo y permite generar datasets propios y reajustar la política con el mismo flujo de LeRobot.
- Manipulación de tejidos blandos o ropa en entornos domésticos: la tarea de manipular un calcetín requiere tratar con objetos deformables, un escenario poco cubierto por políticas rígidas y útil como banco de pruebas.
- Docencia y formación en robótica de imitación: el repositorio incluye comandos de despliegue y entrenamiento (`lerobot-rollout` y `lerobot-train`), lo que facilita usarlo como ejemplo didáctico de extremo a extremo.
- Evaluación comparativa de políticas de imitación: permite medir éxito real en el mundo físico frente a otras políticas LeRobot sobre el mismo robot y tarea, aunque esta ficha no incluye resultados de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que todavía no se han proporcionado resultados de evaluación para esta política. Tampoco se han facilitado métricas de éxito en robot, latencia ni throughput.

## Requisitos de hardware

Las estimaciones de memoria se derivan del recuento de parámetros (879.687.256) y deben considerarse aproximadas, ya que el autor no publica requisitos.

- VRAM estimada para inferencia (solo pesos):
  - fp32: aproximadamente 3,5 GB.
  - bf16/fp16: aproximadamente 1,8 GB.
  - int8: aproximadamente 0,9 GB.
  - int4: aproximadamente 0,5 GB.
- A estas cifras hay que sumar el coste de activaciones y de los codificadores visuales, por lo que se recomienda reservar margen adicional.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente para la inferencia en precisión reducida; no se requiere A100 ni H100 para esta política concreta dado su tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas tipo RTX 3060/4060 con 12 GB o superiores, e incluso en configuraciones con 8 GB si se usa cuantización, siempre según disponibilidad real de estos formatos en LeRobot.
- Opciones de despliegue: el soporte documentado es la librería LeRobot (comandos `lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a políticas de control.
- Latencia y throughput: no disponibles. La política está pensada para control en tiempo real y el dataset de entrenamiento se grabó a 30 FPS, pero no se confirma que la inferencia alcance esa frecuencia en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SoSolaris/xvla-b0910-1749-p06_freeze_vis` | ~880 M | no disponible | sin resultados publicados | Apache 2.0 | Hugging Face (LeRobot) |
| `lerobot/xvla-base` (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otras politicas VLA de la familia LeRobot | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de otros modelos comparables (por ejemplo, políticas VLA de tamaño similar) en la información proporcionada, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Especialización extrema: la política está ajustada para una única tarea ("Grab the sock and put it in the box") sobre un robot `so100_follower` concreto; no es un modelo de propósito general.
- Dataset muy reducido: 20 episodios y 7188 fotogramas, lo que aumenta el riesgo de sobreajuste y de mala generalización a posiciones, iluminación, fondos u objetos distintos.
- Dependencia del hardware: las cámaras deben coincidir con los nombres y claves de observación del entrenamiento; un cambio de montaje o de índice de cámara puede degradar el comportamiento.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en condiciones controladas, por lo que no se puede garantizar su fiabilidad en producción.
- Riesgo de acciones inseguras: al ser una política de control físico, los errores pueden provocar colisiones, caídas de objetos o daños en el entorno; se recomienda supervisión y límites de seguridad a nivel de controlador.
- Idioma y capacidades lingüísticas: no disponibles; el condicionamiento por lenguaje se limita a la instrucción de tarea usada en el entrenamiento.
- Licencia: Apache 2.0, que permite uso comercial, pero el usuario debe verificar las licencias del modelo base `lerobot/xvla-base` y del dataset asociado.
- Sesgos conocidos: no disponibles; no se documenta ningún análisis de sesgos.
- Fechas del repositorio: la model card figura creada el 2026-09-10, fecha futura respecto a la información habitual, dato a tener en cuenta al citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SoSolaris/xvla-b0910-1749-p06_freeze_vis
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/SoSolaris/socks_20_diversified
- Paper de X-VLA: https://huggingface.co/papers/2510.10274 (arXiv:2510.10274)
- Guía LeRobot xvla: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SoSolaris/socks_20_diversified
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference

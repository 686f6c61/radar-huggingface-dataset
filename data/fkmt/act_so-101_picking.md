# fkmt/act_so-101_picking

## Resumen

`fkmt/act_so-101_picking` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers) entrenada con LeRobot para el brazo robótico de bajo coste SO-101 (variante `so_follower`). No es un modelo de lenguaje: es un modelo visuomotor que consume el estado de las articulaciones (vector de 6 dimensiones) y dos cámaras (`top` a 240x320 y `wrist` a 480x640) y emite comandos de acción de 6 dimensiones. El problema que resuelve es la ejecución autónoma de una tarea de manipulación concreta —la instrucción declarada es "Pick a pooley"— a partir de 10 episodios de teleoperación.

El modelo lo publica el usuario `fkmt` en Hugging Face con licencia Apache 2.0 y un total de 51.668.614 parámetros (unos 51,7 M), lo que lo sitúa en el rango de políticas ligeras que se ejecutan en tiempo real sobre hardware de consumo. El repositorio ocupa 0,4 GB e incluye los pesos en formato safetensors junto con la configuración de entrenamiento de LeRobot 0.6.1.

Su relevancia es práctica más que de investigación: sirve como ejemplo reproducible del flujo completo de LeRobot (grabación de dataset, entrenamiento ACT y despliegue con `lerobot-rollout`) sobre un robot de bajo coste, y como punto de partida para quien quiera replicar la metodología con sus propios datos. Conviene subrayar que el autor no ha publicado ninguna evaluación en robot real y que el entrenamiento se limita a 1000 pasos sobre 3734 frames, por lo que su valor como política lista para producción es muy limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con CVAE, encoder visual ResNet y decoder de trozos de acción (action chunks) |
| Parametros totales | 51.668.614 (51,7 M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable: no hay ventana de contexto; consume la observación actual (estado de 6 dimensiones + dos imágenes) y predice un chunk de acciones |
| Tipos de cuantizacion | no disponible; pesos publicados en precisión completa (safetensors). No se han publicado variantes GGUF, INT8 ni FP16 |
| Idiomas soportados | no disponible / no aplicable: política visuomotora; la tarea se especifica con la cadena de texto "Pick a pooley" en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,4 GB, librería `lerobot`) |

Especificaciones de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | (6,) |
| `observation.images.top` | VISUAL | (3, 240, 320) |
| `observation.images.wrist` | VISUAL | (3, 480, 640) |
| `action` | ACTION | (6,) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers, paper arXiv:2304.13705) es un método de aprendizaje por imitación que, en lugar de predecir una acción por paso, predice un trozo de varias acciones futuras de una sola vez. Esto reduce el error de acumulación y suaviza la ejecución. La arquitectura combina un codificador condicional variacional (CVAE) que modela la variabilidad de las demostraciones humanas, un backbone transformer que fusiona las características visuales de las dos cámaras con el estado de las articulaciones, y un decodificador que emite el chunk de acciones. La política está implementada y entrenada con LeRobot 0.6.1.

Los datos de entrenamiento provienen del dataset `fkmt/so-101_picking_ds_20261027_101214`: 10 episodios, 3734 frames a 30 FPS, con la tarea etiquetada como "Pick a pooley". La configuración de entrenamiento publicada es de 1000 pasos, batch de 12, optimizador AdamW, learning rate 1e-5 y semilla 1000. No hay información sobre aumentos de datos, composición exacta del dataset más allá del número de episodios, ni sobre un pipeline de RLHF/DPO (no aplicable en este dominio). Tampoco se documenta ninguna innovación técnica adicional sobre el ACT canónico.

## Capacidades

- Manipulación visuomotora de un brazo SO-101 (`so_follower`) con 6 grados de libertad de acción.
- Percepción multimodal pasiva: una cámara cenital (`top`, 240x320) y una cámara en la muñeca (`wrist`, 480x640).
- Predicción de chunks de acción, lo que permite movimientos más suaves y menor deriva que una política paso a paso.
- Ejecución de una única tarea: "Pick a pooley" (recogida de un objeto alargado), condicionada por la cadena de texto de la tarea.
- Integración directa con el ecosistema LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, generación de texto, visión general, audio ni modo "thinking". No es un modelo de lenguaje y no tiene capacidades multilingües ni de diálogo.

## Casos de uso

- Recogida automatizada de objetos alargados en una célula de laboratorio: el modelo ejecuta la tarea "Pick a pooley" sobre un SO-101, usando las dos cámaras para localizar el objeto y la pinza, con un coste de cómputo de 51,7 M de parámetros que permite inferencia en tiempo real a 30 FPS.
- Base de partida para reentrenamiento con datos propios: el repo incluye la configuración exacta (AdamW, lr 1e-5, batch 12, 1000 pasos) y el comando `lerobot-train`, lo que permite sustituir el dataset por uno propio manteniendo la receta.
- Docencia y formación en aprendizaje por imitación: es un ejemplo completo y ligero de pipeline teleoperación → dataset → ACT → despliegue, adecuado para prácticas con hardware de bajo coste.
- Validación de pipelines sim-to-real: encaja con flujos como `so101-nexus` en MuJoCo, donde se puede probar la política en simulación antes de llevarla al brazo físico.
- Comparación de hiperparámetros y currículos de entrenamiento: al ser un modelo pequeño y con receta conocida, sirve como línea base para medir el efecto de más episodios, mayor número de pasos o cambios de resolución de cámara.
- Prototipado rápido de tareas pick-and-place en entornos educativos o de hacking: el despliegue se reduce a un comando `lerobot-rollout` con el puerto del robot y los índices de cámara.
- Generación de demostraciones para aumentar datasets: la política puede ejecutar la tarea de forma autónoma y las grabaciones resultantes (con `--strategy.type` distinto de `base`) alimentar un ciclo de recogida de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card está explícitamente vacía ("No evaluation results have been provided for this policy yet"), de modo que no existen tasas de éxito en robot real, número de ensayos ni condiciones de dificultad documentadas. Tampoco se aportan métricas de pérdida de entrenamiento ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los pesos (unos 207 MB solo de parámetros), más el coste de las activaciones de los dos encoders visuales y del transformer; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más (estimación basada en el recuento de parámetros, no en mediciones publicadas).
- Cabe en GPU de consumo: GTX 1650, RTX 3050, RTX 4060, RTX 4090, e incluso es viable en CPU para inferencia, aunque la latencia condiciona el control a 30 FPS.
- GPU de datacenter (A100, H100) no son necesarias para inferencia; solo tendrían sentido para reentrenar con datasets mucho mayores.
- Despliegue: `lerobot-rollout` (CLI de LeRobot) es la vía documentada. No hay soporte publicado para vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El único dato objetivo es que el dataset se grabó a 30 FPS y que el bucle de control debe sostener esa frecuencia; no se documenta el tiempo de inferencia por chunk.
- Almacenamiento: 0,4 GB de repositorio, trivial para cualquier equipo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fkmt/act_so-101_picking` | 51,7 M | Estado 6-dim + 2 cámaras (240x320 y 480x640) | Sin evaluación | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| `aiden-li/so101-act` | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| `Soulaimakhammari/model-so-101` | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| ACT original (paper 2304.13705) | no disponible en la información | no disponible | Resultados del paper, no reproducidos aquí | no disponible | Paper y código de referencia |

Los tres modelos locales comparten la misma plantilla de model card generada por LeRobot y la misma tarea de manipulación sobre SO-101, por lo que la comparación relevante es la calidad del dataset y de la evaluación, no la arquitectura. Ninguno de los comparables publica métricas, de modo que no es posible establecer un ranking objetivo.

## Limitaciones y advertencias

- Dataset mínimo: 10 episodios y 3734 frames (unos 124 segundos de grabación a 30 FPS) para una única tarea. El riesgo de sobreajuste es alto y la generalización a posiciones, iluminación u objetos distintos no está demostrada.
- Entrenamiento muy corto: 1000 pasos con batch 12 equivalen a unas 12.000 muestras vistas, órdenes de magnitud por debajo de lo habitual en ACT; es probable que la política esté infraentrenada.
- Sin evaluación: no hay tasa de éxito, ni número de ensayos, ni condiciones de dificultad. Cualquier uso en producción debe ir precedido de una evaluación propia.
- Especificidad de encarnación: está entrenada para `so_follower` con cámaras llamadas exactamente `top` y `wrist`. Cambiar nombres, índices, resolución o montaje de cámara invalida la política.
- Dependencia de la cadena de tarea: la instrucción "Pick a pooley" forma parte del condicionamiento; escribir otra tarea no convierte al modelo en un agente generalista.
- Sin capacidades lingüísticas: no genera texto, no razona, no responde preguntas; no debe evaluarse con benchmarks de lenguaje (MMLU, GSM8K, HumanEval) porque no aplican.
- Riesgo de fallo físico: al accionar un brazo real, los errores de la política pueden provocar colisiones, caídas de objetos o daños en la pinza. Se recomienda límites de par, parada de emergencia y pruebas en simulación previas.
- Sesgos: no documentados por el autor; el dataset refleja la cinemática y la estrategia de una única persona teleoperando, por lo que hereda sus sesgos de trayectoria.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y aviso de cambios, pero el autor no ofrece ninguna garantía ni soporte; la responsabilidad de seguridad recae en el integrador.
- Metadatos anómalos: las fechas de creación y actualización (2026-10-27) son posteriores a la fecha habitual de consulta y el dataset incluye una marca temporal en el nombre; conviene verificar la procedencia antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fkmt/act_so-101_picking
- Dataset de entrenamiento: https://huggingface.co/datasets/fkmt/so-101_picking_ds_20261027_101214
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fkmt/so-101_picking_ds_20261027_101214
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Modelo comparable `aiden-li/so101-act`: https://huggingface.co/aiden-li/so101-act
- Modelo comparable `Soulaimakhammari/model-so-101`: https://huggingface.co/Soulaimakhammari/model-so-101
- Ejemplo sim-to-real con SO-101 y ACT: https://github.com/aviadarn/so101-lerobot
- Guía de entrenamiento ACT con SO-101: https://github.com/omkarputti/SO101_ACT_Training
- Artículo sobre entrenamiento de ACT en SO-101: https://www.ay-robots.com/train/act-on-so-101

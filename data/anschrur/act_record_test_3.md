# anschrur/act_record_test_3

## Resumen

`anschrur/act_record_test_3` es una política de robótica basada en ACT (Action Chunking with Transformers), el método de aprendizaje por imitación descrito en el artículo arXiv 2304.13705. No es un modelo de lenguaje: es un controlador que, a partir de observaciones del estado del robot (vector de 6 dimensiones) y de una imagen de cámara frontal (3×480×640), predice fragmentos cortos de acciones (chunks) de 6 dimensiones en lugar de un único paso de control. El modelo lo publica el usuario `anschrur` y ha sido entrenado y subido al Hub con LeRobot (versión 0.6.1).

El checkpoint tiene 51.668.614 parámetros y ocupa 0,2 GB en el repositorio. Se ha entrenado sobre el dataset `anschrur/record-test_2`, compuesto por 200 episodios teleoperados y 86.867 fotogramas a 30 FPS con una única tarea: "Grab the yellow cube" sobre un robot de tipo `so_follower` con una cámara frontal. La configuración de entrenamiento fue de 100.000 pasos, batch de 8, optimizador AdamW y tasa de aprendizaje 1e-05.

Su relevancia es acotada y de tipo práctico: sirve como ejemplo reproducible del flujo completo de imitación en LeRobot (grabación de datos, entrenamiento y despliegue con `lerobot-rollout`) y como punto de partida para hacer fine-tuning con datos propios. Por el nombre del repositorio y del dataset ("test"), y por no incluir resultados de evaluación ni tener descargas o interacciones, debe considerarse un artefacto de prueba más que una política validada para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con CVAE para predicción de chunks de acciones; backbone visual no especificado en la model card |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el equivalente es el tamaño de chunk de acciones, no indicado en la model card) |
| Tipos de cuantización | no disponible (checkpoint en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (política robótica; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint de LeRobot) |
| Tipo de robot | `so_follower` |
| Cámaras | `front` (1 cámara) |
| Entrada: `observation.state` | STATE, forma `(6,)` |
| Entrada: `observation.images.front` | VISUAL, forma `(3, 480, 640)` |
| Salida: `action` | ACTION, forma `(6,)` |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-17 |
| Última actualización | 2026-09-17 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que sustituye la predicción paso a paso por la predicción de secuencias cortas de acciones (action chunks). La arquitectura combina un codificador de observaciones (imagen y estado del robot) con un transformer y un módulo CVAE que modela la variabilidad de las demostraciones humanas, de forma que la política no colapsa hacia la media de trayectorias distintas. Esta formulación reduce el error de compounding típico de las políticas de imitación que predicen una sola acción por paso. En este checkpoint concreto no se documentan ni el backbone visual, ni el número de capas, ni el tamaño de chunk, ni si se emplea ensamblado temporal en inferencia.

El entrenamiento se realizó con LeRobot 0.6.1 durante 100.000 pasos, con batch de 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. Los datos proceden de teleoperación sobre un `so_follower`: 200 episodios, 86.867 fotogramas a 30 FPS (aproximadamente 48 minutos de datos, unas 434 muestras por episodio) y una única tarea, "Grab the yellow cube". No se indica en la model card ningún proceso de RLHF, DPO ni ajuste posterior por refuerzo; es aprendizaje por imitación supervisado de principio a fin.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 dimensiones para un robot `so_follower` a partir de estado y una imagen frontal.
- Predicción de chunks de acciones en lugar de pasos individuales, lo que aporta suavidad temporal en el control.
- Fusión de entrada visual y propioceptiva: consume simultáneamente una imagen RGB de 480×640 y un vector de estado de 6 valores.
- Ejecución guiada por instrucción fija: el despliegue típico usa `--task="Grab the yellow cube"`, la tarea para la que fue entrenado.
- Integración con la CLI de LeRobot: `lerobot-rollout` para inferencia en robot real y `lerobot-train` para reentrenamiento o fine-tuning.
- Ejecución a 30 FPS en el bucle de control del robot (frecuencia a la que se grabaron los datos).
- Tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Modo thinking, visión general, audio o generación de texto: no aplica.

## Casos de uso

- Recogida de objetos en laboratorio: la política está entrenada específicamente para la tarea "Grab the yellow cube" sobre un `so_follower`; se desplegaría con `lerobot-rollout --policy.path=anschrur/act_record_test_3 --task="Grab the yellow cube"` durante una sesión acotada con `--duration`.
- Punto de partida para fine-tuning con datos propios: al ser un checkpoint ACT completo y ligero (51,7 M de parámetros), sirve como inicialización para reentrenar con un dataset propio de otro objeto o de otra posición de trabajo usando `lerobot-train --policy.type=act`.
- Validación de un pipeline de imitación de extremo a extremo: útil para comprobar la cadena completa de LeRobot 0.6.1 (calibración, cámaras, formato de dataset, entrenamiento y rollout) antes de invertir en una campaña de recogida de datos a gran escala.
- Docencia y prototipado en robótica: su tamaño reducido permite entrenar y ejecutar el modelo en hardware de gama media, lo que facilita demostraciones en asignaturas o talleres de aprendizaje por imitación.
- Prueba de configuraciones de cámara y estado: al recibir exactamente `(3, 480, 640)` y `(6,)`, permite verificar el cableado, la resolución y la calibración de un robot `so_follower` de referencia antes de escalar a políticas mayores.
- Estudio comparativo de ACT frente a otras políticas: sirve como referencia entrenada con 100.000 pasos y 200 episodios para comparar contra Diffusion Policy u otras alternativas de LeRobot bajo el mismo dataset y presupuesto de cómputo.
- Generación de trayectorias para análisis fuera de línea: ejecutar la política sobre fotogramas grabados del dataset permite inspeccionar la distribución de acciones predichas y detectar modos degenerados sin arriesgar hardware.
- Base para experimentos de generalización con una sola cámara: al depender únicamente de una vista frontal, es un banco de pruebas para medir la sensibilidad a cambios de iluminación, posición del objeto o fondo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks ni de evaluación en robot real en la información disponible. La propia model card indica: "_No evaluation results have been provided for this policy yet_". No se dispone de tasas de éxito, número de ensayos ni métricas comparables para este checkpoint, y no deben extrapolarse los resultados del artículo de ACT aunque el método sea el mismo.

## Requisitos de hardware

- Tamaño de pesos: 51.668.614 parámetros equivalen a aproximadamente 197 MB en fp32 y 103 MB en fp16 (cálculo derivado del número de parámetros, no un dato publicado).
- VRAM estimada para inferencia: inferior a 2 GB incluyendo pesos, activaciones de la imagen de 480×640 y buffers de ejecución; no hay cifra oficial publicada.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente por tamaño; una RTX 3060 o superior sobra para inferencia. No se requieren A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna con CUDA, e incluso es candidata a ejecución en CPU por su tamaño reducido (latencia no disponible).
- Opciones de despliegue: `lerobot-rollout` (CLI oficial del ecosistema LeRobot) sobre PyTorch; el checkpoint es un `safetensors` de LeRobot. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El único requisito indirecto conocido es que los datos se grabaron a 30 FPS, es decir, un presupuesto de unos 33 ms por paso de control, pero no se confirma que la política cumpla ese tiempo en hardware concreto.
- Almacenamiento: el repositorio ocupa 0,2 GB, por lo que el despliegue en un equipo de laboratorio es trivial en disco.

## Comparativa con modelos similares

Comparativa cualitativa; los datos numéricos de las alternativas no estaban disponibles en la información proporcionada.

| Modelo | Parámetros | Contexto / chunk | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `anschrur/act_record_test_3` (ACT) | 51.668.614 | no disponible (chunk no documentado) | sin resultados de evaluación | apache-2.0 | HuggingFace, vía LeRobot |
| Diffusion Policy (implementación de LeRobot) | no disponible | no disponible | no disponible | no disponible | no disponible |
| SmolVLA u otras VLA de LeRobot | no disponible | no disponible | no disponible | no disponible | no disponible |
| ACT de referencia del artículo 2304.13705 | no disponible | no disponible | no disponible | no disponible | no disponible |

Diferencias conceptuales conocidas: ACT predice chunks de acciones con un transformer y un CVAE, mientras que Diffusion Policy genera acciones mediante un proceso de difusión, lo que suele implicar un coste de inferencia mayor. Las políticas VLA añaden entrada de lenguaje e instrucciones abiertas, algo de lo que este checkpoint carece: aquí la tarea es fija y el modelo no interpreta texto.

## Limitaciones y advertencias

- Especialización extrema: entrenada para una sola tarea ("Grab the yellow cube"), un solo tipo de robot (`so_follower`) y una sola cámara frontal. No generaliza a otras tareas, morfologías ni configuraciones de sensores sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito, número de ensayos ni condiciones de prueba, por lo que se desconoce su fiabilidad real incluso en la tarea objetivo.
- Posible artefacto de prueba: los nombres `record-test_2` y `act_record_test_3`, junto con 0 descargas y 0 likes, sugieren un entrenamiento de validación del pipeline y no un modelo destinado a uso práctico.
- Riesgo de sobreajuste: 200 episodios de una única tarea y 100.000 pasos de entrenamiento con batch pequeño pueden producir una política muy ajustada a las posiciones, iluminación y fondo concretos de la recogida de datos.
- Sensibilidad a cambios de entorno: al depender de una única vista frontal de 480×640, cambios de iluminación, oclusiones, movimiento de cámara o un fondo distinto pueden degradar el comportamiento de forma abrupta.
- Fallo de política en lugar de alucinación: el modo de error relevante no es la alucinación textual, sino la generación de acciones erráticas, bloqueos o colisiones. Se requiere supervisión humana y parada de emergencia durante cualquier prueba en hardware real.
- Sesgos de los datos de teleoperación: la política reproduce los sesgos y las estrategias del operador que grabó las demostraciones, incluidas trayectorias subóptimas o poco diversas.
- Requisitos de coincidencia de claves de observación: los nombres de cámara deben coincidir exactamente con los del entrenamiento (`observation.images.front`), y el vector de estado debe tener forma `(6,)`; cualquier discrepancia impide la ejecución correcta.
- Licencia: apache-2.0 permite uso comercial y modificación, pero se debe conservar el aviso de licencia y citar el método ACT y LeRobot según indica la model card.
- Idiomas: no soporta ningún idioma; no debe describirse como modelo multilingüe ni compararse con modelos de lenguaje.
- Búsqueda web sin resultados útiles: las consultas realizadas no devolvieron documentación técnica adicional sobre este checkpoint (los resultados obtenidos eran páginas de soporte de Microsoft, sin relación con el modelo), por lo que toda la información procede de la model card y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anschrur/act_record_test_3
- Dataset de entrenamiento: https://huggingface.co/datasets/anschrur/record-test_2
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Artículo en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de aprendizaje por imitación: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=anschrur/record-test_2

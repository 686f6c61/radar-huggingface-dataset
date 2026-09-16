# alimerido/pi05-wrist-top-generic

## Resumen

alimerido/pi05-wrist-top-generic es una política robótica de tipo Vision-Language-Action (VLA) publicada por el usuario alimerido en Hugging Face, obtenida por ajuste fino del modelo base lerobot/pi05_base. El modelo subyacente, π₀.₅ (Pi05), procede de Physical Intelligence y está diseñado para generalizar a entornos y situaciones nuevos que no aparecían en el entrenamiento; la implementación disponible en este repositorio es la adaptación para LeRobot del repositorio OpenPI de sus autores. La política se distribuye con licencia Apache 2.0 y pipeline declarado como `robotics`.

El modelo consume un vector de estado propioceptivo de 6 dimensiones y dos flujos de imagen RGB de 480x640 píxeles (cámaras `wrist` y `top`), y produce un vector de acción de 6 dimensiones. Está ajustado específicamente sobre el dataset alimerido/wrist-top-cube_20260705_134536, compuesto por 140 episodios y 94 703 fotogramas a 30 FPS, con seis tareas de recogida y colocación de cubos y ladrillos de colores. El robot objetivo es un `so_follower` (brazo tipo SO-100/SO-101 en configuración follower).

Con 4 143 404 816 parámetros (aproximadamente 4,14 mil millones) y un repositorio de 9,4 GB, es una política de tamano medio dentro de la familia VLA. Su relevancia práctica es doble: por un lado demuestra el flujo completo de ajuste fino de π₀.₅ con LeRobot 0.6.2 sobre datos de imitación propios; por otro, sirve como punto de partida reproducible para quien quiera replicar el entrenamiento con su propio robot y su propio dataset.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅; detalles internos de capas no disponibles |
| Parámetros totales | 4 143 404 816 (según safetensors) |
| Parámetros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No se declara soporte multilingüe; las instrucciones de tarea del dataset están redactadas en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Datos adicionales de entrada/salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.wrist` | VISUAL | `(3, 480, 640)` |
| `observation.images.top` | VISUAL | `(3, 480, 640)` |
| `action` | ACTION | `(6,)` |

## Arquitectura y entrenamiento

π₀.₅ es un modelo Vision-Language-Action: combina un backbone de visión-lenguaje con un cabezal generador de acciones que produce comandos motores a partir de observaciones visuales, estado propioceptivo y una instrucción de tarea en lenguaje natural. La model card describe el modelo como una evolución de π₀ orientada a la generalización en entornos abiertos, es decir, a ejecutar tareas en escenarios no vistos durante el entrenamiento. La implementación incluida en este repositorio es la adaptación de LeRobot del repositorio OpenPI de Physical Intelligence.

El ajuste fino de esta política concreta se realizó sobre el dataset alimerido/wrist-top-cube_20260705_134536 (140 episodios, 94 703 fotogramas a 30 FPS), con aprendizaje por imitación. La configuración de entrenamiento declarada es la siguiente: 3 000 pasos, batch size 32, optimizador AdamW, learning rate 2,5e-05, semilla 1000 y LeRobot 0.6.2. El dataset cubre seis instrucciones de tarea en inglés, todas de tipo pick-and-place con objetos de color (cubos y ladrillos rojos y azules) y una tarea de apilado. No se documenta en la información disponible si hubo etapas de RLHF, DPO u otro tipo de ajuste por preferencias, ni la composición completa del corpus de preentrenamiento del modelo base.

## Capacidades

- Generación de acciones motoras continuas de 6 grados de libertad a partir de dos vistas de cámara y del estado del robot.
- Ejecución de tareas de pick-and-place guiadas por instrucción en lenguaje natural: recoger un cubo rojo y dejarlo en una caja, recoger un ladrillo azul y colocarlo en una caja verde o azul, y variantes equivalentes con ladrillo rojo.
- Tarea de apilado: colocar un cubo rojo sobre otro cubo rojo («Grab the right red cube, place it on top of left red cube»).
- Condicionamiento por tarea: la política recibe la instrucción como cadena de texto en el momento de la inferencia, por lo que una misma política cubre las seis tareas del dataset.
- Percepción visual desde dos cámaras simultáneas (muñeca y vista superior), lo que aporta información de la pinza y del espacio de trabajo.
- Ajuste fino adicional: al derivar de `lerobot/pi05_base`, puede reentrenarse con nuevos datasets mediante `lerobot-train`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio, ni modo de razonamiento explícito. Tampoco se declara capacidad multilingüe.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política está entrenada exactamente para recoger cubos y ladrillos de colores y depositarlos en cajas, por lo que puede desplegarse directamente sobre un brazo `so_follower` con dos cámaras configuradas como `wrist` y `top`.
- Clasificación de piezas por color: las tareas del dataset combinan objetos rojos y azules con cajas verdes y azules, lo que permite usar la política como base para un clasificador físico de piezas en una célula de montaje o en una línea de reciclaje a pequena escala.
- Apilado de objetos: la tarea de colocar un cubo rojo sobre otro cubo rojo sirve como caso práctico para manipulación con restricciones de precisión vertical y control de contacto.
- Punto de partida para ajuste fino con nuevos objetos: el flujo con `lerobot-train` y `--policy.path=lerobot/pi05_base` permite reentrenar la política con un dataset propio; este repositorio es un ejemplo reproducible del resultado esperado.
- Investigación en aprendizaje por imitación: sirve para estudiar cómo se comporta una política VLA de 4,14 mil millones de parámetros cuando se ajusta con tan solo 140 episodios y 3 000 pasos de entrenamiento.
- Evaluación comparativa de políticas robóticas: al compartir base (`lerobot/pi05_base`) y librería (`lerobot`), puede usarse como referencia frente a otros ajustes finos de π₀.₅ en condiciones de dataset y hardware comparables.
- Validación de pipelines de datos y teleoperación: útil para comprobar de extremo a extremo la grabación de episodios, el formateo de observaciones (estado de 6 dimensiones, dos cámaras 480x640 a 30 FPS) y la reproducibilidad del entrenamiento con semilla fija.
- Demostraciones y docencia en robótica: el comando `lerobot-rollout` permite ejecutar la política en modo `base` sin grabar episodios, lo que facilita demostraciones cortas y controladas con `--duration`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con la plantilla de tabla (tarea, ensayos, éxitos, tasa de éxito) pero indica explícitamente: «No evaluation results have been provided for this policy yet». No hay datos de MMLU, HumanEval, GSM8K ni de tasas de éxito en robot real. No se deben asumir cifras de rendimiento a partir del modelo base.

## Requisitos de hardware

- VRAM estimada para los pesos: en bf16, unos 8,3 GB (4,14 mil millones de parámetros x 2 bytes); en fp32, unos 16,6 GB. A esto hay que sumar activaciones y el coste de procesar dos imágenes de 480x640 píxeles por paso de inferencia.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegue en servidor; RTX 4090 (24 GB) para estación de trabajo.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 y RTX 3090 (24 GB), con margen suficiente. En tarjetas de 16 GB el margen es ajustado y no está confirmado en la información disponible; en 12 GB o menos no hay datos que permitan garantizarlo.
- Opciones de despliegue: LeRobot es la vía documentada, mediante `lerobot-rollout` para ejecución en el robot y `lerobot-train` para reentrenamiento, con selección de dispositivo a través de `--policy.device=cuda`. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, que no aplican a una política VLA de este tipo.
- Latencia y throughput: no disponibles. Como referencia operativa, el dataset se grabó a 30 FPS, lo que implica que el bucle de control espera una frecuencia de inferencia del orden de 30 Hz para reproducir el comportamiento demostrado; no se han publicado mediciones de latencia real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alimerido/pi05-wrist-top-generic | 4 143 404 816 | No disponible | Sin resultados publicados | Apache 2.0 | Hugging Face, vía LeRobot |
| lerobot/pi05_base | No disponible en la información proporcionada | No disponible | No disponible | No confirmada en la información proporcionada | Hugging Face |
| Otras políticas VLA de la familia π₀ / π₀.₅ ajustadas con LeRobot | No disponible | No disponible | No disponible | Apache 2.0 (según el modelo base de este repositorio) | Hugging Face |

No se dispone de datos verificables de otros modelos comparables en la información proporcionada, por lo que no se incluyen cifras de parámetros ni de rendimiento para alternativas concretas. Cualquier comparación numérica requeriría consultar las model cards de cada política por separado.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito en robot real publicadas, ni número de ensayos, ni condiciones de prueba. No hay evidencia cuantitativa de que la política funcione fuera del dataset de entrenamiento.
- Sesgo de dominio muy marcado: el ajuste fino se hizo con 140 episodios y 94 703 fotogramas de un único entorno, con objetos concretos (cubos y ladrillos rojos y azules) y cajas de colores específicos. La generalización a otros objetos, colores, iluminación o posiciones de cámara no está demostrada.
- Entrenamiento corto: 3 000 pasos con batch 32 y learning rate 2,5e-05 es una configuración reducida; es probable que la política no haya convergido al máximo de sus capacidades.
- Dependencia del hardware y del montaje: las observaciones incluyen un vector de estado de 6 dimensiones y dos cámaras en posiciones concretas (`wrist` y `top`). Cambiar de robot, de cinemática o de colocación de cámaras invalida la política sin un nuevo ajuste fino.
- Idioma de las instrucciones: las tareas están redactadas en inglés y no se declara soporte multilingüe. Usar instrucciones en castellano u otro idioma no está soportado por la información disponible.
- Riesgo de alucinación en el sentido robótico: como toda política de imitación, puede generar trayectorias plausibles pero incorrectas ante observaciones fuera de distribución, con riesgo de colisiones o de danar objetos y pinzas. Requiere límites de par, paradas de emergencia y supervisión humana.
- Restricciones de licencia: la licencia declarada es Apache 2.0, lo que en principio permite uso comercial, pero la información disponible no detalla la licencia del modelo base `lerobot/pi05_base` ni condiciones adicionales derivadas del método π₀.₅. Conviene verificar la cadena de licencias antes de un despliegue comercial.
- Metadatos poco fiables: el repositorio tiene 0 descargas y 0 «likes», y la fecha de creación declarada (2026-09-16) es posterior a la fecha actual, lo que sugiere datos de publicación inconsistentes o generados automáticamente. Tratar el repositorio como material de investigación, no como artefacto validado en producción.
- Idiomas, contexto y cuantizaciones no declarados: la model card no especifica longitud de contexto, tipos de cuantización soportados ni composición del corpus de preentrenamiento, lo que dificulta el análisis de riesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alimerido/pi05-wrist-top-generic
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/alimerido/wrist-top-cube_20260705_134536
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=alimerido/wrist-top-cube_20260705_134536
- Artículo de π₀.₅ en Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Guía de π05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Documentación de entrenamiento por imitación: https://huggingface.co/docs/lerobot/en/il_robots
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet

Nota: la búsqueda web realizada no ha devuelto resultados relacionados con el modelo, el paper de π₀.₅ ni el repositorio OpenPI. Los únicos enlaces verificables son los que aparecen en la model card, la información de Hugging Face y la documentación de LeRobot.

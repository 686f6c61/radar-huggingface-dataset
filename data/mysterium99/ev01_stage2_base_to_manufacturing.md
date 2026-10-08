# mysterium99/ev01_stage2_base_to_manufacturing

## Resumen

`mysterium99/ev01_stage2_base_to_manufacturing` es una política robótica de tipo Vision-Language-Action (VLA) publicada en HuggingFace por el usuario mysterium99 (lilian lamb) y entrenada con la librería LeRobot. Sobre una arquitectura Evo-1, descrita por sus autores como una política que combina el backbone vision-language InternVL3 con una cabeza de acción de flow matching continuo, el modelo consume imágenes de cámara junto con una instrucción en lenguaje natural y predice chunks de acciones futuras. Con 776.139.440 parámetros y un repositorio de 1,8 GB, es un modelo de escala ligera dentro de la categoría VLA, orientado a ejecución sobre hardware robótico real y no a generación de texto genérica.

La ficha corresponde a un ajuste fino de segunda etapa (*stage2*) sobre un dominio concreto de manufactura. El modelo está especializado en tres tareas de manipulación —recoger piezas de un operario humano y depositarlas en una zona delimitada, clasificar tuercas y tornillos en recipientes de colores y agrupar todo el material en un cubo— a partir de un dataset de 150 episodios y 218.964 frames grabados a 30 FPS. La entrada es multimodal y fija: el estado del robot (vector de 6 dimensiones) más tres cámaras a 480x640 (gripper, superior y lateral); la salida es un vector de acción de 6 dimensiones.

Su relevancia actual es la de servir como ejemplo reproducible de política VLA ligera entrenada de extremo a extremo con LeRobot 0.6.2 (20.000 pasos, batch 4, AdamW con learning rate 1e-5) y como punto de partida para ajustes finos en entornos industriales similares. No obstante, el modelo se publicó sin licencia declarada, sin resultados de evaluación y sin datos de benchmarks, por lo que debe tratarse como material experimental y no como un componente validado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) Evo-1: backbone InternVL3 + cabeza de acción de flow matching continuo (action chunking) |
| Parámetros totales | 776.139.440 (según los pesos en safetensors) |
| Parámetros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se publican versiones cuantizadas ni GGUF/ONNX) |
| Idiomas soportados | No disponible; las instrucciones de tarea del dataset están en inglés y no se declara soporte multilingüe |
| Licencia | No disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería LeRobot) |
| Tipo de política / pipeline | robotics (LeRobot, `policy.type=evo1`) |
| Robot soportado | tipo `follow` |
| Cámaras de entrada | `gripper`, `newtop`, `newside`, a 480x640 y 30 FPS |
| Entradas | `observation.state` (6,), `observation.images.gripper` (3,480,640), `observation.images.newtop` (3,480,640), `observation.images.newside` (3,480,640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `manufacturing_finetune`: 150 episodios, 218.964 frames, 30 FPS |
| Pasos de entrenamiento | 20.000 (batch 4, AdamW, lr 1e-5, semilla 0, LeRobot 0.6.2) |
| Tamaño del repositorio | 1,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-07 / 2026-10-07 |

## Arquitectura y entrenamiento

El modelo sigue el diseño Evo-1: un backbone vision-language InternVL3 que codifica conjuntamente las tres imágenes de cámara y la instrucción en lenguaje natural, y una cabeza de acción que genera chunks de acciones mediante flow matching continuo. Este esquema (predicción de secuencias de acciones en lugar de acciones individuales) es habitual en las políticas VLA modernas porque amortigua el coste de inferencia del modelo de visión y lenguaje sobre varios pasos de control. La observación es fija y de dimensiones conocidas (estado de 6 valores, tres imágenes RGB de 480x640), y la salida es un vector de acción de 6 dimensiones, coherente con un brazo robótico de 6 grados de libertad con pinza.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `manufacturing_finetune`, compuesto por 150 episodios teleoperados (218.964 frames a 30 FPS, aproximadamente dos horas de datos) repartidos en tres tareas de manufactura. La configuración declarada es de 20.000 pasos con batch de 4, optimizador AdamW y learning rate 1e-5; en términos de muestras procesadas equivale a unas 80.000 observaciones, menos de la mitad de los frames disponibles del dataset. No se documentan en la información proporcionada detalles sobre la composición exacta del dataset, el uso de RLHF/DPO, el congelado parcial de capas ni la estrategia de aumento de datos.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para brazos con pinza a partir de observaciones visuales y propioceptivas.
- Seguimiento de instrucciones en lenguaje natural: la política acepta una descripción de tarea en texto (por ejemplo, "Take hardware from human and put in taped area") que condiciona el comportamiento.
- Fusión multimodal de tres vistas simultáneas más el estado del robot, lo que permite razonar sobre la pinza y el entorno desde perspectivas complementarias (superior y lateral).
- Predicción de chunks de acción mediante flow matching, lo que reduce la frecuencia de inferencia necesaria en el lazo de control.
- Especialización en tres tareas concretas de manufactura: recogida de piezas de la mano de un operario, clasificación de tuercas y tornillos en recipientes de colores, y agrupación de material en un cubo.
- Capacidad de ajuste fino: al ser una política LeRobot, puede reentrenarse con `lerobot-train` sobre datasets propios de imitación.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión de propósito general, audio ni "thinking mode". Tampoco se declara soporte multilingüe.

## Casos de uso

- Alimentación de piezas en línea de montaje: la política coge componentes de la mano de un operario y los deposita en una zona delimitada, una tarea de colaboración humano-robot para la que fue entrenada explícitamente.
- Clasificación de tornillería por tipo y contenedor: asignar tuercas a un vaso rojo y tornillos a un cubo azul, lo que encaja en puestos de *kitting* donde se separa material a granel.
- Recogida y vaciado de material en contenedores: agrupar todo el hardware disperso en un único cubo, útil como etapa de limpieza o consolidación en células de ensamblaje.
- Base para ajuste fino en dominios industriales similares: reentrenar con `lerobot-train` sobre un dataset propio de otro producto o línea, aprovechando que la política ya está adaptada a manipulación de piezas pequeñas.
- Banco de pruebas para investigación en imitation learning: comparar el comportamiento de una política de flow matching frente a alternativas de difusión u otras cabezas de acción sobre el mismo conjunto de tareas.
- Automatización de una célula con configuración de cámaras fija: el modelo asume exactamente tres cámaras en posiciones de pinza, cenital y lateral, lo que lo hace desplegable en celdas donde esa disposición ya esté instalada.
- Generación de datos de referencia para evaluación de VLA: usar las tres tareas como conjunto de comparación entre políticas ligeras antes de escalar a modelos de mayor tamaño.
- Demostraciones de imitación de extremo a extremo con LeRobot: reproducir el flujo completo (grabación, entrenamiento, rollout) para formar a nuevos equipos en el uso del framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con el texto "No evaluation results have been provided for this policy yet", sin tasas de éxito, número de ensayos ni condiciones de prueba en robot real. Tampoco se proporcionan métricas de precisión de acción, latencia o throughput.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parámetros y del tamaño del repositorio; el autor no publica requisitos oficiales.

- Peso de los pesos: 776.139.440 parámetros equivalen a aproximadamente 1,55 GB en bf16/fp16 y 3,10 GB en fp32; el repositorio ocupa 1,8 GB.
- VRAM estimada para inferencia: del orden de 4-8 GB en total, sumando pesos, activaciones del codificador visual de InternVL3 para tres imágenes de 480x640 y la caché interna del backbone de lenguaje.
- GPU de consumo: cabe en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4070 Ti, RTX 4090). Para integración a bordo del robot, una Jetson Orin con 16 GB o más es una opción plausible, aunque no está verificada por el autor.
- GPU de centro de datos: A100, H100 o L40S son recomendables para entrenamiento, evaluación masiva o despliegue de varias instancias en paralelo, no para inferencia de una sola política.
- Entrenamiento: con AdamW y estados del optimizador en fp32, solo pesos y optimizador ocupan del orden de 9,3 GB; añadiendo activaciones de tres imágenes por muestra y batch 4, se recomienda un mínimo de 24 GB de VRAM.
- Opciones de despliegue: la vía documentada es `lerobot-rollout` con PyTorch y CUDA. No hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama, ni pesos en GGUF, dado que se trata de una política robótica y no de un modelo de lenguaje desplegable por API de texto.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS (unos 33 ms por frame), lo que marca el ritmo del lazo de control con el que debe ser compatible la política; el uso de chunks de acción reduce la frecuencia de inferencia necesaria, pero no se publica ninguna medición real.

## Comparativa con modelos similares

Los datos de esta tabla sobre modelos alternativos provienen del conocimiento público general y no de la información proporcionada en esta ficha, por lo que deben verificarse antes de usarse.

| Modelo | Parámetros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| evo1 (`mysterium99/ev01_stage2_base_to_manufacturing`) | 776 M | VLA con backbone InternVL3 y cabeza de flow matching | No disponible | HuggingFace, LeRobot |
| SmolVLA | ~450 M | VLA ligera para control con LeRobot | Apache 2.0 | HuggingFace, LeRobot |
| OpenVLA | ~7 B | VLA con backbone Llama 2 y tokenización de acciones | Licencia basada en Llama 2 (consultar condiciones) | HuggingFace |
| pi0 | ~3,3 B | VLA con modelo de flujo de acciones (openpi) | Apache 2.0 (según el repositorio openpi) | GitHub openpi |

La diferencia principal frente a estas alternativas no es de capacidad declarada, sino de naturaleza del artefacto: el modelo aquí descrito es un ajuste fino de segunda etapa sobre un dataset propio de manufactura, sin licencia ni evaluación publicadas, mientras que SmolVLA, OpenVLA y pi0 son modelos base con documentación y licencias explícitas. No hay datos de rendimiento comparables entre ellos en la información disponible.

## Limitaciones y advertencias

- Ausencia total de evaluación: no se publica ninguna tasa de éxito en robot real, ni número de ensayos, ni condiciones de prueba.
- Licencia no especificada ("More Information Needed"), lo que impide asumir derechos de uso comercial. Cualquier despliegue productivo requiere contactar con el autor.
- Dataset muy reducido y específico: 150 episodios y unas dos horas de datos para tres tareas, un único tipo de robot (`follow`) y una configuración concreta de tres cámaras. Es esperable un sobreajuste al entorno, a las posiciones de los objetos y a la iluminación de la grabación.
- Dependencia estricta de las claves de observación: la política espera `observation.images.gripper`, `observation.images.newtop` y `observation.images.newside` con resolución 480x640; si los nombres o las resoluciones no coinciden, el despliegue falla.
- Idiomas: no se declara soporte multilingüe y las instrucciones del dataset están en inglés, por lo que el comportamiento con instrucciones en castellano no está verificado.
- Riesgo físico: en robótica, un fallo del modelo se traduce en acciones erróneas o movimientos no deseados. Es obligatorio usar parada de emergencia, límites de par y supervisión humana durante las pruebas.
- Sesgos: derivados de un único dataset de manufactura, con objetos, posiciones y un estilo de teleoperación concretos; el rendimiento con piezas u operarios distintos es desconocido.
- Sin cuantizaciones ni formatos alternativos publicados (no hay GGUF, ONNX ni versiones reducidas), lo que limita el despliegue en hardware muy restringido.
- Sin datos de latencia ni de throughput: no puede garantizarse el cumplimiento de un lazo de control a 30 FPS en hardware de consumo.
- Adopción nula: 0 descargas y 0 likes, sin demo en vídeo ni validación por parte de la comunidad.
- Fechas de creación y actualización (2026-10-07) según la ficha de HuggingFace, con un intervalo de menos de tres minutos entre ambas, lo que sugiere una publicación sin iteraciones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mysterium99/ev01_stage2_base_to_manufacturing
- Perfil del autor: https://huggingface.co/mysterium99
- Modelos del autor: https://huggingface.co/mysterium99/models
- Repositorio del método Evo-1 (MINT-SJTU): https://github.com/MINT-SJTU/Evo-1
- Guía de Evo-1 en LeRobot: https://huggingface.co/docs/lerobot/main/en/evo1
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/manufacturing_finetune
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=manufacturing_finetune
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cita de LeRobot (Cadene et al., 2024): incluida en la model card del modelo; se recomienda citarla junto con el método Evo-1.

# Abiam77/smolvla_so101_cube_color

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face, pensado para controlar robots manipuladores a partir de instrucciones en lenguaje natural y observaciones visuales. Este repositorio concreto, `Abiam77/smolvla_so101_cube_color`, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre el brazo robótico SO-101 (tipo `so_follower`), entrenado con el dataset propio `Abiam77/so101_cube_color`. El modelo resuelve una tarea de manipulación muy concreta: recoger un cubo (rojo o amarillo) y depositarlo en una cesta.

Con 450.046.176 parámetros (unos 450 M) y un tamaño de repositorio de 0,9 GB en formato safetensors, el modelo está diseñado para ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios pequeños y proyectos de robótica de bajo coste. La relevancia actual reside en que los VLA ligeros permiten llevar la imitación visual-motora a plataformas asequibles sin depender de clústeres de GPU.

La ficha describe tanto las características heredadas del modelo base SmolVLA (arquitectura, licencia Apache 2.0, integración con LeRobot) como los datos específicos del ajuste fino (dataset, configuración de entrenamiento, entradas y salidas). No se han publicado resultados de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta; detalles internos no disponibles en la información proporcionada |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la información proporcionada |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower (SO-101) |
| Camaras | camera1, camera2 (entrada declarada con 3 cámaras: camera1, camera2, camera3) |
| Entrada de estado | observation.state, shape (6,) |
| Entrada visual | observation.images.camera1/2/3, shape (3, 256, 256) |
| Salida | action, shape (6,) |
| Libreria | lerobot |
| Version de LeRobot | 0.6.1 |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/smolvla_base`, un VLA compacto que combina percepción visual y comprensión de lenguaje para producir acciones motoras de forma directa. La información proporcionada no detalla la arquitectura interna (composición del codificador visual, del modelo de lenguaje o del decodificador de acciones), por lo que esos detalles se consideran no disponibles. El modelo consume observaciones compuestas por un vector de estado de 6 dimensiones y tres imágenes RGB de 256×256 píxeles, y emite un vector de acción de 6 dimensiones.

El entrenamiento se realizó mediante imitación supervisada sobre el dataset `Abiam77/so101_cube_color`, compuesto por 50 episodios y 26.849 fotogramas a 30 FPS, con dos tareas: "Pick up the red cube and place it in the basket" y "Pick up the yellow cube and place it in the basket". La configuración de entrenamiento fue de 20.000 pasos, batch size 64, optimizador AdamW, learning rate 0,0001 y semilla 1000. No se indica en la información disponible si hubo RLHF, DPO ni otras fases de alineación posteriores.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 dimensiones para un brazo SO-101 a partir de observaciones visuales y de estado.
- Condicionamiento por lenguaje natural: acepta instrucciones de tarea en inglés ("Pick up the red cube and place it in the basket").
- Percepción multi-cámara: procesa hasta tres flujos de imagen RGB de 256×256 (aunque la configuración de ejecución de ejemplo usa dos cámaras).
- Discriminación por color de objeto: el dataset incluye cubos rojo y amarillo, por lo que el modelo está entrenado para distinguir ambos.
- Despliegue en hardware de consumo: el tamaño de 450 M de parámetros y 0,9 GB permite ejecución en equipos modestos.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y ejecución mediante las herramientas `lerobot-train` y `lerobot-rollout`.
- No se dispone de información sobre tool calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento; no aplican a este tipo de modelo.

## Casos de uso

- Manipulación pick-and-place en laboratorio: ejecutar la tarea de recoger un cubo de color y depositarlo en una cesta sobre un SO-101 real, usando `lerobot-rollout` con la instrucción de tarea adecuada. Es el caso de uso directo para el que fue entrenado.
- Prototipado rápido de políticas de imitación: servir como punto de partida para comparar configuraciones de cámaras, iluminación o posiciones de objeto antes de entrenar políticas propias.
- Docencia e investigación en robótica de bajo coste: el tamaño reducido (450 M) y la licencia Apache 2.0 permiten usarlo en cursos y proyectos académicos con GPU de consumo.
- Clasificación visual de objetos por color en contexto robótico: el modelo aprende a asociar el color del cubo (rojo o amarillo) con la instrucción, útil para estudiar cómo los VLA ligeros codifican atributos visuales.
- Base para ajuste fino con nuevos objetos o contenedores: al estar construido sobre `lerobot/smolvla_base`, se puede reentrenar con un dataset propio siguiendo el flujo de LeRobot.
- Evaluación comparativa de VLA compactos: útil como referencia frente a otros ajustes finos de SmolVLA sobre el mismo robot (por ejemplo, variantes con cubos de otros colores) para medir sensibilidad al dataset.
- Automatización de tareas repetitivas de recogida en entornos controlados: con supervisión humana y un espacio de trabajo delimitado, puede ejecutar ciclos de recogida y depósito durante periodos acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en safetensors (0,9 GB), la inferencia en precisión nativa requiere del orden de 1-2 GB de VRAM, y menos con cuantización, aunque no se documentan formatos cuantizados.
- GPU recomendadas: no especificadas en la información proporcionada. El modelo base SmolVLA se describe como desplegable en hardware de consumo.
- GPU de consumo: por tamaño, es compatible con GPUs consumer modernas (por ejemplo, RTX 3060 en adelante), aunque no se confirma en la documentación.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte para `--policy.device=cuda` en entrenamiento. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de política robótica.
- Latencia y throughput: no disponibles. La captura de datos se realizó a 30 FPS, pero no se documenta la frecuencia de inferencia en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Abiam77/smolvla_so101_cube_color | 450 M | no disponible | Pick-and-place de cubo rojo/amarillo en SO-101 | Apache 2.0 | Hugging Face |
| addisonhammer/smolvla_so101_pink_cube | no disponible | no disponible | Pick-and-place de cubo rosa en SO-101 | no disponible en la búsqueda | Hugging Face |
| lerobot/smolvla_base | no disponible en la información (modelo base de SmolVLA) | no disponible | VLA base para ajuste fino | no disponible en la información | Hugging Face |

La comparación con alternativas de mayor tamaño o de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo está entrenado para dos tareas concretas (cubo rojo y cubo amarillo hacia la cesta); no generaliza a otros objetos, colores o destinos sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real documentadas, por lo que su fiabilidad en producción es desconocida.
- Dependencia del entorno: cambios en iluminación, posición de cámara, fondo o disposición de objetos pueden degradar el rendimiento, dado el reducido dataset (50 episodios).
- Posible sobreajuste: 20.000 pasos sobre 26.849 fotogramas y 50 episodios es un régimen propenso a memorizar el entorno de recogida.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación motora: como política de imitación, puede generar acciones erráticas o inseguras ante observaciones fuera de distribución; requiere supervisión y parada de emergencia.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; conviene revisar también la licencia del modelo base y del dataset.
- Repositorio con 0 descargas y creado recientemente: no hay evidencia de uso comunitario ni mantenimiento.
- Configuración de cámaras: la model card declara tres cámaras de entrada, pero el ejemplo de ejecución usa dos; es necesario alinear los nombres de cámara con las claves de observación del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abiam77/smolvla_so101_cube_color
- Dataset de entrenamiento: https://huggingface.co/datasets/Abiam77/so101_cube_color
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Abiam77/so101_cube_color
- Modelo comparable (cubo rosa): https://huggingface.co/addisonhammer/smolvla_so101_pink_cube

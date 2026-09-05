# MoAIBo/pick_place_depth_vel_evo1_twostage

## Resumen

EVO1 es un modelo de política de visión-lenguaje-acción (VLA) para robótica, desarrollado por MoAIBo. Se basa en un backbone InternVL3 y una cabeza de acción mediante flow matching continuo, capaz de generar acciones de manipulación a partir de imágenes de cámara y una instrucción en lenguaje natural. Este modelo concreto, `pick_place_depth_vel_evo1_twostage`, ha sido entrenado con el framework LeRobot para tareas de pick and place en un robot `so101_tb4`, usando cinco cámaras (izquierda, derecha, muñeca, d455 y profundidad). Con 776 millones de parámetros, está disponible en formato safetensors bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en InternVL3 con head de flow matching continuo |
| Parametros totales | 776.139.440 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de EVO1 combina un modelo de visión-lenguaje (InternVL3) que procesa simultáneamente las imágenes de cinco cámaras y la instrucción de lenguaje natural, con una cabeza de acción basada en flow matching continuo que predice futuros chunks de acción. El modelo recibe como entrada el estado del robot (8 dimensiones) y cinco imágenes de 360x640 píxeles (cámara izquierda, derecha, muñeca, d455 y profundidad), y genera como salida una acción de 8 dimensiones para el robot.

El entrenamiento se realizó con el dataset `MoAIBo/merged_so101_tb4_pick_place_depth_vel`, compuesto por 96 episodios y 128.543 frames a 30 FPS. Las tareas son dos: recoger un objeto azul o amarillo de una caja marrón, colocarlo en un plato blanco y volver al dock. La configuración de entrenamiento incluye 65.000 pasos, batch size 2, optimizador AdamW, learning rate 1e-5, semilla 1000 y la versión 0.6.0 de LeRobot. No se detallan innovaciones técnicas adicionales más allá del uso de flow matching para la predicción de acciones continuas.

## Capacidades

- Generación de acciones de manipulación robótica a partir de observaciones visuales y lenguaje natural.
- Procesamiento simultáneo de cinco cámaras: izquierda, derecha, muñeca, d455 y profundidad, todas a resolución 360x640.
- Entrada de estado del robot de 8 dimensiones y salida de acciones de 8 dimensiones, compatible con el robot `so101_tb4`.
- Soporte de instrucciones en lenguaje natural para especificar tareas (por ejemplo, recoger un objeto azul y colocarlo en un plato blanco).
- Predicción de acciones futuras mediante flow matching continuo, lo que permite generar secuencias de acciones suaves.
- Integración completa con el framework LeRobot, incluyendo entrenamiento y rollout sobre hardware robótico.

## Casos de uso

- Automatización de pick and place en almacenes: el modelo puede ejecutar tareas de recogida y colocación de objetos en cajas y bandejas, gracias a su capacidad para procesar múltiples cámaras y generar acciones de 8 dimensiones.
- Robótica de laboratorio: ideal para tareas de manipulación repetitivas donde se necesita alta precisión visual, como colocar muestras en placas o contenedores.
- Investigación en aprendizaje por imitación: al estar integrado con LeRobot, permite entrenar y evaluar políticas VLA en entornos de investigación con robots de tipo `so101_tb4`.
- Asistencia robótica en entornos domésticos: el modelo puede ayudar a recoger objetos y colocarlos en lugares designados, aunque su generalización está limitada a las tareas entrenadas.
- Control de brazos robóticos en ensamblaje: puede adaptarse a tareas de ensamblaje donde se requiere colocar piezas en posiciones específicas sobre una superficie.
- Demostraciones y prototipado rápido: gracias a su tamaño compacto (776M parámetros), puede ejecutarse en GPUs de consumo para prototipado y validación de políticas robóticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 776M parámetros, el checkpoint en FP16 ocupa aproximadamente 1,55 GB; considerando las activaciones de cinco cámaras, se recomienda una GPU con al menos 8 GB de VRAM.
- GPU recomendadas: no especificadas por el autor. Para inferencia, una GPU de consumo moderna (RTX 3060 12GB o superior) debería ser suficiente; para reentrenamiento, se recomienda una GPU de gama alta (A100 o H100).
- Compatibilidad con GPUs de consumo: sí, gracias al tamaño reducido del modelo.
- Opciones de despliegue: LeRobot para rollout, tal como se documenta en la model card. No se mencionan otras opciones como vLLM, llama.cpp o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Episodios de entrenamiento | Frames | Licencia |
|---|---|---|---|---|---|
| MoAIBo/pick_place_depth_vel_evo1_twostage | 776.139.440 | no disponible | 96 | 128.543 | Apache 2.0 |
| MoAIBo/pick_place_depth_vel_evo1_all_cameras | no disponible | no disponible | 26 | 34.129 | Apache 2.0 |

Ambos modelos comparten la misma arquitectura EVO1 y están entrenados para tareas similares de pick and place, aunque el modelo `twostage` utiliza un dataset más amplio (96 episodios frente a 26). No se dispone de datos de benchmarks comparativos.

## Limitaciones y advertencias

- No se han proporcionado resultados de evaluación sobre robot real; el rendimiento en tareas nuevas no está validado.
- El modelo ha sido entrenado únicamente en dos tareas específicas de pick and place (objetos azul y amarillo), lo que limita su generalización a otros objetos, colores o entornos.
- El dataset de entrenamiento es pequeño (96 episodios), lo que puede afectar la robustez frente a variaciones de iluminación, posición de objetos o distractores.
- Depende de una configuración exacta de cámaras y robot; cambiar el hardware o la disposición de las cámaras puede degradar el rendimiento.
- No se han documentado sesgos conocidos ni riesgos de alucinación, pero al ser un modelo de aprendizaje por imitación, es susceptible de fallos en situaciones no vistas.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de rendimiento ni soporte oficial para producción.

## Enlaces

- HuggingFace: https://huggingface.co/MoAIBo/pick_place_depth_vel_evo1_twostage
- Dataset de entrenamiento: https://huggingface.co/datasets/MoAIBo/merged_so101_tb4_pick_place_depth_vel
- Repositorio de EVO1: https://github.com/MINT-SJTU/Evo-1
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MoAIBo/merged_so101_tb4_pick_place_depth_vel
- Modelo similar: https://huggingface.co/MoAIBo/pick_place_depth_vel_evo1_all_cameras

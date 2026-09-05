# eslab1234/smolvla_multitask_5blocks_v2_530ep_fullft_b16_300k

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por Hugging Face, que permite controlar robots mediante aprendizaje por imitación con un coste computacional reducido. Este checkpoint concreto es un fine-tuning completo (`fullft`) del modelo base `lerobot/smolvla_base`, entrenado por el usuario `eslab1234` sobre un dataset multitarea de manipulación de bloques. El modelo está diseñado para generar acciones de robot de 6 dimensiones a partir de observaciones visuales (tres cámaras) y del estado del robot, y puede desplegarse en hardware de consumo. Con 450 millones de parámetros, SmolVLA logra un equilibrio entre rendimiento y eficiencia, lo que lo hace relevante para aplicaciones robóticas en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (transformers con encoder de vision, encoder de lenguaje y decodificador de acciones) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo es una politica robótica; el componente de lenguaje no se usa para texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA compacto presentado en el paper 2506.01844. Combina un encoder de vision, un modelo de lenguaje y un decodificador de acciones para producir comandos de control de robot a partir de entradas multimodales. Este checkpoint es un fine-tuning completo del modelo base `lerobot/smolvla_base`, realizado con la libreria LeRobot version 0.5.2. El entrenamiento se llevo a cabo sobre el dataset `eslab1234/multitask_5blocks_v2_530ep`, compuesto por 530 episodios y 867.917 frames a 30 FPS, con dos tareas: recoger cinco bloques en secuencia (rojo, amarillo, madera, verde y azul) y apilarlos o colocarlos en un area objetivo. La configuracion de entrenamiento incluye 300.000 pasos, batch size 16, optimizador AdamW, learning rate 2e-05 y seed 1000. No se reporta el uso de RLHF, DPO ni otras tecnicas de alineacion; se trata de un entrenamiento de aprendizaje supervisado por imitacion.

## Capacidades

- Generacion de acciones de robot de 6 dimensiones (posicion/orientacion) a partir de observaciones de estado y tres camaras.
- Soporte de multiples camaras: `top`, `wrist` y una tercera camara no especificada en la configuracion de entrada.
- Capacidad multitarea: el modelo fue entrenado para dos tareas secuenciales de manipulacion de bloques.
- Ejecucion en hardware de consumo gracias a su tamano compacto (450M parametros).
- Integracion nativa con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue.
- No soporta tool calling, generacion de texto libre ni razonamiento general; es exclusivamente una politica de control robotico.

## Casos de uso

- Manipulacion robotica de objetos en laboratorio: el modelo controla un robot `so_follower` con 6 grados de libertad para tareas de recogida y colocacion de bloques, usando las camaras superior y de muñeca para localizar los objetos.
- Automatizacion de ensamblaje de piezas pequeñas: en lineas de produccion donde se requiere recoger piezas en un orden fijo y colocarlas en una posicion determinada, el modelo puede ejecutar la secuencia con precision.
- Investigacion en aprendizaje por imitacion: sirve como baseline para comparar politicas VLA compactas frente a modelos mas grandes, especialmente en entornos de manipulacion con pocas demostraciones.
- Robótica educativa: el modelo puede desplegarse en robots de bajo coste con GPUs de gama media, permitiendo demostraciones practicas de control robotico en aulas o talleres.
- Recoleccion y apilado de objetos en almacenes: tareas de pick-and-place secuencial donde el robot debe identificar y manipular objetos de distintos colores y materiales.
- Desarrollo de aplicaciones robóticas personalizadas: a partir de este checkpoint, se puede realizar fine-tuning adicional con LeRobot sobre nuevos datasets para adaptar la politica a tareas especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion en robot real para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado el tamano del modelo (450M parametros), en precision FP32 ocuparia aproximadamente 1,8 GB, pero no hay datos oficiales de memoria para el despliegue con LeRobot.
- GPU recomendadas: no disponibles en la informacion proporcionada. El paper de SmolVLA indica que el modelo puede ejecutarse en hardware de consumo, por lo que GPUs como RTX 3060 o superiores son plausibles, aunque no se confirma.
- Opciones de despliegue: se utiliza el comando `lerobot-rollout` de LeRobot con `--policy.path=eslab1234/smolvla_multitask_5blocks_v2_530ep_fullft_b16_300k`. No aplican vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | Tareas | Licencia |
|---|---|---|---|---|
| eslab1234/smolvla_multitask_5blocks_v2_530ep_fullft_b16_300k | 450M | multitask_5blocks_v2 (530 episodios) | 2 tareas de bloques | Apache 2.0 |
| eslab1234/smolvla_task1_5blocks_v3_444ep_fullft_b16_150k_v1 | no disponible | task1_5blocks_v3 (444 episodios) | 1 tarea de bloques | no disponible |
| lerobot/smolvla_base | no disponible | no disponible | modelo base preentrenado | no disponible |

No se dispone de datos de benchmarks comparativos entre estos checkpoints. La comparativa se limita a los metadatos publicados en Hugging Face.

## Limitaciones y advertencias

- No se han reportado sesgos especificos, pero al estar entrenado sobre un dataset limitado (bloques de colores concretos), el modelo puede fallar ante objetos o iluminacion diferentes.
- Riesgo de alucinacion en acciones: cambios en la posicion de los objetos, distracciones o condiciones de iluminacion no vistas pueden provocar acciones incorrectas.
- Limitaciones de generalizacion: el modelo solo esta entrenado para las dos tareas del dataset; no funcionara en otras tareas sin un fine-tuning adicional.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se requiere citar el metodo original y LeRobot.
- Caveat importante para produccion: la model card no incluye resultados de evaluacion en robot real, por lo que el rendimiento real en un entorno fisico no esta validado.
- El modelo requiere un robot `so_follower` y la configuracion exacta de camaras usada en el entrenamiento; no es portable a otros robots sin adaptacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eslab1234/smolvla_multitask_5blocks_v2_530ep_fullft_b16_300k
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/eslab1234/multitask_5blocks_v2_530ep
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=eslab1234/multitask_5blocks_v2_530ep

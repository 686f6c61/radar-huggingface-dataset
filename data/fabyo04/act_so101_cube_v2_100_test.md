# Fabyo04/act_so101_cube_v2_100_test

## Resumen

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que predice trozos de accion (action chunks) en lugar de pasos individuales. Este repositorio concreto, `Fabyo04/act_so101_cube_v2_100_test`, es una policy entrenada con LeRobot sobre un brazo SO-101 (tipo `so_follower`) para ejecutar una unica tarea manipulativa: "Pick up the cube and place it in the bowl" (coger el cubo y dejarlo en el cuenco).

Se trata de un modelo pequeno de robotica, no de un modelo de lenguaje: tiene 51.668.614 parametros (51,67 millones) y su entrada son dos flujos de imagen a 480x640 mas un vector de estado de 6 dimensiones, mientras que su salida es un vector de accion de 6 dimensiones. Se distribuye en formato safetensors bajo licencia Apache 2.0 y se carga mediante la libreria `lerobot`.

Su relevancia es acotada y practica: sirve como ejemplo reproducible de un pipeline completo de imitation learning con hardware de bajo coste, y como policy de referencia para la tarea concreta de pick-and-place sobre SO-101. El repositorio no tiene descargas ni valoraciones, no incluye resultados de evaluacion y, dado el nombre (`_test`) y la configuracion de entrenamiento (solo 50 pasos), debe considerarse una prueba tecnica mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con encoder CVAE y backbones visuales convolucionales |
| Parametros totales | 51.668.614 (51,67 millones), segun metadatos de safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: no hay ventana de tokens. Observa imagenes y estado en cada paso; predice un chunk de acciones |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible / no aplica (modelo de robotica; no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | so_follower (SO-101) |
| Camaras | top, front (480x640, 3 canales) |
| Entradas | `observation.state` (6,), `observation.images.top` (3,480,640), `observation.images.front` (3,480,640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 0,2 GB |
| Libreria | lerobot |
| Version de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

La arquitectura sigue el metodo ACT descrito en el paper arXiv:2304.13705. Es un transformer condicionado por observaciones multimodales: las imagenes de las dos camaras pasan por backbones visuales convolucionales y el estado del robot por una proyeccion lineal; ambos se serializan en una secuencia de tokens que alimenta un transformer encoder. Sobre esa representacion, un transformer decoder genera un chunk de acciones futuras en lugar de una sola accion, lo que reduce el problema de compounding error y suaviza la ejecucion. El modelo incorpora ademas un encoder CVAE que modela la variabilidad de las demostraciones humanas y un mecanismo de ensamblado temporal (temporal ensembling) que promedia las predicciones solapadas de chunks consecutivos en tiempo de inferencia.

El entrenamiento es de imitacion supervisada pura sobre teleoperacion, sin RLHF ni DPO. El dataset (`Fabyo04/so101_cube_v2`) contiene 100 episodios y 47.872 frames grabados a 30 FPS para una unica tarea. La configuracion declarada es de solo 50 pasos de entrenamiento, batch size 32, optimizador AdamW, learning rate 1e-5 y semilla 42. Esa cifra de pasos es extraordinariamente baja para un entrenamiento de ACT, lo que refuerza la interpretacion de que se trata de una ejecucion de prueba del pipeline mas que de un entrenamiento convergido. No se documentan innovaciones adicionales ni variaciones respecto al metodo original.

## Capacidades

- Control manipulativo por vision: genera comandos de accion de 6 grados de libertad a partir de dos vistas de camara y del estado de las articulaciones.
- Ejecucion de una tarea especifica: pick-and-place de un cubo en un cuenco, con la instruccion textual fijada en el momento del rollout.
- Prediccion de chunks de accion con ensamblado temporal, lo que produce trayectorias mas suaves que el control paso a paso.
- Aprendizaje por imitacion a partir de teleoperacion: replica la distribucion de comportamientos presente en el dataset, incluida la variabilidad de las demostraciones.
- No soporta tool calling ni function calling.
- No soporta agentes, planificacion multi-paso ni razonamiento simbolico.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural: el campo `task` es una etiqueta de condicionamiento, no una instruccion interpretada semanticamente.
- No dispone de modo de razonamiento (thinking mode), vision-language, audio ni generacion de texto.

## Casos de uso

- Ejemplo de referencia para aprender el flujo completo de LeRobot: sirve como policy de partida para reproducir un entrenamiento ACT, comparar configuraciones y entender el formato de observaciones y acciones.
- Pick-and-place sobre SO-101 en laboratorio: ejecutar la tarea "coger el cubo y dejarlo en el cuenco" en un banco de pruebas con las camaras `top` y `front` montadas en la misma posicion usada en el dataset.
- Base para fine-tuning con datos propios: al ser Apache 2.0 y estar en formato safetensors, se puede continuar el entrenamiento con un dataset mayor o con variaciones de la tarea (nuevas posiciones, objetos o recipientes).
- Validacion de infraestructura de robotica: comprobar que la cadena de teleoperacion, calibracion, captura de camaras y rollout (`lerobot-rollout`) funciona antes de invertir en un entrenamiento largo.
- Docencia y divulgacion: demostrar en un aula o charla como un transformer de 51,67 millones de parametros puede controlar un brazo real con hardware de bajo coste.
- Investigacion sobre robustez y generalizacion: usar la policy como linea base para medir el efecto de cambios de iluminacion, posicion del objeto o distracciones en una tarea acotada.
- Experimentos de ensamblado temporal: estudiar el efecto del temporal ensembling y de la longitud del chunk en la suavidad y la tasa de exito de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la frase "No evaluation results have been provided for this policy yet", de modo que no existe tasa de exito reportada en robot real, ni numero de ensayos, ni condiciones de evaluacion. Tampoco se aportan metricas de perdida de entrenamiento ni curvas de convergencia.

## Requisitos de hardware

- VRAM estimada: con 51,67 millones de parametros, los pesos ocupan aproximadamente 207 MB en fp32, 103 MB en fp16 y 52 MB en int8. El cuello de botella no es la memoria, sino el procesamiento de dos imagenes de 480x640 por paso.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente en la practica. Una RTX 3060, RTX 4060, RTX 4090 o una NVIDIA A100/H100 sobran ampliamente; las GPU de datacenter no aportan ventaja relevante a esta escala.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en placas integradas tipo Jetson Orin Nano o en CPU.
- Opciones de despliegue: `lerobot-rollout` con PyTorch es la via documentada por el autor. vLLM, TGI y llama.cpp no son aplicables, ya que no soportan este tipo de policy de robotica.
- Latencia y throughput: no disponible. El dataset se grabo a 30 FPS, por lo que ese es el ritmo de control objetivo, pero la model card no reporta latencia de inferencia ni tasa de control efectiva en este repositorio.

## Comparativa con modelos similares

La comparacion se plantea a nivel de metodo, ya que no hay metricas publicadas de esta policy concreta.

| Modelo / metodo | Paradigma | Parametros | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (esta policy) | Imitation learning con transformer y chunks de accion + CVAE | 51,67 M | Dos imagenes 480x640 + estado de 6 dim. | apache-2.0 | HuggingFace, via LeRobot |
| Diffusion Policy | Imitation learning con difusion y horizonte de receding | no disponible | Observaciones visuales y de estado | no disponible | Implementaciones publicas en el ecosistema LeRobot |
| SmolVLA | Policy basada en modelo vision-lenguaje-accion | no disponible | Vision + instruccion en lenguaje | no disponible | HuggingFace, via LeRobot |
| VQ-BeT | Imitation learning con discretizacion de acciones | no disponible | Observaciones visuales y de estado | no disponible | Implementaciones publicas |

Como referencia adicional, dentro del propio ecosistema LeRobot existen otras policies ACT entrenadas para tareas y robots similares; no se dispone de datos comparativos de rendimiento entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenamiento incompleto: 50 pasos con batch 32 es una cifra muy baja para ACT. Es probable que la policy no haya convergido y que la tasa de exito en robot real sea baja o nula.
- Sin evaluacion: no hay ninguna medida de exito publicada, ni en simulacion ni en robot real.
- Especificidad extrema: esta entrenada para una unica tarea, un unico robot (SO-101) y una configuracion concreta de camaras (`top`, `front`). Cambiar la posicion de las camaras, el robot o la tarea invalida la policy.
- Dependencia del entorno: cualquier variacion de iluminacion, fondo, posicion inicial del cubo o del cuenco puede degradar el comportamiento, dado el tamano reducido del dataset (100 episodios, una sola tarea).
- Riesgo de sobreajuste: 47.872 frames sobre una tarea repetitiva favorecen la memorizacion de trayectorias concretas frente a la generalizacion.
- Sin capacidades de lenguaje, razonamiento ni tool calling: no debe emplearse en pipelines de agentes ni en tareas de NLP.
- Alucinacion en sentido estricto no aplica, pero si existe el riesgo equivalente en robotica: el modelo puede generar acciones fisicamente invalidas o inseguras si se sale de la distribucion de entrenamiento.
- Sesgos: el comportamiento refleja los sesgos y la regularidad de las demostraciones teleoperadas del dataset, que no se documentan ni se analizan.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte. El repositorio figura como `_test`, por lo que no hay compromiso de mantenimiento.
- Fechas incoherentes en los metadatos: el repositorio aparece creado y actualizado en 2026-09-28, posterior a la fecha habitual de publicacion de este tipo de artefactos. Conviene verificar la procedencia antes de reutilizarlo.
- Sin descargas ni valoraciones: cero descargas y cero likes, lo que indica que no ha sido validado por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Fabyo04/act_so101_cube_v2_100_test
- Dataset de entrenamiento: https://huggingface.co/datasets/Fabyo04/so101_cube_v2
- Paper de ACT: https://arxiv.org/abs/2304.13705 (referencia en HuggingFace: https://huggingface.co/papers/2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de imitation learning: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Fabyo04/so101_cube_v2

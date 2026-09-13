# khoavucao2511/so101_vla_jepa_LoRA_OpenWM_30k_v3

## Resumen

VLA-JEPA es un modelo de vision-lenguaje-accion (VLA) orientado al control de robots, publicado por el usuario khoavucao2511 bajo el identificador `khoavucao2511/so101_vla_jepa_LoRA_OpenWM_30k_v3`. La arquitectura combina tres componentes: un backbone de lenguaje y vision Qwen3-VL, un modelo de mundo de video auto-supervisado basado en V-JEPA2 y una cabeza de accion DiT entrenada con flow matching. El checkpoint subido al Hub es una adaptacion mediante LoRA entrenada durante 30.000 pasos sobre el robot `so_follower` de la familia SO-101 y distribuida en formato LeRobot.

El modelo resuelve una tarea concreta de manipulacion: coger un bloque verde y depositarlo en un contenedor. Se ha entrenado con el dataset `vasco281204/so101_green_block_36`, compuesto por 200 episodios y 129.045 fotogramas a 30 FPS, con dos camaras de 224x224 píxeles como entrada visual y un vector de estado de 6 dimensiones como entrada propioceptiva. La salida es un vector de accion de 6 dimensiones, lo que corresponde a un brazo robotico de seis grados de libertad.

Su relevancia es doble: por un lado, ilustra la integracion de world models de video (V-JEPA2) con politicas VLA dentro del ecosistema LeRobot; por otro, sirve como referencia reproducible de ajuste fino con LoRA sobre un backbone visual-lenguaje grande. No obstante, es un checkpoint de investigacion con cero descargas y sin resultados de evaluacion publicados en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA con backbone Qwen3-VL, world model de video V-JEPA2 y cabeza de accion DiT con flow matching; ajuste mediante LoRA |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el backbone Qwen3-VL es multilingue, pero no se declara en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tamano del repositorio | 1,3 GB |
| Tipo de robot | `so_follower` (familia SO-101) |
| Camaras declaradas | `top`, `front` (los features de entrada son `observation.images.exterior_1_left` y `observation.images.exterior_2_left`) |
| Dimension de estado | 6 |
| Dimension de accion | 6 |
| Entradas visuales | 2 x (3, 224, 224) |

## Arquitectura y entrenamiento

El modelo sigue el diseno VLA-JEPA descrito en el articulo referenciado en la model card (arXiv 2602.10098). El pipeline combina un backbone Qwen3-VL que procesa las observaciones visuales y las instrucciones en lenguaje natural, un modelo de mundo de video auto-supervisado basado en V-JEPA2 que aprende representaciones predictivas del entorno, y una cabeza de accion DiT que genera trayectorias de accion mediante flow matching. La generacion de acciones es continua y de seis dimensiones, lo que encaja con el control de posicion de un brazo de seis grados de libertad. El nombre del checkpoint indica que el ajuste se realizo con LoRA sobre el backbone, lo que reduce el numero de parametros entrenables y el coste de almacenamiento.

El entrenamiento se ejecuto con LeRobot 0.6.2 durante 30.000 pasos, con tamano de lote 1, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. El dataset de imitacion contiene 200 episodios y 129.045 fotogramas capturados a 30 FPS para dos tareas: "Pick the green block and place it into the container." y "Pick the object and place it into the box.". No se especifica el numero de tokens de entrenamiento del backbone, la composicion completa del dataset ni si se aplicaron fases de RLHF o DPO; al tratarse de aprendizaje por imitacion, el objetivo es la reproduccion de las trayectorias demostradas. La model card no detalla hiperparametros de LoRA (rango, alpha, modulos objetivo) ni el numero de parametros entrenables.

## Capacidades

- Generacion de acciones de control continuo de 6 dimensiones para un brazo robotico `so_follower`.
- Percepcion visual multicamara a partir de dos flujos de imagen de 224x224 píxeles.
- Fusion de observacion visual y estado propioceptivo de 6 dimensiones para producir la politica de actuacion.
- Interpretacion de la instruccion de tarea en lenguaje natural ("Pick the green block and place it into the container.").
- Ejecucion de tareas de manipulacion del tipo pick-and-place sobre objetos rigidos.
- Inferencia integrada en el ecosistema LeRobot mediante la CLI `lerobot-rollout` con estrategia `base`.
- Modelo de mundo de video (V-JEPA2) para representaciones predictivas del entorno, segun la descripcion del metodo.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision-lenguaje generalista, audio ni modo de razonamiento explicito, ya que se trata de una politica robotica y no de un asistente conversacional.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: el modelo ejecuta la tarea de coger el bloque verde y depositarlo en el contenedor sobre un SO-101 real, usando dos camaras y el estado del brazo. Es su escenario de entrenamiento directo.
- Recogida y clasificacion de objetos rigidos: con el segundo enunciado del dataset ("Pick the object and place it into the box"), se puede emplear en tareas de recogida de piezas pequenas en lineas de montaje de baja cadencia.
- Banco de pruebas para investigacion en VLA: sirve como referencia reproducible para comparar estrategias de ajuste con LoRA sobre backbones Qwen3-VL en tareas de robotica.
- Validacion de world models en robotica: permite experimentar con la contribucion de un modelo de mundo de video (V-JEPA2) sobre el rendimiento de una politica de imitacion.
- Generacion de datos sinteticos de demostracion: la politica puede usarse para producir trayectorias iniciales que luego se refinan mediante teleoperacion, acelerando nuevas recogidas de datos.
- Prototipado educativo con LeRobot: al seguir el flujo estandar de LeRobot (`lerobot-rollout` y `lerobot-train`), es util en cursos y talleres de aprendizaje por imitacion con hardware de bajo coste.
- Despliegue en celda robotica controlada: en entornos con iluminacion estable y posiciones de objeto acotadas, puede integrarse como politica de agarre dentro de un pipeline mayor gestionado por un planificador externo.
- Evaluacion comparativa de cabezas de accion: la cabeza DiT con flow matching puede aislarse para estudiar alternativas de modelado de acciones continuas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la frase "No evaluation results have been provided for this policy yet.", por lo que no existen tasas de exito en robot real para las tareas de pick-and-place. Tampoco se proporcionan metricas de perdida de entrenamiento, curvas de aprendizaje ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. El repositorio ocupa 1,3 GB, lo que sugiere adaptadores LoRA mas componentes auxiliares en lugar de pesos completos en precision alta; el consumo real depende del tamano del backbone Qwen3-VL, que no se declara.
- Estimacion orientativa (no confirmada por el autor): si el backbone se situa en el rango de 2B a 4B parametros, la inferencia en precision reducida cabria en GPU de consumo con 12-16 GB de VRAM; con backbones de 7B-8B serian necesarios 16-24 GB.
- GPU recomendadas: no disponibles. Como referencia de categoria, las politicas VLA de este tipo se ejecutan habitualmente en RTX 3090, RTX 4090, A100 o H100, sin que el autor confirme ninguna de ellas.
- Cabe en GPU de consumo: probablemente si, en funcion del backbone y de la cuantizacion aplicada, pero no hay confirmacion en la informacion proporcionada.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout --strategy.type=base` es el metodo documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que en general no estan orientados a politicas VLA de control continuo.
- Latencia y throughput: no disponibles. El dataset se capturo a 30 FPS, pero no se indica la frecuencia de control efectiva en tiempo de inferencia ni el tiempo por paso.
- Entrenamiento: la configuracion declarada usa `--policy.device=cuda`, con tamano de lote 1; no se especifica el modelo de GPU empleado ni el tiempo total de entrenamiento.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_vla_jepa_LoRA_OpenWM_30k_v3 | VLA robotico (Qwen3-VL + V-JEPA2 + DiT) | no disponible | no disponible | apache-2.0 | HuggingFace, libreria LeRobot |
| SmolVLA (HuggingFace) | VLA robotico compacto para LeRobot | no disponible en esta informacion | no disponible | no disponible en esta informacion | HuggingFace, LeRobot |
| OpenVLA | VLA robotico de proposito general | no disponible en esta informacion | no disponible | no disponible en esta informacion | HuggingFace |
| pi0 / pi0.5 (Physical Intelligence) | VLA robotico con flow matching | no disponible en esta informacion | no disponible | no disponible en esta informacion | HuggingFace |
| GR00T N1 (NVIDIA) | VLA robotico con modelo de mundo | no disponible en esta informacion | no disponible | no disponible en esta informacion | HuggingFace |

Los datos de los modelos alternativos no estaban incluidos en la informacion proporcionada, por lo que se marcan como no disponibles; deben verificarse en sus respectivas model cards. La busqueda web realizada no devolvio ningun resultado relacionado con estos modelos ni con VLA-JEPA, por lo que no se pudo completar la comparativa con fuentes adicionales.

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados: se desconoce la tasa de exito real en la tarea de pick-and-place.
- Alcance muy restringido: el entrenamiento se limita a dos tareas de colocacion sobre objetos concretos; es previsible un mal rendimiento ante objetos, posiciones o iluminacion distintos a los del dataset.
- Discrepancia en la model card: se declaran las camaras `top` y `front`, pero los features de entrada son `observation.images.exterior_1_left` y `observation.images.exterior_2_left`. Los nombres de camara en el despliegue deben coincidir exactamente con las claves de observacion usadas en el entrenamiento, lo que puede provocar fallos de ejecucion si no se verifica.
- Sobreajuste probable al entorno de recogida: con 200 episodios y 30.000 pasos, la generalizacion a variaciones de fondo, color o posicion inicial no esta garantizada.
- Metadatos incompletos: no se publican parametros totales, contexto, cuantizaciones soportadas, idiomas ni detalles de la LoRA (rango, modulos objetivo, parametros entrenables).
- Sesgos: no se documenta ningun analisis de sesgo. Al tratarse de una politica robotica, los sesgos se manifiestan como preferencias de trayectoria heredadas de las demostraciones humanas.
- Riesgo de alucinacion: en sentido estricto, el modelo no genera texto libre, pero si puede producir acciones fisicamente invalidas o inseguras cuando la observacion queda fuera de la distribucion de entrenamiento. Es imprescindible aplicar limites de par de fuerzas, espacios de trabajo y paradas de emergencia.
- Licencia: apache-2.0 permite uso comercial, pero el autor no aporta garantias ni soporte; hay que verificar ademas las condiciones del backbone Qwen3-VL y del world model V-JEPA2 subyacentes.
- Cero adopcion y cero validacion externa: el repositorio registra 0 descargas y 0 "likes", por lo que no existe evidencia de replicacion independiente.
- Reproducibilidad: la semilla indicada es 1000 y la version de LeRobot es 0.6.2; cambios de version pueden alterar el comportamiento de la politica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/khoavucao2511/so101_vla_jepa_LoRA_OpenWM_30k_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/vasco281204/so101_green_block_36
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vasco281204/so101_green_block_36
- Articulo VLA-JEPA: https://arxiv.org/abs/2602.10098
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de vla_jepa en LeRobot: https://huggingface.co/docs/lerobot/main/en/vla_jepa
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de recogida de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

# HyeonseokE/smolvla_ablation2_turn_off_lever_A3_1000_10fps

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por el equipo de Hugging Face en el marco del proyecto LeRobot, y esta ficha describe un ajuste fino concreto: `HyeonseokE/smolvla_ablation2_turn_off_lever_A3_1000_10fps`, publicado por el usuario HyeonseokE. Se trata de una politica robotica de imitacion derivada de `lerobot/smolvla_base`, entrenada para una unica tarea de manipulacion: apagar una palanca hasta que el indicador de estado se ponga en rojo. Resuelve el problema de ejecutar una habilidad motora concreta en un robot real (tipo `so101_follower`) a partir de observaciones visuales y del estado articular, sin necesidad de planificacion simbolica ni de modelos de gran tamano.

El modelo tiene 450.046.176 parametros (aproximadamente 450 millones) segun los pesos en safetensors, con un repositorio de 0,9 GB, lo que indica pesos almacenados en precision de 16 bits. La arquitectura es la de SmolVLA, un VLA compacto que combina un backbone de vision-lenguaje con un modulo generador de acciones, descrito en el paper arXiv:2506.01844. Su relevancia actual radica en que demuestra que politicas de robotica basada en aprendizaje por imitacion pueden entrenarse y desplegarse en hardware de consumo, en lugar de requerir GPU de centro de datos.

Este repositorio concreto parece formar parte de un estudio de ablacion ("ablation2"), por lo que su interes es fundamentalmente experimental y de reproducibilidad: no se ha publicado ninguna evaluacion en robot real y no se declaran idiomas soportados ni variantes de cuantizacion. La licencia es Apache 2.0, lo que permite uso comercial con las obligaciones habituales de atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta; backbone de vision-lenguaje mas modulo de prediccion de acciones (detalles en arXiv:2506.01844) |
| Parametros totales | 450.046.176 (segun safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje conversacional, la ventana de observacion viene fijada por las entradas de la politica (3 imagenes de 3x256x256 y un vector de estado de dimension 6) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible (no declarados; es una politica robotica, no un modelo de dialogo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tamano del repositorio | 0,9 GB |
| Tipo de robot | `so101_follower` |
| Camaras declaradas | `top`, `left_wrist` (la tabla de entradas del model card lista `camera1`, `camera2`, `camera3`) |
| Entradas | `observation.state` (6,), `observation.images.camera1/2/3` (3, 256, 256) |
| Salidas | `action` (6,), `action.radian_urdf0` (6,) |
| Modelo base | `lerobot/smolvla_base` |
| Dataset de entrenamiento | `HyeonseokE/ablation2_turn_off_lever_A3_10fps` |
| Pasos de entrenamiento | 16.850 |
| Batch size | 64 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.0 |

## Arquitectura y entrenamiento

SmolVLA es una politica VLA compacta: procesa observaciones multimodales (imagenes de camaras y estado proprioceptivo del robot) y emite directamente un vector de accion de 6 dimensiones, mas una salida auxiliar `action.radian_urdf0` de la misma dimension. El model card describe el modelo como "compacto y eficiente, con rendimiento competitivo a coste computacional reducido y desplegable en hardware de consumo", y remite al paper arXiv:2506.01844 para los detalles de diseno. La informacion proporcionada no incluye el desglose interno del backbone de vision-lenguaje ni del modulo de acciones, ni el numero de tokens de entrenamiento del preentrenamiento original.

El ajuste fino de este repositorio se realizo con LeRobot 0.6.0 sobre el dataset `HyeonseokE/ablation2_turn_off_lever_A3_10fps`, compuesto por 100 episodios y 21.595 fotogramas grabados a 10 FPS, con una unica instruccion de tarea: "Turn the lever off; the status indicator should turn red." El entrenamiento duro 16.850 pasos con batch de 64, AdamW y tasa de aprendizaje 1e-4, partiendo de `lerobot/smolvla_base`. No se documentan fases de RLHF, DPO ni aprendizaje por refuerzo: el paradigma es aprendizaje por imitacion supervisado sobre demostraciones de teleoperacion. Tampoco se describen innovaciones tecnicas adicionales especificas de este ajuste (por ejemplo, decodificacion especulativa o atencion lineal) en la informacion disponible.

## Capacidades

- Generacion de acciones motoras: produce comandos de 6 grados de libertad para un robot `so101_follower` a partir de imagenes y estado articular.
- Condicionamiento por lenguaje: acepta una instruccion textual de tarea ("Turn the lever off; the status indicator should turn red.") que guia la politica.
- Percepcion visual multi-camara: consume tres flujos de imagen de 3x256x256 (segun la tabla de entradas), lo que permite combinar vista cenital y de muneca.
- Control reactivo a 10 FPS: la politica se entreno con datos capturados a esa frecuencia, coherente con bucles de control de baja latencia.
- Ejecucion de una habilidad especifica: apagar una palanca hasta que el indicador de estado cambie a rojo.
- Integracion con el ecosistema LeRobot: ejecutable mediante `lerobot-rollout` y reentrenable con `lerobot-train`.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso, agentes, dialogo multilingue, vision general de proposito abierto, audio ni modo "thinking". Es una politica robotica de tarea unica, no un asistente de proposito general.

## Casos de uso

- Automatizacion de una celda robotica concreta: el modelo puede accionar la palanca de un panel hasta que el indicador pase a rojo, integrándose en una linea de pruebas donde ese gesto forme parte de una secuencia de apagado de emergencia o de mantenimiento.
- Estudio de ablacion reproducible: el nombre del repositorio y la semilla fija (1000) sugieren que forma parte de una comparativa controlada; sirve para medir el efecto de variantes de datos, frecuencia de muestreo o configuracion de entrenamiento sobre la tasa de exito.
- Punto de partida para ajuste fino en una tarea similar: al derivar de `lerobot/smolvla_base` y ocupar menos de 1 GB, es un candidato comodo para reentrenar con un dataset propio de pocos centenares de episodios usando `lerobot-train`.
- Investigacion en aprendizaje por imitacion con presupuesto limitado: permite ejecutar experimentos de VLA en una GPU de consumo, reduciendo el coste por iteracion frente a politicas de 7.000 millones de parametros.
- Docencia y formacion en robotica: el flujo `lerobot-rollout` con una tarea textual explicita facilita demostraciones en aula o laboratorio sobre como se despliega una politica de imitacion.
- Recogida de datos y evaluacion comparativa: puede usarse como politica de referencia para comparar contra otras variantes de la misma ablacion sobre el mismo dataset de 100 episodios y 21.595 fotogramas.
- Validacion de pipelines de despliegue en el borde: al caber en GPU de consumo, es util para probar arquitecturas de inferencia local (por ejemplo, estaciones de trabajo con una sola GPU junto al robot) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card indica explicitamente: "No evaluation results have been provided for this policy yet", por lo que no existen tasas de exito en robot real, numero de ensayos ni condiciones de evaluacion (posiciones de objeto, iluminacion, distracciones) para este ajuste concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 0,9 GB en precision de 16 bits (450 millones de parametros), por lo que el modelo cabe holgadamente en GPUs con 4-6 GB de VRAM una vez sumadas activaciones y buffers de las tres camaras a 256x256.
- GPU recomendadas: cualquier GPU moderna con al menos 6 GB de VRAM; RTX 3060, RTX 4060, RTX 4090 y superiores son suficientes. No se requiere A100 ni H100.
- Cabe en GPU de consumo: si. El propio model card destaca que el modelo esta pensado para hardware de consumo.
- Opciones de despliegue: el flujo oficial es LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento). No se documentan en la informacion disponible integraciones con vLLM, TGI, llama.cpp u Ollama, que ademas no son el formato natural de despliegue de una politica VLA.
- Latencia y throughput: no disponibles. La unica referencia temporal es que los datos de entrenamiento se capturaron a 10 FPS, lo que sugiere un bucle de control compatible con esa frecuencia, pero no se publican mediciones de latencia.
- Requisitos adicionales: el despliegue real necesita un robot `so101_follower` calibrado, su puerto serie y camaras configuradas con nombres de observacion coincidentes con los del entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| `HyeonseokE/smolvla_ablation2_turn_off_lever_A3_1000_10fps` | 450 M | 3 imagenes 3x256x256 + estado (6,) | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| `lerobot/smolvla_base` | 450 M (misma familia) | igual que el anterior | Apache 2.0 (segun repositorio base) | Hugging Face; modelo base del ajuste |
| OpenVLA (7B) | ~7.000 M | vision-lenguaje-accion | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Politicas tipo pi0 | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

La comparacion cuantitativa de rendimiento no es posible: este repositorio no publica evaluacion, y la informacion proporcionada no incluye resultados de los modelos alternativos. La diferencia principal frente a propuestas de mayor tamano es el coste: 450 millones de parametros y menos de 1 GB de pesos permiten inferencia en GPU de consumo, a cambio de una especializacion total en una unica tarea.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta entrenado exclusivamente para la tarea "Turn the lever off; the status indicator should turn red." sobre un robot `so101_follower`. Fuera de esa tarea y de esa morfologia no cabe esperar un comportamiento util.
- Sin evaluacion publicada: no hay tasas de exito ni numero de ensayos, por lo que se desconoce su robustez real ante cambios de posicion, iluminacion, fondo o desgaste mecanico.
- Riesgo de fallo silencioso y de sobreajuste a las condiciones de recogida de datos: al provenir de 100 episodios y 21.595 fotogramas de un unico montaje, la politica puede no generalizar a otras colocaciones de camara o del objeto.
- Discrepancia en la configuracion de camaras: el model card declara las camaras `top` y `left_wrist`, mientras que la tabla de entradas lista `camera1`, `camera2` y `camera3`. Hay que verificar los nombres de observacion exactos antes de desplegar, ya que una discrepancia de claves impide la inferencia.
- Sin datos de sesgo ni de idioma: no se declaran idiomas soportados ni evaluaciones de sesgo. La instruccion de tarea esta en ingles y el modelo no es un sistema de dialogo.
- Sin cuantizaciones publicadas: no hay variantes GGUF, AWQ o GPTQ; solo safetensors para LeRobot.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero obliga a conservar avisos de copyright y licencia, e incluir el texto de la licencia en las redistribuciones. Conviene revisar tambien la licencia y los terminos del modelo base `lerobot/smolvla_base`.
- Fecha de creacion poco habitual en los metadatos (2026-09-13), lo que sugiere que la informacion de la ficha puede haberse generado o migrado de forma automatica; conviene validar el repositorio antes de usarlo en produccion.
- Madurez minima: 0 descargas y 0 likes en el momento de la consulta, sin demo grabada ni resultados de robot real.
- Uso en produccion: al tratarse de un modelo que controla hardware fisico, cualquier despliegue requiere limites de par, paradas de emergencia y supervision humana, ademas de una validacion propia de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_ablation2_turn_off_lever_A3_1000_10fps
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/ablation2_turn_off_lever_A3_10fps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/ablation2_turn_off_lever_A3_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Imagen de arquitectura citada en el model card: https://cdn-uploads.huggingface.co/production/uploads/640e21ef3c82bd463ee5a76d/aooU0a3DMtYmy_1IWMaIM.png

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo. Los unicos enlaces obtenidos correspondian a un hotel en Liguria y no guardan relacion con esta ficha, por lo que se han descartado.

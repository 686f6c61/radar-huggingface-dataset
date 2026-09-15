# MrC4t/xvla_bi_so_bin

## Resumen

X-VLA (xvla_bi_so_bin) es una politica robotica de tipo Vision-Language-Action (VLA) publicada por el usuario MrC4t en Hugging Face, afinada a partir del modelo base lerobot/xvla-base. Se trata del resultado de un ajuste fino supervisado sobre un unico conjunto de demostraciones de teleoperacion (MrC4t/bi_so_bin, 10 episodios y 15.780 fotogramas a 30 FPS, equivalentes a unos 8,8 minutos de datos) para una unica tarea: "put the objects in the bin". El modelo consume tres flujos de imagen (256x256, 256x256 y 224x224), un vector de estado de 8 dimensiones, y produce un vector de accion de 12 dimensiones, todo ello sobre un robot de tipo `bi_so_follower`.

El interes tecnico del modelo no esta en su rendimiento demostrado, que no se ha publicado, sino en el marco X-VLA que hereda: un framework de flow matching con soft prompts aprendibles en el que cada robot o configuracion de hardware se codifica como una "tarea" mediante un pequeno conjunto de embeddings de prompt, lo que permite que un unico modelo reconcilie morfologias, sensores y espacios de accion distintos. Con 879.687.256 parametros (aproximadamente 880 millones) y 1,8 GB de repositorio en safetensors, es un modelo de escala contenida, desplegable en GPU de consumo para inferencia.

Es relevante ahora porque forma parte del ecosistema LeRobot de Hugging Face, que estandariza el entrenamiento y el despliegue de politicas de imitacion, y porque sirve como ejemplo reproducible de ajuste fino de X-VLA sobre hardware accesible. Su utilidad practica inmediata es como punto de partida para transfer learning en tareas de pick-and-place, no como politica lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | X-VLA: Vision-Language-Action con flow matching y soft prompts aprendibles (segun la model card y el paper arXiv:2510.10274) |
| Parametros totales | 879.687.256 (dato real de los pesos safetensors) |
| Parametros activos | No aplica (no se describe como modelo MoE en la informacion disponible) |
| Longitud de contexto | No disponible (politica visuomotora; no se documenta ventana de contexto) |
| Tipos de cuantizacion | No disponible (el repositorio distribuye pesos en safetensors; no se especifica la precision de entrenamiento ni cuantizaciones soportadas) |
| Idiomas soportados | No disponible. La unica instruccion documentada es la cadena de tarea en ingles "put the objects in the bin" |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de pipeline | robotics |
| Modelo base | lerobot/xvla-base (finetune) |
| Robot objetivo | `bi_so_follower` |
| Camaras | `head`, `left_wrist`, `right_wrist` |
| Entradas | `observation.images.image` (3,256,256), `observation.images.image2` (3,256,256), `observation.images.image3` (3,224,224), `observation.state` (8,) |
| Salidas | `action` (12,) |
| Tamano del repositorio | 1,8 GB |
| Dataset de entrenamiento | MrC4t/bi_so_bin: 10 episodios, 15.780 fotogramas, 30 FPS, tarea "put the objects in the bin" |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | xvla-adamw |
| Learning rate | 0,0001 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

X-VLA es un framework Vision-Language-Action con flow matching y soft prompting. La idea central es tratar cada configuracion robotica (morfologia, conjunto de sensores y espacio de acciones) como una tarea distinta, codificada mediante un conjunto reducido de embeddings de Soft Prompt aprendibles. De este modo, un unico modelo puede acomodar robots con diferentes grados de libertad y camaras sin necesidad de cabezas de salida especificas por plataforma. La generacion de acciones se formula como un problema de flow matching, es decir, se aprende un campo vectorial que transporta una distribucion simple hasta la distribucion de acciones expertas, en lugar de una regresion directa de la accion.

El ajuste fino de este checkpoint concreto se realizo con LeRobot 0.6.2 sobre el dataset MrC4t/bi_so_bin durante 20.000 pasos, con batch size 8, learning rate 0,0001, semilla 1000 y el optimizador denominado xvla-adamw. El corpus de entrenamiento es muy reducido: 10 episodios y 15.780 fotogramas a 30 FPS, lo que equivale a unos 526 segundos de demostraciones reales. No se documenta en la informacion disponible el numero de tokens o muestras vistas, la composicion del dataset mas alla del propio conjunto, ni si hubo etapas de RLHF, DPO u optimizacion por preferencias; el procedimiento descrito corresponde a aprendizaje por imitacion sobre el modelo base preentrenado.

No se documentan innovaciones adicionales especificas de este checkpoint (decodificacion especulativa, atencion lineal u otras) mas alla de las propias del marco X-VLA descrito en el paper.

## Capacidades

- Generacion de acciones motoras: produce un vector de accion continuo de 12 dimensiones a partir de observaciones visuales y de estado.
- Percepcion multimodal: procesa tres camaras simultaneas (dos a 256x256 y una a 224x224) mas un vector de estado de 8 dimensiones.
- Ejecucion de una tarea concreta de manipulacion: recoger objetos y depositarlos en un contenedor ("put the objects in the bin") sobre un robot `bi_so_follower`.
- Condicionamiento por instruccion de tarea: el comando se pasa como cadena de texto en el CLI (`--task`), aunque no se documenta variabilidad de instrucciones ni comprension linguistica general.
- Transfer learning: al derivar de lerobot/xvla-base, esta pensado para ser reentrenado con nuevos datasets propios mediante `lerobot-train`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, planificacion multi-paso, razonamiento simbolico ni memoria de episodios previos.
- No se documenta capacidad multilingue. La unica instruccion registrada esta en ingles.
- No se documentan capacidades de audio, vision generativa, thinking mode ni salida de texto libre.

## Casos de uso

- Transfer learning para nuevas tareas de pick-and-place: el uso mas realista es partir de este checkpoint (o directamente de lerobot/xvla-base) y reentrenar con un dataset propio de mayor tamano. El modelo ya ha superado una fase de ajuste al dominio de manipulacion, lo que reduce el numero de pasos necesarios frente a entrenar desde cero.
- Recogida automatizada de piezas en una celula robotizada de laboratorio: con las tres camaras (`head`, `left_wrist`, `right_wrist`) y el robot `bi_so_follower`, el modelo puede ejecutar la secuencia de recogida y deposito en un contenedor en un entorno controlado. Es adecuado como demostrador, no como solucion industrial.
- Banco de pruebas para comparar algoritmos VLA: al estar integrado en LeRobot y tener una configuracion de entrenamiento completamente documentada, sirve para reproducir experimentos y comparar X-VLA frente a otras politicas sobre el mismo dataset y hardware.
- Generacion de nuevos datos por rollout: con `lerobot-rollout` se pueden ejecutar episodios autonomos que sirvan de base para evaluar la politica o para inicializar procesos de aprendizaje por refuerzo con intervencion humana.
- Clasificacion y ordenado en logistica ligera (kitting): la tarea de depositar objetos en un contenedor es directamente aplicable a la preparacion de kits en un puesto de trabajo, siempre que las posiciones de los objetos y la iluminacion se mantengan dentro de la distribucion de entrenamiento.
- Prototipado rapido en investigacion academica: permite a un grupo con una GPU de consumo validar el pipeline completo de entrenamiento y despliegue de X-VLA sin acceso a clústeres grandes, gracias a los 880 millones de parametros del modelo.
- Validacion de hardware y calibracion de camaras: el modelo exige que los nombres y el orden de las features de observacion coincidan con los del entrenamiento, por lo que resulta util como prueba de integracion del montaje fisico y de la configuracion de sensores.
- Demostraciones educativas de imitacion robotica: es un ejemplo autocontenido para explicar el flujo de datos, el formato de acciones y el ciclo de control en un curso de robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet". No hay tasas de exito en robot real, ni resultados en MMLU, HumanEval, GSM8K, LIBERO, CALVIN u otros conjuntos de evaluacion de politicas roboticas. Tampoco se proporcionan metricas de perdida de entrenamiento ni curvas de aprendizaje.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,76 GB en bf16/fp16 (879,7 M de parametros x 2 bytes) y unos 3,52 GB en fp32. Estas cifras son calculos derivados del numero de parametros, no datos publicados.
- VRAM estimada para inferencia real: entre 4 y 8 GB, sumando a los pesos las activaciones de los tres flujos de imagen, el buffer de estado y el coste del bucle de inferencia. Estimacion orientativa, no medida publicada.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM deberia ser suficiente para inferencia en precision reducida. Candidatas razonables: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G. Las GPU de centro de datos (A100, H100) solo aportarian ventaja en entrenamiento o en despliegues con muchos entornos en paralelo.
- Cabe en GPU de consumo: si, con alta probabilidad, dado el tamano del modelo. El factor limitante no sera la VRAM sino el numero de camaras y la latencia del bus de conexion con el robot.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion y `lerobot-train` para reentrenamiento) sobre PyTorch con CUDA. vLLM, TGI, llama.cpp y Ollama no son aplicables, ya que el modelo no genera texto sino vectores de accion.
- Latencia y throughput: no se publican mediciones. El dataset se grabo a 30 FPS, lo que implica que la frecuencia de control de referencia de los datos es de aproximadamente 33 ms por paso; el coste real de inferencia de la politica no esta documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MrC4t/xvla_bi_so_bin | 879.687.256 (dato de safetensors) | No disponible | Sin resultados de evaluacion publicados | apache-2.0 | Hugging Face, libreria `lerobot` |
| lerobot/xvla-base | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada | Hugging Face |
| Otros modelos VLA de la misma categoria (OpenVLA, pi0, GR00T N1, ACT) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

La comparacion cuantitativa con alternativas de la misma categoria no es posible con los datos suministrados: no se han facilitado especificaciones ni resultados de otros modelos VLA, y este checkpoint carece de evaluacion publicada. La unica relacion documentada es de dependencia, no de competencia, con lerobot/xvla-base.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasas de exito en robot real, ni numero de ensayos, ni condiciones de prueba. No es posible afirmar que la politica funcione de forma consistente.
- Dataset minimo: 10 episodios y 15.780 fotogramas (unos 8,8 minutos de datos). Es un volumen muy bajo, con riesgo alto de sobreajuste y de fallo ante cambios de posicion de objetos, iluminacion, fondo o presencia de distractores.
- Unica tarea y unica instruccion: el modelo se entreno con la cadena "put the objects in the bin". No hay evidencia de generalizacion a otras instrucciones ni a variaciones de la tarea.
- Acoplamiento estricto al hardware: la politica espera el tipo de robot `bi_so_follower`, tres camaras concretas y un vector de estado de 8 dimensiones. Los nombres de camara en el CLI deben coincidir exactamente con las claves de observacion del entrenamiento; cualquier discrepancia en el orden o el nombre de las features invalida la inferencia.
- Mapeo de camaras no documentado: la model card lista las camaras (`head`, `left_wrist`, `right_wrist`) y las features de imagen (`image`, `image2`, `image3`) por separado, sin indicar que clave corresponde a cada camara.
- Idiomas: no se declara soporte multilingue ni lista de idiomas. La instruccion de tarea esta en ingles.
- Sesgos: no se documentan analisis de sesgo. En el ambito de la robotica, el sesgo relevante es el de las demostraciones (posiciones, objetos y condiciones concretas del entorno de grabacion), que condicionan el comportamiento aprendido.
- Riesgo de alucinacion: no aplica en el sentido textual, pero si existe el riesgo equivalente de generar trayectorias de accion no fundamentadas en la observacion cuando el escenario se aleja de la distribucion de entrenamiento, con posible contacto fisico no deseado.
- Licencia: los pesos se publican bajo apache-2.0, lo que permite uso comercial. No se especifica la licencia del dataset de entrenamiento MrC4t/bi_so_bin ni la del modelo base lerobot/xvla-base en la informacion disponible, por lo que conviene verificarlas antes de un uso comercial.
- Seguridad en produccion: no hay evaluacion de seguridad, limites de par, ni protocolos de parada. No debe desplegarse sobre hardware real sin supervisión y mecanismos de seguridad externos.
- Trazabilidad: el repositorio tiene cero descargas y cero "likes", y no se documenta mantenimiento posterior a su publicacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MrC4t/xvla_bi_so_bin
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Paper de X-VLA: https://huggingface.co/papers/2510.10274
- Paper en arXiv: https://arxiv.org/abs/2510.10274
- Dataset de entrenamiento: https://huggingface.co/datasets/MrC4t/bi_so_bin
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MrC4t/bi_so_bin
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de X-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

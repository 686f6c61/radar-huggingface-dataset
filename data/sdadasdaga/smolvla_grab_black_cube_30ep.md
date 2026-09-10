# sdadasdaga/smolvla_grab_black_cube_30ep

## Resumen

smolvla_grab_black_cube_30ep es una política robótica de tipo vision-language-action (VLA) publicada por el usuario sdadasdaga en Hugging Face. Se trata de un fine-tuning de lerobot/smolvla_base, el modelo compacto de robótica de Hugging Face presentado en el artículo arXiv:2506.01844, y ha sido entrenada con la librería LeRobot 0.6.0 sobre un único conjunto de datos propio: 30 episodios y 13.919 fotogramas grabados a 30 FPS para una sola tarea, "Grab the black cube".

El modelo tiene 450.046.176 parámetros (unos 450 M), pesa 0,9 GB en el repositorio y se distribuye en formato safetensors bajo licencia apache-2.0. Está pensado para un brazo seguidor de tipo `so_follower` (familia SO-100/SO-101) con lectura de estado de 6 dimensiones y salida de acciones también de 6 dimensiones, alimentado por tres cámaras de 256x256 y una cuarta de 480x640.

Su relevancia es doble. Por un lado, demuestra que un VLA puede entrenarse y desplegarse en hardware de consumo, algo fuera del alcance de alternativas de 7.000 millones de parámetros como OpenVLA. Por otro, conviene ser explícito: se trata de un artefacto de investigación de un solo autor, con cero descargas, cero valoraciones y sin ninguna evaluación publicada, por lo que no debe considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) densa, basada en SmolVLA (arXiv:2506.01844) |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible (la instrucción de tarea del dataset esta en ingles: "Grab the black cube") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot), repositorio de 0,9 GB |
| Modelo base | lerobot/smolvla_base (fine-tuning) |
| Tipo de robot | so_follower (brazo seguidor SO-100/SO-101) |
| Camaras declaradas | wrist, overhead; en la practica, 3 camaras a 256x256 y 1 a 480x640 |
| Dimension de estado | 6 |
| Dimension de accion | 6 |
| Pipeline | robotics |
| Descargas / valoraciones | 0 / 0 |
| Fecha de publicacion | 2026-09-10 |

Tabla de entradas y salidas declaradas en la model card:

| Feature | Tipo | Forma |
|---|---|---|
| observation.state | STATE | (6,) |
| observation.images.camera1 | VISUAL | (3, 256, 256) |
| observation.images.camera2 | VISUAL | (3, 256, 256) |
| observation.images.camera3 | VISUAL | (3, 256, 256) |
| observation.images.empty_camera_0 | VISUAL | (3, 480, 640) |
| action | ACTION | (6,) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de lerobot/smolvla_base, no un entrenamiento desde cero. La arquitectura subyacente corresponde a SmolVLA, un VLA compacto que combina percepcion visual, condicionamiento por instruccion en lenguaje natural y generacion de acciones motoras, disenado explicitamente para reducir el coste computacional y poder ejecutarse en hardware de consumo. Los detalles de composicion interna del backbone (codificador visual, modelo de lenguaje y cabecera de acciones) no estan desglosados en la informacion disponible de este repositorio; corresponden al articulo del modelo base.

El entrenamiento se realizo con LeRobot 0.6.0 y estos hiperparametros: 100.000 pasos, tamano de lote 1, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. El conjunto de datos es sdadasdaga/grab-black-cube-act-30ep_20260908_205154, con 30 episodios, 13.919 fotogramas a 30 FPS y una unica tarea anotada. No se documenta ninguna fase de RLHF, DPO ni ajuste por preferencias humanas, algo esperable en imitacion robotica. Tampoco se documentan tecnicas de decodificacion especulativa ni de atencion lineal especificas de este fine-tuning.

Un detalle tecnico llamativo es la presencia de la caracteristica `observation.images.empty_camera_0` a resolucion 480x640 junto a tres camaras de 256x256. El nombre sugiere una camara de relleno o mal configurada durante la grabacion, lo que puede afectar a la reproducibilidad del despliegue si no se replica exactamente la misma configuracion de entradas.

## Capacidades

- Generacion de acciones de manipulacion de 6 dimensiones para un brazo `so_follower`, a partir de estado articular y flujo visual.
- Percepcion visual multicamara: consume tres vistas de 256x256 mas una vista adicional de 480x640.
- Condicionamiento por instruccion textual: acepta un campo `task`, aunque en este fine-tuning solo se ha entrenado con la frase "Grab the black cube".
- Ejecucion de una tarea de agarre (pick) sobre un objeto concreto (cubo negro), presumiblemente en posiciones y condiciones similares a las del dataset.
- Despliegue en hardware de consumo gracias a sus 450 M de parametros.
- Integracion nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, tool calling, function calling, capacidades de agente ni modo de pensamiento: no es un modelo de lenguaje, es una politica motora.
- No se documentan capacidades de audio, vision general de proposito abierto ni multilinguesimo.

## Casos de uso

- Reproduccion de la tarea entrenada en un banco de pruebas: el escenario natural es un SO-100/SO-101 con las mismas camaras y la instruccion "Grab the black cube"; el modelo genera las 6 dimensiones de accion a partir del estado y las imagenes.
- Punto de partida para fine-tuning de nuevas tareas de agarre: la propia model card documenta el flujo `lerobot-train --policy.path=lerobot/smolvla_base`; este repositorio sirve como referencia de configuracion (100.000 pasos, lote 1, lr 1e-4) para tareas propias.
- Docencia y practicas de aprendizaje por imitacion: al ser un VLA de 450 M y 0,9 GB, un aula con GPU de gama media puede entrenar y desplegar el ciclo completo grabar-calibrar-entrenar-desplegar.
- Comparativa de algoritmos de imitacion: se puede contrastar esta politica VLA contra ACT o Diffusion Policy sobre el mismo dataset de 30 episodios y la misma tarea, midiendo tasa de exito real por ensayos.
- Validacion de pipelines de LeRobot y del formato de datasets: util para verificar la cadena de grabacion a 30 FPS, la calibracion de camaras y la coherencia de las claves de observacion antes de invertir en datasets mayores.
- Prototipado de demostraciones grabables: el comando `lerobot-rollout` permite ejecutar la politica durante 60 segundos sin grabar episodios, un modo util para comprobar si el agarre funciona antes de producir un video de demostracion.
- Base para estudiar sobreajuste con pocos datos: 30 episodios de una sola tarea son un caso de estudio claro para medir cuanta generalizacion posicional y de iluminacion se pierde frente a datasets de mas episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye literalmente el marcador "No evaluation results have been provided for this policy yet", sin tabla de ensayos, tasa de exito ni numero de repeticiones.

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 1 GB en bf16/fp16 para los 450 M de parametros, mas activaciones y buffers de imagen; en la practica, un entorno de 2 a 4 GB es suficiente. En fp32 serian unos 1,8 GB solo de pesos.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. Cabe holgadamente en RTX 3050, RTX 3060, RTX 4060, RTX 4090, L4, A100 o H100; en estas ultimas no se aprovecha la capacidad de computo, ya que el cuello de botella es el bucle de control del robot, no la GPU.
- Cabe en GPU de consumo: si, es uno de los puntos fuertes declarados del modelo base. Tambien es viable en CPU (PyTorch), aunque con latencia mucho mayor y probablemente incompatible con un bucle de control a 30 FPS.
- Opciones de despliegue: CLI `lerobot-rollout` con `--policy.path=sdadasdaga/smolvla_grab_black_cube_30ep`, sobre PyTorch; entrenamiento con `lerobot-train`. No aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponible. No se publican mediciones de frecuencia de inferencia ni de tiempo de respuesta por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| smolvla_grab_black_cube_30ep | 450.046.176 | Tarea unica de agarre, contexto no disponible | apache-2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible en esta ficha (mismo orden de magnitud, ~450 M) | VLA generalista preentrenado | no disponible en esta ficha | Hugging Face |
| OpenVLA (referencia externa) | aproximadamente 7.000 M | VLA generalista de manipulacion | no disponible en esta ficha | Publico |
| pi0 de Physical Intelligence (referencia externa) | aproximadamente 3.300 M | VLA generalista con flow matching | no disponible en esta ficha | Publico |
| ACT / Action Chunking Transformer (referencia externa) | decenas de millones, aprox. | Politica de imitacion sin lenguaje | permisiva (implementacion LeRobot) | Publico |

Los datos de los modelos de referencia externos provienen de su documentacion publica y son aproximados; conviene verificarlos en la fuente original antes de citarlos. La ventaja competitiva de este modelo es el tamano: es entre 7 y 15 veces mas pequeno que OpenVLA o pi0, a cambio de una especializacion total en una unica tarea.

## Limitaciones y advertencias

- Especializacion extrema: entrenado con 30 episodios y una sola tarea, "Grab the black cube". No hay evidencia de que generalice a otros objetos, posiciones, iluminacion o instrucciones.
- Sin evaluacion: cero ensayos reportados, cero tasa de exito documentada y cero descargas o valoraciones de la comunidad. No hay ninguna validacion independiente.
- Riesgo de sobreajuste elevado: 100.000 pasos con lote 1 sobre 13.919 fotogramas es un regimen que favorece la memorizacion de las trayectorias grabadas.
- Configuracion de camaras sospechosa: la presencia de `observation.images.empty_camera_0` a 480x640 sugiere una camara mal configurada o de relleno. El despliegue debe replicar las mismas claves de observacion o la politica fallara.
- Dependencia de la calibracion del robot: cualquier cambio en el brazo, los servos, la posicion de las camaras o el montaje invalida la politica, algo inherente a la imitacion robotica.
- Sin capa de seguridad: no incluye limites de par, deteccion de colisiones ni parada de emergencia. En un robot real hay que implementarlos externamente para evitar danos materiales o personales.
- Alucinacion en el sentido de lenguaje: no aplica, porque no genera texto. El modo de fallo equivalente es la generacion de acciones incoherentes o peligrosas ante entradas fuera de distribucion.
- Idiomas: no disponible. El condicionamiento textual observado esta en ingles; no hay evidencia de soporte multilingue.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero se ofrece sin garantias; al ser un fine-tuning, conviene revisar tambien las condiciones del modelo base y del dataset de origen.
- Reproducibilidad: no se documenta si el dataset incluye informacion suficiente para replicar la tarea (posiciones iniciales, distractores, variabilidad de iluminacion).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sdadasdaga/smolvla_grab_black_cube_30ep
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sdadasdaga/grab-black-cube-act-30ep_20260908_205154
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sdadasdaga/grab-black-cube-act-30ep_20260908_205154
- Articulo de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento (aprendizaje por imitacion): https://huggingface.co/docs/lerobot/en/il_robots

# Ricky97/so101_test_policy

## Resumen

`Ricky97/so101_test_policy` es una política de control visomotor entrenada con LeRobot sobre el brazo robótico SO-101 (tipo `so_follower`) para una única tarea de manipulación: "Put cylinder into the white bowl". No es un modelo de lenguaje ni un modelo multimodal conversacional: es un controlador de imitación que consume el estado de las articulaciones (vector de 6 dimensiones) y una imagen de cámara de muñeca (3×480×640) y produce un vector de acción de 6 dimensiones. El autor es el usuario `Ricky97` y el repositorio tiene 0 descargas y 0 likes, por lo que se trata de un experimento de referencia más que de un artefacto con adopción comunitaria.

La política sigue el método Diffusion Policy (Chi et al., 2023, arXiv:2303.04137), que formula el control visomotor como un proceso generativo de difusión: en lugar de regresar directamente la acción, el modelo aprende a desruidificar trayectorias de acción, lo que produce movimientos suaves y multimodales, especialmente adecuados para tareas con contacto rico.

Con 76.202.054 parámetros (unos 76,2 millones) y un repositorio de 0,3 GB, es un modelo pequeño que cabe holgadamente en una GPU de consumo. Su relevancia práctica es como plantilla reproducible del flujo de trabajo de imitación de LeRobot sobre hardware SO-101 de bajo coste, y como línea base para comparar familias de políticas (diffusion frente a ACT o VQ-BeT) sobre un dataset propio. Hay que subrayar que se entrenó con solo 10 episodios y 4830 fotogramas de una única tarea, por lo que su generalización es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de desruidificación condicional para Diffusion Policy (politica de difusion visomotora); backbone concreto no especificado en la model card |
| Parametros totales | 76.202.054 (segun los pesos en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplicable: no es un modelo de lenguaje. No se especifica el horizonte de observacion ni el numero de pasos de accion por chunk |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors (el tamano de 0,3 GB es coherente con fp32). No hay versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no aplicable (no procesa lenguaje natural); la tarea se especifica como cadena de texto en la CLI, pero el modelo no la interpreta como entrada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | una, de muñeca (`wrist`) |
| Fecha de publicacion | creado el 2026-09-11; actualizado el 2026-09-11 (segun metadatos del Hub) |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, presentada en el articulo arXiv:2303.04137. La formulacion trata el control visomotor como un proceso generativo: dado un historial de observaciones (aqui, el estado articular de 6 dimensiones y la imagen de muñeca), el modelo parte de ruido gaussiano y lo desruidifica iterativamente hasta obtener una secuencia de acciones (action chunk). Este esquema captura distribuciones multimodales de comportamiento, algo que la regresion directa no puede hacer, y tiende a generar trayectorias mas suaves y estables en tareas con contacto. La ejecucion en robot suele hacerse con control de horizonte deslizante (receding horizon), reemplazando solo los primeros pasos del chunk antes de volver a planificar. La model card no detalla el backbone visual, el numero de pasos de difusion en inferencia, la dimension del horizonte de prediccion ni la funcion de perdida concreta empleada.

Los datos de entrenamiento provienen del dataset `Ricky97/SO101_test`: 10 episodios, 4830 fotogramas a 30 FPS, una unica tarea ("Put cylinder into the white bowl"). La configuracion de entrenamiento declarada es de 100.000 pasos, batch de 32, optimizador Adam, tasa de aprendizaje 0,0001 y semilla 1000, con LeRobot 0.6.2. El volumen de datos es muy reducido (menos de 5 minutos de teleoperacion efectiva), lo que implica un alto riesgo de sobreajuste al entorno, a las posiciones de los objetos y a la iluminacion exactos de la sesion de grabacion. No se documenta ningun proceso de RLHF, DPO ni refinamiento posterior; es aprendizaje por imitacion puro supervisado sobre demostraciones.

## Capacidades

- Generacion de trayectorias de accion de 6 grados de libertad para el brazo SO-101, condicionadas en estado articular e imagen de muñeca.
- Manipulacion con contacto rico: el sesgo inductivo de la difusion favorece movimientos suaves y multimodales en tareas de agarre y colocacion.
- Accion chunking: produce secuencias de acciones de varios pasos en lugar de una accion unica, lo que reduce la frecuencia efectiva de replanificacion.
- Percepcion visual monocular: procesa imagenes RGB de 480×640 a 30 FPS mediante la camara de muñeca.
- Ejecucion directa en robot real mediante `lerobot-rollout` con `--strategy.type=base`, con o sin grabacion de episodios.
- Reentrenamiento y ajuste fino con `lerobot-train --policy.type=diffusion` sobre datasets en formato LeRobot.
- No soporta generacion de texto, razonamiento simbolico, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes, planificacion multi-paso en lenguaje ni razonamiento encadenado.
- Sin capacidades multilingues: no hay procesamiento de lenguaje natural en ninguna parte del modelo.
- Tampoco tiene modo de pensamiento (thinking), audio, video generativo ni capacidades de vision-lenguaje (no responde a preguntas sobre la imagen).

## Casos de uso

- Replicacion de la tarea de referencia: ejecutar el bucle de colocacion de un cilindro en un cuenco blanco sobre un SO-101 equipado con camara de muñeca, usando `lerobot-rollout` con el checkpoint publicado; es util para validar que el montaje mecanico, la calibracion y la camara coinciden con los del entrenamiento.
- Linea base para comparar familias de politicas de imitacion: al estar entrenada con un dataset pequeno y publico, permite contrastar Diffusion Policy frente a ACT o VQ-BeT sobre exactamente los mismos 4830 fotogramas y medir diferencias de tasa de exito.
- Ajuste fino para tareas de pick-and-place similares: al ser un modelo de 76 M de parametros licenciado bajo Apache 2.0, se puede reentrenar con `lerobot-train` sobre un dataset propio de agarre de objetos para adaptarlo a nuevas piezas, partiendo de pesos ya sesgados hacia la manipulacion.
- Validacion de pipelines de datos de robotica: sirve para comprobar de extremo a extremo el flujo grabar-convertir-entrenar-desplegar de LeRobot (formato de dataset, claves de observacion, FPS, sincronizacion camara-estado) antes de invertir en recoleccion a gran escala.
- Docencia y formacion: es un ejemplo completo de politica visomotora de difusion entrenable en una GPU de consumo, con hiperparametros explicitos (100.000 pasos, batch 32, lr 1e-4, Adam), adecuado para practicas de aprendizaje por imitacion.
- Pruebas de robustez y estudio de dominio: ejecutar la politica variando posicion inicial del cilindro, iluminacion y distractores permite cuantificar empiricamente como se degrada una politica de difusion entrenada con 10 episodios cuando cambia el dominio.
- Arranque de recoleccion de datos dirigida: usar los fallos de la politica como diagnostico de que segmentos del espacio de estados no estan cubiertos por las demostraciones, y grabar episodios adicionales precisamente en esas zonas.
- Demostraciones en ferias o laboratorios: al ser un modelo pequeno y con inferencia local, se puede desplegar en un equipo compacto con GPU integrada para mostrar manipulacion aprendida sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion explicitamente vacia, con la nota "No evaluation results have been provided for this policy yet", por lo que no existe tasa de exito medida en robot real, ni numero de intentos, ni comparacion con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 para los pesos (76,2 millones de parametros), mas el coste de la red visual y de las activaciones de difusion; en la practica cabe comodamente en cualquier GPU con 4 GB o mas. Cifra orientativa, no publicada por el autor.
- GPU recomendadas: al ser un modelo de 76 M de parametros, basta una GPU de gama media o baja (por ejemplo, RTX 3060, RTX 4060 o superior). No requiere A100 ni H100. El uso de una GPU de datacenter solo tendria sentido como parte de una flota compartida.
- Cabe en GPU de consumo: si. Tambien puede ejecutarse en CPU, aunque la naturaleza iterativa de la difusion penaliza la latencia y probablemente hara inviable el control a 30 FPS.
- VRAM para entrenamiento: no especificada; con batch 32 y 76 M de parametros el entrenamiento es viable en una GPU de consumo con 8-12 GB, siempre que se ajuste la resolucion de imagen o el batch si aparece falta de memoria. Cifra orientativa, no publicada por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para robot real, `lerobot-train` para reentrenar). No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. El dataset esta grabado a 30 FPS y la camara se configura a 30 FPS, pero la model card no reporta la frecuencia de control alcanzable en inferencia ni el tiempo por chunk de acciones.
- Almacenamiento: 0,3 GB de repositorio.

## Comparativa con modelos similares

La informacion disponible no incluye datos de rendimiento de este modelo ni de sus alternativas, por lo que la comparativa es necesariamente cualitativa. Todas las cifras de modelos de terceros se marcan como no disponibles cuando no proceden de la informacion proporcionada.

| Modelo | Enfoque | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Ricky97/so101_test_policy` (este modelo) | Diffusion Policy (desruidificacion condicional de acciones) | 76.202.054 | no disponible | apache-2.0 | pesos safetensors en el Hub, 0 descargas |
| ACT (Action Chunking Transformer) | Transformer con CVAE que predice chunks de acciones | no disponible | no disponible | no disponible | implementado en LeRobot como `--policy.type=act` |
| VQ-BeT | Discretizacion vectorial de acciones con transformer autorregresivo | no disponible | no disponible | no disponible | implementado en LeRobot |
| SmolVLA y otras politicas basadas en VLM | VLM preentrenado adaptado a control | no disponible | no disponible | no disponible | ecosistema LeRobot |

Diferencias clave esperables segun la formulacion de cada metodo: Diffusion Policy suele destacar en tareas con contacto y comportamientos multimodales; ACT es mas rapido en inferencia al ser un pase unico; VQ-BeT combina ambas ideas con un codebook de acciones. Cualquier afirmacion cuantitativa sobre cual gana en esta tarea requeriria una evaluacion que no existe en la informacion disponible.

## Limitaciones y advertencias

- Generalizacion muy limitada: entrenada con 10 episodios y 4830 fotogramas de una unica tarea; es previsible que falle ante cambios de posicion de los objetos, iluminacion, fondo o tipo de pieza.
- Sin resultados de evaluacion: no hay tasa de exito medida, ni en simulacion ni en robot real. No debe asumirse que la politica funciona solo porque el entrenamiento convergiese.
- Riesgo de sobreajuste al montaje concreto: la camara de muñeca, su calibracion, su resolucion (480×640) y su indice son parte del modelo efectivo. Cambiar la camara o su montaje invalida la politica.
- Dependencia de claves de observacion exactas: las entradas deben llamarse `observation.state` y `observation.images.wrist` y respetar las formas (6,), (3, 480, 640) y (6,) para la accion.
- Rigidez de tarea: la cadena de la tarea se pasa a la CLI, pero el modelo no la interpreta como instruccion; no se puede reutilizar para otra tarea sin reentrenar.
- Sin capacidades de lenguaje: no admite instrucciones en lenguaje natural, tool calling, agentes ni razonamiento multi-paso. Cualquier expectativa de ese tipo es un malentendido sobre el tipo de modelo.
- Sesgos de datos: los sesgos provienen de las demostraciones humanas de teleoperacion (velocidad, agarre, posiciones preferidas). No hay analisis de sesgos ni de comportamiento fuera de distribucion.
- Riesgo fisico en produccion: una politica de manipulacion sin evaluacion publicada puede generar trayectorias abruptas o colisiones. Es imprescindible limitar velocidades, fuerzas y espacio de trabajo, y prever una parada de emergencia.
- Licencia permisiva pero sin garantias: Apache 2.0 permite uso comercial y modificacion, pero no implica soporte, mantenimiento ni idoneidad para un proposito concreto. El autor no ofrece garantia alguna.
- Historial de adopcion nulo: 0 descargas y 0 likes en el momento de la consulta; no hay issues, forks ni evaluaciones de terceros que respalden su fiabilidad.
- Fechas de los metadatos: el repositorio figura como creado y actualizado el 11 de septiembre de 2026, dato que conviene verificar en el Hub antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ricky97/so101_test_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Ricky97/SO101_test
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Ricky97/SO101_test
- Articulo de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web asociada a esta ficha no devolvio resultados relevantes sobre el modelo; los unicos enlaces utiles son los de la model card y el ecosistema de LeRobot recogidos arriba.

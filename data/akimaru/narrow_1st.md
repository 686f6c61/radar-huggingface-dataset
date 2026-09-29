# akimaru/Narrow_1st

## Resumen

`akimaru/Narrow_1st` es una política de robótica basada en ACT (Action Chunking with Transformers) entrenada mediante aprendizaje por imitación y publicada en Hugging Face por la usuaria akimaru (Sara Akimaru). No es un modelo de lenguaje: es un controlador visuomotor que transforma observaciones del robot (estado articular y cuatro flujos de cámara a 480x640) en comandos de acción de 6 dimensiones para un brazo `so_follower` del ecosistema SO de LeRobot. El método de referencia (arXiv:2304.13705) predice fragmentos (chunks) de acciones en lugar de pasos individuales, lo que reduce el error acumulado en tareas de manipulación fina.

El modelo tiene 51.668.614 parámetros (unos 51,7 millones) y ocupa 0,2 GB en el repositorio, por lo que es muy ligero comparado con los modelos fundacionales de robótica. Se distribuye en formato safetensors bajo licencia Apache 2.0 y se ejecuta con la librería `lerobot` (versión de entrenamiento 0.6.1). Fue entrenado con el dataset `akimaru/newhouse`, compuesto por 149 episodios y 73.601 fotogramas grabados a 30 FPS, para una única tarea: "Pick_and_place_objects_to_sort_them" (coger objetos y colocarlos para clasificarlos).

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de imitación con hardware de bajo coste, como punto de partida para *fine-tuning* con datos propios y como referencia para comparar configuraciones de política ACT dentro de la misma familia de modelos de la autora. El repositorio no incluye resultados de evaluación en robot real ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con prediccion de chunks de acciones; implementacion de LeRobot (`policy.type=act`) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); consume una ventana de observaciones y produce chunks de acciones de k pasos, valor no especificado en la informacion disponible |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; los pesos se publican en precision completa) |
| Idiomas soportados | no aplica / no disponible (no procesa lenguaje natural; la tarea se pasa como cadena fija `Pick_and_place_objects_to_sort_them`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Biblioteca | lerobot (entrenado con LeRobot 0.6.1) |
| Tipo de robot | `so_follower` |
| Camaras | `robot`, `front`, `side`, `naname` |
| Entradas | `observation.state` (6,); `observation.images.{robot,front,side,naname}` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-28 |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que combina un transformer con un esquema de prediccion por chunks: en lugar de emitir una accion por paso, el modelo genera una secuencia corta de acciones futuras, lo que mejora la consistencia temporal y reduce la acumulacion de error en tareas de contacto. La politica de este repositorio sigue la implementacion de LeRobot (`policy.type=act`) y consume de forma conjunta el estado articular de 6 dimensiones y cuatro imagenes RGB de 480x640, produciendo un vector de accion tambien de 6 dimensiones que corresponde al brazo esclavo `so_follower`.

El entrenamiento se realizo sobre el dataset `akimaru/newhouse` (149 episodios, 73.601 fotogramas, 30 FPS, tarea unica de pick-and-place para clasificacion de objetos) con la siguiente configuracion: 300.000 pasos, batch size 16, optimizador AdamW, tasa de aprendizaje 1e-5, semilla 1000 y LeRobot 0.6.1. La model card no documenta el uso de RLHF, DPO ni etapas de refinamiento posteriores, ni detalla la composicion exacta del dataset mas alla del numero de episodios y fotogramas. Tampoco se especifica el tamano del chunk de acciones ni la configuracion interna del transformer, por lo que esos extremos quedan como no disponibles.

## Capacidades

- Control visuomotor por imitacion: genera comandos de 6 grados de libertad a partir de estado articular y cuatro vistas de camara simultaneas.
- Prediccion por chunks de acciones, en linea con el metodo ACT, orientada a tareas de manipulacion con contacto.
- Fusion multimodal de cuatro flujos visuales (`robot`, `front`, `side`, `naname`) con el estado del robot, lo que aporta redundancia ante oclusiones parciales en una de las vistas.
- Ejecucion de una tarea concreta y predefinida: coger objetos y colocarlos para clasificarlos.
- Integracion nativa con el ecosistema LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento o ajuste fino).
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de LLM; el comportamiento multi-paso se limita a la ejecucion continua de la politica durante el episodio de manipulacion.
- Capacidades multilingues: no aplica.
- Capacidades especiales: no dispone de modo de razonamiento, vision generalista, audio ni generacion de texto. Su unica salida es el vector de accion.

## Casos de uso

- Clasificacion automatizada de objetos en un banco de laboratorio o celda de montaje: la politica ejecuta la tarea "Pick_and_place_objects_to_sort_them" sobre un brazo `so_follower` y reordena piezas segun su categoria, aprovechando las cuatro camaras para localizar objetos en distintas orientaciones.
- Punto de partida para *fine-tuning* con datos propios: partiendo de `akimaru/Narrow_1st` y del flujo `lerobot-train --policy.type=act`, se puede adaptar la politica a nuevas tareas grabando episodios de teleoperacion adicionales, lo que ahorra pasos frente a entrenar desde cero.
- Docencia e investigacion en aprendizaje por imitacion: sirve como ejemplo completo y ligero (0,2 GB) de un pipeline de ACT con hardware de bajo coste, util para cursos y practicas sobre politica visuomotora y evaluacion en robot real.
- Comparacion de configuraciones de politica: al coexistir con otros checkpoints de la misma autora (por ejemplo `akimaru/act_so101_2nd`, 23,5 M de parametros), permite estudiar el efecto del tamano del modelo y de la configuracion de camaras en una misma tarea.
- Recoleccion y validacion de datos: el repositorio documenta el dataset asociado (`akimaru/newhouse`), de modo que se puede auditar la relacion entre numero de episodios, diversidad de posiciones y calidad de la politica resultante.
- Demostracion de manipulacion con vision multi-camara: util para prototipos que necesiten justificar el uso de varias vistas frente a una sola camara en tareas de pick-and-place.
- Integracion en estaciones de *pick and place* de baja cadencia: con la salvedad de que no hay resultados de exito publicados, puede emplearse en entornos controlados donde la tarea y la iluminacion sean estables.
- Protocolo de evaluacion de robustez: al no existir evaluacion oficial, el modelo es un candidato directo para medir tasa de exito ante cambios de posicion de objetos, iluminacion o presencia de distractores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con la nota explicita de que todavia no se han aportado resultados para esta politica, por lo que no existen tasas de exito en robot real ni metricas comparables de MMLU, HumanEval, GSM8K u otras (no aplicables a un modelo de robotica).

| Metrica | Resultado |
|---|---|
| Tasa de exito en robot real | no disponible |
| Numero de ensayos por tarea | no disponible |
| Benchmarks de lenguaje o codigo | no aplica |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB para los pesos en fp32 (51,7 M de parametros x 4 bytes) y unos 0,1 GB en fp16 o bf16. La memoria real sera mayor por las activaciones de cuatro flujos de imagen a 480x640 y por el *preprocesado* de las camaras; se trata de una estimacion derivada del numero de parametros, no de una cifra publicada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la practica; una RTX 3060, RTX 4060 o superior cubre el caso de uso con holgura. Modelos como A100 o H100 no aportan ventaja apreciable para una politica de este tamano.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna e incluso en hardware integrado; el cuello de botella real es la captura y sincronizacion de las cuatro camaras a 30 FPS, no el computo del transformer.
- Opciones de despliegue: LeRobot es la via soportada (`lerobot-rollout` con `--policy.path=akimaru/Narrow_1st`). Los formatos safetensors permiten tambien carga directa en PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de politica.
- Latencia y throughput estimados: no disponibles. El unico dato relacionado es que el dataset de entrenamiento se grabo a 30 FPS, lo que fija la frecuencia de control de referencia, pero no se publica la latencia de inferencia ni el rendimiento medido en el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `akimaru/Narrow_1st` | 51.668.614 | ACT (LeRobot) | Pick_and_place_objects_to_sort_them, robot `so_follower`, 4 camaras | apache-2.0 | Hugging Face, 0 descargas al momento de la consulta |
| `akimaru/act_so101_2nd` | 23.500.000 | ACT (LeRobot) | no disponible en la informacion recogida | no disponible | Hugging Face, 40 likes segun la busqueda web |
| ACT de referencia (Zhao et al., 2023) | no disponible | ACT | Manipulacion bimanual con hardware de bajo coste | no disponible | Codigo y paper publicos |

No se dispone de datos de rendimiento comparativo entre estas opciones, por lo que la comparacion se limita a parametros, tipo de politica y disponibilidad. Cualquier afirmacion sobre cual funciona mejor en robot real requeriria evaluaciones que no se han publicado.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasas de exito, numero de ensayos ni condiciones de prueba. No debe asumirse que la politica funciona de forma fiable en produccion.
- Tarea unica y cerrada: el modelo esta entrenado exclusivamente para "Pick_and_place_objects_to_sort_them"; no generaliza a otras instrucciones ni acepta comandos en lenguaje natural.
- Dependencia estricta del montaje: las claves de observacion (`observation.images.robot`, `front`, `side`, `naname`), sus resoluciones (3x480x640) y el orden del vector de estado y accion (6,) deben coincidir exactamente con el hardware de entrenamiento. Cualquier cambio de camara, calibracion o tipo de brazo invalida la politica.
- Sensibilidad al dominio visual: al ser aprendizaje por imitacion, es esperable degradacion ante cambios de iluminacion, fondo, posicion de los objetos o presencia de distractores, aunque no se han cuantificado.
- Riesgo de sobreajuste a las trayectorias demostradas: con 149 episodios y 73.601 fotogramas, la cobertura de estados es limitada y los errores pueden acumularse fuera de la distribucion de entrenamiento.
- Un solo operador y una sola tarea en el dataset: no se documenta diversidad de demostradores, lo que puede introducir sesgos de estilo de manipulacion dificiles de corregir sin regrabar datos.
- Sin datos de sesgo ni de seguridad: no hay analisis de riesgos fisicos, fuerzas de agarre ni comportamientos ante fallos de percepcion.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero la licencia del modelo no cubre posibles derechos sobre el dataset `akimaru/newhouse` ni sobre el hardware empleado.
- Advertencia de robustez en produccion: al no existir evaluacion publicada, cualquier despliegue deberia ir precedido de una bateria propia de ensayos con criterios de exito y condiciones de parada de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akimaru/Narrow_1st
- Dataset de entrenamiento: https://huggingface.co/datasets/akimaru/newhouse
- Visualizacion del dataset en LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=akimaru/newhouse
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Paper de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Perfil del autor en Hugging Face: https://huggingface.co/akimaru
- Modelos del autor: https://huggingface.co/akimaru/models
- Datasets del autor: https://huggingface.co/akimaru/datasets

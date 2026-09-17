# 1ys1/areumii-handover_v1

# Ficha técnica: 1ys1/areumii-handover_v1

## Resumen

1ys1/areumii-handover_v1 es una política robótica de tipo visión-lenguaje-acción (VLA) publicada por el usuario 1ys1 en HuggingFace Hub. Se trata de un ajuste fino (fine-tune) del modelo base lerobot/smolvla_base, la implementación de SmolVLA descrita en el paper arXiv:2506.01844, una arquitectura compacta de VLA diseñada explícitamente para reducir el coste computacional y poder desplegarse en hardware de consumo. El modelo resultante tiene 450.046.176 parámetros (aproximadamente 450 millones) y se distribuye en formato safetensors con licencia Apache 2.0.

El problema que resuelve es concreto: controlar un robot del tipo `areumii` para ejecutar tareas de manipulación de tipo pick-and-place. Concretamente, las dos tareas documentadas en la model card son "Pick up the Eclipse and place it in the box" y "Place the green can on the upper shelf, then place the blue can on the lower shelf". La política consume el estado propioceptivo del robot (vector de 6 dimensiones) y tres flujos de imagen de 256x256 píxeles procedentes de las cámaras `head`, `left_wrist` y `right_wrist`, y produce un vector de acción continuo de 16 dimensiones.

Su relevancia actual es doble. Por un lado, demuestra que un VLA de menos de 500 millones de parámetros puede entrenarse con un dataset pequeño y teleoperado (28 episodios, 22.458 fotogramas a 30 FPS) usando el ecosistema LeRobot, lo que abarata el ciclo de iteración en robótica. Por otro, al ser un derivado de un modelo base abierto y con licencia permisiva, sirve como punto de partida reproducible para equipos que quieran adaptar una política VLA a su propio robot sin entrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto) |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de texto; el modelo consume la observación actual (estado + 3 imágenes) y no se documenta memoria temporal explícita |
| Tipos de cuantizacion | No disponible (no se documentan pesos cuantizados en el repositorio) |
| Idiomas soportados | No disponible; las instrucciones de tarea del dataset están redactadas en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot (version usada en entrenamiento: 0.6.1) |
| Pipeline declarado | robotics |
| Modelo base | lerobot/smolvla_base |
| Tamano del repositorio | 0,9 GB |
| Tipo de robot | areumii |
| Camaras | head, left_wrist, right_wrist |
| Entrada: estado | observation.state, forma (6,) |
| Entrada: vision | 3 x observation.images.cameraN, forma (3, 256, 256) |
| Salida | action, forma (16,) |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción compacta que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones, y que según sus autores alcanza rendimiento competitivo con un coste computacional reducido, lo que permite desplegarla en hardware de consumo. En esta ficha no se dispone de más detalle arquitectónico (número de capas, dimensión oculta, tipo de atención, uso de decodificación especulativa o atención lineal) porque la model card no lo especifica; para ello hay que remitirse al paper arXiv:2506.01844.

El entrenamiento de esta política concreta se realizó con LeRobot 0.6.1, partiendo de `lerobot/smolvla_base`, durante 30.000 pasos con tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. Los datos provienen del dataset `1ys1/areumii-handover_v1_merged_28`: 28 episodios, 22.458 fotogramas capturados a 30 FPS, correspondientes a demostraciones teleoperadas de las dos tareas de manipulación citadas. No se documenta el uso de RLHF, DPO ni ningún otro ajuste por preferencias, algo coherente con un pipeline de aprendizaje por imitación (imitation learning). Tampoco se especifica composición del dataset más allá del recuento de episodios y fotogramas.

## Capacidades

- Generación de acciones motoras continuas: produce un vector de acción de 16 dimensiones a partir de la observación actual, adecuado para control de manipuladores.
- Percepción multimodal: procesa simultáneamente tres vistas de cámara de 256x256 píxeles (cabeza y dos muñecas) más el estado propioceptivo del robot.
- Condicionamiento por instrucción en lenguaje natural: la política acepta una tarea textual (por ejemplo, "--task=Pick up the Eclipse and place it in the box") que guía el comportamiento.
- Ejecución de tareas de pick-and-place: recogida de un objeto y depósito en una caja, y colocación secuencial de dos latas en estantes distintos.
- Control bimanual o multiarticular: la dimensionalidad de salida (16) y la presencia de cámaras en ambas muñecas sugieren operación con dos brazos, aunque esto no se declara explícitamente en la información disponible.
- Soporte de tool calling / function calling: no aplica; es una política robótica, no un modelo de lenguaje conversacional.
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes de software; sí ejecuta secuencias de manipulación encadenadas dentro de una misma tarea.
- Capacidades multilingües: no disponible; solo se documentan instrucciones en inglés.
- Capacidad especial "thinking mode", visión generativa o audio: no disponible.

## Casos de uso

- Automatización de pick-and-place en linea de montaje: la política recoge un objeto identificado y lo deposita en una caja, una tarea de ciclo corto y repetitivo donde un VLA de 450 M permite inferencia en el propio puesto de trabajo sin depender de un servidor central.
- Ordenación de piezas por color en almacén: la tarea de colocar una lata verde en el estante superior y una azul en el inferior es directamente aplicable a clasificación de referencias por atributos visuales, con la cámara de cabeza aportando la vista global.
- Manipulación con oclusión parcial: el uso de dos cámaras de muñeca permite mantener la referencia del objeto cuando la vista frontal queda bloqueada por el propio brazo, un escenario habitual en estanterías estrechas.
- Recogida de objetos en espacios confinados: la combinación de vista cenital y vistas de muñeca facilita el ajuste fino en cajas o bandejas donde el espacio de maniobra es reducido.
- Base para transferencia a un robot propio: al ser un fine-tune de `lerobot/smolvla_base` con receta documentada (30.000 pasos, lote 8, AdamW, lr 1e-4), puede reentrenarse sobre un dataset propio de otra celda robótica del mismo tipo.
- Generación de datos sintéticos o aumentados para imitación: la política puede ejecutarse con `lerobot-rollout` para producir trayectorias adicionales que amplíen un dataset pequeño de 28 episodios.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible para estudiar el efecto del número de episodios, la resolución de cámara o el número de vistas en el éxito de una política VLA compacta.
- Prototipado rápido en laboratorio: con el CLI de LeRobot se lanza la política en menos de una línea de comandos, lo que permite validar una configuración de cámaras y robot antes de invertir en un entrenamiento mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la sección de evaluación con la nota "_No evaluation results have been provided for this policy yet_", es decir, no hay tabla de tareas, ensayos, éxitos ni tasa de éxito en robot real. Tampoco se aportan métricas de pérdida de entrenamiento ni comparaciones cuantitativas con `lerobot/smolvla_base` u otras políticas.

## Requisitos de hardware

Las cifras de memoria que siguen son calculos aritmeticos derivados del numero de parametros declarado (450.046.176) y no datos publicados por el autor.

- VRAM estimada para los pesos en solitario: aproximadamente 1,8 GB en FP32, 0,9 GB en BF16/FP16 y 0,45 GB en int8. A ello hay que sumar activaciones, búferes de imagen (tres tensores de 3x256x256 por paso) y el runtime de PyTorch.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo es compatible con GPUs de gama media y alta; el requisito realista lo marca la necesidad de sostener inferencia a 30 FPS, no la memoria.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 8 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070, RTX 4090). No hay confirmacion oficial.
- Ejecucion en CPU: tecnicamente posible por el tamano, pero no recomendable para control en tiempo real.
- Opciones de despliegue: `lerobot-rollout` (CLI de LeRobot) es el metodo documentado, invocando `--policy.path=1ys1/areumii-handover_v1` y `--robot.type=areumii`. Tambien es posible cargar la politica mediante la libreria `lerobot` en Python. vLLM, llama.cpp, Ollama o TGI no aplican: no es un modelo de lenguaje de texto.
- Latencia y throughput estimados: no disponible. La politica se ha entrenado con datos a 30 FPS, lo que sugiere que el bucle de control objetivo opera a esa frecuencia, pero no se publica ninguna medicion de latencia.

## Comparativa con modelos similares

La informacion disponible no permite una comparativa cuantitativa fiable. Se incluye lo unico verificable en los datos aportados:

| Modelo | Parametros | Contexto / entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1ys1/areumii-handover_v1 | 450.046.176 | Estado (6,) + 3 imagenes 256x256 | Sin resultados de evaluacion publicados | Apache 2.0 | HuggingFace Hub, 0 descargas, 0 likes |
| lerobot/smolvla_base | No disponible | No disponible | No disponible | No disponible en la informacion aportada | HuggingFace Hub (modelo base del anterior) |
| Otras politicas VLA (OpenVLA, pi0, RT-2, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion aportada |

Diferencia verificable: `1ys1/areumii-handover_v1` es un fine-tune de `lerobot/smolvla_base` sobre 28 episodios y dos tareas concretas, por lo que su dominio es mas estrecho que el del modelo base, que se distribuye como modelo preentrenado de proposito general dentro del ecosistema LeRobot.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 28 episodios y 22.458 fotogramas para un total de dos tareas. Es un volumen bajo para generalizacion y aumenta el riesgo de sobreajuste a posiciones, iluminacion y objetos concretos.
- Ausencia total de evaluacion: no hay tasa de exito, numero de ensayos ni condiciones de prueba, por lo que no puede afirmarse ningun nivel de rendimiento en robot real.
- Dependencia fuerte del montaje fisico: la politica espera exactamente las claves de observacion `observation.state`, `observation.images.camera1`, `camera2` y `camera3`, con camaras `head`, `left_wrist` y `right_wrist`. Cambiar la configuracion de camaras invalida la politica.
- Especifico del robot `areumii`: no se documenta compatibilidad con otras plataformas; usarlo en otro robot exigiria reentrenar.
- Espacio de acciones de 16 dimensiones: cualquier diferencia en la cinematica o el numero de articulaciones del robot destino rompe la correspondencia con la salida del modelo.
- Idiomas: no hay evidencia de soporte multilingue en las instrucciones de tarea; solo se documentan tareas en ingles.
- Riesgo de alucinacion en el sentido de acciones erroneas: como toda politica de aprendizaje por imitacion, puede producir movimientos fuera de distribucion ante objetos, posiciones o iluminaciones no vistas, sin ninguna senal de incertidumbre asociada.
- Sesgos: no disponibles; no se documenta analisis de sesgo, y en este dominio el sesgo relevante seria la sobrerrepresentacion de condiciones de captura concretas.
- Cuantizacion: no se ofrecen pesos cuantizados, por lo que el despliegue en hardware muy limitado requeriria cuantizar por cuenta propia.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el modelo base y el paper asociado deben citarse segun se indica en la model card (`cadene2024lerobot` y el metodo de SmolVLA). Conviene verificar la licencia de `lerobot/smolvla_base` de forma independiente, ya que no se detalla en la informacion aportada.
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (contenido sobre el Imperio Romano) y no aportan informacion utilizable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/1ys1/areumii-handover_v1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/1ys1/areumii-handover_v1_merged_28
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=1ys1/areumii-handover_v1_merged_28
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Imagen de arquitectura SmolVLA: https://cdn-uploads.huggingface.co/production/uploads/640e21ef3c82bd463ee5a76d/aooU0a3DMtYmy_1IWMaIM.png

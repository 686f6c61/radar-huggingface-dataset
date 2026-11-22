# Harrysunshine/g1-pi05-v9-single-target-200

## Resumen

g1-pi05-v9-single-target-200 es un ajuste fino completo (full fine-tune) del modelo fundacional de robotica `lerobot/pi05_base`, publicado por el usuario Harrysunshine. El modelo esta especializado en una unica tarea de manipulacion robotica sobre un Unitree G1: recoger una caja azul de procesador Intel y depositarla en una cesta de madera, usando el brazo derecho del robot. Se trata, por tanto, de una politica visomotora (vision-language-action) y no de un modelo de lenguaje conversacional.

El modelo se ha entrenado con la libreria LeRobot 0.6.1 sobre el dataset `xiaojia666/g1-blue-intel-single-target-200`, compuesto por 200 episodios y 277.084 fotogramas a 50 Hz, con camaras de cabeza y de muneca derecha a 224x224 y un espacio de estado/accion de 9 dimensiones (7 articulaciones del brazo derecho mas 2 dedos de la pinza). El prompt de instruccion es fijo y en ingles: "Pick up the blue Intel processor box and place it in the wooden basket."

Su relevancia es acotada pero clara para quien trabaja en aprendizaje por imitacion sobre hardware Unitree G1: sirve como referencia reproducible de un pipeline completo de ajuste fino de pi0.5 con normalizacion MEAN_STD, aumento de datos geometrico suave y checkpoints intermedios cada 2.500 pasos. No es un modelo de proposito general ni sustituye a pi05_base fuera de este escenario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) pi0.5 de LeRobot; detalles internos no disponibles |
| Parametros totales | 4.143.404.816 (aprox. 4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (politica por pasos de control, no contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; prompt de entrenamiento en ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria lerobot) |
| Modelo base | lerobot/pi05_base |
| Dataset de entrenamiento | xiaojia666/g1-blue-intel-single-target-200 (200 episodios, 277.084 fotogramas, 50 Hz) |
| Entradas | imagen cabeza + imagen muneca derecha, 224x224; estado de 9 dimensiones |
| Salidas | accion de 9 dimensiones (7 articulaciones brazo derecho + 2 dedos de pinza) |
| Tamano del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura pi0.5 de LeRobot, una politica visomotora que combina percepcion visual con generacion de acciones de control; la model card no detalla la composicion interna de capas, el mecanismo de atencion ni el esquema de flujo o difusion empleado para las acciones, por lo que esos extremos quedan como no disponibles. El ajuste es de parametros completos sobre `lerobot/pi05_base`, no un adaptador LoRA.

El entrenamiento se realizo con LeRobot 0.6.1 con batch 32, learning rate 2,5e-5, warmup de 1.000 pasos y decaimiento coseno sobre 30.000 pasos, weight decay 0,01, normalizacion MEAN_STD para estado y accion, una augmentacion RandomAffine suave (±3 grados, 3 % de desplazamiento, escala 0,97-1,03) y gradient checkpointing. El entrenamiento se detuvo en el paso 25.000. El repositorio incluye el checkpoint final en la raiz y checkpoints intermedios cada 2.500 pasos bajo `checkpoints/<step>/`. No se documentan tokens de entrenamiento en el sentido de LLM ni etapas de RLHF o DPO.

## Capacidades

- Generacion de acciones de control para el brazo derecho de un Unitree G1 a partir de dos vistas de camara y del estado articular.
- Ejecucion de una tarea de manipulacion concreta: recoger una caja azul de procesador Intel y colocarla en una cesta de madera.
- Condicionamiento por instruccion en lenguaje natural, con un prompt fijo en ingles.
- Control de pinza de dos dedos integrado en el espacio de accion de 9 dimensiones.
- No dispone de generacion de texto, razonamiento simbolico, codigo ni matematicas.
- No se documenta soporte de tool calling, function calling ni planificacion multi-paso mas alla de la secuencia de la tarea.
- No se documentan capacidades multilingues; el unico prompt conocido esta en ingles.
- No se documentan modos especiales (thinking, vision general, audio) distintos de la percepcion visual propia de la politica.

## Casos de uso

- Reproduccion de referencia para ajuste fino de pi0.5: sirve para validar un pipeline completo con LeRobot 0.6.1 sobre Unitree G1, comparando la receta (batch 32, lr 2,5e-5, coseno a 30k) con los propios resultados.
- Pick-and-place de laboratorio: ejecutar la secuencia de recogida de una caja y deposito en una cesta como tarea de banco para medir tasa de exito de la politica en el mismo escenario de entrenamiento.
- Base para ajustes posteriores: al ser un fine-tune completo sobre pi05_base, puede servir de punto de partida para especializar el modelo en objetos o recipientes distintos mediante un nuevo dataset.
- Evaluacion de augmentacion geometrica: la RandomAffine suave (±3 grados, 3 % de desplazamiento) permite estudiar su efecto en robustez frente a pequenas variaciones de posicion de la caja.
- Estudio de checkpoints intermedios: los checkpoints cada 2.500 pasos permiten analizar la curva de aprendizaje y el sobreajuste en una tarea de un solo objetivo.
- Docencia y divulgacion en robotica: ejemplo concreto y acotado de aprendizaje por imitacion visomotora sobre hardware Unitree G1, util para explicar el flujo dataset-politica-despliegue en LeRobot.
- Pruebas de integracion de LeRobot: verificar la carga con `PI05Policy.from_pretrained(...)` y el formato de repositorio con checkpoints anidados en entornos de CI internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,14 mil millones de parametros, en precision completa (fp32) los pesos ocuparian en torno a 16,6 GB; en bf16/fp16, unos 8,3 GB, a lo que hay que sumar el coste de las dos entradas visuales y del estado del modelo. Son estimaciones por tamano, no datos del autor.
- GPU recomendadas: no disponibles. Por tamano, una GPU con 16-24 GB de memoria (por ejemplo, RTX 4090 o A100 40 GB) seria el rango razonable para inferencia en bf16, sin confirmacion del autor.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en bf16 segun la estimacion anterior; no confirmado.
- Opciones de despliegue: LeRobot con `PI05Policy.from_pretrained("Harrysunshine/g1-pi05-v9-single-target-200")`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica VLA de este tipo.
- Latencia y throughput: no disponibles. El control opera a 50 Hz en el dataset, pero no se publica la frecuencia de inferencia alcanzable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| g1-pi05-v9-single-target-200 | 4,14 mil millones | Tarea unica: caja azul a cesta, brazo derecho Unitree G1 | no disponible | Hugging Face (0 descargas, 0 likes) |
| lerobot/pi05_base | no disponible en la informacion | Politica VLA generalista base | no disponible | Hugging Face (modelo base de este ajuste) |
| Otros fine-tunes de pi0.5 para Unitree G1 | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta entrenado para un unico prompt y un unico par objeto-recipiente; no generaliza a otras tareas sin nuevo ajuste.
- Dependencia del escenario: las camaras de cabeza y muneca derecha a 224x224 y la configuracion del G1 deben coincidir con las del dataset; cambios de calibracion o de montaje pueden degradar el comportamiento.
- Prompt en ingles y fijo; no se documenta robustez ante variaciones de la instruccion.
- Sin datos de benchmarks ni de tasa de exito en el mundo real; no hay evidencia publicada de rendimiento fuera del conjunto de entrenamiento.
- Licencia no disponible: no puede asumirse uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- Riesgo de sobreajuste al escenario unico ("single-target") y a la posicion concreta de los objetos; la augmentacion aplicada es deliberadamente suave.
- Sin informacion sobre sesgos, alucinacion en el sentido de LLM (no aplica igual en una politica de acciones) ni evaluaciones de seguridad fisica del robot.
- Repositorio sin descargas ni likes y creado recientemente: no hay senales de validacion por parte de la comunidad.
- El entrenamiento se detuvo en el paso 25.000 de una programacion de 30.000; no se justifica la eleccion del checkpoint final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harrysunshine/g1-pi05-v9-single-target-200
- Dataset de entrenamiento: https://huggingface.co/datasets/xiaojia666/g1-blue-intel-single-target-200
- Modelo base: https://huggingface.co/lerobot/pi05_base

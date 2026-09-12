# fecasado/gfm-kitchen-pan-baseline

## Resumen

gfm-kitchen-pan-baseline es una politica de robotica (policy) publicada por el usuario fecasado en Hugging Face, entrenada y subida con la libreria LeRobot de Hugging Face. Segun la etiqueta gaze_flow_matching y el nombre del repositorio, se trata de una politica visuomotora basada en flow matching condicionado por mirada (gaze), orientada a una tarea de cocina: colocar o manipular una sarten sobre un fogon, a partir del dataset fecasado/pan-on-hob-320x240 con imagenes de 320x240.

El modelo tiene 75.218.394 parametros (unos 75,2 millones) almacenados en safetensors, con un repositorio de 0,3 GB, y se distribuye bajo licencia Apache 2.0. No es un modelo de lenguaje: su pipeline declarado es robotics y su salida son acciones de control para un brazo robotico, no texto. Por tanto, conceptos como ventana de contexto, idiomas o cuantizaciones de LLM no aplican directamente y no estan documentados.

Su relevancia es acotada pero clara: sirve como linea base reproducible de una politica de manipulacion en un dominio concreto (cocina), con licencia permisiva y compatible con el ecosistema LeRobot, lo que facilita replicar el entrenamiento, comparar variantes de flow matching y reutilizarlo como punto de partida para fine-tuning en tareas similares. La model card es practicamente una plantilla sin rellenar, por lo que la mayor parte de los detalles tecnicos (arquitectura exacta, datos de entrenamiento, metricas) no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El autor la identifica como gaze_flow_matching (politica de flow matching condicionada por mirada), pero la model card no describe la arquitectura concreta ni el backbone visual |
| Parametros totales | 75.218.394 (aproximadamente 75,2 M), segun los pesos en safetensors |
| Longitud de contexto | No aplica / no disponible (politica de robotica, no modelo de lenguaje; la observacion es una imagen de 320x240 mas el estado del robot) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria / ecosistema | lerobot |
| Pipeline declarado | robotics |
| Dataset de entrenamiento declarado | fecasado/pan-on-hob-320x240 |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion | 2026-09-12 |
| Ultima actualizacion | 2026-09-12 |

## Arquitectura y entrenamiento

La informacion disponible no permite reconstruir la arquitectura con precision. El nombre del modelo y la etiqueta gaze_flow_matching indican que se emplea un esquema de flow matching (familia de modelos generativos de transporte continuo, alternativa a la difusion) para generar trayectorias de acciones, y que la condicion de entrada incluye informacion de mirada (gaze) ademas de las observaciones visuales. La entrada visual declarada corresponde a imagenes de 320x240 (dataset pan-on-hob-320x240), y el presupuesto de parametros (75,2 M) es coherente con una politica compacta que combina un codificador visual y una cabeza generativa de acciones, aunque no hay confirmacion explicita de esta composicion.

El entrenamiento se realizo, segun la model card, con el flujo de trabajo de LeRobot para imitacion (imitation learning) y quedo registrado en el Hub con el repositorio de pesos. No se especifican el numero de episodios, la composicion del dataset, el numero de pasos de entrenamiento, ni si hubo etapas de ajuste fino con preferencias humanas (RLHF/DPO), algo poco habitual en politicas de manipulacion y que en este caso no esta documentado. Tampoco se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.), que no aplican a este tipo de modelo.

Existe una inconsistencia que conviene senalar: la model card incluye el bloque de ejemplo estandar de LeRobot para entrenar una politica de tipo act (`--policy.type=act`), mientras que el nombre del modelo y sus etiquetas apuntan a gaze_flow_matching. Es probable que el texto sea plantilla sin actualizar, pero conviene verificar el tipo de politica real antes de reutilizar el checkpoint.

## Capacidades

- Generacion de acciones de control (no genera texto): produce comandos motores para un brazo robotico a partir de observaciones visuales y del estado del robot.
- Manipulacion en tarea de cocina: el nombre del repositorio (kitchen-pan) y el dataset (pan-on-hob) indican que la tarea objetivo es colocar o manipular una sarten sobre un fogon.
- Politica visuomotora con flow matching: genera trayectorias de accion de forma generativa, condicionadas por observaciones de 320x240.
- Condicionamiento por mirada (gaze): la etiqueta gaze_flow_matching sugiere que la atencion visual o la direccion de la mirada forma parte de la senal de condicionamiento, lo que puede mejorar la precision en tareas de contacto.
- Integracion con LeRobot: se puede cargar, evaluar y ejecutar con `lerobot-record` apuntando `--policy.path` al checkpoint.
- Soporte de tool calling / function calling: no aplica ni esta documentado.
- Soporte de agentes y razonamiento multi-paso: no aplica ni esta documentado.
- Capacidades multilingues: no aplica (no es un modelo de lenguaje).
- Capacidades especiales (modo thinking, vision, audio): vision si (entrada de imagenes), el resto no disponible.

## Casos de uso

- Linea base para investigacion en politicas de flow matching: sirve como referencia reproducible y con licencia Apache 2.0 para comparar variantes de flow matching condicionado por mirada frente a otros esquemas (action chunking, difusion) en una misma tarea.
- Manipulacion de sartenes en entornos de cocina robotizada: el modelo esta entrenado especificamente para la tarea pan-on-hob, por lo que puede emplearse para mover o colocar una sarten sobre el fogon en un banco de pruebas con camara cenital o frontal a 320x240.
- Punto de partida para fine-tuning en tareas de cocina relacionadas: al ser una politica compacta de 75,2 M de parametros, el coste de reentrenamiento sobre nuevos datasets capturados con LeRobot es bajo en comparacion con modelos VLA grandes.
- Recoleccion y evaluacion de datos con LeRobot: se puede usar `lerobot-record` con `--policy.path` apuntando a este checkpoint para ejecutar episodios de evaluacion y generar datasets etiquetados como `eval_*` que alimenten iteraciones posteriores.
- Validacion de pipelines de imitation learning: util para verificar de extremo a extremo el flujo de LeRobot (entrenamiento, guardado de checkpoints, publicacion en el Hub, inferencia en robot) antes de escalar a modelos mayores.
- Prototipado en hardware de bajo coste: con 75,2 M de parametros y un repositorio de 0,3 GB, la inferencia cabe en GPUs de consumo, lo que permite desplegar la politica en montajes de laboratorio con una sola GPU asequible.
- Estudio del efecto del gaze en el rendimiento: al condicionar por mirada, es un banco de pruebas para medir si la senal de gaze mejora la tasa de exito en tareas de precision frente a politicas equivalentes sin ella.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, numero de episodios de evaluacion, ni comparaciones con otras politicas, y el repositorio no aporta metricas adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: con 75,2 M de parametros, los pesos ocupan aproximadamente 0,3 GB en fp32 y unos 0,15 GB en fp16/bf16. Sumando el codificador visual y los buffers de inferencia, el consumo realista es de 1 a 2 GB de VRAM, aunque no hay cifras oficiales publicadas.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente en la practica. No se requiere A100 ni H100 para inferencia; una RTX 3060, RTX 4060 o superior es mas que suficiente.
- Cabe en GPU de consumo: si, con margen amplio. Incluso una GPU integrada o una Jetson (Orin Nano) es un candidato razonable para despliegue en el propio robot.
- Opciones de despliegue: LeRobot es la via documentada (`lerobot-record` con `--policy.path`). No hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI, que ademas estan orientados a modelos de lenguaje y no aplican a este tipo de politica.
- Latencia y throughput estimados: no disponible. Al ser una politica de control en bucle cerrado, la frecuencia de inferencia (Hz) es un dato critico para produccion y no esta publicado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gfm-kitchen-pan-baseline | Politica visuomotora con flow matching (gaze) | 75,2 M | Imagenes 320x240 + estado del robot (no disponible en detalle) | Apache 2.0 | Hugging Face, ecosistema LeRobot |
| ACT (Action Chunking Transformer, implementado en LeRobot) | Politica de imitacion con action chunking | No disponible en la informacion proporcionada | No disponible | Apache 2.0 (segun el ecosistema LeRobot) | Hugging Face / LeRobot |
| Diffusion Policy (implementado en LeRobot) | Politica generativa basada en difusion | No disponible en la informacion proporcionada | No disponible | Apache 2.0 (segun el ecosistema LeRobot) | Hugging Face / LeRobot |
| Modelos VLA generalistas (por ejemplo SmolVLA) | Vision-language-action | No disponible en la informacion proporcionada | No disponible | No disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada, por lo que la comparacion queda limitada al tipo de enfoque, el tamano y la licencia. Cualquier cifra de parametros o de tasa de exito de los modelos alternativos deberia verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Especificidad de tarea: el modelo esta entrenado para el dominio pan-on-hob con imagenes de 320x240. Fuera de esa distribucion visual o de esa tarea, el comportamiento esperado es pobre.
- Documentacion practicamente inexistente: la model card es una plantilla sin rellenar, sin descripcion de arquitectura, datos, hiperparametros ni metricas. Cualquier uso en produccion exige una evaluacion propia previa.
- Ambiguedad sobre el tipo de politica: el ejemplo de la model card entrena una politica `act`, mientras que el nombre y las etiquetas indican gaze_flow_matching. Hay que verificar el checkpoint real antes de integrarlo.
- Sin benchmarks publicados: no hay tasas de exito ni comparaciones, por lo que no se puede afirmar nada sobre su rendimiento relativo.
- Riesgo de sobreajuste al entorno de captura: sin informacion sobre variabilidad de iluminacion, posiciones de camara o distractor, es probable que la politica sea fragil ante cambios de setup.
- Riesgo de fallo fisico: al tratarse de una politica de manipulacion sobre objetos calientes (fogon, sarten), los errores de la politica pueden provocar danos materiales o personales. Se requiere supervisacion y parada de emergencia.
- Sesgos: no documentados. No hay informacion sobre la diversidad de escenas, objetos u operadores en el dataset de entrenamiento.
- Licencia: Apache 2.0, permisiva para uso comercial, siempre que se conserve el aviso de licencia y se indiquen los cambios. No obstante, la licencia cubre el software y los pesos publicados, no las condiciones de seguridad del despliegue fisico.
- Sin garantias del autor: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay evidencia de validacion por terceros. Se debe tratar como material experimental.
- Idiomas y contexto: no aplica, al no ser un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-kitchen-pan-baseline
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/fecasado/pan-on-hob-320x240
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas de imitacion en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Perfil del autor en Hugging Face: https://huggingface.co/fecasado

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo ni sobre gaze flow matching aplicado a robotica; los resultados obtenidos eran contenido no relacionado y se han descartado. Los unicos enlaces verificables son los del ecosistema LeRobot y del propio repositorio.

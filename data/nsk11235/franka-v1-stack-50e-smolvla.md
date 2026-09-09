# nsk11235/franka-v1-stack-50e-smolvla

## Resumen

El modelo `nsk11235/franka-v1-stack-50e-smolvla` es un modelo de visión-lenguaje-acción (VLA) especializado en robótica, desarrollado como un ajuste fino del modelo base `lerobot/smolvla_base`. SmolVLA es una arquitectura compacta y eficiente presentada en el paper ArXiv 2506.01844, diseñada para obtener rendimientos competitivos en tareas de control robótico con un coste computacional reducido, lo que permite su despliegue en hardware de consumo.

Este modelo concreto está entrenado sobre el dataset `nsk11235/franka-stack-v1-50e-256`, que consiste en episodios de una tarea de apilado (stack) con un brazo robótico Franka. Su tamaño es de 450 millones de parámetros, almacenados en formato safetensors, y el repositorio ocupa 0.9 GB. Se distribuye bajo licencia Apache-2.0 y se integra con el framework LeRobot de Hugging Face, lo que facilita su evaluación y reentrenamiento en entornos robóticos reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA compacto (SmolVLA), vision-language-action |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de accion, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action (VLA) que combina una entrada visual de camara, una instruccion de lenguaje y produce acciones de control de bajo nivel (por ejemplo, posiciones de articulaciones o trayectorias). Esta arquitectura esta pensada para reducir los requisitos computacionales frente a VLA de mayor escala, manteniendo un rendimiento adecuado en tareas de manipulacion robotica.

Este checkpoint es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base`, realizado con el framework LeRobot de Hugging Face. Los datos de entrenamiento provienen del dataset `nsk11235/franka-stack-v1-50e-256`, que contiene observaciones de interacciones con un brazo Franka realizando tareas de apilado. No se han publicado detalles adicionales sobre el numero de tokens, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO. El proceso de entrenamiento esta documentado en la guia oficial de LeRobot.

## Capacidades

- Generacion de acciones de control robotico: el modelo produce comandos de actuacion para un brazo Franka en tareas de apilado de objetos.
- Integracion nativa con LeRobot: permite reentrenar, evaluar y desplegar la politica mediante las herramientas oficiales de LeRobot.
- Entrada multimodal: procesa informacion visual y texto (instrucciones) para seleccionar la accion adecuada.
- Eficiencia computacional: al contar con solo 450 millones de parametros, esta disenado para ejecutarse en hardware de consumo, segun la descripcion de SmolVLA.
- No soporta tool calling, generacion de texto libre ni funciones de agente conversacional: su campo de aplicacion es exclusivamente la robotica.
- Capacidades multilingues: no disponibles; el modelo no esta orientado a procesamiento de lenguaje natural generativo.

## Casos de uso

- Apilado de objetos en laboratorios de robotica: el modelo puede controlar un brazo Franka para colocar bloques u objetos en posiciones concretas, gracias a su entrenamiento especifico en la tarea de stack.
- Investigacion en aprendizaje por imitacion: se puede utilizar como politica de referencia para comparar algoritmos de imitacion o para transferir conocimiento a tareas similares con LeRobot.
- Automatizacion de tareas repetitivas en fabricacion: en entornos controlados, puede ejecutar tareas de ensamblaje o apilado de componentes con una precision adecuada, reduciendo la necesidad de programacion manual.
- Prototipado rapido de robots esqueleto: el modelo es util para validar rapidamente politicas de control en brazos roboticos Franka sin necesidad de grandes infraestructuras de GPU.
- Robotica educativa: al poder desplegarse en hardware de consumo, permite montar practicas de robotica basadas en vision-lenguaje-accion en aulas o entornos academicos.
- Evaluacion de VLA en benchmarks de manipulacion: sirve como caso de estudio para medir el rendimiento de modelos compactos en tareas de manipulacion de objetos con datos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos de VRAM especificos para este modelo en la informacion disponible.
- El modelo card indica que SmolVLA puede desplegarse en hardware de consumo, lo que sugiere que es viable en GPUs consumer, aunque no se especifican modelos concretos.
- El repositorio tiene un tamano de 0.9 GB, lo que da una idea de la magnitud de los pesos.
- Las opciones de despliegue incluyen el framework LeRobot y Hugging Face Hub, sin que se hayan documentado integraciones con vLLM, llama.cpp o TGI.
- No se han publicado datos de latencia ni de throughput.

## Comparativa con modelos similares

No se dispone de informacion de modelos comparables en los datos proporcionados. El modelo es un ajuste fino de `lerobot/smolvla_base`, por lo que comparte arquitectura y numero de parametros con el modelo base, pero no existen cifras de benchmarks ni detalles especificos de otras alternativas.

## Limitaciones y advertencias

- El modelo ha sido entrenado exclusivamente sobre un dataset de apilado con un brazo Franka; su capacidad de generalizacion a otros brazos, objetos o entornos no esta verificada.
- No se han evaluado formalmente sesgos en el modelo. El comportamiento puede estar condicionado por la distribucion de datos del dataset de entrenamiento.
- Riesgo de acciones incorrectas o incoherentes en escenarios fuera de la distribucion de entrenamiento (por ejemplo, cambios de iluminacion, obstaculos o nuevas configuraciones de objetos).
- No hay informacion sobre limitaciones de contexto o idioma, al tratarse de un modelo de accion.
- La licencia Apache-2.0 permite el uso comercial, pero el usuario debe evaluar las implicaciones legales y eticas del despliegue de este modelo en sistemas roboticos reales.
- No se incluyen garantias de seguridad ni certificaciones para uso industrial o en entornos con personas.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/nsk11235/franka-v1-stack-50e-smolvla](https://huggingface.co/nsk11235/franka-v1-stack-50e-smolvla)
- Paper de SmolVLA: [https://huggingface.co/papers/2506.01844](https://huggingface.co/papers/2506.01844)
- Framework LeRobot: [https://github.com/huggingface/lerobot](https://github.com/huggingface/lerobot)
- Documentacion de LeRobot: [https://huggingface.co/docs/lerobot/index](https://huggingface.co/docs/lerobot/index)
- Dataset de entrenamiento: [https://huggingface.co/datasets/nsk11235/franka-stack-v1-50e-256](https://huggingface.co/datasets/nsk11235/franka-stack-v1-50e-256)
- Modelo base: [https://huggingface.co/lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)

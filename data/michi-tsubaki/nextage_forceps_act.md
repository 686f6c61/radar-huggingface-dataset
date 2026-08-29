# Michi-Tsubaki/nextage_forceps_act

## Resumen

El modelo `Michi-Tsubaki/nextage_forceps_act` es un checkpoint de política robótica entrenado con la arquitectura ACT (Action Chunking with Transformers) dentro del ecosistema LeRobot. Está desarrollado por Michitoshi Tsubaki, estudiante de maestría en el JSK Robotics Lab de la Universidad de Tokio, y está orientado a la tarea de entregar un fórceps a una mano en el robot de doble brazo NEXTAGE de Kawada Industries. El modelo resuelve el problema de control de manipulación dexterosa mediante aprendizaje por imitación, generando secuencias de acciones a partir de observaciones visuales y del estado del robot.

Con 51,65 millones de parámetros, el modelo utiliza un backbone visual ResNet-18 preentrenado en ImageNet y procesa imágenes de dos cámaras (superior y muñeca derecha) junto con un vector de estado/acción de 17 dimensiones. El checkpoint final corresponde al paso 5.000 de entrenamiento, con un tamaño de chunk de acciones de 60. Su relevancia radica en ser un ejemplo práctico de aplicación de ACT a un robot humanoide de doble brazo en un entorno médico, demostrando la viabilidad de LeRobot para tareas de manipulación fina.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone ResNet-18 |
| Parametros totales | 51.650.193 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT, que combina un codificador visual (ResNet-18) con un transformador que predice secuencias de acciones (action chunking). El entrenamiento se realizó sobre el dataset `Michi-Tsubaki/hand_over_the_forceps_to_the_hand`, que contiene 50 episodios de demostración, de los cuales se usaron los primeros 45 para entrenamiento. Se ejecutaron 5.000 pasos con un tamaño de lote de 256, y el checkpoint se guardó cada 1.000 pasos. Las imágenes de entrada provienen de dos cámaras (superior y muñeca derecha), redimensionadas a 360x480 píxeles. El vector de estado y acción tiene 17 dimensiones. No se menciona el uso de RLHF ni DPO; es un aprendizaje por imitación supervisado estándar.

## Capacidades

- Control robótico de manipulación: genera comandos de acción para el robot NEXTAGE a partir de observaciones visuales y del estado articular.
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset, específicamente la tarea de entregar un fórceps a una mano.
- Procesamiento multimodal: integra dos flujos de imagen (cámara superior y cámara de muñeca) con datos de estado del robot.
- Generación de secuencias de acciones: produce chunks de 60 pasos de acción, lo que permite movimientos suaves y coordinados.
- No es un modelo de lenguaje: no genera texto, no tiene capacidades de razonamiento simbólico ni de conversación.

## Casos de uso

- Robótica médica: el modelo puede integrarse en sistemas de asistencia quirúrgica donde un robot NEXTAGE debe entregar instrumentos (como fórceps) a un cirujano o a otro sistema robótico, reduciendo la carga de trabajo del personal.
- Automatización de laboratorio: en entornos de investigación biomédica, el robot puede manipular herramientas pequeñas y pasarlas a un operador humano, liberando tiempo para tareas de mayor valor.
- Entrenamiento de políticas robóticas: sirve como punto de partida para fine-tuning en tareas similares de entrega de objetos, aprovechando el checkpoint preentrenado y el pipeline de LeRobot.
- Evaluación de algoritmos de aprendizaje por imitación: investigadores pueden comparar el rendimiento de ACT frente a otras arquitecturas (diffusion policies, etc.) en la misma tarea y dataset.
- Desarrollo de sistemas de teleoperación asistida: el modelo puede usarse como política de bajo nivel en un sistema híbrido donde un operador humano supervisa y corrige las acciones del robot.
- Demostraciones educativas: en cursos de robótica y aprendizaje automático, este checkpoint permite a estudiantes experimentar con control basado en visión y acción en un robot real o simulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de métricas como tasa de éxito, precisión de agarre o tiempo de ejecución.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado el tamaño del modelo (51,65 M de parámetros) y el uso de ResNet-18, es probable que quepa en GPUs de consumo con al menos 8 GB de VRAM, pero no se proporcionan datos oficiales.
- GPU recomendadas: no disponible. Se puede inferir que una GPU moderna de gama media (por ejemplo, RTX 3060 o superior) sería suficiente para inferencia, pero no hay confirmación.
- Compatibilidad con consumer GPU: probablemente sí, por el tamaño reducido del modelo, pero no está documentado.
- Opciones de despliegue: el modelo se carga mediante la librería LeRobot (`lerobot.policies.act.modeling_act.ACTPolicy`). No se mencionan otros frameworks como vLLM, llama.cpp u Ollama, que son específicos de modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros modelos comparables para la misma tarea o con la misma arquitectura en el contexto de NEXTAGE.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (entrega de fórceps) y no es generalizable a otras tareas sin reentrenamiento.
- No tiene capacidades de lenguaje ni de razonamiento simbólico; es exclusivamente un controlador de bajo nivel.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial o modificación.
- El dataset de entrenamiento es pequeño (45 episodios), lo que puede limitar la robustez ante variaciones del entorno o del objeto.
- No se documentan sesgos ni riesgos de alucinación, pero al ser un modelo de control físico, cualquier error de predicción puede traducirse en movimientos inseguros del robot.
- La información sobre hardware y rendimiento es insuficiente para planificar un despliegue en producción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Michi-Tsubaki/nextage_forceps_act)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Michi-Tsubaki/hand_over_the_forceps_to_the_hand)
- [Repositorio del robot NEXTAGE (ROS-OpenRTM)](https://github.com/tork-a/rtmros_nextage)
- [Perfil de GitHub del autor](https://github.com/Michi-Tsubaki)
- [Página personal del autor](https://michi-tsubaki.github.io/index.html)

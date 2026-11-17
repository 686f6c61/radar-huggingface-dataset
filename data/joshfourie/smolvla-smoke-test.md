# JoshFourie/smolvla-smoke-test

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado en el ecosistema de LeRobot de Hugging Face, disenado para controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. El modelo que nos ocupa, `JoshFourie/smolvla-smoke-test`, es un ajuste fino (finetune) del checkpoint base `lerobot/smolvla_base` sobre el dataset `lerobot/svla_so100_pickplace`, orientado a tareas de recogida y colocacion con el brazo robotico SO-100.

Con 450 millones de parametros, SmolVLA apunta a un nicho claro: politicas roboticas que puedan entrenarse y ejecutarse en hardware de consumo, sin depender de clusters de GPU. El modelo base se describe en el paper arXiv 2506.01844, que presenta SmolVLA como un VLA "compacto y eficiente" con rendimiento competitivo a coste computacional reducido.

Es relevante ahora porque el despliegue de modelos VLA en robotica de bajo coste (SO-100, SO-101) esta creciendo rapidamente, y propuestas como esta demuestran que no hace falta un modelo de decenas de miles de millones de parametros para tareas de manipulacion acotadas. Este checkpoint concreto, no obstante, parece un artefacto de prueba ("smoke test") y no un modelo destinado a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) sobre transformer; detalles especificos no disponibles en la informacion proporcionada |
| Parametros totales | 450.046.176 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/smolvla_base |
| Dataset de ajuste | lerobot/svla_so100_pickplace |
| Pipeline | robotics |
| Tamano del repo | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action: combina un codificador visual, un componente de lenguaje y un cabezal de accion que produce comandos motores para el robot. El paper de referencia (arXiv 2506.01844) lo describe como un VLA compacto y eficiente pensado para hardware de consumo. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset del modelo base ni si se aplicaron tecnicas de RLHF o DPO.

Este checkpoint concreto se ha obtenido ajustando `lerobot/smolvla_base` sobre el dataset `lerobot/svla_so100_pickplace`, una coleccion de episodios de demostracion de la tarea de recoger y colocar con el brazo SO-100. El entrenamiento se ha realizado con la herramienta `lerobot-train` del ecosistema LeRobot. Por el nombre del repositorio ("smoke test") y las fechas de creacion y actualizacion (separadas por ocho segundos), todo apunta a una ejecucion de prueba del pipeline de entrenamiento mas que a un ajuste cuidadoso.

## Capacidades

- Control roboticode manipulacion: genera acciones motoras para el brazo SO-100 a partir de observaciones visuales e instrucciones de tarea.
- Percepcion visual: procesa imagenes de camara como entrada para condicionar las acciones.
- Comprension de instrucciones en lenguaje natural: el componente de lenguaje permite condicionar la politica por texto (segun la definicion generica de SmolVLA; no se detalla el alcance en este checkpoint).
- Ajuste a tarea especifica: especializado en la tarea de pick-and-place del dataset `svla_so100_pickplace`.
- Integracion con LeRobot: entrenamiento, evaluacion y despliegue mediante `lerobot-train` y `lerobot-record`.
- No se dispone de informacion sobre soporte de tool calling, agentes, modo thinking, audio ni capacidades multilingues.

## Casos de uso

- Validacion de pipelines de entrenamiento: usar este checkpoint como prueba de humo para verificar que el flujo `lerobot-train` produce artefactos correctos antes de lanzar entrenamientos reales.
- Prototipado de tareas pick-and-place: servir de punto de partida para experimentar con el brazo SO-100 en tareas de recogida y colocacion en laboratorio.
- Evaluacion de politicas con `lerobot-record`: ejecutar episodios de evaluacion sobre el robot fisico y comparar el comportamiento frente a otros checkpoints.
- Docencia y formacion en robotica: ejemplo de bajo coste (450 M de parametros, repo de 0,9 GB) para explicar el ciclo completo de un VLA, desde el dataset hasta la inferencia.
- Investigacion en VLA compactos: base para estudiar el efecto del ajuste fino sobre tareas acotadas y comparar con el modelo base `lerobot/smolvla_base`.
- Despliegue en hardware de consumo: al ser un modelo pequeno, permite probar inferencia en estaciones de trabajo con GPU consumer, en linea con la filosofia de SmolVLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M de parametros, en FP16 el peso ocupa aproximadamente 0,9 GB; en FP32, unos 1,8 GB. La VRAM total dependera del codificador visual y de los buffers intermedios, no cuantificados en la informacion disponible.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM deberia ser suficiente para el modelo en si; no hay datos oficiales de requisitos.
- GPU consumer: por tamano, cabe holgadamente en tarjetas como RTX 3060, RTX 4060 o superiores; no confirmado por el autor.
- Opciones de despliegue: el flujo oficial es LeRobot (`lerobot-record` con `--policy.path`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoshFourie/smolvla-smoke-test | 450 M | no disponible | VLA pick-and-place (SO-100) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA generalista | Apache 2.0 (segun modelo base) | Hugging Face |
| Otros VLA de referencia (p. ej. OpenVLA, pi0) | no disponible en la informacion | no disponible | VLA generalista | no disponible | no disponible |

La comparativa con alternativas de la misma categoria no puede completarse con rigor porque la informacion proporcionada solo cubre este checkpoint y su modelo base. No se aportan datos de rendimiento comparables.

## Limitaciones y advertencias

- Es un artefacto de prueba ("smoke test"): no debe tratarse como un modelo listo para produccion ni para uso robotico real sin validacion previa.
- Especializacion estrecha: ajustado unicamente al dataset `svla_so100_pickplace`; el comportamiento fuera de esa tarea y ese robot es incierto.
- Sin datos de evaluacion: cero descargas y cero likes, sin benchmarks publicados; no hay evidencia de calidad.
- Riesgo de sobreajuste al dataset de demostracion y de fallo ante variaciones de iluminacion, posicion de objetos o del propio robot.
- Sesgos: no documentados; al entrenarse con demostraciones humanas puede heredar sesgos de las trayectorias del dataset.
- Alucinacion en el componente de lenguaje: posible generacion de instrucciones o representaciones inconsistentes con la escena; no evaluado.
- Idiomas: no se especifica que idiomas soporta el componente de lenguaje.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Sin informacion sobre cuantizacion, contexto ni latencia, lo que dificulta planificar un despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoshFourie/smolvla-smoke-test
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA (arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- Dataset de ajuste: https://huggingface.co/datasets/lerobot/svla_so100_pickplace
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot

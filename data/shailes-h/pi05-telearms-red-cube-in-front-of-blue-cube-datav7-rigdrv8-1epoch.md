# shailes-h/pi05-telearms-red-cube-in-front-of-blue-cube-datav7-rigdrv8-1epoch

## Resumen

`pi05-telearms-red-cube-in-front-of-blue-cube-datav7-rigdrv8-1epoch` es un ajuste fino completo del modelo base `lerobot/pi05_base`, un modelo de politica visomotora (vision-language-action, VLA) orientado a control robotico. Lo publica el usuario `shailes-h` dentro de la libreria LeRobot y esta especializado en una tarea concreta de manipulacion bimanual: colocar o manipular un cubo rojo delante de un cubo azul con el rig de teleoperacion TeleArms (variante YAM).

El modelo parte de la arquitectura pi0.5 de Physical Intelligence, con 4.143.404.816 parametros (aproximadamente 4,14 mil millones) almacenados en safetensors, y se ha entrenado durante una sola epoca sobre un dataset propio de demostraciones de teleoperacion. No es un modelo de lenguaje general: es una politica que recibe observaciones visuales y de estado del robot y emite acciones motoras.

Su relevancia es acotada y practica: sirve como ejemplo reproducible de ajuste fino de pi0.5 con LeRobot para una tarea especifica, con receta de entrenamiento documentada (learning rate, dropout de estado, augmentacion de imagen, particion 90/10). No dispone de descargas ni interacciones en el momento de redactar esta ficha, y la model card no incluye resultados de evaluacion ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (vision-language-action), ajuste fino completo del modelo base `lerobot/pi05_base` |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica; las entradas linguisticas son prompts de tarea, sin lista de idiomas publicada) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json`, preprocesador/postprocesador de politica y `train_config.json` |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (vision incluida) de `lerobot/pi05_base`, la implementacion en LeRobot de la politica pi0.5. Se trata de una politica visomotora que combina un codificador visual, un componente linguistico para los prompts de tarea y una cabeza de accion que genera comandos motores; el repositorio incluye los ficheros `policy_preprocessor*` y `policy_postprocessor*` con las estadisticas de normalizacion necesarias para la inferencia. El checkpoint pesa 9,4 GB en total.

El entrenamiento se realizo sobre el dataset `shailes-h/telearms-red-cube-in-front-of-blue-cube-datav7-rigdrv8`, con la particion del 90 % para entrenamiento: 1656 pasos con batch global de 2048 (8 GPU B200, 128 por dispositivo, acumulacion de gradiente 2). Se uso learning rate 2e-4 con calentamiento lineal durante el 10 % inicial de pasos y valor constante despues, dropout de estado de 0,3, ruido de estado de 0,05, augmentacion de imagen y variantes de prompt. El 10 % restante se reservo para evaluacion. El entrenamiento se ejecuto en NUS Hopper con NVIDIA B200. La receta sigue la del modelo `shailes-h/pi05-telearms-yam-cube-v5-s2r-red-left-of-blue-1epoch`.

## Capacidades

- Generacion de acciones motoras para un robot bimanual a partir de observaciones visuales y de estado.
- Control de una tarea especifica de manipulacion: cubo rojo delante de cubo azul con el rig TeleArms/YAM.
- Procesamiento de prompts de tarea en texto (variantes de prompt usadas durante el entrenamiento).
- Ajuste fino completo, incluida la torre de vision, lo que permite adaptacion a la camara y al entorno del rig concreto.
- Normalizacion de entradas y salidas incluida en el repositorio, lo que facilita la integracion en el pipeline de LeRobot.
- No se documentan capacidades de tool calling, razonamiento multi-paso general, vision general, audio ni modo de pensamiento.

## Casos de uso

- Reproduccion de la receta de ajuste fino: sirve como referencia practica para entrenar pi0.5 sobre un dataset propio de teleoperacion con LeRobot, dado que se publican `train_config.json` y `telearms_recipe.json`.
- Manipulacion de objetos en laboratorio: ejecutar la tarea de colocar un cubo rojo delante de uno azul con el rig TeleArms/YAM como banco de pruebas de politicas VLA.
- Evaluacion de generalizacion con augmentacion: comparar el comportamiento del modelo en el 10 % de datos reservados frente al conjunto de entrenamiento para medir sobreajuste tras una sola epoca.
- Base para ajustes posteriores: al ser un fine-tune completo, puede servir de punto de partida para tareas relacionadas del mismo rig sin volver a partir de `pi05_base`.
- Investigacion en robotica bimanual: analizar como una politica VLA de ~4,1 mil millones de parametros resuelve una tarea de posicionamiento relativo entre objetos.
- Docencia y divulgacion: ejemplo tangible de pipeline completo (dataset, receta, checkpoint, preprocesadores) para explicar el flujo de trabajo de LeRobot en robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito en la tarea, tasas de acierto ni comparaciones cuantitativas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 4,14 mil millones de parametros, el peso en precision completa ronda los 8,3 GB en bfloat16, por lo que se necesita margen adicional para activaciones y buffers visuales.
- GPU de entrenamiento documentadas: 8 x NVIDIA B200 (NUS Hopper), batch global 2048 con acumulacion de gradiente 2.
- GPU recomendadas para inferencia: no disponible; por tamano, cabria esperar que quepa en GPU de consumo con suficiente VRAM, pero no se ha publicado confirmacion.
- Opciones de despliegue: libreria LeRobot (el repositorio incluye preprocesador y postprocesador de politica). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`pi05-telearms-...-1epoch`) | 4.143.404.816 | no disponible | Cubo rojo delante de cubo azul, rig TeleArms/YAM | no disponible | Hugging Face, 0 descargas |
| `lerobot/pi05_base` | no disponible | no disponible | Politica VLA general (modelo base) | no disponible | Hugging Face |
| `shailes-h/pi05-telearms-yam-cube-v5-s2r-red-left-of-blue-1epoch` | no disponible | no disponible | Tarea relacionada (cubo rojo a la izquierda del azul) | no disponible | Hugging Face |

No se dispone de datos de rendimiento de ninguno de los tres modelos en la informacion proporcionada, por lo que la comparacion se limita a proposito, origen y disponibilidad.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta entrenado para una unica tarea y un rig concreto; no se espera que generalice a otros objetos, camaras o configuraciones roboticas.
- Entrenamiento de una sola epoca: 1656 pasos pueden ser insuficientes para una convergencia robusta; no se publican curvas de perdida ni metricas de evaluacion.
- Sin licencia declarada: no se especifica licencia, lo que impide determinar si el uso comercial esta permitido. Debe tratarse como no apto para produccion hasta aclararlo.
- Sin idiomas declarados ni documentacion de comportamiento multilingue en los prompts de tarea.
- Riesgo de sobreajuste al entorno de entrenamiento (iluminacion, posicion de camara, fondo) por el ajuste fino completo de la torre de vision.
- Sin datos de sesgos, alucinacion o robustez; al ser una politica motora, los fallos se manifiestan como acciones incorrectas, con riesgo fisico en el robot.
- Cero descargas y cero interacciones: no hay validacion externa de su funcionamiento.
- No se documentan requisitos de hardware de inferencia ni latencias, lo que complica planificar un despliegue en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shailes-h/pi05-telearms-red-cube-in-front-of-blue-cube-datav7-rigdrv8-1epoch
- Dataset de entrenamiento: https://huggingface.co/datasets/shailes-h/telearms-red-cube-in-front-of-blue-cube-datav7-rigdrv8
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Modelo de referencia de la receta: `shailes-h/pi05-telearms-yam-cube-v5-s2r-red-left-of-blue-1epoch` (referenciado en la model card; no se proporciona URL directa)

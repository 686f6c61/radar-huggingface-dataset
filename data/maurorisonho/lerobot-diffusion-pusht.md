# maurorisonho/lerobot-diffusion-pusht

## Resumen

El modelo `maurorisonho/lerobot-diffusion-pusht` es una política robótica de tipo **Diffusion Policy** entrenada por imitación para la tarea de manipulación Push-T en simulación. Lo publica el usuario maurorisonho como material del curso de robótica de Hugging Face basado en el framework LeRobot, y el repositorio incluye los pesos en safetensors, las configuraciones de entrenamiento y un vídeo de reproducción (`replay.mp4`) que documenta el comportamiento aprendido.

Se trata de un modelo de control, no de un modelo de lenguaje: recibe observaciones del entorno simulado (Push-T, sobre MuJoCo/Gym) y produce acciones para el efector final de un brazo robótico. Su tamaño es de 262.709.062 parámetros (unos 262,7 millones) y el repositorio completo ocupa 1,1 GB, lo que incluye pesos, configuraciones y el vídeo de replay.

Su relevancia es práctica y docente: sirve como referencia reproducible de entrenamiento por imitación con políticas de difusión dentro del ecosistema LeRobot, y el autor declara una tasa de éxito superior al 95 % en el benchmark Push-T. Al estar publicado bajo licencia Apache 2.0 y con 0 descargas y 0 likes en el momento de la consulta, debe considerarse un artefacto de curso o de validación personal, no un modelo con adopción comunitaria contrastada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (politica de difusion condicionada para generacion de acciones); no se detalla la topologia interna en la model card |
| Parametros totales | 262.709.062 (≈262,7 millones), segun los pesos safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica: no es un modelo de lenguaje; la politica opera sobre observaciones y horizonte de acciones no especificados) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (no aplica: el modelo no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`model.safetensors`) |
| Libreria / framework | LeRobot (PyTorch) |
| Pipeline declarado | robotics |
| Entorno / tarea | Push-T, simulacion MuJoCo / Gym |
| Tamano del repositorio | 1,1 GB |
| Tasa de exito declarada | >95 % en Push-T (segun la model card del autor) |
| Fecha de creacion | 2026-09-20 (metadato del repositorio) |
| Fecha de actualizacion | 2026-09-20 (metadato del repositorio) |

## Arquitectura y entrenamiento

La model card identifica el modelo como una **Diffusion Policy**, es decir, una política que genera secuencias de acciones mediante un proceso de difusión condicionado por las observaciones del entorno. El framework indicado es `lerobot` junto con PyTorch. No se especifica en la información proporcionada el tipo de red de denoising empleada (por ejemplo, U-Net temporal 1D o transformer), el número de pasos de difusión, el horizonte de predicción de acciones, ni la dimensionalidad exacta del espacio de observación y de acción. Tampoco se documenta si existe condicionamiento por imagen (observación visual) o solo por estado de bajo nivel.

El entrenamiento es por **imitación (imitation learning)** sobre demostraciones de la tarea Push-T, tal como indican las etiquetas `imitation-learning` y `pusht`. No hay información disponible sobre el número de episodios de demostración, la composición del dataset, el número de pasos de entrenamiento, el esquema de ruido o si se aplicaron técnicas posteriores de refinamiento (RLHF, DPO u otras, que en cualquier caso no son habituales en este tipo de políticas). El repositorio incluye configuraciones de entrenamiento, pero su contenido no se ha facilitado en la información de partida.

Como innovación destacable, el propio enfoque de política de difusión es relevante: permite modelar distribuciones multimodales de acciones, algo útil en tareas de contacto como Push-T, donde el objeto puede empujarse desde distintos lados. El autor declara una tasa de éxito superior al 95 %, y aporta un vídeo (`replay.mp4`) que permite inspeccionar cualitativamente el comportamiento, aunque no se aportan métricas adicionales ni protocolo de evaluación.

## Capacidades

- Control robótico por imitación en la tarea Push-T: generación de acciones para el efector final a partir de observaciones del entorno simulado.
- Modelado multimodal de acciones: al ser una política de difusión, puede representar múltiples estrategias válidas de resolución de la tarea.
- Ejecución en bucle cerrado en simulación sobre MuJoCo / Gym, con la librería LeRobot como interfaz de carga y ejecución.
- Reproducción del entrenamiento: el repositorio incluye configuraciones que permiten reentrenar o inspeccionar el pipeline.
- Inspección cualitativa del comportamiento mediante el vídeo de replay incluido.
- No dispone de capacidades de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües ni de visión general: su entrada está ligada al espacio de observación de Push-T.
- No se documentan modos especiales (thinking mode, audio, etc.).

## Casos de uso

- Material docente para un curso de robótica: permite a estudiantes cargar una política de difusión ya entrenada en LeRobot y estudiar cómo se estructura un pipeline de imitación completo, desde las demostraciones hasta la evaluación en simulación.
- Reproducción de resultados de referencia en Push-T: sirve como punto de partida para verificar que el entorno MuJoCo/Gym, la versión de LeRobot y el hardware de evaluación producen resultados coherentes con el >95 % declarado.
- Línea base en investigación sobre políticas de difusión: útil para comparar variantes de número de pasos de denoising, horizontes de acción o arquitecturas de denoising sin partir de cero.
- Validación de pipelines de datos de demostración: al existir una política funcional, se puede usar para medir cómo cambios en la calidad, cantidad o aumentación de demostraciones afectan a la tasa de éxito.
- Pruebas de regresión en herramientas de entrenamiento: si se modifica el código de LeRobot, este checkpoint permite comprobar que el entrenamiento y la inferencia siguen produciendo políticas competitivas en Push-T.
- Experimentos de sim-to-real como etapa previa: la política puede emplearse para estudiar transferencia a un banco real con un empujador de dos grados de libertad, aceptando la brecha de dominio inherente a un modelo entrenado solo en simulación.
- Demostraciones en vivo de imitación robótica: el vídeo de replay y la carga sencilla del checkpoint permiten mostrar en charlas o clases cómo una política de difusión resuelve una tarea de contacto.
- Estudios de multimodalidad de comportamiento: Push-T admite distintas estrategias de empuje, por lo que el modelo es adecuado para analizar si la política captura modos múltiples o colapsa a una única estrategia.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Fuente |
|---|---|---|---|
| Push-T (simulacion MuJoCo / Gym) | Tasa de exito | >95 % | Model card del autor |
| Otros benchmarks (MMLU, HumanEval, GSM8K, etc.) | No aplica | No aplica | No es un modelo de lenguaje |

No se han publicado en la información disponible resultados adicionales de benchmarks, comparaciones controladas ni métricas de latencia, robustez o generalización. El dato de >95 % procede exclusivamente de la model card y no se acompaña de protocolo de evaluación, número de episodios ni semillas.

## Requisitos de hardware

- Tamano de pesos: 262.709.062 parametros. Estimacion de memoria solo para pesos: aproximadamente 1,05 GB en fp32, 0,53 GB en fp16/bf16 y 0,26 GB en int8.
- VRAM para inferencia: holgadamente por debajo de 2 GB con lote 1, sumando activaciones; cualquier GPU de consumo con 4-6 GB es suficiente. No hay cifras oficiales publicadas.
- Inferencia en CPU: viable en principio dado el tamano del modelo, aunque la latencia dependera del numero de pasos de denoising, que no se documenta.
- GPU recomendadas: no hay recomendaciones oficiales. Para entrenamiento, una GPU de consumo con 8-16 GB es un punto de partida razonable para lotes pequenos, aunque el requisito real depende de la resolucion de imagen, el horizonte de acciones y el numero de pasos de difusion, datos no disponibles.
- GPU de datacenter (A100, H100) recomendadas solo si se busca entrenar con lotes grandes o realizar barridos de hiperparametros; para inferencia son sobredimensionadas.
- Opciones de despliegue: la libreria LeRobot sobre PyTorch, con evaluacion en MuJoCo / Gym. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Exportacion a ONNX, TensorRT u otros runtimes: no documentada.
- Latencia y throughput: no disponibles. En politicas de difusion la latencia de inferencia depende criticamente del numero de pasos de denoising y de si se usa decodificacion por trozos de acciones; ninguno de estos parametros se especifica.

## Comparativa con modelos similares

No se dispone de datos verificados en la informacion proporcionada para comparar este checkpoint con alternativas concretas.

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| maurorisonho/lerobot-diffusion-pusht | 262.709.062 | No disponible | >95 % en Push-T (declarado por el autor) | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| Otros checkpoints de Diffusion Policy para Push-T en el ecosistema LeRobot | No disponible | No disponible | No disponible | No disponible | No verificados en la busqueda realizada |
| Politicas alternativas del mismo ecosistema (por ejemplo, familias ACT o TDMPC en LeRobot) | No disponible | No disponible | No disponible | No disponible | No verificados en la busqueda realizada |

La busqueda web realizada no devolvio resultados relacionados con el modelo ni con LeRobot: los enlaces recuperados pertenecen a un portal de contenido religioso sin relacion con el tema. Por tanto, no se ha podido contrastar el rendimiento declarado con terceros.

## Limitaciones y advertencias

- La model card es muy breve: no documenta arquitectura interna, espacio de observacion y accion, horizonte de acciones, numero de pasos de difusion ni protocolo de evaluacion.
- La tasa de exito >95 % es una afirmacion del autor sin metodologia publicada: no se indica numero de episodios, semillas, criterio de exito ni condiciones iniciales.
- No hay validacion externa: 0 descargas y 0 likes en el momento de la consulta, y la busqueda web no encontro referencias al modelo.
- Naturaleza del artefacto: es una politica de control especifica de Push-T. No es reutilizable como modelo de lenguaje ni como modelo de vision general, y no respondera a entradas fuera de su espacio de observacion.
- Riesgo de sobreajuste a la simulacion: al entrenarse por imitacion en un entorno simulado, es esperable una brecha de dominio si se traslada a hardware real; el autor no documenta ninguna evaluacion sim-to-real.
- Sesgos del dataset de demostraciones: al ser aprendizaje por imitacion, la politica hereda las estrategias, velocidades y sesgos de los datos de entrenamiento. La composicion de estos datos no es publica en la informacion disponible.
- Multimodalidad potencialmente incompleta: si el numero de pasos de inferencia se reduce para bajar latencia, una politica de difusion puede colapsar a modos suboptimos; no se documentan configuraciones de compromiso.
- Idiomas: no aplica. No existe soporte linguistico que evaluar.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero la licencia del dataset de demostraciones subyacente no se especifica; conviene verificarla antes de un uso comercial.
- Metadatos a revisar: las fechas de creacion y actualizacion registradas (2026-09-20) son inusualmente tardias y conviene comprobarlas antes de citar el modelo.
- Para produccion: al no existir cifras de latencia ni de frecuencia de control alcanzable, no es posible garantizar el cumplimiento de requisitos de tiempo real sin medicion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maurorisonho/lerobot-diffusion-pusht
- Autor: https://huggingface.co/maurorisonho
- Libreria indicada en el modelo, LeRobot: https://github.com/huggingface/lerobot (referencia mencionada en la model card; no recuperada en la busqueda web)
- Curso de robotica de Hugging Face con LeRobot (mencionado por el autor): no disponible como URL concreta en la informacion proporcionada
- Paper, blog, repositorio o demo adicionales: no disponibles. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo.

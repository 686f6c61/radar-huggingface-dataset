# felsager/pi05_cube2cross_dr

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en entornos abiertos y la ejecucion de tareas roboticas manipulativas. Esta ficha concreta, `felsager/pi05_cube2cross_dr`, es un fine-tuning del modelo base `lerobot/pi05_base` realizado por el usuario felsager mediante la libreria LeRobot de Hugging Face. El modelo esta especializado en una tarea muy concreta: recoger un cubo de un color determinado y colocarlo sobre una cruz roja, usando un robot UR5e con mano equipada.

El modelo consume observaciones multimodales (estado del robot de 10 dimensiones y tres flujos de imagen: dos camaras a 480x640 y una tercera a 224x224) y produce un vector de accion de 10 dimensiones. Con 4.143.404.816 parametros y un repositorio de 24,9 GB en formato safetensors, se trata de un modelo de gran tamano para el ambito de la robotica de imitacion, lo que refleja la herencia de su base VLA.

Es relevante ahora porque ejemplifica el flujo actual de fine-tuning de modelos VLA de proposito general sobre tareas especificas mediante datasets de demostracion, un patron cada vez mas comun en investigacion aplicada de robotica. No obstante, se trata de un artefacto de investigacion sin resultados de evaluacion publicados y con una licencia Gemma que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); implementacion LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo es un VLA derivado de π₀.₅ de Physical Intelligence, que evoluciona π₀ para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementacion disponible en este repositorio procede del repositorio OpenPI de Physical Intelligence y se ha integrado en el ecosistema LeRobot. La arquitectura combina un componente de vision-lenguaje con un cabezal de accion que mapea las observaciones multimodales a comandos motores de 10 dimensiones.

El fine-tuning se realizo sobre el dataset `felsager/vla_cubes_cross_dr`, compuesto por 999 episodios y 510.363 frames a 30 FPS, con cuatro tareas de recogida y colocacion de cubos (verde, azul, amarillo y rojo) sobre una cruz roja. La configuracion de entrenamiento fue de 30.000 pasos, batch size 8, optimizador AdamW, learning rate 5e-05, semilla 0 y LeRobot 0.6.2. No se especifica el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de imitacion robotica, el paradigma habitual es el aprendizaje por imitacion supervisado, aunque el autor no lo detalla.

## Capacidades

- Control robotico de manipulacion: genera acciones de 10 dimensiones para un robot UR5e con mano equipada.
- Percepcion multimodal: procesa estado del robot y tres flujos de imagen (camara superior, camara de muneca y una tercera camara).
- Ejecucion de tareas de pick-and-place guiadas por instruccion en lenguaje natural (cuatro variantes de color de cubo).
- Aprendizaje por imitacion a partir de demostraciones: reproduce politicas entrenadas sobre 999 episodios.
- Integracion con el ecosistema LeRobot: ejecutable mediante `lerobot-rollout` y entrenable con `lerobot-train`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general ni otras modalidades (audio, thinking mode) en la informacion disponible.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: el modelo ejecuta la tarea de recoger un cubo de color y depositarlo sobre una cruz roja, adecuado para experimentos de robotica de imitacion con UR5e.
- Prototipado de pipelines VLA: sirve como referencia para validar el flujo completo de LeRobot (grabacion, entrenamiento, rollout) antes de escalar a tareas mas complejas.
- Investigacion en generalizacion de politicas: permite estudiar como un fine-tuning sobre 999 episodios afecta a la generalizacion del modelo base π₀.₅ a variaciones de color y posicion.
- Benchmark interno de infraestructura robotica: util para medir latencia y throughput de un VLA de 4.100 millones de parametros en hardware concreto.
- Docencia y formacion: ejemplo reproducible de fine-tuning de un modelo VLA con un dataset pequeno y bien documentado.
- Base para nuevos fine-tunings: punto de partida para adaptar la politica a otras tareas de manipulacion con el mismo robot y configuracion de camaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4.143 millones de parametros, en fp16 se requieren aproximadamente 8,3 GB solo para pesos, mas el coste de activaciones y buffers de vision.
- GPU recomendadas: no especificadas por el autor; por tamano, una GPU con al menos 16-24 GB de VRAM resulta razonable para fp16, y A100/H100 para entrenamiento o lotes mayores.
- Compatibilidad con GPU de consumo: no confirmada por el autor; tecnicamente plausible en RTX 4090 (24 GB) o superiores para inferencia en fp16, aunque no hay datos publicados.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion, `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un VLA de control robotico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_dr | 4.143.404.816 | no disponible | Pick-and-place UR5e | gemma | Hugging Face (24 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista | gemma | Hugging Face |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA generalista | no disponible | OpenPI |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible, ya que no se han publicado metricas de rendimiento para esta politica ni especificaciones completas de los modelos de referencia.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor no ha publicado tasas de exito ni resultados en robot real, por lo que el rendimiento es desconocido.
- Especializacion extrema: la politica esta entrenada unicamente para cuatro tareas de colocacion de cubos sobre una cruz roja; no generaliza a otras tareas sin nuevo fine-tuning.
- Dependencia de hardware concreto: asume un robot UR5e con mano equipada y una configuracion exacta de camaras (`top`, `wrist`, `empty_camera_0`); cualquier desviacion invalida la inferencia.
- Riesgo de sobreajuste al entorno de entrenamiento: con 999 episodios y 30.000 pasos, la generalizacion a nuevas posiciones, iluminacion o distractores no esta verificada.
- Licencia Gemma: impone condiciones de uso (terminos de uso de Gemma) que deben revisarse antes de cualquier explotacion comercial; no es una licencia permisiva tipo Apache o MIT.
- Idiomas no especificados: las instrucciones de tarea estan en ingles en los ejemplos; no hay evidencia de soporte multilingue.
- Riesgo de alucinacion en el sentido de acciones erroneas: como todo modelo de politica, puede generar trayectorias invalidas o inseguras sin mecanismo de salvaguarda documentado.
- Artefacto de investigacion: 24 descargas y 0 likes sugieren un uso limitado y sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_dr
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_dr
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_dr
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference

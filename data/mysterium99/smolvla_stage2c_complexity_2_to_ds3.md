# mysterium99/smolvla_stage2c_complexity_2_to_ds3

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots reales a partir de observaciones visuales y del estado de las articulaciones. Esta ficha concreta, `mysterium99/smolvla_stage2c_complexity_2_to_ds3`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `ds3`, orientado a una unica tarea de manipulacion robotica: introducir todo el hardware en un cubo. El modelo tiene 450.046.176 parametros (aproximadamente 450 M) y se distribuye en formato safetensors con un tamano de repositorio de 0,9 GB.

El modelo resuelve el problema de la politica de imitacion end-to-end para robotica: recibe tres imagenes de camara a 256x256 y un vector de estado de 6 dimensiones, y emite un vector de accion de 6 dimensiones a 30 FPS. Frente a modelos VLA de mayor tamano, SmolVLA apuesta por un diseno eficiente que puede ejecutarse en hardware de consumo, lo que lo hace relevante para laboratorios y desarrolladores que necesitan prototipar politicas roboticas sin acceso a grandes clusters de GPU.

Es importante subrayar que este repositorio no es el modelo base generico, sino un checkpoint especializado y muy acotado: 50 episodios, 85.293 frames y una unica tarea. Su utilidad practica esta limitada al robot `follow` con las camaras `gripper`, `newtop` y `newside`, y no se han publicado resultados de evaluacion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, basada en SmolVLA (paper arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica; las instrucciones de tarea son en ingles en el dataset) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action compacto que combina un codificador visual, un componente de lenguaje y un cabezal de acciones para producir comandos motores directamente a partir de observaciones. La model card no detalla la composicion interna exacta (numero de capas, dimension del transformer, tipo de atencion), por lo que esos datos se consideran no disponibles en esta ficha. El modelo base esta documentado en el paper arXiv:2506.01844, que describe el diseno orientado a eficiencia computacional y despliegue en hardware de consumo.

El fine-tuning se realizo con LeRobot 0.6.1 sobre el dataset `ds3`: 50 episodios, 85.293 frames a 30 FPS, para la tarea "Put all hardware in bucket". La configuracion de entrenamiento fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 0,0001 y semilla 0. Se trata de aprendizaje por imitacion supervisado (behavior cloning) sobre demostraciones, sin que la informacion disponible mencione RLHF, DPO ni fases de refuerzo.

Las entradas del modelo son `observation.state` con forma `(6,)` y tres imagenes (`observation.images.camera1`, `camera2`, `camera3`) de forma `(3, 256, 256)`; la salida es `action` con forma `(6,)`. El robot objetivo es de tipo `follow` con camaras `gripper`, `newtop` y `newside`.

## Capacidades

- Control robotico de manipulacion: genera acciones de 6 dimensiones a partir de imagenes y estado articular para la tarea entrenada.
- Percepcion visual multimodal: procesa tres flujos de camara simultaneos a 256x256.
- Politica de imitacion end-to-end: mapea observaciones directamente a acciones sin planificacion simbolica intermedia.
- Ejecucion en tiempo real: entrenado sobre datos a 30 FPS, pensado para control a esa frecuencia.
- Condicionamiento por instruccion de tarea: acepta un texto de tarea (`--task="Put all hardware in bucket"`).
- Despliegue en hardware de consumo: segun la model card del modelo base, esta disenado para ejecutarse en hardware asequible.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Clasificacion de piezas en linea de montaje: el modelo puede recoger hardware disperso y depositarlo en un contenedor, replicando la tarea `ds3`; es adecuado porque fue entrenado exactamente sobre esa dinamica con tres vistas.
- Prototipado rapido de politicas de imitacion: un equipo puede partir de este checkpoint para validar su pipeline LeRobot (grabacion, entrenamiento, rollout) antes de invertir en datasets mayores.
- Investigacion en aprendizaje por imitacion: sirve como linea base reproducible con hiperparametros documentados (20k pasos, AdamW, lr 1e-4) para comparar variantes de aumento de datos o arquitecturas.
- Demostraciones de robotica de bajo coste: al caber en hardware de consumo, permite montar demos en ferias o aulas con un robot `follow` y tres camaras.
- Fine-tuning sobre dominios similares: puede reentrenarse sobre nuevos datasets de pick-and-place con la misma configuracion de camaras y estado de 6 dimensiones.
- Evaluacion de robustez visual: util para estudiar como afectan cambios de iluminacion, posicion de objetos o distractores a una politica VLA compacta en una tarea acotada.
- Integracion en pipelines de LeRobot: se ejecuta con `lerobot-rollout` y se entrena con `lerobot-train`, lo que facilita su inclusion en flujos automatizados de experimentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parametros, en FP32 los pesos ocupan aproximadamente 1,8 GB y en FP16/BF16 unos 0,9 GB, a lo que hay que sumar activaciones de tres flujos visuales a 256x256.
- GPU recomendadas: no especificadas en la informacion disponible; la model card del modelo base afirma que puede desplegarse en hardware de consumo.
- Compatibilidad con GPU de consumo: probable segun el diseno del modelo base, aunque no se confirma una lista concreta de tarjetas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de politica robotica.
- Latencia y throughput: no disponibles; el entrenamiento usa datos a 30 FPS, pero no se publica latencia medida en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mysterium99/smolvla_stage2c_complexity_2_to_ds3` | 450 M | no disponible | Manipulacion pick-and-place (tarea unica) | apache-2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | no disponible en la informacion | no disponible | VLA base para fine-tuning robotico | no disponible en la informacion | Hugging Face (modelo base) |
| Otros VLA de gran escala (p. ej. familias tipo OpenVLA) | no disponible en la informacion | no disponible | Manipulacion generalista | no disponible en la informacion | no disponible en la informacion |

La comparacion cuantitativa con alternativas no puede completarse porque la informacion proporcionada no incluye especificaciones de modelos comparables ni resultados de rendimiento.

## Limitaciones y advertencias

- Especializacion extrema: entrenado para una unica tarea ("Put all hardware in bucket") y un unico robot `follow`; no generalizara a otras tareas sin fine-tuning.
- Dependencia de la configuracion de camaras: espera exactamente tres vistas (`gripper`, `newtop`, `newside`) a 256x256 y un estado de 6 dimensiones; cualquier desviacion invalida la inferencia.
- Sin evaluacion publicada: no hay tasas de exito en robot real, por lo que se desconoce su robustez ante cambios de iluminacion, posicion de objetos o distractores.
- Dataset pequeno: 50 episodios y 85.293 frames son una base limitada, con riesgo de sobreajuste al entorno de grabacion.
- Riesgo de alucinacion motora: como toda politica de imitacion, puede generar acciones incoherentes fuera de la distribucion de entrenamiento, con riesgo fisico para el robot o el entorno.
- Idiomas: no se documenta soporte multilingue; la instruccion de tarea del dataset esta en ingles.
- Licencia apache-2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de dependencias (LeRobot) y de los datos de entrenamiento.
- Sin garantias de produccion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en entornos reales.
- No apto para tareas de lenguaje general, codigo o matematicas: es una politica robotica, no un LLM conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2c_complexity_2_to_ds3
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset `ds3`: https://huggingface.co/datasets/ds3
- Guia LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ds3

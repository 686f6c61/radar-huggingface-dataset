# filesmuggler/pi05_cube_cup

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, concebido para generalizar a entornos y situaciones nuevos que no aparecieron durante el entrenamiento. El repositorio filesmuggler/pi05_cube_cup no contiene el modelo base, sino un fine-tune de una sola tarea derivado de lerobot/pi05_base y entrenado con la libreria LeRobot. La implementacion de LeRobot esta adaptada del repositorio OpenPI de Physical Intelligence.

La policy consume observaciones multimodales -dos imagenes de camara (`top` y `wrist`) a 480x640 y un vector de estado de 6 dimensiones- y devuelve un vector de accion de 6 dimensiones, es decir, control continuo de un brazo robotico tipo `so_follower`. Se ha entrenado exclusivamente sobre el dataset filesmuggler/experiment-cube-cup-100-l_diagonal-full, con 99 episodios y 29.432 fotogramas a 30 FPS para la tarea "Grab the cube and put it in the cup".

El modelo es relevante como ejemplo reproducible del flujo de trabajo completo de LeRobot (grabacion, entrenamiento y despliegue) y como punto de partida para experimentos de imitacion con π₀.₅. Su alcance es muy acotado: es una policy especializada, no un modelo de proposito general. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y no incluye resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); detalles internos no disponibles |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones), segun safetensors |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | no disponible (la tarea se pasa como cadena de texto, p. ej. en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Libreria | lerobot (version de entrenamiento 0.6.2) |
| Tipo de robot | so_follower |
| Camaras | top, wrist |
| Tamano del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

La model card describe el modelo como una policy Vision-Language-Action (VLA) de tipo π₀.₅, la evolucion de π₀ orientada a generalizacion en mundo abierto. La implementacion disponible en LeRobot procede del repositorio OpenPI. No se detallan en la informacion proporcionada la composicion exacta del backbone, el mecanismo de atencion ni la cabeza de acciones, por lo que esos aspectos quedan como "no disponible".

El entrenamiento es un fine-tune de imitacion supervisada sobre lerobot/pi05_base. La configuracion registrada es la siguiente: 20.000 pasos, tamano de lote 16, optimizador AdamW, tasa de aprendizaje 2,5e-05, semilla 1000 y LeRobot 0.6.2. El dataset de entrenamiento contiene 99 episodios, 29.432 fotogramas capturados a 30 FPS, con la unica tarea "Grab the cube and put it in the cup". Las entradas son `observation.state` (forma 6), `observation.images.top` (3x480x640) y `observation.images.wrist` (3x480x640); la salida es `action` (forma 6). No se documentan fases de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Control robótico de manipulacion: genera acciones continuas de 6 grados de libertad para un brazo `so_follower`.
- Condicionamiento por lenguaje: acepta una instruccion de tarea como texto (en el ejemplo, "Grab the cube and put it in the cup").
- Fusion multimodal: integra estado propioceptivo de 6 dimensiones con dos flujos visuales (camara cenital y camara de muneca) a 480x640.
- Imitacion de una tarea concreta: recoger un cubo y depositarlo en un vaso, tal como se define en el dataset de entrenamiento.
- Ejecucion en bucle cerrado a la frecuencia de control del robot (los datos se registraron a 30 FPS).
- No se documentan capacidades de generacion de texto general, razonamiento simbolico, codigo, matematicas, tool calling, function calling ni orquestacion de agentes multi-paso.
- No se documentan capacidades de vision mas alla de las dos camaras de entrada, ni de audio.
- Capacidades multilingues: no disponible.

## Casos de uso

- Automatizacion de pick-and-place "cubo en vaso": la policy recoge un cubo y lo introduce en un recipiente usando las vistas cenital y de muneca; es adecuada porque fue entrenada exactamente para esa tarea y ese tipo de brazo.
- Banco de pruebas de fine-tuning de π₀.₅: sirve para comparar hiperparametros (pasos, tasa de aprendizaje, tamano de lote) frente a lerobot/pi05_base en una tarea acotada y medible.
- Validacion del pipeline de LeRobot de extremo a extremo: permite verificar grabacion de dataset, entrenamiento y despliegue con `lerobot-rollout` sobre hardware `so_follower`.
- Base para nuevos fine-tunes de manipulacion: se puede reutilizar como punto de partida para tareas de agarre y colocacion con configuraciones de camaras similares.
- Recogida de datos asistida por policy: ejecutar la policy para generar trayectorias iniciales que luego se corrigen por teleoperacion, acelerando la creacion de nuevos datasets.
- Docencia e investigacion en aprendizaje por imitacion: caso reproducible y de bajo coste computacional para explicar el ciclo observacion-accion en VLA frente a un transformer de proposito general.
- Demostraciones de robotica en laboratorio: ejecucion de una tarea visible y verificable para presentar resultados de VLA en ferias o sesiones tecnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta policy ("No evaluation results have been provided for this policy yet"), por lo que no existe tabla de tasa de exito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 4.143.404.816 parametros, sin contar activaciones): ≈16,6 GB en fp32, ≈8,3 GB en bf16/fp16, ≈4,2 GB en int8 y ≈2,1 GB en int4. Son estimaciones teoricas de pesos; el consumo real es mayor por las activaciones de los dos flujos de imagen a 480x640 y el estado de la policy.
- GPU recomendadas: A100, H100 o similares para entrenamiento y despliegues de alta frecuencia; L40S, RTX 6000 Ada o RTX 4090 para inferencia en bf16.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y RTX 3090 (24 GB) con holgura en bf16; en tarjetas de 12-16 GB (RTX 4080, RTX 3060 12 GB) previsiblemente con cuantizacion o reduccion de lote, aunque no se documenta soporte de cuantizacion en el repositorio.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con la configuracion `--policy.path=filesmuggler/pi05_cube_cup`, sobre PyTorch y CUDA (`--policy.device=cuda`). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, ya que se trata de una policy con cabeza de acciones y no de un modelo de lenguaje servido por API.
- Latencia y throughput: no disponible. La referencia de frecuencia es 30 FPS en la captura del dataset, pero no se especifica la tasa de inferencia alcanzada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| filesmuggler/pi05_cube_cup (este) | 4,14 mil millones | no disponible | apache-2.0 | HuggingFace, 0 descargas | Fine-tune de una sola tarea (cubo en vaso) |
| lerobot/pi05_base | no disponible (arquitectura equivalente en teoria) | no disponible | no disponible en la informacion | HuggingFace | Modelo base de π₀.₅ en LeRobot; generalista, sin tarea concreta |
| π₀ (Physical Intelligence) | no disponible | no disponible | no disponible | OpenPI | Predecesor de π₀.₅; referencia de la familia VLA |
| Otras policies VLA de LeRobot | no disponible | no disponible | no disponible | HuggingFace | Alternativas de la misma categoria (p. ej. modelos tipo SmolVLA), datos no disponibles en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada; la comparacion se limita a categoria, licencia y disponibilidad.

## Limitaciones y advertencias

- Alcance muy restringido: la policy esta entrenada para una unica tarea y un unico montaje (robot `so_follower`, dos camaras concretas `top` y `wrist`). Fuera de ese contexto, el comportamiento no esta garantizado.
- Sin evaluacion publicada: no hay tasa de exito medida en robot real, por lo que no se puede afirmar su fiabilidad en produccion.
- Dependencia del dataset: solo 99 episodios y 29.432 fotogramas, recogidos en un entorno concreto ("l_diagonal"); previsiblemente sensible a cambios de posicion, iluminacion, fondo o distractores.
- Riesgo de sobreajuste y de fallo silencioso: al ser un fine-tune pequeno sobre una tarea fija, puede ejecutar acciones incorrectas sin senal de error explicita.
- Restricciones de licencia: el modelo se publica bajo apache-2.0, que permite uso comercial; conviene verificar la licencia del modelo base lerobot/pi05_base y de los datos de entrenamiento antes de un despliegue comercial.
- Requisitos de coincidencia de entradas: los nombres de camara deben coincidir con las claves de observacion usadas en el entrenamiento (`top`, `wrist`) para que las observaciones encajen con las esperadas.
- Idiomas: no disponible; la instruccion de tarea se proporciona como texto y en el ejemplo aparece en ingles.
- Trazabilidad: el modelo no incluye documentacion sobre sesgos, composicion demografica del dataset ni auditorias de seguridad.
- Estado del repositorio: 0 descargas y 0 likes en la fecha de consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/filesmuggler/pi05_cube_cup
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/filesmuggler/experiment-cube-cup-100-l_diagonal-full
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=filesmuggler/experiment-cube-cup-100-l_diagonal-full
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference

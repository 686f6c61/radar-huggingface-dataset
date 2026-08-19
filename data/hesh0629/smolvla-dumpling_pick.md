# hesh0629/smolvla-dumpling_pick

## Resumen

El modelo `hesh0629/smolvla-dumpling_pick` es un ajuste fino (fine-tune) de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto desarrollado por Hugging Face, orientado a tareas de manipulación robótica. Este checkpoint concreto ha sido entrenado sobre el dataset `hesh0629/dumpling_pick_fixed` para realizar la tarea de recoger dumplings (empanadillas) con un brazo robótico, utilizando el framework LeRobot para el entrenamiento y la evaluación.

SmolVLA está diseñado para ofrecer un rendimiento competitivo en tareas de robótica con un coste computacional reducido, lo que permite su despliegue en hardware de consumo. El modelo base cuenta con 450 millones de parámetros, una arquitectura compacta que combina un codificador de visión, un modelo de lenguaje y un experto de acción. Este fine-tune específico se distribuye bajo licencia Apache-2.0 y está pensado para ser utilizado con el ecosistema LeRobot, tanto para inferencia como para continuar el entrenamiento.

La relevancia de este modelo radica en su enfoque práctico: demuestra cómo un VLA ligero puede adaptarse a una tarea concreta de manipulación con un dataset relativamente pequeño, abriendo la puerta a la robótica de bajo coste y a la investigación reproducible en entornos domésticos o académicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basada en SmolLM2 + codificador de vision + experto de accion) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (instrucciones en ingles previsiblemente, pero no especificado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un codificador de vision (tipo SigLIP o similar, segun el paper original) con un modelo de lenguaje pequeno (SmolLM2) y un modulo de prediccion de acciones. La arquitectura esta disenada para procesar multiples vistas de camara, el estado sensorimotor del robot y una instruccion en lenguaje natural, generando como salida las acciones del robot (por ejemplo, posiciones del efector final). El modelo base fue preentrenado de forma generalista y este checkpoint ha sido ajustado con el dataset `dumpling_pick_fixed` mediante el framework LeRobot, que utiliza una metodologia de aprendizaje por imitacion (behavior cloning) con normalizacion de acciones y aumento de datos.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas como RLHF o DPO. El entrenamiento se realizo con la libreria LeRobot, que gestiona el pipeline completo de datos, entrenamiento y evaluacion. El modelo se publica como un checkpoint de LeRobot, listo para ser cargado con `policy.path` en las herramientas de inferencia de LeRobot.

## Capacidades

- Generacion de acciones roboticas: dado un conjunto de observaciones (imagenes de camara, estado del robot) y una instruccion en lenguaje natural, el modelo predice las acciones de control del robot (por ejemplo, posiciones articulares o cartesianas).
- Aprendizaje por imitacion: el modelo ha sido entrenado para replicar demostraciones humanas de la tarea de recoger dumplings, por lo que es capaz de ejecutar esa tarea especifica con cierta robustez.
- Soporte multi-vista: al igual que SmolVLA base, acepta multiples entradas de camara, lo que permite al robot percibir la escena desde distintos angulos.
- Integracion con LeRobot: el checkpoint se puede cargar directamente en el ecosistema LeRobot para inferencia, evaluacion o continuacion del entrenamiento.
- Capacidades de lenguaje: al ser un VLA, interpreta instrucciones en lenguaje natural, aunque el alcance multilingue no esta documentado.
- No se especifican capacidades de tool calling, agentes o razonamiento multi-paso fuera del ambito de la robotica.

## Casos de uso

- Manipulacion robotica en entornos de cocina: el modelo puede controlar un brazo robotico para recoger dumplings u objetos similares de una superficie, util en lineas de produccion alimentaria o en robots domesticos de asistencia.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar como un VLA compacto se adapta a tareas concretas con pocos datos, comparando con modelos mas grandes como OpenVLA.
- Prototipado rapido de politicas roboticas: gracias a su tamano reducido, se puede entrenar y evaluar en una GPU de consumo, acelerando el ciclo de iteracion en laboratorios academicos o startups.
- Evaluacion de generalizacion: al ser un fine-tune de un modelo base generalista, permite analizar hasta que punto el conocimiento previo de SmolVLA se transfiere a una tarea nueva y especifica.
- Educacion en robotica: el modelo y el dataset asociado pueden utilizarse en cursos de robotica o aprendizaje automatico para demostrar el flujo completo de entrenamiento de una politica con LeRobot.
- Despliegue en robots de bajo coste: combinado con hardware como el brazo SO-100 (mencionado en la documentacion de LeRobot), el modelo puede ejecutarse en tiempo real en un ordenador con GPU modesta, habilitando experimentos de robotica accesibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como tasa de exito en la tarea de recoger dumplings, ni comparaciones con otros modelos en el mismo dataset. El autor no ha incluido ninguna tabla de rendimiento en la model card.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado el tamano de 450M de parametros, una estimacion razonable para inferencia en FP32 seria de unos 2-3 GB de VRAM, y menos de 1 GB en cuantizacion de 8 bits, pero estos valores no estan confirmados por el autor.
- GPU recomendadas: al ser un modelo pequeno, deberia funcionar en GPUs consumer como RTX 3060, RTX 4060, RTX 4090, o incluso en Macs con Apple Silicon (via MPS). No se requiere una A100 o H100.
- Despliegue: el modelo esta integrado en LeRobot, por lo que se puede ejecutar con las herramientas de inferencia de LeRobot (`lerobot-record`). Tambien es posible exportarlo a otros formatos (ONNX, TensorRT) si se desea, aunque no esta documentado.
- Latencia y throughput: no disponibles. Al ser un modelo compacto, se espera una latencia baja (del orden de decenas de milisegundos por paso de control en una GPU moderna), pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este checkpoint especifico. Como referencia general, SmolVLA (450M) se posiciona como una alternativa ligera a modelos VLA mas grandes como OpenVLA (7B) o xVLA (7B), con un coste computacional mucho menor y la capacidad de ejecutarse en hardware de consumo. Sin embargo, no hay benchmarks publicos que comparen este fine-tune con otros modelos en la misma tarea. Se recomienda consultar el paper de SmolVLA (arxiv:2506.01844) para una comparativa del modelo base, no de este checkpoint.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo entrenado por imitacion, puede fallar en situaciones no vistas durante el entrenamiento (cambios de iluminacion, posiciones de objetos diferentes, etc.). No se ha evaluado su robustez frente a variaciones del entorno.
- Riesgo de sobreajuste: el dataset `dumpling_pick_fixed` es probablemente pequeno (no se especifica el numero de episodios), por lo que el modelo puede no generalizar bien a otras tareas o configuraciones.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero al ser un VLA, la entrada tipica son imagenes y texto corto, no documentos largos.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial y modificacion, pero se debe mantener la atribucion y no se ofrece garantia. Es compatible con proyectos propietarios.
- Dependencia del ecosistema LeRobot: el modelo esta empaquetado para LeRobot, por lo que su uso fuera de este framework requiere conversion manual de pesos y adaptacion del pipeline de inferencia.
- Sin soporte de vision general: aunque procesa imagenes, su salida es exclusivamente acciones roboticas; no es un modelo de vision generalista ni un chatbot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hesh0629/smolvla-dumpling_pick
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Blog de SmolVLA (Hugging Face): https://github.com/huggingface/blog/blob/main/smolvla.md
- Documentacion de LeRobot sobre SmolVLA: https://dctx-team.github.io/lerobot-zh/en/smolvla/
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Repositorio alternativo con ejemplos de SmolVLA: https://github.com/zyqdragon/lerobot_smolvla
- Dataset utilizado: https://huggingface.co/datasets/hesh0629/dumpling_pick_fixed
